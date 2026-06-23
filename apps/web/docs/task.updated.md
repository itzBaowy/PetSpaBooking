# TÀI LIỆU KHẢO SÁT & DANH SÁCH TÍNH NĂNG CHI TIẾT (PRODUCT BACKLOG)

## Dự án: PetLink - Nền tảng Đặt lịch Dịch vụ Thú y & Spa Thú cưng Đa nhà cung cấp

---

## 1. HƯỚNG DẪN TỔNG QUAN VỀ HỆ THỐNG

T�i liệu này chuẩn hóa và phân rã chi tiết toàn bộ các tính năng nghiệp vụ của dự án **PetLink** từ tài liệu SRS, bao gồm luồng thanh toán tiền mặt, ký quỹ provider, QR/OTP check-in và thu hoa hồng.

- **Mục tiêu:** Cung cấp thông tin chi tiết về mặt nghiệp vụ, điều kiện logic, và mô tả trải nghiệm người dùng.
- **Phạm vi:** 4 vai trò: **Guest**, **Pet Owner**, **Service Provider**, **Admin**.

---

## 2. QUY ĐỊNH CHUNG VỀ ROLE NGHIỆP VỤ

### 2.1. Danh sách role chính

- `GUEST`: Người dùng chưa đăng nhập.
- `PET_OWNER`: Chủ thú cưng đã đăng nhập.
- `SERVICE_PROVIDER`: Nhà cung cấp dịch vụ đã đăng nhập.
- `ADMIN`: Quản trị viên hệ thống.

### 2.2. Quy tắc đặt tên role

- Không dùng `USER` như một role nghiệp vụ chính. Dùng `PET_OWNER`.
- Các loại hình Clinic, Spa, Grooming, Pet Hotel là **provider type**, không phải role.

```ts
role: "SERVICE_PROVIDER"
providerType: "CLINIC" | "SPA" | "GROOMING" | "PET_HOTEL"
```

---

## 3. QUY ĐỊNH CHUNG VỀ TRẠNG THÁI NGHIỆP VỤ

### 3.1. Vòng đời Booking (Booking Status)

Chỉ sử dụng các trạng thái sau:

| Status | Ý nghĩa |
|---|---|
| `BOOKED` | Khách vừa tạo lịch, chờ provider xác nhận |
| `CONFIRMED` | Provider đã nhận lịch; commission reserve nếu là CASH |
| `CHECKED_IN` | Khách đã đến và xác thực bằng QR/OTP |
| `IN_SERVICE` | Dịch vụ đang diễn ra |
| `COMPLETED` | Dịch vụ hoàn tất; commission charged nếu là CASH |
| `COMMISSION_CHARGED` | Hoa hồng đã trừ khỏi balance, ghi ledger |
| `CANCELLED_BY_CUSTOMER` | Khách hủy lịch |
| `CANCELLED_BY_PROVIDER` | Provider từ chối hoặc hủy lịch |
| `NO_SHOW_REPORTED` | Provider báo khách không đến (chỉ khi chưa check-in) |
| `DISPUTED` | Có tranh chấp; admin cần xử lý |
| `FAILED_APPROVED` | Admin duyệt thất bại sau khi xem xét |

**Nghiêm cấm dùng:** `PENDING`, `IN_PROGRESS`, `CANCELLED`, `REJECTED`.

### 3.2. Workflow booking

Luồng CASH:
```
BOOKED → CONFIRMED → CHECKED_IN → IN_SERVICE → COMPLETED → COMMISSION_CHARGED
```

Luồng Online:
```
BOOKED → CONFIRMED → CHECKED_IN → IN_SERVICE → COMPLETED
```

Luồng hủy:
```
BOOKED / CONFIRMED → CANCELLED_BY_CUSTOMER
BOOKED / CONFIRMED → CANCELLED_BY_PROVIDER
```

Luồng no-show / dispute:
```
CONFIRMED → NO_SHOW_REPORTED → DISPUTED → FAILED_APPROVED
CHECKED_IN → DISPUTED (không được tự đánh fail sau check-in)
```

### 3.3. Dữ liệu hủy lịch

```ts
// Khách hủy
{ status: "CANCELLED_BY_CUSTOMER", cancelledBy: "PET_OWNER", cancelReason: string }

// Provider hủy/từ chối
{ status: "CANCELLED_BY_PROVIDER", cancelledBy: "SERVICE_PROVIDER", cancelReason: string }

// Admin can thiệp
{ status: "CANCELLED_BY_PROVIDER" | "FAILED_APPROVED", cancelledBy: "ADMIN", cancelReason: string }
```

