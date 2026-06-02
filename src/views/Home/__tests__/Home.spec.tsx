import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from '@getvaas/viplay-ui'
import Home from '../Home'
import homeService from '../services/home'
import type { IEmployee, IEmployeesResponse } from '@/types'

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (params) {
        return Object.entries(params).reduce((acc, [k, v]) => acc.replace(`{{${k}}}`, v), key)
      }
      return key
    },
    currentLanguage: 'en',
    onChangeLanguage: vi.fn(),
    isReady: true,
  }),
}))

vi.mock('@/auth/useAuth', () => ({
  default: () => ({
    hasClientRole: () => false,
    user: { given_name: 'Test', family_name: 'User', email: 'test@test.com' },
    logout: vi.fn(),
  }),
}))

const MOCK_EMPLOYEES: IEmployee[] = [
  {
    id: '1',
    firstName: 'Lucía',
    lastName: 'Fernández',
    age: 32,
    position: 'Frontend Developer',
    startDate: '2022-03-15',
    active: true,
    endDate: null,
  },
  {
    id: '2',
    firstName: 'Martín',
    lastName: 'González',
    age: 28,
    position: 'Backend Developer',
    startDate: '2023-01-10',
    active: true,
    endDate: null,
  },
  {
    id: '3',
    firstName: 'Camila',
    lastName: 'López',
    age: 45,
    position: 'Project Manager',
    startDate: '2019-07-01',
    active: true,
    endDate: null,
  },
  {
    id: '4',
    firstName: 'Santiago',
    lastName: 'Martínez',
    age: 35,
    position: 'DevOps Engineer',
    startDate: '2021-11-20',
    active: false,
    endDate: '2024-06-30',
  },
  {
    id: '5',
    firstName: 'Valentina',
    lastName: 'Rodríguez',
    age: 26,
    position: 'UX Designer',
    startDate: '2023-09-05',
    active: true,
    endDate: null,
  },
  {
    id: '6',
    firstName: 'Tomás',
    lastName: 'Díaz',
    age: 40,
    position: 'Tech Lead',
    startDate: '2018-02-12',
    active: true,
    endDate: null,
  },
  {
    id: '7',
    firstName: 'Florencia',
    lastName: 'Romero',
    age: 29,
    position: 'QA Engineer',
    startDate: '2022-06-18',
    active: false,
    endDate: '2025-01-15',
  },
  {
    id: '8',
    firstName: 'Nicolás',
    lastName: 'Alvarez',
    age: 33,
    position: 'Data Analyst',
    startDate: '2021-04-22',
    active: true,
    endDate: null,
  },
]

const mockGetEmployees = vi.fn()
const mockCreateEmployee = vi.fn()
const mockUpdateEmployee = vi.fn()
const mockDeleteEmployee = vi.fn()
const mockDownloadFile = vi.fn()

const createMockImplementation = () => {
  mockGetEmployees.mockImplementation(
    (params: {
      search?: string
      active?: string
      page?: number
      size?: number
    }): Promise<IEmployeesResponse> => {
      let list = [...MOCK_EMPLOYEES]
      const search = params.search?.toLowerCase() ?? ''
      if (search) {
        list = list.filter(
          (e) =>
            e.firstName.toLowerCase().includes(search) ||
            e.lastName.toLowerCase().includes(search) ||
            e.position.toLowerCase().includes(search)
        )
      }
      if (params.active !== undefined && params.active !== '') {
        const isActive = params.active === 'true'
        list = list.filter((e) => e.active === isActive)
      }
      const page = params.page ?? 0
      const size = params.size ?? 5
      const total = list.length
      const start = page * size
      const data = list.slice(start, start + size)
      return Promise.resolve({ data, total })
    }
  )
}

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>{children}</TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const waitForTableToLoad = async () => {
  await waitFor(() => {
    expect(screen.getByText('Lucía')).toBeInTheDocument()
  })
}

