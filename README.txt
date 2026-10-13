Anime Card RNG — Nhật ký cập nhật và thông số kỹ thuật
======================================================

Ngày đối chiếu mã nguồn: 13/10/2026.
Phạm vi: Tower tăng nhẹ sau tầng 100, ATK nền bằng 20% HP tối đa và giới hạn 25% sau buff, thưởng Elite 110 chỉ 100–110 xu; giữ VNĐ theo damage, Tower không EXP và các hệ thống đã duyệt.

Tài liệu này mô tả bản sửa khẩn cấp tỷ lệ HP/ATK và thưởng xu Tower; giữ VNĐ theo damage, EXP Arena theo từng thẻ, Tower không EXP, hàng đợi đầy đủ, Auto Continue và giao diện đã ổn định. Lớp bảo vệ save của bản trước được giữ lại. Bản phát hành gồm nguồn game và README; không kèm runner kiểm thử, log hay file tạm. Các hệ thống gameplay giữ cơ chế hiện hành.

Tên thẻ, tên potion, tên thời tiết, ID và tên file được giữ nguyên để đối chiếu chính xác với mã nguồn. Các phần giải thích được viết bằng tiếng Việt.

1. Tính Năng Mới
================

1.1. Các đợt cập nhật đã thực hiện
==================================

- Đợt cập nhật: Nền tảng module Tower và potion; Nội dung chính: Tách lưu vật phẩm/Tower khỏi dữ liệu thẻ; tích hợp potion, Tower 4v4, cửa hàng và các điều chỉnh hồi máu/trạng thái đã có trong bản đầu vào.
- Đợt cập nhật: Kho vật phẩm tổng quát và Tower vô hạn; Nội dung chính: Mở rộng inventory.js, sửa lọc đội hình Weather Tower, bỏ giới hạn tầng 100, thêm Speed Battle Potion độc quyền cửa hàng.
- Đợt cập nhật: Thành tựu và chuyển dữ liệu; Nội dung chính: Thêm achievements.js, 11 thẻ thưởng tầng 100, mở khóa pool roll, xuất/nhập JSON và xử lý lỗi lưu dữ liệu.
- Đợt cập nhật: Tài liệu độc lập trước đó; Nội dung chính: Tổng hợp thông số và ghi chú phát hành bằng tiếng Việt; đợt đó không sửa game.
- Đợt cập nhật: Bảo vệ chuyển save; Nội dung chính: Đóng gói .acrsave, HMAC-SHA-256, kiểm tra Base64/UTF-8 chuẩn, cooldown xuất/nhập 7 ngày độc lập, khóa giữa các tab và bảo toàn timestamp khi nhập.

- Đợt cập nhật: Sửa Tower và tiện ích chiến đấu ngày 13/10/2026; Nội dung chính: Giải quyết toàn bộ hàng đợi Tower có clone, thêm Auto Continue sau 1,5 giây, bỏ nút Tower trùng, menu ⋯ responsive và chuyển toàn bộ tài liệu sang README.txt.

- Đợt cập nhật: Cân bằng và kinh tế trước bản sửa khẩn cấp, ngày 13/10/2026; Nội dung chính: Thêm VNĐ theo damage, bỏ EXP Tower, EXP Arena theo từng ID. Đường cong HP +20%/ATK +30% và thưởng xu mạnh của đợt này đã được rút lại vì mất cân bằng; không còn là công thức hiện hành.

- Đợt cập nhật: Sửa cân bằng khẩn cấp ngày 13/10/2026; Nội dung chính: Tầng 100 đạt 470.400 sức mạnh nền, ATK theo cùng đường cong HP, sau tầng 100 tăng tuyến tính nhẹ; giới hạn chỉ số đối thủ/clone Tower và giảm Elite tầng 110 còn 100–110 xu.

1.2. Kho vật phẩm tổng quát
===========================

inventory.js quản lý vật phẩm độc lập với kho thẻ trong app.js.

- Mỗi vật phẩm có id, name, quantity, description, type, icon, image, tier và metadata.
- Hỗ trợ potion, tiền tệ, nguyên liệu, trang bị, vé và loại tùy chỉnh. Việc có loại gear hoặc ticket trong kho chưa đồng nghĩa đã có cơ chế trang bị hay dùng vé mới.
- Vật phẩm cùng ID được cộng dồn số lượng. Các loại không phải potion được lưu trong kho, không xuất hiện nút tiêu thụ potion.
- Giao diện dạng ô: bốn cột trên màn hình lớn, hai cột khi chiều rộng không quá 640 px; có tìm kiếm, lọc loại, viền cấp vật phẩm và số lượng rút gọn như x150, x2.56K.
- Chú giải số lượng giữ giá trị đầy đủ. Khi chưa có kết quả phù hợp, giao diện hiển thị trạng thái trống.
- Save potion cũ dạng số được chuyển sang bản ghi vật phẩm phiên bản 2, giữ số lượng, thời điểm hết hiệu lực, bộ đếm bảo hiểm và ID vật phẩm chưa biết.

Các thao tác mở rộng chính: registerItem(), grant(), remove(), getItem(), list() và use(). Định nghĩa vật phẩm mới không tự động đưa vật phẩm đó vào danh sách rơi thưởng chiến đấu.

1.3. Tower vô hạn và cửa hàng
=============================

- Có 11 loại Tower: Normal và 10 Weather Tower.
- Mỗi trận sử dụng đội hình bốn thẻ; đối thủ ban đầu gồm ba lính và một trùm.
- Mỗi Tower lưu tầng đã vượt riêng. Tầng tiếp theo bằng tầng đã vượt cộng một; không còn trạng thái kết thúc ở tầng 100.
- Chỉ vượt đúng tầng kế tiếp mới nhận Tower Coins. Gọi lại kết quả của tầng đã vượt không cấp thưởng lần nữa.
- Cứ mỗi 10 tầng có một tầng tinh nhuệ, tăng chỉ số và thưởng xu.
- Tower Coins tách biệt hoàn toàn với VNĐ. Tower Shop dùng Tower Coins; cửa hàng nâng cấp thường dùng VNĐ.
- Speed Battle Potion có giá riêng 100 Tower Coins. Bốn potion thông thường giữ giá 25 Tower Coins mỗi chai.

1.4. Thành tựu trong module riêng
=================================

achievements.js phụ trách danh sách mốc, theo dõi tiến độ, kiểm tra hoàn thành, lưu trạng thái nhận thưởng, mở khóa yêu cầu và dựng giao diện thành tựu. app.js chỉ cung cấp số liệu hiện tại và thực hiện cấp thưởng vào trạng thái game.

- Nhóm: Số thẻ độc nhất sở hữu; Các mốc hiện tại: 25, 50, 75, 100; tự bổ sung các mốc cách nhau 25 khi số thẻ trong cơ sở dữ liệu đủ đạt mốc đó.
- Nhóm: Số trận thắng; Các mốc hiện tại: 1; 10; 100; 1.000; 10.000; 100.000; 1.000.000.
- Nhóm: VNĐ sở hữu/đã kiếm; Các mốc hiện tại: 1K; 10K; 100K; 1M; 10M; 100M; 1B; 10B; 100B; 1T; 10T; 100T.
- Nhóm: Tổng lượt roll; Các mốc hiện tại: 1K; 10K; 100K; 1M; 10M; 100M.
- Nhóm: Tầng Tower đã vượt, xét Tower sâu nhất; Các mốc hiện tại: 10; 25; 50; 100; 250; 500; 1.000; 2.500; 5.000; 10.000; 25.000; 50.000; 100.000; 1.000.000.
- Nhóm: Thẻ Champion riêng từng Tower; Các mốc hiện tại: Vượt tầng 100 của từng loại Tower.

Quy ước: K = 1.000; M = 1.000.000; B = 1.000.000.000; T = 1.000.000.000.000. 100T = 100.000.000.000.000 VNĐ.

- Hiện có 111 thẻ và 54 mục thành tựu: 43 mốc thường cùng 11 mốc Champion. Mốc collection 125 chưa được hiển thị vì cơ sở dữ liệu hiện chưa có đủ 125 thẻ.
- Collection tính số ID thẻ khác nhau, không cộng thêm thẻ độc nhất khi có bản trùng hoặc mutation khác của cùng thẻ.
- Tiến độ collection dùng mức cao nhất từng đạt; salvage không làm mất mốc đã hoàn thành.
- Tiến độ tiền dùng giá trị lớn hơn giữa tổng VNĐ đã ghi nhận kiếm được và số dư cao nhất từng đạt. Chi tiêu không làm mất mốc.
- Trận thắng Arena và Tower mới đều được ghi nhận. Thua trận không tăng bộ đếm thắng.
- Modal có lọc nhóm, thanh tiến độ, trạng thái đang thực hiện/đủ điều kiện/đã nhận và nút nhận thưởng. Thanh điều hướng có số phần thưởng thường đang chờ nhận.
- Mốc thường cần bấm nhận. Thẻ Champion được cấp tự động.
- Cờ đã nhận trong module và biên nhận achievementRewardReceipts trong save thẻ ngăn cấp trùng khi reload hoặc thử nhận lại.

Đối chiếu save cũ: số dư đang có và số thắng Tower đã lưu được dùng làm lịch sử khởi đầu. Save trước đây không có tổng thắng Arena hay tổng VNĐ từng kiếm, nên không thể phục dựng chính xác hai giá trị đó. Tower đã vượt tầng 100 được đối chiếu để cấp Champion còn thiếu.

1.5. Thẻ thưởng tầng 100 và mở khóa roll
========================================

Mỗi Tower có một thẻ thưởng độc nhất, khai báo trong TOWER_REWARD_CARDS tại cards.js. Yêu cầu tiêu biểu:

unlockRequirement: 'tower_floor_100_normal'

