ANIME CARD RNG — AUTO CHESS: TACTICIAN'S CONVERGENCE
Ngày: 15/11/2026 • Build: 20261115-autochess-1

TÍNH NĂNG MỚI
- Arena → Auto Chess: lobby riêng gồm 1 người chơi và 7 AI. Mỗi tactician bắt đầu
  100 HP, Level 1, 10 Gold. Đây là mode chơi với bot, không phải Online PvP.
- Battlefield 8×7: mỗi bên có 4×7 ô xuất phát; di chuyển tự do trên toàn sân khi combat.
  Bench 9 ô; deployment cap = Level, tối đa 9. Có scout board/bench/synergy của cả 7 bot.
- Shop 5 lá, Gold/interest/streak, Buy XP, Lock Shop, anvil 3 ô, auto-fuse bench,
  stash 10 Relic, carousel 9 lựa chọn và placement từ hạng 8 đến hạng 1.
- Dùng đầy đủ roster 217 thẻ trong pool Auto Chess, kể cả weather/event/evolution cards.
  Chúng chỉ là unit của match: không mở khóa hoặc lấy mất bản thẻ trong Card Index.
- 6 Elements + toàn bộ 37 Categories hiện có đều có synergy riêng, không bỏ trống trait.
  Threshold 2/4/6/8 nhân vật KHÁC NHAU → Bronze/Silver/Gold/Prismatic.
  Nhiều bản cùng một nhân vật chỉ đóng góp một lần cho mỗi trait.

CÂN BẰNG & SỬA LỖI
- Tách hoàn toàn Gold, XP tactician, unit, Relic và fusion khỏi inventory lâu dài.
- Auto-fuse không lấy unit trên board hoặc unit đã Protect; manual anvil chỉ nhận bench.
  Relic trên unit bị fuse/sell luôn trả về stash. Đầy stash thì giữ ở pending loot,
  đầy bench khi draft thì giữ ở draft reserve; tự chuyển vào chỗ trống sau đó.
- 2 Relic cùng tier, không cần cùng loại, luôn upgrade thành công trong Auto Chess.
  Common→Rare; Rare→Legendary; Legendary thường→Unique Legendary.
  Loại kết quả chọn 50/50 giữa hai nguyên liệu; roll stats mới bằng relics.js.
  Unique capstone có thêm +20% HP/ATK trong trận, ngoài stat roll/passive hiện có.
- Luật fusion Relic 10/10/5 và 50% success trong Storage chính GIỮ NGUYÊN.
- Full native passive engine được tạo isolated cho từng fight: entry, own turn,
  status, DoT, counter, copy, summon, fatal prevention, revive và kill vẫn chạy.
- Auto Chess có adapter chọn actor/nearest target trên grid; team AoE giữ đủ team,
  nearby/nearest/behind của Itachi, Crow, Pain và Escanor chuyển sang tọa độ grid.
  Lowest-HP healing dùng các unit thật của cùng team. Diablo isolation vẫn chặn assist.
- Stun/Freeze/Burn và duration theo own turn tiếp tục dùng lượt riêng của unit.
  Timer dùng global battle turn quy đổi một nhịp khoảng 1.35 giây, tránh việc
  18 unit làm cooldown/clone expiry hết sạch trong vài frame.
- Native summon caps vẫn áp dụng; thêm giới hạn an toàn 48 unit đang sống trên cả sân.
  Không cho generated units tự nhân đệ quy. Native summon/revive giữ Relic battle copy.
- Potara Unique hoạt động cho cả hai đội bằng Relic của match; không đọc binding chính.
- Không sửa cards.js, Category/Element registry, weather/mutation, Firebase/TURN,
  stats lâu dài, level cap hoặc scaling các Arena modes đã có.

