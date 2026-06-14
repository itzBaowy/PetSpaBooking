# PROJECT RULES

## General Principles

* Always follow existing folder structure.
* Never create duplicate components if a reusable component already exists.
* Reuse code before creating new code.
* Follow Feature-Based Architecture.

## Next.js Rules

* Use Server Components by default.
* Only add "use client" when required.
* Never place business logic inside page.tsx.
* page.tsx should compose feature components only.

## Component Rules

* One component = one responsibility.
* Shared UI belongs in components/ui.
* Shared business components belong in components/common.
* Layout components belong in components/layout.

## Feature Rules

Each feature should contain:

features/[feature]/

- components/
- queries.ts
- schema.ts

Business logic must stay inside feature folders.

Do not place feature components inside apis/.
The apis/ folder should not be used for UI components.

## API Rules

* Never call fetch directly.
* Use a dedicated API client abstraction.
* API calls must be isolated from UI components.
* Query and mutation logic should be stored in feature folders.

## Form Rules

- Use React Hook Form for form state management.
- Use Zod for validation schema.
- Use zodResolver from @hookform/resolvers.
- Validation schema must be stored in schema.ts.
- Form logic must stay inside feature folders.
- Do not put form business logic directly inside page.tsx.
## Type Rules

* Avoid using any.
* Create types in /types.
* Shared DTOs belong in types/api.ts.

## Styling Rules

* Reuse existing design system.
* Do not introduce new color systems.
* Use existing spacing and typography.

## Naming Convention

Components:
PascalCase

Hooks:
useSomething

Stores:
something-store.ts

Types:
Something
SomethingDto
SomethingResponse

Constants:
UPPER_SNAKE_CASE

## State Management

Global state:
stores/ (Zustand)

Server state:
TanStack Query

Avoid local duplication of server state.

## React Query Rules

* Use TanStack Query for all server state.
* Queries should be colocated inside feature folders.
* Do not manually manage loading/error states when React Query provides them.
* Use query keys consistently.
* Mutations must use useMutation.

## File Creation Policy

Before creating a new file:

1. Search existing components.
2. Search existing hooks.
3. Search existing types.
4. Search existing stores.

Create new files only if no suitable implementation exists.
## Component Placement Rules

Before creating a component, classify it into one of three levels:

### 1. UI Component

Place in `components/ui` only if:

- It is generic and reusable across the whole app.
- It has no business logic.
- It does not know about domain entities such as booking, user, provider, service, payment, or verification.
- It only receives generic props such as label, value, error, variant, disabled, children, onClick.

Examples:

- Button
- Input
- Textarea
- Select
- Dialog
- Card
- Table
- Badge
- FormError
- Pagination

### 2. Common Component

Place in `components/common` only if:

- It is reused by multiple features.
- It contains shared business UI or shared application patterns.
- It is not tied to only one feature folder.

Examples:

- PageHeader
- ActionBar
- ConfirmDialog
- StatusBadge
- EmptyState
- ErrorState
- LoadingState
- SearchFilterBar

Do not place feature-specific forms or tables in `components/common`.

### 3. Feature Component

Place in `features/[feature]/components` if:

- It belongs to one business feature.
- It uses feature-specific schema, query, mutation, or types.
- It contains business logic.
- It displays or edits a domain entity.
- It is used by only one feature.

Examples:

- LoginForm
- RegisterProviderForm
- ServiceForm
- ServiceTable
- BookingTable
- VerificationActions
- BusinessProfileForm
- PromotionForm
- DisputeResolutionForm