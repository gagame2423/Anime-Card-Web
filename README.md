# Anime Card RNG — Nhật ký cập nhật và thông số kỹ thuật

**Ngày đối chiếu mã nguồn:** 12/10/2026.  
**Phạm vi:** bản game đã bổ sung kho vật phẩm tổng quát, Tower vô hạn, thành tựu và save bảo vệ `.acrsave` với checksum/cooldown riêng.

Tài liệu này mô tả mã nguồn của bản cập nhật bảo vệ save. Bản phát hành gồm nguồn game và README; không kèm runner kiểm thử, log hay file tạm. Các hệ thống gameplay giữ cơ chế hiện hành.

Tên thẻ, tên potion, tên thời tiết, ID và tên file được giữ nguyên để đối chiếu chính xác với mã nguồn. Các phần giải thích được viết bằng tiếng Việt.

## 1. Tính Năng Mới

### 1.1. Các đợt cập nhật đã thực hiện

| Đợt cập nhật | Nội dung chính |
|---|---|
| Nền tảng module Tower và potion | Tách lưu vật phẩm/Tower khỏi dữ liệu thẻ; tích hợp potion, Tower 4v4, cửa hàng và các điều chỉnh hồi máu/trạng thái đã có trong bản đầu vào. |
| Kho vật phẩm tổng quát và Tower vô hạn | Mở rộng `inventory.js`, sửa lọc đội hình Weather Tower, bỏ giới hạn tầng 100, thêm Speed Battle Potion độc quyền cửa hàng. |
| Thành tựu và chuyển dữ liệu | Thêm `achievements.js`, 11 thẻ thưởng tầng 100, mở khóa pool roll, xuất/nhập JSON và xử lý lỗi lưu dữ liệu. |
| Tài liệu độc lập trước đó | Tổng hợp thông số và ghi chú phát hành bằng tiếng Việt; đợt đó không sửa game. |
| Bảo vệ chuyển save hiện tại | Đóng gói `.acrsave`, HMAC-SHA-256, kiểm tra Base64/UTF-8 chuẩn, cooldown xuất/nhập 7 ngày độc lập, khóa giữa các tab và bảo toàn timestamp khi nhập. |

### 1.2. Kho vật phẩm tổng quát

`inventory.js` quản lý vật phẩm độc lập với kho thẻ trong `app.js`.

- Mỗi vật phẩm có `id`, `name`, `quantity`, `description`, `type`, `icon`, `image`, `tier` và `metadata`.
- Hỗ trợ potion, tiền tệ, nguyên liệu, trang bị, vé và loại tùy chỉnh. Việc có loại `gear` hoặc `ticket` trong kho chưa đồng nghĩa đã có cơ chế trang bị hay dùng vé mới.
- Vật phẩm cùng ID được cộng dồn số lượng. Các loại không phải potion được lưu trong kho, không xuất hiện nút tiêu thụ potion.
- Giao diện dạng ô: bốn cột trên màn hình lớn, hai cột khi chiều rộng không quá 640 px; có tìm kiếm, lọc loại, viền cấp vật phẩm và số lượng rút gọn như `x150`, `x2.56K`.
- Chú giải số lượng giữ giá trị đầy đủ. Khi chưa có kết quả phù hợp, giao diện hiển thị trạng thái trống.
- Save potion cũ dạng số được chuyển sang bản ghi vật phẩm phiên bản 2, giữ số lượng, thời điểm hết hiệu lực, bộ đếm bảo hiểm và ID vật phẩm chưa biết.

Các thao tác mở rộng chính: `registerItem()`, `grant()`, `remove()`, `getItem()`, `list()` và `use()`. Định nghĩa vật phẩm mới không tự động đưa vật phẩm đó vào danh sách rơi thưởng chiến đấu.

### 1.3. Tower vô hạn và cửa hàng

- Có 11 loại Tower: Normal và 10 Weather Tower.
- Mỗi trận sử dụng đội hình bốn thẻ; đối thủ ban đầu gồm ba lính và một trùm.
- Mỗi Tower lưu tầng đã vượt riêng. Tầng tiếp theo bằng tầng đã vượt cộng một; không còn trạng thái kết thúc ở tầng 100.
- Chỉ vượt đúng tầng kế tiếp mới nhận Tower Coins. Gọi lại kết quả của tầng đã vượt không cấp thưởng lần nữa.
- Cứ mỗi 10 tầng có một tầng tinh nhuệ, tăng chỉ số và thưởng xu.
- Tower Coins tách biệt hoàn toàn với VNĐ. Tower Shop dùng Tower Coins; cửa hàng nâng cấp thường dùng VNĐ.
- Speed Battle Potion có giá riêng 100 Tower Coins. Bốn potion thông thường giữ giá 25 Tower Coins mỗi chai.

### 1.4. Thành tựu trong module riêng

`achievements.js` phụ trách danh sách mốc, theo dõi tiến độ, kiểm tra hoàn thành, lưu trạng thái nhận thưởng, mở khóa yêu cầu và dựng giao diện thành tựu. `app.js` chỉ cung cấp số liệu hiện tại và thực hiện cấp thưởng vào trạng thái game.

| Nhóm | Các mốc hiện tại |
|---|---|
| Số thẻ độc nhất sở hữu | 25, 50, 75, 100; tự bổ sung các mốc cách nhau 25 khi số thẻ trong cơ sở dữ liệu đủ đạt mốc đó. |
| Số trận thắng | 1; 10; 100; 1.000; 10.000; 100.000; 1.000.000. |
| VNĐ sở hữu/đã kiếm | 1K; 10K; 100K; 1M; 10M; 100M; 1B; 10B; 100B; 1T; 10T; 100T. |
| Tổng lượt roll | 1K; 10K; 100K; 1M; 10M; 100M. |
| Tầng Tower đã vượt, xét Tower sâu nhất | 10; 25; 50; 100; 250; 500; 1.000; 2.500; 5.000; 10.000; 25.000; 50.000; 100.000; 1.000.000. |
| Thẻ Champion riêng từng Tower | Vượt tầng 100 của từng loại Tower. |

