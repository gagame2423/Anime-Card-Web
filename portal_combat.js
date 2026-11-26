/* Portal sessions use the primary Battle Arena renderer, bars, effects and logs. */
(function(host){
 'use strict';
 const U=host.OnlineUtils,R=host.PortalRules,nodes=new Map(),saved=new Map();
 let bridge={},session=null,timer=null,clock=null,fronts=null,logBackup=[],autoTimer=null,auto=host.localStorage.getItem('anime_portal_auto')==='true',autoUp=host.localStorage.getItem('anime_portal_auto_up')==='true';
 const el=id=>{if(!nodes.has(id)){const n=host.document.getElementById(id);if(n)nodes.set(id,n);}return nodes.get(id);};
 const text=(id,value)=>U.text(el(id),value);
 function syncAuto(){
  const guest=host.PortalParty?.active&&!host.PortalParty.isHost;
  for(const id of ['portalAutoContinue','portalResultAuto']){const input=el(id);if(input){input.checked=auto&&!guest;input.disabled=guest;}}
  for(const id of ['portalAutoUp','portalCombatAutoUp','portalResultAutoUp']){const input=el(id);if(input){input.checked=autoUp&&!guest;input.disabled=guest;}}
  for(const node of host.document.querySelectorAll('[data-portal-auto-state]'))node.textContent=auto&&!guest?'ON':'OFF';
  for(const node of host.document.querySelectorAll('[data-portal-up-state]'))node.textContent=guest?'HOST ONLY':autoUp?'ON':'OFF';
 }
 function setTiming(ms){if(!session)return;session.turnMs=ms===1000?1000:2000;updateTimingLabel();}
 function updateTimingLabel(){
  if(!session)return;const ms=session.turnMs;
  text('portalCombatAttempts',`${session.portal.attempts} / 5 attempts · ${ms/1000}s turns`);
  text('battleModeLabel',R.definition(session.portal).name.toUpperCase()+' · 4V4 · '+ms/1000+'s TURNS');
  text('battleAutoNote','Portal · '+ms/1000+'-second turns · '+(session.party?'Host controls shared pace':'Speed Battle Potion: 1s turns')+' · Auto Go Up preserves attempts');
 }
 function remember(n){if(n&&!saved.has(n))saved.set(n,{hidden:n.hidden,cls:n.classList.contains('hidden'),text:n.textContent,fullClass:n.id==='battleVictory'?n.className:null});return n;}
 function hide(n){if(remember(n))n.classList.add('hidden');}
 function show(n){if(remember(n)){n.hidden=false;n.classList.remove('hidden');}}
 function clearTimers(){if(timer!==null)host.clearTimeout(timer);if(clock!==null)host.clearInterval(clock);if(autoTimer!==null)host.clearTimeout(autoTimer);autoTimer=null;timer=clock=null;}
 function render(){if(!session)return;const b=session.combat.battle;bridge.render?.();const current=[b.playerTeam[b.playerIndex],b.enemyTeam[b.enemyIndex]];if(fronts)current.forEach((u,i)=>{if(u&&u!==fronts[i])bridge.promote?.(i===0?'player':'enemy');});fronts=current;text('portalCombatWave',R.definition(session.portal).name.toUpperCase()+' · '+R.tierName(session.portal.tier));text('portalCombatModifiers',`${session.portal.element} enemies · ${session.portal.category} +${session.portal.bonus}% HP/ATK · ${session.party?'Party':'Solo'}`);updateTimingLabel();host.BattleWeatherHud?.render();}
 function clockTick(){if(!session)return;const b=session.combat.battle;text('battleStatus',b.finished?'PORTAL ENDED':`${b.turn==='player'?'PLAYER':'ENEMY'} STRIKE IN ${Math.max(0,Math.ceil(((b.nextTurnAt||Date.now()+session.turnMs)-Date.now())/1000))}s`);}
 function start(options){
  if(session)throw Error('A Portal battle is already active.');
  for(const id of ['battleModal','battleArena','portalArenaHud','portalModal'])if(!el(id))throw Error('Missing shared Arena: '+id);
  session={...options,summary:null,turnMs:options.party?(options.turnMs===1000?1000:2000):R.turnMs()};syncAuto();fronts=null;bridge.clear?.();logBackup=host.BattleLogView.backup(host.document);host.BattleLogView.restore(host.document);
  hide(el('portalModal'));hide(el('inventoryModal'));hide(el('battleSetup'));hide(el('battleVictory'));
  for(const id of ['infinityArenaHud','trainingDamageHud','timeTrialTimer','spookyInfoBattleButton','spookyLiveCoins','spookySpeedUpControl','sandboxOpenButton'])hide(el(id));hide(el('autoContinueBattleToggle')?.closest('.battle-auto-continue'));
  show(el('battleModal'));show(el('battleArena'));show(el('portalArenaHud'));text('portalCombatResult','');text('portalAutomationStatus','');
  remember(el('battleAutoNote'));saved.get(el('battleAutoNote')).restoreText=true;updateTimingLabel();
  session.combat=R.createCombat(options.players,options.portal,options.seed,{prepare:(battle,engine)=>{session.combat={battle,engine};},weather:options.weather,log:bridge.log,float:bridge.float,render:()=>host.RollPerformanceSystem.schedule(render)});
  bridge.lock?.(true);host.document.body.classList.add('modal-open');clock=host.setInterval(clockTick,250);render();
  if(!options.party)schedule();return session.combat;
 }
 function schedule(remaining){
  if(!session||session.party)return;
  if(timer!==null)host.clearTimeout(timer);
  setTiming(R.turnMs());const delay=Number.isFinite(remaining)?Math.max(0,Math.min(session.turnMs,remaining)):session.turnMs;
  session.combat.battle.nextTurnAt=Date.now()+delay;
  timer=host.setTimeout(()=>{timer=null;try{step();if(session.combat.battle.finished)complete();else schedule();}catch(error){text('portalCombatResult',error.message+' · Exit to stop this attempt.');}},delay);
 }
 function refreshTiming(){
  if(!session||session.party||session.combat?.battle?.finished||timer===null)return;
  const next=R.turnMs();if(next===session.turnMs)return;
  const fraction=Math.max(0,Math.min(1,(session.combat.battle.nextTurnAt-Date.now())/session.turnMs));
  schedule(fraction*next);clockTick();
 }
 function step(){if(!session)throw Error('Portal combat not initialized.');const b=session.combat.battle,side=b.turn;bridge.log?.(`TURN ${(b.turnCount||0)+1} · ${side.toUpperCase()} ATTACK`,side);bridge.attack?.(side);session.combat.step();render();clockTick();return session.combat;}
 function complete(partyInfo={}){
  if(!session)return null;if(session.summary)return session.summary;
  clearTimers();const b=session.combat.battle,won=b.portalWinner==='player';
  try{const summary=host.PortalsSystem.finish({id:session.id,portal:session.portal,won,party:session.party,mvp:Boolean(partyInfo.mvp),battle:session.combat.battle},R.generator((session.seed^0xa52c39f1)>>>0));if(!summary)throw Error('Portal result is already closed or unavailable.');session.summary=summary;host.PortalsSystem.showSummary(summary);render();showResult(summary);return summary;}
  catch(error){text('portalCombatResult',error.message+' · Use Retry Save before leaving.');const retry=el('portalRetrySave');if(retry)retry.hidden=false;return null;}
 }
 function release(){if(!session)return;clearTimers();host.RollPerformanceSystem.cancel(render);bridge.clear?.();session=null;fronts=null;for(const[n,s]of saved){n.hidden=s.hidden;n.classList.toggle('hidden',s.cls);if(s.fullClass!==null)n.className=s.fullClass;if(s.restoreText)n.textContent=s.text;}saved.clear();el('battleVictory').setAttribute('aria-hidden',String(el('battleVictory').classList.contains('hidden')));el('portalArenaHud').hidden=true;el('portalRetrySave').hidden=true;host.BattleLogView.restore(host.document,logBackup);logBackup=[];bridge.lock?.(false);}
 function showResult(summary){
  if(autoTimer!==null)host.clearTimeout(autoTimer);autoTimer=null;
  hide(el('battleArena'));show(el('battleVictory'));el('battleVictory').setAttribute('aria-hidden','false');
  remember(el('battleVictory'));el('battleVictory').classList.remove('battle-result--neutral','battle-result--victory','battle-result--defeat');el('battleVictory').classList.add(summary.won?'battle-result--victory':'battle-result--defeat');
  const b=session.combat.battle,values={battleResultTitle:summary.won?'🏆 PORTAL VICTORY!':'PORTAL DEFEAT',battleResultText:`${summary.foodName||'Senzu Beans'} +${summary.beans} · 0 EXP · ${summary.cardLabel||summary.card||'No card drop'}${summary.mvp?' · ★ MVP x3':''}${summary.consumed?' · Portal consumed':''}`,battleResultPower:`Turns: ${b.turnCount||0} · Damage: ${Math.floor(b.damageTotals?.player||0).toLocaleString('en-US')} · ${session.party?'Party':'Solo'}`,battleResultBaseLabel:summary.foodName||'Senzu Beans',battleResultBaseValue:'+'+summary.beans,battleResultTimeLabel:'Guest share',battleResultTimeBonus:summary.guest?'x0.5':'x1',battleResultLevelLabel:'MVP multiplier',battleResultLevelDiff:summary.mvp?'★ MVP x3':'x1',battleResultCash:'0 VNĐ',battleResultExp:'0 EXP',battleResultDropRate:summary.cardLabel||summary.card||'No card',battleResultLossStatus:summary.consumed?'PORTAL CONSUMED':`${summary.remaining}/5 attempts`};
  for(const[id,value]of Object.entries(values)){const n=remember(el(id));if(n){saved.get(n).restoreText=true;text(id,value);}}
  for(const n of el('battleVictory').querySelectorAll('.battle-result__actions, .time-trial-summary'))hide(n);
  show(el('portalResultActions'));const current=host.PortalsSystem.get(session.portal.id),can=session.party?host.PortalParty.canContinue:Boolean(current);
  el('portalContinue').disabled=!can;text('portalContinue',can?'Continue / Next Match':'Portal unavailable / Waiting for Host');
  syncAuto();
  if(autoUp&&!summary.won&&summary.remaining<=1&&(!session.party||host.PortalParty.isHost)){
   stopAuto();text('portalAutomationStatus',summary.remaining===1?'Auto Go Up paused — only one attempt remains.':'Auto Go Up paused — no attempts remain.');return;
  }
  if((auto||autoUp)&&(!session.party||host.PortalParty.isHost))autoTimer=host.setTimeout(()=>{
   autoTimer=null;if(auto||autoUp)host.PortalsSystem.continueMatch(true,summary);
  },1800);
 }
 function stopAuto(){
  auto=false;autoUp=false;try{host.localStorage.setItem('anime_portal_auto','false');host.localStorage.setItem('anime_portal_auto_up','false');}catch(_){}
  if(autoTimer!==null)host.clearTimeout(autoTimer);autoTimer=null;syncAuto();
 }
 function configure(options){
  bridge=options||{};syncAuto();
  function change(event,up){
   if(host.PortalParty?.active&&!host.PortalParty.isHost){syncAuto();return;}
   if(up)autoUp=event.target.checked;else auto=event.target.checked;
   try{host.localStorage.setItem(up?'anime_portal_auto_up':'anime_portal_auto',String(up?autoUp:auto));}catch(_){}
   syncAuto();if(autoTimer!==null){host.clearTimeout(autoTimer);autoTimer=null;}
   if((auto||autoUp)&&session?.summary)showResult(session.summary);
  }
  for(const id of ['portalAutoContinue','portalResultAuto'])el(id)?.addEventListener('change',event=>change(event,false));
  for(const id of ['portalAutoUp','portalCombatAutoUp','portalResultAutoUp'])el(id)?.addEventListener('change',event=>change(event,true));
  el('portalContinue')?.addEventListener('click',()=>host.PortalsSystem.continueMatch(false));
  el('portalBattleExit')?.addEventListener('click',()=>host.PortalsSystem.exit());
  el('portalRetrySave')?.addEventListener('click',()=>{const result=complete(session?.partyInfo||{});if(result)el('portalRetrySave').hidden=true;});
 }
 host.PortalCombatView=Object.freeze({configure,start,step,complete,release,render,stopAuto,syncAuto,setTiming,refreshTiming,clock:clockTick,
  get active(){return Boolean(session);},get battle(){return session?.combat?.battle||null;},get runtime(){return session?.combat?.engine||null;},get combat(){return session?.combat||null;},
  get autoUp(){return autoUp;},get turnMs(){return session?.turnMs||R.turnMs();},get modeLabel(){return (session?R.definition(session.portal).name.toUpperCase():'PORTAL')+' · 4V4 · '+(session?.turnMs||R.turnMs())/1000+'s TURNS';},setPartyInfo:info=>{if(session)session.partyInfo=info;}});
})(window);
