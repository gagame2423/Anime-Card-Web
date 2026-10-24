NHẬT KÝ CẬP NHẬT — CHỌN ĐỘI INFINITY BẰNG THẺ TRỰC QUAN
Ngày cập nhật: 24/10/2026

1. GIAO DIỆN ĐỘI HÌNH MỚI

- Thay toàn bộ dropdown chọn nhân vật và mutation trong sảnh Infinity bằng giao diện dựng đội trực quan. Trong modal Infinity không còn phần tử HTML select.
- Bốn khung SLOT 01, SLOT 02, SLOT 03, SLOT 04 hiển thị EMPTY và dấu + khi chưa chọn. Ô đang thao tác có viền sáng và nhãn ACTIVE.
- Khi đã chọn, khung hiển thị artwork từ đường dẫn ảnh hiện có, biểu tượng Element, tên thẻ, Level, mutation và HP/ATK. Chỉ số lấy từ cùng bộ tính Level/mutation đang dùng khi vào trận; không đổi cấp hoặc chỉ số chiến đấu.
- Bấm vào ô để chọn vị trí cần thay. Clear Slot bỏ riêng thẻ ở ô đó; Clear Team xóa toàn bộ lựa chọn trong sảnh. Không xóa thẻ khỏi kho.
- Sau khi chọn thẻ hoặc đổi mutation, con trỏ chuyển sang ô trống tiếp theo. Nếu đủ bốn ô, giữ vị trí đang thao tác và báo Lineup ready.
- Sảnh mới mở bắt đầu với bốn ô trống. New Run trong cùng tuần có thể giữ đội hình hợp lệ của lượt trước để chỉnh sửa nhanh.

2. LƯỚI THẺ ĐÃ MỞ KHÓA VÀ BỘ LỌC

- Phần Unlocked Cards hiển thị artwork, Element, Level, mutation và chỉ số. Mỗi ID thẻ chỉ có một mục trong lưới, bất kể sở hữu bao nhiêu bản sao hoặc biến thể.
- Search card... hỗ trợ tìm tên và Category. Bộ lọc Element, Additional Category và sắp xếp dùng menu trực quan, không dùng dropdown HTML select.
- Các kiểu sắp xếp: ATK cao/thấp, HP cao/thấp, Level cao trước và tên A–Z. Chỉ số dùng để sắp xếp khớp với biến thể đang hiển thị.
- Với thẻ chưa chọn, preview ưu tiên biến thể có ATK cao nhất hoặc HP cao nhất tương ứng kiểu sắp xếp. Với thẻ đang trong đội, preview hiển thị chính biến thể đã chọn.
- Banner Active Weekly Category luôn hiển thị Category bắt buộc và số thẻ hợp lệ. Additional Category chỉ lấy giao với nhóm tuần, không mở rộng sang thẻ trái điều kiện.
- Thay đổi tìm kiếm hoặc bộ lọc không tự xóa đội hình đã chọn. Khi đổi tuần UTC, sảnh làm mới điều kiện và bỏ các lựa chọn của tuần cũ.
- Khi không có thẻ phù hợp, hiển thị hướng dẫn rõ ràng. Nếu chưa có đủ bốn ID thẻ khác nhau thuộc Category tuần, Start Infinity Run luôn bị khóa, kể cả khi có nhiều bản sao của một thẻ.

3. KHÓA CHỌN TRÙNG THẺ

- Một đội Infinity chỉ được có bốn ID thẻ khác nhau. Normal, mutation đơn và double mutation của cùng ID vẫn được tính là cùng một thẻ.
- Thẻ đã chọn có lớp IN USE kèm số SLOT trong lưới. Artwork được giảm độ bão hòa để dễ nhận biết; các chỉ số vẫn đọc được.
- Bấm chọn lại thẻ đang dùng không ghi đè hoặc lấp ô khác. Hiển thị toast đúng nội dung: This card is already in your lineup!
- Kiểm tra trùng lặp được thực hiện ở thao tác chọn, xác nhận đội và bước chuyển các ô thành đơn vị chiến đấu. Đồng thời kiểm tra thẻ còn được sở hữu, biến thể còn số lượng và Category tuần còn hợp lệ.
- Clear Slot giải phóng trạng thái IN USE để có thể chọn lại thẻ đó. Quy tắc này chỉ áp dụng đội hình ban đầu; không thay đổi summon/clone do nội tại tạo ra trong trận.

4. CHỌN MUTATION VÀ HOÀN THIỆN TRẢI NGHIỆM

