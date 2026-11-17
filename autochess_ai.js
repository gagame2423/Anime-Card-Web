/* Rank 4+ decision policies. Low-rank bot functions remain in autochess_bots.js. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,S=host.AutoChessSynergies,A=host.AutoChessAugments,R=host.RelicSystem;
 const skill=p=>Number.isInteger(p.aiTier)?p.aiTier:0,tags=c=>[c.element,...c.category],has=(c,t)=>c.element===t||c.category.includes(t),ranged=c=>host.AutoChessBots.ranged(c);
 const metaCache=new Map();
 function quality(card){if(metaCache.has(card.id))return metaCache.get(card.id);const text=card.passive?.description||'',score=2+C.RARITIES.indexOf(card.rarity)*2.4+(R.hasFollowUp(card)?1.7:0)+(/all enemies|ALL enemies/i.test(text)?1.1:0)+(/revive|fatal hit|fatal damage/i.test(text)?1:0);metaCache.set(card.id,score);return score;}
 function cores(p,commit=false){
  if(Array.isArray(p.coreTraits)&&p.coreTraits.length>=2)return p.coreTraits;
  const counts=new Map(),seen=new Set();for(const u of p.units){const c=C.card(u);if(seen.has(c.id))continue;seen.add(c.id);for(const t of tags(c))counts.set(t,(counts.get(t)||0)+1);}
  const preferred=host.AutoChessBots.profile(p).trait,list=[...counts].map(([id,n])=>({id,n,score:n+(id===preferred?1.4:0)})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)),categories=list.filter(t=>S.definition(t.id)?.type==='category'),elements=list.filter(t=>S.definition(t.id)?.type==='element'),chosen=[];
  if(categories[0])chosen.push(categories[0].id);if(elements[0]?.n>=2)chosen.push(elements[0].id);
  for(const t of categories)if(chosen.length<3&&!chosen.includes(t.id))chosen.push(t.id);if(!chosen.length)chosen.push(preferred);
  if(commit&&p.units.length>=3)p.coreTraits=chosen;return chosen;
 }
 function score(p,id){
  const c=C.card(id);if(!c)return-Infinity;const high=skill(p)>=7,field=C.deployed(p),desired=cores(p),crests=A.traits(p),ids=new Set(field.map(u=>u.cardId));let value=quality(c);
  for(const tag of desired)if(has(c,tag)){const n=new Set(field.filter(u=>u.cardId!==id&&has(C.card(u),tag)).map(u=>u.cardId)).size+(crests[tag]||0),tier=Math.min(4,Math.floor(n/2));value+=(high?3.8:2.8)+(n%2===1?(high?5:3):0)+(tier>=2&&high?2:0);}
  if(ids.has(id))value-=high?3:1.4;
  const frontline=field.filter(u=>!ranged(C.card(u))).length;if(!ranged(c)&&frontline<Math.max(1,Math.floor(p.level/3)))value+=2.2;
  if(c.category.includes('Supporter')&&!field.some(u=>C.card(u).category.includes('Supporter')))value+=1.2;
  return value;
 }
 function objective(p,units){
  const high=skill(p)>=7,desired=cores(p),counts=new Map(),seen=new Set(),crests=A.traits(p);let value=0,front=0,back=0;
  for(const u of units){const c=C.card(u);value+=quality(c);if(ranged(c))back++;else front++;if(seen.has(c.id)){value-=high?3:1.3;continue;}seen.add(c.id);for(const t of tags(c))counts.set(t,(counts.get(t)||0)+1);}
  for(const [tag,real]of counts){const n=real+(crests[tag]||0),tier=Math.min(4,Math.floor(n/2));value+=desired.includes(tag)?tier*tier*(high?2:1.35)+(n%2?.55:0):tier*.5;}
  if(front>=Math.max(1,Math.floor(units.length/3)))value+=3;else value-=3;if(back)value+=2;return value;
 }
 function arrange(s,p){
  const candidates=p.units.filter(u=>!p.anvil.includes(u.uid)),selected=[];
  while(selected.length<p.level&&candidates.length){candidates.sort((a,b)=>objective(p,[...selected,b])-objective(p,[...selected,a])||a.uid.localeCompare(b.uid));selected.push(candidates.shift());}
  if(skill(p)>=7)for(let pass=0;pass<2;pass++){let improvement=null,best=objective(p,selected);for(let i=0;i<selected.length;i++)for(const incoming of candidates){const trial=selected.slice();trial[i]=incoming;const q=objective(p,trial);if(q>best+.001){best=q;improvement={i,incoming};}}if(!improvement)break;const old=selected[improvement.i];selected[improvement.i]=improvement.incoming;candidates.splice(candidates.indexOf(improvement.incoming),1);candidates.push(old);}
  const high=skill(p)>=7,areaThreat=high&&C.alive(s).some(other=>other!==p&&C.deployed(other).some(u=>/all enemies|ALL enemies/i.test(C.card(u).passive?.description||''))),front=areaThreat?[1,5,3,0,6,2,4,8,12,10,7,13,9,11]:[3,2,4,1,5,0,6,10,9,11,8,12,7,13],back=areaThreat?[21,27,23,25,24,22,26,14,20,16,18,17,15,19]:[24,23,25,22,26,21,27,17,16,18,15,19,14,20],used=new Set();
  const toughness=u=>{const c=C.card(u);return c.stats.hp/Math.max(1,c.stats.atk)+(c.category.includes('Brutal')?2:0);};
  selected.sort((a,b)=>Number(ranged(C.card(a)))-Number(ranged(C.card(b)))||(ranged(C.card(a))?quality(C.card(b))-quality(C.card(a)):toughness(b)-toughness(a))||a.uid.localeCompare(b.uid));
  for(const u of selected){const cells=ranged(C.card(u))?back:front;u.board=cells.find(cell=>!used.has(cell));u.bench=null;u.reserve=false;used.add(u.board);}
  let bench=0;for(const u of p.units.filter(u=>!selected.includes(u))){u.board=null;u.bench=bench<9?bench++:null;u.reserve=u.bench===null;}C.drain(p);
 }
 function relicValue(relic,u,p){
  const r=relic.roll,c=C.card(u),matching=R.matchingUnit({card:c,relic:r},r),tank=!ranged(c)&&c.stats.hp/c.stats.atk>=7,carry=!c.category.includes('Supporter')||R.hasFollowUp(c);let value=matching?((r.atk||0)*(carry?135:80)+(r.hp||0)*(tank?130:65)+(r.followChance||0)*(R.hasFollowUp(c)?190:0)):0;
  if(r.unique){if(r.kind==='jackal_guns')value+=(r.perEnemyAtk||0)*Math.min(9,p.level||1)*(carry?120:65);if(r.kind==='god_leaf')value+=r.dodge*(tank?155:100);if(r.kind==='nail')value+=(r.critChance*150+r.critDamage*60)*(carry?1.3:.75);if(r.kind==='eternal_eye'&&/burn|black flame/i.test(c.passive?.description||''))value+=22;if(r.kind==='enten_blade')value+=(r.specialBonus||0)*(c.category.includes('Magician')?150:80);if(r.kind==='odm'&&R.hasFollowUp(c))value+=(r.odmChainBonus||0)*260;if(r.kind==='bomb'&&matching)value+=(r.firstAttackBonus||0)*(carry?14:8);if(r.kind==='potara_earring'&&['goku-ssj3','vegeta-ssj2'].includes(c.id)&&['goku-ssj3','vegeta-ssj2'].every(id=>C.deployed(p).some(v=>v.cardId===id)))value+=45;}
  return value;
 }
 // Rectangular Hungarian assignment, with zero-valued dummy slots for no Relic.
 function assignment(values){
  const n=values.length;if(!n)return[];const m=values[0].length,u=Array(n+1).fill(0),v=Array(m+1).fill(0),p=Array(m+1).fill(0),way=Array(m+1).fill(0);
  for(let i=1;i<=n;i++){p[0]=i;let j0=0;const min=Array(m+1).fill(Infinity),used=Array(m+1).fill(false);do{used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=m;j++)if(!used[j]){const cur=-values[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0;}if(min[j]<delta){delta=min[j];j1=j;}}for(let j=0;j<=m;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else min[j]-=delta;j0=j1;}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);}
  const result=Array(n).fill(-1);for(let j=1;j<=m;j++)if(p[j])result[p[j]-1]=j-1;return result;
 }
 function equip(s,p){
  for(let guard=0;guard<12;guard++){const rows=p.relics.filter(r=>r&&!r.roll.unique),first=rows.find(r=>rows.some(other=>other!==r&&other.roll.rarity===r.roll.rarity));if(!first)break;const other=rows.find(r=>r!==first&&r.roll.rarity===first.roll.rarity);C.fuseRelics(s,p,first.uid,other.uid);}
  const board=C.deployed(p),candidates=[...p.relics.filter(Boolean),...p.units.map(u=>u.relic).filter(Boolean)].sort((a,b)=>a.uid.localeCompare(b.uid)),values=board.map(u=>[...candidates.map(r=>relicValue(r,u,p)),...Array(board.length).fill(0)]),selected=assignment(values),used=new Set();
  for(const u of p.units)u.relic=null;
  board.forEach((u,i)=>{const index=selected[i];if(index<candidates.length&&values[i][index]>0){u.relic=candidates[index];used.add(candidates[index].uid);}});
  const remaining=candidates.filter(r=>!used.has(r.uid));p.relics=Array.from({length:10},(_,i)=>remaining[i]||null);p.loot.unshift(...remaining.slice(10));C.drain(p);
 }
 function tryBoardFusion(s,p){
  if(C.freeBench(p)<0)return false;const bench=p.units.filter(u=>u.board===null&&!u.keep&&!p.anvil.includes(u.uid));
  for(let tier=0;tier<4;tier++){const materials=bench.filter(u=>C.tier(u)===tier);if(materials.length<2)continue;const field=C.deployed(p).filter(u=>C.tier(u)===tier&&!u.keep).sort((a,b)=>score(p,a.cardId)-score(p,b.cardId));if(!field.length)continue;C.move(p,field[0].uid,'bench',C.freeBench(p));C.fuse(s,p,[field[0].uid,...materials.slice(0,2).map(u=>u.uid)]);return true;}return false;
 }
 function plan(s,p,budget=3){
  if(!p.bot||p.hp<=0||s.phase!=='planning')return false;const key=C.label(s),high=skill(p)>=7,profile=host.AutoChessBots.profile(p);
  if(p.botRound!==key){p.botRound=key;p.botActions=0;p.botRerolls=0;p.botXp=0;cores(p,true);}const target=Math.min(9,Math.max(3,s.stage+(high?4:3)));
  for(let step=0;step<budget&&p.botActions<24;step++,p.botActions++){
   arrange(s,p);const desperate=p.hp<(high?45:35),floor=s.stage===1||desperate?0:Math.min(high?30:20,profile.save),field=C.deployed(p),filled=field.length>=p.level;
   if(p.level<target&&p.units.length>p.level&&p.gold>=C.xpCost(p)+(p.level<4?0:floor)&&p.botXp<(high?4:3)){C.apply(s,p.id,{type:'xp'});p.botXp++;continue;}
   const before=p.units.length;C.autoFuse(s,p);if(p.units.length<before)continue;
   if((desperate||s.stage>=3)&&tryBoardFusion(s,p))continue;
   const offers=p.shop.map((id,index)=>({id,index,value:id?score(p,id):-Infinity})).filter(o=>o.id&&C.COSTS[C.RARITIES.indexOf(C.card(o.id).rarity)]<=p.gold).sort((a,b)=>b.value-a.value||a.index-b.index);
   if(offers.length&&C.freeBench(p)>=0&&(p.gold>floor||!filled)){C.buy(s,p,offers[0].index);cores(p,true);continue;}
   if(C.freeBench(p)<0){const rows=p.units.filter(u=>u.board===null&&!u.keep&&!p.anvil.includes(u.uid)).sort((a,b)=>score(p,a.cardId)-score(p,b.cardId));if(rows.length&&offers[0]?.value>score(p,rows[0].cardId)+1){C.sell(p,rows[0].uid);continue;}}
   const free=p.econ.freeRefresh>0;if(filled&&(free||p.botRerolls<profile.rerolls+(high?2:1))&&(free||p.gold>=floor+2)){C.apply(s,p.id,{type:'refresh'});if(!free)p.botRerolls++;continue;}break;
  }
  arrange(s,p);if(high)equip(s,p);else host.AutoChessBots.legacyEquip(s,p);return p.botActions<24;
 }
 function augmentChoice(s,p,armory){
  if(skill(p)<4)return null;const high=skill(p)>=7,desired=cores(p),deployed=C.deployed(p),counts=S.analyze(deployed,A.traits(p));
  const value=id=>{const d=A.get(id),e=d.effects;let q=(e.atk||0)*65+(e.hp||0)*35+(e.speed||0)*65+(e.vamp||0)*90+(e.reduction||0)*100+(e.crit||0)*50+(e.startShield||0)*25+(e.regenWave||0)*180+(e.forge?.count||0)*(e.forge?.rarity==='legendary'?7:4);
   if(e.crest){const n=counts.find(r=>r.id===e.crest)?.count||0,next=Math.min(4,Math.floor((n+(e.crestCount||0))/2)),old=Math.min(4,Math.floor(n/2));q+=(n>0?(next-old)*(high?12:8):0)+(desired.includes(e.crest)?6:0);}
   if(e.gold)q+=Math.min(e.gold,Math.max(0,16-(p.econ?.bonus||0)))*(s.stage<4?.75:.3);if(e.freeRefresh)q+=s.stage<4?6:3;if(e.xpCost&&p.level<9)q+=(9-p.level)*1.3;if(p.hp<35&&(e.hp||e.regenWave))q+=4;return q;
  };
  if(high){const best=Math.max(...armory.options.map(value));if(best<12){const slot=armory.options.map((id,i)=>({i,q:value(id)})).filter(r=>!armory.rerolled[r.i]).sort((a,b)=>a.q-b.q||a.i-b.i)[0];if(slot)A.reroll(s,p,slot.i);}}
  return armory.options.map((id,index)=>({index,q:value(id)})).sort((a,b)=>b.q-a.q||a.index-b.index)[0].index;
 }
 host.AutoChessAI=Object.freeze({skill,cores,score,objective,arrange,relicValue,assignment,equip,plan,augmentChoice});
})(window);
