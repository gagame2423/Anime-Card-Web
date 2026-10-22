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
    element: "Nature",
    name: "Naruto Kid", category: ["Protagonist", "Hero", "Ninja", "Human"],
    rarity: "Common",
    chance: 2,
    requiredWeather: null,
    stats: { hp: 100, atk: 25 },
    passive: {
      name: "First Strike",
      description: "Each attack grants +10% ATK, up to +100%."
    },
    image: "assets/cards/narutokid.png"
  },
  {
    id: "normal-demon",
    element: "Dark",
    name: "Normal Demon", category: ["Villian", "Unhuman", "Brutal"],
    rarity: "Common",
    chance: 3,
    requiredWeather: null,
    stats: { hp: 300, atk: 10 },
    passive: {
      name: "Lifesteal",
      description: "Each kill grants +10% max HP."
    },
    image: "assets/cards/normaldemon.png"
  },
  {
    id: "sasuke-kid",
    element: "Electric",
    name: "Sasuke Kid", category: ["AntiHero", "Ninja", "Human"],
    rarity: "Common",
    chance: 4,
    requiredWeather: null,
    stats: { hp: 275, atk: 12 },
    passive: {
      name: "Chidori",
      description: "The 3rd attack deals x2.5 ATK damage."
    },
    image: "assets/cards/sasukekid.png"
  },
  {
    id: "deku-mc",
    element: "Nature",
    name: "Powerless Guy", category: ["Human", "Alternative", "Supporter"],
    rarity: "Common",
    chance: 5,
    requiredWeather: null,
    stats: { hp: 500, atk: 10 },
    passive: {
      name: "What can i get you sir",
      description: "Each attack has a 20% chance to heal 20% max HP."
    },
    image: "assets/cards/dekumcdonald.png"
  },
  {
    id: "starter-rare",
    element: "Holy",
    name: "Ichigo Young", category: ["Protagonist", "Hero", "Human", "Swordman", "Reaper"],
    rarity: "Rare",
    chance: 10,
    requiredWeather: null,
    stats: { hp: 240, atk: 75 },
    passive: {
      name: "Afterimage",
      description: "5% chance to dodge incoming attacks."
    },
    image: "assets/cards/ichigobase.png"
  },
  {
    id: "gon-kid",
    element: "Nature",
    name: "Gon Kid", category: ["Protagonist", "Hero", "Human", "Hunter"],
    rarity: "Rare",
    chance: 25,
    requiredWeather: null,
    stats: { hp: 500, atk: 50 },
    passive: {
      name: "Rock",
      description: "First attack: 33% chance to deal x2 damage."
    },
    image: "assets/cards/gonkid.png"
  },
  {
    id: "tanjiro",
    element: "Water",
    name: "Tanjiro", category: ["Protagonist", "Hero", "Human", "DemonSlayer", "Swordman"],
    rarity: "Rare",
    chance: 40,
    requiredWeather: null,
    stats: { hp: 400, atk: 100 },
    passive: {
      name: "Rock",
      description: "Battle start: gain +25% max HP."
    },
    image: "assets/cards/tanjiro.png"
  },
  {
    id: "starter-epic",
    element: "Nature",
    name: "Luffy Kid", category: ["Protagonist", "Hero", "Pirate", "Human", "Captain"],
    rarity: "Epic",
    chance: 50,
    requiredWeather: null,
    stats: { hp: 420, atk: 150 },
    passive: {
      name: "GOMU NO MU NO PISTOL",
      description: "Every 2nd attack deals +50% ATK damage."
    },
    image: "assets/cards/luffykid.png"
  },
  {
    id: "six-seven",
    element: "Dark",
    name: "Six Seven", category: ["Alternative", "Supporter"],
    rarity: "Epic",
    chance: 67,
    requiredWeather: null,
    stats: { hp: 676, atk: 67 },
    passive: {
      name: "SIX SEVEN",
      description: "On first entry, Stun the active enemy for 3 turns."
    },
    image: "assets/cards/sixseven.png"
  },
  {
    id: "kaneki-ghoul",
    element: "Fire",
    name: "Kaneki", category: ["Protagonist", "AntiHero", "Unhuman", "Brutal"],
    rarity: "Epic",
    chance: 80,
    requiredWeather: null,
    stats: { hp: 600, atk: 100 },
    passive: {
      name: "GHOUL",
      description: "Every 3rd attack heals HP equal to 25% of the target’s current HP."
    },
    image: "assets/cards/kaneki.png"
  },
  {
    id: "the-trapper",
    element: "Dark",
    name: "The Trapper", category: ["Villian", "VideoGame", "Brutal", "Hunter"],
    rarity: "Epic",
    chance: 100,
    requiredWeather: null,
    stats: { hp: 500, atk: 100 },
    passive: {
      name: "Trap",
      description: "On entry: 50% chance to strike the active enemy for x5 ATK damage."
    },
    image: "assets/cards/thetrapper.png"
  },
  {
    id: "nezuko",
    element: "Fire",
    name: "Nezuko", category: ["Unhuman", "Supporter", "DemonSlayer"],
    rarity: "Epic",
    chance: 190,
    requiredWeather: null,
    stats: { hp: 600, atk: 150 },
    passive: {
      name: "Bleed",
      description: "Attacks apply Bleed for 2 turns (5% ATK/turn)."
    },
    image: "assets/cards/nezuko.png"
  },
  {
    id: "buggy",
    element: "Water",
    name: "Buggy", category: ["Pirate", "Human", "AntiVillian", "Supporter"],
    rarity: "Epic",
    chance: 234,
    requiredWeather: null,
    stats: { hp: 600, atk: 110 },
    passive: {
      name: "Chop Chop",
      description: "33% chance to dodge incoming attacks. Dodges do not counterattack."
    },
    image: "assets/cards/buggy.png"
  },
  {
    id: "bounty-hunter",
    element: "Nature",
    name: "Bounty Hunter", category: ["Hunter", "Human", "Alternative", "Brutal"],
    rarity: "Epic",
    chance: 300,
    requiredWeather: null,
    stats: { hp: 500, atk: 100 },
    passive: {
      name: "BOUNTY",
      description: "Each kill adds VNĐ equal to the defeated enemy’s recorded HP value to the victory reward."
    },
    image: "assets/cards/bountyhunter.png"
  },
  {
    id: "jotaro-kujo",
    element: "Nature",
    name: "Jotaro Kujo", category: ["JoJo", "Protagonist", "Hero", "Human"],
    rarity: "Epic",
    chance: 500,
    requiredWeather: null,
    stats: { hp: 750, atk: 300 },
    passive: {
      name: "Ora Ora",
      description: "Each attack: 50% chance for a follow-up dealing 40% ATK damage; that follow-up has a 25% chance for another."
    },
    image: "assets/cards/jotarokujo.png"
  },
  {
    id: "hakari",
    element: "Nature",
    name: "Hakari", category: ["Jujutsu", "Protagonist", "Human", "Brutal"],
    rarity: "Epic",
    chance: 777,
    requiredWeather: null,
    stats: { hp: 777, atk: 377 },
    passive: {
      name: "Lucky Train",
      description: "On the 7th attack: 7% chance to deal x77 ATK damage."
    },
    image: "assets/cards/hakari.png"
  },
  {
    id: "saber",
    element: "Water",
    name: "Saber", category: ["Fate", "Hero", "Protagonist", "Swordman"],
    rarity: "Epic",
    chance: 800,
    requiredWeather: null,
    stats: { hp: 800, atk: 400 },
    passive: {
      name: "EXCALIBUR!!!",
      description: "The 8th attack deals x8 damage."
    },
    image: "assets/cards/saber.png"
  },
  {
    id: "jonathan-joestar",
    element: "Electric",
    name: "Jonathan Joestar", category: ["JoJo", "Protagonist", "Hero", "Human"],
    rarity: "Epic",
    chance: 900,
    requiredWeather: null,
    stats: { hp: 1000, atk: 350 },
    passive: {
      name: "HAMONNN",
      description: "On the 9th attack, gain +900% ATK for the rest of the match."
    },
    image: "assets/cards/jonathanjoestar.png"
  },
  {
    id: "starter-legendary",
    element: "Electric",
    name: "Son Goku", category: ["DragonWarrior", "Protagonist", "Hero", "Unhuman"],
    rarity: "Legendary",
    chance: 1000,
    requiredWeather: null,
    stats: { hp: 1250, atk: 400 },
    passive: {
      name: "Kamehameha",
      description: "Every 5th attack strikes 10 times for 10% ATK damage per hit."
    },
    image: "assets/cards/songoku.png"
  },
  {
    id: "vegeta",
    element: "Water",
    name: "Vegeta", category: ["DragonWarrior", "AntiHero", "Unhuman", "Brutal", "PlanetDestroyer"],
    rarity: "Legendary",
    chance: 1001,
    requiredWeather: null,
    stats: { hp: 1000, atk: 440 },
    passive: {
      name: "Super Vegeta",
      description: "Below 25% max HP, deal +100% ATK damage."
    },
    image: "assets/cards/vegeta.png"
  },
  {
    id: "kakashi",
    element: "Electric",
    name: "Kakashi", category: ["Ninja", "Human", "Hero", "Captain"],
    rarity: "Legendary",
    chance: 4900,
    requiredWeather: null,
    stats: { hp: 2000, atk: 505 },
    passive: {
      name: "Kamui",
      description: "22% chance to dodge incoming attacks. Dodges do not counterattack."
    },
    image: "assets/cards/kakashi.png"
  },
  {
    id: "kr-kuuga",
    element: "Nature",
    name: "Kamen Rider Kuuga", category: ["Hero", "Protagonist", "Unhuman"],
    rarity: "Legendary",
    chance: 20000,
    requiredWeather: null,
    stats: { hp: 12500, atk: 2500 },
    passive: {
      name: "KUUGA",
      description: "Every 3rd attack changes form.\nBlue: +20% crit chance. Green: +50% crit damage. Purple: +30% max HP."
    },
    image: "assets/cards/krkuuga.png"
  },
  {
    id: "bulma",
    element: "Nature",
    name: "Bulma", category: ["Supporter", "Human", "Alternative"],
    rarity: "Legendary",
    chance: 3080,
    requiredWeather: null,
    stats: { hp: 3080, atk: 100 },
    passive: {
      name: "WISH",
      description: "Each allied turn while not attacking: 10% chance to grant the active attacker +30% damage for that attack."
    },
    image: "assets/cards/bulma.png"
  },
  {
    id: "denji",
    element: "Fire",
    name: "Denji", category: ["Protagonist", "AntiHero", "Unhuman", "Brutal"],
    rarity: "Legendary",
    chance: 3333,
    requiredWeather: null,
    stats: { hp: 3333, atk: 333 },
    passive: {
      name: "POCHITA",
      description: "Each attack has a 33% chance for a follow-up. Follow-ups can trigger another follow-up."
    },
    image: "assets/cards/denji.png"
  },
  {
    id: "uchiha-itachi",
    element: "Fire",
    name: "Uchiha Itachi", category: ["Ninja", "Human", "AntiHero", "Brutal"],
    rarity: "Legendary",
    chance: 5500,
    requiredWeather: null,
    stats: { hp: 2550, atk: 450 },
    passive: {
      name: "Amaterasu",
      description: "Each attack: 30% chance to apply Burn for 3 turns (5% ATK/turn) and immediately follow up."
    },
    image: "assets/cards/uchihaitachi.png"
  },
  {
    id: "madness-doctor",
    element: "Electric",
    name: "Madness Doctor", category: ["Villian", "Brutal", "Alternative"],
    rarity: "Legendary",
    chance: 10101,
    requiredWeather: null,
    stats: { hp: 10101, atk: 101 },
    passive: {
      name: "Madness",
      description: "Every 2nd attack: 40% chance to reduce the target’s ATK by 5%."
    },
    image: "assets/cards/madnessdoctor.png"
  },
  {
    id: "erza",
    element: "Holy",
    name: "Erza", category: ["Swordman", "Magician", "Hero", "Human"],
    rarity: "Legendary",
    chance: 12120,
    requiredWeather: null,
    stats: { hp: 2550, atk: 450 },
    passive: {
      name: "MAGIC ARMOR",
      description: "Below 50% max HP, become immune to enemy passive effects."
    },
    image: "assets/cards/erza.png"
  },
  {
    id: "yuji-itadori",
    element: "Fire",
    name: "Yuji Itadori", category: ["Jujutsu", "Protagonist", "Hero", "Human", "Brutal"],
    rarity: "Legendary",
    chance: 17000,
    requiredWeather: null,
    stats: { hp: 4000, atk: 600 },
    passive: {
      name: "BLACK FLASH",
      description: "Each attack has a 33% chance to deal x3 ATK damage."
    },
    image: "assets/cards/yujiitadori.png"
  },
  {
    id: "guts",
    element: "Dark",
    name: "Guts", category: ["Berserk", "Protagonist", "AntiHero", "Swordman", "Human", "Brutal"],
    rarity: "Secret",
    chance: 18888,
    requiredWeather: null,
    stats: { hp: 8000, atk: 800 },
    passive: {
      name: "OUTRAGE",
      description: "33% chance to enter Berserker mode. In Berserker mode, attacks apply Bleed for 2 turns (10% ATK/turn)."
    },
    image: "assets/cards/guts.png"
  },
  {
    id: "polnareff",
    element: "Nature",
    name: "Polnareff", category: ["JoJo", "Supporter", "Human", "Swordman"],
    rarity: "Secret",
    chance: 36000,
    requiredWeather: null,
    stats: { hp: 10000, atk: 1000 },
    passive: {
      name: "SILVER CHARIOT",
      description: "Below 25% max HP, deal +100% ATK damage."
    },
    image: "assets/cards/polnareff.png"
  },
  {
    id: "the-flash",
    element: "Electric",
    name: "The Flash", category: ["Hero", "Human", "Protagonist", "Alternative"],
    rarity: "Secret",
    chance: 52000,
    requiredWeather: null,
    stats: { hp: 5200, atk: 2500 },
    passive: {
      name: "FLASH",
      description: "60% dodge chance. After more than 3 consecutive successful dodges, die from a heart attack."
    },
    image: "assets/cards/theflash.png"
  },
  {
    id: "rimuru",
    element: "Water",
    name: "Rimuru", category: ["Protagonist", "Unhuman", "Magician", "Supporter"],
    rarity: "Secret",
    chance: 81208,
    requiredWeather: null,
    stats: { hp: 8120, atk: 2008 },
    passive: {
      name: "SLIME",
      description: "Each kill grants 1 Slime Point, +30% ATK and +20% max HP. A fatal hit consumes 1 Slime Point to survive."
    },
    image: "assets/cards/rimuru.png"
  },
  {
    id: "starter-secret",
    element: "Holy",
    name: "The Truth", category: ["Unhuman", "Alternative", "Magician"],
    rarity: "Secret",
    chance: 100000,
    requiredWeather: null,
    stats: { hp: 10000, atk: 2000 },
    passive: {
      name: "Omniscience",
      description: "Immune to enemy passive effects."
    },
    image: "assets/cards/thetruth.png"
  },
  {
    id: "viltrumite",
    element: "Holy",
    name: "Viltrumite", category: ["Unhuman", "Villian", "Brutal", "PlanetDestroyer"],
    rarity: "Secret",
    chance: 222000,
    requiredWeather: null,
    stats: { hp: 20000, atk: 2222 },
    passive: {
      name: "PUNCH",
      description: "Every 3rd attack: 33% chance to deal +222% ATK damage."
    },
    image: "assets/cards/viltrumite.png"
  },
{
    id: "mahito",
    element: "Dark",
    name: "Mahito", category: ["Jujutsu", "Villian", "Unhuman", "Brutal", "PureEvil"],
    rarity: "Epic",
    chance: 7927,
    requiredWeather: "Eclipsed",
    stats: { hp: 1927, atk: 792 },
    passive: {
      name: "Idle Transfiguration",
      description: "Killing an enemy below 10% max HP grants 1 Soul. Spend Souls to clear debuffs, 1 per Soul."
    },
    image: "assets/cards/mahito.png"
  },
  {
    id: "blackbeard",
    element: "Dark",
    name: "BlackBeard", category: ["Pirate", "Villian", "Human", "Brutal", "Captain"],
    rarity: "Legendary",
    chance: 40000,
    requiredWeather: "Shadow",
    stats: { hp: 8000, atk: 800 },
    passive: {
      name: "Liberation",
      description: "Each kill grants ATK equal to 25% of the defeated enemy’s ATK."
    },
    image: "assets/cards/blackbeard.png"
  },
  {
    id: "garp",
    element: "Nature",
    name: "Garp", category: ["Human", "Captain", "Hero", "Brutal"],
    rarity: "Legendary",
    chance: 38922,
    requiredWeather: null,
    stats: { hp: 10000, atk: 1500 },
    passive: {
      name: "Fist of Love",
      description: "The 3rd attack Stuns for 2 turns. If an enemy dies before that attack, deal x2 damage to the next enemy once per match."
    },
    image: "assets/cards/garp.png"
  },
  {
    id: "erwin",
    element: "Fire",
    name: "Erwin", category: ["Captain", "Human", "Army", "Hero"],
    rarity: "Legendary",
    chance: 77550,
    requiredWeather: null,
    stats: { hp: 17555, atk: 75 },
    passive: {
      name: "CAPTAIN",
      description: "Starting in the first slot grants all teammates +100% ATK for the match."
    },
    image: "assets/cards/erwin.png"
  },
  {
    id: "boa-hancock",
    element: "Fire",
    name: "Boa Hancock", category: ["Pirate", "Human", "AntiVillian", "Captain"],
    rarity: "Legendary",
    chance: 69000,
    requiredWeather: "Sugar",
    stats: { hp: 6969, atk: 1069 },
    passive: {
      name: "Mero Mero",
      description: "Every 2nd attack: 69% chance to Freeze for 1 turn. Deal x1.5 damage to frozen targets."
    },
    image: "assets/cards/boahancock.png"
  },
  {
    id: "senku",
    element: "Nature",
    name: "Senku", category: ["Human", "Supporter", "Alternative"],
    rarity: "Rare",
    chance: 550,
    requiredWeather: null,
    stats: { hp: 1550, atk: 55 },
    passive: {
      name: "Chemistry",
      description: "At the start of allied turns while not attacking, heal the living team for 2.5% max HP. Bleed blocks healing."
    },
    image: "assets/cards/senku.png"
  },
  {
    id: "grimmjaw",
    element: "Water",
    name: "Grimmjaw", category: ["Unhuman", "AntiVillian", "Brutal", "Reaper"],
    rarity: "Legendary",
    chance: 65000,
    requiredWeather: "Reaper",
    stats: { hp: 6500, atk: 1065 },
    passive: {
      name: "Gran Rey Cero",
      description: "The 5th attack hits all enemies for x2 ATK damage."
    },
    image: "assets/cards/grimmjaw.png"
  },
  {
    id: "reigen",
    element: "Water",
    name: "Reigen", category: ["Human", "Supporter", "Alternative"],
    rarity: "Mythic",
    chance: 500000,
    requiredWeather: null,
    stats: { hp: 100000, atk: 1000 },
    passive: {
      name: "Scam",
      description: "On entry: copy a random living teammate’s passive. If alone, gain +200% ATK and +100% max HP; disable the passive.\nBasic attacks still work while the passive is disabled."
    },
    image: "assets/cards/reigen.png"
  },
  {
    id: "kamen-rider-kabuto",
    element: "Holy",
    name: "Kamen Rider Kabuto", category: ["Hero", "Protagonist", "Human"],
    rarity: "Mythic",
    chance: 370000,
    requiredWeather: null,
    stats: { hp: 5000, atk: 3700 },
    passive: {
      name: "CLOCK UP",
      description: "Each attack: 10% chance for a follow-up that Stuns for 1 turn. Follow-ups can chain. Attacking a Stunned target heals 5% max HP."
    },
    image: "assets/cards/krkabuto.png"
  },
  {
    id: "meruem",
    element: "Nature",
    name: "Meruem", category: ["Villian", "Unhuman", "Brutal", "AntiVillian"],
    rarity: "Mythic",
    chance: 740000,
    requiredWeather: null,
    stats: { hp: 74000, atk: 5000 },
    passive: {
      name: "Aura Synthesis",
      description: "When hit, gain 1 Aura stack (max 5); each grants +10% crit damage. First reaching 5 stacks heals 5% max HP."
    },
    image: "assets/cards/meruem.png"
  },
  {
    id: "frieza",
    element: "Electric",
    name: "Frieza", category: ["Villian", "Unhuman", "Brutal", "PureEvil", "PlanetDestroyer", "Army"],
    rarity: "Legendary",
    chance: 76900,
    requiredWeather: null,
    stats: { hp: 6090, atk: 3060 },
    passive: {
      name: "Telekinesis",
      description: "On entry, sort the enemy lineup by ATK, lowest first."
    },
    image: "assets/cards/frieza.png"
  },
  {
    id: "adam-francis",
    element: "Holy",
    name: "Adam Francis", category: ["VideoGame", "Human", "Supporter", "Alternative"],
    rarity: "Epic",
    chance: 6970,
    requiredWeather: null,
    stats: { hp: 2697, atk: 440 },
    passive: {
      name: "Champion of Light",
      description: "Each attack: 20% chance to Stun for 1 turn. After Stun ends, the target deals 18% less damage."
    },
    image: "assets/cards/adamfrancis.png"
  },
  {
    id: "katakuri",
    element: "Nature",
    name: "Katakuri", category: ["Pirate", "AntiVillian", "Human", "Brutal"],
    rarity: "Mythic",
    chance: 207000,
    requiredWeather: "Sugar",
    stats: { hp: 27000, atk: 2700 },
    passive: {
      name: "MOCHI",
      description: "Each attack: 27% chance to reduce target ATK by 10% and heal 10% max HP. Also has 7% dodge."
    },
    image: "assets/cards/katakuri.png"
  },
  {
    id: "whitebeard",
    element: "Holy",
    name: "WhiteBeard", category: ["Pirate", "Captain", "Human", "Brutal", "Army"],
    rarity: "Mythic",
    chance: 500100,
    requiredWeather: null,
    stats: { hp: 50000, atk: 5000 },
    passive: {
      name: "Quake Hermit",
      description: "The 4th attack hits the 2 nearest enemies for x3 ATK damage and Stuns them for 2 turns."
    },
    image: "assets/cards/whitebeard.png"
  },
  {
    id: "doppio",
    element: "Holy",
    name: "Doppio", category: ["JoJo", "Villian", "Human", "Supporter", "Alternative"],
    rarity: "Rare",
    chance: 1450,
    requiredWeather: "Shadow",
    stats: { hp: 1450, atk: 145 },
    passive: {
      name: "FROG",
      description: "When hit: 20% chance to gain +20% ATK. Stacks up to +2000% and lasts for the match."
    },
    image: "assets/cards/dopio.png"
  },
  {
    id: "shanks",
    element: "Fire",
    name: "Shanks", category: ["Pirate", "Captain", "Human", "Hero", "Swordman", "Brutal"],
    rarity: "Legendary",
    chance: 24740,
    requiredWeather: null,
    stats: { hp: 4740, atk: 2474 },
    passive: {
      name: "HAKI",
      description: "30% dodge chance. Each successful dodge grants +25% damage to the next attack."
    },
    image: "assets/cards/shanks.png"
  },
  {
    id: "metal-cooler",
    element: "Electric",
    name: "Metal Cooler", category: ["Villian", "Unhuman", "Brutal", "PlanetDestroyer", "Army"],
    rarity: "Legendary",
    chance: 80008,
    requiredWeather: null,
    stats: { hp: 8008, atk: 3232 },
    passive: {
      name: "CLONE",
      description: "When an original teammate takes a fatal hit, create a Clone behind Metal Cooler with 50% of that teammate’s current max HP/ATK and its passive.\nNo creation cap. Generated units cannot trigger this effect or create companions."
    },
    image: "assets/cards/metalcooler.png"
  },
  {
    id: "gohan",
    element: "Electric",
    name: "Gohan", category: ["DragonWarrior", "Hero", "Human", "Protagonist"],
    rarity: "Legendary",
    chance: 85000,
    requiredWeather: null,
    stats: { hp: 8008, atk: 3232 },
    passive: {
      name: "MASENKO",
      description: "Target the enemy with the highest ATK and deal x2 damage."
    },
    image: "assets/cards/gohan.png"
  },
  {
    id: "yuno",
    element: "Nature",
    name: "Yuno", category: ["Magician", "Human", "Protagonist"],
    rarity: "Mythic",
    chance: 300000,
    requiredWeather: null,
    stats: { hp: 23000, atk: 4260 },
    passive: {
      name: "Zephyr Bow",
      description: "Each attack: 45% chance to pierce the next enemy for 100% ATK; a successful pierce has a 15% chance to continue."
    },
    image: "assets/cards/yuno.png"
  },
  {
    id: "asta",
    element: "Dark",
    name: "Asta", category: ["Protagonist", "Hero", "Human", "Swordman", "Brutal"],
    rarity: "Mythic",
    chance: 333000,
    requiredWeather: null,
    stats: { hp: 33000, atk: 3333 },
    passive: {
      name: "ANTI MAGIC",
      description: "Enemy passive attacks have a 50% chance to be reflected at 50% efficiency."
    },
    image: "assets/cards/asta.png"
  },
  {
    id: "asta-demon",
    element: "Dark",
    name: "Demon Asta", category: ["Protagonist", "AntiHero", "Unhuman", "Swordman", "Brutal"],
    rarity: "Secret",
    chance: 3333333,
    requiredWeather: null,
    stats: { hp: 333000, atk: 9999 },
    passive: {
      name: "ANTI MAGIC BOOK",
      description: "Each turn, randomly use one mode:\nDemon Slayer: 165% ATK damage, 75% chance to Stun for 1 turn, 25% chance to reflect incoming damage.\nDemon Dweller: 150% ATK + 35% of the last hit received; take 15% less damage."
    },
    image: "assets/cards/astademon.png"
  },
  // Existing weather-exclusive cards.
  {
    id: "nami",
    element: "Water",
    name: "Nami", category: ["Pirate", "Human", "Supporter"],
    rarity: "Rare",
    chance: 45,
    requiredWeather: "Raining",
    stats: { hp: 50, atk: 10 },
    passive: {
      name: "Greedy",
      description: "While on the team, winning grants +100% eligible battle rewards."
    },
    image: "assets/cards/nami.png"
  },
  {
    id: "giyu-tomioka",
    element: "Water",
    name: "Giyu Tomioka", category: ["DemonSlayer", "Swordman", "Human", "Hero"],
    rarity: "Epic",
    chance: 400,
    requiredWeather: "Raining",
    stats: { hp: 620, atk: 109 },
    passive: {
      name: "Dead Calm",
      description: "The 5th attack Stuns the target for 1 turn and grants immunity to incoming attacks for 3 turns."
    },
    image: "assets/cards/giyutomioka.png"
  },
  {
    id: "sea-beast",
    element: "Water",
    name: "Sea Beast", category: ["Unhuman", "Villian", "Brutal", "Hunter"],
    rarity: "Epic",
    chance: 1200,
    requiredWeather: "Raining",
    stats: { hp: 2000, atk: 200 },
    passive: {
      name: "Big Fish",
      description: "Intercept attacks against teammates and take the damage in their place."
    },
    image: "assets/cards/seabeast.png"
  },
  {
    id: "arlong",
    element: "Water",
    name: "Arlong", category: ["Villian", "Unhuman", "Pirate", "Brutal", "Captain"],
    rarity: "Epic",
    chance: 2400,
    requiredWeather: "Raining",
    stats: { hp: 2400, atk: 240 },
    passive: {
      name: "ZAWATER",
      description: "Enemies attacking this card have a 24% chance to miss."
    },
    image: "assets/cards/arlong.png"
  },
  {
    id: "aquaman",
    element: "Water",
    name: "Aquaman", category: ["Hero", "Unhuman", "Captain"],
    rarity: "Epic",
    chance: 22222,
    requiredWeather: "Raining",
    stats: { hp: 4444, atk: 222 },
    passive: {
      name: "AQUARIUM",
      description: "During Raining, take 50% less incoming damage."
    },
    image: "assets/cards/aquaman.png"
  },
  {
    id: "noelle-silva",
    element: "Water",
    name: "Noelle Silva", category: ["Magician", "Supporter", "Human", "Hero"],
    rarity: "Epic",
    chance: 400000,
    requiredWeather: "Raining",
    stats: { hp: 40000, atk: 2000 },
    passive: {
      name: "Tsunami Water",
      description: "On entry, hit all enemies for 100% ATK. If the wave kills an enemy, gain a Water Shield equal to 100% max HP."
    },
    image: "assets/cards/noellesilva.png"
  },
  {
    id: "weather-report",
    element: "Nature",
    name: "Weather Report", category: ["JoJo", "Supporter", "Magician"],
    rarity: "Mythic",
    chance: 650000,
    requiredWeather: "Raining",
    stats: { hp: 50000, atk: 222 },
    passive: {
      name: "BUBBLE CONTROL",
      description: "Every 3 turns, gain a Weather Shield equal to 30% current max HP for 1 turn. If an enemy destroys it, turn that enemy into a Snail for 2 turns."
    },
    image: "assets/cards/weatherreaport.png"
  },
  {
    id: "piccolo",
    element: "Nature",
    name: "Piccolo", category: ["DragonWarrior", "Unhuman", "Hero", "Supporter", "Brutal"],
    rarity: "Mythic",
    chance: 780000,
    requiredWeather: "Raining",
    stats: { hp: 80000, atk: 5000 },
    passive: {
      name: "AURA FARMER",
      description: "Each turn without attacking grants +10% ATK damage, with no stack cap. Attacking removes 1 stack."
    },
    image: "assets/cards/picolo.png"
  },
  {
    id: "peashooter",
    element: "Nature",
    name: "Peashooter", category: ["VideoGame", "Supporter", "Alternative"],
    rarity: "Common",
    chance: 100,
    requiredWeather: "Sunny",
    stats: { hp: 1000, atk: 100 },
    passive: {
      name: "Plant",
      description: "Below 30% max HP, heal 5% max HP each turn."
    },
    image: "assets/cards/peashooter.png"
  },
  {
    id: "hutao",
    element: "Fire",
    name: "Hutao", category: ["VideoGame", "Magician", "Human"],
    rarity: "Legendary",
    chance: 2020,
    requiredWeather: "Sunny",
    stats: { hp: 2020, atk: 400 },
    passive: {
      name: "Fire Burst",
      description: "Attacks apply Burn for 2 turns (50% ATK/turn)."
    },
    image: "assets/cards/hutao.png"
  },
  {
    id: "weather-solar-deity",
    element: "Fire",
    name: "Escanor", category: ["Sins", "Hero", "Human", "Brutal"],
    rarity: "Legendary",
    chance: 2500,
    requiredWeather: "Sunny",
    stats: { hp: 2770, atk: 690 },
    passive: {
      name: "SUNNY",
      description: "During Sunny, deal x2 ATK damage."
    },
    image: "assets/cards/escanor.png"
  },
  {
    id: "builderman",
    element: "Holy",
    name: "Builderman", category: ["VideoGame", "Supporter", "Alternative"],
    rarity: "Mythic",
    chance: 250000,
    requiredWeather: "Sunny",
    stats: { hp: 5000, atk: 5000 },
    passive: {
      name: "DEVELOPER",
      description: "Each turn, store 10% of the active enemy’s ATK as Tower Power. If it dies while Builderman lives, convert stored power into HP."
    },
    image: "assets/cards/builderman.png"
  },
  {
    id: "aatrox",
    element: "Dark",
    name: "Aatrox", category: ["VideoGame", "Unhuman", "Brutal", "Swordman", "Villian"],
    rarity: "Mythic",
    chance: 6666,
    requiredWeather: "Eclipse",
    stats: { hp: 6666, atk: 666 },
    passive: {
      name: "WORLD ENDER",
      description: "Each attack heals 5% max HP."
    },
    image: "assets/cards/aatrox.png"
  },
  {
    id: "weather-eclipse-harvester",
    element: "Dark",
    name: "Griffith", category: ["Villian", "Unhuman", "Brutal", "AntiVillian"],
    rarity: "Mythic",
    chance: 8000,
    requiredWeather: "Eclipse",
    stats: { hp: 9999, atk: 666 },
    passive: {
      name: "ECLIPSED",
      description: "On entry, sacrifice living teammates and gain +100% ATK per teammate sacrificed."
    },
    image: "assets/cards/griffith.png"
  },
  {
    id: "dante-limbus",
    element: "Fire",
    name: "Dante Limbus", category: ["VideoGame", "Protagonist", "Human", "Swordman", "Brutal"],
    rarity: "Mythic",
    chance: 10000,
    requiredWeather: "Eclipse",
    stats: { hp: 10000, atk: 1000 },
    passive: {
      name: "M@!L%#TH",
      description: "Once per match, an enemy defeated by a fatal attack allows one teammate to revive with Dante’s stats and its own passive."
    },
    image: "assets/cards/dantelimbus.png"
  },
  {
    id: "adult-gon",
    element: "Dark",
    name: "Adult Gon", category: ["Protagonist", "Hunter", "Human", "Brutal"],
    rarity: "Secret",
    chance: 2500000,
    requiredWeather: "Eclipse",
    stats: { hp: 250000, atk: 2500 },
    passive: {
      name: "END!!!",
      description: "Each attack: 25% chance for x4 ATK damage. Below 10% max HP, the chance becomes 50% and damage becomes x6 ATK."
    },
    image: "assets/cards/adultgon.png"
  },
  {
    id: "rukia",
    element: "Water",
    name: "Rukia", category: ["Reaper", "Swordman", "Supporter", "Human", "Hero"],
    rarity: "Legendary",
    chance: 1350,
    requiredWeather: "Snowing",
    stats: { hp: 1350, atk: 300 },
    passive: {
      name: "Freeze",
      description: "Each attack: 10% chance to Freeze for 1 turn. Deal +35% damage to frozen targets."
    },
    image: "assets/cards/rukia.png"
  },
  {
    id: "ice-admiral",
    element: "Water",
    name: "Ice Admiral", category: ["Human", "Magician", "Captain", "Villian", "Army"],
    rarity: "Mythic",
    chance: 5000,
    requiredWeather: "Snowing",
    stats: { hp: 3000, atk: 1000 },
    passive: {
      name: "Ice Age",
      description: "Critical hits have a 33% chance to Freeze the target for 1 turn."
    },
    image: "assets/cards/iceadmiral.png"
  },
  {
    id: "weather-frost-sovereign",
    element: "Water",
    name: "Esdeath", category: ["Villian", "Human", "Magician", "Brutal", "PureEvil"],
    rarity: "Mythic",
    chance: 12000,
    requiredWeather: "Snowing",
    stats: { hp: 4600, atk: 2050 },
    passive: {
      name: "Absolute Zero",
      description: "Critical hits have a 67% chance to Freeze the target for 1 turn."
    },
    image: "assets/cards/esdeath.png"
  },
  {
    id: "toshiro",
    element: "Water",
    name: "Toshiro", category: ["Reaper", "Swordman", "Human", "Hero"],
    rarity: "Mythic",
    chance: 26000,
    requiredWeather: "Snowing",
    stats: { hp: 10000, atk: 2000 },
    passive: {
      name: "Absolute Zero",
      description: "On combat turn 5, gain +50% ATK. Later attacks have a 50% chance to Stun for 1 turn."
    },
    image: "assets/cards/toshiro.png"
  },
  {
    id: "android-21",
    element: "Electric",
    name: "Android 21", category: ["AntiVillian", "Unhuman", "Magician", "Brutal"],
    rarity: "Mythic",
    chance: 150000,
    requiredWeather: "Sugar",
    stats: { hp: 20000, atk: 3000 },
    passive: {
      name: "Sweet Destruction",
      description: "On kill: heal 30% of the victim’s max HP; gain +20% HP/ATK for 2 turns.\nAfter facing an enemy for more than 3 turns, absorb 50% of its base ATK and prevent it from dodging this card."
    },
    image: "assets/cards/android21.png"
  },
  {
    id: "yuta-okkotsu",
    element: "Holy",
    name: "Yuta Okkotsu", category: ["Jujutsu", "Protagonist", "Human", "Swordman"],
    rarity: "Mythic",
    chance: 191022,
    requiredWeather: "Sugar",
    stats: { hp: 19100, atk: 2022 },
    passive: {
      name: "Cursed Love",
      description: "Once per match, survive a fatal hit at 50% max HP, heal another 25% max HP and gain +50% ATK."
    },
    image: "assets/cards/yutaokkotsu.png"
  },
  // New weather-exclusive cards. Add more entries below using the same schema.
  {
    id: "luffy-nightmare",
    element: "Dark",
    name: "Luffy Nightmare", category: ["Pirate", "Protagonist", "Brutal", "Berserk", "Unhuman"],
    rarity: "Mythic",
    chance: 9300,
    requiredWeather: "Shadow",
    stats: { hp: 5000, atk: 1000 },
    passive: {
      name: "ENHANCE",
      description: "When hit, reflect 50% of the damage received to the attacker."
    },
    image: "assets/cards/luffynightmare.png"
  },
  {
    id: "weather-shadow-monarch",
    element: "Dark",
    name: "Igris", category: ["Supporter", "Unhuman", "Swordman", "Army"],
    rarity: "Mythic",
    chance: 18000,
    requiredWeather: "Shadow",
    stats: { hp: 6400, atk: 3200 },
    passive: {
      name: "SHADOW KNIGHT",
      description: "Each attack has a 30% chance to call a teammate for one follow-up attack."
    },
    image: "assets/cards/igris.png"
  },
  {
    id: "cid-shadow",
    element: "Dark",
    name: "Cid Atomic", category: ["Protagonist", "Swordman", "Human", "Magician"],
    rarity: "Mythic",
    chance: 30000,
    requiredWeather: "Shadow",
    stats: { hp: 6400, atk: 3200 },
    passive: {
      name: "I AM ATMOIC !!!",
      description: "Every 10th attack hits all enemies for x100 ATK damage."
    },
    image: "assets/cards/cidatomic.png"
  },
  {
    id: "enderman",
    element: "Dark",
    name: "Enderman", category: ["VideoGame", "Unhuman", "Brutal"],
    rarity: "Mythic",
    chance: 99999,
    requiredWeather: "Shadow",
    stats: { hp: 9999, atk: 999 },
    passive: {
      name: "PEARL",
      description: "Survive one fatal hit at 1 HP per match."
    },
    image: "assets/cards/enderman.png"
  },
  {
    id: "homura-akemi",
    element: "Dark",
    name: "Homura Akemi", category: ["Magician", "Protagonist", "AntiHero", "Human"],
    rarity: "Mythic",
    chance: 199208,
    requiredWeather: "Shadow",
    stats: { hp: 20008, atk: 1990 },
    passive: {
      name: "Time Manipulation",
      description: "Once per match, a heal crossing from below 60% to at least 60% max HP on this card or an ally Freezes an enemy for 5 turns."
    },
    image: "assets/cards/homura.png"
  },
  {
    id: "kr-decade",
    element: "Dark",
    name: "Kamen Rider Decade", category: ["Hero", "Protagonist", "Human", "Alternative"],
    rarity: "Mythic",
    chance: 200000,
    requiredWeather: "Shadow",
    stats: { hp: 15000, atk: 5000 },
    passive: {
      name: "Rider Card",
      description: "On entry, copy an enemy card and its passive while keeping this card’s own HP/ATK."
    },
    image: "assets/cards/krdecade.png"
  },
  {
    id: "uchiha-sasuke",
    element: "Electric",
    name: "Uchiha Sasuke", category: ["Ninja", "AntiHero", "Human", "Swordman", "Brutal"],
    rarity: "Mythic",
    chance: 550000,
    requiredWeather: "Shadow",
    stats: { hp: 40000, atk: 5500 },
    passive: {
      name: "Storm Susano",
      description: "Each attack: 15% chance for a follow-up that applies Burn for 3 turns (25% ATK/turn).\nBelow 40% HP: gain +60% ATK and 30% damage reduction for 6 turns."
    },
    image: "assets/cards/uchihasasuke.png"
  },    
  {
    id: "light-admiral",
    element: "Electric",
    name: "Light Admiral", category: ["Human", "Magician", "Captain", "Villian", "Army"],
    rarity: "Secret",
    chance: 7000,
    requiredWeather: "Heavenly",
    stats: { hp: 5000, atk: 1000 },
    passive: {
      name: "Light Speed",
      description: "20% dodge chance. A successful dodge Stuns the attacker for 1 turn."
    },
    image: "assets/cards/kizaru.png"
  }, 
  {
    id: "gojo-young",
    element: "Electric",
    name: "Gojo Young", category: ["Jujutsu", "Hero", "Human", "Brutal"],
    rarity: "Secret",
    chance: 8888,
    requiredWeather: "Heavenly",
    stats: { hp: 8888, atk: 888 },
    passive: {
      name: "Infinity",
      description: "88% chance to dodge standard incoming attacks. Cannot dodge passive attacks."
    },
    image: "assets/cards/gojoyoung.png"
  }, 
  {
    id: "weather-heavenly-seraph",
    element: "Holy",
    name: "The First Human", category: ["Unhuman", "Villian", "Brutal", "PureEvil"],
    rarity: "Secret",
    chance: 30000,
    requiredWeather: "Heavenly",
    stats: { hp: 8200, atk: 4100 },
    passive: {
      name: "Ascension",
      description: "When targeted by a passive attack, copies the attacker’s passive for 3 turns, then loses it. Cooldown: 5 turns after the copy expires."
    },
    image: "assets/cards/adamror.png"
  },
  {
    id: "sailor-moon",
    element: "Holy",
    name: "Sailor Moon", category: ["Hero", "Protagonist", "Magician", "Human", "Supporter"],
    rarity: "Secret",
    chance: 70007,
    requiredWeather: "Heavenly",
    stats: { hp: 7007, atk: 7007 },
    passive: {
      name: "Moon Manipulation",
      description: "Winning a 1v1 battle has a 20% chance to add a random Common or Uncommon weather for 3 minutes."
    },
    image: "assets/cards/sailormoon.png"
  },
  {
    id: "jin-mori",
    element: "Holy",
    name: "Jin Mori", category: ["Protagonist", "Hero", "Human", "Brutal"],
    rarity: "Secret",
    chance: 240000,
    requiredWeather: "Heavenly",
    stats: { hp: 20000, atk: 7200 },
    passive: {
      name: "72 Magic Spell",
      description: "When an original teammate dies, create a Clone with Jin Mori’s current HP/ATK and that teammate’s passive. No numeric creation cap; generated units cannot create companions."
    },
    image: "assets/cards/jinmori.png"
  },
  {
    id: "wish",
    element: "Holy",
    name: "Wish", category: ["Alternative", "Supporter", "Magician"],
    rarity: "Secret",
    chance: 115000,
    requiredWeather: "Heavenly",
    stats: { hp: 15000, atk: 1500 },
    passive: {
      name: "Heavenly Blessing",
      description: "While on the team, all allies gain +150% max HP."
    },
    image: "assets/cards/wish.png"
  },
  {
    id: "weather-tsukuyomi-eye",
    element: "Nature",
    name: "Uchiha Shisui", category: ["Ninja", "Human", "Hero", "Supporter"],
    rarity: "Secret",
    chance: 35000,
    requiredWeather: "Tsukuyomi",
    stats: { hp: 8800, atk: 4700 },
    passive: {
      name: "TSUKUYOMI",
      description: "35% dodge chance. A successful dodge Stuns the attacker for 3 turns."
    },
    image: "assets/cards/shisui.png"
  },
  {
    id: "diavolo",
    element: "Dark",
    name: "Diavolo", category: ["JoJo", "Villian", "Human", "Brutal"],
    rarity: "Secret",
    chance: 600000,
    requiredWeather: "Tsukuyomi",
    stats: { hp: 60000, atk: 6000 },
    passive: {
      name: "EPITAH",
      description: "35% dodge chance. A successful dodge Stuns the attacker for 3 turns."
    },
    image: "assets/cards/diavolo.png"
  },
  {
    id: "kaguya",
    element: "Holy",
    name: "Kaguya", category: ["Villian", "Unhuman", "Magician", "PureEvil"],
    rarity: "Secret",
    chance: 999000,
    requiredWeather: "Tsukuyomi",
    stats: { hp: 66000, atk: 9999 },
    passive: {
      name: "Dimensional Domain",
      description: "On entry, create a 3-turn domain. Both teams lose one attack cycle; enemies take Burn equal to 100% ATK per turn inside the domain."
    },
    image: "assets/cards/kaguya.png"
  },
  {
    id: "weather-reaper-hollow",
    element: "Fire",
    name: "Vasto Lord", category: ["Unhuman", "Villian", "Brutal", "Reaper"],
    rarity: "Mythic",
    chance: 22000,
    requiredWeather: "Reaper",
    stats: { hp: 7000, atk: 3500 },
    passive: {
      name: "Last Breath",
      description: "Critical hits execute the surviving target, respecting immunity and fatal-hit survival effects."
    },
    image: "assets/cards/vastolord.png"
  },
  {
    id: "subaru",
    element: "Dark",
    name: "Subaru", category: ["Protagonist", "Human", "Supporter", "Alternative"],
    rarity: "Mythic",
    chance: 53090,
    requiredWeather: "Reaper",
    stats: { hp: 10000, atk: 1000 },
    passive: {
      name: "Return By Death",
      description: "First fatal hit: revive at 90% max HP. Later fatal hits: 65% chance to revive at 50% max HP. Each revival grants +20% ATK and +15% dodge."
    },
    image: "assets/cards/subaru.png"
  },
  {
    id: "dio-brando",
    element: "Fire",
    name: "Dio Brando", category: ["JoJo", "Villian", "Unhuman", "Brutal", "PureEvil"],
    rarity: "Legendary",
    chance: 666,
    requiredWeather: "Malevolent",
    stats: { hp: 666, atk: 333 },
    passive: {
      name: "WGRYYYY",
      description: "Each attack: 20% chance to Freeze for 2 turns. Successful Freeze heals 20% max HP."
    },
    image: "assets/cards/diobrando.png"
  },
  {
    id: "weather-malevolent-king",
    element: "Fire",
    name: "Malevolent King", category: ["Villian", "Unhuman", "PureEvil", "Brutal", "Army", "Magician"],
    rarity: "Secret",
    chance: 45000,
    requiredWeather: "Malevolent",
    stats: { hp: 11000, atk: 4500 },
    passive: {
      name: "Malevolent Kitchen",
      description: "The 5th attack repeatedly slashes the active enemy until it falls below 50% max HP."
    },
    image: "assets/cards/sukuna.png"
  },
  {
    id: "doflamingo",
    element: "Nature",
    name: "Doflamingo", category: ["Pirate", "Villian", "Human", "Brutal", "Captain"],
    rarity: "Secret",
    chance: 60220,
    requiredWeather: "Malevolent",
    stats: { hp: 16000, atk: 4020 },
    passive: {
      name: "STRING ARMY",
      description: "Each eligible kill has a 30% chance to convert the defeated enemy into a teammate. No creation cap; clones and summons cannot create further units."
    },
    image: "assets/cards/doflamingo.png"
  },
  {
    id: "hakari-jackpot",
    element: "Nature",
    name: "Hakari Jackpot", category: ["Jujutsu", "Protagonist", "Human", "Brutal"],
    rarity: "Secret",
    chance: 777777,
    requiredWeather: "Malevolent",
    stats: { hp: 77777, atk: 7777 },
    passive: {
      name: "JACKPOT",
      description: "While on the team, winning grants +100% eligible rewards. Starting in slot 1 grants 7 turns of Invincibility; otherwise gain either +77% ATK or +77% max HP."
    },
    image: "assets/cards/hakarijackpot.png"
  },
  {
    id: "mahoraga",
    element: "Holy",
    name: "Mahoraga", category: ["Jujutsu", "Unhuman", "Brutal"],
    rarity: "Secret",
    chance: 800000,
    requiredWeather: "Malevolent",
    stats: { hp: 80000, atk: 8000 },
    passive: {
      name: "ADAPTION",
      description: "When hit: 25% chance to Adapt and gain 25% damage reduction; resets against a new enemy. Each kill heals 50% max HP."
    },
    image: "assets/cards/mahoraga.png"
  }
];

