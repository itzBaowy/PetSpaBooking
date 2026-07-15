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

Seed còn tạo thêm 30 provider đã xác minh, có ký quỹ active, avatar, cover và ảnh dịch vụ để FE kiểm tra danh sách/tìm kiếm:

```txt
provider_demo_01
provider_demo_02
...
provider_demo_30
```

Các tài khoản demo provider này đều dùng password `Test@123`.

Seed còn có 12 customer demo đầy đủ họ tên, email, số điện thoại, avatar và location:

```txt
customer_demo_01
customer_demo_02
...
customer_demo_12
```

Các customer demo cũng dùng password `Test@123`. Mỗi provider đang `VERIFIED` có 4 dịch vụ lấy từ catalog đa dạng và ít nhất 5 review từ 5 customer demo khác nhau; mỗi review gắn với một booking `COMPLETED` thật. `provider_test` cũng có avatar, cover, ảnh dịch vụ và các review bổ sung để FE kiểm tra provider detail.

Ghi chú cho dev: từ thời điểm này, mỗi tính năng API mới nên được cập nhật vào file này trong cùng lượt triển khai để FE có thể đọc luồng và fetch đúng contract.

## Email SendGrid

Backend có tích hợp gửi email qua SendGrid bằng package `@sendgrid/mail`. FE không cần gọi API riêng để gửi email; email được gửi như side-effect sau khi nghiệp vụ chính thành công. Nếu SendGrid lỗi, API vẫn trả response thành công cho nghiệp vụ chính và backend chỉ log lỗi.

ENV backend cần có:

```env
SENDGRID_API_KEY=<sendgrid-api-key>
SENDGRID_FROM_EMAIL=no-reply@petlink.io.vn
SENDGRID_FROM_NAME=PetLink
```

Backend cũng fallback đọc `SENDGIRD_API_KEY` nếu env bị gõ nhầm tên, nhưng nên dùng chuẩn `SENDGRID_API_KEY`.

Email tự động hiện có:

- Customer tạo booking thành công: gửi cho customer, status `PENDING`, kèm provider/service/thời gian/số tiền.
- Customer tạo booking thành công: gửi cho provider, báo có booking mới cần confirm/reject.
- Provider confirm booking: gửi cho customer.
- Provider reject booking: gửi cho customer, kèm lý do nếu có.
- Customer cancel booking: gửi cho provider, kèm lý do nếu có.
- Thanh toán MoMo booking thành công: gửi cho customer.
- Nạp ký quỹ provider qua MoMo thành công: gửi cho provider.
- Booking auto/manual complete: gửi cho customer, nhắc có thể đánh giá provider.

Lưu ý: Email chỉ nên dùng để thông báo quan trọng. Chat realtime, QR check-in/check-out và các notification tần suất cao vẫn ưu tiên socket/push/in-app notification.

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

### 1.1 Đổi password

Token required, dùng được cho customer/provider/admin user.

```http
PATCH /api/users/me/password
```

Body:

```json
{
  "currentPassword": "Test@123",
  "newPassword": "NewTest@123",
  "confirmPassword": "NewTest@123"
}
```

Rule:

- `currentPassword`, `newPassword`, `confirmPassword` bắt buộc.
- `currentPassword` phải đúng password hiện tại.
- `newPassword` tối thiểu 6 ký tự.
- `newPassword` và `confirmPassword` phải trùng nhau.
- `newPassword` phải khác `currentPassword`.
- Sau khi đổi password, FE nên yêu cầu user login lại hoặc refresh local auth state.

### 1.2 Realtime Socket.IO

Socket endpoint dùng chung host API:

```txt
http://localhost:5500
```

FE connect bằng access token:

```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:5500", {
  auth: {
    token: accessToken,
  },
});

socket.on("socket:connected", (payload) => {
  console.log("socket connected", payload);
});
```

Khi connect thành công, backend tự join:

```txt
user:{userId}
role:{role}
provider:{providerId} // nếu user là provider
```

FE có thể join room booking khi đang mở booking detail:

```ts
socket.emit("booking:join", { bookingId });
socket.emit("booking:leave", { bookingId });
```

FE có thể join room chat thread khi đang mở màn chat:

```ts
socket.emit("chat:join", { threadId });
socket.emit("chat:typing", { threadId, isTyping: true });
socket.emit("chat:leave", { threadId });
```

Realtime events v1:

```txt
notification:new
booking:new
booking:updated
payment:updated
refund:updated
chat:message:new
chat:typing
chat:read
```

Ý nghĩa:

- `notification:new`: có notification mới, payload có `notification`.
- `booking:new`: provider nhận booking mới.
- `booking:updated`: booking đổi trạng thái hoặc dữ liệu thanh toán/refund liên quan.
- `payment:updated`: MoMo payment thành công/thất bại được cập nhật.
- `refund:updated`: admin mark refunded/reject refund.
- `chat:message:new`: có tin nhắn chat mới.
- `chat:typing`: user còn lại đang nhập trong thread.
- `chat:read`: tin nhắn trong thread đã được đọc.

