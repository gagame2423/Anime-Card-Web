/* Time Trial rules, persistent progression, timed attempts, rewards and shop. */
(function (host) {
  'use strict';
  const KEY = 'anime_card_rng_timetrial_v1';
  const MODES = Object.freeze({ normal: 'time-trial', exp: 'exp-time-trial' });
  const TURN_MS = 2000;
  const LIMITS = Object.freeze({ [MODES.normal]: 180000, [MODES.exp]: 300000 });
  const TICKET_ID = 'exp_time_trial_ticket';
  const TICKET = Object.freeze({ id: TICKET_ID, name: 'EXP Time Trial Ticket', type: 'ticket',
    icon: '🎟️', tier: 'epic', description: 'One entry to the 5-minute EXP Time Trial. Use from Arena.' });
  const SHOP_ITEMS = Object.freeze([
    ...['exp_potion', 'speed_potion', 'lucky_potion', 'rich_potion'].map(id => Object.freeze({ id, cost: 50 })),
    Object.freeze({ id: 'speed_battle_potion', cost: 200 }), Object.freeze({ id: TICKET_ID, cost: 50 })
  ]);
  const STAT_LIMIT = Number.MAX_VALUE / 1024;
  const count = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;
  const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
  const isMode = mode => Object.values(MODES).includes(mode);
  const isExp = mode => mode === MODES.exp;
  const fresh = () => ({ version: 1, shards: 0, room: 1, bestRoom: 0, xpCarry: {}, activeAttempt: null });
  function validSave(value) {
    if (!record(value) || value.version !== 1 || !Number.isSafeInteger(value.shards) || value.shards < 0 ||
        !Number.isSafeInteger(value.room) || value.room < 1 || !Number.isSafeInteger(value.bestRoom) || value.bestRoom < 0 ||
        value.room > Math.min(Number.MAX_SAFE_INTEGER, value.bestRoom + 1) || !record(value.xpCarry)) return false;
    if (Object.entries(value.xpCarry).some(([id, fraction]) => !host.ALL_CARDS?.some(card => card.id === id) ||
      typeof fraction !== 'number' || !Number.isFinite(fraction) || fraction < 0 || fraction >= 1)) return false;
    const a = value.activeAttempt;
    return a === null || (record(a) && typeof a.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(a.id) && isMode(a.mode) &&
      Number.isSafeInteger(a.startedAt) && a.startedAt >= 0 && Number.isSafeInteger(a.deadline) &&
      a.deadline - a.startedAt === LIMITS[a.mode] && a.room === (isExp(a.mode) ? 0 : value.room));
  }
  function load() {
    let saved; try { saved = JSON.parse(host.localStorage?.getItem(KEY) || 'null'); } catch (_) { saved = null; }
    return validSave(saved) ? saved : fresh();
  }
  let data = load(), bridge = {}, activeBattle = null, deadlineTimer = null, serial = 0;
  // Battles are never resumed with stale HP/passive state after reload/import.
  const interrupted = Boolean(data.activeAttempt);
  if (data.activeAttempt?.mode === MODES.normal) data.room = 1;
  data.activeAttempt = null;
  function persist() {
    try { host.localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (error) { console.warn('Time Trial save unavailable', error); return false; }
  }
  function requirePersist() { if (!persist()) throw new Error('Không thể lưu Time Trial. Chưa thể tiếp tục thao tác.'); }
  function registerTicket() { host.InventorySystem?.registerItem(TICKET); }
  registerTicket(); persist();
  function configure(options = {}) { bridge = options; }
  function detach() {
    if (deadlineTimer !== null) host.clearTimeout(deadlineTimer);
    deadlineTimer = null; activeBattle = null;
  }
  function expired(battle, now = Date.now()) { return Boolean(battle?.trial && now >= battle.trial.deadline); }
  function remaining(battle, now = Date.now()) { return Math.max(0, (battle?.trial?.deadline || now) - now); }
  function checkDeadline() {
    if (activeBattle?.finished) { detach(); return; }
    if (!activeBattle || !expired(activeBattle)) return;
    const battle = activeBattle; detach(); bridge.onTimeout?.(battle, isExp(battle.mode));
  }
  function canEnter(mode) { return isMode(mode) && (!isExp(mode) || host.InventorySystem?.quantity(TICKET_ID) >= 1); }
  function roomStats(room, boss = false) {
    const r = Math.max(1, count(room)), role = boss ? 10 : 1;
    // Tower-style exponential opening and gentle linear continuation.
    // 3 minions + a 10x boss: (13000 HP + 2*1300 ATK)*scale.
    const anchor = 650000 / 15600;
    const depth = Math.max(0, r - 50);
    const scale = r <= 50 ? Math.pow(anchor, (r - 1) / 49)
      : anchor * (1 + .015 * depth + .05 * Math.floor(depth / 10));
    const hp = Math.max(10, Math.round(Math.min(STAT_LIMIT, 1000 * role * scale)));
    return { hp, atk: Math.floor(hp * .10) };
  }
  function shardRange(room, boss = false) {
    const multiplier = 1 + Math.floor((Math.max(1, count(room)) - 1) / 10);
    return { min: (boss ? 2 : 1) * multiplier, max: (boss ? 5 : 2) * multiplier };
  }
  function monster(player) {
    const hp = Math.max(1, Math.floor(Math.max(1, Number(player?.maxHp) || 1) * .10));
    const card = { id: 'exp-trial-monster', name: 'EXP Monster', stats: { hp, atk: 0 }, chance: 1,
      passive: { name: 'Training Dummy', description: '0 ATK. Defeat for 0.1%–1.0% current level EXP.' }, image: '' };
    const unit = { card, display: { name: card.name, hp, atk: 0 }, hp, maxHp: hp,
      mutations: [], defeated: false, isExpMonster: true, level: 1 };
    // Keep zero even when generic passive display helpers normalize stats.
    Object.defineProperty(unit, 'atk', { enumerable: true, get: () => 0, set: () => {} });
    return unit;
  }
  function enemies(mode, player, random = Math.random) {
    if (isExp(mode)) return [monster(player)];
    const cards = host.ALL_CARDS || [], tower = host.TowerSystem;
    // Use Tower's pure generator, never its persisted floor encounter.
    // This preserves rarity pools, elite rooms, exclusions, artwork and passives.
    const lineup = tower.buildTrialOpponents(cards, data.room, 'normal', [], random);
    const used = new Set();
    return lineup.map((candidate, index) => {
      // A single draw from a reduced pool resolves duplicates without a retry loop.
      // The same role/elite rules still apply, including Tower's small-pool fallback.
      const unit = used.has(candidate.card.id)
        ? tower.buildTrialOpponents(cards.filter(card => !used.has(card.id)), data.room, 'normal', [], random)[index] || candidate
        : candidate;
      used.add(unit.card.id);
      const boss = index === 3, stats = roomStats(data.room, boss);
      unit.maxHp = stats.hp; unit.hp = stats.hp; unit.atk = stats.atk;
      Object.assign(unit.display, stats);
      unit.isTrialRoomEnemy = true; unit.trialBoss = boss; unit.level = data.room;
      return unit;
    });
  }
  function start(battle) {
    if (!isMode(battle?.mode) || !canEnter(battle.mode)) throw new Error('Cần 1 EXP Time Trial Ticket để vào lượt thử.');
    detach();
    const previous = JSON.parse(JSON.stringify(data)), now = Date.now();
    const attempt = { id: `${now}_${++serial}`, mode: battle.mode, room: isExp(battle.mode) ? 0 : data.room,
      startedAt: now, deadline: now + LIMITS[battle.mode] };
    data.activeAttempt = attempt;
    try {
      requirePersist();
      if (isExp(battle.mode) && !host.InventorySystem.remove(TICKET_ID, 1)) throw new Error('Không thể tiêu vé. Lượt thử chưa bắt đầu.');
    } catch (error) { data = previous; persist(); throw error; }
    battle.trial = { ...attempt, cardId: battle.setup.team[0].cardId, shardsEarned: 0, monsters: 0,
      experience: 0, progressPercent: 0, levelUps: 0, owner: battle.playerTeam[0] };
    activeBattle = battle;
    deadlineTimer = host.setTimeout(checkDeadline, LIMITS[battle.mode]);
    return battle.trial;
  }
  function settle(battle, random = Math.random) {
    const run = battle?.trial;
    if (!run || battle.finished || expired(battle)) return;
    for (const unit of battle.enemyTeam || []) {
      if ((!unit.defeated && unit.hp > 0) || unit.trialRewarded) continue;
      if (isExp(battle.mode) && unit.isExpMonster) {
        const info = bridge.getLevelInfo?.(run.cardId);
        if (!info) throw new Error('Không tìm thấy thông số EXP của thẻ đang luyện.');
        const baseRate = .001 + .009 * Math.max(0, Math.min(1, Number(random()) || 0));
        const rate = baseRate * Math.max(1, Number(bridge.getExperienceMultiplier?.()) || 1);
        if (info.level < 999) {
          const exact = info.required * rate + (data.xpCarry[run.cardId] || 0);
          const amount = Math.floor(exact), carry = exact - amount;
          const result = bridge.grantExperience?.(run.cardId, amount, run.owner);
          if (!result) throw new Error('Không thể lưu EXP. Lượt thử đã dừng để bảo vệ tiến độ.');
          data.xpCarry[run.cardId] = result.level >= 999 ? 0 : carry;
          run.experience += result.gained; run.progressPercent += rate * 100; run.levelUps += result.levelUps;
        }
        run.monsters++;
      } else if (!isExp(battle.mode) && unit.isTrialRoomEnemy) {
        const range = shardRange(run.room, unit.trialBoss);
        const baseValue = range.min + Math.min(range.max - range.min, Math.floor(random() * (range.max - range.min + 1)));
        const value = host.InventorySystem.scaleDrop(baseValue, random);
        const granted = Math.min(value, Number.MAX_SAFE_INTEGER - data.shards);
        data.shards += granted; run.shardsEarned += granted;
      } else continue;
      unit.trialRewarded = true;
      requirePersist();
    }
  }
  function afterTurn(battle, resolution, side) {
    if (expired(battle)) return { ended: true, winner: isExp(battle.mode) && battle.playerTeam.some(unit => unit.hp > 0 && !unit.defeated) ? 'player' : 'enemy' };
    settle(battle);
    if (!isExp(battle.mode)) return resolution;
    if (resolution.winner === 'enemy') return resolution;
    if (battle.enemyTeam.every(unit => unit.defeated || unit.hp <= 0)) {
      battle.enemyTeam = [monster(battle.trial.owner)]; battle.enemyIndex = 0; battle.enemy = battle.enemyTeam[0];
      battle.turn = side === 'player' ? 'enemy' : 'player';
    }
    return { ended: false, winner: null };
  }
  function prepareAfterEntry(battle) {
    if (isExp(battle.mode)) {
      const unit = battle.enemyTeam[0];
      if (unit.hp > 0 && !unit.defeated) {
        const hp = Math.max(1, Math.floor(battle.trial.owner.maxHp * .10));
        unit.hp = Math.max(1, Math.round(hp * unit.hp / unit.maxHp)); unit.maxHp = hp; unit.display.hp = hp;
        unit.card.stats.hp = hp;
      }
      afterTurn(battle, { ended: false, winner: null }, 'enemy');
    } else settle(battle);
  }
  function finish(battle, won, reason = '') {
    if (!battle?.trial || battle.trial.completed) return null;
    if (!isExp(battle.mode) && expired(battle)) won = false;
    if (won && isExp(battle.mode) && !expired(battle)) return null;
    if (won && !isExp(battle.mode) && battle.enemyTeam.some(unit => !unit.defeated && unit.hp > 0)) return null;
    if (reason !== 'save-error') settle(battle);
    const run = battle.trial;
    const previousBest = data.bestRoom;
    if (!isExp(battle.mode)) {
      if (won) { data.bestRoom = Math.max(data.bestRoom, run.room); data.room = Math.min(Number.MAX_SAFE_INTEGER, run.room + 1); }
      else data.room = 1;
    }
    run.completed = true; run.reason = reason || (expired(battle) ? 'time-limit' : won ? 'cleared' : 'defeat');
    data.activeAttempt = null; detach();
    if (!persist()) {
      if (!isExp(battle.mode)) { data.bestRoom = previousBest; data.room = 1; }
      throw new Error('Không thể lưu kết quả Time Trial. Lượt thử đã dừng.');
    }
    return { won, exp: isExp(battle.mode), room: run.room, nextRoom: data.room, shards: run.shardsEarned,
      monsters: run.monsters, experience: run.experience, progressPercent: run.progressPercent, levelUps: run.levelUps, reason: run.reason };
  }
  function abort(battle, reason = 'surrender') {
    if (!battle?.trial || battle.trial.completed) return;
    try { finish(battle, false, reason); } catch (error) { console.warn(error.message); }
  }
  function purchase(id) {
    const offer = SHOP_ITEMS.find(item => item.id === id), inventory = host.InventorySystem;
    if (!offer || data.shards < offer.cost || inventory.quantity(id) >= Number.MAX_SAFE_INTEGER) return false;
    const previous = data.shards; data.shards -= offer.cost;
    if (!persist()) { data.shards = previous; return false; }
    if (!inventory.grant(id, 1)) { data.shards = previous; persist(); return false; }
    return true;
  }
  function renderShop(grid, onPurchase = () => {}) {
    if (!grid) return;
    const doc = grid.ownerDocument; grid.replaceChildren();
    for (const offer of SHOP_ITEMS) {
      const item = host.InventorySystem.getItem(offer.id) || TICKET;
      const card = doc.createElement('article'); card.className = 'module-item';
      const name = doc.createElement('strong'); name.textContent = `${item.icon} ${item.name}`;
      const description = doc.createElement('p'); description.textContent = item.description;
      const button = doc.createElement('button'); button.type = 'button'; button.textContent = `Exchange • ${offer.cost} Shards`;
      button.disabled = data.shards < offer.cost;
      button.addEventListener('click', () => { if (purchase(offer.id)) onPurchase(offer.id); else host.alert('Không thể đổi vật phẩm. Kiểm tra Shards hoặc bộ nhớ lưu game.'); });
      card.append(name, description, button); grid.append(card);
    }
  }
  function reset() { detach(); data = fresh(); registerTicket(); persist(); }
  host.TimeTrialSystem = Object.freeze({ KEY, MODES, TURN_MS, LIMITS, TICKET_ID, TICKET, SHOP_ITEMS,
    configure, isMode, isExp, canEnter, roomStats, shardRange, enemies, start, prepareAfterEntry, afterTurn, finish, abort,
    expired, remaining, checkDeadline, detach, purchase, renderShop, validSave, reset, flush: persist,
    getXpCarry: id => data.xpCarry[id] || 0,
    get room() { return data.room; }, get bestRoom() { return data.bestRoom; }, get shards() { return data.shards; }, interrupted });
})(window);
