# Update 35.6 — Sailing Sea: Treasure Chest

Bản vá nối tiếp Update 35.5.3. Rương báu là phần thưởng tài khoản mới của Sailing Sea; đội tàu, Material, bản đồ và Bounty của mỗi chuyến vẫn được lưu riêng trên thiết bị.

## 1. Thưởng Treasure Chest theo thứ hạng

Khi chuyến đi kết thúc do chiến thắng, chìm tàu hoặc hết Ngày 15, rương được cộng tự động vào **Inventory → Items → Treasure Chest**. Màn hình kết quả hiển thị hình rương, số lượng chính xác và trạng thái lưu.

| Thứ hạng cuối (20 thuyền trưởng) | Số rương |
| --- | ---: |
| 1 | 12–15 |
| 2–3 | 7–9 |
| 4–6 | 4–6 |
| 7–10 | 2–3 |
| 11–15 | 1 |
| 16–20 | 0–1 |

**Cách tính bonus:** mỗi mốc sau cho +1 rương, giới hạn theo khoảng thưởng của thứ hạng: sống sót trọn 1 ngày (360 giây), sống sót trọn 5 ngày (1.800 giây), và có ít nhất 1.000 Bounty cuối chuyến. Ví dụ hạng 1 với cả 3 mốc nhận 15 rương. Hạng 16–20 nhận đúng 1 rương an ủi nếu sống trọn 1 ngày hoặc đã thắng ít nhất một Pirate Crew, Sea Beast hay đánh chìm một tàu.

Không nhân thưởng với Drop Boost hoặc passive nhân vật. Bỏ dở chuyến đi để bắt đầu chuyến mới không tính là kết thúc trận. Chuyến cuối đã hoàn thành từ bản trước cũng được tính thưởng khi vào lại Sailing Sea.

Hệ thống lưu kết quả trước, cộng số rương cùng mã nhận thưởng của chuyến vào Inventory, rồi xác nhận đã nhận. Nếu lỗi lưu xảy ra, dùng **Retry reward save** trên màn hình kết quả; tải lại hoặc xem lại cùng chuyến không cộng thưởng lần hai.

## 2. Inventory và Cloud Save

- Rương là vật phẩm stackable, có mã `treasure_chest`, khung vàng Legendary và hình pixel-art.
- Số lượng được lưu bằng một số nguyên `treasureChests` trong `anime_card_rng_items_v1` (localStorage). Cloud Save và Backup Code mang cùng trường số nguyên này; không nhân bản metadata/hình ảnh của rương trong payload.
- Sailing Sea vẫn chạy offline. Nhận thưởng không ép ghi Firestore: Cloud Save tiếp tục giới hạn đồng bộ tự động 1 giờ như bản 35.5.2. Khi đồng bộ bản lưu mới nhất, số rương đi cùng Inventory.
- Bấm rương để xem ảnh, số lượng sở hữu, mô tả và nút khóa **Unlocks in Upcoming Update**. Hiện chưa thể mở, tiêu thụ hoặc bán rương từ giao diện.

## 3. Xem thử animation ngay bây giờ

1. Mở game sau khi cài bản vá. Có thể đứng ở màn hình chính hoặc mở Inventory.
2. Nhấn **F12 → Console** trên PC và nhập:

```js
window.previewTreasureChestAnimation()
```

3. Hiệu ứng gồm 4 giai đoạn: vòng phép lục giác xoay và rương bay lên; rung tăng dần cùng tia vàng/cyan phát ra từ khe tiền ở giữa ảnh; sóng xung kích, ánh sáng vàng và pixel spark; các ô thưởng bung ra dạng fan-out.
4. **Reveal Now** bỏ qua animation. **Replay Preview** xem lại; **Continue** hoặc X/Esc đóng cửa sổ. Có hỗ trợ desktop/mobile và Reduce Motion.

Các ô thưởng hiện chỉ là minh họa, chưa rút loot và không tiêu thụ rương. Sử dụng hệ thống âm thanh sẵn có (`assets/audio/hextech_open.mp3`, dự phòng `assets/audio/fuse.mp3`; `assets/audio/ball/skill_cast.mp3`, `shield_break.mp3`, `card_equip.mp3` cùng thư mục ball). Không cần thêm MP3 mới.

**Khi hoàn thiện bảng loot ở bản sau:** trong file `chest_opening.js`, điền hàm `openTreasureChestRewards()` (hoặc cấu hình qua `TreasureChestOpening.configureRewards`) và đổi duy nhất cờ mở khóa:

```js
const TREASURE_CHEST_UNLOCKED = true;
```

Bảng loot hiện để trống; nếu bật cờ mà chưa có bảng loot hợp lệ, rương vẫn không bị trừ. Đường mở thưởng đã hỗ trợ giao dịch nguyên tử cho các vật phẩm stackable (danh sách `{id, quantity}` của item đã đăng ký). Animation có sẵn khuôn hiển thị cả thẻ và item; khi thêm thẻ/Relic instance thật cần nối bảng loot với giao dịch cấp thẻ/Relic tương ứng của tài khoản.

## 4. Cài đặt

- Sao lưu thư mục game và tiến trình trước khi cập nhật.
- Giải nén ZIP vào thư mục cùng cấp với `index.html`, ghi đè các file trùng tên.
- **Ảnh bắt buộc:** `assets/items/treasurechest.png`. File ảnh gốc 500 × 500 có nền trong suốt đã được đặt đúng đường dẫn này trong ZIP. Không cần chép bất kỳ assets khác.
- Giữ nguyên Firebase Rules, ảnh/thẻ cũ và các file khác. Hard reload **Ctrl + F5** trên PC; trên điện thoại, tải lại sau khi xóa cache nếu cần.

File code sửa/thêm: `sailing_rules.js`, `sailing_main.js`, `sailing_ui.js`, `inventory.js`, `storage.js`, `cloud_save_codec.js`, `app.js`, `index.html`, `styles.css`, `chest_opening.js` (mới). ZIP chỉ gồm các file này, đúng 1 ảnh rương mới và README.

**Kiểm thử:** đủ 20 thứ hạng, thắng/thua Ngày 15 thực tế, thưởng an ủi khi chìm tàu, tương thích chuyến cũ, phục hồi lỗi lưu trước/sau khi cộng rương, nén/giải nén và kiểm tra Backup Code, xem thử/replay/skip và khóa mở rương trên desktop/mobile. Kiểm thử cơ chế đảo, bão, stamina, Bounty, nâng tàu và gặp địch của Sailing Sea vẫn qua.
