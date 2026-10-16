NHẬT KÝ CẬP NHẬT 16/10/2026
THỜI TIẾT, MUTATION, THẺ MỚI, TIẾN HÓA VÀ NHẠC NỀN

1. LÀM LẠI THỜI TIẾT VÀ MUTATION

Tách mutations.js để quản lý định nghĩa mutation, hệ số HP/ATK và xác suất. weathers.js quản lý nhóm thời tiết, lịch xuất hiện và hiệu ứng kinh tế. Không gộp các hệ thống này vào app.js.

Nhóm Common:
- Raining / Wet: +5% tốc độ roll.
- Snowing / Frost: +10% EXP.
- Sunny / Solar: +10% VNĐ.
- Lucky / Clove: cộng +0,5 vào hệ số Luck trước Lucky Potion.

Nhóm Uncommon:
- Sugar / Sweet: +10% tốc độ roll.
- Reaper / Hollow: +25% VNĐ từ chiến đấu.
- Eclipse / Eclipsed: +33% VNĐ từ chiến đấu; xác suất địch trận thường có mutation tăng từ 70% lên 90% khi có thời tiết đang hoạt động.
- Wind / Storm: +13% tốc độ roll.

Nhóm Rare:
- Malevolent / Cursed: +50% VNĐ từ chiến đấu.
- Tsukuyomi / Mangekyo: +20% tốc độ roll.
- Heavenly / Angelic: +30% VNĐ.
- Shadow / Monarch: +50% EXP.
- Bizare / Stardust: +66% VNĐ từ chiến đấu.

Normal vẫn là trạng thái mặc định khi không có thời tiết đặc biệt. Tên hiển thị mới giữ cách viết Bizare theo yêu cầu. Bí danh Bizarre được hiểu là Bizare; Eclipsed được hiểu là Eclipse khi tra cứu thời tiết.

Tương thích Sugar: mutation hiển thị là Sweet nhưng giữ ID lưu trữ sweat. Các save dùng Sweat vẫn hoạt động; Sweet là bí danh của cùng mutation, không tạo một bản sao riêng. Blizzard và Sacrifice cũ tiếp tục ánh xạ sang Frost và Eclipsed.

Lịch thời tiết vẫn kiểm tra mỗi 300 giây trong game, xác suất xuất hiện thời tiết đặc biệt 55% mỗi lần kiểm tra. Khi xuất hiện, nhóm Common/Uncommon/Rare được chọn với xác suất 65%/25%/10%, sau đó chọn một thời tiết trong nhóm. Mỗi thời tiết kéo dài 600 giây. Buff hết hạn theo thời tiết đang hoạt động; không được lưu thành nâng cấp vĩnh viễn.

2. XÁC SUẤT VÀ CHỈ SỐ MUTATION MỚI

Mỗi thời tiết đang hoạt động thực hiện một phép thử độc lập:
- Common: 10%.
- Uncommon: 5%.
- Rare: 2,5%.
- Tối đa 2 mutation trên một thẻ.

Khi có đúng 2 thời tiết phù hợp, xác suất double mutation bằng tích của hai phép thử, không dùng quy tắc 6,5% rồi thử lần hai của bản cũ.
Ví dụ Wet + Monarch: 10% x 2,5% = 0,25%.
Hai Common: 1%; Common + Uncommon: 0,5%; hai Uncommon: 0,25%; Uncommon + Rare: 0,125%; hai Rare: 0,0625%.

Nếu có hơn 2 thời tiết đồng thời, game xáo trộn danh sách trước khi thử độc lập và giữ tối đa 2 kết quả thành công. Vì vậy không ưu tiên mutation theo vị trí trong danh sách; xác suất xuất hiện đúng một cặp cụ thể còn phụ thuộc các thời tiết khác cùng thành công. Không có thời tiết đặc biệt thì roll thẻ không tạo mutation.