THÔNG SỐ & CÔNG THỨC CHI TIẾT
1) Lịch vòng
- Stage 1: 1-1 Carousel → 1-2 Creep → 1-3 Creep → 1-4 PvP.
- Stage 2+: vòng 1/2/3/5 PvP; vòng 4 Carousel; vòng 6 Neutral Boss.
- Planning 35 giây; Carousel 22 giây; result 6 giây. Ready bỏ thời gian chờ.
- Carousel đầu mở cùng lúc. Từ Stage 2, mỗi 5 giây mở một cặp theo HP thấp→cao.
  Chọn một unit nhận cả card và Relic đang gắn. Hết giờ tự draft lựa chọn phù hợp.
- PvP ghép tất cả tactician còn sống, ưu tiên tránh đối thủ gần nhất và hạn chế lặp
  trong 3 vòng. Số người lẻ có một Echo/ghost fight; chỉ người đấu Echo nhận kết quả,
  không làm đối thủ gốc bị mất HP/nhận income thêm lần hai.
- Thua mất: 2 + 2×Stage + max(0,Stage−5)×3 + số enemy sống sót (cap 15).
  Draw tính thua cho cả hai; elimination xếp đồng thời, tie-break deterministic.
- Creep/Boss là neutral encounter riêng với Gold/Relic loot; không dùng Boss Event chính.

2) Economy / Shop
- Common 1g; Rare 2g; Epic 3g; Legendary 4g; Mythic 5g; Secret 7g.
- Refresh 2g. Buy XP 4g → +4 XP. Mỗi combat round thêm 2 XP miễn phí.
- XP để lên Level kế: 2 / 6 / 10 / 18 / 28 / 40 / 56 / 72; Level 9 là tối đa.
- Base income: 5g Stage 1, 8g Stage 2+. Interest = min(5,floor(Gold/10)).
- Streak: 2 vòng cùng kết quả +1g; 3–4 +2g; 5+ +3g. PvP win thêm 1g.
- Creep win có một Relic, loot Gold = 3 + min(5,Stage) + Stage, ngoài income.
- Villian synergy có thể thêm 1–3g khi thắng PvP.
- Odds theo Level: [Common, Rare, Epic, Legendary, Mythic, Secret] (%):
  Lv1 [100,0,0,0,0,0]        Lv2 [80,20,0,0,0,0]
  Lv3 [65,28,7,0,0,0]         Lv4 [48,32,18,2,0,0]
  Lv5 [32,33,25,9,1,0]        Lv6 [20,30,30,16,4,0]
  Lv7 [12,22,30,25,10,1]      Lv8 [7,15,25,30,20,3]
  Lv9 [3,10,20,30,28,9]
- Shop độc lập, không có finite shared pool. Lock giữ nguyên stock qua vòng.
- Sell hoàn giá tier hiện tại. Fuse 3 lá cùng rarity lên đúng một tier, dừng ở Secret.
- Có 1/2/3 Supporter trong nguyên liệu: xác suất kết quả Supporter 75%/80%/85%,
  nếu tier đích có cả Supporter và non-Supporter. Sau đó có 50% thiên về dominant
  Category/Element trong nhóm hợp lệ. Nếu không có ứng viên trait phù hợp, dùng pool
  hợp lệ còn lại; không phá cam kết Supporter để chạy secondary weighting.

3) Stats / Relic / Synergies
- Thẻ Auto Chess dùng bản clone ở Level 1, không mutation hoặc potion chính.
  Để Common và Secret cùng chơi được trên board, stats chuẩn hóa RIÊNG TRONG MODE:
  w = clamp(HP gốc / (HP gốc + 5×ATK gốc), 0.15, 0.85).
  HP = round(tierHP × (0.7 + 0.6w)); ATK = round(tierATK × (1.3 − 0.6w)).
  tierHP = [900,1250,1650,2200,2800,3600]; tierATK = [100,140,185,245,315,410].
  Giữ thiên hướng tank/carry và passive của card; không ghi các stats này vào save chính.
- Relic stat bonus vẫn yêu cầu Element/Category tương ứng; Unique dùng native trait.
  Một unit tối đa một Relic. Black Flame vẫn uncleansable như các battle modes khác.
