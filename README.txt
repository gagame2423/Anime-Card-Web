NHẬT KÝ CẬP NHẬT — CATEGORY, FATE VÀ HOLY GRAIL RAID
Phiên bản: 20261019-fate-1

Tài liệu chỉ ghi các thay đổi của bản cập nhật này.

1. HỆ THỐNG CATEGORY TÁCH MODULE

Tạo category.js làm nơi quản lý danh sách Category hợp lệ, kiểm tra thẻ thuộc nhóm, lọc và sắp xếp. Việc gán nhóm của từng thẻ nằm trực tiếp trong thuộc tính category: [...] tại cards.js, không bị giấu trong bảng ID ở app.js.

Đã gán đúng dữ liệu bạn cung cấp cho 139 thẻ cũ và 10 thẻ Fate mới: tổng cộng 149 thẻ. Giữ nguyên cách viết trong dataset, kể cả Villian, AntiVillian và Swordman. Một thẻ có thể thuộc nhiều Category; Category tự nó không đổi Element hoặc hạn chế triển khai.

28 Category hiện có:
Hero, Villian, AntiHero, AntiVillian, Protagonist, Berserk, VideoGame, JoJo, Jujutsu, Fate, Pirate, DragonWarrior, PlanetDestroyer, Ninja, Unhuman, Human, Captain, Brutal, PureEvil, DemonSlayer, Sins, Alternative, Army, Swordman, Supporter, Magician, Reaper, Hunter.

Cách mở rộng:
- Thêm tên mới vào TYPES trong category.js.
- Thêm tên đó vào category của các thẻ cần gán trong cards.js.
- Các hộp chọn lấy danh sách từ registry nên không phải chép thêm option tại nhiều nơi trong HTML.

Thêm bộ lọc Category và lựa chọn sắp xếp Category cho Collection/Index và danh sách thẻ Arena. Có thể kết hợp với Element và tìm kiếm; tìm kiếm nhận cả tên Category. Thứ tự nhóm khi sắp xếp theo thứ tự registry, sau đó theo tên thẻ. Thẻ nhiều nhóm dùng nhóm có thứ tự sớm nhất.

Sandbox có bộ lọc Category riêng cho từng ô chọn, vẫn truy cập toàn bộ Index. Các bộ lọc chỉ thay danh sách chọn; không tạo luật khắc chế mới hoặc sửa chỉ số nền.

2. MƯỜI THẺ FATE MỚI

Thông số dưới đây là HP/ATK tại Level 1, chưa áp dụng mutation hoặc buff. Nội tại được tách sang fate.js và nối với engine chung trong passives.js. Counter được lưu trên từng đơn vị chiến đấu, không reset khi đổi mục tiêu. Hiệu ứng hỗ trợ không tự gọi lẫn nhau thành chuỗi đệ quy; aura đọc trực tiếp từ nguồn đang sống, không cộng lại vào ATK/crit sau mỗi lần render.

2.1. Shirou
ID: shirou. Mythic. Electric. HP 10.000; ATK 8.000.
RNG: 1 in 850.000; chỉ roll trong Sugar.
Category: Swordman, Fate, Hero, Protagonist.
Rose Shield: khi nhận fatal hit, hồi sinh với 10% max HP và nhận shield bằng 100% max HP trong 3 lượt; một lần mỗi trận.

2.2. Kiritsu
ID: kiritsu. Mythic. Fire. HP 150.000; ATK 20.000.
RNG: 1 in 1.850.000 sau khi hoàn thành Kiritsu Quest.
Category: Fate, Brutal, AntiVillian.
Hitman: mỗi đòn thay bằng một lựa chọn ngẫu nhiên:
- Pistol: 50% ATK; trúng đòn khóa nội tại mục tiêu ở lượt kế tiếp.
- Rifle: 60% ATK; có 60% cơ hội follow-up gây 30% ATK. Mỗi follow-up tiếp tục thử 60% để nối đòn, không đặt giới hạn số đòn. Dùng vòng lặp, không gọi đệ quy. Counter của người đánh tiếp tục tăng qua các follow-up.
Đòn bị né không áp hiệu ứng khóa của Pistol. Chặn sát thương bằng shield vẫn dùng quy tắc hiệu ứng đòn trúng của engine.

