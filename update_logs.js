/* Update archive: history owns release membership; the game catalog owns current details. */
(function (host) {
  'use strict';
  const ids = text => text.trim().split(/\s+/).filter(Boolean);
  // Release numbers belong to the archive. Closely related patches are grouped.
  const releases = [];
  function release(version, title, intro, notes, { units = '', relics = '', items = '', jumps = '', art = '' } = {}) {
    releases.push({ version, title, intro, notes, units:ids(units), relics:ids(relics), items:ids(items), jumps:ids(jumps), art });
  }

  release(0, 'The First Summon', 'Every collection starts with one roll. Discover the original roster and build the lineup that will carry you into the Arena.', {
    'Original roster': 'Summon characters from across anime and games, from Naruto Kid and Sasuke Kid to your first high-rarity pulls. Each character has its own combat passive and base stats.',
    'Weather and mutations': 'Changing weather opens special roll pools. Mutations change a card’s stats and can appear together on the same pull.',
    'Clash Arena': 'Choose an owned card variant for a duel or build a four-card lineup. Earn battle rewards and strengthen the collection you bring to the next fight.'
  }, { units: `
      starter-common normal-demon sasuke-kid deku-mc starter-rare gon-kid tanjiro starter-epic six-seven kaneki-ghoul
      the-trapper nezuko buggy bounty-hunter jotaro-kujo hakari saber jonathan-joestar starter-legendary vegeta
      kakashi kr-kuuga bulma denji uchiha-itachi madness-doctor erza yuji-itadori guts polnareff
      the-flash rimuru starter-secret viltrumite mahito blackbeard garp erwin boa-hancock senku
      grimmjaw reigen kamen-rider-kabuto meruem frieza adam-francis katakuri whitebeard doppio shanks
      metal-cooler gohan yuno asta asta-demon nami giyu-tomioka sea-beast arlong aquaman
      noelle-silva weather-report piccolo peashooter hutao weather-solar-deity builderman aatrox weather-eclipse-harvester dante-limbus
      adult-gon rukia ice-admiral weather-frost-sovereign toshiro android-21 yuta-okkotsu luffy-nightmare weather-shadow-monarch cid-shadow
      enderman homura-akemi kr-decade uchiha-sasuke light-admiral gojo-young weather-heavenly-seraph sailor-moon jin-mori wish
      weather-tsukuyomi-eye diavolo kaguya weather-reaper-hollow subaru dio-brando weather-malevolent-king doflamingo hakari-jackpot mahoraga
  `, jumps:'summon arena', art:'unit:starter-epic' });
  release(1, 'The Tower Opens', 'Climb the Normal Tower or test a weather-aligned lineup in a Weather Tower.', {
    'Tower': 'Face three minions and a boss on each floor. Elite floors mark every tenth step, and the climb continues beyond Floor 100.',
    'Potions and Storage': 'Battle victories can drop timed potions for stronger Luck, faster rolls, extra EXP and better VNĐ. Pick up the Speed Battle Potion in shops for faster turns in eligible modes.'
  }, { items:'lucky_potion speed_potion rich_potion exp_potion speed_battle_potion', jumps:'tower inventory', art:'unit:tower-champion-normal' });
  release(2, 'Tower Champions & Milestones', 'Claim new rewards for long-term progress and unlock a roster of Tower Champions.', {
    'New units': 'Clear the Floor 100 milestone in its matching Tower to unlock each Champion. Check a unit’s acquisition card for its Tower and roll requirements.',
    'Achievements': 'Earn and claim milestone rewards for collection progress, battles, rolls and Tower clears.'
  }, { units:'tower-champion-normal tower-champion-raining tower-champion-snowing tower-champion-sunny tower-champion-sugar tower-champion-reaper tower-champion-eclipse tower-champion-malevolent tower-champion-tsukuyomi tower-champion-heavenly tower-champion-shadow', jumps:'achievements tower' });
  release(3, 'Race Against the Clock', 'See how far one lineup can go before the clock catches up.', {
    'Normal Time Trial': 'Clear timed four-card rooms to climb the challenge and earn Time Trial Shards. Opponent lineups change as you advance.',
    'Battle improvements': 'Review your room progress and rewards after each attempt, and take an eligible lineup into the next room.'
  }, { jumps:'trial', art:'unit:tower-champion-heavenly' });
  release(3.5, 'Combat Refinements', 'A round of balance changes makes status effects and battle progression easier to predict.', {
    'Bleed and healing': 'Bleed stops healing while it lasts, including healing from passives. Check the source and duration before relying on a recovery effect.',
    'Arena and Tower': 'Tower rematches retain the opposing lineup after defeat. Turn-based effects have clearer durations.'
  }, { jumps:'arena tower', art:'unit:homura-akemi' });
  release(4.5, 'Marine Ford Raid', 'Bring four cards against the Marine Ford roster and chase exclusive drops.', {
    'New units': 'Ace can leave his crew with a final spark, Marco protects allies, and Mihawk brings devastating counters and piercing attacks.',
    'Raid rewards': 'A Marine Ford Raid Key grants entry. Difficulty scales the fight and the rewards, while Raid Coins buy items in the Raid Shop.'
  }, { units:'raid-secret-mihawk raid-secret-ace raid-secret-marco', items:'marine_fort_raid_key', jumps:'marine_fort' });
  release(5, 'Levels & Elemental Matchups', 'Card growth and elemental matchups give each slot a clearer purpose.', {
    'Card progression': 'Battle experience levels the base card, so owned mutations of the same card share progression. HP and ATK rise as the card levels.',
    'Elements': 'Check Fire, Water, Nature, Electric, Holy and Dark matchups in the Arena element chart before you finalize a lineup.'
  }, { jumps:'elements index', art:'unit:starter-legendary' });
  release(6, 'Evolution & New Weather', 'More characters join the roll pools, and two familiar fighters unlock new forms.', {
    'New units': 'The roster expands with JoJo characters, Emmu and Akaza. Awakened Doflamingo and Prime Garp are Evolution rewards.',
    'Evolution': 'Use Web String or Cannon Ball with its required Lv. 100 card. The evolved copy carries the original mutations.',
    'Weather': 'Weather affects the rolls you see and the mutations you can find. Check the active weather before chasing a gated card.'
  }, { units:'funny-valentine dio-the-world joseph-joestar jolyne-joestar tohth emmu josuke akaza awakened-doflamingo prime-garp', items:'web_string cannon_ball', jumps:'summon marine_fort index' });
  release(7, 'Alucard & Story Quests', 'Challenge a rotating boss and earn characters by completing story objectives.', {
    'Boss Event': 'Assemble a five-card team to challenge Alucard when his event is active. Difficulty affects the rewards and chances at exclusive drops.',
    'New units': 'Alucard has his own event drop. Story paths bring Sung Jin Woo, Frieren and Alexander Anderson to the collection; Madara Lubu joins the card roster.',
    'Quests': 'Pick a story, track its requirements and claim its rewards once complete.'
  }, { units:'boss-event-alucard madara-lubu sung-jin-woo frieren alexander-anderson', jumps:'boss quests' });
  release(8, 'Lucius & Spirit Evolutions', 'Time magic and spirit powers bring new options to the roster.', {
    'New units': 'Julius and Speed Wizard join Lucius Zogratis. Noelle Silva can evolve into Sea Goddess Valkyrie, and Yuno can become Yuno Spirit.',
    'Event shop and Tower': 'Earn the Sea Valkyrie and Spirit Crown from the Lucius Event Shop, or climb the Lucky Tower to unlock Yuno Spirit Demonic.'
  }, { units:'julius speed-wizard boss-event-lucius sea-goddess-valkyrie yuno-spirit tower-champion-lucky', items:'sea_valkyrie spirit_crown', jumps:'boss tower quests' });
  release(9, 'Quest Board & Requiem Towers', 'Choose what to work toward each day, and challenge the next wave of weather Champions.', {
    'Quests and Craft': 'Daily, weekly, story and permanent objectives give you more paths to rewards. Craft a Super Potion from ten regular potions of the same kind.',
    'New units': 'Unlock Xtreme Chan, Star Plantinum Requiem and Shadow The World Requiem through their Tower milestones.'
  }, { units:'tower-champion-wind tower-champion-bizare tower-champion-shadow-200', items:'super_luck_potion super_speed_potion super_rich_potion super_exp_potion', jumps:'quests craft tower' });
  release(9.5, 'Equipment & Tower 200', 'The first Floor 200 challenges and new equipment give long-term collectors another goal.', {
    'New unit': 'Reagan Ridley is the Normal Tower Floor 200 Champion.',
    'Equipment and potions': 'Manage equipment in Storage and watch active potion timers while you play.'
  }, { units:'tower-champion-normal-200', jumps:'tower inventory' });
  release(10.5, 'The Holy Grail Raid', 'The Holy Grail opens a new Raid with its own opponents, entry key and shop.', {
    'New units': 'The Fate roster adds Shirou, Kiritsu, Mash, Gilgamesh, Cu Chalinn, Iskandar, Medea and Merlin. Heavenly Tower Floor 200 unlocks Gilgamesh Chan.',
    'Evolution and Raid': 'Win or purchase Excalibur Sword in the Holy Grail Raid, then use it to evolve a Lv. 100 Saber into Saber Knight.'
  }, { units:'shirou kiritsu mash gilgamesh cu-chalinn saber-knight iskandar medea merlin tower-champion-heavenly-200', items:'holy_grail_raid_key excalibur_sword', jumps:'holy_grail tower' });
  release(11.5, 'Spooky Hunt', 'Bring a six-card lineup, survive fifty waves and shop for Halloween rewards.', {
    'New units': 'The Legion, The Clown, The Oni, Freddy Krueger and Myers join the Halloween pool. Use a Machete to evolve The Trapper into Jason 13th.',
    'Spooky waves': 'Build an event run through a growing lineup of enemies and pick run modifiers as you climb. Check the event screen for availability.'
  }, { units:'the-legion the-clown the-oni jason-13th freddy-krueger myers', items:'machete', jumps:'spooky' });
  release(12.5, 'Gomen & Shibuya', 'Curses and sorcerers take center stage in a Boss Event and a new Raid.', {
    'New units': 'Battle for Jogo and Haruta, evolve Mahito with a Mahito Puppet, pursue Todo and Sukuna Shibuya through their quest paths, and find more Jujutsu characters in the roster.',
    'Gomen and Shibuya': 'Gomen offers Gojo Eye for Gojo Revice and another route to Shibuya Raid Keys. Raid progress earns Shibuya Coins for the Raid Shop.',
    'Training': 'Enter EXP Time Trial with a ticket and turn damage against the Training Dummy into card experience.'
  }, { units:'gojo-revice geto-young toji jogo true-mahito todo dagon choso haruta mechamaru hanami sukuna-shibuya', items:'gojo_eye shibuya_raid_key mahito_puppet exp_time_trial_ticket', jumps:'shibuya boss exp' });
  release(13.5, 'Online PvP & Infinity', 'Challenge friends with blind-pick lineups or chase the next wave in Infinity.', {
    'Online PvP': 'Create a room or join a friend for a 1v1 or 4v4 match. Fighters use Lv. 1 combat stats to put the emphasis on lineup choices.',
    'Infinity': 'Build around the weekly Category, fight continuous waves and earn Star Orbs for card growth.'
  }, { items:'star_orb', jumps:'pvp infinity', art:'unit:kr-kuuga' });
  release(14, 'Food, Lineups & Arena Tools', 'Prepare a team faster and train the cards you actually use.', {
    'Lineups': 'The Arena remembers lineups for each mode. A card or variant that no longer meets the requirements leaves an open slot instead of being silently replaced.',
    'EXP Food': 'Feed EXP Food to a card you own. Bread is a basic battle reward; tougher content offers richer food.',
    'Sandbox': 'Try combinations in practice without risking real progress.'
  }, { items:'bread', jumps:'arena sandbox inventory', art:'unit:senku' });
  release(15, 'The Namek Portal', 'Open a Portal alone or with friends, then build around its boosted Categories.', {
    'Namek Portal': 'Win Portal items in Normal Time Trial. Enter from Storage, inspect its enemy Element and allied bonuses, and fight for higher tiers and Senzu Beans.',
    'New units': 'Goku SSJ3 and Vegeta SSJ2 join the roster, Broly is a Secret Namek Portal reward, and Gohan and Frieza receive new evolutions.'
  }, { units:'goku-ssj3 vegeta-ssj2 broly ultimate-gohan golden-frieza', items:'portal:namek senzu_bean', jumps:'namek trial' });
  release(15.5, 'A New Halloween Challenger', 'Pennywise joins the Spooky Capsule while Arena lineups get easier to manage.', {
    'New unit': 'Open Spooky Capsules for a chance at Pennywise. This card is not in ordinary rolls.',
    'Arena preparation': 'Party and solo Portal lineups are kept separate from your regular 4v4 team. Practice remains separate from progression.'
  }, { units:'pennywise', items:'spooky_capsule', jumps:'spooky namek' });
  release(16.5, 'Material Trials & the Relic Forge', 'Gather recipes and turn battle drops into the first craftable Relics.', {
    'New Relics': 'Eternal Eye extends Burn on compatible wearers. A pair of Unique Potara Earrings lets Vegeta SSJ2 and Goku SSJ3 fuse in battle. God Leaf and Nail fill different roles. Bomb helps a matching Element open with a heavy strike.',
    'Material Time Trial': 'Defeated enemies can drop crafting materials, with several drops tied to their Element. Inspect a recipe to see its materials, stat ranges and Unique effect.'
  }, { relics:'eternal_eye potara_earring god_leaf nail bomb', items:'material_ticket silver_ore god_flowers electric_ore mineral_ore chain calcite unknown_dna lapiz_ore corundum aqua_tear holy_dust dragon_tooth monster_egg icey leaf veggie dark_dust ancient_bone gold_ore dark_fragment', jumps:'material craft', art:'relic:eternal_eye' });
  release(17.5, 'Floor 200 & Ragna', 'Four more Towers get new Champions, and Ragna joins the Boss Event rotation.', {
    'New units': 'Chase Florentino, Kafka, Escanor The Indomitable and Yhwach Omniscience through the Raining, Sugar, Sunny and Reaper Towers.',
    'Boss and story': 'Fight for Ragna during his event. Woltekamui follows his own story quest.'
  }, { units:'tower-champion-raining-200 tower-champion-sugar-200 tower-champion-sunny-200 tower-champion-reaper-200 boss-event-ragna woltekamui', jumps:'tower boss quests' });
  release(18, 'Enten Blade & The Mourner', 'Special attacks, follow-up chains and a new story reward give sword teams more options.', {
    'New units': 'Kagurabachi enters the roster, and The Mourner becomes available through a story quest.',
    'New Relic': 'Enten Blade improves follow-up chance for compatible Swordman cards. Its Unique effect boosts special attacks rather than basic attacks or damage over time.',
    'Card Index': 'Use filters to narrow down the cards you want to inspect.'
  }, { units:'kagurabachi the-mourner', relics:'enten_blade', jumps:'index craft quests' });
  release(19, 'Akatsuki Raid', 'A Ninja-led challenge opens a new Raid and a path to Itachi Awakened.', {
    'Raid and rewards': 'Win an eligible Time Trial with a Ninja in the starting lineup for a chance at an Akatsuki Raid Key. The Raid offers Pain, Mangekyo Eye and its own shop.',
    'New units': 'The Akatsuki roster adds Konan, Kisame Hoshigaki, Deidara, Sasori, Kakuzu, Hidan, Zetsu, Orochimaru and Pain. Use Mangekyo Eye to evolve Uchiha Itachi.'
  }, { units:'itachi-awakened konan kisame-hoshigaki deidara sasori kakuzu hidan zetsu orochimaru pain', items:'akatsuki_raid_key mangekyo_eye', jumps:'akatsuki trial' });
  release(19.5, 'Relic Fusion', 'Turn spare Relics into another shot at a better tier.', {
    'Storage': 'Select a Relic in Storage to review Fusion requirements and odds before committing. Equipped Relics and the selected materials have clear labels.',
    'Collection': 'Relic inspection separates the rolled stat bonus from the Unique effect so you can compare both before equipping. Millennium Puzzle adds a way to boost a card’s EXP gains.'
  }, { relics:'millennium_puzzle', jumps:'inventory craft', art:'relic:potara_earring' });
  release(20.5, 'The Rumbling Rift', 'Face Titans in a rotating five-card challenge and earn Rift Shards.', {
    'Rumbling Rift': 'Clear the Rift for Shards and chances at Eren or O.D.M. The Guarantee Shard can secure one of the Rift’s special rewards.',
    'New Relic': 'O.D.M. gives Human cards a base ATK bonus. The Unique effect helps chained follow-ups continue.',
    'New units': 'Eren joins the roster alongside Dumb Titan, War Hammer Titan, Jaw Titan, Armored Titan and Beast Titan.'
  }, { units:'dumb-titan war-hammer-titan jaw-titan armored-titan eren-rumbling beast-titan', relics:'odm', items:'rift_shard guarantee_shard', jumps:'rumbling' });
  release(21.5, 'Penalty Kick', 'Time your shots, learn the perfect window and earn rewards from the pitch.', {
    'New mode': 'Play a five-shot Penalty Kick run, earn Football Tokens and improve your setup for future attempts.',
    'New units': 'Michael Kaiser, Isagi Yoichi and Don Lorenzo are rewards tied to Penalty Kick milestones.'
  }, { units:'michael-kaiser isagi-yoichi don-lorenzo', items:'football_token', jumps:'penalty achievements' });
  release(22.5, 'Pride & the Slime Portal', 'Take on the Pride Boss Event and open a new Portal with its own foes and rewards.', {
    'Pride Boss Event': 'Fight for Meliodas or Pride Sun. Evolve Escanor into Escanor The One and meet Ban, Diane, King Harlequin and Gowther.',
    'Slime Portal': 'Challenge a Tensura lineup for Slime Dessert and chase Yuuki Kagurazaka in the Secret Slime Portal. Slime Dessert can evolve Rimuru into Rimuru Demon Lord.'
  }, { units:'meliodas ban diane king-harlequin gowther escanor-the-one rimuru-demon-lord veldora diablo benimaru-jura yuuki-kagurazaka', items:'pride_sun portal:slime slime_dessert', jumps:'slime boss' });
  release(23.5, 'Hueco Rift', 'A new Rift brings the Arrancar and Soul Reapers into the spotlight.', {
    'Hueco Rift': 'Fight Dark foes for Rift Shards and a chance at Ulquiorra or Hakka Earing. Hueco and Rumbling have separate reward pools.',
    'New units': 'Rukia can evolve into Rukia Bankai. Yamamoto, Coyote Starrk, Kisuke Urahara and Normal Arrancar join Ulquiorra in the roster.'
  }, { units:'rukia-bankai ulquiorra yamamoto coyote-starrk kisuke-urahara normal-arrancar', items:'hakka_earing', jumps:'hueco index' });
  release(24.5, 'Auto Chess', 'Eight Tacticians compete for the last board standing. Build a team from the Shop and adapt as the match unfolds.', {
    'Planning and combat': 'Buy units, fuse copies, equip Relics and position your team before each fight. Elements and Categories activate team bonuses when enough different units share them.',
    'Carousel and scouting': 'Pick a unit with a Relic in Shared Draft, scout other boards, and adjust your formation before the next round.',
    'Placement rewards': 'Earn account rewards by surviving to a stronger placement. Match Gold is separate from your account wallet.'
  }, { jumps:'autochess', art:'unit:yuta-okkotsu' });
  release(25.5, 'Friend Rooms & Ranked Auto Chess', 'Invite friends into an eight-seat lobby or play a fast solo match against rivals and bots.', {
    'Rooms and Ready': 'Friends share the same countdown, fights and standings. Ready up to start early; after elimination, spectate until the champion is decided.',
    'Ranked progression': 'Climb from Iron to Challenger, earn Elo through placement, and see promotion celebrations and the Elo Leaderboard.',
    'Scouting and bots': 'Inspect live and recorded rival boards. Higher-rank bots build more cohesive teams and position around threats.'
  }, { jumps:'autochess', art:'unit:tower-champion-sunny-200' });
  release(26, 'Team Planner & Match Quality', 'Plan a lineup before you play and spot its units the instant they appear in the Shop.', {
    'Team Planner': 'Save up to eight targets and preview the team’s active traits. Planned units stand out in the Shop.',
    'Rounds and streaks': 'Win three PvP rounds in a row to earn a random Relic, and repeat the reward every three consecutive wins. Loss streaks add capped bonus Gold.',
    'Match controls': 'Review chosen Augments, let Shop Lock expire after one refresh, and use faster bench and fusion controls. Tactical Strategy Elo rewards a cohesive board and smart Relic placement.'
  }, { jumps:'autochess', art:'unit:kakashi' });
  release(27, 'New Rivals & Jackal Guns', 'Seventeen cards join the roster, while older cards shift between rarity tiers.', {
    'New units': 'Junpei shields himself and poisons the attacker who breaks it. Pikachu can chain a stun across a team, while Onana builds ATK until a dodge resets the bonus. Meet the rest of the wave in the showcase.',
    'New Relic': 'Jackal Guns is an Alucard Event drop. Its base ATK applies to Gunner cards; its Unique bonus grows with each living enemy.',
    'Balance': 'God Leaf grants base HP and ATK to Human cards at every rarity. The Unique dodge effect has its own cap.'
  }, { units:'yoshino-junpei n-doul oingo d-arby hogus-eagle vanilla-ice bakugo askeladd pochita kon iggy pikachu ender-dragon onana zenitsu antony-mu tung-tung-sahur', relics:'jackal_guns', jumps:'boss index' });
  release(27.5, 'Augments, Fusion & Smart Rivals', 'Find new ways to win without relying on roll odds from Summon.', {
    'Fusion': 'Eligible same-rarity outcomes are equally likely. Lineage Spark, Bloodline Synthesis and Sovereign Ascension can preserve a trait.',
    'Augments': 'Choose positioning, sustain, economy and team-size Augments. Powerful Gold-generating choices can appear in the weekly rotation.',
    'Tactical rivals': 'Higher-rank bots recognize passive combinations and can adapt their formation and Relics to threatening boards.'
  }, { jumps:'autochess', art:'unit:zenitsu' });
  release(28.5, 'The Hextech Vault', 'Turn Gems earned in Auto Chess into permanent skins and exclusive cards.', {
    'Hextech Chest': 'Open a Chest for 500 Gems. The skin pool has a 99% chance and the exclusive card pool has a 1% chance. Duplicate skins return 150 Gems.',
    'New units': 'Tulen, Veera, Jinx, Ahri, Krixi, Neeko, Sonic, Yasuo and Yone first come from a Chest. Each drop permanently unlocks that character for eligible future rolls.',
    'New Relics': 'Fate Scythe rewards revives and survival of fatal hits. Rabadon Hat boosts clones and summons; its base stat is for Magician cards.',
    'Skins': 'Equip unlocked artwork in the Wardrobe without changing a card’s stats or passive.'
  }, { units:'tulen veera jinx ahri krixi neeko sonic yasuo yone', relics:'fate_scythe rabadon_hat', items:'hextech gems skin:spy skin:female-spy skin:crystal-tech skin:hell skin:aqua-beach skin:senku-female skin:noelle-beach skin:heavy skin:mercy skin:reaper', jumps:'hextech autochess', art:'item:hextech' });
  release(29, 'Auto Chess On the Go', 'Planning takes up less space, and friends can recover a dropped connection more easily.', {
    'Mobile planning': 'Use the four home rows during planning and the full board during battle. Empty deployment slots are filled from the bench before combat if space allows.',
    'Friend rooms': 'Choose LAN / Direct Wi-Fi when sharing a network or Online Relay when playing remotely. Use Resync / Reconnect if the match view falls behind.',
    'Relic previews': 'Universal Unique effects show all eligible team cards even when their base stat has a narrower requirement.'
  }, { jumps:'autochess', art:'unit:krixi' });
  release(30, 'Adventure Time', 'Finn and Jake arrive as a Secret duo, and playing Auto Chess with friends gets a reward boost.', {
    'Finn The Human': 'Finn alternates between shield-piercing, stunning and Bleeding sword attacks. Kills strengthen specific stances; as the last ally standing he gains ATK and debuff immunity.',
    'Jake The Dog': 'Jake intercepts attacks and takes reduced damage, especially when Finn leads the frontline. Finn can call Jake for a follow-up and ready a Critical Chance bonus.',
    'Online match rewards': 'Completed multiplayer Auto Chess matches earn 3× positive Elo gains and 2× Gems. Elo losses follow the regular rules.'
  }, { units:'finn-the-human jake-the-dog', jumps:'autochess index' });
  release(31, 'Cartoon Combat & a New Game Hub', 'Two Secret cards join the Cartoon roster as Summon, the Hub and the Arena get a new look.', {
    'Mordecai & Rigby': 'Swap between the duo’s attack and recovery styles. Below half HP, Serious Mode locks in Mordecai and grants extra ATK and HP.',
    'Gumball': 'Mimic an eligible passive from a card you own, reroll it after a kill, and use up to nine lives to recover from lethal damage.',
    'Game screens': 'The Summon circle, navigation, fighter frames and older panels have new styling. Summon remains single-roll.'
  }, { units:'mordecai-rigby gumball', jumps:'summon arena' });
  release(31.5, 'Relic Compatibility & Alien Watch', 'Relic inspection explains exactly which cards can use each bonus.', {
    'New Relic': 'Alien Watch amplifies stack and point gains for compatible cards of its rolled Element. Its Unique effect gives a temporary HP increase when a compatible card switches mode, form or stance.',
    'Base and Unique bonuses': 'Nail’s base stat requires Swordman, but its Unique Crit works on all cards. Eternal Eye’s Unique extension requires a Burn-inflicting passive.',
    'Craft and Equip': 'See ingredients, compatible cards and the separate Unique effect while browsing Relics or choosing one to equip.'
  }, { relics:'alien_watch', jumps:'craft inventory' });
  release(32, 'Arena Readability & Mutations', 'See who did what at a glance and inspect the exact effects on each fighter.', {
    'Battle Log': 'The feed fills the available space and separates Player and Enemy actions. Passive triggers, damage types, heals, shields and dodges have their own colors.',
    'Status effects': 'Inspect a status separately from the card’s passive. Bleed shows the damage it deals each turn and blocks all healing. Poison uses green, and Burn stays orange.',
    'Mutation frames': 'Single mutations use one signature color for card names and frames. Double mutations blend both colors.',
    'Achievements': 'Completed milestones stay at the top, and ready-to-claim rewards are listed first.'
  }, { jumps:'arena achievements', art:'unit:gumball' });
  release(32.5, 'The Update Archive', 'Browse the game’s history, inspect its rewards and jump straight to the modes you want to play.', {
    'Version timeline': 'Select a release to read its notes, from the first Summon through the latest Arena and Auto Chess updates.',
    'Interactive showcases': 'Inspect a unit, Relic, item or skin to see what it does and how you obtain it. The details reflect the current game.',
    'Jump In': 'Open a mode, shop or feature directly from the release where it appeared.'
  }, { jumps:'arena autochess hextech', art:'item:hextech' });

  release(33, 'Arena Polish & Encounter Planner', 'See combat thresholds clearly, plan affordable counter lineups and spend less time restarting your favorite challenges.', {
    'Combat HUD': 'HP includes its remaining percentage. Shields display depletion from their peak during the current shield cycle. Black Flame, Fear, Hindred and Hypnosis have their own status colors.',
    'Live inspections': 'Keep reading an effect while its stacks and turns update during combat. Color-coded logs distinguish Black Flame from Burn.',
    'Recommend Team': 'Fixed-roster Boss Events and Raids offer Luck, Balanced and Overpower plans using the full Card Index, mutations and compatible Relics. Compare tested clear rates, inspect rewards and apply matching cards and Relics you already own. Encounters with randomized opponents or modifiers are excluded.',
    'Automation': 'Speed Battle Potion now accelerates Portal turns to one second. Auto Go Up follows higher tiers while protecting the final remaining life. Normal Time Trial can automatically skip to its unlocked room after a failed automated run.'
  }, { jumps:'arena marine_fort boss trial namek', art:'relic:alien_watch' });

  const jumps = {
    summon:['Summon','Return to the roll altar','unit:starter-common'],
    arena:['Clash Arena','Choose a lineup and battle','unit:jotaro-kujo'],
    tower:['Tower','Challenge the next floor','unit:tower-champion-normal'],
    trial:['Normal Time Trial','Race through timed rooms','unit:tower-champion-heavenly'],
    exp:['EXP Time Trial','Train against the Dummy','unit:speed-wizard'],
    material:['Material Time Trial','Hunt crafting supplies','item:mineral_ore'],
    marine_fort:['Marine Ford Raid','Challenge the Marine Ford roster','unit:raid-secret-mihawk'],
    holy_grail:['Holy Grail Raid','Challenge the Fate roster','unit:gilgamesh'],
    shibuya:['Shibuya Raid','Challenge the curse roster','unit:sukuna-shibuya'],
    akatsuki:['Akatsuki Raid','Challenge the Ninja roster','unit:itachi-awakened'],
    namek:['Namek Portal','Inspect a Namek Portal','item:portal:namek'],
    slime:['Slime Portal','Inspect a Slime Portal','item:portal:slime'],
    rumbling:['Rumbling Rift','View Titans and their rewards','unit:eren-rumbling'],
    hueco:['Hueco Rift','View Arrancar and their rewards','unit:ulquiorra'],
    boss:['Boss Event','See the active challenge','unit:boss-event-alucard'],
    spooky:['Spooky Hunt','Enter the Halloween setup','unit:the-clown'],
    infinity:['Infinity','Build for the weekly Category','item:star_orb'],
    pvp:['Online PvP','Create or join a friend’s room','unit:kr-kuuga'],
    sandbox:['Sandbox','Test a lineup in practice','unit:senku'],
    penalty:['Penalty Kick','Take five shots','unit:isagi-yoichi'],
    autochess:['Auto Chess','Open the Tactician lobby','unit:yuta-okkotsu'],
    hextech:['Hextech Vault','Browse Chests and skins','item:hextech'],
    achievements:['Achievements','See milestones and rewards','unit:tower-champion-sunny'],
    quests:['Quests','Track story and timed goals','unit:frieren'],
    inventory:['Inventory','Browse your Storage','item:gems'],
    craft:['Craft','Browse recipes and Relics','relic:eternal_eye'],
    index:['Card Index','Browse the full roster','unit:starter-legendary'],
    elements:['Element Chart','Compare elemental matchups','unit:weather-report']
  };

  const specialItems = {
    hextech:{name:'Hextech Chest',image:'assets/items/hextech.png',tier:'secret',icon:'◆',description:'Open for a 99% chance at a skin or a 1% chance at a card from the exclusive pool. Duplicate skins return 150 Gems.',source:'Buy for 500 Gems in the Hextech Vault.'},
    gems:{description:'Account currency used to open Hextech Chests. Separate from the Gold spent during Auto Chess matches.',source:'Earn Gems from Auto Chess placements.'},
    football_token:{name:'Football Token',tier:'rare',icon:'⚽',description:'Spend tokens on permanent Penalty Kick upgrades.',source:'Earn tokens by playing Penalty Kick.'},
    star_orb:{source:'Earn from Infinity waves, personal weekly rewards and Auto Chess placements.'},
    rift_shard:{source:'Earn from victories in the active Rift.'}
  };
  const doc=host.document;
  const number=value=>Number(value).toLocaleString('en-US');
  const make=(tag,cls,value)=>{
    const node=doc.createElement(tag);
    if(cls)node.className=cls;
    if(value!=null)node.textContent=value;
    return node;
  };
  const chip=value=>make('span','ul-chip',value);
  const find=(kind,id)=>{
    if(kind==='unit')return (host.ALL_CARDS||[]).find(card=>card.id===id);
    if(kind==='relic')return host.RelicSystem?.DEFINITIONS.find(row=>row.kind===id);
    if(kind!=='item')return null;
    if(id.startsWith('skin:')){
      const skin=host.CardSkinSystem?.get(id.slice(5));
      const card=skin&&find('unit',skin.cardId);
      return card&&{...skin,name:skin.name+' · '+card.name,tier:card.rarity,icon:'✦',description:'Alternate artwork for '+card.name+'. Equip it from the Wardrobe without changing stats or passives.',source:'Hextech Chest skin pool (99% chance for one of ten skins).',preview:true};
    }
    if(id.startsWith('portal:')){
      const type=id.slice(7), entry=host.PortalRules?.TYPES[type];
      if(!entry)return null;
      const template=host.PortalRules.item({id:'portal_'+type+'_preview',type,tier:1,attempts:5,element:'Nature',category:entry.categories[0],bonus:50});
      return {...entry,tier:'epic',icon:'◈',description:'Open from Storage for a solo or eligible party challenge. A Portal’s tier, enemy Element and allied Category bonus are set when it drops.',source:template.metadata.source};
    }
    const entry=host.InventorySystem?.getItem(id)||host.MaterialSystem?.get(id);
    const extra=specialItems[id];
    if(!entry&&!extra)return null;
    const result={...entry,...extra};
    return result.type==='relic'||result.type==='relic_recipe'?null:result;
  };

  function art(row,cls,style=''){
    const frame=make('span','ul-art '+cls),rarity=row?.rarity||row?.tier;
    if(rarity)frame.dataset.rarity=String(rarity).toLowerCase();
    if(row?.preview)frame.dataset.skinPreview='';
    if(style)frame.dataset.art=style;
    frame.setAttribute('aria-hidden','true');
    frame.append(make('span','ul-art-fallback',row?.icon||'✦'));
    if(row?.image){
      const image=make('img');image.alt='';image.loading='lazy';image.decoding='async';
      image.addEventListener('error',()=>image.remove(),{once:true});image.src=row.image;
      frame.append(image);
    }
    return frame;
  }
  function artRef(ref,cls){
    const at=ref.indexOf(':'),kind=ref.slice(0,at),id=ref.slice(at+1);
    return art(find(kind,id),cls,kind);
  }
  function versionName(value){return 'Update '+(value===0?'0':value.toFixed(1));}
  const latest=releases.at(-1);
  const splitWeather=value=>/^(?:bizare|bizarre)$/i.test(value)?'Bizarre':value==='Mangekyo'?'Tsukuyomi':value;
  function acquisition(card){
    const weather=[...new Set((card.requiredWeathers?.length?card.requiredWeathers:card.requiredWeather?[card.requiredWeather]:[]).map(splitWeather))];
    const odds=card.chance>0?'1 in '+number(card.chance):'';
    const roll=card.towerType==='normal'?'Clear-weather roll':weather.length?'Weather Roll: '+weather.join(' / '):'Standard Rollable';
    if(card.hextechExclusive)return 'Hextech Chest Exclusive (1% chance for one of nine cards). Once unlocked: '+roll+' ('+odds+').';
    if(card.portalOnly){
      const type=Object.values(host.PortalRules.TYPES).find(entry=>entry.card===card.id);
      return 'Secret '+(type?.name||'Portal')+' victory reward.';
    }
    if(card.riftOnly)return host.RiftSystem.cardSource(card.id)+' victory drop.';
    if(card.bossEventOnly){
      const event=Object.values(host.BossEventSystem.TYPES).find(entry=>entry.dropCardId===card.id||entry.cardId===card.id);
      return (event?.name||'Boss Event')+' victory drop.';
    }
    if(card.raidOnly)return (card.id==='pain'?'Akatsuki Raid':card.id==='jogo'||card.id==='haruta'?'Shibuya Raid':'Marine Ford Raid')+' victory drop.';
    if(card.evolutionOnly){
      const recipe=host.EvolutionSystem.RECIPES.find(row=>row.id===card.id);
      if(!recipe)return 'Evolution reward.';
      const material=find('item',recipe.itemId);
      return 'Evolution: '+(find('unit',recipe.baseId)?.name||'Base card')+' at Lv. '+recipe.level+' + '+number(recipe.itemCount||1)+' × '+(material?.name||'Evolution material')+'.';
    }
    if(card.capsuleOnly){
      const chance=host.SpookySystem?.capsulePool().find(row=>row.cardId===card.id)?.chance;
      return 'Spooky Capsule exclusive'+(chance?' ('+number(chance*100)+'% per Capsule)':'')+'. Open Capsules from Storage.';
    }
    if(card.spookyExclusive){
      const unlock='Complete the three Spooky Hunt achievements to enter the roll pool ('+odds+').';
      if(card.id==='myers')return 'Spooky Hunt Wave 50 victory drop (1%; doubled on Halloween). '+unlock;
      const capsule=host.SpookySystem?.CAPSULE_POOL.some(([id])=>id===card.id);
      return unlock+(capsule?' Also available from Spooky Capsules.':'');
    }
    if(card.questOnly)return 'Story Quest reward. Open Quests → Story to see the requirements.';
    if(card.unlockRequirement?.startsWith('penalty_'))return 'Complete the Penalty Kick milestone: '+host.AchievementSystem.requirementLabel(card.unlockRequirement)+'. Then: '+roll+' ('+odds+').';
    if(card.towerType&&card.unlockRequirement){
      const floor=card.unlockRequirement.match(/floor_(\d+)/)?.[1];
      const tower=card.towerType==='normal'?'Normal':splitWeather(card.towerType[0].toUpperCase()+card.towerType.slice(1));
      return 'Clear '+tower+' Tower Floor '+(floor||100)+' and claim the milestone. Then: '+roll+' ('+odds+').';
    }
    return odds?roll+' ('+odds+').':'Obtain this card through its in-game challenge.';
  }

  function detailSection(title,text){
    const node=make('section','ul-detail-section');
    node.append(make('h4','ul-label',title));
    if(text)node.append(make('p','',text));
    return node;
  }
  function unitDetail(card){
    const content=make('div','ul-detail-content');
    const tags=make('div','ul-tags');
    tags.append(chip(card.rarity),chip(card.element));
    const stats=make('dl','ul-unit-stats');
    for(const [label,value] of [['Base HP',card.stats?.hp],['Base ATK',card.stats?.atk]]){
      const cell=make('div');
      cell.append(make('dt','ul-label',label),make('dd','',number(value)));
      stats.append(cell);
    }
    content.append(tags,stats);
    if(card.category?.length){
      const categories=detailSection('Categories'),list=make('div','ul-tags');
      list.append(...card.category.map(chip));categories.append(list);content.append(categories);
    }
    const skill=detailSection('Passive Skill'),passives=card.passives||card.passive;
    for(const part of Array.isArray(passives)?passives:passives?[passives]:[]){
      const description=Array.isArray(part.description)?part.description.map(x=>[x.name,x.description].filter(Boolean).join(': ')).join('\n\n'):part.description;
      if(part.name)skill.append(make('strong','ul-skill-name',part.name));
      if(description)skill.append(make('p','ul-passive-copy',String(description).replace(/<br\s*\/?\s*>/gi,'\n').replace(/\\n/g,'\n')));
    }
    if(!passives)skill.append(make('p','','This card has no listed passive.'));
    content.append(skill,detailSection('Acquisition',acquisition(card)));
    return content;
  }
  function relicDetail(relic){
    const content=make('div','ul-detail-content'),template=host.RelicSystem.template(relic.kind);
    const shared=make('div','ul-relic-data');
    // The same recipe preview used by Craft, including component conditions and Unique wording.
    shared.innerHTML=host.RelicInspection.markup(template,{header:false});
    content.append(shared);
    const recipe=detailSection('Crafting Recipe'),ingredients=host.RelicSystem.RECIPES.find(row=>row.kind===relic.kind)?.ingredients;
    if(ingredients?.length){
      recipe.append(make('p','','Craft rolls: 70% Common, 25% Rare, 5% Legendary. Legendary rolls have a 10% chance to be Unique.'));
      const list=make('ul','ul-ingredients');
      for(const {id,quantity} of ingredients){
        const item=find('item',id);
        const li=make('li');
        li.append(art(item,'ul-material-icon','item'),make('span','',item?.name||id),make('b','',number(quantity)+'×'));
        list.append(li);
      }
      recipe.append(list);
    }else {
      const source=relic.kind==='jackal_guns'?'Alucard Boss Event victory drop. The chance rises from 1% at Difficulty 1 to 20% at Difficulty 1000.':'This Relic has no crafting recipe.';
      recipe.append(make('p','',source));
    }
    if(relic.kind==='odm')recipe.append(make('p','','Also drops from victories in the Rumbling Rift.'));
    content.append(recipe);
    return content;
  }
  function itemDetail(item,id){
    const content=make('div','ul-detail-content');
    content.append(detailSection('Use',item.description||'Inspect this item in Storage to see its current effects.'));
    const source=detailSection('Acquisition');
    const sources=item.source?[item.source]:host.MaterialSystem?.get(id)?[host.MaterialSystem.get(id).description]:
      (host.StorageSystem?.sources(id)||[]).filter(line=>!/^No acquisition|^EXP gained|^Crafting → Relics/.test(line));
    if(sources.length){
      for(const line of [...new Set(sources)].slice(0,id==='spooky_capsule'?2:8))source.append(make('p','',line));
    }else source.append(make('p','','See the item’s related mode or shop for availability.'));
    content.append(source);
    return content;
  }

  function mount({canOpen,navigate}){
    const dialog=doc.getElementById('updateLogsModal'),entry=doc.getElementById('updateLogsOpenButton');
    if(!dialog||!entry)return;
    const q=selector=>dialog.querySelector(selector);
    const close=q('[data-ul-close]'),label=q('[data-ul-version-title]'),timeline=q('[data-ul-timeline]'),notes=q('[data-ul-notes]'),showcase=q('[data-ul-showcase]'),status=q('[data-ul-status]');
    const inspector=q('[data-ul-inspector]'),inspectorClose=q('[data-ul-inspector-close]'),inspectorBody=q('[data-ul-inspector-body]'),inspectorTitle=q('[data-ul-inspector-title]');
    const buttons=new Map();
    let selected=null,active=null,pinned=false,hide=0,reposition=0,previous=null,ignoreFocus=false;
    const mobile=host.matchMedia('(max-width: 768px)');
    const badge=entry.querySelector('[data-ul-new]');
    const seenKey='anime_card_rng_update_logs_seen';
    function syncBadge(visit=false){
      try{
        if(visit)host.localStorage.setItem(seenKey,String(latest.version));
        badge.hidden=host.localStorage.getItem(seenKey)===String(latest.version);
      }catch(_){badge.hidden=visit;}
    }
    function select(record){
      hideInspection();
      selected=record;
      for(const [version,button] of buttons){
        if(version===record.version)button.setAttribute('aria-current','true');
        else button.removeAttribute('aria-current');
      }
      label.textContent=versionName(record.version)+' — '+record.title;
      status.textContent='';
      const header=make('header','ul-chapter-head');
      header.append(make('span','ul-label','Release Notes'),make('h3','',record.title),make('p','',record.intro));
      notes.replaceChildren(header);
      for(const [title,body] of Object.entries(record.notes)){
        const section=make('section','ul-note');
        section.append(make('h4','',title),make('p','',body));
        notes.append(section);
      }
      showcase.replaceChildren();
      function group(title,count,children){
        const section=make('section','ul-show-group'),heading=make('h4','ul-show-heading');
        heading.append(make('span','ul-group-mark','✦'),doc.createTextNode(title),...(count?[make('small','',String(count))]:[]));
        section.append(heading,children);
        showcase.append(section);
      }
      for(const [kind,rows,title] of [['unit',record.units,'New Units'],['relic',record.relics,'New Relics'],['item',record.items,'New Items']]){
        const grid=make('div','ul-show-grid');
        for(const id of rows){
          const row=find(kind,id);
          if(!row)continue;
          const button=make('button','ul-show-tile');
          button.type='button';
          button.dataset.ulInspect=kind+':'+id;
          button.setAttribute('aria-label','Inspect '+row.name);
          button.setAttribute('aria-expanded','false');
          button.setAttribute('aria-controls',inspector.id);
          button.append(art(row,'ul-show-art',kind),make('span','ul-tile-name',row.name));
          grid.append(button);
        }
        if(grid.childElementCount)group(title,grid.childElementCount,grid);
      }
      if(record.jumps.length){
        const list=make('div','ul-jumps');
        for(const key of record.jumps){
          const [name,hint,image]=jumps[key],button=make('button','ul-jump');
          button.type='button';button.dataset.ulJump=key;
          const copy=make('span','ul-jump-copy');
          copy.append(make('strong','',name),make('small','',hint));
          const arrow=make('span','ul-jump-arrow','›');arrow.setAttribute('aria-hidden','true');
          button.append(artRef(image,'ul-jump-art'),copy,arrow);list.append(button);
        }
        group('Jump In',0,list);
      }
      q('[data-ul-show-region]').hidden=!showcase.childElementCount;
      q('[data-ul-notes-region]').scrollTop=0;q('[data-ul-show-region]').scrollTop=0;
    }

    function buildTimeline(){
      for(const record of [...releases].reverse()){
        const button=make('button','ul-release');
        button.type='button';button.dataset.ulVersion=record.version;
        const copy=make('span','ul-release-copy');
        copy.append(make('strong','',versionName(record.version)),make('span','',record.title));
        if(record===latest)copy.append(make('small','ul-release-new','NEW'));
        const ref=record.art||(record.units.length?'unit:'+record.units[0]:record.relics.length?'relic:'+record.relics[0]:'item:'+record.items[0]);
        button.append(artRef(ref,'ul-release-art'),copy);
        const item=make('li');item.append(button);timeline.append(item);buttons.set(record.version,button);
      }
    }

    function hideInspection(returnFocus=false){
      host.clearTimeout(hide);
      if(!active)return;
      const origin=active;active=null;pinned=false;
      origin.setAttribute('aria-expanded','false');origin.removeAttribute('aria-describedby');
      inspector.hidden=true;inspector.removeAttribute('data-pinned');
      if(returnFocus&&origin.isConnected){
        ignoreFocus=true;origin.focus({preventScroll:true});ignoreFocus=false;
      }
    }
    function place(){
      if(!active)return;
      if(mobile.matches){
        inspector.style.removeProperty('left');inspector.style.removeProperty('top');return;
      }
      const box=active.getBoundingClientRect(),width=inspector.offsetWidth,height=inspector.offsetHeight,gap=10;
      const ww=doc.documentElement.clientWidth,wh=doc.documentElement.clientHeight;
      const horizontal=box.left-width-gap>=gap?box.left-width-gap:box.right+width+gap<=ww-gap?box.right+gap:box.left;
      inspector.style.left=Math.max(gap,Math.min(ww-width-gap,horizontal))+'px';
      inspector.style.top=Math.max(gap,Math.min(wh-height-gap,box.top-10))+'px';
    }
    function queuePlacement(){
      if(!active||reposition)return;
      reposition=host.requestAnimationFrame(()=>{reposition=0;place();});
    }
    function inspect(button,pin=false){
      if(!pin&&(pinned||ignoreFocus))return;
      host.clearTimeout(hide);
      if(active!==button){
        hideInspection();
        const key=button.dataset.ulInspect,at=key.indexOf(':'),kind=key.slice(0,at),id=key.slice(at+1),data=find(kind,id);
        if(!data)return;
        active=button;
        inspectorTitle.textContent=data.name;
        inspector.dataset.kind=kind;
        inspector.dataset.rarity=String(data.rarity||data.tier||'').toLowerCase();
        q('[data-ul-inspector-kicker]').textContent=kind==='unit'?'Unit Inspection':kind==='relic'?'Relic Inspection':'Item Inspection';
        q('[data-ul-inspector-art]').replaceChildren(art(data,'ul-detail-art',kind));
        inspectorBody.replaceChildren(kind==='unit'?unitDetail(data):kind==='relic'?relicDetail(data):itemDetail(data,id));
        inspector.hidden=false;
        inspector.scrollTop=0;
        button.setAttribute('aria-expanded','true');
        button.setAttribute('aria-describedby',inspectorTitle.id);
      }
      pinned=pin;
      inspector.toggleAttribute('data-pinned',pin);
      place();
      if(pin)inspectorClose.focus({preventScroll:true});
    }
    function softHide(){
      if(!active||pinned)return;
      host.clearTimeout(hide);
      hide=host.setTimeout(()=>{if(!pinned&&!inspector.contains(doc.activeElement))hideInspection();},200);
    }
    function open(record=latest){
      if(dialog.open||!canOpen())return;
      if(!buttons.size)buildTimeline();
      previous=doc.activeElement;
      select(record);
      dialog.showModal();
      q('[data-ul-timeline-region]').scrollTop=0;
      q('[data-ul-body]').scrollTop=0;
      if(record===latest)syncBadge(true);
      close.focus({preventScroll:true});
    }
    function shut(restore=true){
      hideInspection();
      dialog.close();
      if(restore&&previous?.isConnected)previous.focus({preventScroll:true});
    }

    syncBadge();
    entry.addEventListener('click',()=>open());
    close.addEventListener('click',()=>shut());
    inspectorClose.addEventListener('click',()=>hideInspection(true));
    dialog.addEventListener('cancel',event=>{
      event.preventDefault();
      if(active)hideInspection(true);else shut();
    });
    dialog.addEventListener('click',event=>{
      const target=event.target,button=target.closest?.('button');
      if(target===dialog){if(active)hideInspection();else shut();return;}
      if(button?.dataset.ulInspect){
        if(pinned&&button===active){hideInspection(true);return;}
        inspect(button,true);return;
      }
      if(button?.dataset.ulVersion){
        const record=releases.find(row=>row.version===Number(button.dataset.ulVersion));
        if(record&&selected!==record)select(record);
        return;
      }
      if(button?.dataset.ulJump){
        if(!canOpen()){status.textContent='Finish your current activity before opening this destination.';return;}
        shut(false);
        if(navigate(button.dataset.ulJump)===false){
          open(selected);
          status.textContent='This destination is unavailable right now.';
        }
        return;
      }
      if(active&&!inspector.contains(target))hideInspection();
    });
    timeline.addEventListener('keydown',event=>{
      const button=event.target.closest?.('[data-ul-version]');
      if(!button||!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
      const ordered=[...buttons.values()],at=ordered.indexOf(button);
      const index=event.key==='Home'?0:event.key==='End'?ordered.length-1:Math.max(0,Math.min(ordered.length-1,at+(event.key==='ArrowUp'?-1:1)));
      event.preventDefault();ordered[index]?.focus();
    });
    showcase.addEventListener('pointerover',event=>{
      const button=event.target.closest?.('[data-ul-inspect]');
      if(event.pointerType==='mouse'&&button&&!button.contains(event.relatedTarget))inspect(button);
    });
    showcase.addEventListener('pointerout',event=>{
      const button=event.target.closest?.('[data-ul-inspect]');
      if(button&&button===active&&!button.contains(event.relatedTarget)&&!inspector.contains(event.relatedTarget))softHide();
    });
    showcase.addEventListener('focusin',event=>{
      const button=event.target.closest?.('[data-ul-inspect]');
      if(button&&event.target.matches(':focus-visible'))inspect(button);
    });
    showcase.addEventListener('focusout',event=>{if(!inspector.contains(event.relatedTarget))softHide();});
    inspector.addEventListener('pointerenter',()=>host.clearTimeout(hide));
    inspector.addEventListener('pointerleave',softHide);
    dialog.addEventListener('scroll',event=>{if(!inspector.contains(event.target))queuePlacement();},true);
    host.addEventListener('resize',queuePlacement);
  }

  host.UpdateLogs=Object.freeze({mount,acquisition});
})(window);
