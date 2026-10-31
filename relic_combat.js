/* Battle-only Relic traits. No inventory writes, rolls or permanent stat changes. */
(function(host){
 'use strict';
 host.createRelicSkills=function(api){
  const states=new WeakMap();
  const state=u=>{let s=states.get(u);if(!s){s={first:true,next:0};states.set(u,s);}return s;};
  const trait=u=>!u?.isClone&&!u?.isSummoned&&!u?.isTemporaryAlly&&u?.relic?.unique?u.relic:null;
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
  function prepare(u,options){const r=trait(u),s=state(u);let bonus=s.next;s.next=0;if(s.first){s.first=false;if(r?.kind==='bomb')bonus+=.30;}return bonus?{...options,damageMultiplier:(Number(options.damageMultiplier)||1)*(api.attackBonus?api.attackBonus(u,bonus):1+bonus)}:options;}
  function burnTurns(source,turns){return trait(source)?.kind==='eternal_eye'?turns*2:turns;}
  return {prepareBattle,dodge,hasDodge,crit,onDodge,prepare,burnTurns};
 };
})(window);
