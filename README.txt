ANIME CARD RNG — AUTO CHESS: HYBRID INVITE LOBBY & RANKED
Ngày: 15/11/2026 • Build: 20261115-autochess-ranked-1

TÍNH NĂNG MỚI
- Lobby riêng 8 vị trí: host có crown/rank emblem; 7 ô mời bạn, Room Code có
  Copy/Join và START tức thì. Không có public queue. Nền cảnh dùng SVG/CSS trong
  source, toàn bộ card/relic/rank vẫn tham chiếu assets hiện có.
- PeerJS chia sẻ danh sách người tham gia, seed và recorded runs. Mỗi người chơi
  chạy một giải HYBRID ĐỘC LẬP trên máy của mình; đối thủ dùng recorded board hoặc
  AI. Đây không phải PvP trực tiếp đồng bộ combat/thứ hạng giữa các máy.
- START luôn vào Stage 1-1 ngay: giữ bạn đã vào phòng, điền chỗ còn trống bằng
  recorded runs khác UID hoặc bot. Query trả chậm không chặn carousel; chỉ thay
  các chỗ chưa sử dụng trước PvP đầu tiên. Bạn chưa có run dùng Friend AI; nếu
  cache/query có run của đúng UID đó thì nâng ghế ấy thành replay, không thêm trùng.
- My Augments mở được ở Planning/Combat, có icon, tier border và description.
  Đồng hồ vẫn chạy khi xem Augments. Weekly/Armory và các lựa chọn đã có giữ nguyên.
- Ranked riêng cho Auto Chess: 10 tier, division 100 Elo, rank icon hiện ở lobby/HUD,
  Elo thay Player EXP trong reward mới. Promote division hoặc tier mở RANK UP VFX
  một lần, hỗ trợ reduced motion. Demotion vẫn cập nhật đúng, không phát VFX promote.
- Elo Leaderboard hiển thị top 50 run được công bố, rank/division/Elo/1st-place wins.
  Bấm ở lobby để tải; trong trận chỉ xem cache, không tạo query mới.
- Tên 7 bot: Mr Win; Ms Willy; CHV; Jusi; Crosshair; Maid Girl; Blox Fruit Kid.
- Platinum–Diamond: bot bám 2–3 core traits, ưu tiên breakpoint/fusion, mua XP và
  giữ frontline/backline. Master–Challenger: thêm tối ưu board, chống AoE, chọn/reroll
  Augment có giá trị và phân bổ Relic theo role, category, element, scaling thực tế.

CÂN BẰNG & SỬA LỖI
- Supporter bớt sustain theo đúng bảng bên dưới. Heal và shield của cùng một proc
  luôn áp dụng vào cùng ally có tỷ lệ HP thấp nhất trước khi hồi.
- Overtime từ giây 30 giảm heal/shield và tăng damage; áp dụng cả shield cộng trực
  tiếp qua passive, shield theo layer và helper, không scale hai lần.
- Hết 60 giây không mặc định player thua: so HP% còn lại, rồi damage thực đã gây.
  Nếu cả hai bằng nhau thì hòa, không mất Tactician HP, không tăng loss streak.
- Phòng có hơn 1 human thực: khóa X/ESC/forfeit trong run. Khi local human bị loại,
  chuyển Spectator, vẫn scout board và chạy các round còn lại. Chỉ chốt thưởng/Elo/
  Rank-Up sau khi giải local còn một người sống. Ghost/bot không tính là human.
- Solo giữ hành vi cũ: xác nhận Forfeit & Exit hoặc thoát ngay sau elimination;
  đóng run đã trả thưởng xóa checkpoint để lần vào sau bắt đầu mới Stage 1-1.
- Không thể chặn người dùng đóng trình duyệt bằng source web. Group run có cảnh báo
  beforeunload và checkpoint; quay lại phải Resume thay vì ghi đè bằng run mới.
- Hạn chót Stage 100-6 ngăn vòng hòa vô tận: xếp người còn sống theo HP, tổng damage,
  level rồi seeded tie-break; chốt một champion, không tạo Stage 101 không hợp lệ.
- Elo, VNĐ và main-account receipt được lưu chung; item receipt riêng idempotent.
  Khi một bước lưu lỗi, retry không nhân đôi items/Elo/tiền. Currency multiplier
  quote giữ nguyên; chỉ quote Elo được cập nhật nếu rating tài khoản đã đổi.
- Giữ nguyên các guard passive/descriptor/damage re-entry của patch trước. Combat
  objects, copied skills, Relic rolls và telemetry không ghi vào inventory stats.
- Iron–Gold giữ nguyên quyết định draft/economy/position/equip/augment cũ; chỉ tên
  bot thay đổi. Khó AI được chốt từ rank lúc tạo match, không đổi giữa run.
