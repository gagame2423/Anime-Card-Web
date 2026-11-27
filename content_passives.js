/* Content skills share the existing isolated runtime. No global listeners, timers or Proxy wrappers. */
(function(host){
 'use strict';
 if(host.createContentSkills?.version===2)return;
 const FINN='finn-the-human',JAKE='jake-the-dog',REGULAR='mordecai-rigby',GUMBALL='gumball';
 const SWORDS=Object.freeze(['Golden Sword','Grass Sword','Demon Blood Sword']);
 const IDS=Object.freeze(['yoshino-junpei','n-doul','oingo','d-arby','hogus-eagle','vanilla-ice','bakugo','askeladd','pochita','kon','iggy','pikachu','ender-dragon','onana','zenitsu','antony-mu','tung-tung-sahur']);
 host.createContentSkills=function(api){
  const hex=host.createHextechSkills(api);
  const {has,alive,runtime,all,enemies,team,random,atk}=api,seenKills=new WeakMap(),lastHeroes=new WeakMap(),following=new WeakSet();
  const hookOptions=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  const state=(u,id)=>((api.passiveRuntimeFor(u,id).contentSkills ||= {})[id] ||= {entered:false,attacks:0,voidTurns:0,failedDodges:0,shieldUsed:false,shieldTurns:0,copy:null,copyTurns:0});
  const gain=(u,n)=>api.watch?.gain(u,n)??n;
  const scope=(u,id,fn)=>api.scope(u,id,fn),pick=rows=>rows.length?rows[Math.floor(random()*rows.length)]:null;
  const skillHit=(bs,u,v,n,meta={})=>api.hit(bs,u,v,n,{passiveAttack:true,specialAttack:true,contentSkill:true,...meta});
  function contract(bs,u){
   if(!alive(u)||u.contentSacrificed)return;u.contentSacrificed=true;u.championPermanentDeath=true;
   const ally=pick(team(bs,u).filter(v=>v!==u&&alive(v)&&!has(v,'pochita')&&api.allowed(bs,u,v)));
   api.sacrifice(bs,u);
   if(ally){api.percent(ally,'atk','content:saw-contract',.20);runtime(ally).sawContractMiss=true;api.log('[PASSIVE] Saw Contract empowered '+ally.card.name+'; attacks have a 20% miss chance.');}
  }
  function changeRegularMode(u){
   const c=state(u,REGULAR),previous=c.mode;c.mode=random()<.50?'Mordecai':'Rigby';
   if(previous)api.watch?.change(u,previous,c.mode);
   api.log('[PASSIVE] Regular Show: '+c.mode+' took the lead.');
  }
  function regularSerious(u,carry=false){
   if(!alive(u)||!has(u,REGULAR)||!carry&&u.hp>=u.maxHp*.50)return;
   const c=state(u,REGULAR);if(c.serious)return;const previous=c.mode;c.serious=true;c.mode='Mordecai';
   if(u.card?.id===REGULAR)(u.cartoonProgress ||= {}).serious=true;
   scope(u,REGULAR,()=>api.seriousBuff(u));
   if(!carry)api.watch?.change(u,previous||'base','serious');
   api.log('[PASSIVE] Serious Mode: Mordecai gains +50% ATK and +25% max HP.');
  }
  function skipAttack(bs,u,options){
   options=hookOptions(options);
   if(!has(u,REGULAR)||options.isFollowUp||options.isCounter)return false;
   regularSerious(u);
   if(state(u,REGULAR).mode!=='Rigby'||random()>=.30)return false;
   api.heal(bs,u,u,u.maxHp*.20,'Regular Show');
   api.log('[PASSIVE] Rigby rested instead of attacking.');
   return true;
  }
  function regularAttack(bs,u,v,options){
   const c=state(u,REGULAR),rigby=options.regularAssist||c.mode==='Rigby';
   const hit=api.primary(bs,u,v,atk(u)*(rigby?.80:1),{...options,specialAttack:false});
   const target=hit.target||v;
   if(rigby&&hit.hit&&alive(target)&&random()<.50)api.status(target,'stunTurns',1,u);
   if(!rigby&&!c.serious&&!options.isFollowUp&&alive(u)&&api.canFollow(u)){
    const victim=alive(target)?target:enemies(bs,u)[0];
    if(victim&&random()<.40)api.follow(bs,u,victim,1,{regularAssist:true});
   }
   return {...hit,attacker:u,target};
  }
  function entry(bs,u){
   hex.entry(bs,u);
   if(u.card?.id===GUMBALL)api.amazingEnter(bs,u);
   if(has(u,REGULAR)&&!state(u,REGULAR).mode){
    if(u.card?.id===REGULAR&&u.cartoonProgress?.serious)regularSerious(u,true);
    else{changeRegularMode(u);regularSerious(u);}
   }
   for(const id of IDS)if(has(u,id)){const c=state(u,id);if(c.entered)continue;c.entered=true;if(id==='vanilla-ice')c.voidTurns=3;if(id==='pochita')scope(u,id,()=>contract(bs,u));}
  }
  function matchStart(bs){for(const u of [...all(bs)])if(has(u,'pochita'))entry(bs,u);}
  const debuffImmune=u=>has(u,FINN)&&lastHeroes.has(u)&&lastHeroes.get(u)===api.passiveRuntimeFor(u,FINN);
  function lastHero(bs,line){
   if(!line)return;
   let only=null;
   for(const u of line)if(alive(u)){if(only)return;only=u;}
   if(!only||debuffImmune(only)||!has(only,FINN))return;
   lastHeroes.set(only,api.passiveRuntimeFor(only,FINN));
   api.cleanseDebuffs(bs,only);
   scope(only,FINN,()=>api.percent(only,'atk','adventure:last-hero',.50));
   api.log('[PASSIVE] Last Hero Standing: Finn gains +50% ATK and debuff immunity.');
  }
  function guard(bs,source,target){
   const line=team(bs,target);
   if(line.length<2||line.includes(source))return null;
   const jake=line.find(u=>u!==target&&alive(u)&&has(u,JAKE)&&api.allowed(bs,source,u)&&api.allowed(bs,u,target));
   if(!jake)return null;
   const finn=line.some(u=>alive(u)&&u.card?.id===FINN&&api.frontline(u,bs));
   if(random()>=(finn?.80:.40))return null;
   api.intercept(jake,target);
   return {target:jake,scale:finn?.20:.50};
  }
  function swordKill(bs,u,stance){
   if(!alive(u)||!has(u,FINN))return;
   scope(u,FINN,()=>{const c=state(u,FINN);
    if(stance===0){c.golden=(c.golden||0)+gain(u,1);api.percent(u,'atk','adventure:golden',.10*c.golden);}
    else if(stance===1)c.grass=(c.grass||0)+gain(u,1);
    else if(stance===2)api.heal(bs,u,u,u.maxHp*.15,'Demon Blood Sword');
   });
  }
  function finnAttack(bs,u,v,options){
   const c=state(u,FINN),stance=c.stance||0,attack=atk(u);
   if(!bs.spatial){
   const hit=api.primary(bs,u,v,attack*(stance===1?.90*(1+.40*(c.grass||0)):1),
    {...options,specialAttack:true,adventureSword:true,ignoreShield:stance===0||options.ignoreShield});
   const target=hit.target||v;
   api.log('[PASSIVE] Adventure Sword: '+SWORDS[stance]+'.');
   if(hit.killed)swordKill(bs,u,stance);
   if(hit.hit&&alive(target)){
    if(stance===1)api.status(target,'stunTurns',1,u);
    if(stance===2)api.dot(target,'bleed',2,attack*.30,u,{adventureSword:2});
   }
   return {...hit,attacker:u,target};
   }
   const targets=bs.spatial?api.spatial(bs,u,v,'strike',{label:SWORDS[stance]},[v,...enemies(bs,u).filter(x=>x!==v)]):[v];
   const total={hit:false,damage:0,killed:false,attacker:u,target:v};
   api.log('[PASSIVE] Adventure Sword: '+SWORDS[stance]+'.');
   for(const victim of targets){
    if(!alive(u)||!alive(victim))continue;
    const hit=api.primary(bs,u,victim,attack*(stance===1?.90*(1+.40*(c.grass||0)):1),{...options,specialAttack:true,adventureSword:true,ignoreShield:stance===0||options.ignoreShield});
    const target=hit.target||victim;
    if(victim===v)Object.assign(total,{...hit,attacker:u,target});
    else {total.hit ||= hit.hit;total.killed ||= hit.killed;total.damage+=hit.damage||0;}
    if(hit.killed)swordKill(bs,u,stance);
    if(hit.hit&&alive(target)){
     if(stance===1)api.status(target,'stunTurns',1,u);
     if(stance===2)api.dot(target,'bleed',2,attack*.30,u,{adventureSword:2});
    }
   }
   return total;
  }
  function jakePierce(bs,u,v,options){
   const others=enemies(bs,u).filter(x=>x!==v),targets=api.spatial(bs,u,v,'pierce',{label:'Stretchy Pierce'},[v,...others]).slice(0,3),attack=atk(u);
   const out={attacker:u,target:v,hit:false,killed:false,damage:0};
   for(let i=0;i<targets.length&&alive(u);i++)if(alive(targets[i])){
    const hit=api.primary(bs,u,targets[i],attack*[1.2,.9,.6][i],{...options,specialAttack:true,fearChecked:true});
    if(i===0)out.target=hit.target||v;
    out.hit ||= hit.hit;out.killed ||= hit.killed;out.damage+=hit.damage||0;
   }
   api.log('[PASSIVE] Stretchy Pierce swept through up to three enemies.');
   return out;
  }
  function adventureAfter(bs,u,target,options){
   if(!has(u,FINN)||options.adventureAssist||options.isCounter)return;
   scope(u,FINN,()=>{
    const c=state(u,FINN),previous=c.stance||0;c.stance=Math.floor(random()*SWORDS.length);
    api.watch?.change(u,previous,c.stance);
    if(following.has(u)||!api.canFollow(u))return;
    const buddy=team(bs,u).find(v=>v.card?.id===JAKE&&alive(v)&&api.canAct(v)&&api.allowed(bs,u,v));
    const victim=alive(target)?target:enemies(bs,u)[0];
    if(!buddy||!victim||random()>=.50)return;
    following.add(u);
    try{
     const follow=api.follow(bs,buddy,victim,1,{adventureAssist:true,followOwner:u,linkedAttack:true});
     if(!follow.skipped&&!follow.outOfTurn){c.critReady=true;api.log('[PASSIVE] Jake followed up. Finn gains +20% Critical Chance on his next attack.');}
    }finally{following.delete(u);}
   });
  }
  function dispel(u){
   if(has(u,FINN)){const c=state(u,FINN);c.golden=0;c.grass=0;c.critReady=false;}
   if(has(u,'vanilla-ice'))state(u,'vanilla-ice').voidTurns=0;
   if(has(u,'onana'))state(u,'onana').failedDodges=0;
   for(const [id,keys]of [['ahri',['speedTurns','fox']],['neeko',['dodgeTurns']],['yasuo',['immuneTurns']],['yone',['soulTurns','soulDamage','atkTurns']]]){
    if(has(u,id))for(const key of keys)hex.state(u,id)[key]=key==='fox'?false:0;
   }
  }
  function prepare(bs,u,target,options){
   options=hex.prepare(bs,u,target,hookOptions(options));
   if(has(u,FINN)){const c=state(u,FINN);if(c.critReady){c.critReady=false;options={...options,adventureCrit:.20};}}
   if(has(u,JAKE)&&(api.attackCount(u)+1)%3===0&&api.dispel(bs,u,target))api.log('[PASSIVE] Stretchy Magic dispelled '+target.card.name+'’s active buffs.');
   if(!options.isFollowUp&&has(u,'tung-tung-sahur')&&random()<.30){const pierce=random()<.5;return{...options,damageMultiplier:(options.damageMultiplier||1)*(pierce?1.5:3),ignoreShield:pierce||options.ignoreShield,specialAttack:true};}return options;
  }
  function pierce(bs,u,target,options={}){
   const victims=api.spatial(bs,u,target,'pierce',{label:'Thunderclap'},[target,...enemies(bs,u).filter(v=>v!==target)]).filter(alive),out={hit:false,damage:0,killed:false,target,attacker:u,contentPierce:true};
   for(let index=0;index<victims.length&&alive(u);index++){
    const result=api.primary(bs,u,victims[index],atk(u)*Math.max(.10,1-.30*index),{...options,passiveAttack:true,specialAttack:true,contentSkill:true});
    out.hit ||= result.hit;out.damage+=result.damage||0;out.killed ||= result.killed;
   }return out;
  }
  function attack(bs,u,target,options){options=hookOptions(options);const replacement=hex.attack(bs,u,target,options);if(replacement)return replacement;if(has(u,REGULAR))return scope(u,REGULAR,()=>regularAttack(bs,u,target,options));if(has(u,FINN))return scope(u,FINN,()=>finnAttack(bs,u,target,options));if(has(u,JAKE)&&random()<.30)return scope(u,JAKE,()=>jakePierce(bs,u,target,options));return api.id(u)==='zenitsu'&&(state(u,'zenitsu').attacks+1)%3===0?scope(u,'zenitsu',()=>pierce(bs,u,target,options)):null;}
  function afterAttack(bs,u,target,out,options){
   if(!u||!out)return;
   options=hookOptions(options);
   hex.afterAttack(bs,u,target,out,options);
   if(!alive(u)||out.skipped||out.outOfTurn)return;
   adventureAfter(bs,u,target,options);
   for(const id of IDS)if(has(u,id))scope(u,id,()=>{
    const c=state(u,id),count=api.attackCount(u);if(c.processedCount===count)return;c.processedCount=count;c.attacks++;
    if(id==='vanilla-ice'&&random()<.10)c.voidTurns++;
    if(id==='hogus-eagle'&&c.attacks%5===0&&alive(target))api.status(target,'freezeTurns',2,u);
    if(id==='bakugo'&&c.attacks%3===0)for(const v of api.spatial(bs,u,target,'blast',{label:'Explosion'},enemies(bs,u)).slice(0,2))skillHit(bs,u,v,atk(u)*.10);
    if(id==='iggy'&&random()<.10&&alive(target))api.status(target,'fearTurns',2,u);
    if(id==='pikachu'&&c.attacks%3===0&&alive(target)&&random()<.80&&api.status(target,'stunTurns',1,u)&&random()<.20)for(const v of [...enemies(bs,u)])if(v!==target)api.status(v,'stunTurns',1,u);
    if(id==='ender-dragon'&&c.attacks%5===0){const victims=api.spatial(bs,u,target,'blast',{label:'Magical Ball'},enemies(bs,u)),fear=random()<.10;for(const v of victims){skillHit(bs,u,v,atk(u)*.10);if(fear&&alive(v))api.status(v,'fearTurns',2,u);}}
    if(id==='zenitsu'&&c.attacks%3===0&&!out.contentPierce)pierce(bs,u,target,options);
    if(id==='askeladd'&&!options.contentChain){for(let n=0;n<12&&alive(u)&&api.canFollow(u);n++){
     if(random()>=api.followChance(bs,u,.10,n>0,.99))break;const v=alive(target)?target:enemies(bs,u)[0];if(!v)break;
     const result=api.follow(bs,u,v,.10,{contentChain:true});if(result.skipped||result.outOfTurn)break;
    }}
   });
  }
  function attacked(bs,u,source,meta){
   meta=hookOptions(meta);
   hex.attacked(bs,u,source,meta);
   if(!source||meta.dot||meta.isCounter||meta.contentCounter||!alive(u))return;
   const token=api.attackToken(bs,source,meta);
   if(has(u,'onana')){const c=state(u,'onana');if(c.failedToken!==token){c.failedToken=token;c.failedDodges+=gain(u,1);scope(u,'onana',()=>api.percent(u,'atk','content:onana',.04*c.failedDodges));}}
   if(has(u,'antony-mu')){const c=state(u,'antony-mu');if(c.fearToken!==token){c.fearToken=token;if(random()<.15)scope(u,'antony-mu',()=>api.status(source,'fearTurns',3,u));}}
  }
  function damaged(bs,u){regularSerious(u);if(!alive(u)||!has(u,'yoshino-junpei'))return;const c=state(u,'yoshino-junpei');if(c.shieldUsed||u.hp>=u.maxHp*.50)return;
   c.shieldUsed=true;c.shieldTurns=3;c.shieldApplied=api.ownTurns(bs,u);c.shieldTag='content:moon-dregs';scope(u,'yoshino-junpei',()=>api.shield(u,atk(u)*1.5,c.shieldTag));c.shieldArmed=api.shieldValue(u,c.shieldTag)>0;
  }
  function shieldHit(bs,u,source,before){hex.shieldHit(bs,u,source,before);const c=api.passiveRuntimeFor(u,'yoshino-junpei').contentSkills?.['yoshino-junpei'];if(!c?.shieldArmed||api.shieldValue(u,c.shieldTag)>0)return;c.shieldArmed=false;c.shieldTurns=0;
   if(alive(source)&&has(u,'yoshino-junpei'))scope(u,'yoshino-junpei',()=>api.dot(source,'poison',2,atk(u)*.10,u));
  }
  function dodge(u){return Math.max(hex.dodge(u),has(u,'onana')?.04:0,has(u,'vanilla-ice')&&state(u,'vanilla-ice').voidTurns>0?.50:0);}
  function onDodge(bs,u,source,out){
   out=hookOptions(out);
   hex.onDodge(bs,u,source,out);
   if(has(u,'onana')){state(u,'onana').failedDodges=0;scope(u,'onana',()=>api.percent(u,'atk','content:onana',0));}
   if(has(u,'vanilla-ice')&&state(u,'vanilla-ice').voidTurns>0&&alive(source)&&!out.meta?.isCounter&&!out.meta?.contentCounter&&out.incomingDamage>0)scope(u,'vanilla-ice',()=>skillHit(bs,u,source,out.incomingDamage*.80,{isCounter:true,contentCounter:true,specialAttack:false,elementApplied:true}));
  }
  function reduction(u,source,meta){return !meta?.dot&&has(u,'kon')&&(api.category(source,'Reaper')||api.category(source,'Bleach'))?.50:0;}
  function attackBonus(bs,u){return has(u,'hogus-eagle')?enemies(bs,u).filter(v=>runtime(v).freezeTurns>0).length*.05:0;}
  function misses(bs,u,options){return !options?.fearChecked&&!options?.dot&&!options?.isCounter&&((runtime(u).fearTurns>0&&random()<.15)||(runtime(u).sawContractMiss&&random()<.20));}
  function turnStart(bs,actor){
   for(const u of [...all(bs)])if(alive(u)&&u!==actor&&has(u,'n-doul')){const c=state(u,'n-doul');if(c.offTurn===bs.turnCount)continue;c.offTurn=bs.turnCount;c.offTurns=(c.offTurns||0)+1;if(c.offTurns%2===0){const v=pick(enemies(bs,u));if(v)scope(u,'n-doul',()=>skillHit(bs,u,v,atk(u)*.50));}}
  }
  function turnEnd(bs,u){if(!u)return;hex.turnEnd(bs,u);const r=runtime(u);if(r.fearTurns>0)r.fearTurns--;
   const v=state(u,'vanilla-ice');if(v.voidTurns>0&&--v.voidTurns===0&&has(u,'vanilla-ice'))api.watch?.change(u,'void','base');
   const s=state(u,'yoshino-junpei');if(s.shieldTurns>0&&api.ownTurns(bs,u)>s.shieldApplied&&--s.shieldTurns===0){s.shieldArmed=false;api.clearShield(u,s.shieldTag);}
   const c=state(u,'oingo');if(c.copy&&(!alive(u)||api.ownTurns(bs,u)>c.copyApplied&&--c.copyTurns<=0)){api.removeCopy(bs,u,c.copy);c.copy=null;}
  }
  function killed(bs,u,victim,meta){
   hex.killed(bs,u,victim);
   if(!u||!victim||alive(victim)||team(bs,u)===team(bs,victim))return;let seen=seenKills.get(u);if(!seen){seen=new WeakMap();seenKills.set(u,seen);}const life=api.life(victim);if(seen.get(victim)===life)return;seen.set(victim,life);
   if(alive(u)&&has(u,REGULAR)&&!state(u,REGULAR).serious&&u.hp>u.maxHp*.50)changeRegularMode(u);
   if(alive(u)&&u.card?.id===GUMBALL)api.amazingKill(bs,u);
   if(meta?.adventureSword===2)swordKill(bs,u,2);
   if(has(u,'d-arby')&&!enemies(bs,u).length)(bs.contentRewardWinners ||= {})[api.side(bs,u)]=2;
   if(has(u,'oingo')&&!api.copyBlocked(u)&&alive(u))scope(u,'oingo',()=>{
    const c=state(u,'oingo');if(c.copy)api.removeCopy(bs,u,c.copy);c.copy=null;
    const id=api.passiveId(victim);if(!id||id==='oingo')return;c.copy=api.copy(bs,u,id);c.copyTurns=5;c.copyApplied=api.ownTurns(bs,u);
   });
  }
  function died(bs,u){const c=api.passiveRuntimeFor(u,'oingo').contentSkills?.oingo;if(c?.copy){api.removeCopy(bs,u,c.copy);c.copy=null;}}
  function badges(u){const r=runtime(u),rows=hex.badges(u);if(has(u,FINN)){const c=state(u,FINN);rows.push({icon:'⚔',label:SWORDS[c.stance||0]+' · NEXT',tone:'form'});if(c.critReady)rows.push({icon:'✦',label:'JAKE FOLLOW-UP · +20% NEXT CRIT',tone:'buff'});}if(debuffImmune(u))rows.push({icon:'✦',label:'LAST HERO STANDING',tone:'buff'});if(r.fearTurns>0)rows.push({icon:'◉',label:'FEAR '+r.fearTurns+'t · 15% MISS',tone:'debuff'});if(r.poison?.length)rows.push({icon:'☠',label:'POISON '+r.poison.length,tone:'debuff'});if(r.sawContractMiss)rows.push({icon:'⚒',label:'SAW CONTRACT · 20% MISS',tone:'buff'});if(has(u,'vanilla-ice')&&state(u,'vanilla-ice').voidTurns>0)rows.push({icon:'◌',label:'VOID DOMAIN '+state(u,'vanilla-ice').voidTurns+'t',tone:'form'});if(has(u,'onana')&&state(u,'onana').failedDodges)rows.push({icon:'⚽',label:'ONANA +'+state(u,'onana').failedDodges*4+'% ATK',tone:'buff'});if(has(u,'oingo')&&state(u,'oingo').copy)rows.push({icon:'♢',label:'KHNUM '+state(u,'oingo').copyTurns+'t',tone:'form'});return rows;}
  function cartoonBadges(u){
   const rows=[];
   if(has(u,REGULAR)){const c=state(u,REGULAR);if(c.mode)rows.push({icon:'⚔',label:c.serious?'SERIOUS MODE':c.mode.toUpperCase()+' MODE',tone:'form'});}
   if(u.card?.id===GUMBALL){const a=api.amazingStatus(u);if(a){rows.push({icon:'✦',label:(9-a.used)+'/9 LIVES LEFT',tone:'form'});if(a.name)rows.push({icon:'✧',label:a.name.toUpperCase(),tone:'buff'});}}
   return rows;
  }
  return {IDS:Object.freeze([...IDS,...hex.IDS,FINN,JAKE,REGULAR,GUMBALL]),guard,lastHero,dispel,debuffImmune,dodgeBonus:hex.dodgeBonus,crit:hex.crit,speed:hex.speed,immune:hex.immune,status:hex.status,damageDealt:hex.damageDealt,state,entry,matchStart,skipAttack,prepare,attack,afterAttack,attacked,damaged,shieldHit,dodge,onDodge,reduction,attackBonus,misses,turnStart,turnEnd,killed,died,badges:u=>[...badges(u),...cartoonBadges(u)],forbidden:u=>!!u?.contentSacrificed||u?.card?.id==='pochita'};
 };
 host.createContentSkills.version=2;
})(window);
