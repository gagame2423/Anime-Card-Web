ANIME CARD RNG — AUTO CHESS STRATEGY, PLANNER, AUDIO & RIFT PATCH
Ngày: 16/11/2026 • Build: 20261116-autochess-strategy-2

1. CÀI PATCH & PHẠM VI
Giải nén, chép đè các file cùng tên lên bản Auto Chess QoL trước đó
(autochess-fresh-lobby-elo-combat-fusion-patch). Thêm cả 3 module mới:
autochess_strategy.js, autochess_audio.js, autochess_panels.js.
index.html đã khai báo đúng thứ tự và tăng cache tag; hard refresh sau cập nhật.
Archive chỉ chứa source đã sửa/thêm và tài liệu cần thiết. Không có assets,
ảnh, MP3, backup, test harness hay log. Các đường dẫn assets dùng đồ có sẵn.

2. GAMEPLAY, ELO & UX
CHUỖI PvP
- winStreak/lossStreak riêng cho cả 8 tactician; thắng/thua reset chuỗi đối diện.
  Hòa giữ nguyên chuỗi, không tăng đếm, không phát thêm Relic. PvE không đổi chuỗi.
- 3/6/9/12… thắng liên tiếp: nhận đúng 1 Relic ngẫu nhiên trong match, không có
  bonus Gold theo win streak. Bonus +1g của một trận PvP thắng vẫn giữ nguyên.
- Tier Relic: Stage 1–2 Common 80% / Rare 20%; Stage 3–4 Common 50% / Rare 45% /
  Legendary 5%; Stage 5+ Common 20% / Rare 65% / Legendary 15%. Unique qua forge.
- Stash đầy: giữ nguyên item và stats trong loot chờ; loot 512 cũng đầy thì đưa
  vào hàng chờ streak riêng (bounded 200, đủ cho giới hạn match). Có chỗ thì drain
  vào stash. Không đổi thành Gold, không xóa item và không chuyển sang main relics.
- Loss streak 2–3: +1g; 4: +2g; 5+: +3g, trả đúng một lần ở Planning kế tiếp.
  Bonus này đi qua cap chung +16g/round; card passives tối đa +2g nằm trong cap.
  Base income và tiền refund bán unit tách khỏi cap. Không phát Gold win streak.
- HUD hiện W/L streak; người chơi được toast khi nhận Relic và khi item đang chờ.

TACTICAL STRATEGY BONUS (+0 ĐẾN +6 ELO)
- Dùng lineup thực đã bước vào combat: snapshot cuối cùng và snapshot có tổng điểm
  cao nhất được lưu trong telemetry. Không tính một board mới sắp sau trận, không
  cộng điểm tốt nhất của nhiều board khác nhau. Bản cũ chưa có evidence được +0.
- Cohesion 0–3: trait phải Silver+ và có ít nhất 3 card ID thật khác nhau, crest
  không thay thế điều kiện này. Coverage = tỷ lệ unit deployed góp vào trait đó.
  +1: >=3 card ID khác nhau và coverage >=60%.
  +2: coverage >=75%, có Gold+ với >=4 ID thật.
  +3: >=5 ID khác nhau, coverage >=85%, có Prismatic với >=5 ID thật HOẶC ít nhất
  2 trait Silver+ hợp lệ. Chỉ tính điều kiện khi board thực đã được triển khai.
- Itemization 0–2 dùng cùng relicValue/optimal assignment của smart AI: xét category,
  element, role, scaling, passive compatibility và hiệu quả so với cách gắn tối ưu
  các Relic đang equip trên board đó. Relic mismatch không được tính như đồ hợp lệ.
  +1: >=1 item hợp, hiệu quả >=60% tối ưu; +2: >=2 item hợp, >=75% item equip hợp,
  hiệu quả >=85%. Các Unique có hiệu ứng toàn cục thực sự được xét theo luật riêng.
- Fusion 0–1: có unit đã qua rarity fusion (fusionDepth >=1) trên board và góp vào
  trait Silver+ hợp lệ, đồng thời board có điểm cohesion. Đây là rarity fusion
  đang có của game (3 card cùng rarity -> rarity kế), không đổi sang luật 3 bản sao
  giống tên của TFT. Inventory và combat entity đang đánh vẫn tách riêng.
