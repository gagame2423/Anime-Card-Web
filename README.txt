ANIME CARD RNG — HEXTECH, SKINS & RELIC PROGRESSION PATCH
Ngày: 19/11/2026 | Build: 20261119-hextech-1
Changelog chỉ cho bản cập nhật này. UI và dữ liệu mới trong game dùng English.

1. TÍNH NĂNG MỚI

SKIN WARDROBE
- Thêm skins.js, registry skin có ID ổn định, lưu trong save chính bằng
  unlockedSkins và equippedSkins[cardId]. Không đổi key save v1.
- Card Details có nút Skins ngay trước ô xN và EQUIP. Số đếm tính cả Default
  Skin, ví dụ 1/2 khi chỉ có Default, 2/2 khi đã mở skin của thẻ.
- Wardrobe có gallery lớn: Default Skin, các skin mới, LOCKED/UNLOCKED/EQUIPPED.
  Bấm skin đã mở để trang bị; chọn Default Skin để trở lại hình gốc.
- Skin chỉ đổi artwork, không đổi HP, ATK, level, rarity, category hay passive.
- Áp dụng cho Card Index, Deck/equip, combat chính, Auto Chess Shop/Board/Bench,
  Draft, Planner và Profile. Đội đối thủ dùng skin của đúng chủ đội hình khi scout.
- Có thể mở skin trước khi sở hữu thẻ; nhận skin không tự cấp thẻ đó.
- Dữ liệu skin và thẻ Hextech đi cùng Cloud Save/export/import hiện có.
- Có Escape, focus trap, khôi phục focus/inert và bố cục responsive.

10 skin khởi đầu — chỉ reference đường dẫn, không kèm ảnh:
  Kamen Rider Decade       | Spy          | assets/skin/spy.png
  Kamen Rider Dark Decade  | Female Spy   | assets/skin/fspy.png
  Florentino               | Crystal Tech | assets/skin/ctech.png
  Jason 13th               | Hell         | assets/skin/jhell.png
  Aqua                     | Beach        | assets/skin/aquabeach.png
  Senku                    | Female       | assets/skin/senkufemale.png
  Noelle Silva             | Beach        | assets/skin/noellebeach.png
  The Mourner              | Heavy        | assets/skin/mheavy.png
  Wish                     | Mercy        | assets/skin/wmercy.png
  Alucard                  | Reaper       | assets/skin/areaper.png

HEXTECH VAULT — 500 GEMS / RƯƠNG
- Mở từ Auto Chess Lobby hoặc Item Storage; không mua trong trận đang diễn ra.
- Icon rương: assets/items/hextech.png.
- 99% chọn đều 1 trong 10 skin: mỗi skin có xác suất tổng 9.9% / rương.
- 1% chọn đều 1 trong 9 thẻ Hextech: mỗi thẻ khoảng 0.111111% / rương.
- Skin đã có vẫn nằm trong pool đều; nhận trùng hoàn đúng 150 Gems.
- Nhận thẻ exclusive đã có vẫn cấp thêm bản sao collection. Card grant bỏ qua
  auto-delete/salvage để không làm mất phần thưởng rương đã mua.
- Nhánh thẻ gọi đúng MutationSystem.roll của game với thời tiết và mutation
  multiplier hiện tại. Luck không tăng chance 1% của nhánh thẻ.
- Trừ Gems và ghi kết quả đã roll trong cùng một lần lưu inventory. Main save
  ghi receipt cấp thưởng trước khi xóa journal đã thanh toán.
- Lưu lỗi/F5 giữa chừng: kết quả đã trả tiền được giữ; vào Vault chọn Recover
  Paid Reward để nhận tiếp, không mất thêm Gems và không roll lại.
- Có khóa thao tác trong tab và Web Locks giữa các tab khi browser hỗ trợ.
- Animation chest charge, vòng năng lượng cyan/gold, reveal, Mutation badge,
  Continue và Open Another · 500 Gems. Có Reveal Now/reduced-motion.
