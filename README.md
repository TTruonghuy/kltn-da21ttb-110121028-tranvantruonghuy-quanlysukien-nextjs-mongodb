# Event App

Hệ thống quản lý sự kiện, bán vé, check-in, hoàn tiền, quản trị tổ chức và người dùng.

---

## Cấu trúc dự án

```
event-b/   # Backend (NestJS)
event-f/   # Frontend (Next.js)
```

---

## 1. Backend - `event-b`

- **Công nghệ:** NestJS, MongoDB, Mongoose
- **Chức năng chính:**
  - Quản lý sự kiện, xuất (session), vé (ticket)
  - Đặt vé, thanh toán (VNPay), hoàn tiền, gửi mail
  - Quản trị tổ chức, người dùng, phân quyền
  - Check-in vé bằng QR code
  - Quản lý tin tức, thông báo

### Cài đặt & chạy backend

```sh
cd event-b
npm install
npm run start:dev
```

- **Cấu hình:** Sửa file `.env` để kết nối MongoDB, cấu hình mail, VNPay, v.v.

---

## 2. Frontend - `event-f`

- **Công nghệ:** Next.js, React, TailwindCSS, Axios
- **Chức năng chính:**
  - Trang chủ, tìm kiếm sự kiện, xem chi tiết sự kiện
  - Đặt vé, thanh toán, nhận vé miễn phí
  - Quản lý vé của tôi, check-in QR
  - Trang quản trị tổ chức, quản trị viên
  - Đăng nhập, đăng ký, xác thực Google

### Cài đặt & chạy frontend

```sh
cd event-f
npm install
npm run dev
```

- **Cấu hình:** Sửa file `src/lib/axiosInstance.ts` nếu cần thay đổi API backend.

---

## 3. Một số lệnh phát triển

- **Backend:**  
  - `npm run start:dev` — chạy dev mode
  - `npm run build` — build production

- **Frontend:**  
  - `npm run dev` — chạy dev mode
  - `npm run build` — build production

---

## 4. Thông tin bổ sung

- **Tài khoản mặc định:**  
  - Đăng ký tài khoản mới hoặc đăng nhập bằng Google.
- **Quản trị viên:**  
  - Truy cập `/admin` trên frontend.
- **Tổ chức:**  
  - Truy cập `/organizer` trên frontend.

---

## 5. Liên hệ & hỗ trợ

- Nếu gặp lỗi hoặc cần hỗ trợ, vui lòng liên hệ nhóm phát triển.

---

**© 2024 Event App**