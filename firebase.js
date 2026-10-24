/* Local-first profile and optional Google Cloud sync. Auth never controls gameplay. */
(function(host){
 'use strict';
 const CONFIG=Object.freeze({apiKey:'AIzaSyBmfGuGndLjYHNMNXchhtR0xAT0vH3tYzM',authDomain:'anime-card-web.firebaseapp.com',projectId:'anime-card-web',storageBucket:'anime-card-web.firebasestorage.app',messagingSenderId:'213612619343',appId:'1:213612619343:web:276b1ee7f432a0e37c2c3a',measurementId:'G-69PXX2Z7L3'});
 const META_KEY='anime_card_rng_cloud_meta_v1',RESTORE_KEY='anime_card_rng_cloud_restore_v1',BOOT_KEY='anime_card_rng_cloud_boot_v1',PROFILE_KEY='anime_card_rng_local_profile_v1';
 const INTERVAL=60000,MAX_BYTES=16*1024*1024,CHUNK_CHARS=120000,U=host.OnlineUtils,doc=host.document;
 const object=v=>Boolean(v&&typeof v==='object'&&!Array.isArray(v)),el=id=>doc?.getElementById(id);
 let bridge={},configured=false,auth=null,db=null,account=null,verified=false,enabled=false,sdkReady=false,initializing=null,identityJob=null,identityTarget=null,epoch=0;
 let busy=false,restoring=false,popupBusy=false,disconnecting=false,capturing=false,dirty=0,timer=null,lastWrite=0,pendingRevision=0,watch=null,recoveryBlocked=false;
 let status='Local save active. Google sync is optional.';
 function localProfile(){
  try{const saved=JSON.parse(host.localStorage.getItem(PROFILE_KEY)||'null');if(saved?.version===1&&/^local_[a-zA-Z0-9_-]{8,80}$/.test(saved.uid)&&typeof saved.name==='string'&&saved.name.length>0)return saved;}catch(_){}
  let id;try{id=U.token();}catch(_){id=Date.now().toString(36)+Math.random().toString(36).slice(2);}
  const profile={version:1,uid:'local_'+id,name:'Guest '+id.slice(-5).toUpperCase()};try{host.localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));}catch(_){}return profile;
 }
 const profile=localProfile(),guest=Object.freeze({uid:profile.uid,displayName:profile.name,isAnonymous:true,local:true,providerData:[]});
 const freshMeta=()=>({version:1,uid:null,revision:0,digest:'',dirty:false,displayName:'',autoSync:false});let meta=freshMeta();
 function readMeta(){try{const saved=JSON.parse(host.localStorage.getItem(META_KEY)||'null');if(saved?.version===1&&(saved.uid===null||typeof saved.uid==='string')&&Number.isSafeInteger(saved.revision)&&saved.revision>=0&&typeof saved.digest==='string'&&typeof saved.dirty==='boolean')meta={...freshMeta(),...saved,autoSync:typeof saved.autoSync==='boolean'?saved.autoSync:Boolean(saved.uid)};}catch(_){}}
 function saveMeta(){try{host.localStorage.setItem(META_KEY,JSON.stringify(meta));return true;}catch(_){return false;}}
 function recoverRestore(){
  try{const record=JSON.parse(host.localStorage.getItem(RESTORE_KEY)||'null');if(!record)return true;if(record.version!==1||!object(record.previous)||Object.keys(record.previous).some(key=>!(key.startsWith('anime_card_rng_')||key==='animeCardRngSave_v1')))throw Error('Invalid restore journal.');
   for(const[key,value]of Object.entries(record.previous)){if(value===null)host.localStorage.removeItem(key);else if(typeof value==='string')host.localStorage.setItem(key,value);else throw Error('Invalid restore record.');}host.localStorage.removeItem(RESTORE_KEY);return true;
  }catch(_){recoveryBlocked=true;return false;}
 }
 const recovered=recoverRestore();readMeta();
 // Old auth handoff/logout flags must never clear or replace a local profile.
 try{host.sessionStorage.removeItem(BOOT_KEY);host.sessionStorage.removeItem('anime_card_rng_logout_intent_v1');}catch(_){}
 function hasGoogle(user){return Boolean(user&&!user.isAnonymous&&user.providerData?.some(p=>p.providerId==='google.com'));}
 function canUseCloud(){return verified&&hasGoogle(account)&&account.uid===auth?.currentUser?.uid&&host.navigator.onLine!==false;}
 function cloudReady(){return enabled&&canUseCloud()&&!recoveryBlocked;}
 function current(ticket,uid){return ticket===epoch&&canUseCloud()&&account.uid===uid&&!disconnecting;}
 function clearTimer(){if(timer!==null)host.clearTimeout(timer);timer=null;}
 function stopWatch(){watch?.();watch=null;pendingRevision=0;}
 function update(message){
  if(message)status=message;U.text(el('cloudStatus'),status);U.text(el('cloudAccountName'),hasGoogle(account)?account.displayName||account.email||'Google account':profile.name);
  U.text(el('cloudUid'),'UID: '+(account?.uid||profile.uid));U.text(el('cloudSyncIndicator'),busy||restoring?'Syncing':cloudReady()?(meta.dirty?'Local · sync pending':'Local + Cloud saved'):'Local saved');
  if(el('cloudGoogleButton'))el('cloudGoogleButton').disabled=Boolean(initializing)||popupBusy||disconnecting;
  if(el('cloudSyncButton'))el('cloudSyncButton').disabled=busy||restoring||!canUseCloud();
  if(el('cloudLogoutButton')){el('cloudLogoutButton').hidden=!account;el('cloudLogoutButton').disabled=restoring||disconnecting;}
  if(el('cloudReloadButton')){el('cloudReloadButton').hidden=!canUseCloud();el('cloudReloadButton').disabled=busy||restoring||bridge.canRestore?.()!==true;}
  if(el('cloudDisplayName')&&doc.activeElement!==el('cloudDisplayName'))el('cloudDisplayName').value=meta.displayName||'';
 }
 function friendly(error){const code=String(error?.code||'');if(code.includes('unauthorized-domain'))return 'Add this site to Firebase Authentication Authorized domains. Local play is available.';if(code.includes('popup-blocked'))return 'Allow popups to connect Google. Local play continues.';if(code.includes('popup-closed')||code.includes('cancelled-popup'))return 'Google sign-in cancelled. Local progress is unchanged.';if(code.includes('permission-denied'))return 'Cloud access denied. Local progress is kept on this device.';return(error?.message||'Cloud sync unavailable.')+' Local play continues.';}
 function pauseCloud(message){enabled=false;clearTimer();stopWatch();update(message||'Cloud sync paused. Local progress is safe.');}
 async function verifyToken(user){if(!hasGoogle(user)||typeof user.getIdTokenResult!=='function')throw Error('Google is optional; this session cannot sync.');const token=await U.timeout(user.getIdTokenResult(),15000,'Cloud authentication timed out.');if((token.signInProvider||token.claims?.firebase?.sign_in_provider)!=='google.com'||!Number.isFinite(Date.parse(token.expirationTime))||Date.parse(token.expirationTime)<=Date.now())throw Error('Cloud session expired.');return true;}
 function schedule(delay){if(timer!==null||!cloudReady()||!meta.autoSync)return;timer=host.setTimeout(()=>{timer=null;void flush();},delay??Math.max(1500,INTERVAL-(Date.now()-lastWrite)));}
 function markDirty(){if(!configured||capturing)return;dirty++;meta.dirty=true;saveMeta();schedule();}
 function capture(){capturing=true;try{return Promise.resolve(bridge.capture());}finally{capturing=false;}}
 async function readRemote(uid){const snap=await U.timeout(db.collection('users').doc(uid).get({source:'server'}));return snap.exists?snap.data():null;}
 function validRemote(remote){return remote?.format==='anime-card-cloud-v1'&&Number.isSafeInteger(remote.revision)&&remote.revision>=1&&typeof remote.digest==='string'&&/^[a-f0-9]{64}$/.test(remote.digest)&&((typeof remote.payload==='string'&&remote.payload.length>0&&U.bytes(remote.payload).length<=MAX_BYTES)||(remote.manifest&&/^[a-f0-9]{32}$/.test(remote.manifest.snapshotId)&&Number.isSafeInteger(remote.manifest.chunks)&&remote.manifest.chunks>0&&remote.manifest.chunks<=200));}
 async function remotePayload(uid,remote){
  if(!validRemote(remote))throw Error('Cloud save is invalid.');let payload=remote.payload;
  if(remote.manifest){const chunks=await U.timeout(db.collection('users').doc(uid).collection('snapshots').doc(remote.manifest.snapshotId).collection('chunks').orderBy('index','asc').get({source:'server'}));const rows=chunks.docs.map(d=>d.data());if(rows.length!==remote.manifest.chunks||rows.some((row,i)=>row.index!==i||typeof row.text!=='string'||row.text.length>CHUNK_CHARS))throw Error('Cloud save is incomplete.');payload=rows.map(row=>row.text).join('');}
  if(U.bytes(payload).length>MAX_BYTES||await U.hash(payload)!==remote.digest)throw Error('Cloud integrity check failed.');await bridge.validate(payload);return payload;
 }
 async function stage(uid,payload){if(U.bytes(payload).length<=600000)return{payload,manifest:null};const snapshotId=U.token(),parts=[];for(let i=0;i<payload.length;i+=CHUNK_CHARS)parts.push(payload.slice(i,i+CHUNK_CHARS));if(parts.length>200)throw Error('Cloud save is too large.');const batch=db.batch();for(let i=0;i<parts.length;i++)batch.set(db.collection('users').doc(uid).collection('snapshots').doc(snapshotId).collection('chunks').doc(String(i).padStart(3,'0')),{index:i,text:parts[i]});await batch.commit();return{payload:null,manifest:{snapshotId,chunks:parts.length}};}
 async function deleteSnapshot(uid,id){if(!id)return;try{const chunks=await db.collection('users').doc(uid).collection('snapshots').doc(id).collection('chunks').get();if(!chunks.docs.length)return;const batch=db.batch();for(const row of chunks.docs)batch.delete(row.ref);await batch.commit();}catch(_){} }
 async function publish(local,expected,ticket,uid){
  const digest=await U.hash(local.payload);if(!current(ticket,uid))throw Error('Cloud account changed.');if(U.bytes(local.payload).length>MAX_BYTES)throw Error('Cloud save exceeds 16 MiB.');
  const body=await stage(uid,local.payload),ref=db.collection('users').doc(uid),name=(meta.displayName||account.displayName||profile.name).trim().slice(0,40)||profile.name;
  let result;try{result=await db.runTransaction(async tx=>{
   const latest=await tx.get(ref),backup=await tx.get(ref.collection('recovery').doc('previous')),previous=latest.exists?latest.data():null;
   if((previous?.revision||0)!==expected)throw U.error('Cloud changed on another device. Choose Upload Local Save to replace it, or Load Cloud Save to use it.','cloud/conflict');if(!current(ticket,uid))throw Error('Cloud account changed.');
   const revision=expected+1,summary={...local.summary,displayName:name},next={format:'anime-card-cloud-v1',revision,digest,...body,summary,updatedAt:host.firebase.firestore.FieldValue.serverTimestamp()};
   if(previous)tx.set(ref.collection('recovery').doc('previous'),previous);tx.set(ref,next);tx.set(db.collection('leaderboards').doc(uid),{uid,...summary,revision,updatedAt:host.firebase.firestore.FieldValue.serverTimestamp()});
   return{revision,digest,obsolete:backup.exists?backup.data()?.manifest?.snapshotId:null};
  });}catch(error){if(body.manifest)void deleteSnapshot(uid,body.manifest.snapshotId);throw error;}
  if(result.obsolete&&result.obsolete!==body.manifest?.snapshotId)void deleteSnapshot(uid,result.obsolete);return result;
 }
 async function flush(force=false,explicit=false){
  if(busy||restoring||!configured||!canUseCloud()||recoveryBlocked||bridge.canSnapshot?.()!==true)return false;
  if(!explicit&&!cloudReady())return false;if(!meta.dirty&&!force)return true;
  busy=true;clearTimer();const ticket=epoch,uid=account.uid,generation=dirty;update('Saving optional Cloud copy…');
  try{
   let expected=meta.revision;
   if(explicit){const remote=await readRemote(uid);if(remote&&!validRemote(remote))throw Error('Existing Cloud save is invalid; it was not overwritten.');expected=remote?.revision||0;}
   const local=await capture();if(!current(ticket,uid))return false;const result=await publish(local,expected,ticket,uid);if(!current(ticket,uid))return false;
   meta={...meta,uid,revision:result.revision,digest:result.digest,dirty:dirty!==generation,autoSync:true};saveMeta();enabled=true;lastWrite=Date.now();listen(uid);update(meta.dirty?'Cloud saved · newer local changes queued':'Local progress backed up to Cloud');return true;
  }catch(error){if(ticket===epoch)pauseCloud(friendly(error));return false;}
  finally{busy=false;if(current(ticket,uid)&&pendingRevision>meta.revision)pauseCloud('Cloud updated on another device. Local progress is kept.');else{update();if(meta.dirty)schedule();}}
 }
 function listen(uid){if(watch)return;watch=db.collection('users').doc(uid).onSnapshot(snapshot=>{
  if(account?.uid!==uid||!snapshot.exists||snapshot.metadata?.hasPendingWrites||snapshot.metadata?.fromCache)return;const remote=snapshot.data();if(remote.revision<=meta.revision)return;
  if(busy){pendingRevision=Math.max(pendingRevision,remote.revision);return;}pauseCloud('Cloud updated on another device. Local progress is kept; choose a Cloud action when convenient.');
 },error=>pauseCloud(friendly(error)));}
 async function observeUser(user){
  const target=user?.uid||null;if(identityJob&&identityTarget===target)return identityJob;
  const ticket=++epoch;identityTarget=target;enabled=false;verified=false;clearTimer();stopWatch();account=hasGoogle(user)?user:null;
  if(!account){update('Local save active. Google sync is optional.');return;}
  const job=(async()=>{try{
   if(host.navigator.onLine===false){update('Offline · local progress is active.');return;}await verifyToken(user);if(ticket!==epoch||auth.currentUser?.uid!==user.uid)return;verified=true;
   if(!configured)return;const remote=await readRemote(user.uid);if(!current(ticket,user.uid))return;
   if(!remote){meta={...meta,uid:user.uid,revision:0,digest:'',dirty:true,autoSync:true};saveMeta();enabled=true;update('Google connected · backing up this local profile');await flush(true);return;}
   if(!validRemote(remote))throw Error('Cloud save is invalid; local progress is unchanged.');
   if(meta.uid===user.uid&&meta.revision===remote.revision&&meta.digest===remote.digest){enabled=true;meta.autoSync=true;saveMeta();listen(user.uid);update('Google connected · local-first sync enabled');if(meta.dirty)schedule(1500);}
   else update('Google connected. A Cloud copy is available; local progress stays active. Choose Upload Local Save or Load Cloud Save.');
  }catch(error){if(ticket===epoch){verified=false;pauseCloud(friendly(error));}}finally{if(ticket===epoch)update();}})();
  identityJob=job;try{await job;}finally{if(identityJob===job){identityJob=null;identityTarget=null;}}
 }
 async function initialize(){
  if(auth&&sdkReady)return auth;if(initializing)return initializing;
  initializing=(async()=>{await U.loadSdk('firebaseAppCdn',()=>Boolean(host.firebase?.initializeApp));await U.loadSdk('firebaseAuthCdn',()=>Boolean(host.firebase?.auth));await U.loadSdk('firebaseFirestoreCdn',()=>Boolean(host.firebase?.firestore));const app=host.firebase.apps?.find(a=>a.name==='anime-card-cloud')||host.firebase.initializeApp(CONFIG,'anime-card-cloud');auth=app.auth();db=app.firestore();
   await U.timeout(auth.setPersistence(host.firebase.auth.Auth.Persistence.LOCAL),15000,'Google storage is unavailable.');auth.onAuthStateChanged(user=>{if(!disconnecting)void observeUser(user);},error=>pauseCloud(friendly(error)));
   auth.onIdTokenChanged?.(user=>{if(disconnecting)return;if(!user||user.uid!==account?.uid||!verified){void observeUser(user);return;}const ticket=epoch;void verifyToken(user).then(()=>{if(ticket===epoch){verified=true;if(!enabled)void observeUser(user);}}).catch(error=>{if(ticket===epoch){verified=false;pauseCloud(friendly(error));}});},error=>pauseCloud(friendly(error)));sdkReady=true;return auth;
  })();update('Connecting optional Google sync…');try{return await initializing;}catch(error){sdkReady=false;pauseCloud(friendly(error));throw error;}finally{initializing=null;update();}
 }
 function start(){update();if(meta.autoSync&&meta.uid&&host.navigator.onLine!==false)return initialize().catch(()=>null);return Promise.resolve(null);}
 async function google(){if(popupBusy||restoring||disconnecting)return;popupBusy=true;update('Opening optional Google sign-in…');try{const sdk=await initialize(),provider=new host.firebase.auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});const result=await sdk.signInWithPopup(provider);meta.autoSync=true;saveMeta();await observeUser(result.user);}catch(error){update(friendly(error));}finally{popupBusy=false;update();}}
 async function retry(){try{await initialize();if(!hasGoogle(auth.currentUser)){update('Local save active. Use Sign in with Google only if you want Cloud sync.');return false;}if(!verified)await observeUser(auth.currentUser);return await flush(true,true);}catch(error){update(friendly(error));return false;}}
 async function backupLocal(payload){
  if(!host.indexedDB)throw Error('Local backup storage is unavailable; local progress was not replaced.');
  await new Promise((resolve,reject)=>{const request=host.indexedDB.open('anime_card_rng_cloud_recovery',1);request.onupgradeneeded=()=>request.result.createObjectStore('backups');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const database=request.result,tx=database.transaction('backups','readwrite');tx.objectStore('backups').put({payload,uid:meta.uid,at:Date.now()},'before-cloud-restore');tx.oncomplete=()=>{database.close();resolve();};tx.onerror=tx.onabort=()=>{database.close();reject(tx.error||Error('Unable to preserve local backup.'));};};});
 }
 async function loadCloud(){
  if(busy||restoring||!canUseCloud()||recoveryBlocked||bridge.canRestore?.()!==true){update('Finish the current activity before loading an optional Cloud copy.');return false;}
  restoring=true;clearTimer();stopWatch();const ticket=epoch,uid=account.uid,generation=dirty;update('Downloading the Cloud copy you selected…');
  const safe=()=>current(ticket,uid)&&dirty===generation&&bridge.canRestore?.()===true;
  try{const remote=await readRemote(uid);if(!remote)throw Error('No Cloud copy exists.');const payload=await remotePayload(uid,remote);if(!safe())throw Error('Local progress or account changed. Nothing was replaced.');const local=await capture();await backupLocal(local.payload);if(!safe())throw Error('Local progress changed. Nothing was replaced.');const nextMeta={...meta,uid,revision:remote.revision,digest:remote.digest,dirty:false,autoSync:true};await bridge.apply(payload,{meta:nextMeta,manual:true,canApply:safe});meta=nextMeta;saveMeta();enabled=true;return true;}
  catch(error){update(friendly(error));return false;}finally{restoring=false;update();}
 }
 async function logout(){if(disconnecting||restoring)return;disconnecting=true;epoch++;verified=false;enabled=false;clearTimer();stopWatch();meta.autoSync=false;saveMeta();try{await auth?.signOut();account=null;update('Google disconnected. Local progress and gameplay are unchanged.');}catch(error){update(friendly(error));}finally{disconnecting=false;update();}}
 function localRows(){return[{uid:(account||guest).uid,displayName:(meta.displayName||account?.displayName||profile.name).slice(0,40),...(bridge.summary?.()||{totalRolls:0,strongestPower:0,timeTrialRoom:0,uniqueCards:0})}];}
 async function leaderboardView(metric='totalRolls'){
  if(!['totalRolls','strongestPower','timeTrialRoom'].includes(metric))throw Error('Unknown leaderboard.');if(!canUseCloud())return{rows:localRows(),localOnly:true};
  try{const result=await U.timeout(db.collection('leaderboards').orderBy(metric,'desc').limit(50).get({source:'server'}));return{rows:result.docs.map(d=>d.data()),localOnly:false};}catch(error){update(friendly(error));return{rows:localRows(),localOnly:true};}
 }
 function afterActivity(){update();if(meta.dirty)schedule(1500);}
 function mount(){el('cloudLoginOpenButton')?.addEventListener('click',()=>{bridge.open?.('cloudAccountModal');update();});el('cloudGoogleButton')?.addEventListener('click',google);el('cloudSyncButton')?.addEventListener('click',retry);el('cloudLogoutButton')?.addEventListener('click',logout);el('cloudReloadButton')?.addEventListener('click',loadCloud);el('cloudDisplayName')?.addEventListener('change',event=>{meta.displayName=event.target.value.trim().slice(0,40);markDirty();update();});update();}
 host.addEventListener('online',()=>{if(meta.autoSync&&meta.uid)void initialize().then(()=>{if(auth.currentUser)void observeUser(auth.currentUser);}).catch(()=>{});else update('Online · local save active.');});
 host.addEventListener('offline',()=>pauseCloud('Offline · gameplay and local saving continue.'));
 host.addEventListener('storage',event=>{if(event.key===META_KEY&&event.newValue){try{const other=JSON.parse(event.newValue);if(other.uid!==meta.uid||other.revision!==meta.revision||other.digest!==meta.digest)pauseCloud('Another tab synced this profile. This tab keeps its local gameplay active.');}catch(_){}}});
 host.CloudSaveSystem=Object.freeze({CONFIG,META_KEY,RESTORE_KEY,BOOT_KEY,PROFILE_KEY,recovered,markDirty,start,initialize,retry,flush,google,logout,loadCloud,leaderboardView,leaderboard:async metric=>(await leaderboardView(metric)).rows,afterActivity,blockForRecovery(message){recoveryBlocked=true;pauseCloud(message);},get googleVerified(){return canUseCloud();},get cloudReady(){return cloudReady();},get ready(){return cloudReady();},get firestore(){return canUseCloud()?db:null;},get activeUser(){return account||guest;},get publicName(){return(meta.displayName||account?.displayName||profile.name).trim().slice(0,40);},get playAllowed(){return !host.GameStartup?.failed;},get blocking(){return false;},get recoveryBlocked(){return recoveryBlocked;},get status(){return status;},configure(options){bridge=options||{};configured=true;mount();}});
})(window);
