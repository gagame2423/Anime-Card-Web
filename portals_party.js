/* Optional PeerJS co-op. Host clocks turns; every client verifies its own simulation. */
(function(host){
 'use strict';
 const U=host.OnlineUtils,R=host.PortalRules,P=()=>host.PortalsSystem,V=()=>host.PortalCombatView;
 const PROTOCOL='acr-portals-v1',CONNECT=U.PEER_CONNECT_TIMEOUT_MS;
 let peer=null,connections=new Map(),role='',room='',size=2,members=[],portal=null,localId='',phase='idle',revision=0,generation=0,signature='',queue=Promise.resolve(),attemptTimer=null,turnTimer=null,watchdog=null,ackTimer=null,pending=new Set(),hash='',seq=0,lastTurn=0,runId='',seed=0,busy=false;
 const name=value=>String(value||'Player').replace(/[\u0000-\u001f]/g,'').slice(0,40);
 const isHost=()=>role==='host';
 const self=()=>members.find(m=>m.id===localId),index=()=>members.findIndex(m=>m.id===localId);
 const quota=()=>R.slots(size,index());
 const readyToStart=()=>isHost()&&phase==='lobby'&&members.length===size&&members.every(m=>m.ready&&validWires(m.wires,R.slots(size,members.indexOf(m))));
 function update(message=''){P().partyChanged({portal,room,size,members:members.map(m=>({name:m.name,ready:m.ready})),connected:phase==='lobby',isHost:isHost(),canStart:readyToStart(),busy,hasPeer:Boolean(peer),message});}
 function clearAttempt(){if(attemptTimer!==null)host.clearTimeout(attemptTimer);attemptTimer=null;}
 function clearTimers(){clearAttempt();for(const timer of [turnTimer,ackTimer])if(timer!==null)host.clearTimeout(timer);turnTimer=ackTimer=null;if(watchdog!==null)host.clearInterval(watchdog);watchdog=null;}
 function send(c,type,body={}){if(!c?.open)throw Error('Party connection is closed.');c.send({protocol:PROTOCOL,type,...body});}
 function broadcast(type,body={}){for(const c of connections.values())send(c,type,body);}
 function cleanup(){generation++;clearTimers();const cs=[...connections.values()],old=peer;connections.clear();peer=null;for(const c of cs){try{c.close();}catch(_){}}try{old?.destroy();}catch(_){}busy=false;pending.clear();}
 function fail(message,notify=true){if(phase==='error'||phase==='ended')return;try{if(notify)broadcast('abort');}catch(_){}phase='error';cleanup();try{P().abort();}catch(error){message+=' · '+error.message;}if(V().battle){V().battle.finished=true;V().battle.isBattling=false;host.document.getElementById('portalCombatResult').textContent=message+' · Attempt stopped. Exit to Storage.';}update(message);}
 function reset(){if(peer)cleanup();role='';room='';members=[];portal=null;phase='idle';revision=0;seq=0;lastTurn=0;runId='';localId=P().playerId;update();}
 function exit(){try{if(peer&&phase!=='ended')broadcast('leave');}catch(_){}cleanup();role='';room='';members=[];phase='idle';portal=null;}
 function timeoutAttempt(){clearAttempt();const g=generation;attemptTimer=host.setTimeout(()=>{if(g===generation)fail('Connection timed out. Please verify Room ID or network firewall.');},CONNECT);}
 function validWires(wires,n){try{if(!Array.isArray(wires)||wires.length!==n||new Set(wires.map(w=>w?.cardId)).size!==n)return false;for(const wire of wires)R.unit(wire,'validate');return true;}catch(error){return false;}}
 async function ensure(){await U.loadSdk('peerJsCdn',()=>typeof host.Peer==='function');signature=await host.PvPCombat.signature();}
 function makePeer(id,hosting){const g=generation;peer=new host.Peer(id,U.peerOptions());
  peer.on('open',()=>{if(g!==generation)return;if(hosting){clearAttempt();phase='lobby';members=[{id:localId,name:name(P().name()),ready:false,wires:[]}];update('Room ready. Share '+room+' with friends.');}else attach(peer.connect('acr-'+room.toLowerCase(),{reliable:true,serialization:'json',metadata:{protocol:PROTOCOL}}));});
  peer.on('connection',c=>{if(g!==generation||!hosting||phase!=='lobby'||members.length>=size||connections.size>=size-1){c.on('error',()=>{});c.on('open',()=>{try{send(c,'busy');}finally{c.close();}});return;}attach(c);});
  peer.on('error',error=>{if(g===generation)fail(error.type==='peer-unavailable'?'Portal room not found. Check the Room ID.':error.message||'Party network error.');});
  peer.on('disconnected',()=>{if(g===generation&&![...connections.values()].every(c=>c.open))fail('Party room service disconnected.');});
  peer.on('close',()=>{if(g===generation)fail('Party room closed.');});
 }
 async function create(value,playerCount){if(peer||busy||!R.validPortal(value)||![4,5,'secret'].includes(value.tier)||![2,3,4].includes(playerCount))return;reset();role='host';portal={...value};size=playerCount;room='PORTAL-'+U.token(4).toUpperCase();busy=true;timeoutAttempt();update('Connecting to Party service…');const g=generation;try{await ensure();if(g!==generation)return;makePeer('acr-'+room.toLowerCase(),true);}catch(error){fail(error.message);}finally{busy=false;update();}}
 async function join(code){if(peer||busy)return;code=String(code||'').trim().toUpperCase();if(!/^PORTAL-[A-F0-9]{8}$/.test(code)){update('Enter a Room ID such as PORTAL-A1B2C3D4.');return;}reset();role='guest';room=code;busy=true;timeoutAttempt();update('Connecting to Portal room…');const g=generation;try{await ensure();if(g!==generation)return;makePeer(undefined,false);}catch(error){fail(error.message);}finally{busy=false;update();}}
 function lobby(){revision++;for(const m of members){m.ready=false;m.wires=[];}broadcast('lobby',{room,size,portal,revision,members:members.map(m=>({id:m.id,name:m.name,ready:false}))});update('Party updated. Choose owned cards and click Ready.');}
 function attach(c){const g=generation;connections.set(c.peer,c);c.portalLastSeen=Date.now();let count=0;
  c.on('open',()=>{if(g!==generation)return;timeoutAttempt();if(!isHost())send(c,'hello',{signature,id:localId,name:name(P().name())});});
  c.on('data',message=>{if(g!==generation)return;if(++count>64){fail('Party message queue exceeded.');return;}queue=queue.then(async()=>{if(g!==generation)return;await receive(c,message);}).catch(error=>{if(g===generation)fail(error.message);}).finally(()=>count--);});
  c.on('error',error=>{if(g===generation)fail(error.message||'Party connection error.');});c.on('close',()=>{if(g===generation&&phase!=='ended')fail('A Party member disconnected.');});
  if(watchdog===null)watchdog=host.setInterval(()=>{try{for(const conn of connections.values()){if(Date.now()-conn.portalLastSeen>45000){fail('Party member timed out.');return;}if(conn.open)send(conn,'ping');}}catch(error){fail(error.message);}},10000);
 }
 function wireLobby(message){if(!R.validPortal(message.portal)||![4,5,'secret'].includes(message.portal.tier)||![2,3,4].includes(message.size)||!Number.isSafeInteger(message.revision)||!Array.isArray(message.members)||message.members.length>message.size||new Set(message.members.map(m=>m.id)).size!==message.members.length||!message.members.some(m=>m.id===localId))throw Error('Invalid Portal lobby.');return message.members.map(m=>({id:String(m.id).slice(0,100),name:name(m.name),ready:Boolean(m.ready),wires:[]}));}
 async function receive(c,m){
  if(!m||typeof m!=='object'||Array.isArray(m)||JSON.stringify(m).length>131072)throw Error('Invalid Party packet.');if(m.type==='busy'){fail('Portal room is full or already in battle.',false);return;}if(m.protocol!==PROTOCOL)throw Error('Incompatible Portal protocol.');c.portalLastSeen=Date.now();
  if(m.type==='ping'){send(c,'pong');return;}if(m.type==='pong')return;if(m.type==='leave'||m.type==='abort'){fail('Party attempt stopped by a member.',false);return;}
  if(m.type==='hello'){
   if(!isHost()||phase!=='lobby'||m.signature!==signature||typeof m.id!=='string'||!/^[a-f0-9]{32}$/.test(m.id)||members.some(v=>v.id===m.id)||members.length>=size)throw Error('Party verification failed. Use the same game version and distinct profiles.');
   c.portalMemberId=m.id;members.push({id:m.id,name:name(m.name),ready:false,wires:[]});clearAttempt();send(c,'welcome',{signature});lobby();return;
  }
  if(m.type==='welcome'){if(isHost()||m.signature!==signature)throw Error('Game versions differ.');clearAttempt();return;}
  if(isHost()&&!c.portalMemberId)throw Error('Party member has not joined.');
  if(m.type==='lobby'){
   if(isHost()||phase==='combat'||phase==='starting')throw Error('Unexpected Party lobby.');members=wireLobby(m);size=m.size;portal=m.portal;revision=m.revision;phase='lobby';clearAttempt();update('Connected. Select cards, then Ready.');return;
  }
  if(m.type==='ready'){
   if(!isHost()||phase!=='lobby'||m.revision!==revision)throw Error('Party selection changed.');const player=members.find(v=>v.id===c.portalMemberId);if(!player||!validWires(m.wires,R.slots(size,members.indexOf(player))))throw Error('Invalid team size or card selection.');player.wires=m.wires;player.ready=true;broadcast('ready_state',{revision,members:members.map(v=>({id:v.id,name:v.name,ready:v.ready}))});update();return;
  }
  if(m.type==='ready_state'){if(isHost()||phase!=='lobby'||m.revision!==revision||!Array.isArray(m.members)||m.members.length!==members.length)throw Error('Invalid Ready state.');for(const member of members){const v=m.members.find(v=>v.id===member.id);if(!v)throw Error('Party member changed.');member.ready=Boolean(v.ready);}update();return;}
  if(m.type==='rematch'){if(isHost()||phase!=='ended'||!R.validPortal(m.portal)||m.portal.id!==portal.id)throw Error('Invalid rematch.');portal=m.portal;phase='lobby';V().release();return;}
  if(m.type==='prepare'){
   if(isHost()||phase!=='lobby'||!self()?.ready||m.signature!==signature||m.revision!==revision)throw Error('Unexpected Portal start.');
   await enter(m);send(c,'init_ack',{id:runId,hash});return;
  }
  if(m.type==='init_ack'){if(!isHost()||phase!=='starting'||m.id!==runId||m.hash!==hash)throw Error('Portal initial state mismatch.');pending.delete(c.portalMemberId);if(!pending.size){host.clearTimeout(ackTimer);phase='combat';broadcast('go',{id:runId});schedule();}return;}
  if(m.type==='go'){if(isHost()||phase!=='starting'||m.id!==runId)throw Error('Invalid Portal clock.');phase='combat';V().battle.nextTurnAt=Date.now()+2000;return;}
  if(m.type==='turn'){
   if(isHost()||phase!=='combat'||m.id!==runId||m.seq!==seq+1)throw Error('Portal turn sequence mismatch.');seq=m.seq;V().step();const digest=await U.hash(V().combat.digest());if(digest!==m.hash)throw Error('Party combat diverged. Attempt stopped without rewards.');hash=digest;V().battle.nextTurnAt=Date.now()+2000;send(c,'turn_ack',{id:runId,seq,hash});return;
  }
  if(m.type==='turn_ack'){if(!isHost()||phase!=='combat'||m.id!==runId||m.seq!==seq||m.hash!==hash)throw Error('Party turn verification failed.');pending.delete(c.portalMemberId);if(!pending.size){host.clearTimeout(ackTimer);if(V().battle.finished)finishParty();else schedule();}return;}
  if(m.type==='result'){if(isHost()||phase!=='combat'||m.id!==runId||m.hash!==hash||!V().battle.finished||m.winner!==V().battle.portalWinner)throw Error('Unverified Party result.');finishLocal();return;}
  throw Error('Unsupported Party message.');
 }
 function ready(wires){if(phase!=='lobby'||self()?.ready||!validWires(wires,quota()))throw Error('Select the required owned cards first.');if(isHost()){Object.assign(self(),{ready:true,wires});broadcast('ready_state',{revision,members:members.map(v=>({id:v.id,name:v.name,ready:v.ready}))});update();}else{Object.assign(self(),{ready:true,wires});try{send([...connections.values()][0],'ready',{revision,wires});update();}catch(error){self().ready=false;update(error.message);throw error;}}}
 function ackTimeout(){if(ackTimer!==null)host.clearTimeout(ackTimer);ackTimer=host.setTimeout(()=>fail('A Party client did not confirm the combat state.'),CONNECT);}
 async function enter(packet){
  if(!R.validPortal(packet.portal)||U.stable(packet.portal)!==U.stable(portal)||!Number.isSafeInteger(packet.seed)||packet.seed<0||packet.seed>0xffffffff||!Array.isArray(packet.players)||packet.players.length!==size||!Array.isArray(packet.weather)||packet.weather.length>32||typeof packet.id!=='string'||!/^portal_run_[a-f0-9]{20}$/.test(packet.id))throw Error('Invalid Portal battle.');
  const units=[];for(let i=0;i<size;i++){const player=packet.players[i];if(player.id!==members[i].id||!validWires(player.wires,R.slots(size,i)))throw Error('Party allocation does not match lobby.');if(player.id===localId&&U.stable(player.wires)!==U.stable(P().getWires()))throw Error('Your selected cards changed.');for(const wire of player.wires)units.push(R.unit(wire,player.id));}
  runId=packet.id;seed=packet.seed;portal=packet.portal;phase='starting';P().begin(runId,portal,true,isHost());V().start({id:runId,portal,players:units,seed,party:true,weather:packet.weather});hash=await U.hash(V().combat.digest());seq=0;
 }
 async function start(){if(!readyToStart())return;try{busy=true;const packet={id:'portal_run_'+U.token(10),seed:R.integer(1,0xffffffff),portal,players:members.map(m=>({id:m.id,wires:m.wires})),weather:P().weather,signature,revision};await enter(packet);pending=new Set(members.filter(m=>m.id!==localId).map(m=>m.id));broadcast('prepare',packet);ackTimeout();}catch(error){fail(error.message);}finally{busy=false;update();}}
 function schedule(){if(!isHost()||phase!=='combat')return;if(turnTimer!==null)host.clearTimeout(turnTimer);const delay=Math.max(0,lastTurn+2000-Date.now());V().battle.nextTurnAt=Date.now()+(lastTurn?delay:2000);turnTimer=host.setTimeout(()=>{turnTimer=null;void tick();},lastTurn?delay:2000);}
 async function tick(){try{if(phase!=='combat')return;lastTurn=Date.now();V().step();hash=await U.hash(V().combat.digest());seq++;pending=new Set(members.filter(m=>m.id!==localId).map(m=>m.id));broadcast('turn',{id:runId,seq,hash});ackTimeout();}catch(error){fail(error.message);}}
 function continueMatch(auto=false){if(!isHost()||phase!=='ended')return false;const current=P().get(portal.id);if(!current||(auto&&current.tier!==portal.tier))return false;portal=current;phase='lobby';lastTurn=0;V().release();broadcast('rematch',{portal});void start();return true;}
 function finishLocal(){phase='ended';clearTimers();const scores=V().combat.kills;let mvp=null;if(size===4){const ranked=members.map((m,i)=>({id:m.id,kills:scores[m.id]||0,index:i})).sort((a,b)=>b.kills-a.kills||a.index-b.index);if(ranked[0]?.kills>0)mvp=ranked[0].id;}const info={mvp:mvp===localId};V().setPartyInfo(info);V().complete(info);update();}
 function finishParty(){broadcast('result',{id:runId,hash,winner:V().battle.portalWinner});finishLocal();}
 host.PortalParty=Object.freeze({create,join,ready,start,reset,exit,continueMatch,get canContinue(){return isHost()&&phase==='ended'&&Boolean(P().get(portal?.id));},get active(){return Boolean(role);},get quota(){return quota();},get locked(){return Boolean(self()?.ready)||phase==='starting'||phase==='combat'||phase==='ended';},get canReady(){return phase==='lobby'&&!self()?.ready&&index()>=0;}});
})(window);
