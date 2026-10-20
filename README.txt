NHẬT KÝ CẬP NHẬT SPOOKY HUNT — 6VS3, STORAGE VÀ THƯỞNG WAVE 50
Phiên bản: 20261020-spooky-2
Ngày cập nhật: 20/10/2026

Tài liệu chỉ ghi thay đổi của bản cập nhật này.

1. SPOOKY HUNT CHUYỂN SANG 6VS3

- Đội người chơi cần đúng 6 thẻ; mỗi wave vẫn có đúng 3 đối thủ ban đầu. Không phải 6vs6.
- PLAYER_TEAM_SIZE = 6 và ENEMY_TEAM_SIZE = 3 được quản lý tại spooky.js. app.js đọc các giá trị này để kiểm tra đội hình và số địch, thay vì mặc định hai bên phải có cùng số thẻ.
- Giao diện triển khai hiển thị đủ 6 ô, bộ đếm 0/6–6/6 và nhãn trận 6V3. Đội thiếu thẻ không thể bắt đầu; vẫn kiểm tra số bản thực sự sở hữu theo đúng mutation/double mutation.
- Điều chỉnh lưới triển khai riêng Spooky Hunt: 6 cột trên màn hình rộng từ 1300 px, 3 cột trên màn hình trung bình, 2 cột ở màn hình tối đa 700 px.
- Engine tiếp tục xử lý toàn bộ hàng đợi. Thẻ thứ 5, thứ 6 và đơn vị sinh thêm đều được tham gia đúng luồng; không kết luận thua chỉ vì 3 hoặc 4 vị trí đầu bị hạ.
- Giữ Auto Continue OFF trong Spooky Hunt, chọn modifier bắt buộc trước mỗi mốc 5 wave, 50 wave/lượt chạy và quy tắc mở Arena trong tháng 10 theo Asia/Bangkok.
- Các chế độ khác giữ nguyên số thẻ và luật vào trận.

2. GIỮ NGUYÊN TĂNG TRƯỞNG BA ĐỐI THỦ

Chỉ số trước các buff/debuff lượt chạy:
Vị trí 1: Wave 1 = 300.000 HP / 60.000 ATK;
           Wave 50 = 33.300.000 HP / 333.000 ATK.
Vị trí 2: Wave 1 = 600.000 HP / 60.000 ATK;
           Wave 50 = 66.600.000 HP / 666.000 ATK.
Vị trí 3: Wave 1 = 666.000 HP / 66.000 ATK;
           Wave 50 = 99.900.000 HP / 999.000 ATK.

Công thức giữ nguyên cho w = 1–50:
  t = (w - 1) / 49
  s = 3t² - 2t³
  chỉ số(w) = round(chỉ số đầu + (chỉ số cuối - chỉ số đầu) x s)

Việc tăng đội người chơi từ 3 lên 6 không nhân lại HP/ATK đối thủ. Buff chỉ số của lượt chạy vẫn áp dụng một lần lên các đơn vị mới của trận.

3. ĐỒ ĐẶC BIỆT CHỈ RƠI KHI THẮNG WAVE 50

Thay điều kiện thử rơi từ thắng bất kỳ wave sang hoàn tất lượt chạy:
  completedRun = won && wave === 50

Chỉ khi completedRun là true mới thực hiện ba phép thử độc lập:
- Headless Horseman: 5% nhận 1 trang bị.
- Myers: 1% nhận 1 thẻ, áp dụng mutation/double mutation hiện hành.
- Machete: 1% nhận 1 vật phẩm.

Wave 1–49 không gọi RNG cho ba phần thưởng này và không phát chúng. Thua ở bất kỳ wave nào, bao gồm Wave 50, không được thử rơi đồ đặc biệt. Điều kiện toàn bộ hàng địch đã bị hạ vẫn được kiểm tra trước khi công nhận chiến thắng.

Spooky Coins khi thắng wave và khi hạ địch, bao gồm summon hợp lệ, giữ nguyên. Không thêm VNĐ, EXP hoặc potion rơi thường vào phần thưởng Spooky Hunt.

Cập nhật nội dung xem trước trong Arena, mô tả Machete/Headless Horseman và Source Info để ghi rõ “Wave 50 victory only”. Không thu hồi các vật phẩm/thẻ người chơi đã sở hữu từ phiên bản trước. Machete vẫn mua được ở Spooky Shop; điều chỉnh này áp dụng cho cơ hội rơi từ Arena, không xóa nguồn mua hoặc quyền roll đã mở khóa.

4. DỌN NAVIGATION VÀ GIỚI HẠN LỐI VÀO SHOP

- Gỡ nút Spooky Shop độc lập khỏi menu “...”, đúng vị trí trong ảnh tham chiếu.
- Gỡ lối tắt Shop ở màn kết quả trận. Nút vào Spooky Shop chỉ còn trong dashboard Spooky Hunt của Battle Arena.
- Có thể mở dashboard và Shop ngoài tháng 10 để dùng Coins đã kiếm; nút bắt đầu trận vẫn bị chặn ngoài mùa. Việc mở dashboard không được coi là mở Arena để chiến đấu.
- Shop chỉ hiển thị danh sách hàng, giá và số dư. Gỡ hoàn toàn nút “Open 1 Spooky Capsule”, số Capsule, kết quả mở và bảng xem pool khỏi modal Shop.
- Giá và danh sách hàng của Shop giữ nguyên, bao gồm Spooky Capsule 25 Coins và Machete 613.000 Coins.

5. SPOOKY CAPSULE CHỈ MỞ TỪ STORAGE → ITEMS

