NHẬT KÝ CẬP NHẬT — INFINITY MODE VÀ MUA VẬT PHẨM SỐ LƯỢNG LỚN
Ngày cập nhật: 23/10/2026

1. STAR ORB — THỨC ĂN EXP MỚI

- Thêm Star Orb, ID star_orb, loại exp_food, ảnh assets/items/starorb.png.
- Mỗi Star Orb cung cấp 1.000 EXP cơ bản. Khi Feed, EXP nhận được = 1.000 x số lượng sử dụng x EXP Multiplier của người chơi, làm tròn theo cơ chế Feed hiện có. Giữ nguyên giới hạn Level 1000 và quy tắc không Feed thẻ đã đạt cấp tối đa.
- Star Orb nằm trong Storage > EXP Food, dùng được trong Feed XP Food và có thông tin nguồn nhận. Nguồn mới: hoàn thành từng wave Infinity và thưởng hạng 1 tuần.
- Gói nguồn không chứa ảnh; người dùng tự đặt starorb.png vào đúng đường dẫn trên.

2. INFINITY MODE — XOAY VÒNG THEO TUẦN UTC

- Thêm Infinity Mode trong Arena, với sảnh chọn 4 thẻ và màn hình chiến đấu riêng. Không dùng lại hoặc ghi đè battleState của các chế độ Arena hiện có.
- Tuần được tính theo ISO week-year, bắt đầu Thứ Hai 00:00 UTC, tương ứng 07:00 tại Việt Nam. Xử lý đúng tuần giao năm, ví dụ ngày đầu tháng 1 có thể thuộc tuần cuối năm ISO trước.
- Seed = FNV-1a của chuỗi infinity-v1:YYYY_WNN. Bộ sinh Mulberry32 chọn một Category và một Element cố định cho toàn bộ tuần. Trình duyệt và máy chủ dùng chung functions/infinity_rules.js.
- Category tuần lấy từ 28 Category hợp lệ hiện có. Người chơi chỉ được dùng biến thể thẻ đang sở hữu thuộc Category đó; cần đủ số bản sao cho từng vị trí đã chọn. Không áp dụng thêm điều kiện thời tiết của Tower vào Infinity.
- Element tuần chỉ dùng sáu hệ đang có: Fire, Water, Nature, Electric, Dark, Holy. Không thêm Earth hoặc Light. Tất cả đối thủ, kể cả đơn vị được triệu hồi ở phía địch, nhận Element tuần; vẫn sử dụng nội tại của thẻ.
- Giao diện hiển thị mã tuần, Category, Element, thời gian còn lại, wave hiện tại, wave cao nhất đã hoàn thành và Star Orb đã nhận trong lượt chơi.
- Khi đổi tuần, lượt chơi đang mở được dừng an toàn. Bắt đầu lượt mới dùng quy tắc tuần mới.

3. CHIẾN ĐẤU LIÊN TỤC VÀ CÔNG THỨC WAVE

- Mỗi wave có ba đối thủ thường/elite và một boss. Bốn thẻ đối thủ trong cùng wave luôn khác nhau, được chọn từ toàn bộ Index, kể cả thẻ không thể roll thông thường.
- Chất lượng thẻ được quy đổi từ log10 của mẫu số RNG; thẻ 1 in 0 dùng giá trị thay thế 10.000.000 chỉ cho việc chọn đối thủ. Theo độ sâu, trọng số thẻ hiếm tăng dần. Boss được chọn trước với trọng số ưu tiên thẻ hiếm cao hơn ba vị trí còn lại.
- Không giới hạn tiến trình tại Wave 100. Hệ số chỉ số tại wave w là w^1,365, tương đương Math.pow(w, 1.365). HP và ATK từng vị trí được nhân hệ số rồi làm tròn.
- Chỉ số gốc Wave 1:
  Đối thủ 1: HP 1.000; ATK 100.
  Đối thủ 2: HP 1.500; ATK 300.
  Đối thủ 3: HP 2.000; ATK 400.
  Boss: HP 5.000; ATK 500.
