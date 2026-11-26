# Update 34.5.1 — Standard Battle Hotfix

Bản vá dành cho phiên bản Update 34.5 đã có chế độ Ball vs Ball. Tập trung vào giao diện chiến đấu thường (Standard Battle), trạng thái nội tại và quá trình chuyển lượt. Không cần cài thêm hình ảnh, phông chữ hay âm thanh.

## 1. Sửa giao diện nội tại Naruto x Sasuke (Datebayo)

**Nguyên nhân:** giao diện Arena lấy tối đa năm huy hiệu nội tại rồi loại bỏ những huy hiệu có kiểu passive nhưng không có trường phân loại. Datebayo và nhiều bộ đếm/trạng thái nội tại khác thực sự nằm trong nhóm bị loại bỏ này. Ngoài ra, khi cấu trúc giao diện bị làm mới, bộ nhớ đệm của phần hiển thị nội tại có thể tiếp tục giữ tham chiếu đến các phần tử đã bị tách khỏi DOM.

**Cách sửa:**

- Đọc toàn bộ các huy hiệu của nội tại từ hệ thống chiến đấu, chỉ bỏ các huy hiệu tên nội tại hoặc lịch sử kích hoạt đã được hiển thị ở nơi khác.
- Khôi phục khung Datebayo trong thẻ đấu, với hai ô Naruto và Sasuke; chế độ đang hoạt động được tô vàng. Bấm hoặc chạm khung để xem giải thích, số lần tấn công chính, số Clone còn sống và mục tiêu hiện tại.
- Giữ nguyên luật gốc của nội tại: hệ thống tự chọn Naruto hoặc Sasuke với xác suất 50/50 khi đổi sang đối thủ đang hoạt động mới. Hai ô hiển thị là chỉ báo kết quả, không phải nút cho phép tự chọn chế độ. Bộ đếm tấn công vẫn được giữ khi đổi đối thủ.
- Không làm lại nút hoặc tooltip khi chỉ có số liệu thay đổi. Nếu giao diện bị dựng lại, các phần tử nội tại sẽ được kết nối lại với vùng hiển thị hợp lệ.

## 2. Sửa bảng lượt bị trống khi Stun hoặc không thể tấn công

**Nguyên nhân:** hàm xử lý lượt đã bỏ qua đòn tấn công khi gặp khống chế, giảm số lượt trạng thái rồi đổi sang phía đối phương. Bộ lập lịch cập nhật dòng đếm ngược của lượt tiếp theo ngay lập tức, nhưng không có dữ liệu riêng lưu lý do bỏ lượt. Vì vậy trạng thái cuối cùng (ví dụ Stun 1 lượt) có thể biến mất khỏi thẻ và giao diện không còn thông tin giải thích vì sao lượt vừa qua không tấn công.

**Cách sửa:**

- Lưu một bản ghi riêng cho lượt vừa xử lý: phía Player/Enemy, tên đơn vị, trạng thái và lý do. Dữ liệu được ghi trước khi đổi lượt và không dùng để tính lại sát thương.
- Thêm dải trạng thái lượt riêng biệt bên dưới tiêu đề trận. Khi bị khống chế, hiển thị **Unable to attack**, lý do cụ thể và nhãn **SKIPPED**. Dòng đếm ngược trên đầu vẫn cho biết lượt tiếp theo.
- Hiển thị các trạng thái chờ, nạp kỹ năng, đánh trượt và hoàn tất lượt. Dải thông tin được ẩn khi kết thúc trận hoặc quay lại màn thiết lập.
- Hỗ trợ Stun, Freeze, biến thành ốc sên, Hypnosis làm bỏ lượt, thời gian hồi kỹ thuật của Itachi, Godspeed, Dimensional Domain và Rigby nghỉ hồi máu. Các dạng Hypnosis đổi mục tiêu vẫn theo logic gốc, không bị chuyển thành khống chế bỏ lượt.
- Sửa trường hợp lượt cuối của biến thành ốc sên: không tấn công trước khi trạng thái hết hạn.
- Trong lượt bị Dimensional Domain khóa, các hiệu ứng trạng thái của Standard Battle vẫn được xử lý đúng theo lượt. Không tạo thêm một vòng lặp chiến đấu.
- Giữ ngoại lệ gốc của Jaw Titan đối với Stun. Freeze vẫn có thể khiến Jaw Titan bỏ lượt.

