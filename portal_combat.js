/* Portal sessions use the primary Battle Arena renderer, bars, effects and logs. */
(function(host){
 'use strict';
 const U=host.OnlineUtils,R=host.PortalRules,nodes=new Map(),saved=new Map();
 let bridge={},session=null,timer=null,clock=null,fronts=null,logBackup=[],autoTimer=null,auto=host.localStorage.getItem('anime_portal_auto')==='true';
 const el=id=>{if(!nodes.has(id)){const n=host.document.getElementById(id);if(n)nodes.set(id,n);}return nodes.get(id);};
 const text=(id,value)=>U.text(el(id),value);
 function syncAuto(){for(const id of ['portalAutoContinue','portalResultAuto'])if(el(id))el(id).checked=auto;for(const node of host.document.querySelectorAll('[data-portal-auto-state]'))node.textContent=auto?'ON':'OFF';}
 function remember(n){if(n&&!saved.has(n))saved.set(n,{hidden:n.hidden,cls:n.classList.contains('hidden'),text:n.textContent,fullClass:n.id==='battleVictory'?n.className:null});return n;}
 function hide(n){if(remember(n))n.classList.add('hidden');}
 function show(n){if(remember(n)){n.hidden=false;n.classList.remove('hidden');}}
 function clearTimers(){if(timer!==null)host.clearTimeout(timer);if(clock!==null)host.clearInterval(clock);if(autoTimer!==null)host.clearTimeout(autoTimer);autoTimer=null;timer=clock=null;}
 function render(){if(!session)return;const b=session.combat.battle;bridge.render?.();const current=[b.playerTeam[b.playerIndex],b.enemyTeam[b.enemyIndex]];if(fronts)current.forEach((u,i)=>{if(u&&u!==fronts[i])bridge.promote?.(i===0?'player':'enemy');});fronts=current;text('portalCombatWave','NAMEK · '+R.tierName(session.portal.tier));text('portalCombatModifiers',`${session.portal.element} enemies · ${session.portal.category} +${session.portal.bonus}% HP/ATK · ${session.party?'Party':'Solo'}`);text('portalCombatAttempts',`${session.portal.attempts} / 5 attempts · fixed 2s turns`);text('battleModeLabel','NAMEK PORTAL · 4V4 · 2s TURNS');host.BattleWeatherHud?.render();}
 function clockTick(){if(!session)return;const b=session.combat.battle;text('battleStatus',b.finished?'PORTAL ENDED':`${b.turn==='player'?'PLAYER':'ENEMY'} STRIKE IN ${Math.max(0,Math.ceil(((b.nextTurnAt||Date.now()+2000)-Date.now())/1000))}s`);}
 function start(options){
  if(session)throw Error('A Portal battle is already active.');
  for(const id of ['battleModal','battleArena','portalArenaHud','portalModal'])if(!el(id))throw Error('Missing shared Arena: '+id);
  session={...options,summary:null};fronts=null;bridge.clear?.();const log=el('battleLog');logBackup=log?[...log.childNodes]:[];log?.replaceChildren();
  hide(el('portalModal'));hide(el('inventoryModal'));hide(el('battleSetup'));hide(el('battleVictory'));
  for(const id of ['infinityArenaHud','trainingDamageHud','timeTrialTimer','spookyInfoBattleButton','spookyLiveCoins','spookySpeedUpControl','sandboxOpenButton'])hide(el(id));hide(el('autoContinueBattleToggle')?.closest('.battle-auto-continue'));
  show(el('battleModal'));show(el('battleArena'));show(el('portalArenaHud'));text('portalCombatResult','');
  remember(el('battleAutoNote'));saved.get(el('battleAutoNote')).restoreText=true;text('battleAutoNote','Portal · Fixed 2-second turns · Speed potions ignored · Auto Continue disabled');
  session.combat=R.createCombat(options.players,options.portal,options.seed,{weather:options.weather,log:bridge.log,float:bridge.float,render:()=>host.RollPerformanceSystem.schedule(render)});
  bridge.lock?.(true);host.document.body.classList.add('modal-open');clock=host.setInterval(clockTick,250);render();
  if(!options.party)schedule();return session.combat;
 }
 function schedule(){if(!session||session.party)return;session.combat.battle.nextTurnAt=Date.now()+2000;timer=host.setTimeout(()=>{timer=null;try{step();if(session.combat.battle.finished)complete();else schedule();}catch(error){text('portalCombatResult',error.message+' · Exit to stop this attempt.');}},2000);}
 function step(){if(!session)throw Error('Portal combat not initialized.');const b=session.combat.battle,side=b.turn;bridge.log?.(`TURN ${(b.turnCount||0)+1} · ${side.toUpperCase()} ATTACK`,side);bridge.attack?.(side);session.combat.step();render();clockTick();return session.combat;}
 function complete(partyInfo={}){
  if(!session)return null;if(session.summary)return session.summary;
  clearTimers();const b=session.combat.battle,won=b.portalWinner==='player';
  try{const summary=host.PortalsSystem.finish({id:session.id,portal:session.portal,won,party:session.party,mvp:Boolean(partyInfo.mvp)},R.generator((session.seed^0xa52c39f1)>>>0));if(!summary)throw Error('Portal result is already closed or unavailable.');session.summary=summary;host.PortalsSystem.showSummary(summary);render();showResult(summary);return summary;}
  catch(error){text('portalCombatResult',error.message+' · Use Retry Save before leaving.');const retry=el('portalRetrySave');if(retry)retry.hidden=false;return null;}
 }
 function release(){if(!session)return;clearTimers();host.RollPerformanceSystem.cancel(render);bridge.clear?.();session=null;fronts=null;for(const[n,s]of saved){n.hidden=s.hidden;n.classList.toggle('hidden',s.cls);if(s.fullClass!==null)n.className=s.fullClass;if(s.restoreText)n.textContent=s.text;}saved.clear();el('battleVictory').setAttribute('aria-hidden',String(el('battleVictory').classList.contains('hidden')));el('portalArenaHud').hidden=true;el('portalRetrySave').hidden=true;el('battleLog')?.replaceChildren(...logBackup);logBackup=[];bridge.lock?.(false);}
 function showResult(summary){
  if(autoTimer!==null)host.clearTimeout(autoTimer);autoTimer=null;
  hide(el('battleArena'));show(el('battleVictory'));el('battleVictory').setAttribute('aria-hidden','false');
  remember(el('battleVictory'));el('battleVictory').classList.remove('battle-result--neutral','battle-result--victory','battle-result--defeat');el('battleVictory').classList.add(summary.won?'battle-result--victory':'battle-result--defeat');
  const b=session.combat.battle,values={battleResultTitle:summary.won?'🏆 PORTAL VICTORY!':'PORTAL DEFEAT',battleResultText:`Senzu Beans +${summary.beans} · 0 EXP · ${summary.cardLabel||summary.card||'No card drop'}${summary.mvp?' · ★ MVP x3':''}${summary.consumed?' · Secret Portal consumed':''}`,battleResultPower:`Turns: ${b.turnCount||0} · Damage: ${Math.floor(b.damageTotals?.player||0).toLocaleString('en-US')} · ${session.party?'Party':'Solo'}`,battleResultBaseLabel:'Senzu Beans',battleResultBaseValue:'+'+summary.beans,battleResultTimeLabel:'Guest share',battleResultTimeBonus:summary.guest?'x0.5':'x1',battleResultLevelLabel:'MVP multiplier',battleResultLevelDiff:summary.mvp?'★ MVP x3':'x1',battleResultCash:'0 VNĐ',battleResultExp:'0 EXP',battleResultDropRate:summary.cardLabel||summary.card||'No card',battleResultLossStatus:summary.consumed?'SECRET CONSUMED':`${summary.remaining}/5 attempts`};
  for(const[id,value]of Object.entries(values)){const n=remember(el(id));if(n){saved.get(n).restoreText=true;text(id,value);}}
  for(const n of el('battleVictory').querySelectorAll('.battle-result__actions, .time-trial-summary'))hide(n);
  show(el('portalResultActions'));const current=host.PortalsSystem.get(session.portal.id),can=session.party?host.PortalParty.canContinue:Boolean(current);
  el('portalContinue').disabled=!can;text('portalContinue',can?'Continue / Next Match':'Portal unavailable / Waiting for Host');
  syncAuto();
  if(auto&&can&&current?.tier===session.portal.tier)autoTimer=host.setTimeout(()=>{autoTimer=null;host.PortalsSystem.continueMatch(true);},1800);
 }
 function configure(options){bridge=options||{};syncAuto();for(const id of ['portalAutoContinue','portalResultAuto'])el(id)?.addEventListener('change',event=>{auto=event.target.checked;host.localStorage.setItem('anime_portal_auto',String(auto));syncAuto();if(!auto&&autoTimer!==null){host.clearTimeout(autoTimer);autoTimer=null;}else if(auto&&session?.summary)showResult(session.summary);});el('portalContinue')?.addEventListener('click',()=>host.PortalsSystem.continueMatch(false));el('portalBattleExit')?.addEventListener('click',()=>host.PortalsSystem.exit());el('portalRetrySave')?.addEventListener('click',()=>{const result=complete(session?.partyInfo||{});if(result)el('portalRetrySave').hidden=true;});}
 host.PortalCombatView=Object.freeze({configure,start,step,complete,release,render,clock:clockTick,get active(){return Boolean(session);},get battle(){return session?.combat.battle||null;},get runtime(){return session?.combat.engine||null;},get combat(){return session?.combat||null;},get modeLabel(){return 'NAMEK PORTAL · 4V4 · 2s TURNS';},setPartyInfo:info=>{if(session)session.partyInfo=info;}});
})(window);
