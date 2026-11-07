/* Titan skills use the shared combat renderer, damage pipeline and summon caps. */
(function(host){
 'use strict';
 host.createTitanSkills=function(api){
  const IDS=Object.freeze(['dumb-titan','war-hammer-titan','jaw-titan','armored-titan','eren-rumbling','beast-titan']);
  const {runtime,has,alive,all,allies,enemies,team,atk,random,refresh}=api;
  const state=(u,id)=>api.passiveRuntimeFor(u,id).titan ||= {entered:false,attacks:0,rocks:0};
  const crystal=u=>state(u,'war-hammer-titan').crystal;
  const linked=u=>has(u,'war-hammer-titan')&&alive(crystal(u));
  const pick=list=>list.length?list[Math.floor(random()*list.length)]:null;
  function entry(bs,u){
   if(!alive(u))return;
   for(const id of IDS)if(has(u,id)){
    const c=state(u,id);if(c.entered)continue;c.entered=true;
    if(id==='war-hammer-titan'&&!api.generated(u)&&team(bs,u).find(alive)===u){
     const victims=allies(bs,u,false),hp=victims.reduce((sum,v)=>sum+v.maxHp,0);
     if(hp>0&&api.canCrystal(bs,u)){
      for(const victim of victims)api.sacrifice(bs,u,victim);
      c.crystal=api.crystal(bs,u,hp);api.log('[PASSIVE] Crystal Heart · teammates permanently sacrificed.','passive');
     }
    }
    if(id==='armored-titan'){c.restored=new WeakSet();for(const ally of allies(bs,u))api.shield(ally,u.maxHp*.50,null);}
   }
  }
  function counted(bs,u){for(const id of IDS)if(has(u,id))state(u,id).attacks++;}
  function shieldGranted(u,before){const r=runtime(u);r.titanShieldCapacity=before===0?r.shield:Math.max(r.titanShieldCapacity||0,r.shield||0);}
  function shieldBroken(bs,u,source,capacity){
   runtime(u).titanShieldCapacity=0;
   if(!bs||!alive(u)||!(capacity>0))return;
   for(const owner of allies(bs,u))if(alive(owner)&&has(owner,'armored-titan')&&!api.acting(bs,owner)){
    const c=state(owner,'armored-titan');c.restored ||= new WeakSet();if(c.restored.has(u))continue;
    c.restored.add(u);api.shield(u,capacity*.50,null);if(alive(source)&&api.allowed(source,owner))api.status(source,'stunTurns',3,owner);
   }
  }
  function turn(bs,actor){
   for(const u of all(bs))if(alive(u)){
    if(u!==actor&&has(u,'beast-titan')){const c=state(u,'beast-titan');c.rocks=Math.min(Number.MAX_SAFE_INTEGER,c.rocks+1+Math.floor(random()*2));}
    if(linked(u))api.heal(u,u.hp*.01,'Crystal Heart',bs,u);
   }
  }
  function fatal(bs,u){
   if(u.championPermanentDeath||u.isTitanCrystal)return false;
   if(linked(u)){
    const target=crystal(u);target.hp=Math.max(0,target.hp-atk(u)*5);if(target.hp===0){target.defeated=true;target.championPermanentDeath=true;}
    u.hp=1;u.defeated=false;refresh(target);refresh(u);return true;
   }
   if(has(u,'eren-rumbling')){const c=state(u,'eren-rumbling');if(!c.revived){c.revived=true;api.add(u,'hp',2.5);api.add(u,'atk',.35);u.hp=u.maxHp;u.defeated=false;refresh(u);return true;}}
   return false;
  }
  function died(bs,u){
   const target=crystal(u);if(alive(target)){target.hp=0;target.defeated=true;target.championPermanentDeath=true;refresh(target);}
  }
  function killed(bs,u,victim){
   if(!alive(u)||!has(u,'eren-rumbling')||!(victim.card.category||[]).includes('Titan'))return;
   const c=state(u,'eren-rumbling');c.absorbed ||= new WeakSet();if(c.absorbed.has(victim))return;c.absorbed.add(victim);
   api.flat(u,'atk',atk(victim)*.50);for(const id of api.passiveIds(victim,true))api.copy(bs,u,id);
  }
  function attack(bs,u,target,options={}){
   if(u.isTitanCrystal)return {hit:false,damage:0,killed:false,skipped:true};
   const id=api.id(u);if(!IDS.includes(id))return null;
   const c=state(u,id),out={hit:false,damage:0,killed:false,target,attacker:u};
   const hit=(enemy,scale,extra={})=>{
    if(!alive(u)||!alive(enemy))return;
    const shot=api.primary(bs,u,enemy,atk(u)*scale,{...options,...extra});out.hit ||= shot.hit;out.critical ||= shot.critical;out.damage+=shot.damage||0;out.killed ||= shot.killed;
   };
   if(id==='dumb-titan'){
    const wheel=random();if(wheel<.30)return {...out,missed:true};
    hit(target,1,{specialAttack:false});
    if(wheel<.40){if(out.hit&&alive(target)&&api.allowed(target,u))api.status(target,'stunTurns',1,u);}
    else hit(enemies(bs,u).find(v=>v!==target),.50,{specialAttack:true});
   }else if(id==='war-hammer-titan'){
    if(c.mode==='hammer'){const targets=[target,...enemies(bs,u).filter(v=>v!==target)].slice(0,2);for(const enemy of targets)hit(enemy,.60,{specialAttack:true});}
    else hit(target,1,c.mode==='spear'?{specialAttack:true,shieldPierceFraction:.50}:{specialAttack:false});
    if(c.attacks%5===0)c.mode=random()<.50?'hammer':'spear';
   }else if(id==='beast-titan'){
    const rocks=c.rocks;c.rocks=0;
    for(let n=0;n<rocks&&alive(u)&&enemies(bs,u).length;n++)hit(pick(enemies(bs,u)),.50,{specialAttack:true,shatterShield:true});
    if(!rocks)hit(target,1,{specialAttack:false});
   }else{
    hit(target,1,{specialAttack:false});
    if(id==='jaw-titan'&&out.damage>0&&alive(u))api.shield(u,out.damage*.10,(bs.turnCount||0)+2);
   }
   return out;
  }
  function jawTurn(u,stunned){runtime(u).titanStunPenalty=has(u,'jaw-titan')&&stunned?.70:1;}
  const outgoing=u=>u&&has(u,'jaw-titan')&&(runtime(u).stunTurns>0||runtime(u).titanStunPenalty===.70)?.70:1;
  function endTurn(u){if(u)runtime(u).titanStunPenalty=1;}
  function badges(u){const rows=[];if(has(u,'beast-titan'))rows.push({icon:'◆',label:'ROCK '+state(u,'beast-titan').rocks,tone:'passive',category:'passive'});if(linked(u))rows.push({icon:'◆',label:'CRYSTAL · 60% DR',tone:'buff',category:'buff'});return rows;}
  return {IDS,state,entry,counted,turn,fatal,died,killed,attack,shieldGranted,shieldBroken,jawTurn,endTurn,outgoing,badges,hasLife:u=>linked(u)||has(u,'eren-rumbling'),reduction:u=>linked(u)?.60:0};
 };
})(window);
