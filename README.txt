Anime Card RNG — Nhật ký cập nhật và thông số kỹ thuật
======================================================

Ngày đối chiếu mã nguồn: 13/10/2026.
Phạm vi bản tinh chỉnh: sửa đội đối thủ Normal Time Trial bằng bộ sinh thẻ thật của Tower; tạo đội mới mỗi Room và khi bắt đầu lại Room 1; gộp hai chế độ vào một nút Time Trial mở màn hình chọn loại trong Arena. Giữ nguyên công thức Room, lượt 2 giây, vé EXP, khóa đối thủ Tower, cân bằng HP/ATK, VNĐ Tower theo damage, Auto Continue, 11 Champion, nút passive + và save .acrsave/cooldown 7 ngày.

Tài liệu này mô tả bản bổ sung Time Trial, vé, shop Shards, thành tựu Luck vĩnh viễn và sửa bố cục passive/đường dẫn artwork. Các nội dung 11 Champion được giữ lại đầy đủ. Champion mới thay định nghĩa thẻ thưởng cũ nhưng giữ ID và biên nhận thành tựu, nên không xóa tiến độ và không cấp trùng. Hệ thống Tower, kinh tế, EXP Arena và bảo vệ chuyển save được kế thừa. Gói phát hành chỉ gồm 11 file nguồn và README.txt, không kèm runner kiểm thử, log hay file tạm.

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

- Đợt cập nhật: Tinh chỉnh logic ngày 13/10/2026; Nội dung chính: Lưu đội hình gốc tầng chưa vượt theo từng Tower, retry không đổi thẻ/mutation, nút Reset Opponents ở bản cũ (đã bỏ trong bản hiện tại), save tương thích ngược và Weather Report tạo khiên từ HP tối đa đang hoạt động.

- Đợt cập nhật: Tích hợp Champion ngày 13/10/2026; Nội dung chính: Bỏ nút và API reset đối thủ; nút + mở passive nhiều dòng; đủ 11 Champion với kỹ năng riêng, chỉ roll sau mở khóa và đúng thời tiết; lựa chọn buff Aqua trước trận.

- Đợt cập nhật: Time Trial ngày 13/10/2026; Nội dung chính: timetrial.js riêng, Normal 4v4 180 giây, EXP 1v1 300 giây, lượt cố định 2 giây, Shards/shop/vé, 10 mốc Luck +0,1; nút passive absolute 8 px và ảnh Champion riêng.

- Đợt tinh chỉnh Time Trial ngày 13/10/2026; Nội dung chính: thay thẻ giả cố định bằng đối thủ ngẫu nhiên từ bộ sinh Tower, tránh trùng thẻ trong cùng Room khi pool đủ; đội mới sau thắng hoặc khi bắt đầu lại Room 1; một cửa vào Time Trial trong Arena, modal chọn Normal/EXP và thông tin vé trước trận.

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

- Hiện có 111 thẻ và 64 mục thành tựu: 43 mốc thường cũ, 11 mốc Champion và 10 mốc Time Trial. Mốc collection 125 chưa được hiển thị vì cơ sở dữ liệu hiện chưa có đủ 125 thẻ.
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
- Bản hiện tại giữ 11 ID tower-champion-* và unlockRequirement cũ, thay tên/chỉ số/tỷ lệ và bổ sung passive riêng theo mục 3.6. Ảnh Champion được đổi sang 11 đường dẫn PNG riêng tại mục 3.15. Không thay chỉ số, tỷ lệ, ID hoặc thời tiết của Champion trong đợt Time Trial; gói nguồn không có sẵn các PNG chưa được cung cấp.
- Khi chưa mở khóa, thẻ bị loại khỏi pool roll. Sau mở khóa, chỉ vào pool khi thời tiết tương ứng hoạt động. Equinox yêu cầu Normal: không có thời tiết đặc biệt nào hoạt động. Naruto x Sasuke nhận Tsukuyomi/Mangekyo; Mangekyo được quy về Tsukuyomi theo alias hiện hành.
- Nếu nhiều thời tiết đồng thời hoạt động, Champion nào khớp một thời tiết được đưa vào pool. Đã sở hữu hoặc đã mở khóa không bỏ qua điều kiện thời tiết của lần roll hiện tại.
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
2. Đồng bộ đồng hồ/thành tựu, ghi đủ năm store game, kể cả game mới chưa từng vào Tower.
3. Tạo JSON gồm collection, biến thể, level/EXP, VNĐ, nâng cấp, trang bị, thời tiết, vật phẩm, buff, Tower (kể cả đội hình tầng đang khóa) và thành tựu. Khóa tương thích cũ được kèm theo nếu tồn tại; không thu thập dữ liệu ngoài game.
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

Phát hiện dữ liệu đã bị chỉnh sửa trái phép!

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

1.10. Giữ đội hình Tower để retry có chiến thuật
==============================================

- Lần đầu bắt đầu tầng kế tiếp, Tower tạo đội hình bốn vị trí theo thuật toán hiện hành rồi lưu bản thiết kế gồm floor, cardId và mutationIds theo đúng thứ tự ba lính + một trùm.
- Bản thiết kế lưu trong trường encounters của anime_card_rng_tower_v1, khóa con theo loại Tower. Không lưu đối tượng đơn vị đang đánh hoặc trạng thái passive vào bản thiết kế.
- Thua rồi Battle Again, thua rồi đổi đội, đầu hàng, về lobby, đóng/mở Arena hoặc reload vẫn giữ bản thiết kế của tầng chưa vượt. Đổi sang Tower khác và quay lại cũng giữ đội đã tạo riêng của từng Tower.
- Mỗi lần bắt đầu lại tạo đối tượng mới từ bản thiết kế, tính lại chỉ số nền bằng công thức tầng hiện hành, đầy HP trước passive vào trận, không mang defeated, Burn/Bleed, shield, bộ đếm hồi sinh, clone hoặc damageTotals từ trận trước.
- Thẻ, mutation, thứ tự lính/trùm của đội hình gốc không bị RNG lại khi retry. Passive vào trận, crit, dodge, hiệu ứng làm đổi thứ tự hoặc sinh clone vẫn xử lý bình thường; trận retry không bị buộc lặp toàn bộ kết quả ngẫu nhiên của trận thua.
- Thắng hợp lệ xóa bản thiết kế của Tower vừa vượt. Tầng tiếp theo tạo đội hình mới khi bắt đầu, kể cả khi Auto Continue bắt đầu tự động. Gọi lại kết quả tầng đã vượt không xóa hay cấp thưởng cho tầng mới.
- Nút Reset Opponent/Reset Opponents đã bị xóa khỏi HTML, CSS và event listener. tower.js không còn công khai resetEncounter. Không có thao tác đổi riêng đội đối thủ của tầng đang mắc kẹt.
- Tắt/đổi Auto Continue và các luật dọn timer vẫn giữ như trước; retry, đổi đội người chơi, đổi Tower hoặc mở/đóng Arena đều không reroll bản thiết kế còn hợp lệ.
- Reset toàn bộ game vẫn xóa cả bản thiết kế. Save trước bản này chưa có encounters vẫn đọc được; đội hình được khóa từ lần bắt đầu tầng đầu tiên trong bản mới.
- Dữ liệu đang khóa đi theo export/import .acrsave. Import kiểm tra floor phải là tầng chưa vượt tiếp theo, đúng bốn vị trí, ID thẻ đối thủ hợp lệ và mutation có trong định nghĩa; dữ liệu sai bị từ chối trước khi ghi localStorage.
- Khi dữ liệu cục bộ hỏng hoặc cơ sở dữ liệu tương lai không còn ID đã lưu, bản ghi không hợp lệ không được dùng. Chỉ lưu được lâu dài khi localStorage ghi thành công; lỗi bộ nhớ giữ cơ chế cảnh báo hiện hành.

1.11. Weather Report đọc chỉ số trận hiện tại
============================================