- Trận cũ có reward v1 đã đóng băng vẫn được thanh toán đúng EXP đã hứa; mọi reward
  mới dùng v2 không cấp Player EXP. Không thay đổi checksum/export/import của save.

THÔNG SỐ & CÔNG THỨC CHI TIẾT
1. SUPPORTER — Bronze / Silver / Gold / Prismatic
   Energy mỗi attack:       +3 / +6 / +9 / +12
   Chu kỳ mend:             7 / 6 / 5 / 5 attacks
   Heal thấp HP nhất:       20% / 40% / 60% / 100% ATK
   Shield cùng ally:        0 / 0 / 10% / 20% ATK

2. OVERTIME VÀ TIMEOUT
   Trước 30s: damage x1; healing/shielding x1.
   30s: damage x1.5; healing/shielding x0.5.
   Từ 30s tới 45s nội suy tuyến tính với t = (seconds - 30) / 15:
     damage = 1.5 + t; sustain = 0.5 - 0.3t.
   Từ 45s: damage x2.5; healing/shielding x0.2. Hết round ở 60s mô phỏng.
   Team HP% = tổng HP còn sống / tổng Max HP team; unit chết có HP bằng 0.
   Tie-break damage đếm HP thực mất, không overkill/shield absorption; bằng nữa hòa.
   Speed 1x/2x/3x thay tốc độ thời gian mô phỏng, không thay công thức này.

3. CLOUD RUN BUDGET / REPLAY
   - Budget đã thống nhất là 1 QUERY + 1 WRITE, không phải 1 billed document read.
     Query orderBy(updatedAt, desc).limit(8) có thể bị tính tới 8 document reads.
   - sessionStorage ac_ghost_pool_cache TTL 10 phút; cache hợp lệ dùng 0 query.
     Không có cache: tối đa một logical query lúc bắt đầu run, không retry vòng lặp.
   - Không read/write Firestore theo Planning/Combat round. Snapshot giữ trong RAM
     và checkpoint local: stageKey, HP, level, board, exact Relic rolls, synergies,
     augments. Mỗi lần PvP lấy snapshot mới nhất tại hoặc TRƯỚC stage cần xem.
   - Wire codec khử trùng card/relic/board/augment dictionaries, JSON tối đa 5,900
     UTF-8 bytes, chừa chỗ server timestamp dưới 6 KB. Nếu cần thì lấy mẫu bớt stage
     giữa, giữ stage đầu/cuối; snapshot thưa dùng nearest-past, không lấy future.
   - Chỉ run đã kết thúc, trả thưởng thành công và đạt Stage >= 2-1 mới publish
     một lần set vào autochess_runs/<uid>. Không-block UI, không readback/retry tự
     động khi lỗi. Ghi đè document của chính UID; offline vẫn giữ last run local.
   - Chống trùng UID, replay rỗng/sai schema; không phục hồi ghế đã bị loại. Khi
     recording hết dữ liệu dùng snapshot quá khứ gần nhất theo cùng quy tắc.
   - Leaderboard dùng query riêng orderBy(elo, desc).limit(50), chỉ khi bấm tại
     lobby, cache 10 phút. Trong match chỉ dùng cache hoặc recent-run sample có nhãn.
   - Budget trên thuộc run subsystem. Main-game cloud backup bình thường tạm dừng
     khi Auto Chess mở, rồi tiếp tục sau khi thoát; không tính chung với run upload.
   - Public run/Elo là dữ liệu client báo cáo. Rules kiểm tra UID/schema/quyền đọc,
     không xác minh chiến thắng bằng server simulation; leaderboard không phải hệ
     xếp hạng chống sửa client có server làm trọng tài.

4. ELO — BASE / DIVISIONS
   Iron 0; Bronze 400; Silver 800; Gold 1200; Platinum 1600; Emerald 2000;
   Diamond 2400: mỗi tier IV/III/II/I, mỗi division 100 Elo.
   Master 2800: III/II/I. Grandmaster 3100: II/I.
   Challenger 3300+: không division, tiếp tục tăng Elo.
   Icon: assets/items/iron.png, bronze.png, silver.png, gold.png, platinum.png,
   emerald.png, diamond.png, master.png, grandmaster.png, challenger.png.

   Placement                  1    2    3    4    5    6    7    8
   Iron–Gold                 +8   +5   +3   +1   -2   -4   -6   -8
   Platinum–Diamond          +6   +3   +1    0   -3   -5   -7   -9
   Master–Grandmaster        +5   +1   -2   -4   -6   -8  -10  -12
   Challenger                +5   -2   -4   -6   -8  -10  -11  -12
   Elo không âm. Delta hiển thị là phần thực nhận sau khi floor 0.
   Với đúng bảng này cần 500 trận 1st liên tiếp từ 0 tới 3300 (200 + 200 + 100),
   KHÔNG phải 550–650. Thời gian thực phụ thuộc Ready/speed/thời lượng mỗi trận;
   không cam kết đạt mốc sau đúng 7 ngày. Giữ bảng chính xác theo yêu cầu.

