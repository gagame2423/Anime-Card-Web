ANIME CARD RNG — AUTO CHESS: FRESH LOBBY, ELO & COMBAT FORGE
Ngày: 16/11/2026 • Build: 20261116-autochess-qol-1

TÍNH NĂNG MỚI
- Bỏ hoàn toàn Resume Last Run và khôi phục trận đang chơi. Mỗi lần vào Auto Chess
  đều mở lobby 8 người mới, có thể START/Join ngay. Checkpoint đang chơi của bản cũ
  được xóa khi tải trang và khi tạo lobby.
- Solo combat cho phép Card Fusion trên bench hoặc 1 card deployed + 2 card bench
  cùng rarity. Kết quả cập nhật roster của bạn, giữ ô board của material deployed
  hoặc ô bench đầu tiên. Relic trên các materials trả vào stash/loot đúng một lần.
- Relic Fusion ngay trong stash khi combat Solo, tray cập nhật lập tức. Banner
  SOLO COMBAT FORGE nhắc rõ nâng cấp áp dụng cho roster sau trận; quân đang đánh
  vẫn dùng card/stats/Relic cũ cho tới hết round.
- Shop Lock giữ shop qua đúng một lần chuyển sang Planning rồi tự unlock.

CÂN BẰNG & SỬA LỖI
- Thoát bằng X/ESC, đóng tab, F5 hoặc mất kết nối P2P bỏ run đang chơi ở phía mình.
  Không còn cửa sổ xác nhận/Resume khóa đường vào lobby. Live peer rời phòng vẫn
  chuyển AI ở host, không còn tham gia Ready/lock gate; các người khác tiếp tục.
- Nếu host mất kết nối, guest bỏ run và tự về lobby, không chờ vô hạn và không tự
  chế kết quả. Không có host migration ở patch này. Solo offline vẫn chơi với bot;
  chỉ khi đóng/refresh/thoát mode thì bỏ run.
- Abandon một run chưa hoàn tất không cấp placement rewards, Elo hoặc run upload.
  Trận đã có kết quả hợp lệ vẫn có thưởng và Rank-Up như trước.
- Active run không được ghi vào localStorage nữa. Chỉ kết quả đã kết thúc nhưng
  chưa lưu thưởng thành công được giữ trong queue riêng; hệ thống tự thử lại khi
  tải app/mở mode, không khôi phục board/trận và không chặn START.
- Receipt Elo cũ vẫn được xác thực theo bảng cũ, bảo toàn Elo/wins/matches và
  encrypted save import. Quote/receipt mới dùng tableVersion 2 và bảng bên dưới.
- Fusion Solo không thay combat entities. Toàn bộ lineup/Relic/Augment dùng trong
  round được snapshot trước khi bắt đầu, kể cả các fight chưa được Worker tạo.
  Settlement giữ roster mới; telemetry và card/trait Gold dùng lineup thực đã đánh.
- Multi-Human không thể fusion giữa combat, kể cả qua intent P2P hoặc gọi trực tiếp
  model fusion helpers. Movement, buy/sell, XP, reroll, equip và unequip vẫn phải
  chờ Planning. Combat Solo chỉ thêm fusion/anvil/protect materials.
- Giữ Supporter, Overtime, fair 60s timeout, My Augments, rank thresholds/VFX,
  rank-scaled AI, currency multipliers và ngân sách Firestore của patch trước.

THÔNG SỐ & CÔNG THỨC CHI TIẾT
1. ELO MỚI — placement 1 → 8
   Iron–Silver (0–1199):      +25, +18, +12, +6, +4, +2, +1, +1
   Gold–Platinum (1200–1999): +18, +12, +7, +2, -5, -9, -13, -18
   Emerald–Diamond (2000–2799): +12, +7, +3, -1, -6, -10, -14, -18
   Master–Grandmaster (2800–3299): +8, +3, -3, -6, -9, -12, -15, -18
   Challenger (3300+):       +5, -3, -5, -8, -10, -13, -15, -18
   after = max(0, before + rule); delta hiển thị là phần thực tăng/giảm.
   Mốc tier/division và 100 Elo/division giữ nguyên. Rank-Up vẫn chạy khi tăng
   division hoặc tier; không reset rating cũ và không đổi receipt đã nhận trước đó.

