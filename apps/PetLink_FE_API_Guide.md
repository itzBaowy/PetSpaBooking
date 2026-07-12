# PetLink FE API Guide

Tài liệu này giúp dev FE hiểu nhanh các API backend hiện có và cách fetch. Base URL local:

```txt
http://localhost:5500/api
```

Swagger:

```txt
http://localhost:5500/api-docs
```

Seed account password chung:

```txt
Test@123
```

Seed users thường dùng:

```txt
customer_test
provider_test
admin_test
```

Ghi chú cho dev: từ thời điểm này, mỗi tính năng API mới nên được cập nhật vào file này trong cùng lượt triển khai để FE có thể đọc luồng và fetch đúng contract.

## 1. Response Và Auth

Response success chuẩn:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "OK",
  "data": {}
}
```

Login:

```http
POST /api/auth/login
Content-Type: application/json
```

Body:

```json
{
  "userName": "admin_test",
  "password": "Test@123"
}
```

Lấy token ở:

```txt
data.accessToken
```

Các API private gửi header:

```txt
Authorization: Bearer <accessToken>
```

Fetch helper gợi ý:

```ts
const API_BASE_URL = "http://localhost:5500/api";

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "API request failed");
  }

  return json.data as T;
}
```

## 2. Public Mobile Provider APIs

Không cần token.

```http
GET /api/mobile/providers
GET /api/mobile/providers/provider-detail/{providerId}
GET /api/mobile/providers/reviews/{providerId}
```

Provider list query phổ biến:

```txt
page
pageSize
category
userLat
userLng
filters={"businessName":"spa"}
```

Ví dụ:

```ts
const providers = await apiFetch("/mobile/providers?page=1&pageSize=10");
```

Lưu ý availability:

```json
{
  "availability": {
    "isOpenNow": false,
    "canBookFuture": true,
    "todayOpeningHours": {
      "open": "Closed",
      "close": "Closed"
    }
  }
}
```

- `isOpenNow` chỉ thể hiện provider có đang mở cửa tại thời điểm hiện tại hay không.
- FE không nên dùng `isOpenNow = false` để chặn đặt lịch tương lai.
- Muốn đặt lịch, FE gọi `GET /api/mobile/providers/{providerId}/available-slots` và dùng slot trả về.
- `canBookFuture = true` nghĩa là provider có service active và có ít nhất một ngày working hours mở.

## 3. Customer Booking Flow

Customer token required.

### 3.1 Tạo booking

```http
POST /api/mobile/bookings
```

Body:

```json
{
  "providerId": "<providerId>",
  "serviceId": "<serviceId>",
  "petId": null,
  "appointmentStart": "2026-07-12T10:00:00.000Z",
  "paymentMethod": "CASH",
  "note": "Test booking",
  "customerLocation": "Ho Chi Minh City"
}
```

Rule quan trọng:

- Customer phải login.
- Provider phải `VERIFIED`.
- Provider phải có `depositStatus = ACTIVE`.
- `depositBalance >= 300000`.
- Slot phải nằm trong working hours của provider.
- Slot không được trùng availability block.
- Slot không được trùng booking đang `PENDING`, `CONFIRMED`, `CHECKED_IN`.
- Booking mới tạo có `status = PENDING`.
- Nếu `paymentMethod = ONLINE`, booking mới có `paymentStatus = PENDING` và cần tạo MoMo payment.

### 3.1.1 Xem available slots trước khi booking

Không cần token.

```http
GET /api/mobile/providers/{providerId}/available-slots?serviceId={serviceId}&date=2026-07-20
```

Query:

```txt
serviceId
date=YYYY-MM-DD
```

Response `data`:

```json
{
  "providerId": "<providerId>",
  "serviceId": "<serviceId>",
  "date": "2026-07-20",
  "durationMinutes": 60,
  "workingHours": {
    "openTime": "08:00",
    "closeTime": "18:00"
  },
  "slots": [
    {
      "startAt": "2026-07-20T01:00:00.000Z",
      "endAt": "2026-07-20T02:00:00.000Z"
    }
  ]
}
```

FE nên dùng `slots[].startAt` làm `appointmentStart` khi tạo booking.

### 3.1.2 Thanh toán MoMo sandbox cho booking ONLINE

Customer token required.

```http
POST /api/mobile/bookings/{id}/momo/create-payment
```

Rule:

- Booking phải thuộc customer đang login.
- Booking phải có `paymentMethod = ONLINE`.
- Booking chưa được thanh toán, tức `paymentStatus != SUCCESS`.
- Booking chỉ được tạo payment khi `status = PENDING` hoặc `CONFIRMED`.

Response `data`:

```json
{
  "bookingId": "<bookingId>",
  "orderId": "booking-...",
  "requestId": "uuid",
  "amount": 300000,
  "payUrl": "https://test-payment.momo.vn/...",
  "deeplink": "momo://...",
  "qrCodeUrl": "https://...",
  "status": "PENDING"
}
```

FE redirect user sang `payUrl`. Sau khi user thanh toán, MoMo gọi:

```http
GET /api/mobile/payments/momo/return
POST /api/mobile/payments/momo/ipn
```

Hai endpoint callback này public, FE không cần gọi trực tiếp. Backend verify MoMo signature, nếu `resultCode = 0` thì update:

```txt
booking.paymentStatus = SUCCESS
booking.paymentReference = transId hoặc orderId
booking.paidAt = now
```

Provider check-in sẽ bị chặn nếu booking `ONLINE` nhưng `paymentStatus != SUCCESS`.

Backend cần cấu hình MoMo sandbox trước khi API tạo payment gọi được MoMo thật:

```env
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_PARTNER_CODE=...
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...
MOMO_REDIRECT_URL=http://localhost:5500/api/mobile/payments/momo/return
MOMO_IPN_URL=http://localhost:5500/api/mobile/payments/momo/ipn
```

### 3.2 Xem booking của customer

```http
GET /api/mobile/me/bookings
GET /api/mobile/me/bookings/{id}
```

Filter:

```txt
status=PENDING|CONFIRMED|CHECKED_IN|CHECKED_OUT|COMPLETED|CANCELLED|REJECTED|DISPUTE|NO_ARRIVAL
page
pageSize
```

### 3.3 QR token

Customer lấy QR token, FE tự render QR từ string `qrToken`.

```http
GET /api/mobile/me/bookings/{id}/qr?action=CHECK_IN
GET /api/mobile/me/bookings/{id}/qr?action=CHECK_OUT
```

Response:

```json
{
  "bookingId": "...",
  "action": "CHECK_IN",
  "qrToken": "...",
  "expiresInSeconds": 600
}
```

### 3.4 Tạo dispute

Chỉ tạo được khi booking đang `CHECKED_OUT` và còn trong hold window.

```http
POST /api/mobile/bookings/{id}/disputes
```

Body:

```json
{
  "reason": "Service quality issue",
  "description": "The service was not completed as agreed."
}
```

Một booking chỉ có 1 dispute.

### 3.5 Review

Chỉ review được khi booking `COMPLETED`.

```http
POST /api/mobile/bookings/{id}/reviews
```

Body:

```json
{
  "rating": 5,
  "comment": "Great service",
  "images": ["https://res.cloudinary.com/.../review.jpg"]
}
```

## 4. Provider Mobile Flow

Provider token required.

### 4.1 Provider bookings

```http
GET /api/mobile/provider/bookings
PATCH /api/mobile/provider/bookings/{id}/confirm
PATCH /api/mobile/provider/bookings/{id}/reject
```

Reject body:

```json
{
  "reason": "Provider is unavailable"
}
```

### 4.2 QR check-in/check-out

Provider scan QR từ customer rồi gửi token lên API.

```http
POST /api/mobile/provider/bookings/{id}/check-in
POST /api/mobile/provider/bookings/{id}/check-out
```

Body:

```json
{
  "qrToken": "signed-token-from-customer"
}
```

Status flow:

```txt
CONFIRMED -> CHECKED_IN -> CHECKED_OUT
```

Với booking `paymentMethod = ONLINE`, provider chỉ check-in được sau khi MoMo payment thành công.

### 4.3 Provider availability

Provider token required.

```http
GET /api/mobile/provider/working-hours
PUT /api/mobile/provider/working-hours
GET /api/mobile/provider/availability-blocks
POST /api/mobile/provider/availability-blocks
DELETE /api/mobile/provider/availability-blocks/{id}
```

`dayOfWeek` dùng format:

```txt
0=Sunday
1=Monday
2=Tuesday
3=Wednesday
4=Thursday
5=Friday
6=Saturday
```

Update working hours body:

```json
{
  "items": [
    {
      "dayOfWeek": 1,
      "openTime": "08:00",
      "closeTime": "18:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 0,
      "openTime": "00:00",
      "closeTime": "00:00",
      "isClosed": true
    }
  ]
}
```

Create availability block body:

```json
{
  "startAt": "2026-07-20T03:00:00.000Z",
  "endAt": "2026-07-20T05:00:00.000Z",
  "reason": "Personal day off"
}
```

Rule:

- `openTime` và `closeTime` dùng `HH:mm`.
- `openTime` phải trước `closeTime` nếu `isClosed = false`.
- Không được tạo block trùng block đang có.
- Booking mới sẽ bị chặn nếu trùng block hoặc ngoài working hours.

### 4.4 Provider wallet

```http
GET /api/mobile/provider/wallet
GET /api/mobile/provider/wallet/transactions
```

Transaction type filter:

```txt
ONLINE_EARNING
CASH_COMMISSION_DEDUCTION
DEPOSIT_COMMISSION_DEDUCTION
MANUAL_ADJUSTMENT
WITHDRAWAL_PAYOUT
```

### 4.5 Provider withdrawals

Provider tạo yêu cầu rút tiền, chưa trừ ví ngay. Admin `mark-paid` mới trừ ví.

```http
POST /api/mobile/provider/withdrawals
GET /api/mobile/provider/withdrawals
```

Body tạo withdrawal:

```json
{
  "amount": 200000,
  "reason": "Monthly payout"
}
```

Rule:

- Provider phải `VERIFIED`.
- Minimum amount: `100000 VND`.
- Wallet phải đủ tiền.
- Provider phải có bank account.
- Nếu provider có dispute `PENDING` thì bị chặn.

## 5. Mobile Notifications

Token required, dùng được cho customer/provider/admin user.

```http
GET /api/mobile/notifications
PATCH /api/mobile/notifications/{id}/read
PATCH /api/mobile/notifications/read-all
```

Query:

```txt
page
pageSize
type
unread=true
```

Notification response có `data` đã decode thành object.

Các event hiện có thể tạo notification:

- `BOOKING_CONFIRMED`
- `BOOKING_REJECTED`
- `BOOKING_CHECKED_IN`
- `BOOKING_CHECKED_OUT`
- `BOOKING_COMPLETED`
- `DISPUTE_CREATED`
- `DISPUTE_RESOLVED`
- `WITHDRAWAL_APPROVED`
- `WITHDRAWAL_REJECTED`
- `WITHDRAWAL_PAID`
- `PAYMENT_SUCCESS`
- `BOOKING_ONLINE_PAID`
- `PROVIDER_VERIFIED`
- `PROVIDER_REJECTED`
- `PROVIDER_DOCUMENT_APPROVED`
- `PROVIDER_DOCUMENT_REJECTED`
- `PROVIDER_READY_FOR_VERIFICATION`
- `ACCOUNT_STATUS_CHANGED`

## 6. Admin APIs

Admin token required.

### 6.1 Dashboard

```http
GET /api/admin/dashboard/summary
```

Trả summary:

```txt
users
providers
bookings
finance
disputes
services
withdrawals
```

### 6.2 Admin users

```http
GET /api/admin/users
GET /api/admin/users/{id}
PATCH /api/admin/users/{id}/status
```

List filters:

```txt
role=CUSTOMER|PROVIDER|ADMIN
status=ACTIVE|INACTIVE|BANNED
keyword
page
pageSize
```

Update status body:

```json
{
  "status": "BANNED",
  "reason": "Fraudulent activity"
}
```

Rule:

- Admin không thể ban/deactivate chính mình.
- Nếu user có provider profile và bị `INACTIVE`/`BANNED`, provider chuyển `SUSPENDED`.
- Khi user chuyển lại `ACTIVE`, provider restore về trạng thái trước khi bị suspend bởi user status.

### 6.3 Admin providers

```http
GET /api/admin/providers
GET /api/admin/providers/pending
GET /api/admin/providers/{id}
GET /api/admin/providers/{id}/documents
PATCH /api/admin/providers/{id}/verify
PATCH /api/admin/providers/{id}/reject
PATCH /api/admin/providers/{id}/suspend
PATCH /api/admin/provider-documents/{documentId}/approve
PATCH /api/admin/provider-documents/{documentId}/reject
```

Reject body:

```json
{
  "reason": "Missing business license"
}
```

Suspend body:

```json
{
  "reason": "Policy violation"
}
```

`/pending` trả thêm:

```json
{
  "documentSummary": {
    "total": 2,
    "pending": 2
  }
}
```

Provider documents response:

```json
{
  "providerId": "<providerId>",
  "requiredDocumentTypes": [
    "business_license",
    "id_card_front",
    "id_card_back"
  ],
  "items": [
    {
      "id": "<documentId>",
      "providerId": "<providerId>",
      "documentType": "business_license",
      "imageUrl": "https://res.cloudinary.com/...",
      "cloudinaryPublicId": "petlink/provider-documents/...",
      "status": "PENDING",
      "adminNote": null,
      "createAt": "2026-07-11T10:00:00.000Z",
      "updateAt": "2026-07-11T10:00:00.000Z"
    }
  ]
}
```

Document statuses:

```txt
PENDING
APPROVED
REJECTED
```

Reject document body:

```json
{
  "reason": "Business license is blurry"
}
```

Verify provider rule:

- Provider chỉ được `VERIFIED` khi các document bắt buộc đã có ít nhất một bản `APPROVED`.
- Required document types hiện tại: `business_license`, `id_card_front`, `id_card_back`.
- Nếu thiếu, API `PATCH /api/admin/providers/{id}/verify` trả `400` kèm danh sách document còn thiếu trong message.

Ví dụ fetch:

```ts
const documents = await apiFetch(`/admin/providers/${providerId}/documents`, {
  token: adminToken,
});

