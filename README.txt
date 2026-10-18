NHẬT KÝ CẬP NHẬT — EXP TIME TRIAL, TOWER, STORAGE VÀ EQUIPMENT
Phiên bản: 20261018-equipment-1

Tài liệu chỉ ghi thay đổi của bản cập nhật này.

1. GIẢM EXP TIME TRIAL

Mỗi EXP Monster bị hạ cho lượng EXP cơ sở ngẫu nhiên bằng 0,1%–1,5% EXP cần để lên Level hiện tại, thay cho 0,5%–3,0%.

Công thức:
r = 0,001 + 0,014 × U, với U trong khoảng 0–1.
EXP chính xác = EXP yêu cầu hiện tại × r × các hệ số EXP hợp lệ + phần lẻ đang giữ.
EXP nhận = floor(EXP chính xác); phần lẻ được giữ lại theo cơ chế hiện có.

Đây là khoảng cơ sở trước buff. Bonus EXP từ Equipment áp dụng theo đúng phạm vi của món đang đeo. Card Level 1000 vẫn không nhận thêm EXP. Mỗi dummy chỉ được trao thưởng một lần; giữ cơ chế thay dummy và xử lý clone hỗ trợ trong EXP Time Trial.

Giữ EXP Time Trial 1.000 ms/lượt, Normal Time Trial 2.000 ms/lượt. Speed Battle Potion không thay đổi hai timer này. Sửa nhãn kết quả để hiển thị timer của đúng mode thay vì luôn ghi 2s. Không đổi vé, thời lượng lượt thử, Shards hoặc quy tắc reset phòng.

2. POOL TOWER VÀ LỖI LẶP NOELLE

Nguyên nhân nằm ở bộ sinh đối thủ: từ tầng cao, giới hạn rarity của slot minion thu hẹp pool đến mức Noelle được chọn quá thường xuyên; trọng số 1/RNG làm chênh lệch lớn hơn.

Bản sửa áp dụng cho đội hình Tower mới:
- Mọi thẻ đạt ngưỡng chất lượng của tầng và đúng Element đã chọn đều có thể xuất hiện trong slot minion hoặc boss.
- Không khóa minion vào nhóm rarity thấp hoặc loại Secret/thẻ 1-in-0 khỏi slot minion.
- Chọn không hoàn lại trong một đội hình: khi pool đủ ít nhất 4 thẻ, 4 vị trí có 4 card ID khác nhau. Chỉ dùng lại một ID khi một pool cấu hình nhỏ thực sự hết lựa chọn.
- Trọng số cơ sở w = RNG^(-0,15), thay cho RNG^(-1). Chênh lệch giữa các thẻ được nén để pool đa dạng hơn.
- Với slot boss, w được nhân thêm 1 + 0,25 × bậc rarity. Bậc lần lượt Common 0, Rare 1, Epic 2, Legendary 3, Mythic 4, Secret 5. Boss có thiên hướng chất lượng cao, nhưng không có danh sách cấm cứng theo vai trò.
- Thẻ 1-in-0 tiếp tục được gán RNG chọn địch ngẫu nhiên từ 100.000 đến 10.000.000 theo cơ chế trước đó.

Giữ ngưỡng chất lượng theo tầng, Element lock của từng Tower, chỉ số HP/ATK, giá shop, Tower Coins và VNĐ theo tổng sát thương. Tower vẫn không cho EXP.

Blueprint đối thủ đã khóa trong save được giữ nguyên khi thua/retry. Selection version mới là 5; record version 2, 3 và 4 hợp lệ vẫn được đọc. Đội hình mới dùng bộ chọn đã sửa sau khi qua tầng; không dùng bản cập nhật để reroll một đối thủ đang bị khóa. Các mốc thưởng Champion tiếp tục đọc từ cards.js.

Kiểm tra thống kê với seed cố định trên 1.000 tầng Normal từ 130: mỗi đội đủ 4 ID khác nhau; thấy 64 ID ở slot minion và 54 ID ở slot boss. Noelle xuất hiện 4 lần trong mẫu 4.000 vị trí này. Đây là kết quả kiểm tra mẫu, không phải hạn ngạch hoặc tỉ lệ drop được hardcode.

