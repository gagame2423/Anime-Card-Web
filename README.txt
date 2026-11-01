BẢN CẬP NHẬT 01/11/2026 — BOSS EVENT ROTATION, RAGNA VÀ WOLTEKAMUI

1. BOSS EVENT LUÂN PHIÊN 12 GIỜ
- Bỏ hoàn toàn điều kiện weather để vào Boss Event. Weather vẫn hoạt động bình thường cho HUD và mutation của thẻ rơi.
- Mỗi khung 00:00–12:00 và 12:00–24:00 theo UTC+7 chỉ mở một Event trong pool: Alucard, Lucius, Gomen, Ragna.
- Lịch dùng seed cố định theo khung thời gian, nên cùng thời điểm mọi người thấy cùng Event; tải lại trang không reroll Event. Event mới không trùng Event ngay trước đó.
- Nhấn Boss Event trong Arena mở thẳng Event hiện tại, bỏ danh sách chọn Event. Hiển thị tên Event và thời gian đến lần đổi tiếp theo.
- Trận đang chơi được hoàn tất và nhận thưởng theo Event/difficulty đã ghi lúc bắt đầu. Nếu Event đã hết khung, Continue/Auto Continue không bắt đầu thêm trận của Event cũ; mở lại Boss Event để vào Event mới.
- Giữ nguyên ví tiền, difficulty, số trận thắng và khả năng khôi phục thưởng đang chờ của các Event cũ. Các ví vẫn tách riêng theo Event.

2. RAGNA EVENT
- Dùng giao diện Arena chuẩn: 5 thẻ người chơi đấu 1 boss, difficulty 1–1000, Speed Battle Potion theo cơ chế Boss Event hiện có.
- Boss ở difficulty 1: HP 150.000 / ATK 15.000. Giữ công thức scale chuẩn: x(1 + 0,075 x (difficulty - 1)).
- Ragna Event Coins dùng cùng đường cong coin và giá potion chuẩn Boss Event: potion thường 10 coin; Speed Battle Potion 25 coin. Hỗ trợ mua số lượng như các shop cũ.
- Tỷ lệ thẻ Ragna: 0,1% ở difficulty 1; 1% ở difficulty 1000; nội suy tuyến tính giữa hai mốc. Thẻ rơi đi qua bộ tạo mutation hiện có, tối đa 2 mutation.
- Thẻ Ragna không thuộc normal gacha. Thưởng được ghi receipt để tránh nhận lặp sau tải lại hoặc thử lưu lại.

3. THẺ SECRET MỚI
Ragna — Dragon Slayer
- ID: boss-event-ragna. Element: Water. Rarity: Secret. Rate: 1 in 0.
- HP 13.900 / ATK 56.800. Đây là chỉ số thẻ sở hữu, tách riêng chỉ số boss Event.
- Categories: Hero, AntiVillian, Brutal, DragonWarrior, Swordman, Unhuman.
- Crit gây Freeze 2 lượt. Mỗi đòn đánh nhận 1–5 Rage, tối đa 300.
- Khi chịu fatal damage và đủ 100 Rage: tiêu 100 Rage, hồi sinh lên tuyến đầu với 50% max HP trước khi chết. Giữ toàn bộ buff stat và nhận thêm +20% ATK theo stat gốc của trận.
- Các lần +20% ATK cộng dồn theo phần trăm, không nhân lên ATK đã buff. Hiển thị Rage trên thanh trạng thái combat.

Woltekamui — Godlike Speed
- ID: woltekamui. Element: Electric. Rarity: Secret. Rate sau mở khóa: 1 in 22.000.000; không khóa weather.
- HP 17.700 / ATK 72.000.
- Categories: Villian, Unhuman, DragonWarrior, Magician, PureEvil, Brutal.
- Miễn Freeze, vẫn chịu Stun. Chỉ nhận 50% sát thương Burn DoT.
- Follow-up bắt đầu ở 22%; mỗi follow-up tiếp theo tăng 5 điểm %, tối đa 72%. Mỗi đòn gây 50% ATK; đòn trúng hồi 1% max HP. Giữ các quy tắc heal/debuff và hỗ trợ follow-up hiện có.
- Dodge 22%. Dodge thành công chuẩn bị Bleed cho đòn kế tiếp: 3 lượt, 40% ATK/lượt.
- Khi đã thực hiện hơn 3 follow-up liên tiếp, đòn follow-up trúng một mục tiêu đang Bleed gây Stun 1 lượt.