- BUBBLE CONTROL trước đây ưu tiên card.stats.hp (50.000 HP gốc của Weather Report), khiến khiên không theo level, mutation, buff và chỉ số Tower.
- Công thức mới lấy unit.maxHp tại thời điểm tạo khiên. Trường này đã chứa hệ số level, mutation và các thay đổi HP đang hoạt động trong trận.
- Cứ mỗi ba lượt combat, tạo khiên bằng 30% HP tối đa hiện tại, làm tròn xuống và tối thiểu 1. Nếu Max HP đổi sau lần tạo trước, lần kích hoạt kế tiếp dùng giá trị mới.
- Không lấy HP còn lại đang bị thương làm nền. Ví dụ Max HP 200.000 nhưng chỉ còn 25.000 HP vẫn tạo khiên 60.000, không phải 7.500 hoặc 15.000 từ chỉ số thẻ gốc.
- Nếu buff đưa Max HP lên 300.000, lần tạo kế tiếp là 90.000. Đối thủ Tower có Max HP theo tầng cũng dùng giá trị theo tầng thay vì HP gốc 50.000 trong cards.js.
- Khiên đã tạo là một lượng HP cố định tại lần kích hoạt, không tự hồi hoặc đổi kích thước mỗi lần bị đánh. Chỉ lần kích hoạt sau tính lại theo chỉ số mới; giữ cơ chế hấp thụ khiên hiện hành.
- Giữ nguyên lịch ba lượt, thời hạn một chu kỳ lượt theo engine, hiệu ứng Snail hai lượt khi đối thủ phá khiên, kiểm tra miễn nhiễm và không mở rộng passive sang đồng đội.
- cards.js cập nhật riêng mô tả Weather Report từ base HP sang current Max HP. ID, tên, chỉ số gốc, rarity, xác suất roll, hình ảnh và các thẻ khác giữ nguyên.

1.12. Đọc đầy đủ passive và chọn buff Aqua
==========================================

- Thẻ kết quả roll, Collection, preview, phần xem trước đội hình và hai thẻ Arena có nút + để mở mô tả đầy đủ trong modal riêng.
- Văn bản dùng textContent, giữ xuống dòng thật, nhận chuỗi có \n hoặc <br>, và nhận mảng passive/passives với nhiều phần tên + mô tả. Không chạy HTML từ nội dung passive.
- Arena hiển thị kỹ năng lấy được của Dark Aurora và Ice King Crown như các phần passive riêng trong nội dung đầy đủ.
- Modal có vùng cuộn, ngắt từ dài và kích thước theo viewport. Escape hoặc nút × chỉ đóng modal passive; khi đọc trong trận, Escape không kết thúc trận hoặc reset đội.
- Có Aqua trong đội: phần chuẩn bị hiện lựa chọn +50% HP cả đội hoặc +50% thưởng. Mặc định HP. Lựa chọn được lấy lúc Start và giữ qua Battle Again/Auto Continue trong phiên giao diện hiện tại; không thêm khóa save cho lựa chọn này.
- Passive chiến đấu được dispatch theo ID, không so khớp tên gần giống. Thukuna không kích hoạt các slash của Malevolent King cũ; Dark Decade có hook chuyển hóa riêng, không dùng nhầm Kamen Rider Decade cũ.

1.13. Time Trial trong Arena
=============================

- Arena có bốn lựa chọn chính: 4v4, 1v1, Tower và một nút Time Trial. Bấm Time Trial mở modal chọn Normal 4v4 hoặc EXP 1v1; không còn hai nút Time Trial riêng trong hàng mode Arena.
- Modal nêu thời gian, phần thưởng và phí vé từng loại; hiển thị số EXP Time Trial Ticket trong Storage. Chọn loại mới đưa về bước chọn đội tương ứng 4 hoặc 1 thẻ. Mở/đóng modal hoặc chọn lại cùng loại giữ đội đang chuẩn bị; không tiêu vé trước khi Start thành công. Escape chỉ đóng màn hình chọn loại, giữ Arena đang mở.
- Normal Time Trial: chọn 4 thẻ/biến thể, mỗi Room có 3 lính + 1 trùm, tối đa 180 giây. Chỉ nhận Shards từ các đối thủ gốc đã bị hạ; không nhận VNĐ, EXP hoặc potion rơi.
- Các đối thủ gốc là thẻ thật, có tên, ảnh và passive theo cards.js. timetrial.js dùng trực tiếp TowerSystem.buildOpponents, sau đó áp dụng HP/ATK riêng của Room; không đọc hoặc ghi bản thiết kế đối thủ bị khóa của Tower.
- Mỗi lần bắt đầu Room mới sinh đội ngẫu nhiên mới. Sau thua/hết giờ, tiến độ về Room 1 và lần Start tiếp theo sinh đội Room 1 mới, không dùng lại đội của lượt thất bại. Không thêm nút reroll giữa trận; các thẻ vẫn có thể xuất hiện lại ngẫu nhiên ở Room khác.
- Thắng Room mở Room tiếp theo. Tự tiếp tục dùng toggle Auto Continue đang có; OFF thì bấm Continue. Giữa hai Room đã thắng có thể thoát/reload và giữ Room kế tiếp.
- Thua, hết giờ, đầu hàng, đổi mode khi đang đánh hoặc reload/chuyển save trong trận chưa hoàn tất đưa Normal về Room 1. Shards đã nhận và mốc cao nhất đã vượt được giữ lại.
- EXP Time Trial: chọn 1 thẻ/biến thể, tiêu 1 EXP Time Trial Ticket để vào 300 giây. Quái mới xuất hiện sau khi quái cũ chết; quái có HP 10% Max HP runtime của thẻ đã chọn, ATK luôn 0.
- Mỗi kill cấp thẻ đã chọn 0,1%–1,0% EXP cần cho cấp hiện tại, không có VNĐ/Shards/vật phẩm. EXP đã cấp và phần EXP lẻ giữ qua thoát/reload; không hoàn vé của trận đã bắt đầu.
- Hết 300 giây, EXP Trial hiện kết quả hoàn tất với số quái, tổng % EXP và EXP nguyên/level-up. Auto Continue ON sẽ tiêu thêm 1 vé cho lần kế tiếp; không đủ vé thì dừng. OFF thì bắt đầu lần tiếp theo bằng nút và một vé mới.
- Mỗi lượt người chơi hoặc quái đều 2 giây. Quái 0 ATK không tạo đòn đánh gây sát thương; lượt quái vẫn xử lý Burn/Freeze và hiệu ứng theo lượt. Các passive người chơi có thể tác động ở lượt quái như cơ chế hiện hành.
- Speed Battle Potion không tăng tốc, không khởi động lại lượt chờ khi dùng trong Time Trial và không kéo dài hạn giờ. Potion vẫn được tiêu/lưu timer như bình thường để dùng ngoài Time Trial.

1.14. Shop Shards, thành tựu Luck và dữ liệu mới
=================================================

- Time Trial Shop mở từ phần chuẩn bị Arena hoặc màn hình kết quả, có số dư Shards và sáu loại đổi.
- 50 Shards: EXP Potion, Speed Potion, Lucky Potion, Rich Potion hoặc 1 EXP Time Trial Ticket. 200 Shards: 1 Speed Battle Potion.
- Vé là vật phẩm type ticket, ID exp_time_trial_ticket, stack trong Storage; dùng qua Arena, không có nút uống potion.
- Các Room 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 đã vượt mở mốc nhận +0,1 Luck vĩnh viễn mỗi mốc. Nhận trong Achievements, một lần duy nhất; tổng cộng tối đa +1,0 Luck.
- Luck dựa trên cờ đã nhận và biên nhận trong save chính, không tăng lại sau reload, retry hoặc khi gọi claim lặp. Mốc cao nhất không giảm khi Normal Trial reset về Room 1.
- Store riêng anime_card_rng_timetrial_v1 được gói vào .acrsave. Import save cũ thiếu store này vẫn được nhận sau xác thực HMAC; bắt đầu Time Trial với Room 1/0 Shards, không sửa tiến độ cũ.
- Mọi store Time Trial trong file mới được kiểm tra kiểu dữ liệu, Room, số Shards, phần EXP lẻ và metadata hạn giờ trước khi ghi localStorage. Giữ nguyên Base64/HMAC-SHA-256, khóa bí mật, định dạng .acrsave và cooldown xuất/nhập 604.800.000 ms độc lập.

2. Cân Bằng & Sửa Lỗi
=====================

2.1. Các lỗi đã sửa trong những đợt mở rộng gần nhất
====================================================

- Hạng mục: Time Trial thiếu/ngừng random đối thủ; Hành vi sau sửa: Bỏ Minion/Boss giả có image rỗng và passive null; dùng bộ sinh Tower với pool, vai trò và fallback giống Tower Normal; giữ 3 lính + 1 trùm, ảnh/passive thật và chỉ số Room riêng.
- Hạng mục: Hai nút Time Trial làm hàng mode dài; Hành vi sau sửa: Một nút mở modal Normal/EXP, lựa chọn có thông tin thời gian/thưởng/vé; nhãn nút chính phản ánh loại đã chọn, modal xếp một cột trên màn hình nhỏ.
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
- Đợt hiện tại thay cấu hình 11 thẻ thưởng cũ bằng 11 Champion được yêu cầu; chỉ số gốc/tỷ lệ/khóa thời tiết/passive chính xác nằm ở mục 3.6. Không dùng lại công thức HP 12.000 + 800 × i hoặc chance 500.000 + 50.000 × i của thẻ thưởng cũ.
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
- Các đợt cân bằng giữ chỉ số, ID và tỷ lệ roll của 111 thẻ; đợt logic hiện tại chỉ cập nhật mô tả Weather Report. Không sửa tỷ lệ mutation, giá potion, thời hạn buff, quy tắc Bleed/freeze, luật hàng đợi Tower hoặc Auto Continue. Đối thủ Tower chịu giới hạn tỷ lệ ATK mới, kể cả sau passive; Arena và thẻ người chơi giữ chỉ số riêng. Lớp HMAC/Base64, định dạng .acrsave và hai cooldown 7 ngày giữ nguyên.
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

