AUTO CHESS — LAST STAND / INFINITE 1 HP HOTFIX
Ngày cập nhật: 18/11/2026
Build: 20261118-ac-last-stand-1

Changelog chỉ cho hotfix này. Không gồm lại log các patch trước.
Mọi UI/log/tooltips được thêm hoặc chỉnh trong code đều bằng English.

1. CÂN BẰNG & SỬA LỖI — ROOT CAUSE
===================================
Nguyên nhân đã tái hiện:
- autochess_online.js nạp roster của recorded opponent trước mỗi trận và thay
  nguyên augmentState bằng {lastStandUsed: snapshot.lastStandUsed}.
- Nếu snapshot cũ được chọn lại bởi nearest-past lookup và có flag false,
  trạng thái đã dùng Last Stand trong match hiện tại bị xóa.
- Lần thua lethal tiếp theo lại kích hoạt Last Stand. Đối thủ vì vậy quay về
  1 HP liên tục, kể cả khi chỉ còn Top 2.
- Còn hai nhánh fallback trong finalize/settle gán HP=1 cho một người đã có
  rank 1 khi không còn người chưa xếp hạng sống. Các nhánh hồi sinh ngầm này
  cũng được bỏ để một kết quả 0 HP không bị đổi lại thành 1 HP.

Reproduction trước hotfix, cùng một recorded opponent ở Top 2:
Round 2-5: thua lethal -> 1 HP, rank null, match chưa kết thúc.
Round 3-1: thua lethal -> 1 HP, rank null, match chưa kết thúc.
Round 3-3: thua lethal -> 1 HP, rank null, match chưa kết thúc.

Sau hotfix:
Round 2-5: Last Stand dùng lần duy nhất -> 1 HP, spent flag true.
Round 3-1: thua lethal tiếp -> 0 HP, eliminated true, rank 2 được khóa;
người còn lại rank 1, phase complete, match kết thúc ngay.

2. TÍNH NĂNG MỚI — QUY TẮC TRẠNG THÁI BỀN VỮNG
================================================
Flag theo toàn bộ match:
- Mỗi player mới có lastStandUsed=false và eliminated=false.
- Khi Last Stand kích hoạt, lastStandUsed trên player được đặt true và vẫn
  phản chiếu sang augmentState.lastStandUsed để tương thích dữ liệu hiện có.
- lastStandSpent() nhận cả canonical flag, legacy flag và lastStandRound cũ.
- State merge dùng phép OR: một khi đã true thì snapshot false/thiếu flag
  không thể đặt lại false. Không dùng once-per-round counter.
- Rebuild augmentState, JSON clone, đổi round, đi away board hoặc reconnect
  không reset flag. Trận hoàn toàn mới mới tạo lại flag false.
- HP/ATK bonus sau Last Stand đọc cùng canonical trạng thái đã dùng, nên
  không mất bonus khi một snapshot cũ không chứa legacy mirror.

Damage / elimination:
- Tactician damage đi qua damageTactician(); HP giảm bằng max(0, HP - damage).
- Chỉ một lethal hit trên player còn sống, chưa xếp hạng và chưa dùng Last
  Stand mới có thể được cứu. Player đã eliminated/đã có placement không được
  hồi sinh bằng cách gọi lại passive.
- Sát thương bằng 0 không kích hoạt Last Stand.
- Lethal sau khi flag đã true đặt HP về 0 và eliminated=true.
- placeEliminated() khóa placement ngay trong batch settlement, trước bước
  income, theo thứ tự tie-break hiện có. Placement đã ghi không bị gán lại.
- Top 2 -> Top 1 hoàn tất ngay trong settlement; không mở thêm round để chờ.
- Trường hợp nhiều người cùng bị loại được chốt bằng placement tie-break,
  không âm thầm tạo thêm HP để hồi sinh một người đã chết.
- Stage limit và forfeit tiếp tục có luật cũ, đồng thời cập nhật eliminated.

Không có HP floor ở mức 1:
- Hai nhánh hồi HP=1 trong finalize và settle đã bị xóa.
- Chỗ duy nhất cấp 1 Tactician HP còn lại là Last Stand hợp lệ chưa dùng.
- Các Math.max(1, ...) cho số người, placement, range, denominator hoặc stat
  của unit không phải Tactician HP và không bị sửa nhầm.
- Relic/unit revive, unit HP, passive của card và tactical timeout khác với
  Tactician HP; không đổi các cơ chế combat đó.

3. ONLINE / REPLAY / CLOUD INTEGRITY
====================================
Recorded opponents:
- prepareRound() không còn thay toàn bộ augmentState từ replay.
- Giữ nguyên giftedLevels, XP/cooldown state và trạng thái đã dùng trong match.
- Snapshot HP chỉ có thể giảm HP hiện tại; 0 HP/rank/elimination không phục hồi.
- Một recorded opponent đã bị loại bị bỏ qua ở các lần prepare sau.

