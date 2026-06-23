# PROJECT RULES

## 1. General Principles

* Always follow the existing folder structure.
* Do not create a `features/` folder.
* This project currently uses `apis/` as the feature module folder.
* Never create duplicate components if a reusable component already exists.
* Reuse existing code before creating new code.
* Before creating any file, search the existing structure first.
* Do not move existing mock feature files out of `apis/` unless explicitly requested.
* Do not create new top-level folders unless explicitly requested.
* Use only libraries that already exist in `package.json`.

---

## 2. Current Tech Stack

This project uses:

```txt
Next.js 16
React 19
TypeScript
Tailwind CSS v4
Axios
TanStack React Query
Zod
Zustand
typescript-cookie
ESLint
```

Important package rules:

```txt
Use TanStack React Query for server state.
Use Axios for HTTP requests.
Use Zod for validation.
Use Zustand for global client state.
Use typescript-cookie for cookie handling if needed.
Do not use SWR.
Do not use React Hook Form unless it is installed.
Do not use @hookform/resolvers unless it is installed.
Do not add new libraries unless explicitly requested.
```

Current `package.json` does not include:

```txt
swr
react-hook-form
@hookform/resolvers
```

Therefore:

```txt
SWR hooks are forbidden.
React Hook Form is forbidden unless the dependency is added first.
zodResolver is forbidden unless @hookform/resolvers is added first.
```

---

## 3. Current Project Structure

```txt
petlink-web/
├── app/
├── apis/
├── components/
├── lib/
├── stores/
├── hooks/
├── constants/
├── types/
├── providers/
└── public/
```

Folder responsibilities:

```txt
app/          = Next.js routes, pages, layouts only
apis/         = feature modules: components, queries, schema
components/   = shared reusable components only
lib/          = infrastructure, axios, auth, RBAC, utilities
stores/       = global client state only
hooks/        = shared reusable hooks
constants/    = shared constants
types/        = shared TypeScript types
providers/    = global app providers
public/       = static assets
```

---

## 4. App Router Rules

Use `app/` only for routing.

Allowed files in `app/`:

```txt
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx
```

Rules:

* `page.tsx` must only compose components.
* Do not put business logic inside `page.tsx`.
* Do not call API directly inside `page.tsx`.
* Do not put validation logic inside `page.tsx`.
* Do not put large UI blocks directly inside `page.tsx`.
* Import feature components from `apis/`.
* Import shared layout components from `components/layout`.

Correct example:

```tsx
import { BookingTable } from "@/apis/admin/bookings/components/BookingTable"

export default function AdminBookingsPage() {
  return <BookingTable />
}
```

---

## 5. APIs Folder Rules

In this project, `apis/` is used as the feature-based module folder.

Do not create `features/`.

Each feature should follow this structure:

```txt
apis/[role]/[feature]/
├── components/
├── queries.ts
└── schema.ts
```

Examples:

```txt
apis/admin/bookings/
apis/admin/verification/
apis/admin/moderation/
apis/admin/finance/
apis/admin/commission/
apis/admin/analytics/
apis/admin/promotions/
apis/provider/services/
apis/provider/bookings/
apis/provider/deposit/
apis/auth/
```

Responsibilities of `apis/`:

* Feature-specific components
* Feature-specific forms
* Feature-specific tables
* Feature-specific business UI
* Feature-specific TanStack Query hooks
* Feature-specific mutations
* Feature-specific Zod validation schemas
* Feature-specific business logic

---

## 6. Components Folder Rules

Use `components/` only for shared reusable components.

Current structure:

```txt
components/
├── ui/
├── layout/
├── landing/
├── common/
└── guards/
```

### 6.1 `components/ui`

Generic reusable UI only. No business logic, no API calls, no domain knowledge.

Examples: Button, Input, Textarea, Select, Dialog, Card, Table, Badge, Pagination, FormError.

### 6.2 `components/common`

Shared application components reused by multiple features.

Examples: PageHeader, ActionBar, ConfirmDialog, StatusBadge, EmptyState, ErrorState, LoadingState, SearchFilterBar.

### 6.3 `components/layout`

Shared layout components only. Must not contain feature-specific business logic.

Examples: PublicNavbar, Footer, DashboardSidebar, DashboardHeader, DashboardShell.

### 6.4 `components/landing`

Public landing page sections only.

### 6.5 `components/guards`

Auth and permission guards only.

---

## 7. Booking Status Rules

### 7.1 Allowed Booking Statuses

Use only these booking statuses:

```ts
type BookingStatus =
  | "BOOKED"                  // Customer just created the booking (replaces PENDING)
  | "CONFIRMED"               // Provider accepted; commission reserved if cash payment
  | "CHECKED_IN"              // Customer verified via QR or OTP at provider location
  | "IN_SERVICE"              // Service is in progress (replaces IN_PROGRESS)
  | "COMPLETED"               // Service completed; commission charged if cash payment
  | "COMMISSION_CHARGED"      // Commission deducted from provider balance (ledger recorded)
  | "CANCELLED_BY_CUSTOMER"   // Customer cancelled (replaces CANCELLED + cancelledBy PET_OWNER)
  | "CANCELLED_BY_PROVIDER"   // Provider rejected or cancelled (replaces CANCELLED + cancelledBy SERVICE_PROVIDER)
  | "NO_SHOW_REPORTED"        // Provider reported customer did not arrive (only before CHECKED_IN)
  | "DISPUTED"                // Active dispute; funds and status held pending admin resolution
  | "FAILED_APPROVED"         // Admin approved the failure after review
```

### 7.2 Forbidden Statuses

Do NOT use these statuses:

```txt
PENDING       → use BOOKED instead
IN_PROGRESS   → use IN_SERVICE instead
CANCELLED     → use CANCELLED_BY_CUSTOMER or CANCELLED_BY_PROVIDER instead
REJECTED      → use CANCELLED_BY_PROVIDER instead
```

### 7.3 Booking Workflow

Cash payment flow:

```
BOOKED → CONFIRMED (commission reserved) → CHECKED_IN → IN_SERVICE → COMPLETED (commission charged) → COMMISSION_CHARGED
```

Online payment flow:

```
BOOKED → CONFIRMED → CHECKED_IN → IN_SERVICE → COMPLETED
```

Cancellation flows:

```
BOOKED     → CANCELLED_BY_CUSTOMER
BOOKED     → CANCELLED_BY_PROVIDER
CONFIRMED  → CANCELLED_BY_CUSTOMER
CONFIRMED  → CANCELLED_BY_PROVIDER
```

No-show / dispute flows:

```
CONFIRMED  → NO_SHOW_REPORTED (only if customer has NOT checked in)
CHECKED_IN → DISPUTED (provider cannot self-fail after check-in)
NO_SHOW_REPORTED → DISPUTED (if customer contradicts no-show report)
DISPUTED   → FAILED_APPROVED (after admin review)
DISPUTED   → COMPLETED (if admin confirms service was delivered)
```

### 7.4 Cancellation Data Rule

If customer cancels:

```ts
status: "CANCELLED_BY_CUSTOMER"
cancelledBy: "PET_OWNER"
cancelReason: string
```

If provider cancels or rejects:

```ts
status: "CANCELLED_BY_PROVIDER"
cancelledBy: "SERVICE_PROVIDER"
cancelReason: string
```

If admin intervenes:

```ts
status: "CANCELLED_BY_PROVIDER" | "FAILED_APPROVED"
cancelledBy: "ADMIN"
cancelReason: string
```

---

## 8. Payment Method Rules

Allowed payment methods:

```ts
type PaymentMethod = "CASH" | "ONLINE_MOMO"
```

Cash payment eligibility rule:

```
canAcceptCashBooking = provider.availableBalance >= estimatedCommission + provider.safetyBuffer
                    && provider.status === "ACTIVE"
```

If `canAcceptCashBooking` is false:
- Do NOT show `CASH` as a payment option for this provider in the booking flow.
- Show balance warning on provider dashboard.

---

## 9. Provider Balance Rules

Provider balance model:

```ts
interface ProviderBalance {
  availableBalance: number    // Usable balance; must cover commission + safetyBuffer for cash bookings
  reservedBalance: number     // Held for confirmed cash bookings not yet completed
  debtBalance: number         // Amount provider owes to platform
  safetyBuffer: number        // Minimum buffer required (adjusted by trust score)
  totalDeposited: number      // Cumulative top-ups
  totalCommissionCharged: number // Cumulative commission charged
}
```

Balance transitions:

```
When CONFIRMED (cash booking): availableBalance -= estimatedCommission; reservedBalance += estimatedCommission
When COMPLETED (cash booking): reservedBalance -= commission; commission is charged (CHARGE_COMMISSION ledger entry)
When CANCELLED or no-show approved: reservedBalance -= commission; availableBalance += commission (RELEASE_RESERVE)
```

---

## 10. Trust Score Rules

Trust score fields:

