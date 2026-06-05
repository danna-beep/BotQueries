import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@getvaas/viplay-ui'
import { useTranslation } from '@/hooks'
import dashboardService from '@/services/dashboards'
import type { ILayoutItem } from '@/types'

const LIST_KEY = ['dbchat', 'dashboards']

/** Mutations for dashboards + tiles, with toasts and cache invalidation. */
export const useDashboardActions = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { t } = useTranslation()

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: LIST_KEY })
  const invalidateDashboard = (id: string) =>
    queryClient.invalidateQueries({ queryKey: ['dbchat', 'dashboard', id] })
  const onError = () => toast({ title: t('dashboard.toast.error'), variant: 'destructive' })

  const createDashboard = useMutation({
    mutationFn: (name: string) => dashboardService.createDashboard(name),
    onSuccess: () => invalidateList(),
    onError,
  })

  const renameDashboard = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => dashboardService.renameDashboard(id, name),
    onSuccess: (d) => {
      invalidateList()
      invalidateDashboard(d.id)
    },
    onError,
  })

  const deleteDashboard = useMutation({
    mutationFn: (id: string) => dashboardService.deleteDashboard(id),
    onSuccess: () => {
      invalidateList()
      toast({ title: t('dashboard.toast.deleted'), variant: 'success' })
    },
    onError,
  })

  const deleteTile = useMutation({
    mutationFn: ({ dashboardId, tileId }: { dashboardId: string; tileId: string }) =>
      dashboardService.deleteTile(dashboardId, tileId),
    onSuccess: (_r, { dashboardId }) => {
      invalidateDashboard(dashboardId)
      invalidateList()
    },
    onError,
  })

  // Layout persistence is silent (fires on every drag/resize); no toast/invalidate
  // to avoid refetch flicker — the grid holds the optimistic layout locally.
  const updateLayout = useMutation({
    mutationFn: ({ dashboardId, layouts }: { dashboardId: string; layouts: ILayoutItem[] }) =>
      dashboardService.updateLayout(dashboardId, layouts),
  })

  return {
    createDashboard: { execute: createDashboard.mutateAsync, isLoading: createDashboard.isPending },
    renameDashboard: { execute: renameDashboard.mutateAsync, isLoading: renameDashboard.isPending },
    deleteDashboard: { execute: deleteDashboard.mutateAsync, isLoading: deleteDashboard.isPending },
    deleteTile: { execute: deleteTile.mutateAsync, isLoading: deleteTile.isPending },
    updateLayout: { execute: updateLayout.mutateAsync },
  }
}