- Buff synergy cộng vào stat ledger: cap team ATK +80%, HP +120%, base speed +90%,
  omnivamp 35%, reflect 25%, DR 40%, true damage 40%, dodge 30%, crit 40%,
  regen 4% max HP/giây, DoT amplification 80%; Berserk có speed cap tổng +150%.
- Fire Burn stacking cap 4 effect/nguồn/mục tiêu; refresh duration khi chạm cap.
  Holy true damage bỏ elemental multiplier và phần DR tương ứng; Shield vẫn chặn.
- Synergies theo snapshot đội hình đầu combat; unit chết không làm trait biến mất
  giữa fight. Generated units nhận bonus hợp lệ nhưng không tăng trait count.
- Tên franchise dùng registry sẵn có: Ninja (Naruto), Pirate (One Piece), Jujutsu (JJK),
  DemonSlayer (Demon Slayer), DragonWarrior (Dragon Ball). Không thêm alias giả vào
  registry toàn game hoặc làm đổi Infinity weekly rotation.

4) Bảy AI
- Mika Vale: Interest Keeper / Human; Rook Ashfall: Aggressive Reroller / Brutal.
- Sera Moon: Synergy Scholar / Magician; Kai Storm: Tempo Captain / Electric.
- Nox Hollow: Dark Specialist / Bleach; Luna Wren: Support Curator / Supporter.
- Atlas Thorn: Frontline Builder / Titan.
- Mỗi Planning phase quyết định bằng Gold thật: mua, giữ interest, XP, reroll, fuse,
  equip và sắp frontline/backline. Không tự sinh unit/Gold ngoài luật economy/loot.

5) Meta reward / Save / Performance
- Sau khi lobby kết thúc, nhận vật liệu thật theo placement:
  Hạng 1: Silver Ore 32 / Calcite 16 / Gold Ore 8.
  Hạng 2: 28 / 14 / 6. Hạng 3: 24 / 12 / 4. Hạng 4: 20 / 10 / 2.
  Hạng 5: 16 / 8 / 0. Hạng 6: 12 / 6 / 0. Hạng 7: 8 / 4 / 0. Hạng 8: 4 / 2 / 0.
- Receipt từng match trong inventory chính chống claim lặp, kể cả checkpoint được
  phục hồi sau lỗi ghi paid flag. Reward cố định theo placement, không nhân potion.
- Match checkpoint riêng: anime_card_rng_autochess_v1, local-only, không nằm trong
  cloud/export .acrsave chính. Save & Exit pause match. Reload giữa combat chạy lại
  đúng fight từ seed đầu vòng, không phát thưởng thêm. Lỗi lưu action rollback Gold,
  unit, Relic, shop và RNG. Không ghi đè save chính của hệ thống cũ.
- Simulation fixed-step 50ms; board interpolation qua một requestAnimationFrame.
  Trên HTTP/HTTPS dùng một Worker cho cả lobby, import source modules hiện có,
  chỉ chuyển visual snapshots/events sang UI. Combat worker không có quyền localStorage.
  Unsupported Worker/file:// có fallback cùng simulator trên main thread.
- Speed 1×/2×/3× chỉ đổi tốc độ combat. Hidden tab pause advancement. Worker được
  terminate, URL Blob revoke, FX/token cache clear khi thoát. FX buffer tối đa 96
  events/fight, hiển thị tối đa 36 popup nodes. Không timer/listener riêng theo từng unit.
- Mục tiêu render 60 FPS; tốc độ thực tế còn phụ thuộc thiết bị/browser, số summon
  và artwork. Không coi scenario test là bảo đảm 60 FPS trên mọi máy.

HƯỚNG DẪN SỬ DỤNG
- Arena → Auto Chess. Chọn carousel unit kèm Relic, nhấn Finish Draft.
- Click/tap unit trên bench rồi click ô trống phía mình để deploy; hoặc drag lên board.
- Click unit lần hai để xem passive, Protect, Add to Anvil, Unequip hoặc Sell.
- Chọn 3 benched units cùng tier ở anvil → Fuse. Có thể drag một unit bench vào
  unit bench cùng tier để fuse tức thì với unit thứ ba hợp lệ. Board không bị auto-fuse.
