ANIME CARD RNG — BLEACH / HUECO RIFT UPDATE
Ngày: 14/11/2026 • Build: 20261114-bleach-1

CÀI ĐẶT
- Giải nén mã nguồn vào thư mục game, ghi đè các file cùng tên. Giữ assets đang có.
- Upload đầy đủ mã nguồn, sau đó Ctrl+F5. Các máy chơi Party/PvP phải cùng build.
- Gói chỉ có mã nguồn/cấu hình và tài liệu cần thiết; không có assets, media,
  backup, test scripts hoặc logs. Cấu hình Firebase và TURN/STUN được giữ nguyên.

SLIME PORTAL — SỬA ICON
- Dùng assets/items/slportal.png ở Storage grid, sidebar, inspector, selector Solo
  và Party. Không còn image Namek hard-code trên inspector.
- Resolver ưu tiên loại Portal trong metadata; nhận diện thêm ID/tên Slime ở dữ liệu
  cũ. Icon lưu nhầm trong inventory được chuẩn hóa khi đọc, không đổi item/attempts.
- Namek Portal tiếp tục dùng assets/items/nportals.png.
- Luật Slime hiện có giữ nguyên: chỉ Normal/Material Trial được tính clear;
  EXP Time Trial không drop Slime Portal và không tăng counter.

HUECO RIFT
- Thêm vào rotation Rift hiện có: mở 30 phút đầu mỗi giờ UTC, chọn một Rift type.
  Dùng selector Arena 5v5, result modal và Rift Shop chung; Rumbling vẫn hoạt động.
- Toàn bộ enemy trong trận Hueco là Dark, gồm cả companion được tạo trong trận.
- HP / ATK của 5 vị trí:
  Normal Arrancar: 200,000 / 20,000
  Normal Arrancar: 350,000 / 35,000
  Normal Arrancar: 400,000 / 40,000
  Normal Arrancar: 600,000 / 50,000
  Boss ngẫu nhiên Coyote Starrk hoặc Ulquiorra: 1,500,000 / 100,000.
  Boss giữ passive tương ứng; không sửa element/stats trong card database.
- Victory: 1–5 Rift Shards tiêu chuẩn; Ulquiorra 0.4%; Hakka Earing 0.1%.
  Hai natural special drops kiểm tra độc lập. Card dùng cùng rollMutations với banner,
  áp dụng weather đang active; ví dụ Reaper có cơ hội Hollow. Không ép mutation 100%.
- Drop Multiplier chỉ nhân shards tiêu chuẩn. Card và Hakka Earing luôn 1 bản/drop,
  không nhân rate hoặc quantity. Receipt/pending recovery chống nhận thưởng lặp.
- Guarantee Shard dùng cơ chế Rift hiện có: tiêu thụ khi entry, chỉ đảm bảo khi thắng.
  Hueco guarantee nhận đúng một special reward, theo trọng số 80% card / 20% item.
  Natural drops không chạy thêm khi đã dùng guarantee. Rumbling giữ trọng số cũ.

HAKKA EARING / EVOLUTION
- Material mới: Hakka Earing; nguồn Hueco Rift 0.1%.
- Rukia Lv.100 + 1 Hakka Earing → Rukia Bankai.
- Mở Evolve trực tiếp trong Card Details; preview portrait/passive/requirements.
- Giữ mutation của bản gốc. Dạng đích chưa từng mở bắt đầu Lv.1 theo luật evolution
  đã sửa trước đó; nếu đã mở, giữ progress hiện có của dạng đích.
- Có thể tiến hóa lặp khi còn bản gốc đủ level và vật liệu; không khóa theo collection.
- Hakka Earing không nằm trong pool nguyên liệu của Material Time Trial.

6 THẺ BLEACH
- Rukia Bankai: Mythic, Water, 1 in 0; HP 23,700 / ATK 5,800.
  Hakka 0–100; mỗi 2 attack kiểm tra Freeze 60%, thành công +10 Hakka.
  Đánh Frozen +3–5 Hakka và x1.3 damage. 100 Hakka: Freeze toàn đội địch 5 lượt,
  500% ATK AoE, reset Hakka; sau Freeze thêm Hindered 2 lượt.
  Miễn Freeze; enemy cố Freeze cho +50% ATK/+25% HP cộng vào base ledger.
