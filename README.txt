AUTO CHESS — FRIEND-PLAY RECOVERY / GLOBAL ELO / WEEKLY ECONOMY
Ngày cập nhật: 17/11/2026
Build: 20261117-ac-friends-cloud-1

Changelog chỉ cho patch này. Gồm cả yêu cầu sửa Multiplayer / Cloud Elo và yêu
cầu bổ sung cân bằng Economy Augments + chuyển sang Weekly Rotation.
UI, thông báo, pool tags và mô tả Augment mới/sửa trong code đều bằng English.

1. FILE THAY ĐỔI & CÀI ĐẶT
=========================
Patch chỉ có 11 source file thay đổi và README.txt:
- autochess_online.js: PeerJS reconnect / token cho ghế, serializer, publish queue,
  chống gửi trùng kết quả, đồng bộ kết quả offline ở lobby.
- autochess_live.js: Ready intent nhỏ, lock-in mềm, presence grace, AI takeover
  tạm thời, trả quyền điều khiển và resync không kick người chơi.
- autochess_ranked.js: Global Elo UI, Refresh, loading/synced/offline states,
  cache theo UID, wins/matches, luôn ghép dữ liệu hiện tại của người chơi.
- autochess_runs.js: chuyển replay sang dạng Firestore chấp nhận, giải mã tương
  thích dữ liệu cũ, đo ngân sách cloud thực tế, thêm matches.
- firebase.js: adapter Cloud Firestore cho run/rating và đọc replay mới.
- firestore.rules: cho phép storageCodec/matches trong own-run schema.
- autochess_augments.js: nerf Economy, weekly-only metadata, pool gate và lịch.
- autochess_view.js: Ready khi reconnect, quản lý active-run, Gold Rush HUD,
  Weekly preview và mô tả interest mới.
- autochess_panels.js: Augment Codex có pool filter, trạng thái tuần và lịch.
- autochess.css: Refresh control, Gold Rush/pool badges, Codex filters responsive.
- index.html: cache version cho đúng các module/CSS thay đổi.

Cách cài:
1) Giải nén các source vào đúng thư mục game, ghi đè những file có trong patch.
2) Deploy firestore.rules mới lên đúng Firebase project của game. Có thể dùng
   Firebase Console > Firestore Database > Rules > Publish, hoặc quy trình
   Firebase CLI hiện có của dự án. Đây là bước deploy phía dự án của bạn;
   patch không tự deploy rules lên production.
3) Reload cả host lẫn guests sau khi upload đủ file. Protocol mới là ac-live-3;
   các client dùng build cũ cần reload trước khi lập room mới.
4) Vào lobby, đăng nhập Email/Google để dùng Global Elo và bấm Refresh.

Không có assets, ảnh, audio, binary, file backup, test script hay log trong ZIP.
Không sửa app.js, autochess.js, autochess_ai.js hoặc autochess_lobby.js: các hook
sẵn có đã đủ; phép tính interest/AI tự đọc effects và các lựa chọn từ pool mới.

2. TÍNH NĂNG MỚI — MULTIPLAYER RECOVERY
======================================
Ready / lock-in:
- Ready gửi intent nhỏ gồm sequence, stage, phase và trạng thái Ready mong muốn.
- Các thao tác khác chỉ gửi các trường cần thiết: UID của unit/Relic, slot/index,
  vị trí, lựa chọn Augment. Không gửi object DOM, card/passive runtime hay toàn
  bộ combat entities. Các trường thừa/circular không bị kéo theo action.
- Host vẫn là nguồn roster/economy/Relic rolls/pairings/RNG có thẩm quyền.
- Lock-in ACK không còn gửi lại toàn bộ units/synergies. Host dùng các thao tác
  đã nhận theo thứ tự để khóa roster chính xác; không tin stat của client.
- Cho ACK tối đa 6 giây. ACK trễ hoặc mất không kick người chơi và không tự đổi
  họ thành bot; round tiếp tục với roster host đã chấp nhận gần nhất.
- Intent đến muộn qua ranh giới phase/stage được bỏ qua và gửi lại state đúng.
  Snapshot không hợp lệ yêu cầu resync có throttle, không đóng data channel.