## 3. Kiểm tra các nội tại, lựa chọn và hook giao diện

| Nhóm | Điều chỉnh |
| --- | --- |
| Aqua — Useless | Giữ nút radio chọn Team HP (+50%) hoặc Rewards (+50% phần thưởng đủ điều kiện) trước khi bắt đầu. Thêm chỉ báo lựa chọn thật đã được áp dụng trong trận; Aqua của địch vẫn tự chọn bằng RNG. |
| Datebayo, Systems, Heavenly Restriction | Khôi phục thông tin chế độ Naruto/Sasuke, bonus của Sung Jin Woo và vũ khí của Toji. |
| The Clown, Kuuga, Demon Asta, War Hammer Titan | Hiển thị chế độ/vũ khí/dạng biến hình hiện tại, cập nhật trực tiếp theo nội tại. |
| Regular Show, Adventure Sword | Hiển thị Mordecai/Rigby/Serious Mode và thanh kiếm tiếp theo của Finn. Không thay đổi cách nội tại tự chuyển chế độ. |
| Zetsu, Rinnegan của Pain | Hiển thị White/Black và Path hiện tại, kèm tiến độ tích lũy của Deva. |
| Sasori, Calamity, Tohth | Khôi phục thông tin đồng đội được chọn bảo vệ/điều khiển và đối thủ bị đánh dấu. |
| Domain / thức tỉnh / bộ đếm | Giữ lại huy hiệu gốc từ các module như Pennywise (Deadlights, số lần hồi sinh), Kaguya, Jogo, Sukuna, Kisame, Majin Buu (Candy/Form), các bộ đếm của Seven Deadly Sins và những nội tại khác trước đây bị bộ lọc loại bỏ. |
| Tooltip và trạng thái | Dùng khóa ổn định cho mỗi huy hiệu, cập nhật nội dung mà không làm mất nút đang được kiểm tra. Giữ hệ thống tooltip riêng cho hiệu ứng trạng thái và hai cột Battle Log. |
| Kết quả trận | Dùng ID chuẩn battleVictory cho Victory/Defeat, thay cho ID dự phòng cũ không tồn tại trong HTML. |

Đã đối chiếu các module akatsuki_passives.js, sins_passives.js, spooky_passives.js, titan_passives.js, dragon_skills.js, requiem.js, shibuya.js, spatial_combat.js, turn_phase.js và passives.js với index.html và các hook thực tế trong app.js. Các module nội tại trên xử lý cơ chế bằng dữ liệu/hàm chiến đấu, không tự điều khiển nút HTML; Aqua là lựa chọn nội tại thủ công trước trận tìm thấy trong luồng Standard Battle. Các chế độ, chọn mục tiêu, Domain và thức tỉnh tự động vẫn do hệ thống nội tại quyết định. Không biến những cơ chế tự động ấy thành lựa chọn thủ công.

Các ID cũ còn sử dụng được giữ nguyên, bao gồm aquaBattleChoice, aquaBattleMode, các vùng nội tại Player/Enemy, battleStatus và battleVictory. Các tooltip được tạo động vẫn được khởi tạo đúng. Không phát hiện ID HTML bị trùng hoặc đường dẫn script cục bộ bị thiếu.

## 4. Kết quả kiểm tra

