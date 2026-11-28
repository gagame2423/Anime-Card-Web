# Update 35.5.2 — Firestore Quota & Local Backup

Bản vá dành cho Update 35.5.1. Giảm mạnh lưu lượng Firebase, giữ tiến trình chơi cục bộ và bổ sung mã sao lưu không cần đăng nhập.

## 1. Nguyên nhân và cách khắc phục

Các số liệu 2.2K lượt đọc, 2.2K lượt ghi và 1.8K lượt xóa mỗi giờ là số liệu thực tế do bạn cung cấp. Khi rà soát mã nguồn, mình xác định luồng lưu cũ có những nguyên nhân sau:

- Chu kỳ đồng bộ chỉ 60 giây. Các callback kết thúc hoạt động, xác thực lại và `flush(true)` còn có thể kích hoạt lưu sớm. Auto-Roll liên tục đánh dấu save thay đổi.
- Save lớn hơn 600 KB được tách thành nhiều chunk. Mỗi lượt upload có thể ghi toàn bộ chunk mới, đọc hồ sơ và bản recovery cũ, ghi hồ sơ + recovery + leaderboard, rồi đọc và xóa từng chunk lỗi thời. Đây là nguồn chính tạo ra số lượt xóa và ghi rất cao. Dữ liệu nguồn có nhiều bản sao của cùng thông tin sở hữu card nên dễ vượt ngưỡng chunk.
- Realtime listener theo dõi hồ sơ cloud, token refresh và các luồng đồng bộ điểm Infinity/Auto Chess riêng làm phát sinh truy cập ngoài nhu cầu lưu chính. Infinity trước đây kiểm tra điểm ngay cả khi người chơi chỉ để màn hình mode mở.

**Bản mới:** mỗi lần autosave ghi đè đúng một document riêng tư `users/{uid}` với payload nén, không tạo chunk, không ghi recovery trên cloud, không xóa document, không listener realtime, không đọc lại sau khi ghi. Dùng một yêu cầu Firestore Commit có xác thực Firebase (tương đương ghi đè `setDoc`, không có hàng đợi ghi offline hoặc retry tự động của SDK). Revision tăng tuần tự và Firestore Rules vẫn ngăn hồ sơ cũ ghi đè hồ sơ mới của thiết bị khác. Khi xung đột, người chơi tự chọn Upload Local Save hoặc Load Cloud Save.

Save dạng chunk đã tồn tại vẫn được đọc khi người chơi **chủ động** Load Cloud Save. Lần upload tiếp theo chuyển sang document đơn. Các chunk/recovery cũ được giữ nguyên trên server, không chạy cleanup ngầm để tránh tiêu tốn thêm quota hoặc làm mất bản sao cũ.

## 2. Autosync đúng 1 giờ và kiểm tra thay đổi

| Thao tác | Số lượt Firestore của luồng lưu chính |
|---|---|
| Auto-Roll, tick thời gian, click UI, lưu local, kết thúc trận | 0 ngay tại thời điểm thao tác |
| Mỗi chu kỳ 3.600 giây có tiến trình mới | Tối đa 1 lượt ghi, 0 lượt đọc, 0 lượt xóa |
| Không thay đổi tiến trình | 0 lượt ghi, 0 lượt đọc, 0 lượt xóa |
| Upload Local Save thủ công | 1 lượt đọc để xác định revision mới nhất; ghi tối đa 1 document save nếu có thay đổi |
| Upload thủ công có điểm leaderboard chính thay đổi | Có thể thêm 1 lượt ghi document điểm công khai, trong cùng yêu cầu; không chứa dữ liệu save riêng tư |
| Load Cloud Save thủ công | Đọc hồ sơ theo yêu cầu; save dạng chunk cũ có thể cần đọc các chunk tương ứng |