Quy ước: K = 1.000; M = 1.000.000; B = 1.000.000.000; T = 1.000.000.000.000. **100T = 100.000.000.000.000 VNĐ.**

- Hiện có 111 thẻ và 54 mục thành tựu: 43 mốc thường cùng 11 mốc Champion. Mốc collection 125 chưa được hiển thị vì cơ sở dữ liệu hiện chưa có đủ 125 thẻ.
- Collection tính số ID thẻ khác nhau, không cộng thêm thẻ độc nhất khi có bản trùng hoặc mutation khác của cùng thẻ.
- Tiến độ collection dùng mức cao nhất từng đạt; salvage không làm mất mốc đã hoàn thành.
- Tiến độ tiền dùng giá trị lớn hơn giữa tổng VNĐ đã ghi nhận kiếm được và số dư cao nhất từng đạt. Chi tiêu không làm mất mốc.
- Trận thắng Arena và Tower mới đều được ghi nhận. Thua trận không tăng bộ đếm thắng.
- Modal có lọc nhóm, thanh tiến độ, trạng thái đang thực hiện/đủ điều kiện/đã nhận và nút nhận thưởng. Thanh điều hướng có số phần thưởng thường đang chờ nhận.
- Mốc thường cần bấm nhận. Thẻ Champion được cấp tự động.
- Cờ đã nhận trong module và biên nhận `achievementRewardReceipts` trong save thẻ ngăn cấp trùng khi reload hoặc thử nhận lại.

**Đối chiếu save cũ:** số dư đang có và số thắng Tower đã lưu được dùng làm lịch sử khởi đầu. Save trước đây không có tổng thắng Arena hay tổng VNĐ từng kiếm, nên không thể phục dựng chính xác hai giá trị đó. Tower đã vượt tầng 100 được đối chiếu để cấp Champion còn thiếu.

### 1.5. Thẻ thưởng tầng 100 và mở khóa roll

Mỗi Tower có một thẻ thưởng độc nhất, khai báo trong `TOWER_REWARD_CARDS` tại `cards.js`. Yêu cầu tiêu biểu:

```js
unlockRequirement: 'tower_floor_100_normal'
```

- Khi vượt tầng 100, người chơi nhận ngay **một bản Normal**, không gắn mutation.
- Thẻ có ID mới, chỉ số riêng, ảnh dùng lại từ thẻ nguồn và không có passive bổ sung: `passive: null`.
- Khi chưa mở khóa, thẻ bị loại khỏi pool roll. Sau khi mở khóa, thẻ vào pool roll chuẩn và không yêu cầu thời tiết đang hoạt động.
- Mở khóa giữ vĩnh viễn dù bản được thưởng đã bị salvage; game không cấp lại bản miễn phí sau salvage.
- Các lần roll sau vẫn áp dụng mutation và EXP theo cơ chế hiện có.
- Champion của Weather Tower có `nativeWeather` tương ứng, nên bản Normal vẫn có thể tham gia Tower thời tiết đó.
- Thẻ thưởng bị loại khỏi pool tạo đối thủ Tower. Quy tắc không tạo đối thủ Griffith được giữ nguyên.

Bảng chỉ số và tỷ lệ của đủ 11 thẻ nằm ở mục 3.6.

### 1.6. Xuất và nhập save bảo vệ `.acrsave`

Modal chuyển save giữ hai nút Export Save và Import Save, nhưng định dạng ngoài đổi từ `.json` sang `.acrsave`. Dữ liệu bên trong vẫn là gói JSON đầy đủ của game.

**Quy trình xuất:**

1. Kiểm tra Web Crypto, Web Locks và cooldown xuất trước khi thực hiện.
2. Đồng bộ đồng hồ/thành tựu, ghi đủ bốn store game, kể cả game mới chưa từng vào Tower.
3. Tạo JSON gồm collection, biến thể, level/EXP, VNĐ, nâng cấp, trang bị, thời tiết, vật phẩm, buff, Tower và thành tựu. Khóa tương thích cũ được kèm theo nếu tồn tại; không thu thập dữ liệu ngoài game.
4. Ghi timestamp của lần xuất vào gói, tính HMAC-SHA-256, tạo payload rồi biểu diễn UTF-8 dưới dạng Base64.
5. Tạo file `anime-card-save-YYYY-MM-DD.acrsave`; ngày trong tên file dùng UTC.
6. Lưu cooldown ngay trước khi giao download tới trình duyệt; nếu giao download lỗi, khôi phục timestamp cũ. Không giao file nếu không thể ghi cooldown.

Trình duyệt không cung cấp xác nhận người dùng đã lưu file xuống ổ đĩa qua cách tải này. “Xuất thành công” ở đây là game đã tạo file và gọi giao download thành công; hủy hộp thoại lưu của trình duyệt sau đó không tự hoàn lại cooldown.

**Quy trình nhập:**

1. Kiểm tra cooldown nhập trước khi mở bộ chọn file và kiểm tra lại trong thao tác nhập.
2. Chỉ nhận file `.acrsave`. Đọc UTF-8 nghiêm ngặt, giữ BOM để không bỏ qua ký tự bị thêm.
3. Kiểm tra Base64 chuẩn, cấu trúc/phiên bản payload, checksum và biểu diễn ngoài đúng dạng chuẩn.
4. Sau khi xác thực, kiểm tra cấu trúc JSON, các store bắt buộc, kiểu dữ liệu, số hữu hạn, số lượng không âm và tên bản ghi không hợp lệ bằng bộ kiểm tra dữ liệu hiện có.
5. Hợp nhất timestamp theo giá trị lớn nhất: file cũ không được giảm cooldown đang có trên trình duyệt nhận.
6. Sao lưu giá trị các khóa hiện tại, ghi các store và timestamp nhập. Nếu ghi lỗi, khôi phục cả dữ liệu game lẫn cooldown, không dừng phiên đang chơi.
7. Khi ghi thành công, dừng auto-roll/timer tạm thời rồi `location.reload()`. Các chốt bảo vệ autosave, `pagehide` và thay đổi trạng thái hiển thị vẫn ngăn ghi đè dữ liệu vừa nhập.

