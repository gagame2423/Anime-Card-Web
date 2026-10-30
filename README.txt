NHẬT KÝ CẬP NHẬT — V2 STATS, EXP TRAINING DUMMY VÀ TEAM LOADOUTS
Ngày cập nhật: 30/10/2026

1. CÂN BẰNG CHỈ SỐ V2 CHO 167 THẺ

- Đối chiếu đúng sheet Đối chiếu của cards_rebalance_v2.xlsx. Ghép 167 tên thẻ với Tên thẻ bằng tên chính xác; tất cả 167 thẻ đều có bản ghi tương ứng.
- Chỉ lấy HP mới và ATK mới làm stats.hp và stats.atk trong cards.js. Không dùng HP chuẩn, ATK chuẩn hoặc các cột hệ số tham khảo.
- Một số mốc kiểm tra, đều là chỉ số Level 1 chưa có mutation:
  Gilgamesh Chan: HP 63,700; ATK 15,600.
  Shadow The World Requiem: HP 34,200; ATK 13,100.
  Madara Lubu: HP 31,800; ATK 12,100.
  Gilgamesh: HP 77,200; ATK 7,080.
  Sukuna Shibuya: HP 63,600; ATK 5,830.
  Wonder Of You: HP 97,100; ATK 863.
  Aizen Beyond: HP 31,500; ATK 12,000.
- Không sửa tên, ID, rate, rarity, Element, Category, nội tại, asset, điều kiện mở khóa hoặc thời tiết của thẻ. Giữ nguyên Level hiện có, công thức yêu cầu EXP, tăng trưởng theo Level và multiplier mutation.
- Theo chỉ dẫn bổ sung: cả hai bên Online PvP dùng đúng base stats V2 của Index tại Level 1. Giao thức PeerJS, blind pick, commitment, RNG đồng bộ và quy tắc không thưởng của PvP giữ nguyên.

2. BẢO TOÀN THÔNG SỐ ĐỊCH NGOÀI EXP TRAINING

- Raid, Boss Event và Spooky tiếp tục lấy HP/ATK từ các bảng khoảng stat và scaling hiện có; không giảm boss hoặc đổi độ khó để bù cho V2.
- Thêm enemy_stats.js lưu baseline thẻ NPC trước cập nhật từ mã nguồn đang chạy. Tower và Infinity vẫn áp dụng công thức stat theo floor/wave cũ, đồng thời giữ metadata stat NPC cũ cho các nội tại tham chiếu card.stats.
- Normal Time Trial giữ nguyên roomStats, đội 3 minion + 1 boss, scaling, Shards, thời gian 180 giây và turn 2 giây. Không chuyển Normal Time Trial sang training dummy.
- Không đổi loại tháp, khóa đội địch khi retry, pool/weight chọn địch, stat ranges, giá shop, tiền thưởng, weekly seed hoặc cơ chế wave liên tục của Infinity.
- Baseline NPC tách khỏi dữ liệu thẻ sở hữu; thay cards.js không tự đè stat của các mode NPC được bảo toàn. PvP là ngoại lệ có chủ đích theo yêu cầu mới: dùng V2 của Index cho cả hai người.

3. EXP TIME TRIAL: DAMAGE-BASED TRAINING DUMMY

- Giữ điều kiện 1 EXP Time Trial Ticket mỗi lượt, giới hạn 300 giây và turn cố định 1 giây. Speed Battle Potion không làm thay đổi thời gian turn của Time Trial.
- Giữ lựa chọn ban đầu 1v1 của EXP Time Trial. Damage meter cộng damage từ toàn bộ đội người chơi đang tồn tại trong trận, kể cả clone/summon hoặc đồng đội do nội tại tạo ra.
- Thay EXP Monsters nối tiếp bằng một EXP Training Dummy duy nhất. ATK luôn bằng 1; HP nội bộ là 999,999,999 và hiển thị vô hạn trong Arena.
- Dummy không bị hạ và không được thay bằng một enemy mới sau mỗi đòn. Damage được ghi nhận trước khi giữ lại HP của target; một hit vượt 999,999,999 vẫn được tính đầy đủ, không bị cắt theo lượng HP hiển thị.
- Giữ trigger tấn công, bị đánh, phản đòn, follow-up, counter, trạng thái và timer nội tại trong cùng trận. Không reset đội hình/buff/counter do đổi monster vì không còn đổi monster.
- Chỉ dummy của mode exp-time-trial đi vào các hook mới. Nhánh damage/death của những target và mode khác không thay đổi.
- Ghi nhận damage trực tiếp, passive attack, follow-up, clone/summon, phản đòn và Burn/Bleed. Mỗi hit/tick chỉ cộng một lần. Damage bị shield/miễn thương/ngăn chặn không được cộng như damage đã gây ra.
- Gán HP = 0 để xử tử tức thì không thể giết target vô hạn và không tạo damage giả hoặc kill/quest giả. Dummy không kích hoạt thưởng theo số quái bị hạ.

