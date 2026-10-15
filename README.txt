NHẬT KÝ CẬP NHẬT 15/10/2026
HỆ NGUYÊN TỐ, HUY HIỆU THẺ VÀ BỘ CHỌN ĐỐI THỦ TOWER

1. HỆ NGUYÊN TỐ VÀ CÔNG THỨC SÁT THƯƠNG

- Thêm thuộc tính element riêng trong từng đối tượng của đủ 114 thẻ tại cards.js. Sáu giá trị hợp lệ: Fire, Water, Nature, Electric, Dark và Holy.
- Thêm elements.js để quản lý ma trận khắc chế, đường dẫn icon và hiển thị huy hiệu dùng chung. Nguyên tố không cấp passive mới, không tăng trực tiếp chỉ số HP hoặc ATK và không thay đổi tỷ lệ roll của thẻ.
- Vòng khắc chế: Fire > Nature > Electric > Water > Fire.
- Fire đánh Nature, Nature đánh Electric, Electric đánh Water hoặc Water đánh Fire: sát thương x3.
- Khi đánh ngược chiều một quan hệ khắc chế: sát thương còn 1/3. Ví dụ Fire đánh Water chỉ gây 1/3 sát thương.
- Holy đánh Dark gây x3; Dark đánh Holy cũng gây x3. Hai chiều đều có lợi thế, không áp dụng nhánh bất lợi 1/3 cho cặp này.
- Cùng nguyên tố hoặc không có quan hệ khắc chế: 100% sát thương. Ví dụ Fire đánh Fire, Electric đánh Fire, Dark đánh Dark và Holy đánh Holy đều có hệ số 1.
- Công thức: sát thương sau nguyên tố = sát thương trước nguyên tố x E; E thuộc {3; 1/3; 1}. Tiếp theo vẫn áp dụng các bước khiên, giảm sát thương và làm tròn hiện có của từng luồng chiến đấu.
- Đòn đánh chính, đòn đánh thêm, kỹ năng diện rộng, phản công và các tick Burn/Bleed đều xét nguyên tố của nguồn sát thương và mục tiêu thực tế. Đòn diện rộng xét riêng từng mục tiêu, không lấy hệ của mục tiêu đầu tiên áp cho cả đội.
- Mỗi gói sát thương chỉ nhân hệ số nguyên tố 1 lần. Calamity chia đôi sát thương đã tính hệ của mục tiêu được bảo vệ; phần Wonder Of You hấp thụ hoặc phản xạ không nhân nguyên tố lần thứ hai.
- Kiểm tra đòn đánh gây tử vong và kích hoạt sống sót/hồi sinh được thực hiện với lượng sát thương đã xét nguyên tố, tránh hồi sinh nhầm khi đòn bất lợi chưa đủ gây tử vong.
- Không nhân hệ số nguyên tố lên hồi máu, tăng max HP, chi phí tự mất HP hoặc quyết định kết liễu tức thì. Các hiệu ứng này tiếp tục tuân theo quy tắc riêng đã có.
- Mutation, double mutation, lên cấp và đánh cắp passive không đổi element gốc của thẻ. Clone dùng nguyên tố của thẻ mà nó thực sự đại diện; Ghost/Naruto Clone tạm thời do Champion tạo ra kế thừa nguyên tố của chủ sở hữu.
- EXP Monster là đơn vị luyện tập phát sinh trong trận, ngoài danh sách 114 thẻ; không có nguyên tố khắc chế và vẫn giữ ATK = 0.

2. DANH SÁCH GÁN NGUYÊN TỐ CHO 114 THẺ

Theo lựa chọn đã xác nhận: Saber = Water; Luffy Kid và Garp = Nature; Metal Cooler = Electric. Tên Vasto Lorde trong yêu cầu tương ứng với thẻ Vasto Lord hiện có, ID weather-reaper-hollow.

FIRE — 17 thẻ
Kaneki; Nezuko; Denji; Uchiha Itachi; Yuji Itadori; Erwin; Boa Hancock; Shanks; Hutao; Escanor; Dante Limbus; Dio Brando; Malevolent King; Charizard Mega X; Thukuna; Vasto Lord; Ace.

WATER — 20 thẻ
Tanjiro; Buggy; Saber; Vegeta; Rimuru; Grimmjaw; Reigen; Nami; Giyu Tomioka; Sea Beast; Arlong; Aquaman; Noelle Silva; Rukia; Ice Admiral; Esdeath; Toshiro; Aqua; Ice King; Marco.

NATURE — 23 thẻ
Naruto Kid; Powerless Guy; Gon Kid; Bounty Hunter; Jotaro Kujo; Hakari; Kamen Rider Kuuga; Bulma; Polnareff; Meruem; Katakuri; Senku; Yuno; Weather Report; Piccolo; Peashooter; Uchiha Shisui; Doflamingo; Hakari Jackpot; Naruto x Sasuke; Mihawk; Luffy Kid; Garp.

