NHẬT KÝ CẬP NHẬT 04/11/2026
CARD INDEX, RELIC DÙNG CHUNG, KHÓA THẺ VÀ THE MOURNER

1. Giao diện chi tiết thẻ trong Index
- Bố cục mới cho máy tính và điện thoại: tên thẻ, cấp, tổng số bản sao xN, nút EQUIP và Feed.
- Ô Relic ở góc trên trái ảnh thẻ mở danh sách trang bị; hiển thị tên, độ hiếm và đúng các chỉ số đã roll của từng Relic.
- Bộ chọn Mutation chỉ liệt kê các biến thể đang sở hữu, gồm cả đột biến kép. Đổi biến thể chỉ đổi phần xem trước.
- Hiển thị ATK, HP, thanh EXP và toàn bộ Category dưới dạng nhãn. Không thêm SPA, Cost hoặc phần Leader.
- Nhãn kỹ năng Bleed, Heal, Stun, Freeze, Follow Up và Shield được tạo theo mô tả nội tại của thẻ.
- Hai nút dưới cùng: Salvage 1 Copy và Salvage Extra Duplicate; bố cục không tràn ngang trên điện thoại.

2. Relic gắn theo ID thẻ
- Mỗi ID thẻ có tối đa một Relic được trang bị, dùng chung cho mọi bản sao, Mutation và Double Mutation của thẻ đó.
- Chỉ số đã roll và Unique của Relic được giữ nguyên; không roll lại khi chuyển đổi dữ liệu hoặc đổi Mutation.
- Dữ liệu gắn theo bản sao cũ được chuyển tự động. Nếu nhiều Relic từng gắn vào các biến thể của cùng thẻ, ưu tiên bản có số thứ tự bản sao thấp hơn, rồi ID Relic; các Relic còn lại được tháo và giữ nguyên trong Kho đồ.
- Xóa hết một biến thể không tháo Relic nếu vẫn còn sở hữu biến thể khác của cùng thẻ. Mất toàn bộ bản sao mới tháo Relic về Kho đồ.
- Giữ cơ chế bảo toàn Relic khi hồi sinh và sao chép Relic của chủ thể triệu hồi cho đơn vị được tạo.

3. Khóa thẻ và bảo vệ bản sao
- Nút khóa trong chi tiết Index được lưu vào hồ sơ người chơi theo ID thẻ.
- Thẻ đã khóa được bảo vệ khi Salvage All Extra Duplicates và khi salvage riêng trong cửa sổ chi tiết.
- Salvage chỉ xử lý số lượng dư: luôn giữ một bản của mỗi tổ hợp Mutation chính xác. Hai đột biến có cùng thành phần nhưng khác thứ tự vẫn dùng khóa biến thể chuẩn của game.
- Salvage 1 Copy không xóa bản cuối của biến thể đang xem. Mở khóa để tiếp tục salvage các bản dư.

4. Thẻ Secret mới: The Mourner
- Dark; 1 in 168,000,000; HP 149,000; ATK 36,500.
- Category: Villian, Unhuman, VideoGame, Brutal, Supporter.
- Mở khóa qua chuỗi nhiệm vụ mới; sau khi hoàn thành có thể roll trong Eclipse Weather.
- The Solemn Lament được tách vào mourner.js: hai buồng đạn, Butterfly thường và Crystal, Lament cộng dồn theo chỉ số gốc, Prayer/Reload, Lament Condition và Final Requiem.
- Mỗi Butterfly trên kẻ địch bị hạ cho +2 Lament và hồi 2.5% HP tối đa. Lament tối đa 15, tương ứng +45% ATK; không cộng nhân chồng chỉ số.
- Đếm đòn độc lập với mục tiêu; Reload không đặt lại bộ đếm. Hai viên đạn được xử lý tuần tự qua khiên và HP.
- Final Requiem tiêu thụ Butterfly để gây phần sát thương theo HP hiện tại, bỏ qua giảm sát thương nhưng vẫn chịu khiên và miễn nhiễm.
- Đồng đội được Requiem hồi sinh trở lại tuyến đầu với đầy HP, giữ chỉ số hiện có và Relic; bị loại sau đúng 3 lượt chiến đấu của cả hai phe. Tôn trọng các nội tại cấm hồi sinh của thẻ.
- Crystal Butterflies kích hoạt một lần mỗi trận. Lần Final Requiem ở mốc 10 đòn kế tiếp hồi đầy HP và khôi phục thêm 5 viên mỗi loại, tối đa 10 viên mỗi buồng.
- Chỉ tham chiếu ảnh assets/cards/themourner.png. Người chơi tự bổ sung ảnh; gói mã nguồn không chứa ảnh, âm thanh hoặc tệp Excel.