- Ulquiorra: Secret, Nature, 1 in 0; HP 130,000 / ATK 49,800; chỉ Hueco Rift.
  Follow-up 75%, 30% ATK, +1 Vista/hit; cap chain 3 / 5 / 10 theo form.
  Vista 50: Murciélago 10 own turns, +50% ATK; mỗi 2 attack đánh 3 địch 70% ATK.
  Vista 100: dùng hết Vista, Segunda 15 own turns, +100% ATK thay bonus form cũ.
  Shield 50% tổng max HP toàn bộ lineup địch, cap 10x max HP bản thân, tồn tại 9 own turns.
  Segunda follow-up 50% ATK, không tạo Vista; mỗi hit hồi 0.3% HP và restore Shield
  3% max HP đến capacity ban đầu. Shield hết thời hạn không xóa shield nguồn khác.
  Khi Segunda còn Shield, cleanse status thông thường, không cleanse stat debuffs.
- Yamamoto: Secret, Fire, Reaper only, 1 in 150,000,000; HP 93,900 / ATK 35,900.
  Mỗi primary attack rút một hướng chưa dùng; đủ 4 hướng thì refill.
  East phá Shield, nếu không có Shield đánh 150% ATK.
  West đánh thường và Burn 2 lượt ở 80% ATK/tick; miễn Burn đến hết lượt riêng kế tiếp.
  South clone enemy đã chết, giữ passive, 30% stats Yamamoto, frontline, sống 3 battle
  turns. Không có corpse hợp lệ: +30% HP/ATK. Dùng cap summon chung 3 active/3 lifetime;
  không tạo thêm clone khi hết quota và không clone mục tiêu có cấm clone.
  North: mục tiêu đang Burn nhận 10% current HP damage; Yamamoto mất 15% current HP.
  Nếu không Burn, Burn toàn đội địch 2 lượt ở 120% ATK/tick.
  Kill +1 Corpse; kill bằng Burn của Yamamoto +5 thay vì +1. Death burst bằng
  10% ATK mỗi Corpse; cấm revive/clone. Sau chết, enemy mới vào nhận Burn 5 lượt
  ở 10% ATK Yamamoto, gồm frontline promotion và wave Infinity mới.
- Coyote Starrk: Secret, Water, Reaper only, 1 in 180,000,000;
  HP 123,000 / ATK 46,900. Mỗi attack chọn Left hoặc Right.
  Left: follow-up 50%, mỗi hit tiếp giảm chance 10 điểm %, damage từ 50% ATK tăng
  10 điểm %/hit. Right: 150% ATK, Hindered 1 lượt và gọi mọi Wolf còn sống assist.
  Mỗi 2 attack tạo Wolf 10% stats, không passive, cap 10 đang sống, cấm clone/revive.
  Từ attack thứ 7, mỗi follow-up thêm AoE 30% ATK; AoE không tự tạo follow-up mới.
  Dodge 24%; dodge thành công tăng chance ban đầu của Left kế tiếp lên 75%.
- Kisuke Urahara: Secret, Nature, Reaper only, 1 in 250,000,000;
  HP 315,000 / ATK 19,200. Mỗi 3 attack Bleed 1 lượt ở 50% ATK.
  Đánh mục tiêu Bleed thêm 10% ATK bỏ Shield/DR. Bleed do teammate gây thêm
  25% ATK Urahara mỗi tick. Reconstruction: cleanse Bleed mới trên đồng minh,
  Shield bằng tổng damage còn lại; cooldown chung 3 battle turns.
  Attack thứ 10 mở Kannonbiraki 5 own turns: damage từ attack hồi cả đội 30%,
  cleanse status thông thường cho cả đội; không mở lại Bankai trong cùng match.
- Normal Arrancar: Common, Dark, Reaper only, 1 in 1,250; HP 1,680 / ATK 410.
  Mỗi 7 attack gây AoE 20% ATK.