// Champions retain the existing reward IDs/receipts; exact level-1 Normal specs.
const TOWER_REWARD_CARDS = [
  {"id": "tower-champion-normal", "element": "Electric", "image": "assets/cards/equinox.png", "towerType": "normal", "unlockRequirement": "tower_floor_100_normal", "sourceId": "starter-common", "name": "Equinox", category: ["VideoGame", "Alternative", "Brutal"], "chance": 2500025, "requiredWeather": "Normal", "nativeWeather": null, "stats": {"hp": 250000, "atk": 25000}, "passive": {"name": "Emotional Meter", "description": "Start at 50% positive / 50% negative. Primary attacks shift 10–20% toward positive; incoming hits shift 10–20% toward negative.\n100% positive: living team gains +100% max HP and +25% ATK; meter locks.\n100% negative: hit all enemies for x25 current ATK, then die permanently; cannot revive or be cloned."}},
  {"id": "tower-champion-raining", "element": "Water", "image": "assets/cards/aqua.png", "towerType": "raining", "unlockRequirement": "tower_floor_100_raining", "sourceId": "aquaman", "name": "Aqua", category: ["Supporter", "Magician", "Unhuman"], "chance": 2222222, "requiredWeather": "Raining", "nativeWeather": "raining", "stats": {"hp": 222222, "atk": 2222}, "passive": {"name": "Useless", "description": "Before battle, choose +50% team max HP (once/team) or +50% eligible VNĐ/EXP/Reward Bonus. Reward choice excludes Tower Coins, potion chances and Time Trial payouts.\nEach allied turn with another active attacker: heal it for 10% max HP and grant +2.2% current ATK, once/turn."}},
  {"id": "tower-champion-snowing", "element": "Water", "image": "assets/cards/iceking.png", "towerType": "snowing", "unlockRequirement": "tower_floor_100_snowing", "sourceId": "toshiro", "name": "Ice King", category: ["AntiVillian", "Magician", "Human", "Alternative"], "chance": 1058000, "requiredWeather": "Snowing", "nativeWeather": "snowing", "stats": {"hp": 104600, "atk": 46000}, "passive": {"name": "Ice Manipulation", "description": "When hit: 20% chance to Freeze the attacker for 2 turns. Deal +50% damage to frozen targets.\nFirst eligible fatal hit: revive at full HP for 5 combat turns, then die permanently. No teammate revival.\nOn permanent death: 58% chance to give a living teammate Ice King Crown (10% chance to Freeze targets for 3 turns)."}},
  {"id": "tower-champion-sunny", "element": "Fire", "image": "assets/cards/charizardx.png", "towerType": "sunny", "unlockRequirement": "tower_floor_100_sunny", "sourceId": "weather-solar-deity", "name": "Charizard Mega X", category: ["Unhuman", "Brutal", "Alternative"], "chance": 634000, "requiredWeather": "Sunny", "nativeWeather": "sunny", "stats": {"hp": 78000, "atk": 13000}, "passive": {"name": "Solar Claw", "description": "33% base crit chance. First damaging crit applies Burn for 3 turns (33% current ATK/turn).\nLater crits deal x3 attack damage before the normal crit multiplier. They do not reapply this Burn. No free follow-up or guaranteed crit."}},
  {"id": "tower-champion-sugar", "element": "Electric", "image": "assets/cards/buu.png", "towerType": "sugar", "unlockRequirement": "tower_floor_100_sugar", "sourceId": "android-21", "name": "Majin Buu", category: ["Villian", "Unhuman", "Brutal", "AntiVillian"], "chance": 760000, "requiredWeather": "Sugar", "nativeWeather": "sugar", "stats": {"hp": 76000, "atk": 7600}, "passive": {"name": "Candy Eater", "description": "Each primary attack gains 1–3 candies; only the current form applies.\n0–10: +25% damage; +1 extra candy/attack.\n11–25: +50% max HP; when hit, spend 1 candy to heal 3% max HP.\n26–50: damaging attacks summon a Ghost (HP = damage dealt; ATK = 10% current ATK).\n51–75: 76% dodge; a dodge skips the next attack, grants 5 candies and heals 7.6% max HP.\n76–99: every 3rd attack also hits up to 3 random enemies for 50% ATK.\n100: hit all enemies each attack; spend 1 candy/attack until 0. Then return to Form 1 and self-Stun for 5 turns; no candy gain or transformation during reversion.\nGenerated units cannot summon Ghosts."}},
  {"id": "tower-champion-reaper", "element": "Holy", "image": "assets/cards/aizenbeyond.png", "towerType": "reaper", "unlockRequirement": "tower_floor_100_reaper", "sourceId": "weather-reaper-hollow", "name": "Aizen Beyond", category: ["Villian", "Reaper", "Unhuman", "Brutal", "PureEvil"], "chance": 6000000, "requiredWeather": "Reaper", "nativeWeather": "reaper", "stats": {"hp": 60000, "atk": 30000}, "passive": {"name": "Illusion Shattering Flower", "description": "Every 2nd primary attack: hit all enemies for 60% of each target’s current ATK.\nWhen damaged: 6% chance to counter for 50% damage received; counters cannot loop.\nFirst eligible fatal hit: revive at full HP, gain +100% current ATK permanently. Cannot be cloned or revived by teammates."}},
  {"id": "tower-champion-eclipse", "element": "Dark", "image": "assets/cards/wou.png", "towerType": "eclipse", "unlockRequirement": "tower_floor_100_eclipse", "sourceId": "weather-eclipse-harvester", "name": "Wonder Of You", category: ["JoJo", "Supporter", "Magician", "Alternative"], "chance": 8000000, "requiredWeather": "Eclipse", "nativeWeather": "eclipse", "stats": {"hp": 800000, "atk": 8}, "passive": {"name": "Calamity", "description": "Protect a random living teammate; choose another if it dies. No position swap.\nAfter that ally’s shields/reduction, split remaining damage 50%/50%; absorb the shared half, with an 8% chance to reflect it instead. No recursive redirection.\nProtected ally’s kill: heal 80% max HP. Death while protecting: 8% chance to execute the attacker; normal immunity/survival rules apply."}},
  {"id": "tower-champion-malevolent", "element": "Fire", "image": "assets/cards/thukuna.png", "towerType": "malevolent", "unlockRequirement": "tower_floor_100_malevolent", "sourceId": "weather-malevolent-king", "name": "Thukuna", category: ["Jujutsu", "Villian", "Unhuman", "Brutal", "PureEvil"], "chance": 666999, "requiredWeather": "Malevolent", "nativeWeather": "malevolent", "stats": {"hp": 66666, "atk": 9999}, "passive": {"name": "Malevolent Kitchen", "description": "After 5 primary attacks, hit all living enemies for 25% current ATK at the start of every combat turn while alive.\nWhen hit and surviving: 66% chance to heal 6% max HP and gain +9% current ATK. ATK bonuses stack for the match."}},
  {"id": "tower-champion-tsukuyomi", "element": "Nature", "image": "assets/cards/narutosasuke.png", "towerType": "tsukuyomi", "unlockRequirement": "tower_floor_100_tsukuyomi", "sourceId": "weather-tsukuyomi-eye", "name": "Naruto x Sasuke", category: ["Ninja", "Protagonist", "Hero", "Human", "Brutal"], "chance": 2000000, "requiredWeather": "Tsukuyomi", "nativeWeather": "tsukuyomi", "stats": {"hp": 200000, "atk": 20000}, "passive": {"name": "Datebayo", "description": "Each new active enemy rolls Naruto/Sasuke mode (50% each); keep the card’s attack counter across target changes.\nNaruto: every 3rd attack deals x3 damage and creates a 10% current HP/ATK Clone. Living Clones follow up each attack; Clone death heals the owner 10% max HP. No count cap; generated units cannot summon.\nSasuke: every 2nd attack hits all enemies for 50% ATK; 20% dodge. Dodge applies Burn for 5 turns (25% ATK/turn) and a 3-combat-turn shield equal to avoided damage. Burn ending naturally Stuns for 1 turn.\nSwitching to Sasuke removes Clones without healing; switching to Naruto removes the shield."}, "requiredWeathers": ["Tsukuyomi", "Mangekyo"]},
  {"id": "tower-champion-heavenly", "element": "Holy", "image": "assets/cards/judgement.png", "towerType": "heavenly", "unlockRequirement": "tower_floor_100_heavenly", "sourceId": "weather-heavenly-seraph", "name": "The Judgement", category: ["Alternative", "Magician", "Unhuman", "Supporter"], "chance": 300300, "requiredWeather": "Heavenly", "nativeWeather": "heavenly", "stats": {"hp": 40000, "atk": 5000}, "passive": {"name": "Divine Light", "description": "Every 2nd attack: 33% chance for a beam hitting all enemies for 50% current ATK; damaged targets have a 66% chance of Heresy for 1–3 turns.\nWhile any enemy has Heresy: beam chance/damage become 66%/66% ATK; Heresy chance becomes 33%.\nHeresy: deal 9% less damage; 3% chance to miss primary attacks."}},
  {"id": "tower-champion-shadow", "element": "Dark", "image": "assets/cards/krdarkdecade.png", "towerType": "shadow", "unlockRequirement": "tower_floor_100_shadow", "sourceId": "weather-shadow-monarch", "name": "Kamen Rider Dark Decade", category: ["Villian", "AntiVillian", "Human", "Alternative", "Brutal"], "chance": 2009000, "requiredWeather": "Shadow", "nativeWeather": "shadow", "stats": {"hp": 102000, "atk": 28000}, "passive": {"name": "Dark Aurora", "description": "On kill: 29% chance to convert an eligible original enemy and steal its passive (max 2 living summons owned by this card, including summons from stolen passives). Insert the converted unit directly in front of Dark Decade with Dark Decade’s current max HP/ATK and the victim’s passive.\nWhile alive, revive eligible original teammates at the back with Dark Decade’s stats (max 2 revivals/teammate); keep their own passives. Never revive itself, clones or summons.\nGenerated units cannot create companions. Uncloneable enemies and anti-revival restrictions remain excluded."}},
].map(reward => Object.freeze({ ...reward, towerFloor: 100, rarity: 'Secret', image: reward.image, description: `Clear Floor 100 of ${reward.towerType} Tower. Future rolls require the matching weather.` }));
CARDS.push(...TOWER_REWARD_CARDS);
// Raid-only secrets never enter RNG pools, including after their first unlock.
const RAID_SECRET_CARDS = [
  { id: 'raid-secret-mihawk', element: 'Nature', name: 'Mihawk', category: ["Swordman", "Human", "AntiVillian", "Brutal"], rarity: 'Secret', chance: 0, stats: { hp: 100000, atk: 5000 }, image: 'assets/cards/mihawk.png',
    passive: { name: 'Hawkeye', description: "50% dodge; successful dodge counters for 500% current ATK.\nPrimary attacks pierce the enemy lineup; each damaging hit reduces the next target’s damage by 25%. Dodges/fully blocked hits do not consume a falloff step.\nEach combat turn: 25% chance for Haki for 2 turns (+250% ATK, 25% damage reduction); refreshes without stacking." } },
  { id: 'raid-secret-ace', element: 'Fire', name: 'Ace', category: ["Pirate", "Human", "Hero", "Supporter", "Brutal"], rarity: 'Secret', chance: 0, stats: { hp: 10000, atk: 1000 }, image: 'assets/cards/ace.png',
    passive: { name: 'Mera Mera', description: "Successful attacks: 10% chance to Burn for 3 turns (100% current ATK/turn).\nOn death: living teammates gain Brother Soul. Their successful attacks have a separate 10% chance to Burn for 1 turn (100% their current ATK). Stacks with other Burns; multiple Ace deaths do not increase the chance." } },
  { id: 'raid-secret-marco', element: 'Water', name: 'Marco', category: ["Pirate", "Human", "Supporter", "Hero"], rarity: 'Secret', chance: 0, stats: { hp: 500000, atk: 10000 }, image: 'assets/cards/marco.png',
    passive: { name: 'Phoenix Inferno', description: "While alive, attacks against other teammates have a 10% chance to be blocked; counter for 200% current ATK without swapping.\nOnce/match, prevent an ally’s fatal hit or danger below 10% HP, swap positions and heal to max HP. Bleed blocks the heal; fatal rescue leaves at least 1 HP.\n10% dodge; each dodge grants the living team +10% current max HP, stacking for the match." } }
].map(card => Object.freeze({ ...card, requiredWeather: null, raidOnly: true, raidType: 'marine_fort', unlockRequirement: `raid_secret_${card.name.toLowerCase()}`, description: 'Exclusive Marine Ford Raid drop. Never available from normal rolls.' }));
CARDS.push(...RAID_SECRET_CARDS);
if (typeof window !== 'undefined') window.RAID_SECRET_CARDS = RAID_SECRET_CARDS;
if (typeof window !== 'undefined') window.TOWER_REWARD_CARDS = TOWER_REWARD_CARDS;

