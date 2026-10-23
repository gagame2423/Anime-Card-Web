NHẬT KÝ CẬP NHẬT — CLOUD SAVE ĐƯỢC ƯU TIÊN TUYỆT ĐỐI
Ngày phát hành: 23/10/2026

1. ĐỒNG BỘ TỰ ĐỘNG, KHÔNG HỎI CHỌN SAVE

- Gỡ hoàn toàn phần Choose your progress, các nút Keep Local / Migrate và Use Cloud Save, cùng các hàm xử lý lựa chọn tương ứng.
- Khi đăng nhập hoặc tải lại trang, đọc users/{uid} trực tiếp từ máy chủ. Nếu Cloud Save đã tồn tại và hợp lệ, tự động ghi đè toàn bộ các kho dữ liệu game trong localStorage bằng bản Cloud, rồi tải lại trạng thái game.
- Không giữ Local vì có nhiều thẻ, tiền hoặc số lượt roll hơn; không ưu tiên cờ dirty hoặc UID của bản Local; không gộp hai bản tiến độ.
- Chỉ khi tài khoản chưa có Cloud Save mới tự động tải tiến độ Local lên lần đầu, kể cả khi metadata Local còn ghi tài khoản trước đó.
- Nếu phát hiện revision đã đổi lúc đang lưu, tự đọc và khôi phục Cloud Save. Không mở hộp thoại hoặc đợi người chơi chọn.
- Khi có bản Cloud mới qua listener, tự xử lý. Nếu thông báo đến trong lúc một lần lưu đang chạy, xếp việc khôi phục ngay sau lần lưu đó.
- Không bắt đầu upload trong pagehide để tránh gửi ngược Local chưa đồng bộ ngay trước lần đọc Cloud khi refresh.

2. TÍNH TOÀN VẸN VÀ CHỐNG LẶP TẢI TRANG

- Giữ kiểm tra định dạng, checksum và schema trước khi ghi đè; Cloud sai hoặc thiếu dữ liệu không được dùng để thay Local và không bị ghi đè bằng Local.
- Giữ bản sao phục hồi Local và cơ chế journal/rollback hiện có. Nếu ghi localStorage hoặc biên nhận tạm thất bại, khôi phục các kho cũ và cho phép thử lại.
- Thêm biên nhận tạm trong sessionStorage, dùng một lần, có UID, revision, digest và SHA-256 của đúng các kho vừa áp dụng. Trang sau tải lại vẫn kiểm tra máy chủ; chỉ xác nhận biên nhận khi bản Cloud và dữ liệu đã ghi đều khớp. Điều này tránh vòng lặp reload sau khi khôi phục thành công.
- Biên nhận hết hiệu lực sau 5 phút, bị tiêu thụ ngay khi khởi động và không cho phép bỏ qua Cloud nếu Local đã đổi. Nếu mất mạng hoặc SDK lỗi, bỏ biên nhận đang chờ và tiếp tục dùng bản offline; lần kết nối lại phải đọc Cloud lại.
- Nếu một trận chiến hoặc mô phỏng đang hoạt động, tự hoàn tất khôi phục tại điểm kết thúc/thoát hoạt động an toàn, không hỏi lựa chọn và không phá trạng thái trận.
- Autosync tiến độ mới sau khi kết nối thành công vẫn hoạt động. Quy tắc Cloud ưu tiên được áp dụng trước khi cho phép đồng bộ tiến độ của phiên mới.

3. KIỂM TRA

Đã kiểm tra bằng Auth/Firestore mô phỏng trong trình duyệt: migration tài khoản trống; Cloud ghi đè Local dirty; đăng nhập tài khoản khác; refresh không tạo vòng lặp hoặc upload Local; giữ thẻ Level 157 và vật phẩm; xung đột revision; listener bản Cloud mới; chờ PvP thoát rồi khôi phục; dữ liệu Cloud sai; lỗi ghi Local/sessionStorage; mất SDK sau reload; Local đổi làm biên nhận vô hiệu; retry sau thông báo thay đổi từ tab khác. Không phát hiện lỗi JavaScript trong các kiểm tra này.

Không có thao tác ghi vào Firebase thật khi kiểm tra. Cần kiểm tra kết nối Firebase trên môi trường triển khai hiện có.

4. MODIFIED FILES NOTE — GHI CHÚ TỆP THAY ĐỔI

- firebase.js: Đổi sang Cloud-first, bỏ toàn bộ luồng chọn save, tự xử lý revision/listener, thêm biên nhận một lần và giữ fallback offline.
- app.js: Áp dụng toàn bộ dữ liệu Cloud có biên nhận trước reload; rollback dữ liệu và biên nhận nếu ghi thất bại.
- index.html: Gỡ giao diện chọn Local/Cloud, cập nhật mô tả Cloud Account và mã cache 20261023-cloud-first-1.
- styles.css: Gỡ các quy tắc của giao diện xung đột đã bị loại bỏ.
- README.txt: Chỉ ghi changelog và danh sách tệp của bản cập nhật này.

Gói ZIP gồm đầy đủ nguồn game và cấu hình hiện có. Không kèm Excel, test runner, log hoặc asset ảnh/âm thanh. Không thay đổi nội tại, cân bằng chiến đấu, Tower, Time Trial hoặc giao thức PvP.
