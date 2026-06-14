# TÀI LIỆU KHẢO SÁT & DANH SÁCH TÍNH NĂNG CHI TIẾT (PRODUCT BACKLOG)

## Dự án: PetLink - Nền tảng Đặt lịch Dịch vụ Thú y & Spa Thú cưng Đa nhà cung cấp

---

## 1. HƯỚNG DẪN TỔNG QUAN VỀ HỆ THỐNG

Tài liệu này chuẩn hóa và phân rã chi tiết toàn bộ các tính năng nghiệp vụ của dự án **PetLink** từ tài liệu SRS.

- **Mục tiêu:** Cung cấp thông tin chi tiết về mặt nghiệp vụ, điều kiện logic, và mô tả trải nghiệm người dùng giúp Agent/Developer hiểu rõ cách thức hoạt động của từng màn hình dựa trên khung UI/UX sẵn có.
- **Phạm vi:** Tập trung vào 4 vai trò vận hành trên hệ thống: **Guest**, **Pet Owner**, **Service Provider**, và **Admin**.

---

## 2. QUY ĐỊNH CHUNG VỀ ROLE NGHIỆP VỤ

### 2.1. Danh sách role chính

Hệ thống sử dụng 4 role nghiệp vụ:

- `GUEST`: Người dùng chưa đăng nhập. Đây là trạng thái truy cập công khai, không nhất thiết lưu trong database.
- `PET_OWNER`: Chủ thú cưng đã đăng nhập, có quyền quản lý thú cưng, đặt lịch, thanh toán, đánh giá, xem thông báo và quản lý sổ sức khỏe.
- `SERVICE_PROVIDER`: Nhà cung cấp dịch vụ đã đăng nhập, có quyền quản lý hồ sơ doanh nghiệp, dịch vụ, giá, lịch hẹn, khách hàng, doanh thu và giao tiếp với khách hàng.
- `ADMIN`: Quản trị viên hệ thống, có quyền quản lý người dùng, xác thực provider, kiểm duyệt nội dung, giám sát booking, xử lý tranh chấp, xem analytics và quản lý khuyến mãi toàn sàn.

### 2.2. Quy tắc đặt tên role

- Không dùng `USER` như một role nghiệp vụ chính vì quá chung chung.
- Nếu cần nói về chủ thú cưng, dùng `PET_OWNER`.
- `Guest` là người chưa đăng nhập.
- `Pet Owner`, `Service Provider`, và `Admin` là các tài khoản đã đăng nhập.
- Các loại hình như Clinic, Spa, Grooming, Pet Hotel là **provider type/category**, không phải role.

Ví dụ:

```ts
role: "SERVICE_PROVIDER"
providerType: "CLINIC" | "SPA" | "GROOMING" | "PET_HOTEL"
```

---

## 3. QUY ĐỊNH CHUNG VỀ TRẠNG THÁI NGHIỆP VỤ

### 3.1. Vòng đời của một lịch hẹn (Booking Status)

Chỉ sử dụng các trạng thái booking sau:

- `PENDING` (Chờ duyệt): Lịch hẹn vừa được Pet Owner đặt, chờ phía cơ sở xác nhận tiếp nhận.
- `CONFIRMED` (Đã xác nhận): Cơ sở dịch vụ chấp nhận lịch hẹn và giữ chỗ cho khách.
- `IN_PROGRESS` (Đang thực hiện): Thú cưng đã đến cơ sở và đang trong quá trình làm dịch vụ/khám bệnh.
- `COMPLETED` (Hoàn thành): Dịch vụ kết thúc, thanh toán thành công, mở quyền đánh giá và cập nhật sổ sức khỏe.
- `CANCELLED` (Đã hủy): Lịch hẹn bị hủy bởi Pet Owner, Service Provider hoặc Admin. Bắt buộc lưu người hủy và lý do hủy.

Không sử dụng `REJECTED` như một booking status riêng.

Nếu Provider từ chối lịch, hệ thống lưu là:

