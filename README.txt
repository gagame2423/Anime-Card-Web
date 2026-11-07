ANIME CARD RNG — RUMBLING RIFT
Bản cập nhật: 07/11/2026

1. RIFT MODE
- Vào Arena > Rift Mode; dùng chính bộ chọn đội, Battle Arena, thanh HP/khiên,
  hiệu ứng, nhật ký và màn hình kết quả hiện có. Đội hình 5 thẻ đấu 5 kẻ địch.
- Mở 30 phút đầu mỗi giờ UTC (phút 00–29), đóng 30 phút còn lại. Loại Rift
  được chọn bằng seed của giờ UTC để mọi người thấy cùng một loại. Hiện có
  Rumbling Rift; có thể thêm loại mới trong RiftSystem.TYPES.
- Trận đã bắt đầu được phép kết thúc sau giờ đóng. Không bắt đầu lượt mới khi
  Rift đóng; Auto Continue kiểm tra lại điều kiện trước mỗi lượt.
- Địch đều mang hệ Nature. Bốn Dumb Titan: HP/ATK lần lượt
  100.000/10.000; 150.000/15.000; 200.000/20.000; 250.000/25.000.
  Boss chọn ngẫu nhiên War Hammer, Jaw, Beast hoặc Armored Titan: 1.000.000 HP,
  50.000 ATK. Các thay đổi này chỉ áp dụng cho địch trong Rift.
- Mỗi trận thắng nhận 1–5 Rift Shards, lưu trong Storage > Material.
  Hai lượt kiểm tra đặc biệt độc lập: Eren 0,5%; O.D.M. 5%.
  Không cộng VNĐ/EXP thưởng thường; Bread và quest thắng trận dùng hệ thống cũ.

2. RIFT SHOP VÀ GUARANTEE SHARD
- Cửa hàng dùng chung cho mọi loại Rift, hỗ trợ Quantity và giới hạn theo số
  shard thực có; trừ tiền và cấp vật phẩm trong cùng một giao dịch.
- Lucky Potion: 1; Rich Potion: 1; Speed Potion: 1;
  Speed Battle Potion: 3; Guarantee Shard: 1.000 Rift Shards.
- Guarantee Shard thuộc Material, ảnh assets/items/gshard.png.
- Vào thủ công khi có shard: hỏi “Do you wanna guarantee drop on win?”.
  Đồng ý sẽ trừ 1 Guarantee Shard khi vào trận, bảo đảm 1 phần thưởng đặc biệt
  nếu thắng; thua không nhận phần thưởng đặc biệt được bảo đảm.
- Trong lượt bảo đảm, chọn đúng 1 món theo trọng số gốc Eren:O.D.M. = 1:10
  (9,09% Eren / 90,91% O.D.M.); không thực hiện thêm hai lượt kiểm tra thường.
- Khi Auto Continue bật, bỏ qua hộp hỏi và dùng công tắc Auto Guarantee.
  Công tắc mặc định OFF, chỉ bật được khi còn ít nhất 1 Guarantee Shard,
  tự tắt khi hết shard. Không có shard vẫn có thể chơi với tỷ lệ thường.
- Kết quả chờ lưu được phục hồi với phần thưởng đã chốt, không quay lại RNG
  và không cấp trùng thẻ/vật phẩm khi thử lưu lại.

3. RUMBLING WEATHER, COLOSSAL VÀ THẺ MỚI
- Thêm Titan, TitanSlayer, Animal, Mastermind vào category.js.
- Rumbling là Rare Weather bình thường: thời lượng 10 phút, +100% EXP.
  Dùng lịch và tỷ trọng Rare hiện có. Mutation Colossal: HP x8, ATK x2,
  màu đỏ xám tối; xác suất Rare gốc 2,5%, có áp dụng multiplier và trần cũ.
- Vẫn tối đa 2 mutation. Hai mutation cộng hệ số từng stat, không nhân nối tiếp:
  Monarch x6 ATK + Stardust x4 ATK = x10 ATK.
- Dumb Titan: roll thường 1/30. Stomp dùng MỘT vòng chọn kết quả:
  30% hụt; 10% đánh và Stun 1 lượt; 60% đánh và thêm một mục tiêu với 50% ATK.
- War Hammer Titan: chỉ roll khi Rumbling, 1/29.000.000. Nếu đứng đầu đội,
  hy sinh vĩnh viễn đồng đội và tạo Crystal ở cuối với tổng Max HP của họ.
  Khi Crystal còn sống: 60% giảm sát thương, hồi 1% HP hiện tại mỗi lượt;
  chịu đòn chí tử còn 1 HP và trừ Crystal bằng 500% ATK hiện tại.
  Đòn làm cạn Crystal vẫn được bảo vệ; đòn chí tử kế tiếp không được bảo vệ.
  Mỗi đòn thứ 5 chọn Hammer/Spear cho 5 đòn tiếp theo, không đổi đòn vừa đánh.
  Crystal không tấn công, không clone/revive và biến mất khi chủ chết vĩnh viễn.
- Jaw Titan: chỉ roll khi Rumbling, 1/1.345.000. Khiên 10% sát thương thực gây
  ra trong 2 lượt; vẫn đánh khi Stun với 70% sát thương, Freeze vẫn chặn đánh.
- Armored Titan: chỉ roll khi Rumbling, 1/45.000.000. Khiên đội bằng 50% Max HP;
  khi không tấn công, phục hồi 50% dung lượng khiên bị vỡ và Stun người đánh
  3 lượt, tối đa một lần trên mỗi đồng đội cho mỗi chủ passive.
