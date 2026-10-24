NHẬT KÝ CẬP NHẬT — INFINITY THUẦN CLIENT, TƯƠNG THÍCH FIREBASE SPARK
Ngày cập nhật: 24/10/2026

1. KIẾN TRÚC MIỄN PHÍ PHÍA TRÌNH DUYỆT

- Infinity chạy hoàn toàn bằng JavaScript trong trình duyệt, sử dụng Google Auth và Firestore Client SDK đã có. Không cần Cloud Functions, Cloud Scheduler, máy chủ Node, API riêng hoặc gói Blaze.
- Xóa toàn bộ mã backend trong thư mục functions và cấu hình Functions khỏi firebase.json. Tệp quy tắc tuần chuyển ra infinity_rules.js ở thư mục gốc.
- infinity_cloud.js chỉ đọc/ghi Firestore trực tiếp. Không còn fetch tới endpoint Infinity, bootstrap API hoặc lỗi chặn đăng nhập liên quan đến kiểm tra thưởng tuần.
- Sau xác thực Google, đọc ngay users/{uid} theo quy tắc Cloud-first. Giữ nguyên Google Auth bắt buộc, di chuyển Local lần đầu, checksum, revision, journal và cơ chế khôi phục save.
- Không sửa online_utils.js, TURN/STUN, startup.js, mã PvP hoặc quy tắc PvP không thưởng.

2. XOAY VÒNG TUẦN ISO THEO UTC

- getISOWeekAndYear() tính năm ISO và tuần ISO bằng UTC, xử lý đúng tuần giao năm. InfinitySystem cũng cung cấp helper này để sử dụng lại.
- Seed = Year x 100 + ISOWeek. Ví dụ năm ISO 2026, tuần 43 dùng seed 202643.
- Dùng Mulberry32 với seed trên để chọn một Category và một Element. Mọi người chơi dùng cùng phiên bản nguồn và đồng hồ thiết bị chính xác sẽ có cùng lựa chọn trong tuần.
- Category lấy trực tiếp từ CategorySystem.TYPES; Element lấy từ ElementSystem.TYPES gồm Fire, Water, Nature, Electric, Dark, Holy. Không thêm hệ hoặc Category ngoài game.
- Người chơi phải chọn đủ 4 bản sao thẻ đang sở hữu thuộc Category tuần. Toàn bộ địch, kể cả summon phía địch, giữ Element tuần và nội tại gốc.
- Tuần mới bắt đầu Thứ Hai 00:00 UTC, tương ứng 07:00 Việt Nam. Client đổi quy tắc và vùng leaderboard khi sang tuần; lượt Infinity đang dở kết thúc an toàn.
- Thay thuật toán seed có thể thay Category/Element của tuần hiện tại so với bản trước. Giữ nguyên Orb và kỷ lục đã lưu; không xóa tiến độ để đổi seed.

3. LEADERBOARD TUẦN GHI TRỰC TIẾP VÀO FIRESTORE

- Collection: infinity_leaderboards.
- Document: YYYY_WNN, ví dụ 2026_W43.
- Mỗi UID là một trường cấp cao nhất trong document, chứa đúng displayName, highestWave, updatedAt.
- Ví dụ cấu trúc: { "UID_NGUOI_CHOI": { "displayName": "Player", "highestWave": 100, "updatedAt": "Firestore Timestamp" } }.
- Transaction đọc giá trị cũ rồi chỉ ghi kỷ lục cao hơn của chính UID đó. Không ghi đè toàn bộ document hoặc dữ liệu người chơi khác. updatedAt dùng serverTimestamp của Firestore Client SDK.
- Top 50 được sắp xếp trên client theo wave giảm dần, thời điểm đạt mốc tăng dần, rồi UID. Một lần tải đọc document của tuần; kết quả giao diện được cache 30 giây.
- Gộp gửi kỷ lục theo nhịp 60 giây để tiết kiệm hạn mức. Thoát lượt, nút Sync Weekly Best và gần giờ đổi tuần có thể yêu cầu đồng bộ sớm. Điểm chưa gửi được giữ để thử lại trong tuần hiện tại.
- Rules chỉ cho tài khoản Google thay trường UID của chính mình, kiểm tra schema, số wave dương và không cho giảm kỷ lục. Không cho xóa document hoặc ghi trường của người khác.
- Leaderboard mới không cần composite index. Cấu hình index cho payload/chunk/recovery của Cloud Save được giữ nguyên; bỏ composite index riêng của backend Infinity cũ.

