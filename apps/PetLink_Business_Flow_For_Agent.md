# PetLink / PetSpaBooking - Business Flow Specification for Coding Agent

> Purpose: This document describes the core business rules and workflows of the PetLink / PetSpaBooking system so an implementation agent can understand and code the backend correctly.

---

## 1. System Overview

PetLink is a pet-care service booking marketplace. The system connects customers with service providers who offer pet-care services such as grooming, bathing, spa, trimming, and related services.

The platform supports:

- Public provider/service browsing for guests.
- Customer booking flow.
- Provider service management.
- Provider verification and deposit requirement.
- Online payment and cash payment.
- Provider wallet and withdrawal request.
- QR check-in/check-out flow.
- Review and rating after completed booking.
- Chat and notification between customer and provider.
- Admin management and reporting.

---

## 2. User Roles

### 2.1 Guest

Guest is an unauthenticated user.

Guest can:

- View public provider list.
- View provider detail.
- View services and transparent pricing.
- Search providers by keyword, service, location, and nearby distance.
- Register or login.

Guest cannot:

- Create booking.
- Review service.
- Chat with provider.
- Access customer/provider/admin features.

---

### 2.2 Customer

Customer is an authenticated user.

Customer can:

- Do everything Guest can do.
- Create booking.
- Choose online payment or cash payment.
- Receive QR code after successful booking.
- Show QR code to provider for check-in and check-out.
- Chat with provider.
- Receive notifications.
- Create dispute within 24 hours after checkout.
- Review provider after booking is completed.

---

### 2.3 Service Provider

Provider is a business/service owner who offers pet-care services.

Provider flow:

1. Register account.
2. Submit business verification documents.
3. Wait for Admin approval.
4. After approval, provider must pay/deposit an initial deposit amount.
5. Provider can start creating services and receiving bookings after verification and deposit requirement are satisfied.

Provider can:

- Manage provider profile.
- Submit verification documents.
- Create, update, hide, or delete services.
- View booking requests.
- Confirm or reject bookings.
- Scan customer QR code for check-in.
- Confirm/scan QR for check-out.
- Chat with customers.
- View wallet balance.
- Create withdrawal request when wallet balance reaches minimum withdrawal amount.
- Receive notifications.

Provider constraints:

- Provider must be verified by Admin before operating.
- Provider must maintain required deposit balance.
- Provider rejection/cancellation is tracked and affects provider cancellation rate.
- For cash bookings, platform commission is deducted from provider wallet first. If wallet is insufficient, deduct from deposit.
- If deposit falls below threshold, provider is warned and may be restricted from receiving new bookings.

---

### 2.4 Admin

Admin has full system management permission.

Admin can:

- Manage users.
- Manage providers.
- Approve or reject provider verification.
- Manage services.
- Manage bookings.
- Manage disputes.
- Manage wallet and withdrawal requests.
- Configure commission/deposit rules if supported.
- View reports and revenue statistics.
- Lock/unlock accounts.
- Hide/remove invalid services.

---

## 3. Main Backend Modules

The backend uses Node.js Express in a modular monolith architecture.

Recommended main modules:

1. **Auth Module**
   - Register/login.
   - JWT access token and refresh token rotation.
   - Google OAuth.
   - Role-based access control.
   - Token blacklist.

2. **Provider Management Module**
   - Provider profile.
   - Provider verification documents.
   - Provider approval/rejection.
   - Provider deposit status.
   - Provider service management.

3. **Booking & QR Module**
   - Booking creation.
   - Booking status transitions.
   - QR generation.
   - QR check-in/check-out.
   - No-arrival handling.
   - 24-hour dispute hold.

4. **Payment & Wallet Module**
   - MoMo/VNPay online payment.
   - Cash payment record.
   - Commission calculation.
   - Provider wallet balance.
   - Provider deposit deduction.
   - Withdrawal request.

5. **Chat & Notification Module**
   - Customer-provider realtime chat using Socket.IO.
   - Store messages in MongoDB.
   - Support text, images, and files.
   - Email/SMS/push/in-app notifications.

