NHẬT KÝ CẬP NHẬT 16/10/2026
NHẬP SỐ CHÍNH XÁC, MADARA LUBU, SHIELD VÀ QUEST CARD

1. NHẬP ĐỘ KHÓ BẰNG SỐ

- Lobby Raid và Boss Event có thêm ô nhập số bên cạnh thanh trượt.
- Nhập số nguyên từ 1 đến 1.000; nhấn Enter hoặc rời ô để xác nhận. Thanh trượt, level địch, phần xem trước và dữ liệu lưu đồng bộ theo giá trị đã xác nhận.
- Số vượt khoảng được đưa về đầu mút hợp lệ; phần thập phân được làm tròn xuống. Ô trống trả về độ khó đang lưu.
- Game không ghi đè nội dung đang gõ khi lobby tự cập nhật. Khóa cả hai điều khiển trong lúc trận đang diễn ra.

2. THÀNH TỰU BOSS EVENT CỘNG DỒN

- Theo dõi tổng số lần thắng đã lưu của tất cả loại Boss Event, tách biệt với tổng thắng Raid.
- Các mốc: 1; 10; 100; 1.000; 10.000; 100.000; 1.000.000; 10.000.000; 100.000.000.
- Mỗi mốc cho +0,1 Drop Multiplier vĩnh viễn sau khi nhấn Claim reward trong Achievements, mục Total Boss Event clears.
- Hoàn tất cả 9 mốc Boss Event cho +0,9. Kết hợp 9 mốc Raid hiện có (+0,45), Drop Multiplier tối đa từ hai nhóm này là x2,35.
- Drop Multiplier áp dụng cho số lượng vật phẩm rơi như Shards, Raid Coins, Boss Event Coins, Tower Coins và key; không nhân VNĐ hoặc EXP, không sửa xác suất thẻ Secret.
- Số lượng = floor(số lượng gốc x Drop Multiplier), thêm 1 với xác suất bằng phần thập phân còn lại.
- Khôi phục phần thưởng đang chờ không cộng thêm một lần thắng. Save chấp nhận các phần thưởng đã chốt với Drop Multiplier đến x2,35.

3. MADARA LUBU: MỐC MANGEKYO TOWER TẦNG 200

- Mangekyo dùng Tower Tsukuyomi hiện có; không tạo thêm một Tower hoặc thay đổi điều kiện đội hình người chơi.
- Thắng tầng 200 của Tower Tsukuyomi tự cấp 1 Madara Lubu bản Normal và mở khóa roll vĩnh viễn. Chỉ roll được khi Tsukuyomi/Mangekyo đang hoạt động.
- Mã thẻ: madara-lubu. Điều kiện: tower_floor_200_tsukuyomi.
- Element Fire; Secret; tỷ lệ 1 trong 10.000.000; HP cấp 1: 500.000; ATK cấp 1: 100.000.
- Artwork tham chiếu: assets/cards/madaralubu.png.

Divine Steed:
- 10% né đòn thường và đòn gây sát thương từ passive. Né thành công khóa passive của người đánh trong 5 lượt của người đó.
- Mỗi lần nhận Stun có 50% kháng Stun; không đồng nhất Stun với Freeze.
- Từ đòn thứ 5, mỗi đòn có 50% tạo follow-up gây 100% ATK hiện tại. Follow-up có thể tiếp tục kích hoạt follow-up, không áp giới hạn số đòn cố định.
- Follow-up trúng và gây sát thương áp dụng Bleed trong 3 lượt, mỗi lượt bằng 25% ATK hiện tại tại lúc áp dụng.
- Mỗi đòn có 20% gọi một đồng đội còn sống và không bị khống chế đánh hỗ trợ. Các đòn gọi hỗ trợ được xử lý qua hàng đợi để không tạo đệ quy JavaScript.
- Khi là đơn vị duy nhất còn sống trong đội, triệu hồi 3 Clone đúng một lần/trận. Mỗi Clone có 50% max HP và ATK hiện tại của Madara; mỗi Clone nhận riêng shield bằng 50% max HP của Madara tại lúc triệu hồi.
- Mỗi Clone chọn ngẫu nhiên một passive của đồng đội gốc đã chết, tuân thủ các ngoại lệ không được sao chép đang có. Nếu không có passive hợp lệ, Clone không nhận passive.
- Clone/summon không được tạo thêm Clone/summon. Không thêm giới hạn triệu hồi chung cho các thẻ khác.

4. SHIELD CHẶN SÁT THƯƠNG DƯ

