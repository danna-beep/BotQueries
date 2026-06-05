import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import warningService from '@/services/warnings'
import type { IWarningCreatePayload } from '@/types'

const WARNINGS_KEY = ['dbchat', 'warnings']

/** Warnings list + delete/clear, for the Warnings tab. */
export const useWarnings = () => {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: WARNINGS_KEY })

  const warningsQuery = useQuery({
    queryKey: WARNINGS_KEY,
    queryFn: () => warningService.listWarnings(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => warningService.deleteWarning(id),
    onSuccess: invalidate,
  })

  const clearMutation = useMutation({
    mutationFn: () => warningService.clearWarnings(),
    onSuccess: invalidate,
  })

  return {
    warnings: warningsQuery.data?.warnings ?? [],
    isLoading: warningsQuery.isLoading,
    isFetching: warningsQuery.isFetching,
    error: warningsQuery.error instanceof Error ? warningsQuery.error.message : null,
    refetch: warningsQuery.refetch,
    deleteWarning: deleteMutation.mutateAsync,
    clearWarnings: clearMutation.mutateAsync,
  }
}

/** Persist a single warning (used by the chat ```warning block). Invalidates the list. */
export const useSaveWarning = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: IWarningCreatePayload) => warningService.createWarning(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WARNINGS_KEY }),
  })
}
