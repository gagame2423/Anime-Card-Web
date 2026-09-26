// ============================================================
// CARD DATABASE
// Add/edit cards here.
//
// requiredWeather:
//   null            -> available regardless of special weather.
//   "Sunny"        -> only enters the RNG pool while Sunny is active.
//
// WEATHER-EXCLUSIVE EXAMPLES are included for all new weather types.
// ============================================================

const CARDS = [
  {
    id: "starter-common",
    name: "Naruto Kid",
    rarity: "Common",
    chance: 2,
    requiredWeather: null,
    stats: { hp: 100, atk: 25 },
    passive: {
      name: "First Strike",
      description: "The first attack after each roll gains a small damage boost."
    },
    image: "assets/cards/narutokid.png"
  },
  {
    id: "starter-rare",
    name: "Ichigo Young",
    rarity: "Rare",
    chance: 10,
    requiredWeather: null,
    stats: { hp: 240, atk: 75 },
    passive: {
      name: "Afterimage",
      description: "Has a chance to evade the next incoming hit."
    },
    image: "assets/cards/ichigobase.png"
  },
  {
    id: "starter-epic",
    name: "Luffy Kid",
    rarity: "Epic",
    chance: 50,
    requiredWeather: null,
    stats: { hp: 420, atk: 150 },
    passive: {
      name: "Starfall",
      description: "Every third attack calls down an extra astral strike."
    },
    image: "assets/cards/luffykid.png"
  },
  {
    id: "starter-legendary",
    name: "Son Goku",
    rarity: "Legendary",
    chance: 1000,
    requiredWeather: null,
    stats: { hp: 1250, atk: 620 },
    passive: {
      name: "Royal Pressure",
      description: "Deals bonus damage to enemies with more HP than this card."
    },
    image: "assets/cards/songoku.png"
  },
  {
    id: "starter-secret",
    name: "The Truth",
    rarity: "Secret",
    chance: 100000,
    requiredWeather: null,
    stats: { hp: 5000, atk: 2500 },
    passive: {
      name: "Genesis Break",
      description: "A cosmic passive that massively amplifies the next critical hit."
    },
    image: "assets/cards/thetruth.png"
  },

  // Existing weather-exclusive cards.
  {
    id: "weather-solar-deity",
    name: "Escanor",
    rarity: "Legendary",
    chance: 2500,
    requiredWeather: "Sunny",
    stats: { hp: 2200, atk: 980 },
    passive: {
      name: "Daybreak",
      description: "Amplifies the next attack after every successful roll during Sunny weather."
    },
    image: "assets/cards/escanor.png"
  },
  {
    id: "weather-eclipse-harvester",
    name: "Griffith",
    rarity: "Mythic",
    chance: 8000,
    requiredWeather: "Eclipse",
    stats: { hp: 3800, atk: 1750 },
    passive: {
      name: "Blood Moon",
      description: "The darker the battlefield, the more dangerous the next critical hit becomes."
    },
    image: "assets/cards/griffith.png"
  },
  {
    id: "weather-frost-sovereign",
    name: "Esdeath",
    rarity: "Mythic",
    chance: 12000,
    requiredWeather: "Snowing",
    stats: { hp: 4600, atk: 2050 },
    passive: {
      name: "Absolute Zero",
      description: "Has a chance to freeze an enemy after landing a critical hit."
    },
    image: "assets/cards/esdeath.png"
  },

  // New weather-exclusive cards. Add more entries below using the same schema.
  {
    id: "weather-shadow-monarch",
    name: "Igris",
    rarity: "Mythic",
    chance: 18000,
    requiredWeather: "Shadow",
    stats: { hp: 6400, atk: 3200 },
    passive: {
      name: "Arise",
      description: "Each successful roll leaves a lingering shadow behind the card."
    },
    image: "assets/cards/igris.png"
  },
  {
    id: "weather-heavenly-seraph",
    name: "The First Human",
    rarity: "Secret",
    chance: 30000,
    requiredWeather: "Heavenly",
    stats: { hp: 8200, atk: 4100 },
    passive: {
      name: "Ascension",
      description: "Radiant energy converts every perfect roll into bonus power."
    },
    image: "assets/cards/adamror.png"
  },
  {
    id: "weather-tsukuyomi-eye",
    name: "Uchiha Shisui",
    rarity: "Secret",
    chance: 35000,
    requiredWeather: "Tsukuyomi",
    stats: { hp: 8800, atk: 4700 },
    passive: {
      name: "Lunar Genjutsu",
      description: "A moonlit illusion magnifies the next critical strike."
    },
    image: "assets/cards/shisui.png"
  },
  {
    id: "weather-reaper-hollow",
    name: "Vasto Lord",
    rarity: "Mythic",
    chance: 22000,
    requiredWeather: "Reaper",
    stats: { hp: 7000, atk: 3500 },
    passive: {
      name: "Last Breath",
      description: "Finishes an enemy with a spectral silver edge after critical damage."
    },
    image: "assets/cards/vastolord.png"
  },
  {
    id: "weather-malevolent-king",
    name: "Malevolent King",
    rarity: "Secret",
    chance: 45000,
    requiredWeather: "Malevolent",
    stats: { hp: 11000, atk: 6000 },
    passive: {
      name: "Dread Domain",
      description: "Cursed energy increases pressure against high-rarity opponents."
    },
    image: "assets/cards/sukuna.png"
  }
];

if (typeof window !== "undefined") {
  window.CARDS = CARDS;
}