Giới hạn dữ liệu JSON bên trong: **10 MiB**. Giới hạn tệp/chuỗi Base64 ngoài: **32 MiB**, dành chỗ cho escape JSON và phần tăng kích thước Base64. Trận chiến đang diễn ra không được phục hồi giữa chừng vì trạng thái trận tạm thời không nằm trong các store lưu bền. Timer potion giữ nguyên thời điểm hết hạn sau chuyển máy.

Save `.json` và JSON lõi cũ không được nhập trực tiếp qua giao diện mới, vì chấp nhận dữ liệu không có checksum sẽ tạo đường bỏ qua bảo vệ. Dữ liệu `localStorage` của người chơi đang có vẫn được đọc/chuyển đổi như trước; bản cập nhật không reset collection hay các hệ thống gameplay.

### 1.7. Kiểm tra toàn vẹn và cooldown 7 ngày

**Giới hạn bảo mật phải hiểu đúng:** Base64 không phải mã hóa và không bảo đảm tính bí mật. Tên hàm `encryptGameSave`/`decryptGameSave` giữ theo giao diện được yêu cầu, nhưng chức năng thực tế là đóng gói/mở gói có xác thực toàn vẹn. Khóa HMAC nằm trong JavaScript phía người chơi nên không có tính bí mật đối với người có thể xem/sửa mã nguồn. Hệ thống phát hiện file bị chỉnh sửa thông thường, không phải giải pháp chống gian lận tuyệt đối.

Checksum sử dụng **HMAC-SHA-256** với khóa được yêu cầu:

```js
const SECRET_SALT = 'ANIME_CARD_RNG_SECURE_SECRET_KEY_2026';
```

Payload có bốn trường cố định: `format`, `version`, `data`, `checksum`. `data` là nguyên chuỗi JSON đã xuất; checksum được tính trên đúng chuỗi UTF-8 này, không parse rồi stringify lại trước khi xác minh.

Khi file lỗi định dạng, thay đổi dữ liệu/checksum, thêm khoảng trắng/BOM hoặc đổi biểu diễn ngoài không đúng chuẩn, import bị từ chối và hiện alert:

> Phát hiện dữ liệu đã bị chỉnh sửa trái phép!

Import bị từ chối không ghi dữ liệu và không bắt đầu cooldown mới. JSON qua checksum nhưng sai cấu trúc game cũng bị từ chối; thông báo cấu trúc dữ liệu phân biệt với thông báo checksum.

Hai timestamp độc lập được lưu trong `localStorage`:

| Khóa | Ý nghĩa |
|---|---|
| `save_cooldown_export` | Thời điểm lần xuất đã giao thành công tới trình duyệt. |
| `save_cooldown_import` | Thời điểm lần nhập đã ghi thành công trước reload. |

Mỗi hành động có cooldown **7 ngày = 604.800.000 ms**. Xuất không tự khởi động cooldown nhập; nhập không tự coi là một lần xuất. Tuy nhiên, import giữ timestamp xuất từ file và giá trị lớn hơn đang có để không rút ngắn lịch sử cooldown. Timestamp nhập mới lấy giá trị lớn nhất giữa lịch sử hiện tại, lịch sử trong file và thời gian nhập hiện tại.

Thao tác trong cùng tab có cờ bận; các tab cùng origin phối hợp qua Web Locks với khóa `anime_card_rng_save_transfer`. Nếu API bảo mật/khóa không có, chức năng chuyển save dừng an toàn với thông báo, không hạ xuống checksum yếu. Modal hiển thị số ngày còn lại cùng ngày/giờ/phút/giây; nút bị chặn khi đang xử lý để tránh bấm lặp.

Cooldown sử dụng `Date.now()` và bộ nhớ của trình duyệt. Đổi đồng hồ, xóa/sửa localStorage, dùng browser/origin mới hoặc sửa mã phía client có thể vượt qua giới hạn này. Muốn chống gian lận và áp dụng cooldown theo tài khoản trên mọi thiết bị cần máy chủ có khóa bí mật, dữ liệu có thẩm quyền và thời gian phía máy chủ; bản game offline hiện không có các thành phần đó.

## 2. Cân Bằng & Sửa Lỗi

### 2.1. Các lỗi đã sửa trong những đợt mở rộng gần nhất

| Hạng mục | Hành vi sau sửa |
|---|---|
| Weather Tower bỏ sót mutation | Đọc `mutationId` của dữ liệu thời tiết thô, hoặc đối tượng mutation đã phân giải; kiểm tra thẻ native và cả hai mutation. |
| Dữ liệu mutation cũ | Hợp nhất `mutations`, `mutationIds`, `mutation`; mảng rỗng ở một trường không che dữ liệu ở trường khác. Giữ alias `blizzard → frost`, `sacrifice → eclipsed`. |
| Giới hạn tầng 100 | Gỡ giới hạn khỏi tải save, tầng kế tiếp, tính chỉ số, thưởng và nhãn giao diện. Save sau tầng 100 không bị hạ xuống 100. |
| Potion chỉ có thể rơi/mua theo cùng danh sách | Tách danh mục Tower Shop và danh sách rơi thưởng. Speed Battle Potion không thể lọt vào drop thường. |
| Kho chỉ lưu potion | Chuyển sang bản ghi vật phẩm tổng quát, giữ vật phẩm chưa biết và thông tin tùy chỉnh. |
| Timer qua reload | Dùng thời điểm hết hạn tuyệt đối; mở lại game không khởi động lại timer. |
| Cấp trùng phần thưởng thành tựu | Lưu cờ nhận cùng biên nhận cấp thưởng trong save thẻ; lần thử lại dùng biên nhận để tránh cấp thêm. |
| Thẻ thưởng thiếu passive | Hiển thị thông tin phù hợp khi `passive` là `null`, tránh lỗi ở kết quả roll và màn hình xem thẻ. |
| Import bị autosave ghi đè | Chặn các đường ghi trạng thái cũ trong giai đoạn nhập và reload. |
| Sửa file chuyển save | Kiểm tra HMAC trên dữ liệu, định dạng ngoài chuẩn và UTF-8/Base64 nghiêm ngặt trước khi chấp nhận import. |
| Chuyển save liên tục hoặc bấm đồng thời | Cooldown độc lập, cờ bận và Web Locks; không cho file cũ hạ timestamp đang có. |
| Export của game mới thiếu Tower | Chủ động ghi đủ dữ liệu các module, kể cả store Tower còn trống. |
| File nhập lỗi hoặc ghi lỗi | File sai bị từ chối trước khi thay đổi dữ liệu; lỗi ghi được xử lý bằng khôi phục các khóa đã sao lưu. |

