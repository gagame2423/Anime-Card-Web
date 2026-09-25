// ============================================================
// WEATHER + MUTATION DATABASE
// Add new WEATHER entries, MUTATIONS, or WEATHER_TIERS here.
// Cards can opt into a weather-only drop with requiredWeather.
// ============================================================

const WEATHER_CONFIG = Object.freeze({
  // Real-time clock: 1 real second = 1 in-game second.
  // The scheduler evaluates a new weather every N in-game minutes.
  WEATHER_CHECK_INTERVAL_SECONDS: 5 * 60,

  // Each active special weather lasts 10 in-game minutes.
  WEATHER_DURATION_SECONDS: 10 * 60,

  // Normal remains the default state. At a scheduler check, this is the
  // chance that a special weather spawns instead of Normal continuing.
  WEATHER_TRIGGER_CHANCE: 0.55,

  // Mutation balance: 6.5% base mutation chance per successful card roll.
  // A second mutation is only attempted after the first succeeds.
  BASE_MUTATION_CHANCE: 0.065,
  DUAL_MUTATION_CHANCE: 0.10,
  MAX_MUTATIONS_PER_ROLL: 2
});

// Weather rarity tiers control which weather family is selected after a
// successful weather trigger. Normal is the fallback state when none is active.
const WEATHER_TIERS = Object.freeze({
  common: Object.freeze({
    id: "common",
    name: "Common",
    chance: 0.65,
    weatherIds: ["raining", "snowing", "sunny"]
  }),
  uncommon: Object.freeze({
    id: "uncommon",
    name: "Uncommon",
    chance: 0.25,
    weatherIds: ["sugar", "reaper", "eclipse"]
  }),
  rare: Object.freeze({
    id: "rare",
    name: "Rare",
    chance: 0.10,
    weatherIds: ["malevolent", "tsukuyomi", "heavenly", "shadow"]
  })
});

// Mutation collection order. New mutations are appended before Multi so
// Multi-Mutations always remain the highest collection state.
const MUTATION_TIERS = Object.freeze({
  normal: Object.freeze({ id: "normal", name: "Normal", rank: 0 }),
  wet: Object.freeze({ id: "wet", name: "Wet", rank: 1 }),
  solar: Object.freeze({ id: "solar", name: "Solar", rank: 2 }),
  frost: Object.freeze({ id: "frost", name: "Frost", rank: 3 }),
  eclipsed: Object.freeze({ id: "eclipsed", name: "Eclipsed", rank: 4 }),
  sweat: Object.freeze({ id: "sweat", name: "Sweat", rank: 5 }),
  monarch: Object.freeze({ id: "monarch", name: "Monarch", rank: 6 }),
  angelic: Object.freeze({ id: "angelic", name: "Angelic", rank: 7 }),
  mangekyo: Object.freeze({ id: "mangekyo", name: "Mangekyo", rank: 8 }),
  hollow: Object.freeze({ id: "hollow", name: "Hollow", rank: 9 }),
  cursed: Object.freeze({ id: "cursed", name: "Cursed", rank: 10 }),
  multi: Object.freeze({ id: "multi", name: "Multi-Mutations", rank: 99 })
});

