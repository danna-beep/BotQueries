import { createContext, useContext } from 'react'
import type {
  ChatEvent,
  IApiStatus,
  IConnectionResponse,
  IContextSummary,
  ITokenUsageTotals,
} from '@/types'

type UsageEvent = Extract<ChatEvent, { type: 'usage' }>

export interface IConnectionContextValue {
  status?: IApiStatus
  connection?: IConnectionResponse
  contextSummary?: IContextSummary
  /** True when the backend reports a live DB connection (`status.db_ok`). */
  isConnected: boolean
  isLoading: boolean
  /** True when the status request failed (e.g. backend unreachable). */
  isError: boolean
  /** Anthropic API key (browser-stored), shared across the app. */
  apiKey: string
  setApiKey: (key: string) => void
  /** Cumulative chat token usage (browser-persisted) and its mutators. */
  tokenUsage: ITokenUsageTotals
  addUsage: (evt: UsageEvent) => void
  resetTokenUsage: () => void
  openModal: () => void
  closeModal: () => void
  /** Re-fetch status + connection + context (e.g. after connect/disconnect). */
  refetch: () => void
}

export const ConnectionContext = createContext<IConnectionContextValue | undefined>(undefined)

export const useConnection = (): IConnectionContextValue => {
  const ctx = useContext(ConnectionContext)
  if (!ctx) {
    throw new Error('useConnection must be used within a ConnectionProvider')
  }
  return ctx
}
