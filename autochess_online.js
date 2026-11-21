/* Invite-only PeerJS lobby + one-query/one-set asynchronous recorded-run sync. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,R=host.AutoChessRuns,U=host.OnlineUtils;
 const CACHE_KEY='ac_ghost_pool_cache',CACHE_TTL=600000,ATTEMPTS_KEY='anime_card_rng_ac_cloud_published_v2',PENDING_KEY='anime_card_rng_ac_cloud_pending_v1',PROTOCOL='ac-live-6';
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
  const local=C.get(s);local.source={kind:'human',uid:me.uid,elo:me.elo};local.mimicPool=host.PassiveSystem.ownedMimicPool();
  let slot=1;const pool=distinct(cached()||[],me.uid),byUid=new Map(pool.map(wire=>[wire.uid,wire]));
  for(const member of roster){if(slot>7||!R.uid(member.uid)||seen.has(member.uid))continue;seen.add(member.uid);const direct=member.run&&R.decode(member.run);install(s,slot++,{...member,run:direct?.uid===member.uid?member.run:byUid.get(member.uid)||null},true);}
  for(const wire of pool){if(slot>7||seen.has(wire.uid))continue;seen.add(wire.uid);install(s,slot++,{uid:wire.uid,name:wire.name,elo:wire.elo,run:wire});}
  return s;
 }
 function beginRun(getState,notify=()=>{}){
  const initial=getState();if(!initial?.hybrid)return;
  running.add(initial.id);if(initial.hybrid.readRequested)return;
  const id=initial.id,uid=initial.hybrid.uid,pool=cached();initial.hybrid.readRequested=true;initial.hybrid.cloudStatus=pool?'cached':'local';if(!C.save(initial))return;
  if(pool||initial.live)return;
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
 // PeerJS owns ordered buffering and BinaryPack framing. The application
 // sends one JSON document per message; it never splits or limits a snapshot.
 const MODE_KEY='anime_card_rng_ac_connection_mode_v1',DIRECT_WAIT=6000,HANDSHAKE_WAIT=60000,OFFLINE_GRACE=60000,RETRY=2500;
 const modeOf=code=>code?.startsWith('AL-')?'lan':'relay',codeFor=(code,mode)=>(mode==='lan'?'AL-':'AC-')+code.slice(3),newCode=mode=>codeFor('AC-'+U.token(6).toUpperCase(),mode);
 const connectionLabel=mode=>mode==='lan'?'LAN Direct':'Online Relay';
 function savedMode(){try{return host.localStorage.getItem(MODE_KEY)==='lan'?'lan':'relay';}catch(_){return 'relay';}}
 function peerProfile(mode){
  const base=mode==='lan'?{config:{iceServers:U.STUN_SERVERS.slice(0,1).map(urls=>({urls}))}}:U.peerOptions();
  return {...base,debug:0,config:{...base.config,iceTransportPolicy:'all'}};
 }
 function createLobby(options={}){
  syncPending();const {run,...me}=identity(),validToken=v=>typeof v==='string'&&/^[a-f0-9]{32}$/.test(v);
  me.mimicPool=host.PassiveSystem.ownedMimicPool();
  let mode=['lan','relay'].includes(options.mode)?options.mode:savedMode(),room=newCode(mode),joinCode=null,token='',owner=me.uid,members=[me],match=null;
  let active=true,generation=0,ready=false,joining=false,activated=false,lanFallback=false,relayConfigured=true,status='Preparing invite code…';
  let peer=null,upstream=null,dial=null,opened=false,startedAt=0,nextDial=0,nextSignal=0,listener=null;
  const seats=new Map(),channels=new Map(),inbox=[];
  const ownsRoom=()=>!joinCode,peerId=()=> 'acr-'+room.toLowerCase(),now=()=>Date.now();
  // A signaling outage or a missing ping is not proof that a data channel died.
  function canSend(c){
   if(!c?.open)return false;
   const rtc=c.peerConnection;
   return (!c.dataChannel||c.dataChannel.readyState==='open')&&!['failed','closed','disconnected'].includes(rtc?.connectionState)&&!['failed','closed','disconnected'].includes(rtc?.iceConnectionState);
  }
  function linkStatus(){
   const peers=ownsRoom()?[...seats.values()].filter(s=>canSend(s.conn)).length:Number(canSend(upstream)&&ready);
   return {mode,label:connectionLabel(mode),peers,state:peers?'linked':match?'reconnecting':joining?'connecting':ready?'waiting':peer?'connecting':'offline'};
  }
  const view=()=>({room,owner,members:C.clone(members),self:me.uid,isHost:ownsRoom(),ready,joining,started:!!match,status,connection:linkStatus(),lanFallback,relayConfigured});
  function update(message){if(message)status=message;if(active&&!match)options.onChange?.(view());}
  function prefer(next){mode=next;try{host.localStorage.setItem(MODE_KEY,next);}catch(_){}}
  function offerRelay(message){if(mode!=='lan'||match||lanFallback)return;lanFallback=true;update(message);}
  const validMember=m=>m&&R.uid(m.uid)&&typeof m.name==='string'&&m.name.length<=40&&Number.isSafeInteger(m.elo)&&m.elo>=0&&Number.isSafeInteger(m.wins)&&m.wins>=0&&Array.isArray(m.hextechUnlocks)&&m.hextechUnlocks.length<=9&&m.hextechUnlocks.every(id=>C.card(id)?.hextechExclusive)&&host.PassiveSystem.validMimicPool(m.mimicPool)&&m.equippedSkins&&typeof m.equippedSkins==='object'&&!Array.isArray(m.equippedSkins)&&Object.entries(m.equippedSkins).every(([id,skin])=>host.CardSkinSystem.get(skin)?.cardId===id);
  const validRoster=rows=>Array.isArray(rows)&&rows.length>=1&&rows.length<=8&&rows.every(validMember)&&new Set(rows.map(m=>m.uid)).size===rows.length&&rows.some(m=>m.uid===me.uid);
  const validMatch=m=>m&&validRoster(m.roster)&&m.roster[0].uid===owner&&m.room===room&&typeof m.matchId==='string'&&/^chess_[a-z0-9]+_[a-z0-9]+$/.test(m.matchId)&&Number.isSafeInteger(m.seed)&&m.seed>0&&m.seed<=0xffffffff;
  const usable=c=>channels.has(c)&&canSend(c);
  function encode(type,data){return JSON.stringify({protocol:PROTOCOL,type,room,...data});}
  function deliver(c,text){
   if(!usable(c))return false;
   try{c.send(text);return true;}catch(_){
    // A transient send error does not retire an authenticated seat.
    if(ownsRoom())host.console?.warn('Auto Chess could not send a peer message. The next synchronization will retry.');
    else nextDial=now();
    return false;
   }
  }
  function send(c,type,data){return deliver(c,encode(type,data));}
  function broadcast(type,data){
   const text=encode(type,data);let sent=false;
   for(const s of seats.values())if(deliver(s.conn,text))sent=true;
   return sent;
  }
  function notifyPresence(seat,up){
   if(!seat||seat.up===up)return false;
   seat.up=up;
   if(up){seat.downSince=null;seat.offline=false;if(match)listener?.presence(seat.member.uid,'linked');}
   else{seat.downSince=now();if(match)listener?.presence(seat.member.uid,'reconnecting');}
   return true;
  }
  function peerState(entry){
   const {c,seat}=entry,up=usable(c);
   if(c===dial&&up&&!entry.hello)entry.hello=send(c,'HELLO',{member:me,token,matchId:match?.matchId});
   if(seat?.conn===c)notifyPresence(seat,up);
   if(c!==upstream||entry.up===up)return;
   entry.up=up;ready=up;
   if(match){listener?.presence(owner,up?'linked':'reconnecting');if(!up)tryDial();}
   else if(!up){joining=true;update('Peer link interrupted. Reconnecting…');tryDial();}
  }
  function drop(c,notify=true){
   const entry=channels.get(c);if(!entry)return;
   channels.delete(c);entry.unwatch();
   if(dial===c)dial=null;
   if(upstream===c){upstream=null;ready=false;if(notify){if(match)listener?.presence(owner,'reconnecting');else{joining=true;update('Peer link interrupted. Reconnecting…');}}}
   if(entry.seat?.conn===c){entry.seat.conn=null;if(notify)notifyPresence(entry.seat,false);}
   c.removeAllListeners?.();try{c.close();}catch(_){}
  }
  function disposeNetwork(){
   generation++;for(const c of channels.keys())drop(c,false);
   seats.clear();inbox.length=0;
   const old=peer;peer=null;opened=false;upstream=dial=null;ready=false;nextDial=nextSignal=0;
   try{old?.destroy();}catch(_){}
  }
  function fail(message){
   if(!active||match)return;const target=joinCode;
   disposeNetwork();joinCode=null;token='';owner=me.uid;members=[me];room=newCode(mode);joining=false;
   joinCodeForFallback=target;lanFallback=mode==='lan'&&!!target;
   update(message+' · Start solo is available.');
  }
  let joinCodeForFallback=null;
  function lobbySync(){
   const payload={owner,members};
   broadcast('ROOM',payload);update('Invite room ready · '+members.length+'/8 players');
  }
  function admit(message,entry){
   const {c}=entry;if(!validMember(message.member)||!validToken(message.token)||message.member.uid===me.uid)return send(c,'ERROR',{message:'Invalid room identity.'});
   const uid=message.member.uid;let seat=seats.get(uid);
   if(message.matchId&&message.matchId!==match?.matchId||seat&&seat.token!==message.token||match&&(!seat||seat.left))return send(c,'ERROR',{message:'This room seat is already reserved.'});
   if(!seat){
    if(members.length>=8)return send(c,'ERROR',{message:'This room is full.'});
    const member={uid,name:R.name(message.member.name),elo:message.member.elo,wins:message.member.wins,hextechUnlocks:message.member.hextechUnlocks,equippedSkins:message.member.equippedSkins,mimicPool:message.member.mimicPool};
    seat={member,token:message.token,conn:null,up:false,downSince:null,offline:false,left:false};
    seats.set(uid,seat);members.push(member);
   }
   const old=seat.conn;if(old&&old!==c)drop(old,false);
   entry.seat=seat;seat.conn=c;lanFallback=false;
   // The offer is repeatable: a guest that missed START can still join its
   // already-reserved seat and immediately receive the current match state.
   send(c,'WELCOME',{owner,members,match});
   const changed=notifyPresence(seat,usable(c));
   if(match){if(!changed&&seat.up)listener?.attached(uid);}else lobbySync();
  }
  function startGuest(packet){
   if(match||!validMatch(packet)||packet.roster.length<2)return;
   match=packet;members=packet.roster;joining=false;options.onStart?.({...packet,link:link(false)});
  }
  function accept(message,entry){
   const {c}=entry;
   if(message?.protocol!==PROTOCOL||message.room!==room)return;
   if(ownsRoom()){
    if(message.type==='HELLO'){admit(message,entry);return;}
    if(message.type!=='LIVE'||!match||entry.seat?.conn!==c||entry.seat.left||message.matchId!==match.matchId)return;
    if(message.payload?.type==='LEAVE')entry.seat.left=true;
   }else{
    if(message.type==='ERROR'&&(c===dial||c===upstream)&&!match){fail(message.message||'Unable to join room.');return;}
    if(message.type==='WELCOME'&&(c===dial||c===upstream)){
     if(!validRoster(message.members)||message.members[0].uid!==message.owner||match&&message.match?.matchId!==match.matchId)return;
     const previous=upstream,hadMatch=!!match;owner=message.owner;members=message.members;upstream=c;dial=null;entry.up=true;ready=true;activated=true;joining=false;lanFallback=false;
     if(previous&&previous!==c)drop(previous,false);
     if(hadMatch)listener?.presence(owner,'attached');
     else if(message.match)startGuest(message.match);
     else update('Joined · waiting for the host to start');
     return;
    }
    if(c!==upstream)return;
    if(message.type==='ROOM'&&!match&&validRoster(message.members)&&message.owner===owner&&message.members[0].uid===owner){members=message.members;update('Joined · waiting for the host to start');return;}
    if(message.type==='START'){startGuest(message.match);return;}
    if(message.type!=='LIVE'||!match||message.matchId!==match.matchId)return;
   }
   const args=[message.payload,ownsRoom()?entry.seat.member.uid:owner];
   if(listener)listener.receive(...args);else inbox.push(args);
  }
  function bind(c,ticket){
   const entry={c,born:now(),seat:null,up:false,hello:false,unwatch:()=>{}};channels.set(c,entry);
   const valid=()=>active&&ticket===generation&&channels.get(c)===entry;
   const inspect=()=>{if(valid())peerState(entry);};
   function onOpen(){
    if(!valid())return;const rtc=c.peerConnection;
    for(const name of ['connectionstatechange','iceconnectionstatechange'])rtc?.addEventListener?.(name,inspect);
    entry.unwatch=()=>{for(const name of ['connectionstatechange','iceconnectionstatechange'])rtc?.removeEventListener?.(name,inspect);};
    if(!ownsRoom())inspect();
   }
   c.on('open',onOpen);
   c.on('close',()=>{if(valid()){drop(c);if(!ownsRoom())tryDial();}});
   c.on('error',inspect);
   c.on('data',wire=>{
    if(!valid()||typeof wire!=='string')return;
    try{accept(JSON.parse(wire),entry);}catch(_){host.console?.warn('Auto Chess could not apply a peer message. The room remains connected.');}
   });
   if(c.open)onOpen();
  }
  function tryDial(force=false){
   if(!active||ownsRoom()||dial||!peer||!opened||peer.disconnected||peer.destroyed||!force&&(usable(upstream)||now()<nextDial))return false;
   nextDial=now()+RETRY;
   try{
    const c=peer.connect(peerId(),{reliable:true,serialization:'binary',metadata:{protocol:PROTOCOL,autoChessMode:mode}});
    if(!c)return false;dial=c;bind(c,generation);return true;
   }catch(_){return false;}
  }
  function openPeer(ticket){
   const config=peerProfile(mode);
   relayConfigured=mode==='lan'||config.config.iceServers.some(server=>[server.urls].flat().some(url=>/^turns?:/i.test(url)));
   const instance=options.makePeer?options.makePeer(ownsRoom()?peerId():undefined,config):new host.Peer(ownsRoom()?peerId():undefined,config);
   peer=instance;opened=false;
   const valid=()=>active&&ticket===generation&&peer===instance;
   instance.on('open',()=>{if(!valid())return;opened=true;if(ownsRoom()){ready=true;activated=true;update('Invite code ready · friends can join before Start');}else if(!usable(upstream))tryDial(true);});
   instance.on('connection',c=>{
    if(!valid()||!ownsRoom()||(c.metadata?.protocol!==PROTOCOL||c.metadata.autoChessMode!==mode)){c.close();return;}
    bind(c,ticket);
   });
   instance.on('disconnected',()=>{if(valid()){opened=false;nextSignal=0;if(ownsRoom()&&!match){ready=false;update('Invite signaling interrupted. Existing peer links stay connected.');}}});
   instance.on('error',e=>{
    if(!valid())return;
    if(!ownsRoom()&&e?.type==='peer-unavailable'&&dial){drop(dial,false);return;}
    if(e?.type==='unavailable-id'&&ownsRoom()&&!match&&!ready){room=newCode(mode);void connect();return;}
    if(!match&&!usable(upstream)&&!ownsRoom())update('Waiting for the host’s peer link…');
   });
  }
  function networkTick(){
   if(!active)return;const t=now();
   if(joining&&mode==='lan'&&t-startedAt>=DIRECT_WAIT)offerRelay('No direct link yet. Try Online Relay if your Wi-Fi isolates devices.');
   for(const [c,entry] of channels){
    peerState(entry);
    if(c!==upstream&&!entry.seat&&t-entry.born>=HANDSHAKE_WAIT)drop(c,false);
    if(ownsRoom()&&mode==='lan'&&!entry.seat&&t-entry.born>=DIRECT_WAIT)offerRelay('A guest could not establish a direct link. Try Online Relay if Wi-Fi isolates devices.');
   }
   for(const [uid,s]of seats){
    if(!s.up&&s.downSince!==null&&!s.offline&&t-s.downSince>=OFFLINE_GRACE){
     s.offline=true;
     if(match)listener?.presence(uid,'offline');else{if(s.conn)drop(s.conn,false);seats.delete(uid);members=members.filter(m=>m.uid!==uid);lobbySync();}
    }
   }
   if(!match&&!activated&&startedAt&&t-startedAt>=HANDSHAKE_WAIT){fail('Invite connection timed out');return;}
   if(peer&&t>=nextSignal){
    if(peer.destroyed){nextSignal=t+RETRY;try{openPeer(generation);}catch(_){}}
    else if(peer.disconnected){nextSignal=t+RETRY;try{peer.reconnect?.();}catch(_){}}
   }
   if(!ownsRoom()&&!usable(upstream))tryDial();
  }
  async function connect(code=null){
   disposeNetwork();const ticket=generation;joinCode=code;token=code?U.token(16):'';joinCodeForFallback=null;startedAt=now();joining=!!code;activated=false;lanFallback=false;
   if(code){room=code;owner='';members=[me];}
   update(code?'Joining invite room…':'Preparing invite code…');
   try{
    await U.loadSdk('peerJsCdn',()=>typeof host.Peer==='function');
    if(active&&!match&&ticket===generation)openPeer(ticket);
   }catch(_){if(ticket===generation)fail('Invite signaling is unavailable');}
  }
  function join(value){
   if(!active||match)return false;const code=String(value||'').trim().toUpperCase();
   if(!/^(?:AC|AL)-[A-F0-9]{12}$/.test(code)){update('Enter an AC- or AL- room code.');return false;}
   if(code===room&&ownsRoom()){update('This is your room code. Share it with friends.');return false;}
   prefer(modeOf(code));void connect(code);return true;
  }
  function setMode(next){
   if(!active||match||!['lan','relay'].includes(next)||next===mode)return false;
   const target=joinCode||joinCodeForFallback;prefer(next);
   if(target){void connect(codeFor(target,next));return true;}
   room=codeFor(room,next);owner=me.uid;members=[me];void connect();return true;
  }
  function link(isHost){
   return {isHost,self:me.uid,owner,mode,status:linkStatus,
    send(payload){const data={matchId:match.matchId,payload};return isHost?broadcast('LIVE',data):send(upstream,'LIVE',data);},
    target(uid,payload){return isHost&&send(seats.get(uid)?.conn,'LIVE',{matchId:match.matchId,payload});},
    reconnect(){if(ownsRoom())return false;if(peer?.disconnected){try{peer.reconnect?.();}catch(_){}}return tryDial(true);},
    subscribe(handlers){
     listener=handlers;for(const args of inbox.splice(0))handlers.receive(...args);
     if(isHost)for(const [uid,s]of seats)if(!s.up)handlers.presence(uid,s.offline?'offline':'reconnecting');
     return()=>{if(listener===handlers)listener=null;};
    },close};
  }
  function start(){
   if(!active||match||!ownsRoom())return false;
   match={seed:host.crypto.getRandomValues(new Uint32Array(1))[0]||1,roster:C.clone(members),room,matchId:'chess_'+Date.now().toString(36)+'_'+U.token(4)};
   broadcast('START',{match});options.onStart?.({...match,link:members.length>1?link(true):null});if(members.length===1)close();return true;
  }
  const timer=host.setInterval(networkTick,500);
  function available(){nextDial=nextSignal=0;networkTick();}
  host.addEventListener?.('online',available);
  function close(){if(!active)return;active=false;host.clearInterval(timer);host.removeEventListener?.('online',available);listener=null;disposeNetwork();}
  void connect();
  return{view,join,setMode,start,close,refreshInvite(){if(active&&!match&&ownsRoom()&&!ready)void connect();}};
 }
 host.addEventListener?.('cloud-session-ready',()=>syncPending());
 host.addEventListener?.('online',()=>syncPending());
 host.AutoChessOnline=Object.freeze({CACHE_KEY,CACHE_TTL,identity,cached,distinct,seed,beginRun,endRun:id=>running.delete(id),get inMatch(){return running.size>0;},prepareRound,record,finish,replay,uploadStatus,syncPending,connectionLabel,createLobby,configure(options={}){backendOverride=options.backend||null;}});
})(window);
