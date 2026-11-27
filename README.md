# Update 35.5.1 — Combat Clarity & Passive Accuracy

Bản vá tiếp nối Update 35.5, tập trung vào âm thanh, tính chính xác của passive và Battle Log. Không thêm card, không thay đổi bảng tỷ lệ quay, công thức Stamina của Sailing Sea, dữ liệu sở hữu hay phần thưởng cơ bản.

## 1. Âm thanh: chỉ phát đúng lúc

| Sự kiện | Trước bản vá | Sau bản vá |
|---|---|---|
| Nhấn Roll thủ công khi sẵn sàng | Có tiếng summon | Có tiếng `assets/audio/summon.mp3` |
| Auto-Roll / lượt quay tự động khi cooldown hết | Phát summon liên tục | Không phát summon |
| Nhấn Roll khi Auto-Roll đang bật | Có thể phát summon | Không phát summon |
| Roll bị chặn do cooldown/hệ thống đang bận | Không thực hiện lượt quay | Không phát summon |
| Quay được Legendary/Mythic/Secret chưa từng sở hữu | Rare reveal hoặc track riêng | Chỉ phát khi mở khóa card mới lần đầu |
| Quay trùng card, kể cả mutation mới | Có thể phát rare reveal/track riêng | Không phát rare reveal hay track reveal riêng cho lượt quay trùng |
| Standard Battle, Sailing Sea, Infinity, PvP và các chiến thắng chung | Có nơi dùng fanfare Ball | Dùng `assets/audio/win.mp3` |
| Auto Chess | `assets/audio/win.mp3` | Giữ nguyên |
| Ball vs Ball | `assets/audio/ball/victory.mp3` | Giữ nguyên riêng của Ball |

- Trạng thái sở hữu card được kiểm tra **trước** khi tăng số lượng, không dùng tình trạng mutation mới làm điều kiện phát rare reveal. Bản ghi tiến độ cấp/EXP của card đã từng sở hữu cũng được xem là dấu hiệu đã mở khóa (kể cả khi đã bán hết bản sao). Các bản save cũ không lưu bất kỳ dấu vết sở hữu nào của một card đã bị bán hết thì không thể phục hồi lịch sử đã mất.
- Giữ quy tắc rare reveal cho các bậc Legendary, Mythic, Secret. Những card có track reveal riêng vẫn ưu tiên track riêng khi mở khóa lần đầu; âm thanh đặc biệt nhận phần thưởng bên ngoài Roll giữ nguyên.
- Nếu Auto-Roll mở khóa card quý hiếm mới, reveal vẫn có thể phát một lần; chỉ tiếng quay thông thường bị tắt trong Auto-Roll.
- Mọi mode sử dụng chung SFX ON/OFF, Volume, giới hạn số âm phát đồng thời và cơ chế bỏ qua file thiếu như Update 35.5. Không thêm MP3 mới.

## 2. Jason 13th — Ki ki ma ma

### Nguyên nhân

Passive gốc và passive mượn dùng chung đường xử lý attack. Đòn đặc biệt của Ki ki ma ma được kiểm tra sau nhiều nhánh thay thế đòn đánh (ví dụ Adventure Sword hoặc kỹ năng từ passive đã mượn). Khi một nhánh đó trả kết quả sớm, Spear/Frog không được xử lý; trạng thái chờ cũng có thể bị ghi đè ở lượt tiếp theo. Ngoài ra, ngay cả khi Jason không mượn được passive nào, hiệu ứng Spear/Frog trước đây thiếu log rõ ràng. Nhãn chung ALL GRIMOIRE trên thẻ cũng khiến người chơi tưởng rằng Jason chỉ dùng kỹ năng của Lucius.

### Cách sửa và thông số đúng theo mô tả card hiện tại

- Bộ đếm và danh sách kỹ năng đang chờ của Ki ki ma ma thuộc riêng passive Jason, không dùng bộ đếm thu thập passive của All Grimoire.
- Mỗi lần thực hiện đòn đánh hợp lệ, tăng bộ đếm một lần. Mốc 5, 10, 15… chuẩn bị ngẫu nhiên Spear hoặc Frog. Đòn tiếp theo (6, 11, 16…) ưu tiên thi triển kỹ năng đã chuẩn bị, kể cả khi Jason đang mượn một passive thay thế đòn đánh. Lượt bị Stun/Freeze không tạo thêm đòn đánh; chiêu đang chờ không biến mất vì một lần đánh hụt. Các follow-up được tính như một đòn riêng khi thực sự đi qua luồng đếm đòn hợp lệ.
- Spear: 200% ATK lên toàn đội địch còn sống, hệ số x0,9 ở mỗi mục tiêu tiếp theo. Ví dụ ATK 1.000 và không có modifier: 2.000 → 1.800 → 1.620.
- Frog: áp dụng **50% giảm sát thương nhận vào cho toàn bộ địch còn sống trong 3 lượt**. Đây là hiệu ứng được mô tả trong card gốc (dù là lợi ích cho đối phương), không tự ý đổi thành giảm ATK địch. Frog không gây sát thương trực tiếp.
- Giữ cơ hội hồi 6% Max HP là 66% sau đòn đánh hợp lệ và việc mượn passive của đồng đội khi vào trận. Khi Jason chết, trả passive về đúng người cho mượn.
- Hiện `KI KI MA MA x/5` hoặc `SPEAR READY` / `FROG READY` trong trạng thái; hiển thị passive mượn dưới `BORROWED` thay vì `ALL GRIMOIRE`. Nhãn ALL GRIMOIRE dành cho người thực sự có passive đó.
- Trong Infinity, bộ đếm và chiêu chờ còn nguyên khi sang wave mới.

