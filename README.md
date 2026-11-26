# Update 35.0 — Sailing Sea

Bản cập nhật bổ sung **Sailing Sea**, chế độ roguelike hải chiến Battle Royale dành riêng cho Anime Card RNG. Một người chơi và 19 AI cùng khám phá đại dương được tạo ngẫu nhiên theo seed, tuyển thuyền viên, chiếm đảo, nâng cấp tàu, săn quái biển và tranh Bounty.

Bản vá được xây dựng trên **Update 34.5.1 (Standard Battle Hotfix)**. Toàn bộ tiến độ Sailing Sea được lưu riêng; không sử dụng thẻ đang sở hữu, cấp độ, Mutation, Relic cá nhân hoặc tài nguyên của tài khoản chính. Không cần bổ sung ảnh đại dương, ảnh tàu, âm thanh hay bất kỳ tệp nào trong thư mục assets.

## 1. Vào chế độ và điều khiển

Trên thanh **Operations** ở trang chính, nút **Sailing Sea — Naval Royale** nằm giữa Ball vs Ball và Inventory. Cũng có thể vào chế độ qua **Update Logs → Update 35 → Jump In → Sailing Sea**.

- **New voyage:** tạo seed mới và bắt đầu draft. Có hộp xác nhận nếu đã tồn tại một chuyến hải hành.
- **Resume voyage:** tiếp tục đúng trạng thái đã lưu; nếu chuyến đi đã kết thúc, có thể xem lại kết quả.
- Khi bắt đầu, người chơi chọn một trong **3 thẻ Secret khác nhau** được bốc ngẫu nhiên từ danh mục dùng chung của Auto Chess. Không yêu cầu sở hữu thẻ trong Card Index.
- **Direct Control:** WASD hoặc phím mũi tên; trên điện thoại/màn hình cảm ứng tự hiện joystick kéo thả.
- **Click / Tap to Move:** bấm mặt biển hoặc Ocean Radar để đặt waypoint. Tàu tự hướng về điểm tới, tránh bãi đảo khi đi ngang qua. Waypoint được lưu cùng chuyến đi.
- Có thể đổi hai kiểu điều khiển bằng nút **Direct / Point** ở góc dưới trái, trong **Settings**, nút **Control** trên bảng quyết định hoặc phím **C**.
- Phím **1–5** mở lần lượt Crew & Deploy, Dock / Capture Island, Craft Relic, Upgrade Ship, Recruit Rates & Guide.
- **P** tạm dừng/tiếp tục; **Escape** đóng bảng tùy chọn hoặc mở Settings từ mặt biển. Khi đang ở quyết định bắt buộc, Escape có thể tạm dừng.
- Để rời đảo, dùng Dock / Flag → **Undock & Sail**. Nếu đến gần một tàu đối thủ, nút **Board [tên thuyền trưởng]** xuất hiện phía trên dãy nút hành động.
- **Save** lưu ngay. **Save & Exit / Exit** lưu trước khi quay về trang chính. Có thể thoát ngay cả khi đang giao tranh hoặc đang chọn thẻ tuyển mộ.

## 2. Đồng hồ và Difficulty

Một ngày trong Sailing Sea dài đúng **360 giây hoạt động**:

| Đại lượng | Quy đổi |
| --- | --- |
| 24 giờ trong game | 6 phút thực |
| 1 giờ trong game | 15 giây thực |
| 1 giây thực | 4 phút trong game |
| 15 ngày | 5.400 giây, tương đương 90 phút hoạt động |

Đồng hồ chạy khi đang đi biển, ở đảo hoặc trong giao tranh. Bản draft đầu tiên, các quyết định bắt buộc (chọn đội trước trận, báo cáo, tuyển mộ), thao tác Pause, tab bị ẩn và thời gian đã thoát game đều tạm dừng toàn bộ thế giới. Khi đó AI, thời gian, farm Material và tiến độ hồi phục cùng dừng, tránh lợi dụng việc treo bảng lựa chọn để sống qua một ngày hoặc tích tài nguyên.

Difficulty là một giá trị chung của chuyến hải hành, bắt đầu tại **1.00**. Công thức:

- Mỗi bình minh mới: D ← D + 1.00.
- Bất kỳ thuyền trưởng nào đánh thắng Pirate Crew: D ← D × (1 + r), với r bốc đều trong khoảng 0.005–0.03 (tăng 0.5–3%).
- Bất kỳ thuyền trưởng nào đánh thắng Sea Beast: D ← D × (1 + r), với r bốc đều trong khoảng 0.01–0.10 (tăng 1–10%).
- Chiến thắng của AI ngoài màn hình cũng tác động tới Difficulty. Thua, hòa hoặc rút lui không tăng Difficulty theo công thức chiến thắng.
- Giá trị luôn giữ đầy đủ độ chính xác khi tính toán, HUD hiển thị hai chữ số thập phân.
- Khi D ≥ 10, cờ khóa sửa tàu của toàn bộ chuyến đi được bật vĩnh viễn. Hồi máu thuyền viên vẫn hoạt động ở đảo, nhưng Ship HP không thể hồi bằng sửa tàu nữa, kể cả sau tải lại.

## 3. Đại dương, đảo và vùng nguy hiểm

- Bản đồ có kích thước **4.000 × 4.000** đơn vị thế giới. Mỗi seed tái tạo cùng vị trí, hình dáng và tên của 33 đảo; quyền sở hữu đảo được lưu riêng.
- Mặt biển, bãi cát, cây cọ, rạn san hô nông màu ngọc lam, thân tàu, buồm, sóng và vệt nước trắng đều vẽ bằng Canvas 2D. Không có tệp ảnh map mới.
- Camera theo tàu người chơi. Tàu không đi xuyên đảo hoặc vượt khỏi giới hạn thế giới. Cây/cát/đảo được tạo và cache trước lần sử dụng; hiệu ứng nước được lát lặp từ một texture nhỏ.
- Tốc độ đi biển tối đa mặc định: **112 đơn vị/giây**. Trong Storm Zone nhân 0.60, tương đương **67.2 đơn vị/giây** (giảm 40%).
- Mỗi ngày tạo lại 7 Danger Zones (biểu tượng đầu lâu) và 3 Storm Zones (mây sét), Storm nhỏ hơn và hiếm hơn. Vị trí được bốc theo seed + số ngày và loại trừ đảo, khoảng ven bờ nơi tàu neo đậu và vùng đã đặt trước đó.
- Đi vào Danger Zone: có thể gặp Pirate Crew sau khoảng 3–8 giây ở vùng. Storm Zone: Sea Beast sau khoảng 5–11 giây. Ra khỏi vùng sạch hoặc đổi ngày đặt lại bộ đếm tiếp xúc. Sau giao tranh có một khoảng nghỉ trước khi tái gặp địch.
- Thuyền đang ở gần bờ (bán kính đảo + 64 đơn vị) có thể Dock. Tàu được đặt ngay ngoài bờ, không chồng lên đất.

### Pirate Crew — Danger Zone

Thành phần địch được bốc theo Difficulty, hoàn toàn từ danh mục thẻ Auto Chess độc lập.

| Difficulty D | Số thẻ địch | Phân bố rarity |
| --- | --- | --- |
| 1 ≤ D < 2 | 3–4 | 100% Common |
| 2 ≤ D < 4 | 3–5 | 56% Common, 32% Rare, 12% Epic |
| 4 ≤ D < 6 | 4–5 | 9% Common, 38% Rare, 38% Epic, 15% Legendary |
| 6 ≤ D < 8 | 5–6 | 8% Rare, 36% Epic, 36% Legendary, 20% Mythic |
| 8 ≤ D < 10 | 5–7 | 8% Epic, 42% Legendary, 40% Mythic, 10% Secret |
| D ≥ 10 | 6–7 | 64% Mythic, 36% Secret |

Sau khi lấy chỉ số Auto Chess, địch Pirate nhận hệ số HP = 1 + 0.045 × (D − 1), ATK = 1 + 0.035 × (D − 1), làm tròn theo hệ thống combat.

Thắng Pirate Crew cho **20–45 Material**, 90 Bounty, tăng Difficulty và mở draft tuyển mộ từ chính đội địch vừa thua. Material được giữ trong túi của chuyến đi, không nhận thêm vật phẩm vào inventory chính.

### Sea Beast — Storm Zone

Mỗi cuộc chạm trán có một Sea Beast. Boss dùng nội tại ngẫu nhiên của thẻ Mythic hoặc Secret; những nội tại tự hiến tế ngay lúc vào trận không phù hợp với boss đơn độc được loại khỏi pool boss. Đội hình, hiệu ứng và tính toán thật vẫn dùng engine Auto Chess.

- HP = HP Auto Chess × [2.8 + 0.21 × (D − 1)].
- ATK = ATK Auto Chess × [1.28 + 0.066 × (D − 1)].
- Thắng boss: +320 Bounty, +1 Sea Beast defeated và Difficulty tăng theo hệ số 1.01–1.10.
- Sea Beast là mục tiêu bắt buộc để nâng Ship Lv. 3, không mở draft Pirate.