REST API và DB vẫn là nguồn sự thật. Nếu socket disconnect, FE gọi lại REST list/detail để sync lại state.

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

Fallback sync cho customer booking payment:

```http
POST /api/mobile/bookings/{bookingId}/momo/sync
Authorization: Bearer <customer_accessToken>
Content-Type: application/json
```

Body optional:

```json
{
  "orderId": "booking-..."
}
```

Nếu customer thanh toán xong nhưng thoát MoMo giữa chừng, không quay lại frontend return page, mobile app gọi endpoint này khi user quay lại app hoặc mở lại màn booking/payment. Nếu không gửi `orderId`, backend sync payment MoMo `PENDING` mới nhất của booking đó. Khi MoMo query trả `resultCode = 0`, backend cập nhật:

```txt
booking.paymentStatus = SUCCESS
booking.paymentReference = transId hoặc orderId
booking.paidAt = now
payment_transactions.status = SUCCESS
commission_records.heldAmount = booking.totalAmount
commission_records.fundStatus = HELD
```

Response `data` có `booking`, `payment`, `momoResponse`, `synced`.

```env
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_QUERY_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/query
MOMO_REQUEST_TYPE=payWithMethod
MOMO_PARTNER_CODE=...
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...
MOMO_REDIRECT_URL=http://localhost:3000/payment/momo/return
MOMO_IPN_URL=http://localhost:5500/api/mobile/payments/momo/ipn
MOMO_PROVIDER_DEPOSIT_REDIRECT_URL=http://localhost:3000/provider/wallet/deposit/return
MOMO_PROVIDER_DEPOSIT_IPN_URL=http://localhost:5500/api/mobile/payments/momo/provider-deposit/ipn
ENABLE_MOMO_PAYMENT_SYNC_JOB=true
MOMO_PAYMENT_SYNC_CRON_SECONDS=30
MOMO_PAYMENT_SYNC_BATCH_SIZE=20
```

`MOMO_REQUEST_TYPE=payWithMethod` dùng MoMo Collection Link để payment page có thể hiển thị nhiều phương thức như ví MoMo, ATM hoặc thẻ nếu sandbox merchant được MoMo bật các phương thức đó. Nếu đổi về `captureWallet`, page thường chỉ tập trung vào ví MoMo/QR/deeplink.

Backend có cron `momo-payment-sync` để tự query MoMo cho các payment `PENDING` mỗi 30 giây:

```txt
BOOKING payment -> cập nhật booking paymentStatus, payment transaction, commission heldAmount
PROVIDER_DEPOSIT payment -> cộng depositBalance, cập nhật depositStatus, ghi wallet transaction
```

Manual sync endpoint vẫn nên giữ ở FE/mobile khi cần refresh ngay lập tức, nhưng cron giúp xử lý trường hợp user đóng MoMo, không về return page và IPN local không tới được.

Redirect URL nên trỏ về frontend để user thấy màn hình kết quả:

```txt
/payment/momo/return
/provider/wallet/deposit/return
```

Frontend return page sẽ forward toàn bộ query params MoMo nhận được về backend return endpoint tương ứng để backend verify signature và cập nhật trạng thái. IPN URL vẫn trỏ về backend vì đây là callback server-to-server dùng để verify signature và cập nhật trạng thái thanh toán thật; trong local dev, IPN tới `localhost` thường không chạy được nếu MoMo không truy cập được máy dev.

Với ATM/card, amount nên từ `10000` VND trở lên. Backend hiện validate theo request type: `payWithMethod` tối thiểu `10000` VND, `captureWallet` tối thiểu `1000` VND.

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

Request dùng `multipart/form-data`:

```txt
reason: Service quality issue
description: The service was not completed as agreed.
evidenceFiles: <file 1>
evidenceFiles: <file 2>
```

- `reason`: bắt buộc.
- `description`: optional.
- `evidenceFiles`: optional, gửi lặp cùng field name để upload nhiều file.
- Hỗ trợ JPEG, PNG, WEBP, PDF, MP4 và MOV; tối đa 10 file, mỗi file tối đa 8 MB.
- Backend nhận file qua Multer, upload lên Cloudinary và trả `evidence` gồm `url`, `type`, `title`, `mimeType`, `originalName`, `size`.

React Native phải tạo `FormData`, không tự đặt chuỗi URL vào body:

```ts
const formData = new FormData();
formData.append("reason", reason);
formData.append("description", description);
files.forEach((file) => {
  formData.append("evidenceFiles", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as never);
});

await fetch(`${API_URL}/api/mobile/bookings/${bookingId}/disputes`, {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
  body: formData,
});
```

Không tự set `Content-Type`; React Native/fetch sẽ thêm multipart boundary đúng cách.

Một booking chỉ có 1 dispute.

### 3.5 Customer cancel booking

Customer token required.

```http
PATCH /api/mobile/bookings/{id}/cancel
```

Body optional:

```json
{
  "reason": "I need to reschedule"
}
```

Rule:

