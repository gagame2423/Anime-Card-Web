AUTO CHESS — UX / AUDIO / MOBILE / UNIFORM FUSION / AUGMENT EXPANSION
Ngày cập nhật: 17/11/2026
Build: 20261117-ac-polish-augments-3

Đây là changelog riêng của patch này, gồm cả hai yêu cầu liên tiếp:
(1) UX, SFX, result banner, away travel, rarity borders, fusion gần slot và mobile.
(2) Fusion đồng xác suất, Lineage Augments và mở rộng/cân bằng Augments.

1. FILE THAY ĐỔI & CÀI ĐẶT
=========================
Gói patch chỉ chứa 13 source file đã thay đổi và README.txt:
- autochess.js: fusion uniform/proximity, XP/interest/refund hooks, team cap.
- autochess_augments.js: 39 Augments mới, cân bằng, mô tả và lifecycle hooks.
- autochess_combat.js: điều kiện vị trí/Relic/trait, damage/shield policies,
  kill buffs và metadata hiển thị sao cho Native/Worker.
- passives.js: hook damage multiplier, shield factor và flat stat trong
  sandbox Auto Chess; các mode khác không áp dụng những hook này.
- autochess_ai.js: nhận biết Augments mới, ghép đội hình và chọn vị trí phù hợp.
- autochess_bots.js: deployment cap có Augment, Last Stand trước khi xếp hạng.
- autochess_runs.js: ghost board tối đa 11 unit và Last Stand flag gọn nhẹ.
- autochess_online.js: khôi phục đúng Last Stand buff của ghost snapshot.
- autochess_audio.js: pooled/cached SFX, mute/volume, missing/autoplay handling.
- autochess_view.js: HUD, banner, travel, perspective, fusion và mobile controls.
- autochess_panels.js: Augment Codex có tìm kiếm, lọc tier/type, mô tả đầy đủ.
- autochess.css: full rarity frames, GPU VFX, mobile board-first layout, Codex.
- index.html: cập nhật cache version để tải đúng các module mới.

Cách cài đặt:
1) Giải nén và chép đè đúng các file trong patch vào thư mục game hiện tại.
2) Deploy cả index.html cùng các source file; giữ nguyên những file ngoài patch.
3) Tải lại bằng Ctrl+F5. Các người chơi trong cùng phòng P2P cần dùng bản mới.
4) Bắt đầu match mới. Không xóa localStorage, inventory hoặc tài khoản.

Patch không kèm assets, ảnh, âm thanh, bản backup hoặc file test tạm.
Các path assets chỉ được tham chiếu bằng mã nguồn.

2. FUSION — ĐỒNG XÁC SUẤT VÀ ƯU TIÊN SLOT GẦN
============================================
Fusion vẫn theo luật hiện có: 3 unit CÙNG RARITY -> 1 unit ngẫu nhiên ở
rarity kế tiếp. Không đổi sang luật bắt buộc 3 bản sao cùng nhân vật.
Secret vẫn là tier cuối, không thể fusion tiếp.

Mặc định mới:
- Mỗi card hợp lệ trong tier đích có xác suất bằng nhau, 1/N.
- Không đọc chance/1 in X của gacha; không thiên vị Supporter.
- Bỏ cả bước bias theo dominant Category/Element cũ.
- Dùng rejection sampling với RNG seeded của match để tránh modulo bias.
- Không thay đổi tỉ lệ gacha, weather hoặc inventory của main game.

Ưu tiên nguyên liệu khi drag/tự ghép:
- Khi kéo unit A vào unit B, chọn unit thứ ba gần hai slot đó nhất.
- Nếu có đủ bản sao cùng cardId, ưu tiên nhóm bản sao này trước.
- Ví dụ: các bản sao ở bench 1, 2, 3 và 8; kéo 2 vào 3 sẽ lấy 1, giữ 8.
- Chỉ có 3 bản sao hợp lệ thì vẫn chọn đủ 3, dù chúng nằm xa nhau.
- Auto-fuse chọn cụm gần nhau; sau khi mua có thể ưu tiên cụm gần unit vừa mua.
- Keep/Protect và nguyên liệu đang giữ trong Anvil vẫn được tôn trọng.
- Ba unit do người chơi chọn rõ trong Anvil không bị tự đổi nguyên liệu.
- Relic trên unit bị fusion được trả an toàn về stash/loot.

Solo combat: chỉ đổi roster cho vòng sau; không sửa thực thể đang chiến đấu.
Multiplayer combat: card/Relic fusion tiếp tục bị khóa để giữ đồng bộ.
Các giới hạn deployed-material sẵn có vẫn áp dụng.

