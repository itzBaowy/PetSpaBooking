# Provider/Admin Domain State Contract

Status: Phase 0 source of truth  
Scope: Provider, Booking, Payment, Wallet, Withdrawal, and Dispute  
Audit date: 2026-07-12

## 1. Purpose and precedence

This document records the target state contracts after auditing the current
frontend, backend, Prisma schema, routes, authorization middleware, and
`feature-mapping.updated.md`.

For phases implemented after this audit, the contracts in this document take
precedence over older status examples in `feature-mapping.updated.md`,
`rules.md`, and `current-state.md`. The current database and backend still use
uppercase string values. Phase 0 does not migrate stored data or change runtime
business logic.

Canonical API/domain values in this document are lowercase `snake_case`.
Legacy uppercase values remain documented in the migration tables.

## 2. Persistence and architecture findings

- MongoDB models use Prisma `String` fields rather than Prisma enums for every
  status audited here. Invalid values can therefore be stored unless a service
  validates them.
- Controllers are thin and delegate directly to services. Services call Prisma
  directly through `connect.prisma.ts`; there is no repository layer for these
  domains.
- API authorization uses `protect` followed by `checkRole(...)`. `protect`
  rejects missing tokens and users with `INACTIVE` or `BANNED` status.
  `checkRole` reloads the user and verifies the persisted role.
- The web API client is the shared Axios instance in `apps/web/lib/axios.ts`.
  It attaches the bearer token and handles refresh, 401, and 403 responses.
- Mobile domain routes are mounted below `/api/mobile`; admin routes are mounted
  below `/api/admin`.

## 3. Canonical state contracts

### 3.1 Booking status

```ts
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "completed"
  | "cancelled"
  | "rejected"
  | "dispute"
  | "no_arrival";
```

| Status        | Meaning                                                                                    | Allowed entry                     | Actor / mechanism            | Required conditions                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------ | --------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pending`     | Booking exists and awaits provider/payment processing.                                     | Initial state                     | Customer/system              | Active service; verified provider; active deposit of at least the configured minimum; valid availability.                                            |
| `confirmed`   | Provider accepted the booking.                                                             | `pending`                         | Provider                     | Booking belongs to provider. Online bookings must still satisfy payment rules before check-in.                                                       |
| `checked_in`  | Customer arrival was verified.                                                             | `confirmed`                       | Provider                     | Valid `CHECK_IN` QR for the same booking/customer/provider; online payment status is successful.                                                     |
| `checked_out` | Service finished and checkout was verified. Starts the dispute hold.                       | `checked_in`                      | Provider                     | Valid `CHECK_OUT` QR for the same booking/customer/provider.                                                                                         |
| `completed`   | Booking finalized; commission processing may run and review becomes available.             | `checked_out`, `dispute`          | Scheduled job or Admin       | Normally 24-hour hold elapsed without an active dispute; Admin may complete after resolving a dispute for provider.                                  |
| `cancelled`   | Customer/provider cancelled an accepted booking, or Admin resolved a dispute for customer. | `pending`, `confirmed`, `dispute` | Customer, Provider, or Admin | Customer: only pending/confirmed. Provider: currently only confirmed. Persist `cancelReason`; actor attribution is currently missing from the model. |
| `rejected`    | Provider declined a request before acceptance.                                             | `pending`                         | Provider                     | Booking belongs to provider; persist `rejectReason`.                                                                                                 |
| `dispute`     | Booking is held for Admin dispute resolution.                                              | `checked_out`                     | Customer                     | Within configured dispute window; one dispute per booking. Current backend does not support provider-created disputes.                               |
| `no_arrival`  | Provider reported that customer did not arrive.                                            | `confirmed`                       | Provider                     | Appointment start plus configured grace period elapsed; customer has not checked in.                                                                 |

#### Valid booking transitions

```text
pending -> confirmed -> checked_in -> checked_out -> completed
pending -> cancelled
confirmed -> cancelled
pending -> rejected
confirmed -> no_arrival
checked_out -> dispute -> completed
checked_out -> dispute -> cancelled
```

There is no canonical `checked-in`, `checked-out`, `none_arrival`,
`none-arrival`, `no-show`, `no_show`, `BOOKED`, `IN_SERVICE`,
`COMMISSION_CHARGED`, or `FAILED_APPROVED` booking state.

Commission processing is a finance side effect of `completed`, not an extra
booking status. Actor-specific cancellation should be represented by explicit
metadata in a later schema phase rather than multiplying booking states.

#### Booking endpoints and services

| Actor    | Endpoint                                                        | Service operation                                                                               |
| -------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Customer | `POST /api/mobile/bookings`                                     | `mobileBookingService.create`                                                                   |
| Customer | `PATCH /api/mobile/bookings/:id/cancel`                         | `cancelMyBooking`                                                                               |
| Customer | `GET /api/mobile/me/bookings/:id/qr?action=CHECK_IN\|CHECK_OUT` | `getMyBookingQr`                                                                                |
| Customer | `POST /api/mobile/bookings/:id/disputes`                        | `createDispute`                                                                                 |
| Provider | `PATCH /api/mobile/provider/bookings/:id/confirm`               | `confirm`                                                                                       |
| Provider | `PATCH /api/mobile/provider/bookings/:id/reject`                | `reject`                                                                                        |
| Provider | `PATCH /api/mobile/provider/bookings/:id/cancel`                | `cancelProviderBooking`                                                                         |
| Provider | `PATCH /api/mobile/provider/bookings/:id/no-arrival`            | `markNoArrival`                                                                                 |
| Provider | `POST /api/mobile/provider/bookings/:id/check-in`               | `checkIn`                                                                                       |
| Provider | `POST /api/mobile/provider/bookings/:id/check-out`              | `checkOut`                                                                                      |
| System   | Scheduled job, no public endpoint                               | `autoCompleteCheckedOutBookings` -> `bookingFinanceService.completeBookingAndProcessCommission` |
| Admin    | `GET /api/admin/bookings`, `GET /api/admin/bookings/:id`        | Read-only `adminBookingService` operations                                                      |

The admin backend currently has no generic booking-status mutation endpoint,
although the frontend mock code calls `/admin/bookings/:id/status`.

### 3.2 Provider verification status

```ts
export type ProviderVerificationStatus =
  | "pending_verification"
  | "verified"
  | "rejected"
  | "suspended";