await apiFetch(`/admin/provider-documents/${documentId}/approve`, {
  method: "PATCH",
  token: adminToken,
});

await apiFetch(`/admin/provider-documents/${documentId}/reject`, {
  method: "PATCH",
  token: adminToken,
  body: JSON.stringify({ reason: "Business license is blurry" }),
});
```

### 6.4 Admin bookings

```http
GET /api/admin/bookings
GET /api/admin/bookings/{id}
```

List filters:

```txt
status
paymentMethod=CASH|ONLINE
paymentStatus=UNPAID|PENDING|SUCCESS|FAILED|REFUNDED
providerId
customerId
from
to
page
pageSize
```

List không trả full `walletTransactions`, chỉ trả `_count.walletTransactions`.

Detail trả full:

```txt
customer
provider
service
dispute
review
walletTransactions
```

### 6.5 Admin disputes

```http
GET /api/admin/disputes
GET /api/admin/disputes/{id}
PATCH /api/admin/disputes/{id}/resolve
```

Resolve body:

```json
{
  "status": "RESOLVED_PROVIDER_WIN",
  "adminNote": "Provider completed the service correctly."
}
```

Resolution rules:

- `RESOLVED_PROVIDER_WIN`: booking -> `COMPLETED`, chạy commission.
- `RESOLVED_CUSTOMER_WIN`: booking -> `CANCELLED`, không chạy commission v1.
- `CANCELLED`: hiểu là hủy khiếu nại, booking -> `COMPLETED`, chạy commission.

### 6.6 Admin finance

```http
GET /api/admin/wallet-transactions
GET /api/admin/providers/{id}/wallet
POST /api/admin/providers/{id}/wallet/adjust
GET /api/admin/bookings/{id}/finance
```

Wallet transaction filters:

```txt
providerId
bookingId
type
balanceType=WALLET|DEPOSIT
page
pageSize
```

Manual adjustment body:

```json
{
  "balanceType": "WALLET",
  "amount": 50000,
  "reason": "Manual compensation"
}
```

Rule:

- `amount` khác 0.
- Không cho balance âm.
- Ghi ledger `MANUAL_ADJUSTMENT`.

### 6.7 Admin withdrawals

```http
GET /api/admin/withdrawals
GET /api/admin/withdrawals/{id}
PATCH /api/admin/withdrawals/{id}/approve
PATCH /api/admin/withdrawals/{id}/reject
PATCH /api/admin/withdrawals/{id}/mark-paid
```

Approve body optional:

```json
{
  "adminNote": "Approved for payout"
}
```

Reject body:

```json
{
  "adminNote": "Bank account information is invalid"
}
```

Mark paid body optional:

```json
{
  "adminNote": "Paid via bank transfer"
}
```

Status flow:

```txt
PENDING -> APPROVED -> PAID
PENDING -> REJECTED
```

`mark-paid` trừ `provider.walletBalance` và ghi ledger `WITHDRAWAL_PAYOUT`.

### 6.8 Admin audit logs

```http
GET /api/admin/audit-logs
```

Filters:

```txt
adminId
action
targetType
targetId
from
to
page
pageSize
```

Audit actions hiện có:

```txt
WITHDRAWAL_APPROVE
WITHDRAWAL_REJECT
WITHDRAWAL_MARK_PAID
DISPUTE_RESOLVE
PROVIDER_WALLET_ADJUST
USER_STATUS_UPDATE
PROVIDER_VERIFY
PROVIDER_REJECT
PROVIDER_SUSPEND
PROVIDER_DOCUMENT_APPROVE
PROVIDER_DOCUMENT_REJECT
```

### 6.9 Admin reports

```http
GET /api/admin/reports/revenue
GET /api/admin/reports/revenue/daily
GET /api/admin/reports/providers
GET /api/admin/reports/disputes
```

Query chung:

```txt
from=2026-07-01
to=2026-07-31
```

Provider report có thêm phân trang:

```txt
page
pageSize
```

Revenue summary trả các số tổng hợp:

```txt
completedBookings
cashBookings
onlineBookings
totalRevenue
totalCommission
totalProviderEarning
withdrawalPaidAmount
netPlatformRevenue
```

Daily revenue trả mảng theo ngày:

```json
[
  {
    "date": "2026-07-11",
    "completedBookings": 3,
    "totalRevenue": 1500000,
    "totalCommission": 150000,
    "totalProviderEarning": 1350000
  }
]
```

Provider performance trả danh sách provider kèm booking/revenue/review/dispute summary:

```txt
items
pagination
```

Dispute report trả bucket theo status:

```txt
pending
resolvedProviderWin
resolvedCustomerWin
cancelled
total
```

Ví dụ fetch:

```ts
const revenue = await apiFetch("/admin/reports/revenue?from=2026-07-01&to=2026-07-31", {
  token: adminToken,
});

