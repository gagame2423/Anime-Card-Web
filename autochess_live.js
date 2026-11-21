/* The host commits every phase and action. Peers render its state and submit
   intents; acknowledgements and local combat playback never drive the match. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem;
 const links=new Map(),HEARTBEAT=5000,RETRY_SYNC=10000;
 const epoch=host.performance.timeOrigin||Date.now()-host.performance.now();
 const clock=()=>epoch+host.performance.now();
 function seed(s,packet){
  const roster=packet.roster,link=packet.link,uid=link?.self||host.AutoChessOnline.identity().uid;
  s.id=packet.matchId;s.localPlayerId=s.players[roster.findIndex(m=>m.uid===uid)]?.id||'human';
  s.live={version:1,mode:link?.mode==='lan'?'lan':'relay',room:packet.room,owner:roster[0].uid,humans:roster.map((m,i)=>({id:s.players[i].id,uid:m.uid,connected:true,reconnecting:false})),ready:{}};
  s.hybrid={version:1,uid,room:packet.room,humanPlayers:roster.length,mode:'live',runs:{},stages:{},readRequested:false,queryCount:0,writeAttempted:false,writeCount:0,cloudStatus:'local'};
  for(const [i,m]of roster.entries()){const p=s.players[i];p.name=host.AutoChessRuns.name(m.name);p.bot=false;p.hextechUnlocks=[...(m.hextechUnlocks||[])];p.equippedSkins={...m.equippedSkins};p.mimicPool=[...(m.mimicPool||[])];p.source={kind:'live-human',uid:m.uid};}
  if(link?.isHost){
   const used=new Set(roster.map(m=>m.uid));let slot=roster.length;
   for(const wire of host.AutoChessOnline.distinct(host.AutoChessOnline.cached()||[],uid)){
    if(slot>=8||used.has(wire.uid))continue;
    used.add(wire.uid);const p=s.players[slot++];p.name=wire.name;p.source={kind:'recorded',uid:wire.uid};s.hybrid.runs[p.id]=wire;
   }
  }
  C.carousel(s);if(link)links.set(s.id,link);return s;
 }

 // State is plain game data. Only device-local saving/rewards and clocks
 // derived from the phase epoch stay out of the shared sections.
 const byId=rows=>Object.fromEntries(rows.map(row=>[row.id,row]));
 function sections(s){
  const {localPlayerId,reward,paid,finishReason,rankedStart,hybrid,remaining,revision,players,matchStats,carousel,draftOrder,draftWave,draftPlan,draftElapsed,...game}=s;
  const {tacticians,...report}=matchStats;
  return {game,players:byId(players),report,tacticians,draftState:{carousel,draftOrder,draftWave,draftPlan,draftElapsed},recordedRuns:hybrid.runs};
 }
 // Plain data retains shared references as values, while non-data and cycles
 // are ignored at the JSON boundary. Sizes never decide what gets sent.
 function wireValue(value){
  const parents=[];
  return JSON.stringify(value,function(key,row){
   if(typeof row==='function'||typeof host.Node==='function'&&row instanceof host.Node)return undefined;
   if(!row||typeof row!=='object')return row;
   while(parents.length&&parents.at(-1)!==this)parents.pop();
   if(parents.includes(row))return undefined;
   parents.push(row);return row;
  });
 }
 // Compare each section by its data and reuse unchanged entries. A stored
 // patch always replaces a whole changed record, including every Relic roll.
 function capture(state,previous){
  const snapshot={},encoded={},patch={};
  for(const [section,fields]of Object.entries(sections(state))){
   const old=previous?.encoded[section],rows=new Map(),stamps=new Map(),changed=[];
   for(const [key,value]of Object.entries(fields)){
    const text=wireValue(value);if(text===undefined)continue;
    stamps.set(key,text);
    if(old?.get(key)===text)rows.set(key,previous.snapshot[section][key]);
    else{const data=JSON.parse(text);rows.set(key,data);changed.push([key,data]);}
   }
   if(old)for(const key of old.keys())if(!stamps.has(key))changed.push([key]);
   snapshot[section]=Object.fromEntries(rows);encoded[section]=stamps;
   if(changed.length)patch[section]=changed;
  }
  return {snapshot,encoded,patch};
 }
 function merge(previous,patch){
  const out={...previous};
  for(const [key,rows] of Object.entries(patch)){
   if(!Object.hasOwn(previous,key)||!Array.isArray(rows))throw Error('Invalid live state patch.');
   const fields=new Map(Object.entries(previous[key]));
   for(const [name,value] of rows){if(value===undefined)fields.delete(name);else fields.set(name,value);}
   out[key]=Object.fromEntries(fields);
  }
  return out;
 }
 function cleanAction(action){
  if(!action||typeof action.type!=='string')return null;const {type,index,uid,where,relicId,a,b,ids}=action;
  if(['xp','refresh','lock','autoFuse','ready','advanceResults'].includes(type))return{type};
  if(['buy','augmentPick','augmentReroll'].includes(type))return Number.isInteger(index)?{type,index}:null;
  if(['sell','anvil','keep','unequip','draft'].includes(type))return typeof uid==='string'?{type,uid}:null;
  if(type==='move'&&typeof uid==='string'&&['board','bench'].includes(where)&&Number.isInteger(index))return{type,uid,where,index};
  if(type==='equip'&&typeof uid==='string'&&typeof relicId==='string')return{type,uid,relicId};
  if(type==='relicFuse'&&typeof a==='string'&&typeof b==='string')return{type,a,b};
  if(type==='fuse'&&(ids===undefined||Array.isArray(ids)&&ids.length===3&&ids.every(id=>typeof id==='string')))return{type,ids};
  return null;
 }
 function createSession(initial,options={}){
  const link=links.get(initial.id),authority=!!link?.isHost,local=initial.localPlayerId;
  links.delete(initial.id);
  let state=C.clone(initial),base=null,settlement=null,disposed=false,unsubscribe=null;
  let phaseKey='',phaseId=0,seq=0,manifest=null,lastShared=null,dirty=true,commandSeq=0;
  let replica=null,received=-1,syncing=!authority,lastPing=-Infinity,lastPacket=clock(),syncRequestedAt=-Infinity,needSync=!authority;
  let hostClock=0,clockReadAt=clock(),clockSample=-Infinity,halfRtt=0;
  let last=clock(),jobs=[],worker=null,visualPhase=0;
  const commandOrder=new Map();
  const getState=()=>base?.state||settlement?.state||state;
  const warn=text=>options.onError?.(text);
  const send=(message,uid)=>uid?link?.target(uid,message):link?.send(message);
  function frame(type){
   return {type,seq,phase:state.phase,round:C.label(state),phaseId,startsAtMs:state.live.startsAtMs,deadlineMs:state.live.deadlineMs,hostNowMs:clock(),revision:state.revision};
  }
  function beginPhase(key){
   phaseKey=key;phaseId++;
   const startsAtMs=clock(),duration=state.phase==='combat'?host.AutoChessCombat.LIMIT:state.phase==='complete'?0:state.remaining;
   Object.assign(state.live,{phaseId,startsAtMs,deadlineMs:startsAtMs+duration*1000});
   if(state.phase==='combat'){
    const kind=C.roundKind(state);
    const fights=['creep','boss'].includes(kind)?C.alive(state).map(p=>({a:p.id,b:'creeps',ghost:true,creep:true,boss:kind==='boss'})):C.clone(state.pairs);
    manifest={roundSeed:state.roundSeed,fights};
   }else{C.clearLiveRound(state);manifest=null;}
  }
  function flush(){
   if(!authority||!base||disposed)return false;
   state=base.state;
   const key=C.label(state)+'/'+state.phase,transition=key!==phaseKey;
   if(!transition&&!dirty)return false;
   if(transition)beginPhase(key);
   const {patch,...next}=capture(state,transition?null:lastShared);
   dirty=false;
   if(!transition&&!Object.keys(patch).length)return false;
   const from=seq++;
   lastShared=next;
   if(transition)send({...frame('FULL_SYNC'),snapshot:lastShared.snapshot,manifest});
   else send({...frame('STATE'),baseSeq:from,patch});
   return true;
  }
  function syncPeer(uid=null){
   flush();
   if(lastShared)return send({...frame('FULL_SYNC'),snapshot:lastShared.snapshot,manifest},uid);
   return false;
  }
  function presence(uid,status){
   if(disposed)return;
   if(!authority){
    if(status==='linked'){lastPacket=clock();requestSync();}
    else{
     syncing=needSync=true;
     if(status==='attached')lastPacket=syncRequestedAt=clock();
     options.onChange?.();
    }
    return;
   }
   state=base.state;
   const h=state.live.humans.find(h=>h.uid===uid);if(!h||uid===link.self)return;
   const p=C.get(state,h.id),wasOffline=!h.connected,reconnecting=status==='reconnecting',offline=status==='offline';
   if(h.reconnecting!==reconnecting||wasOffline!==offline){
    h.connected=!offline;h.reconnecting=reconnecting;p.bot=offline;p.source={...p.source,kind:offline?'disconnected-ai':'live-human'};
    if(offline||wasOffline)delete state.live.ready[h.id];
    state.revision++;dirty=true;flush();options.onChange?.();
   }
   if(status==='linked')syncPeer(uid);
  }
  function reject(uid,message){
   if(uid===link.self)warn(message);else send({type:'NOTICE',message},uid);
  }
  function input(uid,message){
   const h=state.live.humans.find(h=>h.uid===uid);
   if(!h)return false;
   if(message.type==='PING'){send({...frame('PONG'),echo:message.sentAt},uid);return true;}
   if(message.type==='SYNC_REQUEST'){syncPeer(uid);return true;}
   if(message.type==='LEAVE'){presence(uid,'offline');return true;}
   if(message.type!=='INTENT'||!Number.isSafeInteger(message.seq)||message.seq<1||message.seq<=(commandOrder.get(uid)||0))return false;
   commandOrder.set(uid,message.seq);
   flush();state=base.state;const p=C.get(state,h.id),action=cleanAction(message.action);
   if(message.phaseId!==phaseId){reject(uid,'That phase has ended. Your view has been refreshed.');if(uid!==link.self)syncPeer(uid);return false;}
   if(!action||state.finished||p.hp<=0||!h.connected)return false;
   if(action.type==='ready'){
    if(state.phase!=='planning')return false;
    state.live.ready[p.id]=!state.live.ready[p.id];state.revision++;dirty=true;
   }else if(action.type==='advanceResults'){
    if(uid!==link.self||!base.advanceResults())return false;
   }else{
    if(!base.dispatchFor(p.id,action,e=>reject(uid,e.message)))return false;
    state=base.state;delete state.live.ready[p.id];
   }
   flush();options.onChange?.();return true;
  }
  function requestSync(){
   if(disposed||authority||!link)return false;
   syncing=needSync=true;syncRequestedAt=clock();
   if(!send({type:'SYNC_REQUEST',phaseId,seq:received}))link.reconnect();
   options.onChange?.();return true;
  }
  function reconcile(){
   if(!authority)return requestSync();
   syncPeer();return true;
  }
  function sampleClock(hostMs,echo){
   if(!Number.isFinite(hostMs)||hostMs<clockSample)return;
   const now=clock();
   if(Number.isFinite(echo)&&echo<=now)halfRtt=(now-echo)/2;
   clockSample=hostMs;hostClock=hostMs+halfRtt;clockReadAt=now;
  }
  const hostNow=()=>hostClock+clock()-clockReadAt;
  function disposeFights(){
   for(const job of jobs)job.combat.dispose();
   jobs=[];worker?.dispose();worker=null;visualPhase=0;
  }
  function makeVisuals(){
   if(state.phase!=='combat'||!manifest||visualPhase===phaseId)return;
   disposeFights();visualPhase=phaseId;
   try{if(options.worker&&host.Worker)worker=host.AutoChessCombat.createWorkerPool();}catch(_){}
   for(const [i,row]of manifest.fights.entries()){
    const args=[C.get(state,row.a),C.get(state,row.b),C.seedOf(manifest.roundSeed,row.a,row.b,i),{creep:row.creep,boss:row.boss,stage:state.stage}];
    try{const combat=worker?host.AutoChessCombat.remoteCombat(worker,...args):host.AutoChessCombat.create(...args);jobs.push({...row,combat});}
    catch(_){/* Visual playback failure cannot change the host outcome. */}
   }
  }
  function applyShared(message){
   const full=message.type==='FULL_SYNC';
   if(!Number.isSafeInteger(message.seq)||message.seq<received||!Number.isSafeInteger(message.phaseId)||message.phaseId<phaseId||
    !Number.isFinite(message.startsAtMs)||!Number.isFinite(message.deadlineMs)||message.deadlineMs<message.startsAtMs||!Number.isFinite(message.hostNowMs))return;
   if(!full&&(message.seq===received||message.seq<=message.baseSeq))return;
   if(!full&&(needSync||message.baseSeq!==received||message.phaseId!==phaseId)){if(!needSync)requestSync();return;}
   try{
    const next=full?message.snapshot:merge(replica,message.patch);
    const {game,players,report,tacticians,draftState,recordedRuns}=next;
    if(game.id!==initial.id||game.live.owner!==initial.live.owner||game.phase!==message.phase||C.label(game)!==message.round||game.live.phaseId!==message.phaseId||
     game.live.startsAtMs!==message.startsAtMs||game.live.deadlineMs!==message.deadlineMs||
     initial.live.humans.some(h=>!game.live.humans.some(m=>m.id===h.id&&m.uid===h.uid)))throw Error('Invalid host phase state.');
    if(game.phase==='combat'&&full&&(!Array.isArray(message.manifest?.fights)||message.manifest.roundSeed!==game.roundSeed))throw Error('Missing host combat manifest.');
    sampleClock(message.hostNowMs);
    const previous=getState(),remaining=['combat','complete'].includes(game.phase)?0:Math.max(0,Math.min(35,(message.deadlineMs-hostNow())/1000));
    const nextState={...game,...draftState,players:Object.values(players),matchStats:{...report,tacticians},revision:message.revision,remaining,paid:false,localPlayerId:local,rankedStart:initial.rankedStart,
     hybrid:{...previous.hybrid,runs:recordedRuns}};
    if(!C.validate(nextState))throw Error('Invalid host game state.');
    const newPhase=phaseId!==message.phaseId;
    received=message.seq;phaseId=message.phaseId;replica=next;
    if(full){manifest=message.manifest;syncing=needSync=false;syncRequestedAt=-Infinity;}
    if(settlement){options.onChange?.();return;}
    state=nextState;
    if(state.phase==='combat'){makeVisuals();if(newPhase||!state.hybrid.stages[C.label(state)])host.AutoChessOnline.record(state);}
    else{disposeFights();if(state.phase==='results'&&!state.hybrid.stages[C.label(state)])host.AutoChessOnline.record(state);}
    if(state.finished){
     state.finishReason=C.get(state).rank===1?'victory':'eliminated';
     settlement=host.AutoChessCombat.createSession(state,{...options,authority:true});state=settlement.state;
    }
    options.onChange?.();
   }catch(_){
    warn('The host snapshot could not be applied. Resyncing without leaving the match.');
    if(clock()-syncRequestedAt>=HEARTBEAT)requestSync();else syncing=needSync=true;
   }
  }
  function receive(message,uid){
   if(disposed||!message||typeof message!=='object')return;
   if(authority){input(uid,message);return;}
   if(uid!==initial.live.owner)return;
   lastPacket=clock();
   if(message.type==='END'){abandon('host-left');return;}
   if(message.type==='FULL_SYNC'||message.type==='STATE')applyShared(message);
   else if(message.type==='NOTICE'&&typeof message.message==='string')warn(message.message);
   else if(message.type==='PING'||message.type==='PONG'){
    sampleClock(message.hostNowMs,message.echo);
    if(message.type==='PING')send({type:'PONG',echo:message.hostNowMs});
    if((message.seq>received||message.phaseId>phaseId)&&!needSync)requestSync();
   }
  }
  function command(action){
   const current=getState();if(disposed||!link||!authority&&needSync||current.finished||C.get(current).hp<=0)return false;
   const clean=cleanAction(action);if(!clean)return false;
   const message={type:'INTENT',seq:++commandSeq,phaseId,action:clean};
   if(authority)return input(link.self,message);
   if(send(message))return true;
   requestSync();return false;
  }
  function replay(dt){
   if(!manifest||!state.live.startsAtMs)return;
   const target=Math.max(0,(hostNow()-state.live.startsAtMs)/1000);
   for(const j of jobs){
    if(j.failed)continue;
    try{const gap=target-j.combat.time;if(gap>0)j.combat.step(Math.min(.5,gap));j.combat.interpolate(dt);}
    catch(_){j.failed=true;j.combat.dispose();}
   }
  }
  function loop(){
   if(disposed||!link)return;
   const now=clock(),dt=Math.min(.5,Math.max(0,(now-last)/1000));last=now;
   if(authority){
    state=base.state;
    if(!state.finished){
     if(state.phase==='planning'){
      const eligible=C.liveReadyHumans(state);
      if(eligible.length&&eligible.every(h=>state.live.ready[h.id]))base.startCombat();
     }
     state=base.state;const previousPhase=C.label(state)+'/'+state.phase;
     // Do not tick a new phase against the previous phase's deadline.
     if(previousPhase===phaseKey){
      if(state.phase!=='combat'&&state.live.deadlineMs){
       state.remaining=Math.min(state.remaining,Math.max(0,(state.live.deadlineMs-now)/1000)+dt);
       if(state.phase==='carousel')state.draftElapsed=Math.max(state.draftElapsed,(now-state.live.startsAtMs)/1000-dt);
      }
      const wave=state.draftWave;base.tick(dt);state=base.state;if(state.draftWave!==wave)dirty=true;
     }
    }
    flush();
    if(now-lastPing>=HEARTBEAT){lastPing=now;send(frame('PING'));}
   }else{
    if(!state.finished&&now-lastPing>=HEARTBEAT){lastPing=now;send({type:'PING',sentAt:now});}
    if(replica&&!state.finished&&state.phase!=='combat'){
     state.remaining=Math.max(0,Math.min(35,(state.live.deadlineMs-hostNow())/1000));
     if(state.phase==='carousel')state.draftElapsed=Math.max(0,(hostNow()-state.live.startsAtMs)/1000);
    }
    if(state.phase==='combat')replay(dt);
    if(!state.finished&&now-syncRequestedAt>=RETRY_SYNC){
     if(now-lastPacket>=RETRY_SYNC){link.reconnect();requestSync();}
     else if(needSync)requestSync();
    }
   }
  }
  if(link){
   if(authority){
    base=host.AutoChessCombat.createSession(state,{...options,authority:true,onChange:()=>{dirty=true;options.onChange?.();},onFinalized:s=>{dirty=true;flush();options.onFinalized?.(s);}});
    flush();
   }
   if(!authority)syncRequestedAt=clock();
   unsubscribe=link.subscribe({receive,presence,attached:uid=>syncPeer(uid)});
  }else host.queueMicrotask(()=>abandon('connection-unavailable'));
  const timer=host.setInterval(loop,50);
  function dispose(){
   if(disposed)return;disposed=true;host.clearInterval(timer);unsubscribe?.();link?.close();base?.dispose();settlement?.dispose();disposeFights();
  }
  function abandon(reason='left'){
   if(disposed)return false;state=getState();
   if(!state.finished){if(reason==='left')send({type:authority?'END':'LEAVE'});state.abandoned=true;C.purgeCheckpoint();}
   dispose();if(!['left','navigation'].includes(reason))options.onAbandon?.(reason);return true;
  }
  function combatFor(id){return base?.combatFor(id)||jobs.find(j=>!j.failed&&(j.a===id||!j.ghost&&j.b===id))?.combat||null;}
  return{
   get state(){return getState();},get speed(){return 1;},set speed(v){},
   get workerCount(){return base?.workerCount||worker?.size||0;},
   get combat(){return combatFor(local)||jobs.find(j=>!j.failed)?.combat;},
   get connectionLost(){return !authority&&(!link||needSync||link.status().state!=='linked');},
   get isHost(){return authority;},get connection(){const current=link?.status();return current&&{...current,syncing};},
   dispatch:command,ready:()=>command({type:authority&&getState().phase==='results'?'advanceResults':'ready'}),resync:reconcile,tick(){},
   claim:()=>base?.claim()||settlement?.claim()||false,abandon,forfeit:()=>abandon('left'),checkpoint:()=>C.save(getState()),combatFor,
   opponentLabel(id){
    if(!authority&&link?.status().state!=='linked')return 'Waiting for host connection';
    if(base)return base.opponentLabel(id);
    const j=jobs.find(j=>j.a===id||!j.ghost&&j.b===id);return j?'VS '+(C.get(state,j.a===id?j.b:j.a)?.name||'Arcane Guardians'):'Live synchronized · '+state.phase;
   },dispose
  };
 }
 host.AutoChessLive=Object.freeze({seed,createSession});
})(window);