2.7. Sửa ngẫu nhiên hóa khi retry và nguồn HP khiên
=================================================

- app.js trước đây gọi buildOpponents mỗi lần Start/Battle Again, nên defeat cũng lấy một đội ngẫu nhiên mới. Bản mới gọi getOpponents: lấy bản thiết kế cùng loại Tower/tầng nếu còn hợp lệ, chỉ tạo mới khi chưa có hoặc sang tầng mới.
- buildOpponents vẫn là hàm tạo đội hình ngẫu nhiên thuần, dùng cho khởi tạo và xem chỉ số. Không tái sử dụng đơn vị có HP/trạng thái cũ để giữ đội hình.
- Chống bản thiết kế bị thay đổi do combat: lưu ID/chuỗi mutation độc lập, trả đơn vị mới và bản sao mutation cho từng lần bắt đầu. Hồi sinh, tăng ATK, chỉnh HP, thêm clone trong trận không sửa bản thiết kế.
- Thêm trường encounters tùy chọn trong store Tower version 1; không thêm khóa localStorage và không đổi format .acrsave, HMAC hoặc cooldown. Bộ kiểm tra import xác thực trường mới, vẫn chấp nhận save cũ không có trường này.
- Đổi Weather Report sang Max HP runtime; không thay getBaseAtk dùng bởi các passive khác, không chỉnh tỷ lệ 30% hoặc thời gian trạng thái.
- Cân bằng khẩn cấp giữ nguyên: sức mạnh nền tầng 100 là 470.400; ATK nền 20% Max HP, trần đối thủ 25%; Elite tầng 110 100–110 xu. VNĐ theo tổng damage và 0 EXP Tower vẫn giữ.

2.8. Logic Champion và tương tác với cơ chế cũ
===============================================

- Toàn bộ 100 định nghĩa thẻ gốc giữ nguyên so với bản trước. Chỉ 11 định nghĩa thẻ thưởng Tower được thay theo yêu cầu.
- Đội đối thủ Tower vẫn bị loại các thẻ có unlockRequirement khỏi pool tạo ngẫu nhiên; không đưa Champion vào đội NPC để phá cân bằng tầng.
- Buff/hồi sinh/clone do đối thủ Tower tạo vẫn chịu bảo vệ ATK tối đa 25% Max HP. Đây là giới hạn đối thủ NPC, không sửa chỉ số Champion của người chơi: Aizen 60.000 ATK và Ice King 46.000 ATK giữ đúng cấu hình.
- Kỹ năng diện rộng xét mọi đối thủ đang sống, gồm vị trí bổ sung. Không dùng cái chết của trùm để bỏ qua các đơn vị còn lại.
- Bonus các dạng Buu chỉ tồn tại trong dạng tương ứng; khi rời dạng 2, gỡ lượng HP và bookkeeping buff của dạng đó. Không cộng dồn bonus dạng trước.
- Khiên chặn hết sát thương không tạo sát thương chuyển hướng giả cho Calamity. Chuyển hướng, phản đòn và đòn nối có dấu riêng để tránh vòng lặp phản đòn hoặc Solar Claw nối vô hạn.
- Sasuke xem trước sát thương chưa chí mạng của đòn né, gồm hệ số kỹ năng và runtime. Xem trước không tiêu hao buff một lần của đối thủ. Đòn né xảy ra trước phép thử chí mạng theo thứ tự combat hiện hành.
- Đòn kết liễu Vasto Lord kiểm tra quyền tự hồi sinh của Aizen/Ice King. Aizen không được clone, kể cả Jin Mori/Metal Cooler; Aizen và Ice King không được hồi sinh bởi Dante hoặc nguồn đồng đội. Equinox đã tự hủy không thể hồi sinh bằng nguồn nào.
- Burn, Freeze, Heresy và Crown tôn trọng miễn nhiễm passive của mục tiêu theo luật hiện hành. Bleed tiếp tục chặn hồi HP, kể cả hồi sinh có phục hồi HP; không nới anti-heal cho Champion.
- Các bản thiết kế, biên nhận, collection và buff potion vẫn lưu bằng store/định dạng cũ. Không đổi khóa HMAC, checksum, thời gian chờ 7 ngày hoặc danh sách potion drop.

2.9. Sửa bố cục passive và các ranh giới Time Trial
===================================================

- Nút + dùng position: absolute; bottom: 8px; right: 8px trong parent relative. Thêm khoảng trống và chiều cao tối thiểu phù hợp, nên nút không tham gia dòng văn bản hoặc bị đẩy xuống dưới container.
- Áp dụng ở thẻ roll, preview, Collection, preview chọn đội và thẻ Arena. Giữ modal đầy đủ, xuống dòng, nhiều passive và Escape chỉ đóng phần đọc passive.
- Cập nhật đúng 11 đường dẫn ảnh, giữ nguyên mọi HP/ATK/chance/passive/weather lock của Champion và giữ nguyên 100 định nghĩa thẻ cũ.
- Hiệu ứng vào trận của người chơi được xử lý sau khi bắt đầu lượt thử/tiêu vé; kill do bẫy Trapper không bị bỏ qua. HP quái được cân lại theo buff HP khi vào trận của Aqua/Wish, giữ sát thương đã nhận.
- EXP Monster có getter ATK 0 và nhánh không gây đòn trong engine; helper chuẩn hóa không ép quái thành ATK 1. ATK 0 của quái cũng được dùng khi Aizen tính damage theo ATK mục tiêu.
- Giới hạn 2 giây được kiểm tra trước potion. Hạn giờ tuyệt đối được kiểm tra bằng cả timeout và global tick/trước lượt; không cấp kill mới sau hạn giờ hoặc bắt đầu lại timer khi mở modal/tiêu potion.
- Shards và EXP có cờ đã trả cho mỗi đối thủ, không nhận trùng khi resolve/end được gọi lại. Kết quả Normal chỉ thắng khi toàn bộ hàng đợi đối thủ còn sống đã hết.
- Normal không đi qua pipeline thưởng Arena/Tower; EXP Trial không nhận thưởng VNĐ, drop, Shards, bonus thưởng hoặc EXP potion/nâng cấp. Các tỷ lệ thưởng cố định được giữ đúng; buff combat của thẻ vẫn hoạt động.
- Tăng cấp trong EXP Trial cập nhật chỉ số runtime theo tỷ lệ level mới/cũ và điều chỉnh delta buff tạm/dạng Buu. Bleed vẫn chặn tăng HP do hồi phục; không sửa thời lượng trạng thái hoặc luật passive cũ.
- Tiêu vé và shop chỉ hoàn tất khi ghi được localStorage; grant/remove vật phẩm khôi phục số lượng trong RAM nếu ghi thất bại. Chặn double Start, lặp claim hoặc tự tiếp tục khi không còn vé.
- Reset game đầy đủ xóa cả Time Trial; đóng/đầu hàng một Time Trial không xóa Tower encounter hay collection. Timer cũ được dọn khi kết thúc, rời trận hoặc import thành công.

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

M_Luck = (1 + 0,25 × u_Luck + L_TimeTrial) × P_Lucky
L_TimeTrial = 0,1 × số mốc Time Trial đã nhận, tối đa 1,0 cho 10 mốc hiện có.
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

3.6. Thông số và passive đầy đủ của 11 Champion
================================================

Thông số sau là level 1, bản Normal, trước level/mutation/buff. Tất cả rarity nội bộ Secret. Mỗi thẻ cần vượt tầng 100 của Tower tương ứng; nhận ngay 1 bản Normal và mở khóa vĩnh viễn. Giữ ID/biên nhận cũ, không thưởng thêm cho người đã nhận Champion trước bản này.

Tỷ lệ 1/N là chance cấu hình, không bị đổi. Gacha vẫn thử tuần tự theo độ hiếm, có Luck và có thể miss như mục 3.2, nên đây không phải cam kết tần suất cuối độc lập. Nhận thẻ thành tựu không cần roll trúng. Các lần gacha sau cần cả mở khóa và đúng thời tiết; mutation/EXP roll giữ cơ chế cũ.