Hệ số HP / ATK:
- Wet: HP x1,1; ATK x1,25.
- Solar: HP x1,25; ATK x1,1.
- Frost: HP x1,2; ATK x1,2.
- Clove: HP x1,3; ATK x1,1; màu xanh neon.
- Sweet, ID sweat: HP x1,5; ATK x2.
- Hollow: HP x1,6; ATK x1,8.
- Eclipsed: HP x2; ATK x2.
- Storm: HP x1,5; ATK x3; chuyển màu trắng sang xám.
- Cursed: HP x5; ATK x3.
- Mangekyo: HP x4; ATK x3,5.
- Angelic: HP x6; ATK x3.
- Monarch: HP x3; ATK x6.
- Stardust: HP x3; ATK x4; màu hồng neon.

Công thức chỉ số thẻ:
  L = 1 + 0,075 x (level - 1).
  HP = round(HP gốc x L x tích hệ số HP của các mutation).
  ATK = round(ATK gốc x L x tích hệ số ATK của các mutation).

HP và ATK nay được tính riêng; không dùng một hệ số chung để tăng cả hai. Trận thường áp dụng cùng cách tính cho địch có mutation. Tower vẫn dùng ngân sách chỉ số theo tầng và giới hạn ATK của Tower; các hệ số mới không ghi đè đường cong tầng đã cân bằng.

Hệ số phụ dùng tính giá trị salvage/EXP roll của 10 mutation cũ được giữ nguyên, tránh thay đổi ngoài ý muốn đối với kinh tế hiện có. Ba mutation mới dùng hệ số giá trị bằng căn bậc hai của tích HP x ATK: Clove sqrt(1,43), Storm sqrt(4,5), Stardust sqrt(12). Hệ số giá trị này không thay thế hai hệ số chiến đấu riêng.

3. CÁCH CỘNG BUFF THỜI TIẾT

Các bonus cùng loại từ những thời tiết hoạt động được cộng với nhau. Những loại khác nhau tác động vào đúng luồng thưởng của mình.
- Luck = (hệ số Luck hiện có trước potion + bonus Lucky) x hệ số Lucky Potion.
- Thời gian roll = thời gian roll gốc / [(1 + bonus nâng cấp tốc độ + tổng bonus tốc độ thời tiết) x hệ số Speed Potion]. Buff mới áp dụng khi bắt đầu cooldown tiếp theo.
- EXP thường = kết quả hệ số EXP hiện có x (1 + tổng bonus EXP thời tiết), làm tròn xuống tại bước cấp EXP.
- EXP roll trùng cũng nhận bonus EXP thời tiết, bên cạnh quy tắc EXP/potion/thành tựu riêng đang có.
- EXP Time Trial nhận (1 + bonus thành tựu EXP) x (1 + bonus EXP thời tiết). Không thêm hệ số shop/potion EXP vào chế độ này.
- VNĐ chung nhận (1 + tổng bonus VNĐ chung của Sunny/Heavenly). Trong chiến đấu, hệ số này được áp dụng sau passive; salvage áp dụng qua hệ số VNĐ chung.
- Phần thưởng VNĐ chiến đấu nhận thêm (1 + tổng bonus VNĐ chiến đấu của Reaper/Eclipse/Malevolent/Bizare) sau khi tính các bonus passive hiện có, bao gồm khoản VNĐ thưởng thêm từ passive.
- Bonus VNĐ chỉ từ chiến đấu không tăng giá salvage hoặc phần thưởng VNĐ cố định khi claim thành tựu.
- Raid và Normal Time Trial vẫn không phát VNĐ/EXP; Tower vẫn không phát EXP. Không dùng buff thời tiết để mở lại các nguồn thưởng đã bị loại bỏ.

Ví dụ có Snowing và Shadow: EXP thời tiết x1,6. Có Sunny và Heavenly: VNĐ chung x1,4. Có Reaper và Bizare: VNĐ chiến đấu x1,91, không nhân 1,25 x 1,66.