6. **Admin & Reporting Module**
   - User/provider management.
   - Booking/dispute management.
   - Withdrawal approval.
   - Revenue and booking reports.

---

## 4. Booking Status Lifecycle

Use the following booking statuses:

```ts
export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CHECKED_IN = "checked-in",
  CHECKED_OUT = "checked-out",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
  DISPUTE = "dispute",
  NO_ARRIVAL = "no-arrival"
}
```

> Note: User originally mentioned `none-arrival`, but `no-arrival` is clearer English. If existing code already uses `none-arrival`, keep it consistent in codebase.

---

## 5. Booking Status Rules

### 5.1 Normal Flow

```text
pending -> confirmed -> checked-in -> checked-out -> completed
```

Meaning:

1. `pending`: Booking is created and waiting for provider/payment confirmation.
2. `confirmed`: Booking is accepted/confirmed.
3. `checked-in`: Customer arrives and provider scans customer's QR code.
4. `checked-out`: Service is finished and provider confirms checkout.
5. `completed`: Booking is finalized after 24 hours without dispute.

---

### 5.2 Cancelled

```text
pending/confirmed -> cancelled
```

Used when customer cancels booking.

Business rule:

- Customer cancellation should be recorded.
- Depending on future policy, cancellation fee may apply.

---

### 5.3 Rejected

```text
pending -> rejected
```

Used when provider rejects booking.

Business rule:

- Provider rejection must be recorded.
- Provider rejection/cancellation rate should be updated.

---

### 5.4 No-arrival

```text
confirmed -> no-arrival
```

Used when customer booked but did not arrive.

Business rule:

- If appointment time has arrived and customer does not check in after 10 minutes, booking may be marked as `no-arrival`.
- This is treated similarly to customer cancellation.

---

### 5.5 Dispute

```text
checked-out -> dispute
```

Used when customer reports fraud/problem within 24 hours after checkout.

Business rule:

- Customer can create dispute only during the 24-hour hold period after checkout.
- Admin reviews dispute.
- If provider wins dispute, booking may continue to `completed`.
- If customer wins dispute, admin may cancel/refund/adjust the booking depending on payment method.

---

### 5.6 Auto-completion After 24 Hours

After booking reaches `checked-out`, the system holds the booking for 24 hours.

If no dispute is created within 24 hours:

```text
checked-out -> completed
```

When booking becomes `completed`:

- System calculates commission.
- Provider wallet/deposit is updated based on payment method.
- Customer becomes eligible to review.

---

## 6. Online Payment Booking Flow

Supported gateways:

- MoMo
- VNPay

Flow:

1. Customer selects provider, service, and booking time.
2. Customer creates booking.
3. Booking is created with status `pending`.
4. Customer selects online payment.
5. Backend creates payment request to MoMo/VNPay.
6. Customer pays through payment gateway.
7. Payment gateway calls backend webhook/callback.
8. If payment succeeds:
   - Payment status becomes `success`.
   - Booking status becomes `confirmed`.
   - System generates QR code for customer.
9. Customer arrives at provider location.
10. Provider scans customer's QR code.
11. Booking status becomes `checked-in`.
12. After service is completed, provider confirms/scans checkout.
13. Booking status becomes `checked-out`.
14. System starts 24-hour dispute window.
15. If no dispute is created after 24 hours:
   - Booking status becomes `completed`.
   - System calculates 15% commission.
   - Provider receives remaining amount in provider wallet.

Commission example:

```text
Order amount: 200,000 VND
Commission: 15% = 30,000 VND
Provider earning: 170,000 VND
```

---

## 7. Cash Payment Booking Flow

Flow:

1. Customer selects provider, service, and booking time.
2. Customer creates booking.
3. Booking is created/confirmed according to provider confirmation rule.
4. Customer arrives at provider location.
5. Provider scans customer's QR code for check-in.
6. Booking status becomes `checked-in`.
7. Provider collects cash directly from customer.
8. After service is completed, provider confirms/scans checkout.
9. Booking status becomes `checked-out`.
10. System starts 24-hour dispute window.
11. If no dispute is created after 24 hours:
    - Booking status becomes `completed`.
    - System calculates 15% commission.
    - Commission is deducted from provider wallet first.
    - If wallet is insufficient, deduct from provider deposit.
