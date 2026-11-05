/* Akatsuki combat only. No inventory writes, timers or progression state. */
(function(host){
 'use strict';
 host.createAkatsukiSkills=function(api){
  const IDS=Object.freeze(['itachi-awakened','konan','kisame-hoshigaki','deidara','sasori','kakuzu','hidan','zetsu','orochimaru','pain']);
  const PATHS=Object.freeze(['Deva','Asura','Animal','Preta','Human','Naraka']);
  const NO_LIFE=['konan','deidara','sasori','zetsu'],NO_CLONE=[...NO_LIFE,'orochimaru'];
  const cloneSkills=new Set(['funny-valentine','awakened-doflamingo','tower-champion-tsukuyomi','tower-champion-shadow','jin-mori','weather-shadow-monarch','metal-cooler','dagon','mechamaru','true-mahito','sung-jin-woo','madara-lubu','itachi-awakened','pain','reagan-ridley','doflamingo']);
  const {runtime,has,alive,all,allies,enemies,team,atk,random,refresh,log}=api;
  const state=(u,id)=>api.passiveRuntimeFor(u,id).akatsuki ||= {attacks:0,entered:false};
  const pick=list=>list.length?list[Math.floor(random()*list.length)]:null;
  const shuffle=values=>{const list=[...values];for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};
  const forbidden=(u,ids)=>ids.includes(u?.card?.id)||ids.some(id=>has(u,id));
  const uncloneable=u=>forbidden(u,NO_CLONE),noLife=u=>forbidden(u,NO_LIFE),noExternalRevive=u=>forbidden(u,NO_CLONE);
  const protectedBurns=new WeakMap();
  function rememberBurn(u,effect){let set=protectedBurns.get(u);if(!set){set=new Set();protectedBurns.set(u,set);}set.add(effect);}
  function restoreBurn(u){const saved=protectedBurns.get(u);if(!saved)return;const r=runtime(u);for(const effect of saved){if(effect.turns<=0)saved.delete(effect);else if(!r.burn.includes(effect))r.burn.push(effect);}if(!saved.size)protectedBurns.delete(u);}
  function cleanse(u,complete=false){const r=runtime(u);r.akatsukiPoison=[];r.akatsukiVoodoo=[];r.akatsukiMiss=null;r.akatsukiHypnosis=null;r.akatsukiHealBlock=0;if(complete){protectedBurns.delete(u);r.burn=[];r.bleed=[];r.akatsukiPaper=0;}else restoreBurn(u);}
  function clearBuffs(u){for(const id of IDS){const c=api.passiveRuntimeFor(u,id)?.akatsuki;if(c){c.healBuffs=[];c.yata=false;}}}
  function hasClone(u){return api.passiveIds(u).some(id=>cloneSkills.has(id));}
  function cloneChance(u,base){return Math.min(1,base+(runtime(u).akatsukiPuppets?.some(p=>alive(p.owner)&&has(p.owner,'sasori'))?.10:0));}
  function paper(u,n,owner){if(!api.allowed(u,owner))return;const r=runtime(u);r.akatsukiPaper=Math.min(Number.MAX_SAFE_INTEGER,(r.akatsukiPaper||0)+n);r.akatsukiPaperOwner=owner;refresh(u);}
  function shieldGranted(u){const r=runtime(u);if((r.akatsukiPaper||0)<5||!(r.shield>0))return;r.akatsukiPaper-=5;state(u,'itachi-awakened').yata=false;api.breakShield(u,r.akatsukiPaperOwner);log('[PASSIVE] Paper consumed 5 stacks and broke a new shield.','passive');}
  const paperReduction=u=>(runtime(u).akatsukiPaper||0)*.01;
  function puppet(bs,owner,skills=[]){
   const c=state(owner,'sasori');if(!alive(owner)||!has(owner,'sasori'))return;
   const eligible=allies(bs,owner,false),front=api.front(bs,owner),target=eligible.includes(front)?front:pick(eligible);if(!target){c.puppet=null;return;}
   c.puppet=target;c.inherited=[...new Set([...(c.inherited||[]),...skills])];
   const r=runtime(target);r.akatsukiPuppets ||= [];if(!r.akatsukiPuppets.some(p=>p.owner===owner))r.akatsukiPuppets.push({owner});
   c.tag ||= api.token('puppet');api.percent(target,'atk',c.tag,.10);api.percent(target,'hp',c.tag,.15,true);
   for(const id of c.inherited)if(id!=='sasori')api.copy(bs,target,id);
   log('[PASSIVE] Sasori selected '+(target.display?.name||target.card.name)+' as Puppet.','passive');
  }
  function releasePuppet(owner){const c=state(owner,'sasori'),u=c.puppet;if(!u)return;const r=runtime(u);r.akatsukiPuppets=(r.akatsukiPuppets||[]).filter(p=>p.owner!==owner);api.percent(u,'atk',c.tag,0);api.percent(u,'hp',c.tag,0);c.puppet=null;}
  function painState(u){if(u.akatsukiPath){const c=runtime(u).akatsukiPathState ||= {path:u.akatsukiPath,charge:0,attacks:0,entered:false};return c;}return state(u,'pain');}
  const hasLife=u=>['itachi-awakened','kakuzu','orochimaru'].some(id=>has(u,id));
  const isPain=u=>has(u,'pain')||Boolean(u.akatsukiPath);
  function path(bs,u,name){const c=painState(u);c.path=name;c.charge=0;api.percent(u,'atk','rinnegan-asura',name==='Asura'?.25:0);api.percent(u,'hp','rinnegan-asura',name==='Asura'?.25:0,true);log('[PASSIVE] Rinnegan · '+name+' Path.','passive');}
  function entry(bs,u){
   u.akatsukiBaseStats ||= api.base(u);
   for(const id of IDS)if(has(u,id)){const c=state(u,id);if(c.entered)continue;c.entered=true;
    if(id==='itachi-awakened'){c.pool=shuffle([0,1,2,3,4,5,6,7,8,9]);c.cooldown=0;c.revives=0;}
    if(id==='kisame-hoshigaki')c.domainUntil=(bs.turnCount||0)+3;
    if(id==='sasori')puppet(bs,u);
    if(id==='kakuzu'){c.hearts=0;c.stolen=[];u.akatsukiElements=[];}
    if(id==='orochimaru')c.revived=false;
    if(id==='pain'){c.completed=[];c.clones=[];path(bs,u,pick(PATHS));}
    if(id==='zetsu'){
     if(random()<.50){c.stance='White';const target=enemies(bs,u)[0];if(target){api.replaceStats(u,target.maxHp*1.3,atk(target)*1.3,target);for(const skill of api.passiveIds(target,true))api.copy(bs,u,skill);}}
     else{c.stance='Black';const line=allies(bs,u,false),target=pick(line);if(target){api.flat(target,'hp',u.maxHp*.50,true);api.flat(target,'atk',atk(u)*.50);const rest=line.filter(v=>v!==target);for(const ally of rest){api.flat(ally,'hp',u.maxHp*.50/rest.length,true);api.flat(ally,'atk',atk(u)*.50/rest.length);}}api.forceDeath(bs,u,u);}
    }
   }
   if(u.akatsukiPath&&!painState(u).entered){painState(u).entered=true;path(bs,u,u.akatsukiPath);}
  }
  function skipTurn(bs,u){if(!has(u,'itachi-awakened'))return false;const c=state(u,'itachi-awakened');if(!(c.cooldown>0))return false;if(--c.cooldown===0)c.pool=shuffle([0,1,2,3,4,5,6,7,8,9].filter(n=>n!==7||!c.izanamiUsed));log('[PASSIVE] Itachi cooldown · '+c.cooldown+' turns remaining.','status');return true;}
  function counted(bs,u){for(const id of IDS)if(has(u,id))state(u,id).attacks++;if(u.akatsukiPath)painState(u).attacks++;}
  function stopHealing(u,turns,bs){runtime(u).akatsukiHealBlock=turns;runtime(u).akatsukiHealApplied=bs.turnCount;}
  function interceptHeal(bs,u,amount){
   if(runtime(u).akatsukiHealBlock>0)return true;
   if(!has(u,'hidan')||!(amount>0))return false;
   const c=state(u,'hidan');c.healBuffs ||= [];c.healBuffs.push({percent:amount/Math.max(1,u.maxHp),expires:(bs?.turnCount||0)+5});
   api.percent(u,'atk','hidan-healing',c.healBuffs.reduce((n,b)=>n+b.percent,0));return true;
  }
  function dodgeChance(u){return u?.akatsukiCrow?.30:has(u,'konan')?.20:0;}
  function dodge(bs,u){if(has(u,'konan')){api.heal(u,u.maxHp*.10,'Paper Genkai',bs,u);api.add(u,'atk',.05);}}
  function misses(bs,u,options={}){if(options.akatsukiMissChecked)return false;options.akatsukiMissChecked=true;return runtime(u).akatsukiMiss?.turns>0&&random()<.15;}
  function immune(u,meta){return Boolean((meta.passiveAttack||meta.specialAttack)&&isPain(u)&&painState(u).path==='Deva'&&!painState(u).nagato);}
  function incoming(bs,attacker,u,meta){
   if(has(u,'kisame-hoshigaki')&&(bs.turnCount||0)<=state(u,'kisame-hoshigaki').domainUntil&&alive(attacker)&&api.allowed(attacker,u)&&random()<.50){const r=runtime(attacker);r.hindredTurns=Math.max(r.hindredTurns||0,2);r.hindredAppliedTurn=bs.turnCount;}
  }
  function reflect(bs,u,source,amount,meta={}){
   if(!(amount>0)||!alive(source)||meta.akatsukiReflect||meta.grimoireReflection||meta.fateAbsorb||meta.championRedirect)return;
   if(has(u,'itachi-awakened')){const c=state(u,'itachi-awakened');if(c.yata&&runtime(u).shield>0&&!meta.ignoreShield){c.yata=false;api.reflect(bs,u,source,amount*.50);}}
  }
  function damaged(bs,u,source,damage,meta={}){
   if(!(damage>0))return;
   if(isPain(u)&&painState(u).path==='Preta')api.heal(u,damage*.10,'Preta Path',bs,u);
   if(has(u,'hidan')&&!meta.akatsukiReflect&&!meta.grimoireReflection&&alive(source)&&(runtime(source).akatsukiVoodoo||[]).some(v=>v.owner===u&&v.turns>0))api.reflect(bs,u,source,damage*.50);
  }
  function fatal(bs,u,source){
   if(noLife(u)||u.championPermanentDeath)return false;
   if(has(u,'itachi-awakened')){const c=state(u,'itachi-awakened');if((c.revives||0)<2){c.revives=(c.revives||0)+1;u.defeated=false;u.hp=Math.max(1,Math.round(u.maxHp*(c.revives===1?.50:.30)));
    if(c.revives===1&&source){api.clearBuffs(source);clearBuffs(source);api.status(source,'stunTurns',2,u);}else if(c.revives===2){api.cleanse(u);cleanse(u,true);api.baseAttack(u);}
    refresh(u);return true;}}
   if(has(u,'kakuzu')){const c=state(u,'kakuzu');if(c.hearts>0){c.hearts--;const lost=pick(c.stolen||[]);if(lost){api.removeCopy(u,lost);c.stolen=c.stolen.filter(id=>id!==lost);}const element=pick(u.akatsukiElements||[]);u.akatsukiElements=(u.akatsukiElements||[]).filter(e=>e!==element);u.hp=Math.max(1,Math.round(u.maxHp*.50));u.defeated=false;refresh(u);return true;}}
   if(has(u,'orochimaru')){const c=state(u,'orochimaru');if(!c.revived){c.revived=true;u.hp=Math.max(1,Math.round(u.maxHp*.50));u.defeated=false;api.back(bs,u);refresh(u);return true;}}
   return false;
  }
  function reviveAlly(bs,u){if(noExternalRevive(u)||u.championPermanentDeath||api.generated(u))return false;const caster=allies(bs,u,false).find(v=>alive(v)&&has(v,'orochimaru')&&api.canRevive(bs,v,u,'snake_revive'));if(!caster||!api.admitRevive(bs,caster,u,'snake_revive'))return false;const base=u.akatsukiBaseStats||api.base(u);api.replaceStats(u,base.hp*1.3,base.atk*1.3,u);u.hp=u.maxHp;u.defeated=false;runtime(u).champion.deathHandled=false;runtime(u).champion.akatsukiPermanentHandled=false;api.back(bs,u);refresh(u);return true;}
  function died(bs,u,source){
   const r=runtime(u);if(r.akatsukiDeathHandled)return;r.akatsukiDeathHandled=true;
   for(const owner of all(bs))if(owner!==u&&has(owner,'sasori')&&state(owner,'sasori').puppet===u){const skills=api.passiveIds(u,true);releasePuppet(owner);if(alive(owner))puppet(bs,owner,skills);}
   if(has(u,'konan'))for(const enemy of enemies(bs,u))paper(enemy,5+Math.floor(random()*21),u);
   if(has(u,'deidara'))for(const enemy of [...enemies(bs,u)])api.hit(bs,u,enemy,atk(u)*15,{specialAttack:true});
   if(u.akatsukiCrow)for(const enemy of enemies(bs,u).slice(0,2))api.hit(bs,u,enemy,atk(u)*.80,{specialAttack:true});
   if(has(u,'sasori')){const victim=state(u,'sasori').puppet;releasePuppet(u);if(alive(victim))api.forceDeath(bs,u,victim);}
  }
  function killed(bs,u,victim){
   if(has(u,'kakuzu')){const c=state(u,'kakuzu');c.hearts=Math.min(5,(c.hearts||0)+1);c.stolen ||= [];
    if(random()<.33){const id=pick(api.passiveIds(victim,true));if(id&&api.copy(bs,u,id))c.stolen.push(id);}
    if(random()<.66){const options=[victim.card.element,...(victim.akatsukiElements||[])].filter(e=>e!==u.card.element&&!(u.akatsukiElements||[]).includes(e)),element=pick(options);if(element)(u.akatsukiElements ||= []).push(element);}
   }
   if(has(u,'pain')&&!u.akatsukiPath){const c=painState(u);if(!c.nagato){c.completed ||= [];if(!c.completed.includes(c.path))c.completed.push(c.path);if(c.completed.length===6){c.nagato=true;c.path='Nagato';api.percent(u,'atk','rinnegan-asura',0);api.percent(u,'hp','rinnegan-asura',0);c.clones=[];for(const name of PATHS){const clone=api.summon(bs,u,'nagato',.20,.20,name);if(clone){clone.akatsukiPath=name;c.clones.push(clone);entry(bs,clone);}}log('[PASSIVE] Pain transformed into Nagato.','passive');}else path(bs,u,pick(PATHS.filter(p=>!c.completed.includes(p))));}}
  }
  function result(u,target){return {hit:false,damage:0,killed:false,target,attacker:u};}
  function hitResult(bs,u,target,scale,options={},out=result(u,target)){
   if(!alive(u)||!alive(target))return out;const shot=api.primary(bs,u,target,atk(u)*scale,options);out.hit ||= shot.hit;out.critical ||= shot.critical;out.damage+=shot.damage||0;out.killed ||= shot.killed;return out;
  }
  function painAttack(bs,u,target,options={}){
   const c=painState(u),mode=c.path,out=result(u,target),special={...options,specialAttack:true};
   if(c.nagato){hitResult(bs,u,target,1,{...options,specialAttack:false},out);const clones=(c.clones||[]).filter(alive),n=Math.min(clones.length,1+Math.floor(random()*6));for(const clone of shuffle(clones).slice(0,n)){if(!alive(u))break;const enemy=alive(target)?target:enemies(bs,u)[0];if(!enemy)break;const shot=painAttack(bs,clone,enemy,{isFollowUp:true,followOwner:u,linkedAttack:true});out.damage+=shot.damage||0;out.killed ||= shot.killed;}return out;}
   if(mode==='Deva'){c.charge=(c.charge||0)+1;if(c.charge<3)return {...out,skipped:true,charging:true};for(const enemy of [...enemies(bs,u)])hitResult(bs,u,enemy,2,special,out);c.charge=0;return out;}
   hitResult(bs,u,target,1,{...options,specialAttack:false},out);
   if(mode==='Preta')api.heal(u,out.damage*.25,'Preta Path',bs,u);
   if(mode==='Animal'&&alive(u)&&random()<api.followChance(bs,u,.50)){const line=team(bs,u),behind=line.slice(line.indexOf(u)+1).find(alive),enemy=alive(target)?target:enemies(bs,u)[0];if(behind&&enemy)api.assist(bs,behind,enemy,atk(behind),u);}
   if(out.hit&&alive(target)&&api.allowed(target,u)){
    if(mode==='Human'&&random()<.20)runtime(target).akatsukiHypnosis={turns:1,applied:bs.turnCount,owner:u};
    if(mode==='Naraka'&&random()<.25){api.disable(target,1,bs,u);for(const ally of allies(bs,u))api.heal(ally,u.maxHp*.10,'Naraka Path',bs,u);}
   }
   return out;
  }
  function itachiAttack(bs,u,target,options){
   const c=state(u,'itachi-awakened'),out=result(u,target);c.pool ||= shuffle([0,1,2,3,4,5,6,7,8,9].filter(n=>n!==7||!c.izanamiUsed));if(c.cooldown>0)return {...out,skipped:true};
   const move=c.pool.pop(),special={...options,specialAttack:true};c.lastSkill=move;log('[PASSIVE] Itachi technique '+(move+1)+'.','passive');
   const hit=(enemy,scale,extra={})=>hitResult(bs,u,enemy,scale,{...special,...extra},out);
   if(move===0){hit(target,1.5,{ignoreShield:true});if(alive(target)&&api.allowed(target,u)){api.status(target,'stunTurns',1,u);runtime(target).incomingVulnerabilityTurns=Math.max(2,runtime(target).incomingVulnerabilityTurns||0);runtime(target).incomingVulnerabilityPct=Math.max(.30,runtime(target).incomingVulnerabilityPct||0);}}
   if(move===1){const burning=runtime(target).burn.some(e=>e.turns>0);api.dot(target,'burn',3,atk(u)*.25,u,{uncleansable:true});if(burning){const extra=pick(enemies(bs,u).filter(v=>v!==target));if(extra)api.dot(extra,'burn',3,atk(u)*.25,u,{uncleansable:true});}out.hit=true;}
   if(move===2){hit(target,2);if(alive(target)&&target.hp<target.maxHp*.30){api.seal(bs,u,target);out.killed=true;}if(alive(u)){c.yata=true;api.shield(u,1,null);}}
   if(move===3)for(const enemy of [...enemies(bs,u)]){const before=out.damage;hit(enemy,1);if(out.damage>before&&alive(enemy)&&api.allowed(enemy,u))runtime(enemy).akatsukiMiss={turns:2,applied:bs.turnCount};}
   if(move===4){hit(target,1.8);for(const enemy of shuffle(enemies(bs,u).filter(v=>v!==target)).slice(0,3))hit(enemy,.4);}
   if(move===5){const shielded=runtime(target).shield>0;hit(target,.5);if(alive(target)){if(shielded)hit(target,1,{ignoreShield:true});else api.status(target,'stunTurns',2,u);}}
   if(move===6){const line=enemies(bs,u),at=line.indexOf(target),nearest=[line[at-1],line[at+1]].filter(Boolean);hit(target,2.5,{ignoreShield:true,ignoreDodge:true});for(const enemy of nearest)hit(enemy,.50,{ignoreShield:true,ignoreDodge:true});}
   if(move===7){c.izanamiUsed=true;hit(target,3);if(alive(target)){api.disable(target,3,bs,u);stopHealing(target,3,bs);}else api.heal(u,u.maxHp*.20,'Izanami',bs,u);}
   if(move===8){const clone=api.summon(bs,u,'crow',.15,.20,'Crow Clone');if(clone){clone.akatsukiCrow=true;clone.akatsukiCrowOwner=u;}out.hit=true;}
   if(move===9){const last=c.lastEnemyAttack||0;if(last>0){const shot=api.primary(bs,u,target,last*1.20,{...special,specialAttack:false,ignoreDodge:true,noCritical:true,akatsukiRawDamage:true,grimoireReflection:true,akatsukiReflect:true});out.hit=shot.hit;out.damage=shot.damage||0;out.killed=shot.killed;}else log('[PASSIVE] Sharingan Copy: no prior enemy attack.','passive');}
   if(!c.pool.length)c.cooldown=5;
   return out;
  }
  function attack(bs,u,target,options={}){
   if(u.akatsukiCrow)return hitResult(bs,u,target,1,{...options,specialAttack:false});
   if(isPain(u)&&api.id(u)==='pain'||u.akatsukiPath)return painAttack(bs,u,target,options);
   const id=api.id(u);if(!IDS.includes(id))return null;if(id==='itachi-awakened')return itachiAttack(bs,u,target,options);
   const out=result(u,target),special={...options,specialAttack:true},c=state(u,id);
   if(id==='kisame-hoshigaki'){
    if(runtime(target).shield>0)api.shield(u,atk(u)*.50,(bs.turnCount||0)+5);
    if((bs.turnCount||0)<=c.domainUntil){api.add(u,'atk',.03);api.add(u,'hp',.03,true);}
   }
   hitResult(bs,u,target,1,{...options,specialAttack:false},out);
   if(id==='konan'&&out.hit&&alive(target))paper(target,1,u);
   if(id==='deidara'&&c.attacks%3===0)for(const enemy of shuffle(enemies(bs,u)).slice(0,3))hitResult(bs,u,enemy,.40,special,out);
   if(id==='orochimaru'&&out.hit&&alive(target)&&api.allowed(target,u)&&random()<.25)(runtime(target).akatsukiPoison ||= []).push({turns:3,damage:atk(u)*.10,owner:u});
   if(id==='hidan'&&out.hit&&alive(target)&&runtime(target).bleed.some(e=>e.turns>0)&&random()<.66){let mark=(runtime(target).akatsukiVoodoo ||= []).find(v=>v.owner===u);if(!mark){mark={owner:u};runtime(target).akatsukiVoodoo.push(mark);}Object.assign(mark,{turns:3,applied:bs.turnCount});}
   return out;
  }
  function startTurn(bs,actor){
   const now=bs.turnCount||0;
   for(const u of [...all(bs)]){
    if(!alive(u))continue;restoreBurn(u);
    if(has(u,'hidan')){const c=state(u,'hidan');c.healBuffs=(c.healBuffs||[]).filter(b=>b.expires>=now);api.percent(u,'atk','hidan-healing',c.healBuffs.reduce((n,b)=>n+b.percent,0));}
    if(isPain(u)&&painState(u).path==='Asura'&&now%3===0)api.shield(u,atk(u)*.25,null);
    for(const {owner} of runtime(u).akatsukiPuppets||[])if(alive(owner)&&has(owner,'sasori')&&!hasClone(u))api.heal(u,u.maxHp*.01,'Puppet',bs,owner);
    if(u!==actor&&has(u,'deidara')&&team(bs,u).includes(actor)&&random()<.40){const enemy=pick(enemies(bs,u));if(enemy)api.hit(bs,u,enemy,atk(actor)*.50,{specialAttack:true});}
   }
   const r=runtime(actor);for(const poison of r.akatsukiPoison||[]){if(poison.turns>0&&alive(actor))api.poisonDamage(bs,poison.owner,actor,poison.damage);poison.turns--;}
   r.akatsukiPoison=(r.akatsukiPoison||[]).filter(p=>p.turns>0);restoreBurn(actor);
  }
  function observeAttack(bs,actor,out){if(out?.skipped)return;for(const enemy of enemies(bs,actor))if(has(enemy,'itachi-awakened'))state(enemy,'itachi-awakened').lastEnemyAttack=Math.max(0,out?.damage||0);}
  function endTurn(bs,actor){
   if(!actor)return;const r=runtime(actor),now=bs.turnCount;
   for(const key of ['akatsukiMiss','akatsukiHypnosis'])if(r[key]&&r[key].applied!==now&&--r[key].turns<=0)r[key]=null;
   r.akatsukiVoodoo=(r.akatsukiVoodoo||[]).filter(v=>v.applied===now||--v.turns>0);
   if(r.akatsukiHealBlock>0&&r.akatsukiHealApplied!==now)r.akatsukiHealBlock--;
   if(actor.akatsukiCrow){const owner=actor.akatsukiCrowOwner,line=team(bs,actor);if(alive(actor)&&alive(owner)){line.splice(line.indexOf(actor),1);line.push(actor);bs[line===bs.playerTeam?'playerIndex':'enemyIndex']=line.indexOf(owner);api.indices(bs);}}
  }
  function hypnosisTarget(bs,u,fallback){return runtime(u).akatsukiHypnosis?.turns>0&&random()<.80?pick(allies(bs,u,false))||fallback:fallback;}
  function badges(u){const r=runtime(u),rows=[];if(r.akatsukiPaper)rows.push({label:'PAPER '+r.akatsukiPaper,icon:'▤',tone:'debuff',category:'status'});if(r.akatsukiPoison?.length)rows.push({label:'POISON '+Math.max(...r.akatsukiPoison.map(p=>p.turns))+'t',icon:'☠',tone:'debuff',category:'status'});if(r.akatsukiVoodoo?.length)rows.push({label:'VOODOO',icon:'◈',tone:'debuff',category:'status'});if(r.akatsukiPuppets?.some(p=>alive(p.owner)))rows.push({label:'PUPPET · ATK +10% / HP +15%',icon:'♟',tone:'buff',category:'buff'});if(has(u,'kakuzu'))rows.push({label:'HEART '+(state(u,'kakuzu').hearts||0)+'/5 · '+(u.akatsukiElements||[]).join('/'),icon:'♥',tone:'passive',category:'passive'});if(isPain(u))rows.push({label:'RINNEGAN · '+painState(u).path+(painState(u).path==='Deva'?' '+(painState(u).charge||0)+'/3':''),icon:'◉',tone:'passive',category:'passive'});if(has(u,'itachi-awakened')){const c=state(u,'itachi-awakened');rows.push({label:'TECHNIQUES '+(c.pool?.length||0)+' · COOLDOWN '+(c.cooldown||0),icon:'◉',tone:'passive',category:'passive'});}return rows;}
  return {IDS,PATHS,state,painState,entry,counted,attack,skipTurn,cloneChance,hasClone,hasLife,uncloneable,noLife,noExternalRevive,reviveAlly,died,killed,fatal,interceptHeal,dodgeChance,dodge,misses,immune,incoming,reflect,damaged,startTurn,endTurn,hypnosisTarget,observeAttack,rememberBurn,restoreBurn,cleanse,clearBuffs,shieldGranted,paperReduction,badges};
 };
})(window);
