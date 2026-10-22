/* Per-battle summon admission. Counts living units in the actual team, never skill caches. */
(function(host){
  'use strict';
  const RULES=Object.freeze(Object.fromEntries(Object.entries({
    dark_aurora:{active:2},hermes:{active:3},d4c:{active:10},robot:{active:10,scope:'team'},puppet:{active:1},
    divine_steed:{active:3,lifetime:3},iskandar:{active:3,lifetime:3},
    ghost:{active:Infinity},duo:{active:Infinity},ito:{active:Infinity},shadow:{active:Infinity},
    metal_cooler:{active:Infinity},jin_mori:{active:Infinity},igris:{active:Infinity},
    dagon:{active:Infinity},transfigured:{active:Infinity}
  }).map(([key,value])=>[key,Object.freeze(value)])));
  const REVIVALS=Object.freeze({dark_revive:Object.freeze({lifetime:2,scope:'target'}),dante_revive:Object.freeze({lifetime:1,scope:'owner'}),josuke_revive:Object.freeze({lifetime:1,scope:'owner'})});
  const generated=u=>Boolean(u&&(u.isClone||u.isSummoned||u.isTemporaryAlly||u.championSummonType||u.companionOwner));
  host.createCompanionRules=function(api){
    const lifetimes=new WeakMap();
    const ownerOf=u=>u?.companionOwner||u?.championOwner||u?.expansionOwner||u?.hermesOwner||u?.questOwner||u?.reaganOwner||u?.shibuyaOwner||u?.iskandarOwner||null;
    function kindOf(u){
      if(u?.companionKind)return u.companionKind;
      if(u?.hermesOwner)return 'hermes';if(u?.reaganOwner)return 'robot';if(u?.shibuyaOwner)return u.shibuyaKind;
      if(u?.iskandarOwner)return 'iskandar';if(u?.expansionOwner)return u.expansionCloneType;
      if(u?.championOwner)return u.championSummonType==='converted'?'dark_aurora':u.championSummonType;
      if(u?.questOwner)return u.card?.id==='quest-summon-Divine Steed Clone'?'divine_steed':'shadow';
      return null;
    }
    function activeCount(bs,owner,kind=null,scope='owner'){
      const seen=new Set();let count=0;
      for(const unit of api.team(bs,owner)||[]){
        if(seen.has(unit)||!api.alive(unit)||!generated(unit))continue;seen.add(unit);
        if(scope!=='team'&&ownerOf(unit)!==owner)continue;
        if(kind!==null&&kindOf(unit)!==kind)continue;count++;
      }
      return count;
    }
    function ledger(bs,owner){let map=lifetimes.get(bs);if(!map){map=new WeakMap();lifetimes.set(bs,map);}let value=map.get(owner);if(!value){value={};map.set(owner,value);}return value;}
    function canSpawn(bs,owner,kind){
      const rule=Object.hasOwn(RULES,kind)?RULES[kind]:null,lineup=bs&&owner?api.team(bs,owner):null;
      if(!rule||!lineup?.includes(owner)||!api.alive(owner)||generated(owner))return false;
      // The hard Dark Decade limit survives stolen/copied passive state changes.
      const dark=owner.card?.id==='tower-champion-shadow';
      if(dark&&activeCount(bs,owner)>=RULES.dark_aurora.active)return false;
      if(activeCount(bs,owner,kind,rule.scope)>=rule.active)return false;
      return rule.lifetime===undefined||(ledger(bs,owner)[kind]||0)<rule.lifetime;
    }
    function admit(bs,owner,unit,kind){
      if(!unit||unit===owner||(api.team(bs,owner)||[]).includes(unit)||!canSpawn(bs,owner,kind))return false;
      unit.companionOwner=owner;unit.companionKind=kind;
      if(RULES[kind].lifetime!==undefined){const saved=ledger(bs,owner);saved[kind]=(saved[kind]||0)+1;}
      return true;
    }
    function canRevive(bs,owner,target,kind){
      const rule=Object.hasOwn(REVIVALS,kind)?REVIVALS[kind]:null;
      if(!rule||!bs||!owner||!target||owner===target||!api.alive(owner)||api.alive(target)||generated(owner)||generated(target))return false;
      const line=api.team(bs,owner);if(!line?.includes(owner)||!line.includes(target))return false;
      return (ledger(bs,rule.scope==='target'?target:owner)[kind]||0)<rule.lifetime;
    }
    function admitRevive(bs,owner,target,kind){
      if(!canRevive(bs,owner,target,kind))return false;
      const saved=ledger(bs,REVIVALS[kind].scope==='target'?target:owner);saved[kind]=(saved[kind]||0)+1;return true;
    }
    return Object.freeze({RULES,REVIVALS,activeCount,canSpawn,admit,canRevive,admitRevive,ownerOf,kindOf});
  };
})(window);