```ts
status: "CANCELLED"
cancelledBy: "SERVICE_PROVIDER"
cancelReason: string
```

Nếu Pet Owner hủy lịch, hệ thống lưu là:

```ts
status: "CANCELLED"
cancelledBy: "PET_OWNER"
cancelReason: string
```

Nếu Admin can thiệp hủy lịch, hệ thống lưu là:

```ts
status: "CANCELLED"
cancelledBy: "ADMIN"
cancelReason: string
```

### 3.2. Workflow booking chuẩn

Luồng chính:

```txt
PENDING
→ CONFIRMED
→ IN_PROGRESS
→ COMPLETED
```

Luồng hủy:

```txt
PENDING → CANCELLED
CONFIRMED → CANCELLED
```

### 3.3. Phương thức thanh toán áp dụng

- Thanh toán trực tiếp (`CASH`): Khách hàng thanh toán tiền mặt/chuyển khoản tại quầy khi hoàn thành.
- Thanh toán trực tuyến (`ONLINE_MOMO`): Khách hàng thanh toán qua cổng điện tử MoMo ngay khi đặt lịch.

### 3.4. Trạng thái thanh toán đề xuất

- `UNPAID`: Chưa thanh toán.
- `PAID`: Đã thanh toán.
- `FAILED`: Thanh toán online thất bại.
- `REFUNDED`: Đã hoàn tiền.

---

## 4. CHI TIẾT TÍNH NĂNG THEO TỪNG VAI TRÒ

### 4.1. PHÂN HỆ GUEST (KHÁCH VÃNG LAI)

#### Tính năng G-01: Khám phá Công khai & Giới hạn Quyền hạn

- **Mô tả chức năng:** Cho phép người dùng chưa đăng nhập tham quan hệ thống và tìm kiếm thông tin cơ bản.
- **Quy tắc nghiệp vụ & Logic xử lý:**
  - Guest được phép xem: Trang chủ, danh sách các cơ sở, bảng giá công khai, các bài viết blog/chia sẻ kiến thức nuôi thú cưng và các đánh giá từ khách hàng khác.
  - Guest được phép tìm kiếm cơ bản theo tên cơ sở hoặc tên dịch vụ.
  - Guest không được đặt lịch, chat với cửa hàng, thêm thú cưng hoặc viết đánh giá.
  - Khi Guest bấm vào các hành động cần đăng nhập như "Đặt lịch", "Chat với cửa hàng", "Thêm thú cưng", hoặc "Viết đánh giá", hệ thống hiển thị Modal yêu cầu Đăng ký/Đăng nhập.
- **Yêu cầu Giao diện:**
  1. Hiển thị Banner mời gọi đăng ký tài khoản ở cuối bài blog hoặc trang chi tiết dịch vụ.
  2. Trang public cần ưu tiên CTA rõ ràng: Đăng nhập, Đăng ký, Đăng ký làm Provider.

---

### 4.2. PHÂN HỆ PET OWNER (CHỦ THÚ CƯNG)

#### Tính năng PO-01: Quản lý Tài khoản cá nhân

- **Mô tả chức năng:** Giúp Pet Owner đăng ký, đăng nhập và cá nhân hóa tài khoản cá nhân.
- **Quy tắc nghiệp vụ:**
  - Hỗ trợ Đăng ký, Đăng nhập, Đổi mật khẩu, Quên mật khẩu qua Email.
  - Cho phép cập nhật thông tin liên hệ, số điện thoại, địa chỉ và avatar.

#### Tính năng PO-02: Quản lý Hồ sơ Thú cưng (Pet Portfolio)

- **Mô tả chức năng:** Cho phép chủ nuôi tạo, sửa, xóa và lưu trữ thông tin của nhiều thú cưng để chọn nhanh khi đặt lịch hẹn.
- **Quy tắc nghiệp vụ:**
  - Nhập các trường: Tên, Loài, Giống, Giới tính, Ngày sinh, Cân nặng, Ảnh và Tình trạng sức khỏe hiện tại.
  - Ngày sinh không được là ngày tương lai.
  - Cân nặng bắt buộc phải lớn hơn 0.
  - Thú cưng có ghi chú y tế như dị ứng hoặc bệnh nền phải hiển thị nhãn cảnh báo.