- Tổng HP + ATK gốc Wave 1 = 10.800. Tại Wave 100, tổng sau làm tròn = 5.799.945, nằm trong khoảng 5.000.000–6.000.000 yêu cầu. Đây là tổng trước các hiệu ứng nội tại trong trận.
- Chỉ khi toàn bộ hàng địch, bao gồm quân dự bị/clone/summon, đã bị hạ mới hoàn thành wave. Hạ boss không bỏ qua địch còn sống.
- Wave mới chỉ thay đội địch. Giữ nguyên đối tượng thẻ người chơi, HP hiện tại, shield, buff/debuff, thời gian hiệu lực, bộ đếm đòn đánh, giới hạn hồi sinh và triệu hồi trong cùng lượt chơi. Không gọi lại bước khởi tạo toàn trận.
- Giữ đúng quyền đánh lượt tiếp theo, kể cả hiệu ứng thêm lượt. Hiệu ứng Meteor còn chờ của đối thủ đã chết tiếp tục chạy sau khi đổi wave; chỉ giữ bản ghi cần thiết và bỏ khi hiệu ứng hoàn tất.
- Nhịp chiến đấu dùng nhịp Arena 3 giây; Speed Battle Potion có hiệu lực theo quy tắc hiện có, giảm còn 1 giây. Không sửa nhịp Time Trial, Spooky, PvP hoặc các chế độ khác.
- Infinity không phát VNĐ hoặc EXP trực tiếp. Phần thưởng wave là Star Orb; dùng Feed sau trận để nhận EXP. Sự kiện hạ đối thủ thật vẫn đi qua bộ ghi quest hiện có, không giả lập một chiến thắng Arena riêng sau mỗi wave.
- Thua, thoát hoặc tải lại sẽ bắt đầu lượt chơi tiếp theo từ Wave 1. Star Orb đã lưu và kỷ lục tuần được giữ lại; trạng thái chiến đấu đang dở không được khôi phục.

4. STAR ORB THEO WAVE

- minOrbs = floor(1 + (wave - 1) x 7/99).
- maxOrbs = floor(2 + (wave - 1) x 8/99).
- Số nhận được là số nguyên ngẫu nhiên đều trong đoạn minOrbs đến maxOrbs, bao gồm hai đầu.
- Wave 1: 1–2 Star Orb. Wave 100: 8–10 Star Orb. Công thức tiếp tục áp dụng sau Wave 100.
- Lượng Orb theo wave là phần thưởng cố định theo công thức trên, không nhân Drop Multiplier. EXP Multiplier chỉ được áp dụng khi Feed.
- Dùng journal và biên nhận để lưu thưởng wave, cập nhật kỷ lục và khôi phục thao tác bị ngắt. Nếu bộ nhớ không ghi được hoặc kho đạt giới hạn số nguyên an toàn, dừng lượt chơi và báo lỗi; không tiếp tục phát thưởng chưa lưu.

5. BẢNG XẾP HẠNG TUẦN VÀ THƯỞNG HẠNG 1

- Mỗi tuần có vùng dữ liệu riêng: infinity_weeks/{YYYY_WNN}/entries/{uid}. Chỉ lưu wave cao nhất đã hoàn thành của mỗi tài khoản, không phải wave đang đánh.
- Top 50 hiển thị trong Leaderboard > Infinity tuần và mở được từ sảnh hoặc sau khi kết thúc lượt Infinity.
- Xếp hạng theo wave giảm dần; bằng wave thì ưu tiên người đạt mốc sớm hơn; nếu vẫn bằng thì dùng UID để có thứ tự ổn định.
- Tiến độ gửi lên được gộp để giảm số yêu cầu. Trước khi gửi điểm, đồng bộ Cloud Save; máy chủ xác minh điểm không vượt kỷ lục Infinity trong Cloud Save của chính UID đã xác thực. Điểm chưa gửi được giữ trong hàng đợi của tuần hiện tại và có nút thử lại.
- Thứ Hai 00:00 UTC, Cloud Scheduler gọi finalizeInfinityWeek để chốt tuần đã kết thúc. Bootstrap khi đăng nhập cũng xử lý tuần chưa được chốt nếu lịch bị chậm.
- Hạng 1 nhận Star Orb = highestWaveCleared x 100. Ví dụ hoàn thành Wave 100 nhận 10.000 Star Orb.
- Phần thưởng tạo trong infinity_mailboxes/{uid}/rewards/{weekId}. Khi đăng nhập lần tiếp theo, máy chủ cộng vào save bảo vệ trên Cloud trước khi trình duyệt tải save đó.
- Chốt tuần, tạo thư thưởng và nhận thưởng dùng giao dịch Firestore. Giao dịch nhận thưởng đồng thời sửa số Orb, revision, digest, bản phục hồi Cloud và đánh dấu thư đã nhận; đăng nhập lại hoặc nhiều yêu cầu đồng thời không nhận trùng.
- Giữ tương thích save chia chunk. Nếu kho Orb đầy hoặc Cloud Save không hợp lệ, thư chưa nhận được giữ lại để xử lý sau, không bị đánh dấu đã phát.
- Tuần mới có bảng riêng trống; dữ liệu tuần cũ được lưu làm lịch sử, không xóa lịch sử để mô phỏng reset.
- Firestore Rules cấm trình duyệt ghi trực tiếp leaderboard/phiếu thưởng Infinity. API yêu cầu ID token Google và lấy UID từ token, không tin UID do client gửi.
- Đây vẫn là game tính trận ở trình duyệt: kiểm tra kỷ lục Cloud không thay thế hệ thống chống gian lận chiến đấu do máy chủ xác minh.

