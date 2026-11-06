/* Unique Relic instances live in item metadata; costs and bindings are atomic. */
(function(host){
 'use strict';
 const ELEMENTS=['Fire','Water','Nature','Electric','Dark','Holy'];
 const DEFINITIONS=Object.freeze([
  {kind:'eternal_eye',name:'Eternal Eye',image:'assets/items/eeye.png',stat:'atk',ranges:[[2,5],[5,10],[8,15]],unique:'Burn inflicted by this card lasts x2 turns.',costs:{corundum:100,silver_ore:100,calcite:100,holy_dust:100,ancient_bone:10}},
  {kind:'potara_earring',name:'Potara Earring',image:'assets/items/pearing.png',stat:'hp',ranges:[[2,5],[5,10],[8,15]],unique:'Two Unique Potara: Vegeta SSJ2 + Goku SSJ3 fuse into Vegito for this battle; combine HP/ATK and both passives.',costs:{aqua_tear:100,electric_ore:100,calcite:100,holy_dust:100,mineral_ore:10,unknown_dna:100,dragon_tooth:50,senzu_bean:1000}},
  {kind:'god_leaf',name:'God Leaf',image:'assets/items/gleaf.png',stat:'both',ranges:[[1,3],[3,6],[6,10]],unique:'+1–5% dodge; excluded when the card has >80% base dodge or forbids dodge bonuses.',costs:{god_flowers:100,leaf:100,calcite:100,holy_dust:100,mineral_ore:25,lapiz_ore:100}},
  {kind:'nail',name:'Nail',image:'assets/items/nail.png',stat:'atk',category:'Swordman',ranges:[[2,5.5],[6,12],[10,22]],unique:'+10–20% Crit Chance and +15–30% Crit Damage.',costs:{silver_ore:100,chain:100,monster_egg:100,calcite:100,ancient_bone:10}},
  {kind:'millennium_puzzle',name:'Millennium Puzzle',image:'assets/items/mpuzzle.png',stat:'atk',category:'VideoGame',ranges:[[2,5.5],[6,12],[10,18]],unique:'+10–30% EXP from all modes, including EXP Time Trial (one Relic bonus per card).',costs:{chain:100,monster_egg:100,calcite:100,ancient_bone:10,mineral_ore:10,holy_dust:100,god_flowers:100,gold_ore:100,dark_fragment:1}},
  {kind:'enten_blade',name:'Enten Blade',image:'assets/items/entenblade.png',stat:'followChance',category:'Swordman',ranges:[[1,2.5],[2,5],[6,9]],unique:'+5–50% special attack damage. Works on any equipped card; excludes basic attacks, follow-ups/chains, DoT and reflected damage.',costs:{corundum:100,silver_ore:100,calcite:100,electric_ore:100,mineral_ore:50,icey:100,lapiz_ore:100,dark_fragment:10}},
  {kind:'bomb',name:'Bomb',image:'assets/items/bomborb.png',stat:'atk',ranges:[[1,5],[5,8],[8,15]],unique:'+30–300% base ATK on the first attack only; requires the rolled element.',costs:{silver_ore:100,corundum:100,dark_dust:100,calcite:100,electric_ore:100}}
 ].map(Object.freeze));
 const FOLLOW_UP_IDS=Object.freeze(['pain','jotaro-kujo','denji','kamen-rider-kabuto','uchiha-itachi','uchiha-sasuke','weather-shadow-monarch','yuno','kiritsu','boss-event-alucard','alexander-anderson','madara-lubu','speed-wizard','tower-champion-bizare','tower-champion-shadow-200','tower-champion-heavenly-200','merlin','iskandar','the-legion','the-clown','toji','true-mahito','todo','goku-ssj3','ultimate-gohan','tower-champion-raining-200','tower-champion-sugar-200','woltekamui','funny-valentine','tower-champion-tsukuyomi']);
 const followIds=new Set(FOLLOW_UP_IDS);
 function hasFollowUp(value){const root=value?.passiveState,card=value?.card||value;if(root?.passiveSuppressedUntilDeath||root?.passiveSuppressionTurns>0)return false;const ids=[root?.effectivePassiveId||card?.id,...(root?.grimoire?.copies||[]).map(copy=>copy.id)];return ids.some(id=>followIds.has(id)&&!root?.spookyStolenPassives?.[id]);}
 const byKind=new Map(DEFINITIONS.map(row=>[row.kind,row])),RARITIES=['common','rare','legendary'];
 let bridge={},indexRevision=-1,index=new Map(),expIndex=new Map(),ui=null,editing='';
 const recipeId=kind=>'relic_recipe_'+kind;
 const RECIPES=Object.freeze(DEFINITIONS.map(d=>({id:recipeId(d.kind),kind:d.kind,cost:0,ingredients:Object.entries(d.costs).map(([id,quantity])=>({id,quantity}))})));
 function register(){for(const d of DEFINITIONS)host.InventorySystem.registerItem({id:recipeId(d.kind),name:d.name,image:d.image,type:'relic_recipe',tier:'rare',icon:'◆',description:`Craft a Relic: 70% Common / 25% Rare / 5% Legendary. Legendary has 10% Unique chance. ${d.stat==='followChance'?'Swordman cards with a follow-up passive only for the additive follow-up chance bonus.':(d.category?d.category+' cards':'One rolled element')+' only for base stat bonuses.'} Unique: ${d.unique}`});}
 register();
 const randomUnit=r=>Math.max(0,Math.min(1-Number.EPSILON,Number(r())||0));
 const pct=(range,r)=>Math.round((range[0]+Math.floor(randomUnit(r)*(Math.round((range[1]-range[0])*10)+1))/10)*10)/1000;
 const clone=v=>JSON.parse(JSON.stringify(v));
 const key=b=>b?String(b.cardId):'';
 function validRoll(r){
  const d=byKind.get(r?.kind),tier=RARITIES.indexOf(r?.rarity);if(!d||tier<0||typeof r.unique!=='boolean'||r.unique&&tier!==2||(d.category?r?.element!==null:!ELEMENTS.includes(r?.element)))return false;
  if(r.kind==='bomb'&&(r.bombVersion!==undefined&&r.bombVersion!==2||r.bombVersion===2&&!Number.isFinite(r.firstAttackBonus)))return false;
  const range=r.kind==='bomb'&&r.bombVersion===undefined?[[2,8],[8,15],[15,30]][tier]:d.ranges[tier],inside=(n,min,max)=>Number.isFinite(n)&&n>=min-1e-8&&n<=max+1e-8;
  for(const stat of ['hp','atk'])if(d.stat===stat||d.stat==='both'){if(!inside(r[stat],range[0]/100,range[1]/100))return false;}else if(r[stat]!==0)return false;
  if(!inside(r.followChance??0,r.kind==='enten_blade'?range[0]/100:0,r.kind==='enten_blade'?range[1]/100:0)||!inside(r.specialBonus??0,r.kind==='enten_blade'&&r.unique?.05:0,r.kind==='enten_blade'&&r.unique?.50:0))return false;
  if(!inside(r.firstAttackBonus??(r.kind==='bomb'&&r.unique?.30:0),r.kind==='bomb'&&r.unique?.30:0,r.kind==='bomb'&&r.unique?3:0))return false;
  return inside(r.expBonus??0,r.unique&&r.kind==='millennium_puzzle'?.10:0,r.unique&&r.kind==='millennium_puzzle'?.30:0)&&inside(r.dodge,r.unique&&r.kind==='god_leaf'?.01:0,r.unique&&r.kind==='god_leaf'?.05:0)&&inside(r.critChance,r.unique&&r.kind==='nail'?.10:0,r.unique&&r.kind==='nail'?.20:0)&&inside(r.critDamage,r.unique&&r.kind==='nail'?.15:0,r.unique&&r.kind==='nail'?.30:0);
 }
 function validBinding(b){return b===null||Boolean(b&&typeof b.cardId==='string'&&b.cardId.length<=100&&(b.variantKey===undefined||(typeof b.variantKey==='string'&&b.variantKey.length<=250&&Number.isSafeInteger(b.copy)&&b.copy>=0)));}
 function validItem(item){return item?.type!=='relic'||Boolean(/^relic_[a-f0-9]{32}$/.test(item.id)&&item.quantity===1&&validRoll(item.metadata?.relic)&&validBinding(item.metadata?.binding));}
 function validItems(items){const bound=new Set();for(const item of Object.values(items||{})){if(!validItem(item))return false;if(item?.type==='relic'&&item.metadata.binding){const b=item.metadata.binding;const address=b.variantKey===undefined?key(b):JSON.stringify([b.cardId,b.variantKey,b.copy]);if(bound.has(address))return false;bound.add(address);}}return true;}
 function rollAtTier(kind,rarity,unique=false,random=Math.random){
  const d=byKind.get(kind),tier=RARITIES.indexOf(rarity);
  if(!d||tier<0||typeof unique!=='boolean'||unique&&tier!==2)throw Error('Invalid Relic rarity.');
  const range=d.ranges[tier];return {kind,rarity,unique,element:d.category?null:ELEMENTS[Math.floor(randomUnit(random)*6)],hp:d.stat==='hp'||d.stat==='both'?pct(range,random):0,atk:d.stat==='atk'||d.stat==='both'?pct(range,random):0,dodge:unique&&kind==='god_leaf'?pct([1,5],random):0,critChance:unique&&kind==='nail'?pct([10,20],random):0,critDamage:unique&&kind==='nail'?pct([15,30],random):0,expBonus:unique&&kind==='millennium_puzzle'?pct([10,30],random):0,followChance:kind==='enten_blade'?pct(range,random):0,specialBonus:unique&&kind==='enten_blade'?pct([5,50],random):0,...(kind==='bomb'?{bombVersion:2,firstAttackBonus:unique?pct([30,300],random):0}:{})};
 }
 function roll(kind,random=Math.random){
  if(!byKind.has(kind))throw Error('Unknown Relic.');
  const n=randomUnit(random),tier=n<.70?0:n<.95?1:2,unique=tier===2&&randomUnit(random)<.10;
  return rollAtTier(kind,RARITIES[tier],unique,random);
 }
 function normalizeBomb(r){
  if(r?.kind!=='bomb'||r.bombVersion===2)return r;
  const tier=RARITIES.indexOf(r.rarity);if(tier<0)return r;
  const old=[[2,8],[8,15],[15,30]][tier],next=byKind.get('bomb').ranges[tier];
  const quality=Math.max(0,Math.min(1,(r.atk*100-old[0])/(old[1]-old[0])));
  return {...r,atk:Math.round((next[0]+quality*(next[1]-next[0]))*10)/1000,bombVersion:2,firstAttackBonus:r.unique?.30:0};
 }
 function migrateBombs(){
  if(!host.InventorySystem.list().some(item=>item.type==='relic'&&item.metadata?.relic?.kind==='bomb'&&item.metadata.relic.bombVersion===undefined&&validItem(item)))return true;
  return host.InventorySystem.transactItems(items=>{for(const item of Object.values(items))if(item.type==='relic'&&item.metadata?.relic?.kind==='bomb'&&item.metadata.relic.bombVersion===undefined&&validItem(item)){item.metadata.relic=normalizeBomb(item.metadata.relic);item.description=describe(item.metadata.relic,item.metadata.binding);}return true;});
 }
 function uniqueText(r){
  const p=n=>+(Number(n||0)*100).toFixed(1)+'%';if(!r.unique)return '';
  return ({eternal_eye:'Burn duration x2.',potara_earring:'Unique Potara pair: Goku SSJ3 + Vegeta SSJ2 fuse. Vegito: 20% dodge; dodge grants +25% ATK on the next attack.',god_leaf:`Dodge +${p(r.dodge)} (excluded above 80% base dodge or when dodge bonuses are forbidden).`,nail:`Crit Chance +${p(r.critChance)}; Crit Damage +${p(r.critDamage)}.`,millennium_puzzle:`EXP +${p(r.expBonus)} from all modes, including EXP Time Trial.`,enten_blade:`Special attack damage +${p(r.specialBonus)}; excludes basics, follow-ups/chains, DoT and reflected damage.`,bomb:`First main attack +${p(r.firstAttackBonus??.30)} base ATK; matching element only.`})[r.kind]||'';
 }
 function describe(r,binding=null){
  r=normalizeBomb(r);const d=byKind.get(r?.kind);if(!d)return 'Invalid Relic';const p=n=>+(n*100).toFixed(1)+'%';
  const stats=[r.hp?`+${p(r.hp)} HP`:'',r.atk?`+${p(r.atk)} ATK`:'',r.followChance?`+${p(r.followChance)} points follow-up chance (requires a follow-up passive)`:''].filter(Boolean).join(' / ');
  return `${r.rarity.toUpperCase()}${r.unique?' · UNIQUE':''} · ${stats} · ${d.category==='Swordman'?'Swordman / Swordsman':d.category||r.element} cards. ${uniqueText(r)}${binding?' Bound to '+(host.ALL_CARDS.find(c=>c.id===binding.cardId)?.name||binding.cardId)+' · all mutations':' Unbound.'}`;
 }
 function refreshDescriptions(){
  const rows=list();if(!rows.some(i=>i.description!==describe(i.metadata.relic,i.metadata.binding)))return true;
  return host.InventorySystem.transactItems(items=>{for(const row of rows)items[row.id].description=describe(row.metadata.relic,row.metadata.binding);return true;});
 }
 function itemFor(id,r){const d=byKind.get(r.kind);return {id,name:d.name,image:d.image,type:'relic',tier:r.rarity,icon:'◆',quantity:1,description:describe(r),metadata:{relic:clone(r),binding:null,source:'Crafting → '+d.name}};}
 function canAct(){return bridge.canAct?.()!==false&&!host.SandboxSystem?.active&&!host.PvPSystem?.active;}
 function craft(id,random=Math.random){const recipe=RECIPES.find(r=>r.id===id);if(!recipe||!canAct())return {ok:false,message:'Finish the current activity first.'};const r=roll(recipe.kind,random),newId='relic_'+host.OnlineUtils.token(),item=itemFor(newId,r);
  const ok=host.InventorySystem.transactItems(items=>{for(const cost of recipe.ingredients)if((items[cost.id]?.quantity||0)<cost.quantity)return false;for(const cost of recipe.ingredients)items[cost.id].quantity-=cost.quantity;items[newId]=item;return true;});
  if(ok)bridge.onChange?.();return {ok,id:ok?newId:null,message:ok?'Crafted '+item.name+' · '+r.rarity+(r.unique?' · UNIQUE':''):'Unable to craft: missing materials or storage unavailable.'};
 }
 function list(){return host.InventorySystem.list().filter(item=>item.type==='relic'&&item.quantity===1&&validItem(item));}
 function get(id){const item=host.InventorySystem.getItem(id);return item?.type==='relic'&&validItem(item)?item:null;}
 // Mọi bậc dung hợp: 50% thành công, 50% mất toàn bộ nguyên liệu.
 const FUSION_RULES=Object.freeze({
  common:Object.freeze({required:10,rarity:'rare',unique:false,successRate:.50}),
  rare:Object.freeze({required:10,rarity:'legendary',unique:false,successRate:.50}),
  legendary:Object.freeze({required:5,rarity:'legendary',unique:true,successRate:.50})
 });
 function fusionRule(item){return item?.type==='relic'&&validItem(item)&&!item.metadata.relic.unique?FUSION_RULES[item.metadata.relic.rarity]||null:null;}
 function fusionMatches(base,item){return Boolean(fusionRule(base)&&fusionRule(item)&&base.metadata.relic.kind===item.metadata.relic.kind&&base.metadata.relic.rarity===item.metadata.relic.rarity);}
 function fusionPlan(baseId,ids=[]){
  const base=get(baseId),rule=fusionRule(base),selected=Array.isArray(ids)?ids:[],seen=new Set(selected);
  let reason='';
  if(!rule)reason='Choose a Common, Rare or non-Unique Legendary Relic.';
  else if(selected.length!==seen.size||selected.some(id=>typeof id!=='string'))reason='Select each Relic only once.';
  else if(!seen.has(baseId))reason='The initial Relic must be included.';
  else if(selected.length!==rule.required)reason=`Select exactly ${rule.required} Relics, including the initial one.`;
  else if(selected.some(id=>!fusionMatches(base,get(id))))reason='Selected Relics must have the same item type and rarity.';
  else if(!canAct())reason='Finish the current activity first.';
  const configured=Number.isFinite(rule?.successRate)&&rule.successRate>=0&&rule.successRate<=1;
  return {base,rule,ids:[...selected],ready:!reason,configured,reason};
 }
 function fuse(baseId,ids,random=Math.random){
  const plan=fusionPlan(baseId,ids);
  if(!plan.ready||!plan.configured)return {ok:false,success:false,message:plan.reason||'Fusion success rates are not configured. No Relics consumed.'};
  let outcome=null;
  const ok=host.InventorySystem.transactItems(items=>{
   const base=items[baseId];
   if(plan.ids.some(id=>!fusionMatches(base,items[id])))return false;
   const success=randomUnit(random)<plan.rule.successRate;
   let item=null;
   if(success){
    const rolled=rollAtTier(base.metadata.relic.kind,plan.rule.rarity,plan.rule.unique,random),newId='relic_'+host.OnlineUtils.token();
    if(items[newId])return false;
    item=itemFor(newId,rolled);item.metadata.source='Relic Fusion';
   }
   // Tiêu nguyên liệu và nhận kết quả trong cùng một lần ghi Kho đồ.
   for(const id of plan.ids)delete items[id];
   if(item)items[item.id]=item;
   outcome={success,item,consumed:plan.ids.length};return true;
  });
  if(!ok)return {ok:false,success:false,message:'Unable to save fusion. No Relics consumed.'};
  indexRevision=-1;
  try{bridge.onChange?.();}catch(error){host.console?.warn('Fusion saved; UI refresh failed.',error);}
  return {ok:true,...outcome,message:outcome.success?'Fusion successful! Received '+outcome.item.name+'.':'Fusion failed. All '+outcome.consumed+' selected Relics were consumed.'};
 }
 function bindingOwned(b){return Boolean(b&&(bridge.count?bridge.count(b.cardId)>0:(bridge.variants?.(b.cardId)||[]).some(v=>v.count>0)));}
 function bind(id,binding){if(!canAct()||!get(id)||!validBinding(binding)||binding&&!bindingOwned(binding))return false;const ok=host.InventorySystem.transactItems(items=>{for(const item of Object.values(items))if(item.type==='relic'&&binding&&key(item.metadata.binding)===key(binding)){item.metadata.binding=null;item.description=describe(item.metadata.relic);}items[id].metadata.binding=binding?{cardId:binding.cardId}:null;items[id].description=describe(items[id].metadata.relic,binding);return true;});if(ok)bridge.onChange?.();return ok;}
 // Gắn theo ID thẻ; chuyển dữ liệu cũ mà không xóa Relic.
 function migrateBindings(){
  const rows=list().filter(i=>i.metadata.binding).sort((a,b)=>(a.metadata.binding.copy||0)-(b.metadata.binding.copy||0)||a.id.localeCompare(b.id));
  if(!rows.some(i=>i.metadata.binding.variantKey!==undefined))return true;
  return host.InventorySystem.transactItems(items=>{const seen=new Set();for(const row of rows){const item=items[row.id],id=item.metadata.binding.cardId;item.metadata.binding=seen.has(id)?null:{cardId:id};seen.add(id);item.description=describe(item.metadata.relic,item.metadata.binding);}return true;});
 }
 function rebuild(){if(indexRevision===host.InventorySystem.revision)return;indexRevision=host.InventorySystem.revision;index=new Map();expIndex=new Map();for(const item of list()){const b=item.metadata.binding;if(b&&!index.has(b.cardId)){index.set(b.cardId,item);if(item.metadata.relic.kind==='millennium_puzzle'&&item.metadata.relic.unique)expIndex.set(b.cardId,[item]);}}}
 let detachQueued=false;
 function ownershipChanged(){
  if(detachQueued)return;detachQueued=true;
  host.queueMicrotask(()=>{detachQueued=false;rebuild();const stale=[...index.values()].filter(i=>!bindingOwned(i.metadata.binding));if(!stale.length)return;
   const ok=host.InventorySystem.transactItems(items=>{for(const row of stale){const item=items[row.id];if(item?.metadata?.binding&&!bindingOwned(item.metadata.binding)){item.metadata.binding=null;item.description=describe(item.metadata.relic);}}return true;});if(ok)bridge.onChange?.();});
 }
 function reconcile(){migrateBindings();refreshDescriptions();ownershipChanged();}
 function equipped(cardId){rebuild();const item=index.get(String(cardId));return item&&bindingOwned(item.metadata.binding)?item:null;}
 function snapshotFor(cardId){const item=equipped(cardId);return item?clone(normalizeBomb(item.metadata.relic)):null;}
 function matching(card,r){const d=byKind.get(r?.kind);return d&&(d.category?(card.category||[]).some(c=>c===d.category||d.category==='Swordman'&&c==='Swordsman')&&(d.kind!=='enten_blade'||hasFollowUp(card)):r.element===card.element);}
 // Shared card levels receive the strongest bound copy, never a sum of copies.
 function expMultiplier(cardId,owner){
  const bonus=r=>r?.kind==='millennium_puzzle'&&r.unique&&validRoll(r)?r.expBonus:0;
  if(owner)return 1+bonus(owner.relic);
  rebuild();for(const item of expIndex.get(cardId)||[])if(bindingOwned(item.metadata.binding))return 1+bonus(item.metadata.relic);
  return 1;
 }
 function preview(card,stats,variantKey,copy=0){const r=snapshotFor(card.id,variantKey,copy);return r&&matching(card,r)?{...stats,hp:Math.round(stats.hp*(1+r.hp)),atk:Math.round(stats.atk*(1+r.atk))}:stats;}
 function matchingUnit(unit,r=unit?.relic){return matching(unit?.relicCategory?{...unit.card,category:unit.relicCategory}:unit?.card,r);}
 function factors(unit){
  if(unit?.relicFactors)return {...unit.relicFactors};
  const r=unit?.relic;return r&&matchingUnit(unit,r)?{hp:1+r.hp,atk:1+r.atk}:{hp:1,atk:1};
 }
 function rebase(unit,source){
  const before=source?.card?factors(source):source||{hp:1,atk:1},after=unit.relic&&matchingUnit(unit,unit.relic)?{hp:1+unit.relic.hp,atk:1+unit.relic.atk}:{hp:1,atk:1};
  const hp=after.hp/(before.hp||1),atk=after.atk/(before.atk||1);
  if(hp!==1){unit.maxHp=Math.max(1,Math.round(unit.maxHp*hp));unit.hp=Math.min(unit.maxHp,Math.max(0,Math.round(unit.hp*hp)));}
  if(atk!==1)unit.atk=Math.max(unit.sandboxAllowZeroAttack?0:1,Math.round(unit.atk*atk));
  unit.relicFactors=after;if(unit.display)Object.assign(unit.display,{hp:unit.maxHp,atk:unit.atk});return unit;
 }
 function inherit(owner,unit,sources={}){
  if(unit.relicInherited)return unit;
  if(!Array.isArray(unit.card.category))unit.relicCategory=[...(owner.card?.category||owner.relicCategory||[])];
  const hpSource=Object.hasOwn(sources,'hpSource')?sources.hpSource:owner,atkSource=Object.hasOwn(sources,'atkSource')?sources.atkSource:owner;
  const old={hp:factors(hpSource).hp,atk:factors(atkSource).atk};
  unit.relic=validRoll(owner.relic)?clone(normalizeBomb(owner.relic)):null;
  unit.relicPrepared=true;unit.relicInherited=true;unit.relicOrigin=owner.display?.name||owner.card?.name||'Summoner';
  return rebase(unit,old);
 }
 function applyToUnit(unit,r){if(unit.relicPrepared)return unit;unit.relicPrepared=true;if(!validRoll(r))return unit;r=normalizeBomb(r);unit.relic=clone(r);return rebase(unit,{hp:1,atk:1});}
 function attachTeam(team){const used=new Map();for(const unit of team||[]){if(unit.relicPrepared||unit.isClone||unit.isSummoned)continue;const id=unit.card?.id,variantKey=unit.variantKey||host.canonicalVariantKey(id,(unit.mutations||[]).map(m=>m.id)),copy=Number.isSafeInteger(unit.cardInstance?.copy)?unit.cardInstance.copy:used.get(variantKey)||0;used.set(variantKey,copy+1);unit.cardInstance={cardId:id,variantKey,copy};applyToUnit(unit,snapshotFor(id,variantKey,copy));}return team;}
 function open(id){if(!canAct()||!get(id)||!mount())return false;editing=id;ui.search.value='';renderCards();const b=get(id).metadata.binding;if(b)ui.card.value=b.cardId;ui.title.textContent=get(id).name+' · Equip Relic';ui.root.classList.remove('hidden');return true;}
 function renderCards(){if(!ui)return;const query=ui.search.value.trim().toLowerCase(),old=ui.card.value;ui.card.replaceChildren();for(const c of bridge.cards?.()||[]){if(!`${c.name} ${c.element}`.toLowerCase().includes(query))continue;const o=host.document.createElement('option');o.value=c.id;o.textContent=c.name+' · all mutations';ui.card.append(o);}if([...ui.card.options].some(o=>o.value===old))ui.card.value=old;ui.equip.disabled=!ui.card.value;}
 function mount(){if(ui)return true;const el=id=>host.document.getElementById(id),next={root:el('relicEquipModal'),title:el('relicEquipTitle'),search:el('relicCardSearch'),card:el('relicCardSelect'),equip:el('relicEquipConfirm'),unequip:el('relicUnequip'),status:el('relicEquipStatus')};if(Object.values(next).some(v=>!v))return false;ui=next;ui.search.addEventListener('input',()=>host.UIPerformanceSystem.debounce('relic-search',renderCards));ui.equip.addEventListener('click',()=>{const ok=bind(editing,{cardId:ui.card.value});ui.status.textContent=ok?'Relic equipped across all mutations.':'Unable to equip. Check ownership or current activity.';if(ok)ui.root.classList.add('hidden');});ui.unequip.addEventListener('click',()=>{if(bind(editing,null))ui.root.classList.add('hidden');});el('relicEquipClose')?.addEventListener('click',()=>ui.root.classList.add('hidden'));return true;}
 host.RelicSystem=Object.freeze({DEFINITIONS,RECIPES,FOLLOW_UP_IDS,hasFollowUp,register,roll,rollAtTier,FUSION_RULES,fusionRule,fusionMatches,fusionPlan,fuse,validRoll,validItem,validItems,validBinding,normalizeBomb,migrateBombs,uniqueText,refreshDescriptions,migrateBindings,equipped,matchingUnit,factors,rebase,inherit,describe,craft,list,get,bind,key,matching,snapshotFor,ownershipChanged,reconcile,applyToUnit,attachTeam,preview,expMultiplier,open,count:kind=>list().filter(i=>i.metadata.relic.kind===kind).length,isRecipe:id=>RECIPES.some(r=>r.id===id),configure(options){bridge=options||{};migrateBombs();migrateBindings();refreshDescriptions();indexRevision=-1;mount();reconcile();}});
})(window);
