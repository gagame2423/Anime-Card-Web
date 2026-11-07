/* Ragna and Woltekamui: battle-local state, no inventory or progression writes. */
(function(host){
 'use strict';
 host.createRagnaSkills=function(api){
  const RAGNA='boss-event-ragna',WOLTE='woltekamui',IDS=Object.freeze([RAGNA,WOLTE]);
  const {has,alive,allies,enemies,team,runtime,atk,random}=api;
  const state=(unit,id)=>api.passiveRuntimeFor(unit,id).ragna ||= {rage:0,nextBleed:false};
  function counted(bs,u,options={}){if(has(u,RAGNA)&&!options.isCounter){const c=state(u,RAGNA);c.rage=Math.min(300,c.rage+1+Math.floor(Math.min(1-Number.EPSILON,random())*5));}}
  function critical(bs,u,target,result){if(has(u,RAGNA)&&result?.critical&&result.hit&&!result.dodged&&!result.reflected&&alive(target)&&api.allowed(target,u))api.status(target,'freezeTurns',2,u);}
  function fatal(bs,u){
   if(!has(u,RAGNA)||api.reviveForbidden(u))return false;
   const c=state(u,RAGNA);if(c.rage<100)return false;
   c.rage-=100;u.hp=Math.max(1,Math.floor(u.maxHp*.50));u.defeated=false;api.addAtk(u,.20);
   const line=team(bs,u),index=line.indexOf(u);if(index>=0)line.splice(index,1);line.unshift(u);bs[line===bs.playerTeam?'playerIndex':'enemyIndex']=0;
   api.indices(bs);api.refresh(u);api.log('[PASSIVE] Dragon Slayer · 100 Rage consumed; frontline revival, +20% ATK.','passive');return true;
  }
  const immune=(u,key)=>key==='freezeTurns'&&has(u,WOLTE);
  const dotFactor=(u,kind)=>kind==='burn'&&has(u,WOLTE)?.50:1;
  const dodgeChance=u=>has(u,WOLTE)?.22:0;
  function dodged(bs,u){if(has(u,WOLTE))state(u,WOLTE).nextBleed=true;}
  function after(bs,u,target,result,options={}){
   if(!has(u,WOLTE)||!alive(u)||result.skipped||result.outOfTurn)return;
   const c=state(u,WOLTE);
   if(c.nextBleed){c.nextBleed=false;if(result.hit&&alive(target)&&api.allowed(target,u))api.dot(target,'bleed',3,atk(u)*.40,u);}
   if(options.isFollowUp||options.isCounter||!api.canFollow(u))return;
   let count=0,chance=.22;
   while(alive(u)&&has(u,WOLTE)&&enemies(bs,u).length&&api.canFollow(u)){
    if(random()>=api.followChance(bs,u,chance,count>0,.72))break;
    const enemy=alive(target)?target:enemies(bs,u)[0];
    const shot=api.attack(bs,u,enemy,{isFollowUp:true,passiveAttack:true,damageMultiplier:.50,wolteChain:true});
    if(shot.skipped||shot.outOfTurn)break;
    count++;chance=Math.min(.72,.22+.05*count);
    if(shot.hit&&!shot.dodged&&!shot.reflected){api.heal(u,u.maxHp*.01,'GODLIKE SPEED',bs,u);if(count>3&&alive(enemy)&&runtime(enemy).bleed?.some(e=>e.turns>0)&&api.allowed(enemy,u))api.status(enemy,'stunTurns',1,u);}
    target=enemy;
   }
  }
  function badges(u){const rows=[];if(has(u,RAGNA))rows.push({icon:'⚔',label:`RAGE ${state(u,RAGNA).rage}/300`,tone:'passive',category:'passive'});if(has(u,WOLTE)&&state(u,WOLTE).nextBleed)rows.push({icon:'🩸',label:'NEXT ATTACK · BLEED',tone:'passive',category:'passive'});return rows;}
  return {IDS,counted,critical,fatal,immune,dotFactor,dodgeChance,dodged,after,badges};
 };
})(window);