REAPER / RELIC / PASSIVE HOOKS
- Reaper đã có trong weather scheduler (Uncommon), HUD và weather mutation registry.
  Bốn thẻ Reaper mới chỉ vào gacha pool khi Reaper active. Hai thẻ chance 0 luôn bị loại.
- Category thêm Bleach/Gunner; giữ nguyên cách viết Swordman/Villian/AntiVillian.
- Ulquiorra và Starrk tham gia Enten Blade follow-up bonus; O.D.M. chỉ tăng secondary
  chance theo luật hiện có. Basic/follow-up chains không nhận Enten Unique special bonus.
- Counter attack riêng và mode duration đi qua phase context chung. Follow-up hợp lệ
  được tính là attack; kỹ thuật Yamamoto chỉ rút ở primary own turn, không rút ngoài lượt.
- Thời hạn mode tính lượt riêng, gồm lượt kích hoạt. Expiry vẫn chạy khi passive bị disable.
  South expiry/Reconstruction cooldown dùng turnCount battle. Không dùng timer thực
  hoặc DOM listener riêng cho từng unit/copied passive.
- Black Flame giữ luật uncleansable hiện có, kể cả Shield Segunda hoặc Bankai Urahara.
- Copied passives dùng scoped runtime/lease; khi swap, dọn bonus form/shield của copy,
  summons và hiệu ứng thuộc lease. Dead Wolves/expired South được dọn khỏi queue.
- Bảo toàn toàn bộ 211 card definitions trước update; hiện có 217 thẻ.
- Hai category mới chỉ tham gia Infinity weekly rotation từ 16/11/2026 UTC, giữ category
  tuần hiện tại như policy sẵn có. Không đổi scaling hoặc buff Infinity.

ASSET PATHS THAM CHIẾU — KHÔNG KÈM FILE
- assets/items/slportal.png
- assets/items/hakkaearing.png
- assets/cards/rukiabankai.png
- assets/cards/ulquiorra.png
- assets/cards/yamamoto.png
- assets/cards/coyotestarrk.png
- assets/cards/kisukeurahara.png
- assets/cards/normalarrancar.png
Tên artwork Bleach/Hakka chưa được chỉ định sẵn trong yêu cầu, nên code dùng các tên
trên. Đặt artwork cục bộ đúng tên/case, hoặc sửa image field nếu tên bạn dùng khác.

KIỂM CHỨNG
- node --check: 86 JS modules; 91 local HTML references có file tương ứng.
- 76 focused Bleach combat assertions; 82 content/weather/drop/evolution/icon assertions.
- 13 edge checks: copy release/shield cleanup, expiry khi suppressed, summon retirement,
  cached runtime identity qua 100,000 reads/writes, native Yamamoto cấm revive/clone.
- 217 seeded card scenarios (tối đa 18 turns), 216 copy/execute/cleanup scenarios.
- 100 continuous Infinity transitions giữ player state và 21 fresh Tower matches.
- 67 Sins regression; 67 Tensura systems; 52 event/evolution/Infinity reward checks;
  standard quantities x6; Spooky 50-wave special drops vẫn single-copy.
- Bleach mixed-team PvP: 39 steps qua 3 seeds, hai simulation snapshot giống nhau,
  không reward/save writes. Không sửa module/rules PvP.
- Desktop 1440px/mobile 390px: Hueco result receipt + reload recovery, Rift labels;
  Slime Storage grid/sidebar/inspector/standard selector, 8 combat turns, không
  horizontal overflow hoặc stack/battle-log errors. Evolution write-failure rollback.
- Đây là các scenario kiểm chứng, không phải chứng minh mọi tổ hợp thẻ/relic/mutation.
  Artwork và Party giữa hai mạng thật cần kiểm tra cùng assets/build sau upload.

Modified Files Note
- app.js
- bleach_passives.js (mới)
- card_details.js
- cards.js
- category.js
- companions.js
- evolution.js
- index.html
- infinity_rules.js
- inventory.js
- materials.js
- passives.js
- portal_rules.js
- portals.js
- portals_party.js
- relics.js
- rift.js
- startup.js
- storage.js
- styles.css
- yuno.js
- README.txt
- PASSIVE_AUDIT.txt
