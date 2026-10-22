/* Evolution recipes, recoverable transactions and the evolution dialog. */
(function(host) {
  'use strict';
  const KEY = 'anime_card_rng_evolution_v1', MAIN_KEY = 'anime_card_rng_save_v1';
  const RECIPES = Object.freeze([
    Object.freeze({id:'true-mahito',baseId:'mahito',itemId:'mahito_puppet',level:100,name:'True Mahito'}),
    Object.freeze({id:"gojo-revice",baseId:"gojo-young",itemId:"gojo_eye",level:100,name:"Gojo Revice"}),
    Object.freeze({id:"jason-13th",baseId:"the-trapper",itemId:"machete",level:100,name:"Jason 13th"}),
    Object.freeze({id:"saber-knight",baseId:"saber",itemId:"excalibur_sword",level:100,name:"Saber Knight"}),
    Object.freeze({id:'yuno-spirit',baseId:'yuno',itemId:'spirit_crown',level:100,name:'Yuno Spirit'}),
    Object.freeze({ id:'awakened-doflamingo', baseId:'doflamingo', itemId:'web_string', level:100, name:'Awakened Doflamingo' }),
    Object.freeze({ id:'sea-goddess-valkyrie', baseId:'noelle-silva', itemId:'sea_valkyrie', level:100, name:'Sea Goddess Valkyrie' }),
    Object.freeze({ id:'prime-garp', baseId:'garp', itemId:'cannon_ball', level:100, name:'Prime Garp' })
  ]);
  const MATERIALS = Object.freeze([
    Object.freeze({id:'mahito_puppet',name:'Mahito Puppet',type:'material',icon:'♟',image:'assets/items/mpuppet.png',tier:'secret',description:'Evolve Lv.100+ Mahito (any mutation) into True Mahito. Shibuya Raid Shop: 10,500 Shibuya Coins.'}),
    Object.freeze({id:"gojo_eye",name:"Gojo Eye",type:"material",icon:"◉",image:"assets/items/gojoeye.png",tier:"mythic",description:"Evolve Lv.100+ Gojo Young (any mutation) into Gojo Revice. Gomen Boss Event victory: 0.8%–8% by difficulty; Boss Event Shop: 888,888 Gomen Coins."}),
    Object.freeze({id:"machete",name:"Machete",type:"material",icon:"🔪",image:"assets/items/machete.png",tier:"secret",description:"Evolve Lv.100+ The Trapper (any mutation) into Jason 13th. Spooky Wave 50 victory only: 1%; Spooky Shop: 613,000 Coins."}),
    Object.freeze({id:"excalibur_sword",name:"Excalibur Sword",type:"material",icon:"⚔",image:"assets/items/excalibur.png",tier:"mythic",description:"Evolve Lv.100+ Saber (any mutation) into Saber Knight. Holy Grail Raid: 0.8%–8% drop; shop 80,000 Coins."}),
    Object.freeze({id:'spirit_crown',name:'Spirit Crown',type:'material',icon:'👑',image:'assets/spiritcrown.png',tier:'secret',description:'Evolve Lv.100+ Yuno into Yuno Spirit. Lucius Event Shop: 4,400 Lucius Event Coins.'}),
    Object.freeze({ id:'sea_valkyrie', name:'Sea Valkyrie', type:'material', icon:'🌊', image:'assets/mermaidscale.png', tier:'mythic', description:'Evolve Lv.100+ Noelle Silva into Sea Goddess Valkyrie. Lucius Event Shop: 4,000 Lucius Event Coins.' }),
    Object.freeze({ id:'web_string', name:'Web String', type:'material', icon:'🕸️', tier:'mythic', description:'Evolve Lv.100+ Doflamingo into Awakened Doflamingo. Marine Ford Raid Shop: 6,220 Coins.' }),
    Object.freeze({ id:'cannon_ball', name:'Cannon Ball', type:'material', icon:'💣', tier:'mythic', description:'Evolve Lv.100+ Garp into Prime Garp. Marine Ford Raid Shop: 3,899 Coins.' })
  ]);
  const recipeParents=new Map(RECIPES.map(recipe=>[recipe.id,recipe.baseId]));
  const cardsById=new Map((host.ALL_CARDS||[]).map(card=>[card.id,card])),lineageCache=new WeakMap();
  function getBaseCardId(cardOrId){
    const id=typeof cardOrId==='object'?cardOrId?.id:cardOrId;
    const card=typeof cardOrId==='object'?cardOrId:cardsById.get(id);
    return recipeParents.get(id)||card?.evolvesFrom||null;
  }
  function eligibilityLineage(cardOrId){
    const first=typeof cardOrId==='object'?cardOrId:cardsById.get(cardOrId);
    if(!first)return [];
    if(lineageCache.has(first))return lineageCache.get(first);
    const line=[],seen=new Set();
    for(let card=first;card&&!seen.has(card.id);card=cardsById.get(getBaseCardId(card))){seen.add(card.id);line.push(card);}
    const result=Object.freeze(line);lineageCache.set(first,result);return result;
  }
  let bridge = {};
  function register() { MATERIALS.forEach(item => host.InventorySystem.registerItem(item)); }
  function validSave(value) { return value?.version === 1 && value.pending === null; }
  function recover() {
    try {
      const record = JSON.parse(host.localStorage.getItem(KEY) || 'null');
      if (record?.pending) {
        const p = record.pending;
        if (record.version !== 1 || typeof p.mainBefore !== 'string' || typeof p.itemsBefore !== 'string' || !JSON.parse(p.mainBefore)?.schemaVersion || !JSON.parse(p.itemsBefore)?.items) return false;
        host.localStorage.setItem(MAIN_KEY,p.mainBefore);
        host.localStorage.setItem(host.InventorySystem.KEY,p.itemsBefore);
        host.InventorySystem.reload();
      }
      host.localStorage.setItem(KEY,JSON.stringify({ version:1,pending:null }));
      return true;
    } catch (_) { return false; }
  }
  function evolve(id, variantKey) {
    const recipe = RECIPES.find(r => r.id === id);
    if (!recipe || !bridge.canAct?.() || !recover()) return {ok:false,message:'Hãy kết thúc trận và kiểm tra bộ nhớ trước khi tiến hóa.'};
    let plan;
    try { plan = bridge.prepare(recipe,variantKey); }
    catch (e) { return {ok:false,message:e.message}; }
    const pending = { mainBefore:plan.mainBefore,itemsBefore:plan.itemsBefore };
    try {
      host.localStorage.setItem(KEY,JSON.stringify({version:1,pending}));
      host.localStorage.setItem(host.InventorySystem.KEY,plan.itemsAfter);
      host.localStorage.setItem(MAIN_KEY,plan.mainAfter);
      host.localStorage.setItem(KEY,JSON.stringify({version:1,pending:null}));
      host.InventorySystem.reload(); bridge.onCommit?.();
      return {ok:true,message:`Đã tiến hóa thành ${recipe.name} • Lv.1 • giữ nguyên mutation.`};
    } catch (_) {
      const restored = recover(); if (restored) bridge.onCommit?.();
      return {ok:false,message:restored ? 'Không thể lưu tiến hóa. Thẻ và vật phẩm đã được khôi phục.' : 'Bộ nhớ chưa khả dụng. Hãy tải lại để khôi phục giao dịch trước khi chơi tiếp.'};
    }
  }
  function render(container) {
    if (!container) return;
    container.replaceChildren(); const doc = container.ownerDocument;
    for (const recipe of RECIPES) {
      const box=doc.createElement('article');box.className='module-item evolution-recipe';
      const title=doc.createElement('h3');title.textContent=recipe.name;
      const item=host.InventorySystem.getItem(recipe.itemId),info=bridge.describe?.(recipe)||{};
      const text=doc.createElement('p');text.textContent=`${info.baseName || recipe.baseId} Lv.${recipe.level}+ + 1 ${item?.name || recipe.itemId} (x${host.InventorySystem.quantity(recipe.itemId)} owned). Result: Lv.1; exact mutations inherited. One evolution per result card.`;
      const select=doc.createElement('select'); select.className='select-input'; select.setAttribute('aria-label',`Base mutation for ${recipe.name}`);
      for (const variant of info.variants || []) { const o=doc.createElement('option');o.value=variant.key;o.textContent=`${variant.label} • x${variant.count} • Lv.${info.level}`;select.append(o); }
      if (!select.options.length) { const o=doc.createElement('option');o.textContent='No eligible base card';select.append(o);select.disabled=true; }
      const button=doc.createElement('button');button.type='button';button.className='battle-primary-button';
      button.textContent=info.completed ? 'Already evolved' : 'Evolve • consumes 1 card + 1 material';
      button.disabled=info.completed || !info.variants?.length || info.level<recipe.level || host.InventorySystem.quantity(recipe.itemId)<1 || !bridge.canAct?.();
      button.addEventListener('click',()=>{const result=evolve(recipe.id,select.value); const status=doc.getElementById('evolutionStatus');if(status) status.textContent=result.message;render(container);});
      box.append(title,text,select,button);container.append(box);
    }
  }
  const recovered = recover(); register();
  host.EvolutionSystem=Object.freeze({KEY,RECIPES,MATERIALS,getBaseCardId,eligibilityLineage,recovered,validSave,recover,register,evolve,render,flush:()=>{try{return validSave(JSON.parse(host.localStorage.getItem(KEY)));}catch(_){return false;}},reset:()=>{host.localStorage.removeItem(KEY);recover();register();},configure:options=>{bridge=options||{};}});
})(window);
