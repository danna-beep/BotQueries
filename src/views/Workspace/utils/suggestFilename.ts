/**
 * Suggest a short, filesystem-friendly filename from a SQL query: the table name
 * plus the operation kind. The backend still appends a timestamp + extension.
 */
export const suggestFilename = (sql: string | undefined): string => {
  if (!sql) return 'consulta'
  const lower = sql.toLowerCase()
  const m = lower.match(/from\s+`?([a-z0-9_.]+)`?/)
  let table = m ? m[1] : ''
  if (table.includes('.')) table = table.split('.').pop() ?? ''

  let verb = ''
  if (/\bcount\s*\(/.test(lower)) verb = 'conteo'
  else if (/\bsum\s*\(/.test(lower)) verb = 'suma'
  else if (/\bavg\s*\(/.test(lower)) verb = 'promedio'
  else if (/\bgroup\s+by\b/.test(lower)) verb = 'resumen'

  const base = [table, verb].filter(Boolean).join('_') || 'consulta'
  return base.replace(/[^a-z0-9_-]+/g, '_').slice(0, 50)
}
