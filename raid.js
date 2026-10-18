/* Raid definitions, entry keys, exclusive coins, upgrades and durable rewards. */
(function (host) {
  'use strict';
  const KEY = 'anime_card_rng_raid_v1', MODE = 'raid';
  const KEY_ITEM = Object.freeze({ id: 'marine_fort_raid_key', name: 'Marine Ford Raid Key', type: 'ticket', icon: '🗝️', tier: 'epic', description: 'One Marine Ford Raid entry. 10% drop on regular 1v1 / 4v4 victories.' });
  const SECRET_IDS = Object.freeze(['raid-secret-ace', 'raid-secret-marco', 'raid-secret-mihawk']);
  const TYPES = Object.freeze({ marine_fort: Object.freeze({ name: 'Marine Ford Raid', keyId: KEY_ITEM.id,
    enemies: Object.freeze([
      ["starter-epic", 3000, 5000, 175, 300],
      ["buggy", 1750, 3000, 300, 500],
      ["ice-admiral", 3500, 5000, 350, 500],
      ["light-admiral", 2500, 4000, 700, 1000],
      ["garp", 7500, 10000, 500, 700],
      ["boa-hancock", 2500, 4000, 500, 600],
      ["doflamingo", 3000, 5000, 750, 1000],
      ["shanks", 4500, 6000, 1250, 2500],
      ["blackbeard", 6500, 8000, 900, 1200],
      ["whitebeard", 15000, 30000, 3000, 10000]
    ].map(row => Object.freeze(row))) }) });
  const SHOP = Object.freeze([{id:'web_string',cost:6220},{id:'cannon_ball',cost:3899}, ...['exp_potion', 'rich_potion', 'speed_potion', 'speed_battle_potion'].map(id => Object.freeze({ id, cost: id === 'speed_battle_potion' ? 50 : 25 }))]);
  const LEVEL_GROWTH = .075;
  const object = v => Boolean(v && typeof v === 'object' && !Array.isArray(v));
  const integer = (v, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(v) && v >= min && v <= max;
  const validType = type => Object.hasOwn(TYPES, type);
  const difficulty = n => Math.max(1, Math.min(1000, Math.floor(Number(n) || 1)));
  const randomUnit = random => Math.max(0, Math.min(1 - Number.EPSILON, Number(random()) || 0));
  const fresh = () => ({ version: 1, types: Object.fromEntries(Object.keys(TYPES).map(type => [type, { coins: 0, upgradeLevel: 0, wins: 0, difficulty: 1 }])), claimedSecrets: {}, activeAttempt: null, pendingReward: null });
  function coinRange(d) {
    const t = Math.pow((difficulty(d) - 1) / 999, .85);
    return { min: Math.round(1 + 69 * t), max: Math.round(1 + 99 * t) };
  }
  function secretChance(d) { return (1 + 9 * (difficulty(d) - 1) / 999) / 100; }
  function validAttempt(a) {
    return object(a) && typeof a.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(a.id) && validType(a.type) && integer(a.difficulty, 1, 1000) && integer(a.startedAt);
  }
  function validSave(v) {
    if (!object(v) || v.version !== 1 || !object(v.types) || !object(v.claimedSecrets)) return false;
    if (Object.keys(v.types).some(type => !validType(type)) || Object.keys(TYPES).some(type => !object(v.types[type]))) return false;
    for (const entry of Object.values(v.types)) if (!integer(entry.coins) || !integer(entry.wins) || !integer(entry.upgradeLevel, 0, 100) || !integer(entry.difficulty, 1, 1000)) return false;
    if (Object.entries(v.claimedSecrets).some(([id, flag]) => !SECRET_IDS.includes(id) || typeof flag !== 'boolean')) return false;
    if (v.activeAttempt !== null && !validAttempt(v.activeAttempt)) return false;
    const p = v.pendingReward;
    if (p === null) return true;
    if (!validAttempt(p) || !v.activeAttempt || p.id !== v.activeAttempt.id || p.type !== v.activeAttempt.type || p.difficulty !== v.activeAttempt.difficulty || p.startedAt !== v.activeAttempt.startedAt) return false;
    const range = coinRange(p.difficulty);
    if ('baseCoins' in p || 'dropMultiplier' in p) {
      if (!integer(p.baseCoins, range.min, range.max) || typeof p.dropMultiplier !== 'number' || !Number.isFinite(p.dropMultiplier) || p.dropMultiplier < 1 || p.dropMultiplier > host.InventorySystem.MAX_KNOWN_DROP_MULTIPLIER) return false;
      const exact = p.baseCoins * p.dropMultiplier;
      if (!integer(p.coins, Math.floor(exact), Math.ceil(exact))) return false;
    } else if (!integer(p.coins, range.min, range.max)) return false;
    return p.secret === null || (object(p.secret) && SECRET_IDS.includes(p.secret.cardId) && Array.isArray(p.secret.mutationIds) && p.secret.mutationIds.length <= 2 && new Set(p.secret.mutationIds).size === p.secret.mutationIds.length && p.secret.mutationIds.every(id => typeof id === 'string' && Object.hasOwn(host.MUTATION_BY_ID || {}, id)));
  }
  function load() { try { const v = JSON.parse(host.localStorage.getItem(KEY) || 'null'); return validSave(v) ? v : fresh(); } catch (_) { return fresh(); } }
  let data = load(), bridge = {}, serial = 0;
  if (!data.pendingReward) data.activeAttempt = null; // Interrupted fights never refund a spent key.
  function persist() { try { host.localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { console.warn('Raid save unavailable', e); return false; } }
  function requirePersist() { if (!persist()) throw new Error('Không thể lưu Raid. Thao tác chưa hoàn tất.'); }
  function registerKey() { host.InventorySystem.registerItem(KEY_ITEM); }
  registerKey(); persist();
  function commitPending() {
    const p = data.pendingReward;
    if (!p) return null;
    if (p.secret && bridge.grantSecret?.(p.secret) !== true) throw new Error('Chưa thể lưu thẻ Raid. Phần thưởng sẽ được khôi phục ở lần tải sau.');
    const previous = JSON.parse(JSON.stringify(data)), entry = data.types[p.type];
    const granted = Math.min(p.coins, Number.MAX_SAFE_INTEGER - entry.coins);
    entry.coins += granted; entry.wins = Math.min(Number.MAX_SAFE_INTEGER, entry.wins + 1);
    if (p.secret) data.claimedSecrets[p.secret.cardId] = true;
    data.pendingReward = null; data.activeAttempt = null;
    if (!persist()) { data = previous; throw new Error('Chưa thể lưu Raid Coins. Phần thưởng đang chờ khôi phục.'); }
    return { won: true, coins: granted, secret: p.secret, type: p.type, difficulty: p.difficulty, dropMultiplier: p.dropMultiplier || 1 };
  }
  function configure(options = {}) {
    bridge = options;
    for (const id of SECRET_IDS) if (bridge.hasSecret?.(id)) data.claimedSecrets[id] = true;
    persist();
    if (data.pendingReward) { try { commitPending(); } catch (e) { console.warn(e.message); } }
  }
  function canEnter(type = 'marine_fort') { return validType(type) && !data.pendingReward && host.InventorySystem.quantity(TYPES[type].keyId) >= 1; }
  function setDifficulty(type, value) {
    if (!validType(type) || data.activeAttempt) return false;
    const before = data.types[type].difficulty; data.types[type].difficulty = difficulty(value);
    if (persist()) return true; data.types[type].difficulty = before; return false;
  }
  function enemies(type = 'marine_fort', d = data.types[type]?.difficulty, random = Math.random) {
    if (!validType(type)) return [];
    const level = difficulty(d), scale = 1 + (level - 1) * LEVEL_GROWTH;
    return TYPES[type].enemies.map(([id, hpMin, hpMax, atkMin, atkMax]) => {
      const hp = hpMin + Math.floor(randomUnit(random) * (hpMax - hpMin + 1));
      const atk = atkMin + Math.floor(randomUnit(random) * (atkMax - atkMin + 1));
      const native = host.ALL_CARDS.find(card => card.id === id);
      if (!native) throw new Error('Thiếu thẻ boss Raid: ' + id);
      const stats = { hp: Math.round(hp * scale), atk: Math.round(atk * scale) };
      // Legacy passive helpers read card.stats; use this Raid-only level snapshot
      // so their ATK effects scale with the displayed boss, without editing CARDS.
      const card = { ...native, stats: { ...stats } };
      return { card, display: { name: card.name, image: card.image, ...stats }, mutations: [], hp: stats.hp, maxHp: stats.hp, atk: stats.atk, defeated: false, level, isRaidEnemy: true };
    });
  }
  function preview(type = 'marine_fort', d = data.types[type]?.difficulty) {
    if (!validType(type)) return [];
    const level = difficulty(d), scale = 1 + (level-1)*LEVEL_GROWTH;
    return TYPES[type].enemies.map(([id,h0,h1,a0,a1]) => ({ card:host.ALL_CARDS.find(c=>c.id===id), level, hpMin:Math.round(h0*scale),hpMax:Math.round(h1*scale),atkMin:Math.round(a0*scale),atkMax:Math.round(a1*scale) }));
  }
  function start(battle, type = 'marine_fort') {
    if (battle?.mode !== MODE || battle.playerTeam?.length !== 4 || battle.enemyTeam?.length !== 10 || !canEnter(type) || data.activeAttempt) throw new Error('Cần đội 4 thẻ và 1 Marine Ford Raid Key để vào Raid.');
    const previous = JSON.parse(JSON.stringify(data)), now = Date.now(), entry = data.types[type];
    const attempt = { id: `${now}_${++serial}`, type, difficulty: entry.difficulty, startedAt: now };
    data.activeAttempt = attempt;
    try { requirePersist(); if (!host.InventorySystem.remove(TYPES[type].keyId, 1)) throw new Error('Không thể tiêu Raid Key. Trận chưa bắt đầu.'); }
    catch (e) { data = previous; persist(); throw e; }
    battle.raid = { ...attempt, upgradeLevel: entry.upgradeLevel, completed: false };
    const multiplier = 1 + entry.upgradeLevel / 100;
    battle.playerTeam.forEach(unit => { unit.maxHp = Math.round(unit.maxHp * multiplier); unit.hp = unit.maxHp; unit.atk = Math.round(unit.atk * multiplier); Object.assign(unit.display, { hp: unit.maxHp, atk: unit.atk }); });
    return battle.raid;
  }
  function rollSecret(d, random = Math.random) {
    if (randomUnit(random) >= secretChance(d)) return null;
    const pick = randomUnit(random), cardId = SECRET_IDS[pick < .55 ? 0 : pick < .90 ? 1 : 2];
    // Owned results remain misses; never reweight the specified 55/35/10 split.
    if (data.claimedSecrets[cardId] || bridge.hasSecret?.(cardId)) return null;
    const mutationIds = (bridge.rollMutations?.() || []).map(m => typeof m === 'string' ? m : m.id);
    return { cardId, mutationIds };
  }
  function finish(battle, won, random = Math.random) {
    const run = battle?.raid;
    if (!run || run.completed) return null;
    if (won && ((battle.enemyTeam || []).length < 10 || battle.enemyTeam.some(u => !u.defeated && u.hp > 0))) return null;
    if (data.pendingReward) {
      if (data.pendingReward.id !== run.id) throw new Error('Có phần thưởng Raid đang chờ lưu.');
      const result = commitPending(); run.completed = true; return result;
    }
    if (!data.activeAttempt || data.activeAttempt.id !== run.id) return null;
    if (!won) { const previous = data.activeAttempt; data.activeAttempt = null; if (!persist()) { data.activeAttempt = previous; throw new Error('Không thể lưu kết quả Raid.'); } run.completed = true; return { won: false, coins: 0, secret: null, type: run.type, difficulty: run.difficulty }; }
    const range = coinRange(run.difficulty);
    const baseCoins = range.min + Math.floor(randomUnit(random) * (range.max - range.min + 1));
    data.pendingReward = { ...data.activeAttempt, baseCoins, dropMultiplier: host.InventorySystem.getDropMultiplier(), coins: host.InventorySystem.scaleDrop(baseCoins, random), secret: rollSecret(run.difficulty, random) };
    if (!persist()) { data.pendingReward = null; throw new Error('Không thể lưu phần thưởng Raid.'); }
    const result = commitPending(); run.completed = true; return result;
  }
  function abort(battle) { if (battle?.raid && !battle.raid.completed && !data.pendingReward) { try { finish(battle, false); } catch (e) { console.warn(e.message); } } }
  function rollKey(mode, random = Math.random) {
    if (!['1v1', '4v4'].includes(mode) || randomUnit(random) >= .10) return false;
    return host.InventorySystem.grant(KEY_ITEM.id, host.InventorySystem.scaleDrop(1, random));
  }
  function purchase(type, id) {
    const offer = SHOP.find(item => item.id === id), entry = data.types[type];
    if (!offer || !entry || data.pendingReward || entry.coins < offer.cost || host.InventorySystem.quantity(id) >= Number.MAX_SAFE_INTEGER) return false;
    entry.coins -= offer.cost;
    if (!persist()) { entry.coins += offer.cost; return false; }
    if (!host.InventorySystem.grant(id, 1)) { entry.coins += offer.cost; persist(); return false; } return true;
  }
  function upgradeCost(type) { return 5 + 5 * Math.floor((data.types[type]?.upgradeLevel || 0) / 10); }
  function upgrade(type) {
    const entry = data.types[type]; if (!entry || data.activeAttempt || data.pendingReward || entry.upgradeLevel >= 100 || entry.coins < upgradeCost(type)) return false;
    const cost = upgradeCost(type); entry.coins -= cost; entry.upgradeLevel++;
    if (persist()) return true; entry.coins += cost; entry.upgradeLevel--; return false;
  }
  function snapshot(type = 'marine_fort') { return { ...data.types[type] }; }
  function totalWins() { return Object.values(data.types).reduce((sum, entry) => Math.min(Number.MAX_SAFE_INTEGER, sum + entry.wins), 0); }
  function renderShop(grid, type, onChange = () => {}) {
    if (!grid || !validType(type)) return; grid.replaceChildren(); const doc = grid.ownerDocument, entry = data.types[type];
    for (const offer of SHOP) {
      const item = host.InventorySystem.getItem(offer.id), box = doc.createElement('article'); box.className = 'module-item';
      const name = doc.createElement('strong'); name.textContent = `${item.icon} ${item.name}`;
      const text = doc.createElement('p'); text.textContent = item.description;
      const button = doc.createElement('button'); button.type = 'button'; button.textContent = `${offer.cost} Marine Ford Coins`; button.disabled = entry.coins < offer.cost || Boolean(data.pendingReward);
      button.addEventListener('click', () => { if (purchase(type, offer.id)) onChange(); else host.alert('Không thể mua vật phẩm Raid.'); }); box.append(name, text, button); grid.append(box);
    }
    const box = doc.createElement('article'); box.className = 'module-item';
    const name = doc.createElement('strong'); name.textContent = `Team HP / ATK +${entry.upgradeLevel}%`;
    const text = doc.createElement('p'); text.textContent = 'Each upgrade adds 1% HP and ATK to your team inside Marine Ford Raid only. Maximum +100%.';
    const button = doc.createElement('button'); button.type = 'button'; button.textContent = entry.upgradeLevel >= 100 ? 'MAX +100%' : `Upgrade • ${upgradeCost(type)} Coins`; button.disabled = entry.upgradeLevel >= 100 || entry.coins < upgradeCost(type) || Boolean(data.activeAttempt);
    button.addEventListener('click', () => { if (upgrade(type)) onChange(); else host.alert('Không thể nâng cấp đội Raid.'); }); box.append(name, text, button); grid.append(box);
  }
  function reset() { data = fresh(); registerKey(); persist(); }
  host.RaidSystem = Object.freeze({ KEY, MODE, KEY_ITEM, SECRET_IDS, TYPES, SHOP, LEVEL_GROWTH, configure, validType, validSave, coinRange, secretChance, rollSecret, canEnter, setDifficulty, enemies, preview, start, finish, abort, rollKey, purchase, upgrade, upgradeCost, snapshot, totalWins, renderShop, reset, flush: persist });
})(window);