5. PLACEMENT REWARDS MỚI — VNĐ | STAR ORB | GEMS | ELO
   1: 25,000,000 | 150 | 500 | theo rank/placement table
   2: 15,000,000 | 100 | 300 | theo rank/placement table
   3:  9,000,000 |  60 | 200 | theo rank/placement table
   4:  5,000,000 |  40 | 120 | theo rank/placement table
   5:  2,500,000 |  20 |  60 | theo rank/placement table
   6–8: 750,000 |  10 |   0 | theo rank/placement table
   VNĐ = floor(base × active VND Multiplier).
   Star Orb = floor(base × active Drop Multiplier). Gems giữ base. Player EXP = 0.
   Elo lưu ở main save autochessRank, cùng match receipt chống nhận lại.

6. AI / GIỚI HẠN ECON GIỮ NGUYÊN
   AI mới chỉ áp dụng tier index >= 4 (Platinum). High policy bắt đầu Master.
   High Relic assignment tối đa tổng giá trị cho các unit deployed, chỉ dùng Relic
   có thật trong match, matching category/element và unique mechanics; không thêm
   các chỉ số AP/Armor/MR không tồn tại trong RelicSystem hiện tại.
   Không cộng lén Gold/stats. Card bonus tối đa +2g/round nằm trong cap bonus +16g.
   Base income/refund và các quy tắc fusion/craft còn lại của patch trước giữ nguyên.

HƯỚNG DẪN SỬ DỤNG
- PATCH ONLY: áp dụng trên bản Auto Chess Augments / Passive Audit gần nhất. Ghi đè
  các file trùng tên trong archive, thêm 5 module mới, giữ nguyên file khác/assets.
  Không xóa source cũ ngoài patch. Cập nhật index.html cùng lần rồi hard reload.
- 5 module mới: autochess_runs.js, autochess_online.js, autochess_lobby.js,
  autochess_ranked.js, autochess_ai.js. Thứ tự load trong index.html và Worker đã sửa.
- Source sửa: app.js, firebase.js, passives.js; autochess.js, autochess_augments.js,
  autochess_bots.js, autochess_combat.js, autochess_synergies.js,
  autochess_telemetry.js, autochess_view.js, autochess.css, index.html;
  firestore.rules, firestore.indexes.json; PASSIVE_AUDIT.txt, README.txt.
- Cloud: deploy firestore.rules và firestore.indexes.json đã sửa vào ĐÚNG Firebase
  project đang dùng. Patch không tự deploy hoặc thay Firebase credentials. Giữ
  các config/dependency hiện có; recent-runs/top-Elo cần authenticated Google/email.
- PeerJS dùng SDK/OnlineUtils peerOptions hiện có. Copy Room Code cho bạn; bạn dán
  Enter/Join, host START. Nếu signaling/offline lỗi, host vẫn chơi ngay bằng bot.
- Avatar/rank dùng các asset path hiện có; archive không chứa hoặc tạo ảnh thay thế.
- Kiểm tra đã chạy: Supporter đủ 4 tier, Overtime/60s timeout/tie; 217/217 passive
  endurance với fatal/status/shield probes; copy/reflect/summon deterministic;
  Worker/native outcome + telemetry parity; full matches Iron/Platinum/Challenger;
  120 seeded low-rank decision comparisons bằng bản cũ; smart drafting/equip/
  augment/model validation; Elo boundary/promotion/demotion/receipt/save-failure.
- Kiểm tra lobby: mô phỏng 8 Peer clients, từ chối khách thứ 9, shared seed và
  cleanup; cache/query/write budget qua adapter mock; run codec 598 stage; UID
  dedupe, friend recording upgrade; group spectator và final survivor; Stage cap.
- UI: desktop 1440×900, landscape 844×390/915×412, portrait rotation và viewport
  nhỏ 498×251; lobby/footer/HUD bounds, spectator scout, My Augments, Rank-Up,
  leaderboard và summary/exit. Không chạy production Firebase write hoặc test
  PeerJS xuyên NAT thật; cần kiểm tra lại hai trình duyệt/thiết bị sau deploy.
- Runtime test dùng Chromium headless/adapter mocks; không bảo đảm 60 FPS trên
  mọi Android/iOS. Archive chỉ source/config/docs thay đổi, không có assets,
  binary/media, test scripts, log, backup hay file trùng không cần thiết.
