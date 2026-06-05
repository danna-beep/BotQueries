import { Check, FileDown, Loader2, X } from 'lucide-react'
import { cn } from '@/utils/tailwind'
import { formatNumber } from '@/utils/format'
import type { ChatPart } from '../../hooks'

type ToolCallPart = Extract<ChatPart, { type: 'tool_call' }>

export interface ToolCallBlockProps {
  part: ToolCallPart
  downloadExport: (filename: string) => Promise<void>
}

const ToolCallBlock = ({ part, downloadExport }: ToolCallBlockProps) => {
  const isExport = part.toolName === 'export_sql'
  const payload = part.payload
  const done = part.status === 'done'
  const elapsed = part.elapsedSeconds ?? 0
  const progressPct = done ? 100 : Math.min(95, (elapsed / 30) * 100)
  const hasError = payload?.kind === 'error'

  return (
    <div className='my-2 overflow-hidden rounded-lg border border-border bg-muted/30'>
      <div className='flex items-center gap-2 border-b border-border bg-card/40 px-2.5 py-1'>
        <span className='font-mono text-[10px] uppercase tracking-wide text-muted-foreground'>
          {isExport ? 'tool: export_sql' : 'tool: run_sql'}
        </span>
        <span
          className={cn(
            'ml-auto inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]',
            done && !hasError && 'border-primary/40 text-primary',
            hasError && 'border-destructive/40 text-destructive',
            !done && 'border-border text-muted-foreground'
          )}
        >
          {!done ? (
            <>
              <Loader2 size={9} className='animate-spin' />
              running{elapsed > 0 ? ` ${elapsed}s` : '…'}
            </>
          ) : hasError ? (
            <>
              <X size={9} /> error
            </>
          ) : (
            <>
              <Check size={9} /> done
            </>
          )}
        </span>
      </div>

      {!done && (
        <div className='h-0.5 overflow-hidden bg-background/60'>
          <div className='h-full bg-primary/70 transition-[width] duration-700 ease-out' style={{ width: `${progressPct}%` }} />
        </div>
      )}

      {part.sql && (
        <pre className='overflow-x-auto whitespace-pre-wrap break-words bg-background/40 px-3 py-2 font-mono text-[11.5px] text-foreground/90'>
          {part.sql}
        </pre>
      )}

      {done && payload?.kind === 'query_result' && (
        <div className='flex flex-wrap items-center gap-2 border-t border-border bg-card/40 px-2.5 py-1.5 font-mono text-[11px]'>
          <span className='text-muted-foreground'>→</span>
          <span className='text-primary'>{formatNumber(payload.row_count)} rows</span>
          <span className='text-muted-foreground'>·</span>
          <span className='text-muted-foreground'>{payload.elapsed_ms}ms</span>
          {payload.truncated && <span className='text-warning'>· truncated</span>}
        </div>
      )}

      {done && payload?.kind === 'export_ready' && (
        <div className='border-t border-border bg-card/40 px-2.5 py-1.5'>
          <button
            onClick={() => downloadExport(payload.filename)}
            className='inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] text-primary hover:bg-primary/20'
          >
            <FileDown size={11} />
            {payload.filename}
          </button>
        </div>
      )}

      {hasError && (
        <div className='border-t border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-[11px] text-destructive'>
          {payload.error}
        </div>
      )}
    </div>
  )
}

export default ToolCallBlock
