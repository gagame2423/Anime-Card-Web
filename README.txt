NHẬT KÝ CẬP NHẬT — YUNO, EXP THEO RNG VÀ HƯỚNG DẪN TOWER
Ngày 17/10/2026 — phiên bản cache 20261017-yuno-1

Tài liệu chỉ ghi thay đổi trong bản cập nhật hiện tại.

1. SỬA CRASH RARITY VÀ KIỂM TRA SALVAGE

Định nghĩa rarityOrder trong phạm vi dùng chung của app.js: Common 0, Rare 1, Epic 2, Legendary 3, Mythic 4, Secret 5. Bộ chọn Rarity của Arena so sánh bậc rarity trước, sau đó so sánh độ hiếm 1 in N trong cùng bậc và tên thẻ để ổn định thứ tự. Không còn phụ thuộc biến chưa khai báo hoặc điểm tổng hợp có thể làm độ hiếm lấn át bậc rarity.

Đã rà soát Salvage All Extra Duplicates và giữ quy tắc theo từng khóa chuẩn cardId + mutationIds:
- Với mỗi biến thể, chỉ salvage max(0, số lượng - 1).
- Giữ một bản Normal nếu có Normal; giữ một bản của từng mutation và double mutation đang sở hữu.
- Wet, Solar, Wet + Monarch và Solar + Monarch là bốn biến thể khác nhau.
- Hai thứ tự Wet + Monarch / Monarch + Wet là cùng một tổ hợp; không được nhân đôi thành hai biến thể giả.
- Các tên cũ Sweet/Sweat, Blizzard/Frost và Sacrifice/Eclipsed được chuẩn hóa về cùng mutation tương ứng. Chuẩn hóa tên không gộp hai mutation khác nhau.
- Chạy salvage lại khi mỗi biến thể còn một bản sẽ không xóa thêm thẻ. Giữ công thức VNĐ mỗi bản và đồng bộ dữ liệu sở hữu như trước.

Đã kiểm tra toàn bộ 92 biến thể hợp lệ của một thẻ: một Normal, 13 mutation đơn và 78 tổ hợp đôi. Sau salvage, cả 92 biến thể đều còn đúng một bản.

2. CÔNG THỨC EXP MỚI: ĐỘ HIẾM 1 IN N LÀ YẾU TỐ CHÍNH

levels.js là nguồn công thức chung cho yêu cầu EXP, giao diện tiến trình và cấp Level.

Với một thẻ roll được:
N = mẫu số RNG gốc trong cards.js, ví dụ 2 hoặc 1,500,000.
r = log10(N).
A = 150 x (1 + r)^1.5.
p = 1.30 + 0.06 x r.
EXP cần để tăng từ Level L = floor(A x L^p).

N càng lớn thì cả hệ số A và số mũ p đều lớn hơn. Hai thẻ có cùng N dùng cùng đường cong, dù nhãn rarity khác nhau. Dùng RNG gốc; Luck, thời tiết và mutation không làm mẫu số dùng để tính EXP thay đổi theo thời điểm.

Một số mốc chính xác, trước mọi cơ chế thưởng EXP:
1 in 2:
  Lv.1: 222; Lv.10: 4,630; Lv.100: 96,304; Lv.1000: 2,003,123.
1 in 300,000, tương ứng Yuno:
  Lv.1: 2,472; Lv.10: 105,145; Lv.100: 4,471,145; Lv.1000: 190,128,020.
1 in 1,500,000:
  Lv.1: 2,883; Lv.10: 135,048; Lv.100: 6,324,906; Lv.1000: 296,223,572.
1 in 4,444,444, tương ứng Yuno Spirit Demonic:
  Lv.1: 3,172; Lv.10: 158,586; Lv.100: 7,927,488; Lv.1000: 396,282,292.

Các số ở Lv.1000 mô tả giá trị hàm yêu cầu để đối chiếu công thức; game không cho lên Lv.1001 và không nhận thêm EXP tại mức tối đa.

Thẻ 1 in 0 không được hưởng đường cong rẻ do mẫu số bằng 0. Có thể đặt levelingRate riêng trong cards.js. Yuno Spirit dùng levelingRate = 1,500,000; giá trị này chỉ dùng tính EXP, không đưa thẻ vào pool roll. Nếu chưa cấu hình, dùng N quy ước: Common 10, Rare 100, Epic 1,000, Legendary 10,000, Mythic 500,000, Secret 1,000,000. Rarity chỉ tham gia dự phòng cho nhóm thẻ không roll được.