3.6.1. Majin Buu
-----------------
ID: tower-champion-sugar
Tower/khóa thời tiết: Sugar; yêu cầu tower_floor_100_sugar.
HP: 76.000; ATK: 7.600; tỷ lệ: 1/760.000.
Passive: Candy Eater.
- Mỗi đòn chính tăng ngẫu nhiên đều 1–3 kẹo; dạng 1 tăng thêm 1. Đòn nối/phản đòn không tăng thêm bộ đếm đòn chính.
- Dạng 1, 0–10 kẹo: sát thương đòn chính ×1,25.
- Dạng 2, 11–25 kẹo: Max HP +50%. Khi bị đánh, tiêu 1 kẹo và hồi floor(3% × Max HP đang hoạt động).
- Dạng 3, 26–50 kẹo: mỗi đòn gây sát thương HP thật triệu hồi Ghost. HP Ghost bằng HP thực mất do đòn đó; ATK = floor(10% × ATK hiện tại của Buu), tối thiểu 1. Không tạo Ghost HP giả từ khiên hoặc đòn né.
- Dạng 4, 51–75 kẹo: né 76%. Né được tăng 5 kẹo, hồi 7,6% Max HP và bỏ lượt tấn công kế tiếp bằng stun 1 lượt.
- Dạng 5, 76–99 kẹo: mỗi đòn chính thứ 3, đánh thêm 3 đối thủ ngẫu nhiên khác vị trí nhau, mỗi mục tiêu nhận 50% ATK hiện tại. Nếu ít hơn 3 đối thủ, đánh tất cả số còn sống; vẫn có đòn chính bình thường.
- Dạng cuối, 100 kẹo: đòn chính và sát thương thêm đánh toàn bộ đội địch, mỗi mục tiêu một lần trong lượt này. Không tiếp tục tăng kẹo ở dạng cuối.
- Quy ước bổ sung do yêu cầu chưa định lượng mức tiêu kẹo: tiêu 1 kẹo mỗi lượt tấn công dạng cuối. Giữ dạng cuối từ 100 xuống 0, không tụt về các dạng giữa trong giai đoạn tiêu kẹo.
- Ở 0: trở về dạng 1, tự stun 5 lượt của Buu, khóa tăng kẹo/đổi dạng trong thời gian hồi dạng. Hết 5 lượt mới tích kẹo lại.
- “Không cộng dồn qua ngưỡng” được thực hiện bằng bonus dạng loại trừ nhau; lượng kẹo là một bộ đếm liên tục để có thể đạt 100. HP dạng 2 được gỡ khi rời dạng; không giữ bonus dạng 1–5 trong dạng cuối.

3.6.2. Thukuna
---------------
ID: tower-champion-malevolent
Tower/khóa thời tiết: Malevolent; yêu cầu tower_floor_100_malevolent.
HP: 66.666; ATK: 9.999; tỷ lệ: 1/666.999.
Passive: Malevolent Kitchen.
- Sau 5 đòn chính, mỗi lượt combat của bất kỳ bên nào gây 25% ATK hiện tại lên mọi đối thủ đang sống, khi Thukuna còn sống.
- Mỗi lần bị đánh có xác suất 66% hồi 6% Max HP và tăng ATK thêm 9%, không giới hạn số lần.
- Tăng ATK theo chỉ số hiện tại: ATK_k = round(ATK_(k-1) × 1,09). Trên NPC Tower vẫn áp dụng trần ATK/HP.

3.6.3. Aizen Beyond
--------------------
ID: tower-champion-reaper
Tower/khóa thời tiết: Reaper; yêu cầu tower_floor_100_reaper.
HP: 100.000; ATK: 60.000; tỷ lệ: 1/6.000.000.
Passive: Illusion Shattering Flower.
- Mỗi 2 đòn chính gây thêm sát thương lên mọi đối thủ, bằng 60% ATK hiện tại của chính mục tiêu đó, gồm suy yếu ATK đang có.
- Khi nhận sát thương HP có xác suất 6% phản 50% lượng sát thương vừa nhận. Dấu phản đòn ngăn chuỗi phản đòn lặp.
- Sát thương chí tử thật sau khiên/giảm sát thương: tự hồi sinh một lần mỗi trận, đầy Max HP và ATK ×1,50. Đòn bị khiên chặn chưa dùng lượt hồi sinh.
- Không được clone hoặc hồi sinh bằng đồng đội. Trạng thái hồi sinh làm mới ở trận retry; quyền nhận thẻ không làm mới.

3.6.4. Naruto x Sasuke
-----------------------
ID: tower-champion-tsukuyomi
Tower/khóa thời tiết: Tsukuyomi / Mangekyo; yêu cầu tower_floor_100_tsukuyomi.
HP: 200.000; ATK: 20.000; tỷ lệ: 1/2.000.000.
Passive: Datebayo.
- Khi đối thủ tuyến đầu mới xuất hiện, chọn Naruto hoặc Sasuke với xác suất 50/50. Giữ chế độ đến khi đối thủ đó chết; đối thủ mới làm chọn lại và reset bộ đếm đòn của chế độ.
- Naruto: mỗi đòn thứ 3 ×3 sát thương, triệu hồi clone có 10% Max HP/ATK hiện tại. Không giới hạn tổng clone; mọi clone còn sống đánh nối sau đòn Naruto. Clone chết hồi chủ 10% Max HP. Chuyển Sasuke xóa mọi clone, không coi việc xóa là clone chết để hồi miễn phí.
- Sasuke: mỗi đòn thứ 2 gây thêm 50% ATK lên toàn bộ đối thủ. Có 20% né.
- Né: Burn trên người đánh, 5 lượt của người đó, mỗi lượt floor(25% × ATK Sasuke tại thời điểm áp dụng). Tạo khiên bằng sát thương chưa chí mạng của đòn đã né, còn tối đa 3 lượt combat tiếp theo; khiên chưa tiêu hao biến mất khi hết hạn hoặc chuyển Naruto.
- Khi stack Burn do Sasuke kết thúc tự nhiên, người bị Burn stun 1 lượt của họ. Các Burn khác không tự kích hoạt stun này.

3.6.5. Kamen Rider Dark Decade
-------------------------------
ID: tower-champion-shadow
Tower/khóa thời tiết: Shadow; yêu cầu tower_floor_100_shadow.
HP: 102.000; ATK: 28.000; tỷ lệ: 1/2.009.000.
Passive: Dark Aurora.
- Hạ đối thủ: 29% chuyển hóa thành đồng đội vào tuyến đầu, có Max HP/ATK hiện tại của Dark Decade và passive của nạn nhân; đồng thời Dark Decade lấy passive đó.
- Giữ hook chuyển hóa gốc của Dark Aurora khi đã lấy passive. Passive lấy được dispatch theo ID nguồn và được khởi tạo vào trận; giao diện Arena hiển thị cả Dark Aurora và kỹ năng lấy được. Thay kỹ năng không xóa Heresy/Crown đang có hoặc reset số hồi sinh đồng đội chuyển hóa; khiên Sasuke cũ được gỡ khi đổi kỹ năng.
- Đồng đội chuyển hóa chết khi Dark Decade còn sống: hồi sinh đầy HP ở cuối hàng với chỉ số Dark Decade hiện tại và passive đã lấy; tối đa 2 lần cho mỗi đồng đội. Không tạo nhiều tham chiếu tới cùng đơn vị trong hàng đợi.
- Giới hạn không clone/không hồi sinh của Aizen, Ice King hoặc Equinox chết vĩnh viễn vẫn được ưu tiên; không dùng chuyển hóa để bỏ qua các giới hạn này.

3.6.6. Wonder Of You
---------------------
ID: tower-champion-eclipse
Tower/khóa thời tiết: Eclipse; yêu cầu tower_floor_100_eclipse.
HP: 800.000; ATK: 8; tỷ lệ: 1/8.000.000.
Passive: Calamity.
- Khi vào trận chọn đều một đồng đội khác còn sống để bảo vệ; đồng đội chết thì chọn lại. Không có đồng đội khác thì không có mục tiêu bảo vệ.
- Sau khiên/giảm sát thương hiện hành, đồng đội nhận 50% phần sát thương còn lại; 50% chuyển về Wonder Of You. Phần chuyển tiếp vẫn dùng luật phòng thủ của đơn vị nhận.
- Xác suất 8% phản phần chuyển hướng về người đánh; đồng đội vẫn nhận phần 50% của mình. Không phản/chuyển hướng lặp và không tạo sát thương từ đòn bị chặn hoàn toàn.
- Đồng đội được bảo vệ hạ đối thủ: Wonder Of You hồi 80% Max HP.
- Wonder Of You chết trong khi có mục tiêu bảo vệ: xác suất 8% kết liễu người đánh. Đòn kết liễu bỏ qua khiên/giảm sát thương, nhưng vẫn tôn trọng miễn nhiễm passive và quyền chống chí tử/tự hồi sinh.

