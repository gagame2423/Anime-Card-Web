/* Deployment diagnostics. No game data or progression is read or written. */
(function (host) {
  'use strict';
  const issues = new Map(), doc = host.document;
  function render() {
    if (!doc?.body) return;
    let box = doc.getElementById('gameStartupNotice');
    if (!issues.size) { box?.remove(); return; }
    if (!box) {
      box = doc.createElement('div'); box.id = 'gameStartupNotice'; box.setAttribute('role', 'alert');
      // Also readable if the stylesheet itself failed to load.
      Object.assign(box.style, {position:'fixed',top:'8px',left:'12px',right:'12px',zIndex:'10000',padding:'12px',background:'#321c28',color:'#fff',border:'1px solid #eaa1b1',borderRadius:'8px',font:'12px/1.5 sans-serif',maxHeight:'30vh',overflow:'auto'});
      doc.body.append(box);
    }
    box.replaceChildren();
    const text = doc.createElement('span');
    text.textContent = [...issues.values()].join(' ') + ' Reload the page after uploading the complete update; filenames are case-sensitive.';
    const reload = doc.createElement('button'); reload.type = 'button'; reload.textContent = 'Reload';
    reload.addEventListener('click', () => host.location.reload()); box.append(text, ' ', reload);
  }
  function report(key, message, error) { issues.set(key, message); if (error) host.console?.error?.('[Game startup] ' + message, error); render(); }
  function clear(key) { issues.delete(key); render(); }
  function ready(callback) { if (!doc) return; if (doc.readyState !== 'complete') doc.addEventListener('DOMContentLoaded', callback, {once:true}); else callback(); }
  doc?.addEventListener('error', event => {
    const node = event.target;
    if (node?.tagName !== 'SCRIPT' && !(node?.tagName === 'LINK' && node.rel === 'stylesheet')) return;
    const file = (node.src || node.href || '').split('/').pop();
    report('resource:' + file, 'Could not load ' + file + '.');
  }, true);
  host.addEventListener?.('error', event => {
    if (event.target === host && event.filename && event.message) report('script:' + event.filename, 'A game script could not initialize: ' + event.filename.split('/').pop() + '.', event.error);
  });
  ready(() => {
    for(const name of ['QuestsSystem','CraftingSystem','EquipmentSystem','StorageSystem','DropAudioSystem','PotionHudSystem','SettingsSystem','createReaganSkills','createRequiemSkills','createFateSkills','createSpookySkills','createGomenSkills','SpookySystem','CategorySystem'])if(!host[name])report('startup:'+name,'Could not load '+name+'; upload the complete update.');
    if (!host.createYunoSkills) report('startup:Yuno', 'Could not load yuno.js; upload the complete update.');
    if (!host.createGrimoireSkills) report('startup:Grimoire', 'Could not load grimoire.js; upload the complete update.');
    if (!host.RollPerformanceSystem) report('startup:RollPerformanceSystem', 'Could not load roll_performance.js; performance optimizations are unavailable.');
    for (const [name, control] of [['RollViewSystem','hideRollingCardToggle'], ['SandboxSystem','sandboxOpenButton']]) {
      const feature = host[name], node = doc.getElementById(control);
      if (!feature?.ready) {
        if (node) { node.disabled = true; node.title = 'This feature could not initialize. See the update notice.'; }
        report('startup:' + name, name + ' could not initialize; check the matching HTML and scripts.');
      }
    }
  });
  host.GameStartup = Object.freeze({report, clear, ready});
})(window);
