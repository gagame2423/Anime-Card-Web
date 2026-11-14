ANIME CARD RNG — TENSURA / LINKED ACCOUNT UPDATE
Ngày phát hành: 14/11/2026 · Cache: 20261114-tensura-1

CÀI ĐẶT
- Gói chỉ chứa source code cần thiết, README.txt và PASSIVE_AUDIT.txt.
- Giải nén vào thư mục game hiện tại, ghi đè các file trùng tên. Giữ nguyên assets/ đang có.
- Không có assets/, hình ảnh, âm thanh, sprites, backup, test script hay log trong ZIP.
- Deploy source lên GitHub Pages; sau khi upload đầy đủ, Ctrl+F5 trên cả hai máy chơi.

FIREBASE AUTH — GOOGLE + EMAIL/PASSWORD, MỘT UID
- Login vẫn tùy chọn. Local save khởi động ngay; mất mạng/đăng xuất không khóa game.
- Login → Email: đăng nhập, đăng ký hoặc Reset Password.
- Người đang dùng Google: đăng nhập Google trước, rồi Set Email & Password bằng cùng email.
  Dùng EmailAuthProvider.credential + linkWithCredential; không tạo UID thứ hai.
- Người đang dùng Email/Password: đăng nhập trước, rồi Link Google account (linkWithPopup).
- Cả hai cách dùng cùng users/{uid}, recovery và global leaderboard; không đổi key save.
- auth/account-exists-with-different-credential: giữ Google credential tạm trong RAM,
  yêu cầu đăng nhập mật khẩu của tài khoản gốc cùng email, sau đó link vào UID đó.
  Không lưu password/OAuth token trong localStorage hoặc log.
- Nếu credential đã thuộc một UID khác, hiển thị hướng dẫn dùng tài khoản gốc;
  không xóa, tự gộp hai cloud save khác UID hoặc ghi đè tiến trình của tài khoản khác.
- Yêu cầu recent login khi link password: reauthenticate bằng Google rồi thử lại.

THAO TÁC FIREBASE CẦN LÀM
1. Firebase Console → Authentication → Sign-in method: bật Email/Password và Google.
2. Giữ chính sách một tài khoản cho mỗi email; kiểm tra Authorized domains của GitHub Pages.
3. Deploy firestore.rules mới: cho phép google.com và password, vẫn buộc request.auth.uid
   khớp document owner. Không mở quyền anonymous/public write.
4. Kiểm tra thật: Google login → đặt password → logout → Email login; UID phải giống nhau.
   Sau đó thử chiều Email → Link Google. UI có Upload Local Save / Load Cloud Save như trước.
- Không đổi Firebase project, TURN/STUN, quy tắc PvP không thưởng hoặc local-first startup.
- Tài liệu Firebase chính thức:
  https://firebase.google.com/docs/auth/web/account-linking
  https://firebase.google.com/docs/auth/web/password-auth

5 THẺ TENSURA
- Rimuru Demon Lord: Mythic, Dark, 1 in 0, HP 160,000 / ATK 39,100.
  Chỉ tiến hóa Rimuru Lv.100 + 81,208 Slime Dessert. Lần mở mới bắt đầu Lv.1;
  tiến hóa lặp giữ progress đã có của dạng đích và giữ mutation của bản gốc.
  Sage tăng 1–10 mỗi attack; ngưỡng strict >3 / >10 / >40 theo yêu cầu.
  Không cleanse Black Flame. Fatal execution một lần mỗi trận, sau shield/immunity,
  trước các hiệu ứng survive/revive. Shift theo ElementSystem và trở lại Dark khi
  mục tiêu được hạ hoặc rời wave; không sửa element trong card database.
- Veldora: Secret, Electric, Raining only, 1 in 86,000,000; HP 91,300 / ATK 34,900.
  Entry shockwave, Stun heal, mỗi 3 attack Stun rồi suppress passive ở lượt kế tiếp.
- Diablo: Secret, Dark, Eclipse only, 1 in 54,000,000; HP 120,000 / ATK 29,400.
  Hypnosis bỏ một lượt. Hồi 3% khi bị Water hoặc element đang bất lợi đánh vào.
  Lead duel khóa hai unit gốc; teammate không buff/heal/intercept/assist.
  Self-heal/self-buff vẫn được phép. Survive/revive của chính duelist không kết thúc duel.
  Duel kết thúc khi một duelist thực sự bị hạ; entry của reserve được chờ rồi chạy một lần.
  Summon chen frontline không chiếm lượt của duelist và không gây soft-lock.
