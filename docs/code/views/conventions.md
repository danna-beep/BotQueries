# View Conventions

Patterns for page-level feature containers in `src/views/`.

## View Structure

Each view follows this standard folder layout:

```
views/[ViewName]/
├── [ViewName].tsx           # Main page component
├── index.tsx                # Barrel export
├── types.ts                 # View-specific types (optional)
├── hooks/
│   ├── use[ViewName].ts     # Core data fetching (queries)
│   ├── use[ViewName]Actions.ts  # Mutations
│   ├── use[ViewName]View.ts     # UI state (optional)
│   └── index.ts             # Barrel export
├── components/              # View-scoped sub-components
│   ├── [SubComponent]/
│   └── index.ts
└── services/                # View-specific API calls (optional)
    └── [serviceName].ts
```

## Main Component Pattern

```typescript
import { useInstruction } from './hooks'
import { InstructionHeader } from './components/InstructionHeader'
import { Sidebar } from './components/Sidebar'

const Instruction = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useInstruction(id!)
  const { t } = useTranslation()

  if (isLoading) return <Loader />

  return (
    <div className='flex flex-col gap-4'>
      <InstructionHeader instruction={data} />
      <div className='flex gap-6'>
        <main className='flex-1'>{/* Main content */}</main>
        <Sidebar instruction={data} />
      </div>
    </div>
  )
}

export default Instruction
```

Key points:
- **Views compose hooks and components** — they are orchestrators, not logic holders
- **Route params** extracted via `useParams()`
- **Loading states** handled at the view level with `<Loader />`
- **Layout** done with Tailwind flex/grid utilities

## Multi-Step Views

For views with wizard-like flows (e.g., ManualUpload), use a step-based pattern:

```typescript
const ManualUpload = () => {
  const [step, setStep] = useState(0)

  return (
    <>
      {step === 0 && <AccountsStep onNext={() => setStep(1)} />}
      {step === 1 && <AmountsStep onNext={() => setStep(2)} onBack={() => setStep(0)} />}
      {step === 2 && <ReviewStep onBack={() => setStep(1)} />}
    </>
  )
}
```

## Barrel Exports

Every view's `index.tsx`:

```typescript
export { default } from './Instruction'
```

Routes use lazy loading via `React.lazy()`:

```typescript
const Instruction = lazy(() => import('@/views/Instruction'))
```

## Do / Don't

| Do | Don't |
|----|-------|
| Keep the main component as an orchestrator | Put business logic directly in the view component |
| Delegate data fetching to hooks | Call services directly from the view component |
| Scope sub-components inside the view folder | Put single-use components in the shared `src/components/` |
| Use lazy loading for route-level views | Import views eagerly |
| Handle loading/error states at the view level | Let child components each handle their own loading |
