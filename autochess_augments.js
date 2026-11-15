/* Seeded Armories, ISO-week featured signatures and capped match-only economy. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,TIERS=['Silver','Gold','Prismatic'],ROUNDS=['2-1','3-2','4-2'];
 function getCurrentAugmentWeekKey(at=Date.now()){
  const date=new Date(at);if(!Number.isFinite(date.getTime()))throw Error('Invalid augment date.');
  const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));const year=d.getUTCFullYear(),start=new Date(Date.UTC(year,0,1)),week=Math.ceil((((d-start)/86400000)+1)/7);return year+'-W'+String(week).padStart(2,'0');
 }
 const WEEKLIES=['soul-reaper-overdrive','relic-transmuter','prismatic-vanguard','tempest-conductor'];
 function featured(week=getCurrentAugmentWeekKey()){const m=/^(\d{4})-W(\d{2})$/.exec(week);if(!m)throw Error('Invalid augment week.');const d=new Date(Date.UTC(+m[1],0,4));d.setUTCDate(d.getUTCDate()-(d.getUTCDay()||7)+1+(+m[2]-1)*7);const index=Math.floor(d.getTime()/(7*86400000));return WEEKLIES[((index%WEEKLIES.length)+WEEKLIES.length)%WEEKLIES.length];}
 const families=[
  ['vitality','Vitality Matrix','Combat',i=>({hp:[.10,.18,.28][i]})],
  ['sharp-edges','Sharp Edges','Combat',i=>({atk:[.08,.14,.22][i]})],
  ['overclock','Overclock','Combat',i=>({speed:[.06,.12,.20][i]})],
  ['second-wind','Second Wind','Combat',i=>({regenWave:[.02,.035,.05][i]})],
  ['aegis','Aegis Formation','Combat',i=>({startShield:[.10,.20,.35][i]})],
  ['blood-drinker','Blood Drinker','Combat',i=>({vamp:[.03,.06,.10][i]})],
  ['precision','Calculated Strikes','Combat',i=>({crit:[.05,.10,.16][i]})],
  ['ward','Arcane Ward','Combat',i=>({reduction:[.03,.06,.10][i]})],
  ...['Swordman','Magician','Supporter','Human','Fire','Dark'].map(trait=>['crest-'+trait.toLowerCase(),trait+' Crest','Trait',i=>({crest:trait,crestCount:i+1})]),
  ['relic-forge','Relic Forge','Forge',i=>({forge:{rarity:'rare',count:i+1}})],
  ['pocket-change','Pocket Change','Economy',i=>({gold:[8,11,14][i]})],
  ['trade-route','Trade Route','Economy',i=>({freeRefresh:1,gold:[2,4,6][i]})],
  ['efficient-study','Efficient Study','Economy',i=>({xpCost:3,xp:[2,4,6][i]})],
  ['soul-reaper-overdrive',"Soul Reaper’s Overdrive",'Weekly',i=>({atk:[.08,.14,.20][i],crest:'Bleach',crestCount:1,killHeal:[.08,.12,.20][i]})],
  ['relic-transmuter','Relic Transmuter','Weekly',i=>({forge:{rarity:i===0?'rare':'legendary',count:i===2?2:1},startShield:[.05,.10,.15][i]})],
  ['prismatic-vanguard','Prismatic Vanguard','Weekly',i=>({hp:[.15,.25,.40][i],reduction:[.02,.04,.06][i]})],
  ['tempest-conductor','Tempest Conductor','Weekly',i=>({speed:[.10,.15,.25][i],crest:'Electric',crestCount:1})]
 ];
 const pct=n=>Number((n*100).toFixed(2))+'%';
 function describe(e){return[
  e.hp&&'All allies: +'+pct(e.hp)+' max HP.',e.atk&&'All allies: +'+pct(e.atk)+' ATK.',e.speed&&'All allies: +'+pct(e.speed)+' attack speed.',
  e.vamp&&'All allies: +'+pct(e.vamp)+' omnivamp.',e.crit&&'All allies: +'+pct(e.crit)+' crit chance.',e.reduction&&'All allies: +'+pct(e.reduction)+' damage reduction.',
  e.startShield&&'Battle start: Shield allies for '+pct(e.startShield)+' max HP.',e.regenWave&&'Every 4 seconds: heal allies for '+pct(e.regenWave)+' max HP.',e.killHeal&&'On a kill: heal '+pct(e.killHeal)+' max HP.',
  e.crest&&'+'+e.crestCount+' '+e.crest+' trait count while at least one real '+e.crest+' unit is deployed.',
  e.forge&&'Once: gain '+e.forge.count+' '+e.forge.rarity+' Relic'+(e.forge.count>1?'s':'')+'.',e.gold&&'Once: +'+e.gold+' Gold (within the round bonus cap).',
  e.freeRefresh&&'One free Shop Refresh each planning round; unused refreshes never accumulate.',e.xpCost&&'Buy XP costs 3g, never stacks below 3g. Once: +'+e.xp+' XP.'
 ].filter(Boolean).join(' ');}
 const DEFINITIONS=Object.freeze(families.flatMap(([family,name,kind,fn])=>TIERS.map((tier,i)=>{const effects=fn(i);return Object.freeze({id:family+'_'+tier.toLowerCase(),family,name,tier,kind,effects:Object.freeze(effects),description:describe(effects)});}))),byId=new Map(DEFINITIONS.map(a=>[a.id,a]));
 const get=id=>byId.get(id);
 function effects(p){const e={atk:0,hp:0,speed:0,vamp:0,crit:0,reduction:0,startShield:0,regenWave:0,killHeal:0,freeRefresh:0,xpCost:4};for(const id of p?.augments||[]){const a=get(id);if(!a)continue;for(const key of ['atk','hp','speed','vamp','crit','reduction','startShield','regenWave','killHeal'])e[key]+=a.effects[key]||0;e.freeRefresh=Math.max(e.freeRefresh,a.effects.freeRefresh||0);e.xpCost=Math.min(e.xpCost,a.effects.xpCost||4);}return e;}
 function traits(p){const result={};for(const id of p?.augments||[]){const e=get(id)?.effects;if(e?.crest)result[e.crest]=(result[e.crest]||0)+e.crestCount;}return result;}
 function initialize(s){s.augmentWeek ||= getCurrentAugmentWeekKey();s.weeklyAugment ||= featured(s.augmentWeek);s.armories ||= {};for(const p of s.players)p.augments ||= [];}
 function pool(s,p,tier){const owned=new Set((p.augments||[]).map(id=>get(id)?.family));return DEFINITIONS.filter(a=>a.tier===tier&&!owned.has(a.family)&&(a.kind!=='Weekly'||a.family===s.weeklyAugment));}
 function draw(s,p,tier,excluded=[]){const options=pool(s,p,tier).filter(a=>!excluded.includes(a.id)),weights=options.map(a=>a.family===s.weeklyAugment?4:1);let roll=C.random(s)*weights.reduce((a,b)=>a+b,0);for(let i=0;i<options.length;i++){roll-=weights[i];if(roll<0)return options[i].id;}return options.at(-1)?.id;}
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
  a.picked=d.id;p.augments.push(d.id);const e=d.effects;if(e.gold)C.bonus(s,p,e.gold,'augment');if(e.xp){p.xp+=e.xp;C.levelUp(p);}if(e.freeRefresh)p.econ.freeRefresh=1;
  if(e.forge)for(let n=0;n<e.forge.count;n++)C.stash(p,C.relic(s,e.forge.rarity));
  s.revision++;if(C.alive(s).every(x=>armory(s,x)?.picked)){s.phase='planning';s.remaining=C.RULES.planningSeconds;}return d;
 }
 function botPick(s,p){const a=armory(s,p);if(!a||a.picked)return;const preferred=host.AutoChessBots?.profile(p)?.trait;const score=id=>{const d=get(id),e=d.effects;return(e.crest===preferred?8:0)+(e.forge?4:0)+(p.hp<35&&(e.hp||e.startShield)?4:0)+(p.gold<15&&e.gold?3:0)+(d.family===s.weeklyAugment?2:0)+(e.atk||e.speed?2:0);};const ordered=a.options.map((id,index)=>({index,value:score(id)})).sort((a,b)=>b.value-a.value||a.index-b.index);pick(s,p,ordered[0].index);}
 function valid(s){if(s.augmentWeek===undefined)return true;if(!/^\d{4}-W\d{2}$/.test(s.augmentWeek)||!WEEKLIES.includes(s.weeklyAugment)||!s.armories)return false;for(const p of s.players)if(!Array.isArray(p.augments)||p.augments.length>3||p.augments.some(id=>!get(id))||new Set(p.augments.map(id=>get(id).family)).size!==p.augments.length)return false;for(const [key,a]of Object.entries(s.armories)){if(!ROUNDS.includes(key)||!TIERS.includes(a.tier)||!a.players)return false;for(const [id,row]of Object.entries(a.players)){if(!s.players.some(p=>p.id===id)||!Array.isArray(row.options)||row.options.length!==3||new Set(row.options).size!==3||row.options.some(id=>get(id)?.tier!==a.tier)||!Array.isArray(row.rerolled)||row.rerolled.length!==3||row.rerolled.some(v=>typeof v!=='boolean')||row.picked!==null&&!row.options.includes(row.picked))return false;}}return true;}
 host.AutoChessAugments=Object.freeze({TIERS,ROUNDS,DEFINITIONS,WEEKLIES,getCurrentAugmentWeekKey,featured,get,effects,traits,initialize,begin,armory,reroll,pick,botPick,valid});
})(window);
