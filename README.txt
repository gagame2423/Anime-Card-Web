ANIME CARD RNG — PENALTY TIMING REBALANCE
Bản cập nhật: 08/11/2026

- Green gốc giảm từ 18% xuống 6%. Accuracy tăng đều +0,24 điểm phần trăm
  mỗi cấp, đạt 18% ở cấp 50. Tolerance 0,1 điểm phần trăm mỗi cạnh được
  hiển thị trong vùng xanh: khoảng chấp nhận thực tế là 6,2% → 18,2%.
- Hai dải Yellow còn 6% mỗi bên. Red chiếm 81,8% khi chưa nâng cấp và
  69,8% ở Accuracy 50, luôn là phần lớn thanh. Shoot/Curve và cách thủ môn
  tính bàn thắng/pha cứu thua giữ nguyên; chỉ Green được báo TIMING HIT.
- Kim chạy qua lại ngay khi ngắm và tiếp tục khi giữ SHOOT. Giữ/hủy giữ
  không đặt lại vị trí kim. Nhả chuột/touch/Space chốt vị trí đúng timestamp
  của input, không lấy lại vị trí từ frame trước.
- Dùng elapsed time thực thay vì số frame; không cắt dt của kim ở 100ms.
  Needle speed 1,4 chiều dài thanh/giây, chu kỳ đi-về khoảng 1,43 giây.
  Pause/ẩn tab đóng băng kim, Resume không nhảy bù khoảng thời gian đã dừng.
- Kết quả khóa kim và hiện TIMING HIT / OFF CENTER / TIMING MISS, kèm viền
  xanh/vàng/đỏ; giữ popup kết quả sút bóng và save pending hiện có.

THAM SỐ CÓ THỂ CHỈNH — penalty_game.js / PenaltyGame.TIMING_CONFIG
- baseGreenZoneWidth: 0.06 (tỷ lệ chiều dài thanh; 0.06 = 6%).
- statScalingFactor: 0.0024 (phần chiều rộng cộng thêm mỗi cấp Accuracy).
- needleSpeed: 1.4 (chiều dài thanh/giây, không phụ thuộc FPS).
- hitDetectionTolerance: 0.001 (mỗi cạnh; đã tính vào vùng xanh hiển thị).
- yellowZoneWidth: 0.06 mỗi bên; maxGreenZoneWidth: 0.24 làm trần an toàn.
- Có thể đổi mặc định trong TIMING_CONFIG hoặc truyền timingConfig khi tạo
  PenaltyGame.create({ timingConfig: { needleSpeed: 1.6 } }). Các helper
  parameters/timingWindows/timing/evaluateShot dùng cùng cấu hình và bounds.
  Tham số không hợp lệ được đưa về mặc định hoặc giới hạn an toàn.

KIỂM TRA BẢN TIMING
- 39 kiểm tra Node: khoảng xanh/đỏ, mọi cấp Accuracy, biên hit/miss,
  5.000 shot RNG, save/reload/retry, thưởng và chống cấp trùng.
- Đối chiếu thời gian ở 5/30/60/144 FPS, dropped frame, Pause/Resume,
  kim chuyển động trước khi giữ và không reset khi giữ/hủy.
- Browser: dừng rAF rồi nhả tại timestamp định trước, xác nhận đúng vị trí
  và feedback xanh/vàng/đỏ; nâng Accuracy thật làm rộng vùng xanh đúng +0,24%.
- Desktop 1440px/mobile 390px: controls, Pause, upgrade, thoát về Arena,
  5 lần sút thật, session kế tiếp, cả 3 achievement và cloud snapshot key.
- Chạy lại: node tests/penalty_timing.test.cjs (chỉ dùng thư viện Node có sẵn).
- Các file mode/combat, thẻ, stat, phần thưởng, save schema, Firebase và
  TURN/STUN không thay đổi trong bản timing này. Ba sprite gốc giữ nguyên.
- Cache tag hiện tại: 20261108-penalty-timing-1. Giữ assets cũ, push GitHub
  và Ctrl+F5 sau khi thay source. Không cần reset hoặc migrate save.

Modified Files Note — bản Timing Rebalance
- penalty_game.js: cấu hình tập trung, bounds theo Accuracy, oscillator dt.
- penalty_view.js: input timestamp, kim liên tục và feedback theo kết quả.
- penalty.css: trạng thái hit/miss và marker, bố cục nhãn responsive.
- index.html: nhãn timing/Accuracy, meter accessibility và cache tag mới.
- tests/penalty_timing.test.cjs: kiểm tra engine/balance/save không dependency.
- README.txt: ghi chú cân bằng, tham số và cách kiểm tra.