- **Yêu cầu Giao diện:** Thiết kế dạng Grid Cards để hiển thị danh sách thú cưng.

#### Tính năng PO-03: Khám phá & Tìm kiếm Dịch vụ

- **Mô tả chức năng:** Cho phép Pet Owner tìm kiếm dịch vụ và nhà cung cấp phù hợp.
- **Quy tắc nghiệp vụ:**
  - Hỗ trợ lọc theo vị trí, khoảng cách, loại dịch vụ, giá cả và điểm đánh giá.
  - Phân loại rõ ràng theo 7 nhóm dịch vụ: Khám bệnh, Tiêm phòng, Spa, Grooming, Khách sạn thú cưng, Huấn luyện, Chăm sóc tại nhà.

#### Tính năng PO-04: Luồng Đặt lịch & Quản lý Lịch hẹn

- **Mô tả chức năng:** Quy trình các bước để Pet Owner chọn thú cưng, chọn dịch vụ, chọn thời gian và quản lý trạng thái lịch hẹn.
- **Quy tắc nghiệp vụ & Logic xử lý:**
  - Hiển thị thời gian thực các khung giờ còn trống.
  - Khung giờ đã kín hoặc quá tải phải bị khóa.
  - Pet Owner chỉ được hủy khi booking ở trạng thái `PENDING` hoặc `CONFIRMED`.
  - Hủy lịch phải trước giờ hẹn tối thiểu 2 tiếng và bắt buộc nhập lý do.
  - Đổi lịch phải trước giờ hẹn tối thiểu 2 tiếng.
  - Sau khi đổi lịch, booking quay về `PENDING` để Provider duyệt lại.
- **Yêu cầu Giao diện:** Sử dụng Wizard/Stepper UI. Màn hình hoàn tất có thể hiển thị mã QR để check-in tại cửa hàng.

#### Tính năng PO-05: Thanh toán & Quản lý Hóa đơn

- **Mô tả chức năng:** Hỗ trợ thanh toán qua MoMo hoặc thanh toán trực tiếp tại cửa hàng. Cho phép xem chi tiết hóa đơn và lịch sử giao dịch.
- **Quy tắc nghiệp vụ:**
  - `CASH` có thể thanh toán tại quầy khi dịch vụ hoàn thành.
  - `ONLINE_MOMO` xử lý qua cổng thanh toán online.
  - Nếu thanh toán online thất bại, booking không được đánh dấu `PAID`.

#### Tính năng PO-06: Đánh giá & Phản hồi

- **Mô tả chức năng:** Cho phép Pet Owner đánh giá và viết bình luận sau khi sử dụng dịch vụ.
- **Quy tắc nghiệp vụ:**
  - Chỉ được đánh giá khi booking đạt trạng thái `COMPLETED`.
  - Mỗi booking chỉ được đánh giá 1 lần.
  - Rating từ 1 đến 5 sao.
  - Cho phép upload tối đa 3 hình ảnh thực tế.

#### Tính năng PO-07: Trung tâm Thông báo

- **Mô tả chức năng:** Nhận thông báo về lịch hẹn, thay đổi trạng thái booking và chương trình khuyến mãi.
- **Loại thông báo:**
  - Nhắc lịch hẹn sắp tới.
  - Lịch được xác nhận, thay đổi hoặc hủy.
  - Chương trình khuyến mãi toàn sàn.

#### Tính năng PO-08: Sổ sức khỏe điện tử

- **Mô tả chức năng:** Lưu trữ dòng thời gian y tế của thú cưng.
- **Quy tắc nghiệp vụ:**
  - Bao gồm lịch sử khám bệnh, lịch sử tiêm phòng, đơn thuốc và ghi chú y tế.
  - Có thể được Pet Owner nhập thủ công.
  - Có thể được đồng bộ tự động khi booking đạt trạng thái `COMPLETED`.

