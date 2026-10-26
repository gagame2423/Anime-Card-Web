NHẬT KÝ CẬP NHẬT — INFINITY DÙNG CHUNG GIAO DIỆN BATTLE ARENA
Ngày cập nhật: 26/10/2026

1. INFINITY CHUYỂN SANG BATTLE ARENA CHUẨN

- Giữ sảnh dựng đội trực quan của Infinity: 4 SLOT, thẻ đã mở khóa, Category tuần, tìm kiếm, lọc, phân trang, chọn mutation và chống chọn trùng ID.
- Sau khi bấm Start Infinity Run, trận diễn ra trực tiếp trong battleModal / battleArena hiện có. Dùng đúng hai khung frontline, thanh HP, Shield, chỉ số, dãy đội hình dự bị, nền Standoff và Combat Log của Arena.
- Không tạo bản sao màn hình chiến đấu hoặc thay thế battleState của các mode Arena khác. Runtime nội tại riêng của lượt Infinity được nối vào cùng các hàm render dùng cho Arena; không đưa nội tại của trận Infinity sang trận thường.
- Xóa các container chiến đấu riêng infinityBattle, infinityPlayers, infinityEnemies, infinityLog và renderer thẻ Infinity cũ. infinity_combat.js tiếp tục chỉ điều khiển trận liên tục, không chứa DOM combat riêng.
- Xóa CSS infinity-team, infinity-fighter, infinity-battle-head, infinity-log và các quy tắc layout combat cũ trong infinity.css. Giữ CSS sảnh chọn đội, modal nhận thưởng tuần và mua gộp shop.

2. HUD INFINITY GỌN TRONG ARENA

- Current Wave: Wave N - Continuous, cập nhật ngay khi chuyển wave.
- Weekly Modifier Badges: ID tuần ISO UTC, seed tuần, Category bắt buộc và Element chung của đội địch.
- Rewards Tracker: tổng Star Orb đã nhận trong lượt hiện tại.
- Best Progress: số wave đã vượt trong lượt, best của tuần và thanh tiến độ so với best đó.
- Giữ bộ đếm Player/Enemy Strike và nhãn 4V4, thời gian turn theo cùng thiết lập Infinity trước cập nhật. Các thông tin HUD không sửa stat, RNG hoặc phần thưởng.
- Khi kết thúc, HUD hiển thị thông báo dừng, New Run và Weekly Top 50. Exit Infinity và nút X của Arena kết thúc lượt rồi trở về Arena cũ; không chạy luồng thưởng hay replay của trận thường.
- Các nút setup hoặc điều khiển chỉ dành cho mode khác được ẩn tạm trong trận Infinity và khôi phục khi rời đi. Không thay trạng thái Auto Continue đã lưu của người chơi.

3. RENDER, HIỆU ỨNG VÀ VÒNG ĐỜI GIAO DIỆN

- Dùng chung renderer cho artwork, Element badge, mutation, HP/ATK, Shield, Dodge/DR, buff/debuff, Burn/Bleed/Freeze/Stun và mô tả nội tại.
- Damage text, crit/dodge feedback và thông báo kỹ năng từ runtime Infinity đi qua showBattleFloatingText của Arena. Nhật ký đi qua hàng đợi appendBattleLog / paintBattleLog hiện có, giữ tone và giới hạn số dòng của Arena.
- Hoạt ảnh đánh và đổi frontline dùng animateBattleAttack / animateBattlePromotion hiện có. Chỉ phát lunge khi bộ đếm tấn công xác nhận một đòn được thực hiện, không giả lập đòn đánh khi bị bỏ lượt.
- Nút mở rộng nội tại và bảng tương khắc Element tiếp tục dùng modal chung; không tạo modal hiệu ứng riêng cho Infinity.
- Cập nhật thẻ và log được gộp qua requestAnimationFrame của RollPerformanceSystem. Đồng hồ HUD chỉ đổi text theo giây, không dựng lại toàn bộ đội hình theo từng tick giao diện.
- Khi thoát hoặc bắt đầu lượt mới: hủy công việc render đang chờ, dọn hoạt ảnh và floating text, khôi phục khả năng hiển thị các điều khiển, gỡ khóa Arena và trả đúng runtime cho các mode thường.
- HUD co giãn theo màn hình; giữ cơ chế cuộn dọc và bố cục mobile vốn có của Battle Arena, không thêm layout chiến đấu riêng trong infinity.css.

4. GIỮ NGUYÊN CƠ CHẾ WAVE VÀ TIẾN TRÌNH

