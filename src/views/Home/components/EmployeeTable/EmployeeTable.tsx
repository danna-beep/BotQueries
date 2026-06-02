import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
  TableActionsMenu,
  Pagination,
  Badge,
  Typography,
} from '@getvaas/viplay-ui'
import { useTranslation } from '@/hooks'
import type { IEmployee } from '@/types/employee'

export interface EmployeeTableProps {
  employees: IEmployee[]
  totalPages: number
  currentPage: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onEdit: (employee: IEmployee) => void
  onDelete: (employee: IEmployee) => void
  onDownload: (id: string) => void
}

const EmployeeTable = ({
  employees,
  totalPages,
  currentPage,
  isLoading,
  onPageChange,
  onEdit,
  onDelete,
  onDownload,
}: EmployeeTableProps) => {
  const { t } = useTranslation()

  if (isLoading) {
    return null
  }

  if (employees.length === 0) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Typography variant='p2' className='text-muted-foreground'>
          {t('employees.table.empty')}
        </Typography>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>{t('employees.table.firstName')}</TableHeaderCell>
            <TableHeaderCell>{t('employees.table.lastName')}</TableHeaderCell>
            <TableHeaderCell>{t('employees.table.age')}</TableHeaderCell>
            <TableHeaderCell>{t('employees.table.position')}</TableHeaderCell>
            <TableHeaderCell>{t('employees.table.startDate')}</TableHeaderCell>
            <TableHeaderCell>{t('employees.table.status')}</TableHeaderCell>
            <TableHeaderCell>{t('employees.table.endDate')}</TableHeaderCell>
            <TableHeaderCell>{t('employees.table.actions')}</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.firstName}</TableCell>
              <TableCell>{employee.lastName}</TableCell>
              <TableCell>{employee.age}</TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell>{employee.startDate}</TableCell>
              <TableCell>
                <Badge variant={employee.active ? 'success' : 'destructive'}>
                  {employee.active ? t('employees.filters.active') : t('employees.filters.inactive')}
                </Badge>
              </TableCell>
              <TableCell>{employee.endDate ?? '—'}</TableCell>
              <TableCell>
                <TableActionsMenu
                  actions={[
                    {
                      label: t('employees.actions.edit'),
                      onClick: () => onEdit(employee),
                    },
                    {
                      label: t('employees.actions.download'),
                      onClick: () => onDownload(employee.id),
                    },
                    {
                      label: t('employees.actions.delete'),
                      onClick: () => onDelete(employee),
                      variant: 'destructive',
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className='flex justify-end'>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}

export default EmployeeTable
