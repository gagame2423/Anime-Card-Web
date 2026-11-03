BẢN CẬP NHẬT 03/11/2026 — AUDIO AN TOÀN, UNIQUE RELIC VÀ KẾ THỪA RELIC

1. SỬA LỖI AUDIO VOLUME
- Chặn mọi giá trị gán cho HTMLMediaElement.volume trong background.js và drop_audio.js về khoảng 0–1; giá trị không hữu hạn được xử lý an toàn.
- Fade nhạc xử lý cả trường hợp timestamp requestAnimationFrame nhỏ hơn thời điểm bắt đầu, không còn sinh số âm rất nhỏ gây IndexSizeError.
- Kiểm tra volume slider, phát SFX, tạm dừng theme trước special drop và tiếp tục theme sau SFX. Giữ nguyên file âm thanh, allowlist, cài đặt và chính sách autoplay hiện có.

2. UNIQUE RELIC: CHỈ HIỂN THỊ GIÁ TRỊ ĐÃ ROLL
- Rà soát toàn bộ 7 Relic. Những Unique có khoảng chỉ số đã lưu số roll cụ thể; lỗi giao diện cũ là nối thêm mô tả khoảng min–max sau số thật.
- Nail chỉ hiện đúng Crit Chance và Crit Damage của bản vật phẩm, ví dụ +14,2% và +21,5%; không nối thêm chuỗi +10–20% / +15–30%.
- God Leaf hiển thị số Dodge đã roll; Millennium Puzzle hiển thị số EXP đã roll; Enten Blade hiển thị số special damage đã roll; Bomb hiển thị số bonus đòn đầu đã roll.
- Eternal Eye (Burn x2) và Potara (điều kiện fusion cùng các bonus cố định) giữ nguyên cơ chế cố định, không tạo roll ngẫu nhiên không có trong thiết kế.
- Mô tả Relic đã sở hữu được cập nhật từ metadata. Giữ nguyên ID, rarity, element, binding và toàn bộ số roll cũ; không reroll khi mở Storage, xem tooltip, vào trận, hồi sinh hoặc triệu hồi.
- Khoảng min–max vẫn có thể xuất hiện trong phần giới thiệu recipe trước khi craft. Vật phẩm đã sở hữu chỉ hiện số cụ thể.
- Tiếp tục dùng hệ thống lưu inventory hiện có; không đổi schema inventory hoặc thêm bản vật phẩm cho đơn vị triệu hồi.

3. ICON RELIC TRONG ARENA
- Thêm relic_ui.js dùng chung với renderer Arena. Icon nằm trong góc trên bên phải khung artwork, tách khỏi element badge ở header.
- Hiển thị đúng ảnh của Relic trang bị; không có Relic thì ẩn slot. Có icon nhỏ cho hàng đội hình dự bị.
- Hover / focus / click trên PC hoặc tap trên điện thoại để xem tên, rarity, Unique, toàn bộ số roll và điều kiện bonus HP / ATK đang hoạt động hay không.
- Tooltip lấy thông tin động từ engine: xác suất follow-up ban đầu sau các modifier đang áp dụng, tổng Crit Chance / Crit Damage, Dodge hiện tại và trạng thái bonus đòn đầu của Bomb.
- Các xác suất follow-up vẫn tuân thủ mốc kích hoạt, form, mục tiêu, điều kiện nội tại và giới hạn chuỗi của từng thẻ; không tạo thêm follow-up cho chiêu tự động hoặc thẻ không có cơ chế đó.
- Tooltip cập nhật khi trận cập nhật; không tạo timer riêng. Một tooltip dùng chung, cache node và listener, hỗ trợ nút đóng, Escape, tap bên ngoài và cuộn trên màn hình hẹp.
- Tooltip chọn vùng trống trên hoặc dưới icon để không che chính nút vừa tap. Thiếu asset thì dùng biểu tượng dự phòng, nút vẫn thao tác được.

