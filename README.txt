GOD LEAF — LEGENDARY HUMAN REQUIREMENT HOTFIX
Ngày: 17/11/2026 • Build: 20261117-god-leaf-human-2
Áp dụng sau bản autochess-content-relic-hotfix-patch.

TÍNH NĂNG MỚI
- Không thêm tính năng. Đây là bản sửa yêu cầu trang bị của God Leaf.

CÂN BẰNG & SỬA LỖI
- God Leaf Legendary chỉ kích hoạt HP/ATK khi thẻ có Category Human.
- Bỏ điều kiện Element ngẫu nhiên. Thẻ Human được nhận bonus ở mọi Element;
  thẻ không có Human không nhận bonus HP/ATK, kể cả trùng Element cũ.
- Main Game và Auto Chess dùng cùng quy tắc. Tooltip, crafting description,
  matching team cards và AI đánh giá Relic tự cập nhật theo Category Human.
- Không reroll hoặc xóa God Leaf đã lưu. UID, binding, chỉ số đã roll và
  dữ liệu replay cũ được giữ nguyên; Element lưu trong metadata cũ bị bỏ qua.
- Đổi cache URL cho relics.js ở trang chính và Combat Worker để bản sửa được tải.

THÔNG SỐ & CÔNG THỨC CHI TIẾT
- Common: +2–5% HP và +2–5% ATK, yêu cầu Human.
- Rare: +4–10% HP và +4–10% ATK, yêu cầu Human.
- Legendary: +6–12% HP và +6–12% ATK, yêu cầu Human.
- Unique Dodge giữ nguyên: +1–5%, tối đa 80% tổng Dodge; bỏ qua bonus nếu
  Dodge hiện có đã trên 80%. Không thay đổi những hiệu ứng Unique khác.

HƯỚNG DẪN SỬ DỤNG
1. Chép đè 3 source files trong patch: relics.js, index.html,
   autochess_combat.js. README.txt này ghi riêng thay đổi của hotfix.
2. Hard refresh trang; đóng và mở lại Auto Chess để Worker tải quy tắc mới.
3. God Leaf Legendary trên thẻ Human hoạt động bất kể Element. Trên thẻ
   không có Human, tooltip ghi base bonus không hoạt động.
4. Patch không chứa assets, media, source không thay đổi hoặc test scripts.
