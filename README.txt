NHẬT KÝ CẬP NHẬT HIỆU NĂNG VÀ TIỆN ÍCH — 21/10/2026
Phiên bản: 20261021-performance-qol-1

1. TỐI ƯU WEATHER VÀ MUTATION

- Cache danh sách weather đang hoạt động, thứ tự thời gian hết hạn và tổng bonus theo chỉ số. Chỉ dựng lại khi weather hoặc thời hạn thay đổi; loại weather hết hạn trước khi tính bonus/roll.
- MutationSystem cache tập ứng viên và xác suất, tái sử dụng bộ đệm trộn thứ tự, cache hệ số HP/ATK. Không cache kết quả ngẫu nhiên.
- Giữ nguyên cơ chế thử độc lập: Common 10%, Uncommon 5%, Rare 2,5%; xác suất mỗi mutation sau hệ số trang bị không quá 25%. Mỗi kết quả roll có tối đa 2 mutation.
- Đã đối chiếu 42.000 lượt roll có seed giữa bản trước và bản mới: kết quả và số lần tiêu thụ RNG khớp nhau. Các mutation cũ, double mutation và hệ số chỉ số không đổi.

2. KHO BIẾN THỂ, TÌM KIẾM VÀ ARENA

- Bổ sung ui_performance.js quản lý chỉ mục sở hữu theo Card ID, cache giao diện, debounce, phân trang và cửa sổ chọn mutation.
- Gom dữ liệu inventory/mutations một lần; hai bản ghi của cùng một biến thể được hợp nhất bằng số lượng lớn nhất, không cộng trùng. Các lần roll/cộng/bớt bản sao cập nhật riêng biến thể thay đổi.
- Không quét lại toàn bộ kho cho từng thẻ, không dựng giao diện theo từng bản sao. Cache có giới hạn; lịch sử thay đổi giữ tối đa 64 mục, cache nội dung giữ tối đa 1.024 mục, cache hệ số mutation giữ tối đa 256 mục.
- Debounce tìm kiếm Collection, Arena và Storage là 120 ms; cập nhật hình ảnh/DOM được gộp qua requestAnimationFrame.
- Collection và Arena hiển thị tối đa 24 thẻ mỗi trang, có Previous/Next. Trang tự về đầu khi thay bộ lọc. Collection chỉ dựng tối đa 3 nhãn biến thể trên mỗi thẻ và hiển thị số biến thể còn lại.
- Arena không còn dựng toàn bộ nút mutation trong khung preview. Nút ... mở popup hiển thị các biến thể của thẻ cùng số lượng. Popup dựng 24 biến thể mỗi đợt; Show more cho phép xem hết. Chọn biến thể tại popup để gán vào vị trí đang chọn.
- Giữ nguyên giới hạn số bản sao có thể triển khai, lọc Element/Category, chỉ số HP/ATK có level và mutation, cùng điều kiện đội hình của từng Tower.

3. SPOOKY SHOP, CAPSULE VÀ HIỂN THỊ CHIẾN ĐẤU

- Mua Capsule không còn gọi dựng toàn bộ Collection đang đóng. Cập nhật UI được phân loại theo giao dịch và gộp vào một khung hình.
- Spooky Shop tái sử dụng các nút đã tạo. Storage cập nhật số lượng và trạng thái vật phẩm ngay trên các ô có sẵn thay vì tạo lại cả lưới sau mỗi lần mở Capsule.
- Nhận thẻ Capsule chỉ giữ bản sao phục hồi của các mục thay đổi, không sao chép sâu toàn bộ save rồi chuẩn hóa lại mọi thẻ. Việc trừ Capsule, nhận thẻ và ghi biên nhận vẫn được lưu bền vững; không trì hoãn phần thưởng để đổi lấy tốc độ.
- Giữ nguyên RNG Capsule, điều kiện mở khóa The Judgement, roll mutation chuẩn, EXP thẻ trùng bằng 10% yêu cầu EXP hiện tại và ngừng cộng EXP ở cấp 1000. Không cộng số lượt roll thường khi mở Capsule.
- Gộp hiển thị chỉ số và nhật ký chiến đấu theo khung hình. Nhật ký giữ tối đa 260 dòng; các ô đội hình và ảnh đã tải được tái sử dụng khi chỉ HP hoặc vị trí hoạt động thay đổi.
- Giảm cấp phát đối tượng lịch mùa bằng cách tái sử dụng bộ định dạng và cache ngày Asia/Bangkok.

4. SPEED UP CHO SPOOKY HUNT

- Thêm công tắc Speed Up ngay bên dưới PLAYER/ENEMY STRIKE IN ... trong khung chiến đấu Spooky.
- OFF: 2 giây mỗi lượt. ON: 1 giây mỗi lượt.
- Đổi tốc độ trong trận giữ tỷ lệ thời gian còn lại của lượt; hủy lịch hẹn cũ trước khi đặt lịch mới để tránh chạy hai lượt trùng nhau.
- Lưu lựa chọn qua tải lại và chuyển save. Speed Battle Potion vẫn không ảnh hưởng đến Spooky Hunt.
- Normal Time Trial vẫn 2 giây/lượt; EXP Time Trial vẫn 1 giây/lượt. Các chế độ khác giữ cách tính thời gian trước đây.
- Spooky vẫn là 6vs3, Auto Continue bị tắt, và Myers/Machete/Headless Horseman chỉ có cơ hội rơi khi thắng Wave 50.

