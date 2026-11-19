/* Seeded Armories, ISO-week featured signatures and capped match-only economy. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,TIERS=['Silver','Gold','Prismatic'],ROUNDS=['2-1','3-2','4-2'];
 function getCurrentAugmentWeekKey(at=Date.now()){
  const date=new Date(at);if(!Number.isFinite(date.getTime()))throw Error('Invalid augment date.');
  const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));const year=d.getUTCFullYear(),start=new Date(Date.UTC(year,0,1)),week=Math.ceil((((d-start)/86400000)+1)/7);return year+'-W'+String(week).padStart(2,'0');
 }
 const ECONOMY_FAMILIES=Object.freeze(['pocket-change','trade-route','efficient-study','hedge-fund','golden-ticket','clear-mind','birthday-present']);
 const WEEKLIES=Object.freeze(['soul-reaper-overdrive','relic-transmuter','prismatic-vanguard','tempest-conductor','gold-rush']);
 function featured(week=getCurrentAugmentWeekKey()){const m=/^(\d{4})-W(\d{2})$/.exec(week);if(!m)throw Error('Invalid augment week.');const d=new Date(Date.UTC(+m[1],0,4));d.setUTCDate(d.getUTCDate()-(d.getUTCDay()||7)+1+(+m[2]-1)*7);const index=Math.floor(d.getTime()/(7*86400000));return WEEKLIES[((index%WEEKLIES.length)+WEEKLIES.length)%WEEKLIES.length];}
 const families=[
  ['vitality','Vitality Matrix','Combat',i=>({hp:[.16,.28,.42][i]})],
  ['sharp-edges','Sharp Edges','Combat',i=>({atk:[.12,.22,.34][i]})],
  ['overclock','Overclock','Combat',i=>({speed:[.12,.22,.35][i]})],
  ['second-wind','Second Wind','Combat',i=>({regenWave:[.03,.05,.075][i]})],
  ['aegis','Aegis Formation','Combat',i=>({startShield:[.18,.30,.50][i]})],
  ['blood-drinker','Blood Drinker','Combat',i=>({vamp:[.07,.12,.18][i]})],
  ['precision','Calculated Strikes','Combat',i=>({crit:[.10,.18,.28][i]})],
  ['ward','Arcane Ward','Combat',i=>({reduction:[.06,.10,.16][i]})],
  ...['Swordman','Magician','Supporter','Human','Fire','Dark'].map(trait=>['crest-'+trait.toLowerCase(),trait+' Crest','Trait',i=>({crest:trait,crestCount:i+1})]),
  ['relic-forge','Relic Forge','Forge',i=>({forge:{rarity:i===0?'rare':'legendary',count:i===1?1:2}})],
  ['pocket-change','Pocket Change','Economy',i=>({gold:[9,10,12][i]})],
  ['trade-route','Trade Route','Economy',i=>({freeRefresh:[1,2,2][i],gold:[2,3,4][i]})],
  ['efficient-study','Efficient Study','Economy',i=>({xpCost:3,xp:[3,6,9][i]})],
  ['soul-reaper-overdrive',"Soul Reaper’s Overdrive",'Weekly',i=>({atk:[.12,.20,.30][i],crest:'Bleach',crestCount:1,killHeal:[.12,.20,.30][i]})],
  ['relic-transmuter','Relic Transmuter','Weekly',i=>({forge:{rarity:i===0?'rare':'legendary',count:i===2?2:1},startShield:[.10,.18,.25][i]})],
  ['prismatic-vanguard','Prismatic Vanguard','Weekly',i=>({hp:[.20,.35,.55][i],reduction:[.04,.07,.10][i]})],
  ['tempest-conductor','Tempest Conductor','Weekly',i=>({speed:[.14,.24,.38][i],crest:'Electric',crestCount:1})],
  ['lineage',['Lineage Spark','Bloodline Synthesis','Sovereign Ascension'],'Forge',i=>({fusionCategoryChance:[.25,.40,.50][i]})],
  ['hedge-fund',['Rainy Day Fund','Rich Get Richer','Hedge Fund'],'Economy',i=>({interestCap:[6,7,9][i],gold:[3,5,8][i]})],
  ['golden-ticket',['Ticket Booth','Trade Sector','Golden Ticket'],'Economy',i=>({freeRefresh:[1,2,2][i],rerollRefund:[.12,.19,.30][i]})],
  ['clear-mind',['Clear Mind','Focused Scholar','Perfect Clarity'],'Economy',i=>({emptyBenchXp:[2,3,4][i]})],
  ['birthday-present',['Birthday Present','Gifted Scholar','Level Up!'],'Economy',i=>({buyXpBonus:[1,2,3][i],giftRarity:[1,1,2][i]})],
  ['cybernetic',['Cybernetic Implants','Cybernetic Uplink','Cybernetic Ascension'],'Combat',i=>({relicHp:[250,500,850][i],relicAtk:[.12,.22,.35][i]})],
  ['bulwark',['Bulwark','Lonely Guardian','Unbroken Bastion'],'Combat',i=>({soloShield:[.50,.90,1.40][i],soloReduction:[.08,.12,.18][i]})],
  ['thrill-hunt',['Thrill of the Hunt',"Predator's Triumph",'Apex Feast'],'Combat',i=>({killHeal:[.15,.25,.40][i],killAtk:[.05,.08,.12][i],killShield:[.10,.20,.30][i]})],
  ['phalanx',['Unified Resistance','Phalanx','Diamond Phalanx'],'Combat',i=>({rowReduction:[.03,.05,.07][i],rowAtk:[.04,.07,.10][i]})],
  ['glass-cannon',['Glass Cannon','Fragile Supremacy','Forbidden Power'],'Combat',i=>({damage:[.20,.35,.55][i],hpPenalty:[.10,.18,.25][i],noShields:i>0})],
  ['built-different',['Built Different I','Built Different II','Built Different III'],'Combat',i=>({differentHp:[.40,.75,1.10][i],differentAtk:[.30,.50,.80][i],differentSpeed:[.10,.20,.30][i]})],
  ['tactician-crown',['New Recruit',"Tactician's Crown","Sovereign's Retinue"],'Trait',i=>({bonusSlots:i===2?2:1,hp:[.05,.10,.15][i]})],
  ['last-stand',['Last Stand','Defiant Heart','Immortal Tactician'],'Combat',i=>({lastStandHp:[.30,.50,.80][i],lastStandAtk:[.20,.35,.50][i]})]
 ];
 const pct=n=>Number((n*100).toFixed(2))+'%';
 function describe(e){return[
  e.hp&&'All allies: +'+pct(e.hp)+' max HP.',e.atk&&'All allies: +'+pct(e.atk)+' ATK.',e.speed&&'All allies: +'+pct(e.speed)+' attack speed.',
  e.vamp&&'All allies: +'+pct(e.vamp)+' omnivamp.',e.crit&&'All allies: +'+pct(e.crit)+' crit chance.',e.reduction&&'All allies: +'+pct(e.reduction)+' damage reduction.',
  e.startShield&&'Battle start: Shield allies for '+pct(e.startShield)+' max HP.',e.regenWave&&'Every 4 seconds: heal allies for '+pct(e.regenWave)+' max HP.',e.killHeal&&'On a kill: heal '+pct(e.killHeal)+' max HP.',
  e.crest&&'+'+e.crestCount+' '+e.crest+' trait count while at least one real '+e.crest+' unit is deployed.',
  e.forge&&'Once: gain '+e.forge.count+' '+e.forge.rarity+' Relic'+(e.forge.count>1?'s':'')+'.',e.gold&&'Once: +'+e.gold+' Gold (within the round bonus cap).',
  e.freeRefresh&&e.freeRefresh+' free Shop Refresh'+(e.freeRefresh>1?'es':'')+' each planning round; unused refreshes never accumulate.',e.xpCost&&'Buy XP costs 3g, never stacks below 3g. Once: +'+e.xp+' XP.',
  e.fusionCategoryChance&&'When fusing 3 units into a higher rarity, '+pct(e.fusionCategoryChance)+' chance to preserve a shared Category. Try common Categories first, then any input Category. Every eligible card is equally likely; no matches falls back to the full tier.',
  e.interestCap&&'Interest cap: +'+e.interestCap+'g at '+(e.interestCap*10)+'g saved. All bonus Gold still shares the 16g/round cap.',
  e.rerollRefund&&'Paid Shop Refreshes have a '+pct(e.rerollRefund)+' chance to refund 2g, only while at least 2g of the round bonus cap remains. Free Refreshes cannot refund.',
  e.emptyBenchXp&&'After each completed combat round, gain +'+e.emptyBenchXp+' XP if no units are on the bench or reserve. Once per round.',
  e.buyXpBonus&&'Buy XP grants +'+e.buyXpBonus+' extra XP. Each future level gained grants one random '+C.RARITIES[e.giftRarity]+' unit; a full bench uses reserve.',
  e.relicHp&&'Allies holding a Relic start each combat with +'+e.relicHp+' max HP and +'+pct(e.relicAtk)+' ATK.',
  e.soloShield&&'If exactly one living starter occupies your front row, that unit gains a '+pct(e.soloShield)+' max HP Shield and +'+pct(e.soloReduction)+' damage reduction for the fight.',
  e.killAtk&&'On a kill: +'+pct(e.killAtk)+' ATK (up to 5 stacks per combat) and Shield for '+pct(e.killShield)+' max HP.',
  e.rowReduction&&'Each starter gains +'+pct(e.rowReduction)+' damage reduction and +'+pct(e.rowAtk)+' ATK per other living starter in the same starting row, capped at 3 neighbors. Locked at combat start.',
  e.damage&&'All allied damage: +'+pct(e.damage)+'. All allies: -'+pct(e.hpPenalty)+' max HP.'+(e.noShields?' Your team cannot gain Shields by any means.':''),
  e.differentHp&&'Starters with no active Category OR Element trait gain +'+pct(e.differentHp)+' max HP, +'+pct(e.differentAtk)+' ATK and +'+pct(e.differentSpeed)+' attack speed. Checked at combat start; Augment crests count.',
  e.bonusSlots&&'Deploy +'+e.bonusSlots+' additional unit'+(e.bonusSlots>1?'s':'')+' (maximum 11). Tactician Level and Shop odds stay unchanged.',
  e.lastStandHp&&'Once per match, survive lethal tactician combat damage at 1 HP. Afterwards, your team permanently gains +'+pct(e.lastStandHp)+' max HP and +'+pct(e.lastStandAtk)+' ATK. Does not prevent abandonment.'
 ].filter(Boolean).join(' ');}
 const DEFINITIONS=Object.freeze(families.flatMap(([family,name,kind,fn])=>TIERS.map((tier,i)=>{const effects=fn(i),weeklyRotation=kind==='Weekly'||ECONOMY_FAMILIES.includes(family);return Object.freeze({id:family+'_'+tier.toLowerCase(),family,name:Array.isArray(name)?name[i]:name,tier,kind,weeklyRotation,rotation:weeklyRotation?(kind==='Economy'?'gold-rush':family):null,effects:Object.freeze(effects),description:describe(effects)});}))),byId=new Map(DEFINITIONS.map(a=>[a.id,a]));
 const get=id=>byId.get(id),rotationCache=new Map();
 function rotation(s=null){const week=typeof s==='string'?s:s?.augmentWeek||getCurrentAugmentWeekKey(),id=typeof s==='object'&&s?.weeklyAugment?s.weeklyAugment:featured(week),economy=id==='gold-rush';const key=week+'/'+id;if(!rotationCache.has(key)){if(rotationCache.size>=32)rotationCache.delete(rotationCache.keys().next().value);rotationCache.set(key,Object.freeze({id,week,label:economy?'Gold Rush':get(id+'_gold')?.name||'Weekly Rotation',economy,featured:economy?'hedge-fund':id,families:economy?ECONOMY_FAMILIES:Object.freeze([id])}));}return rotationCache.get(key);}
 function available(s,a){return!!a&&(!a.weeklyRotation||rotation(s).families.includes(a.family));}
 function poolLabel(s,a){return!a.weeklyRotation?'Default Pool':available(s,a)?(s?'Weekly Rotation · Active This Match':'Weekly Rotation · Active This Week'):a.kind==='Economy'?'Weekly Rotation · Gold Rush Only':'Weekly Rotation · Not Active';}
 function schedule(week=getCurrentAugmentWeekKey(),count=5){const m=/^(\d{4})-W(\d{2})$/.exec(week);if(!m)throw Error('Invalid augment week.');const d=new Date(Date.UTC(+m[1],0,4));d.setUTCDate(d.getUTCDate()-(d.getUTCDay()||7)+1+(+m[2]-1)*7);return Array.from({length:Math.min(10,Math.max(1,count))},(_,i)=>rotation(getCurrentAugmentWeekKey(d.getTime()+i*7*86400000)));}
 const effectCache=new WeakMap(),additive=['atk','hp','speed','vamp','crit','reduction','startShield','regenWave','killHeal','buyXpBonus','emptyBenchXp','relicHp','relicAtk','soloShield','soloReduction','killAtk','killShield','rowReduction','rowAtk','damage','hpPenalty','differentHp','differentAtk','differentSpeed'];
 const emptyEffects={freeRefresh:0,xpCost:4,interestCap:5,bonusSlots:0,fusionCategoryChance:0,rerollRefund:0,giftRarity:-1,noShields:false,lastStandHp:0,lastStandAtk:0};for(const k of additive)emptyEffects[k]=0;Object.freeze(emptyEffects);
 function effects(p){
  if(!p?.augments?.length)return emptyEffects;
  const key=(p?.augments||[]).join('|')+'/'+C.lastStandSpent(p),cached=p&&effectCache.get(p);if(cached?.key===key)return cached.value;
  const e={...emptyEffects};
  for(const id of p?.augments||[]){const a=get(id);if(!a)continue;const d=a.effects;for(const k of additive)e[k]+=d[k]||0;
   for(const k of ['freeRefresh','interestCap','bonusSlots','fusionCategoryChance','rerollRefund','lastStandHp','lastStandAtk'])e[k]=Math.max(e[k],d[k]||0);
   if(Number.isInteger(d.giftRarity))e.giftRarity=Math.max(e.giftRarity,d.giftRarity);e.noShields ||= !!d.noShields;e.xpCost=Math.min(e.xpCost,d.xpCost||4);
  }
  if(C.lastStandSpent(p)){e.hp+=e.lastStandHp;e.atk+=e.lastStandAtk;}
  Object.freeze(e);if(p)effectCache.set(p,{key,value:e});return e;
 }
 function onLevel(s,p,from){
  const e=effects(p);if(e.giftRarity<0)return;const state=p.augmentState ||= {};state.giftedLevels ||= [];
  for(let level=from+1;level<=p.level;level++){if(state.giftedLevels.includes(level))continue;state.giftedLevels.push(level);
   if(p.units.length>=100){C.bonus(s,p,C.COSTS[e.giftRarity],'augment');continue;}
   const result=C.acquire(p,C.unit(s,C.uniform(s,C.poolFor(s,p,e.giftRarity))));p.lastAugmentGift={round:C.label(s),level,uid:result.uid,cardId:result.cardId};
  }
 }
 function endRound(s,p){
  const e=effects(p);if(!e.emptyBenchXp||p.units.some(u=>u.board===null)||p.level>=9)return;
  const state=p.augmentState ||= {},key=C.label(s);if(state.xpRound===key)return;state.xpRound=key;p.xp+=e.emptyBenchXp;C.levelUp(p,s);p.lastAugmentXp={round:key,xp:e.emptyBenchXp};
 }
 function lastStand(s,p){
  if(p.hp>0||p.eliminated||p.rank!=null||C.lastStandSpent(p)||!effects(p).lastStandHp)return false;
  C.consumeLastStand(p);p.hp=1;p.lastStandRound ||= C.label(s);return true;
 }
 function traits(p){const result={};for(const id of p?.augments||[]){const e=get(id)?.effects;if(e?.crest)result[e.crest]=(result[e.crest]||0)+e.crestCount;}return result;}
 function initialize(s){s.augmentWeek ||= getCurrentAugmentWeekKey();s.weeklyAugment ||= featured(s.augmentWeek);s.armories ||= {};for(const p of s.players){p.augments ||= [];C.reconcileTactician(p);}}
 function pool(s,p,tier){const owned=new Set((p.augments||[]).map(id=>get(id)?.family));return DEFINITIONS.filter(a=>a.tier===tier&&!owned.has(a.family)&&available(s,a));}
 function draw(s,p,tier,excluded=[]){const options=pool(s,p,tier).filter(a=>!excluded.includes(a.id)),signature=rotation(s).featured,weights=options.map(a=>a.family===signature?4:1);let roll=C.random(s)*weights.reduce((a,b)=>a+b,0);for(let i=0;i<options.length;i++){roll-=weights[i];if(roll<0)return options[i].id;}return options.at(-1)?.id;}
 function begin(s){
  initialize(s);const key=C.label(s);if(!ROUNDS.includes(key)||s.armories[key])return false;
  const r=C.random(s),tier=s.stage===2?r<.60?'Silver':r<.90?'Gold':'Prismatic':s.stage===3?r<.20?'Silver':r<.80?'Gold':'Prismatic':r<.10?'Silver':r<.50?'Gold':'Prismatic';
  s.armories[key]={tier,players:{}};for(const p of C.alive(s)){const options=[];for(let n=0;n<3;n++)options.push(draw(s,p,tier,options));s.armories[key].players[p.id]={options,rerolled:[false,false,false],picked:null};}
  s.phase='augment';s.remaining=35;
  for(const p of C.alive(s).filter(p=>p.bot))botPick(s,p);
  return true;
 }
 function armory(s,p){return s.armories?.[C.label(s)]?.players[p.id]||null;}
 function reroll(s,p,index){const a=armory(s,p);if(s.phase!=='augment'||!a||a.picked||![0,1,2].includes(index)||a.rerolled[index])throw Error('This Augment reroll is unavailable.');const id=draw(s,p,s.armories[C.label(s)].tier,a.options);if(!id)throw Error('No alternate Augment available.');a.options[index]=id;a.rerolled[index]=true;s.revision++;}
 function pick(s,p,index){
  const a=armory(s,p);if(s.phase!=='augment'||!a||a.picked||![0,1,2].includes(index))throw Error('Select one available Augment.');const d=get(a.options[index]);if(!d||p.augments.length>=3||p.augments.some(id=>get(id)?.family===d.family))throw Error('Augment already selected.');
  a.picked=d.id;p.augments.push(d.id);const e=d.effects;if(e.gold)C.bonus(s,p,e.gold,'augment');if(e.xp){p.xp+=e.xp;C.levelUp(p,s);}if(e.freeRefresh)p.econ.freeRefresh=Math.max(p.econ.freeRefresh||0,e.freeRefresh);
  if(e.forge)for(let n=0;n<e.forge.count;n++)C.stash(p,C.relic(s,e.forge.rarity));
  s.revision++;if(C.alive(s).every(x=>armory(s,x)?.picked)){s.phase='planning';s.remaining=C.RULES.planningSeconds;}return d;
 }
 function botPick(s,p){const a=armory(s,p);if(!a||a.picked)return;if(host.AutoChessOnline?.replay(p)){a.picked=a.options[0];return;}const smart=host.AutoChessBots?.augmentChoice?.(s,p,a);if(Number.isInteger(smart)){pick(s,p,smart);return;}const preferred=host.AutoChessBots?.profile(p)?.trait;const score=id=>{const d=get(id),e=d.effects;return(e.crest===preferred?8:0)+(e.forge?4:0)+(p.hp<35&&(e.hp||e.startShield)?4:0)+(p.gold<15&&e.gold?3:0)+(d.family===rotation(s).featured?2:0)+(e.atk||e.speed?2:0);};const ordered=a.options.map((id,index)=>({index,value:score(id)})).sort((a,b)=>b.value-a.value||a.index-b.index);pick(s,p,ordered[0].index);}
 function valid(s){if(s.augmentWeek===undefined)return true;if(!/^\d{4}-W\d{2}$/.test(s.augmentWeek)||!WEEKLIES.includes(s.weeklyAugment)||!s.armories)return false;for(const p of s.players)if(!Array.isArray(p.augments)||p.augments.length>3||p.augments.some(id=>!get(id))||new Set(p.augments.map(id=>get(id).family)).size!==p.augments.length)return false;for(const p of s.players){const v=p.augmentState;if(v!==undefined&&(!v||typeof v!=='object'||Array.isArray(v)||v.lastStandUsed!==undefined&&typeof v.lastStandUsed!=='boolean'||v.giftedLevels!==undefined&&(!Array.isArray(v.giftedLevels)||v.giftedLevels.length>8||new Set(v.giftedLevels).size!==v.giftedLevels.length||v.giftedLevels.some(n=>!Number.isInteger(n)||n<2||n>9))||v.xpRound!==undefined&&!/^\d{1,3}-[1-6]$/.test(v.xpRound)))return false;}for(const [key,a]of Object.entries(s.armories)){if(!ROUNDS.includes(key)||!TIERS.includes(a.tier)||!a.players)return false;for(const [id,row]of Object.entries(a.players)){if(!s.players.some(p=>p.id===id)||!Array.isArray(row.options)||row.options.length!==3||new Set(row.options).size!==3||row.options.some(id=>get(id)?.tier!==a.tier)||!Array.isArray(row.rerolled)||row.rerolled.length!==3||row.rerolled.some(v=>typeof v!=='boolean')||row.picked!==null&&!row.options.includes(row.picked))return false;}}return true;}
 host.AutoChessAugments=Object.freeze({TIERS,ROUNDS,DEFINITIONS,WEEKLIES,ECONOMY_FAMILIES,getCurrentAugmentWeekKey,featured,rotation,available,poolLabel,schedule,pool,get,effects,traits,initialize,begin,armory,reroll,pick,botPick,valid,onLevel,endRound,lastStand});
})(window);
