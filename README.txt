NHẬT KÝ CẬP NHẬT 15/10/2026
Dark Decade, Aizen Beyond, EXP thường, migration Lv.10 và loại bỏ VNĐ Potion

1. DARK DECADE: VỊ TRÍ TRIỆU HỒI VÀ PHẠM VI HỒI SINH

- Dark Aurora giữ nguyên xác suất 29% chuyển hóa một đối thủ vừa bị Dark Decade đánh bại. Đơn vị chuyển hóa sao chép max HP và ATK hiện tại của Dark Decade, đồng thời giữ passive của đối thủ. Dark Decade tiếp tục đánh cắp passive đó.
- Đơn vị chuyển hóa được chèn ngay trước Dark Decade. Ví dụ: Dark Decade đang ở vị trí 1 thì đơn vị mới chiếm vị trí 1, Dark Decade lùi về vị trí 2.
- Nếu Dark Decade đang trực tiếp chiến đấu, đơn vị chuyển hóa tiếp quản vị trí tiên phong. Nếu Dark Decade đang ở hàng chờ nhưng hạ đối thủ qua hiệu ứng kỹ năng, việc chèn đơn vị không làm đổi thẻ tiên phong khác đang chiến đấu.
- Hồi sinh của Dark Aurora nay chỉ dành cho đồng đội gốc đã bị đánh bại khi một Dark Decade hợp lệ vẫn còn sống. Thẻ hồi sinh được đưa xuống cuối hàng chờ, nhận max HP và ATK hiện tại của Dark Decade và giữ passive của chính thẻ đó.
- Giữ giới hạn hồi sinh hiện có: tối đa 2 lần cho mỗi đồng đội gốc trong một trận; nhiều Dark Decade không cộng thêm số lần cho cùng một thẻ.
- Clone, summon, đồng đội tạm thời và đơn vị chuyển hóa đều không được nhận hồi sinh này. Dark Decade không tự hồi sinh bằng chính passive của mình. Các quy tắc cấm hồi sinh, tử vong vĩnh viễn và Bleed vẫn được áp dụng.
- Giữ nguyên cơ chế ngăn clone/summon tạo thêm clone/summon. Bản cập nhật này không thêm giới hạn số lần tạo đồng đội cho thẻ gốc.
- Điều chỉnh xử lý đòn đánh gây tử vong: sát thương thực tế được ghi nhận trước khi thẻ hồi sinh; thẻ đã hồi sinh không bị coi là đã chết hoàn toàn để kích hoạt nhầm chuyển hóa hoặc kết thúc trận.
- Mô tả Dark Aurora được cập nhật đầy đủ, phân biệt rõ đơn vị chuyển hóa với đồng đội gốc có thể hồi sinh.

2. AIZEN BEYOND: GIẢM CHỈ SỐ GỐC, TĂNG THƯỞNG HỒI SINH

- ID: tower-champion-reaper.
- HP gốc: 60.000, thay cho 100.000.
- ATK gốc: 30.000, thay cho 60.000.
- Lần tự hồi sinh hợp lệ đầu tiên trong trận phục hồi 100% max HP hiện tại và tăng vĩnh viễn +100% ATK hiện tại đến hết trận, thay cho +50% ATK.
- Công thức ATK khi hồi sinh: ATK mới = round(ATK ngay trước hồi sinh x2). Ví dụ thẻ không có modifier khác: 30.000 ATK thành 60.000 ATK.
- Tự hồi sinh vẫn chỉ xảy ra 1 lần mỗi trận và tuân theo quy tắc cấm hồi sinh. Thẻ tiếp tục không được clone hoặc nhận hồi sinh từ đồng đội.
- Giữ nguyên các hiệu ứng khác của Illusion Shattering Flower: sau mỗi 2 đòn đánh chính, gây sát thương lên mọi đối thủ còn sống bằng 60% ATK hiện tại của chính đối thủ đó; sau khi nhận sát thương, có 6% cơ hội phản công bằng 50% sát thương thực nhận.
- Không đổi ID, artwork, yêu cầu mở khóa Reaper Tower tầng 100, điều kiện thời tiết Reaper và tỷ lệ roll 1 trên 6.000.000.
- Với bản sao đối thủ trong Tower, bộ bảo vệ tỷ lệ ATK/HP của Tower vẫn có hiệu lực trong lúc tăng ATK.

3. THAY CÔNG THỨC EXP TRONG TRẬN THƯỜNG 4v4 VÀ 1v1

- Bỏ cách lấy một tỷ lệ cố định của EXP cần lên cấp làm phần thưởng trận thường. Công thức mới tính số EXP tuyệt đối, tăng theo căn bậc hai của cấp hiện tại.
- Chỉ áp dụng khi thắng trận thường. Mỗi ID thẻ gốc trong đội hình nhận thưởng 1 lần; nhiều bản sao hoặc mutation của cùng ID không nhân số lượt nhận EXP.
- Ký hiệu:
  L = cấp hiện tại của thẻ tại thời điểm tính thưởng.
  R = hệ số rarity của thẻ.
  U = số ngẫu nhiên trong khoảng 0 đến dưới 1.
  floor(x) = làm tròn xuống; sqrt(L) = căn bậc hai của L.
