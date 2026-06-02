import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
  Button,
  Typography,
  LoadingButton,
} from '@getvaas/viplay-ui'
import { useTranslation } from '@/hooks'
import type { IEmployee } from '@/types/employee'

export interface DeleteEmployeeDialogProps {
  isOpen: boolean
  employee: IEmployee | null
  isLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

const DeleteEmployeeDialog = ({
  isOpen,
  employee,
  isLoading,
  onClose,
  onConfirm,
}: DeleteEmployeeDialogProps) => {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className='fixed inset-0 bg-black/40 z-40' />
        <DialogContent className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl p-6 w-full max-w-sm z-50'>
          <DialogTitle className='text-lg font-semibold text-card-foreground mb-4'>
            {t('employees.delete.title')}
          </DialogTitle>

          <Typography variant='p2' className='text-muted-foreground mb-6'>
            {t('employees.delete.confirm', {
              name: `${employee?.firstName} ${employee?.lastName}`,
            })}
          </Typography>

          <div className='flex justify-end gap-3'>
            <Button variant='secondary' onClick={onClose}>
              {t('employees.form.cancel')}
            </Button>
            <LoadingButton
              variant='primary-destructive'
              isLoading={isLoading}
              onClick={onConfirm}
            >
              {t('employees.actions.delete')}
            </LoadingButton>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export default DeleteEmployeeDialog
