NHẬT KÝ CẬP NHẬT — GIAO DIỆN VÀ KHÓA ĐỘI ONLINE PVP
Ngày phát hành: 23/10/2026

1. ĐIỀU HƯỚNG

Đổi nhãn mục tài khoản trong menu chính từ ... Login thành Login. Mục này tiếp tục mở Cloud Account như trước.

2. SỬA LOCK IN / READY

- Kiểm tra đủ đúng 1 hoặc 4 thẻ khác nhau trước khi cho phép Ready. Sửa trường hợp mảng đội hình có ô trống nhưng vẫn vượt qua kiểm tra đủ số lượng; không còn bỏ sót ô do Array.every bỏ qua phần tử chưa được gán.
- Ngay khi Lock In, chụp một bản đội hình cố định, đóng bộ chọn và khóa toàn bộ ô thẻ trước khi bắt đầu hash bất đồng bộ.
- Hiển thị rõ giai đoạn đang khóa, Ready / Waiting for Opponent và đang xác minh để vào trận. Thẻ đã khóa có dấu ✓ và viền xanh.
- Tạo nonce ngẫu nhiên bảo mật, tính SHA-256 và chỉ gửi hash trong gói commit. Không gửi đội hình hoặc nonce cho đối thủ trước khi cả hai đã Ready.
- Nhấn nhanh nhiều lần không tạo thêm commit. Thay đổi đội hình sau khi đã khóa bị chặn cả ở UI lẫn callback xử lý.
- Nếu hash lỗi trước khi gửi, trả về trạng thái có thể chọn thẻ và thử lại. Không mở khóa một commitment đã được gửi.
- Giới hạn chờ hash là 10 giây. Công việc hash còn chờ khi rời phòng bị hủy theo phiên, không được gửi vào phòng mới.
- Sau khi hai phía reveal và xác minh thành công, cả hai tự chuyển từ màn chọn đội sang Battle Screen.

Giữ nguyên cấu trúc gói PeerJS, cơ chế commit/reveal, RNG đồng bộ, hash trạng thái và xác nhận từng lượt. Cập nhật mã tương thích nội bộ thành acr-online-20261023-v2; hai người phải dùng cùng bản game.

3. BỘ CHỌN THẺ TRỰC QUAN

- Thay toàn bộ dropdown trong giao diện PvP bằng nút chọn chế độ và ô thẻ trực quan: 1 ô cho 1v1, 4 ô cho 4v4.
- Bấm ô thẻ để mở Select Card. Chỉ hiển thị thẻ người chơi đã sở hữu.
- Mỗi thẻ có artwork, viền theo độ hiếm, biểu tượng Element, tỷ lệ RNG và HP / ATK cơ bản ở Level 1. Không lấy Level, mutation hoặc chỉ số được nâng từ kho.
- Có tìm kiếm tên và bộ lọc All, Fire, Water, Nature, Electric, Dark, Holy.
- Chọn một thẻ rồi Confirm Card. Ô đội hình hiện Selected và hiệu ứng xác nhận. Thẻ đã nằm ở ô khác được đánh dấu và không thể chọn trùng.
- Đội đối thủ chỉ hiện các ô bí mật và trạng thái Ready trong giai đoạn chọn; không lộ artwork hoặc tên thẻ.
- Escape trong bộ chọn chỉ đóng Select Card, không thoát phòng PvP. Hỗ trợ giữ focus bàn phím trong hộp thoại và trả focus về ô đã chọn.
- Nếu thiếu artwork/icon, dùng phần hiển thị dự phòng, không làm hỏng bộ chọn. Không tạo thêm asset trong gói cập nhật.

4. BỐ CỤC ARENA VÀ HIỆU NĂNG

