ANIME CARD RNG — AUTO CHESS: LIVE P2P & RICH RELIC INSPECTION
Ngày: 16/11/2026 • Build: 20261116-autochess-live-1

TÍNH NĂNG MỚI
- Phòng 1 human giữ Solo hybrid hiện tại. Phòng 2–8 humans tự chuyển Live P2P:
  một match ID, một timeline, một bộ pairings/HP/placement và một Champion chung.
- PeerJS giữ kết nối từ lobby tới cuối trận. Không trao đổi board code thủ công.
  Host xử lý thao tác mua, fusion, vị trí, Relic và Augment bằng model hiện có;
  client gửi intent theo số thứ tự, không được gửi stats/Gold tự sửa để ghi đè.
- Nút Sẵn sàng (X/Y) bật/tắt cho các human còn sống và còn kết nối. Combat bắt
  đầu khi tất cả đã Ready hoặc countdown của host hết. Solo vẫn Start Battle Now.
- Live scouting dùng board/bench/Relic/Augment thực của từng ghế, tự cập nhật qua
  PeerJS. Trước combat có lock barrier: flush intent, gửi snapshot cuối của từng
  client, rồi host phát manifest với snapshot chuẩn, pairings và deterministic seed.
- Mỗi client mô phỏng cùng chiều A/B, đúng vị trí, card definitions, rolled Relics,
  Augments và seed. Kết quả của host là chuẩn cuối cùng, không nhận client tự khai
  thắng/thua. Standings và kết quả round được host phát cho tất cả người chơi.
- Human bị loại được Spectator tới Champion chung; không Forfeit/Exit sớm. Khách
  mất kết nối chuyển sang AI dùng board gần nhất; không còn nằm trong Ready gate.
- Rich Relic tooltip hỗ trợ hover, focus bàn phím và tap, cả stash, Relic đang
  equip trên board/bench, scout opponent và carousel. Tooltip có rolled stats
  chính xác, tier/Unique, passive đầy đủ, icon Element thật từ ElementSystem,
  Category badge và mini portraits các thẻ phù hợp trên board + bench của bạn.
- Tooltip tự đổi phía/clamp trong viewport; ESC, nút X hoặc tap ngoài để đóng.
  Nếu không có thẻ phù hợp, hiện No matching units in team. Kể cả khi scout,
  danh sách matching luôn lấy team của chính bạn. Forge Augment không có roll
  cụ thể trước khi chọn; Relic đã được cấp dùng cùng resolver như stash/loot.

CÂN BẰNG & SỬA LỖI
- Giữ nguyên Supporter 3/6/9/12 Energy, mend 7/6/5/5 attacks, heal
  20/40/60/100% ATK và shield 0/0/10/20% ATK.
- Giữ Overtime 30s–45s, timeout 60s, HP%/actual-damage tie-break và true draw.
  Giữ My Augments, 10-tier Elo, rank-up, leaderboard và các cap chống lạm phát.
- Low-rank bot logic không đổi; Platinum–Challenger vẫn dùng policy hiện có.
  Human là ghế riêng, không bị bot lập kế hoạch/equip hoặc chọn Augment thay,
  trừ trường hợp timeout hoặc mất kết nối theo quy tắc trên.
- Không dùng ID cố định human để xác định người đang xem: guest được ánh xạ đúng
  vào ghế bot0…bot6 trong model chung. Shop, thao tác, báo cáo, reward/Elo và
  recorded run đều lấy ghế local tương ứng, không nhận nhầm thưởng của host.
- Live clock nằm ngoài dialog/RAF của view: mở Help/Inspect/Augments không pause
  trận chung. Combat live dùng tốc độ chung 1x; 1x/2x/3x vẫn giữ trong Solo.
- Snapshot large được chia mảnh có sequence/size/expiry guards. Client bỏ state
  cũ, intent sai phase/stage hoặc trùng seq. Không stack passive Proxy/listeners.
- Completed Live checkpoint đã có kết quả vẫn retry reward offline, không cần
  kết nối lại Peer; pending claim không cộng trùng Elo/vật phẩm sau lỗi lưu.
- Receipt upload thêm UID vì mọi human trong Live có cùng match ID; mỗi người
  chỉ publish document của mình một lần. Main/item reward receipts giữ nguyên.

THÔNG SỐ & CÔNG THỨC CHI TIẾT
- Host authority loop: 50ms; clock/Ready pulse: 250ms; planning state push tối đa
  khoảng 1s khi idle, cập nhật thao tác được gộp tối thiểu 100ms. Client không tự
  nhảy stage hoặc tự settle round; mọi chuyển phase đến từ host.
