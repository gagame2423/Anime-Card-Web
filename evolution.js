/* Evolution recipes, recoverable transactions and the evolution dialog. */
(function(host) {
  'use strict';
  const KEY = 'anime_card_rng_evolution_v1', MAIN_KEY = 'anime_card_rng_save_v1';
  const RECIPES = Object.freeze([
    Object.freeze({id:'itachi-awakened',baseId:'uchiha-itachi',itemId:'mangekyo_eye',level:100,resultLevel:100,name:'Itachi Awakened'}),
    Object.freeze({id:'ultimate-gohan',baseId:'gohan',itemId:'senzu_bean',itemCount:8500,level:100,resultLevel:100,name:'Ultimate Gohan'}),
    Object.freeze({id:'golden-frieza',baseId:'frieza',itemId:'senzu_bean',itemCount:7690,level:100,resultLevel:100,name:'Golden Frieza'}),
    Object.freeze({id:'true-mahito',baseId:'mahito',itemId:'mahito_puppet',level:100,resultLevel:100,name:'True Mahito'}),
    Object.freeze({id:"gojo-revice",baseId:"gojo-young",itemId:"gojo_eye",level:100,resultLevel:100,name:"Gojo Revice"}),
    Object.freeze({id:"jason-13th",baseId:"the-trapper",itemId:"machete",level:100,resultLevel:100,name:"Jason 13th"}),
    Object.freeze({id:"saber-knight",baseId:"saber",itemId:"excalibur_sword",level:100,resultLevel:100,name:"Saber Knight"}),
    Object.freeze({id:'yuno-spirit',baseId:'yuno',itemId:'spirit_crown',level:100,resultLevel:100,name:'Yuno Spirit'}),
    Object.freeze({ id:'awakened-doflamingo', baseId:'doflamingo', itemId:'web_string', level:100,resultLevel:100, name:'Awakened Doflamingo' }),
    Object.freeze({ id:'sea-goddess-valkyrie', baseId:'noelle-silva', itemId:'sea_valkyrie', level:100,resultLevel:100, name:'Sea Goddess Valkyrie' }),
    Object.freeze({ id:'prime-garp', baseId:'garp', itemId:'cannon_ball', level:100,resultLevel:100, name:'Prime Garp' })
  ]);
  const MATERIALS = Object.freeze([
    Object.freeze({id:'mangekyo_eye',name:'Mangekyo Eye',type:'material',icon:'◉',image:'assets/items/eeye.png',tier:'secret',description:'Evolve Lv.100 Uchiha Itachi into Lv.100 Itachi Awakened, keeping mutations. Akatsuki Raid: 0.03%–3% by difficulty.'}),
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
      host.InventorySystem.reload();
      try { bridge.onCommit?.(); } catch(error) { host.console?.warn('Evolution saved; UI refresh failed.',error); }
      return {ok:true,message:`Đã tiến hóa thành ${recipe.name} • Lv.${resultLevel(recipe)} • giữ nguyên mutation.`};
    } catch (_) {
      const restored = recover(); if (restored) { try { bridge.onCommit?.(); } catch(error) { host.console?.warn('Evolution restored; UI refresh failed.',error); } }
      return {ok:false,message:restored ? 'Không thể lưu tiến hóa. Thẻ và vật phẩm đã được khôi phục.' : 'Bộ nhớ chưa khả dụng. Hãy tải lại để khôi phục giao dịch trước khi chơi tiếp.'};
    }
  }
  const byBase = new Map();
  for (const recipe of RECIPES) {
    const paths = byBase.get(recipe.baseId) || [];
    paths.push(recipe); byBase.set(recipe.baseId, paths);
  }
  const recipesFor = cardId => [...(byBase.get(String(cardId)) || [])];
  const resultLevel = (recipe, level = recipe.level) => host.CardLevelSystem.normalizeLevel(Math.max(recipe.level, level));
  const number = value => Math.round(Number(value) || 0).toLocaleString('en-US');
  let ui = null, selection = null, confirming = false;
  const make = (tag, className = '', text) => {
    const node = host.document.createElement(tag); node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function inspect(baseId, variantKey) {
    const recipe = recipesFor(baseId)[0]; if (!recipe) return null;
    const info = bridge.describe?.(recipe) || {}, variant = info.variants?.find(v => v.key === variantKey && v.count > 0);
    const base = cardsById.get(recipe.baseId), target = cardsById.get(recipe.id);
    if (!base || !target) return null;
    const level = host.CardLevelSystem.normalizeLevel(info.level), nextLevel = resultLevel(recipe, level);
    const material = host.InventorySystem.getItem(recipe.itemId);
    const owned = host.InventorySystem.quantity(recipe.itemId), required = recipe.itemCount || 1;
    let reason = '';
    if (info.completed) reason = 'This evolution is already unlocked.';
    else if (!variant) reason = 'This mutation is no longer owned. Select an owned variant in Card Details.';
    else if (level < recipe.level) reason = `Requires ${base.name} at Lv. ${recipe.level}. Current: Lv. ${level}.`;
    else if (owned < required) reason = `Need ${number(required - owned)} more ${material?.name || recipe.itemId}.`;
    else if (!bridge.canAct?.()) reason = 'Finish the current activity before evolving.';
    const mutations = variant?.mutations || [];
    return { recipe, base, target, variant, mutations, level, nextLevel, material, owned, required, reason,
      canEvolve: !reason,
      baseStats: variant ? bridge.display?.(base, variant, level, true) : null,
      targetStats: variant ? bridge.display?.(target, variant, nextLevel, false) : null };
  }
  function artwork(imagePath, label, fallbackText, className) {
    const frame = make('div', className), fallback = make('span', 'evolution-art-fallback', fallbackText);
    frame.append(fallback);
    if (imagePath) {
      const image = make('img'); image.src = imagePath; image.alt = label;
      image.addEventListener('error', () => image.remove(), {once:true});
      image.addEventListener('load', () => { fallback.hidden = true; }, {once:true});
      frame.append(image);
    }
    return frame;
  }
  function paintCard(root, card, stats, level) {
    root.className = 'evolve-card evolve-card--' + root.dataset.side + ' rarity-' + card.rarity.toLowerCase();
    const header = make('div', 'evolve-card-meta');
    header.append(make('strong', '', 'Lv. ' + level), make('span', '', card.rarity));
    const art = artwork(card.image, card.name, card.name.slice(0, 1), 'evolve-card-art');
    host.ElementSystem.renderBadge(art, card);
    const badge=art.querySelector('.element-badge'),icon=badge?.querySelector('img');
    icon?.addEventListener('error',()=>{icon.remove();badge.textContent=card.element.slice(0,1);},{once:true});
    const name = make('h3', '', card.name), values = make('div', 'evolve-card-stats');
    values.append(make('span', '', 'HP ' + number(stats?.hp ?? card.stats.hp)), make('span', '', 'ATK ' + number(stats?.atk ?? card.stats.atk)));
    root.replaceChildren(header, art, name, values);
  }
  function paint(message = '') {
    if (!selection || !ui) return;
    const model = inspect(selection.baseId, selection.variantKey); if (!model) { close(); return; }
    paintCard(ui.base, model.base, model.baseStats, model.level);
    paintCard(ui.target, model.target, model.targetStats, model.nextLevel);
    const mutationName = model.mutations.map(m => typeof m === 'string' ? host.MUTATION_BY_ID?.[m]?.name || m : m.name).join(' + ') || 'Normal';
    ui.mutation.textContent = `${mutationName} → ${mutationName} · Mutation preserved`;
    ui.stats.replaceChildren();
    for (const [stat, label] of [['atk','ATK'], ['hp','HP']]) {
      const before = model.baseStats?.[stat] || 0, after = model.targetStats?.[stat] || 0;
      const delta = before ? (after / before - 1) * 100 : 0;
      const row = make('div', 'evolution-stat-change' + (delta < 0 ? ' is-lower' : ''));
      row.append(make('small', '', label), make('strong', '', `${number(before)} → ${number(after)}`), make('span', '', `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`));
      ui.stats.append(row);
    }
    const passive = bridge.passive?.(model.target) || model.target.passive;
    ui.passiveName.textContent = passive?.name || 'Passive'; ui.passive.textContent = passive?.description || '';
    const levelMet = model.level >= model.recipe.level && Boolean(model.variant);
    ui.baseRequirement.textContent = `1× ${model.base.name} · Lv. ${model.level}/${model.recipe.level} · ${mutationName}`;
    ui.baseRequirement.className = 'evolution-base-requirement ' + (levelMet ? 'is-met' : 'is-missing');
    const tile = make('article', 'evolution-material ' + (model.owned >= model.required ? 'is-met' : 'is-missing'));
    const count = make('strong', 'evolution-material-count', `${number(model.owned)}/${number(model.required)}`);
    count.setAttribute('aria-label', `${number(model.owned)} owned, ${number(model.required)} required`);
    tile.append(artwork(model.material?.image, model.material?.name || model.recipe.itemId, model.material?.icon || '✦', 'evolution-material-art'), count, make('span', '', model.material?.name || model.recipe.itemId));
    ui.items.replaceChildren(tile);
    ui.status.textContent = message || model.reason || 'Ready. Uses 1 selected card and the materials shown.';
    ui.status.classList.toggle('is-error', Boolean(message || model.reason));
    ui.confirm.disabled = confirming || !model.canEvolve;
    ui.confirm.textContent = confirming ? 'Evolving…' : 'Evolve';
    ui.cancel.disabled = confirming; ui.close.disabled = confirming;
  }
  function close() {
    if (!selection || confirming) return;
    const previous = selection; selection = null;
    ui.root.classList.add('hidden');
    if (previous.parent) {
      previous.parent.inert = previous.inert;
      if (previous.ariaHidden === null) previous.parent.removeAttribute('aria-hidden');
      else previous.parent.setAttribute('aria-hidden', previous.ariaHidden);
    }
    host.document.body.classList.toggle('modal-open', Boolean(host.document.querySelector('.modal-backdrop:not(.hidden)')));
    if (previous.opener?.isConnected) previous.opener.focus({preventScroll:true});
  }
  function confirm() {
    if (confirming || !selection) return;
    const model = inspect(selection.baseId, selection.variantKey);
    if (!model?.canEvolve) { paint(); return; }
    confirming = true; ui.confirm.disabled = true;
    const variantKey = selection.variantKey;
    let result;
    try { result = evolve(model.recipe.id, variantKey); }
    catch(error) { result={ok:false,message:'Unable to evolve: '+error.message}; }
    finally { confirming = false; }
    if (!result.ok) { paint(result.message); return; }
    close(); bridge.onEvolved?.(model.recipe, model.mutations);
  }
  function mount() {
    if (ui) return true;
    const get = id => host.document.getElementById(id);
    const next = {root:get('evolutionModal'),base:get('evolutionBaseCard'),target:get('evolutionTargetCard'),mutation:get('evolutionMutation'),stats:get('evolutionStatChanges'),passiveName:get('evolutionPassiveName'),passive:get('evolutionPassiveDescription'),baseRequirement:get('evolutionBaseRequirement'),items:get('evolutionRequiredItems'),status:get('evolutionStatus'),confirm:get('evolutionConfirmButton'),cancel:get('evolutionCancelButton'),close:get('evolutionCloseButton')};
    if (Object.values(next).some(node => !node)) return false;
    ui = next; ui.confirm.addEventListener('click', confirm); ui.cancel.addEventListener('click', close); ui.close.addEventListener('click', close);
    ui.root.addEventListener('click', event => { if (event.target === ui.root) { event.stopImmediatePropagation(); close(); } }, true);
    host.document.addEventListener('keydown', event => {
      if (!selection) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close(); }
      else if (event.key === 'Tab') {
        const buttons = [...ui.root.querySelectorAll('button:not(:disabled)')], first = buttons[0], last = buttons.at(-1);
        if (!buttons.includes(host.document.activeElement) || event.shiftKey && host.document.activeElement === first || !event.shiftKey && host.document.activeElement === last) {
          event.preventDefault(); (event.shiftKey ? last : first)?.focus();
        }
      }
    }, true);
    return true;
  }
  function open(baseId, variantKey) {
    if (selection || !mount() || !bridge.canAct?.() || !inspect(baseId, variantKey)?.variant) return false;
    const parent = host.document.getElementById('cardPreviewModal');
    selection = {baseId, variantKey, parent, inert:parent?.inert || false, ariaHidden:parent?.getAttribute('aria-hidden') ?? null, opener:host.document.activeElement};
    paint(); bridge.open?.();
    if (ui.root.classList.contains('hidden')) { close(); return false; }
    ui.confirm.focus({preventScroll:true});
    if (ui.confirm.disabled) ui.cancel.focus({preventScroll:true});
    if (parent) { parent.inert = true; parent.setAttribute('aria-hidden','true'); }
    return true;
  }
  const recovered = recover(); register();
  host.EvolutionSystem=Object.freeze({KEY,RECIPES,MATERIALS,getBaseCardId,eligibilityLineage,recovered,validSave,recover,register,evolve,recipesFor,resultLevel,inspect,open,close,refresh:paint,get active(){return Boolean(selection);},get ready(){return Boolean(ui);},flush:()=>{try{return validSave(JSON.parse(host.localStorage.getItem(KEY)));}catch(_){return false;}},reset:()=>{host.localStorage.removeItem(KEY);recover();register();},configure:options=>{bridge=options||{};mount();}});
})(window);
