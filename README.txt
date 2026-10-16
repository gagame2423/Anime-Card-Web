NHẬT KÝ SỬA LỖI TRIỂN KHAI WEB — 16/10/2026

1. ĐỒNG BỘ HTML, JAVASCRIPT VÀ CSS

Đã kiểm tra tên tệp và ID: roll_view.js, sandbox.js cùng các module được tham chiếu đúng chữ hoa/thường. Không phát hiện lỗi casing trong gói nguồn được kiểm tra.

Qua HTTP, trường hợp HTML mới kết hợp app.js cũ tái hiện đúng hai lỗi: Hide Rolling Card không phản hồi và Sandbox không mở, trong khi Console không báo lỗi. Đây là một nguyên nhân đã tái hiện trong môi trường kiểm tra; không phải kết luận từ việc truy cập website đang triển khai của người chơi.

Toàn bộ URL JS/CSS hiện dùng đường dẫn tương đối ./ và mã phiên bản ?v=20261016-deploy-fix-1 để tách khỏi tài nguyên URL cũ trong cache. Script dùng defer, giữ đúng thứ tự phụ thuộc và chạy khi HTML đã được phân tích. Áp dụng được cả khi game nằm ở thư mục gốc hoặc đường dẫn con của GitHub Pages.

2. SỬA HIDE ROLLING CARD

Binding chờ DOM sẵn sàng và có thể khởi tạo lại mà không gắn trùng listener. Khi ON, kết quả trùng được ẩn bằng hidden, class hidden và display:none !important trực tiếp; không còn phụ thuộc riêng vào stylesheet đang được cache.

Thẻ chưa sở hữu hoặc mutation/double mutation mới vẫn hiện đến lần roll được chấp nhận tiếp theo. Double mutation đảo thứ tự thành phần vẫn là cùng biến thể. Khi OFF, có thể xem lại kết quả đang ẩn mà không phát sinh roll hoặc nhận thêm thẻ.

Giữ nguyên RNG, cộng thẻ, EXP, quest và bộ đếm. Nếu module trình bày không tải được, luồng roll chính vẫn có thể hoạt động và giao diện báo lỗi tải. Nếu trình duyệt chặn ghi tùy chọn vào localStorage, công tắc vẫn hoạt động trong phiên hiện tại; tooltip thông báo không lưu được tùy chọn.

3. SỬA KHỞI TẠO VÀ LỐI VÀO SANDBOX

Kiểm tra thành phần DOM, dữ liệu thẻ, module mutation/cấp/element/passive và cầu nối với app.js trước khi mở. Chuẩn bị đội hình trước khi chuyển khỏi Arena; lỗi mở không để trạng thái Sandbox bị kẹt đang hoạt động.

Bổ sung kiểm tra null cho các phần tùy chọn, listener và thao tác render. Khởi tạo nhiều lần không nhân đôi listener, danh sách thời tiết hoặc lượt chiến đấu. Lỗi bắt đầu/chạy trận được hiển thị, đồng thời dừng timer an toàn.

Giữ đầy đủ chọn thẻ Index cho hai đội, mutation, Level/HP/ATK, timer, preset, Start, Pause, Step và Exit. Runtime, RNG, thẻ và nhật ký Sandbox vẫn độc lập. Trận thử không ghi quest, achievement, EXP, VNĐ, vật phẩm, tiến trình hoặc đội hình thật.

4. THÔNG BÁO LỖI TRIỂN KHAI

Thêm startup.js để hiển thị thông báo khi module không tải, script không khởi tạo được hoặc giao diện tính năng chưa sẵn sàng. Nút tính năng chưa khởi tạo được sẽ bị vô hiệu hóa kèm hướng dẫn, thay cho nút bấm không phản hồi.

app.js bổ sung kiểm tra null cho binding, cập nhật chữ và các điều khiển Arena liên quan. Phần trình bày roll và Sandbox được khởi tạo độc lập; lỗi một phần không tự động bỏ qua khởi tạo phần còn lại.

5. KIỂM TRA VÀ CÁCH ÁP DỤNG

Đã kiểm tra bằng Chromium qua máy chủ HTTP phân biệt hoa/thường: đường dẫn con, tài nguyên có phiên bản, thẻ mới/trùng/mutation mới, CSS xung đột, tùy chọn lưu qua reload, khởi tạo lặp, Sandbox thắng trận/timer/Exit, module 404 và DOM thiếu. So sánh trước/sau trận thử xác nhận localStorage, quest, achievement, tiến trình chính, Arena và dữ liệu thẻ gốc không thay đổi.

Khi triển khai, giải nén và cập nhật đồng bộ toàn bộ 23 tệp trong ZIP vào thư mục phục vụ game. Giữ nguyên tên tệp và đường dẫn tương đối; bảo đảm startup.js, levels.js, roll_view.js và sandbox.js cùng nằm cạnh index.html. Sau khi bản triển khai hoàn tất, tải lại trang; có thể dùng Ctrl+F5 để làm mới HTML cũ đang cache.

Giữ các tài nguyên ảnh/âm thanh hiện có của dự án. Bản này không đổi cân bằng, nội tại chiến đấu, checksum .acrsave hoặc cooldown 7 ngày. Gói bàn giao chỉ gồm mã nguồn và README.txt; không có Excel, asset mới, script kiểm thử hay log.
