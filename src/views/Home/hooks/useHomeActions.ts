import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@getvaas/viplay-ui'
import { useTranslation } from '@/hooks'
import employeeService from '../services/home'
import type { IEmployeePayload } from '@/types/employee'

export const useEmployeeActions = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { t } = useTranslation()

  const createEmployee = useMutation({
    mutationFn: (data: IEmployeePayload) => employeeService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast({ title: t('employees.toast.created'), variant: 'success' })
    },
    onError: () => {
      toast({ title: t('employees.toast.error'), variant: 'destructive' })
    },
  })

  const updateEmployee = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IEmployeePayload }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast({ title: t('employees.toast.updated'), variant: 'success' })
    },
    onError: () => {
      toast({ title: t('employees.toast.error'), variant: 'destructive' })
    },
  })

  const deleteEmployee = useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast({ title: t('employees.toast.deleted'), variant: 'success' })
    },
    onError: () => {
      toast({ title: t('employees.toast.error'), variant: 'destructive' })
    },
  })

  const downloadFile = useMutation({
    mutationFn: (id: string) => employeeService.downloadFile(id),
    onSuccess: (response, id) => {
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `legajo-${id}.txt`
      link.click()
      window.URL.revokeObjectURL(url)
      toast({ title: t('employees.toast.downloaded'), variant: 'success' })
    },
    onError: () => {
      toast({ title: t('employees.toast.error'), variant: 'destructive' })
    },
  })

  return {
    onCreate: {
      execute: createEmployee.mutateAsync,
      isLoading: createEmployee.isPending,
    },
    onUpdate: {
      execute: updateEmployee.mutateAsync,
      isLoading: updateEmployee.isPending,
    },
    onDelete: {
      execute: deleteEmployee.mutateAsync,
      isLoading: deleteEmployee.isPending,
    },
    onDownloadFile: {
      execute: downloadFile.mutateAsync,
      isLoading: downloadFile.isPending,
    },
  }
}