Để đường cong khó hơn có hiệu lực, EXP roll trùng giữ ngân sách tuyệt đối của bản trước, thay vì lấy 50% yêu cầu EXP mới:
EXP trùng cơ bản = floor(50 x hệ số rarity x L).
Hệ số thưởng: Common 1; Rare 1.6; Epic 2.4; Legendary 3.6; Mythic 5.2; Secret 8.
Tiếp tục nhân buff EXP của thời tiết, potion và achievement. Yêu cầu EXP tăng nhanh hơn lượng thưởng khi lên Level cao.

Thưởng EXP trận thường giữ ngân sách tăng theo sqrt(L) hiện hành. EXP Time Trial vẫn là chế độ luyện EXP theo phần trăm yêu cầu Level hiện tại, với vé và thời gian như trước. Tower vẫn không cho EXP.

Giữ giới hạn Level 1000, bỏ sớm EXP cho thẻ tối đa và dọn EXP dư tại giới hạn. Khi load/import, giữ Level hợp lệ và số EXP tuyệt đối đã có; không hạ Level của người chơi chỉ vì đổi công thức. Thanh tiến trình được tính lại theo yêu cầu mới. Các Level vượt 1000 vẫn được clamp theo quy tắc hiện có.

Cấp EXP nhiều Level dùng tổng chi phí được cache và tìm kiếm nhị phân. Bảng có tối đa 1000 ô/thẻ, tạo khi cần vượt ngưỡng Level; thưởng nhỏ chưa đủ tăng Level không dựng bảng. Tách giới hạn số an toàn khỏi giới hạn Level, tránh lặp hàng triệu lần hoặc cấp Level theo công thức tuyến tính cũ. Kiểm tra roll trùng không còn tính yêu cầu EXP chỉ để suy ra ngân sách thưởng.

3. YUNO SPIRIT VÀ SPIRIT CROWN

Yuno Spirit:
- ID: yuno-spirit.
- Element Nature; rarity Secret; rate 1 in 0, chỉ Evolution.
- HP Lv.1: 255,500; ATK Lv.1: 19,892.
- Ảnh: assets/cards/yunospirit.png.

Spirit Crown:
- ID vật phẩm: spirit_crown; loại material, lưu trong Storage.
- Giá: 4,400 Lucius Event Coins tại Lucius Event Shop.
- Ảnh: assets/spiritcrown.png.
- Trừ đúng ví Lucius; không trừ hoặc dùng thay bằng Alucard Event Coins.

Tiến hóa: Yuno Lv.100 trở lên + một bản Yuno ở biến thể đã chọn + 1 Spirit Crown => Yuno Spirit Lv.1, EXP 0. Giữ nguyên mutation hoặc double mutation của bản Yuno bị tiêu thụ. Lv.99 bị chặn; chỉ tiêu một bản thẻ và một nguyên liệu. Áp dụng giao dịch khôi phục và biên nhận tiến hóa một lần của hệ thống hiện có. Yuno Spirit không được roll thường sau tiến hóa.

Spirit Wind Grimoire:
- Khi vào trận, cấp cho toàn bộ đồng đội còn sống, gồm chính mình, khiên bằng 48% max HP hiện tại của Yuno Spirit. Khiên này không có thời hạn trong trận; vẫn tồn tại trên người nhận nếu nguồn cấp bị hạ.
- Có 30% cơ hội né đòn. Mỗi lần né thành công cộng thêm khiên bằng 30% HP hiện tại của thẻ, không phải 30% max HP.
- Khiên né tồn tại thêm 3 lượt chiến đấu và được gỡ ở cuối lượt thứ ba sau lúc tạo. Thời hạn tính bằng lượt, không tính bằng giây hoặc tốc độ potion.
- Mỗi đòn tấn công có 26% cơ hội xáo thứ tự các địch còn sống, rồi gây thêm 48% ATK hiện tại lên toàn bộ địch. Đội hình gốc lưu cho lần retry Tower không bị ghi đè bởi thứ tự bị xáo trong trận.
- Đổi mục tiêu do xáo đội hình không đặt lại bộ đếm đòn của các thẻ.

4. YUNO SPIRIT DEMONIC — CHAMPION LUCKY FLOOR 100

Thông số:
- ID: tower-champion-lucky.
- Element Nature; rarity Secret; rate 1 in 4,444,444.
- HP Lv.1: 444,444; ATK Lv.1: 22,222.
- Ảnh: assets/cards/yunospiritdemonic.png.

Theo cơ chế Champion đã xác nhận, lần hoàn thành Lucky Tower Floor 100 cấp một bản Normal và mở khóa thẻ vĩnh viễn. Sau mở khóa, thẻ vào pool roll với rate 1 in 4,444,444 khi Lucky đang hoạt động. Không thêm thẻ vào pool khi thiếu Lucky. Save đã có tiến độ Lucky từ Floor 100 trở lên được đối chiếu với milestone mới theo cơ chế achievement; biên nhận chặn cấp lặp lại.

