# Update 34.5 — Ball vs Ball: sửa passive, giao diện và âm thanh

**Bản vá dành cho mã nguồn Update 34 trong tệp anime-card-rng-autochess.rar bạn gửi.** Chỉ chép các tệp trong ZIP vào thư mục game hiện tại. Không thay thư mục assets, dữ liệu thẻ, vật phẩm hoặc ID lưu game.

## 1. Sửa Equinox (Emotional Meter)

### Nguyên nhân

- Logic native của Equinox trong `passives.js` (ID `tower-champion-normal`) vẫn có thể thay đổi giá trị meter, nhưng Ball HUD chỉ đọc danh sách hiệu ứng trạng thái, không đọc badge nội tại. Vì vậy thanh biến mất. Trong va chạm hai bên cùng đánh, hai lần thay đổi trái dấu còn có thể gần như triệt tiêu nhau.
- Khi đạt 100% Negative, đường xử lý AoE dùng chung đã giới hạn vụ nổ trong bán kính mặc định, bỏ sót các orb xa mặc dù mô tả yêu cầu đánh toàn bộ đội địch.
- Một số đường hồi sinh đồng đội chưa thống nhất điều kiện cấm hồi sinh và clone của Equinox.

### Cách sửa

- Giữ cùng bộ đếm của engine. Bắt đầu 50% Positive / 50% Negative. Mỗi đòn chính dịch 10–20 điểm % sang Positive; mỗi đòn nhận vào dịch 10–20 điểm % sang Negative. Tổng luôn là 100%; bonus tài nguyên hợp lệ từ Relic vẫn theo cơ chế gốc.
- +100%: khóa cho đến hết trận; tất cả đồng minh còn sống, gồm Equinox, nhận +100% Max HP và +25% ATK đúng một lần.
- −100%: khóa, đánh mọi địch còn sống bằng x25 ATK hiện tại, áp dụng quy tắc nguyên tố/phòng thủ hiện có, sau đó chết vĩnh viễn. Hiệu ứng nổ bao phủ cả các mục tiêu xa. Quy tắc hồi sinh/clone của Equinox được kiểm tra nhất quán.
- HUD hiện thanh hai màu, số Positive/Negative, POSITIVE LOCK hoặc NEGATIVE LOCK. Bấm hoặc rê chuột để xem tooltip. Nhật ký hiển thị thay đổi meter và thông báo khi khóa. Sau khi bị loại, meter vẫn hiện trên dòng đội hình gốc.
- Không tạo bộ đếm thứ hai ở giao diện, không reset theo mỗi tick hay mở tooltip.

### Kết quả kiểm thử riêng

- Positive, seed cố định: 50 → 67 → 85 → 100. Bốn thành viên mẫu có Max HP từ 10.000.000 lên 20.000.000 và ATK từ 1.000 lên 1.250. Đòn đánh tiếp theo giữ nguyên khóa, không cấp buff lần hai.
- Negative: 50 → 63 → 76 → 96 → 100. Equinox còn 0 HP, chết vĩnh viễn. Bốn orb địch đặt xa đều nhận đúng 8.333 sát thương trong mẫu (25 × 1.000 ATK, sau điều chỉnh nguyên tố và làm tròn của engine). Không bị hồi sinh hoặc tạo clone.

## 2. Sửa passive và đồng hồ combat

- Tách cổng hành động cho từng đòn chính từ va chạm. Đồng hồ lượt riêng vẫn tiến mỗi 1,35 giây. Sửa các chuỗi form, stance, kỹ thuật và đòn kích hoạt của Kuuga, Demon Asta, Enten, Kaiser, Yamamoto, Itachi...
- Son Goku: Kamehameha đòn thứ 5 gây đúng 10 hit × 10% ATK theo mô tả, không biến thành Burn kéo dài. WhiteBeard, Grimmjaw và Cid Atomic dùng một hành động AoE đúng số mục tiêu, không gọi đòn thường lặp làm nhảy bộ đếm.
- Những passive ghi rõ đánh toàn đội (Tsunami, Aizen Beyond, Thukuna...) giữ đủ phạm vi quy định. Kỹ năng Pierce, Blast, Strike được thiết kế theo hình học của Ball Arena vẫn có vùng va chạm tương ứng.
- Timer (Pennywise, Myers, Kaguya, Jogo, Sukuna, Choso, Broly, Crystal Heart, Diane, Aura/Rock, Puppet...) được xử lý một lần mỗi tick, không bị trừ/tích lặp theo số orb. Thời gian tính theo lượt riêng vẫn thuộc đúng chủ sở hữu.
- Bulma/Senku xử lý lượt đồng minh, Deidara hỗ trợ khi đồng minh thực sự tấn công. Shadow The World Requiem có đường kích hoạt đòn bổ sung Time Rewind trong chế độ vật lý, có giới hạn chuỗi an toàn.
- The Clown và Pain hiện Awaiting impact trước khi chọn mode/path, không còn badge rỗng hoặc chữ undefined.
- HUD đọc tài nguyên, tiến trình đòn, form, số lần sống sót và timer từ chính runtime native. Các badge quan trọng ở thanh compact; bấm PASSIVE xem toàn bộ thông tin hiện có, số đòn, hit, follow-up, lượt riêng, kill. Tooltip không kích hoạt passive hay tiêu tài nguyên.
- Giữ quy tắc shield gốc, giới hạn follow-up và cách Relic áp dụng. Không đổi rarity, ID, mutation, chỉ số gốc, tỷ lệ roll hoặc dữ liệu sở hữu. Các chỉnh sửa riêng của Ball được giới hạn theo mode; worker Auto Chess đồng bộ phiên bản module dùng chung.

