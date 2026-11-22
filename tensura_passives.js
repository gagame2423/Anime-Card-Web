/* Tensura: explicit battle hooks; no listeners, intervals or persisted combat state. */
(function(host){
 'use strict';
 if(host.createTensuraSkills?.__tensura_passivesWrapped)return;
 const instances=new WeakMap();
 host.createTensuraSkills=function(api){
  if(instances.has(api))return instances.get(api);
  const RIM='rimuru-demon-lord',VEL='veldora',DIA='diablo',BEN='benimaru-jura',YUU='yuuki-kagurazaka';
  const IDS=Object.freeze([RIM,VEL,DIA,BEN,YUU]),{has,alive,runtime,all,enemies,atk,random,heal}=api;
  const state=(u,id)=>api.passiveRuntimeFor(u,id).tensura ||= {sage:0,energy:1000,attacks:0,entered:false,execution:false,copy:null,shiftTarget:null};
  const pending=new WeakMap(),killed=new WeakMap();
  const debuffs=new Set(['fearTurns','poison','stunTurns','freezeTurns','snailTurns','weakenAttackTurns','weakenAttackPct','hypnosisTurns','sinsHypnosisTurns','passiveSuppressionTurns','passiveSuppressedUntilDeath','hindredTurns','akatsukiHypnosis','shibuyaHypnosis','deadlightsHypnosis','akatsukiMiss','akatsukiPoison','akatsukiVoodoo','akatsukiHealBlock','tensuraHypnosis','incomingVulnerabilityTurns']);
  const buffs=new Set(['shield','atkBonusPct','maxHpBonusPct','critChanceBonus','critDamageBonus','damageReductionPct','postReviveDodgeBonus','invincibleTurns','incomingImmuneTurns','immuneTurns','nextAttackMultiplier','nextAttackIsBuffed','nextAttackCritGuaranteed']);
  function duel(bs){const d=bs?.tensuraDuel;if(d&&(!api.inBattle(bs,d.a)||!api.inBattle(bs,d.b))){bs.tensuraDuel=null;return null;}return d||null;}
  const participant=(d,u)=>u===d.a||u===d.b;
  function inactive(bs,u){const d=duel(bs);return Boolean(d&&!participant(d,u));}
  function effectAllowed(bs,source,target){const d=duel(bs);return !d||Boolean(source&&participant(d,source)&&participant(d,target));}
  function allies(bs,u,list){const d=duel(bs);return d?list.filter(v=>v===u&&participant(d,u)):list;}
  function opponents(bs,u,list){const d=duel(bs);return d?list.filter(v=>participant(d,v)&&v!==u):list;}
  function start(bs){
   bs.tensuraDuel=null;
   for(const line of [bs.playerTeam,bs.enemyTeam]){const u=line?.[0];if(u&&api.owns(u,DIA)){const enemy=(line===bs.playerTeam?bs.enemyTeam:bs.playerTeam)?.[0];if(enemy&&alive(enemy)){state(u,DIA).isolated=true;bs.tensuraDuel={a:u,b:enemy};bs.tensuraWaiting=[...(bs.playerTeam||[]),...(bs.enemyTeam||[])].filter(v=>v!==u&&v!==enemy);api.log('[PASSIVE] Immortal Spirit · isolated lead duel.','passive');break;}}}
  }
  function suppressedByFlame(u){return (u?.passiveState?.burn||[]).some(e=>e.turns>0&&e.tensuraSuppression);}
  function allowGain(bs,u,delta,source=api.currentSource()){if(!(delta>0))return true;if(suppressedByFlame(u))return false;const d=duel(bs);return !d||!participant(d,u)||source===u;}
  function cleanseIncoming(u,key,uncleansable=false){if(uncleansable||!debuffs.has(key)&&!['burn','bleed','poison','passive suppression'].includes(key)||!has(u,RIM))return false;const c=state(u,RIM);if(c.sage<=10)return false;c.sage-=10;api.log('[PASSIVE] Universal Predator cleansed '+key+'.','passive');return true;}
  function observe(bs,u,r){return api.observeRuntime(bs,u,r,'tensura',[...buffs,...debuffs],(target,key,value)=>{
    const current=api.currentBattle?.()||bs,before=target[key];
    if(buffs.has(key)&&Number(value)>Number(before||0)&&!allowGain(current,u,Number(value)-Number(before||0)))return{block:true};
    const activeStatus=Array.isArray(value)?value.some(e=>e?.turns>0):value&&typeof value==='object'?'turns'in value?value.turns>0:true:Boolean(value);
    if(debuffs.has(key)&&activeStatus&&(typeof value==='number'?value>Number(before||0):value!==before)&&cleanseIncoming(u,key))return{block:true};
    const lease=api.currentLease();if(lease&&!lease.expired&&buffs.has(key)&&value!==before){const previous=lease.runtime.find(c=>c.target===target&&c.key===key);if(previous)previous.after=value;else lease.runtime.push({target,key,before,after:value});}
    return{value};
  });}
  function entry(bs,u){
   if(has(u,VEL)){const c=state(u,VEL);if(!c.entered){c.entered=true;for(const v of [...enemies(bs,u)])if(alive(u)&&atk(v)<atk(u))api.hit(bs,u,v,atk(u)*2,{passiveAttack:true,specialAttack:true,tensuraEntry:true});}}
  }
  function beforeAttack(bs,u,target,options={}){
   if(has(u,RIM)){const c=state(u,RIM);if(c.sage>40&&host.ElementSystem.multiplier(u,target)<=1){const element=host.ElementSystem.TYPES.find(e=>host.ElementSystem.COUNTERS[e]===target.card.element);if(element){c.sage-=40;c.shiftTarget=target;const previous=u.card.element;u.card={...u.card,element};api.watch?.change(u,previous,element);}}}
  }
  function attack(bs,u,target,options={}){
   if(options.isCounter)return;
   if(has(u,RIM)){const n=1+Math.floor(random()*10);state(u,RIM).sage+=api.watch?.gain(u,n)??n;}
   if(has(u,YUU)){const c=state(u,YUU);if(c.energy>=1){c.energy--;heal(u,u.maxHp*.005,'Soul Siphon',bs,u);}if(!options.isFollowUp)c.attacks++;}
   if(!options.isFollowUp)for(const id of [VEL,BEN])if(has(u,id))state(u,id).attacks++;
   if(has(u,BEN)&&state(u,BEN).attacks>=10)for(const v of enemies(bs,u))for(const e of runtime(v).burn)if(e.source===u&&e.turns>0)e.tensuraSuppression=true;
  }
  function afterAttack(bs,u,target,out,options={}){
   if(options.isFollowUp||options.isCounter||!u||out?.skipped||!alive(u))return;
   if(has(u,VEL)&&state(u,VEL).attacks%3===0&&alive(target)&&api.allowed(target,u)){
    if(api.status(target,'stunTurns',1,u)){pending.set(target,{source:u,stage:'stun'});api.log('[PASSIVE] Storm Dragon · Stun, then passive suppression.','passive');}
   }
   if(has(u,DIA)&&alive(target)&&random()<.10)api.status(target,'tensuraHypnosis',1,u);
   if(has(u,BEN)&&state(u,BEN).attacks%2===0&&api.canFollow(u)){
    for(let n=1;n<=24&&alive(u)&&api.canFollow(u);n++){
     if(random()>=api.followChance(bs,u,.44,n>1,.99))break;
     const enemy=alive(target)?target:enemies(bs,u)[0];if(!enemy)break;
     const burned=runtime(enemy).burn.some(e=>e.turns>0);
     const shot=api.follow(bs,u,enemy,atk(u)*.30,{isFollowUp:true,passiveAttack:true,specialAttack:false,tensuraFollow:true});
     if(shot.skipped)break;
     if(shot.hit&&alive(enemy)){
      if(n===2)api.dot(enemy,'burn',2,atk(u)*.30,u,{tensuraSuppression:state(u,BEN).attacks>=10});
      if(burned)api.dot(enemy,'burn',1,atk(u)*.20,u,{uncleansable:true,tensuraSuppression:state(u,BEN).attacks>=10});
     }
    }
   }
   if(has(u,YUU)){const c=state(u,YUU);if(c.attacks>0&&c.attacks%3===0&&c.energy>=50){
    if(c.copy)api.removeCopy(bs,u,c.copy);c.copy=null;
    const pool=api.cards().filter(card=>card.passive?.name&&card.id!==YUU&&!api.passiveIds(u,true).includes(card.id));
    const card=pool[Math.floor(random()*pool.length)];if(card){c.energy-=50;c.copy=api.copy(bs,u,card.id);api.log('[PASSIVE] Mammon Creator · '+card.passive.name+'.','passive');}
   }}
  }
  function passiveImmune(u,meta){return has(u,YUU)&&state(u,YUU).energy>1500&&Boolean(meta.passiveAttack||meta.specialAttack||meta.dot);}
  function beforeDamage(bs,source,u,amount,meta={}){
   if(!effectAllowed(bs,source,u))return 0;
   if(!meta.dot&&amount>0){
    if(has(u,RIM)){const c=state(u,RIM);if(c.sage>3){c.sage-=3;heal(u,u.maxHp*.01,'Universal Predator',bs,u);}}
    if(has(u,DIA)&&source&&(source.card?.element==='Water'||host.ElementSystem.multiplier(source,u)<1))heal(u,u.maxHp*.03,'Immortal Spirit',bs,u);
   }
   if(has(u,YUU)){
    const c=state(u,YUU);if(c.energy>1500&&(meta.passiveAttack||meta.specialAttack||meta.dot))return 0;
    if(!meta.dot&&source){if(api.category(source,'Magician')){c.energy=Math.max(0,c.energy-5);amount*=.50;}else amount*=1.25;}
   }
   return amount;
  }
  function fatal(bs,u){if(!has(u,YUU)||u.championPermanentDeath)return false;const c=state(u,YUU);if(c.energy<=500)return false;c.energy-=500;u.hp=Math.max(1,Math.round(u.maxHp*.33));u.defeated=false;api.revived(bs,u);return true;}
  function execute(bs,u,target,amount){if(!has(u,RIM)||state(u,RIM).execution||amount<target.hp||amount<=0||api.dummy(bs,target))return false;state(u,RIM).execution=true;target.championPermanentDeath=true;return true;}
  function onKill(bs,u,victim){
   if(!u||!victim)return;
   let seen=killed.get(u);if(!seen){seen=new WeakSet();killed.set(u,seen);}if(seen.has(victim))return;seen.add(victim);
   if(has(u,YUU))state(u,YUU).energy+=api.watch?.gain(u,100)??100;
   for(const owner of all(bs)){const c=api.passiveRuntimeFor(owner,RIM).tensura;if(c?.shiftTarget===victim){c.shiftTarget=null;const previous=owner.card.element;owner.card={...owner.card,element:'Dark'};api.watch?.change(owner,previous,'Dark');}}
   const d=duel(bs);if(d&&participant(d,victim)&&!alive(victim))bs.tensuraDuel=null;
  }
  function beforeControl(bs,u){const r=runtime(u);if(has(u,VEL)&&r.stunTurns>0)heal(u,u.maxHp*.15,'Stun Recovery',bs,u);if(r.tensuraHypnosis>0){r.tensuraHypnosis--;return true;}return false;}
  function turnEnd(bs,u){const p=pending.get(u);if(p?.stage==='stun'&&runtime(u).stunTurns<=0){pending.delete(u);api.disable(u,1,bs,p.source);}const d=duel(bs);if(d&&(!alive(d.a)||!alive(d.b)))bs.tensuraDuel=null;if(!bs.tensuraDuel&&bs.tensuraWaiting?.length){const waiting=bs.tensuraWaiting;bs.tensuraWaiting=[];for(const v of waiting)if(alive(v)&&api.inBattle(bs,v))api.enter(bs,v);}}
  function wave(bs,old){duel(bs);for(const u of bs.playerTeam||[]){const r=runtime(u);for(const key of ['lastFacingEnemy','lastAttacker','noDodgeAgainstUnit'])if(old.includes(r[key]))r[key]=null;if(has(u,RIM)&&old.includes(state(u,RIM).shiftTarget)){state(u,RIM).shiftTarget=null;const previous=u.card.element;u.card={...u.card,element:'Dark'};api.watch?.change(u,previous,'Dark');}}}
  function badges(u){const rows=[];if(has(u,RIM))rows.push({icon:'◈',label:'SAGE '+state(u,RIM).sage,tone:'buff'});if(has(u,YUU))rows.push({icon:'◉',label:'SOUL '+state(u,YUU).energy,tone:'buff'});if(runtime(u).tensuraHypnosis>0)rows.push({icon:'⊘',label:'HYPNOSIS · SKIP',tone:'debuff'});return rows;}
  const skills={IDS,state,onMatchStart:start,onEntry:entry,beforeAttack,onAttack:attack,afterAttack,beforeDamageTaken:beforeDamage,onFatalHit:fatal,onKill,onStatusInflicted:cleanseIncoming,beforeControl,onTurnEnd:turnEnd,onWave:wave,observe,allowGain,passiveImmune,inactive,effectAllowed,allies,opponents,execute,badges,duel};instances.set(api,skills);return skills;
 };
host.createTensuraSkills.__tensura_passivesWrapped=true;
})(window);
