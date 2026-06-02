import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
  Button,
  Input,
  Switch,
  Typography,
  DatePicker,
  LoadingButton,
} from '@getvaas/viplay-ui'
import { useTranslation } from '@/hooks'
import type { IEmployee, IEmployeePayload } from '@/types/employee'

export interface EmployeeFormDialogProps {
  isOpen: boolean
  employee: IEmployee | null
  isLoading: boolean
  onClose: () => void
  onSubmit: (data: IEmployeePayload, id?: string) => void
}

const EMPTY_FORM: IEmployeePayload = {
  firstName: '',
  lastName: '',
  age: 0,
  position: '',
  startDate: new Date().toISOString().split('T')[0],
  active: true,
  endDate: null,
}

type FormErrors = Partial<Record<keyof IEmployeePayload, string>>

const EmployeeFormDialog = ({
  isOpen,
  employee,
  isLoading,
  onClose,
  onSubmit,
}: EmployeeFormDialogProps) => {
  const { t } = useTranslation()
  const [form, setForm] = useState<IEmployeePayload>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})

  const isEditing = !!employee

  useEffect(() => {
    if (employee) {
      setForm({
        firstName: employee.firstName,
        lastName: employee.lastName,
        age: employee.age,
        position: employee.position,
        startDate: employee.startDate,
        active: employee.active,
        endDate: employee.endDate,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [employee, isOpen])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.firstName.trim()) {
      newErrors.firstName = t('employees.form.validation.required')
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = t('employees.form.validation.required')
    }
    if (!form.position.trim()) {
      newErrors.position = t('employees.form.validation.required')
    }
    if (!form.startDate) {
      newErrors.startDate = t('employees.form.validation.required')
    }

    if (!form.age || isNaN(form.age)) {
      newErrors.age = t('employees.form.validation.ageInvalid')
    } else if (form.age < 18) {
      newErrors.age = t('employees.form.validation.ageMin')
    } else if (form.age > 99) {
      newErrors.age = t('employees.form.validation.ageMax')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(form, employee?.id)
    }
  }

  const updateField = <K extends keyof IEmployeePayload>(key: K, value: IEmployeePayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className='fixed inset-0 bg-black/40 z-40' />
        <DialogContent className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl p-6 w-full max-w-lg z-50'>
          <DialogTitle className='text-lg font-semibold text-card-foreground mb-6'>
            {isEditing ? t('employees.form.editTitle') : t('employees.form.createTitle')}
          </DialogTitle>

          <form onSubmit={handleSubmit} noValidate className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Typography variant='p3' className='text-muted-foreground'>
                  {t('employees.table.firstName')}
                </Typography>
                <Input
                  value={form.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <Typography variant='p4' className='text-destructive'>
                    {errors.firstName}
                  </Typography>
                )}
              </div>
              <div className='space-y-1.5'>
                <Typography variant='p3' className='text-muted-foreground'>
                  {t('employees.table.lastName')}
                </Typography>
                <Input
                  value={form.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <Typography variant='p4' className='text-destructive'>
                    {errors.lastName}
                  </Typography>
                )}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Typography variant='p3' className='text-muted-foreground'>
                  {t('employees.table.age')}
                </Typography>
                <Input
                  type='number'
                  value={form.age === 0 ? '' : String(form.age)}
                  onChange={(e) => updateField('age', Number(e.target.value))}
                  className={errors.age ? 'border-destructive' : ''}
                />
                {errors.age && (
                  <Typography variant='p4' className='text-destructive'>
                    {errors.age}
                  </Typography>
                )}
              </div>
              <div className='space-y-1.5'>
                <Typography variant='p3' className='text-muted-foreground'>
                  {t('employees.table.position')}
                </Typography>
                <Input
                  value={form.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  className={errors.position ? 'border-destructive' : ''}
                />
                {errors.position && (
                  <Typography variant='p4' className='text-destructive'>
                    {errors.position}
                  </Typography>
                )}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Typography variant='p3' className='text-muted-foreground'>
                  {t('employees.table.startDate')}
                </Typography>
                <DatePicker
                  value={form.startDate ? new Date(form.startDate) : undefined}
                  onChange={(date) =>
                    updateField('startDate', date ? date.toISOString().split('T')[0] : '')
                  }
                />
                {errors.startDate && (
                  <Typography variant='p4' className='text-destructive'>
                    {errors.startDate}
                  </Typography>
                )}
              </div>
              <div className='space-y-1.5'>
                <Typography variant='p3' className='text-muted-foreground'>
                  {t('employees.table.endDate')}
                </Typography>
                <DatePicker
                  value={form.endDate ? new Date(form.endDate) : undefined}
                  onChange={(date) =>
                    updateField('endDate', date ? date.toISOString().split('T')[0] : null)
                  }
                />
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => updateField('active', checked)}
              />
              <Typography variant='p3'>{t('employees.filters.active')}</Typography>
            </div>

            <div className='flex justify-end gap-3 pt-4'>
              <Button variant='secondary' type='button' onClick={onClose}>
                {t('employees.form.cancel')}
              </Button>
              <LoadingButton type='submit' isLoading={isLoading}>
                {isEditing ? t('employees.form.save') : t('employees.form.create')}
              </LoadingButton>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export default EmployeeFormDialog