- Lần tự động đầu tiên đợi một giờ. Sau mỗi lần thử ghi, kể cả khi mạng lỗi, lần tự động tiếp theo phải đợi tối thiểu một giờ. Thời điểm thử được lưu trong localStorage và dùng chung giữa các tab; Web Locks ngăn hai tab gửi đồng thời. Nếu trình duyệt không hỗ trợ khóa, autosync không ghi để tránh race; vẫn có thể Upload thủ công.
- Các module chỉ báo dirty. Khi đến lịch, hệ thống tạo SHA-256 từ dữ liệu tiến trình đã sắp xếp ổn định. Thời gian hiện tại, scheduler weather và card hiển thị gần nhất không làm đổi fingerprint; tiến trình thực tế như rolls, vật phẩm, nhiệm vụ, phần thưởng, cấp card và tiền vẫn được so sánh. Weather được giữ trong snapshot để phục hồi chính xác khi có lần lưu mới.
- Upload Local Save hoạt động không cần chờ một giờ, có chặn nhấn lặp 10 giây. Sau thao tác thành công, lịch tự động tính lại từ thời điểm thử cuối. Nếu save giống bản cloud đã biết, không ghi lại; hiện `Already up to date`. Upload mới thành công hiện `Saved to Cloud!`.
- Để không nhân đôi số lượt ghi tự động, bảng xếp hạng chính được cập nhật khi Upload Local Save thủ công. Kết quả Auto Chess và điểm Infinity được lưu cục bộ trước; chúng chia sẻ ngân sách một lượt ghi tự động mỗi giờ với save chính, luân phiên khi cùng có dữ liệu chờ. Có thể chủ động dùng `Sync My Result` trong Elo Leaderboard hoặc `Retry Sync` trong Infinity; thao tác thủ công cũng dùng chặn 10 giây. Không còn tự gửi điểm từ từng wave, mở lobby, token refresh hay sự kiện kết nối lại. Bảng xếp hạng chỉ đọc khi người chơi yêu cầu; Auto Chess chỉ truy vấn replay có giới hạn lúc bắt đầu trận, ưu tiên cache kể cả kết quả rỗng.
- PvP, Portal Party và kết nối người chơi Auto Chess dùng PeerJS/WebRTC; heartbeat của các phòng này không phải truy vấn Firestore. Không thay đổi heartbeat hoặc luật combat của các mode.

## 3. Sailing Sea hoàn toàn cục bộ, save cloud nhỏ gọn

- Voyage, bản đồ, tàu, crew, bot, combat checkpoint nằm ở `anime_card_rng_sailing_sea_v1`; điều khiển nằm ở `anime_card_rng_sailing_sea_settings_v1`. Cả hai chỉ dùng localStorage. Đã bỏ phụ thuộc tài khoản/Cloud Save trong adapter vào-ra Sailing Sea, và chặn mọi truy cập dữ liệu Firestore khi Sailing Sea đang hoạt động. Chỉ khi trở lại game chính, lịch autosync thông thường mới tiếp tục.
- Cloud save và Backup Code dùng danh sách store được cho phép, không quét toàn bộ localStorage hoặc sessionStorage. Loại mirror save legacy, combat log, cache UI, replay/run đang chơi, dữ liệu Sailing Sea, timestamp xuất file và các bản sao dư thừa. Inventory card trùng với bảng `mutations` được tái tạo bằng sanitizer của game; bản ghi riêng không trùng vẫn được giữ. Không cắt số lượng card/vật phẩm, chỉ số relic, receipt chống nhận thưởng lặp, trạng thái Tower/Portal hay các checkpoint phần thưởng đang chờ.
- Dùng GZIP + Base64 nếu trình duyệt hỗ trợ, với phiên bản mã `acgz1:` và checksum bảo vệ save hiện có. Payload tối đa **90.000 byte** trước khi gửi (document có thêm một ít metadata, vẫn dưới 100 KB). Save lớn hơn mức này không bị cắt hoặc ghi nửa chừng; sử dụng Backup Code để giữ dữ liệu đầy đủ. Trình duyệt cần hỗ trợ GZIP để giải nén mã `acgz1:`, mã Base64 đời cũ vẫn đọc được.
- Giữ tương thích cloud save có manifest/chunk hoặc Base64 cũ. Nếu có bản save cũ chứa Sailing Sea, phần ấy được bỏ qua khi khôi phục; voyage đang có trên thiết bị vẫn nguyên vẹn.

## 4. Khi gặp lỗi và dùng Backup Code

Cloud Account phân biệt:

- `Daily Firebase quota is full`: tiến trình đã lưu local; tạm dừng cả truy cập đọc/ghi Firestore của game đến mốc reset ngày theo giờ Pacific (thêm 5 phút để tránh thời điểm reset). Mốc này tồn tại qua tải lại trang. Với tài khoản đã bật autosync, lịch sẽ tiếp tục vào khung giờ hợp lệ sau reset. Nếu chưa chọn kết nối save của tài khoản mới, dùng Upload/Load khi quota khả dụng trở lại.
- `Cloud save is too large`: payload vượt giới hạn nhỏ gọn; save local giữ nguyên; không chia chunk và không tự xóa dữ liệu.
- `Network offline or unavailable`: kết nối bị gián đoạn; local vẫn chơi/lưu bình thường và thử lại ở lịch tiếp theo. Lỗi quyền hoặc revision được báo riêng; không tự ghi đè cloud khác thiết bị.