- Timer reveal được dọn khi đóng; không tạo timer/DOM riêng theo từng frame.

HEXTECH UNLOCK & POOL
- Thêm 9 object trực tiếp trong cards.js, mỗi thẻ có category array riêng và
  hextechExclusive: true. Tổng roster hiện tại: 243 thẻ.
- Chưa nhận từ rương: không xuất hiện trong normal gacha, Auto Chess Shop,
  uniform rarity fusion hoặc quà cấp độ của người chơi đó.
- Nhận lần đầu: cấp thẻ và bật hextechUnlocks[cardId] vĩnh viễn.
- Normal rolls sau unlock vẫn phải thỏa requiredWeather của thẻ.
- Auto Chess chốt quyền unlock khi tạo match; Shop/fusion/Birthday Present
  dùng cùng bộ lọc. Không thêm bias Supporter hay bias theo gacha odds.
- Shared Draft chỉ lấy exclusive nếu mọi tactician còn sống có quyền dùng thẻ.
- Ghost được mang thẻ chủ run trước đã mở; gặp ghost không mở thẻ cho bạn.
- PeerJS truyền unlock/cosmetic, không thêm Firestore query/write trong round.
- Compact run vẫn trong hard budget <= 5,900 bytes phía client.

AUGMENT ENCYCLOPEDIA
- ? Guide thêm tab Augment Encyclopedia: mọi entry trong registry, đầy đủ
  Silver/Gold/Prismatic, Weekly Rotation, icon, pool badge và mô tả.
- Tìm tên/cơ chế; lọc tier, loại, Default Pool/Weekly/Available This Match.
- Guide chuyển sang English: Stats, Rounds & Economy, Fusion & Relics,
  Ranked & Online, Controls & Cosmetics, bảng Elo và tra cứu Relic.
- Listener bộ lọc được hủy khi đổi tab/đóng modal.

2. THÔNG SỐ & PASSIVE 9 THẺ MỚI

Thông số gốc; Auto Chess vẫn chuẩn hóa combat stats theo luật sẵn có:
  Tulen | Mythic | Electric | 1 in 18,300,000 | Heavenly
    HP 72,300 / ATK 17,700
    VideoGame, Unhuman, Brutal, AntiHero, Magician
  Veera | Secret | Dark | 1 in 99,000,000 | Malevolent
    HP 132,000 / ATK 32,300
    VideoGame, Brutal, PureEvil, AntiVillian
  Jinx | Secret | Fire | 1 in 125,000,000 | No weather requirement
    HP 106,000 / ATK 40,500
    VideoGame, Gunner, Hero, Human
  Ahri | Secret | Water | 1 in 100,000,000 | Tsukuyomi
    HP 121,000 / ATK 29,600
    VideoGame, Magician, AntiVillian, Animal, Unhuman
  Krixi | Secret | Nature | 1 in 136,000,000 | Wind
    HP 120,000 / ATK 45,800
    VideoGame, Magician, Hero
  Neeko | Secret | Nature | 1 in 88,000,000 | Eclipse
    HP 126,000 / ATK 30,800
    VideoGame, Animal, Magician
  Sonic | Secret | Electric | 1 in 200,000,000 | Wind
    HP 175,000 / ATK 42,800
    VideoGame, Animal
  Yasuo | Secret | Nature | 1 in 175,000,000 | Wind
    HP 133,000 / ATK 50,700
    VideoGame, Swordman, Human, AntiHero, Protagonist
  Yone | Secret | Dark | 1 in 165,000,000 | Malevolent
    HP 119,000 / ATK 45,300
    Swordman, Human, AntiHero, VideoGame