---

### 4.3. PHÂN HỆ SERVICE PROVIDER (NHÀ CUNG CẤP)

#### Tính năng SP-01: Quản lý Hồ sơ Doanh nghiệp

- **Mô tả chức năng:** Thiết lập thông tin hiển thị của cửa hàng bao gồm thông tin liên hệ, địa chỉ bản đồ, hình ảnh cơ sở vật chất và khung giờ hoạt động.

#### Tính năng SP-02: Quản lý Dịch vụ

- **Mô tả chức năng:** Quản lý danh sách dịch vụ của cơ sở.
- **Quy tắc nghiệp vụ:**
  - Hỗ trợ thêm, sửa, xóa, bật hoặc tắt dịch vụ.
  - Hỗ trợ phân loại linh hoạt theo nhóm dịch vụ.
  - Danh mục dịch vụ là metadata của dịch vụ, không phải role.

#### Tính năng SP-03: Quản lý Giá & Gói Combo

- **Mô tả chức năng:** Thiết lập bảng giá riêng cho từng dịch vụ, tạo khuyến mãi hoặc gói combo với thời hạn áp dụng.

#### Tính năng SP-04: Quản lý Đặt lịch

- **Mô tả chức năng:** Provider quản lý lịch hẹn của khách hàng.
- **Quy tắc nghiệp vụ:**
  - Provider xác nhận booking bằng cách chuyển `PENDING` sang `CONFIRMED`.
  - Provider từ chối booking bằng cách chuyển `PENDING` sang `CANCELLED` với `cancelledBy = "SERVICE_PROVIDER"` và `cancelReason`.
  - Provider chuyển `CONFIRMED` sang `IN_PROGRESS` khi thú cưng đã đến và bắt đầu sử dụng dịch vụ.
  - Provider chuyển `IN_PROGRESS` sang `COMPLETED` khi dịch vụ hoàn tất.
- **Yêu cầu Giao diện:** Có thể dùng bảng, lịch hoặc Kanban Board. Nếu dùng Kanban, các cột nên là Chờ duyệt, Đã xác nhận, Đang thực hiện, Hoàn thành.

#### Tính năng SP-05: Quản lý Khách hàng & Lịch sử Dịch vụ

- **Mô tả chức năng:** Xem danh sách khách hàng và thú cưng đã từng sử dụng dịch vụ tại cơ sở.
- **Quy tắc nghiệp vụ:**
  - Provider chỉ xem được khách hàng có lịch sử sử dụng dịch vụ tại cơ sở của mình.
  - Provider có thể xem lịch sử dịch vụ và ghi chú y tế liên quan đến booking của cơ sở.

#### Tính năng SP-06: Báo cáo Doanh thu

- **Mô tả chức năng:** Thống kê doanh thu theo ngày/tháng và phân tích dịch vụ phổ biến, tỷ lệ hủy lịch.
- **Quy tắc nghiệp vụ:**
  - Cảnh báo nếu cancellation rate lớn hơn 15%.
  - Dashboard phải có Loading State, Empty State và Error State.

#### Tính năng SP-07: Giao tiếp & Tương tác Khách hàng

- **Mô tả chức năng:** Cho phép Provider chat với khách hàng, gửi thông báo và phản hồi review.
- **Quy tắc nghiệp vụ:**
  - Provider có thể chat để tư vấn trước lịch hẹn hoặc trao đổi tình hình thú cưng.
  - Provider có thể reply dưới đánh giá của khách hàng.

---

### 4.4. PHÂN HỆ ADMIN (QUẢN TRỊ VIÊN HỆ THỐNG)

#### Tính năng A-01: Quản lý Người dùng

- **Mô tả chức năng:** Quản lý danh sách Pet Owner và Service Provider.
- **Quy tắc nghiệp vụ:**
  - Admin có thể khóa hoặc mở khóa tài khoản.
  - Lệnh khóa tài khoản phải có lý do.
  - Có thể hỗ trợ khóa có thời hạn hoặc khóa vĩnh viễn.

