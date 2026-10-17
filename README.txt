NHẬT KÝ CẬP NHẬT — JULIUS VÀ LUCIUS EVENT — 17/10/2026

Tệp này chỉ ghi các thay đổi của phiên bản hiện tại.

1. GIỚI HẠN LEVEL 1000 VÀ GIẢM TẢI EXP

Giới hạn Level của thẻ là 1000. Khi tải dữ liệu hiện có hoặc nhập save .acrsave, các bản ghi thẻ vượt giới hạn được đưa về Lv.1000. Bộ đọc vẫn hỗ trợ các dạng dữ liệu cũ trong inventory, lineup và storage, sau đó hợp nhất vào cardProgress chuẩn.

Thẻ đã Lv.1000 không nhận EXP từ roll trùng, trận thường hoặc EXP Time Trial. Roll trùng vẫn tăng số lượng, nhận đúng biến thể, tăng bộ đếm và ghi tiến độ như bình thường; bỏ sớm phép tính thưởng EXP và các multiplier EXP. EXP còn dư ở Lv.1000 được xóa; phần EXP lẻ của Time Trial được dọn khi tải hoặc khi lên mức tối đa. Giao diện hiển thị MAX LEVEL.

Giữ công thức trước giới hạn:
- EXP cần để tăng từ Level L: floor(100 x hệ số rarity x L).
- Hệ số rarity: Common 1; Rare 1.6; Epic 2.4; Legendary 3.6; Mythic 5.2; Secret 8.
- Hệ số chỉ số theo Level: 1 + 0.075 x (L - 1), với 1 <= L <= 1000.
- Lv.1000 tương ứng x75.925 chỉ số Lv.1, trước mutation và buff trong trận.
- Tính lượng Level tăng bằng tìm kiếm nhị phân trên tổng EXP cần, tránh vòng lặp lớn khi nhận nhiều EXP. Giới hạn an toàn của số EXP vẫn tách riêng khỏi giới hạn Level 1000.

Giới hạn này không đặt trần cho Floor của Infinite Tower hoặc Room Time Trial.

2. SỬA SALVAGE ALL EXTRA DUPLICATES

Sửa thao tác tổng hợp từng giữ một biến thể của mỗi thẻ và salvage cả các mutation độc nhất còn lại.

Quy tắc mới áp dụng riêng cho từng khóa thẻ + tổ hợp mutation:
- Số bản được salvage = max(0, số lượng - 1).
- Giữ 1 bản Normal nếu đang có Normal.
- Giữ 1 bản của mỗi mutation và mỗi double mutation đang sở hữu.
- Không gộp các tổ hợp mutation khác nhau thành bản trùng.
- Giá trị VNĐ mỗi bản giữ công thức hiện hành; chỉ đổi số bản được phép salvage.
- Thực hiện lại khi mỗi biến thể còn 1 bản sẽ không xóa thêm thẻ.

Đồng bộ lại dữ liệu sở hữu và cache sau khi loại bản dư để Collection, đội hình và kiểm tra New Mutation cùng đọc đúng số lượng.

3. ARENA: SẮP XẾP VÀ HIỂN THỊ HP/ATK THỰC

Sắp xếp HP hoặc ATK dùng chỉ số đã áp dụng Level và mutation đang sở hữu, thay cho chỉ số gốc trong Index. Với double mutation, nhân riêng các hệ số HP và ATK của cả hai mutation.

Chọn biến thể mạnh nhất theo đúng chỉ số đang sắp xếp: biến thể có HP cao nhất có thể khác biến thể có ATK cao nhất. Mỗi ô hiển thị HP, ATK và tên mutation của cùng một biến thể thực tế; không ghép HP của biến thể này với ATK của biến thể khác. Khi thêm thẻ vào đội hình, ưu tiên biến thể mạnh nhất còn đủ số lượng theo chỉ số đang chọn.

Trong Weather Tower, chỉ so sánh các biến thể đủ điều kiện vào Tower đó. Giữ nguyên luật chọn thẻ của người chơi và kiểm tra số bản dùng trong đội hình. Tính giá trị một lần cho mỗi thẻ trong mỗi lần sắp xếp, không tính lại trong mọi phép so sánh.

4. BỐN THẺ MỚI

JULIUS
Element: Holy. Rarity: Secret. Rate: 1 in 1,500,000.
Lv.1: HP 200,000; ATK 15,000.
Nguồn: hoàn thành Julius Quest; sau đó mới vào pool roll thường. Không thêm khóa thời tiết riêng cho Julius.

