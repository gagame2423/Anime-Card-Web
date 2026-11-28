/* Ball vs Ball: deterministic fixed-step circles, native combat, and an independent status clock. */
(function(host){
 'use strict';
 const S=host.SpatialCombat,STEP=1/60,LIMIT=120,MAX_LOG=180,MAX_FX=120,MAX_SOUNDS=64;
 const alive=u=>u&&u.hp>0&&!u.defeated;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const makeRandom=seed=>{let n=seed>>>0||1;return()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return(n>>>0)/4294967296;};};
 function create(options){
  const random=makeRandom(options.seed),teamSize=options.teamSize,orbs=new Map(),events=[],sounds=[],logs={player:[],enemy:[]};
  const originalPlayer=[...options.playerTeam],originalEnemy=[...options.enemyTeam],battle={mode:'ball-arena',ballTeamSize:teamSize,sandbox:true,isBattling:true,finished:false,playerTeam:[...originalPlayer],enemyTeam:[...originalEnemy],playerIndex:0,enemyIndex:0,turn:'player',championChoices:options.championChoices||{aqua:'hp'},mimicPools:options.mimicPools||{}};
  let time=0,accumulator=0,serial=0,eventId=0,logId=0,done=false,winner=null,reason=null,disposed=false,contacts=new Set(),impactOrder=0;
  const side=u=>battle.playerTeam.includes(u)?'player':'enemy';
  const all=()=>[...battle.playerTeam,...battle.enemyTeam];
  function sound(cue){
   // Presentation only. The controller drains each batch once; no browser audio
   // or wall clock enters the deterministic combat simulation.
   if(sounds.length>=MAX_SOUNDS)sounds.shift();sounds.push({cue,at:time});
  }
  function log(which,message,tone=''){
   const text=String(message),list=logs[which==='enemy'?'enemy':'player'];list.push({id:++logId,time,text,tone});if(list.length>MAX_LOG)list.shift();
   if(tone==='critical'||/^\[CRITICAL HIT!?\]/i.test(text))sound('critical_hit');
   else if(tone==='dodge'||/^\[DODGE\]/i.test(text))sound('dodge');
   else if(/^\[SKILL\]/i.test(text))sound('skill_cast');
   else if(/^\[PASSIVE\]|^\[CHAMPION\]|^\[RELIC\]|^\[ENTRY\]/i.test(text)||tone==='passive'||tone==='support')sound('passive_trigger');
   else if(/^\[Debuff\]/i.test(text)||tone==='debuff')sound('status_apply');
  }
  function fx(event){events.push({id:++eventId,at:time,...event});if(events.length>MAX_FX)events.shift();}
  function float(u,value,tone='damage',amount=null){const p=orbs.get(u);if(p)fx({kind:'float',x:p.x,y:p.y,orbId:p.id,text:String(value),tone,amount:Number.isFinite(amount)?amount:null});}
  const engine=host.PassiveSystem.createIsolated({
   random,getCardById:id=>host.ALL_CARDS.find(c=>c.id===id)||null,ownedPassiveIds:()=>options.mimicPools?.player||[],
   isWeatherActive:options.isWeatherActive||(()=>false),addRandomCommonUncommonWeather:options.addRandomCommonUncommonWeather,
   appendBattleLog:(message,tone,which)=>log(which||battle.turn,message,tone),
   onCombatDamage:(bs,source,target,n,meta={})=>{
    const crit=!meta.dot&&meta.ballCritical===true;
    float(target,'−'+Math.round(n).toLocaleString('en-US'),meta.dot?'dot':crit?'crit':'damage',n);
    if(crit)sound('critical_hit');else if(!meta.dot&&n>=Math.max(1,target.maxHp)*.15)sound('collision_heavy');
   },
   onCombatHeal:(bs,source,target,n)=>{float(target,'+'+Math.round(n).toLocaleString('en-US'),'heal',n);sound('heal');},
   onCombatShieldImpact:(bs,source,target,blocked,broken)=>{sound(broken?'shield_break':'shield_hit');if(broken)float(target,'SHIELD BREAK','shield');},
   onUnitDefeated:(bs,v,u)=>{if(!alive(v)){sound('knockout');options.onDefeat?.(v,u);}},
   showBattleFloatingText:(u,t,tone)=>{if(tone!=='damage'&&tone!=='heal'){float(u,t,tone);if(tone==='dodge')sound('dodge');}}
  });
  battle.spatial={scale:.17,time:0,point:u=>orbs.get(u)||null,radius:u=>orbs.get(u)?.r||0,
   facing:u=>{const p=orbs.get(u);return p?{x:p.vx,y:p.vy}:null;},
   emit(shape,source,label){fx({kind:'shape',shape:{...shape},side:side(source),label});sound('skill_cast');}};
  function nearest(u,list=engine.tacticalTargets(battle,u)){
   const p=orbs.get(u);return list.filter(v=>alive(v)&&orbs.has(v)).sort((a,b)=>{const q=orbs.get(a),r=orbs.get(b);return Math.hypot(q.x-p.x,q.y-p.y)-Math.hypot(r.x-p.x,r.y-p.y)||q.id-r.id;})[0]||null;
  }
  function spawn(u){
   const team=side(u),line=team==='player'?battle.playerTeam:battle.enemyTeam,index=line.indexOf(u),r=(teamSize===1?.075:.056)*((u.isSummoned||u.isClone)?.82:1),owner=orbs.get(u.companionOwner||u.championOwner||u.reaganOwner||u.hermesOwner||u.questOwner);
   const x=owner?clamp(owner.x+(random()-.5)*.18,r,1-r):team==='player'?.19:.81;
   const y=owner?clamp(owner.y+(random()-.5)*.18,r,1-r):(line.length===1?.5:(index+1)/(line.length+1));
   const angle=(team==='player'?0:Math.PI)+(random()-.5)*1.45,speed=.45+random()*.16;
   const p={id:++serial,u,side:team,x,y,r,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,energy:0,nextTick:time+S.TURN_SECONDS,attackAt:0,lastImpact:time,entered:false,steerAt:0,steer:null};
   orbs.set(u,p);return p;
  }
  function sync(){
   const current=new Set(all());for(const u of current)if(alive(u)&&!orbs.has(u))spawn(u);
   for(const [u,p] of orbs)if(!current.has(u)){orbs.delete(u);if(alive(u))p.energy=0;}
  }
  sync();engine.beginBattle(battle);sync();
  function finish(result,why){
   if(done)return;done=true;winner=result;reason=why;battle.finished=true;battle.isBattling=false;battle.outcome=result==='player'?'victory':result==='enemy'?'defeat':'draw';
   log('player',result==='player'?'[VICTORY] The Player team won.':result==='enemy'?'[DEFEAT] The Enemy team won.':'[DRAW] Neither team won.',result==='player'?'victory':result==='enemy'?'defeat':'status');
  }
  function settle(){
   const a=battle.playerTeam.some(alive),b=battle.enemyTeam.some(alive);
   if(!a||!b){finish(a?'player':b?'enemy':'draw','elimination');return true;}
   if(time>=LIMIT){const score=line=>line.reduce((n,u)=>n+(alive(u)?u.hp:0),0)/Math.max(1,line.reduce((n,u)=>n+u.maxHp,0)),p=score(battle.playerTeam),q=score(battle.enemyTeam);
    finish(Math.abs(p-q)<1e-8?'draw':p>q?'player':'enemy','time');return true;}
   return false;
  }
  const energyApi={
   atk:engine.combatAtk,enemies:u=>engine.tacticalTargets(battle,u),allies:u=>side(u)==='player'?battle.playerTeam:battle.enemyTeam,
   hit(u,v,n,meta){const out=engine.tacticalEffect(battle,u,v,'hit',n,meta);if(out?.damage>0)log(side(u),'[SKILL] '+u.card.name+' hit '+v.card.name+' for '+Math.round(out.damage).toLocaleString('en-US')+'.','passive');return out;},
   heal:(v,n,u)=>engine.tacticalEffect(battle,u,v,'heal',n),shield:(v,n,u)=>engine.tacticalEffect(battle,u,v,'shield',n),
   announce(u,name){log(side(u),'[SKILL] '+u.card.name+' — '+name+' (100 Energy).','passive');float(u,name.toUpperCase(),'energy');}
  };
  function gainEnergy(p){
   if(!alive(p.u))return;
   // Optional explicit Energy modifiers are distinct from passive stack resources (e.g. Alien Watch).
   const bonus=Math.max(0,Number(p.u.card?.wallEnergyBonus)||0)+Math.max(0,Number(p.u.relic?.wallEnergyBonus)||0)+Math.max(0,Number(p.u.passiveState?.wallEnergyBonus)||0);
   const gain=Math.min(S.ENERGY_MAX,S.WALL_ENERGY*(1+bonus));
   p.energy=Math.min(S.ENERGY_MAX,p.energy+gain);
   log(p.side,'[ENERGY] '+p.u.card.name+' wall rebound +'+Math.round(gain)+' ('+Math.round(p.energy)+'/100).','status');float(p.u,'+'+Math.round(gain)+' E','energy');
   releaseEnergy(p);
  }
  function releaseEnergy(p){
   if(p.energy<S.ENERGY_MAX||!alive(p.u)||engine.ballInactive(battle,p.u))return;
   const target=nearest(p.u);if(!target)return;
   p.energy=0;S.castEnergy(battle,p.u,target,energyApi);sync();
  }
  function wall(p,x,y){
   fx({kind:'spark',x,y,side:p.side});sound('wall_bounce');gainEnergy(p);
  }
  function move(p){
   const runtime=p.u.passiveState||{},slow=(runtime.stunTurns>0||runtime.freezeTurns>0||runtime.snailTurns>0)?.55:1;
   // Small steering correction only after an extended period without contact.
   // Reflection and unit collision impulses remain elastic.
   if(time-p.lastImpact>3.2){
    if(p.steerAt<=time||!alive(p.steer)){p.steer=nearest(p.u);p.steerAt=time+.22;}const victim=orbs.get(p.steer);if(victim){const dx=victim.x-p.x,dy=victim.y-p.y,dist=Math.hypot(dx,dy)||1;p.vx+=dx/dist*.26*STEP;p.vy+=dy/dist*.26*STEP;}
   }
   let speed=Math.hypot(p.vx,p.vy);if(speed<.32){if(speed<1e-7){p.vx=p.side==='player'?.35:-.35;p.vy=.12;}else{p.vx*=.32/speed;p.vy*=.32/speed;}}
   if(speed>.80){p.vx*=.80/speed;p.vy*=.80/speed;}
   p.x+=p.vx*STEP*slow;p.y+=p.vy*STEP*slow;
   if(p.x<p.r&&p.vx<0){p.x=2*p.r-p.x;p.vx=-p.vx;wall(p,0,p.y);}
   else if(p.x>1-p.r&&p.vx>0){p.x=2*(1-p.r)-p.x;p.vx=-p.vx;wall(p,1,p.y);}
   if(p.y<p.r&&p.vy<0){p.y=2*p.r-p.y;p.vy=-p.vy;wall(p,p.x,0);}
   else if(p.y>1-p.r&&p.vy>0){p.y=2*(1-p.r)-p.y;p.vy=-p.vy;wall(p,p.x,1);}
   p.x=clamp(p.x,p.r,1-p.r);p.y=clamp(p.y,p.r,1-p.r);
  }
  function attack(a,b){
   if(!alive(a.u)||!alive(b.u)||a.attackAt>time)return;
   const out=engine.ballAttack(battle,a.u,b.u);
   if(out?.skipped)return out;
   a.attackAt=time+.30/(1+Math.min(1.5,Math.max(0,engine.tacticalSpeed(a.u))));return out;
  }
  function collision(a,b,seen){
   let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),radius=a.r+b.r;
   if(d>radius+.0001)return;
   if(d<1e-8){dx=1;dy=0;d=1e-8;}const nx=dx/d,ny=dy/d,key=a.id+'_'+b.id;
   if(d<radius){const correction=(radius-d+.0002)*.5;
    a.x=clamp(a.x-nx*correction,a.r,1-a.r);a.y=clamp(a.y-ny*correction,a.r,1-a.r);
    b.x=clamp(b.x+nx*correction,b.r,1-b.r);b.y=clamp(b.y+ny*correction,b.r,1-b.r);
   }
   const approach=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
   seen.add(key);if(approach<=0)return;
   // Equal-mass elastic collision; limited impulse jitter from initial overlaps.
   a.vx-=approach*nx;a.vy-=approach*ny;b.vx+=approach*nx;b.vy+=approach*ny;
   if(contacts.has(key)||approach<.03)return;
   sound(a.side!==b.side&&approach>=.80?'collision_heavy':'collision_light');
   if(a.side===b.side)return;
   a.lastImpact=b.lastImpact=time;
   fx({kind:'spark',x:(a.x+b.x)/2,y:(a.y+b.y)/2,side:'impact'});
   // First contact belongs to both living participants, with deterministic alternating initiative.
   const [first,second]=++impactOrder%2?[a,b]:[b,a];
   for(const [p,q] of [[first,second],[second,first]])if(alive(p.u)&&!p.entered){p.entered=engine.ballEntry(battle,p.u,q.u);}
   if(alive(first.u)&&alive(second.u)){const outcome=attack(first,second);if(!outcome?.ballExtraTurn&&alive(second.u)&&alive(first.u))attack(second,first);}
   sync();
  }
  function fixed(){
   if(done||disposed)return;time+=STEP;battle.spatial.time=time;engine.advanceTimedEffects(battle);if(settle())return;
   const live=[...orbs.values()].filter(p=>alive(p.u));
   for(const p of live){
    if(!alive(p.u))continue;
    if(time+1e-8>=p.nextTick){p.nextTick+=S.TURN_SECONDS;engine.ballTurn(battle,p.u,nearest(p.u));sync();}
    if(alive(p.u)){if(p.energy>=S.ENERGY_MAX)releaseEnergy(p);move(p);}
   }
   if(settle())return;
   const next=new Set();for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){
    const a=live[i],b=live[j];if(alive(a.u)&&alive(b.u))collision(a,b,next);
   }
   contacts=next;settle();while(events.length&&time-events[0].at>1.5)events.shift();
  }
  function step(seconds=STEP){if(done||disposed)return outcome();accumulator+=Math.max(0,Math.min(.5,Number(seconds)||0));while(accumulator+1e-9>=STEP&&!done){accumulator-=STEP;fixed();}return outcome();}
  function remainingSeconds(p,turns){const n=Number(turns);return Number.isFinite(n)&&n>0?Math.max(0,(n-1)*S.TURN_SECONDS+Math.max(0,p.nextTick-time)):0;}
  function status(p){
   const summary=engine.getCombatStatusSummary(p.u,battle);
   return {...summary,effects:summary.effects.map(e=>({...e,seconds:remainingSeconds(p,e.turns)})),passive:engine.getPassiveTooltipData(p.u),counters:engine.getBallPassiveProgress(battle,p.u).map(c=>({...c,seconds:remainingSeconds(p,c.turns)})),counts:{attacks:p.u.passiveState?.ownAttackCount||0,hits:engine.getHitCounts(p.u).hits,followUps:engine.getHitCounts(p.u).followUps,turns:p.u.passiveState?.ownTurnCount||0,kills:p.u.passiveState?.kills||0}};
  }
  function outcome(){return {winner,reason,time,done};}
  return Object.freeze({battle,originalPlayer,originalEnemy,engine,orbs,events,logs,step,status,outcome,writeLog:log,drainAudio:()=>sounds.splice(0),
   get time(){return time;},get done(){return done;},get remaining(){return Math.max(0,LIMIT-time);},
   dispose(){disposed=true;contacts.clear();orbs.clear();events.length=0;sounds.length=0;logs.player.length=0;logs.enemy.length=0;delete battle.spatial;}});
 }
 host.BallCombat=Object.freeze({create,STEP,LIMIT,TURN_SECONDS:S.TURN_SECONDS,makeRandom});
})(window);
