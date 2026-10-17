NHẬT KÝ CẬP NHẬT — QUEST, CHẾ TẠO POTION VÀ TOWER REQUIEM
Phiên bản: 20261017-quests-1

Tài liệu chỉ ghi các thay đổi của bản cập nhật này. Không kèm lịch sử các bản cũ.

1. GIAO DIỆN VÀ MODULE QUEST

Thêm quests.js để quản lý bộ quest luân phiên, reset theo Game Time, tiến độ, phần thưởng, timer buff và giao diện. quest.js tiếp tục phụ trách các Card Quest tuần tự đang có; trạng thái đã Accept, bước hiện tại và thẻ đã mở khóa được giữ nguyên.

Trong menu ..., Quest Cards được đổi thành Quests. Giao diện theo bố cục ảnh mẫu:
- Daily, Weekly, Story · Card Quests và Permanent.
- Danh sách bên trái có tiêu đề, thời gian còn lại, nút ghim, thanh tiến độ và số hoàn thành/mục tiêu.
- Bên phải có mô tả, phần trăm hoàn thành, phần thưởng và nút nhận.
- Story tích hợp các Card Quest hiện có; chỉ hiện ảnh và yêu cầu, không lộ HP, ATK hoặc nội tại của thẻ bí ẩn.
- Permanent truy cập các achievement hiện hành và nhận phần thưởng vĩnh viễn.
- Tông nền tối, viền cyan, thanh tiến độ phát sáng. Mobile chuyển thành các vùng cuộn để truy cập đầy đủ danh sách và chi tiết.
- Buff Luck/Drop từ quest hiển thị thời gian còn lại ngay trong cửa sổ Quest.

Reset Daily tại các mốc Game Time 86.400 giây: 24h, 48h, 72h...
Reset Weekly tại các mốc Game Time 604.800 giây: 7 ngày, 14 ngày...
Đây là mốc của đồng hồ game, không phải nửa đêm theo múi giờ. Game Time vẫn chạy 1:1 với thời gian thực và tính cả khoảng thời gian rời game theo cơ chế hiện có. Khi bỏ qua nhiều chu kỳ, chỉ tạo bộ quest của chu kỳ hiện tại, không phát thưởng cho các chu kỳ đã trôi qua.

Mỗi nhóm có đúng 3 quest, lấy ngẫu nhiên không trùng từ 7 lựa chọn. Bộ đã chọn và tiến độ được lưu. Reload không reroll. Khi reset, quest chưa nhận thưởng của chu kỳ cũ hết hiệu lực; buff đã nhận vẫn chạy đến thời điểm hết hạn riêng.

Các mục tiêu phụ thuộc tài khoản được chốt lúc bộ quest được tạo:
- Daily Roll: max(1, round(0,10 x tổng roll hiện có)).
- Weekly Roll: max(1, round(1,00 x tổng roll hiện có)).
- Daily Time Trial: max(1, round(0,70 x phòng cao nhất)).
- Weekly Time Trial: max(1, round(1,15 x phòng cao nhất)).
- Không thay mục tiêu giữa chu kỳ khi người chơi roll thêm hoặc phá kỷ lục.
- Theo xác nhận, Time Trial chỉ tính thắng đúng phòng mục tiêu 5 lần qua các lượt chạy; thắng phòng cao hơn không cộng vào quest này; không tính EXP Time Trial vào quest vượt phòng.

2. DAILY QUEST — CHỌN 3 TRONG 7

1) Hạ 200 địch ở các chế độ thực: +1 Luck trong 4 giờ.
2) Thắng phòng Time Trial đạt mục tiêu Daily 5 lần: một thời tiết Common/Uncommon ngẫu nhiên trong 4 giờ.
3) Thắng 25 Raid ở difficulty > 10: cộng thêm 50% số VNĐ hiện có khi nhận, tổng VNĐ trở thành x1.5.
4) Thắng 5 Boss Event ở difficulty > 5: +0.10 Drop Multiplier trong 4 giờ.
5) Roll đủ mục tiêu Daily: +1 Luck trong 4 giờ.
6) Thắng 50 trận 1v1 thường: cộng thêm 50% VNĐ hiện có khi nhận.
7) Gặp 3 thời tiết Rare khác nhau trong chu kỳ: một thời tiết Uncommon/Rare ngẫu nhiên trong 3 giờ.

