NHẬT KÝ SỬA QUYỀN TOWER VÀ GIỚI HẠN TRIỆU HỒI — 22/10/2026
Phiên bản: 20261022-tower-summon-1

1. QUYỀN VÀO TOWER CỦA THẺ TIẾN HÓA

- Bổ sung evolvesFrom cho đủ 8 thẻ tiến hóa. EvolutionSystem cung cấp getBaseCardId và eligibilityLineage để tra nguồn gốc thống nhất; có cache và chặn vòng lặp nguồn gốc.
- Bộ lọc thẻ, bộ chọn mutation và kiểm tra lúc Start Battle đều dùng cùng một phép kiểm tra: thẻ tiến hóa kế thừa quyền Tower của thẻ gốc, đồng thời biến thể đang triển khai vẫn được xét single/double mutation như trước.
- Không yêu cầu còn sở hữu bản thẻ gốc đã dùng để tiến hóa. Chỉ bản thẻ tiến hóa/biến thể thực sự đang sở hữu mới được triển khai.
- Không sao chép HP, ATK, Element, Category hoặc điều kiện roll của thẻ gốc sang thẻ tiến hóa. Không thay đổi thuật toán chọn địch Tower hay đội hình địch đã khóa.

Đối chiếu toàn bộ nhánh:
- True Mahito <- Mahito: kế thừa Eclipse Tower (Eclipsed).
- Gojo Revice <- Gojo Young: kế thừa Heavenly Tower.
- Awakened Doflamingo <- Doflamingo: kế thừa Malevolent Tower.
- Sea Goddess Valkyrie <- Noelle Silva: kế thừa Raining Tower.
- Jason 13th <- The Trapper: kế thừa quyền của The Trapper.
- Saber Knight <- Saber: kế thừa quyền của Saber.
- Yuno Spirit <- Yuno: kế thừa quyền của Yuno.
- Prime Garp <- Garp: kế thừa quyền của Garp.

Mahito giữ nguyên weather Eclipsed theo thông số đã đính chính. Không bổ sung quyền Malevolent cho biến thể Normal của Mahito/True Mahito. Biến thể có mutation phù hợp vẫn được vào Weather Tower tương ứng theo luật chung. Các nhánh gốc Normal không tự được vào mọi Weather Tower khi không có mutation phù hợp.

2. GIỚI HẠN SUMMON/CLONE THEO ĐỘI HÌNH THỰC

- Thêm companions.js, chỉ giữ trạng thái trong trận. Mọi đường tạo clone, summon, puppet, robot hoặc chuyển hóa địch đều phải qua kiểm tra trước khi thêm đơn vị vào hàng đợi.
- Đếm đơn vị còn sống trên sân: HP > 0, chưa defeated, còn nằm trong đội hình, đúng chủ sở hữu và cơ chế tạo. Không dựa vào độ dài cache clones của nội tại. Đổi/đánh cắp nội tại hoặc xóa cache không làm mất số đơn vị đã tạo.
- Giữ riêng giới hạn số đơn vị đang sống và số lần tạo trong cả trận. Đơn vị đã chết không chiếm ô đang sống; giới hạn cả trận không được làm mới do thay nội tại.

Các giới hạn được thực thi:
- Kamen Rider Dark Decade: tối đa 2 summon còn sống do thẻ đó tạo, tính cả summon từ nội tại đã đánh cắp. Đơn vị chuyển hóa vẫn đứng ngay trước Dark Decade. Nội tại Dark Aurora được sao chép cũng giữ giới hạn 2 đơn vị chuyển hóa riêng của nó.
- Alucard: tối đa 3 Hermes Clone còn sống trên mỗi chủ sở hữu.
- Funny Valentine: tối đa 10 D4C Clone còn sống trên mỗi chủ sở hữu.
- Reagan Ridley: tối đa 10 robot còn sống trong cùng một đội; nhiều Reagan không nhân giới hạn đội lên.
- Mechamaru: tối đa 1 puppet còn sống trên mỗi chủ sở hữu.
- Madara Lubu: tối đa 3 Divine Steed Clone còn sống và tối đa 3 lần tạo trong trận, giữ kích hoạt last-stand một lần.
- Iskandar: tối đa 3 đơn vị chuyển hóa trong trận, đồng thời không vượt 3 đơn vị còn sống do cơ chế này tạo.

