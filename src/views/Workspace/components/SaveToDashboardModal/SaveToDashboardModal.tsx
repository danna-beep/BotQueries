import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Input,
  LoadingButton,
  Button,
  Typography,
} from '@getvaas/viplay-ui'
import { Check } from 'lucide-react'
import { useTranslation } from '@/hooks'
import type { ChartKind } from '@/types'
import { useSaveToDashboard } from '../../hooks'

export interface SaveToDashboardModalProps {
  open: boolean
  onClose: () => void
  sql: string
  chartKind: ChartKind
  topN: number | 'all'
  xKey?: string
  ySeries?: string[]
  kpiLabel?: string
  defaultTitle: string
}

const labelCls = 'text-[10px] uppercase tracking-wide text-muted-foreground'
const fieldCls = 'mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50'

const SaveToDashboardModal = ({
  open,
  onClose,
  sql,
  chartKind,
  topN,
  xKey,
  ySeries,
  kpiLabel,
  defaultTitle,
}: SaveToDashboardModalProps) => {
  const { t } = useTranslation()
  const { dashboards, save, saving } = useSaveToDashboard()
  const [targetId, setTargetId] = useState('')
  const [newName, setNewName] = useState('')
  const [title, setTitle] = useState(defaultTitle)
  const [savedTo, setSavedTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setSavedTo(null)
    setTitle(defaultTitle)
    setNewName('')
    setTargetId(dashboards.length ? dashboards[0].id : '__new__')
  }, [open, defaultTitle, dashboards])

  const submit = async () => {
    if (!sql) return
    setError(null)
    try {
      const name = await save({
        target: targetId,
        newName,
        tile: {
          title: title.trim() || 'Untitled chart',
          sql,
          chart_kind: chartKind,
          top_n: topN,
          x_key: xKey || null,
          y_series: ySeries || null,
          kpi_label: kpiLabel || null,
        },
      })
      setSavedTo(name)
      setTimeout(() => onClose(), 900)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !saving && onClose()}>
      <DialogPortal>
        <DialogOverlay className='fixed inset-0 z-40 bg-black/40' />
        <DialogContent className='fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-card p-6 shadow-xl'>
          <DialogTitle className='mb-4 text-lg font-semibold text-card-foreground'>
            {t('workspace.save.title')}
          </DialogTitle>

          <div className='space-y-4'>
            <label className='block'>
              <span className={labelCls}>{t('workspace.save.chartTitle')}</span>
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className={fieldCls} />
            </label>

            <label className='block'>
              <span className={labelCls}>{t('workspace.save.dashboard')}</span>
              <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className={`${fieldCls} cursor-pointer`}>
                {dashboards.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
                <option value='__new__'>{t('workspace.save.createNew')}</option>
              </select>
            </label>

            {targetId === '__new__' && (
              <label className='block'>
                <span className={labelCls}>{t('workspace.save.newName')}</span>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} className='mt-1.5' />
              </label>
            )}

            <Typography variant='p4' className='text-muted-foreground'>
              {t('workspace.save.type')}: <span className='text-foreground/80'>{chartKind}</span>
            </Typography>

            {savedTo ? (
              <div className='flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary'>
                <Check size={14} strokeWidth={2.5} />
                {t('workspace.save.savedTo', { name: savedTo })}
              </div>
            ) : error ? (
              <div className='rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive'>
                {error}
              </div>
            ) : null}
          </div>

          <div className='mt-6 flex items-center justify-end gap-3'>
            <Button variant='secondary' onClick={() => !saving && onClose()} disabled={saving}>
              {t('workspace.save.cancel')}
            </Button>
            <LoadingButton onClick={submit} isLoading={saving} disabled={!sql || !!savedTo}>
              {t('workspace.save.save')}
            </LoadingButton>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export default SaveToDashboardModal
