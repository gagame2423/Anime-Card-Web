/* Category registry and pure helpers. All card assignments live in cards.js. */
(function(host) {
  'use strict';

  const TYPES = Object.freeze([
    'Hero', 'Villian', 'AntiHero', 'AntiVillian', 'Protagonist', 'Berserk',
    'VideoGame', 'JoJo', 'Jujutsu', 'Fate', 'Pirate', 'DragonWarrior',
    'PlanetDestroyer', 'Ninja', 'Unhuman', 'Human', 'Captain', 'Brutal',
    'PureEvil', 'DemonSlayer', 'Sins', 'Alternative', 'Army', 'Swordman',
    'Supporter', 'Magician', 'Reaper', 'Hunter', 'Titan', 'TitanSlayer',
    'Animal', 'Mastermind', 'Baller', 'Isekai', 'Draconic', 'Bleach', 'Gunner'
  ]);
  const ALIASES = Object.freeze({
    Villain: 'Villian',
    AntiVillain: 'AntiVillian',
    Jojo: 'JoJo'
  });
  const valid = new Set(TYPES);
  const order = new Map(TYPES.map((type, index) => [type, index]));

  // Normalize comparisons, never the card object or its category array.
  function normalize(value) {
    const name = String(value);
    return Object.hasOwn(ALIASES, name) ? ALIASES[name] : name;
  }

  function of(value) {
    const card = value?.card || value;
    return Array.isArray(card?.category) ? card.category : [];
  }

  function has(value, category) {
    const wanted = normalize(category);
    return of(value).some(type => normalize(type) === wanted);
  }

  function matches(value, category) {
    return !category || category === 'all' || has(value, category);
  }

  function compare(a, b) {
    const position = value => Math.min(TYPES.length,
      ...of(value).map(type => order.get(normalize(type)) ?? TYPES.length));
    return position(a) - position(b);
  }

  function mount(select) {
    if (!select) return;
    const value = normalize(select.value);
    const doc = select.ownerDocument;
    select.replaceChildren();
    for (const type of ['all', ...TYPES]) {
      const option = doc.createElement('option');
      option.value = type;
      option.textContent = type === 'all' ? 'All Categories' : type;
      select.append(option);
    }
    select.value = valid.has(value) ? value : 'all';
  }

  host.CategorySystem = Object.freeze({
    TYPES, normalize, of, has, matches, compare, mount,
    isValid: type => valid.has(normalize(type))
  });
})(window);
