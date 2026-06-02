# Code Style

Naming, formatting, and linting rules enforced in this project.

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Component files | PascalCase | `AccountCard.tsx` |
| Component folders | PascalCase | `AccountCard/` |
| Hook files | camelCase with `use` prefix | `useHome.ts` |
| Service files | camelCase | `homeService.ts`, `restClient.ts` |
| Type files | PascalCase or camelCase | `Instruction.ts`, `createAccount.ts` |
| Utility files | camelCase | `dateFormatter.ts`, `httpClient.ts` |
| Barrel exports | Always `index.ts` | `components/index.ts` |
| Interfaces | PascalCase with `I` prefix | `IAccount`, `IInstructionFilters` |
| Component props | PascalCase with `Props` suffix | `AccountCardProps` |
| Constants | UPPER_SNAKE_CASE | `ADMIN_ROLE`, `MEXICO_COUNTRY_ID` |
| Enum-like values | PascalCase | `InstructionStatusValues` |
| Functions/variables | camelCase | `onHandleError`, `instructionsQuery` |

## Formatting (Prettier)

| Rule | Value |
|------|-------|
| Print width | 100 |
| Tab width | 2 spaces |
| Semicolons | No |
| Quotes | Single quotes |
| JSX quotes | Single quotes |
| Trailing comma | ES5 |
| Arrow parens | Always |
| Bracket spacing | Yes |
| End of line | LF |

## Linting (ESLint)

- Flat config format (`eslint.config.js`)
- Extends: `@eslint/js` recommended, `typescript-eslint` recommended, `react-hooks`, `react-refresh`, `prettier`
- Target: ES2020, browser globals
- TypeScript strict mode enabled (`noUnusedLocals`, `noUnusedParameters`)

## Import Style

- Use path alias `@/` for all `src/` imports:
  ```typescript
  import { AccountCard } from '@/components'
  import { useTranslation } from '@/hooks'
  import { homeService } from '@/services/home'
  ```
- Barrel exports (`index.ts`) are used for `components/` and `views/`
- Direct file imports for services, utils, and types

## Do / Don't

| Do | Don't |
|----|-------|
| Use `@/` path alias for all src imports | Use relative paths like `../../components` |
| Prefix interfaces with `I` | Use `type` keyword for object shapes that will be extended |
| Use `cn()` utility for conditional Tailwind classes | Concatenate className strings manually |
| Export component as default from `.tsx`, re-export from `index.ts` | Export component only as named export |
| Use `useTranslation()` for all user-facing strings | Hardcode text in components |
