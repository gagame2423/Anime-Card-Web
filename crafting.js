/* Crafting selector + detail panel. Inventory owns the atomic 10-to-1 transaction. */
(function (host) {
  'use strict';
  let bridge = {}, ui = null, selected = '', query = '', catalog = [];
  const setText = (node, value) => { if (node && node.textContent !== String(value)) node.textContent = String(value); };
  const count = value => Number(value || 0).toLocaleString('en-US');
  const make = (tag, className = '', text) => {
    const node = host.document.createElement(tag); node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function recipes() {
    const potions = Object.entries(host.InventorySystem?.SUPER_BASE || {}).map(([id, baseId]) => ({
      id, cost: 0, ingredients: [{ id: baseId, quantity: 10 }]
    }));
    return [...potions,...(host.EquipmentSystem?.RECIPES || [])];
  }
  function relatedCards(itemId) {
    return (host.EvolutionSystem?.RECIPES || []).filter(recipe => recipe.itemId === itemId).map(recipe => ({
      base: host.ALL_CARDS?.find(card => card.id === recipe.baseId),
      result: host.ALL_CARDS?.find(card => card.id === recipe.id), level: recipe.level
    })).filter(link => link.base || link.result);
  }
  function buildCatalog() {
    const inventory = host.InventorySystem;
    // A registered recipe is the only source of craftable output. Shop-only
    // materials remain in Storage/Evolution and never become crafting tiles.
    return recipes().filter(recipe => (recipe.ingredients.length || recipe.cards?.length) && recipe.ingredients.every(
      ingredient => inventory?.getItem(ingredient.id) && ingredient.quantity > 0
    ) && (recipe.cards || []).every(card=>host.ALL_CARDS.some(c=>c.id===card.cardId))).map(recipe => ({ item: inventory?.getItem(recipe.id), recipe })).filter(entry => entry.item);
  }
  function visual(item, className = '') {
    const box = make('div', 'crafting-visual ' + className);
    const potion = host.InventorySystem?.POTIONS[item.id];
    const icon = potion ? make('span', 'potion-bottle' + (host.InventorySystem.SUPER_BASE[item.id] ? ' is-super' : '')) : make('span', 'crafting-icon crafting-monogram', item.name.split(/\s+/).map(word => word[0]).slice(0,3).join(''));
    if(potion)icon.dataset.potionStat=potion.stat;icon.setAttribute('aria-hidden','true');box.append(icon);
    if (item.image) {
      const image = make('img'); image.src = item.image; image.alt = item.name; image.loading = 'lazy';
      image.addEventListener('load', () => { icon.hidden = true; }, { once: true });
      image.addEventListener('error', () => { image.remove(); icon.hidden = false; }, { once: true });
      box.append(image);
    }
    return box;
  }
  function allowed() { return !host.SandboxSystem?.active && bridge.canAct?.() !== false; }
  function filtered() { return catalog.filter(({ item }) => `${item.name} ${item.description}`.toLowerCase().includes(query)); }
  function renderGrid() {
    if (!ui) return;
    const entries = filtered(); ui.grid.replaceChildren(); ui.tiles.clear();
    if (!entries.some(entry => entry.item.id === selected)) selected = entries[0]?.item.id || '';
    for (const { item, recipe } of entries) {
      const tile = make('button', 'crafting-tile' + (selected === item.id ? ' is-selected' : ''));
      tile.type = 'button'; tile.dataset.craftItem = item.id; tile.setAttribute('aria-pressed', String(selected === item.id));
      const owned = make('small', 'crafting-tile-owned');
      tile.append(visual(item), make('strong', '', item.name), make('small', 'crafting-tile-type', recipe ? 'CRAFTABLE' : 'EVOLUTION MATERIAL'), owned);
      ui.grid.append(tile); ui.tiles.set(item.id, { tile, owned });
    }
    if (!entries.length) ui.grid.append(make('p', 'crafting-empty', 'No items match your search.'));
    renderDetails(); refresh();
  }
  function renderDetails() {
    if (!ui) return;
    const entry = catalog.find(entry => entry.item.id === selected);
    ui.related.replaceChildren(); ui.ingredients.replaceChildren(); ui.requirements.clear(); ui.cardRequirements.clear(); ui.visual.replaceChildren();
    if (!entry) {
      setText(ui.title, 'Select an item'); setText(ui.category, ''); setText(ui.description, 'Search or choose an item from the grid.');
      setText(ui.owned, ''); setText(ui.status, ''); setText(ui.cost, '0 VNĐ'); ui.craft.disabled = true; return;
    }
    const { item, recipe } = entry;
    ui.visual.append(visual(item, 'crafting-detail-icon'));
    setText(ui.title, item.name); setText(ui.category, item.type==='equipment' ? 'Equipment · one active slot' : recipe ? 'Consumable · Super Potion' : 'Evolution Material');
    setText(ui.description, item.description);
    // Consumables deliberately leave Related Card blank.
    for (const link of item.type === 'material' ? relatedCards(item.id) : []) {
      const box = make('article', 'crafting-related-card');
      const base = link.base || link.result;
      const art = make('img'); art.src = base.image; art.alt = base.name; art.loading = 'lazy';
      art.addEventListener('error', () => { art.remove(); }, { once: true });
      box.append(art, make('strong', '', base.name));
      if (link.result) box.append(make('small', '', `Lv.${link.level}+ → ${link.result.name}`));
      ui.related.append(box);
    }
    for (const ingredient of recipe?.ingredients || []) {
      const material = host.InventorySystem.getItem(ingredient.id);
      if (!material) continue;
      const card = make('article', 'crafting-ingredient');
      const amount = make('strong', 'crafting-ingredient-count');
      card.append(amount, visual(material), make('span', '', material.name));
      ui.ingredients.append(card); ui.requirements.set(ingredient.id, { card, amount, needed: ingredient.quantity });
    }
    for(const [index,requirement] of (recipe?.cards || []).entries()){
      const card=host.ALL_CARDS.find(card=>card.id===requirement.cardId);if(!card)continue;
      const box=make('article','crafting-card-ingredient'),label=make('strong','',card.name),amount=make('span','crafting-card-amount');
      const names=requirement.mutationIds.map(id=>host.MUTATION_BY_ID[id]?.name||id);
      const condition=make('small','',names.length?names.join(' + ')+(requirement.match==='contains'?' · Double Mutation allowed':' · exact pair, either order'):'Normal only · no Mutations');
      const select=make('select','crafting-card-variant');select.setAttribute('aria-label','Consumed variant of '+card.name);
      box.append(visual({name:card.name,image:card.image}),label,condition,amount,select);ui.ingredients.append(box);
      ui.cardRequirements.set(index,{box,amount,select,signature:''});
      select.addEventListener('change',()=>{ui.choices[index]=select.value;refresh();});
    }
    setText(ui.cost, recipe ? `${count(recipe.cost)} VNĐ` : 'Shop item');
    setText(ui.status, recipe?.cards ? 'Consumes the selected card variants and listed VNĐ. Equip the result from Storage → Equipment.' : recipe ? '10 regular potions → 1 Super Potion. No VNĐ fee.' : 'This material is obtained from its listed shop; no crafting recipe is currently available.');
    ui.craft.title = recipe ? 'Craft one item' : 'Obtain this material from its shop.';
  }
  function refresh() {
    if (!ui || ui.root.classList.contains('hidden')) return;
    const inventory = host.InventorySystem;
    for (const [id, tile] of ui.tiles) setText(tile.owned, `Owned: ${count(inventory.quantity(id))}`);
    const entry = catalog.find(entry => entry.item.id === selected);
    if (!entry) return;
    setText(ui.owned, `Owned: ${count(inventory.quantity(selected))}`);
    for (const [id, requirement] of ui.requirements) {
      const amount = inventory.quantity(id);
      setText(requirement.amount, `${count(amount)}/${requirement.needed}x`);
      requirement.card.classList.toggle('is-missing', amount < requirement.needed);
    }
    let canCraft = Boolean(entry.recipe) && entry.recipe.ingredients.every(item => inventory.quantity(item.id) >= item.quantity);
    if(entry.recipe?.cards){
      const preview=host.EquipmentSystem.inspect(selected,ui.choices);
      for(const [index,part] of preview.requirements.entries()){
        const row=ui.cardRequirements.get(index);if(!row)continue;
        const key=JSON.stringify(part.variants.map(v=>[v.key,v.count]));
        if(row.signature!==key){row.signature=key;row.select.replaceChildren();
          for(const variant of part.variants){const option=make('option','',(variant.mutations.map(m=>m.name).join(' + ')||'Normal')+' · x'+count(variant.count));option.value=variant.key;row.select.append(option);}
          if(!part.variants.length){row.select.append(make('option','','No matching variant owned'));row.select.disabled=true;}else row.select.disabled=false;
        }
        if(part.selected){row.select.value=part.selected.key;ui.choices[index]=part.selected.key;}else delete ui.choices[index];
        setText(row.amount,(part.selected?.count||0)+' / '+part.requirement.quantity+'x');row.box.classList.toggle('is-missing',!part.selected);
      }
      canCraft=preview.canCraft;
      setText(ui.cost,count(entry.recipe.cost)+' VNĐ · You have '+count(preview.money));
    }
    ui.craft.disabled = !canCraft || !allowed();
  }
  function mount(root) {
    if (!root) return false;
    root = root.closest?.('#craftingModal') || root;
    if (ui?.root === root) return true;
    const select = name => root.querySelector(`[data-crafting-${name}]`);
    const next = { root, grid: select('grid'), search: select('search'), visual: select('visual'), title: select('title'),
      category: select('category'), description: select('description'), owned: select('owned'), related: select('related'),
      ingredients: select('ingredients'), craft: select('craft'), cost: select('cost'), status: select('status'), tiles: new Map(), requirements: new Map(), cardRequirements: new Map(), choices: {} };
    if (Object.values(next).some(value => value === null)) return false;
    ui = next;
    ui.search.addEventListener('input', () => { query = ui.search.value.trim().toLowerCase(); renderGrid(); });
    ui.grid.addEventListener('click', event => {
      const button = event.target.closest('[data-craft-item]'); if (!button) return;
      selected = button.dataset.craftItem; ui.choices={};
      for (const [id, { tile }] of ui.tiles) { tile.classList.toggle('is-selected', id === selected); tile.setAttribute('aria-pressed', String(id === selected)); }
      renderDetails(); refresh();
    });
    ui.craft.addEventListener('click', () => {
      const entry = catalog.find(entry => entry.item.id === selected);
      if (!entry?.recipe || !allowed()) return;
      if(entry.recipe.cards){const result=host.EquipmentSystem.craft(selected,ui.choices);setText(ui.status,result.message);refresh();if(result.ok)bridge.onChange?.();return;}
      if (!host.InventorySystem.craft(selected)) { setText(ui.status, 'Unable to craft. Check ingredients and save storage.'); refresh(); return; }
      setText(ui.status, `Crafted 1 × ${entry.item.name}.`); refresh(); bridge.onChange?.();
    });
    return true;
  }
  function open(root) {
    if (!mount(root)) return false;
    catalog = buildCatalog(); query = ''; ui.choices={}; ui.search.value = ''; renderGrid(); return true;
  }
  host.CraftingSystem = Object.freeze({ open, render: open, refresh, recipes, relatedCards, configure: options => { bridge = options || {}; } });
})(window);