Anti Spirit Grimoire:
- Gây x2 damage lên địch Holy, đồng thời nhận ít hơn 22% damage từ nguồn Holy. Bonus này phối hợp với matrix Element hiện hành, không đổi Element của thẻ.
- Mỗi đòn có 44% cơ hội xuyên đội hình. Đòn chính là hit đầu với 100% ATK cơ bản; không cộng thêm một hit 100% trùng lên mục tiêu đầu.
- Các hit xuyên tiếp theo nhân x0.78 cho mỗi hit trước đã gây sát thương: 100%, 78%, 60.84%, 47.4552%... Áp dụng tiếp phòng thủ, Element và các tương tác sát thương hiện hành.
- Khi bị tấn công, có 22% cơ hội hấp thụ sát thương. Đây là hấp thụ, không phải né: không kích hoạt thưởng né và không tự thêm 22% vào chỉ số Dodge.
- Lần hấp thụ thành công ngăn mất HP và không tiêu hao khiên đang có. Lượng hấp thụ sau giảm sát thương được cộng dồn vào bonus damage cho đòn chính kế tiếp được giải quyết; các lần bỏ lượt hoặc bị né không tiêu phần tích trữ.
- Cấp một khiên vĩnh viễn trong trận có lượng bằng phần đã hấp thụ cho đồng đội còn sống ở đúng vị trí ngay sau thẻ. Không quay vòng về đầu đội hình nếu thẻ ở cuối; không nhảy qua vị trí đã chết để chọn người khác.
- Khiên hấp thụ cộng dồn, không có trần số lần kích hoạt hoặc giới hạn theo max HP. DOT không tạo thêm lần hấp thụ, nhưng tương tác damage với Holy vẫn dùng đúng hệ số.

5. KHIÊN CỘNG THÊM VÀ KHIÊN CÓ THỜI HẠN

Thêm yuno.js để tách logic hai thẻ và các lớp khiên cộng thêm khỏi app.js.

Khiên Yuno giữ phần vĩnh viễn và phần 3 lượt riêng biệt. Nếu khiên tạm đã hấp thụ một phần sát thương, lúc hết hạn chỉ gỡ lượng còn lại của phần tạm. Ưu tiên tiêu hao phần khiên tạm trước phần vĩnh viễn. Các lần cấp khiên cùng thời hạn được gộp số lượng, tránh tích lũy đối tượng qua một chuỗi đòn dài.

Không gỡ khiên Yuno khi một khiên Sasuke/Weather Report khác hết hạn hoặc bị xóa theo kỹ năng riêng. Giữ cách kết hợp của các khiên cũ khi không có lớp Yuno.

Quy tắc chống sát thương tràn được giữ: đòn phá khiên không đưa lượng dư vào HP. Nội tại phản đòn, hồi sinh, chặn đòn và phá khiên đi qua luồng chiến đấu chung. Kỹ năng sao chép của Lucius có thể dùng hai nội tại mới với trạng thái riêng. Sandbox tạo runtime riêng và không ghi tiến trình thực.

6. ELEMENT ĐỘI ĐỊCH TOWER VÀ HƯỚNG DẪN CHO TỪNG LOẠI

Theo xác nhận, ràng buộc Element mới chỉ áp dụng cho đội địch. Điều kiện chọn thẻ người chơi giữ nguyên: Normal dùng thẻ đang sở hữu; Weather Tower dùng thẻ native weather hoặc biến thể có mutation tương ứng, bao gồm double mutation. Không thêm luật đơn Element vào đội người chơi.

Ba loại được cập nhật:
- Lucky: chọn Nature HOẶC Holy cho một tầng; cả 4 địch dùng đúng Element đã chọn.
- Wind: cả 4 địch dùng Nature.
- Bizare: chọn Dark HOẶC Electric cho một tầng; cả 4 địch dùng đúng Element đã chọn.

Các loại khác tiếp tục dùng ràng buộc hiện hành. Toàn bộ 14 lựa chọn đang có đều có mô tả dưới dropdown:
- Normal: người chơi dùng thẻ sở hữu; địch không khóa một Element.
- Raining: native Raining hoặc Wet; địch Water.
- Snowing: native Snowing hoặc Frost; địch cùng Water hoặc cùng Nature.
- Sunny: native Sunny hoặc Solar; địch Fire.
- Lucky: native Lucky hoặc Clove; địch cùng Nature hoặc cùng Holy.
- Sugar: native Sugar hoặc Sweet; địch Electric.
- Reaper: native Reaper hoặc Hollow; địch cùng Dark hoặc cùng Holy.
- Eclipse: native Eclipse hoặc Eclipsed; địch cùng Dark hoặc cùng Fire.
- Wind: native Wind hoặc Storm; địch Nature.
- Malevolent: native Malevolent hoặc Cursed; địch cùng Fire hoặc cùng Nature.
- Tsukuyomi: native Tsukuyomi/Mangekyo hoặc Mangekyo; địch Dark.
- Heavenly: native Heavenly hoặc Angelic; địch Holy.
- Shadow: native Shadow hoặc Monarch; địch cùng Dark hoặc cùng Electric.
- Bizare: native Bizare hoặc Stardust; địch cùng Dark hoặc cùng Electric.

