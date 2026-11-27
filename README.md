# Update 35.5 — Fair Winds & Battle Sounds

Bản vá tiếp nối Update 35 (Sailing Sea). Mục tiêu là giảm mức tiêu hao Stamina để đội hình có thể đi biển lâu hơn và dùng chung một hệ thống hiệu ứng âm thanh (SFX) cho Sailing Sea, Main Game, Auto Chess và Ball vs Ball.

## 1. Cân bằng lại Stamina của Sailing Sea

| Cơ chế | Update 35 | Update 35.5 | Thay đổi |
|---|---:|---:|---:|
| Mỗi lượt hành động được tính phí Stamina (đòn đánh thường / kích hoạt passive đi kèm) | 4 | 1,6 | Giảm 60% |
| Kích hoạt kỹ năng Stamina, sau mỗi 4 đòn đánh có Stamina | 20 | 8 | Giảm 60% |
| Tổng chi phí của 4 hành động và 1 kỹ năng | 36 | 14,4 | Giảm 60% |
| Chi phí ước lượng của mỗi thành viên trong trận chiến ngoài màn hình (bot) | 22–48 | 8,8–19,2 | Giảm 60% |
| Hồi Stamina ngoài biển | +1,5/giây | +1,5/giây | Giữ nguyên |
| Hồi Stamina khi neo đậu an toàn | +6/giây | +6/giây | Giữ nguyên |
| Stamina tối đa | 100 | 100 | Giữ nguyên |

- Hệ thống vẫn dùng phí hành động chung của Sailing Sea, không tính phí trùng lặp cho từng hiệu ứng phụ của một đòn đánh. Lượt bị CC ngăn hành động không bị thu thêm phí.
- Mức 1,6 được giữ ở dạng số thập phân, không làm tròn xuống số nguyên. Khi đủ 8 Stamina và đến lần đánh thứ 4, thuyền viên có thể dùng kỹ năng; phép tính không làm thay đổi hệ thống Energy của Auto Chess.
- Khi hết Stamina, trạng thái Exhausted vẫn cho phép đánh thường với 75% sát thương. Không thể kích hoạt kỹ năng tốn Stamina cho đến khi hồi đủ.
- Mục tiêu là 3–5 cuộc đụng độ thông thường khi luân phiên thuyền viên và tận dụng thời gian di chuyển. Số trận thực tế phụ thuộc vào độ dài trận, tốc độ đánh, lượng HP còn lại, đội hình và độ khó; các trận Boss dài vẫn có thể cần nghỉ sớm.
- Các quy tắc hồi HP, hồi sinh, sửa tàu, giới hạn đội hình, thưởng và nhân hệ số nguyên tố không bị thay đổi.
- Lượt đi biển đã lưu vẫn có thể tiếp tục. Nếu đang có một trận chiến được tạo từ Update 35, trận đó hoàn thành với mức 4/20 cũ để tái tạo chính xác checkpoint. Các trận mới sau đó tự động sử dụng 1,6/8.

## 2. Âm thanh dùng chung toàn game

Tận dụng các tập tin MP3 đang có từ Ball vs Ball, Auto Chess và âm thanh triệu hồi đặc biệt. Bộ quản lý hiệu ứng chung giữ nguyên các đường dẫn cũ, tạo đối tượng âm thanh theo nhu cầu, tải trước một nhóm nhỏ sau thao tác thật của người chơi và sử dụng lại các đối tượng đã tải. Nhạc nền vẫn sử dụng mục Music riêng.

### Sailing Sea

