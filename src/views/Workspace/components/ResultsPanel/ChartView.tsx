import { useEffect, useMemo, useState } from 'react'
import { BookmarkPlus } from 'lucide-react'
import { useTranslation } from '@/hooks'
import { cn } from '@/utils/tailwind'
import { Chart, classifyColumns, defaultChartKind, detectAxes } from '@/components/Chart'
import type { ChartKind } from '@/types'
import type { WorkspaceResult } from '../../types'
import SaveToDashboardModal from '../SaveToDashboardModal'

const btnCls = (active: boolean) =>
  cn(
    'rounded-md border px-2 py-1 text-[11px] transition-colors',
    active
      ? 'border-primary/40 bg-primary/10 text-primary'
      : 'border-border text-muted-foreground hover:text-foreground'
  )

const ChartView = ({ result }: { result: WorkspaceResult }) => {
  const { t } = useTranslation()
  const detected = useMemo(() => detectAxes(result), [result])
  const cols = useMemo(() => classifyColumns(result), [result])
  const defaultKind = useMemo(
    () => defaultChartKind({ rowCount: result?.row_count || 0, ySeries: detected.ySeries, xIsDate: detected.xIsDate }),
    [result?.row_count, detected.ySeries, detected.xIsDate]
  )

  const [kind, setKind] = useState<ChartKind>(defaultKind)
  const [topN, setTopN] = useState<number | 'all'>(20)
  const [xKey, setXKey] = useState(detected.xKey || '')
  const [selectedY, setSelectedY] = useState<string[]>(detected.ySeries)
  const [kpiLabel, setKpiLabel] = useState('')
  const [saveOpen, setSaveOpen] = useState(false)

  useEffect(() => {
    setKind(defaultKind)
    setXKey(detected.xKey || '')
    setSelectedY(detected.ySeries)
    setKpiLabel('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultKind, detected.xKey, detected.ySeries.join(',')])

  if (!result || result.row_count === 0) {
    return (
      <div className='flex flex-1 items-center justify-center text-center'>
        <p className='text-xl font-semibold italic text-foreground/70'>{t('workspace.chart.noData')}</p>
      </div>
    )
  }
  if (cols.numeric.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center text-center'>
        <p className='text-xl font-semibold italic text-foreground/70'>{t('workspace.chart.noNumeric.title')}</p>
        <p className='mt-2 text-[12.5px] text-muted-foreground'>{t('workspace.chart.noNumeric.hint')}</p>
      </div>
    )
  }

  const isSingle = result.row_count === 1
  const isCard = kind === 'kpi' || kind === 'ring'
  const availableYCols = cols.numeric.filter((c) => c !== xKey)

  const toggleSeries = (col: string) => {
    setSelectedY((prev) => {
      const has = prev.includes(col)
      if (has && prev.length === 1) return prev
      return has ? prev.filter((c) => c !== col) : [...prev, col]
    })
  }

  const kindButtons: { id: ChartKind; label: string }[] = isSingle
    ? [
        { id: 'ring', label: t('workspace.chart.kind.ring') },
        { id: 'kpi', label: t('workspace.chart.kind.kpi') },
      ]
    : [
        { id: 'bar', label: t('workspace.chart.kind.bar') },
        { id: 'line', label: t('workspace.chart.kind.line') },
        { id: 'area', label: t('workspace.chart.kind.area') },
        { id: 'pie', label: t('workspace.chart.kind.pie') },
      ]

  return (
    <div className='flex min-h-0 flex-1 flex-col p-4'>
      <div className='mb-2 flex flex-wrap items-center gap-1.5'>
        {kindButtons.map((b) => (
          <button key={b.id} onClick={() => setKind(b.id)} className={btnCls(kind === b.id)}>
            {b.label}
          </button>
        ))}
        {!isCard && (
          <div className='ml-2 flex items-center gap-1'>
            <span className='text-[11px] text-muted-foreground'>{t('workspace.chart.top')}</span>
            {([5, 10, 20, 50, 'all'] as const).map((n) => (
              <button key={n} onClick={() => setTopN(n)} className={btnCls(topN === n)}>
                {n === 'all' ? t('workspace.chart.all') : n}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setSaveOpen(true)}
          className='ml-auto inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-[11px] text-primary hover:bg-primary/20'
          title={t('workspace.save.title')}
        >
          <BookmarkPlus size={12} strokeWidth={2} />
          {t('workspace.save.button')}
        </button>
      </div>

      <div className='mb-3 flex flex-wrap items-start gap-3 border-b border-border/60 pb-3'>
        {isCard ? (
          <>
            <label className='flex items-center gap-2'>
              <span className='whitespace-nowrap text-[11px] text-muted-foreground'>{t('workspace.chart.metric')}:</span>
              <select
                value={selectedY[0] || ''}
                onChange={(e) => setSelectedY([e.target.value])}
                className='cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-[12px] outline-none focus:border-primary/50'
              >
                {cols.numeric.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className='flex items-center gap-2'>
              <span className='whitespace-nowrap text-[11px] text-muted-foreground'>{t('workspace.chart.label')}:</span>
              <input
                value={kpiLabel}
                onChange={(e) => setKpiLabel(e.target.value)}
                placeholder={selectedY[0] || t('workspace.chart.metric')}
                className='w-44 rounded-md border border-border bg-background px-2 py-1 text-[12px] outline-none focus:border-primary/50'
              />
            </label>
          </>
        ) : (
          <>
            <label className='flex items-center gap-2'>
              <span className='whitespace-nowrap text-[11px] text-muted-foreground'>{t('workspace.chart.xAxis')}:</span>
              <select
                value={xKey}
                onChange={(e) => setXKey(e.target.value)}
                className='max-w-[180px] cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-[12px] outline-none focus:border-primary/50'
              >
                {cols.all.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <div className='flex flex-wrap items-center gap-1.5'>
              <span className='whitespace-nowrap text-[11px] text-muted-foreground'>{t('workspace.chart.metrics')}:</span>
              {availableYCols.length === 0 ? (
                <span className='text-[11px] italic text-muted-foreground/70'>{t('workspace.chart.changeLabel')}</span>
              ) : (
                availableYCols.map((c) => (
                  <button key={c} onClick={() => toggleSeries(c)} className={btnCls(selectedY.includes(c))}>
                    {c}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <div className='min-h-0 flex-1'>
        <Chart
          result={result}
          kind={kind}
          topN={topN}
          xKey={xKey || undefined}
          ySeries={selectedY}
          kpiLabel={kpiLabel || undefined}
        />
      </div>

      <div className='mt-2 text-[11px] text-muted-foreground'>
        {!isCard
          ? t('workspace.chart.totalRows', { count: result.row_count })
          : kpiLabel
            ? `${t('workspace.chart.label')}: "${kpiLabel}"`
            : ''}
      </div>

      <SaveToDashboardModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        sql={result.sql}
        chartKind={kind}
        topN={topN}
        xKey={xKey || undefined}
        ySeries={selectedY}
        kpiLabel={kpiLabel || undefined}
        defaultTitle={`${kind} · ${result.sql.match(/from\s+([\w.]+)/i)?.[1] ?? 'query'}`}
      />
    </div>
  )
}

export default ChartView
