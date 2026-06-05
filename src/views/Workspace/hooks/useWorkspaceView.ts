import { useCallback, useState } from 'react'
import type { HistoryItem, WorkspaceResult } from '../types'

const MAX_HISTORY = 50

/** UI state for the Workspace: current result and query history. */
export const useWorkspaceView = () => {
  const [result, setResult] = useState<WorkspaceResult | null>(null)
  const [queryHistory, setQueryHistory] = useState<HistoryItem[]>([])

  /** Set the current result and push it onto the (capped) history. */
  const recordResult = useCallback((r: WorkspaceResult) => {
    setResult(r)
    if (r.sql) {
      setQueryHistory((h) =>
        [
          {
            sql: r.sql,
            columns: r.columns,
            rows: r.rows,
            row_count: r.row_count,
            elapsed_ms: r.elapsed_ms,
            truncated: r.truncated,
            timestamp: new Date().toISOString(),
          },
          ...h,
        ].slice(0, MAX_HISTORY)
      )
    }
  }, [])

  const reloadFromHistory = useCallback((h: HistoryItem) => {
    setResult({
      sql: h.sql,
      columns: h.columns,
      rows: h.rows,
      row_count: h.row_count,
      elapsed_ms: h.elapsed_ms,
      truncated: h.truncated,
    })
  }, [])

  /** Seed an empty result with a `SELECT *` so the user can run it from the SQL tab. */
  const onTableClick = useCallback((tableName: string) => {
    setResult({
      sql: `SELECT * FROM ${tableName} LIMIT 10`,
      columns: [],
      rows: [],
      row_count: 0,
      elapsed_ms: 0,
      truncated: false,
    })
  }, [])

  return {
    state: { result, queryHistory },
    action: { setResult, recordResult, reloadFromHistory, onTableClick },
  }
}
