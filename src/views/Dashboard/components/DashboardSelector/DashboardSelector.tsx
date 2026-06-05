import { useState } from 'react'
import { AlertTriangle, Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useTranslation } from '@/hooks'
import type { IDashboardSummary } from '@/types'

export interface DashboardSelectorProps {
  dashboards: IDashboardSummary[]
  currentId: string | null
  onSelect: (id: string) => void
  onCreate: (name: string) => Promise<unknown>
  onRename: (name: string) => Promise<unknown>
  onDelete: () => Promise<void>
  busy: { creating: boolean; renaming: boolean; deleting: boolean }
}

const btn =
  'inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40'
const btnPrimary =
  'inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2 py-1.5 text-[11px] text-primary hover:bg-primary/20 disabled:opacity-40'
const input =
  'w-64 rounded-md border border-primary/40 bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary/70'

const DashboardSelector = ({
  dashboards,
  currentId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  busy,
}: DashboardSelectorProps) => {
  const { t } = useTranslation()
  const current = dashboards.find((d) => d.id === currentId)
  const [creating, setCreating] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [renameDraft, setRenameDraft] = useState('')
  const [localErr, setLocalErr] = useState<string | null>(null)

  const submitCreate = async () => {
    const name = draftName.trim()
    if (!name) return setLocalErr(t('dashboard.selector.nameRequired'))
    setLocalErr(null)
    try {
      await onCreate(name)
      setDraftName('')
      setCreating(false)
    } catch (e) {
      setLocalErr(e instanceof Error ? e.message : String(e))
    }
  }

  const submitRename = async () => {
    const name = renameDraft.trim()
    if (!name) return setLocalErr(t('dashboard.selector.nameRequired'))
    setLocalErr(null)
    try {
      await onRename(name)
      setEditingName(false)
    } catch (e) {
      setLocalErr(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className='flex flex-col gap-1 border-b border-border bg-card/40 px-4 py-3'>
      <div className='flex flex-wrap items-center gap-2'>
        {editingName && current ? (
          <>
            <input
              autoFocus
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitRename()
                else if (e.key === 'Escape') setEditingName(false)
              }}
              className={input}
            />
            <button onClick={submitRename} disabled={busy.renaming} className={btnPrimary}>
              {busy.renaming ? <Loader2 size={11} className='animate-spin' /> : <Check size={11} strokeWidth={2.4} />}
              {t('dashboard.selector.save')}
            </button>
            <button onClick={() => setEditingName(false)} disabled={busy.renaming} className={btn}>
              <X size={11} /> {t('dashboard.selector.cancel')}
            </button>
          </>
        ) : (
          <>
            <select
              value={currentId || ''}
              onChange={(e) => onSelect(e.target.value)}
              disabled={!dashboards.length}
              className='cursor-pointer rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium outline-none focus:border-primary/50 disabled:opacity-50'
            >
              {dashboards.length === 0 && <option value=''>{t('dashboard.selector.none')}</option>}
              {dashboards.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {t('dashboard.selector.chartCount', { count: d.tile_count || 0 })}
                </option>
              ))}
            </select>
            {current && (
              <button onClick={() => { setRenameDraft(current.name); setEditingName(true); setLocalErr(null) }} className={btn} title={t('dashboard.selector.rename')}>
                <Pencil size={11} strokeWidth={1.8} />
              </button>
            )}
          </>
        )}

        {creating ? (
          <>
            <input
              autoFocus
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitCreate()
                else if (e.key === 'Escape') setCreating(false)
              }}
              placeholder={t('dashboard.selector.namePlaceholder')}
              className={input}
            />
            <button onClick={submitCreate} disabled={busy.creating || !draftName.trim()} className={btnPrimary}>
              {busy.creating ? <Loader2 size={11} className='animate-spin' /> : <Check size={11} strokeWidth={2.4} />}
              {t('dashboard.selector.create')}
            </button>
            <button onClick={() => setCreating(false)} disabled={busy.creating} className={btn}>
              <X size={11} /> {t('dashboard.selector.cancel')}
            </button>
          </>
        ) : (
          !editingName && (
            <button onClick={() => setCreating(true)} className={btn}>
              <Plus size={12} strokeWidth={2} /> {t('dashboard.selector.new')}
            </button>
          )
        )}

        {current && !creating && !editingName && (
          <button
            onClick={() => {
              if (window.confirm(t('dashboard.selector.confirmDelete', { name: current.name }))) onDelete()
            }}
            disabled={busy.deleting}
            className='ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-[11px] text-destructive/80 hover:text-destructive disabled:opacity-40'
          >
            <Trash2 size={12} strokeWidth={1.8} /> {t('dashboard.selector.deleteDashboard')}
          </button>
        )}
      </div>
      {localErr && (
        <div className='flex items-center gap-1.5 font-mono text-[11px] text-destructive'>
          <AlertTriangle size={11} />
          {localErr}
        </div>
      )}
    </div>
  )
}

export default DashboardSelector