5. LUCK CONFIG TRONG GAME SETTINGS

- Có thanh trượt, ô nhập số và Reset to Max. Khoảng điều chỉnh từ Base Luck 1 đến Base Luck vĩnh viễn tối đa hiện có.
- Base Luck tối đa = 1 + cấp nâng Luck × LUCK_FACTOR + Luck từ achievement đã nhận.
- Chỉ Base Luck ở trên được thay đổi. Weather, trang bị, bonus Luck tạm thời từ quest và hệ số potion không bị đặt trần hay sửa giá trị.
- Luck cuối = (Base Luck đã chọn + Luck weather + Luck trang bị + Luck quest tạm thời) × hệ số Luck Potion đang áp dụng.
- Ví dụ: Base Luck tối đa 6, chọn 1,25; weather +0,5 và Lucky Potion x1,25 sẽ cho (1,25 + 0,5) × 1,25 = 2,1875 Luck. Nếu thêm trang bị hoặc bonus quest, các bonus đó vẫn được cộng đầy đủ trong ngoặc.
- Reset to Max khôi phục toàn bộ Base Luck. Khi dùng Max, các nâng cấp/achievement mới tiếp tục tăng Base Luck tự động; khi chọn Custom, giữ mức đã chọn và luôn chặn vượt mức tối đa.
- Tùy chọn được lưu tại anime_card_rng_settings_v1, được xác thực và đi cùng hệ thống xuất/nhập .acrsave. Save cũ chưa có thiết lập này dùng Max và Speed Up OFF. Reset game khôi phục thiết lập mặc định.

6. KIỂM TRA BẢN CẬP NHẬT

- Kiểm tra cú pháp toàn bộ JavaScript và tải script từ đường dẫn con có phân biệt hoa/thường.
- Kiểm tra trình duyệt với 158 thẻ và 14.536 biến thể hợp lệ. Trong môi trường thử: dựng Collection khi đã có cache khoảng 4–6 ms; mở Capsule khoảng 17–22 ms ở kho lớn. Đây là số đo tham khảo, phụ thuộc thiết bị, dữ liệu và tốc độ bộ nhớ trình duyệt.
- Thử tìm kiếm liên tiếp, phân trang, popup mutation, chọn biến thể, đội Spooky 6 thẻ, giải quyết lượt chiến đấu, đổi Speed Up và giữ nguyên thời gian Time Trial.
- Thử Luck Config cùng weather, potion, trang bị và quest; chặn vượt Base Luck tối đa, Reset to Max và lưu qua tải lại.
- Thử salvage một thẻ có đủ 92 biến thể: mỗi biến thể từ 2 bản còn đúng 1 bản; không mất Normal/single/double mutation.
- Giả lập lỗi ghi save khi mở Capsule: trạng thái thẻ/EXP được phục hồi, giao dịch bị khóa chờ khôi phục, tải lại nhận đúng 1 phần thưởng, không trừ/nhận thêm lần nữa.
- Kiểm tra xác thực, mã hóa/giải mã .acrsave chứa thiết lập mới; xem giao diện Settings trên desktop và mobile.
- Không thay mã nội tại/thông số thẻ hoặc module luật Tower, Raid, Time Trial, Gomen Boss Event. Gomen vẫn yêu cầu Heavenly và bán Gojo Eye tại Boss Event Shop.

Modified Files Note

Danh sách đầy đủ tệp tạo mới hoặc thay đổi:
- ui_performance.js: Tạo mới chỉ mục sở hữu, cache theo thẻ, debounce, phân trang và popup mutation theo nhu cầu.
- roll_performance.js: Thêm phiên bản/lịch sử cập nhật biến thể để vô hiệu hóa cache chính xác, giới hạn bộ nhớ.
- mutations.js: Cache xác suất/hệ số và tối ưu bộ đệm tính mutation nhiều weather, giữ nguyên RNG.
- settings.js: Luck Config, thiết lập Speed Up, xác thực và lưu tùy chọn.
- spooky.js: Cache lịch mùa, thông báo giao dịch theo loại, tái sử dụng giao diện shop.
- storage.js: Cập nhật số lượng trên ô có sẵn, gộp hiển thị Capsule và hạn chế tạo lại DOM.
- app.js: Nối các module tối ưu, cache weather, tích hợp tìm kiếm/popup, gộp hiển thị trận, nhận Capsule, Luck Config và lịch lượt Spooky.
- index.html: UI Luck Config, popup mutation, Speed Up và script ui_performance.js; cập nhật phiên bản URL script/style.
- styles.css: Giao diện phân trang, popup, Luck Config và công tắc Speed Up trên desktop/mobile.
- startup.js: Kiểm tra module UI hiệu năng khi khởi động.
- README.txt: Nhật ký riêng của bản cập nhật này và danh sách tệp thay đổi.

Gói phát hành chứa toàn bộ 40 tệp nguồn game. Không kèm Excel, test runner, log kiểm thử hoặc ảnh/âm thanh nhị phân. Tiếp tục dùng thư mục assets và âm thanh do người dùng quản lý sẵn.