3.6.7. The Judgement
---------------------
ID: tower-champion-heavenly
Tower/khóa thời tiết: Heavenly; yêu cầu tower_floor_100_heavenly.
HP: 40.000; ATK: 5.000; tỷ lệ: 1/300.300.
Passive: Divine Light.
- Mỗi 2 đòn chính thử beam 33%; trúng gây 50% ATK lên mọi đối thủ. Mỗi mục tiêu nhận sát thương có xác suất 66% nhận Heresy 1–3 lượt, phân bố đều.
- Nếu còn ít nhất một đối thủ Heresy, vào Zealous: xác suất beam 66%, sát thương 66% ATK, xác suất Heresy 33%.
- Heresy: mọi sát thương tấn công/kỹ năng của đơn vị ×0,91; đòn chính có xác suất 3% miss. Hết hạn sau số lượt của đơn vị bị hiệu ứng, kể cả lượt bị khống chế. Không sửa thời tiết của trận.

3.6.8. Aqua
-------------
ID: tower-champion-raining
Tower/khóa thời tiết: Raining; yêu cầu tower_floor_100_raining.
HP: 222.222; ATK: 2.222; tỷ lệ: 1/2.222.222.
Passive: Useless.
- Trước Start, người chơi chọn một trong hai: +50% Max HP toàn đội hoặc +50% thưởng. HP chọn theo cả đội, gồm Aqua, áp dụng một lần cho mỗi bên, không cộng lại chỉ vì nhiều Aqua cùng đội.
- Quy ước thưởng giữ hệ thống Reward Bonus hiện có: VNĐ, EXP Arena và Reward Bonus hiển thị ×1,50; passiveMultiplier cấp EXP từng ID ×1,50. Không nhân Tower Coins, Drop Chance riêng hoặc xác suất potion độc lập. Tower vẫn không EXP dù chọn thưởng.
- Lượt đồng đội tấn công mà Aqua không phải đơn vị đang đánh: hồi đồng đội 10% Max HP và tăng ATK hiện tại ×1,022, làm tròn như buff cũ. Buff áp dụng ở đầu lượt, kể cả lượt đó sau này bị stun/freeze. Aqua không hỗ trợ đội đối phương và không tự kích hoạt thêm khi đòn nối cùng lượt xảy ra.
- Mỗi Aqua còn sống có thể hỗ trợ; sau khi Aqua chết, lựa chọn thưởng đã chốt vẫn áp dụng khi trận thắng như các passive thưởng hiện hành.

3.6.9. Charizard Mega X
------------------------
ID: tower-champion-sunny
Tower/khóa thời tiết: Sunny; yêu cầu tower_floor_100_sunny.
HP: 78.000; ATK: 13.000; tỷ lệ: 1/634.000.
Passive: Solar Claw.
- Xác suất chí mạng nền 33%; các buff crit khác vẫn theo luật cũ.
- Chí mạng gây Burn 3 lượt của mục tiêu, mỗi lượt floor(33% × ATK Charizard tại lúc áp dụng).
- Chí mạng kích hoạt một đòn nối bảo đảm chí mạng với hệ số sát thương ×3. Giữ hệ số crit nền ×1,50: đòn nối chưa có phòng thủ gây 4,50 × ATK; ví dụ ATK 13.000 gây 58.500, đòn đầu crit 19.500.
- Đòn nối có thể thêm Burn nhưng không tạo đòn nối thứ hai. Nếu mục tiêu đã chết thì không đánh thêm vào xác.

3.6.10. Equinox
----------------
ID: tower-champion-normal
Tower/khóa thời tiết: Normal (không có thời tiết đặc biệt); yêu cầu tower_floor_100_normal.
HP: 250.000; ATK: 25.000; tỷ lệ: 1/2.500.025.
Passive: Emotional Meter.
- Khởi đầu tích cực 50%, tiêu cực 50%; hai phía bổ sung nhau, tổng luôn 100%.
- Mỗi đòn chính tăng tích cực ngẫu nhiên đều 10–20 điểm phần trăm; mỗi lần nhận đòn tăng tiêu cực 10–20 điểm. Giới hạn từng phía 0–100%.
- Tích cực 100%: toàn đội đang sống Max HP ×2, ATK ×1,25, khóa thanh cảm xúc.
- Tiêu cực 100%: gây 25 × ATK hiện tại lên mọi đối thủ rồi tự chết vĩnh viễn. Không có nguồn hồi sinh hoặc clone sau khi chết vĩnh viễn; thử meter sau khóa không kích hoạt lại.

3.6.11. Ice King
------------------
ID: tower-champion-snowing
Tower/khóa thời tiết: Snowing; yêu cầu tower_floor_100_snowing.
HP: 104.600; ATK: 46.000; tỷ lệ: 1/1.058.000.
Passive: Ice Manipulation.
- Khi bị đánh: 20% đóng băng người đánh 2 lượt của họ. Đòn chính vào mục tiêu đang freeze tăng sát thương ×1,50.
- Chí tử lần đầu: tự hồi sinh đầy Max HP và vào giai đoạn tồn tại thêm 5 lượt combat. Trong giai đoạn đó, đòn chí tử tiếp theo không tạo lần hồi sinh mới; timer không reset.
- Hết 5 lượt combat sau lượt bắt đầu hồi sinh: chết vĩnh viễn. Không hồi sinh bằng nguồn đồng đội; không khởi động vòng hồi sinh mới trong cùng trận.
- Khi chết, 58% chọn đều một đồng đội khác còn sống để trao Ice King Crown. Crown là thêm phép thử 10% cho đòn chính trúng: đóng băng mục tiêu 3 lượt, không tăng sai thời lượng freeze 2 lượt gốc của Ice King.

Các quy tắc chung:
- ATK hiện tại trong Champion là ATK runtime sau level/mutation/buff và suy yếu. Max HP là chỉ số hiện tại; không dùng lại chỉ số index để tính kỹ năng.
- Damage kỹ năng là giá trị trước khiên/giảm sát thương; bộ đếm VNĐ chỉ ghi HP thực mất. Không cộng hồi máu, khiên hoặc HP thêm do buff vào damageTotals.
- “Mỗi lượt combat” là mỗi bước xử lý một bên. “Lượt của đơn vị” là lần đơn vị đó được lên lịch tấn công. Đòn nối không làm giảm timer độc lập thêm một lượt.
- Burn dùng từng stack với sát thương chốt lúc áp dụng; Freeze/Heresy giữ thời lượng theo luật trên. Aura phòng thủ, phản chiêu Asta và chống chí tử vẫn đi qua các hook liên quan.
- Các hằng số Champion không thay hằng số crit/dodge chung, không đổi stats/tỷ lệ của 100 thẻ cũ. Lưu bộ đếm Champion trong đối tượng trận, không ghi trạng thái kẹo/clone/afterlife vào bản thiết kế retry.

3.7. Potion, timer và tỷ lệ rơi thưởng
======================================

- Vật phẩm: Lucky Potion; Tác dụng khi hoạt động: Nhân Luck 1,25; Thời gian mỗi chai: 600 giây; Giá Tower Shop: 25 Tower Coins; Nguồn rơi từ thắng trận: Có
- Vật phẩm: Speed Potion; Tác dụng khi hoạt động: Nhân tốc độ roll 1,10; cooldown chia 1,10; Thời gian mỗi chai: 600 giây; Giá Tower Shop: 25 Tower Coins; Nguồn rơi từ thắng trận: Có
- Vật phẩm: Rich Potion; Tác dụng khi hoạt động: Nhân hệ số VNĐ 1,25; Thời gian mỗi chai: 600 giây; Giá Tower Shop: 25 Tower Coins; Nguồn rơi từ thắng trận: Có
- Vật phẩm: EXP Potion; Tác dụng khi hoạt động: Nhân hệ số EXP 1,25; Thời gian mỗi chai: 600 giây; Giá Tower Shop: 25 Tower Coins; Nguồn rơi từ thắng trận: Có
- Vật phẩm: Speed Battle Potion; Tác dụng khi hoạt động: Lượt combat từ 3 giây xuống 1 giây, áp dụng Arena thường và Tower, không áp dụng Time Trial; Thời gian mỗi chai: 600 giây; Giá Tower Shop: 100 Tower Coins hoặc Time Trial Shop: 200 Shards; Nguồn rơi từ thắng trận: Không; chỉ mua từ hai shop

