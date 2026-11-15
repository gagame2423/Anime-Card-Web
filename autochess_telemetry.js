/* Match-local real measurements, committed once per official tactician/round. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,S=host.AutoChessSynergies,owners=new WeakMap(),MAX=Number.MAX_SAFE_INTEGER;
 const count=n=>Number(Math.max(0,Math.min(MAX,Number(n)||0)).toFixed(6)),add=(o,k,n)=>o[k]=count(Math.min(MAX,(o[k]||0)+count(n)));
 const fresh=()=>({placement:null,provisional:false,eliminatedAtStage:null,finalHp:100,finalLevel:1,totalDamageDealt:0,totalDamageTaken:0,totalHealingDone:0,totalShieldingDone:0,totalKills:0,tacticianDamageDealt:0,wins:0,losses:0,longestWinStreak:0,currentWinStreak:0,totalGoldEarned:0,totalGoldSpent:0,totalRefreshes:0,rarityFusionsCount:0,relicsCrafted:0,units:{},synergies:{},rounds:[],finalBoard:[],finalSynergies:[],augments:[],mvpUnit:null});
 function ensure(s,freshMatch=false){
  if(!s?.players)return null;
  if(!s.matchStats||s.matchStats.version!==1)s.matchStats={version:1,startedAt:Date.now(),coverageStart:C.label(s),partial:!freshMatch&&!(s.stage===1&&s.round===1),roundsPlayed:0,roundKeys:[],tacticians:{},finishedAt:null};
  for(const p of s.players){s.matchStats.tacticians[p.id] ||= fresh();owners.set(p,s.matchStats.tacticians[p.id]);}
  return s.matchStats;
 }
 function economy(p,key,n=1){const row=owners.get(p);if(row)add(row,key,n);}
 function info(card,relic=null){return{cardId:card.id,name:card.name,rarity:card.rarity,element:card.element,categories:[...(card.category||[])],image:card.image,highestRarityReached:card.rarity,equippedRelic:relic?C.clone(relic):null};}
 function unitRow(row,card,relic){return row.units[card.id] ||= {...info(card,relic),totalDamageDealt:0,damageBreakdown:{physical:0,ability:0,passive:0,burn:0,otherDot:0},peakRoundDamage:0,totalKills:0,totalHealingDone:0,totalShieldingDone:0,totalHealingAndShield:0,totalDamageTaken:0,roundsDeployed:0};}
 function recorder(){
  const totals=()=>({totalDamageDealt:0,totalDamageTaken:0,totalHealingDone:0,totalShieldingDone:0,totalKills:0,cardGold:0,units:{}}),sides={player:totals(),enemy:totals()},dead=new WeakSet();
  const summoner=u=>u?.companionOwner||u?.championOwner||u?.expansionOwner||u?.hermesOwner||u?.questOwner||u?.reaganOwner||u?.shibuyaOwner||u?.iskandarOwner;
  function owner(u){let next=summoner(u);if(!next)return u;const seen=new Set([u]);for(let depth=0;next&&depth<16&&!seen.has(next);depth++){seen.add(next);u=next;next=summoner(u);}return u;}
  function row(u){if(!u?.card)return null;const root=owner(u),side=root.grid?.side||u.grid?.side;if(!sides[side])return null;return{team:sides[side],unit:unitRow(sides[side],root.card,root.relic),side};}
  function damage(source,target,n,meta={}){
   n=count(n);if(!n)return;const a=row(source),b=row(target);if(target?.hp>0)dead.delete(target);
   if(a){add(a.team,'totalDamageDealt',n);add(a.unit,'totalDamageDealt',n);const kind=meta.dot?(meta.dot==='burn'||meta.kind==='burn'?'burn':'otherDot'):meta.specialAttack?'ability':meta.passiveAttack||source!==owner(source)?'passive':'physical';add(a.unit.damageBreakdown,kind,n);}
   if(b){add(b.team,'totalDamageTaken',n);add(b.unit,'totalDamageTaken',n);}
  }
  function heal(source,target,n,shield=false){if(target?.hp>0)dead.delete(target);const r=row(source||target);if(!r)return;n=count(n);const key=shield?'totalShieldingDone':'totalHealingDone';add(r.team,key,n);add(r.unit,key,n);add(r.unit,'totalHealingAndShield',n);}
  function kill(source,target){if(!target||dead.has(target)||target.hp>0&&!target.defeated)return;dead.add(target);const r=row(source);if(r){add(r.team,'totalKills',1);add(r.unit,'totalKills',1);}}
  function gold(source,n){const r=row(source);if(r)r.team.cardGold=Math.min(2,r.team.cardGold+count(n));}
  function compact(){return Object.fromEntries(Object.entries(sides).map(([side,r])=>[side,{...r,units:Object.fromEntries(Object.entries(r.units).map(([id,u])=>[id,Object.fromEntries(Object.entries(u).filter(([key])=>key.startsWith('total')||key==='damageBreakdown'))]))}]));}
  return{damage,heal,kill,gold,compact,snapshot:()=>C.clone(sides)};
 }
 function commit(s,p,result,round,fieldedPlayer=p){
  ensure(s);const row=s.matchStats.tacticians[p.id];if(row.rounds.includes(round))return false;row.rounds.push(round);
  if(!s.matchStats.roundKeys.includes(round)){s.matchStats.roundKeys.push(round);s.matchStats.roundsPlayed++;}
  for(const key of ['totalDamageDealt','totalDamageTaken','totalHealingDone','totalShieldingDone','totalKills'])add(row,key,result?.[key]);
  const deployed=C.deployed(fieldedPlayer),fielded=new Set(deployed.map(u=>u.cardId));
  for(const u of deployed)unitRow(row,C.card(u),u.relic?.roll||u.relic).equippedRelic=u.relic?C.clone(u.relic.roll||u.relic):null;
  for(const [id,raw]of Object.entries(result?.units||{})){
   const card=C.card(id);if(!card)continue;const u=unitRow(row,card,raw.equippedRelic);if(raw.equippedRelic)u.equippedRelic=C.clone(raw.equippedRelic);
   for(const k of ['totalDamageDealt','totalDamageTaken','totalKills','totalHealingDone','totalShieldingDone','totalHealingAndShield'])add(u,k,raw[k]);
   for(const [k,n]of Object.entries(raw.damageBreakdown||{}))add(u.damageBreakdown,k,n);u.peakRoundDamage=Math.max(u.peakRoundDamage,count(raw.totalDamageDealt));
  }
  for(const id of fielded)row.units[id].roundsDeployed++;
  for(const trait of S.analyze(deployed,host.AutoChessAugments?.traits(fieldedPlayer)))if(trait.tier){const old=row.synergies[trait.id] ||= {id:trait.id,name:trait.name,type:trait.type,icon:trait.icon,roundsActive:0,peakCount:0,peakTier:0,peakTierName:'Inactive'};old.roundsActive++;old.peakCount=Math.max(old.peakCount,trait.count);old.peakTier=Math.max(old.peakTier,trait.tier);old.peakTierName=S.TIERS[old.peakTier];}
  return true;
 }
 function recordResult(s,p,won,damageToEnemy=0){ensure(s);const r=s.matchStats.tacticians[p.id];add(r,won===null?'draws':won?'wins':'losses',1);r.currentWinStreak=won?r.currentWinStreak+1:0;r.longestWinStreak=Math.max(r.longestWinStreak,r.currentWinStreak);add(r,'tacticianDamageDealt',damageToEnemy);}
 function snapshot(s,p,provisional=false,placement=p.rank){
  ensure(s);const r=s.matchStats.tacticians[p.id];r.placement=placement;r.provisional=provisional;r.finalHp=p.hp;r.finalLevel=p.level;
  if(!r.eliminatedAtStage)r.eliminatedAtStage=p.rank===1?'Champion':p.hp<=0?'Stage '+C.label(s):'Surviving at player exit';
  r.finalBoard=C.deployed(p).map(u=>({...info(C.card(u),u.relic?.roll||u.relic),uid:u.uid,board:u.board}));
  r.finalSynergies=S.analyze(C.deployed(p),host.AutoChessAugments?.traits(p)).filter(t=>t.tier).map(t=>({id:t.id,name:t.name,icon:t.icon,count:t.count,tier:t.tier,tierName:t.tierName,type:t.type}));
  r.augments=(p.augments||[]).map(id=>{const a=host.AutoChessAugments?.get(id);return a?{id,name:a.name,tier:a.tier,description:a.description}:null;}).filter(Boolean);
  r.mvpUnit=Object.values(r.units).filter(u=>u.totalDamageDealt>0).sort((a,b)=>b.totalDamageDealt-a.totalDamageDealt||a.cardId.localeCompare(b.cardId))[0]||null;
 }
 function finish(s){ensure(s);const used=new Set(s.players.map(p=>p.rank).filter(Boolean)),live=s.players.filter(p=>p.rank===null).sort((a,b)=>b.hp-a.hp||b.level-a.level||b.gold-a.gold||a.id.localeCompare(b.id));const free=Array.from({length:8},(_,i)=>i+1).filter(n=>!used.has(n));for(const p of s.players)snapshot(s,p,p.rank===null,p.rank??free[live.indexOf(p)]);s.matchStats.finishedAt ||= Date.now();}
 function valid(s){const m=s.matchStats;if(m==null)return true;if(m.version!==1||!m.tacticians||!Array.isArray(m.roundKeys)||m.roundKeys.length>600)return false;return s.players.every(p=>{const r=m.tacticians[p.id];return r&&r.units&&r.synergies&&Array.isArray(r.rounds)&&Object.values(r.units).every(u=>C.card(u.cardId)&&Number.isFinite(u.totalDamageDealt)&&u.totalDamageDealt>=0)&&['totalGoldEarned','totalGoldSpent','totalDamageDealt','totalDamageTaken','totalHealingDone','totalShieldingDone','totalKills'].every(k=>Number.isFinite(r[k])&&r[k]>=0);});}
 host.AutoChessTelemetry=Object.freeze({ensure,economy,recorder,commit,recordResult,snapshot,finish,valid,info});
})(window);
