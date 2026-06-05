import { useTranslation } from '@/hooks'
import type { WorkspaceResult } from '../../types'

const Cell = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined) {
    return <span className='italic text-muted-foreground'>NULL</span>
  }
  if (typeof value === 'boolean') {
    return <span className='text-warning'>{String(value)}</span>
  }
  if (typeof value === 'number') {
    return <span className='tabular-nums text-primary'>{value}</span>
  }
  const s = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return (
    <span className='text-foreground/90' title={s}>
      {s.length > 80 ? s.slice(0, 79) + '…' : s}
    </span>
  )
}

const TableView = ({ result }: { result: WorkspaceResult | null }) => {
  const { t } = useTranslation()

  if (!result || !result.columns || result.columns.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center px-6 text-center'>
        <p className='text-2xl font-semibold italic text-foreground/80'>{t('workspace.results.empty.title')}</p>
        <p className='mt-3 max-w-xs text-[12.5px] text-muted-foreground'>{t('workspace.results.empty.hint')}</p>
      </div>
    )
  }

  if (result.row_count === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center px-6 text-center'>
        <p className='text-xl font-semibold italic text-foreground/70'>{t('workspace.results.zero.title')}</p>
        <p className='mt-2 text-[12.5px] text-muted-foreground'>{t('workspace.results.zero.hint')}</p>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-auto'>
      <table className='min-w-full font-mono text-[12px]'>
        <thead className='sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur'>
          <tr>
            <th className='w-10 px-3 py-2.5 text-left text-[10.5px] font-medium text-muted-foreground'>#</th>
            {result.columns.map((c) => (
              <th
                key={c}
                className='whitespace-nowrap px-3 py-2.5 text-left text-[10.5px] font-medium text-muted-foreground'
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i} className='border-b border-border/40 transition-colors hover:bg-primary/[0.03]'>
              <td className='px-3 py-1.5 text-[10.5px] tabular-nums text-muted-foreground/70'>{i + 1}</td>
              {result.columns.map((c) => (
                <td key={c} className='max-w-[420px] truncate px-3 py-1.5'>
                  <Cell value={row[c]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableView
