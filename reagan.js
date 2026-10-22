/* Reagan/robot runtime hooks. No saves, rewards, timers or global battle state. */
(function(host){
  'use strict';
  host.createReaganSkills=function(api){
    const ID='tower-champion-normal-200', LIMIT=Number.MAX_VALUE/1024;
    const {alive,all,allies,enemies,team,front,has,runtime,atk,hit,heal,refresh,random,log}=api;
    const state=unit=>api.passiveRuntimeFor(unit,ID).reagan ||= {supportTurns:0,sacrificed:false};
    let promoting=false;
    const choose=pool=>pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
    function frontline(bs){
      if(promoting)return;
      promoting=true;
      try{
        // Entry means reaching the active frontline, not merely joining a queue.
        for(const lineup of [bs.playerTeam||[],bs.enemyTeam||[]]){
          let unit=front(bs,lineup);
          while(alive(unit)&&has(unit,ID)&&!state(unit).sacrificed){
            state(unit).sacrificed=true;
            const recipient=choose(allies(bs,unit,false));
            if(recipient){
              const r=runtime(recipient);
              if(!r.robotArmor){r.robotArmor={attacks:0};api.atkBonus(recipient,.25,'ROBOT ARMOR +25% ATK');}
            }
            unit.hp=0;unit.defeated=true;refresh(unit);api.death(bs,unit);
            log('[PASSIVE] Mad Scientist: entry sacrifice'+(recipient?' → '+recipient.card.name+' gains Robot Armor.':'; no living teammate.'),'passive');
            api.indices(bs);unit=front(bs,lineup);
          }
        }
      }finally{promoting=false;}
    }
    function spawn(bs,owner){
      const lineup=team(bs,owner);
      if(!api.canSpawn(bs,owner,'robot'))return;
      // Remove only expired robots. Keep every original unit and other summons.
      const current=front(bs,lineup);
      for(let i=lineup.length-1;i>=0;i--)if(lineup[i].reaganOwner===owner&&!alive(lineup[i]))lineup.splice(i,1);
      const hp=Math.max(1,Math.floor(Math.min(LIMIT,owner.maxHp*.10))),attack=Math.max(1,Math.floor(atk(owner)*.10));
      const card={id:'reagan-robot',name:'Reagan Robot',element:owner.card.element,rarity:owner.card.rarity,image:owner.card.image,
        stats:{hp,atk:attack},passive:{name:'AI',description:'Each attack hits all enemies for 100% ATK. Each kill heals this robot and Reagan for 10% of Reagan’s max HP.'}};
      const robot={card,display:{name:card.name,hp,atk:attack},hp,maxHp:hp,atk:attack,level:owner.level||1,
        mutations:[...(owner.mutations||[])],defeated:false,isClone:true,isSummoned:true,isTemporaryAlly:true,reaganOwner:owner};
      if(!api.admitSpawn(bs,owner,robot,'robot'))return;
      runtime(robot);refresh(robot);
      const at=Math.max(0,lineup.indexOf(current));lineup.splice(at,0,robot);
      const key=lineup===bs.playerTeam?'playerIndex':'enemyIndex';bs[key]=at;
      api.indices(bs);
      log('[PASSIVE] Mad Scientist: frontline robot (10% HP / ATK).','passive');
    }
    function endTurn(bs,actor,side){
      // Use the initiating side: resolveTurn has already switched bs.turn.
      for(const owner of [...all(bs)]){
        if(!alive(owner)||!has(owner,ID)||owner===actor||api.generated(owner))continue;
        if((bs.playerTeam.includes(owner)?'player':'enemy')!==side)continue;
        const c=state(owner);c.supportTurns++;
        if(c.supportTurns%3===0)spawn(bs,owner);
      }
    }
    function countedAttack(bs,unit,options){
      const armor=runtime(unit).robotArmor;
      if(!armor||api.suppressed(unit)||options.isCounter)return;
      armor.attacks++;
      if(armor.attacks%2)return;
      const pool=[...enemies(bs,unit)];
      for(let count=0;count<2&&pool.length;count++){
        const target=choose(pool);pool.splice(pool.indexOf(target),1);
        hit(bs,unit,target,atk(unit)*.50,{robotArmor:true});
      }
    }
    function attack(bs,unit){
      if(!unit.reaganOwner||api.suppressed(unit))return null;
      let damage=0,killed=false;
      for(const target of [...enemies(bs,unit)]){
        const result=hit(bs,unit,target,atk(unit),{robotAI:true});damage+=result.damage||0;killed ||= Boolean(result.killed);
        if(!alive(unit))break;
      }
      return {hit:damage>0,damage,killed,robotAI:true};
    }
    function kill(bs,unit){
      const owner=unit.reaganOwner;if(!owner||api.suppressed(unit))return;
      const amount=owner.maxHp*.10;
      heal(unit,amount,'AI',bs,unit);heal(owner,amount,'AI',bs,unit);
    }
    function describe(unit,description){
      if(runtime(unit).robotArmor){description.name+=' + Robot Armor';description.description+='\n\nRobot Armor\n50% incoming damage reduction; +25% ATK. Every 2 attacks, blast up to 2 random enemies for 50% current ATK each.';}
      return description;
    }
    return {ID,frontline,endTurn,countedAttack,attack,kill,describe,reduction:unit=>!api.suppressed(unit)&&runtime(unit).robotArmor?.5:0};
  };
})(window);