4. THÊM 8 THẺ

Các tỷ lệ dưới đây là tỷ lệ gốc trước Luck. Điều kiện thời tiết chỉ xét khi roll; thẻ đã sở hữu vẫn được dùng theo luật chọn đội hiện có.

Funny Valentine
- ID funny-valentine; Nature; Bizare; 1 trong 214.000; HP 21.400; ATK 2.140.
- D4C: mỗi đòn đánh chính có 14% tạo Clone bằng 10% max HP/ATK hiện tại, không có passive; tối đa 10 Clone còn sống.
- Clone sống đánh phụ sau mỗi đòn chính của chủ. Khi nhận đòn chí mạng và còn Clone, hy sinh 1 Clone để sống với 10% max HP. Bleed chặn cơ chế phục hồi HP này.

Dio The World
- ID dio-the-world; Electric; Bizare; 1 trong 666.666; HP 66.666; ATK 6.666.
- The World: mỗi 5 đòn chính, chọn Time Stop hoặc Road Roller với xác suất 50% mỗi loại.
- Time Stop: Freeze toàn bộ địch trong 2 lượt của từng địch. Sát thương của Dio lên mục tiêu đang Freeze được x2.
- Road Roller: đánh tối đa 3 địch còn sống, mỗi mục tiêu nhận x3 ATK; mục tiêu sống sau khi nhận sát thương chịu Bleed 3 lượt, mỗi lượt 66% ATK tại lúc áp dụng.

Joseph Joestar
- ID joseph-joestar; Electric; không khóa thời tiết; 1 trong 120.000; HP 20.000; ATK 1.200.
- Secret Techniques: mỗi 10% max HP bị thiếu cộng 5% né tránh.
- Né thành công khiến kẻ tấn công nhận thêm 75% sát thương và bị tắt passive đến hết lượt kế tiếp của chính nó. Hiệu ứng không mất ngay cuối lượt vừa bị né.

Jolyne Joestar
- ID jolyne-joestar; Nature; Bizare; 1 trong 206.000; HP 26.000; ATK 6.000.
- Stone Free: ưu tiên địch có HP hiện tại thấp nhất.
- Khi bị một địch có HP hiện tại thấp hơn mình tấn công, Stun địch đó 6 lượt; chỉ kích hoạt 1 lần/trận. Đòn đang thực hiện không bị hủy chỉ vì hiệu ứng vừa kích hoạt.

Tohth
- ID tohth; Holy; Bizare; 1 trong 189.000; HP 30.000; ATK 1.890.
- OinGo BoinGo: nếu không đứng ở vị trí đầu đội hình lúc vào trận, đánh dấu một địch ngẫu nhiên.
- Khi mục tiêu thật sự bị hạ và Tohth còn sống, toàn bộ đồng đội đang sống nhận +18,9% ATK hiện tại đến hết trận, 1 lần. Không phát thưởng lặp từ thông báo chết trùng.

Emmu
- ID emmu; Dark; Bizare; 1 trong 1.700.000; HP 200.000; ATK 10.000.
- Sleep Demon Art: đòn chính trúng mục tiêu có 17% gây Stun 1 lượt hoặc Hypnosis 1 lượt, chia đều 50%/50%.
- Địch bị Hypnosis có 80% đánh một đồng đội sống thay vì địch ở lượt đó; nếu không còn đồng đội hợp lệ thì đánh bình thường.
- Mỗi lần hạ mục tiêu nhận +70% ATK hiện tại.