Hint tách rõ đội người chơi và đội địch, cùng phần thưởng milestone hoặc thông tin Elite. Cập nhật ngay khi đổi lựa chọn, đặt trực tiếp dưới dòng chọn Tower, hỗ trợ đọc bằng aria-describedby và xuống dòng trên màn hình nhỏ. Normal Tower trong bản game hiện tại dùng tiến trình vô hạn.

7. KHÓA ĐỘI HÌNH, TƯƠNG THÍCH SAVE VÀ KIỂM TRA

Tăng phiên bản cấu hình chọn địch lên 4. Với save cũ ở ba loại Lucky/Wind/Bizare:
- Nếu cả đội địch đã cùng một Element hợp lệ, giữ nguyên thành phần và cập nhật metadata.
- Nếu đội cũ không đáp ứng ràng buộc mới, chuẩn hóa bằng một đội hợp lệ một lần. Sau khi lưu, thua/retry hoặc reload đều giữ đúng đội đã khóa.
- Giữ Floor hiện tại, coin, số thắng và tiến độ mở khóa. Không đổi công thức HP/ATK hay thưởng Tower.

Đã kiểm tra:
- Khởi động qua file cục bộ và HTTP ở đường dẫn con; đổi Rarity không tạo lỗi runtime.
- Salvage Normal, mutation đơn, double mutation và tên mutation cũ; chạy lại không xóa bản cuối.
- Đường cong N tăng thì EXP yêu cầu tăng; hơn 2,000 ca cấp EXP đối chiếu với phép cộng từng Level, gồm gần Lv.1000 và số EXP lớn.
- Roll trùng Lv.1000 không gọi hàm yêu cầu EXP; roll, số lượng và save vẫn chạy.
- Spirit Crown trừ đúng 4,400 coin, chặn Lv.99, tiến hóa Lv.100 giữ double mutation và đặt thẻ mới về Lv.1.
- Lucky Floor 100 cấp Champion Normal, mở pool đúng thời tiết và không cấp trùng.
- Khiên vĩnh viễn/tạm thời, cộng dồn, hết hạn, né, xáo đội hình, xuyên địch, giảm damage Holy và tích trữ sát thương.
- 450 đội địch mẫu ở nhiều tầng của ba loại mới đều đúng một Element hợp lệ; retry không gọi RNG để đổi đối thủ.
- Đối chiếu cùng seed cho 133 thẻ cũ giữ kết quả chiến đấu và số lần gọi RNG; kiểm tra runtime sao chép 134 nội tại.
- Registry đủ 135 thẻ; save round-trip và từ chối payload bị sửa; Sandbox chạy hai thẻ mới không ghi thay đổi vào kho tiến trình.
- Hint nằm dưới dropdown trên desktop và không gây tràn ngang ở chiều rộng mobile 390 px.

8. TỆP BÀN GIAO VÀ TRIỂN KHAI

Gói chứa đủ 26 tệp sản xuất, gồm README.txt này:
index.html, styles.css, passives.css, app.js, cards.js, passives.js,
yuno.js, grimoire.js, levels.js, inventory.js, tower.js, timetrial.js,
raid.js, boss_event.js, achievements.js, weathers.js, mutations.js,
elements.js, background.js, evolution.js, quest.js, roll_view.js,
roll_performance.js, sandbox.js, startup.js, README.txt.

Module mới yuno.js được tải trước passives.js. Các thay đổi khác nằm trong module đúng chức năng: levels.js lo EXP; tower.js lo chọn địch/hint; evolution.js lo công thức/nguyên liệu; boss_event.js lo shop; app.js điều phối giao diện. Giữ save .acrsave và cooldown 7 ngày hiện có.

Upload đồng bộ toàn bộ gói, giữ đúng chữ hoa/thường của tên tệp. JS/CSS dùng cache version 20261017-yuno-1. Tải lại bằng Ctrl+F5 sau triển khai nếu còn cache cũ.

Người dùng tự bổ sung ảnh vào đúng đường dẫn:
assets/spiritcrown.png
assets/cards/yunospirit.png
assets/cards/yunospiritdemonic.png

Không kèm Excel, asset nhị phân, script kiểm thử hoặc log trong gói bàn giao.
