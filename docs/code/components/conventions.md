# Component Conventions

Patterns and rules for creating and organizing React components in `src/components/`.

## Folder Structure

Every component lives in its own PascalCase folder with a barrel export:

```
components/
└── AccountCard/
    ├── AccountCard.tsx    # Component implementation
    └── index.ts           # Re-exports: export { default } from './AccountCard'
```

If a component has sub-components:

```
components/
└── FiltersSidebar/
    ├── FiltersSidebar.tsx
    ├── FilterGroup.tsx    # Internal sub-component
    └── index.ts
```

## Component Pattern

```typescript
import { useTranslation } from '@/hooks'

export interface AccountCardProps {
  account: IAccount
  badges?: ReactNode[]
  isSelected?: boolean
  onClick?: () => void
}

const AccountCard = ({ account, badges = [], isSelected, onClick }: AccountCardProps) => {
  const { t } = useTranslation()

  return (
    <Card className={cn('cursor-pointer', isSelected && 'border-primary')}>
      {/* ... */}
    </Card>
  )
}

export default AccountCard
```

Key points:
- **Functional components only** (no class components)
- **Props interface** defined and exported above the component
- **Default export** for the component itself
- **Destructure props** in the function signature with defaults where appropriate
- **`useTranslation()`** for all user-facing text

## Styling

- Use Tailwind CSS utility classes directly in JSX
- Use `cn()` from `@/utils/tailwind` for conditional classes:
  ```typescript
  <div className={cn('flex gap-2', isActive && 'bg-primary/10')} />
  ```
- Use CSS custom variables from viplay-ui for brand colors (`--primary`, `--radius`, etc.)
- Define color variant maps for dynamic styling:
  ```typescript
  const colorClasses: Record<ColorVariant, { wrapper: string; icon: string }> = {
    info: { wrapper: 'bg-info/15', icon: 'text-info' },
    success: { wrapper: 'bg-success/15', icon: 'text-success' },
  }
  ```

## UI Library Usage

Import presentational primitives from `@getvaas/viplay-ui`:

```typescript
import { Card, CardContent, Button, Dialog, DialogContent, Typography, Loader } from '@getvaas/viplay-ui'
```

Import shared domain types from `@getvaas/trustee-commons`:

```typescript
import { IInstruction, InstructionStatusValues } from '@getvaas/trustee-commons'
```

## Do / Don't

| Do | Don't |
|----|-------|
| Keep components focused on presentation | Put API calls directly in components |
| Accept data and callbacks via props | Import services inside shared components |
| Use viplay-ui primitives (Card, Button, Dialog) | Recreate UI primitives from scratch |
| Extract complex logic into custom hooks | Write long `useEffect` chains inside components |
| Use `t()` for all visible text | Hardcode strings in JSX |
