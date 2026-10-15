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
      description: "Each attack by this card gains 10% ATK boost ( stack to 100% )."
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
      description: "Whenever this card kills an enemy, this card gains 10% HP."
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
      description: "On the third attack made by this card strike x2.5 ATK damage."
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
      description: "Each attack by this card has 20% chance to heal 20% HP."
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
      description: "Has 5% chance to evade the next incoming hit."
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
      description: "First attack has 33% to strike double damage."
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
      description: "At the start of battle, this card gains 25% bonus HP"
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
      description: "Every two attacks made by this card launch a puch with more 50% ATK."
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
      description: "First entry stun the enemy for the next 3 turn."
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
      description: "Every third attack made by this card steals blood and heals this card for 25% of the enemy's current HP"
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
      description: "When enem entry has 50% chance to get strike x5 ATK damage."
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
      description: "When this card attacks, it inflicts [ Bleed ] for 2 turn , [ Bleed ] drain HP enemy equal to 5% of Nezuko ATK every turn."
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
      description: "This unit has a 33% chance to dodge an incoming attack; a successful dodge does not trigger an out-of-turn counterattack."
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
      description: "Whenever this card kills an enemy, gain money equal to enemy HP."
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
      description: "Each attack by this card has 50% chance to follow up a next attack , and 25% chance to follow up the follow up , the follow up attack have 40% attack damage."
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
      description: "On the seventh attack made by this card has 7% chance strike x77 ATK damage."
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
      description: "On the eighth attack made by this card strike x8 attack damage."
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
      description: "On the ninth attack made by this card gain 900% bonus ATK damage for the rest of the match."
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
      description: "Every fifth attack made by this card , do 10% attack damage to enemy constantly for 10 times."
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
      description: "When this card's HP falls below 25%, this card gains 100% ATK damage."
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
      description: "This unit has a 22% chance to dodge an incoming attack; a successful dodge does not trigger an out-of-turn counterattack."
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
      description: "Every third attack made by this card change form : Blue , Green , Purple : + Blue : Gain 20% critical chance ,+ Green : Gain 50% critical damage , + Purple : Gain 30% more HP."
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
      description: "Team support. At the start of each turn, if this card is not the attacker, this card has a 10% chance to grant the attacker +30% ATK damage on that attack."
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
      description: "Each attack by this card has 33% chance to follow the next attack , the follow up attack can follow up again."
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
      description: "Each attack by this card has a 30% chance to inflict [Burn] and immediately trigger a follow-up attack; [Burn] deals damage equal to 5% of this card's ATK each turn for 3 turns"
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
      description: "Every second attack made by this card has a 40% chance to lower the enemy's ATK by 5%"
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
      description: "If this card's HP falls below 50% immune to every passive."
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
      description: "Each attack by this card has a 33% chance to deal x3 ATK damage"
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
      description: "This unit has a 33% chance to enter Berserker mode; while in Berserker mode, attacks made by this card inflict [Bleed] for 2 turns, and [Bleed] drains enemy HP each turn equal to 10% of this card's ATK"
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
      description: "When this card's HP falls below 25%, this card gains 100% ATK damage"
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
      description: "This unit has a 60% chance to dodge incoming attacks; after more than 3 consecutive successful dodges, this card is defeated by the documented heart-attack effect"
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
      description: "Whenever this card kills an enemy, this card gains 1 Slime point; each Slime point can prevent one fatality and grants +30% ATK damage and +20% HP; each prevented fatality consumes 1 Slime point"
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
      description: "Immune to every passive of opponent."
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
      description: "Every third attack made by this card has 33% chance to deal bonus 222% ATK damage."
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
      description: "If this card kills an enemy whose HP is below 10%, this card gains 1 Soul; each Soul clears one debuff inflicted on this card"
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
      description: "Kill enemy gain 25% of their ATK damage."
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
      description: "On the third attack made by this card, stun the enemy for 2 turns; if an enemy dies before this card's third attack, this card's next enemy takes x2 ATK damage once this match"
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
      description: "Team support. When this card enters first, all teammates gain 100% ATK damage for the rest of the battle."
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
      description: "Every two attacks made by this card have a 69% chance to freeze the enemy for 1 turn; when this card attacks a frozen enemy, it deals x1.5 ATK damage"
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
      description: "Teammate effect. Team support. At the start of each turn when this card is not the attacker, all teammates recover 2.5% of their Max HP (blocked by Bleed)"
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
      description: "On the fifth attack made by this card blasting all enemies with x2 ATK damage."
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
      description: "On entry, if another living teammate is available, Reigen chooses one at random and uses that teammate's passive. If Reigen enters with no other living teammate, it gains +200% ATK and +100% max HP, and its passive is disabled.\nDisabling this passive does not stop Reigen from making normal primary attacks. Stun, Freeze and other normal turn-control effects still apply."
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
      description: "Each attack by this card has a 10% chance to trigger another attack; follow-up attacks can chain again. A follow-up attack inflicts 1-turn Stun, and when this card attacks a Stunned enemy, this card heals 5% HP"
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
      description: "Each time this card is attacked, this card gains 1 Aura stack (max 5). Upon first reaching 5/5 Aura, this card heals for 5% Max HP (blocked by Bleed); each stack grants +10% critical damage"
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
      description: "On this card's entry, sort the opponent team from weakest to strongest by ATK so this card faces the weakest enemy"
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
      description: "Each attack by this card has a 20% chance to Stun the enemy for 1 turn; after the Stun ends, that enemy deals 18% less ATK damage"
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
      description: "Each attack by this card has a 27% chance to reduce the enemy's ATK by 10% and heal this card for 10%; this card also has a 7% chance to dodge incoming attacks"
    },
    image: "assets/cards/katakuri.png"
  },
  {
    id: "whitebeard",
    element: "Dark",
    name: "WhiteBeard",
    rarity: "Mythic",
    chance: 500100,
    requiredWeather: null,
    stats: { hp: 50000, atk: 5000 },
    passive: {
      name: "Quake Hermit",
      description: "On the fourth attack made by this card, strike the 2 closest enemies for x3 ATK damage and Stun them for 2 turns"
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
      description: "Each time this card is attacked, it has a 20% chance to gain a +20% ATK damage stack (2000% max); stacks persist across enemies in the same battle but not across battles"
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
      description: "This unit has a 30% chance to dodge incoming attacks; each successful dodge grants +25% ATK damage to this card's next attack"
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
      description: "Teammate effect. When an original teammate is about to take a fatal hit, Metal Cooler creates a Clone with 50% of that teammate's current max HP and ATK and keeps that teammate's passive. The Clone enters directly behind Metal Cooler. There is no numeric creation cap; generated units cannot create more companions or trigger this cloning effect."
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
      description: "This unit deals x2 ATK damage to the strongest enemy in the opponent team"
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
      description: "Each attack by this card has a 45% chance to pierce the next enemy; a successful pierce has a 15% chance to pierce the next enemy again; each piercing attack deals 100% of this card's ATK damage"
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
      description: "Has 50% chance to turn the enemy passive attack back to the enemy with 50% efficiency."
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
      description: "Each turn, randomly choose Demon Slayer or Demon Dweller for the full turn. - Demon Slayer: Deal 165% ATK damage with a 75% chance to stun the enemy for 1 turn, and has 25% chance to reflect incoming damage. - Demon Dweller: Deal 150% ATK damage plus 35% of the last hit received, and reduce incoming damage by 15%."
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
      description: "If Nami is on this card's team, winning the battle grants this card/team 100% bonus rewards"
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
      description: "On the fifth attack made by this card, Stun the enemy for 1 turn; for the next 3 turns, this card is immune to incoming attacks"
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
      description: "Team support. When an enemy attacks a teammate, this card intercepts and takes that damage for the teammate."
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
      description: "Enemies facing this card have a 24% chance to miss their attacks"
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
      description: "If the current weather is Raining, this card gains 50% incoming damage reduction"
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
      description: "On this card's entry, summon a tsunami that deals damage equal to 100% of this card's ATK to all enemies; if at least one enemy dies to the tsunami, this card gains a Water Shield equal to 100% Max HP"
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
      description: "Every 3 turns, this card gains a Weather Shield equal to 30% of this card's current Max HP (including level, mutations and buffs) for 1 turn; if an enemy destroys the shield, that enemy is transformed into a Snail for 2 turns"
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
      description: "For each turn when this card does not attack, this card gains a 10% ATK damage stack (no cap); this card loses 1 stack when it attacks"
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
      description: "When this card's HP falls below 30%, this card heals 5% HP each turn"
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
      description: "Attacks made by this card inflict [Burn], and [Burn] deals 50% additional damage based on this card's ATK"
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
      description: "If the weather is Sunny, this card's ATK damage is doubled"
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
      description: "Each turn, this card stores 10% of the enemy's ATK in Roblox Tower power; if the enemy is defeated while this card is alive, all stored power is converted into this card's HP"
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
      description: "Each attack by this card heals this card for 5% HP"
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
      description: "Teammate effect. When entry sacrifice all teammate for 100% ATK damage boost per teammate alive."
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
      description: "Teammate effect. When an enemy is defeated by a fatality attack, this card revives one teammate with Dante's stats while preserving that teammate's passive (once per match)"
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
      description: "Each attack by this card has a 25% chance to deal x4 ATK damage; when this card's HP falls below 10%, the chance increases to 50% and the damage becomes x6 ATK"
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
      description: "Each attack by this card has a 10% chance to Freeze the enemy for 1 turn; when this card attacks a Frozen enemy, it deals +35% ATK damage"
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
      description: "Has 33% chance to freeze an enemy after landing a critical hit."
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
      description: "Has 67% chance to freeze an enemy after landing a critical hit."
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
      description: "On the fifth battle turn, this card gains +50% ATK; from then on, every attack made by this card has a 50% chance to Stun the enemy for 1 turn"
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
      description: "When this card kills an enemy, this card heals for 30% of the target's Max HP and gains +20% stats for 2 turns; if an enemy survives longer than 3 turns while facing this card, this card absorbs 50% of that enemy's base ATK and that enemy can no longer dodge this card's attacks"
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
      description: "Can survive fatality attack , if heal below 50% instantly heal 25% HP back and gain 50% ATK damage ( once per match )."
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
      description: "Each time this card is attacked, this card absorbs the damage and returns 50% of the original damage to the enemy"
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
      description: "Team support. When this card attacks, it has a 30% chance to call a teammate to make one follow-up attack."
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
      description: "Every 10th attack made by this card strikes all enemies for x100 ATK damage"
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
      description: "Survive one fatality attack"
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
      description: "Team support. When a heal brings this card or a teammate from below 60% HP to at least 60% HP, this card freezes an enemy for 5 turns (once per battle)"
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
      description: "On this card's entry, this card shape-shifts into an enemy card with the same passive while keeping this card's own stats"
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
      description: "Each attack by this card has a 15% chance to trigger a follow-up attack; follow-up attacks made by this card inflict [Burn] for 3 turns, and [Burn] deals damage equal to 25% of this card's ATK each turn. When this card's HP falls below 40%, this card gains +60% ATK and 30% incoming damage reduction for 6 turns"
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
      description: "This unit has a 20% chance to dodge incoming attacks; when a dodge succeeds, the enemy is Stunned for the next turn"
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
      description: "This unit has an 88% chance to dodge incoming attacks, but cannot dodge passive attacks"
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
      description: "Radiant Energy converts each perfect roll into bonus power for this card"
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
      description: "After this card wins a 1v1 battle, it has a 20% chance to add one random Common-Uncommon Weather for 3 minutes"
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
      description: "Teammate effect. If a teammate dies, this card creates a clone with Jin Mori stats and that teammate's passive (up to x3 per match)"
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
      description: "Teammate effect. While this card is in the party, all allies gain 150% Max HP"
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
      description: "This unit has a 35% chance to dodge incoming attacks; when a dodge succeeds, the attacker is Stunned for 3 turns"
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
      description: "This unit has a 35% chance to dodge incoming attacks; when a dodge succeeds, the attacker is Stunned for 3 turns"
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
      description: "Teammate effect. On this card's entry, this card creates a domain lasting 3 turns. When activated, the domain disables attacks for all enemies and teammates for 1 turn; enemies inside take Burn damage each turn equal to 100% of this card's ATK"
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
      description: "After this card deals critical damage, this card can finish an enemy with a spectral silver edge"
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
      description: "After this card suffers its first fatality, this card revives at 90% Max HP; later fatality hits have a 65% chance to revive this card at 50% Max HP. Each revival grants +20% ATK damage and 15% dodge chance"
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
      description: "An attack made by this card has a 20% chance to Freeze the enemy for 2 turns; when the Freeze succeeds, this card heals for 20% HP"
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
      description: "On the fifth attack made by this card, repeatedly slash the enemy until the enemy's HP falls below 50%"
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
      description: "Teammate effect. Whenever this card kills an enemy, this card has a 30% chance to turn that defeated enemy into a teammate. This original unit can repeat the 30% conversion chance after each eligible kill; generated teammates cannot create further units"
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
      description: "While this card is in the team, Victory Battle grants 100% more rewards. If this card enters first, it becomes Invincible for 7 turns; otherwise, it gains either +77% ATK damage or +77% HP"
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
      description: "Each time this card is attacked, it has a 25% chance to Adapt that attack and gain 25% incoming damage reduction; the adaptation resets when facing a new enemy. Each time this card kills an enemy, this card heals 50% HP"
    },
    image: "assets/cards/mahoraga.png"
  }
];