## 4. Tàu, triển khai đội hình và tuyển mộ

| Cấp tàu | Tối đa thẻ trong crew | Điều kiện |
| --- | --- | --- |
| Lv. 1 — Sloop | 5 | Bắt đầu, 100/100 Ship HP |
| Lv. 2 — Brigantine | 7 | 750 Material |
| Lv. 3 — Galleon | 10 | 2.000 Material **và** ít nhất 5 Sea Beast defeated |

Sức chứa chỉ tăng khi trả đủ chi phí; nâng cấp không hồi Ship HP và không vượt quá Lv. 3. Người chơi có thể kiểm tra điều kiện bất cứ lúc nào bằng Upgrade Ship. Nút tròn hiển thị **READY** khi đã đủ điều kiện.

**Crew & Deploy** hiển thị thẻ, rarity, Element, vai trò, nội tại, Relic, HP và Stamina thật. Bấm chân dung để chọn hoặc bỏ chọn, Select All để triển khai toàn bộ thẻ còn sống. Trước mỗi encounter có thể chọn từ **1 đến toàn bộ số thẻ đang còn sống**. Thẻ dự bị không bị kéo vào trận, giúp giữ tài nguyên cho những trận quan trọng. Không thể bắt đầu nếu chưa chọn được ít nhất một thẻ sống; có thể rút lui và về đảo để hồi phục.

### Tỷ lệ bắt giữ thẻ

Mỗi lần thắng Pirate Crew, hệ thống bốc 3 ứng viên từ thẻ của đội vừa thua (ưu tiên ba tên khác nhau nếu đủ). Người chơi chỉ chọn **một lần thử bắt giữ**; tỷ lệ hiển thị trước khi chọn. Kết quả được bốc bằng RNG của chuyến đi và lưu cùng draft, nên tải lại không đổi lần thử.

| Rarity | Ship Lv. 1 | Ship Lv. 2 | Ship Lv. 3 |
| --- | ---: | ---: | ---: |
| Common | 100% | 100% | 100% |
| Rare | 100% | 100% | 100% |
| Epic | 100% | 100% | 100% |
| Legendary | 75% | 90% | 100% |
| Mythic | 45% | 75% | 95% |
| Secret | 20% | 50% | 80% |

- Bắt giữ thành công và có chỗ: thêm thẻ mới đầy HP/Stamina.
- Nếu crew đầy: thay một thẻ đang có, hoặc salvage thẻ vừa bắt để nhận **10 + 5 × tier** Material (tier Common=0, Secret=5). Khi thay thẻ, Relic đang đeo của thẻ cũ được đưa về locker, không bị mất.
- Nếu thất bại, lần thử kết thúc, không được chọn lại/reroll miễn phí.

## 5. Combat Auto Chess, HP và Stamina

Sailing Sea dùng phép tính chỉ số của Auto Chess, không dùng HP/ATK tuyệt đối hoặc Level từ Card Index chính:

1. Tính tier t của rarity (Common=0, Rare=1, Epic=2, Legendary=3, Mythic=4, Secret=5).
2. w = clamp(HP gốc / (HP gốc + 5 × ATK gốc), 0.15, 0.85).
3. HP = round([900, 1250, 1650, 2200, 2800, 3600][t] × (0.7 + 0.6w)).
4. ATK = round([100, 140, 185, 245, 315, 410][t] × (1.3 − 0.6w)).
5. Sau đó áp dụng điều kiện Relic, trait, hiệu ứng kỹ năng thật và hệ số địch nếu có.

Trận boarding diễn ra trên lưới chiến thuật 7×8 của Auto Chess. Melee, Ranged, Support di chuyển và tấn công theo vai trò; native passive, summon, clone, shield, crit, debuff, hồi sinh trong trận, Potara và hitbox Pierce/Blast/Strike dùng cùng engine hiện có. Với nội tại sao chép ngẫu nhiên, cả hai phía dùng chung pool nội tại hợp lệ của mode, không phụ thuộc thẻ đã sở hữu trong tài khoản.

**Chỉ trong Sailing Sea**:

- Element thuận: 1.5×; Element nghịch: 0.75×; trung tính: 1×. Các đường tính sát thương và DoT dùng hệ số riêng của trận; luật 3× và 1/3 của các mode cũ được giữ nguyên.
- Không còn thanh Energy hoặc cơ chế sinh Energy của Auto Chess. Những phần trait chỉ sinh Energy không được cộng vào một thanh tài nguyên thay thế. Các bonus và hiệu ứng combat còn lại của trait vẫn hoạt động.
- Tất cả thẻ dùng Stamina 0–100. Mỗi lượt hành động được thực hiện tiêu hao tối đa 4 Stamina; một lượt đang còn Stamina được hoàn thành dù vừa tiêu hết phần cuối.
- Mỗi lần hoàn tất bốn lượt tấn công có trả Stamina, thẻ có thể tự dùng role skill nếu còn tối thiểu 20 Stamina; tiêu hao thêm đúng 20. Giữ kỹ năng gốc Piercing Pulse, Arcane Blast, Crescent Strike, Guardian Pulse và hiệu ứng trait liên quan khi dùng skill.
- Tại 0 Stamina, trạng thái **EXHAUSTED**. Không dùng active cast, offensive replacement hay follow-up phát sinh từ lượt tấn công cạn sức; vẫn đánh thường với hệ số sát thương 0.75 để trận không bị kẹt. Phản ứng phòng thủ, bộ đếm thụ động, hiệu ứng đã tạo, DoT và hiệu ứng vào trận vẫn được xử lý bởi native engine.
- Các passive kinh tế/EXP/phần thưởng tài khoản không tạo thêm tiền, Gem hoặc EXP ngoài chuyến đi. Material và Bounty dùng luật cố định của Sailing Sea.
- Trận tối đa 60 giây theo Auto Chess. Khi hết giờ, dùng tỷ lệ HP đội và sát thương để quyết định thắng/thua/hòa như engine chiến thuật hiện tại.

HP và Stamina của các thẻ **thật đã triển khai** được chuyển trở lại crew khi kết thúc. HP được quy về tỷ lệ HP hiện tại trên max HP dài hạn của thẻ; việc có thêm buff max HP tạm thời từ đội hình không tự chữa vết thương khi chuyển trận. Relic đã mặc vẫn được tính ở max HP dài hạn. Các cơ chế tiến độ Cartoon theo trận/chuyến đi (như Gumball, Serious Mode) được giữ đúng dữ liệu của mode. Khi Potara hợp thể, kết quả của cả hai thẻ gốc được lưu; Stamina của hợp thể bắt đầu bằng mức thấp hơn của hai thành viên và được chuyển về cả hai, không bơm miễn phí Stamina. Clone/summon tạm thời không trở thành thẻ tuyển mộ vĩnh viễn.

## 6. Hồi phục, farm đảo, cờ và Relic

### Hồi phục

| Trạng thái | HP thuyền viên | Stamina | Ship HP |
| --- | --- | --- | --- |
| Đi biển giữa các trận | Không hồi | +1.5/giây | Không sửa |
| Dock an toàn | +5% max HP/giây | +6/giây | +2/giây nếu chưa khóa |
| Đã bị hạ gục | Không hồi sinh ở biển | Có thể hồi Stamina | — |

Thẻ bị hạ gục hồi sinh đầy HP sau **45 giây neo đậu an toàn liên tục**. Rời đảo trước khi đủ thời gian sẽ đặt lại thời gian hồi sinh đang tích lũy. Trong giao tranh, crew đang triển khai dùng HP/Stamina của combat, không nhận hồi tự nhiên từ đảo hoặc từ việc di chuyển. Các thẻ dự bị ở biển vẫn hồi 1.5 Stamina/giây; các hiệu ứng hồi máu và hồi sinh nội tại trong trận chạy theo luật riêng của thẻ.

### Material và đảo

- Khi dock an toàn, mỗi giây thu ngẫu nhiên từ 1 đến 3 Material, trung bình 2/giây. Ví dụ 750 Material cần trung bình khoảng 375 giây (6 phút 15 giây, gần một ngày).
- Tên và icon Material Time Trial có sẵn (Silver Ore, Dark Dust, Dragon Tooth, v.v.) được dùng để minh họa lượt thu hoạch. Tuy nhiên, chỉ có **một đơn vị Material chung** để thanh toán trong Sailing Sea; không trừ hay cộng từng loại nguyên liệu vào inventory chính.
- Đảo có kiểm tra phục kích định kỳ, lần đầu khoảng 38–68 giây sau khi dock, sau đó mỗi 36–65 giây. Mỗi lần kiểm tra có 16% khả năng xuất hiện Pirate Raid. Ngoài ra, AI có thể tới tranh cờ hoặc chủ động boarding.
- Khi bị phục kích, **Defend Island (Fight)** mở trận triển khai đội; **Flee to Sea** rời đảo ngay, không trừ HP riêng cho thao tác chạy khỏi đảo. Nếu một AI đủ cấp đang tranh cờ, nó có thể chiếm đảo bạn bỏ lại.
- Từ Lv. 2, dùng Plant Flag để chiếm đảo. Nếu chủ cờ đang neo tại đảo đó, phải thắng trận tranh chấp trước. Nếu chủ cũ vắng mặt, AI hoặc người chơi đủ cấp có thể thay cờ sau khi cập đảo.
- Mỗi đảo sở hữu gửi **0.5 Material/giây = 30/phút** khi tàu của bạn đang ở biển. Cầm cờ còn cho +0.5 Bounty/giây, kể cả khi đang dock. Quyền sở hữu không tồn tại sau khi chủ cờ chìm tàu.