12. If provider deposit falls below threshold:
    - Provider receives warning.
    - Provider may be restricted from receiving new bookings until deposit is topped up.

---

## 8. Commission Rule

Default platform commission:

```text
15% of booking total amount
```

Calculation:

```ts
commissionAmount = bookingTotalAmount * 0.15
providerEarning = bookingTotalAmount - commissionAmount
```

For online payment:

```text
Customer pays platform -> platform keeps commission -> remaining amount goes to provider wallet
```

For cash payment:

```text
Customer pays provider directly -> platform deducts commission from provider wallet/deposit
```

Deduction priority for cash payment:

```text
provider wallet first -> provider deposit second
```

---

## 9. Provider Deposit Rule

Provider must pay an initial deposit before receiving bookings.

Deposit is used as a guarantee for platform commission, especially for cash bookings.

Rules:

- Provider must be verified before deposit requirement is activated.
- Provider must maintain deposit above minimum threshold.
- If deposit is below threshold:
  - Send warning notification.
  - Restrict provider from receiving new bookings if needed.
  - Allow provider to top up deposit.

Recommended provider status fields:

```ts
providerStatus: "pending_verification" | "verified" | "rejected" | "suspended";
depositStatus: "not_paid" | "active" | "low_balance" | "restricted";
```

---

## 10. Provider Wallet & Withdrawal Rule

Provider wallet stores provider earning.

Wallet increases when:

- Online payment booking is completed.
- Refund/dispute adjustment favors provider.

Wallet decreases when:

- Cash booking commission is deducted.
- Withdrawal is approved.
- Adjustment/dispute favors customer/platform.

Withdrawal rule:

- Provider can create withdrawal request only if wallet balance is greater than or equal to the minimum withdrawal amount.
- Withdrawal request requires Admin manual approval.
- Admin can approve or reject withdrawal request.
- Withdrawal should not be approved if there are unresolved disputes or suspicious transactions.

Recommended withdrawal statuses:

```ts
export enum WithdrawalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  PAID = "paid"
}
```

---

## 11. QR Check-in / Check-out Rule

QR is used to prove that customer actually arrived and service was performed.

Flow:

1. Booking is confirmed.
2. Backend generates QR code for customer.
3. Customer shows QR code at provider location.
4. Provider scans QR from provider dashboard.
5. Backend validates:
   - Booking exists.
   - Booking belongs to provider.
   - Booking belongs to customer.
   - Booking status allows check-in/check-out.
   - QR is valid and not expired/reused incorrectly.
6. If valid, booking status changes to `checked-in` or `checked-out`.

Recommended QR log fields:

```ts
bookingId: string;
customerId: string;
providerId: string;
action: "check-in" | "check-out";
scannedAt: Date;
scannedBy: string;
metadata?: object;
```

Business value:

- Reduces fake completed bookings.
- Helps verify cash payment bookings.
- Provides evidence for dispute handling.
- Protects platform commission.

---

## 12. Dispute Rule

Customer can create dispute only after checkout and before completion.

Allowed window:

```text
within 24 hours after checked-out
```

Dispute reasons may include:

- Provider did not provide service properly.
- Provider asked customer to avoid platform.
- Provider marked wrong information.
- Payment/cash fraud.
- Other service quality issues.

Admin resolves dispute.

Possible outcomes:

1. Provider wins:
   - Booking becomes `completed`.
   - Wallet/deposit processing continues normally.

2. Customer wins:
   - Booking may be cancelled/refunded/adjusted.
   - Provider may be penalized.
   - Provider cancellation/fraud record may be updated.

---

## 13. Review & Rating Rule

Customer can review provider only when booking status is `completed`.

Rules:

- One booking can have only one review from customer.
- Guest cannot review.
- Customer cannot review cancelled/rejected/dispute bookings unless dispute is resolved as completed.

Review fields:

```ts
bookingId: string;
customerId: string;
providerId: string;
rating: number; // 1-5
comment?: string;
images?: string[];
createdAt: Date;
```

Provider rating should be recalculated after review creation/update.

---

