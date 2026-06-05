import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell as ReCell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCompact, formatDateLabel, formatNumber, isNumeric, looksLikeDateColumn } from '@/utils/format'
import type { ChartKind, IQueryResult, QueryRow } from '@/types'
import { CHART_COLORS, detectAxes } from './chartData'

export interface ChartProps {
  result: IQueryResult | null | undefined
  kind: ChartKind
  topN?: number | 'all'
  compact?: boolean
  /** Override the auto-detected X axis / label column. */
  xKey?: string
  /** Override which numeric columns are rendered as metrics. */
  ySeries?: string[]
  /** Override the KPI / Ring label text. */
  kpiLabel?: string
}

interface TooltipEntry {
  dataKey: string
  name: string
  value: number
  color: string
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: unknown
}) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className='rounded-lg border border-border bg-card/95 px-3 py-2 font-mono text-[11px] shadow-xl backdrop-blur'>
      <div className='mb-1.5 text-[10px] uppercase tracking-wide text-muted-foreground'>
        {formatDateLabel(label)}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} className='mt-0.5 flex items-center gap-2'>
          <span className='h-2 w-2 shrink-0 rounded-sm' style={{ background: p.color }} />
          <span className='flex-1 text-muted-foreground'>{p.name}</span>
          <span className='font-medium tabular-nums text-foreground'>{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const ValueCard = ({
  row,
  metric,
  label,
  compact,
  ring,
}: {
  row: QueryRow
  metric: string
  label?: string
  compact?: boolean
  ring?: boolean
}) => {
  const value = Number(row[metric])
  const number = (
    <>
      <span className='text-[10px] uppercase tracking-wide text-muted-foreground'>{label || metric}</span>
      <span
        className='mt-2 font-bold leading-none tabular-nums text-primary'
        style={{ fontSize: compact ? 44 : 64 }}
      >
        {formatCompact(value)}
      </span>
      <span className='mt-2 font-mono text-[10.5px] tabular-nums text-muted-foreground'>
        {formatNumber(value)}
      </span>
    </>
  )

  if (!ring) {
    return (
      <div className='flex flex-1 items-center justify-center p-4'>
        <div className='flex min-w-[200px] flex-col items-center rounded-lg border border-border px-8 py-6'>
          {number}
        </div>
      </div>
    )
  }

  return (
    <div className='relative flex min-h-[200px] flex-1 items-center justify-center'>
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart>
          <defs>
            <linearGradient id='ring-grad' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor={CHART_COLORS[0]} stopOpacity={1} />
              <stop offset='100%' stopColor={CHART_COLORS[0]} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <Pie
            data={[{ name: metric, value: 1 }]}
            dataKey='value'
            innerRadius='62%'
            outerRadius='86%'
            startAngle={90}
            endAngle={-269.99}
            stroke='hsl(var(--card))'
            strokeWidth={2}
            fill='url(#ring-grad)'
            isAnimationActive={false}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center'>
        {number}
      </div>
    </div>
  )
}

/**
 * Render a chart from a query result. Reused by the ResultsPanel preview and
 * (Phase 4) the dashboard tiles. Honors the requested kind + topN + overrides.
 */
export const Chart = ({
  result,
  kind,
  topN = 20,
  compact = false,
  xKey: xKeyOverride,
  ySeries: ySeriesOverride,
  kpiLabel,
}: ChartProps) => {
  const detected = useMemo(() => detectAxes(result), [result])

  const xKey = xKeyOverride || detected.xKey || undefined
  const xIsDate = xKeyOverride
    ? looksLikeDateColumn(xKeyOverride, result?.rows?.[0]?.[xKeyOverride])
    : detected.xIsDate

  const ySeries = useMemo(() => {
    if (!ySeriesOverride?.length) return detected.ySeries
    if (!result?.rows?.length) return []
    const sample = result.rows[0]
    return ySeriesOverride.filter((c) => c !== xKey && isNumeric(sample[c]))
  }, [ySeriesOverride, detected.ySeries, xKey, result])

  const rows = useMemo<QueryRow[]>(() => {
    if (!result?.rows?.length) return []
    const base = result.rows.map((r) => {
      const out: QueryRow = { ...r }
      for (const c of ySeries) {
        const v = r[c]
        out[c] = typeof v === 'number' ? v : Number(v)
      }
      return out
    })
    if (xIsDate) return base.slice(0, topN === 'all' ? base.length : topN)
    const primary = ySeries[0]
    if (primary) {
      base.sort((a, b) => (Number(b[primary]) || 0) - (Number(a[primary]) || 0))
    }
    return base.slice(0, topN === 'all' ? base.length : topN)
  }, [result, ySeries, topN, xIsDate])

  if (!result || result.row_count === 0) {
    return (
      <div className='flex flex-1 items-center justify-center font-mono text-xs text-muted-foreground'>
        sin datos
      </div>
    )
  }
  if (ySeries.length === 0) {
    return (
      <div className='flex flex-1 items-center justify-center px-4 text-center text-xs text-muted-foreground'>
        No hay columnas numéricas para graficar.
      </div>
    )
  }

  if (kind === 'kpi') {
    return <ValueCard row={rows[0]} metric={ySeries[0]} label={kpiLabel} compact={compact} />
  }
  if (kind === 'ring') {
    return <ValueCard row={rows[0]} metric={ySeries[0]} label={kpiLabel} compact={compact} ring />
  }

  const tooltipProps = {
    content: <CustomTooltip />,
    cursor: { fill: 'hsl(var(--primary) / 0.08)' },
  }
  const axisTick = { fontSize: compact ? 9 : 10, fontFamily: 'monospace', fill: 'hsl(var(--muted-foreground))' }
  const xTickFormatter = xIsDate ? formatDateLabel : (v: unknown) => String(v)

  if (kind === 'pie') {
    const metric = ySeries[0]
    const total = rows.reduce((sum, r) => sum + (Number(r[metric]) || 0), 0) || 1
    return (
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Pie
            data={rows}
            dataKey={metric}
            nameKey={xKey}
            cx='50%'
            cy='50%'
            innerRadius='55%'
            outerRadius='80%'
            paddingAngle={1.5}
            stroke='hsl(var(--card))'
            strokeWidth={2}
            label={
              compact
                ? false
                : ({ name, value }: { name: string; value: number }) =>
                    `${name} · ${((value / total) * 100).toFixed(1)}%`
            }
            labelLine={compact ? false : { stroke: 'hsl(var(--muted-foreground) / 0.4)', strokeWidth: 1 }}
          >
            {rows.map((_, i) => (
              <ReCell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipProps} />
          {compact && <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} iconType='circle' iconSize={7} />}
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const ChartComp = kind === 'line' ? LineChart : kind === 'area' ? AreaChart : BarChart

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <ChartComp data={rows} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
        <defs>
          {ySeries.map((s, i) => {
            const color = CHART_COLORS[i % CHART_COLORS.length]
            return (
              <linearGradient key={s} id={`fill-${kind}-${i}`} x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor={color} stopOpacity={0.35} />
                <stop offset='100%' stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            )
          })}
        </defs>
        <CartesianGrid stroke='hsl(var(--border) / 0.55)' strokeDasharray='3 4' vertical={false} />
        <XAxis
          dataKey={xKey}
          stroke='transparent'
          tick={axisTick}
          tickFormatter={xTickFormatter}
          tickLine={false}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          interval='preserveStartEnd'
          minTickGap={compact ? 18 : 24}
        />
        <YAxis
          stroke='transparent'
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatCompact}
          width={compact ? 36 : 44}
        />
        <Tooltip {...tooltipProps} />
        {ySeries.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: compact ? 10 : 11, fontFamily: 'monospace', color: 'hsl(var(--muted-foreground))' }}
            iconType='circle'
            iconSize={7}
          />
        )}
        {ySeries.map((s, i) => {
          const color = CHART_COLORS[i % CHART_COLORS.length]
          if (kind === 'bar') {
            return <Bar key={s} dataKey={s} fill={color} radius={[4, 4, 0, 0]} maxBarSize={48} />
          }
          if (kind === 'area') {
            return (
              <Area
                key={s}
                type='monotone'
                dataKey={s}
                stroke={color}
                fill={`url(#fill-${kind}-${i})`}
                strokeWidth={2}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            )
          }
          return (
            <Line
              key={s}
              type='monotone'
              dataKey={s}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          )
        })}
      </ChartComp>
    </ResponsiveContainer>
  )
}

export default Chart
