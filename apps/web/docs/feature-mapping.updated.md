# FEATURE MAPPING

## ROLE CONVENTION

Application roles:

- `GUEST`: User is not logged in. This role is handled by route guards and public routes, not stored as an account role.
- `PET_OWNER`: Logged-in pet owner who manages pets, bookings, payments, reviews, notifications, and health records.
- `SERVICE_PROVIDER`: Logged-in business/provider account that manages business profile, services, pricing, bookings, customers, revenue, and communication.
- `ADMIN`: System administrator who manages users, provider verification, moderation, booking disputes, analytics, provider balance, commission, and platform promotions.

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

apis/auth

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

apis/public

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

apis/pet-owner/profile

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

apis/pet-owner/pets

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

apis/pet-owner/discovery

Components:

- service-search-filter
- provider-card-list
- service-card-list
- provider-detail
- service-detail

Rules:

- Filter by location, distance, service type, price range, and rating.
- Service categories include Clinic, Vaccination, Spa, Grooming, Pet Hotel, Training, and Home Care.
- If provider's Available Balance is insufficient for cash payment, do NOT show cash payment option for that provider.

---

### PO-04 Bookings

Routes:

pet-owner/bookings
pet-owner/bookings/create
pet-owner/bookings/[bookingId]

Feature:

apis/pet-owner/bookings

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
- qr-code-display
- otp-display
- no-show-response-dialog

Workflow (Cash Payment):

BOOKED
→ CONFIRMED (commission reserved)
→ CHECKED_IN (QR/OTP verified)
→ IN_SERVICE
→ COMPLETED (commission charged)

Workflow (Online Payment):

BOOKED
→ CONFIRMED
→ CHECKED_IN
→ IN_SERVICE
→ COMPLETED

Alternative (Cancellation):

BOOKED → CANCELLED_BY_CUSTOMER
CONFIRMED → CANCELLED_BY_CUSTOMER
CONFIRMED → CANCELLED_BY_PROVIDER

Alternative (No-show / Dispute):

CONFIRMED → NO_SHOW_REPORTED → DISPUTED → FAILED_APPROVED
CHECKED_IN → DISPUTED (provider cannot self-fail after check-in)

Rules:

- Pet Owner can cancel only when booking status is `BOOKED` or `CONFIRMED`.
- Cancellation must happen at least 2 hours before the appointment time.
- Cancellation requires a reason.
- Reschedule returns the booking to `BOOKED` for provider approval.
- When payment method is `CASH`, show QR code / OTP for check-in at the provider location.
- Pet Owner can respond to `NO_SHOW_REPORTED` within a defined time window (e.g. X hours).
- If Pet Owner does not respond to no-show report, booking may auto-resolve after the time window.

---

### PO-05 Payments

Routes:

pet-owner/payments
pet-owner/payments/[paymentId]
pet-owner/invoices/[invoiceId]

Feature:

apis/pet-owner/payments

Components:

- payment-method-selector
- invoice-detail
- transaction-history-table
- payment-status-badge
- cash-payment-notice

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
- If provider's Available Balance is insufficient, the `CASH` option must be hidden for that provider in the booking flow.
- Show a notice to Pet Owner when selecting CASH explaining the check-in process (QR/OTP required).

---

### PO-06 Reviews

Routes:

pet-owner/reviews
pet-owner/bookings/[bookingId]/review

Feature:

apis/pet-owner/reviews

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

apis/pet-owner/notifications

Components:

- notification-list
- notification-item
- notification-preferences-form

Notification Types:

- Appointment reminder
- Booking confirmed / changed / cancelled
- No-show reported — prompt Pet Owner to respond
- Platform promotion

---

### PO-08 Health Records

Routes:

pet-owner/health-records
pet-owner/pets/[petId]/health-records

Feature:

apis/pet-owner/health-records

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

apis/provider/business-profile

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

apis/provider/services

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

apis/provider/pricing

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

apis/provider/bookings

Components:

- booking-table
- booking-calendar
- booking-detail
- booking-status-actions
- check-in-scanner
- otp-confirm-dialog
- no-show-report-form
- dispute-evidence-form

Workflow (Cash Payment):

BOOKED
→ CONFIRMED (system reserves commission on provider balance)
→ CHECKED_IN (provider scans QR or enters OTP from customer)
→ IN_SERVICE
→ COMPLETED (system charges reserved commission)

