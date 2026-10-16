NHẬT KÝ CẬP NHẬT — SANDBOX, ẨN THẺ ROLL, CẤP THẺ VÀ MARCO
Ngày: 16/10/2026

1. CÔNG TẮC HIDE ROLLING CARD

Thêm công tắc ON/OFF ngay bên dưới Cooldown, ở góc phải thanh thông số của màn hình Roll. Trạng thái được lưu khi tải lại trang và đi cùng save .acrsave.

Khi ON:
- Ẩn hình thẻ và hiệu ứng kết quả trùng; hiển thị vùng thông báo nhẹ thay thế.
- Hiện kết quả nếu nhận một thẻ chưa sở hữu, hoặc nhận một mutation/biến thể double mutation chưa sở hữu của thẻ đó.
- Thẻ mới giữ nguyên trên màn hình đến lần roll được chấp nhận tiếp theo. Bấm khi còn cooldown không làm mất kết quả đang xem.
- Double mutation có cùng hai thành phần được coi là cùng biến thể, dù thứ tự hai mutation đảo ngược.
- Nếu đã sở hữu thẻ dưới dạng mutation, roll bản Normal không được tính là mutation mới.
- Miss cũng không phát hiệu ứng hình ảnh khi đang ẩn.

Khi OFF, khôi phục cách hiển thị thông thường. Có thể xem lại kết quả gần nhất đang bị ẩn mà không roll thêm hoặc nhận thêm phần thưởng.

Việc xét sở hữu được thực hiện trước khi cộng thẻ vừa roll. RNG, cooldown, Auto Roll, bộ đếm roll, cộng thẻ, EXP và các sự kiện nhiệm vụ vẫn đi qua luồng xử lý thông thường; công tắc chỉ điều khiển phần trình bày.

2. BỎ GIỚI HẠN CẤP CŨ

Bỏ giới hạn gameplay Lv.999 và các kiểm tra tương ứng trong hệ thống cấp thẻ, chiến đấu và EXP Time Trial. Thẻ tiếp tục tăng cấp qua Lv.100, Lv.999 và Lv.1.000.

Bỏ thao tác migration cũ tự hạ thẻ về Lv.10 khi save chưa có cờ migration. Các bản ghi cấp hợp lệ trong save mới/cũ được giữ nguyên; dữ liệu cardProgress chính được ưu tiên, dữ liệu cấp trong các kho cũ chỉ bổ sung bản ghi còn thiếu. Cờ migration lịch sử không kích hoạt lại thao tác hạ cấp.

Công thức hiện hành được giữ nguyên:
- Hệ số HP và ATK theo cấp L: 1 + 0,075 x (L - 1).
- EXP để lên cấp từ L: floor(100 x hệ số độ hiếm x L).
- Hệ số độ hiếm: Common = 1; Rare = 1,6; Epic = 2,4; Legendary = 3,6; Mythic = 5,2; Secret = 8.
- EXP để tăng liên tiếp n cấp từ L: 100 x hệ số độ hiếm x n x (L + (n - 1) / 2).
- Tìm số cấp đủ EXP bằng tìm kiếm nhị phân, tránh vòng lặp kéo dài khi nhận lượng EXP lớn.

Chỉ giữ ranh giới số nguyên an toàn của JavaScript (Number.MAX_SAFE_INTEGER = 9.007.199.254.740.991), không dùng Lv.100 hoặc Lv.999 làm trần gameplay.

Điều kiện Evolution yêu cầu Lv.100 trở lên và khoảng độ khó Raid/Boss Event 1–1.000 vẫn giữ nguyên, vì đây không phải giới hạn cấp thẻ người chơi.

3. SỬA PHOENIX INFERNO CỦA MARCO

