# Điểm tiếp tục Duyên's Farm

Chủ dự án yêu cầu dừng công việc và tiếp tục lúc 2:00 sáng. Lịch và múi giờ được xác nhận riêng qua automation; không suy đoán đã có lịch từ file này.

## Hướng đã được chọn

Bắt đầu lại, giữ ý tưởng Duyên là nhân vật chính và chuyện thật của Duyên/Khim. Sau đó chủ dự án yêu cầu lấy trực tiếp toàn bộ Four Fields để nhanh. Dùng source MIT của mintdotgg/mint-playground, snapshot 5ab1b942b6bb5169a0460b3cc682fe34fae76293, subtree experiences/four-fields.

Repo: https://github.com/nguyenkhiemkhiem079-boop/duyens-farm.git. Nhánh bản mới: restart/four-fields. Bản cũ checkpoint A vẫn trên main tại b6a295b2ceb0c4ca7213fb143522667a4a5d5f2b; không merge, force-push, ghi đè main hoặc xóa các dữ liệu cũ.

Checkout bản mới ở /workspace/duyen-four-fields. Nếu workspace không còn, lấy nhánh restart/four-fields từ GitHub. Không tiếp tục hai prototype bỏ dở ở /workspace/duyen-garden hoặc /workspace/scratch/duyen-garden-first-prototype.

Đọc CODEX_PROMPT.md đầy đủ và README/PROGRESS/DECISIONS/docs/QA/CREDITS. CODEX_PROMPT giữ yêu cầu/nội dung gốc, nhưng chỉ đạo mới bắt đầu lại và dùng Four Fields đã thay đổi hướng triển khai. Không coi các gameplay cũ đã có trong bản mới. Chưa triển khai Part D/Part B theo checklist cũ.

## Đã làm và chứng minh

- Giữ world/cây/GLB loader/rig NPC/animation/âm thanh/keyboard/touch từ Four Fields. Asset CDN không được chép binary hoặc rehost; giữ LICENSE MIT và ghi công source; giấy phép riêng của model/âm thanh chưa xác nhận.
- Duyên avatar chơi váy vàng, Khim và ba mèo mới; Mochi theo Duyên. UI tiếng Việt, bỏ countdown/punishment.
- 4 trang chuyện từ thông tin đã xác nhận trong prompt; TODO được giữ. Không bịa ký ức, thư hoặc sự kiện đời thật. Nông trại là bối cảnh tượng trưng.
- Save mới duyen_four_fields_v1, không migrate/đụng save v4. Validate thứ tự, bảo vệ save lỗi, export JSON. Chưa import save.
- Cài sạch npm ci tại thư mục độc lập thành công, không legacy-peer-deps. Lint (tsc), 8 tests và build thành công. Bundle cảnh báo >500kB còn tồn tại. Node được test là v24.19.0, upstream yêu cầu >=22.13.
- Chromium đã mở UI và tải GLB thật. Browser_error_smoke.py chứng minh chặn CDN có error tiếng Việt và bản lưu lỗi còn nguyên sau loading/pagehide.
- Production browser_smoke.py đã thu hoạch đủ hai luống đầu, mở đúng 2 story pages, bắt đầu luống 3 (1 cây). Dừng theo yêu cầu chủ dự án, không có assertion failure ở lần đó. Chưa hoàn tất smoke test.

## Việc tiếp theo, theo thứ tự

1. Inspect git working tree, giữ thay đổi người dùng. Kiểm tra thực tế lại các lệnh, không dùng báo cáo này thay thực thi.
2. npm ci khi cần, npm run lint, npm test, npm run build.
3. npm run preview -- --host 0.0.0.0 --port 3031. Khi có Python Playwright + /usr/bin/chromium, chạy FARM_QA_URL=http://localhost:3031 python scripts/browser_smoke.py. Script dùng context thử nghiệm, đặt avatar giữa từng luống qua fixture localStorage; không tự điền harvested/memories. Chờ cooldown theo tiến độ UI. Viewport 960x640 DPR 0.5 do renderer SwiftShader chậm; ảnh giao diện lần đầu kiểm tra 1280x800 DPR1. Không dùng làm số đo hiệu năng điện thoại thật.
4. Nếu test có lỗi, sửa lỗi thực tế, rerun checks thích hợp. Fixture/init scripts nên gộp thành một add_init_script để bảo đảm thứ tự; hiện dùng hai script. Không bỏ assertion để lấy kết quả pass.
5. Kiểm tra mở lại toàn bộ 4 trang, victory, export JSON và responsive/mobile; không tuyên bố touch hardware đã test khi chỉ resize desktop Chromium. Chú ý thanh toolbar cần truy cập được trên story/victory overlay (CSS đã sửa z-index), panel mobile không tràn.
6. Cập nhật README/PROGRESS/DECISIONS/docs/QA/src/content/PLACEHOLDERS với kết quả thật; xóa trạng thái WIP/pending nếu thực sự hoàn tất.
7. Review diff/secrets/generated files; commit hoàn tất và push nhánh restart/four-fields. Không rewrite main hoặc lịch sử WIP.
8. Mục tiêu cuối là chơi trên web. Chưa có URL hosting bản Duyên. Sites skill đã đọc nhưng helper site-workflow.mjs/project-setup.mjs không tìm thấy trong môi trường; chưa tạo hoặc deploy Site. Vercel là fallback: import repo, chọn production branch restart/four-fields, Vite/build npm run build/output dist/Node22, không cần env. Không tạo URL giả hoặc đổi private repo sang public. Nếu chưa có credentials hosting thì báo rõ giới hạn.

Báo cáo và trao đổi với người dùng bằng tiếng Việt, gọn, nói rõ phần thực sự đã hoàn tất.