Workflow (Online Payment):

BOOKED
→ CONFIRMED
→ CHECKED_IN
→ IN_SERVICE
→ COMPLETED

Alternative (Cancellation):

BOOKED → CANCELLED_BY_PROVIDER
CONFIRMED → CANCELLED_BY_PROVIDER

Alternative (No-show):

CONFIRMED → NO_SHOW_REPORTED (only if customer has NOT checked in)

Alternative (Dispute after check-in):

CHECKED_IN → DISPUTED (provider must submit evidence; cannot self-fail)

Rules:

- Provider confirms a `BOOKED` booking by changing it to `CONFIRMED`.
- Provider rejects a booking by changing it to `CANCELLED_BY_PROVIDER` with `cancelReason`.
- Do not create a separate `REJECTED` booking status.
- After `CHECKED_IN`, provider cannot change status to failed directly.
- Provider can only report no-show if customer has NOT checked in.
- No-show report must be submitted within the valid time window after appointment time.
- If customer has checked in and an issue arises, provider must open a dispute with evidence.
- Dispute actions are recorded in audit log.
- Cash booking commission is reserved when status changes to `CONFIRMED`.
- Cash booking commission is charged when status changes to `COMPLETED`.
- If cash booking is cancelled or no-show is approved, reserved commission is released.

---

### SP-05 Customers

Routes:

provider/customers
provider/customers/[customerId]

Feature:

apis/provider/customers

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

apis/provider/revenue

Components:

- revenue-summary-cards
- revenue-chart
- popular-service-chart
- cancellation-rate-card
- balance-overview-card
- commission-history-table

Rules:

- Revenue dashboard should show loading, empty, and error states.
- Show warning when cancellation rate is greater than 15%.
- Show current Available Balance, Reserved Balance, and Debt Balance.
- Show warning when Available Balance is below the safety threshold.
- Show commission history from ledger.

---

### SP-07 Communication

Routes:

provider/communication/chat
provider/communication/notifications
provider/communication/reviews

Feature:

apis/provider/communication

Components:

- chat-window
- message-list
- notification-form
- review-reply-box

---

### SP-08 Deposit & Balance

Route:

provider/deposit

Feature:

apis/provider/deposit

Components:

- balance-summary-card
- topup-form
- ledger-transaction-table
- balance-status-badge

Balance Fields:

- `availableBalance`: balance provider can use for cash booking eligibility
- `reservedBalance`: amount temporarily held for pending cash bookings
- `debtBalance`: amount provider owes the platform

Rules:

- Provider can top up their deposit balance.
- Show warning when `availableBalance` is below the warning threshold.
- Show error / restriction notice when `availableBalance` is below required commission for new cash booking.
- If `debtBalance > 0`, show debt notice and explain that debt will be offset from future online payouts.
- Ledger table shows all transactions: `TOPUP`, `RESERVE_COMMISSION`, `RELEASE_RESERVE`, `CHARGE_COMMISSION`, `DEBT_OFFSET`, `PAYOUT`.

---

## ADMIN

### A-01 Users & Provider Management

Routes:

admin/users
admin/users/[userId]
admin/providers
admin/providers/[providerId]

Feature:

apis/admin/users

Components:

- user-table
- user-detail
- user-status-actions
- provider-table
- provider-detail
- provider-trust-score-card
- provider-balance-overview-card
- ban-unban-dialog

Rules:

- Admin can ban or unban Pet Owner and Service Provider accounts.
- Ban action must include reason and duration (temporary or permanent).
- Provider detail must show Trust Score metrics: completion rate, no-show rate, dispute rate, cash booking abnormality.
- Provider detail must show balance overview: Available Balance, Reserved Balance, Debt Balance.
- Admin can view violation history of each account.

---

### A-02 Provider Verification

Routes:

admin/verification
admin/verification/[verificationId]

Feature:

apis/admin/verification

Components:

- verification-table
- provider-document-viewer
- verification-actions

Rules:

- Admin reviews business registration documents submitted by new providers.
- Admin can approve or reject a verification request with a reason.
- Rejected providers must resubmit documents.

---

### A-03 Service Moderation

Routes:

