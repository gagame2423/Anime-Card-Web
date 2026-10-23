NHẬT KÝ CẬP NHẬT — FIREBASE CLOUD SAVE, LEADERBOARD VÀ ONLINE PVP
Ngày phát hành: 23/10/2026

1. TÀI KHOẢN VÀ CLOUD SAVE

Thêm module firebase.js cho dự án anime-card-web với đúng cấu hình được cung cấp. Firebase App, Auth và Firestore compat được ghim ở phiên bản 10.14.1; PeerJS được ghim ở 1.5.4. Các URL CDN được khai báo trực tiếp trong index.html. Bộ nạp online_utils.js tải chúng tuần tự khi cần, có giới hạn chờ, không bắt game offline phải đợi CDN để khởi động.

Các nút Import Save, Export Save và hộp thoại chuyển tệp đã được gỡ khỏi giao diện. Menu ... có mục ... Login để mở Cloud Account và mục Leaderboard để mở bảng xếp hạng.

Cloud Account hỗ trợ:
- Sign in with Google qua GoogleAuthProvider và signInWithPopup.
- Play as Guest bằng Anonymous Auth; nếu dịch vụ không truy cập được, tiến độ vẫn lưu local để tiếp tục chơi offline.
- Liên kết tài khoản Guest với Google để giữ UID khi Google chưa gắn với tài khoản khác. Nếu Google đã có tài khoản, game kiểm tra hai bản tiến độ trước khi đồng bộ.
- Sync Now / Retry, Sign Out, Reload Page, đặt tên hiển thị công khai và phục hồi bản local trước khi tải Cloud.

2. CẤU HÌNH BẮT BUỘC TRƯỚC KHI CHẠY ONLINE

Mã nguồn không tự thay đổi cấu hình quản trị Firebase. Chủ dự án cần thực hiện:

Bước 1: Mở Firebase Console của dự án anime-card-web. Trong Authentication → Sign-in method, bật Google và Anonymous; hoàn tất email hỗ trợ của Google nếu Console yêu cầu.

Bước 2: Trong Authentication → Settings → Authorized domains, thêm hostname của trang game. Với GitHub Pages, thêm dạng ten-tai-khoan.github.io; không thêm đường dẫn thư mục con vào hostname. Dùng HTTPS hoặc localhost cho Auth, Web Crypto và WebRTC.

Bước 3: Tạo Cloud Firestore database nếu dự án chưa có. Áp dụng firestore.rules và firestore.indexes.json đi kèm. Từ thư mục gốc của mã nguồn, sau khi Firebase CLI đã đăng nhập đúng quyền, có thể chạy:

firebase deploy --only firestore --project anime-card-web

firebase.json chỉ chứa cấu hình Rules/Indexes; lệnh này không triển khai hay thay đổi hosting của game. Các module HTML/JS/CSS vẫn có thể được đưa lên GitHub Pages như trước.

Bước 4: Mở trang đã triển khai, đăng nhập, kiểm tra trạng thái Cloud saved, thử tài khoản đó trên trình duyệt khác và thử kết nối PvP giữa hai thiết bị/mạng thực tế.

PeerJS cần truy cập CDN, dịch vụ signaling và WebRTC. Một số mạng cần máy chủ TURN riêng; khi đó cấu hình iceServers trong makePeer của pvp.js. Gói này không chứa thông tin đăng nhập TURN hoặc quyền quản trị Firebase.

3. MIGRATION, ĐỒNG BỘ VÀ PHỤC HỒI

Lần đầu đăng nhập một UID chưa có users/{uid}, game tự lấy toàn bộ save đã chuẩn hóa từ localStorage để tạo bản Cloud. Không đặt lại level, EXP, mutation, vật phẩm, tiến độ nhiệm vụ hay các chế độ trong quá trình migration. Auth không bị đưa vào payload tiến độ; mỗi thiết bị vẫn đăng nhập Firebase bằng phiên riêng.

Nếu tài khoản đã có save:
- Cùng tài khoản, bản local chưa thay đổi: khôi phục bản Cloud mới hơn khi cần.
- Local có thay đổi trên đúng revision đang lưu: đẩy thay đổi local lên Cloud.
- Hai bản cùng có thay đổi, hoặc local thuộc UID khác: hiện Choose your progress. Người chơi chọn Keep Local / Migrate hoặc Use Cloud Save. Không cộng gộp tiền, vật phẩm hay bản sao thẻ giữa hai save.
- Đăng nhập giữa trận không làm đổi đội hình đang đánh. Kiểm tra/migration tự tiếp tục sau khi hoạt động hiện tại kết thúc.