- Nút ··· ở thẻ và Mutation ··· tại ô đội hình mở bảng biến thể đang sở hữu, kèm số lượng và HP/ATK đầy đủ. Hỗ trợ cả mutation đơn và double mutation.
- Đổi mutation của thẻ đang dùng chỉ sửa biến thể trong đúng ô hiện có, không tạo thêm bản sao trong đội hình.
- Bảng mutation hỗ trợ Escape, nút đóng, phím Tab/Shift+Tab và trả focus về giao diện chọn đội. Phần sảnh phía sau tạm khóa thao tác khi bảng đang mở.
- Thanh cuối modal luôn giữ các nút Sync Best, Weekly Top 50 và Start Infinity Run trong vùng nhìn thấy. Ghi đè riêng quy tắc footer toàn trang để tránh ép chiều cao hoặc làm mất nút trên mobile.
- Bố cục đội hình bốn cột trên PC, hai cột trên mobile; lưới thẻ điều chỉnh theo chiều rộng. Viền rarity, màu mutation, Element và nút hành động dùng phong cách của giao diện Arena hiện có.
- Hiệu ứng xác nhận lựa chọn chạy ngắn 0,28 giây; tôn trọng prefers-reduced-motion. Toast nằm phía trên thanh hành động để tránh che nút Start.
- Nếu ảnh chưa có hoặc tải lỗi, hiển thị ký tự đại diện; gói nguồn không tạo hoặc kèm asset ảnh mới.

5. HIỆU NĂNG VÀ KIỂM TRA

- Cache phần tử giao diện và preview chỉ số trong phiên mở sảnh. Tìm kiếm chờ 120 ms sau lần nhập gần nhất, không tính lại toàn bộ chỉ số theo mỗi ký tự.
- Lưới nhân vật tối đa 24 thẻ/trang; bảng mutation tối đa 12 biến thể/trang. Không dựng toàn bộ biến thể trên từng khung thẻ.
- Chuẩn bị collection theo từng khung hình, mục tiêu khoảng 5 ms hoặc tối đa 8 thẻ mỗi đợt. Gộp cập nhật DOM bằng requestAnimationFrame và DocumentFragment; hủy công việc chờ khi thoát hoặc đổi tuần.
- Kiểm tra trình duyệt với Auth/Firestore mô phỏng: sảnh rỗng, một thẻ có nhiều bản sao/biến thể, chọn trùng, tự chuyển ô, đổi mutation, tìm kiếm/lọc, đội bốn ID khác nhau, khởi chạy, chuyển wave liên tục và thoát về Arena.
- Kiểm tra dữ liệu mẫu lớn: phân trang 24 thẻ và 12 mutation, cache chỉ số, sắp xếp, xóa ô/đội, đổi tuần UTC và chặn adapter trả đội hình trùng ID.
- Kiểm tra bố cục điện thoại rộng 320 px, mobile 390 px, tablet và PC thấp 640 px; nút Start luôn nhìn thấy; kiểm tra cú pháp JavaScript/CSS và ID/đường dẫn HTML.
- Kiểm tra lại mô phỏng nhận thưởng tuần đồng thời: vẫn chỉ ghi một lần, không cộng trùng khi đăng nhập lại.
- Không đổi combat Infinity, scaling, Star Orb, seed tuần, logic thưởng, Firestore Rules, Google Auth, TURN/STUN, PvP, Tower, Raid, Time Trial hoặc shop mua gộp. Không yêu cầu Cloud Functions hay API mới.
- Không kèm test runner, log, Excel, node_modules hoặc asset nhị phân trong gói nguồn. Các kiểm tra dịch vụ online là mô phỏng; không có thay đổi trực tiếp trên Firebase hoặc website đang chạy.

6. TRIỂN KHAI

- Cập nhật đầy đủ nguồn lên GitHub Pages và Ctrl+F5 để nạp cache tag 20261024-infinity-lineup-1.
- Đây là cập nhật giao diện và kiểm tra đội hình; không cần đổi hoặc publish lại Firebase Rules nếu đã triển khai bản Spark trước đó.

7. MODIFIED FILES NOTE — GHI CHÚ TỆP THAY ĐỔI

- infinity.js: Đội hình trực quan, bộ lọc, phân trang, bảng mutation, cache preview, kiểm tra ID duy nhất và điều khiển bàn phím.
- infinity.css: Khung thẻ, Element/mutation badge, menu lọc, lớp IN USE, thanh hành động, bảng mutation, responsive và hiệu ứng nhẹ.
- index.html: Cấu trúc sảnh/picker/footer mới, các nút và vùng truy cập hỗ trợ, đổi cache tag.
- app.js: Thêm một adapter dùng lại màu/gradient mutation hiện có cho renderer Infinity; không thay đổi tính chỉ số hoặc gameplay.
- README.txt: Chỉ ghi changelog của bản cập nhật này và danh sách tệp thay đổi.