- Customer chỉ hủy booking của chính mình.
- Chỉ hủy được booking `PENDING` hoặc `CONFIRMED`.
- Booking chuyển sang `CANCELLED`.
- Nếu booking `ONLINE` đã paid `SUCCESS`, `paymentStatus` chuyển sang `REFUND_PENDING`.
- Nếu booking `ONLINE` còn `PENDING`, `paymentStatus` chuyển sang `CANCELLED`.

### 3.6 Review

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
PATCH /api/mobile/provider/bookings/{id}/cancel
PATCH /api/mobile/provider/bookings/{id}/no-arrival
```

Reject body:

```json
{
  "reason": "Provider is unavailable"
}
```

Cancel body optional:

```json
{
  "reason": "Provider is unavailable"
}
```

Provider cancel rule:

- Provider owner mới được hủy.
- Chỉ hủy được booking `CONFIRMED`.
- Booking chuyển sang `CANCELLED`.
- Nếu booking `ONLINE` đã paid `SUCCESS`, `paymentStatus` chuyển sang `REFUND_PENDING`.

No-arrival rule:

- Provider owner mới được mark no-arrival.
- Chỉ mark được booking `CONFIRMED`.
- Chỉ được mark sau `appointmentStart + BOOKING_NO_ARRIVAL_GRACE_MINUTES`.
- Default grace period hiện tại là `15` phút.
- Booking chuyển sang `NO_ARRIVAL`.

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
- Không được tạo block nếu khoảng thời gian đó đang có booking active (`PENDING`, `CONFIRMED`, `CHECKED_IN`). Provider phải xử lý/cancel/hoàn tất booking đó trước rồi mới khóa lịch.
- Booking mới sẽ bị chặn nếu trùng block hoặc ngoài working hours.

### 4.4 Provider wallet

```http
GET /api/mobile/provider/wallet
GET /api/mobile/provider/wallet/transactions
POST /api/mobile/provider/deposit/momo/create-payment
POST /api/mobile/provider/deposit/momo/sync
```

Provider nạp ký quỹ qua MoMo sandbox:

```http
POST /api/mobile/provider/deposit/momo/create-payment
```

Body:

```json
{
  "amount": 300000
}
```

Rule:

- Provider phải login role `PROVIDER`.
- Provider phải được admin xác thực hồ sơ trước, tức `providerStatus = VERIFIED`.
- Amount tối thiểu là giá trị lớn hơn giữa `minProviderDeposit` trong system settings và minimum amount theo MoMo request type.
- FE redirect provider sang `payUrl`.
- Khi MoMo callback success, backend tăng `depositBalance`, cập nhật `depositStatus`, ghi ledger `DEPOSIT_TOP_UP`.
- Mỗi lần gọi create payment nạp ký quỹ sẽ tạo một MoMo order mới theo amount hiện tại. Không reuse payment `PENDING` cũ như luồng booking.
- Nếu user thanh toán xong nhưng thoát MoMo trước khi redirect về frontend, FE tự gọi `POST /api/mobile/provider/deposit/momo/sync` khi provider mở lại trang ví hoặc bấm tải lại số dư. Backend query MoMo bằng pending order mới nhất; nếu MoMo báo success thì backend vẫn cộng ký quỹ và ghi ledger.

Response `data`:

```json
{
  "providerId": "<providerId>",
  "orderId": "provider-deposit-...",
  "requestId": "uuid",
  "amount": 300000,
  "payUrl": "https://test-payment.momo.vn/...",
  "deeplink": "momo://...",
  "qrCodeUrl": "https://...",
  "status": "PENDING"
}
```

Sync body optional:

```json
{
  "orderId": "provider-deposit-..."
}
```

Nếu không truyền `orderId`, backend sync payment nạp ký quỹ `PENDING` mới nhất của provider đang login.

Transaction type filter:

```txt
ONLINE_EARNING
CASH_COMMISSION_DEDUCTION
DEPOSIT_COMMISSION_DEDUCTION
CASH_REFUND_DEDUCTION
DEPOSIT_TOP_UP
MANUAL_ADJUSTMENT
WITHDRAWAL_PAYOUT
WITHDRAWAL_HOLD
WITHDRAWAL_RELEASE
```

### 4.5 Provider withdrawals

Provider tạo yêu cầu rút tiền thì backend giữ tiền ngay bằng cách trừ `provider.walletBalance` và ghi ledger `WITHDRAWAL_HOLD`. Cách này tránh provider spam nhiều yêu cầu rút cùng một số dư.

Nếu admin reject/fail yêu cầu, backend hoàn tiền về ví provider và ghi ledger `WITHDRAWAL_RELEASE`. Khi admin `mark-paid`, backend chỉ đổi trạng thái sang `PAID`, không trừ ví lần hai. Với request cũ trong DB chưa có `WITHDRAWAL_HOLD`, `mark-paid` vẫn trừ ví một lần theo ledger legacy `WITHDRAWAL_PAYOUT`.

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
- Wallet phải đủ tiền; số tiền sẽ bị hold ngay sau khi tạo request thành công.
- Provider phải có bank account.
- Nếu provider có dispute `PENDING` thì bị chặn.

### 4.6 Provider disputes

Provider xem và phản hồi khiếu nại liên quan tới booking của mình:

```http
GET /api/mobile/provider/disputes?status=PENDING
GET /api/mobile/provider/disputes/{disputeId}
POST /api/mobile/provider/disputes/{disputeId}/response
```

Response detail có:

```txt
reason
description
evidence: bằng chứng customer gửi
providerResponse
providerEvidence
providerRespondedAt
status
booking: thông tin booking, customer, service, payment
```

Provider gửi response bằng `multipart/form-data`:

```txt
response: The service was completed as agreed. Please see attached checkout photos.
evidenceFiles: <file 1>
evidenceFiles: <file 2>
```

FE/mobile dùng `FormData` tương tự customer tạo dispute: append text vào `response`, sau đó append từng file với cùng field name `evidenceFiles`. Không tự set header `Content-Type` để client tự thêm multipart boundary.

Rule:

- Provider chỉ xem/phản hồi dispute thuộc booking của mình.
- Chỉ phản hồi được dispute `PENDING`.
- `evidenceFiles` optional; hỗ trợ JPEG, PNG, WEBP, PDF, MP4 và MOV, tối đa 10 file và 8 MB mỗi file.
- Backend nhận file qua Multer, upload Cloudinary rồi trả metadata trong `providerEvidence`; FE không cần tự upload và truyền URL.
- Sau khi provider phản hồi, customer và admin nhận notification `DISPUTE_PROVIDER_RESPONSE`.

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
- `BOOKING_CANCELLED`
- `BOOKING_NO_ARRIVAL`
- `REFUND_PENDING`
- `REFUND_COMPLETED`
- `REFUND_REJECTED`
- `DISPUTE_CREATED`
- `DISPUTE_RESOLVED`
- `WITHDRAWAL_APPROVED`
- `WITHDRAWAL_REJECTED`
- `WITHDRAWAL_PAID`
- `PAYMENT_SUCCESS`
- `BOOKING_ONLINE_PAID`
- `PROVIDER_VERIFIED`
- `PROVIDER_DEPOSIT_TOP_UP`
- `PROVIDER_REJECTED`
- `PROVIDER_DOCUMENT_APPROVED`
- `PROVIDER_DOCUMENT_REJECTED`
- `PROVIDER_READY_FOR_VERIFICATION`
- `SERVICE_HIDDEN_BY_ADMIN`
- `SERVICE_UNHIDDEN_BY_ADMIN`
- `ACCOUNT_STATUS_CHANGED`
- `ADMIN_ANNOUNCEMENT`
- `CHAT_MESSAGE_NEW`

### 5.1 Mobile Chat

Token required, dùng cho customer/provider trong booking mà họ sở hữu.

```http
GET /api/mobile/bookings/{bookingId}/chat/thread
GET /api/mobile/chat/threads
GET /api/mobile/chat/threads/{threadId}/messages
POST /api/mobile/chat/threads/{threadId}/messages
PATCH /api/mobile/chat/threads/{threadId}/read
```

Luồng FE gợi ý:

1. Mở booking detail.
2. Gọi `GET /api/mobile/bookings/{bookingId}/chat/thread` để lấy hoặc tạo thread.
3. Gọi `GET /api/mobile/chat/threads/{threadId}/messages` để load lịch sử.
4. Socket join room:

```ts
socket.emit("chat:join", { threadId });
```

5. Gửi tin nhắn bằng REST:

```http
POST /api/mobile/chat/threads/{threadId}/messages
```

Body:

```json
{
  "content": "Hello, I have a question about the booking."
}
```

6. FE nghe socket event:

```ts
socket.on("chat:message:new", ({ threadId, bookingId, message }) => {
  // append message vào UI nếu đang ở đúng thread
});