- Elo mới = max(0, Elo cũ + Base Placement Elo + Tactical Strategy Bonus).
  Bonus cộng trực tiếp 0–6, có thể bù một phần/toàn bộ Elo âm kể cả Challenger.
  Challenger chỉ hạng 1 có base dương; quy tắc bonus mới vẫn được cộng như yêu cầu.
- Summary tách Base Placement Elo, từng phần strategy và tổng thực tăng/giảm;
  +0 có gợi ý xây trait/gắn Relic. Không đổi thưởng VND/Star Orb/Gems hay multipliers.
  Không cấp Player EXP. Receipt mới tableVersion 3, vẫn đọc v1/v2; retry sau lỗi lưu
  giữ score đã chốt và không cộng lại tiền/item/Elo. Tăng tier/division vẫn dùng VFX cũ.
- Bảng base (hạng 1 -> 8) giữ nguyên bản QoL:
  Iron–Silver 0–1199:        +25,+18,+12,+6,+4,+2,+1,+1
  Gold–Platinum 1200–1999:   +18,+12,+7,+2,-5,-9,-13,-18
  Emerald–Diamond 2000–2799: +12,+7,+3,-1,-6,-10,-14,-18
  Master–Grandmaster 2800–3299: +8,+3,-3,-6,-9,-12,-15,-18
  Challenger 3300+:         +5,-3,-5,-8,-10,-13,-15,-18

PLANNER, TOOLTIP, HƯỚNG DẪN & PHÍM TẮT
- Thẻ Mục Tiêu nằm ngay dưới username của Host trong lobby. Lọc toàn bộ 217 card
  bằng tên, rarity/giá, category, element; chọn tối đa 8. Lưu localStorage key
  anime_card_rng_ac_targets_v1, không gửi Cloud/P2P, không làm tăng odds shop.
  Các card trúng target có glow và badge TARGET. Nút planner cạnh Shop Lock chỉnh
  được giữa match. Guide và Planner riêng không can thiệp roster hoặc RNG combat.
- Nút ? ở góc trên trái lobby mở 5 tab tiếng Việt: chỉ số/giao tranh, vòng/kinh tế,
  fusion/Relic/Lõi, Rank/Online và phím tắt. Có bảng XP/odds shop sinh từ model,
  danh mục Relic và toàn bộ trait/breakpoint. Mô tả Energy, Omnivamp, Crit, Attack
  Speed, DR, Shield theo engine thực. Armor/MR không phải 2 chỉ số độc lập bản này.
- Tooltip Relic và con cháu pointer-events:none; không cướp hover. Hide debounce
  100ms; remap icon theo UID khi HUD thay DOM, không reset nội dung khi không đổi.
  Hit zone tray/equipped được nới. Tap ghim; ESC/tap ngoài để đóng. Preview vẫn
  hiện exact roll, Element emblem và unit phù hợp trên board+bench của bạn.
- Space dùng primary round action đang hiện: Start Battle Now, Sẵn sàng/Ready hoặc
  Next Round. Không kích khi gõ input/textarea/select/contenteditable, IME,
  key repeat, modifier hoặc modal đang chặn. Không vô tình mua shop đang focus.
- X bán đúng unit bench của mình ở vị trí chuột hiện tại trong Planning, refund
  theo model chuẩn. Không bán deployed, board scout, trong combat hay lúc nhập chữ.
- Planner/guide pause timeline Solo; đồng hồ Live vẫn chạy. My Augments vẫn xem
  trong combat như cũ. Dialog có focus trap, backdrop/ESC/X và trả focus khi đóng.

