/* Game-mode registry and lifecycle. Card ownership/reward persistence are provided by app.js. */
(function(host){
 'use strict';
 const modes=new Map(),KEY='ball_arena_preferences_v1';
 const validId=id=>typeof id==='string'&&/^[a-z0-9_-]{1,32}$/.test(id);
 const registerMode=mode=>{
  if(!validId(mode?.id)||modes.has(mode.id)&&!modes.get(mode.id).locked||!mode.name||!Number.isInteger(mode.teamSize)||mode.teamSize<1||mode.teamSize>6)throw Error('Invalid Ball Arena mode.');
  modes.set(mode.id,Object.freeze({...mode}));return modes.get(mode.id);
 };
 registerMode({id:'1v1',name:'1v1 Duel',teamSize:1,icon:'I',description:'One orb. One rival. Every rebound counts.',match:'Adaptive AI opponent'});
 registerMode({id:'4v4',name:'4v4 Squad Brawl',teamSize:4,icon:'IV',description:'Build a squad, chain Energy pulses and outlast the enemy formation.',match:'Adaptive AI squad'});
 registerMode({id:'boss',name:'Boss Arena',teamSize:4,icon:'?',locked:true,description:'A future challenge for your strongest orbs.'});
 registerMode({id:'ranked',name:'Ranked Balls',teamSize:4,icon:'★',locked:true,description:'A future competitive arena.'});
 let bridge={},active=false,mode=modes.get('1v1'),slots=[],rows=[],screen='lobby',slotIndex=0,speed=1,auto=false,fight=null,raf=0,last=0,hudTime=0,replayAt=Infinity,result=null,prefs={},error='',closePending=false,countdown=0,countdownNumber=0;
 function read(){try{const data=JSON.parse(host.localStorage.getItem(KEY)||'{}');return data&&typeof data==='object'?data:{};}catch(_){return {};}}
 function persist(){try{host.localStorage.setItem(KEY,JSON.stringify(prefs));}catch(_){}}
 function findRow(slot){return slot&&rows.find(row=>row.card.id===slot.cardId&&row.variantKey===slot.variantKey);}
 function valid(slot,others=[]){const row=findRow(slot);return !!row&&Number.isSafeInteger(slot.copy)&&slot.copy>=0&&slot.copy<row.count&&!others.some(s=>s?.variantKey===slot.variantKey&&s.copy===slot.copy);}
 function refreshRows(){rows=host.BallIndex.uniqueRows(bridge.collection?.()||[]);}
 function setMode(id,initial=false){
  const next=modes.get(id);if(!next||next.locked||fight&&!fight.done)return false;
  mode=next;refreshRows();const source=prefs.decks?.[mode.id]||bridge.defaultTeam?.(mode.id)||[];
  slots=Array(mode.teamSize).fill(null);
  for(let i=0;i<slots.length;i++)if(valid(source[i],slots))slots[i]={...source[i]};
  if(!source.length){
   const ranked=rows.slice().sort((a,b)=>(b.display.hp+b.display.atk*2)-(a.display.hp+a.display.atk*2));
   for(let i=0;i<slots.length;i++){
    const row=ranked.find(r=>!slots.some(s=>s?.cardId===r.card.id))||ranked.find(r=>slots.filter(s=>s?.variantKey===r.variantKey).length<r.count);
    if(!row)break;let copy=0;while(slots.some(s=>s?.variantKey===row.variantKey&&s.copy===copy))copy++;
    slots[i]={cardId:row.card.id,variantKey:row.variantKey,copy};
   }
  }
  slotIndex=0;error='';prefs.mode=mode.id;persist();if(!initial)renderLobby();return true;
 }
 function assign(slot){
  const other=slots.filter((_,i)=>i!==slotIndex);
  if(slot&&!valid(slot,other))return false;
  slots[slotIndex]=slot?{...slot}:null;prefs.decks ||= {};prefs.decks[mode.id]=slots.map(s=>s&&{...s});persist();
  return true;
 }
 function showIndex(index=0){
  if(!active||fight&&!fight.done)return;
  refreshRows();slotIndex=Math.max(0,Math.min(slots.length-1,index));screen='index';
  host.BallView.showIndex({rows,slot:slots[slotIndex],lineup:()=>slots,activeSlot:()=>slotIndex,setSlot:i=>{slotIndex=i;},assign});
 }
 function renderLobby(){
  if(!active)return;
  if(fight){if(!fight.done)return;host.BallAudio?.stop();fight.dispose();fight=null;}countdown=countdownNumber=0;
  screen='lobby';result=null;replayAt=Infinity;refreshRows();
  host.BallView.showLobby({modes:[...modes.values()],mode,slots,findRow,rows,speed,auto,error,gems:host.InventorySystem.quantity('gems'),potion:speedPotion()});
 }
 function speedPotion(){return host.InventorySystem?.combatTurnMs(2000)===1000;}
 function actualSpeed(){return speedPotion()?2:speed;}
 function start(){
  if(!active||fight&&!fight.done||closePending)return false;
  refreshRows();
  if(!slots.every((slot,i)=>valid(slot,slots.filter((_,j)=>i!==j)))){error='Fill every lineup slot with an owned card copy.';renderLobby();return false;}
  let prepared;
  try{prepared=mode.prepare?mode.prepare(slots,bridge):bridge.prepare(mode,slots.map(s=>({...s})));}catch(e){error=e.message||'Unable to prepare the match.';renderLobby();return false;}
  if(!prepared?.playerTeam?.length||!prepared.enemyTeam?.length){error='No legal opponent or lineup is available.';renderLobby();return false;}
  if(fight)fight.dispose();fight=null;result=null;replayAt=Infinity;closePending=false;
  try{fight=host.BallCombat.create(prepared);}catch(e){error='Unable to start this match. '+e.message;renderLobby();return false;}
  screen='combat';error='';last=0;hudTime=0;countdown=countdownNumber=3;
  host.BallAudio?.beginMatch();host.BallView.showCombat(mode,prepared,fight);host.BallView.speed(actualSpeed(),auto,speedPotion());host.BallView.countdown(3);host.BallAudio?.play('countdown');return true;
 }
 function complete(){
  if(result||!fight?.done)return;
  const out=fight.outcome();result={...out,rewards:null};countdown=countdownNumber=0;host.BallView.countdown(0);
  try{result.rewards=(mode.reward||bridge.reward)?.(fight,mode)||null;}
  catch(e){result.error='Rewards could not be saved: '+e.message;auto=false;}
  host.BallView.result(result);host.BallAudio?.finish(out.winner);
  if(auto&&!result.error)replayAt=host.performance.now()+2800;
 }
 function frame(now){
  if(!active)return;
  const delta=last?Math.min(.25,Math.max(0,(now-last)/1000)):0;last=now;
  if(screen==='combat'&&fight){
   try {
    if(!host.document.hidden&&!closePending&&!fight.done){
     if(countdown>0){
      countdown=Math.max(0,countdown-delta);
      const number=Math.ceil(countdown);
      if(number!==countdownNumber){countdownNumber=number;host.BallView.countdown(number);host.BallAudio?.play(number?'countdown':'match_start');}
     }else fight.step(delta*actualSpeed());
    }
    const sounds=fight.drainAudio();
    if(!host.document.hidden&&!closePending&&!countdown&&!fight.done)host.BallAudio?.batch(sounds);
    host.BallView.frame(fight);
    hudTime+=delta;
    if(hudTime>=.1||fight.done&&!result){hudTime=0;host.BallView.updateHud(fight,actualSpeed());host.BallView.speed(actualSpeed(),auto,speedPotion());}
    if(fight.done&&!result)complete();
    if(result&&auto&&!host.document.hidden&&!closePending&&now>=replayAt)start();
   }catch(e){console.warn('[Ball Arena] Combat stopped:',e);auto=false;countdown=countdownNumber=0;host.BallView.countdown(0);host.BallAudio?.stop();result={winner:null,error:'Combat stopped safely. No reward was granted.'};host.BallView.result(result);fight.dispose();fight=null;screen='result';}
  }
  raf=host.requestAnimationFrame(frame);
 }
 function setSpeed(v){speed=v===2?2:1;prefs.speed=speed;persist();host.BallView.speed(actualSpeed(),auto,speedPotion());}
 function setAuto(){auto=!auto;prefs.auto=auto;persist();if(result)replayAt=auto?host.performance.now()+2800:Infinity;host.BallView.speed(actualSpeed(),auto,speedPotion());}
 function leave(force=false){
  if(!active)return;
  if(fight&&!fight.done&&!force){if(!closePending){closePending=true;host.BallAudio?.stop();host.BallView.confirm(true);}return;}
  active=false;closePending=false;countdown=countdownNumber=0;host.BallAudio?.leave();host.cancelAnimationFrame(raf);raf=0;fight?.dispose();fight=null;screen='lobby';result=null;host.BallView.close();bridge.onExit?.();
 }
 function open(){
  if(active||bridge.canOpen?.()===false||!host.BallView.mount())return false;
  prefs=read();speed=prefs.speed===2?2:1;auto=prefs.auto===true;active=true;error='';closePending=false;last=0;
  bridge.onEnter?.();host.BallView.open(actions);host.BallAudio?.enter();host.BallView.audioSettings();
  setMode(modes.get(prefs.mode)?.locked?'1v1':modes.has(prefs.mode)?prefs.mode:'1v1',true);renderLobby();
  raf=host.requestAnimationFrame(frame);return true;
 }
 const actions={mode:setMode,index:showIndex,lobby:renderLobby,start,close:leave,retry:start,speed:setSpeed,auto:setAuto,
  cancelClose(){closePending=false;host.BallView.confirm(false);},confirmClose:()=>leave(true)};
 host.BallArena=Object.freeze({registerMode,modes:()=>[...modes.values()],configure(options){bridge=options||{};},open,close:leave,
  get active(){return active;},get fight(){return fight;},get mode(){return mode.id;}});
})(window);