- Beast Titan: CHỈ roll trong Rumbling Weather, 1/18.000.000.
  Khi không tấn công tích 1–2 Rock/lượt, không có trần gameplay. Khi đánh ném
  toàn bộ số đá vào mục tiêu ngẫu nhiên; mỗi đá 50% ATK, phá trọn một khiên.
  Từng viên xử lý riêng để khiên vỡ trước rồi viên sau đánh vào HP.
- Eren: chance = 0, riftOnly = true; CHỈ rơi từ Rumbling Rift.
  Khi rơi dùng ĐÚNG rollMutations() của gacha: thời tiết đang hoạt động,
  multiplier mutation từ Equipment, xác suất/trần hiện có và tối đa 2 mutation.
  Không tự gán Colossal chỉ vì trận thuộc Rumbling Rift.
  Hồi sinh một lần với +250% HP cộng theo gốc, đầy HP và +35% ATK.
  Hạ Titan sẽ hấp thụ 50% ATK và thêm passive của mục tiêu, không chép trùng
  cùng một passive. Chỉ số cả 6 thẻ theo yêu cầu; 191 thẻ cũ không đổi HP/ATK.

4. O.D.M. RELIC
- Ảnh assets/items/odm.png. ATK chỉ áp dụng cho thẻ Human:
  Common +2–6%; Rare +5–10%; Legendary +8–16%.
- Unique chốt một giá trị +1–10 điểm phần trăm khi tạo Relic. Chỉ tăng xác suất
  follow-up thứ hai trở đi trong chuỗi có thể đánh tiếp; lượt kích hoạt đầu
  không đổi. Cộng đúng một lần mỗi phép thử, không tích lũy vào xác suất gốc;
  tổng xác suất chuỗi tối đa 99%.
- Áp dụng vào các chuỗi hiện có qua adapter chung; tooltip ghi giá trị đã roll.
- Công thức: 150 Chain, 100 Silver Ore, 100 Calcite, 50 Mineral Ore,
  100 Leaf, 100 Electric Ore, 100 Lapiz Ore.
- Công thức tự xuất hiện trong Crafting từ RelicSystem.RECIPES; không cần đổi
  logic Crafting cũ. Rift drop dùng tỷ lệ rarity Relic chuẩn 70/25/5 và
  Legendary có 10% Unique. Tương thích Equip, Fusion, bán và kế thừa Relic.

5. CÂN BẰNG PASSIVE
- Itachi Awakened: áp dụng bộ hệ số và hiệu ứng mới cho đủ 10 kỹ thuật.
  Izanami chỉ dùng một lần và bị loại khỏi các vòng kỹ năng sau; cooldown
  đúng 5 lượt của Itachi. Giá HP của Izanami không thể giết Itachi.
  Susanoo phản 50% sát thương khi khiên còn, không giới hạn một đòn.
  Black Flame là Burn không thể tẩy bằng cơ chế cleanse thường, kéo dài 3 lượt.
- Zetsu White: chép HP/ATK x1,15 một lần, không chép passive và không còn
  passive sau đó. Black giữ chia chỉ số 50/50; cấm clone/revive không đổi.
- Deidara: đòn chết giảm từ 1500% xuống 500% ATK. Hai cơ chế tấn công khác giữ nguyên.
- Các mô tả trong cards.js được cập nhật cùng logic chạy thực tế.

6. KIỂM TRA VÀ TRIỂN KHAI
- Syntax check toàn bộ 77 file JavaScript.
- Kiểm tra trình duyệt desktop 1440px và mobile 390px: startup local-first,
  chọn 5 thẻ, mở shop/Quantity, bắt đầu trận, kết quả và đổi về mode thường.
- Kiểm tra biên mở/đóng, stat địch, guarantee, mua số lượng lớn, thua không
  thưởng, phục hồi sau lỗi lưu, mutation Eren, shield từng hit và các passive mới.
- 700 lượt roll Relic cũ có seed và 188 kịch bản combat cũ có seed cho kết quả
  giống bản trước. Không tính 3 thẻ được chủ động sửa passive trong đối chiếu.
- HP/ATK của 191 thẻ cũ không đổi. File scaling/logic gốc Tower, Time Trial,
  Raid, Boss Event, Spooky Hunt, Infinity, Online PvP, Firebase và TURN/STUN
  giữ nguyên; các hook dùng chung chỉ mở rộng cho yêu cầu mới.
- Giải nén toàn bộ source vào thư mục game, giữ assets hiện có, rồi push GitHub.
  Cache tag mới: 20261107-rumbling-rift-1. Hard-refresh bằng Ctrl+F5.
- Gói chỉ chứa source/config/README, không tạo Excel hoặc tài nguyên ảnh mới.
  Các ảnh cần có trong dự án triển khai:
  assets/cards/dumbtitan.png
  assets/cards/warhammer.png
  assets/cards/jawtitan.png
  assets/cards/armoredtitan.png
  assets/cards/eren.png
  assets/cards/beasttitan.png  (tên quy ước được chọn cho Beast Titan)
  assets/items/odm.png
  assets/items/gshard.png

Modified Files Note
- README.txt
- akatsuki_passives.js
- app.js
- cards.js
- category.js
- companions.js
- dragon_skills.js
- fate.js
- gomen.js
- grimoire.js
- index.html
- inventory.js
- mutations.js
- passives.js
- ragna_passives.js
- relic_combat.js
- relics.js
- requiem.js
- rift.js (mới)
- shibuya.js
- spooky_passives.js
- startup.js
- storage.js
- styles.css
- titan_passives.js (mới)
- tower_200_passives.js
- weathers.js
- yuno.js