- Nếu shield còn lớn hơn 0 khi nhận một đòn, shield hấp thụ toàn bộ đòn đó. Phần vượt giá trị shield không chuyển sang HP.
- Ví dụ: shield 10 nhận 20 sát thương -> shield về 0, HP giữ nguyên. Đòn tiếp theo mới gây sát thương HP khi không còn shield.
- Nếu shield lớn hơn sát thương, trừ đúng sát thương vào shield và vẫn giữ nguyên HP.
- Áp dụng cho đòn thường, đòn passive và từng tick Burn/Bleed. Shield không xóa trạng thái Burn/Bleed hoặc thời gian còn lại của chúng.
- Shield vỡ vẫn giữ hiệu ứng vỡ shield vốn có. Đòn được shield chặn không tiêu thụ hiệu ứng sống sót/hồi sinh do xét nhầm sát thương chí tử.
- Sát thương dùng cho Mana và thống kê VNĐ Tower là HP thực sự bị mất; sát thương bị shield chặn không được tính.

5. HỆ THỐNG QUEST CARD RIÊNG

- Thêm quest.js để quản lý định nghĩa quest, sự kiện tiến độ, lưu localStorage, nhận quest, đối soát thưởng và giao diện.
- Mở menu ... rồi chọn Quest Cards; mục này tách biệt với Evolution.
- Giao diện quest hiển thị tên và artwork, không hiển thị HP, ATK hoặc passive. Index cũng ẩn passive của Quest Card chưa mở khóa.
- Nhấn Accept Quest để bắt đầu theo dõi. Không lấy lại số roll, Index, số trận hoặc số quái đã hạ trong quá khứ.
- Các bước chạy tuần tự. Chỉ bước đang mở được cộng; sự kiện hoàn tất bước trước không được dùng lại cho bước sau.
- Trận đã bắt đầu trước khi nhận quest không được tính. Không thể nhận quest mới khi đang đánh hoặc đang chuyển save.
- Hoàn thành trận tính cả thắng và thua, kể cả các chế độ đặc biệt. Bỏ cuộc, thoát giữa trận và trận chưa hoàn tất khi tải lại không tính.
- Điều kiện thời tiết của lượt roll lấy tại lúc roll; điều kiện thời tiết của trận lấy lúc bắt đầu; điều kiện thời tiết khi hạ quái lấy tại lúc hạ quái.
- Điều kiện có Igris xét đội hình ban đầu. Mỗi Normal Demon gốc được tính tối đa một lần trong một trận khi bị phía người chơi hạ; Clone/summon không tăng bộ đếm này.
- Lượt roll hụt vẫn tính cho bước yêu cầu số lần roll; bước yêu cầu thẻ hoặc mutation chỉ tính kết quả phù hợp. Double mutation được xét từng thành phần.
- Hoàn tất toàn bộ bước tự cấp 1 thẻ bản Normal, không nhận mutation từ thời tiết đang bật. Receipt bảo đảm không cấp trùng khi tải lại hoặc khôi phục thưởng đang chờ.
- Sau đó thẻ tham gia roll tiêu chuẩn theo điều kiện thời tiết riêng của thẻ. Tiến độ, trạng thái nhận quest và receipt thưởng đi cùng gói .acrsave; save cũ chưa có kho quest vẫn nhập được.

SUNG JIN WOO

- Element Water; Secret; tỷ lệ 1 trong 2.023.000; HP cấp 1: 223.000; ATK cấp 1: 22.300. Roll trong Shadow sau khi mở khóa.
- Artwork: assets/cards/sungjinwoo.png.
- Bước 1: hoàn thành 1.000 trận 1v1 trong Shadow.
- Bước 2: roll 10.000 lần trong Shadow.
- Bước 3: hoàn thành 1.000 trận ở bất kỳ chế độ nào với Igris trong đội hình ban đầu.
- Bước 4: roll Igris mang Monarch, chấp nhận Monarch trong double mutation.

Systems Stats:
- Mỗi lần chính thẻ này hạ địch, tạo một Shadow không có passive với 50% max HP và ATK của kẻ bị hạ; giữ các ngoại lệ không được sao chép.
- Chọn một bonus khi bắt đầu trận và chọn lại sau mỗi lần hạ địch: +15% ATK, +20% max HP hoặc hồi 1,5% max HP mỗi đòn. Bonus giữ nguyên đến lần hạ tiếp theo, không cộng dồn với chính nó và không xóa buff từ nguồn khác.
- Mỗi đòn chọn một hành động: Hunter Slash gây 120% ATK; Shadow Attack gọi một Shadow hoặc đồng đội ở sau đánh hỗ trợ; Fang Strike gây 60% ATK lên 2 địch phía trước.

FRIEREN

- Element Holy; Secret; tỷ lệ 1 trong 2.500.000; HP cấp 1: 200.000; ATK cấp 1: 25.000. Roll trong Heavenly sau khi mở khóa.
- Artwork: assets/cards/frieren.png.
- Bước 1: hạ 10.000 Normal Demon ở bất kỳ chế độ nào.
- Bước 2: hoàn thành 1.000 trận 1v1 trong Heavenly.
- Bước 3: roll 1.000 thẻ mang Angelic, tức mutation của Heavenly; chấp nhận double mutation.

