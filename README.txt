BẢN CẬP NHẬT 03/11/2026 — MATERIAL, BOMB, PORTAL MOBILE, WEEKLY QUEST VÀ SKIP ROOM

1. MATERIAL THEO ELEMENT
- Tăng xác suất rơi độc lập lên 60% cho: Corundum (Fire), Aqua Tear (Water), Holy Dust (Holy), Leaf và Veggie (Nature), Electric Ore (Electric), Dark Dust (Dark).
- Vẫn chỉ rơi khi hạ quái đúng element trong Material Time Trial. Không thay đổi tỷ lệ các material khác, công thức số lượng hay điều kiện chống nhận lặp cùng một kẻ địch.

2. RELIC BOMB
- Asset giữ nguyên: assets/items/bomborb.png. Mỗi bản Bomb roll đúng 1 trong 6 element; chỉ số và Unique chỉ có hiệu lực khi thẻ trang bị khớp element đó.
- Common: +1–5% ATK. Rare: +5–8% ATK. Legendary: +8–15% ATK.
- Giữ tỷ lệ rarity 70% / 25% / 5%; Legendary vẫn có 10% cơ hội Unique. Unique mới roll +30–300% ATK gốc cho đòn tấn công chính đầu tiên của trận.
- Bonus một lần được cộng theo ATK gốc với các buff đang có, không nhân chồng vô hạn lên ATK đã buff. Các hit trong cùng chiêu mở đầu được xử lý riêng; bonus không lan sang chuỗi follow-up, DoT, phản xạ hoặc phản đòn. Các đòn hỗ trợ follow-up trước lượt chính không tiêu thụ bonus này.
- Bomb cũ được chuyển đổi một lần sang khoảng chỉ số mới theo vị trí roll cũ trong khoảng rarity. Giữ element, rarity, Unique, ID vật phẩm và liên kết bản thẻ; không reroll ngẫu nhiên. Unique cũ giữ bonus 30%. Save cũ vẫn được chấp nhận, đọc snapshot chiến đấu bằng giá trị đã chuyển đổi.
- Recipe Bomb và các Relic khác không thay đổi. Không sửa chỉ số bất kỳ thẻ nào.

3. PORTAL TRÊN ĐIỆN THOẠI
- Sửa lớp hiển thị Portal để không bị Storage / modal phía dưới chặn thao tác.
- Giữ nguyên bộ chọn đội Arena chuẩn; cải thiện vùng cuộn, kích thước nút, vùng an toàn màn hình, header và nút Start trên viewport hẹp.
- Touch tap được xử lý đúng một lần dù việc chọn thẻ làm layout đổi vị trí; kéo cuộn và pointer-cancel không bị hiểu nhầm thành chọn thẻ. Chặn click tổng hợp sau tap và khởi tạo trận lặp.
- Solo / Party vẫn dùng cơ chế và combat Arena cũ, turn cố định 2 giây. Không thay đổi tier, attempts, thưởng, mutation hay quy tắc Auto Continue Portal.

4. WEEKLY QUEST
- Các phần thưởng Weekly trước đây kéo dài 48 giờ nay kéo dài 96 giờ: Luck từ nhiệm vụ kills / rolls, weather từ nhiệm vụ Time Trial và Drop bonus từ nhiệm vụ Boss Event.
- Áp dụng khi nhận thưởng mới. Buff đã nhận trước cập nhật giữ thời điểm hết hạn đã lưu, không tự cộng thời gian ngược hoặc nhận lại thưởng.
- Phần thưởng weather riêng 36 giờ, các phần thưởng tiền và Daily Quests giữ nguyên.