3. CATEGORY-PRESERVING FUSION — LINEAGE FAMILY
============================================
Silver:    Lineage Spark        — 25% cơ hội proc.
Gold:      Bloodline Synthesis  — 40% cơ hội proc.
Prismatic: Sovereign Ascension  — 50% cơ hội proc.

Khi có Augment này:
1) Roll proc trước khi chọn card đích.
2) Proc thành công: thử các Category CHUNG CỦA CẢ BA nguyên liệu.
3) Nếu không có card tier đích phù hợp phần chung, dùng HỢP các Category
   của ba nguyên liệu.
4) Không có card phù hợp cả hai bước: trở về toàn bộ tier đích.
5) Card trong pool cuối cùng vẫn được chọn uniform 1/N.

Category được normalize qua helper hiện có; Element không tham gia bước này.
Hiển thị LINEAGE MATCH khi proc tạo được card phù hợp. Một batch auto-fuse
có thể gộp nhiều proc thành một callout. Đây là family duy nhất bảo tồn
Category; fusion thường hoàn toàn uniform.

4. 13 AUGMENT FAMILIES MỚI — 39 LỰA CHỌN
=======================================
Các bộ số dưới đây lần lượt là Silver / Gold / Prismatic.
Một match vẫn chọn tối đa 3 Augments, không chọn trùng family.
Tổng registry hiện tại: 105 definitions; 39 definitions mới.

A) Lineage Spark / Bloodline Synthesis / Sovereign Ascension
- Category proc: 25% / 40% / 50%. Chi tiết ở mục 3.

B) Rainy Day Fund / Rich Get Richer / Hedge Fund
- Max interest: +6g / +7g / +10g khi giữ 60g / 70g / 100g.
- Vàng một lần khi nhận: +6g / +9g / +12g.
- Interest và grant vẫn nằm trong cap bonus Gold 16g/round.

C) Ticket Booth / Trade Sector / Golden Ticket
- 1 / 2 / 3 free Shop Refresh mỗi planning round; không tích lũy.
- Paid refresh có 15% / 25% / 40% cơ hội hoàn 2g.
- Chỉ refund khi cap bonus còn ít nhất 2g. Free refresh không refund.
- Khi hết cap, refresh tiếp tục trừ phí bình thường; không có vòng lặp kiếm vàng.

D) Clear Mind / Focused Scholar / Perfect Clarity
- Sau combat round: +2 / +4 / +6 XP nếu bench VÀ reserve đều trống.
- Mỗi round chỉ nhận một lần. XP mua level và Shop odds vẫn theo level thật.

E) Birthday Present / Gifted Scholar / Level Up!
- Buy XP nhận thêm +1 / +2 / +4 XP, ngoài 4 XP cơ bản.
- Mỗi level đạt được SAU khi sở hữu Augment tặng 1 unit ngẫu nhiên:
  Rare / Epic / Legendary tương ứng với tier Augment.
- Không tặng hồi tố level đã có; mỗi level chỉ nhận quà một lần.
- Bench đầy: quà vào unit reserve. Nếu chạm hard roster cap 100 unit,
  chuyển thành giá Gold tương ứng trong giới hạn bonus cap.

F) Cybernetic Implants / Cybernetic Uplink / Cybernetic Ascension
- Starter có cầm Relic: +250 / +500 / +850 HP phẳng và
  +12% / +22% / +35% ATK trong combat.
- HP phẳng dùng stat API thực, không giả làm % của HP hiện tại.
- Không chỉnh roll của Relic hoặc chỉ số vĩnh viễn trong Collection.

G) Bulwark / Lonely Guardian / Unbroken Bastion
- Khi đúng 1 starter sống đứng ở hàng trước lúc combat bắt đầu:
  unit đó nhận Shield bằng 50% / 90% / 140% max HP và
  +8% / +12% / +18% damage reduction cho trận đó.
- Hai unit cùng hàng trước sẽ không được solo bonus.

H) Thrill of the Hunt / Predator's Triumph / Apex Feast
- Kill: hồi 15% / 25% / 40% max HP.
- Kill: thêm 5% / 8% / 12% ATK, tối đa 5 stack trong một combat.
- Kill: Shield bằng 10% / 20% / 30% max HP.
- Stack ATK reset giữa các combat; heal/shield vẫn chịu Overtime và luật passive.

I) Unified Resistance / Phalanx / Diamond Phalanx
- Mỗi starter nhận bonus theo số starter khác cùng HÀNG BAN ĐẦU:
  +3% / +5% / +7% damage reduction và +4% / +7% / +10% ATK mỗi đồng đội.
