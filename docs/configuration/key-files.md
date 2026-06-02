# Key Files

Important files an agent should know about when working on this project.

## Entry Points

| File           | Purpose                                                                          |
| -------------- | -------------------------------------------------------------------------------- |
| `src/main.tsx` | React DOM entry point; composes all providers (QueryClient, Auth, Theme, Router) |
| `src/App.tsx`  | Root component with Suspense boundary and Loader fallback                        |
| `index.html`   | HTML entry point; Vite injects the bundle here                                   |

## Routing

| File                             | Purpose                                                |
| -------------------------------- | ------------------------------------------------------ |
| `src/routes/routes.tsx`          | Main router configuration with lazy-loaded views       |
| `src/routes/PrivateRoute.tsx`    | Authentication guard (redirects unauthenticated users) |
| `src/routes/RoleBasedRoutes.tsx` | Renders user or admin routes based on Keycloak role    |
| `src/routes/userRoutes.tsx`      | Route definitions for regular users                    |
| `src/routes/boRoutes.tsx`        | Route definitions for back-office admins               |

## Authentication

| File                       | Purpose                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `src/auth/keycloak.ts`     | Keycloak instance initialization                                |
| `src/auth/AuthContext.tsx` | React context providing auth state, login/logout, role checking |

## API Layer

| File                         | Purpose                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| `src/services/restClient.ts` | Axios instance with token injection and error interceptors |
| `src/services/base.ts`       | `BaseService` class with typed CRUD methods                |

## Configuration

| File                 | Purpose                                                 |
| -------------------- | ------------------------------------------------------- |
| `vite.config.ts`     | Build config, path aliases, dev server proxy            |
| `tsconfig.app.json`  | TypeScript config (strict mode, path aliases)           |
| `eslint.config.js`   | ESLint flat config                                      |
| `.prettierrc`        | Prettier formatting rules                               |
| `tailwind.config.js` | Tailwind CSS config (extends viplay-ui CSS vars)        |
| `Dockerfile`         | Multi-stage Docker build (Node 22 Alpine + http-server) |
| `Makefile`           | Terraform plan/apply shortcuts for deployment           |

## Internationalization

| File                                      | Purpose                                          |
| ----------------------------------------- | ------------------------------------------------ |
| `src/i18n/index.ts`                       | i18next initialization and configuration         |
| `src/i18n/locales/en/translation.json`    | English translations (source of truth)           |
| `src/i18n/locales/es/translation.json`    | Spanish translations                             |
| `public/locales/{en,es}/translation.json` | Public copies (synced via `npm run i18n:update`) |
