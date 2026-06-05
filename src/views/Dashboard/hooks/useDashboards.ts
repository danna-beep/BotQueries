import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import dashboardService from '@/services/dashboards'

/** Dashboard list + current selection + the loaded current dashboard (with tiles). */
export const useDashboards = () => {
  const [currentId, setCurrentId] = useState<string | null>(null)

  const listQuery = useQuery({
    queryKey: ['dbchat', 'dashboards'],
    queryFn: () => dashboardService.listDashboards(),
  })

  const dashboards = listQuery.data?.dashboards ?? []

  // Default to the first dashboard once the list loads; clear if none remain.
  useEffect(() => {
    if (!listQuery.data) return
    if (dashboards.length === 0) {
      if (currentId !== null) setCurrentId(null)
    } else if (!currentId || !dashboards.some((d) => d.id === currentId)) {
      setCurrentId(dashboards[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listQuery.data])

  const dashboardQuery = useQuery({
    queryKey: ['dbchat', 'dashboard', currentId],
    queryFn: () => dashboardService.getDashboard(currentId as string),
    enabled: !!currentId,
  })

  return {
    dashboards,
    currentId,
    setCurrentId,
    current: dashboardQuery.data,
    isListLoading: listQuery.isLoading,
    isCurrentLoading: dashboardQuery.isLoading && !!currentId,
  }
}