- Benimaru Jura: Secret, Fire, Sunny only, 1 in 95,000,000; HP 112,000 / ATK 42,700.
  Mỗi 2 primary attacks kiểm tra chain 44%; secondary follow-up có Relic bonuses,
  mỗi hit 30% ATK; tối đa 24 follow-ups để chặn vòng lặp vô hạn.
  Follow-up thứ hai Burn 2 lượt, hit tiếp vào mục tiêu đang Burn thêm Black Flame.
  Từ primary attack thứ 10, Burn còn hiệu lực từ Benimaru chặn shield/positive buffs.
  Follow-ups không tự mở thêm một primary action hoặc đẩy nhanh counter primary.
- Yuuki Kagurazaka: Secret, Holy, 1 in 0; HP 126,000 / ATK 30,900.
  Chỉ Secret Slime Portal; card drop dùng mutation generator chuẩn, tối đa 2 mutation.
  1,000 Soul Energy lúc đầu, +100/kill; >500 survive, >1,500 immune passive damage.
  Mỗi 3 primary attacks đổi một extra passive từ Card Index, tốn 50 Energy.
  Siphon mỗi attack tốn 1; Magician hit tốn 5 và nhận 50% damage, physical x1.25.
  Copy dùng state riêng, không có listener/interval riêng; lease cleanup loại copy cũ,
  stat ledger tạm, các DoT/summons thuộc lease và tham chiếu runtime khi swap/death.
- Category registry thêm Isekai và Draconic. Infinity giữ featured category của tuần
  hiện tại; hai category mới tham gia rotation từ tuần bắt đầu 16/11/2026 UTC. Stats của 206 thẻ trước update giữ nguyên.

SLIME DESSERT / SLIME PORTAL
- Slime Dessert: EXP Food, 3,000 EXP × EXP Multiplier; cũng là nguyên liệu evolution.
- Mỗi 5 phòng THỰC SỰ thắng trong Normal + Material Time Trial, cộng dồn giữa hai mode:
  kiểm tra 80% nhận một Slime Portal; Tier 1 hoặc Tier 2 chia đều.
- Theo xác nhận: EXP Time Trial KHÔNG drop Slime Portal, KHÔNG tăng counter này.
  Skip Room, defeat, sandbox và cùng receipt đã nhận không tăng/drop thêm.
- Namek Portal vẫn 20% mỗi phòng Normal; không ảnh hưởng bởi counter Slime.
- Slime Portal nằm trong Storage → Portals, dùng selector và Battle Arena chuẩn.
- Tier scaling: 1 / 4 / 8.4 / 16 / 40 / 200 (Secret).
- Tier 1 enemies: Diablo 20,000/1,500; Benimaru 35,000/4,000;
  Veldora 70,000/7,500; Rimuru Demon Lord 200,000/17,500 (HP/ATK).
- 6 enemy elements; buff một category Swordman/Isekai/Magician/Hero từ +50% đến +200%.
- Dessert ranges: T1 1–5; T2 4–10; T3 7–15; T4 9–19; T5/Secret 12–24.
- Dùng luật Portal hiện có: 5 attempts, 2 giây/lượt, Party chỉ T4/T5/Secret,
  host cap 10/ngày UTC, slot allocation 2/2 hoặc 2/1/1 hoặc 1/1/1/1,
  guest 50%, MVP 4-player x3 food; Secret card Solo 100% / Party 10%.
- Secret Portal bị tiêu thụ sau một victory. Auto Continue chỉ lấy đúng TYPE và TIER,
  không dùng nhầm Namek cho Slime hoặc đốt Secret/higher tier khi thiếu item cùng tier.

DROP MULTIPLIERS
- Normal quantities vẫn scale: coins/shards, Bread/EXP Food và materials thông thường;
  Hakari/Nami/Aqua reward aura và bonus profile vẫn áp dụng đúng battle context.
