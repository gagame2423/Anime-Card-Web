/* Shibuya combat hooks. Battle-local state only; no saves, rewards or quest writes. */
(function(host){
  'use strict';
  host.createShibuyaSkills=function(api){
    const IDS=Object.freeze(['jogo','true-mahito','todo','dagon','choso','haruta','mechamaru','hanami','sukuna-shibuya','shibuya-shark','shibuya-whales','shibuya-fish']);
    const {has,alive,all,allies,enemies,team,runtime,atk,random,refresh}=api;
    const state=(u,key)=>api.passiveRuntimeFor(u,key).shibuya ||= {attacks:0,entered:false};
    const pick=list=>list.length?list[Math.min(list.length-1,Math.floor(random()*list.length))]:null;
    const seenDeaths=new WeakMap(),seenKills=new WeakMap();
    const front=(bs,u)=>api.front(bs,team(bs,u));
    function entry(bs,u){
      if(has(u,'hanami')){const c=state(u,'hanami');if(!c.entered){c.entered=true;api.shield(u,u.maxHp);}}
    }
    function counted(bs,u,options={}){
      if(options.isCounter)return;
      for(const key of IDS)if(has(u,key)){
        const c=state(u,key);c.attacks++;
        if(key==='jogo'&&c.domain)c.meteor=(c.meteor||0)+1;
        if(key==='sukuna-shibuya'){c.fuga=(c.fuga||0)+1;api.heal(u,u.maxHp*.03,'FUGA',bs,u);}
      }
      if(u.shibuyaPuppet&&alive(u))api.heal(u,u.maxHp*.02,'PUPPET',bs,u);
    }
    function prepare(bs,u,target,options){
      let multiplier=1;
      if(has(u,'true-mahito')){const c=state(u,'true-mahito');c.pendingDouble=random()<.15;if(c.pendingDouble)multiplier*=2;}
      if(has(u,'haruta')){const weakest=Math.min(...enemies(bs,u).map(enemy=>atk(enemy)));const c=state(u,'haruta');c.guarded=atk(target)>weakest;if(!c.guarded)multiplier*=3;}
      if(has(u,'choso'))state(u,'choso').edge=false;
      return {...options,damageMultiplier:(Number(options.damageMultiplier)||1)*multiplier};
    }
    function attack(bs,u,target,options){
      if(!has(u,'choso')||!runtime(u).bleed?.length)return null;
      const c=state(u,'choso'),move=pick(['pierce','edge','flow']),result={hit:false,damage:0,killed:false,target,attacker:u};
      c.edge=move==='edge';
      const targets=move==='pierce'?[...enemies(bs,u)].slice(0,4):[target];
      for(let i=0;i<targets.length&&alive(u);i++){
        const shot=api.primary(bs,u,targets[i],atk(u)*(move==='pierce'?1.2-.3*i:move==='flow'?1.2:1),options);
        result.hit ||= shot.hit;result.damage+=shot.damage||0;result.killed ||= shot.killed;
      }
      c.edge=false;if(move==='flow')api.heal(u,u.maxHp*.10,'FLOWING BLOOD',bs,u);return result;
    }
    function followBonus(bs,u,chance){
      if(chance>.53||!api.hasFollowUp(u))return 0;
      return allies(bs,u,false).some(owner=>has(owner,'todo')&&front(bs,owner)!==owner)?.053:0;
    }
    function canProtect(bs,target){
      return allies(bs,target,false).find(owner=>has(owner,'todo')&&!state(owner,'todo').protected);
    }
    function protect(bs,target,source,amount,meta={}){
      if(!(amount>=target.hp)||!(amount>0)||meta.dot)return false;
      const owner=canProtect(bs,target);if(!owner)return false;
      const c=state(owner,'todo'),line=team(bs,target),highest=allies(bs,target,false).reduce((best,u)=>!best||u.hp>best.hp?u:best,null);
      c.protected=true;
      if(highest){const a=line.indexOf(target),b=line.indexOf(highest),key=line===bs.playerTeam?'playerIndex':'enemyIndex';[line[a],line[b]]=[line[b],line[a]];bs[key]=Math.max(0,line.indexOf(highest));}
      api.indices(bs);refresh(target);return true;
    }
    function immune(u,meta){return Boolean(meta.passiveAttack&&has(u,'hanami')&&runtime(u).shield>0);}
    function immuneStatus(u,key){return Boolean(u?.shibuyaPuppet&&['stunTurns','freezeTurns'].includes(key));}
    function dot(bs,u,kind,turns,damage,source,options={}){
      if(!alive(u))return false;
      if(kind==='burn'&&has(u,'dagon')){runtime(u).burn=[];api.shield(u,u.maxHp*.50);return true;}
      if(kind==='bleed'&&has(u,'choso')){
        const c=state(u,'choso');
        if(!(c.cleanseCooldown>0)){
          c.cleanseCooldown=3;c.cooldownTurn=bs?.turnCount||0;runtime(u).bleed=[];
          if(alive(source)&&!options.shibuyaReflected&&api.allowed(source,u))api.dot(source,'bleed',turns,damage*.50,u,{shibuyaReflected:true});
          refresh(u);return true;
        }
      }
      return false;
    }
    function damaged(bs,u,damage){if(damage>0&&has(u,'jogo')&&u.hp<u.maxHp*.50)state(u,'jogo').domain=true;}
    function fatal(bs,u){
      if(has(u,'shibuya-fish')){const c=state(u,'shibuya-fish');if((c.survived||0)<3){c.survived=(c.survived||0)+1;u.hp=1;u.defeated=false;refresh(u);return true;}}
      if(has(u,'sukuna-shibuya')){
        const c=state(u,'sukuna-shibuya');if(c.revived)return false;c.revived=true;
        u.hp=u.maxHp;u.defeated=false;c.domainTurns=c.fuga||0;c.domainStarted=bs.turnCount||0;
        const line=team(bs,u),index=line.indexOf(u);if(index>=0){line.splice(index,1);line.unshift(u);}bs[line===bs.playerTeam?'playerIndex':'enemyIndex']=0;
        if((c.fuga||0)>9)for(const enemy of [...enemies(bs,u)])api.hit(bs,u,enemy,atk(u)*c.fuga,{shibuyaSkill:true});
        api.indices(bs);refresh(u);return true;
      }
      return false;
    }
    function summon(bs,owner,victim,hp,attack,kind,card=null){
      if(!api.canSummon(owner)||(victim&&!api.canClone(victim)))return null;
      const unit=api.summon(bs,owner,victim,Math.max(1,Math.floor(hp)),Math.max(1,Math.floor(attack)),kind,card);
      if(unit){if(kind==='puppet')unit.shibuyaPuppet=true;api.enter(bs,unit);api.indices(bs);}return unit;
    }
    function spawnDagon(bs,u){
      const kind=pick(['shark','whales','fish']),labels={shark:['Shark','Every 2 attacks: Bleed for 1 turn, dealing 25% ATK.'],whales:['Whales','On death, stun the killer for 2 turns.'],fish:['Fish','Survive 3 fatal hits per match.']};
      const card={id:'shibuya-'+kind,name:labels[kind][0],element:u.card.element,stats:{hp:u.maxHp*.25,atk:atk(u)},image:u.card.image,category:[...(u.card.category||[])],passive:{name:labels[kind][0],description:labels[kind][1]}};
      return summon(bs,u,null,u.maxHp*.25,atk(u),'dagon',card);
    }
    function after(bs,u,target,result,options={}){
      if(!alive(u)||result?.skipped||result?.outOfTurn||options.isCounter)return;
      if(has(u,'true-mahito')){
        const c=state(u,'true-mahito');
        c.doubleStreak=c.pendingDouble&&result.hit?(c.doubleStreak||0)+1:0;c.pendingDouble=false;
        if(c.doubleStreak>=2&&!c.trueForm){c.trueForm=true;api.atkBonus(u,1);api.shield(u,u.maxHp);}
        if(c.trueForm&&!options.isFollowUp&&!c.chaining){
          c.chaining=true;
          try{let chance=.24;while(alive(u)&&has(u,'true-mahito')&&api.canFollow(u)&&enemies(bs,u).length&&random()<api.followChance(bs,u,chance)){
            const next=alive(target)?target:enemies(bs,u)[0];api.countFollow(bs,u,next);const shot=api.primary(bs,u,next,atk(u)*.15,{isFollowUp:true,passiveAttack:true});
            if(shot.hit)chance=Math.min(.72,chance+.12);if(shot.skipped)break;
          }}finally{c.chaining=false;}
        }
      }
      if(has(u,'dagon')){const c=state(u,'dagon');if(c.attacks%3===0&&c.spawnedAt!==c.attacks){c.spawnedAt=c.attacks;spawnDagon(bs,u);}}
      if(has(u,'hanami')){const c=state(u,'hanami');if(c.attacks%3===0&&result.hit&&alive(target)&&random()<.28&&api.allowed(target,u))runtime(target).shibuyaHypnosis={turns:1,applied:bs.turnCount,source:u};}
      if(has(u,'shibuya-shark')&&state(u,'shibuya-shark').attacks%2===0&&result.hit&&alive(target)&&api.allowed(target,u))api.dot(target,'bleed',1,atk(u)*.25,u);
      if(has(u,'todo')&&!options.isFollowUp&&api.canFollow(u)&&random()<.53){const ally=pick(allies(bs,u,false)),enemy=alive(target)?target:enemies(bs,u)[0];if(ally&&enemy&&!api.stunned(ally))api.hit(bs,ally,enemy,atk(ally)*.53,{isFollowUp:true,followOwner:u,shibuyaSkill:true});}
      if(u.shibuyaPuppet){runtime(u).stunTurns=0;runtime(u).freezeTurns=0;}
    }
    function kill(bs,u,victim){
      if(!alive(u)||alive(victim)||!has(u,'true-mahito'))return;
      let seen=seenKills.get(u);if(!seen){seen=new WeakSet();seenKills.set(u,seen);}if(seen.has(victim))return;seen.add(victim);
      summon(bs,u,victim,u.maxHp*.25,atk(u)*.25,'transfigured');
    }
    function death(bs,victim,source){
      if(alive(victim))return;
      let seen=seenDeaths.get(bs);if(!seen){seen=new WeakSet();seenDeaths.set(bs,seen);}if(seen.has(victim))return;seen.add(victim);
      if(has(victim,'jogo')){const c=state(victim,'jogo');c.countdown=c.meteor||0;c.deathTurn=bs.turnCount||0;c.meteorPending=true;}
      if(has(victim,'shibuya-whales')&&alive(source)&&api.allowed(source,victim))api.status(source,'stunTurns',2,victim);
      for(const owner of [...all(bs)]){
        if(!alive(owner)||!has(owner,'mechamaru')||!api.canSummon(owner)||team(bs,owner).some(u=>alive(u)&&u.shibuyaOwner===owner&&u.shibuyaKind==='puppet'))continue;
        const stats=runtime(victim).fateOriginal||{hp:victim.maxHp,atk:victim.atk};summon(bs,owner,victim,stats.hp*.50,stats.atk*.50,'puppet');
      }
    }
    function startTurn(bs,actor,side){
      for(const u of [...all(bs)]){
        if(alive(u)){
          if(has(u,'choso')&&(bs.playerTeam.includes(u)?'player':'enemy')===side){const c=state(u,'choso');if(c.cleanseCooldown>0&&c.cooldownTurn!==bs.turnCount)c.cleanseCooldown--;}
          if(has(u,'jogo')&&state(u,'jogo').domain)for(const enemy of [...enemies(bs,u)])api.hit(bs,u,enemy,atk(u)*.20,{shibuyaDomain:true});
          if(has(u,'sukuna-shibuya')){const c=state(u,'sukuna-shibuya');if(c.domainTurns>0&&c.domainStarted!==bs.turnCount){c.domainTurns--;for(const enemy of [...enemies(bs,u)])api.hit(bs,u,enemy,atk(u)*.09,{shibuyaDomain:true});}}
        }else{
          // Death effects are permanent runtime records, even if the passive was disabled later.
          const c=api.passiveRuntimeFor(u,'jogo').shibuya;
          if(c?.meteorPending&&c.deathTurn!==bs.turnCount){if(c.countdown>0)c.countdown--;if(c.countdown===0){c.meteorPending=false;for(const enemy of [...enemies(bs,u)])api.hit(bs,u,enemy,atk(u)*(c.meteor||0),{shibuyaMeteor:true});}}
        }
      }
      api.indices(bs);
    }
    function hypnosisTarget(bs,u,fallback){const h=runtime(u).shibuyaHypnosis;return h?.turns>0&&random()<.82?pick(allies(bs,u,false))||fallback:fallback;}
    function endTurn(bs,actor){if(!actor)return;const h=runtime(actor).shibuyaHypnosis;if(h&&h.applied!==bs.turnCount&&--h.turns<=0)delete runtime(actor).shibuyaHypnosis;}
    const reduction=u=>has(u,'haruta')&&state(u,'haruta').guarded?.10:0;
    const crit=u=>has(u,'choso')&&state(u,'choso').edge?{chance:.15,multiplier:.25}:{chance:0,multiplier:0};
    function badges(u){const out=[];if(has(u,'true-mahito')&&state(u,'true-mahito').trueForm)out.push({icon:'✦',label:'TRUE FORM',tone:'buff'});if(has(u,'jogo'))out.push({icon:'☄',label:'METEOR '+(state(u,'jogo').meteor||0),tone:'passive'});if(has(u,'sukuna-shibuya'))out.push({icon:'🔥',label:'FUGA '+(state(u,'sukuna-shibuya').fuga||0),tone:'passive'});if(u.shibuyaPuppet)out.push({icon:'♟',label:'PUPPET',tone:'buff'});return out;}
    function describe(u,copy){return u.shibuyaPuppet?{name:copy.name+' + Puppet',description:copy.description+'\n\nPuppet: Immune to Stun/Freeze. Every attack heals 2% max HP.'}:copy;}
    return {IDS,state,entry,counted,prepare,attack,after,followBonus,canProtect,protect,immune,immuneStatus,dot,damaged,fatal,kill,death,startTurn,endTurn,hypnosisTarget,reduction,crit,badges,describe};
  };
})(window);
