/* Per-unit additive stat ledger. Starting level/mutation stats are immutable bases.
   Flat stolen/absorbed stats stay flat; replacing a life explicitly resets its base. */
(function(host){
 'use strict';
 host.createCombatStats=function(options={}){
  const records=new WeakMap(),LIMIT=Number.MAX_VALUE/1024;
  const finite=n=>Number.isFinite(Number(n))?Number(n):0;
  function ensure(u){let r=records.get(u);if(!r){r={base:{hp:Math.max(1,finite(u.maxHp)||finite(u.hp)||1),atk:Math.max(0,finite(u.atk))},percent:{hp:0,atk:0},flat:{hp:0,atk:0},named:{hp:new Map(),atk:new Map()},leasedFlat:{hp:new Map(),atk:new Map()}};records.set(u,r);}return r;}
  function percent(u,stat){const r=ensure(u);let total=r.percent[stat];for(const n of r.named[stat].values())total+=n;return total;}
  function value(u,stat,extra=0){const r=ensure(u);return Math.min(LIMIT,Math.max(stat==='hp'?1:0,r.base[stat]*(1+percent(u,stat)+finite(extra))+r.flat[stat]+[...r.leasedFlat[stat].values()].reduce((a,b)=>a+b,0)));}
  function sync(u,stat,heal=false){const old=stat==='hp'?finite(u.maxHp):finite(u.atk),next=Math.round(value(u,stat));if(stat==='hp'){u.maxHp=Math.max(1,next);u.hp=Math.min(u.maxHp,Math.max(0,finite(u.hp))+(heal?Math.max(0,u.maxHp-old):0));}else u.atk=Math.max(u.sandboxAllowZeroAttack||u.isExpMonster?0:1,next);return (stat==='hp'?u.maxHp:u.atk)-old;}
  function add(u,stat,pct,heal=false){const r=ensure(u),delta=finite(pct);if(options.allow?.(u,stat,delta,null)===false)return 0;const lease=options.lease?.();if(lease){lease.units.add(u);const key=lease.id+':add';r.named[stat].set(key,(r.named[stat].get(key)||0)+delta);}else r.percent[stat]+=delta;return sync(u,stat,heal);}
  function set(u,stat,key,pct,heal=false){const r=ensure(u),next=finite(pct),rawKey=key,lease=options.lease?.();if(lease){lease.units.add(u);key=lease.id+':'+key;}if(options.allow?.(u,stat,next-(r.named[stat].get(key)||0),rawKey,next)===false)return 0;if(next)r.named[stat].set(key,next);else r.named[stat].delete(key);return sync(u,stat,heal);}
  function flat(u,stat,amount,heal=false){const delta=finite(amount);if(options.allow?.(u,stat,delta,null)===false)return 0;const r=ensure(u),lease=options.lease?.();if(lease){lease.units.add(u);r.leasedFlat[stat].set(lease.id,(r.leasedFlat[stat].get(lease.id)||0)+delta);}else r.flat[stat]+=delta;return sync(u,stat,heal);}
  function setFlat(u,stat,key,amount,heal=false){const r=ensure(u),lease=options.lease?.();key='named:'+key;if(lease){lease.units.add(u);key=lease.id+':'+key;}const next=finite(amount),old=r.leasedFlat[stat].get(key)||0;if(options.allow?.(u,stat,next-old,key,next)===false)return 0;if(next)r.leasedFlat[stat].set(key,next);else r.leasedFlat[stat].delete(key);return sync(u,stat,heal);}
  function clear(u,stat,positiveOnly=false,keep=()=>false){const r=ensure(u);for(const [key,n]of r.leasedFlat[stat])if(!keep(key)&&(positiveOnly?n>0:String(key).includes('named:')))r.leasedFlat[stat].delete(key);if(positiveOnly){r.percent[stat]=Math.min(0,r.percent[stat]);r.flat[stat]=Math.min(0,r.flat[stat]);for(const [key,value]of r.named[stat])if(value>0&&!keep(key))r.named[stat].delete(key);}else{r.percent[stat]=0;r.flat[stat]=0;r.named[stat].clear();}sync(u,stat);}
  function clearNegative(u,stat){const r=ensure(u);r.percent[stat]=Math.max(0,r.percent[stat]);r.flat[stat]=Math.max(0,r.flat[stat]);for(const entries of [r.named[stat],r.leasedFlat[stat]])for(const [key,n]of entries)if(n<0)entries.delete(key);sync(u,stat);}
  function expireLease(lease){for(const u of lease.units){const r=ensure(u);for(const stat of ['hp','atk']){for(const key of r.named[stat].keys())if(String(key).startsWith(lease.id+':'))r.named[stat].delete(key);for(const key of r.leasedFlat[stat].keys())if(key===lease.id||String(key).startsWith(lease.id+':'))r.leasedFlat[stat].delete(key);sync(u,stat);}}lease.units.clear();}
  function reset(u){records.delete(u);ensure(u);}
  function scale(u,factor,heal=true){const r=ensure(u),oldHp=u.hp;r.base.hp*=factor;r.base.atk*=factor;r.flat.hp*=factor;r.flat.atk*=factor;sync(u,'hp');sync(u,'atk');u.hp=Math.min(u.maxHp,heal?Math.round(oldHp*factor):oldHp);}
  return Object.freeze({ensure,value,percent,add,set,flat,setFlat,clear,clearNegative,reset,scale,expireLease});
 };
})(window);
