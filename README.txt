NHẬT KÝ CẬP NHẬT — SETTINGS, CRAFTING VÀ REAGAN RIDLEY
Phiên bản: 20261018-reagan-1

Tài liệu chỉ ghi các thay đổi trong bản cập nhật này.

1. ÂM THANH TRONG GAME SETTINGS

Chuyển hai nút Music và SFX từ menu tiện ích trên màn hình chính vào Game Settings. Không tạo bản sao của nút hoặc gắn nhiều listener cho cùng thao tác. Tùy chọn Show Active Potions HUD vẫn nằm trong Settings và giữ nguyên chức năng.

Thêm thanh âm lượng và ô nhập số riêng cho Music/SFX: 0%–100%, bước 1%. Hai ô của mỗi loại đồng bộ với nhau; thay đổi áp dụng ngay cả khi âm thanh đang phát. Giá trị ngoài khoảng được giới hạn về 0%–100%; ô trống không bị lưu thành mức âm lượng sai. Mặc định Music 35%, SFX 80% khi save chưa có tùy chọn mới.

Lưu các tùy chọn bằng các khóa hiện có và hai khóa âm lượng mới:
- anime_card_rng_music_muted: bật/tắt Music, giữ tương thích save cũ.
- anime_card_rng_sfx_enabled: bật/tắt SFX, giữ tương thích save cũ.
- anime_card_rng_music_volume: số từ 0 đến 1.
- anime_card_rng_sfx_volume: số từ 0 đến 1.

Cả bốn tùy chọn được đưa vào bản xuất .acrsave. Khi import, công tắc phải là boolean và âm lượng phải là số hữu hạn trong khoảng 0–1. Reload giữ lựa chọn đã lưu. Không thay định dạng bảo vệ save, checksum hoặc cooldown xuất/nhập độc lập 7 ngày.

Giữ cơ chế phát sau tương tác đầu tiên và danh sách chín thẻ có SFX riêng. Khi phát SFX đặc biệt, Music tạm dừng; khi SFX kết thúc hoặc modal đóng, Music tiếp tục với fade 400 ms về đúng âm lượng người chơi đã chọn. Không trở về mức cố định 35% sau SFX. Tắt SFX dừng hiệu ứng hiện tại và trả lại Music theo tùy chọn Music.

settings.js chỉ điều phối giao diện; background.js và drop_audio.js tiếp tục quản lý phát âm thanh, trạng thái và lưu tùy chọn. Không thêm interval để cập nhật Settings. Modal có vùng cuộn và bố cục phù hợp màn hình nhỏ.

2. CRAFTING CHỈ HIỆN CÔNG THỨC HỢP LỆ

Danh sách Crafting lấy đầu ra từ các công thức đã đăng ký và chỉ nhận công thức có item đầu ra/nguyên liệu hợp lệ. Không ghép thêm danh sách vật liệu từ Evolution Shop vào grid.

Các item chỉ mua tại shop, gồm Spirit Crown, Sea Valkyrie, Web String và Cannon Ball, không còn xuất hiện như item có thể craft. Chúng vẫn tồn tại trong Storage, shop và Evolution theo nguồn/giá cũ. Việc một nguyên liệu potion thường được bán ở shop không làm mất công thức dùng nguyên liệu đó.

Bốn công thức hiện có:
10 Lucky Potion -> 1 Super Luck Potion.
10 Rich Potion -> 1 Super Rich Potion.
10 EXP Potion -> 1 Super EXP Potion.
10 Speed Potion -> 1 Super Speed Potion.

Giữ Search, Owned, Required Items, Craft 1x, phí 0 VNĐ và giao dịch nguyên tử trong inventory.js. Chọn công thức vẫn hiển thị số nguyên liệu đang có/số cần. Related Card trống đối với consumable. Không tự tạo công thức hoặc nguyên liệu mới cho vật liệu mua từ shop.

3. REAGAN RIDLEY — NORMAL TOWER TẦNG 200

ID: tower-champion-normal-200.
Tên: Reagan Ridley.
Rarity: Secret.
Element: Electric, cùng hệ với Champion Normal Tower hiện có.
HP Level 1: 200.000.
ATK Level 1: 16.900.
RNG: 1 trong 1.692.007.
Artwork tham chiếu: assets/cards/reaganridley.png.

Tích hợp vào cơ chế Champion đang có bằng towerType normal, towerFloor 200 và unlockRequirement tower_floor_200_normal. Vượt tầng 200 mở khóa và cấp một bản Normal; sau đó thẻ vào pool roll với RNG trên khi thời tiết Normal đang hoạt động. Mốc đã hoàn thành ở save cũ được đối chiếu khi tải; receipt ngăn cấp lặp lại. Hint của Normal Tower và danh sách achievement tự đọc thông tin thẻ mới từ cards.js.