- Special item drops luôn quantity 1: Pride Sun, Gojo Eye, Mangekyo Eye, Excalibur Sword,
  Cursed Finger, Wave 50 Machete/Headless item; không nhân tỷ lệ hoặc số lượng.
- Portal items, Secret Portals, special cards và Relic instances không nhân Drop Multiplier.
  Secret card không bị MVP duplicate. Halloween chance x2 vẫn là seasonal rule riêng.
- Các rare-drop probabilities gốc giữ nguyên. Pending receipt hợp lệ từ save cũ vẫn được
  phục hồi; không xóa pending reward khi nâng version.

BATTLE BUG FIX / PERFORMANCE
- Sửa recursion giữa runtime proxy Sins/Tower 200: mỗi view chỉ compose một lần,
  WeakMap giữ identity ổn định; không chồng wrapper mỗi lần render/đọc state.
- Portal combat cung cấp battle/runtime trước onEntry và giữ getters an toàn lúc init;
  sửa lỗi Cannot read properties of undefined (reading battle) trong log callback.
- Infinity giữ player HP/buffs/counters, dọn reference enemy đã rời wave và isolation cũ.
  Tower entry vẫn tạo unit mới từng trận, không tái dùng status của tầng trước.
- Deterministic hooks trong tensura_passives.js, dùng RNG của battle, không Math.random
  riêng trong passives; không thêm timers/DOM listeners cho từng copied passive.
- Benimaru tích hợp Enten follow-up bonus; basic follow-up không nhận special damage bonus.
- Không đổi công thức/scaling enemy modes khác, level cap, EXP Trial conversion,
  weather/mutation math, combat speed potions, Penalty Kick hoặc cấu hình online.

ASSET PATHS ĐƯỢC CODE THAM CHIẾU (KHÔNG KÈM FILE)
- assets/cards/rimurudemonlord.png
- assets/cards/veldora.png
- assets/cards/diablo.png
- assets/cards/benimarujura.png
- assets/cards/yuukikagurazaka.png
- assets/items/slimedessert.png
- assets/items/slportal.png
Dùng đúng tên/case trên với artwork đang có của bạn, hoặc sửa image field nếu tên khác.

VERIFICATION
- node --check cho toàn bộ 85 JS modules; 90 local HTML references có đủ code file.
- 49 focused Tensura combat checks; strict thresholds, execution, shift, immunity,
  delayed suppression, isolation, follow-up guard và copy swaps.
- 67 content/Portal/food/evolution/save checks; EXP exclusion, receipts và repeat evolution.
- 211 seeded passive scenarios (18 turns), 210 copy/execute/cleanup scenarios (2 own turns).
- Edge checks: copied The One cleanup, Black Flame, isolation qua revive và Crow summon,
  Soul passive immunity; 100 Infinity transitions và 21 fresh mixed-passive Tower matches.
- Regression Sins: 67 checks; event/evolution/Infinity/reward suite: 52;
  1,000 non-repeat Boss rotation windows; standard quantity x6; Spooky 50 waves.
- PvP deterministic snapshots: existing Sins teams 120 steps và Tensura teams 84 steps,
  mỗi loại 3 seeds; không thay localStorage hoặc phát thưởng.
- Auth mock SDK: Google→password, Email→Google, same UID, collision recovery,
  reset, logout và token provider password được phép Cloud sync.
- UI 1440px / 390px: Login form, shared Portal selector/start/logs, 8 turns,
  không overflow ngang hoặc stack/log exceptions; evolution storage-failure rollback.
- Đây là các scenario kiểm chứng, không phải chứng minh mọi tổ hợp 211 passive/Relic/mutation.
  OAuth/email thật và cross-network WebRTC cần kiểm tra sau khi deploy cấu hình Firebase.

Modified Files Note
- akatsuki_passives.js
- app.js
- boss_event.js
- cards.js
- category.js
- combat_stats.js
- evolution.js
- exp_food.js
- firebase.js
- firestore.rules
- index.html
- infinity_cloud.js
- infinity_rules.js
- passives.js
- portal_combat.js
- portal_rules.js
- portals.js
- portals_party.js
- raid.js
- relics.js
- sins_passives.js
- spooky.js
- startup.js
- storage.js
- styles.css
- tensura_passives.js
- tower_200_passives.js
- README.txt
- PASSIVE_AUDIT.txt