2. SHOP LOCK
   Trong Planning, bật/tắt Lock tùy ý. Lần C.plan tiếp theo: nếu đang lock thì
   bỏ free shop refresh và đặt locked=false; lần Planning sau nữa refresh bình thường.
   Muốn giữ thêm round, bấm Lock lại. Carousel/Augment không tiêu thụ thêm một lock.

3. COMBAT FUSION
   Solo = không có live state và humanPlayers == 1 (save Solo cũ không có field
   này cũng xem là 1). Ba cards cùng rarity dưới Secret -> 1 card rarity cao hơn
   theo smart-weighted fusion cũ; không đổi thành công thức 3 bản sao cùng ID.
   Tối đa 1 material deployed + 2 bench; không gộp 2 deployed hoặc hơn trong combat.
   Không đụng HP/stun/shield/passive state/turn order của fight đang chạy.
   Bench-only result hiện ngay ở bench; result có deployed material sẽ xuất hiện
   trên board khi round kết thúc. Không tự trang bị lại Relic cho result.
   Relic Fusion giữ công thức 2 cùng tier -> tier cao hơn, 100% thành công trong
   Auto Chess; chỉ lấy Relic trong stash, không lấy trực tiếp Relic đang equip.

4. DỮ LIỆU & THƯỞNG
   Legacy key anime_card_rng_autochess_v1 không còn là recovery source.
   Queue anime_card_rng_ac_pending_results_v1 giữ tối đa 16 kết quả đã hoàn tất
   chưa trả thưởng. Kết quả thuộc UID khác không được tự credit cho tài khoản này.
   Main/item receipts vẫn chống cộng trùng sau lỗi lưu. Kết quả hoàn tất cũ trong
   legacy key được chuyển sang queue trước khi bỏ key; active checkpoints bị xóa.
   Queue không khôi phục một trận đang chơi và không mở Match Summary cũ. Nếu
   auto-retry làm lên rank thì hiện celebration ở lobby lần mở tiếp theo.
   Permanent main save, inventory, encrypted export/import và cooldown 7 ngày giữ nguyên.

5. CLOUD / P2P
   Không có thêm query/write trong round. Tối đa 1 recent-runs query ở đầu run khi
   cache 10 phút hết hạn, 1 own-UID write sau kết quả hoàn tất hợp lệ và Stage >= 2-1.
   Abandon không publish. Query limit(8) vẫn có thể bị tính nhiều document reads.
   Peer close/error đánh dấu AI ngay; watchdog 10s xử lý kết nối treo im lặng.
   Live countdown/Ready/pairings và shared Champion giữ như patch Live P2P trước.

HƯỚNG DẪN SỬ DỤNG
- PATCH ONLY, áp dụng lên autochess-live-p2p-relic-tooltip-patch gần nhất. Ghi đè
  các file có trong archive; giữ các source khác và assets hiện có.
- Cập nhật index.html cùng các module (cache tag 20261116-autochess-qol-1) và hard
  reload trên tất cả người tham gia phòng. Không cần đổi Firebase config/rules.
- Vào Auto Chess -> lobby mới. Thoát run là bỏ run, không có Resume. Trong combat
  Solo: mở card details -> Add to anvil hoặc kéo các materials vào tray -> Fuse.
  Có thể kéo 1 card đang đánh vào tray cùng 2 bench materials; unit đang đánh vẫn
  hiển thị dạng cũ tới hết round. Relic vẫn kéo/click hai ô cùng tier để fusion.
- Kiểm tra: 80 Elo boundary/placement cases, old receipt compatibility, tier bounds;
  lock consume-once/next refresh; bench/deployed combat fusion và Relic returns;
  frozen native combat, roster/telemetry sau settlement; Live combat fusion denial.
- UI tại 1440×900 và 844×390: combat anvil/tray, lock visual, X, fresh START, F5
  purge và không Resume. Mock Peer kiểm tra guest exit -> AI và host drop -> lobby.
  Pending reward qua reload: đúng Elo mới, EXP không đổi, item receipt không lặp,
  promotion một lần và lobby không bị chặn.
- Có kiểm tra hồi quy Worker/native, Supporter/Overtime và low-rank bot policies.
  Kiểm tra chạy Chromium headless và Peer/backend mocks, không phải kiểm tra NAT
  production hoặc cam kết 60 FPS trên mọi điện thoại.
- Archive chỉ chứa file source/tài liệu đã sửa. Không có assets/, media, test,
  log, backup hoặc file nguyên bản không thay đổi.