Ví dụ Battle Log:

```text
[PASSIVE] Ki ki ma ma: Jason 13th reached attack #5; Spear prepared for the next attack.
[SPECIAL] Ki ki ma ma: Spear pierces the enemy lineup at 200% ATK, with 10% less damage per subsequent target.
[SPECIAL] Jason 13th · Ki ki ma ma dealt 2,000 damage to Audit Target.
```

## 3. Báo cáo lỗi passive đã xác định và sửa

| Card/passive hoặc nhóm ảnh hưởng | Vấn đề phát hiện | Cách xử lý |
|---|---|---|
| Jason 13th — Ki ki ma ma | Nhánh kỹ năng mượn trả kết quả trước chiêu riêng; mất chiêu chờ và nhãn sai | Hàng chờ riêng, ưu tiên chiêu gốc, đếm và hiển thị mốc 5, log kết quả thực tế |
| Demon Asta — ANTI MAGIC BOOK, Uchiha Sasuke — Storm Susano, Mahoraga — ADAPTION | `damageReductionPct` bị nhân giảm sát thương ở cả bước chuẩn bị đòn đánh và bước nhận sát thương | Chỉ áp dụng hệ số DR một lần tại bước xử lý sát thương. Với 1.000 sát thương trung tính và 30% DR, còn 700 thay vì 490. Các kiểm tra chí tử đợi sát thương thực sự sau DR. |
| Các passive có xuyên DR / chống chí tử | DR cũ đã giảm sát thương trước khi cờ ignoreReduction được đọc; một số kiểm tra chí tử có thể xảy ra trước khi miễn nhiễm/DR được tính | Dồn việc xử lý giảm sát thương vào cùng đường nhận hit, kiểm tra điều kiện bảo vệ/DR trước khi cấp trigger chí tử |
| The Truth — Omniscience; Erza — MAGIC ARMOR | Một số module gọi thêm Stun/Bleed/Poison trực tiếp và bỏ qua cơ chế miễn nhiễm; The Truth có cờ miễn nhiễm tồn tại sau khi passive bị mượn/hết hạn | Kiểm tra quyền sở hữu passive hiện tại và miễn nhiễm địch cho status, DoT, suy giảm chỉ số và sát thương passive riêng. Đòn đánh thường vẫn có thể gây sát thương. Erza chỉ miễn nhiễm dưới 50% Max HP. |
| Finn The Human — Last Hero Standing | Trạng thái miễn debuff dựa vào bản ghi cũ dù passive bị mất/khóa; việc kiểm tra qua getter trạng thái đã che debuff có thể gọi lặp lại chính nó | Chỉ miễn debuff khi passive Finn còn hiệu lực trên cùng runtime. Kiểm tra khóa và passive bị mượn từ trạng thái gốc để tránh đệ quy khi Last Hero Standing đang hoạt động. |
| Oingo — Khnum, The First Human — Ascension, Gumball — Amazing World, Kakuzu — Grudge Fear, Lucius — All Grimoire và các cơ chế có copy | Hook lặp qua các bản sao có thể vẫn gọi một passive đã hết hạn/đã gỡ trong cùng một lần dispatch; logic kill có thể xử lý nhiều lần hoặc bỏ sót passive gốc | Loại bản sao đã hết hiệu lực, giữ các bộ đếm riêng, phát sự kiện kill thật một lần trên mỗi sinh mạng của mục tiêu và chạy passive gốc lẫn passive mượn hợp lệ. Không biến cơ chế copy thành All Grimoire. |
| Kamen Rider Dark Decade và các Tower Champion có copy | ID Champion ưu tiên thẻ gốc ngay cả bên trong scope của passive mượn, gây gọi lại hook gốc thay vì hook của copy | Phân biệt scope Champion thực sự; khi đang chạy copy không mượn nhầm ID của Champion gốc. |
| Normal Demon — Lifesteal | Ngoài tăng +10% Max HP theo mô tả còn hồi thêm 10% Max HP mới, dư hiệu ứng | Chỉ tăng Max HP theo mô tả (lượng HP tăng theo phần Max HP được cộng, tôn trọng Bleed). Ví dụ HP 1.000/10.000 → 2.000/11.000 khi kill. |
| Builderman — DEVELOPER | Tower Power dùng ATK gốc của card đối thủ và lấy đầu danh sách thay vì đối thủ đang hoạt động; thiếu thông báo tích điểm | Lấy mục tiêu đang giao chiến và 10% ATK hiện hành; hiển thị điểm tích lũy, đồng thời giữ cơ chế chuyển điểm sang HP khi có kill. |
| Normal Demon, Bounty Hunter, Rimuru, BlackBeard, Mahito, Doflamingo, các passive tăng/thuộc tính/triệu hồi trên kill (nếu có DoT hợp lệ) | Nhánh kết liễu do Burn/Bleed/Poison chỉ gọi một số module, bỏ qua đường kill chung | Gửi sự kiện kill và mất đồng đội qua đường battle chung với loại DoT chính xác. Không cấp kill nếu mục tiêu còn sống sau hồi sinh/chặn chí tử. |
| Jin Mori, các passive phản ứng khi đồng đội chết | Cái chết do DoT không gọi đường teammate-death đầy đủ; thông báo tử vong lặp có thể sinh hiệu ứng nhắc lại | Dùng cùng sự kiện mất đồng đội cho DoT và direct hit, ghi nhận theo sinh mạng thực tế để trigger một lần. |
| Dante Limbus — M@!L%#TH | Nhánh direct special kill không luôn chuyển cờ fatality của đòn đánh thường vào onKill | Công nhận đòn đánh trực tiếp kết liễu kể cả special hit; giữ giới hạn hồi sinh một lần, không tự mở rộng sang DoT. |
| Pennywise — The Deadlights | Hypnosis trực tiếp không có thông báo cụ thể | Log đúng mục tiêu, thời lượng và tên passive khi Hypnosis thực sự áp dụng. |
| The Clown — Potion, Freddy Krueger — Nightmare (các trigger Hindred) | Ghi Hindred trực tiếp vào runtime có thể bỏ qua bộ kiểm tra trạng thái chuẩn | Dùng setStatus thống nhất, giữ thời điểm áp dụng và thời lượng; miễn nhiễm hợp lệ ngăn trigger. |
| Các kỹ năng tấn công đặc biệt/follow-up của roster | Vài đường primary hit hoặc damage trả immune/reflected/absorbed/invincible/missed nhưng pipeline vẫn coi là hit thành công, làm chạy on-hit ngoài ý muốn | Chuẩn hóa kết quả hit thật; trạng thái trượt/chặn/miễn nhiễm không làm chạy nhánh hit thành công. Khiên hấp thu sát thương vẫn là một hit hợp lệ. |