#### Tính năng A-02: Xác thực Nhà cung cấp

- **Mô tả chức năng:** Kiểm duyệt hồ sơ đăng ký kinh doanh của Provider mới.
- **Yêu cầu Giao diện:** Màn hình chia đôi để xem thông tin Provider và tài liệu pháp lý như giấy phép kinh doanh, chứng chỉ thú y.

#### Tính năng A-03: Kiểm duyệt Nội dung & Xử lý Báo cáo

- **Mô tả chức năng:** Kiểm duyệt thông tin dịch vụ, hình ảnh, bảng giá và xử lý report từ người dùng.
- **Quy tắc nghiệp vụ:**
  - Admin có thể duyệt, ẩn hoặc yêu cầu chỉnh sửa nội dung dịch vụ.
  - Admin có thể xử lý report về Provider hoặc dịch vụ kém chất lượng.

#### Tính năng A-04: Giám sát Booking & Giải quyết Tranh chấp

- **Mô tả chức năng:** Theo dõi booking toàn hệ thống và can thiệp khi có tranh chấp.
- **Quy tắc nghiệp vụ:**
  - Admin có thể xem toàn bộ booking trên nền tảng.
  - Admin có thể xử lý tranh chấp giữa Pet Owner và Service Provider.
  - Kết quả xử lý có thể là hoàn tiền, đóng khiếu nại hoặc chỉnh trạng thái booking.
  - Hành động xử lý tranh chấp phải lưu audit log.

#### Tính năng A-05: Bảng điều khiển Phân tích Toàn sàn

- **Mô tả chức năng:** Thống kê tổng số user, tổng số booking, doanh thu nền tảng và bảng xếp hạng provider/dịch vụ.
- **Quy tắc nghiệp vụ:**
  - Admin dashboard overview không cần feature folder riêng.
  - Trang admin overview có thể compose lại component từ analytics.

#### Tính năng A-06: Quản trị Banner & Mã giảm giá Toàn sàn

- **Mô tả chức năng:** Quản lý banner, coupon, flash sale và chiến dịch marketing chung của hệ thống.
- **Quy tắc phạm vi:**
  - Nếu chưa làm trong phase hiện tại, đánh dấu là `OUT_OF_SCOPE_NOW`.
  - Không tạo file/component rỗng nếu chưa implement.

---

## 5. GỢI Ý MAPPING FEATURE THEO FRONTEND

### 5.1. Auth

```txt
features/auth
```

Bao gồm:

- Login
- Forgot Password
- Reset Password
- Register Provider

### 5.2. Public / Guest

```txt
features/public
```

Bao gồm:

- Home
- Public Provider List
- Public Service List
- Public Search
- Login Required Dialog

### 5.3. Pet Owner

```txt
features/pet-owner/profile
features/pet-owner/pets
features/pet-owner/discovery
features/pet-owner/bookings
features/pet-owner/payments
features/pet-owner/reviews
features/pet-owner/notifications
features/pet-owner/health-records
```

### 5.4. Service Provider

```txt
features/provider/business-profile
features/provider/services
features/provider/pricing
features/provider/bookings
features/provider/customers
features/provider/revenue
features/provider/communication
```

### 5.5. Admin

```txt
features/admin/users
features/admin/verification
features/admin/moderation
features/admin/bookings
features/admin/analytics
features/admin/promotions
```

Nếu `admin/promotions` chưa thuộc scope hiện tại, không tạo folder vội.

---

## 6. GHI CHÚ TRIỂN KHAI

- Business form, table, schema, query/mutation nên nằm trong feature folder tương ứng.
- UI component thuần như Button, Input, Select, Dialog, Card, Table nên nằm trong `components/ui`.
- Component dùng chung có nghiệp vụ nhẹ như PageHeader, ConfirmDialog, StatusBadge, EmptyState, ErrorState nên nằm trong `components/common`.
- Không đặt feature component trong `components/ui`.
- Không tạo duplicate dashboard component nếu analytics component đã có thể reuse.