**Backup khi Firebase hết quota hoặc không có kết nối Cloud:**

1. Mở **Cloud Account** → **Emergency Backup Code** → **Copy Backup Code**. Nếu trình duyệt không cho ghi clipboard, mã hiện trong ô văn bản và được chọn để bạn tự sao chép (Ctrl+C).
2. Dán mã vào một file văn bản hoặc lưu trên thiết bị đáng tin cậy. Không chia sẻ công khai vì mã chứa tiến trình game. Không cần đăng nhập để thực hiện.
3. Để phục hồi, tắt Auto-Roll, thoát trận đấu đang diễn ra, dán toàn bộ mã vào ô **Backup code** rồi bấm **Restore from Code**. Game kiểm tra định dạng, checksum, dữ liệu từng store; yêu cầu xác nhận trước khi thay thế. Bản save hiện tại được giữ thêm trong IndexedDB cục bộ trước khi ghi; nếu dữ liệu sai hoặc lưu thất bại, không thay thế tiến trình hiện tại.
4. Sau khi khôi phục, trang tải lại để các module đọc save mới. Nếu hoàn toàn mất mạng và trang không tải lại được, dữ liệu đã nằm trong localStorage; mở lại trang khi có mạng. Không tự upload bản restore lên cloud; hãy chọn Upload Local Save khi muốn đồng bộ. Voyage và thiết lập Sailing Sea không nằm trong mã và không bị thay đổi.

## 5. Kiểm tra và cài đặt

Kết quả kiểm thử mô phỏng, không phát sinh truy cập tới Firebase thật:

- Giả lập 9 giờ, 19.800 sự kiện dirty (2.200/giờ): **9 lượt ghi, 0 lượt đọc save, 0 lượt xóa**; không có thao tác ngay từ tick/roll. Thêm ba giờ thay đổi clock không tạo yêu cầu mạng.
- Chromium với 247 card, 3.705 biến thể: dữ liệu main chưa rút gọn khoảng 618 KB, mã nén khoảng **30.546 byte**, toàn bộ số lượng/mutation giữ nguyên sau restore. Hồ sơ mẫu nhỏ dùng khoảng 8,6 KB.
- Kiểm tra upload thủ công, chặn 10 giây, trạng thái Already up to date, quota reset, không truy cập khi Sailing Sea mở, backup lỗi bị từ chối, restore code và manifest cũ, bảo toàn voyage, và lưu điểm Auto Chess/Infinity theo định dạng tương thích. Không có lỗi runtime trong các kiểm thử trình duyệt này.

Cài đặt:

1. Sao lưu thư mục game/bản save. Giải nén ZIP vào thư mục game hiện tại, ghi đè các file trùng tên. Chép thêm `cloud_save_codec.js`. Không có assets trong ZIP.
2. **Quan trọng:** cập nhật `firestore.rules` trong dự án Firebase. Dùng Firebase Console → Firestore Database → Rules và Publish nội dung file mới, hoặc chạy `firebase deploy --only firestore:rules` trong thư mục dự án đã chọn đúng project. Rules mới chỉ cho ghi payload đơn ≤90.000 byte, cho đọc chunk cũ nhưng cấm ghi/xóa chunk và recovery; giữ điều kiện chủ tài khoản/revision. Đồng thời chấp nhận codec replay phẳng và trường số trận Auto Chess đã có. Mình chưa triển khai rules lên Firebase thật.
3. Hard reload (Ctrl + F5) trên tất cả thiết bị/tab còn chạy bản cũ, nhất là tab Auto-Roll để qua đêm. Đóng các tab game cũ trước khi bật lại Auto-Roll. Verify Usage sau một giờ hoặc qua đêm; các lượt đọc leaderboard theo yêu cầu của người chơi và lưu thủ công sẽ được tính riêng.

Tài liệu chính thức: [Firestore usage & limits (reset theo Pacific)](https://firebase.google.com/docs/firestore/quotas), [Firestore REST API](https://firebase.google.com/docs/firestore/use-rest-api).

File trong patch: `app.js`, `firebase.js`, `cloud_save_codec.js`, `index.html`, `styles.css`, `autochess_online.js`, `autochess_ranked.js`, `autochess.css`, `infinity.js`, `infinity_cloud.js`, `leaderboard.js`, `firestore.rules`, `README.md`. Các module Sailing Sea và PvP đã được kiểm tra; bản thân các module này không thực hiện ghi/đọc Firestore nên không cần thay đổi.
