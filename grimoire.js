/* Lucius-update skills. Runtime-only state; no rewards, saves or quest writes. */
(function (host) {
  'use strict';
  host.createGrimoireSkills = function (api) {
    const { runtime, id, alive, all, allies, enemies, atk, hit, shield, status, refresh, log, random } = api;
    const state = unit => runtime(unit).grimoire ||= { copies: [], initialized: false, streak: 0, followChance: .05 };
    const has = (unit, passive) => api.hasPassive(unit, passive);
    const names = ids => new Set(ids.map(key => api.card(key)?.passive?.name || key));
    function acquire(bs, unit) {
      const c = state(unit);
      if (c.copies.length >= 4 || !alive(unit)) return;
      const seen = names(['boss-event-lucius', ...c.copies.map(copy => copy.id)]), choices = new Map();
      for (const candidate of all(bs)) {
        if (candidate === unit) continue;
        for (const key of api.passiveIds(candidate, true)) {
          const card = api.card(key), name = card?.passive?.name;
          if (name && !seen.has(name)) choices.set(name, key);
        }
      }
      const pool = [...choices.values()];
      if (!pool.length) return;
      const key = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
      const copy = api.addCopy(unit, key);
      if (copy) { api.copyEntry(bs, unit, copy); log(`[PASSIVE] All Grimoire gained ${api.card(key).passive.name}.`, 'passive'); }
    }
    function entry(bs, unit) {
      const key = id(unit), c = state(unit);
      if (c.initialized === key) return;
      c.initialized = key;
      if (key === 'boss-event-lucius') acquire(bs, unit);
      if (key === 'sea-goddess-valkyrie') {
        let total = 0;
        for (const enemy of [...enemies(bs, unit)]) total += hit(bs, unit, enemy, atk(unit), { tsunami: true }).damage || 0;
        if (alive(unit) && total > 0) shield(unit, total * .5, 'tsunami');
      }
    }
    function reflectors(bs, target) {
      if (!target) return [];
      const active = api.frontline(bs, target);
      return allies(bs, target).filter(unit => has(unit, 'julius') && (unit === target || target === active));
    }
    function reflect(bs, attacker, target, amount, meta) {
      if (!attacker || !alive(attacker) || !(amount > 0) || meta.grimoireReflection || meta.noGrimoireReflect) return false;
      for (const unit of reflectors(bs, target)) {
        const c = api.skillState(unit, 'julius');
        if (random() >= .30) { c.streak = 0; continue; }
        c.streak++;
        api.reflectHit(bs, unit, attacker, amount, { ...meta, grimoireReflection: true, dodgeChecked: true });
        if (c.streak >= 2 && alive(unit)) {
          c.streak = 0;
          for (const enemy of [...enemies(bs, unit)]) hit(bs, unit, enemy, atk(unit) * .5, { noGrimoireReflect: true });
          for (const ally of allies(bs, unit)) {
            shield(ally, unit.maxHp * .5, 'time-grimoire');
            runtime(ally).grimoireShield = { owner: unit, turn: bs.turnCount || 0 };
          }
        }
        log('[PASSIVE] Time Grimoire reflected the attack.', 'passive');
        return true;
      }
      return false;
    }
    function shieldBroken(bs, unit, kind) {
      if (kind === 'tsunami' && alive(unit) && has(unit, 'sea-goddess-valkyrie')) {
        for (const enemy of enemies(bs, unit)) status(enemy, 'stunTurns', 4, unit);
      }
      const marker = runtime(unit).grimoireShield;
      delete runtime(unit).grimoireShield;
      if (kind !== 'time-grimoire' || !marker || marker.owner === unit || !alive(marker.owner) || !has(marker.owner, 'julius') || (bs.turnCount || 0) - marker.turn > 3) return;
      const c = api.skillState(marker.owner, 'julius');
      if (c.backupStored) return;
      c.backupStored = true;
      c.backup = { maxHp: unit.maxHp, hp: unit.hp, atk: atk(unit), passives: api.passiveIds(unit, true).filter(key=>api.card(key)?.passive?.name) };
      log('[PASSIVE] Time Grimoire stored one backup life.', 'passive');
    }
    function fatal(bs, unit) {
      if (!has(unit, 'julius') || unit.grimoireRevived) return false;
      const c = api.skillState(unit, 'julius'), backup = c.backup;
      if (!backup) return false;
      c.backup = null; unit.grimoireRevived = true;
      unit.maxHp = Math.max(1, backup.maxHp); unit.hp = Math.max(1, Math.min(unit.maxHp, backup.hp)); unit.atk = Math.max(1, backup.atk); unit.defeated = false;
      const r = runtime(unit);
      // Captured ATK already includes runtime buffs. Do not apply them twice.
      r.atkBonusPct = 0; r.maxHpBonusPct = 0; r.displayAtkBonusPct = 0; r.displayHpBonusPct = 0;
      r.effectivePassiveId = backup.passives[0] || 'grimoire-empty-backup';
      api.replaceCopies(unit, backup.passives.slice(1));
      refresh(unit); log('[PASSIVE] Julius revived with the stored backup stats and passive.', 'passive');
      return true;
    }
    function death(bs, victim) {
      if (alive(victim) || victim.card?.id !== 'julius' || victim.isClone || victim.isSummoned || api.canFutureRevive(bs,victim)) return;
      for (const unit of allies(bs, victim, false)) {
        if (!has(unit, 'boss-event-lucius') || state(unit).juliusBonus) continue;
        state(unit).juliusBonus = true;
        api.hpBonus(unit, .5); api.atkBonus(unit, .5);
        log('[PASSIVE] All Grimoire: allied Julius died permanently; +50% HP and ATK.', 'passive');
      }
    }
    function endTurn(bs) { for(const unit of all(bs)) if(unit.card?.id==='julius'&&!alive(unit)) death(bs,unit); }
    function countedAttack(bs, unit) {
      if (!has(unit, 'boss-event-lucius') || !alive(unit)) return;
      const c = api.skillState(unit, 'boss-event-lucius'), count = runtime(unit).ownAttackCount;
      if (count > 0 && count % 5 === 0 && c.lastAcquisition !== count) { c.lastAcquisition = count; acquire(bs, unit); }
    }
    function dodge(bs, unit) {
      if (id(unit) !== 'speed-wizard') return;
      const c = api.skillState(unit, 'speed-wizard'); c.followChance += .05; c.skipAttack = true;
    }
    function skipTurn(unit) {
      if (!has(unit, 'speed-wizard')) return false;
      const c = api.skillState(unit, 'speed-wizard');
      if (!c.skipAttack) return false;
      c.skipAttack = false; return true;
    }
    const chains = new WeakMap();
    function attack(bs, unit, target, options) {
      const token = {}; chains.set(unit, token);
      try {
        const first = options.grimoireInitialResult || api.attack(bs, unit, target, { ...options, godspeedToken: token });
        if (first.skipped || first.outOfTurn) return first;
        let chance = api.followChance(bs,unit,Math.min(1, api.skillState(unit, 'speed-wizard').followChance));
        while (alive(unit) && has(unit, 'speed-wizard') && enemies(bs, unit).length && random() < chance) {
          target = alive(target) ? target : api.enemyFront(bs, unit);
          const result = api.attack(bs, unit, target, { isFollowUp: true, passiveAttack: true, chainDepth: 0, damageMultiplier: .5, godspeedToken: token, grimoireDriver: options.grimoireDriver });
          if (result.skipped || result.outOfTurn) break;
          chance *= .5;
        }
        return first;
      } finally { chains.delete(unit); }
    }
    return { state, entry, acquire, reflectors, reflect, shieldBroken, fatal, death, endTurn, countedAttack, dodge, skipTurn, attack,
      linked: (unit, options) => Boolean(options.godspeedToken && chains.get(unit) === options.godspeedToken),
      canChain: unit => has(unit, 'speed-wizard'), dodgeChance: unit => has(unit, 'speed-wizard') ? .5 : 0 };
  };
})(window);
