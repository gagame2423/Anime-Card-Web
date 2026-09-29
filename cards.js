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
      description: "[SELF] Every attack made by this unit gains 10% attack boost ( stack to 100% )."
    },
    image: "assets/cards/narutokid.png"
  },
  {
    id: "normal-demon",
    name: "Normal Demon",
    rarity: "Common",
    chance: 3,
    requiredWeather: null,
    stats: { hp: 300, atk: 10 },
    passive: {
      name: "Lifesteal",
      description: "[SELF] Every time this unit kills an enemy, this unit gains 10% HP."
    },
    image: "assets/cards/normaldemon.png"
  },
  {
    id: "sasuke-kid",
    name: "Sasuke Kid",
    rarity: "Common",
    chance: 4,
    requiredWeather: null,
    stats: { hp: 275, atk: 12 },
    passive: {
      name: "Chidori",
      description: "[SELF] On the third attack made by this unit strike x2.5 atk damage."
    },
    image: "assets/cards/sasukekid.png"
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
      description: "[SELF] Every attack made by this unit has 20% chance to heal 20% HP."
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
      description: "[SELF] Has 5% chance to evade the next incoming hit."
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
      description: "[SELF] First attack has 33% to strike double damage."
    },
    image: "assets/cards/gonkid.png"
  },
  {
    id: "tanjiro",
    name: "Tanjiro",
    rarity: "Rare",
    chance: 40,
    requiredWeather: null,
    stats: { hp: 400, atk: 100 },
    passive: {
      name: "Rock",
      description: "[SELF] At the start of battle, this unit gains 25% bonus HP"
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
      name: "GOMU NO MU NO PISTOL",
      description: "[SELF] Every two attacks made by this unit launch a puch with more 50% atk."
    },
    image: "assets/cards/luffykid.png"
  },
  {
    id: "six-seven",
    name: "Six Seven",
    rarity: "Epic",
    chance: 67,
    requiredWeather: null,
    stats: { hp: 676, atk: 67 },
    passive: {
      name: "SIX SEVEN",
      description: "[SELF] First entry stun the enemy for the next 3 turn."
    },
    image: "assets/cards/sixseven.png"
  },
  {
    id: "kaneki-ghoul",
    name: "Kaneki",
    rarity: "Epic",
    chance: 80,
    requiredWeather: null,
    stats: { hp: 600, atk: 100 },
    passive: {
      name: "GHOUL",
      description: "[SELF] Every third attack made by this unit steals blood and heals this unit for 25% of the enemy's current HP"
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
      description: "[SELF] When enem entry has 50% chance to get strike x5 atk damage."
    },
    image: "assets/cards/thetrapper.png"
  },
  {
    id: "nezuko",
    name: "Nezuko",
    rarity: "Epic",
    chance: 190,
    requiredWeather: null,
    stats: { hp: 600, atk: 150 },
    passive: {
      name: "Bleed",
      description: "[SELF] When this unit attacks, it inflicts [ Bleed ] for 2 turn , [ Bleed ] drain hp enemy equal to 5% of Nezuko atk every turn."
    },
    image: "assets/cards/nezuko.png"
  },
  {
    id: "buggy",
    name: "Buggy",
    rarity: "Epic",
    chance: 234,
    requiredWeather: null,
    stats: { hp: 600, atk: 110 },
    passive: {
      name: "Chop Chop",
      description: "[SELF] This unit has a 33% chance to dodge an incoming attack; a successful dodge does not trigger an out-of-turn counterattack."
    },
    image: "assets/cards/buggy.png"
  },
  {
    id: "bounty-hunter",
    name: "Bounty Hunter",
    rarity: "Epic",
    chance: 300,
    requiredWeather: null,
    stats: { hp: 500, atk: 100 },
    passive: {
      name: "BOUNTY",
      description: "[SELF] Every time this unit kills an enemy, gain money equal to enemy hp."
    },
    image: "assets/cards/bountyhunter.png"
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
      description: "[SELF] Every attack made by this unit has 50% chance to follow up a next attack , and 25% chance to follow up the follow up , the follow up attack have 40% attack damage."
    },
    image: "assets/cards/jotarokujo.png"
  },
  {
    id: "hakari",
    name: "Hakari",
    rarity: "Epic",
    chance: 777,
    requiredWeather: null,
    stats: { hp: 777, atk: 377 },
    passive: {
      name: "Lucky Train",
      description: "[SELF] On the seventh attack made by this unit has 7% chance strike x77 atk damage."
    },
    image: "assets/cards/hakari.png"
  },
  {
    id: "saber",
    name: "Saber",
    rarity: "Epic",
    chance: 800,
    requiredWeather: null,
    stats: { hp: 800, atk: 400 },
    passive: {
      name: "EXCALIBUR!!!",
      description: "[SELF] On the eighth attack made by this unit strike x8 attack damage."
    },
    image: "assets/cards/saber.png"
  },
  {
    id: "jonathan-joestar",
    name: "Jonathan Joestar",
    rarity: "Epic",
    chance: 900,
    requiredWeather: null,
    stats: { hp: 1000, atk: 350 },
    passive: {
      name: "HAMONNN",
      description: "[SELF] On the ninth attack made by this unit gain 900% bonus atk damage for the rest of the match."
    },
    image: "assets/cards/jonathanjoestar.png"
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
      description: "[SELF] Every fifth attack made by this unit , do 10% attack damage to enemy constantly for 10 times."
    },
    image: "assets/cards/songoku.png"
  },
  {
    id: "vegeta",
    name: "Vegeta",
    rarity: "Legendary",
    chance: 1001,
    requiredWeather: null,
    stats: { hp: 1000, atk: 440 },
    passive: {
      name: "Super Vegeta",
      description: "[SELF] When this unit's HP falls below 25%, this unit gains 100% ATK damage."
    },
    image: "assets/cards/vegeta.png"
  },
  {
    id: "kakashi",
    name: "Kakashi",
    rarity: "Legendary",
    chance: 4900,
    requiredWeather: null,
    stats: { hp: 2000, atk: 505 },
    passive: {
      name: "Kamui",
      description: "[SELF] This unit has a 22% chance to dodge an incoming attack; a successful dodge does not trigger an out-of-turn counterattack."
    },
    image: "assets/cards/kakashi.png"
  },
  {
    id: "kr-kuuga",
    name: "Kamen Rider Kuuga",
    rarity: "Legendary",
    chance: 20000,
    requiredWeather: null,
    stats: { hp: 12500, atk: 2500 },
    passive: {
      name: "KUUGA",
      description: "[SELF] Every third attack made by this unit change form : Blue , Green , Purple : + Blue : Gain 20% critical chance ,+ Green : Gain 50% critical damage , + Purple : Gain 30% more hp."
    },
    image: "assets/cards/krkuuga.png"
  },
  {
    id: "bulma",
    name: "Bulma",
    rarity: "Legendary",
    chance: 3080,
    requiredWeather: null,
    stats: { hp: 3080, atk: 100 },
    passive: {
      name: "WISH",
      description: "[SELF + ALLY SUPPORT] At the start of each turn, if this unit is not the attacker, this unit has a 10% chance to grant the attacker +30% ATK damage on that attack."
    },
    image: "assets/cards/bulma.png"
  },
  {
    id: "denji",
    name: "Denji",
    rarity: "Legendary",
    chance: 3333,
    requiredWeather: null,
    stats: { hp: 3333, atk: 333 },
    passive: {
      name: "POCHITA",
      description: "[SELF] Every attack made by this unit has 33% chance to follow the next attack , the follow up attack can follow up again."
    },
    image: "assets/cards/denji.png"
  },
  {
    id: "uchiha-itachi",
    name: "Uchiha Itachi",
    rarity: "Legendary",
    chance: 5500,
    requiredWeather: null,
    stats: { hp: 2550, atk: 450 },
    passive: {
      name: "Amaterasu",
      description: "[SELF] Every attack made by this unit has a 30% chance to inflict [Burn] and immediately trigger a follow-up attack; [Burn] deals damage equal to 5% of this unit's ATK each turn for 3 turns"
    },
    image: "assets/cards/uchihaitachi.png"
  },
  {
    id: "madness-doctor",
    name: "Madness Doctor",
    rarity: "Legendary",
    chance: 10101,
    requiredWeather: null,
    stats: { hp: 10101, atk: 101 },
    passive: {
      name: "Madness",
      description: "[SELF] Every second attack made by this unit has a 40% chance to lower the enemy's ATK by 5%"
    },
    image: "assets/cards/madnessdoctor.png"
  },
  {
    id: "erza",
    name: "Erza",
    rarity: "Legendary",
    chance: 12120,
    requiredWeather: null,
    stats: { hp: 2550, atk: 450 },
    passive: {
      name: "MAGIC ARMOR",
      description: "[SELF] If this unit's HP falls below 50% immune to every passive."
    },
    image: "assets/cards/erza.png"
  },
  {
    id: "yuji-itadori",
    name: "Yuji Itadori",
    rarity: "Legendary",
    chance: 17000,
    requiredWeather: null,
    stats: { hp: 4000, atk: 600 },
    passive: {
      name: "BLACK FLASH",
      description: "[SELF] Every attack made by this unit has a 33% chance to deal ×3 ATK damage"
    },
    image: "assets/cards/yujiitadori.png"
  },
  {
    id: "guts",
    name: "Guts",
    rarity: "Secret",
    chance: 18888,
    requiredWeather: null,
    stats: { hp: 8000, atk: 800 },
    passive: {
      name: "OUTRAGE",
      description: "[SELF] This unit has a 33% chance to enter Berserker mode; while in Berserker mode, attacks made by this unit inflict [Bleed] for 2 turns, and [Bleed] drains enemy HP each turn equal to 10% of this unit's ATK"
    },
    image: "assets/cards/guts.png"
  },
  {
    id: "polnareff",
    name: "Polnareff",
    rarity: "Secret",
    chance: 36000,
    requiredWeather: null,
    stats: { hp: 10000, atk: 1000 },
    passive: {
      name: "SILVER CHARIOT",
      description: "[SELF] When this unit's HP falls below 25%, this unit gains 100% ATK damage"
    },
    image: "assets/cards/polnareff.png"
  },
  {
    id: "the-flash",
    name: "The Flash",
    rarity: "Secret",
    chance: 52000,
    requiredWeather: null,
    stats: { hp: 5200, atk: 2500 },
    passive: {
      name: "FLASH",
      description: "[SELF] This unit has a 60% chance to dodge incoming attacks; after more than 3 consecutive successful dodges, this unit is defeated by the documented heart-attack effect"
    },
    image: "assets/cards/theflash.png"
  },
  {
    id: "rimuru",
    name: "Rimuru",
    rarity: "Secret",
    chance: 81208,
    requiredWeather: null,
    stats: { hp: 8120, atk: 2008 },
    passive: {
      name: "SLIME",
      description: "[SELF] Every time this unit kills an enemy, this unit gains 1 Slime point; each Slime point can prevent one fatality and grants +30% ATK damage and +20% HP; each prevented fatality consumes 1 Slime point"
    },
    image: "assets/cards/rimuru.png"
  },
  {
    id: "starter-secret",
    name: "The Truth",
    rarity: "Secret",
    chance: 100000,
    requiredWeather: null,
    stats: { hp: 10000, atk: 2000 },
    passive: {
      name: "Omniscience",
      description: "[SELF] Immune to every passive of opponent."
    },
    image: "assets/cards/thetruth.png"
  },
  {
    id: "viltrumite",
    name: "Viltrumite",
    rarity: "Secret",
    chance: 222000,
    requiredWeather: null,
    stats: { hp: 20000, atk: 2222 },
    passive: {
      name: "PUNCH",
      description: "[SELF] Every third attack made by this unit has 33% chance to deal bonus 222% atk damage."
    },
    image: "assets/cards/viltrumite.png"
  },
{
    id: "mahito",
    name: "Mahito",
    rarity: "Epic",
    chance: 7927,
    requiredWeather: "Eclipsed",
    stats: { hp: 1927, atk: 792 },
    passive: {
      name: "Idle Transfiguration",
      description: "[SELF] If this unit kills an enemy whose HP is below 10%, this unit gains 1 Soul; each Soul clears one debuff inflicted on this unit"
    },
    image: "assets/cards/mahito.png"
  },
  {
    id: "blackbeard",
    name: "BlackBeard",
    rarity: "Legendary",
    chance: 40000,
    requiredWeather: "Shadow",
    stats: { hp: 8000, atk: 800 },
    passive: {
      name: "Liberation",
      description: "[SELF] Kill enemy gain 25% of their ATK damage."
    },
    image: "assets/cards/blackbeard.png"
  },
  {
    id: "garp",
    name: "Garp",
    rarity: "Legendary",
    chance: 38922,
    requiredWeather: null,
    stats: { hp: 10000, atk: 1500 },
    passive: {
      name: "Fist of Love",
      description: "[SELF] On the third attack made by this unit, stun the enemy for 2 turns; if an enemy dies before this unit's third attack, this unit's next enemy takes ×2 ATK damage once this match"
    },
    image: "assets/cards/garp.png"
  },
  {
    id: "erwin",
    name: "Erwin",
    rarity: "Legendary",
    chance: 77550,
    requiredWeather: null,
    stats: { hp: 17555, atk: 75 },
    passive: {
      name: "CAPTAIN",
      description: "[ALLY SUPPORT] When this unit enters first, all teammates gain 100% ATK damage for the rest of the battle."
    },
    image: "assets/cards/erwin.png"
  },
  {
    id: "boa-hancock",
    name: "Boa Hancock",
    rarity: "Legendary",
    chance: 69000,
    requiredWeather: "Sugar",
    stats: { hp: 6969, atk: 1069 },
    passive: {
      name: "Mero Mero",
      description: "[SELF] Every two attacks made by this unit have a 69% chance to freeze the enemy for 1 turn; when this unit attacks a frozen enemy, it deals ×1.5 ATK damage"
    },
    image: "assets/cards/boahancock.png"
  },
  {
    id: "senku",
    name: "Senku",
    rarity: "Rare",
    chance: 550,
    requiredWeather: null,
    stats: { hp: 1550, atk: 55 },
    passive: {
      name: "Chemistry",
      description: "[SELF + ALLY EFFECT] [ALLY SUPPORT] At the start of each turn when this unit is not the attacker, all teammates recover 10% HP"
    },
    image: "assets/cards/senku.png"
  },
  {
    id: "grimmjaw",
    name: "Grimmjaw",
    rarity: "Legendary",
    chance: 65000,
    requiredWeather: "Reaper",
    stats: { hp: 6500, atk: 1065 },
    passive: {
      name: "Gran Rey Cero",
      description: "[SELF] On the fifth attack made by this unit blasting all enemies with x2 ATK damage."
    },
    image: "assets/cards/grimmjaw.png"
  },
  {
    id: "reigen",
    name: "Reigen",
    rarity: "Mythic",
    chance: 500000,
    requiredWeather: null,
    stats: { hp: 100000, atk: 1000 },
    passive: {
      name: "Scam",
      description: "[SELF + ALLY EFFECT] When entry choose random one teammate to steal their passive, if Reigen is the last one boost 200% ATK damage and 100% HP with no passive."
    },
    image: "assets/cards/reigen.png"
  },
  {
    id: "kamen-rider-kabuto",
    name: "Kamen Rider Kabuto",
    rarity: "Mythic",
    chance: 370000,
    requiredWeather: null,
    stats: { hp: 5000, atk: 3700 },
    passive: {
      name: "CLOCK UP",
      description: "[SELF] Every attack made by this unit has a 10% chance to trigger another attack; follow-up attacks can chain again. A follow-up attack inflicts 1-turn Stun, and when this unit attacks a Stunned enemy, this unit heals 5% HP"
    },
    image: "assets/cards/krkabuto.png"
  },
  {
    id: "meruem",
    name: "Meruem",
    rarity: "Mythic",
    chance: 740000,
    requiredWeather: null,
    stats: { hp: 74000, atk: 5000 },
    passive: {
      name: "Aura Synthesis",
      description: "[SELF] Each time this unit is attacked, this unit heals for 15% of its Max HP and gains 1 Aura stack (5 max); each stack grants +10% critical damage"
    },
    image: "assets/cards/meruem.png"
  },
  {
    id: "frieza",
    name: "Frieza",
    rarity: "Legendary",
    chance: 76900,
    requiredWeather: null,
    stats: { hp: 6090, atk: 3060 },
    passive: {
      name: "Telekinesis",
      description: "[SELF] On this unit's entry, sort the opponent team from weakest to strongest by ATK so this unit faces the weakest enemy"
    },
    image: "assets/cards/frieza.png"
  },
  {
    id: "adam-francis",
    name: "Adam Francis",
    rarity: "Epic",
    chance: 6970,
    requiredWeather: null,
    stats: { hp: 2697, atk: 440 },
    passive: {
      name: "Champion of Light",
      description: "[SELF] Every attack made by this unit has a 20% chance to Stun the enemy for 1 turn; after the Stun ends, that enemy deals 18% less ATK damage"
    },
    image: "assets/cards/adamfrancis.png"
  },
  {
    id: "katakuri",
    name: "Katakuri",
    rarity: "Mythic",
    chance: 207000,
    requiredWeather: "Sugar",
    stats: { hp: 27000, atk: 2700 },
    passive: {
      name: "MOCHI",
      description: "[SELF] Every attack made by this unit has a 27% chance to reduce the enemy's ATK by 10% and heal this unit for 10%; this unit also has a 7% chance to dodge incoming attacks"
    },
    image: "assets/cards/katakuri.png"
  },
  {
    id: "whitebeard",
    name: "WhiteBeard",
    rarity: "Mythic",
    chance: 500100,
    requiredWeather: null,
    stats: { hp: 50000, atk: 5000 },
    passive: {
      name: "Quake Hermit",
      description: "[SELF] On the fourth attack made by this unit, strike the 2 closest enemies for ×3 ATK damage and Stun them for 2 turns"
    },
    image: "assets/cards/whitebeard.png"
  },
  {
    id: "doppio",
    name: "Doppio",
    rarity: "Rare",
    chance: 1450,
    requiredWeather: "Shadow",
    stats: { hp: 1450, atk: 145 },
    passive: {
      name: "FROG",
      description: "[SELF] Each time this unit is attacked, it has a 20% chance to gain a +20% ATK damage stack (2000% max); stacks persist across enemies in the same battle but not across battles"
    },
    image: "assets/cards/dopio.png"
  },
  {
    id: "shanks",
    name: "Shanks",
    rarity: "Legendary",
    chance: 24740,
    requiredWeather: null,
    stats: { hp: 4740, atk: 2474 },
    passive: {
      name: "HAKI",
      description: "[SELF] This unit has a 30% chance to dodge incoming attacks; each successful dodge grants +25% ATK damage to this unit's next attack"
    },
    image: "assets/cards/shanks.png"
  },
  {
    id: "metal-cooler",
    name: "Metal Cooler",
    rarity: "Legendary",
    chance: 80008,
    requiredWeather: null,
    stats: { hp: 8008, atk: 3232 },
    passive: {
      name: "CLONE",
      description: "[SELF + ALLY EFFECT] If teammate gets fatal attack, instantly make a clone of them with their passive but with Metal Cooler 50% stats (clone doesn't count as teammate)."
    },
    image: "assets/cards/metalcooler.png"
  },
  {
    id: "gohan",
    name: "Gohan",
    rarity: "Legendary",
    chance: 85000,
    requiredWeather: null,
    stats: { hp: 8008, atk: 3232 },
    passive: {
      name: "MASENKO",
      description: "[SELF] This unit deals ×2 ATK damage to the strongest enemy in the opponent team"
    },
    image: "assets/cards/gohan.png"
  },
  {
    id: "yuno",
    name: "Yuno",
    rarity: "Mythic",
    chance: 300000,
    requiredWeather: null,
    stats: { hp: 23000, atk: 4260 },
    passive: {
      name: "Zephyr Bow",
      description: "[SELF] Every attack made by this unit has a 45% chance to pierce the next enemy; a successful pierce has a 15% chance to pierce the next enemy again; each piercing attack deals 100% of this unit's ATK damage"
    },
    image: "assets/cards/yuno.png"
  },
  {
    id: "asta",
    name: "Asta",
    rarity: "Mythic",
    chance: 333000,
    requiredWeather: null,
    stats: { hp: 33000, atk: 3333 },
    passive: {
      name: "ANTI MAGIC",
      description: "[SELF] Has 50% chance to turn the enemy passive attack back to the enemy with 50% efficiency."
    },
    image: "assets/cards/asta.png"
  },
  {
    id: "asta-demon",
    name: "Demon Asta",
    rarity: "Secret",
    chance: 3333333,
    requiredWeather: null,
    stats: { hp: 333000, atk: 9999 },
    passive: {
      name: "ANTI MAGIC BOOK",
      description: "[SELF] Each turn, randomly choose Demon Slayer or Demon Dweller for the full turn. - Demon Slayer: Deal 165% atk damage with a 75% chance to stun the enemy for 1 turn, and has 25% chance to reflect incoming damage. - Demon Dweller: Deal 150% atk damage plus 35% of the last hit received, and reduce incoming damage by 15%."
    },
    image: "assets/cards/astademon.png"
  },
  // Existing weather-exclusive cards.
  {
    id: "nami",
    name: "Nami",
    rarity: "Rare",
    chance: 45,
    requiredWeather: "Raining",
    stats: { hp: 50, atk: 10 },
    passive: {
      name: "Greedy",
      description: "[SELF] If Nami is on this unit's team, winning the battle grants this unit/team 100% bonus rewards"
    },
    image: "assets/cards/nami.png"
  },
  {
    id: "giyu-tomioka",
    name: "Giyu Tomioka",
    rarity: "Epic",
    chance: 400,
    requiredWeather: "Raining",
    stats: { hp: 620, atk: 109 },
    passive: {
      name: "Dead Calm",
      description: "[SELF] On the fifth attack made by this unit, Stun the enemy for 1 turn; for the next 3 turns, this unit is immune to incoming attacks"
    },
    image: "assets/cards/giyutomioka.png"
  },
  {
    id: "sea-beast",
    name: "Sea Beast",
    rarity: "Epic",
    chance: 1200,
    requiredWeather: "Raining",
    stats: { hp: 2000, atk: 200 },
    passive: {
      name: "Big Fish",
      description: "[ALLY SUPPORT] When an enemy attacks a teammate, this unit intercepts and takes that damage for the teammate."
    },
    image: "assets/cards/seabeast.png"
  },
  {
    id: "arlong",
    name: "Arlong",
    rarity: "Epic",
    chance: 2400,
    requiredWeather: "Raining",
    stats: { hp: 2400, atk: 240 },
    passive: {
      name: "ZAWATER",
      description: "[SELF] Enemies facing this unit have a 24% chance to miss their attacks"
    },
    image: "assets/cards/arlong.png"
  },
  {
    id: "aquaman",
    name: "Aquaman",
    rarity: "Epic",
    chance: 22222,
    requiredWeather: "Raining",
    stats: { hp: 4444, atk: 222 },
    passive: {
      name: "AQUARIUM",
      description: "[SELF] If the current weather is Raining, this unit gains 50% incoming damage reduction"
    },
    image: "assets/cards/aquaman.png"
  },
  {
    id: "noelle-silva",
    name: "Noelle Silva",
    rarity: "Epic",
    chance: 400000,
    requiredWeather: "Raining",
    stats: { hp: 40000, atk: 2000 },
    passive: {
      name: "Tsunami Water",
      description: "[SELF] On this unit's entry, summon a tsunami that deals damage equal to 100% of this unit's ATK to all enemies; if at least one enemy dies to the tsunami, this unit gains a Water Shield equal to 100% Max HP"
    },
    image: "assets/cards/noellesilva.png"
  },
  {
    id: "weather-report",
    name: "Weather Report",
    rarity: "Mythic",
    chance: 650000,
    requiredWeather: "Raining",
    stats: { hp: 50000, atk: 222 },
    passive: {
      name: "BUBBLE CONTROL",
      description: "[SELF] Every 3 turns, this unit gains a Weather Shield equal to 30% of this unit's base HP for 1 turn; if an enemy destroys the shield, that enemy is transformed into a Snail for 2 turns"
    },
    image: "assets/cards/weatherreaport.png"
  },
  {
    id: "piccolo",
    name: "Piccolo",
    rarity: "Mythic",
    chance: 780000,
    requiredWeather: "Raining",
    stats: { hp: 80000, atk: 5000 },
    passive: {
      name: "AURA FARMER",
      description: "[SELF] For each turn when this unit does not attack, this unit gains a 10% ATK damage stack (no cap); this unit loses 1 stack when it attacks"
    },
    image: "assets/cards/picolo.png"
  },
  {
    id: "peashooter",
    name: "Peashooter",
    rarity: "Common",
    chance: 100,
    requiredWeather: "Sunny",
    stats: { hp: 1000, atk: 100 },
    passive: {
      name: "Plant",
      description: "[SELF] When this unit's HP falls below 30%, this unit heals 5% HP each turn"
    },
    image: "assets/cards/peashooter.png"
  },
  {
    id: "hutao",
    name: "Hutao",
    rarity: "Legendary",
    chance: 2020,
    requiredWeather: "Sunny",
    stats: { hp: 2020, atk: 400 },
    passive: {
      name: "Fire Burst",
      description: "[SELF] Attacks made by this unit inflict [Burn], and [Burn] deals 50% additional damage based on this unit's ATK"
    },
    image: "assets/cards/hutao.png"
  },
  {
    id: "weather-solar-deity",
    name: "Escanor",
    rarity: "Legendary",
    chance: 2500,
    requiredWeather: "Sunny",
    stats: { hp: 2770, atk: 690 },
    passive: {
      name: "SUNNY",
      description: "[SELF] If the weather is Sunny, this unit's ATK damage is doubled"
    },
    image: "assets/cards/escanor.png"
  },
  {
    id: "builderman",
    name: "Builderman",
    rarity: "Mythic",
    chance: 250000,
    requiredWeather: "Sunny",
    stats: { hp: 5000, atk: 5000 },
    passive: {
      name: "DEVELOPER",
      description: "[SELF] Each turn, this unit stores 10% of the enemy's ATK in Roblox Tower power; if the enemy is defeated while this unit is alive, all stored power is converted into this unit's HP"
    },
    image: "assets/cards/builderman.png"
  },
  {
    id: "aatrox",
    name: "Aatrox",
    rarity: "Mythic",
    chance: 6666,
    requiredWeather: "Eclipse",
    stats: { hp: 6666, atk: 666 },
    passive: {
      name: "WORLD ENDER",
      description: "[SELF] Every attack made by this unit heals this unit for 5% HP"
    },
    image: "assets/cards/aatrox.png"
  },
  {
    id: "weather-eclipse-harvester",
    name: "Griffith",
    rarity: "Mythic",
    chance: 8000,
    requiredWeather: "Eclipse",
    stats: { hp: 9999, atk: 666 },
    passive: {
      name: "ECLIPSED",
      description: "[SELF + ALLY EFFECT] When entry sacrifice all teammate for 100% atk damage boost per teammate alive."
    },
    image: "assets/cards/griffith.png"
  },
  {
    id: "dante-limbus",
    name: "Dante Limbus",
    rarity: "Mythic",
    chance: 10000,
    requiredWeather: "Eclipse",
    stats: { hp: 10000, atk: 1000 },
    passive: {
      name: "M@!L%#TH",
      description: "[SELF + ALLY EFFECT] When an enemy is defeated by a fatality attack, this unit revives one teammate with Dante's stats while preserving that teammate's passive (once per match)"
    },
    image: "assets/cards/dantelimbus.png"
  },
  {
    id: "adult-gon",
    name: "Adult Gon",
    rarity: "Secret",
    chance: 2500000,
    requiredWeather: "Eclipse",
    stats: { hp: 250000, atk: 2500 },
    passive: {
      name: "END!!!",
      description: "[SELF] Every attack made by this unit has a 25% chance to deal ×4 ATK damage; when this unit's HP falls below 10%, the chance increases to 50% and the damage becomes ×6 ATK"
    },
    image: "assets/cards/adultgon.png"
  },
  {
    id: "rukia",
    name: "Rukia",
    rarity: "Legendary",
    chance: 1350,
    requiredWeather: "Snowing",
    stats: { hp: 1350, atk: 300 },
    passive: {
      name: "Freeze",
      description: "[SELF] Every attack made by this unit has a 10% chance to Freeze the enemy for 1 turn; when this unit attacks a Frozen enemy, it deals +35% ATK damage"
    },
    image: "assets/cards/rukia.png"
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
      description: "[SELF] Has 33% chance to freeze an enemy after landing a critical hit."
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
      description: "[SELF] Has 67% chance to freeze an enemy after landing a critical hit."
    },
    image: "assets/cards/esdeath.png"
  },
  {
    id: "toshiro",
    name: "Toshiro",
    rarity: "Mythic",
    chance: 26000,
    requiredWeather: "Snowing",
    stats: { hp: 10000, atk: 2000 },
    passive: {
      name: "Absolute Zero",
      description: "[SELF] On the fifth battle turn, this unit gains +50% ATK; from then on, every attack made by this unit has a 50% chance to Stun the enemy for 1 turn"
    },
    image: "assets/cards/toshiro.png"
  },
  {
    id: "android-21",
    name: "Android 21",
    rarity: "Mythic",
    chance: 150000,
    requiredWeather: "Sugar",
    stats: { hp: 20000, atk: 3000 },
    passive: {
      name: "Sweet Destruction",
      description: "[SELF] When this unit kills an enemy, this unit heals for 30% of the target's Max HP and gains +20% stats for 2 turns; if an enemy survives longer than 3 turns while facing this unit, this unit absorbs 50% of that enemy's base ATK and that enemy can no longer dodge this unit's attacks"
    },
    image: "assets/cards/android21.png"
  },
  {
    id: "yuta-okkotsu",
    name: "Yuta Okkotsu",
    rarity: "Mythic",
    chance: 191022,
    requiredWeather: "Sugar",
    stats: { hp: 19100, atk: 2022 },
    passive: {
      name: "Cursed Love",
      description: "[SELF] Can survive fatality attack , if heal below 50% instantly heal 25% hp back and gain 50% atk damage ( once per match )."
    },
    image: "assets/cards/yutaokkotsu.png"
  },
  // New weather-exclusive cards. Add more entries below using the same schema.
  {
    id: "luffy-nightmare",
    name: "Luffy Nightmare",
    rarity: "Mythic",
    chance: 9300,
    requiredWeather: "Shadow",
    stats: { hp: 5000, atk: 1000 },
    passive: {
      name: "ENHANCE",
      description: "[SELF] Each time this unit is attacked, this unit absorbs the damage and returns 50% of the original damage to the enemy"
    },
    image: "assets/cards/luffynightmare.png"
  },
  {
    id: "weather-shadow-monarch",
    name: "Igris",
    rarity: "Mythic",
    chance: 18000,
    requiredWeather: "Shadow",
    stats: { hp: 6400, atk: 3200 },
    passive: {
      name: "SHADOW KNIGHT",
      description: "[SELF + ALLY SUPPORT] When this unit attacks, it has a 30% chance to call a teammate to make one follow-up attack."
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
      description: "[SELF] Every 10th attack made by this unit strikes all enemies for ×100 ATK damage"
    },
    image: "assets/cards/cidatomic.png"
  },
  {
    id: "enderman",
    name: "Enderman",
    rarity: "Mythic",
    chance: 99999,
    requiredWeather: "Shadow",
    stats: { hp: 9999, atk: 999 },
    passive: {
      name: "PEARL",
      description: "[SELF] Survive one fatality attack"
    },
    image: "assets/cards/enderman.png"
  },
  {
    id: "homura-akemi",
    name: "Homura Akemi",
    rarity: "Mythic",
    chance: 199208,
    requiredWeather: "Shadow",
    stats: { hp: 20008, atk: 1990 },
    passive: {
      name: "Time Manipulation",
      description: "[SELF + ALLY SUPPORT] When a heal brings this unit or a teammate from below 60% HP to at least 60% HP, this unit freezes an enemy for 5 turns"
    },
    image: "assets/cards/homura.png"
  },
  {
    id: "kr-decade",
    name: "Kamen Rider Decade",
    rarity: "Mythic",
    chance: 200000,
    requiredWeather: "Shadow",
    stats: { hp: 15000, atk: 5000 },
    passive: {
      name: "Rider Card",
      description: "[SELF] On this unit's entry, this unit shape-shifts into an enemy card with the same passive while keeping this unit's own stats"
    },
    image: "assets/cards/krdecade.png"
  },
  {
    id: "uchiha-sasuke",
    name: "Uchiha Sasuke",
    rarity: "Mythic",
    chance: 550000,
    requiredWeather: "Shadow",
    stats: { hp: 40000, atk: 5500 },
    passive: {
      name: "Storm Susano",
      description: "[SELF] Every attack made by this unit has a 15% chance to trigger a follow-up attack; follow-up attacks made by this unit inflict [Burn] for 3 turns, and [Burn] deals damage equal to 25% of this unit's ATK each turn. When this unit's HP falls below 40%, this unit gains +60% ATK and 30% incoming damage reduction for 6 turns"
    },
    image: "assets/cards/uchihasasuke.png"
  },    
  {
    id: "light-admiral",
    name: "Light Admiral",
    rarity: "Secret",
    chance: 7000,
    requiredWeather: "Heavenly",
    stats: { hp: 5000, atk: 1000 },
    passive: {
      name: "Light Speed",
      description: "[SELF] This unit has a 20% chance to dodge incoming attacks; when a dodge succeeds, the enemy is Stunned for the next turn"
    },
    image: "assets/cards/kizaru.png"
  }, 
  {
    id: "gojo-young",
    name: "Gojo Young",
    rarity: "Secret",
    chance: 8888,
    requiredWeather: "Heavenly",
    stats: { hp: 8888, atk: 888 },
    passive: {
      name: "Infinity",
      description: "[SELF] This unit has an 88% chance to dodge incoming attacks, but cannot dodge passive attacks"
    },
    image: "assets/cards/gojoyoung.png"
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
      description: "[SELF] Radiant Energy converts each perfect roll into bonus power for this unit"
    },
    image: "assets/cards/adamror.png"
  },
  {
    id: "sailor-moon",
    name: "Sailor Moon",
    rarity: "Secret",
    chance: 70007,
    requiredWeather: "Heavenly",
    stats: { hp: 7007, atk: 7007 },
    passive: {
      name: "Moon Manipulation",
      description: "[SELF] After this unit wins a 1v1 battle, it has a 20% chance to add one random Common-Uncommon Weather for 3 minutes"
    },
    image: "assets/cards/sailormoon.png"
  },
  {
    id: "jin-mori",
    name: "Jin Mori",
    rarity: "Secret",
    chance: 240000,
    requiredWeather: "Heavenly",
    stats: { hp: 20000, atk: 7200 },
    passive: {
      name: "72 Magic Spell",
      description: "[SELF + ALLY EFFECT] If a teammate dies, this unit creates a clone with Jin Mori stats and that teammate's passive (up to 3 times per match)"
    },
    image: "assets/cards/jinmori.png"
  },
  {
    id: "wish",
    name: "Wish",
    rarity: "Secret",
    chance: 115000,
    requiredWeather: "Heavenly",
    stats: { hp: 15000, atk: 1500 },
    passive: {
      name: "Heavenly Blessing",
      description: "[SELF + ALLY EFFECT] While this unit is in the party, all allies gain 150% Max HP"
    },
    image: "assets/cards/wish.png"
  },
  {
    id: "weather-tsukuyomi-eye",
    name: "Uchiha Shisui",
    rarity: "Secret",
    chance: 35000,
    requiredWeather: "Tsukuyomi",
    stats: { hp: 8800, atk: 4700 },
    passive: {
      name: "TSUKUYOMI",
      description: "[SELF] This unit has a 35% chance to dodge incoming attacks; when a dodge succeeds, the attacker is Stunned for 3 turns"
    },
    image: "assets/cards/shisui.png"
  },
  {
    id: "diavolo",
    name: "Diavolo",
    rarity: "Secret",
    chance: 600000,
    requiredWeather: "Tsukuyomi",
    stats: { hp: 60000, atk: 6000 },
    passive: {
      name: "EPITAH",
      description: "[SELF] This unit has a 35% chance to dodge incoming attacks; when a dodge succeeds, the attacker is Stunned for 3 turns"
    },
    image: "assets/cards/diavolo.png"
  },
  {
    id: "kaguya",
    name: "Kaguya",
    rarity: "Secret",
    chance: 999000,
    requiredWeather: "Tsukuyomi",
    stats: { hp: 66000, atk: 9999 },
    passive: {
      name: "Dimensional Domain",
      description: "[SELF + ALLY EFFECT] On this unit's entry, this unit creates a domain lasting 3 turns. When activated, the domain disables attacks for all enemies and teammates for 1 turn; enemies inside take Burn damage each turn equal to 100% of this unit's ATK"
    },
    image: "assets/cards/kaguya.png"
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
      description: "[SELF] After this unit deals critical damage, this unit can finish an enemy with a spectral silver edge"
    },
    image: "assets/cards/vastolord.png"
  },
  {
    id: "subaru",
    name: "Subaru",
    rarity: "Mythic",
    chance: 53090,
    requiredWeather: "Reaper",
    stats: { hp: 10000, atk: 1000 },
    passive: {
      name: "Return By Death",
      description: "[SELF] After this unit suffers its first fatality, this unit revives at 90% Max HP; later fatality hits have a 65% chance to revive this unit at 50% Max HP. Each revival grants +20% ATK damage and 15% dodge chance"
    },
    image: "assets/cards/subaru.png"
  },
  {
    id: "dio-brando",
    name: "Dio Brando",
    rarity: "Legendary",
    chance: 666,
    requiredWeather: "Malevolent",
    stats: { hp: 666, atk: 333 },
    passive: {
      name: "WGRYYYY",
      description: "[SELF] An attack made by this unit has a 20% chance to Freeze the enemy for 2 turns; when the Freeze succeeds, this unit heals for 20% HP"
    },
    image: "assets/cards/diobrando.png"
  },
  {
    id: "weather-malevolent-king",
    name: "Malevolent King",
    rarity: "Secret",
    chance: 45000,
    requiredWeather: "Malevolent",
    stats: { hp: 11000, atk: 4500 },
    passive: {
      name: "Malevolent Kitchen",
      description: "[SELF] On the fifth attack made by this unit, repeatedly slash the enemy until the enemy's HP falls below 50%"
    },
    image: "assets/cards/sukuna.png"
  },
  {
    id: "doflamingo",
    name: "Doflamingo",
    rarity: "Secret",
    chance: 60220,
    requiredWeather: "Malevolent",
    stats: { hp: 16000, atk: 4020 },
    passive: {
      name: "STRING ARMY",
      description: "[SELF + ALLY EFFECT] Every time this unit kills an enemy, this unit has a 30% chance to turn that defeated enemy into a teammate once per match"
    },
    image: "assets/cards/doflamingo.png"
  },
  {
    id: "hakari-jackpot",
    name: "Hakari Jackpot",
    rarity: "Secret",
    chance: 777777,
    requiredWeather: "Malevolent",
    stats: { hp: 77777, atk: 7777 },
    passive: {
      name: "JACKPOT",
      description: "[SELF] While this unit is in the team, Victory Battle grants 100% more rewards. If this unit enters first, it becomes Invincible for 7 turns; otherwise, it gains either +77% ATK damage or +77% HP"
    },
    image: "assets/cards/hakarijackpot.png"
  },
  {
    id: "mahoraga",
    name: "Mahoraga",
    rarity: "Secret",
    chance: 800000,
    requiredWeather: "Malevolent",
    stats: { hp: 80000, atk: 8000 },
    passive: {
      name: "ADAPTION",
      description: "[SELF] Each time this unit is attacked, it has a 25% chance to Adapt that attack and gain 25% incoming damage reduction; the adaptation resets when facing a new enemy. Each time this unit kills an enemy, this unit heals 50% HP"
    },
    image: "assets/cards/mahoraga.png"
  }
];

// The base card database is immutable at the array level. Gameplay code must
// always sort/filter a fresh copy so Collection/Battle rendering can never
// mutate the canonical order.
Object.freeze(CARDS);
const ALL_CARDS = CARDS;

if (typeof window !== "undefined") {
  window.CARDS = CARDS;
  window.ALL_CARDS = ALL_CARDS;
}
