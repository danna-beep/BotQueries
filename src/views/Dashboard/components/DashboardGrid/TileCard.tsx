import { AlertTriangle, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { useTranslation } from '@/hooks'
import { Chart } from '@/components/Chart'
import type { ITile } from '@/types'
import { useTileQuery } from '../../hooks'

export interface TileCardProps {
  tile: ITile
  onDelete: (tileId: string) => void
}

const TileCard = ({ tile, onDelete }: TileCardProps) => {
  const { t } = useTranslation()
  const { result, isLoading, error, refetch } = useTileQuery(tile.sql)

  const remove = () => {
    if (window.confirm(t('dashboard.tile.confirmDelete', { title: tile.title }))) onDelete(tile.id)
  }

  return (
    <div className='flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card'>
      <div className='drag-handle flex cursor-move items-center gap-2 border-b border-border/70 bg-background/30 px-3 py-2'>
        <span className='h-1.5 w-1.5 rounded-full bg-primary/70' />
        <span className='flex-1 truncate text-[12.5px] font-medium tracking-tight text-foreground/90'>{tile.title}</span>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          title={t('dashboard.tile.refresh')}
          className='no-drag text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40'
        >
          {isLoading ? <Loader2 size={13} className='animate-spin' /> : <RefreshCw size={13} strokeWidth={1.8} />}
        </button>
        <button
          onClick={remove}
          title={t('dashboard.tile.delete')}
          className='no-drag text-muted-foreground transition-colors hover:text-destructive'
        >
          <Trash2 size={13} strokeWidth={1.8} />
        </button>
      </div>

      <div className='flex min-h-0 flex-1 flex-col'>
        {error ? (
          <div className='flex flex-1 items-start gap-2 overflow-auto p-3 font-mono text-[11px] text-destructive'>
            <AlertTriangle size={12} className='mt-0.5 flex-shrink-0' />
            <span className='break-words'>{error}</span>
          </div>
        ) : !result || isLoading ? (
          <div className='flex flex-1 items-center justify-center text-muted-foreground'>
            <Loader2 size={18} className='animate-spin' />
          </div>
        ) : (
          <div className='min-h-0 flex-1 p-2'>
            <Chart
              result={result}
              kind={tile.chart_kind}
              topN={typeof tile.top_n === 'number' ? tile.top_n : 20}
              xKey={tile.x_key || undefined}
              ySeries={tile.y_series || undefined}
              kpiLabel={tile.kpi_label || undefined}
              compact
            />
          </div>
        )}
        <div className='flex items-center gap-2 border-t border-border/70 bg-background/20 px-3 py-1 font-mono text-[10px] text-muted-foreground/80'>
          <span className='uppercase tracking-wide'>{tile.chart_kind}</span>
          {result && (
            <>
              <span>·</span>
              <span className='tabular-nums'>{result.row_count} rows</span>
              <span>·</span>
              <span className='tabular-nums'>{result.elapsed_ms}ms</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TileCard
