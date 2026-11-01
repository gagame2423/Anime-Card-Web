/* Floor 200 skills: battle-local counters, additive bonuses and status hooks. */
(function(host){
 'use strict';
 host.createTower200Skills=function(api){
  const IDS=Object.freeze(['tower-champion-raining-200','tower-champion-sugar-200','tower-champion-sunny-200','tower-champion-reaper-200']);
  const [FLORENTINO,KAFKA,ESCANOR,YHWACH]=IDS,{has,alive,all,allies,enemies,atk,random,runtime}=api;
  const state=(u,key)=>api.passiveRuntimeFor(u,key).tower200 ||= {attacks:0,immuneUntil:-1,immunityReady:0,webReady:0};
  const turn=bs=>Number(bs?.turnCount)||0;
  const deaths=new WeakMap(),kills=new WeakMap(),observers=new WeakMap();
  const negative=new Set(['stunTurns','freezeTurns','snailTurns','weakenAttackTurns','weakenAttackPct','noDodgeTurns','noDodgeAgainstUnit','hypnosisTurns','incomingVulnerabilityTurns','incomingVulnerabilityPct','passiveSuppressionTurns','passiveSuppressedUntilDeath','passiveDisabled','hindredTurns','deadlightsFearTurn','deadlightsHypnosis','shibuyaHypnosis','heresy']);
  function enabled(bs){if(!bs)return false;if(typeof bs.tower200Enabled!=='boolean')bs.tower200Enabled=all(bs).some(u=>IDS.some(key=>has(u,key)));return bs.tower200Enabled;}
  function entry(bs,u){if(IDS.some(key=>has(u,key)))bs.tower200Enabled=true;}
  function blocked(bs,u,key){
   if(!enabled(bs)||!alive(u)||['invincibleTurns','immuneTurns','incomingImmuneTurns'].includes(key))return false;
   if(has(u,FLORENTINO)&&state(u,FLORENTINO).immuneUntil>turn(bs))return true;
   if(has(u,YHWACH)&&allies(bs,u).length===1){const c=state(u,YHWACH);if(turn(bs)>=c.immunityReady){c.immunityReady=turn(bs)+3;api.log('[PASSIVE] Auswahlen blocked '+key+'.','passive');return true;}}
   return false;
  }
  // Observe legacy direct debuff assignments as well as the shared status API.
  function observe(bs,u,r){
   if(!enabled(bs))return r;
   let record=observers.get(r);if(record?.unit===u)return record.proxy;
   const proxy=new Proxy(r,{get(target,key){const value=target[key];return key==='champion'&&value?observe(bs,u,value):value;},set(target,key,value){
    const old=target[key],afflicted=negative.has(key)&&Boolean(value)&&(key==='deadlightsFearTurn'?value!==old:typeof value==='number'?value>Number(old||0):value!==old);
    if(afflicted&&blocked(bs,u,key))return true;
    target[key]=value;
    if(afflicted)statusApplied(bs,u,value?.source||api.currentSource?.()||bs.tower200Actor);
    return true;
   }});
   observers.set(r,{unit:u,proxy});return proxy;
  }
  function dotFactor(bs,source,kind){return kind==='burn'&&enabled(bs)&&source&&allies(bs,source,false).some(u=>has(u,ESCANOR))?2:1;}
  let webRunning=false;
  function statusApplied(bs,target,source){
   if(!enabled(bs)||!source||!alive(target)||webRunning)return;
   for(const owner of allies(bs,source)){
    if(!has(owner,KAFKA)||owner===source||owner===(bs.tower200Actor||api.currentSource?.())||!enemies(bs,owner).includes(target)||api.stunned(owner)||!api.canFollow(owner))continue;
    const c=state(owner,KAFKA);if(turn(bs)<c.webReady)continue;
    c.webReady=turn(bs)+2;
    let amount=0;
    for(const [kind,effects]of Object.entries(runtime(target)))if(Array.isArray(effects))for(const effect of effects){
     if(effect&&Number.isFinite(effect.damage)&&effect.damage>0&&Number.isFinite(effect.turns)&&effect.turns>0)amount+=effect.damage*effect.turns*dotFactor(bs,effect.source,kind)*(kind==='bleed'?api.bleedFactor(bs,effect.source):1);
    }
    api.log('[PASSIVE] Spider Web · '+Math.floor(amount)+' remaining DoT damage.','passive');
    if(amount>0){webRunning=true;try{api.hit(bs,owner,target,amount,{isFollowUp:true,tower200Web:true});}finally{webRunning=false;}}
   }
  }
  function counted(bs,u,options={}){if(options.isCounter)return;for(const key of IDS)if(has(u,key)){const c=state(u,key);c.attacks++;if(key===ESCANOR&&c.attacks===10&&!c.teamBuff){c.teamBuff=true;for(const ally of allies(bs,u))api.addAtk(ally,.50);}}}
  function replacement(bs,u,target,options={}){
   if(options.isCounter||!has(u,ESCANOR))return null;
   const c=state(u,ESCANOR),tenth=c.attacks>0&&c.attacks%10===0,third=c.attacks>0&&c.attacks%3===0;
   if(!tenth&&!third)return null;
   if(c.attacks===10&&!c.teamBuff){c.teamBuff=true;for(const ally of allies(bs,u))api.addAtk(ally,.50);}
   const targets=tenth?[...enemies(bs,u)]:[target],burnTargets=[...enemies(bs,u)].slice(0,tenth?Infinity:3);
   const result={hit:false,damage:0,killed:false,target,attacker:u};
   for(const enemy of targets){if(!alive(u))break;const shot=api.primary(bs,u,enemy,atk(u)*(tenth?2:1.8),options);result.hit ||= shot.hit;result.damage+=shot.damage||0;result.killed ||= shot.killed;}
   if(alive(u))for(const enemy of burnTargets)if(alive(enemy)&&api.allowed(enemy,u))api.dot(enemy,'burn',tenth?5:2,atk(u)*(tenth?1:.20),u);
   return result;
  }
  function after(bs,u,target,result,options={}){
   if(options.isCounter||result.skipped||!alive(u))return;
   if(has(u,YHWACH)&&result.hit&&alive(target)&&random()<.60&&api.allowed(target,u))api.dot(target,'bleed',2,atk(u)*.30,u);
   if(options.isFollowUp||!has(u,FLORENTINO)||state(u,FLORENTINO).attacks%3!==0||!api.canFollow(u))return;
   let hits=0;
   for(let n=0;n<3&&alive(u)&&api.canFollow(u)&&enemies(bs,u).length;n++){
    if(random()>=api.followChance(bs,u,.80-.20*n))break;
    const enemy=alive(target)?target:enemies(bs,u)[0],shot=api.attack(bs,u,enemy,{isFollowUp:true,passiveAttack:true,damageMultiplier:.60,tower200Flower:true});
    if(shot.skipped||shot.outOfTurn)break;hits++;
   }
   if(hits===3&&alive(u)){state(u,FLORENTINO).immuneUntil=turn(bs)+3;api.log('[PASSIVE] Flower Dance · Status immunity for 3 turns.','passive');}
  }
  function offensive(bs,source,target){return bs&&has(source,YHWACH)&&allies(bs,source).length===1&&runtime(target).bleed?.some(e=>e.turns>0)?1.35:1;}
  function bled(bs,target,amount){if(!(amount>0)||!enabled(bs))return;for(const owner of all(bs))if(alive(owner)&&has(owner,YHWACH)&&api.team(bs,owner)!==api.team(bs,target))api.heal(owner,amount,'AUSWAHLEN',bs,owner);}
  function once(map,bs,victim){let seen=map.get(bs);if(!seen){seen=new WeakSet();map.set(bs,seen);}if(seen.has(victim))return false;seen.add(victim);return true;}
  function killed(bs,victim){if(!enabled(bs)||alive(victim)||!once(kills,bs,victim))return;for(const owner of all(bs))if(alive(owner)&&has(owner,YHWACH)&&api.team(bs,owner)!==api.team(bs,victim))api.addAtk(owner,.10);}
  function died(bs,victim){if(!enabled(bs)||alive(victim)||!once(deaths,bs,victim))return;for(const owner of allies(bs,victim,false))if(has(owner,YHWACH)){api.flat(owner,'hp',Math.max(0,victim.maxHp)*.10);api.flat(owner,'atk',Math.max(0,victim.atk)*.10);}}
  function startTurn(bs,actor){if(enabled(bs))bs.tower200Actor=actor;}
  return {IDS,entry,counted,replacement,after,offensive,bled,killed,died,blocked,statusApplied,dotFactor,observe,startTurn,enabled};
 };
})(window);