Các thay đổi về xử lý kill, miễn nhiễm và DR được áp dụng ở engine chung, nên cả các card mượn những passive trên cũng nhận đúng quy tắc. Không thay toàn bộ module bằng công thức phân loại thẻ chung; giữ nguyên công thức và trigger riêng trong từng module khi không tìm thấy lỗi.

## 4. Standard Battle Log — ghi nhận passive thực tế

Các module trước đây đã có nhiều câu log riêng, nhưng một số kỹ năng chỉ gọi hàm gây sát thương, đổi stat, stack hoặc trạng thái mà không tự viết log. Bản vá bổ sung:

- `[PASSIVE]`: tên kỹ năng, điểm tích lũy, ngưỡng đòn đánh, lần chuẩn bị chiêu, trạng thái/form/counter thay đổi thực tế, đổi modifier ATK, miễn nhiễm và giảm sát thương.
- `[SPECIAL]`, `[FOLLOW-UP]`, `[COUNTER]`: thêm sát thương HP thực tế theo người đánh và từng mục tiêu của đòn riêng, đòn follow-up, phản đòn, kể cả khi kỹ năng không có câu log trong module. Kết quả bị block/immune/reflected/miss cũng được phân biệt ở đường damage trả kết quả.
- `[BUFF]`, `[DEBUFF]`: thay đổi ATK/Max HP trước → sau, CC được chấp nhận, tái áp dụng, hết hạn/cleanse, các stack và timer quan trọng; không tạo log giả khi chỉ khởi tạo state mặc định của module không thuộc card.
- `[SHIELD]`, `[HEAL]`, `[REVIVE]`, `[KO]`: lượng khiên tăng, lượng bị hấp thu và vỡ khiên, hồi HP, hồi sinh thật, mất đồng đội và triệu hồi.
- Burn/Bleed/Poison ghi số raw damage mỗi lượt khi áp dụng; mỗi tick tiếp tục ghi sát thương thực tế sau quy tắc phòng thủ. Bleed anti-heal vẫn hiện lý do không hồi.
- Nami, Hakari Jackpot, Aqua (lựa chọn reward), D Arby (Osiris) có log khi thưởng thắng được hưởng hiệu ứng; không phát log khi chỉ xem trước thưởng.
- Nhật ký bắt đầu trận được reset trước hook on-entry để không xóa mất thông báo khởi tạo passive. Hai cột Player/Enemy, các badge màu cũ và việc escape text an toàn vẫn giữ nguyên. Infinity ghi nhận đúng phe của địch từ các wave đã qua.
- Module mới `passive_journal.js` bổ sung log còn thiếu từ chênh lệch trạng thái thật ở ranh giới lượt/entry/attack. Các hook gốc vẫn là nơi quyết định hiệu ứng. Module không gọi RNG, không sửa chỉ số, không kích hoạt lại passive để tìm log và không quét lịch sử mỗi frame. Log bổ sung dùng trong Arena dạng turn-based, Infinity/Portal; Auto Chess worker và Ball vs Ball giữ cơ chế trình bày riêng để tránh tăng tải. Giữ giới hạn lịch sử hiện tại của UI.

## 5. Phạm vi kiểm tra