Thời_điểm_hết_hạn_mới = max(thời_gian_hiện_tại; thời_điểm_hết_hạn_cũ) + 600.000 ms

Dùng thêm chai cùng loại kéo dài timer; không cộng dồn thêm phần trăm buff. Timer dùng thời gian thực tuyệt đối, tiếp tục hết hạn khi đóng game. Speed Battle Potion không thay đổi tốc độ roll. Sau hết hiệu lực, lượt Arena thường/Tower được lên lịch tiếp theo dùng nhịp gốc 3 giây. Cả hai Time Trial luôn 2 giây, kể cả đang dùng, hết hạn hoặc dùng thêm Speed Battle Potion; timer potion vẫn trôi theo thời gian thực.

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

Nhịp Arena thường/Tower giữ 3.000 ms; Speed Battle Potion còn hiệu lực dùng 1.000 ms. Time Trial luôn dùng 2.000 ms, kiểm tra mode trước khi đọc buff potion. Auto Continue giữ độ trễ kết quả 1.500 ms. 1v1 thường vẫn dùng tỷ lệ đối thủ mục tiêu 0,92–1,22; 4v4 thường 0,85–1,30, level thích ứng và mutation thời tiết 70%. Tower dùng chỉ số tầng ở mục 3.5.

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
D sau thắng cộng mức nền trên và tối đa 20. Bonus thời gian đạt 50% ở 25 giây; Tăng_D_nền hiện trong 0,50–1,50 điểm phần trăm. Tính drop này vẫn dùng thời gian trận kể cả Tower, dù VNĐ Tower không dùng thời gian. Không đưa Speed Battle Potion vào danh sách drop; item này mua Tower Shop với 100 xu hoặc Time Trial Shop với 200 Shards.

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

3.13. Bản thiết kế tầng và công thức Weather Report
==================================================

Khóa tầng đang thử = loại Tower + tầng chưa vượt tiếp theo.
encounters[loại_Tower] = { floor: F, lineup: [{ cardId, mutationIds }, ... bốn vị trí] }.
Vị trí 1–3 là lính; vị trí 4 là trùm.

Retry_F = đơn_vị_mới(bản_thiết_kế_F), không gọi RNG chọn thẻ/mutation.
Thắng_F => xóa encounters[loại_Tower]; lần bắt đầu F+1 tạo bản thiết kế mới.
Không có Reset_Opponents hoặc resetEncounter trong giao diện/API hiện tại. Chỉ thắng đúng tầng mới giải phóng bản thiết kế; Reset toàn bộ game vẫn xóa toàn bộ tiến độ theo chức năng gốc.

Tỷ lệ chọn thẻ, mutation, chỉ số tầng, ngẫu nhiên thắng/thua và danh sách drop không đổi. Đội hình mới có thể ngẫu nhiên trùng thẻ với đội trước, nhưng được lấy mẫu mới; không ép xuất hiện thẻ chưa gặp hoặc đổi xác suất để tránh trùng.

Ở lượt combat T chia hết cho 3, nếu Weather Report còn sống và passive hiệu lực:
Khiên_mới = max(1; floor(0,30 × Max_HP_runtime_tại_T)).
weatherShield = Khiên_mới.
weatherShieldExpiresAt = T + 1.
shield = max(shield_còn_lại; Khiên_mới), giữ hàm addShield hiện hành.

Nhánh hết hạn cũ chạy khi turnCount >= weatherShieldExpiresAt + 1, tức T+2; đây là một chu kỳ đòn đối phương sau khi tạo khiên. Khi đối thủ làm vỡ khiên weather, đặt Snail 2 lượt nếu luật miễn nhiễm cho phép. Không cộng HP hồi máu vào bộ đếm damage hay VNĐ từ khiên.

Max_HP_runtime lấy trực tiếp từ đơn vị sau level, mutation và buff HP đã áp dụng. Không nhân lại các hệ số lần nữa; không dùng card.stats.hp làm dự phòng ưu tiên cho khiên. ATK không nằm trong công thức khiên Weather Report, nên không thêm hệ số ATK không có trong mô tả kỹ năng.

3.14. Công thức Time Trial và các quy ước chính xác
===================================================

3.14.1. Đồng hồ và lượt
-----------------------
TURN_MS = 2.000.
Normal_DURATION_MS = 180.000; EXP_DURATION_MS = 300.000.
deadline = Date.now() tại Start thành công + duration.
còn_lại_ms = max(0; deadline - Date.now()).
Nếu Date.now() >= deadline, không xử lý thêm lượt mới.

Mỗi Room Normal có hạn mới 180 giây; mỗi lần EXP dùng vé có hạn mới 300 giây. Delay kết quả của Auto Continue vẫn 1.500 ms, nằm ngoài trận; không cộng thêm vào hạn trận đang đánh. Nếu một tab bị treo/chạy nền, không mô phỏng nhiều lượt để cấp thưởng sau giờ; deadline thực quyết định kết thúc.

3.14.2. Normal Time Trial: HP/ATK và sức mạnh Room
-------------------------------------------------
R = số Room, tối thiểu 1; Q = 1 cho lính, Q = 10 cho trùm.
Điểm neo A = 650.000 / 15.600 = 41,6666666667.

Room 1–50:
S(R) = A^((R - 1)/49).

Room 51 trở đi:
d = R - 50.
S(R) = A × [1 + 0,015 × d + 0,05 × floor(d / 10)].

HP = max(10; round(min(Number.MAX_VALUE / 1024; 1.000 × Q × S(R)))).
ATK = floor(0,10 × HP).
Power_đơn_vị = HP + 2 × ATK.
Power_Room = 3 × Power_lính + Power_trùm.

- Room 1: mỗi lính HP 1.000 / ATK 100, trùm HP 10.000 / ATK 1.000; Power Room 15.600.
- Room 50: mỗi lính HP 41.667 / ATK 4.166, trùm HP 416.667 / ATK 41.666; Power Room 649.996, nằm trong mục tiêu 600K–700K.
- Room 60: hệ số tăng tiếp ×1,20 so với điểm neo Room 50; khoảng 780K Power.
- Room 100: hệ số ×2 so với điểm neo Room 50; khoảng 1,30M Power.
- Dùng kiểu đường cong Tower hiện hành: lũy thừa mở đầu, tuyến tính nhẹ sau điểm neo. Không sửa công thức Tower tầng 100 ở mục 3.5. HP luôn lớn hơn ATK; không giới hạn Room ở 50 hoặc 100.

Bộ sinh đội Normal Time Trial:
- Pool lấy từ ALL_CARDS, loại thẻ có unlockRequirement và Griffith đúng như bộ sinh Tower; thẻ thưởng Champion không được tự đưa vào pool đối thủ.
- Room thường: lính từ Common/Rare/Epic/Legendary; trùm từ Legendary/Mythic/Secret. Nếu pool vai trò rỗng, dùng pool còn lại theo fallback của Tower.
- Room chia hết cho 10: cả bốn vị trí dùng pool Elite Mythic/Secret; nếu hết pool Elite, fallback sang Legendary trở lên, sau đó pool còn lại.
- Chọn vai trò theo chỉ số vị trí: 0–2 là lính, vị trí 3 là trùm. Khi gặp ID đã chọn, gọi cùng bộ sinh với các ID đã dùng bị loại ra; không lặp thử vô hạn. Pool hiện tại đủ để có bốn ID khác nhau; pool tùy chỉnh dưới bốn thẻ có thể dùng lại ID theo fallback.
- Gọi buildOpponents, không gọi getOpponents: Time Trial không kế thừa khóa retry của Tower. Mỗi Start tạo đối tượng runtime mới và phép rút ngẫu nhiên mới, giữ dữ liệu thẻ gốc bất biến.
- Power 649.996 tại Room 50 là tổng chỉ số nền trước passive vào trận. Passive thực của đối thủ có thể buff chỉ số, hồi sinh hoặc gọi thêm đơn vị trong combat; thắng chỉ khi không còn đối thủ sống trong toàn bộ hàng đợi. Chỉ bốn đối thủ gốc mang cờ nhận Shards, đơn vị được triệu hồi không thêm nguồn Shards.

3.14.3. Shards
---------------
K(R) = 1 + floor((R - 1)/10).
Minion: số nguyên ngẫu nhiên đều từ K đến 2 × K.
Boss: số nguyên ngẫu nhiên đều từ 2 × K đến 5 × K.
Tổng một Room đủ 4 đối thủ: 5 × K đến 11 × K Shards.

