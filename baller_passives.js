/* Football cards: battle-local counters, bounded redirects and additive stat growth. */
(function(host){
 'use strict';
 host.createBallerSkills=function(api){
  const KAISER='michael-kaiser',ISAGI='isagi-yoichi',LORENZO='don-lorenzo',IDS=Object.freeze([KAISER,ISAGI,LORENZO]);
  const {runtime,has,alive,all,allies,enemies,team,atk,random,refresh}=api;
  const state=(u,id)=>api.passiveRuntimeFor(u,id).baller ||= {eye:0,zombie:0,absorbed:0,growth:0,immune:0,reads:new WeakMap(),readActions:new WeakMap(),kills:new WeakSet()};
  const owners=(bs,u)=>allies(bs,u).filter(v=>alive(v)&&has(v,ISAGI));
  const read=(owner,target)=>state(owner,ISAGI).reads.get(target)||0;
  const marked=(bs,u,target)=>owners(bs,u).reduce((n,owner)=>Math.max(n,read(owner,target)),0);
  function mark(bs,owner,target,token){if(!alive(owner)||!alive(target)||team(bs,owner)===team(bs,target))return;const c=state(owner,ISAGI);c.kills.delete(target);if(c.readActions.get(target)===token)return;c.readActions.set(target,token);c.reads.set(target,Math.min(3,read(owner,target)+1));refresh(target);}
  function attacking(bs,u,target,meta={}){
   if(!u||meta.dot||meta.ballerRedirect||meta.ballerSplash||meta.grimoireReflection||meta.entenReflect||meta.fateAbsorb||meta.championRedirect||team(bs,u)===team(bs,target))return;
   const token=api.attackToken(bs,u,meta);for(const owner of owners(bs,u))mark(bs,owner,target,token);
  }
  function prepare(bs,u,target,options={}){
   if(!has(u,KAISER)||api.id(u)!==KAISER||!api.ownTurn(bs,u,options))return null;
   if(!api.once(bs,u,'kaiser-choice',options))return null;
   const c=state(u,KAISER);if(random()<.60){c.eye=Math.min(4,c.eye+1);refresh(u);api.log('[PASSIVE] Predator Instinct · EyE '+c.eye+'/4.','passive');return {hit:false,damage:0,killed:false,skipped:true,charging:true,target,attacker:u};}
   return null;
  }
  function attack(bs,u,target,options={}){
   const id=api.id(u);if(id!==KAISER&&id!==LORENZO)return null;
   const out={hit:false,damage:0,killed:false,target,attacker:u};
   if(!api.ownTurn(bs,u,options))return null;
   const c=state(u,id);
   if(id===KAISER&&c.eye>0){const count=c.eye;c.eye=0;
    if(target.hp<target.maxHp*.10){const before=target.hp;if(api.execute(bs,u,target)!==false)return {...out,hit:true,killed:true,damage:before,executed:true};}
    const shielded=runtime(target).shield>0,scale=[0,1.2,1.5,1.5,1.8][count];
    const shot=api.primary(bs,u,target,atk(u)*scale,{...options,specialAttack:true,ignoreShield:count===3,ignoreReduction:count===4});Object.assign(out,shot,{target,attacker:u});
    if(count===2&&shielded&&alive(u)&&alive(target)){const extra=api.primary(bs,u,target,atk(u)*.30,{...options,specialAttack:true,ignoreShield:true});out.damage+=(extra.damage||0);out.hit ||= extra.hit;out.killed ||= extra.killed;}
    refresh(u);return out;
   }
   if(id===LORENZO&&c.zombie>=10){c.zombie=0;for(const enemy of [...enemies(bs,u)]){if(!alive(u))break;const shot=api.primary(bs,u,enemy,c.absorbed*.50,{...options,specialAttack:true,noCritical:true,ballerRaw:true});out.damage+=shot.damage||0;out.hit ||= shot.hit;out.killed ||= shot.killed;}refresh(u);return out;}
   return null;
  }
  function transform(bs,u,target,amount,meta){
   if(!u||meta.dot||meta.ballerRedirect||meta.ballerRaw||meta.fateAbsorb||meta.championRedirect||meta.grimoireReflection)return amount;
   const stacks=marked(bs,u,target);amount*=1+stacks*.05;
   if(has(u,ISAGI)&&stacks>=3){amount*=1.5;meta.ignoreReductionFraction=Math.max(meta.ignoreReductionFraction||0,.25);meta.specialAttack=true;}
   return amount;
  }
  function reduction(bs,source,target,meta={}){return (has(target,KAISER)&&state(target,KAISER).eye>0?.20:0)+(source&&!meta.ballerRedirect?marked(bs,target,source)*.01:0);}
  function incoming(bs,u,source,meta={}){
   if(has(u,LORENZO)&&!meta.dot){const c=state(u,LORENZO);c.zombie=Math.min(10,c.zombie+1);}
  }
  function redirect(bs,source,target,amount,meta={}){
   if(!(amount>0)||meta.ballerRedirect||meta.fateAbsorb||meta.championRedirect||meta.grimoireReflection)return amount;
   const owner=allies(bs,target,false).find(u=>has(u,LORENZO));if(!owner)return amount;
   const share=amount*.40,c=state(owner,LORENZO);c.absorbed=Math.min(Number.MAX_SAFE_INTEGER,c.absorbed+share);
   api.take(bs,source,owner,share,{...meta,ballerRedirect:true,elementApplied:true,yunoDamageApplied:true,akatsukiRawDamage:true,dodgeChecked:true});refresh(owner);return amount-share;
  }
  function desperation(bs,u){if(!has(u,ISAGI)||u.hp>=u.maxHp*.35)return;const c=state(u,ISAGI);if(!c.desperate){c.desperate=true;c.immune=2;c.immuneApplied=api.ownTurns(bs,u);runtime(u).stunTurns=0;}}
  function damaged(bs,u,source,amount){if(amount>0&&has(u,ISAGI)&&alive(source)&&team(bs,u)!==team(bs,source))mark(bs,u,source,{});desperation(bs,u);}
  function afterDamage(bs,u,target,damage,meta={}){
   if(!u||!(damage>0)||meta.dot||meta.ballerRedirect||meta.ballerSplash||meta.fateAbsorb||meta.championRedirect||meta.grimoireReflection)return;
   if(!owners(bs,u).some(owner=>owner.hp<owner.maxHp*.35&&read(owner,target)>0))return;
   const pool=enemies(bs,u).filter(v=>v!==target),extra=pool[Math.floor(random()*pool.length)];if(extra)api.take(bs,u,extra,damage*.50,{ballerSplash:true,passiveAttack:true,specialAttack:true,elementApplied:true,yunoDamageApplied:true,akatsukiRawDamage:true});
  }
  function killed(bs,killer,victim){
   for(const owner of all(bs))if(alive(owner)&&has(owner,ISAGI)&&team(bs,owner)!==team(bs,victim)){
    const c=state(owner,ISAGI);if(c.kills.has(victim))continue;c.kills.add(victim);
    if(read(owner,victim)>=3){api.heal(owner,victim.maxHp*.15,'Egoist Growth',bs,owner);if(c.growth<5){c.growth++;api.addAtk(owner,.10);}refresh(owner);}c.reads.delete(victim);c.readActions.delete(victim);
   }
  }
  function ownStart(bs,u){if(!api.ownTurn(bs,u))return;desperation(bs,u);if(has(u,LORENZO)){const c=state(u,LORENZO),ally=allies(bs,u).sort((a,b)=>a.hp-b.hp)[0];if(ally&&c.zombie>0)api.heal(ally,u.maxHp*.03*c.zombie,'Zombie Regeneration',bs,u);}}
  function ownEnd(bs,u){if(!u||!api.ownTurn(bs,u))return;const c=api.passiveRuntimeFor(u,ISAGI).baller;if(c?.immune>0&&api.ownTurns(bs,u)>c.immuneApplied)c.immune--;}
  function immune(u,key){return key==='stunTurns'&&has(u,ISAGI)&&state(u,ISAGI).immune>0;}
  function badges(bs,u){const rows=[];if(has(u,KAISER))rows.push({icon:'◉',label:'EyE '+state(u,KAISER).eye+'/4',tone:'passive',category:'passive'});if(has(u,LORENZO))rows.push({icon:'◆',label:'ZOMBIE '+state(u,LORENZO).zombie+'/10',tone:'passive',category:'passive'});if(has(u,ISAGI))rows.push({icon:'◈',label:'EGO '+state(u,ISAGI).growth+'/5',tone:'buff',category:'buff'});if(bs){const enemy=enemies(bs,u)[0],stacks=enemy?marked(bs,enemy,u):0;if(stacks)rows.push({icon:'◉',label:'READ '+stacks+'/3',tone:'debuff',category:'status'});}return rows;}
  return {IDS,state,prepare,attack,attacking,transform,present:bs=>all(bs).some(u=>alive(u)&&IDS.some(id=>has(u,id))),direct:(bs,u,target)=>has(u,ISAGI)&&marked(bs,u,target)>=3,reduction,incoming,redirect,damaged,afterDamage,killed,ownStart,ownEnd,immune,badges};
 };
})(window);
