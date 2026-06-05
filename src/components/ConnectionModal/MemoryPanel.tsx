import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, LoadingButton, Loader, Textarea, Typography, useToast } from '@getvaas/viplay-ui'
import { Trash2 } from 'lucide-react'
import { useTranslation } from '@/hooks'
import memoryService from '@/services/memory'

const MEMORY_KEY = ['dbchat', 'memory']

const MemoryPanel = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState('')

  const memoryQuery = useQuery({
    queryKey: MEMORY_KEY,
    queryFn: () => memoryService.listMemory(),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: MEMORY_KEY })

  const addMutation = useMutation({
    mutationFn: () => memoryService.addMemory(draft.trim()),
    onSuccess: () => {
      setDraft('')
      invalidate()
    },
    onError: () => toast({ title: t('connection.memory.addFailed'), variant: 'destructive' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => memoryService.deleteMemory(id),
    onSuccess: invalidate,
    onError: () => toast({ title: t('connection.toast.error'), variant: 'destructive' }),
  })

  if (memoryQuery.isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <Loader size='default' />
      </div>
    )
  }

  const entries = memoryQuery.data?.entries ?? []

  return (
    <div className='space-y-4'>
      <div className='flex gap-2'>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          className='flex-1'
          placeholder={t('connection.memory.placeholder')}
        />
        <LoadingButton
          isLoading={addMutation.isPending}
          disabled={!draft.trim()}
          onClick={() => addMutation.mutate()}
        >
          {t('connection.memory.add')}
        </LoadingButton>
      </div>

      {entries.length === 0 ? (
        <Typography variant='p4' className='text-muted-foreground'>
          {t('connection.memory.empty')}
        </Typography>
      ) : (
        <ul className='space-y-2 max-h-60 overflow-auto'>
          {entries.map((entry) => (
            <li
              key={entry.id}
              className='flex items-start gap-2 p-2.5 rounded-md border border-border bg-card'
            >
              <Typography variant='p4' className='flex-1'>
                {entry.text}
              </Typography>
              <Button
                variant='secondary'
                size='s'
                aria-label={t('connection.memory.delete')}
                onClick={() => deleteMutation.mutate(entry.id)}
              >
                <Trash2 size={14} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MemoryPanel
