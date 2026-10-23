/* PeerJS room lifecycle, commit/reveal blind picks and verified lockstep turns.
   Peers exchange intentions + state hashes; HP/ATK are always derived locally. */
(function(host){
 'use strict';
 const U=host.OnlineUtils,C=host.PvPCombat,V=host.PvPView,TURN_MS=15000,PROTOCOL=1;
 let bridge={},active=false,peer=null,connection=null,role='',room='',session='',mode=1,phase='setup',localCommit=null,remoteCommit='',localReveal=null,remoteReveal=null,combat=null,seq=0,deadline=0,timer=null,clock=null,heartbeat=null,queue=Promise.resolve(),generation=0,remoteName='Opponent',lastSeen=0,confirmed=false,lastHash='',remoteAck='',hello=false,identitySignature='',selection=[],remoteBusy=false,handling=false,lockState='idle',mounted=false;
 let ownedIds=new Set();
 const el=id=>host.document.getElementById(id),text=(id,value)=>U.text(el(id),value);
 const localSide=()=>role==='host'?'host':'guest';
 const safeName=n=>String(n||'Player').replace(/[\u0000-\u001f]/g,'').slice(0,40);
 function refreshOwned(){const cards=bridge.ownedCards?.()||[];ownedIds=new Set(cards.map(card=>String(card.id)));V.setCards(cards);}
 function stopTimer(){if(timer!==null)host.clearTimeout(timer);timer=null;deadline=0;}
 function stopRoom(){generation++;V.closePicker(false);stopTimer();if(clock!==null)host.clearInterval(clock);clock=null;if(heartbeat!==null)host.clearInterval(heartbeat);heartbeat=null;const c=connection,p=peer;connection=null;peer=null;try{c?.close();}catch(_){}try{p?.destroy();}catch(_){}session='';role='';room='';confirmed=false;hello=false;}
 function send(type,body={}){if(!connection?.open)throw Error('Opponent connection is closed.');connection.send({protocol:PROTOCOL,type,session,...body});}
 function stopLiveTimers(){if(clock!==null)host.clearInterval(clock);clock=null;if(heartbeat!==null)host.clearInterval(heartbeat);heartbeat=null;}
 function abort(message,notify=true){stopTimer();stopLiveTimers();phase='ended';confirmed=false;try{if(notify&&connection?.open)send('abort',{message:'Match ended: connection or synchronization error.'});}catch(_){}text('pvpStatus',message+' · No rewards or progression.');renderControls();}
 function end(message){stopTimer();stopLiveTimers();phase='ended';confirmed=false;text('pvpStatus',message+' · No rewards or progression.');renderCombat();renderControls();}
 function resetPicks(){localCommit=null;lockState='idle';remoteCommit='';localReveal=null;remoteReveal=null;combat=null;seq=0;lastHash='';remoteAck='';confirmed=false;selection=[];remoteBusy=false;phase='picking';text('pvpOpponentPick','Hidden selection · waiting for Ready');V.resetCombat();renderControls();}
 function renderSelection(){V.state({phase,mode,selection:[...selection],locked:Boolean(localCommit),lockState,remoteReady:Boolean(remoteCommit),hello,hasPeer:Boolean(peer),handling,hasCombat:Boolean(combat),valid:C.validTeam(selection,mode)});}
 function renderControls(){text('pvpRoomCode',room||'No room');text('pvpFormatLabel',mode+'v'+mode+' · Level 1 · Normal cards');
  if(el('pvpMode'))el('pvpMode').value=String(mode);
  if(el('pvpCreate'))el('pvpCreate').disabled=Boolean(peer)||handling;
  if(el('pvpJoin'))el('pvpJoin').disabled=Boolean(peer)||handling;
  if(el('pvpJoinCode'))el('pvpJoinCode').disabled=Boolean(peer)||handling;
  if(el('pvpCopyRoom'))el('pvpCopyRoom').disabled=!room;
  if(el('pvpReady'))el('pvpReady').disabled=!connection?.open||!hello||phase!=='picking'||Boolean(localCommit)||!C.validTeam(selection,mode);
  const canStrike=phase==='combat'&&confirmed&&!remoteBusy&&combat?.activeSide===localSide();if(el('pvpStrike'))el('pvpStrike').disabled=!canStrike;
  if(el('pvpLeaveRoom'))el('pvpLeaveRoom').hidden=!peer;
  renderSelection();
 }
 function renderClock(){if(combat)V.renderClock(seq,combat.activeSide,localSide(),deadline,phase,confirmed,remoteBusy);}
 function renderCombat(){if(!combat)return;V.renderCombat(combat,localSide(),remoteName);renderClock();}
 async function open(){if(active||bridge.canEnter?.()!==true)return false;active=true;bridge.onEnter?.();bridge.open?.('pvpModal');text('pvpStatus','Create a room or join a friend. Both players choose privately, then lock in.');phase='setup';mode=Number(el('pvpMode')?.value)===4?4:1;refreshOwned();renderControls();return true;}
 function leaveRoom(){handling=false;try{if(connection?.open)send('leave');}catch(_){}stopRoom();phase='setup';combat=null;selection=[];localCommit=null;lockState='idle';localReveal=null;remoteReveal=null;remoteCommit='';V.resetCombat();text('pvpOpponentPick','Opponent picks remain hidden until both players are Ready.');text('pvpStatus','Room closed. No rewards or progression.');renderControls();}
 function exit(){if(!active)return;leaveRoom();active=false;bridge.close?.('pvpModal');bridge.onExit?.();}
 async function ensurePeer(){await U.loadSdk('peerJsCdn',()=>typeof host.Peer==='function');identitySignature=await C.signature();}
 function roomCode(){return 'PVP-'+U.token(3).toUpperCase();}
 function peerId(code){return 'acr-'+code.toLowerCase();}
 async function createRoom(){if(!active||peer||handling)return;handling=true;renderControls();const ticket=generation;try{await ensurePeer();if(ticket!==generation||!active)return;mode=Number(el('pvpMode')?.value)===4?4:1;role='host';room=roomCode();session=U.token();resetPicks();makePeer(peerId(room),true);text('pvpStatus','Opening room…');}catch(error){text('pvpStatus',error.message);stopRoom();}finally{handling=false;renderControls();}}
 async function joinRoom(){if(!active||peer||handling)return;const code=String(el('pvpJoinCode')?.value||'').trim().toUpperCase();if(!/^PVP-[A-F0-9]{6}$/.test(code)){text('pvpStatus','Enter a room code such as PVP-A1B2C3.');return;}handling=true;renderControls();const ticket=generation;try{await ensurePeer();if(ticket!==generation||!active)return;role='guest';room=code;session='';resetPicks();makePeer(undefined,false);text('pvpStatus','Connecting to room…');}catch(error){text('pvpStatus',error.message);stopRoom();}finally{handling=false;renderControls();}}
 function makePeer(id,isHost){const ticket=generation;peer=new host.Peer(id,{debug:0});
  peer.on('open',()=>{if(ticket!==generation)return;if(isHost)text('pvpStatus','Room ready. Share the Room ID with one friend.');else attach(peer.connect(peerId(room),{reliable:true,serialization:'json',metadata:{protocol:PROTOCOL}}));renderControls();});
  peer.on('connection',c=>{if(ticket!==generation||!isHost||connection){c.on('open',()=>{try{c.send({protocol:PROTOCOL,type:'busy'});}finally{c.close();}});return;}attach(c);});
  peer.on('error',error=>{if(ticket!==generation)return;abort(error.type==='unavailable-id'?'Room ID already taken. Leave this room and create another.':error.type==='peer-unavailable'?'Room not found. Check the Room ID.':error.message||'Peer connection failed.',false);});
  peer.on('disconnected',()=>{if(ticket===generation&&phase!=='ended')abort('Connection to the room service was lost. Recreate the room.',false);});
 }
 function attach(c){let pending=0;if(connection){c.close();return;}connection=c;const ticket=generation;lastSeen=Date.now();
  c.on('open',()=>{if(ticket!==generation)return;text('pvpStatus','Opponent connected. Verifying game version…');if(role==='host')send('hello',{mode,signature:identitySignature,name:safeName(bridge.displayName?.())});
   heartbeat=host.setInterval(()=>{if(ticket!==generation)return;if(Date.now()-lastSeen>45000){abort('Opponent timed out.',false);return;}try{send('ping',{at:Date.now()});}catch(_){}},10000);
   clock=host.setInterval(renderClock,250);renderControls();});
  c.on('data',message=>{if(ticket!==generation)return;if(pending>=64){abort('Too many queued peer messages.');c.close();return;}pending++;queue=queue.then(()=>{if(ticket===generation)return receive(message);}).catch(error=>abort(error.message)).finally(()=>{pending--;});});
  c.on('close',()=>{if(ticket===generation&&phase!=='ended')abort('Opponent disconnected.',false);});c.on('error',error=>{if(ticket===generation)abort(error.message||'Peer channel error.',false);});
 }
 async function receive(message){
  if(!message||typeof message!=='object'||Array.isArray(message)||JSON.stringify(message).length>65536)throw Error('Invalid peer message.');
  if(message.type==='busy'){abort('Room already has two players.',false);return;}
  if(message.protocol!==PROTOCOL)throw Error('Incompatible PvP protocol.');lastSeen=Date.now();
  if(message.type==='hello'){
   if(role!=='guest'||hello||message.signature!==identitySignature||![1,4].includes(message.mode)||!/^[a-f0-9]{32}$/.test(message.session))throw Error('Players must use the same game update.');session=message.session;mode=message.mode;remoteName=safeName(message.name);hello=true;resetPicks();send('hello_ack',{signature:identitySignature,name:safeName(bridge.displayName?.())});text('pvpStatus','Connected. Choose your team privately, then Lock In / Ready.');renderControls();return;
  }
  if(!session||message.session!==session)throw Error('Message belongs to another room session.');
  if(message.type==='hello_ack'){if(role!=='host'||hello||message.signature!==identitySignature)throw Error('Game version mismatch.');hello=true;remoteName=safeName(message.name);text('pvpStatus','Connected. Choose your team privately, then Lock In / Ready.');renderControls();return;}
  if(message.type==='ping'){send('pong');return;}if(message.type==='pong')return;
  if(message.type==='leave'){end('Opponent left the room');return;}if(message.type==='abort'){abort('Match stopped because peers could not verify the same state.',false);return;}
  if(phase==='ended')return;
  if(!hello)throw Error('Incomplete room handshake.');
  if(message.type==='commit'){if(phase!=='picking'||remoteCommit||!/^[a-f0-9]{64}$/.test(message.hash))throw Error('Invalid or repeated Ready message.');remoteCommit=message.hash;text('pvpOpponentPick','✓ Opponent is Ready · picks still hidden');renderControls();await maybeReveal();return;}
  if(message.type==='reveal'){if(phase!=='picking'||!/^[a-f0-9]{64}$/.test(localCommit||'')||!remoteCommit||remoteReveal||!C.validTeam(message.team,mode)||!/^[a-f0-9]{64}$/.test(message.nonce))throw Error('Invalid blind-pick reveal.');if(await C.commitment(message.team,message.nonce)!==remoteCommit)throw Error('Opponent changed their team after locking in.');remoteReveal={team:message.team,nonce:message.nonce};await begin();return;}
  if(message.type==='state_ready'){if(role!=='host'||phase!=='combat'||message.seq!==0||message.hash!==lastHash)throw Error('Initial combat state mismatch.');confirmed=true;startTurn();return;}
  if(message.type==='turn'){if(role!=='guest'||phase!=='combat'||message.seq!==seq||message.hash!==lastHash||!Number.isFinite(message.duration)||message.duration!==TURN_MS)throw Error('Turn synchronization failed.');confirmed=true;remoteBusy=false;deadline=Date.now()+TURN_MS;if(combat.battle.finished)showResult();else{renderControls();renderCombat();}return;}
  if(message.type==='action'){if(role==='host'&&Number.isSafeInteger(message.seq)&&message.seq<seq)return;if(role!=='host'||phase!=='combat'||!confirmed||message.seq!==seq||combat.activeSide!=='guest')throw Error('Out-of-turn action rejected.');await advance();return;}
  if(message.type==='advance'){if(role!=='guest'||phase!=='combat'||message.seq!==seq+1||!confirmed)throw Error('Unexpected combat step.');confirmed=false;stopTimer();combat.step();seq++;lastHash=await U.hash(combat.snapshot());if(lastHash!==message.hash)throw Error('Combat state mismatch. Match ended safely.');send('ack',{seq,hash:lastHash});renderCombat();if(combat.battle.finished)showResult();else renderControls();return;}
  if(message.type==='ack'){if(role!=='host'||message.seq!==seq||message.hash!==lastHash||remoteAck===seq)throw Error('Combat acknowledgement mismatch.');remoteAck=seq;if(combat.battle.finished)showResult();else{confirmed=true;startTurn();}return;}
  throw Error('Unknown PvP message.');
 }
 async function ready(){
  const ticket=generation;
  if(phase!=='picking'||localCommit||!hello||!connection?.open||!C.validTeam(selection,mode)||selection.some(id=>!ownedIds.has(id)))return;
  // Freeze the exact team before any async hashing. Never read live inputs after this point.
  const team=[...selection];localCommit='pending';lockState='hashing';V.closePicker(false);renderControls();
  try{
   const nonce=U.token(32);localReveal={team,nonce};
   const hash=await U.timeout(C.commitment(team,nonce),10000,'Could not secure this selection. Please retry Lock In.');
   if(ticket!==generation||phase==='ended'||!active)return;
   if(!connection?.open)throw Error('Opponent disconnected before Ready was sent.');
   if(!/^[a-f0-9]{64}$/.test(hash))throw Error('Invalid selection commitment. Please retry Lock In.');
   localCommit=hash;lockState='ready';send('commit',{hash});
   text('pvpStatus','✓ Your team is locked. Ready / Waiting for Opponent.');renderControls();await maybeReveal();
  }catch(error){
   if(ticket!==generation||phase==='ended'||!active)return;
   // A hash which never left this browser may be retried. A sent commitment is immutable.
   if(localCommit==='pending'&&connection?.open){localCommit=null;localReveal=null;lockState='idle';text('pvpStatus',error.message);renderControls();}
   else abort(error.message);
  }
 }
 async function maybeReveal(){
  if(!/^[a-f0-9]{64}$/.test(localCommit||'')||!remoteCommit||!localReveal||localReveal.sent)return;
  localReveal.sent=true;lockState='revealing';text('pvpStatus','Both players Ready. Verifying sealed selections…');renderControls();
  send('reveal',{team:localReveal.team,nonce:localReveal.nonce});await begin();
 }
 async function begin(){const ticket=generation;if(!localReveal?.sent||!remoteReveal||combat||phase!=='picking')return;phase='starting';lockState='revealing';renderControls();const hostPick=role==='host'?localReveal:remoteReveal,guestPick=role==='guest'?localReveal:remoteReveal,hash=await U.hash(session+hostPick.nonce+guestPick.nonce),seed=parseInt(hash.slice(0,8),16);if(ticket!==generation)return;combat=C.create(hostPick.team,guestPick.team,seed);const stateHash=await U.hash(combat.snapshot());if(ticket!==generation)return;lastHash=stateHash;phase='combat';text('pvpOpponentPick','Revealed: '+remoteReveal.team.map(id=>host.ALL_CARDS.find(card=>card.id===id).name).join(' · '));text('pvpStatus','Both teams revealed. All cards use Level 1 base stats.');renderCombat();renderControls();if(role==='guest')send('state_ready',{seq:0,hash:lastHash});else timer=host.setTimeout(()=>abort('Opponent did not confirm the initial combat state.'),20000);}
 function startTurn(){stopTimer();if(combat.battle.finished){send('turn',{seq,hash:lastHash,duration:TURN_MS});showResult();return;}deadline=Date.now()+TURN_MS;send('turn',{seq,hash:lastHash,duration:TURN_MS});timer=host.setTimeout(()=>{void advance().catch(error=>abort(error.message));},TURN_MS);renderControls();renderCombat();}
 async function advance(){const ticket=generation;if(role!=='host'||!confirmed||phase!=='combat')return;confirmed=false;stopTimer();combat.step();seq++;const stateHash=await U.hash(combat.snapshot());if(ticket!==generation)return;lastHash=stateHash;send('advance',{seq,hash:lastHash});timer=host.setTimeout(()=>abort('Opponent did not confirm the combat turn.'),20000);renderCombat();renderControls();}
 async function strike(){if(phase!=='combat'||!confirmed||combat.activeSide!==localSide())return;if(role==='host')await advance();else{remoteBusy=true;send('action',{seq});renderControls();}}
 function showResult(){stopTimer();const winner=combat.battle.pvpWinner;end(winner==='draw'?'DRAW':winner===localSide()?'YOU WIN':'OPPONENT WINS');}
 function changeMode(value){if(peer||handling||localCommit)return;mode=Number(value)===4?4:1;selection=[];renderControls();}
 function pick(index,id){if(!active||!['setup','picking'].includes(phase)||localCommit||!Number.isInteger(index)||index<0||index>=mode||!ownedIds.has(id)||selection.some((selected,i)=>i!==index&&selected===id))return false;selection[index]=id;renderControls();return true;}
 function mount(){
  V.mount({pick});if(mounted)return;mounted=true;
  el('pvpOpenButton')?.addEventListener('click',()=>void open());el('pvpCreate')?.addEventListener('click',()=>void createRoom());el('pvpJoin')?.addEventListener('click',()=>void joinRoom());el('pvpReady')?.addEventListener('click',()=>void ready().catch(error=>abort(error.message)));el('pvpStrike')?.addEventListener('click',()=>void strike().catch(error=>abort(error.message)));el('pvpExit')?.addEventListener('click',exit);el('pvpLeaveRoom')?.addEventListener('click',leaveRoom);el('pvpBattleLeave')?.addEventListener('click',leaveRoom);
  el('pvpMode')?.addEventListener('change',()=>changeMode(el('pvpMode').value));
  host.document.querySelectorAll('[data-pvp-mode]').forEach(button=>button.addEventListener('click',()=>changeMode(button.dataset.pvpMode)));
  el('pvpCopyRoom')?.addEventListener('click',()=>{if(room)void host.navigator.clipboard?.writeText(room).catch(()=>text('pvpStatus','Room ID: '+room));});
 }
 host.addEventListener('pagehide',()=>stopRoom());
 host.PvPSystem=Object.freeze({open,exit,leaveRoom,createRoom,joinRoom,ready,strike,get active(){return active;},get phase(){return phase;},configure(options){bridge=options||{};mount();}});
})(window);