// The base card database is immutable at the array level. Gameplay code must
// always sort/filter a fresh copy so Collection/Battle rendering can never
// mutate the canonical order.
// Expansion cards: evolved forms are excluded from all normal rolls.
const EXPANSION_CARDS = [
  {
    "id": "funny-valentine",
    "name": "Funny Valentine", category: ["JoJo", "Villian", "Human", "Brutal"],
    "element": "Nature",
    "rarity": "Secret",
    "chance": 214000,
    "stats": {
      "hp": 21400,
      "atk": 2140
    },
    "image": "assets/cards/funnyvalentine.png",
    "passive": {
      "name": "D4C",
      "description": "Each attack: 14% chance to summon a passive-free Clone with 10% current HP/ATK (max 10 living Clones). Clones follow up each primary attack.\nFatal hit with a living Clone: sacrifice 1 Clone and survive at 10% max HP. Bleed blocks this survival."
    },
    "requiredWeather": "Bizare"
  },
  {
    "id": "dio-the-world",
    "name": "Dio The World", category: ["JoJo", "Villian", "Unhuman", "Brutal", "PureEvil"],
    "element": "Electric",
    "rarity": "Secret",
    "chance": 666666,
    "stats": {
      "hp": 66666,
      "atk": 6666
    },
    "image": "assets/cards/diotheworld.png",
    "passive": {
      "name": "The World",
      "description": "Every 5th primary attack randomly uses Time Stop or Road Roller.\nTime Stop: Freeze all enemies for 2 turns; attacks deal x2 damage to frozen targets.\nRoad Roller: hit up to 3 enemies for x3 ATK each and inflict Bleed for 3 turns (66% ATK/turn)."
    },
    "requiredWeather": "Bizare"
  },
  {
    "id": "joseph-joestar",
    "name": "Joseph Joestar", category: ["JoJo", "Protagonist", "Hero", "Human", "Supporter"],
    "element": "Electric",
    "rarity": "Secret",
    "chance": 120000,
    "stats": {
      "hp": 20000,
      "atk": 1200
    },
    "image": "assets/cards/josephjoestar.png",
    "passive": {
      "name": "Secret Techniques",
      "description": "Gain 5% dodge per 10% missing max HP.\nOn dodge, the attacker takes +75% damage and loses its passive until the end of its next turn."
    }
  },
  {
    "id": "jolyne-joestar",
    "name": "Jolyne Joestar", category: ["JoJo", "Protagonist", "Hero", "Human", "Brutal"],
    "element": "Nature",
    "rarity": "Secret",
    "chance": 206000,
    "stats": {
      "hp": 26000,
      "atk": 6000
    },
    "image": "assets/cards/jolynejoestar.png",
    "passive": {
      "name": "Stone Free",
      "description": "Primary attacks target the enemy with the lowest current HP.\nOnce per match, when an attacker has less current HP than Jolyne, stun it for 6 turns before its hit resolves."
    },
    "requiredWeather": "Bizare"
  },
  {
    "id": "tohth",
    "name": "Tohth", category: ["JoJo", "Supporter", "Magician", "Alternative"],
    "element": "Holy",
    "rarity": "Secret",
    "chance": 189000,
    "stats": {
      "hp": 30000,
      "atk": 1890
    },
    "image": "assets/cards/tohth.png",
    "passive": {
      "name": "OinGo BoinGo",
      "description": "If not in the first lineup slot, mark a random enemy at battle start.\nIf that enemy dies while Tohth lives, all living teammates gain +18.9% current ATK for the match (once)."
    },
    "requiredWeather": "Bizare"
  },
  {
    "id": "emmu",
    "name": "Emmu", category: ["Hero", "Protagonist", "Human", "Supporter"],
    "element": "Dark",
    "rarity": "Secret",
    "chance": 1700000,
    "stats": {
      "hp": 200000,
      "atk": 10000
    },
    "image": "assets/cards/emmu.png",
    "passive": {
      "name": "Sleep Demon Art",
      "description": "Each primary attack: 17% chance to randomly inflict Stun or Hypnosis for 1 turn.\nHypnosis: 80% chance to attack a living teammate instead. Each kill grants +70% current ATK."
    },
    "requiredWeather": "Bizare"
  },
  {
    "id": "josuke",
    "name": "Josuke", category: ["JoJo", "Protagonist", "Hero", "Human", "Supporter"],
    "element": "Water",
    "rarity": "Secret",
    "chance": 2400000,
    "stats": {
      "hp": 240000,
      "atk": 12000
    },
    "image": "assets/cards/josuke.png",
    "passive": {
      "name": "Crazy Diamond",
      "description": "Before each primary attack, cleanse all living teammates of debuffs and reduce active skill cooldowns by 4 turns.\nOnce per match, revive an eligible original teammate with Josuke’s current max HP and ATK."
    },
    "requiredWeather": "Bizare"
  },
  {
    "id": "akaza",
    "name": "Akaza", category: ["DemonSlayer", "Villian", "Unhuman", "Brutal"],
    "element": "Water",
    "rarity": "Secret",
    "chance": 8000000,
    "stats": {
      "hp": 450000,
      "atk": 40000
    },
    "image": "assets/cards/akaza.png",
    "passive": {
      "name": "Destructive Demon Art",
      "description": "Target the enemy with the highest ATK and deal x1.5 damage.\nStarting behind slot 1: swap with slot 1, gain +50% ATK and +25% max HP. Starting in slot 1: each attack also hits a second enemy.\nSurvive only 1 fatal hit at 1 HP per match. This survival and each kill grant +10% current ATK. Bleed blocks survival."
    },
    "requiredWeather": "Malevolent"
  },
  {
    "id": "awakened-doflamingo", evolvesFrom: 'doflamingo',
    "name": "Awakened Doflamingo", category: ["Pirate", "Villian", "Human", "Brutal", "Captain", "PureEvil"],
    "element": "Dark",
    "rarity": "Secret",
    "chance": 0,
    "stats": {
      "hp": 60220,
      "atk": 26200
    },
    "image": "assets/cards/awakeneddoflamingo.png",
    "passive": {
      "name": "Ito Ito",
      "description": "Starting in slot 1: if alive at combat turn 10, hit all enemies for x10 current ATK once.\nEvery 3rd primary attack: 60% chance to summon a passive-free Clone with 60% current HP/ATK; no count limit. Its death stuns its attacker for 2 turns.\nThe 5th primary attack disables its target’s passive until that enemy dies (once)."
    },
    "evolutionOnly": true
  },
  {
    "id": "prime-garp", evolvesFrom: 'garp',
    "name": "Prime Garp", category: ["Hero", "Human", "Captain", "Brutal", "Army"],
    "element": "Nature",
    "rarity": "Secret",
    "chance": 0,
    "stats": {
      "hp": 38992,
      "atk": 3899
    },
    "image": "assets/cards/primegarp.png",
    "passive": {
      "name": "Galaxy Impact",
      "description": "On the 7th primary attack, hit all enemies for x10 current ATK; Stun and disable their passives for 3 turns.\nBelow 50% max HP, take 25% less incoming damage."
    },
    "evolutionOnly": true
  }
];
CARDS.push(...EXPANSION_CARDS);
window.EXPANSION_CARDS = EXPANSION_CARDS;
// Boss Event exclusive: never enters normal rolls.
const BOSS_EVENT_CARDS = [{
  "id": "boss-event-alucard",
  "name": "Alucard", category: ["Protagonist", "AntiHero", "Unhuman", "Brutal", "Hunter"],
  "element": "Fire",
  "rarity": "Secret",
  "chance": 0,
  "bossEventOnly": true,
  "eventType": "alucard",
  "stats": {
    "hp": 333333,
    "atk": 66666
  },
  "image": "assets/cards/alucard.png",
  "passive": {
    "name": "Bird of Hermes",
    "description": "Every 2 attacks: apply Bleed for 1 turn (66% current ATK).\nAfter 6 attacks, each attack has a 66% chance for a follow-up (33% ATK; heal 3% max HP). Follow-ups can repeat without a count cap.\n6 consecutive damaging follow-up hits create a random living teammate’s Clone directly in front of Alucard (max 3 living Clones).\nOn death, revive once at the back with 66% max HP. Cannot be cloned; teammate revivals are allowed.\nWhile alive and not attacking, allied Bleed deals x1.5 damage."
  }
}];
CARDS.push(...BOSS_EVENT_CARDS);
window.BOSS_EVENT_CARDS = BOSS_EVENT_CARDS;
// Quest rewards and the Mangekyo Floor 200 milestone.
const QUEST_UPDATE_CARDS = [
  {
    "id": "madara-lubu",
    "name": "Madara Lubu", category: ["Ninja", "Villian", "Unhuman", "Brutal", "Army"],
    "element": "Fire",
    "rarity": "Secret",
    "chance": 10000000,
    "requiredWeather": "Tsukuyomi",
    "towerType": "tsukuyomi",
    "towerFloor": 200,
    "unlockRequirement": "tower_floor_200_tsukuyomi",
    "stats": {
      "hp": 500000,
      "atk": 100000
    },
    "image": "assets/cards/madaralubu.png",
    "passive": {
      "name": "Divine Steed",
      "description": "10% dodge against standard and passive attacks; a dodge disables the attacker’s passive for 5 turns. 50% chance to resist each Stun.\nFrom attack 5, each attack has a 50% chance to chain a follow-up (100% current ATK; Bleed for 3 turns at 25% ATK/turn).\nEach attack has a 20% chance to call a teammate for a follow-up.\nLast survivor: once per match, summon 3 Clones with 50% current stats, a random fallen teammate’s passive each, and a shield equal to 50% of Madara’s max HP."
    }
  },
  {
    "id": "sung-jin-woo",
    "name": "Sung Jin Woo", category: ["Protagonist", "Hunter", "Human", "Supporter", "Army", "Brutal"],
    "element": "Water",
    "rarity": "Secret",
    "chance": 2023000,
    "requiredWeather": "Shadow",
    "questOnly": true,
    "unlockRequirement": "quest_card_sung-jin-woo",
    "stats": {
      "hp": 223000,
      "atk": 22300
    },
    "image": "assets/cards/sungjinwoo.png",
    "passive": {
      "name": "Systems Stats",
      "description": "Each kill summons a Shadow with 50% of the defeated enemy’s HP/ATK.\nChoose one non-stacking bonus at battle start and after each kill: +15% ATK, +20% max HP, or heal 1.5% max HP per attack. Keep it until the next kill.\nEach attack randomly uses Hunter Slash (120% ATK), Shadow Attack (call a Shadow or backline teammate), or Fang Strike (60% ATK to the 2 front enemies)."
    }
  },
  {
    "id": "frieren",
    "name": "Frieren", category: ["Protagonist", "Magician", "Supporter", "Unhuman", "Hero"],
    "element": "Holy",
    "rarity": "Secret",
    "chance": 2500000,
    "requiredWeather": "Heavenly",
    "questOnly": true,
    "unlockRequirement": "quest_card_frieren",
    "stats": {
      "hp": 200000,
      "atk": 25000
    },
    "image": "assets/cards/frieren.png",
    "passive": {
      "name": "Endless Mana",
      "description": "Taking HP damage grants 3.5% Mana. Each 1% Mana adds +0.5% damage. At 100%, heal 35% max HP, cast Zoltraak (175% current ATK), then reset Mana.\nOnce per match, surviving below 25% HP immediately casts Zoltraak and grants 30% Mana.\nNormal attacks randomly become Vollzanbel (40% ATK to all enemies), Time Dilation (Stun all enemies for 1 turn, then disable passives for 1 turn), or Healing (heal all allies for 25% max HP)."
    }
  },
  {
    "id": "alexander-anderson",
    "name": "Alexander Anderson", category: ["AntiVillian", "Human", "Brutal", "Hunter"],
    "element": "Water",
    "rarity": "Mythic",
    "chance": 777000,
    "requiredWeather": null,
    "questOnly": true,
    "unlockRequirement": "quest_card_alexander-anderson",
    "stats": {
      "hp": 77700,
      "atk": 7700
    },
    "image": "assets/cards/alexanderanderson.png",
    "passive": {
      "name": "Pray to God",
      "description": "Each attack has a 77% chance to chain a follow-up for 77% current ATK. Each follow-up applies Bleed for its chain count in turns (7% ATK/turn).\nOnce per match, while alive below 7% max HP: heal to 77% max HP, gain +300% attack damage, and stop follow-ups. Gain Crucifix: +150% damage against Dark enemies. Cannot be revived."
    }
  }
];
CARDS.push(...QUEST_UPDATE_CARDS);
// Lucius update: explicit progression sources and weather locks.
CARDS.push(...[
  {
    "id": "julius",
    "name": "Julius", category: ["Magician", "Human", "Captain", "Hero", "Supporter"],
    "element": "Holy",
    "rarity": "Secret",
    "chance": 1500000,
    "requiredWeather": null,
    "questOnly": true,
    "unlockRequirement": "quest_card_julius",
    "stats": {
      "hp": 200000,
      "atk": 15000
    },
    "image": "assets/cards/julius.png",
    "passive": {
      "name": "Time Grimoire",
      "description": "While alive: 30% chance to reflect attacks against Julius or the active ally. Two consecutive reflections deal 50% ATK to all enemies and shield allies for 50% Julius max HP.\nAn ally shield breaking within 3 turns stores their current stats and passive as one backup life per match. Fatal damage consumes it to revive Julius; after this revival, cannot be cloned or revived by allies."
    }
  },
  {
    "id": "speed-wizard",
    "name": "Speed Wizard", category: ["Alternative", "Magician", "Human"],
    "element": "Electric",
    "rarity": "Mythic",
    "chance": 450000,
    "requiredWeather": "Wind",
    "stats": {
      "hp": 45000,
      "atk": 4500
    },
    "image": "assets/cards/speedwizard.png",
    "passive": {
      "name": "Godspeed",
      "description": "5% chance per attack to follow up for 50% ATK; each successive follow-up halves its trigger chance.\n50% dodge. Each dodge adds +5% follow-up chance for the match, but skips the next attack turn."
    }
  },
  {
    "id": "boss-event-lucius",
    "name": "Lucius Zogratis", category: ["Villian", "Human", "Magician", "Brutal", "PureEvil", "Alternative"],
    "element": "Dark",
    "rarity": "Secret",
    "chance": 0,
    "bossEventOnly": true,
    "eventType": "lucius",
    "stats": {
      "hp": 300000,
      "atk": 30000
    },
    "image": "assets/cards/lucius.png",
    "passive": {
      "name": "All Grimoire",
      "description": "On entry and every 5 attacks, gain a random ally/enemy passive. No duplicates; maximum 5 passives including All Grimoire.\nWhen an allied Julius dies permanently, gain +50% HP and ATK once per match."
    }
  },
  {
    "id": "sea-goddess-valkyrie", evolvesFrom: 'noelle-silva',
    "name": "Sea Goddess Valkyrie", category: ["Unhuman", "Supporter", "Magician"],
    "element": "Water",
    "rarity": "Mythic",
    "chance": 0,
    "evolutionOnly": true,
    "stats": {
      "hp": 400000,
      "atk": 20000
    },
    "image": "assets/cards/seagoddessvalkyrie.png",
    "passive": {
      "name": "Ultimate Tsunami",
      "description": "On entry: deal 100% ATK to all enemies and gain a shield equal to 50% total HP damage dealt.\nWhen this shield breaks, stun all enemies for 4 turns."
    }
  }
]);
// Yuno evolution and Lucky Tower champion.
CARDS.push(...[
  {
    "id": "yuno-spirit", evolvesFrom: 'yuno',
    "name": "Yuno Spirit", category: ["Magician", "Supporter", "Human", "Protagonist"],
    "element": "Nature",
    "rarity": "Secret",
    "chance": 0,
    "levelingRate": 1500000,
    "evolutionOnly": true,
    "stats": {
      "hp": 255500,
      "atk": 19892
    },
    "image": "assets/cards/yunospirit.png",
    "passive": {
      "name": "Spirit Wind Grimoire",
      "description": "On entry, shield all living allies, including self, for 48% of this card’s max HP; no expiry.\n30% dodge. Each dodge adds a shield equal to 30% current HP for 3 turns.\nEach attack has a 26% chance to shuffle living enemies and hit all enemies for 48% current ATK."
    }
  },
  {
    "id": "tower-champion-lucky",
    "name": "Yuno Spirit Demonic", category: ["Magician", "Human", "Brutal", "Protagonist"],
    "element": "Nature",
    "rarity": "Secret",
    "chance": 4444444,
    "requiredWeather": "Lucky",
    "towerType": "lucky",
    "towerFloor": 100,
    "unlockRequirement": "tower_floor_100_lucky",
    "stats": {
      "hp": 444444,
      "atk": 22222
    },
    "image": "assets/cards/yunospiritdemonic.png",
    "passive": {
      "name": "Anti Spirit Grimoire",
      "description": "Deal x2 damage to Holy enemies; take 22% less damage from Holy enemies.\nEach attack has a 44% chance to pierce the enemy lineup: 100% current ATK on the first hit, then x0.78 damage per subsequent hit.\nWhen attacked, 22% chance to absorb damage instead of taking it. Add the absorbed amount to the next attack and grant the ally directly behind a permanent shield of that amount; shields stack without cap."
    }
  }
]);
// Tower milestone additions.
CARDS.push(...[
  {
    "id": "tower-champion-wind",
    "name": "Xtreme Chan", category: ["Alternative", "Supporter", "Magician"],
    "element": "Nature",
    "rarity": "Secret",
    "chance": 2010000,
    "requiredWeather": "Wind",
    "towerType": "wind",
    "towerFloor": 100,
    "unlockRequirement": "tower_floor_100_wind",
    "stats": {
      "hp": 210000,
      "atk": 21000
    },
    "image": "assets/cards/xtremechan.png",
    "passive": {
      "name": "The Fuuto Wind",
      "description": "Last ally alive: +50% damage and gain all fallen teammates’ max HP once.\nWhen attacked, 21% chance to gain 21% damage reduction for the next turn; does not stack.\nEvery 2nd attack replaces the normal hit with Heat (50% ATK + Burn: 30% ATK, 2 turns), Cyclone (100% ATK to up to 2 enemies), Lunar (110% ATK + 1-turn stun), or Joker (x2 damage)."
    }
  },
  {
    "id": "tower-champion-bizare",
    "name": "Star Plantinum Requiem", category: ["JoJo", "Protagonist", "Unhuman", "Brutal", "Alternative"],
    "element": "Electric",
    "rarity": "Secret",
    "chance": 3000000,
    "requiredWeather": "Bizare",
    "towerType": "bizare",
    "towerFloor": 100,
    "unlockRequirement": "tower_floor_100_bizare",
    "stats": {
      "hp": 200000,
      "atk": 33000
    },
    "image": "assets/cards/spr.png",
    "passive": {
      "name": "SPR",
      "description": "Each attack has a 33% chance to follow up for normal attack damage; follow-ups can chain.\nCleanse effects that prevent attacking, then stun the inflicting enemy on its next turn; 2-turn cooldown.\n33% chance to survive fatal damage at 1 HP, once per match."
    }
  },
  {
    "id": "tower-champion-shadow-200",
    "name": "Shadow The World Requiem", category: ["JoJo", "Villian", "Unhuman", "Brutal", "Alternative"],
    "element": "Dark",
    "rarity": "Secret",
    "chance": 12000000,
    "requiredWeather": "Shadow",
    "towerType": "shadow",
    "towerFloor": 200,
    "unlockRequirement": "tower_floor_200_shadow",
    "stats": {
      "hp": 600000,
      "atk": 120000
    },
    "image": "assets/cards/stwr.png",
    "passive": {
      "name": "STWR",
      "description": "Each attack: 12% chance to skip the enemy turn and act again. Each kill permanently adds +12% HP and +12% ATK.\nCleanse attack-disabling effects and inflict Bleed (30% ATK/turn, 3 turns); 3-turn cooldown.\nWhile supporting, 12% chance to join an ally’s attack; both deal 120% ATK.\nCannot be cloned or revived. On death, stun all enemies for 5 turns."
    }
  }
]);
// Normal Tower Floor 200 champion; artwork is supplied by the game owner.
CARDS.push({
  id: 'tower-champion-normal-200', name: 'Reagan Ridley', category: ["Human", "Supporter", "Alternative"], element: 'Electric', rarity: 'Secret',
  chance: 1692007, requiredWeather: 'Normal', towerType: 'normal', towerFloor: 200,
  unlockRequirement: 'tower_floor_200_normal', stats: {hp: 200000, atk: 16900},
  image: 'assets/cards/reaganridley.png',
  passive: {name: 'Mad Scientist', description:
    'While supporting, every 3 allied turns create a frontline robot with 10% current max HP / ATK; max 10 active robots per side.\n'+
    'AI: replace attacks with 100% ATK damage to all enemies. Each kill heals the robot and Reagan for 10% of Reagan’s max HP.\n'+
    'On reaching the frontline, sacrifice self and grant one random living teammate Robot Armor: 50% damage reduction, +25% ATK; every 2 attacks blast up to 2 random enemies for 50% ATK each.'}
});
// Fate card data: edit each category array here. Registry lives in category.js.
CARDS.push(...[
  {
    "id": "shirou",
    "name": "Shirou",
    "category": [
      "Swordman",
      "Fate",
      "Hero",
      "Protagonist"
    ],
    "element": "Electric",
    "rarity": "Mythic",
    "chance": 850000,
    "requiredWeather": "Sugar",
    "stats": {
      "hp": 10000,
      "atk": 8000
    },
    "image": "assets/cards/shirou.png",
    "passive": {
      "name": "Rose Shield",
      "description": "Fatal hit: revive at 10% max HP and gain a shield of 100% max HP for 3 turns; once per match."
    }
  },
  {
    "id": "kiritsu",
    "name": "Kiritsu",
    "category": [
      "Fate",
      "Brutal",
      "AntiVillian"
    ],
    "element": "Fire",
    "rarity": "Mythic",
    "chance": 1850000,
    "requiredWeather": null,
    "stats": {
      "hp": 150000,
      "atk": 20000
    },
    "image": "assets/cards/kiritsu.png",
    "passive": {
      "name": "Hitman",
      "description": "Replace each attack with Pistol (50% ATK; disable target passive next turn) or Rifle (60% ATK; 60% chance of a 30% ATK follow-up, which can chain at 60%)."
    },
    "questOnly": true,
    "unlockRequirement": "quest_kiritsu"
  },
  {
    "id": "mash",
    "name": "Mash",
    "category": [
      "Hero",
      "Fate",
      "Supporter"
    ],
    "element": "Water",
    "rarity": "Mythic",
    "chance": 2900000,
    "requiredWeather": null,
    "stats": {
      "hp": 300000,
      "atk": 20000
    },
    "image": "assets/cards/mash.png",
    "passive": {
      "name": "Shield",
      "description": "While supporting: each allied turn, shield a random teammate for 25% current HP for 1 turn and grant the team +10% crit chance (does not stack). Absorb 100% of unshielded attacks against teammates without changing positions."
    }
  },
  {
    "id": "gilgamesh",
    "name": "Gilgamesh",
    "category": [
      "Villian",
      "Hero",
      "PureEvil",
      "Fate"
    ],
    "element": "Holy",
    "rarity": "Secret",
    "chance": 10000000,
    "requiredWeather": "Heavenly",
    "stats": {
      "hp": 1000000,
      "atk": 50000
    },
    "image": "assets/cards/gilgamesh.png",
    "passive": {
      "name": "King of Heros",
      "description": "Hero teammates gain +25% ATK damage while alive. Each supporting turn, give each teammate one 1-turn buff: Sword (+5% crit chance, +50% crit damage), Lance (pierce 2), or Dagger (50% follow-up; +10% chance if a follow-up skill already exists).\nEach attack hits 2 enemies. The 10th attack hits all enemies for x10 ATK."
    }
  },
  {
    "id": "cu-chalinn",
    "name": "Cu Chalinn",
    "category": [
      "Hero",
      "Swordman",
      "Fate"
    ],
    "element": "Water",
    "rarity": "Secret",
    "chance": 4500000,
    "requiredWeather": "Eclipse",
    "stats": {
      "hp": 200000,
      "atk": 50000
    },
    "image": "assets/cards/cuchalinn.png",
    "passive": {
      "name": "Gae Blog",
      "description": "Each attack: 22.5% chance to pierce 2 enemies; independently, 45% chance to hit the rearmost enemy for 80% ATK.\nRevive at 50% max HP once per match. The 5th attack after revival deals x5 damage."
    }
  },
  {
    "id": "saber-knight", evolvesFrom: 'saber',
    "name": "Saber Knight",
    "category": [
      "Hero",
      "Swordman",
      "Fate"
    ],
    "element": "Water",
    "rarity": "Mythic",
    "chance": 0,
    "requiredWeather": null,
    "stats": {
      "hp": 80000,
      "atk": 8000
    },
    "image": "assets/cards/saberknight.png",
    "passive": {
      "name": "EXCALIBURH",
      "description": "Every attack gains 1 Excalibur stack, without cap. On permanent death, strike the opposing frontline for x[Excalibur] ATK. Cannot be cloned or revived."
    },
    "evolutionOnly": true
  },
  {
    "id": "iskandar",
    "name": "Iskandar",
    "category": [
      "Army",
      "Fate",
      "Swordman",
      "Captain",
      "Hero"
    ],
    "element": "Fire",
    "rarity": "Secret",
    "chance": 5500000,
    "requiredWeather": "Sunny",
    "stats": {
      "hp": 400000,
      "atk": 27500
    },
    "image": "assets/cards/iskandar.png",
    "passive": {
      "name": "Ionian Hetairoi",
      "description": "While alive after entry, teammates gain +10% crit chance and +10% ATK. From attack 6, call a random teammate to follow up each attack.\nLast ally alive: +5% crit chance and +25% crit damage. Convert own defeated enemies into teammates with their original stats and passive; max 3 conversions per match."
    }
  },
  {
    "id": "medea",
    "name": "Medea",
    "category": [
      "Villian",
      "Fate",
      "Magician"
    ],
    "element": "Dark",
    "rarity": "Secret",
    "chance": 3200000,
    "requiredWeather": "Shadow",
    "stats": {
      "hp": 200000,
      "atk": 32000
    },
    "image": "assets/cards/medea.png",
    "passive": {
      "name": "Rule Breaker",
      "description": "32% chance to dodge passive attacks. Every 2nd attack: 20% chance to stun for 1 turn, then disable the target passive for 1 turn after stun ends. Each attack: 10% chance to hit all enemies for 150% ATK."
    }
  },
  {
    "id": "merlin",
    "name": "Merlin",
    "category": [
      "Hero",
      "Magician",
      "Fate",
      "Swordman"
    ],
    "element": "Holy",
    "rarity": "Secret",
    "chance": 1700000,
    "requiredWeather": "Sugar",
    "stats": {
      "hp": 100000,
      "atk": 17000
    },
    "image": "assets/cards/merlin.png",
    "passive": {
      "name": "Noble Phantasm",
      "description": "While supporting: each ally attack has a 17% chance of a follow-up that stuns for 1 turn. Heal the attacking ally for 5% max HP. Every 3 allied supporting turns, shield a random teammate for 50% current HP."
    }
  },
  {
    "id": "tower-champion-heavenly-200",
    "name": "Gilgamesh Chan",
    "category": [
      "AntiHero",
      "VideoGame",
      "Fate",
      "Alternative"
    ],
    "element": "Electric",
    "rarity": "Secret",
    "chance": 20000000,
    "requiredWeather": "Heavenly",
    "stats": {
      "hp": 400000,
      "atk": 36000
    },
    "image": "assets/cards/gilgameshchan.png",
    "passive": {
      "name": "Enuma English",
      "description": "After 8 attacks, supporting ally attacks have a 20% chance of a 60% ATK follow-up. 36% dodge: stun the attacker for 2 turns, then disable its passive for 1 turn.\nEach attack randomly uses Gate of Babylon (5 hits, 12% ATK each), Exterminate (60% ATK to 2 enemies), or Enkindu (50% ATK; 50% chance to stun for 1 turn)."
    },
    "towerType": "heavenly",
    "towerFloor": 200,
    "unlockRequirement": "tower_floor_200_heavenly"
  }
]);
// Halloween event cards. Seasonal acquisition rules live in spooky.js.
CARDS.push(...[
  {
    "id": "the-legion",
    "name": "The Legion",
    "element": "Fire",
    "rarity": "Mythic",
    "chance": 666333,
    "requiredWeather": null,
    "category": [
      "VideoGame",
      "Brutal",
      "Human",
      "Swordman"
    ],
    "stats": {
      "hp": 66666,
      "atk": 6666
    },
    "passive": {
      "name": "Frenzy",
      "description": "Every 4th attack: 44% chance to start a chain of 44% ATK follow-ups; each can chain at 44%. Each follow-up has a 44% chance to add Bleed for its chain count (44% ATK/turn). Reach the number of living enemies at chain start to hit all enemies for x4 ATK once per chain."
    },
    "image": "assets/cards/thelegion.png",
    "spookyExclusive": true
  },
  {
    "id": "the-clown",
    "name": "The Clown",
    "element": "Dark",
    "rarity": "Mythic",
    "chance": 333666,
    "requiredWeather": null,
    "category": [
      "VideoGame",
      "Brutal",
      "Magician",
      "Swordman"
    ],
    "stats": {
      "hp": 33333,
      "atk": 6666
    },
    "passive": {
      "name": "Potion",
      "description": "Entry and each enemy defeat: randomly choose Haste or Hindred. Haste: each attack has a 33% chance of a chainable 66% ATK follow-up. Hindred: each hit has a 33% chance to block all target follow-ups for 3 turns. Each own kill: +13.9% HP and ATK."
    },
    "image": "assets/cards/theclown.png",
    "spookyExclusive": true
  },
  {
    "id": "the-oni",
    "name": "The Oni",
    "element": "Fire",
    "rarity": "Mythic",
    "chance": 333999,
    "requiredWeather": null,
    "category": [
      "VideoGame",
      "Brutal",
      "Swordman",
      "Unhuman"
    ],
    "stats": {
      "hp": 33333,
      "atk": 9999
    },
    "passive": {
      "name": "Cursed Blood",
      "description": "Attack a bleeding enemy: gain +50% ATK for the next own turn; does not stack. If first in the lineup, gain +100% ATK for 3 own turns and every 3rd attack inflicts Bleed for 1\u20133 turns (33% current ATK/turn)."
    },
    "image": "assets/cards/theoni.png",
    "spookyExclusive": true
  },
  {
    "id": "jason-13th", evolvesFrom: 'the-trapper',
    "name": "Jason 13th",
    "element": "Water",
    "rarity": "Secret",
    "chance": 0,
    "requiredWeather": null,
    "category": [
      "Alternative",
      "Brutal",
      "PureEvil",
      "Swordman",
      "Unhuman"
    ],
    "stats": {
      "hp": 333333,
      "atk": 66666
    },
    "passive": {
      "name": "Ki ki ma ma",
      "description": "Every 5th attack prepares the next attack: Spear (200% ATK through all enemies, x0.9 per subsequent hit) or Frog (give all enemies 50% damage reduction for 3 turns). Each attack: 66% chance to heal 6% max HP. On first entry steal a random teammate passive; return it when Jason dies."
    },
    "image": "assets/cards/jason13th.png",
    "evolutionOnly": true
  },
  {
    "id": "freddy-krueger",
    "name": "Freddy Krueger",
    "element": "Dark",
    "rarity": "Secret",
    "chance": 999666,
    "requiredWeather": null,
    "category": [
      "PureEvil",
      "Villian",
      "Alternative",
      "Brutal",
      "Magician",
      "Unhuman"
    ],
    "stats": {
      "hp": 99999,
      "atk": 33333
    },
    "passive": {
      "name": "Nightmare",
      "description": "Each hit: 66% chance to inflict Hindred for 1 turn, blocking all follow-ups. After a successful Hindred, the next attack has a 6% chance to stun for 3 turns. 33% dodge; a successful dodge stuns the attacker for 1 turn."
    },
    "image": "assets/cards/freddykrueger.png",
    "spookyExclusive": true
  },
  {
    "id": "myers",
    "name": "Myers",
    "element": "Holy",
    "rarity": "Secret",
    "chance": 6666666,
    "requiredWeather": null,
    "category": [
      "PureEvil",
      "Villian",
      "Alternative",
      "Swordman",
      "Brutal",
      "Human"
    ],
    "stats": {
      "hp": 666666,
      "atk": 66666
    },
    "passive": {
      "name": "Stalking",
      "description": "Each allied supporting turn: stack +6% ATK and +3% HP. Each attack removes 66% of stored ATK bonus and 33% of stored HP bonus; base stats are unchanged. Last ally alive: execute enemies below 6% max HP. A successful execution starts a 6-turn countdown to permanent death; teammates cannot clone or revive Myers after it starts."
    },
    "image": "assets/cards/myers.png",
    "spookyExclusive": true
  }
]);
CARDS.push(...[
  {
    "id": "gojo-revice", evolvesFrom: 'gojo-young',
    "name": "Gojo Revice",
    "element": "Electric",
    "rarity": "Mythic",
    "chance": 0,
    "requiredWeather": null,
    "category": [
      "Hero",
      "Magician",
      "Jujutsu",
      "Brutal"
    ],
    "stats": {
      "hp": 88888,
      "atk": 8888
    },
    "image": "assets/cards/gojorevice.png",
    "evolutionOnly": true,
    "passive": {
      "name": "Gomen Amanai",
      "description": "88% dodge against standard attacks only; dodge bonuses cannot increase it. Each dodge adds +8% damage for 8 own turns, stacking. Four consecutive dodges prepare x8 damage on the next primary attack."
    }
  },
  {
    "id": "geto-young",
    "name": "Geto Young",
    "element": "Dark",
    "rarity": "Mythic",
    "chance": 525000,
    "requiredWeather": "Malevolent",
    "category": [
      "Jujutsu",
      "Hero",
      "Magician",
      "Army"
    ],
    "stats": {
      "hp": 52500,
      "atk": 4500
    },
    "image": "assets/cards/getoyoung.png",
    "passive": {
      "name": "Summon Technique",
      "description": "Every 3rd attack randomly replaces the normal attack: RDragon (x3 ATK to all enemies), Woman (120% ATK; stun 2 turns), or Centipede (110% ATK; Bleed 3 turns at 12% current ATK/turn)."
    }
  },
  {
    "id": "toji",
    "name": "Toji",
    "element": "Nature",
    "rarity": "Mythic",
    "chance": 3500000,
    "requiredWeather": "Malevolent",
    "category": [
      "Brutal",
      "PureEvil",
      "Jujutsu",
      "Swordman",
      "Human",
      "AntiHero"
    ],
    "stats": {
      "hp": 235000,
      "atk": 35500
    },
    "image": "assets/cards/toji.png",
    "questOnly": true,
    "unlockRequirement": "quest_toji",
    "passive": {
      "name": "Heavenly Restriction",
      "description": "Entry and each enemy defeat: choose a mode. Inverted Spear: chain 30% ATK follow-ups at 80%, then -5 percentage points per follow-up. SS Katana: 80% ATK, bypassing shields. Playful Cloud: +50% damage against the enemy with highest current HP. Thousand Chains: every 2nd attack hits 2 enemies for 60% ATK each."
    }
  }
]);
// Shibuya content: acquisition restrictions remain independent of combat categories.
CARDS.push(...[
  {
    "id": "jogo",
    "name": "Jogo",
    "element": "Fire",
    "rarity": "Secret",
    "chance": 0,
    "category": [
      "Jujutsu",
      "Villian",
      "Unhuman",
      "Brutal",
      "PureEvil"
    ],
    "stats": {
      "hp": 231000,
      "atk": 31000
    },
    "image": "assets/cards/jogo.png",
    "passive": {
      "name": "Inferno Domain",
      "description": "Below 50% HP, activate a domain: deal 20% ATK to all enemies every turn. Attacks in the domain gain 1 Meteor. On permanent death, start a Meteor-turn countdown, then hit all enemies for xMeteor ATK."
    },
    "raidOnly": true,
    "unlockRequirement": "raid_shibuya_jogo"
  },
  {
    "id": "true-mahito", evolvesFrom: 'mahito',
    "name": "True Mahito",
    "element": "Water",
    "rarity": "Secret",
    "chance": 0,
    "category": [
      "Brutal",
      "PureEvil",
      "Villian",
      "Jujutsu",
      "Swordman",
      "Unhuman"
    ],
    "stats": {
      "hp": 224000,
      "atk": 15670
    },
    "image": "assets/cards/truemahito.png",
    "passive": {
      "name": "Heni Satsu Rei Tai",
      "description": "Kills summon the victim with 25% of this card’s HP/ATK and the victim’s passive. Attacks have a 15% chance to deal x2 damage; two consecutive x2 hits unlock True Form.\nTrue Form: +100% ATK and a permanent 100% HP shield. Follow-ups deal 15% ATK; chance starts at 24%, rises by 12% per hit, and caps at 72%."
    },
    "evolutionOnly": true,
    "unlockRequirement": "evolution_true-mahito"
  },
  {
    "id": "todo",
    "name": "Todo",
    "element": "Water",
    "rarity": "Mythic",
    "chance": 530000,
    "category": [
      "Army",
      "Hero",
      "Jujutsu",
      "Supporter"
    ],
    "stats": {
      "hp": 100000,
      "atk": 5000
    },
    "image": "assets/cards/todo.png",
    "passive": {
      "name": "Besto Friendo",
      "description": "While in the backline, allies with follow-up chance at most 53% gain +5.3% follow-up chance. Once per match, block an ally’s fatal hit and swap them with the ally with the highest current HP.\nAttacks have a 53% chance to call a random ally for a follow-up dealing 53% of that ally’s ATK."
    },
    "questOnly": true,
    "unlockRequirement": "quest_todo",
    "requiredWeather": "Raining"
  },
  {
    "id": "dagon",
    "name": "Dagon",
    "element": "Water",
    "rarity": "Secret",
    "chance": 2200000,
    "category": [
      "Jujutsu",
      "Unhuman",
      "Magician",
      "Villian",
      "Brutal",
      "Army"
    ],
    "stats": {
      "hp": 400000,
      "atk": 12000
    },
    "image": "assets/cards/dagon.png",
    "passive": {
      "name": "Water Manipulation",
      "description": "Burn is instantly cleansed and grants a 50% HP shield. Every 3 attacks, summon a frontline clone with 25% HP and 100% ATK.\nClone: Shark inflicts 1-turn Bleed (25% ATK) every 2 attacks; Whales stuns its killer for 2 turns; Fish survives 3 fatal hits."
    },
    "requiredWeather": "Raining"
  },
  {
    "id": "choso",
    "name": "Choso",
    "element": "Fire",
    "rarity": "Secret",
    "chance": 3850000,
    "category": [
      "Unhuman",
      "Jujutsu",
      "AntiHero",
      "Human"
    ],
    "stats": {
      "hp": 280000,
      "atk": 32500
    },
    "image": "assets/cards/choso.png",
    "passive": {
      "name": "Blood Technique",
      "description": "Cleanse incoming Bleed and reflect it at 50% damage (3-turn cooldown). While Bleeding, use a random attack: Pierce Blood hits 4 enemies for 120% / 90% / 60% / 30% ATK; Blood Edge grants +15% crit chance and +25% crit damage for this attack; Flowing Blood deals 120% ATK and heals 10% HP."
    },
    "requiredWeather": "Eclipse"
  },
  {
    "id": "haruta",
    "name": "Haruta",
    "element": "Electric",
    "rarity": "Mythic",
    "chance": 0,
    "category": [
      "AntiHero",
      "Jujutsu",
      "Human"
    ],
    "stats": {
      "hp": 30000,
      "atk": 7500
    },
    "image": "assets/cards/haruta.png",
    "passive": {
      "name": "Coward",
      "description": "Attacking the enemy with the lowest ATK grants +200% ATK for that attack. Attacking any other enemy grants 10% incoming damage reduction until the next attack. Bonuses do not stack."
    },
    "raidOnly": true,
    "unlockRequirement": "raid_shibuya_haruta"
  },
  {
    "id": "mechamaru",
    "name": "Mechamaru",
    "element": "Electric",
    "rarity": "Secret",
    "chance": 2800000,
    "category": [
      "Jujutsu",
      "AntiHero",
      "Army",
      "Magician",
      "Supporter"
    ],
    "stats": {
      "hp": 380000,
      "atk": 18000
    },
    "image": "assets/cards/mechamaru.png",
    "passive": {
      "name": "Puppet Manipulation",
      "description": "When an ally or enemy dies permanently, summon a frontline puppet with 50% of their original HP/ATK and their passive (1 active puppet). Puppets are immune to Stun/Freeze and heal 2% HP on every attack."
    },
    "requiredWeather": "Reaper"
  },
  {
    "id": "hanami",
    "name": "Hanami",
    "element": "Nature",
    "rarity": "Mythic",
    "chance": 1820000,
    "category": [
      "Unhuman",
      "Jujutsu",
      "Brutal",
      "Magician"
    ],
    "stats": {
      "hp": 220000,
      "atk": 18200
    },
    "image": "assets/cards/hanami.png",
    "passive": {
      "name": "Flower Field",
      "description": "On entry, gain a 100% HP shield; while shielded, ignore passive attacks. Every 3 attacks, 28% chance to hypnotize the target for 1 turn: 82% chance to attack their own teammate."
    },
    "requiredWeather": "Wind"
  },
  {
    "id": "sukuna-shibuya",
    "name": "Sukuna Shibuya",
    "element": "Fire",
    "rarity": "Secret",
    "chance": 9999999,
    "category": [
      "Jujutsu",
      "PureEvil",
      "Brutal",
      "Villian",
      "AntiVillian"
    ],
    "stats": {
      "hp": 1000000,
      "atk": 9999
    },
    "image": "assets/cards/sukunashibuya.png",
    "passive": {
      "name": "FUGA x Domain",
      "description": "Every attack gains 1 Fuga and heals 3% HP. Once per match, a fatal hit revives this card at the frontline and opens a Fuga-turn domain dealing 9% ATK to all enemies every turn. If Fuga > 9, also strike all enemies for xFuga ATK on revival. Cannot be cloned or revived by allies."
    },
    "questOnly": true,
    "unlockRequirement": "quest_sukuna-shibuya",
    "requiredWeather": "Malevolent"
  }
]);
Object.freeze(CARDS);
const ALL_CARDS = CARDS;

if (typeof window !== "undefined") {
  window.CARDS = CARDS;
  window.ALL_CARDS = ALL_CARDS;
}
