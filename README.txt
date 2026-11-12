ANIME CARD RNG — PRIDE BOSS EVENT & SEVEN SINS
Bản cập nhật: 12/11/2026

TÍNH NĂNG MỚI
- Thêm Pride Boss Event vào pool Boss Event luân phiên 12 giờ hiện có.
  Vẫn mở trực tiếp event đang hoạt động, không yêu cầu Weather, không lặp
  event liền trước. Shop dùng Pride Coins, có Quantity và 5 potion chuẩn.
- Boss Escanor The One, Difficulty 1: HP 400.000 / ATK 20.000.
  Scale giữ công thức Boss Event: stat * (1 + (difficulty - 1) * 0,075).
- Hai special drop độc lập, chỉ roll khi thắng:
  + Meliodas: 0,01% tại D1 → 1% tại D1000.
  + Pride Sun: 0,01% tại D1 → 3% tại D1000.
  + rate(d) = minRate + (maxRate - minRate) * (d - 1) / 999.
- Meliodas gọi đúng rollMutations() của banner: Weather đang chạy, modifier
  mutation Equipment và trần 2 mutation. Không ép mutation theo event.
- Pride Sun thuộc Material, ảnh assets/items/psun.png. Dùng 1 Pride Sun và
  1 bản Escanor Lv.100 để evolve trong Card Details > Evolve.
- Thêm 6 thẻ (Sins, Titan, Mastermind… dùng category đã có):
  Meliodas: Mythic / Dark / 1 in 0 / HP 118.000 / ATK 45.100.
  Ban: Secret / Fire / Eclipse / 1 in 20.000.000 / HP 74.900 / ATK 18.300.
  Diane: Secret / Nature / Lucky / 1 in 19.999.999 / HP 63.700 / ATK 15.600.
  King Harlequin: Secret / Nature / Wind / 1 in 27.000.000 /
    HP 106.000 / ATK 6.500.
  Gowther: Secret / Holy / Sugar / 1 in 26.000.000 / HP 83.200 / ATK 20.300.
  Escanor The One: Mythic / Fire / 1 in 0 / HP 24.300 / ATK 9.300.
  Escanor The One đã sửa odds thành 0 theo đính chính, chỉ nhận bằng evolve.
  Meliodas chỉ rơi từ Pride; cả hai không vào pool roll thường.

PASSIVE VÀ CÁCH XỬ LÝ
- Meliodas / Hellblaze: 50% chặn đòn của Magician và phản 150% sát thương
  của đòn đó; counter/redirect không phản lặp. +50% Crit Damage cộng thẳng
  vào hệ số crit, +10 điểm % Crit Chance mỗi Sins teammate, không tính mình.
  Hiệu ứng đội của Meliodas tính theo roster, gồm đồng đội đã ngã xuống.
  Black Flame của đội khi kết liễu sẽ bỏ qua fatal survival/revival; khiên
  và miễn nhiễm vẫn hoạt động trước bước kết liễu.
- Ban / Snatch: một aura toàn trận x1,25 cho Burn/Black Flame/Bleed/Poison
  khi Ban còn sống; nhiều Ban không nhân aura nối tiếp. Poison vẫn không
  được tự kết liễu. Mỗi attack lấy từ 1 buff phần trăm đang dương của địch.
  Theo lựa chọn đã chốt: lấy 10 ĐIỂM PHẦN TRĂM, không phải 10% số hiện tại:
  +50% HP → +40% HP; Ban nhận +10% HP. Nếu buff còn ít hơn 10 điểm thì lấy
  phần còn lại. Buff trên Ban hết sau 3 lượt riêng tiếp theo; không trả lại
  cho địch. HP/ATK dùng key riêng trong ledger; crit/dodge/DR giữ timer riêng.
- Diane / Envy Creation: chỉ khi bắt đầu ở slot 1 mới tạo clone mỗi lượt
  battle; chọn Nature teammate/enemy còn sống, mỗi entity gốc một lần.
  Không sao chép generated/uncloneable units. Giữ cap riêng 3 active / 3 lần
  tạo để không sinh clone vô hạn. Clone lấy 50% HP/ATK Diane, giữ passive gốc
  và kế thừa Relic qua bộ admission chung. Clone của đội được +10% chỉ số gốc
  lúc tạo khi Diane sống; buff cộng theo base. Nature đấu Electric dùng x4.
- King Harlequin / Disaster: chặn fatal hit cho teammate tối đa 3 lần, tự
  chịu 25% sát thương; không chuyển vòng giữa nhiều King. Địch chưa từng bị
  tấn công nhận thêm 10% Max HP vào đòn đầu. Lead King cấp khiên đội bằng
  150% Max HP. Khi King trên 50% HP, khiên địch mới nhận giảm 25%; xử lý cả
  shield layer lẫn legacy shield, không giảm lặp cùng một lần cấp.
