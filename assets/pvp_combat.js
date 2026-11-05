/* Deterministic, Level-1 PvP combat. No storage, rewards, quests or host writes. */
(function(host){
 'use strict';
 const BUILD='acr-online-20261023-v2',U=host.OnlineUtils,MAX_TURNS=300,MAX_UNITS=400;
 const cards=new Map((host.ALL_CARDS||[]).map(card=>[card.id,card]));let signatureJob=null;
 function signature(){return signatureJob ||= U.hash(BUILD+U.stable([...cards.values()].map(card=>({id:card.id,stats:card.stats,element:card.element,category:card.category,passive:card.passive})).sort((a,b)=>a.id.localeCompare(b.id))));}
 // Array.every skips empty slots: a three-card sparse array must never count as 4v4 Ready.
 function validTeam(ids,size){return [1,4].includes(size)&&Array.isArray(ids)&&ids.length===size&&new Set(ids).size===size&&Array.from({length:size},(_,i)=>i).every(i=>Object.prototype.hasOwnProperty.call(ids,i)&&typeof ids[i]==='string'&&cards.has(ids[i]));}
 function commitment(team,nonce){return U.hash(U.stable({team,nonce}));}
 function generator(seed){let state=seed>>>0,count=0;const random=()=>{state=(state+0x6D2B79F5)>>>0;let t=Math.imul(state^state>>>15,1|state);t^=t+Math.imul(t^t>>>7,61|t);count++;return((t^t>>>14)>>>0)/4294967296;};return{random,info:()=>({state,count})};}
 function clone(value){return JSON.parse(JSON.stringify(value));}
 function unit(id,side){const card=clone(cards.get(id)),hp=Math.max(1,Math.round(card.stats.hp)),atk=Math.max(0,Math.round(card.stats.atk));return{card,display:{name:card.name,image:card.image,hp,atk},level:1,exp:0,mutations:[],hp,maxHp:hp,atk,side,defeated:false};}
 function stateGraph(value){const seen=new WeakMap();let nextId=0;function visit(v){if(v===null||typeof v!=='object'){if(typeof v==='function'||typeof v==='undefined')return null;if(typeof v==='number'&&!Number.isFinite(v))throw Error('Invalid combat value.');return v;}if(seen.has(v))return{$ref:seen.get(v)};if(++nextId>50000)throw Error('Combat state exceeds safe browser limits.');seen.set(v,nextId);if(Array.isArray(v))return v.map(visit);const out={};for(const key of Object.keys(v).sort()){if(['display','view','startedAt','nextTurnAt'].includes(key))continue;if(key==='card'){out.card=v.card?{id:v.card.id,element:v.card.element}:null;continue;}out[key]=visit(v[key]);}return out;}return visit(value);}
 function create(hostIds,guestIds,seed){
  const rng=generator(seed),logs=[];
  const engine=host.PassiveSystem.createIsolated({random:rng.random,getCardById:id=>cards.has(id)?clone(cards.get(id)):null,isWeatherActive:()=>false,appendBattleLog:message=>{logs.push(String(message));if(logs.length>100)logs.shift();}});
  const battle={mode:'online-pvp',sandbox:true,pvp:true,playerTeam:hostIds.map(id=>unit(id,'host')),enemyTeam:guestIds.map(id=>unit(id,'guest')),turn:rng.random()<.5?'player':'enemy',playerIndex:0,enemyIndex:0,finished:false,championChoices:{aqua:'hp'}};
  engine.beginBattle(battle);const initialWinner=engine.checkBattleWinner(battle);if(initialWinner){battle.finished=true;battle.pvpWinner=initialWinner==='player'?'host':'guest';}
  function step(){if(battle.finished)return;const result=engine.resolveTurn(battle);if(result.ended){battle.finished=true;battle.pvpWinner=result.winner==='player'?'host':'guest';}if(!battle.finished&&((battle.turnCount||0)>=MAX_TURNS||battle.playerTeam.length+battle.enemyTeam.length>MAX_UNITS)){battle.finished=true;battle.pvpWinner='draw';battle.pvpReason='Browser match limit reached';}}
  function snapshot(){return U.stable({build:BUILD,rng:rng.info(),battle:stateGraph(battle)});}
  return Object.freeze({battle,step,snapshot,logs,get activeSide(){return battle.turn==='player'?'host':'guest';}});
 }
 host.PvPCombat=Object.freeze({BUILD,MAX_TURNS,MAX_UNITS,signature,validTeam,commitment,create});
})(window);
