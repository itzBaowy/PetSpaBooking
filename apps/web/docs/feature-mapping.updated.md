# FEATURE MAPPING

## ROLE CONVENTION

Application roles:

- `GUEST`: User is not logged in. This role is handled by route guards and public routes, not stored as an account role.
- `PET_OWNER`: Logged-in pet owner who manages pets, bookings, payments, reviews, notifications, and health records.
- `SERVICE_PROVIDER`: Logged-in business/provider account that manages business profile, services, pricing, bookings, customers, revenue, and communication.
- `ADMIN`: System administrator who manages users, provider verification, moderation, booking disputes, analytics, and platform promotions.

Do not use `USER` as a business role. Use `PET_OWNER` instead.

Provider business types such as Clinic, Spa, Grooming, and Pet Hotel are provider categories, not roles.

Example:

```ts
role: "SERVICE_PROVIDER"
providerType: "CLINIC" | "SPA" | "GROOMING" | "PET_HOTEL"
```

---

## AUTH

Route Group:

(auth)

Routes:

- login
- forgot-password
- reset-password
- register-provider

Feature:

features/auth

Components:

- login-form
- forgot-password-form
- register-provider-form

Notes:

- Auth contains shared authentication flows.
- Pet Owner registration can be added here if required by scope.
- Provider registration belongs here because it starts before provider dashboard access.

---

## PUBLIC / GUEST

Routes:

- /
- /about
- /providers
- /services

Feature:

features/public

Components:

- public-provider-list
- public-service-list
- public-search-bar
- public-review-section
- login-required-dialog

Rules:

- Guest can view public pages, providers, services, prices, blogs, and reviews.
- Guest cannot book, chat, write reviews, or create pet profiles.
- If Guest tries a protected action, show a login/register prompt.

---

## PET OWNER

### PO-01 Account Profile

Route:

pet-owner/profile

Feature:

features/pet-owner/profile

Components:

- pet-owner-profile-form
- avatar-upload
- change-password-form

---

### PO-02 Pet Management

Routes:

pet-owner/pets
pet-owner/pets/[petId]

Feature:

features/pet-owner/pets

Components:

- pet-card-list
- pet-form
- pet-detail
- pet-medical-note-badge

Rules:

- Pet date of birth cannot be in the future.
- Pet weight must be greater than 0.
- Pets with allergy or chronic-condition notes should show a warning badge.

---

### PO-03 Service Discovery

Routes:

pet-owner/discovery
pet-owner/providers/[providerId]
pet-owner/services/[serviceId]

Feature:

features/pet-owner/discovery

Components:

- service-search-filter
- provider-card-list
- service-card-list
- provider-detail
- service-detail

Rules:

- Filter by location, distance, service type, price range, and rating.
- Service categories include Clinic, Vaccination, Spa, Grooming, Pet Hotel, Training, and Home Care.

---

### PO-04 Bookings

Routes:

pet-owner/bookings
pet-owner/bookings/create
pet-owner/bookings/[bookingId]

Feature:

features/pet-owner/bookings

Components:

- booking-stepper
- pet-selection-step
- service-selection-step
- time-slot-selection-step
- booking-confirmation
- pet-owner-booking-table
- pet-owner-booking-detail
- reschedule-booking-form
- cancel-booking-dialog

Workflow:

PENDING
→ CONFIRMED
→ IN_PROGRESS
→ COMPLETED

Alternative:

PENDING
→ CANCELLED

CONFIRMED
→ CANCELLED

Rules:

- Pet Owner can cancel only when booking status is `PENDING` or `CONFIRMED`.
- Cancellation must happen at least 2 hours before the appointment time.
- Cancellation requires a reason.
- Reschedule returns the booking to `PENDING` for provider approval.

---

### PO-05 Payments

Routes:

pet-owner/payments
pet-owner/payments/[paymentId]
pet-owner/invoices/[invoiceId]

Feature:

features/pet-owner/payments

Components:

- payment-method-selector
- invoice-detail
- transaction-history-table
- payment-status-badge

Payment Methods:

- `CASH`
- `ONLINE_MOMO`

Payment Status:

- `UNPAID`
- `PAID`
- `FAILED`
- `REFUNDED`

Notes:

- For demo scope, payment may stay inside booking flow.
- Create a separate payments feature only if invoices and transaction history are implemented.

---

### PO-06 Reviews

Routes:

pet-owner/reviews
pet-owner/bookings/[bookingId]/review

Feature:

features/pet-owner/reviews

Components:

- review-form
- review-image-upload
- pet-owner-review-list

Rules:

- Review is enabled only when booking status is `COMPLETED`.
- Each booking can be reviewed only once.
- Rating is from 1 to 5 stars.
- Review can include up to 3 images.

---

### PO-07 Notifications

Route:

pet-owner/notifications

Feature:

features/pet-owner/notifications

Components:

- notification-list
- notification-item
- notification-preferences-form

Notification Types:

- Appointment reminder
- Booking confirmed / changed / cancelled
- Platform promotion

---

### PO-08 Health Records

Routes:

pet-owner/health-records
pet-owner/pets/[petId]/health-records