6. MUA SỐ LƯỢNG LỚN TRONG ARENA SHOP

- Thêm ô Quantity mặc định 1 trên header của tất cả shop Arena đang có: Tower, Time Trial, Raid, Boss Event và Spooky. Các loại Raid/Boss Event dùng đúng ví tiền riêng hiện có.
- Quantity được chuẩn hóa thành số nguyên dương trong giới hạn số nguyên an toàn của JavaScript.
- maxAffordable = floor(số dư / giá một món).
- actualPurchaseQty = min(số yêu cầu, maxAffordable, chỗ còn trống trong stack).
- Trừ đúng actualPurchaseQty x giá một món và cộng đúng actualPurchaseQty vật phẩm. Nếu yêu cầu 100 nhưng chỉ đủ tiền mua 7, tự mua 7.
- Không đủ mua một món: hiển thị thông báo thiếu tiền, không thay đổi ví hoặc kho. Mua thành công: Successfully purchased [số lượng] x [tên vật phẩm]!
- Không thực hiện vòng lặp mua từng món. Một giao dịch cập nhật số lượng gộp; journal/biên nhận và rollback bảo vệ thao tác ghi bị lỗi hoặc reload giữa chừng. Spooky tiếp tục dùng cơ chế biên nhận bền vững riêng.
- Header đáp ứng màn hình nhỏ, ô Quantity và nút đóng không đè nhau. Các nút nâng cấp chỉ số Raid vẫn dùng quy tắc/cấp nâng riêng; Quantity chỉ áp dụng mua vật phẩm.
- PvP hiện không có shop hoặc tiền thưởng; không tạo shop PvP hay sửa quy tắc PvP không thưởng trong lần cập nhật này.

7. TRIỂN KHAI BACKEND TRƯỚC KHI CẬP NHẬT GITHUB PAGES

- GitHub Pages chỉ phục vụ tệp tĩnh, không thể tự chạy lịch thưởng tuần đáng tin cậy. Gói có thêm mã Firebase Functions; cần triển khai backend trước khi đẩy bản web mới.
- Chuẩn bị Node.js 22, Firebase CLI, quyền với dự án anime-card-web, gói Firebase Blaze và Cloud Scheduler API. Các dịch vụ này có thể phát sinh chi phí theo mức sử dụng; mã nguồn bàn giao chưa kích hoạt hoặc triển khai dịch vụ.
- Tại thư mục gốc dự án, chạy:
  npm --prefix functions install
  firebase deploy --only functions:infinity,firestore:rules,firestore:indexes --project anime-card-web
- Chờ các index Firestore xây dựng xong. Xác nhận có infinityApi và finalizeInfinityWeek tại asia-east1; lịch chốt tuần là 0 0 * * 1, múi giờ Etc/UTC.
- Địa chỉ API nằm trong API_URL ở đầu infinity_cloud.js, mặc định:
  https://asia-east1-anime-card-web.cloudfunctions.net/infinityApi
  Nếu đổi dự án/vùng triển khai, sửa địa chỉ tương ứng trước khi phát hành web.
- Sau khi backend sẵn sàng, đẩy toàn bộ tệp nguồn tĩnh lên GitHub Pages, giữ nguyên chữ hoa/thường và cấu trúc functions/infinity_rules.js vì tệp quy tắc này cũng được trình duyệt nạp. Cache tag bản web: 20261023-infinity-1. Người chơi cần Ctrl+F5.
- Giữ nguyên cấu hình Google Auth, Cloud-first và TURN/PvP đang có. Chỉ bổ sung kiểm tra nhận thưởng Infinity trước lần đọc Cloud lúc đăng nhập.
- Nếu API trả lỗi rõ ràng, không tự phát thưởng ở client; điểm giữ chờ đồng bộ. Nếu yêu cầu kiểm tra thưởng bị mất mạng/timeout và không xác định máy chủ đã sửa save hay chưa, giữ màn hình đăng nhập để người chơi thử lại, tránh tải nhầm bản save trước thưởng rồi ghi đè lên thưởng đến muộn.
- Điểm tuần cũ chưa gửi trước giờ chốt không được tự ý cộng vào bảng đã chốt. Thưởng tuần cần backend và mạng hoạt động; chỉ cập nhật các tệp HTML/JS trên GitHub không triển khai được lịch thưởng.

8. KIỂM TRA ĐÃ THỰC HIỆN

