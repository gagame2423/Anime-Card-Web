/* PvP presentation only. Never reads or writes player progression or peer packets. */
(function (host) {
  'use strict';
  const U = host.OnlineUtils, PAGE_SIZE = 48;
  const elements = host.ElementSystem?.TYPES || ['Fire', 'Water', 'Nature', 'Electric', 'Dark', 'Holy'];
  const nodes = {}, cardMap = new Map(), expandedTeams = new Set();
  let cards = [], actions = {}, model = {}, mounted = false, selectionKey = '', hiddenKey = '';
  let pickerSlot = -1, draftId = '', query = '', element = '', limit = PAGE_SIZE, searchTimer = null;
  let returnFocus = null, lastCombat = null, lastLogKey = '';
  const n = id => nodes[id] || (nodes[id] = host.document.getElementById(id));
  const text = (id, value) => U.text(n(id), value);
  const number = value => Math.max(0, Math.round(Number(value) || 0)).toLocaleString('en-US');
  const visible = (id, show) => { const node = n(id); if (node) node.hidden = !show; };
  const locked = () => Boolean(model.locked) || !['setup', 'picking'].includes(model.phase);
  const button = (label, className) => Object.assign(U.make('button', className, label), { type: 'button' });

  function artwork(card, className = '') {
    const box = U.make('div', 'pvp-art ' + className);
    const initials = String(card.name || 'Card').split(/\s+/).map(word => word[0]).slice(0, 3).join('');
    const fallback = U.make('span', 'pvp-art-fallback', initials);
    fallback.setAttribute('aria-hidden', 'true'); box.append(fallback);
    if (card.image) {
      const image = U.make('img'); image.alt = ''; image.loading = 'lazy'; image.decoding = 'async';
      image.addEventListener('error', () => { image.hidden = true; }, { once: true });
      image.src = card.image; box.append(image);
    }
    return box;
  }
  function elementBadge(card) {
    const badge = U.make('span', 'pvp-element', card.element || 'Normal');
    badge.dataset.element = card.element || '';
    const src = host.ElementSystem?.ICONS?.[card.element];
    if (src) { const image = U.make('img'); image.alt = ''; image.width = 18; image.height = 18; image.src = src; image.addEventListener('error', () => { image.hidden = true; }, { once: true }); badge.prepend(image); }
    return badge;
  }
  function statPair(hp, atk) {
    const row = U.make('div', 'pvp-card-stats');
    for (const [label, value] of [['HP', hp], ['ATK', atk]]) {
      const stat = U.make('span'); stat.append(U.make('small', '', label), U.make('b', '', number(value))); row.append(stat);
    }
    return row;
  }
  function decorate(node, card) { node.dataset.rarity = card.rarity || 'Common'; node.dataset.element = card.element || ''; }

  function setCards(owned) {
    cardMap.clear();
    for (const card of owned || []) if (card?.id && card.stats) cardMap.set(String(card.id), card);
    cards = [...cardMap.values()].map(card => ({ card, name: card.name.toLocaleLowerCase() })).sort((a, b) => a.card.name.localeCompare(b.card.name));
    selectionKey = ''; hiddenKey = ''; expandedTeams.clear(); lastLogKey = '';
  }
  function renderSelection() {
    const grid = n('pvpPickGrid'); if (!grid) return;
    const key = JSON.stringify([model.mode, model.selection, locked(), model.locked]);
    if (key === selectionKey) return; selectionKey = key;
    grid.dataset.size = String(model.mode); grid.replaceChildren();
    for (let i = 0; i < model.mode; i++) {
      const card = cardMap.get(model.selection?.[i]), slot = button('', 'pvp-deck-slot' + (card ? ' has-card' : ''));
      slot.dataset.pvpSlot = String(i); slot.disabled = locked();
      slot.setAttribute('aria-label', 'PvP card slot ' + (i + 1) + (card ? ': ' + card.name : ': Select Card'));
      const top = U.make('span', 'pvp-slot-top'); top.append(U.make('span', '', 'SLOT ' + String(i + 1).padStart(2, '0')), U.make('span', 'pvp-slot-mark', card ? (model.locked ? '✓ Locked' : '✓ Selected') : '+'));
      slot.append(top);
      if (card) {
        decorate(slot, card); slot.append(artwork(card), elementBadge(card), U.make('strong', 'pvp-slot-name', card.name), U.make('small', 'pvp-level', 'LVL 1 / NORMAL'), statPair(card.stats.hp, card.stats.atk));
      } else {
        const empty = U.make('span', 'pvp-slot-empty'); empty.append(U.make('b', '', '+'), U.make('strong', '', 'Select Card'), U.make('small', '', 'Choose from your collection')); slot.append(empty);
      }
      grid.append(slot);
    }
    text('pvpSelectionCount', (model.selection || []).filter(id => cardMap.has(id)).length + ' / ' + model.mode + ' selected');
    grid.classList.toggle('is-locked', Boolean(model.locked));
  }
  function state(next) {
    model = next;
    if (locked()) closePicker(false);
    const battle = next.phase === 'combat' || next.phase === 'ended' && next.hasCombat;
    visible('pvpLobbyView', !battle); visible('pvpReadyPanel', !battle); visible('pvpBattleView', battle); visible('pvpBattleLeave', battle);
    const step = battle ? 'battle' : next.hello ? 'pick' : 'connect';
    for (const node of host.document.querySelectorAll('[data-pvp-phase]')) {
      node.classList.toggle('is-active', node.dataset.pvpPhase === step);
      if (node.dataset.pvpPhase === step) node.setAttribute('aria-current', 'step'); else node.removeAttribute('aria-current');
    }
    for (const node of host.document.querySelectorAll('[data-pvp-mode]')) {
      const selected = Number(node.dataset.pvpMode) === next.mode;
      node.classList.toggle('is-active', selected); node.setAttribute('aria-pressed', String(selected)); node.disabled = next.hasPeer || next.handling;
    }
    text('pvpConnectionBadge', next.phase === 'ended' ? 'Match ended' : next.hello ? 'Connected' : next.hasPeer ? 'Connecting' : 'Not connected');
    n('pvpConnectionBadge')?.classList.toggle('is-connected', next.hello && next.phase !== 'ended');
    const hidden = n('pvpHiddenSlots'), key = String(next.mode) + ':' + Boolean(next.remoteReady);
    if (hidden && key !== hiddenKey) { hiddenKey = key; hidden.replaceChildren(...Array.from({ length: next.mode }, () => U.make('span', next.remoteReady ? 'is-ready' : '', next.remoteReady ? '✓' : '?'))); }
    const ready = n('pvpReady');
    if (ready) {
      ready.classList.toggle('is-ready', Boolean(next.locked) && next.phase !== 'ended');
      ready.classList.toggle('is-hashing', next.lockState === 'hashing' && next.phase !== 'ended');
      ready.setAttribute('aria-busy', String(next.lockState === 'hashing' && next.phase !== 'ended'));
      ready.textContent = next.phase === 'ended' ? 'Match ended' : next.lockState === 'hashing' ? '✓ Locking / Securing Pick…' : next.locked ? (next.remoteReady ? '✓ Ready / Starting Battle' : '✓ Ready / Waiting for Opponent') : 'Lock In / Ready ↗';
    }
    text('pvpReadyHint', next.phase === 'ended' ? 'Leave the room to play again.' : next.lockState === 'hashing' ? 'Selection locked. Securing your sealed pick…' : next.locked ? (next.remoteReady ? 'Both Ready. Verifying sealed selections…' : 'Your team is sealed. Waiting for your opponent.') : !next.hello ? 'Create or join a room to lock your team.' : !next.valid ? 'Choose a different card for every slot.' : 'Formation complete. Ready when you are.');
    text('pvpBattleFormat', next.mode + 'v' + next.mode + ' / LEVEL 1 / NORMAL');
    renderSelection();
  }

  function clearSearchTimer() { if (searchTimer !== null) host.clearTimeout(searchTimer); searchTimer = null; }
  function openPicker(index) {
    if (locked() || index < 0 || index >= model.mode || !n('pvpCardPicker')) return;
    clearSearchTimer(); pickerSlot = index; draftId = model.selection?.[index] || ''; query = ''; element = ''; limit = PAGE_SIZE;
    returnFocus = host.document.activeElement; text('pvpPickerSlot', '/ Slot ' + String(index + 1).padStart(2, '0'));
    n('pvpCardSearch').value = ''; n('pvpCardPicker').hidden = false; n('pvpMainPanel').inert = true;
    renderFilters(); renderPicker(); n('pvpCardSearch').focus();
  }
  function closePicker(restoreFocus = true) {
    clearSearchTimer();
    if (pickerSlot < 0) return;
    pickerSlot = -1; const overlay = n('pvpCardPicker'); if (overlay) overlay.hidden = true;
    if (n('pvpMainPanel')) n('pvpMainPanel').inert = false;
    n('pvpCardGrid')?.replaceChildren();
    if (restoreFocus) {
      const target = returnFocus?.isConnected ? returnFocus : n('pvpPickGrid')?.querySelector('button:not(:disabled)');
      target?.focus();
    }
    returnFocus = null;
  }
  function occupied(id) { return (model.selection || []).some((selected, index) => index !== pickerSlot && selected === id); }
  function renderFilters() {
    const root = n('pvpElementFilters'); if (!root) return; root.replaceChildren();
    for (const type of ['', ...elements]) { const item = button(type || 'All', 'pvp-filter' + (element === type ? ' is-active' : '')); item.dataset.pvpElement = type; item.setAttribute('aria-pressed', String(element === type)); root.append(item); }
  }
  function pickerChoice() {
    const card = cardMap.get(draftId);
    text('pvpPickerChoice', card ? card.name : 'Choose a card');
    if (n('pvpPickerConfirm')) n('pvpPickerConfirm').disabled = !card || occupied(draftId) || locked();
    for (const tile of n('pvpCardGrid')?.querySelectorAll('[data-pvp-card]') || []) {
      const selected = tile.dataset.pvpCard === draftId;
      tile.classList.toggle('is-selected', selected); tile.setAttribute('aria-pressed', String(selected));
      const label = tile.querySelector('.pvp-card-selected'); if (label) label.hidden = !selected;
    }
  }
  function renderPicker() {
    if (pickerSlot < 0) return;
    const root = n('pvpCardGrid'); if (!root) return;
    const filtered = cards.filter(item => (!query || item.name.includes(query)) && (!element || item.card.element === element));
    const fragment = host.document.createDocumentFragment();
    for (const { card } of filtered.slice(0, limit)) {
      const tile = button('', 'pvp-card-tile'); decorate(tile, card); tile.dataset.pvpCard = String(card.id);
      tile.setAttribute('aria-label', card.name + ', ' + card.element + ', Level 1, HP ' + card.stats.hp + ', ATK ' + card.stats.atk);
      const already = occupied(String(card.id)); tile.disabled = already;
      const art = artwork(card); art.append(elementBadge(card), U.make('span', 'pvp-card-rate', card.chance ? '1 IN ' + number(card.chance) : 'EXCLUSIVE'));
      const mark = U.make('span', 'pvp-card-selected', '✓ Selected'); mark.hidden = draftId !== String(card.id); art.append(mark);
      if (already) art.append(U.make('span', 'pvp-card-in-use', 'In Slot ' + (model.selection.indexOf(String(card.id)) + 1)));
      tile.append(art, U.make('strong', 'pvp-tile-name', card.name), U.make('small', 'pvp-level', 'LVL 1 / NORMAL'), statPair(card.stats.hp, card.stats.atk));
      fragment.append(tile);
    }
    if (!filtered.length) fragment.append(U.make('p', 'pvp-empty-result', cards.length ? 'No cards match. Try another name or element.' : 'No owned cards yet. Roll a card, then return to PvP.'));
    root.replaceChildren(fragment); root.scrollTop = 0;
    text('pvpPickerCount', Math.min(limit, filtered.length) + ' / ' + filtered.length + ' cards'); visible('pvpPickerMore', filtered.length > limit); pickerChoice();
  }
  function confirmPicker() {
    if (pickerSlot < 0 || locked() || !cardMap.has(draftId) || occupied(draftId)) return;
    const index = pickerSlot, id = draftId;
    if (actions.pick?.(index, id) === false) return;
    closePicker(false);
    const slot = n('pvpPickGrid')?.querySelector('[data-pvp-slot="' + index + '"]');
    slot?.classList.add('is-confirmed'); slot?.focus();
  }

  function front(team, start = 0) {
    for (let i = 0; i < team.length; i++) { const unit = team[(start + i) % team.length]; if (!unit.defeated && unit.hp > 0) return unit; }
    return team[start] || team[0];
  }
  function renderCombat(combat, localSide, opponentName) {
    if (!combat) return; lastCombat = [combat, localSide, opponentName];
    const root = n('pvpCombatTeams'); if (!root) return; const fragment = host.document.createDocumentFragment();
    for (const side of [localSide, localSide === 'host' ? 'guest' : 'host']) {
      const team = combat.battle[side === 'host' ? 'playerTeam' : 'enemyTeam'];
      const current = front(team, combat.battle[side === 'host' ? 'playerIndex' : 'enemyIndex'] || 0);
      const yours = side === localSide, panel = U.make('section', 'pvp-team' + (combat.activeSide === side && !combat.battle.finished ? ' is-acting' : ''));
      const title = U.make('div', 'pvp-team-title'); title.append(U.make('h3', '', yours ? 'YOUR TEAM' : opponentName), U.make('span', '', team.filter(unit => unit.hp > 0 && !unit.defeated).length + ' alive')); panel.append(title);
      if (current) {
        const card = current.card, dead = current.defeated || current.hp <= 0, fighter = U.make('article', 'pvp-fighter' + (dead ? ' is-defeated' : ''));
        decorate(fighter, card); const art = artwork(card, 'pvp-fighter-art'); art.append(elementBadge(card), U.make('span', 'pvp-front-tag', dead ? 'DEFEATED' : combat.activeSide === side && !combat.battle.finished ? '⚡ ATTACKING' : 'FRONTLINE'));
        const name = U.make('div', 'pvp-fighter-name'); name.append(U.make('small', 'pvp-level', 'LVL 1 / NORMAL'), U.make('strong', '', card.name)); art.append(name); fighter.append(art);
        const hp = Math.max(0, current.hp), info = U.make('div', 'pvp-fighter-info');
        const line = U.make('div', 'pvp-hp-label'); line.append(U.make('b', '', 'HP'), U.make('span', '', number(hp) + ' / ' + number(current.maxHp))); info.append(line);
        const bar = U.make('progress', 'pvp-hp-bar'); bar.max = Math.max(1, current.maxHp); bar.value = hp; bar.setAttribute('aria-label', card.name + ' HP'); info.append(bar);
        const extras = U.make('div', 'pvp-fighter-extras'); extras.append(U.make('span', '', 'ATK ' + number(current.atk)), U.make('span', '', '◈ Shield ' + number(current.passiveState?.shield || 0))); info.append(extras);
        const details = U.make('details', 'pvp-passive'); details.append(U.make('summary', '', card.passive?.name || 'Passive'), U.make('p', '', card.passive?.description || '')); info.append(details); fighter.append(info); panel.append(fighter);
      }
      const reserves = team.filter(unit => unit !== current), rail = U.make('div', 'pvp-reserve-rail');
      for (const unit of reserves.slice(0, expandedTeams.has(side) ? reserves.length : 8)) {
        const tile = U.make('div', 'pvp-reserve' + (unit.defeated || unit.hp <= 0 ? ' is-defeated' : '')); decorate(tile, unit.card);
        tile.title = unit.card.name + ' · HP ' + number(unit.hp) + ' / ' + number(unit.maxHp);
        tile.append(artwork(unit.card), U.make('strong', '', unit.card.name), U.make('small', '', unit.defeated || unit.hp <= 0 ? 'DEFEATED' : number(unit.hp) + ' HP')); rail.append(tile);
      }
      panel.append(rail);
      if (reserves.length > 8) { const more = button(expandedTeams.has(side) ? 'Show fewer units' : '+' + (reserves.length - 8) + ' more units', 'pvp-text-button'); more.dataset.pvpReserves = side; panel.append(more); }
      fragment.append(panel);
    }
    root.replaceChildren(fragment);
    const logKey = combat.logs.length + ':' + combat.logs.at(-1);
    if (lastLogKey !== logKey) { lastLogKey = logKey; n('pvpLog')?.replaceChildren(...combat.logs.slice(-50).map(line => U.make('p', '', line))); }
  }
  function renderClock(seq, side, localSide, deadline, phase, confirmed, busy) {
    if (phase !== 'combat') return;
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    text('pvpTurnLabel', 'Turn ' + seq + ' · ' + (side === localSide ? 'Your' : 'Opponent') + ' strike · ' + seconds + 's');
    text('pvpTurnHint', !confirmed || busy ? 'Verifying the next step…' : side === localSide ? 'Strike now or play automatically when the timer ends.' : 'Waiting for your opponent. Timer prevents stalling.');
  }
  function resetCombat() { lastCombat = null; lastLogKey = ''; expandedTeams.clear(); n('pvpCombatTeams')?.replaceChildren(); n('pvpLog')?.replaceChildren(); }
  function mount(options) {
    actions = options || {}; if (mounted) return; mounted = true;
    for (const id of ['pvpModal', 'pvpMainPanel', 'pvpPickGrid', 'pvpCardPicker', 'pvpCardGrid', 'pvpCardSearch']) n(id);
    n('pvpPickGrid')?.addEventListener('click', event => { const slot = event.target.closest('[data-pvp-slot]'); if (slot) openPicker(Number(slot.dataset.pvpSlot)); });
    n('pvpCardGrid')?.addEventListener('click', event => { const tile = event.target.closest('[data-pvp-card]'); if (!tile || tile.disabled || locked()) return; draftId = tile.dataset.pvpCard; pickerChoice(); });
    n('pvpElementFilters')?.addEventListener('click', event => { const filter = event.target.closest('[data-pvp-element]'); if (!filter) return; clearSearchTimer(); query = n('pvpCardSearch').value.trim().toLocaleLowerCase(); element = filter.dataset.pvpElement; limit = PAGE_SIZE; renderFilters(); renderPicker(); });
    n('pvpCardSearch')?.addEventListener('input', () => { clearSearchTimer(); searchTimer = host.setTimeout(() => { searchTimer = null; query = n('pvpCardSearch').value.trim().toLocaleLowerCase(); limit = PAGE_SIZE; renderPicker(); }, 100); });
    for (const id of ['pvpPickerClose', 'pvpPickerCancel']) n(id)?.addEventListener('click', () => closePicker());
    n('pvpPickerConfirm')?.addEventListener('click', confirmPicker);
    n('pvpPickerMore')?.addEventListener('click', () => { limit += PAGE_SIZE; renderPicker(); });
    n('pvpCardPicker')?.addEventListener('click', event => { if (event.target === n('pvpCardPicker')) closePicker(); });
    n('pvpCombatTeams')?.addEventListener('click', event => { const toggle = event.target.closest('[data-pvp-reserves]'); if (!toggle || !lastCombat) return; const side = toggle.dataset.pvpReserves; if (expandedTeams.has(side)) expandedTeams.delete(side); else expandedTeams.add(side); renderCombat(...lastCombat); });
    host.document.addEventListener('keydown', event => {
      if (pickerSlot < 0) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); closePicker(); }
      if (event.key === 'Tab') {
        const focusable = [...n('pvpCardPicker').querySelectorAll('button:not(:disabled),input')].filter(node => node.getClientRects().length);
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && host.document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && host.document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }, true);
  }
  host.PvPView = Object.freeze({ mount, setCards, state, closePicker, resetCombat, renderCombat, renderClock });
})(window);
