import { Loader, Typography } from '@getvaas/viplay-ui'
import { useTranslation } from '@/hooks'
import { useHomeFacade } from './hooks'
import {
  EmployeeFilters,
  EmployeeTable,
  EmployeeFormDialog,
  DeleteEmployeeDialog,
} from './components'
import type { IEmployeePayload } from '@/types/employee'

const Home = () => {
  const { t } = useTranslation()
  const { action, state, data } = useHomeFacade()

  const handleFormSubmit = async (formData: IEmployeePayload, id?: string) => {
    if (id) {
      await action.onUpdate.execute({ id, data: formData })
    } else {
      await action.onCreate.execute(formData)
    }
    action.closeForm()
  }

  const handleDelete = async () => {
    if (state.selectedEmployee) {
      await action.onDelete.execute(state.selectedEmployee.id)
      action.closeDeleteDialog()
    }
  }

  return (
    <div className='p-6 space-y-6'>
      <Typography variant='h3'>{t('employees.title')}</Typography>

      <EmployeeFilters
        search={state.search}
        activeFilter={state.activeFilter}
        onSearchChange={action.setSearch}
        onActiveFilterChange={action.setActiveFilter}
        onCreateClick={action.openCreateForm}
      />

      {data.isLoading ? (
        <div className='flex justify-center py-16'>
          <Loader size='lg' />
        </div>
      ) : (
        <EmployeeTable
          employees={data.employees}
          totalPages={data.totalPages}
          currentPage={state.page}
          isLoading={data.isLoading}
          onPageChange={action.setPage}
          onEdit={action.openEditForm}
          onDelete={action.openDeleteDialog}
          onDownload={(id) => action.onDownloadFile.execute(id)}
        />
      )}

      <EmployeeFormDialog
        isOpen={state.isFormOpen}
        employee={state.selectedEmployee}
        isLoading={action.onCreate.isLoading || action.onUpdate.isLoading}
        onClose={action.closeForm}
        onSubmit={handleFormSubmit}
      />

      <DeleteEmployeeDialog
        isOpen={state.isDeleteOpen}
        employee={state.selectedEmployee}
        isLoading={action.onDelete.isLoading}
        onClose={action.closeDeleteDialog}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default Home