- Khi vượt tầng 100, người chơi nhận ngay một bản Normal, không gắn mutation.
- Thẻ có ID mới, chỉ số riêng, ảnh dùng lại từ thẻ nguồn và không có passive bổ sung: passive: null.
- Khi chưa mở khóa, thẻ bị loại khỏi pool roll. Sau khi mở khóa, thẻ vào pool roll chuẩn và không yêu cầu thời tiết đang hoạt động.
- Mở khóa giữ vĩnh viễn dù bản được thưởng đã bị salvage; game không cấp lại bản miễn phí sau salvage.
- Các lần roll sau vẫn áp dụng mutation và EXP theo cơ chế hiện có.
- Champion của Weather Tower có nativeWeather tương ứng, nên bản Normal vẫn có thể tham gia Tower thời tiết đó.
- Thẻ thưởng bị loại khỏi pool tạo đối thủ Tower. Quy tắc không tạo đối thủ Griffith được giữ nguyên.

Bảng chỉ số và tỷ lệ của đủ 11 thẻ nằm ở mục 3.6.

1.6. Xuất và nhập save bảo vệ .acrsave
========================================

Modal chuyển save giữ hai nút Export Save và Import Save, nhưng định dạng ngoài đổi từ .json sang .acrsave. Dữ liệu bên trong vẫn là gói JSON đầy đủ của game.

Quy trình xuất:

1. Kiểm tra Web Crypto, Web Locks và cooldown xuất trước khi thực hiện.
2. Đồng bộ đồng hồ/thành tựu, ghi đủ bốn store game, kể cả game mới chưa từng vào Tower.
3. Tạo JSON gồm collection, biến thể, level/EXP, VNĐ, nâng cấp, trang bị, thời tiết, vật phẩm, buff, Tower và thành tựu. Khóa tương thích cũ được kèm theo nếu tồn tại; không thu thập dữ liệu ngoài game.
4. Ghi timestamp của lần xuất vào gói, tính HMAC-SHA-256, tạo payload rồi biểu diễn UTF-8 dưới dạng Base64.
5. Tạo file anime-card-save-YYYY-MM-DD.acrsave; ngày trong tên file dùng UTC.
6. Lưu cooldown ngay trước khi giao download tới trình duyệt; nếu giao download lỗi, khôi phục timestamp cũ. Không giao file nếu không thể ghi cooldown.

Trình duyệt không cung cấp xác nhận người dùng đã lưu file xuống ổ đĩa qua cách tải này. “Xuất thành công” ở đây là game đã tạo file và gọi giao download thành công; hủy hộp thoại lưu của trình duyệt sau đó không tự hoàn lại cooldown.

Quy trình nhập:

1. Kiểm tra cooldown nhập trước khi mở bộ chọn file và kiểm tra lại trong thao tác nhập.
2. Chỉ nhận file .acrsave. Đọc UTF-8 nghiêm ngặt, giữ BOM để không bỏ qua ký tự bị thêm.
3. Kiểm tra Base64 chuẩn, cấu trúc/phiên bản payload, checksum và biểu diễn ngoài đúng dạng chuẩn.
4. Sau khi xác thực, kiểm tra cấu trúc JSON, các store bắt buộc, kiểu dữ liệu, số hữu hạn, số lượng không âm và tên bản ghi không hợp lệ bằng bộ kiểm tra dữ liệu hiện có.
5. Hợp nhất timestamp theo giá trị lớn nhất: file cũ không được giảm cooldown đang có trên trình duyệt nhận.
6. Sao lưu giá trị các khóa hiện tại, ghi các store và timestamp nhập. Nếu ghi lỗi, khôi phục cả dữ liệu game lẫn cooldown, không dừng phiên đang chơi.
7. Khi ghi thành công, dừng auto-roll/timer tạm thời rồi location.reload(). Các chốt bảo vệ autosave, pagehide và thay đổi trạng thái hiển thị vẫn ngăn ghi đè dữ liệu vừa nhập.

Giới hạn dữ liệu JSON bên trong: 10 MiB. Giới hạn tệp/chuỗi Base64 ngoài: 32 MiB, dành chỗ cho escape JSON và phần tăng kích thước Base64. Trận chiến đang diễn ra không được phục hồi giữa chừng vì trạng thái trận tạm thời không nằm trong các store lưu bền. Timer potion giữ nguyên thời điểm hết hạn sau chuyển máy.

Save .json và JSON lõi cũ không được nhập trực tiếp qua giao diện mới, vì chấp nhận dữ liệu không có checksum sẽ tạo đường bỏ qua bảo vệ. Dữ liệu localStorage của người chơi đang có vẫn được đọc/chuyển đổi như trước; bản cập nhật không reset collection hay các hệ thống gameplay.

1.7. Kiểm tra toàn vẹn và cooldown 7 ngày
=========================================

Giới hạn bảo mật phải hiểu đúng: Base64 không phải mã hóa và không bảo đảm tính bí mật. Tên hàm encryptGameSave/decryptGameSave giữ theo giao diện được yêu cầu, nhưng chức năng thực tế là đóng gói/mở gói có xác thực toàn vẹn. Khóa HMAC nằm trong JavaScript phía người chơi nên không có tính bí mật đối với người có thể xem/sửa mã nguồn. Hệ thống phát hiện file bị chỉnh sửa thông thường, không phải giải pháp chống gian lận tuyệt đối.

Checksum sử dụng HMAC-SHA-256 với khóa được yêu cầu:

const SECRET_SALT = 'ANIME_CARD_RNG_SECURE_SECRET_KEY_2026';

Payload có bốn trường cố định: format, version, data, checksum. data là nguyên chuỗi JSON đã xuất; checksum được tính trên đúng chuỗi UTF-8 này, không parse rồi stringify lại trước khi xác minh.

Khi file lỗi định dạng, thay đổi dữ liệu/checksum, thêm khoảng trắng/BOM hoặc đổi biểu diễn ngoài không đúng chuẩn, import bị từ chối và hiện alert:

> Phát hiện dữ liệu đã bị chỉnh sửa trái phép!

Import bị từ chối không ghi dữ liệu và không bắt đầu cooldown mới. JSON qua checksum nhưng sai cấu trúc game cũng bị từ chối; thông báo cấu trúc dữ liệu phân biệt với thông báo checksum.

Hai timestamp độc lập được lưu trong localStorage:

- Khóa: save_cooldown_export; Ý nghĩa: Thời điểm lần xuất đã giao thành công tới trình duyệt.
- Khóa: save_cooldown_import; Ý nghĩa: Thời điểm lần nhập đã ghi thành công trước reload.

Mỗi hành động có cooldown 7 ngày = 604.800.000 ms. Xuất không tự khởi động cooldown nhập; nhập không tự coi là một lần xuất. Tuy nhiên, import giữ timestamp xuất từ file và giá trị lớn hơn đang có để không rút ngắn lịch sử cooldown. Timestamp nhập mới lấy giá trị lớn nhất giữa lịch sử hiện tại, lịch sử trong file và thời gian nhập hiện tại.

Thao tác trong cùng tab có cờ bận; các tab cùng origin phối hợp qua Web Locks với khóa anime_card_rng_save_transfer. Nếu API bảo mật/khóa không có, chức năng chuyển save dừng an toàn với thông báo, không hạ xuống checksum yếu. Modal hiển thị số ngày còn lại cùng ngày/giờ/phút/giây; nút bị chặn khi đang xử lý để tránh bấm lặp.

Cooldown sử dụng Date.now() và bộ nhớ của trình duyệt. Đổi đồng hồ, xóa/sửa localStorage, dùng browser/origin mới hoặc sửa mã phía client có thể vượt qua giới hạn này. Muốn chống gian lận và áp dụng cooldown theo tài khoản trên mọi thiết bị cần máy chủ có khóa bí mật, dữ liệu có thẩm quyền và thời gian phía máy chủ; bản game offline hiện không có các thành phần đó.

1.8. Auto Continue Battle và thanh điều hướng mới
=================================================

- Công tắc Auto Continue Battle nằm ở góc phải tiêu đề Battle Arena, cạnh nút thoát; có trạng thái ON/OFF. Có thể điều chỉnh ở màn hình chọn đội, trong trận hoặc trên màn hình kết quả.
- Mặc định OFF. ON chỉ tự tạo trận tiếp theo sau chiến thắng và chờ 1.500 ms để hiển thị kết quả. Trong Tower, trận tiếp theo là tầng kế tiếp của cùng Tower; Arena 1v1/4v4 tạo đối thủ mới theo cơ chế hiện hành.
- Tái sử dụng đội hình đã chọn, kiểm tra lại quyền sở hữu và biến thể trước khi bắt đầu. Mất thẻ, thiếu bản sao hoặc không còn đội hợp lệ sẽ chặn tự bắt đầu.
- OFF giữ màn hình kết quả với nút Battle Again để người chơi tự bấm. Tắt khi đang đợi hủy ngay lượt tiếp tục đang chờ; bật trên một kết quả thắng hợp lệ sẽ bắt đầu đếm lại 1.500 ms.
- Thua không tự tiếp tục. Thoát, đầu hàng, về lobby, đóng modal, đổi mode, đổi Tower, chọn lại đội, reset game hoặc nhập save thành công đều dọn timer chờ. Callback cũng đối chiếu đúng đối tượng trận đã thắng và modal đang mở để không khởi chạy trận cũ.
- Bấm Battle Again trong lúc chờ hủy timer cũ rồi bắt đầu đúng một trận. Trận đang đánh không thể bị nút bắt đầu gọi lặp thay thế.
- Lựa chọn được lưu bằng boolean JSON tại anime_card_rng_auto_continue_battle và được kèm trong .acrsave khi đã lưu. Save bảo vệ cũ chưa có khóa này vẫn được nhập; lựa chọn trở về OFF. Reload giữ lựa chọn nhưng không tự khôi phục hoặc tự bắt đầu trận chiến.
- Thông báo thay đổi bộ nhớ giữa các tab cập nhật trạng thái công tắc; chuyển OFF ở tab khác cũng hủy timer đang chờ. Khi bộ nhớ không khả dụng, lựa chọn chỉ tồn tại trong phiên hiện tại.
- Bỏ nút Tower trùng ở thanh điều hướng chính. Vào Tower qua Arena, chọn TOWER rồi chọn loại thời tiết và đội hình; Tower Shop vẫn nằm trong khu vực này.
- Items, Achievements, Save và Reset nằm trong menu ⋯. Menu dùng phần tử details/summary, đóng khi chọn tác vụ, bấm ra ngoài hoặc nhấn Escape; các nút giữ nguyên chức năng.
- Thanh điều hướng cho phép xuống hàng theo chiều rộng màn hình, giữ số dư VNĐ và đồng hồ trong ô riêng. Các nút Collection/Upgrades trên màn hình nhỏ có biểu tượng và tên truy cập rõ ràng; các mục trong menu vẫn có nhãn.
- Hàng đợi đội hình Arena cuộn ngang khi passive tạo thêm đơn vị, giữ bốn vị trí mỗi vùng hiển thị thay vì tạo thêm hàng làm chật khu vực chiến đấu.

