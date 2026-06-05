import BaseService from '@/services/base'
import type { IContextSummary, IDatabaseSchema } from '@/types'

/** Schema introspection + business-context summary. */
class SchemaService extends BaseService {
  getSchema = () => this.get<IDatabaseSchema>('/api/schema')

  getContextSummary = () => this.get<IContextSummary>('/api/context')

  refreshContext = () => this.post<IContextSummary & { ok: boolean }>('/api/context/refresh')
}

export default new SchemaService()