### Forge Relic

Khi dock, mở Craft Relic. Chọn Relic và thuyền viên cần trang bị hoặc để vào Relic locker. Mỗi lần craft tạo đúng một **Legendary Unique** bằng bộ roll substat và Unique effect thật của RelicSystem; không sao chép một roll cố định.

Chi phí quy đổi từ công thức gốc: max(90, ceil(0.25 × tổng số nguyên liệu trong recipe)). Jackal Guns có recipe riêng cho Sailing Sea (180 Material), không thay đổi luật drop của game chính.

| Relic | Material |
| --- | ---: |
| Eternal Eye | 103 |
| Potara Earring | 390 |
| God Leaf | 132 |
| Nail | 103 |
| Millennium Puzzle | 156 |
| Enten Blade | 165 |
| O.D.M. | 175 |
| Bomb | 125 |
| Jackal Guns | 180 |
| Fate Scythe | 125 |
| Rabadon Hat | 125 |
| Alien Watch | 125 |

Mỗi thẻ mang tối đa một Relic, còn Relic không dùng nằm trong locker. Sau khi craft, xem giá trị roll chính xác, điều kiện Element/Category/Unique và thay Relic qua Crew & Deploy. Luật tương thích gốc và bonus Unique +20% chỉ số trong Auto Chess được giữ. Đổi trang bị không tự làm đầy HP đã mất. Các hiệu ứng chỉ liên quan đến EXP tài khoản không tác động vào tiến độ Sailing Sea.

## 7. AI, hư hỏng tàu, Bounty và chiến thắng

Có 19 AI chia thành 5 Island Farmers, 5 Danger Raiders, 5 Storm Beast Hunters và 4 Bounty Hunters. Tất cả bắt đầu với một thẻ Secret, tàu Lv. 1, 100 Ship HP và 0 Material/Bounty, rồi dùng các quy tắc chung để farm, tuyển mộ, craft, nâng cấp, hồi phục, tranh cờ và đánh nhau.

- **Island Farmer:** ưu tiên farm đủ 750 Material, nâng Lv. 2 và cắm cờ; tìm đảo có lợi và giữ thu nhập thụ động.
- **Danger Raider:** ưu tiên Pirate Crew để tuyển đội, tìm tàu yếu hơn hoặc đảo đối phương có thể chiếm.
- **Storm Hunter:** xây đủ sức mạnh rồi tìm Storm Zone để thu Sea Beast victories; tích đủ Material khi đã gần Lv. 3.
- **Bounty Hunter:** theo dõi Golden Bounty hằng ngày, hướng tới mục tiêu khi đủ khả năng, hồi phục hoặc tăng sức mạnh khi cần.

AI chỉ xử lý giao tranh ngoài màn hình bằng mô hình sức mạnh nhẹ. Công thức ước lượng mỗi thẻ:

P = sqrt(HPmax × ATK) × (HP/HPmax)^0.68 × (0.75 + 0.25 × Stamina/100) × (hệ số Element trung bình đối địch)^0.45 × (1 + 0.016 × tier).

Tổng đội nhân thêm (1 + min(0.42, 0.025 × tổng tier trait hoạt động)). So sánh log((P_A+1)/(P_B+1)) với nhiễu ngẫu nhiên trong [-0.32, 0.32], vùng hòa khi trị tuyệt đối <0.045. Giao tranh ước lượng có thời lượng 23–43 giây và gây hao hụt HP/Stamina cho đội tham chiến. Mô hình dựa trên rarity, Difficulty, Relic, trait và trạng thái hiện tại, không giả định AI có đội đầy máu. AI biết tránh các vùng quá nguy hiểm, ưu tiên hồi phục, và chịu chi phí/rủi ro thật nếu vẫn gặp địch hay thua trận. Còn trận của người chơi luôn chạy combat Auto Chess đầy đủ, không dùng kết quả ước lượng.