- Thao tác giao diện, mở/đóng cửa sổ, đổi kiểu điều khiển, chọn đội lên tàu chiến.
- Neo đậu, rời đảo, cắm/cướp cờ, nâng cấp tàu, chế tạo Legendary Unique Relic và thay đổi trang bị.
- Cảnh báo khi tiến vào Danger Zone hoặc Storm Zone, gặp raid ở đảo, xuất hiện Golden Bounty mỗi ngày, nghe tiếng Sea Beast khi phát hiện.
- Thành công/thất bại khi bắt thuyền viên, thông báo tàu bị đánh chìm.
- Bắt đầu giao chiến, đánh nhẹ/mạnh, chí mạng, kỹ năng/passive, giáp bị đánh/vỡ, hồi máu, né tránh, CC, hạ gục, Sea Beast tấn công, Victory/Defeat/Draw.
- Chỉ phát hiệu ứng của sự kiện mới; không phát lại cả lịch sử Sea Log hay các hiệu ứng chiến đấu trong lúc tái tạo checkpoint.

### Main Game và những chế độ khác

- Âm thanh nhấn nút, chuyển tab, mở/đóng modal, chọn bài vào đội, thay mutation, trang bị/tháo Relic hoặc trang bị, chế tạo Relic. Trang bị chỉ phát âm thanh xác nhận sau khi thao tác thành công.
- Summon/Roll phát khi lượt roll thật sự bắt đầu; lượt roll bị cooldown chặn không phát âm triệu hồi. Legendary, Mythic và Secret có hiệu ứng reveal; các bài có nhạc reveal đặc biệt vẫn dùng MP3 riêng như trước.
- Standard Battle, Arena, Tower, Rift, Boss Event, Raid, Time Trial, Spooky Hunt và Portal dùng chung âm thanh đánh, chí mạng, kỹ năng, trạng thái, hồi phục, khiên/né và kết thúc trận xuất hiện trên HUD.
- Infinity có thêm hiệu ứng khi vượt qua wave và khi đội bị đánh bại. PvP dùng dữ liệu hiệu ứng của lượt chiến đấu được hiển thị và fanfare kết quả.
- Auto Chess dùng chung bộ phát cho các tiếng shop, XP, level up, fusion, draft, triển khai, countdown, thăng hạng và kết quả đã tồn tại; thêm âm thanh đánh/kỹ năng/khiên/hồi máu/CC/KO từ trận chiến đang xem của chính người chơi. Trận bot chạy ngầm và worker không tự phát tiếng.
- Ball vs Ball giữ bộ trigger va chạm, nảy tường, kỹ năng, giao diện và kết quả hiện có; không gắn thêm listener toàn cục lên những nút nội bộ của Ball để tránh nhân đôi.
- Penalty giữ hiệu ứng điện tử hiện có và tuân thủ cả mức Volume 0.

### Điều khiển và an toàn

- Tại Main Game: mở Settings → **Sound Effects** → SFX ON/OFF và Volume.
- Tại Sailing Sea: mở Settings (Captain’s Cabin) → **Sound effects** → SFX ON/OFF và Volume.
- Tại Ball vs Ball: dùng nút SFX và thanh Volume trên header.
- Ba vị trí dùng cùng thiết lập SFX lưu trong localStorage hiện có; không nhân hai mức volume riêng như trước. Thay đổi ở mode này áp dụng cho mode khác. Music/BGM vẫn được điều khiển riêng.
- Tối đa 8 hiệu ứng phát đồng thời, có khoảng cách tối thiểu giữa lần phát, ưu tiên hiệu ứng quan trọng và gộp sự kiện cùng loại trong một frame. Trình duyệt chỉ phát sau thao tác thực của người chơi; khi mute, ẩn tab hoặc chuyển khỏi mode, các hiệu ứng đang chạy được dừng phù hợp.
- Nếu MP3 tùy chọn bị thiếu hoặc không phát được, bỏ qua an toàn hoặc dùng âm có sẵn thay thế. File không hỗ trợ/không tồn tại được ghi nhớ trong phiên để không gửi yêu cầu lặp liên tục. DevTools có thể hiện lỗi tải HTTP lần đầu nếu file chưa được thêm, nhưng game không bị lỗi runtime. Thêm MP3 rồi tải lại game để thử lại.