### 2.2. Cân bằng và sửa trạng thái được kế thừa

Các quy tắc dưới đây đã tồn tại trong bản game modular đầu vào và được giữ nguyên trong các đợt thêm kho tổng quát/thành tựu. Chúng không phải nerf/buff mới của đợt bảo vệ save này.

| Cơ chế | Quy tắc hiện hành |
|---|---|
| Bleed chống hồi máu | Khi còn hiệu ứng Bleed với lượt hiệu lực dương, hàm hồi máu không tăng HP; giao diện thể hiện trạng thái chặn hồi máu. |
| Tăng HP tối đa khi đang Bleed | HP tối đa vẫn có thể tăng theo kỹ năng, nhưng phần hồi HP đi kèm việc tăng HP tối đa bị chặn. |
| Hồi HP sau hạ gục/hồi sinh | Các đường phục hồi HP được bảo vệ bởi kiểm tra Bleed; hồi sinh không được phục hồi HP khi Bleed còn hiệu lực. |
| Senku | Ở nhánh hỗ trợ khi không phải người tấn công, hồi 2,5% HP tối đa cho đồng đội phù hợp; vẫn chịu giới hạn HP và luật Bleed. |
| Meruem | Mỗi lần nhận đòn tăng một Aura, tối đa 5. Lần đầu đạt 5/5 thử hồi 5% HP tối đa một lần; nếu đang Bleed, lần thử bị chặn và không lặp vô hạn ở các đòn sau. |
| Homura | Khi hồi máu đưa một đơn vị từ dưới 60% HP lên ít nhất 60%, chỉ Homura còn sống có passive hiệu lực tương ứng mới kích hoạt đóng băng hỗ trợ. Cờ sử dụng giới hạn một lần cho đơn vị Homura đó trong trận. |
| Đóng băng | Hiệu ứng hỗ trợ Homura đặt 5 lượt đóng băng; bộ đếm giảm theo lượt xử lý của đơn vị chịu hiệu ứng, không được tái kích hoạt liên tục bởi mọi lần hồi máu. |
| Level thẻ | Tăng tuyến tính 7,5% HP/ATK gốc mỗi level sau level 1; các mutation của cùng ID dùng chung level. |
| Thua trận | Không xóa hoặc làm mất thẻ của người chơi. |

### 2.3. Phạm vi thay đổi chỉ số thẻ

- 100 thẻ gốc giữ nguyên định nghĩa trong đợt thêm thành tựu và thẻ thưởng.
- 11 Champion là thẻ mới; chỉ số gốc, tỷ lệ roll và điều kiện mở khóa được công bố tại mục 3.6.
- `passives.js`, `passives.css` và `weathers.js` được giữ nguyên trong đợt thêm achievements/JSON save.
- Trong đợt bảo vệ save này, không chỉnh chỉ số, passive, trạng thái, tỷ lệ roll hoặc nhịp thời tiết. Thay đổi tập trung vào định dạng chuyển save, xác thực và timestamp cooldown.

## 3. Thông Số & Công Thức Chi Tiết

### 3.1. Quy ước tính toán

- `floor(x)`: lấy phần nguyên xuống.
- `round(x)`: làm tròn theo `Math.round` của JavaScript.
- `clamp(x, a, b)`: giới hạn x trong đoạn từ a đến b.
- `L`: level thẻ, bắt đầu từ 1; `u`: cấp nâng cấp trong shop, bắt đầu từ 0.
- Chỉ số HP/ATK dưới đây là chỉ số trước các hiệu ứng passive/trạng thái phát sinh trong trận, trừ khi có ghi khác.

### 3.2. RNG, Luck và cooldown roll

```text
M_Luck = (1 + 0,25 × u_Luck) × P_Lucky
Cooldown_ms = 1.500 / [(1 + 0,15 × u_Speed) × P_Speed]
Chance_hiệu_dụng = max(0,000001; chance_thẻ / M_Luck)
p_thử_thẻ = min(1; 1 / Chance_hiệu_dụng)
```

`P_Lucky` bằng 1,25 khi Lucky Potion có hiệu lực, ngoài ra bằng 1. `P_Speed` bằng 1,10 khi Speed Potion có hiệu lực, ngoài ra bằng 1.

Pool gồm thẻ thỏa điều kiện mở khóa và thời tiết. Game sắp xếp từ `chance` lớn xuống nhỏ, thử từng thẻ, dừng ở thẻ đầu tiên thành công; có thể không nhận được thẻ nếu mọi lần thử đều trượt. Vì vậy, nhãn “1 trên N” là tỷ lệ thử của thẻ, không phải xác suất cuối cùng của một bảng trọng số đã chuẩn hóa.

Với thứ tự pool cố định, xác suất thực nhận thẻ i là:

```text
p_nhận_i = p_thử_i × tích(1 - p_thử_j) với tất cả j đứng trước i
```

