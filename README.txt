NHẬT KÝ CẬP NHẬT 06/11/2026
SỬA CẤP TIẾN HÓA, SẮP XẾP INDEX, ELEMENT RAID VÀ RELIC FUSION

1. Cấp thẻ tiến hóa mới
- Cả 11 công thức tạo thẻ tiến hóa chưa mở khóa ở cấp 1, EXP 0, thay cho cấp 100.
- Yêu cầu thẻ gốc cấp 100 và nguyên liệu của từng công thức được giữ nguyên.
- Giữ đúng Mutation đang chọn, gồm Normal, Mutation đơn hoặc Mutation kép; chỉ tiêu đúng bản sao được chọn.
- Evolve Unit xem trước chỉ số cấp 1 của kết quả và thông báo đúng cấp sau khi tiến hóa.
- Không hạ cấp hoặc xóa tiến trình của những thẻ tiến hóa đã có trong save. Giữ giới hạn cấp tối đa 100 và công thức EXP hiện tại.

2. Thứ tự Card Index
- Thẻ chance: 0 luôn nằm sau toàn bộ thẻ có tỷ lệ roll, kể cả khi chọn DAMAGE, HP, RARITY hoặc LEVEL.
- Trong từng nhóm vẫn dùng tiêu chí đang chọn. RARITY sắp mẫu số 1 in X từ cao xuống thấp cho các thẻ có thể roll.
- Giữ tìm kiếm, lọc nhiều Category/Element/Rarity và phân trang. Không đổi tỷ lệ roll hoặc nguồn nhận thẻ độc quyền.

3. Đồng bộ Element địch theo Raid
- Marine Ford / Marine Fort Raid: cả 10 địch dùng Water.
- Holy Grail Raid: cả 10 địch dùng Holy.
- Shibuya Raid: cả 10 địch dùng Fire.
- Akatsuki Raid: cả 10 địch dùng Dark.
- Chỉ ghi đè Element trên bản sao dữ liệu của địch trong Raid và phần xem trước. Không thay Element gốc trong cards.js.
- Giữ tên, ảnh, nội tại, khoảng HP/ATK, tăng độ khó, Coins và phần thưởng hiện có. Tiêu đề xem trước hiển thị Element của đội địch.

4. Relic Fusion trong Storage
- Thêm nút Fuse ngay trên Equip Relic ở bảng chi tiết của tab Relic.
- Nhấn Fuse để vào chế độ chọn nguyên liệu. Kho đồ chỉ hiện cùng loại Relic và cùng độ hiếm với Relic gốc; ví dụ Nail Common không trộn với Bomb Common hoặc Nail Rare.
- Các bản cùng loại/độ hiếm có thể có chỉ số và Element đã roll khác nhau. Mỗi bản riêng biệt chỉ được chọn một lần.
- Relic gốc tự được chọn và luôn nằm trong số nguyên liệu yêu cầu. Bộ đếm Selected hiển thị số đã chọn trên số cần; nút Fuse chỉ bật khi đủ chính xác.
- Common → Rare: 10 Common cùng loại.
- Rare → Legendary thường: 10 Rare cùng loại. Kết quả thành công không có Unique.
- Legendary thường → Legendary Unique: 5 Legendary thường cùng loại.
- Legendary đã có Unique không được dùng làm nguyên liệu và không thể làm Relic gốc cho một lần Fuse mới.
- Lựa chọn được giữ khi chuyển trang và tìm kiếm trong nhóm phù hợp. Bán nhiều vật phẩm, bán lẻ và Equip được tắt trong lúc chọn Fuse.
- Cancel Fusion hoặc đổi tab hủy lựa chọn, không tiêu vật phẩm. Hủy sẽ khôi phục lựa chọn/tìm kiếm/trang trước đó.