- Tap Relic rồi tap unit để equip; tap Relic thứ hai cùng tier để fuse. Drag cũng được.
- Click standings để scout; Return to my board để sửa đội. Mobile dùng Traits/Lobby.
- Buy XP (F), Refresh (D), Lock Shop; Ready để vào trận ngay. Space cũng là Ready.
- Khi vào trận không mua/bán/fuse/equip; chọn 1×/2×/3× ở cạnh bench.
- Save & Exit giữ match để chơi tiếp. Popup '?' có hướng dẫn; Tab giữ focus trong mode.
- Upload toàn bộ code, giữ assets đang có rồi Ctrl+F5. Không cần thêm asset mới.

KIỂM CHỨNG
- 217 native card grid scenarios; không ghi inventory/main save trong combat.
- Ba lobby seeded hoàn chỉnh, placement 1–8 duy nhất, mỗi match chỉ thưởng một lần.
- Native/Worker combat cho cùng kết quả từ cùng seed; fallback dùng cùng simulator.
- 20 economy/fusion/rollback/reload/odd-lobby checks; 15,000 Supporter fusion rolls.
- Holy true-damage conversion, distinct-character thresholds, hai đội Potara Unique.
- Account reward thật: claim lặp và checkpoint replay không duplicate vật liệu.
- UI 1440×1000, 390×844, 844×390: deploy, scout, XP, Ready, combat, không overflow.
  Anvil, tap Relic fusion/equip, pointer drag placement/sell, Relic recovery, 5 exit cycles.
- Regression Bleach 76 assertions; Sins 67; 39 deterministic PvP steps / 3 seeds;
  100 Infinity transitions, 21 fresh Tower fights. Native card definitions giữ nguyên.
- Các check là scenario tests, không phải chứng minh mọi tổ hợp cards/relics/trait/device.

Modified Files Note
- autochess.js (mới: state/economy/fusions/checkpoints)
- autochess_synergies.js (mới: trait registry/effects)
- autochess_bots.js (mới: seven bots/pairing/standings)
- autochess_view.js (mới: UI/input/one RAF)
- autochess.css (mới: scoped responsive arena)
- autochess_combat.js (mới: grid scheduler/worker/session)
- app.js (entry, activity lock, receipt reward bridge)
- index.html (entry/modal/style/script registration/cache tag)
- startup.js (module validation)
- passives.js (Auto Chess-only actor/effect/grid hooks)
- relic_combat.js (match-local Potara for both teams)
- akatsuki_passives.js (Auto Chess-only spatial targeting)
- sins_passives.js (Auto Chess-only adjacent splash)
- README.txt
- PASSIVE_AUDIT.txt

