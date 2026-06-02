# Hook Conventions

Patterns for custom React hooks in `src/hooks/` and `src/views/*/hooks/`.

## Hook Categories

| Category | Naming | Location | Purpose |
|----------|--------|----------|---------|
| Data fetching | `use[Entity].ts` | View hooks | React Query queries for a view |
| Mutations/actions | `use[Entity]Actions.ts` | View hooks | React Query mutations for a view |
| View state | `use[View]View.ts` | View hooks | UI state (filters, pagination, modals) |
| Shared utility | `use[Name].ts` | `src/hooks/` | Cross-view reusable logic |
| Complex state | `[name]Reducer.ts` + `[name]Actions.ts` | View hooks | useReducer-based state management |

## React Query Patterns

### Queries

```typescript
const instructionsQuery = useQuery({
  queryKey: ['instructions', page, size, filters],
  queryFn: () => homeService.getInstructions(page, size, filters),
})
```

- **Query keys** are arrays starting with a string identifier, followed by parameters
- **queryFn** calls the service layer (never inline API calls)

### Mutations

```typescript
const uploadMutation = useMutation({
  mutationFn: (file: File) => homeService.uploadBulk(trustId, file),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['instructions'] })
  },
  onError: (error) => {
    onHandleError(error)
  },
})
```

- **onSuccess**: Invalidate related query keys to refetch stale data
- **onError**: Use `onHandleError` from `useErrorHandler()` for toast notifications

## Hook Return Pattern

Hooks return an object with `action`, `state`, and/or `data` keys:

```typescript
export const useHomeView = () => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState<IInstructionFilters>({})

  return {
    state: { viewMode, page, filters },
    action: { setViewMode, setPage, setFilters },
  }
}
```

## Shared Hooks

### `useTranslation()`
Wraps `react-i18next` with a simplified API:
```typescript
const { t, onChangeLanguage, currentLanguage } = useTranslation()
```

### `useErrorHandler()`
Centralized HTTP error handling via toast:
```typescript
const { onHandleError } = useErrorHandler()
```

### `useDebounce(value, delay)`
Debounces a value for search inputs.

## useReducer Pattern (Complex State)

For views with complex state transitions (e.g., ManualUpload):

```typescript
// manualUploadReducer.ts
type Action = { type: 'SET_STEP'; step: number } | { type: 'SET_ACCOUNTS'; accounts: IAccount[] }

const manualUploadReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_STEP': return { ...state, step: action.step }
    // ...
  }
}

// manualUploadActions.ts - action creators
export const setStep = (step: number): Action => ({ type: 'SET_STEP', step })
```

## Do / Don't

| Do | Don't |
|----|-------|
| Name query keys consistently as `['entity', ...params]` | Use random or inconsistent query key strings |
| Invalidate related queries on mutation success | Manually refetch or set query data after mutations |
| Use `useErrorHandler()` for mutation errors | Handle errors individually in every mutation |
| Keep hooks focused (one responsibility) | Create god-hooks that manage everything |
| Colocate view-specific hooks inside the view folder | Put single-use hooks in the shared `src/hooks/` folder |