1.9. Tower và kinh tế chiến đấu hiện hành
========================================

- Tầng 1–100 dùng đường cong HP lãi kép mượt, ATK luôn lấy 20% HP tối đa. Tầng 100, ba lính và một trùm có tổng sức mạnh nền 470.400, trước passive.
- Từ tầng 101 chuyển sang tăng HP tuyến tính theo điểm neo tầng 100; không dùng tăng HP 20% và ATK 30% mỗi tầng nữa. ATK dùng cùng đường cong HP nên không có hiện tượng vượt HP ở tầng sâu.
- Elite trước hoặc ở tầng 100 có bonus HP nền 5%. Sau tầng 100, mỗi mốc 10 tầng cộng vĩnh viễn 5% HP của điểm neo, không rút bonus ở tầng sau phòng Elite. Chi tiết tại mục 3.5.
- Thưởng Elite 100 là 80–90 xu; Elite 110 là 100–110 xu. Tầng thường sau 100 nhận thêm 2 xu mỗi 5 tầng; không còn nhân ba khoảng thưởng sau tầng 100.
- passives.js theo dõi damageTotals.player và damageTotals.enemy trong đối tượng trận. Tower VNĐ nền là floor((damage người chơi + damage đối thủ) / 10). Màn hình kết quả Tower thể hiện tổng damage và damage từng đội thay cho các ô bonus thời gian/chênh level.
- Tower vẫn có xu, VNĐ, potion theo hệ thống cũ và thẻ Champion ở tầng 100, nhưng cấp 0 EXP chiến đấu cho cả thẻ lẫn bộ đếm EXP chung. EXP Potion/nâng cấp/passive không thể biến 0 EXP Tower thành số dương.
- EXP khi thắng Arena thường: 4v4 lấy 4%–10%, 1v1 lấy 1%–5% EXP cần cho level hiện tại của từng ID thẻ trong đội đã chọn. Dùng chung một tỷ lệ ngẫu nhiên cho trận, tính số EXP riêng cho từng thẻ; không chia một gói EXP cố định cho toàn đội.
- Các tỷ lệ trên là mức nền chưa có bonus. Nâng cấp EXP, EXP Potion và passive tăng thưởng vẫn áp dụng sau mức nền; khi có bonus, EXP thực nhận có thể vượt 10% hoặc 5%. Log trận ghi tỷ lệ nền, mẫu số EXP và lượng EXP thực cấp để đối chiếu.
- Thẻ trùng ID trong nhiều vị trí nhận một khoản cho level dùng chung. Clone/đồng đội tạm từ passive không tạo thêm khoản EXP. Thẻ đã ở level 999 hoặc không còn sở hữu không nhận EXP thẻ.
- Nếu auto-roll vẫn đang hoạt động trong Tower, EXP do roll là nguồn riêng và vẫn hoạt động như trước; bỏ EXP Tower không dừng hoặc thay đổi cơ chế roll.

2. Cân Bằng & Sửa Lỗi
=====================

2.1. Các lỗi đã sửa trong những đợt mở rộng gần nhất
====================================================

- Hạng mục: Weather Tower bỏ sót mutation; Hành vi sau sửa: Đọc mutationId của dữ liệu thời tiết thô, hoặc đối tượng mutation đã phân giải; kiểm tra thẻ native và cả hai mutation.
- Hạng mục: Dữ liệu mutation cũ; Hành vi sau sửa: Hợp nhất mutations, mutationIds, mutation; mảng rỗng ở một trường không che dữ liệu ở trường khác. Giữ alias blizzard → frost, sacrifice → eclipsed.
- Hạng mục: Giới hạn tầng 100; Hành vi sau sửa: Gỡ giới hạn khỏi tải save, tầng kế tiếp, tính chỉ số, thưởng và nhãn giao diện. Save sau tầng 100 không bị hạ xuống 100.
- Hạng mục: Potion chỉ có thể rơi/mua theo cùng danh sách; Hành vi sau sửa: Tách danh mục Tower Shop và danh sách rơi thưởng. Speed Battle Potion không thể lọt vào drop thường.
- Hạng mục: Kho chỉ lưu potion; Hành vi sau sửa: Chuyển sang bản ghi vật phẩm tổng quát, giữ vật phẩm chưa biết và thông tin tùy chỉnh.
- Hạng mục: Timer qua reload; Hành vi sau sửa: Dùng thời điểm hết hạn tuyệt đối; mở lại game không khởi động lại timer.
- Hạng mục: Cấp trùng phần thưởng thành tựu; Hành vi sau sửa: Lưu cờ nhận cùng biên nhận cấp thưởng trong save thẻ; lần thử lại dùng biên nhận để tránh cấp thêm.
- Hạng mục: Thẻ thưởng thiếu passive; Hành vi sau sửa: Hiển thị thông tin phù hợp khi passive là null, tránh lỗi ở kết quả roll và màn hình xem thẻ.
- Hạng mục: Import bị autosave ghi đè; Hành vi sau sửa: Chặn các đường ghi trạng thái cũ trong giai đoạn nhập và reload.
- Hạng mục: Sửa file chuyển save; Hành vi sau sửa: Kiểm tra HMAC trên dữ liệu, định dạng ngoài chuẩn và UTF-8/Base64 nghiêm ngặt trước khi chấp nhận import.
- Hạng mục: Chuyển save liên tục hoặc bấm đồng thời; Hành vi sau sửa: Cooldown độc lập, cờ bận và Web Locks; không cho file cũ hạ timestamp đang có.
- Hạng mục: Export của game mới thiếu Tower; Hành vi sau sửa: Chủ động ghi đủ dữ liệu các module, kể cả store Tower còn trống.
- Hạng mục: File nhập lỗi hoặc ghi lỗi; Hành vi sau sửa: File sai bị từ chối trước khi thay đổi dữ liệu; lỗi ghi được xử lý bằng khôi phục các khóa đã sao lưu.

2.2. Cân bằng và sửa trạng thái được kế thừa
============================================

Các quy tắc dưới đây đã tồn tại trong bản game modular đầu vào và được giữ nguyên trong các đợt thêm kho tổng quát/thành tựu. Chúng không phải nerf/buff mới của đợt bảo vệ save trước đó.

- Cơ chế: Bleed chống hồi máu; Quy tắc hiện hành: Khi còn hiệu ứng Bleed với lượt hiệu lực dương, hàm hồi máu không tăng HP; giao diện thể hiện trạng thái chặn hồi máu.
- Cơ chế: Tăng HP tối đa khi đang Bleed; Quy tắc hiện hành: HP tối đa vẫn có thể tăng theo kỹ năng, nhưng phần hồi HP đi kèm việc tăng HP tối đa bị chặn.
- Cơ chế: Hồi HP sau hạ gục/hồi sinh; Quy tắc hiện hành: Các đường phục hồi HP được bảo vệ bởi kiểm tra Bleed; hồi sinh không được phục hồi HP khi Bleed còn hiệu lực.
- Cơ chế: Senku; Quy tắc hiện hành: Ở nhánh hỗ trợ khi không phải người tấn công, hồi 2,5% HP tối đa cho đồng đội phù hợp; vẫn chịu giới hạn HP và luật Bleed.
- Cơ chế: Meruem; Quy tắc hiện hành: Mỗi lần nhận đòn tăng một Aura, tối đa 5. Lần đầu đạt 5/5 thử hồi 5% HP tối đa một lần; nếu đang Bleed, lần thử bị chặn và không lặp vô hạn ở các đòn sau.
- Cơ chế: Homura; Quy tắc hiện hành: Khi hồi máu đưa một đơn vị từ dưới 60% HP lên ít nhất 60%, chỉ Homura còn sống có passive hiệu lực tương ứng mới kích hoạt đóng băng hỗ trợ. Cờ sử dụng giới hạn một lần cho đơn vị Homura đó trong trận.
- Cơ chế: Đóng băng; Quy tắc hiện hành: Hiệu ứng hỗ trợ Homura đặt 5 lượt đóng băng; bộ đếm giảm theo lượt xử lý của đơn vị chịu hiệu ứng, không được tái kích hoạt liên tục bởi mọi lần hồi máu.
- Cơ chế: Level thẻ; Quy tắc hiện hành: Tăng tuyến tính 7,5% HP/ATK gốc mỗi level sau level 1; các mutation của cùng ID dùng chung level.
- Cơ chế: Thua trận; Quy tắc hiện hành: Không xóa hoặc làm mất thẻ của người chơi.

2.3. Phạm vi thay đổi chỉ số thẻ
================================

- 100 thẻ gốc giữ nguyên định nghĩa trong đợt thêm thành tựu và thẻ thưởng.
- 11 Champion là thẻ mới; chỉ số gốc, tỷ lệ roll và điều kiện mở khóa được công bố tại mục 3.6.
- passives.js, passives.css và weathers.js được giữ nguyên trong đợt thêm achievements/JSON save.
- Trong đợt bảo vệ save trước đó, không chỉnh chỉ số, passive, trạng thái, tỷ lệ roll hoặc nhịp thời tiết. Thay đổi tập trung vào định dạng chuyển save, xác thực và timestamp cooldown.

