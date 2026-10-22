NHẬT KÝ CẬP NHẬT — CỘNG BUFF, EXP FOOD VÀ FEED
Ngày phát hành: 22/10/2026

1. SỬA CÁCH CỘNG BONUS CHỈ SỐ NỘI TẠI

Thêm combat_stats.js để lưu mốc HP và ATK riêng cho từng đơn vị trong từng trận. Mốc này lấy từ chỉ số khi bắt đầu trận, sau level, mutation và thiết lập chỉ số của chế độ. Bonus % của nội tại được cộng vào cùng mốc, không tiếp tục nhân trên chỉ số đã được buff.

Công thức:
HP tối đa = làm tròn[HP mốc x (1 + tổng bonus HP)] + HP cộng thẳng.
ATK = ATK mốc x (1 + tổng bonus ATK) + ATK cộng thẳng.

Ví dụ: HP mốc 100, Wish +150% HP, Aqua +50% HP cho kết quả 100 x (1 + 1,5 + 0,5) = 300 HP; không còn thành 375 HP.

Các bonus cộng thẳng, như ATK lấy từ đối thủ hoặc HP hấp thụ của đồng đội đã ngã xuống, được giữ riêng. Chúng không trở thành mốc để nhân thêm mọi bonus % về sau. Hệ số sát thương của chiêu, chí mạng và khắc chế nguyên tố vẫn thuộc bước tính sát thương.

Đã cập nhật các đường tăng HP/ATK dùng chung, bao gồm buff đồng đội, tăng chỉ số sau khi hạ địch, bonus hồi sinh và các hiệu ứng của thẻ mới. Các bonus theo nguồn như Haki, First Strike, ngưỡng HP thấp, Storm Susano, Sweet Destruction, dạng kẹo và Systems Stats được quản lý riêng để tránh ghi đè lẫn nhau.

Bonus tạm thời hết hạn chỉ gỡ đúng nguồn của nó. Làm mới +20% HP/ATK của Android 21 không tiếp tục tăng chỉ số và vẫn hết hạn đúng sau khi làm mới. Myers thay đổi lượng HP từ Stalking dựa trên mốc cố định, không nhân lại HP đã buff. Khi đổi bộ chỉ số qua hồi sinh sao chép, mốc được khởi tạo lại cho bộ chỉ số mới. Tăng level trong trận điều chỉnh mốc thay vì nhân lại từng bonus một lần nữa.

2. EXP FOOD VÀ NGUỒN NHẬN

Storage có tab EXP Food riêng, tiếp tục giữ Items, Portals và Equipment.

Spooky Candy
- Mã vật phẩm: spooky_candy.
- EXP gốc: 1.000 mỗi món.
- Giá: 100 Spooky Coins tại Spooky Shop.
- Ảnh: assets/items/spcandy.png.

Bread
- Mã vật phẩm: bread.
- EXP gốc: 25 mỗi món.
- Thắng một trận thật nhận ngẫu nhiên 1, 2 hoặc 3 Bread với xác suất bằng nhau.
- Áp dụng cho 1v1, 4v4, Tower, Normal Time Trial, EXP Time Trial, Raid, Boss Event và từng trận thắng trong Spooky Hunt.
- EXP Time Trial nhận Bread khi lượt thử kết thúc với kết quả thắng; không nhận thêm Bread cho từng EXP Monster.
- Thua, bỏ trận và Sandbox không nhận Bread. Gọi xử lý lại cùng kết quả không cộng lại vật phẩm.
- Số lượng Bread được giữ đúng khoảng 1–3, không nhân thêm Drop Multiplier.
- Ảnh: assets/items/bread.png.

Thức ăn nằm trong Storage; nhận thức ăn không tự tăng EXP cho thẻ. Các chế độ vốn không cho EXP trực tiếp vẫn giữ quy tắc đó. Bread là phần thưởng vật phẩm bổ sung của bản cập nhật này.

3. GIAO DIỆN FEED XP FOOD

Mở một thẻ đã sở hữu trong Index/chi tiết thẻ và chọn Feed ngay dưới các nút Salvage.

- Bên trái hiển thị ảnh, tên, EXP và level đúng dạng Lvl [level]/1000.
- Bên phải hiển thị các EXP Food đang có, số lượng và ô nhập số món muốn dùng.
- Add All chọn toàn bộ thức ăn hiện có; Remove All bỏ toàn bộ lựa chọn.
- Khung “These items will be used!” xem trước các món đã chọn và EXP dự kiến.
- Feed xác nhận sử dụng; Cancel đóng hộp thoại.
- Không có dòng hướng dẫn về vượt giới hạn level.

Công thức EXP Food:
EXP nhận = phần nguyên[(1.000 x số Spooky Candy + 25 x số Bread) x EXP Multiplier hiện tại của người chơi].

EXP Multiplier được đọc lại khi Feed, gồm các nguồn EXP có hiệu lực cho hoạt động ngoài Arena. Chỉ nhân một lần trên tổng EXP gốc của thức ăn. Ví dụ ở x2, dùng 1 Spooky Candy và 2 Bread cho (1.000 + 2 x 25) x 2 = 2.100 EXP.

