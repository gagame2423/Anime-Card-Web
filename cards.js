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
      description: "Every attack gain 10% attack boost ( stack to 100% )."
    },
    image: "assets/cards/narutokid.png"
  },
  {
    id: "deku-mc",
    name: "Powerless Guy",
    rarity: "Common",
    chance: 5,
    requiredWeather: null,
    stats: { hp: 500, atk: 10 },
    passive: {
      name: "What can i get you sir",
      description: "Every attack has 20% chance to heal 20% HP."
    },
    image: "assets/cards/dekumcdonald.png"
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
      description: "Has 5% chance to evade the next incoming hit."
    },
    image: "assets/cards/ichigobase.png"
  },
  {
    id: "gon-kid",
    name: "Gon Kid",
    rarity: "Rare",
    chance: 25,
    requiredWeather: null,
    stats: { hp: 500, atk: 50 },
    passive: {
      name: "Rock",
      description: "First attack has 33% to strike double damage."
    },
    image: "assets/cards/gonkid.png"
  },
  {
    id: "tanjiro",
    name: "tanjiro",
    rarity: "Rare",
    chance: 40,
    requiredWeather: null,
    stats: { hp: 400, atk: 100 },
    passive: {
      name: "Rock",
      description: "At the start of the match , gain 25% hp bonus"
    },
    image: "assets/cards/tanjiro.png"
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
    id: "kaneki-ghoul",
    name: "Kaneki",
    rarity: "Epic",
    chance: 80,
    requiredWeather: null,
    stats: { hp: 600, atk: 100 },
    passive: {
      name: "Starfall",
      description: "Every third attack suck enemy blood and selfheal equal to 25% enemy current hp"
    },
    image: "assets/cards/kaneki.png"
  },
  {
    id: "the-trapper",
    name: "The Trapper",
    rarity: "Epic",
    chance: 100,
    requiredWeather: null,
    stats: { hp: 500, atk: 100 },
    passive: {
      name: "Trap",
      description: "When the match start have 50% chance to strike x10 attack damage."
    },
    image: "assets/cards/thetrapper.png"
  },
  {
    id: "jotaro-kujo",
    name: "Jotaro Kujo",
    rarity: "Epic",
    chance: 500,
    requiredWeather: null,
    stats: { hp: 750, atk: 300 },
    passive: {
      name: "Ora Ora",
      description: "Every attack has 50% chance to follow up a next attack , and 25% chance to follow up the follow up , the follow up attack have 40% attack damage."
    },
    image: "assets/cards/jotarokujo.png"
  },
  {
    id: "starter-legendary",
    name: "Son Goku",
    rarity: "Legendary",
    chance: 1000,
    requiredWeather: null,
    stats: { hp: 1250, atk: 400 },
    passive: {
      name: "Kamehameha",
      description: "Every fifth attack , do 10% attack damage to enemy constantly for 10 times."
    },
    image: "assets/cards/songoku.png"
  },
  {
    id: "starter-secret",
    name: "The Truth",
    rarity: "Secret",
    chance: 100000,
    requiredWeather: null,
    stats: { hp: 10000, atk: 2000 },
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
    stats: { hp: 2770, atk: 690 },
    passive: {
      name: "SUNNY",
      description: "If weather is sunny double the attack damage stats."
    },
    image: "assets/cards/escanor.png"
  },
  {
    id: "weather-eclipse-harvester",
    name: "Griffith",
    rarity: "Mythic",
    chance: 8000,
    requiredWeather: "Eclipse",
    stats: { hp: 9999, atk: 666 },
    passive: {
      name: "Blood Moon",
      description: "The darker the battlefield, the more dangerous the next critical hit becomes."
    },
    image: "assets/cards/griffith.png"
  },
  {
    id: "ice-admiral",
    name: "Ice Admiral",
    rarity: "Mythic",
    chance: 5000,
    requiredWeather: "Snowing",
    stats: { hp: 3000, atk: 1000 },
    passive: {
      name: "Ice Age",
      description: "Has 33% chance to freeze an enemy after landing a critical hit."
    },
    image: "assets/cards/iceadmiral.png"
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
      description: "Has 67% chance to freeze an enemy after landing a critical hit."
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
    id: "cid-shadow",
    name: "Cid Atomic",
    rarity: "Mythic",
    chance: 30000,
    requiredWeather: "Shadow",
    stats: { hp: 6400, atk: 3200 },
    passive: {
      name: "I AM ATMOIC !!!",
      description: "Every 10th attack strike x100 damage attack to all enemy"
    },
    image: "assets/cards/cidatomic.png"
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
