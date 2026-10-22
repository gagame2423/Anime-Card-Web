NHẬT KÝ CẬP NHẬT SHIBUYA — 22/10/2026
Phiên bản: 20261022-shibuya-1

Tệp này chỉ ghi các thay đổi của bản cập nhật hiện tại.

1. HUD THỜI TIẾT TRONG TRẬN VÀ BOSS EVENT

- Thêm weather_hud.js: hiển thị thời tiết đang hoạt động ở góc trên bên trái trong các chế độ chiến đấu, gồm Arena, Tower, Raid, Boss Event, Time Trial, Spooky Hunt và Sandbox.
- Hiển thị nhiều weather đồng thời, tên, biểu tượng và thời gian còn lại. Không có weather đặc biệt thì hiển thị Normal. Sandbox hiển thị weather thử nghiệm riêng, không sửa weather của save chính.
- HUD tái sử dụng các phần tử DOM, chỉ cập nhật đồng hồ khi sang giây mới; dùng nhịp cập nhật sẵn có, không tạo vòng lặp tần số cao. Dải HUD cuộn ngang khi thiếu chỗ; phần đầu trận chừa chỗ để không che nút trên desktop/mobile.
- Lucius Event đổi điều kiện từ Raining sang Lucky. Kiểm tra cả thời hạn weather; Auto Continue dừng nếu Lucky không còn hiệu lực trước lượt vào tiếp theo.
- Tên lựa chọn sự kiện thống nhất thành Gomen Event. Điều kiện vào Gomen vẫn là Heavenly, được giải thích ở phần luật thay vì ghép vào tên.

2. SHIBUYA RAID, KHÓA VÀ CỬA HÀNG

- Thêm Shibuya Raid vào bộ chọn Raid: 4 thẻ người chơi đấu toàn bộ 10 đối thủ cùng những đơn vị được triệu hồi còn sống. Chỉ công nhận thắng sau khi hàng đợi đối phương đã được dọn sạch.
- Mỗi lượt vào tiêu 1 Shibuya Raid Key. Mua khóa tại Gomen Event Shop với giá 10 Gomen Coins.
- Độ khó D từ 1 đến 1000; cấp đối thủ bằng D. Từng trận lấy HP và ATK nguyên ngẫu nhiên, độc lập, trong khoảng cấp 1 sau:

  Đối thủ           HP cấp 1             ATK cấp 1
  Haruta            6.000–7.000          600–700
  Hanami            10.000–12.000        1.000–3.000
  Mechamaru         60.000–70.000        5.000–10.000
  Dagon             40.000–100.000       10.000–25.000
  Choso             80.000–200.000       15.000–30.000
  Mahito            85.000–220.000       18.000–40.000
  True Mahito       100.000–300.000      30.000–60.000
  Toji              150.000–300.000      40.000–80.000
  Mahoraga          250.000–500.000      50.000–90.000
  Sukuna Shibuya    400.000–800.000      60.000–90.000

- Hệ số cấp: S(D) = 1 + 0,075 × (D - 1). HP/ATK trận = làm tròn(HP/ATK vừa lấy ngẫu nhiên × S(D)). Chỉ số tùy chỉnh của boss được truyền vào runtime nội tại, không sửa dữ liệu thẻ gốc.
- Coins cơ bản dùng công thức Raid hiện có:
  t = ((D - 1) / 999)^0,85.
  Coins tối thiểu = làm tròn(1 + 69t).
  Coins tối đa = làm tròn(1 + 99t).
  Lấy ngẫu nhiên nguyên trong khoảng này: D1 được 1 Coin; D1000 được 70–100 Coins, trước Drop Multiplier.
- Coins thuộc ví Shibuya riêng. Không cộng VNĐ, EXP hoặc potion thường khi thắng Raid. Speed Battle Potion hoạt động bình thường trong Raid.
- Shop: EXP Potion, Rich Potion, Speed Potion giá 25 Shibuya Coins; Speed Battle Potion giá 50. Mahito Puppet giá 10.500 Shibuya Coins.
- Nâng cấp đội dùng đúng cơ chế Raid hiện có: mỗi cấp +1% HP và ATK, tối đa +100%, chỉ trong Shibuya. Chi phí với U cấp đã mua: 5 + 5 × floor(U/10) Coins. Không cộng lặp hệ số vào cùng đơn vị khi dựng lại UI, không ảnh hưởng nâng cấp Marine Ford/Holy Grail.

3. VẬT PHẨM VÀ THẺ RƠI RIÊNG CỦA SHIBUYA