Presence / AI:
- Không còn cơ chế abandon/kick chỉ vì 10 giây không nhận packet.
- Probe presence theo nhịp 5 giây; chỉ AI takeover sau ít nhất 60 giây không có
  packet hợp lệ và ít nhất 3 missed probes. Có grace ngắn khi chuyển phase;
  grace này có giới hạn để ghế thực sự offline không chặn room mãi.
- Khi transport đóng tạm thời, ghế được đánh dấu reconnecting và bỏ khỏi tập
  người cần Ready/lock ACK. Không chờ vô hạn, không xóa đội hình của ghế đó.
- Khi đủ điều kiện takeover, AI dùng roster hiện tại; các người khác vẫn chơi.
- Reconnect dùng resume token ngẫu nhiên riêng cho ghế + matchId. Token chỉ gửi
  về chính guest, không nằm trong roster/state broadcast. UID đơn thuần không
  đủ để chiếm ghế của người khác.
- Khi channel mới được xác nhận, cùng UID/seat được trả lại quyền human ngay;
  bot=false, live-human source được khôi phục và host gửi canonical state.
- PeerJS signaling reconnect có backoff. Timers, subscriptions và connections
  của room được dọn khi thực sự thoát.
- Fragment reassembly có giới hạn bộ nhớ; packet tiến triển hợp lệ được tính
  là activity để không bị hiểu nhầm là disconnect giữa lúc chuyển state lớn.

Giới hạn cần biết:
- Auto-reclaim phục vụ kết nối gián đoạn khi trang/session hiện tại còn sống.
  Không thêm lại Resume Last Run sau F5/đóng tab. Rời trang chủ động vẫn bỏ run
  theo chính sách hiện có, lần mở sau vào lobby mới.
- Không có host migration. Nếu host mất mạng, guests chờ/reconnect trong session;
  nút Exit vẫn dùng được nếu người chơi muốn về lobby.
- Elimination/Spectator/shared Champion và combat deterministic vẫn giữ nguyên.

3. CÂN BẰNG & SỬA LỖI — GLOBAL CLOUD ELO
========================================
Nguyên nhân quan trọng đã sửa:
- Packed replay dùng nested arrays trong relics/boards/augments. Firestore
  Standard không cho array trực tiếp chứa array; dữ liệu này có thể làm own-run
  write bị từ chối trước khi Elo xuất hiện trên leaderboard.
- Cloud storage mới giữ codec local ac-run-1, thêm storageCodec=ac-flat-1 và lưu
  từng hàng tuple-table dưới dạng JSON string. Local/P2P vẫn dùng arrays gọn.
- Bảng cards và stage tuples vẫn giữ đúng ý nghĩa; decoder nhận cả storage cũ
  và mới. Snapshot được thin nếu cần, giữ đầu/cuối và đo bản cloud đã encode.
- Payload cloud trước server timestamp <=5900 UTF-8 bytes; decoder từ chối bản
  vượt giới hạn. Không mang undefined/DOM/runtime/circular objects lên cloud.

Pipeline:
- Collection vẫn là autochess_runs/{uid}; không tạo collection leaderboard thứ
  hai, không thêm write riêng mỗi round và không thêm transaction đọc-kèm-ghi.
- Document có uid, name, numeric elo (kể cả 0), rank, tier, division, avatar,
  wins, matches, matchId, placement, replay và server updatedAt.
- Kết quả chỉ được xuất bản sau khi reward/Elo đã được lưu thành công tại máy.
  Gửi absolute totals; không dùng increment() nên gửi lại không cộng Elo/games
  lần thứ hai. Receipt reward/rank trong save hiện có tiếp tục chống nhận trùng.
- Một job cho UID+matchId; lưu receipt cloud khi publish thành công. Hàng đợi
  offline giữ kết quả mới nhất. Lỗi ghi không bị đánh dấu nhầm là đã publish.
- Khi mở lobby / online trở lại / auth sẵn sàng, chỉ lúc không có active run mới
  thử publish kết quả còn chờ. Dữ liệu local cuối cùng từ build cũ có thể được
  publish lại theo dạng mới để sửa các run từng bị nested-array rejection.
  Đây là own-document overwrite idempotent, không trao lại thưởng hay tăng match.