```ts
interface ProviderTrustScore {
  completionRate: number
  noShowReportRate: number
  lateFailCancelRate: number
  disputeRate: number
  customerContradictionRate: number
  cashAbnormalityRate: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
}
```

Risk level actions:

```
LOW      → warning notification only
MEDIUM   → increase safetyBuffer, higher minimum balance required
HIGH     → block cash bookings, online only
CRITICAL → suspend account, block all new bookings
```

---

## 11. Ledger Transaction Rules

Every balance change must be recorded as an immutable ledger entry.

Ledger transaction types:

```ts
type LedgerTransactionType =
  | "TOPUP"                // Provider topped up deposit
  | "RESERVE_COMMISSION"   // Commission reserved when cash booking confirmed
  | "RELEASE_RESERVE"      // Reserve released due to cancellation or approved no-show
  | "CHARGE_COMMISSION"    // Commission charged after booking completed
  | "PAYOUT"               // Platform paid out to provider
  | "DEBT_OFFSET"          // Debt automatically offset from payout
  | "ADMIN_ADJUSTMENT"     // Manual balance adjustment by admin (must include reason and admin_id)
```

All admin balance adjustments must use type `ADMIN_ADJUSTMENT` and include metadata with `admin_id` and `reason`.

---

## 12. QR / OTP Check-in Rules

* When customer arrives, their app displays a unique QR code or OTP for the booking.
* Provider scans QR or enters OTP to confirm customer arrival → booking moves to `CHECKED_IN`.
* After `CHECKED_IN`, provider CANNOT change status to failed directly.
* After `CHECKED_IN`, if an issue arises, provider must open a dispute with evidence.
* Provider can only report no-show (`NO_SHOW_REPORTED`) if the customer has NOT checked in.

---

## 13. Moderation & Reports Rules

Moderation (A-03) covers two sub-sections that share the same feature folder:

```txt
apis/admin/moderation/
├── components/
│   ├── moderation-table.tsx       (service content queue)
│   ├── report-table.tsx           (content reports)
│   └── report-resolution-dialog.tsx
├── queries.ts
└── schema.ts
```

Routes:

```txt
admin/moderation          → service content queue (Moderation page)
admin/moderation/reports  → content reports (Reports page)
```

These are two views of the same feature, not two separate features.

---

## 14. Marketing / Promotions Rules

Marketing (A-08, was A-06) covers banner management, coupon management, and flash sales.

Feature folder:

```txt
apis/admin/promotions/
├── components/
│   ├── banner-table.tsx
│   ├── banner-form.tsx
│   ├── coupon-table.tsx
│   ├── coupon-form.tsx
│   └── flash-sale-form.tsx
├── queries.ts
└── schema.ts
```

Route:

```txt
admin/promotions          → campaign overview + banner slots
admin/promotions/banners  → banner management
admin/promotions/coupons  → coupon management
```

Scope rule: if not implemented in current phase, mark as `OUT_OF_SCOPE_NOW`. Do not create empty files.

Marketing does NOT affect commission flow. Commission is handled separately in `apis/admin/finance/` and `apis/admin/commission/`.

---

## 15. Admin Finance Feature Rules

Two separate admin features handle financial operations:

### A-06 Provider Balance & Deposit Management

```txt
apis/admin/finance/
├── components/
│   ├── provider-balance-table.tsx
│   ├── provider-ledger-detail.tsx
│   ├── balance-adjustment-form.tsx
│   ├── debt-management-table.tsx
│   ├── ledger-transaction-table.tsx
│   └── trust-score-detail.tsx
├── queries.ts
└── schema.ts
```

Routes:

```txt
admin/providers/[providerId]/balance
admin/finance/ledger
```

### A-07 Commission Management

```txt
apis/admin/commission/
├── components/
│   ├── commission-summary-cards.tsx
│   ├── commission-table.tsx
│   ├── pending-commission-table.tsx
│   └── commission-config-form.tsx
├── queries.ts
└── schema.ts
```

Routes:

```txt
admin/finance/commission
admin/finance/commission/config
```

---

## 16. Shared Types for New Business Concepts

Add these to `types/` as shared types:

```txt
types/booking.ts       → BookingStatus, Booking, BookingDto (updated with new statuses)
types/provider.ts      → Provider, ProviderBalance, ProviderTrustScore
types/ledger.ts        → LedgerTransaction, LedgerTransactionType (new)
types/commission.ts    → Commission, CommissionConfig, CommissionType (new)
types/payment.ts       → PaymentMethod, PaymentStatus
```

---

## 17. Shared Constants for New Business Concepts

