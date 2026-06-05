import { useCallback } from 'react'
import { useConnection } from '@/components'
import { useChat } from '@/hooks'
import { useWorkspace } from './useWorkspace'
import { useWorkspaceView } from './useWorkspaceView'
import { useWorkspaceActions } from './useWorkspaceActions'
import type { IExportRequest } from '@/types'
import type { WorkspaceResult } from '../types'

/** Composes connection + schema + view state + query actions + chat streaming. */
export const useWorkspaceFacade = () => {
  const conn = useConnection()
  const { schema, isLoading: schemaLoading, refetchSchema } = useWorkspace(conn.isConnected)
  const view = useWorkspaceView()
  const actions = useWorkspaceActions()
  const chat = useChat({
    apiKey: conn.apiKey,
    onResult: view.action.recordResult,
    onUsage: conn.addUsage,
  })

  /** Run SQL and show the result (table + history). Used by SQL editor + proposals. */
  const runAndShow = useCallback(
    async (sql: string, maxRows?: number): Promise<WorkspaceResult> => {
      const result = await actions.runSql(sql, maxRows)
      view.action.recordResult(result)
      return result
    },
    [actions, view.action]
  )

  return {
    data: {
      schema,
      schemaLoading,
      isConnected: conn.isConnected,
      authStatus: conn.status?.anthropic_auth,
      result: view.state.result,
      queryHistory: view.state.queryHistory,
      apiKey: conn.apiKey,
      chat: chat.state,
    },
    action: {
      reloadFromHistory: view.action.reloadFromHistory,
      onTableClick: view.action.onTableClick,
      refetchSchema,
      runAndShow,
      exportSql: (payload: IExportRequest) => actions.exportSql(payload),
      downloadExport: actions.downloadExport,
      sendChat: chat.action.send,
      stopChat: chat.action.stop,
      clearChatError: chat.action.clearError,
      openConnection: conn.openModal,
    },
  }
}