Daily #7 chỉ tính mỗi loại Rare một lần trong chu kỳ. Nhiều lần gặp cùng Shadow không thay thế cho 3 loại khác nhau.

3. WEEKLY QUEST — CHỌN 3 TRONG 7

1) Hạ 10.000 địch: +1 Luck trong 48 giờ.
2) Thắng phòng Time Trial đạt mục tiêu Weekly 5 lần: một thời tiết Uncommon/Rare ngẫu nhiên trong 48 giờ.
3) Thắng 500 Raid ở difficulty > 250: cộng thêm 500% VNĐ hiện có khi nhận.
4) Thắng 500 Boss Event ở difficulty > 50: +0.25 Drop Multiplier trong 48 giờ.
5) Roll đủ mục tiêu Weekly: +1 Luck trong 48 giờ.
6) Thắng 500 trận 1v1 thường: cộng thêm 500% VNĐ hiện có khi nhận.
7) Gặp tổng cộng 36 lần thời tiết Uncommon/Rare: một thời tiết Rare ngẫu nhiên trong 36 giờ.

Theo xác nhận: “+500%” nghĩa là cộng thêm x5 số dư, tổng sau nhận là x6, không phải tổng x5. Ví dụ đang có 1.000 VNĐ thì nhận Weekly tiền sẽ thành 6.000 VNĐ. Sau đó nhận Daily +50% sẽ thành 9.000 VNĐ. Không nhân phần thưởng tiền này với Rich Potion hoặc các hệ số thu nhập khác.

Theo xác nhận: quest 1v1 dùng chế độ 1v1 thường có sẵn, không tạo một hệ thống PvP trực tuyến mới.

Weekly #7 cộng từng lần thời tiết xuất hiện từ bộ lập lịch, được tính lặp cùng loại ở các lần xuất hiện khác nhau. Chỉ đọc lại HUD, reload hoặc cập nhật countdown không tạo lượt gặp mới. Thời tiết nhận từ phần thưởng quest không tự tạo thêm tiến độ gặp thời tiết.

Chọn thời tiết thưởng ngẫu nhiên đều giữa các loại thuộc các tier được phép. Nếu loại đó đang hoạt động, kéo thời điểm hết hạn lên ít nhất bằng thời hạn thưởng, không làm ngắn timer đang dài hơn.

Luck quest là cộng vào hệ số Luck trước hệ số potion. Các buff Luck còn hạn cộng với nhau. Bonus Drop được cộng vào hệ số Drop dùng chung; ví dụ x1.20 +0.10 = x1.30. Nó tác động lượng vật phẩm, Shards, Coin và Key thông qua hệ thống drop hiện hành, không tăng VNĐ/EXP và không tự tăng xác suất thẻ Secret.

Theo dõi chỉ từ sự kiện mới của chế độ thực. Sandbox không tăng kill, roll, thắng trận, quest hoặc achievement; không nhận thưởng quest trong Sandbox. Trận thua không được tính là thắng, surrender/aborted không tính hoàn thành. Một sự kiện gửi lặp bị chặn. Kẻ địch clone/summon không được dùng để farm kill quest. Card Quest vẫn chỉ theo dõi sau Accept và từng bước theo thứ tự.

4. CHẾ TẠO SUPER POTION

Thêm crafting.js và mục Crafting trong menu ...:
10 Lucky Potion -> 1 Super Luck Potion.
10 Rich Potion -> 1 Super Rich Potion.
10 EXP Potion -> 1 Super EXP Potion.
10 Speed Potion -> 1 Super Speed Potion.

