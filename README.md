# Nông trại của Duyên — bản bắt đầu lại từ Four Fields

Dùng trực tiếp toàn bộ source của [Four Fields](https://github.com/mintdotgg/mint-playground/tree/main/experiences/four-fields), revision `5ab1b942b6bb5169a0460b3cc682fe34fae76293`. Bản gốc vẫn chơi được tại https://play.mint.gg/four-fields.

Đây là dự án mới theo yêu cầu bắt đầu lại, không thay thế checkpoint A trên nhánh `main`. Nhân vật chơi là Duyên; Khim, Mochi, Mon và Mây xuất hiện trong nông trại. Thu hoạch 12 cây mỗi luống để mở một trang chuyện. Có bắp, khoai tây, cà chua, dâu tây. Không giới hạn thời gian. Chưa có gieo hạt, tưới cây, kinh tế hay xây nhà.

## Chơi trên web

Bản tùy chỉnh chưa có URL hosting. Để đưa lên Vercel: import repository `duyens-farm`, chọn nhánh `restart/four-fields`, framework Vite, build `npm run build`, output `dist`, Node 22. Không cần biến môi trường. Nếu Vercel tạo project từ main, đặt Git → Production Branch thành `restart/four-fields` rồi deploy lại. Người chơi mở link deploy, không cần Git hay npm.

WASD hoặc phím mũi tên để di chuyển, Space hoặc nút Thu hoạch khi đứng gần cây. Điện thoại có nút điều hướng. Sổ chuyện cho đọc lại những trang đã mở. Tạm dừng giữ nguyên tiến độ.

## Chạy và kiểm thử

Yêu cầu Node >=22.13.

```sh
npm ci
npm run dev
```

Mở http://localhost:3030. Các kiểm tra:

```sh
npm run lint
npm test
npm run build
```

`lint` là TypeScript kiểm tra kiểu, giống upstream, không phải ESLint. Xem [docs/QA.md](docs/QA.md) để biết kết quả thực tế.

## Lưu tiến độ và nội dung

Lưu tự động trên trình duyệt với khóa `duyen_four_fields_v1`; lưu ngay khi thu hoạch và xác nhận trang chuyện. Không đọc, sửa hoặc chuyển đổi save v4 của dự án cũ. Bản lưu lỗi được bảo vệ khỏi ghi đè. Nút Tải bản lưu xuất JSON để giữ lại; chưa có chức năng nhập bản lưu hoặc đồng bộ giữa máy. Đổi domain hoặc dùng chế độ riêng tư có thể làm bạn không thấy tiến độ cũ.

Chuyện chỉ dùng các thông tin đã xác nhận trong prompt. Các chi tiết chưa biết hiển thị TODO. Xem [src/content/PLACEHOLDERS.md](src/content/PLACEHOLDERS.md).

## Nguồn và giấy phép

Giữ nguyên [LICENSE](LICENSE) MIT, copyright Lucas Ochs-Messick; README gốc tại [README.upstream.md](README.upstream.md). Các thay đổi cá nhân hóa cũng phát hành MIT. Model/âm thanh được tải từ URL CDN Mint nguyên bản; repo không chứa các file GLB/MP3. Chưa xác nhận giấy phép riêng của những asset này; không suy ra MIT của source áp dụng cho chúng. Cần mạng để tải chúng và không có chế độ offline hoàn chỉnh. Chi tiết ở [CREDITS.md](CREDITS.md).
