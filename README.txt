NHẬT KÝ CẬP NHẬT — MATERIAL ITEM ICONS
Ngày: 31/10/2026

- Cập nhật image cho đủ 20 Material theo đúng filename trong assets/items/.
- Registry áp dụng ảnh mới cho item đã có trong save, giữ số lượng hiện tại.
- Giữ fallback icon nếu ảnh chưa được upload hoặc không tải được.
- Không đổi ID, tên, xác suất drop, điều kiện element, recipe hoặc gameplay.

DANH SÁCH ASSET
Silver Ore: assets/items/silverore.png
God Flowers: assets/items/godflowers.png
Electric Ore: assets/items/electricore.png
Mineral Ore: assets/items/mineralore.png
Chain: assets/items/chain.png
Calcite: assets/items/calcite.png
Unknown DNA: assets/items/unknowndna.png
Lapiz Ore: assets/items/lapizore.png
Corundum: assets/items/corundum.png
Aqua Tear: assets/items/aquatear.png
Holy Dust: assets/items/holydust.png
Dragon Tooth: assets/items/dragontooth.png
Monster Egg: assets/items/monsteregg.png
Icey: assets/items/icey.png
Leaf: assets/items/leaf.png
Veggie: assets/items/veggie.png
Dark Dust: assets/items/darkdust.png
Ancient Bone: assets/items/ancientbone.png
Gold Ore: assets/items/goldore.png
Dark Fragment: assets/items/darkfragment.png

MODIFIED FILES NOTE
- materials.js: bảng filename và thuộc tính image cho 20 Material.
- index.html: đổi cache tag riêng materials.js thành 20261031-material-icons-1.
- README.txt: chỉ changelog bản cập nhật icon này.

KIỂM TRA VÀ TRIỂN KHAI
- Kiểm tra cú pháp materials.js và đối chiếu đủ 20 path trong registry.
- Kiểm tra các thông số drop không đổi và số lượng item cũ được giữ nguyên.
- Upload đúng PNG vào assets/items/, giữ nguyên chữ hoa/thường của filename. Gói nguồn không kèm hoặc tạo ảnh, Excel hay script test.
- Upload nguồn cập nhật và Ctrl+F5 để tải materials.js mới.
