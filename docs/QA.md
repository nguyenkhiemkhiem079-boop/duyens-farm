# QA — Duyên's Farm, Part A

Ngày 11/10/2026, Node 24.19.0/npm 11.9.0. Baseline ZIP, main. Giữ save schema v4.

## Baseline trước sửa

- npm install: lần đầu EPERM proxy; với network hoạt động thất bại ERESOLVE, esbuild 0.25.12 không đáp ứng Vite 8.3.4 optional peer ^0.27/^0.28.
- npm run lint/test/build: tsc/tsx/vite not found vì dependency chưa cài thành công.
- Source có chi tiết buổi hẹn bịa, màu Mon/giả định cưới/tuổi thơ Khim; docs Phase 1 khẳng định quá mức validation và hiệu năng.

## Kết quả sau sửa

| Lệnh | Kết quả thực thi |
| --- | --- |
| Xóa node_modules/package-lock.json/bun.lock rồi npm install | Qua, không --legacy-peer-deps |
| npm ci | Qua với lockfile mới |
| npm run todos | 30 marker file/dòng/nội dung |
| npm run lint | Qua TypeScript |
| npm test | Qua 8 audit +7 regression |
| npm run build | Qua, warning JS >500 kB; ~1,018 kB minified/273 kB gzip |

Audit gốc: footprint/cửa/dỡ-hoàn xu/production/sell/Mon qua đêm/validation-migration cơ bản/orders chống double claim. Regression mới: blocklist toàn content, buổi hẹn/fiction/TODO, generator Unicode/file-dòng/idempotence, output khớp nguồn, màu Mon, hair/eyes và save v4 round-trip/trả đồ một lần.

Chromium headless, SwiftShader, 1440×900: canvas WebGL; click thật ô 4,4 gieo/tưới/thu hoạch, tick tăng tốc tới chín; mở chapter/journal đúng TODO/fiction; download rồi import textarea save v4. Commands trên simulation đang nối renderer kiểm tra chat/gift Khim, Mochi, xây cối xay/production/collect một lần/sell/dỡ, Mon theft với xác suất kiểm soát và overnight return, Mây gift một lần. Ngủ tăng tốc tới ngày29 = summer/ngày1. Không pageerror. Warning shadow map được sửa bằng PCFShadowMap.

Đây là smoke có fixtures/tăng tốc, không phải manual đủ 28 ngày. Chưa xác nhận đầy đủ âm thanh nghe thật, đổi tab thật, mobile, FPS laptop/draw calls. Checklist chưa đánh dấu nghĩa là chưa chơi thủ công xác nhận.

## Checklist một ngày đầy đủ

Dùng profile QA riêng, xuất backup trước import/reset. Ghi browser/OS/save đầu vào/bước tái hiện/console.

- [ ] Mở WebGL/tutorial, UI tiếng Việt, không console error.
- [ ] WASD/click-to-move/xoay/zoom, collision nhà/kho/quầy/biên đảo, hủy thao tác khi đổi hướng.
- [ ] Gieo cả 3 crop, tưới, 4 stage; khô không lớn; ô đã có cây không gieo/trừ năng lượng lại.
- [ ] Thu hoạch chín đúng 1 lần, stage/model và số giỏ đúng.
- [ ] Bán cây và sản phẩm, đúng xu và món bị trừ.
- [ ] Khim chat/gift, trừ quà 1, điểm đúng, chat hôm đó không cộng lại.
- [ ] Mochi theo/pet; Mon idle/catch; Mây/quà đúng 1 lần, TODO tính cách còn rõ.
- [ ] Mon theft 1 món, export/import lúc giữ đồ, bắt lại hoặc ngủ chưa bắt; sáng trả đúng 1, ngủ lần hai không nhân bản.
- [ ] Blueprint ghost xanh/đỏ, R/nút rotate, vị trí hợp lệ/trùng/cửa/ngoài biên, chi phí/thời gian thi công.
- [ ] Dỡ hoàn 75%, occupancy sạch; ghi hành vi ô đất tự xây đang có cây trước dỡ.
- [ ] Production thiếu input bị chặn, trừ đúng, đóng modal chờ, nhận output một lần, chạy recipe khác.
- [ ] Orders đủ/thiếu, xu/tình cảm/năng lượng, không thưởng lại, refresh 2 giây/ngày mới.
- [ ] Salon gội/cắt/màu/kiểu/tip/EXP; từng dân làng chat/gift; permit/mục tiêu thực tế.
- [ ] Chapter/journal/mail/Dream Home: đúng fiction/TODO; ghi unlock/reward lặp/chi phí theo hạn chế.
- [ ] Manual pause/modal/đổi tab30s: không nhảy thời gian, giữ pause cũ; kiểm tra movement/music/production.
- [ ] Autosave/reload/export/download/import file/textarea; đối chiếu cây/xu/build/Mon/chapter/mail; JSON lỗi không đổi save hiện tại.
- [ ] Ngủ chủ động/nửa đêm: hồi năng lượng, ngày +1, giữ crop progress, reset tưới hoặc tự tưới ngày mưa, daily flags reset.

## Checklist mùa 28 ngày

- [ ] Lặp trồng/tưới/thu hoạch/bán/ngủ ngày1–28, export ngày1/14/28/29.
- [ ] 28→29: summer/ngày1/totalDays đúng, cây không mất/héo, build/inventory còn.
- [ ] Thời tiết/mưa/giông/sương/tuyết, reload cùng ngày không reroll; mưa tưới ngày mới, sửa rào không phá cây.
- [ ] Lễ hội xuân ngày15: đóng/mở/reload không nhận lại; nếu thưởng lại ghi lỗi chưa sửa.
- [ ] Orders/daily companion flags reset đúng; Mon đồ không mất qua save/season.
- [ ] Dream Home đủ5stage, đối chiếu vật tư và xu; Chapter4/thư thật vẫn TODO.
- [ ] Thư mùa/journal: phân biệt delivery hoạt động với template chưa nối.
- [ ] Memory khi gieo/thu hoạch/xây/dỡ nhiều lần; không khẳng định no leak nếu chưa đo.

## Hạn chế từ source, chưa sửa gameplay trong cleanup

1. completeStoryChapter/resolveMonMystery chưa chống thưởng lặp; chương không enforce unlock; nút hoàn thành chưa disabled.
2. contributeDreamHome chưa thu requiredCoins; journal thiếu definitions chương3/4.
3. Mail chưa lọc deliveryDay; thư mùa chưa nối; cờ festival chỉ trong modal.
4. validateSaveData chưa sâu; migrateSaveData chưa bổ sung mọi trường cũ, không bảo đảm mọi file lỗi bị chặn.
5. visibilitychange có thể bỏ pause modal/manual; keyboard/path/animation không dùng chung pause, nhạc chưa pause hidden.
6. HUD/crop stage sync không đều tick; WASD không sync playerPos như path; load/import vị trí cần QA.
7. Ô đất tự xây mất userData isPlot khi tạo; map plotMeshes khi dỡ/cây khi build xong cần QA; resources/listeners chưa dispose đủ.
8. Màu mùa chưa đủ, salon màu chưa tính satisfaction/model, quests chưa có manager đầy đủ.

Các giới hạn đã có trong ZIP, không được tuyên bố hoàn thiện. D0 phải dùng chúng làm tiêu chí parity khi bắt đầu lớp render mới.