2.3. Mash
ID: mash. Mythic. Water. HP 300.000; ATK 20.000.
RNG: 1 in 2.900.000; pool thông thường, không cần weather.
Category: Hero, Fate, Supporter.
Shield: khi hỗ trợ ở phía sau, mỗi lượt phe mình tạo shield cho một đồng đội ngẫu nhiên bằng 25% HP hiện tại của Mash, tồn tại 1 lượt. Team nhận +10 điểm phần trăm crit chance khi Mash đang sống và hỗ trợ; không cộng dồn lặp qua từng lượt.
Khi đồng đội nhận một đòn chưa bị shield chặn, Mash hấp thụ 100% phần sát thương còn lại tại chỗ. Không đổi vị trí. Đòn đã được shield chặn không làm Mash mất HP. Chặn chuyển hướng vòng lại giữa các nguồn bảo vệ.

2.4. Gilgamesh
ID: gilgamesh. Secret. Holy. HP 1.000.000; ATK 50.000.
RNG: 1 in 10.000.000; Heavenly.
Category: Villian, Hero, PureEvil, Fate.
King of Heros: khi còn sống, đồng đội có Hero nhận +25% ATK damage. Trong mỗi lượt hỗ trợ, mỗi đồng đội nhận ngẫu nhiên một buff 1 lượt:
- Sword: +5 điểm phần trăm crit chance và +50% crit damage.
- Lance: đòn đánh xuyên tối đa 2 địch.
- Dagger: 50% cơ hội follow-up; nếu đã có kỹ năng follow-up thì tăng xác suất của kỹ năng thêm 10 điểm phần trăm, tối đa 100%, thay vì thêm một lần proc 50% độc lập.
Mỗi đòn của Gilgamesh đánh tối đa 2 địch. Đòn thứ 10 thay bằng đánh toàn bộ đội địch với x10 ATK. Buff ngắn hạn được thay mới, không cộng vĩnh viễn mỗi lượt.

2.5. Cu Chalinn
ID: cu-chalinn. Secret. Water. HP 200.000; ATK 50.000.
RNG: 1 in 4.500.000; Eclipse, tức weather Eclipsed trong yêu cầu; khóa cấu hình là Eclipse.
Category: Hero, Swordman, Fate.
Gae Blog: mỗi đòn có 22,5% cơ hội xuyên tối đa 2 địch, đồng thời thử riêng 45% cơ hội đánh địch cuối hàng với 80% ATK. Fatal hit: hồi sinh với 50% max HP một lần mỗi trận. Đòn thứ 5 tính từ sau hồi sinh gây x5 sát thương chính; không reset khi mục tiêu chết.

2.6. Saber Knight
ID: saber-knight. Mythic. Water. HP 80.000; ATK 8.000.
RNG: 1 in 0; chỉ Evolution.
Category: Hero, Swordman, Fate.
EXCALIBURH: mỗi đòn thêm 1 Excalibur, không cap. Khi chết vĩnh viễn, đánh địch ở tuyến đầu đang sống với sát thương bằng số Excalibur x ATK hiện tại. Không thể clone hoặc hồi sinh, kể cả bởi nguồn đồng đội.

2.7. Iskandar
ID: iskandar. Secret. Fire. HP 400.000; ATK 27.500.
RNG: 1 in 5.500.000; Sunny, tức Solar weather.
Category: Army, Fate, Swordman, Captain, Hero.
Ionian Hetairoi: từ khi vào trận đến khi chết, team có +10 điểm phần trăm crit chance và +10% ATK. Từ đòn thứ 6, mỗi đòn gọi một đồng đội ngẫu nhiên follow-up. Khi là đồng đội cuối cùng còn sống, thêm +5 điểm phần trăm crit chance và +25% crit damage.
Mỗi lần tự hạ địch, chuyển địch thành đồng đội với HP/ATK gốc của đơn vị tại đầu trận và nội tại của địch; tối đa 3 chuyển hóa mỗi trận. Không lấy HP đang bị thương hoặc nhân lại buff tạm thời. Không chuyển hóa clone/summon và thẻ bị cấm clone. Đơn vị được tạo không tiếp tục sinh thêm đơn vị.