======================================================================
CHANGELOG TRƯỚC ĐÓ — PENALTY KICK & BALLER CARDS
(Các ghi chú bên dưới mô tả tính năng đã có; bản Timing ở trên được ưu tiên.)
======================================================================

ANIME CARD RNG — PENALTY KICK & BALLER CARDS
Bản cập nhật: 08/11/2026

1. PENALTY KICK
- Vào Arena > Penalty Kick. Minigame riêng gồm đúng 5 cú sút mỗi session,
  không sửa chỉ số địch, phần thưởng hoặc luật của các mode chiến đấu cũ.
- Dùng ba ảnh người chơi cung cấp: goal_field.png, keeper.png, ball_spin.png
  trong assets/sprites/. Đã kèm đủ ba file trong gói, giữ nguyên ảnh gốc.
- Có 9 vùng ngắm. Chọn vùng rồi giữ HOLD TO SHOOT; nhả để chốt lực và sút.
  Bàn phím: 1–9 chọn vùng, giữ/nhả Space để sút, Escape để tạm dừng.
  Hỗ trợ Pointer Events và giữ/nhả trên màn hình cảm ứng.
- Thanh lực dao động liên tục: xanh = nhanh/chính xác, vàng = lực vừa và lệch
  nhẹ, đỏ = cú sút kém với 80% khả năng ra ngoài. Thủ môn chọn hướng khi nhả.
  Sai vùng = bàn thắng nếu bóng không ra ngoài; đúng vùng vẫn có thể bị vượt
  qua nhờ timing tốt và các nâng cấp Shoot/Curve/Accuracy.
- HUD: SCORE 0/5, lượt sút, Football Token, Sound, Pause, Exit, Stats Upgrade.
  Hiện PERFECT CORNER!, GREAT SHOT!, WEAK KICK! hoặc SAVED! theo kết quả.
- Ball atlas 8x8/64 frame, quay 24 fps, thu nhỏ từ 1 xuống 0,3 khi bay.
  Keeper dùng tọa độ cắt từng tư thế vì ảnh không phải lưới frame đều nhau.
  Nền trắng quanh keeper và nền đen quanh bóng được xử lý khi render/cache;
  ảnh pitch có bóng/HUD in sẵn được che bằng vùng cỏ để tránh hiển thị trùng.
- Chỉ có một vòng requestAnimationFrame khi minigame mở; đóng sẽ dừng vòng
  vẽ và đóng audio. Tab ẩn tự Pause; hủy thao tác chưa nhả không mất lượt.
  Ảnh được nạp khi mở lần đầu; xử lý ảnh chia theo batch và cache một lần.

2. FOOTBALL TOKEN, NÂNG CẤP VÀ SAVE
- Football Token là ví riêng; Storage cũng hiển thị số dư. Không dùng VNĐ,
  Raid Coin hay chỉ số combat làm chi phí nâng cấp.
- Shoot tăng tốc bóng; Curve tăng độ cong ở góc và giảm khả năng bắt bóng;
  Accuracy mở rộng vùng xanh. Mỗi chỉ số có tối đa 50 cấp.
- Do yêu cầu chưa ấn định giá/token/cấp tối đa, chọn mặc định có thể sửa tại
  PenaltyStatsSystem.CONFIG trong penalty_stats.js:
  + Mỗi cú sút hoàn tất: 2 Token; nếu ghi bàn thêm 8 Token.
  + Session 5/5: thêm 50 Token; tổng session 5/5 = 100 Token.
  + Giá nâng cấp: round(25 * 1.12^cấp_hiện_tại), tối đa cấp 50.
- Save riêng anime_card_rng_penalty_v1, được thêm vào snapshot cloud hiện có.
  Startup local-first, Firebase, Google Auth và TURN/STUN giữ nguyên.
- Chốt kết quả RNG trước khi bóng bay. Kết quả đang chờ được lưu, phục hồi
  đúng kết quả khi mở lại; lỗi ghi dữ liệu có Retry, không quay RNG lại hoặc
  cộng Token hai lần. Mua nâng cấp lỗi lưu sẽ hoàn tác Token và cấp.
- Khi minigame đang mở, chặn hotkey/roll phía sau; thoát quay lại Arena.
  Nâng cấp Penalty không thay đổi HP, ATK, cấp thẻ hoặc tỷ lệ gacha.

3. PENALTY ACHIEVEMENTS
- Thêm nhóm Penalty Achievements trong Achievements, cập nhật tiến độ từ
  save Penalty. Phần thưởng tự cấp đúng một lần khi đạt điều kiện.