- Tulen / God of Thunder: mỗi 3 đòn bắn 3 bolt; từng bolt 65% trúng địch
  ngẫu nhiên, 30% ATK và +1 Bolt Mark, cap 5. Dodge 5%; né gây Hindered
  5 turns và +1 Mark. Đủ 5 Mark khi bị đánh: tiêu Mark, counter 5 hit 20%
  ATK, mỗi hit 10% stun 3 turns không cộng dồn thời lượng. Mỗi 5 đòn hoặc
  đang đủ 5 Mark dùng LoiDieu thay normal: 20% HP đã mất của mục tiêu.
  LoiDieu kill splash 10% max HP nạn nhân vào một địch gần và +3 Mark.
- Veera / Blood Chain: mỗi đòn +1 Bhain, +2 nếu mục tiêu Bleed, cap 4.
  Đủ 4: thay đòn bằng hit tối đa 4 địch gần, 50% ATK mỗi địch; hồi 50%
  damage thực. Mỗi đòn 44% Bleed 3 turns, 33% ATK / turn.
- Jinx / Fishbones: follow-up 30% ATK, chance gốc 35%; mỗi nấc +1 point,
  cap +10. Kill +5 points trong battle, cap +25. Mỗi 4 đòn hợp lệ, tính
  cả follow-up, rocket tối đa 5 địch ở 150% ATK; phá Shield có sẵn hoặc
  stun 2 turns nếu trước hit không có Shield. Chain xử lý lặp, cap an toàn
  32 follow-up, không gọi đệ quy vô hạn.
- Ahri / Essence Fox: riêng Auto Chess, mỗi đòn 20% +40% Attack Speed
  trong 3 own turns. Kill +10 Fox Spirit và hồi 10% max HP. Ngoài Fox Theft,
  mỗi đòn +1–5 Spirit, dùng 1 để hồi 35–95% damage. Đủ 100 vào Fox Theft:
  không tăng Spirit, dùng 1–3 mỗi own turn đến 0; mỗi đòn Hindered 2 turns
  hoặc Hypnosis 1 turn, hồi 75–105% damage, không tốn thêm stack trên hit.
- Krixi / Nature Wrath: mỗi 3 đòn xuyên team 100%, 90%, 80%... ATK, sàn
  10%; từng hit 50% stun 1 turn. Mỗi 5 đòn chia ngẫu nhiên 12 meteor,
  mỗi meteor 25% ATK và 10% stun 1 turn.
- Neeko / Blooming Burst: mỗi 3 đòn thêm 20% ATK xuyên Shield, +30% dodge
  trong 2 own turns. Mỗi đòn 20% stun, 50% pierce địch kế tiếp 50% ATK;
  pierce thành công tăng stun 1 lên 2 turns. Vỡ Shield gây Hindered toàn
  địch 2 turns và -20% ATK trong battle.
- Sonic / Aerokinesis: follow-up 10% ATK, chance 90%, 80%, 70%...; dùng
  helper bonus Relic và giới hạn lặp. Mỗi follow-up có 10% +1 Chaos E,
  cap 7. Chain 5 đòn khi có Chaos E: freeze toàn địch 2 turns, tiêu 1 stack.
  Tự gỡ stun/freeze ngay khi áp dụng, cooldown 5 own turns.
- Yasuo / Wanderer Way: không có Swordman đồng đội thì +20% Crit Chance.
  Flow Wind cap 2; đủ thì Steel Tempest 150% ATK, stun 1 turn, 33% miễn
  dịch passive damage/effects 3 own turns. Mục tiêu đã stun thì Last Breath
  200% ATK, stun các địch khác 2 turns; kill hoàn lại 2 Flow.
  Có Yone thì Yone +10% ATK và +10% Crit Chance.
- Yone / Twin Blades: Wind Blade 110% ATK, 30% stun; Azakana Blade chia
  50% thường +50% xuyên Shield. Mỗi đòn thứ 4 vào Soul Unbound 2 lượt
  tấn công, splash các địch khác ở 50% damage. Hết mode nhận flat ATK bằng
  25% HP damage thực trong mode, tồn tại 2 own turns rồi bị gỡ hoàn toàn.
  Có Yasuo thì Yasuo +50% Crit Damage / +25% max HP.