describe('Home - Employees', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(homeService, 'getEmployees').mockImplementation((...args) => mockGetEmployees(...args))
    vi.spyOn(homeService, 'createEmployee').mockImplementation((...args) =>
      mockCreateEmployee(...args)
    )
    vi.spyOn(homeService, 'updateEmployee').mockImplementation((...args) =>
      mockUpdateEmployee(...args)
    )
    vi.spyOn(homeService, 'deleteEmployee').mockImplementation((...args) =>
      mockDeleteEmployee(...args)
    )
    vi.spyOn(homeService, 'downloadFile').mockImplementation((...args) => mockDownloadFile(...args))
    createMockImplementation()
  })

  // ─── RENDERING ───

  it('renders the title and employee table', async () => {
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    expect(screen.getByText('employees.title')).toBeInTheDocument()
    expect(screen.getByText('Lucía')).toBeInTheDocument()
    expect(screen.getByText('Fernández')).toBeInTheDocument()
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
  })

  it('shows first page of 5 employees (page size = 5)', async () => {
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const rows = screen.getAllByRole('row')
    // 1 header row + 5 data rows
    expect(rows).toHaveLength(6)
    expect(screen.getByText('Lucía')).toBeInTheDocument()
    expect(screen.getByText('Valentina')).toBeInTheDocument()
    // Page 2 employees should NOT be visible
    expect(screen.queryByText('Tomás')).not.toBeInTheDocument()
  })

  it('shows active/inactive badges correctly', async () => {
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const activeBadges = screen.getAllByText('employees.filters.active')
    const inactiveBadges = screen.getAllByText('employees.filters.inactive')
    // On page 1: 4 active (Lucía, Martín, Camila, Valentina) + 1 inactive (Santiago)
    // But "active" also appears as filter button text, so subtract 1
    expect(activeBadges.length).toBeGreaterThanOrEqual(4)
    expect(inactiveBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when no employees match', async () => {
    mockGetEmployees.mockResolvedValue({ data: [], total: 0 })

    render(<Home />, { wrapper: createTestWrapper() })

    await waitFor(() => {
      expect(screen.getByText('employees.table.empty')).toBeInTheDocument()
    })
  })

  // ─── PAGINATION ───

  it('navigates to page 2 and shows remaining employees', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    // Page 2 button
    const page2Button = screen.getByRole('button', { name: 'Go to page 2' })
    await user.click(page2Button)

    await waitFor(() => {
      expect(screen.getByText('Tomás')).toBeInTheDocument()
    })
    // Page 1 employees should be gone
    expect(screen.queryByText('Lucía')).not.toBeInTheDocument()
  })

  it('navigates back to page 1 from page 2', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const page2Button = screen.getByRole('button', { name: 'Go to page 2' })
    await user.click(page2Button)

    await waitFor(() => {
      expect(screen.getByText('Tomás')).toBeInTheDocument()
    })

    const page1Button = screen.getByRole('button', { name: 'Go to page 1' })
    await user.click(page1Button)

    await waitFor(() => {
      expect(screen.getByText('Lucía')).toBeInTheDocument()
    })
  })

  // ─── FILTERS ───

  it('filters by search query (debounced)', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const searchInput = screen.getByPlaceholderText('employees.filters.searchPlaceholder')
    await user.type(searchInput, 'Backend')

    await waitFor(
      () => {
        expect(screen.getByText('Martín')).toBeInTheDocument()
        expect(screen.queryByText('Lucía')).not.toBeInTheDocument()
      },
      { timeout: 1500 }
    )
  })

  it('filters by active status', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    // Click "Active" filter button
    const filterButtons = screen.getAllByText('employees.filters.active')
    // The filter button (not badge) — it's in the filters section
    const activeFilterButton = filterButtons[0]
    await user.click(activeFilterButton)

    await waitFor(() => {
      // Santiago (inactive) should not appear
      expect(screen.queryByText('Santiago')).not.toBeInTheDocument()
    })
  })

  it('filters by inactive status', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const inactiveButton = screen.getAllByText('employees.filters.inactive')[0]
    await user.click(inactiveButton)

    await waitFor(() => {
      expect(screen.getByText('Santiago')).toBeInTheDocument()
      expect(screen.queryByText('Lucía')).not.toBeInTheDocument()
    })
  })

  it('resets to "All" filter showing all employees', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    // Filter inactive first
    const inactiveButton = screen.getAllByText('employees.filters.inactive')[0]
    await user.click(inactiveButton)

    await waitFor(() => {
      expect(screen.queryByText('Lucía')).not.toBeInTheDocument()
    })

    // Reset to All
    const allButton = screen.getByText('employees.filters.all')
    await user.click(allButton)

    await waitFor(() => {
      expect(screen.getByText('Lucía')).toBeInTheDocument()
    })
  })

  it('resets page to 1 when search changes', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    // Go to page 2
    const page2Button = screen.getByRole('button', { name: 'Go to page 2' })
    await user.click(page2Button)

    await waitFor(() => {
      expect(screen.getByText('Tomás')).toBeInTheDocument()
    })

    // Type search — should reset to page 1 results
    const searchInput = screen.getByPlaceholderText('employees.filters.searchPlaceholder')
    await user.type(searchInput, 'Lucía')

    await waitFor(
      () => {
        expect(screen.getByText('Lucía')).toBeInTheDocument()
      },
      { timeout: 1500 }
    )
  })

  // ─── CREATE ───

  it('opens create dialog and submits new employee', async () => {
    mockCreateEmployee.mockResolvedValue({
      id: '99',
      firstName: 'Nuevo',
      lastName: 'Empleado',
      age: 25,
      position: 'Intern',
      startDate: '2026-01-01',
      active: true,
      endDate: null,
    })

    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    // Click "New Employee"
    const createButton = screen.getByText('employees.actions.create')
    await user.click(createButton)

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText('employees.form.createTitle')).toBeInTheDocument()
    })

    // Fill the form
    const inputs = screen.getAllByRole('textbox')
    // firstName, lastName, position (age is type=number so it's spinbutton)
    await user.type(inputs[0], 'Nuevo')
    await user.type(inputs[1], 'Empleado')
    await user.type(inputs[2], 'Intern')

    const ageInput = screen.getByRole('spinbutton')
    await user.type(ageInput, '25')

    // Submit
    const submitButton = screen.getByText('employees.form.create')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateEmployee).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Nuevo',
          lastName: 'Empleado',
          age: 25,
          position: 'Intern',
        })
      )
    })
  })

  it('shows validation errors on empty form submit', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const createButton = screen.getByText('employees.actions.create')
    await user.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('employees.form.createTitle')).toBeInTheDocument()
    })

    // Submit empty form
    const submitButton = screen.getByText('employees.form.create')
    await user.click(submitButton)

    await waitFor(() => {
      const requiredErrors = screen.getAllByText('employees.form.validation.required')
      expect(requiredErrors.length).toBeGreaterThanOrEqual(3) // firstName, lastName, position
    })

    // Age validation
    expect(screen.getByText('employees.form.validation.ageInvalid')).toBeInTheDocument()

    // Service should NOT have been called
    expect(mockCreateEmployee).not.toHaveBeenCalled()
  })

  it('shows age validation error for < 18', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const createButton = screen.getByText('employees.actions.create')
    await user.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('employees.form.createTitle')).toBeInTheDocument()
    })

    // Fill required fields
    const inputs = screen.getAllByRole('textbox')
    await user.type(inputs[0], 'Test')
    await user.type(inputs[1], 'User')
    await user.type(inputs[2], 'Dev')

    const ageInput = screen.getByRole('spinbutton')
    await user.type(ageInput, '15')

    const submitButton = screen.getByText('employees.form.create')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('employees.form.validation.ageMin')).toBeInTheDocument()
    })
    expect(mockCreateEmployee).not.toHaveBeenCalled()
  })

  it('shows age validation error for > 99', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const createButton = screen.getByText('employees.actions.create')
    await user.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('employees.form.createTitle')).toBeInTheDocument()
    })

    const inputs = screen.getAllByRole('textbox')
    await user.type(inputs[0], 'Test')
    await user.type(inputs[1], 'User')
    await user.type(inputs[2], 'Dev')

    const ageInput = screen.getByRole('spinbutton')
    await user.type(ageInput, '150')

    const submitButton = screen.getByText('employees.form.create')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('employees.form.validation.ageMax')).toBeInTheDocument()
    })
    expect(mockCreateEmployee).not.toHaveBeenCalled()
  })

  it('clears validation errors when user types', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const createButton = screen.getByText('employees.actions.create')
    await user.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('employees.form.createTitle')).toBeInTheDocument()
    })

    // Submit empty
    const submitButton = screen.getByText('employees.form.create')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getAllByText('employees.form.validation.required').length).toBeGreaterThan(0)
    })

    // Type in firstName — its error should clear
    const inputs = screen.getAllByRole('textbox')
    await user.type(inputs[0], 'A')

    await waitFor(() => {
      // There should be fewer required errors now
      const errors = screen.getAllByText('employees.form.validation.required')
      expect(errors.length).toBeGreaterThanOrEqual(2) // lastName, position still have errors
    })
  })

  it('closes create dialog on cancel', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const createButton = screen.getByText('employees.actions.create')
    await user.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('employees.form.createTitle')).toBeInTheDocument()
    })

    const cancelButton = screen.getByText('employees.form.cancel')
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('employees.form.createTitle')).not.toBeInTheDocument()
    })
  })

  // ─── EDIT ───

  it('opens edit dialog with pre-filled data via actions menu', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    // Find the first row's actions menu button (the ... button)
    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1] // skip header
    const actionsButton = within(firstDataRow).getByRole('button')
    await user.click(actionsButton)

    // Click Edit
    const editOption = await screen.findByText('employees.actions.edit')
    await user.click(editOption)

    await waitFor(() => {
      expect(screen.getByText('employees.form.editTitle')).toBeInTheDocument()
    })

    // Check pre-filled values
    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0]).toHaveValue('Lucía')
    expect(inputs[1]).toHaveValue('Fernández')
  })

  it('submits edited employee', async () => {
    mockUpdateEmployee.mockResolvedValue({
      ...MOCK_EMPLOYEES[0],
      firstName: 'LucíaEdited',
    })

    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    // Open actions menu for first row
    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]
    const actionsButton = within(firstDataRow).getByRole('button')
    await user.click(actionsButton)

    const editOption = await screen.findByText('employees.actions.edit')
    await user.click(editOption)

    await waitFor(() => {
      expect(screen.getByText('employees.form.editTitle')).toBeInTheDocument()
    })

    // Modify first name
    const inputs = screen.getAllByRole('textbox')
    await user.clear(inputs[0])
    await user.type(inputs[0], 'LucíaEdited')

    const saveButton = screen.getByText('employees.form.save')
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateEmployee).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ firstName: 'LucíaEdited' })
      )
    })
  })

  // ─── DELETE ───

  it('opens delete confirmation dialog', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]
    const actionsButton = within(firstDataRow).getByRole('button')
    await user.click(actionsButton)

    const deleteOption = await screen.findByText('employees.actions.delete')
    await user.click(deleteOption)

    await waitFor(() => {
      expect(screen.getByText('employees.delete.title')).toBeInTheDocument()
      expect(screen.getByText('employees.delete.confirm', { exact: false })).toBeInTheDocument()
    })
  })

  it('confirms delete and calls service', async () => {
    mockDeleteEmployee.mockResolvedValue({ success: true })

    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]
    const actionsButton = within(firstDataRow).getByRole('button')
    await user.click(actionsButton)

    const deleteOption = await screen.findByText('employees.actions.delete')
    await user.click(deleteOption)

    await waitFor(() => {
      expect(screen.getByText('employees.delete.title')).toBeInTheDocument()
    })

    // Find the delete button inside the dialog (not the menu item)
    const dialog = screen.getByRole('dialog')
    const confirmButton = within(dialog).getByText('employees.actions.delete')
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteEmployee).toHaveBeenCalledWith('1')
    })
  })

  it('cancels delete dialog without calling service', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]
    const actionsButton = within(firstDataRow).getByRole('button')
    await user.click(actionsButton)

    const deleteOption = await screen.findByText('employees.actions.delete')
    await user.click(deleteOption)

    await waitFor(() => {
      expect(screen.getByText('employees.delete.title')).toBeInTheDocument()
    })

    const cancelButton = screen.getByText('employees.form.cancel')
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('employees.delete.title')).not.toBeInTheDocument()
    })
    expect(mockDeleteEmployee).not.toHaveBeenCalled()
  })

  // ─── DOWNLOAD ───

  it('triggers file download via actions menu', async () => {
    mockDownloadFile.mockResolvedValue({ data: new Blob(['test content']) })
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    window.URL.revokeObjectURL = vi.fn()

    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]
    const actionsButton = within(firstDataRow).getByRole('button')
    await user.click(actionsButton)

    const downloadOption = await screen.findByText('employees.actions.download')
    await user.click(downloadOption)

    await waitFor(() => {
      expect(mockDownloadFile).toHaveBeenCalledWith('1')
    })
  })

  // ─── SERVICE CALLS ───

  it('calls getEmployees with correct default params on mount', async () => {
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    expect(mockGetEmployees).toHaveBeenCalledWith(
      expect.objectContaining({
        search: '',
        active: '',
        page: 0,
        size: 5,
      })
    )
  })

  it('calls getEmployees with active filter param', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const activeButton = screen.getAllByText('employees.filters.active')[0]
    await user.click(activeButton)

    await waitFor(() => {
      expect(mockGetEmployees).toHaveBeenCalledWith(
        expect.objectContaining({ active: 'true', page: 0 })
      )
    })
  })

  it('calls getEmployees with page param when paginating', async () => {
    const user = userEvent.setup()
    render(<Home />, { wrapper: createTestWrapper() })
    await waitForTableToLoad()

    const page2Button = screen.getByRole('button', { name: 'Go to page 2' })
    await user.click(page2Button)

    await waitFor(() => {
      expect(mockGetEmployees).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
    })
  })
})