### Ship HP

- Tàu có tối đa 100 HP ở cả ba cấp.
- Khi thua trận, nhận lượng hư hỏng hull = round(clamp(12 + 0.75 × Difficulty lúc bắt đầu encounter, 13, 34)).
- Hòa gây hư hỏng bằng 55% công thức trên, làm tròn; trong giao tranh giữa hai tàu, cả hai chịu hư hỏng.
- Retreat khi gặp Pirate/Beast ngoài biển mất 6 Ship HP; retreat trước một captain mất 8 Ship HP. Riêng Flee to Sea khi đảo bị phục kích sẽ rời đảo ngay như đã mô tả.
- Ship HP ≤ 0: chìm tàu và bị loại. Không có Last Stand hoặc sàn 1 HP cho hull.
- Tàu được sửa hull nhờ dock +2 HP/giây trước Difficulty 10; cờ khóa vĩnh viễn sau ngưỡng này áp dụng cho tất cả captains.

### Golden Bounty

- +90 Bounty khi thắng Pirate Crew; +320 khi thắng Sea Beast; +0.5 Bounty/giây trên mỗi đảo đang giữ cờ.
- Chìm một tàu bình thường: kẻ gây chìm nhận 120 Bounty + 35% Bounty nạn nhân (phần 35% làm tròn xuống).
- Chìm **Wanted Target**: nhận 120 Bounty dành cho vụ chìm tàu và cướp chính xác **100% Bounty của mục tiêu**.
- Ngày 1 và mỗi bình minh tiếp theo, chọn đều một captain còn sống làm Wanted Target. Mục tiêu có vương miện/vòng vàng trên biển, chỉ hướng khi ngoài màn hình, marker vàng trên radar và hàng được tô sáng trong leaderboard.
- Nếu mục tiêu sống hết ngày, Bounty hiện tại nhân đôi trước bình minh. Nếu chìm trước đó, không chọn Wanted mới giữa ngày; đợi sang ngày mới.
- Khi tàu người chơi hết HP: Defeat ngay. Nếu người chơi là tàu cuối cùng còn nổi: Victory ngay.
- Kết thúc ngày 15: người sống sót có Bounty cao nhất thắng. Nếu bằng nhau, ưu tiên Ship HP cao hơn, số tàu đã đánh chìm, sau đó ID thuyền trưởng để phân định ổn định.

## 8. Giao diện và lưu game

HUD lấy cảm hứng từ hải chiến Plunder nhưng dùng các hình vẽ thủ tục riêng: nước xanh sâu, bãi biển cát, buồm, mái gỗ, viền đồng/vàng và nền tối trong suốt. Giao diện thích ứng máy tính, điện thoại dọc và ngang.

- Góc trái trên: tên Captain, số tàu còn sống, Lv. tàu, Ship HP, biểu tượng khóa đỏ khi sửa tàu bị vô hiệu, số thuyền viên.
- Giữa trên: Day, giờ/phút và Difficulty.
- Góc phải trên: Top 5 Bounty cùng thông báo Wanted Target.
- Góc trái dưới: Material, lượt thu gần nhất với icon nguyên liệu, vùng đang đứng, số cờ, Sea Log cuộn riêng và các nút Save, Settings, Direct/Point, Exit. Trên điện thoại có thể mở rộng Sea Log.
- Giữa dưới: năm nút tròn Crew, Dock/Flag, Forge, Upgrade, Guide. Upgrade sáng khi đã đủ điều kiện; thông tin boarding chỉ hiện khi đối thủ ở gần.
- Góc phải dưới: Ocean Radar toàn bản đồ, đảo, vùng đầu lâu, vùng bão, tàu gần/xa và Wanted Target. Click/tap radar đặt waypoint khi dùng kiểu điều khiển Point.
- Giao tranh có bàn chiến thuật, chân dung, HP, Stamina, trạng thái, đường/vùng hiệu ứng AoE và Boarding Log. Không hiển thị generic Energy.

Lưu cục bộ bằng hai khóa riêng:

- anime_card_rng_sailing_sea_v1 — trạng thái chuyến đi (seed, RNG, thời gian, Difficulty, các captains, đảo/cờ, vùng, Bounty, crew, Relic, encounter, draft, job AI, checkpoint combat).
- anime_card_rng_sailing_sea_settings_v1 — kiểu điều khiển.

