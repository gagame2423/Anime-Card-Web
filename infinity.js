/* Weekly Infinity lobby, continuous-run controller, food receipts and score outbox. */
(function(host){
 'use strict';
 const KEY='anime_card_rng_infinity_v1',MAX=Number.MAX_SAFE_INTEGER,R=host.InfinityRules,U=host.OnlineUtils;
 const fresh=()=>({version:1,best:{},reports:{},lastReceipt:'',pending:null});
 const record=v=>Boolean(v&&typeof v==='object'&&!Array.isArray(v));
 const weekId=id=>/^\d{4}_W\d{2}$/.test(id),count=n=>Number.isSafeInteger(n)&&n>=0;
 function validSave(v){return Boolean(record(v)&&v.version===1&&record(v.best)&&record(v.reports)&&Object.entries(v.best).every(([id,n])=>weekId(id)&&count(n))&&Object.entries(v.reports).every(([id,n])=>weekId(id)&&count(n))&&typeof v.lastReceipt==='string'&&/^[a-zA-Z0-9_-]{0,100}$/.test(v.lastReceipt)&&(v.pending===null||v.pending&&weekId(v.pending.weekId)&&count(v.pending.wave)&&v.pending.wave>0&&count(v.pending.orbs)&&v.pending.orbs>0&&/^[a-zA-Z0-9_-]{1,100}$/.test(v.pending.receipt)));}
 let data;try{const saved=JSON.parse(host.localStorage.getItem(KEY)||'null');data=validSave(saved)?saved:fresh();}catch(_){data=fresh();}
 let bridge={},active=false,combat=null,timer=null,uiTimer=null,runId='',runWeek=null,selections=[],sessionOrbs=0,busy=false,reporting=null,lastReport=0,reportAgain=false,blocked=false,clockText='',bound=false;
 const fighterNodes=new WeakMap();
 const el=id=>host.document.getElementById(id),make=(tag,cls='',text)=>U.make(tag,cls,text),text=(id,value)=>U.text(el(id),value);
 function persist(){try{host.localStorage.setItem(KEY,JSON.stringify(data));host.CloudSaveSystem?.markDirty();return true;}catch(_){return false;}}
 function commitReward(){const p=data.pending;if(!p)return true;if(!host.InventorySystem.grantOnce('infinity_wave',p.receipt,'star_orb',p.orbs))return false;data.best[p.weekId]=Math.max(data.best[p.weekId]||0,p.wave);data.reports[p.weekId]=Math.max(data.reports[p.weekId]||0,p.wave);data.lastReceipt=p.receipt;data.pending=null;return persist();}
 if(!commitReward())blocked=true;
 function week(){const now=host.InfinityCloudSystem.now(),remote=host.InfinityCloudSystem.status.week;return remote&&now>=remote.startMs&&now<remote.endMs?remote:R.rotation(now);}
 function cards(){return (bridge.cards?.()||[]).filter(card=>host.CategorySystem.has(card,week().category));}
 function variants(id){return bridge.variants?.(id)||[];}
 function autoFill(){selections=[];const used=new Map();for(const card of cards())for(const v of variants(card.id)){for(let i=0;i<Math.min(4, v.count);i++){if(selections.length===4)return;const n=used.get(v.key)||0;if(n>=v.count)break;selections.push({cardId:card.id,variantKey:v.key});used.set(v.key,n+1);}}}
 function validTeam(){if(selections.length!==4||cards().length===0)return false;const used=new Map(),eligible=new Set(cards().map(card=>card.id));for(const slot of selections){if(!slot||!eligible.has(slot.cardId))return false;const v=variants(slot.cardId).find(v=>v.key===slot.variantKey);if(!v)return false;used.set(v.key,(used.get(v.key)||0)+1);if(used.get(v.key)>v.count)return false;}return true;}
 function renderSetup(){
  const grid=el('infinityTeam');if(!grid)return;grid.replaceChildren();const eligible=cards();
  for(let i=0;i<4;i++){
   const slot=selections[i],box=make('article','infinity-slot'),select=make('select'),mutation=make('select');select.setAttribute('aria-label','Infinity player slot '+(i+1));mutation.setAttribute('aria-label','Infinity slot '+(i+1)+' variant');
   const empty=make('option','','Select card');empty.value='';select.append(empty);
   for(const card of eligible){const option=make('option','',card.name);option.value=card.id;select.append(option);}select.value=slot?.cardId||'';
   for(const v of variants(slot?.cardId)){const option=make('option','',(v.mutations.map(m=>m.name).join(' + ')||'Normal')+' · x'+v.count);option.value=v.key;mutation.append(option);}mutation.value=slot?.variantKey||'';
   select.addEventListener('change',()=>{selections[i]=select.value?{cardId:select.value,variantKey:variants(select.value)[0]?.key||''}:null;renderSetup();});
   mutation.addEventListener('change',()=>{if(selections[i])selections[i].variantKey=mutation.value;renderSetup();});
   box.append(make('strong','','SLOT '+(i+1)),select,mutation);
   if(slot){const card=eligible.find(c=>c.id===slot.cardId),v=variants(slot.cardId).find(v=>v.key===slot.variantKey);if(card&&v){const stats=bridge.describe(card,v),image=make('img');image.src=card.image||'';image.alt=card.name;image.loading='lazy';image.addEventListener('error',()=>image.hidden=true,{once:true});box.append(image,make('small','',`Lvl ${stats.level} · HP ${Math.round(stats.hp).toLocaleString('en-US')} · ATK ${Math.round(stats.atk).toLocaleString('en-US')}`));}}
   grid.append(box);
  }
  if(el('infinityStart'))el('infinityStart').disabled=busy||blocked||!validTeam();
 }
 function renderClock(){const w=week(),remaining=Math.max(0,w.endMs-host.InfinityCloudSystem.now()),days=Math.floor(remaining/R.DAY),hours=Math.floor(remaining/3600000)%24,minutes=Math.floor(remaining/60000)%60;const label=`${w.id} · Category: ${w.category} · Enemy Element: ${w.element} · Reset: ${days}d ${hours}h ${minutes}m (Monday 00:00 UTC)`;if(label!==clockText){text('infinityRotation',label);clockText=label;}if(active&&runWeek&&runWeek.id!==w.id&&!combat?.battle.finished)end('Weekly rotation ended. Start a new run with this week’s Category.');}
 function fighterTile(unit){
  let row=fighterNodes.get(unit);
  if(!row){
   const tile=make('article','infinity-fighter'),img=make('img'),boss=make('small','infinity-boss-tag','BOSS'),name=make('strong'),stats=make('small'),bar=make('progress'),details=make('details'),summary=make('summary'),description=make('p');
   img.loading='lazy';img.addEventListener('error',()=>img.hidden=true);details.append(summary,description);tile.append(boss,img,name,stats,bar,details);row={tile,img,boss,name,stats,bar,summary,description};fighterNodes.set(unit,row);
  }
  row.tile.classList.toggle('is-defeated',unit.hp<=0||unit.defeated);row.tile.classList.toggle('is-boss',Boolean(unit.infinityBoss));row.boss.hidden=!unit.infinityBoss;
  if(row.img.dataset.source!==(unit.card.image||'')){row.img.dataset.source=unit.card.image||'';if(unit.card.image)row.img.src=unit.card.image;else row.img.removeAttribute('src');row.img.hidden=!unit.card.image;}row.img.alt=unit.card.name;
  U.text(row.name,unit.display?.name||unit.card.name);U.text(row.stats,`${unit.card.element} · HP ${Math.ceil(unit.hp).toLocaleString('en-US')} / ${Math.ceil(unit.maxHp).toLocaleString('en-US')} · ATK ${Math.ceil(unit.atk).toLocaleString('en-US')}`);row.bar.max=Math.max(1,unit.maxHp);row.bar.value=Math.max(0,unit.hp);
  const passive=combat.engine.getPassiveDescription(unit);U.text(row.summary,passive.name);U.text(row.description,passive.description);return row.tile;
 }
 function renderBattle(){
  if(!combat)return;const bs=combat.battle;el('infinityLobby').hidden=true;el('infinityBattle').hidden=false;
  text('infinityWave',`WAVE ${bs.infinity.wave} · Highest cleared ${bs.infinity.highest} · Star Orbs +${sessionOrbs.toLocaleString('en-US')}`);
  text('infinityTurn',bs.finished?'RUN ENDED':`${bs.turn==='player'?'PLAYER':'ENEMY'} STRIKE · ${host.InventorySystem.combatTurnMs(3000)/1000}s`);
  for(const [id,team]of [['infinityPlayers',bs.playerTeam],['infinityEnemies',bs.enemyTeam]]){
   const root=el(id),fragment=host.document.createDocumentFragment(),alive=team.filter(u=>u.hp>0&&!u.defeated),aliveSet=new Set(alive),rows=[...alive,...team.filter(u=>!aliveSet.has(u))].slice(0,12);
   for(const unit of rows)fragment.append(fighterTile(unit));
   if(team.length>12)fragment.append(make('p','',`${team.length-12} additional units · ${alive.length} total alive`));root.replaceChildren(fragment);
  }
  el('infinityLog').replaceChildren(...combat.logs.slice(-35).map(line=>make('p','',line)));
  if(el('infinityRestart'))el('infinityRestart').hidden=!bs.finished;if(el('infinityLeaderboard'))el('infinityLeaderboard').disabled=!bs.finished;
 }
 function stopTimer(){host.clearTimeout(timer);timer=null;}
 function end(message){stopTimer();if(combat&&!combat.battle.finished){combat.battle.finished=true;combat.battle.isBattling=false;bridge.onEnd?.(combat.battle);}text('infinityStatus',message||'Run ended. Star Orbs and weekly best are saved.');renderBattle();void report(true);}
 function schedule(){stopTimer();if(active&&combat&&!combat.battle.finished)timer=host.setTimeout(tick,host.InventorySystem.combatTurnMs(3000));}
 function tick(){
  if(!active||host.CloudSaveSystem?.playAllowed!==true){suspend();return;}renderClock();if(combat?.battle.finished)return;
  try{const result=combat.step();if(result.ended){bridge.onEnd?.(combat.battle);end('Team defeated. Highest wave and Star Orbs retained.');}renderBattle();schedule();}catch(error){end(error.message+' Run stopped safely.');}
 }
 function rewardWave(wave,battle){
  if(runWeek.id!==week().id)throw Error('Weekly rotation ended.');const receipt=runId+'_'+wave;
  if(data.lastReceipt===receipt)return;
  const range=R.orbRange(wave),orbs=range.min+Math.floor(Math.random()*(range.max-range.min+1));
  if(orbs>MAX-host.InventorySystem.quantity('star_orb'))throw Error('Star Orb storage is full.');
  data.pending={weekId:runWeek.id,wave,orbs,receipt};if(!persist()){data.pending=null;throw Error('Unable to save the wave reward.');}
  if(!commitReward()){blocked=true;throw Error('Storage unavailable. Reload to recover the pending Star Orbs.');}
  sessionOrbs+=orbs;bridge.onReward?.(wave,battle);void report();
 }
 async function report(force=false){
  if(reporting){if(force)reportAgain=true;return reporting;}
  if(host.CloudSaveSystem?.playAllowed!==true||!force&&Date.now()-lastReport<15000&&week().endMs-host.InfinityCloudSystem.now()>30000)return;
  const current=week(),score=data.reports[current.id];if(!score)return;
  lastReport=Date.now();const uid=host.CloudSaveSystem.activeUser?.uid;
  reporting=(async()=>{try{if(await host.CloudSaveSystem.flush(true)!==true)throw Error('Cloud Save is busy. Weekly best remains queued.');const response=await host.InfinityCloudSystem.request('score',{weekId:current.id,highestWave:score,category:current.category,displayName:host.CloudSaveSystem.publicName});if(host.CloudSaveSystem.activeUser?.uid!==uid)return;if(Number.isSafeInteger(response.highestWave))data.best[current.id]=Math.max(data.best[current.id]||0,response.highestWave);if((data.reports[current.id]||0)<=score)delete data.reports[current.id];persist();text('infinityStatus','Weekly best synced · Star Orbs are stored in EXP Food.');}catch(error){text('infinityStatus','Weekly score pending sync · '+error.message);}finally{reporting=null;if(reportAgain){reportAgain=false;queueMicrotask(()=>void report(true));}}})();return reporting;
 }
 async function start(){
  if(busy||blocked||!validTeam()||host.CloudSaveSystem?.playAllowed!==true)return false;
  busy=true;renderSetup();try{runWeek=week();const players=bridge.units(selections);if(players.length!==4||players.some(u=>!host.CategorySystem.has(u,runWeek.category)))throw Error('All four cards must match '+runWeek.category+'.');runId=U.token();sessionOrbs=0;
   combat=host.InfinityCombat.create(players,runWeek,{onWave:rewardWave,onUnitDefeated:bridge.onUnitDefeated,isWeatherActive:bridge.isWeatherActive,addWeather:bridge.addWeather,prepare:bs=>{bs.startedAt=Date.now();bridge.prepare?.(bs);}});
   renderBattle();schedule();return true;
  }catch(error){text('infinityStatus',error.message);return false;}finally{busy=false;}
 }
 function open(){if(active||bridge.canEnter?.()!==true)return false;active=true;host.document.body.classList.add('infinity-open');combat=null;runWeek=null;sessionOrbs=0;bridge.onEnter?.();bridge.open?.('infinityModal');el('infinityLobby').hidden=false;el('infinityBattle').hidden=true;if(el('infinityLeaderboard'))el('infinityLeaderboard').disabled=false;autoFill();renderSetup();renderClock();text('infinityStatus',`4v4 continuous waves · No VNĐ / direct EXP · Best this week: ${data.best[week().id]||0}. ${host.InfinityCloudSystem.status.message}`);host.clearInterval(uiTimer);uiTimer=host.setInterval(()=>{renderClock();if(Date.now()-lastReport>30000)void report();},1000);void report();return true;}
 function exit(){if(!active)return;if(combat&&!combat.battle.finished)end('Run exited. Cleared-wave rewards retained.');stopTimer();host.clearInterval(uiTimer);uiTimer=null;active=false;host.document.body.classList.remove('infinity-open');combat=null;el('infinityModal')?.classList.add('hidden');bridge.onExit?.();}
 function suspend(){stopTimer();host.clearInterval(uiTimer);uiTimer=null;if(combat){combat.battle.finished=true;combat.battle.isBattling=false;}active=false;host.document.body.classList.remove('infinity-open');combat=null;el('infinityModal')?.classList.add('hidden');}
 function mount(){if(bound)return;bound=true;el('infinityOpenButton')?.addEventListener('click',open);el('infinityExit')?.addEventListener('click',exit);el('infinityStart')?.addEventListener('click',()=>void start());el('infinityRestart')?.addEventListener('click',()=>{combat=null;runWeek=null;el('infinityLobby').hidden=false;el('infinityBattle').hidden=true;if(el('infinityLeaderboard'))el('infinityLeaderboard').disabled=false;autoFill();renderSetup();});el('infinityRetrySync')?.addEventListener('click',()=>{lastReport=0;void report(true);});el('infinityLeaderboard')?.addEventListener('click',()=>{if(combat&&!combat.battle.finished)return;const select=el('leaderboardMetric');if(select)select.value='infinity';bridge.open?.('leaderboardModal');void host.LeaderboardSystem.render(true);});host.addEventListener('pagehide',suspend);}
 host.InfinitySystem=Object.freeze({KEY,validSave,week,getISOWeek:R.getISOWeek,open,exit,start,suspend,report,get active(){return active;},get blocked(){return blocked;},get battle(){return combat?.battle||null;},getBest:id=>data.best[id]||0,flush:()=>!blocked&&persist(),reset(){suspend();data=fresh();persist();},configure(options){bridge=options||{};mount();if(!persist())blocked=true;}});
})(window);
