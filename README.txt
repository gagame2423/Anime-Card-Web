BẢN VÁ AUTO CHESS — ĐỒNG BỘ TRẬN PEERJS
Phiên bản: 20261119-ac-peer-state-1
Ngày cập nhật: 19/11/2026

1. VÌ SAO NGƯỜI THAM GIA CÓ THỂ RỚT TRƯỚC VÒNG QUÁI

Bản cũ gửi ảnh chụp trạng thái qua nhiều lớp cắt gói, ghép gói và giới hạn
kích thước. Một gói có thể bị bỏ mà máy kia không nhận được thông báo. Ngoài
ra, lỗi gửi dữ liệu từng bị xử lý như đóng kết nối. Với liên kết relay chậm
hoặc chập chờn, người tham gia có thể bỏ lỡ trạng thái chuyển từ vòng chọn
thẻ sang Chuẩn bị hoặc vòng Quái Trung Lập đầu tiên. Thiếu gói cập nhật hay
tín hiệu định kỳ cũng từng bị dùng làm lý do chuyển ghế sang AI.

2. KIẾN TRÚC MỚI

- Máy chủ phòng quyết định vòng, pha, mã pha, thời điểm kết thúc đếm giờ
  và toàn bộ kết quả. Mỗi lần đổi pha gửi một FULL_SYNC gồm bàn đấu, hàng
  chờ, thẻ, vật phẩm với đúng chỉ số đã quay, lõi, trạng thái vòng chọn thẻ
  và dữ liệu báo cáo. Hành động hợp lệ được cập nhật ngay qua STATE với
  mã phiên bản gốc; máy con thiếu bản gốc sẽ yêu cầu lại FULL_SYNC.
- Khi bắt đầu đánh, máy chủ tự đưa thẻ từ hàng chờ lên các ô còn trống trong
  giới hạn đội hình, chốt cặp đấu và hạt giống ngẫu nhiên, rồi công bố pha
  Chiến đấu trong cùng một lần cập nhật. Không cần chờ xác nhận từ máy con.
  Máy con phát lại trận từ đội hình đã chốt; tiến độ phát lại không quyết
  định kết quả. Nút Ready được đặt lại mỗi pha Chuẩn bị, kể cả sau vòng quái.
- Mỗi thông điệp là một tài liệu JSON trên kênh PeerJS tin cậy, có thứ tự.
  Bộ mã hóa BinaryPack của PeerJS xử lý việc chia gói ở lớp truyền tải.
  Auto Chess không còn giới hạn byte, giới hạn số mảnh hay tự bỏ ảnh
  chụp/vật phẩm/báo cáo vì vượt kích thước.
- Hai phía gửi tín hiệu duy trì mỗi 5 giây. Im lặng hoặc mất máy chủ báo
  hiệu không tự động đổi ghế sang AI nếu kênh dữ liệu vẫn mở. Ghế chỉ được
  giao cho AI sau 60 giây mất kênh dữ liệu liên tục; liên kết phục hồi trước
  thời hạn sẽ giữ nguyên trạng thái người chơi. Nếu ghế đã giao cho AI,
  người giữ đúng ghế vẫn có thể kết nối lại và tiếp quản đội hình hiện tại.
- Khi một liên kết được phục hồi, hoặc người tham gia bắt tay lại, máy chủ
  gửi FULL_SYNC mới. Ngay cả khi gói Start bị lỡ, máy chủ vẫn nhận ra ghế
  cũ và gửi lại thông tin trận đang diễn ra. Nút “Resync / Reconnect” trên
  thanh trận gửi yêu cầu đồng bộ lại; khi liên kết đã mất, nút thử nối lại
  trước. Nút này dùng được trên điện thoại.
- Trận trực tiếp không đọc hoặc ghi Firestore để chạy các pha. Dữ liệu đối
  thủ phát lại đã có trong bộ nhớ đệm vẫn dùng được; công bố kết quả cuối
  trận và bảng xếp hạng tiếp tục theo luồng đám mây hiện có. Không đổi luật
  Firestore, cấu hình tài khoản, tài nguyên hay dữ liệu lưu cũ.

3. CHỌN CHẾ ĐỘ KẾT NỐI

- “Online Relay” (mặc định, mã AC-) dành cho người chơi ở mạng khác nhau.
  Giữ toàn bộ máy chủ STUN và Metered TURN có sẵn của trang. Trình duyệt
  được phép chọn đường trực tiếp; nếu cần TURN, lưu lượng dùng relay.