socket.on("chat:typing", ({ threadId, userId, isTyping }) => {
  // show typing indicator
});

socket.on("chat:read", ({ threadId, readerId, readAt, count }) => {
  // update read state
});
```

Rule:

- Chỉ customer owner hoặc provider owner của booking được chat.
- Booking `REJECTED` không tạo thread chat mới.
- Message v1 chỉ hỗ trợ `TEXT`.
- `content` không được rỗng và tối đa 2000 ký tự.
- REST/DB là nguồn sự thật; socket chỉ dùng realtime.

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

### 6.1.1 Admin system settings

Admin token required. Dùng để cấu hình các rule nghiệp vụ chính mà trước đây nằm trong ENV/code.

```http
GET /api/admin/settings
PATCH /api/admin/settings
```

Response `data` trả từng setting theo format:

```json
{
  "minProviderDeposit": {
    "key": "MIN_PROVIDER_DEPOSIT",
    "value": 300000,
    "defaultValue": 300000,
    "description": "Minimum active provider deposit balance in VND.",
    "source": "DB",
    "updatedBy": "<adminUserId>",
    "updatedAt": "2026-07-13T10:00:00.000Z"
  }
}
```

Update body có thể gửi một hoặc nhiều field:

```json
{
  "minProviderDeposit": 300000,
  "platformCommissionRate": 0.15,
  "bookingAutoCompleteHours": 10,
  "bookingNoArrivalGraceMinutes": 15,
  "minWithdrawalAmount": 100000
}
```

Ý nghĩa:

- `minProviderDeposit`: deposit tối thiểu để provider được nhận booking/quản lý service.
- `platformCommissionRate`: tỷ lệ commission khi booking `COMPLETED`, ví dụ `0.15` là 15%.
- `bookingAutoCompleteHours`: số giờ hold sau checkout trước khi auto-complete nếu không có dispute.
- `bookingNoArrivalGraceMinutes`: số phút sau `appointmentStart` provider mới được mark `NO_ARRIVAL`.
- `minWithdrawalAmount`: số tiền rút tối thiểu của provider.

Rule:

- `platformCommissionRate` phải từ `0` đến `1`.
- Các setting còn lại không được âm; `bookingAutoCompleteHours` phải lớn hơn hoặc bằng `1`.
- Nếu DB chưa có setting, backend dùng ENV tương ứng nếu hợp lệ, sau đó fallback default.
- Khi admin update, backend ghi audit log `SYSTEM_SETTINGS_UPDATE`.

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

### 6.4 Admin services

```http
GET /api/admin/services
GET /api/admin/services/{id}
PATCH /api/admin/services/{id}/hide
PATCH /api/admin/services/{id}/unhide
```

List filters:

```txt
providerId
category=GROOMING|SPA|BOARDING|TRAINING|VETERINARY|OTHER
isActive=true|false
isHiddenByAdmin=true|false
keyword
page
pageSize
```

Hide body optional:

```json
{
  "reason": "Service violates platform policy"
}
```

Rule:

- `hide` set `isHiddenByAdmin = true`.
- `unhide` set `isHiddenByAdmin = false`.
- Service bị admin hidden sẽ không xuất hiện trong public/mobile bookable services.
- Customer không thể tạo booking với service `isHiddenByAdmin = true`.
- Provider vẫn thấy field `isHiddenByAdmin` trong service của mình để hiển thị trạng thái bị admin ẩn.
- Hide/unhide gửi notification cho provider và ghi audit log.

### 6.5 Admin reviews

```http
GET /api/admin/reviews
GET /api/admin/reviews/{id}
PATCH /api/admin/reviews/{id}/hide
PATCH /api/admin/reviews/{id}/unhide
```

List filters:

```txt
providerId
customerId
isHiddenByAdmin=true|false
page
pageSize
```

Hide body:

```json
{
  "reason": "Review contains inappropriate language"
}
```

Unhide body optional:

```json
{
  "reason": "Review was restored after moderation"
}
```

Rule:

- `hide` set `isHiddenByAdmin = true` và lưu `adminNote`.
- `unhide` set `isHiddenByAdmin = false`.
- Public/mobile provider review list không trả review bị ẩn.
- Public/mobile provider rating không tính review bị ẩn.
- Admin review list/detail vẫn thấy cả review ẩn và không ẩn.
- Action này ghi audit log `REVIEW_HIDE` hoặc `REVIEW_UNHIDE`.

### 6.6 Admin bookings

```http
GET /api/admin/bookings
GET /api/admin/bookings/{id}
POST /api/admin/bookings/auto-complete/run
```

List filters:

```txt
status
paymentMethod=CASH|ONLINE
paymentStatus=UNPAID|PENDING|SUCCESS|FAILED|REFUND_PENDING|REFUNDED|CANCELLED
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