3. STORAGE: ITEMS, PORTALS VÀ EQUIPMENT

Thêm storage.js để tách giao diện Storage và tra nguồn item khỏi app.js. inventory.js tiếp tục quản lý số lượng, sử dụng potion, timer và giao dịch potion.

Bố cục theo ảnh tham chiếu:
- Cột trái: Items, Portals, Equipment. Không còn tên Exp Items.
- Cột giữa: Search..., grid ô item, tên, artwork, badge xN và nút xem nguồn.
- Cột phải: tên, loại, Owned, hình lớn, mô tả, trạng thái và nút thao tác.
- Ô bên trái hiển thị món đang đeo hoặc slot trống, với giới hạn 0/1 hoặc 1/1.

Items chứa potion, vật liệu và các item thông thường. Portals chứa ticket/key/portal, gồm EXP Time Trial Ticket và Marine Ford Raid Key. Equipment chứa trang bị. Các định nghĩa có số lượng 0 vẫn có thể được xem để tra cách kiếm; không thể Use/Equip một món chưa sở hữu.

Tab Equipment chỉ cho đeo một món tại một thời điểm. Equip món mới thay món đang đeo; Unequip bỏ bonus. Món mới craft nằm trong Storage, không tự đeo. Đổi trang bị/craft bị khóa khi đang combat, import hoặc trong Sandbox; sử dụng potion trong combat vẫn theo cơ chế cũ.

Storage dùng màu nền tối, viền xanh, panel riêng và vùng cuộn theo cột. Trên mobile, chi tiết chuyển xuống dưới grid nhưng vẫn giữ thanh category. HUD potion được chừa khoảng trống để không che nút thao tác.

Artwork dùng đúng assets/items/ theo danh sách ở mục 5. Khi thiếu ảnh, hiển thị chữ viết tắt gọn trong ô; không tạo asset thay thế hoặc để chữ tràn lên tiêu đề.

4. SOURCE INFO CHO ITEM

Nút tròn thông tin trên từng ô và nút Source Info ở panel chi tiết mở cửa sổ liệt kê nguồn item.

Nguồn được đối chiếu với cấu hình thật của Tower Shop, Time Trial Shop, Marine Ford Raid Shop, các Boss Event Shop, pool potion thường và công thức craft. Hiện giá/đơn vị tiền cụ thể, nguồn vé/key và yêu cầu mutation của công thức Equipment. Vật liệu chỉ mua ở shop vẫn nằm trong Storage/Evolution và có Source Info; không bị thêm trở lại danh sách craft.

Ví dụ:
- EXP Time Trial Ticket: 50 Time Trial Shards.
- Marine Ford Raid Key: 10% sau thắng 1v1/4v4 thường.
- Spirit Crown: 4.400 Lucius Event Coins.
- Equipment: ghi các thẻ/mutation phải tiêu và chi phí VNĐ tương ứng.

Nếu một item mở rộng trong tương lai chưa có nguồn đăng ký, giao diện báo chưa có nguồn thay vì tự suy đoán. Metadata source dạng văn bản được hỗ trợ.

5. TÁM EQUIPMENT CÓ THỂ CRAFT

Mọi công thức tiêu đúng 1 bản cho mỗi thẻ được liệt kê và đúng lượng VNĐ. Không yêu cầu Level. Khi công thức cho phép Double Mutation, chỉ cần mutation yêu cầu có trong biến thể. Khi yêu cầu Normal, biến thể phải có 0 mutation. Cặp mutation chính xác không phụ thuộc thứ tự.

Crafting hiện có 12 công thức: 4 Super Potion giữ nguyên và 8 Equipment mới. Required Items của Equipment hiển thị từng thẻ, điều kiện mutation, số đang có/số cần và hộp chọn biến thể hợp lệ sẽ bị tiêu. VNĐ hiện có và giá craft hiển thị ở nút Craft 1x. Những bản khác của cùng thẻ hoặc mutation khác không bị trừ theo.