ELECTRIC — 15 thẻ
Sasuke Kid; Jonathan Joestar; Son Goku; Kakashi; Madness Doctor; The Flash; Frieza; Gohan; Android 21; Light Admiral; Gojo Young; Uchiha Sasuke; Equinox; Majin Buu; Metal Cooler.

DARK — 22 thẻ
Normal Demon; Six Seven; The Trapper; Guts; Mahito; BlackBeard; WhiteBeard; Asta; Demon Asta; Aatrox; Griffith; Adult Gon; Luffy Nightmare; Igris; Cid Atomic; Enderman; Homura Akemi; Kamen Rider Decade; Diavolo; Subaru; Wonder Of You; Kamen Rider Dark Decade.

HOLY — 17 thẻ
Ichigo Young; Erza; The Truth; Viltrumite; Kamen Rider Kabuto; Adam Francis; Doppio; Builderman; Yuta Okkotsu; The First Human; Sailor Moon; Jin Mori; Wish; Kaguya; Mahoraga; Aizen Beyond; The Judgement.

Tổng cộng: 17 + 20 + 23 + 15 + 22 + 17 = 114 thẻ. Mọi chỉ số, tên passive, mô tả passive và điều kiện roll hiện có được giữ nguyên trong bản cập nhật này.

3. HUY HIỆU NGUYÊN TỐ VÀ BIỂU ĐỒ ARENA

- Hiển thị huy hiệu nguyên tố trên header thẻ kết quả roll và thẻ preview; bổ sung icon ở Collection, danh sách roll khả dụng, danh sách chọn đấu sĩ, đội hình đã chọn, preview lựa chọn, thẻ đang chiến đấu và hàng chờ hai bên.
- Dùng đúng 6 ảnh: assets/fire.png, assets/water.png, assets/nature.png, assets/electric.png, assets/dark.png và assets/holy.png.
- Biểu đồ assets/elemental.png xuất hiện ở góc trên bên phải panel Arena. Có thể bấm để mở bản lớn cùng chú thích x3, 1/3 và 100%.
- Đóng biểu đồ bằng nút đóng hoặc Escape chỉ đóng biểu đồ, không thoát hoặc reset trận đang diễn ra.
- Huy hiệu có kích thước riêng, nhãn truy cập và chú thích tên nguyên tố. Header lớn dành chỗ giữa tên thẻ và thông tin variant/drop chance; icon ở ô chọn đấu sĩ được neo vào góc trên bên phải.
- Bố cục biểu đồ và bộ lọc co giãn theo desktop/mobile. Nút mở rộng passive tiếp tục nằm trong góc dưới bên phải vùng passive.
- Gói nguồn kèm đủ 7 PNG nguyên tố đã cung cấp. Hai ảnh chụp giao diện tham chiếu không được đưa vào gói game.

4. BỘ LỌC VÀ SẮP XẾP NGUYÊN TỐ

- Collection có bộ lọc All Elements hoặc từng hệ Fire, Water, Nature, Electric, Dark, Holy.
- Bộ chọn đấu sĩ trong Arena có bộ lọc nguyên tố tương tự, kết hợp với tìm kiếm tên và các kiểu sắp xếp sẵn có.
- Thêm kiểu sắp xếp theo nguyên tố cho cả Collection và danh sách chọn đội hình. Thứ tự nhóm: Fire, Water, Nature, Electric, Dark, Holy; trong cùng nhóm sắp theo tên.
- Bộ lọc chỉ thay đổi danh sách hiển thị, không tự gỡ các thẻ đã chọn khỏi đội hình và không thay thế điều kiện vào Weather Tower.
- Storage vật phẩm vẫn dùng cho potion, vé, chìa khóa và vật liệu; bộ lọc nguyên tố dành cho kho thẻ và danh sách thẻ chiến đấu.

5. BỘ CHỌN ĐỐI THỦ TOWER THEO TẦNG

- Nguồn ứng viên Tower mới bao gồm toàn bộ 114 thẻ, kể cả Tower Champion chưa mở khóa và các thẻ Raid có chance = 0. Điều này chỉ cho phép đối thủ dùng thẻ, không mở khóa sở hữu hoặc đưa thẻ Raid vào RNG thường của người chơi.
- Với thẻ roll được: Q = mẫu số chance hiện có của thẻ.
- Với thẻ 1 trên 0: Q là số nguyên được lấy ngẫu nhiên đều từ 100.000 đến 10.000.000, dùng riêng cho việc sinh đối thủ.
- Ngưỡng chất lượng tối thiểu theo tầng, xét trên Q:
  Tầng 1–25: 0, cho phép mọi ứng viên của hệ phù hợp.
  Tầng 26–50: 100.
  Tầng 51–75: 1.000.
  Tầng 76–100: 10.000.
  Tầng 101–200: 100.000.
  Tầng 201–300: 500.000.
  Tầng 301–500: 1.000.000.
  Tầng 501 trở đi: 2.000.000.
