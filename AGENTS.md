# AGENTS.md

React 18 + TypeScript SPA for the Vaas-Playground. Built with Vite, Tailwind CSS, Keycloak auth, TanStack React Query, and the `@getvaas/viplay-ui` component library.

## Key Commands

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `npm run dev`         | Start Vite dev server with HMR      |
| `npm run build`       | Type-check and build for production |
| `npm run build:dev`   | Build with dev environment          |
| `npm run build:stage` | Build with staging environment      |
| `npm run lint`        | Run ESLint                          |
| `npm run lint:fix`    | Auto-fix lint errors                |
| `npm run format`      | Format with Prettier                |
| `npm run test`        | Run Vitest                          |
| `npm run i18n:scan`   | Extract translation keys            |
| `npm run i18n:update` | Sync translation files to public/   |

## Before Modifying Code

Read the relevant documentation based on what you're about to do:

| What you need to understand               | Read these docs                       |
| ----------------------------------------- | ------------------------------------- |
| Architecture rules and layer boundaries   | `docs/architecture/`                  |
| Code style, naming, and formatting        | `docs/code/code-style.md`             |
| Component conventions                     | `docs/code/components/conventions.md` |
| Service layer conventions                 | `docs/code/services/conventions.md`   |
| Hook conventions and React Query patterns | `docs/code/hooks/conventions.md`      |
| View/page conventions                     | `docs/code/views/conventions.md`      |
| Business domain and terminology           | `docs/business/`                      |
| Environment variables and config          | `docs/configuration/`                 |
| How to run, build, and deploy             | `docs/how-to-run/`                    |

To identify which files are relevant inside each folder, check the file names — they are self-descriptive.