- Trận 4v4: B = 6 + 4U.
- Trận 1v1: B = 2 + 3U.
- EXP cơ bản mỗi thẻ = max(1, floor(B x R x sqrt(L))).
- Hệ số R giữ nguyên: Common = 1; Rare = 1,6; Epic = 2,4; Legendary = 3,6; Mythic = 5,2; Secret = 8.
- EXP cần lên cấp giữ nguyên: max(1, floor(100 x R x L)).
- Vì phần thưởng tăng theo sqrt(L), còn yêu cầu lên cấp tăng theo L, số trận cần lên cấp tăng dần theo cấp thay vì gần như cố định ở mọi cấp.
- EXP cuối cùng tiếp tục áp dụng hệ số nâng cấp EXP, EXP Potion và các passive thưởng hợp lệ. Không thay đổi các hệ số nâng cấp đã có.
- Thứ tự làm tròn: E1 = floor(EXP cơ bản x hệ số EXP chung); EXP nhận = floor(E1 x hệ số thưởng passive hợp lệ).
- Hệ số EXP chung = (1 + 0,12n + 0,03 x n^1,15) x P, với n là cấp nâng cấp EXP; P = 1,25 khi EXP Potion hoạt động, ngược lại P = 1.
- Ví dụ Common, U = 0,5, không có bonus:
  Lv.1: cần 100 EXP; thắng 4v4 nhận 8 EXP, thắng 1v1 nhận 3 EXP.
  Lv.10: cần 1.000 EXP; thắng 4v4 nhận 25 EXP, thắng 1v1 nhận 11 EXP.
  Lv.100: cần 10.000 EXP; thắng 4v4 nhận 80 EXP, thắng 1v1 nhận 35 EXP.
- Thẻ đạt Lv.999 không nhận thêm EXP trận thường.
- Log và màn hình thưởng hiển thị EXP tăng tiến, bỏ thông báo tỷ lệ phần trăm cố định cũ.
- Phạm vi thay đổi chỉ là trận thường: Tower vẫn không cho EXP; Raid vẫn không cho EXP; EXP Time Trial giữ cơ chế EXP riêng theo mỗi EXP Monster; EXP nhận từ roll trùng không đổi.

4. MIGRATION GIỚI HẠN Lv.10 CHẠY MỘT LẦN THEO SAVE

- Nâng schema dữ liệu người chơi lên phiên bản 9.
- Cờ hoàn tất nằm trong dữ liệu save chính: migrations.level_cap_10_20261015 = true. Cờ này được lưu vào localStorage và đi theo gói .acrsave khi xuất save.
- Khi nạp save cũ tại trình duyệt hoặc nhập .acrsave chưa có cờ, game quét tiến trình thẻ gốc và các bản ghi cấp thẻ trong những cấu trúc inventory, lineup, lineups, storage, collection, cards, unlockedCards và equipment cũ.
- Hỗ trợ dữ liệu cấp cũ dạng cardProgress, cardLevels hoặc levels, gồm cả bản ghi số cấp đơn lẻ và đối tượng có level/exp.
- Thẻ có cấp lớn hơn 10 được đưa về Lv.10, EXP đang tích lũy của thẻ đó được đặt về 0 để không lập tức tăng cấp lại từ EXP cũ. Tất cả mutation dùng chung tiến trình của cùng ID thẻ gốc.
- Thẻ Lv.1 đến Lv.10 giữ nguyên cấp và EXP hiện có, trừ trường hợp một bản ghi khác của cùng ID thẻ có cấp vượt 10 và cần được đưa về cùng tiến trình chuẩn.
- Cờ được đánh dấu sau khi chuẩn hóa dữ liệu; save mới cũng được đánh dấu ngay từ đầu. Sau đó người chơi có thể lên Lv.11 trở lên bình thường.
- Khi tải lại hoặc nhập save đã có cờ hoàn tất, game không áp lại giới hạn Lv.10. Đây là migration một lần, không phải trần cấp mới.
- Migration không hạ cấp đối thủ Tower, đối thủ Raid, độ khó Raid, nâng cấp shop hoặc số lượng vật phẩm. Trần cấp thẻ thường vẫn là Lv.999.
- Import kiểm tra kiểu dữ liệu của cờ migration trước khi ghi. Giao dịch nhập save và khả năng khôi phục khi ghi thất bại được giữ nguyên.

5. LOẠI BỎ VNĐ POTION

- Gỡ định nghĩa, mô tả, biểu tượng và mục bán VNĐ Potion khỏi game. ID vật phẩm đã nghỉ dùng: vnd_potion.
- Gỡ VNĐ Potion khỏi Marine Fort Raid Shop. Các mục còn lại: EXP Potion, Rich Potion và Speed Potion giá 25 Marine Fort Coins; Speed Battle Potion giá 50 Marine Fort Coins.
- Khi nạp hoặc nhập dữ liệu cũ, xóa stack VNĐ Potion và timer buff của riêng vật phẩm đó, hỗ trợ cả kho dạng mảng và dạng đối tượng.
- Chặn ID đã nghỉ dùng ở các cổng đăng ký vật phẩm, cấp vật phẩm và sử dụng để vật phẩm không xuất hiện trở lại dưới dạng vật phẩm chung không xác định.
- Rich Potion vẫn tồn tại riêng với hiệu ứng +25% VNĐ trong 10 phút. Không chuyển đổi hoặc hoàn tiền stack VNĐ Potion đã xóa.
- Không đổi nhóm 4 potion rơi từ trận thường: Lucky, Speed, Rich và EXP. Speed Battle Potion tiếp tục là vật phẩm shop.

6. CÁC FILE ĐƯỢC ĐIỀU CHỈNH TRONG BẢN VÁ

- cards.js: chỉ số và mô tả Aizen Beyond; mô tả Dark Aurora.
- passives.js: vị trí chuyển hóa, hồi sinh đồng đội gốc, buff hồi sinh Aizen và kết quả sát thương khi hồi sinh.
- app.js: EXP trận thường, migration Lv.10 và tích hợp chuẩn hóa dữ liệu import.
- inventory.js: loại bỏ VNĐ Potion và dọn dữ liệu vật phẩm cũ.
- raid.js: gỡ mục VNĐ Potion khỏi shop.
- README.txt: chỉ ghi các thay đổi của bản cập nhật này.
