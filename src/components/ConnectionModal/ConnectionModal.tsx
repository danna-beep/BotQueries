import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@getvaas/viplay-ui'
import { useTranslation } from '@/hooks'
import { useConnection } from '../ConnectionProvider/context'
import ApiKeyPanel from './ApiKeyPanel'
import ConnectionForm from './ConnectionForm'
import GlossaryPanel from './GlossaryPanel'
import MemoryPanel from './MemoryPanel'
import UsagePanel from './UsagePanel'

export interface ConnectionModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Connection hub modal: DB connection settings plus the business glossary and
 * memory notes that feed the chat prompt. Mirrors the original DBChat modal.
 */
const ConnectionModal = ({ open, onClose }: ConnectionModalProps) => {
  const { t } = useTranslation()
  const { isConnected } = useConnection()

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPortal>
        <DialogOverlay className='fixed inset-0 bg-black/40 z-40' />
        <DialogContent className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl p-6 w-full max-w-xl z-50 max-h-[85vh] overflow-auto'>
          <DialogTitle className='text-lg font-semibold text-card-foreground mb-4'>
            {t('connection.modal.title')}
          </DialogTitle>

          <Tabs defaultValue='connection'>
            <TabsList className='mb-4'>
              <TabsTrigger value='connection'>{t('connection.tabs.connection')}</TabsTrigger>
              <TabsTrigger value='apiKey'>{t('connection.tabs.apiKey')}</TabsTrigger>
              <TabsTrigger value='usage'>{t('connection.tabs.usage')}</TabsTrigger>
              <TabsTrigger value='glossary' disabled={!isConnected}>
                {t('connection.tabs.glossary')}
              </TabsTrigger>
              <TabsTrigger value='memory' disabled={!isConnected}>
                {t('connection.tabs.memory')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='connection'>
              <ConnectionForm />
            </TabsContent>
            <TabsContent value='apiKey'>
              <ApiKeyPanel />
            </TabsContent>
            <TabsContent value='usage'>
              <UsagePanel />
            </TabsContent>
            <TabsContent value='glossary'>
              <GlossaryPanel />
            </TabsContent>
            <TabsContent value='memory'>
              <MemoryPanel />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export default ConnectionModal
