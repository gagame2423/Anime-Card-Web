NHẬT KÝ CẬP NHẬT 16/10/2026
MARINE FORD NGẪU NHIÊN, BỘ ĐẾM PASSIVE VÀ BOSS EVENT ALUCARD

1. MARINE FORD RAID: ROLL CHỈ SỐ MỖI TRẬN

Mỗi lần bắt đầu một trận Raid, từng địch roll HP và ATK độc lập trong khoảng nguyên bao gồm cả hai đầu mút. Không còn dùng giá trị trung bình cố định.

Khoảng chỉ số gốc tại Difficulty 1:
- Luffy Kid: HP 3.000–5.000; ATK 175–300.
- Buggy: HP 1.750–3.000; ATK 300–500.
- Ice Admiral: HP 3.500–5.000; ATK 350–500.
- Light Admiral: HP 2.500–4.000; ATK 700–1.000.
- Garp: HP 7.500–10.000; ATK 500–700.
- Boa Hancock: HP 2.500–4.000; ATK 500–600.
- Doflamingo: HP 3.000–5.000; ATK 750–1.000.
- Shanks: HP 4.500–6.000; ATK 1.250–2.500.
- BlackBeard: HP 6.500–8.000; ATK 900–1.200.
- WhiteBeard: HP 15.000–30.000; ATK 3.000–10.000.

Công thức giữ hệ số level Raid hiện có:
  D = Difficulty, số nguyên từ 1 đến 1.000.
  S(D) = 1 + 0,075 x (D - 1).
  Chỉ số gốc = min + floor(U x (max - min + 1)), U thuộc [0, 1).
  Chỉ số vào trận = round(chỉ số gốc x S(D)).

- Roll riêng 2 giá trị cho mỗi địch, tổng cộng 20 phép roll stat cho 10 địch khi tạo trận.
- Giữ bộ chỉ số đã roll cho suốt trận đó. Trận tiếp theo roll lại; đổi mục tiêu hoặc render UI không roll lại địch đang đánh.
- Lobby hiển thị khoảng HP/ATK đã nhân level. Xem trước và kéo Difficulty không tiêu RNG tạo địch.
- Chỉ số tùy chỉnh được đặt vào bản sao card của trận, không ghi đè HP/ATK gốc trong cards.js; passive dùng đúng snapshot của địch.
- Chuẩn hóa tên hiển thị thành Marine Ford. Giữ nguyên ID marine_fort, ID key và tên khóa lưu trữ để bảo toàn ví, key, tiến độ và vật phẩm tiến hóa cũ.

2. SỬA BỘ ĐẾM ĐÒN ĐÁNH QUA NHIỀU MỤC TIÊU

- Ghi nhận mỗi đòn đánh hợp lệ đúng 1 lần vào runtime của chính đơn vị tấn công. Không gắn bộ đếm vào đối thủ đang đối mặt.
- Đối thủ chết, địch kế tiếp vào sân, cập nhật chỉ số hoặc render khung thẻ không đưa bộ đếm về 0.
- Các bản sao cùng ID thẻ vẫn có bộ đếm riêng; không cộng dồn đòn của hai đơn vị khác nhau.
- Giữ phân biệt hiện có giữa đòn chính và đòn phụ của từng passive. Không biến kỹ năng chỉ kích hoạt ở đòn thứ N một lần thành kỹ năng lặp vô hạn.
- Đòn bị Stun/Freeze chặn trước khi thực hiện không được tính là một đòn đánh. Đòn đã thực hiện vẫn được tính khi bị né hoặc chặn sát thương; passive có điều kiện “trúng đòn” vẫn cần thỏa điều kiện riêng.
- Naruto x Sasuke vẫn chọn lại mode theo địch mới, nhưng bộ đếm đòn không còn reset theo mục tiêu. Việc đổi mode vẫn xử lý Clone và shield theo cơ chế hiện có.
- Dark Decade giữ bộ đếm đòn khi lấy passive mới sau khi hạ địch, thay vì làm mất tiến độ lúc khởi tạo lại trạng thái passive.
- Bộ đếm được khởi tạo mới cho trận mới hoặc đơn vị mới; không mang tiến độ đòn đánh từ trận trước sang trận sau.
- Làm rõ mô tả Chidori của Sasuke Kid: hiệu ứng tại đòn thứ 3, không ghi nhầm thành lặp mỗi 3 đòn. Không đổi logic sát thương của thẻ này.

3. CHẾ ĐỘ MỚI: BOSS EVENT

Thêm boss_event.js để tách biệt điều kiện mở sự kiện, Difficulty, tạo boss, ví Event Coins, phần thưởng, cửa hàng và lưu dữ liệu khỏi app.js.

