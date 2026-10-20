/* Gomen combat skills. Runtime-only; no rewards, saves or quest writes. */
(function(host){
  'use strict';
  host.createGomenSkills=function(api){
    const GOJO='gojo-revice',GETO='geto-young',TOJI='toji',IDS=Object.freeze([GOJO,GETO,TOJI]);
    const {has,id,runtime,alive,all,enemies,atk,random,refresh}=api;
    const state=(u,key)=>api.passiveRuntimeFor(u,key).gomen ||= {attacks:0,entered:false,streak:0,bonuses:[],ready:false};
    const pick=values=>values[Math.min(values.length-1,Math.floor(random()*values.length))];
    function entry(bs,u){if(has(u,TOJI)){const c=state(u,TOJI);if(!c.entered){c.entered=true;c.mode=pick(['spear','katana','cloud','chains']);}}}
    function counted(bs,u,options={}){if(!options.isCounter)for(const key of IDS)if(has(u,key))state(u,key).attacks++;}
    function prepare(bs,u,target,options){
      let multiplier=1,ignoreShield=false;
      if(has(u,GOJO)&&!options.isFollowUp){const c=state(u,GOJO);if(c.ready){c.ready=false;multiplier*=8;}}
      if(has(u,TOJI)){
        const mode=state(u,TOJI).mode;
        if(mode==='katana'){multiplier*=.8;ignoreShield=true;}
        if(mode==='cloud'&&target.hp>=Math.max(...enemies(bs,u).map(e=>e.hp)))multiplier*=1.5;
      }
      return {...options,ignoreShield:options.ignoreShield||ignoreShield,damageMultiplier:(Number(options.damageMultiplier)||1)*multiplier};
    }
    function attack(bs,u,target,options){
      let targets=null,scale=1,move='';
      if(has(u,GETO)&&state(u,GETO).attacks%3===0){move=pick(['dragon','woman','centipede']);scale=move==='dragon'?3:move==='woman'?1.2:1.1;targets=move==='dragon'?[...enemies(bs,u)]:[target];}
      else if(has(u,TOJI)&&state(u,TOJI).mode==='chains'&&state(u,TOJI).attacks%2===0){targets=[...enemies(bs,u)].slice(0,2);scale=.6;}
      if(!targets)return null;
      const result={hit:false,damage:0,killed:false,target,attacker:u};
      for(const enemy of targets){if(!alive(u)||!alive(enemy))continue;const shot=api.primary(bs,u,enemy,atk(u)*scale,options);result.hit ||= shot.hit;result.damage+=shot.damage||0;result.killed ||= shot.killed;
        if(shot.hit&&alive(enemy)&&api.allowed(enemy,u)){if(move==='woman')api.status(enemy,'stunTurns',2,u);if(move==='centipede')api.dot(enemy,'bleed',3,atk(u)*.12,u);}}
      return result;
    }
    const chains=new WeakMap();
    const canChain=u=>id(u)===TOJI;
    function chain(bs,u,target,options={}){
      const token={};chains.set(u,token);
      try{
        const first=options.grimoireInitialResult||api.attack(bs,u,target,{...options,gomenToken:token});
        if(first.skipped||first.outOfTurn||!alive(u))return first;
        const c=state(u,TOJI),initialChance=api.followChance(bs,u,.80);let index=0;
        while(alive(u)&&has(u,TOJI)&&c.mode==='spear'&&api.canFollow(u)&&enemies(bs,u).length){
          // 80%, 75%, ... 5%, 0%: termination comes from the skill's own rule.
          const chance=Math.max(0,initialChance-index*.05);if(chance<=0||random()>=chance)break;
          target=alive(target)?target:enemies(bs,u)[0];
          const shot=api.attack(bs,u,target,{isFollowUp:true,passiveAttack:true,damageMultiplier:.30,chainDepth:0,gomenToken:token,grimoireDriver:options.grimoireDriver});
          if(shot.skipped||shot.outOfTurn)break;index++;
        }
        return first;
      }finally{chains.delete(u);api.indices(bs);}
    }
    function dodge(bs,u){if(has(u,GOJO)){const c=state(u,GOJO),bucket=c.bonuses.find(b=>b.turns===8);if(bucket)bucket.count++;else c.bonuses.push({turns:8,count:1});if(++c.streak===4){c.streak=0;c.ready=true;}refresh(u);}}
    function incoming(bs,source,target,meta){if(has(target,GOJO)&&!meta.dot){state(target,GOJO).streak=0;}}
    function defeated(bs,victim){for(const u of all(bs))if(alive(u)&&has(u,TOJI)&&api.enemyTeam(bs,u).includes(victim))state(u,TOJI).mode=pick(['spear','katana','cloud','chains']);}
    function endTurn(bs,actor){if(!actor)return;const c=api.passiveRuntimeFor(actor,GOJO).gomen;if(c)c.bonuses=c.bonuses.map(b=>({turns:b.turns-1,count:b.count})).filter(b=>b.turns>0);}
    const stacks=u=>state(u,GOJO).bonuses.reduce((n,b)=>n+b.count,0);
    const damageFactor=u=>has(u,GOJO)?1+stacks(u)*.08:1;
    function badges(u){const out=[];if(has(u,GOJO)){const c=state(u,GOJO);if(c.bonuses.length)out.push({icon:'∞',label:`DAMAGE +${stacks(u)*8}%`,tone:'buff'});if(c.ready)out.push({icon:'✦',label:'NEXT x8',tone:'buff'});}if(has(u,TOJI))out.push({icon:'⚔',label:({spear:'INVERTED SPEAR',katana:'SS KATANA',cloud:'PLAYFUL CLOUD',chains:'THOUSAND CHAINS'})[state(u,TOJI).mode]||'HEAVENLY RESTRICTION',tone:'passive'});return out;}
    return {GOJO,GETO,TOJI,IDS,state,entry,counted,prepare,attack,canChain,chain,linked:(u,o)=>Boolean(o.gomenToken&&chains.get(u)===o.gomenToken),dodge,incoming,defeated,endTurn,damageFactor,badges,isGojo:u=>has(u,GOJO)};
  };
})(window);