```

| Status                 | Meaning                                                 | Actor / transition                                                                           | Conditions                                                               |
| ---------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `pending_verification` | Application awaits review.                              | System on provider registration; Admin may return rejected provider to a future review flow. | Provider profile exists.                                                 |
| `verified`             | Provider may operate subject to deposit rules.          | Admin: `pending_verification` or `rejected` -> `verified`                                    | Required documents must be approved.                                     |
| `rejected`             | Application was rejected.                               | Admin: non-verified application -> `rejected`                                                | Rejection reason/admin note required by UI; backend stores note.         |
| `suspended`            | Previously verified provider is blocked from operating. | Admin: `verified` -> `suspended`; user suspension can also force it                          | Provider must currently be verified for the dedicated suspend operation. |

Relevant endpoints are `GET /api/admin/providers`,
`PATCH /api/admin/providers/:id/verify`, `.../reject`, and `.../suspend`.
The older `/api/providers/:id/approve|reject|suspend` constants in the web app
do not match the mounted admin routes.

Provider document review has a separate contract:

```ts
export type ProviderDocumentStatus = "pending" | "approved" | "rejected";
```

Admin document endpoints are
`PATCH /api/admin/provider-documents/:documentId/approve` and
`PATCH /api/admin/provider-documents/:documentId/reject`.

### 3.3 Deposit status

```ts
export type DepositStatus =
  | "not_paid"
  | "active"
  | "low_balance"
  | "restricted";
```

| Status        | Meaning                                                                   | Transition / actor                                    | Current enforcement                                                                |
| ------------- | ------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `not_paid`    | Initial deposit has not been funded.                                      | Default on provider creation.                         | Service and booking operations are blocked.                                        |
| `active`      | Deposit meets the operating threshold.                                    | Admin adjustment/top-up or later payment integration. | Backend requires `ACTIVE` and at least 300,000 VND for service/booking operations. |
| `low_balance` | Deposit is below the minimum after deduction/adjustment.                  | Finance service or Admin adjustment.                  | Provider cannot pass current booking/service deposit checks.                       |
| `restricted`  | Explicit operational restriction due to insufficient guarantee or policy. | Admin/system policy.                                  | Declared by Swagger/frontend/docs but never assigned by current backend.           |

The current schema stores `depositBalance` and `walletBalance` directly on the
provider. There is no provider top-up endpoint. Only Admin can adjust a wallet
or deposit via `POST /api/admin/providers/:id/wallet/adjust`.

### 3.4 Payment method and payment status

```ts
export type PaymentMethod = "cash" | "online";