- Giao diện Duel Link tông tối, điểm nhấn xanh, thanh bước Connect / Blind Pick / Battle và trạng thái kết nối.
- Lock In nằm ngoài vùng cuộn của đội hình để luôn dễ tiếp cận trên desktop và mobile.
- Battle Screen hiển thị hai phía, artwork đơn vị đang ở tuyến đầu, HP, ATK, Shield, nội tại có thể mở rộng, các thẻ dự bị và Combat Log.
- Đánh dấu phía đang tấn công. Giữ nút Strike, thời gian 15 giây/lượt và tự đánh khi hết giờ. Có Exit PvP và Leave Room.
- Tách giao diện vào pvp_view.js và pvp.css. Bộ hiển thị chỉ đọc trạng thái trận; không ghi vào mô phỏng hoặc gửi gói mạng.
- Lập danh mục thẻ sở hữu một lần khi mở PvP. Tra cứu ID bằng Map / Set; tìm kiếm được debounce 100 ms.
- Lưới ban đầu tối đa 48 thẻ, Load more tăng thêm 48 thẻ mỗi lần. Artwork tải lazy; sự kiện dùng delegation thay vì gắn lại cho từng thẻ.
- Không dựng lại ô chọn khi dữ liệu hiển thị không đổi. Đồng hồ chỉ sửa văn bản khi số giây thay đổi. Danh sách đơn vị dự bị mặc định hiện tối đa 8 ô, có nút xem thêm nếu có nhiều summon.
- CSS chỉ áp dụng cho giao diện PvP. Sửa xung đột footer toàn cục từng làm nút xác nhận bị cắt; có bố cục responsive và hỗ trợ giảm chuyển động.

Giữ chuẩn hóa Level 1, Normal và nội tại gốc. Không thêm EXP, tiền, vật phẩm, tiến độ quest hoặc achievement từ PvP. Không sửa thuật toán chiến đấu PvE, EXP, Firebase Auth, migration hay Cloud Save trong bản này.

5. KIỂM TRA VÀ TRIỂN KHAI

- Kiểm tra hai phiên trình duyệt bằng kênh reliable mô phỏng theo giao diện PeerJS: hoàn thành trận 1v1 và 4v4, trạng thái kết quả tương ứng ở hai phía.
- Kiểm tra khóa ngay khi hash còn chờ, nhấn Ready lặp, commit 64 ký tự, không reveal sớm, chuyển màn tự động, đội 4v4 thiếu ô và chặn thẻ trùng.
- Kiểm tra timer thật 15 giây, lệnh đến muộn và gói sai thứ tự; dữ liệu save không thay đổi trong trận.
- Kiểm tra tìm kiếm, lọc Element, Load more, Escape, Level 1 base stats, bố cục 1440px / 390px / 320px và khởi động khi CDN không tải được.
- Không dùng máy chủ Firebase thật hoặc PeerServer ngoài Internet trong các kiểm tra này. Kết nối WebRTC thực trên mạng triển khai vẫn cần được chủ dự án kiểm tra.

Cần triển khai toàn bộ nguồn trong ZIP, đặc biệt hai tệp mới pvp_view.js và pvp.css. index.html dùng mã cache 20261023-pvp-ui-2 để lấy đúng phiên bản JS/CSS. Cả hai người chơi cần tải cùng bản cập nhật; SHA-256 vẫn yêu cầu HTTPS hoặc localhost. Cấu hình Firebase và các tệp Rules/Indexes hiện có được giữ nguyên trong gói.

6. MODIFIED FILES NOTE — GHI CHÚ TỆP THAY ĐỔI

- index.html: Đổi nhãn Login, thay cấu trúc PvP, thêm Select Card, các màn lobby/battle và nạp module/style mới; cập nhật mã cache.
- pvp.js: Khóa đội bất đồng bộ an toàn, trạng thái Ready và chuyển màn; nối bộ chọn trực quan với phòng PeerJS hiện có.
- pvp_combat.js: Sửa kiểm tra đội hình có ô trống và mã tương thích phiên bản; giữ nguyên công thức chiến đấu.
- pvp_view.js: Tệp mới; dựng ô đội hình, bộ chọn có tìm kiếm/lọc, xử lý focus và giao diện trận PvP độc lập.
- pvp.css: Tệp mới; giao diện Duel Link, thẻ, modal, Arena, hiệu ứng khóa và responsive.
- styles.css: Gỡ các quy tắc PvP cũ đã chuyển vào pvp.css; giữ giao diện Cloud Account và Leaderboard.
- startup.js: Bổ sung kiểm tra module PvPView để báo rõ khi thiếu tệp triển khai.
- README.txt: Changelog của riêng bản cập nhật này và danh sách tệp thay đổi.

Gói bàn giao chứa đầy đủ mã nguồn và cấu hình, không chứa Excel, test runner, log, ảnh hoặc âm thanh.