- Room 1–10: lính 1–2, trùm 2–5, cả Room 5–11.
- Room 11–20: lính 2–4, trùm 4–10, cả Room 10–22.
- Room 21–30: lính 3–6, trùm 6–15, cả Room 15–33.
- Room 41–50: lính 5–10, trùm 10–25, cả Room 25–55.
- Room 91–100: lính 10–20, trùm 20–50, cả Room 50–110.

Mỗi khối 10 Room cộng 100% mức gốc, tức ×1, ×2, ×3…, không nhân đôi lãi kép. Shards cấp khi đối thủ gốc chết, một lần mỗi đối thủ. Không cấp cho clone/đơn vị chuyển hóa đồng đội. Thua giữ Shards đã nhận, chỉ reset số Room. Số dư có trần số học Number.MAX_SAFE_INTEGER; không nhân Reward Bonus, Aqua, Nami, Hakari hay potion lên Shards.

3.14.4. EXP Time Trial
-----------------------
Vé: exp_time_trial_ticket, tiêu đúng 1 khi Start thành công; không tiêu khi đội chưa hợp lệ hoặc không ghi được lượt thử.
HP_quái = max(1; floor(0,10 × Max_HP_runtime_thẻ_đã_chọn)).
ATK_quái = 0, kể cả sau helper chuẩn hóa.

Sau khi hạ quái, tính từ thông số level hiện tại của ID thẻ đã chọn:
r = 0,001 + 0,009 × U, với U = Math.random() trong [0; 1).
EXP_exact = EXP_required(level hiện tại) × r.
Tổng_credit = EXP_exact + xpCarry[cardId] trước đó.
EXP_nguyên_cấp_thẻ = floor(Tổng_credit).
xpCarry_mới = Tổng_credit - EXP_nguyên_cấp_thẻ, luôn trong [0; 1).

EXP nguyên đi qua cơ chế level đang có; EXP lẻ lưu theo card ID để không mất giá trị tại cấp thấp và được cộng vào thanh tiến độ hiển thị. Ví dụ thẻ cần 100 EXP, mỗi kill r = 0,0055: kill đầu credit 0,55 EXP; sau 2 kill tổng 1,10 EXP, cấp 1 điểm nguyên và giữ 0,10 điểm lẻ. Phần lẻ đi theo save/reload và các lần thử sau, không được cấp lại thành điểm nguyên hai lần.

Tổng_%_kết_quả = tổng(r_i × 100) của các kill có thể nhận EXP.
Tổng_EXP_nguyên = tổng các điểm nguyên đã cấp trong lần thử.

% kết quả là tổng phần cấp tương đương, với mẫu số cấp hiện tại ở từng kill, không phải chênh lệch thanh EXP trước/sau sau khi thanh đã quay về 0 khi level-up. Kết quả hiện riêng số quái, +Y% Level Progress, EXP nguyên và số lần lên cấp. Level tối đa 999 giữ quy tắc cũ: tiếp tục đếm quái nhưng không cấp EXP vượt trần.

Không nhân EXP Potion, nâng cấp EXP hoặc passive thưởng vào các giá trị này; đảm bảo mỗi phép thử đúng 0,1%–1,0%. Buff combat, mutation, clone, crit và khống chế vẫn xử lý trong engine. Không gọi pipeline nhận VNĐ, Shards, vật phẩm, pity hoặc Drop Chance của Arena/Tower.

Quái tiếp theo sinh sau bước resolve hiện tại; không tạo vòng lặp chém quái tức thì trong cùng callback. Các hiệu ứng vào trận có thể cấp một kill ban đầu theo passive cũ (ví dụ Trapper); quái đã bị hạ này không bị thay mất trước khi trả thưởng. Lượt hai bên vẫn luân phiên 2 giây. Ví dụ thẻ starter-common one-shot quái, RNG r = 0,0055, không passive đánh thêm theo lượt: 75 kill trong 300 giây, +41,25% credit, 41 EXP nguyên và 0,25 EXP lẻ; bước tại đúng giây 300 bị chặn bởi deadline.

3.14.5. Thành tựu và Luck
-------------------------
Mốc: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 Room đã vượt.
ID: timetrial_10 đến timetrial_100 theo đúng danh sách.
Mỗi mốc: +0,1 Luck vĩnh viễn, không VNĐ.
L_TimeTrial = 0,1 × số mốc đã nhận; tối đa 1,0.
M_Luck = (1 + 0,25 × cấp_nâng_cấp_Luck + L_TimeTrial) × hệ_số_Lucky_Potion.

bestRoom lưu mốc đã vượt cao nhất; room lưu Room kế tiếp của run hiện tại. Reset run không giảm bestRoom hoặc Luck đã nhận. Thành tựu dùng biên nhận chống claim lặp hiện hành; không cộng Luck theo mỗi lần retry/nhận lại cùng mốc.

3.15. Đường dẫn 11 artwork Champion và vị trí nút passive
==========================================================

Các thuộc tính image chính xác trong cards.js:
- tower-champion-normal / Equinox: assets/cards/equinox.png
- tower-champion-raining / Aqua: assets/cards/aqua.png
- tower-champion-snowing / Ice King: assets/cards/iceking.png
- tower-champion-sunny / Charizard Mega X: assets/cards/charizardx.png
- tower-champion-sugar / Majin Buu: assets/cards/buu.png
- tower-champion-reaper / Aizen Beyond: assets/cards/aizenbeyond.png
- tower-champion-eclipse / Wonder Of You: assets/cards/wou.png
- tower-champion-malevolent / Thukuna: assets/cards/thukuna.png
- tower-champion-tsukuyomi / Naruto x Sasuke: assets/cards/narutosasuke.png
- tower-champion-heavenly / The Judgement: assets/cards/judgement.png
- tower-champion-shadow / Kamen Rider Dark Decade: assets/cards/krdarkdecade.png

Đường dẫn phân biệt chữ hoa/thường trên máy chủ có phân biệt case. Đặt đúng các file PNG thật vào thư mục assets/cards/ bên cạnh bộ nguồn game. Các PNG này chưa có trong đầu vào hiện tại, nên không được đưa vào ZIP nguồn. Hành vi dự phòng khi thiếu ảnh vẫn hoạt động; việc kiểm tra đường dẫn không đồng nghĩa đã có nội dung artwork.

Parent của phần passive dùng position: relative, chừa khoảng 44 px bên phải và chiều cao tối thiểu phù hợp. Nút + dùng position: absolute; bottom: 8px; right: 8px; z-index: 2. Nút không tham gia chiều cao dòng; chữ dài có thể thu gọn trong ô và đọc hết trong modal. Khi thẻ được scale bằng CSS, tọa độ hiển thị cùng scale với container, vẫn giữ neo tương đối 8 px trong layout gốc.

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
    timetrial.js
    achievements.js
    cards.js
    passives.js
    weathers.js
    README.txt