Lượt cứu đồng đội một lần/trận hoạt động như cơ chế ngăn tử vong:
- Khi một đồng đội khác nhận đòn chí tử, hoặc lượng HP sau sát thương sẽ xuống dưới 10% max HP, Marco còn sống và dùng được nội tại sẽ cứu đồng đội đó.
- Ngăn tử vong trước khi chạy các xử lý chết, hạ gục hoặc hồi sinh riêng của nạn nhân; không yêu cầu nạn nhân phải còn HP sau đòn chí tử.
- Đổi vị trí Marco với đồng đội được cứu, rồi hồi đồng đội lên max HP.
- Đánh dấu đã dùng lượt cứu trước các callback để tránh kích hoạt lặp.
- Bleed vẫn chặn hồi HP. Nếu được cứu khỏi đòn chí tử trong lúc Bleed, đồng đội còn ít nhất 1 HP.
- Đòn bị shield hấp thụ hết không tiêu tốn lượt cứu khi đồng đội chưa rơi vào ngưỡng nguy hiểm.
- Áp dụng cho sát thương thường, sát thương nội tại và Burn/Bleed. Marco đã chết hoặc bị khóa nội tại không thể cứu.
- Sát thương thực sự đã trừ HP được ghi nhận trước bước hồi máu, tránh mất số liệu sát thương của trận.

Không đổi chỉ số gốc, tỷ lệ chặn đòn/counter hoặc cơ chế dodge tăng HP của Marco.

4. SANDBOX MODE — KHU VỰC THỬ NGHIỆM ĐỘC LẬP

Lối vào: nút SANDBOX MODE bên cạnh tiêu đề Battle Arena. Chỉ mở khi không có trận thật hoặc thao tác chuyển save đang diễn ra.

Cấu hình hai đội:
- Cả đội người chơi và đối thủ đều chọn được toàn bộ 129 thẻ trong Index, bao gồm thẻ khóa, chưa sở hữu, Quest, Evolution và Secret.
- Thêm/xóa tối đa 10 vị trí cấu hình ban đầu cho mỗi bên. Giới hạn vị trí cấu hình này không đặt thêm giới hạn lên clone/summon phát sinh từ nội tại.
- Mỗi vị trí chọn được tối đa hai mutation khác nhau, cấp, max HP và ATK. ATK tùy chỉnh có thể bằng 0.
- Khi đổi thẻ, cấp hoặc mutation, HP/ATK mặc định được tính lại. Giá trị HP/ATK nhập tay là chỉ số đầu trận cuối cùng, không nhân mutation/cấp lần thứ hai.
- Công thức mặc định: làm tròn(chỉ số Lv.1 x hệ số cấp x hệ số mutation tương ứng). Double mutation nhân các hệ số thành phần.
- Nội tại vẫn có thể tăng/giảm các chỉ số này sau khi bắt đầu trận.
- Nút Lv.1000 Preset là cấu hình thử nhanh, không phải cấp tối đa. Có thể nhập cấp cao hơn trực tiếp.
- Reset Default Stats đưa các vị trí về Lv.1, không mutation và chỉ số mặc định; Clear Team xóa cả đội; Add Slot thêm vị trí mới.

Thiết lập và điều khiển trận:
- Turn Duration nhập trực tiếp từ 0,1 đến 60 giây, mặc định 2 giây. Có thể đổi trong trận; potion của save thật không điều khiển timer Sandbox.
- Có RNG seed riêng để lặp lại thử nghiệm với cùng đội hình và cấu hình. Sandbox không tiêu thụ chuỗi RNG của chế độ thật.
- Có lựa chọn thời tiết thử nghiệm và lựa chọn nội tại của Aqua, không thay đổi thời tiết hay phần thưởng của save thật.
- Start Sandbox khởi tạo trận mới; Pause/Resume tạm dừng/tiếp tục; Step Turn chạy một lượt khi tạm dừng; Stop Battle dừng thử nghiệm.
- Hiển thị từng đơn vị, HP/ATK hiện tại, shield, trạng thái, nội tại, số lượt và tổng sát thương hai bên. Nhật ký giữ tối đa 150 sự kiện gần nhất.
- Chỉ kết thúc khi toàn bộ hàng đợi đơn vị của một bên bị hạ, bao gồm đơn vị được tạo thêm.
- Exit Sandbox, phím Escape hoặc bấm nền ngoài cửa sổ đưa về Arena thật. Thoát giữa trận hủy timer và runtime thử nghiệm.

