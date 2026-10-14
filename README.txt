NHẬT KÝ BẢN CẬP NHẬT — MARINE FORT RAID
Ngày: 14/10/2026

Tài liệu này chỉ ghi các thay đổi của bản cập nhật hiện tại.

1. THÊM RAID VÀO ARENA

- Thêm raid.js để quản lý loại Raid, boss, Raid Key, ví xu, Difficulty, nâng cấp và phần thưởng. app.js điều phối giao diện và trao thẻ vào kho hiện có.
- Arena có nút Raid; loại đầu tiên là Marine Fort Raid. Đội người chơi có 4 thẻ, đối thủ ban đầu có 10 boss theo thứ tự cố định.
- Difficulty từ 1 đến 1000, enemy Lv bằng đúng Difficulty. Ví dụ Difficulty 50 tạo boss Lv.50; Difficulty 1000 vẫn hiển thị Lv.1000.
- Mỗi lần Start thành công tiêu 1 Marine Fort Raid Key. Đội chưa đủ hoặc không ghi được phí vào save thì không bắt đầu trận. Thua, đầu hàng hoặc reload giữa trận không hoàn Key.
- Thắng phải hạ toàn bộ đội đối thủ, gồm boss cuối và mọi đơn vị còn sống do passive tạo thêm. Không kết thúc sớm khi một boss chết.
- Raid dùng nhịp combat hiện có: 3 giây/lượt; Speed Battle Potion còn hiệu lực đổi thành 1 giây/lượt. Time Trial vẫn cố định 2 giây/lượt.
- Auto Continue dùng lại đội, loại Raid và Difficulty, chờ 1,5 giây rồi tiêu một Key mới; hết Key thì dừng.

2. MARINE FORT RAID KEY

- ID: marine_fort_raid_key; tên: Marine Fort Raid Key; loại ticket, stack trong Storage, dùng ở Arena.
- Thắng 1v1 hoặc 4v4 thường: 10% cơ hội nhận 1 Key, độc lập với potion, Luck và chỉ số Drop Chance.
- Thua trận, Tower, cả hai Time Trial và Raid không rơi Key.

3. BOSS MARINE FORT VÀ CÔNG THỨC LEVEL

Chọn chỉ số Lv.1 cố định nằm trong các khoảng yêu cầu; dùng ảnh và passive của thẻ hiện có. Không thay chỉ số thẻ gốc trong cards.js.

Thứ tự 1: Luffy Kid — HP 3.000; ATK 175.
Thứ tự 2: Buggy — HP 1.750; ATK 300.
Thứ tự 3: Ice Admiral — HP 3.500; ATK 350.
Thứ tự 4: Light Admiral — HP 2.500; ATK 700.
Thứ tự 5: Garp — HP 7.500; ATK 300.
Thứ tự 6: Boa Hancock — HP 2.500; ATK 500.
Thứ tự 7: Doflamingo — HP 3.000; ATK 750.
Thứ tự 8: Shanks — HP 4.500; ATK 1.250.
Thứ tự 9: Blackbeard — HP 6.500; ATK 900.
Thứ tự 10: Whitebeard — HP 17.500; ATK 3.000.

D = Difficulty, số nguyên trong [1; 1000].
M_level = 1 + 0,075 x (D - 1).
HP_boss = round(HP_Lv1 x M_level).
ATK_boss = round(ATK_Lv1 x M_level).

Hệ số giống tăng chỉ số level hiện hành: thêm 7,5% chỉ số Lv.1 mỗi level. D = 50 dùng x4,675; D = 1000 dùng x75,925. Chỉ số nền của cả 10 boss có HP > ATK. Passive vẫn được xử lý trong combat; luật bảo vệ chỉ số Tower không bị thay đổi.
Mỗi boss dùng snapshot stats riêng đã scale theo Lv Raid để các helper passive cũ đọc đúng ATK tại Difficulty đó; không nhân lại level lần nữa hoặc sửa cơ sở dữ liệu thẻ gốc.

4. RAID COINS VÀ PHẦN THƯỞNG RIÊNG

- Thắng Raid chỉ nhận Marine Fort Coins và lượt thử thẻ bí mật riêng nêu ở mục 6. Không cấp VNĐ, EXP, potion hay vật phẩm thường; không thay pity potion, Drop Chance hoặc Reward Bonus của Arena.
- Thua không nhận Raid Coins. Không nhân xu hoặc cơ hội thẻ bí mật bằng potion, Aqua, Nami, Hakari hay nâng cấp thưởng thường.
- Ví xu và nâng cấp lưu riêng theo loại Raid; Marine Fort Coins không phải Tower Coins hoặc VNĐ.

t = (D - 1) / 999.
s = t^0,85.
Coin_min = round(1 + 69 x s).
Coin_max = round(1 + 99 x s).
Thưởng chọn đều một số nguyên từ Coin_min đến Coin_max.

D = 1: đúng 1 Coin.
D = 1000: 70–100 Coins.
Các mức giữa tăng theo đường cong liên tục, không tăng xu lũy thừa.

