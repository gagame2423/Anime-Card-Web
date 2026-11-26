/* Read-only, fixed-roster team planning. The search runs in an isolated worker. */
(function (host) {
  'use strict';
  const RANKS=['Common','Rare','Epic','Legendary','Mythic','Secret'], RELIC_TIERS=['none','common','rare','legendary','unique'];
  const LEVELS=[1,15,35,60,85,100], MAX_TURNS=200;
  const TARGETS=[
    {name:'Luck',target:.25,minimum:1,description:'Budget clear with favorable combat rolls.'},
    {name:'Balanced',target:.85,minimum:2,description:'A consistent clear with practical investment.'},
    {name:'Overpower',target:1,minimum:3,description:'Aim for a clean sweep, including high enemy stat rolls.'}
  ];
  const clone=value=>JSON.parse(JSON.stringify(value));
  const rank=card=>Math.max(0,RANKS.indexOf(card.rarity));
  const seeded=seed=>{let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};};
  const cardMap=()=>new Map(host.ALL_CARDS.map(c=>[c.id,c]));
  const rarityOf=roll=>roll?.unique?4:roll?RELIC_TIERS.indexOf(roll.rarity):0;
  const levelScale=level=>host.CardLevelSystem.statMultiplier(level);
  const number=n=>Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
  function compatible(card,roll){
    if(!roll||!host.RelicSystem.validRoll(roll))return false;
    const match=host.RelicSystem.compatibility(card,roll);
    return Boolean(match?.base.active&&(!roll.unique||match.unique?.active));
  }
  // No generic fallback for a stage. A mode must have an explicit fixed-roster
  // adapter, and the actual generated rosters must match its declaration.
  const auditedTypes={raid:new Set(['marine_fort','holy_grail','shibuya','akatsuki']),'boss-event':new Set(['alucard','lucius','gomen','ragna','pride']),rift:new Set()};
  const adapters={
    raid:{
      types:()=>host.RaidSystem?.TYPES,
      ids:d=>Array.isArray(d?.enemies)?d.enemies.map(row=>row[0]):null,
      size:4,
      variants:(type,difficulty)=>[
        host.RaidSystem.enemies(type,difficulty,()=>1-Number.EPSILON),
        host.RaidSystem.enemies(type,difficulty,()=>0),
        ...Array.from({length:6},(_,i)=>host.RaidSystem.enemies(type,difficulty,seeded(1973+i*379)))
      ]
    },
    'boss-event':{
      types:()=>host.BossEventSystem?.TYPES,
      ids:d=>typeof d?.cardId==='string'?[d.cardId]:null,
      size:5,
      variants:(type,difficulty)=>[host.BossEventSystem.enemies(type,difficulty)]
    },
    rift:{
      types:()=>host.RiftSystem?.TYPES,
      ids:d=>Array.isArray(d?.bosses)&&d.bosses.length===1&&d?.minion&&Array.isArray(d.stats)?
        d.stats.map((_,i)=>i===d.stats.length-1?d.bosses[0]:d.minion):null,
      size:5,fixedDifficulty:true,
      variants:type=>[host.RiftSystem.enemies(()=>0,type),host.RiftSystem.enemies(()=>1-Number.EPSILON,type)]
    }
  };
  const randomStage=d=>Boolean(d?.randomModifiers||d?.randomLineup||d?.randomizedModifiers||d?.stageModifiers||d?.randomBoss||d?.randomized||d?.deterministic===false);
  function eligible(mode,type){
    const adapter=Object.hasOwn(adapters,mode)?adapters[mode]:null,def=adapter?.types()?.[type];
    const list=adapter?.ids(def);
    return Boolean(adapter&&def&&(auditedTypes[mode].has(type)||def.recommendationFixed===true)&&!randomStage(def)&&list?.length&&list.every(id=>typeof id==='string'));
  }
  function availableModes(){
    return Object.keys(adapters).map(mode=>({mode,types:Object.entries(adapters[mode].types()||{}).filter(([type])=>eligible(mode,type))})).filter(row=>row.types.length);
  }
  function scenario(context){
    if(!context)return null;
    const {mode,type}=context;if(!eligible(mode,type))return null;
    const adapter=adapters[mode],def=adapter.types()[type],difficulty=adapter.fixedDifficulty?1:Math.min(1000,Math.max(1,Math.floor(Number(context.difficulty)||1)));
    const expected=adapter.ids(def),scenarios=adapter.variants(type,difficulty);
    if(!scenarios.length||scenarios.some(team=>team.length!==expected.length||team.some((u,i)=>u?.card?.id!==expected[i])))return null;
    return {mode,type,difficulty,size:adapter.size,name:def.name,fixedRoster:expected,explicitlyAudited:auditedTypes[mode].has(type)||def.recommendationFixed===true,enemyTeams:clone(scenarios),weather:[...(context.weather||[])],aqua:context.aqua==='atk'?'atk':'hp',
      turnMs:context.turnMs===1000?1000:3000};
  }
  const configKey=c=>c?JSON.stringify([c.mode,c.type,c.difficulty,c.weather||[],c.aqua]):'';

  function mutationOptions(){
    const all=host.MUTATIONS;
    const burden=m=>({common:1,uncommon:2,rare:3})[m.rarity]||3;
    const make=mutations=>{
      const ids=mutations.map(m=>m.id);
      // Double variants require both weathers and two independent mutations.
      const group=mutations.length===0?0:mutations.length===1?burden(mutations[0]):Math.min(5,2+Math.max(...mutations.map(burden)));
      return {ids,group,cost:mutations.reduce((n,m)=>n+burden(m),0)+(mutations.length>1?3:0),...host.MutationSystem.factors(ids)};
    };
    const options=[make([]),...all.map(m=>make([m]))];
    for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)options.push(make([all[i],all[j]]));
    return options;
  }
  let relicCache=new Map(),mutationCache,mutationBands=[],optionCache=new Map();
  const combatFeatures=card=>{
    const text=String(card.passive?.description||'').toLowerCase(),caps=host.RelicSystem.capabilities(card);
    const has=pattern=>pattern.test(text);
    return {caps,multi:has(/\ball enemies\b|enemy team|pierc|aoe|multiple enemies/),
      control:has(/\bstun|freeze|fear|hypnos|hindred|poison|silence/),
      sustain:has(/\bheal|lifesteal|shield|dodge|damage reduction|surviv|reviv/),
      support:has(/\b(?:allies|teammate|ally|team)\b/)&&has(/shield|heal|grant|reduce|boost|increas|intercept|redirect|take the hit/),
      scale:has(/(?:stack|per turn|each attack|every attack|every kill|when.*kill)/),
      percentage:has(/(?:enemy|target)(?:'s)? (?:max|maximum|missing|current) hp|(?:max|maximum|missing|current) hp (?:of the )?(?:enemy|target)/),
      bleed:has(/\b(?:inflict(?:s|ed)?|appl(?:y|ies|ied)|cause(?:s|d)?|add(?:s|ed)?|give(?:s)?)[^.;\n]{0,45}\bbleed\b|\bbleeds? (?:the|all|each|target|attacker|enemy|enemies)\b/),burst:has(/\b(?:special attack|x[2-9]|[2-9]\d\d% atk)\b/)};
  };
  function relicValue(roll,profile,enemyCount){
    if(!roll)return 0;
    const f=profile.features;
    // Rank by actual eligible stats and combat mechanics, not the name of a Relic.
    return (roll.atk||0)*1.1+(roll.hp||0)*(f.sustain?1.1:.8)+(roll.followChance||0)*2.3+
      (roll.critChance||0)*.75+(roll.critDamage||0)*.45+(roll.dodge||0)*1.25+
      (roll.stackGain||0)*(f.scale?.95:.35)+(roll.modeHp||0)*.62+
      (roll.specialBonus||0)*(f.burst||f.multi?.82:.45)+(roll.odmChainBonus||0)*2.2+
      (roll.summonBonus||0)*.9+(roll.fatalAtk||0)*.65+(roll.perEnemyAtk||0)*enemyCount*.72+
      (roll.firstAttackBonus||0)*(enemyCount===1?.70:.29)+(roll.unique&&roll.kind==='eternal_eye'?.36:0);
  }
  function targetRoll(card,kind,grade,quality=.45){
    const roll=host.RelicSystem.rollAtTier(kind,grade===4?'legendary':RELIC_TIERS[grade],grade===4,()=>quality);
    if(roll.element!==null)roll.element=card.element;
    return compatible(card,roll)?roll:null;
  }
  function relicOptions(profile,grade,enemyCount){
    if(grade===0)return [null];
    const cacheKey=profile.card.id+'|'+grade+'|'+enemyCount;
    if(relicCache.has(cacheKey))return relicCache.get(cacheKey);
    const choices=host.RelicSystem.DEFINITIONS.filter(d=>!(d.dropOnly&&grade<=2)&&!(d.kind==='potara_earring'&&grade===4)).map(d=>{
      const roll=targetRoll(profile.card,d.kind,grade);
      return roll&&{roll,score:relicValue(roll,profile,enemyCount),cost:Object.values(d.costs||{}).reduce((n,v)=>n+v,0)};
    }).filter(Boolean).sort((a,b)=>b.score-a.score||a.cost-b.cost||a.roll.kind.localeCompare(b.roll.kind)).map(row=>row.roll);
    relicCache.set(cacheKey,choices);
    return choices;
  }
  function cost(team,cards){
    // Compare the highest required rarity before paying for harder mutations,
    // rarer Relics, additional levels and total acquisition odds.
    const bands=team.map(u=>mutationCache.find(m=>m.ids.length===u.mutationIds.length&&m.ids.every(id=>u.mutationIds.includes(id))));
    const rarities=team.map(u=>rank(cards.get(u.cardId)));
    const quality=team.reduce((sum,u)=>{
      if(!u.relic)return sum;
      const d=host.RelicSystem.DEFINITIONS.find(d=>d.kind===u.relic.kind),tier=Math.min(2,rarityOf(u.relic)-1),range=d.ranges[tier],stat=d.stat==='both'?'atk':d.stat;
      return sum+((u.relic[stat]||0)*100-range[0])/Math.max(.01,range[1]-range[0]);
    },0);
    return [Math.max(...rarities),rarities.reduce((a,b)=>a+b,0),Math.max(...bands.map(m=>m.group)),bands.reduce((n,m)=>n+m.cost,0),
      Math.max(...team.map(u=>rarityOf(u.relic))),team.reduce((n,u)=>n+rarityOf(u.relic),0),Math.round(quality*100),
      team.reduce((n,u)=>n+u.level,0),team.reduce((n,u)=>n+Math.log10(host.CardLevelSystem.effectiveRate(cards.get(u.cardId))),0)];
  }
  const cmp=(a,b)=>{for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]-b[i];return 0;};
  const signature=team=>JSON.stringify(team);
  function profiles(spec,cards){
    const enemies=spec.enemyTeams[0],elements=enemies.map(e=>e.card.element);
    const totalHp=enemies.reduce((n,e)=>n+e.hp,0),hp=Math.max(...enemies.map(e=>e.hp)),atk=Math.max(...enemies.map(e=>e.atk));
    const rows=[...cards.values()].filter(c=>c.stats?.hp>0&&c.stats?.atk>0).map(card=>{
      const features=combatFeatures(card),attackElement=elements.reduce((n,e)=>n+host.ElementSystem.multiplier(card,e),0)/elements.length,
        defenseElement=elements.reduce((n,e)=>n+host.ElementSystem.multiplier(e,card),0)/elements.length;
      return {card,features,attackElement,defenseElement,rank:rank(card),hp,atk,totalHp,enemyCount:enemies.length};
    });
    return rows;
  }
  function score(profile,level,opt,relic,role){
    const {card,features:f,attackElement,defenseElement,hp,atk,totalHp,enemyCount}=profile;
    const m=levelScale(level),rv=relicValue(relic,profile,enemyCount);
    const a=card.stats.atk*m*opt.atk*attackElement*(1+(relic?.atk||0)),h=card.stats.hp*m*opt.hp/Math.max(.2,defenseElement)*(1+(relic?.hp||0));
    const offense=Math.log1p(a/Math.max(1,hp)*8)*(1+(f.multi&&enemyCount>1?.5:0)+(f.burst?.22:0));
    const survival=Math.log1p(h/Math.max(1,atk)*.65)*(1+(f.sustain?.48:0));
    const skill=(f.percentage?.20:0)+(f.scale?.14:0)+(f.control?.22:0)+(f.bleed?.06:0);
    // Utility can make a lower-rarity card worth keeping even on a much harder boss.
    const support=f.support?.38:0;
    const value=(role==='tank'?offense*.7+survival*1.35:role==='support'?offense*.78+survival*.55+support*1.9:offense*1.3+survival*.6)+
      skill+support*.45+rv*.24-(role==='budget'?profile.rank*.15:0);
    return value;
  }
  function optionFor(profile,level,group,grade,role){
    const key=profile.card.id+'|'+level+'|'+group+'|'+grade+'|'+role;
    if(optionCache.has(key))return optionCache.get(key);
    const roll=relicOptions(profile,grade,profile.enemyCount)[0]||relicOptions(profile,grade===4?3:0,profile.enemyCount)[0]||null;
    let best=null;
    // Score every mutation variant in the current difficulty band.
    for(const opt of mutationBands[group]||mutationCache){
      const value=score(profile,level,opt,roll,role)-opt.cost*.012;
      if(!best||value>best.value)best={value,cardId:profile.card.id,level,mutationIds:opt.ids,relic:roll,profile};
    }
    optionCache.set(key,best);return best;
  }
  function lineups(rows,cap,level,group,grade,size,style){
    const eligibleRows=rows.filter(p=>p.rank<=cap),used=new Set(),chosen=[];
    const roles=style===1?['tank','support','carry']:style===2?['carry','budget','support']:['carry','carry','tank'];
    const pools=new Map();
    for(let i=0;i<size;i++){
      const role=roles[Math.min(i,roles.length-1)];
      if(!pools.has(role))pools.set(role,eligibleRows.map(p=>optionFor(p,level,group,grade,role)).sort((a,b)=>b.value-a.value||a.profile.rank-b.profile.rank));
      let best=null,bestScore=-Infinity;
      for(const opt of pools.get(role)){
        if(used.has(opt.cardId))continue;
        const pair=(chosen.some(x=>x.cardId==='finn-the-human')&&opt.cardId==='jake-the-dog'||chosen.some(x=>x.cardId==='jake-the-dog')&&opt.cardId==='finn-the-human')?.55:0;
        const value=opt.value+pair+(i>0&&opt.profile.features.support?.13:0);
        if(value>bestScore){bestScore=value;best=opt;}
      }
      if(!best)return null;
      chosen.push(best);used.add(best.cardId);
    }
    // Avoid sacrificial buffers in front of the unit they are meant to protect.
    const frontline=chosen.findIndex(u=>u.cardId==='finn-the-human');
    if(frontline>0&&chosen.some(u=>u.cardId==='jake-the-dog'))chosen.unshift(...chosen.splice(frontline,1));
    return chosen.map(({cardId,level,mutationIds,relic})=>({cardId,level,mutationIds:[...mutationIds],relic}));
  }
  function runBattle(spec,team,seed,enemyIndex,cards){
    const random=seeded(seed),blueprint=spec.enemyTeams[enemyIndex%spec.enemyTeams.length],enemyTeam=clone(blueprint);
    const playerTeam=team.map(row=>{
      const card=cards.get(row.cardId),f=host.MutationSystem.factors(row.mutationIds),scale=levelScale(row.level);
      const hp=Math.round(card.stats.hp*f.hp*scale),atk=Math.round(card.stats.atk*f.atk*scale);
      const unit={card:clone(card),display:{name:card.name,image:card.image,hp,atk},hp,maxHp:hp,atk,level:row.level,mutations:row.mutationIds.map(id=>host.MUTATION_BY_ID[id]),defeated:false};
      return host.RelicSystem.applyToUnit(unit,row.relic?clone(row.relic):null);
    });
    const engine=host.PassiveSystem.createIsolated({random,getCardById:id=>cards.has(id)?clone(cards.get(id)):null,isWeatherActive:name=>spec.weather.some(w=>w.toLowerCase()===String(name).toLowerCase())});
    const battle={mode:spec.mode,sandbox:true,playerTeam,enemyTeam,playerIndex:0,enemyIndex:0,turn:'player',finished:false,isBattling:true,
      championChoices:{aqua:spec.aqua},mimicPools:{player:team.map(u=>u.cardId),enemy:[]}};
    if(spec.mode==='raid')battle.raid={type:spec.type,difficulty:spec.difficulty};
    else if(spec.mode==='boss-event')battle.bossEvent={type:spec.type,difficulty:spec.difficulty};
    else if(spec.mode==='rift')battle.rift={type:spec.type};
    engine.beginBattle(battle);
    let winner=engine.checkBattleWinner(battle),turns=0;
    while(!winner&&turns<MAX_TURNS&&battle.playerTeam.length+battle.enemyTeam.length<=80){
      const result=engine.resolveTurn(battle);turns++;winner=result?.winner||engine.checkBattleWinner(battle);
    }
    const alive=unit=>unit.hp>0&&!unit.defeated;
    const survivors=battle.playerTeam.filter(alive).length,remaining=battle.enemyTeam.filter(alive).reduce((n,u)=>n+u.hp,0);
    return {win:winner==='player',turns,survivors,remaining,timeout:!winner};
  }
  const trainingSeeds=[741,1123,19271,73211,223181,82317];
  const validationSeeds=Array.from({length:12},(_,i)=>(0x9E3779B9*(i+31))>>>0);
  const reportingSeeds=Array.from({length:32},(_,i)=>(0x85EBCA6B*(i+113))>>>0);
  async function assess(spec,team,cards,seeds,yieldWork,stop){
    const out={wins:0,total:seeds.length,turns:0,minSurvivors:Infinity,remaining:0,timeouts:0,errors:0};
    for(let i=0;i<seeds.length;i++){
      if(stop())break;
      try{
        const row=runBattle(spec,team,seeds[i],i%spec.enemyTeams.length,cards);
        if(row.win){out.wins++;out.turns+=row.turns;out.minSurvivors=Math.min(out.minSurvivors,row.survivors);}
        out.remaining+=row.remaining;out.timeouts+=Number(row.timeout);
      }catch(_){out.errors++;out.remaining+=Number.MAX_SAFE_INTEGER;}
      await yieldWork();
    }
    return {...out,rate:out.wins/out.total,clearTurns:out.wins?out.turns/out.wins:null,minSurvivors:Number.isFinite(out.minSurvivors)?out.minSurvivors:0};
  }
  function gearFits(row,index){
    const grades=row.team.map(u=>rarityOf(u.relic));
    return index===0?Math.max(...grades)<=2:index===1?grades.every(g=>g===2||g===3):grades.every(g=>g>=3);
  }
  function qualifies(row,index){
    return gearFits(row,index)&&row.stats.errors===0&&row.stats.rate>=TARGETS[index].target&&(index!==2||row.stats.minSurvivors>=2);
  }
  async function search(spec,onProgress=()=>{},stop=()=>false,yieldWork=async()=>{}){
    if(!spec||!Object.hasOwn(adapters,spec.mode)||!spec.explicitlyAudited||!Array.isArray(spec.fixedRoster)||!spec.fixedRoster.length||
      !Array.isArray(spec.enemyTeams)||!spec.enemyTeams.length||spec.enemyTeams.some(team=>team.length!==spec.fixedRoster.length||team.some((unit,i)=>unit?.card?.id!==spec.fixedRoster[i])))return [];
    
    relicCache=new Map();optionCache=new Map();mutationCache=mutationOptions();
    mutationBands=Array.from({length:6},(_,band)=>{
      const allowed=mutationCache.filter(m=>m.group<=band);
      return allowed.filter((m,i)=>!allowed.some((other,j)=>j!==i&&other.cost<=m.cost&&other.group<=m.group&&other.hp>=m.hp&&other.atk>=m.atk&&(other.cost<m.cost||other.hp>m.hp||other.atk>m.atk||j<i)));
    });
    const cards=cardMap(),rows=profiles(spec,cards),tested=new Map(),shortlist=[[],[],[]],fallback=[null,null,null];let done=0,lastProgress=0,best=null;
    function remember(row){
      if(!best||row.stats.rate>best.stats.rate||row.stats.rate===best.stats.rate&&(row.stats.remaining<best.stats.remaining||row.stats.remaining===best.stats.remaining&&cmp(row.cost,best.cost)<0))best=row;
      for(let t=0;t<3;t++){
        if(gearFits(row,t)&&(!fallback[t]||row.stats.rate>fallback[t].stats.rate||row.stats.rate===fallback[t].stats.rate&&(row.stats.remaining<fallback[t].stats.remaining||row.stats.remaining===fallback[t].stats.remaining&&cmp(row.cost,fallback[t].cost)<0)))fallback[t]=row;
        if(!qualifies(row,t))continue;
        const list=shortlist[t];list.push(row);list.sort((a,b)=>cmp(a.cost,b.cost)||b.stats.rate-a.stats.rate||a.stats.clearTurns-b.stats.clearTurns);
        if(list.length>7)list.pop();
      }
    }
    async function evaluate(team){
      if(!team||stop())return null;const key=signature(team);if(tested.has(key))return tested.get(key);
      const budget=cost(team,cards);
      const probe=await assess(spec,team,cards,trainingSeeds.slice(0,3),yieldWork,stop);
      const stats=probe.wins?await assess(spec,team,cards,trainingSeeds,yieldWork,stop):probe,row={team,cost:budget,stats};
      tested.set(key,row);remember(row);done++;
      const now=Date.now();if(now-lastProgress>140){lastProgress=now;onProgress({tested:done,found:shortlist.map(s=>s.length>0)});}
      await yieldWork();return row;
    }
    // Start with each lower rarity at accessible mutation/Relic grades. Only
    // escalate once the cheaper stage cannot meet the desired reliability.
    for(let cap=0;cap<RANKS.length&&!stop();cap++){
      for(let band=0;band<=5&&!stop();band++){
        // For each mutation budget, try normal levels/Relics; increase levels
        // before demanding a rarer Relic. The last ladder explores harder kits.
        const stages=band===0?[[1,0],[15,0],[35,0],[60,0],[85,0],[100,0],[35,1],[70,1],[100,1],[100,2],[100,3],[100,4]]:
          [[35,0],[60,0],[85,0],[100,0],[60,1],[100,2],[100,3],[100,4]];
        for(const [level,grade] of stages){
          if(stop())break;
          const candidate=lineups(rows,cap,level,band,grade,spec.size,0);
          await evaluate(candidate);
          if(candidate&&[0,2,4].includes(band)&&[60,100].includes(level)&&[0,3,4].includes(grade))await evaluate(lineups(rows,cap,level,band,grade,spec.size,1));
          if(shortlist.every(list=>list.some(row=>row.cost[0]<=cap&&row.cost[2]<=band)))break;
        }
        if(shortlist.every(list=>list.length))break;
      }
      if(shortlist.every(list=>list.length))break;
    }
    if(stop()||!best)return [];
    // Independent seeds include each fixed-roster enemy-stat sample and the
    // maximum possible Raid HP/ATK rolls. Never report a theoretical guarantee.
    const verified=new Map();
    async function verify(row){
      const key=signature(row.team);if(verified.has(key))return verified.get(key);
      const stats=await assess(spec,row.team,cards,validationSeeds,yieldWork,stop),value={...row,stats};verified.set(key,value);await yieldWork();return value;
    }
    const result=[];
    for(let i=0;i<3&&!stop();i++){
      onProgress({tested:done,found:shortlist.map(s=>s.length>0),phase:'validation',tier:TARGETS[i].name});
      const options=[...new Set([...shortlist[i],fallback[i]||best])].sort((a,b)=>cmp(a.cost,b.cost));
      let choice=null,alternate=null;
      for(const row of options){
        if(stop())return [];
        const trial=await verify(row);
        if(!alternate||trial.stats.rate>alternate.stats.rate||trial.stats.rate===alternate.stats.rate&&cmp(trial.cost,alternate.cost)<0)alternate=trial;
        if(qualifies(trial,i)){choice=trial;break;}
      }
      choice=choice||alternate||await verify(fallback[i]||best);
      // One bounded pass: swap to easier variants, lower levels or lower Relic
      // rarity and keep changes only if the independent test still clears the target.
      if(qualifies(choice,i)){
        let attempts=0;
        for(let slot=0;slot<choice.team.length&&attempts<choice.team.length*5&&!stop();slot++){
          const u=choice.team[slot],profile=rows.find(p=>p.card.id===u.cardId),mut=mutationCache.find(m=>m.ids.join('+')===u.mutationIds.join('+'));
          const edits=[];
          if(u.relic){
            const grade=rarityOf(u.relic);
            if(i<2)edits.push({relic:relicOptions(profile,Math.max(0,grade-1),profile.enemyCount)[0]||null});
            if(i===0)edits.push({relic:null});
            const alternate=relicOptions(profile,grade,profile.enemyCount).find(r=>r.kind!==u.relic.kind);
            if(alternate)edits.push({relic:alternate});
          }
          if(u.level>1)edits.push({level:LEVELS.filter(n=>n<u.level).at(-1)||1});
          if(mut?.group>0)edits.push({mutationIds:optionFor(profile,u.level,mut.group-1,rarityOf(u.relic),'carry').mutationIds});
          const remaining=new Set(choice.team.map(v=>v.cardId));
          const cheaper=rows.filter(p=>p.rank<profile.rank&&!remaining.has(p.card.id)).map(p=>optionFor(p,u.level,mut?.group||0,rarityOf(u.relic),slot===0?'tank':'support')).sort((a,b)=>b.value-a.value)[0];
          if(cheaper)edits.push({cardId:cheaper.cardId,mutationIds:cheaper.mutationIds,relic:cheaper.relic});
          for(const edit of edits){
            attempts++;const team=clone(choice.team);Object.assign(team[slot],edit);
            const budget=cost(team,cards),delta=cmp(budget,choice.cost);
            if(delta>0||!gearFits({team},i))continue;
            const candidate=await evaluate(team);if(candidate&&qualifies(candidate,i)){
              const test=await verify(candidate);
              if(qualifies(test,i)&&(delta<0||test.stats.rate>choice.stats.rate||test.stats.rate===choice.stats.rate&&test.stats.clearTurns<choice.stats.clearTurns))choice=test;
            }
          }
        }
      }
      // A separate set reports clear rates. If the cheapest candidate fails
      // the desired reliability, strengthen it without changing the roster
      // first, and measure the strengthened setup on additional seeds.
      let finalStats=await assess(spec,choice.team,cards,reportingSeeds,yieldWork,stop);
      if(!qualifies({...choice,stats:finalStats},i)&&!stop()){
        onProgress({tested:done,found:shortlist.map(s=>s.length>0),phase:'validation',tier:TARGETS[i].name});
        const stronger=[];
        const propose=team=>{if(signature(team)!==signature(choice.team)&&gearFits({team},i))stronger.push({team,cost:cost(team,cards)});};
        propose(choice.team.map(row=>({...row,level:Math.min(100,row.level+15)})));
        propose(choice.team.map(row=>({...row,level:100})));
        propose(choice.team.map(row=>({...row,relic:row.relic?targetRoll(cards.get(row.cardId),row.relic.kind,rarityOf(row.relic),.8)||row.relic:null})));
        propose(choice.team.map(row=>{
          const profile=rows.find(p=>p.card.id===row.cardId),m=mutationCache.find(opt=>opt.ids.join('+')===row.mutationIds.join('+')),group=Math.min(5,(m?.group||0)+1);
          return {...row,level:100,mutationIds:optionFor(profile,100,group,rarityOf(row.relic),'carry').mutationIds};
        }));
        const candidates=[...new Map(stronger.map(row=>[signature(row.team),row])).values()].sort((a,b)=>cmp(a.cost,b.cost));
        const confirmSeeds=[...reportingSeeds,...Array.from({length:16},(_,j)=>(0xC2B2AE35*(j+223))>>>0)];
        for(const candidate of candidates){
          if(stop())break;
          const stats=await assess(spec,candidate.team,cards,confirmSeeds,yieldWork,stop);
          if(qualifies({...candidate,stats},i)){choice=candidate;finalStats=stats;break;}
          if(stats.rate>finalStats.rate){choice=candidate;finalStats=stats;}
        }
        if(i===2&&!qualifies({...choice,stats:finalStats},i)&&!stop()){
          for(let cap=Math.max(0,choice.cost[0]);cap<RANKS.length;cap++){
            if(stop())break;
            const team=lineups(rows,cap,100,5,4,spec.size,1),candidate={team,cost:cost(team,cards)};
            if(signature(team)===signature(choice.team))continue;
            const stats=await assess(spec,team,cards,confirmSeeds,yieldWork,stop);
            if(qualifies({...candidate,stats},i)){choice=candidate;finalStats=stats;break;}
            if(stats.rate>finalStats.rate){choice=candidate;finalStats=stats;}
          }
        }
      }
      result.push({name:TARGETS[i].name,description:TARGETS[i].description,goal:TARGETS[i].target,met:qualifies({...choice,stats:finalStats},i),team:choice.team,stats:finalStats,cost:choice.cost});
    }
    return result;
  }

  // Worker entry: only passive rules and read-only data, no persistent storage.
  const IS_WORKER=typeof host.document==='undefined';
  if(IS_WORKER){
    host.window=host;
    host.InventorySystem={registerItem(){}};
    host.OnlineUtils={stable:JSON.stringify};
    host.localStorage={getItem(){return null;},setItem(){throw Error('Planning cannot write progress.');}};
    host.onmessage=async event=>{
      try{
        const {spec,urls}=event.data;
        importScripts(...urls);
        const data=await search(spec,progress=>host.postMessage({type:'progress',...progress}));
        host.postMessage({type:'result',data});
      }catch(error){host.postMessage({type:'error',message:error.message||'Unable to evaluate this encounter.'});}
    };
    return;
  }

  // Main-thread presentation. Enemy generation and actual inventory access
  // stay here; the worker receives only combat blueprints and planning targets.
  const doc=host.document;
  const moduleNames=['cards','skins','category','elements','mutations','levels','grimoire','yuno','requiem','reagan','fate','spooky_passives','gomen','shibuya','companions','combat_stats','dragon_skills','relic_combat','tower_200_passives','ragna_passives','mourner','akatsuki_passives','enten','titan_passives','turn_phase','baller_passives','tensura_passives','sins_passives','bleach_passives','hextech_passives','content_passives','passives','relics'];
  function resourceURLs(){
    const declarations=[...doc.querySelectorAll('script[data-game-script]')].map(s=>s.src);
    return moduleNames.map(name=>declarations.find(url=>new URL(url).pathname.endsWith('/'+name+'.js'))||new URL(name+'.js',doc.baseURI).href);
  }
  const getCard=id=>(host.ALL_CARDS||[]).find(c=>c.id===id);
  function ownedRelic(card,target,includeBound=false){
    if(!target)return null;
    const R=host.RelicSystem,values=R.list();
    const fields=['atk','hp','followChance','stackGain','critChance','critDamage','dodge','specialBonus','odmChainBonus','perEnemyAtk','fatalAtk','summonBonus','modeHp','firstAttackBonus'];
    const match=[];
    for(const item of values){
      const raw=item.metadata?.relic,binding=item.metadata?.binding;
      if(!raw||raw.kind!==target.kind||!includeBound&&binding&&binding.cardId!==card.id)continue;
      const roll=R.normalizeRoll(raw);if(rarityOf(roll)<rarityOf(target)||!compatible(card,roll))continue;
      if(fields.some(field=>(roll[field]||0)+1e-9<(target[field]||0)))continue;
      match.push(item);
    }
    return match.sort((a,b)=>Number(b.metadata.binding?.cardId===card.id)-Number(a.metadata.binding?.cardId===card.id)||rarityOf(a.metadata.relic)-rarityOf(b.metadata.relic)||a.id.localeCompare(b.id))[0]||null;
  }
  function mount(bridge){
    const root=doc.getElementById('recommendTeamModal'),button=doc.getElementById('recommendTeamButton');
    if(!root||!button)return null;
    const q=selector=>root.querySelector(selector),out=q('[data-rec-results]'),status=q('[data-rec-status]'),close=q('[data-rec-close]'),modeSelect=q('[data-rec-mode]'),typeSelect=q('[data-rec-type]'),difficulty=q('[data-rec-difficulty]'),run=q('[data-rec-run]'),
      inspection=q('[data-rec-inspection]'),inspectionTitle=q('[data-rec-inspection-title]'),inspectionBody=q('[data-rec-inspection-body]');
    const cache=new Map();let worker=null,job=0,selectedSpec=null,currentResults=[],openContext=null,priorFocus=null,detailAnchor=null,detailPinned=false,hideTimer=0;
    const el=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
    function refreshEntry(){
      const c=bridge.context?.(),valid=c&&eligible(c.mode,c.type)&&bridge.canOpen?.();
      button.hidden=!valid;button.disabled=!valid;
    }
    function cancel(){job++;worker?.terminate();worker=null;run.disabled=false;}
    function clearInspection(restore=false){
      clearTimeout(hideTimer);const anchor=detailAnchor;detailAnchor=null;detailPinned=false;
      if(anchor)anchor.setAttribute('aria-expanded','false');inspection.hidden=true;
      if(restore&&anchor?.isConnected){anchor.focus({preventScroll:true});}
    }
    function stop(){cancel();clearInspection();if(root.open)root.close();if(priorFocus?.isConnected)priorFocus.focus({preventScroll:true});}
    function updateTypes(preferred=''){
      const group=availableModes().find(g=>g.mode===modeSelect.value);
      typeSelect.replaceChildren(...(group?.types||[]).map(([key,value])=>{const o=el('option','',value.name);o.value=key;return o;}));
      if([...typeSelect.options].some(o=>o.value===preferred))typeSelect.value=preferred;
      const c=bridge.context?.(),type=typeSelect.value;
      difficulty.value=c?.mode===modeSelect.value&&c?.type===type?String(c.difficulty||1):String(bridge.difficulty?.(modeSelect.value,type)||1);
      difficulty.disabled=adapters[modeSelect.value]?.fixedDifficulty===true;
      invalidate();
    }
    function invalidate(){
      cancel();clearInspection();currentResults=[];selectedSpec=null;out.replaceChildren();
      status.textContent='Choose your encounter and difficulty, then evaluate teams.';
    }
    function readConfig(){
      const value=Math.min(1000,Math.max(1,Math.floor(Number(difficulty.value)||1)));difficulty.value=String(value);
      return {mode:modeSelect.value,type:typeSelect.value,difficulty:value,weather:[...(openContext?.weather||[])],aqua:openContext?.aqua,turnMs:openContext?.turnMs};
    }
    function open(){
      const c=bridge.context?.();if(root.open||!bridge.canOpen?.()||!eligible(c?.mode,c?.type))return false;
      openContext=c;priorFocus=doc.activeElement;
      modeSelect.replaceChildren(...availableModes().map(row=>{
        const option=el('option','',{'raid':'Raid','boss-event':'Boss Event','rift':'Rift'}[row.mode]);option.value=row.mode;return option;
      }));
      modeSelect.value=c.mode;updateTypes(c.type);difficulty.value=String(c.difficulty||1);
      root.showModal();close.focus();generate();return true;
    }
    function portrait(row,card){
      const frame=el('span','rec-portrait'),img=el('img');frame.dataset.rarity=card.rarity;
      img.src=card.image;img.alt='';img.loading='lazy';img.addEventListener('error',()=>img.remove(),{once:true});
      frame.append(el('span','rec-art-fallback','✦'),img);
      const mutations=row.mutationIds.map(id=>host.MUTATION_BY_ID[id]).filter(Boolean);
      if(mutations.length){
        frame.style.setProperty('--rec-mut-a',host.MutationSystem.accent(mutations[0]));
        frame.style.setProperty('--rec-mut-b',host.MutationSystem.accent(mutations.at(-1)));frame.classList.add('has-mutation');
      }
      return frame;
    }
    const mutationName=row=>row.mutationIds.map(id=>host.MUTATION_BY_ID[id]?.name||id).join(' + ')||'Normal';
    function ownership(row,card){
      const entry=bridge.variant?.(row.cardId,row.mutationIds),level=bridge.level?.(row.cardId)||1;
      return {entry,level,text:entry?level>=row.level?'✓ Owned':'Owned · Lv. '+level+' / '+row.level:bridge.owned?.(card.id)?'Need mutation':'Unlock card',ready:Boolean(entry&&level>=row.level)};
    }
    function relicHeadline(roll){
      if(!roll)return 'No Relic required';
      const name=host.RelicSystem.DEFINITIONS.find(d=>d.kind===roll.kind)?.name||'Relic';
      return name+' · '+(roll.unique?'Unique Legendary':roll.rarity[0].toUpperCase()+roll.rarity.slice(1));
    }
    function relicSummary(roll){
      if(!roll)return 'Save materials';
      const terms=[];
      for(const [key,label]of [['atk','ATK'],['hp','HP'],['followChance','Follow-up'],['stackGain','Stack gain']])
        if(roll[key]>0)terms.push('+'+number(roll[key]*100)+(key==='followChance'?' pp ':'% ')+label);
      if(roll.element&&host.RelicSystem.requirement?.(roll)?.element)terms.push(roll.element);
      const unique=roll.unique?host.RelicSystem.uniqueText(roll):'';
      return terms.join(' / ')+(unique?' · '+unique:'');
    }
    function tactic(team,spec){
      const cards=team.map(row=>getCard(row.cardId)),traits=cards.map(card=>[card,combatFeatures(card)]);
      const target=spec.enemyTeams[0][0]?.card?.element;
      const counters=cards.filter(c=>host.ElementSystem.multiplier(c,target)>1).length;
      const bits=[];
      if(counters)bits.push(counters+' '+(counters===1?'unit exploits':'units exploit')+' the enemy’s '+target+' Element.');
      const bleed=traits.find(([,f])=>f.bleed);if(bleed)bits.push(bleed[0].name+' can use Bleed to block healing.');
      const support=traits.find(([,f])=>f.support);if(support)bits.push(support[0].name+' adds team support.');
      const control=traits.find(([,f])=>f.control);if(control)bits.push(control[0].name+' brings control or debuffs.');
      if(!bits.length)bits.push('Use the listed frontline order and Relic stats to trade damage efficiently.');
      return bits.slice(0,2).join(' ');
    }
    function renderResults(rows){
      clearInspection();currentResults=rows;out.replaceChildren();
      for(const [i,row]of rows.entries()){
        const cardPanel=el('article','rec-plan');cardPanel.dataset.grade=row.name.toLowerCase();
        const header=el('header','rec-plan-head'),name=el('h3','',row.name),metric=el('div','rec-metrics');
        metric.append(el('strong','',number(row.stats.rate*100)+'% tested'),el('small','',row.stats.wins+'/'+row.stats.total+' wins'));
        const avg=row.stats.clearTurns;
        header.append(name,metric);cardPanel.append(header,el('p','rec-plan-desc',row.description));
        const badges=el('div','rec-plan-badges');
        badges.append(el('span',row.met?'rec-good':'rec-warning',row.met?'Target met in tests':'Target not reached'));
        badges.append(el('span','',avg===null?'No tested clear':'~'+number(avg*selectedSpec.turnMs/1000)+'s per clear'));
        badges.append(el('span','',''+RANKS[row.cost[0]]+' max rarity'));
        if(row.stats.timeouts||row.stats.errors)badges.append(el('span','rec-warning',(row.stats.timeouts+row.stats.errors)+' unresolved trials'));
        cardPanel.append(badges,el('p','rec-strategy',tactic(row.team,selectedSpec)));
        const list=el('ol','rec-slots');
        let count=0;
        for(const [slot,unit]of row.team.entries()){
          const card=getCard(unit.cardId),owned=ownership(unit,card),relic=unit.relic,match=ownedRelic(card,relic);
          if(owned.entry)count++;
          const li=el('li','rec-unit');li.dataset.rarity=card.rarity;
          const b=el('button','rec-unit-card');b.type='button';b.dataset.recCard=i+':'+slot;b.setAttribute('aria-label','Inspect '+card.name);b.setAttribute('aria-expanded','false');
          const text=el('span','rec-unit-copy');text.append(el('strong','',card.name),el('small','','Slot '+(slot+1)+' · Lv. '+unit.level+' · '+card.rarity),el('small','rec-mutation',mutationName(unit)),el('span',owned.ready?'rec-good':owned.entry?'rec-warning':'rec-needed',owned.text));
          b.append(portrait(unit,card),text);li.append(b);
          if(relic){
            const relicBtn=el('button','rec-relic-row');relicBtn.type='button';relicBtn.dataset.recRelic=i+':'+slot;relicBtn.setAttribute('aria-expanded','false');
            const d=host.RelicSystem.DEFINITIONS.find(r=>r.kind===relic.kind),assignedElsewhere=!match&&Boolean(ownedRelic(card,relic,true));const img=el('img');img.src=d.image;img.alt='';img.loading='lazy';img.addEventListener('error',()=>img.remove(),{once:true});
            const copy=el('span','');copy.append(el('b','',relicHeadline(relic)),el('small','',relicSummary(relic)),el('span',match?'rec-good':assignedElsewhere?'rec-warning':'rec-needed',match?'✓ Owned roll':assignedElsewhere?'Owned · assigned elsewhere':'Obtain matching roll'));
            relicBtn.append(img,copy);li.append(relicBtn);
          }else li.append(el('p','rec-no-relic','No Relic required'));
          list.append(li);
        }
        cardPanel.append(list);
        const apply=el('button','rec-apply','Apply Owned Setup · '+count+'/'+row.team.length);apply.type='button';apply.dataset.recApply=String(i);
        apply.disabled=!count||!bridge.canApply?.(selectedSpec);apply.title=!bridge.canApply?.(selectedSpec)?'Select this encounter and difficulty in Arena first.':!count?'No matching card variants owned yet.':'Replace lineup with the owned matching cards and Relics.';
        cardPanel.append(apply);
        out.append(cardPanel);
      }
    }
    function useResult(data,spec,key){
      worker?.terminate();worker=null;run.disabled=false;if(!root.open)return;
      selectedSpec=spec;
      cache.set(key,data);if(cache.size>8)cache.delete(cache.keys().next().value);
      if(!data?.length){status.textContent='No tested team found. Try another difficulty.';return;}
      renderResults(data);
      status.textContent=spec.name+' · Difficulty '+spec.difficulty+' · '+(spec.weather.length?'Weather: '+spec.weather.join(' / '):'No active weather')+' · '+(spec.mode==='raid'?'Includes maximum enemy stat rolls. ':'')+'Tested clear rates, not guarantees.';
    }
    async function generate(){
      cancel();clearInspection();out.replaceChildren();currentResults=[];
      const config=readConfig(),spec=scenario(config);
      if(!spec){status.textContent='This encounter does not have a fixed roster. Recommendations are unavailable.';return;}
      selectedSpec=spec;const key=configKey(config);
      if(cache.has(key)){const result=cache.get(key);renderResults(result);status.textContent=spec.name+' · Difficulty '+spec.difficulty+' · '+(spec.weather.length?'Weather: '+spec.weather.join(' / '):'No active weather')+' · Tested clear rates, not guarantees.';return;}
      run.disabled=true;status.textContent='Evaluating all card rarities and compatible Relics…';const id=job;
      const progress=m=>{if(id===job&&root.open)status.textContent=m.phase==='validation'?'Validating '+m.tier+' with independent battles…':'Testing lineups · '+m.tested+' candidates · '+m.found.filter(Boolean).length+'/3 targets found';};
      const fallback=async()=>{
        if(id!==job||!root.open)return;
        // File-based games may not support workers. Yield between candidates
        // and cap the work; never run on the live battle or award anything.
        try{const data=await search(spec,progress,()=>id!==job,()=>new Promise(resolve=>host.setTimeout(resolve,0)));if(id===job)useResult(data,spec,key);}
        catch(error){if(id===job){run.disabled=false;status.textContent='Unable to evaluate this encounter. Please retry.';}}
      };
      try{
        const path=doc.querySelector('script[data-game-script][src*="recommend_team.js"]')?.src||new URL('recommend_team.js',doc.baseURI).href;
        worker=new host.Worker(path);
        worker.onmessage=event=>{if(id!==job)return;const m=event.data;
          if(m.type==='progress')progress(m);
          else if(m.type==='result')useResult(m.data,spec,key);
          else if(m.type==='error'){worker?.terminate();worker=null;void fallback();}
        };
        worker.onerror=event=>{event.preventDefault();if(id===job){worker?.terminate();worker=null;void fallback();}};
        worker.postMessage({spec,urls:resourceURLs()});
      }catch(_){void fallback();}
    }
    function showDetail(anchor,pin=false){
      clearTimeout(hideTimer);
      if(detailPinned&&!pin)return;
      if(detailAnchor===anchor&&pin&&detailPinned){clearInspection();return;}
      const key=anchor.dataset.recCard||anchor.dataset.recRelic;
      const [plan,slot]=key.split(':').map(Number),row=currentResults[plan]?.team[slot],card=row&&getCard(row.cardId);if(!row||!card)return;
      if(detailAnchor)detailAnchor.setAttribute('aria-expanded','false');
      detailAnchor=anchor;detailPinned=pin;anchor.setAttribute('aria-expanded','true');
      inspectionBody.replaceChildren();
      if(anchor.dataset.recCard){
        inspectionTitle.textContent=card.name;
        const head=el('div','rec-detail-head');head.append(portrait(row,card));
        const info=el('div','');info.append(el('strong','',card.rarity+' · '+card.element+' · Lv. '+row.level),el('p','',mutationName(row)),el('p','',(card.category||[]).join(' · ')));
        const f=host.MutationSystem.factors(row.mutationIds),scale=levelScale(row.level);
        info.append(el('p','rec-detail-stats','HP '+number(Math.round(card.stats.hp*f.hp*scale))+' · ATK '+number(Math.round(card.stats.atk*f.atk*scale))+' before Relic bonuses'));
        head.append(info);inspectionBody.append(head);
        const passive=card.passives||card.passive;
        for(const p of Array.isArray(passive)?passive:passive?[passive]:[]){
          inspectionBody.append(el('h4','',p.name||'Passive'),el('p','',Array.isArray(p.description)?p.description.map(x=>[x.name,x.description].filter(Boolean).join(': ')).join('\n\n'):String(p.description||'').replace(/<br\s*\/?\s*>/gi,'\n')));
        }
        inspectionBody.append(el('h4','','Acquisition'),el('p','',host.UpdateLogs?.acquisition?.(card)||'Check Card Index.'));
        for(const id of row.mutationIds){
          const mutation=host.MUTATION_BY_ID[id],weather=(host.WEATHERS||[]).find(w=>w.mutationId===id);
          inspectionBody.append(el('p','',mutation.name+' · '+(weather?.name||'Matching weather')+' · '+mutation.description));
        }
        const go=el('button','rec-inspect-action','Open Card Index');go.type='button';go.dataset.recJump='index';go.dataset.recKind=card.id;inspectionBody.append(go);
      }else{
        const roll=row.relic,d=host.RelicSystem.DEFINITIONS.find(x=>x.kind===roll.kind);inspectionTitle.textContent=relicHeadline(roll);
        const preview=el('div','rec-relic-inspection');preview.innerHTML=host.RelicInspection.markup(roll,{card});
        const full=el('div','rec-relic-inspection');full.innerHTML=host.RelicInspection.markup(host.RelicSystem.template(roll.kind),{card});
        inspectionBody.append(el('h4','','Tested minimum roll'),preview,el('h4','','All tiers & Unique effect'),full,el('h4','','Crafting Recipe'));
        const recipe=host.RelicSystem.RECIPES.find(x=>x.kind===roll.kind);
        if(recipe){
          const ingredients=el('ul','rec-ingredients');
          for(const item of recipe.ingredients){
            const inv=host.InventorySystem.getItem(item.id);ingredients.append(el('li','',number(item.quantity)+' × '+(inv?.name||item.id)));
          }
          inspectionBody.append(ingredients);
          const go=el('button','rec-inspect-action','Open Craft');go.type='button';go.dataset.recJump='craft';go.dataset.recKind=roll.kind;inspectionBody.append(go);
        }else inspectionBody.append(el('p','','Alucard Boss Event drop. Chance scales from 1% to 20% with difficulty.'));
        if(d?.kind==='odm')inspectionBody.append(el('p','','Also obtainable from Rumbling Rift.'));
      }
      inspection.hidden=false;inspection.toggleAttribute('data-pinned',pin);inspectionBody.scrollTop=0;
      if(pin)q('[data-rec-inspection-close]').focus({preventScroll:true});
    }
    function delayHide(){clearTimeout(hideTimer);if(!detailPinned)hideTimer=setTimeout(()=>{if(!detailPinned&&!inspection.matches(':hover')&&!detailAnchor?.matches(':hover'))clearInspection();},180);}
    button.addEventListener('click',open);close.addEventListener('click',stop);q('[data-rec-inspection-close]').addEventListener('click',()=>clearInspection(true));
    root.addEventListener('cancel',e=>{e.preventDefault();if(!inspection.hidden)clearInspection(true);else stop();});
    root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(!inspection.hidden)clearInspection(true);else stop();}});
    root.addEventListener('click',e=>{
      const b=e.target?.closest?.('button');if(e.target===root){if(!inspection.hidden)clearInspection();else stop();return;}
      if(b?.dataset.recCard||b?.dataset.recRelic){showDetail(b,true);return;}
      if(b?.dataset.recApply!==undefined){
        const plan=currentResults[Number(b.dataset.recApply)];
        if(!plan||!bridge.canApply?.(selectedSpec))return;
        const applied=bridge.apply?.(plan.team,selectedSpec,ownedRelic);
        if(applied?.ok){stop();bridge.message?.(applied.message);}
        else status.textContent=applied?.message||'The setup is no longer available.';
      }
      if(b?.dataset.recJump){const where=b.dataset.recJump,kind=b.dataset.recKind;stop();bridge.jump?.(where,kind);}
    });
    root.addEventListener('pointerover',e=>{const b=e.target?.closest?.('[data-rec-relic]');if(b&&e.pointerType==='mouse'&&!b.contains(e.relatedTarget)&&!detailPinned)showDetail(b);});
    root.addEventListener('pointerout',e=>{const b=e.target?.closest?.('[data-rec-relic]');if(b===detailAnchor&&b&&!b.contains(e.relatedTarget)&&!inspection.contains(e.relatedTarget))delayHide();});
    inspection.addEventListener('pointerenter',()=>clearTimeout(hideTimer));inspection.addEventListener('pointerleave',delayHide);
    modeSelect.addEventListener('change',()=>updateTypes());typeSelect.addEventListener('change',()=>{difficulty.value=String(bridge.difficulty?.(modeSelect.value,typeSelect.value)||1);invalidate();});
    difficulty.addEventListener('change',invalidate);run.addEventListener('click',generate);
    refreshEntry();
    return Object.freeze({refreshEntry,open,close:stop});
  }

  host.RecommendTeam=Object.freeze({eligible,availableModes,scenario,compatible,ownedRelic,mount,
    evaluate:(context,onProgress,stop,yieldWork)=>search(scenario(context),onProgress,stop,yieldWork)});
})(typeof window==='undefined'?self:window);
