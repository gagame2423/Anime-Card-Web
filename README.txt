NHẬT KÝ CẬP NHẬT — ĐĂNG NHẬP GOOGLE BẮT BUỘC VÀ SỬA KẾT NỐI PVP
Ngày cập nhật: 23/10/2026


BỔ SUNG — TURN METERED ASIA-EAST CHO PVP KHÁC MẠNG

- Đã thêm TURN Metered vùng asia-east qua cổng 80/443, UDP/TCP và TLS bên cạnh ba STUN Google hiện có; giữ debug: 1. TURN chuyển tiếp dữ liệu khi đường kết nối trực tiếp bị NAT/firewall chặn. Timeout kết nối và chờ ICE phục hồi tăng lên 20.000 ms.
- Sửa username và credential trong hằng TURN_SERVER ở đầu online_utils.js. Đã điền thông tin người dùng cung cấp; không cần dán lại mật khẩu. Nếu credential rỗng hoặc còn PASTE_YOUR_PASSWORD_HERE, game chỉ dùng STUN và ghi console.warn rõ ràng, không làm hỏng quá trình tạo Peer.
- Kiểm tra tại https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/ : thêm từng URI TURN trong TURN_SERVER cùng username/password, chọn Add Server rồi Gather candidates. Có thể chọn IceTransports = relay để kiểm tra relay. Kết quả cần xuất hiện Type = relay; chuỗi ICE tương ứng có “typ relay”. Nên thử từng URI trên cả hai mạng rồi thử kết nối PvP thực tế.
- CẢNH BÁO: credential nằm trong JavaScript phía trình duyệt nên công khai. Theo dõi mức sử dụng trong Metered dashboard và tạo lại credential nếu bị lạm dụng; sau đó cập nhật TURN_SERVER và triển khai lại. README không chứa mật khẩu thật.
- Tệp thay đổi trong bản bổ sung: online_utils.js (TURN và timeout 20 giây), index.html (toàn bộ cache tag thành 20261023-google-pvp-2), README.txt (hướng dẫn và ghi chú tương ứng). pvp.js được kiểm tra cú pháp, không chỉnh sửa; heartbeat và timeout băm lựa chọn vẫn giữ nhịp riêng 10 giây, không phải timeout kết nối.
- Cần làm thủ công: đẩy nguồn lên GitHub Pages; nhờ cả hai người chơi Ctrl+F5; kiểm tra relay và chơi thử từ hai mạng khác nhau. Không cần thay đổi Firebase hay giao diện.


1. ĐĂNG NHẬP GOOGLE NGAY KHI KHỞI ĐỘNG

- Thêm lớp đăng nhập toàn màn hình có duy nhất hành động chính Sign in with Google. Không có nút đóng, chơi khách hoặc tiếp tục offline. Phím Escape và thao tác bên ngoài không thể đóng lớp này; bàn phím không truy cập được các điều khiển game phía sau.
- Trước khi xác minh Google, chỉ nạp online_utils.js, firebase.js và startup.js. Ngay sau xác minh, đọc Cloud từ máy chủ trước khi thực thi module gameplay; sau đó nạp các module tuần tự theo đúng quan hệ phụ thuộc. Giao diện game vẫn bị khóa trong lúc khôi phục hoặc di chuyển save lên Cloud.
- Chỉ chấp nhận tài khoản không ẩn danh, có nhà cung cấp google.com và ID token được Firebase xác nhận đăng nhập bằng Google, còn hạn. Tài khoản khách hoặc đăng nhập bằng nhà cung cấp khác không được vào game.
- Khi mất mạng hoặc phiên xác thực hết hạn, khóa game, dừng auto roll, lịch auto continue, bộ đếm chiến đấu và mô phỏng PvP/Sandbox. Không ghi nhận chiến thắng hoặc thưởng do việc dừng phiên. Khi kết nối lại, xác minh tài khoản và đọc lại Cloud trước khi mở game.
- Lỗi popup bị chặn, người dùng đóng popup, tên miền chưa được cấp quyền và lỗi dịch vụ được xử lý thành thông báo có thể thử lại. Firebase SDK quản lý signInWithPopup; mã game không tự kiểm tra window.closed hoặc đọc cửa sổ khác nguồn.

2. CLOUD-FIRST VÀ ĐĂNG XUẤT

