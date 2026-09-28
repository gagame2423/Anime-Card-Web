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
    id: "normal-demon",
    name: "Normal Demon",
    rarity: "Common",
    chance: 3,
    requiredWeather: null,
    stats: { hp: 300, atk: 10 },
    passive: {
      name: "Lifesteal",
      description: "Every kill gain 10% hp boost."
    },
    image: "assets/cards/normaldemon.png"
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
    name: "Tanjiro",
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
      name: "GOMU NO MU NO PISTOL",
      description: "Every two attack launch a puch with more 50% atk."
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
      description: "First entry stun the enemy for the next 3 turn."
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
      description: "When enem entry has 50% chance to get strike x5 atk damage."
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
      description: "Attack inflict [ Bleed ] for 2 turn , [ Bleed ] drain hp enemy equal to 5% of Nezuko atk every turn."
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
      description: "Has 33% to dodge income attack , when dodge success attack back with 50% attack damage."
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
      description: "Every kill gain money equal to enemy hp."
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
      description: "Every attack has 50% chance to follow up a next attack , and 25% chance to follow up the follow up , the follow up attack have 40% attack damage."
    },
    image: "assets/cards/jotarokujo.png"
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
      description: "On eight attack strike x8 attack damage."
    },
    image: "assets/cards/saber.png"
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
    id: "kakashi",
    name: "Kakashi",
    rarity: "Legendary",
    chance: 4900,
    requiredWeather: null,
    stats: { hp: 2000, atk: 505 },
    passive: {
      name: "Kamui",
      description: "Has 22% to dodge income attack , and attack back with the same atk damage."
    },
    image: "assets/cards/kakashi.png"
  },
  {
    id: "kr-kuuga",
    name: "Kamen Rider Kuuga",
    rarity: "Legendary",
    chance: 20000,
    requiredWeather: null,
    stats: { hp: 1250, atk: 400 },
    passive: {
      name: "KUUGA",
      description: "Every third attack change form : Blue , Green , Purple : + Blue : Gain 20% critical chance ,+ Green : Gain 50% critical damage , + Purple : Gain 30% more hp."
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
      description: "Every turn she not the one who attack , she have 10% chance to buff the outcome attack of the one who attack 30% atk damage."
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
      description: "Every attack has 33% chance to follow the next attack , the follow up attack can follow up again."
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
      description: "Every attack have 30% inflict [ Burn ] instantly follow up another attack , [ Burn ] deal damage to enemy equal to 5% atk damage , [ Burn ] last 3 turn ."
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
      description: "Every seconth attack has 40% chance to lower enemy atk by 5%."
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
      description: "If hp below 50% immune to every passive."
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
      description: "Every attack has 33% chance to strike x3 atk damage."
    },
    image: "assets/cards/itadoriyuji.png"
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
      description: "Have 33% chance to turn on Berserker mode , while in mode attack inflict [ Bleed ] for next 2 turn , [ Bleed ] drain hp equal to 10% of atk Guts every turn ."
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
      description: "When hp below 25% , gain 100% atk damage boost."
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
      description: "Has 60% chance to dodge income attack , if dodge more than 3 in a row The Flash instantly dead because heart attack."
    },
    image: "assets/cards/theflash.png"
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
      description: "Immune to every passive of opponent."
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
      description: "Every third attack has 33% chance to deal bonus 222% atk damage."
    },
    image: "assets/cards/viltrumite.png"
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
      description: "If Nami on the team , when win gain 100% bonus reward."
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
      description: "On Fifth Attack , stun the enemy one turn , and the next three turn immune to income attack ."
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
      description: "If enemy attack a teamate , Sea Beast will take that damage for teamate."
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
      description: "Enemy facing Arlong have 24% chance to miss attack ."
    },
    image: "assets/cards/arlong.png"
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
      description: "If hp below 30% , heal 5% hp every turn."
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
      description: "Attaking enemy have [ Burn ] deal more 50% atk."
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
      description: "If weather is sunny double the attack damage stats."
    },
    image: "assets/cards/escanor.png"
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
      description: "Every attack heal 5% hp."
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
      description: "When entry sacrifice all teammate for 100% atk damage boost per teammate alive."
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
      description: "When enemy died because of fatality attack , revice teammate with Dante stats but keep teammate passive ( once per match )."
    },
    image: "assets/cards/dantelimbus.png"
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
      description: "Every attack have 10% chance to freeze enemy for one turn. When attack freeze enemy deal bonus 35% atk damage."
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
  {
    id: "toshiro",
    name: "Toshiro",
    rarity: "Mythic",
    chance: 26000,
    requiredWeather: "Snowing",
    stats: { hp: 1000, atk: 2000 },
    passive: {
      name: "Absolute Zero",
      description: "On fifth turn , Toshiro gain 50% atk buff , from then on every attack have 50% chance to stun enemy for one turn."
    },
    image: "assets/cards/toshiro.png"
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
      description: "Can survive fatality attack , if heal below 50% instantly heal 25% hp back and gain 50% atk damage ( once per match )."
    },
    image: "assets/cards/yutaokkotsu.png"
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
    id: "enderman",
    name: "Enderman",
    rarity: "Mythic",
    chance: 99999,
    requiredWeather: "Shadow",
    stats: { hp: 9999, atk: 999 },
    passive: {
      name: "PEARL",
      description: "Survice fatality attack."
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
      description: "When heal below 60% , freeze enemy 5 turn."
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
      description: "When entry shape shift into enemy card with the same passive but keep own stats."
    },
    image: "assets/cards/krdecade.png"
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
      description: "Has 20% to dodge income attack , and when dodge success stun the enemy next turn."
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
      description: "Has 88% chance to dodge income attack , but cant dodge passive."
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
      description: "Radiant energy converts every perfect roll into bonus power."
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
      description: "Every 1v1 Battle win have 20% chance to add one random Common-Uncommon Weather for 3 minutes."
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
      description: "If a teammate dies , make a clone with Jin Mori stats but with that teammate passive ( three times per match )."
    },
    image: "assets/cards/jinmori.png"
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
    id: "dio-brando",
    name: "Dio Brando",
    rarity: "Legendary",
    chance: 666,
    requiredWeather: "Malevolent",
    stats: { hp: 666, atk: 333 },
    passive: {
      name: "WGRYYYY",
      description: "Attack has 20% chance to freeze enemy 2 turn , when freeze enemy success , selfheal 20% hp."
    },
    image: "assets/cards/diobrando.png"
  },
  {
    id: "weather-malevolent-king",
    name: "Malevolent King",
    rarity: "Secret",
    chance: 45000,
    requiredWeather: "Malevolent",
    stats: { hp: 11000, atk: 6000 },
    passive: {
      name: "Malevolent Kitchen",
      description: "On fifth attack constantly slash enemy until enemy hp below 50%."
    },
    image: "assets/cards/sukuna.png"
  },
  {
    id: "doflamingo",
    name: "Doflamingo",
    rarity: "Secret",
    chance: 60220,
    requiredWeather: "Malevolent",
    stats: { hp: 16000, atk: 6020 },
    passive: {
      name: "STRING ARMY",
      description: "Every kill has 30% chance to turn dead enemy into teammate ( once time per match )."
    },
    image: "assets/cards/doflamingo.png"
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
      description: "Everytime getting attacked have 25% chance adapt the attack , when adapt the attack , gain 25% income damage reduction , reset when facing new enemy , every kill heal 50% hp back."
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
