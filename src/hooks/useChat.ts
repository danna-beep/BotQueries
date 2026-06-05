import { useCallback, useRef, useState } from 'react'
import { streamChat } from '@/services/chat'
import type { ChatEvent, ChatMode, IChatMessage, IQueryResult, IToolResultPayload } from '@/types'

export type ChatPart =
  | { type: 'text'; text: string }
  | {
      type: 'tool_call'
      toolName: string
      sql: string
      status: 'running' | 'done'
      payload: IToolResultPayload | null
      elapsedSeconds?: number
    }

export type ChatMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; parts: ChatPart[]; thinking: boolean }

/** A query result paired with the SQL that produced it. */
export type ChatQueryResult = IQueryResult & { sql: string }

interface UseChatParams {
  apiKey: string
  /** Chat mode sent to the backend. Defaults to 'preview'. */
  mode?: ChatMode
  /** Called when a tool emits a query result (e.g. to push it into a results panel). */
  onResult?: (result: ChatQueryResult) => void
  /** Called when the backend reports token usage for the turn. */
  onUsage?: (evt: Extract<ChatEvent, { type: 'usage' }>) => void
}

/**
 * Streaming chat state machine over `chatService.streamChat` (SSE). Shared by the
 * Workspace (mode 'preview') and NoCode (mode 'nocode') views.
 */
export const useChat = ({ apiKey, mode = 'preview', onResult, onUsage }: UseChatParams) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [history, setHistory] = useState<IChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const updateLastAssistant = useCallback(
    (updater: (msg: { role: 'assistant'; parts: ChatPart[]; thinking: boolean }) => void) => {
      setMessages((msgs) => {
        const next = [...msgs]
        const last = next[next.length - 1]
        if (last?.role === 'assistant') {
          const clone = { ...last, parts: [...last.parts] }
          updater(clone)
          next[next.length - 1] = clone
        }
        return next
      })
    },
    []
  )

  const handleEvent = useCallback(
    (evt: ChatEvent) => {
      switch (evt.type) {
        case 'text':
          updateLastAssistant((m) => {
            m.parts.push({ type: 'text', text: evt.text })
          })
          break
        case 'tool_call':
          updateLastAssistant((m) => {
            m.parts.push({
              type: 'tool_call',
              toolName: evt.name,
              sql: typeof evt.input?.sql === 'string' ? evt.input.sql : '',
              status: 'running',
              payload: null,
            })
          })
          break
        case 'progress':
        case 'tool_progress':
          updateLastAssistant((m) => {
            for (let i = m.parts.length - 1; i >= 0; i--) {
              const p = m.parts[i]
              if (p.type === 'tool_call' && p.status === 'running') {
                m.parts[i] = { ...p, elapsedSeconds: evt.elapsed_seconds }
                break
              }
            }
          })
          break
        case 'tool_result':
          updateLastAssistant((m) => {
            for (let i = m.parts.length - 1; i >= 0; i--) {
              const p = m.parts[i]
              if (p.type === 'tool_call' && p.status === 'running') {
                m.parts[i] = { ...p, status: 'done', payload: evt.payload }
                break
              }
            }
          })
          if (evt.payload.kind === 'query_result' && onResult) {
            const p = evt.payload
            onResult({
              sql: p.sql,
              columns: p.columns,
              rows: p.rows,
              row_count: p.row_count,
              elapsed_ms: p.elapsed_ms,
              truncated: p.truncated,
            })
          }
          break
        case 'usage':
          onUsage?.(evt)
          break
        case 'done':
          setHistory(evt.messages || [])
          updateLastAssistant((m) => {
            m.thinking = false
          })
          break
        case 'error':
          setError(evt.error)
          updateLastAssistant((m) => {
            m.thinking = false
          })
          break
      }
    },
    [onResult, onUsage, updateLastAssistant]
  )

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || streaming) return
      setError(null)
      setMessages((m) => [
        ...m,
        { role: 'user', text: trimmed },
        { role: 'assistant', parts: [], thinking: true },
      ])
      setStreaming(true)
      const controller = new AbortController()
      abortRef.current = controller
      try {
        await streamChat({
          message: trimmed,
          history,
          apiKey,
          mode,
          onEvent: handleEvent,
          signal: controller.signal,
        })
      } catch (e) {
        // An abort is a user-initiated stop, not an error: keep partial output.
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          setError(e instanceof Error ? e.message : String(e))
        }
        updateLastAssistant((m) => {
          m.thinking = false
        })
      } finally {
        abortRef.current = null
        setStreaming(false)
      }
    },
    [streaming, history, apiKey, mode, handleEvent, updateLastAssistant]
  )

  /** Abort the in-flight stream, keeping whatever was streamed so far. */
  const stop = useCallback(() => {
    abortRef.current?.abort()
    updateLastAssistant((m) => {
      m.thinking = false
    })
  }, [updateLastAssistant])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setHistory([])
    setError(null)
  }, [])

  return {
    state: { messages, streaming, error },
    action: { send, stop, clearError: () => setError(null), reset },
  }
}