export type BookingPaymentStatus =
  | "unpaid"
  | "pending"
  | "success"
  | "failed"
  | "refund_pending"
  | "refunded"
  | "cancelled";

export type PaymentTransactionStatus = "pending" | "success" | "failed";
```

| State            | Meaning / transition                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `unpaid`         | Initial cash booking state.                                                               |
| `pending`        | Online payment is awaiting gateway result.                                                |
| `success`        | Verified gateway result succeeded. Required before online check-in.                       |
| `failed`         | Gateway creation or callback failed.                                                      |
| `refund_pending` | A successfully paid booking was cancelled and requires refund processing.                 |
| `refunded`       | Refund completed. Declared in Admin filters, but no refund processor currently writes it. |
| `cancelled`      | Pending payment was cancelled with its booking.                                           |

MoMo transaction records use only `pending`, `success`, and `failed`; booking
payment status has the wider lifecycle above. `POST
/api/mobile/payments/momo/ipn` is public by design and must rely on signature
verification in `momo-payment.service.ts`, not role middleware.

### 3.5 Wallet and ledger contract

Wallet and deposit do not have a lifecycle status beyond `DepositStatus`.
Their source of truth is the provider balances plus immutable
`wallet_transactions` entries.

Canonical transaction types currently implemented by backend:

```ts
export type WalletTransactionType =
  | "online_earning"
  | "cash_commission_deduction"
  | "deposit_commission_deduction"
  | "manual_adjustment"
  | "withdrawal_payout";

export type BalanceType = "wallet" | "deposit";
```

Rules currently enforced:

- Online completed booking: credit provider earning to wallet.
- Cash completed booking: deduct commission from wallet first, then deposit.
- Deposit deduction/adjustment recalculates `active` versus `low_balance`.
- Every implemented balance mutation writes a ledger transaction with an
  idempotency key. Manual adjustment records an audit log.
- Withdrawal does not reserve funds at request/approval time; wallet is debited
  atomically only when Admin marks the request paid.

Provider endpoints are `GET /api/mobile/provider/wallet` and
`GET /api/mobile/provider/wallet/transactions`. Admin endpoints are
`GET /api/admin/wallet-transactions`, `GET
/api/admin/providers/:id/wallet`, `POST
/api/admin/providers/:id/wallet/adjust`, and `GET
/api/admin/bookings/:id/finance`.

The ledger taxonomy in `feature-mapping.updated.md` (`topup`,
`reserve_commission`, `release_reserve`, `charge_commission`, `debt_offset`,
`payout`, `admin_adjustment`) describes a different balance model and is not
implemented by the current backend.

### 3.6 Withdrawal status

```ts
export type WithdrawalStatus = "pending" | "approved" | "rejected" | "paid";
```

```text
pending -> approved -> paid
pending -> rejected
```

| Transition              | Actor    | Conditions                                                                                                      |
| ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| create -> `pending`     | Provider | Verified provider; amount >= 100,000 VND; sufficient wallet balance; complete bank account; no pending dispute. |
| `pending` -> `approved` | Admin    | Request is still pending. No balance debit yet.                                                                 |
| `pending` -> `rejected` | Admin    | Request is still pending; `adminNote` is required.                                                              |
| `approved` -> `paid`    | Admin    | Wallet still covers amount; debit and `withdrawal_payout` ledger entry occur atomically.                        |

Provider endpoints: `POST/GET /api/mobile/provider/withdrawals`. Admin
endpoints: `GET /api/admin/withdrawals`, `GET
/api/admin/withdrawals/:id`, and PATCH actions `approve`, `reject`,
`mark-paid`.

### 3.7 Dispute status

```ts
export type DisputeStatus =
  | "pending"
  | "resolved_provider_win"
  | "resolved_customer_win"
  | "cancelled";