## 3. Giao diện Pixel gọn hơn

- Đã sử dụng chính file font **RobloxPixel.otf** bạn gửi để kiểm tra. Giảm font-size, line-height và padding tương ứng với font rộng. Chữ HUD thông thường khoảng 7,5–10 px, tiêu đề lớn hơn theo vai trò. Không giả lập font đậm. Nút, bộ lọc, tên thẻ, chỉ số giữ một dòng hoặc ellipsis có title/tooltip.
- Ball Index chỉ có **một ô cho mỗi card ID**. Các variant Normal / Wet / Solar / mutation kép được nhóm; số thẻ sở hữu và số variant hiển thị trên ô. Mutation là dropdown nhỏ gọn, bản sao cụ thể và Relic đang gắn được chọn bên dưới. Không gán trùng bản sao vào hai slot hay cộng thêm số lượng do record trùng.
- Canvas thu gọn chữ, viết tắt số K/M/B khi cần và nhóm popup nhiều hit gần nhau ở mức hiển thị, tránh chữ chồng nhau. Hit thật, sát thương và log chi tiết không thay đổi. HP/Energy có thanh rõ ràng và % riêng. Nhật ký Player/Enemy giữ màu passive, crit, status; dùng luồng chữ bình thường, không ép từng mảnh chữ thành flex.
- Giữ sân vuông 1:1. Desktop 3 cột, mobile dọc xếp sân trước hai bảng chi tiết, mobile ngang ngắn thu sân để vừa màn hình. Tooltip theo cùng orb và dữ liệu, không thay node của badge mỗi tick.
- Update Logs có mục 34.5 — Rebound Refinements.

## 4. Âm thanh Ball vs Ball

Module mới `ball_audio.js` quản lý cache/voice và khoảng cách phát tối thiểu cho từng cue. Ưu tiên crit, kỹ năng, vỡ khiên, kết quả; tối đa 8 voice đồng thời. Các va chạm cùng khung hình được chọn theo nhóm âm thanh, không tạo Audio mới cho mỗi hit. Hàng đợi âm thanh không ảnh hưởng RNG hoặc cơ chế combat.

- Nút SFX ON / OFF và thanh VOL ở header. Âm lượng riêng lưu localStorage, tôn trọng cài đặt SFX/volume chung của game. Tắt tiếng, đóng chế độ hoặc chuyển tab trình duyệt sẽ dừng âm thanh đang phát.
- Đếm ngược 3–2–1 trước trận, tiếng bắt đầu, va tường, va cầu, crit, passive, kỹ năng, khiên, heal, dodge, status, KO và thắng/thua/hòa.
- MP3 tùy chọn. Thiếu file vẫn chơi được. Lỗi tải được cache, không thử lại liên tục; lỗi autoplay được xử lý. Trình duyệt có thể báo 404 một lần với đường dẫn không tồn tại.
- **Đặt file MP3 bạn tự chuẩn bị vào `assets/audio/ball/`**, đúng tên sau:

| Tên file MP3 | Sự kiện |
|---|---|
| ui_click.mp3 | Bấm nút / điều khiển |
| tab_switch.mp3 | Chuyển tab, mode, slot, trang |
| card_select.mp3 | Chọn thẻ |
| card_equip.mp3 | Gán thẻ vào slot |
| mutation_change.mp3 | Đổi / lọc mutation |
| modal_open.mp3 | Mở chế độ hoặc xác nhận |
| modal_close.mp3 | Đóng chế độ hoặc xác nhận |
| countdown.mp3 | Mỗi nhịp đếm ngược 3–2–1 |
| match_start.mp3 | Bắt đầu trận |
| wall_bounce.mp3 | Va tường / nạp Energy |
| collision_light.mp3 | Va cầu nhẹ |
| collision_heavy.mp3 | Va mạnh hoặc sát thương lớn |
| critical_hit.mp3 | Chí mạng |
| skill_cast.mp3 | Kỹ năng / Energy / AoE |
| passive_trigger.mp3 | Kích hoạt nội tại |
| shield_hit.mp3 | Khiên hấp thụ đòn |
| shield_break.mp3 | Vỡ khiên |
| heal.mp3 | HP thực sự được hồi |
| dodge.mp3 | Né đòn |
| status_apply.mp3 | Hiệu ứng trạng thái |
| knockout.mp3 | Loại đơn vị |
| victory.mp3 | Thắng |
| defeat.mp3 | Thua |
| draw.mp3 | Hòa |

Không kèm MP3, font hoặc ảnh. Chuỗi fallback font: `assets/fonts/RobloxPixel.ttf`, `RobloxPixel.otf`, `RobloxPixel.woff2`. Chỉ cần đặt OTF bạn đã gửi vào `assets/fonts/RobloxPixel.otf`, đúng hoa thường.

## 5. Kiểm thử và checklist toàn bộ thẻ

Đã đối chiếu **247/247** card có passive trong dữ liệu, **247/247** đăng ký và phân loại hook; không thiếu ID/phân loại. Bảng dưới đây được tạo từ kết quả chạy thực tế.