- Đối chiếu **247/247 ID card** với registry và mã thực thi (bao gồm các Champion dùng tiền tố ID); đối chiếu nội dung passive gốc trong cards.js. Rà soát các module passives, Akatsuki, Sins, Spooky, Titan, Dragon, Requiem, Shibuya, Fate, Grimoire, Bleach, Tensura, Baller, Hextech, Content, Tower, Spatial, Infinity, Relic và helper combat.
- Mô phỏng ba cấu hình Standard cho từng card: Duel, đội có đồng đội/địch dự bị và phòng thủ HP thấp, đến 44 lượt hoặc tới khi trận kết thúc (741 cấu hình). Kiểm tra lỗi JS, lượt bị kẹt, chỉ số không hữu hạn, trạng thái và bộ đếm.
- Bổ sung 175 cấu hình điều kiện cho 35 ID chưa có log passive trong lượt chạy ban đầu (kill, defend, support, reward, bleed). Một log có nhắc tên card có thể là hiệu ứng từ đồng đội; vì vậy kết quả mô phỏng là bằng chứng về đường chạy, không phải chứng minh tất cả nhánh RNG hoặc tổ hợp relic/mutation có thể xảy ra.
- Kiểm thử định lượng riêng: Jason có/không có Finn bị mượn passive, cả Spear và Frog ở đòn 5→6 và 10→11, Infinity giữ chiêu chờ; Bakugo log sát thương 10% ATK; DR 30%, miễn nhiễm Pikachu/Stun, miễn nhiễm passive hit của The Truth, DoT kill đúng một lần và Jin Mori triệu hồi đúng một clone, Normal Demon tăng HP đúng, Oingo hết hạn copy.
- Tương thích: Naruto x Sasuke chọn mode, Stun hiện Unable to attack, Arena kết thúc; Ball vs Ball native mechanics; Auto Chess combat/worker; Sailing Sea worker và resume checkpoint. Kiểm tra âm thanh bằng Audio mô phỏng: manual/auto/duplicate/new, victory của 3 mode dùng win.mp3 và Ball giữ victory.mp3; không có MP3 thật trong patch.
- Dưới đây là checklist từng card. "Đạt" nghĩa là cấu hình đã chạy không có lỗi runtime hoặc số liệu bất hợp lệ; không phải khẳng định tất cả proc hiếm đều được ép xảy ra trong một lần mô phỏng. Các lỗi xác định được ghi riêng tại mục 3.

**Kết quả cuối:** 247/247 card có passive đã đăng ký và phân loại, 741/741 cấu hình Standard chạy thành công; 175/175 cấu hình điều kiện bổ sung không báo lỗi. Không phát hiện lỗi JavaScript trong lượt chạy cuối.