### 3.4. Phương thức thanh toán

```ts
type PaymentMethod = "CASH" | "ONLINE_MOMO"
type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED"
```

Điều kiện để provider nhận booking CASH:
```
provider.availableBalance >= estimatedCommission + provider.safetyBuffer
&& provider.status === "ACTIVE"
```

Nếu không đủ điều kiện → **ẩn option CASH** cho provider đó trong flow đặt lịch.

---

## 4. CHI TIẾT TÍNH NĂNG THEO TỪNG VAI TRÒ

### 4.1. PHÂN HỆ GUEST

#### G-01: Khám phá Công khai & Giới hạn Quyền hạn

- Guest xem được: trang chủ, danh sách cơ sở, bảng giá công khai, blog, đánh giá.
- Guest tìm kiếm cơ bản theo tên cơ sở hoặc tên dịch vụ.
- Guest không đặt lịch, chat, thêm thú cưng hoặc viết đánh giá.
- Khi guest thực hiện hành động cần đăng nhập → hiển thị Modal Đăng ký/Đăng nhập.
- Không hiển thị option CASH nếu provider không đủ balance.

---

### 4.2. PHÂN HỆ PET OWNER

#### PO-01: Quản lý Tài khoản Cá nhân

- Đăng ký, đăng nhập, đổi mật khẩu, quên mật khẩu qua Email.
- Cập nhật thông tin liên hệ, số điện thoại, địa chỉ và avatar.

#### PO-02: Quản lý Hồ sơ Thú cưng

- Tạo, sửa, xóa hồ sơ nhiều thú cưng.
- Fields: Tên, Loài, Giống, Giới tính, Ngày sinh, Cân nặng, Ảnh, Tình trạng sức khỏe.
- Ngày sinh không được là ngày tương lai.
- Cân nặng phải lớn hơn 0.
- Thú cưng có dị ứng hoặc bệnh nền → hiển thị nhãn cảnh báo.
- Giao diện: Grid Cards.

#### PO-03: Khám phá & Tìm kiếm Dịch vụ

- Lọc theo vị trí, khoảng cách, loại dịch vụ, giá, điểm đánh giá.
- 7 nhóm dịch vụ: Khám bệnh, Tiêm phòng, Spa, Grooming, Khách sạn thú cưng, Huấn luyện, Chăm sóc tại nhà.
- Nếu provider không đủ balance → **không hiển thị option CASH** trong bước chọn thanh toán.

#### PO-04: Luồng Đặt lịch & Quản lý Lịch hẹn

- Wizard/Stepper: Chọn thú cưng → Chọn dịch vụ → Chọn thời gian → Xác nhận.
- Chỉ hiển thị khung giờ còn trống.
- Pet Owner chỉ được hủy khi booking ở `BOOKED` hoặc `CONFIRMED`.
- Hủy lịch phải trước giờ hẹn tối thiểu 2 tiếng, bắt buộc nhập lý do.
- Đổi lịch trước giờ hẹn tối thiểu 2 tiếng → booking quay về `BOOKED`.
- Nếu chọn CASH → sau khi booking `CONFIRMED`, app hiển thị **QR Code / OTP** để check-in tại cơ sở.
- Pet Owner có thể phản hồi `NO_SHOW_REPORTED` trong khoảng thời gian X giờ.
- Nếu không phản hồi no-show report → hệ thống tự duyệt sau thời gian chờ.

#### PO-05: Thanh toán & Quản lý Hóa đơn

- `CASH`: thanh toán tại quầy khi dịch vụ hoàn thành.
- `ONLINE_MOMO`: xử lý qua cổng thanh toán online.
- Nếu thanh toán online thất bại → booking không được đánh dấu `PAID`.
- Khi chọn CASH → hiển thị thông báo giải thích quy trình check-in (QR/OTP bắt buộc).
- Option CASH bị ẩn nếu provider không đủ balance.

#### PO-06: Đánh giá & Phản hồi

- Chỉ đánh giá khi booking đạt `COMPLETED`.
- Mỗi booking đánh giá 1 lần duy nhất.
- Rating 1–5 sao. Upload tối đa 3 ảnh.

#### PO-07: Trung tâm Thông báo