1) Cid Birb — equipment_cid_birb
Ảnh: assets/items/cidbirb.png.
Công thức: 1 Cid Atomic có Monarch, chấp nhận Double Mutation chứa Monarch, + 5.000.000 VNĐ.
Buff: Mutation chance x1,10; +30% VNĐ mọi nguồn; +10% EXP mọi nguồn.

2) Padoru — equipment_padoru
Ảnh: assets/items/padoru.png.
Công thức: 1 Saber có đúng Frost + Angelic, cả hai thứ tự đều hợp lệ, + 24.120.000 VNĐ.
Buff: +36% VNĐ mọi nguồn; +1,2 Luck.

3) Sasuke Sharingan — equipment_sasuke_sharingan
Ảnh: assets/items/smks.png.
Công thức: 1 Sasuke Kid có đúng Storm + Wet, cả hai thứ tự đều hợp lệ, + 1 Uchiha Sasuke có Storm, chấp nhận Double Mutation chứa Storm, + 2.500.000 VNĐ.
Buff: +50% VNĐ từ Arena; +5 điểm phần trăm cơ hội xuất hiện Weather.

4) Vampire Glove — equipment_vampire_glove
Ảnh: assets/items/vampireglove.png.
Công thức: 1 Alucard Normal, không có mutation, + 6.666.666 VNĐ.
Buff: +3,3 Luck.

5) AntiMagic Sword — equipment_antimagic_sword
Ảnh: assets/items/amsword.png.
Công thức: 1 Demon Asta Normal + 1 Asta Normal, cả hai không có mutation, + 3.333.333 VNĐ.
Buff: +0,333 Drop Multiplier; +33% VNĐ từ Arena; +33% EXP từ Arena.

6) Mera Mera Nomi — equipment_mera_mera_nomi
Ảnh: assets/items/merafruit.png.
Công thức: 1 Ace có Solar, chấp nhận Double Mutation chứa Solar, + 10.000.000 VNĐ.
Buff: +1,5 Luck; +1,5 điểm phần trăm Weather chance; Mutation chance x1,015.

7) Kamen Rider Belt — equipment_kamen_rider_belt
Ảnh: assets/items/krbelt.png.
Công thức: 1 Kamen Rider Kabuto Normal + 1 Kamen Rider Decade Normal + 1 Kamen Rider Kuuga Normal, cả ba không có mutation, + 1.000.000 VNĐ.
Buff: +1,8 Luck; +18% Roll Speed.

8) Poker Card — equipment_poker_card
Ảnh: assets/items/pokercard.png.
Công thức: 1 Hakari có Clove, chấp nhận Double Mutation chứa Clove, + 1 Hakari Jackpot Normal không mutation, + 777.777.777 VNĐ.
Buff: +7 Luck.

6. CÔNG THỨC BONUS VÀ CHỐNG CỘNG DỒN

equipment.js lưu duy nhất ID của món đang đeo. Định nghĩa buff/công thức là dữ liệu bất biến trong source. Bonus được đọc lại từ slot hiện tại khi tính kết quả; không ghi cộng vào HP, ATK, upgrade hoặc chỉ số nền của thẻ. Số lượng Equipment sở hữu không nhân bonus. Đổi món, đeo lại, render hoặc reload không làm tăng dần chỉ số.

Mutation:
p hiệu lực = min(0,25; p cơ sở của weather × (1 + bonus mutation của món đang đeo)).
+10% nghĩa là x1,10, không cộng 10 điểm phần trăm. +1,5% nghĩa là x1,015. Ví dụ Wet 10% với Cid Birb thành 11%; mutation Rare 2,5% thành 2,75%. Hai mutation tiếp tục thử độc lập và dùng tích xác suất; ví dụ hai rate 11% và 2,75% cho tích 0,3025%. Giới hạn tối đa hai mutation và cơ chế chọn khi nhiều weather cùng hoạt động được giữ nguyên. Bonus này áp dụng vào mutation của thẻ người chơi nhận qua roll/Raid/Boss; không tăng mutation của địch.

Luck:
Cộng Luck cố định của một món vào phần Luck nền cùng upgrade/achievement/weather/quest, rồi áp dụng potion theo công thức sẵn có. Poker Card cấp +7, không nhân 7 lần số trang bị trong kho.