- Chỉ account đang xác thực và đúng UID mới publish được document của UID đó.
  Rules khóa schema và kiểm tra numeric metadata/server timestamp/owner.
- Game vẫn dùng client-reported Elo như trước; đây không phải server anti-cheat
  xác minh mọi trận đấu.

Leaderboard:
- Query global orderBy(elo, desc), limit(50), source server.
- Legacy fallback có giới hạn để không bỏ sót document thiếu elo; entry đó hiện
  Iron IV / 0 Elo. Query phụ này chỉ dùng ở lobby, ngoài active match.
- Nút Refresh có loading/busy state, trạng thái Synced/Offline/Error rõ ràng.
  Nếu refresh lỗi, giữ các hàng cache thay vì xóa bảng.
- Cache theo UID trong sessionStorage, TTL 60 giây; thêm bản localStorage cuối
  cùng để fallback offline qua các lần mở trang. Không cache kết quả rỗng.
  Local player's current Elo/wins/matches luôn thay thế hàng của chính họ.
- Replay ghost samples không còn bị trộn vào kết quả global top 50 và gây sai
  thứ hạng do Elo cũ của sample.
- Trong active match, Refresh bị khóa và adapter không query leaderboard.

Ngân sách:
- Mỗi run: tối đa 1 recent-runs query limit 8 khi ghost cache 10 phút hết hạn;
  không có Firestore IO ở từng Planning/Combat round; một successful own-run
  publish tại kết thúc. Offline repair/retry thực hiện ở lobby, không trong round.
- Mỗi người thật publish document riêng của họ. Không dùng Firestore heartbeat,
  lobby listener hoặc round snapshot listener.
- Global leaderboard queries là thao tác xem riêng ngoài match; không tính là
  một nguồn đồng bộ gameplay. Một query có thể đọc nhiều document, không đồng
  nghĩa chỉ một billed document read.

4. THÔNG SỐ CHI TIẾT — ECONOMY REBALANCE
========================================
Interest / upfront Gold — đúng giá trị yêu cầu:
Tên (tier)                 Trước: Gold / cap         Mới: Gold / cap
Rainy Day Fund (Silver)     +6g / +6g tại 60g         +3g / +6g tại 60g
Rich Get Richer (Gold)      +9g / +7g tại 70g         +5g / +7g tại 70g
Hedge Fund (Prismatic)      +12g / +10g tại 100g       +8g / +9g tại 90g

Các trim bổ sung, thứ tự Silver / Gold / Prismatic:
- Pocket Change Gold: 12/14/16 -> 9/10/12.
- Trade Route upfront Gold: 2/4/6 -> 2/3/4.
  Free Refresh mỗi round: 1/2/3 -> 1/2/2.
- Ticket Booth / Trade Sector / Golden Ticket:
  Refund chance: 15%/25%/40% -> 12%/19%/30%.
  Free Refresh mỗi round: 1/2/3 -> 1/2/2.
- Efficient Study instant XP: 4/8/12 -> 3/6/9.
  Buy XP cost vẫn 3g; không stack xuống dưới 3g.
- Clear Mind / Focused Scholar / Perfect Clarity empty-bench XP:
  2/4/6 -> 2/3/4. Reserve vẫn được tính là bench không rỗng.
- Birthday Present / Gifted Scholar / Level Up! extra XP khi mua:
  1/2/4 -> 1/2/3.
  Quà mỗi future level: Rare/Epic/Legendary -> Rare/Rare/Epic.
  Vẫn một quà/level, an toàn khi bench đầy, không phát bù các level đã qua.

Vì các phần thưởng nguyên rất nhỏ, một vài mốc tier đầu được giữ nguyên;
những mốc đầu ra lớn/reroll proc được trim quanh 20–30%, hoặc một đơn vị gần
nhất. Không tạo fractional Gold hay fractional free refresh.

Cap không đổi:
- Tất cả bonus Gold cộng chung tối đa 16g mỗi round, gồm upfront payout,
  interest, refund và các bonus khác đang dùng C.bonus().
