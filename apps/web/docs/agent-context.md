# IMPORTANT

This project is already partially implemented.

Assume existing code may already exist.

Before generating any code:

1. Inspect existing folders.
2. Reuse existing components.
3. Reuse existing hooks.
4. Reuse existing schemas.
5. Reuse existing stores.

Preferred action order:

REUSE
→ EXTEND
→ REFACTOR
→ CREATE

Creating new files should be the last option.

# ADMIN DASHBOARD CONVENTION

Admin Dashboard Overview does NOT have its own feature folder.

Route:

app/(dashboard)/admin/page.tsx

The dashboard overview should compose existing components from:

features/admin/analytics/components

Examples:

- platform-summary-cards.tsx
- booking-analytics-chart.tsx
- platform-revenue-chart.tsx
- top-providers-table.tsx

Do not create:

features/admin/dashboard

Do not create duplicate dashboard components.

Prefer composition over recreation.