- Truy cập Arena rồi chọn Boss Event.
- Đội người chơi: 5 thẻ. Đội địch ban đầu: 1 Boss.
- Sự kiện đầu tiên: Alucard Event.
- Difficulty 1–1.000; level boss bằng Difficulty.
- Không có cây nâng cấp HP/ATK bằng Event Coins.
- Không yêu cầu key hoặc vé vào trận; điều kiện vào là đội hình đủ 5 thẻ hợp lệ và cửa sổ thời tiết của sự kiện đang mở.
- Lượt đánh dùng nhịp chiến đấu thông thường. Speed Battle Potion hoạt động, rút lượt xuống 1 giây; không áp dụng quy tắc lượt cố định của Time Trial cho Boss Event.
- Thắng chỉ nhận Boss Event Coins và có thể rơi thẻ Alucard. Không có VNĐ, EXP, key hoặc potion rơi trực tiếp từ trận Boss Event.
- Thua không mất thẻ; không nhận phần thưởng chiến thắng.
- Hệ thống xét toàn bộ hàng đợi còn sống, bao gồm Clone/summon. Không kết thúc khi vẫn còn đơn vị hợp lệ cần đánh.
- Số thắng và ví Boss Event được lưu riêng, không cộng vào tổng thắng Raid.

CỬA SỔ THỜI TIẾT ALUCARD

- Chỉ mở khi thời tiết Eclipse đang hoạt động; Eclipsed là tên mutation đi kèm và là bí danh được chấp nhận khi tra cứu thời tiết.
- Sở hữu một thẻ mang mutation Eclipsed không thay thế điều kiện thời tiết thật sự đang hoạt động.
- Thời gian mở event bằng thời gian Eclipse còn lại, hiển thị ngay tại lobby. Không tự thêm một giới hạn trận 3 hoặc 5 phút không có trong yêu cầu.
- Kiểm tra điều kiện trước khi Start, trước khi Continue thủ công và trước khi Auto Continue bắt đầu trận tiếp theo.
- Kiểm tra cả thời gian thực kể từ lần đồng bộ gần nhất, tránh cho vào trận bằng thời tiết đã hết hạn trong khoảng giữa hai tick.
- Nếu Eclipse hết giữa trận đã bắt đầu hợp lệ, trận được đánh và phát thưởng đến hết. Trận kế tiếp bị chặn cho đến khi Eclipse hoạt động trở lại.
- Auto Continue vẫn giữ tùy chọn ON nhưng không tự vào một trận trái điều kiện khi cửa sổ đóng. Công tắc vẫn hỗ trợ cả kết quả thắng và thua.

CHỈ SỐ BOSS

Alucard Event Boss tại Difficulty 1:
  HP 666.666; ATK 66.666; Element Fire.

Công thức:
  HP boss = round(666666 x S(D)).
  ATK boss = round(66666 x S(D)).
  S(D) = 1 + 0,075 x (D - 1).

Boss sử dụng Bird of Hermes, gồm cả hồi sinh một lần. Chỉ số boss và chỉ số thẻ người chơi nhận được là hai bộ số riêng, không ghi đè lẫn nhau.

4. BOSS EVENT COINS VÀ CỬA HÀNG

Dùng đường cong coin của Raid cho ví Boss Event riêng:
  t = ((D - 1) / 999)^0,85.
  Coin tối thiểu = round(1 + 69 x t).
  Coin tối đa = round(1 + 99 x t).
  Roll một số nguyên trong khoảng này khi thắng.

- Difficulty 1: đúng 1 coin cơ bản.
- Difficulty 1.000: 70–100 coin cơ bản.
- Drop Multiplier từ thành tựu áp dụng lên số lượng Event Coins như các loại coin rơi khác, dùng quy tắc làm tròn xác suất hiện có.
- Hệ số VNĐ, EXP hoặc Luck không được dùng để tăng Event Coins.
- Không nhân lại coin sau khi reload một phần thưởng đang chờ lưu.

Boss Event Shop:
- 10 Boss Event Coins: 1 Rich Potion.
- 10 Boss Event Coins: 1 EXP Potion.
- 10 Boss Event Coins: 1 Lucky Potion.
- 10 Boss Event Coins: 1 Speed Potion.
- 25 Boss Event Coins: 1 Speed Battle Potion.

Mỗi lượt mua nhận đúng 1 vật phẩm vào Storage. Drop Multiplier không nhân hàng mua. Không thêm VND Potion trở lại. Có thể tiêu coin đã kiếm được khi cửa sổ thời tiết đã đóng; cửa hàng không có nút nâng cấp chỉ số.

5. THẺ MỚI: ALUCARD