## 3. Checklist toàn bộ MP3 MỚI cần bổ sung (không đi kèm bản vá)

Tạo thư mục nếu chưa có. Tên file và đường dẫn phân biệt chữ hoa/thường; sử dụng đúng chữ thường như bên dưới. Tất cả 15 file đều **tùy chọn**.

### Thư mục `assets/audio/`

- [ ] `assets/audio/summon.mp3` — hiệu ứng roll/summon.
- [ ] `assets/audio/rare_reveal.mp3` — reveal Legendary, Mythic, Secret (nếu không có track riêng).
- [ ] `assets/audio/relic_craft.mp3` — hoàn thành chế tạo Relic/trang bị.

### Thư mục `assets/audio/sailing/`

- [ ] `assets/audio/sailing/dock.mp3` — cập bến.
- [ ] `assets/audio/sailing/undock.mp3` — rời bến hoặc chạy khỏi đảo.
- [ ] `assets/audio/sailing/flag_capture.mp3` — chiếm/cắm cờ đảo liên quan tới người chơi.
- [ ] `assets/audio/sailing/danger_zone.mp3` — đi vào Danger Zone.
- [ ] `assets/audio/sailing/storm_zone.mp3` — đi vào Storm Zone.
- [ ] `assets/audio/sailing/island_raid.mp3` — cảnh báo raid/chiến đấu tại đảo.
- [ ] `assets/audio/sailing/golden_bounty.mp3` — công bố Wanted Target mới.
- [ ] `assets/audio/sailing/capture_success.mp3` — bắt được thuyền viên.
- [ ] `assets/audio/sailing/capture_fail.mp3` — bắt thuyền viên thất bại.
- [ ] `assets/audio/sailing/ship_sink.mp3` — tàu bị đánh chìm.
- [ ] `assets/audio/sailing/sea_beast_roar.mp3` — phát hiện Sea Beast.
- [ ] `assets/audio/sailing/sea_beast_hit.mp3` — Sea Beast tấn công.

### Những MP3 CŨ được tái sử dụng (không cần đổi tên)

Giữ nguyên các file đã thêm từ các Update trước.

**`assets/audio/ball/`:** ui_click.mp3, tab_switch.mp3, card_select.mp3, card_equip.mp3, mutation_change.mp3, modal_open.mp3, modal_close.mp3, countdown.mp3, match_start.mp3, wall_bounce.mp3, collision_light.mp3, collision_heavy.mp3, critical_hit.mp3, skill_cast.mp3, passive_trigger.mp3, shield_hit.mp3, shield_break.mp3, heal.mp3, dodge.mp3, status_apply.mp3, knockout.mp3, victory.mp3, defeat.mp3, draw.mp3.

**`assets/audio/` (Auto Chess):** shop.mp3, exp.mp3, levelup.mp3, fuse.mp3, win.mp3, lose.mp3, buy.mp3, sell.mp3, deploy.mp3, draft.mp3, travel.mp3, hextech_open.mp3, countdown10s.mp3, itob.mp3, btos.mp3, stog.mp3, gtop.mp3, ptoe.mp3, etod.mp3, dtom.mp3, mtogm.mp3, gmtoc.mp3 (mtog.mp3 là fallback cũ).

**`assets/audio/` (reveal đặc biệt):** alucard.mp3, luciuszogratis.mp3, aizenbeyond.mp3, equinox.mp3, stwr.mp3, madaralubu.mp3, wou.mp3, akaza.mp3, adultgon.mp3.

Nên dùng clip ngắn cho thao tác/đòn đánh (khoảng 0,1–0,5 giây), và clip dài hơn cho cảnh báo, reveal hoặc fanfare. Nâng cấp tàu tái sử dụng levelup.mp3; chế tạo Relic có fallback fuse.mp3. Victory/Defeat tại Sailing Sea và Main Game tái sử dụng fanfare của Ball.

## 4. Các tập tin trong patch

