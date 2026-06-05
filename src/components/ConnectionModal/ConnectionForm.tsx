import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Input, LoadingButton, Switch, Typography, useToast } from '@getvaas/viplay-ui'
import { Check, Database, Eye, EyeOff, Plug } from 'lucide-react'
import { useTranslation } from '@/hooks'
import { cn } from '@/utils/tailwind'
import connectionService from '@/services/connection'
import type { IConnectRequest, IConnectionInfo, ISafeDbConfig } from '@/types'
import { useConnection } from '../ConnectionProvider/context'

interface ConnFormState {
  host: string
  port: number
  user: string
  password: string
  database: string
  charset: string
  ssl_disabled: boolean
}

const EMPTY: ConnFormState = {
  host: 'dbro.app.getvaas.com',
  port: 3306,
  user: '',
  password: '',
  database: '',
  charset: 'utf8mb4',
  ssl_disabled: false,
}

const seedFrom = (config: ISafeDbConfig | null | undefined): ConnFormState =>
  config
    ? {
        host: config.host,
        port: config.port,
        user: config.user,
        password: '',
        database: config.database ?? '',
        charset: config.charset,
        ssl_disabled: config.ssl_disabled,
      }
    : { ...EMPTY }

// Draft persisted in the browser so what the user types survives closing the
// modal (which unmounts this form) before a connection is established.
const DRAFT_STORAGE = 'dbchat_connection_draft'

const loadDraft = (): ConnFormState | null => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE)
    return raw ? ({ ...EMPTY, ...JSON.parse(raw) } as ConnFormState) : null
  } catch {
    return null
  }
}

const saveDraft = (state: ConnFormState) => {
  try {
    localStorage.setItem(DRAFT_STORAGE, JSON.stringify(state))
  } catch {
    /* ignore quota / serialization errors */
  }
}

const clearDraft = () => localStorage.removeItem(DRAFT_STORAGE)

