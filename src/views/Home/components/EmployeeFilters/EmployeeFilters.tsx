import { Input, InputWrapper, InputStartAdornment, Button, Typography } from '@getvaas/viplay-ui'
import { MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons'
import { useTranslation } from '@/hooks'

export interface EmployeeFiltersProps {
  search: string
  activeFilter: string
  onSearchChange: (value: string) => void
  onActiveFilterChange: (value: string) => void
  onCreateClick: () => void
}

const EmployeeFilters = ({
  search,
  activeFilter,
  onSearchChange,
  onActiveFilterChange,
  onCreateClick,
}: EmployeeFiltersProps) => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <InputWrapper className='w-full sm:w-72'>
          <InputStartAdornment variant='icon'>
            <MagnifyingGlassIcon className='h-4 w-4' />
          </InputStartAdornment>
          <Input
            placeholder={t('employees.filters.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputWrapper>

        <div className='flex items-center gap-2'>
          <Typography variant='p3' className='text-muted-foreground whitespace-nowrap'>
            {t('employees.filters.status')}:
          </Typography>
          <div className='flex gap-1'>
            {[
              { value: '', label: t('employees.filters.all') },
              { value: 'true', label: t('employees.filters.active') },
              { value: 'false', label: t('employees.filters.inactive') },
            ].map((option) => (
              <Button
                key={option.value}
                variant={activeFilter === option.value ? 'primary' : 'secondary'}
                size='s'
                onClick={() => onActiveFilterChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={onCreateClick}>
        <PlusIcon className='h-4 w-4' />
        {t('employees.actions.create')}
      </Button>
    </div>
  )
}

export default EmployeeFilters
