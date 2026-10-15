/* General-purpose item storage. Compatible with file:// and legacy potion saves. */
(function (host) {
  'use strict';
  const KEY = 'anime_card_rng_items_v1';
  const DURATION_MS = 600000;
  const POTIONS = Object.freeze(Object.fromEntries(Object.entries({
    lucky_potion: { name: 'Lucky Potion', icon: '🍀', description: '+25% Luck for 10 minutes', stat: 'luck', bonus: .25 },
    speed_potion: { name: 'Speed Potion', icon: '⚡', description: '+10% Roll Speed for 10 minutes', stat: 'speed', bonus: .10 },
    rich_potion: { name: 'Rich Potion', icon: '💵', description: '+25% VNĐ earned for 10 minutes', stat: 'rich', bonus: .25 },
    exp_potion: { name: 'EXP Potion', icon: '✨', description: '+25% EXP earned for 10 minutes', stat: 'exp', bonus: .25 },
    speed_battle_potion: { name: 'Speed Battle Potion', icon: '⏱️', description: '1-second combat turns for 10 minutes outside Time Trial. Tower / Time Trial / Raid shops only.', stat: 'battleSpeed', bonus: 0, tier: 'epic', source: 'shop' }
  }).map(([id, item]) => [id, Object.freeze({ id, type: 'potion', tier: 'rare', ...item })])));
  // Preserve the original four-potion battle pool; exclusive items never enter it.
  const BATTLE_DROP_IDS = Object.freeze(['lucky_potion', 'speed_potion', 'rich_potion', 'exp_potion']);
  const definitions = new Map(Object.entries(POTIONS));
  const hasOwn = (object, id) => Object.prototype.hasOwnProperty.call(object, id);
  // Retired IDs must not reappear through generic items or older imports.
  const isRetired = id => typeof id === 'string' && id.toLowerCase() === 'vnd_potion';
  const safeId = id => typeof id === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(id) && !['__proto__', 'constructor', 'prototype'].includes(id) && !isRetired(id);
  function sanitizeSave(saved) {
    if (!saved || typeof saved !== 'object') return saved;
    const items = Array.isArray(saved.items)
      ? saved.items.filter(item => !isRetired(item?.id))
      : Object.fromEntries(Object.entries(saved.items || {}).filter(([id, item]) => !isRetired(id) && !isRetired(item?.id)));
    const buffs = Object.fromEntries(Object.entries(saved.buffs || {}).filter(([id]) => !isRetired(id)));
    return { ...saved, items, buffs };
  }
  const countOf = n => Number.isFinite(Number(n)) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(Number(n)))) : 0;
  function normalizeItem(id, raw = {}) {
    const entry = raw && typeof raw === 'object' ? raw : {}, base = definitions.get(id) || {};
    return { id, name: String(base.name ?? entry.name ?? id), description: String(base.description ?? entry.description ?? ''),
      type: String(base.type ?? entry.type ?? 'material').trim().toLowerCase() || 'material',
      icon: String(base.icon ?? entry.icon ?? '📦'), image: String(base.image ?? entry.image ?? ''),
      tier: String(base.tier ?? entry.tier ?? 'common').trim().toLowerCase(),
      quantity: countOf(typeof raw === 'number' || typeof raw === 'string' ? raw : entry.quantity ?? entry.count),
      metadata: entry.metadata && typeof entry.metadata === 'object' ? entry.metadata : {} };
  }
  function blank() { return { version: 2, items: Object.fromEntries(Object.keys(POTIONS).map(id => [id, normalizeItem(id)])), buffs: {}, misses: 0 }; }
  function read() {
    let saved;
    try { saved = sanitizeSave(JSON.parse(host.localStorage?.getItem(KEY) || 'null')); } catch (_) { saved = null; }
    const result = blank();
    if (saved && typeof saved === 'object') {
      const entries = Array.isArray(saved.items) ? saved.items.map(item => [item?.id, item]) : Object.entries(saved.items || {});
      for (const [id, raw] of entries) if (safeId(id)) result.items[id] = normalizeItem(id, raw);
      for (const id of Object.keys(POTIONS)) {
        const until = Number(saved.buffs?.[id]) || 0;
        if (Number.isFinite(until) && until > Date.now()) result.buffs[id] = until;
      }
      result.misses = Math.min(10, countOf(saved.misses));
    }
    return result;
  }
  let data = read();
  function persist() { try { host.localStorage?.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { console.warn('Inventory save unavailable', e); return false; } }
  persist(); // Migrate in place; card and tower saves are never rewritten here.
  function getItem(id, at = Date.now()) {
    if (!safeId(id) || !hasOwn(data.items, id)) return null;
    const entry = data.items[id];
    return { ...entry, metadata: { ...entry.metadata }, ...POTIONS[id], quantity: entry.quantity, until: data.buffs[id] || 0, remaining: Math.max(0, (data.buffs[id] || 0) - at), usable: hasOwn(POTIONS, id) };
  }
  function list() { return Object.keys(data.items).map(id => getItem(id)); }
  function quantity(id) { return safeId(id) && hasOwn(data.items, id) ? data.items[id].quantity || 0 : 0; }
  function registerItem(item) {
    if (!item || !safeId(item.id) || hasOwn(POTIONS, item.id)) return false;
    definitions.set(item.id, { ...item });
    data.items[item.id] = normalizeItem(item.id, { ...data.items[item.id], ...item, quantity: quantity(item.id) });
    persist(); return true;
  }
  function grant(id, count = 1, definition) {
    if (!safeId(id) || !Number.isFinite(Number(count)) || Number(count) < 1) return false;
    if (definition && !hasOwn(POTIONS, id)) registerItem({ ...definition, id });
    if (!hasOwn(data.items, id)) data.items[id] = normalizeItem(id);
    const before = quantity(id);
    data.items[id].quantity = Math.min(Number.MAX_SAFE_INTEGER, before + countOf(count));
    if (persist()) return true;
    data.items[id].quantity = before; return false;
  }
  function remove(id, count = 1) {
    const amount = countOf(count);
    if (amount < 1 || quantity(id) < amount) return false;
    data.items[id].quantity -= amount;
    if (persist()) return true;
    data.items[id].quantity += amount; return false;
  }
  function use(id) {
    if (!Object.prototype.hasOwnProperty.call(POTIONS, id) || quantity(id) < 1) return false;
    data.items[id].quantity -= 1;
    data.buffs[id] = Math.max(Date.now(), Number(data.buffs[id]) || 0) + DURATION_MS; persist(); return true;
  }
  function multiplier(stat, at = Date.now()) {
    for (const [id, potion] of Object.entries(POTIONS)) if (potion.stat === stat && Number(data.buffs[id]) > at) return 1 + potion.bonus;
    return 1;
  }
  function combatTurnMs(defaultMs = 3000, at = Date.now()) { return Number(data.buffs.speed_battle_potion) > at ? 1000 : defaultMs; }
  function tick(at = Date.now()) {
    let expired = false;
    for (const [id, until] of Object.entries(data.buffs)) if (until <= at) { delete data.buffs[id]; expired = true; }
    if (expired) persist(); return expired;
  }
  function dropChance(dropChancePercent = 0) {
    const playerStat = Math.max(0, Math.min(20, Number(dropChancePercent) || 0));
    return Math.min(.30, (.10 + data.misses * .02) + playerStat / 100);
  }
  function rollVictoryDrop(dropChancePercent = 0, random = Math.random) {
    const chance = dropChance(dropChancePercent);
    if (random() < chance) {
      const index = Math.max(0, Math.min(BATTLE_DROP_IDS.length - 1, Math.floor(random() * BATTLE_DROP_IDS.length)));
      const id = BATTLE_DROP_IDS[index]; grant(id, 1); data.misses = 0; persist();
      return { dropped: true, id, name: POTIONS[id].name, chance, pity: 0 };
    }
    data.misses = Math.min(10, data.misses + 1); persist(); return { dropped: false, id: null, chance, pity: data.misses };
  }
  function formatQuantity(n) {
    const amount = countOf(n);
    for (const [threshold, suffix] of [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']]) if (amount >= threshold) return `x${(Math.floor(amount / threshold * 100) / 100).toFixed(2).replace(/\.?0+$/, '')}${suffix}`;
    return `x${amount}`;
  }
  const renderStates = new WeakMap();
  const allowedTiers = new Set(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']);
  function renderGrid(grid, { search = '', category = 'all', onUse = () => {} } = {}) {
    if (!grid) return;
    const query = String(search).trim().toLowerCase();
    const items = list().filter(item => (category === 'all' || item.type === category) && `${item.name} ${item.description} ${item.id}`.toLowerCase().includes(query));
    const signature = JSON.stringify(items.map(({ remaining, until, ...item }) => item));
    const prior = renderStates.get(grid);
    if (!prior || prior.signature !== signature) {
      const doc = grid.ownerDocument, timers = new Map(); grid.replaceChildren();
      for (const item of items) {
        const card = doc.createElement('article'); card.className = `inventory-slot tier-${allowedTiers.has(item.tier) ? item.tier : 'common'}`; card.dataset.itemId = item.id;
        const visual = doc.createElement('div'); visual.className = 'inventory-slot-visual';
        const icon = doc.createElement('span'); icon.className = 'inventory-slot-icon'; icon.textContent = item.icon; visual.append(icon);
        if (item.image && /^(https?:\/\/|data:image\/(png|jpe?g|webp|gif);base64,|\.?\.?\/|[a-zA-Z0-9_-]+[/.])/.test(item.image)) {
          const img = doc.createElement('img'); img.src = item.image; img.alt = item.name; img.loading = 'lazy';
          img.addEventListener('load', () => { icon.hidden = true; }); img.addEventListener('error', () => { img.remove(); icon.hidden = false; }); visual.append(img);
        }
        const badge = doc.createElement('span'); badge.className = 'inventory-quantity'; badge.textContent = formatQuantity(item.quantity); badge.title = `${item.quantity.toLocaleString('en-US')} owned`; visual.append(badge);
        const type = doc.createElement('small'); type.className = 'inventory-item-type'; type.textContent = `${item.type} • ${item.tier}`;
        const name = doc.createElement('strong'); name.textContent = item.name;
        const description = doc.createElement('p'); description.textContent = item.description || 'Stored for future use.';
        const timer = doc.createElement('small'); timer.className = 'inventory-buff-timer'; timers.set(item.id, timer);
        card.append(visual, type, name, description, timer);
        if (item.usable) {
          const button = doc.createElement('button'); button.type = 'button'; button.textContent = 'Use Potion'; button.disabled = item.quantity < 1;
          button.addEventListener('click', () => { if (use(item.id)) onUse(item.id); }); card.append(button);
        } else {
          const label = doc.createElement('span'); label.className = 'inventory-stored-label'; label.textContent = 'Stored item'; card.append(label);
        }
        grid.append(card);
      }
      if (!items.length) { const empty = doc.createElement('p'); empty.className = 'inventory-empty'; empty.textContent = 'No items match your search.'; grid.append(empty); }
      renderStates.set(grid, { signature, timers });
    }
    for (const item of items) {
      const timer = renderStates.get(grid).timers.get(item.id); if (!timer) continue;
      const seconds = Math.ceil(item.remaining / 1000);
      timer.textContent = seconds > 0 ? `ACTIVE • ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : item.usable ? 'Not active' : 'Ready in storage';
      timer.classList.toggle('is-active', seconds > 0);
    }
  }
  function reset() { definitions.clear(); for (const [id, item] of Object.entries(POTIONS)) definitions.set(id, item); data = blank(); persist(); }
  host.InventorySystem = Object.freeze({ KEY, flush: persist, sanitizeSave, POTIONS, BATTLE_DROP_IDS, DURATION_MS, list, getItem, registerItem, quantity, grant, remove, use, multiplier, combatTurnMs, tick, dropChance, rollVictoryDrop, formatQuantity, renderGrid, reset, getPity: () => data.misses });
})(window);
