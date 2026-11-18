/* Phase 1: pure, seeded lobby/economy model. Match items never enter the collection. */
(function(host){
 'use strict';
 const KEY='anime_card_rng_autochess_v1',PENDING_KEY='anime_card_rng_ac_pending_results_v1',VERSION=1;
 const RARITIES=Object.freeze(['Common','Rare','Epic','Legendary','Mythic','Secret']),COSTS=Object.freeze([1,2,3,4,5,7]);
 const XP=Object.freeze([2,6,10,18,28,40,56,72,0]);
 const ODDS=Object.freeze([[100,0,0,0,0,0],[80,20,0,0,0,0],[65,28,7,0,0,0],[48,32,18,2,0,0],[32,33,25,9,1,0],[20,30,30,16,4,0],[12,22,30,25,10,1],[7,15,25,30,20,3],[3,10,20,30,28,9]].map(Object.freeze));
 const RULES=Object.freeze({bench:9,stash:10,shop:5,maxLevel:9,planningSeconds:35,carouselSeconds:22,resultSeconds:6,xpCost:4,refreshCost:2,baseGold:10,baseHp:100,maxBonusGoldPerRound:16,maxCardGoldPerRound:2,rarities:RARITIES,costs:COSTS,xp:XP,odds:ODDS});
 const clone=v=>JSON.parse(JSON.stringify(v)),cardMap=new Map((host.ALL_CARDS||[]).map(c=>[c.id,c])),pools=RARITIES.map(r=>[...cardMap.values()].filter(c=>c.rarity===r));
 const card=id=>cardMap.get(typeof id==='string'?id:id?.cardId),int=(n,a,b)=>Number.isSafeInteger(n)&&n>=a&&n<=b;
 function random(s){let x=s.rng>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0||0x6d2b79f5;return s.rng/4294967296;}
 function seedOf(...parts){let n=2166136261;for(const ch of parts.join('|'))n=Math.imul(n^ch.charCodeAt(0),16777619)>>>0;return n||1;}
 const choose=(s,a)=>a.length?a[Math.floor(random(s)*a.length)]:null;
 // Xorshift visits 1..2^32-1. Rejection sampling removes even modulo bias.
 function uniform(s,a){if(!a.length)return null;const limit=Math.floor(0xffffffff/a.length)*a.length;let value;do{random(s);value=(s.rng>>>0)-1;}while(value>=limit);return a[value%a.length];}
 const teamCap=p=>Math.min(11,p.level+(host.AutoChessAugments?.effects(p).bonusSlots||0));
 const tier=u=>RARITIES.indexOf(card(u)?.rarity),price=u=>COSTS[tier(u)]||1;
 function player(id,name,bot=false){return{id,name,bot,hp:100,eliminated:false,lastStandUsed:false,gold:10,level:1,xp:0,streak:0,winStreak:0,lossStreak:0,pendingLossGold:0,pendingStreakRelics:[],units:[],relics:Array(10).fill(null),loot:[],shop:Array(5).fill(null),locked:false,autoFuse:false,anvil:[],augments:[],econ:{round:'1-1',bonus:0,card:0,freeRefresh:0},rank:null,history:[],lastIncome:null};}
 // Match-lifetime state: a replay, stale room snapshot or legacy state may set
 // these facts, but can never clear them. The top-level bit survives rebuilding
 // augmentState; the legacy mirror preserves existing saves and UI metadata.
 const lastStandSpent=p=>p?.lastStandUsed===true||p?.augmentState?.lastStandUsed===true||!!p?.lastStandRound;
 function consumeLastStand(p){p.lastStandUsed=true;(p.augmentState ||= {}).lastStandUsed=true;}
 function reconcileTactician(p,previous=null){
  if(lastStandSpent(p)||lastStandSpent(previous))consumeLastStand(p);else p.lastStandUsed=false;
  if(!p.lastStandRound&&previous?.lastStandRound)p.lastStandRound=previous.lastStandRound;
  if(previous?.rank!=null)p.rank=previous.rank;
  if(Number.isFinite(previous?.hp))p.hp=Math.min(p.hp,previous.hp);
  p.eliminated=p.eliminated===true||previous?.eliminated===true||p.hp<=0||previous?.hp<=0||p.rank>1;
  if(p.eliminated)p.hp=0;return p;
 }
 function damageTactician(s,p,amount){
  reconcileTactician(p);if(p.hp<=0||p.rank!=null||!Number.isFinite(amount)||amount<=0)return 0;
  const before=p.hp;p.hp=Math.max(0,p.hp-Math.floor(amount));
  if(p.hp===0)host.AutoChessAugments?.lastStand(s,p);
  if(p.hp<=0){p.hp=0;p.eliminated=true;}return Math.max(0,before-p.hp);
 }
 function placeEliminated(s,ordered=[]){
  const rows=[...new Set([...ordered,...s.players])];let rank=s.players.filter(p=>p.rank===null).length;
  for(const p of rows){reconcileTactician(p);if(p.hp>0||p.rank!==null)continue;p.eliminated=true;p.hp=0;p.rank=rank--;host.AutoChessTelemetry?.snapshot(s,p);}
 }
 function unit(s,c){return{uid:'u'+(++s.serial),cardId:c.id,board:null,bench:null,reserve:false,relic:null,keep:false};}
 function relic(s,rarity='common',unique=false,kind=null){const d=kind||choose(s,host.RelicSystem.DEFINITIONS).kind;return{uid:'r'+(++s.serial),roll:host.RelicSystem.rollAtTier(d,rarity,unique,()=>random(s))};}
 function stash(p,r){if(!r)return;const free=p.relics.indexOf(null);if(free>=0)p.relics[free]=r;else p.loot.push(r);}
 function drain(p){for(const u of p.units.filter(u=>u.reserve)){const free=freeBench(p);if(free<0)break;u.reserve=false;u.bench=free;}while((p.loot.length||p.pendingStreakRelics?.length)&&p.relics.includes(null))p.relics[p.relics.indexOf(null)]=p.loot.length?p.loot.shift():p.pendingStreakRelics.shift();}
 const freeBench=p=>Array.from({length:9},(_,i)=>i).find(i=>!p.units.some(u=>u.bench===i))??-1;
 function acquire(p,u){const free=freeBench(p);u.bench=free<0?null:free;u.reserve=free<0;p.units.push(u);return u;}
 function shop(s,p){p.shop=Array.from({length:5},()=>{let n=random(s)*100,index=5;for(let i=0;i<6;i++){n-=ODDS[p.level-1][i];if(n<0){index=i;break;}}return choose(s,pools[index])?.id||pools[0][0].id;});}
 function create(seed=1,name='You'){
  const s={version:VERSION,id:'chess_'+(Date.now().toString(36))+'_'+(seed>>>0).toString(36),seed:seed>>>0||1,rankedStart:host.AutoChessRanked?.snapshot()||{elo:0,tier:0},rng:seed>>>0||1,serial:0,revision:0,stage:1,round:1,phase:'carousel',remaining:22,players:[player('human',String(name).slice(0,32)),...Array.from({length:7},(_,i)=>player('bot'+i,'Bot '+(i+1),true))],carousel:[],draftOrder:[],draftWave:0,draftElapsed:0,pairs:[],lastResults:[],finished:false,paid:false,roundSeed:0};
  host.AutoChessTelemetry?.ensure(s,true);host.AutoChessAugments?.initialize(s);carousel(s);return s;
 }
 function roundKind(s){return s.round===1&&s.stage===1||s.stage>1&&s.round===4?'carousel':s.stage===1&&[2,3].includes(s.round)?'creep':s.stage>1&&s.round===6?'boss':'pvp';}
 function label(s){return s.stage+'-'+s.round;}
 function alive(s){return s.players.filter(p=>p.hp>0&&!p.eliminated&&p.rank===null);}
 function get(s,id=s.localPlayerId||'human'){host.AutoChessTelemetry?.ensure(s);return s.players.find(p=>p.id===id);}
 function deployed(p){return p.units.filter(u=>u.board!==null);}
 function economyRound(s,p){const key=label(s);if(p.econ?.round!==key)p.econ={round:key,bonus:0,card:0,freeRefresh:host.AutoChessAugments?.effects(p).freeRefresh||0};return p.econ;}
 function earn(p,n){const amount=Math.max(0,Math.min(100000-p.gold,Math.floor(Number(n)||0)));p.gold+=amount;host.AutoChessTelemetry?.economy(p,'totalGoldEarned',amount);return amount;}
 function spend(p,n){if(p.gold<n)throw Error('Not enough Gold.');p.gold-=n;host.AutoChessTelemetry?.economy(p,'totalGoldSpent',n);}
 function bonus(s,p,n,source='other'){
  const e=economyRound(s,p),wanted=Math.max(0,Math.floor(Number(n)||0));
  const amount=Math.min(wanted,RULES.maxBonusGoldPerRound-e.bonus,source==='card'?RULES.maxCardGoldPerRound-e.card:Infinity);
  const credited=earn(p,Math.max(0,amount));e.bonus+=credited;if(source==='card')e.card+=credited;return credited;
 }
 const xpCost=p=>host.AutoChessAugments?.effects(p).xpCost||4;
 function streakResult(s,p,won){
  p.winStreak ??= Math.max(0,p.streak||0);p.lossStreak ??= Math.max(0,-(p.streak||0));if(won===null){p.pendingLossGold=p.lossStreak>=5?3:p.lossStreak===4?2:p.lossStreak>=2?1:0;return;}
  if(won){p.winStreak++;p.lossStreak=0;p.pendingLossGold=0;if(p.winStreak%3===0&&p.lastStreakReward?.round!==label(s)){
   const n=random(s),rarity=s.stage<3?(n<.8?'common':'rare'):s.stage<5?(n<.5?'common':n<.95?'rare':'legendary'):(n<.2?'common':n<.85?'rare':'legendary'),item=relic(s,rarity);
   if(p.relics.includes(null)||p.loot.length<512)stash(p,item);else(p.pendingStreakRelics ||= []).push(item);
   p.lastStreakReward={round:label(s),wins:p.winStreak,uid:item.uid,kind:item.roll.kind,rarity,queued:!p.relics.some(r=>r?.uid===item.uid)};
  }}else{p.lossStreak++;p.winStreak=0;p.pendingLossGold=p.lossStreak>=5?3:p.lossStreak===4?2:p.lossStreak>=2?1:0;}
  p.streak=p.winStreak||-p.lossStreak;
 }
 function income(s,p,won,creep=false){
  economyRound(s,p);const base=s.stage===1?5:8,interest=Math.min(host.AutoChessAugments?.effects(p).interestCap||5,Math.floor(p.gold/10));if(!creep)streakResult(s,p,won);
  const loot=creep?3+Math.min(5,s.stage):0;
  p.lastIncome={base:earn(p,base),interest:bonus(s,p,interest,'interest'),streak:0,loot:bonus(s,p,loot,'creep'),win:bonus(s,p,won&&!creep?1:0,'win')};
  host.AutoChessAugments?.endRound(s,p);p.xp+=2;levelUp(p,s);return p.lastIncome;
 }

 function creepRelics(s,p){
  const count=s.stage===1?1+Math.floor(random(s)*2):2+Math.floor(random(s)*2),drops=[];
  for(let i=0;i<count;i++){const r=random(s),rarity=s.stage===1?(r<.75?'common':'rare'):s.stage===2?(r<.20?'common':r<.90?'rare':'legendary'):s.stage===3?(r<.10?'common':r<.70?'rare':'legendary'):s.stage===4?(r<.45?'rare':'legendary'):(r<.30?'rare':'legendary');const item=relic(s,rarity);stash(p,item);drops.push(item.roll.rarity);}
  p.lastRelicDrops=drops;return drops;
 }
 function levelUp(p,s=null){const from=p.level;while(p.level<9&&p.xp>=XP[p.level-1]){p.xp-=XP[p.level-1];p.level++;}if(p.level===9)p.xp=0;if(s&&p.level>from)host.AutoChessAugments?.onLevel(s,p,from);}
 function buy(s,p,index){if(!int(index,0,4)||!p.shop[index])throw Error('That shop slot is empty.');const c=card(p.shop[index]),cost=COSTS[RARITIES.indexOf(c.rarity)];if(p.gold<cost)throw Error('Not enough Gold.');if(freeBench(p)<0)throw Error('Bench full. Deploy, fuse or sell a unit first.');spend(p,cost);const bought=acquire(p,unit(s,c));p.shop[index]=null;if(p.autoFuse)autoFuse(s,p,bought.uid);}
 function move(p,uid,where,index){const u=p.units.find(u=>u.uid===uid);if(!u)throw Error('Unit unavailable.');if(where==='board'){
   if(!int(index,0,27))throw Error('Choose a friendly tile.');const other=p.units.find(v=>v.board===index);if(u.board===null&&!other&&deployed(p).length>=teamCap(p))throw Error('Level up to deploy more units.');
   const old={board:u.board,bench:u.bench,reserve:u.reserve};u.board=index;u.bench=null;u.reserve=false;if(other&&other!==u)Object.assign(other,old);
  }else if(where==='bench'){if(!int(index,0,8))throw Error('Choose a bench slot.');const other=p.units.find(v=>v.bench===index),old={board:u.board,bench:u.bench,reserve:u.reserve};u.board=null;u.bench=index;u.reserve=false;if(other&&other!==u)Object.assign(other,old);}else throw Error('Invalid destination.');p.anvil=p.anvil.filter(id=>p.units.some(v=>v.uid===id&&v.board===null));drain(p);
 }
 function sell(p,uid){const u=p.units.find(u=>u.uid===uid);if(!u)throw Error('Unit unavailable.');earn(p,price(u));stash(p,u.relic);p.units=p.units.filter(v=>v!==u);p.anvil=p.anvil.filter(id=>id!==uid);drain(p);}
 const soloCombat=s=>s.phase==='combat'&&!s.live&&(s.hybrid?.humanPlayers??1)===1;
 const combatForge=(s,p)=>soloCombat(s)&&p===get(s)&&p.hp>0&&!s.finished;
 const fusionEligible=(s,p,u)=>!!u&&(u.board===null||combatForge(s,p));
 // Selection is spatial and deterministic; the existing rarity roll still owns the result.
 function fusionGroup(s,p,ids=[],benchOnly=false){
  if(!Array.isArray(ids)||ids.length>3||new Set(ids).size!==ids.length)return null;
  const anchors=ids.map(id=>p.units.find(u=>u.uid===id));if(anchors.some(u=>!fusionEligible(s,p,u))||anchors.filter(u=>u.board!==null).length>1)return null;
  const compare=(a,b)=>a<b?-1:a>b?1:0,positions=new Map(p.units.map((u,i)=>[u,u.bench!==null?u.bench:u.board!==null?28+u.board:100+i])),position=u=>positions.get(u);
  const distance=(a,b)=>a.bench!==null&&b.bench!==null?Math.abs(a.bench-b.bench):a.board!==null&&b.board!==null?Math.abs(a.board%7-b.board%7)+Math.abs(Math.floor(a.board/7)-Math.floor(b.board/7)):40+Math.abs(position(a)-position(b));
  const eligible=p.units.filter(u=>fusionEligible(s,p,u)&&(!benchOnly||u.board===null)&&(!u.keep||ids.includes(u.uid))&&(!p.anvil.includes(u.uid)||ids.includes(u.uid)));
  if(anchors.length){
   const t=tier(anchors[0]);if(t<0||t>=5||anchors.some(u=>tier(u)!==t))return null;
   const fielded=anchors.some(u=>u.board!==null),same=anchors.every(u=>u.cardId===anchors[0].cardId),rows=eligible.filter(u=>!ids.includes(u.uid)&&tier(u)===t&&(!fielded||u.board===null));
   const copies=same?rows.filter(u=>u.cardId===anchors[0].cardId):[],choices=copies.length>=3-anchors.length?copies:rows;
   choices.sort((a,b)=>anchors.reduce((n,u)=>n+distance(a,u)-distance(b,u),0)||position(a)-position(b)||compare(a.uid,b.uid));
   const chosen=anchors.slice();for(const u of choices){if(chosen.length===3)break;if(u.board!==null&&chosen.some(v=>v.board!==null))continue;chosen.push(u);}
   return chosen.length===3?chosen.map(u=>u.uid):null;
  }
  for(let t=0;t<5;t++){
   const rows=eligible.filter(u=>tier(u)===t&&u.board===null).sort((a,b)=>position(a)-position(b)||compare(a.uid,b.uid));if(rows.length<3)continue;
   const groups=new Map();for(const u of rows){if(!groups.has(u.cardId))groups.set(u.cardId,[]);groups.get(u.cardId).push(u);}
   const copies=[...groups.values()].filter(a=>a.length>=3),options=copies.length?copies:[rows];let best=null,span=Infinity;
   for(const group of options)for(let i=0;i<=group.length-3;i++){const triple=group.slice(i,i+3),d=distance(triple[0],triple[1])+distance(triple[1],triple[2])+distance(triple[0],triple[2]);if(d<span){span=d;best=triple;}}
   if(best)return best.map(u=>u.uid);
  }return null;
 }
 function fuse(s,p,ids){
  if(s.phase==='combat'&&!combatForge(s,p))throw Error('Combat fusion is Solo-only.');
  if(!Array.isArray(ids)||ids.length!==3||new Set(ids).size!==3)throw Error('Choose exactly three units.');
  const rows=ids.map(id=>p.units.find(u=>u.uid===id));const fielded=rows.filter(u=>u?.board!==null);if(rows.some(u=>!fusionEligible(s,p,u))||fielded.length>1)throw Error('Use bench units, or one deployed unit plus two bench units in Solo combat.');const t=tier(rows[0]);if(t<0||t===5||rows.some(u=>tier(u)!==t))throw Error('Use three cards of the same rarity, below Secret.');
  let available=pools[t+1],categoryProc=false;const chance=host.AutoChessAugments?.effects(p).fusionCategoryChance||0;
  if(chance&&random(s)<chance){
   const sets=rows.map(u=>new Set(card(u).category.map(tag=>host.CategorySystem.normalize(tag)))),common=[...sets[0]].filter(tag=>sets.every(set=>set.has(tag))),union=[...new Set(sets.flatMap(set=>[...set]))];
   let matches=available.filter(c=>c.category.some(tag=>common.includes(host.CategorySystem.normalize(tag))));
   if(!matches.length)matches=available.filter(c=>c.category.some(tag=>union.includes(host.CategorySystem.normalize(tag))));
   if(matches.length){available=matches;categoryProc=true;}
  }
  const result=unit(s,uniform(s,available)),slot=rows.map(u=>u.bench).filter(i=>i!==null).sort((a,b)=>a-b)[0];for(const u of rows)stash(p,u.relic);p.units=p.units.filter(u=>!ids.includes(u.uid));p.anvil=p.anvil.filter(id=>!ids.includes(id));result.fusionDepth=Math.min(5,1+Math.max(...rows.map(u=>u.fusionDepth||0)));result.board=fielded[0]?.board??null;result.bench=result.board===null?(slot??null):null;result.reserve=result.board===null&&slot===undefined;p.units.push(result);p.lastFusion={round:label(s),uid:result.uid,cardId:result.cardId,categoryProc,chance};if(categoryProc){p.lineageProcs=(p.lineageProcs||0)+1;p.lastLineage={round:label(s),uid:result.uid,cardId:result.cardId};}host.AutoChessTelemetry?.economy(p,'rarityFusionsCount',1);if(result.fusionDepth===2)host.AutoChessTelemetry?.economy(p,'threeStarFusionsCount',1);drain(p);return result;
 }
 function autoFuse(s,p,nearUid=null){for(let guard=0;guard<24;guard++){const ids=(nearUid?fusionGroup(s,p,[nearUid],true):null)||fusionGroup(s,p,[],true);nearUid=null;if(!ids)break;fuse(s,p,ids);}}
 function equip(p,relicId,uid){const index=p.relics.findIndex(r=>r?.uid===relicId),u=p.units.find(v=>v.uid===uid);if(index<0||!u)throw Error('Relic or unit unavailable.');const old=u.relic;u.relic=p.relics[index];p.relics[index]=old;drain(p);}
 function canFuseRelics(p,a,b){const x=p?.relics.find(r=>r?.uid===a),y=p?.relics.find(r=>r?.uid===b);return!!(x&&y&&x!==y&&!x.roll.unique&&!y.roll.unique&&x.roll.rarity===y.roll.rarity);}
 function fuseRelics(s,p,a,b){if(s.phase==='combat'&&!combatForge(s,p))throw Error('Combat fusion is Solo-only.');const ai=p.relics.findIndex(r=>r?.uid===a),bi=p.relics.findIndex(r=>r?.uid===b);if(ai<0||bi<0||ai===bi)throw Error('Choose two stash Relics.');const x=p.relics[ai].roll,y=p.relics[bi].roll;if(x.rarity!==y.rarity||x.unique||y.unique)throw Error('Relics must share a tier and be non-Unique.');const next=x.rarity==='common'?'rare':'legendary',unique=x.rarity==='legendary',result=relic(s,next,unique,random(s)<.5?x.kind:y.kind);p.relics[ai]=result;p.relics[bi]=null;host.AutoChessTelemetry?.economy(p,'relicsCrafted',1);drain(p);return result;}
 function carousel(s){
  s.draftPlan=null;s.phase='carousel';s.remaining=RULES.carouselSeconds;s.draftElapsed=0;s.draftWave=0;s.draftOrder=alive(s).slice().sort((a,b)=>a.hp-b.hp||s.players.indexOf(a)-s.players.indexOf(b)).map(p=>p.id);
  const rarity=s.stage<3?'common':s.stage<5?'rare':'legendary';
  s.carousel=Array.from({length:9},()=>{const pool=pools[Math.min(5,Math.max(0,s.stage-1))];return{...unit(s,choose(s,pool)),relic:relic(s,rarity),claimedBy:null};});
 }
 function released(s,id){const i=s.draftOrder.indexOf(id);return i>=0&&(s.stage===1||i<(s.draftWave+1)*2);}
 function draft(s,p,uid){const u=s.carousel.find(v=>v.uid===uid);if(!u||u.claimedBy||!released(s,p.id)||s.carousel.some(v=>v.claimedBy===p.id))throw Error('Wait for your release pair or choose an unclaimed unit.');u.claimedBy=p.id;const result=clone(u);delete result.claimedBy;acquire(p,result);return result;}
 function plan(s){s.draftPlan=null;s.phase='planning';s.remaining=RULES.planningSeconds;s.pairs=[];s.roundSeed=seedOf(s.seed,s.stage,s.round);for(const p of alive(s)){economyRound(s,p);const lossGold=bonus(s,p,p.pendingLossGold||0,'lossStreak');p.pendingLossGold=0;if(lossGold){p.lastIncome ||= {};p.lastIncome.lossStreak=lossGold;}if(p.locked)p.locked=false;else shop(s,p);drain(p);}host.AutoChessAugments?.begin(s);s.revision++;}
 function finishAtLimit(s){
  if(s.finished||s.stage!==100||s.round!==6)return false;
  const rows=alive(s).sort((a,b)=>b.hp-a.hp||(s.matchStats?.tacticians[b.id]?.totalDamageDealt||0)-(s.matchStats?.tacticians[a.id]?.totalDamageDealt||0)||b.level-a.level||seedOf(s.seed,a.id)-seedOf(s.seed,b.id));
  rows.forEach((p,index)=>{p.rank=index+1;if(index){p.hp=0;p.eliminated=true;}});s.lobbyTiebreak='stage-limit';s.finished=true;s.phase='complete';s.remaining=0;s.finishReason=get(s).rank===1?'victory':'eliminated';host.AutoChessTelemetry?.finish(s);s.revision++;return true;
 }
 function advance(s){if(s.finished||finishAtLimit(s))return;if(s.round===(s.stage===1?4:6)){s.stage++;s.round=1;}else s.round++;s.lastResults=[];if(roundKind(s)==='carousel')carousel(s);else plan(s);s.revision++;}
 function apply(s,playerId,action){
  const p=get(s,playerId);if(!p||p.hp<=0||s.finished)throw Error('This tactician is eliminated.');
  if(!['planning','carousel','augment'].includes(s.phase)&&!combatForge(s,p))throw Error('Wait for the planning phase.');
  if(s.phase==='combat'&&!['fuse','anvil','relicFuse','keep'].includes(action.type))throw Error('Only card/Relic fusion is available during Solo combat.');
  const kind=action.type;if(s.phase==='augment'&&!['augmentPick','augmentReroll'].includes(kind))throw Error('Choose your Augment first.');if(s.phase==='carousel'&&!['draft','sell','move','unequip','keep'].includes(kind))throw Error('Complete the carousel first.');
  switch(kind){
   case'buy':buy(s,p,action.index);break;
   case'xp':{const cost=xpCost(p);if(p.level===9||p.gold<cost)throw Error('Need '+cost+' Gold; maximum Level 9.');spend(p,cost);p.xp+=4+(host.AutoChessAugments?.effects(p).buyXpBonus||0);levelUp(p,s);break;}
   case'refresh':{const e=economyRound(s,p),paid=e.freeRefresh<=0;if(!paid)e.freeRefresh--;else spend(p,2);const chance=host.AutoChessAugments?.effects(p).rerollRefund||0;if(paid&&chance&&e.bonus<=RULES.maxBonusGoldPerRound-2&&random(s)<chance)bonus(s,p,2,'augment');host.AutoChessTelemetry?.economy(p,'totalRefreshes',1);shop(s,p);break;}
   case'augmentPick':host.AutoChessAugments.pick(s,p,action.index);break;
   case'augmentReroll':host.AutoChessAugments.reroll(s,p,action.index);break;
   case'lock':p.locked=!p.locked;break;
   case'autoFuse':p.autoFuse=!p.autoFuse;if(p.autoFuse)autoFuse(s,p);break;
   case'move':move(p,action.uid,action.where,action.index);break;
   case'sell':sell(p,action.uid);break;
   case'keep':{const u=p.units.find(v=>v.uid===action.uid);if(u)u.keep=!u.keep;break;}
   case'anvil':{const u=p.units.find(v=>v.uid===action.uid);if(!fusionEligible(s,p,u))throw Error('Move this unit to the bench first.');if(p.anvil.includes(u.uid))p.anvil=p.anvil.filter(id=>id!==u.uid);else if(p.anvil.length<3){if(u.board!==null&&p.anvil.some(id=>p.units.find(v=>v.uid===id)?.board!==null))throw Error('Only one deployed material is allowed.');p.anvil.push(u.uid);}else throw Error('Anvil is full.');break;}
   case'fuse':fuse(s,p,action.ids||p.anvil.slice());break;
   case'equip':equip(p,action.relicId,action.uid);break;
   case'unequip':{const u=p.units.find(v=>v.uid===action.uid);if(u?.relic){stash(p,u.relic);u.relic=null;drain(p);}break;}
   case'relicFuse':fuseRelics(s,p,action.a,action.b);break;
   case'draft':draft(s,p,action.uid);break;
   default:throw Error('Unknown Auto Chess action.');
  }s.revision++;return s;
 }
 // Placement rewards are quoted once, then persisted before account crediting.
 const LEGACY_PLACEMENT_REWARDS=Object.freeze([
  [25000000,150,500,2500],[15000000,100,300,1800],[9000000,60,200,1200],
  [5000000,40,120,800],[2500000,20,60,500],[750000,10,0,200],
  [750000,10,0,200],[750000,10,0,200]
 ].map(Object.freeze));
 const PLACEMENT_REWARDS=Object.freeze(LEGACY_PLACEMENT_REWARDS.map(row=>Object.freeze(row.slice(0,3))));
 const scaled=(base,multiplier)=>Math.min(Number.MAX_SAFE_INTEGER,Math.floor(base*multiplier));
 function reward(rank,multipliers={}){
  if(!int(rank,1,8))throw Error('Invalid placement.');
  const [vnd,orbs,gems]=PLACEMENT_REWARDS[rank-1];
  const factor=value=>Number.isFinite(Number(value))&&Number(value)>=1?Math.min(Number.MAX_SAFE_INTEGER,Number(value)):1;
  const money=factor(multipliers.vnd),drop=factor(multipliers.drop);
  return{version:2,rank,vnd:{base:vnd,multiplier:money,total:scaled(vnd,money)},orbs:{base:orbs,multiplier:drop,total:scaled(orbs,drop)},gems,elo:host.AutoChessRanked.quoteElo(rank,multipliers.elo??host.AutoChessRanked.current().elo,multipliers.tactical)};
 }
 function validReward(value,rank=value?.rank){
  if(!value||![1,2].includes(value.version)||!int(rank,1,8)||value.rank!==rank)return false;
  for(const key of ['vnd','orbs'])if(!value[key]||!Number.isFinite(value[key].multiplier)||value[key].multiplier<1||value[key].multiplier>Number.MAX_SAFE_INTEGER)return false;
  const [vnd,orbs,gems,legacyExp]=LEGACY_PLACEMENT_REWARDS[rank-1],expected={vnd:{base:vnd,multiplier:value.vnd.multiplier,total:scaled(vnd,value.vnd.multiplier)},orbs:{base:orbs,multiplier:value.orbs.multiplier,total:scaled(orbs,value.orbs.multiplier)}};
  return value.gems===gems&&(value.version===1?value.exp===legacyExp:host.AutoChessRanked?.validQuote(value.elo,rank)&&value.exp===undefined)&&['vnd','orbs'].every(key=>['base','multiplier','total'].every(field=>value[key][field]===expected[key][field]));
 }
 const groupLocked=s=>Boolean(s?.hybrid?.humanPlayers>1&&!s.finished&&alive(s).length>1);
 function finalize(s,reason=null){
  const p=get(s);if(!p)return false;
  placeEliminated(s);
  if(groupLocked(s))return false;
  if(s.hybrid?.humanPlayers>1){const remaining=alive(s);if(remaining.length===1)remaining[0].rank=1;}
  if(reason==='forfeit'&&!s.finished&&p.hp>0){p.rank=alive(s).length||1;p.hp=0;p.eliminated=true;}
  const champion=p.rank===1||alive(s).length===1&&alive(s)[0]===p;
  if(!s.finished&&p.hp>0&&!champion)return false;
  if(p.rank===null)p.rank=champion?1:Math.min(8,alive(s).length+1);
  for(const row of s.players)row.anvil=row.anvil.filter(id=>row.units.some(u=>u.uid===id&&u.board===null));
  const changed=!s.finished||s.phase!=='complete'||s.remaining!==0||!s.finishReason;
  s.finishReason ||= reason==='forfeit'?'forfeit':p.rank===1?'victory':'eliminated';
  s.finished=true;s.phase='complete';s.remaining=0;host.AutoChessTelemetry?.finish(s);if(changed)s.revision++;
  return true;
 }
 function clear(){try{host.localStorage.removeItem(KEY);return host.localStorage.getItem(KEY)===null;}catch(_){return false;}}
 function validate(s){
  if(!s||s.version!==1||typeof s.id!=='string'||!/^chess_[a-z0-9]+_[a-z0-9]+$/.test(s.id)||typeof s.finished!=='boolean'||typeof s.paid!=='boolean'||!Number.isFinite(s.remaining)||s.remaining<0||s.remaining>35||!int(s.seed,1,4294967295)||!int(s.rng,1,4294967295)||!int(s.serial,0,1e7)||!int(s.stage,1,100)||!int(s.round,1,s.stage===1?4:6)||!['planning','carousel','augment','combat','results','complete'].includes(s.phase)||!Array.isArray(s.players)||s.players.length!==8)return false;
  if(s.localPlayerId!==undefined&&!s.players.some(p=>p.id===s.localPlayerId))return false;
  if(s.live!==undefined){const l=s.live;if(!l||l.version!==1||!Array.isArray(l.humans)||l.humans.length<2||l.humans.length>8||new Set(l.humans.map(h=>h?.id)).size!==l.humans.length||new Set(l.humans.map(h=>h?.uid)).size!==l.humans.length||l.humans.some(h=>!h||!s.players.some(p=>p.id===h.id)||typeof h.uid!=='string'||!h.uid.length||h.uid.length>128||typeof h.connected!=='boolean')||l.owner!==l.humans[0].uid||!l.humans.some(h=>h.id===(s.localPlayerId||'human'))||typeof l.locked!=='boolean'||!l.ready||typeof l.ready!=='object'||Array.isArray(l.ready)||Object.entries(l.ready).some(([id,value])=>!l.humans.some(h=>h.id===id)||typeof value!=='boolean')||s.hybrid?.humanPlayers!==l.humans.length)return false;}
  if(s.finishReason!==undefined&&!['victory','eliminated','forfeit'].includes(s.finishReason))return false;
  if(s.reward!==undefined&&!validReward(s.reward,get(s)?.rank))return false;
  if(s.finished&&get(s)?.rank===null||s.paid&&!s.finished)return false;
  if(host.AutoChessAugments?.valid(s)===false||host.AutoChessTelemetry?.valid(s)===false)return false;
  for(const p of s.players)if(p.lastStandUsed!==undefined&&typeof p.lastStandUsed!=='boolean'||p.eliminated!==undefined&&(typeof p.eliminated!=='boolean'||p.eliminated&&p.hp!==0))return false;
  for(const p of s.players)if(['winStreak','lossStreak','pendingLossGold'].some(key=>p[key]!==undefined&&!int(p[key],0,key==='pendingLossGold'?3:600)))return false;
  for(const p of s.players)if(p.econ&&(!Number.isInteger(p.econ.bonus)||p.econ.bonus<0||p.econ.bonus>16||!Number.isInteger(p.econ.card)||p.econ.card<0||p.econ.card>2||!int(p.econ.freeRefresh,0,3)))return false;
  const ids=new Set(),unitIds=new Set(),relicIds=new Set();
  for(const p of s.players){if(!['human','bot0','bot1','bot2','bot3','bot4','bot5','bot6'].includes(p.id)||typeof p.name!=='string'||p.name.length>40||typeof p.bot!=='boolean'||!(p.rank===null||int(p.rank,1,8))||ids.has(p.id)||!int(p.hp,0,100)||!int(p.gold,0,100000)||!int(p.level,1,9)||!int(p.xp,0,100)||!Array.isArray(p.units)||p.units.length>100||!Array.isArray(p.relics)||p.relics.length!==10||!Array.isArray(p.loot)||p.loot.length>512||p.pendingStreakRelics!==undefined&&(!Array.isArray(p.pendingStreakRelics)||p.pendingStreakRelics.length>200)||!Array.isArray(p.shop)||p.shop.length!==5||p.shop.some(id=>id!==null&&!card(id)))return false;ids.add(p.id);const tiles=new Set(),bench=new Set();
   const checkRelic=r=>{if(!r)return true;if(typeof r.uid!=='string'||relicIds.has(r.uid)||!host.RelicSystem.validRoll(r.roll))return false;relicIds.add(r.uid);return true;};
   for(const u of p.units){if(u.fusionDepth!==undefined&&!int(u.fusionDepth,1,5))return false;if(!card(u)||typeof u.uid!=='string'||unitIds.has(u.uid)||!checkRelic(u.relic))return false;unitIds.add(u.uid);if(u.board!==null){if(!int(u.board,0,27)||tiles.has(u.board)||u.bench!==null||u.reserve)return false;tiles.add(u.board);}else if(u.bench!==null){if(!int(u.bench,0,8)||bench.has(u.bench)||u.reserve)return false;bench.add(u.bench);}else if(!u.reserve)return false;}
   if(tiles.size>teamCap(p)||![...p.relics,...p.loot,...(p.pendingStreakRelics||[])].every(checkRelic)||!Array.isArray(p.anvil)||p.anvil.length>3||new Set(p.anvil).size!==p.anvil.length||p.anvil.some(id=>!p.units.some(u=>u.uid===id&&fusionEligible(s,p,u)))||p.anvil.filter(id=>p.units.find(u=>u.uid===id)?.board!==null).length>1)return false;
  }const ranks=s.players.map(p=>p.rank).filter(n=>n!==null);if(new Set(ranks).size!==ranks.length)return false;if(!Array.isArray(s.pairs)||s.pairs.length>4||s.pairs.some(p=>!ids.has(p.a)||!ids.has(p.b)||p.a===p.b||typeof p.ghost!=='boolean'))return false;if(!Array.isArray(s.carousel)||s.carousel.length!==9||new Set(s.carousel.map(u=>u?.uid)).size!==9||s.carousel.some(u=>!card(u)||!u.relic||!host.RelicSystem.validRoll(u.relic.roll)||u.claimedBy!==null&&!ids.has(u.claimedBy)))return false;if(!Array.isArray(s.draftOrder)||new Set(s.draftOrder).size!==s.draftOrder.length||s.draftOrder.some(id=>!ids.has(id))||!int(s.draftWave,0,4)||!Number.isFinite(s.draftElapsed)||s.draftElapsed<0)return false;return ids.has('human');
 }
 function pendingResults(){try{const rows=JSON.parse(host.localStorage.getItem(PENDING_KEY)||'[]');return Array.isArray(rows)?rows.filter(s=>s?.finished&&!s.paid&&!s.abandoned&&validate(s)).slice(0,16):[];}catch(_){return[];}}
 function save(s){try{if(!validate(s)||s.abandoned)throw Error('Invalid Auto Chess state.');if(!s.finished)return true;const rows=pendingResults().filter(row=>row.id!==s.id);if(!s.paid){if(rows.length>=16)return false;rows.push(clone(s));}if(rows.length)host.localStorage.setItem(PENDING_KEY,JSON.stringify(rows));else host.localStorage.removeItem(PENDING_KEY);return true;}catch(_){return false;}}
 function purgeCheckpoint(){try{const old=JSON.parse(host.localStorage.getItem(KEY)||'null');if(old?.finished&&!old.paid&&!old.abandoned&&validate(old)&&!save(old))return false;host.localStorage.removeItem(KEY);return true;}catch(_){return clear();}}
 function load(){purgeCheckpoint();return null;}
 // Startup invalidates the former recovery key; Worker runtimes have no storage.
 if(host.document)purgeCheckpoint();

 host.AutoChessSystem=Object.freeze({KEY,PENDING_KEY,RULES,RARITIES,COSTS,XP,ODDS,card,pools,clone,random,seedOf,choose,uniform,teamCap,tier,price,create,player,lastStandSpent,consumeLastStand,reconcileTactician,damageTactician,placeEliminated,get,alive,deployed,freeBench,unit,relic,stash,drain,acquire,shop,economyRound,earn,spend,bonus,xpCost,creepRelics,streakResult,income,levelUp,buy,move,sell,soloCombat,combatForge,fusionEligible,fusionGroup,fuse,autoFuse,equip,canFuseRelics,fuseRelics,roundKind,label,carousel,released,draft,plan,advance,finishAtLimit,apply,PLACEMENT_REWARDS,reward,validReward,groupLocked,finalize,clear,validate,save,load,pendingResults,purgeCheckpoint});
})(window);
