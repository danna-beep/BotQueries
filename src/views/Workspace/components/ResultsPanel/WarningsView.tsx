import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, RefreshCw, Trash2 } from 'lucide-react'
import { useTranslation } from '@/hooks'
import { cn } from '@/utils/tailwind'
import type { IWarning, WarningSeverity } from '@/types'
import { useWarnings } from '../../hooks'

const SEV: Record<WarningSeverity, { pill: string; side: string; icon: typeof AlertTriangle }> = {
  ok: { pill: 'border-primary/40 bg-primary/10 text-primary', side: 'border-l-primary/70', icon: CheckCircle2 },
  low: { pill: 'border-primary/40 bg-primary/10 text-primary', side: 'border-l-primary/70', icon: AlertTriangle },
  medium: { pill: 'border-warning/40 bg-warning/10 text-warning', side: 'border-l-warning/70', icon: AlertTriangle },
  high: { pill: 'border-destructive/40 bg-destructive/10 text-destructive', side: 'border-l-destructive/70', icon: AlertTriangle },
}

const formatTimestamp = (ms: number): string => {
  if (!ms) return ''
  try {
    return new Date(ms).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const Section = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div>
    <div className='mb-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground/70'>{label}</div>
    <div className={className}>{children}</div>
  </div>
)

const WarningCard = ({ warning, onDelete }: { warning: IWarning; onDelete: (id: string) => void }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const sev = SEV[warning.severity] || SEV.medium
  const Icon = sev.icon

  return (
    <div className={cn('overflow-hidden rounded-lg border border-l-2 border-border bg-muted/30', sev.side)}>
      <button onClick={() => setOpen((o) => !o)} className='flex w-full items-start gap-3 px-3.5 py-3 text-left hover:bg-muted/40'>
        <span className={cn('inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border', sev.pill)}>
          <Icon size={13} strokeWidth={2} />
        </span>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-mono text-[10px] uppercase tracking-wide text-muted-foreground'>{warning.client}</span>
            <span className={cn('rounded-md border px-1.5 py-0.5 text-[10px]', sev.pill)}>{warning.severity}</span>
            <span className='ml-auto font-mono text-[10px] text-muted-foreground/70'>{formatTimestamp(warning.created_at)}</span>
          </div>
          <div className='mt-1 text-[13px] font-medium leading-snug text-foreground/90'>{warning.title}</div>
          {warning.tables_reviewed.length > 0 && (
            <div className='mt-1.5 flex flex-wrap items-center gap-1'>
              <span className='font-mono text-[10px] text-muted-foreground/70'>{t('warnings.card.tables')}:</span>
              {warning.tables_reviewed.map((tbl) => (
                <span key={tbl} className='rounded border border-border bg-background/40 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80'>
                  {tbl}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className='mt-1 shrink-0 text-muted-foreground/60'>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {open && (
        <div className='space-y-2.5 border-t border-border/60 bg-background/20 px-3.5 pb-3 pt-2'>
          {warning.details && (
            <Section label={t('warnings.card.detail')} className='whitespace-pre-wrap text-[12.5px] leading-relaxed text-foreground/85'>
              {warning.details}
            </Section>
          )}
          {warning.possible_fix && (
            <Section label={t('warnings.card.fix')} className='whitespace-pre-wrap text-[12.5px] leading-relaxed text-warning'>
              {warning.possible_fix}
            </Section>
          )}
          {warning.user_question && (
            <Section label={t('warnings.card.question')} className='text-[12px] italic leading-relaxed text-muted-foreground'>
              “{warning.user_question}”
            </Section>
          )}
          {warning.sql_run.length > 0 && (
            <Section label={t('warnings.card.queries')} className='space-y-1'>
              {warning.sql_run.map((sql, i) => (
                <pre key={i} className='overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5 font-mono text-[11px] text-foreground/80'>
                  {sql}
                </pre>
              ))}
            </Section>
          )}
          <div className='flex justify-end pt-1'>
            <button
              onClick={() => onDelete(warning.id)}
              className='inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground/70 transition-colors hover:text-destructive'
            >
              <Trash2 size={11} />
              {t('warnings.card.delete')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

type Filter = 'all' | 'issues' | 'ok'

const WarningsView = () => {
  const { t } = useTranslation()
  const { warnings, isFetching, refetch, deleteWarning, clearWarnings } = useWarnings()
  const [filter, setFilter] = useState<Filter>('all')

  const counts = warnings.reduce(
    (acc, w) => {
      acc.all++
      if (w.severity === 'ok') acc.ok++
      else acc.issues++
      return acc
    },
    { all: 0, ok: 0, issues: 0 }
  )

  const filtered = warnings.filter((w) =>
    filter === 'issues' ? w.severity !== 'ok' : filter === 'ok' ? w.severity === 'ok' : true
  )

  const filterBtn = (id: Filter, label: string, count: number) => (
    <button
      onClick={() => setFilter(id)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium tracking-tight transition-all',
        filter === id ? 'border border-border bg-muted text-foreground' : 'border border-transparent text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
      <span className='font-mono text-[10px] tabular-nums text-muted-foreground/80'>{count}</span>
    </button>
  )

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <div className='flex items-center gap-1 border-b border-border bg-card/40 px-3 py-2'>
        {filterBtn('all', t('warnings.filters.all'), counts.all)}
        {filterBtn('issues', t('warnings.filters.issues'), counts.issues)}
        {filterBtn('ok', t('warnings.filters.ok'), counts.ok)}
        <div className='ml-auto flex items-center gap-1'>
          <button onClick={() => refetch()} className='inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground' title={t('warnings.reload')}>
            <RefreshCw size={11} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => {
              if (warnings.length && window.confirm(t('warnings.confirmClear'))) clearWarnings()
            }}
            disabled={!warnings.length}
            className='inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-destructive disabled:opacity-40'
            title={t('warnings.clearAll')}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <div className='flex-1 space-y-2 overflow-auto px-3 py-3'>
        {filtered.length === 0 ? (
          <div className='flex h-full flex-col items-center justify-center px-6 py-10 text-center'>
            <AlertTriangle size={28} strokeWidth={1.4} className='mb-3 text-muted-foreground/40' />
            <p className='text-lg font-semibold italic text-foreground/70'>
              {warnings.length === 0 ? t('warnings.empty.none.title') : t('warnings.empty.filter.title')}
            </p>
            <p className='mt-2 max-w-xs text-[11.5px] text-muted-foreground'>
              {warnings.length === 0 ? t('warnings.empty.none.hint') : t('warnings.empty.filter.hint')}
            </p>
          </div>
        ) : (
          filtered.map((w) => <WarningCard key={w.id} warning={w} onDelete={(id) => deleteWarning(id)} />)
        )}
      </div>
    </div>
  )
}

export default WarningsView
