# AGENTS.md

This file defines how to work in this codebase. Follow it strictly when making changes.

---

## Project Overview

**MapTheHeat** is a venue discovery and review app built with:

- React 18 + TypeScript + Vite
- Supabase (PostgreSQL, Auth, Storage)
- Tailwind CSS + HeroUI component library

---

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint (zero warnings allowed)
npm run checks       # lint + typecheck
npm run ci           # lint + typecheck + build
npm test             # Vitest test runner
npm run test:ui      # Vitest UI dashboard
```

---

## Working Rules

- Make the **smallest possible change** to achieve the goal
- Prefer **editing existing files** over creating new ones
- Do not introduce new patterns if an existing one already solves the problem
- Do not refactor unrelated code
- Keep changes scoped to a single feature
- Ask before making **architectural changes**

---

## Layer Structure

| Layer     | Location                     | Notes                                                       |
| --------- | ---------------------------- | ----------------------------------------------------------- |
| Pages     | `src/pages/`                 | Route-level components                                      |
| Features  | `src/features/`              | `authentication`, `map`, `reviews`, `userProfile`, `venues` |
| Shared UI | `src/components/`, `src/ui/` | `components/` = composite, `ui/` = primitives               |
| Services  | `src/services/`              | Supabase wrappers — one file per domain                     |
| Context   | `src/context/`               | Client-only UI state via useReducer                         |
| Types     | `src/types/`                 | Shared TypeScript interfaces                                |
| Utils     | `src/utils/`                 | Pure helpers (dates, images, slugs)                         |

---

## State Management — STRICT

Two patterns only. **Never mix them for the same data.**

### Server state → React Query

- All API data: venues, reviews, profiles
- Default `staleTime: 60_000`
- Always accessed via custom hooks, never directly in components

### Client state → React Context + useReducer

- UI-only state: `VenueFilterContext`, `ReviewSortContext`, `ModalContext`, `UIContext`, `AuthContext`, `UserReviewsContext`, `UserFavVenuesContext`

### Hard rules

- Never put server data in Context
- Never fetch from Supabase directly inside a component
- Never use Context for data that comes from the API

---

## Service Layer — STRICT

All backend interaction goes through `src/services/`. No exceptions.

- Components never call Supabase directly
- Each domain has its own service file
- All data transformation (snake_case → camelCase) happens at the service boundary via `camelcase-keys` / `decamelize-keys`
- Query building (filters, sorting, pagination) assembled in services using `VenuesRequestParams` / `VenuesResponse` interfaces

---

## Routing

- React Router v6, slug-based URLs — **never use numeric IDs in URLs**
- Slugs derived via utilities in `src/utils/`
- Lazy-loaded route components
- Auth-protected routes via `src/components/ProtectedRoute.tsx`

---

## Database

Schema: `supabase/schema.sql`

- Moderation: content has `status: pending | approved`
- **Always filter by `status = 'approved'` in public-facing queries** — never return pending content to non-admin users
- Max 2 pending venues/reviews per user (enforced at DB level)
- Row Level Security (RLS) enabled on all tables
- User notifications in a dedicated table

---

## Styling

- Tailwind CSS + HeroUI — **use HeroUI components before building from scratch**
- Never import HeroUI or Tailwind inside service files
- Theme: `tailwind.config.js`, CSS variables: `src/index.css`

---

## File Placement

- Do not create new folders unless genuinely necessary
- Place new code inside the relevant existing feature directory
- Reuse existing components before creating new ones
- Pure helpers → `src/utils/`
- API logic → `src/services/`
- Shared UI primitives → `src/ui/`
- Shared composite components → `src/components/`

---

## Testing

Tests live in `tests/` mirroring `src/` structure.

- `tests/setup.tsx` — global mocks (Supabase, matchMedia, SVG.getBBox)
- `tests/AllProviders.tsx` — wraps components with all providers
- `tests/mocks/` — MSW handlers + `@mswjs/data` factories (Faker for test data)
- Run a single file: `npm test -- tests/features/venues/VenueCard.test.tsx`

### Rules

- Add tests for all new logic
- Add regression tests for bug fixes
- Test behavior, not implementation details
- Use existing test utilities — do not add new testing dependencies

---

## Definition of Done — MANDATORY

Before marking any task complete:

1. Run `npm run checks` (lint + typecheck — zero warnings)
2. Run relevant tests (`npm test`)
3. Remove unused imports and dead code
4. Add or update tests if behavior changed
