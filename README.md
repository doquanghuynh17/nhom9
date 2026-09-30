# 👑 CROWN-CO Luxury Shop

Website thương mại điện tử mô phỏng chuyên bán sản phẩm xa xỉ, xây dựng hoàn toàn bằng **HTML, CSS và JavaScript thuần (Vanilla JS)**, không dùng framework hay thư viện ngoài. Giao diện tone tối – vàng gold theo phong cách luxury.

Dự án chạy **hoàn toàn phía client (Frontend Only)**: không có backend, không có cơ sở dữ liệu. Mọi dữ liệu (tài khoản, giỏ hàng, đơn hàng, lịch sử tìm kiếm, tin nhắn chat) được lưu bằng `localStorage` của trình duyệt.

## 👥 Thành viên nhóm

| Họ và tên | MSSV | Vai trò
|---|---|---|
| Nguyễn Vũ Trường Sơn | 24100468 | Trưởng nhóm |
| Đỗ Quang Huynh | 24100120 | Thành viên |

## 🧩 Chức năng chính

### 🧭 1. Điều hướng một trang (SPA)
- Toàn bộ website nằm trong một file `index.html` với 3 trang: **Trang chủ**, **Sản phẩm**, **Giới thiệu**.
- Chuyển trang không reload, đồng bộ với URL hash (`#home`, `#products`, `#about`) nên dùng được nút Back/Forward và chia sẻ link trực tiếp.
- Trang chủ có form **Liên hệ nhanh** (kiểm tra đủ 3 trường trước khi gửi).

### 🛍 2. Sản phẩm
- Hơn 60 sản phẩm cao cấp: đồng hồ, túi xách, trang sức, giày, nước hoa, thời trang, phụ kiện…
- Xem nhanh chi tiết sản phẩm trong modal: ảnh, mô tả, giá, chọn **màu sắc**, **trọng lượng**, **số lượng**.

### 🔍 3. Tìm kiếm
- Tìm kiếm realtime, tìm trên tên, mô tả, màu sắc và trọng lượng.
- **Không phân biệt dấu tiếng Việt** và hỗ trợ nhiều từ khóa cùng lúc (ví dụ gõ `dong ho` vẫn ra "Đồng hồ").
- Lưu **lịch sử tìm kiếm** (tối đa 4 mục gần nhất), gợi ý theo từ đang gõ, điều hướng bằng phím ↑ ↓ Enter Esc, có nút xóa lịch sử.

### 🛒 4. Giỏ hàng
- Thêm sản phẩm vào giỏ (tự gộp số lượng nếu trùng sản phẩm, tối đa 999).
- Xóa sản phẩm khỏi giỏ.
- Huy hiệu số lượng trên biểu tượng giỏ hàng, tổng tiền tự động cập nhật.

### 💳 5. Thanh toán và vận chuyển (giả lập)
- Hai cách đặt hàng: **Thanh toán nhanh** ngay trong modal sản phẩm, hoặc **thanh toán cả giỏ hàng**.
- Chọn trong **13 đơn vị vận chuyển** (GHN, GHTK, Viettel Post, VNPost, J&T, Ninja Van, Shopee Express, GrabExpress, BeExpress, GoShip, DHL, FedEx, VNPost EMS), mỗi hãng có phí ship và thời gian giao dự kiến riêng.
- Tổng tiền = tiền hàng + phí ship. Đặt hàng thành công sẽ tạo mã đơn, hiển thị ngày nhận dự kiến và làm trống giỏ hàng.

### 📦 6. Theo dõi đơn hàng và lịch sử mua hàng
- Theo dõi đơn qua 6 bước: *Đã nhận đơn → Đã lấy hàng → Đang vận chuyển → Đã đến kho → Đang giao → Giao thành công*.
- Bản đồ vận chuyển minh họa bằng SVG, vị trí thay đổi theo tiến trình đơn (tiến trình được chỉnh thủ công bằng menu trạng thái để demo).
- Xem lại toàn bộ lịch sử đơn hàng, bấm "Theo dõi" để nhảy sang đơn tương ứng.

### 👤 7. Tài khoản
- Đăng ký / đăng nhập bằng **Gmail** (yêu cầu đuôi `@gmail.com`, mật khẩu tối thiểu 6 ký tự), có nút hiện/ẩn mật khẩu và cảnh báo Caps Lock.
- Mật khẩu được băm **SHA-256** (Web Crypto API) trước khi lưu.
- Dữ liệu được tách riêng theo từng tài khoản: giỏ hàng, đơn hàng, lịch sử tìm kiếm và chat. Đăng xuất sẽ lưu lại dữ liệu của tài khoản đó và trả giao diện về trạng thái khách.

### 💬 8. Chatbot hỗ trợ
- Khung chat nổi ở trang Sản phẩm, trả lời tự động theo **từ khóa** (giá, giao hàng, khuyến mãi, liên hệ, chất lượng, chào hỏi) bằng cả tiếng Việt và tiếng Anh.
- Hỗ trợ chèn **emoji**, gửi **ảnh** (tự nén bằng Canvas để vừa dung lượng `localStorage`), bấm vào ảnh để phóng to.
- Lịch sử chat được lưu theo từng tài khoản.

## 🛠 Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Cấu trúc | HTML5 (semantic, ARIA cơ bản) |
| Giao diện | CSS3 (biến CSS, Flexbox, Grid), font Inter và Playfair Display từ Google Fonts |
| Logic | JavaScript ES6+ thuần (IIFE, async/await, Web Crypto API, Canvas API, FileReader) |
| Lưu trữ | `localStorage` |

## 📁 Cấu trúc thư mục

```
├── index.html   # Toàn bộ giao diện: 3 trang, modal, chat, form đăng nhập
├── index.css    # Style toàn bộ website
├── index.js     # Toàn bộ logic: routing, tìm kiếm, giỏ hàng, đơn hàng, auth, chat
└── README.md
```

## 📄 Bản quyền

© 2025 CROWN-CO Luxury Shop. Dự án học tập do Đỗ Quang Huynh và Nguyễn Vũ Trường Sơn thực hiện.