- Kiểm tra cú pháp toàn bộ JavaScript và cú pháp JSON; kiểm tra thứ tự nạp module, ID giao diện, tên đường dẫn phân biệt chữ hoa/thường và cache tag mới.
- Kiểm tra trình duyệt với Auth/Firestore/API mô phỏng: vào Infinity, đội theo Category, bốn địch khác nhau cùng Element, địch triệu hồi ngăn kết thúc sớm, chuyển wave giữ thẻ và bộ đếm, đúng thứ tự lượt/extra turn, Meteor chờ qua wave, thoát về Arena và Feed Star Orb.
- Kiểm tra mua gộp đủ/thiếu tiền ở năm shop, header mobile, rollback khi chèn lỗi lưu kho và khôi phục journal sau khi bị ngắt.
- Kiểm tra máy chủ bằng mô phỏng giao dịch Firestore có xung đột: tuần ISO giao năm, chốt tuần đồng thời, nhận thưởng đồng thời không trùng, save chia chunk, kho đầy giữ thư chờ và ràng buộc UID Google.
- Kiểm tra lại luồng đăng nhập Cloud-first và PvP mô phỏng 1v1/4v4, blind pick, Ready, đồng bộ lượt và không phát thưởng PvP.
- Chưa triển khai hoặc kiểm tra trực tiếp Cloud Functions, Scheduler, index, Google OAuth hay kết nối WebRTC qua mạng thật trong lần bàn giao này. Cần xác nhận trên dự án sau triển khai.
- Không kèm test runner, log, Excel, thư mục node_modules hoặc ảnh/âm thanh trong gói nguồn.

9. MODIFIED FILES NOTE — GHI CHÚ TỆP THAY ĐỔI

- app.js: Điều phối Infinity, khóa thao tác xung đột, lưu các store mới, nối shop bulk, quest và vòng thời tiết.
- boss_event.js: Mua gộp theo số lượng với từng ví Boss Event.
- exp_food.js: Đăng ký Star Orb 1.000 EXP cơ bản trong Feed.
- firebase.js: Gọi kiểm tra thư thưởng Infinity trước khi đọc Cloud Save.
- firebase.json: Khai báo Firebase Functions codebase infinity.
- firestore.indexes.json: Thêm index chốt tuần và xếp hạng Infinity, giữ cấu hình loại trừ payload.
- firestore.rules: Quyền đọc bảng tuần/thư thưởng và cấm ghi Infinity trực tiếp từ client.
- functions/index.js: Mới: HTTP API xác thực Google và lịch chốt tuần UTC.
- functions/infinity_rules.js: Mới: quy tắc ISO week, seed, Category, Element và dải Orb dùng chung.
- functions/infinity_service.js: Mới: điểm tuần, Top 50, chốt hạng 1 và giao dịch nhận thưởng.
- functions/package.json: Mới: runtime Node.js 22 và dependency Firebase backend.
- functions/save_codec.js: Mới: đọc/ghi định dạng save bảo vệ tương thích để cộng thưởng trên Cloud.
- index.html: Thêm Infinity trong Arena, modal, lựa chọn leaderboard, stylesheet/module và cache tag.
- infinity.css: Mới: bố cục Infinity, header số lượng shop, toast và responsive.
- infinity.js: Mới: sảnh, chọn đội, lượt chơi liên tục, biên nhận Orb và hàng đợi điểm tuần.
- infinity_cloud.js: Mới: API Google ID token, đồng hồ máy chủ và bootstrap thưởng.
- infinity_combat.js: Mới: chọn bốn địch, ưu tiên rarity boss, scaling và chuyển wave liên tục.
- leaderboard.js: Thêm metric Infinity tuần và tải Top 50.
- passives.js: Hook riêng Infinity: nhập đội địch wave mới, giữ trạng thái, Element summon, hàng đợi, lượt và hiệu ứng chết chờ.
- raid.js: Mua vật phẩm gộp theo từng loại Raid; không đổi nâng cấp chỉ số.
- shop_bulk.js: Mới: Quantity dùng chung, tính ngân sách, giao dịch phục hồi và thông báo.
- spooky.js: Mua gộp qua cơ chế receipt sẵn có; không đổi mở capsule hoặc combat.
- startup.js: Kiểm tra các module Infinity/shop mới sau khi nạp.
- storage.js: Thông tin nguồn Star Orb trong EXP Food.
- timetrial.js: Mua gộp vật phẩm trong shop; không đổi EXP hoặc nhịp chiến đấu.
- tower.js: Mua gộp vật phẩm shop; không đổi scaling, lựa chọn địch hoặc phần thưởng Tower.
- README.txt: Chỉ ghi changelog bản cập nhật này, công thức, triển khai và danh sách tệp.

TÀI LIỆU TRIỂN KHAI
https://firebase.google.com/docs/functions/get-started
https://firebase.google.com/docs/functions/manage-functions
https://firebase.google.com/docs/functions/schedule-functions
https://firebase.google.com/docs/functions/http-events