2.4. Sửa điều kiện kết thúc Tower và hàng đợi bổ sung
=====================================================

- Lỗi gốc: isTeamDefeated trước đây loại toàn bộ đơn vị isClone khi kiểm tra thắng/thua. Vì vậy, hết đơn vị gốc có thể kết thúc trận dù clone vẫn còn HP.
- Trong mode tower, kiểm tra toàn bộ playerTeam và enemyTeam, bao gồm các vị trí bổ sung do passive tạo ra. Đơn vị còn sống phải có HP > 0 và defeated không phải true.
- Chỉ công bố chiến thắng khi hàng đợi đối thủ không còn đơn vị sống. Trùm bị hạ trước không đủ điều kiện chiến thắng nếu lính hoặc reserve còn sống. Đội người chơi cũng được tiếp tục đánh khi còn clone hợp lệ; hết toàn đội mới thua.
- Sau khi xử lý đòn đánh, phản đòn, hiệu ứng và hook sinh clone/hồi sinh của lượt, game mới đánh giá kết quả. Các lần đánh giá trong nhánh lượt bị bỏ qua cũng áp dụng cùng quy tắc toàn đội.
- Đơn vị tuyến đầu giữ vị trí cho đến khi bị hạ. Game chọn đơn vị sống tiếp theo từ chỉ số hiện tại, quét vòng qua toàn mảng để không bỏ sót đơn vị hồi sinh hoặc clone được chèn ở vị trí trước đó. Không đặt lại HP khi đưa reserve vào arena.
- Metal Cooler chèn clone phía sau chính nó. Khi phép chèn dịch chỉ số tuyến đầu, game cập nhật chỉ số theo đúng đối tượng đang đánh, tránh đổi người tuyến đầu ngoài ý muốn.
- Doflamingo thêm đồng đội chuyển hóa vào cuối đội; các reserve còn sống vẫn phải được giải quyết trước khi kết thúc Tower. Giữ nguyên tỷ lệ kích hoạt và chỉ số passive.
- Giữ nguyên việc Frieza sắp xếp đối thủ theo ATK để gặp đơn vị yếu nhất trước; sửa phép chèn clone không ghi đè thứ tự mà passive chủ động thay đổi.
- endBattle/finishBattle cũng chặn yêu cầu thắng Tower khi checkBattleWinner chưa xác nhận hàng đợi đã sạch; yêu cầu thắng bị chặn không hủy timer lượt combat đang chạy. Tower Coins, tăng tầng và mốc tầng 100 chỉ xử lý sau kết quả hợp lệ, một lần mỗi trận.
- Quy tắc cũ về clone tạm thời trong Arena 1v1/4v4 được giữ nguyên; thay đổi điều kiện toàn bộ reserve áp dụng cho Tower. Đợt sửa hàng đợi trước đó không sửa chỉ số thẻ, xác suất RNG, tỷ lệ clone, Bleed, freeze hoặc công thức thưởng. Đợt cân bằng hiện tại thay công thức Tower/EXP như mục 2.5.
- README.txt thay thế hoàn toàn README.md trong bản phát hành; không còn cú pháp Markdown, bảng Markdown hay khối mã có dấu rào.

2.5. Thay đổi kinh tế và EXP được giữ lại
========================================

- Mức tăng lãi kép HP +20%/ATK +30% sau tầng 100 của bản trước đã bị rút lại trong bản sửa khẩn cấp. Bản hiện hành dùng cùng một đường cong HP để suy ra ATK; công thức hiện hành nằm ở mục 3.5.
- Thưởng xu mạnh từ thuật toán nhân ba sau tầng 100 cũng bị rút lại. Thưởng Elite 110 hiện 100–110 xu; không phải 354–390 xu.
- Bỏ thưởng EXP cố định theo thời gian trận và phép chia cho số ID trong đội. Yêu cầu level của từng thẻ quyết định EXP nền mới; mẫu số lấy trước khi cấp EXP của chiến thắng, nên roll tăng level trong trận được phản ánh đúng.
- Bỏ lỗi tối thiểu 1 EXP mỗi thẻ trong Tower: nhánh Tower tạo danh sách thưởng EXP rỗng, không gọi grantCardExperience cho EXP trận và chỉ cộng 0 vào EXP chung.
- Damage được ghi ngay tại điểm HP bị giảm để không mất số liệu khi mục tiêu được hồi máu, hồi sinh hoặc khi đội sinh thêm clone. Burn/Bleed, phản damage, support và đòn kết liễu tức thì đều đi vào thống kê phù hợp.
- Ghi nhận HP giảm do passive sống sót trước đòn chí mạng mà không sửa tác dụng sống sót hoặc chỉ số damage của passive. Không tính overkill, damage bị chặn, hồi máu, tự hy sinh hay giảm HP do hết buff chỉ số.
- Không sửa dữ liệu của 111 thẻ, tỷ lệ roll/mutation, giá potion, thời hạn buff, quy tắc Bleed/freeze, luật hàng đợi Tower hoặc Auto Continue. Đối thủ Tower chịu giới hạn tỷ lệ ATK mới, kể cả sau passive; Arena và thẻ người chơi giữ chỉ số riêng. Lớp HMAC/Base64, định dạng .acrsave và hai cooldown 7 ngày giữ nguyên.
- Không thêm store localStorage hoặc nâng phiên bản save. Tiến độ Tower/xu/EXP hiện có được giữ; công thức mới chỉ áp dụng khi tạo trận và trao thưởng từ bản này trở đi, không truy thu thưởng cũ.

2.6. Sửa khẩn cấp tỷ lệ HP/ATK và lạm phát xu
============================================

- Nguyên nhân ATK vượt HP: hai đường cong lãi kép độc lập có hệ số 1,30 và 1,20; tỷ lệ ATK/HP tăng theo số tầng. Đã bỏ hoàn toàn cặp hệ số này khỏi Tower.
- ATK khi sinh đối thủ luôn bằng floor(0,20 × HP tối đa). HP nền do đó xấp xỉ năm lần ATK ở mọi tầng, cho cả lính và trùm.
- TowerEnemy có bộ bảo vệ maxHp/atk trong tower.js. Max HP giữ hữu hạn và tối thiểu 5; ATK luôn từ 1 đến floor(0,25 × maxHp), vì vậy maxHp > ATK, kể cả ở giới hạn biểu diễn số.
- Bảo vệ áp dụng trước passive vào trận, cho clone đối thủ từ Metal Cooler, Doflamingo, Jin Mori, khi hồi sinh và khi thay đổi HP/ATK trực tiếp giữa lượt. Thay đổi maxHp lập tức cập nhật trần ATK. Nhánh tính ATK hiệu lực có buff cũng chịu trần này trước khi áp dụng weaken.
- ATK có thể thấp hơn 15% HP sau debuff hoặc passive tăng HP; không tăng ngược ATK để bù và vô hiệu hóa hiệu ứng phòng thủ. Tỷ lệ nền 20% nằm trong khoảng 15%–25%; trần runtime 25% bảo đảm HP tối đa vẫn cao hơn rõ rệt.
- Luật dùng HP tối đa làm mẫu số, không dùng HP còn lại: đơn vị đang còn 1 HP vẫn có thể tấn công. Đơn vị chết không thể đáp ứng HP hiện tại > ATK; nó không được tấn công và vẫn giữ luật defeated hiện hành.
- Tạm buff Storm Susano ghi đúng lượng ATK thực tăng sau trần, nên hết buff không trừ nhầm phần tăng đã bị chặn. Buff tạm Android 21 tăng maxHp trước ATK cho đối thủ Tower để giữ tỷ lệ và khôi phục chỉ số đúng khi hết hạn.
- Giới hạn chỉ áp dụng đối thủ/clone thuộc enemyTeam trong Tower. Thẻ người chơi, clone người chơi và đối thủ Arena 1v1/4v4 không bị áp trần Tower.
- Trần là giới hạn chỉ số ATK, không xóa passive chí mạng, đòn nhiều hit, phản damage, kết liễu hay hệ số damage kỹ năng. Những cơ chế đó vẫn có thể gây đòn mạnh theo mô tả; bản sửa loại bỏ ATK nền hàng chục triệu ở tầng 134, không bảo đảm mọi cặp thẻ đều không thể bị hạ trong một lượt.
- Xu chuẩn sau tầng 100 tăng 2 xu mỗi 5 tầng. Elite dùng khoảng thưởng riêng tăng nhẹ theo tầng, bỏ nhân ba và phần căn bậc hai tăng nhanh của bản trước.
- Giữ nguyên xu đã sở hữu và tiến độ cũ; không thu hồi xu người chơi đã nhận. Chỉ trận/thưởng được tạo từ bản này dùng công thức mới.

3. Thông Số & Công Thức Chi Tiết
================================

3.1. Quy ước tính toán
======================

- floor(x): lấy phần nguyên xuống.
- round(x): làm tròn theo Math.round của JavaScript.
- clamp(x, a, b): giới hạn x trong đoạn từ a đến b.
- L: level thẻ, bắt đầu từ 1; u: cấp nâng cấp trong shop, bắt đầu từ 0.
- Chỉ số HP/ATK dưới đây là chỉ số trước các hiệu ứng passive/trạng thái phát sinh trong trận, trừ khi có ghi khác.

3.2. RNG, Luck và cooldown roll
===============================

M_Luck = (1 + 0,25 × u_Luck) × P_Lucky
Cooldown_ms = 1.500 / [(1 + 0,15 × u_Speed) × P_Speed]
Chance_hiệu_dụng = max(0,000001; chance_thẻ / M_Luck)
p_thử_thẻ = min(1; 1 / Chance_hiệu_dụng)

P_Lucky bằng 1,25 khi Lucky Potion có hiệu lực, ngoài ra bằng 1. P_Speed bằng 1,10 khi Speed Potion có hiệu lực, ngoài ra bằng 1.