- ID: boss-event-alucard.
- Nguồn: phần thưởng Alucard Event.
- Tỷ lệ roll thường: 1 trong 0; không vào gacha thường, kể cả sau khi đã sở hữu.
- Rarity dữ liệu: Secret.
- Element: Fire.
- HP gốc: 333.333.
- ATK gốc: 66.666.
- Đường dẫn artwork: assets/cards/alucard.png. Gói cập nhật không kèm tệp artwork.

XÁC SUẤT THẺ RƠI

  P(D) = 0,006 + 0,054 x (D - 1) / 999.

- Difficulty 1: 0,6% mỗi trận thắng.
- Difficulty 1.000: 6% mỗi trận thắng.
- Luck, Rich, EXP và Drop Multiplier không sửa xác suất thẻ độc quyền này.
- Thẻ có thể rơi thêm ở những lần thắng sau; không áp đặt giới hạn chỉ được sở hữu một bản. Mỗi kết quả rơi chỉ cấp đúng 1 bản sao.
- Khi thẻ rơi, dùng đúng công thức mutation đang hoạt động: Common 10%, Uncommon 5%, Rare 2,5%; tối đa 2 mutation.
- Khi có đúng Eclipse + Sunny, xác suất Eclipsed + Solar là 5% x 10% = 0,5% trong những lần đã rơi thẻ. Đây là xác suất mutation có điều kiện, không thay thế xác suất rơi Alucard.
- Bản trùng không cấp EXP roll và không reset level của những bản Alucard đã có.

BIRD OF HERMES

- Mỗi 2 đòn đánh hợp lệ, đòn trúng gây sát thương áp dụng Bleed 1 lượt, sát thương mỗi lượt bằng 66% ATK hiện tại tại lúc áp dụng. Đòn phụ cũng được tính vào bộ đếm này.
- Sau khi hoàn tất 6 đòn, mở phép thử follow-up 66%. Mỗi follow-up dùng 33% ATK trước crit, element và phòng thủ; hồi 3% max HP cho Alucard theo luật hồi máu hiện có.
- Một follow-up có thể tiếp tục thử 66% để tạo follow-up kế tiếp. Không có giới hạn số đòn, không dùng giới hạn chain 24 đòn của cơ chế cũ. Chuỗi xử lý theo vòng lặp để tránh tràn call stack.
- Chuỗi dừng khi phép thử thất bại, không còn địch, Alucard không còn hoạt động hoặc không thể tiếp tục đòn hợp lệ. Hiệu ứng vô hiệu hóa passive vẫn chặn chuỗi.
- 6 follow-up liên tiếp trúng và gây sát thương sẽ tạo một Clone của đồng đội gốc đang sống được chọn ngẫu nhiên, đặt ngay trước Alucard. Đòn né, phản hoặc chặn hết sát thương làm mất chuỗi đếm trúng liên tiếp. Đổi địch trong cùng chuỗi không reset bộ đếm.
- Tối đa 3 Clone còn sống do mỗi Alucard tạo ra. Khi Clone bị hạ, một lần đủ điều kiện sau có thể tạo bản thay thế. Không đặt giới hạn tạo Clone chung lên các thẻ khác.
- Clone sao chép max HP, ATK và passive của đồng đội được chọn. Không chọn Alucard hoặc thẻ bị cấm clone; Clone/summon không tự tạo thêm đơn vị.
- Khi chết, Alucard tự hồi sinh đúng 1 lần/trận tại cuối hàng đợi với 66% max HP; đồng đội đang sống kế tiếp được lên sân. Giữ bộ đếm đòn của chính Alucard sau hồi sinh.
- Alucard không thể bị clone hoặc chuyển thành đơn vị sao chép bằng cơ chế tạo đồng đội. Điều này không đặt lệnh cấm chung lên việc sao chép passive vốn có của game.
- Đồng đội vẫn có thể hồi sinh Alucard theo điều kiện của passive tương ứng. Bleed, chết vĩnh viễn và các luật cấm phục hồi hiện có vẫn được tôn trọng.
- Khi còn sống và không phải đơn vị đang thực hiện lượt đánh, Alucard tăng sát thương Bleed do đồng đội gây ra lên x1,5. Không tăng Bleed của đối thủ; không tự tăng Bleed của chính nó qua hiệu ứng hỗ trợ này. Nhiều Alucard không nhân chồng cùng buff hỗ trợ.

6. WHITEBEARD, SUGAR VÀ THANH BUFF THỜI TIẾT

