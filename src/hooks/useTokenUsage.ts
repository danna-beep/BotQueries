import { useCallback, useState } from 'react'
import type { ChatEvent, ITokenUsageTotals } from '@/types'

const STORAGE_KEY = 'dbchat_token_usage'

const EMPTY: ITokenUsageTotals = {
  inputTokens: 0,
  outputTokens: 0,
  cacheCreationTokens: 0,
  cacheReadTokens: 0,
  turns: 0,
}

const load = (): ITokenUsageTotals => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY }
  } catch {
    return { ...EMPTY }
  }
}

const save = (totals: ITokenUsageTotals) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(totals))
  } catch {
    /* ignore quota / serialization errors */
  }
}

type UsageEvent = Extract<ChatEvent, { type: 'usage' }>

/**
 * Cumulative chat token usage persisted in localStorage, so totals (and the
 * estimated cost derived from them) survive reloads and dev-server restarts.
 */
export const useTokenUsage = () => {
  const [totals, setTotals] = useState<ITokenUsageTotals>(load)

  /** Fold one backend `usage` event into the running totals. */
  const addUsage = useCallback((evt: UsageEvent) => {
    setTotals((prev) => {
      const next: ITokenUsageTotals = {
        inputTokens: prev.inputTokens + (evt.input_tokens || 0),
        outputTokens: prev.outputTokens + (evt.output_tokens || 0),
        cacheCreationTokens: prev.cacheCreationTokens + (evt.cache_creation_input_tokens || 0),
        cacheReadTokens: prev.cacheReadTokens + (evt.cache_read_input_tokens || 0),
        turns: prev.turns + 1,
        model: evt.model ?? prev.model,
      }
      save(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    save(EMPTY)
    setTotals({ ...EMPTY })
  }, [])

  return { totals, addUsage, reset }
}