Các lần roll, tăng level, dùng/mua vật phẩm, hoàn thành màn, crafting/evolution, phần thưởng nhiệm vụ và thay đổi cài đặt đánh dấu save cần đồng bộ. Các thay đổi liên tiếp được gộp, thông thường tối đa một đợt nền mỗi 60 giây. Roll liên tục không dời hạn gửi mãi về sau. Sync Now chủ động gửi ngay. Khi lỗi mạng, khoảng thử lại tăng từ 5 giây tới tối đa 120 giây; local vẫn giữ tiến độ mới.

Tick chỉ cập nhật đồng hồ không tự gây một lần ghi Cloud mỗi giây. localStorage tiếp tục lưu tiến độ ngay tại thiết bị. Trạng thái Pending sync nghĩa là vẫn còn thay đổi đang chờ; có thể chọn Sync Now và đợi Cloud saved trước khi chuyển sang thiết bị khác.

Mỗi lần Cloud ghi dùng transaction và số revision tăng một đơn vị. Nếu thiết bị khác đã ghi revision mới, bản cũ không tự ghi đè. Game phát hiện cập nhật từ Cloud và yêu cầu đối chiếu lại. Nếu tab khác của cùng trình duyệt đổi tài khoản/revision, tab hiện tại dừng đồng bộ và yêu cầu tải lại để tránh gửi bản đang giữ trong bộ nhớ.

Trước khi Cloud thay thế local, game lưu một bản phục hồi trong IndexedDB. Quá trình ghi nhiều kho local có journal và rollback. Nếu trang đóng giữa bước ghi, journal được phục hồi trước khi các module đọc save. Mục Restore Previous Local Copy trả lại bản local đã giữ, đồng thời đăng xuất để không tự đẩy nhầm sang tài khoản đang dùng.

Định dạng lưu:
- users/{uid}: revision, checksum SHA-256, metadata tổng hợp và payload bảo vệ hoặc manifest.
- Payload giữ cơ chế đóng gói Base64 + kiểm tra toàn vẹn của save hiện tại. Base64 không phải mã hóa bí mật; quyền truy cập Cloud dựa trên Firebase Auth và Firestore Rules.
- Payload nhỏ được lưu trực tiếp khi không vượt 600.000 byte.
- Payload lớn chia thành các phần tối đa 120.000 ký tự tại users/{uid}/snapshots/{snapshotId}/chunks/{index}; chỉ công bố manifest sau khi các phần đã ghi xong.
- Kiểm tra hash, kích thước và schema của mọi kho trước khi áp dụng. Giới hạn payload Cloud 16 MiB; giới hạn dữ liệu game thô 10 MiB được giữ từ bộ kiểm tra save hiện có.
- users/{uid}/recovery/previous giữ bản Cloud liền trước. Việc dọn các phần cũ được thực hiện khi có thể, không sửa bản đang được tham chiếu.

Rules chỉ cho chủ UID đọc/ghi save riêng. Người khác không được liệt kê collection users hoặc đọc payload của UID khác. Các bản ghi công khai được tách sang collection leaderboards. Indexes bỏ lập chỉ mục cho chuỗi payload/text lớn.

4. GLOBAL LEADERBOARD

Leaderboard hiển thị tối đa Top 50, có ba tiêu chí:
- Total Rolls.
- Strongest Card Power.
- Normal Time Trial Room cao nhất.

Strongest Card Power = giá trị lớn nhất của HP + 2 x ATK trong các biến thể đang sở hữu, có áp dụng level và mutation; không lấy buff tạm trong trận. Khi hai mutation có chỉ số khác nhau, so sánh tất cả biến thể thay vì chỉ chọn mutation hiếm nhất.

Bảng công khai chỉ chứa UID, tên hiển thị, các chỉ số tổng hợp, revision và thời điểm cập nhật. Không công khai toàn bộ save, tiền, kho vật phẩm hay email. Tên dùng textContent và bị giới hạn độ dài. Mỗi lần truy vấn có limit 50, cache giao diện 30 giây; Refresh chủ động tải lại.

Đây là bảng xếp hạng casual từ tiến độ do client gửi. Rules xác nhận quyền ghi đúng UID và khớp metadata với giao dịch save; chúng không thay thế máy chủ kiểm chứng toàn bộ lịch sử RNG/chơi game.

5. ONLINE PVP 1V1 VÀ 4V4

Vào Arena → Online PvP. Chọn 1v1 hoặc 4v4, Create Room rồi chia sẻ mã dạng PVP-A1B2C3. Người còn lại nhập mã ở Join Room. Mỗi phòng nhận hai người. Có thể dùng tiến độ local khi chơi Guest; không bắt buộc phải có Google để tạo kết nối PeerJS.

