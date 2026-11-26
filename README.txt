ANIME CARD RNG — BALL VS BALL & TACTICAL ROLES
Update 34.0 — 26/11/2026

1. CHẾ ĐỘ MỚI: BALL VS BALL
- Vào nút Ball vs Ball trên thanh điều hướng chính. Đây là đấu trường
  vật lý độc lập với Arena thường và Auto Chess. Không thay đổi cách
  roll một thẻ/lần của game chính.
- 1v1 Duel: chọn một thẻ đấu với đối thủ AI có sức mạnh thích ứng.
  4v4 Squad Brawl: dùng bốn thẻ trong đội và đánh với đội AI bốn thẻ.
  Boss Arena và Ranked Balls hiện là ô Coming Soon; hệ thống đăng ký
  chế độ cho phép mở rộng thêm các loại trận sau này.
- Hệ thống sử dụng chính thẻ đang sở hữu: level, biến thể Mutation, số
  bản sao, skin đang mặc và Relic gắn với bản sao đó. Không tự cấp thẻ,
  không mượn thẻ chưa sở hữu và không thay đổi Relic của đội gốc.
- Chọn một ô đội hình để mở Ball Index. Chọn bản sao cụ thể rồi bấm
  Assign to Slot. Không thể triển khai cùng một bản sao ở hai vị trí.
  Đội hình và tùy chọn tốc độ được nhớ trên thiết bị.
- Nút 1x/2x đổi tốc độ mô phỏng. Speed Battle Potion đang hoạt động
  sẽ dùng 2x. Auto-Continue tự bắt đầu trận mới sau màn kết quả.
  Leave Match yêu cầu xác nhận nếu trận vẫn đang diễn ra; thoát giữa
  trận không nhận thưởng. Auto-Continue dừng nếu lưu thưởng gặp lỗi.
- Đấu trường dừng mô phỏng khi tab ở nền và tiếp tục khi quay lại.
  Trận kết thúc khi một đội bị loại hết. Sau 120 giây mô phỏng, đội có
  tỷ lệ tổng HP còn lại cao hơn thắng; bằng nhau là hòa.

2. GIAO DIỆN RETRO PIXEL VÀ FONT ROBLOX PIXEL
- Toàn bộ màn hình Ball vs Ball, bao gồm nút điều hướng, Lobby, Ball
  Index, bảng đội, tooltip, Battle Log và chữ nổi trên Canvas, sử dụng
  font family "Roblox Pixel". Khung pixel có viền nhiều lớp, nền lưới,
  tông tối cùng điểm nhấn vàng/cyan; giao diện không dùng tài nguyên
  hình ảnh mới bắt buộc ngoài font tùy chọn.
- Để hiển thị đúng kiểu chữ, tự đặt file font hợp lệ vào thư mục game:
      assets/fonts/RobloxPixel.ttf
  hoặc:
      assets/fonts/RobloxPixel.otf
      assets/fonts/RobloxPixel.woff2
  Trình duyệt thử các nguồn theo thứ tự TTF, OTF, WOFF2. Tên và chữ hoa
  phải khớp hoàn toàn, nhất là khi chạy trên GitHub Pages.
  Tài liệu pixelfont.pdf là mẫu xem trước; trình duyệt cần file font
  thực tế. Không đổi tên PDF thành .ttf. Nếu chưa có font, chế độ vẫn
  chạy với font monospace dự phòng. Patch không chứa thư mục assets.
- Trên máy tính, màn chiến đấu có ba cột: Player Team + Player Battle
  Log, sân giữa hình vuông 1:1, Enemy Team + Enemy Battle Log. Hai
  danh sách và hai log có vùng cuộn riêng. Trên điện thoại, sân vuông
  được đưa lên trước, hai bảng đội nằm phía dưới và vẫn cuộn riêng.
- Mỗi orb dùng ảnh thẻ/skin, viền theo Rarity hoặc màu Mutation; hai
  Mutation phối màu chung trên viền. Có thanh HP, tỷ lệ HP, thanh
  Energy, chỉ báo Shield và chữ nổi sát thương/hồi máu/năng lượng.
  Bảng đội hiển thị số HP hiện tại/tối đa, % HP, Energy 0–100, Shield.
- Log phân luồng theo đội tạo hành động, có màu và điểm nhấn cho skill,
  passive, Energy, Crit, Heal, Shield, Burn, Bleed, Poison và khống chế.

