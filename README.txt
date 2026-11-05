NHẬT KÝ CẬP NHẬT 05/11/2026
THIẾT KẾ LẠI BỘ LỌC CARD INDEX

1. Nút mở bộ lọc
- Thêm nút hai mũi tên lên/xuống trong phần đầu Card Index, kèm số lựa chọn đang áp dụng.
- Biểu tượng mũi tên được vẽ bằng SVG trực tiếp trong HTML; không cần bổ sung tệp ảnh hoặc tài nguyên nhị phân.
- Giữ ô tìm thẻ và bộ lọc Mutation hiện có; chuyển lựa chọn sắp xếp, Element và Category vào hộp thoại mới.

2. Bốn chế độ sắp xếp
- DAMAGE: ATK giảm dần, từ cao xuống thấp.
- HP: HP tối đa giảm dần.
- RARITY: tỷ lệ xuất hiện thấp nhất trước; các thẻ độc quyền 1 in 0 đứng đầu, sau đó mẫu số 1 in X giảm dần.
- LEVEL: cấp thẻ giảm dần; thẻ chưa sở hữu nằm sau các thẻ đã sở hữu.
- DAMAGE/HP dùng giá trị cao nhất trong các Mutation đang sở hữu, gồm cấp thẻ và Relic phù hợp. Thẻ chưa sở hữu dùng chỉ số gốc cấp 1.
- Giá trị sắp xếp được tính một lần cho mỗi thẻ và dùng bộ nhớ đệm của giao diện; không quét Kho đồ trong hàm so sánh.

3. Element và Rarity
- Sáu Element dùng đúng ảnh đang có của game: assets/fire.png, assets/water.png, assets/nature.png, assets/electric.png, assets/dark.png, assets/holy.png.
- Có thể chọn nhiều Element; nếu ảnh bị thiếu, tên Element và biểu tượng thay thế vẫn dùng được.
- Thay biểu tượng sao bằng nút tên độ hiếm lấy từ dữ liệu thẻ: Common, Rare, Epic, Legendary, Mythic, Secret.
- Các tier mới sẽ xuất hiện khi có trong cards.js. Monarch hiện là Mutation, không phải tier độ hiếm của thẻ.
- Có thể bật/tắt nhiều độ hiếm. Không chọn mục nào trong một nhóm nghĩa là không giới hạn nhóm đó.

4. Multi-Category và APPLY
- Category lấy trực tiếp từ category.js; nhiều Category được chọn cùng lúc.
- Trong cùng nhóm dùng điều kiện HOẶC: chọn VideoGame và Villian sẽ hiển thị thẻ có ít nhất một trong hai Category.
- Giữa các nhóm dùng điều kiện VÀ: thẻ phải đồng thời khớp Element, Rarity, Category, tìm kiếm và bộ lọc Mutation đang bật.
- Tìm kiếm Category chỉ ẩn/hiện các nhãn; không xóa các Category đã chọn.
- Thay đổi trong hộp thoại là bản nháp. APPLY áp dụng cùng lúc, cập nhật lưới và đưa phân trang về trang đầu khi tiêu chí đổi.
- Cancel, nút X, nhấn nền hoặc Escape hủy bản nháp. Escape chỉ đóng bộ lọc, không đóng Card Index phía dưới.
- Reset xóa lựa chọn trong bản nháp; cần APPLY để xác nhận. Giữ bộ lọc đã áp dụng khi mở lại Index trong cùng phiên chơi.
- Không thêm phần FILTERS với TRADEABLES, CAN EVOLVE, FEATURED, BLESSING, LOCKED hoặc SHINY.

5. Giao diện và kiểm tra
- Bố cục tối, viền neon, trạng thái lựa chọn rõ ràng và nút APPLY luôn nằm trong vùng điều khiển.
- Bố cục tương thích máy tính/điện thoại; có cuộn nội dung và vùng Category riêng, không tràn ngang.
- Kiểm tra bộ lọc kết hợp, bốn kiểu sắp xếp, tìm kiếm, hủy bản nháp, phân trang và khởi động trình duyệt.
- Không thay đổi cards.js, Category/Element registry, RNG, tiến trình, lưu game, combat hoặc các bộ chọn đội hình Arena.
- Nhãn cache mới: 20261105-index-filters-1. Thay đầy đủ mã nguồn rồi tải lại bằng Ctrl+F5.

Modified Files Note
- index_filters.js (mới): trạng thái nháp/đã áp dụng, chọn nhiều Element/Rarity/Category, tìm kiếm Category và điều khiển hộp thoại.
- app.js: nối bộ lọc mới vào Index, sắp xếp DAMAGE/HP/RARITY/LEVEL, bộ nhớ đệm chỉ số và phân trang.
- index.html: nút hai mũi tên, hộp thoại bộ lọc, phần tóm tắt, thứ tự tải script và nhãn cache.
- styles.css: giao diện bộ lọc, trạng thái nút và bố cục đáp ứng.
- startup.js: kiểm tra mô-đun và nút bộ lọc đã khởi tạo đầy đủ.
- README.txt: chỉ giữ nhật ký của bản cập nhật này.
