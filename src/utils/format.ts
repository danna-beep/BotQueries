/** Shared value formatters (ported from the original DBChat `lib/utils.js`). */

export const formatNumber = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return '—'
  return new Intl.NumberFormat().format(n)
}

export const truncate = (s: string, n = 40): string => {
  if (!s) return s
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

export const relativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 5) return 'just now'
  if (diff < 60) return `${Math.floor(diff)}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export const isNumeric = (v: unknown): boolean => {
  if (v === null || v === undefined || v === '') return false
  if (typeof v === 'boolean') return false
  if (typeof v === 'number') return Number.isFinite(v)
  if (typeof v === 'string') {
    if (v.trim() === '') return false
    return Number.isFinite(Number(v))
  }
  return false
}

/** Compact number: 1234 → "1.2K", 1.5e6 → "1.5M", 2.3e9 → "2.3B". */
export const formatCompact = (n: number | string | null | undefined): string => {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return '—'
  const num = Number(n)
  const abs = Math.abs(num)
  if (abs >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + 'T'
  if (abs >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
  if (abs >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (abs >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
  if (Number.isInteger(num)) return String(num)
  return num.toFixed(2)
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?)?$/
const DATE_NAME_RE = /(date|fecha|day|month|dia|mes|year|año|ano|timestamp|created|updated)/i

export const looksLikeDateValue = (v: unknown): boolean => {
  if (v instanceof Date) return true
  if (typeof v !== 'string') return false
  return DATE_RE.test(v.trim())
}

export const looksLikeDateColumn = (colName: string, sampleValue: unknown): boolean =>
  DATE_NAME_RE.test(colName) || looksLikeDateValue(sampleValue)

export const formatDateLabel = (v: unknown): string => {
  if (!v) return ''
  const s = String(v)
  if (DATE_RE.test(s.trim())) return s.trim().slice(0, 10)
  return s
}
