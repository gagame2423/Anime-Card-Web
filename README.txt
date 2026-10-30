NHẬT KÝ CẬP NHẬT — GIAO DIỆN KẾT QUẢ PORTAL
Ngày: 30/10/2026

- Xóa nút Exit to Storage khỏi màn kết quả Portal và gỡ listener tương ứng. Nút đóng Arena ở header vẫn dùng để thoát như trước.
- Đặt một nút Continue / Next Match trong hàng battle-result__actions chuẩn, sử dụng battle-primary-button. Bổ sung viền cyan/green, glow, padding kế thừa Arena, hover nhẹ, focus bàn phím và hỗ trợ reduced motion.
- Thay checkbox không có track bằng chính cấu trúc switch Arena: battle-auto-continue, input role=switch, battle-auto-continue__track và chỉ báo ON/OFF.
- Nhãn ngắn Auto Continue; bỏ chuỗi same Tier only ở cả thiết lập và kết quả. Hai switch đồng bộ và khôi phục trạng thái đã lưu ngay khi mở game.
- Giữ nguyên chốt thưởng, luật tiếp tục cùng Tier, tiêu thụ Secret, mutation, co-op và các mode khác. Không sửa chỉ số thẻ.

MODIFIED FILES NOTE
- index.html: bỏ Exit, đặt controls ở hàng action chuẩn, class nút chính và switch Arena; cache tag 20261030-portal-ui-3.
- portal_combat.js: gỡ listener Exit đã xóa; đồng bộ switch và nhãn ON/OFF.
- styles.css: polish nút chính, focus/hover/reduced motion; kế thừa bố cục Arena.
- README.txt: chỉ changelog bản sửa giao diện này.

Upload toàn bộ nguồn, giữ assets hiện có và Ctrl+F5. Gói không chứa Excel, test runner, log hoặc ảnh.
