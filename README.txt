NHẬT KÝ BẢN SỬA GOMEN EVENT — 20/10/2026

1. CHUYỂN GOMEN SANG BOSS EVENT

Gomen Event được chuyển khỏi danh sách Raid sang Battle Arena > Boss Event > Gomen Event. Toàn bộ điều kiện vào trận, tạo boss, xử lý kết quả, tiền thưởng và shop do boss_event.js quản lý.

Thể thức sử dụng đúng luật Boss Event hiện có: 5 thẻ người chơi đấu 1 boss Gojo Revice; không cần Key, không có cây nâng HP/ATK bằng Coins. Các nâng cấp Gomen thuộc Raid cũ không được áp dụng trong Boss Event. Speed Battle Potion vẫn hoạt động theo luật Boss Event.

Trận thắng thưởng Gomen Coins và có thể rơi Gojo Eye; không thưởng VNĐ, EXP hoặc potion ngẫu nhiên. Gojo Revice vẫn là thẻ tiến hóa; trận Gomen không phát trực tiếp thẻ Gojo Revice.

2. ĐIỀU KIỆN HEAVENLY

Chỉ được bắt đầu Gomen khi Heavenly Weather đang hoạt động và chưa hết hạn. Có thể xem thông tin hoặc shop khi sự kiện đóng, nhưng không được vào trận.

Điều kiện thời tiết được kiểm tra lại trước mỗi lần Continue, kể cả Auto Continue sau thắng hoặc thua. Nếu Heavenly đã hết hạn hoặc không còn hoạt động, trận kế tiếp không bắt đầu. Trận đã bắt đầu tiếp tục theo luật Boss Event hiện có.

3. CHỈ SỐ, ĐỘ KHÓ VÀ COINS

Độ khó d là số nguyên từ 1 đến 1000, đồng thời là cấp boss.
Hệ số chỉ số: S(d) = 1 + 0,075 × (d - 1).
HP boss = làm tròn(888.888 × S(d)).
ATK boss = làm tròn(88.888 × S(d)).

Công thức Gomen Coins dùng cùng thuật toán Boss Event hiện hành:
t = ((d - 1) / 999)^0,85.
Coins tối thiểu = làm tròn(1 + 69 × t).
Coins tối đa = làm tròn(1 + 99 × t).
Chọn số nguyên ngẫu nhiên trong khoảng trên, sau đó áp dụng Drop Multiplier hiện có và cơ chế làm tròn ngẫu nhiên của Inventory.

Độ khó 1: 1 Gomen Coin cơ bản mỗi trận thắng.
Độ khó 1000: 70–100 Gomen Coins cơ bản mỗi trận thắng.
Không sử dụng hệ nâng chỉ số đội hình của Raid cho Gomen.

4. SHOP VÀ GOJO EYE

Gojo Eye được bán trong Gomen Boss Event Shop với giá 888.888 Gomen Coins. Vật phẩm giữ nguyên ảnh assets/items/gojoeye.png và công dụng tiến hóa Gojo Young cấp 100 trở lên thành Gojo Revice.

Giữ nguyên cơ hội rơi Gojo Eye khi thắng:
p(d) = 0,008 + 0,072 × (d - 1) / 999.
Tương ứng 0,8% tại độ khó 1 và 8% tại độ khó 1000. Số lượng vật phẩm áp dụng Drop Multiplier hiện có.

Shop áp dụng giá potion chuẩn Boss Event:
- Rich Potion, EXP Potion, Lucky Potion, Speed Potion: 10 Gomen Coins mỗi bình.
- Speed Battle Potion: 25 Gomen Coins mỗi bình.

Infinity Eye đã có từ bản trước cũng chuyển sang Gomen Boss Event Shop, giữ nguyên giá 888.888 Gomen Coins và toàn bộ hiệu ứng trang bị. Không còn bán vật phẩm Gomen trong Raid Shop.

5. TƯƠNG THÍCH DỮ LIỆU VÀ QUEST

Khi tải bản cập nhật, Gomen Coins, số trận thắng và độ khó Gomen trong dữ liệu Raid cũ được chuyển một lần sang Boss Event. Cờ gomenRaidMigrated được lưu cùng số dư đích để tránh cộng trùng khi tải lại hoặc chuyển save.

Phần thưởng Gojo Eye đang chờ ghi từ Raid cũ được khôi phục trước khi chuyển số dư. Cơ chế biên nhận bảo đảm không phát lại vật phẩm nếu lần ghi Coins trước đó bị gián đoạn. Nếu chưa thể lưu hoặc khôi phục phần thưởng, Gomen bị khóa an toàn để chờ tải lại.

Dữ liệu Gomen Raid cũ được giữ làm bản ghi tương thích save; không thể dùng để vào Raid, mua vật phẩm hay nâng chỉ số. Coins và nâng cấp Marine Ford/Holy Grail được giữ nguyên. Save .acrsave cũ chứa Gomen Raid vẫn được xác thực và tiếp nhận.

Quest đầu của Toji nay đếm thắng Gomen Boss Event ở độ khó > 8; mục tiêu vẫn là 888 trận. Giữ nguyên tiến độ đã theo dõi, không đếm hồi tố. Các bước còn lại không đổi. Số trận thắng Gomen được tính vào tổng Boss Event; bản ghi Gomen cũ không tiếp tục được tính trong tổng Raid.

6. PHẠM VI VÀ KIỂM TRA

Bản này chỉ sửa phân loại Gomen, điều kiện Heavenly, shop và các điểm tích hợp liên quan. Không chỉnh nội tại hay thông số thẻ, Spooky Hunt, Tower, Time Trial, tiến hóa, trang bị hoặc thuật toán bảo vệ .acrsave.

Đã kiểm tra cú pháp toàn bộ JavaScript và luồng trình duyệt: tải từ đường dẫn con có phân biệt hoa/thường; chọn Gomen tại Boss Event; đội 5v1; chặn thời tiết không hợp lệ; ngăn Auto Continue khi mất Heavenly; kết quả Coins/Gojo Eye; giá shop; Quest Toji; tải lại; chuyển dữ liệu một lần; khôi phục phần thưởng sau lỗi ghi; xác thực và giải mã save .acrsave. Không đưa tệp kiểm thử, Excel hoặc tài sản nhị phân vào gói nguồn.

Modified Files Note

Danh sách đầy đủ các tệp thay đổi trong bản sửa này:
- boss_event.js: khai báo Gomen/Heavenly, shop, phần thưởng vật phẩm và chuyển dữ liệu một lần.
- raid.js: gỡ Gomen khỏi Raid có thể chơi; giữ đọc và khôi phục dữ liệu cũ để chuyển sang Boss Event.
- app.js: hiển thị phần thưởng Gojo Eye trong thông tin và kết quả Boss Event; loại bỏ nhãn Gomen Raid cũ.
- index.html: chuyển lựa chọn Gomen sang Boss Event và cập nhật phiên bản URL tải script/style.
- quests.js: chuyển điều kiện trận Gomen của Toji sang Boss Event.
- evolution.js: cập nhật mô tả nguồn và giá Gojo Eye.
- equipment.js: cập nhật nguồn shop Infinity Eye.
- storage.js: cập nhật nguồn Gojo Eye trong chức năng xem thông tin vật phẩm.
- README.txt: nhật ký riêng của bản sửa này và danh sách tệp thay đổi.

Gói tải xuống chứa toàn bộ mã nguồn game; không chỉ các tệp đã sửa. Các ảnh và âm thanh tiếp tục dùng đường dẫn sẵn có, do người dùng quản lý riêng.