5. RAID SHOP VÀ NÂNG CẤP ĐỘI

- 25 Marine Fort Coins: 1 EXP Potion, Rich Potion, VNĐ Potion hoặc Speed Potion.
- 50 Marine Fort Coins: 1 Speed Battle Potion.
- VNĐ Potion là vật phẩm mới, ID vnd_potion, +25% VNĐ trong 10 phút. Tác dụng cùng nhóm Rich Potion, không cộng hai bonus thành +50%. Không thêm vào danh sách potion rơi thường.
- EXP Potion giữ +25% EXP, Rich Potion giữ +25% VNĐ, Speed Potion giữ +10% tốc độ roll, mỗi chai 10 phút. Các potion này không tạo EXP/VNĐ trong Raid vì chế độ không trả các nguồn thưởng đó.
- Mỗi nâng cấp đội tăng thêm 1% HP và ATK, từ +1% đến tối đa +100%. Chỉ áp dụng đội người chơi trong Marine Fort Raid, không sửa thẻ/level trong Collection, Tower, Arena thường hoặc Time Trial.

L = cấp nâng cấp đội hiện tại, từ 0 đến 100.
M_đội = 1 + L / 100.
HP_đội = round(HP trước trận x M_đội).
ATK_đội = round(ATK trước trận x M_đội).
Giá tăng một cấp = 5 + 5 x floor(L / 10) Coins.

Các cấp 0–9 tốn 5 Coins/lần, 10–19 tốn 10, tiếp tục đến 90–99 tốn 50. Tổng nâng từ 0 lên 100 là 2.750 Coins. Buff áp dụng trước passive vào trận; các buff passive vẫn hoạt động. Không đổi nâng cấp khi trận đang chạy.

6. THẺ BÍ MẬT MARINE FORT

Thêm ba thẻ Secret, chance cấu hình 0, hiển thị 1 in 0:
- Mihawk — raid-secret-mihawk; HP 100.000; ATK 5.000; assets/cards/mihawk.png.
- Ace — raid-secret-ace; HP 10.000; ATK 1.000; assets/cards/ace.png.
- Marco — raid-secret-marco; HP 500.000; ATK 10.000; assets/cards/marco.png.

Cơ hội mở lượt thử thẻ bí mật:
p = [1 + 9 x (D - 1) / 999] / 100.
D = 1: 1%; D = 1000: 10%.
Sau khi trúng lượt thử: Ace 55%, Marco 35%, Mihawk 10%.

Khi chưa sở hữu thẻ nào, xác suất mỗi lần thắng ở D = 1 là Ace 0,55%, Marco 0,35%, Mihawk 0,10%; ở D = 1000 là Ace 5,5%, Marco 3,5%, Mihawk 1%.

- Nếu kết quả chọn là thẻ đã nhận hoặc đang sở hữu, không trao bản thứ hai và không roll bù sang thẻ khác. Vì vậy xác suất thực nhận giảm khi đã thu thập một phần bộ thẻ; tỷ trọng 55/35/10 của phép chọn vẫn giữ nguyên.
- Biên nhận mở khóa lưu vĩnh viễn: salvage không làm thẻ đã nhận rơi lại. Thẻ không vào pool RNG thường, kể cả sau mở khóa hoặc đang đúng thời tiết.
- Lúc trao thẻ dùng rollMutations hiện có: 6,5% cơ hội mutation khi có thời tiết; có nhiều thời tiết thì thêm 10% cơ hội mutation thứ hai sau mutation đầu. Xác suất double mutation nền tương ứng 0,65% khi đủ điều kiện. Mutation đi qua kho biến thể, Collection, stat scaling và battle như thẻ thường.
- Nhận thẻ Raid không cấp EXP kèm theo. Ba đường dẫn PNG được cấu hình; artwork thật phải có trong assets/cards/ của bản game đang dùng.

7. PASSIVE CỦA MIHAWK, ACE VÀ MARCO

Mihawk — Hawkeye
- Né đòn với xác suất 50%; né thành công phản người đánh bằng 500% ATK hiện tại.
- Đòn chính xuyên đội đang sống: mục tiêu đầu nhận sát thương đòn bình thường, mỗi hit gây damage làm hệ số cho mục tiêu sau giảm x0,75. Mục tiêu đầu né/chặn hết bằng khiên không ngăn đánh các mục tiêu còn lại và không tiêu bước giảm hệ số. Với 100 ATK và không crit/phòng thủ, mức nền lần lượt 100, 75, 56, 42… sau làm tròn.
- Đầu mỗi lượt combat, kể cả lượt đối phương, có 25% vào Haki: +250% ATK và 25% giảm damage nhận trong 2 lượt combat. Kích hoạt lại làm mới thời hạn, không cộng chồng cùng buff Haki; hết hạn gỡ đúng phần bonus.