2.8. Medea
ID: medea. Secret. Dark. HP 200.000; ATK 32.000.
RNG: 1 in 3.200.000; Shadow.
Category: Villian, Fate, Magician.
Rule Breaker: 32% né passive attack; không biến thành 32% né đòn thường. Mỗi đòn thứ 2 thử 20% stun 1 lượt, sau khi stun kết thúc khóa nội tại thêm 1 lượt của mục tiêu. Mỗi đòn thử riêng 10% đánh cả đội địch với 150% ATK.

2.9. Merlin
ID: merlin. Secret. Holy. HP 100.000; ATK 17.000.
RNG: 1 in 1.700.000; Sugar.
Category: Hero, Magician, Fate, Swordman.
Noble Phantasm: khi hỗ trợ, mỗi hành động tấn công của đồng đội có 17% cơ hội follow-up và stun địch trúng đòn 1 lượt. Hồi cho người đang đánh 5% max HP của họ. Mỗi 3 lượt hỗ trợ của phe mình, tạo shield cho một đồng đội ngẫu nhiên bằng 50% HP hiện tại của Merlin. Shield này không có thời hạn riêng được quy định nên giữ đến khi bị đánh vỡ.

2.10. Gilgamesh Chan
ID: tower-champion-heavenly-200. Secret. Electric.
HP 400.000; ATK 36.000. RNG: 1 in 20.000.000.
Category: AntiHero, VideoGame, Fate, Alternative.
Mốc Heavenly Tower Floor 200 tặng một bản Normal. Sau unlock, vào pool roll khi Heavenly hoạt động.
Enuma English: sau khi đã đánh 8 đòn, khi hỗ trợ có 20% cơ hội follow-up với đồng đội, gây 60% ATK. Có 36% né; né thành công stun người đánh 2 lượt, sau đó khóa nội tại 1 lượt.
Mỗi đòn chọn ngẫu nhiên:
- Gate of Babylon: đúng 5 hit theo xác nhận của bạn, mỗi hit 12% ATK; tổng cơ sở 60% ATK trước phòng thủ/Element/crit.
- Exterminate: đánh tối đa 2 địch, mỗi địch 60% ATK.
- Enkindu: 50% ATK; trúng đòn có 50% cơ hội stun 1 lượt.

Các tỷ lệ trên dùng chỉ số runtime và pipeline Element, shield, phản đòn, fatal hit của engine. Các quy tắc chung sẵn có như Bleed, miễn hiệu ứng và khóa nội tại vẫn được tôn trọng.

3. HOLY GRAIL RAID

Thêm lựa chọn Holy Grail Raid trong cùng mục Raid của Arena. Marine Ford vẫn giữ wallet, độ khó, số trận thắng, Secret đã nhận và nâng cấp đang có. Khi đọc save cũ, chỉ bổ sung wallet Holy Grail trống; không reset Marine Ford.

Đội người chơi: 4 thẻ. Đối thủ: 10 thẻ preset có chỉ số ngẫu nhiên mới mỗi trận. Cần 1 Holy Grail Raid Key cho mỗi lần vào. Key có xác suất cơ sở 50% cho mỗi địch có Category Fate bị hạ vĩnh viễn trong 1v1/4v4 thường; không cần đợi thắng cả trận. Địch clone/summon, Tower, Time Trial, Raid, Boss Event và Sandbox không tạo nguồn key này. Một lần hạ một đơn vị chỉ thử drop một lần.

Độ khó 1–1000 cũng là Level của địch. Chỉ số được roll nguyên, bao gồm cả hai đầu mút, rồi nhân:
Hệ số Level = 1 + 0,075 x (độ khó - 1).
HP/ATK hiển thị = round(chỉ số vừa roll x hệ số Level).

