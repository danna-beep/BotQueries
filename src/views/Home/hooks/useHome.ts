import { useQuery } from '@tanstack/react-query'
import employeeService from '../services/home'

interface UseEmployeesParams {
  search: string
  active: string
  page: number
  size: number
}

export const useEmployees = (params: UseEmployeesParams) => {
  const employeesQuery = useQuery({
    queryKey: ['employees', params.search, params.active, params.page, params.size],
    queryFn: () => employeeService.getEmployees({ ...params, page: params.page - 1 }),
  })

  return {
    employees: employeesQuery.data?.data ?? [],
    total: employeesQuery.data?.total ?? 0,
    isLoading: employeesQuery.isLoading,
    isError: employeesQuery.isError,
  }
}