- Các cơ chế vốn không có giới hạn số lượng trong thông số của gói nguồn vẫn giữ luật đó: Dagon, True Mahito, Naruto Clone, Ghost, Ito Clone, Shadow của Sung Jin Woo, Igris, Metal Cooler và Jin Mori. Chúng vẫn đi qua bộ kiểm tra chung và quy tắc chống đệ quy; không áp thêm trần số lượng tùy ý.
- Clone/summon không thể tiếp tục tạo clone/summon. Các thẻ cấm clone/hồi sinh vẫn bị loại khỏi nguồn triệu hồi như trước.
- Geto Young không sinh đơn vị trên sân: Summon Technique là ba đòn kỹ năng thay thế. Các đòn này được giữ nguyên, không bị tính nhầm thành summon.
- Spooky passives không có đường tạo đơn vị riêng; nội tại mượn/đánh cắp dùng chung bộ kiểm tra tại engine.

3. KIỂM TRA CÁC NỘI TẠI HỒI SINH

- Dark Decade chỉ hồi sinh đồng đội gốc, không hồi sinh clone/summon; tối đa 2 lần trên mỗi đồng đội trong trận. Các đồng đội gốc hồi sinh không bị tính nhầm thành summon.
- Dante và Josuke giữ giới hạn hồi sinh đồng đội một lần mỗi chủ sở hữu/trận. Bộ đếm nằm độc lập với cache nội tại để không được làm mới khi nội tại thay đổi.
- Dante không chọn clone/summon để hồi sinh vượt giới hạn sân. Khi hồi sinh đồng đội gốc, cập nhật trạng thái xử lý cái chết để các lần chết hợp lệ tiếp theo được xử lý đúng.
- Các lần tự hồi sinh giữ nguyên cơ chế hiện có; không tạo thêm một ô thẻ mới.

4. KIỂM TRA VÀ PHẠM VI BẢN SỬA

- Kiểm tra 8 nhánh tiến hóa với Normal, các Weather Tower và nhiều single/double mutation; triển khai thực tế 4 True Mahito vào Eclipse và 4 Gojo Revice vào Heavenly.
- Thử Dark Decade hạ nhiều địch, mất summon rồi tạo thay thế và đánh cắp Dagon; không vượt 2 summon đang sống.
- Thử xóa cache D4C/Alucard, nhiều Reagan cùng đội, reset cache Mechamaru và giới hạn hồi sinh độc lập với cache.
- Chạy 185 trận giả lập, 2.960 lượt; kiểm tra giới hạn sân trong 238.336 lượt đối chiếu. Không phát hiện lỗi runtime hoặc HP/ATK không hữu hạn trong các kiểm tra này.
- Kiểm tra cú pháp đủ 39 module JavaScript, đăng ký nội tại của 167 thẻ và roundtrip save .acrsave.
- Giữ nguyên yêu cầu EXP lên cấp, công thức chỉ số theo level và EXP Time Trial gốc 0,1%–1,5% không nhân EXP Multiplier. Không thay đổi dữ liệu tiến trình hoặc reset level.

Modified Files Note

- companions.js: Tạo mới bộ kiểm tra summon/clone và ngân sách hồi sinh theo trận, độc lập với cache nội tại.
- cards.js: Thuộc tính evolvesFrom cho 8 thẻ tiến hóa; mô tả rõ giới hạn 2 summon của Dark Decade.
- evolution.js: Tra cứu cha và chuỗi nguồn gốc có cache, dùng chung cho quyền triển khai.
- tower.js: Kế thừa quyền Tower khi lọc thẻ/biến thể và kiểm tra triển khai; bổ sung giải thích trong hint.
- passives.js: Nối toàn bộ đường tạo đơn vị với bộ kiểm tra sân; củng cố các giới hạn hồi sinh.
- reagan.js: Kiểm tra robot theo giới hạn chung 10 đơn vị còn sống trong đội.
- shibuya.js: Kiểm tra quyền tạo đơn vị trước khi triệu hồi Dagon/puppet/đơn vị chuyển hóa.
- index.html: Nạp companions.js trước engine; cập nhật mã phiên bản URL script/style.
- startup.js: Chẩn đoán thiếu companions.js khi tải bản cập nhật không đầy đủ.
- README.txt: Changelog riêng của bản sửa này và danh sách tệp thay đổi.

Gói đầy đủ gồm 43 tệp nguồn: 39 JavaScript, index.html, styles.css, passives.css và README.txt. Không kèm Excel, test runner, log kiểm thử hoặc ảnh/âm thanh nhị phân.