- Nhắc lịch hẹn sắp tới.
- Booking confirmed / changed / cancelled.
- `NO_SHOW_REPORTED` → nhắc Pet Owner phản hồi trong thời hạn.
- Chương trình khuyến mãi toàn sàn.

#### PO-08: Sổ Sức khỏe Điện tử

- Timeline y tế: lịch sử khám, tiêm phòng, đơn thuốc, ghi chú.
- Pet Owner nhập thủ công hoặc đồng bộ tự động khi booking `COMPLETED`.

---

### 4.3. PHÂN HỆ SERVICE PROVIDER

#### SP-01: Quản lý Hồ sơ Doanh nghiệp

- Thông tin liên hệ, địa chỉ bản đồ, hình ảnh cơ sở, khung giờ hoạt động.

#### SP-02: Quản lý Dịch vụ

- Thêm, sửa, xóa, bật/tắt dịch vụ.
- Phân loại theo nhóm dịch vụ (là metadata, không phải role).

#### SP-03: Quản lý Giá & Gói Combo

- Thiết lập bảng giá, tạo khuyến mãi và gói combo theo thời hạn.

#### SP-04: Quản lý Đặt lịch

- Provider xác nhận: `BOOKED` → `CONFIRMED`.
  - Nếu CASH → hệ thống **tự động reserve commission** từ Available Balance.
  - Nếu Available Balance không đủ → hệ thống chặn xác nhận CASH booking.
- Provider từ chối: `BOOKED` → `CANCELLED_BY_PROVIDER` (kèm cancelReason).
- Provider scan QR / nhập OTP khi khách đến → booking → `CHECKED_IN`.
- Provider chuyển `CHECKED_IN` / `IN_SERVICE` → `IN_SERVICE` / `COMPLETED`.
  - Khi `COMPLETED` (CASH) → hệ thống **tự động charge commission**.
- **Sau CHECKED_IN: Provider không được tự chuyển sang FAILED.**
- Provider chỉ báo no-show nếu khách **chưa check-in**.
- Nếu có vấn đề sau check-in → Provider phải tạo dispute kèm bằng chứng.
- Giao diện: bảng, lịch hoặc Kanban (cột: Chờ duyệt → Đã xác nhận → Đang thực hiện → Hoàn thành).

#### SP-05: Quản lý Khách hàng & Lịch sử Dịch vụ

- Xem danh sách khách hàng và thú cưng đã từng dùng dịch vụ tại cơ sở.
- Xem lịch sử dịch vụ và ghi chú y tế liên quan.

#### SP-06: Báo cáo Doanh thu

- Thống kê doanh thu theo ngày/tháng.
- Cảnh báo nếu cancellation rate > 15%.
- Hiển thị: Available Balance, Reserved Balance, Debt Balance.
- Cảnh báo khi Available Balance dưới ngưỡng tối thiểu.
- Lịch sử commission.
- Dashboard cần Loading State, Empty State, Error State.

#### SP-07: Giao tiếp & Tương tác Khách hàng

- Chat với khách trước/sau lịch hẹn.
- Gửi thông báo nội bộ.
- Reply dưới đánh giá của khách.

#### SP-08: Quản lý Ký quỹ & Số dư (MỚI)

- Xem Available Balance, Reserved Balance, Debt Balance.
- Nạp tiền ký quỹ (top-up).
- Xem lịch sử giao dịch ledger: `TOPUP`, `RESERVE_COMMISSION`, `RELEASE_RESERVE`, `CHARGE_COMMISSION`, `DEBT_OFFSET`, `PAYOUT`.
- Cảnh báo khi balance dưới ngưỡng warning.
- Thông báo khi bị chặn nhận CASH booking do không đủ balance.
- Hiển thị thông tin nợ và giải thích cơ chế bù nợ từ payout online.

---

### 4.4. PHÂN HỆ ADMIN

#### A-01: Quản lý Người dùng & Provider (MỞ RỘNG)

**Route:** `admin/users`, `admin/users/[userId]`, `admin/providers`, `admin/providers/[providerId]`

- Danh sách Pet Owner và Service Provider.
- Khóa (Ban) / Mở khóa (Unban) tài khoản → bắt buộc có lý do và thời hạn (tạm thời/vĩnh viễn).
- **Provider detail mở rộng:**
  - Hiển thị Trust Score: completion rate, no-show rate, dispute rate, cash abnormality rate.
  - Hiển thị Balance overview: Available, Reserved, Debt Balance.
  - Xem lịch sử vi phạm.