Pool gồm thẻ thỏa điều kiện mở khóa và thời tiết. Game sắp xếp từ chance lớn xuống nhỏ, thử từng thẻ, dừng ở thẻ đầu tiên thành công; có thể không nhận được thẻ nếu mọi lần thử đều trượt. Vì vậy, nhãn “1 trên N” là tỷ lệ thử của thẻ, không phải xác suất cuối cùng của một bảng trọng số đã chuẩn hóa.

Với thứ tự pool cố định, xác suất thực nhận thẻ i là:

p_nhận_i = p_thử_i × tích(1 - p_thử_j) với tất cả j đứng trước i

Cooldown được khóa trước khi xử lý kết quả. Auto-roll dùng vòng lặp toàn cục và callback hết cooldown, không thêm một interval roll riêng. Mỗi lượt thực hiện tăng tổng roll một lần; roll không tự cấp VNĐ ngay.

3.3. Thời tiết và mutation
==========================

- Thông số: Đồng hồ game; Giá trị: 1 giây thực = 1 giây game
- Thông số: Nhịp vòng lặp toàn cục; Giá trị: 1.000 ms
- Thông số: Khoảng xét sinh thời tiết; Giá trị: 300 giây
- Thông số: Thời gian hiệu lực thời tiết; Giá trị: 600 giây
- Thông số: Tỷ lệ sinh thời tiết đặc biệt khi xét; Giá trị: 55%
- Thông số: Tỷ trọng nhóm phổ biến khi đã sinh thời tiết; Giá trị: 65%
- Thông số: Tỷ trọng nhóm trung bình khi đã sinh thời tiết; Giá trị: 25%
- Thông số: Tỷ trọng nhóm hiếm khi đã sinh thời tiết; Giá trị: 10%
- Thông số: Tỷ lệ thử mutation sau khi roll được thẻ; Giá trị: 6,5%, khi có thời tiết đặc biệt đang hoạt động
- Thông số: Tỷ lệ mutation thứ hai sau lần đầu thành công; Giá trị: 10%, khi có ít nhất hai thời tiết khác nhau
- Thông số: Tỷ lệ mutation đôi trên một lần roll trúng thẻ, đủ điều kiện; Giá trị: 6,5% × 10% = 0,65%
- Thông số: Số mutation tối đa mỗi lần roll; Giá trị: 2

Thời tiết có thể tồn tại đồng thời. Khi không có thời tiết đặc biệt, roll không tạo mutation từ cơ chế thời tiết này.

- Weather Tower / thời tiết: Raining; Mutation: Wet; Hệ số HP/ATK: 1,50
- Weather Tower / thời tiết: Snowing; Mutation: Frost; Hệ số HP/ATK: 1,75
- Weather Tower / thời tiết: Sunny; Mutation: Solar; Hệ số HP/ATK: 1,60
- Weather Tower / thời tiết: Sugar; Mutation: Sweat; Hệ số HP/ATK: 1,45
- Weather Tower / thời tiết: Reaper; Mutation: Hollow; Hệ số HP/ATK: 3,00
- Weather Tower / thời tiết: Eclipse; Mutation: Eclipsed; Hệ số HP/ATK: 2,00
- Weather Tower / thời tiết: Malevolent; Mutation: Cursed; Hệ số HP/ATK: 3,25
- Weather Tower / thời tiết: Tsukuyomi; Mutation: Mangekyo; Hệ số HP/ATK: 2,80
- Weather Tower / thời tiết: Heavenly; Mutation: Angelic; Hệ số HP/ATK: 2,60
- Weather Tower / thời tiết: Shadow; Mutation: Monarch; Hệ số HP/ATK: 2,40

Mutation đôi nhân các hệ số với nhau. Ví dụ Wet + Solar có hệ số 1,50 × 1,60 = 2,40.

Weather Tower chấp nhận thẻ có requiredWeather, requiredWeathers hoặc nativeWeather phù hợp, hoặc biến thể sở hữu chứa mutation phù hợp. Normal Tower chấp nhận mọi thẻ còn bản sao sở hữu. Bộ chọn đội vẫn kiểm tra số bản sao, không cho dùng nhiều hơn số lượng đang có.

3.4. Level, EXP và giá trị salvage
==================================

M_Level = 1 + 0,075 × (L - 1)
HP_hiển_thị = round(HP_gốc × M_Mutation × M_Level)
ATK_hiển_thị = round(ATK_gốc × M_Mutation × M_Level)
EXP_cần = max(1; floor(100 × R × L))

Level tối đa là 999. Mức tăng 7,5% là tuyến tính theo chỉ số gốc, không phải nhân lãi kép 1,075 mỗi level.

- Rarity nội bộ: Common; Hệ số R cho EXP: 1
- Rarity nội bộ: Rare; Hệ số R cho EXP: 1,6
- Rarity nội bộ: Epic; Hệ số R cho EXP: 2,4
- Rarity nội bộ: Legendary; Hệ số R cho EXP: 3,6
- Rarity nội bộ: Mythic; Hệ số R cho EXP: 5,2
- Rarity nội bộ: Secret; Hệ số R cho EXP: 8

EXP_roll_mới = max(1; floor(8 × R × M_Mutation × M_EXP))
EXP_roll_trùng = max(1; floor(EXP_cần_hiện_tại × 0,50 × P_EXP))
Giá_trị_gốc_thẻ = floor(10 × chance_thẻ^0,45)
Salvage_mỗi_bản = floor(Giá_trị_gốc_thẻ × M_Mutation)
VNĐ_salvage = floor[(Salvage_mỗi_bản × số_bản_thực_xóa) × M_VNĐ]

EXP roll trùng đọc trực tiếp hệ số EXP Potion; không nhân thêm toàn bộ hệ số nâng cấp EXP. Level thẻ không tăng giá trị salvage trong công thức hiện hành.

3.5. Tower tăng nhẹ, tỷ lệ cố định và thưởng xu
==============================================

Gọi F là tầng cần đánh, làm tròn xuống và tối thiểu 1. Q = 1 cho lính, Q = 5 cho trùm. G = Number.MAX_VALUE / 1024 là giới hạn số học để tránh Infinity, không phải tầng kết thúc.

Tầng 1–100:
E = 1,05 nếu F chia hết cho 10; ngoài ra E = 1.
HP_raw(F,Q) = 100 × 400^((F - 1)/99) × Q × E.

Tầng 101 trở đi:
d = F - 100.
S(d) = 1 + 0,015 × d + 0,05 × floor(d / 10).
HP_raw(F,Q) = 42.000 × S(d) × Q.

Mỗi tầng sau 100 thêm 1,5% HP của điểm neo 42.000; mỗi mốc 10 tầng thêm vĩnh viễn 5% của điểm neo. Đây là tăng tuyến tính theo điểm neo, không phải lãi kép 1,015^d. Trung bình qua mỗi chu kỳ 10 tầng thêm 20% HP điểm neo; tỷ lệ tăng so với tầng hiện tại giảm dần theo độ sâu. Không có bước bỏ bonus Elite làm HP giảm ở tầng kế tiếp.

Chỉ số cuối:
HP_tối_đa = max(5; round(min(G; HP_raw))).
ATK_nền = max(1; floor(0,20 × HP_tối_đa)).
ATK_trần_runtime = max(1; floor(0,25 × HP_tối_đa)).
ATK_đối_thủ_runtime = clamp(ATK_sau_thay_đổi; 1; ATK_trần_runtime).
Sức_mạnh_đơn_vị = round(HP_tối_đa + 2 × ATK).
Sức_mạnh_đội_nền = 3 × Sức_mạnh_lính + Sức_mạnh_trùm.

Ví dụ chưa có passive:
- Tầng 1: lính HP 100 / ATK 20; sức mạnh đội 1.120; thưởng 4–6 xu.
- Tầng 2: lính HP 106 / ATK 21; sức mạnh đội 1.187; thưởng 4–6 xu.
- Tầng 99: lính HP 37.651 / ATK 7.530; sức mạnh đội 421.690; thưởng 20–22 xu.
- Tầng 100 Elite: lính HP 42.000 / ATK 8.400; trùm HP 210.000 / ATK 42.000; sức mạnh đội 470.400; thưởng 80–90 xu.
- Tầng 101: lính HP 42.630 / ATK 8.526; sức mạnh đội 477.456; thưởng 24–28 xu.
- Tầng 102: lính HP 43.260 / ATK 8.652; sức mạnh đội 484.512; thưởng 24–28 xu.
- Tầng 110 Elite: lính HP 50.400 / ATK 10.080; trùm HP 252.000 / ATK 50.400; sức mạnh đội 564.480; thưởng 100–110 xu.
- Tầng 134: lính HP 69.720 / ATK 13.944; trùm HP 348.600 / ATK 69.720; sức mạnh đội 780.864; thưởng 36–40 xu.
- Tầng 200 Elite: lính HP 126.000 / ATK 25.200; sức mạnh đội 1.411.200; thưởng 190–200 xu.
- Tầng 1.000 Elite: lính HP 798.000 / ATK 159.600; sức mạnh đội 8.937.600; thưởng 990–1.000 xu.

Tầng 101→102 chỉ tăng 7.056 sức mạnh nền, khoảng 1,48%; không còn tăng 126.508 như bản trước. HP nền tại tầng 100 vẫn trong mục tiêu sức mạnh đội 400K–500K. Tăng/giảm HP bởi passive có thể đổi sức mạnh thực tế, nhưng không cho ATK đối thủ vượt trần 25% HP tối đa.

Các thuật toán chọn thẻ, weather và mutation giữ nguyên:
- Tầng thường ưu tiên lính đến Legendary, trùm từ Legendary; Elite ưu tiên Mythic/Secret, giữ pool dự phòng.
- Weather Tower ưu tiên pool native phù hợp với xác suất thử 75% nếu có thẻ. Pool nền vẫn có thể chọn thẻ phù hợp.
- Mutation thời tiết đối thủ được thử 75% mỗi vị trí. Lọc người chơi giữ native weather hoặc một trong hai mutation phù hợp.
- Không giới hạn tầng thiết kế. Khi chạm G, số học không còn biểu diễn HP tăng thêm; ATK vẫn tính 20% HP hoặc chịu trần runtime 25%, không chạm cùng một giá trị với HP.

