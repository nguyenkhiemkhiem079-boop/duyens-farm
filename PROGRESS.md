# Tiến độ bản Four Fields

Ngày kiểm tra lại: 2026-10-12 (giờ Việt Nam). Bản mới được tách riêng theo yêu cầu giữ ý tưởng nhưng bắt đầu lại; checkpoint A trên `main` vẫn là bản cũ.

## Đã triển khai

- Import nguyên source Four Fields từ snapshot `5ab1b942b6bb5169a0460b3cc682fe34fae76293`, giữ MIT và ghi công.
- Cảnh nông trại, bốn loại cây, điều khiển bàn phím/cảm ứng, rig NPC, âm thanh và pipeline tải GLB của upstream.
- Avatar chơi Duyên, model Khim, Mochi, Mon, Mây. Mochi đi theo Duyên.
- Việt hóa UI, bỏ đếm ngược và thất bại do hết giờ.
- Bốn trang chuyện dựa trên dữ kiện prompt. Chỉ mở sau khi xong từng luống, đọc lại trong sổ chuyện; giữ TODO.
- Save mới, kiểm tra schema/thứ tự tiến độ, autosave, export JSON, bảo vệ dữ liệu lỗi và không đụng save v4.
- Tạm dừng, chặn thu hoạch/di chuyển khi đọc chuyện, xóa phím giữ khi mất focus.
- Static build dùng base tương đối, không cần biến môi trường.

## Chưa triển khai

- Gieo/tưới, bán hàng, salon gameplay, xây nhà, multiplayer, các chương mở rộng.
- Nhập JSON save, đồng bộ tiến độ, offline hoàn chỉnh.
- Thay asset CDN bằng asset có giấy phép phân phối lại được xác nhận.
- Đo hiệu năng trên thiết bị di động thật.

Kết quả kiểm tra thực tế: xem docs/QA.md. Không dùng kết quả kiểm thử của checkpoint A để chứng minh bản này.

## QA bản bắt đầu lại

Đã tiếp tục từ WIP b042d5c. Cài sạch npm ci, lint, 8 tests và build chạy lại thành công. Production browser smoke hoàn tất 48 cây, 4 trang chuyện, victory, đọc lại, export và sổ chuyện responsive; không có pageerror. Browser error smoke giữ nguyên save lỗi khi CDN bị chặn.

Sites riêng tư đã xuất bản thành công, backend xác nhận trạng thái succeeded. Link chơi ở README.md. Bản runtime được QA tại checkpoint d65b927; browser trên URL live cũng đạt: tải asset, thu hoạch và điều khiển màn hình nhỏ. Chi tiết ở docs/QA.md.
