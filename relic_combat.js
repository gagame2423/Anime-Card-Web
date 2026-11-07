/* Battle-only Relic traits. No inventory writes, rolls or permanent stat changes. */
(function(host){
 'use strict';
 host.createRelicSkills=function(api){
  const states=new WeakMap(),actions=new WeakMap();
  const state=u=>{let s=states.get(u);if(!s){s={first:true,next:0};states.set(u,s);}return s;};
  const trait=u=>u?.relic?.unique?u.relic:null;
  function prepareBattle(bs){
   if(bs.mode==='online-pvp'||bs.sandbox)return;
   host.RelicSystem.attachTeam(bs.playerTeam);
   const goku=bs.playerTeam.find(u=>u.hp>0&&!u.defeated&&u.card?.id==='goku-ssj3'&&trait(u)?.kind==='potara_earring'),vegeta=bs.playerTeam.find(u=>u.hp>0&&!u.defeated&&u.card?.id==='vegeta-ssj2'&&trait(u)?.kind==='potara_earring');
   if(!goku||!vegeta)return;
   const hp=goku.maxHp+vegeta.maxHp,atk=goku.atk+vegeta.atk;
   const card={...goku.card,id:'relic-vegito',name:'Vegito',image:'assets/cards/vegito.png',category:[...new Set([...(goku.card.category||[]),...(vegeta.card.category||[])])],stats:{hp,atk},passive:{name:'Potara Fusion',description:'Dragon Combo + Saiyan Prince. 20% dodge; successful dodge grants +25% ATK damage on the next attack.'}};
   const fused={card,display:{name:'Vegito',image:card.image,hp,atk},hp:goku.hp+vegeta.hp,maxHp:hp,atk,level:Math.max(goku.level||1,vegeta.level||1),mutations:[],defeated:false,isVegito:true,relicPrepared:true,portalOwnerId:goku.portalOwnerId,fusionMembers:[goku.card.id,vegeta.card.id]};
   const index=Math.min(bs.playerTeam.indexOf(goku),bs.playerTeam.indexOf(vegeta));bs.playerTeam.splice(bs.playerTeam.indexOf(goku),1);bs.playerTeam.splice(bs.playerTeam.indexOf(vegeta),1);bs.playerTeam.splice(index,0,fused);
   api.runtime(fused).effectivePassiveId='goku-ssj3';api.addCopy(fused,'vegeta-ssj2');api.log('[RELIC] Unique Potara fused Goku SSJ3 and Vegeta SSJ2 into Vegito.');
  }
  function dodge(u,base){if(u?.isVegito)return Math.max(0,.20-base);const r=trait(u);return r?.kind==='god_leaf'&&base<=.80?r.dodge:0;}
  function hasDodge(u){return Boolean(u?.isVegito||trait(u)?.kind==='god_leaf');}
  function crit(u){const r=trait(u);return {chance:r?.kind==='nail'?r.critChance:0,damage:r?.kind==='nail'?r.critDamage:0};}
  function onDodge(u){if(u?.isVegito)state(u).next=.25;}
  function prepare(u,options){const r=trait(u),s=state(u);let bonus=s.next;s.next=0;if(s.first&&!options.isFollowUp&&!options.followOwner){s.first=false;if(r?.kind==='bomb'&&u.card?.element===r.element){const action=actions.get(u);if(action)action.bombBonus=r.firstAttackBonus??.30;}}return bonus?{...options,damageMultiplier:(Number(options.damageMultiplier)||1)*(api.attackBonus?api.attackBonus(u,bonus):1+bonus)}:options;}
  function followBonus(unit){
   if(!unit)return 0;
   const r=unit.relic,card=unit.card;
   return r?.kind==='enten_blade'&&(card?.category||unit.relicCategory||[]).some(c=>c==='Swordman'||c==='Swordsman')&&api.hasFollowUp(unit)?Math.max(0,Math.min(.09,Number(r.followChance)||0)):0;
  }
  function chainChance(unit,chance,secondary=false){
   const r=trait(unit),action=unit&&actions.get(unit);
   return r?.kind==='odm'&&(secondary||action?.isFollowUp||action?.chainDepth>0)?Math.min(.99,chance+Math.max(0,Math.min(.10,Number(r.odmChainBonus)||0))):chance;
  }
  function specialMultiplier(unit,meta={}){
   const action=unit&&actions.get(unit);if(action?.isFollowUp||action?.followOwner||action?.chainDepth>0)return 1;
   const r=trait(unit);if(r?.kind!=='enten_blade'||meta.entenBonusApplied||meta.dot||meta.isFollowUp||meta.followOwner||meta.chainDepth>0||meta.fateSupport||meta.requiemSupport===true||meta.isCounter||meta.championCounter||meta.raidCounter||meta.championRedirect||meta.fateAbsorb||meta.entenReflect||meta.grimoireReflection)return 1;
   if(meta.specialAttack===false)return 1;
   const special=meta.specialAttack===true||meta.championSkill||meta.raidSkill||meta.fateSkill||meta.fateDeath||meta.shibuyaSkill||meta.shibuyaDomain||meta.shibuyaMeteor||meta.requiemStrike!==undefined;
   return special?1+Math.max(0,Math.min(.50,Number(r.specialBonus)||0)):1;
  }
  function attackMultiplier(unit,meta={}){
   const bonus=unit&&actions.get(unit)?.bombBonus||0,factor=bonus?(api.attackBonus?api.attackBonus(unit,bonus):1+bonus):1;
   const excluded=meta.entenBonusApplied||meta.dot||meta.isFollowUp||meta.followOwner||meta.chainDepth>0||meta.fateSupport||meta.requiemSupport===true||meta.isCounter||meta.championCounter||meta.raidCounter||meta.championRedirect||meta.fateAbsorb||meta.entenReflect||meta.grimoireReflection;
   return specialMultiplier(unit,meta)*(excluded?1:factor);
  }
  function withAction(unit,options,callback){
   if(!['enten_blade','bomb','odm'].includes(trait(unit)?.kind))return callback();
   options={...options};
   const previous=actions.get(unit);actions.set(unit,options);
   try{return callback();}finally{if(previous)actions.set(unit,previous);else actions.delete(unit);}
  }
  function burnTurns(source,turns){return trait(source)?.kind==='eternal_eye'?turns*2:turns;}
  return {prepareBattle,dodge,hasDodge,crit,onDodge,prepare,burnTurns,followBonus,chainChance,firstReady:u=>state(u).first,specialMultiplier,attackMultiplier,withAction};
 };
})(window);