Roll Speed:
Hệ số tốc độ cũ × (1 + bonus Roll Speed Equipment).
Kamen Rider Belt: cooldown mới = cooldown khi không đeo / 1,18. Không thay interval combat.

Weather:
Cơ hội trigger cũ 55% mỗi nhịp kiểm tra 300 giây được cộng bonus theo điểm phần trăm, tối đa 100%. Sasuke Sharingan thành 60%; Mera Mera Nomi thành 56,5%. Giữ phân bố tier Weather và thời lượng Weather đang có.

VNĐ và EXP:
Hệ số Equipment = 1 + bonus mọi nguồn + bonus Arena nếu nguồn đang tính là Arena.
Chỉ có một món đeo nên không cộng bonus của các món trong kho.

Bonus mọi nguồn áp dụng cho salvage/auto-salvage, thưởng VNĐ quest/achievement và các thưởng tương ứng khác. Với quest tăng tiền, chỉ phần VNĐ mới nhận được nhân bonus, không nhân lại toàn bộ số dư. Bonus EXP mọi nguồn áp dụng cho roll mới, duplicate và EXP từ các trận có thưởng EXP.

Arena gồm các chế độ chiến đấu sản xuất. Bonus chỉ nhân phần thưởng vốn tồn tại: Tower vẫn 0 EXP; Raid/Boss chỉ cho loại tiền và drop riêng; Normal Time Trial vẫn không cho VNĐ/EXP. EXP Time Trial nhận bonus EXP Arena nhưng vẫn không có VNĐ. Sandbox không nhận, tiêu hoặc ghi tiến trình thật.

Drop:
Drop Multiplier hiệu lực = hệ số achievement đang có + bonus drop quest đang active + bonus drop của món đang đeo.
AntiMagic Sword cộng đúng 0,333. Áp dụng vào số lượng item/coin/key qua cơ chế làm tròn ngẫu nhiên sẵn có; không biến thành VNĐ/EXP bonus hoặc cộng vào xác suất mutation.

Validator phần thưởng đang chờ của Raid/Boss chấp nhận tổng bonus hợp lệ hiện tại. Với một buff Daily và một Weekly: 1 + 0,45 Raid achievement + 0,90 Boss achievement + 0,10 Daily + 0,25 Weekly + 0,333 Equipment = 3,033. Khi nhận sát ranh giới reset, hai buff cùng loại từ hai chu kỳ liên tiếp có thể còn hiệu lực: ngưỡng schema vì vậy cho phép 1 + 0,45 + 0,90 + 2 × 0,10 + 2 × 0,25 + 0,333 = 3,383, có dung sai số thực 1e-8. Đây là giới hạn kiểm tra schema cho các nguồn hiện có, không phải thay đổi hệ số thưởng hoặc thời lượng buff của Raid/Boss/Quest.

7. GIAO DỊCH VÀ SAVE

Khóa mới: anime_card_rng_equipment_v1, gồm version 1, equipped và pending. Không dùng chung với mảng lineup thẻ mang tên equipment trong save chính cũ.

Trước craft, coordinator lập mainAfter/itemsAfter trên bản sao save, kiểm tra lại đúng biến thể và tiền. equipment.js ghi journal trước, ghi hai store rồi xóa journal khi commit thành công. Khi ghi lỗi, khôi phục thẻ/VNĐ/item; nếu trình duyệt bị đóng giữa chừng, journal được khôi phục trước lúc app.js tải state ở lần mở sau. Khi không thể khôi phục vì storage chưa khả dụng, chặn craft/roll/battle mới và yêu cầu reload để bảo vệ tiến độ.

Biến thể người dùng đã chọn nhưng không còn tồn tại sẽ bị từ chối; không tự lấy một mutation khác để craft. Bản thân công thức là thao tác tiêu thẻ đã nêu rõ trong Required Items, có thể tiêu bản cuối của biến thể được chọn. Cơ chế Salvage Extra Duplicates tiếp tục giữ một bản mỗi biến thể theo quy tắc cũ.

Equipment store được export/import cùng .acrsave. Import kiểm tra ID, trạng thái journal đã hoàn tất và xác nhận món đang đeo có trong item save. Save cũ không có store Equipment bắt đầu với slot trống. Không đổi checksum, lớp bảo vệ save hoặc cooldown xuất/nhập độc lập 7 ngày.

