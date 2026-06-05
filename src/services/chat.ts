import keycloak from '@/auth/keycloak'
import type { ChatEvent, ChatMode, IChatMessage } from '@/types'

/**
 * Chat streaming (Server-Sent Events) against the DBChat backend `/api/chat`.
 *
 * Axios/`BaseService` cannot consume a stream incrementally, so this uses
 * `fetch` directly and injects the Keycloak bearer token by hand — mirroring
 * the refresh-then-attach logic in `restClient`'s request interceptor.
 */

export interface StreamChatParams {
  message: string
  history?: IChatMessage[]
  apiKey?: string | null
  mode?: ChatMode
  onEvent: (event: ChatEvent) => void
  signal?: AbortSignal
}

const apiBaseUrl = (): string => {
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  return base.replace(/\/$/, '')
}

const authHeader = async (): Promise<Record<string, string>> => {
  try {
    await keycloak.updateToken(30)
  } catch {
    /* token expired — request will 401 and trigger logout */
  }
  return keycloak.token ? { Authorization: `Bearer ${keycloak.token}` } : {}
}

const errorDetail = async (res: Response): Promise<string> => {
  let detail = `HTTP ${res.status}`
  try {
    const body = await res.json()
    if (body?.detail) {
      detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
    }
  } catch {
    /* non-JSON error body */
  }
  return detail
}

/** Parse a raw SSE `data:`-prefixed chunk and dispatch each event. */
const dispatchChunk = (chunk: string, onEvent: (event: ChatEvent) => void): void => {
  for (const line of chunk.split('\n')) {
    const trimmed = line.trimStart()
    if (!trimmed.startsWith('data:')) continue
    const payload = trimmed.slice(5).trim()
    if (!payload) continue
    try {
      onEvent(JSON.parse(payload) as ChatEvent)
    } catch {
      /* skip malformed line */
    }
  }
}

export const streamChat = async ({
  message,
  history = [],
  apiKey = null,
  mode = 'preview',
  onEvent,
  signal,
}: StreamChatParams): Promise<void> => {
  const res = await fetch(`${apiBaseUrl()}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeader()),
    },
    body: JSON.stringify({ message, history, api_key: apiKey, mode }),
    signal,
  })

  if (res.status === 401) {
    keycloak.logout()
    throw new Error('Unauthorized')
  }
  if (!res.ok || !res.body) {
    throw new Error(await errorDetail(res))
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let idx: number
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const chunk = buffer.slice(0, idx)
      buffer = buffer.slice(idx + 2)
      dispatchChunk(chunk, onEvent)
    }
  }
}