Tự lưu mỗi 5 giây hoạt động và tại các mốc quan trọng (chọn thẻ, nâng cấp, craft, tranh cờ, chuyển ngày, giao tranh, nhận tuyển mộ, tạm dừng/thoát). Với trận đang chạy, lưu đội hình ban đầu của encounter, seed và thời điểm mô phỏng đã xác nhận. Khi Resume, worker dựng lại trận tới checkpoint đó bằng cùng engine và tiếp tục, không cấp lại loot, không roll lại lựa chọn tuyển mộ. Nếu worker không dùng được, có đường chạy dự phòng bằng chính engine đó. Khi lưu thất bại vì dung lượng trình duyệt, chuyến đi tạm dừng để có thể dọn chỗ và Save lại; thao tác chi tiêu chưa lưu thành công được hoàn nguyên.

Chế độ này không đồng bộ chuyến đi lên Firestore, không thay đổi save của Standard Battle, Auto Chess, Ball vs Ball, inventory hay tiến độ sở hữu thẻ. Lưu và Resume áp dụng trong cùng trình duyệt/origin của game.

## 9. Danh sách tệp trong patch

### Module mới

| Tệp | Chức năng |
| --- | --- |
| sailing_map.js | Sinh bản đồ 4.000×4.000 theo seed, đảo/vùng, điều hướng, chuyển động, Canvas art, wake, camera và radar. |
| sailing_combat.js | Chuẩn hóa roster, draft, rarity/scaling địch, Relic, capture, combat thật và ước lượng combat AI. |
| sailing_rules.js | Trạng thái chuyến đi, đồng hồ, Difficulty, hồi phục, kinh tế, đảo/cờ, Bounty, hư hỏng tàu, tuyển mộ, quyết toán và save validation. |
| sailing_bots.js | Bốn chiến lược của 19 AI, tìm đường, lập kế hoạch, phục kích, boarding và mô phỏng ngoài màn hình. |
| sailing_ui.js | Toàn bộ HUD, màn Home/Resume, draft, crew, forge, ship upgrade, guide, settings, tuyển mộ, combat board, báo cáo và tương tác touch. |
| sailing_main.js | Vòng đời mode, vòng mô phỏng cố định, bàn phím/joystick/waypoint, commit lưu, khôi phục trận, Save & Exit. |
| sailing.css | Giao diện hải chiến riêng, khung tối trong suốt, nút hành động tròn và responsive. |

### Tệp hiện có đã sửa

| Tệp | Thay đổi |
| --- | --- |
| index.html | Nút Sailing Sea, vùng modal riêng, khai báo CSS và các module; phiên bản tải tệp mới. |
| app.js | Bridge vào/ra mode và quản lý khóa thao tác của game chính, đường dẫn từ Update Logs. |
| game-ui.css | Căn lại thanh Operations để chứa nút mới, giữ các mode cũ trên desktop/mobile. |
| update_logs.js | Mục Update 35 và Jump In hướng tới Sailing Sea. |
| elements.js | Thêm tham số hệ số Element tùy chọn cho combat độc lập; giá trị mặc định không đổi. |
| passives.js | Đường tính Element riêng theo runtime và đòn đánh thường khi cạn Stamina, cổng hành động chỉ áp dụng cho Sailing Sea. |
| autochess_combat.js | Tùy chọn Sailing Sea trong engine: HP/Stamina đầu/cuối, skill, sync worker và replay checkpoint. Auto Chess thông thường vẫn dùng Energy. |
| autochess_synergies.js | Giữ trait thật; chỉ tắt sinh Energy và đổi sang chi phí Stamina khi bật tùy chọn Sailing Sea. |
| relic_combat.js | Ghi nhận thẻ gốc và Stamina của Potara khi hợp thể trong Sailing Sea, giữ luật hợp thể cũ cho mode khác. |
| README.md | Tài liệu bản cập nhật này. |

## 10. Kiểm thử đã thực hiện