- Ba phép thử rơi độc lập sau khi thắng. Với q = (D - 1)/999:
  Jogo: 0,31% + 2,79% × q; D1 = 0,31%, D1000 = 3,1%.
  Haruta: 5,2% + 46,8% × q; D1 = 5,2%, D1000 = 52%.
  Cursed Finger: 0,1% + 0,9% × q; D1 = 0,1%, D1000 = 1%.
- Jogo và Haruta giữ quy tắc thẻ độc quyền Raid hiện có: mỗi thẻ được nhận một lần; kết quả đã sở hữu/đã nhận không chuyển thành một thẻ khác. Hai thẻ không xuất hiện trong RNG thường, có thể cùng rơi trong một trận. Khi nhận, dùng phép tính mutation chuẩn với tối đa 2 mutation.
- Drop Multiplier tăng số lượng Coins/vật phẩm theo cơ chế làm tròn ngẫu nhiên hiện có, không nhân các xác suất thẻ nêu trên và không nhân số thẻ độc quyền.
- Phần thưởng được ghi vào giao dịch chờ trước khi phát. Thẻ, vật phẩm và ví có biên nhận chống nhận lặp; tải lại sau lỗi ghi ví tiếp tục hoàn tất giao dịch mà không nhân đôi phần thưởng.
- Cursed Finger là Equipment, ảnh assets/items/cfinger.png. Khi trang bị: +0,66 Drop Multiplier, +0,6 Luck, Mutation Chance x1,06 và +0,66 EXP Multiplier. Chỉ có một ô Equipment; chọn lại cùng món không cộng dồn.
- Cập nhật trần xác thực Drop Multiplier thành 3,77 + sai số 0,00000001 để nhận save/giao dịch hợp lệ với trang bị mới. Đây là trần theo tổng bonus hiện có, không phải một bonus tự cộng cho người chơi.
- Mahito Puppet dùng ảnh assets/items/mpuppet.png. Tiến hóa Mahito Lv.100+ + 1 Puppet thành True Mahito Lv.1; tiêu đúng 1 bản thẻ được chọn và sao chép nguyên mutation/double mutation. True Mahito không roll thường.
- Thêm thông tin nguồn trong Storage và sửa nhãn thẻ độc quyền để Jogo/Haruta hiển thị Shibuya thay vì Marine Ford.

4. CHÍN THẺ MỚI VÀ NỘI TẠI

Toàn bộ logic chiến đấu mới nằm trong shibuya.js; chỉ dữ liệu thẻ nằm trong cards.js. Chỉ số dưới đây là chỉ số thẻ Lv.1, tách khỏi khoảng chỉ số boss Raid ở trên. Thuật ngữ thống nhất HP, ATK, %, x2, xFuga.

4.1. Jogo — Inferno Domain
- Nguồn: Shibuya Raid; 1 in 0; Secret; Fire; HP 231.000; ATK 31.000.
- Category: Jujutsu, Villian, Unhuman, Brutal, PureEvil.
- Khi HP xuống dưới 50%, kích hoạt domain đến hết trận. Mỗi lượt chiến đấu gây 20% ATK cho toàn bộ địch khi còn sống. Mỗi đòn tấn công lúc domain hoạt động cộng 1 Meteor, không đặt giới hạn gameplay.
- Chết vĩnh viễn: bắt đầu đếm ngược bằng số Meteor. Hết đếm ngược khi trận còn tiếp diễn thì đánh toàn địch xMeteor ATK. Không giữ trận sống chỉ để chờ Meteor nếu đội đã thua.

4.2. True Mahito — Heni Satsu Rei Tai
- Nguồn: tiến hóa; 1 in 0; Secret; Water; HP 224.000; ATK 15.670.
- Category: Brutal, PureEvil, Villian, Jujutsu, Swordman, Unhuman.
- Hạ địch: triệu hồi nạn nhân với HP tối đa và ATK bằng 25% chỉ số hiện tại của True Mahito, giữ nội tại nạn nhân.
- Mỗi đòn có 15% cơ hội x2 sát thương. Hai đòn x2 thành công liên tiếp mở True Form một lần: +100% ATK và shield bằng 100% HP tối đa đến hết trận.
- True Form: follow-up gây 15% ATK, chuỗi bắt đầu 24%; mỗi hit thành công tăng 12 điểm %, tối đa 72%. Chuỗi tính lặp, không gọi đệ quy và không tự cộng lại bonus True Form.

