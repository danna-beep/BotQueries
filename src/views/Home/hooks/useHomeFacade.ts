import { useEmployees } from './useHome'
import { useEmployeeActions } from './useHomeActions'
import { useHomeView } from './useHomeView'
import { useDebounce } from '@/hooks'

export const useHomeFacade = () => {
  const view = useHomeView()
  const debouncedSearch = useDebounce(view.state.search, 400)

  const { employees, total, isLoading, isError } = useEmployees({
    search: debouncedSearch,
    active: view.state.activeFilter,
    page: view.state.page,
    size: view.state.pageSize,
  })

  const actions = useEmployeeActions()

  return {
    action: {
      ...view.action,
      ...actions,
    },
    state: {
      ...view.state,
    },
    data: {
      employees,
      total,
      isLoading,
      isError,
      totalPages: Math.ceil(total / view.state.pageSize),
    },
  }
}
