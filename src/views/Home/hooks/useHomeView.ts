import { useState } from 'react'
import type { IEmployee } from '@/types/employee'

export const useHomeView = () => {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null)

  const openCreateForm = () => {
    setSelectedEmployee(null)
    setIsFormOpen(true)
  }

  const openEditForm = (employee: IEmployee) => {
    setSelectedEmployee(employee)
    setIsFormOpen(true)
  }

  const openDeleteDialog = (employee: IEmployee) => {
    setSelectedEmployee(employee)
    setIsDeleteOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setSelectedEmployee(null)
  }

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false)
    setSelectedEmployee(null)
  }

  return {
    action: {
      setSearch: (value: string) => {
        setSearch(value)
        setPage(1)
      },
      setActiveFilter: (value: string) => {
        setActiveFilter(value)
        setPage(1)
      },
      setPage,
      openCreateForm,
      openEditForm,
      openDeleteDialog,
      closeForm,
      closeDeleteDialog,
    },
    state: {
      search,
      activeFilter,
      page,
      pageSize,
      isFormOpen,
      isDeleteOpen,
      selectedEmployee,
    },
    data: {},
  }
}
