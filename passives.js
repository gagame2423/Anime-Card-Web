
// ============================================================
// ANIME CARD RNG - PASSIVE SYSTEM
// Source of truth:
//   - Card/passive names + descriptions remain in cards.js.
//   - This module owns runtime passive state, combat hooks,
//     critical hits, dodge, status effects, follow-ups, and
//     passive-only reward modifiers.
//
// Loaded BEFORE app.js. Runtime host callbacks are configured by
// app.js after its DOM/state functions exist.
// ============================================================

(() => {
  const BASE_CRIT_CHANCE = 0.05;
  const BASE_CRIT_MULTIPLIER = 1.5;
  const MAX_CHAIN_ATTACKS = 24;
  const MAX_SLASHES = 16;

  let host = {};
  let passiveLogSequence = 0;

  // Passive definitions are derived directly from the loaded cards.js database.
  // No duplicate passive descriptions or balance values are maintained here.
  const SOURCE_CARDS = Array.isArray(window.CARDS) ? window.CARDS : (Array.isArray(window.ALL_CARDS) ? window.ALL_CARDS : []);
  const PASSIVE_DEFINITIONS = Object.freeze(
    Object.fromEntries(
      SOURCE_CARDS
        .filter(card => card?.id && card?.passive?.name)
        .map(card => [
          String(card.id),
          Object.freeze({
            name: String(card.passive.name),
            description: String(card.passive.description || '')
          })
        ])
    )
  );

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, Number(value) || 0));

  function configureHost(nextHost = {}) {
    host = { ...host, ...nextHost };
  }

  function safeLog(message, tone = '') {
    try {
      passiveLogSequence += 1;
      host.appendBattleLog?.(String(message), tone);
    } catch (error) {
      console.warn('[PASSIVE] Battle log failed safely:', error);
    }
  }

  function cardOf(unit) {
    return unit?.card || null;
  }

  function cardIdOf(unit) {
    return String(unit?.card?.id ?? '').trim();
  }

  function getEffectivePassiveCardId(unit) {
    return String(unit?.passiveState?.effectivePassiveId || cardIdOf(unit)).trim();
  }

  function getPassiveCard(unit) {
    const effectiveId = getEffectivePassiveCardId(unit);
    return host.getCardById?.(effectiveId) || cardOf(unit);
  }

  function getPassive(unit) {
    const card = getPassiveCard(unit);
    return card?.passive && typeof card.passive === 'object'
      ? card.passive
      : { name: 'Unknown Passive', description: '' };
  }

  function getPassiveName(unit) {
    return String(getPassive(unit)?.name || 'Passive').trim();
  }

  function ensureRuntime(unit) {
    if (!unit) return null;
    if (!unit.passiveState || typeof unit.passiveState !== 'object') {
      unit.passiveState = {
        attackCount: 0,
        ownAttackCount: 0,
        baseAtkAtBattleStart: Math.max(1, Number(unit?.atk) || 1),
        displayAtkBonusPct: 0,
        displayHpBonusPct: 0,
        flatAtkBonusDisplay: 0,
        hitsTaken: 0,
        kills: 0,
        dodgeStreak: 0,
        nextAttackMultiplier: 1,
        nextAttackBonus: 0,
        atkBonusPct: 0,
        maxHpBonusPct: 0,
        damageReductionPct: 0,
        critChanceBonus: 0,
        critDamageBonus: 0,
        stunTurns: 0,
        freezeTurns: 0,
        incomingImmuneTurns: 0,
        weakenAttackTurns: 0,
        weakenAttackPct: 0,
        snailTurns: 0,
        burn: [],
        bleed: [],
        shield: 0,
        shieldKind: '',
        invincibleTurns: 0,
        passiveImmune: false,
        noDodgeAgainstUnit: false,
        effectivePassiveId: null,
        activeTags: [],
        auraStacks: 0,
        slimePoints: 0,
        berserker: false,
        kuugaForm: '',
        formCycle: 0,
        hamonActive: false,
        atkBoostTurns: 0,
        damageReductionTurns: 0,
        storedAtk: 0,
        buffStacks: 0,
        soul: 0,
        builderTowerAtk: 0,
        waterShield: 0,
        weatherShield: 0,
        magicMode: '',
        magicModeTurn: -1,
        lastHitReceived: 0,
        facingTurns: 0,
        noDodgeTurns: 0,
        nextAttackIsBuffed: false,
        firstFatalityUsed: false,
        repeatReviveCount: 0,
        reviveCount: 0,
        stringArmyUsed: false,
        cloneCount: 0,
        domainTurns: 0,
        passiveDisabled: false,
        stolenPassiveId: null,
        lastTurnAttacked: false,
        lastHp: unit.hp,
        lastDamageTaken: 0,
        temporaryStatsTurns: 0,
        absorbedAttack: 0,
        ignoreDodge: false,
        reflectPct: 0,
        capitanBuffApplied: false,
        hakariInvincible: 0,
        jackpotBoost: '',
        nextAttackCritGuaranteed: false,
        lastCrit: false,
        lastDodge: false,
        postReviveDodgeBonus: 0,
        nextEnemyDoubleStrike: false,
        garpKillTriggerUsed: false,
        temporaryAtkBonusPct: 0,
        temporaryMaxHpBonusPct: 0,
        temporaryAtkDelta: 0,
        temporaryMaxHpDelta: 0,
        stormAtkDelta: 0,
        stormTurns: 0,
        weatherShieldExpiresAt: 0,
        sunnyBuffAnnounced: false,
        thresholdBuffAnnounced: false,
        lastPassiveTrigger: '',
        lastActionLabel: ''
      };
    }
    // cardState is the explicit per-card runtime state. Keep passiveState as a
    // backwards-compatible alias so older code/data cannot drift.
    unit.cardState = unit.passiveState;
    return unit.passiveState;
  }

  function ensureCardState(unit) {
    return ensureRuntime(unit);
  }

  function getCardAttackCount(unit) {
    return Math.max(0, Math.floor(Number(ensureCardState(unit)?.ownAttackCount) || 0));
  }

  function allUnits(battleState) {
    return [
      ...(Array.isArray(battleState?.playerTeam) ? battleState.playerTeam : []),
      ...(Array.isArray(battleState?.enemyTeam) ? battleState.enemyTeam : [])
    ].filter(Boolean);
  }

  function isAlive(unit) {
    return Boolean(unit && !unit.defeated && Number(unit.hp) > 0);
  }

  function aliveUnits(team) {
    return Array.isArray(team) ? team.filter(isAlive) : [];
  }

  function teamOf(battleState, unit) {
    if (battleState?.playerTeam?.includes(unit)) return battleState.playerTeam;
    if (battleState?.enemyTeam?.includes(unit)) return battleState.enemyTeam;
    if (unit?.side === 'player') return battleState.playerTeam || [];
    return battleState?.enemyTeam || [];
  }

  function enemyTeamOf(battleState, unit) {
    if (battleState?.playerTeam?.includes(unit)) return battleState.enemyTeam || [];
    return battleState?.playerTeam || [];
  }

  function alliesOf(battleState, unit, includeSelf = true) {
    const team = teamOf(battleState, unit);
    return aliveUnits(team).filter(candidate => includeSelf || candidate !== unit);
  }

  function enemiesOf(battleState, unit) {
    return aliveUnits(enemyTeamOf(battleState, unit));
  }

  function firstLiving(team, preferredIndex = 0) {
    if (!Array.isArray(team) || !team.length) return null;
    for (let i = 0; i < team.length; i += 1) {
      const index = (preferredIndex + i) % team.length;
      if (isAlive(team[index])) return team[index];
    }
    return null;
  }

  function activeDefender(battleState, unit) {
    const enemyTeam = enemyTeamOf(battleState, unit);
    const index = battleState?.playerTeam?.includes(unit)
      ? Number(battleState.enemyIndex || 0)
      : Number(battleState.playerIndex || 0);
    return firstLiving(enemyTeam, index) || enemyTeam[0] || null;
  }

  function ensureCurrentIndices(battleState) {
    if (!battleState) return;
    const playerTeam = battleState.playerTeam || [];
    const enemyTeam = battleState.enemyTeam || [];
    const nextPlayer = firstLiving(playerTeam, Number(battleState.playerIndex || 0));
    const nextEnemy = firstLiving(enemyTeam, Number(battleState.enemyIndex || 0));
    if (nextPlayer) battleState.playerIndex = Math.max(0, playerTeam.indexOf(nextPlayer));
    if (nextEnemy) battleState.enemyIndex = Math.max(0, enemyTeam.indexOf(nextEnemy));
    battleState.player = nextPlayer;
    battleState.enemy = nextEnemy;
  }

  function isTeamDefeated(team) {
    const realUnits = aliveUnits(team).filter(unit => !unit?.isClone);
    return realUnits.length === 0;
  }

  function appendTeamUnit(team, unit) {
    if (!Array.isArray(team) || !unit) return;
    team.push(unit);
  }

  function refreshUnitDisplay(unit) {
    if (!unit) return;
    unit.maxHp = Math.max(1, Number(unit.maxHp) || Number(unit.hp) || 1);
    unit.hp = Math.max(0, Number(unit.hp) || 0);
    unit.atk = Math.max(1, Number(unit.atk) || 1);
    if (!unit.display || typeof unit.display !== 'object') unit.display = {};
    unit.display.hp = unit.maxHp;
    unit.display.atk = unit.atk;
  }

  function applyMaxHpBonus(unit, percent, healToNewMax = true) {
    if (!unit) return 0;
    const pct = Number(percent) || 0;
    const currentMax = Math.max(1, Number(unit.maxHp) || 1);
    const bonus = Math.max(0, currentMax * pct);
    unit.maxHp = Math.max(1, Math.round(currentMax + bonus));
    if (healToNewMax) unit.hp = Math.min(unit.maxHp, Math.max(0, Number(unit.hp) || 0) + bonus);
    const runtime = ensureRuntime(unit);
    runtime.maxHpBonusPct += pct;
    runtime.displayHpBonusPct += pct;
    refreshUnitDisplay(unit);
    return bonus;
  }

  function multiplyMaxHp(unit, factor, healToNewMax = true) {
    if (!unit) return 0;
    const safeFactor = Math.max(0.01, Number(factor) || 1);
    const oldMax = Math.max(1, Number(unit.maxHp) || 1);
    const newMax = Math.max(1, Math.round(oldMax * safeFactor));
    const delta = newMax - oldMax;
    unit.maxHp = newMax;
    if (healToNewMax) unit.hp = Math.min(newMax, Math.max(0, Number(unit.hp) || 0) + Math.max(0, delta));
    ensureRuntime(unit).displayHpBonusPct += Math.max(0, safeFactor - 1);
    refreshUnitDisplay(unit);
    return delta;
  }

  function heal(unit, amount, reason = '', state = null, source = null) {
    if (!unit || !isAlive(unit)) return 0;
    const runtime = ensureRuntime(unit);
    const before = Math.max(0, Number(unit.hp) || 0);
    const delta = Math.max(0, Math.floor(Number(amount) || 0));
    if (delta <= 0) return 0;
    unit.hp = Math.min(Math.max(1, Number(unit.maxHp) || 1), before + delta);
    const gained = unit.hp - before;
    if (gained > 0) {
      if (before < (Number(unit.maxHp) || 1) * 0.60 && unit.hp >= (Number(unit.maxHp) || 1) * 0.60) {
        triggerId(state, 'homura-akemi', 'onHealThreshold', unit, { source, amount: gained, support: true, allowForeignOwner: true, sourceCardId: cardIdOf(source) });
      }
      safeLog(`[PASSIVE] ${unit.display?.name || cardOf(unit)?.name || 'Unit'} healed ${gained.toLocaleString('en-US')} HP${reason ? ` • ${reason}` : ''}.`, 'passive');
    }
    runtime.lastHp = unit.hp;
    return gained;
  }

  function applyAtkMultiplier(unit, multiplier, turns = 0, tag = '') {
    if (!unit) return;
    const safeMultiplier = Math.max(0, Number(multiplier) || 1);
    const runtime = ensureRuntime(unit);
    runtime.atkBonusPct += Math.max(0, safeMultiplier - 1);
    runtime.displayAtkBonusPct += Math.max(0, safeMultiplier - 1);
    if (turns > 0) {
      runtime.atkBoostTurns = Math.max(runtime.atkBoostTurns, turns);
    }
    if (tag) {
      runtime.activeTags.push(tag);
      runtime.lastPassiveTrigger = tag;
    }
    refreshUnitDisplay(unit);
  }

  function applyPermanentAtkBonus(unit, pct, tag = '') {
    const safePct = Number(pct) || 0;
    if (!unit || safePct === 0) return;
    unit.atk = Math.max(1, Math.round(unit.atk * (1 + safePct)));
    const runtime = ensureRuntime(unit);
    runtime.displayAtkBonusPct += safePct;
    if (tag) runtime.activeTags.push(tag);
    if (tag) runtime.lastPassiveTrigger = tag;
    refreshUnitDisplay(unit);
  }

  function applyDamageReduction(unit, pct, turns = 0, tag = '') {
    const runtime = ensureRuntime(unit);
    runtime.damageReductionPct = Math.max(runtime.damageReductionPct, clamp(pct, 0, 0.99));
    runtime.damageReductionTurns = Math.max(runtime.damageReductionTurns, Math.max(0, Math.floor(Number(turns) || 0)));
    if (tag) runtime.activeTags.push(tag);
  }

  function setStatus(unit, key, turns, source = null) {
    if (!unit) return;
    const runtime = ensureRuntime(unit);
    const safeTurns = Math.max(1, Math.floor(Number(turns) || 0));
    if (safeTurns <= 0) return;
    const beforeTurns = Math.max(0, Number(runtime[key]) || 0);
    runtime[key] = Math.max(beforeTurns, safeTurns);
    refreshUnitDisplay(unit);

    const labels = { stunTurns: 'STUN', freezeTurns: 'FREEZE', snailTurns: 'SNAIL', invincibleTurns: 'INVINCIBLE', immuneTurns: 'IMMUNE' };
    const label = labels[key] || String(key).toUpperCase();
    const sourceName = source?.display?.name || cardOf(source)?.name || 'Passive';
    if (runtime[key] > beforeTurns && labels[key]) {
      host.showBattleFloatingText?.(unit, `${label} ${runtime[key]}t${source ? ` • ${sourceName}` : ''}`, 'debuff');
      safeLog(`[Debuff] ${unit.display?.name || cardOf(unit)?.name || 'Target'} gained ${label} for ${runtime[key]} turns${source ? ` from ${sourceName}` : ''}.`, 'debuff');
    }
  }

  function addDot(unit, kind, turns, damagePerTurn, source) {
    if (!unit) return;
    const runtime = ensureRuntime(unit);
    const list = Array.isArray(runtime[kind]) ? runtime[kind] : [];
    const safeTurns = Math.max(1, Math.floor(Number(turns) || 1));
    const safeDamage = Math.max(0, Math.floor(Number(damagePerTurn) || 0));
    list.push({ turns: safeTurns, damage: safeDamage, source: source || null });
    runtime[kind] = list;

    const sourceName = source?.display?.name || cardOf(source)?.name || 'Passive';
    const label = kind === 'bleed' ? 'BLEED' : kind === 'burn' ? 'BURN' : String(kind).toUpperCase();
    host.showBattleFloatingText?.(unit, `${kind === 'bleed' ? '🩸' : kind === 'burn' ? '🔥' : '☠'} ${label} ${safeTurns}t`, 'debuff');
    safeLog(`[Debuff] ${unit.display?.name || cardOf(unit)?.name || 'Target'} gained ${label} for ${safeTurns} turns from ${sourceName}.`, 'debuff');
    refreshUnitDisplay(unit);
  }

  function passiveImmuneToSource(target, source) {
    const targetRuntime = ensureRuntime(target);
    if (targetRuntime?.passiveImmune) return true;
    if (getEffectivePassiveCardId(target) === 'starter-secret') return true;
    const targetHp = Math.max(0, Number(target?.hp) || 0);
    const targetMax = Math.max(1, Number(target?.maxHp) || 1);
    if (cardIdOf(target) === 'erza' && targetHp < targetMax * 0.50) return true;
    return false;
  }

  function sourcePassiveAllowed(target, source) {
    if (!source || !target) return true;
    return !passiveImmuneToSource(target, source);
  }

  function getWeatherActive(name) {
    try {
      return Boolean(host.isWeatherActive?.(name));
    } catch {
      return false;
    }
  }

  function addActiveTag(unit, tag) {
    const runtime = ensureRuntime(unit);
    if (!runtime.activeTags.includes(tag)) runtime.activeTags.push(tag);
    runtime.lastPassiveTrigger = tag;
  }

  function removeActiveTag(unit, tag) {
    const runtime = ensureRuntime(unit);
    runtime.activeTags = runtime.activeTags.filter(item => item !== tag);
  }

  function triggerId(battleState, id, event, unit, context = {}) {
    const ids = [id, getEffectivePassiveCardId(unit)].filter(Boolean);
    for (const passiveId of [...new Set(ids)]) {
      try {
        return runPassiveEvent(passiveId, event, battleState, unit, context);
      } catch (error) {
        console.warn(`[PASSIVE] ${passiveId} ${event} failed safely:`, error);
      }
    }
    return undefined;
  }

  function getCritStats(attacker) {
    const runtime = ensureRuntime(attacker);
    let chance = BASE_CRIT_CHANCE + (Number(runtime.critChanceBonus) || 0);
    let multiplier = BASE_CRIT_MULTIPLIER + (Number(runtime.critDamageBonus) || 0);
    if (runtime.nextAttackCritGuaranteed) chance = 1;
    if (runtime.kuugaForm === 'blue') chance += 0.20;
    if (runtime.kuugaForm === 'green') multiplier += 0.50;
    if (runtime.auraStacks > 0) multiplier += runtime.auraStacks * 0.10;
    return {
      chance: clamp(chance, 0, 1),
      multiplier: Math.max(1, multiplier)
    };
  }

  function getDisplayDodgeChance(unit) {
    if (!unit) return 0;
    const runtime = ensureRuntime(unit);
    if (runtime.invincibleTurns > 0 || runtime.hakariInvincible > 0) return 100;
    let chance = 0;
    switch (getEffectivePassiveCardId(unit)) {
      case 'starter-rare': chance = 0.05; break;
      case 'buggy': chance = 0.33; break;
      case 'kakashi': chance = 0.22; break;
      case 'the-flash': chance = 0.60; break;
      case 'katakuri': chance = 0.07; break;
      case 'shanks': chance = 0.30; break;
      case 'light-admiral': chance = 0.20; break;
      case 'weather-tsukuyomi-eye': chance = 0.35; break;
      case 'diavolo': chance = 0.35; break;
      default: break;
    }
    chance += Math.max(0, Number(runtime.postReviveDodgeBonus) || 0);
    if (getEffectivePassiveCardId(unit) === 'arlong') chance = Math.max(chance, 0.24);
    if (runtime.noDodgeTurns > 0 || runtime.noDodgeAgainstUnit) chance = 0;
    return clamp(chance, 0, 0.99) * 100;
  }

  function getCombatStatusSummary(unit, battleState) {
    if (!unit) return { atkMultiplierPct: 0, hpPct: 100, currentHp: 0, maxHp: 1, dodgePct: 0, damageReductionPct: 0, shield: 0, shieldPct: 0, effects: [] };
    const runtime = ensureRuntime(unit);
    const maxHp = Math.max(1, Number(unit.maxHp) || 1);
    const currentHp = Math.max(0, Number(unit.hp) || 0);
    const passiveId = getEffectivePassiveCardId(unit);
    let atkMultiplier = 1 + Math.max(-0.95, Number(runtime.displayAtkBonusPct) || 0);
    atkMultiplier *= 1 + Math.max(0, Number(runtime.temporaryAtkBonusPct) || 0);
    if (passiveId === 'vegeta' || passiveId === 'polnareff') {
      if (currentHp / maxHp < 0.25) atkMultiplier *= 2;
    }
    if (passiveId === 'weather-solar-deity' && getWeatherActive('Sunny')) atkMultiplier *= 2;
    if (passiveId === 'piccolo' && runtime.buffStacks > 0) atkMultiplier *= 1 + runtime.buffStacks * 0.10;
    if (passiveId === 'doppio' && runtime.buffStacks > 0) atkMultiplier *= 1 + runtime.buffStacks * 0.20;
    if (passiveId === 'gohan' && runtime.nextAttackMultiplier > 1) atkMultiplier *= runtime.nextAttackMultiplier;
    if (runtime.jackpotBoost === 'atk') atkMultiplier *= 1.77;
    if (runtime.hamonActive) atkMultiplier = Math.max(atkMultiplier, 10);
    if (runtime.jackpotBoost === 'atk') atkMultiplier *= 1.77;
    if (runtime.hamonActive) atkMultiplier = Math.max(atkMultiplier, 10);
    const effects = [];
    const addDotEffect = (kind, icon, tone, label) => {
      const list = Array.isArray(runtime[kind]) ? runtime[kind] : [];
      if (!list.length) return;
      const turns = list.reduce((max, effect) => Math.max(max, Math.floor(Number(effect?.turns) || 0)), 0);
      effects.push({ icon, tone, label: `${label} x${list.length}${turns ? ` (${turns}t)` : ''}`, category: 'status' });
    };
    addDotEffect('burn', '🔥', 'burn', 'BURN');
    addDotEffect('bleed', '🩸', 'bleed', 'BLEED');
    if (runtime.freezeTurns > 0) effects.push({ icon: '❄', tone: 'freeze', label: `FROST (${runtime.freezeTurns}t)`, category: 'status' });
    if (runtime.stunTurns > 0) effects.push({ icon: '✚', tone: 'stun', label: `STUN (${runtime.stunTurns}t)`, category: 'status' });
    if (runtime.snailTurns > 0) effects.push({ icon: '🐌', tone: 'debuff', label: `SNAIL (${runtime.snailTurns}t)`, category: 'status' });
    if (runtime.weakenAttackTurns > 0 && runtime.weakenAttackPct > 0) effects.push({ icon: '↘', tone: 'debuff', label: `ATK -${Math.round(runtime.weakenAttackPct * 100)}% (${runtime.weakenAttackTurns}t)`, category: 'status' });
    const shield = Math.max(0, Number(runtime.shield) || 0);
    return {
      atkMultiplierPct: (atkMultiplier - 1) * 100,
      hpBonusPct: (Math.max(0, Number(runtime.displayHpBonusPct) || 0) + Math.max(0, Number(runtime.temporaryMaxHpBonusPct) || 0)) * 100,
      hpPct: (currentHp / maxHp) * 100,
      currentHp,
      maxHp,
      dodgePct: getDisplayDodgeChance(unit),
      damageReductionPct: Math.max(0, Number(runtime.damageReductionPct) || 0) * 100,
      shield,
      shieldPct: Math.min(100, (shield / maxHp) * 100),
      effects
    };
  }

  function getPassiveTooltipData(unit) {
    const runtime = ensureRuntime(unit);
    const passive = getPassive(unit);
    return {
      name: String(passive?.name || 'Passive'),
      description: String(passive?.description || ''),
      status: runtime.lastPassiveTrigger ? `Triggered: ${runtime.lastPassiveTrigger}` : 'Active'
    };
  }

  function getDodgeChance(target, attacker, battleState, options = {}) {
    if (!target || !attacker) return 0;
    const runtime = ensureRuntime(target);
    if (runtime.noDodgeAgainstUnit) return 0;
    if (runtime.invincibleTurns > 0 || runtime.hakariInvincible > 0) return 1;
    if (options.passiveAttack && cardIdOf(target) === 'gojo-young') return 0;
    if (cardIdOf(target) === 'gojo-young') return 0.88;

    let chance = 0;
    switch (getEffectivePassiveCardId(target)) {
      case 'starter-rare': chance = 0.05; break;
      case 'buggy': chance = 0.33; break;
      case 'kakashi': chance = 0.22; break;
      case 'the-flash': chance = 0.60; break;
      case 'katakuri': chance = 0.07; break;
      case 'doppio': chance = 0; break;
      case 'shanks': chance = 0.30; break;
      case 'light-admiral': chance = 0.20; break;
      case 'weather-tsukuyomi-eye': chance = 0.35; break;
      case 'diavolo': chance = 0.35; break;
      default: break;
    }
    chance += Math.max(0, Number(runtime.postReviveDodgeBonus) || 0);
    if (cardIdOf(target) === 'arlong') chance = Math.max(chance, 0.24);
    if (runtime.noDodgeTurns > 0) chance = 0;
    return clamp(chance, 0, 0.99);
  }

  function isUnitStunned(unit) {
    const runtime = ensureRuntime(unit);
    return runtime.stunTurns > 0 || runtime.freezeTurns > 0 || runtime.snailTurns > 0 || runtime.passiveDisabled === true;
  }

  function tickStatusEffects(battleState, unit) {
    if (!unit || !isAlive(unit)) return { skipped: false };
    const runtime = ensureRuntime(unit);
    let skipped = false;

    for (const kind of ['burn', 'bleed']) {
      const list = Array.isArray(runtime[kind]) ? runtime[kind] : [];
      const remaining = [];
      for (const effect of list) {
        const dmg = Math.max(0, Math.floor(Number(effect?.damage) || 0));
        if (dmg > 0 && isAlive(unit)) {
          unit.hp = Math.max(0, unit.hp - dmg);
          runtime.lastDamageTaken = dmg;
          safeLog(`[STATUS] ${unit.display?.name || cardOf(unit)?.name || 'Unit'} takes ${dmg.toLocaleString('en-US')} ${kind.toUpperCase()} damage.`, 'status');
          if (unit.hp <= 0) {
            unit.defeated = true;
            break;
          }
        }
        const turns = Math.max(0, Math.floor(Number(effect?.turns) || 0) - 1);
        if (turns > 0) remaining.push({ ...effect, turns });
      }
      runtime[kind] = remaining;
      if (!isAlive(unit)) break;
    }

    if (runtime.stunTurns > 0 || runtime.freezeTurns > 0) {
      skipped = true;
      runtime.stunTurns = Math.max(0, runtime.stunTurns - 1);
      runtime.freezeTurns = Math.max(0, runtime.freezeTurns - 1);
      safeLog(`[STATUS] ${unit.display?.name || cardOf(unit)?.name || 'Unit'} is unable to attack this turn.`, 'status');
    }

    if (runtime.snailTurns > 0) runtime.snailTurns -= 1;
    if (runtime.incomingImmuneTurns > 0) runtime.incomingImmuneTurns -= 1;
    if (runtime.noDodgeTurns > 0) runtime.noDodgeTurns -= 1;
    if (runtime.noDodgeTurns === 0) runtime.noDodgeAgainstUnit = false;
    if (runtime.invincibleTurns > 0) runtime.invincibleTurns -= 1;
    if (runtime.hakariInvincible > 0) runtime.hakariInvincible -= 1;

    if (runtime.atkBoostTurns > 0) {
      runtime.atkBoostTurns -= 1;
    }
    if (runtime.damageReductionTurns > 0) {
      runtime.damageReductionTurns -= 1;
      if (runtime.damageReductionTurns <= 0) runtime.damageReductionPct = 0;
    }
    if (runtime.stormTurns > 0) {
      runtime.stormTurns -= 1;
      if (runtime.stormTurns <= 0 && runtime.stormAtkDelta > 0) {
        unit.atk = Math.max(1, (Number(unit.atk) || 1) - runtime.stormAtkDelta);
        runtime.stormAtkDelta = 0;
        runtime.displayAtkBonusPct = Math.max(0, Number(runtime.displayAtkBonusPct) || 0) - 0.60;
        refreshUnitDisplay(unit);
        safeLog(`[PASSIVE] ${unit.display?.name || 'Uchiha Sasuke'} Storm Susano boost expired.`, 'passive');
      }
    }
    if (runtime.temporaryStatsTurns > 0) {
      runtime.temporaryStatsTurns -= 1;
      if (runtime.temporaryStatsTurns <= 0 && (runtime.temporaryAtkDelta > 0 || runtime.temporaryMaxHpDelta > 0)) {
        if (runtime.temporaryAtkDelta > 0) {
          unit.atk = Math.max(1, (Number(unit.atk) || 1) - runtime.temporaryAtkDelta);
        }
        if (runtime.temporaryMaxHpDelta > 0) {
          unit.maxHp = Math.max(1, (Number(unit.maxHp) || 1) - runtime.temporaryMaxHpDelta);
          unit.hp = Math.min(unit.maxHp, Math.max(1, Number(unit.hp) || 1));
        }
        runtime.temporaryAtkDelta = 0;
        runtime.temporaryMaxHpDelta = 0;
        runtime.temporaryAtkBonusPct = 0;
        runtime.temporaryMaxHpBonusPct = 0;
        refreshUnitDisplay(unit);
        safeLog(`[PASSIVE] ${unit.display?.name || 'Android 21'} temporary stat boost expired.`, 'passive');
      }
    }

    return { skipped };
  }

  function healAllies(battleState, unit, pct) {
    for (const ally of alliesOf(battleState, unit, true)) {
      heal(ally, (Number(ally.maxHp) || 0) * pct, '', battleState, unit);
    }
  }

  function addShield(unit, amount, kind = 'shield') {
    const runtime = ensureRuntime(unit);
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    runtime.shield = Math.max(runtime.shield, value);
    runtime.shieldKind = kind;
    addActiveTag(unit, `${kind}-shield`);
  }

  function absorbShieldDamage(unit, amount, battleState, source) {
    const runtime = ensureRuntime(unit);
    let remaining = Math.max(0, Number(amount) || 0);
    if (runtime.shield <= 0) return remaining;
    const blocked = Math.min(runtime.shield, remaining);
    runtime.shield -= blocked;
    remaining -= blocked;
    if (runtime.shield <= 0) {
      const kind = runtime.shieldKind;
      runtime.shieldKind = '';
      removeActiveTag(unit, `${kind}-shield`);
      if (kind === 'weather') {
        const sourceUnit = source;
        if (sourceUnit && sourcePassiveAllowed(unit, sourceUnit) && cardIdOf(unit) !== cardIdOf(sourceUnit)) {
          const ownerIsWeatherReport = getEffectivePassiveCardId(unit) === 'weather-report';
          if (ownerIsWeatherReport) {
            setStatus(sourceUnit, 'snailTurns', 2, unit);
            safeLog(`[PASSIVE] ${unit.display?.name || 'Weather Report'} transformed ${sourceUnit.display?.name || 'the attacker'} into a snail for 2 turns.`, 'passive');
          } else {
            setStatus(sourceUnit, 'stunTurns', 2, unit);
            safeLog(`[PASSIVE] Weather shield shattered and stunned ${sourceUnit.display?.name || 'the attacker'} for 2 turns.`, 'passive');
          }
        }
      }
    }
    return remaining;
  }

  function calculateBaseDamage(attacker) {
    const base = Math.max(1, Number(attacker?.atk) || Number(attacker?.display?.atk) || 1);
    const runtime = ensureRuntime(attacker);
    return base * Math.max(0, 1 + (Number(runtime.atkBonusPct) || 0));
  }

  function damageUnit(battleState, attacker, target, amount, meta = {}) {
    if (!target || !isAlive(target)) return { damage: 0, killed: false, reflected: false };
    const targetRuntime = ensureRuntime(target);
    const source = attacker || null;

    if (targetRuntime.invincibleTurns > 0 || targetRuntime.hakariInvincible > 0) {
      safeLog(`[PASSIVE] ${target.display?.name || 'Target'} is INVINCIBLE and takes no damage.`, 'passive');
      return { damage: 0, killed: false, reflected: false, invincible: true };
    }

    if (targetRuntime.incomingImmuneTurns > 0 && !meta.passiveBypass) {
      safeLog(`[PASSIVE] ${target.display?.name || 'Target'} is immune to incoming attacks this turn.`, 'passive');
      return { damage: 0, killed: false, reflected: false, immune: true };
    }

    let remaining = Math.max(0, Number(amount) || 0);
    remaining = absorbShieldDamage(target, remaining, battleState, source);

    const reduction = clamp(
      Number(targetRuntime.damageReductionPct) +
      (cardIdOf(target) === 'aquaman' && host.isWeatherActive?.('Raining') ? 0.50 : 0),
      0,
      0.95
    );
    remaining *= (1 - reduction);

    targetRuntime.lastDamageTaken = remaining;
    targetRuntime.lastHitReceived = remaining;

    const before = Math.max(0, Number(target.hp) || 0);
    target.hp = Math.max(0, before - Math.floor(remaining));
    const killed = target.hp <= 0;
    if (killed) target.defeated = true;
    refreshUnitDisplay(target);

    return {
      damage: Math.max(0, before - target.hp),
      killed,
      reflected: false
    };
  }

  function shouldReflectPassiveAttack(target, attacker, options = {}) {
    if (!target || !attacker || !options.passiveAttack) return false;
    if (passiveImmuneToSource(target, attacker)) return false;
    return Math.random() < 0.50 && getEffectivePassiveCardId(target) === 'asta';
  }

  function selectStrongestEnemy(battleState, unit) {
    return enemiesOf(battleState, unit)
      .slice()
      .sort((a, b) => (Number(b?.atk) || 0) - (Number(a?.atk) || 0))[0] || null;
  }

  function selectWeakestEnemyByAtk(battleState, unit) {
    return enemiesOf(battleState, unit)
      .slice()
      .sort((a, b) => (Number(a?.atk) || 0) - (Number(b?.atk) || 0))[0] || null;
  }

  function markAttackTag(unit, tag) {
    const runtime = ensureRuntime(unit);
    addActiveTag(unit, tag);
    runtime.lastActionLabel = tag;
  }

  function runOnEntry(battleState, unit) {
    const id = getEffectivePassiveCardId(unit);
    const runtime = ensureRuntime(unit);
    const team = teamOf(battleState, unit);
    const enemyTeam = enemyTeamOf(battleState, unit);
    const aliveTeammates = aliveUnits(team);
    const enemies = aliveUnits(enemyTeam);

    switch (id) {
      case 'tanjiro':
        if (sourcePassiveAllowed(unit, unit)) {
          applyMaxHpBonus(unit, 0.25);
          safeLog(`[PASSIVE] ${unit.display?.name || 'Tanjiro'} gained +25% HP at battle start.`, 'passive');
        }
        break;
      case 'six-seven': {
        const target = firstLiving(enemyTeam, 0);
        if (target && sourcePassiveAllowed(target, unit)) {
          setStatus(target, 'stunTurns', 3, unit);
          safeLog(`[PASSIVE] ${unit.display?.name || 'Six Seven'} stunned the enemy for 3 turns on entry.`, 'passive');
        }
        break;
      }
      case 'the-trapper': {
        const target = firstLiving(enemyTeam, 0);
        if (target && Math.random() < 0.50 && sourcePassiveAllowed(target, unit)) {
          const result = damageUnit(battleState, unit, target, calculateBaseDamage(unit) * 5, { passiveBypass: true, passiveAttack: true });
          safeLog(`[PASSIVE] ${unit.display?.name || 'The Trapper'} sprung a 5× ATK trap${result.killed ? ' and defeated the target' : ''}.`, 'passive');
        }
        break;
      }
      case 'erwin':
        if (battleState.playerTeam?.includes(unit) || battleState.enemyTeam?.includes(unit)) {
          const index = team.indexOf(unit);
          if (index === 0 && !runtime.capitanBuffApplied) {
            for (const ally of aliveTeammates) applyPermanentAtkBonus(ally, 1.00, 'CAPTAIN +100% ATK');
            runtime.capitanBuffApplied = true;
            safeLog(`[PASSIVE] ${unit.display?.name || 'Erwin'} buffed all teammates +100% ATK.`, 'passive');
          }
        }
        break;
      case 'reigen': {
        const others = aliveTeammates.filter(ally => ally !== unit);
        if (!others.length) {
          applyPermanentAtkBonus(unit, 2.00, 'SCAM +200% ATK');
          applyMaxHpBonus(unit, 1.00);
          runtime.passiveDisabled = true;
          safeLog(`[PASSIVE] ${unit.display?.name || 'Reigen'} is last alive: +200% ATK, +100% HP, passive disabled.`, 'passive');
        } else {
          const chosen = others[Math.floor(Math.random() * others.length)];
          runtime.stolenPassiveId = cardIdOf(chosen);
          runtime.effectivePassiveId = runtime.stolenPassiveId;
          safeLog(`[PASSIVE] ${unit.display?.name || 'Reigen'} stole ${getPassiveName(chosen)}.`, 'passive');
        }
        break;
      }
      case 'frieza': {
        const sorted = enemies.slice().sort((a, b) => (Number(a?.atk) || 0) - (Number(b?.atk) || 0));
        if (team === battleState.playerTeam) battleState.enemyTeam = sorted.concat((battleState.enemyTeam || []).filter(unit => !sorted.includes(unit)));
        else battleState.playerTeam = sorted.concat((battleState.playerTeam || []).filter(unit => !sorted.includes(unit)));
        ensureCurrentIndices(battleState);
        safeLog(`[PASSIVE] ${unit.display?.name || 'Frieza'} sorted the opponent by ATK and faces the weakest first.`, 'passive');
        break;
      }
      case 'kr-decade': {
        const target = firstLiving(enemyTeam, 0);
        if (target?.card?.id) {
          runtime.stolenPassiveId = cardIdOf(target);
          runtime.effectivePassiveId = runtime.stolenPassiveId;
          safeLog(`[PASSIVE] ${unit.display?.name || 'Kamen Rider Decade'} shape-shifted into ${getPassiveName(target)} while keeping own stats.`, 'passive');
        }
        break;
      }
      case 'wish':
        for (const ally of aliveTeammates) {
          multiplyMaxHp(ally, 2.50, true);
        }
        safeLog(`[PASSIVE] ${unit.display?.name || 'Wish'} boosted all allies' maximum HP by 150%.`, 'passive');
        break;
      case 'weather-eclipse-harvester': {
        const sacrifices = aliveTeammates.filter(ally => ally !== unit).length;
        if (sacrifices > 0) {
          for (const ally of aliveTeammates) {
            if (ally === unit) continue;
            ally.hp = 0;
            ally.defeated = true;
            refreshUnitDisplay(ally);
          }
          const baseAtk = Math.max(1, Number(runtime.baseAtkAtBattleStart) || Number(unit.atk) || 1);
          const bonusPct = sacrifices;
          const bonusAtk = Math.max(0, Math.round(baseAtk * bonusPct));
          unit.atk = Math.max(1, Math.round(baseAtk * (1 + bonusPct)));
          runtime.displayAtkBonusPct = Math.max(runtime.displayAtkBonusPct, bonusPct);
          runtime.activeTags.push(`ECLIPSED +${sacrifices * 100}% ATK (+${bonusAtk.toLocaleString('en-US')})`);
          refreshUnitDisplay(unit);
          safeLog(`[PASSIVE] ${unit.display?.name || 'Griffith'} [ECLIPSED] triggered: Sacrificed ${sacrifices} allies -> +${sacrifices * 100}% ATK (+${bonusAtk.toLocaleString('en-US')} ATK).`, 'passive');
        }
        break;
      }
      case 'noelle-silva': {
        let kills = 0;
        for (const target of enemies.slice()) {
          if (!sourcePassiveAllowed(target, unit)) continue;
          const result = damageUnit(battleState, unit, target, calculateBaseDamage(unit), { passiveAttack: true, passiveBypass: true });
          if (result.killed) kills += 1;
        }
        if (kills > 0) {
          runtime.waterShield = Math.max(runtime.waterShield, Math.max(1, Number(unit.maxHp) || 1));
          addShield(unit, runtime.waterShield, 'water');
        }
        safeLog(`[PASSIVE] ${unit.display?.name || 'Noelle Silva'} summoned a tsunami for ${Math.round(calculateBaseDamage(unit)).toLocaleString('en-US')} damage.`, 'passive');
        break;
      }
      case 'kaguya':
        runtime.domainTurns = 3;
        addActiveTag(unit, 'dimensional-domain');
        battleState.passiveDomain = { owner: unit, turns: 3, skipAttacksRemaining: 2 };
        safeLog(`[PASSIVE] ${unit.display?.name || 'Kaguya'} created a 3-turn dimensional domain.`, 'passive');
        break;
      case 'hakari-jackpot':
        if (team.indexOf(unit) === 0) {
          runtime.hakariInvincible = 7;
          runtime.jackpotBoost = 'invincible';
          addActiveTag(unit, 'JACKPOT 7-TURN INVINCIBLE');
          safeLog(`[PASSIVE] ${unit.display?.name || 'Hakari Jackpot'} entered first and became invincible for 7 turns.`, 'passive');
        } else {
          const chooseHp = Math.random() < 0.5;
          runtime.jackpotBoost = chooseHp ? 'hp' : 'atk';
          if (chooseHp) multiplyMaxHp(unit, 1.77, true);
          else applyPermanentAtkBonus(unit, 0.77, 'JACKPOT +77% ATK');
          safeLog(`[PASSIVE] ${unit.display?.name || 'Hakari Jackpot'} gained a 77% ${chooseHp ? 'HP' : 'ATK'} boost.`, 'passive');
        }
        break;
      case 'weather-heavenly-seraph':
        // The source description does not define what a "perfect roll" is
        // or how much bonus power it grants. The runtime hook is registered
        // below; no invented balance value is introduced here.
        break;
      case 'starter-secret':
        runtime.passiveImmune = true;
        addActiveTag(unit, 'OMNISCIENCE');
        break;
      default:
        break;
    }

    // Entry-time state defaults.
    if (cardIdOf(unit) === 'the-flash') runtime.dodgeStreak = 0;
    if (cardIdOf(unit) === 'subaru') runtime.repeatReviveCount = 0;
    if (cardIdOf(unit) === 'yuta-okkotsu') runtime.firstFatalityUsed = false;
  }

  function beforeAttack(battleState, attacker, target) {
    const cardState = ensureCardState(attacker);
    if (!attacker || !target || !isAlive(attacker)) return;
    cardState.ownAttackCount += 1;
    cardState.attackCount = cardState.ownAttackCount;
    const runtime = cardState;
    runtime.lastTurnAttacked = true;

    const attackCount = cardState.ownAttackCount;
    const id = getEffectivePassiveCardId(attacker);
    const hpRatio = (Number(attacker.hp) || 0) / Math.max(1, Number(attacker.maxHp) || 1);

    // Low-health conditional boosts belong strictly to this attacker. The
    // runtime ATK bonus is reset when the unit is no longer below 25% HP.
    if (id === 'vegeta' || id === 'polnareff') {
      const active = hpRatio < 0.25;
      runtime.atkBonusPct = active ? 1 : 0;
      runtime.displayAtkBonusPct = active ? 1 : 0;
      if (active && !runtime.thresholdBuffAnnounced) {
        runtime.thresholdBuffAnnounced = true;
        safeLog(`[Self-Passive] ${attacker.display?.name || 'Unit'} activated +100% ATK because this unit's HP fell below 25%.`, 'passive');
        host.showBattleFloatingText?.(attacker, '+100% ATK • LOW HP', 'buff');
      }
      if (!active) runtime.thresholdBuffAnnounced = false;
    }

    if (id === 'jonathan-joestar' && attackCount === 9 && !runtime.hamonActive) {
      runtime.hamonActive = true;
      safeLog(`[PASSIVE] ${attacker.display?.name || 'Jonathan Joestar'} activated HAMONNN: +900% ATK for the rest of the match.`, 'passive');
    }

    if (id === 'kr-kuuga' && attackCount % 3 === 0) {
      runtime.formCycle = (runtime.formCycle % 3) + 1;
      runtime.kuugaForm = ['blue', 'green', 'purple'][runtime.formCycle - 1];
      if (runtime.kuugaForm === 'purple') multiplyMaxHp(attacker, 1.30, true);
      addActiveTag(attacker, `KUUGA ${runtime.kuugaForm.toUpperCase()}`);
      safeLog(`[PASSIVE] ${attacker.display?.name || 'Kamen Rider Kuuga'} changed form: ${runtime.kuugaForm.toUpperCase()}.`, 'passive');
    }

    if (id === 'giyu-tomioka' && attackCount === 5) {
      setStatus(target, 'stunTurns', 1, attacker);
      runtime.incomingImmuneTurns = Math.max(runtime.incomingImmuneTurns, 3);
      safeLog(`[PASSIVE] ${attacker.display?.name || 'Giyu Tomioka'} stunned the enemy and became immune to incoming attacks for 3 turns.`, 'passive');
    }

    // Basic attack-count passives.
    if (id === 'starter-common') {
      runtime.atkBonusPct = Math.min(1.00, runtime.atkBonusPct + 0.10);
      runtime.displayAtkBonusPct = Math.max(runtime.displayAtkBonusPct, runtime.atkBonusPct);
      addActiveTag(attacker, `FIRST STRIKE ${Math.round(runtime.atkBonusPct * 100)}%`);
      safeLog(`[PASSIVE] ${attacker.display?.name || 'Naruto Kid'} [First Strike] gained +10% ATK (current stack ${Math.round(runtime.atkBonusPct * 100)}%).`, 'passive');
    }

    if (id === 'sasuke-kid' && attackCount === 3) {
      runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, 2.5);
    }

    if (id === 'gon-kid' && attackCount === 1 && Math.random() < 0.33) {
      runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, 2);
    }

    if (id === 'starter-epic' && attackCount % 2 === 0) {
      runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, 1.50);
    }

    if (id === 'hakari' && attackCount === 7 && Math.random() < 0.07) {
      runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, 77);
      markAttackTag(attacker, 'LUCKY TRAIN x77');
      safeLog(`[PASSIVE] ${attacker.display?.name || 'Hakari'} triggered Lucky Train on attack #7 -> 7% chance for 7700% total damage.`, 'passive');
    }

    if (id === 'saber' && attackCount === 8) {
      runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, 8);
      markAttackTag(attacker, 'EXCALIBUR 8TH STRIKE');
      safeLog(`[PASSIVE] ${attacker.display?.name || 'Saber'} [EXCALIBUR!!!] triggered on 8th personal attack -> 800% total strike damage.`, 'passive');
    }

    if (id === 'kaneki-ghoul' && attackCount % 3 === 0 && sourcePassiveAllowed(target, attacker)) {
      const blood = Math.max(0, Math.floor((Number(target.hp) || 0) * 0.25));
      if (blood > 0) {
        heal(attacker, blood, 'GHOUL 25% enemy current HP', battleState, attacker);
        safeLog(`[PASSIVE] ${attacker.display?.name || 'Kaneki'} drained ${blood.toLocaleString('en-US')} HP from the target.`, 'passive');
      }
    }

    if (id === 'yuji-itadori' && Math.random() < 0.33) {
      runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, 3);
    }

    if (id === 'viltrumite' && attackCount % 3 === 0 && Math.random() < 0.33) {
      runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, 3.22);
    }

    if (id === 'whitebeard' && attackCount === 4) {
      runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, 3);
    }

    if (id === 'whitebeard' && attackCount === 4) {
      runtime.quakeHermit = true;
    }

    if (id === 'grimmjaw' && attackCount === 5) {
      runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, 2);
    }

    if (id === 'cid-shadow' && attackCount % 10 === 0) {
      runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, 100);
    }

    if (id === 'adult-gon') {
      const chance = hpRatio < 0.10 ? 0.50 : 0.25;
      if (Math.random() < chance) {
        runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, hpRatio < 0.10 ? 6 : 4);
      }
    }

    if (id === 'garp' && attackCount === 3) {
      setStatus(target, 'stunTurns', 2, attacker);
      safeLog(`[PASSIVE] ${attacker.display?.name || 'Garp'} triggered Fist of Love on attack #3 -> STUN 2 turns.`, 'passive');
    }

    if (id === 'gohan') {
      const strongest = selectStrongestEnemy(battleState, attacker);
      if (strongest) {
        runtime.overrideTarget = strongest;
        runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, 2);
        safeLog(`[PASSIVE] ${attacker.display?.name || 'Gohan'} [MASENKO] locked the strongest enemy and deals 200% ATK (${Math.round((Number(attacker.atk) || 0) * 2).toLocaleString('en-US')} base damage before mitigation).`, 'passive');
      }
    }

    if (id === 'toshiro' && runtime.toshiroBuff && Math.random() < 0.50 && sourcePassiveAllowed(target, attacker)) {
      setStatus(target, 'stunTurns', 1, attacker);
      safeLog(`[PASSIVE] ${attacker.display?.name || 'Toshiro'} [Absolute Zero] triggered: 50% stun chance succeeded -> 1 turn STUN.`, 'passive');
    }

    if (id === 'starter-legendary' && attackCount % 5 === 0) {
      addDot(target, 'burn', 10, Math.max(1, Math.floor(getBaseAtk(attacker) * 0.10)), attacker);
      safeLog(`[PASSIVE] ${attacker.display?.name || 'Son Goku'} applied Kamehameha damage for 10 turns.`, 'passive');
    }

    if (id === 'jotaro-kujo' || id === 'denji' || id === 'kamen-rider-kabuto' || id === 'uchiha-sasuke') {
      // Follow-up chance is handled in applyHitEffects.
    }

    if (id === 'guts' && !runtime.berserker && Math.random() < 0.33) {
      runtime.berserker = true;
      addActiveTag(attacker, 'BERSERKER');
      safeLog(`[PASSIVE] ${attacker.display?.name || 'Guts'} entered Berserker mode.`, 'passive');
    }

    if (id === 'asta-demon') {
      const turnKey = Number(battleState?.turnCount ?? battleState?.turnCounter) || 0;
      if (runtime.magicModeTurn !== turnKey) {
        runtime.magicModeTurn = turnKey;
        runtime.magicMode = Math.random() < 0.5 ? 'Demon Slayer' : 'Demon Dweller';
        runtime.damageReductionPct = runtime.magicMode === 'Demon Dweller' ? 0.15 : 0;
        addActiveTag(attacker, runtime.magicMode);
        safeLog(`[PASSIVE] ${attacker.display?.name || 'Demon Asta'} selected ${runtime.magicMode} for turn ${turnKey}.`, 'passive');
      }
    }

    if (id === 'weather-malevolent-king' && attackCount === 5) {
      runtime.malevolentKitchen = true;
    }

    if (id === 'weather-solar-deity' && getWeatherActive('Sunny') && !runtime.sunnyBuffAnnounced) {
      runtime.sunnyBuffAnnounced = true;
      safeLog(`[PASSIVE] ${attacker.display?.name || 'Escanor'} doubled attack damage while Sunny is active.`, 'passive');
    }
    if (id === 'weather-solar-deity' && !getWeatherActive('Sunny')) {
      runtime.sunnyBuffAnnounced = false;
    }

    if (id === 'aatrox') {
      heal(attacker, (Number(attacker.maxHp) || 0) * 0.05, 'WORLD ENDER', battleState, attacker);
    }

    // Peashooter heals once per global turn in resolvePassiveTurnEffects,
    // not once per attack.
    if (id === 'shanks' && runtime.nextAttackBonus > 0) {
      runtime.nextAttackMultiplier = Math.max(runtime.nextAttackMultiplier, 1 + runtime.nextAttackBonus);
      runtime.nextAttackBonus = 0;
    }

    if (id === 'uchiha-sasuke' && hpRatio < 0.40 && !runtime.sasukeLowHpTriggered) {
      runtime.sasukeLowHpTriggered = true;
      runtime.stormAtkDelta = Math.max(1, Math.round((Number(attacker.atk) || 1) * 0.60));
      attacker.atk = Math.max(1, (Number(attacker.atk) || 1) + runtime.stormAtkDelta);
      runtime.displayAtkBonusPct = Math.max(runtime.displayAtkBonusPct, 0.60);
      runtime.stormTurns = 6;
      applyDamageReduction(attacker, 0.30, 6, 'STORM SUSANO');
      safeLog(`[PASSIVE] ${attacker.display?.name || 'Uchiha Sasuke'} activated low-HP Storm Susano: +60% ATK and 30% damage reduction for 6 turns.`, 'passive');
    }

    if (id === 'weather-reaper-hollow') runtime.lastCriticalFinisher = false;

    // Aura Farmer loses one stack each time Piccolo attacks.
    if (id === 'piccolo' && runtime.buffStacks > 0) {
      runtime.buffStacks = Math.max(0, runtime.buffStacks - 1);
    }

    // First target restriction from Sweet Destruction.
    if (id === 'android-21' && target) {
      if (runtime.lastFacingTarget && runtime.lastFacingTarget !== target) {
        runtime.facingTurns = 0;
      }
      runtime.lastFacingTarget = target;
      runtime.facingTurns += 1;
      if (runtime.facingTurns > 3 && !runtime.absorbedAttack) {
        runtime.absorbedAttack = Math.max(0, getBaseAtk(target) * 0.50);
        attacker.atk += Math.max(1, Math.floor(runtime.absorbedAttack));
        refreshUnitDisplay(attacker);
        ensureRuntime(target).noDodgeAgainstUnit = true;
        safeLog(`[PASSIVE] ${attacker.display?.name || 'Android 21'} absorbed 50% of the target's base ATK; the target can no longer dodge this attacker.`, 'passive');
      }
    }

    if (id === 'asta-demon') {
      // impossible alias guard
    }
  }

  function passiveAttackMultiplier(attacker, target, battleState, options = {}) {
    const runtime = ensureRuntime(attacker);
    const id = getEffectivePassiveCardId(attacker);
    let multiplier = Math.max(0.01, Number(runtime.nextAttackMultiplier) || 1);

    if (runtime.stolenPassiveId && runtime.effectivePassiveId === runtime.stolenPassiveId && id !== cardIdOf(attacker)) {
      // no-op; handler dispatch already follows effective passive id
    }

    if (id === 'boa-hancock' && ensureRuntime(target).freezeTurns > 0) multiplier *= 1.5;
    if (id === 'luffy-nightmare' && runtime.absorbedAttack > 0) multiplier *= 1 + runtime.absorbedAttack;
    if (id === 'guts' && runtime.berserker) {
      // Berserker's damage is normal ATK; only bleed is added.
    }
    if (id === 'piccolo' && runtime.buffStacks > 0) multiplier *= 1 + runtime.buffStacks * 0.10;
    if (id === 'doppio' && runtime.buffStacks > 0) multiplier *= 1 + runtime.buffStacks * 0.20;
    if (id === 'jonathan-joestar' && runtime.hamonActive) multiplier *= 10;
    if (id === 'weather-solar-deity' && getWeatherActive('Sunny')) multiplier *= 2;
    if (id === 'erwin' && runtime.capitanBuffApplied) { /* applied directly */ }
    if (runtime.nextAttackIsBuffed) {
      multiplier *= 1.30;
      runtime.nextAttackIsBuffed = false;
    }
    if (runtime.nextAttackBonus > 0) {
      multiplier *= 1 + runtime.nextAttackBonus;
      runtime.nextAttackBonus = 0;
    }
    if (runtime.jackpotBoost === 'atk') multiplier *= 1.77;
    if (runtime.nextEnemyDoubleStrike) {
      multiplier *= 2;
      runtime.nextEnemyDoubleStrike = false;
    }
    if (runtime.magicMode === 'Demon Slayer') multiplier *= 1.65;
    if (runtime.magicMode === 'Demon Dweller') {
      multiplier *= 1.50;
      const lastHit = Math.max(0, Number(runtime.lastHitReceived) || 0);
      if (lastHit > 0) multiplier += (0.35 * lastHit) / Math.max(1, Number(attacker.atk) || 1);
    }
    if (id === 'weather-malevolent-king' && runtime.malevolentKitchen && (Number(target.hp) || 0) > (Number(target.maxHp) || 1) * 0.50) multiplier *= 1.0;

    runtime.nextAttackMultiplier = 1;
    return multiplier;
  }

  function applyHitEffects(battleState, attacker, target, outcome) {
    const runtime = ensureRuntime(attacker);
    const targetRuntime = ensureRuntime(target);
    const id = getEffectivePassiveCardId(attacker);

    if (!outcome || !outcome.hit || !target) return;

    if (outcome.critical) onCritical(battleState, attacker, target, { ...outcome, sourceCardId: cardIdOf(attacker) });

    switch (id) {
      case 'deku-mc':
        if (Math.random() < 0.20) {
          heal(attacker, (Number(attacker.maxHp) || 0) * 0.20, 'What can i get you sir', battleState, attacker);
        }
        break;

      case 'jotaro-kujo':
        if (Math.random() < 0.50 && outcome.chainDepth < 8 && isAlive(attacker) && isAlive(target)) {
          const first = performAttack(battleState, attacker, target, {
            isFollowUp: true, passiveAttack: true, damageMultiplier: 0.40, chainDepth: outcome.chainDepth + 1
          });
          safeLog(`[PASSIVE] ${attacker.display?.name || 'Jotaro Kujo'} [Ora Ora] follow-up triggered: 40% ATK (${Math.max(0, Number(first?.damage) || 0).toLocaleString('en-US')} damage).`, 'passive');
          if (Math.random() < 0.25 && isAlive(attacker) && isAlive(target) && outcome.chainDepth < 7) {
            const second = performAttack(battleState, attacker, target, {
              isFollowUp: true, passiveAttack: true, damageMultiplier: 0.40, chainDepth: outcome.chainDepth + 2
            });
            safeLog(`[PASSIVE] ${attacker.display?.name || 'Jotaro Kujo'} [Ora Ora] second follow-up triggered: 40% ATK (${Math.max(0, Number(second?.damage) || 0).toLocaleString('en-US')} damage).`, 'passive');
          }
        }
        break;

      case 'denji':
        if (Math.random() < 0.33 && outcome.chainDepth < 8 && isAlive(attacker) && isAlive(target)) {
          const follow = performAttack(battleState, attacker, target, {
            isFollowUp: true, passiveAttack: true, damageMultiplier: 1, chainDepth: outcome.chainDepth + 1
          });
          safeLog(`[PASSIVE] ${attacker.display?.name || 'Denji'} [POCHITA] follow-up triggered: 100% ATK (${Math.max(0, Number(follow?.damage) || 0).toLocaleString('en-US')} damage).`, 'passive');
        }
        break;

      case 'kamen-rider-kabuto':
        if (isUnitStunned(target)) {
          heal(attacker, (Number(attacker.maxHp) || 0) * 0.05, 'CLOCK UP stun heal', battleState, attacker);
          safeLog(`[PASSIVE] ${attacker.display?.name || 'Kamen Rider Kabuto'} healed 5% MAX HP while attacking a stunned target.`, 'passive');
        }
        if (Math.random() < 0.10 && outcome.chainDepth < 8 && isAlive(target)) {
          setStatus(target, 'stunTurns', 1, attacker);
          const follow = performAttack(battleState, attacker, target, {
            isFollowUp: true, passiveAttack: true, damageMultiplier: 1, chainDepth: outcome.chainDepth + 1
          });
          safeLog(`[PASSIVE] ${attacker.display?.name || 'Kamen Rider Kabuto'} [CLOCK UP] follow-up triggered: 100% ATK (${Math.max(0, Number(follow?.damage) || 0).toLocaleString('en-US')} damage) + 1 turn STUN.`, 'passive');
        }
        break;

      case 'uchiha-itachi':
        if (Math.random() < 0.30 && sourcePassiveAllowed(target, attacker)) {
          addDot(target, 'burn', 3, Math.max(1, Math.floor(getBaseAtk(attacker) * 0.05)), attacker);
          performAttack(battleState, attacker, target, {
            isFollowUp: true, passiveAttack: true, damageMultiplier: 1, chainDepth: outcome.chainDepth + 1
          });
          safeLog(`[PASSIVE] ${attacker.display?.name || 'Uchiha Itachi'} inflicted Burn for 3 turns.`, 'passive');
        }
        break;

      case 'uchiha-sasuke':
        if (Math.random() < 0.15 && outcome.chainDepth < 8 && isAlive(target)) {
          addDot(target, 'burn', 3, Math.max(1, Math.floor(getBaseAtk(attacker) * 0.25)), attacker);
          performAttack(battleState, attacker, target, {
            isFollowUp: true, passiveAttack: true, damageMultiplier: 1, chainDepth: outcome.chainDepth + 1
          });
          safeLog(`[PASSIVE] ${attacker.display?.name || 'Uchiha Sasuke'} chained a follow-up Burn attack.`, 'passive');
        }
        break;

      case 'weather-shadow-monarch':
        if (Math.random() < 0.30 && outcome.chainDepth < 8) {
          const ally = alliesOf(battleState, attacker, false)
            .filter(candidate => candidate !== attacker)[0];
          if (ally) {
            performAttack(battleState, ally, target, {
              isFollowUp: true, passiveAttack: true, outOfTurnPassive: true, damageMultiplier: 1, chainDepth: outcome.chainDepth + 1
            });
            safeLog(`[Support] ${attacker.display?.name || 'Igris'} called a teammate follow-up attack.`, 'support');
          }
        }
        break;


      case 'guts':
        if (runtime.berserker && sourcePassiveAllowed(target, attacker)) {
          addDot(target, 'bleed', 2, Math.max(1, Math.floor(getBaseAtk(attacker) * 0.10)), attacker);
        }
        break;

      case 'nezuko':
        if (sourcePassiveAllowed(target, attacker)) {
          addDot(target, 'bleed', 2, Math.max(1, Math.floor(getBaseAtk(attacker) * 0.05)), attacker);
        }
        break;

      case 'dio-brando':
        if (Math.random() < 0.20 && sourcePassiveAllowed(target, attacker)) {
          setStatus(target, 'freezeTurns', 2, attacker);
          heal(attacker, (Number(attacker.maxHp) || 0) * 0.20, 'WGRYYYY freeze heal', battleState, attacker);
        }
        break;

      case 'rukia':
        if (Math.random() < 0.10 && sourcePassiveAllowed(target, attacker)) {
          setStatus(target, 'freezeTurns', 1, attacker);
          const bonus = Math.max(1, Math.floor(getBaseAtk(attacker) * 0.35));
          const extra = damageUnit(battleState, attacker, target, bonus, { passiveAttack: true, passiveBypass: true });
          safeLog(`[PASSIVE] ${attacker.display?.name || 'Rukia'} froze the target and dealt +35% ATK bonus damage.`, 'passive');
          if (extra.killed) onKill(battleState, attacker, target);
        }
        break;

      case 'boa-hancock':
        if (getCardAttackCount(attacker) % 2 === 0 && Math.random() < 0.69 && sourcePassiveAllowed(target, attacker)) {
          setStatus(target, 'freezeTurns', 1, attacker);
          const bonus = Math.max(1, Math.floor(getBaseAtk(attacker) * 0.50));
          const extra = damageUnit(battleState, attacker, target, bonus, { passiveAttack: true, passiveBypass: true });
          safeLog(`[PASSIVE] ${attacker.display?.name || 'Boa Hancock'} froze the target and dealt +50% ATK bonus damage.`, 'passive');
          if (extra.killed) onKill(battleState, attacker, target);
        }
        break;

      case 'madness-doctor':
        if (getCardAttackCount(attacker) % 2 === 0 && Math.random() < 0.40 && sourcePassiveAllowed(target, attacker)) {
          const beforeDoctorPct = targetRuntime.weakenAttackPct;
          targetRuntime.weakenAttackTurns = Math.max(targetRuntime.weakenAttackTurns, 2);
          targetRuntime.weakenAttackPct = Math.max(targetRuntime.weakenAttackPct, 0.05);
          if (targetRuntime.weakenAttackPct > beforeDoctorPct) {
            safeLog(`[Debuff] ${target.display?.name || 'Enemy'} ATK reduced by 5% by ${attacker.display?.name || 'Madness Doctor'} for 2 turns.`, 'debuff');
            host.showBattleFloatingText?.(target, '-5% ATK • Doctor', 'debuff');
          }
        }
        break;

      case 'katakuri':
        if (Math.random() < 0.27 && sourcePassiveAllowed(target, attacker)) {
          const beforeKatakuriPct = targetRuntime.weakenAttackPct;
          targetRuntime.weakenAttackTurns = Math.max(targetRuntime.weakenAttackTurns, 2);
          targetRuntime.weakenAttackPct = Math.max(targetRuntime.weakenAttackPct, 0.10);
          if (targetRuntime.weakenAttackPct > beforeKatakuriPct) {
            safeLog(`[Debuff] ${target.display?.name || 'Enemy'} ATK reduced by 10% by ${attacker.display?.name || 'Katakuri'} for 2 turns.`, 'debuff');
            host.showBattleFloatingText?.(target, '-10% ATK • Katakuri', 'debuff');
          }
          heal(attacker, (Number(attacker.maxHp) || 0) * 0.10, 'MOCHI self-heal', battleState, attacker);
        }
        break;

      case 'adam-francis':
        if (Math.random() < 0.20 && sourcePassiveAllowed(target, attacker)) {
          setStatus(target, 'stunTurns', 1, attacker);
          const beforeAdamPct = targetRuntime.weakenAttackPct;
          targetRuntime.weakenAttackTurns = Math.max(targetRuntime.weakenAttackTurns, 3);
          targetRuntime.weakenAttackPct = Math.max(targetRuntime.weakenAttackPct, 0.18);
          if (targetRuntime.weakenAttackPct > beforeAdamPct) {
            safeLog(`[Debuff] ${target.display?.name || 'Enemy'} ATK reduced by 18% by ${attacker.display?.name || 'Adam Francis'} for 3 turns.`, 'debuff');
            host.showBattleFloatingText?.(target, '-18% ATK • Adam Francis', 'debuff');
          }
        }
        break;

      case 'giyu-tomioka':
        // Exact fifth-attack behavior is set before the attack.
        break;

      case 'weather-reaper-hollow':
        // Critical finisher is handled by onCritical.
        break;

      case 'weather-malevolent-king':
        if (runtime.malevolentKitchen && isAlive(target)) {
          let slashes = 0;
          while (isAlive(target) &&
                 target.hp > (Number(target.maxHp) || 1) * 0.50 &&
                 slashes < MAX_SLASHES &&
                 outcome.chainDepth < MAX_CHAIN_ATTACKS) {
            const slash = performAttack(battleState, attacker, target, {
              isFollowUp: true, passiveAttack: true, damageMultiplier: 1, chainDepth: outcome.chainDepth + 1
            });
            slashes += 1;
            if (slash.killed) break;
          }
          if (slashes) safeLog(`[PASSIVE] ${attacker.display?.name || 'Malevolent King'} unleashed ${slashes} additional slashes.`, 'passive');
        }
        break;

      case 'starter-epic':
        // The x1.5 punch is folded into the current attack multiplier every second attack.
        break;

      case 'whitebeard':
        if (getCardAttackCount(attacker) === 4) {
          const targets = enemiesOf(battleState, attacker);
          const closestTwo = targets.slice(0, 2);
          const results = applyAreaAttack(battleState, attacker, closestTwo, 3, { chainDepth: outcome.chainDepth });
          setStatus(target, 'stunTurns', 2, attacker);
          for (const result of results) {
            const hitTarget = result?.target;
            if (hitTarget && sourcePassiveAllowed(hitTarget, attacker)) setStatus(hitTarget, 'stunTurns', 2, attacker);
          }
          safeLog(`[PASSIVE] ${attacker.display?.name || 'WhiteBeard'} struck the two closest enemies for 3× ATK and stunned them.`, 'passive');
        }
        break;

      case 'grimmjaw':
        if (getCardAttackCount(attacker) === 5) {
          const targets = enemiesOf(battleState, attacker);
          applyAreaAttack(battleState, attacker, targets, 2, { chainDepth: outcome.chainDepth });
          safeLog(`[PASSIVE] ${attacker.display?.name || 'Grimmjaw'} blasted all enemies for 2× ATK.`, 'passive');
        }
        break;

      case 'cid-shadow':
        if (getCardAttackCount(attacker) % 10 === 0) {
          const targets = enemiesOf(battleState, attacker);
          applyAreaAttack(battleState, attacker, targets, 100, { chainDepth: outcome.chainDepth });
          safeLog(`[PASSIVE] ${attacker.display?.name || 'Cid Atomic'} struck all enemies for 100× ATK.`, 'passive');
        }
        break;

      case 'yuno':
        if (Math.random() < 0.45 && isAlive(target)) {
          const enemies = enemiesOf(battleState, attacker);
          const index = enemies.indexOf(target);
          const next = enemies[index + 1];
          if (next) {
            performAttack(battleState, attacker, next, {
              isFollowUp: true, passiveAttack: true, damageMultiplier: 1, chainDepth: outcome.chainDepth + 1
            });
            if (Math.random() < 0.15) {
              const nextNext = enemies[index + 2];
              if (nextNext) {
                performAttack(battleState, attacker, nextNext, {
                  isFollowUp: true, passiveAttack: true, damageMultiplier: 1, chainDepth: outcome.chainDepth + 2
                });
              }
            }
          }
        }
        break;

      case 'asta-demon':
        // Demon Slayer reflection is resolved in onHitTaken so it sees the
        // actual incoming hit exactly once.
        break;

      case 'weather-shadow-monarch':
        break;

      case 'luffy-nightmare':
        // Reflection occurs in onHitTaken.
        break;

      case 'weather-tsukuyomi-eye':
      case 'diavolo':
        break;

      case 'doflamingo':
        break;

      case 'hutao':
        if (sourcePassiveAllowed(target, attacker)) {
          addDot(target, 'burn', 2, Math.max(1, Math.floor(getBaseAtk(attacker) * 0.50)), attacker);
          safeLog(`[PASSIVE] ${attacker.display?.name || 'Hutao'} applied a heavy Burn.`, 'passive');
        }
        break;

      case 'weather-solar-deity':
        break;

      case 'starter-common':
        break;

      case 'peashooter':
        break;

      case 'jotaro-kujo':
        break;

      case 'kaneki-ghoul':
        break;

      case 'bounty-hunter':
        break;

      case 'saber':
        break;

      case 'jonathan-joestar':
        break;

      case 'viltrumite':
        break;

      case 'yuji-itadori':
        break;

      case 'hakari':
        break;

      default:
        break;
    }

    // Passive-specific debuff cleanup for Mahito.
    if (getEffectivePassiveCardId(target) === 'mahito') {
      applyMahitoDebuffClearIfNeeded(battleState, target);
    }
  }

  function onCritical(battleState, attacker, target, outcome) {
    if (!attacker || !target || !outcome?.critical) return;
    if (outcome.sourceCardId && String(outcome.sourceCardId) !== String(cardIdOf(attacker))) return;
    const id = getEffectivePassiveCardId(attacker);

    switch (id) {
      case 'ice-admiral':
      case 'weather-frost-sovereign': {
        const chance = id === 'ice-admiral' ? 0.33 : 0.67;
        if (Math.random() < chance && sourcePassiveAllowed(target, attacker)) {
          setStatus(target, 'freezeTurns', 1, attacker);
          safeLog(`[PASSIVE] ${getPassiveName(attacker)} froze the target after a critical hit.`, 'passive');
        }
        break;
      }
      case 'weather-reaper-hollow':
        if (sourcePassiveAllowed(target, attacker) && isAlive(target)) {
          target.hp = 0;
          target.defeated = true;
          safeLog(`[PASSIVE] ${attacker.display?.name || 'Vasto Lord'} finished the target with a spectral silver edge.`, 'passive');
        }
        break;
      default:
        break;
    }
    ensureRuntime(attacker).lastCrit = true;
  }

  function onDodge(battleState, defender, attacker, outcome = {}) {
    if (!defender || !attacker) return;
    const id = getEffectivePassiveCardId(defender);
    const runtime = ensureRuntime(defender);
    runtime.dodgeStreak += 1;
    runtime.lastDodge = true;

    switch (id) {
      case 'buggy':
        safeLog(`[Self-Passive] ${defender.display?.name || 'Buggy'} dodged the incoming attack. Counter-attacks are disabled for non-support cards.`, 'passive');
        host.showBattleFloatingText?.(defender, 'DODGE', 'dodge');
        break;
      case 'kakashi':
        safeLog(`[Self-Passive] ${defender.display?.name || 'Kakashi'} dodged the incoming attack. Counter-attacks are disabled for non-support cards.`, 'passive');
        host.showBattleFloatingText?.(defender, 'DODGE', 'dodge');
        break;
      case 'the-flash':
        if (runtime.dodgeStreak > 3) {
          defender.hp = 0;
          defender.defeated = true;
          safeLog(`[PASSIVE] ${defender.display?.name || 'The Flash'} suffered a heart attack after 4 consecutive dodges.`, 'passive');
        }
        break;
      case 'shanks':
        runtime.nextAttackBonus = Math.min(2.00, (runtime.nextAttackBonus || 0) + 0.25);
        safeLog(`[PASSIVE] ${defender.display?.name || 'Shanks'} gained +25% ATK on the next attack.`, 'passive');
        break;
      case 'light-admiral':
        setStatus(attacker, 'stunTurns', 1, defender);
        break;
      case 'weather-tsukuyomi-eye':
      case 'diavolo':
        setStatus(attacker, 'stunTurns', 3, defender);
        break;
      case 'subaru':
        // The +20% ATK bonus is granted on revival, not on dodge.
        runtime.postReviveDodgeBonus = Math.max(runtime.postReviveDodgeBonus, 0.15);
        break;
      default:
        break;
    }
  }

  function onHitTaken(battleState, defender, attacker, outcome) {
    if (!defender || !attacker || !outcome?.hit) return;
    const runtime = ensureRuntime(defender);
    const id = getEffectivePassiveCardId(defender);

    runtime.hitsTaken += 1;
    runtime.lastDamageTaken = Math.max(0, Number(outcome.damage) || 0);
    runtime.lastHitReceived = Math.max(0, Number(outcome.damage) || 0);

    switch (id) {
      case 'meruem':
        heal(defender, (Number(defender.maxHp) || 0) * 0.15, 'AURA SYNTHESIS', battleState, defender);
        runtime.auraStacks = Math.min(5, runtime.auraStacks + 1);
        addActiveTag(defender, `AURA ${runtime.auraStacks}/5`);
        break;

      case 'doppio':
        if (Math.random() < 0.20) {
          runtime.buffStacks = Math.min(100, runtime.buffStacks + 1);
          safeLog(`[PASSIVE] ${defender.display?.name || 'Doppio'} gained +20% ATK stack (${runtime.buffStacks * 20}% / 2000%).`, 'passive');
        }
        break;

      case 'luffy-nightmare':
        if (outcome.damage > 0) {
          const reflect = Math.max(0, Math.floor(outcome.damage * 0.50));
          if (reflect > 0 && isAlive(attacker)) {
            const reflected = damageUnit(battleState, defender, attacker, reflect, { passiveAttack: true, passiveBypass: true });
            safeLog(`[PASSIVE] ${defender.display?.name || 'Luffy Nightmare'} reflected ${reflect.toLocaleString('en-US')} damage.`, 'passive');
            if (reflected.killed) onKill(battleState, defender, attacker);
          }
        }
        break;

      case 'mahoraga':
        if (Math.random() < 0.25) {
          runtime.damageReductionPct = Math.max(runtime.damageReductionPct, 0.25);
          addActiveTag(defender, 'ADAPTED 25% REDUCTION');
          safeLog(`[PASSIVE] ${defender.display?.name || 'Mahoraga'} adapted and gained 25% incoming damage reduction.`, 'passive');
        }
        break;

      case 'asta-demon':
        if (runtime.magicMode === 'Demon Slayer' && Math.random() < 0.25 && isAlive(attacker)) {
          const reflected = Math.max(1, Math.floor((Number(outcome.damage) || 0) * 0.50));
          const result = damageUnit(battleState, defender, attacker, reflected, { passiveAttack: true, passiveBypass: true });
          safeLog(`[PASSIVE] ${defender.display?.name || 'Demon Asta'} reflected 50% of the incoming damage.`, 'passive');
          if (result.killed) onKill(battleState, defender, attacker);
        }
        break;

      case 'adaption':
        // Legacy alias guard.
        break;

      default:
        break;
    }

    // Doppio/FROG stacks carry between enemies in the same battle.
    if (id === 'doppio') addActiveTag(defender, `FROG ${runtime.buffStacks * 20}%`);

    // Mahito consumes one Soul to clear the first debuff actually applied to him.
    if (id === 'mahito' && runtime.soul > 0) {
      applyMahitoDebuffClearIfNeeded(battleState, defender);
    }
  }

  function onTeammateDeath(battleState, victim) {
    if (!battleState || !victim) return;
    const team = teamOf(battleState, victim);
    const jinUnits = aliveUnits(team).filter(unit => getEffectivePassiveCardId(unit) === 'jin-mori');
    for (const jin of jinUnits) {
      if (ensureRuntime(jin).cloneCount >= 3) continue;
      createJinMoriCloneForDeadTeammate(battleState, jin, victim);
    }
  }

  function onKill(battleState, killer, victim, context = {}) {
    if (!killer || !victim) return;
    const runtime = ensureRuntime(killer);
    runtime.kills += 1;
    const id = getEffectivePassiveCardId(killer);

    switch (id) {
      case 'normal-demon':
        applyMaxHpBonus(killer, 0.10);
        heal(killer, (Number(killer.maxHp) || 0) * 0.10, 'Lifesteal', battleState, killer);
        safeLog(`[PASSIVE] ${killer.display?.name || 'Normal Demon'} gained +10% HP after a kill.`, 'passive');
        break;

      case 'bounty-hunter': {
        const bounty = Math.max(0, Math.floor(Number(victim.hpBeforeDeath) || Number(victim.maxHp) || 0));
        battleState.passiveCashBonus = Math.max(0, Number(battleState.passiveCashBonus) || 0) + bounty;
        safeLog(`[PASSIVE] ${killer.display?.name || 'Bounty Hunter'} earned ${bounty.toLocaleString('en-US')} VNĐ bounty.`, 'passive');
        break;
      }

      case 'blackbeard': {
        const bonus = Math.max(0, Math.floor((Number(victim.atk) || 0) * 0.25));
        const beforeAtk = Math.max(1, Number(killer.atk) || 1);
        killer.atk = Math.max(1, beforeAtk + bonus);
        runtime.flatAtkBonusDisplay = Math.max(0, Number(runtime.flatAtkBonusDisplay) || 0) + bonus;
        runtime.activeTags.push(`LIBERATION +${bonus.toLocaleString('en-US')} ATK`);
        refreshUnitDisplay(killer);
        safeLog(`[PASSIVE] ${killer.display?.name || 'BlackBeard'} [Liberation] triggered: +${bonus.toLocaleString('en-US')} ATK (25% of defeated enemy ATK).`, 'passive');
        break;
      }

      case 'android-21': {
        heal(killer, (Number(victim.maxHp) || 0) * 0.30, 'SWEET DESTRUCTION', battleState, killer);

        // Refresh the 2-turn +20% stat buff without stacking duplicate
        // temporary deltas. Any permanent ATK/HP earned elsewhere remains intact.
        if (runtime.temporaryAtkDelta > 0) {
          killer.atk = Math.max(1, (Number(killer.atk) || 1) - runtime.temporaryAtkDelta);
        }
        if (runtime.temporaryMaxHpDelta > 0) {
          killer.maxHp = Math.max(1, (Number(killer.maxHp) || 1) - runtime.temporaryMaxHpDelta);
          killer.hp = Math.min(killer.maxHp, Math.max(1, Number(killer.hp) || 1));
        }

        const atkBase = Math.max(1, Number(killer.atk) || 1);
        const maxHpBase = Math.max(1, Number(killer.maxHp) || 1);
        runtime.temporaryAtkDelta = Math.max(1, Math.round(atkBase * 0.20));
        runtime.temporaryMaxHpDelta = Math.max(1, Math.round(maxHpBase * 0.20));
        killer.atk = atkBase + runtime.temporaryAtkDelta;
        killer.maxHp = maxHpBase + runtime.temporaryMaxHpDelta;
        killer.hp = Math.min(killer.maxHp, Math.max(1, Math.round((Number(killer.hp) || 1) * 1.20)));

        runtime.temporaryAtkBonusPct = 0.20;
        runtime.temporaryMaxHpBonusPct = 0.20;
        runtime.temporaryStatsTurns = 2;
        refreshUnitDisplay(killer);
        safeLog(`[PASSIVE] ${killer.display?.name || 'Android 21'} gained +20% ATK/HP for 2 turns.`, 'passive');
        break;
      }

      case 'mahito':
        if ((Number(victim.hpBeforeDeath) || 0) < (Number(victim.maxHp) || 1) * 0.10) {
          runtime.soul += 1;
          safeLog(`[PASSIVE] ${killer.display?.name || 'Mahito'} gained 1 Soul (${runtime.soul}).`, 'passive');
        }
        break;

      case 'rimuru':
        runtime.slimePoints += 1;
        applyPermanentAtkBonus(killer, 0.30, 'SLIME +30% ATK');
        applyMaxHpBonus(killer, 0.20);
        safeLog(`[PASSIVE] ${killer.display?.name || 'Rimuru'} gained 1 Slime Point (${runtime.slimePoints}).`, 'passive');
        break;


      case 'garp':
        if ((Number(ensureCardState(killer).ownAttackCount) || 0) < 3 && !runtime.garpKillTriggerUsed) {
          runtime.garpKillTriggerUsed = true;
          runtime.nextEnemyDoubleStrike = true;
          safeLog(`[PASSIVE] ${killer.display?.name || 'Garp'} triggered Fist of Love follow-up rule -> next enemy takes 200% ATK.`, 'passive');
        }
        break;

      case 'builderman': {
        const builder = aliveUnits(teamOf(battleState, killer))
          .find(candidate => getEffectivePassiveCardId(candidate) === 'builderman');
        if (builder) {
          const builderRuntime = ensureRuntime(builder);
          const saved = Math.max(0, Number(builderRuntime.builderTowerAtk) || 0);
          if (saved > 0) {
            heal(builder, saved, 'DEVELOPER tower conversion', battleState, builder);
            builderRuntime.builderTowerAtk = 0;
            safeLog(`[PASSIVE] Builderman converted ${Math.floor(saved).toLocaleString('en-US')} tower power into HP.`, 'passive');
          }
        }
        break;
      }

      case 'mahoraga':
        heal(killer, (Number(killer.maxHp) || 0) * 0.50, 'ADAPTION kill heal', battleState, killer);
        runtime.damageReductionPct = 0;
        runtime.absorbedOpponentId = null;
        break;

      case 'doflamingo':
        if (!runtime.stringArmyUsed && Math.random() < 0.30) {
          runtime.stringArmyUsed = true;
          const clone = cloneAsTemporaryAlly(victim, killer, battleState, 1);
          if (clone) {
            // The transformed enemy joins as a temporary reserve fighter.
            appendTeamUnit(teamOf(battleState, killer), clone);
            safeLog(`[PASSIVE] ${killer.display?.name || 'Doflamingo'} turned the defeated enemy into a temporary teammate.`, 'passive');
          }
        }
        break;

      case 'dante-limbus':
        if (context.fatality === true) reviveTeammateAsDante(battleState, killer);
        break;

      case 'jin-mori':
        // Jin Mori clones are created when one of his teammates dies;
        // the teammate-death hook below supplies the correct victim passive.
        break;

      default:
        break;
    }

    // Builderman converts saved tower power when any allied unit secures a kill.
    if (id !== 'builderman') {
      const builder = aliveUnits(teamOf(battleState, killer)).find(candidate => getEffectivePassiveCardId(candidate) === 'builderman');
      if (builder) {
        const builderRuntime = ensureRuntime(builder);
        const saved = Math.max(0, Number(builderRuntime.builderTowerAtk) || 0);
        if (saved > 0) {
          heal(builder, saved, 'DEVELOPER tower conversion', battleState, builder);
          builderRuntime.builderTowerAtk = 0;
          safeLog(`[PASSIVE] ${builder.display?.name || 'Builderman'} converted ${Math.floor(saved).toLocaleString('en-US')} saved ATK into HP after a team kill.`, 'passive');
        }
      }
    }

    // Souls immediately clear one debuff when Mahito has accumulated them.
    if (id === 'mahito') applyMahitoDebuffClearIfNeeded(battleState, killer);
  }

  function onFatalityAttempt(battleState, target, attacker, incomingDamage, context = {}) {
    if (!target || !attacker) return false;
    const runtime = ensureRuntime(target);
    const id = getEffectivePassiveCardId(target);
    if (runtime.invincibleTurns > 0 || runtime.hakariInvincible > 0) return true;

    if (id === 'rimuru' && runtime.slimePoints > 0) {
      runtime.slimePoints -= 1;
      target.hp = 1;
      safeLog(`[PASSIVE] ${target.display?.name || 'Rimuru'} survived fatality using 1 Slime Point (${runtime.slimePoints} remaining).`, 'passive');
      return true;
    }

    if (id === 'yuta-okkotsu' && !runtime.firstFatalityUsed) {
      runtime.firstFatalityUsed = true;
      target.hp = Math.max(1, Math.round((Number(target.maxHp) || 1) * 0.50));
      heal(target, (Number(target.maxHp) || 0) * 0.25, 'CURSED LOVE', battleState, target);
      applyPermanentAtkBonus(target, 0.50, 'CURSED LOVE +50% ATK');
      safeLog(`[PASSIVE] ${target.display?.name || 'Yuta Okkotsu'} survived a fatality and gained +50% ATK.`, 'passive');
      return true;
    }

    if (id === 'enderman' && !runtime.firstFatalityUsed) {
      runtime.firstFatalityUsed = true;
      target.hp = 1;
      safeLog(`[PASSIVE] ${target.display?.name || 'Enderman'} survived a fatality with 1 HP.`, 'passive');
      return true;
    }

    if (id === 'subaru') {
      if (!runtime.firstFatalityUsed) {
        runtime.firstFatalityUsed = true;
        runtime.reviveCount += 1;
        target.hp = Math.max(1, Math.round((Number(target.maxHp) || 1) * 0.90));
        applyPermanentAtkBonus(target, 0.20, 'RETURN BY DEATH +20% ATK');
        ensureRuntime(target).postReviveDodgeBonus = Math.max(ensureRuntime(target).postReviveDodgeBonus, 0.15);
        safeLog(`[PASSIVE] ${target.display?.name || 'Subaru'} returned by death at 90% HP.`, 'passive');
        return true;
      }
      if (Math.random() < 0.65) {
        runtime.reviveCount += 1;
        target.hp = Math.max(1, Math.round((Number(target.maxHp) || 1) * 0.50));
        applyPermanentAtkBonus(target, 0.20, 'RETURN BY DEATH +20% ATK');
        runtime.postReviveDodgeBonus = Math.max(runtime.postReviveDodgeBonus, 0.15);
        safeLog(`[PASSIVE] ${target.display?.name || 'Subaru'} triggered another Return By Death revival.`, 'passive');
        return true;
      }
    }

    if (id === 'the-flash' && runtime.slimePoints > 0) return false;

    // Metal Cooler: if a teammate is about to die, create a 50%-stat clone
    // with the defeated teammate's passive. The clone does not count as a
    // teammate for subsequent triggers.
    const metalCooler = aliveUnits(teamOf(battleState, target))
      .find(ally => getEffectivePassiveCardId(ally) === 'metal-cooler');
    if (metalCooler && target !== metalCooler && !target.isClone && incomingDamage >= Math.max(1, Number(target.hp) || 0)) {
      const mr = ensureRuntime(metalCooler);
      const cloneCount = Math.max(0, Number(mr.cloneCount) || 0);
      if (cloneCount < 1) {
        const clone = cloneAsTemporaryAlly(target, metalCooler, battleState, 0.50);
        if (clone) {
          clone.side = target.side;
          const team = teamOf(battleState, metalCooler);
          const insertIndex = Math.max(0, team.indexOf(metalCooler) + 1);
          team.splice(Math.min(team.length, insertIndex), 0, clone);
          mr.cloneCount += 1;
          safeLog(`[PASSIVE] ${metalCooler.display?.name || 'Metal Cooler'} created a 50% stat clone of ${target.display?.name || 'the fallen teammate'} before the fatal blow.`, 'passive');
        }
      }
    }
    return false;
  }

  function maybeRedirectTarget(battleState, attacker, defender) {
    if (!attacker || !defender || !isAlive(defender)) return defender;
    const team = teamOf(battleState, defender);
    const seaBeast = aliveUnits(team).find(candidate => candidate !== defender && getEffectivePassiveCardId(candidate) === 'sea-beast');
    const activeDefenderUnit = activeDefender(battleState, attacker);
    const canIntercept = seaBeast && defender === activeDefenderUnit && sourcePassiveAllowed(seaBeast, attacker);
    if (canIntercept) {
      safeLog(`[Support] ${seaBeast.display?.name || 'Sea Beast'} intercepts incoming damage for teammate.`, 'passive');
      host.showBattleFloatingText?.(seaBeast, 'INTERCEPT', 'support');
      return seaBeast;
    }
    return defender;
  }

  function computeWeakenedAtk(attacker) {
    const runtime = ensureRuntime(attacker);
    const reduction = runtime.weakenAttackTurns > 0 ? clamp(runtime.weakenAttackPct, 0, 0.95) : 0;
    const attackBuff = 1 + Math.max(0, Number(runtime.atkBonusPct) || 0);
    return Math.max(1, Number(attacker.atk) || 1) * attackBuff * (1 - reduction);
  }


  function applyAreaAttack(battleState, attacker, targets, multiplier, options = {}) {
    const results = [];
    const uniqueTargets = [...new Set((targets || []).filter(isAlive))].slice(0, 8);
    for (const target of uniqueTargets) {
      results.push(performAttack(battleState, attacker, target, {
        ...options,
        passiveAttack: true,
        passiveBypass: Boolean(options.passiveBypass),
        damageMultiplier: multiplier,
        chainDepth: Number(options.chainDepth) || 0,
        linkedAttack: true
      }));
    }
    return results;
  }

  function getBaseAtk(unit) {
    return Math.max(1, Number(unit?.card?.stats?.atk) || Number(unit?.display?.atk) || Number(unit?.atk) || 1);
  }

  function isScheduledTurnAttacker(battleState, attacker) {
    if (!battleState || !attacker) return false;
    const side = battleState.turn === 'enemy' ? 'enemyTeam' : 'playerTeam';
    const team = Array.isArray(battleState?.[side]) ? battleState[side] : [];
    return team.includes(attacker);
  }

  function grantBuilderTowerOnTurn(battleState, builder) {
    const runtime = ensureRuntime(builder);
    const enemy = firstLiving(enemyTeamOf(battleState, builder), 0);
    if (!enemy) return;
    runtime.builderTowerAtk += Math.max(0, getBaseAtk(enemy) * 0.10);
    addActiveTag(builder, `TOWER ${Math.floor(runtime.builderTowerAtk).toLocaleString('en-US')}`);
  }

  const OUT_OF_TURN_SUPPORT_IDS = Object.freeze(new Set([
    'sea-beast',
    'weather-shadow-monarch'
  ]));

  function performAttack(battleState, attacker, requestedTarget, options = {}) {
    if (!battleState || !attacker || !isAlive(attacker)) return { hit: false, killed: false, damage: 0 };
    ensureRuntime(attacker);

    // Root attacks must belong to the scheduled frontline. Follow-ups remain
    // inside the same initiating turn; explicit support/interceptor attacks
    // are the only other legal out-of-turn combat actions.
    const passiveId = getEffectivePassiveCardId(attacker);
    const isLinkedFollowUp = Boolean(options.isFollowUp) && isScheduledTurnAttacker(battleState, attacker);
    const isExplicitSupportAction = Boolean(options.outOfTurnPassive || options.linkedAttack) && OUT_OF_TURN_SUPPORT_IDS.has(passiveId);
    const isRootAttack = (Number(options.chainDepth) || 0) === 0 && !options.isFollowUp && !options.isCounter;
    const isCounter = Boolean(options.isCounter);

    if (isCounter || (isRootAttack && !isScheduledTurnAttacker(battleState, attacker) && !isExplicitSupportAction) ||
        (options.isFollowUp && !isLinkedFollowUp && !isExplicitSupportAction)) {
      safeLog(`[PASSIVE] ${getPassiveName(attacker)} out-of-turn attack suppressed; only the active frontline or explicit support/interceptor may act.`, 'passive');
      return { hit: false, skipped: true, outOfTurn: true, killed: false, damage: 0 };
    }

    let target = requestedTarget || activeDefender(battleState, attacker);
    if (!target || !isAlive(target)) return { hit: false, killed: false, damage: 0 };

    if (options.chainDepth >= MAX_CHAIN_ATTACKS) return { hit: false, killed: false, damage: 0 };
    ensureRuntime(attacker).lastCrit = false;
    ensureRuntime(attacker).lastDodge = false;
    if (isUnitStunned(attacker)) {
      safeLog(`[STATUS] ${attacker.display?.name || cardOf(attacker)?.name || 'Unit'} could not attack.`, 'status');
      return { hit: false, skipped: true, killed: false, damage: 0 };
    }

    target = maybeRedirectTarget(battleState, attacker, target);
    ensureRuntime(attacker).lastFacingEnemy = target;

    triggerId(battleState, getEffectivePassiveCardId(attacker), 'beforeAttack', attacker, { target, attacker, sourceCardId: cardIdOf(attacker), options });

    const effectiveTarget = ensureRuntime(attacker).overrideTarget && isAlive(ensureRuntime(attacker).overrideTarget)
      ? ensureRuntime(attacker).overrideTarget
      : target;
    ensureRuntime(attacker).overrideTarget = null;
    target = effectiveTarget;

    const dodgeChance = getDodgeChance(target, attacker, battleState, options);
    const dodgeRoll = Math.random();
    if (dodgeChance > 0 && dodgeRoll < dodgeChance) {
      ensureRuntime(attacker).lastCrit = false;
      ensureRuntime(attacker).lastDodge = false;
      safeLog(`[DODGE] ${target.display?.name || cardOf(target)?.name || 'Enemy'} dodged ${attacker.display?.name || 'the attack'} (${Math.round(dodgeChance * 100)}%).`, 'dodge');
      onDodge(battleState, target, attacker, { chainDepth: options.chainDepth || 0 });
      return { hit: false, dodged: true, killed: false, damage: 0 };
    }

    if (shouldReflectPassiveAttack(target, attacker, options)) {
      const reflected = Math.max(1, Math.floor((Number(attacker.atk) || 1) * 0.50));
      const result = damageUnit(battleState, target, attacker, reflected, { passiveAttack: true, passiveBypass: true });
      safeLog(`[PASSIVE] ${target.display?.name || 'Asta'} reflected a passive attack for ${reflected.toLocaleString('en-US')} damage.`, 'passive');
      return { hit: true, reflected: true, critical: false, killed: result.killed, damage: result.damage };
    }

    const critStats = getCritStats(attacker);
    const critical = Math.random() < critStats.chance;
    const baseAttack = computeWeakenedAtk(attacker);
    let multiplier = passiveAttackMultiplier(attacker, target, battleState, options);
    if (options.damageMultiplier) multiplier *= Math.max(0, Number(options.damageMultiplier) || 1);
    if (critical) multiplier *= critStats.multiplier;

    if (options.isFollowUp && getEffectivePassiveCardId(attacker) === 'kamen-rider-kabuto') {
      setStatus(target, 'stunTurns', 1, attacker);
    }

    let rawDamage = Math.max(1, Math.floor(baseAttack * multiplier));
    const damageReduction = clamp(ensureRuntime(target).damageReductionPct, 0, 0.95);
    rawDamage = Math.max(1, Math.floor(rawDamage * (1 - damageReduction)));

    const previousHp = Math.max(0, Number(target.hp) || 0);
    target.hpBeforeDeath = previousHp;

    let result = { damage: 0, killed: false };
    const fatalityPrevented = previousHp > 0 && rawDamage >= previousHp
      ? onFatalityAttempt(battleState, target, attacker, rawDamage, options)
      : false;

    if (!fatalityPrevented) {
      result = damageUnit(battleState, attacker, target, rawDamage, { passiveAttack: Boolean(options.passiveAttack), passiveBypass: Boolean(options.passiveBypass) });
      result.critical = critical;
      result.hit = true;
    } else {
      result = { damage: 0, killed: false, preventedFatality: true, critical, hit: true };
    }

    ensureRuntime(attacker).lastCrit = critical;

    const displayedDamage = Math.max(0, result.damage || rawDamage);
    if (critical) {
      safeLog(`[CRITICAL HIT!] ${attacker.display?.name || cardOf(attacker)?.name || 'Unit'} dealt ${displayedDamage.toLocaleString('en-US')} damage.`, 'critical');
    } else {
      safeLog(`${attacker.display?.name || cardOf(attacker)?.name || 'Unit'} dealt ${displayedDamage.toLocaleString('en-US')} damage.`, options.isCounter ? 'passive' : '');
    }
    host.showBattleFloatingText?.(target, `${critical ? '✦ CRIT ' : ''}-${displayedDamage.toLocaleString('en-US')}`, 'damage');

    // A successful hit breaks consecutive-dodge streaks (The Flash).
    ensureRuntime(target).dodgeStreak = 0;
    onHitTaken(battleState, target, attacker, { hit: true, damage: result.damage || rawDamage, critical, options });
    applyHitEffects(battleState, attacker, target, { ...result, critical, hit: true, isFollowUp: Boolean(options.isFollowUp), chainDepth: Number(options.chainDepth) || 0 });

    if (result.killed) {
      onKill(battleState, attacker, target, { fatality: previousHp > 0 && rawDamage >= previousHp });
      onTeammateDeath(battleState, target);
      // Mahito clears one debuff if it kills an enemy below 10%.
      if (getEffectivePassiveCardId(attacker) === 'mahito' && (Number(target.hpBeforeDeath) || 0) < (Number(target.maxHp) || 1) * 0.10) {
        const ar = ensureRuntime(attacker);
        ar.soul = Math.max(0, ar.soul);
      }
    }

    // Build/refresh dynamic indices after AOE or clone/revive actions.
    ensureCurrentIndices(battleState);

    return {
      ...result,
      critical,
      hit: true,
      target,
      attacker
    };
  }

  function resolveActiveTurnControl(battleState, attacker) {
    ensureCurrentIndices(battleState);

    // Domain disables one full attack cycle for both sides.
    if (battleState?.passiveDomain?.skipAttacksRemaining > 0) {
      battleState.passiveDomain.skipAttacksRemaining -= 1;
      safeLog(`[PASSIVE] Dimensional Domain disables attacks for this turn.`, 'passive');
      return { skipped: true };
    }

    const actorStatus = tickStatusEffects(battleState, attacker);
    return actorStatus;
  }

  function resolvePassiveTurnEffects(battleState, attacker) {
    const all = allUnits(battleState);
    for (const unit of all) {
      if (!isAlive(unit)) continue;
      const isAttacker = unit === attacker;
      const id = getEffectivePassiveCardId(unit);
      const runtime = ensureRuntime(unit);
      runtime.lastTurnAttacked = isAttacker;

      if (!isAttacker) {
        if (id === 'bulma' && Math.random() < 0.10 && sourcePassiveAllowed(attacker, unit)) {
          ensureRuntime(attacker).nextAttackIsBuffed = true;
          safeLog(`[PASSIVE] ${unit.display?.name || 'Bulma'} buffed the next attacking ally by 30%.`, 'passive');
        }

        if (id === 'senku') {
          for (const ally of alliesOf(battleState, unit, true)) {
            heal(ally, (Number(ally.maxHp) || 0) * 0.10, 'CHEMISTRY', battleState, unit);
          }
        }

        if (id === 'piccolo') {
          runtime.buffStacks += 1;
          addActiveTag(unit, `AURA FARMER x${runtime.buffStacks}`);
        }
      }

      // Passive effects that are evaluated every combat turn.
      if (id === 'peashooter') {
        const hpRatio = (Number(unit.hp) || 0) / Math.max(1, Number(unit.maxHp) || 1);
        if (hpRatio < 0.30) {
          heal(unit, (Number(unit.maxHp) || 0) * 0.05, 'PLANT', battleState, unit);
        }
      }

      if (id === 'builderman') {
        grantBuilderTowerOnTurn(battleState, unit);
      }

      if (id === 'weather-report' && battleState.turnCount % 3 === 0) {
        const shield = Math.max(1, Math.floor((Number(unit?.card?.stats?.hp) || Number(unit.maxHp) || 1) * 0.30));
        runtime.weatherShield = shield;
        runtime.weatherShieldExpiresAt = battleState.turnCount + 1;
        addShield(unit, shield, 'weather');
        safeLog(`[PASSIVE] ${unit.display?.name || 'Weather Report'} created a weather shield for 1 turn.`, 'passive');
      }
      if (runtime.weatherShield > 0 && runtime.weatherShieldExpiresAt > 0 && battleState.turnCount >= runtime.weatherShieldExpiresAt + 1) {
        runtime.weatherShield = 0;
        if (runtime.shieldKind === 'weather') {
          runtime.shield = 0;
          runtime.shieldKind = '';
          removeActiveTag(unit, 'weather-shield');
          safeLog(`[PASSIVE] ${unit.display?.name || 'Weather Report'} weather shield expired.`, 'passive');
        }
        runtime.weatherShieldExpiresAt = 0;
      }

      if (id === 'kaguya' && battleState.passiveDomain?.owner === unit && battleState.passiveDomain.turns > 0) {
        const enemies = enemiesOf(battleState, unit);
        for (const enemy of enemies) {
          damageUnit(battleState, unit, enemy, getBaseAtk(unit), { passiveAttack: true, passiveBypass: true, outOfTurnPassive: true });
        }
        if (battleState.passiveDomain.turns === 3) {
          battleState.passiveDomain.skipAttacksRemaining = 2;
        }
        battleState.passiveDomain.turns -= 1;
        if (battleState.passiveDomain.turns <= 0) {
          battleState.passiveDomain = null;
          removeActiveTag(unit, 'dimensional-domain');
        }
      }

      if (id === 'toshiro' && battleState.turnCount >= 5 && !runtime.toshiroBuff) {
        runtime.toshiroBuff = true;
        applyPermanentAtkBonus(unit, 0.50, 'TOSHIRO +50% ATK');
        safeLog(`[PASSIVE] ${unit.display?.name || 'Toshiro'} gained +50% ATK from the fifth battle turn onward.`, 'passive');
      }

      if (id === 'homura-akemi' && runtime.homuraPending) {
        runtime.homuraPending = 0;
        const enemy = firstLiving(enemyTeamOf(battleState, unit), 0);
        if (enemy && sourcePassiveAllowed(enemy, unit)) {
          setStatus(enemy, 'freezeTurns', 5, unit);
          safeLog(`[PASSIVE] ${unit.display?.name || 'Homura Akemi'} froze the enemy for 5 turns after healing through 60% HP.`, 'passive');
        }
      }

      if (id === 'asta-demon' && isAttacker && runtime.magicMode === 'Demon Dweller') {
        runtime.damageReductionPct = 0.15;
      }

      if (id === 'mahoraga' && runtime.lastFacingEnemy && runtime.lastFacingEnemy !== firstLiving(enemyTeamOf(battleState, unit), 0)) {
        runtime.damageReductionPct = 0;
        runtime.absorbedOpponentId = null;
      }

      if (id === 'doppio') {
        addActiveTag(unit, `FROG ${runtime.buffStacks * 20}%`);
      }

      // Clear one-turn/short debuffs after their duration naturally expires.
      if (runtime.weakenAttackTurns > 0) {
        runtime.weakenAttackTurns -= 1;
        if (runtime.weakenAttackTurns <= 0) runtime.weakenAttackPct = 0;
      }

      // Active passive-state labels.
      if (runtime.stunTurns > 0) addActiveTag(unit, `STUN ${runtime.stunTurns}`);
      else removeActiveTag(unit, 'STUN');
      if (runtime.freezeTurns > 0) addActiveTag(unit, `FREEZE ${runtime.freezeTurns}`);
      else removeActiveTag(unit, 'FREEZE');
    }
  }

  function advanceSideIndex(battleState, side) {
    const teamKey = side === 'player' ? 'playerTeam' : 'enemyTeam';
    const indexKey = side === 'player' ? 'playerIndex' : 'enemyIndex';
    const team = battleState?.[teamKey] || [];
    if (!team.length) return null;
    const current = Number(battleState[indexKey] || 0);
    for (let offset = 1; offset <= team.length; offset += 1) {
      const index = (current + offset) % team.length;
      if (isAlive(team[index])) {
        battleState[indexKey] = index;
        return team[index];
      }
    }
    const fallback = firstLiving(team, 0);
    if (fallback) battleState[indexKey] = team.indexOf(fallback);
    return fallback;
  }

  function checkBattleWinner(battleState) {
    if (isTeamDefeated(battleState?.enemyTeam)) return 'player';
    if (isTeamDefeated(battleState?.playerTeam)) return 'enemy';
    return null;
  }

  function resolveTurn(battleState) {
    if (!battleState || battleState.finished) return { ended: true, winner: null };

    ensureCurrentIndices(battleState);
    battleState.turnCount = Math.max(0, Number(battleState.turnCount ?? battleState.turnCounter) || 0) + 1;
    battleState.turnCounter = battleState.turnCount;

    const attacker = battleState.turn === 'player'
      ? firstLiving(battleState.playerTeam, battleState.playerIndex)
      : firstLiving(battleState.enemyTeam, battleState.enemyIndex);
    if (!attacker) {
      const winner = checkBattleWinner(battleState);
      return { ended: Boolean(winner), winner };
    }

    if (battleState.turn === 'player') {
      battleState.playerIndex = battleState.playerTeam.indexOf(attacker);
    } else {
      battleState.enemyIndex = battleState.enemyTeam.indexOf(attacker);
    }

    resolvePassiveTurnEffects(battleState, attacker);
    const control = resolveActiveTurnControl(battleState, attacker);
    if (control.skipped) {
      battleState.turn = battleState.turn === 'player' ? 'enemy' : 'player';
      const winner = checkBattleWinner(battleState);
      return { ended: Boolean(winner), winner };
    }

    let target = battleState.turn === 'player'
      ? firstLiving(battleState.enemyTeam, battleState.enemyIndex)
      : firstLiving(battleState.playerTeam, battleState.playerIndex);
    if (!target) {
      const winner = checkBattleWinner(battleState);
      return { ended: Boolean(winner), winner };
    }

    const previousPlayerIndex = Number(battleState.playerIndex) || 0;
    const previousEnemyIndex = Number(battleState.enemyIndex) || 0;

    performAttack(battleState, attacker, target, { chainDepth: 0 });

    let winner = checkBattleWinner(battleState);
    if (winner) return { ended: true, winner };

    // Sequential gauntlet: keep the current frontline in place until that
    // exact unit dies. Only then promote the next living lineup position.
    ensureCurrentIndices(battleState);
    const currentPlayerIndex = Number(battleState.playerIndex) || 0;
    const currentEnemyIndex = Number(battleState.enemyIndex) || 0;
    if (currentPlayerIndex !== previousPlayerIndex) {
      safeLog(`[GAUNTLET] Player position ${previousPlayerIndex + 1} was defeated. Position ${currentPlayerIndex + 1} enters the arena.`, 'status');
    }
    if (currentEnemyIndex !== previousEnemyIndex) {
      safeLog(`[GAUNTLET] Enemy position ${previousEnemyIndex + 1} was defeated. Position ${currentEnemyIndex + 1} enters the arena.`, 'status');
    }

    battleState.turn = battleState.turn === 'player' ? 'enemy' : 'player';
    ensureCurrentIndices(battleState);

    winner = checkBattleWinner(battleState);
    return { ended: Boolean(winner), winner };
  }

  function getPassiveStatusBadges(unit) {
    if (!unit) return [];
    const runtime = ensureRuntime(unit);
    const passive = getPassive(unit);
    const badges = [];
    const atkDisplayPct = Math.round((Math.max(0, Number(runtime.displayAtkBonusPct) || 0) + Math.max(0, Number(runtime.temporaryAtkBonusPct) || 0)) * 100);
    const hpDisplayPct = Math.round((Math.max(0, Number(runtime.displayHpBonusPct) || 0) + Math.max(0, Number(runtime.temporaryMaxHpBonusPct) || 0)) * 100);
    const flatAtkDisplay = Math.max(0, Math.round(Number(runtime.flatAtkBonusDisplay) || 0));
    if (atkDisplayPct > 0) badges.push({ icon: '⚔', label: `+${atkDisplayPct}% ATK`, tone: 'buff', category: 'buff', status: 'Active' });
    if (flatAtkDisplay > 0) badges.push({ icon: '⚔', label: `+${flatAtkDisplay.toLocaleString('en-US')} ATK`, tone: 'buff', category: 'buff', status: 'Active' });
    if (hpDisplayPct > 0) badges.push({ icon: '❤', label: `+${hpDisplayPct}% MAX HP`, tone: 'buff', category: 'buff', status: 'Active' });
    if (runtime.nextAttackMultiplier > 1) badges.push({ icon: '⚡', label: `NEXT ×${Number(runtime.nextAttackMultiplier).toFixed(2)}`, tone: 'buff', category: 'buff', status: 'Triggered' });
    if (runtime.nextAttackIsBuffed) badges.push({ icon: '✦', label: 'NEXT +30% ATK', tone: 'buff', category: 'buff', status: 'Active' });
    if (runtime.nextAttackBonus > 0) badges.push({ icon: '✦', label: `NEXT +${Math.round(runtime.nextAttackBonus * 100)}%`, tone: 'buff', category: 'buff', status: 'Active' });

    if (runtime.lastCrit) badges.push({ icon: '✦', label: 'CRIT', tone: 'crit' });
    if (runtime.berserker) badges.push({ icon: '⚡', label: 'BERSERKER', tone: 'rage' });
    if (runtime.kuugaForm) badges.push({ icon: '◈', label: `KUUGA ${runtime.kuugaForm.toUpperCase()}`, tone: 'form' });
    if (runtime.auraStacks) badges.push({ icon: '◎', label: `AURA ${runtime.auraStacks}/5`, tone: 'aura' });
    if (runtime.slimePoints) badges.push({ icon: '●', label: `SLIME ${runtime.slimePoints}`, tone: 'slime' });
    const burnList = Array.isArray(runtime.burn) ? runtime.burn : [];
    if (burnList.length) {
      const turns = burnList.reduce((max, effect) => Math.max(max, Math.floor(Number(effect?.turns) || 0)), 0);
      badges.push({ icon: '🔥', label: `BURN x${burnList.length}${turns ? ` (${turns}t)` : ''}`, tone: 'burn', category: 'status', status: 'Active' });
    }
    const bleedList = Array.isArray(runtime.bleed) ? runtime.bleed : [];
    if (bleedList.length) {
      const turns = bleedList.reduce((max, effect) => Math.max(max, Math.floor(Number(effect?.turns) || 0)), 0);
      badges.push({ icon: '🩸', label: `BLEED x${bleedList.length}${turns ? ` (${turns}t)` : ''}`, tone: 'bleed', category: 'status', status: 'Active' });
    }
    if (runtime.shield > 0) badges.push({ icon: '⬡', label: `${runtime.shieldKind || 'SHIELD'} ${Math.round(runtime.shield).toLocaleString('en-US')}`, tone: 'shield', category: 'status', status: 'Active' });
    if (runtime.invincibleTurns > 0 || runtime.hakariInvincible > 0) badges.push({ icon: '◆', label: 'INVINCIBLE', tone: 'invincible', category: 'status', status: 'Active' });
    if (runtime.immuneTurns > 0) badges.push({ icon: '✦', label: `IMMUNE ${runtime.immuneTurns}`, tone: 'shield', category: 'status', status: 'Active' });
    if (runtime.passiveDisabled) badges.push({ icon: '⊘', label: 'PASSIVE OFF', tone: 'debuff', category: 'status', status: 'Disabled' });
    if (runtime.freezeTurns > 0) badges.push({ icon: '❄', label: `FREEZE ${runtime.freezeTurns}`, tone: 'freeze', category: 'status', status: 'Active' });
    if (runtime.stunTurns > 0) badges.push({ icon: '✚', label: `STUN ${runtime.stunTurns}`, tone: 'stun', category: 'status', status: 'Active' });
    if (runtime.snailTurns > 0) badges.push({ icon: '🐌', label: `SNAIL ${runtime.snailTurns}`, tone: 'freeze', category: 'status', status: 'Active' });
    if (runtime.damageReductionPct > 0) {
      const turns = Math.max(0, Math.floor(Number(runtime.damageReductionTurns) || 0));
      badges.push({ icon: '⛨', label: `${Math.round(runtime.damageReductionPct * 100)}% REDUCE${turns ? ` (${turns}t)` : ''}`, tone: 'guard', category: 'status', status: 'Active' });
    }
    if (runtime.weakenAttackTurns > 0 && runtime.weakenAttackPct > 0) badges.push({ icon: '↘', label: `-${Math.round(runtime.weakenAttackPct * 100)}% ATK`, tone: 'debuff', category: 'status', status: `Debuffed ${runtime.weakenAttackTurns}t` });
    if (runtime.magicMode) badges.push({ icon: '☯', label: runtime.magicMode.toUpperCase(), tone: 'mode' });
    if (runtime.jackpotBoost) badges.push({ icon: '7', label: `JACKPOT ${runtime.jackpotBoost.toUpperCase()}`, tone: 'jackpot' });
    if (runtime.effectivePassiveId && runtime.effectivePassiveId !== cardIdOf(unit)) {
      const copied = host.getCardById?.(runtime.effectivePassiveId);
      if (copied?.passive?.name) badges.push({ icon: '♢', label: `STOLEN: ${copied.passive.name}`, tone: 'stolen' });
    }
    if (runtime.lastPassiveTrigger && !badges.some(b => b.label === runtime.lastPassiveTrigger)) {
      badges.push({ icon: '★', label: runtime.lastPassiveTrigger, tone: 'passive' });
    }
    if (!badges.length && passive?.name) badges.push({ icon: '◇', label: passive.name, tone: 'passive' });
    return badges.slice(0, 5);
  }

  function modifyVictoryRewards(battleState, rewardProfile) {
    const profile = { ...rewardProfile };
    const playerTeam = Array.isArray(battleState?.playerTeam) ? battleState.playerTeam.filter(Boolean) : [];
    let multiplier = 1;
    if (playerTeam.some(unit => getEffectivePassiveCardId(unit) === 'nami')) multiplier *= 2;
    if (playerTeam.some(unit => getEffectivePassiveCardId(unit) === 'hakari-jackpot')) multiplier *= 2;
    profile.reward = Math.floor((Number(profile.reward) || 0) * multiplier);
    profile.experience = Math.floor((Number(profile.experience) || 0) * multiplier);
    profile.dropRateBonus = Number(((Number(profile.dropRateBonus) || 0) * multiplier).toFixed(2));
    profile.passiveMultiplier = multiplier;
    const bounty = Math.max(0, Math.floor(Number(battleState?.passiveCashBonus) || 0));
    if (bounty > 0) {
      profile.reward += bounty;
      profile.label = `${profile.label} + passive cash`;
    }
    return profile;
  }

  function onVictory(battleState) {
    const playerTeam = aliveUnits(battleState?.playerTeam || []);
    const sailor = playerTeam.find(unit => getEffectivePassiveCardId(unit) === 'sailor-moon');
    if (sailor && getBattleModeFromState(battleState) === '1v1' && Math.random() < 0.20) {
      host.addRandomCommonUncommonWeather?.(180);
      safeLog(`[PASSIVE] Sailor Moon added a random Common/Uncommon Weather for 3 minutes.`, 'passive');
    }
  }

  function getBattleModeFromState(battleState) {
    return battleState?.mode === '1v1' ? '1v1' : '4v4';
  }

  function onRoll(event) {
    // Hook for Ascension. The source description provides no definition
    // for "perfect roll" nor a numeric bonus, so no invented balance value
    // is applied. The hook remains available for future exact data.
    try {
      if (event?.card?.id === 'weather-heavenly-seraph' && event?.perfect === true) {
        safeLog(`[PASSIVE] Ascension recognized a perfect roll.`, 'passive');
      }
    } catch (error) {
      console.warn('[PASSIVE] onRoll hook failed safely:', error);
    }
  }

  function cloneAsTemporaryAlly(victim, source, battleState, statFactor = 0.5) {
    if (!victim || !source) return null;
    const factor = Math.max(0.01, Number(statFactor) || 0.5);
    const clone = {
      card: victim.card,
      mutations: victim.mutations ? [...victim.mutations] : [],
      variantKey: victim.variantKey,
      display: { ...(victim.display || {}) },
      level: victim.level || 1,
      exp: 0,
      hp: Math.max(1, Math.round((Number(victim.maxHp) || 1) * factor)),
      maxHp: Math.max(1, Math.round((Number(victim.maxHp) || 1) * factor)),
      atk: Math.max(1, Math.round((Number(victim.atk) || 1) * factor)),
      defeated: false,
      isClone: true
    };
    ensureRuntime(clone);
    clone.passiveState.effectivePassiveId = cardIdOf(victim);
    return clone;
  }

  function reviveTeammateAsDante(battleState, unit) {
    const runtime = ensureRuntime(unit);
    if (runtime.reviveCount >= 1) return;
    const team = teamOf(battleState, unit);
    const dead = team.find(candidate => candidate !== unit && candidate.defeated);
    if (!dead) return;
    runtime.reviveCount += 1;
    dead.defeated = false;
    const originalCardId = cardIdOf(dead);
    const danteCard = host.getCardById?.('dante-limbus');
    dead.display = {
      ...(dead.display || {}),
      name: `${dead.display?.name || dead.card?.name || 'Teammate'} (Dante Revive)`
    };
    dead.maxHp = Math.max(1, Number(unit?.maxHp) || Number(danteCard?.stats?.hp) || 1);
    dead.hp = dead.maxHp;
    dead.atk = Math.max(1, Number(unit?.atk) || Number(danteCard?.stats?.atk) || 1);
    ensureRuntime(dead).effectivePassiveId = originalCardId;
    refreshUnitDisplay(dead);
    safeLog(`[PASSIVE] ${unit.display?.name || 'Dante Limbus'} revived a teammate using Dante's stats while preserving their passive.`, 'passive');
  }

  function createJinMoriCloneForDeadTeammate(battleState, jinUnit, victim) {
    if (!jinUnit || !victim) return null;
    const runtime = ensureRuntime(jinUnit);
    if (runtime.cloneCount >= 3) return null;

    const jinCard = host.getCardById?.('jin-mori') || cardOf(jinUnit);
    const originalPassiveId = cardIdOf(victim);
    const clone = {
      card: jinCard || victim.card,
      mutations: victim.mutations ? [...victim.mutations] : [],
      variantKey: victim.variantKey,
      display: {
        ...(jinUnit.display || {}),
        name: `${jinUnit.display?.name || jinCard?.name || 'Jin Mori'} Clone • ${victim.display?.name || victim.card?.name || 'Teammate'} Passive`
      },
      level: jinUnit.level || 1,
      exp: 0,
      hp: Math.max(1, Number(jinUnit.maxHp) || Number(jinCard?.stats?.hp) || 1),
      maxHp: Math.max(1, Number(jinUnit.maxHp) || Number(jinCard?.stats?.hp) || 1),
      atk: Math.max(1, Number(jinUnit.atk) || Number(jinCard?.stats?.atk) || 1),
      defeated: false,
      isClone: true,
      side: jinUnit.side
    };

    ensureRuntime(clone).effectivePassiveId = originalPassiveId;
    ensureRuntime(clone).sourceCloneOf = originalPassiveId;
    runtime.cloneCount += 1;

    const team = teamOf(battleState, jinUnit);
    team.push(clone);
    refreshUnitDisplay(clone);

    safeLog(
      `[PASSIVE] ${jinUnit.display?.name || 'Jin Mori'} created a Jin Mori-stat clone with ${getPassiveName(victim)} after a teammate died.`,
      'passive'
    );
    return clone;
  }

  function applyMahitoDebuffClearIfNeeded(battleState, unit) {
    const runtime = ensureRuntime(unit);
    if (getEffectivePassiveCardId(unit) !== 'mahito' || runtime.soul <= 0) return;
    const statuses = ['weakenAttackTurns', 'stunTurns', 'freezeTurns', 'damageReductionPct'];
    for (const key of statuses) {
      if ((Number(runtime[key]) || 0) > 0) {
        runtime[key] = 0;
        runtime.soul -= 1;
        safeLog(`[PASSIVE] ${unit.display?.name || 'Mahito'} spent 1 Soul to clear a debuff.`, 'passive');
        break;
      }
    }
  }

  // Central event dispatcher. Some passive IDs intentionally share names
  // (e.g. "Rock" and "Absolute Zero"), so dispatch is by card ID.
  function snapshotPassiveDelta(unit) {
    const runtime = ensureRuntime(unit);
    return {
      atk: Number(unit?.atk) || 0,
      maxHp: Number(unit?.maxHp) || 0,
      damageReductionPct: Number(runtime?.damageReductionPct) || 0,
      critChanceBonus: Number(runtime?.critChanceBonus) || 0,
      critDamageBonus: Number(runtime?.critDamageBonus) || 0,
      shield: Number(runtime?.shield) || 0,
      burnCount: Array.isArray(runtime?.burn) ? runtime.burn.length : 0,
      bleedCount: Array.isArray(runtime?.bleed) ? runtime.bleed.length : 0,
      stunTurns: Number(runtime?.stunTurns) || 0,
      freezeTurns: Number(runtime?.freezeTurns) || 0,
      snailTurns: Number(runtime?.snailTurns) || 0,
      weakenAttackPct: Number(runtime?.weakenAttackPct) || 0,
      weakenAttackTurns: Number(runtime?.weakenAttackTurns) || 0,
      nextAttackMultiplier: Number(runtime?.nextAttackMultiplier) || 1,
      nextAttackBonus: Number(runtime?.nextAttackBonus) || 0,
      nextAttackIsBuffed: Boolean(runtime?.nextAttackIsBuffed),
      auraStacks: Number(runtime?.auraStacks) || 0,
      slimePoints: Number(runtime?.slimePoints) || 0,
      buffStacks: Number(runtime?.buffStacks) || 0,
      activeTags: Array.isArray(runtime?.activeTags) ? [...runtime.activeTags] : []
    };
  }

  function describePassiveDelta(before, after) {
    const parts = [];
    const number = value => Math.round(Number(value) || 0).toLocaleString('en-US');
    const signedNumber = value => `${value >= 0 ? '+' : ''}${number(value)}`;
    const pctDelta = (afterValue, beforeValue) => Math.round((afterValue - beforeValue) * 100);

    if (Math.abs(after.atk - before.atk) > 0.0001) {
      const delta = after.atk - before.atk;
      const percent = before.atk > 0 ? Math.round((delta / before.atk) * 100) : 0;
      parts.push(`ATK ${signedNumber(delta)} (${percent >= 0 ? '+' : ''}${percent}%)`);
    }
    if (Math.abs(after.maxHp - before.maxHp) > 0.0001) {
      const delta = after.maxHp - before.maxHp;
      const percent = before.maxHp > 0 ? Math.round((delta / before.maxHp) * 100) : 0;
      parts.push(`MAX HP ${signedNumber(delta)} (${percent >= 0 ? '+' : ''}${percent}%)`);
    }
    if (Math.abs(after.damageReductionPct - before.damageReductionPct) > 0.0001) {
      const delta = pctDelta(after.damageReductionPct, before.damageReductionPct);
      parts.push(`DR ${delta >= 0 ? '+' : ''}${delta}%`);
    }
    if (Math.abs(after.critChanceBonus - before.critChanceBonus) > 0.0001) {
      const delta = pctDelta(after.critChanceBonus, before.critChanceBonus);
      parts.push(`CRIT ${delta >= 0 ? '+' : ''}${delta}%`);
    }
    if (Math.abs(after.critDamageBonus - before.critDamageBonus) > 0.0001) {
      const delta = pctDelta(after.critDamageBonus, before.critDamageBonus);
      parts.push(`CRIT DMG ${delta >= 0 ? '+' : ''}${delta}%`);
    }
    if (Math.abs(after.shield - before.shield) > 0.0001) parts.push(`SHIELD ${signedNumber(after.shield - before.shield)}`);
    if (after.burnCount !== before.burnCount) parts.push(`BURN ×${after.burnCount}`);
    if (after.bleedCount !== before.bleedCount) parts.push(`BLEED ×${after.bleedCount}`);
    if (after.stunTurns !== before.stunTurns) parts.push(`STUN ${after.stunTurns}t`);
    if (after.freezeTurns !== before.freezeTurns) parts.push(`FREEZE ${after.freezeTurns}t`);
    if (after.snailTurns !== before.snailTurns) parts.push(`SNAIL ${after.snailTurns}t`);
    if (Math.abs(after.weakenAttackPct - before.weakenAttackPct) > 0.0001) parts.push(`ENEMY ATK -${Math.round(after.weakenAttackPct * 100)}%`);
    if (after.nextAttackMultiplier !== before.nextAttackMultiplier && after.nextAttackMultiplier > 1) parts.push(`NEXT ×${Number(after.nextAttackMultiplier).toFixed(2)} DMG`);
    if (after.nextAttackBonus !== before.nextAttackBonus && after.nextAttackBonus > 0) parts.push(`NEXT +${Math.round(after.nextAttackBonus * 100)}% ATK`);
    if (after.nextAttackIsBuffed !== before.nextAttackIsBuffed && after.nextAttackIsBuffed) parts.push('NEXT +30% ATK');
    if (after.auraStacks !== before.auraStacks) parts.push(`AURA ${after.auraStacks} stacks`);
    if (after.slimePoints !== before.slimePoints) parts.push(`SLIME ${after.slimePoints}`);
    if (after.buffStacks !== before.buffStacks) parts.push(`STACKS ${after.buffStacks}`);
    if (after.activeTags.join('|') !== before.activeTags.join('|')) {
      const added = after.activeTags.filter(tag => !before.activeTags.includes(tag));
      if (added.length) parts.push(added.slice(0, 2).join(', '));
    }
    return parts.join(' • ');
  }

  const SUPPORT_EVENT_ALLOWLIST = Object.freeze({
    'homura-akemi': Object.freeze(new Set(['onHealThreshold']))
  });

  function passiveEventOwnerMatches(id, event, unit, context = {}) {
    if (!unit) return false;
    const ownerId = String(cardIdOf(unit) || '');
    const effectiveId = String(getEffectivePassiveCardId(unit) || '');
    const explicitSupport = Boolean(SUPPORT_EVENT_ALLOWLIST[id]?.has(event)) && (context.support === true || context.allowForeignOwner === true);
    if (!explicitSupport && id !== effectiveId && id !== ownerId) return false;

    const sourceCardId = context.sourceCardId == null ? '' : String(context.sourceCardId);
    if (event === 'onCritical') {
      if (context.attacker !== unit) return false;
      if (sourceCardId && sourceCardId !== ownerId && sourceCardId !== effectiveId) return false;
    }
    if (event === 'beforeAttack' && context.attacker && context.attacker !== unit) return false;
    if (event === 'onHitTaken' && context.target && context.target !== unit) return false;
    if (event === 'onDodge' && context.defender && context.defender !== unit) return false;
    if (event === 'onKill' && context.killer && context.killer !== unit) return false;
    if (event === 'onFatalityAttempt' && context.defender && context.defender !== unit) return false;
    if (!explicitSupport && sourceCardId && sourceCardId !== ownerId && sourceCardId !== effectiveId) return false;
    return true;
  }

  function runPassiveEvent(id, event, battleState, unit, context = {}) {
    const runtime = ensureRuntime(unit);
    if (!unit || !runtime || runtime.passiveDisabled) return undefined;

    if (!passiveEventOwnerMatches(id, event, unit, context)) return undefined;

    const passiveName = getPassiveName(unit);
    const before = snapshotPassiveDelta(unit);
    const logBefore = passiveLogSequence;
    let result;

    if (event === 'onEntry') result = runOnEntry(battleState, unit);
    else if (event === 'beforeAttack') result = beforeAttack(battleState, unit, context.target);
    else if (event === 'afterAttack') result = applyHitEffects(battleState, unit, context.target, context.outcome);
    else if (event === 'onCritical') result = onCritical(battleState, unit, context.target, context.outcome);
    else if (event === 'onDodge') result = onDodge(battleState, unit, context.attacker, context.outcome);
    else if (event === 'onHitTaken') result = onHitTaken(battleState, unit, context.attacker, context.outcome);
    else if (event === 'onKill') result = onKill(battleState, unit, context.victim, context);
    else if (event === 'onFatalityAttempt') result = onFatalityAttempt(battleState, unit, context.attacker, context.incomingDamage, context);
    else if (event === 'onHealThreshold') {
      const enemy = firstLiving(enemyTeamOf(battleState, unit), 0);
      if (enemy && sourcePassiveAllowed(enemy, unit)) {
        setStatus(enemy, 'freezeTurns', 5, unit);
        safeLog(`[PASSIVE] ${passiveName} triggered: froze the enemy for 5 turns.`, 'passive');
        result = true;
      }
    }

    const after = snapshotPassiveDelta(unit);
    if (passiveLogSequence === logBefore) {
      const delta = describePassiveDelta(before, after);
      if (delta) safeLog(`[PASSIVE] ${passiveName} triggered (${event}): ${delta}.`, 'passive');
    }

    if (runtime.lastPassiveTrigger === '') runtime.lastPassiveTrigger = passiveName;
    return result;
  }


  const PASSIVE_TRIGGER_CLASSIFICATION = Object.freeze({
    'starter-common': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'normal-demon': Object.freeze(['ON_KILL']),
    'sasuke-kid': Object.freeze(['EVERY_NTH_ATTACK']),
    'deku-mc': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'starter-rare': Object.freeze(['ON_CARD_DEFEND_OR_HIT']),
    'gon-kid': Object.freeze(['EVERY_NTH_ATTACK']),
    'tanjiro': Object.freeze(['ON_BATTLE_START']),
    'starter-epic': Object.freeze(['EVERY_NTH_ATTACK']),
    'six-seven': Object.freeze(['ON_BATTLE_START']),
    'kaneki-ghoul': Object.freeze(['EVERY_NTH_ATTACK']),
    'the-trapper': Object.freeze(['ON_BATTLE_START']),
    'nezuko': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'buggy': Object.freeze(['ON_CARD_DEFEND_OR_HIT', 'ON_DODGE']),
    'bounty-hunter': Object.freeze(['ON_KILL']),
    'jotaro-kujo': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'hakari': Object.freeze(['EVERY_NTH_ATTACK']),
    'saber': Object.freeze(['EVERY_NTH_ATTACK']),
    'jonathan-joestar': Object.freeze(['EVERY_NTH_ATTACK']),
    'starter-legendary': Object.freeze(['EVERY_NTH_ATTACK']),
    'vegeta': Object.freeze(['ON_CARD_ATTACK_STRIKE', 'ON_HP_THRESHOLD']),
    'kakashi': Object.freeze(['ON_DODGE', 'ON_CARD_DEFEND_OR_HIT']),
    'kr-kuuga': Object.freeze(['EVERY_NTH_ATTACK']),
    'bulma': Object.freeze(['ON_TURN_TICK']),
    'denji': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'uchiha-itachi': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'madness-doctor': Object.freeze(['EVERY_NTH_ATTACK']),
    'erza': Object.freeze(['ON_HP_THRESHOLD']),
    'yuji-itadori': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'guts': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'polnareff': Object.freeze(['ON_HP_THRESHOLD']),
    'the-flash': Object.freeze(['ON_CARD_DEFEND_OR_HIT', 'ON_DODGE']),
    'rimuru': Object.freeze(['ON_KILL', 'ON_FATALITY']),
    'starter-secret': Object.freeze(['ON_CARD_DEFEND_OR_HIT']),
    'viltrumite': Object.freeze(['EVERY_NTH_ATTACK']),
    'mahito': Object.freeze(['ON_KILL', 'ON_CARD_DEFEND_OR_HIT']),
    'blackbeard': Object.freeze(['ON_KILL']),
    'garp': Object.freeze(['EVERY_NTH_ATTACK', 'ON_KILL']),
    'erwin': Object.freeze(['ON_BATTLE_START']),
    'boa-hancock': Object.freeze(['EVERY_NTH_ATTACK', 'ON_CARD_ATTACK_STRIKE']),
    'senku': Object.freeze(['ON_TURN_TICK']),
    'grimmjaw': Object.freeze(['EVERY_NTH_ATTACK']),
    'reigen': Object.freeze(['ON_BATTLE_START']),
    'kamen-rider-kabuto': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'meruem': Object.freeze(['ON_CARD_DEFEND_OR_HIT']),
    'frieza': Object.freeze(['ON_BATTLE_START']),
    'adam-francis': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'katakuri': Object.freeze(['ON_CARD_ATTACK_STRIKE', 'ON_CARD_DEFEND_OR_HIT']),
    'whitebeard': Object.freeze(['EVERY_NTH_ATTACK']),
    'doppio': Object.freeze(['ON_CARD_DEFEND_OR_HIT']),
    'shanks': Object.freeze(['ON_DODGE']),
    'metal-cooler': Object.freeze(['ON_FATALITY']),
    'gohan': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'yuno': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'asta': Object.freeze(['ON_CARD_DEFEND_OR_HIT']),
    'asta-demon': Object.freeze(['ON_CARD_ATTACK_STRIKE', 'ON_CARD_DEFEND_OR_HIT']),
    'nami': Object.freeze(['ON_VICTORY']),
    'giyu-tomioka': Object.freeze(['EVERY_NTH_ATTACK']),
    'sea-beast': Object.freeze(['ON_CARD_DEFEND_OR_HIT']),
    'arlong': Object.freeze(['ON_CARD_DEFEND_OR_HIT']),
    'aquaman': Object.freeze(['ON_CARD_DEFEND_OR_HIT']),
    'noelle-silva': Object.freeze(['ON_BATTLE_START']),
    'weather-report': Object.freeze(['ON_TURN_TICK']),
    'piccolo': Object.freeze(['ON_TURN_TICK', 'ON_CARD_ATTACK_STRIKE']),
    'peashooter': Object.freeze(['ON_TURN_TICK']),
    'hutao': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'weather-solar-deity': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'builderman': Object.freeze(['ON_TURN_TICK', 'ON_KILL']),
    'aatrox': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'weather-eclipse-harvester': Object.freeze(['ON_BATTLE_START']),
    'dante-limbus': Object.freeze(['ON_FATALITY']),
    'adult-gon': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'rukia': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'ice-admiral': Object.freeze(['ON_CRITICAL']),
    'weather-frost-sovereign': Object.freeze(['ON_CRITICAL']),
    'toshiro': Object.freeze(['ON_TURN_TICK', 'ON_CARD_ATTACK_STRIKE']),
    'android-21': Object.freeze(['ON_CARD_ATTACK_STRIKE', 'ON_KILL']),
    'yuta-okkotsu': Object.freeze(['ON_FATALITY', 'ON_HP_THRESHOLD']),
    'luffy-nightmare': Object.freeze(['ON_CARD_DEFEND_OR_HIT']),
    'weather-shadow-monarch': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'cid-shadow': Object.freeze(['EVERY_NTH_ATTACK']),
    'enderman': Object.freeze(['ON_FATALITY']),
    'homura-akemi': Object.freeze(['ON_HEAL_THRESHOLD']),
    'kr-decade': Object.freeze(['ON_BATTLE_START']),
    'uchiha-sasuke': Object.freeze(['ON_CARD_ATTACK_STRIKE', 'ON_HP_THRESHOLD']),
    'light-admiral': Object.freeze(['ON_DODGE']),
    'gojo-young': Object.freeze(['ON_CARD_DEFEND_OR_HIT']),
    'weather-heavenly-seraph': Object.freeze(['ON_ROLL']),
    'sailor-moon': Object.freeze(['ON_VICTORY']),
    'jin-mori': Object.freeze(['ON_CARD_DEFEND_OR_HIT']),
    'wish': Object.freeze(['ON_BATTLE_START']),
    'weather-tsukuyomi-eye': Object.freeze(['ON_DODGE']),
    'diavolo': Object.freeze(['ON_DODGE']),
    'kaguya': Object.freeze(['ON_BATTLE_START', 'ON_TURN_TICK']),
    'weather-reaper-hollow': Object.freeze(['ON_CRITICAL']),
    'subaru': Object.freeze(['ON_FATALITY', 'ON_DODGE']),
    'dio-brando': Object.freeze(['ON_CARD_ATTACK_STRIKE']),
    'weather-malevolent-king': Object.freeze(['EVERY_NTH_ATTACK', 'ON_CARD_ATTACK_STRIKE']),
    'doflamingo': Object.freeze(['ON_KILL']),
    'hakari-jackpot': Object.freeze(['ON_BATTLE_START', 'ON_VICTORY']),
    'mahoraga': Object.freeze(['ON_CARD_DEFEND_OR_HIT', 'ON_KILL']),
  });

  // Explicit coverage registry for auditing. It mirrors the uploaded
  // cards.js IDs, not a second set of passive data.
  const PASSIVE_HANDLERS = Object.freeze({
    'starter-common': true,
    'normal-demon': true,
    'sasuke-kid': true,
    'deku-mc': true,
    'starter-rare': true,
    'gon-kid': true,
    'tanjiro': true,
    'starter-epic': true,
    'six-seven': true,
    'kaneki-ghoul': true,
    'the-trapper': true,
    'nezuko': true,
    'buggy': true,
    'bounty-hunter': true,
    'jotaro-kujo': true,
    'hakari': true,
    'saber': true,
    'jonathan-joestar': true,
    'starter-legendary': true,
    'vegeta': true,
    'kakashi': true,
    'kr-kuuga': true,
    'bulma': true,
    'denji': true,
    'uchiha-itachi': true,
    'madness-doctor': true,
    'erza': true,
    'yuji-itadori': true,
    'guts': true,
    'polnareff': true,
    'the-flash': true,
    'rimuru': true,
    'starter-secret': true,
    'viltrumite': true,
    'mahito': true,
    'blackbeard': true,
    'garp': true,
    'erwin': true,
    'boa-hancock': true,
    'senku': true,
    'grimmjaw': true,
    'reigen': true,
    'kamen-rider-kabuto': true,
    'meruem': true,
    'frieza': true,
    'adam-francis': true,
    'katakuri': true,
    'whitebeard': true,
    'doppio': true,
    'shanks': true,
    'metal-cooler': true,
    'gohan': true,
    'yuno': true,
    'asta': true,
    'asta-demon': true,
    'nami': true,
    'giyu-tomioka': true,
    'sea-beast': true,
    'arlong': true,
    'aquaman': true,
    'noelle-silva': true,
    'weather-report': true,
    'piccolo': true,
    'peashooter': true,
    'hutao': true,
    'weather-solar-deity': true,
    'builderman': true,
    'aatrox': true,
    'weather-eclipse-harvester': true,
    'dante-limbus': true,
    'adult-gon': true,
    'rukia': true,
    'ice-admiral': true,
    'weather-frost-sovereign': true,
    'toshiro': true,
    'android-21': true,
    'yuta-okkotsu': true,
    'luffy-nightmare': true,
    'weather-shadow-monarch': true,
    'cid-shadow': true,
    'enderman': true,
    'homura-akemi': true,
    'kr-decade': true,
    'uchiha-sasuke': true,
    'light-admiral': true,
    'gojo-young': true,
    'weather-heavenly-seraph': true,
    'sailor-moon': true,
    'jin-mori': true,
    'wish': true,
    'weather-tsukuyomi-eye': true,
    'diavolo': true,
    'kaguya': true,
    'weather-reaper-hollow': true,
    'subaru': true,
    'dio-brando': true,
    'weather-malevolent-king': true,
    'doflamingo': true,
    'hakari-jackpot': true,
    'mahoraga': true
  });

  // Public audit helper: every card with a passive can be checked against
  // this registry without duplicating passive text.
  function audit(cards = []) {
    const list = Array.isArray(cards) ? cards : [];
    const withPassive = list.filter(card => card?.passive?.name);
    const missing = withPassive
      .map(card => String(card.id || ''))
      .filter(id => !PASSIVE_HANDLERS[id]);
    const unclassified = withPassive
      .map(card => String(card.id || ''))
      .filter(id => !PASSIVE_TRIGGER_CLASSIFICATION[id]);
    return {
      totalCardsWithPassives: withPassive.length,
      registered: withPassive.filter(card => PASSIVE_HANDLERS[String(card.id || '')]).length,
      classified: withPassive.filter(card => PASSIVE_TRIGGER_CLASSIFICATION[String(card.id || '')]).length,
      missing,
      unclassified
    };
  }

  window.PassiveSystem = Object.freeze({
    BASE_CRIT_CHANCE,
    BASE_CRIT_MULTIPLIER,
    MAX_CHAIN_ATTACKS,
    configureHost,
    ensureRuntime,
    beginBattle(battleState) {
      if (!battleState) return;
      battleState.turnCounter = 0;
      battleState.turnCount = 0;
      battleState.passiveCashBonus = 0;
      battleState.passiveDomain = null;

      for (const unit of allUnits(battleState)) {
        const runtime = ensureRuntime(unit);
        runtime.baseAtkAtBattleStart = Math.max(1, Number(unit.atk) || Number(unit.display?.atk) || 1);
        runtime.displayAtkBonusPct = 0;
        runtime.displayHpBonusPct = 0;
        refreshUnitDisplay(unit);
      }

      for (const unit of [...(battleState.playerTeam || []), ...(battleState.enemyTeam || [])]) {
        if (!isAlive(unit)) continue;
        runOnEntry(battleState, unit);
      }

      ensureCurrentIndices(battleState);
      host.renderBattleStats?.();
    },
    resolveTurn,
    performAttack,
    getPassiveStatusBadges,
    getCombatStatusSummary,
    getDisplayDodgeChance,
    getPassiveTooltipData,
    getPassiveName,
    getPassiveDescription(unit) {
      const passive = getPassive(unit);
      return {
        name: String(passive?.name || 'Passive'),
        description: String(passive?.description || '')
      };
    },
    getPassiveDefinition(cardId) {
      const id = String(cardId || '').trim();
      const fallback = PASSIVE_DEFINITIONS[id];
      return fallback || { name: 'Unknown Passive', description: '' };
    },
    getPassiveTriggerClassification(cardId) {
      const id = String(cardId || '').trim();
      return Array.isArray(PASSIVE_TRIGGER_CLASSIFICATION[id]) ? [...PASSIVE_TRIGGER_CLASSIFICATION[id]] : [];
    },
    getPassiveDefinitions() {
      return PASSIVE_DEFINITIONS;
    },
    modifyVictoryRewards,
    onVictory,
    onRoll,
    audit,
    checkBattleWinner,
    ensureCurrentIndices,
    handleFatality(battleState, target, attacker, incomingDamage, context = {}) {
      return onFatalityAttempt(battleState, target, attacker, incomingDamage, context);
    }
  });
})();