// Champions retain the existing reward IDs/receipts; exact level-1 Normal specs.
const TOWER_REWARD_CARDS = [
  {"id": "tower-champion-normal", "element": "Electric", "image": "assets/cards/equinox.png", "towerType": "normal", "unlockRequirement": "tower_floor_100_normal", "sourceId": "starter-common", "name": "Equinox", "chance": 2500025, "requiredWeather": "Normal", "nativeWeather": null, "stats": {"hp": 250000, "atk": 25000}, "passive": {"name": "Emotional Meter", "description": "At the start of the match, the Emotional Meter is 50% positive and 50% negative. The two sides always add up to 100%.\nEach primary attack moves a random 10–20 percentage points toward positive. Each incoming hit moves a random 10–20 percentage points toward negative. Moving toward one side reduces the other by the same amount.\nAt 100% positive, every living teammate, including Equinox, gains 100% additional max HP and 25% additional ATK. The meter then locks and cannot trigger again.\nAt 100% negative, Equinox deals damage equal to x25 its current ATK to every living enemy, then dies permanently. This death cannot be reversed by revival or cloning."}},
  {"id": "tower-champion-raining", "element": "Water", "image": "assets/cards/aqua.png", "towerType": "raining", "unlockRequirement": "tower_floor_100_raining", "sourceId": "aquaman", "name": "Aqua", "chance": 2222222, "requiredWeather": "Raining", "nativeWeather": "raining", "stats": {"hp": 222222, "atk": 2222}, "passive": {"name": "Useless", "description": "Before the battle starts, choose one of two team benefits: 50% additional max HP for the whole team, including Aqua, or a 50% bonus to eligible battle rewards.\nThe HP choice is applied once per team, even if the lineup contains multiple Aquas. The reward choice increases eligible battle currency, battle experience and Reward Bonus; it does not increase Tower Coins, independent potion drop chances or Time Trial payouts. Tower still gives no experience.\nAt the start of an allied combat turn, if another living teammate is the active attacker and Aqua is alive, Aqua heals that teammate for 10% of the teammate's current max HP and increases the teammate's current ATK by 2.2%. This support also occurs if the teammate later loses the attack to stun or freeze.\nAqua does not heal the enemy team or herself through this support trigger. Follow-up attacks in the same turn do not trigger extra support."}},
  {"id": "tower-champion-snowing", "element": "Water", "image": "assets/cards/iceking.png", "towerType": "snowing", "unlockRequirement": "tower_floor_100_snowing", "sourceId": "toshiro", "name": "Ice King", "chance": 1058000, "requiredWeather": "Snowing", "nativeWeather": "snowing", "stats": {"hp": 104600, "atk": 46000}, "passive": {"name": "Ice Manipulation", "description": "When Ice King is hit, it has a 20% chance to freeze the attacker for two of that attacker's turns. Ice King's primary attacks deal 50% additional damage to targets that are already frozen.\nThe first eligible fatal hit revives Ice King at full max HP and starts a five-combat-turn afterlife. Both teams' combat turns count toward this timer. Further fatal hits during the afterlife do not restart it or grant another revival.\nWhen the five turns end, Ice King dies permanently. Other cards cannot revive Ice King, and this passive can start its afterlife only once per match.\nOn permanent death, Ice King has a 58% chance to give one random living teammate the Ice King Crown. The Crown adds a separate 10% chance on each successful primary attack to freeze that attack's target for three turns. It does not change Ice King's own two-turn freeze effect."}},
  {"id": "tower-champion-sunny", "element": "Fire", "image": "assets/cards/charizardx.png", "towerType": "sunny", "unlockRequirement": "tower_floor_100_sunny", "sourceId": "weather-solar-deity", "name": "Charizard Mega X", "chance": 634000, "requiredWeather": "Sunny", "nativeWeather": "sunny", "stats": {"hp": 78000, "atk": 13000}, "passive": {"name": "Solar Claw", "description": "Charizard Mega X has a base 33% critical-hit chance. Every attack still rolls for a critical hit normally.\nThe first successful critical hit in the match inflicts Burn on its surviving target for 3 of the target's turns. Each Burn tick deals 33% of Charizard's current ATK when the effect is applied. A fully blocked critical hit does not consume this first-crit trigger.\nAfter that first successful critical hit, each later critical hit applies x3 to its attack damage before the normal critical-damage multiplier. A non-critical hit remains normal. These later critical hits do not reapply Solar Claw Burn.\nSolar Claw never creates a free follow-up attack and never guarantees the next critical hit. Existing critical buffs, defenses and status immunity still apply."}},
  {"id": "tower-champion-sugar", "element": "Electric", "image": "assets/cards/buu.png", "towerType": "sugar", "unlockRequirement": "tower_floor_100_sugar", "sourceId": "android-21", "name": "Majin Buu", "chance": 760000, "requiredWeather": "Sugar", "nativeWeather": "sugar", "stats": {"hp": 76000, "atk": 7600}, "passive": {"name": "Candy Eater", "description": "Majin Buu starts with zero candies. Each primary attack gains a random one to three candies before its damage is resolved. Candy count determines the active form; only that form's bonuses apply, and bonuses from earlier forms do not stay active.\nForm 1 — 0–10 candies: primary attack damage is increased by 25%, and each attack gains one extra candy in addition to the normal random gain.\nForm 2 — 11–25 candies: max HP is increased by 50% while this form is active. When Buu is hit and still alive, it spends one candy to heal for 3% of its current max HP.\nForm 3 — 26–50 candies: after a primary attack deals damage, Buu summons one Ghost. The Ghost's max HP equals the damage actually dealt by that attack, and its ATK equals 10% of Buu's current ATK. Ghosts cannot create more summons.\nForm 4 — 51–75 candies: Buu has a 76% chance to dodge. A successful dodge skips its next attack, adds five candies and heals 7.6% of its current max HP.\nForm 5 — 76–99 candies: every third primary attack also hits up to three different randomly selected living enemies, each for 50% of Buu's current ATK.\nFinal Form — 100 candies: each primary attack also hits the remaining living enemy team with Buu's current ATK. Each attack spends one candy; this form stays active until all candies are spent.\nAt zero candies, Buu returns to Form 1 and is stunned for five of its turns. It cannot gain candies or change forms during this reversion. Healing follows the normal anti-healing rules. A cloned or summoned Buu keeps its other effects but cannot summon Ghosts."}},
  {"id": "tower-champion-reaper", "element": "Holy", "image": "assets/cards/aizenbeyond.png", "towerType": "reaper", "unlockRequirement": "tower_floor_100_reaper", "sourceId": "weather-reaper-hollow", "name": "Aizen Beyond", "chance": 6000000, "requiredWeather": "Reaper", "nativeWeather": "reaper", "stats": {"hp": 60000, "atk": 30000}, "passive": {"name": "Illusion Shattering Flower", "description": "Every second primary attack, Aizen Beyond additionally strikes every living enemy. Each enemy takes damage equal to 60% of that enemy's own current ATK, rather than 60% of Aizen's ATK.\nAfter taking damage, Aizen has a 6% chance to counter the attacker for 50% of the damage Aizen actually received. This counter does not trigger another Aizen counter in response.\nThe first eligible fatal hit in a match revives Aizen at 100% of its current max HP and grants +100% of its current ATK for the rest of the battle. This ATK bonus does not expire. This self-revival can occur only once per match and follows the game's anti-revival rules.\nAizen cannot be cloned or revived by another teammate."}},
  {"id": "tower-champion-eclipse", "element": "Dark", "image": "assets/cards/wou.png", "towerType": "eclipse", "unlockRequirement": "tower_floor_100_eclipse", "sourceId": "weather-eclipse-harvester", "name": "Wonder Of You", "chance": 8000000, "requiredWeather": "Eclipse", "nativeWeather": "eclipse", "stats": {"hp": 800000, "atk": 8}, "passive": {"name": "Calamity", "description": "At battle start, Wonder Of You randomly selects one other living teammate to protect. If that teammate dies, it selects another living teammate. With no other living teammate, there is no protection target.\nWhen the protected teammate takes damage, its shield and normal damage reduction are applied first. The remaining damage is split: the teammate keeps 50%, and Wonder Of You absorbs the other 50% directly without changing either unit's position or the active frontline.\nWonder Of You has an 8% chance to send the shared half back to the original attacker instead of absorbing it. The teammate still takes its own half. Shared or reflected damage cannot trigger another Calamity redirection; the receiving unit's normal defenses still apply. For odd damage, the extra point stays on the protected teammate.\nWhen the protected teammate defeats an enemy, Wonder Of You heals for 80% of its current max HP, subject to normal anti-healing rules.\nIf Wonder Of You dies while it has a protection target, it has an 8% chance to execute the attacker. The execution respects existing passive immunity and fatal-hit survival effects."}},
  {"id": "tower-champion-malevolent", "element": "Fire", "image": "assets/cards/thukuna.png", "towerType": "malevolent", "unlockRequirement": "tower_floor_100_malevolent", "sourceId": "weather-malevolent-king", "name": "Thukuna", "chance": 666999, "requiredWeather": "Malevolent", "nativeWeather": "malevolent", "stats": {"hp": 66666, "atk": 9999}, "passive": {"name": "Malevolent Kitchen", "description": "Count Thukuna's primary attacks. After it has made five, every subsequent combat turn, including enemy turns, additionally hits every living enemy for 25% of Thukuna's current ATK while Thukuna is alive.\nWhenever Thukuna is hit and survives, it has a 66% chance to heal for 6% of its current max HP and increase its current ATK by 9%.\nThe attack-power increases have no stack limit and remain for the match. Each new increase uses the ATK at that moment. Healing follows normal anti-healing rules; Tower enemy attack limits still apply."}},
  {"id": "tower-champion-tsukuyomi", "element": "Nature", "image": "assets/cards/narutosasuke.png", "towerType": "tsukuyomi", "unlockRequirement": "tower_floor_100_tsukuyomi", "sourceId": "weather-tsukuyomi-eye", "name": "Naruto x Sasuke", "chance": 2000000, "requiredWeather": "Tsukuyomi", "nativeWeather": "tsukuyomi", "stats": {"hp": 200000, "atk": 20000}, "passive": {"name": "Datebayo", "description": "Whenever a new enemy becomes the active opponent, Naruto x Sasuke randomly chooses Naruto mode or Sasuke mode with equal chances. The chosen mode remains until that opponent dies; a new opponent starts a new mode attack counter.\nNaruto mode: every third primary attack deals x3 its normal damage and summons one Clone. Each Clone starts with 10% of this card's current max HP and ATK. Living Clones make a follow-up hit after their owner's primary attack. The original card has no Clone count limit, but Clones cannot create more Clones or other summons.\nWhen a Naruto Clone dies while its owner is alive, the owner heals for 10% of its current max HP. Switching to Sasuke removes all Naruto Clones without granting this death heal.\nSasuke mode: every second primary attack also hits every living enemy for 50% of this card's current ATK. Sasuke has a 20% dodge chance.\nOn a successful Sasuke dodge, the attacker receives Burn for five of its turns, dealing 25% of this card's ATK at application per turn. Sasuke gains a shield equal to the incoming damage it avoided; the shield lasts three combat turns. When that Burn naturally ends, its victim is stunned for one turn.\nSwitching to Naruto removes Sasuke's shield. Healing, shields and status effects follow the existing battle rules. A cloned or summoned copy keeps the other mode effects but cannot summon Clones."}, "requiredWeathers": ["Tsukuyomi", "Mangekyo"]},
  {"id": "tower-champion-heavenly", "element": "Holy", "image": "assets/cards/judgement.png", "towerType": "heavenly", "unlockRequirement": "tower_floor_100_heavenly", "sourceId": "weather-heavenly-seraph", "name": "The Judgement", "chance": 300300, "requiredWeather": "Heavenly", "nativeWeather": "heavenly", "stats": {"hp": 40000, "atk": 5000}, "passive": {"name": "Divine Light", "description": "Every second primary attack, The Judgement has a 33% chance to fire a light beam at every living enemy. Each beam hit deals damage equal to 50% of this card's current ATK.\nAn enemy damaged by the beam has a 66% chance to receive Heresy for a random one to three of that enemy's turns.\nWhile at least one living enemy has Heresy, The Judgement uses Zealous mode: the beam chance becomes 66%, beam damage becomes 66% of current ATK, and each damaged enemy's chance to receive Heresy becomes 33%.\nAn enemy with Heresy deals 9% less attack and skill damage and has a separate 3% chance to miss a primary attack. When no living enemy has Heresy, the normal beam values return. Existing defenses and status immunity still apply."}},
  {"id": "tower-champion-shadow", "element": "Dark", "image": "assets/cards/krdarkdecade.png", "towerType": "shadow", "unlockRequirement": "tower_floor_100_shadow", "sourceId": "weather-shadow-monarch", "name": "Kamen Rider Dark Decade", "chance": 2009000, "requiredWeather": "Shadow", "nativeWeather": "shadow", "stats": {"hp": 102000, "atk": 28000}, "passive": {"name": "Dark Aurora", "description": "Whenever the original Dark Decade defeats an enemy, it has a 29% chance to convert that enemy into a teammate and steal the enemy's passive. Uncloneable enemies and existing clones or summons cannot be converted.\nThe converted teammate is inserted directly in front of Dark Decade, shifting Dark Decade back one position. If Dark Decade is the active fighter, the converted teammate takes the frontline. It copies Dark Decade's current max HP and ATK and keeps the defeated enemy's passive; Dark Decade also begins using that stolen passive.\nWhile Dark Decade is alive, a defeated original teammate can revive at the back of the lineup with Dark Decade's current max HP and ATK, keeping that teammate's own passive. Each original teammate can receive this revival at most twice per match. Dark Decade cannot revive itself. Clones, summons and converted units are never eligible, and anti-revival rules still apply.\nConverted teammates cannot create further clones, summons or converted units, even when their inherited passive normally creates companions. A cloned or summoned Dark Decade cannot convert enemies. Ordinary attacks and non-summoning effects of stolen passives remain available."}},
].map(reward => Object.freeze({ ...reward, towerFloor: 100, rarity: 'Secret', image: reward.image, description: `Clear Floor 100 of ${reward.towerType} Tower. Future rolls require the matching weather.` }));
CARDS.push(...TOWER_REWARD_CARDS);
// Raid-only secrets never enter RNG pools, including after their first unlock.
const RAID_SECRET_CARDS = [
  { id: 'raid-secret-mihawk', element: 'Nature', name: 'Mihawk', rarity: 'Secret', chance: 0, stats: { hp: 100000, atk: 5000 }, image: 'assets/cards/mihawk.png',
    passive: { name: 'Hawkeye', description: 'Mihawk has a 50% chance to dodge an incoming attack. On a successful dodge, it counters the attacker for 500% of its current ATK.\nEach primary attack pierces the living enemy lineup. Every successful damaging hit applies x0.75 to the damage used for the next target. If the first target dodges or blocks all damage with a shield, the attack still pierces the other enemies without consuming a damage-falloff step.\nAt the start of every combat turn while Mihawk is alive, it has a 25% chance to enter Haki for 2 combat turns: +250% current ATK and 25% incoming damage reduction. Reapplying Haki refreshes its duration without stacking the same buff. Other defense and status rules still apply.' } },
  { id: 'raid-secret-ace', element: 'Fire', name: 'Ace', rarity: 'Secret', chance: 0, stats: { hp: 10000, atk: 1000 }, image: 'assets/cards/ace.png',
    passive: { name: 'Mera Mera', description: 'Each successful attack has a 10% chance to inflict Burn for 3 of the target\'s turns. Each Burn tick deals 100% of Ace\'s current ATK when the effect is applied.\nOn Ace\'s death, every other living teammate gains Brother Soul for the rest of the match. Each successful attack by an affected teammate has a separate 10% chance to inflict Burn for 1 of the target\'s turns, dealing 100% of that teammate\'s current ATK.\nBrother Soul Burn stacks with Burn from the teammate\'s own passive. Multiple Ace deaths do not multiply the Brother Soul trigger chance. Status immunity and normal Burn rules still apply.' } },
  { id: 'raid-secret-marco', element: 'Water', name: 'Marco', rarity: 'Secret', chance: 0, stats: { hp: 500000, atk: 10000 }, image: 'assets/cards/marco.png',
    passive: { name: 'Phoenix Inferno', description: 'While Marco is alive, each attack directed at another teammate has a 10% chance to be blocked completely. Marco then counters the attacker for 200% of Marco\'s current ATK without moving either teammate.\nOnce per match, if a living teammate falls below 10% of its current max HP, Marco swaps lineup positions with that teammate and attempts to restore the teammate to max HP. This rescue is checked after damage and at the start of combat turns; it cannot revive a teammate that has already died. Normal anti-healing rules still apply.\nMarco has a 10% dodge chance. Each successful dodge grants every living teammate, including Marco, +10% current max HP for the rest of the match. These HP bonuses stack.' } }
].map(card => Object.freeze({ ...card, requiredWeather: null, raidOnly: true, raidType: 'marine_fort', unlockRequirement: `raid_secret_${card.name.toLowerCase()}`, description: 'Exclusive Marine Fort Raid drop. Never available from normal rolls.' }));
CARDS.push(...RAID_SECRET_CARDS);
if (typeof window !== 'undefined') window.RAID_SECRET_CARDS = RAID_SECRET_CARDS;
if (typeof window !== 'undefined') window.TOWER_REWARD_CARDS = TOWER_REWARD_CARDS;

// The base card database is immutable at the array level. Gameplay code must
// always sort/filter a fresh copy so Collection/Battle rendering can never
// mutate the canonical order.
Object.freeze(CARDS);
const ALL_CARDS = CARDS;

if (typeof window !== "undefined") {
  window.CARDS = CARDS;
  window.ALL_CARDS = ALL_CARDS;
}