Công thức xu:
Tầng 1–99:
B = 4 + floor((F - 1)/6).
Nếu thường: Xu_min = B; Xu_max = B + 2.
Nếu Elite: Xu_min = 3 × B + 10 + floor(F/10); Xu_max = 3 × (B + 2) + 10 + floor(F/10).

Tầng 100 Elite:
Xu_min = 80; Xu_max = 90.

Tầng thường sau 100:
K = floor((F - 101)/5).
Xu_min = 24 + 2 × K; Xu_max = Xu_min + 4.
Ví dụ: tầng 101–105 là 24–28, tầng thường 106–109 là 26–30, tầng 111–115 là 28–32. Phòng Elite nằm trong khoảng tầng dùng công thức riêng, không cộng cả hai công thức.

Elite từ tầng 110:
Xu_min = 90 + (F - 100); Xu_max = Xu_min + 10.
Ví dụ: Elite 110 là 100–110; Elite 120 là 110–120; Elite 130 là 120–130. Khoảng thưởng Elite tăng 10 xu mỗi 10 tầng, không nhân ba mức thưởng thường.

Xu_thử = Xu_min + floor(U × (Xu_max - Xu_min + 1)), U ngẫu nhiên trong [0;1).
Xu_thực_cấp = min(Xu_thử; max(0; Number.MAX_SAFE_INTEGER - Xu_đang_có)).
Các biên và tổng xu có giới hạn số học Number.MAX_SAFE_INTEGER để save hợp lệ. Chỉ thắng đúng tầng kế tiếp mới cấp thưởng; gọi lại kết quả không cấp trùng. Rich Potion/passive không nhân Tower Coins. Phòng Elite thưởng cao hơn phòng thường ngay sau nó là chủ ý; không làm giảm HP/ATK nền tầng kế tiếp.

3.6. Thông số 11 thẻ Champion
=============================

Các giá trị là ở level 1, bản Normal, trước hiệu ứng trận đấu. Tất cả có rarity nội bộ Secret, không có passive bổ sung và không yêu cầu thời tiết đang hoạt động để roll sau mở khóa.

- Tower: Normal; Thẻ thưởng: Naruto • Tower Champion; HP gốc: 12.000; ATK gốc: 1.800; Tỷ lệ thử nền khi đã mở khóa: 1 trên 500.000
- Tower: Raining; Thẻ thưởng: Aquaman • Storm Champion; HP gốc: 12.800; ATK gốc: 1.920; Tỷ lệ thử nền khi đã mở khóa: 1 trên 550.000
- Tower: Snowing; Thẻ thưởng: Toshiro • Frost Champion; HP gốc: 13.600; ATK gốc: 2.040; Tỷ lệ thử nền khi đã mở khóa: 1 trên 600.000
- Tower: Sunny; Thẻ thưởng: Solar Deity • Sun Champion; HP gốc: 14.400; ATK gốc: 2.160; Tỷ lệ thử nền khi đã mở khóa: 1 trên 650.000
- Tower: Sugar; Thẻ thưởng: Android 21 • Sugar Champion; HP gốc: 15.200; ATK gốc: 2.280; Tỷ lệ thử nền khi đã mở khóa: 1 trên 700.000
- Tower: Reaper; Thẻ thưởng: Hollow • Reaper Champion; HP gốc: 16.000; ATK gốc: 2.400; Tỷ lệ thử nền khi đã mở khóa: 1 trên 750.000
- Tower: Eclipse; Thẻ thưởng: Eclipse Harvester • Eclipse Champion; HP gốc: 16.800; ATK gốc: 2.520; Tỷ lệ thử nền khi đã mở khóa: 1 trên 800.000
- Tower: Malevolent; Thẻ thưởng: Malevolent King • Cursed Champion; HP gốc: 17.600; ATK gốc: 2.640; Tỷ lệ thử nền khi đã mở khóa: 1 trên 850.000
- Tower: Tsukuyomi; Thẻ thưởng: Tsukuyomi Eye • Moon Champion; HP gốc: 18.400; ATK gốc: 2.760; Tỷ lệ thử nền khi đã mở khóa: 1 trên 900.000
- Tower: Heavenly; Thẻ thưởng: Heavenly Seraph • Light Champion; HP gốc: 19.200; ATK gốc: 2.880; Tỷ lệ thử nền khi đã mở khóa: 1 trên 950.000
- Tower: Shadow; Thẻ thưởng: Shadow Monarch • Shadow Champion; HP gốc: 20.000; ATK gốc: 3.000; Tỷ lệ thử nền khi đã mở khóa: 1 trên 1.000.000

Với chỉ số thứ tự i từ 0 đến 10 theo bảng:

HP_gốc = 12.000 + 800 × i
ATK_gốc = 1.800 + 120 × i
chance = 500.000 + 50.000 × i

Cấp thẻ tự động không cần roll trúng tỷ lệ trên. Tỷ lệ chỉ áp dụng cho các lần gacha sau khi mở khóa, cùng hệ số Luck và quy tắc thử tuần tự ở mục 3.2.

3.7. Potion, timer và tỷ lệ rơi thưởng
======================================

- Vật phẩm: Lucky Potion; Tác dụng khi hoạt động: Nhân Luck 1,25; Thời gian mỗi chai: 600 giây; Giá Tower Shop: 25 Tower Coins; Nguồn rơi từ thắng trận: Có
- Vật phẩm: Speed Potion; Tác dụng khi hoạt động: Nhân tốc độ roll 1,10; cooldown chia 1,10; Thời gian mỗi chai: 600 giây; Giá Tower Shop: 25 Tower Coins; Nguồn rơi từ thắng trận: Có
- Vật phẩm: Rich Potion; Tác dụng khi hoạt động: Nhân hệ số VNĐ 1,25; Thời gian mỗi chai: 600 giây; Giá Tower Shop: 25 Tower Coins; Nguồn rơi từ thắng trận: Có
- Vật phẩm: EXP Potion; Tác dụng khi hoạt động: Nhân hệ số EXP 1,25; Thời gian mỗi chai: 600 giây; Giá Tower Shop: 25 Tower Coins; Nguồn rơi từ thắng trận: Có
- Vật phẩm: Speed Battle Potion; Tác dụng khi hoạt động: Lượt combat từ 3 giây xuống 1 giây, áp dụng Arena và Tower; Thời gian mỗi chai: 600 giây; Giá Tower Shop: 100 Tower Coins; Nguồn rơi từ thắng trận: Không; độc quyền Tower Shop

Thời_điểm_hết_hạn_mới = max(thời_gian_hiện_tại; thời_điểm_hết_hạn_cũ) + 600.000 ms

Dùng thêm chai cùng loại kéo dài timer; không cộng dồn thêm phần trăm buff. Timer dùng thời gian thực tuyệt đối, tiếp tục hết hạn khi đóng game. Speed Battle Potion không thay đổi tốc độ roll. Sau hết hiệu lực, lượt combat được lên lịch tiếp theo dùng nhịp gốc 3 giây.

Gọi m là số lần thắng liên tiếp không rơi potion, lưu tối đa 10; D là chỉ số Drop Chance, đơn vị điểm phần trăm, giới hạn từ 0 đến 20:

p_rơi = min(0,30; 0,10 + 0,02 × m + clamp(D, 0, 20) / 100)

- Khi D = 0, cơ hội bắt đầu ở 10%, tăng 2 điểm phần trăm sau mỗi lần thắng không rơi và đạt trần 30% ở m = 10.
- Khi rơi, chọn đều một trong bốn potion thường: mỗi loại có xác suất 25% có điều kiện trên việc đã rơi; cấp một chai và đưa m về 0.
- Speed Battle Potion không nằm trong danh sách này. Vật phẩm mới đăng ký cũng không tự được thêm vào.
- D và m là đầu vào của xác suất rơi; hệ số VNĐ/EXP hoặc bonus thưởng passive không trực tiếp nhân xác suất rơi potion.

3.8. Công thức nâng cấp
=======================

M_EXP = (1 + 0,12 × u_EXP + 0,03 × u_EXP^1,15) × P_EXP
M_VNĐ = (1 + 0,15 × u_VNĐ + 0,02 × u_VNĐ^1,20) × P_Rich

P_EXP và P_Rich bằng 1,25 khi potion tương ứng có hiệu lực, ngoài ra bằng 1.

- Nâng cấp: Roll Speed; Giá mua cấp kế tiếp tại cấp hiện tại u: floor(100 × 1,65^u); Cấp tối đa: 20
- Nâng cấp: Luck; Giá mua cấp kế tiếp tại cấp hiện tại u: floor(250 × 1,65^u); Cấp tối đa: 500
- Nâng cấp: Hệ số EXP; Giá mua cấp kế tiếp tại cấp hiện tại u: min(Number.MAX_SAFE_INTEGER; floor(2.500 × 1,40^u)); Cấp tối đa: 100
- Nâng cấp: Hệ số VNĐ; Giá mua cấp kế tiếp tại cấp hiện tại u: min(Number.MAX_SAFE_INTEGER; floor(4.000 × 1,45^u)); Cấp tối đa: 100

Các giá trên là VNĐ, không phải Tower Coins.

3.9. Combat, VNĐ theo damage và EXP riêng từng thẻ
=================================================

Nhịp combat giữ 3.000 ms; Speed Battle Potion còn hiệu lực dùng 1.000 ms. Auto Continue giữ độ trễ kết quả 1.500 ms. 1v1 thường vẫn dùng tỷ lệ đối thủ mục tiêu 0,92–1,22; 4v4 thường 0,85–1,30, level thích ứng và mutation thời tiết 70%. Tower dùng chỉ số tầng ở mục 3.5.