4. DAMAGE METER, EXP VÀ KỶ LỤC DPS

- Thêm HUD Total Damage: X,XXX,XXX trong Arena, kèm DPS hiện tại và Best DPS. Counter chuyển số trong 180 ms, cập nhật theo hàng đợi requestAnimationFrame và tôn trọng prefers-reduced-motion.
- Không tạo một giao diện combat tách biệt. Artwork, HP/Shield, status effects, floating damage và log vẫn dùng renderer Arena hiện có.
- Khi hết 300 giây và lượt luyện hoàn tất:
  Converted EXP = floor(Total Damage x 0.05).
  Ví dụ: 100,000 damage chuyển thành 5,000 EXP.
- Đây là EXP cơ bản cố định theo damage. Không nhân thêm EXP từ potion, equipment, achievement, weather hoặc upgrade. Không sửa multiplier của các nguồn EXP khác.
- EXP được áp dụng cho thẻ gốc đã chọn khi vào EXP Time Trial. Clone/summon đóng góp damage, không tạo thêm phần thưởng EXP riêng.
- Giữ hard cap Level 1000. Summary tách Converted EXP khỏi Applied EXP để thể hiện rõ trường hợp thẻ đã max hoặc chỉ còn một phần EXP cần để đạt max.
- DPS hoàn tất lượt = Total Damage / 300. Nếu cao hơn Best DPS đã lưu, summary hiện thông báo NEW HIGHEST DPS RECORD và làm nổi bật phần kết quả. Kỷ lục lưu qua refresh và Cloud Save.
- Modal kết quả có Total Damage Dealt, Converted EXP Earned, Applied EXP, số level-up, DPS và Best DPS. Không dùng summary theo số EXP Monsters hay % EXP mỗi kill nữa.
- Quy đổi khi hoàn tất timer; thoát hoặc thua trước thời hạn không quy đổi damage chưa chốt. Vé đã dùng không hoàn lại. Không đổi các phần thưởng thắng trận chung đang có ngoài phạm vi EXP/VNĐ/Shards của mode.
- Thưởng EXP có receipt trong cùng bản lưu tiến trình chính, cùng các guard kết thúc lượt, để timeout/callback lặp không cộng EXP hai lần. Reload không tiếp tục trận với HP hoặc timer cũ, giống chính sách Time Trial trước đó.
- Tổng damage giới hạn ở Number.MAX_SAFE_INTEGER để giữ phép tính và dữ liệu lưu hữu hạn; không lưu Infinity vào JSON.

5. BA TEAM LOADOUTS

- Thêm Preset 1, Preset 2, Preset 3 cùng Save Current Team và Load ngay phía trên các ô TEAM LINEUP của Arena có 4 slot.
- Chọn preset rồi Save Current Team để lưu đội đang thiết lập. Load nạp lại đội đó bằng một lần bấm. Mỗi preset độc lập; đổi preset không tự ghi đè đội đã lưu.
- Lưu trong teamLoadouts của bản save/profile chính:
  preset1 / preset2 / preset3 gồm name và slots gồm đúng 4 card ID hoặc null.
  variantKeys bổ sung lưu mutation đã chọn, giúp khôi phục đúng biến thể khi vẫn còn sở hữu.
- Không lưu bản sao stat vào loadout. Khi nạp, dùng Level và chỉ số hiện tại của thẻ, bao gồm V2 và mutation hiện có.
- Nếu mutation đã lưu không còn, ưu tiên bản Normal đang có rồi đến biến thể còn dùng được. Không tạo thẻ hoặc mutation không sở hữu.
- Nếu thiếu thẻ, hết số bản sao cần thiết hoặc không hợp lệ với điều kiện mode hiện tại, giữ đúng vị trí đó EMPTY và báo toast không chặn màn hình. Không dồn các thẻ phía sau lên để lấp chỗ trống.
- Kiểm tra số lượng theo từng variant khi một preset có nhiều slot cùng thẻ; không cho sử dụng quá số bản sao đang có. Start bị khóa cho tới khi đội đủ slot hợp lệ.
- Các ô trống có thể chọn thẻ để bổ sung bình thường, giữ nguyên các slot đã nạp. Giữ kiểm tra native weather/mutation của Tower, không cho preset vượt điều kiện mode.
- Ẩn công cụ loadout khi không phải builder 4 slot. Không can thiệp blind pick PvP, builder riêng Infinity, mode 5/6 thẻ hoặc đội hình đang chiến đấu.
- Preset lưu vào localStorage qua save chính và đi cùng Cloud Save tùy chọn. Save cũ thiếu teamLoadouts được bổ sung 3 preset trống, không xóa collection hoặc tiến trình.