Các ID mới:
super_luck_potion, super_rich_potion, super_exp_potion, super_speed_potion.
Lucky Potion là tên vật phẩm Luck Potion thường đang có trong game.

Thông số:
- Super Luck: Luck x1.50 trong 300 giây.
- Super Rich: VNĐ thu được x1.50 trong 300 giây.
- Super EXP: EXP thu được x1.50 trong 300 giây.
- Super Speed: tốc độ roll x1.15 trong 300 giây; cooldown chia cho 1.15.

Một Super Potion thay hệ số của potion thường cùng loại, không nhân hai hệ số với nhau. Khi dùng Super, thời gian còn lại của potion thường được chuyển sang trạng thái PAUSED. Super hết hạn thì potion thường tiếp tục từ phần thời gian còn lại đó. Dùng thêm potion thường khi Super đang chạy sẽ cộng thời lượng vào phần đang pause; không kích hoạt hai buff cùng loại đồng thời.

Dùng thêm Super cùng loại chỉ nối dài thời lượng 300 giây/lọ, không cộng thêm % hiệu ứng. Các loại khác nhau được dùng cùng nhau. Potion thường đã hết hạn không được hồi sinh thêm thời gian.

Timer được lưu bằng mốc hết hạn thực, kèm số mili giây thường đang pause. Nếu Super hết trong lúc offline, potion thường tiếp tục ngay từ thời điểm Super hết hạn, không đợi đến lúc mở game mới bắt đầu chạy. Ví dụ thường còn 540 giây, Super hết ở t=360 giây thì thường hết ở t=900 giây, dù người chơi đang offline.

Giao dịch chế tạo trừ 10 và cấp 1 trong một lần lưu Inventory; lỗi lưu trả lại nguyên liệu và số lượng. Dùng potion cũng hoàn tác khi không lưu được. Super Potion không được thêm vào pool rơi potion thường. Speed Battle Potion không tham gia công thức chế tạo này.

Inventory nâng dữ liệu lên version 3, đọc được bản cũ. Save .acrsave gồm trạng thái pause, Super, quest luân phiên, buff quest, ghim và cài đặt SFX. Giữ kiểm tra toàn vẹn và cooldown chuyển save 7 ngày hiện có.

5. BA THẺ TOWER MỚI

Theo cơ chế Champion đang dùng: hoàn thành milestone lần đầu cấp một bản Normal và mở pool roll của thẻ trong thời tiết tương ứng. Biên nhận chặn cấp trùng; save đã vượt milestone được đối chiếu để mở khóa. Mutation và double mutation từ roll dùng cơ chế hiện hành.

Xtreme Chan:
ID tower-champion-wind; Wind Tower Floor 100.
Nature; Secret; RNG 1 in 2.010.000; HP 210.000; ATK 21.000.
Nội tại The Fuuto Wind:
- Khi là đồng đội cuối cùng còn sống, một lần/trận tăng damage 50% và cộng max HP của các đồng đội đã chết vào max HP cùng HP hiện tại của mình. Dùng max HP vì HP hiện tại của đơn vị đã chết là 0.
- Khi bị tấn công, 21% cơ hội có 21% giảm damage trong lượt tấn công kế tiếp của phe địch. Không tiêu buff chỉ vì giữa hai đòn địch có một lượt của phe mình. Không cộng dồn % giảm qua nhiều lần kích hoạt.
- Mỗi đòn thứ 2 thay đòn thường bằng một trong bốn chiêu, xác suất đều:
  Heat: 50% ATK; Burn 2 lượt, 30% ATK mỗi lượt.
  Cyclone: 100% ATK lên tối đa 2 địch.
  Lunar: 110% ATK và stun 1 lượt.
  Joker: x2 damage.
- Các đòn vẫn qua engine Element, né, khiên và phòng thủ; không cộng thêm một đòn thường ngoài chiêu thay thế.