- **741 ca chạy** (3 ca/thẻ): Duel 1v1; Squad 4v4, mỗi ca tối đa 25 giây giả lập hoặc kết thúc sớm; ca hook điều khiển gồm vào trận, tối đa 24 chuỗi đòn, lượt riêng, giảm HP, đòn chí tử và kill. Sử dụng seed cố định. Kiểm tra trạng thái, HP/ATK/Max HP/Shield/Energy hữu hạn, dữ liệu tooltip và nhãn bộ đếm.
- Kết quả: **741/741 ca hoàn thành**, không ghi nhận lỗi JavaScript, trạng thái không hữu hạn hoặc nhãn/bộ đếm lỗi trong các ca này.
- Kiểm thử riêng: hai nhánh Equinox; Kuuga đủ 3 form trong cùng tick; Demon Asta; Son Goku 10 hit; Quake 2 địch; Grimmjaw/Cid 4 địch; Pennywise/Kaguya; Gumball 9 lần sống sót; Time Rewind; các timer Broly/Beast Titan/Piccolo/Diane; heal & shield break. Kiểm tra Bleed chặn hồi máu, Poison/Bleed hết đúng giờ, tooltip giữ node, thưởng 0–5 Gems và không trả hai lần. Auto Chess native và worker cho cùng kết quả trong trận hồi quy có cả 3 kiểu AoE.
- Kiểm thử UI bằng font OTF thật ở 1440×900, 1280×720, 1024×768, 390×844, 320×640 và 844×390. 10 card mẫu / 30 variant hiện 10 ô. Kiểm tra chọn mutation, chống gán trùng bản sao, meter, tooltip và audio. Thử thiếu toàn bộ 24 MP3: mỗi file chỉ được yêu cầu một lần; mute/volume lưu, không lỗi JS. Các cue âm thanh còn được kiểm tra bằng đối tượng Audio giả lập; chưa có MP3 thật để kiểm tra âm sắc.
- **Cách đọc bảng:** “Đạt 3/3; giữ logic” = khớp registry, vượt qua 3 ca kiểm tra trạng thái/HUD, chưa phát hiện lỗi cần sửa riêng ở thẻ đó. “Đã sửa” = có thay đổi native hoặc badge/đường hook cụ thể, sau đó cũng đạt 3/3. Tất cả thẻ hưởng HUD passive dùng chung. Số đòn là đếm native cao nhất ghi nhận trong từng ca Duel / Squad / Hook; thẻ tự hy sinh có thể bằng 0.
- Các ca có seed và sự kiện chủ động bao phủ nhiều nhánh thực tế, nhưng không chứng minh mọi tổ hợp RNG, Relic, mutation, cấp độ, passive sao chép. Không khẳng định đã xác minh tuyệt đối mọi nhánh ngẫu nhiên hiếm chưa chạy.