| Tập tin | Thay đổi |
|---|---|
| ball_audio.js | Bộ quản lý SFX dùng chung, pool theo đường dẫn, ưu tiên và fallback. |
| drop_audio.js | Mute/Volume thống nhất, các track reveal riêng và tạm dừng/tiếp tục nhạc nền. |
| autochess_audio.js, ball_view.js | Kết nối giao diện âm thanh hiện có với thiết lập và bộ phát chung. |
| game_audio_hooks.js | Tập tin mới: xử lý thao tác UI, modal và hiệu ứng kết quả/chuyển trạng thái chiến đấu Main Game. |
| sailing_combat.js, sailing_rules.js | Mức Stamina mới, đánh giá bot và version checkpoint, dữ liệu âm thanh cho sự kiện thế giới. |
| sailing_main.js, sailing_ui.js, sailing.css | Trigger âm thanh cho sự kiện Sailing, settings âm thanh, cập nhật thông tin Stamina. |
| autochess_combat.js, autochess_synergies.js, autochess_view.js | Chi phí Stamina dùng chung cho Sailing, truyền cue từ trận đấu, phát ở giao diện. |
| app.js, passives.js | Roll/reveal, chọn bài/đột biến, log và hiệu ứng chiến đấu, âm thanh khiên. |
| relics.js, equipment.js | Phát hiệu ứng khi chế tạo và trang bị thành công. |
| pvp.js, pvp_combat.js, infinity.js, penalty_view.js | Đồng bộ hiệu ứng trong các chế độ còn lại; không sửa công thức chiến đấu/phần thưởng. |
| index.html, update_logs.js | Nạp tập tin mới, cập nhật nhãn SFX, chống cache bản cũ và thêm ghi chú Update 35.5. |
| README.md | Hướng dẫn tiếng Việt này. |

## 5. Kiểm thử và cài đặt

Đã kiểm tra cú pháp các tập tin JavaScript đã thay đổi; kiểm tra bằng Chromium với code của Update 35 và bộ asset giả lập. Kiểm tra mô hình Sailing Sea với 100 seed bản đồ, hồi phục, bắt thuyền viên, nâng cấp, crafting, thắng/thua; chạy trận thử cho 247 ID bài ở 100 và 0 Stamina (494 cấu hình), kiểm tra Worker và phục hồi checkpoint. Các bài kiểm tra hồi quy Standard Battle, Ball vs Ball và Auto Chess cũng đã chạy thành công. Kiểm tra âm thanh bằng Audio giả lập cả đường dẫn hợp lệ và file thiếu, xác nhận giá trị 4 → 1,6 và 20 → 8, không thử tải lặp file lỗi, có fallback, đồng bộ volume/mute và không có lỗi JavaScript trong các bài kiểm tra. Chưa nghe thử MP3 thật vì bản vá không có những file âm thanh đó.

1. Giải nén ZIP vào đúng thư mục gốc của game đã cài Update 35 đầy đủ.
2. Cho phép ghi đè các file trùng tên, giữ nguyên mọi file khác, đặc biệt là thư mục assets và font hiện có.
3. Chép 15 MP3 tùy chọn theo đúng checklist nếu muốn hiệu ứng riêng; file chưa có sẽ được bỏ qua hoặc dùng âm thanh dự phòng.
4. Upload các tập tin đã sửa lên host (nếu chơi qua website). Cả Host và Guest của các chế độ online nên dùng cùng bản update.
5. Nhấn Ctrl + F5 trên PC hoặc tải lại trang/xóa cache trang trên mobile. Mở Settings và bật SFX; thử mức âm lượng phù hợp.
6. Vào Sailing Sea → Resume hoặc New Voyage. Không cần xóa localStorage hoặc tạo tài khoản mới.

ZIP chỉ chứa file được thay đổi hoặc thêm mới, cùng README.md. Không có thư mục assets, audio/font hay code không đổi.
