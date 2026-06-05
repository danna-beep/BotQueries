import BaseService from '@/services/base'
import type { IGlossarySummary, IGlossaryUploadResponse, IOkResponse } from '@/types'

/** Business glossary that feeds the chat prompt context. */
class GlossaryService extends BaseService {
  getGlossary = () => this.get<IGlossarySummary>('/api/glossary')

  uploadGlossary = (csvText: string) =>
    this.post<IGlossaryUploadResponse>('/api/glossary', { csv_text: csvText })

  clearGlossary = () => this.del<IOkResponse>('/api/glossary')
}

export default new GlossaryService()
