# PROJECT RULES

## General Principles

- Always follow existing folder structure.
- Never create duplicate components if a reusable component already exists.
- Reuse code before creating new code.
- Follow Feature-Based Architecture.

## Next.js Rules

- Use Server Components by default.
- Only add "use client" when required.
- Never place business logic inside page.tsx.
- page.tsx should compose feature components only.

## Component Rules

- One component = one responsibility.
- Shared UI belongs in components/ui.
- Shared business components belong in components/common.
- Layout components belong in components/layout.

## Feature Rules

Each feature should contain:

features/[feature]/

- components/
- queries.ts
- schema.ts

Business logic must stay inside feature folders.

## API Rules

- Never call fetch directly.
- Always use configured axios instance from lib/axios.ts.
- Always use SWR hooks for server data.

## Form Rules

- Use React Hook Form.
- Use Zod validation schema.
- Validation schema must be stored in schema.ts.

## Type Rules

- Avoid using any.
- Create types in /types.
- Shared DTOs belong in types/api.ts.

## Styling Rules

- Reuse existing design system.
- Do not introduce new color systems.
- Use existing spacing and typography.

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
stores/

Server state:
SWR

Avoid local duplication of server state.

## File Creation Policy

Before creating a new file:

1. Search existing components.
2. Search existing hooks.
3. Search existing types.
4. Search existing stores.

Create new files only if no suitable implementation exists.
