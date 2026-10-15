NHẬT KÝ CẬP NHẬT 15/10/2026
AUDIO NỀN, SỬA REIGEN VÀ THÀNH TỰU HỆ SỐ EXP/VNĐ/DROP

1. AUDIO NỀN VÀ KHÔI PHỤC VÒNG LẶP

- Thêm module background.js dùng Web Audio API, khởi tạo sau lần nhấn phím, bấm hoặc chạm đầu tiên của người chơi.
- Chỉ tạo 1 AudioContext và 1 AudioBufferSourceNode chạy loop. Buffer có 1 kênh, dài 1 giây theo sampleRate của thiết bị, toàn bộ mẫu bằng 0; GainNode có gain = 0. Vòng audio hoàn toàn im lặng và không tải tệp âm thanh ngoài.
- Những tương tác tiếp theo dùng lại context đang chạy. Khi context bị suspend, thử resume khi có tương tác mới hoặc trang được khôi phục.
- Hỗ trợ visibilitychange, freeze/resume và pageshow/pagehide. Context được suspend khi trang vào back/forward cache và đóng khi rời trang thật sự; tránh tạo thêm graph sau mỗi lần bấm.
- Khi trang hoạt động lại, đồng bộ đồng hồ, thời tiết, potion và cooldown bằng Date.now(). Khoảng thời gian thực đã trôi qua không bị bỏ mất hoặc cộng hai lần.
- Vòng lặp toàn cục vẫn có đúng 1 lịch 1 giây. Trước khi khôi phục lịch, game xóa interval cũ; lịch lượt chiến đấu cũng được thay thế, không tạo hai timeout cùng đánh một lượt.
- Giữ thời điểm dự kiến của lượt đang chờ. Nếu lượt đã quá hạn, thực hiện tối đa 1 lượt ngay khi lịch chạy lại, rồi tiếp tục đúng khoảng lượt thông thường. Không phát sinh hàng loạt lượt đánh hoặc roll bù cho thời gian trang bị đình chỉ.
- Kiểm tra deadline Time Trial trước khi khôi phục lượt đánh: không cho farm EXP hoặc tiếp tục phòng đã hết giờ. Các mốc 180 giây, 300 giây và lượt Time Trial 2 giây được giữ nguyên.
- Nếu trình duyệt thiếu Web Audio API hoặc từ chối resume, game tiếp tục hoạt động và vẫn dùng cơ chế khôi phục thời gian; không làm hỏng vòng game.

GIỚI HẠN THỰC TẾ CỦA TRÌNH DUYỆT

Audio im lặng không phải cách bảo đảm vượt qua chính sách tiết kiệm tài nguyên. Chrome nêu rõ track im lặng không được tính là âm thanh để miễn timer throttling. Trình duyệt hoặc hệ điều hành vẫn có thể freeze/discard tab, nhất là trên thiết bị di động. Bản vá cung cấp vòng audio theo yêu cầu và cơ chế phục hồi an toàn; không tuyên bố mọi trình duyệt đều chạy nền liên tục hoặc có thể farm khi tab đã bị đóng/discard.

Tài liệu kỹ thuật: https://developer.chrome.com/blog/timer-throttling-in-chrome-88

2. SỬA REIGEN KHÔNG ĐÁNH THƯỜNG

- Nguyên nhân: cờ passiveDisabled của trạng thái solo bị hàm kiểm tra mất lượt xử lý như Stun/Freeze, khiến Reigen không thể tấn công.
- Tách việc tắt passive khỏi việc chặn hành động. Reigen có thể đánh chính bình thường kể cả khi passive đang tắt.
- Giữ nguyên Scam: khi vào trận có đồng đội sống khác, chọn ngẫu nhiên một đồng đội để sử dụng passive; khi vào trận một mình, tăng +200% ATK và +100% max HP, đồng thời tắt passive.
- +200% ATK tương đương ATK x3 so với ngay trước buff. Không thêm lượt đánh miễn phí hoặc thay đổi tỷ lệ crit.
- Stun, Freeze, Snail và các điều kiện kiểm soát lượt hợp lệ vẫn chặn hành động như trước.
- Cập nhật mô tả Scam để nói rõ trạng thái tắt passive không vô hiệu hóa đòn đánh thường. Không đổi HP gốc, ATK gốc, element, artwork hoặc tỷ lệ roll của Reigen.

3. THÀNH TỰU TIME TRIAL: EXP VÀ VNĐ