Star Plantinum Requiem:
ID tower-champion-bizare; Bizare Tower Floor 100.
Electric; Secret; RNG 1 in 3.000.000; HP 200.000; ATK 33.000.
Nội tại SPR:
- Mỗi đòn có 33% cơ hội follow-up với damage của đòn thường; follow-up tiếp tục có thể nối chuỗi, không đặt trần số đòn.
- Tự giải các debuff ngăn tấn công như stun, freeze, snail/hypnosis và chuẩn bị stun nguồn gây hiệu ứng ở lượt địch kế tiếp. Cooldown 2 lượt của phe sở hữu thẻ.
- 33% cơ hội sống sót đòn chí tử với 1 HP; chỉ một lần thành công trong trận. Đây là sống sót, không tạo một bản hồi sinh mới.

Shadow The World Requiem:
ID tower-champion-shadow-200; Shadow Tower Floor 200.
Dark; Secret; RNG 1 in 12.000.000; HP 600.000; ATK 120.000.
Nội tại STWR:
- Mỗi đòn có 12% cơ hội giữ lượt cho phe mình, bỏ lượt địch sắp tới để đánh thêm.
- Mỗi kill tăng vĩnh viễn trong trận +12% HP và +12% ATK, áp dụng nối tiếp lên thông số hiện tại.
- Giải stun, freeze và hiệu ứng vô hiệu hóa; gây Bleed lên nguồn gây hiệu ứng trong 3 lượt, 30% ATK mỗi lượt. Cooldown 3 lượt của phe sở hữu thẻ.
- Khi hỗ trợ và một đồng đội khác tấn công, 12% cơ hội cùng đánh: đồng đội gây 120% damage của đòn cơ bản, STWR gây 120% ATK. Đòn hỗ trợ không tạo vòng lặp gọi hỗ trợ lẫn nhau và không tăng bộ đếm đòn chính của STWR.
- Không thể clone hoặc hồi sinh bằng bất kỳ nguồn nào. Khi chết, stun mọi địch còn sống 5 lượt.

Thêm requiem.js cho trạng thái và các hook nội tại mới, riêng cho từng runtime chiến đấu. Bộ đếm vẫn gắn với người tấn công và không reset khi đổi mục tiêu. Hướng dẫn Tower được bổ sung milestone Floor 200 ở Shadow bên cạnh Champion Floor 100.

6. TIME TRIAL

Cả Normal Time Trial và EXP Time Trial dùng đúng 1.000 ms mỗi lượt. Speed Battle Potion tiếp tục không làm thay đổi tốc độ Time Trial.

EXP Time Trial: mỗi EXP Monster bị hạ cho tỷ lệ cơ bản ngẫu nhiên từ 0,5% đến 3,0% yêu cầu EXP của Level hiện tại:
rate = 0,005 + 0,025 x random(0..1).
EXP = floor(EXP_cần_cho_Level_hiện_tại x rate x buff_EXP + phần_lẻ_cũ).
Phần lẻ tiếp tục được giữ để không mất EXP do làm tròn. Achievement, thời tiết và potion EXP áp dụng đúng nhóm thưởng EXP; Super EXP thay potion EXP thường như quy tắc trên. Mức 0,5%–3,0% là trước buff.

Giữ vé 1 lần/attempt, giới hạn 300 giây, quái HP 10% max HP người chơi và ATK 0. Lv.1000 không nhận thêm EXP. Normal Time Trial vẫn 180 giây/phòng, rơi Shards và không tự thêm VNĐ/EXP. Không đổi reset Room 1 khi thua hoặc hết giờ.

7. ÂM THANH THẺ ĐẶC BIỆT

Thêm drop_audio.js. Chỉ 9 thẻ sau được phát MP3 tùy chỉnh khi roll/rơi/mở khóa thẻ:
Alucard: assets/audio/alucard.mp3
Lucius Zogratis: assets/audio/luciuszogratis.mp3
Aizen Beyond: assets/audio/aizenbeyond.mp3
Equinox: assets/audio/equinox.mp3
Shadow The World Requiem: assets/audio/stwr.mp3
Madara Lubu: assets/audio/madaralubu.mp3
Wonder Of You: assets/audio/wou.mp3
Akaza: assets/audio/akaza.mp3
Adult Gon: assets/audio/adultgon.mp3

