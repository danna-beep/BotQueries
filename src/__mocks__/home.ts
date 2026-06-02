import mock from '@/utils/mock'
import { mockEmployees } from './data/home'
import type { IEmployee } from '@/types/employee'

const employees = [...mockEmployees]

// GET /employees — list with optional query params (search, active, page, size)
mock.onGet(/\/employees(\?|$)/).reply((config) => {
  const params = new URLSearchParams(config.url?.split('?')[1] ?? '')
  const search = params.get('search')?.toLowerCase() ?? ''
  const activeFilter = params.get('active')
  const page = Number(params.get('page') ?? '0')
  const size = Number(params.get('size') ?? '10')

  let filtered = [...employees]

  if (search) {
    filtered = filtered.filter(
      (e) =>
        e.firstName.toLowerCase().includes(search) ||
        e.lastName.toLowerCase().includes(search) ||
        e.position.toLowerCase().includes(search),
    )
  }

  if (activeFilter !== null && activeFilter !== '') {
    const isActive = activeFilter === 'true'
    filtered = filtered.filter((e) => e.active === isActive)
  }

  const total = filtered.length
  const start = page * size
  const data = filtered.slice(start, start + size)

  console.log('[MOCK] GET /employees', { search, activeFilter, page, size, total })
  return [200, { data, total }]
})

// GET /employees/:id — single employee
mock.onGet(/\/employees\/\d+$/).reply((config) => {
  const id = config.url?.match(/\/employees\/(\d+)/)?.[1]
  const employee = employees.find((e) => e.id === id)

  if (!employee) {
    return [404, { message: 'Employee not found' }]
  }

  console.log('[MOCK] GET /employees/:id', { id })
  return [200, employee]
})

// POST /employees — create
mock.onPost('/employees').reply((config) => {
  const payload = JSON.parse(config.data) as Omit<IEmployee, 'id'>
  const newEmployee: IEmployee = {
    ...payload,
    id: String(Date.now()),
  }
  employees.push(newEmployee)

  console.log('[MOCK] POST /employees', newEmployee)
  return [201, newEmployee]
})

// PUT /employees/:id — update
mock.onPut(/\/employees\/\d+$/).reply((config) => {
  const id = config.url?.match(/\/employees\/(\d+)/)?.[1]
  const payload = JSON.parse(config.data) as Partial<IEmployee>
  const index = employees.findIndex((e) => e.id === id)

  if (index === -1) {
    return [404, { message: 'Employee not found' }]
  }

  employees[index] = { ...employees[index], ...payload }

  console.log('[MOCK] PUT /employees/:id', { id, payload })
  return [200, employees[index]]
})

// DELETE /employees/:id — delete
mock.onDelete(/\/employees\/\d+$/).reply((config) => {
  const id = config.url?.match(/\/employees\/(\d+)/)?.[1]
  const index = employees.findIndex((e) => e.id === id)

  if (index === -1) {
    return [404, { message: 'Employee not found' }]
  }

  employees.splice(index, 1)

  console.log('[MOCK] DELETE /employees/:id', { id })
  return [200, { success: true }]
})

// GET /employees/:id/file — download legajo (mock blob)
mock.onGet(/\/employees\/\d+\/file$/).reply((config) => {
  const id = config.url?.match(/\/employees\/(\d+)/)?.[1]
  const employee = employees.find((e) => e.id === id)

  if (!employee) {
    return [404, { message: 'Employee not found' }]
  }

  const content = `LEGAJO - ${employee.firstName} ${employee.lastName}\n\nPuesto: ${employee.position}\nEdad: ${employee.age}\nFecha ingreso: ${employee.startDate}\nActivo: ${employee.active ? 'Sí' : 'No'}\n`
  const blob = new Blob([content], { type: 'text/plain' })

  console.log('[MOCK] GET /employees/:id/file', { id })
  return [200, blob, { 'Content-Type': 'application/octet-stream' }]
})
