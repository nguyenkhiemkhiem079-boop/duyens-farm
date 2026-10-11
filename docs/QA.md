# QA bản Four Fields cá nhân hóa

Kiểm tra ngày 2026-10-11, Node v24.19.0, npm, Linux. Source upstream snapshot `5ab1b942b6bb5169a0460b3cc682fe34fae76293`.

## Baseline upstream

- Copy subtree `experiences/four-fields` nguyên bản, sửa base để chạy độc lập.
- npm install: thành công, không `--legacy-peer-deps`.
- npm run lint: thành công (TypeScript, upstream không có ESLint).
- npm run build: thành công. Cảnh báo bundle JS >500 kB.
- Upstream không cung cấp script test cho subtree này.

## Sau cá nhân hóa

- Clean install tại thư mục độc lập `/workspace/scratch/four-fields-clean-install`, chỉ copy package.json/package-lock.json và chạy npm ci: thành công, 38 packages; không `--legacy-peer-deps`.
- npm run lint: thành công.
- npm test: 8/8 thành công. Kiểm tra save độc lập với v4, round trip, reload trước khi đọc chuyện, mở trang đúng thứ tự/một lần, dữ liệu lỗi không bị ghi đè, schema lệch/position vô hạn/luống nhảy cóc bị từ chối, lỗi storage không throw, tóc không che mắt của Duyên/Khim.
- npm run build: thành công; JS khoảng 849.23 kB, gzip 230.63 kB. Cảnh báo chunk >500 kB còn tồn tại.
- git diff --check: thành công.

## Browser

Chromium thực chạy với SwiftShader, không chỉ kiểm tra source. Ảnh giao diện ban đầu: viewport 1280×800, DPR 1. Smoke test thu hoạch chạy viewport 960×640, DPR 0.5 để giảm chi phí renderer phần mềm; không dùng kết quả đó làm số đo hiệu năng thiết bị thật. Đã tải được GLB từ CDN và mở màn hình giới thiệu/chơi bằng UI tiếng Việt. Không thấy pageerror trong lần kiểm tra này.

Browser kiểm tra lỗi tải (script browser_error_smoke.py): thành công. Chặn toàn bộ CDN, thấy thông báo tiếng Việt, bản lưu lỗi còn nguyên sau loading và pagehide.

Bài kiểm tra đầy đủ `scripts/browser_smoke.py` đã được tạm dừng theo yêu cầu hẹn giờ của chủ dự án. Trên bản production preview, đã thu hoạch đủ bắp và khoai tây bằng UI, xác nhận hai trang chuyện mở đúng thứ tự và lưu được; đã bắt đầu luống cà chua (1 cây). Chưa hoàn tất toàn bộ 48 cây, chưa xác nhận trang 3/4, kết thúc, export cuối và mobile book. Không coi bản này là checkpoint QA hoàn tất. Script dùng vị trí đứng giữa luống trong bản lưu thử nghiệm để kiểm tra thu hoạch/story; không chứng minh người chơi đã đi xuyên toàn bản đồ. Hai lần thử trước chưa đạt: lần đầu Space kích hoạt lại nút Tạm dừng đang focus; lần sau giả định 1.2 giây thực đủ cho cooldown trên renderer phần mềm. Đã sửa kịch bản để bỏ focus và chờ trạng thái tiến độ, không ghi các lần đó là thành công. Một lần chạy DPR 1 được dừng sau 6 cây vì renderer phần mềm chậm, không ghi là hoàn thành.

## Cách chạy smoke test

Yêu cầu Python Playwright và Chromium đã có sẵn trên máy QA. Không là dependency của người chơi.

```sh
npm run build
npm run preview -- --host 0.0.0.0 --port 3031
# ở terminal khác:
FARM_QA_URL=http://localhost:3031 python scripts/browser_smoke.py
```

Script tạo context riêng, không sử dụng save thật. Fixture chỉ thay vị trí avatar, không tự điền crop harvested hay unlock story. Mỗi cây thu hoạch bằng nút UI/Space. Ảnh kiểm tra và export thử ghi ra `/tmp`.

## Giới hạn

Chưa xác nhận hiệu năng trên GPU/điện thoại thật, chưa có hosting URL cho bản tùy chỉnh. Cần mạng và CDN Mint khả dụng. Chưa xác nhận license riêng của model/âm thanh. Save mới không migrate từ bản cũ. Export chưa có import. Không có cơ chế trồng/tưới trong bản Four Fields gốc và bản này.
