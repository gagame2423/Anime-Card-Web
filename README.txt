NHẬT KÝ CẬP NHẬT — SỬA NGUỒN DROP SHIBUYA RAID KEY
Ngày: 31/10/2026

1. ONLINE PVP KHÔNG CÓ PHẦN THƯỞNG
- Gỡ toàn bộ hook cấp Shibuya Raid Key khỏi kết quả Online PvP 1v1/4v4.
- Xóa pvp_rewards.js, script tag và kiểm tra module tương ứng trong startup.
- Gỡ callback weather/reward khỏi adapter PvP trong app.js. Màn hình PvP hiển thị lại No rewards.
- PvP thắng, thua, hòa, rời phòng hoặc ngắt kết nối đều không cấp item, EXP, VNĐ hoặc progression.
- Giữ nguyên blind pick, lưu đội hình, thống kê combat tạm thời, Level 1, PeerJS, TURN/STUN và đồng bộ trận đấu.

2. SHIBUYA RAID KEY CHỈ RƠI Ở NORMAL 1V1 / NORMAL 4V4
- Hoàn tất trận Normal 1v1 hoặc Normal 4v4 khi Malevolent đang hoạt động: nhận 1 Shibuya Raid Key.
- Kiểm tra weather tại thời điểm trận hoàn tất. Malevolent xuất hiện trong trận và còn hoạt động khi kết thúc thì đủ điều kiện; nếu đã hết trước kết quả thì không cấp Key.
- Giữ số lượng 1 Key chắc chắn/trận đủ điều kiện vì yêu cầu không chỉ định tỷ lệ mới; không nhân Drop Multiplier. Áp dụng cho trận hoàn tất thắng hoặc thua, không áp dụng bỏ trận.
- Key xuất hiện trong nội dung kết quả trận và battle log, được lưu vào Storage, theo cơ chế Cloud Sync hiện có.
- Receipt normal_shibuya và cờ kết quả trên battle ngăn callback lặp cộng lại phần thưởng. Lưu Inventory thất bại không được báo cấp Key thành công.
- Chặn Online PvP, Sandbox, trận chưa hoàn tất, surrender, Tower, Raid, Boss Event, cả hai Time Trial, Spooky Hunt, Infinity và Portal.
- Nguồn mua Key tại Gomen Event Shop giá 10 Gomen Coins giữ nguyên. Không thu hồi hoặc xóa item đã sở hữu.

MODIFIED FILES NOTE
- app.js: bỏ adapter reward PvP; nối drop Key vào kết quả Normal 1v1/4v4; hiện Key trong kết quả/log.
- pvp.js: bỏ toàn bộ logic weather, reward và callback cấp Key; kết quả luôn reward-free.
- pvp_rewards.js: đã xóa; không còn được tải hoặc gọi.
- raid.js: claimShibuyaKey với mode/weather/completion guards và receipt; sửa mô tả nguồn Key.
- storage.js: sửa Source Info của Shibuya Raid Key.
- startup.js: bỏ dependency PvPRewards đã xóa.
- index.html: bỏ script pvp_rewards.js, phục hồi nhãn PvP không thưởng; cache tag 20261031-normal-key-fix-1.
- README.txt: chỉ changelog của bản sửa này.

KIỂM TRA VÀ TRIỂN KHAI
- Kiểm tra cú pháp toàn bộ JavaScript, startup trình duyệt và kết quả Normal 1v1/4v4 thắng/thua khi có/không có Malevolent.
- Kiểm tra weather bật/hết trong trận, receipt chống cộng trùng, các mode bị loại trừ và Key còn nguyên sau reload.
- Các cân bằng, timer potion, tìm kiếm Portal, auto-loadout, card stats và nội tại của bản trước giữ nguyên.
- Upload toàn bộ nội dung ZIP và giữ assets hiện có. Nếu server còn pvp_rewards.js từ bản cũ, xóa file đó; bản này không tải nó. Sau đó Ctrl+F5 trên các client.
- Không kèm Excel, ảnh/binary asset, test runner hoặc script tạm.