## 14. Public Provider Listing for Guest

API example:

```http
GET /api/v1/public/providers?page=1&limit=10&keyword=spa&lat=10.762622&lng=106.660172&radiusKm=10&sort=nearest
```

Guest response should return public summary only.

Recommended response shape:

```json
{
  "success": true,
  "message": "Providers retrieved successfully",
  "data": {
    "items": [
      {
        "id": "provider_id",
        "slug": "happy-pet-spa",
        "businessName": "Happy Pet Spa",
        "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg",
        "coverImageUrl": "https://res.cloudinary.com/.../cover.jpg",
        "description": "Professional pet grooming and spa service.",
        "isVerified": true,
        "status": "active",
        "location": {
          "address": "123 Nguyen Trai Street",
          "ward": "Ward 1",
          "district": "District 5",
          "province": "Ho Chi Minh City",
          "coordinates": {
            "lat": 10.762622,
            "lng": 106.660172
          },
          "distanceKm": 2.4
        },
        "rating": {
          "average": 4.8,
          "totalReviews": 126
        },
        "services": {
          "total": 6,
          "categories": ["Grooming", "Bathing"],
          "priceRange": {
            "min": 80000,
            "max": 350000,
            "currency": "VND"
          }
        },
        "availability": {
          "isOpenNow": true,
          "todayOpeningHours": {
            "open": "08:00",
            "close": "20:00"
          },
          "nextAvailableDate": "2026-06-23"
        },
        "paymentMethods": {
          "online": true,
          "cash": true
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 57,
      "totalPages": 6,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

Do not expose private provider data to Guest.

Do not return:

- Email/private phone if not intended public.
- Password/token.
- Verification documents.
- Wallet balance.
- Deposit balance.
- Withdrawal requests.
- Bank account.
- Admin notes.
- Internal fraud/cancellation details.

---

## 15. Distance Calculation Rule

`distanceKm` is calculated from:

```text
Customer current location + Provider stored location
```

For provider location, store GeoJSON in MongoDB:

```json
{
  "type": "Point",
  "coordinates": [106.660172, 10.762622]
}
```

Important:

```text
MongoDB GeoJSON order is [lng, lat], not [lat, lng]
```

For list/search:

- Use MongoDB geospatial query.
- Distance may be straight-line distance.

For route/direction:

- Use Google Maps API if needed.
- Actual driving distance can be handled separately.

If user does not allow location permission, do not return `distanceKm` or return `null`.

---

## 16. Chat Rule

Chat is between Customer and Provider.

Rules:

- Use Socket.IO for realtime chat.
- Store messages in MongoDB.
- Support text, image, and file messages.
- Images/files are uploaded to Cloudinary.
- New message should trigger notification.

Recommended message fields:

```ts
conversationId: string;
senderId: string;
receiverId: string;
messageType: "text" | "image" | "file";
content?: string;
fileUrl?: string;
createdAt: Date;
readAt?: Date;
```

---

## 17. Notification Rule

Notification types:

- Booking created.
- Booking confirmed.
- Booking rejected.
- Payment success.
- QR check-in successful.
- QR check-out successful.
- Booking completed.
- Dispute created.
- Provider approved/rejected.
- Withdrawal approved/rejected.
- New message.

Notification channels:

- In-app notification.
- Socket.IO realtime notification.
- Email through SendGrid.
- SMS/OTP through Twilio.
- Mobile push notification through Firebase Cloud Messaging.

---

## 18. Third-party Services

### Google OAuth

Used for social login.

### Google Maps API

Used for:

- Geocoding provider address to coordinates.
- Nearby search support.
- Route/direction if needed.

### MoMo / VNPay

Used for online payment gateway.

Payment callback/webhook must update payment and booking state safely.

### SendGrid

Used for email:

- Verify email.
- OTP if email OTP is supported.
- Booking confirmation.
- Payment receipt.
- Withdrawal/dispute notifications.

### Twilio

Used for SMS/OTP.

### Cloudinary

Used for:

- Provider avatar/cover image.
- Provider verification documents.
- Service images.
- Chat images/files.

### Firebase FCM

Used for mobile push notification.

---

## 19. Important Security Rules

- Password must be hashed using bcrypt.
- JWT access token should be short-lived.
- Refresh token should be rotated.
- Invalidated tokens should be stored in Redis blacklist.
- Role-based access control is required.
- Guest can access only public endpoints.
- Customer cannot access provider/admin APIs.
- Provider cannot access other provider's private data.
- Admin has full management permission.
- Sensitive provider data must not be exposed publicly.
- Payment callback must be verified before updating booking/payment state.
- QR code validation must prevent reuse and wrong-provider scanning.

---

## 20. Redis Usage

Current Redis usage:

- Token blacklist.
- Rate limiting.

Future possible Redis usage:

- OTP cache.
- Temporary booking hold.
- Short-lived QR/session cache.

---

## 21. Deployment Notes

Frontend:

```text
apps/web -> Vercel -> petlink.io.vn
```

Routes:

```text
petlink.io.vn/admin
petlink.io.vn/provider
```

Backend:

```text
Express API -> VPS Ubuntu -> Docker -> api.petlink.io.vn
```

Backend port:

```text
5500
```

Nginx:

- Reverse proxy from `https://api.petlink.io.vn` to backend `localhost:5500`.
- Handles HTTPS using Let's Encrypt.
- Supports WebSocket proxy for Socket.IO.