Josuke
- ID josuke; Water; Bizare; 1 trong 2.400.000; HP 240.000; ATK 12.000.
- Crazy Diamond: trước mỗi đòn chính, xóa debuff cho đồng đội sống, gồm Stun, Freeze, Bleed, Burn, Snail, suy yếu ATK, Hypnosis, Heresy và khóa passive có thời hạn.
- Giảm các bộ đếm hồi chiêu kỹ năng đang có 4 lượt, tối thiểu 0. Không xóa khóa passive vĩnh viễn đến lúc chết, không trừ thời hạn buff, không tự tăng bộ đếm số đòn của kỹ năng một lần/trận.
- The World và nhịp tạo Clone Ito Ito sử dụng bộ đếm hồi chiêu riêng; được Josuke hỗ trợ thì có thể sẵn sàng sớm hơn nhịp cơ bản 5/3 đòn.
- Hồi sinh 1 đồng đội gốc hợp lệ, 1 lần/trận, với max HP và ATK hiện tại của Josuke. Không hồi sinh Clone, summon, thẻ chết vĩnh viễn hoặc thẻ bị cấm hồi sinh từ bên ngoài.

Akaza
- ID akaza; Water; Malevolent; 1 trong 8.000.000; HP 450.000; ATK 40.000.
- Destructive Demon Art: ưu tiên địch có ATK cao nhất; gây x1,5 sát thương.
- Nếu bắt đầu ở sau vị trí 1, đổi với vị trí 1 rồi nhận +50% ATK và +25% max HP.
- Nếu đã bắt đầu ở vị trí 1, mỗi đòn chính đánh thêm một địch khác. Hai nhánh xác định theo vị trí gốc trước mọi thay đổi đội hình.
- Sống qua đòn chí mạng với 1 HP; mỗi lần sống qua chí mạng hoặc hạ địch tăng +10% ATK hiện tại. Không thêm giới hạn số lần. Bleed và luật chết vĩnh viễn vẫn có hiệu lực.

Clone/summon không tự tạo thêm Clone/summon. Giới hạn 10 Clone sống chỉ dành cho D4C; không áp đặt giới hạn tạo đơn vị chung lên các thẻ khác.

5. HỆ THỐNG TIẾN HÓA

Mở menu ... rồi chọn Evolution. Chọn chính xác biến thể mutation muốn hy sinh. Màn hình hiển thị level thẻ gốc, số lượng biến thể, vật phẩm và điều kiện còn thiếu.

Marine Fort Raid Shop bổ sung:
- Web String: 6.220 Marine Fort Raid Coins / 1 vật phẩm.
- Cannon Ball: 3.899 Marine Fort Raid Coins / 1 vật phẩm.
- Vật phẩm được lưu dưới loại material trong Storage. Drop Multiplier không nhân số lượng hàng mua.

Công thức tiến hóa:
- 1 Doflamingo Lv.100 trở lên + 1 Web String -> 1 Awakened Doflamingo Lv.1, EXP = 0.
- 1 Garp Lv.100 trở lên + 1 Cannon Ball -> 1 Prime Garp Lv.1, EXP = 0.
- Giữ đúng tập mutation của bản gốc, kể cả double mutation. Không roll lại mutation.
- Chỉ tiêu 1 bản sao của đúng biến thể đã chọn; các bản sao gốc còn lại giữ level/EXP hiện có.
- Hai thẻ kết quả có tỷ lệ 1 trong 0 và cờ evolutionOnly; không xuất hiện trong gacha thường.
- Game hiện dùng chung level theo ID thẻ. Vì vậy mỗi thẻ kết quả chỉ tiến hóa 1 lần/save, có biên nhận lưu bền; không reset level của một thẻ tiến hóa đã sở hữu. Đây là cách xử lý mặc định khi chưa có lựa chọn khác về level từng bản sao.
- Không cho tiến hóa khi trận đang chạy hoặc game đang nhập/xuất save.

Awakened Doflamingo
- ID awakened-doflamingo; Dark; HP 60.220; ATK 26.200.
- Ito Ito: bắt đầu ở vị trí 1 và còn sống đến lượt chiến đấu 10 thì đánh toàn bộ địch bằng x10 ATK hiện tại, 1 lần.
- Nhịp cơ bản mỗi 3 đòn chính: 60% tạo Clone bằng 60% max HP/ATK hiện tại, không passive, không giới hạn số lượng.
- Clone bị hạ khiến kẻ tấn công chịu Stun 2 lượt.
- Đòn chính thứ 5 khóa passive của mục tiêu đang sống đến khi mục tiêu chết, 1 lần/trận. Josuke không xóa được khóa này bằng cleanse.