| # | Thẻ (ID gốc) | Passive | Đòn Duel / Squad / Hook | Kết quả kiểm tra riêng |
|---:|---|---|---:|---|
| 1 | Naruto Kid (starter-common) | First Strike | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 2 | Normal Demon (normal-demon) | Lifesteal | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 3 | Sasuke Kid (sasuke-kid) | Chidori | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 4 | Powerless Guy (deku-mc) | What can i get you sir | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 5 | Ichigo Young (starter-rare) | Afterimage | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 6 | Gon Kid (gon-kid) | Rock | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 7 | Tanjiro (tanjiro) | Rock | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 8 | Luffy Kid (starter-epic) | GOMU NO MU NO PISTOL | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 9 | Six Seven (six-seven) | SIX SEVEN | 5 / 16 / 23 | Đạt 3/3; giữ logic. |
| 10 | Kaneki (kaneki-ghoul) | GHOUL | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 11 | The Trapper (the-trapper) | Trap | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 12 | Nezuko (nezuko) | Bleed | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 13 | Buggy (buggy) | Chop Chop | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 14 | Bounty Hunter (bounty-hunter) | BOUNTY | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 15 | Jotaro Kujo (jotaro-kujo) | Ora Ora | 27 / 36 / 50 | Đạt 3/3; giữ logic. |
| 16 | Hakari (hakari) | Lucky Train | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 17 | Saber (saber) | EXCALIBUR!!! | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 18 | Jonathan Joestar (jonathan-joestar) | HAMONNN | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 19 | Son Goku (starter-legendary) | Kamehameha | 8 / 16 / 9 | Đã sửa, đạt 3/3: Kamehameha thành 10 hit x10% ATK vào đòn thứ 5. |
| 20 | Vegeta (vegeta) | Super Vegeta | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 21 | Kakashi (kakashi) | Kamui | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 22 | Kamen Rider Kuuga (kr-kuuga) | KUUGA | 8 / 16 / 23 | Đã sửa, đạt 3/3: Đổi form theo đòn chính, kể cả nhiều va chạm cùng tick. |
| 23 | Bulma (bulma) | WISH | 8 / 16 / 24 | Đã sửa, đạt 3/3: Buff chỉ áp dụng ở lượt đồng minh. |
| 24 | Denji (denji) | POCHITA | 11 / 19 / 38 | Đạt 3/3; giữ logic. |
| 25 | Uchiha Itachi (uchiha-itachi) | Amaterasu | 11 / 19 / 35 | Đạt 3/3; giữ logic. |
| 26 | Madness Doctor (madness-doctor) | Madness | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 27 | Erza (erza) | MAGIC ARMOR | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 28 | Yuji Itadori (yuji-itadori) | BLACK FLASH | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 29 | Guts (guts) | OUTRAGE | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 30 | Polnareff (polnareff) | SILVER CHARIOT | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 31 | The Flash (the-flash) | FLASH | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 32 | Rimuru (rimuru) | SLIME | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 33 | The Truth (starter-secret) | Omniscience | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 34 | Viltrumite (viltrumite) | PUNCH | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 35 | Mahito (mahito) | Idle Transfiguration | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 36 | BlackBeard (blackbeard) | Liberation | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 37 | Garp (garp) | Fist of Love | 8 / 15 / 23 | Đạt 3/3; giữ logic. |
| 38 | Erwin (erwin) | CAPTAIN | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 39 | Boa Hancock (boa-hancock) | Mero Mero | 6 / 16 / 23 | Đạt 3/3; giữ logic. |
| 40 | Senku (senku) | Chemistry | 8 / 16 / 23 | Đã sửa, đạt 3/3: Chỉ hồi đội ở lượt đồng minh. |
| 41 | Grimmjaw (grimmjaw) | Gran Rey Cero | 8 / 16 / 23 | Đã sửa, đạt 3/3: Đòn thứ 5 x2 toàn bộ địch, không đánh trùng. |
| 42 | Reigen (reigen) | Scam | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 43 | Kamen Rider Kabuto (kamen-rider-kabuto) | CLOCK UP | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 44 | Meruem (meruem) | Aura Synthesis | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 45 | Frieza (frieza) | Telekinesis | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 46 | Adam Francis (adam-francis) | Champion of Light | 8 / 18 / 23 | Đạt 3/3; giữ logic. |
| 47 | Katakuri (katakuri) | MOCHI | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 48 | WhiteBeard (whitebeard) | Quake Hermit | 6 / 14 / 23 | Đã sửa, đạt 3/3: Quake đánh đúng 2 mục tiêu gần, không đếm thêm đòn. |
| 49 | Doppio (doppio) | FROG | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 50 | Shanks (shanks) | HAKI | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 51 | Metal Cooler (metal-cooler) | CLONE | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 52 | Gohan (gohan) | MASENKO | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 53 | Yuno (yuno) | Zephyr Bow | 8 / 23 / 30 | Đạt 3/3; giữ logic. |
| 54 | Asta (asta) | ANTI MAGIC | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 55 | Demon Asta (asta-demon) | ANTI MAGIC BOOK | 8 / 16 / 23 | Đã sửa, đạt 3/3: Chọn mode theo mỗi đòn chính trong Ball. |
| 56 | Nami (nami) | Greedy | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 57 | Giyu Tomioka (giyu-tomioka) | Dead Calm | 7 / 11 / 23 | Đạt 3/3; giữ logic. |
| 58 | Sea Beast (sea-beast) | Big Fish | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 59 | Arlong (arlong) | ZAWATER | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 60 | Aquaman (aquaman) | AQUARIUM | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 61 | Noelle Silva (noelle-silva) | Tsunami Water | 8 / 16 / 23 | Đã sửa, đạt 3/3: Tsunami đánh toàn đội địch. |
| 62 | Weather Report (weather-report) | BUBBLE CONTROL | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 63 | Piccolo (piccolo) | AURA FARMER | 8 / 16 / 23 | Đã sửa, đạt 3/3: Aura khi không đánh, một lần mỗi tick. |
| 64 | Peashooter (peashooter) | Plant | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 65 | Hutao (hutao) | Fire Burst | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 66 | Escanor (weather-solar-deity) | SUNNY | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 67 | Builderman (builderman) | DEVELOPER | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 68 | Aatrox (aatrox) | WORLD ENDER | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 69 | Griffith (weather-eclipse-harvester) | ECLIPSED | 8 / 20 / 23 | Đạt 3/3; giữ logic. |
| 70 | Dante Limbus (dante-limbus) | M@!L%#TH | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 71 | Adult Gon (adult-gon) | END!!! | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 72 | Rukia (rukia) | Freeze | 8 / 15 / 23 | Đạt 3/3; giữ logic. |
| 73 | Ice Admiral (ice-admiral) | Ice Age | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 74 | Esdeath (weather-frost-sovereign) | Absolute Zero | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 75 | Toshiro (toshiro) | Absolute Zero | 8 / 13 / 23 | Đạt 3/3; giữ logic. |
| 76 | Android 21 (android-21) | Sweet Destruction | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 77 | Yuta Okkotsu (yuta-okkotsu) | Cursed Love | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 78 | Luffy Nightmare (luffy-nightmare) | ENHANCE | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 79 | Igris (weather-shadow-monarch) | SHADOW KNIGHT | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 80 | Cid Atomic (cid-shadow) | I AM ATMOIC !!! | 8 / 16 / 20 | Đã sửa, đạt 3/3: Đòn thứ 10 x100 toàn bộ địch, không đếm thêm đòn. |
| 81 | Enderman (enderman) | PEARL | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 82 | Homura Akemi (homura-akemi) | Time Manipulation | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 83 | Kamen Rider Decade (kr-decade) | Rider Card | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 84 | Uchiha Sasuke (uchiha-sasuke) | Storm Susano | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 85 | Light Admiral (light-admiral) | Light Speed | 8 / 15 / 9 | Đạt 3/3; giữ logic. |
| 86 | Gojo Young (gojo-young) | Infinity | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 87 | The First Human (weather-heavenly-seraph) | Ascension | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 88 | Sailor Moon (sailor-moon) | Moon Manipulation | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 89 | Jin Mori (jin-mori) | 72 Magic Spell | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 90 | Wish (wish) | Heavenly Blessing | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 91 | Uchiha Shisui (weather-tsukuyomi-eye) | TSUKUYOMI | 8 / 14 / 23 | Đạt 3/3; giữ logic. |
| 92 | Diavolo (diavolo) | EPITAH | 8 / 13 / 23 | Đạt 3/3; giữ logic. |
| 93 | Kaguya (kaguya) | Dimensional Domain | 7 / 15 / 6 | Đã sửa, đạt 3/3: Domain 3 tick, khóa tấn công một chu kỳ. |
| 94 | Vasto Lord (weather-reaper-hollow) | Last Breath | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 95 | Subaru (subaru) | Return By Death | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 96 | Dio Brando (dio-brando) | WGRYYYY | 8 / 13 / 23 | Đạt 3/3; giữ logic. |
| 97 | Malevolent King (weather-malevolent-king) | Malevolent Kitchen | 29 / 169 / 196 | Đạt 3/3; giữ logic. |
| 98 | Doflamingo (doflamingo) | STRING ARMY | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 99 | Hakari Jackpot (hakari-jackpot) | JACKPOT | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 100 | Mahoraga (mahoraga) | ADAPTION | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 101 | Equinox (tower-champion-normal) | Emotional Meter | 8 / 16 / 9 | Đã sửa, đạt 3/3: Emotional Meter, khóa một lần, nổ toàn đội địch, cấm hồi sinh/clone. |
| 102 | Aqua (tower-champion-raining) | Useless | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 103 | Ice King (tower-champion-snowing) | Ice Manipulation | 7 / 21 / 24 | Đạt 3/3; giữ logic. |
| 104 | Charizard Mega X (tower-champion-sunny) | Solar Claw | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 105 | Majin Buu (tower-champion-sugar) | Candy Eater | 8 / 16 / 9 | Đã sửa, đạt 3/3: Phạm vi các đòn đa mục tiêu của form. |
| 106 | Aizen Beyond (tower-champion-reaper) | Illusion Shattering Flower | 8 / 16 / 24 | Đã sửa, đạt 3/3: Đòn diện toàn đội địch mỗi 2 đòn chính. |
| 107 | Wonder Of You (tower-champion-eclipse) | Calamity | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 108 | Thukuna (tower-champion-malevolent) | Malevolent Kitchen | 8 / 16 / 23 | Đã sửa, đạt 3/3: Phạm vi Kitchen toàn đội địch. |
| 109 | Naruto x Sasuke (tower-champion-tsukuyomi) | Datebayo | 8 / 13 / 23 | Đã sửa, đạt 3/3: Phạm vi bộc phát Sasuke toàn đội địch. |
| 110 | The Judgement (tower-champion-heavenly) | Divine Light | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 111 | Kamen Rider Dark Decade (tower-champion-shadow) | Dark Aurora | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 112 | Mihawk (raid-secret-mihawk) | Hawkeye | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 113 | Ace (raid-secret-ace) | Mera Mera | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 114 | Marco (raid-secret-marco) | Phoenix Inferno | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 115 | Funny Valentine (funny-valentine) | D4C | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 116 | Dio The World (dio-the-world) | The World | 8 / 17 / 9 | Đạt 3/3; giữ logic. |
| 117 | Joseph Joestar (joseph-joestar) | Secret Techniques | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 118 | Jolyne Joestar (jolyne-joestar) | Stone Free | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 119 | Tohth (tohth) | OinGo BoinGo | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 120 | Emmu (emmu) | Sleep Demon Art | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 121 | Josuke (josuke) | Crazy Diamond | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 122 | Akaza (akaza) | Destructive Demon Art | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 123 | Awakened Doflamingo (awakened-doflamingo) | Ito Ito | 8 / 15 / 23 | Đã sửa, đạt 3/3: Đòn x10 vào lượt thứ 10 đánh toàn đội địch. |
| 124 | Prime Garp (prime-garp) | Galaxy Impact | 7 / 14 / 23 | Đạt 3/3; giữ logic. |
| 125 | Alucard (boss-event-alucard) | Bird of Hermes | 14 / 37 / 73 | Đạt 3/3; giữ logic. |
| 126 | Madara Lubu (madara-lubu) | Divine Steed | 4 / 29 / 36 | Đạt 3/3; giữ logic. |
| 127 | Sung Jin Woo (sung-jin-woo) | Systems Stats | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 128 | Frieren (frieren) | Endless Mana | 5 / 13 / 23 | Đạt 3/3; giữ logic. |
| 129 | Alexander Anderson (alexander-anderson) | Pray to God | 33 / 70 / 116 | Đạt 3/3; giữ logic. |
| 130 | Julius (julius) | Time Grimoire | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 131 | Speed Wizard (speed-wizard) | Godspeed | 8 / 14 / 7 | Đạt 3/3; giữ logic. |
| 132 | Lucius Zogratis (boss-event-lucius) | All Grimoire | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 133 | Sea Goddess Valkyrie (sea-goddess-valkyrie) | Ultimate Tsunami | 5 / 10 / 23 | Đạt 3/3; giữ logic. |
| 134 | Yuno Spirit (yuno-spirit) | Spirit Wind Grimoire | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 135 | Yuno Spirit Demonic (tower-champion-lucky) | Anti Spirit Grimoire | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 136 | Xtreme Chan (tower-champion-wind) | The Fuuto Wind | 8 / 12 / 23 | Đã sửa, đạt 3/3: Guard không bị ghi đè bởi nhiều lượt địch cùng tick. |
| 137 | Star Plantinum Requiem (tower-champion-bizare) | SPR | 10 / 25 / 17 | Đã sửa, đạt 3/3: Số lượt riêng cho hồi chiêu thanh tẩy. |
| 138 | Shadow The World Requiem (tower-champion-shadow-200) | STWR | 8 / 20 / 26 | Đã sửa, đạt 3/3: Hồi chiêu lượt riêng và Time Rewind tạo đòn bổ sung. |
| 139 | Reagan Ridley (tower-champion-normal-200) | Mad Scientist | 0 / 0 / 0 | Đạt 3/3; hy sinh khi va chạm đầu, nên số đòn có thể bằng 0. |
| 140 | Shirou (shirou) | Rose Shield | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 141 | Kiritsu (kiritsu) | Hitman | 19 / 29 / 56 | Đạt 3/3; giữ logic. |
| 142 | Mash (mash) | Shield | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 143 | Gilgamesh (gilgamesh) | King of Heros | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 144 | Cu Chalinn (cu-chalinn) | Gae Blog | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 145 | Saber Knight (saber-knight) | EXCALIBURH | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 146 | Iskandar (iskandar) | Ionian Hetairoi | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 147 | Medea (medea) | Rule Breaker | 8 / 17 / 23 | Đạt 3/3; giữ logic. |
| 148 | Merlin (merlin) | Noble Phantasm | 8 / 14 / 23 | Đạt 3/3; giữ logic. |
| 149 | Gilgamesh Chan (tower-champion-heavenly-200) | Enuma English | 3 / 15 / 9 | Đạt 3/3; giữ logic. |
| 150 | The Legion (the-legion) | Frenzy | 8 / 18 / 25 | Đạt 3/3; giữ logic. |
| 151 | The Clown (the-clown) | Potion | 8 / 16 / 33 | Đã sửa, đạt 3/3: Badge mode trống trước va chạm. |
| 152 | The Oni (the-oni) | Cursed Blood | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 153 | Jason 13th (jason-13th) | Ki ki ma ma | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 154 | Freddy Krueger (freddy-krueger) | Nightmare | 3 / 15 / 23 | Đạt 3/3; giữ logic. |
| 155 | Myers (myers) | Stalking | 8 / 16 / 23 | Đã sửa, đạt 3/3: Doom giảm một lần mỗi tick. |
| 156 | Gojo Revice (gojo-revice) | Gomen Amanai | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 157 | Geto Young (geto-young) | Summon Technique | 8 / 17 / 23 | Đạt 3/3; giữ logic. |
| 158 | Toji (toji) | Heavenly Restriction | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 159 | Jogo (jogo) | Inferno Domain | 8 / 16 / 23 | Đã sửa, đạt 3/3: Domain và đếm ngược Meteor theo thời gian toàn trận. |
| 160 | True Mahito (true-mahito) | Heni Satsu Rei Tai | 8 / 18 / 23 | Đạt 3/3; giữ logic. |
| 161 | Todo (todo) | Besto Friendo | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 162 | Dagon (dagon) | Water Manipulation | 8 / 14 / 23 | Đạt 3/3; giữ logic. |
| 163 | Choso (choso) | Blood Technique | 8 / 16 / 23 | Đã sửa, đạt 3/3: Hồi chiêu phản Bleed trong trận nhiều orb. |
| 164 | Haruta (haruta) | Coward | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 165 | Mechamaru (mechamaru) | Puppet Manipulation | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 166 | Hanami (hanami) | Flower Field | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 167 | Sukuna Shibuya (sukuna-shibuya) | FUGA x Domain | 8 / 16 / 24 | Đã sửa, đạt 3/3: Thời gian domain sau hồi sinh. |
| 168 | Goku SSJ3 (goku-ssj3) | Dragon Combo | 12 / 19 / 14 | Đạt 3/3; giữ logic. |
| 169 | Vegeta SSJ2 (vegeta-ssj2) | Saiyan Prince | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 170 | Broly (broly) | LEGENDARY SUPER SAIYAN | 8 / 16 / 23 | Đã sửa, đạt 3/3: Tăng ATK 1,2% hoặc 3% một lần mỗi tick. |
| 171 | Ultimate Gohan (ultimate-gohan) | MASENKOO | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 172 | Golden Frieza (golden-frieza) | Supernova | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 173 | Pennywise (pennywise) | The Deadlights | 8 / 16 / 24 | Đã sửa, đạt 3/3: Domain giảm một lần mỗi tick toàn trận. |
| 174 | Florentino (tower-champion-raining-200) | Flower Dance | 11 / 28 / 35 | Đạt 3/3; giữ logic. |
| 175 | Kafka (tower-champion-sugar-200) | Manipulator | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 176 | Escanor The Indomitable (tower-champion-sunny-200) | Ultimate Divine Lance | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 177 | Yhwach Omniscience (tower-champion-reaper-200) | Auswahlen | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 178 | Ragna (boss-event-ragna) | Dragon Slayer | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 179 | Woltekamui (woltekamui) | Godlike Speed | 8 / 23 / 16 | Đạt 3/3; giữ logic. |
| 180 | Kagurabachi (kagurabachi) | Enten | 8 / 16 / 24 | Đã sửa, đạt 3/3: Cổng hành động cho lượt chọn Enten. |
| 181 | The Mourner (the-mourner) | The Solemn Lament | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 182 | Itachi Awakened (itachi-awakened) | Mangekyou Awakening | 9 / 12 / 12 | Đã sửa, đạt 3/3: Cổng hành động cho lượt dùng kỹ thuật. |
| 183 | Konan (konan) | Paper Genkai | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 184 | Kisame Hoshigaki (kisame-hoshigaki) | Samehada | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 185 | Deidara (deidara) | Clay Genkai | 8 / 16 / 23 | Đã sửa, đạt 3/3: Hỗ trợ 40% khi đồng minh thực sự tấn công. |
| 186 | Sasori (sasori) | Puppet Genkai | 8 / 16 / 23 | Đã sửa, đạt 3/3: Hồi HP Puppet một lần mỗi tick. |
| 187 | Kakuzu (kakuzu) | Grudge Fear | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 188 | Hidan (hidan) | Undead Genkai | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 189 | Zetsu (zetsu) | White / Black | 0 / 0 / 23 | Đạt 3/3; giữ logic. |
| 190 | Orochimaru (orochimaru) | Snake Genkai | 8 / 16 / 24 | Đã sửa, đạt 3/3: Chặn hồi sinh thẻ bị cấm hồi sinh qua cơ chế hồi đồng đội. |
| 191 | Pain (pain) | Rinnegan | 8 / 16 / 9 | Đã sửa, đạt 3/3: Badge Rinnegan bị undefined trước va chạm. |
| 192 | Dumb Titan (dumb-titan) | Stomp | 8 / 14 / 23 | Đạt 3/3; giữ logic. |
| 193 | War Hammer Titan (war-hammer-titan) | Crystal Heart | 8 / 14 / 24 | Đã sửa, đạt 3/3: Hồi HP Crystal Heart một lần mỗi tick. |
| 194 | Jaw Titan (jaw-titan) | Iron Jaw | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 195 | Armored Titan (armored-titan) | Titan Shield | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 196 | Eren (eren-rumbling) | Titan Wrath | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 197 | Beast Titan (beast-titan) | Rock Throw | 8 / 16 / 23 | Đã sửa, đạt 3/3: Tích 1–2 Rock khi không đánh, một lần mỗi tick. |
| 198 | Michael Kaiser (michael-kaiser) | Predator Instinct | 6 / 8 / 4 | Đã sửa, đạt 3/3: Cổng hành động cho EyE và đòn chính. |
| 199 | Isagi Yoichi (isagi-yoichi) | Metavision | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 200 | Don Lorenzo (don-lorenzo) | Ace Eater | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 201 | Meliodas (meliodas) | Hellblaze | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 202 | Ban (ban) | Snatch | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 203 | Diane (diane) | Envy Creation | 6 / 22 / 23 | Đã sửa, đạt 3/3: Chỉ tạo tối đa một clone mỗi tick toàn trận. |
| 204 | King Harlequin (king-harlequin) | Disaster | 8 / 16 / 24 | Đạt 3/3; giữ logic. |
| 205 | Gowther (gowther) | Puppet Invasion | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 206 | Escanor The One (escanor-the-one) | The One | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 207 | Rimuru Demon Lord (rimuru-demon-lord) | Universal Predator | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 208 | Veldora (veldora) | Storm Dragon | 5 / 13 / 9 | Đạt 3/3; giữ logic. |
| 209 | Diablo (diablo) | Immortal Spirit | 8 / 15 / 24 | Đạt 3/3; giữ logic. |
| 210 | Benimaru Jura (benimaru-jura) | Shimmering Flame | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 211 | Yuuki Kagurazaka (yuuki-kagurazaka) | Mammon Creator | 8 / 17 / 23 | Đạt 3/3; giữ logic. |
| 212 | Rukia Bankai (rukia-bankai) | Hakka no Togame | 6 / 20 / 23 | Đạt 3/3; giữ logic. |
| 213 | Ulquiorra (ulquiorra) | Resurrección Segunda Etapa | 20 / 39 / 71 | Đạt 3/3; giữ logic. |
| 214 | Yamamoto (yamamoto) | Zanka No Tachi | 8 / 16 / 23 | Đã sửa, đạt 3/3: Cổng hành động cho các hướng kỹ thuật. |
| 215 | Coyote Starrk (coyote-starrk) | Cero Metralleta | 6 / 37 / 37 | Đạt 3/3; giữ logic. |
| 216 | Kisuke Urahara (kisuke-urahara) | Zanpakutō Benihime | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 217 | Normal Arrancar (normal-arrancar) | Cero | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 218 | Yoshino Junpei (yoshino-junpei) | Moon Dregs | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 219 | N Doul (n-doul) | Geb | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 220 | Oingo (oingo) | Khnum | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 221 | D Arby (d-arby) | Osiris | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 222 | Hogus Eagle (hogus-eagle) | Hogus | 9 / 14 / 23 | Đạt 3/3; giữ logic. |
| 223 | Vanilla Ice (vanilla-ice) | Cream | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 224 | Bakugo (bakugo) | Explosion | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 225 | Askeladd (askeladd) | Sword Style | 8 / 16 / 26 | Đạt 3/3; giữ logic. |
| 226 | Pochita (pochita) | Saw Contract | 0 / 0 / 0 | Đạt 3/3; hy sinh khi vào giao tranh, số đòn có thể bằng 0. |
| 227 | Kon (kon) | IdontKnow | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 228 | Iggy (iggy) | The Fool | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 229 | Pikachu (pikachu) | Electric Stroke | 8 / 19 / 9 | Đạt 3/3; giữ logic. |
| 230 | Ender Dragon (ender-dragon) | Magical Ball | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 231 | Onana (onana) | ONANA | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 232 | Zenitsu (zenitsu) | Thunderclap | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 233 | Antony MU (antony-mu) | Spinning Trick | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 234 | Tung Tung Sahur (tung-tung-sahur) | Tung Tung Bat | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 235 | Tulen (tulen) | God of Thunder | 8 / 16 / 9 | Đạt 3/3; giữ logic. |
| 236 | Veera (veera) | Blood Chain | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 237 | Jinx (jinx) | Fishbones | 9 / 23 / 51 | Đạt 3/3; giữ logic. |
| 238 | Ahri (ahri) | Essence Fox | 8 / 16 / 23 | Đạt 3/3; giữ logic. |
| 239 | Krixi (krixi) | Nature Wrath | 7 / 14 / 23 | Đạt 3/3; giữ logic. |
| 240 | Neeko (neeko) | Blooming Burst | 4 / 11 / 23 | Đạt 3/3; giữ logic. |
| 241 | Sonic (sonic) | Aerokinesis | 24 / 58 / 28 | Đạt 3/3; giữ logic. |
| 242 | Yasuo (yasuo) | Wanderer Way | 7 / 18 / 24 | Đạt 3/3; giữ logic. |
| 243 | Yone (yone) | Twin Blades | 3 / 17 / 23 | Đạt 3/3; giữ logic. |
| 244 | Finn The Human (finn-the-human) | Adventure Sword | 7 / 10 / 24 | Đạt 3/3; giữ logic. |
| 245 | Jake The Dog (jake-the-dog) | Stretchy Magic | 8 / 29 / 23 | Đạt 3/3; giữ logic. |
| 246 | Mordecai & Rigby (mordecai-rigby) | Regular Show | 4 / 9 / 28 | Đạt 3/3; giữ logic. |
| 247 | Gumball (gumball) | Amazing World | 8 / 16 / 24 | Đạt 3/3; kiểm thử riêng 9 lần sống sót, đòn chí tử thứ 10 loại khỏi trận. |