const ConnectionForm = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { connection, isConnected, refetch, closeModal } = useConnection()

  const hasStoredPassword = !!connection?.config?.has_password
  const [form, setForm] = useState<ConnFormState>(() => loadDraft() ?? seedFrom(connection?.config))
  const [pwTouched, setPwTouched] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [testResult, setTestResult] = useState<IConnectionInfo | null>(null)
  const [availableDbs, setAvailableDbs] = useState<string[] | null>(null)

  // Re-seed when the persisted connection changes (e.g. after refetch), unless
  // the user has an unsaved local draft — that takes precedence so typed values
  // are never clobbered by a background status refresh.
  useEffect(() => {
    if (loadDraft()) return
    setForm(seedFrom(connection?.config))
    setPwTouched(false)
    setTestResult(null)
    setAvailableDbs(null)
  }, [connection])

  const update = <K extends keyof ConnFormState>(key: K, value: ConnFormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      saveDraft(next)
      return next
    })
  }

  const buildPayload = (database = form.database): IConnectRequest => ({
    host: form.host,
    port: Number(form.port) || 3306,
    user: form.user,
    password: form.password,
    database: database || null,
    charset: form.charset,
    ssl_disabled: form.ssl_disabled,
    connect_timeout: 10,
    read_timeout: 1800,
    use_saved_password: hasStoredPassword && !pwTouched && !form.password,
  })

  const testMutation = useMutation({
    mutationFn: () => connectionService.testConnection(buildPayload()),
    onSuccess: (res) => {
      setTestResult(res.details)
      toast({ title: t('connection.toast.testOk'), variant: 'success' })
    },
    onError: () => toast({ title: t('connection.toast.testFailed'), variant: 'destructive' }),
  })

  const loadDbsMutation = useMutation({
    mutationFn: () => connectionService.listDatabasesForConfig(buildPayload('')),
    onSuccess: (res) => setAvailableDbs(res.databases),
    onError: () => toast({ title: t('connection.toast.dbListFailed'), variant: 'destructive' }),
  })

  const connectMutation = useMutation({
    mutationFn: () => connectionService.connect(buildPayload()),
    onSuccess: () => {
      toast({ title: t('connection.toast.connected'), variant: 'success' })
      // Connection is now persisted server-side; drop the local draft so the
      // form re-seeds from the saved config (with the password redacted).
      clearDraft()
      refetch()
      closeModal()
    },
    onError: () => toast({ title: t('connection.toast.connectFailed'), variant: 'destructive' }),
  })

  const disconnectMutation = useMutation({
    mutationFn: () => connectionService.disconnect(),
    onSuccess: () => {
      toast({ title: t('connection.toast.disconnected'), variant: 'success' })
      refetch()
    },
    onError: () => toast({ title: t('connection.toast.error'), variant: 'destructive' }),
  })

  const canSubmit = form.host.trim() && form.user.trim()

  return (
    <form
      className='space-y-4'
      onSubmit={(e) => {
        e.preventDefault()
        if (canSubmit) connectMutation.mutate()
      }}
    >
      <div className='grid grid-cols-2 gap-4'>
        <Field label={t('connection.form.host')}>
          <Input value={form.host} onChange={(e) => update('host', e.target.value)} />
        </Field>
        <Field label={t('connection.form.port')}>
          <Input
            type='number'
            value={String(form.port)}
            onChange={(e) => update('port', Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label={t('connection.form.user')}>
        <Input value={form.user} onChange={(e) => update('user', e.target.value)} />
      </Field>

      <Field
        label={t('connection.form.password')}
        hint={hasStoredPassword && !pwTouched ? t('connection.form.storedPassword') : undefined}
      >
        <div className='relative'>
          <Input
            type={showPw ? 'text' : 'password'}
            value={form.password}
            placeholder={hasStoredPassword && !pwTouched ? '••••••••' : ''}
            onChange={(e) => {
              setPwTouched(true)
              update('password', e.target.value)
            }}
          />
          <button
            type='button'
            onClick={() => setShowPw((s) => !s)}
            className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground'
            aria-label={t('connection.form.togglePassword')}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </Field>

      <Field label={t('connection.form.database')}>
        <div className='flex gap-2'>
          {availableDbs ? (
            <select
              value={form.database}
              onChange={(e) => update('database', e.target.value)}
              className={cn(
                'flex-1 px-2.5 py-2 rounded-md bg-background border border-input text-sm'
              )}
            >
              <option value=''>{t('connection.form.pickDatabase')}</option>
              {availableDbs.map((db) => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>
          ) : (
            <Input
              className='flex-1'
              value={form.database}
              onChange={(e) => update('database', e.target.value)}
            />
          )}
          <LoadingButton
            type='button'
            variant='secondary'
            isLoading={loadDbsMutation.isPending}
            onClick={() => loadDbsMutation.mutate()}
          >
            <Database size={15} />
          </LoadingButton>
        </div>
      </Field>

      <div className='flex items-center gap-3'>
        <Switch
          checked={form.ssl_disabled}
          onCheckedChange={(checked) => update('ssl_disabled', checked)}
        />
        <Typography variant='p3'>{t('connection.form.sslDisabled')}</Typography>
      </div>

      {testResult && (
        <div className='flex items-center gap-2 text-success'>
          <Check size={15} />
          <Typography variant='p4'>
            {testResult.version ? `MySQL ${testResult.version}` : t('connection.toast.testOk')}
          </Typography>
        </div>
      )}

      <div className='flex justify-between gap-3 pt-2'>
        {isConnected ? (
          <LoadingButton
            type='button'
            variant='secondary'
            isLoading={disconnectMutation.isPending}
            onClick={() => disconnectMutation.mutate()}
          >
            {t('connection.form.disconnect')}
          </LoadingButton>
        ) : (
          <span />
        )}
        <div className='flex gap-3'>
          <LoadingButton
            type='button'
            variant='secondary'
            isLoading={testMutation.isPending}
            disabled={!canSubmit}
            onClick={() => testMutation.mutate()}
          >
            {t('connection.form.test')}
          </LoadingButton>
          <LoadingButton type='submit' isLoading={connectMutation.isPending} disabled={!canSubmit}>
            <Plug size={15} className='mr-1.5' />
            {t('connection.form.connect')}
          </LoadingButton>
        </div>
      </div>
    </form>
  )
}

interface FieldProps {
  label: string
  hint?: string
  children: React.ReactNode
}

const Field = ({ label, hint, children }: FieldProps) => (
  <label className='block space-y-1.5'>
    <div className='flex items-baseline justify-between'>
      <Typography variant='p4' className='text-muted-foreground uppercase tracking-wide'>
        {label}
      </Typography>
      {hint && (
        <Typography variant='p4' className='text-muted-foreground/70'>
          {hint}
        </Typography>
      )}
    </div>
    {children}
  </label>
)

export default ConnectionForm