Time Grimoire:
- Khi Julius còn sống, đòn đánh vào Julius hoặc đồng đội tuyến đầu có 30% cơ hội bị phản lại người tấn công. Không hoán đổi vị trí.
- Hai lần phản đòn liên tiếp gây 50% ATK hiện tại của Julius lên toàn bộ địch và tạo khiên bằng 50% max HP Julius cho các đồng đội, bao gồm Julius. Một lần kiểm tra phản đòn thất bại đặt lại chuỗi.
- Khi khiên do Julius tạo cho một đồng đội khác bị phá trong 3 lượt chiến đấu kể từ lúc tạo, lưu HP hiện tại, max HP, ATK hiện tại và nội tại của đồng đội làm backup life. Chỉ lưu một lần trong trận. Khiên vẫn hoạt động sau cửa sổ 3 lượt nhưng không tạo backup mới từ lần phá khiên muộn đó.
- Đòn chí mạng tiêu thụ backup để hồi sinh Julius một lần với chỉ số và nội tại đã lưu. ATK đã bao gồm buff không bị nhân buff lần thứ hai. Sau lần hồi sinh này, Julius không thể bị clone hay được đồng đội hồi sinh/cứu mạng bằng Marco.
- Đòn phản lại không tiếp tục phản qua lại vô hạn giữa hai Time Grimoire.

SPEED WIZARD
Element: Electric. Rarity: Mythic. Rate: 1 in 450,000. Chỉ roll trong Wind.
Lv.1: HP 45,000; ATK 4,500, theo thông số đã xác nhận.

Godspeed:
- Mỗi đòn có 5% cơ hội bắt đầu follow-up, gây 50% ATK. Trong cùng chuỗi, cơ hội của follow-up kế tiếp bằng một nửa lần trước: 5%, 2.5%, 1.25%... trước bonus né đòn.
- Có 50% cơ hội né. Mỗi lần né thành công cộng 5 điểm phần trăm vào cơ hội bắt đầu follow-up cho phần còn lại của trận, nhưng bỏ lượt tấn công kế tiếp.
- Cơ hội kiểm tra được giới hạn trong khoảng xác suất hợp lệ. Chuỗi được xử lý bằng vòng lặp, không đặt trần số follow-up cố định.

LUCIUS ZOGRATIS
Element: Dark. Rarity: Secret. Rate: 1 in 0; không roll thường.
Lv.1: HP 300,000; ATK 30,000.
Nguồn: Lucius Event.

All Grimoire:
- Khi vào trận, nhận một nội tại ngẫu nhiên từ đồng đội hoặc địch. Mỗi 5 đòn đánh nhận thêm một nội tại nếu còn nguồn mới hợp lệ.
- Tối đa 5 nội tại tổng cộng, gồm All Grimoire và tối đa 4 nội tại nhận thêm. Không trùng tên nội tại. Khi không còn nguồn mới, không tạo bản trùng.
- Mỗi nội tại sao chép giữ trạng thái, bộ đếm và dạng biến hình riêng; cùng dùng HP, ATK, khiên và trạng thái chiến đấu của Lucius. Nội tại vào trận chỉ khởi tạo một lần cho mỗi bản sao. Nội tại sao chép tiếp từ các kỹ năng đánh cắp cũng phải tuân theo giới hạn tổng này.
- Khi Julius thật trong đội chết vĩnh viễn, Lucius nhận +50% max HP và +50% ATK một lần trong trận. Không kích hoạt khi Julius vẫn được cứu sống/hồi sinh tức thì. Nếu Dante hoặc Josuke còn khả năng hồi sinh đồng đội, chờ kết quả thay vì coi Julius đã chết vĩnh viễn ngay lúc HP về 0.
- Mô tả trong trận liệt kê các nội tại đã nhận; badge hiển thị số nội tại hiện có.

SEA GODDESS VALKYRIE
Element: Water. Rarity: Mythic. Rate: 1 in 0; chỉ nhận qua Evolution.
Lv.1: HP 400,000; ATK 20,000.

Ultimate Tsunami:
- Khi vào trận, gây 100% ATK hiện tại lên toàn bộ địch qua luồng sát thương/Element hiện hành.
- Nhận khiên bằng floor(50% tổng HP thực tế đã gây mất), không tính phần sát thương vượt HP còn lại hoặc bị chặn hoàn toàn.
- Khi khiên Tsunami bị phá, stun các địch còn sống trong 4 lượt.
- Giữ cơ chế khiên hiện hành: đòn phá khiên không tràn sát thương dư vào HP.

