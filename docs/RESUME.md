# Tiếp tục bản Four Fields của Duyên

Yêu cầu hiện hành: bắt đầu lại, giữ ý tưởng nhân vật Duyên/cốt truyện thật và dùng trực tiếp source Four Fields MIT để nhanh. Bản mới ở nhánh restart/four-fields, repo https://github.com/nguyenkhiemkhiem079-boop/duyens-farm.git. Bản cũ main vẫn tại checkpoint A b6a295b2ceb0c4ca7213fb143522667a4a5d5f2b. Không force-push, ghi đè main hoặc dữ liệu v4.

Đã tiếp tục sau lần tạm dừng. Mốc 2:00 sáng giờ Việt Nam đã qua khi chủ dự án yêu cầu “tiếp tục”; không tạo lịch cho ngày mai và không có automation hẹn giờ đang chờ từ công việc này.

## Trạng thái đã xác nhận

- Checkpoint d65b927: npm ci không legacy-peer-deps, lint, 8 tests và build đều pass; full production smoke test thu hoạch 48 cây, mở 4 trang chuyện, victory, đọc lại, export JSON và mobile book đều pass, không có pageerror.
- Source upstream snapshot 5ab1b942b6bb5169a0460b3cc682fe34fae76293. Giữ MIT/Lucas Ochs-Messick. Asset tải CDN, không rehost binary; giấy phép riêng chưa xác nhận.
- Duyên là avatar chơi, Khim và ba mèo là model lập trình mới; Mochi theo Duyên. UI tiếng Việt, không đếm ngược/thất bại. Story chỉ dùng dữ kiện prompt, giữ TODO.
- Save duyen_four_fields_v1 độc lập; không migration v4, chưa import hoặc sync. Save lỗi được bảo vệ/export nguyên văn.
- Sites riêng tư đã deploy thành công. Site identity ở .openai/hosting.json; URL và kết quả QA ở README.md/docs/QA.md. Luôn get_site trước khi sửa/publish, giữ audience; không create_site lại hoặc đổi sang public.
- Bản mới chưa triển khai các checklist Part D/Part B của engine cũ. Không coi các tính năng cũ (trồng/tưới/kinh tế/salon/xây nhà) đã tồn tại trong bản Four Fields này.

## Khi làm tiếp

Đọc CODEX_PROMPT.md đầy đủ cùng README/PROGRESS/DECISIONS/docs/QA/CREDITS và actual source. Chỉ đạo mới dùng Four Fields thay đổi hướng so với prompt cũ; dữ kiện cá nhân và yêu cầu không bịa ký ức vẫn áp dụng. Inspect working tree trước khi sửa, giữ thay đổi người dùng. Chạy kiểm tra thật, không dựa trên báo cáo cũ.

Checkout hiện tại /workspace/duyen-four-fields; nếu không còn, lấy nhánh restart/four-fields. Không tiếp tục các prototype bỏ dở ở /workspace/duyen-garden hoặc scratch/duyen-garden-first-prototype.

Nếu cần publish: dùng project_id hiện có; native source credential chỉ qua stdin/session, không lưu token. Push đúng source SHA lên repo Sites, build từ source đó, archive chỉ gồm .openai/hosting.json và dist, rồi publish owner-private. Helper plugin local không có trong môi trường; native Git + publisher archive đã thực thi thành công. Không đổi quyền riêng tư để làm automation hoặc QA.

Báo cáo bằng tiếng Việt. Hướng mở rộng cần theo yêu cầu tiếp theo của chủ dự án; hiện chưa có trồng/tưới, multiplayer, ảnh cá nhân, voice, nhà mơ ước gameplay hoặc story arcs nâng cao. Giữ các placeholder, không tự thêm ký ức/chi tiết đời thật.