- Tối đa 3 đồng đội được tính; khóa tại combat start, không cộng dồn mỗi frame.

J) Glass Cannon / Fragile Supremacy / Forbidden Power
- Toàn đội gây thêm 20% / 35% / 55% damage.
- Đổi lại mất 10% / 18% / 25% max HP.
- Gold và Prismatic: đội của bạn không thể nhận Shield bằng bất kỳ cách nào,
  gồm shield trực tiếp, shield layer từ passive và shield từ trait/Augment.
- Silver vẫn có thể nhận Shield. Không thêm spell-crit giả hoặc Armor/MR ảo.

K) Built Different I / Built Different II / Built Different III
- Starter không thuộc bất kỳ Category/Element trait đang active nào nhận:
  +40% / +75% / +110% HP, +30% / +50% / +80% ATK,
  +10% / +20% / +30% attack speed.
- Kiểm tra một lần lúc combat start; Augment crests được tính.
- Có một trait của chính unit active là mất điều kiện Built Different.
- Duplicate character vẫn theo luật đếm distinct của trait engine.

L) New Recruit / Tactician's Crown / Sovereign's Retinue
- +1 / +1 / +2 deployment slots và +5% / +10% / +15% HP toàn đội.
- Maximum deployed: 11. Tactician Level vẫn tối đa 9.
- Không tăng Shop odds theo số slot bonus.
- Bot deployment, HUD, state validation và ghost codec đều hỗ trợ 11 unit.
- Team Planner vẫn là bộ 8 target card; không giới hạn số slot thật trên board.

M) Last Stand / Defiant Heart / Immortal Tactician
- Một lần/match: sống sót sát thương tactician chí mạng ở 1 HP.
- Sau khi kích hoạt: team được +30% / +50% / +80% HP và
  +20% / +35% / +50% ATK trong các combat tiếp theo của match.
- Xử lý trước placement/elimination; lần lethal thứ hai vẫn bị loại.
- Không ngăn abandon, refresh hoặc rời phòng.
- Cờ đã kích hoạt được giữ trong live state và compact ghost snapshots.

5. CÂN BẰNG AUGMENTS CŨ
======================
Combat Augments, Silver / Gold / Prismatic:
- Vitality Matrix: +16% / +28% / +42% HP.
- Sharp Edges: +12% / +22% / +34% ATK.
- Overclock: +12% / +22% / +35% attack speed.
- Second Wind: hồi 3% / 5% / 7.5% max HP mỗi 4 giây.
- Aegis Formation: Shield 18% / 30% / 50% max HP lúc bắt đầu combat.
- Blood Drinker: +7% / +12% / +18% omnivamp.
- Calculated Strikes: +10% / +18% / +28% crit chance.
- Arcane Ward: +6% / +10% / +16% damage reduction.

Forge / Economy:
- Relic Forge: 2 Rare / 1 Legendary / 2 Legendary Relics một lần.
- Pocket Change: +12g / +14g / +16g một lần, trong cap.
- Trade Route: 1 / 2 / 3 free Refresh/round và +2g / +4g / +6g một lần.
- Efficient Study: Buy XP giá 3g; tặng ngay +4 / +8 / +12 XP.
- Crest family giữ +1 / +2 / +3 virtual count; cần unit cùng trait thật trên board.

Weekly families vẫn xoay theo ISO week và giữ weight ưu tiên:
- Soul Reaper's Overdrive: +12/20/30% ATK, Bleach +1 count,
  kill heal 12/20/30% max HP.
- Relic Transmuter: giữ quà 1 Rare / 1 Legendary / 2 Legendary;
  Shield khởi đầu tăng lên 10/18/25% max HP.
- Prismatic Vanguard: +20/35/55% HP và +4/7/10% damage reduction.
- Tempest Conductor: +14/24/38% attack speed và Electric +1 count.
- Codex liệt kê mọi Weekly family; chỉ family featured được offer trong match.

6. BOT AI & KINH TẾ AN TOÀN
==========================
- Platinum trở lên chấm Augment theo HP, gold, bench, trait, passive archetype,
  Relic đang cầm và khả năng sử dụng slot mới.
- Biết cân nhắc Lineage khi đang có vật liệu fusion; Clear Mind khi bench trống;
  Birthday/XP khi còn nhiều level có thể đạt; Last Stand khi đang nguy hiểm.
- Cân nhắc đội hình khác trait cho Built Different, gom hàng cho Phalanx,
  chừa một solo frontliner cho Bulwark, tránh chọn Shield build bị Glass chặn.
