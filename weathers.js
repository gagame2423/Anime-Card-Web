/* Weather scheduling and benefits. Mutation data lives in mutations.js. */
const WEATHER_CONFIG = Object.freeze({ WEATHER_CHECK_INTERVAL_SECONDS: 300, WEATHER_DURATION_SECONDS: 600, WEATHER_TRIGGER_CHANCE: .55, MAX_MUTATIONS_PER_ROLL: 2 });
const WEATHER_TIERS = Object.freeze({"common": {"id": "common", "name": "Common", "chance": 0.65, "weatherIds": ["raining", "snowing", "sunny", "lucky"]}, "uncommon": {"id": "uncommon", "name": "Uncommon", "chance": 0.25, "weatherIds": ["sugar", "reaper", "eclipse", "wind"]}, "rare": {"id": "rare", "name": "Rare", "chance": 0.1, "weatherIds": ["malevolent", "tsukuyomi", "heavenly", "shadow", "bizare"]}});
const WEATHERS = [
  {
    "id": "raining",
    "name": "Raining",
    "icon": "☔",
    "tier": "common",
    "mutationId": "wet",
    "color": "#00bfff",
    "buffs": {
      "rollSpeed": 0.05
    }
  },
  {
    "id": "snowing",
    "name": "Snowing",
    "icon": "❄",
    "tier": "common",
    "mutationId": "frost",
    "color": "#00ffff",
    "buffs": {
      "exp": 0.1
    }
  },
  {
    "id": "sunny",
    "name": "Sunny",
    "icon": "☀",
    "tier": "common",
    "mutationId": "solar",
    "color": "#ffd700",
    "buffs": {
      "coins": 0.1
    }
  },
  {
    "id": "lucky",
    "name": "Lucky",
    "icon": "🍀",
    "tier": "common",
    "mutationId": "clove",
    "color": "#39ff14",
    "buffs": {
      "luck": 0.5
    }
  },
  {
    "id": "sugar",
    "name": "Sugar",
    "icon": "🍬",
    "tier": "uncommon",
    "mutationId": "sweat",
    "color": "#ff69b4",
    "buffs": {
      "rollSpeed": 0.1
    }
  },
  {
    "id": "reaper",
    "name": "Reaper",
    "icon": "☠",
    "tier": "uncommon",
    "mutationId": "hollow",
    "color": "#ffffff",
    "buffs": {
      "battleCoins": 0.25
    }
  },
  {
    "id": "eclipse",
    "name": "Eclipse",
    "icon": "🌑",
    "tier": "uncommon",
    "mutationId": "eclipsed",
    "color": "#ff0033",
    "buffs": {
      "battleCoins": 0.33,
      "enemyMutationChance": 0.2
    }
  },
  {
    "id": "wind",
    "name": "Wind",
    "icon": "🌪",
    "tier": "uncommon",
    "mutationId": "storm",
    "color": "#ffffff",
    "buffs": {
      "rollSpeed": 0.13
    }
  },
  {
    "id": "malevolent",
    "name": "Malevolent",
    "icon": "🩸",
    "tier": "rare",
    "mutationId": "cursed",
    "color": "#8b0000",
    "buffs": {
      "battleCoins": 0.5
    }
  },
  {
    "id": "tsukuyomi",
    "name": "Tsukuyomi",
    "icon": "🌘",
    "tier": "rare",
    "mutationId": "mangekyo",
    "color": "#ff0000",
    "buffs": {
      "rollSpeed": 0.2
    }
  },
  {
    "id": "heavenly",
    "name": "Heavenly",
    "icon": "✨",
    "tier": "rare",
    "mutationId": "angelic",
    "color": "#ffd700",
    "buffs": {
      "coins": 0.3
    }
  },
  {
    "id": "shadow",
    "name": "Shadow",
    "icon": "♟",
    "tier": "rare",
    "mutationId": "monarch",
    "color": "#8a2be2",
    "buffs": {
      "exp": 0.5
    }
  },
  {
    "id": "bizare",
    "name": "Bizare",
    "icon": "🌟",
    "tier": "rare",
    "mutationId": "stardust",
    "color": "#ff38cf",
    "buffs": {
      "battleCoins": 0.66
    }
  }
].map(w => Object.freeze({ ...w, buffs: Object.freeze(w.buffs) }));
const WEATHER_BY_ID = Object.freeze(Object.fromEntries(WEATHERS.map(w => [w.id, Object.freeze({ ...w, mutation: MUTATION_BY_ID[w.mutationId] })])));
(function(host) {
  function bonus(active, stat) { return active.reduce((sum,w) => sum + (Number(w.buffs?.[stat]) || 0), 0); }
  Object.assign(host, { WEATHERS, WEATHER_CONFIG, WEATHER_TIERS, WEATHER_BY_ID, WeatherSystem: Object.freeze({ bonus, describe: weather => {
    const labels = {rollSpeed:'Roll Speed',exp:'EXP',coins:'VNĐ',battleCoins:'battle VNĐ',luck:'Luck',enemyMutationChance:'enemy mutation chance'};
    return Object.entries(weather.buffs || {}).map(([stat,value]) => stat === 'luck' ? `+${value} Luck` : `+${Math.round(value*100)}% ${labels[stat] || stat}`).join(' • ');
  } }) });
})(window);
