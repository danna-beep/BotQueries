import { useCallback, useState } from 'react'

const KEY_STORAGE = 'dbchat_key'

/** Anthropic API key persisted in localStorage, shared by the chat views. */
export const useApiKey = () => {
  const [apiKey, setApiKeyState] = useState<string>(() => localStorage.getItem(KEY_STORAGE) || '')

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key)
    if (key) localStorage.setItem(KEY_STORAGE, key)
    else localStorage.removeItem(KEY_STORAGE)
  }, [])

  return { apiKey, setApiKey }
}