Mad Scientist — hỗ trợ và robot:
- “Vào trận” để hiến tế được hiểu là lên tuyến đầu, không phải lúc bắt đầu trận khi Reagan còn ở hàng sau.
- Khi còn sống và không phải đơn vị đang hành động, đếm lượt của phe Reagan. Mỗi 3 lượt phe mình tạo một robot ở tuyến đầu. Lượt của phe đối phương không tăng bộ đếm này.
- Robot xuất hiện sau khi hành động hiện tại kết thúc, để không làm mất lượt của đồng đội đang đánh. Robot trở thành mục tiêu tuyến đầu và sẵn sàng hành động ở lượt tiếp theo của phe mình.
- HP robot = floor(10% max HP hiện tại của Reagan), tối thiểu 1.
- ATK robot = floor(10% ATK hiện tại của Reagan sau buff/debuff), tối thiểu 1.
- Không nhân lại Level hoặc Mutation lần thứ hai. Robot dùng Element của Reagan và giữ thông tin Mutation để hiển thị.
- Tối đa 10 robot đang sống mỗi phe. Đây là giới hạn đang hoạt động, không phải hạn ngạch triệu hồi trọn trận: khi robot chết, đợt triệu hồi hợp lệ sau có thể tạo robot thay thế.
- Robot không mang Mad Scientist và không tạo robot con. Các cơ chế clone/summon khác giữ quy tắc hiện có.

AI:
- Thay đòn đánh thường bằng một đợt đánh toàn bộ địch còn sống, mỗi mục tiêu nhận damage bằng 100% ATK robot trước khi áp dụng Element, shield và các cơ chế phòng thủ.
- Mỗi kill hồi cho robot và Reagan lượng HP bằng 10% max HP Reagan. HP không vượt max HP; không hồi sinh đơn vị đã chết; Bleed tiếp tục chặn hồi HP.
- Đòn AI dùng pipeline combat chung để tính sát thương, chí tử, hồi sinh, kill và các tương tác phòng thủ. Robot còn sống tiếp tục tham chiến hợp lệ, kể cả khi chỉ còn robot trong trận thường.

Hiến tế và Robot Armor:
- Khi lên tuyến đầu lần đầu trong trận, Reagan lập tức hiến tế thay vì đánh thường. Một đồng đội ngẫu nhiên còn sống nhận Robot Armor; nếu không còn đồng đội sống thì không có người nhận.
- Robot Armor bổ sung vào nội tại sẵn có, không thay thế nội tại gốc.
- +25% ATK; giảm 50% sát thương nhận vào khi nội tại không bị khóa.
- Mỗi 2 đòn tấn công của người nhận, đánh tối đa 2 địch ngẫu nhiên khác nhau, mỗi địch nhận 50% ATK hiện tại của người nhận. Nếu chỉ còn 1 địch thì đánh 1 mục tiêu.
- Giảm sát thương được xét trước cơ chế chí tử/hồi sinh để không kích hoạt hồi sinh sớm khi damage thực tế chưa chí tử.
- Cờ hiến tế và Robot Armor là dữ liệu runtime của trận, không lưu vào thẻ sở hữu. Không cấp lặp buff bằng việc gọi lại render hoặc kiểm tra đội hình.

reagan.js chứa toàn bộ logic kỹ năng mới; passives.js chỉ nối các hook đội hình, lượt, đánh, kill, phòng thủ và mô tả. Không thêm reward, quest hoặc thao tác lưu trong module này; Sandbox tiếp tục dùng engine riêng.

4. SỬA CLONE NARUTO X SASUKE TRONG EXP TIME TRIAL

Dãy EXP Monster được xử lý như một lượt luyện liên tục cho việc chọn Naruto/Sasuke. Thay đối tượng dummy sau mỗi kill không còn tự reroll chế độ và xóa clone vừa sinh. Các trận ngoài EXP Time Trial vẫn đổi chế độ theo địch như trước; chuyển sang Sasuke vẫn xóa clone Naruto đúng nội tại.

Nếu địch bị hạ trước khi clone đánh hỗ trợ, hành động clone được giữ trong hàng đợi runtime. Time Trial ghi thưởng cho dummy đã chết đúng một lần, tạo dummy tiếp theo rồi giải quyết lần lượt các đòn hỗ trợ đang chờ. Nếu clone hạ tiếp dummy, dummy đó cũng chỉ được tính thưởng một lần trước khi thay mới. Không thêm lượt, không tiêu thêm vé, không lưu hàng đợi vào save.

