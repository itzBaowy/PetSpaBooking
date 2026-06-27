# IMPLEMENTATION STATUS

## Feature: A-06 Provider Balance & Deposit Management

Role: Admin
Status: Done

Files created:
- apis/admin/finance/schema.ts
- apis/admin/finance/queries.ts
- apis/admin/finance/components/finance-ledger-page.tsx
- apis/admin/finance/components/provider-balance-page.tsx
- apis/admin/finance/components/provider-balance-table.tsx
- apis/admin/finance/components/provider-ledger-detail.tsx
- apis/admin/finance/components/ledger-transaction-table.tsx
- apis/admin/finance/components/balance-adjustment-form.tsx
- apis/admin/finance/components/debt-management-table.tsx
- apis/admin/finance/components/trust-score-detail.tsx
- apis/admin/finance/components/status-pill.tsx
- apis/admin/finance/components/finance-format.ts
- app/(dashboard)/admin/finance/ledger/page.tsx
- app/(dashboard)/admin/providers/[providerId]/balance/page.tsx
- types/ledger.ts
- constants/ledger-types.ts
- constants/trust-score.ts

Files modified:
- app/(dashboard)/layout.tsx
- constants/api-endpoints.ts
- constants/query-keys.ts
- types/provider.ts
- apis/admin/users/queries.ts
- apis/admin/users/components/provider-detail.tsx

Components reused:
- PageHeader
- StatisticCard / StatisticCardGrid
- DataTable
- SearchInput
- CustomSelect
- ActionMenu

API endpoints used:
- GET /admin/finance/balances
- GET /admin/finance/ledger
- GET /admin/providers/:providerId/balance
- GET /admin/finance/debts
- POST /admin/finance/adjustments
- POST /admin/finance/debts

Query keys used:
- ["admin", "finance", "balances"]
- ["admin", "finance", "ledger"]
- ["admin", "finance", "provider-balance", providerId]
- ["admin", "finance", "debts"]

Types added or reused:
- ProviderBalance
- ProviderTrustScore
- TrustRiskLevel
- LedgerTransaction
- LedgerTransactionType

Libraries used:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios via lib/axios.ts
- TanStack React Query
- Zod

Notes:
- Mock UI only. Query hooks use initialData and enabled: false.
- Admin balance adjustment validates ledger type ADMIN_ADJUSTMENT and requires admin_id + reason.
- Provider detail now shows balance overview, trust score metrics, violation history, and link to provider balance.

Known issues:
- Backend endpoints are mocked and not integrated yet.

Next steps:
- Connect real ledger and provider balance APIs.
- Add optimistic query invalidation once backend contracts are available.

## Feature: A-07 Commission Management

Role: Admin
Status: Done

Files created:
- apis/admin/commission/schema.ts
- apis/admin/commission/queries.ts
- apis/admin/commission/components/commission-management-page.tsx
- apis/admin/commission/components/commission-config-page.tsx
- apis/admin/commission/components/commission-summary-cards.tsx
- apis/admin/commission/components/commission-table.tsx
- apis/admin/commission/components/pending-commission-table.tsx
- apis/admin/commission/components/commission-config-form.tsx
- apis/admin/commission/components/commission-rate-table.tsx
- apis/admin/commission/components/commission-status-pill.tsx
- apis/admin/commission/components/commission-format.ts
- app/(dashboard)/admin/finance/commission/page.tsx
- app/(dashboard)/admin/finance/commission/config/page.tsx
- types/commission.ts
- constants/commission.ts

Files modified:
- app/(dashboard)/layout.tsx
- constants/api-endpoints.ts
- constants/query-keys.ts

Components reused:
- PageHeader
- StatisticCard / StatisticCardGrid
- DataTable
- SearchInput
- CustomSelect
- ActionMenu

API endpoints used:
- GET /admin/finance/commission
- GET /admin/finance/commission/pending
- GET /admin/finance/commission/config
- POST /admin/finance/commission/config
- POST /admin/finance/commission/config/:configId

Query keys used:
- ["admin", "commission", "summary"]
- ["admin", "commission", "records"]
- ["admin", "commission", "pending"]
- ["admin", "commission", "configs"]

Types added or reused:
- Commission
- CommissionStatus
- CommissionType
- CommissionScope
- CommissionConfig