Local development:

```bash
pnpm i
pnpm docker:dev
pnpm db:sync
pnpm dev
```

Recommended local MongoDB URL:

```env
DATABASE_URL="mongodb://localhost:27018/petspabooking?replicaSet=rs0&directConnection=true"
```

Docker backend MongoDB URL:

```env
DATABASE_URL="mongodb://mongo:27018/petspabooking?replicaSet=rs0"
```

---

## 22. Recommended API Groups

Public:

```text
GET    /api/v1/public/providers
GET    /api/v1/public/providers/:slug
GET    /api/v1/public/providers/:providerId/services
```

Auth:

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/google
```

Customer:

```text
POST   /api/v1/bookings
GET    /api/v1/me/bookings
GET    /api/v1/me/bookings/:id
POST   /api/v1/bookings/:id/disputes
POST   /api/v1/bookings/:id/reviews
```

Provider:

```text
POST   /api/v1/provider/verification
GET    /api/v1/provider/bookings
PATCH  /api/v1/provider/bookings/:id/confirm
PATCH  /api/v1/provider/bookings/:id/reject
POST   /api/v1/provider/bookings/:id/check-in
POST   /api/v1/provider/bookings/:id/check-out
POST   /api/v1/provider/services
PATCH  /api/v1/provider/services/:id
DELETE /api/v1/provider/services/:id
GET    /api/v1/provider/wallet
POST   /api/v1/provider/withdrawals
```

Admin:

```text
GET    /api/v1/admin/users
GET    /api/v1/admin/providers
PATCH  /api/v1/admin/providers/:id/approve
PATCH  /api/v1/admin/providers/:id/reject
GET    /api/v1/admin/bookings
GET    /api/v1/admin/disputes
PATCH  /api/v1/admin/disputes/:id/resolve
GET    /api/v1/admin/withdrawals
PATCH  /api/v1/admin/withdrawals/:id/approve
PATCH  /api/v1/admin/withdrawals/:id/reject
GET    /api/v1/admin/reports/revenue
```

---

## 23. Core Rule Summary

1. Guest can browse providers and services without login.
2. Customer must login to create booking.
3. Provider must be verified by Admin before operating.
4. Provider must maintain deposit to receive bookings.
5. Online payment goes through MoMo/VNPay.
6. Cash payment is paid directly to provider.
7. Cash commission is deducted from provider wallet first, then deposit.
8. QR check-in/check-out is required to prove service execution.
9. After checkout, booking is held for 24 hours.
10. If no dispute after 24 hours, booking becomes completed.
11. Customer can dispute only within the 24-hour hold window.
12. Customer can review only after booking is completed.
13. Withdrawal requires minimum wallet balance and Admin approval.
14. Redis is used for token blacklist and rate limiting.
15. Sensitive provider/payment/wallet data must not be exposed to Guest.