SYNERGY CODEX — 43 TRAITS (2 / 4 / 6 / 8)
- Fire: All allies gain ATK; attacks stack Burn for 3 own turns (ATK scaling). atk +7.0%/tier.
- Water: Allies gain Energy on attacks, stronger Shields; a healing wave every 4 seconds. mana +4/tier; shield +12.0%/tier.
- Nature: All allies regenerate max HP each second and reflect incoming damage. regen +0.6%/tier; reflect +2.5%/tier.
- Electric: Allies gain attack speed; every third attack chains lightning to 2/3/4/5 enemies. speed +8.0%/tier.
- Dark: All allies gain omnivamp and deal bonus damage to targets below 40% HP. vamp +4.0%/tier.
- Holy: Convert damage to True Damage, reduce incoming damage; cleanse normal debuffs every 5 seconds. trueDamage +5.0%/tier; reduction +2.5%/tier.
- Hero: Hero attacks shield the lowest-HP ally every third strike. hp +6.0%/tier.
- Villian: Villians deal extra damage to wounded targets and gain 1–3 lobby Gold on a PvP win. atk +6.0%/tier.
- AntiHero: AntiHeroes gain a damage bonus when no ally is adjacent. vamp +2.5%/tier.
- AntiVillian: Every fourth attack shields self and retaliates with piercing damage. reduction +2.5%/tier.
- Protagonist: Every fourth attack permanently adds ATK for this fight, up to 10 growth stacks. hp +4.0%/tier.
- Berserk: Missing HP increases attack speed; attacks below half HP heal the Berserker. atk +5.0%/tier.
- VideoGame: Every fifth attack spends no Energy and fires a critical combo blast. mana +3/tier.
- JoJo: Every fourth attack summons a Stand strike on a nearby second target. crit +3.5%/tier.
- Jujutsu · JJK: Every fourth attack creates a small domain: nearby enemies take damage and are Hindered. reduction +2.0%/tier.
- Fate: Fate units start shielded; every sixth attack restores a portion of their max-HP Shield. shield +12.0%/tier.
- Pirate · One Piece: Every third attack fires a broadside into the next two nearest enemies. vamp +2.0%/tier.
- Dragon Warrior · Dragon Ball: At full Energy, Dragon Warriors fire a Ki blast through the three nearest targets. atk +5.0%/tier.
- PlanetDestroyer: Every sixth attack deals max-HP damage to the enemy with the most remaining HP. hp +6.0%/tier.
- Ninja · Naruto: Ninja first strikes deal extra damage; every fourth strike adds Bleed. dodge +2.5%/tier.
- Unhuman: Every fifth attack heals self and grows max HP, up to five adaptations. hp +5.0%/tier; regen +0.2%/tier.
- Human: Human attacks grant nearby allies Energy; every fourth attack heals the lowest-HP ally. mana +2/tier.
- Captain: Captain attacks rally nearby allies with Shields every third strike. hp +4.0%/tier.
- Brutal: Every third attack sunders the target with a brief ATK debuff and bonus damage. crit +3.0%/tier.
- PureEvil: Increase DoT damage; every fourth strike adds a three-turn corrupting Burn. dot +10.0%/tier.
- Demon Slayer: Every third strike deals bonus damage and Bleed to high-HP foes. speed +3.5%/tier.
- Sins: Sins deal extra damage to debuffed enemies and heal on every fifth attack. mana +3/tier.
- Alternative: Every fourth attack echoes into the target with True Damage. dodge +2.0%/tier.
- Army: Summoned allies gain stronger stats; every fifth attack shields adjacent allies. hp +5.0%/tier.
- Swordman: Every third strike cleaves adjacent enemies around the primary target. atk +4.5%/tier.
- Supporter: Every third attack heals the lowest-HP ally and grants a small Shield. mana +3/tier.
- Magician: At full Energy, cast a spell nova at the target and its adjacent allies. mana +4/tier.
- Reaper: Reapers heal on kills; attacks gain extra damage below 30% target HP. crit +2.0%/tier.
- Hunter: Every fourth attack marks the target: piercing damage and Hindered. speed +4.0%/tier.
- Titan: Every fourth attack stomps adjacent enemies, then shields the Titan. hp +10.0%/tier.
- TitanSlayer: Every third strike adds enemy max-HP damage, stronger against Titans. speed +3.5%/tier.
- Animal: Pack attacks gain damage for each nearby living ally, capped at three allies. speed +4.5%/tier.
- Mastermind: Every fourth attack reads its victim, reducing ATK and suppressing its next passive turn. mana +3/tier.
- Baller: Every third attack is a Direct Shot ignoring damage reduction; adds Energy to nearby allies. dodge +2.5%/tier.
- Isekai: Once below 25% HP, heal 10/20/30/40% max HP; every fifth strike grants Energy. hp +5.5%/tier.
- Draconic: Every fifth attack roars at three enemies, dealing damage and one-turn Stun. atk +6.0%/tier.
- Bleach: Every fourth attack unleashes Reiatsu, damaging two enemies and shielding the caster. mana +3/tier.
- Gunner: Every third ranged attack ricochets to the two nearest other enemies. speed +5.0%/tier.