Live room:
- Host vẫn là nguồn có thẩm quyền cho damage, roster, placement và result.
- Clients vẫn chỉ gửi intents/ACK; không thể gửi HP để ghi đè HP trên host.
- Player flags là trường có thể JSON serialize, nằm trong state room broadcast.
- Khi nhận state, client merge spent flag, HP và elimination với trạng thái
  trước đó: không clear flag true, không nâng HP đã giảm và không đổi rank
  đã khóa. Không có thao tác reset flag trong bot takeover/reclaim.

Replay codec:
- record() dùng canonical spent state và giữ bằng chứng đã dùng từ các round
  trước. encode() chuẩn hóa flag theo thứ tự thời gian trước khi thinning.
- decode() đọc stages theo thứ tự stage/round, không phụ thuộc thứ tự key JSON.
  Sau một spent=true, các tuple 4 trường legacy ở round sau vẫn hiểu là đã dùng.
- Recorded HP cũng được chuẩn hóa không tăng theo thời gian; snapshot sau một
  recorded elimination không thể hồi lại HP từ 0 lên 1.
- Vẫn dùng optional integer thứ 5 trong stage tuple làm spent bit, tương thích
  tuple 4/5 trường cũ và storageCodec ac-flat-1 hiện tại.
- Giới hạn cloud payload 5900 bytes trước server timestamp giữ nguyên.
- Không thêm Firestore query/write, collection hay rule mới. Ngân sách run và
  pipeline Cloud Elo của patch trước giữ nguyên.

4. FILE THAY ĐỔI
================
Patch gồm 8 source file đã sửa và README.txt:
- autochess.js: canonical flags, merge guard, damage/elimination helpers,
  validation tương thích và bỏ finalize revival fallback.
- autochess_augments.js: Last Stand dùng match flag, legacy migration và
  permanent bonus đọc cùng trạng thái canonical.
- autochess_bots.js: round damage dùng helper chung, placement ngay sau lethal,
  bỏ settlement revival fallback. Không đổi bot drafting/economy policy.
- autochess_online.js: replay import giữ match state, không re-arm passive.
- autochess_live.js: normalize player flags và merge incoming state đơn điệu.
- autochess_runs.js: ghi/encode/decode spent flag + replay HP theo chronology.
- autochess_combat.js: cache version của imports trong combat Worker để không
  trộn core/augment/bot code cũ và mới; không đổi attack/passive damage formula.
- index.html: cache versions cho các JS thay đổi.

Không gửi lại Firebase/rules, UI/CSS, card data, AI hay file không đổi.
Không có assets, binary/media, file backup, test script hoặc temporary log.
Giữ nguyên các cập nhật reconnect/Global Elo/Weekly Economy đã phát hành.

5. HƯỚNG DẪN SỬ DỤNG
======================
1) Upload đủ các source có trong patch vào đúng thư mục game, ghi đè file cũ.
2) Reload tất cả host và guests trước khi lập room mới. Worker cũng cần tải
   core mới theo cache version 20261118-ac-last-stand-1.
3) Không cần xóa save, inventory, Elo hoặc run data đã lưu. Không thêm Resume
   Last Run và không thay cơ chế bỏ run khi đóng tab/F5.
4) Không cần deploy firestore.rules cho riêng hotfix này. Nếu chưa cài patch
   Global Elo/reconnect trước đó, vẫn cần cài patch đó trước hotfix này.

6. KIỂM TRA ĐÃ CHẠY
====================
- Reproduce nguyên nhân trên code cũ, rồi kiểm tra cùng chuỗi loss sau hotfix.
- Silver / Gold / Prismatic: một lần cứu; lethal thứ hai loại; qua JSON clone
  và reset legacy augmentState vẫn không re-arm.
- Legacy flag migration, lastStandRound evidence, fresh-match reset, damage 0,
  player đã eliminated không được cứu lại.
- Replay refresh không xóa các field khác của augmentState.
- Top-2 recorded opponent: 1 HP lần đầu, 0 HP/rank 2/complete lần sau.
- Cloud codec round-trip, optional spent bit, unsorted legacy stages và snapshot
  cố nâng HP sau 0 đều được chuẩn hóa đúng.
- Stale player merge không clear spent flag, không hồi HP hoặc đổi placement.
- 8 human sessions qua mocked PeerJS: hai combat thật; Prismatic Last Stand
  sống một lần, thua lần hai bị loại; cả 8 client thống nhất Champion và rank.
  Mỗi người nhận đúng một reward và một run write, 8 start queries tổng cộng.
  Guest final cloud replay giữ HP=0 và spent=true.
- Native/Worker combat cùng kết quả, telemetry streaming và dispose sạch.
- Full-match AI ở tier 4 và tier 8 hoàn tất, 8 placement riêng và cap hợp lệ.
- Startup: toàn bộ module nạp, 234 passive registrations, không browser errors.
- Syntax check tất cả JS thay đổi.

Đây là kiểm tra local browser, deterministic combat và mô phỏng transport/cloud;
không tự thay đổi Firebase production hoặc session của người chơi đang online.