5. Xác nhận, RNG và kết quả
- Tất cả ba bậc đều có đúng 50% thành công và 50% thất bại, theo yêu cầu đã xác nhận.
- Nhấn Fuse khi đủ nguyên liệu mở hộp thoại Confirm / Decline, nêu số bản sẽ tiêu, bậc kết quả và tỷ lệ 50%.
- Decline, X hoặc Escape đóng xác nhận và giữ lựa chọn; chưa tiêu bất kỳ nguyên liệu nào.
- Confirm mới thực hiện RNG và giao dịch Kho đồ.
- Thành công: tiêu toàn bộ nguyên liệu đã chọn, nhận đúng 1 Relic ở bậc đích với chỉ số và Element phù hợp được roll mới. Unique có giá trị số cụ thể được lưu cố định.
- Thất bại: tiêu toàn bộ nguyên liệu đã chọn, không nhận vật phẩm, tiền hoặc phần thưởng bù. Việc mất nguyên liệu vẫn được lưu sau khi tải lại.
- Hộp thoại kết quả thành công hiển thị tên, ảnh, độ hiếm và các chỉ số mới; thất bại hiển thị rõ không nhận vật phẩm.
- Relic đang trang bị có thể được chọn. Xác nhận cho biết số bản đang trang bị; khi bị tiêu, liên kết trang bị được gỡ. Kết quả mới ở trạng thái chưa trang bị.
- Tiêu nguyên liệu và thêm kết quả trong cùng một giao dịch Kho đồ. Lỗi ghi dữ liệu hủy giao dịch và giữ nguyên nguyên liệu; khác với một lượt RNG thất bại hợp lệ.
- Kiểm tra lại vật phẩm trước khi ghi, chặn ID trùng, chọn thiếu/thừa, sai loại/độ hiếm và gửi lại một lượt Fuse đã hoàn tất.
- Giữ xác suất crafting cũ 70% Common / 25% Rare / 5% Legendary và 10% Unique khi crafting Legendary. Fusion dùng quy tắc riêng, không đổi cơ chế crafting đó.

6. Kiểm tra và phát hành
- Kiểm tra cú pháp toàn bộ 75 tệp JavaScript, đường dẫn script đúng chữ hoa/thường, ID DOM không trùng và nhãn cache đồng nhất.
- 52 kiểm tra cơ chế/giao dịch chạy qua: 11 tiến hóa cấp 1, giữ Mutation, không reset cấp đã có, bốn kiểu Index sort, bốn Raid, cả ba bậc Fusion cho đủ bảy loại Relic, thất bại/mất toàn bộ, giới hạn chọn, ràng buộc trang bị, lỗi lưu, chặn gửi trùng và biên RNG 50%.
- Đối chiếu 700 kết quả roll crafting có seed với bản trước: trùng hoàn toàn.
- Kiểm tra giao diện chọn qua nhiều trang, Confirm/Decline, Escape, kết quả thành công/thất bại, hủy chế độ Fuse và khôi phục Kho đồ sau tải lại trên máy tính/điện thoại.
- Giữ nguyên cards.js, chỉ số thẻ đã cân bằng, mã combat/nội tại, các chế độ ngoài thay đổi Element Raid, Firebase, PvP, TURN/STUN, Ramen Bowl 10.000 EXP và hệ thống mua số lượng lớn.
- Nhãn cache mới: 20261106-relic-fusion-1. Thay đầy đủ mã nguồn, giữ assets hiện có rồi tải lại bằng Ctrl+F5.
- Không tạo tệp ảnh/tài nguyên nhị phân hoặc Excel. Gói phát hành gồm đầy đủ mã nguồn và nhật ký này.

Modified Files Note
- evolution.js: kết quả các công thức và xem trước tiến hóa ở cấp 1.
- index_filters.js: đưa chance: 0 xuống cuối và dùng chung bộ so sánh cho các nhóm thẻ.
- raid.js: ánh xạ Element cho bốn Raid, ghi đè trên dữ liệu địch/xem trước của riêng Raid.
- relics.js: roll theo bậc bắt buộc cho Fusion, quy tắc 10/10/5, tỷ lệ 50/50, kiểm tra chọn và giao dịch nguyên tử; giữ roll crafting cũ.
- relic_fusion.js (mới): chế độ chọn, bộ đếm, xác nhận, kết quả, điều khiển focus và hủy an toàn.
- storage.js: nút Fuse, lọc nguyên liệu, chọn qua nhiều trang, tách khỏi thao tác bán/trang bị và thông tin nguồn Fusion.
- app.js: nối Fusion với Storage, đóng modal đúng thứ tự, thông báo cấp tiến hóa và Element Raid; thứ tự Index ưu tiên nhóm có thể roll.
- index.html: điều khiển Fuse, hộp thoại xác nhận/kết quả, tải mô-đun mới và nhãn cache.
- styles.css: nút Fuse, dấu chọn, bộ đếm và hộp thoại phù hợp máy tính/điện thoại.
- startup.js: kiểm tra mô-đun và giao diện Fusion khi khởi động.
- README.txt: chỉ giữ nhật ký của bản cập nhật này.