- Khi khỏe và có Fund, bot có thể giữ 60/70/100g để khai thác cap interest mới.
- HP <= 30 vẫn bỏ ngưỡng tiết kiệm để ổn định; không có gold hay reroll ẩn.
- Nhánh draft/economy cơ bản Iron–Gold vẫn giữ policy cũ. Những thay đổi luật
  fusion, giá trị Augment và slot bonus hợp lệ áp dụng chung cho mọi Rank.

Cap không thay đổi:
- Bonus Gold tối đa 16g/round, gồm interest, loot, Augments và các bonus liên quan.
- Card-passive Gold là sub-cap tối đa 2g/round trong cap trên.
- Base income và tiền bán unit được hạch toán riêng như trước.
- Free refresh không tích lũy qua round, tối đa 3 mỗi round từ các Augments này.
- Bot có giới hạn 24 hành động planning; không tăng shop odds hoặc sửa roll.

7. SFX — FILE BẠN CẦN ĐẶT TRONG assets/audio/
============================================
Các hook chính:
- shop.mp3     : Shop Refresh / reroll, gồm các refresh miễn phí hợp lệ.
- exp.mp3      : Buy XP.
- levelup.mp3  : Tactician tăng level, kể cả XP từ round/Augment.
- fuse.mp3     : Card Fusion và Relic Fusion đã phản ánh vào roster.
- win.mp3      : Banner VICTORY.
- lose.mp3     : Banner DEFEAT.

Hook bổ sung TÙY CHỌN (có thể thêm file sau):
- buy.mp3      : mua unit.
- sell.mp3     : bán unit, gồm hotkey X trên bench.
- deploy.mp3   : deploy/move/swap unit.
- draft.mp3    : người chơi chọn Shared Draft card.
- travel.mp3   : away-arena gather/warp transition.

Audio dùng pool/cache thay vì tạo một Audio mới mỗi frame.
- Prewarm các SFX chính sau tương tác người dùng.
- Tối đa 2 voice/file và 5 voice Auto Chess hoạt động cùng lúc.
- Debounce ngắn để thao tác nhanh không spam âm thanh vô hạn.
- Tôn trọng SFX ON/OFF và SFX Volume hiện có của game.
- File thiếu hoặc autoplay bị chặn đều được catch; không làm hỏng match.
- Missing-file cache tránh thử lại liên tục; thêm file xong hãy reload trang.
- Dừng mọi voice khi đóng mode/pagehide; cache nhỏ được tái sử dụng.
- Rank-up sounds cũ và countdown10s.mp3 vẫn được giữ. Warning vẫn là 10 GIÂY,
  một lần/round; không đổi thành 8 giây.

Không có mp3 nào được đóng gói trong patch.

8. RESULT BANNER, AWAY TRAVEL & RARITY FRAMES
===========================================
- Khi có kết quả canonical: VICTORY vàng/cyan hoặc DEFEAT đỏ ở giữa board,
  có shockwave/particle và SFX tương ứng; DRAW dùng màu trung tính, không thêm SFX.
- Banner khoảng 1.5 giây; cùng một round không phát lại khi HUD refresh.
- Kết quả cuối match hiện summary sau banner; cơ chế credit/reward receipt giữ nguyên.
- Next Round không bỏ qua banner trong thời gian ngắn này.

Perspective:
- Khi ở phía B/away, chỉ ánh xạ tọa độ render: x -> 6-x, y -> 7-y.
- Quân của bạn ở dưới, địch ở trên; chữ/portrait không bị xoay ngược.
- Scout cả hai người thuộc chính fight của bạn vẫn giữ cùng perspective của bạn.
- Scout fight khác/Spectator dùng perspective của board đang xem.
- Damage popups dùng cùng phép ánh xạ với unit.

Away transition:
- Gather -> orb jump/warp -> fan out trong khoảng 780 ms.
- Unit proxy và backdrop chỉ để trình bày; không sửa stats/vị trí combat thật
  hoặc làm chậm đồng hồ authoritative/P2P.
- Có cleanup khi hết hiệu ứng, đổi round hoặc đóng match.
- Reduced Motion rút gọn/ẩn các hiệu ứng chuyển động tương ứng.

Rarity frame đầy đủ bốn cạnh trên Shop, Bench, Board, Anvil, Carousel,
Team Planner, card inspection và các portrait preview liên quan:
- Common: slate/silver #a8b6cc.
- Rare: ocean blue #329fff.
- Epic: royal purple #b079ff.
- Legendary: radiant gold #f2cb62.
- Mythic: crimson/rose #ff638f.
- Secret: cyan #79f5e9.
Badge sao phản ánh fusionDepth hiện có; không thêm luật star-up khác.

