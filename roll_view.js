/* Optional lightweight roll presentation. This module never awards a drop. */
(function (host) {
  'use strict';
  const KEY = 'anime_card_rng_hide_rolling_card';
  let enabled = false, last = null, bridge = {}, refs = {};
  try { enabled = JSON.parse(host.localStorage.getItem(KEY) || 'false') === true; } catch (_) {}
  function hide() {
    for (const node of [refs.card, refs.empty, refs.miss]) node?.classList.add('hidden');
    refs.card?.classList.remove('pop-in'); refs.miss?.classList.remove('shake');
    refs.quiet?.classList.remove('hidden');
    refs.toast?.classList.remove('show');
  }
  function revealLast() {
    refs.quiet?.classList.add('hidden');
    if (last?.kind === 'card') bridge.showResult?.(last.card, last.chance, last.mutations);
    else if (last?.kind === 'miss') bridge.showMiss?.(last.score);
    else { refs.card?.classList.add('hidden'); refs.miss?.classList.add('hidden'); refs.empty?.classList.remove('hidden'); }
  }
  function setEnabled(value, persist = true) {
    const before = enabled; enabled = value === true;
    if (persist) {
      try { host.localStorage.setItem(KEY, JSON.stringify(enabled)); }
      catch (_) { enabled = before; }
    }
    if (refs.toggle) refs.toggle.checked = enabled;
    if (refs.label) refs.label.textContent = enabled ? 'ON' : 'OFF';
    if (enabled && !last?.isNew) hide(); else revealLast();
  }
  function configure(options) {
    bridge = options;
    const doc = host.document;
    refs = { card:doc.getElementById('resultCard'), empty:doc.getElementById('emptyState'), miss:doc.getElementById('missState'), quiet:doc.getElementById('rollHiddenState'), toast:doc.getElementById('rewardToast'), toggle:doc.getElementById('hideRollingCardToggle'), label:doc.getElementById('hideRollingCardState') };
    refs.toggle?.addEventListener('change', () => setEnabled(refs.toggle.checked));
    setEnabled(enabled, false);
  }
  function beginRoll() { if (enabled) hide(); }
  function cardResult(card, chance, mutations, isNew) {
    last = { kind:'card', card, chance, mutations:[...mutations], isNew };
    const visible = !enabled || isNew;
    if (visible) refs.quiet?.classList.add('hidden'); else hide();
    return visible;
  }
  function missResult(score) { last = { kind:'miss', score, isNew:false }; if (enabled) hide(); else refs.quiet?.classList.add('hidden'); return !enabled; }
  function reset() { last = null; setEnabled(false); }
  host.RollViewSystem = Object.freeze({ KEY, configure, beginRoll, cardResult, missResult, reset, get enabled() { return enabled; } });
})(window);
