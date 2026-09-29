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
    id: "sasuke-kid",
    name: "Sasuke Kid",
    rarity: "Common",
    chance: 4,
    requiredWeather: null,
    stats: { hp: 275, atk: 12 },
    passive: {
      name: "Chidori",
      description: "On third attack strike x2.5 atk damage."
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
    id: "hakari",
    name: "Hakari",
    rarity: "Epic",
    chance: 777,
    requiredWeather: null,
    stats: { hp: 777, atk: 377 },
    passive: {
      name: "Lucky Train",
      description: "On seventh attack has 7% chance strike x77 atk damage."
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
      description: "On eight attack strike x8 attack damage."
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
      description: "On ninth attack gain 900% bonus atk damage for the rest of the match."
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
      description: "Every fifth attack , do 10% attack damage to enemy constantly for 10 times."
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
      description: "Hp below 25% gain 100% atk damage."
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
    stats: { hp: 12500, atk: 2500 },
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
    id: "rimuru",
    name: "Rimuru",
    rarity: "Secret",
    chance: 81208,
    requiredWeather: null,
    stats: { hp: 8120, atk: 2008 },
    passive: {
      name: "SLIME",
      description: "Every kill gain 1 slime point , for each slime point survice a fatality , and buff 30% atk damage , 20% hp bonus , every fatality attack survice reduce one slime point."
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
{
    id: "mahito",
    name: "Mahito",
    rarity: "Epic",
    chance: 7927,
    requiredWeather: "Eclipsed",
    stats: { hp: 1927, atk: 792 },
    passive: {
      name: "Idle Transfiguration",
      description: "If kill an enemy with HP below 10% gain Soul, for each Soul clear a debuff if getting inflicted."
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
      description: "Kill enemy gain 25% of their ATK damage."
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
      description: "On third attack stun enemy for 2 turns, if enemy died before the third attack, the next enemy gonna get strike x2 ATK damage (only in one match)."
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
      description: "If he enter the battle first, instantly buff all teammates 100% ATK damage for the rest of the battle."
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
      description: "Every two attacks has 69% chance to freeze enemy for 1 turn. When attacking freeze enemy strike x1.5 attack damage."
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
      description: "While not the one who attacking, every turn heal every teammate 10% HP."
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
      description: "On fifth attack blasting all enemies with x2 ATK damage."
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
      description: "When entry choose random one teammate to steal their passive, if Reigen is the last one boost 200% ATK damage and 100% HP with no passive."
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
      description: "Every attack has 10% chance to follow up another attack, a follow up attack can follow up again, when follow up attack inflict stun enemy for 1 turn, attacking stun enemy heal 5% HP."
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
      description: "Each time this card is attacked, heal this card for 15% of its max HP and gain a stack of aura (5 stacks max), for each stack deal 10% more critical damage."
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
      description: "On entry sort the opponent team from weak to strong base on their ATK damage, so Frieza can face the weakest enemy."
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
      description: "Every attack has 20% chance to stun enemy for 1 turn. After the stun ends, enemy attack deal 18% less ATK damage."
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
      description: "Every attack has 27% chance to lower enemy ATK damage by 10%, and selfheal 10%. Has 7% to dodge incoming attack."
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
      description: "On fourth attack strike x3 damage to 2 closest enemies and stun enemy for 2 turns."
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
      description: "Everytime getting attacked has 20% chance to gain 20% ATK damage bonus (stack 2000% max, stack can carry over to next enemy in battle but not next battle)."
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
      description: "Has 30% chance to dodge incoming attack, everytime dodge gain 25% attack bonus in the next attack."
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
      description: "If teammate gets fatal attack, instantly make a clone of them with their passive but with Metal Cooler 50% stats (clone doesn't count as teammate)."
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
      description: "Deal x2 atk damage with the strongest enemy in the opponent team."
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
      description: "Every attack has 45% chance to piercing the next enemy , if it success has 15% to pierce the next next enemy , piercing attack deal damage equal to 100% atk damage of this card."
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
      description: "Has 50% chance to turn the enemy passive attack back to the enemy with 50% efficiency."
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
      description: "Each turn, randomly choose Demon Slayer or Demon Dweller for the full turn. - Demon Slayer: Deal 165% atk damage with a 75% chance to stun the enemy for 1 turn, and has 25% chance to reflect incoming damage. - Demon Dweller: Deal 150% atk damage plus 35% of the last hit received, and reduce incoming damage by 15%."
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
    id: "aquaman",
    name: "Aquaman",
    rarity: "Epic",
    chance: 22222,
    requiredWeather: "Raining",
    stats: { hp: 4444, atk: 222 },
    passive: {
      name: "AQUARIUM",
      description: "If current weather is raining gain 50% income damage reduction."
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
      description: "On entry summon tsunami float all enemy deal damage equal to 100% atk damage of this card. If one or more enemy death by tsunami gain this card water shield equal to 100% max hp."
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
      description: "Every three turn, gain a weather shield equal to 30% of this card's base HP for 1 turn. If an enemy destroys the shield, transform them into snail for 2 turns."
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
      description: "For each turn not the one attack , stacking 10% atk damage bonus for each turn (NO CAP), Lose one stack when attack ."
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
    id: "builderman",
    name: "Builderman",
    rarity: "Mythic",
    chance: 250000,
    requiredWeather: "Sunny",
    stats: { hp: 5000, atk: 5000 },
    passive: {
      name: "DEVELOPER",
      description: "For every turn save 10% of enemy atk stats to Roblox tower. If defeat the enemy while Builderman still alive , all the save go to hp of Builderman."
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
    id: "adult-gon",
    name: "Adult Gon",
    rarity: "Secret",
    chance: 2500000,
    requiredWeather: "Eclipse",
    stats: { hp: 250000, atk: 2500 },
    passive: {
      name: "END!!!",
      description: "Every attack has 25% chance to strike x4 atk damage .When hp below 10% , the chance increase to 50% and x6 atk damage."
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
    stats: { hp: 10000, atk: 2000 },
    passive: {
      name: "Absolute Zero",
      description: "On fifth turn , Toshiro gain 50% atk buff , from then on every attack have 50% chance to stun enemy for one turn."
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
      description: "Upon killing an enemy, heal for 30% of the target's Max HP and gain 20% stats for 2 turns. If the enemy survived for longer than 3 turns while facing this card, absorb 50% of their base attack , and the enemy cant dodge this unit attack anymore."
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
      description: "Can survive fatality attack , if heal below 50% instantly heal 25% hp back and gain 50% atk damage ( once per match )."
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
      description: "Every time getting attacked absorb the damage and turn it into damage attack back to enemy ( 50% the original )."
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
      description: "When attack has 30% chance to call a teammates follow up with another attack."
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
    id: "uchiha-sasuke",
    name: "Uchiha Sasuke",
    rarity: "Mythic",
    chance: 550000,
    requiredWeather: "Shadow",
    stats: { hp: 40000, atk: 5500 },
    passive: {
      name: "Storm Susano",
      description: "Every attack has 15% chance to follow up another attack , when follow up attack inflict [ Burn ] for 3 turns , [ Burn ] deal damage to enemy equal to 25% Uchiha Sasuke atk damage . When hp below 40% gain 60% atk bonus and 30% income damage reduction for 6 turn."
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
    id: "wish",
    name: "Wish",
    rarity: "Secret",
    chance: 115000,
    requiredWeather: "Heavenly",
    stats: { hp: 15000, atk: 1500 },
    passive: {
      name: "Heavenly Blessing",
      description: "Boosts all allies maximum health by 150% while in the party."
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
      description: "Has 35 chance to dodge income attack , when dodged attack stun enemy for 3 turns."
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
      description: "Has 35% chance to dodge income attack , when dodged attack stun enemy for 3 turns."
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
      description: "On entry, create a domain that lasts 3 turns . When the domain is activated, disable all attack for both enemies and teammates for 1 turn , enemies inside the domain take burn damage equal to 100% of this card's damage each turn."
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
      description: "Finishes an enemy with a spectral silver edge after critical damage."
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
      description: "This card revives to 90% max HP after its first fatality attacked,after that fatality hits have a 65% chance to revive again with 50% max HP, everytime revice granting a 20% atk damage bonus , and 15% chance dodge income attack."
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
    stats: { hp: 11000, atk: 4500 },
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
    stats: { hp: 16000, atk: 4020 },
    passive: {
      name: "STRING ARMY",
      description: "Every kill has 30% chance to turn dead enemy into teammate ( once time per match )."
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
      description: "While in team when Victory Battle gain 100% more rewards . If Hakari enter the battle first gain Invincible ( cant be attack by anymean ) for 7 turn , else gain 77% atk damage boost or 77% hp boost."
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