- Kiểm tra cú pháp JavaScript, ID HTML và tất cả đường dẫn script/CSS cục bộ.
- Sinh 100 seed bản đồ và 300 bố cục vùng theo ngày: đủ 33 đảo, 7 Danger + 3 Storm, không chồng lên đảo, không vượt biên.
- Kiểm tra tốc độ Storm đúng 67.2 (60% tốc độ thường), các tốc độ hồi phục HP/Stamina, 45 giây hồi sinh, chi phí 750/2.000, 5 Sea Beasts, +0.5 Material/giây của cờ, craft/equip Relic, tất cả tỷ lệ capture, thay/salvage thẻ và luật phục kích/rút lui.
- Kiểm tra đúng mốc 360 giây, tăng Difficulty, khóa sửa hull, chuyển vùng, Bounty x2, cướp 100% Bounty Wanted, loại tàu 0 HP, last ship và quyết định Day 15.
- Chạy 247 thẻ ở Stamina 100 và 0 trong combat thật: 494 kịch bản, kiểm tra HP/ATK hữu hạn, thanh Stamina không vượt 0–100, không sinh generic Energy, kết quả HP/Stamina của thẻ gốc có thể lưu.
- Kiểm tra trực tiếp damage Element 100 sát thương gốc thành 150/75/100 trong Sailing Sea, vẫn 300 ở quan hệ thuận của mode cũ. Đòn exhausted với ATK 109 gây 81 sát thương trước các yếu tố khác. Kiểm tra active skill tiêu 20 Stamina, HP có Relic/trait, và trả kết quả Potara đúng hai thẻ.
- Mô phỏng đội 10 vs 7 bằng engine chính, worker và worker phát lại checkpoint; kết quả thắng/thua, thời gian, HP và Stamina của cả hai đội khớp. Thử Save & Exit giữa một boarding PvE thật ở khoảng 2.3 giây rồi Resume đúng seed/encounter, thắng trận, nhận 30 Material/90 Bounty, mở draft và tuyển thẻ thành công.
- Chạy hai chuyến mô phỏng AI tới đủ 5.400 giây với bước 0.1 giây (108.000 bước tổng cộng). Bot có nâng cấp Lv. 2/Lv. 3, Sea Beast kills, cắm/chiếm đảo, giao tranh, chìm tàu và nhiều captain cạnh tranh đến Day 15. Thời gian xử lý mô hình mỗi bước trung bình khoảng 0.013–0.021 ms trong kiểm thử tăng tốc cục bộ.
- Kiểm tra giao diện 1440×900, 390×844, 360×640 và 844×390; phím WASD, touch joystick, tap radar, đổi kiểu điều khiển, pause, log cuộn/mở rộng, craft/equip, nâng tàu, cắm cờ, lưu và tải lại. Kiểm tra đo frame cục bộ ở 1440×900 đạt khoảng 59.6 FPS, trung vị khung hình 16.7 ms. Kết quả thực tế phụ thuộc thiết bị và tài nguyên game.
- Kiểm tra hồi quy Standard Battle (Datebayo, Aqua, Stun/Freeze, Victory/Defeat), Ball vs Ball (Equinox và các native passive/counter trước đó), Auto Chess (native/worker, AoE và Energy). Sau khi thoát Sailing Sea, mở được Ball vs Ball và Auto Chess; không phát hiện ghi tài nguyên vào tài khoản chính trong bài kiểm tra thao tác Sailing Sea.

Các bài kiểm tra chạy trên bản game cục bộ; hình ảnh thẻ/phần tài nguyên mạng của game chính được mô phỏng trong bộ kiểm thử khi không có file ảnh thực. Bản đồ đại dương và hiệu ứng tàu là Canvas thật. Bộ kiểm tra không khẳng định mọi tổ hợp hàng nghìn thẻ/Relic/hạt giống có thể xảy ra đều đã được tái hiện.

## 11. Cách cài đặt

1. Sao lưu thư mục game đang sử dụng. Đảm bảo đã cài Update 34.5.1 hoặc bản code có đầy đủ Ball vs Ball và Standard Battle Hotfix.
2. Giải nén ZIP patch. Chép toàn bộ tệp trong ZIP vào thư mục game chứa index.html, giữ đúng tên và cấu trúc đường dẫn.
3. Chọn ghi đè các tệp cũ trùng tên và thêm bảy tệp sailing_* / sailing.css mới. Không cần tải lại thư mục assets.
4. Nếu đang chạy trên website, tải lên đầy đủ các tệp của patch rồi nhấn Ctrl + F5 trên máy tính hoặc đóng/mở lại trang trên điện thoại để trình duyệt lấy phiên bản script/CSS mới.
5. Chọn Sailing Sea trên Operations → New voyage → chọn captain Secret. Thử Dock tại Windward Cay, kiểm tra Material/crew recovery, đổi Direct/Point trong Settings và dùng Save & Exit. Mở lại để thử Resume.
6. Sau khi kiểm tra Sailing Sea, có thể quay lại Summon, Standard Battle, Auto Chess hoặc Ball vs Ball như trước.

Không xóa localStorage của game chính. Patch ZIP chỉ chứa các tệp code mới/sửa đổi và README.md tiếng Việt, không chứa game nguyên bộ, assets, ảnh screenshot hoặc dữ liệu save thử nghiệm.