- Dùng thành tích phòng Normal Time Trial đã vượt cao nhất, không mất khi thất bại và quay về Room 1.
- Room 110: +0,1 EXP Multiplier vĩnh viễn.
- Room 120: +0,1 EXP Multiplier vĩnh viễn.
- Room 130: +0,1 EXP Multiplier vĩnh viễn.
- Room 140: +0,1 EXP Multiplier vĩnh viễn.
- Room 150: +0,1 EXP Multiplier vĩnh viễn.
- Room 160: +0,1 VNĐ Multiplier vĩnh viễn.
- Room 170: +0,1 VNĐ Multiplier vĩnh viễn.
- Room 180: +0,1 VNĐ Multiplier vĩnh viễn.
- Room 190: +0,1 VNĐ Multiplier vĩnh viễn.
- Room 200: +0,1 VNĐ Multiplier vĩnh viễn.
- Mỗi mốc hoàn thành khi vượt phòng tương ứng. Vào Achievements, chọn Time Trial rooms và bấm Claim reward để nhận từng tier, theo luồng nhận thưởng đang có.
- Tổng bonus của 5 mốc EXP là +0,5; tổng bonus của 5 mốc VNĐ là +0,5. Các mốc Luck Room 10–100 được giữ nguyên.
- Save cũ đã vượt các phòng này tự nhận diện mốc đủ điều kiện; không bắt người chơi farm lại. Phần thưởng chưa claim vẫn chờ trong Achievements.

CÔNG THỨC TÍCH HỢP EXP/VNĐ

Gọi Aexp và Avnd là tổng bonus thành tựu đã claim; mỗi giá trị từ 0 đến 0,5. Gọi n là cấp nâng cấp tương ứng trong shop.

- Hệ số EXP chung = (1 + 0,12n + 0,03 x n^1,15 + Aexp) x Pexp.
- Hệ số VNĐ chung = (1 + 0,15n + 0,02 x n^1,20 + Avnd) x Prich.
- Pexp = 1,25 khi EXP Potion hoạt động, ngược lại bằng 1; Prich = 1,25 khi Rich Potion hoạt động, ngược lại bằng 1.
- Bonus cộng vào hệ số gốc trước potion, không nhân thêm một lần sau toàn bộ nâng cấp. Ví dụ n = 0, Aexp = 0,5, không có potion: EXP x1,5; có EXP Potion: EXP x1,875.
- Áp dụng hệ số chung vào những luồng EXP/VNĐ đã dùng hệ số này, gồm EXP trận thường, EXP roll thẻ mới, VNĐ trận thường/Tower và salvage.
- EXP roll trùng giữ quy tắc riêng: floor(50% EXP cần lên cấp x Pexp x (1 + Aexp)).
- EXP Time Trial: tỷ lệ cơ bản mỗi EXP Monster vẫn từ 0,1% đến 1,0% EXP cần cho cấp hiện tại; nay nhân thêm (1 + Aexp). Khi nhận đủ 5 mốc, khoảng thưởng trở thành 0,15% đến 1,5% mỗi monster. EXP lẻ được giữ trong xpCarry; số % trong tổng kết phản ánh tỷ lệ đã tăng.
- EXP Time Trial vẫn không nhận thêm hệ số shop/potion EXP; bonus thành tựu mới là phần bổ sung riêng. Speed Battle Potion vẫn không đổi được lượt 2 giây của Time Trial.
- Các phần thưởng VNĐ cố định từ claim thành tựu giữ nguyên giá trị niêm yết. Normal Time Trial vẫn không cho EXP/VNĐ; Raid vẫn không cho EXP/VNĐ; Tower vẫn không cho EXP.

4. THÀNH TỰU TỔNG SỐ TRẬN THẮNG RAID

- Mốc: 1; 10; 100; 1.000; 10.000; 100.000; 1.000.000; 10.000.000; 100.000.000 trận thắng.
- Mỗi tier đã claim cộng +0,05 Drop Multiplier vĩnh viễn. Có 9 tier, tổng bonus tối đa +0,45, tương đương Drop x1,45.
- Tổng số thắng là tổng trường wins của tất cả loại Raid, không khóa riêng Marine Fort. Thêm bộ lọc Total Raid wins trong Achievements.
- Dữ liệu thắng của các ví Raid hiện có được cộng lại khi nạp game, nên save cũ không mất tiến độ. Đồng bộ nhiều lần không làm tăng lặp số trận thắng.
- Chỉ tính chiến thắng đã commit thành công. Thua trận hoặc chưa lưu được phần thưởng không cộng một chiến thắng mới.
- Mỗi tier nhận thưởng 1 lần qua Claim reward. Claim lại, reload hoặc import không cộng lặp bonus; dùng hợp nhất cờ claimed và biên nhận thưởng trong save chính.

5. PHẠM VI VÀ CÁCH TÍNH DROP MULTIPLIER

