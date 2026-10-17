/* Wind / Bizare / Shadow Tower skills. Runtime only; isolated per battle engine. */
(function(host){
 'use strict';
 host.createRequiemSkills=function(api){
  const WIND='tower-champion-wind',SPR='tower-champion-bizare',STWR='tower-champion-shadow-200';
  const {runtime,id,has,alive,allies,enemies,team,atk,random,hit,status,dot,refresh,log}=api;
  const state=(u,key=id(u))=>api.passiveRuntimeFor(u,key).requiem ||= {};
  function lastStanding(bs,u){
   if(!has(u,WIND)||!alive(u)||state(u,WIND).lastStand||allies(bs,u).some(a=>a!==u))return;
   const c=state(u,WIND);c.lastStand=true;
   const hp=team(bs,u).filter(a=>a!==u&&!alive(a)).reduce((sum,a)=>sum+Math.max(0,a.maxHp||0),0);
   u.maxHp=Math.min(Number.MAX_VALUE/1024,u.maxHp+hp);u.hp=Math.min(u.maxHp,u.hp+hp);refresh(u);
   log('[PASSIVE] The Fuuto Wind: last stand +50% damage and fallen allies’ max HP.','passive');
  }
  function turn(bs){
   for(const u of api.all(bs))if(alive(u)){
    lastStanding(bs,u);
    const side=bs.playerTeam.includes(u)?'player':'enemy';
    if(has(u,WIND)&&bs.turn!==side){const guard=state(u,WIND);guard.guardTurn=guard.pendingGuard&&(guard.guardCreatedAt||0)<(bs.turnCount||0)?bs.turnCount:-1;guard.pendingGuard=false;}
    for(const key of [SPR,STWR])if(api.owns(u,key)){
     const c=state(u,key);
     if(bs.turn===side)c.ownTurns=(c.ownTurns||0)+1;
     if(c.pendingStun&&team(bs,u)!==team(bs,c.pendingStun.target)&&bs.turn!== (bs.playerTeam.includes(u)?'player':'enemy')){
      const target=c.pendingStun.target;c.pendingStun=null;if(alive(target))status(target,'stunTurns',1,u);
     }
    }
   }
  }
  function cleanse(bs,u,source){
   const key=id(u)||([SPR,STWR].includes(api.rawId(u))?api.rawId(u):'');if(![SPR,STWR].includes(key)||!alive(u)||!bs)return false;
   const r=runtime(u),c=state(u,key),keys=['stunTurns','freezeTurns','snailTurns','hypnosisTurns',...(key===STWR?['passiveSuppressionTurns','passiveSuppressedUntilDeath']:[])];
   if((c.readyAt||0)>(c.ownTurns||0)||!keys.some(k=>r[k]>0||r[k]===true))return false;
   for(const k of keys)r[k]=0;
   c.readyAt=(c.ownTurns||0)+(key===SPR?2:3);
   const target=source||c.disabler||api.enemyFront(bs,u);
   if(key===SPR&&target)c.pendingStun={target};
   if(key===STWR&&alive(target))dot(target,'bleed',3,atk(u)*.30,u);
   refresh(u);log('[PASSIVE] '+(key===SPR?'SPR':'STWR')+' cleansed attack-disabling effects.','passive');return true;
  }
  function afflicted(bs,u,key,source){
   if(!['stunTurns','freezeTurns','snailTurns','hypnosisTurns','passiveSuppressionTurns'].includes(key))return;
   // A silence must be able to trigger its own cleanse before effective ID disappears.
   const native=api.rawId(u),r=runtime(u);
   const effective=id(u)||([SPR,STWR].includes(native)?native:'');
   if(![SPR,STWR].includes(effective)||(effective===SPR&&key==='passiveSuppressionTurns'))return;
   const c=state(u,effective);c.disabler=source;
   if((c.readyAt||0)>(c.ownTurns||0))return;
   cleanse(bs,u,source);
  }
  function prepare(bs,u,target,options){
   const next={...options};
   if(!options.isCounter){
    const supporters=allies(bs,u).filter(a=>a!==u&&has(a,STWR)&&!api.stunned(a)&&random()<.12);
    if(supporters.length){next.requiemSupport=supporters;next.damageMultiplier=(next.damageMultiplier||1)*1.2;}
   }
   if(has(u,WIND)&&(runtime(u).ownAttackCount||0)%2===0){
    next.requiemStrike=Math.floor(random()*4);
    next.damageMultiplier=(next.damageMultiplier||1)*[.5,1,1.1,2][next.requiemStrike];
    log('[PASSIVE] The Fuuto Wind: '+['Heat','Cyclone','Lunar','Joker'][next.requiemStrike]+'.','passive');
   }
   return next;
  }
  function after(bs,u,target,result,options={}){
   if(!alive(u)||result?.skipped||options.isCounter)return;
   if(id(u)===WIND&&result?.hit&&result.damage>0){
    if(options.requiemStrike===0&&alive(target))dot(target,'burn',2,atk(u)*.30*(state(u,WIND).lastStand?1.5:1),u);
    if(options.requiemStrike===1){const other=enemies(bs,u).find(v=>v!==target);if(other)hit(bs,u,other,atk(u)*(state(u,WIND).lastStand?1.5:1),{requiemStrike:true});}
    if(options.requiemStrike===2&&alive(target))status(target,'stunTurns',1,u);
   }
   if(!options.requiemSupportApplied){
    options.requiemSupportApplied=true;
    for(const supporter of options.requiemSupport||[])if(alive(supporter)&&has(supporter,STWR)){
     const victim=alive(target)?target:api.enemyFront(bs,supporter);if(victim)hit(bs,supporter,victim,atk(supporter)*1.2,{requiemSupport:true});
    }
   }
   if(id(u)===STWR&&random()<.12)bs.requiemExtraSide=bs.playerTeam.includes(u)?'player':'enemy';
  }
  function chain(bs,u,target,options={}){
   const result=options.grimoireInitialResult || api.attack(bs,u,target,{...options,requiemChain:true});
   if(result.skipped||result.outOfTurn||options.isFollowUp)return result;
   while(alive(u)&&has(u,SPR)&&enemies(bs,u).length&&random()<.33){
    target=alive(target)?target:api.enemyFront(bs,u);
    const next=api.attack(bs,u,target,{...options,isFollowUp:true,requiemChain:true,chainDepth:0});if(next.skipped||next.outOfTurn)break;
   }
   return result;
  }
  function taken(bs,u){if(id(u)===WIND&&random()<.21){const c=state(u);c.pendingGuard=true;c.guardCreatedAt=bs.turnCount||0;log('[PASSIVE] The Fuuto Wind: 21% guard for the next enemy turn.','passive');}}
  function reduction(bs,u){return has(u,WIND)&&state(u,WIND).guardTurn===(bs?.turnCount||0) ? .21 : 0;}
  function fatal(bs,u){if(id(u)!==SPR||state(u).survived||random()>=.33)return false;state(u).survived=true;u.hp=1;u.defeated=false;refresh(u);return true;}
  function kill(bs,u){if(id(u)===STWR&&alive(u)){api.hpBonus(u,.12);api.atkBonus(u,.12);}}
  function death(bs,u){if(alive(u))return;if((api.rawId(u)===STWR||has(u,STWR))&&!state(u,STWR).deathUsed){state(u,STWR).deathUsed=true;u.championPermanentDeath=true;for(const enemy of enemies(bs,u))status(enemy,'stunTurns',5,u);}}
  return {WIND,SPR,STWR,checkLastStand:bs=>{for(const u of api.all(bs))if(alive(u))lastStanding(bs,u);},turn,cleanse,afflicted,prepare,after,chain,taken,reduction,fatal,kill,death,multiplier:u=>has(u,WIND)&&state(u,WIND).lastStand?1.5:1};
 };
})(window);
