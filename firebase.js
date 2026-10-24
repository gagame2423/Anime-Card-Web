/* Firebase compat integration: account binding, recoverable local migration,
   Cloud-first reconciliation and coalesced background saves. Private payloads
   never appear in public leaderboard documents. */
(function(host){
 'use strict';
 const CONFIG=Object.freeze({apiKey:'AIzaSyBmfGuGndLjYHNMNXchhtR0xAT0vH3tYzM',authDomain:'anime-card-web.firebaseapp.com',projectId:'anime-card-web',storageBucket:'anime-card-web.firebasestorage.app',messagingSenderId:'213612619343',appId:'1:213612619343:web:276b1ee7f432a0e37c2c3a',measurementId:'G-69PXX2Z7L3'});
 const META_KEY='anime_card_rng_cloud_meta_v1',RESTORE_KEY='anime_card_rng_cloud_restore_v1',BOOT_KEY='anime_card_rng_cloud_boot_v1',LOGOUT_KEY='anime_card_rng_logout_intent_v1',INTERVAL=60000,MAX_BYTES=16*1024*1024,CHUNK_CHARS=120000,MAIN_KEY='anime_card_rng_save_v1';
 const U=host.OnlineUtils,doc=host.document;
 let configured=false,googleVerified=false,sessionReady=false,verifying=false,popupBusy=false,sdkReady=false,loadingCloud=false,endingSession=false,identityCycle=0,identityJob=null,identityTarget=null,tokenExpiry=0,tokenTimer=null;
 function playAllowed(){return sessionReady&&googleVerified&&!blocking&&!recoveryBlocked&&!endingSession&&host.navigator.onLine!==false&&Date.now()<tokenExpiry&&account?.uid===auth?.currentUser?.uid&&!host.GameStartup?.failed;}
 function hasGoogle(user){return Boolean(user&&!user.isAnonymous&&Array.isArray(user.providerData)&&user.providerData.some(provider=>provider.providerId==='google.com'));}
 function clearTokenTimer(){if(tokenTimer!==null)host.clearTimeout(tokenTimer);tokenTimer=null;}
 function suspendSession(message){const wasActive=sessionReady;identityCycle++;epoch++;identityJob=null;identityTarget=null;verifying=false;loadingCloud=false;sessionReady=false;ready=false;googleVerified=false;blocking=true;tokenExpiry=0;clearTokenTimer();clearTimer();watch?.();watch=null;handoff=null;if(wasActive)bridge.onSessionEnd?.();update(message);}
 async function checkToken(user,cycle){
  if(!hasGoogle(user)||typeof user.getIdTokenResult!=='function')throw Error('Sign in with Google to play. Guest accounts are not supported.');
  const token=await U.timeout(user.getIdTokenResult(),15000,'Could not verify Google authentication. Please sign in again.');
  if(cycle!==identityCycle||auth?.currentUser?.uid!==user.uid)return false;
  if((token.signInProvider||token.claims?.firebase?.sign_in_provider)!=='google.com')throw Error('Please authenticate using Sign in with Google.');
  const expires=Date.parse(token.expirationTime);if(!Number.isFinite(expires)||expires<=Date.now())throw Error('Google authentication expired. Please sign in again.');
  tokenExpiry=expires;clearTokenTimer();tokenTimer=host.setTimeout(()=>{suspendSession('Google authentication expired. Please sign in again.');},Math.min(2147483647,Math.max(0,expires-Date.now())));return true;
 }
 async function observeUser(user){
  const target=user?.uid||null;if(identityJob&&identityTarget===target)return identityJob;
  const cycle=++identityCycle,wasActive=sessionReady,previous=account?.uid;identityTarget=target;
  sessionReady=false;ready=false;googleVerified=false;blocking=true;account=user||null;clearTimer();clearTokenTimer();watch?.();watch=null;epoch++;
  if(wasActive)bridge.onSessionEnd?.();
  if(!user){handoff=null;verifying=false;if(previous&&!endingSession&&configured){endingSession=true;update('Signed out. Clearing this device session…');try{await clearLocalSession();host.location.reload();}catch(error){endingSession=false;update(friendly(error));}}else update('Sign in with Google to play.');return;}
  if(endingSession)return;
  if(!hasGoogle(user)){handoff=null;verifying=false;update('Google sign-in is required. Guest accounts cannot enter the game.');return;}
  if(host.navigator.onLine===false){handoff=null;update('Internet connection required. Connect and sign in with Google.');return;}
  verifying=true;update('Verifying your Google account…');
  const job=(async()=>{try{
   if(!await checkToken(user,cycle))return;googleVerified=true;
   // Read the server before gameplay modules can normalize any local stores.
   const loginRemote=await readRemote(user.uid);if(cycle!==identityCycle||auth.currentUser?.uid!==user.uid)return;
   await host.GameStartup.loadGame();if(cycle!==identityCycle||auth.currentUser?.uid!==user.uid)return;
   if(!configured)throw Error('Game could not initialize. Reload the complete update.');
   await reconcile(user,loginRemote);
  }catch(error){if(cycle===identityCycle){sessionReady=false;googleVerified=false;blocking=true;ready=false;handoff=null;update(friendly(error));}}
  finally{if(cycle===identityCycle){verifying=false;update();}}})();
  identityJob=job;try{await job;}finally{if(identityJob===job){identityJob=null;identityTarget=null;}}
 }

 let bridge={},auth=null,db=null,account=null,initializing=null,ready=false,blocking=true,busy=false,foreignTabChanged=false,waitingForActivity=false,capturing=false,dirty=0,timer=null,lastWrite=0,retryAt=0,retryDelay=5000,epoch=0,pendingRemote=null,status='Sign in with Google to play.',recoveryBlocked=false,watch=null;
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
 function update(message){if(message)status=message;U.text(el('cloudStatus'),status);U.text(el('cloudAccountName'),hasGoogle(account)?account.displayName||account.email||'Google account':'Google sign-in required');U.text(el('cloudUid'),account?'UID: '+account.uid:'Not signed in');
  U.text(el('cloudSyncIndicator'),loadingCloud||busy?'Syncing':playAllowed()?(meta.dirty?'Pending sync':'Cloud saved'):'Login required');
  for(const id of ['cloudGoogleButton','cloudSyncButton']){const node=el(id);if(node)node.disabled=busy||loadingCloud||popupBusy||verifying||recoveryBlocked;}
  if(el('cloudLogoutButton')){el('cloudLogoutButton').hidden=!hasGoogle(account);el('cloudLogoutButton').disabled=endingSession;}
  if(el('cloudDisplayName')&&doc.activeElement!==el('cloudDisplayName'))el('cloudDisplayName').value=meta.displayName||'';
  const allowed=playAllowed();doc?.body?.classList.toggle('cloud-reconciling',!allowed);bridge.onBlocking?.(!allowed);
  host.GameStartup?.authState({unlocked:allowed,message:status,busy:Boolean(initializing)||popupBusy||verifying||loadingCloud||endingSession});
 }
 function setBlocking(value){blocking=value||recoveryBlocked;update();}
 function blockForRecovery(message){recoveryBlocked=true;sessionReady=false;setBlocking(true);update(message);}
 function clearTimer(){if(timer!==null)host.clearTimeout(timer);timer=null;}
 function canSync(){return ready&&googleVerified&&Date.now()<tokenExpiry&&hasGoogle(account)&&account.uid===auth?.currentUser?.uid&&!busy&&!blocking&&host.navigator.onLine!==false&&bridge.canSnapshot?.()===true&&!recoveryBlocked&&!endingSession;}
 function schedule(delay){if(timer!==null)return;if(!ready||!googleVerified||!account)return;timer=host.setTimeout(()=>{timer=null;void flush();},delay??Math.max(1500,INTERVAL-(Date.now()-lastWrite),retryAt-Date.now()));}
 function markDirty(){if(!configured||capturing||!googleVerified||recoveryBlocked||foreignTabChanged)return;dirty++;const wasDirty=meta.dirty;meta.dirty=true;if(!wasDirty)try{saveMeta();}catch(_){}if(ready)schedule();}
 function friendly(error){const code=String(error?.code||'');if(code.includes('unauthorized-domain'))return 'Add this website domain to Firebase Authentication → Authorized domains.';if(code.includes('operation-not-allowed'))return 'Enable Google sign-in in Firebase Authentication.';if(code.includes('permission-denied'))return 'Cloud access denied. Publish the Google-only Firestore rules for this project.';if(code.includes('popup-blocked'))return 'Popup blocked. Allow popups, then click Sign in with Google again.';if(code.includes('popup-closed')||code.includes('cancelled-popup'))return 'Google sign-in cancelled. Click Sign in with Google to try again.';if(code.includes('account-exists-with-different-credential'))return 'This account uses another provider. Choose a Google-enabled account.';return error?.message||'Online authentication or Cloud Save is unavailable. Please sign in with Google and retry.';}
 async function initialize(){
  if(auth&&sdkReady)return auth;if(initializing)return initializing;
  initializing=(async()=>{await U.loadSdk('firebaseAppCdn',()=>Boolean(host.firebase?.initializeApp));await U.loadSdk('firebaseAuthCdn',()=>Boolean(host.firebase?.auth));await U.loadSdk('firebaseFirestoreCdn',()=>Boolean(host.firebase?.firestore));
   const app=host.firebase.apps?.find(a=>a.name==='anime-card-cloud')||host.firebase.initializeApp(CONFIG,'anime-card-cloud');auth=app.auth();db=app.firestore();
   await U.timeout(auth.setPersistence(host.firebase.auth.Auth.Persistence.LOCAL),15000,'Could not initialize Google sign-in storage. Please retry.');
   if(host.sessionStorage.getItem(LOGOUT_KEY)){await auth.signOut();await clearLocalSession();host.sessionStorage.removeItem(LOGOUT_KEY);}
   auth.onAuthStateChanged(user=>{void observeUser(user);},error=>{suspendSession(friendly(error));});
   let initialToken=true;auth.onIdTokenChanged?.(user=>{if(initialToken){initialToken=false;return;}if(user&&googleVerified&&sessionReady&&user.uid===account?.uid){const cycle=identityCycle;void checkToken(user,cycle).catch(error=>suspendSession(friendly(error)));}},error=>suspendSession(friendly(error)));
   sdkReady=true;return auth;
  })();update('Connecting to Google Authentication…');
  try{return await initializing;}catch(error){auth=null;db=null;sdkReady=false;suspendSession(friendly(error));throw error;}finally{initializing=null;update();}
 }
 function start(){return initialize();}
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
 function current(ticket,uid){return ticket===epoch&&googleVerified&&!endingSession&&host.navigator.onLine!==false&&account?.uid===uid&&auth?.currentUser?.uid===uid;}
 async function useRemote(remote,payload,ticket){
  const uid=account?.uid;
  if(!uid||!current(ticket,uid))return;
  const local=await capture();if(!current(ticket,uid))return;
  await backupLocal(local.payload);if(!current(ticket,uid))return;
  const nextMeta={...meta,uid,revision:remote.revision,digest:remote.digest,dirty:false};
  await bridge.apply(payload,{meta:nextMeta,cloudFirst:true,canApply:()=>current(ticket,uid)});meta=nextMeta;
 }
 async function settleInfinity(remote,payload,ticket,uid){
  // Thưởng và metadata nằm trong cùng một revision của Cloud Save.
  for(let attempt=0;attempt<4;attempt++){
   if(!current(ticket,uid))return{remote,payload,changed:false};
   let plan;try{plan=await bridge.prepareInfinity?.(payload);}catch(error){host.console?.warn('Weekly reward remains unclaimed:',error.message);return{remote,payload,changed:false};}
   if(!plan)return{remote,payload,changed:false};
   if(!current(ticket,uid))return{remote,payload,changed:false};
   try{
    const result=await publish({payload:plan.payload,summary:remote.summary},remote.revision,remote.summary.displayName);
    return{remote:{...remote,revision:result.revision,digest:result.digest},payload:plan.payload,changed:true};
   }catch(error){
    if(error.code!=='cloud/conflict'){host.console?.warn('Weekly reward postponed:',error.message);return{remote,payload,changed:false};}
    remote=await readRemote(uid);payload=await remotePayload(uid,remote);
   }
  }
  return{remote,payload,changed:false};
 }
 async function reconcile(user,loginRemote){
  if(!hasGoogle(user)||!googleVerified||host.navigator.onLine===false){suspendSession('Google sign-in and an Internet connection are required.');return;}
  foreignTabChanged=false;waitingForActivity=false;const ticket=++epoch;clearTimer();watch?.();watch=null;pendingRemote=null;ready=false;account=user;
  try{
   if(bridge.canRestore?.()!==true){handoff=null;waitingForActivity=true;setBlocking(false);update('Cloud Save will restore automatically when the current activity ends.');return;}
   sessionReady=false;loadingCloud=true;setBlocking(true);update('Loading your Cloud Save…');
   let remote=loginRemote===undefined?await readRemote(user.uid):loginRemote;if(!current(ticket,user.uid))return;
   if(!remote){
    handoff=null;meta={...meta,uid:user.uid,revision:0,digest:'',dirty:true};saveMeta();ready=true;blocking=false;dirty++;
    const saved=await flush(true);if(saved&&current(ticket,user.uid)){
     const migrated=await readRemote(user.uid),payload=await remotePayload(user.uid,migrated),weekly=await settleInfinity(migrated,payload,ticket,user.uid);
     if(!current(ticket,user.uid))return;if(weekly.changed){await useRemote(weekly.remote,weekly.payload,ticket);return;}
     sessionReady=true;setBlocking(false);update('Google account connected · Cloud migration complete');
    }return;
   }
   let payload=await remotePayload(user.uid,remote);if(!current(ticket,user.uid))return;
   const weekly=await settleInfinity(remote,payload,ticket,user.uid);remote=weekly.remote;payload=weekly.payload;if(!current(ticket,user.uid))return;
   const receipt=handoff;handoff=null;
   if(receipt&&receipt.uid===user.uid&&receipt.revision===remote.revision&&receipt.digest===remote.digest&&await receipt.fingerprint===receipt.localHash){
    if(!current(ticket,user.uid))return;
    meta={...meta,uid:user.uid,revision:remote.revision,digest:remote.digest,dirty:false};saveMeta();dirty=0;lastWrite=Date.now();ready=true;sessionReady=true;setBlocking(false);update('Cloud Save loaded · Google account connected');listen(user.uid);return;
   }
   await useRemote(remote,payload,ticket);
  }catch(error){if(ticket!==epoch)return;handoff=null;ready=false;sessionReady=false;blocking=true;update(friendly(error));}
  finally{if(ticket===epoch){loadingCloud=false;update();}}
 }
 function afterActivity(){if(!waitingForActivity||!account||bridge.canRestore?.()!==true)return;waitingForActivity=false;queueMicrotask(()=>void reconcile(account));}
 async function stage(uid,payload){if(U.bytes(payload).length<=600000)return{payload,manifest:null};const snapshotId=U.token(),parts=[];for(let i=0;i<payload.length;i+=CHUNK_CHARS)parts.push(payload.slice(i,i+CHUNK_CHARS));if(parts.length>200)throw Error('Cloud save is too large.');const batch=db.batch();for(let i=0;i<parts.length;i++)batch.set(db.collection('users').doc(uid).collection('snapshots').doc(snapshotId).collection('chunks').doc(String(i).padStart(3,'0')),{index:i,text:parts[i]});await batch.commit();return{payload:null,manifest:{snapshotId,chunks:parts.length}};}
 async function deleteSnapshot(uid,id){
  if(!id)return;try{const chunks=await db.collection('users').doc(uid).collection('snapshots').doc(id).collection('chunks').get();if(!chunks.docs.length)return;const batch=db.batch();for(const row of chunks.docs)batch.delete(row.ref);await batch.commit();}catch(_){/* Cleanup never changes the committed save. */}
 }
 async function publish(local,expected,displayName){
  const uid=account?.uid,ticket=epoch,digest=await U.hash(local.payload);if(!uid||ticket!==epoch)throw Error('Account changed before saving.');if(U.bytes(local.payload).length>MAX_BYTES)throw Error('Cloud save exceeds 16 MiB. Local save is preserved.');
  const body=await stage(uid,local.payload),ref=db.collection('users').doc(uid),name=(((displayName??meta.displayName)||account.displayName||'').trim()||(account.isAnonymous?'Guest':'Player')+' '+uid.slice(0,5)).slice(0,40);
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
   else{retryAt=Date.now()+retryDelay;retryDelay=Math.min(120000,retryDelay*2);suspendSession(friendly(error));}return false;
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
 },error=>suspendSession(friendly(error)));}
 async function google(){
  if(popupBusy||verifying||loadingCloud||endingSession)return;
  if(host.navigator.onLine===false){suspendSession('Internet connection required. Connect and sign in with Google.');return;}
  popupBusy=true;update('Opening Google sign-in…');
  try{
   const sdk=auth&&sdkReady?auth:await initialize();
   if(host.sessionStorage.getItem(LOGOUT_KEY)){await sdk.signOut();await clearLocalSession();host.sessionStorage.removeItem(LOGOUT_KEY);}
   const provider=new host.firebase.auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
   // Let Firebase own popup/window messaging; do not probe cross-origin window.closed.
   const result=await sdk.signInWithPopup(provider);await observeUser(result.user);
  }catch(error){if(!playAllowed())blocking=true;update(friendly(error));}
  finally{popupBusy=false;update();}
 }
 async function clearLocalSession(){
  const keys=new Set([...(bridge.storageKeys?.()||[]),META_KEY,RESTORE_KEY,'animeCardRngSave_v1']);
  for(let i=0;i<host.localStorage.length;i++){const key=host.localStorage.key(i);if(key?.startsWith('anime_card_rng_'))keys.add(key);}
  for(const key of keys)host.localStorage.removeItem(key);
  host.sessionStorage.removeItem(BOOT_KEY);meta=freshMeta();dirty=0;
  await new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;host.clearTimeout(timeout);resolve();};const timeout=host.setTimeout(finish,1000);try{const request=host.indexedDB.deleteDatabase('anime_card_rng_cloud_recovery');request.onsuccess=request.onerror=request.onblocked=finish;}catch(_){finish();}});
 }
 async function logout(){
  if(endingSession)return;endingSession=true;identityCycle++;epoch++;suspendSession('Signing out…');
  try{host.sessionStorage.setItem(LOGOUT_KEY,'1');await auth?.signOut();account=null;await clearLocalSession();host.sessionStorage.removeItem(LOGOUT_KEY);update('Signed out. Sign in with Google to play.');host.location.reload();}
  catch(error){update(friendly(error));}finally{endingSession=false;update();}
 }
 async function retry(){try{await initialize();if(!hasGoogle(auth.currentUser)){suspendSession('Sign in with Google to play.');return;}if(!playAllowed()){await observeUser(auth.currentUser);}else await flush(true);}catch(error){suspendSession(friendly(error));}}
 async function leaderboard(metric='totalRolls'){if(!playAllowed())throw Error('Google sign-in is required.');if(!['totalRolls','strongestPower','timeTrialRoom'].includes(metric))throw Error('Unknown leaderboard.');const result=await U.timeout(db.collection('leaderboards').orderBy(metric,'desc').limit(50).get({source:'server'}));return result.docs.map(d=>d.data());}
 function mount(){el('cloudLoginOpenButton')?.addEventListener('click',()=>{bridge.open?.('cloudAccountModal');update();});el('cloudGoogleButton')?.addEventListener('click',google);el('cloudLogoutButton')?.addEventListener('click',logout);el('cloudSyncButton')?.addEventListener('click',retry);el('cloudReloadButton')?.addEventListener('click',()=>host.location.reload());el('cloudDisplayName')?.addEventListener('change',event=>{meta.displayName=event.target.value.trim().slice(0,40);markDirty();});update();}
 host.addEventListener('online',()=>{if(auth?.currentUser)void observeUser(auth.currentUser);else void initialize().catch(()=>{});});
 host.addEventListener('offline',()=>{suspendSession('Internet connection required. Reconnect to load your Cloud Save.');});
 // Do not start an upload while refreshing/leaving: the next login must read
 // Cloud first instead of racing an unload-time write of unsynced local data.
 host.addEventListener('storage',event=>{if(event.key===META_KEY){try{const other=JSON.parse(event.newValue||'null');if(other&&(other.uid!==meta.uid||other.revision!==meta.revision||other.digest!==meta.digest)){foreignTabChanged=true;ready=false;clearTimer();update('Another browser tab changed this save. Reload before syncing.');}}catch(_){}}});
 host.CloudSaveSystem=Object.freeze({CONFIG,META_KEY,RESTORE_KEY,BOOT_KEY,recovered,restoreReceipt,markDirty,blockForRecovery,afterActivity,start,initialize,retry,flush,google,logout,leaderboard,get firestore(){return playAllowed()?db:null;},get googleVerified(){return googleVerified&&hasGoogle(auth?.currentUser)&&host.navigator.onLine!==false;},get playAllowed(){return playAllowed();},get publicName(){return (meta.displayName||account?.displayName||'Player').trim().slice(0,40);},get activeUser(){return account;},get recoveryBlocked(){return recoveryBlocked;},get blocking(){return !playAllowed();},get status(){return status;},get ready(){return ready;},configure(options){bridge=options||{};configured=true;mount();if(recoveryBlocked)update('Unable to recover a Cloud restore. Reload before playing.');}});
})(window);
