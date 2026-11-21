ANIME CARD RNG — BẢN VÁ LỖI COMBAT
Phiên bản: 20261121-combat-hotfix-1

Nguyên nhân
• Khi Jason 13th dùng đòn phóng lao, hàm primary trong passives.js đọc
  options dù không nhận tham số này. Lỗi “ReferenceError: options is not
  defined” có thể xảy ra trong cả Combat chính và Auto Chess.
• Dòng 182 của autochess_combat.js trong bản cũ là nơi chuyển tiếp lỗi
  từ mô phỏng trận đấu. Đây không phải là một lỗi khai báo riêng
  trong Auto Chess.

Bản sửa
• Hook phóng lao nhận tùy chọn hợp lệ và vẫn hoạt động khi bên gọi không
  truyền tùy chọn. Các điểm vào chiến đấu và hook nội tại cũng xử lý
  giá trị thiếu hoặc null.
• Đưa kiểm tra chặn đòn Adventure Sword về đúng hàm xử lý. Đòn bị chặn
  không gây Bleed hay Stun. Nếu Jake chặn thay đồng đội, hiệu ứng trúng
  đòn của Finn áp lên đúng mục tiêu đã nhận đòn.
• Trang chính và Web Worker của Auto Chess cùng tải phiên bản mới của
  ba mô-đun đã sửa. Giữ nguyên bố cục Summon và cách quay từng lượt.

Kiểm tra
• Chạy 247 thẻ trong Combat chính và Auto Chess. Kiểm tra riêng đòn phóng
  lao khi Jason đang mượn nội tại, các thẻ Cartoon và Hextech, cùng
  kết quả mô phỏng chạy trực tiếp so với Web Worker.

Cài đặt
1. Giải nén vào thư mục gốc của game, ghi đè autochess_combat.js,
   passives.js, content_passives.js và index.html. Giữ nguyên các tệp
   khác, thư mục assets và dữ liệu lưu.
2. Mở lại game, nhấn Ctrl + F5. Nếu chơi cùng bạn bè, hãy cập nhật
   và tải lại trên cả máy Host và Guest trước khi tạo phòng mới.