- WhiteBeard đổi Element từ Dark sang Holy. Không đổi chỉ số gốc, tỷ lệ roll hoặc passive của thẻ.
- Đội Tower sinh mới dùng element Holy mới của WhiteBeard khi lọc theo loại tháp.
- Giữ thành phần đội Tower đã khóa từ save cũ có WhiteBeard lúc thẻ còn Dark, tránh tự reroll một tầng đang thử lại. Thẻ trong đội cũ vẫn nhận element Holy mới. Ngoại lệ tương thích chỉ dành cho bản ghi cũ; đội sinh mới tuân thủ lọc element hiện tại.
- Thời tiết Uncommon hiển thị đúng tên Sugar, không dùng Sweat làm tên thời tiết.
- Khi nạp save cũ, bí danh weather Sweat/Sweet chuyển về ID sugar; các bản ghi trùng cùng thời tiết được hợp nhất, không cộng buff hai lần. Không đổi ID mutation sweat đang dùng cho Sweet và không làm mất mutation trên thẻ.
- Buff thời tiết được hiển thị trực tiếp cạnh tên trong thanh Active Weather ở đầu màn hình, không chỉ nằm trong tooltip.
- Ví dụ Sunny hiện +10% VNĐ; Sugar hiện +10% Roll Speed; Eclipse hiện +33% battle VNĐ và mức tăng cơ hội địch mutation.
- Tên, buff, dòng nhóm/mutation và đồng hồ hết hạn có khoảng riêng. Nội dung dài xuống dòng trong chip; danh sách thời tiết có giới hạn chiều cao và cuộn khi cần, tránh đè giao diện phía dưới.
- Giữ bố cục mobile và nút Start luôn tiếp cận được, gồm cả đội hình 5 ô của Boss Event. Nút + đọc passive đầy đủ vẫn ở góc phải dưới vùng passive.

7. LƯU DỮ LIỆU VÀ PHẦN THƯỞNG AN TOÀN

- Boss Event có store localStorage riêng: anime_card_rng_boss_event_v1, chứa coin, Difficulty, số thắng, số thứ tự lượt thử và phần thưởng đang chờ lưu.
- Trước khi phát thưởng, lưu nguyên coin đã roll, hệ số Drop, coin cuối cùng và mutation của thẻ rơi.
- Cấp thẻ có biên nhận riêng theo lượt thử. Nếu lưu coin thất bại sau khi thẻ đã được cấp, lần tải sau hoàn tất phần còn lại mà không cấp trùng thẻ hoặc roll lại mutation.
- Trận bị gián đoạn không được tính thắng. Trận mới dùng đơn vị và trạng thái passive mới.
- Store Boss Event được đưa vào export/import .acrsave và được kiểm tra trước khi ghi dữ liệu. Save cũ chưa có store này vẫn nhập được.
- Giữ nguyên mã bảo vệ save, báo lỗi dữ liệu bị sửa, cooldown nhập/xuất độc lập 7 ngày và migration level một lần hiện có.
- Tiến độ Evolution, vật phẩm tiến hóa, level hợp lệ và mutation vẫn đi cùng save; không đưa thẻ tiến hóa hoặc Alucard vào gacha thường.

8. FILE THAY ĐỔI VÀ PHẠM VI BÀN GIAO

- boss_event.js: module mới cho Alucard Event, Difficulty, boss, cửa hàng và giao dịch phần thưởng.
- raid.js: khoảng chỉ số, roll riêng từng trận và API xem trước min–max.
- passives.js: bộ đếm trên đơn vị tấn công, giữ tiến độ qua mục tiêu, Bird of Hermes và kiểm tra hàng đợi Boss Event.
- cards.js: Alucard, WhiteBeard Holy và mô tả passive ngắn, đúng điều kiện bộ đếm.
- tower.js: giữ đội WhiteBeard đã khóa trong save cũ, dùng phiên bản chọn địch mới cho các tầng tiếp theo.
- weathers.js: chuẩn hóa bí danh thời tiết Sugar/Eclipse.
- app.js: kết nối mode 5 thẻ, điều kiện weather, nhận thẻ có biên nhận, UI shop/kết quả, save và hiển thị buff.
- index.html / styles.css: mục Boss Event, lobby/shop/tổng kết, đội 5 ô và chip thời tiết có buff.
- inventory.js / evolution.js: đồng bộ tên hiển thị Marine Ford, giữ nguyên ID và logic vật phẩm/tiến hóa.
- README.txt: chỉ ghi changelog của lần cập nhật này.

Gói nguồn chỉ chứa mã HTML/CSS/JS và README.txt. Không kèm tệp ảnh, âm thanh, asset nhị phân, script test, log hay ảnh kiểm tra. Người dùng tự giữ và quản lý thư mục assets cùng tệp nhạc hiện có; các đường dẫn tài nguyên trong code được bảo toàn.