Add or update these in `constants/`:

```txt
constants/booking-status.ts    → updated with new BookingStatus values
constants/payment-method.ts    → CASH, ONLINE_MOMO
constants/ledger-types.ts      → LedgerTransactionType values (new)
constants/trust-score.ts       → risk level thresholds (new)
constants/query-keys.ts        → add keys for finance, commission, ledger, trust-score
constants/api-endpoints.ts     → add endpoints for balance, commission, ledger
```

---

## 18. Styling Rules

* Reuse the existing design system.
* Do not introduce a new color system.
* Use existing spacing and typography.
* Use existing UI components from `components/ui`.
* Keep UI style consistent between admin and provider dashboards.

Status color conventions:

```txt
BOOKED          → Yellow
CONFIRMED       → Blue
CHECKED_IN      → Indigo
IN_SERVICE      → Purple
COMPLETED       → Green
COMMISSION_CHARGED → Teal
CANCELLED_BY_CUSTOMER → Red
CANCELLED_BY_PROVIDER → Red
NO_SHOW_REPORTED → Orange
DISPUTED        → Amber
FAILED_APPROVED → Gray
```

---

## 19. Naming Convention

### Components

Use PascalCase.

### Hooks

Use camelCase, start with `use`.

### Stores

Use kebab-case with `-store.ts`.

### Types

Use PascalCase.

### Constants

Use `UPPER_SNAKE_CASE`.

---

## 20. Next.js Client Component Rules

Use Server Components by default.

Only add `"use client"` when the component uses:

* `useState`, `useEffect`, event handlers, browser APIs
* TanStack Query hooks
* Zustand hooks
* client-only libraries

---

## 21. File Creation Policy

Before creating a new file:

1. Check `package.json`.
2. Search existing `apis/` feature modules.
3. Search existing components in `components/ui` and `components/common`.
4. Search existing hooks in `hooks/`.
5. Search existing types in `types/`.
6. Search existing stores in `stores/`.
7. Search existing constants in `constants/`.
8. Search existing utilities in `lib/`.
9. Reuse existing implementation if available.

Create a new file only if no suitable implementation exists.

---

## 22. Forbidden Patterns

Do not create:

```txt
features/
components/admin/
components/provider/
apis/components/
```

Do not use these unless installed:

```txt
swr
react-hook-form
@hookform/resolvers
```

Do not use deprecated booking statuses:

```txt
PENDING      (use BOOKED)
IN_PROGRESS  (use IN_SERVICE)
CANCELLED    (use CANCELLED_BY_CUSTOMER or CANCELLED_BY_PROVIDER)
REJECTED     (use CANCELLED_BY_PROVIDER)
```

---

## 23. Required Workflow For AI Agent

Before implementing any new feature:

1. Read `package.json` — use only installed libraries.
2. Read the existing folder structure.
3. Check whether the feature already exists in `apis/`.
4. Reuse existing mock files if they exist.
5. Identify the correct route in `app/`.
6. Identify the correct feature module in `apis/`.
7. Search for reusable components, hooks, types, constants, stores, utilities.
8. Create files only in the correct folders.
9. Do not create duplicate components.
10. Do not create `features/`.
11. Do not use SWR or React Hook Form.
12. Do not use deprecated booking statuses.
13. Do not put business logic in `page.tsx`.
14. After finishing, update `CURRENT_STATE.md`.

---

## 24. CURRENT_STATE.md Update Rule

After finishing any feature, update `CURRENT_STATE.md` with:

```txt
## Feature: [Feature Name]

Role: Admin / Provider / Auth / Public
Status: Done / In Progress / Blocked

Files created: ...
Files modified: ...
Components reused: ...
API endpoints used: ...
Query keys used: ...
Types added or reused: ...
Libraries used: ...
Notes: ...
Known issues: ...
Next steps: ...
```

---

## 25. Final Placement Rule

```txt
Route / page / layout?             → app/
Feature-specific component?        → apis/[role]/[feature]/components/
Feature-specific query/mutation?   → apis/[role]/[feature]/queries.ts
Feature-specific schema?           → apis/[role]/[feature]/schema.ts
Generic reusable UI?               → components/ui/
Shared application component?      → components/common/
Layout component?                  → components/layout/
Auth or permission guard?          → components/guards/
Landing page section?              → components/landing/
Shared reusable hook?              → hooks/
Global client state?               → stores/
Axios / auth / RBAC / utility?     → lib/
Shared type?                       → types/
Shared constant?                   → constants/
Global provider?                   → providers/
Static asset?                      → public/
```