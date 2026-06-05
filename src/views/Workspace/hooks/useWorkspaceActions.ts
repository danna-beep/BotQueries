import { useCallback } from 'react'
import queryService from '@/services/query'
import type { IExportRequest } from '@/types'
import type { WorkspaceResult } from '../types'

/** Imperative query actions (run / export / download) used by Workspace panels. */
export const useWorkspaceActions = () => {
  const runSql = useCallback(async (sql: string, maxRows = 1000): Promise<WorkspaceResult> => {
    const r = await queryService.runQuery(sql, maxRows)
    return { ...r, sql }
  }, [])

  const exportSql = useCallback((payload: IExportRequest) => queryService.exportQuery(payload), [])

  /** Download an exported file as a blob (carries the Keycloak token, unlike `<a href>`). */
  const downloadExport = useCallback(async (filename: string) => {
    const res = await queryService.downloadExport(filename)
    const blob = new Blob([res.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  }, [])

  return { runSql, exportSql, downloadExport }
}