5. JULIUS QUEST: THEO DÕI TUẦN TỰ

Thêm Julius vào Quest Cards trong menu tiện ích. Artwork được hiển thị; chỉ số/nội tại vẫn được giấu theo cơ chế Quest Cards trước khi mở khóa.

Bốn bước, thực hiện theo thứ tự:
1) Thắng Normal Time Trial Room 100 tổng cộng 1,000 lần.
2) Thắng Normal Time Trial Room 100 với đội hình xuất phát gồm đúng 4 thẻ Holy tổng cộng 100 lần.
3) Roll 10,000 lần khi Wind đang hoạt động.
4) Thắng Lucius Event 1,000 lần.

Chỉ bước hiện tại được tính, sau khi Accept Quest. Một sự kiện hoàn tất bước không được dùng tiếp cho bước sau. Không dùng bestRoom hoặc Index có sẵn để cộng tiến độ hồi tố. Room phải đúng 100; Room 99/101, EXP Time Trial, trận thua và Sandbox không được cộng vào yêu cầu thắng Room 100. Full Holy được chụp từ đội hình gốc lúc bắt đầu, không tính clone/summon sinh ra giữa trận.

Sửa dữ liệu sự kiện kết thúc Time Trial/Boss Event để chuyển rõ kết quả thắng/thua cho quest trước khi đóng màn hình trận. Giữ biên nhận sự kiện để tránh cộng lại cùng một kết quả.

Hoàn thành đủ bốn bước cấp một Julius Normal, ghi biên nhận thưởng và mở pool roll cho các lần sau. Việc cấp thưởng tiếp tục có cơ chế thử lại an toàn nếu lưu trữ chưa thành công.

6. TÁCH TIỀN BOSS EVENT VÀ THÊM LUCIUS EVENT

Mỗi Event có số coin, độ khó và số thắng riêng:
- Alucard Event Coins: thuộc Alucard Event, tiếp tục yêu cầu Eclipse/Eclipsed.
- Lucius Event Coins: thuộc Lucius Event, yêu cầu Raining đang hoạt động.

Dữ liệu Boss Event cũ được giữ nguyên toàn bộ trong ví Alucard; ví Lucius bắt đầu từ 0. Không sao chép số dư cũ sang cả hai ví. Tổng thắng cộng dồn giữa các loại vẫn dùng cho achievement Boss Event hiện có. Export/import mang theo cả hai ví.

Chọn loại trong Arena > Boss Event. Giữ thể thức 5 thẻ người chơi đấu một boss, độ khó 1–1000 và Speed Battle Potion hoạt động bình thường. Không thêm cây nâng cấp chỉ số. Khóa lựa chọn Event trong lúc đánh; đổi loại sau trận giữ lại đội hình chuẩn bị hợp lệ.

Lucius Event ở Difficulty 1:
- Boss: Lucius Zogratis.
- HP 1,000,000; ATK 50,000.
- Hệ số độ khó D: S(D) = 1 + 0.075 x (D - 1).
- HP boss = round(1,000,000 x S); ATK boss = round(50,000 x S), trước hiệu ứng nội tại trong trận.

Tái kiểm tra Raining trước mỗi lần Continue/Auto Continue. Nếu Raining hết hạn hoặc không còn hoạt động, dừng lượt tiếp theo và hiển thị điều kiện thiếu. Không tự bỏ yêu cầu thời tiết khi đã thắng một lần. Trận đang diễn ra được xử lý theo luật hiện hành.

Coin thắng trận dùng đường cong Raid được thích nghi cho từng ví Event:
- t = ((D - 1) / 999)^0.85.
- Coin cơ bản tối thiểu = round(1 + 69 x t).
- Coin cơ bản tối đa = round(1 + 99 x t).
- Chọn số nguyên trong khoảng này; Difficulty 1 cho 1 coin, Difficulty 1000 cho 70–100 coin trước Drop Multiplier.
- Drop Multiplier và làm tròn xác suất của hệ thống vật phẩm tiếp tục áp dụng cho coin.
- Không nhận VNĐ, EXP, potion hoặc item thường từ kết quả Boss Event.