4.3. Todo — Besto Friendo
- Nguồn: Quest Card, Raining; 1 in 530.000; Mythic; Water; HP 100.000; ATK 5.000 theo thông số đã chốt.
- Category: Army, Hero, Jujutsu, Supporter.
- Khi ở tuyến sau, đồng đội có nội tại follow-up với xác suất không quá 53% được thêm 5,3 điểm % cơ hội follow-up. Aura được tính khi thử xác suất, không sửa vĩnh viễn chỉ số hoặc tích lũy qua mỗi lượt.
- Một lần mỗi trận: chặn toàn bộ đòn chí mạng đánh vào đồng đội, giữ HP trước đòn rồi đổi vị trí họ với đồng đội có HP hiện tại cao nhất. Không tự hồi đầy HP. Đòn bị shield hấp thụ hết không tiêu lượt bảo vệ.
- Khi Todo đánh: 53% gọi một đồng đội ngẫu nhiên follow-up, gây 53% ATK của đồng đội đó. Tôn trọng hiệu ứng chặn follow-up.

4.4. Dagon — Water Manipulation
- Nguồn: Raining; 1 in 2.200.000; Secret; Water; HP 400.000; ATK 12.000.
- Category: Jujutsu, Unhuman, Magician, Villian, Brutal, Army.
- Nhận Burn: xóa Burn ngay và thêm shield 50% HP tối đa.
- Mỗi 3 đòn: triệu hồi clone ở đầu đội, HP bằng 25% HP tối đa và ATK bằng 100% ATK hiện tại của Dagon. Ngẫu nhiên một nội tại:
  Shark: mỗi 2 đòn gây Bleed 1 lượt, sát thương 25% ATK clone.
  Whales: chết thì stun kẻ hạ nó 2 lượt.
  Fish: sống sót 3 đòn chí mạng ở 1 HP, đòn chí mạng thứ 4 hạ được nó.

4.5. Choso — Blood Technique
- Nguồn: Eclipse; 1 in 3.850.000; Secret; Fire; HP 280.000; ATK 32.500.
- Category: Unhuman, Jujutsu, AntiHero, Human.
- Nhận Bleed: xóa ngay và phản Bleed về nguồn với 50% sát thương, giữ thời hạn; hồi chiêu 3 lượt của phía sở hữu Choso. Phản xạ có dấu riêng để không tạo vòng phản Bleed vô hạn.
- Khi còn Bleed trong hồi chiêu, thay đòn thường bằng ngẫu nhiên:
  Pierce Blood: tối đa 4 địch, lần lượt 120% / 90% / 60% / 30% ATK.
  Blood Edge: đòn này có +15 điểm % crit chance và +25% crit damage; không tích lũy vĩnh viễn.
  Flowing Blood: 120% ATK, hồi 10% HP tối đa.

4.6. Haruta — Coward
- Nguồn: Shibuya Raid; 1 in 0; Mythic; Electric; HP 30.000; ATK 7.500.
- Category: AntiHero, Jujutsu, Human.
- Đánh địch có ATK thấp nhất: đòn đó được +200% ATK, tức x3. Đánh địch khác: có 10% giảm sát thương nhận đến lần đánh kế tiếp. Tính lại theo mục tiêu, không cộng dồn qua từng đòn.

4.7. Mechamaru — Puppet Manipulation
- Nguồn: Reaper; 1 in 2.800.000; Secret; Electric; HP 380.000; ATK 18.000.
- Category: Jujutsu, AntiHero, Army, Magician, Supporter.
- Khi đồng đội hoặc địch chết vĩnh viễn, triệu hồi puppet ở đầu đội với 50% HP/ATK gốc trong trận của nạn nhân, giữ nội tại gốc và thêm Puppet. Tối đa 1 puppet của mỗi Mechamaru còn sống trên sân.
- Puppet miễn Stun/Freeze; mỗi đòn hồi 2% HP tối đa. Tên và mô tả nội tại phụ được hiển thị cùng nội tại kế thừa.
- Tôn trọng các thẻ cấm clone/hồi sinh và chặn đơn vị đã được sinh ra tiếp tục tạo clone/summon, giữ quy tắc chống đệ quy hiện có.

4.8. Hanami — Flower Field
- Nguồn: Wind; 1 in 1.820.000; Mythic; Nature; HP 220.000; ATK 18.200.
- Category: Unhuman, Jujutsu, Brutal, Magician.
- Vào trận nhận shield 100% HP tối đa. Khi còn shield, miễn passive attack, bao gồm sát thương domain; không tiêu shield cho những đòn bị miễn.
- Mỗi 3 đòn, 28% hypnotize mục tiêu 1 lượt; trong lượt đó có 82% đánh đồng đội của chính nó. Có thể được cleanse cùng các debuff khác.

