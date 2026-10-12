/* Self-contained infinite Tower progression, matchmaking and shop logic. */
(function (host) {
  'use strict';
  const KEY = 'anime_card_rng_tower_v1';
  const POTION_COST = 25;
  const SHOP_ITEMS = Object.freeze([
    ...['lucky_potion', 'speed_potion', 'rich_potion', 'exp_potion'].map(id => Object.freeze({ id, cost: POTION_COST })),
    Object.freeze({ id: 'speed_battle_potion', cost: 100 })
  ]);
  // Number arithmetic overflow guard; no gameplay floor cap.
  const NUMERIC_STAT_LIMIT = Number.MAX_VALUE / 1024;
  const floorNumber = value => Number.isFinite(Number(value)) ? Math.max(1, Math.floor(Number(value))) : 1;
  const hpFactor = 1.055;
  const atkFactor = 1.05;
  function fresh() { return { version: 1, coins: 0, cleared: {}, victories: 0 }; }
  function load() {
    let raw;
    try { raw = JSON.parse(host.localStorage?.getItem(KEY) || 'null'); } catch (_) { raw = null; }
    const result = fresh();
    if (raw && typeof raw === 'object') {
      result.coins = Math.max(0, Math.floor(Number(raw.coins) || 0));
      result.victories = Math.max(0, Math.floor(Number(raw.victories) || 0));
      if (raw.cleared && typeof raw.cleared === 'object') {
        for (const [id, n] of Object.entries(raw.cleared)) {
          if (/^(normal|[a-z][a-z0-9-]*)$/.test(id)) result.cleared[id] = Number.isFinite(Number(n)) ? Math.max(0, Math.floor(Number(n))) : 0;
        }
      }
    }
    return result;
  }
  let data = load();
  function persist() { try { host.localStorage?.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { console.warn('Tower save unavailable', e); return false; } }
  const weatherId = mode => String(mode || 'normal').trim().toLowerCase();
  function nextFloor(mode = 'normal') { return (data.cleared[weatherId(mode)] || 0) + 1; }
  function completed() { return false; } // Compatibility: infinite towers never complete.
  function isElite(floor) { return floor >= 1 && floor % 10 === 0; }
  function weatherList(weathers) { return [{ id: 'normal', name: 'Normal Tower' }, ...(weathers || []).filter(w => w && w.id).map(w => ({ id: weatherId(w.id), name: `${w.name} Tower` }))]; }
  const aliases = { blizzard: 'frost', sacrifice: 'eclipsed' };
  function tokens(value) {
    if (Array.isArray(value)) return value.flatMap(tokens);
    if (value && typeof value === 'object') return tokens([value.id, value.name]);
    if (value == null) return [];
    return String(value).split(/[+,|]/).map(x => x.trim().toLowerCase()).filter(Boolean).map(x => aliases[x] || x);
  }
  function weatherDefinition(mode, weathers) {
    const id = weatherId(mode);
    return (weathers || []).find(w => tokens([w?.id, w?.name]).includes(id));
  }
  function weatherMutation(def) {
    return def?.mutation || host.MUTATION_BY_ID?.[def?.mutationId] ||
      (host.MUTATIONS || []).find(m => m.id === def?.mutationId) ||
      (def?.mutationId ? { id: def.mutationId, name: def.mutationId } : null);
  }
  function matchWeather(card, mutations, mode, weathers) {
    if (weatherId(mode) === 'normal') return true;
    const def = weatherDefinition(mode, weathers);
    if (!def) return false;
    const matching = new Set(tokens([def.id, def.name, def.mutationId, weatherMutation(def)]));
    if (tokens([card?.requiredWeather, card?.requiredWeathers, card?.nativeWeather]).some(id => matching.has(id))) return true;
    return tokens(mutations).some(id => matching.has(id));
  }
  function eligiblePlayerCard(card, variant, mode, weathers) {
    // An empty mutations array must not mask legacy mutationIds/mutation fields.
    const mutations = variant && typeof variant === 'object' && !Array.isArray(variant)
      ? [variant.mutations, variant.mutationIds, variant.mutation] : variant;
    return Boolean(card) && matchWeather(card, mutations, mode, weathers);
  }
  function floorStats(floor, boss = false) {
    const f = floorNumber(floor);
    const elite = isElite(f);
    return { hp: Math.max(1, Math.round(Math.min(NUMERIC_STAT_LIMIT, (boss ? 500 : 100) * Math.pow(hpFactor, f - 1) * (elite ? 1.18 : 1)))), atk: Math.max(1, Math.round(Math.min(NUMERIC_STAT_LIMIT, (boss ? 50 : 10) * Math.pow(atkFactor, f - 1) * (elite ? 1.18 : 1)))) };
  }
  function rarityRank(card) { return ({ Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4, Secret: 5 })[card?.rarity] ?? 0; }
  function sample(pool, random) { return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))] || null; }
  function buildOpponents(cards, floor, mode = 'normal', weathers = [], random = Math.random) {
    const all = (cards || []).filter(card => card && !card.unlockRequirement && String(card.id).toLowerCase() !== 'griffith');
    if (!all.length) return [];
    const eligible = all.filter(card => matchWeather(card, [], mode, weathers));
    const nonEliteMinions = all.filter(card => rarityRank(card) <= 3);
    const highRank = all.filter(card => rarityRank(card) >= 3);
    const elites = all.filter(card => rarityRank(card) >= 4);
    const result = [];
    for (let slot = 0; slot < 4; slot++) {
      const boss = slot === 3;
      const elite = isElite(floor);
      const base = elite ? (elites.length ? elites : highRank) : boss ? (highRank.length ? highRank : all) : (nonEliteMinions.length ? nonEliteMinions : all);
      const sourcePool = base.length ? base : all;
      const matchingPool = sourcePool.filter(card => eligible.includes(card));
      // At most 75% weather-matched cards in a weather tower; 25% samples from base pool.
      const pool = weatherId(mode) !== 'normal' && matchingPool.length && random() < .75 ? matchingPool : sourcePool;
      const card = sample(pool, random);
      const matchingMutation = weatherMutation(weatherDefinition(mode, weathers));
      const mutations = weatherId(mode) !== 'normal' && matchingMutation && random() < .75 ? [matchingMutation] : [];
      const stats = floorStats(floor, boss);
      const display = { name: card.name, image: card.image, hp: stats.hp, atk: stats.atk, rarity: card.rarity };
      result.push({ card, mutations, display, hp: stats.hp, maxHp: stats.hp, atk: stats.atk, defeated: false, level: floorNumber(floor), towerRole: boss ? 'boss' : 'minion', isTowerEnemy: true });
    }
    return result;
  }
  function previewRewards(floor) { const f = floorNumber(floor); return { min: 3 + Math.floor((f - 1) / 6) + (isElite(f) ? 10 + Math.floor(f / 10) : 0), max: 5 + Math.floor((f - 1) / 6) + (isElite(f) ? 10 + Math.floor(f / 10) : 0) }; }
  function recordVictory(mode, floor, random = Math.random) {
    const id = weatherId(mode), expected = nextFloor(id);
    if (!Number.isInteger(floor) || floor !== expected) return { awarded: false, coins: 0 };
    const rewards = previewRewards(floor);
    const coins = rewards.min + Math.floor(random() * (rewards.max - rewards.min + 1));
    data.coins += coins; data.cleared[id] = floor; data.victories += 1; persist();
    return { awarded: true, coins, unlockRequirement: floor >= 100 ? rewardRequirement(id) : null, nextFloor: nextFloor(id), completed: completed(id), elite: isElite(floor) };
  }
  function purchasePotion(id, inventory) {
    const offer = SHOP_ITEMS.find(item => item.id === id);
    if (!offer || !inventory?.POTIONS?.[id] || data.coins < offer.cost) return false;
    if (!inventory.grant(id, 1)) return false;
    data.coins -= offer.cost; persist(); return true;
  }
  function rewardRequirement(mode) { return `tower_floor_100_${weatherId(mode)}`; }
  function getProgressSnapshot() { return { ...data.cleared }; }
  function getFloorRewardCards(cards, mode) {
    return (cards || []).filter(card => card?.unlockRequirement === rewardRequirement(mode));
  }
  function reset() { data = fresh(); persist(); }
  host.TowerSystem = Object.freeze({ KEY, flush: persist, POTION_COST, SHOP_ITEMS, rewardRequirement, getProgressSnapshot, getFloorRewardCards, nextFloor, completed, isElite, weatherList, matchWeather, eligiblePlayerCard, floorStats, buildOpponents, previewRewards, recordVictory, purchasePotion, reset, get coins() { return data.coins; }, get victories() { return data.victories; }, getProgress: mode => data.cleared[weatherId(mode)] || 0 });
})(window);
