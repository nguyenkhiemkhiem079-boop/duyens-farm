# Quyết định bản bắt đầu lại

1. Theo yêu cầu mới, dùng trực tiếp source Four Fields MIT thay vì tiếp tục engine cũ hoặc viết một engine mô phỏng khác. `main` và checkpoint A được giữ riêng. Snapshot upstream được ghi trong README/CREDITS.
2. Giữ cảnh, cây, rig NPC, animation, âm thanh và điều khiển upstream. Duyên là avatar chơi mới; farmer gốc là hàng xóm hư cấu. Khim và ba mèo là các model lập trình mới. Chưa có hệ hội thoại với NPC.
3. Bỏ timer/failure/reset do hết giờ. Gift mode chỉ thu hoạch và mở chuyện, không phạt nghỉ chơi. Không thêm cơ chế gieo/tưới vốn chưa có ở upstream.
4. Dùng đúng bốn nhóm thông tin đã xác nhận: buổi hẹn cà phê sách, cùng trải qua vui buồn/giận dỗi, ba bé mèo, ước mơ mua nhà và đón ba mẹ. Không tự sáng tác ký ức cá nhân hoặc lá thư.
5. Khóa save mới `duyen_four_fields_v1`. Không migration từ v4; giữ các dữ liệu cũ. Bản lưu sai schema được bảo vệ, có thể xuất nguyên văn. Bản lưu hợp lệ kiểm tra thứ tự luống và trang chuyện. Chưa có import save.
6. Không chép binary asset vào repo vì source license chưa chứng minh license riêng của asset. Giữ cách tải CDN nguyên bản và ghi hạn chế mạng/licensing.
7. Deploy là static Vite (`dist`, base tương đối), không cần server hoặc API key. Chưa có kết quả deploy nên không ghi link web tùy chỉnh giả định.
8. Lint upstream chỉ kiểm tra TypeScript. Thêm test cần thiết cho schema/protection/story unlock và mắt không bị tóc che. Browser QA dùng Chromium SwiftShader, không đại diện hiệu năng điện thoại thật.

9. Đưa bản đã QA lên Sites riêng tư để chơi qua trình duyệt. Helper local của Sites không có trong môi trường; dùng native Site registration, Git source credential qua stdin/session, và tar build artifact theo contract commit SHA của publisher. Credential không ghi vào source, Git config hoặc archive. Archive chỉ gồm manifest hosting và dist, không gồm model/âm thanh binary từ CDN. Chỉ ghi URL live sau khi backend xác nhận deploy thành công.