| # | Card (ID) | Passive | Mô phỏng Standard | Ghi chú |
|---:|---|---|---|---|
| 1 | Naruto Kid (`starter-common`) | First Strike | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 2 | Normal Demon (`normal-demon`) | Lifesteal | 3/3 đạt | Sửa Max HP sau kill và dispatch DoT kill; thêm 5 ca điều kiện |
| 3 | Sasuke Kid (`sasuke-kid`) | Chidori | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 4 | Powerless Guy (`deku-mc`) | What can i get you sir | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 5 | Ichigo Young (`starter-rare`) | Afterimage | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 6 | Gon Kid (`gon-kid`) | Rock | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 7 | Tanjiro (`tanjiro`) | Rock | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 8 | Luffy Kid (`starter-epic`) | GOMU NO MU NO PISTOL | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 9 | Six Seven (`six-seven`) | SIX SEVEN | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 10 | Kaneki (`kaneki-ghoul`) | GHOUL | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 11 | The Trapper (`the-trapper`) | Trap | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 12 | Nezuko (`nezuko`) | Bleed | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 13 | Buggy (`buggy`) | Chop Chop | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 14 | Bounty Hunter (`bounty-hunter`) | BOUNTY | 3/3 đạt | Đồng bộ đường xử lý kill chung nếu có DoT kết liễu; thêm 5 ca điều kiện |
| 15 | Jotaro Kujo (`jotaro-kujo`) | Ora Ora | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 16 | Hakari (`hakari`) | Lucky Train | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 17 | Saber (`saber`) | EXCALIBUR!!! | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 18 | Jonathan Joestar (`jonathan-joestar`) | HAMONNN | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 19 | Son Goku (`starter-legendary`) | Kamehameha | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 20 | Vegeta (`vegeta`) | Super Vegeta | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 21 | Kakashi (`kakashi`) | Kamui | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 22 | Kamen Rider Kuuga (`kr-kuuga`) | KUUGA | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 23 | Bulma (`bulma`) | WISH | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 24 | Denji (`denji`) | POCHITA | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 25 | Uchiha Itachi (`uchiha-itachi`) | Amaterasu | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 26 | Madness Doctor (`madness-doctor`) | Madness | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 27 | Erza (`erza`) | MAGIC ARMOR | 3/3 đạt | Sửa miễn nhiễm passive khi HP dưới ngưỡng; thêm 5 ca điều kiện |
| 28 | Yuji Itadori (`yuji-itadori`) | BLACK FLASH | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 29 | Guts (`guts`) | OUTRAGE | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 30 | Polnareff (`polnareff`) | SILVER CHARIOT | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 31 | The Flash (`the-flash`) | FLASH | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 32 | Rimuru (`rimuru`) | SLIME | 3/3 đạt | Đồng bộ đường xử lý kill chung nếu có DoT kết liễu; thêm 5 ca điều kiện |
| 33 | The Truth (`starter-secret`) | Omniscience | 3/3 đạt | Sửa miễn nhiễm passive; kiểm tra passive hiện hành |
| 34 | Viltrumite (`viltrumite`) | PUNCH | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 35 | Mahito (`mahito`) | Idle Transfiguration | 3/3 đạt | Đồng bộ đường xử lý kill chung nếu có DoT kết liễu; thêm 5 ca điều kiện |
| 36 | BlackBeard (`blackbeard`) | Liberation | 3/3 đạt | Đồng bộ đường xử lý kill chung nếu có DoT kết liễu; thêm 5 ca điều kiện |
| 37 | Garp (`garp`) | Fist of Love | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 38 | Erwin (`erwin`) | CAPTAIN | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 39 | Boa Hancock (`boa-hancock`) | Mero Mero | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 40 | Senku (`senku`) | Chemistry | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 41 | Grimmjaw (`grimmjaw`) | Gran Rey Cero | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 42 | Reigen (`reigen`) | Scam | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 43 | Kamen Rider Kabuto (`kamen-rider-kabuto`) | CLOCK UP | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 44 | Meruem (`meruem`) | Aura Synthesis | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 45 | Frieza (`frieza`) | Telekinesis | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 46 | Adam Francis (`adam-francis`) | Champion of Light | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 47 | Katakuri (`katakuri`) | MOCHI | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 48 | WhiteBeard (`whitebeard`) | Quake Hermit | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 49 | Doppio (`doppio`) | FROG | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 50 | Shanks (`shanks`) | HAKI | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 51 | Metal Cooler (`metal-cooler`) | CLONE | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 52 | Gohan (`gohan`) | MASENKO | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 53 | Yuno (`yuno`) | Zephyr Bow | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 54 | Asta (`asta`) | ANTI MAGIC | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 55 | Demon Asta (`asta-demon`) | ANTI MAGIC BOOK | 3/3 đạt | Sửa DR bị tính hai lần |
| 56 | Nami (`nami`) | Greedy | 3/3 đạt | Bổ sung log thưởng thắng; thêm 5 ca điều kiện |
| 57 | Giyu Tomioka (`giyu-tomioka`) | Dead Calm | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 58 | Sea Beast (`sea-beast`) | Big Fish | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 59 | Arlong (`arlong`) | ZAWATER | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 60 | Aquaman (`aquaman`) | AQUARIUM | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 61 | Noelle Silva (`noelle-silva`) | Tsunami Water | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 62 | Weather Report (`weather-report`) | BUBBLE CONTROL | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 63 | Piccolo (`piccolo`) | AURA FARMER | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 64 | Peashooter (`peashooter`) | Plant | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 65 | Hutao (`hutao`) | Fire Burst | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 66 | Escanor (`weather-solar-deity`) | SUNNY | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 67 | Builderman (`builderman`) | DEVELOPER | 3/3 đạt | Sửa điểm Tower Power theo ATK thực tế; thêm 5 ca điều kiện |
| 68 | Aatrox (`aatrox`) | WORLD ENDER | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 69 | Griffith (`weather-eclipse-harvester`) | ECLIPSED | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 70 | Dante Limbus (`dante-limbus`) | M@!L%#TH | 3/3 đạt | Sửa direct special kill; thêm 5 ca điều kiện |
| 71 | Adult Gon (`adult-gon`) | END!!! | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 72 | Rukia (`rukia`) | Freeze | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 73 | Ice Admiral (`ice-admiral`) | Ice Age | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 74 | Esdeath (`weather-frost-sovereign`) | Absolute Zero | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 75 | Toshiro (`toshiro`) | Absolute Zero | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 76 | Android 21 (`android-21`) | Sweet Destruction | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 77 | Yuta Okkotsu (`yuta-okkotsu`) | Cursed Love | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 78 | Luffy Nightmare (`luffy-nightmare`) | ENHANCE | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 79 | Igris (`weather-shadow-monarch`) | SHADOW KNIGHT | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 80 | Cid Atomic (`cid-shadow`) | I AM ATMOIC !!! | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 81 | Enderman (`enderman`) | PEARL | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 82 | Homura Akemi (`homura-akemi`) | Time Manipulation | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 83 | Kamen Rider Decade (`kr-decade`) | Rider Card | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 84 | Uchiha Sasuke (`uchiha-sasuke`) | Storm Susano | 3/3 đạt | Sửa DR bị tính hai lần |
| 85 | Light Admiral (`light-admiral`) | Light Speed | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 86 | Gojo Young (`gojo-young`) | Infinity | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 87 | The First Human (`weather-heavenly-seraph`) | Ascension | 3/3 đạt | Đồng bộ quyền gọi copy và kill; thêm 5 ca điều kiện |
| 88 | Sailor Moon (`sailor-moon`) | Moon Manipulation | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 89 | Jin Mori (`jin-mori`) | 72 Magic Spell | 3/3 đạt | Sửa sự kiện mất đồng đội gây bởi DoT; thêm 5 ca điều kiện |
| 90 | Wish (`wish`) | Heavenly Blessing | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 91 | Uchiha Shisui (`weather-tsukuyomi-eye`) | TSUKUYOMI | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 92 | Diavolo (`diavolo`) | EPITAH | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 93 | Kaguya (`kaguya`) | Dimensional Domain | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 94 | Vasto Lord (`weather-reaper-hollow`) | Last Breath | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 95 | Subaru (`subaru`) | Return By Death | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 96 | Dio Brando (`dio-brando`) | WGRYYYY | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 97 | Malevolent King (`weather-malevolent-king`) | Malevolent Kitchen | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 98 | Doflamingo (`doflamingo`) | STRING ARMY | 3/3 đạt | Đồng bộ đường xử lý kill chung nếu có DoT kết liễu; thêm 5 ca điều kiện |
| 99 | Hakari Jackpot (`hakari-jackpot`) | JACKPOT | 3/3 đạt | Bổ sung log thưởng thắng |
| 100 | Mahoraga (`mahoraga`) | ADAPTION | 3/3 đạt | Sửa DR bị tính hai lần |
| 101 | Equinox (`tower-champion-normal`) | Emotional Meter | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 102 | Aqua (`tower-champion-raining`) | Useless | 3/3 đạt | Bổ sung log thưởng thắng |
| 103 | Ice King (`tower-champion-snowing`) | Ice Manipulation | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 104 | Charizard Mega X (`tower-champion-sunny`) | Solar Claw | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 105 | Majin Buu (`tower-champion-sugar`) | Candy Eater | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 106 | Aizen Beyond (`tower-champion-reaper`) | Illusion Shattering Flower | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 107 | Wonder Of You (`tower-champion-eclipse`) | Calamity | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 108 | Thukuna (`tower-champion-malevolent`) | Malevolent Kitchen | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 109 | Naruto x Sasuke (`tower-champion-tsukuyomi`) | Datebayo | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 110 | The Judgement (`tower-champion-heavenly`) | Divine Light | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 111 | Kamen Rider Dark Decade (`tower-champion-shadow`) | Dark Aurora | 3/3 đạt | Sửa scope ID Champion khi thực thi copy; thêm 5 ca điều kiện |
| 112 | Mihawk (`raid-secret-mihawk`) | Hawkeye | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 113 | Ace (`raid-secret-ace`) | Mera Mera | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 114 | Marco (`raid-secret-marco`) | Phoenix Inferno | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 115 | Funny Valentine (`funny-valentine`) | D4C | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 116 | Dio The World (`dio-the-world`) | The World | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 117 | Joseph Joestar (`joseph-joestar`) | Secret Techniques | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 118 | Jolyne Joestar (`jolyne-joestar`) | Stone Free | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 119 | Tohth (`tohth`) | OinGo BoinGo | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 120 | Emmu (`emmu`) | Sleep Demon Art | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 121 | Josuke (`josuke`) | Crazy Diamond | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 122 | Akaza (`akaza`) | Destructive Demon Art | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 123 | Awakened Doflamingo (`awakened-doflamingo`) | Ito Ito | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 124 | Prime Garp (`prime-garp`) | Galaxy Impact | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 125 | Alucard (`boss-event-alucard`) | Bird of Hermes | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 126 | Madara Lubu (`madara-lubu`) | Divine Steed | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 127 | Sung Jin Woo (`sung-jin-woo`) | Systems Stats | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 128 | Frieren (`frieren`) | Endless Mana | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 129 | Alexander Anderson (`alexander-anderson`) | Pray to God | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 130 | Julius (`julius`) | Time Grimoire | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 131 | Speed Wizard (`speed-wizard`) | Godspeed | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 132 | Lucius Zogratis (`boss-event-lucius`) | All Grimoire | 3/3 đạt | Sửa đường dispatch copy/kill |
| 133 | Sea Goddess Valkyrie (`sea-goddess-valkyrie`) | Ultimate Tsunami | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 134 | Yuno Spirit (`yuno-spirit`) | Spirit Wind Grimoire | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 135 | Yuno Spirit Demonic (`tower-champion-lucky`) | Anti Spirit Grimoire | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 136 | Xtreme Chan (`tower-champion-wind`) | The Fuuto Wind | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 137 | Star Plantinum Requiem (`tower-champion-bizare`) | SPR | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 138 | Shadow The World Requiem (`tower-champion-shadow-200`) | STWR | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 139 | Reagan Ridley (`tower-champion-normal-200`) | Mad Scientist | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 140 | Shirou (`shirou`) | Rose Shield | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 141 | Kiritsu (`kiritsu`) | Hitman | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 142 | Mash (`mash`) | Shield | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 143 | Gilgamesh (`gilgamesh`) | King of Heros | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 144 | Cu Chalinn (`cu-chalinn`) | Gae Blog | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 145 | Saber Knight (`saber-knight`) | EXCALIBURH | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 146 | Iskandar (`iskandar`) | Ionian Hetairoi | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 147 | Medea (`medea`) | Rule Breaker | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 148 | Merlin (`merlin`) | Noble Phantasm | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 149 | Gilgamesh Chan (`tower-champion-heavenly-200`) | Enuma English | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 150 | The Legion (`the-legion`) | Frenzy | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 151 | The Clown (`the-clown`) | Potion | 3/3 đạt | Chuẩn hóa áp dụng Hindred |
| 152 | The Oni (`the-oni`) | Cursed Blood | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 153 | Jason 13th (`jason-13th`) | Ki ki ma ma | 3/3 đạt | Sửa bộ đếm, hàng chờ Spear/Frog và log riêng |
| 154 | Freddy Krueger (`freddy-krueger`) | Nightmare | 3/3 đạt | Chuẩn hóa áp dụng Hindred |
| 155 | Myers (`myers`) | Stalking | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 156 | Gojo Revice (`gojo-revice`) | Gomen Amanai | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 157 | Geto Young (`geto-young`) | Summon Technique | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 158 | Toji (`toji`) | Heavenly Restriction | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 159 | Jogo (`jogo`) | Inferno Domain | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 160 | True Mahito (`true-mahito`) | Heni Satsu Rei Tai | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 161 | Todo (`todo`) | Besto Friendo | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 162 | Dagon (`dagon`) | Water Manipulation | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 163 | Choso (`choso`) | Blood Technique | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 164 | Haruta (`haruta`) | Coward | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 165 | Mechamaru (`mechamaru`) | Puppet Manipulation | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 166 | Hanami (`hanami`) | Flower Field | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 167 | Sukuna Shibuya (`sukuna-shibuya`) | FUGA x Domain | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 168 | Goku SSJ3 (`goku-ssj3`) | Dragon Combo | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 169 | Vegeta SSJ2 (`vegeta-ssj2`) | Saiyan Prince | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 170 | Broly (`broly`) | LEGENDARY SUPER SAIYAN | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 171 | Ultimate Gohan (`ultimate-gohan`) | MASENKOO | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 172 | Golden Frieza (`golden-frieza`) | Supernova | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 173 | Pennywise (`pennywise`) | The Deadlights | 3/3 đạt | Bổ sung log Hypnosis |
| 174 | Florentino (`tower-champion-raining-200`) | Flower Dance | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 175 | Kafka (`tower-champion-sugar-200`) | Manipulator | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 176 | Escanor The Indomitable (`tower-champion-sunny-200`) | Ultimate Divine Lance | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 177 | Yhwach Omniscience (`tower-champion-reaper-200`) | Auswahlen | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 178 | Ragna (`boss-event-ragna`) | Dragon Slayer | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 179 | Woltekamui (`woltekamui`) | Godlike Speed | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 180 | Kagurabachi (`kagurabachi`) | Enten | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 181 | The Mourner (`the-mourner`) | The Solemn Lament | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 182 | Itachi Awakened (`itachi-awakened`) | Mangekyou Awakening | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 183 | Konan (`konan`) | Paper Genkai | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 184 | Kisame Hoshigaki (`kisame-hoshigaki`) | Samehada | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 185 | Deidara (`deidara`) | Clay Genkai | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 186 | Sasori (`sasori`) | Puppet Genkai | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 187 | Kakuzu (`kakuzu`) | Grudge Fear | 3/3 đạt | Đồng bộ quyền gọi copy và kill; thêm 5 ca điều kiện |
| 188 | Hidan (`hidan`) | Undead Genkai | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 189 | Zetsu (`zetsu`) | White / Black | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 190 | Orochimaru (`orochimaru`) | Snake Genkai | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 191 | Pain (`pain`) | Rinnegan | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 192 | Dumb Titan (`dumb-titan`) | Stomp | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 193 | War Hammer Titan (`war-hammer-titan`) | Crystal Heart | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 194 | Jaw Titan (`jaw-titan`) | Iron Jaw | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 195 | Armored Titan (`armored-titan`) | Titan Shield | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 196 | Eren (`eren-rumbling`) | Titan Wrath | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 197 | Beast Titan (`beast-titan`) | Rock Throw | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 198 | Michael Kaiser (`michael-kaiser`) | Predator Instinct | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 199 | Isagi Yoichi (`isagi-yoichi`) | Metavision | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 200 | Don Lorenzo (`don-lorenzo`) | Ace Eater | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 201 | Meliodas (`meliodas`) | Hellblaze | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 202 | Ban (`ban`) | Snatch | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 203 | Diane (`diane`) | Envy Creation | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 204 | King Harlequin (`king-harlequin`) | Disaster | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 205 | Gowther (`gowther`) | Puppet Invasion | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 206 | Escanor The One (`escanor-the-one`) | The One | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 207 | Rimuru Demon Lord (`rimuru-demon-lord`) | Universal Predator | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 208 | Veldora (`veldora`) | Storm Dragon | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 209 | Diablo (`diablo`) | Immortal Spirit | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 210 | Benimaru Jura (`benimaru-jura`) | Shimmering Flame | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 211 | Yuuki Kagurazaka (`yuuki-kagurazaka`) | Mammon Creator | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 212 | Rukia Bankai (`rukia-bankai`) | Hakka no Togame | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 213 | Ulquiorra (`ulquiorra`) | Resurrección Segunda Etapa | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 214 | Yamamoto (`yamamoto`) | Zanka No Tachi | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 215 | Coyote Starrk (`coyote-starrk`) | Cero Metralleta | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 216 | Kisuke Urahara (`kisuke-urahara`) | Zanpakutō Benihime | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 217 | Normal Arrancar (`normal-arrancar`) | Cero | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 218 | Yoshino Junpei (`yoshino-junpei`) | Moon Dregs | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 219 | N Doul (`n-doul`) | Geb | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 220 | Oingo (`oingo`) | Khnum | 3/3 đạt | Sửa xử lý copy hết hạn, sự kiện kill chung; thêm 5 ca điều kiện |
| 221 | D Arby (`d-arby`) | Osiris | 3/3 đạt | Bổ sung log thưởng thắng; thêm 5 ca điều kiện |
| 222 | Hogus Eagle (`hogus-eagle`) | Hogus | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 223 | Vanilla Ice (`vanilla-ice`) | Cream | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 224 | Bakugo (`bakugo`) | Explosion | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 225 | Askeladd (`askeladd`) | Sword Style | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 226 | Pochita (`pochita`) | Saw Contract | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 227 | Kon (`kon`) | IdontKnow | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung; thêm 5 ca điều kiện |
| 228 | Iggy (`iggy`) | The Fool | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 229 | Pikachu (`pikachu`) | Electric Stroke | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 230 | Ender Dragon (`ender-dragon`) | Magical Ball | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 231 | Onana (`onana`) | ONANA | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 232 | Zenitsu (`zenitsu`) | Thunderclap | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 233 | Antony MU (`antony-mu`) | Spinning Trick | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 234 | Tung Tung Sahur (`tung-tung-sahur`) | Tung Tung Bat | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 235 | Tulen (`tulen`) | God of Thunder | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 236 | Veera (`veera`) | Blood Chain | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 237 | Jinx (`jinx`) | Fishbones | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 238 | Ahri (`ahri`) | Essence Fox | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 239 | Krixi (`krixi`) | Nature Wrath | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 240 | Neeko (`neeko`) | Blooming Burst | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 241 | Sonic (`sonic`) | Aerokinesis | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 242 | Yasuo (`yasuo`) | Wanderer Way | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 243 | Yone (`yone`) | Twin Blades | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 244 | Finn The Human (`finn-the-human`) | Adventure Sword | 3/3 đạt | Sửa miễn debuff và tránh đệ quy ở Last Hero Standing |
| 245 | Jake The Dog (`jake-the-dog`) | Stretchy Magic | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 246 | Mordecai & Rigby (`mordecai-rigby`) | Regular Show | 3/3 đạt | Đạt; không phát hiện lỗi riêng mới trong các đường chạy; áp dụng log chung |
| 247 | Gumball (`gumball`) | Amazing World | 3/3 đạt | Đồng bộ quyền gọi copy và kill |

