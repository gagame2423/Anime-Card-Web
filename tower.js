/* Self-contained infinite Tower progression, matchmaking and shop logic. */
(function (host) {
  'use strict';
  const KEY = 'anime_card_rng_tower_v1';
  const POTION_COST = 25;
  const SELECTION_VERSION = 5;
  const ENEMY_ELEMENTS = Object.freeze(Object.fromEntries(Object.entries({
    raining: ['Water'], snowing: ['Water', 'Nature'], sunny: ['Fire'], sugar: ['Electric'],
    reaper: ['Dark', 'Holy'], eclipse: ['Dark', 'Fire'], malevolent: ['Fire', 'Nature'],
    tsukuyomi: ['Dark'], mangekyo: ['Dark'], heavenly: ['Holy'], shadow: ['Dark', 'Electric'],
    lucky: ['Nature','Holy'], wind: ['Nature'], bizare: ['Dark','Electric']
  }).map(([id, elements]) => [id, Object.freeze(elements)])));
  const QUALITY_TIERS = Object.freeze([[1, 0], [26, 100], [51, 1000], [76, 10000], [101, 100000], [201, 500000], [301, 1000000], [501, 2000000]].map(Object.freeze));
  function minimumEnemyChance(floor) {
    return QUALITY_TIERS.reduce((minimum, [start, chance]) => floorNumber(floor) >= start ? chance : minimum, 0);
  }
  function copyEncounter(record) {
    return { ...record, lineup: record.lineup.map(slot => ({ ...slot, mutationIds: [...slot.mutationIds] })) };
  }
  const SHOP_ITEMS = Object.freeze([
    ...['lucky_potion', 'speed_potion', 'rich_potion', 'exp_potion'].map(id => Object.freeze({ id, cost: POTION_COST })),
    Object.freeze({ id: 'speed_battle_potion', cost: 100 })
  ]);
  // Number arithmetic overflow guard; no gameplay floor cap.
  const NUMERIC_STAT_LIMIT = Number.MAX_VALUE / 1024;
  const floorNumber = value => Number.isFinite(Number(value)) ? Math.max(1, Math.floor(Number(value))) : 1;
  const SCALING = Object.freeze({
    transitionFloor: 100, minionHpAt100: 40000,
    attackHpRatio: 0.20, maxAttackHpRatio: 0.25,
    earlyEliteFactor: 1.05, lateGrowthPerFloor: 0.015,
    lateMilestoneGrowth: 0.05
  });
  const protectedEnemies = new WeakSet();
  function limitEnemyAttack(unit, value) {
    if (!unit?.isTowerEnemy) return value;
    const ceiling = Math.max(1, Math.floor(unit.maxHp * SCALING.maxAttackHpRatio));
    return Math.max(1, Math.min(ceiling, Number(value) || 1));
  }
  function protectEnemyUnit(unit) {
    if (!unit || protectedEnemies.has(unit)) return unit;
    unit.isTowerEnemy = true;
    const boundedHp = value => Math.max(5, Math.min(NUMERIC_STAT_LIMIT, Number(value) || 5));
    let maxHp = boundedHp(unit.maxHp ?? unit.hp), atk = Number(unit.atk) || 1;
    // Getters/setters preserve the ratio during direct passive assignments,
    // including absorption, revival, clones and max-HP changes mid-turn.
    Object.defineProperties(unit, {
      maxHp: { enumerable: true, configurable: false, get: () => maxHp,
        set: value => { maxHp = boundedHp(value); atk = limitEnemyAttack(unit, atk); } },
      atk: { enumerable: true, configurable: false, get: () => limitEnemyAttack(unit, atk),
        set: value => { atk = limitEnemyAttack(unit, value); } }
    });
    atk = limitEnemyAttack(unit, atk);
    unit.hp = Math.min(maxHp, Math.max(0, Number(unit.hp) || 0));
    protectedEnemies.add(unit);
    return unit;
  }
  const DAMAGE_PER_VND = 10;
  const MAX_COINS = Number.MAX_SAFE_INTEGER;
  function fresh() { return { version: 1, coins: 0, cleared: {}, victories: 0, encounters: {} }; }
  function validMode(id) {
    return typeof id === 'string' && /^[a-z][a-z0-9-]*$/.test(id) && !['constructor', 'prototype', '__proto__'].includes(id);
  }
  function isEncounterRecord(record, mode = null) {
    const cards = host.ALL_CARDS || host.CARDS || [];
    const structural = Boolean(record && typeof record === 'object' && !Array.isArray(record) &&
      Number.isSafeInteger(record.floor) && record.floor >= 1 && Array.isArray(record.lineup) && record.lineup.length === 4 &&
      record.lineup.every(slot => slot && typeof slot === 'object' && !Array.isArray(slot) &&
        typeof slot.cardId === 'string' && cards.some(card => card.id === slot.cardId) &&
        Array.isArray(slot.mutationIds) && slot.mutationIds.length <= 2 &&
        new Set(slot.mutationIds).size === slot.mutationIds.length &&
        slot.mutationIds.every(id => typeof id === 'string' && Object.prototype.hasOwnProperty.call(host.MUTATION_BY_ID || {}, id))));
    if (!structural) return false;
    // Existing locked encounters survive the update until the floor is cleared.
    if (record.selectionVersion === undefined) return true;
    if (![2, 3, 4, SELECTION_VERSION].includes(record.selectionVersion)) return false;
    const allowed = mode && ENEMY_ELEMENTS[String(mode).toLowerCase()];
    const legacyNewType = record.selectionVersion < 4 && ['lucky','wind','bizare'].includes(String(mode).toLowerCase()) && record.element === null;
    if (record.element !== null && !host.ElementSystem.TYPES.includes(record.element)) return false;
    if (!legacyNewType && mode && (allowed ? !allowed.includes(record.element) : record.element !== null)) return false;
    return record.lineup.every(slot => {
      const card = cards.find(card => card.id === slot.cardId);
      const legacyWhitebeard = record.selectionVersion === 2 && slot.cardId === 'whitebeard' && record.element === 'Dark';
      return (!record.element || card.element === record.element || legacyWhitebeard) && Number.isSafeInteger(slot.selectionChance) &&
        (Number(card.chance) > 0 ? slot.selectionChance === Number(card.chance) : slot.selectionChance >= 100000 && slot.selectionChance <= 10000000);
    });
  }
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
    if (raw?.encounters && typeof raw.encounters === 'object' && !Array.isArray(raw.encounters)) {
      for (const [id, record] of Object.entries(raw.encounters)) {
        if (validMode(id) && isEncounterRecord(record, id) && record.floor === (result.cleared[id] || 0) + 1) {
          result.encounters[id] = copyEncounter(record);
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
  function describeType(mode, weathers = []) {
    const key=weatherId(mode), def=weatherDefinition(key,weathers), allowed=ENEMY_ELEMENTS[key];
    const mutation=weatherMutation(def);
    const player=key==='normal' || key==='infinite'
      ? 'Your team: any owned card or Mutation / Double Mutation. 4 cards required; floors continue infinitely.'
      : def ? `Your team: 4 owned cards native to ${def.name}, or variants with ${mutation?.name || def.mutationId || def.name} Mutation (Double Mutations count). Any Element meeting this weather rule is allowed.`
      : 'Your team: this type has no configured deployment rule; choose an available Tower type.';
    const enemies=allowed?.length===1 ? `Enemy team: all 4 opponents use ${allowed[0]}.`
      : allowed?.length ? `Enemy team: ${allowed.join(' OR ')}. One Element is chosen per floor; all 4 opponents share it, never a mixed team.`
      : 'Enemy team: all 6 Elements may appear; no single-Element lock. Higher floors filter out weaker cards.';
    const rewards=getFloorRewardCards(host.ALL_CARDS,key);
    const reward=rewards.length?`${rewards.map(card=>`Floor ${card.towerFloor || 100}: ${card.name}`).join(' • ')} • Normal Champion reward; future rolls require ${key==='normal'?'Normal weather':def?.name || key}.`:'Every 10 floors: Elite room. Tower Coins + damage-based VNĐ; no EXP.';
    return {player,enemies,reward};
  }
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
    const f = floorNumber(floor), role = boss ? 5 : 1;
    const depth = Math.max(0, f - SCALING.transitionFloor);
    const rawHp = f <= 100
      ? 100 * Math.pow(SCALING.minionHpAt100 / 100, (f - 1) / 99) * (isElite(f) ? SCALING.earlyEliteFactor : 1)
      : SCALING.minionHpAt100 * SCALING.earlyEliteFactor *
        (1 + SCALING.lateGrowthPerFloor * depth + SCALING.lateMilestoneGrowth * Math.floor(depth / 10));
    const hp = Math.max(5, Math.round(Math.min(NUMERIC_STAT_LIMIT, rawHp * role)));
    // One HP curve drives both stats; ATK can never compound faster than HP.
    return { hp, atk: Math.max(1, Math.floor(hp * SCALING.attackHpRatio)) };
  }
  function damageSummary(battleState) {
    const bounded = n => Math.min(NUMERIC_STAT_LIMIT, Math.max(0, Number(n) || 0));
    const player = bounded(battleState?.damageTotals?.player);
    const enemy = bounded(battleState?.damageTotals?.enemy);
    return { player, enemy, total: bounded(player + enemy) };
  }
  function battleCurrency(totalDamage) {
    const damage = Math.max(0, Number(totalDamage) || 0);
    return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(damage / DAMAGE_PER_VND));
  }
  function rarityRank(card) { return ({ Common: 0, Rare: 1, Epic: 2, Legendary: 3, Mythic: 4, Secret: 5 })[card?.rarity] ?? 0; }
  function sample(pool, random) { return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))] || null; }
  function buildTrialOpponents(cards, floor, mode = 'normal', weathers = [], random = Math.random) {
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
      result.push(protectEnemyUnit({ card, mutations, display, hp: stats.hp, maxHp: stats.hp, atk: stats.atk, defeated: false, level: floorNumber(floor), towerRole: boss ? 'boss' : 'minion', isTowerEnemy: true }));
    }
    return result;
  }
  function buildOpponents(cards, floor, mode = 'normal', weathers = [], random = Math.random) {
    const all = (cards || []).filter(card => card && host.ElementSystem.of(card));
    if (!all.length) return [];
    const allowed = ENEMY_ELEMENTS[weatherId(mode)];
    const element = allowed ? sample(allowed, random) : null;
    const themed = all.filter(card => !element || card.element === element);
    if (!themed.length) return []; // Never leak another element through a fallback.
    const candidates = themed.map(card => ({ card, chance: Number(card.chance) > 0 ? Number(card.chance)
      : 100000 + Math.min(9900000, Math.floor(Math.max(0, random()) * 9900001)) }));
    // If a future/small element pool cannot reach the floor threshold, use
    // its strongest available candidates without unlocking another element.
    const minimum = Math.min(minimumEnemyChance(floor), Math.max(...candidates.map(entry => entry.chance)));
    const qualified = candidates.filter(entry => entry.chance >= minimum);
    const used = new Set();
    return Array.from({ length: 4 }, (_, slot) => {
      const boss = slot === 3;
      // High floors must not collapse to one Legendary minion (e.g. Noelle).
      // Every qualified card can appear in any role. Boss slots favor higher
      // rarity gently, without excluding Secret / unrollable cards elsewhere.
      const unused = qualified.filter(entry => !used.has(entry.card.id));
      const source = unused.length ? unused : qualified;
      const rolePool = source.map(entry => ({...entry, weight:
        Math.pow(entry.chance, -.15) * (boss ? 1 + .25 * rarityRank(entry.card) : 1)}));
      const total = rolePool.reduce((sum,entry)=>sum+entry.weight,0);
      let draw = Math.max(0,Math.min(1-Number.EPSILON,Number(random())||0))*total;
      let selected=rolePool[rolePool.length-1];
      for(const entry of rolePool){draw-=entry.weight;if(draw<0){selected=entry;break;}}
      const card=selected.card;used.add(card.id);
      const matchingMutation = weatherMutation(weatherDefinition(mode, weathers));
      const mutations = weatherId(mode) !== 'normal' && matchingMutation && random() < .75 ? [matchingMutation] : [];
      const stats = floorStats(floor, boss);
      return protectEnemyUnit({ card, mutations, display: { name: card.name, image: card.image, ...stats, rarity: card.rarity },
        hp: stats.hp, maxHp: stats.hp, atk: stats.atk, defeated: false, level: floorNumber(floor),
        towerRole: boss ? 'boss' : 'minion', isTowerEnemy: true, floorElement: element, selectionChance: selected.chance });
    });
  }
  function getOpponents(cards, floor, mode = 'normal', weathers = [], random = Math.random) {
    const id = weatherId(mode), f = floorNumber(floor);
    if (!validMode(id)) return [];
    if (f !== nextFloor(id)) return buildOpponents(cards, f, id, weathers, random);
    let record = data.encounters[id];
    // Upgrade these three newly constrained types once. Keep an already-valid
    // composition; regenerate an incompatible legacy floor, then lock it again.
    if (record && record.selectionVersion < 4 && ['lucky','wind','bizare'].includes(id)) {
      const elements=new Set(record.lineup.map(slot=>cards.find(card=>card.id===slot.cardId)?.element));
      const element=[...elements][0];
      if(elements.size===1 && ENEMY_ELEMENTS[id].includes(element)) {
        for(const slot of record.lineup){const card=cards.find(card=>card.id===slot.cardId);slot.selectionChance ||= Number(card.chance)>0?Number(card.chance):1000000;}
        record.element=element;record.selectionVersion=SELECTION_VERSION;persist();
      } else record=null;
    }
    if (!record || record.floor !== f || !isEncounterRecord(record, id) || record.lineup.some(slot => !cards.some(card => card.id === slot.cardId))) {
      const generated = buildOpponents(cards, f, id, weathers, random);
      if (generated.length !== 4) return generated;
      record = { floor: f, selectionVersion: SELECTION_VERSION, element: generated[0].floorElement, lineup: generated.map(unit => ({ cardId: unit.card.id, selectionChance: unit.selectionChance, mutationIds: unit.mutations.map(mutation => mutation.id) })) };
      data.encounters[id] = record;
      persist();
    }
    // Persist only composition. Every attempt receives clean unit objects,
    // full baseline HP and no previous damage, statuses, revivals or clones.
    return record.lineup.map((slot, index) => {
      const card = cards.find(candidate => candidate.id === slot.cardId);
      const mutations = slot.mutationIds.map(mutationId => ({ ...host.MUTATION_BY_ID[mutationId] }));
      const stats = floorStats(f, index === 3);
      return protectEnemyUnit({ card, mutations,
        display: { name: card.name, image: card.image, hp: stats.hp, atk: stats.atk, rarity: card.rarity },
        hp: stats.hp, maxHp: stats.hp, atk: stats.atk, defeated: false,
        level: f, towerRole: index === 3 ? 'boss' : 'minion', isTowerEnemy: true, floorElement: record.element ?? null, selectionChance: slot.selectionChance });
    });
  }
  function previewRewards(floor) {
    const f = floorNumber(floor);
    let min, max;
    if (isElite(f) && f >= 100) {
      min = f === 100 ? 80 : 90 + (f - 100);
      max = min + 10;
    } else if (f > 100) {
      min = 24 + 2 * Math.floor((f - 101) / 5);
      max = min + 4;
    } else {
      const base = 4 + Math.floor((f - 1) / 6);
      const multiplier = isElite(f) ? 3 : 1;
      const bonus = isElite(f) ? 10 + Math.floor(f / 10) : 0;
      min = base * multiplier + bonus; max = (base + 2) * multiplier + bonus;
    }
    return { min: Math.min(MAX_COINS, min), max: Math.min(MAX_COINS, max) };
  }
  function recordVictory(mode, floor, random = Math.random) {
    const id = weatherId(mode), expected = nextFloor(id);
    if (!Number.isInteger(floor) || floor !== expected) return { awarded: false, coins: 0 };
    const rewards = previewRewards(floor);
    const baseCoins = rewards.min + Math.floor(random() * (rewards.max - rewards.min + 1));
    const coins = host.InventorySystem.scaleDrop(baseCoins, random);
    const granted = Math.min(coins, Math.max(0, MAX_COINS - data.coins));
    data.coins += granted; data.cleared[id] = floor; data.victories += 1;
    delete data.encounters[id]; persist();
    return { awarded: true, coins: granted, unlockRequirement: floor >= 100 ? rewardRequirement(id) : null, nextFloor: nextFloor(id), completed: completed(id), elite: isElite(floor) };
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
    return (cards || []).filter(card => card?.towerType===weatherId(mode) && /^tower_floor_/.test(card.unlockRequirement || '')).sort((a,b)=>(a.towerFloor||100)-(b.towerFloor||100));
  }
  function reset() { data = fresh(); persist(); }
  host.TowerSystem = Object.freeze({ KEY, flush: persist, POTION_COST, SHOP_ITEMS, SCALING, ENEMY_ELEMENTS, QUALITY_TIERS, SELECTION_VERSION, minimumEnemyChance, protectEnemyUnit, limitEnemyAttack, DAMAGE_PER_VND, damageSummary, battleCurrency, rewardRequirement, getProgressSnapshot, getFloorRewardCards, nextFloor, completed, isElite, weatherList, describeType, matchWeather, eligiblePlayerCard, floorStats, buildOpponents, buildTrialOpponents, getOpponents, isEncounterRecord, validMode, previewRewards, recordVictory, purchasePotion, reset, get coins() { return data.coins; }, get victories() { return data.victories; }, getProgress: mode => data.cleared[weatherId(mode)] || 0 });
})(window);
