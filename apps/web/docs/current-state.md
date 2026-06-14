# IMPLEMENTATION STATUS

## COMPLETED

### Admin

- Dashboard Layout
- Sidebar Navigation
- Header Navigation
- Dashboard Overview
- Moderation & Reports mock UI (A-03)
- Booking Monitoring & Dispute Resolution mock UI (A-04)
- Admin hydration/layout polish
- Admin menu completion and Audit Logs mock UI
- Fixed collapsible dashboard sidebar
- Custom rounded select UI for admin filters and forms
- Custom debounced search UI for provider verification
- Provider verification summary cards are display-only

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
- app/(dashboard)/layout.tsx
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

Files moved/deleted:

- Removed the incorrect `features/` implementation and kept feature code inside `apis/`.

Components reused:

- apis/admin/moderation/components/moderation-table.tsx
- apis/admin/moderation/components/report-table.tsx
- apis/admin/bookings/components/system-booking-table.tsx
- apis/admin/bookings/components/dispute-table.tsx
- apis/admin/bookings/components/dispute-resolution-form.tsx

API endpoints used:

- GET /admin/moderation/contents
- GET /admin/moderation/reports
- POST /admin/moderation/contents/resolve
- POST /admin/moderation/reports/resolve
- GET /admin/bookings
- GET /admin/bookings/disputes
- POST /admin/bookings/disputes/resolve
- GET /admin/audit-logs

Query keys used:

- ["admin", "moderation", "contents"]
- ["admin", "moderation", "reports"]
- ["admin", "bookings", "list"]
- ["admin", "bookings", "disputes"]
- ["admin", "audit-logs", "list"]

Libraries used:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios through lib/axios.ts
- TanStack React Query
- Zod

Notes:

- This is mock UI only. Query hooks use `initialData` and `enabled: false` so screens do not require a live backend yet.
- Booking statuses follow the allowed workflow: `PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
- Dispute resolution UI includes audit log note input.
- `page.tsx` files compose feature components from `apis/`.
- Root layout uses `suppressHydrationWarning` to prevent browser extension attributes on `<body>` from surfacing as app hydration errors.
- Dashboard layout and admin tables were constrained to prevent page-level horizontal overflow.
- Sidebar and Quick Management Links now include Bookings, Disputes, Service Review, Reports, Analytics, and Audit Logs.
- Audit Logs mock UI tracks moderation, report, dispute, refund, booking status, and account actions.
- Dashboard sidebar stays fixed while the main content scrolls, with a collapse/expand toggle.
- Native admin select fields were replaced with `CustomSelect` for rounded dropdown menus and consistent styling.
- Provider verification search now uses `SearchInput` with a 300ms debounce via `useDebounce`.
- Provider verification summary cards no longer trigger filters; filtering is handled by search and status dropdown only.

Known issues:

- `pnpm --filter web exec tsc --noEmit --incremental false` passes.
- `GET http://localhost:3000/admin/bookings` returns `200` after reinstalling dependencies.
- `GET http://localhost:3000/admin/audit-logs` returns `200`.
- `pnpm --filter web lint` still fails on pre-existing issues outside A-03/A-04:
  unescaped apostrophe in auth forgot-password UI, `any` in provider query/store files, and unused variables in existing files.
- `apps/web/docs/architecture.md` and `apps/web/docs/rules.md` had pre-existing working tree changes and were not reverted.

---

## IN PROGRESS

### Admin

- User Management

---

## NOT STARTED

### Admin

- Provider Verification
- Analytics Detail

### Provider

- Revenue Dashboard
- Chat System
- Notifications