const providers = await apiFetch("/admin/reports/providers?page=1&pageSize=10", {
  token: adminToken,
});
```

## 7. Booking Lifecycle FE Cần Nhớ

Normal:

```txt
PENDING -> CONFIRMED -> CHECKED_IN -> CHECKED_OUT -> COMPLETED
```

Rejected:

```txt
PENDING -> REJECTED
```

Dispute:

```txt
CHECKED_OUT -> DISPUTE
```

Admin resolve:

```txt
DISPUTE + RESOLVED_PROVIDER_WIN -> COMPLETED
DISPUTE + RESOLVED_CUSTOMER_WIN -> CANCELLED
DISPUTE + CANCELLED -> COMPLETED
```

## 8. Error Handling FE Gợi Ý

Status thường gặp:

```txt
400: input/rule sai
401: thiếu token/token sai
403: sai role hoặc account bị INACTIVE/BANNED
404: resource không tồn tại hoặc không thuộc user hiện tại
```

Ví dụ:

```ts
try {
  await apiFetch("/mobile/bookings", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
} catch (error) {
  alert(error instanceof Error ? error.message : "Something went wrong");
}
```

## 9. Quick Test Order Cho FE

1. Login `admin_test`, `provider_test`, `customer_test`.
2. Admin verify provider và đảm bảo deposit active trong DB/seed.
3. Customer tạo booking.
4. Provider confirm booking.
5. Customer lấy QR `CHECK_IN`.
6. Provider check-in bằng QR.
7. Customer lấy QR `CHECK_OUT`.
8. Provider check-out bằng QR.
9. Chờ auto-complete hoặc admin xử lý dispute tùy case.
10. Customer review khi booking `COMPLETED`.
11. Provider xem wallet/withdrawal.
12. Admin audit finance/withdrawal/audit logs.
