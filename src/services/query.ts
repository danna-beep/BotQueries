import BaseService from '@/services/base'
import restClient from '@/services/restClient'
import type { IExportRequest, IExportResponse, IQueryResult } from '@/types'

/** Mirrors the backend `DEFAULT_ROW_LIMIT` in `services.py`. */
export const DEFAULT_ROW_LIMIT = 1000
/** Mirrors the backend `MAX_ROW_LIMIT` in `services.py`. */
export const MAX_ROW_LIMIT = 100_000

/** Read-only query execution + result export against the DBChat backend. */
class QueryService extends BaseService {
  runQuery = (sql: string, maxRows: number = DEFAULT_ROW_LIMIT) =>
    this.post<IQueryResult>('/api/query', { sql, max_rows: maxRows })

  exportQuery = (payload: IExportRequest) => this.post<IExportResponse>('/api/export', payload)

  /**
   * Download a previously exported file as a blob. Uses `restClient` so the
   * Keycloak bearer token is attached (a plain `<a href>` would not carry it).
   */
  downloadExport = (filename: string) =>
    restClient.get(`/api/download/${encodeURIComponent(filename)}`, { responseType: 'blob' })
}

export default new QueryService()
