NHẬT KÝ CẬP NHẬT — KHỞI ĐỘNG TRỰC TIẾP, ƯU TIÊN SAVE CỤC BỘ
Ngày cập nhật: 24/10/2026

1. BỎ YÊU CẦU ĐĂNG NHẬP GOOGLE KHI KHỞI ĐỘNG

- Xóa overlay Google Sign-In toàn màn hình, trạng thái inert của giao diện chính và CSS khóa trang. Không còn chặn phím Escape/Tab hoặc ép người chơi trở lại màn hình đăng nhập.
- Nạp các module trò chơi theo đúng thứ tự và đọc localStorage ngay khi trang sẵn sàng. Đồng hồ, roll, Inventory, Arena và các nút điều khiển hoạt động mà không chờ Firebase, Google OAuth hoặc kiểm tra token.
- Người chơi mới có UID cục bộ ổn định dạng local_... và tên Guest. UID được lưu riêng trên thiết bị, giữ nguyên sau refresh, kết nối/ngắt Google và nạp Cloud thủ công.
- Phiên chơi cục bộ mới không tải Firebase SDK. Với tài khoản từng bật đồng bộ, Firebase chỉ được khởi tạo phía sau sau khi game đã chạy; CDN hoặc mạng bị lỗi không trì hoãn gameplay.
- Hết hạn token, mất mạng hoặc Google đăng xuất chỉ tạm dừng đồng bộ Cloud. Không dừng trận, xóa đội hình, tắt auto-roll, khóa shop hoặc tải lại trang do thay đổi Auth.

2. LOCAL-FIRST VÀ ĐỒNG BỘ CLOUD TÙY CHỌN

- Save trong localStorage là dữ liệu được dùng khi khởi động. Đăng nhập và refresh không tự tải Cloud đè lên tiến trình cục bộ.
- Login vẫn mở Cloud Account theo yêu cầu của người chơi. Modal có thể đóng bình thường; Google không còn là điều kiện vào game.
- Nếu tài khoản Google chưa có Cloud Save, hệ thống sao lưu tiến trình cục bộ hiện tại lên Cloud. Nếu Cloud và thông tin phiên đồng bộ khớp nhau, tiếp tục sao lưu thay đổi nền theo cơ chế gom lượt ghi 60 giây.
- Nếu đã có Cloud khác phiên bản hoặc mới hơn, giữ nguyên tiến trình cục bộ và bản Cloud. Chỉ hiển thị trạng thái trong Cloud Account; không bật popup lựa chọn, không tự thay save và không tự ghi đè bản Cloud chưa được xác nhận.
- Upload Local Save: người chơi chủ động sao lưu bản đang chơi lên Google. Khi thay bản Cloud cũ, giữ bản trước trong vùng recovery hiện có trên Firestore.
- Load Cloud Save: chỉ chạy khi người chơi chủ động bấm nút và đã kết thúc hoạt động đang diễn ra. Kiểm tra định dạng, checksum/digest và tính toàn vẹn, lưu bản cục bộ dự phòng trong IndexedDB, kiểm tra lại tiến trình/tài khoản trước khi thay dữ liệu. Trang chỉ reload sau thao tác nạp Cloud thủ công thành công.
- Nếu tiến trình cục bộ thay đổi trong lúc đang tải bản Cloud, hủy việc thay save để tránh mất thay đổi mới. Lỗi mạng hoặc ghi Cloud không xóa save cục bộ.
- Disconnect Google ngắt đồng bộ và đăng xuất Google; giữ nguyên thẻ, item, VNĐ, roll, tiến trình, UID cục bộ và trận đang chơi.
- Giữ nguyên cấu hình dự án Firebase, định dạng save bảo vệ, giới hạn/chunk payload, kiểm tra revision và Firestore Rules. Không bật Anonymous Auth hoặc nới quyền ghi công khai.

3. INFINITY VÀ BẢNG XẾP HẠNG KHI CHƠI GUEST

- Infinity không kiểm tra Google trước khi mở sảnh, bắt đầu trận, xử lý turn, ghi wave hoặc nhận Star Orb. Đội hình trực quan, điều kiện Category tuần và chống chọn trùng vẫn giữ nguyên.
- Best tuần, hàng đợi score và Star Orb được lưu cục bộ. Khi có đồng bộ Google hợp lệ, có thể gửi best lên bảng tuần; không có mạng vẫn tiếp tục chơi.
- Nhận thưởng đổi tuần trực tiếp từ save cục bộ khi khởi động hoặc mở lượt Infinity mới. Công thức giữ nguyên: Star Orb thưởng tuần = highestWave của tuần trước x100. UTC ISO week, seed, scaling và thưởng từng wave không đổi.
- Thêm sổ giao dịch cục bộ cho thưởng tuần: lưu số lượng item sau giao dịch cùng trạng thái Infinity và metadata. Nếu ghi bị gián đoạn, lần nạp sau hoàn tất cùng giao dịch bằng giá trị tuyệt đối, tránh cộng thưởng hai lần. Thông báo nhận thưởng vẫn có thể xác nhận bình thường mà không cần Google.
- Bảng xếp hạng khi chưa kết nối Google hiển thị thành tích của hồ sơ trên thiết bị và ghi rõ phạm vi cục bộ. Khi kết nối Google và có mạng, truy vấn bảng toàn cầu qua Firestore như trước. Lỗi đọc online chuyển về kết quả cục bộ.
- Không yêu cầu Cloud Functions, backend riêng hoặc API mới; giữ kiến trúc client-side tương thích Firebase Spark.