Chọn đội:
- Mỗi người chọn 1 hoặc 4 thẻ khác nhau từ bộ sưu tập của mình.
- Lock In / Ready khóa lựa chọn ngay, trước khi tính hash.
- Chỉ trao đổi commitment SHA-256 khi một bên Ready. Đội hình và nonce chỉ được gửi khi cả hai bên đã khóa.
- Hai bên kiểm tra reveal khớp commitment rồi mới hiện tên đội đối thủ. Không chấp nhận đổi lựa chọn sau Ready hoặc thẻ không tồn tại trong Index.

Cân bằng:
- Mọi thẻ xuất phát ở Level 1 và chỉ số gốc, Normal/no mutation.
- Không cộng level tài khoản, mutation, equipment, thời tiết hoặc potion vào PvP.
- Giữ nguyên nội tại chiến đấu, nguyên tố và các buff/debuff phát sinh hợp lệ trong trận. Aqua dùng nhánh +50% HP vì nhánh phần thưởng không có giá trị trong PvP.
- HP/ATK được mỗi trình duyệt dựng từ cards.js. Không nhận chỉ số HP/ATK tùy ý từ gói mạng.
- Bản cập nhật không sửa chỉ số thẻ, công thức EXP, nội tại, quy tắc summon hay cân bằng của các chế độ PvE hiện có.

Đồng bộ:
- Hai trình duyệt phải có cùng fingerprint dữ liệu thẻ và phiên bản PvP.
- RNG lấy từ nonce của cả hai bên và phiên phòng; bên đánh trước cũng được chọn từ RNG này.
- Chủ phòng điều phối thứ tự lượt. Người đến lượt có thể chọn Strike; sau 15 giây trận tự thực hiện đòn để tránh chờ vô hạn.
- Mỗi bước có số thứ tự và hash trạng thái, bao gồm RNG và trạng thái nội tại. Gói sai lượt, reveal sai, phiên khác hoặc trạng thái lệch sẽ dừng trận an toàn.
- Lệnh cũ đến muộn sau khi timer đã thực hiện lượt được bỏ qua, không gây lỗi đồng bộ giả.
- Đóng phòng, mất kết nối hoặc thiếu xác nhận sẽ dừng trận. Exit PvP trả về Arena, tiếp tục các vòng lặp thật theo thiết lập trước đó.
- Giới hạn riêng cho một trận PvP: 300 lượt hoặc hơn 400 đơn vị trên sân dẫn tới hòa để giữ trình duyệt ổn định. Đây không phải thay đổi giới hạn nội tại của các chế độ khác.

Không có EXP, VNĐ, coin, Bread, potion, key hay bất kỳ vật phẩm/phần thưởng nào. Không gọi hệ thống nhiệm vụ, achievement, thống kê thắng/thua hoặc ghi tiến độ từ trận PvP. Auto-roll và các vòng tiến độ thật tạm dừng khi giao diện PvP hoạt động. Bộ mô phỏng có trạng thái riêng, không dùng chung bộ runtime của PvE/Sandbox.

PvP là mô hình casual P2P, không có máy chủ chiến đấu có thẩm quyền. Bộ chọn đội chỉ cho thẻ đã sở hữu trên client; gói này không bổ sung máy chủ độc lập để kiểm chứng quyền sở hữu trước mọi client đã bị sửa mã.

6. KIỂM TRA ĐÃ THỰC HIỆN VÀ PHẠM VI

- Kiểm tra khởi động khi CDN không truy cập được: game offline vẫn hoạt động, không có lỗi JavaScript hoặc overlay lỗi hệ thống online gây chặn game.
- Kiểm tra migration bằng dịch vụ Auth/Firestore mô phỏng, bao gồm thẻ Level 157, mutation Wet, EXP, tiền và Bread; dữ liệu giữ đúng trên trình duyệt thứ hai.
- Kiểm tra Guest liên kết Google giữ UID, lỗi ghi mạng/local, retry, transaction revision, lựa chọn Local/Cloud, phục hồi bản local và tự tiếp tục migration sau hoạt động đang chạy.
- Kiểm tra payload khoảng 929 KB được chia thành 8 phần và ghép lại đúng SHA-256.
- Chạy 167 thẻ qua 2.556 lượt đối chiếu hai bộ mô phỏng cùng RNG, không phát hiện lệch trạng thái.
- Kiểm tra hai trình duyệt với kênh reliable mô phỏng theo giao diện PeerJS: blind pick, 1v1, 4v4, timer thật 15 giây, lệnh tới muộn và gói sai thứ tự. Dữ liệu save giữ nguyên trong PvP.
- Kiểm tra bố cục desktop, 390px và 320px.

