// Card definitions are the source of truth for rarity, categories and acquisition.
// Edit each card directly. No post-load stat, rarity or category overrides.
// requiredWeather: null is unrestricted; a weather name gates ordinary rolls.
// Stable IDs preserve existing collection, mutation and progression saves.

const CARDS = [
  {
    id: "starter-common",
    name: "Naruto Kid",
    element: "Nature",
    rarity: "Common",
    chance: 2,
    category: ["Protagonist", "Hero", "Ninja", "Human"],
    requiredWeather: null,
    stats: { hp: 109, atk: 42 },
    passive: {
      name: "First Strike",
      description: "Each attack grants +10% ATK, up to +100%."
    },
    image: "assets/cards/narutokid.png"
  },
  {
    id: "normal-demon",
    name: "Normal Demon",
    element: "Dark",
    rarity: "Common",
    chance: 3,
    category: ["Villian", "Unhuman", "Brutal", "DemonSlayer"],
    requiredWeather: null,
    stats: { hp: 257, atk: 24 },
    passive: {
      name: "Lifesteal",
      description: "Each kill grants +10% max HP."
    },
    image: "assets/cards/normaldemon.png"
  },
  {
    id: "sasuke-kid",
    name: "Sasuke Kid",
    element: "Electric",
    rarity: "Common",
    chance: 4,
    category: ["AntiHero", "Ninja", "Human"],
    requiredWeather: null,
    stats: { hp: 144, atk: 55 },
    passive: {
      name: "Chidori",
      description: "The 3rd attack deals x2.5 ATK damage."
    },
    image: "assets/cards/sasukekid.png"
  },
  {
    id: "deku-mc",
    name: "Powerless Guy",
    element: "Nature",
    rarity: "Common",
    chance: 5,
    category: ["Human", "Alternative", "Supporter"],
    requiredWeather: null,
    stats: { hp: 296, atk: 27 },
    passive: {
      name: "What can i get you sir",
      description: "Each attack has a 20% chance to heal 20% max HP."
    },
    image: "assets/cards/dekumcdonald.png"
  },
  {
    id: "starter-rare",
    name: "Ichigo Young",
    element: "Holy",
    rarity: "Rare",
    chance: 10,
    category: ["Protagonist", "Hero", "Human", "Swordman", "Reaper", "Bleach"],
    requiredWeather: null,
    stats: { hp: 416, atk: 38 },
    passive: {
      name: "Afterimage",
      description: "5% chance to dodge incoming attacks."
    },
    image: "assets/cards/ichigobase.png"
  },
  {
    id: "gon-kid",
    name: "Gon Kid",
    element: "Nature",
    rarity: "Rare",
    chance: 25,
    category: ["Protagonist", "Hero", "Human", "Hunter"],
    requiredWeather: null,
    stats: { hp: 300, atk: 115 },
    passive: {
      name: "Rock",
      description: "First attack: 33% chance to deal x2 damage."
    },
    image: "assets/cards/gonkid.png"
  },
  {
    id: "tanjiro",
    name: "Tanjiro",
    element: "Water",
    rarity: "Rare",
    chance: 40,
    category: ["Protagonist", "Hero", "Human", "DemonSlayer", "Swordman"],
    requiredWeather: null,
    stats: { hp: 724, atk: 66 },
    passive: {
      name: "Rock",
      description: "Battle start: gain +25% max HP."
    },
    image: "assets/cards/tanjiro.png"
  },
  {
    id: "starter-epic",
    name: "Luffy Kid",
    element: "Nature",
    rarity: "Epic",
    chance: 50,
    category: ["Protagonist", "Hero", "Pirate", "Human", "Captain"],
    requiredWeather: null,
    stats: { hp: 372, atk: 142 },
    passive: {
      name: "GOMU NO MU NO PISTOL",
      description: "Every 2nd attack deals +50% ATK damage."
    },
    image: "assets/cards/luffykid.png"
  },
  {
    id: "six-seven",
    name: "Six Seven",
    element: "Dark",
    rarity: "Epic",
    chance: 67,
    category: ["Alternative", "Supporter"],
    requiredWeather: null,
    stats: { hp: 871, atk: 53 },
    passive: {
      name: "SIX SEVEN",
      description: "On first entry, Stun the active enemy for 3 turns."
    },
    image: "assets/cards/sixseven.png"
  },
  {
    id: "kaneki-ghoul",
    name: "Kaneki",
    element: "Fire",
    rarity: "Epic",
    chance: 80,
    category: ["Protagonist", "AntiHero", "Unhuman", "Brutal"],
    requiredWeather: null,
    stats: { hp: 561, atk: 137 },
    passive: {
      name: "GHOUL",
      description: "Every 3rd attack heals HP equal to 25% of the target’s current HP."
    },
    image: "assets/cards/kaneki.png"
  },
  {
    id: "the-trapper",
    name: "The Trapper",
    element: "Dark",
    rarity: "Epic",
    chance: 100,
    category: ["Villian", "VideoGame", "Brutal", "Hunter", "Human"],
    requiredWeather: null,
    stats: { hp: 454, atk: 174 },
    passive: {
      name: "Trap",
      description: "On entry: 50% chance to strike the active enemy for x5 ATK damage."
    },
    image: "assets/cards/thetrapper.png"
  },
  {
    id: "nezuko",
    name: "Nezuko",
    element: "Fire",
    rarity: "Epic",
    chance: 190,
    category: ["Unhuman", "Supporter", "DemonSlayer"],
    requiredWeather: null,
    stats: { hp: 634, atk: 242 },
    passive: {
      name: "Bleed",
      description: "Attacks apply Bleed for 2 turns (5% ATK/turn)."
    },
    image: "assets/cards/nezuko.png"
  },
  {
    id: "buggy",
    name: "Buggy",
    element: "Water",
    rarity: "Epic",
    chance: 234,
    category: ["Pirate", "Human", "AntiVillian", "Supporter", "Captain"],
    requiredWeather: null,
    stats: { hp: 1470, atk: 135 },
    passive: {
      name: "Chop Chop",
      description: "33% chance to dodge incoming attacks. Dodges do not counterattack."
    },
    image: "assets/cards/buggy.png"
  },
  {
    id: "bounty-hunter",
    name: "Bounty Hunter",
    element: "Nature",
    rarity: "Epic",
    chance: 300,
    category: ["Hunter", "Human", "Alternative", "Brutal", "Swordman", "Pirate"],
    requiredWeather: null,
    stats: { hp: 820, atk: 200 },
    passive: {
      name: "BOUNTY",
      description: "Each kill adds VNĐ equal to the defeated enemy’s recorded HP value to the victory reward."
    },
    image: "assets/cards/bountyhunter.png"
  },
  {
    id: "jotaro-kujo",
    name: "Jotaro Kujo",
    element: "Nature",
    rarity: "Epic",
    chance: 500,
    category: ["JoJo", "Protagonist", "Hero", "Human"],
    requiredWeather: null,
    stats: { hp: 865, atk: 330 },
    passive: {
      name: "Ora Ora",
      description: "Each attack: 50% chance for a follow-up dealing 40% ATK damage; that follow-up has a 25% chance for another."
    },
    image: "assets/cards/jotarokujo.png"
  },
  {
    id: "hakari",
    name: "Hakari",
    element: "Nature",
    rarity: "Epic",
    chance: 777,
    category: ["Jujutsu", "Protagonist", "Human", "Brutal"],
    requiredWeather: null,
    stats: { hp: 1110, atk: 426 },
    passive: {
      name: "Lucky Train",
      description: "On the 7th attack: 7% chance to deal x77 ATK damage."
    },
    image: "assets/cards/hakari.png"
  },
  {
    id: "saber",
    name: "Saber",
    element: "Water",
    rarity: "Epic",
    chance: 800,
    category: ["Fate", "Hero", "Protagonist", "Swordman"],
    requiredWeather: null,
    stats: { hp: 1040, atk: 399 },
    passive: {
      name: "EXCALIBUR!!!",
      description: "The 8th attack deals x8 damage."
    },
    image: "assets/cards/saber.png"
  },
  {
    id: "jonathan-joestar",
    name: "Jonathan Joestar",
    element: "Electric",
    rarity: "Epic",
    chance: 900,
    category: ["JoJo", "Protagonist", "Hero", "Human", "Swordman"],
    requiredWeather: null,
    stats: { hp: 1090, atk: 418 },
    passive: {
      name: "HAMONNN",
      description: "On the 9th attack, gain +900% ATK for the rest of the match."
    },
    image: "assets/cards/jonathanjoestar.png"
  },
  {
    id: "starter-legendary",
    name: "Son Goku",
    element: "Electric",
    rarity: "Legendary",
    chance: 1000,
    category: ["DragonWarrior", "Protagonist", "Hero", "Unhuman"],
    requiredWeather: null,
    stats: { hp: 1230, atk: 471 },
    passive: {
      name: "Kamehameha",
      description: "Every 5th attack strikes 10 times for 10% ATK damage per hit."
    },
    image: "assets/cards/songoku.png"
  },
  {
    id: "vegeta",
    name: "Vegeta",
    element: "Water",
    rarity: "Legendary",
    chance: 1001,
    category: ["DragonWarrior", "AntiHero", "Unhuman", "Brutal", "PlanetDestroyer"],
    requiredWeather: null,
    stats: { hp: 1310, atk: 501 },
    passive: {
      name: "Super Vegeta",
      description: "Below 25% max HP, deal +100% ATK damage."
    },
    image: "assets/cards/vegeta.png"
  },
  {
    id: "kakashi",
    name: "Kakashi",
    element: "Electric",
    rarity: "Legendary",
    chance: 4900,
    category: ["Ninja", "Human", "Hero", "Captain"],
    requiredWeather: null,
    stats: { hp: 4960, atk: 454 },
    passive: {
      name: "Kamui",
      description: "22% chance to dodge incoming attacks. Dodges do not counterattack."
    },
    image: "assets/cards/kakashi.png"
  },
  {
    id: "kr-kuuga",
    name: "Kamen Rider Kuuga",
    element: "Nature",
    rarity: "Legendary",
    chance: 20000,
    category: ["Hero", "Protagonist", "Unhuman"],
    requiredWeather: null,
    stats: { hp: 5110, atk: 1250 },
    passive: {
      name: "KUUGA",
      description: "Every 3rd own attack turn changes form. Follow-ups do not advance the rotation.\nBlue: +20% crit chance. Green: +50% crit damage. Purple: +30% max HP while in this form."
    },
    image: "assets/cards/krkuuga.png"
  },
  {
    id: "bulma",
    name: "Bulma",
    element: "Nature",
    rarity: "Legendary",
    chance: 3080,
    category: ["Supporter", "Human", "Alternative", "Mastermind", "DragonWarrior"],
    requiredWeather: null,
    stats: { hp: 4350, atk: 266 },
    passive: {
      name: "WISH",
      description: "Each allied turn while not attacking: 10% chance to grant the active attacker +30% damage for that attack."
    },
    image: "assets/cards/bulma.png"
  },
  {
    id: "denji",
    name: "Denji",
    element: "Fire",
    rarity: "Legendary",
    chance: 3333,
    category: ["Protagonist", "AntiHero", "Unhuman", "Brutal"],
    requiredWeather: null,
    stats: { hp: 1850, atk: 705 },
    passive: {
      name: "POCHITA",
      description: "Each attack has a 33% chance for a follow-up. Follow-ups can trigger another follow-up."
    },
    image: "assets/cards/denji.png"
  },
  {
    id: "uchiha-itachi",
    name: "Uchiha Itachi",
    element: "Fire",
    rarity: "Legendary",
    chance: 5500,
    category: ["Ninja", "Human", "AntiHero", "Brutal", "Mastermind"],
    requiredWeather: null,
    stats: { hp: 2260, atk: 862 },
    passive: {
      name: "Amaterasu",
      description: "Each attack: 30% chance to apply Burn for 3 turns (5% ATK/turn) and immediately follow up."
    },
    image: "assets/cards/uchihaitachi.png"
  },
  {
    id: "madness-doctor",
    name: "Madness Doctor",
    element: "Electric",
    rarity: "Legendary",
    chance: 10101,
    category: ["Villian", "Brutal", "Alternative", "Mastermind"],
    requiredWeather: null,
    stats: { hp: 9100, atk: 81 },
    passive: {
      name: "Madness",
      description: "Every 2nd attack: 40% chance to reduce the target’s ATK by 5%."
    },
    image: "assets/cards/madnessdoctor.png"
  },
  {
    id: "erza",
    name: "Erza",
    element: "Holy",
    rarity: "Legendary",
    chance: 12120,
    category: ["Swordman", "Magician", "Hero", "Human"],
    requiredWeather: null,
    stats: { hp: 6190, atk: 568 },
    passive: {
      name: "MAGIC ARMOR",
      description: "Below 50% max HP, become immune to enemy passive effects."
    },
    image: "assets/cards/erza.png"
  },
  {
    id: "yuji-itadori",
    name: "Yuji Itadori",
    element: "Fire",
    rarity: "Legendary",
    chance: 17000,
    category: ["Jujutsu", "Protagonist", "Hero", "Human", "Brutal"],
    requiredWeather: null,
    stats: { hp: 3540, atk: 1350 },
    passive: {
      name: "BLACK FLASH",
      description: "Each attack has a 33% chance to deal x3 ATK damage."
    },
    image: "assets/cards/yujiitadori.png"
  },
  {
    id: "guts",
    name: "Guts",
    element: "Dark",
    rarity: "Mythic",
    chance: 18888,
    category: ["Berserk", "Protagonist", "AntiHero", "Swordman", "Human", "Brutal"],
    requiredWeather: null,
    stats: { hp: 3990, atk: 1520 },
    passive: {
      name: "OUTRAGE",
      description: "33% chance to enter Berserker mode. In Berserker mode, attacks apply Bleed for 2 turns (10% ATK/turn)."
    },
    image: "assets/cards/guts.png"
  },
  {
    id: "polnareff",
    name: "Polnareff",
    element: "Nature",
    rarity: "Mythic",
    chance: 36000,
    category: ["JoJo", "Supporter", "Human", "Swordman", "Hero"],
    requiredWeather: null,
    stats: { hp: 6880, atk: 1680 },
    passive: {
      name: "SILVER CHARIOT",
      description: "Below 25% max HP, deal +100% ATK damage."
    },
    image: "assets/cards/polnareff.png"
  },
  {
    id: "the-flash",
    name: "The Flash",
    element: "Electric",
    rarity: "Mythic",
    chance: 52000,
    category: ["Hero", "Human", "Protagonist", "Alternative"],
    requiredWeather: null,
    stats: { hp: 12000, atk: 1100 },
    passive: {
      name: "FLASH",
      description: "60% dodge chance. After more than 3 consecutive successful dodges, die from a heart attack."
    },
    image: "assets/cards/theflash.png"
  },
  {
    id: "rimuru",
    name: "Rimuru",
    element: "Water",
    rarity: "Mythic",
    chance: 81208,
    category: ["Protagonist", "Unhuman", "Magician", "Supporter", "Isekai"],
    requiredWeather: null,
    stats: { hp: 7700, atk: 1880 },
    passive: {
      name: "SLIME",
      description: "Each kill grants 1 Slime Point, +30% ATK and +20% max HP. A fatal hit consumes 1 Slime Point to survive."
    },
    image: "assets/cards/rimuru.png"
  },
  {
    id: "starter-secret",
    name: "The Truth",
    element: "Holy",
    rarity: "Mythic",
    chance: 100000,
    category: ["Unhuman", "Alternative", "Magician"],
    requiredWeather: null,
    stats: { hp: 13400, atk: 1230 },
    passive: {
      name: "Omniscience",
      description: "Immune to enemy passive effects."
    },
    image: "assets/cards/thetruth.png"
  },
  {
    id: "viltrumite",
    name: "Viltrumite",
    element: "Holy",
    rarity: "Mythic",
    chance: 222000,
    category: ["Unhuman", "Villian", "Brutal", "PlanetDestroyer"],
    requiredWeather: null,
    stats: { hp: 10700, atk: 4090 },
    passive: {
      name: "PUNCH",
      description: "Every 3rd attack: 33% chance to deal +222% ATK damage."
    },
    image: "assets/cards/viltrumite.png"
  },
  {
    id: "mahito",
    name: "Mahito",
    element: "Dark",
    rarity: "Epic",
    chance: 7927,
    category: ["Jujutsu", "Villian", "Unhuman", "Brutal", "PureEvil"],
    requiredWeather: "Eclipsed",
    stats: { hp: 3750, atk: 918 },
    passive: {
      name: "Idle Transfiguration",
      description: "Killing an enemy below 10% max HP grants 1 Soul. Spend Souls to clear debuffs, 1 per Soul."
    },
    image: "assets/cards/mahito.png"
  },
  {
    id: "blackbeard",
    name: "BlackBeard",
    element: "Dark",
    rarity: "Legendary",
    chance: 40000,
    category: ["Pirate", "Villian", "Human", "Brutal", "Captain"],
    requiredWeather: "Shadow",
    stats: { hp: 6240, atk: 1520 },
    passive: {
      name: "Liberation",
      description: "Each kill grants ATK equal to 25% of the defeated enemy’s ATK."
    },
    image: "assets/cards/blackbeard.png"
  },
  {
    id: "garp",
    name: "Garp",
    element: "Nature",
    rarity: "Legendary",
    chance: 38922,
    category: ["Human", "Captain", "Hero", "Brutal", "Army"],
    requiredWeather: null,
    stats: { hp: 4940, atk: 1890 },
    passive: {
      name: "Fist of Love",
      description: "The 3rd attack Stuns for 2 turns. If an enemy dies before that attack, deal x2 damage to the next enemy once per match."
    },
    image: "assets/cards/garp.png"
  },
  {
    id: "erwin",
    name: "Erwin",
    element: "Fire",
    rarity: "Legendary",
    chance: 77550,
    category: ["Captain", "Human", "Army", "Hero", "TitanSlayer"],
    requiredWeather: null,
    stats: { hp: 15200, atk: 135 },
    passive: {
      name: "CAPTAIN",
      description: "Starting in the first slot grants all teammates +100% ATK for the match."
    },
    image: "assets/cards/erwin.png"
  },
  {
    id: "boa-hancock",
    name: "Boa Hancock",
    element: "Fire",
    rarity: "Legendary",
    chance: 69000,
    category: ["Pirate", "Human", "AntiVillian", "Captain"],
    requiredWeather: "Sugar",
    stats: { hp: 5770, atk: 2200 },
    passive: {
      name: "Mero Mero",
      description: "Every 2nd attack: 69% chance to Freeze for 1 turn. Deal x1.5 damage to frozen targets."
    },
    image: "assets/cards/boahancock.png"
  },
  {
    id: "senku",
    name: "Senku",
    element: "Nature",
    rarity: "Rare",
    chance: 550,
    category: ["Human", "Supporter", "Alternative", "Mastermind"],
    requiredWeather: null,
    stats: { hp: 2470, atk: 22 },
    passive: {
      name: "Chemistry",
      description: "At the start of allied turns while not attacking, heal the living team for 2.5% max HP. Bleed blocks healing."
    },
    image: "assets/cards/senku.png"
  },
  {
    id: "grimmjaw",
    name: "Grimmjaw",
    element: "Water",
    rarity: "Legendary",
    chance: 65000,
    category: ["Unhuman", "AntiVillian", "Brutal", "Reaper", "Bleach"],
    requiredWeather: "Reaper",
    stats: { hp: 6550, atk: 2500 },
    passive: {
      name: "Gran Rey Cero",
      description: "The 5th attack hits all enemies for x2 ATK damage."
    },
    image: "assets/cards/grimmjaw.png"
  },
  {
    id: "reigen",
    name: "Reigen",
    element: "Water",
    rarity: "Mythic",
    chance: 500000,
    category: ["Human", "Supporter", "Alternative", "Mastermind"],
    requiredWeather: null,
    stats: { hp: 35100, atk: 312 },
    passive: {
      name: "Scam",
      description: "On entry: copy a random living teammate’s passive. If alone, gain +200% ATK and +100% max HP; disable the passive.\nBasic attacks still work while the passive is disabled."
    },
    image: "assets/cards/reigen.png"
  },
  {
    id: "kamen-rider-kabuto",
    name: "Kamen Rider Kabuto",
    element: "Holy",
    rarity: "Mythic",
    chance: 370000,
    category: ["Hero", "Protagonist", "Human"],
    requiredWeather: null,
    stats: { hp: 11300, atk: 4320 },
    passive: {
      name: "CLOCK UP",
      description: "Each attack: 10% chance for a follow-up that Stuns for 1 turn. Follow-ups can chain. Attacking a Stunned target heals 5% max HP."
    },
    image: "assets/cards/krkabuto.png"
  },
  {
    id: "meruem",
    name: "Meruem",
    element: "Nature",
    rarity: "Mythic",
    chance: 740000,
    category: ["Villian", "Unhuman", "Brutal", "AntiVillian", "Mastermind"],
    requiredWeather: null,
    stats: { hp: 34600, atk: 3170 },
    passive: {
      name: "Aura Synthesis",
      description: "When hit, gain 1 Aura stack (max 5); each grants +10% crit damage. First reaching 5 stacks heals 5% max HP."
    },
    image: "assets/cards/meruem.png"
  },
  {
    id: "frieza",
    name: "Frieza",
    element: "Electric",
    rarity: "Legendary",
    chance: 76900,
    category: ["Villian", "Unhuman", "Brutal", "PureEvil", "PlanetDestroyer", "Army"],
    requiredWeather: null,
    stats: { hp: 8750, atk: 2140 },
    passive: {
      name: "Telekinesis",
      description: "On entry, sort the enemy lineup by ATK, lowest first."
    },
    image: "assets/cards/frieza.png"
  },
  {
    id: "adam-francis",
    name: "Adam Francis",
    element: "Holy",
    rarity: "Epic",
    chance: 6970,
    category: ["VideoGame", "Human", "Supporter", "Alternative"],
    requiredWeather: null,
    stats: { hp: 2680, atk: 1020 },
    passive: {
      name: "Champion of Light",
      description: "Each attack: 20% chance to Stun for 1 turn. After Stun ends, the target deals 18% less damage."
    },
    image: "assets/cards/adamfrancis.png"
  },
  {
    id: "katakuri",
    name: "Katakuri",
    element: "Nature",
    rarity: "Mythic",
    chance: 207000,
    category: ["Pirate", "AntiVillian", "Human", "Brutal"],
    requiredWeather: "Sugar",
    stats: { hp: 20800, atk: 1910 },
    passive: {
      name: "MOCHI",
      description: "Each attack: 27% chance to reduce target ATK by 10% and heal 10% max HP. Also has 7% dodge."
    },
    image: "assets/cards/katakuri.png"
  },
  {
    id: "whitebeard",
    name: "WhiteBeard",
    element: "Holy",
    rarity: "Mythic",
    chance: 500100,
    category: ["Pirate", "Captain", "Human", "Brutal", "Army"],
    requiredWeather: null,
    stats: { hp: 12700, atk: 4870 },
    passive: {
      name: "Quake Hermit",
      description: "The 4th attack hits the 2 nearest enemies for x3 ATK damage and Stuns them for 2 turns."
    },
    image: "assets/cards/whitebeard.png"
  },
  {
    id: "doppio",
    name: "Doppio",
    element: "Holy",
    rarity: "Rare",
    chance: 1450,
    category: ["JoJo", "Villian", "Human", "Supporter", "Alternative"],
    requiredWeather: "Shadow",
    stats: { hp: 2650, atk: 243 },
    passive: {
      name: "FROG",
      description: "When hit: 20% chance to gain +20% ATK. Stacks up to +2000% and lasts for the match."
    },
    image: "assets/cards/dopio.png"
  },
  {
    id: "shanks",
    name: "Shanks",
    element: "Fire",
    rarity: "Legendary",
    chance: 24740,
    category: ["Pirate", "Captain", "Human", "Hero", "Swordman", "Brutal"],
    requiredWeather: null,
    stats: { hp: 5150, atk: 1260 },
    passive: {
      name: "HAKI",
      description: "30% dodge chance. Each successful dodge grants +25% damage to the next attack."
    },
    image: "assets/cards/shanks.png"
  },
  {
    id: "metal-cooler",
    name: "Metal Cooler",
    element: "Electric",
    rarity: "Legendary",
    chance: 80008,
    category: ["Villian", "Unhuman", "Brutal", "PlanetDestroyer", "Army"],
    requiredWeather: null,
    stats: { hp: 7660, atk: 1870 },
    passive: {
      name: "CLONE",
      description: "When an original teammate takes a fatal hit, create a Clone behind Metal Cooler with 50% of that teammate’s current max HP/ATK and its passive.\nNo creation cap. Generated units cannot trigger this effect or create companions."
    },
    image: "assets/cards/metalcooler.png"
  },
  {
    id: "gohan",
    name: "Gohan",
    element: "Electric",
    rarity: "Legendary",
    chance: 85000,
    category: ["DragonWarrior", "Hero", "Human", "Protagonist"],
    requiredWeather: null,
    stats: { hp: 7290, atk: 2780 },
    passive: {
      name: "MASENKO",
      description: "Target the enemy with the highest ATK and deal x2 damage."
    },
    image: "assets/cards/gohan.png"
  },
  {
    id: "yuno",
    name: "Yuno",
    element: "Nature",
    rarity: "Mythic",
    chance: 300000,
    category: ["Magician", "Human", "Protagonist"],
    requiredWeather: null,
    stats: { hp: 12100, atk: 4610 },
    passive: {
      name: "Zephyr Bow",
      description: "Each attack: 45% chance to pierce the next enemy for 100% ATK; a successful pierce has a 15% chance to continue."
    },
    image: "assets/cards/yuno.png"
  },
  {
    id: "asta",
    name: "Asta",
    element: "Dark",
    rarity: "Mythic",
    chance: 333000,
    category: ["Protagonist", "Hero", "Human", "Swordman", "Brutal"],
    requiredWeather: null,
    stats: { hp: 25200, atk: 2310 },
    passive: {
      name: "ANTI MAGIC",
      description: "Enemy passive attacks have a 50% chance to be reflected at 50% efficiency."
    },
    image: "assets/cards/asta.png"
  },
  {
    id: "asta-demon",
    name: "Demon Asta",
    element: "Dark",
    rarity: "Secret",
    chance: 3333333,
    category: ["Protagonist", "AntiHero", "Unhuman", "Swordman", "Brutal"],
    requiredWeather: null,
    stats: { hp: 34000, atk: 8320 },
    passive: {
      name: "ANTI MAGIC BOOK",
      description: "On each own attack turn, randomly use one mode; follow-ups retain the current mode:\nDemon Slayer: 165% ATK damage, 75% chance to Stun for 1 turn, 25% chance to reflect incoming damage.\nDemon Dweller: 150% ATK + 35% of the last hit received; take 15% less damage."
    },
    image: "assets/cards/astademon.png"
  },
  {
    id: "nami",
    name: "Nami",
    element: "Water",
    rarity: "Rare",
    chance: 45,
    category: ["Pirate", "Human", "Supporter"],
    requiredWeather: "Raining",
    stats: { hp: 844, atk: 8 },
    passive: {
      name: "Greedy",
      description: "While on the team, winning grants +100% eligible battle rewards."
    },
    image: "assets/cards/nami.png"
  },
  {
    id: "giyu-tomioka",
    name: "Giyu Tomioka",
    element: "Water",
    rarity: "Epic",
    chance: 400,
    category: ["DemonSlayer", "Swordman", "Human", "Hero"],
    requiredWeather: "Raining",
    stats: { hp: 1470, atk: 135 },
    passive: {
      name: "Dead Calm",
      description: "The 5th attack Stuns the target for 1 turn and grants immunity to incoming attacks for 3 turns."
    },
    image: "assets/cards/giyutomioka.png"
  },
  {
    id: "sea-beast",
    name: "Sea Beast",
    element: "Water",
    rarity: "Epic",
    chance: 1200,
    category: ["Unhuman", "Villian", "Brutal", "Hunter"],
    requiredWeather: "Raining",
    stats: { hp: 3140, atk: 28 },
    passive: {
      name: "Big Fish",
      description: "Intercept attacks against teammates and take the damage in their place."
    },
    image: "assets/cards/seabeast.png"
  },
  {
    id: "arlong",
    name: "Arlong",
    element: "Water",
    rarity: "Epic",
    chance: 2400,
    category: ["Villian", "Unhuman", "Pirate", "Brutal", "Captain"],
    requiredWeather: "Raining",
    stats: { hp: 3730, atk: 341 },
    passive: {
      name: "ZAWATER",
      description: "Enemies attacking this card have a 24% chance to miss."
    },
    image: "assets/cards/arlong.png"
  },
  {
    id: "aquaman",
    name: "Aquaman",
    element: "Water",
    rarity: "Epic",
    chance: 22222,
    category: ["Hero", "Unhuman", "Captain"],
    requiredWeather: "Raining",
    stats: { hp: 9070, atk: 832 },
    passive: {
      name: "AQUARIUM",
      description: "During Raining, take 50% less incoming damage."
    },
    image: "assets/cards/aquaman.png"
  },
  {
    id: "noelle-silva",
    name: "Noelle Silva",
    element: "Water",
    rarity: "Epic",
    chance: 400000,
    category: ["Magician", "Supporter", "Human", "Hero"],
    requiredWeather: "Raining",
    stats: { hp: 25100, atk: 2300 },
    passive: {
      name: "Tsunami Water",
      description: "On entry, hit all enemies for 100% ATK. If the wave kills an enemy, gain a Water Shield equal to 100% max HP."
    },
    image: "assets/cards/noellesilva.png"
  },
  {
    id: "weather-report",
    name: "Weather Report",
    element: "Nature",
    rarity: "Mythic",
    chance: 650000,
    category: ["JoJo", "Supporter", "Magician"],
    requiredWeather: "Raining",
    stats: { hp: 30400, atk: 2790 },
    passive: {
      name: "BUBBLE CONTROL",
      description: "Every 3 own turns, gain a Weather Shield equal to 30% current max HP until its next own turn. If an enemy destroys it, turn that enemy into a Snail for 2 turns."
    },
    image: "assets/cards/weatherreaport.png"
  },
  {
    id: "piccolo",
    name: "Piccolo",
    element: "Nature",
    rarity: "Mythic",
    chance: 780000,
    category: ["DragonWarrior", "Unhuman", "Hero", "Supporter", "Brutal"],
    requiredWeather: "Raining",
    stats: { hp: 32700, atk: 3000 },
    passive: {
      name: "AURA FARMER",
      description: "Each turn without attacking grants +10% ATK damage, with no stack cap. Attacking removes 1 stack."
    },
    image: "assets/cards/picolo.png"
  },
  {
    id: "peashooter",
    name: "Peashooter",
    element: "Nature",
    rarity: "Common",
    chance: 100,
    category: ["VideoGame", "Supporter", "Alternative", "Unhuman"],
    requiredWeather: "Sunny",
    stats: { hp: 981, atk: 90 },
    passive: {
      name: "Plant",
      description: "Below 30% max HP, heal 5% max HP each own turn."
    },
    image: "assets/cards/peashooter.png"
  },
  {
    id: "hutao",
    name: "Hutao",
    element: "Fire",
    rarity: "Legendary",
    chance: 2020,
    category: ["VideoGame", "Magician", "Human"],
    requiredWeather: "Sunny",
    stats: { hp: 1630, atk: 624 },
    passive: {
      name: "Fire Burst",
      description: "Attacks apply Burn for 2 turns (50% ATK/turn)."
    },
    image: "assets/cards/hutao.png"
  },
  {
    id: "weather-solar-deity",
    name: "Escanor",
    element: "Fire",
    rarity: "Legendary",
    chance: 2500,
    category: ["Sins", "Hero", "Human", "Brutal"],
    requiredWeather: "Sunny",
    stats: { hp: 1780, atk: 679 },
    passive: {
      name: "SUNNY",
      description: "During Sunny, deal x2 ATK damage."
    },
    image: "assets/cards/escanor.png"
  },
  {
    id: "builderman",
    name: "Builderman",
    element: "Holy",
    rarity: "Mythic",
    chance: 250000,
    category: ["VideoGame", "Supporter", "Alternative"],
    requiredWeather: "Sunny",
    stats: { hp: 22400, atk: 2060 },
    passive: {
      name: "DEVELOPER",
      description: "On each own turn, store 10% of the active enemy’s ATK as Tower Power. If it dies while Builderman lives, convert stored power into HP."
    },
    image: "assets/cards/builderman.png"
  },
  {
    id: "aatrox",
    name: "Aatrox",
    element: "Dark",
    rarity: "Legendary",
    chance: 6666,
    category: ["VideoGame", "Unhuman", "Brutal", "Swordman", "Villian"],
    requiredWeather: "Eclipse",
    stats: { hp: 5260, atk: 483 },
    passive: {
      name: "WORLD ENDER",
      description: "Each attack heals 5% max HP."
    },
    image: "assets/cards/aatrox.png"
  },
  {
    id: "weather-eclipse-harvester",
    name: "Griffith",
    element: "Dark",
    rarity: "Legendary",
    chance: 8000,
    category: ["Villian", "Unhuman", "Brutal", "AntiVillian", "Berserk", "Swordman"],
    requiredWeather: "Eclipse",
    stats: { hp: 2830, atk: 1080 },
    passive: {
      name: "ECLIPSED",
      description: "On entry, sacrifice living teammates and gain +100% ATK per teammate sacrificed."
    },
    image: "assets/cards/griffith.png"
  },
  {
    id: "dante-limbus",
    name: "Dante Limbus",
    element: "Fire",
    rarity: "Legendary",
    chance: 10000,
    category: ["VideoGame", "Protagonist", "Human", "Swordman", "Brutal"],
    requiredWeather: "Eclipse",
    stats: { hp: 6000, atk: 367 },
    passive: {
      name: "M@!L%#TH",
      description: "Once per match, an enemy defeated by a fatal attack allows one teammate to revive with Dante’s stats and its own passive."
    },
    image: "assets/cards/dantelimbus.png"
  },
  {
    id: "adult-gon",
    name: "Adult Gon",
    element: "Dark",
    rarity: "Secret",
    chance: 2500000,
    category: ["Protagonist", "Hunter", "Human", "Brutal"],
    requiredWeather: "Eclipse",
    stats: { hp: 48500, atk: 4450 },
    passive: {
      name: "END!!!",
      description: "Each attack: 25% chance for x4 ATK damage. Below 10% max HP, the chance becomes 50% and damage becomes x6 ATK."
    },
    image: "assets/cards/adultgon.png"
  },
  {
    id: "rukia",
    name: "Rukia",
    element: "Water",
    rarity: "Legendary",
    chance: 1350,
    category: ["Reaper", "Swordman", "Supporter", "Human", "Hero", "Bleach"],
    requiredWeather: "Snowing",
    stats: { hp: 1390, atk: 531 },
    passive: {
      name: "Freeze",
      description: "Each attack: 10% chance to Freeze for 1 turn. Deal +35% damage to frozen targets."
    },
    image: "assets/cards/rukia.png"
  },
  {
    id: "ice-admiral",
    name: "Ice Admiral",
    element: "Water",
    rarity: "Legendary",
    chance: 5000,
    category: ["Human", "Magician", "Captain", "Villian", "Army"],
    requiredWeather: "Snowing",
    stats: { hp: 2350, atk: 896 },
    passive: {
      name: "Ice Age",
      description: "Critical hits have a 33% chance to Freeze the target for 1 turn."
    },
    image: "assets/cards/iceadmiral.png"
  },
  {
    id: "weather-frost-sovereign",
    name: "Esdeath",
    element: "Water",
    rarity: "Legendary",
    chance: 12000,
    category: ["Villian", "Human", "Magician", "Brutal", "PureEvil", "Captain", "Army", "Swordman"],
    requiredWeather: "Snowing",
    stats: { hp: 3080, atk: 1180 },
    passive: {
      name: "Absolute Zero",
      description: "Critical hits have a 67% chance to Freeze the target for 1 turn."
    },
    image: "assets/cards/esdeath.png"
  },
  {
    id: "toshiro",
    name: "Toshiro",
    element: "Water",
    rarity: "Legendary",
    chance: 26000,
    category: ["Reaper", "Swordman", "Human", "Hero", "Bleach", "Captain"],
    requiredWeather: "Snowing",
    stats: { hp: 4200, atk: 1600 },
    passive: {
      name: "Absolute Zero",
      description: "On its fifth own turn, gain +50% ATK. Later attacks have a 50% chance to Stun for 1 turn."
    },
    image: "assets/cards/toshiro.png"
  },
  {
    id: "android-21",
    name: "Android 21",
    element: "Electric",
    rarity: "Mythic",
    chance: 150000,
    category: ["AntiVillian", "Unhuman", "Magician", "Brutal", "VideoGame", "DragonWarrior"],
    requiredWeather: "Sugar",
    stats: { hp: 10600, atk: 2590 },
    passive: {
      name: "Sweet Destruction",
      description: "On kill: heal 30% of the victim’s max HP; gain +20% HP/ATK for 2 turns.\nAfter facing an enemy for more than 3 turns, absorb 50% of its base ATK and prevent it from dodging this card."
    },
    image: "assets/cards/android21.png"
  },
  {
    id: "yuta-okkotsu",
    name: "Yuta Okkotsu",
    element: "Holy",
    rarity: "Mythic",
    chance: 191022,
    category: ["Jujutsu", "Protagonist", "Human", "Swordman", "Hero"],
    requiredWeather: "Sugar",
    stats: { hp: 18700, atk: 1710 },
    passive: {
      name: "Cursed Love",
      description: "Once per match, survive a fatal hit at 50% max HP, heal another 25% max HP and gain +50% ATK."
    },
    image: "assets/cards/yutaokkotsu.png"
  },
  {
    id: "luffy-nightmare",
    name: "Luffy Nightmare",
    element: "Dark",
    rarity: "Legendary",
    chance: 9300,
    category: ["Pirate", "Protagonist", "Brutal", "Berserk", "Unhuman", "Captain"],
    requiredWeather: "Shadow",
    stats: { hp: 5570, atk: 510 },
    passive: {
      name: "ENHANCE",
      description: "When hit, reflect 50% of the damage received to the attacker."
    },
    image: "assets/cards/luffynightmare.png"
  },
  {
    id: "weather-shadow-monarch",
    name: "Igris",
    element: "Dark",
    rarity: "Legendary",
    chance: 18000,
    category: ["Supporter", "Unhuman", "Swordman", "Army"],
    requiredWeather: "Shadow",
    stats: { hp: 4530, atk: 1110 },
    passive: {
      name: "SHADOW KNIGHT",
      description: "Each attack has a 30% chance to call a teammate for one follow-up attack."
    },
    image: "assets/cards/igris.png"
  },
  {
    id: "cid-shadow",
    name: "Cid Atomic",
    element: "Dark",
    rarity: "Legendary",
    chance: 30000,
    category: ["Protagonist", "Swordman", "Human", "Magician", "Isekai"],
    requiredWeather: "Shadow",
    stats: { hp: 3780, atk: 1440 },
    passive: {
      name: "I AM ATMOIC !!!",
      description: "Every 10th attack hits all enemies for x100 ATK damage."
    },
    image: "assets/cards/cidatomic.png"
  },
  {
    id: "enderman",
    name: "Enderman",
    element: "Dark",
    rarity: "Legendary",
    chance: 99999,
    category: ["VideoGame", "Unhuman", "Brutal"],
    requiredWeather: "Shadow",
    stats: { hp: 16600, atk: 1520 },
    passive: {
      name: "PEARL",
      description: "Survive one fatal hit at 1 HP per match."
    },
    image: "assets/cards/enderman.png"
  },
  {
    id: "homura-akemi",
    name: "Homura Akemi",
    element: "Dark",
    rarity: "Mythic",
    chance: 199208,
    category: ["Magician", "Protagonist", "AntiHero", "Human"],
    requiredWeather: "Shadow",
    stats: { hp: 21300, atk: 1300 },
    passive: {
      name: "Time Manipulation",
      description: "Once per match, a heal crossing from below 60% to at least 60% max HP on this card or an ally Freezes an enemy for 5 turns."
    },
    image: "assets/cards/homura.png"
  },
  {
    id: "kr-decade",
    name: "Kamen Rider Decade",
    element: "Dark",
    rarity: "Mythic",
    chance: 200000,
    category: ["Hero", "Protagonist", "Human", "Alternative"],
    requiredWeather: "Shadow",
    stats: { hp: 10100, atk: 2470 },
    passive: {
      name: "Rider Card",
      description: "On entry, copy an enemy card and its passive while keeping this card’s own HP/ATK."
    },
    image: "assets/cards/krdecade.png"
  },
  {
    id: "uchiha-sasuke",
    name: "Uchiha Sasuke",
    element: "Electric",
    rarity: "Mythic",
    chance: 550000,
    category: ["Ninja", "AntiHero", "Human", "Swordman", "Brutal"],
    requiredWeather: "Shadow",
    stats: { hp: 14200, atk: 5440 },
    passive: {
      name: "Storm Susano",
      description: "Each attack: 15% chance for a follow-up that applies Burn for 3 turns (25% ATK/turn).\nBelow 40% HP: gain +60% ATK and 30% damage reduction for 6 turns."
    },
    image: "assets/cards/uchihasasuke.png"
  },
  {
    id: "light-admiral",
    name: "Light Admiral",
    element: "Electric",
    rarity: "Mythic",
    chance: 7000,
    category: ["Human", "Magician", "Captain", "Villian", "Army"],
    requiredWeather: "Heavenly",
    stats: { hp: 5370, atk: 492 },
    passive: {
      name: "Light Speed",
      description: "20% dodge chance. A successful dodge Stuns the attacker for 1 turn."
    },
    image: "assets/cards/kizaru.png"
  },
  {
    id: "gojo-young",
    name: "Gojo Young",
    element: "Electric",
    rarity: "Mythic",
    chance: 8888,
    category: ["Jujutsu", "Hero", "Human", "Brutal", "Magician"],
    requiredWeather: "Heavenly",
    stats: { hp: 5090, atk: 466 },
    passive: {
      name: "Infinity",
      description: "88% chance to dodge standard incoming attacks. Cannot dodge passive attacks."
    },
    image: "assets/cards/gojoyoung.png"
  },
  {
    id: "weather-heavenly-seraph",
    name: "The First Human",
    element: "Holy",
    rarity: "Mythic",
    chance: 30000,
    category: ["Unhuman", "Villian", "Brutal", "PureEvil"],
    requiredWeather: "Heavenly",
    stats: { hp: 5560, atk: 1360 },
    passive: {
      name: "Ascension",
      description: "When targeted by a passive attack, copies the attacker’s passive for 3 own turns, then loses it. Cooldown: 5 own turns after the copy expires."
    },
    image: "assets/cards/adamror.png"
  },
  {
    id: "sailor-moon",
    name: "Sailor Moon",
    element: "Holy",
    rarity: "Mythic",
    chance: 70007,
    category: ["Hero", "Protagonist", "Magician", "Human", "Supporter"],
    requiredWeather: "Heavenly",
    stats: { hp: 7260, atk: 1770 },
    passive: {
      name: "Moon Manipulation",
      description: "Winning a 1v1 battle has a 20% chance to add a random Common or Uncommon weather for 3 minutes."
    },
    image: "assets/cards/sailormoon.png"
  },
  {
    id: "jin-mori",
    name: "Jin Mori",
    element: "Holy",
    rarity: "Mythic",
    chance: 240000,
    category: ["Protagonist", "Hero", "Human", "Brutal"],
    requiredWeather: "Heavenly",
    stats: { hp: 10900, atk: 2650 },
    passive: {
      name: "72 Magic Spell",
      description: "When an original teammate dies, create a Clone with Jin Mori’s current HP/ATK and that teammate’s passive. No numeric creation cap; generated units cannot create companions."
    },
    image: "assets/cards/jinmori.png"
  },
  {
    id: "wish",
    name: "Wish",
    element: "Holy",
    rarity: "Mythic",
    chance: 115000,
    category: ["Alternative", "Supporter", "Magician"],
    requiredWeather: "Heavenly",
    stats: { hp: 14700, atk: 130 },
    passive: {
      name: "Heavenly Blessing",
      description: "While on the team, all allies gain +150% max HP."
    },
    image: "assets/cards/wish.png"
  },
  {
    id: "weather-tsukuyomi-eye",
    name: "Uchiha Shisui",
    element: "Nature",
    rarity: "Mythic",
    chance: 35000,
    category: ["Ninja", "Human", "Hero", "Supporter"],
    requiredWeather: "Tsukuyomi",
    stats: { hp: 8800, atk: 807 },
    passive: {
      name: "TSUKUYOMI",
      description: "35% dodge chance. A successful dodge Stuns the attacker for 3 turns."
    },
    image: "assets/cards/shisui.png"
  },
  {
    id: "diavolo",
    name: "Diavolo",
    element: "Dark",
    rarity: "Mythic",
    chance: 600000,
    category: ["JoJo", "Villian", "Human", "Brutal", "Mastermind"],
    requiredWeather: "Tsukuyomi",
    stats: { hp: 27400, atk: 2510 },
    passive: {
      name: "EPITAH",
      description: "35% dodge chance. A successful dodge Stuns the attacker for 3 turns."
    },
    image: "assets/cards/diavolo.png"
  },
  {
    id: "kaguya",
    name: "Kaguya",
    element: "Holy",
    rarity: "Mythic",
    chance: 999000,
    category: ["Villian", "Unhuman", "Magician", "PureEvil"],
    requiredWeather: "Tsukuyomi",
    stats: { hp: 19200, atk: 4700 },
    passive: {
      name: "Dimensional Domain",
      description: "On entry, create a 3-turn domain. Both teams lose one attack cycle; enemies take Burn equal to 100% ATK per turn inside the domain."
    },
    image: "assets/cards/kaguya.png"
  },
  {
    id: "weather-reaper-hollow",
    name: "Vasto Lord",
    element: "Fire",
    rarity: "Legendary",
    chance: 22000,
    category: ["Unhuman", "Villian", "Brutal", "Reaper", "Bleach"],
    requiredWeather: "Reaper",
    stats: { hp: 3340, atk: 1280 },
    passive: {
      name: "Last Breath",
      description: "Critical hits execute the surviving target, respecting immunity and fatal-hit survival effects."
    },
    image: "assets/cards/vastolord.png"
  },
  {
    id: "subaru",
    name: "Subaru",
    element: "Dark",
    rarity: "Legendary",
    chance: 53090,
    category: ["Protagonist", "Human", "Supporter", "Alternative", "Isekai"],
    requiredWeather: "Reaper",
    stats: { hp: 9500, atk: 871 },
    passive: {
      name: "Return By Death",
      description: "First fatal hit: revive at 90% max HP. Later fatal hits: 65% chance to revive at 50% max HP. Each revival grants +20% ATK and +15% dodge."
    },
    image: "assets/cards/subaru.png"
  },
  {
    id: "dio-brando",
    name: "Dio Brando",
    element: "Fire",
    rarity: "Legendary",
    chance: 666,
    category: ["JoJo", "Villian", "Unhuman", "Brutal", "PureEvil"],
    requiredWeather: "Malevolent",
    stats: { hp: 970, atk: 370 },
    passive: {
      name: "WGRYYYY",
      description: "Each attack: 20% chance to Freeze for 2 turns. Successful Freeze heals 20% max HP."
    },
    image: "assets/cards/diobrando.png"
  },
  {
    id: "weather-malevolent-king",
    name: "Malevolent King",
    element: "Fire",
    rarity: "Mythic",
    chance: 45000,
    category: ["Villian", "Unhuman", "PureEvil", "Brutal", "Army", "Magician", "Jujutsu"],
    requiredWeather: "Malevolent",
    stats: { hp: 4870, atk: 1860 },
    passive: {
      name: "Malevolent Kitchen",
      description: "The 5th attack repeatedly slashes the active enemy until it falls below 50% max HP."
    },
    image: "assets/cards/sukuna.png"
  },
  {
    id: "doflamingo",
    name: "Doflamingo",
    element: "Nature",
    rarity: "Mythic",
    chance: 60220,
    category: ["Pirate", "Villian", "Human", "Brutal", "Captain", "Mastermind"],
    requiredWeather: "Malevolent",
    stats: { hp: 6830, atk: 1670 },
    passive: {
      name: "STRING ARMY",
      description: "Each eligible kill has a 30% chance to convert the defeated enemy into a teammate. No creation cap; clones and summons cannot create further units."
    },
    image: "assets/cards/doflamingo.png"
  },
  {
    id: "hakari-jackpot",
    name: "Hakari Jackpot",
    element: "Nature",
    rarity: "Mythic",
    chance: 777777,
    category: ["Jujutsu", "Protagonist", "Human", "Brutal"],
    requiredWeather: "Malevolent",
    stats: { hp: 31300, atk: 1910 },
    passive: {
      name: "JACKPOT",
      description: "While on the team, winning grants +100% eligible rewards. Starting in slot 1 grants 7 turns of Invincibility; otherwise gain either +77% ATK or +77% max HP."
    },
    image: "assets/cards/hakarijackpot.png"
  },
  {
    id: "mahoraga",
    name: "Mahoraga",
    element: "Holy",
    rarity: "Mythic",
    chance: 800000,
    category: ["Jujutsu", "Unhuman", "Brutal"],
    requiredWeather: "Malevolent",
    stats: { hp: 30800, atk: 2820 },
    passive: {
      name: "ADAPTION",
      description: "When hit: 25% chance to Adapt and gain 25% damage reduction; resets against a new enemy. Each kill heals 50% max HP."
    },
    image: "assets/cards/mahoraga.png"
  },
  {
    id: "tower-champion-normal",
    name: "Equinox",
    element: "Electric",
    rarity: "Secret",
    chance: 2500025,
    category: ["VideoGame", "Alternative", "Brutal"],
    requiredWeather: "Normal",
    stats: { hp: 27700, atk: 6780 },
    passive: {
      name: "Emotional Meter",
      description: "Start at 50% positive / 50% negative. Primary attacks shift 10–20% toward positive; incoming hits shift 10–20% toward negative.\n100% positive: living team gains +100% max HP and +25% ATK; meter locks.\n100% negative: hit all enemies for x25 current ATK, then die permanently; cannot revive or be cloned."
    },
    image: "assets/cards/equinox.png",
    towerType: "normal",
    unlockRequirement: "tower_floor_100_normal",
    sourceId: "starter-common",
    nativeWeather: null,
    towerFloor: 100,
    description: "Clear Floor 100 of normal Tower. Future rolls require the matching weather."
  },
  {
    id: "tower-champion-raining",
    name: "Aqua",
    element: "Water",
    rarity: "Secret",
    chance: 2222222,
    category: ["Supporter", "Magician", "Unhuman", "Isekai"],
    requiredWeather: "Raining",
    stats: { hp: 63700, atk: 566 },
    passive: {
      name: "Useless",
      description: "Before battle, choose +50% team max HP (once/team) or +50% eligible VNĐ/EXP/Reward Bonus. Reward choice also boosts standard drop quantities, including Tower Coins, Trial Shards and materials; it does not change drop chances, fixed EXP Trial conversion or reward-free PvP.\nEach allied turn with another active attacker: heal it for 10% max HP and grant +2.2% current ATK, once/turn."
    },
    image: "assets/cards/aqua.png",
    towerType: "raining",
    unlockRequirement: "tower_floor_100_raining",
    sourceId: "aquaman",
    nativeWeather: "raining",
    towerFloor: 100,
    description: "Clear Floor 100 of raining Tower. Future rolls require the matching weather."
  },
  {
    id: "tower-champion-snowing",
    name: "Ice King",
    element: "Water",
    rarity: "Secret",
    chance: 1058000,
    category: ["AntiVillian", "Magician", "Human", "Alternative"],
    requiredWeather: "Snowing",
    stats: { hp: 15700, atk: 6010 },
    passive: {
      name: "Ice Manipulation",
      description: "When hit: 20% chance to Freeze the attacker for 2 turns. Deal +50% damage to frozen targets.\nFirst eligible fatal hit: revive at full HP for 5 combat turns, then die permanently. No teammate revival.\nOn permanent death: 58% chance to give a living teammate Ice King Crown (10% chance to Freeze targets for 3 turns)."
    },
    image: "assets/cards/iceking.png",
    towerType: "snowing",
    unlockRequirement: "tower_floor_100_snowing",
    sourceId: "toshiro",
    nativeWeather: "snowing",
    towerFloor: 100,
    description: "Clear Floor 100 of snowing Tower. Future rolls require the matching weather."
  },
  {
    id: "tower-champion-sunny",
    name: "Charizard Mega X",
    element: "Fire",
    rarity: "Mythic",
    chance: 634000,
    category: ["Unhuman", "Brutal", "Alternative", "VideoGame", "Draconic", "Animal"],
    requiredWeather: "Sunny",
    stats: { hp: 14000, atk: 5350 },
    passive: {
      name: "Solar Claw",
      description: "33% base crit chance. First damaging crit applies Burn for 3 turns (33% current ATK/turn).\nLater crits deal x3 attack damage before the normal crit multiplier. They do not reapply this Burn. No free follow-up or guaranteed crit."
    },
    image: "assets/cards/charizardx.png",
    towerType: "sunny",
    unlockRequirement: "tower_floor_100_sunny",
    sourceId: "weather-solar-deity",
    nativeWeather: "sunny",
    towerFloor: 100,
    description: "Clear Floor 100 of sunny Tower. Future rolls require the matching weather."
  },
  {
    id: "tower-champion-sugar",
    name: "Majin Buu",
    element: "Electric",
    rarity: "Mythic",
    chance: 760000,
    category: ["Villian", "Unhuman", "Brutal", "AntiVillian", "DragonWarrior"],
    requiredWeather: "Sugar",
    stats: { hp: 17200, atk: 4210 },
    passive: {
      name: "Candy Eater",
      description: "Each primary attack gains 1–3 candies; only the current form applies.\n0–10: +25% damage; +1 extra candy/attack.\n11–25: +50% max HP; when hit, spend 1 candy to heal 3% max HP.\n26–50: damaging attacks summon a Ghost (HP = damage dealt; ATK = 10% current ATK).\n51–75: 76% dodge; a dodge skips the next attack, grants 5 candies and heals 7.6% max HP.\n76–99: every 3rd attack also hits up to 3 random enemies for 50% ATK.\n100: hit all enemies each attack; spend 1 candy/attack until 0. Then return to Form 1 and self-Stun for 5 turns; no candy gain or transformation during reversion.\nGenerated units cannot summon Ghosts."
    },
    image: "assets/cards/buu.png",
    towerType: "sugar",
    unlockRequirement: "tower_floor_100_sugar",
    sourceId: "android-21",
    nativeWeather: "sugar",
    towerFloor: 100,
    description: "Clear Floor 100 of sugar Tower. Future rolls require the matching weather."
  },
  {
    id: "tower-champion-reaper",
    name: "Aizen Beyond",
    element: "Holy",
    rarity: "Secret",
    chance: 6000000,
    category: ["Villian", "Reaper", "Unhuman", "Brutal", "PureEvil", "Bleach", "Swordman", "Captain", "Mastermind"],
    requiredWeather: "Reaper",
    stats: { hp: 31500, atk: 12000 },
    passive: {
      name: "Illusion Shattering Flower",
      description: "Every 2nd primary attack: hit all enemies for 60% of each target’s current ATK.\nWhen damaged: 6% chance to counter for 50% damage received; counters cannot loop.\nFirst eligible fatal hit: revive at full HP, gain +100% current ATK permanently. Cannot be cloned or revived by teammates."
    },
    image: "assets/cards/aizenbeyond.png",
    towerType: "reaper",
    unlockRequirement: "tower_floor_100_reaper",
    sourceId: "weather-reaper-hollow",
    nativeWeather: "reaper",
    towerFloor: 100,
    description: "Clear Floor 100 of reaper Tower. Future rolls require the matching weather."
  },
  {
    id: "tower-champion-eclipse",
    name: "Wonder Of You",
    element: "Dark",
    rarity: "Secret",
    chance: 8000000,
    category: ["JoJo", "Supporter", "Magician", "Alternative"],
    requiredWeather: "Eclipse",
    stats: { hp: 97100, atk: 863 },
    passive: {
      name: "Calamity",
      description: "Protect a random living teammate; choose another if it dies. No position swap.\nAfter that ally’s shields/reduction, split remaining damage 50%/50%; absorb the shared half, with an 8% chance to reflect it instead. No recursive redirection.\nProtected ally’s kill: heal 80% max HP. Death while protecting: 8% chance to execute the attacker; normal immunity/survival rules apply."
    },
    image: "assets/cards/wou.png",
    towerType: "eclipse",
    unlockRequirement: "tower_floor_100_eclipse",
    sourceId: "weather-eclipse-harvester",
    nativeWeather: "eclipse",
    towerFloor: 100,
    description: "Clear Floor 100 of eclipse Tower. Future rolls require the matching weather."
  },
  {
    id: "tower-champion-malevolent",
    name: "Thukuna",
    element: "Fire",
    rarity: "Mythic",
    chance: 666999,
    category: ["Jujutsu", "Villian", "Unhuman", "Brutal", "PureEvil"],
    requiredWeather: "Malevolent",
    stats: { hp: 14300, atk: 5460 },
    passive: {
      name: "Malevolent Kitchen",
      description: "After 5 primary attacks, hit all living enemies for 25% current ATK at the start of every combat turn while alive.\nWhen hit and surviving: 66% chance to heal 6% max HP and gain +9% current ATK. ATK bonuses stack for the match."
    },
    image: "assets/cards/thukuna.png",
    towerType: "malevolent",
    unlockRequirement: "tower_floor_100_malevolent",
    sourceId: "weather-malevolent-king",
    nativeWeather: "malevolent",
    towerFloor: 100,
    description: "Clear Floor 100 of malevolent Tower. Future rolls require the matching weather."
  },
  {
    id: "tower-champion-tsukuyomi",
    name: "Naruto x Sasuke",
    element: "Nature",
    rarity: "Secret",
    chance: 2000000,
    category: ["Ninja", "Protagonist", "Hero", "Human", "Brutal"],
    requiredWeather: "Tsukuyomi",
    requiredWeathers: ["Tsukuyomi", "Mangekyo"],
    stats: { hp: 20300, atk: 7750 },
    passive: {
      name: "Datebayo",
      description: "Each new active enemy rolls Naruto/Sasuke mode (50% each); keep the card’s attack counter across target changes.\nNaruto: every 3rd attack deals x3 damage and creates a 10% current HP/ATK Clone. Living Clones follow up each attack; Clone death heals the owner 10% max HP. No count cap; generated units cannot summon.\nSasuke: every 2nd attack hits all enemies for 50% ATK; 20% dodge. Dodge applies Burn for 5 turns (25% ATK/turn) and a 3-combat-turn shield equal to avoided damage. Burn ending naturally Stuns for 1 turn.\nSwitching to Sasuke removes Clones without healing; switching to Naruto removes the shield."
    },
    image: "assets/cards/narutosasuke.png",
    towerType: "tsukuyomi",
    unlockRequirement: "tower_floor_100_tsukuyomi",
    sourceId: "weather-tsukuyomi-eye",
    nativeWeather: "tsukuyomi",
    towerFloor: 100,
    description: "Clear Floor 100 of tsukuyomi Tower. Future rolls require the matching weather."
  },
  {
    id: "tower-champion-heavenly",
    name: "The Judgement",
    element: "Holy",
    rarity: "Mythic",
    chance: 300300,
    category: ["VideoGame", "Magician", "Unhuman", "Supporter"],
    requiredWeather: "Heavenly",
    stats: { hp: 10400, atk: 3970 },
    passive: {
      name: "Divine Light",
      description: "Every 2nd attack: 33% chance for a beam hitting all enemies for 50% current ATK; damaged targets have a 66% chance of Heresy for 1–3 turns.\nWhile any enemy has Heresy: beam chance/damage become 66%/66% ATK; Heresy chance becomes 33%.\nHeresy: deal 9% less damage; 3% chance to miss primary attacks."
    },
    image: "assets/cards/judgement.png",
    towerType: "heavenly",
    unlockRequirement: "tower_floor_100_heavenly",
    sourceId: "weather-heavenly-seraph",
    nativeWeather: "heavenly",
    towerFloor: 100,
    description: "Clear Floor 100 of heavenly Tower. Future rolls require the matching weather."
  },
  {
    id: "tower-champion-shadow",
    name: "Kamen Rider Dark Decade",
    element: "Dark",
    rarity: "Secret",
    chance: 2009000,
    category: ["Villian", "AntiVillian", "Human", "Alternative", "Brutal"],
    requiredWeather: "Shadow",
    stats: { hp: 16700, atk: 6390 },
    passive: {
      name: "Dark Aurora",
      description: "On kill: 29% chance to convert an eligible original enemy and steal its passive (max 2 living summons owned by this card, including summons from stolen passives). Insert the converted unit directly in front of Dark Decade with Dark Decade’s current max HP/ATK and the victim’s passive.\nWhile alive, revive eligible original teammates at the back with Dark Decade’s stats (max 2 revivals/teammate); keep their own passives. Never revive itself, clones or summons.\nGenerated units cannot create companions. Uncloneable enemies and anti-revival restrictions remain excluded."
    },
    image: "assets/cards/krdarkdecade.png",
    towerType: "shadow",
    unlockRequirement: "tower_floor_100_shadow",
    sourceId: "weather-shadow-monarch",
    nativeWeather: "shadow",
    towerFloor: 100,
    description: "Clear Floor 100 of shadow Tower. Future rolls require the matching weather."
  },
  {
    id: "raid-secret-mihawk",
    name: "Mihawk",
    element: "Nature",
    rarity: "Secret",
    chance: 0,
    category: ["Swordman", "Human", "AntiVillian", "Brutal", "Pirate"],
    requiredWeather: null,
    stats: { hp: 13100, atk: 5000 },
    passive: {
      name: "Hawkeye",
      description: "50% dodge; successful dodge counters for 500% current ATK.\nPrimary attacks pierce the enemy lineup; each damaging hit reduces the next target’s damage by 25%. Dodges/fully blocked hits do not consume a falloff step.\nEach combat turn: 25% chance for Haki for 2 own turns (+250% ATK, 25% damage reduction); refreshes without stacking."
    },
    image: "assets/cards/mihawk.png",
    raidOnly: true,
    raidType: "marine_fort",
    unlockRequirement: "raid_secret_mihawk",
    description: "Exclusive Marine Ford Raid drop. Never available from normal rolls."
  },
  {
    id: "raid-secret-ace",
    name: "Ace",
    element: "Fire",
    rarity: "Secret",
    chance: 0,
    category: ["Pirate", "Human", "Hero", "Supporter", "Brutal", "Captain"],
    requiredWeather: null,
    stats: { hp: 3970, atk: 1510 },
    passive: {
      name: "Mera Mera",
      description: "Successful attacks: 10% chance to Burn for 3 turns (100% current ATK/turn).\nOn death: living teammates gain Brother Soul. Their successful attacks have a separate 10% chance to Burn for 1 turn (100% their current ATK). Stacks with other Burns; multiple Ace deaths do not increase the chance."
    },
    image: "assets/cards/ace.png",
    raidOnly: true,
    raidType: "marine_fort",
    unlockRequirement: "raid_secret_ace",
    description: "Exclusive Marine Ford Raid drop. Never available from normal rolls."
  },
  {
    id: "raid-secret-marco",
    name: "Marco",
    element: "Water",
    rarity: "Secret",
    chance: 0,
    category: ["Pirate", "Human", "Supporter", "Hero", "Captain"],
    requiredWeather: null,
    stats: { hp: 51500, atk: 3140 },
    passive: {
      name: "Phoenix Inferno",
      description: "While alive, attacks against other teammates have a 10% chance to be blocked; counter for 200% current ATK without swapping.\nOnce/match, prevent an ally’s fatal hit or danger below 10% HP, swap positions and heal to max HP. Bleed blocks the heal; fatal rescue leaves at least 1 HP.\n10% dodge; each dodge grants the living team +10% current max HP, stacking for the match."
    },
    image: "assets/cards/marco.png",
    raidOnly: true,
    raidType: "marine_fort",
    unlockRequirement: "raid_secret_marco",
    description: "Exclusive Marine Ford Raid drop. Never available from normal rolls."
  },
  {
    id: "funny-valentine",
    name: "Funny Valentine",
    element: "Nature",
    rarity: "Mythic",
    chance: 214000,
    category: ["JoJo", "Villian", "Human", "Brutal", "Mastermind"],
    requiredWeather: "Bizare",
    stats: { hp: 11300, atk: 2770 },
    passive: {
      name: "D4C",
      description: "Each attack: 14% chance to summon a passive-free Clone with 10% current HP/ATK (max 10 living Clones). Clones follow up each primary attack.\nFatal hit with a living Clone: sacrifice 1 Clone and survive at 10% max HP. Bleed blocks this survival."
    },
    image: "assets/cards/funnyvalentine.png"
  },
  {
    id: "dio-the-world",
    name: "Dio The World",
    element: "Electric",
    rarity: "Mythic",
    chance: 666666,
    category: ["JoJo", "Villian", "Unhuman", "Brutal", "PureEvil"],
    requiredWeather: "Bizare",
    stats: { hp: 13100, atk: 4990 },
    passive: {
      name: "The World",
      description: "Every 5th primary attack randomly uses Time Stop or Road Roller.\nTime Stop: Freeze all enemies for 2 turns; attacks deal x2 damage to frozen targets.\nRoad Roller: hit up to 3 enemies for x3 ATK each and inflict Bleed for 3 turns (66% ATK/turn)."
    },
    image: "assets/cards/diotheworld.png"
  },
  {
    id: "joseph-joestar",
    name: "Joseph Joestar",
    element: "Electric",
    rarity: "Mythic",
    chance: 120000,
    category: ["JoJo", "Protagonist", "Hero", "Human", "Supporter"],
    stats: { hp: 15500, atk: 1420 },
    passive: {
      name: "Secret Techniques",
      description: "Gain 5% dodge per 10% missing max HP.\nOn dodge, the attacker takes +75% damage and loses its passive until the end of its next turn."
    },
    image: "assets/cards/josephjoestar.png"
  },
  {
    id: "jolyne-joestar",
    name: "Jolyne Joestar",
    element: "Nature",
    rarity: "Mythic",
    chance: 206000,
    category: ["JoJo", "Protagonist", "Hero", "Human", "Brutal"],
    requiredWeather: "Bizare",
    stats: { hp: 8940, atk: 3410 },
    passive: {
      name: "Stone Free",
      description: "Primary attacks target the enemy with the lowest current HP.\nOnce per match, when an attacker has less current HP than Jolyne, stun it for 6 turns before its hit resolves."
    },
    image: "assets/cards/jolynejoestar.png"
  },
  {
    id: "tohth",
    name: "Tohth",
    element: "Holy",
    rarity: "Mythic",
    chance: 189000,
    category: ["JoJo", "Supporter", "Magician", "Alternative"],
    requiredWeather: "Bizare",
    stats: { hp: 20900, atk: 1280 },
    passive: {
      name: "OinGo BoinGo",
      description: "If not in the first lineup slot, mark a random enemy at battle start.\nIf that enemy dies while Tohth lives, all living teammates gain +18.9% current ATK for the match (once)."
    },
    image: "assets/cards/tohth.png"
  },
  {
    id: "emmu",
    name: "Emmu",
    element: "Dark",
    rarity: "Secret",
    chance: 1700000,
    category: ["Human", "Supporter", "Villian", "DemonSlayer", "Unhuman", "Brutal", "PureEvil"],
    requiredWeather: "Bizare",
    stats: { hp: 26000, atk: 6350 },
    passive: {
      name: "Sleep Demon Art",
      description: "Each primary attack: 17% chance to randomly inflict Stun or Hypnosis for 1 turn.\nHypnosis: 80% chance to attack a living teammate instead. Each kill grants +70% current ATK."
    },
    image: "assets/cards/emmu.png"
  },
  {
    id: "josuke",
    name: "Josuke",
    element: "Water",
    rarity: "Secret",
    chance: 2400000,
    category: ["JoJo", "Protagonist", "Hero", "Human", "Supporter"],
    requiredWeather: "Bizare",
    stats: { hp: 49100, atk: 3000 },
    passive: {
      name: "Crazy Diamond",
      description: "Before each primary attack, cleanse all living teammates of debuffs and reduce active skill cooldowns by 4 turns.\nOnce per match, revive an eligible original teammate with Josuke’s current max HP and ATK."
    },
    image: "assets/cards/josuke.png"
  },
  {
    id: "akaza",
    name: "Akaza",
    element: "Water",
    rarity: "Secret",
    chance: 8000000,
    category: ["DemonSlayer", "Villian", "Unhuman", "Brutal"],
    requiredWeather: "Malevolent",
    stats: { hp: 38600, atk: 14800 },
    passive: {
      name: "Destructive Demon Art",
      description: "Target the enemy with the highest ATK and deal x1.5 damage.\nStarting behind slot 1: swap with slot 1, gain +50% ATK and +25% max HP. Starting in slot 1: each attack also hits a second enemy.\nSurvive only 1 fatal hit at 1 HP per match. This survival and each kill grant +10% current ATK. Bleed blocks survival."
    },
    image: "assets/cards/akaza.png"
  },
  {
    id: "awakened-doflamingo",
    name: "Awakened Doflamingo",
    element: "Dark",
    rarity: "Secret",
    chance: 0,
    category: ["Pirate", "Villian", "Human", "Brutal", "Captain", "PureEvil", "Mastermind"],
    stats: { hp: 21500, atk: 8190 },
    passive: {
      name: "Ito Ito",
      description: "Starting in slot 1: if alive on its tenth own turn, hit all enemies for x10 current ATK once.\nEvery 3rd primary attack: 60% chance to summon a passive-free Clone with 60% current HP/ATK; no count limit. Its death stuns its attacker for 2 turns.\nThe 5th primary attack disables its target’s passive until that enemy dies (once)."
    },
    image: "assets/cards/awakeneddoflamingo.png",
    evolvesFrom: "doflamingo",
    evolutionOnly: true
  },
  {
    id: "prime-garp",
    name: "Prime Garp",
    element: "Nature",
    rarity: "Secret",
    chance: 0,
    category: ["Hero", "Human", "Captain", "Brutal", "Army"],
    stats: { hp: 10200, atk: 3900 },
    passive: {
      name: "Galaxy Impact",
      description: "On the 7th primary attack, hit all enemies for x10 current ATK; Stun and disable their passives for 3 turns.\nBelow 50% max HP, take 25% less incoming damage."
    },
    image: "assets/cards/primegarp.png",
    evolvesFrom: "garp",
    evolutionOnly: true
  },
  {
    id: "boss-event-alucard",
    name: "Alucard",
    element: "Fire",
    rarity: "Secret",
    chance: 0,
    category: ["Protagonist", "AntiHero", "Unhuman", "Brutal", "Hunter", "Gunner"],
    stats: { hp: 33700, atk: 12900 },
    passive: {
      name: "Bird of Hermes",
      description: "Every 2 attacks: apply Bleed for 1 turn (66% current ATK).\nAfter 6 attacks, each attack has a 66% chance for a follow-up (33% ATK; heal 3% max HP). Follow-ups can repeat without a count cap.\n6 consecutive damaging follow-up hits create a random living teammate’s Clone directly in front of Alucard (max 3 living Clones).\nOn death, revive once at the back with 66% max HP. Cannot be cloned; teammate revivals are allowed.\nWhile alive and not attacking, allied Bleed deals x1.5 damage."
    },
    image: "assets/cards/alucard.png",
    bossEventOnly: true,
    eventType: "alucard"
  },
  {
    id: "madara-lubu",
    name: "Madara Lubu",
    element: "Fire",
    rarity: "Secret",
    chance: 10000000,
    category: ["Ninja", "Villian", "Unhuman", "Brutal", "Army", "Mastermind"],
    requiredWeather: "Tsukuyomi",
    stats: { hp: 31800, atk: 12100 },
    passive: {
      name: "Divine Steed",
      description: "10% dodge against standard and passive attacks; a dodge disables the attacker’s passive for 5 turns. 50% chance to resist each Stun.\nFrom attack 5, each attack has a 50% chance to chain a follow-up (100% current ATK; Bleed for 3 turns at 25% ATK/turn).\nEach attack has a 20% chance to call a teammate for a follow-up.\nLast survivor: once per match, summon 3 Clones with 50% current stats, a random fallen teammate’s passive each, and a shield equal to 50% of Madara’s max HP."
    },
    image: "assets/cards/madaralubu.png",
    towerType: "tsukuyomi",
    towerFloor: 200,
    unlockRequirement: "tower_floor_200_tsukuyomi"
  },
  {
    id: "sung-jin-woo",
    name: "Sung Jin Woo",
    element: "Water",
    rarity: "Secret",
    chance: 2023000,
    category: ["Protagonist", "Hunter", "Human", "Supporter", "Army", "Brutal"],
    requiredWeather: "Shadow",
    stats: { hp: 20400, atk: 7780 },
    passive: {
      name: "Systems Stats",
      description: "Each kill summons a Shadow with 50% of the defeated enemy’s HP/ATK.\nChoose one non-stacking bonus at battle start and after each kill: +15% ATK, +20% max HP, or heal 1.5% max HP per attack. Keep it until the next kill.\nEach attack randomly uses Hunter Slash (120% ATK), Shadow Attack (call a Shadow or backline teammate), or Fang Strike (60% ATK to the 2 front enemies)."
    },
    image: "assets/cards/sungjinwoo.png",
    questOnly: true,
    unlockRequirement: "quest_card_sung-jin-woo"
  },
  {
    id: "frieren",
    name: "Frieren",
    element: "Holy",
    rarity: "Secret",
    chance: 2500000,
    category: ["Protagonist", "Magician", "Supporter", "Unhuman", "Hero"],
    requiredWeather: "Heavenly",
    stats: { hp: 27700, atk: 6780 },
    passive: {
      name: "Endless Mana",
      description: "Taking HP damage grants 3.5% Mana. Each 1% Mana adds +0.5% damage. At 100%, heal 35% max HP, cast Zoltraak (175% current ATK), then reset Mana.\nOnce per match, surviving below 25% HP immediately casts Zoltraak and grants 30% Mana.\nNormal attacks randomly become Vollzanbel (40% ATK to all enemies), Time Dilation (Stun all enemies for 1 turn, then disable passives for 1 turn), or Healing (heal all allies for 25% max HP)."
    },
    image: "assets/cards/frieren.png",
    questOnly: true,
    unlockRequirement: "quest_card_frieren"
  },
  {
    id: "alexander-anderson",
    name: "Alexander Anderson",
    element: "Water",
    rarity: "Mythic",
    chance: 777000,
    category: ["AntiVillian", "Human", "Brutal", "Hunter", "Swordman"],
    requiredWeather: null,
    stats: { hp: 15200, atk: 5810 },
    passive: {
      name: "Pray to God",
      description: "Each attack has a 77% chance to chain a follow-up for 77% current ATK. Each follow-up applies Bleed for its chain count in turns (7% ATK/turn).\nOnce per match, while alive below 7% max HP: heal to 77% max HP, gain +300% attack damage, and stop follow-ups. Gain Crucifix: +150% damage against Dark enemies. Cannot be revived."
    },
    image: "assets/cards/alexanderanderson.png",
    questOnly: true,
    unlockRequirement: "quest_card_alexander-anderson"
  },
  {
    id: "julius",
    name: "Julius",
    element: "Holy",
    rarity: "Secret",
    chance: 1500000,
    category: ["Magician", "Human", "Captain", "Hero", "Supporter", "Mastermind"],
    requiredWeather: null,
    stats: { hp: 36200, atk: 3310 },
    passive: {
      name: "Time Grimoire",
      description: "While alive: 30% chance to reflect attacks against Julius or the active ally. Two consecutive reflections deal 50% ATK to all enemies and shield allies for 50% Julius max HP.\nAn ally shield breaking within 3 turns stores their current stats and passive as one backup life per match. Fatal damage consumes it to revive Julius; after this revival, cannot be cloned or revived by allies."
    },
    image: "assets/cards/julius.png",
    questOnly: true,
    unlockRequirement: "quest_card_julius"
  },
  {
    id: "speed-wizard",
    name: "Speed Wizard",
    element: "Electric",
    rarity: "Mythic",
    chance: 450000,
    category: ["Alternative", "Magician", "Human"],
    requiredWeather: "Wind",
    stats: { hp: 13100, atk: 5020 },
    passive: {
      name: "Godspeed",
      description: "5% chance per attack to follow up for 50% ATK; each successive follow-up halves its trigger chance.\n50% dodge. Each dodge adds +5% follow-up chance for the match, but skips the next attack turn."
    },
    image: "assets/cards/speedwizard.png"
  },
  {
    id: "boss-event-lucius",
    name: "Lucius Zogratis",
    element: "Dark",
    rarity: "Secret",
    chance: 0,
    category: ["Villian", "Human", "Magician", "Brutal", "PureEvil", "Alternative", "Mastermind"],
    stats: { hp: 25200, atk: 6160 },
    passive: {
      name: "All Grimoire",
      description: "On entry and every 5 attacks, gain a random ally/enemy passive. No duplicates; maximum 5 passives including All Grimoire.\nWhen an allied Julius dies permanently, gain +50% HP and ATK once per match."
    },
    image: "assets/cards/lucius.png",
    bossEventOnly: true,
    eventType: "lucius"
  },
  {
    id: "sea-goddess-valkyrie",
    name: "Sea Goddess Valkyrie",
    element: "Water",
    rarity: "Mythic",
    chance: 0,
    category: ["Unhuman", "Supporter", "Magician"],
    stats: { hp: 49600, atk: 4540 },
    passive: {
      name: "Ultimate Tsunami",
      description: "On entry: deal 100% ATK to all enemies and gain a shield equal to 50% total HP damage dealt.\nWhen this shield breaks, stun all enemies for 4 turns."
    },
    image: "assets/cards/seagoddessvalkyrie.png",
    evolvesFrom: "noelle-silva",
    evolutionOnly: true
  },
  {
    id: "yuno-spirit",
    name: "Yuno Spirit",
    element: "Nature",
    rarity: "Secret",
    chance: 0,
    category: ["Magician", "Supporter", "Human", "Protagonist"],
    stats: { hp: 47400, atk: 2900 },
    passive: {
      name: "Spirit Wind Grimoire",
      description: "On entry, shield all living allies, including self, for 48% of this card’s max HP; no expiry.\n30% dodge. Each dodge adds a shield equal to 30% current HP for 3 turns.\nEach attack has a 26% chance to shuffle living enemies and hit all enemies for 48% current ATK."
    },
    image: "assets/cards/yunospirit.png",
    evolvesFrom: "yuno",
    levelingRate: 1500000,
    evolutionOnly: true
  },
  {
    id: "tower-champion-lucky",
    name: "Yuno Spirit Demonic",
    element: "Nature",
    rarity: "Secret",
    chance: 4444444,
    category: ["Magician", "Human", "Brutal", "Protagonist"],
    requiredWeather: "Lucky",
    stats: { hp: 38200, atk: 9330 },
    passive: {
      name: "Anti Spirit Grimoire",
      description: "Deal x2 damage to Holy enemies; take 22% less damage from Holy enemies.\nEach attack has a 44% chance to pierce the enemy lineup: 100% current ATK on the first hit, then x0.78 damage per subsequent hit.\nWhen attacked, 22% chance to absorb damage instead of taking it. Add the absorbed amount to the next attack and grant the ally directly behind a permanent shield of that amount; shields stack without cap."
    },
    image: "assets/cards/yunospiritdemonic.png",
    towerType: "lucky",
    towerFloor: 100,
    unlockRequirement: "tower_floor_100_lucky"
  },
  {
    id: "tower-champion-wind",
    name: "Xtreme Chan",
    element: "Nature",
    rarity: "Secret",
    chance: 2010000,
    category: ["Alternative", "Supporter", "Magician"],
    requiredWeather: "Wind",
    stats: { hp: 27800, atk: 6790 },
    passive: {
      name: "The Fuuto Wind",
      description: "Last ally alive: +50% damage and gain all fallen teammates’ max HP once.\nWhen attacked, 21% chance to gain 21% damage reduction for the next turn; does not stack.\nEvery 2nd attack replaces the normal hit with Heat (50% ATK + Burn: 30% ATK, 2 turns), Cyclone (100% ATK to up to 2 enemies), Lunar (110% ATK + 1-turn stun), or Joker (x2 damage)."
    },
    image: "assets/cards/xtremechan.png",
    towerType: "wind",
    towerFloor: 100,
    unlockRequirement: "tower_floor_100_wind"
  },
  {
    id: "tower-champion-bizare",
    name: "Star Plantinum Requiem",
    element: "Electric",
    rarity: "Secret",
    chance: 3000000,
    category: ["JoJo", "Protagonist", "Unhuman", "Brutal", "Alternative"],
    requiredWeather: "Bizare",
    stats: { hp: 26100, atk: 9970 },
    passive: {
      name: "SPR",
      description: "Each attack has a 33% chance to follow up for normal attack damage; follow-ups can chain.\nCleanse effects that prevent attacking, then stun the inflicting enemy on its next turn; 2-turn cooldown.\n33% chance to survive fatal damage at 1 HP, once per match."
    },
    image: "assets/cards/spr.png",
    towerType: "bizare",
    towerFloor: 100,
    unlockRequirement: "tower_floor_100_bizare"
  },
  {
    id: "tower-champion-shadow-200",
    name: "Shadow The World Requiem",
    element: "Dark",
    rarity: "Secret",
    chance: 12000000,
    category: ["JoJo", "Villian", "Unhuman", "Brutal", "Alternative"],
    requiredWeather: "Shadow",
    stats: { hp: 34200, atk: 13100 },
    passive: {
      name: "STWR",
      description: "Each attack: 12% chance to skip the enemy turn and act again. Each kill permanently adds +12% HP and +12% ATK.\nCleanse attack-disabling effects and inflict Bleed (30% ATK/turn, 3 turns); 3-turn cooldown.\nWhile supporting, 12% chance to join an ally’s attack; both deal 120% ATK.\nCannot be cloned or revived. On death, stun all enemies for 5 turns."
    },
    image: "assets/cards/stwr.png",
    towerType: "shadow",
    towerFloor: 200,
    unlockRequirement: "tower_floor_200_shadow"
  },
  {
    id: "tower-champion-normal-200",
    name: "Reagan Ridley",
    element: "Electric",
    rarity: "Secret",
    chance: 1692007,
    category: ["Human", "Supporter", "Alternative", "Mastermind"],
    requiredWeather: "Normal",
    stats: { hp: 42700, atk: 2610 },
    passive: {
      name: "Mad Scientist",
      description: "While supporting, every 3 allied turns create a frontline robot with 10% current max HP / ATK; max 10 active robots per side.\nAI: replace attacks with 100% ATK damage to all enemies. Each kill heals the robot and Reagan for 10% of Reagan’s max HP.\nOn reaching the frontline, sacrifice self and grant one random living teammate Robot Armor: 50% damage reduction, +25% ATK; every 2 attacks blast up to 2 random enemies for 50% ATK each."
    },
    image: "assets/cards/reaganridley.png",
    towerType: "normal",
    towerFloor: 200,
    unlockRequirement: "tower_floor_200_normal"
  },
  {
    id: "shirou",
    name: "Shirou",
    element: "Electric",
    rarity: "Mythic",
    chance: 850000,
    category: ["Swordman", "Fate", "Hero", "Protagonist", "Magician"],
    requiredWeather: "Sugar",
    stats: { hp: 15800, atk: 6020 },
    passive: {
      name: "Rose Shield",
      description: "Fatal hit: revive at 10% max HP and gain a shield of 100% max HP for 3 turns; once per match."
    },
    image: "assets/cards/shirou.png"
  },
  {
    id: "kiritsu",
    name: "Kiritsu",
    element: "Fire",
    rarity: "Mythic",
    chance: 1850000,
    category: ["Fate", "Brutal", "AntiVillian", "Gunner", "Human"],
    requiredWeather: null,
    stats: { hp: 23100, atk: 8830 },
    passive: {
      name: "Hitman",
      description: "Replace each attack with Pistol (50% ATK; disable target passive next turn) or Rifle (60% ATK; 60% chance of a 30% ATK follow-up, which can chain at 60%)."
    },
    image: "assets/cards/kiritsu.png",
    questOnly: true,
    unlockRequirement: "quest_kiritsu"
  },
  {
    id: "mash",
    name: "Mash",
    element: "Water",
    rarity: "Mythic",
    chance: 2900000,
    category: ["Hero", "Fate", "Supporter", "Human"],
    requiredWeather: null,
    stats: { hp: 53000, atk: 3240 },
    passive: {
      name: "Shield",
      description: "While supporting: each allied turn, shield a random teammate for 25% current HP for 1 turn and grant the team +10% crit chance (does not stack). Absorb 100% of unshielded attacks against teammates without changing positions."
    },
    image: "assets/cards/mash.png"
  },
  {
    id: "gilgamesh",
    name: "Gilgamesh",
    element: "Holy",
    rarity: "Secret",
    chance: 10000000,
    category: ["Villian", "Hero", "PureEvil", "Fate", "Swordman"],
    requiredWeather: "Heavenly",
    stats: { hp: 77200, atk: 7080 },
    passive: {
      name: "King of Heros",
      description: "Hero teammates gain +25% ATK damage while alive. Each supporting turn, give each teammate one 1-turn buff: Sword (+5% crit chance, +50% crit damage), Lance (pierce 2), or Dagger (50% follow-up; +10% chance if a follow-up skill already exists).\nEach attack hits 2 enemies. The 10th attack hits all enemies for x10 ATK."
    },
    image: "assets/cards/gilgamesh.png"
  },
  {
    id: "cu-chalinn",
    name: "Cu Chalinn",
    element: "Water",
    rarity: "Secret",
    chance: 4500000,
    category: ["Hero", "Swordman", "Fate", "Human"],
    requiredWeather: "Eclipse",
    stats: { hp: 30700, atk: 11700 },
    passive: {
      name: "Gae Blog",
      description: "Each attack: 22.5% chance to pierce 2 enemies; independently, 45% chance to hit the rearmost enemy for 80% ATK.\nRevive at 50% max HP once per match. The 5th attack after revival deals x5 damage."
    },
    image: "assets/cards/cuchalinn.png"
  },
  {
    id: "saber-knight",
    name: "Saber Knight",
    element: "Water",
    rarity: "Mythic",
    chance: 0,
    category: ["Hero", "Swordman", "Fate", "Human"],
    requiredWeather: null,
    stats: { hp: 15200, atk: 5820 },
    passive: {
      name: "EXCALIBURH",
      description: "Every attack gains 1 Excalibur stack, without cap. On permanent death, strike the opposing frontline for x[Excalibur] ATK. Cannot be cloned or revived."
    },
    image: "assets/cards/saberknight.png",
    evolvesFrom: "saber",
    evolutionOnly: true
  },
  {
    id: "iskandar",
    name: "Iskandar",
    element: "Fire",
    rarity: "Secret",
    chance: 5500000,
    category: ["Army", "Fate", "Swordman", "Captain", "Hero", "Human"],
    requiredWeather: "Sunny",
    stats: { hp: 68400, atk: 4180 },
    passive: {
      name: "Ionian Hetairoi",
      description: "While alive after entry, teammates gain +10% crit chance and +10% ATK. From attack 6, call a random teammate to follow up each attack.\nLast ally alive: +5% crit chance and +25% crit damage. Convert own defeated enemies into teammates with their original stats and passive; max 3 conversions per match."
    },
    image: "assets/cards/iskandar.png"
  },
  {
    id: "medea",
    name: "Medea",
    element: "Dark",
    rarity: "Secret",
    chance: 3200000,
    category: ["Villian", "Fate", "Magician", "Human"],
    requiredWeather: "Shadow",
    stats: { hp: 26800, atk: 10200 },
    passive: {
      name: "Rule Breaker",
      description: "32% chance to dodge passive attacks. Every 2nd attack: 20% chance to stun for 1 turn, then disable the target passive for 1 turn after stun ends. Each attack: 10% chance to hit all enemies for 150% ATK."
    },
    image: "assets/cards/medea.png"
  },
  {
    id: "merlin",
    name: "Merlin",
    element: "Holy",
    rarity: "Secret",
    chance: 1700000,
    category: ["Hero", "Magician", "Fate", "Swordman", "Human", "Supporter"],
    requiredWeather: "Sugar",
    stats: { hp: 42800, atk: 2610 },
    passive: {
      name: "Noble Phantasm",
      description: "While supporting: each ally attack has a 17% chance of a follow-up that stuns for 1 turn. Heal the attacking ally for 5% max HP. Every 3 allied supporting turns, shield a random teammate for 50% current HP."
    },
    image: "assets/cards/merlin.png"
  },
  {
    id: "tower-champion-heavenly-200",
    name: "Gilgamesh Chan",
    element: "Electric",
    rarity: "Secret",
    chance: 20000000,
    category: ["AntiHero", "VideoGame", "Fate", "Alternative"],
    requiredWeather: "Heavenly",
    stats: { hp: 63700, atk: 15600 },
    passive: {
      name: "Enuma English",
      description: "After 8 attacks, supporting ally attacks have a 20% chance of a 60% ATK follow-up. 36% dodge: stun the attacker for 2 turns, then disable its passive for 1 turn.\nEach attack randomly uses Gate of Babylon (5 hits, 12% ATK each), Exterminate (60% ATK to 2 enemies), or Enkindu (50% ATK; 50% chance to stun for 1 turn)."
    },
    image: "assets/cards/gilgameshchan.png",
    towerType: "heavenly",
    towerFloor: 200,
    unlockRequirement: "tower_floor_200_heavenly"
  },
  {
    id: "the-legion",
    name: "The Legion",
    element: "Fire",
    rarity: "Mythic",
    chance: 666333,
    category: ["VideoGame", "Brutal", "Human", "Swordman", "Villian", "PureEvil"],
    requiredWeather: null,
    stats: { hp: 14300, atk: 5460 },
    passive: {
      name: "Frenzy",
      description: "Every 4th attack: 44% chance to start a chain of 44% ATK follow-ups; each can chain at 44%. Each follow-up has a 44% chance to add Bleed for its chain count (44% ATK/turn). Reach the number of living enemies at chain start to hit all enemies for x4 ATK once per chain."
    },
    image: "assets/cards/thelegion.png",
    spookyExclusive: true
  },
  {
    id: "the-clown",
    name: "The Clown",
    element: "Dark",
    rarity: "Mythic",
    chance: 333666,
    category: ["VideoGame", "Brutal", "Magician", "Swordman", "Villian", "PureEvil"],
    requiredWeather: null,
    stats: { hp: 10800, atk: 4140 },
    passive: {
      name: "Potion",
      description: "Entry and each enemy defeat: randomly choose Haste or Hindred. Haste: each attack has a 33% chance of a chainable 66% ATK follow-up. Hindred: each hit has a 33% chance to block all target follow-ups for 3 turns. Each own kill: +13.9% HP and ATK."
    },
    image: "assets/cards/theclown.png",
    spookyExclusive: true
  },
  {
    id: "the-oni",
    name: "The Oni",
    element: "Fire",
    rarity: "Mythic",
    chance: 333999,
    category: ["VideoGame", "Brutal", "Swordman", "Unhuman", "Villian"],
    requiredWeather: null,
    stats: { hp: 11700, atk: 4450 },
    passive: {
      name: "Cursed Blood",
      description: "Attack a bleeding enemy: gain +50% ATK for the next own turn; does not stack. If first in the lineup, gain +100% ATK for 3 own turns and every 3rd attack inflicts Bleed for 1–3 turns (33% current ATK/turn)."
    },
    image: "assets/cards/theoni.png",
    spookyExclusive: true
  },
  {
    id: "jason-13th",
    name: "Jason 13th",
    element: "Water",
    rarity: "Secret",
    chance: 0,
    category: ["Alternative", "Brutal", "PureEvil", "Swordman", "Unhuman", "Villian"],
    requiredWeather: null,
    stats: { hp: 42100, atk: 10300 },
    passive: {
      name: "Ki ki ma ma",
      description: "Every 5th attack prepares the next attack: Spear (200% ATK through all enemies, x0.9 per subsequent hit) or Frog (give all enemies 50% damage reduction for 3 turns). Each attack: 66% chance to heal 6% max HP. On first entry steal a random teammate passive; return it when Jason dies."
    },
    image: "assets/cards/jason13th.png",
    evolvesFrom: "the-trapper",
    evolutionOnly: true
  },
  {
    id: "freddy-krueger",
    name: "Freddy Krueger",
    element: "Dark",
    rarity: "Secret",
    chance: 999666,
    category: ["PureEvil", "Villian", "Alternative", "Brutal", "Magician", "Unhuman"],
    requiredWeather: null,
    stats: { hp: 16800, atk: 6420 },
    passive: {
      name: "Nightmare",
      description: "Each hit: 66% chance to inflict Hindred for 1 turn, blocking all follow-ups. After a successful Hindred, the next attack has a 6% chance to stun for 3 turns. 33% dodge; a successful dodge stuns the attacker for 1 turn."
    },
    image: "assets/cards/freddykrueger.png",
    spookyExclusive: true
  },
  {
    id: "myers",
    name: "Myers",
    element: "Holy",
    rarity: "Secret",
    chance: 6666666,
    category: ["PureEvil", "Villian", "Alternative", "Swordman", "Brutal", "Human"],
    requiredWeather: null,
    stats: { hp: 35900, atk: 13700 },
    passive: {
      name: "Stalking",
      description: "Each allied supporting turn: stack +6% ATK and +3% HP. Each attack removes 66% of stored ATK bonus and 33% of stored HP bonus; base stats are unchanged. Last ally alive: execute enemies below 6% max HP. A successful execution starts a 6-turn countdown to permanent death; teammates cannot clone or revive Myers after it starts."
    },
    image: "assets/cards/myers.png",
    spookyExclusive: true
  },
  {
    id: "gojo-revice",
    name: "Gojo Revice",
    element: "Electric",
    rarity: "Mythic",
    chance: 0,
    category: ["Hero", "Magician", "Jujutsu", "Brutal", "Human"],
    requiredWeather: null,
    stats: { hp: 30500, atk: 2790 },
    passive: {
      name: "Gomen Amanai",
      description: "88% dodge against standard attacks only; dodge bonuses cannot increase it. Each dodge adds +8% damage for 8 own turns, stacking. Four consecutive dodges prepare x8 damage on the next primary attack."
    },
    image: "assets/cards/gojorevice.png",
    evolvesFrom: "gojo-young",
    evolutionOnly: true
  },
  {
    id: "geto-young",
    name: "Geto Young",
    element: "Dark",
    rarity: "Mythic",
    chance: 525000,
    category: ["Jujutsu", "Hero", "Magician", "Army", "Human"],
    requiredWeather: "Malevolent",
    stats: { hp: 14000, atk: 5340 },
    passive: {
      name: "Summon Technique",
      description: "Every 3rd attack randomly replaces the normal attack: RDragon (x3 ATK to all enemies), Woman (120% ATK; stun 2 turns), or Centipede (110% ATK; Bleed 3 turns at 12% current ATK/turn)."
    },
    image: "assets/cards/getoyoung.png"
  },
  {
    id: "toji",
    name: "Toji",
    element: "Nature",
    rarity: "Mythic",
    chance: 3500000,
    category: ["Brutal", "PureEvil", "Jujutsu", "Swordman", "Human", "AntiHero", "Gunner"],
    requiredWeather: "Malevolent",
    stats: { hp: 27800, atk: 10600 },
    passive: {
      name: "Heavenly Restriction",
      description: "Entry and each enemy defeat: choose a mode. Inverted Spear: chain 30% ATK follow-ups at 80%, then -5 percentage points per follow-up. SS Katana: 80% ATK, bypassing shields. Playful Cloud: +50% damage against the enemy with highest current HP. Thousand Chains: every 2nd attack hits 2 enemies for 60% ATK each."
    },
    image: "assets/cards/toji.png",
    questOnly: true,
    unlockRequirement: "quest_toji"
  },
  {
    id: "jogo",
    name: "Jogo",
    element: "Fire",
    rarity: "Secret",
    chance: 0,
    category: ["Jujutsu", "Villian", "Unhuman", "Brutal", "PureEvil"],
    stats: { hp: 26800, atk: 10200 },
    passive: {
      name: "Inferno Domain",
      description: "Below 50% HP, activate a domain: deal 20% ATK to all enemies every turn. Attacks in the domain gain 1 Meteor. On permanent death, start a Meteor-turn countdown, then hit all enemies for xMeteor ATK."
    },
    image: "assets/cards/jogo.png",
    raidOnly: true,
    unlockRequirement: "raid_shibuya_jogo"
  },
  {
    id: "true-mahito",
    name: "True Mahito",
    element: "Water",
    rarity: "Secret",
    chance: 0,
    category: ["Brutal", "PureEvil", "Villian", "Jujutsu", "Swordman", "Unhuman"],
    stats: { hp: 19000, atk: 7260 },
    passive: {
      name: "Heni Satsu Rei Tai",
      description: "Kills summon the victim with 25% of this card’s HP/ATK and the victim’s passive. Attacks have a 15% chance to deal x2 damage; two consecutive x2 hits unlock True Form.\nTrue Form: +100% ATK and a permanent 100% HP shield. Follow-ups deal 15% ATK; chance starts at 24%, rises by 12% per hit, and caps at 72%."
    },
    image: "assets/cards/truemahito.png",
    evolvesFrom: "mahito",
    evolutionOnly: true,
    unlockRequirement: "evolution_true-mahito"
  },
  {
    id: "todo",
    name: "Todo",
    element: "Water",
    rarity: "Mythic",
    chance: 530000,
    category: ["Army", "Hero", "Jujutsu", "Supporter", "Human"],
    requiredWeather: "Raining",
    stats: { hp: 29400, atk: 1790 },
    passive: {
      name: "Besto Friendo",
      description: "While in the backline, allies with follow-up chance at most 53% gain +5.3% follow-up chance. Once per match, block an ally’s fatal hit and swap them with the ally with the highest current HP.\nAttacks have a 53% chance to call a random ally for a follow-up dealing 53% of that ally’s ATK."
    },
    image: "assets/cards/todo.png",
    questOnly: true,
    unlockRequirement: "quest_todo"
  },
  {
    id: "dagon",
    name: "Dagon",
    element: "Water",
    rarity: "Secret",
    chance: 2200000,
    category: ["Jujutsu", "Unhuman", "Magician", "Villian", "Brutal", "Army"],
    requiredWeather: "Raining",
    stats: { hp: 46100, atk: 4230 },
    passive: {
      name: "Water Manipulation",
      description: "Burn is instantly cleansed and grants a 50% HP shield. Every 3 attacks, summon a frontline clone with 25% HP and 100% ATK.\nClone: Shark inflicts 1-turn Bleed (25% ATK) every 2 attacks; Whales stuns its killer for 2 turns; Fish survives 3 fatal hits."
    },
    image: "assets/cards/dagon.png"
  },
  {
    id: "choso",
    name: "Choso",
    element: "Fire",
    rarity: "Secret",
    chance: 3850000,
    category: ["Unhuman", "Jujutsu", "AntiHero", "Human"],
    requiredWeather: "Eclipse",
    stats: { hp: 31000, atk: 11800 },
    passive: {
      name: "Blood Technique",
      description: "Cleanse incoming Bleed and reflect it at 50% damage (3-turn cooldown). While Bleeding, use a random attack: Pierce Blood hits 4 enemies for 120% / 90% / 60% / 30% ATK; Blood Edge grants +15% crit chance and +25% crit damage for this attack; Flowing Blood deals 120% ATK and heals 10% HP."
    },
    image: "assets/cards/choso.png"
  },
  {
    id: "haruta",
    name: "Haruta",
    element: "Electric",
    rarity: "Mythic",
    chance: 0,
    category: ["AntiHero", "Jujutsu", "Human"],
    stats: { hp: 10900, atk: 4150 },
    passive: {
      name: "Coward",
      description: "Attacking the enemy with the lowest ATK grants +200% ATK for that attack. Attacking any other enemy grants 10% incoming damage reduction until the next attack. Bonuses do not stack."
    },
    image: "assets/cards/haruta.png",
    raidOnly: true,
    unlockRequirement: "raid_shibuya_haruta"
  },
  {
    id: "mechamaru",
    name: "Mechamaru",
    element: "Electric",
    rarity: "Secret",
    chance: 2800000,
    category: ["Jujutsu", "AntiHero", "Army", "Magician", "Supporter", "Human"],
    requiredWeather: "Reaper",
    stats: { hp: 29000, atk: 7090 },
    passive: {
      name: "Puppet Manipulation",
      description: "When an ally or enemy dies permanently, summon a frontline puppet with 50% of their original HP/ATK and their passive (1 active puppet). Puppets are immune to Stun/Freeze and heal 2% HP on every attack."
    },
    image: "assets/cards/mechamaru.png"
  },
  {
    id: "hanami",
    name: "Hanami",
    element: "Nature",
    rarity: "Mythic",
    chance: 1820000,
    category: ["Unhuman", "Jujutsu", "Brutal", "Magician", "Villian"],
    requiredWeather: "Wind",
    stats: { hp: 42700, atk: 3920 },
    passive: {
      name: "Flower Field",
      description: "On entry, gain a 100% HP shield; while shielded, ignore passive attacks. Every 3 attacks, 28% chance to hypnotize the target for 1 turn: 82% chance to attack their own teammate."
    },
    image: "assets/cards/hanami.png"
  },
  {
    id: "sukuna-shibuya",
    name: "Sukuna Shibuya",
    element: "Fire",
    rarity: "Secret",
    chance: 9999999,
    category: ["Jujutsu", "PureEvil", "Brutal", "Villian", "AntiVillian"],
    requiredWeather: "Malevolent",
    stats: { hp: 63600, atk: 5830 },
    passive: {
      name: "FUGA x Domain",
      description: "Every attack gains 1 Fuga and heals 3% HP. Once per match, a fatal hit revives this card at the frontline and opens a Fuga-turn domain dealing 9% ATK to all enemies every turn. If Fuga > 9, also strike all enemies for xFuga ATK on revival. Cannot be cloned or revived by allies."
    },
    image: "assets/cards/sukunashibuya.png",
    questOnly: true,
    unlockRequirement: "quest_sukuna-shibuya"
  },
  {
    id: "goku-ssj3",
    name: "Goku SSJ3",
    element: "Electric",
    rarity: "Secret",
    chance: 3000000,
    category: ["DragonWarrior", "Hero", "Protagonist", "Unhuman"],
    requiredWeather: "Sunny",
    stats: { hp: 25500, atk: 10115 },
    passive: {
      name: "Dragon Combo",
      description: "Each main attack can chain 30% follow-ups (30% ATK each). Each follow-up adds +5% damage to the next main attack, then resets. A chain of 3+ also hits all enemies for 30% ATK. DragonWarrior allies gain +5% Crit Chance."
    },
    image: "assets/cards/gokussj3.png"
  },
  {
    id: "vegeta-ssj2",
    name: "Vegeta SSJ2",
    element: "Water",
    rarity: "Secret",
    chance: 2000000,
    category: ["DragonWarrior", "Hero", "AntiHero", "Protagonist", "Unhuman", "Brutal"],
    requiredWeather: "Sunny",
    stats: { hp: 20200, atk: 7560 },
    passive: {
      name: "Saiyan Prince",
      description: "On the 10th main attack, hit all enemies for x10 ATK, ignoring damage reduction. Each attack adds +1% ATK (max +100%); at +100%, heal fully and reset this bonus. Each hit on allied Bulma adds +5% ATK (separate +100% cap). Block Bulma’s first fatal hit and swap with her while alive."
    },
    image: "assets/cards/vegetassj2.png"
  },
  {
    id: "broly",
    name: "Broly",
    element: "Nature",
    rarity: "Secret",
    chance: 0,
    category: ["DragonWarrior", "Hero", "AntiHero", "AntiVillian", "Brutal", "Unhuman"],
    stats: { hp: 31200, atk: 12200 },
    passive: {
      name: "LEGENDARY SUPER SAIYAN",
      description: "Each combat turn grants +1.2% ATK. On turns Broly attacks, gain another +1.8% ATK (+3% total). Bonuses add from starting ATK, without a stack cap. Secret Namek Portal: Solo 100%, Party 10%."
    },
    image: "assets/cards/broly.png",
    portalOnly: true
  },
  {
    id: "ultimate-gohan",
    name: "Ultimate Gohan",
    element: "Holy",
    rarity: "Mythic",
    chance: 0,
    category: ["DragonWarrior", "Hero", "Human"],
    stats: { hp: 21860, atk: 6950 },
    passive: {
      name: "MASENKOO",
      description: "First entry: +15% Crit Chance and +30% Crit Damage. While not attacking, an ally’s critical hit triggers a 150% ATK follow-up. DragonWarrior allies gain +5% Crit Chance."
    },
    image: "assets/cards/ultimategohan.png",
    evolutionOnly: true,
    evolvesFrom: "gohan"
  },
  {
    id: "golden-frieza",
    name: "Golden Frieza",
    element: "Electric",
    rarity: "Mythic",
    chance: 0,
    category: ["Villian", "PlanetDestroyer", "Brutal", "AntiHero", "DragonWarrior", "Unhuman"],
    stats: { hp: 21875, atk: 5350 },
    passive: {
      name: "Supernova",
      description: "First main attack targets the enemy with the lowest ATK. Each attack has a 30% chance to pierce up to 3 enemies for 50% ATK each. While not attacking, allies gain +10% HP/ATK and enemy healing is reduced by 20%; this aura does not compound."
    },
    image: "assets/cards/goldenfrieza.png",
    evolutionOnly: true,
    evolvesFrom: "frieza"
  },
  {
    id: "pennywise",
    name: "Pennywise",
    element: "Dark",
    rarity: "Secret",
    chance: 27000000,
    category: ["Villian", "Brutal", "PureEvil", "Unhuman", "Alternative"],
    requiredWeather: "Tsukuyomi",
    stats: { hp: 95000, atk: 9000 },
    passive: {
      name: "The Deadlights",
      description: "First entry: open a 10-turn Domain. Each turn, enemies gain Fear (15% miss; no stacking).\nFirst attack against an untouched enemy: 27% chance to Hypnotize for 3 target turns (80% friendly fire).\nFatal damage during Domain: revive at the back with 50% pre-hit HP and x0.8 ATK. Reopen Domain for floor(remaining turns / 2). Max 5 revives/match."
    },
    image: "assets/cards/pennywise.png",
    origin: "Tsuyokumi - Spooky Exclusive",
    capsuleOnly: true,
    spookyExclusive: true
  },
  {
    id: "tower-champion-raining-200",
    name: "Florentino",
    element: "Water",
    rarity: "Secret",
    chance: 12000000,
    category: ["VideoGame", "Human", "Brutal", "Swordman", "AntiVillian"],
    requiredWeather: "Raining",
    stats: { hp: 45000, atk: 17400 },
    passive: {
      name: "Flower Dance",
      description: "Every 3 attacks: 80% chance to follow up for 60% ATK. Up to 3 follow-ups; chance falls by 20 percentage points per hit (80%, 60%, 40%). A chain of 3 grants immunity to all status effects for 3 turns."
    },
    image: "assets/cards/florentino.png",
    towerType: "raining",
    towerFloor: 200,
    unlockRequirement: "tower_floor_200_raining"
  },
  {
    id: "tower-champion-sugar-200",
    name: "Kafka",
    element: "Fire",
    rarity: "Secret",
    chance: 11750000,
    category: ["VideoGame", "Villian", "Supporter", "Swordman", "Human", "Gunner"],
    requiredWeather: "Sugar",
    stats: { hp: 100000, atk: 6200 },
    passive: {
      name: "Manipulator",
      description: "While supporting, a teammate applying any status effect triggers Spider Web on that enemy (2-turn cooldown). Deals all remaining Burn/Bleed/DoT damage immediately without consuming those effects."
    },
    image: "assets/cards/kafka.png",
    towerType: "sugar",
    towerFloor: 200,
    unlockRequirement: "tower_floor_200_sugar"
  },
  {
    id: "tower-champion-sunny-200",
    name: "Escanor The Indomitable",
    element: "Holy",
    rarity: "Secret",
    chance: 15000000,
    category: ["AntiVillian", "Alternative", "Sins", "Brutal", "VideoGame", "Human", "Hero"],
    requiredWeather: "Sunny",
    stats: { hp: 37500, atk: 14300 },
    passive: {
      name: "Ultimate Divine Lance",
      description: "Every 3 attacks: 180% ATK strike; Burn 3 enemies for 2 turns at 20% ATK/turn. Every 10 attacks: x2 ATK to all enemies; Burn all for 5 turns at 100% ATK/turn. Attack 10 grants the team +50% ATK for the match. While alive, doubles teammates’ Burn damage."
    },
    image: "assets/cards/escanorindomitable.png",
    towerType: "sunny",
    towerFloor: 200,
    unlockRequirement: "tower_floor_200_sunny"
  },
  {
    id: "tower-champion-reaper-200",
    name: "Yhwach Omniscience",
    element: "Water",
    rarity: "Secret",
    chance: 16000000,
    category: ["Villian", "Hero", "Alternative", "Unhuman", "Swordman", "Bleach", "Mastermind", "Army"],
    requiredWeather: "Reaper",
    stats: { hp: 58000, atk: 14200 },
    passive: {
      name: "Auswahlen",
      description: "Attacks have 60% chance to Bleed for 2 turns at 30% ATK/turn. While alive, heals for all enemy Bleed damage; each enemy kill grants +10% ATK; absorbs 10% of a fallen teammate’s HP/ATK. Last ally standing: +35% damage against bleeding enemies and blocks status effects (3-turn cooldown)."
    },
    image: "assets/cards/yhwachomniscience.png",
    towerType: "reaper",
    towerFloor: 200,
    unlockRequirement: "tower_floor_200_reaper"
  },
  {
    id: "boss-event-ragna",
    name: "Ragna",
    element: "Water",
    rarity: "Secret",
    chance: 0,
    category: ["Hero", "AntiVillian", "Brutal", "DragonWarrior", "Swordman", "Unhuman"],
    stats: { hp: 56800, atk: 13900 },
    passive: {
      name: "Dragon Slayer",
      description: "Critical hits Freeze the target for 2 turns. Every attack gains 1–5 Rage (max 300). Fatal damage with at least 100 Rage consumes 100 to revive at the frontline with 50% max HP. Retains all stat buffs and gains another +20% ATK each revival."
    },
    image: "assets/cards/ragna.png",
    bossEventOnly: true,
    eventType: "ragna"
  },
  {
    id: "woltekamui",
    name: "Woltekamui",
    element: "Electric",
    rarity: "Secret",
    chance: 22000000,
    category: ["Villian", "Unhuman", "DragonWarrior", "Magician", "PureEvil", "Brutal"],
    requiredWeather: null,
    stats: { hp: 72000, atk: 17700 },
    passive: {
      name: "Godlike Speed",
      description: "Immune to Freeze; takes 50% Burn damage. Attacks can chain follow-ups: 22% initial chance, +5 percentage points per successive follow-up (max 72%). Each deals 50% ATK and heals 1% max HP on hit. 22% dodge; a successful dodge makes the next attack inflict Bleed for 3 turns at 40% ATK/turn. More than 3 consecutive follow-ups stun a bleeding target for 1 turn."
    },
    image: "assets/cards/woltekamui.png",
    questOnly: true,
    unlockRequirement: "quest_card_woltekamui"
  },
  {
    id: "kagurabachi",
    name: "Kagurabachi",
    element: "Water",
    rarity: "Secret",
    chance: 100000000,
    category: ["Protagonist", "Hero", "Swordman", "Human", "Brutal"],
    requiredWeather: null,
    stats: { hp: 121000, atk: 29600 },
    passive: {
      name: "Enten",
      description: "Each attack rotates Nishiki → Kuro → Aka → Sai.\nNishiki: 3 hits, 50% ATK each; +30% dodge until the next own turn.\nKuro: pierces 3 enemies for 130% / 90% / 50% ATK; halves their dodge chance.\nAka: shield for 50% max HP, lasting 2 turns; reflects 50% of the next incoming attack.\nSai: 90% ATK to all enemies; Bleed for 2 turns at 20% ATK/turn.\nFirst fatal hit: survive at 1 HP and reset to Nishiki, once per match."
    },
    image: "assets/cards/kagurabachi.png"
  },
  {
    id: "the-mourner",
    name: "The Mourner",
    element: "Dark",
    rarity: "Secret",
    chance: 168000000,
    category: ["VideoGame", "Human", "Supporter", "Gunner"],
    requiredWeather: "Eclipse",
    stats: { hp: 149000, atk: 36500 },
    passive: {
      name: "The Solemn Lament",
      description: "Start: 10 Living + 10 Departed Ammo; 0 Lament. Attacks: 70% one random bullet, 30% both.\nLiving: 90% ATK; heals 2% max HP (4% below half HP). Departed: 80% ATK; adds 1 Butterfly (max 10), +5% damage taken per mark; Bleed 1 turn at 5% ATK.\nMarked enemy dies: +2 Lament and heal 2.5% max HP per Butterfly. Any hit taken: +1 Lament. Reload: +3. Each Lament: +3% ATK (max 15 / +45%).\nEvery 10th attack: Final Requiem, 220% ATK to all enemies; consumes ordinary / Crystal Butterflies for 5% / 10% of each target’s current HP per mark, ignoring damage reduction (shields / immunity still work). Revives one dead teammate at full HP at the front for 3 battle turns, retaining stats and Relic. Loses 10 Lament and 15% max HP (nonfatal).\nEither chamber empty: skip next attack to refill both to 10, heal 30% max HP and gain 3 Lament. Stun / Freeze interrupts the pending Reload: lose all ammo, no Lament, Burn for 2 turns at 10% ATK.\nWith 2+ unique debuffs: +25% damage, apply 2 Butterflies per hit, Living healing becomes +20% ATK damage ignoring reduction, external healing -90%, immune to Stun / Freeze.\nOnce per match, first reaching 15 Lament replaces the next attack (including Requiem) with 3 Crystal Butterflies per enemy, outside the ordinary cap: +10% damage taken each; Bleed 3 turns at 15% ATK. After the following 10th-attack Requiem, fully heal and restore 5 Ammo of each type. Reloads never reset the cumulative attack counter."
    },
    image: "assets/cards/themourner.png",
    questOnly: true,
    unlockRequirement: "quest_card_the-mourner"
  },
  {
    id: "itachi-awakened",
    name: "Itachi Awakened",
    element: "Fire",
    rarity: "Secret",
    chance: 0,
    category: ["Ninja", "Human", "AntiHero", "Brutal", "Mastermind"],
    requiredWeather: null,
    stats: { hp: 38000, atk: 9300 },
    passive: {
      name: "Mangekyou Awakening",
      description: "Each attack draws one unused technique. After the pool is spent, skip 5 own turns, then refill; Izanami is removed after its first use.\nTsukuyomi: 110% ATK ignoring shields; Stun 1 turn and +10% damage taken for 2 turns.\nAmaterasu: Black Flame for 3 turns (25% ATK/turn); uncleansable Burn, spreading to another enemy if the target already has Burn.\nSusanoo: 150% ATK; seal a surviving target below 15% HP (cannot clone/revive). Gain 30% max HP shield, reflecting 50% incoming damage while it remains.\nShackling Stakes: 50% ATK to all enemies, 15% miss chance for 2 turns.\nGreat Fireball: 120% ATK to target and 30% ATK to up to 3 other random enemies.\nEphemeral: 50% ATK; Stun 2 turns without a shield, otherwise another 70% ATK ignoring shield.\nYasaka Magatama: 180% ATK to target and 40% to its two nearest allies.\nIzanami (once): 200% ATK. Survivor loses passive/healing for 3 turns and Itachi loses 20% max HP (non-lethal); a kill heals Itachi for 20% max HP.\nCrow Clone: 30% max HP / 40% ATK; attacks next team turn, 30% dodge; death deals 200% clone ATK to nearby enemies.\nSharingan Copy: returns 60% of the last enemy attack damage.\nFirst fatal hit: revive at 50% HP, remove attacker buffs and Stun 2 turns. Second fatal hit: revive at 30% HP, cleanse self and restore base ATK. Each revival once."
    },
    image: "assets/cards/itachiawa.png",
    evolutionOnly: true,
    evolvesFrom: "uchiha-itachi"
  },
  {
    id: "konan",
    name: "Konan",
    element: "Nature",
    rarity: "Mythic",
    chance: 2900000,
    category: ["Ninja", "Human", "Villian", "Magician", "Supporter"],
    requiredWeather: "Wind",
    stats: { hp: 32200, atk: 7900 },
    passive: {
      name: "Paper Genkai",
      description: "Attacks add 1 Paper to the target; each reduces incoming damage reduction by 1 percentage point. With 5+ Paper, a newly granted shield breaks and consumes 5 stacks.\n20% dodge; a dodge heals 10% max HP and grants +5% ATK.\nDeath: apply 5–25 Paper to every enemy. Cannot be cloned or revived."
    },
    image: "assets/cards/konan.png"
  },
  {
    id: "kisame-hoshigaki",
    name: "Kisame Hoshigaki",
    element: "Water",
    rarity: "Mythic",
    chance: 3300000,
    category: ["Ninja", "Human", "Villian", "Brutal", "Swordman"],
    requiredWeather: "Raining",
    stats: { hp: 36400, atk: 8900 },
    passive: {
      name: "Samehada",
      description: "Start: Water Domain for 3 battle turns. Enemies attacking Kisame inside it have a 50% chance to gain Hindered for 2 turns.\nAttacking a shielded enemy grants a shield equal to 50% ATK for 5 turns.\nAttacks inside the Domain grant permanent +3% ATK and +3% HP, stacking additively without a cap."
    },
    image: "assets/cards/kisame.png"
  },
  {
    id: "deidara",
    name: "Deidara",
    element: "Fire",
    rarity: "Mythic",
    chance: 3450000,
    category: ["Ninja", "Human", "Villian", "Brutal", "Magician"],
    requiredWeather: "Sunny",
    stats: { hp: 46700, atk: 2900 },
    passive: {
      name: "Clay Genkai",
      description: "Every 3rd attack blasts up to 3 random enemies for 40% ATK each. While an ally attacks, 40% chance to strike a random enemy for 50% of that ally's ATK. Death: 500% ATK to all enemies. Cannot be cloned or revived."
    },
    image: "assets/cards/deidara.png"
  },
  {
    id: "sasori",
    name: "Sasori",
    element: "Dark",
    rarity: "Mythic",
    chance: 4600000,
    category: ["Ninja", "Human", "Villian", "Brutal", "Mastermind"],
    requiredWeather: "Reaper",
    stats: { hp: 69700, atk: 4300 },
    passive: {
      name: "Puppet Genkai",
      description: "Start: choose a Puppet ally, preferring the frontline. Puppet gains +10% ATK, +15% HP and +10 percentage points to clone-summon chances. Without a clone passive, heals 1% HP each turn instead.\nWhen the Puppet dies, choose another ally and carry forward its passive skills. Stat bonuses apply once per Puppet, not once per inherited skill.\nSasori's death instantly kills the current Puppet. Cannot be cloned or revived."
    },
    image: "assets/cards/sasori.png"
  },
  {
    id: "kakuzu",
    name: "Kakuzu",
    element: "Holy",
    rarity: "Secret",
    chance: 5800000,
    category: ["Ninja", "Human", "Villian", "Brutal", "Hunter"],
    requiredWeather: "Shadow",
    stats: { hp: 38800, atk: 9500 },
    passive: {
      name: "Grudge Fear",
      description: "Each kill grants 1 Heart (max 5), with independent 33% chance to steal a passive and 66% chance to steal the enemy's element.\nUse the best offensive advantage among owned elements. Attacks countering a stolen element deal x1.5 instead of x3; original-element weaknesses stay normal.\nFatal hit: consume 1 Heart, revive at 50% max HP and lose one random stolen passive and element."
    },
    image: "assets/cards/kakuzu.png"
  },
  {
    id: "hidan",
    name: "Hidan",
    element: "Nature",
    rarity: "Secret",
    chance: 6960000,
    category: ["Ninja", "Human", "Villian", "Brutal", "PureEvil"],
    requiredWeather: "Malevolent",
    stats: { hp: 78600, atk: 7200 },
    passive: {
      name: "Undead Genkai",
      description: "Attacking a bleeding enemy has 66% chance to apply Voodoo for 3 turns. Reflect 50% of damage taken from a Voodoo enemy back to them.\nAll healing attempts become an equal percentage of temporary ATK for 5 turns instead of restoring HP."
    },
    image: "assets/cards/hidan.png"
  },
  {
    id: "zetsu",
    name: "Zetsu",
    element: "Nature",
    rarity: "Secret",
    chance: 7450000,
    category: ["Ninja", "Unhuman", "Villian", "Supporter", "Mastermind"],
    requiredWeather: "Tsukuyomi",
    stats: { hp: 35300, atk: 8600 },
    passive: {
      name: "White / Black",
      description: "Start in a random stance. White: copy enemy frontline stats x1.15 once; do not copy its passive and have no passive afterward. Black: give 50% of own HP/ATK to a random ally, share the other 50% among remaining allies, then die immediately. Cannot be cloned or revived."
    },
    image: "assets/cards/zetsu.png"
  },
  {
    id: "orochimaru",
    name: "Orochimaru",
    element: "Nature",
    rarity: "Secret",
    chance: 6350000,
    category: ["Ninja", "Human", "Villian", "Brutal", "Mastermind", "Unhuman"],
    requiredWeather: "Eclipse",
    stats: { hp: 59700, atk: 3700 },
    passive: {
      name: "Snake Genkai",
      description: "25% chance per attack to inflict Poison for 3 turns at 10% ATK/turn. Poison ignores shields and damage reduction, but cannot kill.\nWhile alive, revive each fallen teammate once per match at the back with 130% of their starting battle stats, retaining their Relic and passive.\nSelf-revives once at the back with 50% max HP. Cannot be cloned or revived externally."
    },
    image: "assets/cards/orochimaru.png"
  },
  {
    id: "pain",
    name: "Pain",
    element: "Electric",
    rarity: "Secret",
    chance: 0,
    category: ["Ninja", "Human", "Villian", "Brutal", "Mastermind", "Army"],
    requiredWeather: null,
    stats: { hp: 75700, atk: 18500 },
    passive: {
      name: "Rinnegan",
      description: "Start in a random Path. Each kill completes it and selects an unused Path.\nDeva: charge for 3 own turns, immune to passive attacks while charging; then 200% ATK to all enemies.\nAsura: +25% ATK/+25% HP while active; every 3 battle turns gains a shield equal to 25% ATK.\nAnimal: 50% chance per attack for the ally behind Pain to follow up.\nPreta: heal 25% of damage dealt and 10% of damage taken.\nHuman: 20% chance to Hypnotize for 1 turn, with 80% chance to attack an ally.\nNaraka: 25% chance to disable the target's passive next turn and heal all allies for 10% Pain max HP.\nAfter completing all 6 Paths, become Nagato and summon one set of 6 Path clones at the back, each with 20% of Pain's current stats. Each Nagato attack calls 1–6 living clones for follow-ups. Clones cannot summon further clones."
    },
    image: "assets/cards/pain.png",
    raidOnly: true,
    raidType: "akatsuki",
    unlockRequirement: "raid_card_pain"
  },
  {
    id: "dumb-titan",
    name: "Dumb Titan",
    element: "Nature",
    rarity: "Common",
    chance: 30,
    category: ["Titan", "Unhuman", "Brutal", "Villian"],
    requiredWeather: null,
    stats: { hp: 390, atk: 96 },
    passive: {
      name: "Stomp",
      description: "One outcome per attack: 30% miss; 10% hit and Stun the target for 1 turn; 60% hit and strike another enemy for 50% ATK."
    },
    image: "assets/cards/dumbtitan.png"
  },
  {
    id: "war-hammer-titan",
    name: "War Hammer Titan",
    element: "Water",
    rarity: "Secret",
    chance: 29000000,
    category: ["Titan", "Unhuman", "Brutal", "Villian", "Mastermind"],
    requiredWeather: "Rumbling",
    stats: { hp: 60900, atk: 14900 },
    passive: {
      name: "Crystal Heart",
      description: "If first in the lineup, permanently sacrifice all teammates and create a Crystal at the back with their combined max HP. While Crystal lives: survive fatal hits, each costing Crystal 500% of this card ATK; gain 60% damage reduction and heal 1% current HP every turn. Every 5th attack chooses a mode for the next 5 attacks: HAMMER hits 2 enemies for 60% ATK each; SPEAR deals half its damage through shields and half to shields."
    },
    image: "assets/cards/warhammer.png"
  },
  {
    id: "jaw-titan",
    name: "Jaw Titan",
    element: "Nature",
    rarity: "Mythic",
    chance: 1345000,
    category: ["Titan", "Unhuman", "Brutal", "Villian", "Animal"],
    requiredWeather: "Rumbling",
    stats: { hp: 25500, atk: 6200 },
    passive: {
      name: "Iron Jaw",
      description: "Every attack gains a shield equal to 10% of actual damage dealt, lasting 2 turns. Can attack while Stunned at 70% damage; Freeze still prevents attacking."
    },
    image: "assets/cards/jawtitan.png"
  },
  {
    id: "armored-titan",
    name: "Armored Titan",
    element: "Electric",
    rarity: "Secret",
    chance: 45000000,
    category: ["Titan", "Unhuman", "Brutal", "Villian"],
    requiredWeather: "Rumbling",
    stats: { hp: 131000, atk: 8000 },
    passive: {
      name: "Titan Shield",
      description: "On entry, grant all teammates a shield equal to 50% of this card max HP for the rest of the match. While not attacking, when a teammate shield breaks, grant a shield equal to 50% of that broken shield and Stun the attacker for 3 turns (once per teammate)."
    },
    image: "assets/cards/armoredtitan.png"
  },
  {
    id: "eren-rumbling",
    name: "Eren",
    element: "Dark",
    rarity: "Secret",
    chance: 0,
    category: ["Titan", "TitanSlayer", "Human", "Protagonist", "AntiHero", "Brutal"],
    requiredWeather: null,
    stats: { hp: 91300, atk: 22300 },
    passive: {
      name: "Titan Wrath",
      description: "On fatal damage, revive once per match: gain +250% HP bonus, fully heal, and gain +35% ATK permanently. On killing a Titan-category enemy, absorb 50% of its ATK and append its passive skill."
    },
    image: "assets/cards/eren.png",
    riftOnly: true,
    riftType: "rumbling"
  },
  {
    id: "beast-titan",
    name: "Beast Titan",
    element: "Holy",
    rarity: "Secret",
    chance: 18000000,
    category: ["Titan", "Unhuman", "Brutal", "Villian", "Animal"],
    requiredWeather: "Rumbling",
    stats: { hp: 48800, atk: 18700 },
    passive: {
      name: "Rock Throw",
      description: "Every turn not attacking, charge 1–2 Rock (uncapped). On attacking, throw all stored rocks at random enemies; each rock deals 50% ATK and can destroy an entire shield."
    },
    image: "assets/cards/beasttitan.png"
  },
  {
    id: "michael-kaiser",
    name: "Michael Kaiser",
    element: "Holy",
    rarity: "Secret",
    chance: 15000000,
    category: ["Baller", "Human", "AntiHero", "Brutal"],
    requiredWeather: null,
    stats: { hp: 57700, atk: 22000 },
    passive: {
      name: "Predator Instinct",
      description: "On each own active attack turn: 60% chance to skip attacking and gain 1 EyE stack (max 4). While EyE > 0: 20% incoming damage reduction.\nWhen choosing to attack, consume all EyE: 1 = 120% ATK; 2 = 150% ATK plus 30% ATK directly through shields if the target was shielded; 3 = 150% ATK ignoring shields; 4 = 180% ATK ignoring damage reduction.\nEXECUTE: A special EyE attack against a target already below 10% max HP instantly kills it, bypassing revival and death prevention. Out-of-turn follow-ups do not charge or consume EyE."
    },
    image: "assets/cards/kaiser.png",
    unlockRequirement: "penalty_predators_eye"
  },
  {
    id: "isagi-yoichi",
    name: "Isagi Yoichi",
    element: "Electric",
    rarity: "Secret",
    chance: 22400000,
    category: ["Baller", "Human", "Protagonist", "Hero"],
    requiredWeather: null,
    stats: { hp: 66600, atk: 16300 },
    passive: {
      name: "Metavision",
      description: "Attacks by Isagi or allies apply 1 Read to each attacked enemy (max 3); Isagi taking HP damage also applies 1 Read to the attacker. Each Read gives the team +5% damage dealt and 1% damage reduction against that enemy, while an allied Isagi is alive.\nDIRECT SHOT: Isagi attacking a target with 3 Read deals 150% ATK and ignores 25% of its damage reduction.\nEGOIST GROWTH: On a 3-Read enemy's death, heal 15% of that enemy max HP and gain +10% base ATK permanently (max 5 growth stacks).\nDESPERATION: Below 35% HP, allied hits against Read-marked enemies splash 50% damage to one other random enemy. First entry below this threshold grants Stun immunity for 2 own turns. Read aura bonuses from multiple Isagis use the highest stack count, not a sum."
    },
    image: "assets/cards/isagi.png",
    unlockRequirement: "penalty_egoist_metavision"
  },
  {
    id: "don-lorenzo",
    name: "Don Lorenzo",
    element: "Dark",
    rarity: "Secret",
    chance: 55500000,
    category: ["Baller", "Human", "AntiVillian", "Brutal"],
    requiredWeather: null,
    stats: { hp: 142000, atk: 8700 },
    passive: {
      name: "Ace Eater",
      description: "Intercept 40% of damage that would reach an ally after their shield/defenses. Only one Lorenzo intercepts each hit; redirected damage cannot redirect again. Each incoming attack hit grants 1 Zombie (max 10).\nREGENERATION: On each own turn, heal the ally with the lowest current HP for 3% of Lorenzo max HP per Zombie. Does not spend stacks or Lorenzo HP.\nCOUNTER STRIKE: At 10 Zombie, the next own attack deals 50% of all intercepted damage since battle start to every enemy, then resets Zombie to 0. The accumulated intercepted total is retained."
    },
    image: "assets/cards/lorenzo.png",
    unlockRequirement: "penalty_ace_eater"
  },
  {
    id: "meliodas",
    name: "Meliodas",
    element: "Dark",
    rarity: "Mythic",
    chance: 0,
    category: ["Sins", "Protagonist", "Hero", "Unhuman", "Brutal", "Swordman"],
    requiredWeather: null,
    stats: { hp: 118000, atk: 45100 },
    passive: {
      name: "Hellblaze",
      description: "When attacked by a Magician, 50% chance to negate the attack and counter for 150% of its damage. Counter/redirect damage cannot recursively counter. While on the team, allied Black Flame kills bypass fatal survival and revival. +50% Crit Damage and +10% Crit Chance per other Sins teammate (excluding self)."
    },
    image: "assets/cards/meliodas.png",
    bossEventOnly: true
  },
  {
    id: "ban",
    name: "Ban",
    element: "Fire",
    rarity: "Secret",
    chance: 20000000,
    category: ["Sins", "Protagonist", "Hero", "Unhuman", "Brutal"],
    requiredWeather: "Eclipse",
    stats: { hp: 74900, atk: 18300 },
    passive: {
      name: "Snatch",
      description: "While Ban is alive, all Burn, Black Flame, Bleed and Poison ticks deal 125% damage (one global aura, no duplicate stacking). Each attack steals up to 10 percentage points from one active percentage buff on its target. The source loses that portion; Ban keeps it for 3 own turns, and it never returns when his stolen buff expires."
    },
    image: "assets/cards/ban.png"
  },
  {
    id: "diane",
    name: "Diane",
    element: "Nature",
    rarity: "Secret",
    chance: 19999999,
    category: ["Sins", "Protagonist", "Hero", "Unhuman", "Brutal"],
    requiredWeather: "Lucky",
    stats: { hp: 63700, atk: 15600 },
    passive: {
      name: "Envy Creation",
      description: "When starting in the lead slot, create one clone of an eligible Nature teammate/enemy each battle turn. Each original entity can be cloned once; generated/uncloneable units cannot be copied. Clones retain the target passive and have 50% of Diane's HP/ATK. Maximum 3 active/3 created clones. Allied clones gain +10% base HP/ATK while Diane is alive at creation. Nature attacks against Electric deal x4 instead of x3."
    },
    image: "assets/cards/diane.png"
  },
  {
    id: "king-harlequin",
    name: "King Harlequin",
    element: "Nature",
    rarity: "Secret",
    chance: 27000000,
    category: ["Sins", "Protagonist", "Hero", "Unhuman", "Magician", "Supporter"],
    requiredWeather: "Wind",
    stats: { hp: 106000, atk: 6500 },
    passive: {
      name: "Disaster",
      description: "Negate a fatal hit on a teammate and absorb 25% of that hit's damage, up to 3 times per match. Attacks against an enemy never attacked this match add 10% of that enemy's Max HP as damage. Starting in the lead slot grants teammates shields equal to 150% of King's Max HP. While King is above 50% HP, enemy shield gains are reduced by 25%."
    },
    image: "assets/cards/kingharlequin.png"
  },
  {
    id: "gowther",
    name: "Gowther",
    element: "Holy",
    rarity: "Secret",
    chance: 26000000,
    category: ["Sins", "Protagonist", "Hero", "Unhuman", "Magician", "Supporter"],
    requiredWeather: "Sugar",
    stats: { hp: 83200, atk: 20300 },
    passive: {
      name: "Puppet Invasion",
      description: "Each attack has a 20% chance to Hypnotize for 2 turns (80% chance to attack a teammate); successful application grants 1 Lust. With Lust, incoming attacks receive 50% damage reduction and consume 1 Lust after damage is calculated. At 4+ Lust, gain 50% dodge. Dodged attacks do not consume Lust."
    },
    image: "assets/cards/gowther.png"
  },
  {
    id: "escanor-the-one",
    name: "Escanor The One",
    element: "Fire",
    rarity: "Mythic",
    chance: 0,
    category: ["Sins", "Hero", "Human", "Brutal"],
    requiredWeather: null,
    stats: { hp: 24300, atk: 9300 },
    passive: {
      name: "The One",
      description: "Gain 1 SunShine on each own turn (max 12); external healing and ally buffs cannot affect this card. At 12, enter The One for 5 own turns: +150% ATK, immune to Stun, Freeze and ATK debuffs; attacks against Frozen or Water targets deal x1.5 and cleanse Freeze; attacks instantly break enemy shields. A fatal hit in The One revives at 50% Max HP and clears mode/SunShine; can recur after charging again. Outside The One, if an attack leaves a target's shield intact, apply Burn for 2 turns (50% ATK/turn) and blast up to two nearby enemies for the damage of that attack."
    },
    image: "assets/cards/escanortheone.png",
    evolutionOnly: true,
    evolvesFrom: "weather-solar-deity"
  },
  {
    id: "rimuru-demon-lord",
    name: "Rimuru Demon Lord",
    element: "Dark",
    rarity: "Mythic",
    chance: 0,
    category: ["Protagonist", "Unhuman", "Magician", "Supporter", "Isekai", "Mastermind"],
    requiredWeather: null,
    stats: { hp: 160000, atk: 39100 },
    passive: {
      name: "Universal Predator",
      description: "Every attack: gain 1–10 Sage (uncapped). When attacked with >3 Sage: spend 3 to heal 1% max HP. On a cleansable status with >10 Sage: spend 10 and cleanse it; Black Flame cannot be cleansed. Once per match, a fatal hit bypasses all survival/revives. With >40 Sage against a neutral/disadvantageous element: spend 40, shift to its counter; return to Dark after killing that target."
    },
    image: "assets/cards/rimurudemonlord.png",
    evolutionOnly: true,
    evolvesFrom: "rimuru"
  },
  {
    id: "veldora",
    name: "Veldora",
    element: "Electric",
    rarity: "Secret",
    chance: 86000000,
    category: ["Unhuman", "Draconic", "DragonWarrior", "Brutal", "Protagonist"],
    requiredWeather: "Raining",
    stats: { hp: 91300, atk: 34900 },
    passive: {
      name: "Storm Dragon",
      description: "On entry: strike every enemy with lower ATK for 200% ATK. A turn lost to Stun heals 15% max HP. Every 3 attacks: Stun the target for its next turn, then suppress its passive for the following turn."
    },
    image: "assets/cards/veldora.png"
  },
  {
    id: "diablo",
    name: "Diablo",
    element: "Dark",
    rarity: "Secret",
    chance: 54000000,
    category: ["Unhuman", "Villian", "Brutal", "Magician", "Supporter"],
    requiredWeather: "Eclipse",
    stats: { hp: 120000, atk: 29400 },
    passive: {
      name: "Immortal Spirit",
      description: "Every attack: 10% chance to hypnotize the enemy, skipping its next turn. When attacked by Water or an element weak against Diablo: heal 3% max HP. Lead entry, once per match: isolate Diablo and the opposing lead in a 1v1 duel; neither can receive external buffs, healing, intercepts or assistance. Isolation ends when either duelist falls."
    },
    image: "assets/cards/diablo.png"
  },
  {
    id: "benimaru-jura",
    name: "Benimaru Jura",
    element: "Fire",
    rarity: "Secret",
    chance: 95000000,
    category: ["Unhuman", "Protagonist", "Hero", "Swordman", "Brutal"],
    requiredWeather: "Sunny",
    stats: { hp: 112000, atk: 42700 },
    passive: {
      name: "Shimmering Flame",
      description: "Every 2 primary attacks: 44% chance to start a recursive follow-up chain (30% ATK per hit, 44% continuation, safety cap 24). The 2nd follow-up inflicts Burn 2 turns (30% ATK/turn). A further follow-up against a burning target adds uncleansable Black Flame 1 turn (20% ATK). After 10 primary attacks, enemies burning from this card cannot gain shields or positive buffs until that Burn ends."
    },
    image: "assets/cards/benimarujura.png"
  },
  {
    id: "yuuki-kagurazaka",
    name: "Yuuki Kagurazaka",
    element: "Holy",
    rarity: "Secret",
    chance: 0,
    category: ["Human", "Villian", "Mastermind", "AntiHero"],
    requiredWeather: null,
    stats: { hp: 126000, atk: 30900 },
    passive: {
      name: "Mammon Creator",
      description: "Start with 1,000 Soul Energy; +100 per kill. Every 3 primary attacks, spend 50 to replace the temporary extra passive with a random Card Index passive (old runtime effects cleaned up). Every attack spends 1 to heal 0.5% max HP. Fatal hit with >500 Energy: spend 500, survive and heal 33% max HP. With >1,500 Energy: immune to passive damage. Incoming Magician attacks: spend 5, take 50% damage; other attacks deal 125% damage."
    },
    image: "assets/cards/yuukikagurazaka.png",
    portalOnly: true
  },
  {
    id: "rukia-bankai",
    name: "Rukia Bankai",
    element: "Water",
    rarity: "Mythic",
    chance: 0,
    category: ["Reaper", "Swordman", "Human", "Hero", "Bleach"],
    requiredWeather: null,
    stats: { hp: 23700, atk: 5800 },
    passive: {
      name: "Hakka no Togame",
      description: "Entry: 0 Hakka (cap 100). Every 2 attacks: 60% chance to Freeze for 2 turns; a successful Freeze grants 10 Hakka. Attacking a Frozen enemy grants 3–5 Hakka and deals +30% damage. At 100 Hakka: Freeze all enemies for 5 turns, deal 500% ATK to all, then reset Hakka; when that Freeze ends, Hinder for 2 turns. Immune to Freeze; an enemy Freeze attempt grants +50% base ATK and +25% base HP, stacking additively."
    },
    image: "assets/cards/rukiabankai.png",
    evolutionOnly: true,
    evolvesFrom: "rukia"
  },
  {
    id: "ulquiorra",
    name: "Ulquiorra",
    element: "Nature",
    rarity: "Secret",
    chance: 0,
    category: ["Unhuman", "Villian", "Brutal", "Reaper", "Bleach"],
    requiredWeather: null,
    stats: { hp: 130000, atk: 49800 },
    passive: {
      name: "Resurrección Segunda Etapa",
      description: "Every attack: 75% chance to chain follow-ups (30% ATK; up to 3); each grants 1 Vista (cap 100). At 50 Vista: Murciélago for 10 own turns, +50% base ATK, chain cap 5, every 2 attacks blast 3 enemies for 70% ATK. At 100 Vista: consume 100, Resurrección for 15 own turns, +100% base ATK, shield for 9 own turns equal to 50% of total enemy max HP (cap 10x own max HP). Chain cap 10, follow-ups deal 50% ATK and gain no Vista; each heals 0.3% max HP and restores shield by 3% max HP. While shielded, cleanse normal statuses; stat debuffs and uncleansable Black Flame remain."
    },
    image: "assets/cards/ulquiorra.png",
    riftOnly: true
  },
  {
    id: "yamamoto",
    name: "Yamamoto",
    element: "Fire",
    rarity: "Secret",
    chance: 150000000,
    category: ["Reaper", "Human", "Captain", "Hero", "Bleach", "Army"],
    requiredWeather: "Reaper",
    stats: { hp: 93900, atk: 35900 },
    passive: {
      name: "Zanka No Tachi",
      description: "Each primary attack draws an unused direction, refilling after all 4. EAST: destroy the target shield, or deal 150% ATK. WEST: Burn 2 turns (80% ATK/turn); self gains Burn immunity for the next own turn. SOUTH: summon a random dead enemy with its passive and 30% of Yamamoto stats at the front for 3 battle turns; if none eligible, +30% base ATK/HP. NORTH: against Burn, deal 10% target current HP and lose 15% own current HP; otherwise Burn all enemies 2 turns (120% ATK/turn). Kills grant 1 Corpse, or 5 for own Burn kills. Death: all enemies take 10% ATK per Corpse. Cannot revive or be cloned. After death, new enemy entries receive Burn 5 turns (10% ATK/turn)."
    },
    image: "assets/cards/yamamoto.png"
  },
  {
    id: "coyote-starrk",
    name: "Coyote Starrk",
    element: "Water",
    rarity: "Secret",
    chance: 180000000,
    category: ["Unhuman", "Villian", "Reaper", "Bleach", "Gunner"],
    requiredWeather: "Reaper",
    stats: { hp: 123000, atk: 46900 },
    passive: {
      name: "Cero Metralleta",
      description: "Each primary attack randomly uses Left or Right Gun. LEFT: basic strike, then 50% follow-up chance; successive follow-ups lose 10 percentage points and gain 10 percentage points of ATK damage (starts at 50% ATK). RIGHT: 150% ATK and Hindered next turn; all living Wolves assist. Every 2 attacks summon a Wolf at the back (10% stats, no passive; active cap 10). Wolves cannot revive or be cloned. From the 7th attack onward, follow-ups blast all enemies for 30% Starrk ATK. 24% dodge; a successful dodge makes the next Left Gun initial follow-up chance 75%."
    },
    image: "assets/cards/coyotestarrk.png"
  },
  {
    id: "kisuke-urahara",
    name: "Kisuke Urahara",
    element: "Nature",
    rarity: "Secret",
    chance: 250000000,
    category: ["Reaper", "Human", "Captain", "Mastermind", "Supporter", "Bleach"],
    requiredWeather: "Reaper",
    stats: { hp: 315000, atk: 19200 },
    passive: {
      name: "Zanpakutō Benihime",
      description: "Every 3 attacks: Bleed 1 turn for 50% ATK. Against Bleed, add 10% ATK damage ignoring shield and damage reduction. Blood Shield Reconstruction: cleanse an allied Bleed and convert all remaining Bleed damage into shield (3 battle-turn cooldown). While alive, allied Bleed gains 25% of Urahara ATK per tick. On the 10th attack, Kannonbiraki for 5 own turns: attacks heal all living allies for 30% damage dealt; cleanse normal statuses on the team. Uncleansable Black Flame remains."
    },
    image: "assets/cards/kisukeurahara.png"
  },
  {
    id: "normal-arrancar",
    name: "Normal Arrancar",
    element: "Dark",
    rarity: "Common",
    chance: 1250,
    category: ["Unhuman", "Villian", "Brutal", "Reaper", "Bleach"],
    requiredWeather: "Reaper",
    stats: { hp: 1680, atk: 410 },
    passive: {
      name: "Cero",
      description: "Every 7 attacks: blast all enemies for 20% ATK."
    },
    image: "assets/cards/normalarrancar.png"
  },
  {
    id: "yoshino-junpei",
    name: "Yoshino Junpei",
    element: "Electric",
    rarity: "Rare",
    chance: 1020,
    category: ["Jujutsu", "Hero", "AntiVillian", "Human", "Magician"],
    requiredWeather: null,
    stats: { hp: 1440, atk: 351 },
    passive: {
      name: "Moon Dregs",
      description: "Once per battle, dropping below 50% HP grants a shield equal to 150% ATK for 3 own turns. If an attacker breaks this shield, Poison them for 2 turns (10% ATK per turn)."
    },
    image: "assets/cards/yoshinojunpei.png"
  },
  {
    id: "n-doul",
    name: "N Doul",
    element: "Nature",
    rarity: "Rare",
    chance: 435,
    category: ["Jojo", "Villian", "Brutal", "PureEvil"],
    requiredWeather: "Raining",
    stats: { hp: 1020, atk: 250 },
    passive: {
      name: "Geb",
      description: "Every 2 battle turns while not taking its own attack action, strike one random enemy for 50% ATK."
    },
    image: "assets/cards/ndoul.png"
  },
  {
    id: "oingo",
    name: "Oingo",
    element: "Holy",
    rarity: "Epic",
    chance: 4560,
    category: ["Jojo", "Villian", "Brutal", "Magician"],
    requiredWeather: "Tsukuyomi",
    stats: { hp: 2620, atk: 640 },
    passive: {
      name: "Khnum",
      description: "On kill, copy the defeated enemy's passive for 5 own turns alongside Khnum. Replaces the previous copy; recursive copying is blocked and copied effects are cleaned up on expiration."
    },
    image: "assets/cards/oingo.png"
  },
  {
    id: "d-arby",
    name: "D Arby",
    element: "Fire",
    rarity: "Epic",
    chance: 2570,
    category: ["Jojo", "Villian", "Magician", "PureEvil"],
    requiredWeather: "Lucky",
    stats: { hp: 1940, atk: 473 },
    passive: {
      name: "Osiris",
      description: "Landing the final killing blow doubles eligible standard victory rewards. Special drops and Auto Chess account rewards are excluded; Auto Chess round rewards respect the bonus Gold cap."
    },
    image: "assets/cards/darby.png"
  },
  {
    id: "hogus-eagle",
    name: "Hogus Eagle",
    element: "Nature",
    rarity: "Epic",
    chance: 1885,
    category: ["Jojo", "Villian", "Magician", "Animal"],
    requiredWeather: "Raining",
    stats: { hp: 1840, atk: 449 },
    passive: {
      name: "Hogus",
      description: "Every 5 attacks, Freeze the target for 2 turns. Gain +5% ATK for each currently Frozen enemy."
    },
    image: "assets/cards/hoguseagle.png"
  },
  {
    id: "vanilla-ice",
    name: "Vanilla Ice",
    element: "Dark",
    rarity: "Epic",
    chance: 805,
    category: ["Jojo", "Villian", "Brutal", "PureEvil", "Magician"],
    requiredWeather: "Raining",
    stats: { hp: 1310, atk: 320 },
    passive: {
      name: "Cream",
      description: "On entry, open a Void Domain for 3 own turns. Each attack has a 10% chance to extend it by 1 turn. While active, gain 50% dodge; successful dodges counter for 80% of the avoided damage. Counters cannot chain."
    },
    image: "assets/cards/vanillaice.png"
  },
  {
    id: "bakugo",
    name: "Bakugo",
    element: "Fire",
    rarity: "Rare",
    chance: 378,
    category: ["AntiHero", "Human"],
    requiredWeather: "Sunny",
    stats: { hp: 835, atk: 319 },
    passive: {
      name: "Explosion",
      description: "Every 3 attacks, blast up to 2 enemies for 10% ATK each."
    },
    image: "assets/cards/bakugo.png"
  },
  {
    id: "askeladd",
    name: "Askeladd",
    element: "Holy",
    rarity: "Rare",
    chance: 429,
    category: ["AntiVillain", "Swordman", "Mastermind", "Human"],
    requiredWeather: "Wind",
    stats: { hp: 878, atk: 336 },
    passive: {
      name: "Sword Style",
      description: "Each attack has a 10% chance to start follow-ups dealing 10% ATK each. Each follow-up can trigger another; chain cap 12. Compatible follow-up Relic bonuses apply."
    },
    image: "assets/cards/askeladd.png"
  },
  {
    id: "pochita",
    name: "Pochita",
    element: "Fire",
    rarity: "Epic",
    chance: 775,
    category: ["Animal", "Unhuman", "Hero", "Supporter"],
    requiredWeather: null,
    stats: { hp: 2500, atk: 150 },
    passive: {
      name: "Saw Contract",
      description: "At match start, die permanently and grant one random surviving teammate +20% ATK. Each of that teammate's attacks has a 20% chance to miss. Cannot revive or be cloned."
    },
    image: "assets/cards/pochita.png"
  },
  {
    id: "kon",
    name: "Kon",
    element: "Electric",
    rarity: "Rare",
    chance: 63,
    category: ["Animal", "Bleach", "Reaper"],
    requiredWeather: null,
    stats: { hp: 816, atk: 75 },
    passive: {
      name: "IdontKnow",
      description: "Take 50% less damage from attacks by Reaper or Bleach enemies."
    },
    image: "assets/cards/kon.png"
  },
  {
    id: "iggy",
    name: "Iggy",
    element: "Dark",
    rarity: "Epic",
    chance: 3850,
    category: ["Animal", "Jojo", "Hero"],
    requiredWeather: null,
    stats: { hp: 2640, atk: 646 },
    passive: {
      name: "The Fool",
      description: "Each attack has a 10% chance to inflict Fear for 2 turns. Fear gives each attack a 15% chance to miss."
    },
    image: "assets/cards/iggy.png"
  },
  {
    id: "pikachu",
    name: "Pikachu",
    element: "Electric",
    rarity: "Epic",
    chance: 2442,
    category: ["Animal", "VideoGame", "Hero"],
    requiredWeather: null,
    stats: { hp: 2040, atk: 498 },
    passive: {
      name: "Electric Stroke",
      description: "Every 3 attacks: 80% chance to Stun the target for 1 turn. A successful Stun has a 20% chance to also Stun all other enemies for 1 turn."
    },
    image: "assets/cards/pikachu.png"
  },
  {
    id: "ender-dragon",
    name: "Ender Dragon",
    element: "Dark",
    rarity: "Epic",
    chance: 2554,
    category: ["Animal", "VideoGame", "Villian", "Brutal", "Magician"],
    requiredWeather: "Reaper",
    stats: { hp: 2240, atk: 548 },
    passive: {
      name: "Magical Ball",
      description: "Every 5 attacks, blast all enemies for 10% ATK; 10% chance to inflict Fear on all enemies for 2 turns (15% miss chance per attack)."
    },
    image: "assets/cards/enderdragon.png"
  },
  {
    id: "onana",
    name: "Onana",
    element: "Water",
    rarity: "Rare",
    chance: 1100,
    category: ["Baller", "Hero", "Alternative", "Magician", "Mastermind"],
    requiredWeather: "Malevolent",
    stats: { hp: 1480, atk: 362 },
    passive: {
      name: "ONANA",
      description: "4% base dodge. Each failed dodge against an attack grants a stacking +4% ATK. A successful dodge removes all ATK stacks from this passive."
    },
    image: "assets/cards/onana.png"
  },
  {
    id: "zenitsu",
    name: "Zenitsu",
    element: "Electric",
    rarity: "Rare",
    chance: 1857,
    category: ["DemonSlayer", "Swordman", "Human", "Hero"],
    requiredWeather: "Sugar",
    stats: { hp: 1460, atk: 558 },
    passive: {
      name: "Thunderclap",
      description: "Every 3 attacks, pierce the enemy lineup for 100%, 70%, 40%, then 10% ATK per remaining enemy."
    },
    image: "assets/cards/zenitsu.png"
  },
  {
    id: "antony-mu",
    name: "Antony MU",
    element: "Holy",
    rarity: "Epic",
    chance: 2262,
    category: ["Baller", "Hero", "AntiHero", "AntiVillian", "Villian", "Mastermind", "Magician"],
    requiredWeather: "Reaper",
    stats: { hp: 2140, atk: 522 },
    passive: {
      name: "Spinning Trick",
      description: "When attacked, 15% chance to inflict Fear on the attacker for 3 turns (15% miss chance per attack)."
    },
    image: "assets/cards/antonymu.png"
  },
  {
    id: "tung-tung-sahur",
    name: "Tung Tung Sahur",
    element: "Nature",
    rarity: "Epic",
    chance: 3363,
    category: ["Swordman", "Hero", "Alternative", "Brutal"],
    requiredWeather: null,
    stats: { hp: 1850, atk: 708 },
    passive: {
      name: "Tung Tung Bat",
      description: "Each attack has a 30% chance to strike for either 3x damage, or 1.5x damage ignoring Shields (equal chance)."
    },
    image: "assets/cards/tungtungsahur.png"
  },
  {
    "id": "tulen",
    "name": "Tulen",
    "element": "Electric",
    "rarity": "Mythic",
    "chance": 18300000,
    "category": [
      "VideoGame",
      "Unhuman",
      "Brutal",
      "AntiHero",
      "Magician"
    ],
    "requiredWeather": "Heavenly",
    "hextechExclusive": true,
    "stats": {
      "hp": 72300,
      "atk": 17700
    },
    "passive": {
      "name": "God of Thunder",
      "description": "Every 3 attacks, fire 3 bolts: each has a 65% chance to hit a random enemy for 30% ATK and grant 1 Bolt Mark (cap 5). 5% dodge; dodging inflicts Hindered for 5 turns and grants 1 Mark. At 5 Marks, being hit consumes them for five 20% ATK counters, each with 10% chance to stun for 3 turns. Every 5 attacks, or at 5 Marks (consumed), replace the attack with LoiDieu: 20% of target missing HP. A LoiDieu kill splashes 10% of victim max HP to one nearby enemy and grants 3 Marks.",
      "tags": [
        "special_attack",
        "counter",
        "execute",
        "dodge"
      ]
    },
    "image": "assets/cards/tulen.png"
  },
  {
    "id": "veera",
    "name": "Veera",
    "element": "Dark",
    "rarity": "Secret",
    "chance": 99000000,
    "category": [
      "VideoGame",
      "Brutal",
      "PureEvil",
      "AntiVillian"
    ],
    "requiredWeather": "Malevolent",
    "hextechExclusive": true,
    "stats": {
      "hp": 132000,
      "atk": 32300
    },
    "passive": {
      "name": "Blood Chain",
      "description": "Each attack grants 1 Bhain, or 2 against a bleeding target (cap 4). At 4, consume all stacks for a special attack hitting up to 4 nearby enemies for 50% ATK each; heal 50% of total damage dealt. Each attack has 44% chance to inflict Bleed for 3 turns at 33% ATK per turn.",
      "tags": [
        "special_attack",
        "bleed",
        "sustain"
      ]
    },
    "image": "assets/cards/veera.png"
  },
  {
    "id": "jinx",
    "name": "Jinx",
    "element": "Fire",
    "rarity": "Secret",
    "chance": 125000000,
    "category": [
      "VideoGame",
      "Gunner",
      "Hero",
      "Human"
    ],
    "requiredWeather": null,
    "hextechExclusive": true,
    "stats": {
      "hp": 106000,
      "atk": 40500
    },
    "passive": {
      "name": "Fishbones",
      "description": "Each attack has 35% chance for a 30% ATK follow-up; chained follow-ups add 1 percentage point per chain, capped at +10. Kills grant +5 percentage points follow-up chance for the battle, capped at +25. Every 4 attacks, blast up to 5 enemies for 150% ATK, breaking an existing Shield or stunning an unshielded victim for 2 turns.",
      "tags": [
        "special_attack",
        "follow_up",
        "scaling",
        "shield_break"
      ]
    },
    "image": "assets/cards/jinx.png"
  },
  {
    "id": "ahri",
    "name": "Ahri",
    "element": "Water",
    "rarity": "Secret",
    "chance": 100000000,
    "category": [
      "VideoGame",
      "Magician",
      "AntiVillian",
      "Animal",
      "Unhuman"
    ],
    "requiredWeather": "Tsukuyomi",
    "hextechExclusive": true,
    "stats": {
      "hp": 121000,
      "atk": 29600
    },
    "passive": {
      "name": "Essence Fox",
      "description": "Auto Chess only: each attack has 20% chance for +40% Attack Speed for 3 own turns. Each kill grants 10 Fox Spirit and heals 10% max HP. Outside Fox Theft, each attack grants 1–5 Spirit (cap 100), then spends 1 to heal 35–95% of damage dealt. At 100 Spirit enter Fox Theft: no Spirit gains, consume 1–3 per own turn until 0; each attack inflicts Hindered for 2 turns or Hypnosis for 1 turn, and heals 75–105% of damage dealt without extra Spirit costs.",
      "tags": [
        "sustain",
        "scaling",
        "crowd_control"
      ]
    },
    "image": "assets/cards/ahri.png"
  },
  {
    "id": "krixi",
    "name": "Krixi",
    "element": "Nature",
    "rarity": "Secret",
    "chance": 136000000,
    "category": [
      "VideoGame",
      "Magician",
      "Hero"
    ],
    "requiredWeather": "Wind",
    "hextechExclusive": true,
    "stats": {
      "hp": 120000,
      "atk": 45800
    },
    "passive": {
      "name": "Nature Wrath",
      "description": "Every 3 attacks, pierce the enemy team: each subsequent hit loses 10 percentage points of damage (minimum 10%); each hit has 50% chance to stun for 1 turn. Every 5 attacks, randomly distribute 12 meteors across living enemies, each dealing 25% ATK with 10% chance to stun for 1 turn.",
      "tags": [
        "special_attack",
        "pierce",
        "aoe",
        "stun"
      ]
    },
    "image": "assets/cards/krixi.png"
  },
  {
    "id": "neeko",
    "name": "Neeko",
    "element": "Nature",
    "rarity": "Secret",
    "chance": 88000000,
    "category": [
      "VideoGame",
      "Animal",
      "Magician"
    ],
    "requiredWeather": "Eclipse",
    "hextechExclusive": true,
    "stats": {
      "hp": 126000,
      "atk": 30800
    },
    "passive": {
      "name": "Blooming Burst",
      "description": "Every 3 attacks, deal an extra 20% ATK ignoring Shields and gain +30% dodge for 2 own turns. Each attack has 20% chance to stun for 1 turn and 50% chance to pierce the next enemy for 50% ATK; a successful pierce doubles that attack stun duration. When Neeko Shield breaks, inflict Hindered on all enemies for 2 turns and reduce their ATK by 20%.",
      "tags": [
        "special_attack",
        "pierce",
        "shield_reactive",
        "stun"
      ]
    },
    "image": "assets/cards/neeko.png"
  },
  {
    "id": "sonic",
    "name": "Sonic",
    "element": "Electric",
    "rarity": "Secret",
    "chance": 200000000,
    "category": [
      "VideoGame",
      "Animal"
    ],
    "requiredWeather": "Wind",
    "hextechExclusive": true,
    "stats": {
      "hp": 175000,
      "atk": 42800
    },
    "passive": {
      "name": "Aerokinesis",
      "description": "Each attack has 90% chance for a 10% ATK follow-up; each chained follow-up reduces the next chance by 10 percentage points. Each follow-up has 10% chance to gain 1 Chaos E (cap 7). After chaining 5 follow-ups, if at least 1 Chaos E is available, freeze all enemies for 2 turns and consume 1. Instantly cleanse an incoming Stun or Freeze with a 5-own-turn cooldown.",
      "tags": [
        "follow_up",
        "crowd_control",
        "cleanse"
      ]
    },
    "image": "assets/cards/sonic.png"
  },
  {
    "id": "yasuo",
    "name": "Yasuo",
    "element": "Nature",
    "rarity": "Secret",
    "chance": 175000000,
    "category": [
      "VideoGame",
      "Swordman",
      "Human",
      "AntiHero",
      "Protagonist"
    ],
    "requiredWeather": "Wind",
    "hextechExclusive": true,
    "stats": {
      "hp": 133000,
      "atk": 50700
    },
    "passive": {
      "name": "Wanderer Way",
      "description": "Gain +20% Crit Chance if no other ally is a Swordman. Each attack grants 1 Flow Wind (cap 2). At 2, consume both stacks to replace the attack with Steel Tempest: 150% ATK, stun for 1 turn, and 33% chance for immunity to passive damage and effects for 3 own turns. Against an already stunned target, use Last Breath instead: 200% ATK and stun all other enemies for 2 turns; a kill restores 2 Flow Wind. With Yone on the team, grant him +10% ATK and +10% Crit Chance.",
      "tags": [
        "special_attack",
        "stun",
        "support"
      ]
    },
    "image": "assets/cards/yasuo.png"
  },
  {
    "id": "yone",
    "name": "Yone",
    "element": "Dark",
    "rarity": "Secret",
    "chance": 165000000,
    "category": [
      "Swordman",
      "Human",
      "AntiHero",
      "VideoGame"
    ],
    "requiredWeather": "Malevolent",
    "hextechExclusive": true,
    "stats": {
      "hp": 119000,
      "atk": 45300
    },
    "passive": {
      "name": "Twin Blades",
      "description": "Alternate attacks: Wind Blade deals 110% ATK with 30% chance to stun for 1 turn; Azakana Blade deals 50% ATK normally and 50% ATK directly through Shields. Every 4 attacks, enter Soul Unbound for 2 own turns; attacks also hit all other enemies at 50% damage. At expiration, gain flat ATK equal to 25% of actual Soul Unbound damage for 2 own turns. With Yasuo on the team, grant him +50% Crit Damage and +25% max HP.",
      "tags": [
        "special_attack",
        "aoe",
        "scaling",
        "support"
      ]
    },
    "image": "assets/cards/yone.png"
  }
];

// Read-only named pools reference the same self-contained card objects.
const TOWER_REWARD_CARDS = Object.freeze(CARDS.filter(card =>
  card.id.startsWith("tower-champion-") && card.towerFloor === 100 && typeof card.sourceId === "string"
));
const RAID_SECRET_CARDS = Object.freeze(CARDS.filter(card =>
  card.raidOnly === true && card.raidType === "marine_fort"
));
Object.freeze(CARDS);
const ALL_CARDS = CARDS;

if (typeof window !== "undefined") {
  window.CARDS = CARDS;
  window.ALL_CARDS = ALL_CARDS;
  window.TOWER_REWARD_CARDS = TOWER_REWARD_CARDS;
  window.RAID_SECRET_CARDS = RAID_SECRET_CARDS;
}