- Predator's Eye: 5.000 session đạt 5/5, nhận 1 Michael Kaiser.
- Egoist's Metavision: Accuracy đạt cấp tối đa 50, nhận 1 Isagi Yoichi.
- Ace Eater's Territory: tổng 5.000 bàn vào Top-Left hoặc Top-Right,
  nhận 1 Don Lorenzo; các góc dưới không tính vào mục tiêu này.
- Sau khi achievement hoàn tất, thẻ tương ứng cũng được mở khóa trong pool
  roll thường theo tỷ lệ đã yêu cầu. Trước đó bị khóa bởi unlockRequirement.

4. BA SECRET CARDS MỚI
- Michael Kaiser: Holy, 1/15.000.000, HP 57.700 / ATK 22.000.
  Predator Instinct: 60% bỏ lượt tấn công riêng và tích EyE, tối đa 4.
  Có EyE được giảm 20% sát thương; dùng hết EyE cho đòn 120/150/150/180%.
  2 EyE thêm 30% ATK xuyên khiên nếu mục tiêu có khiên; 3 EyE xuyên khiên;
  4 EyE bỏ qua giảm sát thương. Đòn đặc biệt vào mục tiêu đã dưới 10% HP sẽ
  Execute, bỏ qua hồi sinh/chống chết. Follow-up không tích hoặc tiêu EyE.
- Isagi Yoichi: Electric, 1/22.400.000, HP 66.600 / ATK 16.300.
  Metavision: đòn của đội và khi Isagi nhận sát thương tạo Read, tối đa 3
  trên từng địch. Mỗi Read tăng sát thương đội 5%, giảm sát thương từ địch
  đó 1%. Khi đủ 3 Read, đòn Isagi thành Direct Shot 150% ATK và bỏ qua 25%
  phần giảm sát thương của địch. Một đòn nhiều thành phần không cộng Read
  trùng cho cùng mục tiêu; follow-up độc lập vẫn được tính.
  Địch có 3 Read chết: hồi 15% Max HP của địch và +10% ATK gốc, tối đa 5 lần.
  Dưới 35% HP, đòn vào mục tiêu đã Read lan 50% sát thương sang một địch
  khác; splash không tự gọi lại chính nó. Lần đầu chạm ngưỡng được miễn
  Stun trong 2 lượt riêng. Nhiều Isagi dùng số Read cao nhất, không nhân aura.
- Don Lorenzo: Dark, 1/55.500.000, HP 142.000 / ATK 8.700.
  Ace Eater: chặn hộ 40% sát thương còn lại sau khiên/phòng thủ của đồng đội.
  Một hit chỉ có một Lorenzo chặn; sát thương chuyển hướng không chuyển
  tiếp, không tạo vòng lặp. Mỗi đòn nhận tăng Zombie, tối đa 10.
  Lượt riêng hồi đồng đội có HP hiện tại thấp nhất bằng 3% Max HP Lorenzo
  mỗi Zombie, không tiêu Zombie/HP. Đủ 10: đòn riêng kế tiếp đánh toàn địch
  bằng 50% tổng sát thương đã chặn từ đầu trận, rồi đưa Zombie về 0.
  Tổng sát thương đã chặn vẫn giữ cho các lần Counter sau.
- Thêm category Baller. HP/ATK của toàn bộ 197 thẻ có sẵn không đổi.
- Ảnh thẻ mới được tham chiếu: assets/cards/kaiser.png,
  assets/cards/isagi.png, assets/cards/lorenzo.png. Cần thêm các portrait này
  vào assets/cards/ khi triển khai nếu dự án chưa có; không tự tạo ảnh thay.

5. AUDIT LƯỢT PASSIVE
- turn_phase.js cung cấp activeAttacker, bộ đếm lượt riêng và once-per-turn
  theo từng battle/runtime độc lập; không chia sẻ bộ đếm giữa hai trận PvP.
- Itachi Awakened chỉ rút kỹ thuật, chuyển pool và giảm cooldown ở lượt
  tấn công riêng. Follow-up ngoài lượt không rút kỹ thuật hay giảm cooldown.
- Rà lại các form/pool/timer: Kagurabachi, The Mourner, War Hammer Titan,
  Pain, Toji, The Clown, Kuuga, Demon Asta, Mihawk, Doflamingo, Toshiro,
  Weather Report, Peashooter, Builderman, First Human và các timer liên quan.
- Kuuga đổi form mỗi 3 lượt tấn công riêng; +30% HP Purple chỉ tồn tại trong
  form đó, không cộng dồn vô hạn sau nhiều vòng. Demon Asta giữ nguyên form
  trong các đòn ngoài lượt. First Human giữ passive đủ 3 lượt riêng rồi mất.