3. VẬT LÝ, ENERGY VÀ HIỆU ỨNG THEO THỜI GIAN THỰC
- Vật lý tiến theo bước cố định 1/60 giây. Các orb va chạm đàn hồi
  với tường và nhau, tách điểm chồng lấn, phản xạ và đổi hướng theo
  xung lực. Chỉ va chạm với đối phương mới tạo đòn đánh thường.
  Không gây đòn đánh mới ở mọi frame khi hai orb vẫn còn chạm nhau.
  Có điều chỉnh hướng nhẹ sau thời gian dài không gặp đối thủ.
- Đòn va chạm sử dụng bộ xử lý passive, Relic, crit, dodge, shield,
  đòn đánh theo sau, hồi sinh, sao chép và sát thương hiện có. Mô
  phỏng dùng bộ chiến đấu riêng, không ghi trực tiếp vào kho thẻ.
- Mỗi lần phản xạ ở tường cho 20 Energy và tia pixel. Khi đầy 100,
  thanh tiêu hao để thi triển Energy Trigger; các nguồn bonus Energy
  chuyên biệt có thể được bổ sung qua cùng bộ xử lý. Stack của passive
  (ví dụ Alien Watch) vẫn là tài nguyên riêng, không bị đổi thành Energy.
  Energy Trigger được xác định từ vai trò và loại đòn của thẻ:
    Piercing Pulse: 100% ATK, theo đường thẳng hướng đánh.
    Arcane Blast: 80% ATK, quanh người thi triển.
    Crescent Strike: 100% ATK, theo hình quạt phía trước.
    Guardian Pulse: hồi HP và cấp Shield, mỗi hiệu ứng bằng 50% ATK,
      lên đồng minh còn sống có tỷ lệ HP thấp nhất (kể cả bản thân).
  Đây là các đòn Energy riêng; passive gốc vẫn có điều kiện kích hoạt
  riêng. Nếu không có mục tiêu trong hitbox, đòn diện rộng có thể hụt.
- Mốc lượt cơ sở dùng chung với Auto Chess: 1 lượt = 1,35 giây mô
  phỏng. Ball có đồng hồ riêng cho từng orb: hiệu ứng không bị kéo dài
  chỉ vì chưa va chạm hoặc không có đòn đánh. Ở 1x: 1,35 giây/lượt;
  ở 2x/Speed Battle Potion: 0,675 giây thực/lượt. Tốc độ đánh riêng
  của passive vẫn ảnh hưởng khoảng cách giữa các đòn va chạm.
- Burn, Bleed, Poison, Black Flame, Stun, Freeze, Fear, Hindred,
  Hypnosis, Shield và các thay đổi chỉ số dùng dữ liệu của bộ chiến
  đấu hiện có. Tooltip hiện số lượt, số giây còn lại, số stack, sát
  thương mỗi lượt, nguồn hiệu ứng và cơ chế khiên/hồi máu. Ví dụ,
  Bleed chặn hồi máu từ mọi nguồn. Alien Watch hết buff HP sau ba
  lượt riêng của orb, giữ nguyên cơ chế số thập phân cho stack.
- Màu Poison xanh độc, Bleed đỏ, Burn cam, Black Flame đen tro,
  Fear tím đậm, Hindred xám sáng, Hypnosis hồng tím. Tooltip bám
  theo orb và khóa hiệu ứng, cập nhật tại chỗ. Rê chuột sang tooltip
  hoặc chạm để ghim; Esc/chạm ngoài để đóng.
- Passive khi vào trận chỉ kích hoạt ở va chạm đầu tiên của orb với
  đối phương. Ví dụ Gumball bắt đầu sao chép ở thời điểm va chạm,
  Mordecai & Rigby chọn mode khi vào giao tranh; Pochita/Reagan Ridley
  không tự hy sinh trước khi di chuyển. Reagan Ridley giữ cơ chế
  Mad Scientist đúng thẻ gốc: tự hy sinh và cấp Robot Armor cho đồng
  minh; AI của Robot và blast của Robot Armor dùng hitbox tròn.
  Các lần kích hoạt sau đó như đổi mode, hồi sinh và sao chép vẫn
  thực hiện theo quy tắc native. Giới hạn chuỗi đòn tránh vòng lặp dài.