- Gowther / Puppet Invasion: 20% Hypnotize 2 lượt của mục tiêu; mỗi lần
  áp dụng thành công được 1 Lust. Hypnotize có 80% đánh teammate nếu còn
  teammate hợp lệ. Có Lust: giảm 50% damage trước khi trừ 1 stack khi trúng
  attack; DoT không tiêu Lust. Từ 4 Lust: 50% dodge. Dodge không tiêu stack;
  status/passive immunity được tôn trọng, không cộng Lust khi bị chặn.
- Escanor The One / The One: 1 SunShine mỗi lượt riêng, 12 stack kích hoạt
  mode trong 5 lượt riêng (tính cả lượt kích hoạt). +150% ATK theo base;
  chống Stun/Freeze/ATK debuff và tẩy ATK debuff cũ khi vào mode.
  Không nhận HP/ATK/crit/DR/shield buff từ đồng đội và không được external
  heal; level, mutation và Relic gốc vẫn dùng bình thường.
  Đánh Frozen hoặc Water: x1,5 một lần và tẩy Freeze. Mode phá khiên trước
  damage. Fatal hit trong mode: tự revive 50% Max HP, xóa mode/SunShine;
  có thể nạp lại và revive tiếp, không đặt cap. Ngoài mode, nếu khiên còn
  sau hit: Burn 2 lượt, 50% ATK/lượt, blast tối đa 2 địch kề mục tiêu bằng
  lượng damage vừa gây (tính cả phần đã đánh vào khiên).

CÂN BẰNG & SỬA LỖI
- Cho phép evolve lặp tất cả recipe khi còn bản gốc Lv.100 và nguyên liệu.
  Không khóa vì đã có target hoặc receipt evolve cũ. Mỗi lần dùng đúng
  1 base copy và nguyên liệu; cộng copy/variant target thay vì ghi đè.
  Giữ mutation. Target mới bắt đầu Lv.1; target đã có giữ level/EXP dùng
  chung hiện tại. Journal lỗi ghi sẽ phục hồi cả thẻ và nguyên liệu.
- Infinity không khóa đội theo category nữa. Chọn 4 ID khác nhau từ toàn bộ
  thẻ đã sở hữu; featured weekly category được x3 HP và x3 ATK đúng một lần.
  Grid/slot preview có bonus và badge WEEKLY x3; thẻ ngoài category giữ stat
  bình thường. Enemy element, wave scaling, continuous HP/buffs, weekly
  leaderboard và weekly reset reward không đổi.
- Penalty: cache goal_field và các miếng vá HUD/bóng vào 1 canvas tĩnh rồi
  vẽ 1 lần/frame. Không dựng lại nền/đo clientWidth/clientHeight mỗi frame;
  ResizeObserver/resize chỉ đổi backing store khi kích thước thay đổi.
  Giữ rAF dt thực và timing/input chính xác của bản trước.
- Theo lựa chọn đã chốt: keeper phủ 3 ô gần nhau (ô chọn + 2 ô lân cận).
  Chung một coverage map cho save check và animation. Saved ball kết thúc
  ở tay keeper; cú sút vượt keeper hiện động tác lỡ đà, không đi xuyên tay
  trong khi bị gọi là goal. Shoot/Curve vẫn có thể vượt keeper khi timing tốt.
- Drop quantities nhận cả permanent multiplier và bonus đội từ Nami,
  Hakari Jackpot, lựa chọn Rewards của Aqua. Ví dụ: x2 * x2 * x1,5 = x6,
  rồi nhân permanent drop multiplier. Áp dụng một lần, có stochastic rounding.
  Bao gồm potion/keys/Bread, Tower/Raid/Boss coins, Trial shards, Material
  Time Trial, Spooky coins/items, Rift shards, Portal beans và Infinity wave orbs.
  Không đổi xác suất special card hoặc nhân bản reward dạng card/Relic/Portal
  instance. Không
  cấp thưởng PvP. Không đổi fixed EXP Time Trial conversion; reward choice
  của Aqua đã cập nhật mô tả eligibility. Shop/mua/evolve không dùng bonus đội.
- HP/ATK của toàn bộ 200 thẻ cũ giữ nguyên. Không đổi stat/scaling địch các
  mode cũ; Tower/Trial/Raid/Spooky chỉ thêm context cho quantity reward.

KIỂM TRA
- Syntax: toàn bộ 84 browser JS + test Node, JSON và 89 local HTML references.
- 43 Node checks cho timing/save/keeper, gồm 5.000 shot RNG và nhiều FPS.
- 67 kiểm tra combat Sins: counter/crit/Black Flame, Snatch/expiry, clone cap,
  King shields/rescue, Lust timing/immunity, The One duration/buff/revive.
