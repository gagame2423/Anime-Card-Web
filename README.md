# Update 35.5.3 — JACKPOT, sao chép passive & Pause Boost

Bản vá dành cho Update 35.5.2. Toàn bộ tên kỹ năng, nhãn giao diện và thông báo trong trận vẫn dùng tiếng Anh.

## 1. Sửa lỗi bất tử vĩnh viễn của Hakari Jackpot

**Nguyên nhân:** Bộ đếm `hakariInvincible` trước đây được lưu trong vùng dữ liệu của passive đang được thực thi. Khi Lucius (All Grimoire) hoặc một thẻ khác sao chép JACKPOT, bộ đếm có thể nằm trong vùng dữ liệu bản sao, nhưng cơ chế kết thúc lượt chỉ giảm bộ đếm của thẻ gốc. Đồng thời, việc đổi wave trong Infinity không phải là trận mới; nếu trạng thái bất tử đã bị kẹt, nó tiếp tục tồn tại qua các wave.

**Cách sửa:**

- JACKPOT sử dụng mốc hết hạn chung của trận đấu và bộ đếm trên chính đơn vị sở hữu hiệu ứng. Không phụ thuộc vào ID thẻ gốc hay lượt tấn công của người sở hữu.
- Nếu bắt đầu ở slot 1, đơn vị được bất tử đúng 7 lượt chiến đấu hoàn tất; một bản sao nhận giữa lượt có đủ 7 lượt tiếp theo. Lượt bị Stun/Freeze vẫn được tính. Bộ đếm giảm từ 7 về 0 và tiếp tục xuyên suốt các wave Infinity.
- Auto Chess, Ball vs Ball và Sailing Sea dùng đồng hồ mô phỏng: 7 lượt × 1,35 giây = 9,45 giây ở tốc độ mô phỏng 1x. Không phụ thuộc số lần chạm bóng hoặc số đơn vị ra đòn.
- Hết hạn hoặc mất bản sao: gỡ trạng thái bất tử, cập nhật badge/bộ đếm và ghi thông báo `JACKPOT invincibility expired` hoặc thông báo kết thúc phù hợp trong Battle Log. Đơn vị có thể nhận sát thương bình thường sau đó.
- JACKPOT kích hoạt lúc nhận passive một lần mỗi đơn vị trong trận, không tự mở lại khi đổi wave hoặc sao chép lại. Giữ nguyên điều kiện và các giới hạn gốc: slot khác nhận +77% ATK hoặc HP; sửa lỗi cộng ATK hai lần. Hakari thường và Hakari Jackpot là hai thẻ khác nhau; không thêm cơ chế roll/domain mới ngoài mô tả gốc.

## 2. Rà soát hệ thống sao chép/đánh cắp passive

- **All Grimoire (Lucius):** bộ đếm đòn đánh, điều kiện nhận passive mỗi 5 đòn, giới hạn 5 passive, chống trùng lặp và kích hoạt đúng hiệu ứng vào trận của bản sao. Bonus khi Julius chết dùng trạng thái riêng của All Grimoire kể cả khi bản thân nó được sao chép.
- **Rider Card (Kamen Rider Decade) và Scam (Reigen):** sửa đường thực thi khi đổi nhận dạng passive, để passive mới gọi cả logic vào trận và có bộ đếm riêng.
- **Amazing World (Gumball), Khnum (Oingo), Mammon Creator (Yuuki), Ascension (The First Human), Ki ki ma ma (Jason), Kakuzu, Eren Rumbling và Time Grimoire:** dùng chung cơ chế thu hồi bản sao. Dọn hiệu ứng tạm, bonus chỉ số, hiệu ứng sát thương theo thời gian, lớp khiên và đơn vị triệu hồi thuộc bản sao; không làm mất passive khác. Trả lại passive bị Jason mượn khi bản sao chứa cơ chế này mất đi.
- Bản sao lồng nhau có phạm vi sở hữu riêng; tránh để hiệu ứng tồn tại vô hạn nếu passive cha bị thu hồi. Giữ các cổng kích hoạt một lần, bộ đếm và giới hạn đã tiêu thụ thay vì tạo lại miễn phí khi nhận lại cùng passive. Loại thẻ không thể sao chép khỏi danh sách lựa chọn.
- **Uchiha Sasuke và Android 21:** bộ đếm hết hạn hiệu ứng chỉ số tạm được cập nhật cả ở vùng dữ liệu riêng của bản sao. **Jogo, Sukuna Shibuya, Choso:** chặn cập nhật domain, thiên thạch và cooldown nhiều lần trong một tick. **Toshiro, Weather Report, Awakened Doflamingo:** đọc bộ đếm riêng của passive được sao chép.

