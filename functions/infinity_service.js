/* Server-owned UTC finalization and exactly-once mailbox delivery. */
'use strict';
const crypto=require('node:crypto'),R=require('./infinity_rules'),codec=require('./save_codec');
const MAX=Number.MAX_SAFE_INTEGER,CHUNK=120000;
module.exports=function createService({db,stamp,now=Date.now}){
 const weeks=db.collection('infinity_weeks'),mailbox=uid=>db.collection('infinity_mailboxes').doc(uid).collection('rewards');
 const ranking=ref=>ref.collection('entries').orderBy('highestWave','desc').orderBy('reachedAt','asc').orderBy('uid','asc');
 function publicWeek(v){return Object.fromEntries(['id','year','week','startMs','endMs','seed','category','element'].map(key=>[key,v[key]]));}
 async function ensureWeek(){const week=R.rotation(now()),ref=weeks.doc(week.id);return db.runTransaction(async tx=>{const saved=await tx.get(ref);if(saved.exists)return publicWeek(saved.data());tx.create(ref,{...week,finalized:false,createdAt:stamp()});return week;});}
 async function score(uid,input){
  const current=R.rotation(now()),value=input.highestWave;
  if(input.weekId!==current.id||!Number.isSafeInteger(value)||value<1||value>Math.floor(MAX/100))throw Error('Invalid wave or expired UTC week.');
  const ref=weeks.doc(current.id),entry=ref.collection('entries').doc(uid),user=db.collection('users').doc(uid);
  return db.runTransaction(async tx=>{
   const [weekSnap,previous,userSnap]=await Promise.all([tx.get(ref),tx.get(entry),tx.get(user)]),week=weekSnap.exists?weekSnap.data():{...current,finalized:false};
   if(!userSnap.exists)throw Error('Sync Cloud Save before submitting Infinity progress.');
   const saved=codec.decode(await readPayload(tx,user,userSnap.data())),savedBest=saved.storage.anime_card_rng_infinity_v1?.best?.[current.id];
   if(!Number.isSafeInteger(savedBest)||value>savedBest)throw Error('Sync the cleared wave to Cloud Save before submitting.');
   if(week.finalized||now()>=week.endMs||R.getISOWeek(now()).id!==current.id||input.category!==week.category)throw Error('Weekly rotation changed. Start a new run.');
   const highest=Math.max(value,previous.exists?previous.data().highestWave:0);
   if(!weekSnap.exists)tx.create(ref,{...week,createdAt:stamp()});
   if(!previous.exists||value>previous.data().highestWave)tx.set(entry,{uid,displayName:(String(input.displayName||'Player').trim()||'Player').slice(0,40),highestWave:highest,reachedAt:stamp()});
   return{highestWave:highest,week:publicWeek(week)};
  });
 }
 async function finalizeWeek(ref){
  return db.runTransaction(async tx=>{
   const snapshot=await tx.get(ref);if(!snapshot.exists)return false;const week=snapshot.data();if(week.finalized||week.endMs>now())return false;
   const leaders=await tx.get(ranking(ref).limit(1)),winner=leaders.docs[0]?.data(),reward=winner?winner.highestWave*100:0;
   if(!Number.isSafeInteger(reward)||reward<0)throw Error('Invalid weekly reward.');
   const rewardRef=winner?mailbox(winner.uid).doc(week.id):null,existing=rewardRef?await tx.get(rewardRef):null;
   if(rewardRef&&!existing.exists)tx.create(rewardRef,{weekId:week.id,highestWave:winner.highestWave,amount:reward,claimed:false,createdAt:stamp()});
   tx.update(ref,{finalized:true,finalizedAt:stamp(),winnerUid:winner?.uid||null,highestWave:winner?.highestWave||0,reward});return true;
  });
 }
 async function finalizeDueWeeks(){
  for(;;){const due=await weeks.where('finalized','==',false).where('endMs','<=',now()).orderBy('endMs','asc').limit(25).get();if(!due.docs.length)return;for(const doc of due.docs)await finalizeWeek(doc.ref);if(due.docs.length<25)return;}
 }
 async function readPayload(tx,ref,save){
  if(save.format!=='anime-card-cloud-v1'||!Number.isSafeInteger(save.revision)||save.revision<1)throw Error('Invalid Cloud Save document.');
  let payload=save.payload;
  if(save.manifest){const rows=await tx.get(ref.collection('snapshots').doc(save.manifest.snapshotId).collection('chunks').orderBy('index','asc'));if(rows.docs.length!==save.manifest.chunks)throw Error('Incomplete Cloud Save.');const chunks=rows.docs.map(d=>d.data());if(chunks.some((v,i)=>v.index!==i||typeof v.text!=='string'||v.text.length>CHUNK))throw Error('Invalid Cloud chunks.');payload=chunks.map(v=>v.text).join('');}
  if(codec.digest(payload)!==save.digest)throw Error('Cloud digest mismatch.');return payload;
 }
 async function claim(uid){
  const ref=db.collection('users').doc(uid);
  return db.runTransaction(async tx=>{
   const [rewards,user]=await Promise.all([tx.get(mailbox(uid).where('claimed','==',false).limit(50)),tx.get(ref)]);
   if(!rewards.docs.length||!user.exists)return{claimedOrbs:0};
   const previous=user.data(),payload=await readPayload(tx,ref,previous),bundle=codec.decode(payload),amount=rewards.docs.reduce((sum,d)=>sum+d.data().amount,0);
   if(!Number.isSafeInteger(amount)||amount<1)throw Error('Invalid mailbox amount.');
   const nextPayload=codec.encode(codec.addOrbs(bundle,amount)),digest=codec.digest(nextPayload),revision=previous.revision+1;
   if(!Number.isSafeInteger(revision))throw Error('Cloud revision limit reached.');
   let body={payload:nextPayload,manifest:null};
   if(Buffer.byteLength(nextPayload)>600000){const snapshotId=crypto.randomBytes(16).toString('hex'),parts=[];for(let i=0;i<nextPayload.length;i+=CHUNK)parts.push(nextPayload.slice(i,i+CHUNK));if(parts.length>200)throw Error('Cloud Save is too large.');parts.forEach((text,index)=>tx.create(ref.collection('snapshots').doc(snapshotId).collection('chunks').doc(String(index).padStart(3,'0')),{index,text}));body={payload:null,manifest:{snapshotId,chunks:parts.length}};}
   tx.set(ref.collection('recovery').doc('previous'),previous);
   tx.set(ref,{...previous,...body,digest,revision,updatedAt:stamp()});
   tx.set(db.collection('leaderboards').doc(uid),{uid,...previous.summary,revision,updatedAt:stamp()});
   for(const reward of rewards.docs)tx.update(reward.ref,{claimed:true,claimedAt:stamp(),cloudRevision:revision});
   return{claimedOrbs:amount};
  });
 }
 async function board(){const week=await ensureWeek(),rows=await ranking(weeks.doc(week.id)).limit(50).get();return{week,rows:rows.docs.map(d=>({uid:d.data().uid,displayName:d.data().displayName,highestWave:d.data().highestWave}))};}
 async function bootstrap(uid){await finalizeDueWeeks();const delivery=await claim(uid);return{...delivery,week:await ensureWeek()};}
 return{score,board,bootstrap,claim,finalizeWeek,finalizeDueWeeks,ensureWeek};
};