## 6. Cài đặt bản vá

1. Sao lưu thư mục game và bản lưu hiện tại; bản vá được xây dựng trên Update 35.5.
2. Giải nén ZIP và chép đúng các file vào thư mục gốc của game (cùng cấp với index.html). Chọn Replace/Overwrite nếu được hỏi. File passive_journal.js là file mới và phải được chép đầy đủ.
3. Không xóa, thay thế hoặc giải nén lại thư mục assets; ZIP không chứa tài nguyên ảnh hay âm thanh. Không cần thêm file MP3 nào. Các đường dẫn SFX quan trọng ở mục 1 cần sử dụng âm thanh đã có từ bản trước.
4. Tải lại trang bằng Ctrl + F5 (hoặc xóa cache của trang trên điện thoại rồi mở lại). Nếu chơi online, cả hai người chơi phải dùng bản vá mới để đồng bộ phiên bản combat.
5. Kiểm tra Roll thủ công và Auto-Roll, kiểm tra một card mới và bản sao. Vào Standard Battle với Jason 13th, xem bộ đếm và log khi đến mốc 5, rồi kiểm tra đòn 6. Thử trận Infinity qua wave mới để kiểm tra chiêu đang chờ. SFX / Volume vẫn điều khiển bằng thiết lập âm thanh cũ.