Chưa xác nhận đăng nhập Google thật, đọc/ghi Firestore thật của dự án hoặc kết nối qua PeerServer ngoài Internet. Môi trường kiểm thử không tạo được ICE candidate cho kết nối WebRTC thực. Các bước kiểm tra trên dịch vụ thật phải thực hiện sau khi chủ dự án hoàn tất phần cấu hình ở mục 2. Không có thao tác ghi dữ liệu vào Firebase thật trong quá trình kiểm thử này.

7. MODIFIED FILES NOTE — GHI CHÚ TỆP THAY ĐỔI

- README.txt: Chỉ chứa changelog và hướng dẫn triển khai của bản cập nhật này.
- achievements.js: Thông báo khi dữ liệu achievement được lưu để xếp lịch đồng bộ; giữ nguyên logic mốc thưởng.
- app.js: Adapter Cloud/PvP, snapshot đầy đủ, áp dụng save có rollback, cách ly PvP, thay giao diện chuyển tệp và phối hợp tạm dừng/tiếp tục runtime.
- background.js: Đánh dấu đồng bộ khi thay đổi cài đặt nhạc/âm lượng.
- boss_event.js: Đánh dấu đồng bộ sau khi lưu dữ liệu Boss Event.
- drop_audio.js: Đánh dấu đồng bộ khi thay đổi SFX/âm lượng.
- equipment.js: Đánh dấu đồng bộ sau khi lưu equipment/crafting.
- firebase.js: Module mới: cấu hình dự án, Auth, migration, revision, Cloud Save, phục hồi và API leaderboard.
- firebase.json: Tệp mới: liên kết Rules/Indexes để triển khai Firestore bằng CLI.
- firestore.indexes.json: Tệp mới: miễn lập chỉ mục chuỗi payload/text lớn; không yêu cầu composite index cho ba bảng Top 50.
- firestore.rules: Tệp mới: quyền truy cập save riêng theo UID, kiểm tra schema/revision và metadata leaderboard.
- index.html: CDN được ghim phiên bản, Cloud Account, Leaderboard, PvP và điều hướng mới; gỡ nút/hộp thoại Import/Export.
- inventory.js: Đánh dấu đồng bộ sau khi lưu vật phẩm, potion và giao dịch kho.
- leaderboard.js: Module mới: giao diện Top 50, chọn tiêu chí, cache và Refresh.
- online_utils.js: Module mới: hash, nonce, serialization ổn định, giới hạn chờ và bộ nạp SDK không chặn offline.
- potion_hud.js: Đánh dấu đồng bộ khi đổi lựa chọn hiển thị HUD potion.
- pvp.js: Module mới: phòng PeerJS, chọn đội kín, khóa/reveal, giao thức lượt và UI kết quả.
- pvp_combat.js: Module mới: bộ chiến đấu PvP độc lập, chuẩn hóa Level 1, RNG và hash trạng thái.
- quests.js: Thông báo lưu hai hệ thống quest cho Cloud; toàn bộ logic nhiệm vụ tiếp tục nằm ở module này.
- raid.js: Đánh dấu đồng bộ sau khi lưu dữ liệu Raid.
- roll_view.js: Đánh dấu đồng bộ khi đổi Hide Rolling Card.
- settings.js: Đánh dấu đồng bộ khi đổi cài đặt game.
- spooky.js: Đánh dấu đồng bộ sau khi lưu Spooky Hunt/Shop/Capsule.
- startup.js: Kiểm tra module mới; lỗi CDN tùy chọn không bị coi là lỗi khởi động của game offline.
- styles.css: Bố cục Cloud Account, conflict, Leaderboard, PvP và responsive mobile.
- timetrial.js: Chỉ thêm thông báo lưu cho Cloud, không đổi EXP hay thời gian lượt.
- tower.js: Đánh dấu đồng bộ sau khi lưu Tower; không đổi scaling hay đội địch bị khóa.

8. TỆP BÀN GIAO VÀ TÀI LIỆU KỸ THUẬT

Gói ZIP có đầy đủ nguồn game, README.txt và ba tệp cấu hình Firestore cần thiết. Không chứa Excel, test runner, log, ảnh hoặc âm thanh. Các asset hiện có vẫn do người quản lý dự án cung cấp.

Tài liệu chính thức dùng cho phần tích hợp mới:
https://firebase.google.com/docs/web/alt-setup
https://firebase.google.com/docs/auth/web/google-signin
https://firebase.google.com/docs/auth/web/anonymous-auth
https://firebase.google.com/docs/firestore/manage-data/transactions
https://firebase.google.com/docs/firestore/security/rules-conditions
https://firebase.google.com/docs/firestore/quotas
https://peerjs.com/client/getting-started
https://peerjs.com/client/api/data-connection
