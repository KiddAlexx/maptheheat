---
name: vitest-rtl
description: Write unit and component tests with Vitest and React Testing Library. Use when writing, reviewing, or running tests.
---

# Vitest + React Testing Library

We use Vitest for unit and integration tests and React Testing Library (RTL) for component
tests. Tests live in `tests/` mirroring the `src/` feature structure.

## Core Philosophy

- Test **behaviour**, not implementation — what a user sees and does, not internal state
- Prefer `getByRole` and `getByLabelText` over `getByTestId` — they test accessibility too
- Unit test pure functions exhaustively; component test interactive behaviour
- One test file per module or component

## Project Test Setup

- `tests/setup.tsx` — global mocks: Supabase client, `matchMedia`, `SVG.getBBox`
- `tests/AllProviders.tsx` — wraps components with all required providers; always use this when rendering components
- `tests/mocks/` — MSW handlers + `@mswjs/data` factories with Faker for test data
- Run a single file: `npm test -- tests/features/venues/VenueCard.test.tsx`

## Unit Testing Pure Functions

Utility functions like slug helpers and date formatters should be tested exhaustively:

```ts
import { describe, it, expect } from 'vitest'
import { buildVenueSlug } from '@/utils/slugHelpers'

describe('buildVenueSlug', () => {
  it('lowercases and hyphenates the name', () => {
    expect(buildVenueSlug('The Spicy Bowl')).toBe('the-spicy-bowl')
  })
  it('handles special characters', () => {
    expect(buildVenueSlug("Mario's")).toBe('marios')
  })
})
```

## Component Testing with RTL

Always wrap renders in `AllProviders` from `tests/AllProviders.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AllProviders from 'tests/AllProviders'
import { VenueCard } from '@/features/venues/components/VenueCard'
import { mockVenue } from 'tests/mocks/factories'

describe('VenueCard', () => {
  it('renders venue name', () => {
    render(<VenueCard venue={mockVenue} />, { wrapper: AllProviders })
    expect(screen.getByRole('heading', { name: mockVenue.name })).toBeInTheDocument()
  })

  it('calls onFavourite when button is clicked', () => {
    const onFavourite = vi.fn()
    render(<VenueCard venue={mockVenue} onFavourite={onFavourite} />, { wrapper: AllProviders })
    fireEvent.click(screen.getByRole('button', { name: /favourite/i }))
    expect(onFavourite).toHaveBeenCalledWith(mockVenue.id)
  })
})
```

## Mocking API Calls

Use MSW handlers (in `tests/mocks/`) to intercept network requests — do not `vi.mock` the
service layer directly. Factories from `@mswjs/data` with Faker provide realistic test data.

## Query Priority — Always Follow This Order

1. `getByRole` — most accessible, checks ARIA roles
2. `getByLabelText` — for form inputs
3. `getByPlaceholderText` — only when label is unavailable
4. `getByText` — for visible text content
5. `getByDisplayValue` — for form values
6. `getByTestId` — last resort only; adds no accessibility value

Never use `getByTestId` when a semantic query works.

## Testing Async Behaviour

Use `findBy*` for elements that appear asynchronously:

```ts
// ✅ Waits for element to appear
const error = await screen.findByRole('alert')

// ❌ Will fail if element isn't immediately present
const error = screen.getByRole('alert')
```

Use `waitFor` for assertions that depend on async state changes:

```ts
await waitFor(() => {
  expect(screen.getByText('Venue saved')).toBeInTheDocument()
})
```

## Testing Forms

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('shows validation error for empty name', async () => {
  const user = userEvent.setup()
  render(<AddVenueForm />, { wrapper: AllProviders })

  await user.click(screen.getByRole('button', { name: /submit/i }))

  expect(screen.getByRole('alert')).toHaveTextContent('Name is required')
})
```

Always use `userEvent` over `fireEvent` for realistic user interactions (typing, clicking).

## Rules for This Project

- Tests live in `tests/` mirroring `src/` — `tests/features/venues/VenueCard.test.tsx` mirrors `src/features/venues/components/VenueCard.tsx`
- Always render with `AllProviders` wrapper
- Use MSW handlers for API mocking — do not mock service modules directly
- Use `userEvent` not `fireEvent` for simulating user interactions
- No step is done if it causes previously passing tests to fail