4.9. Sukuna Shibuya — FUGA x Domain
- Nguồn: Quest Card, Malevolent; 1 in 9.999.999; Secret; Fire; HP 1.000.000; ATK 9.999.
- Category: Jujutsu, PureEvil, Brutal, Villian, AntiVillian.
- Mỗi đòn cộng 1 Fuga và hồi 3% HP tối đa.
- Một lần mỗi trận, đòn chí mạng tự hồi sinh đầy HP ở đầu đội, mở domain trong số lượt bằng Fuga; mỗi lượt domain gây 9% ATK cho toàn bộ địch. Nếu Fuga > 9, ngay lúc hồi sinh còn đánh toàn địch xFuga ATK.
- Cấm clone và hồi sinh từ đồng đội. Chỉ lần tự hồi sinh riêng ở trên được sử dụng.

Các domain/countdown tính theo từng lượt chiến đấu toàn cục; 1 lượt là một hành động của một phía, không phải một vòng gồm hai phía. Các đơn vị Shibuya được triệu hồi còn sống vẫn được tính khi xác định đội đã bị dọn sạch.

5. QUEST TUẦN TỰ CHO TODO VÀ SUKUNA SHIBUYA

- Cả hai tuyến nằm trong quests.js và giao diện Quest hiện có. Chỉ bắt đầu sau Accept Quest; chỉ bước đang mở nhận tiến độ. Một sự kiện hoàn thành bước không được cộng thêm cho bước kế tiếp. Sandbox không ghi tiến độ.
- Hoàn tất tuyến: nhận 1 thẻ Normal, mở khóa vào RNG thường dưới đúng weather của thẻ.

Todo:
1) Hoàn thành 1.000 trận ở bất kỳ chế độ thực nào với Yuji Itadori trong đội hình xuất phát; thắng/thua đều tính.
2) Thắng 1.000 Shibuya Raid ở Difficulty > 10 với Yuji Itadori trong đội xuất phát.
3) Thắng 1.000 trận 1v1 thường với Yuji Itadori trong Raining.

Sukuna Shibuya:
1) Thắng 10.000 Shibuya Raid ở Difficulty > 100.
2) Thắng 1.000 Shibuya Raid ở Difficulty > 100 trong Malevolent.
3) Roll 66.666 lần trong Malevolent.
4) Roll Malevolent King với Cursed; double mutation có Cursed được chấp nhận.

6. TIME TRIAL: ACHIEVEMENT VÀ SỬA EXP MULTIPLIER

- Thêm 20 mốc Normal Time Trial:
  Room 210, 220, 230, 240, 250, 260, 270, 280, 290, 300: mỗi mốc +0,1 Luck vĩnh viễn; cả nhóm +1 Luck.
  Room 310, 320, 330, 340, 350, 360, 370, 380, 390, 400: mỗi mốc +0,05 EXP Multiplier vĩnh viễn; cả nhóm +0,5 EXP Multiplier.
- Dùng cơ chế Claim hiện có; lưu biên nhận để không nhận lại. UI hiển thị đúng 0,05 thay vì làm tròn thành 0,1.
- EXP Time Trial vẫn có mức gốc ngẫu nhiên 0,1%–1,5% yêu cầu EXP cấp hiện tại trên mỗi EXP Monster bị hạ. Sửa lỗi chặn kết quả sau khi đã nhân bonus; bổ sung phần nâng cấp EXP vĩnh viễn từng bị bỏ sót.
- Công thức cho mỗi lần hạ:
  r = random(0,001; 0,015).
  M = (1 + bonus nâng cấp EXP + bonus EXP achievement + bonus EXP phẳng Equipment)
      × hệ số EXP Potion đang hiệu lực
      × (1 + bonus EXP weather)
      × hệ số EXP Equipment theo nguồn Arena.
  EXP chính xác = EXP yêu cầu cấp hiện tại × r × M + phần lẻ từ lần trước.
  Cộng floor(EXP chính xác), giữ phần lẻ cho lần tiếp theo; không chặn phần đã nhân M về 1,5%. Giới hạn số nguyên an toàn của JavaScript vẫn được áp dụng.
- Summary cộng theo lượng EXP thực đã được cấp. Thẻ Lv.1000 ngừng nhận EXP và xóa phần lẻ dư như trước.
- Normal Time Trial giữ 2 giây/lượt; EXP Time Trial giữ 1 giây/lượt. Speed Battle Potion không thay đổi hai nhịp này.

7. KIỂM TRA BẢN PHÁT HÀNH

