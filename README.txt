NHẬT KÝ CẬP NHẬT — HALLOWEEN, PENNYWISE VÀ EXP TRAINING
Ngày: 31/10/2026

1. BUFF RIÊNG NGÀY 31/10
- Dùng lịch Asia/Bangkok (UTC+7), thống nhất với thời gian mở Spooky Hunt hiện có. Ngày 31/10 hàng năm áp dụng x2; từ 00:00 ngày 01/11 trở về mức thường.
- Spooky Hunt hiện dùng Spooky Coins, không có ví Candy riêng. Áp dụng yêu cầu double Candy lên toàn bộ tiền thưởng kill và clear wave của mode này; không tạo tiền tệ mới hoặc tự thêm drop thức ăn.
- Thưởng = phần thưởng cơ bản x modifier run x bonus equipment x Drop Multiplier x hệ số Halloween. Làm tròn xác suất một lần ở cuối; receipt vẫn ngăn callback lặp cộng lại.
- Wave 50 thắng ngày 31/10: Headless Horseman 10%, Myers 2%, Machete 2%, các lần roll độc lập. Ngày thường: 5%, 1%, 1%.
- Wave 1–49 không rơi ba phần thưởng đặc biệt. Không nhân đôi số lượng item trên một lần drop, giá shop, Capsule, Bread, Senzu Bean hoặc thưởng mode khác.
- Giao dịch chờ đã chốt số lượng vẫn khôi phục đúng qua mốc đổi ngày; mở rộng ngưỡng kiểm tra dữ liệu để chấp nhận payout x2 hợp lệ.
- Dashboard và Source Info hiển thị đúng hệ số/tỷ lệ theo ngày.

2. PENNYWISE
- ID: pennywise; tên: Pennywise.
- Origin: Tsuyokumi - Spooky Exclusive; native weather metadata: Tsukuyomi.
- Element: Dark; Rarity: Secret; ratio hiển thị: 1 in 27,000,000.
- Category: Villian, Brutal, PureEvil, Unhuman, Alternative.
- HP Level 1: 95,000; ATK Level 1: 9,000.
- Artwork: assets/cards/pennywise.png. Người dùng tự thêm ảnh; gói nguồn không kèm asset.
- Capsule-only: không vào gacha thường, kể cả khi hoàn thành các achievement Spooky. Không cần đang có Tsukuyomi để mở Capsule ra thẻ này.
- Capsule dành riêng xác suất 0.0001 = 0.01% cho Pennywise. Phần 99.99% còn lại phân theo trọng số pool cũ và điều kiện mở The Judgement. Mở/khóa The Judgement không làm đổi 0.01% của Pennywise.
- Bonus Halloween không tác động Capsule. Giữ nguyên roll mutation và EXP duplicate Capsule hiện có.

3. THE DEADLIGHTS
- Entry đầu: Domain 10 combat turns. Mỗi turn gồm một lượt hành động của một bên, như counter turn toàn cục hiện có.
- Đầu mỗi turn, Domain đang mở đặt Fear lên toàn bộ địch trong turn đó. Fear không cộng dồn; attack chịu Fear có 15% cơ hội miss. Hiển thị badge Fear, Hypnotized, Domain và số revive.
- Khi Pennywise lần đầu tấn công một target chưa từng bị bất kỳ unit nào tấn công trong trận: 27% Hypnotized trong 3 lượt của target. Trong mỗi lượt bị thôi miên, có 80% chọn một đồng đội còn sống làm target; nếu không có đồng đội, giữ target bình thường.
- Theo dõi trạng thái đã bị tấn công theo trận/target, không reset khi đổi đối thủ. Miss/dodge vẫn là một lần target đã bị nhắm tấn công; không roll lại điều kiện untouched mỗi lần Pennywise đánh cùng target.
- Fatal hit trong Domain: chuyển Pennywise về cuối đội, hồi 50% HP ngay trước fatal hit; ATK có hệ số x0.8 cho mỗi lần tự revive. Dùng ledger có tên để không nhân buff lặp theo render.
- Đóng Domain cũ rồi mở Domain mới trong floor(số turn còn lại / 2). Domain mới không mất ngay một lượt ở cuối chính turn revive. Nếu kết quả là 0 thì Domain đóng; không có lượt tự revive tiếp nhờ Domain đó.
- Giới hạn cứng 5 lần tự revive/trận. Domain hết hoặc passive bị khóa thì không tự revive. Giữ quy tắc chống hồi HP của Bleed và cấm revive của unit có điều kiện chết vĩnh viễn.
- HP revive tối thiểu 1. Ví dụ trước fatal hit còn 10,000 HP và Domain còn 7 turn: trở lại với 5,000 HP, Domain 3 turn; ATK gốc 9,000 thành 7,200 sau lần đầu.

4. ACHIEVEMENT SPOOKY
- Spooky Collection yêu cầu đủ 10 thẻ, gồm 9 thẻ cũ và Pennywise.
- Target, mô tả, giới hạn tracking và danh sách collection đều cập nhật lên 10.
- Giữ ID achievement và reward +0.6 EXP Multiplier; reward đã claim không bị xóa và không được claim lần hai.

5. EXP TIME TRIAL
- EXP Training Dummy: Earned EXP = floor(Total Damage x 0.25), tăng từ x0.05.
- Ví dụ 100,000 damage cho 25,000 EXP. Đây là hệ số cố định; không cộng global EXP Multiplier/potion/equipment vào phép quy đổi.
- Hệ số thực tế thuộc training_dummy.js; timetrial.js gọi chung TrainingDummySystem.expForDamage. Không sửa nhầm hệ số .05 của scaling Normal Time Trial.
- Giữ timer 300 giây, turn EXP 1 giây, Ticket, ghi damage, chốt thưởng một lần và cap Level 1000. Normal Time Trial không đổi.

MODIFIED FILES NOTE
- spooky.js: lịch ngày 31/10, payout x2, tỷ lệ Wave 50 x2, Capsule 0.01% cố định, collection và validation/source info.
- spooky_passives.js: The Deadlights, tracking target, Hypnotized, Domain, Fear và giới hạn revive.
- passives.js: nối hook tấn công/fatality/turn/target và cấp ledger ATK cho nội tại mới.
- cards.js: thêm Pennywise, thông số, origin, capsule-only và mô tả.
- achievements.js: Spooky Collection 10 thẻ.
- training_dummy.js: hệ số EXP_PER_DAMAGE = 0.25.
- app.js: chặn Pennywise khỏi roll thường, nhãn EXP và thông tin bonus Spooky đúng ngày.
- index.html: cache tag 20261031-halloween-1.
- README.txt: chỉ changelog cập nhật này.

Gói không chứa Excel, ảnh, test runner hoặc log. Upload toàn bộ nguồn, giữ assets cũ, thêm pennywise.png và Ctrl+F5 trên các client.
