# Duyên's Farm — Nông trại của Duyên

Game nông trại 3D TypeScript + React + Three.js + Vite, món quà Khim dành cho Duyên. Lần bàn giao này chỉ thực hiện **Part A — cleanup/QA**; chưa bắt đầu Part D/B/E.

## Cài đặt và chạy

Yêu cầu Node.js >=22.12 và npm. Lần kiểm tra dùng Node 24.19.0/npm 11.9.0. Không cần API key hoặc `.env`.

```bash
npm install
npm run dev
# Dev server cổng 3000
npm run todos
npm run lint
npm test
npm run build
npm run preview
```

Checkout có lockfile có thể dùng `npm ci`; không cần `--legacy-peer-deps`. `lint` là TypeScript typecheck, chưa có ESLint. Build tạo `dist/`, base tương đối `./`; cần phục vụ bằng HTTP. Không commit dist/node_modules/file môi trường.

## Những gì thực sự có

| Hệ thống | Hiện trạng trong source |
| --- | --- |
| Nông trại | Lưới cố định 12×12, 16 ô trồng mặc định, nhà/kho/quầy/cây/rào procedural |
| Điều khiển | WASD/mũi tên, click-to-move với A*, kéo chuột phải xoay, wheel zoom; camera diorama |
| Trồng trọt | Cà rốt/lúa mì/cà chua, hạt miễn phí, tưới, 4 stage, thu hoạch, bán cây và sản phẩm |
| Thời gian | 360 giây/ngày, ngủ hồi năng lượng, bảo toàn cây, tự ngủ nửa đêm |
| Khim/mèo | Khim có lịch trình/chat/gift; Mochi theo Duyên/vuốt ve; Mon lấy 1 nông sản/bắt lại/trả qua đêm; Mây có quà mỗi ngày |
| Xây dựng | Blueprint, footprint theo dữ liệu, xoay 90°, bảo vệ ô cửa, thi công có thời gian, dỡ hoàn 75% xu |
| Chế biến | Cối xay/lò bánh/máy ép: bột, bánh cà rốt, bánh cà chua, nước ép và sốt cà chua |
| Đơn hàng | 3 đơn ngẫu nhiên, trừ nguyên liệu/thưởng, thay đơn sau 2 giây và ngày mới |
| Dân làng | Bảy/Hoa/Lan/Minh có lịch trình hiển thị, chat và quà yêu thích |
| Nội dung | 4 chương hội thoại, vụ án Mon, sổ kỷ niệm, 4 thư, Dream Home 5 hạng mục |
| Salon | Gội/cắt độ dài/chọn màu/kiểu, tip và EXP tay nghề |
| Mùa | 4 mùa ×28 ngày, thời tiết xác định theo ngày; mưa tưới khi sang ngày; giông tạo việc sửa rào |
| Khám phá | Modal rừng/hồ/đồi/hang trừ năng lượng và nhận đồ; chưa có vùng 3D riêng |
| Save/cài đặt | localStorage v4, tìm khóa v1–v3/migration cơ bản, JSON export/import; Web Audio SFX/nhạc tổng hợp, giảm hạt mưa/tuyết |

## Kiến trúc

- `src/core/`: types, hằng số, công trình/công thức/đơn hàng và Web Audio.
- `src/systems/`: GameSimulation và saveSystem.
- `src/content/`: tiếng Việt, dữ kiện xác nhận/fiction/TODO. quests.ts có định nghĩa mục tiêu, chưa có manager mục tiêu đầy đủ.
- `src/world/`: lưới/A* độc lập Three.js; FarmScene chứa WebGL, raycast, input, chuyển động và tick.
- `src/models/`: hình học procedural; Duyên/Khim đã có chibi và named parts. Hai kiểu tóc/trang phục Duyên là tùy chọn tạo model, chưa có tủ đồ runtime.
- `src/ui/`: HUD/toolbar/blueprint/save/tutorial và modal gameplay.
- `src/tests/`: 8 audit gốc + 7 regression Part A.
- `scripts/todos.mjs`: quét marker TODO, ghi file/dòng/nội dung vào PLACEHOLDERS.md.

Simulation không import React/Three, nhưng vẫn gọi audio và nhập FarmGrid. Renderer trực tiếp cập nhật người chơi/state; chưa có seam D0.

## Nội dung cá nhân

Buổi hẹn chỉ giữ quán cà phê sách, Khim hơi xuề xòa nhưng đã cố gắng chuẩn bị, hai người trò chuyện đủ thứ. Chi tiết khác là TODO. Mon dùng MON_FUR_COLOR xám tạm, chưa khẳng định màu lông. Tên salon/quán, tính cách Mây, thư ba mẹ, Chương 4 và thư cuối cần tác giả xác nhận.

Cảnh tưởng tượng có `fiction: true` và nhãn UI; Chương 1/placeholder thư thật có `fiction: false`. Không viết lời mẫu như ký ức thật. Danh sách [PLACEHOLDERS.md](src/content/PLACEHOLDERS.md) có **30 lần xuất hiện TODO**; chạy `npm run todos` sau sửa source.

## Phần chưa hoàn chỉnh

- Unlock chương mới là mô tả; simulation chưa chặn thưởng lại chapter/mystery. Nút chương đã hoàn thành vẫn có handler.
- Dream Home UI kiểm tra xu nhưng simulation chưa thu requiredCoins. Journal thiếu định nghĩa trang Chương 3/4 dù state có khóa.
- Thư chưa lọc deliveryDay; thư theo mùa là template chưa nối hệ thống. Festival là nút thưởng/cờ modal, mở lại có thể nhận lại.
- Salon chưa tính màu vào satisfaction hoặc thay model; EXP là tay nghề. Một số permit/quest chưa có flow unlock đầy đủ.
- Save validation mới kiểm tra cấp cao; migration chưa bổ sung mọi trường thiếu. Test migration cơ bản không chứng minh mọi save v1 đều chơi được.
- Đổi tab có thể bỏ pause thủ công/modal; chuyển động chưa dùng chung pause. HUD/crop stage chưa sync đều theo tick, WASD/playerPos và vị trí import cần QA.
- Ô đất tự xây/userData và map khi dỡ cần QA; renderer tạo lại mesh, chưa dispose đầy đủ resource bị gỡ/listener; màu mùa chưa áp dụng đủ.
- Chưa có third-person camera, land expansion, level/XP toàn game, shop, offline progress, arc engine, gallery, ảnh/ngày đặc biệt Part E.

Các giới hạn được ghi nhận, chưa tuyên bố game hoàn thiện. Chi tiết [docs/QA.md](docs/QA.md).

## QA thực tế

11/10/2026: npm install sạch và npm ci không legacy peer deps; lint, **15 tests** và build qua. Chromium headless/SwiftShader render WebGL, click gieo–tưới–thu hoạch, đọc nội dung và save UI round-trip qua; một số hành vi qua simulation commands, mùa tăng tốc đến ngày 29. Chưa chơi thủ công đủ 28 ngày/kiểm tra âm thanh, tab thật hoặc FPS laptop.

Build cảnh báo JS >500 kB: khoảng 1,018 kB minified/273 kB gzip. Chưa đo FPS/draw calls/triangles, không dùng ước tính trong comment làm kết quả đo. Model đều procedural, không thêm asset bên thứ ba.
