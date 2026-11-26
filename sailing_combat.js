/* Sailing Sea combat bridge. The real player battles use the isolated Auto Chess
   engine; only off-screen NPC battles use the inexpensive power estimator. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,F=host.AutoChessCombat,M=host.SailingMap,R=host.RelicSystem;
 const RARITIES=C.RARITIES,RATES=Object.freeze([
  Object.freeze([1,1,1,.75,.45,.20]),
  Object.freeze([1,1,1,.90,.75,.50]),
  Object.freeze([1,1,1,1,.95,.80])
 ]);
 const EL=Object.freeze({advantage:1.5,disadvantage:.75}),clamp=M.clamp;
 const native=id=>C.card(typeof id==='string'?id:id?.cardId),pool=index=>C.pools[index]||[];
 const alive=u=>u&&u.hp>0;
 const living=crew=>crew.filter(alive);
 const tier=u=>Math.max(0,RARITIES.indexOf(native(u)?.rarity));
 const chance=(level,value)=>RATES[clamp(level,1,3)-1][typeof value==='number'?clamp(value,0,5):typeof value==='string'&&RARITIES.includes(value)?RARITIES.indexOf(value):tier(value)];
 const baseCache=new Map(),memberCache=new WeakMap();
 function base(id){const card=native(id);let s=baseCache.get(card.id);if(!s){s=F.stats(card);baseCache.set(card.id,s);}return s;}
 function stats(u){
  const cached=memberCache.get(u);if(cached&&cached.cardId===u.cardId&&cached.h===u.hpScale&&cached.a===u.atkScale&&cached.relic===u.relic)return cached.value;
  const card=native(u),b=base(card.id),roll=u.relic?.roll;
  let hp=Math.max(1,Math.round(b.hp*(u.hpScale||1))),atk=Math.max(1,Math.round(b.atk*(u.atkScale||1)));
  if(roll&&R.validRoll(roll)){
   const f=R.factors({card,relic:roll});hp=Math.max(1,Math.round(hp*f.hp));atk=Math.max(1,Math.round(atk*f.atk));
   // The same intrinsic Unique Relic bonus as Auto Chess. Board synergies are
   // combat-only and are normalized out of the persistent health record.
   if(roll.unique){hp=Math.round(hp*1.2);atk=Math.round(atk*1.2);}
  }
  const value={hp,atk};memberCache.set(u,{cardId:u.cardId,h:u.hpScale,a:u.atkScale,relic:u.relic,value});return value;
 }
 function member(state,cardId,options={}){
  const card=native(cardId);if(!card)throw Error('Unknown crew card.');
  const u={uid:'crew'+(++state.serial),cardId:card.id,hp:0,stamina:100,reviveDock:0,relic:null,
   ...(options.hpScale?{hpScale:options.hpScale}:{}),...(options.atkScale?{atkScale:options.atkScale}:{}),...(options.beast?{beast:true}:{})};
  u.hp=stats(u).hp;return u;
 }
 function equip(u,relic){
  const before=stats(u).hp,ratio=clamp(u.hp/before,0,1);u.relic=relic||null;
  u.hp=ratio>0?Math.max(1,Math.round(stats(u).hp*ratio)):0;
 }
 function sample(state,rows,count=3){
  const copy=rows.slice(),out=[];
  while(copy.length&&out.length<count){const index=M.int(state,0,copy.length-1);out.push(copy.splice(index,1)[0]);}
  return out;
 }
 function randomCard(state,index){const list=pool(index);return list[M.int(state,0,list.length-1)];}
 function draft(state){return sample(state,pool(5),3).map(c=>c.id);}
 function weightedTier(state,weights){
  let n=M.random(state)*weights.reduce((a,b)=>a+b,0);
  for(let i=0;i<weights.length;i++){n-=weights[i];if(n<0)return i;}return weights.length-1;
 }
 function pirateProfile(difficulty){
  if(difficulty<2)return {count:[3,4],weights:[1,0,0,0,0,0]};
  if(difficulty<4)return {count:[3,5],weights:[.56,.32,.12,0,0,0]};
  if(difficulty<6)return {count:[4,5],weights:[.09,.38,.38,.15,0,0]};
  if(difficulty<8)return {count:[5,6],weights:[0,.08,.36,.36,.20,0]};
  if(difficulty<10)return {count:[5,7],weights:[0,0,.08,.42,.40,.10]};
  return {count:[6,7],weights:[0,0,0,0,.64,.36]};
 }
 const PIRATES=['Blackwake Corsairs','Red Sash Raiders','Ironhook Pirates','Cutlass Company','Skull Reef Crew','Crimson Wake','Nighttide Raiders','Silver Fang Fleet','Ghost Lantern Crew'];
 const BEASTS=['Abyss Leviathan','Thunderjaw','Storm Kraken','Deepwater Hydra','Maelstrom Serpent','Tempest Whale','Ironback Colossus'];
 function encounter(state,kind,{islandId=null,zoneId=null}={}){
  const difficulty=state.difficulty,extra=Math.max(0,difficulty-1);
  let crew,name;
  if(kind==='beast'){
   const all=[...pool(4),...pool(5)].filter(c=>c.id!=='zetsu'&&c.id!=='pochita'&&c.id!=='tower-champion-normal-200');
   const card=all[M.int(state,0,all.length-1)];
   name=BEASTS[M.int(state,0,BEASTS.length-1)];
   crew=[member(state,card.id,{hpScale:2.8+.21*extra,atkScale:1.28+.066*extra,beast:true})];
  }else{
   const profile=pirateProfile(difficulty),total=M.int(state,...profile.count);
   name=PIRATES[M.int(state,0,PIRATES.length-1)];
   crew=Array.from({length:total},()=>member(state,randomCard(state,weightedTier(state,profile.weights)).id,{hpScale:1+.045*extra,atkScale:1+.035*extra}));
  }
  return {id:'enc'+(++state.serial),kind,name,crew,difficulty,islandId,zoneId,opponentId:null,seed:M.int(state,1,0xfffffffe)};
 }
 function captainEncounter(state,other,islandId=null){
  return {id:'enc'+(++state.serial),kind:'captain',name:other.name,crew:C.clone(other.crew),difficulty:state.difficulty,islandId,zoneId:null,opponentId:other.id,seed:M.int(state,1,0xfffffffe)};
 }
 function recruitDraft(state,crew,level){
  const order=sample(state,crew,crew.length),distinct=[],duplicates=[];
  for(const u of order)(distinct.some(v=>v.cardId===u.cardId)?duplicates:distinct).push(u);
  const choices=[...distinct,...duplicates].slice(0,3).map(u=>({cardId:u.cardId,rate:chance(level,u)}));
  return {offers:choices.map(c=>({...c,success:M.random(state)<c.rate})),accepted:null};
 }
 const salvageValue=id=>10+5*tier({cardId:id});
 const recipes=Object.freeze(R.DEFINITIONS.map(d=>Object.freeze({kind:d.kind,name:d.name,image:d.image,unique:d.unique,cost:d.dropOnly?180:Math.max(90,Math.ceil(Object.values(d.costs).reduce((a,b)=>a+b,0)*.25)),original:d.costs})));
 const recipe=kind=>recipes.find(r=>r.kind===kind);
 function rollRelic(state,kind){
  if(!recipe(kind))throw Error('Unknown Relic.');
  return {id:'relic'+(++state.serial),roll:R.rollAtTier(kind,'legendary',true,()=>M.random(state))};
 }
 const elementMultiplier=(a,b)=>host.ElementSystem.multiplier(a,b,EL);
 // The run roster is an independent index. Both sides use the same valid
 // mimic pool, never the player's collected cards, levels, weather or skins.
 let mimicPool=null;
 function roster(crew,aqua='hp'){
  mimicPool ||= host.ALL_CARDS.map(c=>c.id).filter(id=>host.PassiveSystem.validMimicPool([id])).sort();
  const front=[3,2,4,1,5,0,6,10,9,11],back=[17,16,18,15,19,14,20,24,23,25],used=new Set(),units=[];
  for(const u of living(crew)){
   const card=native(u),role=host.SpatialCombat.roleOf(card),slots=role==='Melee'?front:back;
   const board=slots.find(i=>!used.has(i))??Array.from({length:28},(_,i)=>i).find(i=>!used.has(i));used.add(board);
   units.push({uid:u.uid,cardId:u.cardId,skinId:null,board,bench:null,stamina:clamp(u.stamina,0,100),sailingHealth:clamp(u.hp/stats(u).hp,0,1),
     sailingHpScale:u.hpScale||1,sailingAtkScale:u.atkScale||1,sailingBeast:!!u.beast,relic:u.relic?{uid:u.relic.id,roll:C.clone(u.relic.roll)}:null,
     ...(u.cartoonProgress?{cartoonProgress:C.clone(u.cartoonProgress)}:{})});
  }
  return {units,augments:[],mimicPool,aqua};
 }
 const roundTime=n=>Number((Math.round(clamp(Number(n)||0,0,F.LIMIT)/F.STEP)*F.STEP).toFixed(2));
 function start(job,worker=true){
  const a=roster(job.playerCrew),b=roster(job.enemyCrew),seek=roundTime(job.fightTime),options={sailing:true,sailingReplay:seek};
  let fight,pool=null,nativeTarget=seek;
  if(worker&&host.Worker&&host.location&&/^https?:$/.test(host.location.protocol)){
   try{pool=F.createWorkerPool();fight=F.remoteCombat(pool,a,b,job.seed,options);}catch(_){pool?.dispose();pool=null;}
  }
  if(!fight)fight=F.create(a,b,job.seed,options);
  let disposed=false,confirmed=seek;
  function step(dt){
   if(disposed)return;
   if(!pool&&fight.time+1e-7<nativeTarget&&!fight.done){
    const budget=host.performance.now()+6;
    do{fight.step(Math.min(.5,nativeTarget-fight.time));}while(!fight.done&&fight.time+1e-7<nativeTarget&&host.performance.now()<budget);
   }else fight.step(dt);
   if(!fight.replaying&&(fight.time>=confirmed||fight.done))confirmed=roundTime(fight.time);
   fight.interpolate(dt);
  }
  return {
   step,dispose(){disposed=true;fight.dispose();pool?.dispose();},
   get battle(){return fight.battle;},get events(){return fight.events||[];},get logs(){return fight.logs||[];},
   get time(){return confirmed;},get visibleTime(){return fight.time;},get restoring(){return !fight.done&&(fight.replaying||fight.time+1e-7<confirmed);},
   get done(){return fight.done;},get outcome(){return fight.outcome();},get remote(){return fight.remote===true;}
  };
 }
 function applyCrew(crew,rows){
  if(!rows)return;
  for(const u of crew){const r=rows[u.uid];if(!r)continue;
   const health=clamp(Number(r.health)||0,0,1),max=stats(u).hp;
   u.hp=health>0?Math.max(1,Math.min(max,Math.round(max*health))):0;
   u.stamina=clamp(Number(r.stamina)||0,0,100);
   if(!u.hp)u.reviveDock=0;
   if(r.cartoonProgress){u.cartoonProgress={...u.cartoonProgress,...r.cartoonProgress};}
  }
 }
 // Off-screen power uses current (not full) health, AC stat tiers, relics,
 // stamina, elemental matchups and trait tiers. It never runs combat per frame.
 function power(crew,opponents=[]){
  const team=living(crew),foes=living(opponents);
  if(!team.length)return 0;
  const traitTiers=host.AutoChessSynergies.analyze(team).reduce((a,b)=>a+b.tier,0);
  const total=team.reduce((sum,u)=>{
   const b=stats(u),ratio=clamp(u.hp/b.hp,0,1),stamina=clamp(u.stamina,0,100),card=native(u);
   const matchup=foes.length?foes.reduce((n,v)=>n+elementMultiplier(card,native(v)),0)/foes.length:1;
   return sum+Math.sqrt(b.hp*b.atk)*Math.pow(ratio,.68)*(.75+.25*stamina/100)*Math.pow(matchup,.45)*(1+tier(u)*.016);
  },0);
  return total*(1+Math.min(.42,traitTiers*.025));
 }
 function approximate(a,b,seed){
  const rand={rng:seed>>>0||1},pa=power(a,b),pb=power(b,a),ratio=(pa+1)/(pb+1),score=Math.log(ratio)+M.between(rand,-.32,.32);
  const winner=!pa&&!pb?'draw':!pa?'enemy':!pb?'player':Math.abs(score)<.045?'draw':score>0?'player':'enemy';
  function wounds(crew,own,remote,won){
   return Object.fromEntries(living(crew).map(u=>{
    const max=stats(u).hp,pressure=remote/Math.max(1,own),cost=won===true?clamp(.13+pressure*.21,.10,.56):won===false?clamp(.63+pressure*.20,.70,1.2):.60;
    const damage=max*cost*M.between(rand,.79,1.23),hp=Math.max(0,u.hp-damage);
    return [u.uid,{health:hp/max,stamina:Math.max(0,u.stamina-M.between(rand,22,48)),cartoonProgress:u.cartoonProgress||null}];
   }));
  }
  return {winner,sailingCrew:{player:wounds(a,pa,pb,winner==='draw'?null:winner==='player'),enemy:wounds(b,pb,pa,winner==='draw'?null:winner==='enemy')},playerSurvivors:living(a).length,enemySurvivors:living(b).length};
 }
 host.SailingCombat=Object.freeze({RARITIES,RATES,EL,alive,living,native,stats,member,equip,tier,chance,draft,pirateProfile,encounter,captainEncounter,recruitDraft,salvageValue,recipes,recipe,rollRelic,elementMultiplier,roster,start,applyCrew,power,approximate});
})(window);