const MUTATIONS = [
  {
    id: "wet",
    name: "Wet",
    multiplier: 1.50,
    color: "#00bfff",
    className: "mutation-wet",
    tier: MUTATION_TIERS.wet,
    description: "Deep water-blue aura with drifting droplets."
  },
  {
    id: "solar",
    name: "Solar",
    multiplier: 1.60,
    color: "#ffd700",
    className: "mutation-solar",
    tier: MUTATION_TIERS.solar,
    description: "Golden sunburst energy with a radiant edge."
  },
  {
    id: "frost",
    name: "Frost",
    multiplier: 1.75,
    color: "#00ffff",
    className: "mutation-frost",
    tier: MUTATION_TIERS.frost,
    description: "Cyan frost glow with crystalline ice highlights."
  },
  {
    id: "eclipsed",
    name: "Eclipsed",
    multiplier: 2.00,
    color: "#ff0033",
    className: "mutation-eclipsed",
    description: "Dark crimson blood aura with a blackened pulse."
  },
  {
    id: "sweat",
    name: "Sweat",
    multiplier: 1.45,
    color: "#ff69b4",
    className: "mutation-sweat",
    description: "Vibrant pink sparkle and magenta shimmer."
  },
  {
    id: "monarch",
    name: "Monarch",
    multiplier: 2.40,
    color: "#8a2be2",
    secondaryColor: "#00008b",
    className: "mutation-monarch",
    tier: MUTATION_TIERS.monarch,
    description: "Royal purple energy descending into deep blue shadow."
  },
  {
    id: "angelic",
    name: "Angelic",
    multiplier: 2.60,
    color: "#ffd700",
    secondaryColor: "#ffffff",
    className: "mutation-angelic",
    tier: MUTATION_TIERS.angelic,
    description: "Radiant gold merging into pure celestial white."
  },
  {
    id: "mangekyo",
    name: "Mangekyo",
    multiplier: 2.80,
    color: "#ff0000",
    secondaryColor: "#4a0000",
    className: "mutation-mangekyo",
    tier: MUTATION_TIERS.mangekyo,
    description: "Crimson-red energy falling into an abyssal dark red."
  },
  {
    id: "hollow",
    name: "Hollow",
    multiplier: 3.00,
    color: "#ffffff",
    secondaryColor: "#c0c0c0",
    className: "mutation-hollow",
    tier: MUTATION_TIERS.hollow,
    description: "Pure white spectral light with metallic silver edges."
  },
  {
    id: "cursed",
    name: "Cursed",
    multiplier: 3.25,
    color: "#8b0000",
    secondaryColor: "#4b0082",
    className: "mutation-cursed",
    tier: MUTATION_TIERS.cursed,
    description: "Dark blood-red power sinking into deep cursed purple."
  }
];

const WEATHERS = [
  {
    id: "raining",
    name: "Raining",
    icon: "☔",
    color: "#00bfff",
    tier: "common",
    mutationId: "wet"
  },
  {
    id: "snowing",
    name: "Snowing",
    icon: "❄",
    color: "#00ffff",
    tier: "common",
    mutationId: "frost"
  },
  {
    id: "sunny",
    name: "Sunny",
    icon: "☀",
    color: "#ffd700",
    tier: "common",
    mutationId: "solar"
  },
  {
    id: "sugar",
    name: "Sugar",
    icon: "🍬",
    color: "#ff69b4",
    tier: "uncommon",
    mutationId: "sweat"
  },
  {
    id: "reaper",
    name: "Reaper",
    icon: "☠",
    color: "#c0c0c0",
    tier: "uncommon",
    mutationId: "hollow"
  },
  {
    id: "eclipse",
    name: "Eclipse",
    icon: "🌑",
    color: "#ff0033",
    tier: "uncommon",
    mutationId: "eclipsed"
  },
  {
    id: "malevolent",
    name: "Malevolent",
    icon: "🩸",
    color: "#8b0000",
    tier: "rare",
    mutationId: "cursed"
  },
  {
    id: "tsukuyomi",
    name: "Tsukuyomi",
    icon: "🌘",
    color: "#ff0000",
    tier: "rare",
    mutationId: "mangekyo"
  },
  {
    id: "heavenly",
    name: "Heavenly",
    icon: "✨",
    color: "#ffffff",
    tier: "rare",
    mutationId: "angelic"
  },
  {
    id: "shadow",
    name: "Shadow",
    icon: "♟",
    color: "#8a2be2",
    tier: "rare",
    mutationId: "monarch"
  }
];

const canonicalMutationMap = Object.fromEntries(
  MUTATIONS.map(mutation => [mutation.id, Object.freeze(mutation)])
);

// Legacy aliases keep previously saved Blizzard/Sacrifice variants readable.
const MUTATION_BY_ID = Object.freeze({
  ...canonicalMutationMap,
  blizzard: canonicalMutationMap.frost,
  sacrifice: canonicalMutationMap.eclipsed
});

const WEATHER_BY_ID = Object.freeze(
  Object.fromEntries(
    WEATHERS.map(weather => [
      weather.id,
      Object.freeze({
        ...weather,
        mutation: MUTATION_BY_ID[weather.mutationId]
      })
    ])
  )
);

if (typeof window !== "undefined") {
  window.WEATHERS = WEATHERS;
  window.WEATHER_CONFIG = WEATHER_CONFIG;
  window.WEATHER_TIERS = WEATHER_TIERS;
  window.WEATHER_BY_ID = WEATHER_BY_ID;
  window.MUTATIONS = MUTATIONS;
  window.MUTATION_BY_ID = MUTATION_BY_ID;
  window.MUTATION_TIERS = MUTATION_TIERS;
}