Manual auto-complete scan:

```http
POST /api/admin/bookings/auto-complete/run
```

API này cho admin chạy quét booking thủ công thay vì đợi cron job. Backend sẽ tìm booking:

```txt
status = CHECKED_OUT
checkedOutAt đã quá BOOKING_AUTO_COMPLETE_HOURS
không có dispute active PENDING
```

Booking hợp lệ sẽ chuyển sang `COMPLETED` và chạy commission giống cron job.

Response `data`:

```json
{
  "completedCount": 3,
  "holdHours": 10
}
```

### 6.7 Admin disputes

```http
GET /api/admin/disputes
GET /api/admin/disputes/{id}
PATCH /api/admin/disputes/{id}/resolve
```

Admin detail `GET /api/admin/disputes/{id}` trả evidence customer gửi, providerResponse/providerEvidence nếu provider đã phản hồi, adminEvidence nếu đã resolve, và booking kèm customer/provider/service/payment để admin đủ dữ liệu ra quyết định.

Nếu dispute đã được xử `RESOLVED_CUSTOMER_WIN` và booking đang `paymentStatus = REFUND_PENDING`, response có thêm `refundAction` để FE render banner/nút qua màn refund:

```json
{
  "refundAction": {
    "status": "PENDING",
    "message": "This dispute was resolved in customer favor and is waiting for manual refund.",
    "bookingId": "bookingId",
    "refundAmount": 300000,
    "refundSource": "ONLINE_PAYMENT",
    "refundRequestedAt": "2026-07-14T10:00:00.000Z",
    "refundReason": "Customer evidence is valid",
    "canOpenRefund": true,
    "refundDetailPath": "/admin/refunds/bookingId",
    "refundDetailApi": "/api/admin/refunds/bookingId"
  }
}
```

