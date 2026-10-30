/* New DragonWarrior skills. Only battle-local state; existing cards are untouched. */
(function(host){
 'use strict';
 host.createDragonSkills=function(api){
  const IDS=Object.freeze(['goku-ssj3','vegeta-ssj2','broly','ultimate-gohan','golden-frieza']);
  const {has,alive,all,allies,enemies,team,atk,random}=api;
  const state=(u,key)=>api.passiveRuntimeFor(u,key).dragon ||= {entered:false,attacks:0,bonus:0,bulmaBonus:0,next:0};
  const front=(bs,u)=>api.front(bs,team(bs,u));
  function entry(bs,u){for(const key of IDS)if(has(u,key)){const c=state(u,key);if(c.entered)continue;c.entered=true;if(key==='ultimate-gohan'){const r=api.runtime(u);r.critChanceBonus+=.15;r.critDamageBonus+=.30;}}}
  function crit(bs,u){if(!bs||!host.CategorySystem.has(u,'DragonWarrior'))return 0;return allies(bs,u).reduce((n,owner)=>n+(has(owner,'ultimate-gohan')?.05:0)+(has(owner,'goku-ssj3')?.05:0),0);}
  function startTurn(bs,actor){
   if(!all(bs).some(u=>IDS.includes(u.card?.id)||IDS.some(key=>has(u,key))||api.runtime(u).dragonAuraApplied))return;
   bs.dragonActor=actor;
   for(const u of all(bs)){
    if(!alive(u))continue;
    if(has(u,'broly')){const c=state(u,'broly');c.bonus+=u===actor?.03:.012;api.setAtk(u,'legendary-super-saiyan',c.bonus);}
    const aura=allies(bs,u).some(owner=>has(owner,'golden-frieza')&&owner!==actor);
    api.runtime(u).dragonAuraApplied=aura;api.setAtk(u,'supernova-aura',aura?.10:0);api.setHp(u,'supernova-aura',aura?.10:0);
   }
  }
  function healFactor(bs,u){return bs&&enemies(bs,u).some(owner=>has(owner,'golden-frieza')&&owner!==bs.dragonActor)?.8:1;}
  function target(bs,u,fallback,options){if(has(u,'golden-frieza')&&!options.isFollowUp&&!state(u,'golden-frieza').attacks)return enemies(bs,u).reduce((a,b)=>!a||atk(b)<atk(a)?b:a,null)||fallback;return fallback;}
  function prepare(bs,u,options){
   if(has(u,'goku-ssj3')&&!options.isFollowUp){const c=state(u,'goku-ssj3'),bonus=c.next;c.next=0;return {...options,damageMultiplier:(Number(options.damageMultiplier)||1)*(1+bonus)};}
   return options;
  }
  function counted(bs,u,options){for(const key of IDS)if(has(u,key)){
   const c=state(u,key);if(!options.isFollowUp)c.attacks++;
   if(key==='vegeta-ssj2'){c.bonus=Math.min(1,Math.round((c.bonus+.01)*100)/100);if(c.bonus>=1){api.heal(u,u.maxHp,'SAIYAN PRINCE',bs,u);c.bonus=0;}api.setAtk(u,'saiyan-prince',c.bonus);}
  }}
  function replacement(bs,u,target,options){
   let targets=null,scale=1,ignoreReduction=false;
   if(has(u,'vegeta-ssj2')&&!options.isFollowUp&&state(u,'vegeta-ssj2').attacks===10){targets=[...enemies(bs,u)];scale=10;ignoreReduction=true;}
   else if(has(u,'golden-frieza')&&random()<.30){targets=enemies(bs,u).slice(0,3);scale=.5;}
   if(!targets)return null;
   const result={hit:false,damage:0,killed:false,target,attacker:u};
   for(const enemy of targets){if(!alive(u))break;const shot=api.primary(bs,u,enemy,atk(u)*scale,{...options,ignoreReduction});result.hit ||= shot.hit;result.damage+=shot.damage||0;result.killed ||= shot.killed;}
   return result;
  }
  let supporting=false;
  function critical(bs,u,target,result,options={}){
   if(!result.critical||!result.hit||supporting)return;
   supporting=true;
   try{for(const owner of allies(bs,u,false))if(alive(owner)&&has(owner,'ultimate-gohan')&&!api.stunned(owner)&&api.canFollow(owner)){
    const enemy=alive(target)?target:enemies(bs,owner)[0];if(enemy)api.hit(bs,owner,enemy,atk(owner)*1.5,{isFollowUp:true,followOwner:u,dragonSupport:true});
   }}finally{supporting=false;}
  }
  function after(bs,u,target,result,options={}){
   if(!has(u,'goku-ssj3')||options.isFollowUp||!alive(u)||result.skipped||!api.canFollow(u))return;
   const c=state(u,'goku-ssj3');let count=0;
   while(alive(u)&&has(u,'goku-ssj3')&&api.canFollow(u)&&enemies(bs,u).length&&random()<api.followChance(bs,u,.30)){
    target=alive(target)?target:enemies(bs,u)[0];
    const shot=api.attack(bs,u,target,{isFollowUp:true,passiveAttack:true,damageMultiplier:.30,dragonChain:true});
    if(shot.skipped||shot.outOfTurn)break;count++;c.next+=.05;
   }
   if(count>=3&&alive(u))for(const enemy of [...enemies(bs,u)])api.hit(bs,u,enemy,atk(u)*.30,{dragonCombo:true});
  }
  function taken(bs,u,outcome){if(!(outcome?.damage>0)||u.card?.id!=='bulma')return;for(const owner of allies(bs,u,false))if(has(owner,'vegeta-ssj2')){const c=state(owner,'vegeta-ssj2');c.bulmaBonus=Math.min(1,c.bulmaBonus+.05);api.setAtk(owner,'bulma-rage',c.bulmaBonus);}}
  function protect(bs,u,amount,meta={}){
   if(u.card?.id!=='bulma'||amount<u.hp||amount<=0||meta.dot)return false;
   const owner=allies(bs,u,false).find(v=>has(v,'vegeta-ssj2')&&!state(v,'vegeta-ssj2').rescued);if(!owner)return false;
   state(owner,'vegeta-ssj2').rescued=true;const line=team(bs,u),a=line.indexOf(u),b=line.indexOf(owner);[line[a],line[b]]=[line[b],line[a]];
   bs[line===bs.playerTeam?'playerIndex':'enemyIndex']=line.indexOf(owner);api.indices(bs);return true;
  }
  return {IDS,entry,crit,startTurn,healFactor,target,prepare,counted,replacement,critical,after,taken,protect};
 };
})(window);
