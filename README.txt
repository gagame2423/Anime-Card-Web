NHẬT KÝ CẬP NHẬT HIỆU NĂNG ROLL — 16/10/2026

1. HIDE ROLLING CARD: GIẢM TẢI GIAO DIỆN

Khi bật Hide Rolling Card, thanh tiến trình phía dưới đứng yên, không chạy vòng requestAnimationFrame. Cooldown hiển thị thời gian giữa hai lượt, ví dụ 0.38s, thay cho số đếm ngược thay đổi liên tục. Thời gian khóa roll và timer kích hoạt lượt tiếp theo vẫn giữ nguyên.

Roll ra thẻ/biến thể trùng hoặc Miss không dựng ảnh, nội tại, hiệu ứng kết quả, toast nhận thẻ, shop hay Collection. Bỏ phép tính Display Card dư thừa trước khi biết có cần hiển thị kết quả hay không. Trạng thái ẩn chỉ được ghi vào DOM khi thật sự chuyển từ hiện sang ẩn.

Thẻ chưa sở hữu hoặc mutation/double mutation mới vẫn được hiện. Mỗi kết quả hiển thị được gộp vào một khung hình; nếu kết quả đã bị lượt kế tiếp thay thế, hủy phần trình bày cũ, tránh hàng đợi animation hoặc ảnh lỗi thời.

Bộ đếm và số lượng thẻ tiếp tục tăng trong dữ liệu. Trong chuỗi roll ẩn ra bản trùng, phần tổng kết trên màn hình giữ nguyên để tránh repaint; cập nhật khi có kết quả mới cần hiện, tắt Auto Roll, tắt Hide Rolling Card hoặc mở một cửa sổ giao diện. Mở Collection sẽ đọc dữ liệu hiện tại. Tắt Hide cũng khôi phục kết quả gần nhất và animation tiến trình thông thường.

2. CACHE SỞ HỮU VÀ POOL ROLL

Thêm roll_performance.js, tách riêng các cache và hàng đợi trình bày:
- Map tra cứu thẻ theo ID.
- Set kiểm tra đã sở hữu thẻ/biến thể, với độ phức tạp trung bình O(1) sau khi xây chỉ mục.
- Cập nhật Set khi nhận thẻ; làm mới khi chuẩn hóa save, thay dữ liệu, salvage hoặc Evolution. Các thao tác thay state được nhận biết qua tham chiếu dữ liệu.
- Chỉ lọc/sắp xếp lại pool khi tập thời tiết hoặc điều kiện mở khóa thay đổi. Không gọi thêm RNG; giữ thứ tự xét thẻ và xác suất cũ.
- Tính Luck một lần cho một lần rút pool, thay cho lặp lại trên từng thẻ ứng viên.

Chỉ mục được xây khi cần và cập nhật dần; không quét toàn bộ kho để xét New Card/New Mutation trên từng roll. Cache pool chỉ giữ một tập hiện hành, không tích lũy lịch sử.

3. GIẢM REFLOW, REPAINT VÀ CẤP PHÁT

Gộp cập nhật kết quả cần hiện, thông số và achievement UI bằng một hàng đợi requestAnimationFrame. Vòng RNG, cooldown, ghi save và quest chạy độc lập với hàng đợi này; không chờ khung hình mới để nhận roll.

Tiến trình ở chế độ hiện thẻ dùng transform:scaleX thay cho cập nhật width. Các nhãn chỉ được ghi lại khi nội dung đổi. Cache các DOM reference dùng thường xuyên; không query DOM trong vòng animation tiến trình.

Available Rolls không dựng lại nếu pool/thời tiết hiển thị không đổi. Banner thời tiết giữ nguyên các chip và chỉ đổi chữ countdown; chỉ dựng cấu trúc lại khi thành phần hoặc thứ tự thời tiết thay đổi. Không cập nhật nội dung modal item/Arena khi modal tương ứng đang đóng.

