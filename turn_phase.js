/* One authoritative active actor and once-per-own-turn gates for every runtime. */
(function(host){
 'use strict';
 host.createTurnPhases=function(){
  const battles=new WeakMap();
  function state(bs){let s=battles.get(bs);if(!s){s={serial:0,actor:null,turns:new WeakMap(),gates:new WeakMap(),actions:new WeakMap()};battles.set(bs,s);}return s;}
  function actor(bs){if(!bs)return null;const s=battles.get(bs);if(s?.actor)return s.actor;if(bs.activeAttacker)return bs.activeAttacker;const line=bs.turn==='enemy'?bs.enemyTeam:bs.playerTeam,index=bs.turn==='enemy'?bs.enemyIndex:bs.playerIndex;return line?.slice(index||0).find(u=>u&&u.hp>0&&!u.defeated)||null;}
  function own(bs,u,options={}){return Boolean(u&&actor(bs)===u&&!options.isFollowUp&&!options.isCounter&&!options.followOwner&&!options.linkedAttack);}
  const ownTurns=(bs,u)=>battles.get(bs)?.turns.get(u)||u?.passiveState?.ownTurnCount||0;
  function once(bs,u,key,options={}){if(!own(bs,u,options))return false;const s=state(bs);let gates=s.gates.get(u);if(!gates){gates=new Map();s.gates.set(u,gates);}const serial=s.actor?s.serial:'manual_'+(bs.turnCount||0);if(gates.get(key)===serial)return false;gates.set(key,serial);return true;}
  function withTurn(bs,u,fn){const s=state(bs),previous=s.actor,publicActor=bs.activeAttacker;s.actor=u;s.serial++;if(u){s.turns.set(u,(s.turns.get(u)||0)+1);if(u.passiveState)u.passiveState.ownTurnCount=s.turns.get(u);}bs.activeAttacker=u;try{return fn();}finally{s.actor=previous;bs.activeAttacker=publicActor||null;}}
  // Each root physical attack owns a new once-per-action gate. The timed
  // turn count remains unchanged: collisions do not advance status durations.
  function withActor(bs,u,fn){const s=state(bs),previous=s.actor,publicActor=bs.activeAttacker;s.actor=u;s.serial++;bs.activeAttacker=u;try{return fn();}finally{s.actor=previous;bs.activeAttacker=publicActor||null;}}
  function withAction(bs,u,options,fn){if(!bs||!u)return fn();const s=state(bs),previous=s.actions.get(u);s.actions.set(u,{token:{},follow:Boolean(options.isFollowUp)});try{return fn();}finally{if(previous)s.actions.set(u,previous);else s.actions.delete(u);}}
  function attackToken(bs,u,meta={}){const a=battles.get(bs)?.actions.get(u);if(a&&(!meta.isFollowUp||a.follow))return a.token;return meta.ballerAttackToken ||= {};}
  return Object.freeze({actor,own,ownTurns,once,withTurn,withActor,withAction,attackToken,reset:bs=>battles.delete(bs)});
 };
})(window);