Libraries used:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios via lib/axios.ts
- TanStack React Query
- Zod

Notes:
- Commission config UI explicitly says changes apply only to new bookings.
- Commission status PENDING is used only for commission reserve state, not booking status.

Known issues:
- Backend endpoints are mocked and not integrated yet.

Next steps:
- Connect commission record/config APIs and add permission checks for config mutation.

## Feature: A-01 to A-05 Admin Extensions

Role: Admin
Status: Done

Files created:
- apis/admin/bookings/components/booking-status-override-dialog.tsx
- apis/admin/bookings/components/no-show-resolution-dialog.tsx
- apis/admin/bookings/components/no-show-review-table.tsx
- app/(dashboard)/admin/bookings/no-show/page.tsx
- apis/admin/analytics/components/commission-revenue-chart.tsx
- apis/admin/analytics/components/provider-risk-overview-card.tsx

Files modified:
- types/booking.ts
- constants/booking-status.ts
- apis/admin/bookings/schema.ts
- apis/admin/bookings/queries.ts
- apis/admin/bookings/components/system-booking-table.tsx
- apis/admin/bookings/components/dispute-resolution-form.tsx
- apis/admin/analytics/queries.ts
- app/(dashboard)/admin/page.tsx
- apis/admin/users/queries.ts
- apis/admin/users/components/provider-detail.tsx

Components reused:
- PageHeader
- StatisticCard / StatisticCardGrid
- DataTable
- SearchInput
- CustomSelect
- ActionMenu
- Pagination

API endpoints used:
- GET /admin/bookings
- GET /admin/bookings/disputes
- GET /admin/bookings/no-show
- POST /admin/bookings/no-show/resolve
- PATCH /admin/bookings/:bookingId/status
- GET /admin/analytics/commission-revenue
- GET /admin/analytics/provider-risk

Query keys used:
- ["admin", "bookings", "list"]
- ["admin", "bookings", "disputes"]
- ["admin", "bookings", "no-shows"]
- ["analytics", "commission-revenue"]
- ["analytics", "provider-risk"]

Types added or reused:
- BookingStatus
- AdminBookingStatus
- NoShowReview
- NoShowResolutionData
- BookingStatusOverrideData
- ProviderBalance
- ProviderTrustScore

Libraries used:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios via lib/axios.ts
- TanStack React Query
- Zod

Notes:
- Booking flow now uses allowed SRS booking statuses: BOOKED, CONFIRMED, CHECKED_IN, IN_SERVICE, COMPLETED, COMMISSION_CHARGED, CANCELLED_BY_CUSTOMER, CANCELLED_BY_PROVIDER, NO_SHOW_REPORTED, DISPUTED, FAILED_APPROVED.
- A-03 was checked: Moderation and Reports still share apis/admin/moderation; report resolution requires action + reason.
- Admin dashboard composes analytics components and now includes commission revenue trend + provider risk overview.
- No features/ folder was created or kept.
- No @/features, SWR, React Hook Form, or zodResolver imports were found in the checked app/apis/components/hooks/stores/lib/constants/types/providers paths.

Known issues:
- pnpm.cmd --filter web lint still fails on pre-existing issues outside this change: auth forgot-password unescaped quote, provider query any types, filter-store any types, and unused vars in verification/error/permission files.

Next steps:
- Clean existing lint debt outside admin finance/commission scope.
- Integrate backend endpoints when API contracts are available.

## COMPLETED

### Admin

- Dashboard Layout
- Sidebar Navigation
- Header Navigation
- Dashboard Overview
- User Management (A-01)
- Provider Management (A-01 extension)
- Provider Verification (A-02)
- Moderation & Content Reports (A-03) — cả 2 sub-view cùng feature `apis/admin/moderation/`
- Booking Monitoring & Dispute Resolution (A-04)
- Analytics Dashboard (A-05)
- Marketing & Banner Management (A-08)
- Audit Logs
- Admin hydration/layout polish
- Fixed collapsible dashboard sidebar
- Custom rounded select UI for admin filters and forms
- Custom debounced search UI for provider verification

Files created:

- apis/admin/bookings/components/dispute-resolution-workspace.tsx
- apis/admin/audit-logs/schema.ts
- apis/admin/audit-logs/queries.ts
- apis/admin/audit-logs/components/audit-log-table.tsx
- app/(dashboard)/admin/audit-logs/page.tsx

Files modified:

- app/(dashboard)/admin/moderation/page.tsx
- app/(dashboard)/admin/moderation/services/page.tsx
- app/(dashboard)/admin/moderation/reports/page.tsx
- app/(dashboard)/admin/bookings/page.tsx
- app/(dashboard)/admin/bookings/disputes/page.tsx
- app/(dashboard)/admin/page.tsx
- app/(dashboard)/layout.tsx
- components/ui/custom-select.tsx
- components/ui/search-input.tsx
- app/layout.tsx
- providers/auth-provider.tsx
- apis/admin/moderation/schema.ts
- apis/admin/moderation/queries.ts
- apis/admin/moderation/components/moderation-table.tsx
- apis/admin/moderation/components/report-table.tsx
- apis/admin/bookings/schema.ts
- apis/admin/bookings/queries.ts
- apis/admin/bookings/components/system-booking-table.tsx
- apis/admin/bookings/components/dispute-table.tsx
- apis/admin/bookings/components/dispute-resolution-form.tsx
- apis/admin/audit-logs/components/audit-log-table.tsx
- apis/admin/verification/components/verification-table.tsx
- apis/admin/moderation/components/report-resolution-dialog.tsx

Libraries used:

- Next.js, React, TypeScript, Tailwind CSS, Axios (lib/axios.ts), TanStack React Query, Zod

Notes:

- Mock UI only. Query hooks use `initialData` and `enabled: false`.
- Admin booking mock flow now uses the SRS booking status set.
- Dispute resolution UI includes audit log note input.
- Moderation và Reports là 2 sub-view cùng feature `apis/admin/moderation/` — đúng convention.
- Sidebar includes: Dashboard, Users, Providers, Bookings, Verification, Moderation, Reports, Marketing, Audit Logs.

Known issues:

- `pnpm.cmd --filter web lint` vẫn fail trên pre-existing issues ngoài scope.

---

## NOT STARTED

### Provider

- SP-06: Revenue Dashboard
- SP-07: Chat System / Notifications
- SP-08: Deposit & Balance Management (MỚI — `apis/provider/deposit/`)

### Pet Owner

- Toàn bộ PO features chưa bắt đầu

---

## BOOKING STATUS MIGRATION NOTE

Khi refactor từ mock sang backend thực, cần thay thế:

| Old (mock) | New (SRS) |
|---|---|
| `PENDING` | `BOOKED` |
| `IN_PROGRESS` | `IN_SERVICE` |
| `CANCELLED` | `CANCELLED_BY_CUSTOMER` hoặc `CANCELLED_BY_PROVIDER` |

Thêm mới:
- `CHECKED_IN`
- `COMMISSION_CHARGED`
- `NO_SHOW_REPORTED`
- `DISPUTED`
- `FAILED_APPROVED`

---

## Feature: Admin UI Vietnamese Localization

Role: Admin
Status: Done

Files created:
- None

