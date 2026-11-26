/* Sailing Sea lifecycle: one fixed world clock, one visible combat, separate
   local checkpoints and a small bridge to the main game's mode selector. */
(function(host){
 'use strict';
 const doc=host.document,M=host.SailingMap,K=host.SailingCombat,R=host.SailingRules,B=host.SailingBots,C=host.AutoChessSystem;
 const SETTINGS_KEY='anime_card_rng_sailing_sea_settings_v1';
 let bridge={},view=null,model=null,preview=null,active=false,harbor=true,paused=false,loadError=null,settings={control:'direct'},optionalPanel=null,confirmReturn=null,craftTarget='',saveStatus='Local voyage',saveError=false,raf=0,lastFrame=null,accumulator=0,saveClock=0,hudAt=-Infinity,oceanAt=-Infinity,fight=null,fightId=null,joystick=null;
 const held=new Set(),mandatory=new Set(['draft','ambush','encounter','combat','report','recruit','finished']);
 const movement=new Map([['w','up'],['arrowup','up'],['s','down'],['arrowdown','down'],['a','left'],['arrowleft','left'],['d','right'],['arrowright','right']]);
 function readSettings(){try{const row=JSON.parse(host.localStorage.getItem(SETTINGS_KEY)||'{}');return {control:row.control==='point'?'point':'direct'};}catch(_){return {control:'direct'};}}
 function writeSettings(){try{host.localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}catch(_){view?.toast('Control preference is active for this visit.','info');}}
 function randomSeed(){const a=new Uint32Array(1);if(host.crypto?.getRandomValues)host.crypto.getRandomValues(a);else a[0]=Math.floor(Math.random()*0xffffffff);return a[0]||1;}
 function currentPanel(){
  if(optionalPanel)return optionalPanel;
  if(harbor)return 'harbor';
  return model&&mandatory.has(model.phase)?model.phase:null;
 }
 function context(){
  return {settings,paused,harbor,loadError,craftTarget,saveStatus,rival:model&&!harbor&&!paused&&model.phase==='sailing'?B.nearby(model):null};
 }
 function show(force=false){
  if(!view||!active)return;
  const name=currentPanel(),previous=view.panelName;
  if(previous!==name)clearInput();
  const ctx=context();view.panel(name,model,ctx,force);view.hud(model,ctx);hudAt=oceanAt=-Infinity;
 }
 function clearInput(){held.clear();joystick=null;view?.endJoystick();}
 function markSaved(){saveClock=0;saveError=false;saveStatus='Saved locally · '+new Date().toLocaleTimeString('en-GB',{hour12:false,hour:'2-digit',minute:'2-digit'});}
 function savingFailed(){
  paused=true;saveError=true;saveStatus='Save unavailable · paused';accumulator=0;clearInput();
  view.toast('Unable to save the voyage. Free browser storage and press Save again. Your current run is paused in memory.','danger');
 }
 function syncFightCheckpoint(){
  if(model?.phase==='combat'&&model.combat&&fight&&fightId===model.combat.id)model.combat.fightTime=fight.time;
 }
 function checkpoint(notify=false){
  if(!model)return true;
  syncFightCheckpoint();
  if(!R.save(model)){savingFailed();if(active)show();return false;}
  markSaved();if(notify)view.toast('Voyage saved. Resume from this checkpoint anytime.','success');return true;
 }
 // Interactive state changes are atomic with respect to the local checkpoint.
 // A failed storage write cannot charge a recipe, change a flag or spend a recruit.
 function commit(fn,notify=null){
  if(!model)throw Error('Start or resume a voyage first.');
  const previous=C.clone(model);
  let result;
  try{result=fn();}catch(error){model=previous;throw error;}
  if(!R.save(model)){model=previous;savingFailed();show(true);return {ok:false};}
  markSaved();if(notify)view.toast(notify,'success');return {ok:true,result};
 }
 function disposeFight(){if(fight)fight.dispose();fight=null;fightId=null;}
 function beginFight(){
  if(model?.phase!=='combat'||!model.combat)return;
  if(fight&&fightId===model.combat.id)return;
  disposeFight();fightId=model.combat.id;fight=K.start(model.combat,true);
 }
 function restoreAfterCombatError(error){
  if(!model?.combat)return;
  const encounter=model.combat.encounter;disposeFight();
  model.combat=null;model.encounter=encounter;model.phase=encounter.islandId&&R.player(model).docked===encounter.islandId?'ambush':'encounter';
  optionalPanel=null;paused=false;accumulator=0;
  R.log(model,'The boarding battle was interrupted. Choose a squad again or retreat.','danger');
  checkpoint();show(true);view.toast('Combat interrupted: '+String(error?.message||'Unexpected battle error').slice(0,100),'danger');
 }
 function newVoyage(){
  const next=R.create(randomSeed(),bridge.name?.()||'You');
  if(!R.validate(next))throw Error('Unable to generate the voyage.');
  if(!R.save(next)){savingFailed();return;}
  disposeFight();model=next;loadError=null;markSaved();harbor=false;paused=false;accumulator=0;optionalPanel=null;craftTarget='';clearInput();show(true);
 }
 function resume(){
  if(!model)return;harbor=false;optionalPanel=null;paused=false;accumulator=0;lastFrame=null;
  if(model.phase==='combat'){try{beginFight();}catch(error){restoreAfterCombatError(error);return;}}
  show(true);
 }
 function close(){
  if(!active)return false;
  if(model&&!checkpoint(false))return false;
  active=false;clearInput();disposeFight();host.cancelAnimationFrame(raf);raf=0;lastFrame=null;accumulator=0;
  view.close();bridge.onExit?.();doc.getElementById('hubSailingButton')?.focus({preventScroll:true});return true;
 }
 function setPanel(name){
  optionalPanel=name;clearInput();show(true);
 }
 function closePanel(){
  if(optionalPanel){optionalPanel=null;craftTarget='';show(true);}
 }
 function setControl(value){
  const next=value==='point'?'point':'direct';
  if(settings.control===next)return;
  settings.control=next;writeSettings();clearInput();
  if(model)model.waypoint=null;
  show(currentPanel()==='settings');view.toast(next==='direct'?'Direct control enabled.':'Click / tap to move enabled.','success');
 }
 function togglePause(){
  if(!model||harbor||model.phase==='draft'||model.phase==='finished')return;
  if(saveError&&!checkpoint(false))return;
  paused=!paused;accumulator=0;lastFrame=null;clearInput();
  if(paused)checkpoint(false);show(currentPanel()==='settings');
 }
 function onlySea(){
  if(!model||harbor||model.phase!=='sailing')throw Error('Finish the current encounter first.');
  return R.player(model);
 }
 function selectDeploy(ids){
  const out=commit(()=>R.deploy(model,ids));if(out.ok)view.hud(model,context());
 }
 function point(pos){
  if(!active||harbor||!model||paused||currentPanel()||model.phase!=='sailing'||settings.control!=='point')return;
  if(R.player(model).docked){view.toast('Undock using Dock / Flag before setting a course.');return;}
  model.waypoint={x:M.clamp(pos.x,18,M.SIZE-18),y:M.clamp(pos.y,18,M.SIZE-18)};
 }
 function action(type,data={}){
  if(!active)return;
  try{
   switch(type){
    case'exit':close();return;
    case'save':checkpoint(true);return;
    case'pause':togglePause();return;
    case'control':setControl(settings.control==='direct'?'point':'direct');return;
    case'setControl':setControl(data.mode);return;
    case'closePanel':closePanel();return;
    case'guide':setPanel('guide');return;
    case'settings':setPanel('settings');return;
    case'new':
     if(model||loadError){confirmReturn=optionalPanel;setPanel('new-confirm');}else newVoyage();return;
    case'cancelNew':optionalPanel=confirmReturn;confirmReturn=null;show(true);return;
    case'confirmNew':newVoyage();return;
    case'resume':resume();return;
   }
   if(!model||harbor)return;
   if(saveError){view.toast('Save this paused voyage before continuing.','danger');return;}
   const p=R.player(model);
   switch(type){
    case'chooseCaptain':if(commit(()=>R.chooseCaptain(model,data.id)).ok){optionalPanel=null;paused=false;show(true);}break;
    case'crew':onlySea();setPanel('crew');break;
    case'toggleDeploy':{const ids=new Set(model.deployIds);if(ids.has(data.id))ids.delete(data.id);else ids.add(data.id);selectDeploy([...ids]);break;}
    case'allDeploy':selectDeploy(K.living(p.crew).map(u=>u.uid));break;
    case'clearDeploy':selectDeploy([]);break;
    case'island':{
     onlySea();const i=M.nearestIsland(model,p,true);
     if(!p.docked&&i){if(commit(()=>R.dock(model,p,i)).ok){setPanel('island');}}
     else setPanel('island');break;
    }
    case'dock':{onlySea();const i=M.islandById(model,data.id);if(commit(()=>R.dock(model,p,i)).ok)setPanel('island');break;}
    case'undock':if(onlySea().docked&&commit(()=>R.undock(model,p)).ok){optionalPanel=null;show(true);}break;
    case'course':{
     onlySea();const i=M.islandById(model,data.id);if(!i)throw Error('Island unavailable.');
     if(p.docked)throw Error('Undock before choosing a course.');
     setControl('point');model.waypoint={x:i.x,y:i.y};optionalPanel=null;show(true);break;
    }
    case'capture':{
     onlySea();const i=M.islandById(model,p.docked);
     if(!i||p.level<2)throw Error('Ship Lv. 2 and docking are required.');
     const other=R.contested(model,p,i);
     if(other){
      if(R.isBusy(other))throw Error('The island owner is already in battle.');
      const out=commit(()=>{const e=K.captainEncounter(model,other,i.id);e.intent='contest';if(!R.beginEncounter(model,e))throw Error('Unable to contest this island.');});
      if(out.ok){optionalPanel=null;show(true);}
     }else if(commit(()=>R.capture(model,p,i),'Flag planted. The island now sends passive income.').ok)show(true);
     break;
    }
    case'craft':onlySea();craftTarget='';setPanel('craft');break;
    case'craftTarget':onlySea();craftTarget=data.id||'';show(true);break;
    case'forge':{
     onlySea();const out=commit(()=>R.craft(model,p,data.kind,craftTarget||null));
     if(out.ok){const name=K.recipe(data.kind).name;view.toast('Crafted Legendary Unique '+name+' · '+host.RelicSystem.describe(out.result.roll).replace(/ Unbound\.?$/,''),'success');show(true);}
     break;
    }
    case'equip':{
     onlySea();const u=p.crew.find(c=>c.uid===data.uid);if(!u)throw Error('Crew member unavailable.');
     if((u.relic?.id||'')===data.id)break;
     if(commit(()=>R.equip(model,p,data.uid,data.id||null)).ok)show(true);break;
    }
    case'upgrade':onlySea();setPanel('upgrade');break;
    case'doUpgrade':if(onlySea()&&commit(()=>R.upgrade(model,p),'Ship upgraded. New crew slots available.').ok)show(true);break;
    case'board':{
     onlySea();const other=R.get(model,data.id);
     if(!other||!R.alive(other)||R.isBusy(other)||M.distance(p,other)>B.BOARD_RANGE||model.elapsed<p.cooldownUntil||model.elapsed<other.cooldownUntil)throw Error('Sail closer to an available captain.');
     if(commit(()=>{const e=K.captainEncounter(model,other,p.docked||other.docked);e.intent='challenge';if(!R.beginEncounter(model,e))throw Error('Captain is unavailable.');}).ok){optionalPanel=null;show(true);}break;
    }
    case'flee':if(commit(()=>R.flee(model)).ok){optionalPanel=null;show(true);}break;
    case'fight':{
     const out=commit(()=>R.startFight(model));if(out.ok){paused=false;optionalPanel=null;accumulator=0;try{beginFight();show(true);}catch(error){restoreAfterCombatError(error);}}
     break;
    }
    case'continue':if(commit(()=>R.continueReport(model)).ok){optionalPanel=null;show(true);}break;
    case'pickRecruit':{
     const out=commit(()=>R.pickRecruit(model,Number(data.index)));if(out.ok){if(out.result?.success===false)view.toast('The recruit escaped. This capture attempt is over.','danger');show(true);}break;
    }
    case'replaceRecruit':if(commit(()=>R.resolveRecruit(model,data.id),'Recruit joined your crew.').ok)show(true);break;
    case'salvageRecruit':if(commit(()=>R.resolveRecruit(model,'salvage'),'Recruit salvaged for Material.').ok)show(true);break;
   }
  }catch(error){view.toast(error?.message||'This action is unavailable.','danger');if(type==='equip')show(true);}
 }
 const actions={act:action,point,joystick:value=>{joystick=value;}};
 function directVector(){
  if(joystick)return joystick;
  let x=0,y=0;
  if(held.has('left'))x--;if(held.has('right'))x++;if(held.has('up'))y--;if(held.has('down'))y++;
  const d=Math.hypot(x,y);return d?{x:x/d,y:y/d}:null;
 }
 function activeClock(){return model&&!harbor&&!paused&&!doc.hidden&&['sailing','combat'].includes(model.phase)&&!fight?.restoring;}
 function phaseChanged(before){
  if(!model||model.phase===before)return false;
  optionalPanel=null;clearInput();accumulator=0;
  if(model.phase!=='combat')disposeFight();checkpoint(false);show(true);return true;
 }
 function frame(ms){
  if(!active)return;
  const now=ms/1000,dt=lastFrame===null?0:Math.max(0,now-lastFrame);lastFrame=now;
  try{
   if(model&&!harbor&&!paused&&!doc.hidden&&model.phase==='combat'&&fight?.restoring)fight.step(0);
   if(activeClock()){
    accumulator+=dt;
    const budget=host.performance.now()+5;
    let loops=0;
    while(accumulator+1e-8>=R.STEP&&activeClock()&&loops++<120){
     const before=model.phase,day=model.day,lock=model.repairLocked;
     const sailingWithoutPanel=!currentPanel()&&model.phase==='sailing';
     R.stepWorld(model,R.STEP,{vector:sailingWithoutPanel&&settings.control==='direct'?directVector():null,autopilot:sailingWithoutPanel&&settings.control==='point'});
     accumulator=Math.max(0,accumulator-R.STEP);saveClock+=R.STEP;
     if(phaseChanged(before))break;
     if(day!==model.day||lock!==model.repairLocked)checkpoint(false);
     if(host.performance.now()>budget)break;
    }
    if(model.phase==='combat'&&fight&&!paused){
     fight.step(Math.min(.5,dt));syncFightCheckpoint();
     if(fight.done){const before=model.phase,out=fight.outcome;if(!out?.sailingCrew)throw Error('The boarding result is incomplete.');R.settlePlayer(model,out);disposeFight();phaseChanged(before);}
    }
    if(saveClock+1e-8>=5)checkpoint();
   }else accumulator=0;
  }catch(error){
   if(model?.phase==='combat')restoreAfterCombatError(error);
   else {paused=true;accumulator=0;clearInput();view.toast('Voyage paused: '+String(error?.message||error).slice(0,140),'danger');checkpoint(false);}
  }
  if(!active)return;
  if(!doc.hidden){
   const world=model||preview;
   // The ocean behind a dialog only needs an ambient refresh. The open sea
   // remains on requestAnimationFrame; the tactical board gets its own frame.
   const oceanInterval=currentPanel()||paused||harbor?(model?.phase==='combat'?.20:.12):0;
   if(world&&now-oceanAt>=oceanInterval){oceanAt=now;view.ocean(world,now,Math.min(.1,dt),!harbor&&settings.control==='point'?model?.waypoint:null);}
   if(now-hudAt>=.19){hudAt=now;view.hud(model,context());}
   if(fight&&model?.phase==='combat')view.combat(fight,now,paused);
  }
  raf=host.requestAnimationFrame(frame);
 }
 function open(){
  if(active)return true;if(bridge.canOpen?.()===false)return false;
  settings=readSettings();const loaded=R.load();model=loaded.state;loadError=loaded.error;
  preview ||= R.create(931905,'You');
  view ||= host.SailingUI.makeView(actions);if(!view)return false;
  active=true;harbor=true;paused=false;loadError=loaded.error;saveError=false;saveStatus=model?'Saved voyage':'Local voyage';optionalPanel=null;craftTarget='';saveClock=0;lastFrame=null;accumulator=0;hudAt=-Infinity;
  bridge.onEnter?.();view.open();show(true);raf=host.requestAnimationFrame(frame);return true;
 }
 function keydown(event){
  if(!active)return;
  const key=String(event.key||'').toLowerCase(),editable=/^(INPUT|SELECT|TEXTAREA)$/.test(event.target?.tagName)||event.target?.isContentEditable;
  if(key==='escape'){event.preventDefault();event.stopPropagation();if(optionalPanel)closePanel();else if(harbor)close();else if(model?.phase==='sailing')setPanel('settings');else togglePause();return;}
  if(editable||event.ctrlKey||event.metaKey||event.altKey)return;
  if(key==='p'&&!event.repeat){event.preventDefault();togglePause();return;}
  if(key==='c'&&!event.repeat){event.preventDefault();action('control');return;}
  if(movement.has(key)&&model&&!harbor&&!paused&&!currentPanel()&&model.phase==='sailing'&&settings.control==='direct'){
   event.preventDefault();event.stopPropagation();held.add(movement.get(key));return;
  }
  if(!currentPanel()&&model?.phase==='sailing'&&/^[1-5]$/.test(key)&&!event.repeat){event.preventDefault();action(['','crew','island','craft','upgrade','guide'][Number(key)]);}
 }
 doc.addEventListener('keydown',keydown,true);
 doc.addEventListener('keyup',event=>{const key=movement.get(String(event.key||'').toLowerCase());if(active&&key)held.delete(key);},true);
 host.addEventListener('blur',()=>{if(active)clearInput();});
 host.addEventListener('resize',()=>{oceanAt=hudAt=-Infinity;});
 doc.addEventListener('visibilitychange',()=>{if(!active)return;clearInput();lastFrame=null;accumulator=0;if(doc.hidden)checkpoint(false);});
 host.addEventListener('pagehide',()=>{if(active)checkpoint(false);});
 host.SailingSea=Object.freeze({configure(options){bridge=options||{};},open,close,save:()=>checkpoint(true),snapshot:()=>model?C.clone(model):null,get active(){return active;},get paused(){return paused;},get settings(){return {...settings};},get fight(){return fight;}});
})(window);