**Kiểm thử:** chạy mô phỏng 247 thẻ × 3 kịch bản và 245 thẻ đủ điều kiện sao chép bằng All Grimoire. Kiểm tra không lỗi JavaScript, chỉ số hữu hạn và lượt tiến bình thường. Kiểm thử chuyên biệt Hakari/Lucius/Decade/Reigen trong 1v1 và Infinity (thay wave khi timer chưa hết); Gumball roll lại cùng passive; Oingo hết hạn bản sao; đồng hồ Auto Chess/Ball vs Ball và đồng bộ mô phỏng PvP. Pause Boost cũng đã được kiểm thử khi đóng/tải lại trang, với Lucky/Super Luck, Speed Battle và buff Luck/Drop của quest trên màn hình di động; kiểm tra thời lượng không trôi khi pause, bonus bị tắt và potion thường tiếp tục sau khi Super Potion hết hạn. Các kiểm thử này bao phủ cơ chế chung và những lỗi đã xác định, không phải chứng minh mọi nhánh RNG hiếm của từng thẻ.

## 3. Pause Boost

Mở **Game Settings → Pause Boost**.

- **ON:** dừng thời gian còn lại của Lucky, Rich, EXP, Speed, Speed Battle và các Super Potion, cùng buff Luck/Drop có thời hạn từ quest. Bonus tạm thời bị vô hiệu; HUD hiện **PAUSED** và giữ nguyên thời gian còn lại. Có thể đóng game rồi mở lại mà vẫn giữ trạng thái tạm dừng.
- **OFF:** tiếp tục đúng phần thời gian còn lại và bật lại bonus. Nếu Super Potion đang tạm giữ thời lượng potion thường, trạng thái đó cũng được bảo toàn.
- Bộ đếm cooldown Roll và tốc độ trận đang diễn ra được tính lại theo bonus thực sự hoạt động; không reset lượt hoặc thời hạn Time Trial.
- Weather, thời gian thế giới, reset nhiệm vụ, chỉ số cố định và hiệu ứng passive trong trận vẫn tiến bình thường. Pause Boost chỉ áp dụng buff cá nhân có thời hạn.
- Thiết lập và độ lệch đồng hồ lưu riêng trên thiết bị bằng localStorage. Không gửi thiết lập này lên Firestore; không phát sinh upload trực tiếp khi bật/tắt. Cloud Save/Backup Code vẫn chuyển đổi mốc thời hạn potion/quest sang đồng hồ chuẩn để tương thích với thiết bị khác và giữ giới hạn đồng bộ 1 giờ từ Update 35.5.2.

## 4. Cài đặt

1. Sao lưu thư mục game và dùng **Copy Backup Code** nếu muốn lưu lại tiến trình.
2. Giải nén ZIP vào đúng thư mục chứa `index.html`; chọn ghi đè các file trùng tên. File `boost_clock.js` là file mới, cần đi cùng bản vá.
3. Đăng tải các file trong bản vá lên hosting nếu đang chơi phiên bản web; không cần đổi Firebase Rules, ảnh, font hoặc audio.
4. Nhấn **Ctrl + F5** trên PC hoặc tải lại trang sau khi xóa cache trình duyệt trên điện thoại. Cả hai máy chơi PvP phải dùng cùng bản cập nhật.
5. Kiểm tra JACKPOT bằng một trận mới và mở Game Settings để thử Pause Boost với potion đang hoạt động.

### Các file trong bản vá

- Combat: `passives.js`, `turn_phase.js`, `grimoire.js`, `shibuya.js`, `akatsuki_passives.js`, `titan_passives.js`, `tensura_passives.js`, `autochess_combat.js`, `ball_combat.js`, `pvp_combat.js`.
- Boost và giao diện: `boost_clock.js` (mới), `inventory.js`, `quests.js`, `settings.js`, `potion_hud.js`, `storage.js`, `infinity.js`, `app.js`, `index.html`, `styles.css`.
- `README.md` (tài liệu này).

Chỉ các file thay đổi được đóng gói; không có thư mục assets hoặc toàn bộ codebase.