- Cả 9 dùng chung hextech_passives.js cho main và Auto Chess, RNG theo host
  seeded. Stack/mode không ghi vào stats inventory và không rò qua battle.
- Copy tạm dùng lease: Oingo hết hạn sẽ gỡ đúng buff/link đã cấp.
- Thanh stack/status Auto Chess có Bolt Mark, Bhain, Fox Spirit/Theft,
  Chaos E, Flow Wind và Soul Unbound, kể cả worker combat.

3. RELIC MỚI & SỬA TOOLTIP

FATE SCYTHE — assets/items/fscythe.png
- Common ATK +2–6%, Rare +3–9%, Legendary +8–15%; theo Element được roll.
- Unique roll +50–200% ATK. Mỗi fatal-hit survival/revive thật cộng một stack
  trong battle. Chỉ hoạt động khi passive chủ có survival/revive.
- Receipt fatal và revival cùng một lần cứu mạng không tạo hai stack.
  Không cộng stack chỉ vì Invincible; Relic không tự cấp revival/bất tử.
- Recipe: Silver Ore 100; Electric Ore 100; Mineral Ore 50;
  Dark Fragment 50; Monster Egg 100; Unknown DNA 100.

RABADON HAT — assets/items/rhat.png
- Common ATK +2–8%, Rare +4–12%, Legendary +10–30%; chỉ cho Magician.
- Unique roll +10–50% HP và ATK cho clone/summon do chủ tạo. Cần passive
  clone/summon. Bonus được áp dụng một lần khi admit companion, không nhân
  lại qua nhiều hook. Không đổi summon cap hiện có.
- Recipe: Dragon Tooth 100; Leaf 100; Mineral Ore 50;
  Dark Fragment 50; Monster Egg 100; Lapiz Ore 100.

ROLL, ELIGIBILITY & SAVE
- Craft dùng thuật toán cũ: 70% Common / 25% Rare / 5% Legendary;
  Legendary có 10% Unique. Hai loại mới nối cuối registry, giữ index cũ.
- Tooltip hiển thị Unique roll thật, ví dụ +17.5%, không lặp template +5–30%.
  Chỉ Template Preview chưa có roll mới hiển thị khoảng giá trị.
- Tách Base Stats và Unique Eligibility. Portrait lấy board + bench của bạn,
  kể cả lúc scout: special attack của Enten Blade, Gunner của Jackal Guns,
  Human của God Leaf, survival của Fate Scythe, summon của Rabadon Hat.
- Giữ sửa God Leaf trước đây: Human ở cả Common/Rare/Legendary. Không đổi
  Legendary trở lại điều kiện Element; các roll cũ vẫn tương thích.
- AI Platinum trở lên biết Unique Fate Scythe/Rabadon Hat khi chọn wearer;
  không đổi nhánh hành vi Iron–Gold.
- Codec đọc tuple Relic cũ 14/15 phần tử và tuple mới 17 phần tử.
  Board cũ 3 phần tử vẫn đọc được; skin là phần tử thứ tư tùy chọn.

GEM / RIFT SHARD ICON & REWARD
- Gems: assets/items/gem.png; Rift Shard: assets/items/rshard.png.
- Item registry, Inventory, Rift HUD/Shop, reward strip và Vault dùng icon mới.
  Ảnh lỗi vẫn giữ text số lượng/tên tiền tệ để UI sử dụng được.
- Gems placement Auto Chess luôn là base reward: không nhân Drop Multiplier,
  luck, Osiris hoặc VND Multiplier. Hoàn 150 Gems cũng là số cố định.

4. AN TOÀN, HIỆU NĂNG & KIỂM TRA