Có công tắc SFX ON/OFF trong menu ..., lưu riêng với Music ON/OFF. SFX tắt thì không phát âm thanh thẻ, kể cả đã có yêu cầu chờ.

Trước SFX: pause musictheme.mp4 ngay. Trong lúc SFX chạy, các thao tác người dùng hoặc quay lại tab không tự bật nhạc chồng lên. Khi SFX kết thúc, không tải được, bị hủy hoặc người chơi đóng cửa sổ thẻ/trận, nhạc nền được tiếp tục và tăng volume dần trong 400 ms nếu Music vẫn ON.

Chỉ giữ một SFX đang phát; SFX mới dừng SFX cũ. Cache tối đa 9 Audio object và không preload âm thanh cho mọi lượt roll. Nếu chưa có tương tác để trình duyệt cho phép phát, chỉ giữ yêu cầu gần nhất chờ thao tác người dùng. Sandbox không phát SFX thẻ. Khi tệp âm thanh thiếu hoặc bị chặn, game tiếp tục hoạt động.

8. HIỆU NĂNG, KIỂM TRA VÀ TRIỂN KHAI

Quest gameplay xử lý dữ liệu nhỏ trong bộ nhớ, gộp ghi tiến độ trong 250 ms và flush trước export/pagehide. Timer giao diện theo nhịp 1 giây hiện có; không tạo một vòng animation mới. Sự kiện chọn tab, ghim và nhận thưởng dùng listener dùng chung. Giao diện Quest đóng thì không dựng lại danh sách theo roll. Giữ các tối ưu Hide Rolling Card và cache biến thể đang có.

Đã kiểm tra cú pháp toàn bộ JS; khởi động HTTP tại đường dẫn con, đủ 138 thẻ đăng ký nội tại, Quest desktop/mobile không tràn ngang; nhận quest, crafting; công thức tiền Daily/Weekly; save vòng encrypt/decrypt và từ chối payload sửa; mốc mở Champion; pause/resume potion qua reload và thời gian offline; các nhánh nội tại mới và quy tắc âm thanh pause/hold/resume. Đối chiếu cùng seed cho 135 thẻ cũ giữ kết quả và số lần gọi RNG. Đã chạy 137 trường hợp sao chép nội tại và kiểm tra trận Sandbox với thẻ mới không thay đổi bất kỳ kho localStorage tiến trình nào. Tệp âm thanh/ảnh thực tế do người dùng bổ sung, kiểm tra luồng Audio bằng mock khi chưa có asset.

Gói mã nguồn gồm 30 tệp:
index.html, styles.css, passives.css, app.js, cards.js,
passives.js, requiem.js, yuno.js, grimoire.js, levels.js,
inventory.js, crafting.js, quests.js, quest.js, achievements.js,
tower.js, timetrial.js, raid.js, boss_event.js, evolution.js,
weathers.js, mutations.js, elements.js, background.js, drop_audio.js,
roll_view.js, roll_performance.js, sandbox.js, startup.js, README.txt.

Tự bổ sung các ảnh mới, đúng chữ hoa/thường:
assets/cards/xtremechan.png
assets/cards/spr.png
assets/cards/stwr.png

Tự bổ sung 9 MP3 theo danh sách phía trên. musictheme.mp4 vẫn ở thư mục gốc. Không tạo hoặc đóng gói asset nhị phân trong bản cập nhật này.

Upload đồng bộ toàn bộ 30 tệp, giữ các asset cũ và thêm asset mới. Các script defer được xếp đúng thứ tự; requiem.js nằm trước passives.js, quests.js sau quest.js và trước app.js. JS/CSS dùng cache version 20261017-quests-1. Sau triển khai, nhấn Ctrl+F5 nếu trình duyệt còn cache bản trước.

Không kèm Excel, script kiểm thử, log hoặc tệp trung gian trong gói bàn giao.
