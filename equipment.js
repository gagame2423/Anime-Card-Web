/* One equipped item, immutable bonus definitions and recoverable card crafting. */
(function(host){
  'use strict';
  const KEY='anime_card_rng_equipment_v1',MAIN_KEY='anime_card_rng_save_v1';
  const ingredient=(cardId,mutations=[],match='exact')=>Object.freeze({cardId,mutationIds:Object.freeze(mutations),match,quantity:1});
  const entries=[
    ['cid_birb','Cid Birb','cidbirb.png',5000000,[ingredient('cid-shadow',['monarch'],'contains')],{mutation:.10,money:.30,exp:.10},'+10% Mutation chance (x1.10); +30% VNĐ and +10% EXP from all sources.'],
    ['padoru','Padoru','padoru.png',24120000,[ingredient('saber',['frost','angelic'])],{money:.36,luck:1.2},'+36% VNĐ from all sources; +1.2 Luck.'],
    ['sasuke_sharingan','Sasuke Sharingan','smks.png',2500000,[ingredient('sasuke-kid',['storm','wet']),ingredient('uchiha-sasuke',['storm'],'contains')],{arenaMoney:.50,weather:.05},'+50% Arena VNĐ; +5 percentage points Weather chance.'],
    ['vampire_glove','Vampire Glove','vampireglove.png',6666666,[ingredient('boss-event-alucard')],{luck:3.3},'+3.3 Luck.'],
    ['antimagic_sword','AntiMagic Sword','amsword.png',3333333,[ingredient('asta-demon'),ingredient('asta')],{drop:.333,arenaMoney:.33,arenaExp:.33},'+0.333 Drop Multiplier; +33% Arena VNĐ and EXP.'],
    ['mera_mera_nomi','Mera Mera Nomi','merafruit.png',10000000,[ingredient('raid-secret-ace',['solar'],'contains')],{luck:1.5,weather:.015,mutation:.015},'+1.5 Luck; +1.5 percentage points Weather chance; Mutation chance x1.015.'],
    ['kamen_rider_belt','Kamen Rider Belt','krbelt.png',1000000,[ingredient('kamen-rider-kabuto'),ingredient('kr-decade'),ingredient('kr-kuuga')],{luck:1.8,rollSpeed:.18},'+1.8 Luck; +18% Roll Speed.'],
    ['poker_card','Poker Card','pokercard.png',777777777,[ingredient('hakari',['clove'],'contains'),ingredient('hakari-jackpot')],{luck:7},'+7 Luck.']
  ];
  const RECIPES=Object.freeze(entries.map(([key,name,file,cost,cards,bonuses,description])=>Object.freeze({
    id:'equipment_'+key,name,cost,cards:Object.freeze(cards),ingredients:Object.freeze([]),bonuses:Object.freeze(bonuses),
    item:Object.freeze({id:'equipment_'+key,name,type:'equipment',tier:'mythic',icon:'◇',image:'assets/items/'+file,description})
  })));
  const EVENT_EQUIPMENT=Object.freeze({id:'equipment_headless_horseman',name:'Headless Horseman',bonuses:Object.freeze({spookyCoins:.66,money:.66,drop:.06,mutation:.06}),
    item:Object.freeze({id:'equipment_headless_horseman',name:'Headless Horseman',type:'equipment',tier:'secret',icon:'🎃',image:'assets/items/hhequip.png',description:'+66% Spooky Coins; +66% VNĐ from all sources; +0.06 Drop Multiplier; Mutation chance x1.06. Spooky Hunt Wave 50 victory only: 5%.'})});
  const INFINITY_EYE=Object.freeze({id:"equipment_infinity_eye",name:"Infinity Eye",bonuses:Object.freeze({expFlat:.8,luck:.8,moneyFlat:.8}),item:Object.freeze({id:"equipment_infinity_eye",name:"Infinity Eye",type:"equipment",tier:"mythic",icon:"∞",image:"assets/items/gojoeye.png",description:"+0.8 EXP Multiplier; +0.8 Luck; +0.8 VNĐ Multiplier. Gomen Boss Event Shop: 888,888 Gomen Coins."})});
  const ITEMS=new Map([...RECIPES,EVENT_EQUIPMENT,INFINITY_EYE].map(item=>[item.id,item]));
  const BY_ID=new Map(RECIPES.map(recipe=>[recipe.id,recipe]));
  const ZERO=Object.freeze({luck:0,money:0,exp:0,arenaMoney:0,arenaExp:0,weather:0,mutation:0,drop:0,rollSpeed:0});
  let bridge={},blocked=false;
  const fresh=()=>({version:1,equipped:null,pending:null});
  function validSave(value){return Boolean(value&&value.version===1&&(value.equipped===null||ITEMS.has(value.equipped))&&value.pending===null);}
  function read(){try{const value=JSON.parse(host.localStorage.getItem(KEY)||'null');return value&&value.version===1?{version:1,equipped:ITEMS.has(value.equipped)?value.equipped:null,pending:value.pending||null}:fresh();}catch(_){return fresh();}}
  let data=read();
  function persist(){try{host.localStorage.setItem(KEY,JSON.stringify(data));return true;}catch(_){return false;}}
  function recover(){
    if(data.pending){
      const p=data.pending;
      try{
        if(typeof p.mainBefore!=='string'||typeof p.itemsBefore!=='string'||!JSON.parse(p.mainBefore)?.schemaVersion||!JSON.parse(p.itemsBefore)?.items)throw Error('Invalid equipment journal');
        host.localStorage.setItem(MAIN_KEY,p.mainBefore);host.localStorage.setItem(host.InventorySystem.KEY,p.itemsBefore);
        host.InventorySystem.reload();
      }catch(_){blocked=true;return false;}
    }
    const previous=data.pending;data.pending=null;
    if(!persist()){data.pending=previous;blocked=true;return false;}
    blocked=false;return true;
  }
  const recovered=recover();
  function register(){for(const recipe of ITEMS.values())host.InventorySystem.registerItem(recipe.item);}
  register();
  function canonicalIds(values){return [...new Set((values||[]).map(value=>host.MUTATION_BY_ID?.[typeof value==='string'?value:value?.id]?.id).filter(Boolean))].sort();}
  function matches(requirement,variant){
    const actual=canonicalIds([...(variant.mutations||[]),...(variant.mutationIds||[])]),wanted=canonicalIds(requirement.mutationIds);
    return requirement.match==='contains'?wanted.every(id=>actual.includes(id)):actual.length===wanted.length&&wanted.every(id=>actual.includes(id));
  }
  function options(requirement){return (bridge.variants?.(requirement.cardId)||[]).filter(v=>v.count>=requirement.quantity&&matches(requirement,v)).sort((a,b)=>canonicalIds(a.mutations||a.mutationIds).length-canonicalIds(b.mutations||b.mutationIds).length||a.key.localeCompare(b.key));}
  function inspect(id,choices={}){
    const recipe=BY_ID.get(id);if(!recipe)return null;
    const requirements=recipe.cards.map((requirement,index)=>{const variants=options(requirement),selected=Object.hasOwn(choices,index)?variants.find(v=>v.key===choices[index])||null:variants[0]||null;return{requirement,variants,selected};});
    const money=Number(bridge.money?.())||0;
    return {recipe,requirements,money,canCraft:!blocked&&!host.SandboxSystem?.active&&bridge.canAct?.()===true&&money>=recipe.cost&&host.InventorySystem.quantity(id)<Number.MAX_SAFE_INTEGER&&requirements.every(r=>r.selected)};
  }
  function craft(id,choices={}){
    const preview=inspect(id,choices);if(!preview?.canCraft)return {ok:false,message:'Missing cards/VNĐ, or finish the current battle first.'};
    const selected=preview.requirements.map(r=>r.selected);let plan;
    try{plan=bridge.prepare(preview.recipe,selected);}catch(e){return {ok:false,message:e.message};}
    data.pending={mainBefore:plan.mainBefore,itemsBefore:plan.itemsBefore};
    if(!persist()){data.pending=null;return {ok:false,message:'Unable to save. No ingredients were consumed.'};}
    try{
      host.localStorage.setItem(host.InventorySystem.KEY,plan.itemsAfter);host.localStorage.setItem(MAIN_KEY,plan.mainAfter);
      const journal=data.pending;data.pending=null;if(!persist()){data.pending=journal;throw Error('Commit failed');}
      host.InventorySystem.reload();bridge.onCommit?.();return {ok:true,message:'Crafted 1 '+preview.recipe.name+'.'};
    }catch(_){
      const restored=recover();if(restored)bridge.onCommit?.();else bridge.onBlocked?.();
      return {ok:false,message:restored?'Save failed. Cards, VNĐ and item quantities restored.':'Storage unavailable. Reload to recover the pending craft before continuing.'};
    }
  }
  function equip(id){
    if(blocked||host.SandboxSystem?.active||bridge.canAct?.()!==true||(id!==null&&(!ITEMS.has(id)||host.InventorySystem.quantity(id)<1)))return false;
    const before=data.equipped;data.equipped=id;if(!persist()){data.equipped=before;return false;}bridge.onChange?.();return true;
  }
  function current(){return data.equipped&&host.InventorySystem.quantity(data.equipped)>0?ITEMS.get(data.equipped):null;}
  function bonuses(){return current()?.bonuses||ZERO;}
  const multiplier=(field,source='all')=>1+(bonuses()[field]||0)+(source==='arena'?(bonuses()[field==='money'?'arenaMoney':'arenaExp']||0):0);
  const flatBonus=field=>Number(bonuses()[field+'Flat'])||0;
  const scale=(amount,mult)=>Math.max(0,Math.min(Number.MAX_SAFE_INTEGER,Math.floor(Math.max(0,Number(amount)||0)*mult)));
  host.EquipmentSystem=Object.freeze({KEY,RECIPES,EVENT_EQUIPMENT,INFINITY_EYE,isEquipment:id=>ITEMS.has(id),recovered,validSave,register,recover,inspect,craft,equip,matches,options,
    configure:options=>{bridge=options||{};},recipe:id=>BY_ID.get(id)||null,current,bonuses,flatBonus,
    mutationMultiplier:()=>1+(bonuses().mutation||0),moneyMultiplier:source=>multiplier('money',source),expMultiplier:source=>multiplier('exp',source),
    scaleMoney:(amount,source)=>scale(amount,multiplier('money',source)+flatBonus('money')),
    flush:()=>!blocked&&data.pending===null&&persist(),get blocked(){return blocked;},
    reset:()=>{data=fresh();blocked=false;register();persist();},get equipped(){return current()?.id||null;}
  });
})(window);
