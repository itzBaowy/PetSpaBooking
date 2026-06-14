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

The project follows this structure:

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

Wrong example:

```tsx
export default function AdminBookingsPage() {
  const [data, setData] = useState([])

  const handleSubmit = async () => {
    await fetch("/api/bookings")
  }

  return <div>...</div>
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
├── components/
├── queries.ts
└── schema.ts

apis/admin/verification/
├── components/
├── queries.ts
└── schema.ts

apis/admin/analytics/
├── components/
└── queries.ts

apis/provider/services/
├── components/
├── queries.ts
└── schema.ts

apis/auth/
├── components/
├── queries.ts
└── schema.ts
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

Rules:

* Feature-specific components belong in `apis/[role]/[feature]/components`.
* Feature-specific query and mutation logic belongs in `apis/[role]/[feature]/queries.ts`.
* Feature-specific validation schema belongs in `apis/[role]/[feature]/schema.ts`.
* Do not create a `features/` folder.
* Do not create `components/admin` or `components/provider`.
* Do not move mock files from `apis/` into new folders.
* Reuse existing mock files in `apis/` instead of creating new duplicates.
* Do not place shared generic UI inside `apis/`.
* Do not place global layout components inside `apis/`.

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

---

### 6.1 `components/ui`

Use `components/ui` for generic reusable UI components only.

A UI component:

* Has no business logic.
* Has no API calls.
* Has no TanStack Query hooks.
* Does not know about domain entities such as booking, user, provider, service, payment, review, or verification.
* Only receives generic props such as `label`, `value`, `error`, `variant`, `disabled`, `children`, `onClick`.

Examples:

```txt
components/ui/Button.tsx
components/ui/Input.tsx
components/ui/Textarea.tsx
components/ui/Select.tsx
components/ui/Dialog.tsx
components/ui/Card.tsx
components/ui/Table.tsx
components/ui/Badge.tsx
components/ui/Pagination.tsx
components/ui/FormError.tsx
```

Do not place feature-specific forms or tables in `components/ui`.

Wrong examples:

```txt
components/ui/ServiceForm.tsx
components/ui/BookingTable.tsx
components/ui/VerificationActions.tsx
```

---

### 6.2 `components/common`

Use `components/common` only for shared application components reused by multiple features.

Examples:

```txt
components/common/PageHeader.tsx
components/common/ActionBar.tsx
components/common/ConfirmDialog.tsx
components/common/StatusBadge.tsx
components/common/EmptyState.tsx
components/common/ErrorState.tsx
components/common/LoadingState.tsx
components/common/SearchFilterBar.tsx
```

Rules:

* It can contain shared business UI.
* It must be reusable by more than one feature.
* It must not belong to only one feature.
* Do not put feature-specific forms in `components/common`.
* Do not put feature-specific tables in `components/common`.

Wrong examples:

```txt
components/common/BookingTable.tsx
components/common/ServiceForm.tsx
components/common/VerificationTable.tsx
components/common/DisputeResolutionForm.tsx
```

These belong in `apis/[role]/[feature]/components`.

---

### 6.3 `components/layout`

Use `components/layout` for shared layout components.

Examples:

```txt
components/layout/PublicNavbar.tsx
components/layout/Footer.tsx
components/layout/DashboardSidebar.tsx
components/layout/DashboardHeader.tsx
components/layout/DashboardShell.tsx
```

Rules:

* Layout components should not contain feature-specific business logic.
* Layout components should not call feature APIs directly.
* Layout components can read auth/role information only when needed for navigation or guards.

---

### 6.4 `components/landing`

Use `components/landing` for public landing page sections.

Examples:

```txt
components/landing/HeroSection.tsx
components/landing/ServiceSection.tsx
components/landing/ProviderSection.tsx
components/landing/TestimonialSection.tsx
components/landing/CtaSection.tsx
```

Rules:

* Only public marketing/homepage UI belongs here.
* Do not put admin dashboard components here.
* Do not put provider dashboard components here.
* Do not put feature-specific API logic here.

---

### 6.5 `components/guards`

Use `components/guards` for auth and permission guards.

Examples:

```txt
components/guards/AuthGuard.tsx
components/guards/RoleGuard.tsx
components/guards/PermissionGuard.tsx
```

Rules:

* Guards may check authentication, role, and permission.
* Guards should reuse role and permission constants from `constants/`.
* Guards should not contain feature-specific UI.

---

## 7. Component Placement Rules

Before creating any component, classify it into one of three levels.

---

### 7.1 UI Component

Place in `components/ui` only if:

* It is generic.
* It is reusable across the whole app.
* It has no business logic.
* It has no domain-specific logic.
* It has no API or TanStack Query logic.

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

---

### 7.2 Common Component

Place in `components/common` only if:

* It is reused by multiple features.
* It contains shared application UI.
* It is not tied to only one feature.

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

---

### 7.3 Feature Component

Place in `apis/[role]/[feature]/components` if:

* It belongs to one business feature.
* It uses feature-specific query, mutation, schema, or types.
* It displays or edits a domain entity.
* It is used by only one feature.

Examples:

```txt
apis/auth/components/LoginForm.tsx
apis/auth/components/RegisterProviderForm.tsx