- Lock barrier tối đa 3s. Khách không ACK chuyển AI, nên không làm phòng kẹt.
  Các intent được gửi qua reliable ordered channel trước ACK. Snapshot client
  chứa units/positions/rarity/Relic rolls, level, HP, Augments và active Synergies;
  host dùng state được tạo từ những intent hợp lệ để chống ghi đè stats tùy ý.
- Combat manifest được phát với thời điểm bắt đầu trễ 600ms. Visual simulation
  của khách bám simulation-time pulse của host; mạng/CPU yếu có thể trễ hình ảnh,
  nhưng HP/standings/chuyển stage vẫn theo host. Không cam kết frame đồng thời
  tuyệt đối trên mọi mạng hoặc mọi thiết bị.
- Watchdog không phản hồi 10s: đánh dấu khách disconnected và cho AI tiếp quản.
  Không có host migration ở patch này. Host phải giữ tab/máy hoạt động tới cuối
  trận; nếu host rớt hẳn, khách dừng chờ và không tự chế Champion/Elo. Reload không
  tái lập transport của một live run đã mất. Checkpoint được giữ lại; không biến
  run đó thành trận Solo độc lập hoặc cấp thưởng chưa có kết quả chuẩn.
- Payload P2P có giới hạn 2 MiB, fragment 14,000 ký tự, tối đa 160 mảnh, tối đa
  4 assembly đang chờ và timeout 5s. Planning push không lặp cả telemetry ledger;
  ledger đầy đủ đi kèm các mốc phase/settlement để Match Report nhất quán.
- Firestore giữ nguyên: tối đa 1 QUERY limit(8) ở lúc bắt đầu mỗi human run khi
  cache 10 phút không hợp lệ; cache hợp lệ dùng 0 query. Một query có thể tính
  nhiều document reads. Không có Firestore read/write theo round trong Live.
- Run snapshots ghi RAM/local, publish đúng 1 own-UID document khi đã kết thúc,
  trả thưởng và đạt Stage >= 2-1; wire <=5,900 bytes. Không retry/readback tự động.
  Elo leaderboard global vẫn chỉ query riêng khi bấm ngoài trận; trong trận cache.
- Host được tin cậy trong P2P; không có server xác minh chống host/client sửa mã.
  Rules cloud hiện có chỉ xác thực UID/schema như patch Ranked trước.
- Relic stats dùng exact roll, không roll lại khi inspect. Matching dùng category
  thực của card hoặc rolled Element. Enten còn cần follow-up passive cho phần
  follow-up chance; unique effects tuân thủ quy tắc RelicSystem hiện có.

HƯỚNG DẪN SỬ DỤNG
- PATCH ONLY: ghi đè trên bản autochess-ranked-hybrid-lobby-patch gần nhất.
  Thêm autochess_live.js và autochess_relic_view.js; cập nhật index.html cùng lúc.
  Các script dùng cache tag mới. Mọi người trong phòng cần hard reload bản mới.
- Không đổi Firebase config/rules/indexes ở update này. Giữ file và assets cũ.
  PeerJS SDK/OnlineUtils peerOptions và dịch vụ signaling hiện có được tái dùng.
- Mời bạn bằng Room Code như trước, host START. Từ 2 người trở lên là Live;
  các ghế trống dùng recorded runs từ cache hoặc rank-scaled AI, do host điều phối.
  Hãy hoàn thành/thoát run cũ trước khi lập phòng mới.
- Kiểm tra: Peer transport mô phỏng 2 và 8 clients; live purchase/position/scout;
  Ready gate, lock-in, Human-vs-Human seed/manifest, shared HP/placements, một
  Champion, Spectator và reward một lần cho 8 người. Backend mock ghi nhận
  8 query + 8 write tổng cho 8 humans, mỗi người đúng tối đa 1 + 1.
- Kiểm tra UI guest tại 844×390; tooltip tại 1440×900 và 844×390, Element icon,
  matching portraits, clamp, ESC và touch portrait rotation, Solo Forfeit/Exit; Supporter/Overtime/timeout;
  120 low-rank bot comparisons và native/Worker deterministic regression.
- Đây là Chromium headless + Peer/backend mocks, không phải kiểm tra production
  PeerJS qua NAT hoặc 60 FPS trên điện thoại thật. Sau khi upload source, thử
  một phòng ở hai trình duyệt/thiết bị; WebRTC có thể cần TURN theo mạng thực tế.
- Archive chỉ chứa source/tài liệu đã sửa và 2 module mới. Không có assets,
  media, backup, test scripts hoặc log.