Prime Garp
- ID prime-garp; Nature; HP 38.992; ATK 3.899.
- Galaxy Impact: đòn chính thứ 7 đánh toàn bộ địch bằng x10 ATK hiện tại; mục tiêu còn sống chịu Stun và khóa passive 3 lượt.
- Khi HP dưới 50% max HP, giảm 25% sát thương nhận vào.

An toàn giao dịch:
- evolution.js ghi bản khôi phục trước khi tiêu vật phẩm và cập nhật quyền sở hữu.
- Nếu một bước ghi thất bại, khôi phục cả thẻ và vật phẩm. Nếu trang bị đóng giữa bước ghi, lần tải sau khôi phục trạng thái trước giao dịch trước khi nạp game.
- Export chỉ thực hiện khi giao dịch tiến hóa đã kết thúc. Import kiểm tra trạng thái giao dịch và bảo toàn biên nhận tiến hóa trong save chính.
- Không chạy lại migration hạ Lv.10 đối với save đã có cờ; thẻ gốc Lv.100+ hợp lệ vẫn có thể tiến hóa sau reload/import.

6. MÔ TẢ PASSIVE VÀ HIỂN THỊ

- Rà soát mô tả passive của toàn bộ bộ thẻ, rút gọn câu dài, sửa câu khó đọc và chuẩn hóa x3, %, HP, ATK.
- Rút gọn 11 Champion và 3 Secret Raid thành các dòng nêu rõ điều kiện, tỷ lệ, thời hạn và hiệu ứng.
- Sửa mô tả Jin Mori còn ghi giới hạn x3 cũ; cơ chế hiện tại không bị thêm giới hạn mới.
- Giữ nút + ở góc phải dưới vùng passive, hỗ trợ xuống dòng và mở nội dung đầy đủ.
- Bổ sung bộ lọc Clove, Storm, Stardust; Sweet và Sweat dùng chung bộ lọc.
- Hover chip thời tiết để xem buff, hệ số mutation HP/ATK và tỷ lệ thành công theo nhóm.

Các PNG mới được tham chiếu trong assets/cards/:
funnyvalentine.png, diotheworld.png, josephjoestar.png, jolynejoestar.png,
tohth.png, emmu.png, josuke.png, akaza.png,
awakeneddoflamingo.png, primegarp.png.

Gói nguồn hiện không có artwork riêng cho những thẻ mới; giao diện dùng ảnh dự phòng nếu tệp chưa được bổ sung. Không thay artwork Champion đã cấu hình trước đây.

7. SỬA BỐ CỤC NÚT BẮT ĐẦU TRẬN

- Khu chuẩn bị trận có vùng cuộn; các điều khiển Raid, Tower, Time Trial không bị co mất.
- Nút Start được giữ ở đáy vùng hiển thị, cao tối thiểu 48 px, không bị danh sách thẻ hoặc phần xem trước Raid che khuất.
- Đã kiểm tra ở 1440x900, 1280x720 và 390x844 cho 1v1, 4v4, Tower, Raid, Normal Time Trial và EXP Time Trial.

8. AUTO CONTINUE SAU THẮNG VÀ THUA