- Hạ hết đội địch sẽ thay 4 đối thủ mới ngay trong cùng đối tượng battle và cùng phần tử Arena. Không gọi lại beginBattle cho đội người chơi ở ranh giới wave.
- Giữ nguyên đối tượng unit, HP, Shield, buff/debuff, timer nội tại, lượt hồi chiêu, bộ đếm tấn công và đồng đội được triệu hồi. Nội tại on-entry của đội người chơi không được kích hoạt lại khi đổi wave.
- Giữ nguyên pool chọn địch, 4 ID không trùng trong một wave, trọng số boss/rarity theo độ sâu và Element tuần.
- Không đổi base stat: 1000 HP/100 ATK, 1500/300, 2000/400, boss 5000/500. Hệ số stat vẫn là wave^1.365; không đổi scaling hoặc tỷ lệ HP/ATK.
- Không đổi công thức Star Orb từng wave: min = floor(1 + (wave - 1) x7/99), max = floor(2 + (wave - 1) x8/99). Wave 1: 1–2; Wave 100: 8–10.
- Giữ nguyên lưu best, receipt thưởng wave, sổ phục hồi thưởng tuần, thưởng tuần highestWave x100, đồng bộ Firestore tùy chọn và startup local-first không bắt Google.
- Không sửa combat/nội tại, stat thẻ, quest, Tower, Time Trial, Raid, Boss Event, Spooky, Sandbox, PvP, STUN/TURN, auth hoặc công thức mua shop.

5. KIỂM TRA VÀ TRIỂN KHAI

- Kiểm tra trình duyệt với nguồn game thật: chọn 4 thẻ hợp lệ từ sảnh rồi vào đúng battleArena, không còn các container combat Infinity cũ.
- Kiểm tra renderer chung: HP, Shield, Stun, damage text, passive expansion, Element chart, log tấn công và hoạt ảnh turn thực tế.
- Kiểm tra đổi wave bằng dữ liệu kiểm soát: đối tượng battle, unit, runtime, DOM Arena, HP, Shield, buff và attack counter giữ nguyên; sinh 4 đối thủ mới đúng Element và chỉ cộng Star Orb của wave.
- Kiểm tra defeat, Weekly Top 50 cục bộ, New Run, nút X, Exit Infinity, khôi phục điều khiển và bắt đầu lại trận 4v4 thường bằng PassiveSystem mặc định.
- Kiểm tra HUD và khung Arena ở 1440x900, 390x844 và 320x640; vẫn nhìn thấy nút X và truy cập các phần chiến đấu bằng cuộn chuẩn.
- Kiểm tra cú pháp 53 tệp JavaScript, 4 stylesheet, ID HTML duy nhất, đường dẫn đúng chữ hoa/thường, JSON và cache tag. Các module combat, mạng và save ngoài phạm vi được so sánh byte với bản nguồn trước cập nhật.
- Gói chỉ có nguồn sản xuất và README.txt, không kèm test runner, log, ảnh, âm thanh, Excel hoặc node_modules. Ảnh/audio vẫn do người dùng đặt vào các đường dẫn asset hiện có.
- Upload đầy đủ nguồn lên GitHub Pages rồi Ctrl+F5. Cache tag mới: 20261026-infinity-arena-1. Nhớ thêm infinity_view.js mới; thiếu module sẽ được báo khi startup kiểm tra nguồn.
- Không thay Firestore Rules hoặc cấu hình Firebase; không có thao tác triển khai trực tiếp lên website hay dịch vụ online trong cập nhật này.

6. MODIFIED FILES NOTE — GHI CHÚ TỆP THAY ĐỔI

- infinity_view.js (mới): Điều khiển HUD, nối runtime Infinity vào renderer Arena, mount/release giao diện và khôi phục trạng thái hiển thị; không tạo renderer thẻ riêng.
- infinity.js: Xóa renderer combat riêng, nối lifecycle/turn/reward vào view chung, chuyển thao tác New Run/Exit và cập nhật HUD.
- infinity_combat.js: Thêm callback trình bày cho log, floating feedback, render và xác nhận đòn đánh; giữ logic wave, RNG, stat và passive engine.
- app.js: Chọn ngữ cảnh render Arena theo trận đang hiển thị, dùng runtime đúng cho status/tooltip, nối view Infinity và xử lý X/modal an toàn; giữ battleState và phần thưởng của Arena thường độc lập.
- index.html: Xóa combat markup Infinity riêng, thêm HUD trong battleArena, nạp infinity_view.js đúng thứ tự và đổi cache tag.
- infinity.css: Loại bỏ CSS combat riêng dư thừa; giữ deck builder, modal thưởng và shop.
- styles.css: Thêm quy tắc HUD tối giản và responsive; không ghi đè layout thẻ combat.
- startup.js: Thêm kiểm tra module InfinityViewSystem vào chuỗi nạp chuẩn.
- README.txt: Chỉ ghi changelog của bản cập nhật này cùng danh sách tệp thay đổi.
