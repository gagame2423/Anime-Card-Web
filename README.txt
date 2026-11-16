ANIME CARD RNG — AUTO CHESS TEAM PLANNER, RELIC DRAG & SHARED DRAFT
Ngày: 16/11/2026 • Build: 20261116-autochess-polish-1
Patch áp dụng trên autochess-profile-relic-leaderboard-patch trước đó.

TÍNH NĂNG MỚI
- Team Planner thay selector Target Cards: roster 8 ô có portrait/rarity frame,
  thêm từ card pool, bấm ô đã có thẻ để bỏ, Clear Team, search và bộ lọc Cost /
  Rarity, Category, Element. Lựa chọn cũ được giữ nguyên bằng cùng localStorage
  key anime_card_rng_ac_targets_v1. Tối đa 8 card ID khác nhau, không đổi shop odds.
- Live Trait Preview gọi trực tiếp AutoChessSynergies.analyze. Đếm distinct cards,
  không cộng Augment crests hoặc Relic. Xếp Prismatic -> Gold -> Silver -> Bronze
  -> Partial theo engine; có icon frame, count/next breakpoint, tier pill, stat
  summary và effects thật. Mở Active bonuses để đọc toàn bộ hiệu ứng của tier.
- Host Card hiện 8-slot miniature team và tối đa 3 trait đang active; nút cạnh
  Shop cũng mở cùng planner. Card đã chọn xuất hiện trong Shop có glow gold/cyan,
  shimmer và badge TEAM PLAN. Mọi UI mới/đã sửa trong task này dùng English.
- Layout obsidian/glass, trim gold/cyan, rarity frames, hover/entry transitions
  180ms; planner riêng có layout compact landscape và split portrait.

CÂN BẰNG & SỬA LỖI
- Khôi phục PointerEvent drag Relic -> Relic trong stash: 2 non-Unique cùng tier
  upgrade ngay. Common -> Rare; Rare -> Legendary; 2 Legendary -> Unique Legendary.
  Không cần cùng item kind. Compatible slots có glow, hovered target sáng cyan.
- Relic -> Board/Bench vẫn equip trong Planning. Click-to-select/click-to-fuse
  vẫn dùng được. Tooltip ẩn ngay khi drag bắt đầu, không nhận lại hover/click do
  pointer capture; ghost và toàn bộ descendants/pseudo không bắt pointer nữa.
- Upgrade có flash 220ms ×2. Cancel/drop ra ngoài/blur/resize bỏ ghost, capture và
  target glow. Giữ icon giữa stash và rich tooltip ngoài lúc drag.
- Solo Combat vẫn chỉ cho forge lên future roster; không equip vào fighter đang
  đánh. Multi-Human Live Combat vẫn chặn fusion để giữ deterministic simulation.
- Draft AI không còn đánh giá tất cả bot trong cùng tick 700ms. Mỗi bot có thời
  điểm pick riêng theo seed, release wave và thứ tự draft; tối đa một AI claim
  trong một tick. Human picks và Comeback release order giữ nguyên.
- Carousel giữ nguyên 9 DOM nodes trong cả phase; claim chỉ đổi badge/state của
  slot tương ứng. Avatar chỉ update khi HP/name/release thay đổi. Rotation dùng
  transform + cached size từ ResizeObserver, không đọc layout mỗi frame.

THÔNG SỐ & CÔNG THỨC CHI TIẾT
- Reaction delay = 0.650 + (seedHash % 751)/1000 giây, tức 650–1400ms.
  pickAt = max(releaseAt, previousBotPickAt) + reactionDelay.
  Stage 1 releaseAt=0; stage sau releaseAt=floor(draftOrderIndex/2) ×5s.
  Scheduler dựa draftElapsed của host, không dùng setTimeout riêng từng bot.
- Priority = card score theo rank/personality + Relic value theo logic đang có.
  Tính đúng một lần cho từng bot/card trong carousel; sort giá trị đã tính rồi
  chọn card unclaimed đầu tiên trong ranking cache. Human lấy card trước không
  làm bot tính lại toàn bộ roster. AI takeover thêm cache riêng cho ghế mới.
- Cache reset mỗi carousel, bỏ khi sang Planning; JSON/plain data, không listener
  hay timer theo unit. Shop/economy/positioning/equipment logic của bot giữ nguyên.
- Solo Finish Draft vẫn fast-forward lập tức bằng ranking cache. Deadline còn
  auto-pick cho ghế chưa chọn để không soft-lock; đây là đường skip/timeout, không
  phải các pick bot mặc định hiển thị theo thời gian thường.
- Relic target highlight dùng cùng canFuseRelics predicate của model. Đổi tier
  vẫn do model transaction xử lý; tooltip/ghost không tự consume item. Unique,
  khác tier hoặc thả lại cùng slot không được đánh dấu hợp lệ.
- Trait count lấy exact analyze/THRESHOLDS và tierDetails của engine: 2/4/6/8.
  Active preview nêu tier hiện tại; Partial nêu lần unlock kế tiếp. Roster trong
  planner là kế hoạch độc lập, không thay board/bench hoặc cấp buff trong trận.
- Glow/feedback là CSS; không thêm timer lặp. Reduced-motion tắt animation mới.
  Không đổi Elo, lifetime Profile, cloud/run schema, Firestore rules hoặc quotas.

HƯỚNG DẪN SỬ DỤNG & KIỂM TRA
1. Chép đè chỉ các file trong patch lên bản Profile/Relic/Leaderboard trước đó.
   index.html và Worker import URL đã đổi cache tag; hard refresh sau cập nhật.
2. Mở Team Planner từ Host Card hoặc icon cạnh Shop. Chọn tối đa 8 card, đọc
   trait preview, mở Active bonuses; đóng planner vẫn giữ roster qua F5.
3. Trong Planning, giữ/kéo Relic sang slot có glow hoặc lên unit Board/Bench.
   Trong Solo Combat, chỉ kéo Relic cùng tier để fuse; fighter đang đánh giữ
   snapshot cũ. Click-to-click là fallback và dùng cùng luật, không nhận hai lần.
4. UI vừa cập nhật dùng English. Nội dung Guide/Profile cũ ngoài phạm vi task
   được giữ nguyên. Không có assets/media, screenshot, test, log hoặc backup
   trong patch; chỉ source thay đổi và README changelog này.

ĐÃ KIỂM TRA
- Model: 7 reaction times tách riêng, release waves, cache không đổi sau picks,
  state validation, exact engine preview/count/tier, 8-unit cap, duplicate IDs.
- Browser: Team Planner đủ 217 card, filters/remove/persist, all new labels English,
  TEAM PLAN shop highlight; geometry ở 1440×900, 844×390, 390×844 và 498×251.
- Mouse drag: valid glow, immediate tooltip hide, 2-for-1 result, bench equip,
  upgrade flash. Touch PointerEvents: fusion, Board equip và cancel cleanup.
- Session: 7 staggered AI claims, cả 9 carousel nodes giữ identity, transform
  rotation. Native/Worker combat tương đương; 8 PeerJS mock clients cùng champion,
  mỗi người tối đa 1 Query +1 Write; 120 low-rank AI parity comparisons qua.
- Không xác minh FPS/NAT trên thiết bị thật. Tối ưu giảm scoring/DOM/layout work;
  test headless không phải cam kết mọi máy đều đạt 60 FPS.
