import { useEffect, useState } from 'react'
import { Input, LoadingButton, Typography } from '@getvaas/viplay-ui'
import { Check, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useTranslation } from '@/hooks'
import { useConnection } from '../ConnectionProvider/context'

/**
 * Anthropic API key management. The key is stored in the browser and used to
 * authenticate chat requests when no Claude Code session or env key is present.
 */
const ApiKeyPanel = () => {
  const { t } = useTranslation()
  const { apiKey, setApiKey, status } = useConnection()

  const hasClaudeCode = !!status?.anthropic_auth?.claude_code_session
  const hasEnvKey = !!status?.anthropic_auth?.env_api_key

  const [draft, setDraft] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => setDraft(apiKey), [apiKey])

  return (
    <div className='space-y-4'>
      {hasClaudeCode && (
        <div className='flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-primary'>
          <ShieldCheck size={15} />
          <Typography variant='p4'>{t('connection.apiKey.claudeSession')}</Typography>
        </div>
      )}
      {hasEnvKey && !apiKey && (
        <div className='flex items-center gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-success'>
          <Check size={15} />
          <Typography variant='p4'>{t('connection.apiKey.envKeySet')}</Typography>
        </div>
      )}

      <label className='block space-y-1.5'>
        <Typography variant='p4' className='uppercase tracking-wide text-muted-foreground'>
          {t('connection.apiKey.label')}
        </Typography>
        <div className='relative'>
          <Input
            type={showKey ? 'text' : 'password'}
            value={draft}
            placeholder='sk-ant-...'
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type='button'
            onClick={() => setShowKey((s) => !s)}
            className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground'
            aria-label={t('connection.apiKey.toggleKey')}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </label>

      <Typography variant='p4' className='text-muted-foreground/70'>
        {t('connection.apiKey.storedNote')}
      </Typography>

      <div className='flex justify-end gap-3 pt-1'>
        {apiKey && (
          <LoadingButton type='button' variant='secondary' onClick={() => setApiKey('')}>
            {t('connection.apiKey.remove')}
          </LoadingButton>
        )}
        <LoadingButton type='button' onClick={() => setApiKey(draft.trim())}>
          {t('connection.apiKey.save')}
        </LoadingButton>
      </div>
    </div>
  )
}

export default ApiKeyPanel
