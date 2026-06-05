import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dashboardService from '@/services/dashboards'
import type { ITileCreatePayload } from '@/types'

export interface SaveTileParams {
  /** Existing dashboard id, or '__new__' to create one. */
  target: string
  newName?: string
  tile: ITileCreatePayload
}

/** Lists dashboards and saves a chart as a tile (creating a dashboard if needed). */
export const useSaveToDashboard = () => {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['dbchat', 'dashboards'],
    queryFn: () => dashboardService.listDashboards(),
  })

  const saveMutation = useMutation({
    mutationFn: async ({ target, newName, tile }: SaveTileParams): Promise<string> => {
      let dashboardId = target
      let dashboardName = ''
      if (target === '__new__') {
        const d = await dashboardService.createDashboard(newName?.trim() || 'Untitled dashboard')
        dashboardId = d.id
        dashboardName = d.name
      } else {
        dashboardName = listQuery.data?.dashboards.find((d) => d.id === target)?.name || 'dashboard'
      }
      await dashboardService.addTile(dashboardId, tile)
      return dashboardName
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dbchat', 'dashboards'] }),
  })

  return {
    dashboards: listQuery.data?.dashboards ?? [],
    save: saveMutation.mutateAsync,
    saving: saveMutation.isPending,
  }
}
