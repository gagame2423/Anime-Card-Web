/* Infinity HUD and lifecycle only. All fighters/effects use the Arena renderer. */
(function(host){
 'use strict';
 const U=host.OnlineUtils,nodes=new Map(),saved=new Map();
 let bridge={},session=null,info=null,fronts=null,logBackup=[],mounted=false;
 const el=id=>{if(!nodes.has(id)){const node=host.document.getElementById(id);if(node)nodes.set(id,node);}return nodes.get(id);};
 const text=(id,value)=>U.text(el(id),value),number=value=>Math.max(0,Math.floor(Number(value)||0)).toLocaleString('en-US');
 function remember(node){if(node&&!saved.has(node))saved.set(node,{hidden:node.hidden,cls:node.classList.contains('hidden')});return node;}
 function hide(node){if(remember(node))node.classList.add('hidden');}
 function show(node){if(remember(node)){node.hidden=false;node.classList.remove('hidden');}}
 function turnMs(){return host.InventorySystem.combatTurnMs(3000);}
 function clock(){
  if(!session)return;const bs=session.battle;
  text('battleStatus',bs.finished?'INFINITY RUN ENDED':`${bs.turn==='player'?'PLAYER':'ENEMY'} STRIKE IN ${Math.max(0,Math.ceil(((bs.nextTurnAt||Date.now()+turnMs())-Date.now())/1000))}s`);
  text('battleModeLabel',modeLabel());host.BattleWeatherHud?.render();
 }
 function modeLabel(){return `INFINITY • 4V4 • ${turnMs()/1000}s TURNS`;}
 function render(next){
  if(!session)return;if(next)info=next;const bs=session.battle,week=info.week;
  text('infinityWave',`Wave ${number(bs.infinity.wave)} - Continuous`);
  text('infinityRunState',bs.finished?'RUN ENDED':'INFINITY');
  text('infinityWeekBadge',`${week.id} · Seed ${week.seed}`);
  text('infinityCategoryBadge',`Category: ${week.category}`);
  text('infinityElementBadge',`Enemy Element: ${week.element}`);
  text('infinityOrbTracker',`Star Orbs +${number(info.orbs)}`);
  text('infinityRunProgress',`Run cleared: ${number(bs.infinity.highest)} · Weekly best: ${number(info.best)}`);
  const progress=el('infinityBestBar');if(progress){progress.max=Math.max(1,info.best);progress.value=bs.infinity.highest;progress.setAttribute('aria-valuetext',`${number(bs.infinity.highest)} cleared; weekly best ${number(info.best)}`);}
  for(const id of ['infinityRestart','infinityArenaLeaderboard'])if(el(id))el(id).hidden=!bs.finished;
  text('infinityArenaMessage',bs.finished?(info.message||'Run ended. Cleared-wave rewards are saved.'):'HP, shields, buffs and counters carry into the next wave.');
  const current=[bs.playerTeam[bs.playerIndex],bs.enemyTeam[bs.enemyIndex]];
  if(fronts)current.forEach((unit,index)=>{if(unit&&fronts[index]!==unit)bridge.promote?.(index===0?'player':'enemy');});fronts=current;
  bridge.render?.();clock();
 }
 function mount(battle,runtime,next){
  if(session)throw Error('An Infinity Arena view is already open.');
  for(const id of ['battleModal','battleArena','battleSetup','battleVictory','infinityModal','infinityArenaHud'])if(!el(id))throw Error('Missing shared Arena: '+id);
  session={battle,runtime};info=next;fronts=null;
  bridge.clear?.();const log=el('battleLog');logBackup=log?[...log.childNodes]:[];log?.replaceChildren();
  hide(el('infinityModal'));hide(el('battleSetup'));hide(el('battleVictory'));
  for(const id of ['timeTrialTimer','spookyInfoBattleButton','spookyLiveCoins','spookySpeedUpControl','sandboxOpenButton'])hide(el(id));
  hide(el('autoContinueBattleToggle')?.closest('.battle-auto-continue'));
  show(el('battleModal'));show(el('battleArena'));el('infinityArenaHud').hidden=false;
  remember(el('battleAutoNote'));if(el('battleAutoNote')){saved.get(el('battleAutoNote')).text=el('battleAutoNote').textContent;text('battleAutoNote','Infinity • Continuous waves • Star Orbs only • Player HP, shields and passive timers are retained.');}
  host.document.body.classList.add('modal-open');bridge.lock?.(true);render();el('infinityArenaExit')?.focus();
 }
 function release(){
  if(!session)return;bridge.clear?.();session=null;info=null;fronts=null;
  if(el('infinityArenaHud'))el('infinityArenaHud').hidden=true;
  for(const[node,state]of saved){node.hidden=state.hidden;node.classList.toggle('hidden',state.cls);if(state.text!==undefined)node.textContent=state.text;}saved.clear();
  el('battleLog')?.replaceChildren(...logBackup);logBackup=[];bridge.lock?.(false);
 }
 function log(message,tone){if(session)bridge.log?.(message,tone);}
 function float(unit,message,tone,duration){if(session)bridge.float?.(unit,message,tone,duration);}
 function turn(side){if(session)log(`TURN ${(session.battle.turnCount||0)+1} • ${side==='player'?'PLAYER':'ENEMY'} ATTACK`,side);}
 function attack(side){if(session)bridge.attack?.(side);}
 function configure(options){
  bridge=options||{};if(mounted)return;mounted=true;
  el('infinityArenaExit')?.addEventListener('click',()=>host.InfinitySystem.exit());
  el('infinityArenaLeaderboard')?.addEventListener('click',()=>{if(!session?.battle.finished)return;const field=el('leaderboardMetric');if(field)field.value='infinity';host.document.getElementById('infinityLeaderboard')?.click();});
 }
 host.InfinityViewSystem=Object.freeze({configure,mount,release,render,clock,log,float,turn,attack,get active(){return Boolean(session);},get battle(){return session?.battle||null;},get runtime(){return session?.runtime||null;},get modeLabel(){return modeLabel();}});
})(window);