4. THƯỞNG TUẦN CÁ NHÂN — TỰ NHẬN KHI ĐĂNG NHẬP

- Thay thưởng chỉ dành hạng 1 bằng thưởng dựa trên kỷ lục tuần của từng người chơi theo yêu cầu mới.
- Metadata nằm bên trong payload Cloud Save dưới tên infinityMetadata:
  { "lastClaimedWeek": "2026_W43", "lastWeekHighestWave": 0 }
- Bản metadata tương ứng được giữ trong store Infinity để khôi phục vào localStorage cùng các module khác. Hai bản được kiểm tra nhất quán khi tải save.
- Trong tuần, lastWeekHighestWave lưu kỷ lục đã hoàn thành để làm cơ sở thưởng khi sang tuần tiếp theo; cập nhật bằng max, không cộng dồn số wave.
- Khi đăng nhập, nếu tuần hiện tại lớn hơn lastClaimedWeek và có kỷ lục tuần đã kết thúc, thưởng = highestWave x 100 Star Orb. Ví dụ Wave 100 nhận 10.000 Star Orb.
- Sau xử lý, lastClaimedWeek chuyển sang tuần hiện tại và lastWeekHighestWave về 0. Nếu save đã có kỷ lục của tuần hiện tại, giữ kỷ lục đó để không mất tiến độ khi khôi phục.
- Save cũ chưa có metadata được di chuyển tự động, dùng tuần có tiến độ gần nhất đã kết thúc. Với save đã có metadata, số thưởng luôn là lastWeekHighestWave x 100; không cộng thêm điểm lịch sử hoặc nhân thưởng cho các tuần không chơi.
- Client chuẩn bị bản sao payload, cộng Star Orb và cập nhật metadata trong cùng một lần publish có kiểm tra revision bằng transaction Firestore. Chỉ khôi phục bản đã được Cloud xác nhận vào localStorage; không phát thưởng Local trước rồi mới đánh dấu Cloud.
- Hai tab/thiết bị cùng đăng nhập: một revision được ghi trước; bên xung đột đọc lại Cloud và thấy metadata đã cập nhật. Refresh hoặc đăng nhập lại không cộng thưởng trùng.
- Khi kho đầy hoặc ghi thưởng thất bại, không xóa metadata cũ và không đánh dấu đã nhận. Vẫn tải tiến độ Cloud hiện có; thử nhận lại ở lần đăng nhập sau. Không thêm cổng kiểm tra API vào màn hình đăng nhập.
- Sau khi Cloud được khôi phục, hiển thị modal Weekly Reset với số Star Orb và wave đạt được. Đóng modal chỉ xác nhận thông báo; vật phẩm đã được lưu trước đó. Thông báo chưa xác nhận có thể xuất hiện lại sau reload, nhưng không phát thêm Orb.
- Không còn yêu cầu lịch cron hoặc một client khác phải online để chốt tuần. Người chơi nhận thưởng khi chính họ đăng nhập.

5. GIỮ NGUYÊN INFINITY COMBAT VÀ STAR ORB

