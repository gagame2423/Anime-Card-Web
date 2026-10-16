/* Mutation definitions, stat factors and independent tier rolls. Legacy IDs stay valid. */
const MUTATION_SUCCESS_RATES = Object.freeze({ common: .10, uncommon: .05, rare: .025 });
const MUTATIONS = [
  {
    "id": "wet",
    "name": "Wet",
    "rarity": "common",
    "hpMultiplier": 1.1,
    "atkMultiplier": 1.25,
    "multiplier": 1.5,
    "color": "#00bfff",
    "className": "mutation-wet",
    "secondaryColor": "#00bfff",
    "tier": {
      "id": "wet",
      "name": "Wet",
      "rank": 1
    },
    "description": "HP x1.1 • ATK x1.25"
  },
  {
    "id": "solar",
    "name": "Solar",
    "rarity": "common",
    "hpMultiplier": 1.25,
    "atkMultiplier": 1.1,
    "multiplier": 1.6,
    "color": "#ffd700",
    "className": "mutation-solar",
    "secondaryColor": "#ffd700",
    "tier": {
      "id": "solar",
      "name": "Solar",
      "rank": 2
    },
    "description": "HP x1.25 • ATK x1.1"
  },
  {
    "id": "frost",
    "name": "Frost",
    "rarity": "common",
    "hpMultiplier": 1.2,
    "atkMultiplier": 1.2,
    "multiplier": 1.75,
    "color": "#00ffff",
    "className": "mutation-frost",
    "secondaryColor": "#00ffff",
    "tier": {
      "id": "frost",
      "name": "Frost",
      "rank": 3
    },
    "description": "HP x1.2 • ATK x1.2"
  },
  {
    "id": "clove",
    "name": "Clove",
    "rarity": "common",
    "hpMultiplier": 1.3,
    "atkMultiplier": 1.1,
    "multiplier": 1.1958260743101399,
    "color": "#39ff14",
    "className": "mutation-clove",
    "secondaryColor": "#39ff14",
    "tier": {
      "id": "clove",
      "name": "Clove",
      "rank": 4
    },
    "description": "HP x1.3 • ATK x1.1"
  },
  {
    "id": "sweat",
    "name": "Sweet",
    "rarity": "uncommon",
    "hpMultiplier": 1.5,
    "atkMultiplier": 2,
    "multiplier": 1.45,
    "color": "#ff69b4",
    "className": "mutation-sweat",
    "secondaryColor": "#ff69b4",
    "tier": {
      "id": "sweat",
      "name": "Sweet",
      "rank": 5
    },
    "description": "HP x1.5 • ATK x2"
  },
  {
    "id": "hollow",
    "name": "Hollow",
    "rarity": "uncommon",
    "hpMultiplier": 1.6,
    "atkMultiplier": 1.8,
    "multiplier": 3,
    "color": "#ffffff",
    "className": "mutation-hollow",
    "secondaryColor": "#ffffff",
    "tier": {
      "id": "hollow",
      "name": "Hollow",
      "rank": 6
    },
    "description": "HP x1.6 • ATK x1.8"
  },
  {
    "id": "eclipsed",
    "name": "Eclipsed",
    "rarity": "uncommon",
    "hpMultiplier": 2,
    "atkMultiplier": 2,
    "multiplier": 2,
    "color": "#ff0033",
    "className": "mutation-eclipsed",
    "secondaryColor": "#ff0033",
    "tier": {
      "id": "eclipsed",
      "name": "Eclipsed",
      "rank": 7
    },
    "description": "HP x2 • ATK x2"
  },
  {
    "id": "storm",
    "name": "Storm",
    "rarity": "uncommon",
    "hpMultiplier": 1.5,
    "atkMultiplier": 3,
    "multiplier": 2.1213203435596424,
    "color": "#ffffff",
    "className": "mutation-storm",
    "secondaryColor": "#707780",
    "tier": {
      "id": "storm",
      "name": "Storm",
      "rank": 8
    },
    "description": "HP x1.5 • ATK x3"
  },
  {
    "id": "cursed",
    "name": "Cursed",
    "rarity": "rare",
    "hpMultiplier": 5,
    "atkMultiplier": 3,
    "multiplier": 3.25,
    "color": "#8b0000",
    "className": "mutation-cursed",
    "secondaryColor": "#8b0000",
    "tier": {
      "id": "cursed",
      "name": "Cursed",
      "rank": 9
    },
    "description": "HP x5 • ATK x3"
  },
  {
    "id": "mangekyo",
    "name": "Mangekyo",
    "rarity": "rare",
    "hpMultiplier": 4,
    "atkMultiplier": 3.5,
    "multiplier": 2.8,
    "color": "#ff0000",
    "className": "mutation-mangekyo",
    "secondaryColor": "#ff0000",
    "tier": {
      "id": "mangekyo",
      "name": "Mangekyo",
      "rank": 10
    },
    "description": "HP x4 • ATK x3.5"
  },
  {
    "id": "angelic",
    "name": "Angelic",
    "rarity": "rare",
    "hpMultiplier": 6,
    "atkMultiplier": 3,
    "multiplier": 2.6,
    "color": "#ffd700",
    "className": "mutation-angelic",
    "secondaryColor": "#ffffff",
    "tier": {
      "id": "angelic",
      "name": "Angelic",
      "rank": 11
    },
    "description": "HP x6 • ATK x3"
  },
  {
    "id": "monarch",
    "name": "Monarch",
    "rarity": "rare",
    "hpMultiplier": 3,
    "atkMultiplier": 6,
    "multiplier": 2.4,
    "color": "#8a2be2",
    "className": "mutation-monarch",
    "secondaryColor": "#00008b",
    "tier": {
      "id": "monarch",
      "name": "Monarch",
      "rank": 12
    },
    "description": "HP x3 • ATK x6"
  },
  {
    "id": "stardust",
    "name": "Stardust",
    "rarity": "rare",
    "hpMultiplier": 3,
    "atkMultiplier": 4,
    "multiplier": 3.4641016151377544,
    "color": "#ff38cf",
    "className": "mutation-stardust",
    "secondaryColor": "#ff9fe8",
    "tier": {
      "id": "stardust",
      "name": "Stardust",
      "rank": 13
    },
    "description": "HP x3 • ATK x4"
  }
].map(Object.freeze);
const MUTATION_TIERS = Object.freeze({ normal: Object.freeze({ id: 'normal', name: 'Normal', rank: 0 }), ...Object.fromEntries(MUTATIONS.map(m => [m.id, m.tier])), multi: Object.freeze({ id: 'multi', name: 'Multi-Mutations', rank: 99 }) });
const canonicalMutationMap = Object.fromEntries(MUTATIONS.map(m => [m.id, m]));
const MUTATION_BY_ID = Object.freeze({ ...canonicalMutationMap, sweet: canonicalMutationMap.sweat, blizzard: canonicalMutationMap.frost, sacrifice: canonicalMutationMap.eclipsed });
(function(host) {
  function roll(weathers, random = Math.random) {
    const candidates = [...new Map(weathers.filter(w => w?.mutation).map(w => [w.mutation.id, w])).values()];
    // Shuffle before independent trials: when >2 succeed, no weather wins by list order.
    for (let i = candidates.length - 1; i > 0; i--) { const j = Math.min(i, Math.floor(random() * (i + 1))); [candidates[i], candidates[j]] = [candidates[j], candidates[i]]; }
    return candidates.filter(w => random() < MUTATION_SUCCESS_RATES[w.tier]).slice(0, 2).map(w => w.mutation).sort((a,b) => a.tier.rank-b.tier.rank);
  }
  function factors(mutations) { return (mutations || []).reduce((s, m) => { const def = MUTATION_BY_ID[typeof m === 'string' ? m : m?.id]; if (def) { s.hp *= def.hpMultiplier; s.atk *= def.atkMultiplier; } return s; }, { hp: 1, atk: 1 }); }
  Object.assign(host, { MUTATIONS, MUTATION_TIERS, MUTATION_BY_ID, MUTATION_SUCCESS_RATES, MutationSystem: Object.freeze({ roll, factors }) });
})(window);
