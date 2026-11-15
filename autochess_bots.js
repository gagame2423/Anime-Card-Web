/* Phase 3: seven economy-driven opponents, fair pairings and simultaneous standings. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,S=host.AutoChessSynergies;
 const PERSONALITIES=Object.freeze([
  {name:'Mr Win',style:'Interest Keeper',trait:'Human',save:40,rerolls:0,xp:1},
  {name:'Ms Willy',style:'Aggressive Reroller',trait:'Brutal',save:8,rerolls:3,xp:0},
  {name:'CHV',style:'Synergy Scholar',trait:'Magician',save:20,rerolls:2,xp:1},
  {name:'Jusi',style:'Tempo Captain',trait:'Electric',save:12,rerolls:1,xp:2},
  {name:'Crosshair',style:'Dark Specialist',trait:'Bleach',save:20,rerolls:2,xp:1},
  {name:'Maid Girl',style:'Support Curator',trait:'Supporter',save:25,rerolls:1,xp:1},
  {name:'Blox Fruit Kid',style:'Frontline Builder',trait:'Titan',save:15,rerolls:1,xp:2}
 ].map(Object.freeze));
 const ranged=c=>(c?.category||[]).some(x=>['Gunner','Magician','Supporter'].includes(x));
 function initialize(s){for(const[p,i]of s.players.filter(p=>p.bot).map((p,i)=>[p,i])){p.name=PERSONALITIES[i].name;p.personality=i;p.aiTier=Number.isInteger(s.rankedStart?.tier)?s.rankedStart.tier:0;p.botActions=0;p.botRound='';}return s;}
 function profile(p){return PERSONALITIES[p.personality??0];}
 function score(p,id){if((p.aiTier||0)>=4)return host.AutoChessAI.score(p,id);const c=C.card(id),r=C.RARITIES.indexOf(c.rarity),d=profile(p),units=C.deployed(p),tags=[c.element,...c.category];let synergy=0;for(const tag of tags){const n=(host.AutoChessAugments?.traits(p)?.[tag]||0)+new Set(units.filter(u=>u.cardId!==id&&[C.card(u).element,...C.card(u).category].includes(tag)).map(u=>u.cardId)).size;synergy+=n%2===1?1.4:n*.15;}return 2+r*2+synergy+(tags.includes(d.trait)?3:0)+(c.category.includes('Supporter')&&!units.some(u=>C.card(u).category.includes('Supporter'))?1.5:0);}
 function arrange(s,p){if((p.aiTier||0)>=4)return host.AutoChessAI.arrange(s,p);
  const selected=[],candidates=p.units.slice();for(let i=0;i<p.level&&candidates.length;i++){const proxy={...p,units:selected.map(u=>({...u,board:0}))};candidates.sort((a,b)=>score(proxy,b.cardId)-score(proxy,a.cardId)||a.uid.localeCompare(b.uid));selected.push(candidates.shift());}
  const front=[3,2,4,1,5,0,6,10,9,11,8,12,7,13],back=[24,23,25,22,26,21,27,17,16,18,15,19,14,20],used=new Set();
  for(const u of selected){const cells=ranged(C.card(u))?back:front,cell=cells.find(i=>!used.has(i))??Array.from({length:28},(_,i)=>i).find(i=>!used.has(i));u.board=cell;u.bench=null;u.reserve=false;used.add(cell);}
  let bench=0;for(const u of p.units.filter(u=>!selected.includes(u))){u.board=null;u.bench=bench<9?bench++:null;u.reserve=u.bench===null;}C.drain(p);
 }
 function equip(s,p){if((p.aiTier||0)>=7)return host.AutoChessAI.equip(s,p);return legacyEquip(s,p);}
 function legacyEquip(s,p){
  // Compress the stash before selecting carries; never use permanent Relic instances.
  for(let guard=0;guard<10;guard++){const pair=p.relics.filter(Boolean).find(r=>!r.roll.unique&&p.relics.some(x=>x&&x!==r&&!x.roll.unique&&x.roll.rarity===r.roll.rarity));if(!pair)break;const other=p.relics.find(x=>x&&x!==pair&&!x.roll.unique&&x.roll.rarity===pair.roll.rarity);C.fuseRelics(s,p,pair.uid,other.uid);}
  const carries=C.deployed(p).slice().sort((a,b)=>C.tier(b)-C.tier(a)||a.uid.localeCompare(b.uid));
  for(const u of carries){if(u.relic)continue;const r=p.relics.filter(Boolean).sort((a,b)=>relicScore(b,u)-relicScore(a,u))[0];if(r)C.equip(p,r.uid,u.uid);}
 }
 function relicScore(r,u){const d=host.RelicSystem.DEFINITIONS.find(x=>x.kind===r.roll.kind),c=C.card(u),matches=d.category?c.category.includes(d.category):c.element===r.roll.element;return(matches?4:0)+(['common','rare','legendary'].indexOf(r.roll.rarity)+1)+(r.roll.unique?4:0);}
 function plan(s,p,budget=3){if(host.AutoChessOnline?.replay(p))return;if((p.aiTier||0)>=4)return host.AutoChessAI.plan(s,p,budget);
  if(!p.bot||p.hp<=0||s.phase!=='planning')return false;const key=C.label(s),d=profile(p);if(p.botRound!==key){p.botRound=key;p.botActions=0;p.botRerolls=0;p.botXp=0;}
  for(let step=0;step<budget&&p.botActions<24;step++,p.botActions++){
   arrange(s,p);
   const target=Math.min(9,Math.max(2,s.stage+2)),floor=p.hp<35?0:d.save;
   if(p.level<target&&p.botXp<d.xp+1&&p.gold>=C.xpCost(p)+(p.level<3?0:floor)){C.apply(s,p.id,{type:'xp'});p.botXp++;continue;}
   const offers=p.shop.map((id,index)=>({id,index,value:id?score(p,id):-1})).filter(o=>o.id&&C.COSTS[C.RARITIES.indexOf(C.card(o.id).rarity)]<=p.gold).sort((a,b)=>b.value-a.value||a.index-b.index);
   const slots=C.freeBench(p)>=0,filled=C.deployed(p).length>=p.level;
   if(offers.length&&slots&&(p.gold>floor||!filled||s.stage===1)){C.buy(s,p,offers[0].index);C.autoFuse(s,p);continue;}
   if(!slots){const rows=p.units.filter(u=>u.board===null&&!u.keep);const groups=C.RARITIES.slice(0,5).map((_,i)=>rows.filter(u=>C.tier(u)===i)).find(a=>a.length>=3);if(groups){C.fuse(s,p,groups.slice(0,3).map(u=>u.uid));continue;}if(offers[0]&&rows.length){rows.sort((a,b)=>score(p,a.cardId)-score(p,b.cardId));if(offers[0].value>score(p,rows[0].cardId)+1){C.sell(p,rows[0].uid);continue;}}}
   if((p.econ.freeRefresh>0||p.botRerolls<d.rerolls)&&(p.econ.freeRefresh>0||p.gold>=floor+2)&&filled){const free=p.econ.freeRefresh>0;C.apply(s,p.id,{type:'refresh'});if(!free)p.botRerolls++;continue;}break;
  }
  arrange(s,p);equip(s,p);return p.botActions<24;
 }
 function draft(s,p){if(!C.released(s,p.id)||s.carousel.some(u=>u.claimedBy===p.id))return null;const options=s.carousel.filter(u=>!u.claimedBy);const itemValue=u=>(p.aiTier||0)>=7?host.AutoChessAI.relicValue(u.relic,u,p):relicScore(u.relic,u);options.sort((a,b)=>score(p,b.cardId)+itemValue(b)-score(p,a.cardId)-itemValue(a)||a.uid.localeCompare(b.uid));if(options[0]){const u=C.draft(s,p,options[0].uid);arrange(s,p);return u;}return null;}
 function pair(s){
  const living=C.alive(s).slice();for(let i=living.length-1;i>0;i--){const j=Math.floor(C.random(s)*(i+1));[living[i],living[j]]=[living[j],living[i]];}
  let ghost=null;if(living.length%2){const a=living.pop(),options=C.alive(s).filter(p=>p!==a),b=options.sort((x,y)=>(x.history.at(-1)===a.id)-(y.history.at(-1)===a.id)||x.hp-y.hp||x.id.localeCompare(y.id))[0];ghost={a:a.id,b:b.id,ghost:true};}
  function search(list,chosen=[],penalty=0){if(!list.length)return{chosen,penalty};const a=list[0];let best=null;for(let i=1;i<list.length;i++){const b=list[i],n=(a.history.at(-1)===b.id?8:0)+(a.history.slice(-3).includes(b.id)?2:0),r=search(list.filter(p=>p!==a&&p!==b),[...chosen,{a:a.id,b:b.id,ghost:false}],penalty+n);if(!best||r.penalty<best.penalty)best=r;}return best;}
  s.pairs=search(living).chosen;if(ghost)s.pairs.push(ghost);return s.pairs;
 }
 function settle(s,results,rosters={}){
  if(s.phase!=='combat')throw Error('This round is already resolved.');for(const p of s.players)p.anvil=p.anvil.filter(id=>p.units.some(u=>u.uid===id&&u.board===null));const creep=['creep','boss'].includes(C.roundKind(s)),tacticianDamage=2+s.stage*2+(s.stage>=6?(s.stage-5)*3:0),changes=new Map();
  for(const r of results){const a=C.get(s,r.a),b=C.get(s,r.b);if(!a||a.hp<=0)continue;
   const record=(p,won,survivors,opponent)=>{if(r.winner==='draw')won=null;const loss=won!==false?0:tacticianDamage+Math.min(15,survivors);changes.set(p.id,{p,won,damage:loss,opponent,beforeHp:p.hp});};
   if(creep)record(a,r.winner==='player',r.enemySurvivors,'creeps');
   else{record(a,r.winner==='player',r.enemySurvivors,b.id);if(!r.ghost)record(b,r.winner==='enemy',r.playerSurvivors,a.id);}
  }
  for(const r of results){const a=C.get(s,r.a),b=C.get(s,r.b);if(a)host.AutoChessTelemetry?.commit(s,a,r.metrics?.player,C.label(s),rosters[a.id]||a);if(!creep&&!r.ghost&&b)host.AutoChessTelemetry?.commit(s,b,r.metrics?.enemy,C.label(s),rosters[b.id]||b);}
  for(const{p,won,damage,opponent}of changes.values()){
   const r=results.find(r=>r.a===p.id||!r.ghost&&r.b===p.id),side=r?.a===p.id?'player':'enemy',other=changes.get(opponent),dealt=!creep&&!r?.ghost&&other?Math.min(other.beforeHp,other.damage):0;
   host.AutoChessTelemetry?.recordResult(s,p,won,dealt);
   p.hp=Math.max(0,p.hp-damage);C.income(s,p,won,creep);
   const moneyPassive=C.deployed(rosters[p.id]||p).some(u=>/(nami|bounty-hunter)/.test(u.cardId));C.bonus(s,p,(r?.metrics?.[side]?.cardGold||0)+(won&&moneyPassive?1:0),'card');
   if(!creep){p.history.push(opponent);p.history=p.history.slice(-3);const trait=S.analyze(C.deployed(rosters[p.id]||p),host.AutoChessAugments?.traits(rosters[p.id]||p)).find(r=>r.id==='Villian'&&r.tier);if(won&&trait)C.bonus(s,p,Math.min(3,trait.tier),'synergy');}
   if(creep){C.creepRelics(s,p);if(won)C.bonus(s,p,Math.min(3,s.stage),'creep');}
  }
  const eliminated=[...changes.values()].filter(v=>!v.p.hp).sort((a,b)=>b.damage-a.damage||a.p.id.localeCompare(b.p.id));let rank=s.players.filter(p=>p.rank===null).length;for(const v of eliminated){v.p.rank=rank--;host.AutoChessTelemetry?.snapshot(s,v.p);}
  if(s.stage===100&&s.round===6&&C.alive(s).length>1){s.lastResults=results;C.finishAtLimit(s);return s;}
  const living=C.alive(s);if(living.length<=1){if(living[0])living[0].rank=1;else{const survivor=s.players.find(p=>p.rank===1);if(survivor)survivor.hp=1;}s.finished=true;s.phase='complete';}else{s.phase='results';s.remaining=C.RULES.resultSeconds;}
  s.lastResults=results;C.finalize(s);s.revision++;return s;
 }
 const reward=(rank,multipliers)=>C.reward(rank,multipliers);
 host.AutoChessBots=Object.freeze({PERSONALITIES,initialize,profile,score,arrange,equip,legacyEquip,augmentChoice:(s,p,a)=>host.AutoChessAI.augmentChoice(s,p,a),plan,draft,pair,settle,reward,ranged});
})(window);