5. NORMAL TIME TRIAL — SKIP ROOM
- Thêm ô nhập số phòng và nút Skip Room trong giao diện chuẩn của Normal Time Trial. Không áp dụng cho EXP hoặc Material Time Trial.
- Giới hạn = floor(Best Room đã clear x 0,40). Ví dụ Best Room 100 cho phép tới tối đa Room 40.
- Chỉ nhảy tới phòng lớn hơn phòng hiện tại và không vượt giới hạn. Không được nhảy lùi, nhập số lẻ / rỗng / không hợp lệ hoặc skip khi đang giao chiến / hoạt động thử nghiệm.
- Phòng đích vẫn chưa được clear: nhảy tới Room 40 nghĩa là bắt đầu đánh Room 40. Không tạo chiến thắng, kill, EXP, Shards, Portal, thành tích, Best Room hoặc tiến trình Card Quest từ các phòng đã bỏ qua.
- Daily / Weekly Time Trial vẫn yêu cầu 5 lần đạt đúng phòng mục tiêu đã chốt lúc reset. Nếu phòng mục tiêu nằm trong khoảng đã bỏ qua (phòng cũ <= mục tiêu < phòng đích), được cộng đúng 1 lần cho run đó, không cộng theo số lượng phòng bỏ qua.
- Nhảy tới đúng phòng mục tiêu chưa được cộng: phải thắng phòng đó. Nhảy tiếp trong cùng run không đếm lại mục tiêu đã vượt; tiến trình luôn chặn ở mức target tối đa (5/5).
- Ví dụ Best 100, nhiệm vụ Daily chốt Room 70: skip tới 40 không tăng nhiệm vụ, cần đánh thắng 70. Nếu nhiệm vụ cũ chốt Room 20 và Best đã tăng lên 100, skip tới 40 được tính 1/5; không thể spam nhảy lùi / nhảy lại để hoàn thành.
- Run ID và receipt được lưu trước khi cập nhật quest; lỗi lưu / reload được retry theo receipt, không nhận lặp. Receipt thuộc chu kỳ cũ không cộng vào quest mới sau reset. Thua hoặc hết thời gian vẫn trở về Room 1 như cũ.
- Không sửa timer, Speed Battle Potion, EXP Training Dummy, công thức EXP hay độ khó của bất kỳ mode nào.

6. KIỂM TRA VÀ TRIỂN KHAI
- Kiểm tra cú pháp toàn bộ 69 file JavaScript; startup tải đủ 180 thẻ.
- Kiểm tra ranh giới 60% và khóa element của 7 material; các khoảng roll Bomb, element, Unique, chỉ số cộng gốc, nhiều hit, follow-up và chuyển đổi save cũ không lặp.
- Kiểm tra Skip Room: cap 40%, phòng đích, giới hạn quest 5/5, chống nhảy lại, tách EXP / Material, không sinh loot, phục hồi sau reload và qua ranh giới reset quest.
- Kiểm tra nhận thưởng Weekly Luck / weather thực tế kéo dài 96 giờ.
- Kiểm tra tap từ Storage -> Portal -> Solo -> chọn 4 thẻ -> Start -> Arena -> Exit về Storage trên viewport 320x568, 390x844 và landscape 844x390.
- So sánh combat có seed của toàn bộ 180 thẻ khi không dùng Bomb mới với bản trước: không có khác biệt trong các kịch bản kiểm tra. Giữ nguyên dữ liệu thẻ, TURN / STUN, Firebase, PvP và cấu hình scale các mode.
- Không cần asset mới; không kèm ảnh, audio hay Excel. Upload đủ source, giữ assets hiện có. Cache tag mới: 20261103-qol-relic-1. Hard-refresh Ctrl+F5 sau cập nhật.

Modified Files Note
- materials.js: 60% cho 7 material theo element và mô tả nguồn rơi.
- relics.js: range / Unique Bomb mới, validation và chuyển đổi Bomb cũ theo chất lượng roll.
- relic_combat.js: bonus đòn đầu một lần, khóa element, cộng ATK gốc và loại trừ follow-up / counter / DoT.
- passives.js: đưa bonus đòn đầu vào các đường damage chuẩn, fatal check và xử lý sai số số thực gần số nguyên.
- portals.js: tap có kiểm soát, chống kích hoạt lặp và kiểm tra trạng thái bắt đầu Solo.
- styles.css: lớp Portal, scroll / touch / nút Start mobile và giao diện Skip Room.
- quests.js: Weekly 96 giờ, xử lý quest cho skip có receipt và kiểm tra chu kỳ reset.
- timetrial.js: cap / skip phòng Normal, run ID, pending receipt, validation và lưu tiến trình.
- app.js: binding ô Skip Room, điều kiện thao tác và bridge sự kiện quest.
- index.html: controls Skip Room và đổi cache tag.
- README.txt: chỉ ghi changelog bản cập nhật này và danh sách file sửa.