5. Chuỗi nhiệm vụ The Mourner
- Bước 1: Hồi sinh hoặc tạo bản sao tổng cộng 1,000 đồng đội.
- Bước 2: Kích hoạt 10,000 đòn follow-up.
- Bước 3: Roll 168,000 lần trong Eclipse Weather.
- Bước 4: Thắng 1,680 trận 1v1 thường trong Eclipse Weather.
- Bước 5: Sống sót qua 168 đòn chí tử trong Eclipse Weather.
- Chỉ bước hiện tại được tính sau khi nhận nhiệm vụ; không cộng ngược dữ liệu cũ. Sandbox và Online PvP không được tính. Hoàn thành nhận đúng một thẻ Normal và mở khóa roll.
- Trong Portal Party chỉ tính sự kiện của người chơi sở hữu đơn vị, không cộng sự kiện của thành viên khác.

6. Kiểm tra bản cập nhật
- Kiểm tra cú pháp toàn bộ JavaScript và đường dẫn script, tên tệp phân biệt hoa/thường.
- Kiểm tra trình duyệt cho chuyển dữ liệu Relic, trang bị trên mọi Mutation, lưu khóa thẻ, salvage an toàn, chọn biến thể và EQUIP trên điện thoại.
- Kiểm tra đạn kép, khiên, Reload bị gián đoạn, điều kiện miễn Stun/Freeze, Butterfly/Lament, Requiem và hồi sinh tạm thời 3 lượt.
- Kiểm tra nhiệm vụ tuần tự, loại trừ mô phỏng/PvP và chỉ trao thưởng một lần.
- So sánh mô phỏng có cùng seed cho 180 thẻ cũ với bản trước: không thay đổi kết quả chiến đấu trong bộ kiểm tra hồi quy.
- Cập nhật nhãn cache thành 20261104-mourner-index-1. Sau khi thay đủ mã nguồn trên GitHub Pages, tải lại bằng Ctrl+F5.

Modified Files Note
- cards.js: thêm định nghĩa, chỉ số, nguồn roll và mô tả The Mourner.
- mourner.js (mới): toàn bộ cơ chế The Solemn Lament và hồi sinh tạm thời.
- passives.js: nối kỹ năng mới vào engine, sát thương/khiên/DoT/trạng thái và ghi nhận các lần sống sót, hồi sinh.
- companions.js: ghi nhận các lần tạo bản sao hoặc hồi sinh được chấp thuận.
- quests.js: chuỗi nhiệm vụ The Mourner, dùng chung bộ đếm follow-up và chặn sự kiện mô phỏng/PvP.
- relics.js: gắn Relic theo ID thẻ, chuyển dữ liệu cũ và kiểm tra quyền sở hữu chung.
- card_details.js (mới): giao diện chọn Mutation, Category, nhãn kỹ năng, khóa thẻ và chọn Relic.
- app.js: lưu khóa thẻ, bảo vệ salvage, cập nhật phần xem trước và nối các mô-đun.
- index.html: bố cục chi tiết Index, danh sách Relic và thứ tự tải script/nhãn cache mới.
- styles.css: giao diện Index, EQUIP, nút salvage, các nhãn và bố cục tương thích điện thoại.
- startup.js: kiểm tra tải đủ hai mô-đun mới.
- README.txt: chỉ giữ nhật ký của bản cập nhật này.