- “LAN / Direct Wi-Fi” (mã AL-) dành cho thiết bị trên cùng mạng Wi-Fi.
  Chỉ dùng ứng viên kết nối trực tiếp và một máy chủ STUN, không dùng TURN.
  Chế độ này vẫn cần dịch vụ báo hiệu PeerJS để bắt tay; không phải chế độ
  chơi hoàn toàn ngoại tuyến.
- Người tham gia nhập mã do chủ phòng chia sẻ; tiền tố tự chọn đúng chế độ.
  Nếu LAN chưa nối được sau khoảng 6 giây, hãy thử “Switch to Online Relay”.
  Chủ phòng đổi trước rồi chia sẻ mã AC- mới; đổi chế độ chỉ làm ngoài trận.
- Tự kết nối lại áp dụng khi trận và thẻ trình duyệt vẫn còn mở ở máy chủ.
  Nếu chủ phòng tải lại trang hoặc đóng thẻ, cần tạo phòng và trận mới.
  Người tham gia đóng trang hoặc nhấn F5 cũng sẽ trở về sảnh khi mở lại;
  bản vá không khôi phục trận từ dữ liệu lưu.

4. CÀI ĐẶT

1. Áp dụng trên bản game đã có bản vá trước về phục hồi Co-op và chế độ
   LAN/Relay. Giải nén vào thư mục chứa index.html, rồi chọn ghi đè các
   tệp bên dưới. Giữ nguyên thư mục assets/ và các tệp còn lại.
2. Nếu chơi trên trang đã triển khai, đăng cùng lúc toàn bộ tệp trong bản
   vá. Cả chủ phòng và người tham gia phải dùng cùng phiên bản.
3. Trên cả hai thiết bị, tải lại bằng Ctrl + F5. Trên điện thoại, tải lại
   sau khi xóa bộ nhớ đệm của trang nếu trình duyệt vẫn dùng bản cũ.
4. Chủ phòng mở Auto Chess, chọn chế độ, chia sẻ mã và đợi người tham gia
   hiện trong sảnh rồi nhấn START.
5. Giữ cấu hình TURN đang dùng trong online_utils.js. Bản vá không cấp
   thông tin TURN mới. Nếu trang báo chưa cấu hình TURN, người quản trị
   cần dùng cấu hình Metered của trang để kết nối qua relay.

5. TỆP TRONG BẢN VÁ

- autochess_online.js — kênh PeerJS, giữ ghế, bắt tay lại và chọn LAN/Relay.
- autochess_live.js — đồng bộ pha, FULL_SYNC, cập nhật hành động và đồng hồ.
- autochess.js — danh sách ghế Ready và kiểm tra trạng thái trận.
- autochess_combat.js — chốt đội hình và vào chiến đấu trong cùng lần cập nhật.
- autochess_lobby.js — nhãn chọn kết nối và trạng thái tham gia.
- autochess_view.js, autochess.css — nút đồng bộ lại, trạng thái HUD và bố cục.
- firebase.js — tạm hoãn đồng bộ hồ sơ khi Auto Chess đang mở.
- online_utils.js — thông báo tiếng Anh khi chưa cấu hình TURN.
- index.html — đổi phiên bản tải tệp để tránh dùng mã cũ trong bộ nhớ đệm.
- README.txt — nội dung thay đổi và hướng dẫn cài đặt.

6. ĐÃ KIỂM TRA

- Hai người đi qua vòng chọn thẻ, vòng Quái Trung Lập và pha Chuẩn bị tiếp
  theo; trạng thái Ready, đội hình, vật phẩm, lõi và kết quả trùng nhau.
  Cũng đã thử nút đồng bộ lại trên bố cục điện thoại và khôi phục vòng quái
  khi một tiến trình mô phỏng chiến đấu bị treo.
- Mô phỏng mất gói Start, mất gói chuyển pha, mất bản cập nhật hành động
  và đứt liên kết. Ảnh chụp UTF-8 trên 400 KB được nhận đầy đủ. Thử khoảng
  chờ 60 giây và lấy lại đúng ghế, kể cả sau khi AI tiếp quản.
- Thử trận tám người đến cuối trận: chỉ có một người thắng, mỗi người
  nhận thưởng một lần và không đọc Firestore trong trận trực tiếp.
- Kiểm thử trình duyệt dùng liên kết PeerJS mô phỏng; đã kiểm tra cấu hình
  ICE cho cả hai chế độ. Chưa kiểm tra đường truyền Metered TURN giữa hai
  mạng Internet thực.