- Spooky Capsule được khai báo là consumable, vẫn dùng ID spooky_capsule để giữ nguyên số lượng đã lưu.
- Ảnh vật phẩm: assets/items/spookycapsule.png. Không tạo hoặc đính kèm ảnh trong gói source.
- Vào Storage → Items, chọn Spooky Capsule rồi bấm “Open Spooky Capsule”. Mỗi lần mở tiêu thụ đúng 1 Capsule và nhận đúng 1 thẻ.
- Kết quả hiển thị ngay trong bảng chi tiết Storage, gồm tên thẻ và mutation nhận được. Không mở Shop, không đổi màn hình.
- Khi hết Capsule, nút mở bị vô hiệu hóa. Không cho mở trong combat hoặc Sandbox. Giao dịch vẫn dùng receipt chống tiêu thụ/cấp thưởng hai lần.
- Định nghĩa mới cập nhật ảnh và loại vật phẩm khi tải save cũ, không thay số lượng Capsule đang có.
- Source Info của Capsule trong Storage cho xem nguồn mua, pool hiện tại, trọng số và điều kiện mở The Judgement. Không cần tạo lại bảng pool trong vòng render tốc độ cao.

Giữ nguyên các trọng số Capsule đã được xác nhận ở bản trước:
The Trapper 30; Madness Doctor 30; The Legion 15;
The Judgement 10; The Clown 10; The Oni 10; Freddy Krueger 1.

Tổng được cung cấp là 106 nên tiếp tục chuẩn hóa trên tập đủ điều kiện:
  xác suất thực tế = trọng số thẻ / tổng trọng số đủ điều kiện.

The Judgement chỉ có trong pool khi hoàn tất Heavenly Tower Floor 100:
- Đã mở: tổng 106; hai thẻ trọng số 30 có xác suất 28,301887% mỗi thẻ,
  Legion 14,150943%, mỗi thẻ trọng số 10 là 9,433962%, Freddy 0,943396%.
- Chưa mở: bỏ Judgement, tổng 96; hai thẻ trọng số 30 là 31,25% mỗi thẻ,
  Legion 15,625%, Clown/Oni 10,416667% mỗi thẻ, Freddy 1,041667%.

Capsule không cấp EXP cho bản trùng, không cấp VNĐ và không tăng bộ đếm roll thông thường. Myers, Machete và Headless Horseman không được thêm vào pool Capsule.

6. KIỂM TRA TÍCH HỢP

Đã kiểm tra:
- Cú pháp toàn bộ JavaScript và tên script/CSS đúng chữ hoa/thường.
- Khởi động Chromium qua đường dẫn con kiểu GitHub Pages.
- Chọn 6 thẻ qua giao diện thật; đội 5 thẻ bị chặn; đội 6 thẻ bắt đầu được trận với đúng 3 địch.
- Thẻ thứ 6 lên sân và gây sát thương sau khi 5 vị trí đầu bị hạ.
- Chạy tiến trình đủ 50 wave với RNG ép trúng: 49 wave đầu không có phép thử đặc biệt; Wave 50 có thể nhận đồng thời cả ba món; lượt chạy trở về Wave 1 sau khi hoàn tất.
- Pool Capsule có/không có Judgement, tiêu thụ từng Capsule từ Storage, kết quả tại chỗ, nút bị khóa khi hết vật phẩm và số lượng giữ qua reload.
- Các chế độ 1v1, 4v4, Tower, Raid, Boss Event, Normal/EXP Time Trial giữ nguyên số thẻ.
- Gói save đầy đủ tiếp tục qua được bước mã hóa/giải mã và kiểm tra schema .acrsave.
- Giao diện mobile 390 px hiển thị đủ 6 ô, Storage không tràn ngang; không gặp lỗi JavaScript trong các luồng đã chạy.

7. MODIFIED FILES NOTE — FILE ĐƯỢC SỬA

1) spooky.js
   Tách số thẻ người chơi/địch; kiểm tra 6vs3; định nghĩa Capsule consumable và ảnh; giới hạn drop đặc biệt ở chiến thắng Wave 50; cập nhật Source Info.
2) app.js
   Đội hình 6 thẻ, kiểm tra 3 địch riêng, nhãn 6V3; dashboard Shop; bỏ các handler/nội dung mở Capsule từ Shop; chuyển kết quả Capsule sang Storage; thông báo drop Wave 50.
3) storage.js
   Kết quả Capsule tại bảng chi tiết; kiểm tra quyền mở; Source Info hiển thị pool/điều kiện; giữ số lượng và luồng giao dịch hiện có.
4) index.html
   Gỡ Shop khỏi menu chính/màn kết quả; gỡ giao diện mở Capsule và preview trong Shop; thêm vùng kết quả Storage; cập nhật nhãn 6vs3 và phiên bản cache.
5) styles.css
   Bố cục riêng cho 6 ô triển khai; định dạng kết quả Capsule; bỏ style của phần preview đã gỡ.
6) equipment.js
   Mô tả Headless Horseman ghi chính xác nguồn rơi Wave 50.
7) evolution.js
   Mô tả Machete ghi chính xác nguồn rơi Wave 50, giữ nguyên recipe Jason.
8) README.txt
   Changelog riêng của lần cập nhật này, công thức và danh sách file sửa.

Các module còn lại được kèm đầy đủ và giữ nguyên nội dung từ bản Spooky ổn định. Gói có 38 file nguồn/tài liệu. Cache JS/CSS: 20261020-spooky-2. Khi triển khai, thay đồng bộ source và giữ thư mục assets hiện có; bổ sung spookycapsule.png tại đúng đường dẫn nêu trên.

Không kèm Excel, test runner, log kiểm thử hoặc tài nguyên nhị phân/ảnh/âm thanh.
