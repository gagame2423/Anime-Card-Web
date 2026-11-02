/* Kagurabachi's rotation is per attack, never per combo hit or enemy target. */
(function(host){
 'use strict';
 host.createEntenSkills=function(api){
  const ID='kagurabachi',FORMS=Object.freeze(['Nishiki','Kuro','Aka','Sai']);
  const state=u=>api.passiveRuntimeFor(u,ID).enten ||= {next:0,form:0,dodge:false,reflect:false,survived:false};
  function counted(bs,u){if(api.id(u)!==ID)return;const c=state(u);c.form=c.next;c.next=(c.next+1)%4;}
  function attack(bs,u,target,options={}){
   if(api.id(u)!==ID)return null;
   const c=state(u),form=c.form,result={hit:false,damage:0,killed:false,target,attacker:u};
   api.log('[PASSIVE] Enten · '+FORMS[form]+'.','passive');api.runtime(u).lastActionLabel=FORMS[form];
   const hit=(enemy,scale,extra={})=>{
    if(!api.alive(u)||!api.alive(enemy))return null;
    const shot=api.primary(bs,u,enemy,api.atk(u)*scale,{...options,...extra,specialAttack:true});
    result.hit ||= shot.hit;result.damage+=shot.damage||0;result.killed ||= shot.killed;return shot;
   };
   if(form===0){c.dodge=true;for(let i=0;i<3&&api.alive(u);i++){const enemy=api.alive(target)?target:api.enemies(bs,u)[0];if(!enemy)break;hit(enemy,.50);}}
   if(form===1){const targets=[...api.enemies(bs,u)].slice(0,3);targets.forEach((enemy,i)=>hit(enemy,[1.3,.9,.5][i],{enemyDodgeMultiplier:.50}));}
   if(form===2){api.shield(u,u.maxHp*.50,(bs.turnCount||0)+2);c.reflect=true;result.hit=true;}
   if(form===3)for(const enemy of [...api.enemies(bs,u)]){const shot=hit(enemy,.90);if(shot?.hit&&api.alive(enemy)&&api.allowed(enemy,u))api.dot(enemy,'bleed',2,api.atk(u)*.20,u);}
   return result;
  }
  function startTurn(bs,u){const c=api.passiveRuntimeFor(u,ID)?.enten;if(c)c.dodge=false;}
  const dodgeBonus=u=>api.has(u,ID)&&state(u).dodge?.30:0;
  function reflect(bs,u,source,amount,meta={}){
   if(!api.has(u,ID)||!api.alive(source)||source===u||!(amount>0)||meta.dot||meta.entenReflect||meta.grimoireReflection||meta.championRedirect||meta.fateAbsorb)return;
   const c=state(u);if(!c.reflect)return;c.reflect=false;
   api.log('[PASSIVE] Aka · reflects 50% of the incoming attack.','passive');api.reflectHit(bs,u,source,amount*.50);
  }
  function fatal(bs,u){
   if(!api.has(u,ID)||u?.championPermanentDeath)return false;const c=state(u);if(c.survived)return false;
   c.survived=true;c.next=0;u.hp=1;u.defeated=false;api.refresh(u);api.log('[PASSIVE] Enten · fatal hit survived at 1 HP; next form Nishiki.','passive');return true;
  }
  function badges(u){if(!api.has(u,ID))return[];const c=state(u),rows=[{icon:'⚔',label:'ENTEN · NEXT '+FORMS[c.next].toUpperCase(),tone:'passive',category:'passive'}];if(c.dodge)rows.push({icon:'◇',label:'NISHIKI · +30% DODGE',tone:'buff',category:'buff'});if(c.reflect)rows.push({icon:'◇',label:'AKA · REFLECT READY',tone:'buff',category:'buff'});return rows;}
  return {ID,FORMS,state,counted,attack,startTurn,dodgeBonus,reflect,fatal,badges};
 };
})(window);
