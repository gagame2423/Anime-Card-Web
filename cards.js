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
    name: "Naruto Kid",
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
    name: "Normal Demon",
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
    name: "Sasuke Kid",
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
    name: "Powerless Guy",
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
    name: "Ichigo Young",
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
    name: "Gon Kid",
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
    name: "Tanjiro",
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
    name: "Luffy Kid",
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
    name: "Six Seven",
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
    name: "Kaneki",
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
    name: "The Trapper",
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
    name: "Nezuko",
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
    name: "Buggy",
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
    name: "Bounty Hunter",
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
    name: "Jotaro Kujo",
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
    name: "Hakari",
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
    name: "Saber",
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
    name: "Jonathan Joestar",
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
    name: "Son Goku",
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
    name: "Vegeta",
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
    name: "Kakashi",
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
    name: "Kamen Rider Kuuga",
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
    name: "Bulma",
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
    name: "Denji",
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
    name: "Uchiha Itachi",
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
    name: "Madness Doctor",
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
    name: "Erza",
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
    name: "Yuji Itadori",
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
    name: "Guts",
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
    name: "Polnareff",
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
    name: "The Flash",
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
    name: "Rimuru",
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
    name: "The Truth",
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
    name: "Viltrumite",
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
    name: "Mahito",
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
    name: "BlackBeard",
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
    name: "Garp",
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
    name: "Erwin",
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
    name: "Boa Hancock",
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
    name: "Senku",
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
    name: "Grimmjaw",
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
    name: "Reigen",
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
    name: "Kamen Rider Kabuto",
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
    name: "Meruem",
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
    name: "Frieza",
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
    name: "Adam Francis",
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
    name: "Katakuri",
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
    name: "WhiteBeard",
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
    name: "Doppio",
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
    name: "Shanks",
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
    name: "Metal Cooler",
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
    name: "Gohan",
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
    name: "Yuno",
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
    name: "Asta",
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
    name: "Demon Asta",
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
    name: "Nami",
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
    name: "Giyu Tomioka",
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
    name: "Sea Beast",
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
    name: "Arlong",
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
    name: "Aquaman",
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
    name: "Noelle Silva",
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
    name: "Weather Report",
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
    name: "Piccolo",
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
    name: "Peashooter",
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
    name: "Hutao",
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
    name: "Escanor",
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
    name: "Builderman",
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
    name: "Aatrox",
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
    name: "Griffith",
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
    name: "Dante Limbus",
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
    name: "Adult Gon",
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
    name: "Rukia",
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
    name: "Ice Admiral",
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
    name: "Esdeath",
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
    name: "Toshiro",
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
    name: "Android 21",
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
    name: "Yuta Okkotsu",
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
    name: "Luffy Nightmare",
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
    name: "Igris",
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
    name: "Cid Atomic",
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
    name: "Enderman",
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
    name: "Homura Akemi",
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
    name: "Kamen Rider Decade",
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
    name: "Uchiha Sasuke",
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
    name: "Light Admiral",
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
    name: "Gojo Young",
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
    name: "The First Human",
    rarity: "Secret",
    chance: 30000,
    requiredWeather: "Heavenly",
    stats: { hp: 8200, atk: 4100 },
    passive: {
      name: "Ascension",
      description: "Perfect-roll affinity. This passive currently grants no additional HP or ATK."
    },
    image: "assets/cards/adamror.png"
  },
  {
    id: "sailor-moon",
    element: "Holy",
    name: "Sailor Moon",
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
    name: "Jin Mori",
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
    name: "Wish",
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
    name: "Uchiha Shisui",
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
    name: "Diavolo",
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
    name: "Kaguya",
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
    name: "Vasto Lord",
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
    name: "Subaru",
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
    name: "Dio Brando",
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
    name: "Malevolent King",
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
    name: "Doflamingo",
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
    name: "Hakari Jackpot",
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
    name: "Mahoraga",
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
  {"id": "tower-champion-normal", "element": "Electric", "image": "assets/cards/equinox.png", "towerType": "normal", "unlockRequirement": "tower_floor_100_normal", "sourceId": "starter-common", "name": "Equinox", "chance": 2500025, "requiredWeather": "Normal", "nativeWeather": null, "stats": {"hp": 250000, "atk": 25000}, "passive": {"name": "Emotional Meter", "description": "Start at 50% positive / 50% negative. Primary attacks shift 10–20% toward positive; incoming hits shift 10–20% toward negative.\n100% positive: living team gains +100% max HP and +25% ATK; meter locks.\n100% negative: hit all enemies for x25 current ATK, then die permanently; cannot revive or be cloned."}},
  {"id": "tower-champion-raining", "element": "Water", "image": "assets/cards/aqua.png", "towerType": "raining", "unlockRequirement": "tower_floor_100_raining", "sourceId": "aquaman", "name": "Aqua", "chance": 2222222, "requiredWeather": "Raining", "nativeWeather": "raining", "stats": {"hp": 222222, "atk": 2222}, "passive": {"name": "Useless", "description": "Before battle, choose +50% team max HP (once/team) or +50% eligible VNĐ/EXP/Reward Bonus. Reward choice excludes Tower Coins, potion chances and Time Trial payouts.\nEach allied turn with another active attacker: heal it for 10% max HP and grant +2.2% current ATK, once/turn."}},
  {"id": "tower-champion-snowing", "element": "Water", "image": "assets/cards/iceking.png", "towerType": "snowing", "unlockRequirement": "tower_floor_100_snowing", "sourceId": "toshiro", "name": "Ice King", "chance": 1058000, "requiredWeather": "Snowing", "nativeWeather": "snowing", "stats": {"hp": 104600, "atk": 46000}, "passive": {"name": "Ice Manipulation", "description": "When hit: 20% chance to Freeze the attacker for 2 turns. Deal +50% damage to frozen targets.\nFirst eligible fatal hit: revive at full HP for 5 combat turns, then die permanently. No teammate revival.\nOn permanent death: 58% chance to give a living teammate Ice King Crown (10% chance to Freeze targets for 3 turns)."}},
  {"id": "tower-champion-sunny", "element": "Fire", "image": "assets/cards/charizardx.png", "towerType": "sunny", "unlockRequirement": "tower_floor_100_sunny", "sourceId": "weather-solar-deity", "name": "Charizard Mega X", "chance": 634000, "requiredWeather": "Sunny", "nativeWeather": "sunny", "stats": {"hp": 78000, "atk": 13000}, "passive": {"name": "Solar Claw", "description": "33% base crit chance. First damaging crit applies Burn for 3 turns (33% current ATK/turn).\nLater crits deal x3 attack damage before the normal crit multiplier. They do not reapply this Burn. No free follow-up or guaranteed crit."}},
  {"id": "tower-champion-sugar", "element": "Electric", "image": "assets/cards/buu.png", "towerType": "sugar", "unlockRequirement": "tower_floor_100_sugar", "sourceId": "android-21", "name": "Majin Buu", "chance": 760000, "requiredWeather": "Sugar", "nativeWeather": "sugar", "stats": {"hp": 76000, "atk": 7600}, "passive": {"name": "Candy Eater", "description": "Each primary attack gains 1–3 candies; only the current form applies.\n0–10: +25% damage; +1 extra candy/attack.\n11–25: +50% max HP; when hit, spend 1 candy to heal 3% max HP.\n26–50: damaging attacks summon a Ghost (HP = damage dealt; ATK = 10% current ATK).\n51–75: 76% dodge; a dodge skips the next attack, grants 5 candies and heals 7.6% max HP.\n76–99: every 3rd attack also hits up to 3 random enemies for 50% ATK.\n100: hit all enemies each attack; spend 1 candy/attack until 0. Then return to Form 1 and self-Stun for 5 turns; no candy gain or transformation during reversion.\nGenerated units cannot summon Ghosts."}},
  {"id": "tower-champion-reaper", "element": "Holy", "image": "assets/cards/aizenbeyond.png", "towerType": "reaper", "unlockRequirement": "tower_floor_100_reaper", "sourceId": "weather-reaper-hollow", "name": "Aizen Beyond", "chance": 6000000, "requiredWeather": "Reaper", "nativeWeather": "reaper", "stats": {"hp": 60000, "atk": 30000}, "passive": {"name": "Illusion Shattering Flower", "description": "Every 2nd primary attack: hit all enemies for 60% of each target’s current ATK.\nWhen damaged: 6% chance to counter for 50% damage received; counters cannot loop.\nFirst eligible fatal hit: revive at full HP, gain +100% current ATK permanently. Cannot be cloned or revived by teammates."}},
  {"id": "tower-champion-eclipse", "element": "Dark", "image": "assets/cards/wou.png", "towerType": "eclipse", "unlockRequirement": "tower_floor_100_eclipse", "sourceId": "weather-eclipse-harvester", "name": "Wonder Of You", "chance": 8000000, "requiredWeather": "Eclipse", "nativeWeather": "eclipse", "stats": {"hp": 800000, "atk": 8}, "passive": {"name": "Calamity", "description": "Protect a random living teammate; choose another if it dies. No position swap.\nAfter that ally’s shields/reduction, split remaining damage 50%/50%; absorb the shared half, with an 8% chance to reflect it instead. No recursive redirection.\nProtected ally’s kill: heal 80% max HP. Death while protecting: 8% chance to execute the attacker; normal immunity/survival rules apply."}},
  {"id": "tower-champion-malevolent", "element": "Fire", "image": "assets/cards/thukuna.png", "towerType": "malevolent", "unlockRequirement": "tower_floor_100_malevolent", "sourceId": "weather-malevolent-king", "name": "Thukuna", "chance": 666999, "requiredWeather": "Malevolent", "nativeWeather": "malevolent", "stats": {"hp": 66666, "atk": 9999}, "passive": {"name": "Malevolent Kitchen", "description": "After 5 primary attacks, hit all living enemies for 25% current ATK at the start of every combat turn while alive.\nWhen hit and surviving: 66% chance to heal 6% max HP and gain +9% current ATK. ATK bonuses stack for the match."}},
  {"id": "tower-champion-tsukuyomi", "element": "Nature", "image": "assets/cards/narutosasuke.png", "towerType": "tsukuyomi", "unlockRequirement": "tower_floor_100_tsukuyomi", "sourceId": "weather-tsukuyomi-eye", "name": "Naruto x Sasuke", "chance": 2000000, "requiredWeather": "Tsukuyomi", "nativeWeather": "tsukuyomi", "stats": {"hp": 200000, "atk": 20000}, "passive": {"name": "Datebayo", "description": "Each new active enemy rolls Naruto/Sasuke mode (50% each); keep the card’s attack counter across target changes.\nNaruto: every 3rd attack deals x3 damage and creates a 10% current HP/ATK Clone. Living Clones follow up each attack; Clone death heals the owner 10% max HP. No count cap; generated units cannot summon.\nSasuke: every 2nd attack hits all enemies for 50% ATK; 20% dodge. Dodge applies Burn for 5 turns (25% ATK/turn) and a 3-combat-turn shield equal to avoided damage. Burn ending naturally Stuns for 1 turn.\nSwitching to Sasuke removes Clones without healing; switching to Naruto removes the shield."}, "requiredWeathers": ["Tsukuyomi", "Mangekyo"]},
  {"id": "tower-champion-heavenly", "element": "Holy", "image": "assets/cards/judgement.png", "towerType": "heavenly", "unlockRequirement": "tower_floor_100_heavenly", "sourceId": "weather-heavenly-seraph", "name": "The Judgement", "chance": 300300, "requiredWeather": "Heavenly", "nativeWeather": "heavenly", "stats": {"hp": 40000, "atk": 5000}, "passive": {"name": "Divine Light", "description": "Every 2nd attack: 33% chance for a beam hitting all enemies for 50% current ATK; damaged targets have a 66% chance of Heresy for 1–3 turns.\nWhile any enemy has Heresy: beam chance/damage become 66%/66% ATK; Heresy chance becomes 33%.\nHeresy: deal 9% less damage; 3% chance to miss primary attacks."}},
  {"id": "tower-champion-shadow", "element": "Dark", "image": "assets/cards/krdarkdecade.png", "towerType": "shadow", "unlockRequirement": "tower_floor_100_shadow", "sourceId": "weather-shadow-monarch", "name": "Kamen Rider Dark Decade", "chance": 2009000, "requiredWeather": "Shadow", "nativeWeather": "shadow", "stats": {"hp": 102000, "atk": 28000}, "passive": {"name": "Dark Aurora", "description": "On kill: 29% chance to convert an eligible original enemy and steal its passive. Insert the converted unit directly in front of Dark Decade with Dark Decade’s current max HP/ATK and the victim’s passive.\nWhile alive, revive eligible original teammates at the back with Dark Decade’s stats (max 2 revivals/teammate); keep their own passives. Never revive itself, clones or summons.\nGenerated units cannot create companions. Uncloneable enemies and anti-revival restrictions remain excluded."}},
].map(reward => Object.freeze({ ...reward, towerFloor: 100, rarity: 'Secret', image: reward.image, description: `Clear Floor 100 of ${reward.towerType} Tower. Future rolls require the matching weather.` }));
CARDS.push(...TOWER_REWARD_CARDS);
// Raid-only secrets never enter RNG pools, including after their first unlock.
const RAID_SECRET_CARDS = [
  { id: 'raid-secret-mihawk', element: 'Nature', name: 'Mihawk', rarity: 'Secret', chance: 0, stats: { hp: 100000, atk: 5000 }, image: 'assets/cards/mihawk.png',
    passive: { name: 'Hawkeye', description: "50% dodge; successful dodge counters for 500% current ATK.\nPrimary attacks pierce the enemy lineup; each damaging hit reduces the next target’s damage by 25%. Dodges/fully blocked hits do not consume a falloff step.\nEach combat turn: 25% chance for Haki for 2 turns (+250% ATK, 25% damage reduction); refreshes without stacking." } },
  { id: 'raid-secret-ace', element: 'Fire', name: 'Ace', rarity: 'Secret', chance: 0, stats: { hp: 10000, atk: 1000 }, image: 'assets/cards/ace.png',
    passive: { name: 'Mera Mera', description: "Successful attacks: 10% chance to Burn for 3 turns (100% current ATK/turn).\nOn death: living teammates gain Brother Soul. Their successful attacks have a separate 10% chance to Burn for 1 turn (100% their current ATK). Stacks with other Burns; multiple Ace deaths do not increase the chance." } },
  { id: 'raid-secret-marco', element: 'Water', name: 'Marco', rarity: 'Secret', chance: 0, stats: { hp: 500000, atk: 10000 }, image: 'assets/cards/marco.png',
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
    "name": "Funny Valentine",
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
    "name": "Dio The World",
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
    "name": "Joseph Joestar",
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
    "name": "Jolyne Joestar",
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
    "name": "Tohth",
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
    "name": "Emmu",
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
    "name": "Josuke",
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
    "name": "Akaza",
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
      "description": "Target the enemy with the highest ATK and deal x1.5 damage.\nStarting behind slot 1: swap with slot 1, gain +50% ATK and +25% max HP. Starting in slot 1: each attack also hits a second enemy.\nSurvive fatal hits at 1 HP. Each kill or survived fatal hit grants +10% current ATK. Bleed blocks survival."
    },
    "requiredWeather": "Malevolent"
  },
  {
    "id": "awakened-doflamingo",
    "name": "Awakened Doflamingo",
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
    "id": "prime-garp",
    "name": "Prime Garp",
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
  "name": "Alucard",
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
    "name": "Madara Lubu",
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
    "name": "Sung Jin Woo",
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
    "name": "Frieren",
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
    "name": "Alexander Anderson",
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
Object.freeze(CARDS);
const ALL_CARDS = CARDS;

if (typeof window !== "undefined") {
  window.CARDS = CARDS;
  window.ALL_CARDS = ALL_CARDS;
}