Khoảng chỉ số Level 1:
Saber: HP 5.000–10.000; ATK 500–2.000.
Saber Knight: HP 7.500–15.000; ATK 800–2.500.
Iskandar: HP 20.000–23.000; ATK 1.750–2.500.
Medea: HP 25.000–50.000; ATK 3.500–5.000.
Cu Chalinn: HP 25.000–40.000; ATK 7.000–10.000.
Shirou: HP 75.000–100.000; ATK 5.000–7.000.
Kiritsu: HP 25.000–40.000; ATK 5.000–6.000.
Mash: HP 30.000–50.000; ATK 7.500–10.000.
Merlin: HP 45.000–60.000; ATK 12.500–25.000.
Gilgamesh: HP 200.000–500.000; ATK 50.000–100.000.

Giữ nội tại của từng thẻ; các giới hạn theo trận không đổi thành giới hạn theo mục tiêu. Chỉ thắng khi toàn bộ hàng địch, gồm đơn vị sinh thêm, đã hết.

Thưởng chỉ gồm Holy Grail Raid Coins và drop đặc biệt Excalibur Sword; không cấp VNĐ, EXP, potion thường hoặc thẻ Secret Marine Ford.

Công thức Coins giống Marine Ford:
t = ((độ khó - 1) / 999)^0,85.
Coins min = round(1 + 69 x t).
Coins max = round(1 + 99 x t).
Roll nguyên đều trong min–max. Độ khó 1: 1 Coin; độ khó 1000: 70–100 Coins cơ sở. Drop Multiplier hiện có nhân số lượng và dùng cơ chế làm tròn ngẫu nhiên; không tự nhân VNĐ/EXP.

Shop riêng, tiêu đúng Holy Grail Raid Coins:
- EXP Potion, Rich Potion, Speed Potion: 25 Coins/món.
- Speed Battle Potion: 50 Coins.
- Excalibur Sword: 80.000 Coins.
Không đưa VND Potion đã xóa trở lại game.

Nâng cấp team giống đúng hệ thống Marine Ford hiện hành: mỗi cấp +1% HP và ATK trong riêng loại Raid đó, tối đa +100%. Giá = 5 + 5 x floor(cấp nâng hiện tại / 10) Coins. Hai loại Raid không dùng chung cấp nâng. Bonus chỉ nhân một lần vào các unit mới của trận; không ghi cộng vào thẻ trong collection.

Speed Battle Potion hoạt động trong Raid: 1.000 ms/lượt khi active. Không áp interval này sang Time Trial.

4. EXCALIBUR SWORD VÀ TIẾN HÓA

Vật phẩm: excalibur_sword. Ảnh: assets/items/excalibur.png.
Xác suất drop khi thắng Holy Grail:
p = 0,008 + 0,072 x (độ khó - 1) / 999.
Tức 0,8% tại độ khó 1; tăng tuyến tính đến 8% tại độ khó 1000. Đây là vật liệu nên có thể rơi nhiều lần; số lượng dùng Drop Multiplier hiện hành.

Thưởng Raid được ghi pending trước khi trao. Quantity vật liệu và receipt được commit cùng một item store; nếu lỗi lúc lưu wallet sau khi trao vật liệu, reload sẽ hoàn tất wallet mà không cấp lại Sword. Receipt chỉ lưu lần nhận gần nhất theo nguồn để không tăng vô hạn theo số trận.

Evolution: 1 Saber Level >=100 với mutation bất kỳ + 1 Excalibur Sword -> 1 Saber Knight Level 1. Chép đúng mutation đơn/đôi của bản bị tiêu, không chọn mutation mới. Tiêu đúng một bản theo lựa chọn; giữ các biến thể khác. Dùng journal/rollback của Evolution hiện có. Saber Knight không xuất hiện trong gacha.

Excalibur Sword và Holy Grail Raid Key xuất hiện trong Storage đúng nhóm, có Source Info. Excalibur Sword là vật liệu shop/drop, không tự tạo recipe giả trong Crafting.

5. KIRITSU QUEST TRONG QUESTS.JS

Gộp bộ xử lý Card Quest cũ từ quest.js vào quests.js để Daily, Weekly và Story/Card Quest cùng thuộc module quest chuyên dụng. Giữ nguyên khóa dữ liệu và tiến trình của các Card Quest đã nhận trước đây. index.html không còn tải quest.js.