- Guard chống nạp module mới hai lần; không thêm Proxy battle toàn cục.
- Chain có giới hạn, dùng guard source/depth và budget tactical hiện có.
- Buff flat có key/lease riêng, gỡ khi hết hạn hoặc passive copy hết hạn.
- Heal/Shield dùng shared adapter, giữ Overtime và luật Bleed anti-heal.
- Không có interval/rAF riêng theo unit. Animation dùng transform/opacity.
- Giữ Last Stand một lần/match, overtime/timeout, weekly economy, shop lock
  một round, uniform rarity fusion và Cloud budget hiện có.

Đã kiểm tra bằng Chromium headless, ảnh giả lập trong RAM:
- Startup audit 243/243, không missing/unclassified hook hoặc JS page error.
- Chín passive mới: damage, AoE, shield break, heal, dodge, stack, mode, chain.
- Hai Relic: roll bounds, recipe, survival stack, summon scaling và codec.
- Yone hết mode/gỡ buff; Oingo copy Yone hết hạn gỡ HP link.
- 17 passive content trước tiếp tục qua kiểm tra cơ chế.
- Giả lập lỗi main-save / inventory-save; paid chest phục hồi idempotent.
- 500 Gems, duplicate hoàn 150, unlock pool, lưu skin, per-owner artwork.
- Catalog đủ Augment; lọc Silver/search; Escape với Vault/Wardrobe lồng nhau.
- Panel 390×844, 844×390, 1440×900 không tràn ngang.
- Native/Worker cho cùng outcome/telemetry với đội 9 thẻ Hextech; dispose
  không giữ fight thừa, các recursion guard trở về 0 sau resolution.
- Last Stand regression và P2P giả lập 8 người: một Champion, reward/run
  publication đúng một lần mỗi tài khoản, không sống vô hạn ở 1 HP.
- Không tuyên bố đã đo FPS trên mọi điện thoại hay gọi Firestore production;
  patch không cần đổi firestore.rules.

5. HƯỚNG DẪN CẬP NHẬT & FILE

- Chép đúng file trong patch vào thư mục gốc; giữ nguyên mọi file không có
  trong patch. Không xóa localStorage/reset save.
- Deploy đầy đủ rồi refresh một lần. index.html đăng ký module/CSS mới và
  cache version; Worker import cùng phiên bản.
- ZIP không có assets/, ảnh/nhạc, binary game, backup, log hoặc script test.
- Đường dẫn chỉ là reference. Giữ assets của bạn; nếu chưa có artwork mới,
  bổ sung assets/cards/tulen.png, veera.png, jinx.png, ahri.png, krixi.png,
  neeko.png, sonic.png, yasuo.png, yone.png ở máy/project của bạn.
- Thêm skin tương lai: nối registry ID mới vào cuối danh sách, không đổi
  ID/thứ tự skin đã có trong compact replay.

27 source files:
  NEW: skins.js, hextech.js, hextech.css, hextech_passives.js.
  DATA/RELIC: cards.js, relics.js, relic_combat.js, inventory.js, materials.js,
    rift.js.
  COMBAT: passives.js, content_passives.js, combat_stats.js.
  MAIN ADAPTER/LOAD: app.js, index.html.
  AUTO CHESS: autochess.js, autochess_augments.js, autochess_combat.js,
    autochess_relic_view.js, autochess_view.js, autochess_panels.js,
    autochess_lobby.js, autochess_online.js, autochess_live.js, autochess_runs.js,
    autochess_audio.js, autochess_ai.js.
  DOCUMENTATION: README.txt và PASSIVE_AUDIT.txt.
  autochess.css không cần sửa: style mới nằm trong hextech.css; file không
  thay đổi không được đưa vào patch.

6. OPTIONAL SOUND HOOK MỚI

  assets/audio/hextech_open.mp3

- Dùng pooled/cached AutoChessAudio và mute/volume SFX sẵn có.
- Thiếu file hoặc browser chặn autoplay không làm gián đoạn gameplay.
- Không kèm mp3. Không đổi cảnh báo 10 giây/countdown10s.mp3 hoặc tên nhạc
  rank-up hiện có. Không thêm optional filename nào khác trong patch.