```

```text
pending -> resolved_provider_win
pending -> resolved_customer_win
pending -> cancelled
```

| Transition                           | Actor    | Booking effect                                              | Conditions                                                                                                                            |
| ------------------------------------ | -------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| create -> `pending`                  | Customer | `checked_out` -> `dispute`                                  | Within dispute window; no existing dispute.                                                                                           |
| `pending` -> `resolved_provider_win` | Admin    | `dispute` -> `completed`; process commission                | Booking must still be in dispute.                                                                                                     |
| `pending` -> `resolved_customer_win` | Admin    | `dispute` -> `cancelled`; no commission in v1               | Booking must still be in dispute.                                                                                                     |
| `pending` -> `cancelled`             | Admin    | `dispute` -> `completed`; current code processes commission | Current behavior treats cancellation of the dispute as provider-favorable. Rename should be considered later because it is ambiguous. |

Admin endpoints are `GET /api/admin/disputes`, `GET
/api/admin/disputes/:id`, and `PATCH /api/admin/disputes/:id/resolve`.

## 4. Legacy-to-canonical mapping

### 4.1 Booking

| Legacy value                                                                                         | Canonical value | Notes                                                                                                               |
| ---------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------- |
| `PENDING`, `pending`, `BOOKED`                                                                       | `pending`       | `BOOKED` appears only in older docs/mock design.                                                                    |
| `CONFIRMED`, `confirmed`                                                                             | `confirmed`     | Direct mapping.                                                                                                     |
| `CHECKED_IN`, `checked-in`, `checked_in`                                                             | `checked_in`    | Hyphenated value is documentation-only.                                                                             |
| `CHECKED_OUT`, `checked-out`, `checked_out`                                                          | `checked_out`   | Direct normalization.                                                                                               |
| `IN_PROGRESS`, `IN_SERVICE`                                                                          | `checked_in`    | No separate in-service state in the target 9-state lifecycle. Preserve operational timestamps separately if needed. |
| `COMPLETED`, `COMMISSION_CHARGED`                                                                    | `completed`     | Commission is finance metadata, not booking state.                                                                  |
| `CANCELLED`, `CANCELLED_BY_CUSTOMER`, `CANCELLED_BY_PROVIDER`                                        | `cancelled`     | Preserve actor/reason in explicit cancellation metadata before migration.                                           |
| `REJECTED`                                                                                           | `rejected`      | Provider rejection remains distinct from post-confirmation cancellation.                                            |
| `DISPUTE`, `DISPUTED`                                                                                | `dispute`       | Direct normalization.                                                                                               |
| `NO_ARRIVAL`, `NONE_ARRIVAL`, `none-arrival`, `no-arrival`, `NO_SHOW_REPORTED`, `no-show`, `no_show` | `no_arrival`    | `NONE_ARRIVAL` is a frontend typo.                                                                                  |
| `FAILED_APPROVED`                                                                                    | `cancelled`     | Preserve Admin resolution metadata; no direct backend value exists.                                                 |

### 4.2 Other domains

| Domain                | Legacy values                                                                                                                   | Canonical values                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provider verification | `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`, `SUSPENDED`; lowercase UI variants                                              | `pending_verification`, `verified`, `rejected`, `suspended`                                                                                                      |
| Provider document     | `PENDING`, `APPROVED`, `REJECTED`; `info_requested` in unused frontend type                                                     | `pending`, `approved`, `rejected` (`info_requested` requires a future business decision)                                                                         |
| Deposit               | `NOT_PAID`, `ACTIVE`, `LOW_BALANCE`, `RESTRICTED`                                                                               | `not_paid`, `active`, `low_balance`, `restricted`                                                                                                                |
| Withdrawal            | `PENDING`, `APPROVED`, `REJECTED`, `PAID`                                                                                       | `pending`, `approved`, `rejected`, `paid`                                                                                                                        |
| Dispute               | backend `PENDING`, `RESOLVED_PROVIDER_WIN`, `RESOLVED_CUSTOMER_WIN`, `CANCELLED`; frontend mock `OPEN`, `REVIEWING`, `RESOLVED` | backend values normalized to lowercase; `OPEN` -> `pending`; `REVIEWING` has no backend equivalent; generic `RESOLVED` must be expanded using resolution outcome |
| Booking payment       | backend `UNPAID`, `PENDING`, `SUCCESS`, `FAILED`, `REFUND_PENDING`, `REFUNDED`, `CANCELLED`; frontend `PAID`                    | lowercase backend set; frontend `PAID` -> `success`                                                                                                              |
| Payment transaction   | `PENDING`, `SUCCESS`, `FAILED`                                                                                                  | `pending`, `success`, `failed`                                                                                                                                   |

Migration must be performed in a later phase with a data audit before type
constraints are introduced. Values that lose information (`CANCELLED_BY_*`,
generic `RESOLVED`) must first copy actor/outcome metadata to dedicated fields.

## 5. Concrete conflicts found

### 5.1 Code versus `feature-mapping.updated.md`

1. Feature mapping declares `BOOKED`, `IN_SERVICE`, `COMMISSION_CHARGED`,
   actor-specific cancellations, `NO_SHOW_REPORTED`, `DISPUTED`, and
   `FAILED_APPROVED`. Backend services and Prisma data use `PENDING`, no
   `IN_SERVICE`, `COMPLETED`, generic `CANCELLED`, `REJECTED`, `NO_ARRIVAL`,
   and `DISPUTE`.
2. Feature mapping explicitly says not to use `PENDING`, `CANCELLED`, or
   `REJECTED`, while those values are validated and written by current backend.
3. Feature mapping reserves cash commission at confirmation and models
   available/reserved/debt balances. Backend has only `walletBalance` and
   `depositBalance`, and deducts commission after completion.
4. Feature mapping lists ledger types `TOPUP`, `RESERVE_COMMISSION`,
   `RELEASE_RESERVE`, `CHARGE_COMMISSION`, `PAYOUT`, `DEBT_OFFSET`, and
   `ADMIN_ADJUSTMENT`. Backend implements a different five-value ledger set.
5. Feature mapping includes provider-created dispute evidence after check-in.
   Backend only allows a customer to create a dispute from `CHECKED_OUT`.
6. Feature mapping defines a provider deposit/top-up page and endpoint behavior.
   Backend exposes balances but has no provider top-up endpoint.
7. Feature mapping lists check-in scanner, OTP confirmation, no-show evidence,
   and dispute evidence components. Current provider web pages are placeholders;
   QR operations exist only in the mobile backend routes and OTP is not
   implemented.

### 5.2 Frontend versus backend

1. Shared and Admin booking schemas use typo `NONE_ARRIVAL`; backend accepts
   only `NO_ARRIVAL`.
2. Provider booking mutation schema uses lowercase `confirmed`, `completed`,
   and `cancelled`, but backend provider actions use uppercase values and
   dedicated action endpoints. It also permits direct completion, which backend
   does not.
3. Frontend payment method is `CASH | MOMO | VNPAY`; backend booking method is
   `CASH | ONLINE`, with MoMo stored separately as payment provider.
4. Frontend payment status is `UNPAID | PAID | FAILED | REFUNDED`; backend uses
   `SUCCESS` instead of `PAID` and also writes `PENDING`, `REFUND_PENDING`, and
   `CANCELLED`.
5. Admin dispute mock types (`OPEN | REVIEWING | RESOLVED`) do not match backend
   resolution statuses.
6. Admin booking frontend calls status override, no-show review, and alternate
   dispute endpoints that do not exist in the current admin routers.
7. Some Admin finance UI still uses mock balance and ledger contracts with
   queries disabled, while real backend finance endpoints return a different
   shape and taxonomy.
8. `depositStatus` and provider-document `status` are typed as unrestricted
   strings in provider frontend schemas despite known backend values.

### 5.3 Backend internal gaps

1. Prisma status fields are unrestricted strings; enum validation is duplicated
   across services and Swagger.
2. Admin booking filter omits backend-written payment statuses
   `REFUND_PENDING` and `CANCELLED`.
3. Withdrawal status filter in the provider service accepts any query string,
   whereas Admin validates the four-value enum.
4. `restricted` deposit status is declared but never produced; low balance is
   the only computed non-active state.
5. Provider withdrawal checks wallet sufficiency at request time but does not
   reserve funds. Multiple approved requests can exceed the balance; final
   atomic debit protects the balance only at `paid` transition.
6. Generic booking `cancelled` does not record the cancelling actor.
7. Dispute resolution value `cancelled` means the dispute was cancelled but the
   booking becomes completed and commission is processed, which is semantically
   easy to misread.

## 6. Required follow-up sequence

1. Add shared backend constants/types for canonical statuses and boundary
   adapters for legacy uppercase records.
2. Add cancellation actor and any required dispute outcome metadata before
   collapsing old actor-specific/mock values.
3. Write and test a data migration for stored status strings.
4. Update backend validation, Swagger, frontend schemas, labels, and filters in
   one coordinated phase per domain.
5. Reconcile the wallet model before implementing reserve/debt/top-up behavior;
   do not expose mock finance success responses.
6. Add contract and transition tests before enabling currently mocked provider
   and Admin pages.

Until those phases are complete, runtime code must send the existing uppercase
values expected by backend services. New documentation and designs should use
the canonical lowercase values from this file.
