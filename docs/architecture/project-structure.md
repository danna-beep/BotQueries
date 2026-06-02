# Project Structure

Standalone frontend SPA playground. This is a self-contained project with no backend, no Docker, no CI/CD, and no infrastructure config.

## Top-Level Layout

```
vaas-playground/
├── .claude/             # Claude Code config
├── .husky/              # Git pre-commit hooks
├── build/               # Production build output
├── docs/                # Project documentation (this folder)
├── public/              # Static assets (locales, icons)
├── src/                 # Application source code
├── .env.local           # Local environment variables
├── eslint.config.js     # ESLint flat config
├── tailwind.config.js   # Tailwind CSS config
├── vite.config.ts       # Vite build & dev server config
├── vitest.config.ts     # Vitest test runner config
├── tsconfig.json        # Root TS config (project references)
├── tsconfig.app.json    # App TS config (excludes tests)
├── tsconfig.test.json   # Test TS config (test files only)
└── tsconfig.node.json   # Node/build TS config
```

## Source Code (`src/`)

```
src/
├── __mocks__/           # Global mock data and handlers for testing
│   ├── data/            # Shared mock fixtures (typed)
│   │   ├── home.ts
│   │   └── utils.tsx
│   ├── home.ts          # Mock handlers
│   └── index.ts         # Barrel export
├── assets/              # SVGs, images
├── auth/                # Keycloak integration
│   ├── AuthContext.tsx   # Auth React context provider
│   ├── keycloak.ts      # Keycloak instance init
│   └── useAuth.ts       # Auth hook (roles, user, logout)
├── components/          # Shared reusable UI components
│   ├── Layout/
│   ├── NavigationMenu/
│   ├── ThemeProvider/
│   ├── UserMenu/
│   └── index.ts         # Barrel export
├── hooks/               # Shared custom React hooks
│   ├── useDebounce.ts
│   ├── useTranslation.ts
│   └── index.ts
├── i18n/                # Internationalization (en, es)
│   ├── index.ts
│   └── locales/{en,es}/translation.json
├── routes/              # Route definitions & guards
│   ├── routes.tsx       # Main router config
│   ├── PrivateRoute.tsx # Auth guard
│   ├── RoleBasedRoutes.tsx
│   ├── userRoutes.tsx   # Regular user routes
│   └── boRoutes.tsx     # Back-office admin routes
├── services/            # API client layer
│   ├── base.ts          # BaseService class (generic CRUD)
│   └── restClient.ts    # Axios instance + interceptors
├── test/                # Test infrastructure
│   └── setup.ts         # Vitest global setup (mocks, polyfills)
├── types/               # Shared TypeScript interfaces
│   ├── employee.ts
│   └── index.ts         # Barrel export
├── utils/               # Helper utilities
│   ├── exampleUtil.ts
│   └── mock.ts          # Pre-configured AxiosMockAdapter instance
├── views/               # Page-level feature containers
│   └── Home/            # Employee CRUD playground view
├── App.tsx              # Root component with Suspense
├── main.tsx             # Entry point with provider composition
└── index.css            # Global Tailwind styles
```

## View Internal Structure

Each view follows this pattern (example: `Home`):

```
views/Home/
├── Home.tsx                # Main page component (orchestrator)
├── index.tsx               # Barrel export
├── __tests__/
│   └── Home.spec.tsx       # View-level integration tests
├── hooks/
│   ├── useHome.ts          # Core data fetching (queries)
│   ├── useHomeActions.ts   # Mutations (create, update, delete, download)
│   ├── useHomeView.ts      # UI state (filters, pagination, dialogs)
│   ├── useHomeFacade.ts    # Facade combining queries + actions + UI state
│   └── index.ts
├── components/
│   ├── EmployeeTable/      # Table display
│   ├── EmployeeFilters/    # Search + status filters
│   ├── EmployeeFormDialog/ # Create/edit form dialog
│   ├── DeleteEmployeeDialog/
│   └── index.ts
├── services/
│   └── home.ts             # View-specific API calls
└── utils/
    └── formatCard.tsx       # View-specific helpers
```