4. HITBOX AOE DÙNG CHUNG VỚI AUTO CHESS
- Cùng một phép tính hình học được dùng để xác định địch trúng đòn
  và vẽ vùng hiệu ứng; không chỉ trang trí một vòng tròn giả.
    Pierce: đường thẳng có độ rộng và tầm xa. Ví dụ Stretchy Pierce
    (Jake), Thunderclap (Zenitsu), đòn xuyên của Krixi.
    Blast: hướng tâm, có bán kính thật. Ví dụ Explosion của Bakugo,
    Magical Ball của Ender Dragon, Fishbones của Jinx, AI Robot.
    Strike: hình quạt trước người đánh. Finn dùng sát thương và hiệu
    ứng của kiếm đang chọn lên các mục tiêu trong quạt. Yasuo dùng
    Steel Tempest/Last Breath, sát thương mục tiêu phụ tương ứng
    75%/100% ATK. Yone dùng vùng quạt khi Soul Unbound đang hoạt động.
- Tôn trọng số mục tiêu tối đa của skill nếu thẻ có giới hạn; các mục
  tiêu đứng ngoài đường/tròn/quạt không nhận phần sát thương AoE.
  Các chế độ Arena/Portal/Raid cũ vẫn giữ cách nhắm mục tiêu nguyên bản.
- Trong Auto Chess, vùng hitbox được vẽ trên lưới, có xử lý đổi góc
  nhìn khi sang sân đối thủ. Cả luồng tính nội bộ và combat worker
  đều dùng cùng quy tắc; không thay đổi dữ liệu đội hình gốc.

5. BALL INDEX VÀ TOOLTIP ENERGY
- Ball Index liệt kê biến thể thẻ đang sở hữu, có tìm kiếm theo tên,
  passive/category/element, lọc Rarity và Mutation, phân trang danh
  sách và chọn bản sao. Xem ảnh, HP/ATK sau level/mutation, nguồn
  nhận, Relic đang gắn, passive đầy đủ và số lượng thẻ.
- Mục ENERGY TRIGGER (100 ENERGY) mô tả đúng đòn Energy của thẻ.
  Mục BALL ARENA MECHANICS giải thích va chạm, phản xạ tường, dạng
  AoE, cách định thời và các ví dụ xử lý riêng của passive.
- Tooltip ngắn, Inspection trong Shop/Board/Bench/Combat của Auto
  Chess thêm vai trò và Energy Trigger. Thanh xanh biểu thị Energy
  thật; stack riêng của Hextech, Hakka, Vista, Sage được giữ trong
  thông tin thanh, không ghi đè giá trị Energy.
- Auto Chess nhận Energy gốc +12 khi tấn công, +3 khi nhận đòn, cộng
  bonus trait hiện có. Khi đủ 100, dùng Energy Trigger tương ứng.
  Trait Magician có Mana Nova và DragonWarrior có Ki Burst bổ sung
  theo tier; mô tả của các synergy đã khớp với hitbox mới.

6. AUTO CHESS — BA VAI TRÒ CHIẾN ĐẤU
- Melee: áp sát địch gần nhất, giao tranh ở hàng trước.
- Ranged: giữ tầm đánh của thẻ, dịch chuyển khi ngoài tầm.
- Support: chơi gần đồng đội, bảo vệ/hồi máu/cấp khiên theo passive
  gốc và Guardian Pulse. Khi Melee địch tiến gần, tìm ô trống lùi
  ra hoặc lệch sang bên làm tăng khoảng cách với kẻ địch nhưng
  không rời xa đội hình. Có khoảng nghỉ giữa các lần lùi, để Support
  vẫn có cơ hội đánh và không chạy vô hạn. Không chạy nếu là người
  sống cuối cùng hoặc không có ô lui an toàn.
- Tôn trọng ngoại lệ như Jake được triển khai hàng trước cạnh Finn
  hàng trước (giữ vai trò bảo vệ) và Reagan dùng vai trò áp sát.
  Không cấp thêm vàng, reroll, chỉ số ẩn hay sửa luật kinh tế trận.
- UI Auto Chess hiện vai trò Melee/Ranged/Support, hitbox hiệu ứng
  và mục Energy. Các nút và tính năng cũ của Auto Chess được giữ.

7. PHẦN THƯỞNG VÀ LƯU DỮ LIỆU
- Thắng 1v1/4v4 Ball nhận phần thưởng Arena tương ứng theo công thức
  hiện có: VNĐ, EXP theo thẻ, drop bonus, potion/key và tiến độ
  phù hợp. Dùng lại bộ phân phối phần thưởng Arena; không có bảng
  tiền/EXP trùng lập riêng.