Cooldown được khóa trước khi xử lý kết quả. Auto-roll dùng vòng lặp toàn cục và callback hết cooldown, không thêm một interval roll riêng. Mỗi lượt thực hiện tăng tổng roll một lần; roll không tự cấp VNĐ ngay.

### 3.3. Thời tiết và mutation

| Thông số | Giá trị |
|---|---:|
| Đồng hồ game | 1 giây thực = 1 giây game |
| Nhịp vòng lặp toàn cục | 1.000 ms |
| Khoảng xét sinh thời tiết | 300 giây |
| Thời gian hiệu lực thời tiết | 600 giây |
| Tỷ lệ sinh thời tiết đặc biệt khi xét | 55% |
| Tỷ trọng nhóm phổ biến khi đã sinh thời tiết | 65% |
| Tỷ trọng nhóm trung bình khi đã sinh thời tiết | 25% |
| Tỷ trọng nhóm hiếm khi đã sinh thời tiết | 10% |
| Tỷ lệ thử mutation sau khi roll được thẻ | 6,5%, khi có thời tiết đặc biệt đang hoạt động |
| Tỷ lệ mutation thứ hai sau lần đầu thành công | 10%, khi có ít nhất hai thời tiết khác nhau |
| Tỷ lệ mutation đôi trên một lần roll trúng thẻ, đủ điều kiện | 6,5% × 10% = 0,65% |
| Số mutation tối đa mỗi lần roll | 2 |

Thời tiết có thể tồn tại đồng thời. Khi không có thời tiết đặc biệt, roll không tạo mutation từ cơ chế thời tiết này.

| Weather Tower / thời tiết | Mutation | Hệ số HP/ATK |
|---|---|---:|
| Raining | Wet | 1,50 |
| Snowing | Frost | 1,75 |
| Sunny | Solar | 1,60 |
| Sugar | Sweat | 1,45 |
| Reaper | Hollow | 3,00 |
| Eclipse | Eclipsed | 2,00 |
| Malevolent | Cursed | 3,25 |
| Tsukuyomi | Mangekyo | 2,80 |
| Heavenly | Angelic | 2,60 |
| Shadow | Monarch | 2,40 |

Mutation đôi nhân các hệ số với nhau. Ví dụ Wet + Solar có hệ số 1,50 × 1,60 = **2,40**.

Weather Tower chấp nhận thẻ có `requiredWeather`, `requiredWeathers` hoặc `nativeWeather` phù hợp, hoặc biến thể sở hữu chứa mutation phù hợp. Normal Tower chấp nhận mọi thẻ còn bản sao sở hữu. Bộ chọn đội vẫn kiểm tra số bản sao, không cho dùng nhiều hơn số lượng đang có.

### 3.4. Level, EXP và giá trị salvage

```text
M_Level = 1 + 0,075 × (L - 1)
HP_hiển_thị = round(HP_gốc × M_Mutation × M_Level)
ATK_hiển_thị = round(ATK_gốc × M_Mutation × M_Level)
EXP_cần = max(1; floor(100 × R × L))
```

Level tối đa là **999**. Mức tăng 7,5% là tuyến tính theo chỉ số gốc, không phải nhân lãi kép 1,075 mỗi level.

| Rarity nội bộ | Hệ số R cho EXP |
|---|---:|
| Common | 1 |
| Rare | 1,6 |
| Epic | 2,4 |
| Legendary | 3,6 |
| Mythic | 5,2 |
| Secret | 8 |

```text
EXP_roll_mới = max(1; floor(8 × R × M_Mutation × M_EXP))
EXP_roll_trùng = max(1; floor(EXP_cần_hiện_tại × 0,50 × P_EXP))
Giá_trị_gốc_thẻ = floor(10 × chance_thẻ^0,45)
Salvage_mỗi_bản = floor(Giá_trị_gốc_thẻ × M_Mutation)
VNĐ_salvage = floor[(Salvage_mỗi_bản × số_bản_thực_xóa) × M_VNĐ]
```

EXP roll trùng đọc trực tiếp hệ số EXP Potion; không nhân thêm toàn bộ hệ số nâng cấp EXP. Level thẻ không tăng giá trị salvage trong công thức hiện hành.

### 3.5. Tower vô hạn, đối thủ và Tower Coins

Gọi F là tầng cần đánh, sau khi làm tròn xuống và giới hạn tối thiểu 1. Hệ số tinh nhuệ E bằng 1,18 nếu F chia hết cho 10, ngoài ra bằng 1.

```text
HP_lính(F) = max(1; round(100 × 1,055^(F - 1) × E))
ATK_lính(F) = max(1; round(10 × 1,05^(F - 1) × E))
HP_trùm(F) = max(1; round(500 × 1,055^(F - 1) × E))
ATK_trùm(F) = max(1; round(50 × 1,05^(F - 1) × E))
```

- HP nền tăng lãi kép 5,5% mỗi tầng; ATK nền tăng lãi kép 5% mỗi tầng.
- Chỉ số Tower lấy từ tầng, không lấy sức mạnh đội người chơi làm nền.
- Tầng thường ưu tiên lính đến Legendary và trùm từ Legendary; tầng tinh nhuệ ưu tiên Mythic/Secret, có pool dự phòng khi thiếu thẻ.
- Trong Weather Tower, khi pool đủ điều kiện có thẻ native phù hợp, 75% lượt chọn ưu tiên pool đó. Phần chọn từ pool nền vẫn có thể chọn thẻ phù hợp; đây không phải bảo đảm chính xác 75% đội hình thuộc thời tiết.
- Mutation thời tiết của đối thủ Tower được thử với xác suất 75% cho từng vị trí.
- Tầng sau một tầng tinh nhuệ có thể có chỉ số thấp hơn tầng tinh nhuệ trước đó do mất bonus 18%, dù nền lãi kép vẫn tăng.
- Không có tầng kết thúc được thiết kế. Để tránh tràn số JavaScript, phép tính chỉ số có chặn số học ở `Number.MAX_VALUE / 1024`; đây là giới hạn biểu diễn số, không phải mốc kết thúc Tower.

