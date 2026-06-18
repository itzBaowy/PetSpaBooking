# SYSTEM ARCHITECTURE

## High Level Flow

UI
↓
Feature Components
↓
SWR Hooks
↓
Axios Client
↓
Backend API

---

## Layer Responsibilities

### app/

Routing only.

Responsibilities:

- Route definition
- Layout composition
- Route grouping

Must NOT contain:

- Business logic
- API calls
- Validation logic

---

### features/

Contains feature-specific business logic.

Examples:

features/provider/services

features/provider/bookings

features/admin/users

Responsibilities:

- Forms
- Tables
- Feature components
- Validation schemas
- SWR hooks

---

### components/

Reusable UI layer.

components/ui

Generic reusable UI.

components/common

Reusable business components.

components/layout

Layout components.

---

### hooks/

Reusable hooks.

Examples:

- usePagination
- useUpload
- usePermission

---

### stores/

Client state only.

Examples:

- Auth state
- UI state
- Filters

Do not store server data here.

---

### lib/

Infrastructure layer.

Examples:

- Axios
- Auth
- RBAC
- Utilities

---

### types/

Global types.

Feature-specific types should stay close to feature.

Shared types belong here.

---

## Data Flow

User Action
↓
Feature Component
↓
Validation (Zod)
↓
SWR Mutation
↓
Axios
↓
API
↓
SWR Cache Update
↓
UI Refresh
