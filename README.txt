ANIME CARD RNG — BẢN VÁ GIAO DIỆN CHIẾN ĐẤU
Phiên bản: 20261125-arena-readability-1

Battle Log
• Nhật ký tự giãn dưới đội hình và tách thành Player / Own Log và
  Enemy Log. Hai cột đặt cạnh nhau trên màn hình rộng và xếp dọc ở
  chiều rộng từ 768 px trở xuống. Mỗi bên cuộn độc lập.
• Hành động được ghi theo bên thực hiện, kể cả phản đòn, hồi máu,
  né đòn và sát thương theo lượt. Ví dụ: Bleed gây bởi đội người
  chơi vẫn nằm trong Player / Own Log khi nó phát tác ở lượt địch.
  Thông báo chung của trận xuất hiện ở phía người chơi.
• Giữ cách tô màu từ khóa và làm nổi số sát thương. Dòng nhật ký
  tiếp tục hiển thị dưới dạng văn bản, không thực thi mã HTML.

Mutation
• Tất cả mutation, gồm cả Eclipsed và Colossal, có màu riêng. Thẻ
  có một mutation dùng màu đồng nhất cho tên và viền. Thẻ có hai
  mutation chuyển màu ngang trên tên và chuyển màu chéo trên viền.
• Áp dụng trong Summon, Card Index, Card Details, ô chọn đội và võ
  đài. Card Index dùng biến thể đã sở hữu có bậc mutation cao nhất;
  Card Details theo biến thể đang chọn. Không đổi tỉ lệ quay, chỉ
  số, điều kiện thời tiết hoặc màu viền bậc hiếm bên ngoài.

Hiệu ứng trong trận
• Rê chuột, dùng bàn phím hoặc chạm vào huy hiệu để mở bảng hiệu
  ứng riêng. Chạm lại, chạm ra ngoài hoặc nhấn Esc để đóng. Huy
  hiệu nội tại của thẻ vẫn mở mô tả nội tại như trước.
• Bảng Bleed, Burn và Poison cho biết tổng sát thương mỗi lượt,
  nguồn, thời gian còn lại của từng nhóm cộng dồn và giá trị trước
  khi trừ khiên hoặc chuyển hướng sát thương. Bleed ghi rõ chặn
  toàn bộ hồi máu từ mọi nguồn. Bảng khiên và hiệu ứng khác hiển
  thị giá trị và thời hạn khi cơ chế có bộ đếm.
• Poison dùng xanh lục đậm trong huy hiệu, bảng thông tin và nhật
  ký, dễ phân biệt với Bleed đỏ và Burn cam.

Cài đặt
1. Giải nén vào thư mục game có index.html. Ghi đè các tệp trùng
   tên và đặt arena_status_view.js cạnh battle_log_view.js.
2. Giữ nguyên assets và dữ liệu lưu. Mở lại game, nhấn Ctrl + F5
   để tải các tệp giao diện và mô-đun chiến đấu mới.
