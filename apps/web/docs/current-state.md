# IMPLEMENTATION STATUS

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
- Booking statuses in existing code still use OLD values (PENDING, IN_PROGRESS, CANCELLED).
  → Cần refactor sang status mới theo SRS-SDN302 khi integrate với backend thực.
- Dispute resolution UI includes audit log note input.
- Moderation và Reports là 2 sub-view cùng feature `apis/admin/moderation/` — đúng convention.
- Sidebar includes: Dashboard, Users, Providers, Bookings, Verification, Moderation, Reports, Marketing, Audit Logs.

Known issues:

- Booking status constants chưa được cập nhật sang status mới (BOOKED, IN_SERVICE, CHECKED_IN...).
- Provider detail chưa có Trust Score và Balance overview (cần mở rộng A-01).
- A-04 chưa có no-show review flow và filter cho status mới.
- A-05 chưa có commission revenue chart và provider risk overview.
- `pnpm --filter web lint` vẫn fail trên pre-existing issues ngoài scope.

---

## NOT STARTED

### Admin

- A-06: Provider Balance & Deposit Management (`apis/admin/finance/`)
- A-07: Commission Management (`apis/admin/commission/`)

### Admin — Cần mở rộng

- A-01: Provider detail → thêm Trust Score card + Balance overview card
- A-04: Booking Monitoring → thêm no-show review flow + filter status mới
- A-05: Analytics → thêm commission revenue chart + provider risk overview card

### Shared — Cần cập nhật

- `types/booking.ts` → BookingStatus mới
- `types/provider.ts` → ProviderBalance, ProviderTrustScore
- `types/ledger.ts` → LedgerTransaction, LedgerTransactionType (tạo mới)
- `types/commission.ts` → Commission, CommissionConfig (tạo mới)
- `constants/booking-status.ts` → cập nhật values
- `constants/ledger-types.ts` → tạo mới
- `constants/trust-score.ts` → tạo mới

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