Tra cứu bonus achievement và potion theo nhóm/chỉ số, tránh tạo các mảng filter/reduce/Object.entries trên mỗi lần tính Luck hoặc EXP. Dùng lại bản ghi kết quả gần nhất; hàng đợi chỉ giữ công việc cần thiết, không thêm listener hay phần tử hiệu ứng theo từng roll.

Khi tab bị ẩn, trì hoãn công việc trình bày; khi quay lại chỉ xử lý trạng thái mới nhất. Không thay cơ chế thời gian thực, background audio hoặc chính sách throttle của trình duyệt.

4. GIỮ NGUYÊN LƯU TRỮ VÀ TIẾN TRÌNH

Mỗi lượt được chấp nhận vẫn cập nhật đủ unlocked, mutations, inventory, EXP, bộ đếm và sự kiện quest. Save chính vẫn được ghi sau từng roll; không chuyển sang cơ chế chỉ lưu định kỳ và không bỏ qua sự kiện nhiệm vụ.

Vì roll cập nhật đồng bộ ba kho sở hữu theo định dạng chuẩn, bỏ bước chuẩn hóa lại toàn bộ kho ở cuối từng roll. Tick đồng hồ cũng không dựng lại sở hữu. Các đường lưu khác vẫn giữ chuẩn hóa; load/import/salvage/Evolution làm mới chỉ mục phù hợp.

Việc serialize và ghi save đầy đủ vẫn phụ thuộc kích thước dữ liệu; chỉ phép kiểm tra sở hữu là O(1). Không đổi schema save, bảo vệ .acrsave, hai cooldown 7 ngày, công thức EXP, cân bằng, drop rate, Tower, Raid, Time Trial, Boss Event hoặc cách ly Sandbox.

5. KIỂM TRA HIỆU NĂNG VÀ TÍNH ĐÚNG

Trong ca đo Chromium với 807 biến thể, xử lý 20 lượt roll ẩn giảm từ khoảng 7.2 giây xuống khoảng 0.03 giây. Đây là phép đo chi phí xử lý cưỡng bức các lượt trong môi trường kiểm tra, không phải thay đổi tốc độ/cooldown game hay cam kết cho mọi thiết bị.

Đối chiếu 200 lượt bằng cùng seed cho kết quả khớp về thứ tự thẻ, mutation, số lượng, EXP, quest, achievement, save và số lần gọi RNG (12,675 lần trong ca đo).

Vòng Auto Roll qua timer trong 10 giây xử lý và lưu 27 lượt mà không ghi lại DOM của thẻ, progress, bộ đếm hoặc sidebar, không dựng artwork, không quét biến thể hoặc chuẩn hóa toàn kho. Kiểm tra thêm 5,000 lượt sau giai đoạn làm nóng không tăng số DOM node hay listener; đủ 5,100 lượt được lưu.

Đã kiểm tra hiện thẻ mới/mutation mới, ẩn bản trùng, đổi ON/OFF, dừng Auto Roll, cập nhật pool khi thời tiết/mở khóa thay đổi, thời tiết hết hạn, salvage/load, HTTP ở đường dẫn con, thông báo thiếu module và cách ly Sandbox.

6. TỆP VÀ TRIỂN KHAI

Module mới: roll_performance.js.
Các tệp tích hợp: app.js, roll_view.js, achievements.js, inventory.js, startup.js, index.html và styles.css.

Gói ZIP chứa đầy đủ 24 tệp sản xuất, gồm README.txt này. Cập nhật đồng bộ toàn bộ nội dung ZIP, giữ roll_performance.js cạnh index.html. JS/CSS dùng mã phiên bản 20261016-roll-performance-1 để tránh trộn với bản cache cũ. Sau triển khai, tải lại trang hoặc Ctrl+F5.

Không có Excel, script kiểm thử, log hay asset mới trong gói. Tiếp tục dùng các ảnh/âm thanh hiện có của dự án.
