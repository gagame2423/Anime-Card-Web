/* Sailing Sea's independent run model. No DOM, account inventory, cloud writes
   or wall-clock catch-up. All gameplay randomness belongs to the saved seed. */
(function(host){
 'use strict';
 const M=host.SailingMap,K=host.SailingCombat,C=host.AutoChessSystem;
 const KEY='anime_card_rng_sailing_sea_v1',VERSION=1,DAY_SECONDS=360,DAY_LIMIT=15,STEP=.1;
 const CAP=Object.freeze([0,5,7,10]),UPGRADES=Object.freeze({1:{material:750,beasts:0},2:{material:2000,beasts:5}});
 const ROLE_NAMES=Object.freeze({farmer:'Island Farmer',raider:'Danger Raider',beast:'Storm Hunter',bounty:'Bounty Hunter',player:'Captain'});
 const BOT_NAMES=['Aster Tide','Black Marlin','Coral Jack','Dread Voss','Ebon Sail','Flint Harper','Gale Corsair','Hollow Finn','Iron Sable','Jade Rook','Kestrel','Luna Keel','Mako Reed','Noctis','Orion Wake','Pearl Ash','Raven Salt','Silver Gale','Vega Storm'];
 const PHASES=['draft','sailing','ambush','encounter','combat','report','recruit','finished'];
 const finite=(n,a=0,b=Number.MAX_SAFE_INTEGER)=>typeof n==='number'&&Number.isFinite(n)&&n>=a&&n<=b;
 const integer=(n,a,b)=>Number.isSafeInteger(n)&&n>=a&&n<=b;
 const enough=(n,cost)=>n+1e-7>=cost;
 const alive=p=>p&&p.hp>0;
 const player=s=>s.captains[0],get=(s,id)=>s.captains.find(p=>p.id===id)||null;
 const survivors=s=>s.captains.filter(alive);
 const cap=p=>CAP[p.level],room=p=>Math.max(0,cap(p)-p.crew.length);
 const claimed=(s,p)=>s.islands.filter(i=>i.owner===p.id);
 const isBusy=p=>!!p.busy;
 const ranking=s=>survivors(s).slice().sort((a,b)=>b.bounty-a.bounty||b.hp-a.hp||b.sinks-a.sinks||a.id.localeCompare(b.id));
 const repairLocked=s=>s.repairLocked||s.difficulty>=10;
 const crewReady=p=>K.living(p.crew).length;
 function log(s,message,tone='info'){
  s.logs.push({id:++s.logSerial,time:s.elapsed,day:s.day,tone,message:String(message).slice(0,260)});
  if(s.logs.length>160)s.logs.splice(0,s.logs.length-160);
  return s.logs[s.logs.length-1];
 }
 function captain(id,name,role,at,heading=0){
  return {id,name:String(name||'Captain').slice(0,32),role,level:1,hp:100,material:0,bounty:0,beasts:0,pirates:0,sinks:0,
   x:at.x,y:at.y,heading,speed:0,docked:null,dockedSince:0,gatherClock:0,raidAt:0,lastHaul:null,
   crew:[],locker:[],busy:null,goal:null,nextPlan:0,stayUntil:0,contestAt:0,zoneId:null,hazardAt:null,cooldownUntil:0,totalGathered:0,placement:null};
 }
 function create(seed,name='You'){
  seed=seed>>>0||1;
  const islands=M.generate(seed),home=islands[0],rng={rng:M.seedOf(seed,'run')};
  const s={version:VERSION,id:'sea_'+seed.toString(36)+'_'+Date.now().toString(36),seed,rng:rng.rng,serial:0,logSerial:0,
   day:1,elapsed:0,difficulty:1,repairLocked:false,phase:'draft',captains:[captain('player',name,'player',{x:home.x+home.radius+26,y:home.y},Math.PI)],
   islands,zones:M.zones(seed,1,islands),wantedId:null,draft:[],deployIds:[],waypoint:null,encounter:null,combat:null,recruit:null,report:null,jobs:[],logs:[],result:null};
  s.draft=K.draft(s);
  const roleQueue=['farmer','raider','beast','bounty','raider','farmer','beast','bounty','raider','farmer','beast','bounty','raider','farmer','beast','bounty','raider','farmer','beast'];
  // Draw from distinct islands, so opening positions are not forced collisions.
  const locations=islands.slice(1);
  for(let n=0;n<19;n++){
   const at=locations.splice(M.int(s,0,locations.length-1),1)[0]||home,angle=M.between(s,0,Math.PI*2),r=at.radius+M.between(s,34,68);
   const p=captain('bot'+(n+1),BOT_NAMES[n],roleQueue[n],{x:M.clamp(at.x+Math.cos(angle)*r,18,M.SIZE-18),y:M.clamp(at.y+Math.sin(angle)*r,18,M.SIZE-18)},angle);
   const picks=K.draft(s),choose=picks.map(cardId=>({cardId,...K.stats({cardId})})).sort((a,b)=>b.hp*b.atk-a.hp*a.atk)[0].cardId;
   p.crew.push(K.member(s,choose));p.nextPlan=M.between(s,1,6);s.captains.push(p);
  }
  return s;
 }
 function wanted(s){
  const list=survivors(s);s.wantedId=list.length?list[M.int(s,0,list.length-1)].id:null;
  if(s.wantedId)log(s,'Golden Bounty: '+get(s,s.wantedId).name+' is wanted until dawn.','gold');
 }
 function chooseCaptain(s,id){
  if(s.phase!=='draft'||!s.draft.includes(id))throw Error('Choose one of your three Secret captains.');
  const p=player(s),u=K.member(s,id);p.crew=[u];s.deployIds=[u.uid];s.draft=[];s.phase='sailing';
  log(s,'Day 1 — '+K.native(id).name+' joins your voyage. Dock at Windward Cay to gather Material.','success');wanted(s);return u;
 }
 function updateLock(s){
  if(!s.repairLocked&&s.difficulty>=10){s.repairLocked=true;log(s,'Difficulty 10 reached. Ship repairs are permanently locked for every captain.','danger');}
 }
 function increaseDifficulty(s,kind){
  const bonus=kind==='beast'?M.between(s,.01,.10):M.between(s,.005,.03);s.difficulty*=1+bonus;updateLock(s);return bonus;
 }
 function closeDay(s){
  const target=get(s,s.wantedId);
  if(alive(target)){const gain=target.bounty;target.bounty*=2;log(s,target.name+' survived the Golden Bounty. Bounty doubled (+'+Math.floor(gain)+').','gold');}
  if(s.day>=DAY_LIMIT){finish(s,'time-limit');return;}
  s.day++;s.difficulty+=1;updateLock(s);
  s.zones=M.zones(s.seed,s.day,s.islands);
  for(const p of s.captains){p.zoneId=null;p.hazardAt=null;if(p.goal?.kind==='zone')p.goal=null;p.nextPlan=Math.min(p.nextPlan,s.elapsed+1);}
  log(s,'Day '+s.day+' begins. Difficulty '+s.difficulty.toFixed(2)+' · new Danger and Storm Zones.','day');wanted(s);
 }
 function advanceClock(s,dt){
  if(s.phase==='draft'||s.phase==='finished')return;
  s.elapsed=Math.min(DAY_SECONDS*DAY_LIMIT,Math.round((s.elapsed+dt)*1000)/1000);
  while(s.phase!=='finished'&&s.elapsed+1e-7>=s.day*DAY_SECONDS)closeDay(s);
 }
 function dock(s,p,i){
  if(!alive(p)||isBusy(p)||!i||p.docked||M.distance(p,i)>i.radius+M.DOCK_RANGE+1e-7)throw Error('Sail closer to an island to dock.');
  M.dockPosition(p,i);p.docked=i.id;p.dockedSince=s.elapsed;p.gatherClock=0;p.raidAt=s.elapsed+M.between(s,38,68);p.contestAt=s.elapsed+M.between(s,12,22);p.zoneId=null;p.hazardAt=null;
  if(p.id==='player'){s.waypoint=null;log(s,'Docked at '+i.name+'. Gathering and crew recovery started.','success');}
 }
 function undock(s,p,quiet=false){
  if(!p.docked)return;
  const i=M.islandById(s,p.docked);
  p.docked=null;p.gatherClock=0;p.raidAt=0;p.contestAt=0;p.speed=0;p.cooldownUntil=Math.max(p.cooldownUntil,s.elapsed+3);
  for(const u of p.crew)if(u.hp<=0)u.reviveDock=0;
  if(p.id==='player'&&!quiet)log(s,'Departed '+(i?.name||'the island')+'.','info');
 }
 function contested(s,p,i){const owner=get(s,i?.owner);return owner&&owner!==p&&alive(owner)&&owner.docked===i.id?owner:null;}
 function capture(s,p,i,won=false){
  if(p.level<2||!alive(p)||!i||p.docked!==i.id||isBusy(p)&&!won)throw Error('Ship Lv. 2 and docking are required to plant a flag.');
  if(i.owner===p.id)return false;
  if(!won&&contested(s,p,i))throw Error('The island is occupied. Defeat its captain to capture it.');
  const previous=get(s,i.owner);i.owner=p.id;
  log(s,p.name+' '+(previous?'captured '+i.name+' from '+previous.name:'claimed '+i.name)+' · +0.5 Material/s while at sea.','flag');return true;
 }
 function canUpgrade(p){const u=UPGRADES[p.level];return !!u&&enough(p.material,u.material)&&p.beasts>=u.beasts;}
 function upgrade(s,p){
  if(!alive(p)||isBusy(p)||!canUpgrade(p))throw Error('Upgrade requirements are not met.');
  const requirement=UPGRADES[p.level];p.material=Math.max(0,p.material-requirement.material);p.level++;
  log(s,p.name+' upgraded to Ship Lv. '+p.level+' · '+cap(p)+' crew slots.','success');return p.level;
 }
 function craft(s,p,kind,uid=null){
  const recipe=K.recipe(kind);
  if(!alive(p)||!p.docked||isBusy(p)||!recipe)throw Error('Dock at a safe island to craft Relics.');
  if(!enough(p.material,recipe.cost))throw Error('Not enough Material.');
  const target=uid&&p.crew.find(u=>u.uid===uid);if(uid&&!target)throw Error('Crew member unavailable.');
  const item=K.rollRelic(s,kind);p.material=Math.max(0,p.material-recipe.cost);
  if(target){if(target.relic)p.locker.push(target.relic);K.equip(target,item);}else p.locker.push(item);
  if(p.id==='player')log(s,'Forged Legendary Unique '+recipe.name+(target?' for '+K.native(target).name:' in your Relic locker')+'.','gold');
  return item;
 }
 function equip(s,p,uid,relicId){
  if(!alive(p)||isBusy(p))throw Error('Finish the encounter before changing Relics.');
  const u=p.crew.find(v=>v.uid===uid);if(!u)throw Error('Crew member unavailable.');
  if(relicId===null){if(u.relic)p.locker.push(u.relic);K.equip(u,null);return;}
  const at=p.locker.findIndex(r=>r.id===relicId);if(at<0)throw Error('Relic is not in the locker.');
  const item=p.locker.splice(at,1)[0];if(u.relic)p.locker.push(u.relic);K.equip(u,item);
 }
 const materialItems=()=>host.MaterialSystem.ITEMS;
 function recovery(s,p,dt,engaged=false,activeIds=null,underAttack=false){
  if(!alive(p))return;
  const own=claimed(s,p).length;if(own){p.bounty+=own*.5*dt;if(!p.docked)p.material+=own*.5*dt;}
  if(engaged){
   if(activeIds&&!p.docked)for(const u of p.crew)if(!activeIds.includes(u.uid))u.stamina=Math.min(100,u.stamina+1.5*dt);
   return;
  }
  const atIsland=!!p.docked&&!underAttack;
  for(const u of p.crew){
   if(atIsland){
    u.stamina=Math.min(100,u.stamina+6*dt);
    const max=K.stats(u).hp;
    if(u.hp>0){u.hp=Math.min(max,u.hp+max*.05*dt);u.reviveDock=0;}
    else{
     u.reviveDock=Math.min(45,(u.reviveDock||0)+dt);
     if(u.reviveDock+1e-7>=45){u.hp=max;u.reviveDock=0;if(p.id==='player')log(s,K.native(u).name+' revived at the island.','success');}
    }
   }else if(!p.docked)u.stamina=Math.min(100,u.stamina+1.5*dt);
  }
  if(!atIsland)return;
  if(!repairLocked(s))p.hp=Math.min(100,p.hp+2*dt);
  p.gatherClock+=dt;
  while(p.gatherClock+1e-7>=1){
   p.gatherClock=Math.max(0,p.gatherClock-1);const gain=M.int(s,1,3);p.material+=gain;p.totalGathered+=gain;
   if(p.id==='player'){const list=materialItems(),item=list[M.int(s,0,list.length-1)];p.lastHaul={id:item.id,gain,time:s.elapsed};}
  }
 }
 function hazard(s,p){
  if(!alive(p)||p.docked||isBusy(p)||s.elapsed<p.cooldownUntil)return null;
  const z=M.atZone(s,p);
  if(!z){p.zoneId=null;p.hazardAt=null;return null;}
  if(p.zoneId!==z.id||!finite(p.hazardAt)){p.zoneId=z.id;p.hazardAt=s.elapsed+M.between(s,z.kind==='danger'?3:5,z.kind==='danger'?8:11);}
  if(s.elapsed+1e-7<p.hazardAt)return null;
  p.hazardAt=null;return K.encounter(s,z.kind==='storm'?'beast':'pirate',{zoneId:z.id});
 }
 function ambush(s,p){
  if(!alive(p)||!p.docked||isBusy(p)||s.elapsed<p.raidAt||s.elapsed<p.cooldownUntil)return null;
  p.raidAt=s.elapsed+M.between(s,36,65);
  return M.random(s)<.16?K.encounter(s,'pirate',{islandId:p.docked}):null;
 }
 function beginEncounter(s,e){
  const p=player(s);
  if(s.phase!=='sailing'||!alive(p)||!e)return false;
  const opponent=get(s,e.opponentId);
  if(opponent&&(!alive(opponent)||isBusy(opponent)))return false;
  s.encounter=e;s.phase=e.islandId&&p.docked===e.islandId?'ambush':'encounter';p.busy='player:'+e.id;p.speed=0;s.waypoint=null;
  if(opponent){opponent.busy=p.busy;opponent.speed=0;}
  const available=new Set(K.living(p.crew).map(u=>u.uid));
  s.deployIds=s.deployIds.filter(id=>available.has(id));
  if(!s.deployIds.length)s.deployIds=[...available];
  log(s,e.islandId?'Raid warning at '+(M.islandById(s,e.islandId)?.name||'your island')+': '+e.name+'!':(e.kind==='beast'?'Sea Beast sighted: ':e.kind==='captain'?'Hostile captain: ':'Pirate sails: ')+e.name+'.','danger');
  return true;
 }
 function deploy(s,ids){
  if(!['sailing','encounter','ambush'].includes(s.phase)||!Array.isArray(ids))throw Error('Deployment is locked during the battle.');
  const valid=new Set(K.living(player(s).crew).map(u=>u.uid));s.deployIds=[...new Set(ids)].filter(id=>valid.has(id));return s.deployIds;
 }
 function startFight(s){
  if(!['encounter','ambush'].includes(s.phase)||!s.encounter)throw Error('No encounter is ready.');
  const p=player(s),crew=p.crew.filter(u=>s.deployIds.includes(u.uid)&&u.hp>0);
  if(!crew.length)throw Error('Deploy at least one living crew member.');
  const e=s.encounter;s.combat={id:e.id,encounter:C.clone(e),seed:e.seed,playerCrew:C.clone(crew),enemyCrew:C.clone(e.crew),fightTime:0};
  s.encounter=null;s.phase='combat';return s.combat;
 }
 function release(s,p,e){
  p.busy=null;p.hazardAt=null;p.zoneId=null;
  p.cooldownUntil=Math.max(p.cooldownUntil,s.elapsed+M.between(s,16,26));p.nextPlan=s.elapsed+1;
  const other=get(s,e.opponentId);if(other){other.busy=null;other.zoneId=null;other.hazardAt=null;other.cooldownUntil=Math.max(other.cooldownUntil,s.elapsed+M.between(s,18,29));other.nextPlan=s.elapsed+2;}
 }
 function sink(s,victim,killer=null){
  if(victim.placement!==null)return;
  victim.hp=0;victim.speed=0;victim.docked=null;victim.busy=null;victim.goal=null;victim.placement=survivors(s).length+1;
  for(const i of claimed(s,victim))i.owner=null;
  const marked=s.wantedId===victim.id;
  if(alive(killer)&&killer!==victim){
   const loot=marked?victim.bounty:Math.floor(victim.bounty*.35);killer.bounty+=120+loot;killer.sinks++;victim.bounty=Math.max(0,victim.bounty-loot);
   log(s,killer.name+' sank '+victim.name+' · +'+Math.floor(120+loot)+' Bounty'+(marked?' (100% Wanted Bounty captured)':'')+'.','sink');
  }else log(s,victim.name+' sank at sea'+(marked?' · the Golden Bounty is gone':'')+'.','sink');
  if(marked)log(s,'Golden Bounty ended for today. A new captain will be marked at dawn.','gold');
 }
 function damageShip(s,p,n,killer=null){
  if(!alive(p)||!finite(n)||n<=0)return 0;
  const old=p.hp;p.hp=Math.max(0,p.hp-n);
  if(p.hp<=0)sink(s,p,killer);return old-p.hp;
 }
 const lossDamage=(s,encounter,draw=false)=>Math.round(M.clamp(12+encounter.difficulty*.75,13,34)*(draw?.55:1));
 function loseIsland(s,loser,winner,e){
  if(!e.islandId)return;
  const i=M.islandById(s,e.islandId);
  if(loser.docked===i?.id)undock(s,loser,true);
  if(i&&i.owner===loser.id){
   if(alive(winner)&&winner.level>=2&&winner.docked===i.id)capture(s,winner,i,true);
   else if(alive(winner)&&winner.level>=2&&M.distance(winner,i)<=i.radius+M.DOCK_RANGE){if(!winner.docked){const busy=winner.busy;winner.busy=null;dock(s,winner,i);winner.busy=busy;}if(winner.docked===i.id)capture(s,winner,i,true);}
   else{i.owner=null;log(s,loser.name+' lost the flag at '+i.name+'.','flag');}
  }
 }
 function addRecruit(s,p,id,replaceUid=null){
  const newUnit=K.member(s,id);
  if(room(p)>0){p.crew.push(newUnit);}
  else{
   const at=p.crew.findIndex(u=>u.uid===replaceUid);if(at<0)throw Error('Choose a crew member to replace.');
   const old=p.crew[at];if(old.relic)p.locker.push(old.relic);p.crew.splice(at,1,newUnit);
   if(p.id==='player')s.deployIds=s.deployIds.filter(uid=>uid!==old.uid);
  }
  if(p.id==='player'){s.deployIds.push(newUnit.uid);log(s,K.native(id).name+' recruited to your crew.','success');}
  return newUnit;
 }
 function botRecruit(s,p,e){
  const draft=K.recruitDraft(s,e.crew,p.level),candidate=draft.offers.slice().sort((a,b)=>{
   const score=o=>K.tier(o)*85*o.rate+K.stats(o).atk*o.rate+(1+K.tier(o))*12;
   return score(b)-score(a);
  })[0];if(!candidate?.success)return;
  if(room(p)>0)addRecruit(s,p,candidate.cardId);
  else{
   const weak=p.crew.slice().sort((a,b)=>K.tier(a)-K.tier(b)||a.hp/K.stats(a).hp-b.hp/K.stats(b).hp)[0];
   if(K.tier(candidate)>K.tier(weak))addRecruit(s,p,candidate.cardId,weak.uid);else p.material+=K.salvageValue(candidate.cardId);
  }
 }
 function pveVictory(s,p,e){
  if(e.kind==='pirate'){
   const loot=M.int(s,20,45);p.material+=loot;p.pirates++;p.bounty+=90;
   const pct=increaseDifficulty(s,'pirate');log(s,p.name+' defeated '+e.name+' · +'+loot+' Material · +90 Bounty · Difficulty +'+(pct*100).toFixed(2)+'%.',p.id==='player'?'success':'battle');
   if(p.id==='player')s.recruit=K.recruitDraft(s,e.crew,p.level);else botRecruit(s,p,e);
  }else{
   p.beasts++;p.bounty+=320;const pct=increaseDifficulty(s,'beast');
   log(s,p.name+' defeated '+e.name+' · Sea Beast '+p.beasts+' · +320 Bounty · Difficulty +'+(pct*100).toFixed(2)+'%.','beast');
  }
 }
 function settle(s,p,e,result,{human=false}={}){
  if(s.phase==='finished'||!alive(p)||!e||!['player','enemy','draw'].includes(result?.winner))return false;
  const other=get(s,e.opponentId),before={hp:p.hp,material:p.material,bounty:p.bounty};
  K.applyCrew(p.crew,result.sailingCrew?.player);if(other)K.applyCrew(other.crew,result.sailingCrew?.enemy);
  release(s,p,e);
  if(result.winner==='player'){
   if(other){damageShip(s,other,lossDamage(s,e),p);loseIsland(s,other,p,e);}
   else pveVictory(s,p,e);
  }else if(result.winner==='enemy'){
   damageShip(s,p,lossDamage(s,e),other);loseIsland(s,p,other,e);
   if(!other&&p.id==='player'&&p.hp>0)log(s,'Your ship lost '+Math.ceil(before.hp-p.hp)+' HP to '+e.name+'.','danger');
  }else{
   damageShip(s,p,lossDamage(s,e,true),other);
   if(other)damageShip(s,other,lossDamage(s,e,true),p);
   log(s,p.name+' and '+e.name+' fought to a draw. Hulls damaged.','battle');
  }
  if(other&&alive(p)&&alive(other))log(s,(result.winner==='player'?p.name:result.winner==='enemy'?other.name:p.name)+' clashed with '+(result.winner==='enemy'?p.name:other.name)+' · '+(result.winner==='draw'?'Draw':'boarding battle resolved')+'.','battle');
  if(human){
   s.combat=null;s.encounter=null;s.report={name:e.name,kind:e.kind,winner:result.winner,hpBefore:before.hp,hpAfter:p.hp,material:p.material-before.material,bounty:p.bounty-before.bounty,beasts:p.beasts};
   s.phase='report';
   const valid=new Set(K.living(p.crew).map(u=>u.uid));s.deployIds=s.deployIds.filter(uid=>valid.has(uid));
  }
  checkVictory(s);return true;
 }
 function settlePlayer(s,result){
  if(s.phase!=='combat'||!s.combat)return false;
  return settle(s,player(s),s.combat.encounter,result,{human:true});
 }
 function flee(s){
  if(!['encounter','ambush'].includes(s.phase)||!s.encounter)throw Error('There is no encounter to flee.');
  const p=player(s),e=s.encounter,other=get(s,e.opponentId),ambushed=s.phase==='ambush';
  release(s,p,e);s.phase='sailing';s.encounter=null;s.waypoint=null;
  if(ambushed){
   const i=M.islandById(s,p.docked);undock(s,p,true);
   if(other?.level>=2&&i?.owner===p.id){if(!other.docked&&M.distance(other,i)<=i.radius+M.DOCK_RANGE)dock(s,other,i);if(other.docked===i.id)capture(s,other,i,true);}
   log(s,'Fled '+(i?.name||'the island')+' to sea.','danger');
  }else{
   damageShip(s,p,e.kind==='captain'?8:6,other);log(s,'Evaded '+e.name+' · '+(e.kind==='captain'?8:6)+' Ship HP lost.','danger');
  }
  checkVictory(s);
 }
 function continueReport(s){if(s.phase!=='report')return false;s.phase=s.recruit?'recruit':'sailing';s.report=null;return true;}
 function pickRecruit(s,index){
  if(s.phase!=='recruit'||!s.recruit||s.recruit.accepted||!integer(index,0,s.recruit.offers.length-1))throw Error('Choose one recruit offer.');
  const p=player(s),offer=s.recruit.offers[index];
  if(!offer.success){log(s,K.native(offer.cardId).name+' escaped capture ('+Math.round(offer.rate*100)+'% chance).','danger');s.phase='sailing';s.recruit=null;return {success:false};}
  s.recruit.accepted=offer.cardId;
  if(room(p)>0){addRecruit(s,p,offer.cardId);s.phase='sailing';s.recruit=null;return {success:true};}
  return {success:true,full:true};
 }
 function resolveRecruit(s,action){
  if(s.phase!=='recruit'||!s.recruit?.accepted)throw Error('Choose a successful recruit first.');
  const id=s.recruit.accepted,p=player(s);
  if(action==='salvage'){const n=K.salvageValue(id);p.material+=n;log(s,'Salvaged '+K.native(id).name+' for '+n+' bonus Material.','success');}
  else addRecruit(s,p,id,action);
  s.recruit=null;s.phase='sailing';
 }
 function finish(s,reason){
  if(s.phase==='finished')return;
  const live=ranking(s),p=player(s),winner=live[0]||null;
  const won=alive(p)&&(reason==='last-ship'||reason==='time-limit'&&winner?.id===p.id);
  s.phase='finished';s.result={won,reason,winnerId:won?p.id:reason==='sunk'&&live.length>1?null:winner?.id||null,winnerName:reason==='sunk'&&live.length>1?null:(won?p:winner)?.name||'No surviving captain',rank:alive(p)?live.findIndex(a=>a===p)+1:p.placement||20,day:s.day,time:s.elapsed,bounty:p.bounty};
  s.waypoint=null;s.encounter=null;s.combat=null;s.recruit=null;s.report=null;s.jobs=[];for(const ship of s.captains){ship.busy=null;ship.speed=0;}
  log(s,won?'Victory — you rule the Sailing Sea.':reason==='sunk'?'Your ship sank. Voyage ended.':'Day 15 ended. '+s.result.winnerName+' wins by Bounty.',won?'gold':'danger');
 }
 function checkVictory(s){
  if(s.phase==='finished'||s.phase==='draft')return s.phase==='finished';
  if(!alive(player(s)))finish(s,'sunk');
  else if(survivors(s).length===1)finish(s,'last-ship');
  return s.phase==='finished';
 }
 function queueBot(s,p,e){
  if(!alive(p)||isBusy(p)||!crewReady(p))return false;
  const other=get(s,e.opponentId);if(other&&(!alive(other)||isBusy(other)))return false;
  const id='job'+(++s.serial);p.busy=id;p.speed=0;
  if(other){other.busy=id;other.speed=0;}
  s.jobs.push({id,aId:p.id,encounter:C.clone(e),finishAt:s.elapsed+M.between(s,23,43)});return true;
 }
 function settleBots(s){
  for(const job of s.jobs.slice()){
   if(s.phase==='finished')break;if(job.finishAt>s.elapsed)continue;
   const index=s.jobs.indexOf(job);if(index>=0)s.jobs.splice(index,1);
   const a=get(s,job.aId),b=get(s,job.encounter.opponentId);
   if(!alive(a)||b&&!alive(b)){if(a?.busy===job.id)a.busy=null;if(b?.busy===job.id)b.busy=null;continue;}
   const out=K.approximate(a.crew,b?b.crew:job.encounter.crew,job.encounter.seed);
   settle(s,a,job.encounter,out);
  }
 }
 // A fixed world step owns the six-minute clock. Required decisions pause the
 // entire voyage (not just the human), so lingering in a dialog cannot farm,
 // survive a bounty day, or leave the bots fighting while the player is immune.
 function stepWorld(s,dt=STEP,navigation={}){
  if(!['sailing','combat'].includes(s.phase)||!(dt>0))return;
  const p=player(s),fighting=s.phase==='combat',deployed=fighting?s.combat.playerCrew.map(u=>u.uid):null;
  for(const ship of survivors(s))recovery(s,ship,dt,ship.id==='player'?fighting:isBusy(ship),ship.id==='player'?deployed:null);
  advanceClock(s,dt);if(s.phase==='finished')return;
  if(s.phase==='sailing'){
   let vector=navigation.vector||null;
   if(navigation.autopilot&&s.waypoint&&!p.docked){
    const i=s.islands.find(x=>M.distance(x,s.waypoint)<=x.radius+8);
    if(M.distance(p,s.waypoint)<10||i&&M.distance(p,i)<=i.radius+22)s.waypoint=null;
    else vector=M.route(p,s.waypoint,s.islands);
   }
   M.move(s,p,vector,dt);
   const e=p.docked?ambush(s,p):hazard(s,p);if(e)beginEncounter(s,e);
  }
  if(['sailing','combat'].includes(s.phase))host.SailingBots.step(s,dt);
  checkVictory(s);
 }
 function clock(s){
  const seconds=s.phase==='finished'&&s.elapsed>=5400?360:s.elapsed%360,mins=Math.min(1440,Math.floor(seconds*4+1e-7));
  return String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0');
 }
 function validRelic(item){return item&&typeof item.id==='string'&&/^relic\d+$/.test(item.id)&&host.RelicSystem.validRoll(item.roll)&&item.roll.unique===true&&item.roll.rarity==='legendary';}
 function validMember(u,scaled=false){
  if(!u||!/^crew\d+$/.test(u.uid)||!K.native(u.cardId)||!finite(u.hp)||!finite(u.stamina,0,100)||!finite(u.reviveDock||0,0,45)||u.relic&&!validRelic(u.relic))return false;
  if(u.hpScale!==undefined&&(!scaled||!finite(u.hpScale,1,1e9))||u.atkScale!==undefined&&(!scaled||!finite(u.atkScale,1,1e9)))return false;
  return u.hp<=K.stats(u).hp+1e-6;
 }
 function validEncounter(e,s){
  return e&&/^enc\d+$/.test(e.id)&&['pirate','beast','captain'].includes(e.kind)&&typeof e.name==='string'&&finite(e.difficulty,1)&&integer(e.seed,1,0xffffffff)&&Array.isArray(e.crew)&&e.crew.length<=10&&e.crew.length>=1&&e.crew.every(u=>validMember(u,true))&&
   (e.kind!=='captain'||get(s,e.opponentId))&&(!e.islandId||M.islandById(s,e.islandId));
 }
 function validate(s){
  try{
   if(!s||s.version!==VERSION||!integer(s.seed,1,0xffffffff)||!integer(s.rng,1,0xffffffff)||!integer(s.serial,0,Number.MAX_SAFE_INTEGER)||!integer(s.logSerial,0,Number.MAX_SAFE_INTEGER)||
    !PHASES.includes(s.phase)||!integer(s.day,1,15)||!finite(s.elapsed,0,5400)||!finite(s.difficulty,1)||typeof s.repairLocked!=='boolean'||s.difficulty>=10&&!s.repairLocked||!Array.isArray(s.captains)||s.captains.length!==20||
    !Array.isArray(s.islands)||!s.islands.length||!Array.isArray(s.zones)||!Array.isArray(s.logs)||s.logs.length>160||!Array.isArray(s.jobs)||s.jobs.length>19||!Array.isArray(s.deployIds))return false;
   if(s.day!==Math.min(15,1+Math.floor(s.elapsed/360)))return false;
   const ids=new Set(),relics=new Set(),crewIds=new Set();
   for(let n=0;n<20;n++){
    const p=s.captains[n];if(p.id!==(n===0?'player':'bot'+n)||typeof p.name!=='string'||!Object.hasOwn(ROLE_NAMES,p.role)||!integer(p.level,1,3)||!finite(p.hp,0,100)||!finite(p.material)||!finite(p.bounty)||!integer(p.beasts,0,Number.MAX_SAFE_INTEGER)||!integer(p.pirates,0,Number.MAX_SAFE_INTEGER)||!integer(p.sinks,0,19)||!finite(p.x,0,M.SIZE)||!finite(p.y,0,M.SIZE)||!Number.isFinite(p.heading)||!finite(p.speed,0,M.SPEED+1)||!Array.isArray(p.crew)||!Array.isArray(p.locker)||p.crew.length>cap(p)||!finite(p.gatherClock,0,1.001))return false;
    if(p.docked&&!M.islandById(s,p.docked)||p.hp<=0&&!integer(p.placement,1,20)||p.hp>0&&p.placement!==null||p.id!=='player'&&!p.crew.length)return false;
    for(const r of [...p.locker,...p.crew.map(u=>u.relic).filter(Boolean)]){if(!validRelic(r)||relics.has(r.id))return false;relics.add(r.id);}
    for(const u of p.crew){if(!validMember(u)||crewIds.has(u.uid))return false;crewIds.add(u.uid);}
    ids.add(p.id);
   }
   const map=M.generate(s.seed);if(s.islands.length!==map.length)return false;
   for(let n=0;n<map.length;n++){const a=s.islands[n],b=map[n];if(!a||a.id!==b.id||a.seed!==b.seed||a.x!==b.x||a.y!==b.y||a.radius!==b.radius||a.owner!==null&&!ids.has(a.owner))return false;}
   const rows=M.zones(s.seed,s.day,s.islands);if(rows.length!==s.zones.length||rows.some((z,n)=>Object.keys(z).some(k=>z[k]!==s.zones[n]?.[k])))return false;
   if(s.wantedId!==null&&!ids.has(s.wantedId))return false;
   if(s.phase==='draft'&&(!Array.isArray(s.draft)||s.draft.length!==3||new Set(s.draft).size!==3||s.draft.some(id=>K.native(id)?.rarity!=='Secret')||player(s).crew.length))return false;
   if(['ambush','encounter'].includes(s.phase)&&!validEncounter(s.encounter,s))return false;
   if(s.phase==='combat'&&(!s.combat||!validEncounter(s.combat.encounter,s)||!Array.isArray(s.combat.playerCrew)||!s.combat.playerCrew.length||s.combat.playerCrew.length>10||!s.combat.playerCrew.every(u=>validMember(u))||!Array.isArray(s.combat.enemyCrew)||!s.combat.enemyCrew.length||!s.combat.enemyCrew.every(u=>validMember(u,true))||!finite(s.combat.fightTime,0,60.001)))return false;
   if(s.recruit&&(!Array.isArray(s.recruit.offers)||s.recruit.offers.length<1||s.recruit.offers.length>3||s.recruit.offers.some(o=>!K.native(o.cardId)||!finite(o.rate,0,1)||typeof o.success!=='boolean')||s.recruit.accepted!==null&&!s.recruit.offers.some(o=>o.cardId===s.recruit.accepted&&o.success)))return false;
   if(s.phase==='recruit'&&!s.recruit||s.phase==='report'&&!s.report||s.phase==='finished'&&!s.result)return false;
   for(const j of s.jobs)if(!/^job\d+$/.test(j.id)||!get(s,j.aId)||get(s,j.aId).busy!==j.id||!validEncounter(j.encounter,s)||!finite(j.finishAt,0,5500))return false;
   if(s.waypoint&&(!finite(s.waypoint.x,0,M.SIZE)||!finite(s.waypoint.y,0,M.SIZE)))return false;
   if(s.phase!=='draft'&&!player(s).crew.length)return false;
   if(new Set(s.deployIds).size!==s.deployIds.length||s.deployIds.some(id=>!player(s).crew.some(u=>u.uid===id)))return false;
   const busy=new Map();
   for(const job of s.jobs){if(busy.has(job.aId)||job.aId==='player')return false;busy.set(job.aId,job.id);const op=job.encounter.opponentId;if(op){if(op==='player'||busy.has(op))return false;busy.set(op,job.id);}}
   const contact=['encounter','ambush'].includes(s.phase)?s.encounter:s.phase==='combat'?s.combat.encounter:null;
   if(contact){const tag='player:'+contact.id;busy.set('player',tag);if(contact.opponentId){if(busy.has(contact.opponentId))return false;busy.set(contact.opponentId,tag);}}
   if(s.captains.some(p=>(p.busy||null)!==(busy.get(p.id)||null)))return false;
   return true;
  }catch(_){return false;}
 }
 function save(s){
  try{host.localStorage.setItem(KEY,JSON.stringify(s));return true;}catch(_){return false;}
 }
 function load(){
  try{const raw=host.localStorage.getItem(KEY);if(!raw)return {state:null,error:null};const s=JSON.parse(raw);return validate(s)?{state:s,error:null}:{state:null,error:'The saved voyage could not be read. Start a new voyage to replace it.'};}
  catch(_){return {state:null,error:'The saved voyage could not be loaded.'};}
 }
 host.SailingRules=Object.freeze({KEY,VERSION,DAY_SECONDS,DAY_LIMIT,STEP,CAP,UPGRADES,ROLE_NAMES,create,load,save,validate,player,get,survivors,ranking,cap,room,claimed,alive,isBusy,repairLocked,crewReady,log,chooseCaptain,wanted,advanceClock,increaseDifficulty,updateLock,dock,undock,contested,capture,canUpgrade,upgrade,craft,equip,recovery,hazard,ambush,beginEncounter,deploy,startFight,settlePlayer,settle,flee,continueReport,pickRecruit,resolveRecruit,damageShip,sink,checkVictory,finish,queueBot,settleBots,stepWorld,clock});
})(window);