- Khi ON, sau kết quả thắng hoặc thua, chờ 1.500 ms rồi bắt đầu trận tiếp theo bằng đội đã chọn.
- Giữ trạng thái ON qua reload. Thua không tự tắt công tắc.
- Tower thua: thử lại đúng tầng với đội địch đã khóa.
- Normal Time Trial thua/hết giờ: về Room 1 và tạo đội địch mới; thắng: sang phòng kế tiếp.
- Raid: mỗi trận mới vẫn cần thêm 1 key. EXP Time Trial: mỗi lần mới vẫn cần thêm 1 ticket.
- Hết key/ticket, thiếu thẻ, đóng Arena, đổi chế độ hoặc chủ động thoát trận sẽ ngăn lịch chạy tiếp. Không tạo vòng lặp lỗi khi thiếu phí vào trận; công tắc vẫn giữ ON để người chơi quyết định sau đó.
- Lượt Time Trial giữ 2 giây, bỏ qua Speed Battle Potion; các chế độ khác giữ tác dụng potion hiện có.

9. NHẠC NỀN LẶP

- background.js dùng thêm một HTMLAudioElement duy nhất, nguồn musictheme.mp4 ở thư mục gốc dự án, loop = true, âm lượng mặc định 35%.
- Chỉ bắt đầu phát sau lần nhấn phím, bấm hoặc chạm đầu tiên. Dùng lại cùng phần tử audio, không chồng nhiều bài sau mỗi lần bấm.
- Có công tắc Music ON/OFF trong menu ..., lưu lựa chọn và đưa lựa chọn vào save xuất/nhập.
- Chuyển sang tab khác không chủ động tắt nhạc. Khi trang được phục hồi, thử phát tiếp; khi thật sự rời trang thì dừng phát. Cơ chế đồng bộ thời gian khi tab được khôi phục vẫn hoạt động.
- Nếu không có tệp hoặc trình duyệt từ chối phát, game không phát sinh lỗi runtime hoặc thử tải lặp liên tục.

TÌNH TRẠNG TỆP ÂM THANH
Chưa có musictheme.mp4 trong những tệp nguồn được cung cấp. Cần đặt tệp nhạc có track âm thanh hợp lệ vào cùng thư mục với index.html rồi tải lại. Mã phát lặp đã được nối; chưa thể xác nhận phát âm thanh thực tế hoặc độ liền mạch của điểm nối với tệp nhạc gốc chưa có. HTMLAudio loop không tự loại bỏ khoảng lặng đã nằm trong nội dung/codec của tệp.

Trình duyệt/hệ điều hành vẫn có quyền đình chỉ hoặc loại bỏ tab. Audio không bảo đảm game chạy nền liên tục trong mọi hoàn cảnh; game tiếp tục dùng đồng hồ thực và kiểm tra deadline khi được khôi phục.

10. CẤU TRÚC FILE THAY ĐỔI TRONG BẢN NÀY

- mutations.js: module mới; dữ liệu mutation, hệ số HP/ATK, phép thử độc lập, bí danh save cũ.
- weathers.js: nhóm thời tiết và bonus, bổ sung Lucky/Wind/Bizare.
- cards.js: 8 thẻ gacha mới, 2 thẻ tiến hóa và mô tả passive gọn hơn.
- passives.js: nhóm hook riêng cho 10 passive mới, cooldown hỗ trợ, Hypnosis và khóa passive; dùng chung luồng sát thương/trạng thái/hồi sinh.
- evolution.js: module mới; công thức, vật phẩm, giao dịch có khôi phục và UI tiến hóa.
- inventory.js: hỗ trợ đọc lại kho sau giao dịch nhiều store; giữ quy tắc vật phẩm cũ.
- raid.js: thêm 2 vật phẩm tiến hóa vào shop Marine Fort.
- background.js: phát nhạc lặp và công tắc âm thanh, giữ hỗ trợ vòng đời trang.
- app.js: phối hợp bonus thời tiết, chỉ số mutation, tiến hóa, save và Auto Continue sau thua.
- index.html / styles.css: menu tiến hóa/nhạc, bộ lọc mutation, modal tiến hóa và nút Start không bị khuất.
- README.txt: chỉ ghi nhật ký của bản cập nhật này.

Gói bàn giao chỉ chứa nguồn game, tài nguyên giao diện và README.txt; không kèm script test, runner hồi quy, log hay ảnh chụp kiểm tra.
