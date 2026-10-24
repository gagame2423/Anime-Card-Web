/* Authentication gate, ordered runtime loading and deployment diagnostics. */
(function (host) {
  'use strict';
  const doc = host.document, issues = new Map(), callbacks = new Set();
  let locked = true, loaded = false, failed = false, loadJob = null;
  function domReady(callback) { if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', callback, { once: true }); else callback(); }
  function authState({ unlocked = false, message = '', busy = false } = {}) {
    locked = !unlocked || failed;
    doc.body?.classList.toggle('auth-required', locked);
    const shell = doc.getElementById('app'), gate = doc.getElementById('authGate'), button = doc.getElementById('authGoogleButton');
    if (shell) { shell.inert = locked; shell.setAttribute('aria-hidden', String(locked)); }
    for (const modal of doc.querySelectorAll('.modal-backdrop')) modal.inert = locked;
    if (gate) { gate.hidden = !locked; gate.setAttribute('aria-busy', String(busy)); }
    const status = doc.getElementById('authGateStatus');
    if (status && message) status.textContent = message;
    if (button) button.disabled = Boolean(busy);
    if (locked && gate && !gate.contains(doc.activeElement)) (button?.disabled ? gate : button)?.focus({ preventScroll: true });
  }
  function render() {
    if (!doc.body) return;
    let box = doc.getElementById('gameStartupNotice');
    if (!issues.size) { box?.remove(); return; }
    if (locked) { const status = doc.getElementById('authGateStatus'); if (status) status.textContent = [...issues.values()].join(' ') + ' Upload the complete update and reload.'; return; }
    if (!box) { box = doc.createElement('div'); box.id = 'gameStartupNotice'; box.setAttribute('role', 'alert'); Object.assign(box.style, { position:'fixed',top:'8px',left:'12px',right:'12px',zIndex:'10000',padding:'12px',background:'#321c28',color:'#fff',border:'1px solid #eaa1b1',borderRadius:'8px',font:'12px/1.5 sans-serif' }); doc.body.append(box); }
    box.textContent = [...issues.values()].join(' ') + ' Reload after uploading the complete update; filenames are case-sensitive.';
  }
  function report(key, message, error) { issues.set(key, message); if (error) host.console?.error?.('[Game startup] ' + message, error); render(); }
  function clear(key) { issues.delete(key); render(); }
  function validate() {
    for (const name of ['InfinityCloudSystem','InfinityRules','InfinitySystem','InfinityCombat','ShopBulkSystem','CloudSaveSystem','OnlineUtils','PvPSystem','PvPView','PvPCombat','LeaderboardSystem','ExpFoodSystem','createCombatStats','QuestsSystem','CraftingSystem','EquipmentSystem','StorageSystem','DropAudioSystem','PotionHudSystem','SettingsSystem','UIPerformanceSystem','createReaganSkills','createRequiemSkills','createFateSkills','createSpookySkills','createGomenSkills','createShibuyaSkills','createCompanionRules','BattleWeatherHud','SpookySystem','CategorySystem','createYunoSkills','createGrimoireSkills','RollPerformanceSystem']) if (!host[name]) report('startup:' + name, 'Could not load ' + name + '; upload the complete update.');
    for (const [name, control] of [['RollViewSystem','hideRollingCardToggle'], ['SandboxSystem','sandboxOpenButton']]) { if (!host[name]?.ready) { const node = doc.getElementById(control); if (node) node.disabled = true; report('startup:' + name, name + ' could not initialize.'); } }
    if (issues.size) throw Error([...issues.values()].join(' '));
  }
  async function loadGame() {
    if (!host.CloudSaveSystem?.googleVerified || host.navigator.onLine === false) throw Error('Google authentication is required before loading gameplay.');
    if (loaded) return;
    if (loadJob) return loadJob;
    loadJob = (async () => {
      for (const declaration of doc.querySelectorAll('script[data-game-script]')) {
        if (!host.CloudSaveSystem.googleVerified) throw Object.assign(Error('Authentication changed while loading gameplay.'), { code:'auth/session-changed' });
        await host.OnlineUtils.loadGameScript(declaration);
      }
      validate(); loaded = true;
      for (const callback of callbacks) callback(); callbacks.clear();
    })();
    try { await loadJob; } catch (error) { if (error.code !== 'auth/session-changed') { failed = true; report('startup:runtime', error.message); } throw error; }
    finally { loadJob = null; }
  }
  function ready(callback) { if (loaded) queueMicrotask(callback); else callbacks.add(callback); }
  doc.addEventListener('error', event => {
    const node = event.target;
    if (node?.dataset?.onlineResource === 'true') return;
    if (node?.tagName !== 'SCRIPT' && !(node?.tagName === 'LINK' && node.rel === 'stylesheet')) return;
    report('resource:' + (node.src || node.href), 'Could not load ' + (node.src || node.href).split('/').pop() + '.');
  }, true);
  host.addEventListener('error', event => {
    if (event.filename && [...doc.querySelectorAll('script[data-online-resource="true"]')].some(node => node.src === event.filename)) return;
    if (event.target === host && event.filename && event.message) report('script:' + event.filename, 'A game script could not initialize: ' + event.filename.split('/').pop() + '.', event.error);
  });
  doc.addEventListener('keydown', event => {
    if (!locked) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); }
    if (event.key === 'Tab') { event.preventDefault(); const button = doc.getElementById('authGoogleButton'); (button?.disabled ? doc.getElementById('authGate') : button)?.focus(); }
  }, true);
  host.GameStartup = Object.freeze({ report, clear, ready, authState, loadGame, get failed(){return failed;}, get loaded(){return loaded;}, get locked(){return locked;} });
  domReady(() => {
    authState({ message:'Connecting to Google Authentication…', busy:true });
    doc.getElementById('authGoogleButton')?.addEventListener('click', () => { if (failed) { host.location.reload(); return; } void host.CloudSaveSystem.google(); });
    void host.CloudSaveSystem.start().catch(() => {});
  });
})(window);
