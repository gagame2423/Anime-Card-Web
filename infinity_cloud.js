/* Bảng tuần dùng trực tiếp Firestore Client SDK; không gọi API bên ngoài. */
(function(host){
 'use strict';
 const MAX_WAVE=Math.floor(Number.MAX_SAFE_INTEGER/100),U=host.OnlineUtils;
 function session(){const cloud=host.CloudSaveSystem,user=cloud?.activeUser,db=cloud?.firestore;if(!cloud?.playAllowed||!user||!db)throw Error('Google sign-in is required.');return{cloud,user,db};}
 async function submit(input){
  const {cloud,user,db}=session(),week=host.InfinityRules.rotation();
  if(input.weekId!==week.id||input.category!==week.category||!Number.isSafeInteger(input.highestWave)||input.highestWave<1||input.highestWave>MAX_WAVE)throw Error('Invalid wave or expired UTC week.');
  const ref=db.collection('infinity_leaderboards').doc(week.id);
  const highestWave=await U.timeout(db.runTransaction(async tx=>{
   const snapshot=await tx.get(ref),previous=snapshot.exists?snapshot.data()[user.uid]:null;
   if(!cloud.playAllowed||cloud.activeUser?.uid!==user.uid||host.InfinityRules.rotation().id!==week.id)throw Error('Session or UTC week changed.');
   const highest=Math.max(input.highestWave,Number.isSafeInteger(previous?.highestWave)?previous.highestWave:0);
   if(highest>MAX_WAVE)throw Error('Invalid saved weekly score.');
   if(previous&&highest===previous.highestWave)return highest;
   tx.set(ref,{[user.uid]:{displayName:(cloud.publicName||'Player').slice(0,40),highestWave:highest,updatedAt:host.firebase.firestore.FieldValue.serverTimestamp()}},{merge:true});return highest;
  }),20000,'Weekly score could not sync. Please retry.');
  return{week,highestWave};
 }
 async function board(){
  const {cloud,user,db}=session(),week=host.InfinityRules.rotation();
  const snapshot=await U.timeout(db.collection('infinity_leaderboards').doc(week.id).get({source:'server'}));
  if(!cloud.playAllowed||cloud.activeUser?.uid!==user.uid)throw Error('Google session changed.');
  const millis=value=>typeof value?.toMillis==='function'?value.toMillis():Number(value?.seconds||0)*1000;
  const rows=Object.entries(snapshot.exists?snapshot.data():{}).filter(([,v])=>v&&typeof v.displayName==='string'&&Number.isSafeInteger(v.highestWave)&&v.highestWave>0&&v.highestWave<=MAX_WAVE).map(([uid,row])=>({...row,uid}));
  rows.sort((a,b)=>b.highestWave-a.highestWave||millis(a.updatedAt)-millis(b.updatedAt)||a.uid.localeCompare(b.uid));
  return{week,rows:rows.slice(0,50)};
 }
 host.InfinityCloudSystem=Object.freeze({submit,board,now:()=>Date.now(),get status(){return{available:Boolean(host.CloudSaveSystem?.playAllowed),message:'Client-side weekly rotation · Firestore sync.',week:host.InfinityRules.rotation()};}});
})(window);