Drop riêng Lucius Event:
- p(D) = 0.005 + 0.045 x (D - 1) / 999.
- Difficulty 1: 0.5% drop Lucius Zogratis.
- Difficulty 1000: 5% drop Lucius Zogratis.
- Các độ khó giữa hai mốc tăng tuyến tính. Theo xác nhận, cả hai mốc đều drop Lucius; tên Alucard ở mốc đầu của yêu cầu ban đầu là ghi nhầm.
- Áp dụng hệ thống mutation/double mutation theo thời tiết đang hoạt động khi nhận drop. Lucius không được thêm vào roll thường.
- Drop Alucard của Alucard Event giữ công thức cũ; không chuyển sang ví hoặc bảng drop Lucius.

Lưu phần thưởng chờ xử lý theo ID lượt và loại Event; khôi phục sau reload mà không cấp thẻ hai lần. Mua shop trừ đúng ví của loại đang chọn.

7. SEA VALKYRIE VÀ EVOLUTION MỚI

Lucius Event Shop thêm Sea Valkyrie với giá 4,000 Lucius Event Coins. Đây là nguyên liệu trong Storage, dùng ảnh assets/mermaidscale.png. Không bán nguyên liệu này bằng Alucard Event Coins.

Các potion của shop Event giữ giá hiện hành: Rich, EXP, Luck, Speed giá 10 coin của loại Event; Speed Battle Potion giá 25 coin. Mua potion không đổi số dư ví Event khác.

Công thức tiến hóa:
Noelle Silva Lv.100 trở lên + 1 bản thẻ gốc ở biến thể đã chọn + 1 Sea Valkyrie
=> Sea Goddess Valkyrie Lv.1, EXP 0, giữ đúng mutation hoặc double mutation của bản Noelle bị tiêu thụ.

Lv.99 không được tiến hóa. Chỉ tiêu đúng một bản Noelle và một nguyên liệu. Giữ giao dịch có bản khôi phục để không mất thẻ/item nếu thao tác ghi dữ liệu bị lỗi. Áp dụng biên nhận tiến hóa một lần của hệ thống Evolution hiện có. Thẻ kết quả không vào pool roll thường.

8. MODULE, TỆP VÀ KIỂM TRA BÀN GIAO

Thêm grimoire.js để tách logic kỹ năng của bốn thẻ mới. passives.js nối các hook sát thương, khiên, hồi sinh và điều phối nội tại sao chép. Runtime sao chép được cách ly theo từng trận, bao gồm engine riêng của Sandbox; không ghi các đối tượng chiến đấu vào save.

Các phần cập nhật: levels.js, app.js, cards.js, passives.js, grimoire.js, quest.js, boss_event.js, timetrial.js, evolution.js, startup.js, index.html và README.txt.

Gói đầy đủ gồm 25 tệp sản xuất:
index.html
styles.css
passives.css
app.js
cards.js
passives.js
grimoire.js
inventory.js
tower.js
timetrial.js
raid.js
boss_event.js
achievements.js
weathers.js
mutations.js
elements.js
background.js
evolution.js
quest.js
levels.js
roll_view.js
roll_performance.js
sandbox.js
startup.js
README.txt

JS/CSS dùng mã cache 20261017-lucius-1, đường dẫn tương đối và script defer có thứ tự. Triển khai đồng bộ toàn bộ gói, đặc biệt grimoire.js phải nằm cạnh index.html; sau đó tải lại bằng Ctrl+F5 nếu trình duyệt còn giữ bản cũ.

Không kèm Excel, script kiểm thử, log hoặc asset nhị phân. Người dùng tự đặt artwork vào các đường dẫn:
assets/cards/julius.png
assets/cards/speedwizard.png
assets/cards/lucius.png
assets/cards/seagoddessvalkyrie.png
assets/mermaidscale.png

Đã kiểm tra cú pháp JavaScript, khởi động file cục bộ và HTTP ở đường dẫn con, clamp save/import, bỏ tính EXP cho roll trùng Lv.1000, giữ từng biến thể khi salvage, sắp xếp Arena, bốn bước quest, ví Event riêng, giới hạn drop, tiến hóa có double mutation và cách ly Sandbox. Các ca kiểm tra kỹ năng gồm phản đòn/backup Julius, cửa sổ 3 lượt, Godspeed, nội tại sao chép, bonus khi Julius chết vĩnh viễn và khiên Tsunami. Đối chiếu hồi quy chiến đấu với cùng seed cho 129 thẻ cũ; bộ registry kiểm tra đủ 133 thẻ hiện tại.

Giữ bảo vệ save .acrsave và hai cooldown 7 ngày; không thay công thức cân bằng Tower, cơ chế kho khóa đối thủ, Element, Raid, các thưởng Time Trial cũ hoặc tối ưu Hide Rolling Card.