- Mỗi lần đăng nhập hoặc tải lại trang, đọc users/{uid} từ máy chủ. Nếu đã có Cloud Save hợp lệ, tự động thay toàn bộ kho save game trong localStorage bằng dữ liệu Cloud. Không hỏi chọn Local/Cloud, không gộp và không tải Local chưa đồng bộ ngược lên trước lần đọc này.
- Nếu chưa có Cloud Save, tự động di chuyển tiến độ Local hiện có lên tài khoản Google. Chỉ mở giao diện sau khi việc lưu đầu tiên thành công. Giữ nguyên level, biến thể mutation và vật phẩm trong dữ liệu hợp lệ.
- Giữ kiểm tra định dạng, checksum, schema, revision, cơ chế journal/rollback và biên nhận dùng một lần để chống lặp reload. Tác vụ khôi phục cũ không được ghi dữ liệu sau khi tài khoản thay đổi hoặc đăng xuất.
- Autosync tiến độ vẫn được gộp theo nhịp hiện có. localStorage dùng làm bộ đệm phục hồi; không còn là chế độ chơi offline. Lỗi đọc/ghi Cloud hoặc lỗi listener khóa phiên và hiển thị thông báo.
- Sign Out khóa giao diện ngay, dừng toàn bộ hoạt động phiên, đăng xuất Firebase, xóa dữ liệu game và metadata phiên trên thiết bị, xóa bản sao phục hồi riêng trong IndexedDB rồi tải lại màn hình đăng nhập. Không xóa save trên Firestore. Cờ đăng xuất đang chờ ngăn mở lại phiên cũ nếu quá trình bị ngắt.

3. KẾT NỐI PVP VÀ XỬ LÝ LỖI

- Mọi Peer mới dùng debug: 1 và ba STUN server:
  stun:stun.l.google.com:19302
  stun:stun1.l.google.com:19302
  stun:stun2.l.google.com:19302
- Bắt đầu ngân sách kết nối 20.000 ms từ thao tác Create Room hoặc Join Room, bao gồm thời gian nạp SDK và chuẩn bị phiên.
- Create Room: nếu chưa đăng ký được phòng sau 20 giây, hủy và bật lại điều khiển. Khi phòng đã đăng ký thành công và báo Room ready, phòng được giữ để chủ phòng chia sẻ mã và chờ bạn; không đóng phòng chỉ vì bạn chưa vào trong 20 giây.
- Join Room và kênh đến chủ phòng: nếu kênh dữ liệu/handshake chưa hoàn tất sau 20 giây, hủy kết nối đang chờ, hủy timer/listener liên quan, trả giao diện về trạng thái có thể thử lại.
- Thông báo timeout chính xác: Connection timed out. Please verify Room ID or network firewall.
- Xử lý peer.error, peer.disconnected, peer.close, conn.error và conn.close. Lỗi peer-unavailable, network hoặc ID trùng không giữ nút ở trạng thái Connecting.
- Theo dõi connectionState và iceConnectionState của RTCPeerConnection. Trạng thái failed/closed kết thúc phiên an toàn; disconnected được chờ phục hồi tối đa 20 giây. Mất kết nối signaling nhưng kênh dữ liệu đã xác minh vẫn mở thì tiếp tục dùng kênh đang có.
- Callback thuộc kết nối cũ không được sửa trạng thái phòng mới. Giữ nguyên blind pick SHA-256, khóa lựa chọn Ready, chuẩn hóa Level 1, đồng bộ lượt và quy tắc PvP không có thưởng/tiến độ.
- STUN hỗ trợ tìm đường kết nối NAT, không bảo đảm vượt mọi NAT đối xứng hoặc firewall. Bản cập nhật đã cấu hình TURN Metered asia-east để chuyển tiếp khi kết nối trực tiếp thất bại; việc sử dụng phụ thuộc credential hợp lệ và dịch vụ TURN hoạt động.

4. CẤU HÌNH TRIỂN KHAI

