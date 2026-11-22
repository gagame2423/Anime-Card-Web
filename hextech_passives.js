/* Deterministic Hextech skills. All counters and leases belong to one passive
   runtime; no timers, global unit state, unbounded recursion or inventory writes. */
(function(host){
 'use strict';
 if(host.createHextechSkills?.version===1)return;
 const IDS=Object.freeze(['tulen','veera','jinx','ahri','krixi','neeko','sonic','yasuo','yone']);
 host.createHextechSkills=function(api){
  const {has,alive,runtime,team,enemies,atk,random}=api,seenKills=new WeakMap(),links=new WeakMap();
  function link(u,owner,id,key,n){let rows=links.get(u);if(!rows){rows=[];links.set(u,rows);}if(!rows.some(r=>r.owner===owner&&r.id===id&&r.key===key))rows.push({owner,id,key,n});}
  const gain=(u,n)=>api.watch?.gain(u,n)??n;
  const state=(u,id)=>((api.passiveRuntimeFor(u,id).hextechSkills ||= {})[id] ||= {entered:false,attacks:0,bolts:0,bhain:0,killChance:0,spirit:0,fox:false,chaos:0,flow:0,soulDamage:0});
  const scope=(u,id,fn)=>api.scope(u,id,fn),pick=rows=>rows[Math.floor(random()*rows.length)],rollInt=(a,b)=>a+Math.floor(random()*(b-a+1));
  const hit=(bs,u,v,n,meta={})=>{if(!alive(v)||!(n>0))return {damage:0,hit:false,killed:false};const out=api.hit(bs,u,v,n,{passiveAttack:true,specialAttack:true,hextechSkill:true,...meta});return {...out,hit:!out.skipped&&!out.dodged&&!out.reflected&&!out.immune&&!out.missed};};
  const primary=(bs,u,v,n,options={})=>api.primary(bs,u,v,Math.max(0,n),{...options,passiveAttack:true,specialAttack:true,hextechSkill:true});
  const merge=(out,r)=>{out.hit ||= !!r?.hit;out.damage+=r?.damage||0;out.killed ||= !!r?.killed;return out;};
  const result=(u,v)=>({attacker:u,target:v,hit:false,killed:false,damage:0,hextechSkill:true});
  function duration(bs,u,c,key,n){c[key]=Math.max(c[key]||0,n);c[key+'Applied']=api.ownTurns(bs,u);}
  function tick(bs,u,c,key){if(c[key]>0&&api.ownTurns(bs,u)>c[key+'Applied'])c[key]--;}
  function enterFox(u,c){if(!c.fox&&c.spirit>=100){c.spirit=100;c.fox=true;api.watch?.change(u,'spirit','fox');}}
  function entry(bs,u){for(const id of IDS)if(has(u,id))scope(u,id,()=>{const c=state(u,id);if(c.entered)return;c.entered=true;
   if(id==='yasuo'){
    c.loneBlade=!team(bs,u).some(v=>v!==u&&api.category(v,'Swordman'));
    for(const ally of team(bs,u))if(has(ally,'yone')){api.percent(ally,'atk','hex:yasuo-link',.10);link(ally,u,id,'chance',.10);}
   }
   if(id==='yone')for(const ally of team(bs,u))if(has(ally,'yasuo')){api.percent(ally,'hp','hex:yone-link',.25,true);link(ally,u,id,'damage',.50);}
  });}
  function prepare(bs,u,v,options){
   if(options.isCounter)return options;
   for(const id of IDS)if(has(u,id)&&(!options.isFollowUp||id==='jinx')){const c=state(u,id);c.attacks++;
    if(id==='veera')c.bhain=Math.min(4,c.bhain+gain(u,runtime(v).bleed?.length?2:1));
    if(id==='yasuo')c.flow=Math.min(2,c.flow+gain(u,1));
    if(id==='yone'&&c.attacks%4===0){if(!c.soulTurns)api.watch?.change(u,'base','soul');duration(bs,u,c,'soulTurns',2);c.soulTurnsApplied=api.ownTurns(bs,u)-1;c.soulDamage=0;}
   }return options;
  }
  function attack(bs,u,v,options={}){
   if(options.isFollowUp||options.isCounter)return null;
   if(has(u,'tulen')){const c=state(u,'tulen');if(c.attacks%5===0||c.bolts>=5)return scope(u,'tulen',()=>{
    if(c.bolts>=5)c.bolts=0;const out=primary(bs,u,v,.20*Math.max(0,v.maxHp-v.hp),options);
    if(out.killed){const next=enemies(bs,u)[0];if(next)hit(bs,u,next,v.maxHp*.10);c.bolts=Math.min(5,c.bolts+gain(u,3));}return out;
   });}
   if(has(u,'veera')&&state(u,'veera').bhain>=4)return scope(u,'veera',()=>{const c=state(u,'veera'),out=result(u,v);c.bhain=0;for(const target of [v,...enemies(bs,u).filter(x=>x!==v)].filter(alive).slice(0,4))merge(out,primary(bs,u,target,atk(u)*.50,options));api.heal(bs,u,u,out.damage*.50,'Blood Chain');return out;});
   if(has(u,'krixi')&&state(u,'krixi').attacks%3===0)return scope(u,'krixi',()=>{const out=result(u,v),targets=[v,...enemies(bs,u).filter(x=>x!==v)].filter(alive);for(let i=0;i<targets.length&&alive(u);i++){const r=primary(bs,u,targets[i],atk(u)*Math.max(.10,1-.10*i),options);merge(out,r);if(r.hit&&alive(targets[i])&&random()<.50)api.status(targets[i],'stunTurns',1,u);}return out;});
   if(has(u,'yasuo')&&state(u,'yasuo').flow>=2)return scope(u,'yasuo',()=>{const c=state(u,'yasuo'),last=runtime(v).stunTurns>0;c.flow=0;const out=primary(bs,u,v,atk(u)*(last?2:1.5),options);
    if(out.hit){if(last){for(const target of enemies(bs,u))if(target!==v)api.status(target,'stunTurns',2,u);if(out.killed)c.flow=2;}else{if(alive(v))api.status(v,'stunTurns',1,u);if(random()<.33)duration(bs,u,c,'immuneTurns',3);}}return out;
   });
   if(has(u,'yone'))return scope(u,'yone',()=>{const c=state(u,'yone'),wind=c.attacks%2===1,out=result(u,v);
    if(wind){merge(out,primary(bs,u,v,atk(u)*1.10,options));if(out.hit&&alive(v)&&random()<.30)api.status(v,'stunTurns',1,u);}
    else {merge(out,primary(bs,u,v,atk(u)*.50,options));if(alive(v))merge(out,hit(bs,u,v,atk(u)*.50,{ignoreShield:true}));}
    if(c.soulTurns>0)for(const target of [...enemies(bs,u)].filter(x=>x!==v)){hit(bs,u,target,atk(u)*(wind?.55:.25));if(!wind&&alive(target))hit(bs,u,target,atk(u)*.25,{ignoreShield:true});}
    return out;
   });
   return null;
  }
  function afterAttack(bs,u,v,out,options={}){
   if(!alive(u)||out.skipped||out.outOfTurn||options.isCounter)return;
   for(const id of IDS)if(has(u,id)&&(!options.isFollowUp||id==='jinx'))scope(u,id,()=>{const c=state(u,id);
    if(id==='tulen'&&c.attacks%3===0)for(let i=0;i<3&&alive(u);i++){const target=pick(enemies(bs,u));if(target&&random()<.65){const r=hit(bs,u,target,atk(u)*.30);if(r.hit)c.bolts=Math.min(5,c.bolts+gain(u,1));}}
    if(id==='veera'&&alive(v)&&random()<.44)api.dot(v,'bleed',3,atk(u)*.33,u);
    if(id==='jinx'){
     if(c.attacks%4===0)for(const target of [...enemies(bs,u)].slice(0,5)){const shield=runtime(target).shield>0;if(shield)api.breakShield(bs,target,u);const r=hit(bs,u,target,atk(u)*1.50);if(!shield&&r.hit&&alive(target))api.status(target,'stunTurns',2,u);}
     if(options.isFollowUp)return;
     for(let chain=0;chain<32&&alive(u)&&api.canFollow(u);chain++){if(random()>=Math.min(.95,api.followChance(bs,u,.35+c.killChance+Math.min(.10,chain*.01),chain>0,.95)))break;const target=alive(v)?v:enemies(bs,u)[0];if(!target)break;const r=api.follow(bs,u,target,.30,{hextechChain:true});if(r.skipped||r.outOfTurn)break;}
    }
    if(id==='ahri'){
     if(bs.mode==='auto-chess'&&random()<.20)duration(bs,u,c,'speedTurns',3);
     if(c.fox){if(alive(v)&&out.hit){const hinder=random()<.50;api.status(v,hinder?'hindredTurns':'hypnosisTurns',hinder?2:1,u);}api.heal(bs,u,u,out.damage*(.75+random()*.30),'Fox Theft');}
     else {c.spirit=Math.min(100,c.spirit+gain(u,rollInt(1,5)));enterFox(u,c);if(c.fox)api.heal(bs,u,u,out.damage*(.75+random()*.30),'Fox Theft');else if(c.spirit>=1){c.spirit--;api.heal(bs,u,u,out.damage*(.35+random()*.60),'Fox Spirit');}}
    }
    if(id==='krixi'&&c.attacks%5===0)for(let n=0;n<12&&alive(u);n++){const target=pick(enemies(bs,u));if(!target)break;const r=hit(bs,u,target,atk(u)*.25);if(r.hit&&alive(target)&&random()<.10)api.status(target,'stunTurns',1,u);}
    if(id==='neeko'){
     if(c.attacks%3===0){if(alive(v))hit(bs,u,v,atk(u)*.20,{ignoreShield:true});duration(bs,u,c,'dodgeTurns',2);}
     const next=enemies(bs,u).find(x=>x!==v),pierce=random()<.50;if(next&&pierce)hit(bs,u,next,atk(u)*.50);
     if(alive(v)&&random()<.20)api.status(v,'stunTurns',pierce?2:1,u);
    }
    if(id==='sonic')for(let chain=0;chain<10&&alive(u)&&api.canFollow(u);chain++){
     if(random()>=api.followChance(bs,u,Math.max(0,Math.round((.90-chain*.10)*100)/100),chain>0,.99))break;const target=alive(v)?v:enemies(bs,u)[0];if(!target)break;
     const r=api.follow(bs,u,target,.10,{hextechChain:true});if(r.skipped||r.outOfTurn)break;if(random()<.10)c.chaos=Math.min(7,c.chaos+gain(u,1));
     if(chain===4&&c.chaos>=1){c.chaos--;for(const target of enemies(bs,u))api.status(target,'freezeTurns',2,u);}
    }
   });
  }
  function attacked(bs,u,source,meta={}){
   if(!source||meta.dot||meta.isCounter||meta.hextechCounter||!alive(u)||!has(u,'tulen'))return;
   const c=state(u,'tulen');if(c.bolts>=5)scope(u,'tulen',()=>{c.bolts=0;let stunned=false;for(let i=0;i<5&&alive(u)&&alive(source);i++){const out=hit(bs,u,source,atk(u)*.20,{isCounter:true,hextechCounter:true});if(out.hit&&!stunned&&random()<.10){stunned=true;api.status(source,'stunTurns',3,u);}}});
  }
  function shieldHit(bs,u,source,before){if(before>0&&runtime(u).shield<=0&&alive(u)&&has(u,'neeko'))scope(u,'neeko',()=>{for(const v of enemies(bs,u)){api.status(v,'hindredTurns',2,u);api.percent(v,'atk','hex:neeko-rupture',-.20);}});}
  function dodge(u){return has(u,'tulen')?.05:0;}
  function dodgeBonus(u){return has(u,'neeko')&&state(u,'neeko').dodgeTurns>0?.30:0;}
  function onDodge(bs,u,source){if(has(u,'tulen'))scope(u,'tulen',()=>{const c=state(u,'tulen');c.bolts=Math.min(5,c.bolts+gain(u,1));if(alive(source))api.status(source,'hindredTurns',5,u);});}
  function immune(u){return has(u,'yasuo')&&state(u,'yasuo').immuneTurns>0;}
  function status(bs,u,key){if(!has(u,'sonic')||!['stunTurns','freezeTurns'].includes(key))return false;const c=state(u,'sonic');if(c.cleanseTurns>0)return false;duration(bs,u,c,'cleanseTurns',5);runtime(u).stunTurns=0;runtime(u).freezeTurns=0;api.log('[PASSIVE] Aerokinesis cleansed Stun and Freeze.');return true;}
  function crit(u){return {chance:(has(u,'yasuo')&&state(u,'yasuo').loneBlade?.20:0)+Math.max(0,...(links.get(u)||[]).filter(r=>r.key==='chance'&&has(r.owner,r.id)).map(r=>r.n)),damage:Math.max(0,...(links.get(u)||[]).filter(r=>r.key==='damage'&&has(r.owner,r.id)).map(r=>r.n))};}
  function speed(u){return has(u,'ahri')&&state(u,'ahri').speedTurns>0?.40:0;}
  function turnEnd(bs,u){if(!u)return;for(const id of IDS){const c=api.passiveRuntimeFor(u,id).hextechSkills?.[id];if(!c||!has(u,id))continue;
   scope(u,id,()=>{for(const key of ['speedTurns','dodgeTurns','immuneTurns','cleanseTurns'])tick(bs,u,c,key);
    if(id==='ahri'&&c.fox){c.spirit=Math.max(0,c.spirit-rollInt(1,3));if(!c.spirit){c.fox=false;api.watch?.change(u,'fox','spirit');}}
    if(id==='yone'){
     if(c.atkTurns>0){tick(bs,u,c,'atkTurns');if(!c.atkTurns)api.flat(u,'atk','hex:soul-unbound',0);}
     if(c.soulTurns>0){tick(bs,u,c,'soulTurns');if(!c.soulTurns){api.watch?.change(u,'soul','base');api.flat(u,'atk','hex:soul-unbound',c.soulDamage*.25);duration(bs,u,c,'atkTurns',2);c.soulDamage=0;}}
    }
   });
  }}
  function damageDealt(bs,u,v,n){if(u&&has(u,'yone')){const c=state(u,'yone');if(c.soulTurns>0)c.soulDamage+=Math.max(0,n);}}
  function killed(bs,u,v){if(!u||!v||alive(v)||!alive(u))return;let seen=seenKills.get(u);if(!seen){seen=new WeakMap();seenKills.set(u,seen);}const life=api.life(v);if(seen.get(v)===life)return;seen.set(v,life);
   if(has(u,'jinx'))state(u,'jinx').killChance=Math.min(.25,state(u,'jinx').killChance+gain(u,.05));
   if(has(u,'ahri'))scope(u,'ahri',()=>{const c=state(u,'ahri');if(!c.fox){c.spirit=Math.min(100,c.spirit+gain(u,10));enterFox(u,c);}api.heal(bs,u,u,u.maxHp*.10,'Essence Fox');});
  }
  function badges(u){const rows=[];if(runtime(u).hypnosisTurns>0)rows.push({icon:'◉',label:'HYPNOSIS '+runtime(u).hypnosisTurns+'t',tone:'debuff'});for(const id of IDS)if(has(u,id)){const c=state(u,id),label=id==='tulen'?'BOLT MARK '+c.bolts+'/5':id==='veera'?'BHAIN '+c.bhain+'/4':id==='ahri'?(c.fox?'FOX THEFT ':'FOX SPIRIT ')+c.spirit+'/100':id==='sonic'?'CHAOS E '+c.chaos+'/7':id==='yasuo'?'FLOW WIND '+c.flow+'/2':id==='yone'&&c.soulTurns?'SOUL UNBOUND '+c.soulTurns+'t':null;if(label)rows.push({icon:'✦',label,tone:'form'});}return rows;}
  return {IDS,state,entry,prepare,attack,afterAttack,attacked,shieldHit,dodge,dodgeBonus,onDodge,immune,status,crit,speed,turnEnd,damageDealt,killed,badges};
 };
 host.createHextechSkills.version=1;
})(window);
