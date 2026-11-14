/* Pure Portal rules: no storage, UI or network writes. */
(function(host){
 'use strict';
 const MULTIPLIERS=Object.freeze({1:1,2:4,3:8.4,4:16,5:40,secret:200});
 const BASE=Object.freeze([{id:'tower-champion-sugar',hp:10000,atk:1420},{id:'android-21',hp:20000,atk:3000},{id:'golden-frieza',hp:55000,atk:5500},{id:'broly',hp:100000,atk:12450}].map(Object.freeze));
 const ELEMENTS=Object.freeze(['Fire','Water','Nature','Electric','Dark','Holy']),CATEGORIES=Object.freeze(['DragonWarrior','Hero']);
 const TYPES=Object.freeze({namek:Object.freeze({name:'Namek Portal',image:'assets/items/nportals.png',categories:CATEGORIES,maxBonus:100,food:'senzu_bean',foodName:'Senzu Beans',card:'broly',cardName:'Broly',base:BASE}),slime:Object.freeze({name:'Slime Portal',image:'assets/items/slportal.png',categories:['Swordman','Isekai','Magician','Hero'],maxBonus:200,food:'slime_dessert',foodName:'Slime Dessert',card:'yuuki-kagurazaka',cardName:'Yuuki Kagurazaka',base:[{id:'diablo',hp:20000,atk:1500},{id:'benimaru-jura',hp:35000,atk:4000},{id:'veldora',hp:70000,atk:7500},{id:'rimuru-demon-lord',hp:200000,atk:17500}]})});
 const definition=p=>TYPES[typeof p==='string'?p:p?.type]||TYPES.namek;
 const clone=value=>JSON.parse(JSON.stringify(value));
 const tierName=tier=>tier==='secret'?'Secret':'Tier '+tier;
 const pick=(rows,random)=>rows[Math.min(rows.length-1,Math.floor(random()*rows.length))];
 const integer=(min,max,random=Math.random)=>min+Math.floor(Math.max(0,Math.min(1-Number.EPSILON,random()))*(max-min+1));
 const validPortal=p=>Boolean(p&&Object.hasOwn(TYPES,p.type)&&Object.hasOwn(MULTIPLIERS,p.tier)&&Number.isInteger(p.attempts)&&p.attempts>=1&&p.attempts<=5&&ELEMENTS.includes(p.element)&&definition(p).categories.includes(p.category)&&Number.isInteger(p.bonus)&&p.bonus>=50&&p.bonus<=definition(p).maxBonus);
 function create(id,tier=1,random=Math.random,type='namek'){if(!Object.hasOwn(TYPES,type))throw Error('Unknown Portal type.');const d=TYPES[type];return {id,type,tier,attempts:5,element:pick(ELEMENTS,random),category:pick(d.categories,random),bonus:integer(50,d.maxBonus,random)};}
 function item(p){return {id:p.id,name:definition(p).name+' · '+tierName(p.tier),description:`${p.attempts}/5 attempts · Enemy Element: ${p.element} · ${p.category} cards gain +${p.bonus}% HP/ATK. Enemy stats x${MULTIPLIERS[p.tier]}. Open from Storage → Portals.`,type:'portal',tier:p.tier==='secret'?'secret':p.tier>=4?'mythic':p.tier>=2?'epic':'rare',icon:'🌀',image:definition(p).image,quantity:1,metadata:{portal:clone(p),source:p.type==='slime'?'Every 5 cleared Normal/Material Time Trial rooms (EXP excluded): 80% for Tier 1–2. Tier 5: 1% Secret.':'Normal Time Trial room victory: 20% for Tier 1. Tier 5 victory: 1% for a Secret Portal.'}};}
 function beanRange(tier,type='namek'){const depth=tier==='secret'?4:tier-1;return type==='slime'?{min:Math.round(1+depth*11/4),max:Math.round(5+depth*19/4)}:{min:Math.round(1+depth*9/4),max:Math.round(3+depth*17/4)};}
 function slots(size,index){if(![2,3,4].includes(size)||index<0||index>=size)return 0;return size===2?2:size===3&&index===0?2:1;}
 function unit(wire,owner){
  const card=host.ALL_CARDS.find(c=>c.id===wire?.cardId);
  if(!card||!Number.isInteger(wire.level)||wire.level<1||wire.level>1000||!Array.isArray(wire.mutationIds)||wire.mutationIds.length>2||new Set(wire.mutationIds).size!==wire.mutationIds.length||wire.mutationIds.some(id=>!host.MUTATION_BY_ID[id]))throw Error('Invalid Portal card selection.');
  let hp=card.stats.hp,attack=card.stats.atk;
  const factors=host.MutationSystem.factors(wire.mutationIds);hp*=factors.hp;attack*=factors.atk;
  const level=host.CardLevelSystem.normalizeLevel(wire.level),scale=host.CardLevelSystem.statMultiplier(level);hp=Math.max(1,Math.round(hp*scale));attack=Math.max(1,Math.round(attack*scale));
  if(wire.relic!==undefined&&wire.relic!==null&&!host.RelicSystem.validRoll(wire.relic))throw Error('Invalid Portal Relic.');
  return host.RelicSystem.applyToUnit({card:clone(card),display:{name:card.name,hp,atk:attack,image:card.image},level,mutations:wire.mutationIds.map(id=>host.MUTATION_BY_ID[id]),hp,maxHp:hp,atk:attack,defeated:false,portalOwnerId:owner},wire.relic);
 }
 function enemies(portal){if(!validPortal(portal))throw Error('Invalid Portal modifiers.');return definition(portal).base.map(row=>{const original=host.ALL_CARDS.find(c=>c.id===row.id);if(!original)throw Error('Missing Portal opponent.');const hp=Math.round(row.hp*MULTIPLIERS[portal.tier]),atk=Math.round(row.atk*MULTIPLIERS[portal.tier]);const card={...clone(original),element:portal.element};return {card,display:{name:card.name,image:card.image,hp,atk},level:1,mutations:[],hp,maxHp:hp,atk,defeated:false,isPortalEnemy:true};});}
 function generator(seed){let value=seed>>>0;return ()=>{value=(value+0x6D2B79F5)>>>0;let t=Math.imul(value^value>>>15,1|value);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
 function createCombat(players,portal,seed,options={}){
  const random=generator(seed),kills={},seen=new WeakSet();
  function ownerOf(source){const visited=new Set();while(source&&!visited.has(source)){if(source.portalOwnerId)return source.portalOwnerId;visited.add(source);source=source.companionOwner||source.championOwner||source.expansionOwner||source.hermesOwner||source.questOwner||source.reaganOwner||source.shibuyaOwner||source.iskandarOwner;}return null;}
  let battle;
  const engine=host.PassiveSystem.createIsolated({random,getCardById:id=>host.ALL_CARDS.find(c=>c.id===id),isWeatherActive:name=>(options.weather||[]).includes(name),appendBattleLog:options.log,showBattleFloatingText:options.float,renderBattleStats:options.render,
   onUnitDefeated:(bs,victim,source)=>{if(!bs.enemyTeam.includes(victim)||seen.has(victim))return;seen.add(victim);const owner=ownerOf(source);if(owner)kills[owner]=(kills[owner]||0)+1;}});
  battle={mode:'portal',portal:clone(portal),playerTeam:players,enemyTeam:enemies(portal),playerIndex:0,enemyIndex:0,turn:'player',finished:false,isBattling:true,championChoices:{aqua:'hp'}};
  // The modifier is part of the starting stat base and is applied once, before passive buffs.
  for(const u of players)if(host.CategorySystem.has(u,portal.category)){u.hp=u.maxHp=Math.round(u.maxHp*(1+portal.bonus/100));u.atk=Math.round(u.atk*(1+portal.bonus/100));Object.assign(u.display,{hp:u.maxHp,atk:u.atk});}
  options.prepare?.(battle,engine);engine.beginBattle(battle);
  const finish=winner=>{if(winner){battle.finished=true;battle.isBattling=false;battle.portalWinner=winner;}return winner;};
  finish(engine.checkBattleWinner(battle));
  function step(){if(battle.finished)return battle.portalWinner;const result=engine.resolveTurn(battle);return finish(result.winner||engine.checkBattleWinner(battle));}
  function digest(){return host.OnlineUtils.stable({turn:battle.turn,count:battle.turnCount||0,winner:battle.portalWinner||'',kills,teams:[battle.playerTeam,battle.enemyTeam].map(line=>line.map(u=>({id:u.card.id,hp:u.hp,maxHp:u.maxHp,atk:u.atk,dead:Boolean(u.defeated),shield:u.passiveState?.shield||0,attacks:u.passiveState?.ownAttackCount||0,status:[u.passiveState?.stunTurns||0,u.passiveState?.freezeTurns||0]})))});}
  return Object.freeze({battle,engine,kills,step,digest});
 }
 host.PortalRules=Object.freeze({MULTIPLIERS,BASE,ELEMENTS,CATEGORIES,TYPES,definition,integer,tierName,validPortal,create,item,beanRange,slots,unit,enemies,generator,createCombat});
})(window);