admin/moderation
admin/moderation/services
admin/moderation/reports

Feature:

apis/admin/moderation

Components:

- moderation-table
- report-table
- report-resolution-dialog

Rules:

- Admin moderates service listings posted by providers.
- Admin handles reports submitted by users about low-quality services or providers.
- Report resolution must include action taken and reason.

---

### A-04 Booking Monitoring & Disputes

Routes:

admin/bookings
admin/bookings/disputes
admin/bookings/no-show

Feature:

apis/admin/bookings

Components:

- system-booking-table
- dispute-table
- dispute-resolution-form
- no-show-review-table
- no-show-resolution-dialog
- booking-status-override-dialog

Booking Status Filter:

Admin can filter bookings by all statuses:
`BOOKED` | `CONFIRMED` | `CHECKED_IN` | `IN_SERVICE` | `COMPLETED` |
`COMMISSION_CHARGED` | `CANCELLED_BY_CUSTOMER` | `CANCELLED_BY_PROVIDER` |
`NO_SHOW_REPORTED` | `DISPUTED` | `FAILED_APPROVED`

Rules:

- Admin can monitor all platform bookings across all statuses.
- Admin can resolve disputes between Pet Owner and Service Provider.
- Dispute resolution outcomes: refund, close complaint, or manual status override.
- Admin reviews `NO_SHOW_REPORTED` bookings where customer has responded with contradiction.
- Admin can approve or reject no-show report, which triggers commission release or charge accordingly.
- Admin can override booking status manually in exceptional cases.
- All admin dispute and no-show actions must be recorded in audit log.
- After admin resolves dispute or no-show, system updates provider Trust Score accordingly.

---

### A-05 Analytics Dashboard

Route:

admin/analytics

Feature:

apis/admin/analytics

Components:

- platform-summary-cards
- booking-analytics-chart
- platform-revenue-chart
- top-services-table
- top-providers-table
- commission-revenue-chart
- provider-risk-overview-card

Notes:

- Admin Dashboard Overview (`app/(dashboard)/admin/page.tsx`) composes components from `apis/admin/analytics/components`.
- Do not create a separate `apis/admin/dashboard` folder.
- Analytics should include commission revenue trend (from cash and online bookings).
- Include a provider risk overview: number of providers at warning / restricted / suspended level.

---

### A-06 Provider Balance & Deposit Management

Routes:

admin/providers/[providerId]/balance
admin/finance/ledger

Feature:

apis/admin/finance

Components:

- provider-balance-table
- provider-ledger-detail
- balance-adjustment-form
- debt-management-table
- ledger-transaction-table
- trust-score-detail

Balance Fields visible to Admin:

- `availableBalance`
- `reservedBalance`
- `debtBalance`
- `totalDeposited`
- `totalCommissionCharged`
- `safetyBuffer`

Rules:

- Admin can view balance details of all providers.
- Admin can manually adjust balance with a reason (e.g. dispute resolution, correction).
- Admin can view full ledger transaction history per provider.
- Admin can manage overdue debt: mark as resolved, force offset, or escalate.
- Admin can view and update the safety buffer threshold per provider or globally.
- All balance adjustments by admin must be recorded in ledger with `type: ADMIN_ADJUSTMENT`.

---

### A-07 Commission Management

Routes:

admin/finance/commission
admin/finance/commission/config

Feature:

apis/admin/commission

Components:

- commission-summary-cards
- commission-table
- pending-commission-table
- commission-config-form
- commission-rate-table

Commission Types:

- `PERCENTAGE`: percentage of booking value
- `FIXED`: fixed amount per booking

Rules:

- Admin can view all commission records across the platform.
- Admin can filter by status: `PENDING` (reserved), `CHARGED`, `RELEASED`, `FAILED`.
- Admin can configure commission rate globally or per provider type.
- Admin can view pending commission (reserved but not yet charged).
- Commission config changes apply to new bookings only, not existing ones.

---

### A-08 Platform Promotions

Routes:

admin/promotions
admin/promotions/banners
admin/promotions/coupons

Feature:

apis/admin/promotions

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

