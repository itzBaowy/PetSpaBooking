# SYSTEM ARCHITECTURE

## Tech Stack

This project uses the following libraries based on `package.json`:

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

Important:

```txt
This project does not use SWR.
Do not create SWR hooks.
Use TanStack React Query for server state.
```

---

## High Level Flow

```txt
UI
↓
Feature Components in apis/
↓
TanStack Query Hooks
↓
Axios Client
↓
Backend API
```

---

## Architecture Summary

This project uses a feature-based structure, but the feature modules are currently placed inside `apis/`.

Important rule:

```txt
Do not create a features/ folder.
Use apis/ as the feature module folder.
```

Current main structure:

```txt
app/          = routing only
apis/         = feature modules
components/   = shared reusable components
hooks/        = shared reusable hooks
stores/       = client state only
lib/          = infrastructure and utilities
types/        = global shared types
constants/    = shared constants
providers/    = global providers
public/       = static assets
```

---

## Layer Responsibilities

## 1. `app/`

`app/` is used for routing only.

Responsibilities:

* Route definition
* Layout composition
* Route grouping
* Loading, error, and not-found UI

Allowed examples:

```txt
app/(public)/page.tsx
app/(auth)/login/page.tsx
app/(dashboard)/admin/bookings/page.tsx
app/(dashboard)/provider/services/page.tsx
```

Must NOT contain:

* Business logic
* API calls
* Validation logic
* Large feature UI
* Form business logic
* TanStack Query logic

Correct usage:

```tsx
import { BookingTable } from "@/apis/admin/bookings/components/BookingTable"

export default function AdminBookingsPage() {
  return <BookingTable />
}
```

`page.tsx` should only compose components from `apis/` or shared components.

---

## 2. `apis/`

`apis/` is the feature module layer of this project.

Even though the folder is named `apis`, it currently contains feature-based modules.

Examples:

```txt
apis/auth
apis/admin/users
apis/admin/bookings
apis/admin/analytics
apis/admin/moderation
apis/admin/verification
apis/provider/services
apis/provider/bookings
apis/provider/business-profile
```

Each feature should follow this structure:

```txt
apis/[role]/[feature]/
├── components/
├── queries.ts
└── schema.ts
```

Example:

```txt
apis/admin/bookings/
├── components/
│   ├── BookingTable.tsx
│   ├── BookingDetail.tsx
│   └── BookingStatusActions.tsx
├── queries.ts
└── schema.ts
```

Responsibilities:

* Feature-specific components
* Feature-specific forms
* Feature-specific tables
* Feature-specific business UI
* TanStack Query hooks
* TanStack Query mutations
* Zod validation schemas
* Feature-specific logic

Rules:

* Do not create `features/`.
* Do not move existing mock features out of `apis/`.
* Do not duplicate existing feature folders.
* Reuse existing mock files inside `apis/`.
* Feature-specific components must stay inside `apis/[role]/[feature]/components`.
* Feature-specific TanStack Query hooks must stay inside `apis/[role]/[feature]/queries.ts`.
* Feature-specific validation schemas must stay inside `apis/[role]/[feature]/schema.ts`.

---

## 3. `components/`

`components/` is the reusable UI layer.

Current structure:

```txt
components/
├── ui/
├── common/
├── layout/
├── landing/
└── guards/
```

---

### `components/ui`

Generic reusable UI components.

Examples:

```txt
Button
Input
Textarea
Select
Dialog
Card
Table
Badge
Pagination
FormError
```

Rules:

* No business logic.
* No API calls.
* No TanStack Query hooks.
* No domain-specific logic.
* Must not know about booking, user, provider, service, review, or verification.

---

### `components/common`

Reusable application-level components.

Examples:

```txt
PageHeader
ActionBar
ConfirmDialog
StatusBadge
EmptyState
ErrorState
LoadingState
SearchFilterBar
```

Rules:

* Used by multiple features.
* Can contain shared application UI.
* Must not belong to only one feature.
* Do not place feature-specific forms or tables here.

Wrong examples:

```txt
components/common/BookingTable.tsx
components/common/ServiceForm.tsx
components/common/VerificationActions.tsx
```

These belong in `apis/[role]/[feature]/components`.

---

### `components/layout`

Layout components.

Examples:

```txt
DashboardSidebar
DashboardHeader
DashboardShell
PublicNavbar
Footer
```

Responsibilities:

* Shared page layout
* Navigation shell
* Dashboard structure
* Public layout structure

Must not contain:

* Feature business logic
* Feature-specific API calls
* Feature-specific forms

---

### `components/landing`

Public landing page sections.

Examples:

```txt
HeroSection
ServiceSection
ProviderSection
TestimonialSection
CtaSection
```

Rules:

* Only public marketing UI belongs here.
* Do not put admin or provider dashboard UI here.

---

### `components/guards`

Authentication and permission guards.

Examples:

```txt
AuthGuard
RoleGuard
PermissionGuard
```

Responsibilities:

* Protect routes
* Check login state
* Check role access
* Check permission access

---

## 4. `hooks/`

`hooks/` contains shared reusable hooks.

Examples:

```txt
usePagination
useUpload
usePermission
useDebounce
useToast
```

Responsibilities:

* Shared client-side reusable behavior
* Utility hooks used by multiple features

Rules:

* Do not put feature-specific TanStack Query hooks here.
* Feature-specific query hooks belong in `apis/[role]/[feature]/queries.ts`.
* Do not put API business logic here unless it is reusable across many features.

---

## 5. `stores/`

`stores/` contains client state only.

Examples:

```txt
auth-store.ts
ui-store.ts
provider-store.ts
filter-store.ts
```

Allowed state:

* Auth/session client state
* Sidebar open/close state
* UI state
* Selected provider context
* Shared filters

Must NOT store:

* Server list data
* API response data
* Booking list from API
* User list from API
* Provider list from API
* Analytics data from API

Server data must be handled by TanStack Query.

---

## 6. `lib/`

`lib/` is the infrastructure layer.

Examples:

```txt
lib/axios.ts
lib/query-client.ts
lib/auth.ts
lib/rbac.ts
lib/routes.ts
lib/permissions.ts
lib/upload-adapter.ts
lib/date.ts
lib/currency.ts
lib/utils.ts
```

Responsibilities:

* Axios client setup
* TanStack Query client setup
* Auth helpers
* RBAC helpers
* Route helpers
* Permission helpers
* Upload adapter
* Date formatting
* Currency formatting
* Generic utilities

Rules:

* Do not put feature-specific UI in `lib/`.
* Do not put feature-specific forms in `lib/`.
* Do not put feature-specific business components in `lib/`.
* Do not create duplicate Axios clients.
* Reuse `lib/axios.ts` for API requests.
* Reuse `lib/query-client.ts` for React Query setup.

---

## 7. `types/`

`types/` contains global shared TypeScript types.

Examples:

```txt
types/auth.ts
types/user.ts
types/provider.ts
types/service.ts
types/booking.ts
types/customer.ts
types/pet.ts
types/review.ts
types/revenue.ts
types/analytics.ts
types/api.ts
types/common.ts
```

Responsibilities:

* Shared domain types
* Shared DTOs
* Shared API response types
* Shared common types

Rules:

* Shared types belong in `types/`.
* Feature-specific types can stay close to the feature if needed.
* Avoid using `any`.
* Use PascalCase for type and interface names.

Examples:

```ts
User
UserDto
UserResponse
Booking
BookingDto
BookingResponse
Provider
ProviderDto
```

---

## 8. `constants/`

`constants/` contains shared constants.

Examples:

```txt
constants/roles.ts
constants/permissions.ts
constants/booking-status.ts
constants/service-category.ts
constants/query-keys.ts
constants/api-endpoints.ts
```

Responsibilities:

* Role constants
* Permission constants
* Booking status constants
* Service category constants
* React Query keys
* API endpoint constants

Rules:

* Reuse constants instead of hardcoding strings.
* Query keys should come from `constants/query-keys.ts`.
* API endpoints should come from `constants/api-endpoints.ts`.
* Constant names should use `UPPER_SNAKE_CASE`.

---

## 9. `providers/`

`providers/` contains global app providers.

Examples:

```txt
providers/app-provider.tsx
providers/auth-provider.tsx
providers/query-provider.tsx
providers/theme-provider.tsx
```

Responsibilities:

* Wrap the whole app
* Provide global context
* Provide auth context
* Provide theme context
* Provide TanStack Query provider

Rules:

* Providers can stay outside `components/`.
* Do not put feature-specific UI inside `providers/`.
* Do not put page-specific logic inside `providers/`.
* `query-provider.tsx` should use TanStack Query, not SWR.

---

## Data Flow

### Fetching Data

```txt
Page
↓
Feature Component in apis/
↓
TanStack Query Hook in queries.ts
↓
Axios Client in lib/axios.ts
↓
Backend API
↓
React Query Cache
↓
UI Re-render
```

Example:

```txt
app/(dashboard)/admin/bookings/page.tsx
↓
apis/admin/bookings/components/BookingTable.tsx
↓
apis/admin/bookings/queries.ts
↓
lib/axios.ts
↓
Backend API
```

---

### Form Submit Flow

```txt
User Action
↓
Feature Form Component
↓
React Hook Form
↓
Zod Validation
↓
TanStack Query Mutation
↓
Axios Client
↓
Backend API
↓
Invalidate / Update Query Cache
↓
UI Refresh
```

Example:

```txt
apis/provider/services/components/ServiceForm.tsx
↓
apis/provider/services/schema.ts
↓
apis/provider/services/queries.ts
↓
lib/axios.ts
↓
Backend API
```

---

## TanStack Query Rules

This project uses `@tanstack/react-query`.

Rules:

* Use TanStack Query for server state.
* Use `useQuery` for fetching data.
* Use `useMutation` for create, update, delete, approve, reject, and submit actions.
* Store feature-specific query hooks inside `apis/[role]/[feature]/queries.ts`.
* Do not manually duplicate server state in Zustand.
* Do not call Axios directly inside `page.tsx`.
* Do not call Axios directly inside shared UI components.
* Use `queryClient.invalidateQueries()` or `queryClient.setQueryData()` after successful mutations.
* Use consistent query keys from `constants/query-keys.ts`.

Correct:

```txt
apis/admin/bookings/queries.ts
apis/admin/verification/queries.ts
apis/provider/services/queries.ts
```

Wrong:

```txt
app/admin/bookings/page.tsx with API call
components/ui/Table.tsx with query hook
components/common/BookingTable.tsx with booking-only API logic
features/admin/bookings/queries.ts
```

---

## Validation Flow

Validation must stay inside the feature module.

Correct:

```txt
apis/provider/services/schema.ts
apis/auth/schema.ts
apis/admin/verification/schema.ts
```

Rules:

* Use Zod for schema validation.
* Use React Hook Form only if it is installed in the project.
* If React Hook Form is not installed, do not use it until the dependency is added.
* Do not put validation logic inside `page.tsx`.
* Do not put feature validation schema inside `components/`.

Important:

```txt
Current package.json does not include react-hook-form or @hookform/resolvers.
Do not use React Hook Form unless these packages are installed.
```

---

## Final Placement Rule

When unsure where to place a file, follow this:

```txt
Route / page / layout?
→ app/

Feature-specific component?
→ apis/[role]/[feature]/components/

Feature-specific TanStack Query hook or mutation?
→ apis/[role]/[feature]/queries.ts

Feature-specific validation schema?
→ apis/[role]/[feature]/schema.ts

Generic reusable UI?
→ components/ui/

Shared application component?
→ components/common/

Layout component?
→ components/layout/

Auth or permission guard?
→ components/guards/

Landing page section?
→ components/landing/

Shared reusable hook?
→ hooks/

Global client state?
→ stores/

Axios / auth / RBAC / utility?
→ lib/

Shared type?
→ types/

Shared constant?
→ constants/

Global provider?
→ providers/

Static asset?
→ public/
```

---

## Important Rule for AI Agent

Before implementing any feature:

1. Check `package.json`.
2. Use only installed libraries.
3. Check if the feature already exists in `apis/`.
4. Reuse existing mock files if they already exist.
5. Do not create `features/`.
6. Do not create SWR hooks.
7. Use TanStack React Query for server state.
8. Do not use React Hook Form unless it is installed.
9. Do not duplicate components.
10. Do not move existing `apis/` feature modules unless explicitly requested.
11. Keep feature-specific components, queries, and schemas inside `apis/[role]/[feature]/`.
12. Keep shared components inside `components/`.
13. Keep routing only inside `app/`.

After finishing a feature, update `CURRENT_STATE.md`.
