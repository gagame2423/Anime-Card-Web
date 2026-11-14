/* Bleach skills: deterministic battle hooks, scoped copy state and bounded companions. */
(function(host){
 'use strict';
 host.createBleachSkills=function(api){
  const RUK='rukia-bankai',ULQ='ulquiorra',YAM='yamamoto',STA='coyote-starrk',URA='kisuke-urahara',ARR='normal-arrancar';
  const IDS=Object.freeze([RUK,ULQ,YAM,STA,URA,ARR]),{has,alive,all,allies,enemies,team,runtime,atk,random}=api;
  const state=(u,id)=>api.passiveRuntimeFor(u,id).bleach ||= {entered:false,attacks:0,processed:0,hakka:0,vista:0,form:'base',modeTurns:0,firstRelease:false,shieldTurns:0,shieldCap:0,shieldTag:null,corpse:0,pool:[],readyAt:0,bankai:0,bankaiUsed:false,leftBoost:false};
  const pendingFreeze=new WeakMap(),seenDeaths=new WeakMap(),seenKills=new WeakMap(),proxies=new WeakMap(),observed=new WeakSet(),writing=new WeakSet();
  const control=new Set(['stunTurns','freezeTurns','snailTurns','hypnosisTurns','sinsHypnosisTurns','tensuraHypnosis','hindredTurns','spookyFrogTurns','akatsukiHypnosis','shibuyaHypnosis','deadlightsHypnosis','akatsukiMiss','deadlightsFearTurn','noDodgeTurns','passiveSuppressionTurns','passiveSuppressedUntilDeath','akatsukiPoison','akatsukiVoodoo','akatsukiHealBlock','burn','bleed']);
  const statDebuffs=new Set(['weakenAttackTurns','weakenAttackPct','incomingVulnerabilityTurns','incomingVulnerabilityPct','akatsukiPaper']);
  const turn=bs=>Number(bs?.turnCount)||0;
  const pick=rows=>rows.length?rows[Math.floor(random()*rows.length)]:null;
  const scope=(u,id,fn)=>api.scope(u,id,fn);
  const owns=(u,id)=>api.owns(u,id);
  const forbidden=u=>Boolean(u?.bleachWolf||u?.bleachExpired||u?.card?.id===YAM||owns(u,YAM));
  function once(map,bs,u){let seen=map.get(bs);if(!seen){seen=new WeakSet();map.set(bs,seen);}if(seen.has(u))return false;seen.add(u);return true;}
  function entry(bs,u){
   for(const id of IDS)if(has(u,id)){const c=state(u,id);if(c.entered)continue;c.entered=true;if(id===RUK)c.hakka=0;}
   scorch(bs,u);
  }
  function absolute(bs,u){
   const c=state(u,RUK);if(c.hakka<100||c.absoluteBusy||!alive(u))return;
   c.absoluteBusy=true;c.hakka=0;
   try{for(const enemy of [...enemies(bs,u)]){
    if(api.status(enemy,'freezeTurns',5,u))pendingFreeze.set(enemy,{source:u,turns:2,lease:api.lease(u,RUK)});
    api.hit(bs,u,enemy,atk(u)*5,{specialAttack:true,bleachAbsolute:true});
   }api.log('[PASSIVE] Hakka no Togame · Absolute Zero.','passive');}finally{c.absoluteBusy=false;}
  }
  function hakka(bs,u,n){const c=state(u,RUK);c.hakka=Math.min(100,c.hakka+n);absolute(bs,u);}
  const prepared=new WeakMap();
  function beforeAttack(bs,u,target,options={}){
   if(!u||!target||options.bleachAbsolute||options.bleachSkill)return;
   let r=prepared.get(u);const token=api.attackToken(bs,u,options);if(r?.token===token&&r.target===target)return;
   r={token,target,frozen:runtime(target).freezeTurns>0,bleeding:runtime(target).bleed.some(e=>e.turns>0)};prepared.set(u,r);
   if(has(u,RUK)&&r.frozen)scope(u,RUK,()=>hakka(bs,u,3+Math.floor(random()*3)));
  }
  function multiplier(u,target,meta={}){return !meta.dot&&!meta.bleachSkill&&!meta.bleachAbsolute&&has(u,RUK)&&prepared.get(u)?.target===target&&prepared.get(u)?.frozen?1.30:1;}
  function release(bs,u){
   const c=state(u,ULQ);
   if(c.form==='resurreccion')return;
   if(c.vista>=100){
    c.vista=0;c.firstRelease=false;c.form='resurreccion';c.modeTurns=15;c.shieldTurns=9;
    api.percent(u,'atk','bleach:release',1);
    const amount=Math.min(u.maxHp*10,api.all(bs).filter(v=>team(bs,v)!==team(bs,u)).reduce((n,v)=>n+v.maxHp,0)*.50);
    c.shieldTag ||= api.token('segunda');c.shieldCap=api.shield(u,amount,c.shieldTag);
    cleanseNormal(u);api.log('[PASSIVE] Resurrección Segunda Etapa.','passive');
   }else if(c.vista>=50&&!c.firstRelease){c.firstRelease=true;c.form='murcielago';c.modeTurns=10;api.percent(u,'atk','bleach:release',.50);}
  }
  function counted(bs,u,target,options={}){
   if(options.isCounter)return;
   for(const id of IDS)if(has(u,id))scope(u,id,()=>{
    const c=state(u,id);c.attacks++;
    if(id===STA&&c.attacks%2===0)api.summon(bs,u,'bleach_wolf',null,.10,.10,'Wolf');
    if(id===URA&&c.attacks>=10&&!c.bankaiUsed){c.bankaiUsed=true;c.bankai=5;for(const ally of allies(bs,u))cleanseNormal(ally,true);}
   });
  }
  function afterAttack(bs,u,target,out,options={}){
   if(!u||!target||out?.skipped||!alive(u))return;
   for(const id of IDS)if(has(u,id))scope(u,id,()=>{
    const c=state(u,id);if(c.processed===c.attacks)return;c.processed=c.attacks;
    if(id===RUK&&c.attacks%2===0&&random()<.60&&alive(target)&&api.allowed(target,u)&&api.status(target,'freezeTurns',2,u))hakka(bs,u,10);
    if(id===ULQ){
     if(c.form==='murcielago'&&c.attacks%2===0)for(const enemy of [...enemies(bs,u)].slice(0,3))api.hit(bs,u,enemy,atk(u)*.70,{specialAttack:true,bleachSkill:true});
     if(!options.isFollowUp&&!options.bleachSkill)ulquiorraChain(bs,u,target);
    }
    if(id===STA){
     if(options.isFollowUp&&c.attacks>=7)barrage(bs,u);
    }
    if(id===URA){
     if(out.hit&&alive(target)&&prepared.get(u)?.target===target&&prepared.get(u)?.bleeding){const hit=api.take(bs,u,target,atk(u)*.10,{passiveAttack:true,specialAttack:true,ignoreShield:true,ignoreReduction:true,dodgeChecked:true,bleachSkill:true});out.damage=(out.damage||0)+(hit.damage||0);out.killed ||= hit.killed;}
     if(c.attacks%3===0&&alive(target)&&api.allowed(target,u))api.dot(target,'bleed',1,atk(u)*.50,u);
     if(c.bankai>0&&out.damage>0)for(const ally of allies(bs,u))api.heal(ally,out.damage*.30,'Kannonbiraki',bs,u);
    }
    if(id===ARR&&c.attacks%7===0)for(const enemy of [...enemies(bs,u)])api.hit(bs,u,enemy,atk(u)*.20,{specialAttack:true,bleachSkill:true});
   });
  }
  function ulquiorraChain(bs,u,target){
   const c=state(u,ULQ);
   for(let index=0;alive(u)&&api.canFollow(u)&&index<(c.form==='resurreccion'?10:c.form==='murcielago'?5:3);index++){
    if(random()>=api.followChance(bs,u,.75,index>0,.99))break;
    const enemy=alive(target)?target:enemies(bs,u)[0];if(!enemy)break;
    const segunda=c.form==='resurreccion',out=api.follow(bs,u,enemy,segunda?.50:.30,{bleachChain:true});if(out.skipped||out.outOfTurn)break;
    if(segunda){api.heal(u,u.maxHp*.003,'Segunda Etapa',bs,u);if(c.shieldTurns>0&&c.shieldCap>0){const missing=c.shieldCap-api.shieldValue(u,c.shieldTag);if(missing>0)api.shield(u,Math.min(missing,u.maxHp*.03),c.shieldTag);}}
    else{c.vista=Math.min(100,c.vista+1);release(bs,u);}
   }
  }
  function result(u,target){return{hit:false,damage:0,killed:false,target,attacker:u};}
  function primary(bs,u,target,scale,options,out){if(!alive(u)||!alive(target))return out;const hit=api.primary(bs,u,target,atk(u)*scale,options);out.hit ||= hit.hit;out.damage+=hit.damage||0;out.killed ||= hit.killed;out.critical ||= hit.critical;return out;}
  function attack(bs,u,target,options={}){
   if(options.isFollowUp)return null;
   const id=api.id(u);if(id!==YAM&&id!==STA)return null;
   return scope(u,id,()=>{
    const c=state(u,id),out=result(u,target),special={...options,specialAttack:true,bleachSkill:true};
    if(id===YAM){
     if(!api.ownTurn(bs,u,options)||!api.once(bs,u,'zanka-technique',options))return primary(bs,u,target,1,{...options,specialAttack:false},out);
     if(!c.pool.length)c.pool=[0,1,2,3];const move=c.pool.splice(Math.floor(random()*c.pool.length),1)[0];c.lastMove=move;
     if(move===0){if(runtime(target).shield>0){api.breakShield(bs,u,target);out.hit=true;}else primary(bs,u,target,1.50,special,out);}
     if(move===1){primary(bs,u,target,1,special,out);if(alive(target))api.dot(target,'burn',2,atk(u)*.80,u);c.burnImmune=api.ownTurns(bs,u)+1;out.hit=true;}
     if(move===2){const dead=api.deadEnemies(bs,u).filter(v=>!api.uncloneable(v));const victim=pick(dead);if(victim)api.summon(bs,u,'bleach_south',victim,.30,.30,'South Clone');else{api.add(u,'atk',.30);api.add(u,'hp',.30,true);}out.hit=true;}
     if(move===3){if(runtime(target).burn.some(e=>e.turns>0)){const hit=api.take(bs,u,target,target.hp*.10,{passiveAttack:true,specialAttack:true,bleachSkill:true});out.hit=true;out.damage=hit.damage||0;out.killed=hit.killed;u.hp=Math.max(1,u.hp-Math.floor(u.hp*.15));api.refresh(u);}else{for(const enemy of [...enemies(bs,u)])api.dot(enemy,'burn',2,atk(u)*1.20,u);out.hit=true;}}
     api.log('[PASSIVE] Zanka No Tachi · '+['East','West','South','North'][move]+'.','passive');return out;
    }
    const left=random()<.50;c.lastGun=left?'Left':'Right';
    if(left){const start=c.leftBoost?.75:.50;c.leftBoost=false;primary(bs,u,target,1,{...options,specialAttack:false},out);
     for(let n=0;n<8&&alive(u)&&api.canFollow(u);n++){const chance=start-.10*n;if(chance<=0||random()>=api.followChance(bs,u,chance,n>0,.99))break;const enemy=alive(target)?target:enemies(bs,u)[0];if(!enemy)break;const hit=api.follow(bs,u,enemy,.50+.10*n,{bleachChain:true});out.damage+=hit.damage||0;out.killed ||= hit.killed;if(hit.skipped||hit.outOfTurn)break;}
    }else{primary(bs,u,target,1.50,special,out);if(alive(target))hinder(bs,u,target,1);for(const wolf of api.wolves(bs,u)){const enemy=alive(target)?target:enemies(bs,u)[0];if(!enemy||!alive(u))break;const hit=api.assist(bs,wolf,enemy,u);out.damage+=hit.damage||0;out.killed ||= hit.killed;if(c.attacks>=7)barrage(bs,u);}}
    return out;
   });
  }
  function barrage(bs,u){for(const enemy of [...enemies(bs,u)])api.hit(bs,u,enemy,atk(u)*.30,{passiveAttack:true,specialAttack:false,followOwner:u,bleachSkill:true,bleachBarrage:true});}
  function hinder(bs,source,u,turns){if(api.status(u,'hindredTurns',turns,source))runtime(u).hindredAppliedTurn=turn(bs);}
  function bankaiOwner(bs,u){return allies(bs,u).find(owner=>has(owner,URA)&&state(owner,URA).bankai>0&&api.assistance(bs,owner,u));}
  function cleanseNormal(u,stats=false){const r=runtime(u);for(const key of control)if(!['burn','bleed'].includes(key))r[key]=['akatsukiPoison','akatsukiVoodoo'].includes(key)?[]:typeof r[key]==='number'?0:null;for(const key of ['burn','bleed'])r[key]=(r[key]||[]).filter(e=>e.uncleansable);if(stats)for(const key of statDebuffs)r[key]=0;}
  function status(bs,u,key,source,details={}){
   if(!u||writing.has(u))return false;
   if(key==='freezeTurns'&&owns(u,RUK)){
    if(source&&team(bs,source)!==team(bs,u))scope(u,RUK,()=>{api.add(u,'atk',.50);api.add(u,'hp',.25,true);});return true;
   }
   if(details.uncleansable)return false;
   if(!control.has(key)&&!statDebuffs.has(key))return false;
   if(key==='burn'&&has(u,YAM)&&api.ownTurns(bs,u)<=(state(u,YAM).burnImmune??-1))return true;
   if(key==='bleed'){
    const owner=allies(bs,u).find(v=>has(v,URA)&&turn(bs)>=state(v,URA).readyAt&&api.assistance(bs,v,u));
    if(owner){const list=details.effects||runtime(u).bleed||[],value=list.reduce((n,e)=>n+Math.max(0,e.damage||0)*Math.max(0,e.turns||0),0);if(value>0){scope(owner,URA,()=>{state(owner,URA).readyAt=turn(bs)+3;writing.add(u);try{runtime(u).bleed=[];}finally{writing.delete(u);}api.shield(u,value,null);});return true;}}
   }
   const c=has(u,ULQ)?state(u,ULQ):null;
   return Boolean(!statDebuffs.has(key)&&c?.form==='resurreccion'&&runtime(u).shield>0||bankaiOwner(bs,u));
  }
  function observe(bs,u,r){
   if(!r||observed.has(r))return r;if(proxies.has(r))return proxies.get(r);
   const proxy=new Proxy(r,{set(target,key,value){
    const current=api.currentBattle()||bs;
    const active=Array.isArray(value)?value.some(e=>e?.turns>0):value&&typeof value==='object'?'turns'in value?value.turns>0:true:Boolean(value);
    if((control.has(key)||statDebuffs.has(key))&&active&&value!==target[key]&&status(current,u,key,api.currentSource(),{effects:Array.isArray(value)?value:undefined,uncleansable:Array.isArray(value)&&value.every(e=>e.uncleansable)}))return true;
    return Reflect.set(target,key,value);
   }});proxies.set(r,proxy);observed.add(proxy);return proxy;
  }
  function bleedBonus(bs,source){return source?allies(bs,source).filter(u=>has(u,URA)&&api.assistance(bs,u,source)).reduce((n,u)=>n+atk(u)*.25,0):0;}
  function startTurn(bs){for(const u of [...all(bs)])if(alive(u)&&u.bleachExpiresAt!==undefined&&turn(bs)>=u.bleachExpiresAt){u.bleachExpired=true;api.forceDeath(bs,u.companionOwner,u);}for(const u of all(bs)){if(!alive(u))continue;if(bankaiOwner(bs,u))cleanseNormal(u,true);else if(has(u,ULQ)&&state(u,ULQ).form==='resurreccion'&&runtime(u).shield>0)cleanseNormal(u);const pending=runtime(u).bleed;if(pending?.length)status(bs,u,'bleed',pending[0].source,{effects:pending});}}
  function endTurn(bs,actor){
   if(actor&&api.ownTurn(bs,actor)){
    if(api.passiveRuntimeFor(actor,ULQ).bleach){scope(actor,ULQ,()=>{const c=state(actor,ULQ);if(c.shieldTurns>0&&--c.shieldTurns===0)api.clearShield(actor,c.shieldTag);if(c.modeTurns>0&&--c.modeTurns===0){c.form='base';api.percent(actor,'atk','bleach:release',0);}});}
    const bankai=api.passiveRuntimeFor(actor,URA).bleach;if(bankai?.bankai>0)bankai.bankai--;
   }
   if(actor){const pending=pendingFreeze.get(actor);if(pending&&runtime(actor).freezeTurns<=0){pendingFreeze.delete(actor);if(!pending.lease?.expired)hinder(bs,pending.source,actor,pending.turns);}}
   for(const u of [...all(bs)])if(alive(u)&&u.bleachExpiresAt!==undefined&&turn(bs)>=u.bleachExpiresAt){u.bleachExpired=true;api.forceDeath(bs,u.companionOwner,u);}
   let retired=false;for(const line of [bs.playerTeam,bs.enemyTeam]){const key=line===bs.playerTeam?'playerIndex':'enemyIndex',front=line[bs[key]];for(let i=line.length-1;i>=0;i--)if(!alive(line[i])&&(line[i].bleachWolf||line[i].bleachExpired)){line.splice(i,1);retired=true;}bs[key]=Math.max(0,line.indexOf(front));}if(retired)api.indices(bs);
  }
  function killed(bs,killer,victim,context={}){
   if(!killer||!victim||team(bs,killer)===team(bs,victim)||!has(killer,YAM))return;
   let kills=seenKills.get(bs);if(!kills){kills=new WeakMap();seenKills.set(bs,kills);}const life=api.life(victim);if(kills.get(victim)===life)return;kills.set(victim,life);
   state(killer,YAM).corpse+=context.dot==='burn'?5:1;
  }
  function died(bs,u){
   if(!u||alive(u)||!owns(u,YAM)||!once(seenDeaths,bs,u))return;
   const c=state(u,YAM),power=atk(u);for(const enemy of [...enemies(bs,u)])api.hit(bs,u,enemy,power*c.corpse*.10,{passiveAttack:true,specialAttack:true,bleachDeath:true});
   const source={owner:u,power,side:api.side(bs,u),seen:new WeakSet(),lease:api.lease(u,YAM)};const front=api.enemyFront(bs,u);if(front)source.seen.add(front);(bs.bleachScorched ||= []).push(source);
  }
  function scorch(bs,u){if(!bs||!alive(u))return;for(const scar of bs.bleachScorched||[]){if(scar.lease?.expired||api.side(bs,u)===scar.side||scar.seen.has(u))continue;scar.seen.add(u);api.dot(u,'burn',5,scar.power*.10,scar.owner);}}
  function fronts(bs){if(bs?.bleachScorched?.length){scorch(bs,bs.player);scorch(bs,bs.enemy);}}
  function cleanup(bs,u,copy){if(!copy)return;const c=copy.state?.bleach;if(c?.shieldTag)api.clearShield(u,c.shieldTag);if(copy.id===ULQ)api.percent(u,'atk','bleach:release',0);bs.bleachScorched=(bs.bleachScorched||[]).filter(s=>s.lease!==copy.yuukiLease&&s.lease!==copy);}
  function dodge(u){return has(u,STA)?.24:0;}
  function onDodge(u){if(has(u,STA))state(u,STA).leftBoost=true;}
  function badges(u){const rows=[];for(const id of IDS)if(has(u,id)){const c=state(u,id);if(id===RUK)rows.push({icon:'❄',label:'HAKKA '+c.hakka+'/100',tone:'buff'});if(id===ULQ)rows.push({icon:'◈',label:c.form==='base'?'VISTA '+c.vista+'/100':c.form.toUpperCase()+' '+c.modeTurns+'t · VISTA '+c.vista,tone:'form'});if(id===YAM)rows.push({icon:'♨',label:'CORPSE '+c.corpse+' · '+c.pool.length+' TECHNIQUES',tone:'buff'});if(id===STA)rows.push({icon:'◆',label:c.leftBoost?'SONÍDO · LEFT 75%':'CERO METRALLETA',tone:'buff'});if(id===URA&&c.bankai)rows.push({icon:'✚',label:'KANNONBIRAKI '+c.bankai+'t',tone:'form'});}return rows;}
  return {IDS,state,entry,beforeAttack,multiplier,counted,afterAttack,attack,status,observe,bleedBonus,startTurn,endTurn,killed,died,fronts,scorch,cleanup,dodge,onDodge,badges,forbidden,cleanseNormal};
 };
})(window);