9. MOBILE — BOARD TRƯỚC, SHOP/ FORGE THU GỌN
==========================================
- Viewport nhỏ <= 768px hoặc thiết bị touch phù hợp bật board-first layout.
- Traits và Standings dùng drawer/pill thay vì chiếm hai bên battlefield.
- Dock chính thu lại thành quick rail: Gold, XP, Refresh và Shop & Forge.
- Chạm Shop & Forge để mở đủ 5 shop card, Anvil và 10-slot Relic stash.
- Bench vẫn có thể thao tác khi market mở.
- Kéo Relic ra khỏi stash về phía unit: market tự thu lại để lộ drop target.
- Kéo Relic sang một Relic khác trong stash: market giữ mở để fusion.
- Tap-to-select / tap-to-equip vẫn được giữ làm phương án bổ sung.
- Name label tương phản cao, full rarity frame, sao, HP và Shield bar giúp
  nhận biết unit khi artwork quá nhỏ. Bench ưu tiên tên thay vì thumbnail.
- Kiểm tra cả landscape thật và CSS-rotated landscape fallback.
- Ở 844x390: field đo được khoảng 211px cao; ở 915x412 khoảng 233px;
  568x320 khoảng 157px, không có viewport overflow trong test.
- Name font 10px ở các phone chính, 9px ở màn hình rất thấp.

My Augments / Armory có nút Augment Codex. Codex tra cứu đủ 105 definitions,
lọc Silver/Gold/Prismatic và Combat/Economy/Trait/Forge/Weekly, toàn bộ label
và mô tả Augment mới bằng English.

10. KIỂM THỬ & GIỚI HẠN THỰC TẾ
===============================
Đã kiểm tra:
- Cú pháp của toàn bộ JavaScript sửa trong patch; startup đủ 234 passives.
- 256 cặp seeded fusion có/không có Supporter cho cùng kết quả uniform mong đợi.
- Proc Lineage 25/40/50%, common-category pool, union fallback và empty fallback.
- Proximity ở slot 1/2/3/8, Keep/Anvil protection, auto-fusion và Relic recovery.
- Solo combat không sửa live entities; multiplayer combat fusion vẫn bị chặn.
- Interest/refund cap, Clear Mind chỉ một lần, quà level không bị nhận trùng.
- Cybernetic HP phẳng, Bulwark/Phalanx theo vị trí, Built Different theo trait,
  Glass damage/HP và chặn direct/layer shield, kill ATK stack cap.
- Last Stand trước elimination, không kích hoạt lần hai và ghi tactician
  damage theo HP thực sự mất.
- State/ghost codec 11 unit, Last Stand flag và payload <= 5,900 bytes.
- Worker vs Native cho cả combat thường lẫn combat có Augments mới: outcome
  và telemetry trùng khớp, Worker được cleanup.
- Mock PeerJS 8 human clients, gồm board 11 unit: chung Champion/standings,
  receipt/rewards một lần; mỗi human tối đa 1 Query + 1 Write cho run.
- Full match AI tại Platinum và Grandmaster đi đến một Champion.
- Desktop/mobile: 1440x900, 844x390, 768x500, 915x412, 568x320;
  thêm portrait 390x844 với landscape fallback cho Codex/HUD mới.
- Pointer drag thật trên touch: card fusion, Relic fusion/equip; cleanup drag,
  tooltip, travel, kết quả và audio sau khi đóng mode.
- VICTORY/DEFEAT SFX một lần, final summary sau banner, mute/volume,
  autoplay rejection, optional missing-file và rank fallback.
- Bot policy/combo/Relic/interest tests vẫn pass. Benchmark 50 planning phase
  sau tối ưu cache: median khoảng 1.2 ms, P95 2.4 ms, max 4.6 ms trong lượt đo đó.

VFX mới dùng transform/opacity; unit renderer không ghi lại các attribute,
bar hoặc vị trí khi giá trị không đổi. Không thêm timer/animation loop riêng
cho từng unit hoặc Augment. Combat vẫn dùng fixed-step/Worker hiện có.

Các số hiệu năng là đo tại môi trường Chromium test, không bảo đảm mọi
thiết bị đều giữ 60 FPS hoặc <5 ms trong mọi tình huống. Phần cứng, GC,
độ phức tạp passive và tải render vẫn ảnh hưởng.

Không thêm Firestore round sync, không tăng cloud quota, không sửa currency
main game, inventory Collection, card definitions, gacha/weather hoặc Elo table.
Mã test, screenshot, log và assets không nằm trong file ZIP bàn giao.