- Nếu một tập ứng viên theo hệ không có thẻ nào đạt ngưỡng, lấy ứng viên mạnh nhất theo Q trong chính hệ đó. Không nới khóa nguyên tố để lấp chỗ trống.
- Sau lọc chất lượng, vẫn ưu tiên nhóm vai trò hiện có: minion thường đến Legendary; boss từ Legendary; phòng Elite ưu tiên Mythic/Secret. Nếu một nhóm vai trò rỗng, dùng tập đã lọc theo hệ và chất lượng.
- Trong tập cuối, trọng số chọn thẻ là 1/Q; xác suất tương đối của thẻ i là (1/Qi) chia cho tổng (1/Qj) của các ứng viên trong tập đó. Đây là xác suất chọn đối thủ, không phải tỷ lệ gacha hay tỷ lệ rơi thẻ.
- Vẫn sinh 3 minion và 1 boss. Không đổi công thức HP/ATK theo tầng, quy tắc HP > ATK, Tower Coins hoặc VNĐ từ tổng sát thương.

6. KHÓA NGUYÊN TỐ THEO LOẠI TOWER

- Normal: không khóa một hệ chung; lấy từ toàn bộ 114 thẻ trước bước lọc chất lượng và vai trò.
- Raining: Water.
- Snowing: chọn Water hoặc Nature.
- Sunny: Fire.
- Sugar: Electric.
- Reaper: chọn Dark hoặc Holy.
- Eclipse: chọn Dark hoặc Fire.
- Malevolent: chọn Fire hoặc Nature.
- Tsukuyomi/Mangekyo: Dark.
- Heavenly: Holy.
- Shadow: chọn Dark hoặc Electric.

Ở loại có 2 hệ, chọn 1 hệ cho cả tầng với xác suất 50% mỗi hệ. Cả 4 đối thủ của tầng mới đều phải mang đúng hệ đã chọn; không chọn riêng từng hệ cho từng vị trí. Mutation thời tiết của đối thủ không thay đổi hệ thẻ.

7. ĐỘI HÌNH KHÓA VÀ TƯƠNG THÍCH SAVE

- Bản ghi đối thủ Tower mới lưu selectionVersion = 2, element của tầng, 4 ID thẻ, mutationIds và selectionChance của mỗi vị trí.
- Sau thất bại, thử lại giữ nguyên thành phần, nguyên tố, mutation và Q đã lấy cho tầng đó. Mỗi lượt thử tạo lại đơn vị đầy HP, không mang trạng thái, hồi sinh hoặc summon từ lượt thử trước.
- Tải lại và chuyển .acrsave bảo toàn bản ghi mới, kể cả thẻ 1 trên 0. Kiểm tra import xác thực cả khóa hệ lẫn dữ liệu Q của các bản ghi phiên bản mới.
- Để giữ lời hứa khóa đối thủ của save cũ, đội hình đã khóa từ bản trước được giữ nguyên đến khi vượt tầng. Các khóa hệ và lọc chất lượng mới áp dụng từ đội hình được sinh mới tiếp theo.
- Quy tắc đội người chơi không đổi: Normal nhận mọi thẻ sở hữu; Weather Tower tiếp tục xét thời tiết gốc hoặc mutation/double mutation phù hợp, không đổi thành điều kiện nguyên tố.
- Bộ sinh đối thủ Time Trial được tách thành profile riêng giữ đúng quy tắc chọn đội trước bản cập nhật; các giới hạn thời gian, vé, thưởng và miễn Speed Battle Potion không đổi. Sát thương nguyên tố vẫn hoạt động khi thẻ chiến đấu trong chế độ này.
- Giữ nguyên cơ chế bảo vệ .acrsave, checksum, cooldown nhập/xuất độc lập 7 ngày và cờ migration Lv.10 đã có.

8. CÁC FILE CỦA BẢN CẬP NHẬT

- cards.js: khai báo element rõ ràng cho toàn bộ 114 thẻ.
- elements.js: module mới cho 6 hệ, ma trận sát thương và huy hiệu UI.
- passives.js: nối hệ số nguyên tố vào các luồng sát thương hiện có, không thêm passive nguyên tố.
- tower.js: lọc chất lượng theo tầng, pool thẻ 1 trên 0, khóa hệ theo loại và lưu đội hình.
- timetrial.js: gọi profile sinh đối thủ riêng để giữ hành vi chọn đội trước đó.
- app.js: renderer huy hiệu, lọc/sắp xếp và tích hợp biểu đồ, kiểm tra bản ghi Tower khi import.
- index.html, styles.css: biểu đồ Arena, bộ lọc và bố cục huy hiệu thích ứng.
- assets/: 6 icon nguyên tố và elemental.png.
- README.txt: chỉ chứa changelog của bản cập nhật nguyên tố và Tower này.