**Status:** ✅ COMPLETED (cần mở rộng provider detail với trust score + balance)

#### A-02: Xác thực Nhà cung cấp

**Route:** `admin/verification`, `admin/verification/[verificationId]`

- Duyệt hồ sơ đăng ký kinh doanh của Provider mới.
- Xem tài liệu đính kèm: giấy phép kinh doanh, chứng chỉ thú y.
- Approve / Reject với lý do.

**Status:** ✅ COMPLETED

#### A-03: Kiểm duyệt Nội dung (Moderation + Reports — CÙNG FEATURE)

**Routes:**
- `admin/moderation` → Service content queue (kiểm duyệt nội dung dịch vụ)
- `admin/moderation/reports` → Content Reports (xử lý báo cáo từ người dùng)

**Lưu ý:** Moderation và Reports là 2 sub-view của cùng 1 feature `apis/admin/moderation/`. Không tạo feature riêng cho Reports.

- Moderation: duyệt, ẩn, yêu cầu chỉnh sửa nội dung dịch vụ/hình ảnh/bảng giá.
- Reports: xử lý báo cáo về Provider hoặc dịch vụ kém chất lượng.
- Cả 2 view dùng chung `moderation-table.tsx`, `report-table.tsx`, `report-resolution-dialog.tsx`.

**Status:** ✅ COMPLETED

#### A-04: Giám sát Booking & Giải quyết Tranh chấp (MỞ RỘNG)

**Routes:** `admin/bookings`, `admin/bookings/disputes`, `admin/bookings/no-show`

- Theo dõi toàn bộ booking trên nền tảng.
- Lọc booking theo tất cả status mới: `BOOKED`, `CONFIRMED`, `CHECKED_IN`, `IN_SERVICE`, `COMPLETED`, `COMMISSION_CHARGED`, `CANCELLED_BY_CUSTOMER`, `CANCELLED_BY_PROVIDER`, `NO_SHOW_REPORTED`, `DISPUTED`, `FAILED_APPROVED`.
- **Xử lý NO_SHOW_REPORTED:**
  - Admin xem bằng chứng từ cả 2 phía.
  - Approve no-show → release reserve commission.
  - Reject no-show → chuyển DISPUTED hoặc COMPLETED.
- **Xử lý DISPUTED:**
  - Admin phán quyết: refund / close complaint / override status.
  - Kết quả ảnh hưởng Trust Score của provider.
- Admin có thể override booking status thủ công trong trường hợp đặc biệt.
- Tất cả hành động admin → ghi audit log.

**Status:** ✅ COMPLETED (cần mở rộng no-show flow + status filter mới)

#### A-05: Bảng điều khiển Phân tích Toàn sàn (MỞ RỘNG)

**Route:** `admin/analytics`

- Thống kê: tổng user, tổng booking, doanh thu nền tảng.
- Bảng xếp hạng: Top dịch vụ, Top Provider.
- **Thêm mới:** Commission revenue trend (từ CASH và online booking).
- **Thêm mới:** Provider risk overview: số provider ở mức warning / restricted / suspended.
- Admin dashboard (`admin/page.tsx`) compose lại component từ `apis/admin/analytics/components`.
- Không tạo `apis/admin/dashboard/`.

**Status:** ✅ COMPLETED (cần bổ sung commission chart + risk overview)

#### A-06: Quản lý Balance & Ký quỹ Provider (MỚI)

**Routes:** `admin/providers/[providerId]/balance`, `admin/finance/ledger`

**Feature folder:** `apis/admin/finance/`

- Xem Available / Reserved / Debt Balance của từng provider.
- Xem Trust Score chi tiết và lịch sử chỉ số.
- Điều chỉnh balance thủ công (kèm lý do) → ghi ledger type `ADMIN_ADJUSTMENT`.
- Xem toàn bộ ledger transaction của hệ thống.
- Quản lý nợ quá hạn: mark resolved / force offset / escalate.
- Cài đặt safety buffer theo từng provider hoặc toàn hệ thống.

**Components:**
- `provider-balance-table.tsx`
- `provider-ledger-detail.tsx`
- `balance-adjustment-form.tsx`
- `debt-management-table.tsx`
- `ledger-transaction-table.tsx`
- `trust-score-detail.tsx`

**Status:** ❌ NOT STARTED