Cách ly tiến trình:
- Dùng một runtime PassiveSystem riêng với RNG, bộ đếm, trạng thái và callback nhật ký riêng.
- Thẻ và mutation tham gia thử nghiệm là bản sao; không dùng đơn vị hay đội hình chiến đấu thật.
- Không gọi callback nhận thưởng, hạ địch cho nhiệm vụ, đổi thời tiết thật hoặc lưu tiến trình.
- Thắng, thua, giết địch, sát thương, số lượt và thẻ sử dụng trong Sandbox không tăng nhiệm vụ, achievement, chỉ số người chơi, roll, EXP, VNĐ, tiền chế độ, vật phẩm hoặc tiến trình thẻ.
- Có chốt chặn bổ sung ở luồng Quest, Achievement, cộng EXP, roll, lưu save và kết thúc trận thật khi Sandbox đang mở.
- Auto Roll thật tạm ngừng nhưng giữ trạng thái bật; tiếp tục khi thoát nếu đủ cooldown. Auto Continue Battle được tạm ngừng và khôi phục việc lên lịch khi quay lại kết quả trận thật.
- Không xuất/nhập save trong Sandbox. Không lưu cấu hình hoặc kết quả Sandbox vào localStorage hay .acrsave; tải lại trang sẽ mất phiên thử nghiệm.
- Đồng hồ thời tiết và thời hạn potion thật vẫn dựa trên thời gian thực; khi thoát, giao diện thật đồng bộ lại thời gian đã trôi qua.

5. CẤU TRÚC THAY ĐỔI TRONG BẢN NÀY

Module mới:
- levels.js: tính cấp, EXP và hệ số chỉ số; không tự ghi save.
- roll_view.js: công tắc ẩn kết quả roll và trạng thái trình bày gần nhất.
- sandbox.js: cấu hình đội, RNG riêng, timer, runtime chiến đấu độc lập và giao diện Sandbox.

Module tích hợp:
- app.js: điều phối roll, cấp thẻ, cầu nối mở/thoát Sandbox, chặn tiến trình thật và bổ sung tùy chọn ẩn roll vào save.
- passives.js: tạo runtime độc lập dùng lại cùng bộ luật chiến đấu; sửa cơ chế cứu chí tử của Marco.
- cards.js: mô tả Marco khớp cơ chế mới.
- achievements.js và quest.js: chặn tracking/claim trong Sandbox.
- timetrial.js: bỏ kiểm tra trần Lv.999 trong luồng cấp EXP.
- index.html và styles.css: công tắc dưới Cooldown, lối vào Sandbox, màn hình cấu hình và bố cục responsive.

6. KIỂM TRA VÀ BÀN GIAO

Đã kiểm tra cú pháp, khởi động trình duyệt, trạng thái mới/trùng của thẻ và mutation, cấp vượt 100/999, các trường hợp cứu chí tử của Marco, cách ly localStorage/tiến trình Sandbox, timer và thao tác thoát. Đã đối chiếu các trận xác định bằng seed cho 128 thẻ ngoài Marco với bản trước.

Luồng bảo vệ .acrsave và hai cooldown 7 ngày độc lập được giữ nguyên; đã kiểm tra vòng đóng gói/giải mã/đọc save và từ chối dữ liệu bị sửa. Tower, Raid, Boss Event, Evolution, Element và thông số phần thưởng không được cân bằng lại trong bản cập nhật này.

Gói bàn giao chứa mã nguồn game đầy đủ và README.txt này. Không kèm Excel, script kiểm thử, log xác thực hoặc tài nguyên ảnh/âm thanh mới. Tiếp tục dùng các tài nguyên đã có của dự án.