- Kiểm tra cú pháp JavaScript trong các tệp sửa đổi.
- Chạy toàn bộ 247 thẻ trong danh mục hiện tại, mỗi thẻ có một trận kiểm tra 1v1 và một trận 4v4: 494 kịch bản, tổng cộng 11.805 lượt xử lý, trong đó 1.220 lượt được ghi nhận bỏ qua. Kiểm tra HP/ATK, trạng thái, dữ liệu tooltip, huy hiệu, chế độ đang chọn và quá trình chuyển lượt. Không phát hiện lỗi JavaScript trong bộ kiểm tra.
- Kiểm tra riêng cả hai nhánh Datebayo, đổi mục tiêu mà không mất bộ đếm, hai lựa chọn Aqua (HP thực tế và phần thưởng thực tế), Hypnosis, Itachi cooldown, Godspeed, Snail, Freeze kết hợp Domain, Rigby nghỉ hồi máu, ngoại lệ Stun của Jaw Titan.
- Kiểm tra giao diện trên Chromium ở 1440×900, 390×844 và 844×390: chọn thẻ, bắt đầu trận, xem Datebayo, tooltip, lượt bỏ qua của cả hai phía, chuyển lượt tiếp theo, Defeat, Victory và thiết lập Aqua. Các bài kiểm tra đều hoàn thành.
- Kiểm tra hồi quy Ball vs Ball: Equinox cả hai nhánh, Kuuga, Demon Asta, Goku, hiệu ứng AoE, Pennywise, Kaguya, Gumball 9 mạng, Requiem, thời gian nội tại và các hook âm thanh đã có.
- Kiểm tra hồi quy Auto Chess: kết quả giao tranh giữa mô phỏng chính và worker, ba kiểu AoE và Energy.

Các kiểm tra trên chạy với dữ liệu cục bộ và hình ảnh mô phỏng thay cho tài nguyên ảnh của game. Đây là bộ kiểm tra hồi quy rộng và các trường hợp có kiểm soát, không phải chứng minh tất cả tổ hợp RNG, đội hình, Mutation và Relic đều đã được thử.

## 5. Danh sách tệp trong patch

| Tệp | Nội dung |
| --- | --- |
| index.html | Thêm dải thông tin lượt, sửa trình bày lựa chọn Aqua, đăng ký renderer mới và cập nhật phiên bản tải tệp. |
| game-ui.css | Bố cục lượt, chế độ nội tại, nhãn bỏ lượt và lựa chọn Aqua trên máy tính/điện thoại. |
| arena_turn_view.js | Tệp mới: hiển thị dữ liệu lượt đã xử lý, độc lập với bộ lập lịch. |
| arena_status_view.js | Khôi phục huy hiệu nội tại và chỉ báo chế độ, giữ tooltip ổn định. |
| turn_phase.js | Lưu kết quả lượt và lý do bỏ lượt cho Standard Battle. |
| passives.js | Ghi kết quả xử lý lượt, khôi phục dữ liệu hiển thị nội tại và sửa các trường hợp khống chế nêu trên. |
| app.js | Kết nối các renderer với vòng lặp Arena, thiết lập lại giao diện và kết quả trận. |
| autochess_combat.js | Chỉ đồng bộ phiên bản tải passives.js và turn_phase.js trong worker; không đổi thuật toán giao tranh Auto Chess. |
| README.md | Hướng dẫn và kết quả kiểm tra. |

## 6. Cách cài đặt

1. Sao lưu thư mục game đang dùng (Update 34.5).
2. Giải nén patch ZIP, chép toàn bộ tệp bên trong vào thư mục game (nơi có index.html). Chọn ghi đè các tệp trùng tên; thêm arena_turn_view.js nếu chưa có.
3. Nếu game chạy trên web, tải lên đầy đủ các tệp vừa thay đổi rồi mở lại trang. Trên máy tính nhấn Ctrl + F5 để tải lại tệp mới; trên điện thoại đóng trang rồi mở lại sau khi xóa cache trang nếu cần.
4. Vào Arena, thử 1v1 với Naruto x Sasuke. Kiểm tra Datebayo và dòng SKIPPED khi gặp Stun. Thử Aqua với mỗi lựa chọn và chơi lại một trận Ball vs Ball hoặc Auto Chess.

Không xóa save, localStorage hoặc thư mục assets. Patch không chứa tệp không thay đổi, không thay thế danh mục thẻ và không yêu cầu thêm tài nguyên.
