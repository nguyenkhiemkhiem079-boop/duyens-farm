# Tiến độ Duyên's Farm

Cập nhật 11/10/2026. Baseline: ZIP tác giả gửi; GitHub main trước bàn giao chỉ có README, commit 6afc3df. Prompt trong ZIP thêm Part E nhưng Part A giống bản đính kèm; giữ nguyên prompt ZIP và chỉ làm Part A.

## Đã làm

- A1: package duyens-farm; bỏ esbuild trực tiếp, express/@types/express, Google GenAI, dotenv, motion, autoprefixer sau quét import/config. Bỏ .env.example, capability Gemini, bun.lock. Npm lockfile mới; Vite ESM dirname/base tương đối, Node >=22.12. Three 0.186 bỏ PCFSoftShadowMap: đổi PCFShadowMap sau warning browser.
- A2: Mon xám placeholder, bỏ suy đoán màu; sửa chapters/journal/quests buổi hẹn, giả định cưới/tuổi thơ Khim. Giữ TODO, nhãn fiction dữ liệu/UI cho cảnh tưởng tượng.
- A3: npm run todos, 30 marker có file/dòng; 7 regression mới bảo vệ nội dung/TODO/Mon/tóc-mắt/save round-trip. Runner node --import tsx tránh IPC pipe CLI bị sandbox chặn, không thêm runtime dependency.
- A4: đọc source, viết lại README/PROGRESS/DECISIONS, thêm docs/QA.md, phân biệt tính năng có và giới hạn.
- Giữ GameState/save v4, save keys, ID chapters/quests/mail/journal, gameplay và rewards hiện có.

## Baseline trước sửa

npm install thất bại ERESOLVE: esbuild 0.25.12 không đáp ứng Vite 8.3.4 peer optional 0.27/0.28. Lần đầu còn EPERM proxy; quyền network cho phép tái hiện ERESOLVE. Lint/test/build đầu tiên không có tsc/tsx/vite vì chưa cài dependency. Không kế thừa báo cáo tests pass từ docs cũ.

## QA Checkpoint A

| Kiểm tra | Kết quả |
| --- | --- |
| Xóa node_modules/npm lock/bun lock, npm install | Qua, không legacy peer deps |
| npm ci | Qua với lockfile mới |
| npm run lint | Qua typecheck |
| npm test | Qua 8 audit gốc + 7 regression mới |
| npm run build | Qua, còn cảnh báo chunk lớn |
| Browser smoke | Chromium headless/SwiftShader, click cây/save UI round-trip qua; commands và season tăng tốc tới ngày 29 |
| Chơi thủ công 1 ngày/28 ngày, âm thanh/tab thật/FPS | Chưa xác nhận đủ; checklist docs/QA.md |

## Giới hạn

Gameplay có farming/Khim/mèo/build/production/orders/villagers/salon/chapters/journal/mail/Dream Home/calendar. Chưa có presentation mới. Unlock/reward lặp, Dream Home chi phí, mail/festival, validation sâu, pause/sync/disposal còn giới hạn cụ thể trong README/QA, không coi là đã sửa.

## Next step — Checkpoint D-1

Chưa bắt đầu D/B/E. Khi được giao Part D: **D0 trước** — interface state/events/commands giữa simulation và renderer, src/render/ mới chạy song song FarmScene. Sau đó **D1** — camera third-person follow/orbit/zoom, WASD/click-to-move collision và chế độ build/isometric. Tiếp **D2** — toy-like procedural world/palette/sky/cloud/mountain/grass/props/crops/ánh sáng/ngày đêm/mùa, giữ gameplay/save. Lint/test/build và QA browser sau mỗi bước; chỉ Checkpoint D-1 khi D0–D2 hoạt động trong lớp mới. Chưa xóa FarmScene trước parity.
