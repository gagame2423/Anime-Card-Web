ANIME CARD RNG — AUTO CHESS PROFILE, RELIC ICONS & LEADERBOARD PATCH
Ngày: 16/11/2026 • Build: 20261116-autochess-profile-1
Changelog chỉ dành cho cập nhật này. Áp dụng trên bản strategy/planner/Rift trước.

TÍNH NĂNG MỚI
- Nút Rank pill ở góc phải lobby đổi thành Profile / Hồ Sơ, có rank icon hiện tại.
  Nút Elo Leaderboard bên cạnh vẫn mở bảng hạng riêng như trước.
- Profile dùng banner artwork do người chơi chọn từ toàn bộ Card Index. Nền có
  gradient tối trái/dưới; chưa chọn có nút + lớn. Change Banner mở selector có
  tìm tên/lọc rarity; chọn xong quay về Profile, có nút xóa về nền mặc định.
- Layout theo mockup: peak-rank box góc trái trên, username lớn + current rank/
  division/Elo bên cạnh, 6 card 3×2 ở trái dưới, lifetime stats có scrollbar bên
  phải, nút X đỏ góc phải. Bố cục co gọn cho landscape, xếp dọc khi portrait.
- Peak badge lấy rank cao nhất từ peakElo; giữ nguyên khi Elo giảm. Lưới Top 6
  đếm số match thực sự đã fielded card đó, không tính card chỉ mua rồi để bench.
  Các ô chưa có dữ liệu hiển thị placeholder, không tạo unit/asset mới.
- Lifetime: Matches Played, 1st-Place Wins, Top 1 Win Rate, Top 4 Finishes/Rate,
  Average Placement, Current/Peak Elo, Longest Win Streak, Favorite Synergies,
  3★ Units Fused, Total Damage Dealt và Total Gold Spent.

CÂN BẰNG & SỬA LỖI
- Carousel trước đó ẩn cả span bọc icon Relic. Selector CSS được thu hẹp để chỉ
  ẩn text; cả 9 badge hiện đúng image. Hover/tap xem tooltip giàu thông tin;
  tap badge không nhận nhầm card. Badge vẫn inspect được khi chưa được thả draft.
- Stash bỏ absolute image offset/negative margin; wrapper và img được căn flex
  giữa, giữ trong slot. Hit area dùng vùng pseudo và cả button, không đẩy ảnh lệch.
  Tooltip tiếp tục pointer-events:none, hide debounce 100ms, remap theo Relic UID
  qua các lần HUD thay DOM. Element emblem và matching board/bench preview giữ lại.
- Leaderboard không cache []: cache rỗng cũ cũng bị vô hiệu. Ghost-pool rỗng cũng
  không khóa các run mới trong 10 phút. Cache có dữ liệu vẫn TTL 10 phút.
- Mỗi lần mở luôn merge dòng local hiện tại với remote/cached rows, kể cả 0 Elo.
  Thiếu wins -> 0; legacy thiếu Elo -> 0; thiếu uid trong data dùng document ID.
  Name legacy có displayName vẫn hiển thị. Local entry không bị cắt mất ngoài Top 50.
- Query chính orderBy('elo','desc'), limit(50). Query này loại doc thiếu elo: khi
  kết quả chưa đủ 50 hoặc lỗi index, leaderboard ngoài trận dùng một fallback
  collection.limit(50), merge theo uid. Lỗi permission hiển thị hướng dẫn rules,
  không giả thành một bảng hạng trống và không lưu cache lỗi.
- Run hoàn tất có thưởng đã lưu sẽ publish cả khi kết thúc ở Stage 1 hoặc 0 Elo;
  không còn điều kiện Stage >= 2. Run bỏ dở/X/F5 không có placement chính thức
  vẫn không cấp rewards/Elo, không cộng lifetime stats và không publish run.
- Firestore rules cho mọi user đã Firebase-authenticated get/list autochess_runs;
  list phải có limit <=50. Write vẫn chỉ UID owner Email/Google, kiểm schema,
  updatedAt == server time. Không mở public/unauthenticated write.
- Giữ nguyên luật combat, odds, stats/passives, Elo placement/strategy bonus,
  single-round Shop Lock, Solo combat forge, PeerJS/Ready/spectator và âm thanh
  countdown10s.mp3 ở mốc 10s của bản trước.

THÔNG SỐ & CÔNG THỨC CHI TIẾT
LƯU HỒ SƠ & CHỐNG CỘNG TRÙNG
- autochess_profile_stats là field authoritative trong main save. Module mới
  autochess_profile.js quản lý chuẩn hóa, migration và aggregate; app.js chỉ
  nối transaction save. LocalStorage cùng tên là mirror đọc được, không thay
  nguồn main save khi import/account restore. Banner dùng bannerCardId, tham
  chiếu image có sẵn của card; không lưu ảnh/base64 trong save hay Firestore.
- Stats, rank và receipt nhận thưởng commit cùng một lần saveGame(). Khi main
  save lỗi, rollback cả Elo và lifetime data; retry không đếm lại match/card/
  damage/Gold. Mirror lỗi không làm mất main save đã ghi. Main save đã bao gồm
  profile trong encrypted export/import và Cloud account backup hiện có.
