/* Presentation only: never awards a card or changes the RNG/progression. */
(function (host) {
  'use strict';
  const KEY = 'anime_card_rng_hide_rolling_card';
  let enabled = false, last = null, bridge = {}, refs = {}, boundToggle = null, queued = false, initialized = false, shown = null;
  try { enabled = JSON.parse(host.localStorage.getItem(KEY) || 'false') === true; } catch (_) {}
  function visible(node, show) {
    if (!node) return;
    if (node.hidden !== !show) node.hidden = !show;
    if (node.classList.contains('hidden') !== !show) node.classList.toggle('hidden', !show);
    if (show) { if (node.style.getPropertyValue('display')) node.style.removeProperty('display'); }
    else if (node.style.getPropertyValue('display') !== 'none' || node.style.getPropertyPriority('display') !== 'important') node.style.setProperty('display', 'none', 'important');
  }
  function showOnly(kind) {
    if (shown === kind) return false;
    shown = kind;
    visible(refs.card, kind === 'card'); visible(refs.empty, kind === 'empty');
    visible(refs.miss, kind === 'miss'); visible(refs.quiet, kind === 'quiet');
  }
  function hide() {
    if (shown !== 'quiet') { showOnly('quiet'); refs.card?.classList.remove('pop-in'); refs.miss?.classList.remove('shake'); refs.toast?.classList.remove('show'); }
  }
  function revealLast() {
    if (last?.kind === 'card') { showOnly('card'); bridge.showResult?.(last.card, last.chance, last.mutations); }
    else if (last?.kind === 'miss') { showOnly('miss'); bridge.showMiss?.(last.score); }
    else showOnly('empty');
  }
  function setEnabled(value, persist = true) {
    enabled = value === true;
    if (persist) {
      try { host.localStorage.setItem(KEY, JSON.stringify(enabled)); if (refs.toggle) refs.toggle.title = ''; }
      catch (_) { if (refs.toggle) refs.toggle.title = 'Active for this session; browser storage is unavailable.'; }
    }
    if (refs.toggle) refs.toggle.checked = enabled;
    if (refs.label) refs.label.textContent = enabled ? 'ON' : 'OFF';
    if (enabled && !last?.isNew) hide(); else revealLast();
    bridge.onModeChange?.();
  }
  function onToggle(event) { setEnabled(event.currentTarget.checked); }
  function configure(options = {}) {
    bridge = {...bridge, ...options};
    const doc = host.document;
    if (!doc) return false;
    if (doc.readyState === 'loading') {
      if (!queued) { queued = true; doc.addEventListener('DOMContentLoaded', () => { queued = false; configure(); }, {once:true}); }
      return false;
    }
    const get = id => doc.getElementById(id);
    const oldCard = refs.card;
    refs = {card:get('resultCard'),empty:get('emptyState'),miss:get('missState'),quiet:get('rollHiddenState'),toast:get('rewardToast'),toggle:get('hideRollingCardToggle'),label:get('hideRollingCardState')};
    if (oldCard !== refs.card) shown = null;
    initialized = Boolean(refs.card && refs.toggle && typeof bridge.showResult === 'function' && typeof bridge.showMiss === 'function');
    if (!initialized) { host.GameStartup?.report('roll-ui','Roll display could not initialize: missing card container, toggle or app bindings.'); return false; }
    if (boundToggle !== refs.toggle) {
      boundToggle?.removeEventListener('change', onToggle); boundToggle = refs.toggle; boundToggle.addEventListener('change', onToggle);
    }
    refs.toggle.disabled = false; host.GameStartup?.clear('roll-ui'); host.GameStartup?.clear('startup:RollViewSystem');
    setEnabled(enabled, false); return true;
  }
  function beginRoll() { if (enabled) hide(); }
  function cardResult(card, chance, mutations = [], isNew = false) {
    last ||= {};
    last.kind = 'card'; last.card = card; last.chance = chance; last.mutations = Array.isArray(mutations) ? mutations : []; last.isNew = isNew === true;
    const reveal = !enabled || last.isNew;
    if (!reveal) hide(); // Presentation of visible results is batched by app.js.
    return reveal;
  }
  function missResult(score) {
    last ||= {}; last.kind = 'miss'; last.card = null; last.mutations = null; last.score = score; last.isNew = false;
    if (enabled) hide(); return !enabled;
  }
  function presentLast() { if (!enabled || last?.isNew) revealLast(); }

  function reset() { last = null; setEnabled(false); }
  host.RollViewSystem = Object.freeze({KEY, configure, beginRoll, cardResult, missResult, presentLast, reset, get enabled(){return enabled;}, get ready(){return initialized;}});
})(window);