Thưởng Tower Coins:

```text
B = floor((F - 1) / 6)
A = 10 + floor(F / 10) nếu F là tầng tinh nhuệ; ngoài ra A = 0
Xu_tối_thiểu = 3 + B + A
Xu_tối_đa = 5 + B + A
```

Game chọn ngẫu nhiên một số nguyên trong khoảng trên cho lần vượt tầng hợp lệ. Ví dụ tầng 1 thưởng 3–5 xu, tầng 10 thưởng 15–17 xu, tầng 100 thưởng 39–41 xu. VNĐ/EXP chiến đấu được tính riêng, không thay thế Tower Coins.

### 3.6. Thông số 11 thẻ Champion

Các giá trị là ở level 1, bản Normal, trước hiệu ứng trận đấu. Tất cả có rarity nội bộ `Secret`, không có passive bổ sung và không yêu cầu thời tiết đang hoạt động để roll sau mở khóa.

| Tower | Thẻ thưởng | HP gốc | ATK gốc | Tỷ lệ thử nền khi đã mở khóa |
|---|---|---:|---:|---:|
| Normal | Naruto • Tower Champion | 12.000 | 1.800 | 1 trên 500.000 |
| Raining | Aquaman • Storm Champion | 12.800 | 1.920 | 1 trên 550.000 |
| Snowing | Toshiro • Frost Champion | 13.600 | 2.040 | 1 trên 600.000 |
| Sunny | Solar Deity • Sun Champion | 14.400 | 2.160 | 1 trên 650.000 |
| Sugar | Android 21 • Sugar Champion | 15.200 | 2.280 | 1 trên 700.000 |
| Reaper | Hollow • Reaper Champion | 16.000 | 2.400 | 1 trên 750.000 |
| Eclipse | Eclipse Harvester • Eclipse Champion | 16.800 | 2.520 | 1 trên 800.000 |
| Malevolent | Malevolent King • Cursed Champion | 17.600 | 2.640 | 1 trên 850.000 |
| Tsukuyomi | Tsukuyomi Eye • Moon Champion | 18.400 | 2.760 | 1 trên 900.000 |
| Heavenly | Heavenly Seraph • Light Champion | 19.200 | 2.880 | 1 trên 950.000 |
| Shadow | Shadow Monarch • Shadow Champion | 20.000 | 3.000 | 1 trên 1.000.000 |

Với chỉ số thứ tự i từ 0 đến 10 theo bảng:

```text
HP_gốc = 12.000 + 800 × i
ATK_gốc = 1.800 + 120 × i
chance = 500.000 + 50.000 × i
```

Cấp thẻ tự động không cần roll trúng tỷ lệ trên. Tỷ lệ chỉ áp dụng cho các lần gacha sau khi mở khóa, cùng hệ số Luck và quy tắc thử tuần tự ở mục 3.2.

### 3.7. Potion, timer và tỷ lệ rơi thưởng

| Vật phẩm | Tác dụng khi hoạt động | Thời gian mỗi chai | Giá Tower Shop | Nguồn rơi từ thắng trận |
|---|---|---:|---:|---|
| Lucky Potion | Nhân Luck 1,25 | 600 giây | 25 Tower Coins | Có |
| Speed Potion | Nhân tốc độ roll 1,10; cooldown chia 1,10 | 600 giây | 25 Tower Coins | Có |
| Rich Potion | Nhân hệ số VNĐ 1,25 | 600 giây | 25 Tower Coins | Có |
| EXP Potion | Nhân hệ số EXP 1,25 | 600 giây | 25 Tower Coins | Có |
| Speed Battle Potion | Lượt combat từ 3 giây xuống 1 giây, áp dụng Arena và Tower | 600 giây | 100 Tower Coins | Không; độc quyền Tower Shop |

```text
Thời_điểm_hết_hạn_mới = max(thời_gian_hiện_tại; thời_điểm_hết_hạn_cũ) + 600.000 ms
```

Dùng thêm chai cùng loại kéo dài timer; không cộng dồn thêm phần trăm buff. Timer dùng thời gian thực tuyệt đối, tiếp tục hết hạn khi đóng game. Speed Battle Potion không thay đổi tốc độ roll. Sau hết hiệu lực, lượt combat được lên lịch tiếp theo dùng nhịp gốc 3 giây.

Gọi m là số lần thắng liên tiếp không rơi potion, lưu tối đa 10; D là chỉ số Drop Chance, đơn vị điểm phần trăm, giới hạn từ 0 đến 20:

```text
p_rơi = min(0,30; 0,10 + 0,02 × m + clamp(D, 0, 20) / 100)
```

- Khi D = 0, cơ hội bắt đầu ở 10%, tăng 2 điểm phần trăm sau mỗi lần thắng không rơi và đạt trần 30% ở m = 10.
- Khi rơi, chọn đều một trong bốn potion thường: mỗi loại có xác suất 25% có điều kiện trên việc đã rơi; cấp một chai và đưa m về 0.
- Speed Battle Potion không nằm trong danh sách này. Vật phẩm mới đăng ký cũng không tự được thêm vào.
- D và m là đầu vào của xác suất rơi; hệ số VNĐ/EXP hoặc bonus thưởng passive không trực tiếp nhân xác suất rơi potion.

### 3.8. Công thức nâng cấp

```text
M_EXP = (1 + 0,12 × u_EXP + 0,03 × u_EXP^1,15) × P_EXP
M_VNĐ = (1 + 0,15 × u_VNĐ + 0,02 × u_VNĐ^1,20) × P_Rich
```

`P_EXP` và `P_Rich` bằng 1,25 khi potion tương ứng có hiệu lực, ngoài ra bằng 1.

