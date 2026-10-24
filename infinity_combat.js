/* One continuous battle: only the defeated enemy wave is replaced. */
(function(host){
 'use strict';
 const LIMIT=Number.MAX_VALUE/1024,BASE=Object.freeze([[1000,100],[1500,300],[2000,400],[5000,500]].map(Object.freeze));
 const clone=value=>JSON.parse(JSON.stringify(value));
 let cachedCards=null,pool=[];
 function cardPool(){if(cachedCards===host.ALL_CARDS)return pool;cachedCards=host.ALL_CARDS;const maximum=Math.max(1,...cachedCards.map(c=>Number(c.chance)||10000000));pool=cachedCards.filter(c=>c?.id&&c.stats).map(card=>({card,quality:Math.log10(Math.max(1,Number(card.chance)||10000000))/Math.log10(maximum)}));return pool;}
 function stats(wave,index){const scale=Math.pow(Math.max(1,wave),1.365),base=BASE[index];return{hp:Math.max(1,Math.round(Math.min(LIMIT,base[0]*scale))),atk:Math.max(1,Math.round(Math.min(LIMIT,base[1]*scale)))};}
 function enemies(wave,week,random=Math.random){
  const available=[...cardPool()];if(available.length<4)throw Error('Infinity needs at least four Index cards.');
  const depth=Math.min(2,Math.log10(Math.max(1,wave))/2);
  function pick(boss){const exponent=depth*8+(boss?2:-4),weights=available.map(row=>Math.exp(exponent*row.quality));let r=Math.max(0,Math.min(1-Number.EPSILON,Number(random())||0))*weights.reduce((a,b)=>a+b,0),index=weights.length-1;for(let i=0;i<weights.length;i++){r-=weights[i];if(r<0){index=i;break;}}return available.splice(index,1)[0].card;}
  const boss=pick(true),cards=[pick(false),pick(false),pick(false),boss];
  return cards.map((original,index)=>{const card={...clone(original),element:week.element},value=stats(wave,index);return{card,display:{...value,name:card.name,image:card.image},mutations:[],level:wave,hp:value.hp,maxHp:value.hp,atk:value.atk,defeated:false,infinityBoss:index===3};});
 }
 function create(players,week,options={}){
  const rng=options.random||Math.random,logs=[],log=message=>{logs.push(String(message));if(logs.length>100)logs.shift();};
  const engine=host.PassiveSystem.createIsolated({random:rng,getCardById:id=>host.ALL_CARDS.find(c=>c.id===id),isWeatherActive:options.isWeatherActive||(()=>false),appendBattleLog:log,onUnitDefeated:options.onUnitDefeated,addRandomCommonUncommonWeather:options.addWeather});
  const battle={mode:'infinity',playerTeam:players,enemyTeam:enemies(1,week,rng),playerIndex:0,enemyIndex:0,turn:'player',finished:false,isBattling:true,championChoices:{aqua:options.aqua||'hp'},infinity:{weekId:week.id,element:week.element,wave:1,highest:0}};
  options.prepare?.(battle);engine.beginBattle(battle);
  function settle(){
   const alive=unit=>unit&&unit.hp>0&&!unit.defeated;
   if(!battle.playerTeam.some(alive)){battle.finished=true;battle.isBattling=false;return{ended:true,winner:'enemy'};}
   if(battle.enemyTeam.some(alive))return{ended:false,winner:null};
   const wave=battle.infinity.wave;
   options.onWave?.(wave,battle); // Save the clear exactly once before replacing enemies.
   battle.infinity.highest=wave;battle.infinity.wave=wave+1;
   if(!Number.isSafeInteger(battle.infinity.wave))throw Error('Infinity wave exceeds the browser numeric range.');
   engine.enterInfinityWave(battle,enemies(battle.infinity.wave,week,rng));
   log('Wave '+wave+' cleared → Wave '+battle.infinity.wave+'. HP, buffs and attack counters retained.');
   return{ended:false,winner:null,cleared:wave};
  }
  function step(){
   if(battle.finished)return{ended:true};const initial=settle();if(initial.ended||initial.cleared)return initial;
   const acted=battle.turn;engine.resolveTurn(battle);
   // The normal engine returns on victory before its usual turn handoff.
   if(!battle.infinity.turnAdvanced&&battle.enemyTeam.every(u=>u.defeated||u.hp<=0)){
    battle.turn=battle.requiemExtraSide||(acted==='player'?'enemy':'player');delete battle.requiemExtraSide;
   }
   return settle();
  }
  return Object.freeze({battle,engine,logs,step,settle});
 }
 host.InfinityCombat=Object.freeze({BASE,stats,enemies,create});
})(window);