- File: index.html; Trách nhiệm: Bố cục, thanh điều hướng, các modal và thứ tự nạp script.
- File: styles.css; Trách nhiệm: Giao diện chung, thẻ, mutation, battle, responsive, kho vật phẩm, thành tựu, chuyển save, nút + và modal passive có cuộn.
- File: passives.css; Trách nhiệm: Trình bày trạng thái, badge và thông tin passive.
- File: app.js; Trách nhiệm: Điều phối Arena/Time Trial, UI countdown/kết quả/shop, ghi EXP từng thẻ và bundle store mới vào save; Khóa pool Champion theo mở khóa + thời tiết, chọn buff Aqua, modal đọc passive nhiều dòng và xác thực bản thiết kế trong import; điều phối EXP Arena theo từng ID, trả VNĐ Tower từ bộ đếm damage, Auto Continue, timer kết quả, menu điều hướng, lựa chọn lưu bền, RNG, đồng hồ/thời tiết, kho thẻ, level/EXP, UI, chiến đấu, cấp thưởng, gói save/HMAC/Base64, kiểm tra cooldown, khóa chuyển save và import có khôi phục khi lỗi.
- File: inventory.js; Trách nhiệm: Định nghĩa và lưu vật phẩm, chuyển đổi save cũ, stack, tiêu thụ potion, buff/timer, drop potion và giao diện kho.
- File: tower.js; Trách nhiệm: Đường cong HP chung, giới hạn ATK/HP, bảo vệ chỉ số đối thủ, công thức xu Elite nhẹ, quy đổi damage sang VNĐ; Tiến độ từng Tower, bản thiết kế đối thủ có lưu bền đến khi vượt tầng, lọc thời tiết, tạo đối thủ, chỉ số theo tầng, Tower Coins, danh mục cửa hàng và thông tin yêu cầu thưởng.
- File: timetrial.js; Trách nhiệm: Tiến độ Room, Shards, EXP lẻ, hạn giờ tuyệt đối; dùng bộ sinh Tower để rút đội thẻ thật không trùng, áp dụng chỉ số Room; tạo quái EXP 0 ATK, nhận thưởng theo kill, reset khi thua, vé vào EXP Trial, giá/shop và xác thực store Time Trial. Không đổi luật Tower hoặc gacha. app.js và index.html điều phối một nút mở modal chọn hai loại Time Trial.
- File: achievements.js; Trách nhiệm: Mốc Room 10–100 và tổng Luck từ biên nhận đã nhận;  Định nghĩa mốc, theo dõi tiến độ, lưu cờ nhận/mở khóa, xử lý nhận thưởng và giao diện thành tựu.
- File: cards.js; Trách nhiệm: Cơ sở dữ liệu 111 thẻ, thông số/tỷ lệ/ảnh, điều kiện thời tiết và cấu hình 11 thẻ thưởng Tower.
- File: passives.js; Trách nhiệm: Bảo đảm EXP Monster không gây đòn/không bị ép ATK 1, cập nhật bookkeeping buff khi thẻ lên cấp trong EXP Trial; Hook riêng cho 11 Champion (dạng, kẹo, clone, bảo vệ, mode, hồi sinh, Heresy, Crown và thưởng Aqua), giữ tách biệt với switch passive cũ; Tính khiên Weather Report theo Max HP runtime; áp dụng trần Tower trước/sau passive và cho clone, giữ bookkeeping buff tạm; quan sát damage HP thực mất từng đội; kiểm tra toàn bộ reserve Tower, giữ tuyến đầu khi chèn clone; Xử lý passive trong trận, trạng thái, hồi máu, hồi sinh, hook chiến đấu và điều chỉnh thưởng theo passive.
- File: weathers.js; Trách nhiệm: Cấu hình nhịp thời tiết, nhóm xác suất, mutation, hệ số và alias.
- File: README.txt; Trách nhiệm: Nhật ký cập nhật, thông số, công thức và tài liệu cấu trúc bằng tiếng Việt.

Thứ tự nạp script hiện hành:

1. weathers.js
2. cards.js
3. passives.js
4. inventory.js
5. tower.js
6. timetrial.js
7. achievements.js
8. app.js

Game sử dụng JavaScript thuần và không yêu cầu bước build. Có thể mở index.html trong trình duyệt. Ảnh 100 thẻ cũ giữ nguyên; 11 Champion dùng đúng đường dẫn tại mục 3.15. Nếu ảnh không có hoặc tải thất bại, game dùng cơ chế hình dự phòng. Gói nguồn này không chứa 11 PNG chưa được cung cấp; cần đặt ảnh thật trong assets/cards cạnh index.html. Không tạo ảnh giả hoặc đổi sang ảnh thẻ khác.

4.2. Các store lưu dữ liệu
==========================

- Khóa localStorage: anime_card_rng_save_v1; Phiên bản dữ liệu hiện hành: schemaVersion: 7; Nội dung: Roll, VNĐ, EXP, collection, mutation, kho biến thể, level, trang bị, nâng cấp, thời tiết và biên nhận thưởng thành tựu.
- Khóa localStorage: anime_card_rng_items_v1; Phiên bản dữ liệu hiện hành: version: 2; Nội dung: Vật phẩm, số lượng, metadata, thời điểm hết hạn buff và số lần thắng chưa rơi potion.
- Khóa localStorage: anime_card_rng_tower_v1; Phiên bản dữ liệu hiện hành: version: 1; Nội dung: Tower Coins, tầng đã vượt từng loại, tổng lượt vượt tầng hợp lệ và encounters tùy chọn lưu đội hình gốc của tầng chưa vượt.
- Khóa localStorage: anime_card_rng_timetrial_v1; Phiên bản: 1; Nội dung: shards, room kế tiếp, bestRoom đã vượt, xpCarry theo ID thẻ và activeAttempt metadata. Khi mở lại một trận chưa hoàn tất, đánh dấu kết thúc; Normal về Room 1, vé EXP đã tiêu không hoàn lại.
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
- Bản phát hành đầy đủ theo quy ước mới chỉ gồm 12 file sản xuất ở mục 4.1. Không kèm script kiểm thử, runner .cjs, báo cáo xác minh, log hoặc file tạm.
- Kiểm tra đợt tinh chỉnh Time Trial: 200 phép sinh đội Room 1 cho 200 đội khác nhau, mỗi đội bốn ID riêng; pool thường/Elite và chỉ số Room 10/20/50/100/134/1.000; Room 50 vẫn 649.996 sức mạnh nền; bản ghi đội Tower và định nghĩa thẻ không đổi. Trình duyệt xác nhận một nút Time Trial, modal hai loại, đóng Escape giữ Arena, chọn cùng loại giữ đội, thắng qua Room mới, thua/hết 180 giây reset Room 1, không bỏ đối thủ còn sống trong hàng đợi, vé EXP đúng một, quái 0 ATK/10% HP, cấp EXP và kết thúc đúng 300 giây, lượt 2 giây có potion. Chạy 24 lượt thử với 54 loại thẻ đối thủ, tổng 1.315 lượt combat, gồm đội có đơn vị triệu hồi; không ghi nhận lỗi JavaScript. Modal không tràn tại 320/390/768/1.280 px. Mã save/cooldown, 11 Champion, passive, inventory, Tower, achievements và weather giữ nguyên trong phạm vi bản vá; CSS vị trí nút + không đổi.
- Kiểm tra bản Time Trial: 8 module JS nạp và chạy; hai mode Arena; Room 50 Power 649.996; Shards/không VNĐ/không EXP/không drop; reset loss/180 giây; vé/shop và 300 giây EXP với 0 ATK; 2 giây bất kể Speed Battle Potion; credit EXP lẻ và summary; Auto Continue tiêu đúng vé; Luck +0,1 chỉ claim một lần; reload/ngắt trận; bundle .acrsave store mới, import save cũ và dữ liệu sai; nút + và layout 320–1.440 px; bẫy vào trận, level-up/runtime HP, phản ứng lỗi ghi vé và chặn kết quả sau deadline. Rà lại Tower/EXP Arena/Auto Continue/auto-roll và so sánh 111 cặp combat cùng RNG cho kết quả cũ không đổi.
- Kiểm tra bản Champion: đối chiếu đủ 11 bộ HP/ATK/chance, 11 khóa thời tiết, đăng ký hook đầy đủ; nhánh dạng/kẹo/clone/mode/chuyển hóa/bảo vệ/Heresy/hồi sinh/Crown và Aqua; so sánh 100 cặp thẻ cũ với cùng RNG cho kết quả combat trùng bản trước. Kiểm tra trình duyệt gồm nút +/xuống dòng/Escape, chọn Aqua, retry/reload, thưởng tầng 100 một lần, Auto Continue đúng 1,5 giây giữ lựa chọn Aqua, 0 EXP Tower kể cả bonus Aqua, VNĐ theo damage và hàng đợi bảy đối thủ, export/import .acrsave có cooldown, potion battle 1 giây và modal responsive 320–1.440 px.
- Các kiểm tra đã thực hiện trong những đợt kế thừa gồm cú pháp module, giữ đội hình khi thua/đổi đội/reload/chuyển save, không còn nút/API reset riêng và qua tầng mới, Weather Report theo Max HP level/mutation/buff và Snail hai lượt, mốc 470.400, đường cong tuyến tính, tỷ lệ đối thủ qua tầng rất sâu và passive, xu Elite 100–110 ở tầng 110, damage hai đội/Burn/Bleed/finisher, 0 EXP Tower có bonus, EXP Arena và chống cấp trùng ID, hàng đợi Tower bảy vị trí, Metal Cooler/Doflamingo/Frieza, timer Auto Continue và các đường thoát, giao diện từ 320 đến 1.440 px, RNG/auto-roll, lọc Weather Tower, thưởng tầng 100, chống nhận trùng, xác thực file .acrsave, mốc cooldown 7 ngày, rollback lỗi ghi và chuyển save ở phiên trình duyệt riêng. Đây là các kịch bản kiểm tra đại diện, không phải bảo đảm đã thử mọi tổ hợp passive hoặc chơi thủ công mọi tầng.
- Bản cập nhật hiện tại gồm 11 file nguồn và README này, tổng cộng 12 file sản xuất. Không đưa script kiểm thử, log hoặc file trung gian vào ZIP; lớp bảo vệ save không thay đổi phân tách module gameplay.
