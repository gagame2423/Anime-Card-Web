/* Invite-only PeerJS lobby + one-query/one-set asynchronous recorded-run sync. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,R=host.AutoChessRuns,U=host.OnlineUtils;
 const CACHE_KEY='ac_ghost_pool_cache',CACHE_TTL=600000,ATTEMPTS_KEY='anime_card_rng_ac_cloud_published_v2',PENDING_KEY='anime_card_rng_ac_cloud_pending_v1',PROTOCOL='ac-live-3';
 let backendOverride=null;const uploadStatuses=new Map();
 function uploadStatus(id,value){if(value){uploadStatuses.set(id,value);if(uploadStatuses.size>32)uploadStatuses.delete(uploadStatuses.keys().next().value);}return uploadStatuses.get(id)||null;}
 const service=()=>backendOverride||host.CloudSaveSystem?.autoChessService||null;
 function identity(){const user=host.CloudSaveSystem?.activeUser;return{hextechUnlocks:host.HextechSystem.unlocks(),equippedSkins:Object.fromEntries(host.CardSkinSystem.DEFINITIONS.filter(d=>host.CardSkinSystem.equipped(d.cardId)===d.id).map(d=>[d.cardId,d.id])),uid:user?.uid||'local_player',name:R.name(host.CloudSaveSystem?.publicName||'You'),elo:host.AutoChessRanked?.current()?.elo||0,wins:host.AutoChessRanked?.current()?.wins||0,run:R.last()};}
 function cached(){try{const data=JSON.parse(host.sessionStorage.getItem(CACHE_KEY)||'null');if(data?.version!==1||!Number.isFinite(data.at)||Date.now()-data.at<0||Date.now()-data.at>=CACHE_TTL||!Array.isArray(data.rows)||!data.rows.length||data.rows.length>8)return null;return data.rows.map(R.decode).filter(Boolean).map(r=>r.wire);}catch(_){return null;}}
 function storePool(rows){if(!rows?.length){try{host.sessionStorage.removeItem(CACHE_KEY);}catch(_){}return;}try{host.sessionStorage.setItem(CACHE_KEY,JSON.stringify({version:1,at:Date.now(),rows}));}catch(_){} }
 const usable=run=>!!run&&Object.values(run.stages).some(stage=>stage.board.length>0);
 function distinct(rows,self){const seen=new Set([self]);return(rows||[]).map(R.decode).filter(r=>usable(r)&&!seen.has(r.uid)&&seen.add(r.uid)).map(r=>r.wire).slice(0,7);}
 function install(s,slot,member,friend=false){
  const p=s.players[slot],run=member.run&&R.decode(member.run),valid=usable(run)&&run.uid===member.uid;
  p.name=R.name(member.name);p.source={kind:valid?'recorded':'friend-ai',uid:member.uid,friend,elo:Math.max(0,Math.floor(member.elo||run?.elo||0))};p.bot=true;
  if(valid)s.hybrid.runs[p.id]=run.wire;
 }
 function seed(s,packet){
  if(packet?.roster?.length>=2)return host.AutoChessLive.seed(s,packet);
  const me=identity(),roster=(packet?.roster||[]).filter(p=>p.uid!==me.uid),seen=new Set([me.uid]);
  s.hybrid={version:1,uid:me.uid,room:packet?.room||'',humanPlayers:Math.max(1,new Set((packet?.roster||[]).map(p=>p.uid).filter(R.uid)).size),mode:'recorded',runs:{},stages:{},readRequested:false,queryCount:0,writeAttempted:false,writeCount:0,cloudStatus:'local'};
  C.get(s).source={kind:'human',uid:me.uid,elo:me.elo};let slot=1;const pool=distinct(cached()||[],me.uid),byUid=new Map(pool.map(wire=>[wire.uid,wire]));
  for(const member of roster){if(slot>7||!R.uid(member.uid)||seen.has(member.uid))continue;seen.add(member.uid);const direct=member.run&&R.decode(member.run);install(s,slot++,{...member,run:direct?.uid===member.uid?member.run:byUid.get(member.uid)||null},true);}
  for(const wire of pool){if(slot>7||seen.has(wire.uid))continue;seen.add(wire.uid);install(s,slot++,{uid:wire.uid,name:wire.name,elo:wire.elo,run:wire});}
  return s;
 }
 function beginRun(getState,notify=()=>{}){
  const initial=getState();if(!initial?.hybrid||initial.hybrid.readRequested)return;
  running.add(initial.id);
  const id=initial.id,uid=initial.hybrid.uid,pool=cached();initial.hybrid.readRequested=true;initial.hybrid.cloudStatus=pool?'cached':'local';if(!C.save(initial))return;
  if(pool)return;
  const cloud=service();if(!cloud?.available||host.navigator.onLine===false)return;
  initial.hybrid.queryCount=1;if(!C.save(initial))return;
  // Start never awaits this request. Bots are playable immediately at Stage 1-1.
  Promise.resolve().then(()=>cloud.recentRuns()).then(rows=>{
   const valid=(rows||[]).map(R.decode).filter(Boolean).map(r=>r.wire).slice(0,8);storePool(valid);
   const s=getState();if(!s||s.id!==id||s.abandoned||s.finished||s.hybrid.uid!==uid)return;
   s.hybrid.cloudStatus='synced';
   if(!s.live&&s.stage===1&&s.round<4){const used=new Set([uid,...s.players.map(p=>p.source?.uid).filter(Boolean)]),slots=s.players.slice(1).filter(p=>!p.source);
    for(const wire of distinct(valid,uid)){const friend=s.players.find(p=>p.source?.kind==='friend-ai'&&p.source.uid===wire.uid);if(friend){install(s,s.players.indexOf(friend),{uid:wire.uid,name:friend.name,elo:wire.elo,run:wire},true);continue;}if(used.has(wire.uid)||!slots.length)continue;used.add(wire.uid);const p=slots.shift();install(s,s.players.indexOf(p),{uid:wire.uid,name:wire.name,elo:wire.elo,run:wire});}
   }C.save(s);notify();
  }).catch(()=>{storePool([]);const s=getState();if(s?.id===id){s.hybrid.cloudStatus='offline';C.save(s);notify();}});
 }
 function replay(p){return p.source?.kind==='recorded';}
 function prepareRound(s){
  if(!s.hybrid)return;const ended=[];
  for(const p of s.players.slice(1)){
   if(s.live?.humans?.some(h=>h.id===p.id)||!replay(p)||p.rank!==null||p.hp<=0)continue;const run=R.decode(s.hybrid.runs[p.id]),snapshot=R.at(run,C.label(s));if(!snapshot)continue;
   C.reconcileTactician(p,{hp:snapshot.hp,lastStandUsed:snapshot.lastStandUsed});
   if(p.hp<=0){ended.push(p);continue;}if(!snapshot.board.length)continue;
   p.level=snapshot.level;p.xp=0;p.augments=[...snapshot.augments];p.units=[];p.anvil=[];p.relics=Array(10).fill(null);p.loot=[];
   for(const row of snapshot.board){const u=C.unit(s,C.card(row.cardId));u.board=row.position;u.bench=null;u.skinId=row.skinId||null;if(row.relic)u.relic={uid:'r'+(++s.serial),roll:C.clone(row.relic)};p.units.push(u);}
   p.replayStage=snapshot.stageKey;p.replaySynergies=snapshot.synergies;p.replaySampled=run.sampled;if(!p.hp)ended.push(p);
  }
  C.placeEliminated(s,ended);
 }
 function record(s){R.record(s);}
 function finish(s){
  if(s.finished)running.delete(s.id);
  if(s.abandoned||!s.hybrid||!s.finished||!s.paid||s.hybrid.writeAttempted)return;
  R.record(s,true);const ranked=host.AutoChessRanked?.current()||{},payload=R.encode({uid:s.hybrid.uid,name:C.get(s).name,matchId:s.id,placement:C.get(s).rank,elo:ranked.elo||0,wins:ranked.wins||0,matches:ranked.matches||0,...host.AutoChessProfile?.publicMeta()},s.hybrid.stages);
  s.hybrid.writeAttempted=true;if(!payload){s.hybrid.cloudStatus='too-large';C.save(s);return;}
  R.save(payload);s.hybrid.payloadBytes=R.bytes(payload);
  try{host.localStorage.setItem(PENDING_KEY,JSON.stringify(payload));}catch(_){}
  const started=publish(payload);s.hybrid.writeCount=started?1:0;s.hybrid.cloudStatus=started?'uploading':'local';C.save(s);
 }
 const publishing=new Map(),running=new Set();
 function publish(payload){
  const cloud=service(),key=payload.uid+':'+payload.matchId;if(publishing.has(key)||!cloud?.available||identity().uid!==payload.uid||host.navigator.onLine===false)return false;
  let attempts;try{attempts=JSON.parse(host.localStorage.getItem(ATTEMPTS_KEY)||'[]');if(!Array.isArray(attempts))attempts=[];if(attempts.includes(key))return false;}catch(_){return false;}
  uploadStatus(payload.matchId,'uploading');
  const job=Promise.resolve().then(()=>cloud.publishRun(payload.uid,payload)).then(()=>{
   uploadStatus(payload.matchId,'published');host.AutoChessRanked?.invalidateLeaderboard();
   try{const rows=JSON.parse(host.localStorage.getItem(ATTEMPTS_KEY)||'[]');host.localStorage.setItem(ATTEMPTS_KEY,JSON.stringify([...new Set([...(Array.isArray(rows)?rows:[]),key])].slice(-1024)));const pending=JSON.parse(host.localStorage.getItem(PENDING_KEY)||'null');if(pending?.uid===payload.uid&&pending.matchId===payload.matchId)host.localStorage.removeItem(PENDING_KEY);}catch(_){}
   host.dispatchEvent?.(new host.CustomEvent('autochess-cloud-published',{detail:{uid:payload.uid,matchId:payload.matchId}}));
  }).catch(error=>{uploadStatus(payload.matchId,String(error?.code||'').includes('permission-denied')?'denied':'offline');}).finally(()=>publishing.delete(key));publishing.set(key,job);return true;
 }
 function syncPending(){
  if(running.size)return false;
  try{
   let payload=R.decode(JSON.parse(host.localStorage.getItem(PENDING_KEY)||'null'))?.wire;
   if(!payload){const run=R.decode(R.last()),me=identity(),rank=host.AutoChessRanked?.current();if(!run||run.uid!==me.uid||!rank)return false;payload=R.encode({...run.wire,...rank,...host.AutoChessProfile?.publicMeta(),name:me.name},run.stages);}
   return payload?publish(payload):false;
  }catch(_){return false;}
 }
 const MODE_KEY='anime_card_rng_ac_connection_mode_v1',DIRECT_WAIT=6000,JOIN_WAIT=20000;
 const modeOf=code=>code?.startsWith('AL-')?'lan':'relay',codeFor=(code,mode)=>(mode==='lan'?'AL-':'AC-')+code.slice(3),newCode=mode=>codeFor('AC-'+U.token(6).toUpperCase(),mode);
 const connectionLabel=mode=>mode==='lan'?'LAN Direct':'Online Relay';
 function savedMode(){try{return host.localStorage.getItem(MODE_KEY)==='lan'?'lan':'relay';}catch(_){return 'relay';}}
 function peerProfile(mode){
  const base=mode==='lan'?{config:{iceServers:U.STUN_SERVERS.slice(0,1).map(urls=>({urls}))},debug:0}:U.peerOptions();
  return {...base,config:{...base.config,iceTransportPolicy:'all'}};
 }
 function createLobby(options={}){
  syncPending();const me=identity();if(me.run?.uid!==me.uid)me.run=null;
  let mode=options.mode==='lan'||options.mode==='relay'?options.mode:savedMode(),room=newCode(mode),joinCode=null,lanFallback=false,relayConfigured=true,owner=me.uid,members=[me],peer=null,upstream=null,connections=new Map(),active=true,started=false,ready=false,joining=false,generation=0,status='Preparing invite code…',resumeToken='',matchId='',retryTimer=null,signalTimer=null,retryCount=0,lastRetry=0;
  const timers=new Set(),pendingConnections=new Set(),leases=new Map();let liveReceiver=null,liveClosed=null,liveRestored=null;const pendingLive=[];
  const later=(fn,ms)=>{const t=host.setTimeout(()=>{timers.delete(t);fn();},ms);timers.add(t);return t;};
  function linkStatus(){
   const peers=owner===me.uid?[...connections.values()].filter(c=>c.open).length:Number(!!upstream?.open&&ready);
   return {mode,label:connectionLabel(mode),peers,state:peers?'linked':started?'reconnecting':joining?'connecting':ready?'waiting':peer?'connecting':'offline'};
  }
  const view=()=>({room,owner,members:C.clone(members),self:me.uid,isHost:owner===me.uid,ready,joining,started,status,connection:linkStatus(),lanFallback,relayConfigured});
  function setPreference(next){mode=next;try{host.localStorage.setItem(MODE_KEY,next);}catch(_){}}
  function offerRelay(message){if(mode!=='lan'||started||lanFallback)return;lanFallback=true;update(message);}

  const update=message=>{if(message)status=message;if(active)options.onChange?.(view());};
  const validMember=x=>x&&(!x.hextechUnlocks||Array.isArray(x.hextechUnlocks)&&x.hextechUnlocks.length<=9&&x.hextechUnlocks.every(id=>C.card(id)?.hextechExclusive))&&(!x.equippedSkins||Object.keys(x.equippedSkins).length<=10&&Object.entries(x.equippedSkins).every(([id,skin])=>host.CardSkinSystem.get(skin)?.cardId===id))&&R.uid(x.uid)&&typeof x.name==='string'&&x.name.length<=40&&Number.isSafeInteger(x.elo)&&x.elo>=0&&Number.isSafeInteger(x.wins)&&x.wins>=0&&(!x.run||R.decode(x.run)?.uid===x.uid);
  function send(c,type,data={}){if(!c?.open)return false;try{c.send(JSON.parse(JSON.stringify({protocol:PROTOCOL,type,room,...data})));return true;}catch(_){return false;}}
  function broadcast(type,data={}){for(const c of connections.values())send(c,type,data);}
  function rosterValid(rows){return Array.isArray(rows)&&rows.length>=1&&rows.length<=8&&rows.every(validMember)&&new Set(rows.map(r=>r.uid)).size===rows.length&&rows.some(r=>r.uid===me.uid);}
  function clearNetwork(){generation++;for(const t of timers)host.clearTimeout(t);timers.clear();retryTimer=null;signalTimer=null;for(const c of new Set([...connections.values(),...pendingConnections,upstream].filter(Boolean))){c.removeAllListeners?.();try{c.close();}catch(_){}}connections.clear();pendingConnections.clear();leases.clear();upstream=null;try{peer?.destroy();}catch(_){}peer=null;ready=false;}
  function reconnectSignal(){if(!active||signalTimer||!peer?.disconnected)return;signalTimer=later(()=>{signalTimer=null;try{if(peer?.disconnected&&!peer.destroyed)peer.reconnect?.();}catch(_){}reconnectSignal();},3000);}
  function fail(message){if(!active||started)return;clearNetwork();joining=false;owner=me.uid;members=[me];room=newCode(mode);if(mode==='lan'&&joinCode)lanFallback=true;update(message+(joinCode&&mode==='relay'?' · If switching from LAN, ask the host to switch too and share the AC- code.':' · Start solo is available.'));}
  function retry(force=false){
   if(!active||!started||owner===me.uid||retryTimer||upstream&&(!upstream.open||!force))return false;
   const wait=Math.max(0,Math.min(5000,1000+retryCount*500)-(Date.now()-lastRetry));
   retryTimer=later(()=>{
    retryTimer=null;if(!active||!started||upstream&&(!upstream.open||!force))return;
    lastRetry=Date.now();retryCount++;
    try{if(peer?.disconnected)peer.reconnect?.();if(peer&&!peer.destroyed){openUpstream(generation);return;}}catch(_){}
    retry(force);
   },wait);return true;
  }
  function hello(connection){send(connection,'hello',{member:me,resumeToken,matchId});}
  function openUpstream(ticket){
   if(!peer||ticket!==generation||!active)return;const previous=upstream;if(started)ready=false;
   const next=peer.connect('acr-'+room.toLowerCase(),{reliable:true,serialization:'json',metadata:{autoChessMode:mode}});upstream=next;bind(next,false,ticket);next.on('open',()=>{if(upstream!==next||ticket!==generation)return;retryCount=0;hello(next);});
   if(previous&&previous!==next){previous.acSuperseded=true;try{previous.close();}catch(_){}}
   if(!started&&mode==='lan')later(()=>{if(upstream===next&&!ready)offerRelay('No direct link yet. Try Online Relay if your Wi-Fi isolates devices.');},DIRECT_WAIT);
   if(started)later(()=>{if(upstream===next&&(!next.open||!ready)){try{next.close();}catch(_){}if(upstream===next)upstream=null;retry();}},JOIN_WAIT);

  }
  function acceptPacket(message,connection,isHost){
   if(!active||!message||message.protocol!==PROTOCOL||message.room!==room||R.bytes(message)>90000)return;
   if(started&&message.type==='live'){
    if(isHost&&(!connection.acUid||connections.get(connection.peer)!==connection)||!isHost&&connection!==upstream)return;
    if(liveReceiver)liveReceiver(message.payload,connection.acUid||owner);else if(pendingLive.length<256)pendingLive.push([message.payload,connection.acUid||owner]);return;
   }
   if(isHost){
    if(message.type==='hello'){
     if(!validMember(message.member)){send(connection,'error',{message:'Invalid room identity.'});return;}
     const uid=message.member.uid,existing=members.find(m=>m.uid===uid),lease=leases.get(uid);
     if(started&&(!existing||!lease||message.resumeToken!==lease||message.matchId!==matchId)||!started&&existing&&connection.acUid!==uid){send(connection,'error',{message:'This room seat is already reserved.'});return;}
     if(!existing&&members.length>=8){send(connection,'error',{message:'This room is full.'});return;}
     connection.acUid=uid;pendingConnections.delete(connection);
     for(const [key,old]of connections)if(old!==connection&&old.acUid===uid){connections.delete(key);old.acSuperseded=true;try{old.close();}catch(_){}}
     connections.set(connection.peer,connection);if(!existing){members.push(message.member);leases.set(uid,U.token(16));}
     lanFallback=false;send(connection,started?'resumed':'welcome',{resumeToken:leases.get(uid),matchId});
     if(started)liveRestored?.(uid);else{broadcast('state',{owner,members});update('Invite room ready · '+members.length+'/8 players');}
    }else if(message.type==='ackStart'){connection.acAcknowledged=true;}
   }else if(message.type==='welcome'||message.type==='resumed'){
    if(connection!==upstream||typeof message.resumeToken!=='string'||message.resumeToken.length>128)return;resumeToken=message.resumeToken;
    if(started&&message.type==='resumed'&&message.matchId===matchId){retryCount=0;ready=true;liveRestored?.(owner);}
   }else if(message.type==='state'&&!started){
    if(!rosterValid(message.members)||!message.members.some(m=>m.uid===message.owner))return;owner=message.owner;members=message.members;joining=false;ready=true;lanFallback=false;update('Joined · waiting for the host to Start');
   }else if(message.type==='start'&&!started){
    if(!rosterValid(message.roster)||!/^chess_[a-z0-9]+_[a-z0-9]+$/.test(message.matchId)||!Number.isSafeInteger(message.seed)||message.seed<1||message.seed>4294967295)return;
    matchId=message.matchId;started=true;joining=false;send(connection,'ackStart');options.onStart?.({seed:message.seed,roster:message.roster,room,matchId,link:link(false)});
   }else if(message.type==='error'){if(started){update(String(message.message||'Reconnecting to your reserved seat.').slice(0,120));return;}fail(String(message.message||'Unable to join room.').slice(0,120));}
  }
  async function connect(code=null){
   clearNetwork();const ticket=generation;joining=!!code;lanFallback=false;
   if(code){room=code;owner='';members=[me];joinCode=code;}
   update(code?'Joining invite room…':'Preparing invite code…');
   // Let the guest switch without waiting for a slow signal/ICE timeout.
   if(code&&mode==='lan')later(()=>{if(ticket===generation&&!ready&&joining)offerRelay('No direct link yet. Try Online Relay if your Wi-Fi isolates devices.');},DIRECT_WAIT);
   try{
    await U.loadSdk('peerJsCdn',()=>typeof host.Peer==='function');if(!active||started||ticket!==generation)return;
    const isHost=!code,config=peerProfile(mode),id=isHost?'acr-'+room.toLowerCase():undefined;
    relayConfigured=mode==='lan'||config.config.iceServers.some(server=>[server.urls].flat().some(url=>/^turns?:/i.test(url)));
    peer=options.makePeer?options.makePeer(id,config):new host.Peer(id,config);
    const timeout=later(()=>{if(!ready&&!started)fail('Invite service timed out');},JOIN_WAIT);
    peer.on('open',()=>{if(ticket!==generation||!active)return;if(started){if(!isHost)retry();return;}
     if(isHost){ready=true;host.clearTimeout(timeout);timers.delete(timeout);update('Invite code ready · friends can join before Start');}else openUpstream(ticket);
    });
    peer.on('connection',connection=>{if(ticket!==generation||!active||!isHost||pendingConnections.size>=12){connection.close();return;}if(connection.metadata?.autoChessMode!==undefined&&connection.metadata.autoChessMode!==mode){connection.close();return;}pendingConnections.add(connection);bind(connection,true,ticket);if(mode==='lan')later(()=>{if(!connection.acUid&&pendingConnections.has(connection))offerRelay('A guest could not establish a direct link. Try Online Relay if Wi-Fi isolates devices.');},DIRECT_WAIT);later(()=>{if(!connection.acUid&&pendingConnections.delete(connection))connection.close();},JOIN_WAIT);});
    peer.on('error',()=>{if(ticket!==generation)return;if(started||isHost&&ready){reconnectSignal();if(started&&!isHost)retry();}else fail('Invite service unavailable');});
    peer.on('disconnected',()=>{if(ticket!==generation)return;if(started||isHost&&ready){reconnectSignal();if(started&&!isHost)retry();}else fail('Invite service disconnected');});
   }catch(_){if(ticket===generation)fail('Offline lobby');}
  }
  function bind(connection,isHost,ticket){
   connection.on('data',message=>{if(ticket!==generation||connection.acSuperseded)return;try{acceptPacket(message,connection,isHost);}catch(_){/* A rejected packet never closes a healthy room channel. */}});
   let lostHandled=false;
   function lost(){
    if(lostHandled||ticket!==generation||connection.acSuperseded||!active||!isHost&&upstream!==connection)return;
    lostHandled=true;pendingConnections.delete(connection);
    if(started){if(isHost&&connections.get(connection.peer)===connection)connections.delete(connection.peer);if(!isHost){ready=false;upstream=null;retry();}liveClosed?.(isHost?connection.acUid:owner);return;}
    if(isHost){if(connections.get(connection.peer)===connection)connections.delete(connection.peer);if(!connection.acUid)return;members=members.filter(m=>m.uid!==connection.acUid);leases.delete(connection.acUid);broadcast('state',{owner,members});update('Player left · '+members.length+'/8 players');}
    else fail('Unable to open the peer link');
   }
   connection.on('error',lost);connection.on('close',lost);
  }
  function join(value){
   if(started||!active)return false;const code=String(value||'').trim().toUpperCase();
   if(!/^(?:AC|AL)-[A-F0-9]{12}$/.test(code)){update('Enter an AC- or AL- room code.');return false;}
   if(code===room&&owner===me.uid){update('This is your room code. Share it with friends.');return false;}
   setPreference(modeOf(code));void connect(code);return true;
  }
  function setMode(next){
   if(started||!active||!['lan','relay'].includes(next)||next===mode)return false;
   const target=joinCode&&(owner!==me.uid||lanFallback)?joinCode:null;
   setPreference(next);
   if(target){void connect(codeFor(target,next));return true;}
   room=codeFor(room,next);joinCode=null;owner=me.uid;members=[me];void connect();return true;
  }
  function link(isHost){return{isHost,self:me.uid,owner,mode,status:linkStatus,send(payload){if(isHost)broadcast('live',{payload});else send(upstream,'live',{payload});},target(uid,payload){if(!isHost)return;for(const c of connections.values())if(c.acUid===uid)send(c,'live',{payload});},reconnect(){return retry(true);},subscribe(fn,closed,restored){liveReceiver=fn;liveClosed=closed;liveRestored=restored;for(const args of pendingLive.splice(0))fn(...args);return()=>{liveReceiver=null;liveClosed=null;liveRestored=null;};},close(){active=false;clearNetwork();}};}

  function start(){if(!active||started||owner!==me.uid)return false;started=true;matchId='chess_'+Date.now().toString(36)+'_'+U.token(4);const packet={seed:host.crypto.getRandomValues(new Uint32Array(1))[0]||1,roster:C.clone(members),room,matchId};broadcast('start',packet);options.onStart?.({...packet,link:members.length>1?link(true):null});if(members.length===1)later(clearNetwork,500);return true;}
  void connect();
  return{view,join,setMode,start,close(){active=false;clearNetwork();},refreshInvite(){if(!started&&!joining)void connect();}};
 }
 host.addEventListener?.('cloud-session-ready',()=>syncPending());
 host.addEventListener?.('online',()=>syncPending());
 host.AutoChessOnline=Object.freeze({CACHE_KEY,CACHE_TTL,identity,cached,distinct,seed,beginRun,endRun:id=>running.delete(id),get inMatch(){return running.size>0;},prepareRound,record,finish,replay,uploadStatus,syncPending,connectionLabel,createLobby,configure(options={}){backendOverride=options.backend||null;}});
})(window);
