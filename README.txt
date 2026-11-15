ANIME CARD RNG — AUTO CHESS: AUGMENTS, PASSIVE SAFETY & MATCH REPORT
Ngày: 15/11/2026 • Build: 20261115-autochess-augments-1

TÍNH NĂNG MỚI
- Augment Armory ở Stage 2-1, 3-2 và 4-2: chọn 1 trong 3 lựa chọn cùng tier
  Silver/Gold/Prismatic. Mỗi ô được reroll riêng đúng 1 lần. Cả 7 bot chọn Augment
  thật, hưởng combat/economy/trait effects và ghi vào báo cáo cuối trận.
- 18 họ Augment mặc định (54 biến thể theo tier): Combat, Trait Crest, Relic Forge
  và Economy. Thêm 4 họ Weekly (12 biến thể); mỗi tuần chỉ mở 1 họ Weekly, với
  trọng số xuất hiện gấp 4 họ thường. HUD có nút xem trước Weekly và cả 3 tier.
- Weekly dùng ISO calendar week theo UTC. Tuần được chốt khi tạo match; trận đang
  chơi không đổi pool giữa chừng khi lịch chuyển tuần. Armory/reroll/pick được lưu.
- Card Inspection có icon Element thật, badge MELEE/RANGED lấy cùng attack range
  với combat engine và các trait đang active trên board người chơi phát sáng.
- Shop: tap/click để mua; giữ 450ms trên cảm ứng, chuột phải hoặc phím I/ContextMenu
  trên ô đang focus để xem thẻ. Giữ xem thẻ không mua. Bench/board/anvil: chọn rồi
  bấm lại để xem. Preview hover/tap cũng hiển thị combat role và Element.
- Match Report có 3 tab: Overview & MVPs; Unit Damage Breakdown; All 8 Tacticians
  Scoreboard. Header, thứ hạng, số round và itemized rewards luôn nằm trong modal;
  tab body cuộn riêng. Bấm hàng bot để mở thống kê card và lịch sử synergy đầy đủ.
- Telemetry cho đủ 8 tactician: combat, economy, fusion, relic craft, W/L, longest
  streak, tactic HP damage, synergy history, final board/relic/augments và MVP.
- Đã thay chính xác category của toàn bộ 217 thẻ theo danh sách mới. Không đổi
  tên, ID, stats, chance, weather, ảnh, rarity hoặc nội dung passive của cards.js.
  Category-based passive, relic, filter và Auto Chess trait dùng định nghĩa mới.

CÂN BẰNG & SỬA LỖI
- Bỏ các lớp Proxy/Reflect.set chồng trong Sins/Tensura/Bleach/Tower200. Runtime
  dùng registry descriptor chung, gắn một lần, có guard chống setter gọi lặp.
- Các *_passives.js có guard nạp script và cache factory theo API, không cài lại
  wrapper khi khởi tạo lặp. ensureRuntime có guard tái nhập và cleanup bằng finally.
- damageUnit và hit có depth/source guard: chặn source đang resolve cùng hit và
  chặn secondary resolution khi depth > 2. Follow-up tuần tự vẫn hoạt động sau
  khi hit trước đã hoàn tất; damage guard luôn được trả về 0 sau resolution.
- Sửa Malevolent King: follow-up slash không tự mở thêm cả volley lồng nhau.
  Auto Chess chia sẻ ngân sách tối đa 64 attack dispatch cho 1 action; các vòng
  chain trong passive có giới hạn riêng để tránh nổ số lượng khi copy/support.
- Auto Chess tạo combat objects/stats/runtime riêng từ card definitions và Relic
  trong match. Không mang runtime của inventory/main battle vào tactical match.
  Virtual copied-passive view chỉ dùng phạm vi copy; không bọc Proxy chồng lên unit.
- Worker gửi metrics thực đã resolve cùng frame; kết quả native/Worker đối chiếu
  cùng seed. Kết thúc/forfeit dừng worker và giữ telemetry của phần fight đã chạy.
- Creep/boss rounds luôn có Relic Orbs, cả khi người chơi thua round. Stash đầy thì
  Relic chờ ở hàng đợi loot, không mất Relic; hàng đợi hỗ trợ tối đa 512 Relic.
- Card gold passives (gồm Nami/Bounty Hunter) được chuẩn hóa trong Auto Chess,
  dùng chung cap; không lấy phần thưởng VNĐ của main game làm Gold trong match.
- Giữ cơ chế reward receipt, tự nhận thưởng một lần, retry khi lưu lỗi và reset
  Stage 1-1 sau khi thoát run đã kết thúc. Forfeit vẫn cần xác nhận riêng.

THÔNG SỐ & CÔNG THỨC CHI TIẾT
- Armory tier odds (Silver / Gold / Prismatic):
  Stage 2-1: 60% / 30% / 10%; Stage 3-2: 20% / 60% / 20%;
  Stage 4-2: 10% / 40% / 50%.
