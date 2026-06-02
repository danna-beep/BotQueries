export interface IEmployee {
  id: string
  firstName: string
  lastName: string
  age: number
  position: string
  startDate: string
  active: boolean
  endDate: string | null
}

export interface IEmployeesResponse {
  data: IEmployee[]
  total: number
}

export interface IEmployeePayload {
  firstName: string
  lastName: string
  age: number
  position: string
  startDate: string
  active: boolean
  endDate: string | null
}