4. HỒI SINH VÀ SUMMON / CLONE
- Hồi sinh giữ nguyên Relic ban đầu của thẻ, bao gồm đúng số roll và Unique. Không thay bằng Relic của người hồi sinh.
- Các kiểu hồi sinh cấp một bộ HP / ATK mới (Dante, Josuke, Dark Decade, backup Julius) được áp lại phần bonus Relic của thẻ được hồi sinh đúng một lần trên bộ chỉ số mới.
- Trạng thái một lần của Relic không reset khi hồi sinh: Bomb đã dùng đòn đầu thì không nhận lại bonus đòn đầu.
- Mọi summon / clone / puppet / robot / đơn vị chuyển hóa đi qua cơ chế admission chung và nhận một bản sao Relic của NGƯỜI THI TRIỂN, không lấy Relic của nạn nhân bị sao chép.
- Sao chép đúng toàn bộ số roll, không dùng RNG mới. Bản sao độc lập trong trận, không thay đổi hoặc nhân bản vật phẩm trong Storage và không chiếm binding thứ hai.
- Nếu HP / ATK của summon đã lấy theo tỷ lệ chỉ số caster có Relic, không nhân bonus thêm lần nữa. Với bản sao lấy chỉ số từ nạn nhân, chuẩn hóa phần Relic nguồn rồi áp điều kiện Relic caster.
- Giữ điều kiện element / category và các ngoại lệ của từng Unique. Relic có thể được sao chép nhưng bonus cơ bản không hoạt động nếu đơn vị không đáp ứng điều kiện; các Unique độc lập điều kiện vẫn theo quy tắc cũ.
- Clone có Relic được dùng hiệu ứng Unique hợp lệ như Crit, Dodge, Burn duration, special damage và bonus follow-up. Mỗi đơn vị mới có trạng thái đòn đầu riêng; hồi sinh cùng một đơn vị giữ trạng thái cũ.
- Chỉ số phần trăm theo category của clone vô danh được xét bằng affinity Relic, không thêm category mới vào dữ liệu thẻ hoặc kích hoạt aura category ngoài phạm vi sửa đổi.
- Không thay giới hạn summon, luật cấm clone tạo thêm clone, giới hạn Dark Decade, điều kiện cấm revive / clone riêng của thẻ hoặc cơ chế thưởng.

5. KIỂM TRA VÀ TRIỂN KHAI
- Kiểm tra toàn bộ 70 file JavaScript, thứ tự script, cache tag và startup 180 thẻ.
- Audio: kiểm tra timestamp fade âm nhẹ, slider ngoài khoảng / không hữu hạn, phát SFX và tiếp tục nhạc; mọi volume được gán đều hữu hạn trong 0–1.
- Relic: kiểm tra concrete roll cho 7 loại, mô tả cố định không reroll, cập nhật mô tả cũ và save / reload.
- Summon: kiểm tra các nhánh Funny Valentine, Naruto x Sasuke, Dagon, Awakened Doflamingo, Reagan Ridley, True Mahito, Mechamaru, Sung Jin Woo, Iskandar và Jin Mori; xác nhận cùng số roll caster và không nhân chỉ số lần hai.
- Revive: kiểm tra Ragna, Aizen, Dante, Josuke, Dark Decade và Julius; giữ đúng Relic, bonus và trạng thái Bomb đã dùng.
- Giao diện: kiểm tra icon, hover / tap, đóng tooltip, số roll và xác suất follow-up thay đổi theo trạng thái trên PC và điện thoại 390x844.
- So sánh combat có seed cho cả 180 thẻ khi không có Relic với bản trước: không có khác biệt trong các kịch bản kiểm tra.
- Không thay chỉ số thẻ, EXP, drop rates, quest, mode scaling, Firebase, TURN / STUN hoặc luật PvP. Không kèm ảnh, audio hay Excel; dùng assets hiện có.
- Upload đủ source và hard-refresh Ctrl+F5. Cache tag mới: 20261103-relic-inherit-1.

Modified Files Note
- background.js: clamp volume nhạc và fade an toàn.
- drop_audio.js: clamp mọi gán volume SFX.
- relics.js: mô tả số Unique thật, làm mới mô tả cũ, snapshot / affinity / chuẩn hóa và kế thừa Relic trong trận.
- relic_combat.js: cho phép hiệu ứng Relic đã kế thừa trên summon và clone; cung cấp trạng thái đòn đầu.
- companions.js: kết nối kế thừa tại admission chung, giữ nguyên cap và anti-recursion.
- passives.js: nguồn chỉ số summon, giữ bonus Relic khi cấp life mới và dữ liệu tooltip động.
- grimoire.js: ghi nguồn Relic của backup để hồi sinh Julius không làm mất hoặc nhân bonus.
- relic_ui.js (mới): icon và tooltip Relic dùng chung Arena, hover / tap và cập nhật thông tin động.
- app.js: nối icon vào thẻ chiến đấu và hàng đội hình chuẩn.
- styles.css: slot góc phải, tooltip nổi và bố cục mobile.
- index.html: nạp module UI mới và đổi cache tag.
- startup.js: kiểm tra RelicBattleUI khi khởi động.
- README.txt: changelog phiên bản này và danh sách file sửa.