- 3 lựa chọn khác nhau; không cấp lại họ Augment đã sở hữu. Crest cộng 1/2/3 virtual
  trait count và chỉ active nếu có ít nhất 1 card cùng trait thật đang deployed.
  Combat effects vẫn tuân thủ immunity và quy tắc buff/heal của card.
- Pocket Change cấp 8/11/14g một lần. Trade Route cấp 2/4/6g một lần và tối đa
  1 free refresh mỗi planning round, không tích lũy. Efficient Study giảm Buy XP
  xuống 3g (+4 XP), không stack thấp hơn 3g; cấp thêm 2/4/6 XP một lần.
- Cap Gold: tối đa +2g/round từ TOÀN BỘ card passives cộng lại, nằm trong hard cap
  +16g bonus/round. Interest, streak, win bonus, creep bonus, trait và Augment Gold
  đều cùng chia cap 16. Base income và tiền hoàn khi bán unit không thuộc bonus.
  Mọi nguồn Gold được cộng qua một hàm trung tâm; UI/telemetry ghi số thực nhận.
- Relic Orbs mỗi PvE round: Stage 1 có 1–2; Stage 2+ có 2–3.
  Odds cho từng Orb (Common / Rare / Legendary):
  Stage 1: 75% / 25% / 0%; Stage 2: 20% / 70% / 10%;
  Stage 3: 10% / 60% / 30%; Stage 4: 0% / 45% / 55%;
  Stage 5+: 0% / 30% / 70%. Unique Legendary vẫn tạo qua fusion 2 Legendary.
- Telemetry đo HP thực sự bị mất (không cộng overkill hoặc shield absorption vào
  damage), healing thực và Shield tăng thực. Burn/DoT được tách khi engine có tag.
  Summon/companion được quy về owner. Các bản sao cùng card ID được tổng hợp chung;
  peak damage là tổng của card đó trong 1 round, không phải damage của 1 hit.
- Mỗi tactician chỉ ghi 1 fight chính thức/round; ghost defender không bị cộng lặp.
  Bench không cộng roundsDeployed; synergy dùng card deployed khác nhau + Crest.
  Resume checkpoint cũ bắt đầu tracking từ round hiện tại và được gắn nhãn partial.
- Match chốt ngay khi human bị loại hoặc thắng như bản trước. Bot còn sống được
  xếp theo HP/level/Gold tại lúc human thoát, đánh dấu “at exit”; không giả lập hay
  trình bày đó là thứ hạng cuối của các round chưa diễn ra.
- Placement rewards cơ bản (VNĐ | Star Orb | Gems | Player EXP):
  1: 25,000,000 | 150 | 500 | 2,500
  2: 15,000,000 | 100 | 300 | 1,800
  3:  9,000,000 |  60 | 200 | 1,200
  4:  5,000,000 |  40 | 120 |   800
  5:  2,500,000 |  20 |  60 |   500
  6–8: 750,000 |  10 |   0 |   200
  VNĐ = floor(base × active VND Multiplier); Star Orb = floor(base × active Drop
  Multiplier). Gems/Player EXP giữ base. Reward quote được chốt trước khi ghi tài
  khoản và receipt ngăn duplicate claims/replay sau save failure.

HƯỚNG DẪN SỬ DỤNG
- PATCH ONLY: áp dụng lên bản Auto Chess Match UX gần nhất. Ghi đè các file cùng
  tên, thêm 3 module mới và giữ các file khác. index.html chứa thứ tự load/cache
  tag mới, vì vậy phải cập nhật cùng các module; hard reload sau khi áp dụng.
- Module mới: autochess_augments.js, autochess_telemetry.js, autochess_report.js.
- File sửa: cards.js, elements.js, passives.js, cả 9 *_passives.js; gomen.js,
  dragon_skills.js, reagan.js, shibuya.js, fate.js, requiem.js; autochess.js,
  autochess_synergies.js, autochess_bots.js, autochess_combat.js, autochess_view.js,
  autochess.css, index.html, PASSIVE_AUDIT.txt và README.txt.
- Đã kiểm tra: 217 card runtime kéo dài đến 40 simulated seconds/card và fatal-hit
  probes; mixed-team copy/reflect/summon deterministic checks; native/Worker parity;
  complete seeded matches, 8-tactician telemetry; Armory, ISO week boundaries,
  reroll/pick, Gold caps và Relic count/tier ranges; 217 category exact-match.
- Kiểm tra reward/save: đủ 8 hạng với multiplier; retry khi main/item save lỗi,
  frozen reward quote, checkpoint replay và chống nhận trùng đều qua.
- UI được kiểm tra desktop 1440×900, mobile landscape 844×390/915×412 và portrait
  với CSS rotation fallback; giữ để inspect, tap mua, report tabs và exit reset.
  Môi trường kiểm tra Chromium headless; không khẳng định mọi máy đều đạt 60 FPS.
- Archive chỉ chứa file mới/đã sửa. Không có assets/, media, test, log hoặc backup.
