import { AlertTriangle } from 'lucide-react'
import { Button, Typography } from '@getvaas/viplay-ui'
import { useTranslation } from '@/hooks'
import { cn } from '@/utils/tailwind'
import { useConnection } from '../ConnectionProvider/context'

/**
 * Connection status banner. Renders nothing when the DB is connected; otherwise
 * surfaces a "not configured" or "cannot connect" alert with a CTA that opens
 * the connection modal. Mirrors the boot banners in the original DBChat App.
 */
const ConnectionBanner = () => {
  const { t } = useTranslation()
  const { status, isLoading, openModal } = useConnection()

  // Nothing to show while loading the first status or when the DB is live.
  if (isLoading || status?.db_ok) return null

  // No status at all means the status request failed (backend unreachable).
  const backendUnreachable = !status
  const notConfigured = !!status && !status.configured
  const detail = typeof status?.details === 'string' ? status.details : null

  const message = backendUnreachable
    ? t('connection.banner.backendUnreachable')
    : notConfigured
      ? t('connection.banner.notConfigured')
      : `${t('connection.banner.cannotConnect')}${detail ? ` — ${detail}` : ''}`

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-5 py-2.5 border-b text-sm',
        notConfigured
          ? 'border-warning/40 bg-warning/10 text-warning'
          : 'border-destructive/40 bg-destructive/10 text-destructive'
      )}
    >
      <AlertTriangle size={15} strokeWidth={1.8} className='shrink-0' />
      <Typography variant='p4'>{message}</Typography>
      <Button variant='secondary' size='s' className='ml-auto' onClick={openModal}>
        {notConfigured ? t('connection.banner.configureNow') : t('connection.banner.editConnection')}
      </Button>
    </div>
  )
}

export default ConnectionBanner