`refundSource` có thể là:

```txt
ONLINE_PAYMENT
PROVIDER_WALLET_DEPOSIT
```

FE gợi ý:

- Nếu `refundAction.status = PENDING`, hiện alert "Tranh chấp này đang chờ hoàn tiền" và nút "Đi tới hoàn tiền".
- Nút có thể điều hướng bằng `refundDetailPath`; nếu route FE khác thì dùng `bookingId` để build route riêng.
- Nếu `refundAction.status = COMPLETED`, chỉ hiện trạng thái đã hoàn tiền, không cần CTA.

Resolve body:

```json
{
  "status": "RESOLVED_PROVIDER_WIN",
  "adminNote": "Provider completed the service correctly."
}
```

Resolve body có thể kèm evidence của admin:

```json
{
  "status": "RESOLVED_CUSTOMER_WIN",
  "adminNote": "Customer evidence is valid. Manual refund required.",
  "adminEvidence": [
    {
      "url": "https://res.cloudinary.com/.../admin-proof.pdf",
      "type": "PDF",
      "title": "Admin decision proof",
      "note": "Reviewed customer evidence and provider records."
    }
  ]
}
```

Resolution rules:

- `RESOLVED_PROVIDER_WIN`: booking -> `COMPLETED`, chạy commission.
- `RESOLVED_CUSTOMER_WIN`: booking -> `CANCELLED`, không chạy commission, release commission record.
  - Booking `ONLINE` đã paid `SUCCESS`: backend set `paymentStatus = REFUND_PENDING` và tạo refund metadata để admin hoàn tiền thủ công bên ngoài hệ thống.
  - Booking `CASH`: backend cũng set `paymentStatus = REFUND_PENDING`, đồng thời trừ tiền provider để bù hoàn khách. Thứ tự trừ tiền là `walletBalance` trước, thiếu thì trừ tiếp `depositBalance`. Ledger ghi `CASH_REFUND_DEDUCTION` với `balanceType = WALLET|DEPOSIT`.
- `CANCELLED`: hiểu là hủy khiếu nại, booking -> `COMPLETED`, chạy commission.

Luồng admin khép kín:

1. Admin mở `GET /api/admin/disputes?status=PENDING`.
2. Admin mở detail để xem `evidence`, booking, customer, provider, service và payment.
3. Admin resolve:
   - `RESOLVED_PROVIDER_WIN`: booking `COMPLETED`, chạy commission.
   - `RESOLVED_CUSTOMER_WIN`: booking `CANCELLED`, commission release; nếu online đã paid hoặc là booking cash thì `paymentStatus = REFUND_PENDING`.
   - `CANCELLED`: hủy khiếu nại, booking `COMPLETED`, chạy commission.
4. Nếu có `REFUND_PENDING`, admin hoàn tiền thủ công bên ngoài rồi gọi `PATCH /api/admin/refunds/{bookingId}/mark-refunded`.
   - Nếu refund đến từ dispute `RESOLVED_CUSTOMER_WIN`, không được reject refund; admin bắt buộc hoàn tiền thủ công rồi mark-refunded.
   - Với booking `CASH`, tiền đã bị trừ từ provider `walletBalance/depositBalance` lúc resolve dispute; `mark-refunded` chỉ xác nhận admin đã trả tiền cho customer bên ngoài.

### 6.8 Admin finance

```http
GET /api/admin/wallet-transactions
GET /api/admin/providers/{id}/wallet
POST /api/admin/providers/{id}/wallet/adjust
GET /api/admin/bookings/{id}/finance
GET /api/admin/refunds
GET /api/admin/refunds/{bookingId}
PATCH /api/admin/refunds/{bookingId}/mark-refunded
PATCH /api/admin/refunds/{bookingId}/reject
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

Refund v1 là manual refund:

- API list trả các booking `paymentStatus = REFUND_PENDING`.
- Khi booking online đã paid `SUCCESS` bị customer/provider cancel hoặc dispute được xử khách hàng thắng, backend tự set refund metadata.
- Khi booking `CASH` được xử dispute khách hàng thắng, backend tự set refund metadata và trừ tiền provider:
  - Trừ `walletBalance` trước.
  - Nếu ví không đủ, trừ phần còn lại vào `depositBalance`.
  - Ghi ledger `CASH_REFUND_DEDUCTION`.
  - `refundReason`
  - `refundRequestedBy = CUSTOMER|PROVIDER|ADMIN`
  - `refundRequestedAt`
  - `refundAmount`
- Admin hoàn tiền ngoài hệ thống hoặc trên MoMo dashboard.
- Sau đó admin gọi `mark-refunded` để set `paymentStatus = REFUNDED`.
- Nếu từ chối refund, admin gọi `reject`, backend set `paymentStatus = SUCCESS`.
- Cả hai action đều ghi audit log, gửi notification cho customer, và emit `refund:updated`.

Mark refunded body optional:

```json
{
  "refundReference": "MOMO_REFUND_123",
  "refundMethod": "MOMO_MANUAL",
  "refundAmount": 300000,
  "refundEvidenceUrl": "https://res.cloudinary.com/.../refund-proof.jpg",
  "adminNote": "Refunded manually from MoMo dashboard"
}
```

`refundMethod` enum:

```txt
MOMO_MANUAL
BANK_TRANSFER
PROVIDER_BALANCE
OTHER
```

Khi `mark-refunded` thành công, booking được set:

```txt
paymentStatus = REFUNDED
refundResolvedAt = now
refundMethod/refundAmount/refundReference/refundEvidenceUrl/refundAdminNote
```

Reject refund body:

```json
{
  "adminNote": "Refund rejected due to policy"
}
```

Khi reject thành công, booking được set:

```txt
paymentStatus = SUCCESS
refundResolvedAt = now
refundAdminNote = adminNote
```

### 6.9 Admin withdrawals

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
APPROVED -> REJECTED
```

