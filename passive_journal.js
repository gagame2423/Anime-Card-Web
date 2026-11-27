/* Read-only audit trail for the turn-based arena. Never rolls RNG or drives
   a passive. Existing named logs are preserved; actual silent state changes
   supply an additional, source-attributed line. */
(function(host){
 'use strict';
 const MODES=new Set(['1v1','4v4','tower','time-trial','exp-time-trial','material-time-trial','raid','rift','boss-event','spooky-hunt','infinity','portal']);
 const STATUS=/^(stun|freeze|fear|hindred|hypnosis|snail|invincible|incomingImmune|immune|weakenAttack|passiveSuppression|noDodge|spookyFrog|void|dodge|speed|soul|shield|damageReduction|atkBoost|incomingVulnerability|cleanse|domain|doom|meteor|haki|heresy).*Turns$/i;
 const STATE=/stack|point|charge|streak|meter|cooldown|bonus|reduction|immune|counter|progress|mode$|form$|stance$|^flow$|^bolts$|^spirit$|^chaos$|^bhain$|^vista$|^hakka$|^lust$|^pride$|^sunshine$|^sun$|^candies$|^living$|^departed$|^lament$|^mana$|^hearts$|^soul$|^rocks$|^read$|^positive$|^negative$|^excalibur$|^meteor$|^domain$|^doom$|^stored|^slime|^aura|^next.*(?:multiplier|bonus|move|stun|crit)|^reviv|used$|^serious$|^locked$|^active$|^passiveDisabled$|^passiveSuppressedUntilDeath$|^sawContractMiss$/i;
 const EXCLUDE=/^(?:last|display|base|initial|original|before|previous|processed|applied|usedToken)|(?:Token|Applied|Started|AppliedTurn|Tick|Serial|Id|Owner|Source|Target|Receipt)$/i;
 const PERCENT=/pct$|(?:atk|hp|damage|crit|dodge|stalk|reduction|chance|vulnerability)bonus|chance$|^stalk(?:Atk|Hp)$/i;
 const TIMERS=/turns$|cooldown$|countdown$|^domain$|^doom$/i;
 const title=k=>String(k).replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/[-_]/g,' ').replace(/\b(hp|atk|dr|cc)\b/gi,m=>m.toUpperCase()).replace(/^./,c=>c.toUpperCase());
 const num=n=>Number(n.toFixed(4));
 const numberFormat=new Intl.NumberFormat('en-US',{maximumFractionDigits:4});
 const name=u=>String(u?.display?.name||u?.card?.name||'Unit');
 const active=bs=>Boolean(bs&&MODES.has(bs.mode)&&!bs.sandbox&&!bs.pvp);
 const alive=u=>u&&u.hp>0&&!u.defeated;
 const thresholds=new Map();
 function attackThreshold(card){
  if(!card?.id)return false;
  if(!thresholds.has(card.id))thresholds.set(card.id,/\b(?:every|on (?:the |its )?|after |the )\s*\d+(?:st|nd|rd|th)?\s+(?:own |personal |successful |consecutive )?attacks?\b|\battacks?\s*(?:#|number )?\d+/i.test(card.passive?.description||''));
  return thresholds.get(card.id);
 }
 host.createPassiveJournal=function({card,emit,moduleOwns=()=>true}){
  let current=null;
  const label=u=>card(u?.passiveState?.effectivePassiveId||u?.card?.id)?.passive?.name||u?.card?.passive?.name||'Passive';
  function read(u){
   const snapshot={hp:Number(u.hp)||0,alive:alive(u),values:new Map(),name:name(u)};
   const values=snapshot.values,r=u.passiveState;
   function put(key,l,v,type='resource',skill=label(u)){
    if(typeof v==='number'){if(!Number.isFinite(v))return;v=num(v);}
    if(typeof v==='string'&&!v.length||v===undefined||v===null)return;
    if(!['number','string','boolean'].includes(typeof v))return;
    values.set(key,{label:l,value:v,type,skill});
   }
   put('atk','ATK',Number(u.atk),'stat');put('maxHp','Max HP',Number(u.maxHp),'stat');put('shield','Shield',Number(r?.shield)||0,'shield');
   if(!r)return snapshot;
   const visited=new WeakSet();
   function scan(obj,prefix,depth,skill,definition){
    if(!obj||typeof obj!=='object'||depth>3||visited.has(obj))return;visited.add(obj);
    for(const key of Object.keys(obj)){
     if(!moduleOwns(key,definition?.id)||EXCLUDE.test(key)||['grimoire','shield','hp','atk','maxHp','activeTags','lastPassiveTrigger','ownAttackCount','ownTurnCount','attackCount','successfulHits','followUpHits','kills','hitsTaken','lastHp','titanShieldCapacity','titanStunPenalty'].includes(key))continue;
     const v=obj[key],path=prefix+key;
     if(typeof v==='number'||typeof v==='boolean'||typeof v==='string'){
      if(key==='attacks'&&!attackThreshold(definition))continue;
      if((key==='positive'||key==='negative')&&prefix==='champion.'&&definition?.id!=='tower-champion-normal')continue;
      if(prefix==='champion.'&&key==='form'&&definition?.id!=='tower-champion-sugar')continue;
      if(key==='form'&&v==='base')continue;
      if(key==='attacks'||STATUS.test(key)||STATE.test(key))put(path,key==='attacks'?'Attack count':title(key),v,STATUS.test(key)||TIMERS.test(key)?'timer':PERCENT.test(key)?'percent':'resource',skill);
     }else if(Array.isArray(v)){
      if(['burn','bleed','poison'].includes(key)){
       const amount=v.reduce((n,e)=>n+(Number(e?.damage)||0),0);
       put(path,title(key)+' stacks',v.length,'status',skill);put(path+':damage',title(key)+' raw damage/turn',amount,'status',skill);
      }else if(/^(?:pendingMoves|copies|pool|marks|souls|charges|clones|links)$/.test(key))put(path,title(key),v.length,'resource',skill);
     }else if(v&&typeof v==='object'&&!v.card&&!v.nodeType&&Object.getPrototypeOf(v)===Object.prototype){
      const native=card(key),isSkill=Boolean(native?.passive?.name);
      if(isSkill&&native.id!==definition?.id)continue;
      scan(v,path+'.',depth+1,isSkill?native.passive.name:skill,isSkill?native:definition);
     }
    }
   }
   const native=card(r.effectivePassiveId||u.card?.id)||u.card;
   scan(r,'',0,label(u),native);
   if(attackThreshold(native)&&!Array.from(values.keys()).some(k=>k.endsWith('.attacks')))put('nativeAttacks','Attack count',Number(r.ownAttackCount)||0,'resource',label(u));
   for(const c of r.grimoire?.copies||[]){
    const def=card(c.id);scan(c.state,'copy/'+c.id+'/',0,def?.passive?.name||c.id,def);
   }
   return snapshot;
  }
  function team(bs){return [...new Set([...(bs.playerTeam||[]),...(bs.enemyTeam||[])])].filter(Boolean);}
  function snapshot(bs){return new Map(team(bs).map(u=>[u,read(u)]));}
  function record(bs,message,tone,source){if(current?.bs===bs&&!current.reporting)current.logs.push({message:String(message),tone,source});}
  function covered(ctx,u,label,skill,type,before,after){
   const text=label.toLowerCase().replace(/ turns$/,'');
   const keywords=type==='status'?[text.split(' ')[0]]:type==='shield'?['shield']:type==='stat'?(label==='ATK'?['atk','attack']:['max hp','max health']):text.includes('attack count')?['attack #','prepared','attack threshold']:text.split(' ').filter(w=>w.length>2);
   return ctx.logs.some(row=>{
    const m=row.message.toLowerCase(),scope=m.includes(name(u).toLowerCase())||skill&&m.includes(skill.toLowerCase())&&row.source===u;
    if(!scope||!/\[(?:passive|champion|special|self-passive|shield|heal|debuff|status|buff|revive|relic)\]/i.test(m)&&!['passive','shield','heal','debuff','buff','revive','special','buff'].includes(row.tone))return false;
    // Explicit log of the same effect is preferred. Generic trigger text
    // doesn't hide a different buff/status that also changed in this event.
    return keywords.length&&(type==='stat'||type==='status'?keywords.some(w=>m.includes(w)):keywords.every(w=>m.includes(w)))&&(type!=='timer'||m.includes(String(after))||m.includes('expired')||m.includes('cleans'));
   });
  }
  function format(row,before){
   const v=row.value,label=row.label;
   if(typeof v==='boolean')return label+(v?' activated':' ended');
   if(typeof v==='string')return label+': '+v;
   if(row.type==='percent')return label+': '+num(before*100)+'% → '+num(v*100)+'%';
   if(row.type==='timer')return label.replace(/ Turns$/i,'')+(v>0?': '+v+' turn'+(v===1?'':'s'):' expired/cleared');
   const f=n=>typeof n==='number'?numberFormat.format(n):String(n);
   return label+': '+f(before)+' → '+f(v);
  }
  function flush(ctx){
   const now=snapshot(ctx.bs),actor=ctx.owner;ctx.reporting=true;
   try{
    for(const [u,next]of now){
     const old=ctx.before.get(u);
     if(!old){
      if(alive(u)&&(u.isClone||u.isSummoned||u.isTemporaryAlly||u.championSummonType||u.companionOwner))emit('[PASSIVE] '+name(actor||u)+' summoned '+name(u)+' ('+Math.round(u.maxHp).toLocaleString('en-US')+' HP, '+Math.round(u.atk).toLocaleString('en-US')+' ATK).','passive',actor||u,ctx.bs);
      continue;
     }
     const groups=new Map();
     function add(skill,tone,text){
      const k=skill+'|'+tone;const group=groups.get(k)||{skill,tone,parts:[]};group.parts.push(text);groups.set(k,group);
     }
     if(!old.alive&&next.alive&&!ctx.logs.some(x=>/reviv|resurrect/i.test(x.message)&&x.message.includes(next.name)))add(label(u),'revive','revived at '+Math.round(next.hp).toLocaleString('en-US')+' HP');
     else if(old.alive&&next.alive&&next.hp>old.hp&&next.values.get('maxHp')?.value===old.values.get('maxHp')?.value&&!ctx.logs.some(x=>/heal|recover|restor/i.test(x.message)&&x.message.includes(next.name)))add(label(u),'heal','restored '+Math.round(next.hp-old.hp).toLocaleString('en-US')+' HP');
     for(const [key,row]of next.values){
      const previous=old.values.get(key)?.value??(typeof row.value==='number'?0:typeof row.value==='boolean'?false:'');
      if(row.value===previous||row.value===false&&!previous||row.value===0&&!previous||row.type==='shield'&&row.value<previous&&row.value>0)continue;
      // Do not print normal timer countdowns each turn. Applications,
      // refreshes, expiry/cleanses and meaningful counter changes remain.
      if(row.type==='timer'&&typeof previous==='number'&&row.value>0&&row.value<previous)continue;
      if(row.type==='status'&&row.label.endsWith('damage/turn')&&row.value===0)continue;
      if(covered(ctx,u,row.label,row.skill,row.type,previous,row.value))continue;
      const tone=row.type==='shield'?'shield':row.type==='stat'&&row.value<previous?'debuff':row.type==='status'||row.type==='timer'&&/^(stun|freeze|fear|hindred|hypnosis|snail|weaken|passive suppression)/i.test(row.label)?'debuff':'passive';
      add(row.skill,tone,format(row,previous));
     }
     // Some modules delete a status object rather than setting it to zero.
     for(const [key,row]of old.values)if(!next.values.has(key)&&row.type==='timer'&&Number(row.value)>0)add(row.skill,'debuff',row.label.replace(/ Turns$/i,'')+' expired/cleared');
     for(const {skill,tone,parts}of groups.values()){
      const who=tone==='debuff'&&actor?actor:u,caption=tone==='debuff'&&actor&&u!==actor?label(actor):skill,tag=tone==='shield'?'SHIELD':tone==='debuff'?'DEBUFF':tone==='heal'?'HEAL':tone==='revive'?'REVIVE':'PASSIVE';
      emit('['+tag+'] '+next.name+' · '+caption+' — '+parts.join('; ')+'.',tone,who,ctx.bs);
     }
    }
   }finally{ctx.before=now;ctx.logs.length=0;ctx.reporting=false;}
  }
  function trace(bs,owner,fn){
   if(!active(bs))return fn();
   const prev=current;if(prev?.bs===bs)return fn();let ctx;
   try{ctx={bs,owner,before:snapshot(bs),logs:[],reporting:false};}catch(_){return fn();}
   current=ctx;
   try{return fn();}finally{try{flush(ctx);}catch(_){}finally{current=prev;}}
  }
  return Object.freeze({active,trace,record});
 };
})(window);
