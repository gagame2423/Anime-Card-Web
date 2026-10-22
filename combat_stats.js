/* Per-unit additive stat ledger. Starting level/mutation stats are immutable bases.
   Flat stolen/absorbed stats stay flat; replacing a life explicitly resets its base. */
(function(host){
 'use strict';
 host.createCombatStats=function(){
  const records=new WeakMap(),LIMIT=Number.MAX_VALUE/1024;
  const finite=n=>Number.isFinite(Number(n))?Number(n):0;
  function ensure(u){let r=records.get(u);if(!r){r={base:{hp:Math.max(1,finite(u.maxHp)||finite(u.hp)||1),atk:Math.max(0,finite(u.atk))},percent:{hp:0,atk:0},flat:{hp:0,atk:0},named:{hp:new Map(),atk:new Map()}};records.set(u,r);}return r;}
  function percent(u,stat){const r=ensure(u);let total=r.percent[stat];for(const n of r.named[stat].values())total+=n;return total;}
  function value(u,stat,extra=0){const r=ensure(u);return Math.min(LIMIT,Math.max(stat==='hp'?1:0,r.base[stat]*(1+percent(u,stat)+finite(extra))+r.flat[stat]));}
  function sync(u,stat,heal=false){const old=stat==='hp'?finite(u.maxHp):finite(u.atk),next=Math.round(value(u,stat));if(stat==='hp'){u.maxHp=Math.max(1,next);u.hp=Math.min(u.maxHp,Math.max(0,finite(u.hp))+(heal?Math.max(0,u.maxHp-old):0));}else u.atk=Math.max(u.sandboxAllowZeroAttack||u.isExpMonster?0:1,next);return (stat==='hp'?u.maxHp:u.atk)-old;}
  function add(u,stat,pct,heal=false){const r=ensure(u);r.percent[stat]+=finite(pct);return sync(u,stat,heal);}
  function set(u,stat,key,pct,heal=false){const r=ensure(u);if(pct)r.named[stat].set(key,finite(pct));else r.named[stat].delete(key);return sync(u,stat,heal);}
  function flat(u,stat,amount,heal=false){ensure(u).flat[stat]+=finite(amount);return sync(u,stat,heal);}
  function reset(u){records.delete(u);ensure(u);}
  function scale(u,factor,heal=true){const r=ensure(u),oldHp=u.hp;r.base.hp*=factor;r.base.atk*=factor;r.flat.hp*=factor;r.flat.atk*=factor;sync(u,'hp');sync(u,'atk');u.hp=Math.min(u.maxHp,heal?Math.round(oldHp*factor):oldHp);}
  return Object.freeze({ensure,value,percent,add,set,flat,reset,scale});
 };
})(window);
