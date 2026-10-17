/* Yuno skills and additive shield layers. No persistence or reward hooks. */
(function (host) {
  'use strict';
  host.createYunoSkills = function (api) {
    const SPIRIT='yuno-spirit', DEMONIC='tower-champion-lucky', LIMIT=Number.MAX_VALUE/1024;
    const {runtime,id,has,alive,all,allies,enemies,team,atk,random,refresh,log}=api;
    const bounded=value=>Math.max(0,Math.min(LIMIT,Math.floor(Number(value)||0)));
    const state=(unit,key=id(unit))=>api.passiveRuntimeFor(unit,key).yuno ||= {entered:false,absorbed:0};
    const layerTotal=unit=>(runtime(unit).yunoShields||[]).reduce((sum,layer)=>Math.min(LIMIT,sum+layer.amount),0);
    function addLayer(unit,amount,expiresAt=null) {
      const value=bounded(amount); if(!unit||!alive(unit)||!value)return;
      const r=runtime(unit), layers=r.yunoShields ||= [];
      const existing=layers.find(layer=>layer.expiresAt===expiresAt);
      if(existing)existing.amount=Math.min(LIMIT,existing.amount+value);
      else layers.push({amount:value,expiresAt});
      r.shield=Math.min(LIMIT,r.shield+value);
      if(!r.shieldKind)r.shieldKind='wind';
      refresh(unit);
    }
    function consumeLayers(unit,amount) {
      const r=runtime(unit),layers=r.yunoShields;
      if(!layers?.length)return;
      let remaining=amount;
      // Spend short-lived layers first, keeping permanent shields intact.
      layers.sort((a,b)=>(a.expiresAt??Infinity)-(b.expiresAt??Infinity));
      for(const layer of layers){const used=Math.min(layer.amount,remaining);layer.amount-=used;remaining-=used;if(!remaining)break;}
      r.yunoShields=layers.filter(layer=>layer.amount>0);
    }
    function clearLegacyShield(unit) {
      const r=runtime(unit);r.shield=layerTotal(unit);r.shieldKind=r.shield?'wind':'';
    }
    function entry(bs,unit) {
      if(id(unit)!==SPIRIT||state(unit).entered)return;
      state(unit).entered=true;
      for(const ally of allies(bs,unit))addLayer(ally,unit.maxHp*.48);
      log('[PASSIVE] Spirit Wind Grimoire: permanent team shields.','passive');
    }
    function dodge(bs,unit) {
      if(id(unit)!==SPIRIT)return;
      addLayer(unit,unit.hp*.30,(bs.turnCount||0)+3);
    }
    function shuffle(bs,unit) {
      const lineup=api.enemyTeam(bs,unit),positions=[],living=[];
      lineup.forEach((enemy,index)=>{if(alive(enemy)){positions.push(index);living.push(enemy);}});
      for(let index=living.length-1;index>0;index--){const other=Math.min(index,Math.floor(random()*(index+1)));[living[index],living[other]]=[living[other],living[index]];}
      positions.forEach((position,index)=>{lineup[position]=living[index];});
      const key=lineup===bs.playerTeam?'playerIndex':'enemyIndex';
      bs[key]=Math.max(0,lineup.findIndex(alive));api.indices(bs);
    }
    function afterAttack(bs,unit,target,outcome,options={}) {
      const key=id(unit);
      if(!alive(unit)||outcome?.skipped||options.isCounter)return;
      if(key===SPIRIT && random()<.26){
        shuffle(bs,unit);
        for(const enemy of [...enemies(bs,unit)])api.hit(bs,unit,enemy,atk(unit)*.48,{yunoSkill:true});
        log('[PASSIVE] Spirit Wind Grimoire: shuffle + 48% ATK wave.','passive');
      }
      if(key===DEMONIC && random()<.44){
        let offset=outcome?.hit&&outcome.damage>0?1:0;
        // The ordinary primary hit is the first pierce hit, never doubled.
        for(const enemy of [...enemies(bs,unit)].filter(enemy=>enemy!==target)){
          const result=api.hit(bs,unit,enemy,atk(unit)*Math.pow(.78,offset),{yunoSkill:true});
          if(result.damage>0)offset++;
        }
        log('[PASSIVE] Anti Spirit Grimoire: 22% decay per subsequent pierce hit.','passive');
      }
    }
    const offensive=(source,target)=>source&&target&&has(source,DEMONIC)&&target.card?.element==='Holy'?2:1;
    const defensive=(source,target)=>source&&target&&has(target,DEMONIC)&&source.card?.element==='Holy'?.78:1;
    function absorb(bs,source,target,amount,meta={}) {
      if(!(amount>0)||!alive(source)||!has(target,DEMONIC)||meta.dot||random()>=.22)return false;
      const value=bounded(amount),c=state(target,DEMONIC);
      c.absorbed=Math.min(LIMIT,c.absorbed+value);
      const lineup=team(bs,target),behind=lineup[lineup.indexOf(target)+1];
      if(alive(behind))addLayer(behind,value);
      log(`[PASSIVE] Anti Spirit Grimoire absorbed ${value.toLocaleString('en-US')} damage.`, 'passive');
      return true;
    }
    function nextDamage(unit,consume=true) {
      if(!has(unit,DEMONIC))return 0;
      const c=state(unit,DEMONIC),value=c.absorbed;
      if(consume)c.absorbed=0;
      return value;
    }
    function endTurn(bs) {
      for(const unit of all(bs)){
        const r=runtime(unit),layers=r.yunoShields;if(!layers?.length)continue;
        let expired=0;
        r.yunoShields=layers.filter(layer=>{if(layer.expiresAt!==null && (bs.turnCount||0)>=layer.expiresAt){expired+=layer.amount;return false;}return true;});
        if(expired){r.shield=Math.max(0,r.shield-expired);if(!r.shield&&r.shieldKind==='wind')r.shieldKind='';refresh(unit);}
      }
    }
    return {SPIRIT,DEMONIC,entry,dodge,afterAttack,offensive,defensive,absorb,nextDamage,endTurn,layerTotal,addLayer,consumeLayers,clearLegacyShield,
      canAbsorb:unit=>has(unit,DEMONIC),dodgeChance:unit=>has(unit,SPIRIT)?.30:0};
  };
})(window);
