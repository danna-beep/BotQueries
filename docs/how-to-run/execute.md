# How to Run

Commands to start, build, and operate the project.

## Prerequisites

- Node.js (see `.nvmrc` for version)
- npm (comes with Node.js)
- Access to `@getvaas` private npm packages (configured via `.npmrc` + `GITHUB_TOKEN`)

## Install Dependencies

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the Vite dev server with:

- Hot module replacement
- Proxy for `/bff` to the dev backend (`https://dev-fo-trustee-portal.app.getvaas.com`)
- Environment variables from `.env.local` (if present) or `.env.dev`

## Build

```bash
npm run build           # Production build (default)
npm run build:dev       # Build with .env.dev
npm run build:stage     # Build with .env.stage
npm run build:prod      # Build with .env.prod
```

All builds run `tsc -b` (type check) then `vite build`. Output goes to `build/`.

## Lint & Format

```bash
npm run lint            # Check for linting errors
npm run lint:fix        # Auto-fix linting errors
npm run format          # Format all files with Prettier
npm run format:check    # Check formatting without modifying
```

## Internationalization

```bash
npm run i18n:scan       # Extract translation keys from source code
npm run i18n:update     # Sync src/i18n/locales/ to public/locales/
```

## Tests

```bash
npm run test            # Run all tests with Vitest
```

### This is a playground — there is no backend

This project is a **frontend-only playground**. There is no running backend to test against. All API interactions must be fully mocked in tests. **Never** make real HTTP requests during test execution.

### Mocking strategy

Tests use a two-layer mocking approach:

#### 1. Global mock layer (`src/test/setup.ts`)

The Vitest setup file provides baseline mocks that prevent any accidental network call:

- **`restClient`** — the shared Axios instance is globally mocked so every HTTP method (`get`, `post`, `put`, `patch`, `delete`) resolves with `{ data: {} }` by default. This catches any unmocked background request.
- **`keycloak`** — mocked to prevent auth-related side effects.
- **DOM APIs** — `ResizeObserver` and `IntersectionObserver` are polyfilled for jsdom.

#### 2. Per-view mock layer (`__mocks__/` + axios-mock-adapter)

Each view that calls APIs should have a `__mocks__/` folder next to its `__tests__/` folder containing robust mock data and axios-mock-adapter handlers.

**Structure:**

```
views/[ViewName]/
├── __tests__/
│   └── [ViewName].spec.tsx
├── __mocks__/
│   ├── data.ts               # Mock entities (typed, realistic)
│   └── handlers.ts           # axios-mock-adapter route handlers
```

**`data.ts`** — exports typed mock objects that mirror real API responses:

```typescript
import type { IEmployee } from '@/types'

export const MOCK_EMPLOYEES: IEmployee[] = [
  { id: '1', firstName: 'Lucía', lastName: 'Fernández', ... },
  { id: '2', firstName: 'Martín', lastName: 'González', ... },
]
```

**`handlers.ts`** — configures axios-mock-adapter routes against the shared `restClient` instance:

```typescript
import AxiosMockAdapter from 'axios-mock-adapter'
import restClient from '@/services/restClient'
import { MOCK_EMPLOYEES } from './data'

export const setupMockHandlers = (mock?: AxiosMockAdapter) => {
  const adapter = mock ?? new AxiosMockAdapter(restClient, { delayResponse: 100 })

  adapter.onGet('/employees').reply((config) => {
    // Implement filtering, pagination, search from config.params
    return [200, { data: MOCK_EMPLOYEES, total: MOCK_EMPLOYEES.length }]
  })

  adapter.onPost('/employees').reply((config) => {
    const body = JSON.parse(config.data)
    return [201, { id: crypto.randomUUID(), ...body }]
  })

  adapter.onPut(/\/employees\/\w+/).reply(200)
  adapter.onDelete(/\/employees\/\w+/).reply(204)

  return adapter
}
```

**In the test file**, set up and tear down the adapter:

```typescript
import { setupMockHandlers } from '../__mocks__/handlers'

let mockAdapter: AxiosMockAdapter

beforeEach(() => {
  mockAdapter = setupMockHandlers()
})

afterEach(() => {
  mockAdapter.reset()
})
```

### Why this approach

| Concern | Solution |
|---|---|
| No backend available | axios-mock-adapter intercepts at the Axios level — requests never leave the process |
| Realistic test coverage | Mock handlers replicate filtering, pagination, and error responses |
| Shared mock data | `__mocks__/data.ts` is the single source of truth for test fixtures |
| Test isolation | Each test gets a fresh adapter via `beforeEach` / `afterEach` |
| No `vi.spyOn` on services | Mocking at the HTTP layer tests the full service → hook → component chain |

### Key rules

- **Never** rely on a running backend or external service during tests.
- **Always** use `__mocks__/` for mock data and axios-mock-adapter handlers.
- **Keep mock data realistic** — use typed objects that match API contracts.
- **Mock at the HTTP layer** (axios-mock-adapter on `restClient`), not at the service function layer. This ensures services, hooks, and components are all exercised.
- The utility at `src/utils/mock.ts` exports a pre-configured `AxiosMockAdapter` instance bound to `restClient`. You can import it directly or create a fresh one per test suite.