- Cộng thêm 0, 1, 2, 3, 4 hoặc 5 Gems bằng một lần roll đồng xác suất
  (Math.floor(Math.random()*6)). Gem không nhân luck, drop, passive
  reward hoặc các multiplier của game chính. Thua/hòa/thoát trận
  không nhận thưởng Gem. Màn kết quả ghi rõ số tiền, EXP và Gem.
- Chỉ xử lý thưởng khi trận đã kết thúc. Biên nhận Gem lưu cùng kho
  vật phẩm để không trả lặp khi màn kết quả được cập nhật. Dùng hệ
  thống lưu tài khoản/đồng bộ cloud hiện có; thay đổi được đánh dấu
  chờ đồng bộ và tiếp tục đồng bộ khi thoát chế độ. Không cần tạo
  collection Firestore mới hoặc thay đổi rules.
- Update Logs thêm Update 34.0, mô tả cho người chơi và nút Jump In
  dẫn thẳng tới Ball vs Ball. Kho Gem cũng bổ sung nguồn nhận mới.

8. DANH SÁCH FILE TRONG PATCH
  File mới:
    ball_arena.js, ball_combat.js, ball_view.js, ball_index.js,
    ball_arena.css, spatial_combat.js
  File cập nhật:
    app.js, index.html, materials.js, update_logs.js,
    battle_log_view.js, autochess.css, autochess_bots.js,
    autochess_combat.js, autochess_synergies.js, autochess_view.js,
    passives.js, turn_phase.js, content_passives.js,
    hextech_passives.js, relic_combat.js, reagan.js,
    tensura_passives.js, dragon_skills.js, fate.js, gomen.js,
    requiem.js, shibuya.js, spooky_passives.js
  Tài liệu: README.txt.
  Các file passive liên quan đi kèm vì Ball cần dùng đúng runtime,
  điều kiện kích hoạt, hitbox và giới hạn chuỗi của từng hiệu ứng.
  Không có file assets, ảnh, font, PDF, âm thanh hoặc file test
  trong patch. Không thêm tên file mp3 mới.

9. CÀI ĐẶT
- Sao lưu thư mục game hiện tại và dữ liệu lưu nếu cần.
- Giải nén patch vào đúng thư mục chứa index.html của bản Update 33.
  Chọn ghi đè các file cùng tên; thêm các file mới vào thư mục gốc.
  Giữ nguyên tất cả các file khác và thư mục assets hiện có.
- Nếu muốn đúng font Roblox Pixel, thêm một file font như mục 2.
  Không cần tạo thêm ảnh, nhạc hoặc chỉnh cấu hình máy chủ.
- Nếu dùng hosting, tải lên đầy đủ các file trong patch cùng lúc.
  Tất cả thiết bị tải lại Ctrl + F5 (hoặc xóa cache trang trên mobile)
  để nhận cùng phiên bản mã chiến đấu và combat worker.
- Vào Summon như bình thường hoặc chọn Ball vs Ball, thử 1v1 và 4v4,
  xem Ball Index, bật/tắt 2x và thử Auto-Continue. Kiểm tra Gem trong
  Storage/Hextech sau khi thắng. Tài khoản đăng nhập Cloud tiếp tục
  sử dụng luồng đồng bộ cũ.

10. KIỂM TRA
- Kiểm tra cú pháp toàn bộ JavaScript, khởi động game và Lobby.
- Kiểm tra chọn bản sao, tìm kiếm/inspect Ball Index, trận 4v4,
  chuyển tốc độ, xác nhận thoát và khung sân 1:1 ở desktop/mobile.
- Chạy lượt đấu mẫu cho toàn bộ 247 thẻ trong index, gồm các thẻ
  Cartoon, Hextech, Reagan và passive sao chép/hồi sinh; kiểm tra
  deferred entry, wall Energy, các vùng AoE, các lượt DoT và Bleed
  chặn hồi máu. Không phát sinh lỗi JavaScript trong các lượt mẫu.
- Kiểm tra phần thưởng VNĐ/EXP/Gem, biên nhận và tránh trả lặp.
  Kiểm tra Support lùi khỏi Melee rồi vẫn thực hiện tấn công.
  So sánh kết quả Auto Chess nội bộ và worker trên cùng seed, nhận
  đủ ba loại hitbox. Kiểm tra lại Battle Log Arena cũ trên desktop
  và mobile.
- Các phép kiểm tra chạy trong môi trường game cục bộ; tốc độ hiển
  thị phụ thuộc thiết bị và font thật cần do người dùng cung cấp.
  Không xác nhận đồng bộ với tài khoản Firestore thật trong phép
  kiểm tra cục bộ này.