apis/admin/bookings/components/BookingTable.tsx
apis/admin/bookings/components/BookingDetail.tsx

apis/admin/verification/components/VerificationTable.tsx
apis/admin/verification/components/VerificationActions.tsx

apis/provider/services/components/ServiceForm.tsx
apis/provider/services/components/ServiceTable.tsx

apis/provider/business-profile/components/BusinessProfileForm.tsx
```

---

## 8. Query and Mutation Rules

This project uses TanStack React Query for server state.

Rules:

* Use `@tanstack/react-query`.
* Use `useQuery` for fetching server data.
* Use `useMutation` for create, update, delete, approve, reject, and submit actions.
* Store feature-specific query hooks in `apis/[role]/[feature]/queries.ts`.
* Do not use SWR.
* Do not create SWR hooks.
* Do not put query hooks inside `components/ui`.
* Do not put feature-specific query hooks inside shared `hooks/`.
* Do not call Axios directly inside `page.tsx`.
* Do not call Axios directly inside shared UI components.
* Do not manually duplicate server state in Zustand.
* Use `queryClient.invalidateQueries()` or `queryClient.setQueryData()` after successful mutations.
* Use consistent query keys from `constants/query-keys.ts` when available.

Correct pattern:

```txt
apis/admin/bookings/queries.ts
apis/admin/verification/queries.ts
apis/provider/services/queries.ts
apis/auth/queries.ts
```

Wrong pattern:

```txt
app/admin/bookings/page.tsx with API call
components/ui/Table.tsx with query hook
components/common/BookingTable.tsx with booking-only API logic
features/admin/bookings/queries.ts
apis/admin/bookings/swr.ts
```

---

## 9. API Client Rules

API client setup belongs in `lib/`.

Expected files:

```txt
lib/axios.ts
lib/query-client.ts
constants/api-endpoints.ts
constants/query-keys.ts
```

Rules:

* Use the existing Axios client from `lib/axios.ts`.
* Do not call `fetch` directly.
* Do not create a new Axios client if one already exists.
* API endpoint strings should be reused from `constants/api-endpoints.ts` when available.
* Query keys should be reused from `constants/query-keys.ts` when available.
* Feature query files should import the API client and endpoint constants.

Correct flow:

```txt
apis/admin/bookings/queries.ts
↓
lib/axios.ts
↓
constants/api-endpoints.ts
↓
Backend API
```

---

## 10. Form and Validation Rules

This project currently has `zod`, but does not have `react-hook-form` or `@hookform/resolvers`.

Rules:

* Use Zod for validation schemas.
* Store feature-specific validation schemas in `apis/[role]/[feature]/schema.ts`.
* Do not use React Hook Form unless `react-hook-form` is installed.
* Do not use `zodResolver` unless `@hookform/resolvers` is installed.
* Do not add form libraries unless explicitly requested.
* Do not put validation logic inside `page.tsx`.
* Do not put feature validation schema inside `components/`.

Correct example:

```txt
apis/provider/services/schema.ts
apis/admin/verification/schema.ts
apis/auth/schema.ts
```

Wrong example:

```txt
app/provider/services/create/page.tsx contains validation logic
components/common/service.schema.ts
features/provider/services/schema.ts
```

If a form is needed with the current dependencies:

```txt
Use React state or existing project form pattern.
Use Zod manually for validation.
Do not import react-hook-form.
Do not import zodResolver.
```

---

## 11. Type Rules

Use `types/` for shared TypeScript types and interfaces.

Current examples:

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

Rules:

* Avoid using `any`.
* Shared DTOs belong in `types/api.ts`.
* Shared domain types belong in their own files.
* Feature-specific types can stay close to the feature if needed.
* Use PascalCase for type and interface names.
* Use `interface` when possible.

Naming examples:

```txt
User
UserDto
UserResponse
Provider
ProviderDto
Service
ServiceResponse
Booking
BookingDto
BookingResponse
```

---

## 12. Store Rules

Use `stores/` for global client state with Zustand.

Current examples:

```txt
stores/auth-store.ts
stores/ui-store.ts
stores/provider-store.ts
stores/filter-store.ts
```

Rules:

* Use stores only for global client state.
* Do not duplicate server state in stores.
* Server state must use TanStack React Query.
* Do not store API list data in Zustand if it comes from the server.

Allowed store examples:

```txt
auth user/session state
sidebar open/close state
theme-related UI state
selected provider context
global filters if reused across pages
```

Not allowed in stores:

```txt
booking list from API
user list from API
provider list from API
analytics data from API
verification request list from API
```

---

## 13. Hooks Rules

Use `hooks/` for shared reusable hooks.

Current examples:

```txt
hooks/use-debounce.ts
hooks/use-pagination.ts
hooks/use-permission.ts
hooks/use-upload.ts
hooks/use-toast.ts
```

Rules:

* Shared hooks used by many features belong in `hooks/`.
* Feature-specific TanStack Query hooks belong in `apis/[role]/[feature]/queries.ts`.
* Hooks used by only one feature should stay inside that feature if needed.
* Hook names must start with `use`.

Examples:

```txt
useDebounce
usePagination
usePermission
useUpload
useToast
```

---

## 14. Constants Rules

Use `constants/` for shared constants.

Current examples:

```txt
constants/roles.ts
constants/permissions.ts
constants/booking-status.ts
constants/service-category.ts
constants/query-keys.ts
constants/api-endpoints.ts
```

Rules:

* Constant names must use `UPPER_SNAKE_CASE`.
* Reuse constants instead of hardcoding strings.
* Role and permission checks must use constants.
* Query keys should be centralized in `constants/query-keys.ts`.
* API endpoints should be centralized in `constants/api-endpoints.ts`.

---

## 15. Lib Rules

Use `lib/` for shared utilities and infrastructure.

Current examples:

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

Rules:

* Axios client setup belongs in `lib/axios.ts`.
* TanStack Query client setup belongs in `lib/query-client.ts`.
* Auth helpers belong in `lib/auth.ts`.
* RBAC helpers belong in `lib/rbac.ts`.
* Route helpers belong in `lib/routes.ts`.
* Permission helpers belong in `lib/permissions.ts`.
* Date formatting belongs in `lib/date.ts`.
* Currency formatting belongs in `lib/currency.ts`.
* Generic utilities belong in `lib/utils.ts`.
* Do not put feature-specific business logic in `lib/`.
* Do not put feature-specific UI in `lib/`.

---

## 16. Providers Rules

Use `providers/` for global app providers.

Current examples:

```txt
providers/app-provider.tsx
providers/query-provider.tsx
providers/theme-provider.tsx
providers/auth-provider.tsx
```

Rules:

* Providers are allowed to stay outside `components/`.
* Providers are used to wrap the whole app.
* `app-provider.tsx` should compose global providers.
* `query-provider.tsx` should use TanStack React Query.
* Do not use SWR provider.
* Do not put feature-specific UI inside `providers/`.
* Do not put page-specific logic inside `providers/`.

---

## 17. Styling Rules

* Reuse the existing design system.
* Do not introduce a new color system.
* Use existing spacing and typography.
* Use existing UI components from `components/ui`.
* Do not hard-code random colors unless the design system already defines them.
* Keep UI style consistent between admin and provider dashboards.
* Do not create separate visual styles for admin and provider unless required.

---

## 18. Naming Convention

### Components

Use PascalCase.

Examples:

```txt
LoginForm.tsx
ServiceTable.tsx
VerificationActions.tsx
BusinessProfileForm.tsx
```

### Hooks

Use camelCase and start with `use`.

Examples:

```txt
useDebounce
usePagination
usePermission
useUpload
```

### Stores

Use kebab-case with `-store.ts`.

Examples:

```txt
auth-store.ts
ui-store.ts
provider-store.ts
filter-store.ts
```

### Types

Use PascalCase.

Examples:

```txt
User
UserDto
UserResponse
Service
BookingResponse
```

### Constants

Use `UPPER_SNAKE_CASE`.

Examples:

```txt
USER_ROLES
BOOKING_STATUS
QUERY_KEYS
API_ENDPOINTS
```

---

## 19. Next.js Client Component Rules

Use Server Components by default.

Only add `"use client"` when the component uses:

* `useState`
* `useEffect`
* event handlers
* browser APIs
* TanStack Query hooks
* Zustand hooks
* client-only libraries

Rules:

* Do not add `"use client"` to every file.
* Keep server components as server components when possible.
* Client components should be as small as possible.
* If only one child component needs client behavior, make only that child component a client component.

---

## 20. File Creation Policy

Before creating a new file:

1. Check `package.json`.
2. Search existing `apis/` feature modules.
3. Search existing components in `components/ui`.
4. Search existing components in `components/common`.
5. Search existing hooks in `hooks/`.
6. Search existing types in `types/`.
7. Search existing stores in `stores/`.
8. Search existing constants in `constants/`.
9. Search existing utilities in `lib/`.
10. Reuse existing implementation if available.

Create a new file only if no suitable implementation exists.

---

## 21. Forbidden Patterns

Do not create these:

```txt
features/
features/admin/
features/provider/
components/admin/
components/provider/
components/ui/ServiceForm.tsx
components/common/VerificationTable.tsx
app/admin/verification/page.tsx with business logic
app/provider/services/page.tsx with fetch logic
```

Do not use these libraries unless they are installed first:

```txt
swr
react-hook-form
@hookform/resolvers
```

Do not do this:

```txt
features/admin/bookings/components/BookingTable.tsx
components/admin/bookings/BookingTable.tsx
apis/components/
apis/admin/components/
apis/provider/components/
apis/admin/bookings/swr.ts
```

Use this instead:

```txt
apis/admin/bookings/components/BookingTable.tsx
apis/admin/bookings/queries.ts
apis/admin/bookings/schema.ts

