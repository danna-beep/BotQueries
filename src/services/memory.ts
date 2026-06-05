import BaseService from '@/services/base'
import type { IMemoryEntry, IMemoryListResponse, IOkResponse } from '@/types'

/** User-curated notes that are injected into every chat prompt. */
class MemoryService extends BaseService {
  listMemory = () => this.get<IMemoryListResponse>('/api/memory')

  addMemory = (text: string) =>
    this.post<{ ok: boolean; entry: IMemoryEntry }>('/api/memory', { text })

  deleteMemory = (id: string) => this.del<IOkResponse>(`/api/memory/${encodeURIComponent(id)}`)

  clearMemory = () => this.del<IOkResponse>('/api/memory')
}

export default new MemoryService()
