import { useEffect, useRef } from 'react'
import { AlertTriangle, Check, CheckCircle2, Loader2, X } from 'lucide-react'
import { cn } from '@/utils/tailwind'
import { useTranslation } from '@/hooks'
import type { IWarningCreatePayload, WarningSeverity } from '@/types'
import { useSaveWarning } from '../../hooks'

const PILL: Record<string, string> = {
  ok: 'border-primary/40 bg-primary/10 text-primary',
  low: 'border-primary/40 bg-primary/10 text-primary',
  medium: 'border-warning/40 bg-warning/10 text-warning',
  high: 'border-destructive/40 bg-destructive/10 text-destructive',
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : [])

const buildPayload = (warning: Record<string, unknown>, userQuestion?: string): IWarningCreatePayload => {
  const sevRaw = str(warning.severity).toLowerCase()
  const severity = (['ok', 'low', 'medium', 'high'].includes(sevRaw) ? sevRaw : 'medium') as WarningSeverity
  return {
    client: str(warning.client).slice(0, 120) || '—',
    title: (str(warning.title) || str(warning.warning) || 'Análisis de conciliación').slice(0, 240),
    severity,
    tables_reviewed: arr(warning.tables_reviewed).slice(0, 32),
    possible_fix: str(warning.possible_fix).slice(0, 2000) || null,
    details: str(warning.details).slice(0, 8000) || null,
    sql_run: arr(warning.sql_run).slice(0, 16),
    user_question: userQuestion ? userQuestion.slice(0, 1000) : null,
  }
}

export interface WarningBlockProps {
  warning: Record<string, unknown>
  userQuestion?: string
}

/** Renders a ```warning block and auto-persists it once to the Warnings store. */
const WarningBlock = ({ warning, userQuestion }: WarningBlockProps) => {
  const { t } = useTranslation()
  const save = useSaveWarning()
  const postedRef = useRef(false)

  useEffect(() => {
    if (postedRef.current) return
    postedRef.current = true
    save.mutate(buildPayload(warning, userQuestion))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sev = (str(warning.severity) || 'medium').toLowerCase()
  const pill = PILL[sev] || PILL.medium
  const Icon = sev === 'ok' ? CheckCircle2 : AlertTriangle
  const title = str(warning.title) || str(warning.warning) || 'Análisis de conciliación'
  const tables = arr(warning.tables_reviewed)

  return (
    <div className='my-3 overflow-hidden rounded-lg border border-l-2 border-border border-l-warning/70 bg-muted/30'>
      <div className='flex items-start gap-2.5 px-3 py-2.5'>
        <span className={cn('inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border', pill)}>
          <Icon size={12} strokeWidth={2} />
        </span>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-mono text-[10px] uppercase tracking-wide text-muted-foreground'>
              {str(warning.client) || '—'}
            </span>
            <span className={cn('rounded-md border px-1.5 py-0.5 text-[10px]', pill)}>{sev}</span>
            {save.isPending && (
              <span className='flex items-center gap-1 font-mono text-[10px] text-muted-foreground/70'>
                <Loader2 size={9} className='animate-spin' /> {t('warnings.saving')}
              </span>
            )}
            {save.isSuccess && (
              <span className='flex items-center gap-1 font-mono text-[10px] text-primary'>
                <Check size={9} /> {t('warnings.saved')}
              </span>
            )}
            {save.isError && (
              <span className='flex items-center gap-1 font-mono text-[10px] text-destructive'>
                <X size={9} /> {t('warnings.saveFailed')}
              </span>
            )}
          </div>
          <div className='mt-1 text-[12.5px] font-medium leading-snug text-foreground/90'>{title}</div>
          {tables.length > 0 && (
            <div className='mt-1.5 flex flex-wrap items-center gap-1'>
              {tables.map((tbl) => (
                <span key={tbl} className='rounded border border-border bg-background/40 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80'>
                  {tbl}
                </span>
              ))}
            </div>
          )}
          {str(warning.possible_fix) && (
            <p className='mt-1.5 text-[11.5px] leading-relaxed text-warning'>{str(warning.possible_fix)}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default WarningBlock
