/* Accepted quests consume live gameplay events, never collection snapshots. */
(function (host) {
  'use strict';
  const KEY = 'anime_card_rng_quests_v1';
  const QUESTS = Object.freeze([
    { id: 'julius', steps: [
      {kind:'battle',target:1000,mode:'time-trial',room:100,won:true,text:'Clear Normal Time Trial Room 100 1,000 times.'},
      {kind:'battle',target:100,mode:'time-trial',room:100,won:true,fullElement:'Holy',text:'Clear Normal Time Trial Room 100 with 4 Holy cards 100 times.'},
      {kind:'roll',target:10000,weather:'wind',text:'Roll 10,000 times during Wind weather.'},
      {kind:'battle',target:1000,mode:'boss-event',event:'lucius',won:true,text:'Defeat Lucius Event 1,000 times.'}
    ] },
    { id: 'sung-jin-woo', steps: [
      { kind: 'battle', target: 1000, mode: '1v1', weather: 'shadow', text: 'Complete 1,000 1v1 battles in Shadow weather.' },
      { kind: 'roll', target: 10000, weather: 'shadow', text: 'Roll 10,000 times in Shadow weather.' },
      { kind: 'battle', target: 1000, teammate: 'weather-shadow-monarch', text: 'Complete 1,000 battles in any mode with Igris in the starting team.' },
      { kind: 'roll', target: 1, card: 'weather-shadow-monarch', mutation: 'monarch', text: 'Roll Igris with Monarch, including double mutations.' }
    ] },
    { id: 'frieren', steps: [
      { kind: 'defeat', target: 10000, card: 'normal-demon', text: 'Defeat 10,000 Normal Demon enemies in any mode.' },
      { kind: 'battle', target: 1000, mode: '1v1', weather: 'heavenly', text: 'Complete 1,000 1v1 battles in Heavenly weather.' },
      { kind: 'roll', target: 1000, mutation: 'angelic', text: 'Roll 1,000 cards with Angelic (Heavenly), including double mutations.' }
    ] },
    { id: 'alexander-anderson', steps: [
      { kind: 'battle', target: 1000, mode: 'boss-event', event: 'alucard', minDifficulty: 7, text: 'Complete 1,000 Alucard Event battles at difficulty 7 or higher.' },
      { kind: 'defeat', target: 10000, card: 'normal-demon', weather: 'eclipse', text: 'Defeat 10,000 Normal Demon enemies in Eclipse (Eclipsed) weather.' },
      { kind: 'roll', target: 10000, weather: 'heavenly', text: 'Roll 10,000 times in Heavenly weather.' }
    ] }
  ].map(q => Object.freeze({ ...q, steps: Object.freeze(q.steps.map(Object.freeze)) })));
  const object = v => Boolean(v && typeof v === 'object' && !Array.isArray(v));
  const integer = (v, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(v) && v >= min && v <= max;
  const fresh = () => ({ version: 1, sequence: 0, quests: {} });
  function validSave(v) {
    if (!object(v) || v.version !== 1 || !integer(v.sequence) || !object(v.quests)) return false;
    return Object.entries(v.quests).every(([id, q]) => {
      const def = QUESTS.find(d => d.id === id);
      if (!def || !object(q) || !integer(q.acceptedAt) || !integer(q.step, 0, def.steps.length) || !integer(q.progress) || typeof q.rewarded !== 'boolean') return false;
      if (q.step === def.steps.length ? q.progress !== 0 : q.progress >= def.steps[q.step].target) return false;
      if (!object(q.last)) return false;
      if (q.rewarded && q.step !== def.steps.length) return false;
      return ['roll', 'battle', 'defeat'].every(k => typeof q.last[k] === 'string' && q.last[k].length <= 120);
    });
  }
  function load() { try { const v = JSON.parse(host.localStorage.getItem(KEY) || 'null'); return validSave(v) ? v : fresh(); } catch (_) { return fresh(); } }
  let data = load(), bridge = {}, awarding = false;
  function persist() { try { host.localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (_) { return false; } }
  function reconcile() {
    if (awarding || host.SandboxSystem?.active) return;
    awarding = true;
    try {
      for (const def of QUESTS) {
        const q = data.quests[def.id];
        if (q && q.step === def.steps.length && !q.rewarded && bridge.grantCard?.(def.id) === true) {
          q.rewarded = true;
          if (!persist()) q.rewarded = false;
        }
      }
    } finally { awarding = false; }
  }
  function configure(options = {}) { bridge = options; reconcile(); }
  function accept(id) {
    if (!QUESTS.some(q => q.id === id) || data.quests[id] || bridge.canAccept?.() === false) return false;
    data.quests[id] = { acceptedAt: Date.now(), step: 0, progress: 0, rewarded: false, last: { roll: '', battle: '', defeat: '' } };
    if (!persist()) { delete data.quests[id]; return false; }
    return true;
  }
  function matches(step, e) {
    return (step.won === undefined || step.won === e.won) && (!step.room || step.room === e.room) && (!step.fullElement || (e.teamElements?.length === 4 && e.teamElements.every(element => element === step.fullElement))) && (!step.mode || step.mode === e.mode) && (!step.weather || e.weatherIds?.includes(step.weather)) &&
      (!step.teammate || e.teamIds?.includes(step.teammate)) && (!step.card || step.card === e.cardId) &&
      (!step.mutation || e.mutationIds?.includes(step.mutation)) && (!step.event || step.event === e.eventType) &&
      (!step.minDifficulty || e.difficulty >= step.minDifficulty);
  }
  function record(kind, e) {
    if (host.SandboxSystem?.active || e?.sandbox || e?.mode === 'sandbox') return false;
    if (!['roll', 'battle', 'defeat'].includes(kind) || !e || typeof e.id !== 'string' || !integer(e.startedAt)) return false;
    host.QuestsSystem?.record(kind,e);
    const before = JSON.stringify(data);
    let changed = false;
    for (const def of QUESTS) {
      const q = data.quests[def.id];
      if (!q || q.step >= def.steps.length || e.startedAt < q.acceptedAt || q.last[kind] === e.id) continue;
      // Commit the event receipt and this step together. A completing event
      // never contributes to the next step, even when predicates overlap.
      q.last[kind] = e.id; changed = true;
      const step = def.steps[q.step];
      if (step.kind !== kind || !matches(step, e)) continue;
      q.progress++;
      if (q.progress >= step.target) { q.step++; q.progress = 0; }
    }
    if (changed && !persist()) { data = JSON.parse(before); return false; }
    reconcile(); if(changed)host.QuestsSystem?.notify(); return changed;
  }
  function battleContext(battle, weatherIds) {
    if (host.SandboxSystem?.active || battle?.sandbox || battle?.mode === 'sandbox') return null;
    if (data.sequence >= Number.MAX_SAFE_INTEGER) throw Error('Quest event limit reached.');
    data.sequence++;
    if (!persist()) { data.sequence--; throw Error('Không thể lưu lượt theo dõi quest.'); }
    return { id: String(data.sequence), startedAt: battle.startedAt, mode: battle.mode, weatherIds: [...weatherIds], teamIds: battle.playerTeam.map(u => u.card.id), teamElements: battle.playerTeam.filter(u => !u.isClone && !u.isSummoned && !u.isTemporaryAlly).map(u => u.card.element), eventType: battle.bossEvent?.type, difficulty: battle.bossEvent?.difficulty ?? battle.raid?.difficulty, defeatSequence: 0 };
  }
  const snapshot = id => data.quests[id] ? JSON.parse(JSON.stringify(data.quests[id])) : null;
  function render(grid) {
    if (!grid) return;
    reconcile(); grid.replaceChildren(); const doc = grid.ownerDocument;
    for (const def of QUESTS) {
      const native = host.ALL_CARDS.find(c => c.id === def.id), q = snapshot(def.id);
      const box = doc.createElement('article'); box.className = 'quest-card module-item'; box.dataset.questId = def.id;
      const art = doc.createElement('img'); art.src = native.image; art.alt = `${native.name} • Quest Card`; art.loading = 'lazy';
      const name = doc.createElement('h3'); name.textContent = native.name;
      const mystery = doc.createElement('p'); mystery.textContent = 'Quest Card • Complete every step to reveal HP, ATK and Passive.';
      box.append(art, name, mystery);
      if (!q) {
        const button = doc.createElement('button'); button.type = 'button'; button.textContent = 'Accept Quest';
        button.disabled = bridge.canAccept?.() === false;
        button.addEventListener('click', () => { if (accept(def.id)) render(grid); else host.alert('Không thể nhận quest lúc này.'); }); box.append(button);
      } else {
        const steps = doc.createElement('ol'); steps.className = 'quest-steps';
        def.steps.forEach((step, i) => {
          const row = doc.createElement('li'); row.className = i < q.step ? 'is-complete' : i === q.step ? 'is-current' : 'is-locked';
          row.textContent = `${i < q.step ? '✓' : i === q.step ? `${q.progress.toLocaleString('en-US')} / ${step.target.toLocaleString('en-US')}` : 'Locked'} • ${step.text}`;
          if (i === q.step) { const progress = doc.createElement('progress'); progress.max = step.target; progress.value = q.progress; progress.setAttribute('aria-label', step.text); row.append(progress); }
          steps.append(row);
        }); box.append(steps);
        const status = doc.createElement('p'); status.setAttribute('role', 'status');
        status.textContent = q.rewarded ? 'COMPLETE • Normal card awarded • Standard rolls unlocked.' : q.step === def.steps.length ? 'COMPLETE • Reward is waiting to be saved. Reopen to retry.' : 'Only the current step counts. Battle wins and losses count; surrender and interrupted battles do not.'; box.append(status);
      }
      grid.append(box);
    }
  }
  function reset() { data = fresh(); persist(); }
  host.QuestSystem = Object.freeze({ KEY, QUESTS, validSave, configure, accept, record, battleContext, snapshot, render, reset, flush: () => { reconcile(); return persist(); } });
})(window);
