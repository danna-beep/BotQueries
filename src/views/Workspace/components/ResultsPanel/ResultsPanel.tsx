import { useEffect, useState } from 'react'
import { AlertTriangle, BarChart3, Check, Code2, Copy, FileDown, Table2, X } from 'lucide-react'
import { useTranslation } from '@/hooks'
import { cn } from '@/utils/tailwind'
import { formatNumber } from '@/utils/format'
import type { ExportFormat, IExportRequest, IExportResponse } from '@/types'
import type { WorkspaceResult } from '../../types'
import { suggestFilename } from '../../utils/suggestFilename'
import TableView from './TableView'
import ChartView from './ChartView'
import SqlEditor from './SqlEditor'
import WarningsView from './WarningsView'

type ResultTab = 'table' | 'chart' | 'sql' | 'warnings'

export interface ResultsPanelProps {
  result: WorkspaceResult | null
  onRun: (sql: string) => Promise<WorkspaceResult>
  exportSql: (payload: IExportRequest) => Promise<IExportResponse>
  downloadExport: (filename: string) => Promise<void>
}

const tabCls = (active: boolean) =>
  cn(
    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11.5px] font-medium tracking-tight transition-all',
    active ? 'border border-border bg-muted text-foreground' : 'border border-transparent text-muted-foreground hover:text-foreground'
  )

const ResultsPanel = ({ result, onRun, exportSql, downloadExport }: ResultsPanelProps) => {
  const { t } = useTranslation()
  const [tab, setTab] = useState<ResultTab>('table')
  const [exporting, setExporting] = useState<ExportFormat | null>(null)
  const [exportInfo, setExportInfo] = useState<IExportResponse | null>(null)
  const [exportErr, setExportErr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pendingFmt, setPendingFmt] = useState<ExportFormat | null>(null)
  const [exportName, setExportName] = useState('')

  useEffect(() => {
    setExportInfo(null)
    setExportErr(null)
    setPendingFmt(null)
  }, [result?.sql])

  const openExport = (fmt: ExportFormat) => {
    setExportInfo(null)
    setExportErr(null)
    setExportName(suggestFilename(result?.sql))
    setPendingFmt(fmt)
  }

  const handleExport = async () => {
    if (!result?.sql || !pendingFmt) return
    const fmt = pendingFmt
    const name = (exportName || 'consulta').trim() || 'consulta'
    setExporting(fmt)
    setExportErr(null)
    try {
      const r = await exportSql({ sql: result.sql, format: fmt, filename: name })
      setExportInfo(r)
      setPendingFmt(null)
    } catch (e) {
      setExportErr(e instanceof Error ? e.message : String(e))
    } finally {
      setExporting(null)
    }
  }

  const copySql = async () => {
    if (!result?.sql) return
    try {
      await navigator.clipboard.writeText(result.sql)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const showToolbar = result && tab !== 'sql' && tab !== 'warnings'

  return (
    <section className='flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card'>
      <div className='flex items-center gap-1 border-b border-border px-3 py-2'>
        <button onClick={() => setTab('table')} className={tabCls(tab === 'table')}>
          <Table2 size={13} strokeWidth={1.8} /> {t('workspace.results.tabs.table')}
        </button>
        <button onClick={() => setTab('chart')} className={tabCls(tab === 'chart')}>
          <BarChart3 size={13} strokeWidth={1.8} /> {t('workspace.results.tabs.chart')}
        </button>
        <button onClick={() => setTab('sql')} className={tabCls(tab === 'sql')}>
          <Code2 size={13} strokeWidth={1.8} /> {t('workspace.results.tabs.sql')}
        </button>
        <div className='mx-1 h-4 w-px bg-border' />
        <button onClick={() => setTab('warnings')} className={tabCls(tab === 'warnings')}>
          <AlertTriangle size={13} strokeWidth={1.8} /> {t('workspace.results.tabs.warnings')}
        </button>

        {showToolbar && (
          <div className='ml-auto flex flex-wrap items-center gap-1.5'>
            <span className='inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground'>
              <span className='h-1 w-1 rounded-full bg-primary' />
              <span className='tabular-nums'>{formatNumber(result.row_count)}</span>
              {t('workspace.results.rows')}
            </span>
            <span className='rounded-md border border-border px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground'>
              {result.elapsed_ms} ms
            </span>
            {result.truncated && (
              <span className='rounded-md border border-warning/40 px-1.5 py-0.5 text-[10px] text-warning'>
                {t('workspace.results.truncated')}
              </span>
            )}
            <div className='mx-1 h-4 w-px bg-border' />
            {(['csv', 'xlsx', 'json'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => openExport(fmt)}
                disabled={!!exporting}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]',
                  pendingFmt === fmt
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                <FileDown size={11} />
                {fmt}
              </button>
            ))}
            <button
              onClick={copySql}
              className='inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground'
              title={t('workspace.results.copySql')}
            >
              {copied ? <Check size={11} className='text-primary' /> : <Copy size={11} />}
            </button>
          </div>
        )}
      </div>

      {pendingFmt && (
        <div className='flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-2'>
          <FileDown size={13} className='text-primary' />
          <span className='whitespace-nowrap text-[11px] text-muted-foreground'>{t('workspace.export.filename')}:</span>
          <input
            autoFocus
            value={exportName}
            onChange={(e) => setExportName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExport()
              else if (e.key === 'Escape') setPendingFmt(null)
            }}
            className='min-w-0 flex-1 rounded-md border border-primary/40 bg-background px-2.5 py-1 text-[12.5px] outline-none focus:border-primary/70'
          />
          <span className='font-mono text-[12px] text-muted-foreground'>.{pendingFmt}</span>
          <button
            onClick={handleExport}
            disabled={!!exporting}
            className='inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] text-primary hover:bg-primary/20'
          >
            <FileDown size={11} strokeWidth={2} /> {exporting ? t('workspace.export.exporting') : t('workspace.export.download')}
          </button>
          <button
            onClick={() => setPendingFmt(null)}
            disabled={!!exporting}
            className='inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground'
            title={t('workspace.export.cancel')}
          >
            <X size={12} />
          </button>
        </div>
      )}

      {exportInfo && (
        <div className='flex items-center gap-3 border-b border-border bg-primary/10 px-3 py-2 text-primary'>
          <Check size={13} />
          <span className='font-mono text-xs'>
            {formatNumber(exportInfo.row_count)} · {exportInfo.filename}
          </span>
          <button
            onClick={() => downloadExport(exportInfo.filename)}
            className='ml-auto inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] text-primary hover:bg-primary/20'
          >
            <FileDown size={11} />
            {t('workspace.export.download')}
          </button>
          <button onClick={() => setExportInfo(null)} className='text-primary/70 hover:text-primary'>
            <X size={12} />
          </button>
        </div>
      )}

      {exportErr && (
        <div className='flex items-center gap-3 border-b border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive'>
          <span className='flex-1 font-mono text-xs'>{exportErr}</span>
          <button onClick={() => setExportErr(null)} className='text-destructive/70 hover:text-destructive'>
            <X size={12} />
          </button>
        </div>
      )}

      {tab === 'table' && <TableView result={result} />}
      {tab === 'chart' && (result ? <ChartView result={result} /> : <TableView result={result} />)}
      {tab === 'sql' && <SqlEditor result={result} onRun={onRun} />}
      {tab === 'warnings' && <WarningsView />}
    </section>
  )
}

export default ResultsPanel
