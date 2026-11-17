/* Content skills share the existing isolated runtime. No global listeners, timers or Proxy wrappers. */
(function(host){
 'use strict';
 if(host.createContentSkills?.version===1)return;
 const IDS=Object.freeze(['yoshino-junpei','n-doul','oingo','d-arby','hogus-eagle','vanilla-ice','bakugo','askeladd','pochita','kon','iggy','pikachu','ender-dragon','onana','zenitsu','antony-mu','tung-tung-sahur']);
 host.createContentSkills=function(api){
  const {has,alive,runtime,all,enemies,team,random,atk}=api,seenKills=new WeakMap();
  const state=(u,id)=>((api.passiveRuntimeFor(u,id).contentSkills ||= {})[id] ||= {entered:false,attacks:0,voidTurns:0,failedDodges:0,shieldUsed:false,shieldTurns:0,copy:null,copyTurns:0});
  const scope=(u,id,fn)=>api.scope(u,id,fn),pick=rows=>rows.length?rows[Math.floor(random()*rows.length)]:null;
  const skillHit=(bs,u,v,n,meta={})=>api.hit(bs,u,v,n,{passiveAttack:true,specialAttack:true,contentSkill:true,...meta});
  function contract(bs,u){
   if(!alive(u)||u.contentSacrificed)return;u.contentSacrificed=true;u.championPermanentDeath=true;
   const ally=pick(team(bs,u).filter(v=>v!==u&&alive(v)&&!has(v,'pochita')&&api.allowed(bs,u,v)));
   api.sacrifice(bs,u);
   if(ally){api.percent(ally,'atk','content:saw-contract',.20);runtime(ally).sawContractMiss=true;api.log('[PASSIVE] Saw Contract empowered '+ally.card.name+'; attacks have a 20% miss chance.');}
  }
  function entry(bs,u){for(const id of IDS)if(has(u,id)){const c=state(u,id);if(c.entered)continue;c.entered=true;if(id==='vanilla-ice')c.voidTurns=3;if(id==='pochita')scope(u,id,()=>contract(bs,u));}}
  function matchStart(bs){for(const u of [...all(bs)])if(has(u,'pochita'))entry(bs,u);}
  function prepare(bs,u,target,options){
   if(!options.isFollowUp&&has(u,'tung-tung-sahur')&&random()<.30){const pierce=random()<.5;return{...options,damageMultiplier:(options.damageMultiplier||1)*(pierce?1.5:3),ignoreShield:pierce||options.ignoreShield,specialAttack:true};}return options;
  }
  function pierce(bs,u,target,options={}){
   const victims=[target,...enemies(bs,u).filter(v=>v!==target)].filter(alive),out={hit:false,damage:0,killed:false,target,attacker:u,contentPierce:true};
   for(let index=0;index<victims.length&&alive(u);index++){
    const result=api.primary(bs,u,victims[index],atk(u)*Math.max(.10,1-.30*index),{...options,passiveAttack:true,specialAttack:true,contentSkill:true});
    out.hit ||= result.hit;out.damage+=result.damage||0;out.killed ||= result.killed;
   }return out;
  }
  function attack(bs,u,target,options={}){return api.id(u)==='zenitsu'&&(state(u,'zenitsu').attacks+1)%3===0?scope(u,'zenitsu',()=>pierce(bs,u,target,options)):null;}
  function afterAttack(bs,u,target,out,options={}){
   if(!u||!alive(u)||out.skipped||out.outOfTurn)return;
   for(const id of IDS)if(has(u,id))scope(u,id,()=>{
    const c=state(u,id),count=api.attackCount(u);if(c.processedCount===count)return;c.processedCount=count;c.attacks++;
    if(id==='vanilla-ice'&&random()<.10)c.voidTurns++;
    if(id==='hogus-eagle'&&c.attacks%5===0&&alive(target))api.status(target,'freezeTurns',2,u);
    if(id==='bakugo'&&c.attacks%3===0)for(const v of [...enemies(bs,u)].slice(0,2))skillHit(bs,u,v,atk(u)*.10);
    if(id==='iggy'&&random()<.10&&alive(target))api.status(target,'fearTurns',2,u);
    if(id==='pikachu'&&c.attacks%3===0&&alive(target)&&random()<.80&&api.status(target,'stunTurns',1,u)&&random()<.20)for(const v of [...enemies(bs,u)])if(v!==target)api.status(v,'stunTurns',1,u);
    if(id==='ender-dragon'&&c.attacks%5===0){const victims=[...enemies(bs,u)],fear=random()<.10;for(const v of victims){skillHit(bs,u,v,atk(u)*.10);if(fear&&alive(v))api.status(v,'fearTurns',2,u);}}
    if(id==='zenitsu'&&c.attacks%3===0&&!out.contentPierce)pierce(bs,u,target,options);
    if(id==='askeladd'&&!options.contentChain){for(let n=0;n<12&&alive(u)&&api.canFollow(u);n++){
     if(random()>=api.followChance(bs,u,.10,n>0,.99))break;const v=alive(target)?target:enemies(bs,u)[0];if(!v)break;
     const result=api.follow(bs,u,v,.10,{contentChain:true});if(result.skipped||result.outOfTurn)break;
    }}
   });
  }
  function attacked(bs,u,source,meta={}){
   if(!source||meta.dot||meta.isCounter||meta.contentCounter||!alive(u))return;
   const token=api.attackToken(bs,source,meta);
   if(has(u,'onana')){const c=state(u,'onana');if(c.failedToken!==token){c.failedToken=token;c.failedDodges++;scope(u,'onana',()=>api.percent(u,'atk','content:onana',.04*c.failedDodges));}}
   if(has(u,'antony-mu')){const c=state(u,'antony-mu');if(c.fearToken!==token){c.fearToken=token;if(random()<.15)scope(u,'antony-mu',()=>api.status(source,'fearTurns',3,u));}}
  }
  function damaged(bs,u){if(!alive(u)||!has(u,'yoshino-junpei'))return;const c=state(u,'yoshino-junpei');if(c.shieldUsed||u.hp>=u.maxHp*.50)return;
   c.shieldUsed=true;c.shieldTurns=3;c.shieldApplied=api.ownTurns(bs,u);c.shieldTag='content:moon-dregs';scope(u,'yoshino-junpei',()=>api.shield(u,atk(u)*1.5,c.shieldTag));c.shieldArmed=api.shieldValue(u,c.shieldTag)>0;
  }
  function shieldHit(bs,u,source){const c=api.passiveRuntimeFor(u,'yoshino-junpei').contentSkills?.['yoshino-junpei'];if(!c?.shieldArmed||api.shieldValue(u,c.shieldTag)>0)return;c.shieldArmed=false;c.shieldTurns=0;
   if(alive(source)&&has(u,'yoshino-junpei'))scope(u,'yoshino-junpei',()=>api.dot(source,'poison',2,atk(u)*.10,u));
  }
  function dodge(u){return Math.max(has(u,'onana')?.04:0,has(u,'vanilla-ice')&&state(u,'vanilla-ice').voidTurns>0?.50:0);}
  function onDodge(bs,u,source,out={}){
   if(has(u,'onana')){state(u,'onana').failedDodges=0;scope(u,'onana',()=>api.percent(u,'atk','content:onana',0));}
   if(has(u,'vanilla-ice')&&state(u,'vanilla-ice').voidTurns>0&&alive(source)&&!out.meta?.isCounter&&!out.meta?.contentCounter&&out.incomingDamage>0)scope(u,'vanilla-ice',()=>skillHit(bs,u,source,out.incomingDamage*.80,{isCounter:true,contentCounter:true,specialAttack:false,elementApplied:true}));
  }
  function reduction(u,source,meta){return !meta.dot&&has(u,'kon')&&(api.category(source,'Reaper')||api.category(source,'Bleach'))?.50:0;}
  function attackBonus(bs,u){return has(u,'hogus-eagle')?enemies(bs,u).filter(v=>runtime(v).freezeTurns>0).length*.05:0;}
  function misses(bs,u,options={}){return !options.fearChecked&&!options.dot&&!options.isCounter&&((runtime(u).fearTurns>0&&random()<.15)||(runtime(u).sawContractMiss&&random()<.20));}
  function turnStart(bs,actor){
   for(const u of [...all(bs)])if(alive(u)&&u!==actor&&has(u,'n-doul')){const c=state(u,'n-doul');if(c.offTurn===bs.turnCount)continue;c.offTurn=bs.turnCount;c.offTurns=(c.offTurns||0)+1;if(c.offTurns%2===0){const v=pick(enemies(bs,u));if(v)scope(u,'n-doul',()=>skillHit(bs,u,v,atk(u)*.50));}}
  }
  function turnEnd(bs,u){if(!u)return;const r=runtime(u);if(r.fearTurns>0)r.fearTurns--;
   const v=state(u,'vanilla-ice');if(v.voidTurns>0)v.voidTurns--;
   const s=state(u,'yoshino-junpei');if(s.shieldTurns>0&&api.ownTurns(bs,u)>s.shieldApplied&&--s.shieldTurns===0){s.shieldArmed=false;api.clearShield(u,s.shieldTag);}
   const c=state(u,'oingo');if(c.copy&&(!alive(u)||api.ownTurns(bs,u)>c.copyApplied&&--c.copyTurns<=0)){api.removeCopy(bs,u,c.copy);c.copy=null;}
  }
  function killed(bs,u,victim){
   if(!u||!victim||alive(victim)||team(bs,u)===team(bs,victim))return;let seen=seenKills.get(u);if(!seen){seen=new WeakMap();seenKills.set(u,seen);}const life=api.life(victim);if(seen.get(victim)===life)return;seen.set(victim,life);
   if(has(u,'d-arby')&&!enemies(bs,u).length)(bs.contentRewardWinners ||= {})[api.side(bs,u)]=2;
   if(has(u,'oingo')&&!api.copyBlocked(u)&&alive(u))scope(u,'oingo',()=>{
    const c=state(u,'oingo');if(c.copy)api.removeCopy(bs,u,c.copy);c.copy=null;
    const id=api.passiveId(victim);if(!id||id==='oingo')return;c.copy=api.copy(bs,u,id);c.copyTurns=5;c.copyApplied=api.ownTurns(bs,u);
   });
  }
  function died(bs,u){const c=api.passiveRuntimeFor(u,'oingo').contentSkills?.oingo;if(c?.copy){api.removeCopy(bs,u,c.copy);c.copy=null;}}
  function badges(u){const r=runtime(u),rows=[];if(r.fearTurns>0)rows.push({icon:'◉',label:'FEAR '+r.fearTurns+'t · 15% MISS',tone:'debuff'});if(r.poison?.length)rows.push({icon:'☠',label:'POISON '+r.poison.length,tone:'debuff'});if(r.sawContractMiss)rows.push({icon:'⚒',label:'SAW CONTRACT · 20% MISS',tone:'buff'});if(has(u,'vanilla-ice')&&state(u,'vanilla-ice').voidTurns>0)rows.push({icon:'◌',label:'VOID DOMAIN '+state(u,'vanilla-ice').voidTurns+'t',tone:'form'});if(has(u,'onana')&&state(u,'onana').failedDodges)rows.push({icon:'⚽',label:'ONANA +'+state(u,'onana').failedDodges*4+'% ATK',tone:'buff'});if(has(u,'oingo')&&state(u,'oingo').copy)rows.push({icon:'♢',label:'KHNUM '+state(u,'oingo').copyTurns+'t',tone:'form'});return rows;}
  return {IDS,state,entry,matchStart,prepare,attack,afterAttack,attacked,damaged,shieldHit,dodge,onDodge,reduction,attackBonus,misses,turnStart,turnEnd,killed,died,badges,forbidden:u=>!!u?.contentSacrificed||u?.card?.id==='pochita'};
 };
 host.createContentSkills.version=1;
})(window);
