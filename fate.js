/* Fate combat hooks. Runtime-only: no storage, rewards or quest side effects. */
(function(host){
  'use strict';
  host.createFateSkills=function(api){
    const IDS=Object.freeze(['shirou','kiritsu','mash','gilgamesh','cu-chalinn','saber-knight','iskandar','medea','merlin','tower-champion-heavenly-200']);
    const CHAN='tower-champion-heavenly-200';
    const {has,alive,all,allies,enemies,team,runtime,atk,random,hit,heal,refresh}=api;
    const state=(unit,key)=>api.passiveRuntimeFor(unit,key).fate ||= {attacks:0,revived:false,postRevive:0,supportTurns:0,conversions:0,excalibur:0};
    const pick=pool=>pool.length?pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]:null;
    const owners=(bs,unit,key)=>allies(bs,unit).filter(ally=>has(ally,key));
    const support=(bs,unit)=>api.front(bs,team(bs,unit))!==unit;
    const boon=(bs,unit)=>{const value=runtime(unit).fateBoon;return value&&value.turn===bs?.turnCount&&alive(value.owner)&&has(value.owner,'gilgamesh')?value.kind:'';};
    function entry(bs,unit){
      const r=runtime(unit);r.fateOriginal ||= {hp:unit.maxHp,atk:unit.atk};
      if(has(unit,'iskandar'))state(unit,'iskandar').entered=true;
    }
    function atkAura(bs,unit){return bs&&owners(bs,unit,'iskandar').some(owner=>state(owner,'iskandar').entered)?1.10:1;}
    function damageAura(bs,unit){return bs&&host.CategorySystem.has(unit,'Hero')&&owners(bs,unit,'gilgamesh').length?1.25:1;}
    function crit(bs,unit){
      if(!bs)return {chance:0,multiplier:0};
      let chance=owners(bs,unit,'mash').some(owner=>support(bs,owner))?.10:0,multiplier=0;
      if(owners(bs,unit,'iskandar').some(owner=>state(owner,'iskandar').entered))chance+=.10;
      if(has(unit,'iskandar')&&allies(bs,unit,false).length===0){chance+=.05;multiplier+=.25;}
      if(boon(bs,unit)==='sword'){chance+=.05;multiplier+=.50;}
      return {chance,multiplier};
    }
    function suppress(bs,target,turns=1){
      if(!alive(target))return;const r=runtime(target);
      r.passiveSuppressionTurns=Math.max(r.passiveSuppressionTurns||0,turns);r.suppressionAppliedTurn=bs.turnCount||0;refresh(target);
    }
    function stunThenSuppress(bs,target,source,turns){
      api.status(target,'stunTurns',turns,source);
      const r=runtime(target);if(r.stunTurns>0)r.timeDilationPending=true;else suppress(bs,target,1);
    }
    function counted(bs,unit,options){
      if(options.isCounter)return;
      for(const key of IDS)if(has(unit,key)){
        const c=state(unit,key);c.attacks++;
        if(key==='saber-knight')c.excalibur++;
        if(key==='cu-chalinn'&&c.revived)c.postRevive++;
      }
    }
    function startTurn(bs,actor,side){
      for(const owner of all(bs)){
        if(!alive(owner)||owner===actor||(bs.playerTeam.includes(owner)?'player':'enemy')!==side)continue;
        if(has(owner,'mash')){const ally=pick(allies(bs,owner,false));if(ally)api.shield(ally,owner.hp*.25,(bs.turnCount||0)+1);}
        if(has(owner,'gilgamesh'))for(const ally of allies(bs,owner))runtime(ally).fateBoon={owner,turn:bs.turnCount,kind:pick(['sword','lance','dagger'])};
        if(has(owner,'merlin')){
          const c=state(owner,'merlin');c.supportTurns++;
          if(c.supportTurns%3===0){const ally=pick(allies(bs,owner,false));if(ally)api.shield(ally,owner.hp*.50);}
        }
      }
    }
    function fatal(bs,unit){
      for(const key of ['shirou','cu-chalinn'])if(has(unit,key)){
        const c=state(unit,key);if(c.revived)continue;c.revived=true;c.postRevive=0;
        unit.hp=Math.max(1,Math.round(unit.maxHp*(key==='shirou'?.10:.50)));unit.defeated=false;
        if(key==='shirou')api.shield(unit,unit.maxHp,(bs.turnCount||0)+3);
        refresh(unit);return true;
      }
      return false;
    }
    const dodgeChance=unit=>has(unit,CHAN)?.36:0;
    function passiveDodge(bs,unit,source,meta){
      if(meta.fateAbsorb||!meta.passiveAttack||meta.dodgeChecked||!alive(source))return false;
      if(has(unit,'medea')&&random()<.32)return true;
      return false;
    }
    function dodge(bs,unit,source){if(has(unit,CHAN)&&alive(source))stunThenSuppress(bs,source,unit,2);}
    function primary(bs,unit,target,scale=1,options={}){
      return alive(unit)&&alive(target)?api.primary(bs,unit,target,atk(unit)*scale,options):{hit:false,damage:0,killed:false};
    }
    function merge(into,result){into.damage+=result.damage||0;into.killed ||= Boolean(result.killed);into.hit ||= Boolean(result.hit||result.damage>0);return into;}
    function attack(bs,unit,target,options={}){
      const result={hit:false,damage:0,killed:false,fateSkill:true};
      if(has(unit,'kiritsu')){
        const rifle=random()>=.5;
        const first=primary(bs,unit,target,rifle?.60:.50);merge(result,first);
        if(!rifle&&first.hit&&alive(target))suppress(bs,target,1);
        // Geometric chain, iterative rather than recursive; no gameplay cap.
        if(rifle){
          after(bs,unit,target,first,options);supportAttack(bs,unit,first,options);result.fateProcessed=true;
          while(alive(unit)&&has(unit,'kiritsu')&&enemies(bs,unit).length&&random()<followChance(bs,unit,.60)){
            const next=alive(target)?target:enemies(bs,unit)[0];
            api.countedFollowUp(bs,unit,next);counted(bs,unit,{isFollowUp:true});
            const shot=primary(bs,unit,next,.30,{isFollowUp:true,passiveAttack:true});merge(result,shot);after(bs,unit,next,shot,{isFollowUp:true});
          }
        }
        return result;
      }
      if(has(unit,CHAN)){
        const move=Math.floor(random()*3);
        if(move===0)for(let i=0;i<5&&alive(unit);i++){const next=alive(target)?target:enemies(bs,unit)[0];if(!next)break;merge(result,primary(bs,unit,next,.12));}
        else if(move===1)for(const enemy of [...enemies(bs,unit)].slice(0,2))merge(result,primary(bs,unit,enemy,.60));
        else{const shot=primary(bs,unit,target,.50);merge(result,shot);if(shot.hit&&alive(target)&&random()<.50)api.status(target,'stunTurns',1,unit);}
        return result;
      }
      if(has(unit,'gilgamesh')&&state(unit,'gilgamesh').attacks===10){
        for(const enemy of [...enemies(bs,unit)])merge(result,primary(bs,unit,enemy,10));return result;
      }
      return null;
    }
    function multiplier(unit){return has(unit,'cu-chalinn')&&state(unit,'cu-chalinn').postRevive===5?5:1;}
    function after(bs,unit,target,result,options={}){
      if(!alive(unit)||result?.skipped||result?.outOfTurn||options.isCounter)return;
      if(!has(unit,'gilgamesh')&&!has(unit,'cu-chalinn')&&!has(unit,'medea')&&boon(bs,unit)!=='lance')return;
      const pool=[...enemies(bs,unit)];
      let pierce=has(unit,'gilgamesh')&&state(unit,'gilgamesh').attacks!==10||boon(bs,unit)==='lance';
      if(has(unit,'cu-chalinn')&&random()<.225)pierce=true;
      if(pierce){const next=pool.find(enemy=>enemy!==target);if(next)primary(bs,unit,next,multiplier(unit));}
      if(has(unit,'cu-chalinn')&&random()<.45){const last=enemies(bs,unit).at(-1);if(last)hit(bs,unit,last,atk(unit)*.80,{fateSkill:true});}
      if(has(unit,'medea')){
        const c=state(unit,'medea');
        if(c.attacks%2===0&&alive(target)&&random()<.20)stunThenSuppress(bs,target,unit,1);
        if(random()<.10)for(const enemy of [...enemies(bs,unit)])hit(bs,unit,enemy,atk(unit)*1.50,{fateSkill:true});
      }
    }
    // Support actions cannot dispatch more support actions. One queue per root
    // action prevents Merlin / Dagger / Iskandar feedback loops.
    function supportAttack(bs,actor,result,options={}){
      if(result?.skipped||result?.outOfTurn||options.isCounter||options.isFollowUp||!alive(actor)||bs.fateSupporting)return;
      bs.fateSupporting=true;
      try{
        if(has(actor,'iskandar')&&state(actor,'iskandar').attacks>5){const ally=pick(allies(bs,actor,false));if(ally&&!api.stunned(ally)){const target=enemies(bs,actor)[0];if(target)hit(bs,ally,target,atk(ally),{fateSupport:true,followOwner:actor});}}
        for(const owner of [...allies(bs,actor,false)]){
          if(api.stunned(owner))continue;
          if(has(owner,'merlin')){
            heal(actor,actor.maxHp*.05,'Noble Phantasm',bs,owner);
            if(random()<followChance(bs,owner,.17)){const enemy=enemies(bs,owner)[0];if(enemy){const shot=hit(bs,owner,enemy,atk(owner),{fateSupport:true});if(!shot.dodged&&!shot.reflected&&!shot.raidBlocked&&alive(enemy))api.status(enemy,'stunTurns',1,owner);}}
          }
          if(has(owner,CHAN)&&state(owner,CHAN).attacks>=8&&random()<followChance(bs,owner,.20)){const enemy=enemies(bs,owner)[0];if(enemy)hit(bs,owner,enemy,atk(owner)*.60,{fateSupport:true});}
        }
        if(boon(bs,actor)==='dagger'&&api.canFollow(actor)){
          // Existing follow-up skills receive +10 percentage points through
          // followChance(); only cards without one get this independent 50% hit.
          if(!hasFollowUp(actor)&&random()<.50){const enemy=enemies(bs,actor)[0];if(enemy)hit(bs,actor,enemy,atk(actor),{fateSupport:true});}
        }
      }finally{bs.fateSupporting=false;}
    }
    const FOLLOW_IDS=new Set(['jotaro-kujo','denji','kamen-rider-kabuto','uchiha-itachi','uchiha-sasuke','weather-shadow-monarch','yuno','kiritsu','boss-event-alucard','alexander-anderson','madara-lubu','speed-wizard','tower-champion-bizare','tower-champion-shadow-200','tower-champion-heavenly-200','merlin','iskandar']);
    const hasFollowUp=unit=>api.hasExtraFollowUp(unit)||api.passiveIds(unit).some(key=>FOLLOW_IDS.has(key));
    const followChance=(bs,unit,chance)=>!api.canFollow(unit)?0:Math.min(1,chance+(boon(bs,unit)==='dagger'?.10:0));
    function guardian(bs,target,meta={}){return !meta.fateAbsorb&&!meta.dot?allies(bs,target,false).find(owner=>has(owner,'mash')):null;}
    function redirect(bs,source,target,amount,meta){
      if(!(amount>0))return amount;const owner=guardian(bs,target,meta);if(!owner)return amount;
      api.absorb(bs,source,owner,amount,{...meta,fateAbsorb:true,championRedirect:true,elementApplied:true,yunoDamageApplied:true,dodgeChecked:true,noGrimoireReflect:true});
      return 0;
    }
    function kill(bs,unit,victim){
      if(!has(unit,'iskandar')||!alive(unit)||!api.canSummon(unit)||api.generated(victim)||api.uncloneable(victim))return;
      const c=state(unit,'iskandar');if(c.conversions>=3)return;
      const original=runtime(victim).fateOriginal||{hp:victim.maxHp,atk:victim.atk};
      const converted=api.convert(bs,unit,victim,original.hp,original.atk);
      if(converted)c.conversions++;
    }
    function death(bs,unit){
      if(!has(unit,'saber-knight'))return;
      const c=state(unit,'saber-knight');if(c.deathFired)return;c.deathFired=true;
      const target=enemies(bs,unit)[0];if(target&&c.excalibur>0)hit(bs,unit,target,atk(unit)*c.excalibur,{fateDeath:true});
    }
    function describe(unit,description){
      const buff=runtime(unit).fateBoon;if(buff&&alive(buff.owner)&&api.currentBattle()?.turnCount===buff.turn)description.description+='\n\nLast granted Fate buff: '+buff.kind+' (1 turn).';return description;
    }
    return {IDS,entry,atkAura,damageAura,crit,counted,startTurn,fatal,dodgeChance,passiveDodge,dodge,attack,multiplier,after,supportAttack,followChance,hasFollowUp,guardian,redirect,kill,death,describe,state};
  };
})(window);