Feature:

features/pet-owner/health-records

Components:

- health-record-timeline
- health-record-form
- prescription-detail
- vaccination-history

Rules:

- Health records can be created manually by Pet Owner.
- Health records can be synced automatically when booking status becomes `COMPLETED`.

---

## PROVIDER

### SP-01 Business Profile

Route:

provider/business-profile

Feature:

features/provider/business-profile

Components:

- business-profile-form
- business-hours-form
- business-gallery

---

### SP-02 Services

Routes:

provider/services
provider/services/create
provider/services/[serviceId]/edit

Feature:

features/provider/services

Components:

- service-form
- service-table
- service-action-menu
- service-category-select

Rules:

- Provider can create, update, delete, enable, or disable services.
- Service category belongs to service metadata, not user role.

---

### SP-03 Pricing

Routes:

provider/pricing
provider/pricing/promotions
provider/pricing/combos

Feature:

features/provider/pricing

Components:

- price-list-table
- promotion-form
- combo-form

---

### SP-04 Bookings

Routes:

provider/bookings
provider/bookings/[bookingId]

Feature:

features/provider/bookings

Components:

- booking-table
- booking-calendar
- booking-detail
- booking-status-actions

Workflow:

PENDING
→ CONFIRMED
→ IN_PROGRESS
→ COMPLETED

Alternative:

PENDING
→ CANCELLED

CONFIRMED
→ CANCELLED

Rules:

- Provider confirms a `PENDING` booking by changing it to `CONFIRMED`.
- Provider rejects a booking by changing it to `CANCELLED`.
- Do not create a separate `REJECTED` booking status.
- Rejection/cancellation must store:
  - `cancelledBy: "SERVICE_PROVIDER"`
  - `cancelReason: string`

---

### SP-05 Customers

Routes:

provider/customers
provider/customers/[customerId]

Feature:

features/provider/customers

Components:

- customer-table
- customer-detail
- pet-list
- service-history

---

### SP-06 Revenue

Route:

provider/revenue

Feature:

features/provider/revenue

Components:

- revenue-summary-cards
- revenue-chart
- popular-service-chart
- cancellation-rate-card

Rules:

- Revenue dashboard should show loading, empty, and error states.
- Show warning when cancellation rate is greater than 15%.

---

### SP-07 Communication

Routes:

provider/communication/chat
provider/communication/notifications
provider/communication/reviews

Feature:

features/provider/communication

Components:

- chat-window
- message-list
- notification-form
- review-reply-box

---

## ADMIN

### A-01 Users

Routes:

admin/users
admin/users/[userId]
admin/providers
admin/providers/[providerId]

Feature:

features/admin/users

Components:

- user-table
- user-detail
- user-status-actions

Rules:

- Admin can ban or unban Pet Owner and Service Provider accounts.
- Ban action must include reason and duration if temporary.

---

### A-02 Provider Verification

Routes:

admin/verification
admin/verification/[verificationId]

Feature:

features/admin/verification

Components:

- verification-table
- provider-document-viewer
- verification-actions

---

### A-03 Moderation

Routes:

admin/moderation
admin/moderation/services
admin/moderation/reports

Feature:

features/admin/moderation

Components:

- moderation-table
- report-table
- report-resolution-dialog

---

### A-04 Booking Monitoring & Disputes

Routes:

admin/bookings
admin/bookings/disputes

Feature:

features/admin/bookings

Components:

- system-booking-table
- dispute-table
- dispute-resolution-form

Rules:

- Admin can monitor all platform bookings.
- Admin can resolve disputes between Pet Owner and Service Provider.
- Dispute resolution can result in refund, close complaint, or manual status correction.
- Dispute actions should be recorded in audit log.

---

### A-05 Analytics

Route:

admin/analytics

Feature:

features/admin/analytics

Components:

- platform-summary-cards
- booking-analytics-chart
- platform-revenue-chart
- top-services-table
- top-providers-table

Notes:

- Admin Dashboard Overview does not need a separate `features/admin/dashboard` folder.
- `app/(dashboard)/admin/page.tsx` should compose existing analytics components.

---

### A-06 Platform Promotions

Routes:

admin/promotions
admin/promotions/banners
admin/promotions/coupons

Feature:

features/admin/promotions

Components:

- banner-table
- banner-form
- coupon-table
- coupon-form
- flash-sale-form

Scope Rule:

- If platform promotion is not implemented in the current phase, mark this feature as `OUT_OF_SCOPE_NOW` instead of creating incomplete files.

---

## GLOBAL BOOKING STATUS RULE

Use only these booking statuses:

- `PENDING`
- `CONFIRMED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

Do not use `REJECTED` as a booking status.

If a provider rejects a booking, save it as:

```ts
status: "CANCELLED"
cancelledBy: "SERVICE_PROVIDER"
cancelReason: string
```

If a pet owner cancels a booking, save it as:

```ts
status: "CANCELLED"
cancelledBy: "PET_OWNER"
cancelReason: string
```

If an admin cancels or manually resolves a booking, save it as:

```ts
status: "CANCELLED"
cancelledBy: "ADMIN"
cancelReason: string
```