Bốn bước tuần tự của Kiritsu:
1) Thắng 10.000 Holy Grail Raid ở độ khó >10.
2) Hạ 10.000 địch thuộc Fate.
3) Kiếm tổng 100.000.000 VNĐ trong bước hiện tại; không trừ tiền đang có.
4) Thắng 1.000 trận 1v1 thường với thẻ Fate trong đội hình gốc.

Chỉ bắt đầu sau Accept Quest. Chỉ bước hiện tại nhận tiến độ; không lấy số cũ từ Index, không lấy tiền đang có để hoàn tất bước 3 và không cho sự kiện kết thúc bước trước tính thêm vào bước sau. Battle context giữ Raid type, độ khó và Category của đội hình đầu trận; clone sinh trong trận không giả thành thẻ đã mang vào.

Nguồn VNĐ thật qua chiến đấu, salvage và thưởng quest/achievement gọi cùng sự kiện kiếm tiền; chỉ lượng tiền mới nhận được tính. Không tiêu VNĐ khi hoàn thành mục tiêu. Sự kiện Sandbox không được ghi vào quest.

Hoàn thành cả bốn bước: tặng một Kiritsu Normal và mở vĩnh viễn trong pool roll tiêu chuẩn với RNG 1 in 1.850.000. Receipt phần thưởng ngăn cấp lại khi reload.

6. GỠ THỜI GIAN CHỜ CHUYỂN SAVE

Export và Import .acrsave có thể dùng liên tiếp, không còn giới hạn độc lập 7 ngày. Không ghi timestamp cooldown mới. save_cooldown_export/save_cooldown_import cũ được bỏ qua khi đọc, không được export và được dọn sau import thành công; timestamp sai hoặc nằm trong tương lai không chặn thao tác.

Giữ nguyên payload Base64, checksum HMAC-SHA-256, so khớp toàn vẹn và kiểm tra schema trước khi ghi. Giữ giới hạn kích thước, khóa chống chuyển save đồng thời giữa các tab, rollback khi ghi lỗi và reload sau import. Category là dữ liệu cấu hình thẻ, không cần sao chép registry vào save.

7. EXP TIME TRIAL: GIỚI HẠN KẾT QUẢ CUỐI

Mỗi EXP Monster bị hạ cho EXP thực nhận nằm trong 0,1%–1,5% requirement hiện tại, kể cả sau các buff EXP hợp lệ.
r cơ sở = 0,001 + 0,014 x U.
r cuối = clamp(r cơ sở x các hệ số EXP, 0,001, 0,015).
EXP tính = requirement x r cuối + phần lẻ đã giữ.
EXP nguyên = clamp(floor(EXP tính), ceil(requirement x 0,001), floor(requirement x 0,015)).
Phần lẻ tiếp tục được giữ; màn tổng kết dùng lượng EXP nguyên đã trao / requirement để tính % thật. Level 1000 vẫn bỏ qua cấp EXP. Không đổi ticket hoặc phần thưởng của các mode khác.

Normal Time Trial: 2.000 ms/lượt. EXP Time Trial: 1.000 ms/lượt. Speed Battle Potion không đổi các giá trị này.

8. MODIFIED FILES NOTE

