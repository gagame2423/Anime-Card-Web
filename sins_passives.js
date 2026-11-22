/* Seven Sins: battle-local state, bounded summons and shared combat adapters. */
(function(host){
 'use strict';
 if(host.createSinsSkills?.__sins_passivesWrapped)return;
 const instances=new WeakMap();
 host.createSinsSkills=function(api){
  if(instances.has(api))return instances.get(api);
  const MELI='meliodas',BAN='ban',DIANE='diane',KING='king-harlequin',GOW='gowther',ESC='escanor-the-one';
  const IDS=Object.freeze([MELI,BAN,DIANE,KING,GOW,ESC]);
  const {has,alive,all,allies,enemies,team,runtime,refresh,random}=api;
  const state=(u,id)=>api.passiveRuntimeFor(u,id).sins ||= {entered:false,sun:0,mode:0,lust:0,rescues:0,stolen:[],serial:0,cloned:new WeakSet(),targets:new WeakMap()};
  const present=bs=>Boolean(bs&&all(bs).some(u=>IDS.some(id=>has(u,id))));
  const active=(bs,id)=>bs?all(bs).filter(u=>alive(u)&&has(u,id)):[];
  const prepared=new WeakMap(),finishedActions=new WeakMap();
  function actionRecord(store,u,target){let map=store.get(u);if(!map){map=new WeakMap();store.set(u,map);}return map;}
  const one=u=>has(u,ESC)&&state(u,ESC).mode>0;
  function allowStat(u,stat,delta,key){
   if(!has(u,ESC))return true;
   if(key==='sins:the-one'||key==='relic:alien-watch')return true;
   if(delta>0)return false;
   return !(stat==='atk'&&delta<0&&one(u));
  }
  const shieldWriting=new WeakSet();
  const buffFields=new Set(['atkBonusPct','maxHpBonusPct','displayAtkBonusPct','displayHpBonusPct','critChanceBonus','critDamageBonus','damageReductionPct','postReviveDodgeBonus','invincibleTurns','incomingImmuneTurns','immuneTurns','nextAttackMultiplier']);
  function shieldAmount(bs,u,amount){
   if(has(u,ESC))return 0;
   const king=active(bs,KING).some(k=>team(bs,k)!==team(bs,u)&&k.hp>k.maxHp*.5);
   return Math.max(0,Number(amount)||0)*(king?.75:1);
  }
  function writeShield(u,fn){shieldWriting.add(u);try{return fn();}finally{shieldWriting.delete(u);}}
  function observe(bs,u,view){return api.observeRuntime(bs,u,view,'sins',['shield',...buffFields,'stunTurns','freezeTurns','weakenAttackTurns','weakenAttackPct'],(target,key,value)=>{
    const current=api.currentBattle?.()||bs,before=Number(target[key])||0;
    if(key==='shield'&&!shieldWriting.has(u)&&Number(value)>before)value=before+shieldAmount(current,u,Number(value)-before);
    if(has(u,ESC)){
      if(buffFields.has(key)&&Number(value)>Math.max(0,before))return{block:true};
      if(['stunTurns','freezeTurns','weakenAttackTurns','weakenAttackPct'].includes(key)&&Number(value)>0&&one(u))return{block:true};
      if(key==='atkBonusPct'&&Number(value)<before&&one(u))return{block:true};
    }return{value};
  });}
  function exitOne(u){const c=state(u,ESC);c.sun=0;c.mode=0;api.percent(u,'atk','sins:the-one',0);api.watch?.change(u,'the-one','base');refresh(u);}
  function enterOne(u){
   const c=state(u,ESC);c.mode=5;api.watch?.change(u,'base','the-one');
   const r=runtime(u);r.stunTurns=0;r.freezeTurns=0;r.weakenAttackTurns=0;r.weakenAttackPct=0;
   if(r.atkBonusPct<0)r.atkBonusPct=0;
   api.clearAtkDebuffs(u);api.percent(u,'atk','sins:the-one',1.5);refresh(u);
  }
  function entry(bs,u){
   if(has(u,KING)){const c=state(u,KING);if(!c.entered){c.entered=true;if(runtime(u).initialLineupIndex===0)for(const ally of allies(bs,u))api.shield(ally,u.maxHp*1.5);}}
   if(has(u,DIANE)){const c=state(u,DIANE);if(!c.entered){c.entered=true;c.lead=runtime(u).initialLineupIndex===0;}}
  }
  function created(bs,owner,unit){
   if(!unit.isClone)return;
   const count=allies(bs,owner).filter(u=>has(u,DIANE)).length;
   if(count){api.add(unit,'hp',count*.10,true);api.add(unit,'atk',count*.10);refresh(unit);}
  }
  function startTurn(bs,actor){
   for(const diane of active(bs,DIANE)){
    const c=state(diane,DIANE);if(!c.lead||!api.canClone(bs,diane))continue;
    const candidates=all(bs).filter(u=>u!==diane&&alive(u)&&u.card?.element==='Nature'&&!api.generated(u)&&!c.cloned.has(u)&&!api.uncloneable(u));
    const target=candidates[Math.floor(random()*candidates.length)];
    if(target&&api.clone(bs,diane,target))c.cloned.add(target);
   }
   if(actor&&has(actor,ESC)&&api.ownTurn(bs,actor)){
    const c=state(actor,ESC);
    if(!c.mode){c.sun=Math.min(12,c.sun+(api.watch?.gain(actor,1)??1));if(c.sun===12)enterOne(actor);}
   }
  }
  function endTurn(bs,actor){
   if(!actor||!api.ownTurn(bs,actor))return;
   const mode=api.passiveRuntimeFor(actor,ESC).sins;if(mode?.mode>0&&--mode.mode===0)exitOne(actor);
   const ban=api.passiveRuntimeFor(actor,BAN).sins;
   if(ban){for(const buff of ban.stolen)if(api.ownTurns(bs,actor)>=buff.expires){if(buff.stat)api.percent(actor,buff.stat,buff.key,0);buff.expired=true;}ban.stolen=ban.stolen.filter(b=>!b.expired);}
   const r=runtime(actor);if(r.sinsHypnosisTurns>0&&r.sinsHypnosisApplied!==bs.turnCount)r.sinsHypnosisTurns--;
  }
  function steal(bs,u,target,options){
   if(!has(u,BAN)||options.sinsCounter||options.sinsSplash||!api.allowed(target,u))return;
   const choices=api.buffChoices(target).filter(b=>b.value>0&&!(b.stat==='atk'&&one(target)));
   const choice=choices[Math.floor(random()*choices.length)];if(!choice)return;
   const amount=Math.min(.10,choice.value),c=state(u,BAN),key='sins:snatch:'+(++c.serial);
   if(!api.reduceBuff(target,choice,amount))return;
   if(choice.stat)api.percent(u,choice.stat,key,amount,choice.stat==='hp');
   c.stolen.push({stat:choice.stat,field:choice.field,key,value:amount,expires:api.ownTurns(bs,u)+3});refresh(target);refresh(u);
  }
  function prepare(bs,u,target,options){
   if(!u||!target||!has(u,BAN)&&!has(u,ESC))return;
   const records=actionRecord(prepared,u,target),token=api.attackToken(bs,u,options),prior=records.get(target);
   if(prior?.token===token){if(prior.one!==undefined){options.sinsOne=prior.one;options.sinsShieldBefore=prior.shield;}return;}
   steal(bs,u,target,options);
   let factor=1;
   if(has(u,ESC)){
    options.sinsShieldBefore=runtime(target).shield||0;
    options.sinsOne=one(u);
    if(options.sinsOne){const frozen=runtime(target).freezeTurns>0;if(frozen||target.card?.element==='Water')factor=1.5;if(frozen)runtime(target).freezeTurns=0;if(runtime(target).shield>0)api.breakShield(bs,u,target);}
   }
   records.set(target,{token,one:options.sinsOne,shield:options.sinsShieldBefore,factor});
  }
  function target(bs,u,enemy,meta={}){
   if(!bs||!u||!enemy||!has(u,KING)||team(bs,u)===team(bs,enemy))return;
   const c=state(u,KING),token=api.attackToken(bs,u,meta),prior=c.targets.get(enemy);
   if(prior?.token!==token)c.targets.set(enemy,{token,fresh:!enemy.hasBeenAttacked,used:false});
  }
  function damageBonus(bs,u,enemy,amount,meta){
   if(!u||meta.dot||meta.sinsCounter||meta.sinsSplash||meta.sinsRedirect||meta.ballerRedirect||meta.championRedirect||meta.grimoireReflection||meta.entenReflect||meta.akatsukiReflect)return amount;
   prepare(bs,u,enemy,meta);
   if(has(u,DIANE)&&u.card?.element==='Nature'&&enemy.card?.element==='Electric')amount*=4/3;
   if(has(u,KING)){const t=state(u,KING).targets.get(enemy);if(t?.fresh&&!t.used){t.used=true;amount+=enemy.maxHp*.10;}}
   if(has(u,ESC)){const action=prepared.get(u)?.get(enemy);if(action)amount*=action.factor;if(one(u)&&runtime(enemy).shield>0)api.breakShield(bs,u,enemy);}
   return amount;
  }
  function after(bs,u,target,out,options={}){
   if(!u||!target||!out?.hit||out.dodged||out.reflected||out.skipped||!alive(u))return;
   if(!has(u,GOW)&&!has(u,ESC))return;
   const records=actionRecord(finishedActions,u,target),token=api.attackToken(bs,u,options);if(records.get(target)===token)return;records.set(target,token);
   if(has(u,GOW)&&alive(target)&&random()<.20&&api.allowed(target,u)){const r=runtime(target);if(api.status(target,'sinsHypnosisTurns',2,u)){r.sinsHypnosisApplied=bs.turnCount;r.sinsHypnosisOwner=u;state(u,GOW).lust=Math.min(Number.MAX_SAFE_INTEGER,state(u,GOW).lust+(api.watch?.gain(u,1)??1));refresh(u);}}
   if(has(u,ESC)&&!options.sinsOne&&options.sinsShieldBefore>0&&runtime(target).shield>0&&!options.sinsSplash){
    api.dot(target,'burn',2,api.atk(u)*.50,u);
    const damage=Math.max(0,out.damage||0)+Math.max(0,options.sinsShieldBefore-runtime(target).shield),line=enemies(bs,u),index=line.indexOf(target);
    const nearby=bs.mode==='auto-chess'&&target.grid?line.filter(v=>v!==target&&v.grid&&Math.max(Math.abs(v.grid.x-target.grid.x),Math.abs(v.grid.y-target.grid.y))<=1).slice(0,2):[line[index-1],line[index+1]].filter(Boolean);
    for(const enemy of nearby)if(alive(u))api.take(bs,u,enemy,damage,{passiveAttack:true,specialAttack:true,sinsSplash:true,elementApplied:true,akatsukiRawDamage:true});
   }
  }
  function stolenBonus(u,field){return has(u,BAN)?state(u,BAN).stolen.filter(b=>b.field===field).reduce((n,b)=>n+b.value,0):0;}
  function crit(bs,u){return {chance:(has(u,MELI)&&bs?team(bs,u).filter(v=>v!==u&&api.category(v,'Sins')).length*.10:0)+stolenBonus(u,'critChanceBonus'),damage:(has(u,MELI)?.50:0)+stolenBonus(u,'critDamageBonus')};}
  function dodge(u){return (has(u,GOW)&&state(u,GOW).lust>=4?.50:0)+stolenBonus(u,'postReviveDodgeBonus');}
  function reduction(u){return (has(u,GOW)&&state(u,GOW).lust>0?.50:0)+stolenBonus(u,'damageReductionPct');}
  function consumeHit(u,meta){if(has(u,GOW)&&!meta.dot&&!meta.sinsRedirect&&state(u,GOW).lust>0)state(u,GOW).lust=Math.max(0,state(u,GOW).lust-1);}
  function counter(bs,source,u,amount,meta){
   if(!source||!has(u,MELI)||meta.dot||meta.sinsCounter||meta.sinsRedirect||meta.ballerRedirect||meta.championRedirect||meta.grimoireReflection||meta.akatsukiReflect||meta.entenReflect||!api.category(source,'Magician')||random()>=.50)return false;
   api.take(bs,u,source,amount*1.5,{passiveAttack:true,sinsCounter:true,elementApplied:Boolean(meta.elementApplied),dodgeChecked:true});return true;
  }
  function protect(bs,u,source,amount,meta={}){
   if(!(amount>=u.hp&&amount>0)||meta.sinsRedirect||meta.sinsExecute)return false;
   const king=allies(bs,u,false).find(k=>has(k,KING)&&state(k,KING).rescues<3);if(!king)return false;
   state(king,KING).rescues++;api.take(bs,source,king,amount*.25,{passiveAttack:true,sinsRedirect:true,elementApplied:true,dodgeChecked:true});refresh(king);return true;
  }
  function fatal(bs,u){if(!one(u)||u.championPermanentDeath)return false;exitOne(u);u.hp=Math.max(1,Math.round(u.maxHp*.50));u.defeated=false;api.revived(bs,u);refresh(u);return true;}
  function dotFactor(bs){return active(bs,BAN).length?1.25:1;}
  function blackExecute(bs,source){return source&&team(bs,source).some(u=>has(u,MELI));}
  function immune(u,key){return one(u)&&['stunTurns','freezeTurns','weakenAttackTurns','weakenAttackPct'].includes(key);}
  function hypnosisTarget(bs,u,fallback){return runtime(u).sinsHypnosisTurns>0&&random()<.80?allies(bs,u,false)[Math.floor(random()*allies(bs,u,false).length)]||fallback:fallback;}
  function badges(bs,u){const out=[];if(has(u,ESC)){const c=state(u,ESC);out.push({icon:'☀',label:c.mode?'THE ONE '+c.mode+'t':'SUNSHINE '+c.sun+'/12',tone:'form'});}if(has(u,GOW))out.push({icon:'♥',label:'LUST '+state(u,GOW).lust,tone:'buff'});if(has(u,KING))out.push({icon:'◆',label:'DISASTER '+state(u,KING).rescues+'/3',tone:'passive'});if(has(u,BAN)&&state(u,BAN).stolen.length)out.push({icon:'↙',label:'SNATCH '+state(u,BAN).stolen.length,tone:'buff'});return out;}
  const skills={IDS,state,present,one,allowStat,observe,shieldAmount,writeShield,entry,created,startTurn,endTurn,prepare,target,damageBonus,after,crit,dodge,reduction,stolenBonus,consumeHit,counter,protect,fatal,dotFactor,blackExecute,immune,hypnosisTarget,badges,blocksExternal:u=>has(u,ESC)};instances.set(api,skills);return skills;
 };
host.createSinsSkills.__sins_passivesWrapped=true;
})(window);
