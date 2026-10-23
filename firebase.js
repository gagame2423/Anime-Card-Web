/* Firebase compat integration: account binding, recoverable local migration,
   Cloud-first reconciliation and coalesced background saves. Private payloads
   never appear in public leaderboard documents. */
(function(host){
 'use strict';
 const CONFIG=Object.freeze({apiKey:'AIzaSyBmfGuGndLjYHNMNXchhtR0xAT0vH3tYzM',authDomain:'anime-card-web.firebaseapp.com',projectId:'anime-card-web',storageBucket:'anime-card-web.firebasestorage.app',messagingSenderId:'213612619343',appId:'1:213612619343:web:276b1ee7f432a0e37c2c3a',measurementId:'G-69PXX2Z7L3'});
 const META_KEY='anime_card_rng_cloud_meta_v1',RESTORE_KEY='anime_card_rng_cloud_restore_v1',BOOT_KEY='anime_card_rng_cloud_boot_v1',INTERVAL=60000,MAX_BYTES=16*1024*1024,CHUNK_CHARS=120000,MAIN_KEY='anime_card_rng_save_v1';
 const U=host.OnlineUtils,doc=host.document;
 let configured=false;
 let bridge={},auth=null,db=null,account=null,initializing=null,ready=false,blocking=false,busy=false,foreignTabChanged=false,waitingForActivity=false,capturing=false,dirty=0,timer=null,lastWrite=0,retryAt=0,retryDelay=5000,epoch=0,pendingRemote=null,status='Offline guest · progress saved on this device',recoveryBlocked=false,watch=null;
 const freshMeta=()=>({version:1,uid:null,revision:0,digest:'',dirty:false,displayName:''});
 let meta=freshMeta();try{const saved=JSON.parse(host.localStorage.getItem(META_KEY)||'null');if(saved?.version===1&&Number.isSafeInteger(saved.revision)&&saved.revision>=0&&(saved.uid===null||typeof saved.uid==='string')&&typeof saved.dirty==='boolean'&&typeof saved.digest==='string'&&typeof saved.displayName==='string')meta={...meta,...saved};}catch(_){}
 const el=id=>doc?.getElementById(id),isObject=v=>Boolean(v&&typeof v==='object'&&!Array.isArray(v));
 function saveMeta(){host.localStorage.setItem(META_KEY,JSON.stringify(meta));}
 function recoverRestore(){try{const p=JSON.parse(host.localStorage.getItem(RESTORE_KEY)||'null');if(!p)return true;if(p.version!==1||!isObject(p.previous)||Object.keys(p.previous).some(k=>!(k.startsWith('anime_card_rng_')||k==='animeCardRngSave_v1')))throw Error('Invalid local recovery record.');for(const [key,value]of Object.entries(p.previous)){if(value===null)host.localStorage.removeItem(key);else if(typeof value==='string')host.localStorage.setItem(key,value);else throw Error('Invalid recovery value.');}host.localStorage.removeItem(RESTORE_KEY);return true;}catch(_){recoveryBlocked=true;return false;}}
 // Runs before app.js and every gameplay store reads its data.
 const recovered=recoverRestore();if(!recovered)blocking=true;
 // A receipt is consumed once, before gameplay modules read the restored stores.
 // It only acknowledges an already-applied Cloud Save, never chooses local data.
 const receiptKeys=keys=>Array.isArray(keys)&&keys.length>0&&keys.length<=128&&new Set(keys).size===keys.length&&keys.every(key=>typeof key==='string'&&(key.startsWith('anime_card_rng_')||key==='animeCardRngSave_v1')&&![META_KEY,RESTORE_KEY,BOOT_KEY].includes(key));
 let handoff=null;
 try{
  const raw=host.sessionStorage.getItem(BOOT_KEY);host.sessionStorage.removeItem(BOOT_KEY);
  const receipt=JSON.parse(raw||'null');
  if(receipt?.version===1&&typeof receipt.uid==='string'&&Number.isSafeInteger(receipt.revision)&&receipt.revision>0&&/^[a-f0-9]{64}$/.test(receipt.digest)&&/^[a-f0-9]{64}$/.test(receipt.localHash)&&Number.isFinite(receipt.at)&&Math.abs(Date.now()-receipt.at)<300000&&receiptKeys(receipt.keys)){
   const records=Object.fromEntries(receipt.keys.map(key=>[key,host.localStorage.getItem(key)]));
   handoff={...receipt,fingerprint:U.hash(U.stable(records)).catch(()=>'')};blocking=true;
  }
 }catch(_){/* Missing session storage never changes a save or grants Cloud priority to local data. */}
 async function restoreReceipt(nextMeta,records){
  const keys=Object.keys(records);
  if(!nextMeta?.uid||!Number.isSafeInteger(nextMeta.revision)||nextMeta.revision<1||!/^[a-f0-9]{64}$/.test(nextMeta.digest)||!receiptKeys(keys)||Object.values(records).some(value=>value!==null&&typeof value!=='string'))throw Error('Invalid Cloud restore receipt.');
  return JSON.stringify({version:1,uid:nextMeta.uid,revision:nextMeta.revision,digest:nextMeta.digest,keys,localHash:await U.hash(U.stable(records)),at:Date.now()});
 }
 function update(message){if(message)status=message;U.text(el('cloudStatus'),status);U.text(el('cloudAccountName'),account?(account.isAnonymous?'Guest account':account.displayName||account.email||'Google account'):'Local guest');U.text(el('cloudUid'),account?'UID: '+account.uid:'Not signed in');
  U.text(el('cloudSyncIndicator'),busy||blocking?'Syncing':ready?(meta.dirty?'Pending sync':'Cloud saved'):'Offline');
  for(const id of ['cloudGoogleButton','cloudGuestButton','cloudLogoutButton','cloudSyncButton']){const node=el(id);if(node)node.disabled=busy||blocking||recoveryBlocked;}
  if(el('cloudLogoutButton'))el('cloudLogoutButton').hidden=!account;
  if(el('cloudDisplayName')&&doc.activeElement!==el('cloudDisplayName'))el('cloudDisplayName').value=meta.displayName||'';
  doc?.body?.classList.toggle('cloud-reconciling',blocking);bridge.onBlocking?.(blocking);
 }
 function setBlocking(value){blocking=value||recoveryBlocked;update();}
 function blockForRecovery(message){recoveryBlocked=true;setBlocking(true);update(message);bridge.open?.('cloudAccountModal');}
 function clearTimer(){if(timer!==null)host.clearTimeout(timer);timer=null;}
 function canSync(){return ready&&account&&!busy&&!blocking&&host.navigator.onLine!==false&&bridge.canSnapshot?.()===true&&!recoveryBlocked;}
 function schedule(delay){if(timer!==null)return;if(!ready||!account)return;timer=host.setTimeout(()=>{timer=null;void flush();},delay??Math.max(1500,INTERVAL-(Date.now()-lastWrite),retryAt-Date.now()));}
 function markDirty(){if(!configured||capturing||recoveryBlocked||foreignTabChanged)return;dirty++;const wasDirty=meta.dirty;meta.dirty=true;if(!wasDirty)try{saveMeta();}catch(_){}if(ready)schedule();}
 function friendly(error){const code=String(error?.code||'');if(code.includes('unauthorized-domain'))return 'Add this website domain to Firebase Authentication → Authorized domains.';if(code.includes('operation-not-allowed'))return 'Enable Google and Anonymous sign-in in Firebase Authentication.';if(code.includes('permission-denied'))return 'Cloud access denied. Publish the supplied Firestore rules for this project.';if(code.includes('popup-blocked'))return 'Popup blocked. Allow popups and click Sign in with Google again.';if(code.includes('popup-closed')||code.includes('cancelled-popup'))return 'Google sign-in cancelled. Your local progress is unchanged.';return error?.message||'Cloud unavailable; local progress is preserved.';}
 async function initialize(){
  if(auth)return auth;if(initializing)return initializing;
  initializing=(async()=>{await U.loadSdk('firebaseAppCdn',()=>Boolean(host.firebase?.initializeApp));await U.loadSdk('firebaseAuthCdn',()=>Boolean(host.firebase?.auth));await U.loadSdk('firebaseFirestoreCdn',()=>Boolean(host.firebase?.firestore));
   const app=host.firebase.apps?.find(a=>a.name==='anime-card-cloud')||host.firebase.initializeApp(CONFIG,'anime-card-cloud');auth=app.auth();db=app.firestore();
   await auth.setPersistence(host.firebase.auth.Auth.Persistence.LOCAL);
   auth.onAuthStateChanged(user=>{void reconcile(user);},error=>{handoff=null;ready=false;setBlocking(false);update(friendly(error));});return auth;
  })();try{return await initializing;}catch(error){auth=null;db=null;handoff=null;setBlocking(false);update(friendly(error));throw error;}finally{initializing=null;}
 }
 async function capture(){capturing=true;try{return await bridge.capture();}finally{capturing=false;}}
 async function readRemote(uid){const snap=await U.timeout(db.collection('users').doc(uid).get({source:'server'}));return snap.exists?snap.data():null;}
 function validRemote(remote){return remote?.format==='anime-card-cloud-v1'&&Number.isSafeInteger(remote.revision)&&remote.revision>=1&&typeof remote.digest==='string'&&/^[a-f0-9]{64}$/.test(remote.digest)&&((typeof remote.payload==='string'&&remote.payload.length>0&&U.bytes(remote.payload).length<=MAX_BYTES)||(remote.manifest&&/^[a-f0-9]{32}$/.test(remote.manifest.snapshotId)&&Number.isSafeInteger(remote.manifest.chunks)&&remote.manifest.chunks>0&&remote.manifest.chunks<=200));}
 async function remotePayload(uid,remote){
  if(!validRemote(remote))throw Error('Cloud save is invalid. Local progress was not changed.');let payload=remote.payload;
  if(remote.manifest){const chunks=await U.timeout(db.collection('users').doc(uid).collection('snapshots').doc(remote.manifest.snapshotId).collection('chunks').orderBy('index','asc').get());const rows=chunks.docs.map(d=>d.data());if(rows.length!==remote.manifest.chunks||rows.some((row,i)=>row.index!==i||typeof row.text!=='string'||row.text.length>CHUNK_CHARS))throw Error('Cloud save is incomplete. Local progress was not changed.');payload=rows.map(row=>row.text).join('');}
  if(U.bytes(payload).length>MAX_BYTES||await U.hash(payload)!==remote.digest)throw Error('Cloud save integrity check failed. Local progress was not changed.');await bridge.validate(payload);return payload;
 }
 async function backupLocal(payload){
  // IndexedDB avoids doubling the already-large localStorage save. A backup is
  // mandatory before switching profiles; failure stops restoration safely.
  if(!host.indexedDB)throw Error('Local recovery storage is unavailable. Your current save has not been replaced.');
  await new Promise((resolve,reject)=>{const request=host.indexedDB.open('anime_card_rng_cloud_recovery',1);request.onupgradeneeded=()=>request.result.createObjectStore('backups');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const database=request.result,tx=database.transaction('backups','readwrite');tx.objectStore('backups').put({payload,uid:meta.uid,at:Date.now()},'before-cloud-restore');tx.oncomplete=()=>{database.close();resolve();};tx.onerror=tx.onabort=()=>{database.close();reject(tx.error||Error('Unable to preserve local backup.'));};};});
 }
 function current(ticket,uid){return ticket===epoch&&account?.uid===uid&&auth?.currentUser?.uid===uid;}
 async function useRemote(remote,payload,ticket){
  const uid=account?.uid;
  if(!uid||!current(ticket,uid))return;
  const local=await capture();if(!current(ticket,uid))return;
  await backupLocal(local.payload);if(!current(ticket,uid))return;
  const nextMeta={...meta,uid,revision:remote.revision,digest:remote.digest,dirty:false};
  await bridge.apply(payload,{meta:nextMeta,cloudFirst:true});meta=nextMeta;
 }
 async function reconcile(user){
  foreignTabChanged=false;
  waitingForActivity=false;const ticket=++epoch;clearTimer();watch?.();watch=null;pendingRemote=null;ready=false;account=user||null;
  if(!user){handoff=null;setBlocking(false);update('Offline guest · progress saved on this device');return;}
  setBlocking(true);update('Loading this account’s Cloud Save…');
  try{
   if(bridge.canRestore?.()!==true){handoff=null;waitingForActivity=true;setBlocking(false);update('Cloud Save will restore automatically when the current activity ends.');return;}
   const remote=await readRemote(user.uid);if(!current(ticket,user.uid))return;
   if(!remote){
    // A truly empty account is the only login path allowed to migrate local progress.
    handoff=null;meta={...meta,uid:user.uid,revision:0,digest:'',dirty:true};saveMeta();setBlocking(false);ready=true;dirty++;await flush(true);return;
   }
   const payload=await remotePayload(user.uid,remote);if(!current(ticket,user.uid))return;
   const receipt=handoff;handoff=null;
   if(receipt&&receipt.uid===user.uid&&receipt.revision===remote.revision&&receipt.digest===remote.digest&&await receipt.fingerprint===receipt.localHash){
    if(!current(ticket,user.uid))return;
    // The previous document already wrote this exact server payload before reloading.
    meta={...meta,uid:user.uid,revision:remote.revision,digest:remote.digest,dirty:false};saveMeta();dirty=0;lastWrite=Date.now();ready=true;setBlocking(false);update('Cloud Save loaded · autosync connected');listen(user.uid);return;
   }
   // Existing Cloud always wins, including dirty local saves and another account’s local copy.
   await useRemote(remote,payload,ticket);
  }catch(error){if(ticket!==epoch)return;handoff=null;ready=false;setBlocking(false);update(friendly(error));}
 }
 function afterActivity(){if(!waitingForActivity||!account||bridge.canRestore?.()!==true)return;waitingForActivity=false;queueMicrotask(()=>void reconcile(account));}
 async function stage(uid,payload){if(U.bytes(payload).length<=600000)return{payload,manifest:null};const snapshotId=U.token(),parts=[];for(let i=0;i<payload.length;i+=CHUNK_CHARS)parts.push(payload.slice(i,i+CHUNK_CHARS));if(parts.length>200)throw Error('Cloud save is too large.');const batch=db.batch();for(let i=0;i<parts.length;i++)batch.set(db.collection('users').doc(uid).collection('snapshots').doc(snapshotId).collection('chunks').doc(String(i).padStart(3,'0')),{index:i,text:parts[i]});await batch.commit();return{payload:null,manifest:{snapshotId,chunks:parts.length}};}
 async function deleteSnapshot(uid,id){
  if(!id)return;try{const chunks=await db.collection('users').doc(uid).collection('snapshots').doc(id).collection('chunks').get();if(!chunks.docs.length)return;const batch=db.batch();for(const row of chunks.docs)batch.delete(row.ref);await batch.commit();}catch(_){/* Cleanup never changes the committed save. */}
 }
 async function publish(local,expected){
  const uid=account?.uid,ticket=epoch,digest=await U.hash(local.payload);if(!uid||ticket!==epoch)throw Error('Account changed before saving.');if(U.bytes(local.payload).length>MAX_BYTES)throw Error('Cloud save exceeds 16 MiB. Local save is preserved.');
  const body=await stage(uid,local.payload),ref=db.collection('users').doc(uid),name=((meta.displayName||account.displayName||'').trim()||(account.isAnonymous?'Guest':'Player')+' '+uid.slice(0,5)).slice(0,40);
  let result;try{result=await db.runTransaction(async tx=>{const latest=await tx.get(ref),previousBackup=await tx.get(ref.collection('recovery').doc('previous')),previous=latest.exists?latest.data():null;if((previous?.revision||0)!==expected)throw U.error('Newer Cloud Save detected. Restoring Cloud Save automatically.','cloud/conflict');if(ticket!==epoch||auth.currentUser?.uid!==uid)throw Error('Account changed before commit.');
   const revision=expected+1,summary={...local.summary,displayName:name};
   const next={format:'anime-card-cloud-v1',revision,digest,payload:body.payload,manifest:body.manifest,summary,updatedAt:host.firebase.firestore.FieldValue.serverTimestamp()};
   if(previous)tx.set(ref.collection('recovery').doc('previous'),previous);
   tx.set(ref,next);tx.set(db.collection('leaderboards').doc(uid),{uid,displayName:name,totalRolls:summary.totalRolls,strongestPower:summary.strongestPower,timeTrialRoom:summary.timeTrialRoom,uniqueCards:summary.uniqueCards,revision,updatedAt:host.firebase.firestore.FieldValue.serverTimestamp()});return{revision,digest,obsolete:previousBackup.exists?previousBackup.data()?.manifest?.snapshotId:null};
  });}catch(error){if(body.manifest)void deleteSnapshot(uid,body.manifest.snapshotId);throw error;}
  if(result.obsolete&&result.obsolete!==body.manifest?.snapshotId)void deleteSnapshot(uid,result.obsolete);
  return result;
 }
 async function flush(force=false){
  if(!canSync()){if(ready&&meta.dirty)schedule(10000);return false;}
  if(!meta.dirty&&!force)return true;busy=true;clearTimer();update('Saving cloud progress…');const generation=dirty,ticket=epoch,uid=account.uid;let pullCloud=false;
  try{
   const local=await capture();if(!current(ticket,uid))return false;const result=await publish(local,meta.revision);if(!current(ticket,uid))return false;
   meta={...meta,uid,revision:result.revision,digest:result.digest,dirty:dirty!==generation};saveMeta();lastWrite=Date.now();retryAt=0;retryDelay=5000;update(meta.dirty?'Progress saved · newer changes queued':'Cloud saved · offline copy kept');listen(uid);return true;
  }catch(error){
   if(ticket!==epoch)return false;
   if(error.code==='cloud/conflict'){pullCloud=true;ready=false;clearTimer();update('Loading newer Cloud Save automatically…');}
   else{retryAt=Date.now()+retryDelay;retryDelay=Math.min(120000,retryDelay*2);update(friendly(error));}return false;
  }finally{
   busy=false;
   if(current(ticket,uid)&&(pullCloud||pendingRemote?.uid===uid&&pendingRemote.revision>meta.revision)){pendingRemote=null;await reconcile(account);}
   else{update();if(meta.dirty&&ready)schedule();}
  }
 }
 function listen(uid){if(watch)return;watch=db.collection('users').doc(uid).onSnapshot(snapshot=>{
  if(account?.uid!==uid||!snapshot.exists||snapshot.metadata?.hasPendingWrites||snapshot.metadata?.fromCache)return;
  const remote=snapshot.data();if(!ready||remote.revision<=meta.revision)return;
  if(busy){if(!pendingRemote||pendingRemote.revision<remote.revision)pendingRemote={uid,revision:remote.revision};return;}
  ready=false;clearTimer();void reconcile(account);
 },error=>update(friendly(error)));}
 async function google(){if(busy||blocking)return;try{const sdk=await initialize(),provider=new host.firebase.auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});if(sdk.currentUser?.isAnonymous){try{const result=await sdk.currentUser.linkWithPopup(provider);await reconcile(result.user);return;}catch(error){if(error.code!=='auth/credential-already-in-use')throw error;if(error.credential){await sdk.signInWithCredential(error.credential);return;}}}
   await sdk.signInWithPopup(provider);
  }catch(error){update(friendly(error));}}
 async function guest(){try{const sdk=await initialize();if(sdk.currentUser){await reconcile(sdk.currentUser);return;}await sdk.signInAnonymously();}catch(error){setBlocking(false);update('Offline guest · '+friendly(error));}}
 async function logout(){if(busy)return;clearTimer();watch?.();watch=null;epoch++;ready=false;handoff=null;pendingRemote=null;setBlocking(false);try{await auth?.signOut();account=null;update('Signed out · local copy kept for recovery.');}catch(error){update(friendly(error));}}
 async function retry(){try{await initialize();if(auth.currentUser&&!ready){await reconcile(auth.currentUser);}else await flush(true);}catch(error){update(friendly(error));}}
 async function leaderboard(metric='totalRolls'){await initialize();if(!['totalRolls','strongestPower','timeTrialRoom'].includes(metric))throw Error('Unknown leaderboard.');const result=await U.timeout(db.collection('leaderboards').orderBy(metric,'desc').limit(50).get({source:'server'}));return result.docs.map(d=>d.data());}
 async function restoreBackup(){if(busy||blocking||bridge.canSnapshot?.()!==true)return;try{const record=await new Promise((resolve,reject)=>{const request=host.indexedDB.open('anime_card_rng_cloud_recovery',1);request.onupgradeneeded=()=>request.result.createObjectStore('backups');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const db=request.result,tx=db.transaction('backups','readonly'),get=tx.objectStore('backups').get('before-cloud-restore');get.onsuccess=()=>resolve(get.result);get.onerror=()=>reject(get.error);tx.oncomplete=()=>db.close();};});if(!record?.payload)throw Error('No local recovery backup is available.');await bridge.validate(record.payload);await logout();const nextMeta={...meta,uid:record.uid||null,revision:0,digest:'',dirty:true};await bridge.apply(record.payload,{meta:nextMeta,recovery:true});meta=nextMeta;}catch(error){update(friendly(error));}}
 function mount(){el('cloudLoginOpenButton')?.addEventListener('click',()=>{bridge.open?.('cloudAccountModal');update();});el('cloudGoogleButton')?.addEventListener('click',google);el('cloudGuestButton')?.addEventListener('click',guest);el('cloudLogoutButton')?.addEventListener('click',logout);el('cloudSyncButton')?.addEventListener('click',retry);el('cloudRestoreBackup')?.addEventListener('click',restoreBackup);el('cloudReloadButton')?.addEventListener('click',()=>host.location.reload());el('cloudDisplayName')?.addEventListener('change',event=>{meta.displayName=event.target.value.trim().slice(0,40);markDirty();});update();}
 host.addEventListener('online',()=>{if(account)void retry();});
 // Do not start an upload while refreshing/leaving: the next login must read
 // Cloud first instead of racing an unload-time write of unsynced local data.
 host.addEventListener('storage',event=>{if(event.key===META_KEY){try{const other=JSON.parse(event.newValue||'null');if(other&&(other.uid!==meta.uid||other.revision!==meta.revision||other.digest!==meta.digest)){foreignTabChanged=true;ready=false;clearTimer();update('Another browser tab changed this save. Reload before syncing.');}}catch(_){}}});
 host.CloudSaveSystem=Object.freeze({CONFIG,META_KEY,RESTORE_KEY,BOOT_KEY,recovered,restoreReceipt,markDirty,blockForRecovery,afterActivity,initialize,retry,flush,google,guest,logout,leaderboard,restoreBackup,get publicName(){return (meta.displayName||account?.displayName||'Player').trim().slice(0,40);},get activeUser(){return account;},get recoveryBlocked(){return recoveryBlocked;},get blocking(){return blocking||recoveryBlocked;},get status(){return status;},get ready(){return ready;},configure(options){bridge=options||{};configured=true;mount();if(recoveryBlocked)update('Unable to recover a cloud restore. Reload before playing.');else void initialize().catch(()=>{});}});
})(window);