8. MODIFIED FILES NOTE

Danh sách đầy đủ 14 tệp được tạo, sửa hoặc refactor trong bản cập nhật này:

1) equipment.js — TẠO MỚI: 8 công thức, kiểm tra mutation, slot độc quyền, bonus bất biến, journal craft và khôi phục giao dịch.
2) storage.js — TẠO MỚI: layout ba vùng, category, chọn item, Use/Equip/Unequip, cache render và Source Info.
3) crafting.js — thêm công thức Equipment, card ingredients, chọn biến thể, giá VNĐ và nối giao dịch craft mới.
4) timetrial.js — giảm khoảng EXP cơ sở xuống 0,1%–1,5% và cập nhật mô tả dummy.
5) tower.js — bỏ pool vai trò quá hẹp, trọng số nén theo RNG, ưu tiên boss có kiểm soát, chọn không lặp và tương thích encounter cũ.
6) mutations.js — thêm successChance và tham số multiplier, giữ phép thử độc lập và cap 25% mỗi rate.
7) inventory.js — công bố ngưỡng Drop Multiplier hợp lệ hiện tại cho validator phần thưởng đang chờ.
8) raid.js — validator chấp nhận bonus Equipment/quest hợp lệ trong pending reward; không đổi gameplay Raid.
9) boss_event.js — validator chấp nhận cùng tổng bonus hợp lệ; không đổi gameplay Boss Event.
10) app.js — nối Equipment vào các nguồn Luck/EXP/VNĐ/Drop/Weather/roll speed, chuẩn bị giao dịch trên save sao chép, nối Storage và export/import, guard khi recovery lỗi, sửa nhãn timer kết quả Time Trial.
11) index.html — Storage mới, cửa sổ Source Info, tải equipment.js/storage.js đúng thứ tự defer và cập nhật cache version.
12) styles.css — giao diện Storage, responsive/HUD spacing, card ingredient, fallback artwork không tràn chữ.
13) startup.js — thêm chẩn đoán thiếu EquipmentSystem hoặc StorageSystem.
14) README.txt — changelog hiện tại, công thức và danh sách thay đổi này.

Các tệp sản xuất còn lại giữ nguyên nội dung và được đóng gói đầy đủ.

9. KIỂM TRA VÀ TRIỂN KHAI

Đã kiểm tra cả 8 công thức qua giao diện trình duyệt, đúng card ID/mutation/tiền, Level của bản còn lại không đổi, từ chối lựa chọn stale và giữ các mutation không phải nguyên liệu. Đã kiểm tra riêng cặp mutation đảo thứ tự, Normal nghiêm ngặt, Double Mutation có chứa mutation yêu cầu, 100 lần đổi trang bị không tăng lặp bonus và các hệ số mọi nguồn/Arena.

Đã kiểm tra rollback tại ba bước lỗi ghi: journal, main save và commit marker; khôi phục khi reload giữa giao dịch; không mất nguyên liệu hoặc nhân đôi output. Đã kiểm tra export/import mã hóa, validator slot và slot/quantity sau reload.

Đã kiểm tra nguồn item, tìm kiếm, tab Storage, Equip/Unequip và bố cục desktop/mobile 390 px; các control craft vẫn truy cập được khi cuộn. Đã kiểm tra hai biên EXP, ghi thưởng một lần, timer hai mode, đội Tower cùng Element/không trùng ID, retry khóa đội hình và thưởng Elite 100/110 không đổi. Đã kiểm tra Sandbox khi đang đeo Equipment: không craft/equip và combat không thay đổi các store thật.

Gói hoàn chỉnh gồm 35 tệp nguồn sản xuất, tính cả README.txt. Không kèm Excel, asset ảnh/âm thanh, script kiểm thử hoặc log. Dùng thư mục assets sẵn có và đặt 8 ảnh Equipment đúng tên tại assets/items/. Cache JS/CSS: 20261018-equipment-1. Upload đồng bộ toàn bộ nguồn, rồi Ctrl+F5 nếu trình duyệt còn giữ cache cũ.