```ts
type BookingStatus =
  | "BOOKED"                  // Customer just created the booking
  | "CONFIRMED"               // Provider accepted; commission reserved if cash
  | "CHECKED_IN"              // Customer verified via QR or OTP at provider location
  | "IN_SERVICE"              // Service is in progress (can be merged with CHECKED_IN in MVP)
  | "COMPLETED"               // Service completed; commission charged if cash
  | "COMMISSION_CHARGED"      // Commission deducted from provider balance (ledger recorded)
  | "CANCELLED_BY_CUSTOMER"   // Customer cancelled before service
  | "CANCELLED_BY_PROVIDER"   // Provider rejected or cancelled
  | "NO_SHOW_REPORTED"        // Provider reported customer did not arrive (only before CHECKED_IN)
  | "DISPUTED"                // Active dispute; funds and status held pending admin resolution
  | "FAILED_APPROVED"         // Admin approved the failure after review
```

Do not use `PENDING` as a booking status. Use `BOOKED` instead.
Do not use `IN_PROGRESS` as a booking status. Use `IN_SERVICE` instead.
Do not use `CANCELLED` as a generic status. Use `CANCELLED_BY_CUSTOMER` or `CANCELLED_BY_PROVIDER` instead.
Do not use `REJECTED` as a booking status.

---

## CANCELLATION RULES

If a customer cancels:

```ts
status: "CANCELLED_BY_CUSTOMER"
cancelledBy: "PET_OWNER"
cancelReason: string
```

If a provider rejects or cancels:

```ts
status: "CANCELLED_BY_PROVIDER"
cancelledBy: "SERVICE_PROVIDER"
cancelReason: string
```

If admin cancels or manually resolves:

```ts
status: "CANCELLED_BY_PROVIDER" | "FAILED_APPROVED"
cancelledBy: "ADMIN"
cancelReason: string
```

---

## COMMISSION FLOW RULE (CASH BOOKING)

```
BOOKED
  → CONFIRMED        : system calls reserveCommission(provider, estimatedCommission)
  → CHECKED_IN       : no balance change
  → IN_SERVICE       : no balance change
  → COMPLETED        : system calls chargeReservedCommission(provider, booking)
  → COMMISSION_CHARGED: ledger entry recorded

CANCELLED_BY_CUSTOMER / CANCELLED_BY_PROVIDER / FAILED_APPROVED / NO_SHOW approved:
  → system calls releaseReserve(provider, booking)
```

---

## PROVIDER BALANCE RULE

```ts
interface ProviderBalance {
  availableBalance: number    // Can be used; must cover commission + safetyBuffer
  reservedBalance: number     // Temporarily held for pending cash bookings
  debtBalance: number         // Amount owed to platform
  safetyBuffer: number        // Minimum buffer required (adjusted by trust score)
}
```

Rule:

```
canAcceptCashBooking = availableBalance >= estimatedCommission + safetyBuffer
                    && providerStatus === "ACTIVE"
```

If `canAcceptCashBooking` is false:
- Hide `CASH` payment option in booking flow for this provider.
- Show warning on provider's balance dashboard.

---

## TRUST SCORE RULE

Trust score is calculated from:

| Metric | Description |
|---|---|
| `completionRate` | Ratio of completed bookings |
| `noShowReportRate` | Ratio of bookings provider reported as no-show |
| `lateFailCancelRate` | Ratio of late cancellations or fails |
| `disputeRate` | Ratio of bookings that became disputes |
| `customerContradictionRate` | Ratio of no-show reports contradicted by customer |
| `cashAbnormalityRate` | Cash booking completion rate vs online booking completion rate |

Risk levels:

| Level | Action |
|---|---|
| Low risk | Warning notification only |
| Medium risk | Increase safetyBuffer, require higher minimum balance |
| High risk | Block cash bookings, online only |
| Critical | Suspend account, block new bookings |

---

## LEDGER TRANSACTION TYPES

```ts
type LedgerTransactionType =
  | "TOPUP"                // Provider topped up deposit
  | "RESERVE_COMMISSION"   // Commission reserved for cash booking
  | "RELEASE_RESERVE"      // Reserve released due to cancellation or approved no-show
  | "CHARGE_COMMISSION"    // Commission charged after booking completed
  | "PAYOUT"               // Platform paid out earnings to provider
  | "DEBT_OFFSET"          // Debt automatically offset from payout
  | "ADMIN_ADJUSTMENT"     // Manual balance adjustment by admin
```