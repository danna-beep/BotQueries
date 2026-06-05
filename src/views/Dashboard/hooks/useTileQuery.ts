import { useQuery } from '@tanstack/react-query'
import queryService from '@/services/query'

/** Runs a tile's SQL and caches the result by SQL string. */
export const useTileQuery = (sql: string) => {
  const query = useQuery({
    queryKey: ['dbchat', 'query', sql],
    queryFn: () => queryService.runQuery(sql),
    enabled: !!sql,
  })

  return {
    result: query.data,
    isLoading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: query.refetch,
  }
}
