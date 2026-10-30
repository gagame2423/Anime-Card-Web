/* Pre-V2 baselines: preserve NPC stats while owned cards use cards.js V2. */
(function(host){
 'use strict';
 const BASELINES=Object.freeze({
  "starter-common": {
    "hp": 100,
    "atk": 25
  },
  "normal-demon": {
    "hp": 300,
    "atk": 10
  },
  "sasuke-kid": {
    "hp": 275,
    "atk": 12
  },
  "deku-mc": {
    "hp": 500,
    "atk": 10
  },
  "starter-rare": {
    "hp": 240,
    "atk": 75
  },
  "gon-kid": {
    "hp": 500,
    "atk": 50
  },
  "tanjiro": {
    "hp": 400,
    "atk": 100
  },
  "starter-epic": {
    "hp": 420,
    "atk": 150
  },
  "six-seven": {
    "hp": 676,
    "atk": 67
  },
  "kaneki-ghoul": {
    "hp": 600,
    "atk": 100
  },
  "the-trapper": {
    "hp": 500,
    "atk": 100
  },
  "nezuko": {
    "hp": 600,
    "atk": 150
  },
  "buggy": {
    "hp": 600,
    "atk": 110
  },
  "bounty-hunter": {
    "hp": 500,
    "atk": 100
  },
  "jotaro-kujo": {
    "hp": 750,
    "atk": 300
  },
  "hakari": {
    "hp": 777,
    "atk": 377
  },
  "saber": {
    "hp": 800,
    "atk": 400
  },
  "jonathan-joestar": {
    "hp": 1000,
    "atk": 350
  },
  "starter-legendary": {
    "hp": 1250,
    "atk": 400
  },
  "vegeta": {
    "hp": 1000,
    "atk": 440
  },
  "kakashi": {
    "hp": 2000,
    "atk": 505
  },
  "kr-kuuga": {
    "hp": 12500,
    "atk": 2500
  },
  "bulma": {
    "hp": 3080,
    "atk": 100
  },
  "denji": {
    "hp": 3333,
    "atk": 333
  },
  "uchiha-itachi": {
    "hp": 2550,
    "atk": 450
  },
  "madness-doctor": {
    "hp": 10101,
    "atk": 101
  },
  "erza": {
    "hp": 2550,
    "atk": 450
  },
  "yuji-itadori": {
    "hp": 4000,
    "atk": 600
  },
  "guts": {
    "hp": 8000,
    "atk": 800
  },
  "polnareff": {
    "hp": 10000,
    "atk": 1000
  },
  "the-flash": {
    "hp": 5200,
    "atk": 2500
  },
  "rimuru": {
    "hp": 8120,
    "atk": 2008
  },
  "starter-secret": {
    "hp": 10000,
    "atk": 2000
  },
  "viltrumite": {
    "hp": 20000,
    "atk": 2222
  },
  "mahito": {
    "hp": 1927,
    "atk": 792
  },
  "blackbeard": {
    "hp": 8000,
    "atk": 800
  },
  "garp": {
    "hp": 10000,
    "atk": 1500
  },
  "erwin": {
    "hp": 17555,
    "atk": 75
  },
  "boa-hancock": {
    "hp": 6969,
    "atk": 1069
  },
  "senku": {
    "hp": 1550,
    "atk": 55
  },
  "grimmjaw": {
    "hp": 6500,
    "atk": 1065
  },
  "reigen": {
    "hp": 100000,
    "atk": 1000
  },
  "kamen-rider-kabuto": {
    "hp": 5000,
    "atk": 3700
  },
  "meruem": {
    "hp": 74000,
    "atk": 5000
  },
  "frieza": {
    "hp": 6090,
    "atk": 3060
  },
  "adam-francis": {
    "hp": 2697,
    "atk": 440
  },
  "katakuri": {
    "hp": 27000,
    "atk": 2700
  },
  "whitebeard": {
    "hp": 50000,
    "atk": 5000
  },
  "doppio": {
    "hp": 1450,
    "atk": 145
  },
  "shanks": {
    "hp": 4740,
    "atk": 2474
  },
  "metal-cooler": {
    "hp": 8008,
    "atk": 3232
  },
  "gohan": {
    "hp": 8008,
    "atk": 3232
  },
  "yuno": {
    "hp": 23000,
    "atk": 4260
  },
  "asta": {
    "hp": 33000,
    "atk": 3333
  },
  "asta-demon": {
    "hp": 333000,
    "atk": 9999
  },
  "nami": {
    "hp": 50,
    "atk": 10
  },
  "giyu-tomioka": {
    "hp": 620,
    "atk": 109
  },
  "sea-beast": {
    "hp": 2000,
    "atk": 200
  },
  "arlong": {
    "hp": 2400,
    "atk": 240
  },
  "aquaman": {
    "hp": 4444,
    "atk": 222
  },
  "noelle-silva": {
    "hp": 40000,
    "atk": 2000
  },
  "weather-report": {
    "hp": 50000,
    "atk": 222
  },
  "piccolo": {
    "hp": 80000,
    "atk": 5000
  },
  "peashooter": {
    "hp": 1000,
    "atk": 100
  },
  "hutao": {
    "hp": 2020,
    "atk": 400
  },
  "weather-solar-deity": {
    "hp": 2770,
    "atk": 690
  },
  "builderman": {
    "hp": 5000,
    "atk": 5000
  },
  "aatrox": {
    "hp": 6666,
    "atk": 666
  },
  "weather-eclipse-harvester": {
    "hp": 9999,
    "atk": 666
  },
  "dante-limbus": {
    "hp": 10000,
    "atk": 1000
  },
  "adult-gon": {
    "hp": 250000,
    "atk": 2500
  },
  "rukia": {
    "hp": 1350,
    "atk": 300
  },
  "ice-admiral": {
    "hp": 3000,
    "atk": 1000
  },
  "weather-frost-sovereign": {
    "hp": 4600,
    "atk": 2050
  },
  "toshiro": {
    "hp": 10000,
    "atk": 2000
  },
  "android-21": {
    "hp": 20000,
    "atk": 3000
  },
  "yuta-okkotsu": {
    "hp": 19100,
    "atk": 2022
  },
  "luffy-nightmare": {
    "hp": 5000,
    "atk": 1000
  },
  "weather-shadow-monarch": {
    "hp": 6400,
    "atk": 3200
  },
  "cid-shadow": {
    "hp": 6400,
    "atk": 3200
  },
  "enderman": {
    "hp": 9999,
    "atk": 999
  },
  "homura-akemi": {
    "hp": 20008,
    "atk": 1990
  },
  "kr-decade": {
    "hp": 15000,
    "atk": 5000
  },
  "uchiha-sasuke": {
    "hp": 40000,
    "atk": 5500
  },
  "light-admiral": {
    "hp": 5000,
    "atk": 1000
  },
  "gojo-young": {
    "hp": 8888,
    "atk": 888
  },
  "weather-heavenly-seraph": {
    "hp": 8200,
    "atk": 4100
  },
  "sailor-moon": {
    "hp": 7007,
    "atk": 7007
  },
  "jin-mori": {
    "hp": 20000,
    "atk": 7200
  },
  "wish": {
    "hp": 15000,
    "atk": 1500
  },
  "weather-tsukuyomi-eye": {
    "hp": 8800,
    "atk": 4700
  },
  "diavolo": {
    "hp": 60000,
    "atk": 6000
  },
  "kaguya": {
    "hp": 66000,
    "atk": 9999
  },
  "weather-reaper-hollow": {
    "hp": 7000,
    "atk": 3500
  },
  "subaru": {
    "hp": 10000,
    "atk": 1000
  },
  "dio-brando": {
    "hp": 666,
    "atk": 333
  },
  "weather-malevolent-king": {
    "hp": 11000,
    "atk": 4500
  },
  "doflamingo": {
    "hp": 16000,
    "atk": 4020
  },
  "hakari-jackpot": {
    "hp": 77777,
    "atk": 7777
  },
  "mahoraga": {
    "hp": 80000,
    "atk": 8000
  },
  "tower-champion-normal": {
    "hp": 250000,
    "atk": 25000
  },
  "tower-champion-raining": {
    "hp": 222222,
    "atk": 2222
  },
  "tower-champion-snowing": {
    "hp": 104600,
    "atk": 46000
  },
  "tower-champion-sunny": {
    "hp": 78000,
    "atk": 13000
  },
  "tower-champion-sugar": {
    "hp": 76000,
    "atk": 7600
  },
  "tower-champion-reaper": {
    "hp": 60000,
    "atk": 30000
  },
  "tower-champion-eclipse": {
    "hp": 800000,
    "atk": 8
  },
  "tower-champion-malevolent": {
    "hp": 66666,
    "atk": 9999
  },
  "tower-champion-tsukuyomi": {
    "hp": 200000,
    "atk": 20000
  },
  "tower-champion-heavenly": {
    "hp": 40000,
    "atk": 5000
  },
  "tower-champion-shadow": {
    "hp": 102000,
    "atk": 28000
  },
  "raid-secret-mihawk": {
    "hp": 100000,
    "atk": 5000
  },
  "raid-secret-ace": {
    "hp": 10000,
    "atk": 1000
  },
  "raid-secret-marco": {
    "hp": 500000,
    "atk": 10000
  },
  "funny-valentine": {
    "hp": 21400,
    "atk": 2140
  },
  "dio-the-world": {
    "hp": 66666,
    "atk": 6666
  },
  "joseph-joestar": {
    "hp": 20000,
    "atk": 1200
  },
  "jolyne-joestar": {
    "hp": 26000,
    "atk": 6000
  },
  "tohth": {
    "hp": 30000,
    "atk": 1890
  },
  "emmu": {
    "hp": 200000,
    "atk": 10000
  },
  "josuke": {
    "hp": 240000,
    "atk": 12000
  },
  "akaza": {
    "hp": 450000,
    "atk": 40000
  },
  "awakened-doflamingo": {
    "hp": 60220,
    "atk": 26200
  },
  "prime-garp": {
    "hp": 38992,
    "atk": 3899
  },
  "boss-event-alucard": {
    "hp": 333333,
    "atk": 66666
  },
  "madara-lubu": {
    "hp": 500000,
    "atk": 100000
  },
  "sung-jin-woo": {
    "hp": 223000,
    "atk": 22300
  },
  "frieren": {
    "hp": 200000,
    "atk": 25000
  },
  "alexander-anderson": {
    "hp": 77700,
    "atk": 7700
  },
  "julius": {
    "hp": 200000,
    "atk": 15000
  },
  "speed-wizard": {
    "hp": 45000,
    "atk": 4500
  },
  "boss-event-lucius": {
    "hp": 300000,
    "atk": 30000
  },
  "sea-goddess-valkyrie": {
    "hp": 400000,
    "atk": 20000
  },
  "yuno-spirit": {
    "hp": 255500,
    "atk": 19892
  },
  "tower-champion-lucky": {
    "hp": 444444,
    "atk": 22222
  },
  "tower-champion-wind": {
    "hp": 210000,
    "atk": 21000
  },
  "tower-champion-bizare": {
    "hp": 200000,
    "atk": 33000
  },
  "tower-champion-shadow-200": {
    "hp": 600000,
    "atk": 120000
  },
  "tower-champion-normal-200": {
    "hp": 200000,
    "atk": 16900
  },
  "shirou": {
    "hp": 10000,
    "atk": 8000
  },
  "kiritsu": {
    "hp": 150000,
    "atk": 20000
  },
  "mash": {
    "hp": 300000,
    "atk": 20000
  },
  "gilgamesh": {
    "hp": 1000000,
    "atk": 50000
  },
  "cu-chalinn": {
    "hp": 200000,
    "atk": 50000
  },
  "saber-knight": {
    "hp": 80000,
    "atk": 8000
  },
  "iskandar": {
    "hp": 400000,
    "atk": 27500
  },
  "medea": {
    "hp": 200000,
    "atk": 32000
  },
  "merlin": {
    "hp": 100000,
    "atk": 17000
  },
  "tower-champion-heavenly-200": {
    "hp": 400000,
    "atk": 36000
  },
  "the-legion": {
    "hp": 66666,
    "atk": 6666
  },
  "the-clown": {
    "hp": 33333,
    "atk": 6666
  },
  "the-oni": {
    "hp": 33333,
    "atk": 9999
  },
  "jason-13th": {
    "hp": 333333,
    "atk": 66666
  },
  "freddy-krueger": {
    "hp": 99999,
    "atk": 33333
  },
  "myers": {
    "hp": 666666,
    "atk": 66666
  },
  "gojo-revice": {
    "hp": 88888,
    "atk": 8888
  },
  "geto-young": {
    "hp": 52500,
    "atk": 4500
  },
  "toji": {
    "hp": 235000,
    "atk": 35500
  },
  "jogo": {
    "hp": 231000,
    "atk": 31000
  },
  "true-mahito": {
    "hp": 224000,
    "atk": 15670
  },
  "todo": {
    "hp": 100000,
    "atk": 5000
  },
  "dagon": {
    "hp": 400000,
    "atk": 12000
  },
  "choso": {
    "hp": 280000,
    "atk": 32500
  },
  "haruta": {
    "hp": 30000,
    "atk": 7500
  },
  "mechamaru": {
    "hp": 380000,
    "atk": 18000
  },
  "hanami": {
    "hp": 220000,
    "atk": 18200
  },
  "sukuna-shibuya": {
    "hp": 1000000,
    "atk": 9999
  }
});
 for(const stats of Object.values(BASELINES))Object.freeze(stats);
 function card(value){if(!value)return value;const stats=BASELINES[value.id];return stats?{...value,stats:{...stats}}:value;}
 host.EnemyStatsSystem=Object.freeze({BASELINES,card});
})(window);
