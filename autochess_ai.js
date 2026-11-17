/* Platinum+ policies: cached passive semantics, public scouting and legal model actions.
   Iron–Gold continue through the unchanged policies in autochess_bots.js. */
(function(host) {
 'use strict';
 const C=host.AutoChessSystem,S=host.AutoChessSynergies,A=host.AutoChessAugments,R=host.RelicSystem;
 const skill=p=>Number.isInteger(p?.aiTier)?p.aiTier:0;
 const normalize=tag=>host.CategorySystem.normalize(tag);
 const categories=card=>(card?.category||[]).map(normalize);
 const ranged=card=>(card?.category||[]).some(tag=>['Gunner','Magician','Supporter'].includes(normalize(tag)));
 const features=new Map(),contexts=new WeakMap(),pairRows=new WeakMap(),lossMemory=new WeakMap();
 const cmp=(a,b)=>a<b?-1:a>b?1:0;
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
 const clock=()=>host.performance?.now?.()||0;
 const field=p=>p.units.filter(u=>u.board!==null);
 const live=p=>p.hp>0&&p.rank===null;
 const tagTier=n=>Math.min(4,Math.floor(n/2));
 const rules=Object.freeze({maxActions:24,maxSwapTrials:8,maxCandidates:24,maxAugmentRerolls:2});

 // Parsed once per card definition. Optional future mechanic/tag metadata participates
 // without executing passives, simulating battles or maintaining an ID allowlist.
 function classify(card) {
  if(typeof card==='string')card=C.card(card);
  if(!card)return null;
  const cached=features.get(card.id);if(cached?.card===card)return cached;
  const passives=card.passives||[card.passive||{}],sections=Array.isArray(passives)?passives:[passives];
  const labels=new Set(sections.flatMap(p=>[...(Array.isArray(p.tags)?p.tags:[]),...(Array.isArray(p.archetypes)?p.archetypes:[])]).map(tag=>String(tag).toLowerCase().replace(/[- ]/g,'_')));
  const tagged=(...names)=>names.some(name=>labels.has(name));
  const text=sections.map(p=>[p.name,p.description,JSON.stringify(p.tags||[]),JSON.stringify(p.mechanics||[])].join(' ')).join(' ').toLowerCase();
  const offense=text.replace(/(?:immune|immunity) to[^.;\n]*/g,'').replace(/cannot (?:be )?(?:frozen|stunned|hypnotized|poisoned)/g,'');
  const shield=tagged('shield','shielding')||/\b(?:gain|grant|create|restore|reconstruct|starts? with|shields? all|shields? (?:the|an?|every|lowest))[^.;\n]{0,100}\bshield|\bshield (?:equal|allies|teammates)|shield\s*\/\s*sustain/.test(text);
  const heal=tagged('heal','healing','sustain')||/\bheal|regenerat|lifesteal|life steal|omnivamp|sustain/.test(text);
  const reduction=tagged('mitigation','damage_reduction')||/damage reduction|(?:reduce|less|reduced)[^.;\n]{0,60}(?:incoming|damage)|(?:incoming|damage)[^.;\n]{0,60}(?:reduced|reduction|less)|negate|invincib|mitigation/.test(text);
  const dodge=/\bdodge/.test(text),reflect=/reflect|counter.attack|counter for|thorns/.test(text);
  const reactive=(dodge&&reflect)||/when (?:this card is |getting |get )?attacked|when (?:hit|damaged)|incoming|dodge fails|failed dodge|below 50% hp|dropping below|shield is (?:broken|shattered)/.test(text);
  const freeze=/\bfreez(?:e|ing)\b|inflict[^.;\n]*frozen/.test(offense),stun=/\bstun\b/.test(offense),fear=/\bfear\b/.test(offense),hypnosis=/hypnotiz|hypnosis/.test(offense);
  const poison=/\bpoison\b/.test(offense),burn=/\bburn\b|black flame/.test(offense),bleed=/\bbleed\b/.test(offense);
  const cc=tagged('crowd_control','cc')||freeze||stun||fear||hypnosis;
  const line=tagged('line','line_piercing')||/\bpierc(?:e|es|ing)[^.;\n]{0,60}(?:next enem|enemy lineup|enemies|enemy team|enemy line)|across (?:the )?(?:enemy|enemies|line)|enemy lineup|through (?:all enemies|the enemy line|enemies)/.test(offense);
  const aoe=tagged('aoe','multi_target')||/all (?:living |other |active )?enem|blast[^.;\n]*(?:two|three|[2-9]) enem|(?:hit|strike|damage)[^.;\n]*(?:multiple|nearby|adjacent) enem/.test(offense);
  const offTurn=tagged('off_turn','off_turn_striker')||/off.turn|not (?:the one )?(?:currently )?(?:taking|attacking)|not taking its own|another.*attack action/.test(text);
  const follow=R.hasFollowUp(card)||/follow.up|chain[^.;\n]*attack/.test(offense);
  const sacrifice=tagged('sacrifice','single_ally_buffer')||(/(?:start|entry|enter)[^.;\n]{0,100}die(?:s)? permanently|\bsacrifice\b/.test(text)&&/grant|buff|empower/.test(text));
  const randomBuff=sacrifice&&/random[^.;\n]*(?:ally|teammate)/.test(text);
  const scaling=tagged('hypercarry','scaling','stacker')||(/extend/.test(text)&&/domain|dodge|form|mode|duration/.test(text))||/stack|(?:each|every)[^.;\n]{0,100}(?:gain|grant)[^.;\n]{0,60}(?:atk|critical|crit|dodge)|(?:kill|defeat)[^.;\n]{0,60}(?:steal|cop|gain)|extend[^.;\n]*domain|scal(?:ing|es)/.test(text);
  const adaptive=/cop(?:y|ies|ied)[^.;\n]*passive|steal[^.;\n]*passive/.test(text);
  const burst=/(?:\b[2-9](?:\.\d+)?x|\bx[2-9](?:\.\d+)?|[2-9]00%)[^.;\n]{0,35}(?:damage|atk)|critical hit|crit damage/.test(offense);
  const shieldBreak=tagged('shield_break','anti_shield')||/(?:break|destroy|shatter|ignore|pierc)[^.;\n]{0,45}shield/.test(offense);
  const frozenPayoff=/frozen (?:enemy|enemies|target)|(?:against|attacking|attack)[^.;\n]{0,40}frozen/.test(text);
  const dotAmp=/(?:dot|status effects|bleed|burn)[^.;\n]{0,50}(?:extra damage|bonus|1\.25|amplif)|all[^.;\n]*dot/.test(text);
  const summon=/summon|creates?[^.;\n]*clone|clones? (?:of|every|have)/.test(text)&&!sacrifice;
  const cloneAmp=/(?:teammate|ally|allied)[^.;\n]{0,50}creates? a clone|buff that clone/.test(text);
  const externalBlocked=/cannot be healed or buffed|cannot (?:receive|gain)[^.;\n]*(?:external|ally|allied)/.test(text);
  const isolation=/isolat[^.;\n]*(?:1v1|duel)|1v1[^.;\n]*isolat/.test(text);
  const lead=/first card to enter|lead slot|starting in slot 1|starts? in slot 1/.test(text);
  const hpWeight=clamp((card.stats?.hp||1)/((card.stats?.hp||1)+(card.stats?.atk||1)*5));
  const tank=hpWeight*1.8+(shield?1.4:0)+(reduction?1.8:0)+(reactive?1.1:0)+(reflect?.7:0)+(cc&&reactive?1:0)-(offTurn?2:0)-(sacrifice?5:0);
  const carry=(scaling?1.5:0)+(adaptive?1:0)+(burst?1.6:0)+(follow?.8:0)+(line||aoe?.7:0)+(offTurn?.6:0);
  const counterCategories=[];
  const counterClauses=text.split(/[.;\n]/).filter(clause=>/(?:enemy|enemies|attacked by|attacks? by)/.test(clause)&&/(?:less damage|damage reduction|reduce|counter|reflect)/.test(clause));
  if(reduction||reflect)for(const tag of host.CategorySystem.TYPES)if(counterClauses.some(clause=>new RegExp('\\b'+tag+'\\b','i').test(clause)))counterCategories.push(tag);
  const dodgeRolls=[...text.matchAll(/(\d+(?:\.\d+)?)%\s+(?:base\s+)?(?:chance to\s+)?dodge/g)].map(m=>Number(m[1])/100);
  const m={card,id:card.id,tier:Math.max(0,C.RARITIES.indexOf(card.rarity)),tags:[...new Set([card.element,...categories(card)])],shield,heal,reduction,dodge,reflect,reactive,freeze,stun,fear,hypnosis,poison,burn,bleed,cc,line,aoe,offTurn,follow,sacrifice,randomBuff,scaling,adaptive,burst,shieldBreak,frozenPayoff,dotAmp,summon,cloneAmp,externalBlocked,isolation,lead,hpWeight,tank,carry,counterCategories,baseDodge:Math.max(0,...dodgeRolls),ranged:ranged(card)};
  m.quality=2+m.tier*2.4+(follow?1.2:0)+(aoe||line?.8:0)+(scaling||adaptive?.7:0)+(cc?.6:0)+(reduction?.5:0);
  Object.freeze(m.tags);Object.freeze(m.counterCategories);Object.freeze(m);features.set(card.id,m);return m;
 }
 for(const card of C.pools.flat())classify(card);

 // Symmetric functional combinations; category overlap is scored separately.
 function combo(a,b) {
  if(!a||!b||a.id===b.id)return 0;
  let row=pairRows.get(a);if(!row){row=new WeakMap();pairRows.set(a,row);}if(row.has(b))return row.get(b);
  const enable=m=>m.shield||m.reduction||m.heal&&m.tank>2.5;
  let q=0;
  if(a.carry>1.2&&enable(b)&&!a.externalBlocked)q+=2;
  if(b.carry>1.2&&enable(a)&&!b.externalBlocked)q+=2;
  if(a.cc&&b.cc)q+=1.2;
  if(a.freeze&&b.frozenPayoff||b.freeze&&a.frozenPayoff)q+=2.8;
  if((a.burn||a.bleed||a.poison)&&b.dotAmp||(b.burn||b.bleed||b.poison)&&a.dotAmp)q+=2;
  if(a.summon&&b.cloneAmp||b.summon&&a.cloneAmp)q+=2.4;
  if(a.cc&&(b.line||b.aoe)||b.cc&&(a.line||a.aoe))q+=.7;
  if(a.offTurn&&b.tank>2.5||b.offTurn&&a.tank>2.5)q+=1.8;
  if(a.sacrifice&&b.carry>1.4||b.sacrifice&&a.carry>1.4)q+=2.2;
  if(a.sacrifice&&b.sacrifice)q-=5;
  if(a.isolation&&b.shield||b.isolation&&a.shield)q-=.5;
  q=Math.min(5,q);row.set(b,q);return q;
 }
 function quality(card){return classify(card)?.quality||0;}
 function priority(u){const m=classify(C.card(u));return m.quality+m.carry*1.7+(u.fusionDepth||0)*.55+(u.relic?.roll?.atk||0)*8-(m.sacrifice?8:0);}
 function tankValue(u){const m=classify(C.card(u));return m.quality*.35+m.tank*2+(u.fusionDepth||0)*.35+(u.relic?.roll?.hp||0)*8;}
 function anchors(units){
  let carry=null,fallback=null,tank=null,best=-Infinity,any=-Infinity,guard=-Infinity;
  for(const u of units){const m=classify(C.card(u));if(m.sacrifice)continue;const q=priority(u),t=tankValue(u);
   if(q>any||q===any&&cmp(u.uid,fallback?.uid)<0){fallback=u;any=q;}
   if(m.carry>1.2&&(q>best||q===best&&cmp(u.uid,carry?.uid)<0)){carry=u;best=q;}
   if(t>guard||t===guard&&cmp(u.uid,tank?.uid)<0){tank=u;guard=t;}
  }return{carry:carry||fallback,tank};
 }


 function cores(p,commit=false) {
  if(p.coreTraits?.length>=2&&!commit)return p.coreTraits;
  const counts=new Map(),seen=new Set(),deployed=field(p),rows=[...deployed,...p.units.filter(u=>u.board===null)];
  for(const u of rows){const m=classify(C.card(u));if(!m||seen.has(m.id))continue;seen.add(m.id);for(const tag of m.tags)counts.set(tag,(counts.get(tag)||0)+(u.board!==null?1.4:.7));}
  const preferred=normalize(host.AutoChessBots.profile(p)?.trait||'Human'),previous=p.coreTraits||[],rank=[...counts].map(([id,n])=>({id,n,value:n+(id===preferred?1.1:0)+(previous.includes(id)?.7:0)})).sort((a,b)=>b.value-a.value||cmp(a.id,b.id));
  const cats=rank.filter(r=>S.definition(r.id)?.type==='category'),elements=rank.filter(r=>S.definition(r.id)?.type==='element'),chosen=[];
  if(cats[0])chosen.push(cats[0].id);if(elements[0]?.n>=1.4)chosen.push(elements[0].id);
  for(const r of cats)if(chosen.length<3&&!chosen.includes(r.id))chosen.push(r.id);
  if(!chosen.length)chosen.push(preferred);
  if(commit&&p.units.length>=3){if(skill(p)<7&&previous.length>=2)return previous;p.coreTraits=chosen;}
  return chosen;
 }
 function summarize(units,p) {
  const counts=Object.create(null),seen=new Set(),metas=[],totals={cc:0,sustain:0,carry:0,tank:0,sacrifice:0,follow:0,spell:0};
  for(const u of units){const m=classify(C.card(u));if(!m)continue;metas.push(m);if(m.cc)totals.cc++;if(m.shield||m.heal||m.reduction)totals.sustain++;if(m.carry>1.2)totals.carry++;if(m.tank>2.5)totals.tank++;if(m.sacrifice)totals.sacrifice++;if(m.follow)totals.follow++;if(m.ranged)totals.spell++;
   if(!seen.has(m.id)){seen.add(m.id);for(const tag of m.tags)counts[tag]=(counts[tag]||0)+1;}
  }
  return{units,metas,counts,seen,totals,crests:A.traits(p),desired:cores(p)};
 }
 function threateningPlayer(s,p) {
  // Same HP / seat ordering as the visible standings. Never read the next pairing.
  let leader=null;for(const q of s.players)if(q!==p&&live(q)&&(!leader||q.hp>leader.hp))leader=q;
  return leader;
 }
 function scout(s,p) {
  let memory=lossMemory.get(p);if(!memory||memory.matchId!==s.id){memory={matchId:s.id,signature:'',lastVictor:null,recent:[]};lossMemory.set(p,memory);}
  const signature=[p.history?.join(','),p.lossStreak,p.winStreak].join('/');
  if(signature!==memory.signature){memory.signature=signature;if(p.lossStreak>0&&p.history?.length){memory.lastVictor=p.history.at(-1);memory.recent=[memory.lastVictor,...memory.recent.filter(id=>id!==memory.lastVictor)].slice(0,3);}}
  const leader=threateningPlayer(s,p),last=s.players.find(q=>q.id===memory.lastVictor&&q!==p&&live(q));
  const rivals=[...new Set([last,leader].filter(Boolean))],rows=[],columns=Array(7).fill(0),tags=Object.create(null),elements=Object.create(null);
  let line=0,aoe=0,burst=0,shield=0,heal=0,swarm=0,units=0,carry=null,carryPower=-1,leaderPower=0;
  for(const q of rivals){const weight=q===last?1.25:1,board=field(q),augments=A.effects(q);rows.push(q.id+':augments:'+q.augments.join(','));if(augments.startShield)shield+=weight;if(augments.regenWave||augments.vamp)heal+=weight;units=Math.max(units,board.length);
   for(const u of board){const m=classify(C.card(u)),power=(priority(u)+(m.line?3:0))*weight,col=6-u.board%7;
    if(q===leader)leaderPower+=m.quality;
    rows.push(q.id+':'+u.uid+':'+u.cardId+':'+u.board+':'+(u.relic?.uid||''));
    if(m.line){line+=weight;columns[col]+=power;}if(m.aoe)aoe+=weight;if(m.burst||m.carry>2||(u.relic?.roll?.critChance||0)>.1||(u.relic?.roll?.firstAttackBonus||0)>.3)burst+=weight;if(m.shield)shield+=weight;if(m.heal)heal+=weight;if(m.summon)swarm+=weight;
    for(const tag of categories(m.card))tags[tag]=(tags[tag]||0)+weight;elements[m.card.element]=(elements[m.card.element]||0)+weight;
    if(power>carryPower){carryPower=power;carry={uid:u.uid,cardId:u.cardId,column:col,owner:q.id,meta:m};}
   }
  }
  const ownPower=field(p).reduce((sum,u)=>sum+classify(C.card(u)).quality,0);
  const dominant=!!leader&&(leader.hp-p.hp>=20||(leader.winStreak||0)>=3||leaderPower>Math.max(1,ownPower)*1.35);
  return{leader:leader?.id||null,lastVictor:last?.id||null,recentLosses:memory.recent.slice(),rivals:rivals.map(q=>q.id),columns,line,aoe,burst,shield,heal,swarm,units,carry,tags,elements,dominant,pressure:dominant||p.lossStreak>=2,key:[leader?.id,last?.id,p.hp,p.lossStreak,leader?.hp,leader?.winStreak,...rows].join('|')};
 }
 function context(s,p) {
  let m=contexts.get(p);const key=C.label(s)+'/'+s.phase;
  if(!m||m.key!==key||m.state!==s){m={key,state:s,scout:null,arranged:'',equipped:'',thinkingMs:0,actions:0,swaps:0};contexts.set(p,m);}
  if(skill(p)>=7)m.scout=scout(s,p);
  return m;
 }
 function counterValue(m,threat) {
  if(!threat)return 0;let q=0;
  if(threat.pressure&&m.cc)q+=3.2;
  if(threat.shield&&m.shieldBreak)q+=Math.min(3,threat.shield*1.3);
  if(threat.heal&&m.bleed)q+=1.5;
  if(threat.swarm&&m.aoe)q+=1.5;
  if(threat.burst&&(m.reduction||m.dodge||m.shield))q+=1;
  for(const tag of m.counterCategories)if(threat.tags[tag])q+=Math.min(4,threat.tags[tag]*1.4);
  if(threat.carry){const factor=host.ElementSystem.multiplier(m.card,threat.carry.meta.card);if(factor>1)q+=1.8;else if(factor<1)q-=.7;}
  return Math.min(7,q);
 }
 function marginal(p,u,summary,threat=null) {
  const card=C.card(u),m=classify(card);if(!m)return-Infinity;
  const high=skill(p)>=7;let q=m.quality+(u.fusionDepth||0)*.55;
  const duplicate=summary.seen.has(m.id);
  if(duplicate)q-=high?3:1.5;
  for(const tag of m.tags){const n=(summary.counts[tag]||0)+(summary.crests[tag]||0),core=summary.desired.includes(tag);
   if(core)q+=(high?2.2:1.8)+(!duplicate&&n%2===1?(high?3.6:2.8):0);
   else if(!duplicate&&n%2===1)q+=.5;
  }
  let pair=0;for(const other of summary.metas)pair+=combo(m,other);q+=Math.min(7,pair*.8);
  if(!summary.totals.tank&&m.tank>2.5)q+=3;
  if(!summary.totals.carry&&m.carry>1.4)q+=1.4;
  if(m.randomBuff){const carries=summary.metas.filter(c=>c.carry>1.4),weak=summary.metas.filter(c=>c.carry<1&&c.tank<2.5).length;q+=carries.length?1.2-Math.max(0,weak-1)*1.6:-3;}
  q+=counterValue(m,threat);
  return q;
 }
 function score(p,id,prepared=null) {
  const c=C.card(id);if(!c)return-Infinity;
  const summary=prepared||summarize(field(p),p),ctx=contexts.get(p),threat=skill(p)>=7?ctx?.scout:null;
  let q=marginal(p,{cardId:id},summary,threat);
  const tier=C.RARITIES.indexOf(c.rarity),spares=p.units.filter(u=>u.board===null&&C.tier(u)===tier&&!u.keep&&!p.anvil.includes(u.uid));
  // Fusion needs three cards of one rarity, not three identical characters.
  if(tier<5&&spares.length%3===2)q+=2;
  if(threat&&p.units.some(u=>u.cardId===id)){
   let held=0;for(const rival of ctx.state.players)if(rival!==p)for(const u of rival.units)if(u.cardId===id)held++;
   q-=Math.min(2.5,held*.4); // Public congestion preference; never edits shop supply/odds.
  }
  return q;
 }
 function objective(p,units,threat=contexts.get(p)?.scout) {
  const sum=summarize(units,p);let q=0;
  for(let i=0;i<units.length;i++){
   const m=sum.metas[i];q+=m.quality+(units[i].fusionDepth||0)*.55+counterValue(m,skill(p)>=7?threat:null);
   for(let j=0;j<i;j++)q+=combo(m,sum.metas[j])*.65;
  }
  for(const [tag,n]of Object.entries(sum.counts)){const tier=tagTier(n+(sum.crests[tag]||0));q+=sum.desired.includes(tag)?tier*tier*(skill(p)>=7?2:1.35):tier*.5;}
  q+=sum.totals.tank?3:-3;if(sum.totals.carry)q+=2;
  return q;
 }
 function rosterKey(p){return[p.level,p.coreTraits?.join(','),p.augments.join(','),p.anvil.join(','),...p.units.map(u=>u.uid+':'+u.cardId+':'+(u.fusionDepth||0)+':'+Number(u.keep))].join('|');}
 function layoutKey(p){return p.units.map(u=>u.uid+':'+u.board+':'+u.bench).join('|');}
 const equipmentKey=p=>p.units.map(u=>u.uid+':'+(u.relic?.uid||'')).join(',')+'/'+p.relics.filter(Boolean).map(r=>r.uid).join(',');
 function decisionKey(p,ctx){return[p.gold,p.xp,p.level,p.econ?.freeRefresh||0,p.shop.join(','),rosterKey(p),layoutKey(p),equipmentKey(p),ctx.scout?.key||''].join('/');}
 function trimFunnel(p,selected) {
  if(selected.length<4||!selected.some(u=>classify(C.card(u)).randomBuff))return;
  const {carry,tank}=anchors(selected);if(!carry)return;
  const before=summarize(selected,p),weak=selected.filter(u=>u!==carry&&u!==tank&&!classify(C.card(u)).sacrifice&&!classify(C.card(u)).cc&&classify(C.card(u)).tank<2.5).sort((a,b)=>priority(a)-priority(b)||cmp(a.uid,b.uid))[0];
  if(!weak||priority(weak)>=priority(carry)*.55)return;
  const after=summarize(selected.filter(u=>u!==weak),p);
  if(Object.keys(before.counts).some(tag=>tagTier(before.counts[tag]+(before.crests[tag]||0))>tagTier((after.counts[tag]||0)+(after.crests[tag]||0))))return;
  selected.splice(selected.indexOf(weak),1);
 }
 function formation(p,selected,threat) {
  const used=new Set(),high=skill(p)>=7,{carry,tank}=anchors(selected),spread=high&&!!(threat?.line||threat?.aoe);
  const place=(u,cell)=>{u.board=cell;u.bench=null;u.reserve=false;used.add(cell);};
  const front=selected.filter(u=>classify(C.card(u)).tank>2.5&&!classify(C.card(u)).offTurn).sort((a,b)=>tankValue(b)-tankValue(a)||cmp(a.uid,b.uid));
  const decoy=front[0]||tank;
  if(high&&threat?.carry&&decoy&&decoy!==carry)place(decoy,threat.carry.column);

  // Track placed units separately: their previous board tiles may coincide with a
  // newly chosen tile, so old roster positions must never imply placement.
  const placed=new Set(high&&threat?.carry&&decoy&&decoy!==carry?[decoy]:[]);
  const rest=selected.filter(u=>!placed.has(u)).sort((a,b)=>Number(b===carry)-Number(a===carry)||tankValue(b)-tankValue(a)||cmp(a.uid,b.uid));
  for(const u of rest){const m=classify(C.card(u)),isTank=m.tank>2.5&&!m.offTurn,isCarry=u===carry,protect=!isTank&&(m.carry>0||m.offTurn||m.ranged),lead=m.lead&&!m.isolation;
   let best=null,value=-Infinity;
   for(let cell=0;cell<28;cell++){if(used.has(cell))continue;const x=cell%7,y=Math.floor(cell/7);
    let v=isTank?10-y*4:protect?y*3:3-Math.abs(1-y)*2;
    if(m.sacrifice)v=y*2;
    if(lead)v-=cell*.8;if(m.isolation)v+=y;
    if(high&&threat){if(protect)v-=(threat.columns[x]||0)*.18;if(isCarry&&threat.carry)v+=Math.abs(x-threat.carry.column)*.7;}
    if(spread){for(const cell2 of used){const d=Math.max(Math.abs(x-cell2%7),Math.abs(y-Math.floor(cell2/7)));if(d<2)v-=4-d*1.2;}v+=(x===0||x===6)?.4:0;}
    else v-=Math.abs(3-x)*.15;
    // Keep a non-tank melee carry behind, rather than ahead of, its protector.
    if(protect&&!m.ranged&&tank&&u!==tank&&y===0)v-=3;
    if(v>value){value=v;best=cell;}
   }
   if(best!==null){place(u,best);placed.add(u);}
  }
  let bench=0;for(const u of p.units)if(!placed.has(u)){u.board=null;u.bench=bench<9?bench++:null;u.reserve=u.bench===null;}
  C.drain(p);
 }
 function arrange(s,p,preparedContext=null) {
  if(skill(p)<4)return host.AutoChessBots.arrange(s,p);
  const ctx=preparedContext||context(s,p),key=rosterKey(p)+'/'+(ctx.scout?.key||'');if(ctx.arranged===key&&ctx.layout===layoutKey(p))return;
  const ban=new Set(p.anvil),all=p.units.filter(u=>!ban.has(u.uid));
  // Bound work even for a full draft reserve. Keep protected units and the best
  // 24 candidates; no units are discarded or removed from the player's roster.
  const candidates=all.length>rules.maxCandidates?all.slice().sort((a,b)=>Number(b.keep)-Number(a.keep)||priority(b)-priority(a)||cmp(a.uid,b.uid)).slice(0,rules.maxCandidates):all.slice();
  const selected=[];
  while(selected.length<p.level&&candidates.length){const sum=summarize(selected,p);let index=0,best=-Infinity;for(let i=0;i<candidates.length;i++){const q=marginal(p,candidates[i],sum,ctx.scout);if(q>best){best=q;index=i;}}selected.push(candidates.splice(index,1)[0]);}
  if(skill(p)>=7&&candidates.length&&ctx.swaps<rules.maxSwapTrials){const weak=selected.map((u,i)=>({u,i,q:priority(u)})).sort((a,b)=>a.q-b.q||a.i-b.i).slice(0,2),incoming=candidates.slice().sort((a,b)=>priority(b)-priority(a)||cmp(a.uid,b.uid)).slice(0,4);let best=objective(p,selected),swap=null;
   for(const slot of weak)for(const u of incoming){if(ctx.swaps>=rules.maxSwapTrials)break;const trial=selected.slice();trial[slot.i]=u;const q=objective(p,trial);ctx.swaps++;if(q>best+.05){best=q;swap={i:slot.i,u};}}
   if(swap)selected[swap.i]=swap.u;
  }
  trimFunnel(p,selected);formation(p,selected,ctx.scout);ctx.arranged=rosterKey(p)+'/'+(ctx.scout?.key||'');ctx.layout=layoutKey(p);
 }

 function legacyRelicValue(relic,u,p){
  const r=relic.roll,c=C.card(u),matching=R.matchingUnit({card:c,relic:r},r),tank=!ranged(c)&&c.stats.hp/c.stats.atk>=7,carry=!c.category.includes('Supporter')||R.hasFollowUp(c);let value=matching?((r.atk||0)*(carry?135:80)+(r.hp||0)*(tank?130:65)+(r.followChance||0)*(R.hasFollowUp(c)?190:0)):0;
  if(r.unique){if(r.kind==='jackal_guns')value+=(r.perEnemyAtk||0)*Math.min(9,p.level||1)*(carry?120:65);if(r.kind==='god_leaf')value+=r.dodge*(tank?155:100);if(r.kind==='nail')value+=(r.critChance*150+r.critDamage*60)*(carry?1.3:.75);if(r.kind==='eternal_eye'&&/burn|black flame/i.test(c.passive?.description||''))value+=22;if(r.kind==='enten_blade')value+=(r.specialBonus||0)*(c.category.includes('Magician')?150:80);if(r.kind==='odm'&&R.hasFollowUp(c))value+=(r.odmChainBonus||0)*260;if(r.kind==='bomb'&&matching)value+=(r.firstAttackBonus||0)*(carry?14:8);if(r.kind==='potara_earring'&&['goku-ssj3','vegeta-ssj2'].includes(c.id)&&['goku-ssj3','vegeta-ssj2'].every(id=>C.deployed(p).some(v=>v.cardId===id)))value+=45;}
  return value;
 }
 function relicValue(relic,u,p) {
  if(skill(p)<4)return legacyRelicValue(relic,u,p);
  if(!relic?.roll)return 0;const r=relic.roll,c=C.card(u);if(!c)return 0;
  const m=classify(c),matching=R.matchingUnit({card:c,relic:r},r),high=skill(p)>=7,threat=high?contexts.get(p)?.scout:null,tank=m.tank>2.5,carry=m.carry>1.2;
  let value=matching?((r.atk||0)*(carry?145:75)+(r.hp||0)*(tank?145:65)+(r.followChance||0)*(m.follow?200:0)):0;
  if(r.unique){
   if(r.kind==='jackal_guns')value+=(r.perEnemyAtk||0)*Math.min(14,Math.max(1,threat?.units||p.level||1)+Math.min(5,(threat?.swarm||0)*2))*(carry?125:60);
   if(r.kind==='god_leaf'&&m.baseDodge<=.80)value+=Math.min(r.dodge,.80-m.baseDodge)*(tank?160:110)*(threat?.burst?1.7:1);
   if(r.kind==='nail')value+=(r.critChance*150+r.critDamage*60)*(carry?1.35:.75);
   if(r.kind==='eternal_eye'&&m.burn)value+=22;
   if(r.kind==='enten_blade')value+=(r.specialBonus||0)*((m.line||m.aoe||m.ranged)?155:80);
   if(r.kind==='odm'&&m.follow)value+=(r.odmChainBonus||0)*260;
   if(r.kind==='bomb'&&matching)value+=(r.firstAttackBonus||0)*(carry?16:8);
   if(r.kind==='potara_earring'&&['goku-ssj3','vegeta-ssj2'].includes(c.id)&&['goku-ssj3','vegeta-ssj2'].every(id=>field(p).some(v=>v.cardId===id)))value+=45;
  }
  if(threat?.burst&&matching)value+=(r.hp||0)*(tank?110:45);
  if(threat?.pressure&&carry&&matching)value+=(r.atk||0)*25;
  // No synthetic Armor/MR/AP affixes: only the actual rolled Relic fields score.
  return value;
 }
 // Rectangular Hungarian assignment with dummy slots for no Relic.
 function assignment(values) {
  const n=values.length;if(!n)return[];const m=values[0].length,u=Array(n+1).fill(0),v=Array(m+1).fill(0),p=Array(m+1).fill(0),way=Array(m+1).fill(0);
  for(let i=1;i<=n;i++){p[0]=i;let j0=0;const min=Array(m+1).fill(Infinity),used=Array(m+1).fill(false);do{used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=m;j++)if(!used[j]){const cur=-values[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0;}if(min[j]<delta){delta=min[j];j1=j;}}for(let j=0;j<=m;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else min[j]-=delta;j0=j1;}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);}
  const result=Array(n).fill(-1);for(let j=1;j<=m;j++)if(p[j])result[p[j]-1]=j-1;return result;
 }
 function equip(s,p,preparedContext=null) {
  if(skill(p)<7)return host.AutoChessBots.legacyEquip(s,p);
  const ctx=preparedContext||context(s,p);let key=rosterKey(p)+'/'+layoutKey(p)+'/'+(ctx.scout?.key||'')+'/'+equipmentKey(p);if(ctx.equipped===key)return;
  for(let guard=0;guard<12;guard++){const rows=p.relics.filter(r=>r&&!r.roll.unique),first=rows.find(r=>rows.some(other=>other!==r&&other.roll.rarity===r.roll.rarity));if(!first)break;const other=rows.find(r=>r!==first&&r.roll.rarity===first.roll.rarity);C.fuseRelics(s,p,first.uid,other.uid);}
  const board=field(p),all=[...p.relics.filter(Boolean),...p.units.map(u=>u.relic).filter(Boolean)],seen=new Set();
  const candidates=all.filter(r=>!seen.has(r.uid)&&seen.add(r.uid)).sort((a,b)=>cmp(a.uid,b.uid));
  const values=board.map(u=>[...candidates.map(r=>relicValue(r,u,p)),...Array(board.length).fill(0)]),selected=assignment(values),used=new Set();
  for(const u of p.units)u.relic=null;
  board.forEach((u,i)=>{const index=selected[i];if(index>=0&&index<candidates.length&&values[i][index]>0){u.relic=candidates[index];used.add(candidates[index].uid);}});
  const remaining=candidates.filter(r=>!used.has(r.uid));p.relics=Array.from({length:10},(_,i)=>remaining[i]||null);p.loot.unshift(...remaining.slice(10));C.drain(p);
  ctx.equipped=rosterKey(p)+'/'+layoutKey(p)+'/'+(ctx.scout?.key||'')+'/'+equipmentKey(p);
 }
 function tryFusion(s,p,ctx) {
  const key=rosterKey(p)+'/'+field(p).map(u=>u.uid).join(',');if(ctx?.noFusion===key)return false;
  const board=field(p),{carry,tank}=anchors(board),ban=new Set(p.anvil),bench=p.units.filter(u=>u.board===null&&!u.keep&&!ban.has(u.uid));
  const eligible=board.filter(u=>u!==carry&&u!==tank&&!u.keep&&!ban.has(u.uid)),plans=[];
  for(let tier=0;tier<5;tier++){
   const rows=bench.filter(u=>C.tier(u)===tier).sort((a,b)=>priority(a)-priority(b)||cmp(a.uid,b.uid));
   let materials=rows.slice(0,3),deployed=null;
   if(materials.length===2&&C.freeBench(p)>=0){deployed=eligible.filter(u=>C.tier(u)===tier).sort((a,b)=>priority(a)-priority(b)||cmp(a.uid,b.uid))[0];if(deployed)materials.push(deployed);}
   if(materials.length!==3)continue;
   // Prefer a coherent role/element seed and continued fusion depth, but leave
   // the next-card roll and Supporter weighting entirely to C.fuse().
   const ref=classify(C.card(carry||materials[0]));
   const aligned=rows.filter(u=>classify(C.card(u)).tags.some(t=>ref.tags.includes(t)));
   if(aligned.length>=3)materials=aligned.slice(0,3);
   const depth=Math.max(...materials.map(u=>u.fusionDepth||0)),best=Math.max(...materials.map(priority)),expected=2+(tier+1)*2.4+1.5;
   if(deployed&&expected<priority(deployed)+1)continue;
   plans.push({materials,deployed,score:expected+(depth*.8)+(aligned.length>=3?1:0)-(deployed?best*.5:0)});
  }
  plans.sort((a,b)=>b.score-a.score||cmp(a.materials[0].uid,b.materials[0].uid));const plan=plans[0];if(!plan){if(ctx)ctx.noFusion=key;return false;}
  if(plan.deployed)C.move(p,plan.deployed.uid,'bench',C.freeBench(p));
  C.fuse(s,p,plan.materials.map(u=>u.uid));return true;
 }
 function reserveFloor(s,p,threat) {
  if(s.stage===1||p.hp<=30)return 0;
  if(skill(p)<7)return Math.min(30,Math.max(20,host.AutoChessBots.profile(p).save));
  if(threat?.pressure||p.lossStreak>=2)return 30;
  return p.hp>=70&&s.stage>=3?50:p.hp>=50&&s.stage>=3?40:30;
 }
 function plan(s,p,budget=3) {
  if(skill(p)<4)return host.AutoChessBots.plan(s,p,budget);
  if(!p.bot||p.hp<=0||s.phase!=='planning'||host.AutoChessOnline?.replay(p))return false;
  const ctx=context(s,p),key=C.label(s),high=skill(p)>=7;if(ctx.waitKey===decisionKey(p,ctx))return p.botActions<rules.maxActions;
  const started=clock(),beforeActions=ctx.actions;
  try{
   if(p.botRound!==key){p.botRound=key;p.botActions=0;p.botRerolls=0;p.botXp=0;cores(p,true);}
   C.economyRound(s,p);if(!ctx.initialized){arrange(s,p,ctx);ctx.initialized=true;ctx.nextArrange=6;}
   const profile=host.AutoChessBots.profile(p),target=Math.min(9,Math.max(3,s.stage+(high?4:3))),limit=Math.min(rules.maxActions,Math.max(0,budget));
   for(let step=0;step<limit&&p.botActions<rules.maxActions;step++,p.botActions++){
    const threat=ctx.scout,floor=reserveFloor(s,p,threat),desperate=p.hp<=30,board=field(p),filled=board.length>=p.level||board.some(u=>classify(C.card(u)).sacrifice)&&board.length>=p.level-1;
    if(tryFusion(s,p,ctx)){ctx.actions++;continue;}
    const sum=summarize(board,p),offers=p.shop.map((id,index)=>({id,index,cost:id?C.price({cardId:id}):Infinity,q:id?score(p,id,sum):-Infinity})).filter(o=>o.id&&o.cost<=p.gold&&p.gold-o.cost>=floor).sort((a,b)=>b.q-a.q||a.index-b.index);
    const weak=board.length?Math.min(...board.map(u=>marginal(p,u,sum,threat))):0,tech=high&&threat?.pressure;
    if(offers.length&&C.freeBench(p)>=0&&(!filled||offers[0].q>=weak+1||p.units.filter(u=>u.board===null&&C.tier(u)===C.tier({cardId:offers[0].id})).length%3===2)){
     C.buy(s,p,offers[0].index);ctx.actions++;continue;
    }
    if(p.level<target&&p.units.length>p.level&&p.gold-C.xpCost(p)>=floor&&p.botXp<(desperate?1:high?4:3)){
     C.apply(s,p.id,{type:'xp'});p.botXp++;ctx.actions++;continue;
    }
    if(C.freeBench(p)<0&&offers[0]){
     const bench=p.units.filter(u=>u.board===null&&!u.keep&&!p.anvil.includes(u.uid)).sort((a,b)=>score(p,a.cardId)-score(p,b.cardId)||cmp(a.uid,b.uid));
     if(bench[0]&&offers[0].q>score(p,bench[0].cardId)+2){C.sell(p,bench[0].uid);ctx.actions++;continue;}
    }
    const free=p.econ.freeRefresh>0,rerolls=desperate?rules.maxActions:profile.rerolls+(high?2:1)+(tech?2:0);
    if((filled||desperate)&&(free||p.botRerolls<rerolls)&&(free||p.gold-2>=floor)&&(desperate||tech||p.gold>=floor+5)){
     C.apply(s,p.id,{type:'refresh'});if(!free)p.botRerolls++;ctx.actions++;continue;
    }
    break;
   }
   if(p.botActions>=ctx.nextArrange||budget>=rules.maxActions||ctx.actions===beforeActions){arrange(s,p,ctx);if(high)equip(s,p,ctx);else host.AutoChessBots.legacyEquip(s,p);ctx.nextArrange=p.botActions+6;}
   ctx.waitKey=p.botActions>=rules.maxActions||ctx.actions===beforeActions?decisionKey(p,ctx):null;
   return p.botActions<rules.maxActions;
  }finally{ctx.thinkingMs+=Math.max(0,clock()-started);}
 }
 function augmentChoice(s,p,armory) {
  if(skill(p)<4)return null;
  const ctx=context(s,p),summary=summarize(field(p),p),high=skill(p)>=7,threat=ctx.scout,low=p.hp<=30,pressure=low||threat?.pressure,healthy=p.hp>=70&&!pressure;
  const value=id=>{const d=A.get(id);if(!d)return-Infinity;const e=d.effects;
   let q=(e.atk||0)*(summary.totals.carry?90:65)+(e.hp||0)*45+(e.speed||0)*(summary.totals.follow||summary.totals.carry?95:65)+(e.vamp||0)*90+(e.reduction||0)*120+(e.crit||0)*(summary.totals.carry?75:45)+(e.startShield||0)*45+(e.regenWave||0)*180+(e.killHeal||0)*65+(e.forge?.count||0)*(e.forge?.rarity==='legendary'?9:5);
   if(pressure)q+=(e.hp||0)*55+(e.reduction||0)*85+(e.atk||0)*35+(e.startShield||0)*60;
   if(summary.totals.carry&&summary.totals.sustain)q+=(e.speed||0)*20;
   if(e.crest){const tag=normalize(e.crest),n=summary.counts[tag]||0,delta=tagTier(n+(summary.crests[tag]||0)+(e.crestCount||0))-tagTier(n+(summary.crests[tag]||0));q+=(n?delta*(high?13:9):0)+(summary.desired.includes(tag)?5:0);}
   const economy=healthy?1.2:pressure?.25:.7;
   if(e.gold)q+=Math.min(e.gold,Math.max(0,C.RULES.maxBonusGoldPerRound-(p.econ?.bonus||0)))*economy;
   if(e.freeRefresh)q+=(p.econ?.freeRefresh?1:6)*economy;
   if(e.xpCost&&p.level<9)q+=(9-p.level)*1.5*economy;
   return q;
  };
  if(high){const original=armory.options.map((id,i)=>({i,q:value(id)})).sort((a,b)=>a.q-b.q||a.i-b.i),best=original.at(-1)?.q||0;let rerolled=0;
   for(const slot of original){if(rerolled>=rules.maxAugmentRerolls||slot.q>=Math.max(12,best*.75)||armory.rerolled[slot.i])continue;A.reroll(s,p,slot.i);rerolled++;}
  }
  return armory.options.map((id,index)=>({index,q:value(id)})).sort((a,b)=>b.q-a.q||a.index-b.index)[0]?.index??null;
 }
 function diagnostics(p){const ctx=contexts.get(p);return{tier:skill(p),planningKey:ctx?.key||null,thinkingMs:ctx?.thinkingMs||0,actions:ctx?.actions||0,swapTrials:ctx?.swaps||0,leader:ctx?.scout?.leader||null,lastVictor:ctx?.scout?.lastVictor||null,recentLosses:ctx?.scout?.recentLosses?.slice()||[],threats:ctx?.scout?{line:ctx.scout.line,aoe:ctx.scout.aoe,burst:ctx.scout.burst,swarm:ctx.scout.swarm,pressure:ctx.scout.pressure,carryColumn:ctx.scout.carry?.column??null}:null};}
 host.AutoChessAI=Object.freeze({skill,classify,combo,quality,cores,score,objective,arrange,relicValue,assignment,equip,plan,augmentChoice,reserveFloor,diagnostics,rules});
})(window);