Danh sách đầy đủ 17 tệp được tạo hoặc sửa trong bản này:
1) category.js — TẠO MỚI: registry 28 Category, helper kiểm tra, filter, sort, tạo option UI.
2) fate.js — TẠO MỚI: nội tại 10 thẻ Fate, aura, hỗ trợ, shield, revive, counter và chuyển hóa Iskandar.
3) cards.js — gán Category chính xác cho 139 thẻ cũ; thêm 10 thẻ, dữ liệu chỉ số, RNG, thời tiết, unlock và mô tả.
4) passives.js — nối Fate vào engine, crit/dodge, damage, shield, fatal/death, support, counter và audit; cấm clone/revive Saber Knight.
5) grimoire.js — cho cơ hội follow-up hiện có nhận buff Dagger qua callback runtime.
6) requiem.js — cho chuỗi SPR nhận buff Dagger qua callback, không đổi rate khi không có buff.
7) raid.js — Holy Grail, khoảng chỉ số, key Fate, wallet/shop/upgrades, drop Sword, pending reward và migration Marine Ford.
8) inventory.js — receipt vật liệu cùng quantity, cấp một lần và đọc receipt khi reload.
9) evolution.js — công thức Saber Knight và định nghĩa Excalibur Sword.
10) quests.js — tiếp nhận toàn bộ Card Quest, Kiritsu Quest, điều kiện Category/Raid, tracking tiền kiếm được và dữ liệu đầu trận.
11) app.js — nối các module, filter Category, UI Raid theo loại, sự kiện kill/kiếm tiền, save không cooldown và validator receipt.
12) sandbox.js — Category filter theo ô chọn; tiếp tục dùng engine riêng không ghi tiến trình.
13) storage.js — nguồn key Holy Grail, Excalibur và giá shop đúng từng loại Raid.
14) timetrial.js — cap EXP cuối sau buff và thống kê % theo EXP thực nhận.
15) index.html — thêm filter/sort Category, Holy Grail selector, script/module mới, bỏ tải quest.js, cập nhật giao diện chuyển save và cache version.
16) startup.js — chẩn đoán thiếu CategorySystem/createFateSkills.
17) README.txt — changelog bản hiện tại, công thức và danh sách thay đổi này.

Tệp bị gỡ: quest.js. Toàn bộ chức năng đã chuyển sang quests.js; không có khóa save mới thay thế khóa Card Quest cũ. Khi cập nhật thủ công có thể xóa quest.js cũ vì index.html mới không sử dụng nó.

Các module sản xuất còn lại được kèm đầy đủ trong ZIP và giữ nguyên nội dung từ bản ổn định. Gói có 36 tệp nguồn/tài liệu, không kèm Excel, asset ảnh/âm thanh, log, script test hoặc thư viện kiểm thử.

9. KIỂM TRA VÀ TRIỂN KHAI

Đã kiểm tra cú pháp mọi tệp JS, số thẻ/Category, audit 149 nội tại và các tình huống chỉ số/nội tại cụ thể. Chạy mẫu chiến đấu có seed cho cả 149 thẻ, mỗi trận tối đa 100 lượt kiểm tra, không gặp lỗi runtime hoặc HP/ATK không hữu hạn. Đây là giới hạn của lần kiểm tra, không phải cap mới trong gameplay.

Đối chiếu thêm 139 kịch bản dùng thẻ cũ với bản ổn định, cùng seed và tối đa 100 lượt: kết quả HP/ATK, đội hình, thắng/thua và số lần gọi RNG trùng nhau. Dữ liệu 139 thẻ cũ chỉ thêm Category, không đổi các trường còn lại.

Đã kiểm tra biên min/max chỉ số Holy Grail ở độ khó 1, 50 và 1000; Coins, tỷ lệ Sword, key, cửa hàng theo loại và khôi phục pending reward sau lỗi ghi giả lập. Kiểm tra quest không hồi tố, bước tuần tự, đếm tiền và cấp thẻ một lần.

Đã kiểm tra trình duyệt qua đường dẫn con dạng GitHub Pages: script đúng casing, bộ lọc, Arena/Raid, Sandbox, shop, tiến hóa với Double Mutation, roll pool theo weather, milestone Heavenly 200, giữ một bản mỗi biến thể khi salvage, hide rolling card, export/import liên tiếp và từ chối dữ liệu bị sửa. Kiểm tra layout desktop/mobile 390 px, không tràn ngang; Sandbox không đổi các store tiến trình thật trong mẫu kiểm tra.

Upload đồng bộ toàn bộ 36 tệp. Cache JS/CSS: 20261019-fate-1. Giữ thư mục assets đang có của bạn. Bản này chỉ tham chiếu asset, không tạo ảnh hoặc âm thanh mới.

Ảnh thẻ mới trong assets/cards/:
shirou.png, kiritsu.png, mash.png, gilgamesh.png, cuchalinn.png, saberknight.png, iskandar.png, medea.png, merlin.png, gilgameshchan.png.
Vật liệu: assets/items/excalibur.png.