4. QUEST WOLTEKAMUI — TRONG QUESTS / STORY
- Nhận quest trước; chỉ bước hiện tại được tính. Không dùng số liệu Index hay thành tích cũ để cộng hồi tố.
- Bước 1: thắng 1.000 Ragna Event ở difficulty > 100.
- Bước 2: thắng 1.000 trận 1v1 thường, tổng lượt của cả hai phía không quá 10. Không tính Online PvP.
- Bước 3: roll 100.000 lần trong Wind weather.
- Bước 4: thắng Normal Time Trial Room 100 tổng cộng 1.000 lần. Không tính Material hoặc EXP Time Trial.
- Bước 5: kích hoạt 10.000 follow-up của thẻ phía người chơi. Tính từng đòn thực thi, không đếm lặp qua các tầng xử lý hit/damage; follow-up bị chặn trước khi thực thi không được tính.
- Sandbox, Online PvP và follow-up của đối thủ không tăng quest. Trong Portal Party chỉ follow-up của thẻ thuộc chính người chơi được tính.
- Tiến trình follow-up được gom thành đợt lưu ngắn, không ghi localStorage trên từng hit; flush khi đủ mục tiêu, ẩn trang hoặc đóng trang.
- Hoàn thành nhận một Woltekamui Normal và mở khóa normal gacha. Receipt ngăn trả thẻ quest nhiều lần.

5. TRIỂN KHAI VÀ KIỂM TRA
- Upload toàn bộ source của gói cùng lúc, giữ đúng chữ hoa/thường tên file. Cache tag đã đổi; sau upload dùng Ctrl+F5.
- Người dùng tự thêm artwork assets/cards/ragna.png và assets/cards/woltekamui.png. Gói không tạo/kèm ảnh, binary asset hoặc Excel.
- Đã kiểm tra startup trình duyệt, cú pháp 68 file JavaScript, 10.000 khung rotation không trùng liên tiếp, drop/scaling, migration ví cũ, đủ 5 bước quest, cô lập Sandbox/Online PvP và chống trả thưởng lặp.
- Đã kiểm tra Rage cap, giữ buff khi hồi sinh, Freeze/Burn/dodge, chuỗi follow-up và giới hạn chance 72%.
- Đã so sánh combat 8 lượt cho mỗi thẻ trong 177 thẻ cũ với engine trước cập nhật; kết quả trùng khớp. Giữ nguyên chỉ số các thẻ cũ và source Tower, Raid, Time Trial, Portal, Infinity, Firebase, TURN/STUN và Online PvP.
- Giữ phép cộng double mutation của bản trước: Monarch + Stardust = x10 ATK và x6 HP.

Modified Files Note
- boss_rotation.js: module mới; lịch 12 giờ UTC+7, seed chung và chống lặp Event kế tiếp.
- boss_event.js: availability theo rotation, Ragna Event, ví riêng, scaling/drop và tương thích save cũ.
- cards.js: thêm Ragna, Woltekamui, categories, nội tại và nguồn mở khóa.
- ragna_passives.js: module mới cho Rage, revival, Freeze, Burn resistance, dodge, Bleed và follow-up.
- passives.js: hooks combat, Freeze immunity, buff cộng dồn và đếm follow-up đúng một lần.
- quests.js: chuỗi Woltekamui, điều kiện lượt, tracking follow-up theo đợt và bảo vệ tiến trình.
- app.js: vào thẳng Event đang mở, countdown, kiểm tra Continue, số lượt cho quest và mô tả nguồn thẻ.
- storage.js: bỏ mô tả điều kiện Heavenly weather cũ của Gojo Eye.
- index.html: bỏ selector Boss Event, thêm nhãn Event hiện tại, nạp module mới và cache tag.
- startup.js: kiểm tra module rotation và nội tại mới khi khởi động.
- README.txt: chỉ ghi changelog của bản cập nhật này và danh sách file thay đổi.
