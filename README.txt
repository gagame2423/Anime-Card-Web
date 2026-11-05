NHẬT KÝ CẬP NHẬT 05/11/2026
RAMEN BOWL VÀ TIẾN HÓA TRỰC TIẾP TRONG CARD DETAILS

1. Ramen Bowl
- Thêm EXP Food Ramen Bowl, ID ramen_bowl, ảnh assets/items/ramenb.png.
- Mỗi phần cho 10.000 EXP gốc. EXP thực nhận = 10.000 × số lượng dùng × EXP Multiplier của người chơi, theo hệ thống Feed hiện có.
- Bán riêng tại Akatsuki Raid Shop với giá 10 Akatsuki Coins/phần.
- Dùng ô Quantity của Raid Shop để mua nhiều phần. Số lượng thực mua tự giới hạn theo Coins còn lại và sức chứa vật phẩm; chỉ trừ đúng chi phí số phần nhận được.
- Ramen xuất hiện trong Storage → EXP Food và lưới Feed XP Food. Thông tin nguồn nhận lấy trực tiếp từ Akatsuki Shop.
- Thẻ cấp 100 không thể dùng thức ăn; không tiêu Ramen khi Feed bị từ chối. EXP, vật phẩm và Coins dùng cơ chế lưu/khôi phục giao dịch đang có.

2. Evolve trong Card Details
- Gỡ nút Evolution riêng khỏi menu ba chấm và bỏ lưới công thức tiến hóa cũ.
- Thẻ có công thức tiến hóa hiện nút Evolve ngay bên phải thông tin Variant/Mutation trong Card Details.
- Thẻ không có công thức không hiện nút này. Có thể xem trước tiến hóa khi chưa đủ cấp hoặc nguyên liệu; nút xác nhận sẽ bị khóa và nêu điều kiện còn thiếu.
- Mutation được lấy đúng từ lựa chọn hiện tại trong Card Details. Không tự đổi sang Normal, biến thể mạnh nhất hoặc bản sao khác khi tiến hóa.

3. Hộp thoại Evolve Unit
- Bố cục gồm thẻ gốc bên trái, mũi tên chuyển đổi ở giữa, thẻ tiến hóa và bảng Requirements bên phải.
- Hai thẻ hiện ảnh, tên, cấp, độ hiếm, Element, HP và ATK. Bên dưới là Mutation sẽ giữ lại, chênh lệch chỉ số thực tế và toàn bộ mô tả nội tại của thẻ tiến hóa.
- Số liệu xem trước dùng cùng công thức chỉ số/cấp/Mutation của game, không dùng mức tăng giả định như +40% cố định.
- Nguyên liệu hiện ảnh hoặc biểu tượng thay thế, tên và số lượng Đang có/Cần dùng. Màu xanh khi đủ, màu đỏ khi thiếu.
- Nút Evolve dùng màu hồng/tím; Cancel và X đóng hộp thoại, trở về Card Details với Mutation đã chọn.
- Escape và nhấn nền chỉ đóng hộp thoại tiến hóa ở trên. Khóa tương tác Card Details phía dưới và giữ focus bàn phím trong hộp thoại khi đang mở.
- Bố cục đáp ứng trên điện thoại; nội dung dài có vùng cuộn, nút xác nhận/hủy luôn ở hàng điều khiển cuối.
- Ảnh bị thiếu dùng phần hiển thị thay thế; không tạo hoặc đính kèm tài nguyên ảnh mới.

