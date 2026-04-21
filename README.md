# Viện Dinh Dưỡng - Health Result Portal

Portal tra cứu kết quả khám bệnh trực tuyến cho bệnh nhân.

## Tech Stack
- **Backend**: ASP.NET Core 8, ADO.NET (Microsoft.Data.SqlClient), JWT Auth
- **Frontend**: React 18, Axios
- **Database**: SQL Server (bảng `web_xacthuc`, SP `web_laythongtin_kham`, SP `Web_laydanhsach_luotkham`)

## Changelog v1.1 (Bản sửa lỗi)

### 1. Sửa màu sắc theo trang web Viện Dinh Dưỡng
- Chuyển từ dark theme (xanh lá đậm) sang **light theme xanh dương/trắng** giống http://viendinhduong.vn
- Header xanh dương `#0072BC`, nền trắng `#f0f4f8`, card trắng
- Toàn bộ component đã cập nhật color palette mới

### 2. Sửa lỗi 401 khi gọi API GetVisits
- **Nguyên nhân**: Tham số `@idbenhnhan` truyền vào SP `Web_laydanhsach_luotkham` dùng `SqlDbType.Int` nhưng `id_benhnhan` là `bigint` (long) → cast `(int)` gây mất dữ liệu hoặc lỗi
- **Fix**: Đổi sang `SqlDbType.BigInt` và truyền trực tiếp `idBenhNhan` (long)

### 3. Sửa lỗi Login không kết nối được API
- **Nguyên nhân 1**: CORS chỉ apply trong `Development` environment → production không có CORS → React dev server bị block
- **Fix**: CORS policy `AllowClient` apply cho **tất cả environments**, bao gồm cả origin `http://localhost:5120` và `https://localhost:7120`
- **Nguyên nhân 2**: Middleware order sai — `UseCors()` phải đặt **trước** `UseAuthentication()`
- **Fix**: Đảm bảo đúng thứ tự: `UseCors` → `UseHttpsRedirection` → `UseStaticFiles` → `UseAuthentication` → `UseAuthorization`
- **Frontend**: Thêm timeout 30s, cải thiện error message khi mất kết nối mạng, không auto-logout khi login fail 401

## Luồng hoạt động

1. **Xác thực**: Bệnh nhân đăng nhập bằng `số điện thoại` + `mật khẩu`
   - Backend query bảng `web_xacthuc` JOIN `kcb_danhsach_benhnhan`
   - Trả về JWT token + thông tin user

2. **Danh sách lượt khám**: `GET /api/results/visits/{idBenhNhan}`
   - Backend gọi SP `Web_laydanhsach_luotkham @idbenhnhan`

3. **Kết quả khám**: `GET /api/results/{maLuotKham}`
   - Backend gọi SP `web_laythongtin_kham @luotkham`
   - SP trả 3 result sets: thông tin BN, kết quả khám, file

4. **Download file**: `GET /api/results/{maLuotKham}/files/{fileId}`

## Cấu hình

### appsettings.json
```json
{
  "ConnectionStrings": {
    "HISConnection": "Server=...;Database=...;User Id=...;Password=...;TrustServerCertificate=true;MultipleActiveResultSets=true"
  }
}
```

### React proxy (package.json)
```json
{
  "proxy": "https://localhost:7120"
}
```
Nếu API chạy port khác, sửa giá trị `proxy` hoặc set biến môi trường `REACT_APP_API_URL`.

## Chạy Development

```bash
# Backend
cd HealthResultPortal.Api
dotnet restore
dotnet run

# Frontend (terminal khác)
cd HealthResultPortal.Api/ClientApp
npm install
npm start
```

## Theme
Màu chủ đạo: **Xanh dương (VDD Blue)** theo trang web Viện Dinh Dưỡng
- Primary: `#0072BC`
- Primary Dark: `#005a96`
- Accent (Green): `#00A651`
- Background: `#f0f4f8`
- Header: `#0072BC` (white text)
