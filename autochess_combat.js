/* Phase 5: fixed-step tactical scheduler plus an isolated native passive runtime per fight. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,B=host.AutoChessBots,S=host.AutoChessSynergies,A=host.AutoChessAugments,T=host.AutoChessTelemetry,STEP=.05,LIMIT=60;
 function overtimeAt(time){if(time<30)return{damage:1,sustain:1};const p=Math.min(1,Math.max(0,(time-30)/15));return{damage:1.5+p,sustain:.5-.3*p};}
 function timeoutDecision(battle,metrics){
  const score=team=>{const max=team.reduce((n,u)=>n+Math.max(0,Number(u.maxHp)||0),0),hp=team.reduce((n,u)=>n+(alive(u)?Math.max(0,Number(u.hp)||0):0),0);return max>0?hp/max:0;};
  const player=score(battle.playerTeam),enemy=score(battle.enemyTeam),a=metrics.player?.totalDamageDealt||0,b=metrics.enemy?.totalDamageDealt||0;
  return{winner:Math.abs(player-enemy)>1e-9?(player>enemy?'player':'enemy'):Math.abs(a-b)>1e-6?(a>b?'player':'enemy'):'draw',playerHpPercent:player,enemyHpPercent:enemy,playerDamage:a,enemyDamage:b};
 }
 const alive=u=>u&&u.hp>0&&!u.defeated,clone=C.clone;
 function rng(seed){const s={rng:seed>>>0||1};return()=>C.random(s);}
 const distance=(a,b)=>Math.max(Math.abs(a.grid.x-b.grid.x),Math.abs(a.grid.y-b.grid.y));
 function stats(card){const t=Math.max(0,C.RARITIES.indexOf(card.rarity)),weight=Math.max(.15,Math.min(.85,card.stats.hp/(card.stats.hp+card.stats.atk*5))),hp=Math.round([900,1250,1650,2200,2800,3600][t]*(.7+weight*.6)),atk=Math.round([100,140,185,245,315,410][t]*(1.3-weight*.6));return{hp,atk};}
 function makeUnit(u,side,index){const native=C.card(u),value=stats(native),card={...clone(native),skinId:u.skinId||null,image:host.CardSkinSystem.art(native,u.skinId||null),stats:value};const result={card,display:{name:card.name,image:card.image,...value},hp:value.hp,maxHp:value.hp,atk:value.atk,level:1,mutations:[],defeated:false,side};
  result.grid={uid:u.uid,side,serial:index,frontline:u.board<7,fusionDepth:u.fusionDepth||0,x:side==='player'?u.board%7:6-u.board%7,y:side==='player'?4+Math.floor(u.board/7):3-Math.floor(u.board/7),mana:0,next:side==='player'?.35+index*.07:.385+(index-100)*.07,renderX:0,renderY:0};result.grid.renderX=result.grid.x;result.grid.renderY=result.grid.y;
  if(u.relic)host.RelicSystem.applyToUnit(result,u.relic.roll);else result.relicPrepared=true;return result;
 }
 function creeps(stage,boss=false){const count=Math.min(6,stage+1),source=C.card(boss?'armored-titan':'dumb-titan')||C.pools[0][0],rows=[];for(let i=0;i<count;i++){const value={hp:Math.round((boss?850:510)*(1+stage*.3)),atk:Math.round((boss?80:45)*(1+stage*.18))},card={...clone(source),id:'chess-creep-'+i,name:boss&&i===0?'Arcane Sentinel':'Stone Construct',element:i%2?'Holy':'Nature',category:['Unhuman'],stats:value,passive:{name:'Construct',description:'A neutral convergence guardian.'}};rows.push({card,display:{...value,name:card.name,image:card.image},hp:value.hp,maxHp:value.hp,atk:value.atk,level:1,mutations:[],defeated:false,relicPrepared:true,side:'enemy',grid:{uid:'creep'+i,side:'enemy',serial:100+i,x:1+i%5,y:i<5?2:1,renderX:1+i%5,renderY:i<5?2:1,mana:0,next:.6}});}return rows;}
 function create(a,b,seed,options={}){
  const random=rng(seed),events=[],logs=[],metrics=T.recorder(),augmentSets={player:A.effects(a),enemy:A.effects(b)};let effectDepth=0;const effectSources=new Set(),killStacks=new WeakMap(),augmented=new WeakSet();let time=0,accumulator=0,done=false,winner=null,serial=200,eventSerial=0,lastSecond=0,disposed=false;
  const unitsA=C.deployed(a).sort((x,y)=>x.board-y.board).map((u,i)=>makeUnit(u,'player',i)),unitsB=options.creep?creeps(options.stage,options.boss):C.deployed(b).sort((x,y)=>x.board-y.board).map((u,i)=>makeUnit(u,'enemy',100+i));
  const battle={mode:'auto-chess',sandbox:true,playerTeam:unitsA,enemyTeam:unitsB,playerIndex:0,enemyIndex:0,turn:'player',finished:false,isBattling:true,championChoices:{aqua:'hp'}};
  const augmentOf=u=>augmentSets[u?.grid?.side||(battle.playerTeam.includes(u)?'player':battle.enemyTeam.includes(u)?'enemy':u?.side)]||A.effects(null);
  function augmentKill(u){if(!u||!alive(u))return;const e=augmentOf(u);if(e.killHeal)api.heal(u,u.maxHp*e.killHeal,u);if(e.killShield)api.shield(u,u.maxHp*e.killShield,u);if(e.killAtk){const n=Math.min(5,(killStacks.get(u)||0)+1);killStacks.set(u,n);api.buff(u,'atk',n*e.killAtk,'augment:kill');}}
  function popup(u,text,tone='damage'){if(!u?.grid)return;events.push({id:++eventSerial,x:u.grid.x,y:u.grid.y,text:String(text).slice(0,48),tone,at:time});if(events.length>96)events.shift();}
  const engine=host.PassiveSystem.createIsolated({random,onCombatDamage:(bs,u,v,n,meta)=>metrics.damage(u,v,n,meta),onCombatHeal:(bs,u,v,n)=>metrics.heal(u,v,n),onCombatShield:(bs,u,v,n)=>metrics.heal(u,v,n,true),onCombatKill:(bs,u,v)=>{metrics.kill(u,v);augmentKill(u);},onCombatGold:(bs,u,n)=>metrics.gold(u,n),getCardById:id=>{const card=host.ALL_CARDS.find(c=>c.id===id);return card?clone(card):null;},isWeatherActive:()=>false,appendBattleLog:(m)=>{if(logs.length===40)logs.shift();logs.push(m);},prepareTactical:()=>prepareTraits(),showBattleFloatingText:(u,t,tone)=>{if(tone!=='damage')popup(u,t,tone);}});
  let traits=null;
  const api={
   hit:(u,v,n,meta={})=>{if(!v||effectDepth>2||effectSources.has(u))return{damage:0,recursionGuard:true};effectDepth++;effectSources.add(u);try{return engine.tacticalEffect(battle,u,v,'hit',n,meta);}finally{effectDepth--;effectSources.delete(u);}},
   heal:(u,n,source)=>{if(!u)return;const gained=engine.tacticalEffect(battle,source,u,'heal',n);return gained;},
   dot:(v,kind,turns,n,u)=>{if(!v||!alive(v))return;const list=v.passiveState?.[kind]||[],stacks=list.filter(e=>e.autochessSynergy&&e.source===u);if(stacks.length>=4){stacks[0].turns=Math.max(stacks[0].turns,turns);return;}return engine.tacticalEffect(battle,u,v,'dot',n,{kind,turns});},
   status:(v,key,n,u)=>v&&engine.tacticalEffect(battle,u,v,'status',n,{key}),
   shield:(u,n,source)=>u&&engine.tacticalEffect(battle,source,u,'shield',n),
   buff:(u,stat,n,key,fill=false)=>engine.tacticalEffect(battle,u,u,'buff',n,{stat,key,fill}),
   flat:(u,stat,n)=>engine.tacticalEffect(battle,u,u,'flatBuff',n,{stat,fill:true}),
   cleanse:u=>engine.tacticalEffect(battle,u,u,'cleanse'),popup
  };
  battle.tactical={time:0,overtime:1,sustainFactor:1,shieldFactor:u=>augmentOf(u)?.noShields?0:1,damageMultiplier:u=>1+(augmentOf(u)?.damage||0),crestCounts:{player:A.traits(a),enemy:A.traits(b)},onHeal:(u,n)=>popup(u,'+'+n,'heal'),onDamage(u,v,amount,meta,out){if(amount>0){popup(v,(u?.passiveState?.lastCrit&&!meta.dot?'✦ ':'')+'−'+Math.round(amount),meta.dot?'debuff':'damage');traits?.damage(u,v,amount,meta);traits?.hurt(v,u,amount,meta);if(u&&augmentSets[u.grid?.side]?.vamp)api.heal(u,amount*augmentSets[u.grid.side].vamp,u);}else if(out?.dodged)popup(v,'DODGE','dodge');}};
  engine.beginBattle(battle);
  function all(){return[...battle.playerTeam,...battle.enemyTeam];}
  function occupied(){return new Set(all().filter(alive).filter(u=>u.grid).map(u=>u.grid.y*7+u.grid.x));}
  function sync(){const used=occupied();for(const u of all()){if(u.grid)continue;const side=battle.playerTeam.includes(u)?'player':'enemy',owner=u.companionOwner||u.championOwner,anchor=owner?.grid||{x:3,y:side==='player'?5:2},cells=Array.from({length:56},(_,i)=>i).filter(i=>!used.has(i)).sort((a,b)=>Math.max(Math.abs(a%7-anchor.x),Math.abs(Math.floor(a/7)-anchor.y))-Math.max(Math.abs(b%7-anchor.x),Math.abs(Math.floor(b/7)-anchor.y))||a-b),cell=cells[0];
    if(cell===undefined){u.hp=0;u.defeated=true;u.championPermanentDeath=true;continue;}used.add(cell);u.grid={uid:'summon_'+(++serial),serial,side,x:cell%7,y:Math.floor(cell/7),renderX:cell%7,renderY:Math.floor(cell/7),mana:0,next:time+.5};traits?.start(u);u.grid.traits=traits?.bonuses(u)||{};
   }
   // Native swaps/revives may have moved references in a lineup. Resolve tile collisions
   // without changing ownership, cards, or the shared passive runtime.
   const claims=new Set();for(const u of all().filter(alive)){if(!u.grid)continue;let cell=u.grid.y*7+u.grid.x;if(claims.has(cell)){const free=Array.from({length:56},(_,i)=>i).filter(i=>!used.has(i)&&!claims.has(i))[0];if(free!==undefined){cell=free;u.grid.x=free%7;u.grid.y=Math.floor(free/7);used.add(free);}}claims.add(cell);}
  }
  sync();
  function prepareTraits(){
   traits=S.create(battle,api);const starters=all().filter(u=>u.grid&&alive(u)),active={player:traits.rows.player?.filter(r=>r.tier)||[],enemy:traits.rows.enemy?.filter(r=>r.tier)||[]};
   for(const u of starters){if(augmented.has(u))continue;augmented.add(u);const side=u.grid.side,e=augmentSets[side],row=starters.filter(v=>v.grid.side===side&&v.grid.y===u.grid.y),neighbors=Math.min(3,row.length-1),solo=(side==='player'?u.grid.y===4:u.grid.y===3)&&row.length===1,different=!!e.differentHp&&!active[side].some(r=>S.matches(u,r.id));
    u.grid.traits={...traits.bonuses(u)};for(const key of ['speed','vamp','crit','reduction'])u.grid.traits[key]=(u.grid.traits[key]||0)+(e[key]||0);
    u.grid.traits.reduction+=(solo?e.soloReduction:0)+neighbors*e.rowReduction;u.grid.augmentSpeed=e.speed+(different?e.differentSpeed:0);
    traits.start(u);const hp=e.hp-e.hpPenalty+(different?e.differentHp:0),atk=e.atk+(u.relic?e.relicAtk:0)+neighbors*e.rowAtk+(different?e.differentAtk:0);
    if(hp)api.buff(u,'hp',hp,'augment:hp',true);if(u.relic&&e.relicHp)api.flat(u,'hp',e.relicHp);if(atk)api.buff(u,'atk',atk,'augment:atk');
    if(e.startShield)api.shield(u,u.maxHp*e.startShield,u);if(solo&&e.soloShield)api.shield(u,u.maxHp*e.soloShield,u);if(different)popup(u,'BUILT DIFFERENT','mana');
   }
  }
  function finish(result){done=true;winner=result;battle.finished=true;battle.isBattling=false;return outcome();}
  function outcome(){return{winner,playerSurvivors:battle.playerTeam.filter(alive).length,enemySurvivors:battle.enemyTeam.filter(alive).length,time,timeout:battle.timeout||null,rewardFactors:clone(battle.contentRewardWinners||{}),metrics:done?metrics.snapshot():undefined};}
  function settle(){const a=battle.playerTeam.some(alive),b=battle.enemyTeam.some(alive);if(!a&&!b)return finish('draw');if(!a)return finish('enemy');if(!b)return finish('player');return null;}
  function move(u,target){const blocked=occupied(),start=u.grid.y*7+u.grid.x,queue=[start],parents=new Map([[start,null]]);let goal=null;const range=rangeOf(u.card);
   while(queue.length){const cell=queue.shift(),x=cell%7,y=Math.floor(cell/7);if(cell!==start&&Math.max(Math.abs(x-target.grid.x),Math.abs(y-target.grid.y))<=range){goal=cell;break;}const next=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;if(xx<0||xx>6||yy<0||yy>7)continue;const n=yy*7+xx;if(blocked.has(n)||parents.has(n))continue;next.push(n);}next.sort((a,b)=>Math.max(Math.abs(a%7-target.grid.x),Math.abs(Math.floor(a/7)-target.grid.y))-Math.max(Math.abs(b%7-target.grid.x),Math.abs(Math.floor(b/7)-target.grid.y))||a-b);for(const n of next){parents.set(n,cell);queue.push(n);}}
   if(goal===null)return false;while(parents.get(goal)!==start&&parents.get(goal)!==null)goal=parents.get(goal);u.grid.x=goal%7;u.grid.y=Math.floor(goal/7);return true;
  }
  function fixed(){if(done||disposed)return;time=Math.round((time+STEP)*100)/100;battle.tactical.time=time;const overtime=overtimeAt(time);battle.tactical.overtime=overtime.damage;battle.tactical.sustainFactor=overtime.sustain;sync();if(settle())return;
   if(Math.floor(time)>lastSecond){lastSecond=Math.floor(time);traits.second(lastSecond);if(lastSecond%4===0)for(const u of all())if(alive(u)&&augmentSets[u.grid?.side]?.regenWave)api.heal(u,u.maxHp*augmentSets[u.grid.side].regenWave,u);}
   const ready=all().filter(u=>alive(u)&&u.grid&&u.grid.next<=time).sort((a,b)=>a.grid.next-b.grid.next||a.grid.serial-b.grid.serial);
   for(const u of ready){if(!alive(u))continue;const opponents=engine.tacticalTargets(battle,u).filter(v=>alive(v)&&v.grid);if(!opponents.length){u.grid.next=time+.25;continue;}opponents.sort((a,b)=>distance(u,a)-distance(u,b)||a.grid.serial-b.grid.serial);const target=opponents[0],r=engine.ensureRuntime(u),controlled=r.stunTurns>0||r.freezeTurns>0||r.snailTurns>0,range=rangeOf(u.card);
    if(distance(u,target)>range&&!controlled){move(u,target);u.grid.next=time+.28;continue;}
    const before=r.ownAttackCount||0;engine.resolveTacticalTurn(battle,u,target);sync();if((u.passiveState?.ownAttackCount||0)>before)traits.attack(u,target);u.grid.next=time+1.35/(1+Math.min(1.5,traits.speed(u)+engine.tacticalSpeed(u)+(u.grid.augmentSpeed??augmentSets[u.grid.side]?.speed??0)));if(settle())return;
   }events.splice(0,events.findIndex(e=>time-e.at<1.5)<0?events.length:events.findIndex(e=>time-e.at<1.5));if(time>=LIMIT){battle.timeout=timeoutDecision(battle,metrics.snapshot());finish(battle.timeout.winner);}
  }
  function step(dt=STEP){if(done||disposed)return outcome();accumulator+=Math.max(0,Math.min(.5,dt));while(accumulator+1e-9>=STEP&&!done){accumulator-=STEP;fixed();}return outcome();}
  function interpolate(dt){for(const u of all())if(u.grid){const factor=1-Math.exp(-18*dt);u.grid.renderX+=(u.grid.x-u.grid.renderX)*factor;u.grid.renderY+=(u.grid.y-u.grid.renderY)*factor;}}
  return{battle,engine,events,logs,traits,step,interpolate,telemetry:()=>metrics.snapshot(),telemetryFrame:()=>metrics.compact(),get done(){return done;},get time(){return time;},get remaining(){return Math.max(0,LIMIT-time);},outcome,dispose(){disposed=true;events.length=0;logs.length=0;delete battle.tactical;},snapshot(){return host.OnlineUtils.stable({time,winner,units:all().map(u=>({id:u.card.id,hp:u.hp,maxHp:u.maxHp,atk:u.atk,x:u.grid?.x,y:u.grid?.y,own:u.passiveState?.ownAttackCount||0}))});}};
 }
 // One worker per open mode keeps expensive native passive chains off the UI thread.
 // It imports only source modules, owns no browser storage and dies on Save & Exit.
 function createWorkerPool(){
  const modules=['cards','skins','category','elements','grimoire','yuno','requiem','reagan','fate','spooky_passives','gomen','shibuya','companions','combat_stats','dragon_skills','relic_combat','tower_200_passives','ragna_passives','mourner','akatsuki_passives','enten','titan_passives','turn_phase','baller_passives','tensura_passives','sins_passives','bleach_passives','hextech_passives','content_passives','passives','relics','autochess_ranked','autochess','autochess_synergies','autochess_telemetry','autochess_augments','autochess_ai','autochess_strategy','autochess_bots','autochess_combat'];
  const urls=modules.map(name=>new URL(name+'.js?v='+(['cards','category','combat_stats','passives','content_passives','autochess','autochess_combat','autochess_ranked','autochess_synergies'].includes(name)?'20261120-ac-adventure-1':'20261119-hextech-1'),host.document.baseURI).href);
  const bootstrap=`self.window=self;self.InventorySystem={registerItem(){}};self.OnlineUtils={stable:JSON.stringify};self.localStorage={getItem(){return null},setItem(){throw Error('Combat workers cannot write storage')}};\nimportScripts(...${JSON.stringify(urls)});\nconst fights=new Map();\nfunction visual(u){const r=u.passiveState||{},c=u.card,g=u.grid;return {card:{id:c.id,skinId:c.skinId||null,name:c.name,element:c.element,rarity:c.rarity,image:c.image,category:c.category||[],passive:{name:c.passive?.name||'No Passive'}},hp:u.hp,maxHp:u.maxHp,atk:u.atk,defeated:u.defeated,isClone:u.isClone,isSummoned:u.isSummoned,relic:u.relic||null,grid:g?{uid:g.uid,serial:g.serial,side:g.side,fusionDepth:g.fusionDepth||0,x:g.x,y:g.y,mana:g.mana}:null,passiveState:{hextechSkills:r.hextechSkills||null,shield:r.shield||0,freezeTurns:r.freezeTurns||0,stunTurns:r.stunTurns||0,hypnosisTurns:r.hypnosisTurns||0,fearTurns:r.fearTurns||0,voidTurns:r.contentSkills?.['vanilla-ice']?.voidTurns||0,poison:r.poison?.length?[{}]:[],burn:r.burn?.length?[{}]:[],bleed:r.bleed?.length?[{}]:[],bleach:r.bleach?{hakka:r.bleach.hakka,vista:r.bleach.vista}:null,tensura:r.tensura?{sage:r.tensura.sage}:null}};}\nfunction publish(id,row){const f=row.fight,events=f.events.filter(e=>e.id>row.event);if(events.length)row.event=events.at(-1).id;postMessage({id,type:'frame',done:f.done,time:f.time,remaining:f.remaining,outcome:f.outcome(),metrics:f.telemetryFrame(),playerTeam:f.battle.playerTeam.map(visual),enemyTeam:f.battle.enemyTeam.map(visual),events});}\nonmessage=event=>{const m=event.data;try{if(m.type==='init'){const row={fight:AutoChessCombat.create(m.a,m.b,m.seed,m.options),event:0};fights.set(m.id,row);publish(m.id,row);}else if(m.type==='step'){const row=fights.get(m.id);if(row){row.fight.step(m.dt);publish(m.id,row);}}else if(m.type==='dispose'){fights.get(m.id)?.fight.dispose();fights.delete(m.id);}}catch(e){postMessage({id:m.id,type:'error',message:e.message});}};postMessage({type:'ready'});`;
  const url=host.URL.createObjectURL(new Blob([bootstrap],{type:'application/javascript'})),worker=new Worker(url),listeners=new Map();let next=0,closed=false,failed=false;
  worker.onmessage=e=>{if(e.data.type==='ready'){host.URL.revokeObjectURL(url);return;}listeners.get(e.data.id)?.(e.data);};
  worker.onerror=e=>{e.preventDefault();failed=true;closed=true;worker.terminate();host.URL.revokeObjectURL(url);for(const fn of [...listeners.values()])fn({type:'error',message:e.message});};
  return{register(fn){const id='fight'+(++next);listeners.set(id,fn);return id;},send(m){if(!closed)worker.postMessage(m);},remove(id){listeners.delete(id);if(!closed)worker.postMessage({id,type:'dispose'});},dispose(){closed=true;listeners.clear();worker.terminate();host.URL.revokeObjectURL(url);},get failed(){return failed;},get size(){return listeners.size;}};
 }
 function remoteCombat(pool,a,b,seed,options){
  let native=null,busy=true,done=false,time=0,remaining=LIMIT,lastOutcome=null,lastMetrics=null,pending=0,lastProgress=host.performance.now(),disposed=false,failure=null;
  const events=[],battle={playerTeam:C.deployed(a).map((u,i)=>makeUnit(u,'player',i)),enemyTeam:options.creep?creeps(options.stage,options.boss):C.deployed(b).map((u,i)=>makeUnit(u,'enemy',100+i))};
  function merge(list,previous){const map=new Map(previous.filter(u=>u.grid).map(u=>[u.grid.uid,u]));return list.map(u=>{if(!u.grid)return u;const old=map.get(u.grid.uid);u.grid.renderX=old?.grid.renderX??u.grid.x;u.grid.renderY=old?.grid.renderY??u.grid.y;const original=C.card(u.card.id);if(original)u.card={...original,element:u.card.element};return u;});}
  function fallback(reason){failure=reason||'Worker startup timeout';if(disposed||native)return;pool.remove(id);native=create(a,b,seed,options);busy=false;events.length=0;}
  const id=pool.register(m=>{if(disposed||native)return;if(m.type==='error'){fallback(m.message);return;}busy=false;lastProgress=host.performance.now();done=m.done;time=m.time;remaining=m.remaining;lastOutcome=m.outcome;lastMetrics=m.metrics||lastMetrics;battle.playerTeam=merge(m.playerTeam,battle.playerTeam);battle.enemyTeam=merge(m.enemyTeam,battle.enemyTeam);events.push(...m.events);if(events.length>96)events.splice(0,events.length-96);});
  pool.send({id,type:'init',a:C.clone(a),b:b?C.clone(b):null,seed,options});
  return{get battle(){return native?.battle||battle;},get events(){return native?.events||events;},get done(){return native?.done??done;},get time(){return native?.time??time;},get remaining(){return native?.remaining??remaining;},get remote(){return !native;},get failure(){return failure;},step(dt){if(disposed)return;if(native)return native.step(dt);pending=Math.min(.5,pending+Math.max(0,dt));if(busy){if(host.performance.now()-lastProgress>8000)fallback('Worker response timeout');return;}if(!done&&pending>=STEP){const amount=pending;pending=0;busy=true;pool.send({id,type:'step',dt:amount});}},interpolate(dt){if(native)return native.interpolate(dt);for(const u of [...battle.playerTeam,...battle.enemyTeam])if(u.grid){const f=1-Math.exp(-18*dt);u.grid.renderX+=(u.grid.x-u.grid.renderX)*f;u.grid.renderY+=(u.grid.y-u.grid.renderY)*f;}},outcome:()=>native?.outcome()||lastOutcome,telemetry:()=>native?.telemetry()||lastMetrics,dispose(){disposed=true;pool.remove(id);native?.dispose();events.length=0;battle.playerTeam.length=0;battle.enemyTeam.length=0;}};
 }

 function createSession(initial,options={}){
  if(initial.live&&!initial.finished&&!options.authority)return host.AutoChessLive.createSession(initial,options);
  let state=clone(initial),jobs=[],current=null,disposed=false,speed=1,saveClock=0,botClock=0,pool=null,claiming=false,combatStarted=0,firstHumanFinish=null,recoverRound=false;
  T.ensure(state);A.initialize(state);for(const p of state.players)C.economyRound(state,p);
  function error(e){options.onError?.(e.message||String(e));}
  function checkpoint(){if(disposed)return false;if(!C.save(state)){error('Unable to save Auto Chess. Free browser storage before continuing.');return false;}return true;}
  function change(fn,onFailure=error){if(disposed)return false;const previous=clone(state);try{fn();if(!C.save(state))throw Error('Unable to save this action; nothing was consumed.');options.onChange?.();return true;}catch(e){state=previous;T.ensure(state);onFailure(e);return false;}}
  function disposeJobs(){for(const job of jobs)job.combat?.dispose();jobs=[];current=null;}
  function descriptors(){const kind=C.roundKind(state);if(['creep','boss'].includes(kind))return C.alive(state).map(p=>({a:p.id,b:'creeps',ghost:true,creep:true,boss:kind==='boss'}));return state.pairs;}
  function prepareCombat(){disposeJobs();combatStarted=host.performance.now();firstHumanFinish=null;recoverRound=false;jobs=descriptors().map((p,i)=>({...p,seed:C.seedOf(state.roundSeed,p.a,p.b,i),rosterA:clone(C.get(state,p.a)),rosterB:p.creep?null:clone(C.get(state,p.b)),combat:null,result:null}));}
  function startCombat(){if(disposed||state.finished||state.phase!=='planning')return;if(!change(()=>{host.AutoChessOnline?.prepareRound(state);if(C.finalize(state)){quoteReward();return;}for(const p of C.alive(state).filter(p=>p.bot))B.plan(state,p,24);C.autoDeployBench(state);C.clearLiveRound(state);host.AutoChessOnline?.record(state);if(C.roundKind(state)==='pvp')B.pair(state);state.phase='combat';state.remaining=0;state.revision++;}))return;if(state.finished){stopFights();claim();}else prepareCombat();}
  function ready(){if(state.live&&!options.allowAdvance)return;if(disposed||state.finished||C.groupLocked(state)&&C.get(state).hp<=0)return;switch(state.phase){case'carousel':if(C.get(state).hp>0&&!state.carousel.some(u=>u.claimedBy===C.get(state).id)){error('Choose your carousel card first.');return;}change(()=>{for(const p of state.draftOrder.map(id=>C.get(state,id)).filter(p=>p.hp>0))if(!state.carousel.some(u=>u.claimedBy===p.id)){state.draftWave=4;B.draft(state,p);}C.advance(state);});break;case'augment':error('Choose one Augment first.');break;case'planning':startCombat();break;case'results':change(()=>C.advance(state));break;}if(state.finished)finish();}
  function dispatchFor(id,action,onFailure){return change(()=>C.apply(state,id,action),onFailure);}
  function dispatch(action){return change(()=>C.apply(state,C.get(state).id,action));}
  function quoteReward(){if(!state.reward)state.reward=options.rewardQuote?.(C.get(state).rank,state)||C.reward(C.get(state).rank,{tactical:host.AutoChessStrategy?.forPlayer(state)},state);if(!C.validReward(state.reward,C.get(state).rank,state))throw Error('Invalid placement reward.');}
  function stopFights(){disposeJobs();pool?.dispose();pool=null;}
  function claim(){
   if(disposed||!state.finished)return false;if(state.paid)return true;if(claiming)return false;
   claiming=true;
   try{
    if(!state.reward&&!change(quoteReward))return false;
    if(options.onReward?.(state,C.clone(state.reward))!==true)throw Error('Rewards remain pending. Retry saving before leaving.');
    const saved=change(()=>{state.paid=true;state.revision++;});if(saved)options.onFinalized?.(state);return saved;
   }catch(e){error(e);return false;}finally{claiming=false;}
  }
  function abandon(){if(disposed)return false;if(!state.finished){state.abandoned=true;state.abandonedAt=Date.now();}stopFights();disposed=true;C.purgeCheckpoint();return true;}
  function terminal(){const p=C.get(state),living=C.alive(state);if(C.groupLocked(state))return false;return state.finished||p.hp<=0||p.rank===1||living.length===1&&living[0].id===C.get(state).id;}
  function finish(reason=null){
   if(reason==='forfeit'&&C.groupLocked(state)){error('Invited group runs continue to the final survivor. Eliminated players can spectate.');return false;}
   if(disposed||!terminal()&&reason!=='forfeit')return false;
   if(!change(()=>{for(const job of jobs){const m=job.result?.metrics||job.combat?.telemetry?.();if(!m)continue;T.commit(state,C.get(state,job.a),m.player,C.label(state),job.rosterA);if(!job.ghost&&!job.creep)T.commit(state,C.get(state,job.b),m.enemy,C.label(state),job.rosterB);}if(!C.finalize(state,reason))throw Error('The match is still active.');quoteReward();}))return false;
   stopFights();return claim();
  }
  const combatArgs=job=>[job.rosterA,job.rosterB,job.seed,{creep:job.creep,boss:job.boss,stage:state.stage}];
  function finishJob(job,result){job.result={a:job.a,b:job.b,ghost:job.ghost,...result};}
  function nativeRecovery(job){job.combat?.dispose();job.combat=create(...combatArgs(job));job.recovering=true;if(job.a===C.get(state).id||!job.ghost&&job.b===C.get(state).id)current=job.combat;}
  function combatTick(dt){
   const liveHost=!!state.live&&options.authority,now=host.performance.now();
   // Reconcile only on the authority, from frozen boards and their original seeds.
   // A guest finishing its visual replay never changes damage or rewards.
   if(liveHost&&!recoverRound){
    const humans=C.liveReadyHumans(state);
    const finished=humans.filter(h=>jobs.some(j=>j.result&&(j.a===h.id||!j.ghost&&j.b===h.id))).length;
    if(finished&&firstHumanFinish===null)firstHumanFinish=now;
    recoverRound=(finished>0&&finished===humans.length)||(firstHumanFinish!==null&&now-firstHumanFinish>=4000)||now-combatStarted>=(LIMIT+8)*1000;
   }
   const budget=now+8;let openedJob=false;
   for(const job of jobs)if(!job.result){
    if(recoverRound&&host.performance.now()>=budget)break;
    try{
     if(job.needsRecovery||recoverRound&&(!job.combat||job.combat.remote===true))nativeRecovery(job);
     if(!job.combat){
      if(openedJob)continue;openedJob=true;
      const args=combatArgs(job);
      if(options.worker&&host.Worker&&/^https?:$/.test(host.location.protocol)&&!pool?.failed){
       try{pool ||= createWorkerPool();job.combat=remoteCombat(pool,...args);}catch(_){job.combat=create(...args);}
      }else job.combat=create(...args);
      if(job.a===C.get(state).id||!job.ghost&&job.b===C.get(state).id)current=job.combat;
     }
     if(job.recovering||recoverRound){for(let n=0;n<24&&!job.combat.done&&host.performance.now()<budget;n++)job.combat.step(.5);}
     else job.combat.step(dt*speed);
     job.combat.interpolate(dt);
     if(job.combat.done)finishJob(job,job.combat.outcome());
    }catch(e){
     if(!liveHost)throw e;
     if(!job.recovering&&!job.needsRecovery){job.needsRecovery=true;continue;}
     // A repeat simulation error cannot hold the room or award a false win.
     finishJob(job,{winner:'draw',playerSurvivors:0,enemySurvivors:0,time:job.combat?.time||0,recovered:true});
     error('A fight could not be replayed and was settled as a draw.');
    }finally{if(job.recovering)job.needsRecovery=false;}
   }
   if(jobs.length&&jobs.every(j=>j.result)){
    const results=jobs.map(j=>j.result);
    if(change(()=>{
     const rosters={};for(const j of jobs){rosters[j.a]=j.rosterA;if(!j.ghost&&!j.creep)rosters[j.b]=j.rosterB;}
     B.settle(state,results,rosters);C.clearLiveRound(state);if(C.finalize(state))quoteReward();
    })){disposeJobs();if(state.finished){stopFights();claim();}}
   }
  }
  function advanceResults(){return !disposed&&!state.finished&&state.phase==='results'&&change(()=>C.advance(state));}
  function tick(dt){if(disposed||state.finished||!(dt>0))return;if(terminal()){finish();return;}dt=Math.min(.5,dt);saveClock+=dt;
   if(state.phase==='combat'){combatTick(dt);
   }else if(state.phase!=='complete'){
    state.remaining=Math.max(0,state.remaining-dt);botClock+=dt;
    if(state.phase==='carousel'){
     state.draftElapsed+=dt;const wave=state.stage===1?4:Math.min(3,Math.floor(state.draftElapsed/5));if(wave!==state.draftWave){state.draftWave=wave;state.revision++;}
     const due=B.prepareDraft(state);if(state.draftOrder.some(id=>{const p=C.get(state,id);return p?.bot&&p.hp>0&&C.released(state,id)&&!state.carousel.some(u=>u.claimedBy===id)&&state.draftElapsed>=due.players[id]?.at;}))change(()=>{B.tickDraft(state);state.revision++;});
     if(!state.remaining){change(()=>{state.draftWave=4;for(const p of state.draftOrder.map(id=>C.get(state,id)).filter(p=>p.hp>0))if(!state.carousel.some(u=>u.claimedBy===p.id))B.draft(state,p);C.advance(state);});}
    }else if(state.phase==='augment'){if(!state.remaining)change(()=>{for(const p of C.alive(state))A.botPick(state,p);});
    }else if(state.phase==='planning'){
     if(botClock>=.6){botClock=0;change(()=>{for(const p of C.alive(state).filter(p=>p.bot))B.plan(state,p,3);state.revision++;});}
     if(!state.remaining)startCombat();
    }else if(state.phase==='results'&&!state.remaining)advanceResults();
   }
   if(state.finished){finish();return;}
   if(saveClock>=1){saveClock=0;checkpoint();}
  }
  if(state.phase==='carousel')B.prepareDraft(state);
  if(terminal())finish();else if(state.phase==='combat')prepareCombat();else checkpoint();
  return{get state(){return state;},get speed(){return speed;},set speed(v){speed=[1,2,3].includes(v)?v:1;},get workerCount(){return pool&&!pool.failed?1:0;},get combat(){return current||jobs.find(j=>j.combat)?.combat;},dispatch,dispatchFor,startCombat,advanceResults,ready,tick,claim,abandon,forfeit:abandon,checkpoint,opponentLabel(id){const job=jobs.find(j=>j.a===id||!j.ghost&&j.b===id);if(!job)return C.roundKind(state)==='carousel'?'A card and Relic for every tactician':C.roundKind(state)==='boss'?'Neutral Boss Round':'Planning · '+C.roundKind(state).toUpperCase();return 'VS '+(job.creep?'Arcane Guardians':C.get(state,job.a===id?job.b:job.a)?.name)+(job.ghost?' · Echo':'');},combatFor(id){return jobs.find(j=>j.a===id||!j.ghost&&j.b===id)?.combat||null;},dispose(){if(disposed)return;disposed=true;disposeJobs();pool?.dispose();pool=null;}};
 }
 function rangeOf(card){return Number(card?.attackRange)>0?Math.min(4,Math.max(1,Math.floor(card.attackRange))):B.ranged(card)?card.category.includes('Gunner')?4:3:1;}
 host.AutoChessCombat=Object.freeze({rangeOf,STEP,LIMIT,overtimeAt,timeoutDecision,stats,makeUnit,creeps,create,createSession,createWorkerPool,remoteCombat});
})(window);
