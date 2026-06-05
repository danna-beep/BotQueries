import type { ITokenUsageTotals } from '@/types'

/** USD price per 1M tokens, per model. */
export interface IModelPricing {
  input: number
  output: number
  cacheWrite: number
  cacheRead: number
}

/**
 * Public Anthropic list prices (USD per 1M tokens). Update when prices change.
 * Used to estimate cost from accumulated token counts — informational only.
 */
export const MODEL_PRICING: Record<string, IModelPricing> = {
  'claude-sonnet-4-5': { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  'claude-opus-4-5': { input: 5, output: 25, cacheWrite: 6.25, cacheRead: 0.5 },
  'claude-haiku-4-5': { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
}

export const DEFAULT_MODEL = 'claude-sonnet-4-5'

/** Strip a trailing `-YYYYMMDD` snapshot suffix so dated IDs match the alias. */
const normalizeModel = (model: string): string => model.replace(/-\d{8}$/, '')

export const pricingFor = (model?: string): IModelPricing => {
  if (!model) return MODEL_PRICING[DEFAULT_MODEL]
  return MODEL_PRICING[model] || MODEL_PRICING[normalizeModel(model)] || MODEL_PRICING[DEFAULT_MODEL]
}

/** Estimated cost (USD) of the accumulated token usage, by the model's list price. */
export const estimateCostUsd = (totals: ITokenUsageTotals): number => {
  const p = pricingFor(totals.model)
  return (
    (totals.inputTokens / 1_000_000) * p.input +
    (totals.outputTokens / 1_000_000) * p.output +
    (totals.cacheCreationTokens / 1_000_000) * p.cacheWrite +
    (totals.cacheReadTokens / 1_000_000) * p.cacheRead
  )
}

export const totalTokens = (totals: ITokenUsageTotals): number =>
  totals.inputTokens + totals.outputTokens + totals.cacheCreationTokens + totals.cacheReadTokens
