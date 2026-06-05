import { useQuery } from '@tanstack/react-query'
import schemaService from '@/services/schema'

/** Schema introspection for the connected database. */
export const useWorkspace = (isConnected: boolean) => {
  const schemaQuery = useQuery({
    queryKey: ['dbchat', 'schema'],
    queryFn: () => schemaService.getSchema(),
    enabled: isConnected,
  })

  return {
    schema: schemaQuery.data,
    isLoading: schemaQuery.isLoading && isConnected,
    isError: schemaQuery.isError,
    refetchSchema: schemaQuery.refetch,
  }
}