- Card-passive Gold tối đa 2g nằm bên trong cap 16g.
- Free refresh không refund; paid reroll chỉ có thể refund nếu cap còn >=2g.
- Free Refresh không tích lũy qua round. Interest cơ bản vẫn +5g tại 50g.
- Các effect không cộng dồn interest cap/free refresh theo kiểu nhân vô hạn.

5. WEEKLY ROTATION / GOLD RUSH / CODEX
======================================
- Cả 7 Economy families (21 definitions) chuyển thành weeklyRotation=true:
  pocket-change, trade-route, efficient-study, hedge-fund, golden-ticket,
  clear-mind, birthday-present.
- Default Pool có 72 definitions về Combat/Trait/Forge; không có Economy.
- Một chu kỳ 5 tuần ISO UTC gồm bốn signature rotations có sẵn và Gold Rush.
  Gold Rush mở 7 Economy families; các tuần khác không offer/reroll ra chúng.
- Chu kỳ dựa trên Monday timestamp của ISO week, không reset modulo theo năm.
  Week/rotation được chốt khi tạo match và host đồng bộ cho cả room.
- Chỉ featured family có weight 4x: trong Gold Rush là hedge-fund. Những family
  Economy còn lại có weight thường, không phải tất cả đều được nhân 4.
- Các ID cũ không đổi, nên selected Augments và ghost run cũ vẫn decode được.
  Chuyển pool chỉ kiểm soát lựa chọn mới; không xóa Augment đã sở hữu.
- Bot và player dùng chung pool()/draw()/reroll(). AI không có đường riêng để
  nhận Economy bị khóa tuần; chấm điểm luôn đọc effect value mới.
- HUD hiện tên rotation; Gold Rush có màu/tag riêng. Weekly preview liệt kê
  đầy đủ cả 7 families, tên/mô tả 3 tier và nguyên tắc weight.
- Codex có All pools / Default Pool / Weekly Rotation / Available This Match,
  badge Active This Match/Week hoặc Gold Rush Only, cùng lịch 5 tuần.
- Pool tags, lịch và mô tả mới đều English. Cache rotation nhỏ được dùng lại,
  không thêm network request hoặc per-frame RNG/evaluation nặng.

6. KIỂM TRA ĐÃ THỰC HIỆN
========================
- Syntax check các JS thay đổi; startup đầy đủ, 234 passive registrations,
  không thiếu card/passive và không có browser page errors.
- Shared Draft thật -> lấy unit+Relic -> deploy/buy -> Ready -> Combat.
  Intent bỏ trường circular dư; lock ACK nhỏ khoảng 115 bytes trong fixture.
- Bỏ lock ACK, cho deadline hết: combat vẫn bắt đầu, guest vẫn human.
- Mô phỏng >10 giây mất packet không takeover; >60 giây + nhiều missed probes
  mới AI. Nối channel mới trả lại đúng UID/seat/Relic; guest không bị abandon.
- Resume token sai không thể lấy ghế hoặc gửi action thay người khác.
- 8 human sessions: standings/Champion giống nhau, mỗi người nhận result một
  lần, mỗi người tối đa 1 start query + 1 finish write. Gold Rush state/owned
  Economy Augments được đồng bộ qua room.
- Firebase adapter chạy với strict mock từ chối nested arrays/undefined,
  kiểm tra owner UID, server timestamp, 0 Elo, matches và legacy entry.
- Cloud replay round-trip, dữ liệu dài đến Stage 100 với 11 unit board,
  thinning/size cap, duplicate finish và offline queue recovery.
- Global UI: loading/Refresh, không cache empty, cache không bị mất khi lỗi,
  local Elo up-to-date, không query trong match, vừa viewport 844x390.
- 5 rotations, 21 Economy weekly-only, 72 Default definitions, 700 bot picks,
  player rerolls, ISO year boundary và cap 16g; legacy selections vẫn áp dụng.
- Gold Rush HUD, 21 tier previews, Codex pool filters và active badges.

Các kiểm tra trên dùng local browser / simulated PeerJS network và strict
Firestore adapter mock. Không có production Firebase credentials/deployment
được sử dụng để thay rules hay xác nhận dữ liệu trên server thật. Sau deploy,
kiểm tra hai account thật trong lobby và bấm Global Elo Refresh để xác nhận
rules/project/auth của môi trường đang chạy.