- Infinity vẫn là chiến đấu 4v4 liên tục: thay đội địch sau khi toàn bộ địch, bao gồm quân dự bị/summon, bị hạ. Không reset HP, shield, buff/debuff, bộ đếm đòn đánh hoặc trạng thái người chơi giữa các wave.
- Không chỉnh sửa infinity_combat.js hoặc passives.js trong lần cập nhật này.
- Chỉ số Wave 1: đối thủ 1 HP 1.000 / ATK 100; đối thủ 2 HP 1.500 / ATK 300; đối thủ 3 HP 2.000 / ATK 400; boss HP 5.000 / ATK 500.
- Hệ số = Math.pow(wave, 1.365), nhân từng chỉ số gốc rồi làm tròn. Tổng HP + ATK Wave 1 = 10.800; Wave 100 = 5.799.945 trước nội tại. Không có giới hạn tại Wave 100.
- Bốn thẻ địch khác nhau trong từng wave; ưu tiên thẻ hiếm tăng theo wave và trọng số rarity của boss cao hơn vị trí thường.
- minOrbs = floor(1 + (wave - 1) x 7/99).
- maxOrbs = floor(2 + (wave - 1) x 8/99).
- Mỗi clear nhận số nguyên ngẫu nhiên trong khoảng trên: Wave 1 nhận 1–2 Orb; Wave 100 nhận 8–10 Orb. Công thức tiếp tục sau Wave 100; không nhân Drop Multiplier.
- Star Orb tiếp tục dùng ID chuẩn star_orb, ảnh assets/items/starorb.png, giá trị 1.000 EXP cơ bản. Feed áp dụng EXP Multiplier hiện có; không thay EXP Requirement hoặc giới hạn cấp.
- Không thay nhịp đánh, lựa chọn thẻ, phần thưởng hay logic của Tower, Time Trial, Raid, Spooky, Sandbox và PvP.

6. GIỮ NGUYÊN MUA GỘP ARENA SHOP

- Quantity mặc định 1 tiếp tục có trên cả năm nhóm shop hiện có: Tower, Time Trial, Raid, Boss Event và Spooky.
- actualPurchaseQty = min(số lượng yêu cầu, floor(số dư / đơn giá), phần stack còn trống).
- Trừ đúng actualPurchaseQty x đơn giá, cấp đúng số lượng mua; không đủ một món thì báo thiếu tiền. Giữ journal/receipt, rollback khi lưu lỗi và ví riêng từng loại Raid/Boss Event.
- Không sửa shop_bulk.js hoặc logic mua của các chế độ trong bản này. PvP tiếp tục không có tiền thưởng hoặc shop mới.

7. TRIỂN KHAI TRÊN SPARK

- Tải toàn bộ tệp nguồn tĩnh lên GitHub Pages, giữ đúng chữ hoa/thường. Nếu cập nhật repo bản cũ, gỡ thư mục functions khỏi repo và dùng index.html mới. Cache tag mới: 20261024-infinity-spark-1. Người chơi cần Ctrl+F5 sau khi cập nhật.
- Publish firestore.rules đi kèm để cho phép ghi leaderboard bằng Client SDK. Có thể dán nội dung trong Firebase Console hoặc dùng lệnh:
  firebase deploy --only firestore:rules,firestore:indexes --project anime-card-web
- Không cài dependency cho thư mục functions, không deploy Functions và không cần máy chủ Node chạy cùng game. Firebase CLI chỉ là công cụ triển khai tùy chọn.
- Nếu đã tự triển khai Functions/lịch Scheduler của bản trước, xóa các tài nguyên Infinity cũ trong Firebase/Google Cloud Console. Bản nguồn mới không gọi chúng, nhưng xóa mã nguồn trên GitHub không tự xóa tài nguyên đang chạy trong dự án.
- Kiến trúc tương thích hạn mức miễn phí Spark, không có nghĩa là lưu lượng không giới hạn. Firestore miễn phí hiện có 1 GiB dữ liệu, 50.000 lượt đọc/ngày, 20.000 lượt ghi/ngày, 20.000 lượt xóa/ngày và 10 GiB truyền ra/tháng. Theo dõi Usage trong Console; hết hạn mức có thể làm đồng bộ tạm ngừng.
- Document Firestore có giới hạn 1 MiB. Cấu trúc một document/tuần được giữ đúng yêu cầu; cần đánh giá lại cách chia dữ liệu nếu số người chơi tăng đến giới hạn này.
- Rotation và chiến đấu chạy ở client nên phụ thuộc đồng hồ thiết bị; không cung cấp khả năng chống gian lận cấp máy chủ. Quyền Firestore vẫn bảo vệ dữ liệu của người chơi khác.