Files modified:
- app/(dashboard)/layout.tsx
- app/(dashboard)/admin/page.tsx
- app/(dashboard)/admin/verification/page.tsx
- app/(dashboard)/admin/verification/[verificationId]/page.tsx
- components/layout/dashboard-topbar.tsx
- constants/booking-status.ts
- constants/commission.ts
- constants/ledger-types.ts
- constants/trust-score.ts
- apis/admin/analytics/components/*
- apis/admin/audit-logs/components/audit-log-table.tsx
- apis/admin/bookings/components/*
- apis/admin/commission/components/*
- apis/admin/finance/components/*
- apis/admin/marketing/components/marketing-management.tsx
- apis/admin/moderation/components/*
- apis/admin/users/components/*
- apis/admin/verification/components/*

Components reused:
- PageHeader
- StatisticCard / StatisticCardGrid
- DataTable
- SearchInput
- CustomSelect
- Pagination
- ActionMenu

API endpoints used:
- Mock UI only; existing query hooks remain unchanged.

Query keys used:
- Existing admin query keys only.

Types added or reused:
- Reused existing admin booking, finance, commission, ledger, provider, moderation, user, and verification types.

Libraries used:
- Next.js, React, TypeScript, Tailwind CSS, TanStack React Query, Zod

Notes:
- Refactored user-facing Admin UI text to Vietnamese across sidebar, topbar, dashboard, analytics, booking, moderation, reports, verification, users, providers, finance, commission, marketing, and audit log screens.
- Kept route paths, enum values, schemas, and domain identifiers unchanged.
- Fixed display labels for booking status, ledger types, commission status, trust risk levels, dispute status, debt status, and payment status.

Known issues:
- Older notes above contain some mojibake text from previous file writes; this update only appended the new localization state.

Next steps:
- Optional pass for provider/pet-owner UI localization if the product scope requires full Vietnamese across all roles.

## Feature: Provider Account Registration & Business Verification Onboarding

Role: Auth / Provider
Status: Done

Files created:
- apis/auth/components/auth-visual-shell.tsx
- apis/auth/components/provider-verification-form.tsx
- app/(auth)/provider-verification/page.tsx

Files modified:
- app/(auth)/login/page.tsx
- app/(auth)/register-provider/page.tsx
- apis/auth/components/login-form.tsx
- apis/auth/components/register-provider-form.tsx
- docs/current-state.md

Components reused:
- Next.js Image and Link
- Existing PetLink design tokens from app/globals.css
- Existing brand photography from public/brand

API endpoints used:
- None. Mock UI only.

Query keys used:
- None.

Types added or reused:
- None.

Libraries used:
- Next.js, React, TypeScript, Tailwind CSS

Notes:
- Provider registration creates only the login account in the mock flow.
- After registration, the user is sent to login with `next=/provider-verification`.
- Business verification is a three-step authenticated onboarding mock: shop information, legal documents, and review/submit.
- No verification or authentication API was added or called.

Known issues:
- Authentication and submitted form data are not persisted because backend contracts are not available.

Next steps:
- Connect provider session/route guard and verification submission API when backend contracts are ready.

### Provider verification onboarding follow-up

- Added an unverified-account callout to the provider dashboard linking to `/provider-verification`.
- Verification form data is now controlled and preserved while moving forward/backward between steps.
- Review step displays the values entered by the provider.
- Reused the shared controlled `CustomSelect` for service and business type fields.
- Added shadcn-style shared `Button`, `Input`, and `Textarea` primitives under `components/ui` and reused them in auth/onboarding forms.
- No backend API was introduced; verification state remains mocked.
- Provider registration now includes password confirmation and blocks submission when passwords do not match.
- Login and registration reuse a shared `PasswordInput` with accessible eye/eye-off visibility icons.

## Feature: Admin SRS Finance & Booking Alignment

Role: Admin
Status: Done

Files created:
- apis/admin/finance/components/withdrawal-management-page.tsx
- apis/admin/finance/components/deposit-config-page.tsx
- app/(dashboard)/admin/finance/withdrawals/page.tsx
- app/(dashboard)/admin/finance/deposit-config/page.tsx

Files modified:
- apis/admin/bookings/schema.ts
- apis/admin/bookings/queries.ts
- apis/admin/bookings/components/system-booking-table.tsx
- apis/admin/bookings/components/booking-status-override-dialog.tsx
- apis/admin/finance/schema.ts
- apis/admin/finance/queries.ts
- components/layout/nav-items.tsx

API endpoints used:
- None. Mock UI only.

Notes:
- Admin booking monitoring now uses the SRS lifecycle: PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, COMPLETED, CANCELLED, REJECTED, DISPUTE, NONE_ARRIVAL.
- Added mock approval/rejection workflow for provider withdrawal requests.
- Added mock configuration for minimum deposit and warning/restriction thresholds.
- Changes are scoped to Admin and do not alter Provider/Customer operations.
- Localized audit-log actor roles, action filters, mock names/notes, and pagination labels to Vietnamese; audit-log filters now work against mock data.

## Feature: Auth Provider Verification FE Refactor

Role: Auth / Provider
Status: Done

Files created:
- apis/auth/hooks/use-provider-registration-draft.ts
- apis/auth/hooks/use-identity-ocr.ts

Files modified:
- apis/auth/components/provider-verification-form.tsx
- apis/auth/queries.ts
- apis/banks/queries.ts
- apis/provider/verification/queries.ts
- app/(auth)/login/page.tsx
- constants/api-endpoints.ts
- constants/query-keys.ts

Components reused:
- Button
- Input
- PasswordInput
- CustomSelect

API endpoints used:
- POST /auth/register
- GET /auth/get-info
- GET /banks
- GET /providers/me
- POST /providers/register
- GET /providers/me/documents
- POST /providers/me/documents

Query keys used:
- ["auth", "me"]
- ["banks", "list"]
- ["providerVerification", "me"]
- ["providerVerification", "documents"]

Notes:
- Provider verification form now keeps feature-specific server calls in `apis/**/queries.ts` and routes them through `lib/axios.ts`.
- Endpoint strings and query keys were moved into shared constants instead of being hardcoded in feature queries.
- Registration draft persistence and CCCD OCR are now feature custom hooks, keeping the form component focused on UI flow.
- The provider registration flow still stays under `app/(auth)` pages as routing-only composition.

## Feature: Admin User Management API Integration

Role: Admin
Status: Done

Files created:
- apis/admin/users/components/user-form-dialog.tsx
- apis/admin/users/components/user-format.tsx
- apis/admin/users/hooks/use-admin-user-list.ts
- apis/admin/users/hooks/use-admin-user-detail.ts
- apis/admin/users/hooks/use-admin-user-form.ts
- apis/admin/users/user-helpers.ts

Files modified:
- apis/admin/users/schema.ts
- apis/admin/users/queries.ts
- apis/admin/users/components/user-table.tsx
- apis/admin/users/components/user-detail.tsx
- constants/api-endpoints.ts
- constants/query-keys.ts
- lib/date.ts

Components reused:
- PageHeader
- StatisticCard / StatisticCardGrid
- DataTable
- SearchInput
- CustomSelect
- Pagination
- ActionMenu
- Button / Input

API endpoints used:
- GET /users?page=&pageSize=&filters=&role=&status=
- GET /users/:id
- POST /users
- PUT /users/:id
- DELETE /users/:id
- PATCH /users/:id/role

Query keys used:
- ["admin", "users", "list", params]
- ["admin", "users", "detail", userId]

Notes:
- Admin user list now uses the backend `/users` contract instead of mock `/admin/users`.
- List supports backend pagination, `filters` JSON search by `userName`, role filter, and status filter.
- Added "Thêm người dùng" action in the page header; create/edit use the same dialog.
- Delete action maps to BE soft delete, which sets user status to `INACTIVE`.
- Provider management mock in `apis/admin/users` remains available for existing provider admin screens.
- Refactored list/detail/form logic into feature custom hooks.
- Moved user display helpers and select options into `apis/admin/users/user-helpers.ts`.
- Moved reusable Vietnamese date formatting into `lib/date.ts`.

## Feature: Admin Provider Management API Integration

Role: Admin
Status: Done

Files created:
- apis/admin/providers/schema.ts
- apis/admin/providers/queries.ts
- apis/admin/providers/provider-helpers.ts
- apis/admin/providers/hooks/use-admin-provider-list.ts
- apis/admin/providers/hooks/use-admin-provider-detail.ts
- apis/admin/providers/components/provider-management.tsx
- apis/admin/providers/components/provider-detail.tsx
- apis/admin/providers/components/provider-status-badge.tsx

Files modified:
- app/(dashboard)/admin/providers/page.tsx
- app/(dashboard)/admin/providers/[providerId]/page.tsx
- app/(dashboard)/admin/verification/page.tsx
- app/(dashboard)/admin/verification/[verificationId]/page.tsx
- constants/api-endpoints.ts
- constants/query-keys.ts

API endpoints used:
- GET /providers?page=&pageSize=&filters=&providerStatus=
- GET /providers/:id
- PATCH /providers/:id/approve
- PATCH /providers/:id/reject
- PATCH /providers/:id/suspend

Notes:
- Admin provider management and provider verification now share the same backend `/providers` admin API.
- Verification page defaults to `PENDING_VERIFICATION` while provider management allows all provider statuses.
- Provider detail now loads documents from `GET /providers/:id` and uses real approve/reject/suspend mutations.