apis/provider/services/components/ServiceForm.tsx
apis/provider/services/queries.ts
apis/provider/services/schema.ts

apis/auth/components/LoginForm.tsx
apis/auth/queries.ts
apis/auth/schema.ts
```

---

## 22. Required Workflow For AI Agent

Before implementing any new feature, the AI agent must:

1. Read `package.json`.
2. Use only installed libraries.
3. Read the existing folder structure.
4. Check whether the feature already exists in `apis/`.
5. Reuse existing mock files if they already exist.
6. Identify the correct route inside `app/`.
7. Identify the correct feature module inside `apis/`.
8. Search for reusable components in `components/ui`.
9. Search for reusable components in `components/common`.
10. Search for reusable hooks in `hooks/`.
11. Search for reusable types in `types/`.
12. Search for reusable constants in `constants/`.
13. Search for reusable stores in `stores/`.
14. Search for existing utility functions in `lib/`.
15. Create files only in the correct folders.
16. Do not create duplicate components.
17. Do not create a `features/` folder.
18. Do not use SWR.
19. Do not use React Hook Form unless installed.
20. Do not put business logic in `page.tsx`.

---

## 23. CURRENT_STATE.md Update Rule

After finishing any feature, update `CURRENT_STATE.md`.

Use this format:

```txt
## Feature: [Feature Name]

Role:
- Admin / Provider / Auth / Public

Status:
- Done / In Progress / Blocked

Files created:
- ...

Files modified:
- ...

Components reused:
- ...

API endpoints used:
- ...

Query keys used:
- ...

Types added or reused:
- ...

Libraries used:
- ...

Notes:
- ...

Known issues:
- ...

Next steps:
- ...
```

---

## 24. Final Placement Rule

When unsure where to place a file, follow this priority:

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

## 25. Final Important Rule

This project uses:

```txt
apis/ = feature modules
TanStack React Query = server state
Axios = HTTP client
Zod = validation
Zustand = global client state
```

This project does not use:

```txt
features/
SWR
React Hook Form
@hookform/resolvers
```

Therefore:

* Do not create `features/`.
* Do not move files from `apis/` to `features/`.
* Do not create duplicate feature implementations.
* Do not create SWR hooks.
* Do not import `useSWR`.
* Do not import `react-hook-form`.
* Do not import `zodResolver`.
* Always continue from the existing mock feature modules inside `apis/`.