- Kiểm tra cú pháp toàn bộ 38 module JavaScript; 167 nội tại đều được đăng ký/phân loại. Chạy 185 trận giả lập với tổng 2.960 lượt, kiểm tra HP/ATK hữu hạn và truy cập mô tả/badge không lỗi.
- Kiểm tra riêng đòn chí mạng của Todo, thứ tự triệu hồi, True Form, Burn/Bleed và cooldown, Puppet miễn Freeze/hồi HP/chống đệ quy, Fuga hồi sinh một lần, Meteor sau khi chết và shield miễn passive attack của Hanami.
- Kiểm tra các khoảng ngẫu nhiên ở Difficulty 1/50/1000; khóa, shop, nâng cấp, ví riêng; không công nhận thắng trước đối thủ thứ 10; các phép thử rơi riêng và chống nhận thẻ lặp.
- Giả lập lỗi ghi ví Raid rồi tải lại: giữ đúng 1 Jogo, 1 Haruta và 1 Equipment, nhận Coins đúng một lần.
- Kiểm tra tiến hóa giữ double mutation, quest không đếm trước khi nhận/không tính Sandbox, achievement nhận đúng bonus một lần và EXP thực áp dụng toàn bộ multiplier.
- Kiểm tra HUD trên desktop 1440 px và mobile 390 px; Sandbox dùng weather riêng và không sửa dữ liệu tiến trình. Kiểm tra roundtrip .acrsave và từ chối payload bị sửa.
- Gói chỉ chứa mã nguồn và README.txt. Không kèm Excel, test runner, log kiểm thử, ảnh hay âm thanh nhị phân. Tiếp tục sử dụng assets do người dùng quản lý.

8. ĐƯỜNG DẪN ẢNH MỚI

Chỉ cấu hình đường dẫn, không tạo hoặc đính kèm ảnh:
- assets/cards/jogo.png
- assets/cards/truemahito.png
- assets/cards/todo.png
- assets/cards/dagon.png
- assets/cards/choso.png
- assets/cards/haruta.png
- assets/cards/mechamaru.png
- assets/cards/hanami.png
- assets/cards/sukunashibuya.png
- assets/items/mpuppet.png
- assets/items/cfinger.png

Modified Files Note

Danh sách đầy đủ 20 tệp tạo mới hoặc thay đổi trong bản này:
- shibuya.js: Tạo mới, cô lập toàn bộ nội tại Shibuya, clone, domain, bảo vệ chí mạng, aura và trạng thái trong trận.
- weather_hud.js: Tạo mới, HUD thời tiết tái sử dụng DOM, không ghi tiến trình.
- cards.js: Dữ liệu 9 thẻ, Category, Element, chỉ số, weather, mô tả và khóa nguồn nhận.
- passives.js: Nối hook Shibuya vào engine, tương tác shield/DoT/fatal, companion, copy, tooltip và điều kiện kết thúc đội.
- fate.js: Cho phép aura Todo bổ sung xác suất vào điểm tính follow-up dùng chung.
- raid.js: Loại Raid Shibuya, dải boss, khóa, ví/nâng cấp/shop riêng và phần thưởng chờ phục hồi.
- boss_event.js: Lucius yêu cầu Lucky, Gomen bán Shibuya Raid Key.
- achievements.js: Mốc Time Trial 210–400, hiển thị bonus EXP 0,05 chính xác.
- timetrial.js: Mức gốc EXP tách khỏi tổng multiplier, cộng đúng EXP thực và giữ phần lẻ.
- evolution.js: Recipe True Mahito và Mahito Puppet.
- equipment.js: Đăng ký Cursed Finger và bonus trong ô Equipment duy nhất.
- inventory.js: Cập nhật trần bonus hợp lệ cho giao dịch/save với trang bị mới.
- quests.js: Hai tuyến quest tuần tự Todo và Sukuna Shibuya; tiếp tục dùng bộ theo dõi sự kiện hiện có.
- storage.js: Thông tin nguồn rơi Cursed Finger.
- sandbox.js: Cung cấp snapshot weather thử nghiệm cho HUD, hiển thị/ẩn cùng vòng đời Sandbox.
- app.js: Điều phối UI Raid, thưởng thẻ Shibuya, tổng EXP multiplier, nhãn nguồn thẻ và vòng đời HUD.
- index.html: Lựa chọn Shibuya, tên Gomen, container HUD, nạp module đúng thứ tự và mã phiên bản URL mới.
- styles.css: Dải HUD góc trên trái, bố trí không che nút trên desktop/mobile.
- startup.js: Chẩn đoán thiếu module Shibuya/HUD khi tải bộ nguồn không đầy đủ.
- README.txt: Changelog riêng của bản cập nhật này và danh sách tệp thay đổi.

Gói đầy đủ: 42 tệp nguồn, gồm 38 JavaScript, index.html, styles.css, passives.css và README.txt.
