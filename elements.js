/* Native card elements: damage relationships and reusable UI badges only. */
(function (host) {
  'use strict';
  const TYPES = Object.freeze(['Fire', 'Water', 'Nature', 'Electric', 'Dark', 'Holy']);
  const COUNTERS = Object.freeze({ Fire: 'Nature', Nature: 'Electric', Electric: 'Water', Water: 'Fire', Holy: 'Dark', Dark: 'Holy' });
  const ICONS = Object.freeze(Object.fromEntries(TYPES.map(type => [type, `assets/${type.toLowerCase()}.png`])));
  function of(value) {
    if (typeof value === 'string') return TYPES.includes(value) ? value : null;
    const element = value?.card ? value.card.element : value?.element;
    return TYPES.includes(element) ? element : null;
  }
  function multiplier(source, target) {
    const attacker = of(source), defender = of(target);
    if (!attacker || !defender || attacker === defender) return 1;
    // Advantage takes precedence for the bidirectional Holy/Dark pair.
    if (COUNTERS[attacker] === defender) return 3;
    return COUNTERS[defender] === attacker ? 1 / 3 : 1;
  }
  const MATRIX = Object.freeze(Object.fromEntries(TYPES.map(a => [a, Object.freeze(Object.fromEntries(TYPES.map(b => [b, multiplier(a, b)])))])));
  function damage(source, target, amount) { return Math.max(0, Number(amount) || 0) * multiplier(source, target); }
  function badgeMarkup(value) {
    const type = of(value);
    return type ? `<span class="element-badge" data-element="${type}" title="${type} element" aria-label="${type} element"><img src="${ICONS[type]}" alt="" width="28" height="28"></span>` : '';
  }
  function renderBadge(container, value) {
    if (!container) return;
    const type = of(value), prior = container.querySelector(':scope > .element-badge');
    if (!type) { prior?.remove(); return; }
    if (prior?.dataset.element === type) return;
    prior?.remove();
    const badge = container.ownerDocument.createElement('span');
    badge.className = 'element-badge'; badge.dataset.element = type;
    badge.title = `${type} element`; badge.setAttribute('aria-label', `${type} element`);
    const img = container.ownerDocument.createElement('img'); img.src = ICONS[type]; img.alt = ''; img.width = 28; img.height = 28;
    badge.append(img); container.insertBefore(badge, container.querySelector(':scope > .drop-rate'));
  }
  function compare(a, b) { return TYPES.indexOf(of(a)) - TYPES.indexOf(of(b)); }
  host.ElementSystem = Object.freeze({ TYPES, COUNTERS, ICONS, MATRIX, of, multiplier, damage, badgeMarkup, renderBadge, compare });
})(window);