3. ÂM THANH & RIFT
AUDIO — THƯ MỤC CHÍNH XÁC: assets/audio/
Đặt sẵn các MP3 sau tại đó; patch không cung cấp hay tạo các file âm thanh:
  Iron -> Bronze:            assets/audio/itob.mp3
  Bronze -> Silver:          assets/audio/btos.mp3
  Silver -> Gold:            assets/audio/stog.mp3
  Gold -> Platinum:          assets/audio/gtop.mp3
  Platinum -> Emerald:       assets/audio/ptoe.mp3
  Emerald -> Diamond:        assets/audio/etod.mp3
  Diamond -> Master:         assets/audio/dtom.mp3
  Master -> Grandmaster:     assets/audio/mtogm.mp3
  Fallback nếu mtogm lỗi:    assets/audio/mtog.mp3
  Grandmaster -> Challenger: assets/audio/gmtoc.mp3
  Cảnh báo countdown:        assets/audio/countdown10s.mp3
- Rank SFX chỉ khi tăng TIER, không khi chỉ lên division. Nhảy nhiều tier phát
  âm của tier đích. VFX vẫn có cho division như trước, receipt guard chống lặp.
- Countdown phát một lần cho match+stage-round khi còn >0 và <=10 giây, không
  phát lại theo frame/đổi phase. Áp dụng yêu cầu mới nhất: cảnh báo 10 giây. Timer
  có urgency pulse <=10s, tắt animation khi reduced motion.
- Dùng DropAudioSystem.enabled và .volume của Settings SFX hiện có. Chờ tương tác
  đầu tiên; play() reject, autoplay block hoặc thiếu file đều được catch an toàn.
  Rank audio ưu tiên hơn countdown. Đóng mode/pagehide dừng và bỏ audio cũ.

RIFT PREVIEW & REWARD POOLS
- Loại Rift được resolve theo key rõ ràng; key không hợp lệ bị từ chối, không
  fallback về Rumbling. Setup lấy rotation hiện tại; attempt giữ type lúc vào.
- Hueco: Dark, Ulquiorra 0.4%, Hakka Earing 0.1% (luôn 1 bản).
- Rumbling: Nature, Eren 0.5%, O.D.M. 5%.
- Preview, nút Enter, mode label, enemy lineup và reward resolver dùng cùng type.
  Khi giờ rotation đổi giữa trận, preview/result vẫn theo attempt đang chơi.
- Thắng vẫn nhận 1–5 Rift Shards trước normal drop multiplier; card nhận standard
  weather mutation roll. Special card/item/Relic không bị nhân số lượng. Guarantee
  vẫn chọn đúng một special theo trọng số riêng của Rift đó, không dùng pool khác.

4. TƯƠNG THÍCH & KIỂM TRA
- Giữ Supporter nerf, Overtime 30s/45s, timeout 60s so HP% rồi damage, My Augments,
  weekly Augment, rank-scaled bots, 7 tên bot, single-round Shop Lock và Solo combat
  future-roster forge. Không thay 217 định nghĩa card hoặc passive handlers.
- Giữ chính sách mới nhất: X/F5/thoát mode/mất peer thì bỏ run ở phía mình; không
  Resume. Peer rời Live chuyển AI không chặn Ready. Không kết thúc hộ toàn phòng.
  Người bị loại còn ở phòng có thể xem tới champion. Host rớt thì guest về lobby;
  chưa có host migration. Run bỏ dở không có placement/Elo/upload rewards.
- Firestore giữ tối đa 1 recent-runs query (cache 10 phút) +1 own-run write khi
  hoàn tất đủ điều kiện. Không thêm read/write trong round, Planner hay tooltip.
- Kiểm tra model: streak 3/6/9, loss timing/cap/draw/PvE/overflow; tactical 0–6,
  snapshot đã fielded, Elo v1/v2/v3, retry/reload chống trùng; cả hai Rift gồm
  rollover và mutation/multiplier; FakeAudio kiểm đủ file/fallback/mute/play reject.
- Kiểm tra browser: planner 217 card/bộ lọc/max8/persist/TARGET, 5 tab guide,
  tooltip hover qua HUD refresh, keyboard guards/refund, responsive/touch; regression
  Supporter/overtime, low-rank AI, native/Worker và PeerJS với transport mô phỏng.
- Kiểm tra audio ở mức dispatch/fallback/settings bằng mock; chưa nghe các MP3
  local của bạn. PeerJS NAT và FPS trên điện thoại thật không được xác nhận bằng
  test headless; không có cam kết mọi thiết bị đạt 60 FPS.