- 52 kiểm tra event/evolution/rewards/Infinity và 1.000 cửa sổ rotation:
  mutation banner thật, double mutation, nhận reward một lần, repeat evolve
  giữ level/EXP, target mới Lv.1, correct odds Escanor The One = 0.
- Kiểm tra quantity x6 ở Material Trial, potion/keys/Bread, Tower, Raid,
  Normal Trial và Rift; validator nhận pending reward đã scale.
- 206 fixture combat có seed không lỗi runtime; 12 idle phase guards.
  PvP với thẻ mới: 120 bước / 3 seed, snapshot hai engine khớp và không ghi
  reward/save. Chưa kiểm tra hai máy qua WAN hoặc mọi tổ hợp clone/passive.
- Full Spooky 50 wave: không special drop trước Wave 50, item quantity x6,
  Myers một bản và save hợp lệ. Kiểm tra lỗi ghi evolve khôi phục thẻ/vật phẩm;
  mobile Pride mở trực tiếp, shop/Quantity và cả hai drop preview hoạt động.
- Desktop 1440px/mobile 390px: mixed-category Infinity vào Arena chuẩn,
  featured bonus, Penalty input/exit; CPU throttle x4 vẫn vẽ đúng 1 nền cache
  mỗi frame và không đọc layout canvas mỗi frame. Không suy diễn thành cam
  kết FPS trên mọi thiết bị. PASSIVE_AUDIT.txt ghi phạm vi 206 thẻ.

HƯỚNG DẪN SỬ DỤNG
- Giải nén source, giữ assets đang có. Cache tag: 20261112-pride-1.
  Push GitHub rồi Ctrl+F5; không cần reset save hoặc backend mới.
- Thêm artwork tương ứng nếu assets triển khai chưa có:
  assets/items/psun.png
  assets/cards/meliodas.png
  assets/cards/ban.png
  assets/cards/diane.png
  assets/cards/kingharlequin.png
  assets/cards/gowther.png
  assets/cards/escanortheone.png
  Gói giữ nguyên 3 sprite Penalty đã cung cấp; không tự tạo ảnh thẻ thay.
- Test độc lập: node tests/penalty_timing.test.cjs. Không tạo Excel.

Modified Files Note
- sins_passives.js (mới): toàn bộ state/hook Sins, timer, summon và guard.
- cards.js: 6 thẻ, odds Escanor The One = 0, mô tả reward Aqua.
- boss_event.js: Pride, boss/drop khác ID, hai lượt special độc lập, reward context.
- evolution.js: Pride Sun/recipe, bỏ lock, level preview/result.
- app.js: repeat evolution cộng copies/giữ progress, Pride preview và reward bridges.
- combat_stats.js: guard tùy chọn cho stat ledger, không đổi base công thức.
- companions.js: admission cap Diane và hook clone creation.
- passives.js: tích hợp Sins, status/counter/DoT/shield/fatal/crit, reward multiplier.
- yuno.js: shield layers dùng cùng quy tắc King/anti-buff Escanor.
- infinity.js: owned-card pool, featured previews và wave reward context.
- infinity_combat.js: x3 HP/ATK featured khi tạo battle, chỉ một lần.
- infinity_view.js: HUD weekly bonus.
- infinity.css: badge x3, bỏ icon khóa.
- inventory.js: battle-aware quantity scaling và giới hạn validator tương ứng.
- materials.js: quantity context, giữ nguyên độc lập chance/element/drop receipt.
- timetrial.js: quantity context cho shards.
- tower.js: quantity context cho coins.
- raid.js: context cho coins/items/keys; giữ RNG/card rates/scaling.
- spooky.js: context cho coin/items và pending validator tương ứng.
- rift.js: context và pending validator cho shard quantity.
- portals.js: context cho beans/items; giữ guest/MVP factors.
- portal_combat.js: truyền battle vào bước settlement.
- exp_food.js: quantity context cho Bread, chống reward PvP.
- penalty_game.js: cache coverage 3 ô và save check.
- penalty_sprites.js: tọa độ tay/catch pose để render đúng kết quả save.
- penalty_view.js: cache nền, resize/rAF, animation tay bắt bóng.
- index.html: script Sins, bonus banner và cache tag.
- startup.js: dependency Sins.
- tests/penalty_timing.test.cjs: kiểm tra coverage/reach và upgrade progression.
- PASSIVE_AUDIT.txt: báo cáo hiện tại 206 thẻ.
- README.txt: changelog riêng bản này, file tham chiếu và kiểm tra.