Clone giữ 10% max HP và ATK của chủ lúc sinh, tồn tại qua các lần thay dummy và có thể gây sát thương/hạ địch. Giữ Normal Time Trial 2.000 ms/lượt, EXP Time Trial 1.000 ms/lượt; Speed Battle Potion không đổi hai timer này. Card Level 1000 vẫn không nhận thêm EXP. Không thay quy tắc quest hoặc reward của các mode khác.

5. MODIFIED FILES NOTE

Danh sách đầy đủ 13 tệp được tạo, sửa hoặc refactor trong bản cập nhật này:

1) settings.js — TẠO MỚI: điều phối slider/ô nhập âm lượng trong Settings, đồng bộ giao diện với module âm thanh.
2) background.js — thêm âm lượng Music có lưu; áp dụng trực tiếp và fade về mức đã chọn sau SFX.
3) drop_audio.js — thêm âm lượng SFX có lưu và cập nhật âm lượng hiệu ứng đang phát.
4) crafting.js — chỉ dựng catalog từ công thức hợp lệ; loại vật liệu chỉ mua tại shop khỏi grid.
5) cards.js — thêm Reagan Ridley, chỉ số, Element, RNG, điều kiện Normal Tower 200 và mô tả Mad Scientist.
6) reagan.js — TẠO MỚI: robot, AI, giới hạn robot đang sống, hiến tế và Robot Armor trong runtime combat.
7) passives.js — nối hook Reagan/Armor; giữ robot trong hàng đợi chiến đấu; xử lý clone Naruto và hành động hỗ trợ chờ trong EXP Time Trial.
8) timetrial.js — nối bước ghi thưởng/thay dummy/giải quyết hành động clone; giữ timer theo mode.
9) app.js — thêm âm lượng vào export/import và validator; nối Settings và callback hỗ trợ Time Trial.
10) index.html — chuyển Music/SFX vào Settings, thêm slider/ô số, tải settings.js và reagan.js theo đúng thứ tự defer, đổi cache version.
11) styles.css — bố cục âm thanh Settings, ô số, slider và vùng cuộn responsive; giới hạn CSS công tắc cho checkbox.
12) startup.js — thêm chẩn đoán thiếu SettingsSystem hoặc createReaganSkills khi triển khai thiếu tệp.
13) README.txt — changelog hiện tại và danh sách thay đổi này.

Không cần sửa tower.js hoặc achievements.js: hai module đang lấy điều kiện/mốc thưởng Champion trực tiếp từ cards.js. Các module không nêu trong danh sách giữ nguyên nội dung và vẫn được đóng gói đầy đủ để triển khai đồng bộ.

6. KIỂM TRA VÀ BÀN GIAO

Đã kiểm tra cú pháp JavaScript, thứ tự script, tên tệp phân biệt chữ hoa/thường, DOM ID và chạy game qua HTTP ở đường dẫn con.

Đã kiểm tra Settings lưu qua reload, áp dụng âm lượng ngay, hai điều khiển đồng bộ, âm lượng 0%–100%, cấu hình trong .acrsave và từ chối giá trị sai. Luồng tạm dừng/tiếp tục Music sau SFX được kiểm tra bằng đối tượng audio giả lập; tệp nhạc/âm thanh thực tế vẫn do chủ game cung cấp.

Đã kiểm tra Crafting có đúng 4 công thức, tìm vật liệu shop không ra kết quả, tiêu 10 potion nhận 1 Super Potion. Giao diện Settings được kiểm tra trên desktop và mobile 390 px.

Đã kiểm tra Reagan ở hàng sau và tuyến đầu, robot đánh AOE, hồi HP khi kill, giới hạn 10 đang sống và tạo thay thế sau khi robot chết, không sinh robot đệ quy. Đã kiểm tra Armor +25% ATK, 50% giảm damage và đòn bổ sung mỗi 2 lần đánh; giảm damage không kích hoạt hồi sinh Aizen sớm. Đã kiểm tra mốc Normal 200 cấp đúng một bản Normal và mở pool/hint phù hợp.

Đã kiểm tra nhiều chu kỳ EXP Monster với clone còn sống, có gây damage/kill và không tính thưởng lặp; Level 1000 không gọi cấp thêm EXP. Đối chiếu cùng seed cho toàn bộ 138 thẻ cũ trong bài kiểm tra combat giữ nguyên kết quả. Sandbox chạy, thoát và không thay đổi dữ liệu lưu trong kiểm tra cách ly.

Gói đầy đủ gồm 33 tệp nguồn sản xuất, tính cả README.txt. Không kèm Excel, asset ảnh/âm thanh, script kiểm thử hoặc log. Giữ assets hiện có và tự bổ sung artwork Reagan đúng đường dẫn trên. Upload đồng bộ toàn bộ nguồn; cache version JS/CSS là 20261018-reagan-1. Sau triển khai dùng Ctrl+F5 nếu trình duyệt còn giữ cache cũ.
