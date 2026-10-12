# QA bản Four Fields cá nhân hóa

Kiểm tra lại ngày 2026-10-12 (giờ Việt Nam), Node v24.19.0, npm, Linux. Source upstream snapshot `5ab1b942b6bb5169a0460b3cc682fe34fae76293`.

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

Production smoke test `scripts/browser_smoke.py`: **thành công**. Đã thu hoạch 48/48 cây bằng Space/nút UI, mở 4/4 trang chuyện đúng thứ tự, xác nhận màn kết thúc, đọc lại trang đầu, xuất JSON có đủ bốn trang, và kiểm tra sổ chuyện ở viewport 390×844 không tràn ngang. Không có pageerror. Fixture chỉ đặt avatar giữa từng luống; không tự hoàn tất cây/trang chuyện và không chứng minh việc đi xuyên cả bản đồ. Pause chặn thu hoạch đã được kiểm tra.

Lượt trước đã được tạm dừng theo yêu cầu của chủ dự án sau hai luống và một cây cà chua. Lượt mới chạy lại từ đầu và hoàn tất cả bốn luống. Kịch bản đã gộp initialization thành một script để bảo đảm thứ tự. Các lần thử cũ gặp vấn đề focus nút Pause hoặc giả định cooldown trên renderer phần mềm; không dùng chúng làm kết quả pass.

Sites backend xác nhận **succeeded** tại deployment `appgdep_6acc2378d5c081918b36f4880de5e509`, source checkpoint `d65b9271e8e7ef60808a9a4008e65cb59f72e400`. Site owner-private, chỉ một owner được phép truy cập. Archive chứa manifest hosting và dist, có LICENSE/CREDITS; không có token, source credentials hoặc GLB/MP3 từ CDN. Browser trên URL live: **thành công**. HTTP 200 với service credential chính thức của Sites (chỉ gửi header đến đúng Site), tải GLB thật, vào game và thu hoạch một cây qua UI. Ở viewport 390×844, dùng nút điều hướng, xác nhận vị trí Duyên đổi qua save, pause/resume và nút Thu hoạch hiển thị; không tràn ngang và không có pageerror. Không phải thiết bị điện thoại thật, và không kiểm tra đăng nhập OAuth tương tác của người chơi bằng bài service-access này. Không lưu credential vào source hoặc ảnh kiểm tra. Lượt thử đầu sai định dạng header và lượt thử di chuyển trong lúc animation thu hoạch còn khóa đã được sửa ở kịch bản QA; không thay logic game để bỏ khóa.

## Cách chạy smoke test

Yêu cầu Python Playwright và Chromium đã có sẵn trên máy QA. Không là dependency của người chơi.

```sh
npm run build
npm run preview -- --host 0.0.0.0 --port 3031
# ở terminal khác:
FARM_QA_URL=http://localhost:3031 python scripts/browser_smoke.py
```

Script tạo context riêng, không sử dụng save thật. Fixture chỉ thay vị trí avatar, không tự điền crop harvested hay unlock story. Mỗi cây thu hoạch bằng nút UI/Space. Ảnh kiểm tra và export thử ghi ra `/tmp`.

## Độ phức tạp model cá nhân

Đếm từ geometry thật bằng Node/tsx (không phải đo draw call của cả cảnh):

| Model | Mesh | Tam giác |
| --- | ---: | ---: |
| Duyên | 29 | 6.136 |
| Khim | 32 | 5.576 |
| Mochi | 16 | 4.040 |
| Mon | 14 | 3.336 |
| Mây | 14 | 3.336 |

Chưa đo FPS trên GPU thật hoặc tổng draw call của toàn cảnh. Renderer phần mềm chậm nên bài smoke test chờ trạng thái cooldown, không giả định thời gian frame.

## Giới hạn

Chưa xác nhận hiệu năng trên GPU/điện thoại thật. Link hosting riêng tư đã có; người chơi cần đăng nhập tài khoản chủ dự án. Cần mạng và CDN Mint khả dụng. Chưa xác nhận license riêng của model/âm thanh. Save mới không migrate từ bản cũ. Export chưa có import. Không có cơ chế trồng/tưới trong bản Four Fields gốc và bản này.