#### A-07: Quản lý Hoa hồng (Commission Management) (MỚI)

**Routes:** `admin/finance/commission`, `admin/finance/commission/config`

**Feature folder:** `apis/admin/commission/`

- Xem tất cả commission records trên nền tảng.
- Lọc theo status: `PENDING` (reserved), `CHARGED`, `RELEASED`, `FAILED`.
- Xem pending commission (đã reserve, chưa charge).
- Cấu hình commission rate: theo % hoặc fixed fee, theo loại dịch vụ hoặc provider type.
- Thay đổi config chỉ áp dụng cho booking mới.

**Components:**
- `commission-summary-cards.tsx`
- `commission-table.tsx`
- `pending-commission-table.tsx`
- `commission-config-form.tsx`
- `commission-rate-table.tsx`

**Status:** ❌ NOT STARTED

#### A-08: Quản lý Marketing & Banner (đổi số từ A-06)

**Routes:** `admin/promotions`, `admin/promotions/banners`, `admin/promotions/coupons`

**Feature folder:** `apis/admin/promotions/`

- Quản lý banner slots trên homepage.
- Quản lý coupon và discount rules.
- Quản lý flash sale campaigns.
- Xem campaign performance: views/actions, conversion rate.

**Components:**
- `banner-table.tsx`, `banner-form.tsx`
- `coupon-table.tsx`, `coupon-form.tsx`
- `flash-sale-form.tsx`
- `campaign-overview.tsx`

**Lưu ý:** Marketing **không** liên quan đến commission flow. Commission xử lý riêng ở A-07.

**Status:** ✅ COMPLETED

---

## 5. MAPPING FEATURE → FOLDER

```txt
apis/auth/
apis/public/
apis/pet-owner/profile/
apis/pet-owner/pets/
apis/pet-owner/discovery/
apis/pet-owner/bookings/
apis/pet-owner/payments/
apis/pet-owner/reviews/
apis/pet-owner/notifications/
apis/pet-owner/health-records/
apis/provider/business-profile/
apis/provider/services/
apis/provider/pricing/
apis/provider/bookings/
apis/provider/customers/
apis/provider/revenue/
apis/provider/communication/
apis/provider/deposit/           ← SP-08 MỚI
apis/admin/users/
apis/admin/verification/
apis/admin/moderation/           ← bao gồm cả Reports (A-03)
apis/admin/bookings/
apis/admin/analytics/
apis/admin/finance/              ← A-06 MỚI (provider balance & ledger)
apis/admin/commission/           ← A-07 MỚI (commission management)
apis/admin/promotions/           ← A-08 (đổi số từ A-06)
```

---

## 6. SHARED TYPES CẦN CẬP NHẬT / TẠO MỚI

```txt
types/booking.ts       → cập nhật BookingStatus với các giá trị mới
types/provider.ts      → thêm ProviderBalance, ProviderTrustScore
types/ledger.ts        → tạo mới: LedgerTransaction, LedgerTransactionType
types/commission.ts    → tạo mới: Commission, CommissionConfig, CommissionType
types/payment.ts       → PaymentMethod, PaymentStatus
```

---

## 7. SHARED CONSTANTS CẦN CẬP NHẬT / TẠO MỚI

```txt
constants/booking-status.ts    → cập nhật với BookingStatus mới
constants/payment-method.ts    → CASH, ONLINE_MOMO
constants/ledger-types.ts      → tạo mới: LedgerTransactionType values
constants/trust-score.ts       → tạo mới: risk level thresholds
constants/query-keys.ts        → thêm keys mới: finance, commission, ledger, trust-score
constants/api-endpoints.ts     → thêm endpoints: balance, commission, ledger
```

---

## 8. GHI CHÚ TRIỂN KHAI

- Business form, table, schema, query/mutation nằm trong `apis/[role]/[feature]/`.
- UI component thuần (Button, Input, Select, Dialog, Card, Table) nằm trong `components/ui`.
- Component dùng chung (PageHeader, ConfirmDialog, StatusBadge, EmptyState) nằm trong `components/common`.
- Moderation và Reports là **cùng một feature** `apis/admin/moderation/` — không tách riêng.
- Marketing (A-08) và Commission (A-07) là **2 feature riêng biệt** — không gộp chung.
- Mock UI dùng `initialData` và `enabled: false` để không cần backend thực.
- Luôn cập nhật `CURRENT_STATE.md` sau mỗi feature hoàn thành.