A. VNĐ Arena thường, giữ công thức cũ
Gọi t là giây trận, V là tổng giá trị salvage của đối thủ không phải clone; Lp/Le là level trung bình ban đầu:
M_Thời_gian = 1 + min(0,02 × t; 0,50).
M_Chênh_level = clamp(Le / Lp; 0,50; 1,50).
VNĐ_nền_Arena = floor(V × M_Thời_gian × M_Chênh_level).
VNĐ_trước_passive = floor(VNĐ_nền_Arena × M_VNĐ).

B. VNĐ Tower, công thức mới
D_p = tổng HP thực mất do damage từ đội người chơi trong trận.
D_e = tổng HP thực mất do damage từ đội đối thủ trong trận.
D_total = D_p + D_e.
DAMAGE_PER_VND = 10.
VNĐ_nền_Tower = min(Number.MAX_SAFE_INTEGER; floor(D_total / 10)).
VNĐ_trước_passive = floor(VNĐ_nền_Tower × M_VNĐ).
VNĐ_sau_passive = floor(VNĐ_trước_passive × M_Thưởng_passive) + Bounty.
VNĐ_thực_cấp_Tower = min(VNĐ_sau_passive; max(0; Number.MAX_SAFE_INTEGER - Số_dư_VNĐ)).

M_Thưởng_passive = 2 nếu đội có passive Nami, nhân tiếp 2 nếu có Hakari Jackpot; không nhân lặp do nhiều bản sao cùng passive. Bounty là passiveCashBonus hiện hành. Cách áp dụng bonus thưởng VNĐ được giữ nguyên. Tower không dùng giá salvage đối thủ, thời gian hoặc chênh lệch level làm nền VNĐ nữa.

Ví dụ: D_p = 1.750, D_e = 250, tổng 2.000 HP => 200 VNĐ nền. Không bonus nhận 200 VNĐ. Rich Potion 1,25x nhận 250 VNĐ trước passive. Nami nhân 2 thành 500 VNĐ; Bounty có thì cộng sau. Các số hiển thị cuối trận là lượng được cấp sau giới hạn số học.

Quy tắc bộ đếm damage:
- Đòn đánh thường, chí mạng, chuỗi đòn, support, damage phản lại và damage passive qua damageUnit ghi HP trước - HP sau, ngay sau khi trừ HP và trước hồi máu tiếp theo.
- Burn/Bleed ghi HP giảm thực tế và gán cho nguồn hiệu ứng, kể cả nguồn đã bị hạ hoặc là clone. Nếu hiệu ứng không có nguồn xác định, quy cho đội đối diện đơn vị chịu damage.
- Đòn kết liễu trực tiếp của Vasto Lord ghi phần HP còn lại vào đội tấn công. Đòn thường trước đó đã ghi riêng; hai khoản cộng đúng tổng HP mất, không tính lại toàn bộ HP.
- Passive sống sót trước đòn chí mạng ghi phần HP giảm nếu có, không ghi damage thô của đòn bị ngăn. Hồi sinh làm tăng HP không được tính là damage.
- Damage bị dodge, miễn nhiễm hoặc khiên hấp thụ không làm mất HP nên không tính VNĐ. Overkill chỉ tính đến HP còn lại, không tính phần sát thương thừa.
- Hồi máu, tăng/giảm HP tối đa, buff hết hạn, tự hy sinh Griffith và tự hủy The Flash không được cộng như damage đối thủ gây ra. Hồi máu không trừ số damage đã ghi; damage gây ra ở lần đánh sau hồi máu tiếp tục được tính.
- Bộ đếm tạo mới ở beginBattle, nằm trong đối tượng trận, không lưu thành store mới và không phục hồi giữa trận khi reload. Auto Continue sang trận mới luôn bắt đầu bộ đếm bằng 0.
- Mỗi đội và tổng damage được chặn ở G = Number.MAX_VALUE / 1024 để tránh tràn số. Thua hoặc đầu hàng vẫn không nhận VNĐ, xu hay EXP chiến đấu.

C. EXP Arena thường
EXP_cần_i = max(1; floor(100 × R_i × Level_hiện_tại_i)).
Tỷ_lệ_4v4 = 0,04 + 0,06 × U.
Tỷ_lệ_1v1 = 0,01 + 0,04 × U.
U là một lần lấy ngẫu nhiên cho trận thắng trong [0;1); tỷ lệ liên tục trong khoảng nền 4%–10% hoặc 1%–5%, không phải một phần trăm nguyên cố định.
EXP_nền_i = floor(EXP_cần_i × Tỷ_lệ).
EXP_trước_passive_i = floor(EXP_nền_i × M_EXP).
EXP_thực_cấp_i = floor(EXP_trước_passive_i × M_Thưởng_passive).
EXP_trận_chung = tổng EXP_thực_cấp_i của các ID thẻ gốc hợp lệ.

Chỉ tính các ID khác nhau trong setup.team trước trận, còn sở hữu và chưa đạt level 999. Bốn vị trí cùng một ID chỉ nhận một khoản cho level dùng chung; mutation khác cùng ID cũng không cấp trùng. Clone hoặc thẻ đối thủ được Doflamingo thu phục không mở thêm nguồn EXP. EXP_cần_i lấy ở thời điểm tính thưởng trước khi cấp, không dùng phần EXP còn thiếu đến level mà dùng toàn bộ yêu cầu level hiện tại. Không còn chia EXP chung cho số lượng thẻ.

Ví dụ chưa có bonus:
- Thẻ Common Lv.10 cần 1.000 EXP: 4v4 nhận khoảng 40–100 EXP; 1v1 nhận khoảng 10–50 EXP.
- Thẻ Secret Lv.10 cần 8.000 EXP: 4v4 nhận khoảng 320–800 EXP; 1v1 nhận khoảng 80–400 EXP.
- Thẻ Common cần 1.000 EXP, tỷ lệ 4v4 7% => 70 EXP nền; EXP Potion 1,25x => floor(87,5) = 87; Nami => 174 EXP. Mức nền vẫn 7%, lượng thực nhận cao hơn vì bonus giữ nguyên.

Nâng cấp EXP, EXP Potion và passive có thể làm lượng thực nhận vượt khoảng nền. Giao diện ghi tỷ lệ nền cùng số EXP thực cấp trong log; ô Battle EXP là tổng EXP của các ID, không phải số nhận của mỗi thẻ. Nếu khoản thưởng vượt yêu cầu, grantCardExperience tiếp tục lên level và giữ EXP dư như trước. Thẻ level 999 không cấp EXP thẻ mới.

D. Tower không EXP
EXP_nền_Tower = EXP_thẻ_Tower = EXP_trận_chung_Tower = 0.
Danh_sách_EXP_Tower = mảng rỗng.
Không gọi grantCardExperience từ thưởng thắng Tower; EXP Potion/nâng cấp/passive không thay đổi quy tắc này. Mốc Champion tầng 100 vẫn cấp thẻ Normal; không phải khoản EXP. EXP do roll vẫn độc lập, không bị xóa hoặc chặn.

E. Potion và chỉ số rơi thưởng, giữ cơ chế cũ
Bonus_thời_gian_%_cho_drop = round((1 + min(0,02 × t; 0,50) - 1) × 100).
Tăng_D_nền = làm_tròn_2_chữ_số(min(5; 0,50 + 0,02 × Bonus_thời_gian_%_cho_drop)).
D sau thắng cộng mức nền trên và tối đa 20. Bonus thời gian đạt 50% ở 25 giây; Tăng_D_nền hiện trong 0,50–1,50 điểm phần trăm. Tính drop này vẫn dùng thời gian trận kể cả Tower, dù VNĐ Tower không dùng thời gian. Không đưa Speed Battle Potion vào danh sách drop; item này vẫn chỉ mua Tower Shop với 100 xu.

3.10. Thưởng thành tựu
======================

Gọi N là ngưỡng thành tựu:

- Nhóm mốc thường: Collection; VNĐ cấp khi nhận: 100 × N
- Nhóm mốc thường: Số trận thắng; VNĐ cấp khi nhận: 500 × N
- Nhóm mốc thường: VNĐ; VNĐ cấp khi nhận: max(100; floor(0,05 × N))
- Nhóm mốc thường: Tổng lượt roll; VNĐ cấp khi nhận: N
- Nhóm mốc thường: Tầng Tower sâu nhất; VNĐ cấp khi nhận: 100 × N

Ví dụ: collection 25 thưởng 2.500 VNĐ; trận thắng đầu tiên thưởng 500 VNĐ; mốc VNĐ 1K thưởng 100 VNĐ; mốc VNĐ 100T thưởng 5T VNĐ.

Khoản thưởng thành tựu được cộng trực tiếp theo bảng, không nhân hệ số nâng cấp VNĐ hoặc Rich Potion. Thẻ Champion tự động là phần thưởng riêng của từng Tower, không thay thế mốc thưởng VNĐ “Tower tầng 100” nhận thủ công.

3.11. Công thức bảo vệ save và cooldown
=======================================

K = UTF8(SECRET_SALT)
D = UTF8(chuỗi_JSON_gói_game)
checksum = hex_chữ_thường(HMAC_SHA256(K, D))
payload = JSON_canonical({format, version, data, checksum})
nội_dung_acrsave = Base64(UTF8(payload))

Checksum dài 64 ký tự hex, tương ứng 256 bit. Định dạng ngoài có format = "anime-card-rng-protected-save", version = 1; định dạng JSON game bên trong vẫn là anime-card-rng-save, phiên bản gói 1. Đây là HMAC với khóa, không phải phép cộng ký tự hay checksum không có khóa.

Gọi T là timestamp hành động, t là Date.now():

Cooldown = 7 × 24 × 60 × 60 × 1.000 = 604.800.000 ms
Còn_lại = max(0; T + Cooldown - t), nếu T > 0
Còn_lại = 0, nếu chưa có timestamp hoặc T = 0
Số_ngày_còn = Còn_lại / 86.400.000