## 6. Danh sách tệp trong patch

- `README.md` — Hướng dẫn và checklist này.
- `akatsuki_passives.js` — Rinnegan, Puppet, hỗ trợ Deidara.
- `autochess_combat.js` — Đồng bộ phiên bản module dùng chung trong combat worker.
- `ball_arena.css` — Font, bố cục, thẻ, dropdown, counter, audio controls.
- `ball_arena.js` — Vòng đời trận, countdown, audio, thoát trận, lọc sở hữu.
- `ball_audio.js` — Mới — SoundManager, 24 MP3 và lưu cấu hình.
- `ball_combat.js` — Trạng thái passive, hàng đợi âm thanh, popup và va chạm.
- `ball_index.js` — Nhóm card ID, mutation, copy và Relic.
- `ball_view.js` — HUD, meter, tooltip, canvas và audio controls.
- `dragon_skills.js` — Đồng hồ tích ATK Broly.
- `index.html` — Nạp SoundManager và tăng phiên bản cache.
- `passives.js` — Equinox, passive progress, đòn AoE, hook và thời gian.
- `requiem.js` — Lượt riêng, Time Rewind và Guard.
- `shibuya.js` — Domain, Meteor và timer Choso/Sukuna.
- `sins_passives.js` — Một lần tạo clone Diane mỗi tick.
- `spatial_combat.js` — Kỹ năng native đánh toàn đội và telegraph đúng phạm vi.
- `spooky_passives.js` — Timer Pennywise/Myers và nhãn mode.
- `titan_passives.js` — Rock và Crystal Heart theo đồng hồ thực.
- `turn_phase.js` — Cổng hành động cho từng va chạm.
- `update_logs.js` — Thông báo Update 34.5.


## 7. Cài đặt

1. Sao lưu hoặc commit bản game hiện tại.
2. Giải nén ZIP vào thư mục gốc của game (cùng cấp với `index.html`). Chọn ghi đè các file được hỏi. Tệp mới `ball_audio.js` và `README.md` phải ở đúng cấp thư mục.
3. Giữ nguyên `assets/`. Đảm bảo font `assets/fonts/RobloxPixel.otf` đúng tên. Nếu muốn SFX, tạo `assets/audio/ball/` rồi đặt các MP3 tương ứng ở mục 4.
4. Mở lại trang và **Ctrl + F5**. Với điện thoại, tải lại hoặc xóa cache trang nếu vẫn thấy UI cũ. Kiểm tra Update 34.5 trong Ball vs Ball và Update Logs.
5. Chọn 1v1 Duel hoặc 4v4 Squad Brawl, mở Ball Index, chọn đúng Mutation/Copy rồi Assign. Dùng Equinox và mở đội hình trong trận để xem Emotional Meter. Thử nút SFX và thanh VOL.

Bản vá không thay đổi tài khoản, Firebase, Firestore Rules hoặc assets. Giữ tất cả file khác của game.