- Receipt profile có hai bit: placement đã tính và telemetry đã tính. Receipt
  Elo cũ có thể seed placement trước, telemetry về sau chỉ bổ sung một lần.
  Giữ tối đa 10,000 receipt như rank store. Card usage giới hạn theo roster;
  favorite traits giữ roundsActive, không dùng dữ liệu mô phỏng của bot làm stats
  của người chơi. Live guest dùng đúng localPlayerId của mình.
- Returning players lấy Matches/Wins từ rank; Top4/Average từ receipt còn lưu.
  Nếu Matches cũ thiếu hoặc thấp hơn Wins/receipt, khởi tạo tối thiểu bằng số
  Wins/receipt đã biết; không khôi phục được những match chưa từng lưu.
  Không đoán damage, Gold hoặc card usage trước khi chúng được ghi. Khi không
  đủ lịch sử, Top4 có dấu ≥, Average dùng known matches; Profile có chú thích.
- Top 1 rate = wins/matches ×100. Top 4 rate = top4/matches ×100; lịch sử thiếu
  thì đó là cận dưới. Average = placementTotal/placementSamples, một số lẻ.
- Highest rank = rankOf(max(current Elo, peakElo đã lưu, before/after của receipt)).
  Peak được lưu cùng rank và profile, không giảm khi thua hoặc đổi banner.
- 3★ Units Fused đếm sự kiện unit vừa đạt fusionDepth ==2. Đây là lịch sử ghép
  hai bậc của rarity fusion đang có; không đổi game sang luật 3 bản sao cùng tên,
  không thêm stat multiplier và không đếm lại unit khi nâng tiếp depth 3–5.

PUBLIC RUN DOCUMENT
- Một set cuối run tới autochess_runs/{uid}: elo/wins luôn là số nguyên >=0,
  rank là index tier 0..9, tier là id lowercase (iron…challenger), division là
  IV/III/II/I hoặc chuỗi rỗng ở Challenger; avatar là assets/items/<tier>.png.
  name, placement, updatedAt và replay codec vẫn giữ; thêm bannerCardId (hoặc
  null), peakElo và peakRank. Không dùng placement thay cho rank tier.
- Banner và peak metadata piggyback vào lần ghi run hoàn tất kế tiếp; đổi banner
  lưu local/main ngay, không tạo thêm write giữa trận. Public rows cũ được hiển
  thị bằng fallback; lần publish tiếp theo của từng người sửa schema của họ.
- Payload encode vẫn <=5,900 byte, doc sau thêm timestamp <6KB; khi cần vẫn
  thinning stage snapshots, giữ stage đầu/cuối. Codec cũ không có metadata vẫn đọc.
- Mỗi match vẫn tối đa 1 recentRuns query đầu run (cache hợp lệ ->0) +1 own-run
  write cuối run, không query/write theo round. Leaderboard global là thao tác
  explicit NGOÀI TRẬN, tối đa query chính + một bounded legacy fallback; trong
  trận chỉ dùng cache/local. Không có listeners/transactions mới cho public runs.

HƯỚNG DẪN SỬ DỤNG & KIỂM TRA
1. Chép đè các file trong patch lên bản autochess-strategy-planner-rift-patch;
   thêm autochess_profile.js. index.html đã đăng ký đúng thứ tự và tăng cache tag.
2. TRIỂN KHAI firestore.rules trong Firebase project đang dùng. Source patch
   không tự thay rules production. Nếu vẫn dùng rules cũ, write có metadata mới
   có thể bị từ chối. Đăng nhập Email/Google và online lúc hoàn tất match để có
   public document; local/offline vẫn có Profile và local leaderboard entry.
3. Mở Auto Chess -> Profile. Bấm +/Change Banner, chọn artwork; ESC/backdrop/X
   đóng modal, ESC trong selector quay về Profile. Thay banner chỉ là lựa chọn
   giao diện, không đổi odds, roster, card inventory, Relic hoặc combat stats.
4. Leaderboard luôn có dòng local; lần đọc remote rỗng không được cache. Nếu
   chưa có public doc, người chơi cần hoàn tất một run online sau cập nhật.
5. Assets giữ nguyên trên máy của bạn: assets/cards/* và assets/items/<rank>.png.
   Không có assets/media, backup, test harness hoặc log trong archive.

ĐÃ KIỂM TRA
- Migration rank/peak/placement, usage đúng card fielded, fusions depth 2, duplicate
  receipts; account reward save-failure/retry/reload không cộng trùng lifetime/Elo.
- Leaderboard 0 Elo/legacy thiếu fields/local merge/empty-cache invalidation;
  Stage 1 hoàn tất publish đúng một lần với rank/avatar/peak metadata.
- Firebase adapter bằng SDK mock: doc ID, bounded query/fallback, owner UID,
  serverTimestamp và không ghi main Cloud trong thời gian Auto Chess hold.
- Browser UI ở 1440×900, 844×390, 915×412, 390×844, 498×251; banner selector,
  ESC, persistence, 6-slot layout, stats scroll, icon stash lệch tâm 0px.
- 9/9 carousel icons hiển thị, hover/tap rich tooltip không nhận nhầm draft.
- Native/Worker combat tương đương; 8 PeerJS clients mô phỏng cùng champion,
  mỗi người tối đa 1 Query +1 Write; Ready/scout/abandon và streak/strategy giữ đúng.
- Kiểm tra source/rules và adapter bằng mock không thay thế Firestore emulator
  hoặc xác minh rules production đã deploy. Test không đo FPS/NAT trên máy thật.
