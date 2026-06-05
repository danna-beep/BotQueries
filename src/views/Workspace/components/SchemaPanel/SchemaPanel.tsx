import { useMemo, useState } from 'react'
import { ChevronRight, Database, Hash, Key, RefreshCw, Search, Table as TableIcon } from 'lucide-react'
import { useTranslation } from '@/hooks'
import { cn } from '@/utils/tailwind'
import { formatNumber } from '@/utils/format'
import type { IDatabaseSchema } from '@/types'

export interface SchemaPanelProps {
  schema: IDatabaseSchema | undefined
  onRefresh: () => void
  onTableClick: (tableName: string) => void
}

const SchemaPanel = ({ schema, onRefresh, onTableClick }: SchemaPanelProps) => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    if (!schema?.tables) return []
    const q = query.trim().toLowerCase()
    if (!q) return schema.tables
    return schema.tables.filter(
      (table) =>
        table.name.toLowerCase().includes(q) ||
        (table.columns || []).some((c) => c.name.toLowerCase().includes(q))
    )
  }, [schema, query])

  return (
    <aside className='flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card'>
      <div className='flex items-center justify-between border-b border-border px-4 py-2.5'>
        <div className='flex min-w-0 items-center gap-2'>
          <Database size={14} className='text-primary' strokeWidth={1.8} />
          <span className='text-[12.5px] font-medium tracking-tight text-foreground'>
            {t('workspace.schema.title')}
          </span>
          {schema?.database && (
            <span className='truncate text-[11px] text-muted-foreground'>· {schema.database}</span>
          )}
        </div>
        <button
          onClick={onRefresh}
          className='text-muted-foreground transition-colors hover:text-foreground'
          title={t('workspace.schema.refresh')}
        >
          <RefreshCw size={13} strokeWidth={1.8} />
        </button>
      </div>

      <div className='border-b border-border px-3 py-2.5'>
        <div className='relative'>
          <Search size={12} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground' />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('workspace.schema.search')}
            className='w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-2 text-[12.5px] outline-none placeholder:text-muted-foreground/70 focus:border-primary/50'
          />
        </div>
      </div>

      <div className='flex-1 overflow-auto py-1'>
        {!schema && (
          <div className='px-3 py-6 text-center font-mono text-xs text-muted-foreground'>
            {t('workspace.schema.loading')}
          </div>
        )}
        {schema && filtered.length === 0 && (
          <div className='px-3 py-6 text-center font-mono text-xs text-muted-foreground'>
            {t('workspace.schema.noMatches')}
          </div>
        )}
        {filtered.map((table) => {
          const isOpen = !!open[table.name]
          return (
            <div key={table.name} className='px-1'>
              <button
                onClick={() => setOpen((s) => ({ ...s, [table.name]: !isOpen }))}
                onDoubleClick={() => onTableClick(table.name)}
                className='group flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left hover:bg-muted'
                title={t('workspace.schema.tableHint')}
              >
                <ChevronRight
                  size={12}
                  className={cn('shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-90')}
                />
                <TableIcon
                  size={12}
                  className='shrink-0 text-muted-foreground transition-colors group-hover:text-primary'
                />
                <span className='truncate font-mono text-[12px] text-foreground'>{table.name}</span>
                {table.row_estimate !== null && table.row_estimate !== undefined && (
                  <span className='ml-auto font-mono text-[10px] text-muted-foreground'>
                    {formatNumber(table.row_estimate)}
                  </span>
                )}
              </button>

              {isOpen && (
                <ul className='my-1 ml-4 border-l border-border pl-2'>
                  {(table.columns || []).map((c) => (
                    <li key={c.name} className='flex items-center gap-1.5 py-0.5 pl-2 pr-1'>
                      {c.key === 'PRI' ? (
                        <Key size={10} className='shrink-0 text-warning' />
                      ) : c.key ? (
                        <Hash size={10} className='shrink-0 text-muted-foreground' />
                      ) : (
                        <span className='w-2.5' />
                      )}
                      <span className='truncate font-mono text-[11px] text-foreground'>{c.name}</span>
                      <span className='truncate font-mono text-[10px] text-muted-foreground'>{c.type}</span>
                      {!c.nullable && (
                        <span className='ml-auto font-mono text-[10px] text-destructive' title='NOT NULL'>
                          !
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export default SchemaPanel
