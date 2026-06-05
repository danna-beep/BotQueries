import { useState } from 'react'
import { Play } from 'lucide-react'
import { useTranslation } from '@/hooks'
import { cn } from '@/utils/tailwind'
import type { WorkspaceResult } from '../../types'

export interface SqlEditorProps {
  result: WorkspaceResult | null
  onRun: (sql: string) => Promise<WorkspaceResult>
}

const SqlEditor = ({ result, onRun }: SqlEditorProps) => {
  const { t } = useTranslation()
  const [sql, setSql] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async () => {
    if (!sql.trim()) return
    setRunning(true)
    setError(null)
    try {
      await onRun(sql)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunning(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      execute()
    }
  }

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex items-center gap-2 border-b border-border px-3 py-2'>
        <button
          onClick={() => result?.sql && setSql(result.sql)}
          disabled={!result?.sql}
          className='rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40'
        >
          ← {t('workspace.sql.loadLast')}
        </button>
        <span className='text-[10.5px] text-muted-foreground/80'>{t('workspace.sql.runHint')}</span>
        <button
          onClick={execute}
          disabled={running || !sql.trim()}
          className='ml-auto inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] text-primary hover:bg-primary/20 disabled:opacity-40'
        >
          <Play size={11} strokeWidth={2.2} />
          {running ? t('workspace.sql.running') : t('workspace.sql.run')}
        </button>
      </div>
      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder='SELECT ...'
        spellCheck={false}
        className='w-full flex-1 resize-none bg-background/60 p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50'
      />
      {error && (
        <div className={cn('border-t border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive')}>
          {error}
        </div>
      )}
    </div>
  )
}

export default SqlEditor
