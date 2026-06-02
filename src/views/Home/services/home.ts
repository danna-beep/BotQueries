import BaseService from '@/services/base'
import restClient from '@/services/restClient'
import type { IEmployee, IEmployeesResponse, IEmployeePayload } from '@/types/employee'

class EmployeeService extends BaseService {
  getEmployees = (params: { search?: string; active?: string; page?: number; size?: number }) => {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.active !== undefined && params.active !== '') query.set('active', params.active)
    query.set('page', String(params.page ?? 0))
    query.set('size', String(params.size ?? 10))
    return this.get<IEmployeesResponse>(`/employees?${query.toString()}`)
  }

  getEmployee = (id: string) => {
    return this.get<IEmployee>(`/employees/${id}`)
  }

  createEmployee = (data: IEmployeePayload) => {
    return this.post<IEmployee>('/employees', data)
  }

  updateEmployee = (id: string, data: IEmployeePayload) => {
    return this.put<IEmployee>(`/employees/${id}`, data)
  }

  deleteEmployee = (id: string) => {
    return this.del<{ success: boolean }>(`/employees/${id}`)
  }

  downloadFile = (id: string) => {
    return restClient.get(`/employees/${id}/file`, { responseType: 'blob' })
  }
}

export default new EmployeeService()
