/* Halloween skills and Hindred. Runtime-only; safe in isolated Sandbox engines. */
(function(host){
  'use strict';
  host.createSpookySkills=function(api){
    const IDS=Object.freeze(['pennywise','the-legion','the-clown','the-oni','jason-13th','freddy-krueger','myers']),LIMIT=Number.MAX_VALUE/1024;
    const {runtime,has,id,alive,all,allies,enemies,team,atk,random,hit,status,dot,heal,refresh,log}=api;
    const state=(unit,key)=>api.passiveRuntimeFor(unit,key).spooky ||= {attacks:0,entered:false,stalkAtk:0,stalkHp:0,hpAdded:0};
    const pick=pool=>pool.length?pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]:null;
    const canFollow=unit=>!(Number(unit?.passiveState?.hindredTurns)>0);
    const eventBonus=(bs,unit,key)=>bs?.mode==='spooky-hunt'&&bs.enemyTeam?.includes(unit)?Number(bs.spooky?.modifiers?.[key])||0:0;
    function hinder(bs,target,source,turns){
      if(!alive(target)||!api.allowed(target,source))return false;
      const r=runtime(target);r.hindredTurns=Math.max(r.hindredTurns||0,turns);r.hindredAppliedTurn=bs.turnCount||0;refresh(target);return true;
    }
    function mode(unit){state(unit,'the-clown').mode=random()<.5?'haste':'hindred';}
    function entry(bs,unit){
      if(has(unit,'pennywise')){const c=state(unit,'pennywise');if(!c.entered){c.entered=true;c.domain=10;c.revives=0;c.openedTurn=bs.turnCount||0;}}

      if(has(unit,'the-clown')&&!state(unit,'the-clown').entered){state(unit,'the-clown').entered=true;mode(unit);}
      if(has(unit,'the-oni')){const c=state(unit,'the-oni');if(!c.entered){c.entered=true;c.first=runtime(unit).initialLineupIndex===0;c.entryTurns=c.first?3:0;}}
      if(has(unit,'jason-13th')){
        const c=state(unit,'jason-13th');if(c.entered)return;c.entered=true;
        const candidates=allies(bs,unit,false).flatMap(donor=>api.passiveIds(donor).filter(key=>!api.passiveIds(unit,true).includes(key)).map(key=>({donor,key})));
        const chosen=pick(candidates);if(!chosen)return;
        const copy=api.addCopy(unit,chosen.key);if(!copy)return;
        const donorState=runtime(chosen.donor);(donorState.spookyStolenPassives ||= {})[chosen.key]=unit;
        c.borrowed={...chosen,copy};api.activateCopy(bs,unit,copy);
        log('[PASSIVE] Ki ki ma ma borrowed '+chosen.donor.card.name+' passive.','passive');refresh(chosen.donor);
      }
    }
    const attacked=new WeakMap();
    function attackTarget(bs,source,target){
      if(!bs||!target||!source)return;let seen=attacked.get(bs);if(!seen){seen=new WeakSet();attacked.set(bs,seen);}const first=!seen.has(target)&&!target.hasBeenAttacked;seen.add(target);target.hasBeenAttacked=true;
      if(first&&api.enemyTeam(bs,source).includes(target)&&alive(source)&&has(source,'pennywise')&&alive(target)&&api.allowed(target,source)&&random()<.27)runtime(target).deadlightsHypnosis={turns:3,applied:bs.turnCount||0,source};
    }
    function hypnosisTarget(bs,u,fallback){const h=runtime(u).deadlightsHypnosis;return h?.turns>0&&random()<.80?pick(allies(bs,u,false))||fallback:fallback;}
    function misses(bs,u,options={}){return Boolean(bs&&u)&& !options.fearChecked&&runtime(u).deadlightsFearTurn===bs?.turnCount&&random()<.15;}
    function revive(bs,u){
      if(!has(u,'pennywise')||u.championPermanentDeath||['saber-knight','tower-champion-shadow-200'].some(key=>u.card?.id===key||has(u,key))||runtime(u).bleed?.some(effect=>effect.turns>0))return false;const c=state(u,'pennywise');if(!(c.domain>0)||(c.revives||0)>=5)return false;
      const hpBefore=Math.max(1,u.hp>0?u.hp:Number(u.hpBeforeDeath)||u.maxHp),line=team(bs,u),key=line===bs.playerTeam?'playerIndex':'enemyIndex';
      const current=line[bs[key]],next=line.find(v=>v!==u&&alive(v));c.domain=Math.floor(c.domain/2);c.revives=(c.revives||0)+1;c.openedTurn=bs.turnCount||0;
      u.hp=Math.max(1,Math.floor(hpBefore*.5));u.defeated=false;api.setAtkBonus(u,'deadlights-revival',Math.pow(.8,c.revives)-1);
      const at=line.indexOf(u);if(at>=0)line.splice(at,1);line.push(u);bs[key]=Math.max(0,line.indexOf(current===u?next||u:current));api.indices(bs);refresh(u);log('[PASSIVE] The Deadlights • revival '+c.revives+'/5 · Domain '+c.domain+' turns.','passive');return true;
    }
    function resizeMyers(unit,c){
      api.setHpBonus(unit,'myers-stalking',c.stalkHp);refresh(unit);
    }
    function startTurn(bs,actor,side){
      for(const owner of all(bs))if(alive(owner)&&has(owner,'pennywise')&&state(owner,'pennywise').domain>0)for(const enemy of enemies(bs,owner))runtime(enemy).deadlightsFearTurn=bs.turnCount;

      for(const owner of all(bs))if(alive(owner)&&has(owner,'myers')&&owner!==actor&&(bs.playerTeam.includes(owner)?'player':'enemy')===side){const c=state(owner,'myers');c.stalkAtk=Math.min(LIMIT,c.stalkAtk+.06);c.stalkHp=Math.min(LIMIT,c.stalkHp+.03);resizeMyers(owner,c);}
    }
    function counted(bs,unit,target,options={}){
      if(options.isCounter)return;
      for(const key of IDS)if(has(unit,key)){
        const c=state(unit,key);c.attacks++;
        if(key==='the-oni'){
          if(!options.isFollowUp){c.activeBleedBoost=Boolean(c.nextBleedBoost);c.nextBleedBoost=false;}
          if(runtime(target).bleed?.length)c.nextBleedBoost=true;
        }
        if(key==='jason-13th'){
          c.readyMove=c.nextMove||'';c.nextMove='';
          if(c.attacks%5===0)c.nextMove=random()<.5?'spear':'frog';
        }
        if(key==='freddy-krueger'){c.tryStun=Boolean(c.nextStun);c.nextStun=false;}
        if(key==='myers'){c.stalkAtk*=.34;c.stalkHp*=.67;resizeMyers(unit,c);}
      }
    }
    function atkFactor(unit){
      let bonus=0;
      if(has(unit,'myers'))bonus+=state(unit,'myers').stalkAtk;
      if(has(unit,'the-oni')){const c=state(unit,'the-oni');bonus+=(c.entryTurns>0?1:0)+(c.activeBleedBoost?.5:0);}
      return Math.min(LIMIT,1+bonus);
    }
    function replacement(bs,unit,target){
      if(has(unit,'myers')&&allies(bs,unit,false).length===0&&alive(target)&&target.hp<target.maxHp*.06){
        const before=target.hp;api.execute(bs,unit,target);
        if(!alive(target)){
          const c=state(unit,'myers');if(!unit.spookyMyersDoomed){unit.spookyMyersDoomed=true;unit.spookyDoomState=c;c.doom=6;c.doomStarted=bs.turnCount||0;}
          return {hit:true,damage:before,killed:true,spookyExecution:true,target,attacker:unit};
        }
        return {hit:true,damage:0,killed:false,preventedFatality:true,spookyExecution:true,target,attacker:unit};
      }
      if(!has(unit,'jason-13th'))return null;
      const c=state(unit,'jason-13th'),move=c.readyMove;c.readyMove='';if(!move)return null;
      if(move==='frog'){
        for(const enemy of enemies(bs,unit)){const r=runtime(enemy);r.spookyFrogTurns=Math.max(3,r.spookyFrogTurns||0);r.spookyFrogAppliedTurn=bs.turnCount||0;refresh(enemy);}
        return {hit:false,damage:0,killed:false,spookyFrog:true,target,attacker:unit};
      }
      let damage=0,killed=false,index=0;
      for(const enemy of [...enemies(bs,unit)]){const shot=api.primary(bs,unit,enemy,atk(unit)*2*Math.pow(.9,index++));damage+=shot.damage||0;killed ||= Boolean(shot.killed);if(!alive(unit))break;}
      return {hit:damage>0,damage,killed,spookySpear:true,target,attacker:unit};
    }
    function after(bs,unit,target,result,options={}){
      if(!alive(unit)||result?.skipped||result?.outOfTurn||options.isCounter)return;
      if(has(unit,'jason-13th')&&random()<.66)heal(unit,unit.maxHp*.06,'Ki ki ma ma',bs,unit);
      if(!result?.hit||!alive(target))return;
      if(has(unit,'the-clown')&&state(unit,'the-clown').mode==='hindred'&&random()<.33)hinder(bs,target,unit,3);
      if(has(unit,'the-oni')){const c=state(unit,'the-oni');if(c.first&&c.attacks%3===0&&api.allowed(target,unit))dot(target,'bleed',1+Math.floor(random()*3),atk(unit)*.33,unit);}
      if(has(unit,'freddy-krueger')){
        const c=state(unit,'freddy-krueger');if(c.tryStun&&random()<.06&&api.allowed(target,unit))status(target,'stunTurns',3,unit);
        if(random()<.66&&hinder(bs,target,unit,1))c.nextStun=true;
      }
    }
    const chains=new WeakMap();
    const chainKey=unit=>['the-legion','the-clown'].includes(id(unit))?id(unit):'';
    function chain(bs,unit,target,options={}){
      const key=chainKey(unit),token={};chains.set(unit,token);
      try{
        const first=options.grimoireInitialResult||api.attack(bs,unit,target,{...options,spookyChainToken:token});
        if(!key||first.skipped||first.outOfTurn||!canFollow(unit)||!alive(unit))return first;
        const c=state(unit,key);if(key==='the-legion'&&c.attacks%4!==0)return first;
        if(key==='the-clown'&&c.mode!=='haste')return first;
        const threshold=Math.max(1,enemies(bs,unit).length);let count=0,burst=false;
        while(alive(unit)&&has(unit,key)&&canFollow(unit)&&enemies(bs,unit).length&&random()<api.followChance(bs,unit,key==='the-legion'?.44:.33)){
          if(key==='the-clown'&&c.mode!=='haste')break;
          target=alive(target)?target:enemies(bs,unit)[0];count++;
          const shot=api.attack(bs,unit,target,{isFollowUp:true,passiveAttack:true,damageMultiplier:key==='the-legion'?.44:.66,chainDepth:0,spookyChainToken:token,grimoireDriver:options.grimoireDriver});
          if(shot.skipped||shot.outOfTurn)break;
          if(key==='the-legion'&&shot.hit&&alive(target)&&random()<.44&&api.allowed(target,unit))dot(target,'bleed',count,atk(unit)*.44,unit);
          if(key==='the-legion'&&!burst&&count===threshold){burst=true;for(const enemy of [...enemies(bs,unit)])hit(bs,unit,enemy,atk(unit)*4,{spookyBurst:true,isFollowUp:true});}
        }
        return first;
      }finally{chains.delete(unit);api.indices(bs);}
    }
    function linked(bs,unit,options){return Boolean(options.spookyChainToken&&chains.get(unit)===options.spookyChainToken&&canFollow(unit));}
    function dodge(bs,unit,source){if(has(unit,'freddy-krueger')&&alive(source)&&api.allowed(source,unit))status(source,'stunTurns',1,unit);}
    function killed(bs,unit){if(has(unit,'the-clown')&&alive(unit)){api.atkBonus(unit,.139);api.hpBonus(unit,.139);}}
    function death(bs,victim){
      const c=api.passiveRuntimeFor(victim,'jason-13th').spooky,borrowed=c?.borrowed;
      if(borrowed){const r=runtime(borrowed.donor);if(r.spookyStolenPassives?.[borrowed.key]===victim)delete r.spookyStolenPassives[borrowed.key];api.removeCopy(victim,borrowed.copy);c.borrowed=null;refresh(borrowed.donor);}
    }
    function defeated(bs,victim){for(const unit of all(bs))if(alive(unit)&&has(unit,'the-clown')&&api.enemyTeam(bs,unit).includes(victim))mode(unit);}
    function onHit(bs,source,target,damage,meta){
      const chance=eventBonus(bs,source,'bleed');if(!(damage>0)||!chance||!alive(source)||!alive(target)||meta.dot||!api.allowed(target,source))return;
      if(random()<chance)dot(target,'bleed',1+Math.floor(random()*3),atk(source)*.33,source);
    }
    function endTurn(bs,actor){
      const r=runtime(actor);const hypnosis=r.deadlightsHypnosis;if(hypnosis&&hypnosis.applied!==bs.turnCount&&--hypnosis.turns<=0)delete r.deadlightsHypnosis;
      for(const owner of all(bs))if(alive(owner)&&has(owner,'pennywise')){const c=state(owner,'pennywise');if(c.domain>0&&c.openedTurn!==bs.turnCount)c.domain--;}
      if(r.hindredTurns>0&&r.hindredAppliedTurn!==bs.turnCount)r.hindredTurns--;
      if(r.spookyFrogTurns>0&&r.spookyFrogAppliedTurn!==bs.turnCount)r.spookyFrogTurns--;
      if(has(actor,'the-oni')){const c=state(actor,'the-oni');if(c.entryTurns>0)c.entryTurns--;c.activeBleedBoost=false;}
      for(const unit of all(bs))if(alive(unit)&&unit.spookyMyersDoomed){const c=unit.spookyDoomState;if(c?.doom>0&&(bs.turnCount||0)>c.doomStarted&&--c.doom===0){unit.championPermanentDeath=true;unit.hp=0;unit.defeated=true;api.death(bs,unit);refresh(unit);}}
    }
    function badges(unit){const r=runtime(unit),list=[];if(r.deadlightsFearTurn!==undefined&&api.currentBattle()?.turnCount===r.deadlightsFearTurn)list.push({icon:'◉',label:'FEAR · 15% MISS',tone:'debuff',category:'status'});if(r.deadlightsHypnosis?.turns>0)list.push({icon:'◈',label:'HYPNOTIZED '+r.deadlightsHypnosis.turns+'t',tone:'debuff',category:'status'});if(has(unit,'pennywise'))list.push({icon:'◉',label:'DEADLIGHTS '+(state(unit,'pennywise').domain||0)+'t · REVIVES '+(state(unit,'pennywise').revives||0)+'/5',tone:'passive'});if(r.hindredTurns>0)list.push({icon:'⛓',label:`HINDRED ${r.hindredTurns}t`,tone:'debuff',category:'status'});if(unit.spookyMyersDoomed)list.push({icon:'☠',label:`DOOM ${unit.spookyDoomState?.doom||0}t`,tone:'debuff',category:'status'});if(has(unit,'the-clown'))list.push({icon:'♧',label:(state(unit,'the-clown').mode||'').toUpperCase(),tone:'passive',category:'passive'});return list;}
    return {IDS,state,attackTarget,hypnosisTarget,misses,revive,canFollow,hinder,entry,startTurn,counted,atkFactor,replacement,after,canChain:unit=>Boolean(chainKey(unit)),chain,linked,dodge,killed,death,defeated,onHit,endTurn,badges,eventBonus,
      hpBonus:unit=>has(unit,'myers')?state(unit,'myers').stalkHp:0,dodgeChance:unit=>has(unit,'freddy-krueger')?.33:0,reduction:(bs,unit)=>(runtime(unit).spookyFrogTurns>0?.50:0)+eventBonus(bs,unit,'reduction')};
  };
})(window);
