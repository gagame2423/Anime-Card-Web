/* Four naval AI strategies. World movement is shared with the player; expensive
   combat is reserved for the one visible boarding fight. */
(function(host){
 'use strict';
 const M=host.SailingMap,K=host.SailingCombat,R=host.SailingRules;
 const BOARD_RANGE=105;
 const ready=p=>p.crew.filter(u=>u.hp>0);
 const health=p=>p.crew.length?p.crew.reduce((n,u)=>n+u.hp/K.stats(u).hp,0)/p.crew.length:0;
 const stamina=p=>ready(p).length?ready(p).reduce((n,u)=>n+u.stamina,0)/ready(p).length:0;
 const hostile=(s,p)=>R.survivors(s).filter(v=>v!==p&&!R.isBusy(v));
 const tierStrength=host.AutoChessSystem.pools.map(pool=>pool.reduce((n,c)=>{const b=K.stats({cardId:c.id});return n+Math.sqrt(b.hp*b.atk);},0)/Math.max(1,pool.length));
 function estimatePirates(d){
  const f=K.pirateProfile(d),x=Math.max(0,d-1);
  return (f.count[0]+f.count[1])*.5*f.weights.reduce((n,w,i)=>n+w*tierStrength[i],0)*Math.sqrt((1+.045*x)*(1+.035*x));
 }
 function estimateBeast(d){
  const x=Math.max(0,d-1);return (tierStrength[4]+tierStrength[5])*.5*Math.sqrt((2.8+.21*x)*(1.28+.066*x));
 }
 function nearestZone(s,p,kind){
  return s.zones.filter(z=>z.kind===kind).sort((a,b)=>M.distance(a,p)-M.distance(b,p))[0]||null;
 }
 function pickIsland(s,p,purpose='heal'){
  let best=null,score=Infinity;
  for(const i of s.islands){
   const owner=R.get(s,i.owner),occupants=s.captains.filter(v=>v!==p&&v.hp>0&&v.docked===i.id),enemyHere=occupants.some(v=>v.id!==p.id);
   let n=M.distance(i,p);
   if(i.owner===p.id)n-=purpose==='claim'?0:100;
   else if(i.owner&&purpose==='heal')n+=160;
   if(enemyHere)n+=purpose==='claim'&&p.role==='raider'?60:450;
   if(purpose==='claim'){
    if(i.owner===p.id)n+=720;
    else if(i.owner&&owner?.docked!==i.id)n-=p.role==='raider'?180:55;
    else if(!i.owner)n-=150;
   }
   if(i.id===p.lastIsland&&purpose==='claim')n+=170;
   if(n<score){score=n;best=i;}
  }
  return best;
 }
 const islandGoal=(i,purpose)=>i?{kind:'island',id:i.id,purpose}:null;
 const zoneGoal=z=>z?{kind:'zone',id:z.id}:null;
 const huntGoal=p=>p?{kind:'hunt',id:p.id}:null;
 function weakestNearby(s,p,radius=680){
  const rows=hostile(s,p).filter(v=>M.distance(p,v)<=radius&&s.elapsed>=v.cooldownUntil);
  if(!rows.length)return null;
  const own=K.power(p.crew);
  return rows.map(v=>({v,ratio:own/Math.max(1,K.power(v.crew))})).filter(x=>x.ratio>=1.14).sort((a,b)=>M.distance(a.v,p)-M.distance(b.v,p))[0]?.v||null;
 }
 function plan(s,p){
  if(!R.alive(p)||R.isBusy(p))return;
  p.nextPlan=s.elapsed+M.between(s,3.4,6.3);
  if(R.canUpgrade(p))R.upgrade(s,p);
  const wounded=health(p)<.74||ready(p).length<p.crew.length||stamina(p)<44||p.hp<46&&!R.repairLocked(s);
  if(p.docked){
   const i=M.islandById(s,p.docked);
   if(!i){p.docked=null;return;}
   if(s.elapsed>=p.contestAt&&p.level>=2&&i.owner!==p.id){
    const owner=R.contested(s,p,i);
    if(owner&&!R.isBusy(owner)&&s.elapsed>=p.cooldownUntil&&s.elapsed>=owner.cooldownUntil&&ready(p).length&&K.power(p.crew)>K.power(owner.crew)*.85){
     if(owner.id==='player'){
      if(s.phase==='sailing'){const e=K.captainEncounter(s,p,i.id);e.intent='raid';if(R.beginEncounter(s,e))return;}
     }else if(R.queueBot(s,p,K.captainEncounter(s,owner,i.id)))return;
    }else if(!owner){R.capture(s,p,i);}
    p.contestAt=s.elapsed+M.between(s,16,29);
   }
   if(R.canUpgrade(p))R.upgrade(s,p);
   // Relic crafting spends the same generic Material budget and uses the
   // actual compatibility resolver. Farmers save their level-up threshold.
   const minKeep=p.level===1?(p.role==='farmer'?750:360):p.level===2&&p.beasts>=3?2000:180;
   if(p.material>=minKeep+95&&s.elapsed-p.dockedSince>=12){
    const unit=p.crew.filter(u=>!u.relic).sort((a,b)=>K.tier(b)-K.tier(a))[0];
    if(unit){
     const recipe=K.recipes.filter(r=>r.cost<=p.material-minKeep).map(r=>{
      const t=host.RelicSystem.template(r.kind,'legendary',true),match=host.RelicSystem.compatibility(K.native(unit),t,{preview:true});
      return {r,score:(match.base.active?2:0)+(match.unique?.active?3:0)-r.cost*.004};
     }).sort((a,b)=>b.score-a.score)[0]?.r;
     if(recipe)R.craft(s,p,recipe.kind,unit.uid);
    }
   }
   if(wounded||p.crew.some(u=>u.hp<=0)||s.elapsed<p.stayUntil)return;
   if(p.role==='farmer'&&p.level===1)return;
   if(p.level===2&&p.beasts>=5&&p.material<2000)return;
   p.lastIsland=p.docked;R.undock(s,p,true);p.goal=null;
  }
  if(wounded){p.avoidDanger=true;p.avoidStorm=true;p.goal=islandGoal(pickIsland(s,p,'heal'),'heal');return;}
  const target=R.get(s,s.wantedId),marked=target===p,ownPower=K.power(p.crew);
  const threat=estimatePirates(s.difficulty),dangerReady=ownPower>=threat*(R.repairLocked(s)?.98:.77),stormReady=ownPower>=estimateBeast(s.difficulty)*(R.repairLocked(s)?1.02:.82);
  p.avoidDanger=!dangerReady;p.avoidStorm=!stormReady;
  const safeGoal=()=>islandGoal(pickIsland(s,p,p.level>=2&&R.claimed(s,p).length<4?'claim':'farm'),p.level>=2?'claim':'farm');
  const pirateGoal=()=>dangerReady?zoneGoal(nearestZone(s,p,'danger'))||safeGoal():safeGoal();
  if(p.role==='farmer'){
   if(p.level===1){p.goal=islandGoal(pickIsland(s,p,'farm'),'farm');return;}
   if(p.crew.length>=3&&R.claimed(s,p).length<3&&M.random(s)<.75){p.goal=islandGoal(pickIsland(s,p,'claim'),'claim');return;}
   if(p.level===2&&p.beasts>=5){p.goal=islandGoal(pickIsland(s,p,'farm'),'farm');return;}
   p.goal=pirateGoal();return;
  }
  if(p.role==='bounty'){
   if(R.alive(target)&&!marked){p.goal=ownPower>=K.power(target.crew)*.57?huntGoal(target):pirateGoal();return;}
   // A wanted hunter protects its own bounty but still improves its crew.
   p.goal=marked&&p.crew.length>=3?islandGoal(pickIsland(s,p,'heal'),'farm'):pirateGoal();
   return;
  }
  if(p.role==='beast'){
   if(p.level===2&&p.beasts>=5){p.goal=islandGoal(pickIsland(s,p,'farm'),'farm');return;}
   if(p.level<3&&p.beasts<5&&ready(p).length>=2&&stormReady){p.goal=zoneGoal(nearestZone(s,p,'storm'))||pirateGoal();return;}
   if(p.crew.length>=R.cap(p)&&p.material<(p.level===1?750:400)){p.goal=islandGoal(pickIsland(s,p,'farm'),'farm');return;}
   p.goal=pirateGoal();return;
  }
  // Raiders prefer pirate recruits, then nearby weaker hulls and flag raids.
  const prey=p.crew.length>=2&&p.hp>32?weakestNearby(s,p):null;
  if(prey&&M.random(s)<.72){p.goal=huntGoal(prey);return;}
  if(p.level>=2&&p.crew.length>=3&&M.random(s)<.22){p.goal=islandGoal(pickIsland(s,p,'claim'),'claim');return;}
  if(p.crew.length>=R.cap(p)&&p.level===1&&p.material<750){p.goal=islandGoal(pickIsland(s,p,'farm'),'farm');return;}
  p.goal=pirateGoal();
 }
 function targetOf(s,p){
  const g=p.goal;if(!g)return null;
  if(g.kind==='island')return M.islandById(s,g.id);
  if(g.kind==='zone')return s.zones.find(z=>z.id===g.id)||null;
  if(g.kind==='hunt'){const v=R.get(s,g.id);return R.alive(v)?v:null;}
  return null;
 }
 function dockBot(s,p,i){
  R.dock(s,p,i);p.stayUntil=s.elapsed+(p.goal?.purpose==='heal'?p.crew.some(u=>!u.hp)?47:22:p.goal?.purpose==='claim'?M.between(s,24,44):M.between(s,42,90));
  p.goal=null;p.nextPlan=s.elapsed+3;
 }
 function wantsAttack(s,a,b){
  if(a.role==='player'||R.isBusy(a)||R.isBusy(b)||a.hp<15||!ready(a).length||s.elapsed<a.cooldownUntil||s.elapsed<b.cooldownUntil||a.docked&&b.docked)return false;
  if(a.goal?.kind==='hunt'&&a.goal.id===b.id){
   if(a.role==='bounty')return a.hp>=20&&K.power(a.crew)>=K.power(b.crew)*.57;
   return K.power(a.crew)>=K.power(b.crew)*.90;
  }
  return a.role==='raider'&&!a.docked&&a.hp>38&&ready(a).length>=2&&K.power(a.crew)>K.power(b.crew)*1.28;
 }
 function collision(s){
  const rows=R.survivors(s);
  for(let i=0;i<rows.length;i++){
   if(s.phase==='finished')return;
   for(let j=i+1;j<rows.length;j++){
    const a=rows[i],b=rows[j];if(R.isBusy(a)||R.isBusy(b)||M.distance(a,b)>BOARD_RANGE*.78)continue;
    // A human in a selection dialog is never booked into a second fight.
    if((a.id==='player'||b.id==='player')&&s.phase!=='sailing')continue;
    const attacker=wantsAttack(s,a,b)?a:wantsAttack(s,b,a)?b:null;if(!attacker)continue;
    const defender=attacker===a?b:a;
    if(defender.id==='player'){const e=K.captainEncounter(s,attacker,defender.docked);e.intent='raid';R.beginEncounter(s,e);}
    else if(attacker.id!=='player')R.queueBot(s,attacker,K.captainEncounter(s,defender,defender.docked));
   }
  }
 }
 function step(s,dt){
  R.settleBots(s);if(s.phase==='finished')return;
  for(const p of s.captains.slice(1)){
   if(!R.alive(p)||R.isBusy(p))continue;
   if(s.elapsed>=p.nextPlan||!p.docked&&!targetOf(s,p))plan(s,p);
   if(R.isBusy(p))continue;
   if(p.docked){
    const e=R.ambush(s,p);if(e){
     R.log(s,e.name+' raided '+(M.islandById(s,p.docked)?.name||'an island')+' while '+p.name+' was docked.','battle');
     if(ready(p).length&&K.power(p.crew)>=K.power(e.crew)*.76)R.queueBot(s,p,e);
     else{R.undock(s,p,true);p.goal=islandGoal(pickIsland(s,p,'heal'),'heal');p.cooldownUntil=s.elapsed+18;}
    }
    continue;
   }
   const destination=targetOf(s,p);
   if(!destination){M.move(s,p,null,dt);continue;}
   if(p.goal.kind==='island'&&M.distance(p,destination)<=destination.radius+M.DOCK_RANGE-8){dockBot(s,p,destination);continue;}
   if(p.goal.kind==='hunt'&&M.distance(p,destination)<=BOARD_RANGE*.70){M.move(s,p,null,dt);}
   else{
    const avoid=s.zones.filter(z=>p.goal.kind!=='zone'||p.goal.id!==z.id).filter(z=>z.kind==='danger'?p.avoidDanger:p.avoidStorm);
    const inside=avoid.find(z=>M.distance(z,p)<z.radius+18);
    const route=inside?{x:(p.x-inside.x)/Math.max(1,M.distance(p,inside)),y:(p.y-inside.y)/Math.max(1,M.distance(p,inside))}:M.route(p,destination,[...s.islands,...avoid]);
    M.move(s,p,route,dt);
   }
   if(s.phase==='finished')break;
   const e=R.hazard(s,p);if(e){
    if(ready(p).length&&K.power(p.crew,e.crew)>=K.power(e.crew,p.crew)*(R.repairLocked(s)?.76:.59))R.queueBot(s,p,e);
    else{
     // An actual encounter carries the same retreat cost as a human. Scouting
     // and steering around dangerous zones is preferable to a suicidal fight.
     R.damageShip(s,p,6);if(p.hp<=0){R.checkVictory(s);continue;}
     p.cooldownUntil=s.elapsed+24;p.avoidDanger=true;p.avoidStorm=true;p.goal=islandGoal(pickIsland(s,p,'heal'),'heal');p.nextPlan=s.elapsed+12;
    }
   }
  }
  if(Math.floor((s.elapsed-dt+1e-7)*2)!==Math.floor((s.elapsed+1e-7)*2))collision(s);
 }
 function nearby(s){
  const p=R.player(s);if(s.phase!=='sailing'||!R.alive(p)||R.isBusy(p)||s.elapsed<p.cooldownUntil)return null;
  return hostile(s,p).filter(v=>s.elapsed>=v.cooldownUntil&&M.distance(p,v)<=BOARD_RANGE).sort((a,b)=>M.distance(p,a)-M.distance(p,b))[0]||null;
 }
 host.SailingBots=Object.freeze({BOARD_RANGE,step,plan,nearby,wantsAttack,health,stamina});
})(window);
