import { useConnection } from '@/components'
import { useChat } from '@/hooks'

/** Composes connection + API key + chat streaming in NoCode mode (no SQL surfaced). */
export const useNoCodeFacade = () => {
  const conn = useConnection()
  const chat = useChat({ apiKey: conn.apiKey, mode: 'nocode', onUsage: conn.addUsage })

  return {
    data: {
      messages: chat.state.messages,
      streaming: chat.state.streaming,
      error: chat.state.error,
      isConnected: conn.isConnected,
      authStatus: conn.status?.anthropic_auth,
      apiKey: conn.apiKey,
    },
    action: {
      send: chat.action.send,
      stop: chat.action.stop,
      clearError: chat.action.clearError,
      reset: chat.action.reset,
      openConnection: conn.openModal,
    },
  }
}