8. KIỂM TRA BẢN CẬP NHẬT

- Kiểm tra cú pháp toàn bộ JavaScript/JSON, đường dẫn phân biệt chữ hoa/thường, ID giao diện và thứ tự script sau khi bỏ thư mục functions.
- Kiểm tra trình duyệt với Google Auth/Firestore mô phỏng: migration, Cloud-first, không yêu cầu endpoint Infinity, thưởng tuần, modal mobile, reload không phát thưởng trùng, leaderboard trực tiếp, chuyển wave giữ trạng thái và Feed Star Orb.
- Kiểm tra hai client đăng nhập đồng thời bằng mô phỏng transaction có xung đột: một lần cộng thưởng, cùng kết quả trên cả hai client, giữ nguyên dữ liệu không liên quan.
- Kiểm tra save cũ không metadata, save chia chunk, kho đầy, lỗi ghi thưởng và năm shop mua gộp đúng ngân sách.
- Đối chiếu byte: online_utils.js, startup.js, pvp.js, pvp_view.js, pvp_combat.js, infinity_combat.js, passives.js và các module giao dịch shop không thay đổi.
- Chưa publish Rules hoặc kiểm tra OAuth/Firestore thật trên dự án trong lần bàn giao này. Không kèm test runner, log, Excel, node_modules hoặc asset nhị phân trong gói nguồn.

9. MODIFIED FILES NOTE — GHI CHÚ TỆP THAY ĐỔI

- app.js: Lưu metadata trong payload, chuẩn bị thưởng Cloud, hỗ trợ save cũ và điều phối modal thông báo.
- exp_food.js: Cập nhật mô tả nguồn Star Orb sang thưởng tuần cá nhân.
- firebase.js: Bỏ kiểm tra API trước Cloud Save; xử lý thưởng bằng publish transaction và tải lại khi xung đột revision; cung cấp Firestore Client SDK cho Infinity.
- firebase.json: Bỏ cấu hình Functions, giữ cấu hình Firestore.
- firestore.indexes.json: Bỏ composite index của backend Infinity; giữ miễn lập chỉ mục payload/chunk/recovery.
- firestore.rules: Thêm quyền cho infinity_leaderboards và giới hạn ghi theo UID; bỏ đường dẫn backend Infinity cũ.
- index.html: Đổi thứ tự nạp script thuần client, đường dẫn rules, mô tả thưởng, modal thông báo và cache tag.
- infinity.css: Bố cục modal Weekly Reset đáp ứng màn hình nhỏ, biểu tượng CSS không cần asset mới.
- infinity.js: Metadata, kế hoạch thưởng không ghi trực tiếp Local, thông báo, seed helper và đồng bộ kỷ lục theo nhịp tiết kiệm.
- infinity_cloud.js: Thay API ngoài bằng Firestore Client SDK transaction và đọc Top 50 từ document tuần.
- infinity_rules.js: Tệp mới ở thư mục gốc; tuần ISO UTC, seed Year x 100 + ISOWeek, Category/Element và công thức Orb.
- leaderboard.js: Gọi bảng Infinity trực tiếp từ Firestore và hiển thị mô tả thưởng cá nhân.
- storage.js: Cập nhật thông tin nguồn Star Orb.
- README.txt: Chỉ ghi changelog và hướng dẫn của bản cập nhật này.

Tệp đã gỡ khỏi gói nguồn:
- functions/index.js
- functions/infinity_rules.js (thay bằng infinity_rules.js thuần trình duyệt ở gốc)
- functions/infinity_service.js
- functions/save_codec.js
- functions/package.json

TÀI LIỆU THAM CHIẾU
https://firebase.google.com/docs/firestore/quotas
https://firebase.google.com/docs/firestore/manage-data/transactions
https://firebase.google.com/docs/firestore/security/rules-fields