Ace — Mera Mera
- Đòn trúng gây damage có 10% đặt Burn 3 lượt của mục tiêu, mỗi tick bằng 100% ATK Ace khi áp dụng.
- Khi Ace chết, đồng đội khác đang sống nhận Brother Soul đến hết trận: đòn trúng có phép thử 10% riêng để đặt Burn 1 lượt, mỗi tick bằng 100% ATK đồng đội ra đòn.
- Burn Brother Soul stack với Burn từ passive riêng. Nhiều lần Ace chết không tăng xác suất Brother Soul thành nhiều phép thử cùng loại.
- Đồng đội có Brother Soul thấy thêm mô tả đầy đủ trong phần passive mở bằng nút +.

Marco — Phoenix Inferno
- Khi còn sống, đòn hướng vào đồng đội khác có 10% bị chặn hoàn toàn; Marco phản người đánh bằng 200% ATK. Counter dùng dấu riêng để không tạo chuỗi counter vô hạn.
- Một lần mỗi trận cho mỗi Marco: đồng đội còn sống có HP dưới 10% max HP sẽ đổi chỗ với Marco và được hồi tới max HP. Kiểm tra sau damage và ở lượt combat; không hồi sinh đơn vị đã chết. Bleed vẫn chặn phần hồi HP.
- Marco né 10%. Mỗi lần né thành công tăng 10% max HP hiện tại cho mọi đồng đội còn sống, gồm Marco, stack đến cuối trận. Đây là buff combat, không tăng cấp nâng Raid.

8. SỬA SOLAR CLAW VÀ CHUẨN HÓA MÔ TẢ

- Charizard Mega X giữ cơ hội crit nền 33% và toàn bộ chỉ số/tỷ lệ/thời tiết/ảnh hiện có.
- Crit thành công đầu tiên trong trận đặt Burn 3 lượt, tick 33% ATK lúc áp dụng. Đòn bị chặn hoàn toàn chưa tiêu trigger đầu tiên.
- Các crit sau áp dụng x3 vào damage của chính đòn đó; vẫn phải roll crit, không tạo đòn đánh miễn phí hoặc bảo đảm crit tiếp theo. Crit sau không đặt lại Burn Solar Claw. Đòn thường không nhận x3.
- Với ATK 100, hệ số crit nền x1,5 và không phòng thủ: crit đầu gây 150, crit sau gây 450, đòn không crit gây 100; mỗi thao tác chỉ là một đòn.
- Chuẩn hóa mô tả về HP, ATK, %, xN; giữ đoạn rõ trigger, giai đoạn và tác dụng cho 11 Champion. Mô tả thẻ cũ được chuẩn hóa thuật ngữ mà không đổi HP/ATK/chance/weather/ảnh. Nút + và modal đọc toàn bộ vẫn hoạt động.

9. CLONE/SUMMON VÀ PHẠM VI TƯƠNG THÍCH

- Theo chỉ đạo sửa trong phiên này, bỏ giới hạn số lần tạo đơn vị của Jin Mori, Metal Cooler và Doflamingo. Buu/Naruto cũng không bị thêm trần số lượng. Không có bộ đếm toàn trận giới hạn ba clone/summon.
- Giữ quy tắc chống đệ quy đã có: đơn vị sinh trong combat không tạo thế hệ clone/summon tiếp theo; thẻ gốc được tạo nhiều lần theo trigger. Giới hạn hồi sinh hai lần của cùng đồng đội Dark Aurora và cứu đồng đội một lần của Marco là luật hồi sinh/cứu, không phải trần tạo đơn vị.
- Wonder Of You vẫn chia damage trực tiếp, không hoán đổi vị trí. Marco đổi vị trí là kỹ năng riêng được yêu cầu cho thẻ mới.
- Thêm store anime_card_rng_raid_v1 và schema chính phiên bản 8, giữ tiến độ save cũ. Xu, nâng cấp, Difficulty, lịch sử thẻ, phí vào trận và phần thưởng chờ lưu được gói trong .acrsave.
- Phần thưởng Raid ghi bản chờ trước khi trao thẻ; biên nhận thẻ và commit ví xu ngăn trao lại sau reload/lỗi ghi. Lỗi tiêu Key hoặc mua item khôi phục phần thay đổi chưa thành công.
- Save cũ không có store Raid vẫn nhập được, bắt đầu Raid mới từ ví 0/cấp 0. Không đổi HMAC-SHA-256, SECRET_SALT, Base64 chuẩn hoặc cooldown xuất/nhập 7 ngày độc lập.
- Giữ Tower retry cùng đối thủ, công thức HP/ATK/xu/VNĐ Tower, Normal Time Trial và EXP Time Trial. Không đổi lịch weather, roll rate thẻ hiện có hoặc timer potion.

10. FILE TRONG BẢN PHÁT HÀNH

index.html, styles.css, passives.css, app.js, inventory.js, tower.js, timetrial.js, raid.js, achievements.js, cards.js, passives.js, weathers.js, README.txt.

Gói chỉ chứa 13 file sản xuất; không kèm script kiểm thử, log hoặc file tạm. README.txt này không giữ changelog hoặc tài liệu công thức của các bản cũ.