Không cho Feed thẻ chưa sở hữu, đang ở Lvl 1000, trong trận chiến hoặc trong Sandbox. Không trừ thức ăn khi kiểm tra thất bại. Level được giới hạn tại 1000 theo hệ thống hiện có; thức ăn đã xác nhận dùng được tiêu theo số lượng người chơi chọn.

Giao dịch lưu đồng thời bản trước/sau của EXP và kho thức ăn. Nếu ghi save bị lỗi, game khôi phục cả hai; nếu trang đóng giữa giao dịch, game phục hồi bản trước khi tải tiến độ. Nhật ký giao dịch được đưa vào gói .acrsave; save cũ chưa có dữ liệu EXP Food vẫn nhập được.

Công thức yêu cầu EXP và tăng chỉ số theo level không thay đổi. EXP Time Trial vẫn dùng mức gốc 0,1%–1,5% và không áp dụng EXP Multiplier; đây là cơ chế riêng với EXP Food. Normal Time Trial giữ 2 giây/lượt, EXP Time Trial giữ 1 giây/lượt.

4. SỬA CHI TIẾT THẺ TRÊN MOBILE

Chi tiết thẻ chuyển thành bố cục dọc trên màn hình nhỏ. Khung ảnh có chiều cao ổn định; phần level, mutation và các nút thao tác nằm trong vùng cuộn, không chồng lên ảnh hoặc lên nhau. Nút Salvage và Feed đủ chiều cao để thao tác cảm ứng. Feed XP Food cũng xếp dọc trên mobile và giữ Feed/Cancel trong vùng thao tác phía dưới.

5. LÀM LẠI THE FIRST HUMAN — ASCENSION

Khi bị tấn công bằng đòn nội tại, The First Human sao chép nội tại của kẻ tấn công trong 3 lượt trận. Hết thời hạn, bản sao bị gỡ. Sau khi bản sao hết hạn, chờ 5 lượt trận trước khi có thể sao chép tiếp. Đòn thường và sát thương theo thời gian từ Burn/Bleed không kích hoạt khả năng này.

Bản sao sử dụng hệ thống thực thi nội tại có sẵn. Những bản sao phụ được tạo bởi nội tại mượn cũng bị gỡ khi hết hạn; các nội tại đã có từ trước được giữ nguyên. Bonus chỉ số nội tại tạm thời thuộc bản sao bị gỡ theo nguồn. Trạng thái chỉ tồn tại trong trận và tách biệt giữa Arena với Sandbox.

6. MODIFIED FILES NOTE — GHI CHÚ TỆP THAY ĐỔI

Tệp mới:
- combat_stats.js: mốc chỉ số, tổng bonus %, bonus theo nguồn và bonus cộng thẳng; dữ liệu WeakMap riêng theo bộ mô phỏng.
- exp_food.js: định nghĩa thức ăn, thưởng Bread, giao dịch Feed có phục hồi và giao diện Feed XP Food.

Tệp đã sửa:
- app.js: nối nút Feed, chuẩn bị/cập nhật tiến độ sau Feed, thưởng Bread từ kết quả trận thật và tích hợp kho giao dịch vào export/import/reset.
- cards.js: mô tả Ascension của The First Human.
- passives.js: cộng bonus theo mốc; quản lý gỡ bonus tạm, tăng level/hồi sinh và vòng đời nội tại sao chép của First Human.
- spooky_passives.js: tính HP Stalking của Myers qua nguồn bonus riêng.
- grimoire.js: khởi tạo lại mốc chỉ số khi Julius dùng backup life.
- requiem.js: giữ HP hấp thụ của Xtreme Chan dưới dạng HP cộng thẳng.
- spooky.js: thêm Spooky Candy giá 100 Spooky Coins.
- storage.js: lọc tab EXP Food và thông tin nguồn nhận/cách sử dụng.
- index.html: nút Feed, modal thức ăn, tab Storage, thứ tự nạp module và mã phiên bản tệp mới.
- styles.css: giao diện Feed và bố cục chi tiết thẻ thích ứng desktop/mobile.
- startup.js: kiểm tra các module mới khi khởi động.
- README.txt: chỉ ghi thay đổi của bản phát hành này.

7. KIỂM TRA VÀ TỆP BÀN GIAO

Đã kiểm tra cú pháp JavaScript, khởi động qua đường dẫn thư mục con tương tự GitHub Pages, cộng Wish/Aqua, làm mới/hết hạn bonus, Feed với EXP Multiplier, chặn Feed Lvl 1000, khôi phục lỗi ghi save, vòng đời sao chép First Human và vòng nhận Bread trong tám nhánh chế độ. Đã chạy 167 thẻ qua hơn 3.000 lượt mô phỏng và kiểm tra giao diện ở chiều rộng 320px, 390px và desktop.

Gói bàn giao chứa đầy đủ nguồn game và README.txt. Không kèm Excel, ảnh, âm thanh, log hoặc mã kiểm thử. Các đường dẫn ảnh mới được khai báo ở trên để người quản lý dự án bổ sung asset hiện có.
