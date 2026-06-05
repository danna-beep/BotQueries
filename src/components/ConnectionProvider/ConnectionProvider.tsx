import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiKey, useTokenUsage } from '@/hooks'
import connectionService from '@/services/connection'
import schemaService from '@/services/schema'
import ConnectionModal from '../ConnectionModal'
import ConnectionBanner from '../ConnectionBanner'
import { ConnectionContext } from './context'

const STATUS_KEY = ['dbchat', 'status']
const CONNECTION_KEY = ['dbchat', 'connection']
const CONTEXT_KEY = ['dbchat', 'context']

interface ConnectionProviderProps {
  children: ReactNode
}

/**
 * Global source of truth for DB connection state. Loads status + connection via
 * React Query, auto-opens the connection modal on first boot when no live DB is
 * configured, and renders the status banner + modal for all child views.
 */
const ConnectionProvider = ({ children }: ConnectionProviderProps) => {
  const queryClient = useQueryClient()
  const { apiKey, setApiKey } = useApiKey()
  const { totals: tokenUsage, addUsage, reset: resetTokenUsage } = useTokenUsage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const autoOpenedRef = useRef(false)

  const statusQuery = useQuery({
    queryKey: STATUS_KEY,
    queryFn: () => connectionService.getStatus(),
  })

  const connectionQuery = useQuery({
    queryKey: CONNECTION_KEY,
    queryFn: () => connectionService.getConnection(),
  })

  const isConnected = !!statusQuery.data?.db_ok

  const contextQuery = useQuery({
    queryKey: CONTEXT_KEY,
    queryFn: () => schemaService.getContextSummary(),
    enabled: isConnected,
  })

  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: STATUS_KEY })
    queryClient.invalidateQueries({ queryKey: CONNECTION_KEY })
    queryClient.invalidateQueries({ queryKey: CONTEXT_KEY })
  }, [queryClient])

  // Auto-open the modal once, on first boot, when there is no live connection.
  useEffect(() => {
    if (autoOpenedRef.current) return
    if (statusQuery.isLoading || connectionQuery.isLoading) return
    autoOpenedRef.current = true
    const status = statusQuery.data
    if (!status || !status.configured || !status.db_ok) {
      setIsModalOpen(true)
    }
  }, [statusQuery.isLoading, connectionQuery.isLoading, statusQuery.data])

  return (
    <ConnectionContext.Provider
      value={{
        status: statusQuery.data,
        connection: connectionQuery.data,
        contextSummary: contextQuery.data,
        isConnected,
        isLoading: statusQuery.isLoading || connectionQuery.isLoading,
        isError: statusQuery.isError,
        apiKey,
        setApiKey,
        tokenUsage,
        addUsage,
        resetTokenUsage,
        openModal,
        closeModal,
        refetch,
      }}
    >
      <ConnectionBanner />
      {children}
      <ConnectionModal open={isModalOpen} onClose={closeModal} />
    </ConnectionContext.Provider>
  )
}

export default ConnectionProvider
