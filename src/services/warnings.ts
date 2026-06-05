import BaseService from '@/services/base'
import type { IOkResponse, IWarning, IWarningCreatePayload, IWarningsResponse } from '@/types'

/** Conciliation analysis history (warnings) emitted by the chat agent. */
class WarningService extends BaseService {
  listWarnings = () => this.get<IWarningsResponse>('/api/warnings')

  createWarning = (payload: IWarningCreatePayload) => this.post<IWarning>('/api/warnings', payload)

  deleteWarning = (id: string) => this.del<IOkResponse>(`/api/warnings/${encodeURIComponent(id)}`)

  clearWarnings = () => this.del<IOkResponse>('/api/warnings')
}

export default new WarningService()
