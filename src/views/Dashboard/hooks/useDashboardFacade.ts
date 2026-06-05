import { useCallback } from 'react'
import type { ILayoutItem } from '@/types'
import { useDashboards } from './useDashboards'
import { useDashboardActions } from './useDashboardActions'

/** Composes dashboard list/selection + mutations; orchestrates the current selection. */
export const useDashboardFacade = () => {
  const { dashboards, currentId, setCurrentId, current, isListLoading, isCurrentLoading } = useDashboards()
  const actions = useDashboardActions()

  const createDashboard = useCallback(
    async (name: string) => {
      const d = await actions.createDashboard.execute(name)
      setCurrentId(d.id)
      return d
    },
    [actions.createDashboard, setCurrentId]
  )

  const renameDashboard = useCallback(
    (name: string) => {
      if (!current) return Promise.resolve()
      return actions.renameDashboard.execute({ id: current.id, name })
    },
    [actions.renameDashboard, current]
  )

  const deleteDashboard = useCallback(async () => {
    if (!current) return
    await actions.deleteDashboard.execute(current.id)
    setCurrentId(null)
  }, [actions.deleteDashboard, current, setCurrentId])

  const deleteTile = useCallback(
    (tileId: string) => {
      if (!current) return Promise.resolve()
      return actions.deleteTile.execute({ dashboardId: current.id, tileId })
    },
    [actions.deleteTile, current]
  )

  const updateLayout = useCallback(
    (layouts: ILayoutItem[]) => {
      if (!current) return Promise.resolve()
      return actions.updateLayout.execute({ dashboardId: current.id, layouts })
    },
    [actions.updateLayout, current]
  )

  return {
    data: { dashboards, currentId, current, isListLoading, isCurrentLoading },
    action: {
      setCurrentId,
      createDashboard,
      renameDashboard,
      deleteDashboard,
      deleteTile,
      updateLayout,
    },
    busy: {
      creating: actions.createDashboard.isLoading,
      renaming: actions.renameDashboard.isLoading,
      deleting: actions.deleteDashboard.isLoading,
    },
  }
}