- Tải lên đầy đủ nguồn, giữ đúng chữ hoa/thường của tên tệp. Mã cache mới: 20261023-google-pvp-2. Tiếp tục dùng các asset ảnh/âm thanh hiện có do người dùng quản lý; gói này không chứa asset mới.
- Trong Firebase Authentication, bật Google và thêm tên miền triển khai vào Authorized domains. Anonymous không còn được mã game sử dụng; nên tắt nhà cung cấp Anonymous nếu dự án không có ứng dụng khác cần nó.
- Triển khai firestore.rules đi kèm. Hàm kiểm tra quyền yêu cầu request.auth.token.firebase.sign_in_provider == 'google.com', đồng thời giữ giới hạn UID và kiểm tra schema/revision hiện có. Chỉ thay tệp nguồn trên web không tự cập nhật Firestore Rules.
- Có thể triển khai Rules bằng Firebase CLI: firebase deploy --only firestore:rules --project anime-card-web
- Dùng HTTPS hoặc localhost cho Web Crypto/WebRTC. Nếu máy chủ đặt Cross-Origin-Opener-Policy quá chặt và chặn popup OAuth, điều chỉnh response header tại nơi hosting, ví dụ same-origin-allow-popups cho luồng popup phù hợp. JavaScript hoặc thẻ meta không thể sửa response header này; cảnh báo COOP do trình duyệt phát ra không được che giấu bằng mã game.
- Không có thay đổi trực tiếp trên Firebase Console, Rules đang chạy hoặc website đã triển khai trong lần bàn giao này.

5. KIỂM TRA VÀ PHẠM VI XÁC NHẬN

- Đã chạy kiểm tra cú pháp các module và kiểm tra trình duyệt với Auth/Firestore/PeerJS mô phỏng: khóa khi chưa đăng nhập, từ chối guest/nhà cung cấp khác, lỗi popup, migration trước khi mở game, Cloud ghi đè Local khi refresh, giữ thẻ Level 157/biến thể/vật phẩm, lỗi Cloud, hết hạn token, mất mạng, kết nối lại và đăng xuất trong lúc khôi phục.
- Đã kiểm tra timeout đăng ký phòng và Join Room, lỗi peer-unavailable/network, lỗi và đóng DataConnection, ICE failed, thử lại sau lỗi, phòng chờ hợp lệ không tự hết hạn và cấu hình STUN chính xác.
- Hai client mô phỏng đã kiểm tra blind pick, khóa Ready, đồng bộ lượt 1v1/4v4 và dữ liệu tiến độ không đổi trong PvP. Các kiểm tra này không thay thế việc thử Google OAuth thật, quyền Firestore thực tế và WebRTC trên hai mạng khác nhau sau triển khai.
- Không thay đổi cân bằng, EXP, nội tại, Tower, Raid, Time Trial hoặc nội dung thẻ. Không kèm test runner, log, Excel hay asset nhị phân trong gói nguồn.

6. MODIFIED FILES NOTE — GHI CHÚ TỆP THAY ĐỔI

- online_utils.js: Cấu hình STUN dùng chung, hằng timeout 20 giây, trình nạp module có thứ tự và thông báo lỗi dịch vụ.
- pvp.js: Timeout, hủy kết nối, khôi phục điều khiển, xử lý sự kiện PeerJS/DataConnection và trạng thái ICE.
- startup.js: Lớp xác thực bắt buộc, khóa focus/Escape, nạp gameplay sau Google và kiểm tra module sau khi nạp.
- firebase.js: Xác minh Google/token, điều phối Cloud-first, bỏ guest/offline, khóa khi lỗi/mất mạng, xóa phiên khi đăng xuất và chặn khôi phục từ tác vụ cũ.
- app.js: Khóa đầu vào và vòng lặp theo phiên Google, dừng hoạt động khi mất xác thực, kiểm tra phiên trước khi ghi bản Cloud.
- index.html: Lớp đăng nhập tĩnh, bỏ lựa chọn khách/phục hồi offline, khai báo module chờ xác thực, đổi cache tag.
- styles.css: Giao diện lớp đăng nhập và bố cục đáp ứng màn hình nhỏ.
- firestore.rules: Bắt buộc nhà cung cấp Google cho dữ liệu người dùng và leaderboard; giữ kiểm tra dữ liệu hiện có.
- README.txt: Chỉ ghi changelog của lần cập nhật này, hướng dẫn triển khai và danh sách tệp thay đổi.

TÀI LIỆU THAM CHIẾU
https://peerjs.com/client/api/peer
https://peerjs.com/client/api/data-connection
https://firebase.google.com/docs/auth/web/google-signin
https://firebase.google.com/docs/reference/rules/rules.firestore.Request#auth
https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#cross_origin_opener_policy