- Những hiệu ứng có chủ đích ngoài lượt vẫn được giữ: support khi đồng đội
  đánh, dodge, nhận hit, khi chết, entry, aura, Domain và tick DoT toàn cục.
  Bộ đếm "mỗi hit/mỗi attack" vẫn tính hit đúng theo mô tả; không đánh đồng
  các sự kiện đó với thời gian chờ ở lượt riêng.
- PASSIVE_AUDIT.txt ghi danh sách đủ 200 thẻ, passive và phạm vi kiểm tra.
  Kiểm tra có seed và kiểm tra đích danh không thể chứng minh mọi tổ hợp
  mutation/relic/summon; báo cáo nêu rõ giới hạn này.

6. KIỂM TRA VÀ TRIỂN KHAI
- node --check: toàn bộ 83 file JS; JSON và các tham chiếu local trong HTML.
- 24 kiểm tra engine/save/upgrade: gồm 5.000 cú sút sinh ngẫu nhiên, session
  5 lượt, lỗi lưu, reload pending, Pause và không thưởng lặp.
- Combat: pool/cooldown Itachi, execute Kaiser, Read/Direct Shot/Growth,
  immunity, splash và chuyển sát thương Lorenzo; không có runtime error.
- 200 kịch bản combat có seed, tối đa 18 lượt mỗi thẻ; 12 kiểm tra thẻ đứng
  ngoài lượt và 26 kiểm tra thời điểm riêng cho các passive nhạy cảm.
- Desktop 1440px / mobile 390px: ảnh thật, đủ 9 vùng, không tràn trang,
  giữ/nhả sút, Pause/Resume, nâng cấp, hủy giữ phím, thoát về Arena.
- Kiểm tra 5 cú sút thật và 3 achievement tại ngưỡng; mở khóa/thưởng một lần.
- PvP: 139 bước đồng bộ ở 3 seed với thẻ mới/Itachi, snapshot hai bên khớp;
  không ghi save hay cấp phần thưởng PvP. Chưa kiểm tra hai thiết bị qua WAN.
- So sánh file gốc: logic/scaling Tower, Time Trial, Raid, Boss Event,
  Rift, Spooky, Infinity, PvP, enemy_stats, levels, relics, mutations,
  Firebase và online_utils giữ nguyên. Shared passive hooks sửa đúng phần
  audit và thêm Baller; không thay chỉ số địch/config của những mode đó.
- Giải nén source vào thư mục game, GIỮ nguyên assets cũ; gói kèm 3 sprite
  Penalty vừa cung cấp. Thêm portrait 3 thẻ nếu còn thiếu, push lên GitHub,
  rồi Ctrl+F5. Cache tag hiện tại: 20261108-penalty-timing-1.
- Không tạo Excel, không cần backend hay dịch vụ mới cho Penalty Kick.

Modified Files Note — bản Penalty Kick
File mới:
- penalty_stats.js — Token, nâng cấp, save session và pending shot.
- penalty_game.js — timing, AI thủ môn và state machine 5 lượt.
- penalty_sprites.js — ánh xạ atlas ảnh người chơi cung cấp.
- penalty_view.js — canvas, animation, input, modal nâng cấp và sound.
- penalty.css — giao diện Penalty responsive, style được giới hạn theo mode.
- turn_phase.js — context lượt riêng theo battle/runtime.
- baller_passives.js — logic passive ba thẻ Baller.
- PASSIVE_AUDIT.txt — phạm vi và danh sách 200 kịch bản audit.
- assets/sprites/keeper.png — ảnh thủ môn được cung cấp.
- assets/sprites/goal_field.png — ảnh sân được cung cấp.
- assets/sprites/ball_spin.png — atlas bóng được cung cấp.
File sửa:
- cards.js — 3 thẻ Baller và mô tả các passive có timer được chỉnh.
- category.js — category Baller.
- achievements.js — nhóm Penalty, tiến độ và 3 achievement tự cấp thưởng.
- passives.js — context lượt, audit, Baller hooks và các timer/form được sửa.
- akatsuki_passives.js — Itachi pool/cooldown và Pain own-turn gating.
- enten.js — rotation Kagurabachi chỉ chạy ở lượt riêng.
- mourner.js — ammo/reload/counter chỉ chạy ở lượt riêng.
- titan_passives.js — War Hammer form chỉ chạy ở lượt riêng.
- gomen.js — Toji chờ lượt riêng để đổi mode sau kill ngoài lượt.
- spooky_passives.js — The Clown dùng cùng quy tắc đổi mode.
- app.js — bridge mở/đóng, khóa input nền, snapshot/validate/reset save.
- storage.js — hiển thị ví Football Token.
- index.html — Arena entry, modal, HUD, script/CSS và cache tag mới.
- startup.js — kiểm tra dependency của các module mới.
- README.txt — ghi chú cập nhật và file tham chiếu.