6. KIỂM TRA VÀ TRIỂN KHAI

- Đối chiếu toàn bộ 167 HP/ATK với HP mới / ATK mới. Kiểm tra mọi thuộc tính thẻ còn lại giữ nguyên.
- So sánh spawn bằng cùng seed trước/sau: 14 loại Tower tại floor 1, 100, 134, 300, 1000; tất cả Raid/Boss Event ở difficulty 1, 50, 1000; Spooky; Infinity wave 1, 100, 134, 1000 và Normal Time Trial. HP, ATK và metadata stat NPC tương ứng giữ nguyên.
- Kiểm tra cả hai bên PvP lấy V2 Index stats, Level 1. Không thay hoặc triển khai cấu hình TURN/STUN/Firebase.
- Kiểm tra 3 preset độc lập, mutation, số lượng bản sao, missing card giữ EMPTY, điền lại ô trống, refresh và validate Cloud bundle.
- Kiểm tra ticket, turn 1 giây, damage trực tiếp/follow-up/clone/DOT/counter, hit 2 tỷ damage qua engine, không cộng trùng, dummy không chết và không cấp EXP giữa trận.
- Kiểm tra timeout bằng đồng hồ trình duyệt điều khiển: floor(damage x0.05), không bị EXP boost nhân thêm, kỷ lục DPS lưu lại, callback lặp không cộng lại EXP. Kiểm tra Level 1000 và thoát sớm không còn timeout/HUD treo.
- Kiểm tra layout desktop, 390 px và 320 px; kiểm tra cú pháp JavaScript, CSS, JSON, ID HTML và đường dẫn đúng chữ hoa/thường. Các kiểm tra chạy ngoài gói giao hàng; không kèm test runner hoặc log.
- Upload đầy đủ nguồn, gồm hai module mới enemy_stats.js và training_dummy.js, lên GitHub Pages. Ctrl+F5 để nạp cache tag 20261030-v2-training-loadouts-1. Hai người chơi PvP cần cùng cập nhật để signature stat khớp nhau.
- Không có thao tác deploy trực tiếp lên website hoặc Firebase. Kết nối Google/PvP thật qua dịch vụ online vẫn cần kiểm tra sau khi upload; source kiểm tra trình duyệt dùng local play và không gọi tài khoản thật.
- Không sửa hoặc gửi lại workbook. Gói chỉ có mã nguồn sản xuất và README.txt, không có Excel, asset nhị phân, node_modules, test script hoặc log. Asset cũ vẫn do người dùng quản lý.

7. MODIFIED FILES NOTE — GHI CHÚ TỆP THAY ĐỔI

- cards.js: Thay đúng 167 cặp stats.hp / stats.atk bằng HP mới / ATK mới.
- enemy_stats.js (mới): Baseline stat thẻ NPC trước V2; không dùng cho PvP.
- tower.js: Nối metadata NPC vào baseline bảo toàn; không sửa lựa chọn, floorStats, thưởng hoặc khóa encounter.
- infinity_combat.js: Giữ metadata stat NPC cũ; không sửa scaling, wave, seed hoặc phần thưởng.
- training_dummy.js (mới): Entity training, damage ledger, bảo vệ target vô hạn, công thức EXP và HUD gộp cập nhật.
- timetrial.js: Thay EXP monster rewards bằng training 300 giây, chốt EXP cuối timer và lưu Best DPS; giữ Normal Time Trial.
- passives.js: Hook chỉ dành cho EXP Training Dummy để ghi từng hit/tick và chặn cái chết giả; không thay giá trị hoặc logic nội tại của các mode khác.
- storage.js: Chuẩn hóa, kiểm tra, lưu cấu trúc và resolve preset theo ownership/variant/quantity.
- app.js: Adapter UI loadout, empty-slot safety, tích hợp dummy HUD/summary và receipt EXP trong save chính.
- index.html: Preset controls, damage HUD, mô tả mode, nạp module mới và cache tag.
- styles.css: Dark neon loadout buttons, damage counter, record highlight và responsive.
- startup.js: Kiểm tra module EnemyStatsSystem và TrainingDummySystem.
- README.txt: Chỉ ghi changelog bản cập nhật này cùng danh sách tệp thay đổi.
