import { useState } from 'react'
import { ChevronDown, ChevronRight, Clock, History } from 'lucide-react'
import { useTranslation } from '@/hooks'
import { formatNumber, relativeTime, truncate } from '@/utils/format'
import type { HistoryItem } from '../../types'

export interface HistoryPanelProps {
  history: HistoryItem[]
  onSelect: (item: HistoryItem) => void
}

const HistoryPanel = ({ history, onSelect }: HistoryPanelProps) => {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const items = (history || []).slice(0, 50)

  return (
    <section className='flex flex-col overflow-hidden rounded-lg border border-border bg-card'>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className='flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left hover:bg-muted/40'
      >
        {collapsed ? (
          <ChevronRight size={12} className='text-muted-foreground' />
        ) : (
          <ChevronDown size={12} className='text-muted-foreground' />
        )}
        <History size={12} className='text-muted-foreground' />
        <span className='font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
          {t('workspace.history.title')}
        </span>
        <span className='ml-auto font-mono text-[10px] text-muted-foreground'>{items.length}</span>
      </button>

      {!collapsed && (
        <div className='flex-1 overflow-auto'>
          {items.length === 0 ? (
            <div className='px-3 py-6 text-center font-mono text-xs text-muted-foreground'>
              {t('workspace.history.empty')}
            </div>
          ) : (
            <ul>
              {items.map((h, i) => (
                <li key={`${h.timestamp}-${i}`} className='border-b border-border/40 last:border-b-0'>
                  <button
                    onClick={() => onSelect(h)}
                    className='flex w-full flex-col gap-1 px-3 py-2 text-left hover:bg-muted/40'
                  >
                    <div className='flex items-center gap-2 font-mono text-[10px] text-muted-foreground'>
                      <Clock size={10} />
                      <span>{relativeTime(h.timestamp)}</span>
                      <span className='ml-auto'>
                        {t('workspace.history.rowsMs', { rows: formatNumber(h.row_count), ms: h.elapsed_ms })}
                      </span>
                    </div>
                    <div className='truncate font-mono text-[11px] text-foreground/80'>
                      {truncate(h.sql.replace(/\s+/g, ' '), 80)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default HistoryPanel