## 7. Danh sách file trong ZIP

| File | Nội dung thay đổi |
|---|---|
| `README.md` | Tài liệu bản vá và checklist 247 card. |
| `app.js` | Điều kiện âm summon/reveal; giữ nhật ký khởi tạo combat. |
| `autochess_combat.js` | Đồng bộ phiên bản module passive trong worker. |
| `ball_audio.js` | Điều phối âm victory theo mode, giữ âm riêng Ball. |
| `battle_log_view.js` | Nhận diện badge log mới với màu sắc hiện có. |
| `combat_stats.js` | Hook log biến đổi chỉ số thật và modifier debuff. |
| `content_passives.js` | Điều kiện Last Hero Standing, kiểm tra hit và copy/kill. |
| `drop_audio.js` | Quy tắc reveal chỉ khi mở khóa card mới. |
| `fate.js`, `shibuya.js` | Đếm đòn trực tiếp và sử dụng chiêu Jason chuẩn bị đúng thứ tự. |
| `index.html` | Nạp journal và cập nhật phiên bản cache. |
| `passive_journal.js` | Module mới bổ sung nhật ký dựa trên sự kiện và biến đổi state. |
| `passives.js` | Engine combat, đếm đòn, DR, miễn nhiễm, copy, kill và log. |
| `pvp_combat.js` | Đồng bộ phiên bản luật combat giữa người chơi. |
| `spooky_passives.js` | Ki ki ma ma và các log / status Spooky. |

Các module khác đã được rà soát nhưng không cần sửa lại; vì vậy không được đưa vào ZIP.