- `POST /api/mobile/provider/withdrawals`: trừ ví ngay và ghi `WITHDRAWAL_HOLD`.
- `PATCH /api/admin/withdrawals/{id}/reject`: hoàn ví nếu request có hold và ghi `WITHDRAWAL_RELEASE`.
- `PATCH /api/admin/withdrawals/{id}/mark-paid`: chỉ xác nhận đã chi trả ngoài hệ thống cho request mới đã hold; request cũ chưa hold sẽ bị trừ ví một lần bằng `WITHDRAWAL_PAYOUT`.

### 6.10 Admin notifications

```http
GET /api/admin/notifications
POST /api/admin/notifications/send
POST /api/admin/notifications/broadcast
```

List filters:

```txt
userId
type
from
to
page
pageSize
```

Send to one user body:

```json
{
  "userId": "<userId>",
  "type": "ADMIN_ANNOUNCEMENT",
  "title": "System maintenance",
  "message": "PetLink will be under maintenance tonight.",
  "data": {
    "screen": "home"
  }
}
```

Broadcast by role body:

```json
{
  "role": "PROVIDER",
  "type": "ADMIN_ANNOUNCEMENT",
  "title": "Provider policy update",
  "message": "Please review the latest provider policy.",
  "data": {
    "screen": "provider_policy"
  }
}
```

Rule:

- Broadcast chỉ gửi tới user `ACTIVE`.
- `role` phải là `CUSTOMER`, `PROVIDER`, hoặc `ADMIN`.
- Mobile user đọc bằng API notification sẵn có: `GET /api/mobile/notifications`.
- Action này ghi audit log.

### 6.11 Admin support chat

Admin token required. Admin có thể tham gia thread chat của booking để hỗ trợ customer/provider.

```http
GET /api/admin/chat/threads
GET /api/admin/bookings/{bookingId}/chat/thread
GET /api/admin/chat/threads/{threadId}/messages
POST /api/admin/chat/threads/{threadId}/messages
PATCH /api/admin/chat/threads/{threadId}/read
```

List filters:

```txt
bookingId
page
pageSize
```

Luồng FE admin gợi ý:

1. Admin mở booking detail hoặc dispute detail.
2. Gọi `GET /api/admin/bookings/{bookingId}/chat/thread` để lấy hoặc tạo thread.
3. Gọi `GET /api/admin/chat/threads/{threadId}/messages` để load messages.
4. Socket admin join room:

```ts
socket.emit("chat:join", { threadId });
```

5. Admin gửi support message:

```http
POST /api/admin/chat/threads/{threadId}/messages
```

Body:

```json
{
  "content": "PetLink support is checking this booking."
}
```

Rule:

- Admin có thể xem mọi booking chat thread.
- Message admin có `senderRole = ADMIN`.
- Customer và provider trong booking đều nhận `chat:message:new` realtime và notification `CHAT_MESSAGE_NEW`.
- Mobile chat API cũ vẫn dùng chung thread, nên customer/provider sẽ thấy message admin trong cùng màn chat booking.