Số ngày trên alert dùng tối đa tám chữ số thập phân; phần ngày/giờ/phút/giây làm tròn lên đến giây để không hiển thị đã sẵn sàng khi còn một phần giây. Đúng tại t = T + Cooldown, thao tác được phép. Timestamp sai định dạng bị chặn, không tự đặt về 0. Timestamp tương lai làm thời gian chờ kéo dài đến đủ bảy ngày sau timestamp đó.

T_export_sau_nhập = max(T_export_hiện_tại; T_export_trong_file)
T_import_sau_nhập = max(T_import_hiện_tại; T_import_trong_file; t_nhập)

File xuất mang timestamp của lần xuất đó trong phần dữ liệu được xác thực. Vì vậy, chuyển sang thiết bị khác không chủ động xóa lịch sử xuất có trong file. Lịch sử trong một bản backup cũ không thể ghi nhận các thao tác diễn ra sau thời điểm tạo backup; không có máy chủ thì không thể ngăn tuyệt đối việc dùng lại backup trên trình duyệt mới.

3.12. Thông số tự tiếp tục và điều kiện hàng đợi
================================================

AUTO_CONTINUE_DELAY_MS = 1.500 ms = 1,5 giây.
BATTLE_TURN_MS = 3.000 ms = 3 giây; potion chiến đấu còn hiệu lực dùng 1.000 ms.

Công tắc tự tiếp tục không thay đổi nhịp lượt đánh, giá potion hoặc thời lượng potion. Độ trễ chiến thắng là timer riêng; trình duyệt có thể thực thi trễ hơn khi tab bị giảm ưu tiên hoặc máy bận.

Còn_sống(u) = có đơn vị u VÀ NOT u.defeated VÀ Number(u.hp) > 0.
Hết_đội_Tower(team) = không tồn tại u trong toàn bộ team thỏa Còn_sống(u).
Thắng_Tower = Hết_đội_Tower(enemyTeam).
Thua_Tower = enemyTeam còn sống VÀ Hết_đội_Tower(playerTeam).

Nếu cả hai đội đồng thời hết đơn vị, giữ thứ tự đánh giá hiện hành: kiểm tra đội đối thủ trước, rồi đội người chơi. Không áp dụng ưu tiên riêng cho vị trí trùm. Không giới hạn hàng đợi ở bốn, năm hay bảy vị trí; mảng đội là nguồn dữ liệu cho mọi vị trí được tạo trong trận.

Điều_kiện_tự_tiếp_tục = ON VÀ kết quả victory VÀ đội hợp lệ VÀ đúng trận đã thắng VÀ Arena còn mở VÀ không đang chuyển save.

4. Cấu Trúc Module & File
=========================

4.1. Cây file sản xuất
======================

Tất cả file sau nằm cùng cấp trong thư mục game:

Thư mục game/
    index.html
    styles.css
    passives.css
    app.js
    inventory.js
    tower.js
    achievements.js
    cards.js
    passives.js
    weathers.js
    README.txt

- File: index.html; Trách nhiệm: Bố cục, thanh điều hướng, các modal và thứ tự nạp script.
- File: styles.css; Trách nhiệm: Giao diện chung, thẻ, mutation, battle, responsive, kho vật phẩm, thành tựu và chuyển save.
- File: passives.css; Trách nhiệm: Trình bày trạng thái, badge và thông tin passive.
- File: app.js; Trách nhiệm: Điều phối EXP Arena theo từng ID, trả VNĐ Tower từ bộ đếm damage, Auto Continue, timer kết quả, menu điều hướng, lựa chọn lưu bền, RNG, đồng hồ/thời tiết, kho thẻ, level/EXP, UI, chiến đấu, cấp thưởng, gói save/HMAC/Base64, kiểm tra cooldown, khóa chuyển save và import có khôi phục khi lỗi.
- File: inventory.js; Trách nhiệm: Định nghĩa và lưu vật phẩm, chuyển đổi save cũ, stack, tiêu thụ potion, buff/timer, drop potion và giao diện kho.
- File: tower.js; Trách nhiệm: Đường cong HP chung, giới hạn ATK/HP, bảo vệ chỉ số đối thủ, công thức xu Elite nhẹ, quy đổi damage sang VNĐ; Tiến độ từng Tower, lọc thời tiết, tạo đối thủ, chỉ số theo tầng, Tower Coins, danh mục cửa hàng và thông tin yêu cầu thưởng.
- File: achievements.js; Trách nhiệm: Định nghĩa mốc, theo dõi tiến độ, lưu cờ nhận/mở khóa, xử lý nhận thưởng và giao diện thành tựu.
- File: cards.js; Trách nhiệm: Cơ sở dữ liệu 111 thẻ, thông số/tỷ lệ/ảnh, điều kiện thời tiết và cấu hình 11 thẻ thưởng Tower.
- File: passives.js; Trách nhiệm: Áp dụng trần Tower trước/sau passive và cho clone, giữ bookkeeping buff tạm; quan sát damage HP thực mất từng đội; kiểm tra toàn bộ reserve Tower, giữ tuyến đầu khi chèn clone; Xử lý passive trong trận, trạng thái, hồi máu, hồi sinh, hook chiến đấu và điều chỉnh thưởng theo passive.
- File: weathers.js; Trách nhiệm: Cấu hình nhịp thời tiết, nhóm xác suất, mutation, hệ số và alias.
- File: README.txt; Trách nhiệm: Nhật ký cập nhật, thông số, công thức và tài liệu cấu trúc bằng tiếng Việt.

Thứ tự nạp script hiện hành:

1. weathers.js
2. cards.js
3. passives.js
4. inventory.js
5. tower.js
6. achievements.js
7. app.js

Game sử dụng JavaScript thuần và không yêu cầu bước build. Có thể mở index.html trong trình duyệt. Đường dẫn ảnh nguồn được giữ nguyên; nếu ảnh không có hoặc tải thất bại, game dùng cơ chế hình dự phòng. Các thẻ Champion dùng ảnh nguồn hiện có, không kèm bộ ảnh mới trong bản mở rộng.

4.2. Các store lưu dữ liệu
==========================

- Khóa localStorage: anime_card_rng_save_v1; Phiên bản dữ liệu hiện hành: schemaVersion: 7; Nội dung: Roll, VNĐ, EXP, collection, mutation, kho biến thể, level, trang bị, nâng cấp, thời tiết và biên nhận thưởng thành tựu.
- Khóa localStorage: anime_card_rng_items_v1; Phiên bản dữ liệu hiện hành: version: 2; Nội dung: Vật phẩm, số lượng, metadata, thời điểm hết hạn buff và số lần thắng chưa rơi potion.
- Khóa localStorage: anime_card_rng_tower_v1; Phiên bản dữ liệu hiện hành: version: 1; Nội dung: Tower Coins, tầng đã vượt từng loại và tổng lượt vượt tầng hợp lệ.
- Khóa localStorage: anime_card_rng_achievements_v1; Phiên bản dữ liệu hiện hành: version: 1; Nội dung: Thống kê thành tựu, tiến độ Tower, cờ nhận và yêu cầu mở khóa vĩnh viễn.
- Khóa localStorage: save_cooldown_export; Phiên bản dữ liệu hiện hành: Timestamp mili giây; Nội dung: Lịch sử xuất; được kèm trong save bảo vệ khi có.
- Khóa localStorage: save_cooldown_import; Phiên bản dữ liệu hiện hành: Timestamp mili giây; Nội dung: Lịch sử nhập; được bảo toàn/hợp nhất khi chuyển save.
- Khóa localStorage: anime_card_rng_auto_continue_battle; Phiên bản dữ liệu hiện hành: Boolean JSON true/false; Nội dung: Lựa chọn Auto Continue; mặc định OFF, tùy chọn trong save bảo vệ.

Khóa tương thích cũ: animeCardRngSave_v1. Đuôi _v1 trong tên khóa không có nghĩa phiên bản cấu trúc bên trong vẫn là 1.

Dữ liệu localStorage phụ thuộc trình duyệt và origin; hành vi với đường dẫn file:// cũng phụ thuộc trình duyệt. Dùng xuất/nhập .acrsave để chuyển máy hoặc chuyển origin thay vì kỳ vọng save tự đi theo file HTML.

4.3. Chính sách bảo trì và đầu ra sạch
======================================

- Sau mỗi lần thêm tính năng, sửa cân bằng hoặc sửa lỗi, cập nhật README.txt tiếng Việt với hành vi thực tế, thông số, công thức và module liên quan.
- Phân biệt rõ thay đổi mới, cơ chế kế thừa và việc chỉ sửa tài liệu; không mô tả một hằng số chưa được dùng như hành vi gameplay.
- Giữ logic vật phẩm trong inventory.js, Tower trong tower.js, thành tựu trong achievements.js; không dồn các hệ thống này vào app.js.
- Bản phát hành đầy đủ theo quy ước mới chỉ gồm 11 file sản xuất ở mục 4.1. Không kèm script kiểm thử, runner .cjs, báo cáo xác minh, log hoặc file tạm.
- Những kiểm tra phát hành đã thực hiện gồm cú pháp module, mốc 470.400, đường cong tuyến tính, tỷ lệ đối thủ qua tầng rất sâu và passive, xu Elite 100–110 ở tầng 110, damage hai đội/Burn/Bleed/finisher, 0 EXP Tower có bonus, EXP Arena và chống cấp trùng ID, hàng đợi Tower bảy vị trí, Metal Cooler/Doflamingo/Frieza, timer Auto Continue và các đường thoát, giao diện từ 320 đến 1.440 px, RNG/auto-roll, lọc Weather Tower, thưởng tầng 100, chống nhận trùng, xác thực file .acrsave, mốc cooldown 7 ngày, rollback lỗi ghi và chuyển save ở phiên trình duyệt riêng. Đây là các kịch bản kiểm tra đại diện, không phải bảo đảm đã thử mọi tổ hợp passive hoặc chơi thủ công mọi tầng.
- Bản cập nhật hiện tại gồm 10 file nguồn và README này, tổng cộng 11 file sản xuất. Không đưa script kiểm thử, log hoặc file trung gian vào ZIP; lớp bảo vệ save không thay đổi phân tách module gameplay.
