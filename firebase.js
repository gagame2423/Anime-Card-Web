/* Local-first profile and optional linked Firebase Cloud sync. Auth never controls gameplay. */
(function(host){
 'use strict';
 const CONFIG=Object.freeze({apiKey:'AIzaSyBmfGuGndLjYHNMNXchhtR0xAT0vH3tYzM',authDomain:'anime-card-web.firebaseapp.com',projectId:'anime-card-web',storageBucket:'anime-card-web.firebasestorage.app',messagingSenderId:'213612619343',appId:'1:213612619343:web:276b1ee7f432a0e37c2c3a',measurementId:'G-69PXX2Z7L3'});
 const META_KEY='anime_card_rng_cloud_meta_v1',RESTORE_KEY='anime_card_rng_cloud_restore_v1',BOOT_KEY='anime_card_rng_cloud_boot_v1',PROFILE_KEY='anime_card_rng_local_profile_v1';
 const INTERVAL=3600000,MANUAL_GUARD=10000,LEGACY_MAX_BYTES=16*1024*1024,CHUNK_CHARS=120000,U=host.OnlineUtils,codec=host.CloudSaveCodec,doc=host.document;
 const BUDGET_KEY='anime_card_rng_cloud_budget_v1',QUOTA_KEY='anime_card_rng_cloud_quota_until_v1',WRITE_LOCK='anime-card-cloud-write-v2';
 const object=v=>Boolean(v&&typeof v==='object'&&!Array.isArray(v)),el=id=>doc?.getElementById(id);
 let bridge={},configured=false,auth=null,db=null,account=null,verified=false,enabled=false,sdkReady=false,initializing=null,identityJob=null,identityTarget=null,epoch=0;
 let busy=false,restoring=false,backupBusy=false,popupBusy=false,disconnecting=false,capturing=false,dirty=0,timer=null,nextCheck=0,firstCheck=0,quotaMemory=0,tickBusy=false,writeBusy=false,recoveryBlocked=false;
 let pendingCredential=null,autoChessHold=false;
 let status='Local save active. Account sync is optional.';
 function localProfile(){
  try{const saved=JSON.parse(host.localStorage.getItem(PROFILE_KEY)||'null');if(saved?.version===1&&/^local_[a-zA-Z0-9_-]{8,80}$/.test(saved.uid)&&typeof saved.name==='string'&&saved.name.length>0)return saved;}catch(_){}
  let id;try{id=U.token();}catch(_){id=Date.now().toString(36)+Math.random().toString(36).slice(2);}
  const profile={version:1,uid:'local_'+id,name:'Guest '+id.slice(-5).toUpperCase()};try{host.localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));}catch(_){}return profile;
 }
 const profile=localProfile(),guest=Object.freeze({uid:profile.uid,displayName:profile.name,isAnonymous:true,local:true,providerData:[]});
 const freshMeta=()=>({version:1,uid:null,revision:0,digest:'',progressDigest:'',boardDigest:'',dirty:false,displayName:'',autoSync:false});let meta=freshMeta();
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
 function supportedUser(user){return Boolean(user&&!user.isAnonymous&&user.providerData?.some(p=>['google.com','password'].includes(p.providerId)));}
 function canUseCloud(){return verified&&supportedUser(account)&&account.uid===auth?.currentUser?.uid&&host.navigator.onLine!==false;}
 function dataReady(){return canUseCloud()&&!host.SailingSea?.active&&!quotaBlocked();}
 function cloudReady(){return enabled&&canUseCloud()&&!recoveryBlocked;}
 function current(ticket,uid){return ticket===epoch&&canUseCloud()&&account.uid===uid&&!disconnecting;}
 function clearTimer(){if(timer!==null)host.clearTimeout(timer);timer=null;}
 function update(message){
  if(quotaBlocked())status=quotaMessage();else if(message)status=message;else if(status===quotaMessage())status='Daily quota reset · local progress is safe. Cloud sync is available again.';U.text(el('cloudStatus'),status);U.text(el('cloudAccountName'),supportedUser(account)?account.displayName||account.email||'Cloud account':profile.name);
  U.text(el('cloudUid'),'UID: '+(account?.uid||profile.uid));U.text(el('cloudSyncIndicator'),busy||restoring?'Syncing':quotaBlocked()?'Local saved · quota full':cloudReady()?(meta.dirty?'Local · hourly backup pending':'Local + Cloud saved'):'Local saved');
  if(el('cloudGoogleButton')){el('cloudGoogleButton').disabled=Boolean(initializing)||popupBusy||disconnecting||hasGoogle(account);el('cloudGoogleButton').textContent=hasGoogle(account)?'Google linked ✓':account?'Link Google account':'Sign in with Google';}
  U.text(el('cloudProviders'),account?'Linked: '+account.providerData.filter(p=>['google.com','password'].includes(p.providerId)).map(p=>p.providerId==='password'?'Email / Password':'Google').join(' + '):'Sign in or create an account. Existing Google users: sign in with Google, then set a password here.');
  const passwordLinked=account?.providerData?.some(p=>p.providerId==='password');
  for(const id of ['cloudEmailLogin','cloudEmailRegister','cloudEmailLink','cloudPasswordReset'])if(el(id)){el(id).disabled=popupBusy||disconnecting||restoring;el(id).hidden=id==='cloudEmailLink'?!account||passwordLinked:id==='cloudPasswordReset'?false:Boolean(account);}
  if(el('cloudEmail')&&account?.email){el('cloudEmail').value=account.email;el('cloudEmail').readOnly=true;}else if(el('cloudEmail'))el('cloudEmail').readOnly=false;
  if(el('cloudSyncButton'))el('cloudSyncButton').disabled=busy||restoring||backupBusy||!dataReady();
  if(el('cloudLogoutButton')){el('cloudLogoutButton').hidden=!account;el('cloudLogoutButton').disabled=restoring||disconnecting;}
  if(el('cloudReloadButton')){el('cloudReloadButton').hidden=!canUseCloud();el('cloudReloadButton').disabled=busy||restoring||backupBusy||!dataReady()||bridge.canRestore?.()!==true;}
  if(el('cloudCopyCode'))el('cloudCopyCode').disabled=busy||restoring||backupBusy||!configured;
  if(el('cloudRestoreCode'))el('cloudRestoreCode').disabled=busy||restoring||backupBusy||!configured;
  if(el('cloudDisplayName')&&doc.activeElement!==el('cloudDisplayName'))el('cloudDisplayName').value=meta.displayName||'';
 }
 // A durable attempt budget shared across tabs and accounts on this browser.
 // Reserve before sending, even on failure. Web Locks prevents a simultaneous
 // automatic/explicit write in another tab. No timer or gameplay caller can bypass it.
 function budget(){try{const raw=JSON.parse(host.localStorage.getItem(BUDGET_KEY)||'{}'),number=k=>Number.isFinite(raw[k])&&raw[k]>=0?raw[k]:0,quota=Number(host.localStorage.getItem(QUOTA_KEY));return{lastAttempt:number('lastAttempt'),lastManual:number('lastManual'),quotaUntil:Math.max(number('quotaUntil'),Number.isFinite(quota)&&quota>=0?quota:0,quotaMemory),startAt:number('startAt'),lastKind:String(raw.lastKind||'')};}catch(_){return{lastAttempt:0,lastManual:0,quotaUntil:quotaMemory,startAt:0,lastKind:''};}}
 function saveBudget(row){host.localStorage.setItem(BUDGET_KEY,JSON.stringify(row));}
 function quotaBlocked(){return budget().quotaUntil>Date.now();}
 function quotaMessage(){return 'Daily Firebase quota is full. Your local progress is safely saved on this device. Cloud sync will resume after the daily server reset (Pacific time). You can copy a backup code now.';}
 function nextQuotaReset(now=Date.now()){
  const f=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}),today=f.format(now);
  let low=now,high=now+30*3600000;while(high-low>1000){const middle=Math.floor((low+high)/2);if(f.format(middle)===today)low=middle;else high=middle;}return high+5*60000;
 }
 function tooLarge(error){return error?.code==='cloud/too-large'||/document (?:is )?too large|maximum (?:document|request) size|exceeds.*(?:document|byte).*limit/i.test(String(error?.message||''));}
 function noteError(error){if(!tooLarge(error)&&String(error?.code||'').includes('resource-exhausted')){quotaMemory=Math.max(budget().quotaUntil,nextQuotaReset());try{host.localStorage.setItem(QUOTA_KEY,String(quotaMemory));}catch(_){}clearTimer();schedule();}const message=friendly(error);update(message);return message;}
 function friendly(error){const code=String(error?.code||''),message=String(error?.message||'Cloud sync unavailable.');
  if(tooLarge(error))return 'Cloud save is too large for the compact document. Your local progress is safe. Use Copy Backup Code to keep a complete backup.';
  if(code.includes('resource-exhausted')||code==='cloud/quota')return quotaMessage();
  if(host.navigator.onLine===false||/unavailable|network-request-failed|deadline-exceeded/.test(code)||/offline|network connection|timed out/i.test(message))return 'Network offline or unavailable. Local progress is safely saved on this device. Cloud sync will retry at the next scheduled opportunity.';
  if(code.includes('unauthorized-domain'))return 'Add this site to Firebase Authentication Authorized domains. Local play is available.';if(code.includes('popup-blocked'))return 'Allow popups to connect Google. Local play continues.';if(code.includes('popup-closed')||code.includes('cancelled-popup'))return 'Google sign-in cancelled. Local progress is unchanged.';if(code.includes('permission-denied'))return 'Cloud access denied (permission-denied). The Cloud revision may have changed on another device, or the account/rules deny access. Local progress is safe. Choose Upload Local Save or Load Cloud Save.';
  return message+' Local progress is safe.';
 }
 function pauseCloud(message){enabled=false;clearTimer();update(message||'Cloud sync paused. Local progress is safe.');}
 async function verifyToken(user){if(!supportedUser(user)||typeof user.getIdTokenResult!=='function')throw Error('This session cannot sync.');const token=await U.timeout(user.getIdTokenResult(),15000,'Cloud authentication timed out.');if(!['google.com','password'].includes(token.signInProvider||token.claims?.firebase?.sign_in_provider)||!Number.isFinite(Date.parse(token.expirationTime))||Date.parse(token.expirationTime)<=Date.now())throw Error('Cloud session expired.');return true;}
 function due(row=budget()){const planned=row.lastAttempt||row.startAt;return Math.max(planned?planned+INTERVAL:firstCheck||Date.now()+INTERVAL,row.quotaUntil,nextCheck);}
 function schedule(){
  if(timer!==null||tickBusy||!cloudReady()||!meta.autoSync||autoChessHold||host.SailingSea?.active)return;
  try{const row=budget();if(!firstCheck)firstCheck=Date.now()+INTERVAL;const wait=Math.max(0,due(row)-Date.now());timer=host.setTimeout(()=>{timer=null;void autoTick();},Math.min(86400000,Math.max(250,wait)));}catch(_){update('Unable to store the cloud sync budget. Automatic writes are paused; local play continues.');}
 }
 function markDirty(){if(!configured||capturing)return;dirty++;if(!meta.dirty){meta.dirty=true;try{const stored=JSON.parse(host.localStorage.getItem(META_KEY)||'null');if(!stored||stored.uid===meta.uid&&stored.revision===meta.revision)saveMeta();}catch(_){}update();}schedule();}
 function capture(){capturing=true;try{return bridge.capture();}finally{capturing=false;}}
 function canWrite(){return dataReady()&&!recoveryBlocked&&!disconnecting;}
 async function withWriteSlot(kind,manual,operation){
  if(!canWrite())throw U.error(quotaBlocked()?quotaMessage():'Cloud is offline or the current activity is local only.',quotaBlocked()?'cloud/quota':'cloud/offline');
  if(!manual&&(!cloudReady()||!meta.autoSync||autoChessHold||host.SailingSea?.active))throw U.error('Automatic cloud sync is paused.','cloud/cooldown');
  const run=async()=>{if(writeBusy)throw U.error('A cloud request is already in progress.','cloud/cooldown');const row=budget(),now=Date.now();
   if(row.quotaUntil>now)throw U.error(quotaMessage(),'cloud/quota');
   if(manual?now-row.lastManual<MANUAL_GUARD:now<due(row))throw U.error(manual?'Please wait 10 seconds between manual uploads.':'The hourly upload budget is not ready.','cloud/cooldown');
   if(!canWrite())throw U.error('Cloud is offline.','cloud/offline');
   row.lastAttempt=now;row.startAt=row.startAt||now;row.lastKind=kind;if(manual)row.lastManual=now;saveBudget(row);writeBusy=true;
   try{return await operation();}catch(error){if(String(error?.code||'').includes('resource-exhausted'))update(noteError(error));throw error;}finally{try{const latest=budget();latest.lastAttempt=Math.max(latest.lastAttempt,Date.now());saveBudget(latest);}catch(_){}writeBusy=false;schedule();}
  };
  if(!host.navigator.locks?.request){if(!manual)throw U.error('Automatic sync requires browser storage locking. Manual backup is available.','cloud/cooldown');return run();}
  return host.navigator.locks.request(WRITE_LOCK,{ifAvailable:true},lock=>{if(!lock)throw U.error('Another tab is syncing. Please try again later.','cloud/cooldown');return run();});
 }
 async function readRemote(uid){if(!dataReady())throw U.error(quotaBlocked()?quotaMessage():'Cloud is offline.',quotaBlocked()?'cloud/quota':'cloud/offline');const snap=await U.timeout(db.collection('users').doc(uid).get({source:'server'}));return snap.exists?snap.data():null;}
 function validRemote(remote){return remote?.format==='anime-card-cloud-v1'&&Number.isSafeInteger(remote.revision)&&remote.revision>=1&&typeof remote.digest==='string'&&/^[a-f0-9]{64}$/.test(remote.digest)&&((typeof remote.payload==='string'&&remote.payload.length>0&&U.bytes(remote.payload).length<=LEGACY_MAX_BYTES)||(remote.manifest&&/^[a-f0-9]{32}$/.test(remote.manifest.snapshotId)&&Number.isSafeInteger(remote.manifest.chunks)&&remote.manifest.chunks>0&&remote.manifest.chunks<=200));}
 // Read-only migration path for previously saved chunk manifests. Never create,
 // delete or rewrite chunks, even on migration or failed saves.
 async function remotePayload(uid,remote){
  if(!validRemote(remote))throw Error('Cloud save is invalid.');let payload=remote.payload;
  if(remote.manifest){if(!dataReady())throw U.error('Cloud data unavailable.','cloud/offline');const chunks=await U.timeout(db.collection('users').doc(uid).collection('snapshots').doc(remote.manifest.snapshotId).collection('chunks').orderBy('index','asc').get({source:'server'}));const rows=chunks.docs.map(d=>d.data());if(rows.length!==remote.manifest.chunks||rows.some((row,i)=>row.index!==i||typeof row.text!=='string'||row.text.length>CHUNK_CHARS))throw Error('Cloud save is incomplete.');payload=rows.map(row=>row.text).join('');}
  if(U.bytes(payload).length>LEGACY_MAX_BYTES||await U.hash(payload)!==remote.digest)throw Error('Cloud integrity check failed.');await bridge.validate(payload);return payload;
 }
 // One-shot authenticated Firestore commit, equivalent to setDoc (or merge
 // when a field mask is supplied). Unlike the compat SDK's offline write
 // queue/transaction retries, this request has no automatic retry and returns
 // the actual quota error. Firebase security rules still authorize every write.
 const resourceRoot='projects/'+CONFIG.projectId+'/databases/(default)/documents';
 function fieldValue(v){
  if(v===null)return{nullValue:null};if(typeof v==='string')return{stringValue:v};if(typeof v==='boolean')return{booleanValue:v};if(typeof v==='number'&&Number.isFinite(v))return Number.isSafeInteger(v)?{integerValue:String(v)}:{doubleValue:v};
  if(Array.isArray(v))return{arrayValue:{values:v.map(fieldValue)}};
  if(object(v))return{mapValue:{fields:fields(v)}};throw Error('Invalid Cloud field.');
 }
 function fields(value){return Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined).map(([key,v])=>[key,fieldValue(v)]));}
 function writeDoc(collection,id,value,mask=null,timePath='updatedAt'){
  if(typeof id!=='string'||!id||id.includes('/'))throw Error('Invalid Cloud document identity.');
  return{update:{name:resourceRoot+'/'+collection+'/'+id,fields:fields(value)},...(mask?{updateMask:{fieldPaths:mask}}:{}),updateTransforms:[{fieldPath:timePath,setToServerValue:'REQUEST_TIME'}]};
 }
 async function commitWrites(uid,writes){
  if(!writes.length)return;const ticket=epoch,user=account;
  if(!dataReady()||user.uid!==uid)throw U.error('Cloud account or activity changed.','cloud/offline');
  const token=await U.timeout(user.getIdToken(),15000,'Cloud authentication timed out.');
  if(!current(ticket,uid)||!dataReady())throw U.error('Cloud account or activity changed.','cloud/offline');
  const controller=new AbortController(),timeout=host.setTimeout(()=>controller.abort(),20000);
  try{const response=await host.fetch('https://firestore.googleapis.com/v1/'+resourceRoot+':commit',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({writes}),signal:controller.signal,cache:'no-store'});
   if(!response.ok){let details;try{details=(await response.json()).error;}catch(_){}const code=String(details?.status||(response.status===429?'RESOURCE_EXHAUSTED':response.status===403?'PERMISSION_DENIED':'UNAVAILABLE')).toLowerCase().replace(/_/g,'-');throw U.error(details?.message||'Cloud request failed (HTTP '+response.status+').',code);}
  }catch(error){if(error.name==='AbortError'||error instanceof TypeError)throw U.error('Cloud network request timed out or disconnected.','unavailable');throw error;}finally{host.clearTimeout(timeout);}
 }
 const syncedName=()=>String(meta.displayName||account?.displayName||profile.name).trim().slice(0,40)||profile.name;
 async function publish(local,progressDigest,ticket,uid,manual,name){
  const unchanged=meta.uid===uid&&meta.progressDigest===progressDigest;
  const summary={...local.summary,displayName:name},boardDigest=await U.hash(U.stable(summary));
  if(!manual&&unchanged)return{revision:meta.revision,digest:meta.digest,progressDigest,already:true,boardDigest:meta.boardDigest};
  const payload=await bridge.encode(local.bundle),digest=await U.hash(payload);
  if(U.bytes(payload).length>codec.MAX_CLOUD_BYTES)throw U.error('Compact save exceeds 90 KB.','cloud/too-large');
  if(!current(ticket,uid)||host.SailingSea?.active)throw Error('Cloud account or activity changed.');
  return withWriteSlot('save',manual,async()=>{
   // Normal hourly uploads use the stored revision, with the existing rule
   // requiring revision + 1. A stale device cannot overwrite newer progress.
   // Only a player's explicit Upload action reads the latest revision.
   const previous=manual?await readRemote(uid):null;
   if(manual&&previous&&!validRemote(previous))throw Error('Existing Cloud save is invalid; it was not overwritten.');
   const oldRevision=manual?(previous?.revision||0):meta.revision,matching=meta.uid===uid&&oldRevision===meta.revision&&(!manual||!previous||previous.digest===meta.digest);
   if(!current(ticket,uid)||host.SailingSea?.active)throw Error('Cloud account or activity changed.');
   const same=manual&&Boolean(previous)&&(matching&&unchanged||previous.digest===digest&&U.stable(previous.summary)===U.stable(summary));
   const revision=same?oldRevision:oldRevision+1,wireDigest=same?previous.digest:digest,writes=[];
   if(!same)writes.push(writeDoc('users',uid,{format:'anime-card-cloud-v1',revision,digest,payload,manifest:null,summary}));
   // Public score projection is only part of an explicit manual upload.
   const boardChanged=manual&&(!matching||meta.boardDigest!==boardDigest);
   if(boardChanged)writes.push(writeDoc('leaderboards',uid,{uid,...summary,revision}));
   await commitWrites(uid,writes);
   return{revision,digest:wireDigest,progressDigest,already:same,boardDigest:boardChanged?boardDigest:meta.boardDigest};
  });
 }
 async function publishInfinity(uid,week,score,manual=false){
  return withWriteSlot('infinity',manual,async()=>{
   const snapshot=await U.timeout(db.collection('infinity_leaderboards').doc(week).get({source:'server'})),previous=snapshot.exists?snapshot.data()[uid]:null;
   if(!dataReady()||account.uid!==uid||host.InfinityRules.rotation().id!==week)throw Error('Cloud session or UTC week changed; local score is kept.');
   const highest=Math.max(score,Number.isSafeInteger(previous?.highestWave)?previous.highestWave:0);if(previous&&highest===previous.highestWave)return highest;
   const path='`'+uid.replace(/\\/g,'\\\\').replace(/`/g,'\\`')+'`';
   await commitWrites(uid,[writeDoc('infinity_leaderboards',week,{[uid]:{displayName:syncedName(),highestWave:highest}},[path],path+'.updatedAt')]);return highest;
  });
 }
 async function sync(manual=false){
  if(autoChessHold||host.SailingSea?.active||busy||backupBusy||restoring||!configured||!dataReady()||recoveryBlocked||bridge.canSnapshot?.()!==true)return false;
  if(!manual&&(!cloudReady()||!meta.autoSync||!meta.dirty||Date.now()<due()))return false;
  if(manual&&Date.now()-budget().lastManual<MANUAL_GUARD){update('Please wait 10 seconds between manual uploads.');return false;}
  busy=true;clearTimer();const ticket=epoch,uid=account.uid;update('Preparing compact Cloud backup…');
  try{
   const local=capture(),generation=dirty,name=syncedName();
   const progressDigest=await U.hash(codec.progression(local.bundle,{...local.summary,displayName:name},bridge.mainKey));
   if(!current(ticket,uid)||host.SailingSea?.active)return false;
   const result=await publish(local,progressDigest,ticket,uid,manual,name);if(!current(ticket,uid))return false;
   meta={...meta,uid,revision:result.revision,digest:result.digest,progressDigest:result.progressDigest,boardDigest:result.boardDigest,dirty:dirty!==generation,autoSync:true};saveMeta();enabled=true;
   update(result.already?'Already up to date':meta.dirty?'Saved to Cloud! Newer local changes are queued.':'Saved to Cloud!');return true;
  }catch(error){if(ticket===epoch){const code=String(error?.code||'');if(code==='cloud/conflict'||code.includes('permission-denied'))pauseCloud(noteError(error));else update(noteError(error));}return false;}
  finally{busy=false;update();schedule();}
 }
 async function autoTick(){
  if(tickBusy||autoChessHold||host.SailingSea?.active||!cloudReady()||!meta.autoSync)return;
  if(Date.now()<due()){schedule();return;}
  if(status===quotaMessage())update('Daily quota reset · hourly sync resumed.');
  tickBusy=true;const previous=budget().lastAttempt;
  // Alternate a save with a queued public score when both are pending. Every
  // path shares the same one-hour budget; no idle polling of remote records.
  async function scores(){if(budget().lastAttempt!==previous)return;await host.AutoChessOnline?.syncPending(false);if(budget().lastAttempt===previous)await host.InfinitySystem?.report(false);}
  try{if(budget().lastKind==='save')await scores();if(budget().lastAttempt===previous&&meta.dirty)await sync(false);if(budget().lastAttempt===previous)await scores();}
  catch(error){update(noteError(error));}finally{tickBusy=false;nextCheck=Date.now()+INTERVAL;update();schedule();}
 }
 // Legacy activity callers may only schedule the next hourly check.
 function flush(){schedule();return Promise.resolve(false);}
 async function observeUser(user){
  const target=user?.uid||null;if(identityJob&&identityTarget===target)return identityJob;
  if(target&&account?.uid===target&&verified){account=user;update();schedule();return;}
  const ticket=++epoch;identityTarget=target;enabled=false;verified=false;clearTimer();account=supportedUser(user)?user:null;
  if(!account){update('Local save active. Account sync is optional.');return;}
  const job=(async()=>{try{
   if(host.navigator.onLine===false){update('Offline · local progress is active.');return;}await verifyToken(user);if(ticket!==epoch||auth.currentUser?.uid!==user.uid)return;verified=true;
   if(!configured)return;
   // Remembered account: no startup read, listener, token-refresh read or
   // immediate write. The next actual save checks revision atomically.
   if(meta.uid===user.uid){enabled=meta.autoSync;update(quotaBlocked()?quotaMessage():enabled?'Account connected · hourly local-first sync enabled.':'Account connected · choose a Cloud action.');schedule();}
   else if(dataReady()){const remote=await readRemote(user.uid);if(!current(ticket,user.uid))return;
    if(!remote){meta={...freshMeta(),uid:user.uid,displayName:meta.displayName,dirty:true,autoSync:true};saveMeta();enabled=true;update('Account connected · automatic backup in one hour. Upload now if desired.');schedule();}
    else if(!validRemote(remote))throw Error('Cloud save is invalid; local progress is unchanged.');
    else update('Account connected. A Cloud copy is available; local progress stays active. Choose Upload Local Save or Load Cloud Save.');
   }else update(quotaBlocked()?quotaMessage():'Account connected · local play continues.');
   host.dispatchEvent(new host.CustomEvent('cloud-session-ready'));
  }catch(error){if(ticket===epoch)update(noteError(error));}finally{if(ticket===epoch)update();}})();
  identityJob=job;try{await job;}finally{if(identityJob===job){identityJob=null;identityTarget=null;}}
 }
 async function initialize(){
  if(auth&&sdkReady)return auth;if(initializing)return initializing;
  initializing=(async()=>{await U.loadSdk('firebaseAppCdn',()=>Boolean(host.firebase?.initializeApp));await U.loadSdk('firebaseAuthCdn',()=>Boolean(host.firebase?.auth));await U.loadSdk('firebaseFirestoreCdn',()=>Boolean(host.firebase?.firestore));const app=host.firebase.apps?.find(a=>a.name==='anime-card-cloud')||host.firebase.initializeApp(CONFIG,'anime-card-cloud');auth=app.auth();db=app.firestore();
   await U.timeout(auth.setPersistence(host.firebase.auth.Auth.Persistence.LOCAL),15000,'Account storage is unavailable.');auth.onAuthStateChanged(user=>{if(!disconnecting)void observeUser(user);},error=>pauseCloud(friendly(error)));
   auth.onIdTokenChanged?.(user=>{if(disconnecting)return;if(!user||user.uid!==account?.uid||!verified){void observeUser(user);return;}const ticket=epoch;void verifyToken(user).then(()=>{if(ticket===epoch){verified=true;schedule();}}).catch(error=>{if(ticket===epoch){verified=false;pauseCloud(friendly(error));}});},error=>pauseCloud(friendly(error)));sdkReady=true;return auth;
  })();update('Connecting optional account sync…');try{return await initializing;}catch(error){sdkReady=false;pauseCloud(friendly(error));throw error;}finally{initializing=null;update();}
 }
 function start(){update(host.navigator.onLine===false?'Network offline · local progress is saved on this device.':undefined);if(meta.autoSync&&meta.uid&&host.navigator.onLine!==false)return initialize().catch(()=>null);return Promise.resolve(null);}
 async function completeLink(user){
  if(!pendingCredential)return;
  if((user.email||'').toLowerCase()!==pendingCredential.email.toLowerCase())throw Error('Sign in to the original account with the matching email to finish linking.');
  const uid=user.uid;
  const result=await user.linkWithCredential(pendingCredential.credential);
  if(result.user.uid!==uid)throw Error('Account identity changed unexpectedly.');
  pendingCredential=null;
 }
 function authError(error){
  const code=String(error?.code||'');
  if(code==='auth/account-exists-with-different-credential'&&error.credential&&error.email){pendingCredential={email:error.email,credential:error.credential};if(el('cloudEmail'))el('cloudEmail').value=error.email;return 'This email already has an account. Sign in with its existing password, then Google will be linked to the same UID. Local save unchanged.';}
  if(['auth/credential-already-in-use','auth/email-already-in-use'].includes(code))return 'This email or Google login already belongs to an account. Sign in to that original account first, then link the other method in this panel. No account or cloud save was replaced.';
  if(['auth/invalid-credential','auth/wrong-password','auth/user-not-found'].includes(code))return 'Email or password is incorrect. If you used Google before, sign in with Google and use Set Email & Password.';
  if(code==='auth/operation-not-allowed')return 'Enable Email/Password in Firebase Console → Authentication → Sign-in method.';
  if(code==='auth/requires-recent-login')return 'Please sign out and sign back in, then retry linking. Local progress stays safe.';
  if(code==='auth/weak-password')return 'Choose a stronger password that meets the Firebase password policy (at least 6 characters).';
  if(code==='auth/invalid-email')return 'Enter a valid email address.';
  if(code==='auth/too-many-requests')return 'Too many attempts. Please wait before trying again.';
  return friendly(error);
 }
 async function google(){
  if(popupBusy||restoring||disconnecting)return;popupBusy=true;update('Opening Google sign-in…');
  try{const sdk=await initialize(),provider=new host.firebase.auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
   const before=sdk.currentUser,link=supportedUser(before)&&!hasGoogle(before);
   const result=link?await before.linkWithPopup(provider):await sdk.signInWithPopup(provider);
   if(link&&result.user.uid!==before.uid)throw Error('Account identity changed unexpectedly.');
   await completeLink(result.user);await observeUser(result.user);update(link?'Google linked to this UID. Both sign-in methods share the same cloud save.':status);
  }catch(error){update(authError(error));}finally{popupBusy=false;update();}
 }
 function emailValues(){const email=el('cloudEmail')?.value.trim()||'',password=el('cloudPassword')?.value||'';if(!email||!password)throw Error('Enter your email and password.');return{email,password};}
 async function emailAction(mode){
  if(popupBusy||restoring||disconnecting)return false;popupBusy=true;update('Connecting account…');
  try{const values=emailValues(),sdk=await initialize();let result;
   if(mode==='link'){
    const user=sdk.currentUser;if(!supportedUser(user))throw Error('Sign in to the original account first.');
    if(values.email.toLowerCase()!==(user.email||'').toLowerCase())throw Error('Use this account’s email when setting a password.');
    const credential=host.firebase.auth.EmailAuthProvider.credential(values.email,values.password),uid=user.uid;
    try{result=await user.linkWithCredential(credential);}catch(error){if(error.code!=='auth/requires-recent-login'||!hasGoogle(user))throw error;await user.reauthenticateWithPopup(new host.firebase.auth.GoogleAuthProvider());result=await user.linkWithCredential(credential);}
    if(result.user.uid!==uid)throw Error('Account identity changed unexpectedly.');
   }else{
    if(supportedUser(sdk.currentUser))throw Error('Use account linking while signed in.');
    if(mode==='register'&&pendingCredential)throw Error('Sign in to the existing account to finish linking Google.');
    result=mode==='register'?await sdk.createUserWithEmailAndPassword(values.email,values.password):await sdk.signInWithEmailAndPassword(values.email,values.password);
    await completeLink(result.user);
   }
   await observeUser(result.user);if(mode==='link')update('Email & Password linked. Your UID and cloud save are unchanged.');return true;
  }catch(error){update(authError(error));return false;}finally{if(el('cloudPassword'))el('cloudPassword').value='';popupBusy=false;update();}
 }
 async function passwordReset(){if(popupBusy||disconnecting)return;popupBusy=true;try{const sdk=await initialize(),email=el('cloudEmail')?.value.trim();if(!email)throw Error('Enter your email first.');await sdk.sendPasswordResetEmail(email);update('Password reset requested. Check the inbox for this account.');}catch(error){update(authError(error));}finally{popupBusy=false;update();}}
 async function retry(){if(quotaBlocked()){update(quotaMessage());return false;}try{await initialize();if(!supportedUser(auth.currentUser)){update('Local save active. Use Google or Email sign-in if you want Cloud sync.');return false;}if(!verified)await observeUser(auth.currentUser);return await sync(true);}catch(error){update(noteError(error));return false;}}
 async function backupLocal(payload){
  if(!host.indexedDB)throw Error('Local backup storage is unavailable; local progress was not replaced.');
  await new Promise((resolve,reject)=>{const request=host.indexedDB.open('anime_card_rng_cloud_recovery',1);request.onupgradeneeded=()=>request.result.createObjectStore('backups');request.onerror=()=>reject(request.error);request.onsuccess=()=>{const database=request.result,tx=database.transaction('backups','readwrite');tx.objectStore('backups').put({payload,uid:meta.uid,at:Date.now()},'before-cloud-restore');tx.oncomplete=()=>{database.close();resolve();};tx.onerror=tx.onabort=()=>{database.close();reject(tx.error||Error('Unable to preserve local backup.'));};};});
 }
 async function loadCloud(){
  if(quotaBlocked()){update(quotaMessage());return false;}
  if(busy||restoring||backupBusy||writeBusy||!dataReady()||recoveryBlocked||bridge.canRestore?.()!==true){update('Finish the current activity before loading an optional Cloud copy.');return false;}
  restoring=true;clearTimer();const ticket=epoch,uid=account.uid,generation=dirty;update('Downloading the Cloud copy you selected…');
  const safe=()=>current(ticket,uid)&&dirty===generation&&bridge.canRestore?.()===true;
  try{const remote=await readRemote(uid);if(!remote)throw Error('No Cloud copy exists.');const payload=await remotePayload(uid,remote);if(!safe())throw Error('Local progress or account changed. Nothing was replaced.');const local=capture();await backupLocal(await bridge.encode(local.bundle));if(!safe())throw Error('Local progress changed. Nothing was replaced.');const remoteBundle=await bridge.decode(payload),progressDigest=await U.hash(codec.progression(remoteBundle,remote.summary,bridge.mainKey));const nextMeta={...meta,uid,revision:remote.revision,digest:remote.digest,progressDigest,boardDigest:'',dirty:true,autoSync:true};await bridge.apply(payload,{meta:nextMeta,manual:true,canApply:safe});meta=nextMeta;saveMeta();enabled=true;return true;}
  catch(error){update(noteError(error));return false;}finally{restoring=false;update();schedule();}
 }
 async function logout(){if(disconnecting||restoring)return;disconnecting=true;pendingCredential=null;if(el('cloudPassword'))el('cloudPassword').value='';epoch++;verified=false;enabled=false;clearTimer();meta.autoSync=false;saveMeta();try{await auth?.signOut();account=null;update('Account disconnected. Local progress and gameplay are unchanged.');}catch(error){update(friendly(error));}finally{disconnecting=false;update();}}
 function localRows(){return[{uid:(account||guest).uid,displayName:(meta.displayName||account?.displayName||profile.name).slice(0,40),...(bridge.summary?.()||{totalRolls:0,strongestPower:0,timeTrialRoom:0,uniqueCards:0})}];}
 async function leaderboardView(metric='totalRolls'){
  if(!['totalRolls','strongestPower','timeTrialRoom'].includes(metric))throw Error('Unknown leaderboard.');if(!dataReady())return{rows:localRows(),localOnly:true,message:quotaBlocked()?quotaMessage():undefined};
  try{const result=await U.timeout(db.collection('leaderboards').orderBy(metric,'desc').limit(50).get({source:'server'}));return{rows:result.docs.map(d=>d.data()),localOnly:false};}catch(error){update(noteError(error));schedule();return{rows:localRows(),localOnly:true,message:friendly(error)};}
 }
 // Auto Chess uses this bounded public-run adapter, never the main save transaction.
 const autoChessService=Object.freeze({
  get available(){return dataReady();},
  async recentRuns(){
   if(!dataReady())return [];
   const snapshot=await U.timeout(db.collection('autochess_runs').orderBy('updatedAt','desc').limit(8).get({source:'server'}),8000,'Replay pool unavailable.').catch(error=>{update(noteError(error));throw error;});
   return snapshot.docs.map(row=>({...row.data(),uid:row.id}));
  },
  async publishRun(uid,payload,manual=false){
   if(!dataReady()||account.uid!==uid||payload.uid!==uid)throw Error('Auto Chess account changed.');
   const compact=host.AutoChessRuns.toCloud(payload);
   if(U.bytes(JSON.stringify(compact)).length>5900)throw Error('Auto Chess run exceeds its wire budget.');
   return withWriteSlot('autochess',manual,()=>commitWrites(uid,[writeDoc('autochess_runs',uid,compact)]));
  },
  async leaderboard(){
   if(!dataReady())return {rows:[],localOnly:true};
   try{const snapshot=await U.timeout(db.collection('autochess_runs').orderBy('elo','desc').limit(50).get({source:'server'}),8000,'Leaderboard unavailable.');return {rows:snapshot.docs.map(row=>({...row.data(),uid:row.id})),localOnly:false};}
   catch(error){noteError(error);throw error;}
  }
 });
 function holdAutoChess(){autoChessHold=true;clearTimer();}
 function releaseAutoChess(){autoChessHold=false;afterActivity();}
 function afterActivity(){update();schedule();}
 function backupStatus(message){U.text(el('cloudBackupStatus'),message);}
 async function copyBackup(){
  if(busy||restoring||backupBusy||writeBusy||!configured||bridge.canSnapshot?.()!==true){backupStatus('Finish the current activity before copying a backup.');return false;}
  backupBusy=true;update();backupStatus('Preparing your local backup…');try{const local=capture(),code=await bridge.encode(local.bundle),field=el('cloudBackupCode');if(!field)throw Error('Backup field unavailable.');field.value=code;field.focus();field.select();try{await host.navigator.clipboard.writeText(code);backupStatus('Backup code copied. Keep it somewhere private.');}catch(_){backupStatus('Backup code ready. Copy the selected text manually.');}return true;}catch(error){backupStatus(friendly(error));return false;}finally{backupBusy=false;update();schedule();}
 }
 async function restoreCode(){
  if(busy||restoring||backupBusy||writeBusy||recoveryBlocked||bridge.canRestore?.()!==true){backupStatus('Pause Auto-Roll and finish the current activity before restoring.');return false;}
  const code=el('cloudBackupCode')?.value.trim();if(!code){backupStatus('Paste a backup code first.');return false;}
  restoring=true;clearTimer();update();backupStatus('Checking backup integrity…');const generation=dirty;
  const safe=()=>dirty===generation&&bridge.canRestore?.()===true;
  try{await bridge.validate(code);if(!safe())throw Error('Local progress changed. Nothing was replaced.');if(!host.confirm('Restore this backup on this device? Your current local game save will be replaced. Sailing Sea remains untouched.')){backupStatus('Restore cancelled.');return false;}
   const local=capture();await backupLocal(await bridge.encode(local.bundle));if(!safe())throw Error('Local progress changed. Nothing was replaced.');
   const nextMeta={...meta,dirty:true,autoSync:false,progressDigest:''};await bridge.apply(code,{meta:nextMeta,manual:true,canApply:safe});meta=nextMeta;saveMeta();enabled=false;backupStatus('Backup restored. Local progress saved.');return true;
  }catch(error){backupStatus(error?.code==='SAVE_TAMPERED'?'Invalid or modified backup code. Local progress was not replaced.':friendly(error));return false;}finally{restoring=false;update();schedule();}
 }
 function mount(){el('cloudLoginOpenButton')?.addEventListener('click',()=>{bridge.open?.('cloudAccountModal');update();});el('cloudGoogleButton')?.addEventListener('click',google);for(const [id,mode]of [['cloudEmailRegister','register'],['cloudEmailLink','link']])el(id)?.addEventListener('click',()=>emailAction(mode));el('cloudPasswordReset')?.addEventListener('click',passwordReset);el('cloudEmailForm')?.addEventListener('submit',event=>{event.preventDefault();void emailAction(account?'link':'login');});el('cloudSyncButton')?.addEventListener('click',retry);el('cloudLogoutButton')?.addEventListener('click',logout);el('cloudReloadButton')?.addEventListener('click',loadCloud);el('cloudCopyCode')?.addEventListener('click',copyBackup);el('cloudRestoreCode')?.addEventListener('click',restoreCode);el('cloudDisplayName')?.addEventListener('change',event=>{meta.displayName=event.target.value.trim().slice(0,40);markDirty();update();});update();}
 host.addEventListener('online',()=>{if(meta.autoSync&&meta.uid)void initialize().then(()=>{if(auth.currentUser){if(verified){update(quotaBlocked()?quotaMessage():'Online · hourly sync will resume.');schedule();}else void observeUser(auth.currentUser);}}).catch(()=>{});else update('Online · local save active.');});
 host.addEventListener('offline',()=>{clearTimer();update('Offline · gameplay and local saving continue.');});
 host.addEventListener('storage',event=>{if(event.key===BUDGET_KEY||event.key===QUOTA_KEY){clearTimer();if(quotaBlocked())update(quotaMessage());schedule();}if(event.key===META_KEY&&event.newValue){try{const other=JSON.parse(event.newValue);if(other.uid!==meta.uid||other.revision!==meta.revision||other.digest!==meta.digest)pauseCloud('Another tab synced this profile. This tab keeps its local gameplay active.');}catch(_){}}});
 host.CloudSaveSystem=Object.freeze({CONFIG,META_KEY,RESTORE_KEY,BOOT_KEY,PROFILE_KEY,BUDGET_KEY,recovered,autoChessService,holdAutoChess,releaseAutoChess,markDirty,start,initialize,retry,flush,google,emailAction,passwordReset,logout,loadCloud,leaderboardView,leaderboard:async metric=>(await leaderboardView(metric)).rows,afterActivity,copyBackup,restoreCode,publishInfinity,noteError,blockForRecovery(message){recoveryBlocked=true;pauseCloud(message);},get authVerified(){return canUseCloud();},get googleVerified(){return canUseCloud();},get cloudReady(){return cloudReady();},get ready(){return cloudReady();},get firestore(){return dataReady()?db:null;},get activeUser(){return account||guest;},get publicName(){return(meta.displayName||account?.displayName||profile.name).trim().slice(0,40);},get playAllowed(){return !host.GameStartup?.failed;},get blocking(){return false;},get recoveryBlocked(){return recoveryBlocked;},get status(){return status;},configure(options){bridge=options||{};configured=true;meta.dirty=true;saveMeta();mount();}});
})(window);
