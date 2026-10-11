# Tiến độ bản Four Fields

Ngày kiểm tra: 2026-10-11. Bản mới được tách riêng theo yêu cầu giữ ý tưởng nhưng bắt đầu lại; checkpoint A trên `main` vẫn là bản cũ.

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
- URL hosting cho bản Duyên và đo hiệu năng trên thiết bị di động thật.

Kết quả kiểm tra thực tế: xem docs/QA.md. Không dùng kết quả kiểm thử của checkpoint A để chứng minh bản này.

## Tạm dừng theo yêu cầu chủ dự án

Đã lưu bản WIP, chưa phải passing checkpoint. Automation/timezone sẽ được xác nhận riêng. Điểm tiếp tục và các kiểm tra còn lại ở docs/RESUME.md.