4. Kết quả tiến hóa và bảo vệ dữ liệu
- Cả 11 công thức hiện có tạo thẻ kết quả cấp 100, EXP 0, giữ nguyên Normal/Mutation đơn/Mutation kép của bản sao đã chọn.
- Áp dụng cho Itachi Awakened, Ultimate Gohan, Golden Frieza, True Mahito, Gojo Revice, Jason 13th, Saber Knight, Yuno Spirit, Awakened Doflamingo, Sea Goddess Valkyrie và Prime Garp.
- Chỉ tiêu 1 bản sao của đúng biến thể cùng số nguyên liệu công thức yêu cầu. Các biến thể/bản sao khác không bị dùng thay.
- Kiểm tra lại cấp, biến thể, nguyên liệu và quyền thao tác ngay lúc xác nhận. Thiếu điều kiện hoặc lỗi lưu thì không hoàn tất giao dịch; dữ liệu trước giao dịch được khôi phục khi có thể ghi lại.
- Giữ quy tắc mỗi kết quả tiến hóa chỉ mở khóa một lần. Thẻ đã tiến hóa trong save cũ không bị tự tăng cấp hoặc thay Mutation bởi lần cập nhật này.
- Sau thành công mở Card Details của thẻ kết quả với đúng Mutation và cấp 100.

5. Kiểm tra và phát hành
- Kiểm tra cú pháp toàn bộ 74 tệp JavaScript, đường dẫn script đúng tên/chữ hoa thường, ID DOM không trùng và nhãn cache đồng nhất.
- 20 kiểm tra cơ chế/giao dịch chạy qua, gồm 11 công thức, Mutation đơn/kép/Normal, bản sao còn lại, thiếu cấp/nguyên liệu, lựa chọn hết hạn, khôi phục lỗi lưu, EXP Multiplier và giới hạn cấp 100.
- Kiểm tra luồng thực tế: mua Quantity 100 với 35 Coins nhận đúng 3 Ramen và còn 5 Coins; tải lại vẫn giữ vật phẩm; tìm thấy trong EXP Food; Feed 1 phần nhận đúng 10.000 EXP khi EXP Multiplier là x1.
- Kiểm tra Evolve Unit ở 1440px, 390px và 320px: không tràn ngang, nút cuối luôn trong màn hình, Cancel/Escape/X/nhấn nền trở lại đúng Card Details. Kiểm tra mô tả dài của Itachi và số nguyên liệu thiếu màu đỏ.
- Giữ nguyên cards.js, chỉ số thẻ đã cân bằng, nội tại chiến đấu, giới hạn cấp 100, công thức EXP và mã combat của các chế độ khác. Không đổi Firebase, PvP, cấu hình TURN/STUN hoặc cơ chế mua số lượng lớn dùng chung.
- Nhãn cache mới: 20261105-evolution-ui-1. Thay đầy đủ mã nguồn, giữ thư mục assets hiện có, bổ sung assets/items/ramenb.png nếu chưa có rồi tải lại bằng Ctrl+F5.
- Không xuất Excel. Gói phát hành chỉ chứa mã nguồn và nhật ký cập nhật.

Modified Files Note
- exp_food.js: đăng ký Ramen Bowl 10.000 EXP, ảnh và nguồn Akatsuki Shop; dùng lại Feed hiện có.
- raid.js: thêm Ramen giá 10 Akatsuki Coins và ảnh món ăn vào Shop; dùng lại giao dịch Quantity đang có.
- card_details.js: nút Evolve theo công thức của thẻ, truyền chính xác Mutation đang chọn.
- evolution.js: điều khiển hộp thoại Evolve Unit, xem trước, Requirements, focus/đóng modal, kết quả cấp 100 và xử lý lỗi cập nhật giao diện sau giao dịch.
- app.js: nối Card Details với tiến hóa, xem trước chỉ số ở cấp kết quả, giữ cấp 100, mở thẻ kết quả và bỏ liên kết menu cũ.
- index.html: gỡ mục Evolution riêng, thêm nút trong vùng Variant, bố cục Evolve Unit và nhãn cache.
- styles.css: nút Evolve, khung so sánh, Requirements, nội tại, nút cuối, hiển thị điện thoại và ảnh Ramen trong Shop.
- startup.js: kiểm tra mô-đun và các điều khiển tiến hóa đã khởi tạo.
- README.txt: chỉ chứa nhật ký của bản cập nhật này.
