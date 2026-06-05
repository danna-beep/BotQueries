import type { IQueryResult } from '@/types'

/** A query result paired with the SQL that produced it (for display/export). */
export type WorkspaceResult = IQueryResult & { sql: string }

/** An entry in the query history panel. */
export interface HistoryItem {
  sql: string
  columns: string[]
  rows: IQueryResult['rows']
  row_count: number
  elapsed_ms: number
  truncated: boolean
  timestamp: string
}