Theo lựa chọn đã xác nhận, Drop Multiplier tăng số lượng vật phẩm thường; không tăng tỷ lệ thẻ Secret Raid.

- Áp dụng vào Time Trial Shards, Raid Coins, Tower Coins, Marine Fort Raid Key và các potion rơi từ chiến thắng.
- Không áp dụng vào VNĐ, EXP, thẻ gacha, thưởng thẻ Champion cố định hoặc thẻ Secret Raid. Không tự nhân số lượng hàng mua trong shop.
- Xác suất cơ bản rơi key vẫn là 10% mỗi trận thắng 1v1/4v4; xác suất potion và pity không đổi. Chỉ lượng nhận được khi rơi mới được nhân.
- Secret Raid giữ nguyên tỷ lệ theo độ khó từ 1% đến 10%, phân bố Ace 55%, Marco 35%, Mihawk 10% và quy tắc không rơi lại thẻ đã sở hữu/nhận.
- Speed Battle Potion vẫn không nằm trong nhóm potion rơi từ trận thường.

Công thức số lượng:
  M = 1 + 0,05 x số tier Raid đã claim.
  q = số lượng rơi cơ bản.
  s = q x M.
  k = floor(s).
  f = s - k.
  Nhận k + 1 với xác suất f; ngược lại nhận k.

- Làm tròn xác suất giúp bonus nhỏ vẫn có tác dụng khi q = 1. Với M = 1,05: 95% nhận 1 và 5% nhận 2 khi món đó đã rơi. Với M = 1,45: 55% nhận 1 và 45% nhận 2.
- Nếu s là số nguyên thì nhận đúng s, không bốc thêm số ngẫu nhiên. Ở M = 1, chuỗi RNG nhận vật phẩm vẫn giống bản trước.
- Ví dụ 100 Raid Coins cơ bản ở M = 1,45 cho đúng 145 Raid Coins. Độ khó 1 vẫn có 1 coin cơ bản; khi có bonus có thể nhận 1 hoặc 2 bằng quy tắc trên.
- Giá shop, phí key/vé vào trận và số lượng mỗi lượt mua vẫn giữ nguyên. Mua 1 potion vẫn nhận đúng 1 potion.
- Log chiến đấu, tổng kết Raid/Time Trial, bảng thành tựu và Storage hiển thị bonus hoặc số lượng nhận thực tế.

6. LƯU PHẦN THƯỞNG VÀ CHUYỂN SAVE

- Phần thưởng Raid đang chờ lưu bổ sung baseCoins, dropMultiplier và coins đã nhân/làm tròn. Khi khôi phục pendingReward, dùng nguyên lượng đã lưu, không bốc lại phần lẻ hoặc nhân Drop lần thứ hai.
- Bộ kiểm tra import hỗ trợ pendingReward cũ và mới; dữ liệu mới phải có số coin cơ bản đúng khoảng theo độ khó, hệ số từ 1 đến 1,45 và coin cuối đúng khoảng làm tròn.
- Sau khi commit phần thưởng, cộng wins trong cùng dữ liệu Raid. Thành tựu đọc tổng đã commit, tránh cộng thắng hai lần khi reload giữa bước phát thưởng.
- Bonus EXP/VNĐ/Drop được suy ra từ các tier đã nhận và biên nhận lưu bền, không tăng trực tiếp mỗi lần mở game.
- Giữ nguyên định dạng .acrsave, mã kiểm tra toàn vẹn, cooldown nhập/xuất độc lập 7 ngày và cờ migration Lv.10 hiện có.

7. CÁC FILE ĐƯỢC ĐIỀU CHỈNH

- background.js: module mới cho audio im lặng và sự kiện vòng đời trang.
- passives.js: tách cờ tắt passive khỏi trạng thái mất lượt để sửa Reigen.
- cards.js: làm rõ mô tả Scam của Reigen; không đổi chỉ số thẻ.
- achievements.js: 10 mốc Time Trial mới, 9 mốc Raid và các getter bonus vĩnh viễn.
- inventory.js: tính số lượng drop theo hệ số, dùng làm tròn xác suất.
- raid.js: tổng thắng mọi loại Raid, lượng key/coin và pendingReward đã nhân.
- tower.js: áp dụng Drop Multiplier vào Tower Coins được cấp.
- timetrial.js: nhân Shards và bonus EXP thành tựu riêng cho EXP Monster.
- app.js: phối hợp bonus, đối soát thành tựu, nhãn UI và khôi phục lịch khi trang tiếp tục.
- index.html: nối background.js và thêm bộ lọc thành tựu Raid.
- README.txt: chỉ ghi nội dung bản cập nhật này. Không kèm script test, ảnh kiểm tra hoặc log xác nhận trong gói nguồn.