| Nâng cấp | Giá mua cấp kế tiếp tại cấp hiện tại u | Cấp tối đa |
|---|---|---:|
| Roll Speed | `floor(100 × 1,65^u)` | 20 |
| Luck | `floor(250 × 1,65^u)` | 500 |
| Hệ số EXP | `min(Number.MAX_SAFE_INTEGER; floor(2.500 × 1,40^u))` | 100 |
| Hệ số VNĐ | `min(Number.MAX_SAFE_INTEGER; floor(4.000 × 1,45^u))` | 100 |

Các giá trên là VNĐ, không phải Tower Coins.

### 3.9. Combat và phần thưởng chiến đấu

- Lượt combat gốc: 3.000 ms; khi Speed Battle Potion còn hiệu lực: 1.000 ms.
- Sức mạnh đơn vị: `round(HP_tối_đa + 2 × ATK)`; sức mạnh đội là tổng sức mạnh các đơn vị.
- Arena 1v1 dùng tỷ lệ mục tiêu sức mạnh từ 0,92 đến 1,22; hệ số giới hạn scale của đối thủ là 0,78–1,32.
- Arena 4v4 dùng tỷ lệ mục tiêu từ 0,85 đến 1,30. Đây là đầu vào tạo đối thủ, không bảo đảm thắng hoặc bảo đảm tỷ lệ cuối sau mọi passive.
- Level đối thủ Arena được chọn từ level người chơi, tỷ lệ mục tiêu và nhiễu ngẫu nhiên 0,92–1,08, rồi làm tròn/giới hạn trong 1–999.
- Trong Arena thường, khi có thời tiết đặc biệt, xác suất thử mutation đối thủ là 70%.

Gọi t là thời gian trận tính bằng giây, V là tổng giá trị salvage của các thẻ đối thủ không phải clone, Lp/Le là level trung bình ban đầu của hai đội:

```text
M_Thời_gian = 1 + min(0,02 × t; 0,50)
M_Chênh_level = clamp(Le / Lp; 0,50; 1,50)
VNĐ_nền = floor(V × M_Thời_gian × M_Chênh_level)
VNĐ_trước_bonus_passive = floor(VNĐ_nền × M_VNĐ)
EXP_nền = max(1; floor(100 × min(1,50; M_Thời_gian)))
EXP_trước_bonus_passive = floor(EXP_nền × M_EXP)
Bonus_thời_gian_% = round((M_Thời_gian - 1) × 100)
Tăng_D_nền = làm_tròn_2_chữ_số(min(5; 0,50 + 0,02 × Bonus_thời_gian_%))
```

Bonus thời gian đạt tối đa 50% ở 25 giây. Trong công thức hiện tại, `Tăng_D_nền` nằm trong khoảng 0,50–1,50 điểm phần trăm. Khi thắng, D được cộng giá trị nền này rồi giới hạn tối đa 20. Bộ đếm potion không tăng khi thua. Passive có thể điều chỉnh phần thưởng VNĐ/EXP thông qua bước xử lý thưởng riêng.

Các hằng số cũ ghi “base cash” hay “base XP” cho 1v1/4v4 không phải nguồn quyết định khoản thưởng cố định trong hàm thưởng hiện hành; công thức ở trên mới là đường thực thi đang dùng.

### 3.10. Thưởng thành tựu

Gọi N là ngưỡng thành tựu:

| Nhóm mốc thường | VNĐ cấp khi nhận |
|---|---:|
| Collection | `100 × N` |
| Số trận thắng | `500 × N` |
| VNĐ | `max(100; floor(0,05 × N))` |
| Tổng lượt roll | `N` |
| Tầng Tower sâu nhất | `100 × N` |

Ví dụ: collection 25 thưởng 2.500 VNĐ; trận thắng đầu tiên thưởng 500 VNĐ; mốc VNĐ 1K thưởng 100 VNĐ; mốc VNĐ 100T thưởng 5T VNĐ.

Khoản thưởng thành tựu được cộng trực tiếp theo bảng, không nhân hệ số nâng cấp VNĐ hoặc Rich Potion. Thẻ Champion tự động là phần thưởng riêng của từng Tower, không thay thế mốc thưởng VNĐ “Tower tầng 100” nhận thủ công.

### 3.11. Công thức bảo vệ save và cooldown

```text
K = UTF8(SECRET_SALT)
D = UTF8(chuỗi_JSON_gói_game)
checksum = hex_chữ_thường(HMAC_SHA256(K, D))
payload = JSON_canonical({format, version, data, checksum})
nội_dung_acrsave = Base64(UTF8(payload))
```

Checksum dài **64 ký tự hex**, tương ứng **256 bit**. Định dạng ngoài có `format = "anime-card-rng-protected-save"`, `version = 1`; định dạng JSON game bên trong vẫn là `anime-card-rng-save`, phiên bản gói 1. Đây là HMAC với khóa, không phải phép cộng ký tự hay checksum không có khóa.

Gọi T là timestamp hành động, t là `Date.now()`:

```text
Cooldown = 7 × 24 × 60 × 60 × 1.000 = 604.800.000 ms
Còn_lại = max(0; T + Cooldown - t), nếu T > 0
Còn_lại = 0, nếu chưa có timestamp hoặc T = 0
Số_ngày_còn = Còn_lại / 86.400.000
```

Số ngày trên alert dùng tối đa tám chữ số thập phân; phần ngày/giờ/phút/giây làm tròn lên đến giây để không hiển thị đã sẵn sàng khi còn một phần giây. Đúng tại `t = T + Cooldown`, thao tác được phép. Timestamp sai định dạng bị chặn, không tự đặt về 0. Timestamp tương lai làm thời gian chờ kéo dài đến đủ bảy ngày sau timestamp đó.

```text
T_export_sau_nhập = max(T_export_hiện_tại; T_export_trong_file)
T_import_sau_nhập = max(T_import_hiện_tại; T_import_trong_file; t_nhập)
```

File xuất mang timestamp của lần xuất đó trong phần dữ liệu được xác thực. Vì vậy, chuyển sang thiết bị khác không chủ động xóa lịch sử xuất có trong file. Lịch sử trong một bản backup cũ không thể ghi nhận các thao tác diễn ra sau thời điểm tạo backup; không có máy chủ thì không thể ngăn tuyệt đối việc dùng lại backup trên trình duyệt mới.

