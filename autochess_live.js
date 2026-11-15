/* Persistent PeerJS star: host owns economy, RNG, clock, lock-in and settlement.
   Clients send ordered intents, never editable stats or claimed combat outcomes. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,B=host.AutoChessBots,A=host.AutoChessAugments,T=host.AutoChessTelemetry;
 const links=new Map(),MAX_BYTES=2*1024*1024,CHUNK=14000;
 function seed(s,packet){
  const me=host.AutoChessOnline.identity(),roster=packet.roster;
  s.id=packet.matchId;s.localPlayerId=s.players[roster.findIndex(m=>m.uid===me.uid)]?.id||'human';
  s.live={version:1,room:packet.room,owner:roster[0].uid,humans:roster.map((m,i)=>({id:s.players[i].id,uid:m.uid,connected:true})),ready:{},locked:false};
  s.hybrid={version:1,uid:me.uid,room:packet.room,humanPlayers:roster.length,mode:'live',runs:{},stages:{},readRequested:false,queryCount:0,writeAttempted:false,writeCount:0,cloudStatus:'local'};
  for(const [i,m]of roster.entries()){const p=s.players[i];p.name=host.AutoChessRuns.name(m.name);p.bot=false;p.source={kind:'live-human',uid:m.uid};}
  const used=new Set(roster.map(m=>m.uid));let slot=roster.length;
  for(const wire of host.AutoChessOnline.distinct(host.AutoChessOnline.cached()||[],me.uid)){if(slot>=8||used.has(wire.uid))continue;used.add(wire.uid);const p=s.players[slot++];p.name=wire.name;p.source={kind:'recorded',uid:wire.uid};s.hybrid.runs[p.id]=wire;}
  if(packet.link)links.set(s.id,packet.link);return s;
 }
 const stage=s=>C.label(s)+'/'+s.phase;
 function createSession(initial,options={}){
  let state=C.clone(initial),link=links.get(state.id),authority=!!link?.isHost,base=null,settlement=null,disposed=false,closed=false,dirty=true,elapsed=0,last=host.performance.now(),pulseAt=0,stateAt=0,lastPhase='',seq=0,commandSeq=0,received=-1,barrier=null,allowCombat=false,startAt=0,manifest=null,jobs=[],worker=null,hostTime=0,lastPacket=Date.now(),unsubscribe=null,arrival=0;
  const local=state.localPlayerId,seen=new Map(),lastSeen=new Map(),assemblies=new Map();
  const error=message=>options.onError?.(message),now=()=>Date.now(),living=()=>state.live.humans.filter(h=>h.connected&&C.get(state,h.id).hp>0&&C.get(state,h.id).rank===null);
  const getState=()=>base?.state||settlement?.state||state;
  function disposeFights(){for(const j of jobs)j.combat.dispose();jobs=[];worker?.dispose();worker=null;}
  function safeSend(message,uid=null){
   if(!link||disposed)return;const text=JSON.stringify(message);if(text.length>MAX_BYTES){error('Live snapshot too large.');return;}
   const deliver=data=>uid?link.target(uid,data):link.send(data);
   if(text.length<=CHUNK)deliver(message);else{const id=++arrival,n=Math.ceil(text.length/CHUNK);for(let i=0;i<n;i++)deliver({type:'fragment',id,n,i,text:text.slice(i*CHUNK,(i+1)*CHUNK)});}
  }
  function publicState(full=false){const s=getState(),{matchStats,hybrid,...body}=s,out=C.clone(body);out.hybrid={...hybrid,stages:{}};if(full)out.matchStats=C.clone(matchStats);delete out.localPlayerId;delete out.reward;delete out.finishReason;out.paid=false;out.hybrid={...out.hybrid,stages:{},uid:'shared',readRequested:true,writeAttempted:false};if(!full)delete out.matchStats;return out;}
  function publish(full=false,uid=null){if(!authority)return;state=getState();safeSend({type:'state',seq:++seq,state:publicState(full),manifest,at:now()},uid);stateAt=elapsed;dirty=false;}
  function disconnect(uid){
   if(disposed)return;if(!authority){closed=true;error('Host connection lost. Waiting for host authority; no local result or Elo will be fabricated.');return;}
   const h=state.live.humans.find(h=>h.uid===uid);if(!h||!h.connected||uid===link.self)return;h.connected=false;const p=C.get(state,h.id);p.bot=true;p.source={...p.source,kind:'disconnected-ai'};delete state.live.ready[h.id];barrier?.pending.delete(uid);state.revision++;dirty=true;
  }
  function input(uid,message){
   state=getState();const h=state.live.humans.find(h=>h.uid===uid);if(!h||!h.connected)return;
   lastSeen.set(uid,now());
   if(message.type==='attach'){publish(true,uid);return;}
   if(message.type==='pong')return;
   if(message.type==='locked'){if(barrier&&message.token===barrier.token&&message.seq===(seen.get(uid)||0)){const p=C.get(state,h.id);state.live.lockHashes ||= {};state.live.lockHashes[h.id]=C.seedOf(JSON.stringify({units:p.units,level:p.level,hp:p.hp,augments:p.augments}));barrier.pending.delete(uid);}return;}
   if(message.type!=='intent'||!Number.isSafeInteger(message.seq)||message.seq<1||message.seq<=(seen.get(uid)||0))return;
   seen.set(uid,message.seq);const p=C.get(state,h.id);
   if(message.stage!==C.label(state)||message.phase!==state.phase||state.finished||p.hp<=0||barrier&&!barrier.pending.has(uid))return;
   try{
    if(message.action?.type==='ready'){
     if(state.phase!=='planning'||barrier)return;state.live.ready[p.id]=!state.live.ready[p.id];state.revision++;dirty=true;
    }else if(message.action?.type==='draft'||message.action?.type==='augmentPick'||message.action?.type==='augmentReroll'||state.phase==='planning'||state.phase==='carousel'){
     if(!message.action||JSON.stringify(message.action).length>2048)return;
     if(!base.dispatchFor(p.id,message.action))return;state=base.state;delete state.live.ready[p.id];dirty=true;
    }
   }catch(e){error(e.message);}
   safeSend({type:'ack',seq:message.seq},uid);
  }
  function startBarrier(){
   if(allowCombat)return true;if(barrier)return false;
   barrier={token:C.label(state)+'/'+(++arrival),pending:new Set(living().filter(h=>h.uid!==link.self).map(h=>h.uid)),until:now()+3000};
   state.live.locked=true;state.revision++;publish();safeSend({type:'lock',token:barrier.token});return false;
  }
  function openManifest(){
   const key=C.label(state);manifest={key,roundSeed:state.roundSeed,pairs:C.clone(state.pairs),startsAt:now()+600};startAt=manifest.startsAt;
   state.live.ready={};state.live.locked=false;state.live.lockHashes ||= {};const own=C.get(state);state.live.lockHashes[own.id]=C.seedOf(JSON.stringify({units:own.units,level:own.level,hp:own.hp,augments:own.augments}));host.AutoChessOnline.record(state);publish(true);
  }
  function makeVisuals(){
   if(!manifest||state.phase!=='combat'||jobs[0]?.key===manifest.key)return;disposeFights();
   const kind=C.roundKind(state),rows=['creep','boss'].includes(kind)?C.alive(state).map(p=>({a:p.id,b:'creeps',ghost:true,creep:true,boss:kind==='boss'})):manifest.pairs;
   try{if(options.worker&&host.Worker)worker=host.AutoChessCombat.createWorkerPool();}catch(_){}
   jobs=rows.map((row,i)=>{const args=[C.get(state,row.a),C.get(state,row.b),C.seedOf(manifest.roundSeed,row.a,row.b,i),{creep:row.creep,boss:row.boss,stage:state.stage}],combat=worker?host.AutoChessCombat.remoteCombat(worker,...args):host.AutoChessCombat.create(...args);return{...row,key:manifest.key,combat,target:0};});
  }
  function localise(shared){
   const ownHybrid=getState().hybrid;
   const next={...shared,localPlayerId:local,hybrid:{...ownHybrid,runs:shared.hybrid.runs,mode:'live',humanPlayers:shared.live.humans.length},rankedStart:initial.rankedStart};
   if(!next.matchStats)next.matchStats=state.matchStats;
   if(!C.validate(next))return null;return next;
  }
  function receive(message,uid){
   if(disposed||!message||typeof message!=='object')return;
   if(message.type==='fragment'){
    if(!Number.isInteger(message.n)||message.n<1||message.n>160||!Number.isInteger(message.i)||message.i<0||message.i>=message.n||typeof message.text!=='string'||message.text.length>CHUNK)return;
    const key=uid+'/'+message.id;let a=assemblies.get(key);if(!a){if(assemblies.size>=4)return;a={n:message.n,rows:Array(message.n),at:now(),bytes:0};assemblies.set(key,a);}if(a.n!==message.n||a.rows[message.i]!==undefined)return;a.rows[message.i]=message.text;a.bytes+=message.text.length;
    if(a.bytes>MAX_BYTES){assemblies.delete(key);return;}if(a.rows.filter(x=>x!==undefined).length===a.n){assemblies.delete(key);try{receive(JSON.parse(a.rows.join('')),uid);}catch(_){}}return;
   }
   if(authority){input(uid,message);return;}if(uid!==state.live.owner)return;lastPacket=now();closed=false;
   if(message.type==='state'){
    if(!Number.isSafeInteger(message.seq)||message.seq<=received||message.state?.id!==state.id||message.state?.live?.owner!==state.live.owner)return;
    const next=localise(message.state);if(!next)return;received=message.seq;state=next;manifest=message.manifest;hostTime=message.at;
    if(state.phase==='combat'){makeVisuals();host.AutoChessOnline.record(state);}else disposeFights();
    if(state.finished){state.finishReason=C.get(state).rank===1?'victory':'eliminated';settleLocal();}else C.save(state);options.onChange?.();
   }else if(message.type==='pulse'){
    hostTime=message.at;if(message.key===C.label(state)&&message.phase===state.phase){state.remaining=message.remaining;state.live.ready=message.ready;for(const j of jobs)j.target=message.times?.[j.a+'/'+j.b]||0;}
    safeSend({type:'pong'});
   }else if(message.type==='lock'){
    state.live.locked=true;const p=C.get(state);safeSend({type:'locked',token:message.token,seq:commandSeq,snapshot:{units:C.clone(p.units),level:p.level,hp:p.hp,augments:[...p.augments],synergies:host.AutoChessSynergies.analyze(C.deployed(p),A.traits(p)).filter(r=>r.tier).map(r=>({id:r.id,count:r.count,tier:r.tier}))}});options.onChange?.();
   }
  }
  function settleLocal(){
   if(settlement)return;disposeFights();state.localPlayerId=local;delete state.reward;state.paid=false;state.finishReason=C.get(state).rank===1?'victory':'eliminated';
   settlement=host.AutoChessCombat.createSession(state,{...options,authority:true});state=settlement.state;
  }
  function command(action){
   state=getState();if(disposed||closed||state.finished||state.live.locked||C.get(state).hp<=0)return false;
   const message={type:'intent',seq:++commandSeq,stage:C.label(state),phase:state.phase,action};
   if(authority)input(link.self,message);else safeSend(message);return true;
  }
  function loop(){
   if(disposed)return;const stamp=host.performance.now(),dt=Math.min(.5,Math.max(0,(stamp-last)/1000));last=stamp;elapsed+=dt;state=getState();
   for(const [key,a]of assemblies)if(now()-a.at>5000)assemblies.delete(key);
   if(authority){
    for(const h of state.live.humans)if(h.uid!==link.self&&h.connected&&now()-(lastSeen.get(h.uid)||lastPacket)>10000)disconnect(h.uid);
    if(!state.finished){
     if(barrier){if(!barrier.pending.size||now()>=barrier.until){for(const uid of barrier.pending)disconnect(uid);barrier=null;allowCombat=true;base.startCombat();allowCombat=false;state=base.state;if(state.phase==='combat')openManifest();}}
     else if(state.phase==='planning'&&living().every(h=>state.live.ready[h.id]))base.startCombat();
     if(!barrier&&now()>=startAt)base.tick(dt);
     state=base.state;if(state.phase==='combat'&&lastPhase!=='combat'&&manifest?.key!==C.label(state))openManifest();
     if(state.phase!=='planning')state.live.ready={};
    }
    const phase=stage(state);if(phase!==lastPhase){lastPhase=phase;if(state.phase!=='combat')manifest=null;publish(true);}else if(dirty&&elapsed-stateAt>=.1||elapsed-stateAt>=1)publish(false);
    if(elapsed-pulseAt>=.25){pulseAt=elapsed;const times={};for(const p of state.players){const fight=base.combatFor(p.id),pair=state.pairs.find(j=>j.a===p.id);if(pair)times[pair.a+'/'+pair.b]=fight?.time||0;else if(['creep','boss'].includes(C.roundKind(state)))times[p.id+'/creeps']=fight?.time||0;}safeSend({type:'pulse',key:C.label(state),phase:state.phase,remaining:state.remaining,ready:state.live.ready,times,at:now()});}
   }else{
    if(now()-lastPacket>10000&&!state.finished&&!closed){closed=true;error('Waiting for host connection. The shared match is paused on this client.');}
    for(const j of jobs){const n=Math.max(0,j.target-j.combat.time);if(n>0)j.combat.step(Math.min(.5,n));j.combat.interpolate(dt);}
   }
  }
  if(link){
   links.delete(state.id);
   if(authority){state.localPlayerId='human';base=host.AutoChessCombat.createSession(state,{...options,authority:true,beforeCombat:startBarrier,onChange:()=>{dirty=true;options.onChange?.();},onFinalized:s=>{state=s;publish(true);options.onFinalized?.(s);}});state=base.state;for(const h of state.live.humans)lastSeen.set(h.uid,now());}
   unsubscribe=link.subscribe(receive,disconnect);if(authority)publish(true);else safeSend({type:'attach'});
  }else{closed=true;error('Live room connection is unavailable. Resume with the original host connection.');}
  const timer=host.setInterval(loop,50);
  return{get state(){return getState();},get speed(){return 1;},set speed(v){},get workerCount(){return base?.workerCount||worker?.size||0;},get combat(){return base?.combatFor(local)||jobs.find(j=>j.a===local||!j.ghost&&j.b===local)?.combat||jobs[0]?.combat;},get connectionLost(){return closed;},dispatch:command,ready:()=>command({type:'ready'}),tick(){},claim:()=>base?.claim()||settlement?.claim()||false,forfeit(){error('Live matches continue to one champion.');return false;},checkpoint:()=>C.save(getState()),combatFor(id){return base?.combatFor(id)||jobs.find(j=>j.a===id||!j.ghost&&j.b===id)?.combat||null;},opponentLabel(id){if(closed)return 'Waiting for host connection';if(base)return base.opponentLabel(id);const j=jobs.find(j=>j.a===id||!j.ghost&&j.b===id);return j?'VS '+(C.get(state,j.a===id?j.b:j.a)?.name||'Arcane Guardians'):'Live synchronized · '+state.phase;},dispose(){if(disposed)return;disposed=true;host.clearInterval(timer);unsubscribe?.();link?.close();base?.dispose();settlement?.dispose();disposeFights();assemblies.clear();}};
 }
 host.AutoChessLive=Object.freeze({seed,createSession});
})(window);