Endless Mana:
- Mỗi lần mất HP do sát thương nhận +3,5% Mana. Shield chặn hết sát thương không cho Mana.
- Hệ số sát thương từ Mana = 1 + 0,005 x số điểm % Mana. Ví dụ 50% Mana cho +25% sát thương; 100% Mana cho +50%.
- Đạt 100% Mana: hồi 35% max HP, dùng Zoltraak gây 175% ATK hiện tại với bonus Mana tương ứng rồi đặt Mana về 0. Không có chuyển sát thương dư sang mục tiêu khác.
- Nếu còn sống sau đòn và HP dưới 25%, lập tức dùng Zoltraak và nhận 30% Mana, đúng một lần/trận.
- Đòn thường được thay bằng một phép ngẫu nhiên: Vollzanbel gây 40% ATK lên toàn bộ địch; Time Dilation Stun toàn bộ địch 1 lượt rồi khóa passive thêm 1 lượt; Healing hồi 25% max HP cho toàn đội.
- Thời gian khóa passive sau Time Dilation bắt đầu khi Stun kết thúc, không bị tiêu hao trong lượt Stun. Thanh trạng thái hiển thị Mana hiện tại.

ALEXANDER ANDERSON

- Element Water; Mythic; tỷ lệ 1 trong 777.000; HP cấp 1: 77.700; ATK cấp 1: 7.700. Không khóa thời tiết khi roll sau khi mở khóa.
- Artwork: assets/cards/alexanderanderson.png.
- Bước 1: hoàn thành 1.000 trận Alucard Event ở Difficulty > 6, tức từ 7 trở lên.
- Bước 2: hạ 10.000 Normal Demon trong Eclipse/Eclipsed.
- Bước 3: roll 10.000 lần trong Heavenly.

Pray to God:
- Mỗi đòn có 77% tạo follow-up gây 77% ATK hiện tại; follow-up có thể tiếp tục kích hoạt không giới hạn số đòn cố định.
- Follow-up thứ n trong chuỗi áp dụng Bleed n lượt, mỗi lượt bằng 7% ATK hiện tại tại lúc áp dụng. Đếm n bắt đầu lại ở chuỗi mới.
- Nếu còn sống và HP dưới 7%, một lần/trận hồi đến 77% max HP, nhận +300% sát thương đòn đánh (x4), ngừng follow-up và nhận Crucifix.
- Crucifix tăng thêm 150% sát thương đối với Dark (x2,5). Các hệ số sát thương áp dụng cùng quy tắc Element hiện có.
- Không hồi sinh bằng bất kỳ nguồn nào. Đòn đã làm HP về 0 không kích hoạt ngưỡng sống sót dưới 7%. Quy tắc Bleed chặn hồi HP vẫn áp dụng.

6. BẢNG EXCEL DỮ LIỆU THẺ

- Bàn giao anime-card-rng-cards.xlsx với đủ 129 thẻ trong cards.js, gồm 4 thẻ của bản cập nhật này.
- Đúng 4 cột: Card Name; HP Level 1; ATK Level 1; Card Passive.
- HP và ATK là số gốc cấp 1, chưa tính mutation, buff hoặc hệ số level.
- Card Passive gồm tên và mô tả đầy đủ. Có bộ lọc tiêu đề, cố định hàng tiêu đề/cột tên, ngắt dòng và định dạng số dễ đọc.
- Bảng Excel là tài liệu tham khảo đầy đủ; giao diện Quest Card trong game vẫn giữ bí mật đến khi mở khóa.

7. TỆP VÀ KHẢ NĂNG TƯƠNG THÍCH CỦA BẢN CẬP NHẬT

- quest.js: module mới chuyên trách quest; app.js chỉ kết nối sự kiện roll, trận đấu, hạ địch, thưởng và chuyển save.
- cards.js và passives.js: 4 thẻ mới, nội tại riêng và cơ chế shield.
- achievements.js và boss_event.js: tổng thắng Boss Event cùng 9 mốc Drop Multiplier; raid.js và boss_event.js chấp nhận mức multiplier mới trong phần thưởng đang chờ.
- index.html và styles.css: ô nhập độ khó, bộ chọn thành tựu Boss Event và modal Quest Cards riêng.
- README.txt chỉ ghi nhật ký của bản cập nhật này. Bảng Excel được bàn giao riêng; archive game chỉ chứa mã nguồn và README.txt.
- Giữ nguyên khối bảo vệ .acrsave, thời gian chờ 7 ngày, công thức Tower, khóa đối thủ khi thua, nhịp Time Trial và giao dịch Evolution.
- Gói nguồn không kèm asset ảnh/nhạc, tệp kiểm thử, script kiểm định hoặc log. Người dùng tự quản lý asset theo các đường dẫn được khai báo.