### 6.12 Admin audit logs

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
REFUND_MARK_REFUNDED
REFUND_REJECT
ADMIN_NOTIFICATION_SEND
ADMIN_NOTIFICATION_BROADCAST
SERVICE_HIDE
SERVICE_UNHIDE
SYSTEM_SETTINGS_UPDATE
REVIEW_HIDE
REVIEW_UNHIDE
```

### 6.13 Admin reports

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

Cancelled:

```txt
PENDING -> CANCELLED
CONFIRMED -> CANCELLED
```

No-arrival:

```txt
CONFIRMED -> NO_ARRIVAL
```

Dispute:

```txt
CHECKED_OUT -> DISPUTE
```

Admin resolve:

```txt
DISPUTE + RESOLVED_PROVIDER_WIN -> COMPLETED
DISPUTE + RESOLVED_CUSTOMER_WIN -> CANCELLED
DISPUTE + RESOLVED_CUSTOMER_WIN + ONLINE paid SUCCESS -> CANCELLED + REFUND_PENDING
DISPUTE + RESOLVED_CUSTOMER_WIN + CASH -> CANCELLED + REFUND_PENDING + provider wallet/deposit debit
DISPUTE + CANCELLED -> COMPLETED
```

## 8. Admin Commission Management

Mục đích: màn admin theo dõi hoa hồng và dòng tiền liên quan đến booking trên toàn sàn.
Lưu ý nghiệp vụ quan trọng: `heldAmount` là tiền gross sàn đang giữ từ khách hàng, còn
`commissionAmount` là phần hoa hồng dự kiến/đã thu. Hai số này không được hiểu là một.

Ví dụ booking online 250.000 VND, commission 15%:

```txt
heldAmount = 250000
commissionAmount = 37500
providerEarning = 212500
fundSource = CUSTOMER_ONLINE_PAYMENT
fundStatus = HELD
```

Với booking cash, khách trả trực tiếp cho provider nên sàn không giữ gross:

```txt
heldAmount = 0
commissionAmount = hoa hồng phải thu từ wallet/deposit của provider
fundSource = CUSTOMER_CASH_TO_PROVIDER
fundStatus = NOT_HELD
```

Trạng thái hoa hồng:

```txt
PENDING  = hoa hồng đang giữ cho booking chưa kết thúc
CHARGED  = hoa hồng đã thu khi booking COMPLETED và finance xử lý xong
RELEASED = hoa hồng đã hoàn giữ do booking bị reject/cancel/no-arrival
FAILED   = xử lý hoa hồng lỗi, cần admin kiểm tra
```

Lifecycle backend đang ghi `commission_records`:

```txt
Booking created/confirmed -> commission PENDING
Online payment SUCCESS -> heldAmount = booking totalAmount, fundStatus = HELD
Booking rejected/cancelled/no-arrival -> commission RELEASED
Online cancelled after paid -> fundStatus = REFUND_PENDING, heldAmount vẫn còn cho tới khi admin mark refunded
Admin mark refunded -> heldAmount = 0, fundStatus = REFUNDED
Booking completed + commission processed -> commission CHARGED, heldAmount = 0
Commission processing failed -> commission FAILED
```

### Summary

```http
GET /api/admin/finance/commissions/summary
Authorization: Bearer <admin_accessToken>
```

Response `data`:

```json
{
  "heldAmount": 250000,
  "pendingHeldAmount": 250000,
  "pendingCommissionAmount": 37500,
  "reservedAmount": 250000,
  "chargedAmount": 850000,
  "chargedCommissionAmount": 850000,
  "releasedAmount": 50000,
  "releasedCommissionAmount": 50000,
  "failedAmount": 0,
  "failedCommissionAmount": 0,
  "cashCommissionAmount": 500000,
  "onlineCommissionAmount": 350000
}
```

### List

```http
GET /api/admin/finance/commissions?page=1&pageSize=20&status=PENDING&paymentMethod=ONLINE
Authorization: Bearer <admin_accessToken>
```

Query optional:

```txt
status: PENDING | CHARGED | RELEASED | FAILED
paymentMethod: CASH | ONLINE
providerId: ObjectId
bookingId: ObjectId
from: ISO date
to: ISO date
```

Response `data`:

```json
{
  "items": [
    {
      "id": "66f...",
      "bookingId": "66f...",
      "providerId": "66f...",
      "providerName": "Happy Paws Spa",
      "serviceName": "Grooming",
      "bookingAmount": 250000,
      "heldAmount": 250000,
      "commissionAmount": 37500,
      "providerEarning": 212500,
      "rateLabel": "15%",
      "status": "PENDING",
      "fundSource": "CUSTOMER_ONLINE_PAYMENT",
      "fundStatus": "HELD",
      "paymentMethod": "MOMO",
      "reservedAt": "2026-07-13T10:00:00.000Z",
      "chargedAt": null,
      "releasedAt": null,
      "failedAt": null,
      "collectedFrom": null,
      "failureReason": null,
      "releaseReason": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Pending shortcut

```http
GET /api/admin/finance/commissions/pending?page=1&pageSize=20
Authorization: Bearer <admin_accessToken>
```

Tương đương list với `status=PENDING`, dùng cho bảng "Hoa hồng chờ xử lý".

### Detail

```http
GET /api/admin/finance/commissions/{commissionId}
Authorization: Bearer <admin_accessToken>
```

FE page hiện tại:

```txt
/admin/finance/commission
```

Frontend đã fetch thật qua:

```ts
API_ENDPOINTS.ADMIN.COMMISSION.SUMMARY
API_ENDPOINTS.ADMIN.COMMISSION.RECORDS
API_ENDPOINTS.ADMIN.COMMISSION.PENDING
API_ENDPOINTS.ADMIN.COMMISSION.DETAIL(id)
```

## 9. Error Handling FE Gợi Ý

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

## 10. Quick Test Order Cho FE

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
