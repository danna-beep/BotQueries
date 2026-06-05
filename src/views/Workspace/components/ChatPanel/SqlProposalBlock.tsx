import { useState } from 'react'
import { Check, Loader2, Play } from 'lucide-react'
import { useTranslation } from '@/hooks'
import { cn } from '@/utils/tailwind'
import { formatNumber } from '@/utils/format'
import type { WorkspaceResult } from '../../types'

export interface SqlProposalBlockProps {
  sql: string
  onRun: (sql: string) => Promise<WorkspaceResult>
}

const SqlProposalBlock = ({ sql, onRun }: SqlProposalBlockProps) => {
  const { t } = useTranslation()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<WorkspaceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setRunning(true)
    setError(null)
    try {
      setResult(await onRun(sql))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className='my-3 overflow-hidden rounded-lg border border-border bg-muted/30'>
      <div className='flex items-center gap-2 border-b border-border/70 px-3 py-2'>
        <span className='h-1.5 w-1.5 rounded-full bg-primary/70' />
        <span className='text-[11.5px] font-medium tracking-tight text-foreground/85'>{t('workspace.chat.proposedSql')}</span>
        <button
          onClick={run}
          disabled={running}
          className={cn(
            'ml-auto inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all',
            'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20',
            running && 'cursor-wait opacity-60'
          )}
        >
          {running ? (
            <>
              <Loader2 size={11} className='animate-spin' /> {t('workspace.chat.running')}
            </>
          ) : result ? (
            <>
              <Check size={11} strokeWidth={2.5} /> {t('workspace.chat.done')}
            </>
          ) : (
            <>
              <Play size={11} strokeWidth={2.2} /> {t('workspace.chat.run')}
            </>
          )}
        </button>
      </div>
      <pre className='overflow-x-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-[12px] leading-[1.6] text-foreground/90'>
        {sql}
      </pre>
      {result && !error && (
        <div className='flex flex-wrap items-center gap-2 border-t border-border/70 px-3 py-2 font-mono text-[11px]'>
          <span className='h-1 w-1 rounded-full bg-primary' />
          <span className='tabular-nums text-primary'>{t('workspace.chat.rows', { count: formatNumber(result.row_count) })}</span>
          <span className='text-muted-foreground/60'>·</span>
          <span className='tabular-nums text-muted-foreground'>{result.elapsed_ms}ms</span>
          {result.truncated && <span className='text-warning'>· {t('workspace.results.truncated')}</span>}
        </div>
      )}
      {error && (
        <div className='border-t border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-[11px] text-destructive'>
          {error}
        </div>
      )}
    </div>
  )
}

export default SqlProposalBlock
