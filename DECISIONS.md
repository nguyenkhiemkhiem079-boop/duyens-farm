# Quyết định kỹ thuật — Checkpoint A

## Phạm vi và lịch sử

Chỉ A1–A4. ZIP tác giả là baseline source; main có lịch sử remote riêng chỉ README. Giữ lịch sử remote và mã nguồn được giao, không force-push. Prompt ZIP có thêm E nhưng A trùng prompt đính kèm; không triển khai D/B/E.

## Dependency/build

Không có import esbuild/express/GenAI/dotenv/motion hoặc config autoprefixer/server Express. Gỡ khai báo không dùng, giữ esbuild gián tiếp do tsx quản lý. React 19/Three 0.186/Vite 8/plugin React 6/Tailwind 4 thực tế cài/typecheck/test/build được. Không thêm runtime dependency. Npm lockfile duy nhất, install/ci không legacy peer deps. Vite alias giữ nguyên, dùng import.meta.dirname và base ./; Node >=22.12. PCFShadowMap thay constant đã gỡ của Three để không cảnh báo fallback.

## Nội dung/save

MON_FUR_COLOR là xám tạm, không suy đoán hoa văn. Buổi hẹn chỉ dùng dữ kiện xác nhận; bỏ lời thoại/quote bịa và để TODO. Không suy đoán chuyện cưới/tuổi thơ Khim; không viết thay thư tác giả. Cảnh game tưởng tượng có fiction true và nhãn UI, dữ kiện buổi hẹn/placeholder thư thật có fiction false. Metadata thuộc content definitions, không thêm vào GameState. Giữ save v4/keys, ID và rewards; không cần migration mới.

Generator Node quét UTF-8 source ổn định, file/dòng/nhiều marker, bỏ output để tránh lặp. Fixtures ghép marker thay vì tạo TODO giả trong danh sách tác giả.

## Kiến trúc và QA

Không gọi hiện trạng tách biệt hoàn toàn: simulation còn audio/FarmGrid, FarmScene điều khiển người chơi/state. Giới hạn unlock, validation sâu, pause/sync/disposal nằm trong docs; cleanup giữ gameplay, seam/new renderer thuộc D0.

Giữ 8 audit gốc, thêm 7 regression. Node --import tsx tránh IPC CLI bị sandbox chặn. Hair test raycast triangles theo điểm mặt trước mắt trên các biến thể tóc/trang phục/mũ, tránh bounding box sai với shell tóc; không thay kiểm tra thẩm mỹ browser.

Chromium headless/SwiftShader click cây và UI save, commands nối simulation/renderer cho hành vi bổ sung; season tăng tốc không tương đương manual 28 ngày. Chưa đo FPS/draw calls/triangle hoặc nghe âm thanh thực tế; không giữ các khẳng định tải <0.1 giây/triangle ~1500 của docs/comment như số đo.