## 4. Cấu Trúc Module & File

### 4.1. Cây file sản xuất

Tất cả file sau nằm cùng cấp trong thư mục game:

```text
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
    README.md
```

| File | Trách nhiệm |
|---|---|
| `index.html` | Bố cục, thanh điều hướng, các modal và thứ tự nạp script. |
| `styles.css` | Giao diện chung, thẻ, mutation, battle, responsive, kho vật phẩm, thành tựu và chuyển save. |
| `passives.css` | Trình bày trạng thái, badge và thông tin passive. |
| `app.js` | Điều phối RNG, đồng hồ/thời tiết, kho thẻ, level/EXP, UI, chiến đấu, cấp thưởng, gói save/HMAC/Base64, kiểm tra cooldown, khóa chuyển save và import có khôi phục khi lỗi. |
| `inventory.js` | Định nghĩa và lưu vật phẩm, chuyển đổi save cũ, stack, tiêu thụ potion, buff/timer, drop potion và giao diện kho. |
| `tower.js` | Tiến độ từng Tower, lọc thời tiết, tạo đối thủ, chỉ số theo tầng, Tower Coins, danh mục cửa hàng và thông tin yêu cầu thưởng. |
| `achievements.js` | Định nghĩa mốc, theo dõi tiến độ, lưu cờ nhận/mở khóa, xử lý nhận thưởng và giao diện thành tựu. |
| `cards.js` | Cơ sở dữ liệu 111 thẻ, thông số/tỷ lệ/ảnh, điều kiện thời tiết và cấu hình 11 thẻ thưởng Tower. |
| `passives.js` | Runtime passive, trạng thái, hồi máu, hồi sinh, hook chiến đấu và điều chỉnh thưởng theo passive. |
| `weathers.js` | Cấu hình nhịp thời tiết, nhóm xác suất, mutation, hệ số và alias. |
| `README.md` | Nhật ký cập nhật, thông số, công thức và tài liệu cấu trúc bằng tiếng Việt. |

Thứ tự nạp script hiện hành:

1. `weathers.js`
2. `cards.js`
3. `passives.js`
4. `inventory.js`
5. `tower.js`
6. `achievements.js`
7. `app.js`

Game sử dụng JavaScript thuần và không yêu cầu bước build. Có thể mở `index.html` trong trình duyệt. Đường dẫn ảnh nguồn được giữ nguyên; nếu ảnh không có hoặc tải thất bại, game dùng cơ chế hình dự phòng. Các thẻ Champion dùng ảnh nguồn hiện có, không kèm bộ ảnh mới trong bản mở rộng.

### 4.2. Các store lưu dữ liệu

| Khóa `localStorage` | Phiên bản dữ liệu hiện hành | Nội dung |
|---|---:|---|
| `anime_card_rng_save_v1` | `schemaVersion: 7` | Roll, VNĐ, EXP, collection, mutation, kho biến thể, level, trang bị, nâng cấp, thời tiết và biên nhận thưởng thành tựu. |
| `anime_card_rng_items_v1` | `version: 2` | Vật phẩm, số lượng, metadata, thời điểm hết hạn buff và số lần thắng chưa rơi potion. |
| `anime_card_rng_tower_v1` | `version: 1` | Tower Coins, tầng đã vượt từng loại và tổng lượt vượt tầng hợp lệ. |
| `anime_card_rng_achievements_v1` | `version: 1` | Thống kê thành tựu, tiến độ Tower, cờ nhận và yêu cầu mở khóa vĩnh viễn. |
| `save_cooldown_export` | Timestamp mili giây | Lịch sử xuất; được kèm trong save bảo vệ khi có. |
| `save_cooldown_import` | Timestamp mili giây | Lịch sử nhập; được bảo toàn/hợp nhất khi chuyển save. |

Khóa tương thích cũ: `animeCardRngSave_v1`. Đuôi `_v1` trong tên khóa không có nghĩa phiên bản cấu trúc bên trong vẫn là 1.

Dữ liệu localStorage phụ thuộc trình duyệt và origin; hành vi với đường dẫn `file://` cũng phụ thuộc trình duyệt. Dùng xuất/nhập `.acrsave` để chuyển máy hoặc chuyển origin thay vì kỳ vọng save tự đi theo file HTML.

### 4.3. Chính sách bảo trì và đầu ra sạch

- Sau mỗi lần thêm tính năng, sửa cân bằng hoặc sửa lỗi, cập nhật README tiếng Việt với hành vi thực tế, thông số, công thức và module liên quan.
- Phân biệt rõ thay đổi mới, cơ chế kế thừa và việc chỉ sửa tài liệu; không mô tả một hằng số chưa được dùng như hành vi gameplay.
- Giữ logic vật phẩm trong `inventory.js`, Tower trong `tower.js`, thành tựu trong `achievements.js`; không dồn các hệ thống này vào `app.js`.
- Bản phát hành đầy đủ theo quy ước mới chỉ gồm 11 file sản xuất ở mục 4.1. Không kèm script kiểm thử, runner `.cjs`, báo cáo xác minh, log hoặc file tạm.
- Những kiểm tra phát hành đã thực hiện gồm cú pháp module, giao diện desktop/mobile, RNG/auto-roll, lọc Weather Tower, thưởng tầng 100, chống nhận trùng, xác thực file .acrsave, mốc cooldown 7 ngày, rollback lỗi ghi và chuyển save ở phiên trình duyệt riêng. Đây là các kịch bản kiểm tra đại diện, không phải bảo đảm đã thử mọi tổ hợp passive hoặc chơi thủ công mọi tầng.
- Bản cập nhật hiện tại gồm 10 file nguồn và README này, tổng cộng 11 file sản xuất. Không đưa script kiểm thử, log hoặc file trung gian vào ZIP; lớp bảo vệ save không thay đổi phân tách module gameplay.
