/* One cached overlay, driven by the existing global tick. No potion/save progression. */
(function (host) {
  'use strict';
  const KEY = 'anime_card_rng_show_potions_hud';
  let enabled = true, root = null, toggle = null, signature = '', rows = new Map();
  try { enabled = host.localStorage.getItem(KEY) !== 'false'; } catch (_) {}
  const labels = { luck: 'Luck', rich: 'Rich', exp: 'EXP', speed: 'Speed', battleSpeed: 'Battle' };
  const time = milliseconds => {
    const s = Math.max(0, Math.ceil(milliseconds / 1000));
    return s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
      : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  const text = (node, value) => { if (node && node.textContent !== value) node.textContent = value; };
  function show(visible){
    root.hidden=!visible;
    const body=host.document?.body;
    if(body && body.classList.contains('potions-hud-visible')!==visible)body.classList.toggle('potions-hud-visible',visible);
  }
  function render(at = Date.now()) {
    if (!root) return;
    if (toggle && toggle.checked !== enabled) toggle.checked = enabled;
    if (!enabled) { show(false); return; }
    const effects = host.InventorySystem?.activeEffects(at) || [];
    show(effects.length > 0);
    const key = effects.map(item => `${item.id}:${item.image}`).join('|');
    if (key !== signature) {
      signature = key; root.replaceChildren(); rows.clear();
      for (const effect of effects) {
        const tile = host.document.createElement('div'); tile.className = 'potion-hud-item' + (effect.super ? ' is-super' : '');
        tile.dataset.potionId = effect.id; tile.setAttribute('role', 'listitem');
        const icon = host.document.createElement('span'); icon.className = 'potion-hud-icon';
        const fallback = host.document.createElement('span'); fallback.className='potion-bottle'+(effect.super?' is-super':'');fallback.dataset.potionStat=effect.stat;fallback.setAttribute('aria-hidden','true');icon.append(fallback);
        if(effect.image){const image=host.document.createElement('img');image.src=effect.image;image.alt='';image.addEventListener('load',()=>{fallback.hidden=true;},{once:true});image.addEventListener('error',()=>{image.remove();fallback.hidden=false;},{once:true});icon.append(image);}
        const label = host.document.createElement('small'); label.textContent = `${effect.super ? 'S. ' : ''}${labels[effect.stat] || effect.name}`;
        const timer = host.document.createElement('strong');
        tile.append(icon, label, timer); root.append(tile); rows.set(effect.id, { tile, timer });
      }
    }
    for (const effect of effects) {
      const row = rows.get(effect.id); if (!row) continue;
      const remaining = time(effect.remaining); text(row.timer, remaining);
      const paused = effect.pausedRemaining ? `; regular potion paused with ${time(effect.pausedRemaining)} remaining` : '';
      const label = `${effect.name}: ${remaining} remaining${paused}`;
      if (row.tile.getAttribute('aria-label') !== label) row.tile.setAttribute('aria-label', label);
    }
  }
  function setEnabled(value) {
    const next = Boolean(value);
    try { host.localStorage.setItem(KEY, JSON.stringify(next)); } catch (_) { if (toggle) toggle.checked = enabled; return false; }
    enabled = next; render(); return true;
  }
  function mount() {
    root = host.document?.getElementById('activePotionsHud') || null;
    toggle = host.document?.getElementById('showActivePotionsHudToggle') || null;
    toggle?.addEventListener('change', () => setEnabled(toggle.checked)); render();
  }
  host.addEventListener('storage', event => { if (event.key === KEY) { enabled = event.newValue !== 'false'; render(); } });
  host.PotionHudSystem = Object.freeze({ KEY, render, setEnabled, get enabled() { return enabled; } });
  if (host.document?.readyState === 'loading') host.document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
})(window);
