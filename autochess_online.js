/* Invite-only PeerJS lobby + one-query/one-set asynchronous recorded-run sync. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,R=host.AutoChessRuns,U=host.OnlineUtils;
 const CACHE_KEY='ac_ghost_pool_cache',CACHE_TTL=600000,ATTEMPTS_KEY='anime_card_rng_ac_run_uploads_v1',PROTOCOL='ac-live-2';
 let backendOverride=null;const uploadStatuses=new Map();
 function uploadStatus(id,value){if(value){uploadStatuses.set(id,value);if(uploadStatuses.size>32)uploadStatuses.delete(uploadStatuses.keys().next().value);}return uploadStatuses.get(id)||null;}
 const service=()=>backendOverride||host.CloudSaveSystem?.autoChessService||null;
 function identity(){const user=host.CloudSaveSystem?.activeUser;return{uid:user?.uid||'local_player',name:R.name(host.CloudSaveSystem?.publicName||'You'),elo:host.AutoChessRanked?.current()?.elo||0,wins:host.AutoChessRanked?.current()?.wins||0,run:R.last()};}
 function cached(){try{const data=JSON.parse(host.sessionStorage.getItem(CACHE_KEY)||'null');if(data?.version!==1||!Number.isFinite(data.at)||Date.now()-data.at<0||Date.now()-data.at>=CACHE_TTL||!Array.isArray(data.rows)||data.rows.length>8)return null;return data.rows.map(R.decode).filter(Boolean).map(r=>r.wire);}catch(_){return null;}}
 function storePool(rows){try{host.sessionStorage.setItem(CACHE_KEY,JSON.stringify({version:1,at:Date.now(),rows}));}catch(_){} }
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
  const id=initial.id,uid=initial.hybrid.uid,pool=cached();initial.hybrid.readRequested=true;initial.hybrid.cloudStatus=pool?'cached':'local';if(!C.save(initial))return;
  if(pool)return;
  const cloud=service();if(!cloud?.available||host.navigator.onLine===false)return;
  initial.hybrid.queryCount=1;if(!C.save(initial))return;
  // Start never awaits this request. Bots are playable immediately at Stage 1-1.
  Promise.resolve().then(()=>cloud.recentRuns()).then(rows=>{
   const valid=(rows||[]).map(R.decode).filter(Boolean).map(r=>r.wire).slice(0,8);storePool(valid);
   const s=getState();if(!s||s.id!==id||s.finished||s.hybrid.uid!==uid)return;
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
   if(snapshot.hp<=0){p.hp=0;ended.push(p);continue;}if(!snapshot.board.length)continue;
   p.hp=Math.min(p.hp,snapshot.hp);p.level=snapshot.level;p.xp=0;p.augments=[...snapshot.augments];p.units=[];p.anvil=[];p.relics=Array(10).fill(null);p.loot=[];
   for(const row of snapshot.board){const u=C.unit(s,C.card(row.cardId));u.board=row.position;u.bench=null;if(row.relic)u.relic={uid:'r'+(++s.serial),roll:C.clone(row.relic)};p.units.push(u);}
   p.replayStage=snapshot.stageKey;p.replaySynergies=snapshot.synergies;p.replaySampled=run.sampled;if(!p.hp)ended.push(p);
  }
  let rank=s.players.filter(p=>p.rank===null).length;for(const p of ended){p.rank=rank--;host.AutoChessTelemetry.snapshot(s,p);}
 }
 function record(s){R.record(s);}
 function finish(s){
  if(!s.hybrid||!s.finished||!s.paid||s.hybrid.writeAttempted||s.stage<2)return;
  R.record(s,true);const ranked=host.AutoChessRanked?.current()||{},payload=R.encode({uid:s.hybrid.uid,name:C.get(s).name,matchId:s.id,placement:C.get(s).rank,elo:ranked.elo||0,wins:ranked.wins||0},s.hybrid.stages);
  s.hybrid.writeAttempted=true;if(!payload){s.hybrid.cloudStatus='too-large';C.save(s);return;}
  R.save(payload);s.hybrid.payloadBytes=R.bytes(payload);
  const cloud=service();if(!cloud?.available||identity().uid!==s.hybrid.uid||host.navigator.onLine===false){s.hybrid.cloudStatus='local';C.save(s);return;}
  let attempts;try{attempts=JSON.parse(host.localStorage.getItem(ATTEMPTS_KEY)||'[]');if(!Array.isArray(attempts))attempts=[];const attemptKey=s.hybrid.uid+':'+s.id;if(attempts.includes(attemptKey)||!s.live&&attempts.includes(s.id)){C.save(s);return;}attempts.push(attemptKey);host.localStorage.setItem(ATTEMPTS_KEY,JSON.stringify(attempts.slice(-1024)));}catch(_){s.hybrid.cloudStatus='local';C.save(s);return;}
  s.hybrid.writeCount=1;s.hybrid.cloudStatus='uploading';C.save(s);
  // Fire-and-forget: rewards, summary and exit never wait on Firestore or retry it.
  const publishingUid=s.hybrid.uid,matchId=s.id;uploadStatus(matchId,'uploading');
  Promise.resolve().then(()=>cloud.publishRun(publishingUid,payload)).then(()=>uploadStatus(matchId,'published')).catch(()=>uploadStatus(matchId,'offline'));
 }
 function createLobby(options={}){
  const me=identity();if(me.run?.uid!==me.uid)me.run=null;
  let room='AC-'+U.token(6).toUpperCase(),owner=me.uid,members=[me],peer=null,upstream=null,connections=new Map(),active=true,started=false,ready=false,joining=false,generation=0,status='Preparing invite code…';const timers=new Set();let liveReceiver=null,liveClosed=null;const pendingLive=[];
  const later=(fn,ms)=>{const t=host.setTimeout(()=>{timers.delete(t);fn();},ms);timers.add(t);return t;};
  const view=()=>({room,owner,members:C.clone(members),self:me.uid,isHost:owner===me.uid,ready,joining,started,status});
  const update=message=>{if(message)status=message;if(active)options.onChange?.(view());};
  const validMember=x=>x&&R.uid(x.uid)&&typeof x.name==='string'&&x.name.length<=40&&Number.isSafeInteger(x.elo)&&x.elo>=0&&Number.isSafeInteger(x.wins)&&x.wins>=0&&(!x.run||R.decode(x.run)?.uid===x.uid);
  function send(c,type,data={}){if(c?.open)try{c.send({protocol:PROTOCOL,type,room,...data});}catch(_){}}
  function broadcast(type,data={}){for(const c of connections.values())send(c,type,data);}
  function rosterValid(rows){return Array.isArray(rows)&&rows.length>=1&&rows.length<=8&&rows.every(validMember)&&new Set(rows.map(r=>r.uid)).size===rows.length&&rows.some(r=>r.uid===me.uid);}
  function clearNetwork(){generation++;for(const t of timers)host.clearTimeout(t);timers.clear();for(const c of [...connections.values(),upstream].filter(Boolean)){c.removeAllListeners?.();try{c.close();}catch(_){}}connections.clear();upstream=null;try{peer?.destroy();}catch(_){}peer=null;ready=false;}
  function fail(message){if(!active||started)return;clearNetwork();joining=false;owner=me.uid;members=[me];room='AC-'+U.token(6).toUpperCase();update(message+' · Start solo is available.');}
  function acceptPacket(message,connection,isHost){
   if(!active||!message||message.protocol!==PROTOCOL||message.room!==room||R.bytes(message)>90000)return;
   if(started&&message.type==='live'){if(liveReceiver)liveReceiver(message.payload,connection.acUid||owner);else if(pendingLive.length<256)pendingLive.push([message.payload,connection.acUid||owner]);return;}
   if(isHost){
    if(message.type==='hello'){
     if(started||members.length>=8||!validMember(message.member)||members.some(m=>m.uid===message.member.uid)){send(connection,'error',{message:'Room is full, started, or this player already joined.'});connection.close();return;}
     connection.acUid=message.member.uid;members.push(message.member);broadcast('state',{owner,members});update('Invite room ready · '+members.length+'/8 players');
    }else if(message.type==='ackStart'){connection.acAcknowledged=true;}
   }else if(message.type==='state'&&!started){
    if(!rosterValid(message.members)||!message.members.some(m=>m.uid===message.owner))return;owner=message.owner;members=message.members;joining=false;ready=true;update('Joined · waiting for the host to Start');
   }else if(message.type==='start'&&!started){
    if(!rosterValid(message.roster)||!/^chess_[a-z0-9]+_[a-z0-9]+$/.test(message.matchId)||!Number.isSafeInteger(message.seed)||message.seed<1||message.seed>4294967295)return;
    started=true;joining=false;send(connection,'ackStart');options.onStart?.({seed:message.seed,roster:message.roster,room,matchId:message.matchId,link:link(false)});
   }else if(message.type==='error')fail(String(message.message||'Unable to join room.').slice(0,120));
  }
  async function connect(code=null){
   clearNetwork();const ticket=generation;joining=!!code;if(code){room=code;owner='';members=[me];}update(code?'Joining invite room…':'Preparing invite code…');
   try{
    await U.loadSdk('peerJsCdn',()=>typeof host.Peer==='function');if(!active||started||ticket!==generation)return;
    const isHost=!code;peer=options.makePeer?options.makePeer(isHost?'acr-'+room.toLowerCase():undefined):new host.Peer(isHost?'acr-'+room.toLowerCase():undefined,U.peerOptions());
    const timeout=later(()=>{if(!ready)fail('Invite service timed out');},12000);
    peer.on('open',()=>{if(ticket!==generation||!active||started)return;
     if(isHost){ready=true;host.clearTimeout(timeout);timers.delete(timeout);update('Invite code ready · friends can join before Start');}
     else{upstream=peer.connect('acr-'+room.toLowerCase(),{reliable:true,serialization:'json'});bind(upstream,false,ticket);upstream.on('open',()=>send(upstream,'hello',{member:me}));}
    });
    peer.on('connection',connection=>{if(ticket!==generation||!active||!isHost||started||connections.size>=7){connection.close();return;}connections.set(connection.peer,connection);bind(connection,true,ticket);later(()=>{if(!connection.acUid){connections.delete(connection.peer);connection.close();}},6000);});
    peer.on('error',()=>{if(ticket===generation)fail('Invite service unavailable');});
    peer.on('disconnected',()=>{if(ticket===generation&&!started)fail('Invite service disconnected');});
   }catch(_){if(ticket===generation)fail('Offline lobby');}
  }
  function bind(connection,isHost,ticket){
   connection.on('data',message=>{if(ticket!==generation)return;try{acceptPacket(message,connection,isHost);}catch(_){connection.close();}});
   connection.on('error',()=>{if(started)liveClosed?.(isHost?connection.acUid:owner);else if(!isHost&&ticket===generation)fail('Room connection failed');});
   connection.on('close',()=>{if(ticket!==generation)return;if(started){liveClosed?.(isHost?connection.acUid:owner);return;}if(isHost){connections.delete(connection.peer);members=members.filter(m=>m.uid!==connection.acUid);broadcast('state',{owner,members});update('Player left · '+members.length+'/8 players');}else fail('Host left the lobby');});
  }
  function join(value){if(started||!active)return false;const code=String(value||'').trim().toUpperCase();if(!/^AC-[A-F0-9]{12}$/.test(code)){update('Enter an invite code such as AC-012345ABCDEF');return false;}if(code===room&&owner===me.uid){update('This is your room code. Share it with friends.');return false;}void connect(code);return true;}
  function link(isHost){return{isHost,self:me.uid,owner,send(payload){if(isHost)broadcast('live',{payload});else send(upstream,'live',{payload});},target(uid,payload){if(!isHost)return;for(const c of connections.values())if(c.acUid===uid)send(c,'live',{payload});},subscribe(fn,closed){liveReceiver=fn;liveClosed=closed;for(const args of pendingLive.splice(0))fn(...args);return()=>{liveReceiver=null;liveClosed=null;};},close(){active=false;clearNetwork();}};}
  function start(){if(!active||started||owner!==me.uid)return false;started=true;const packet={seed:host.crypto.getRandomValues(new Uint32Array(1))[0]||1,roster:C.clone(members),room,matchId:'chess_'+Date.now().toString(36)+'_'+U.token(4)};broadcast('start',packet);options.onStart?.({...packet,link:members.length>1?link(true):null});if(members.length===1)later(clearNetwork,500);return true;}
  void connect();
  return{view,join,start,close(){active=false;clearNetwork();},refreshInvite(){if(!started&&!joining)void connect();}};
 }
 host.AutoChessOnline=Object.freeze({CACHE_KEY,CACHE_TTL,identity,cached,distinct,seed,beginRun,prepareRound,record,finish,replay,uploadStatus,createLobby,configure(options={}){backendOverride=options.backend||null;}});
})(window);