4. TƯƠNG THÍCH GAMEPLAY

- PvP Create Room/Join Room không còn phụ thuộc đăng nhập Google. Vẫn cần mạng để liên lạc PeerJS/WebRTC; không thay quy trình blind pick, commitment, đồng bộ trận, Level 1 hoặc quy tắc không thưởng.
- Không sửa online_utils.js: giữ nguyên STUN, TURN, debug và timeout kết nối.
- Giữ nguyên combat, nội tại, chỉ số thẻ, EXP, Tower, Time Trial, Raid, Boss Event, Spooky Hunt, Sandbox, Evolution, nhiệm vụ và cơ chế mua gộp shop.
- Gỡ điều kiện Auth ở các adapter điều phối game, lưu cục bộ, mở modal và mua shop. Các khóa an toàn liên quan đến battle/simulation, giao dịch item hoặc lỗi lưu trữ thực sự vẫn được giữ.
- Khi thoát Infinity, vòng lặp Arena và auto-roll được khôi phục cho cả guest. Việc đăng xuất hoặc mất token không phá trận Infinity đang chạy.

5. KIỂM TRA VÀ TRIỂN KHAI

- Đã kiểm tra trình duyệt: khởi động không Firebase SDK, roll, đồng hồ, lưu/refresh giữ UID và tiến trình, dùng item khi mất mạng, mở/thoát Infinity, đóng modal tài khoản và bảng xếp hạng cục bộ.
- Đã kiểm tra bằng Auth/Firestore/PeerJS mô phỏng: tạo phòng guest, upload save cục bộ lần đầu, Cloud mới hơn không đè local, upload có recovery, lỗi ghi Cloud, token hết hạn, đăng xuất/mất mạng giữa trận Infinity và nạp Cloud thủ công.
- Đã kiểm tra shop mua gộp của cả 5 nhóm khi chơi guest, giới hạn theo ngân sách và số dư; chuyển wave Infinity liên tục và lưu thưởng wave.
- Đã kiểm tra phục hồi thưởng tuần khi cố ý làm gián đoạn ghi, refresh nhiều lần không nhận trùng và Firebase CDN bị chặn ở hồ sơ từng kết nối Google.
- Kiểm tra cú pháp JavaScript, CSS và đường dẫn/ID HTML trong gói nguồn. Không triển khai trực tiếp website hoặc Firebase; đăng nhập Google thật, quy tắc Firestore trên dự án thật và kết nối WebRTC giữa hai mạng vẫn cần kiểm tra sau khi upload.
- Upload đầy đủ các tệp nguồn lên GitHub Pages và nhấn Ctrl+F5. Cache tag mới: 20261024-local-first-1. Không cần thay hoặc publish lại Firestore Rules cho cập nhật này.
- Chơi cục bộ không cần tài khoản sau khi trang và tệp game đã tải được. Việc mở lại website khi hoàn toàn mất mạng vẫn phụ thuộc cache trình duyệt; bản cập nhật này không thêm Service Worker. Đồng bộ Cloud và PvP online cần kết nối mạng.
- Gói chỉ chứa mã nguồn sản xuất và README.txt; không kèm test runner, log, Excel, node_modules hoặc asset nhị phân. Artwork/audio hiện có tiếp tục do người dùng quản lý.

6. MODIFIED FILES NOTE — GHI CHÚ TỆP THAY ĐỔI

- startup.js: Khởi động gameplay trực tiếp, bỏ chờ xác thực và khóa bàn phím/focus; giữ kiểm tra module bị thiếu.
- firebase.js: Hồ sơ guest cục bộ, Google tùy chọn, đồng bộ local-first, thao tác Cloud thủ công, bỏ khóa/reload theo Auth và fallback leaderboard cục bộ.
- app.js: Gỡ Auth khỏi vòng lặp, local save, modal và adapter shop; giữ reload riêng cho Load Cloud Save thủ công; khôi phục runtime guest và tích hợp sổ thưởng tuần.
- index.html: Xóa overlay/inert, cập nhật mô tả tài khoản, nút Cloud tùy chọn và cache tag.
- styles.css: Xóa CSS overlay và trạng thái khóa Auth không còn dùng.
- infinity.js: Cho guest chơi/nhận thưởng, nhận thưởng đổi tuần cục bộ và phục hồi giao dịch khi ghi bị gián đoạn.
- infinity_cloud.js: Ghi score Firestore tùy chọn, fallback best/bảng tuần cục bộ khi không có Google hoặc mạng.
- leaderboard.js: Kết quả cục bộ cho guest và tách cache theo hồ sơ/trạng thái Cloud.
- pvp.js: Chỉ thay hai điều kiện đầu vào Create/Join để bỏ yêu cầu Auth; không sửa giao thức hoặc combat.
- storage.js: Mô tả nguồn Star Orb cập nhật theo nhận thưởng tuần cục bộ.
- README.txt: Chỉ ghi changelog của bản cập nhật này và danh sách tệp thay đổi.
