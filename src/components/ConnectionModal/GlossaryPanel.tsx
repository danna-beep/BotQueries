import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, LoadingButton, Loader, Textarea, Typography, useToast } from '@getvaas/viplay-ui'
import { useTranslation } from '@/hooks'
import glossaryService from '@/services/glossary'

const GLOSSARY_KEY = ['dbchat', 'glossary']

const GlossaryPanel = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [csv, setCsv] = useState('')

  const glossaryQuery = useQuery({
    queryKey: GLOSSARY_KEY,
    queryFn: () => glossaryService.getGlossary(),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: GLOSSARY_KEY })

  const uploadMutation = useMutation({
    mutationFn: () => glossaryService.uploadGlossary(csv),
    onSuccess: (res) => {
      toast({ title: t('connection.glossary.uploaded', { count: res.loaded }), variant: 'success' })
      setCsv('')
      invalidate()
    },
    onError: () => toast({ title: t('connection.glossary.uploadFailed'), variant: 'destructive' }),
  })

  const clearMutation = useMutation({
    mutationFn: () => glossaryService.clearGlossary(),
    onSuccess: () => {
      toast({ title: t('connection.glossary.cleared'), variant: 'success' })
      invalidate()
    },
    onError: () => toast({ title: t('connection.toast.error'), variant: 'destructive' }),
  })

  if (glossaryQuery.isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <Loader size='default' />
      </div>
    )
  }

  const summary = glossaryQuery.data

  return (
    <div className='space-y-4'>
      <Typography variant='p3' className='text-muted-foreground'>
        {t('connection.glossary.summary', {
          loaded: summary?.loaded ?? 0,
          matched: summary?.matched ?? 0,
        })}
      </Typography>

      <Textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={6}
        placeholder={t('connection.glossary.csvPlaceholder')}
      />

      <div className='flex justify-between gap-3'>
        <Button
          variant='secondary'
          onClick={() => clearMutation.mutate()}
          disabled={clearMutation.isPending || !summary?.loaded}
        >
          {t('connection.glossary.clear')}
        </Button>
        <LoadingButton
          isLoading={uploadMutation.isPending}
          disabled={!csv.trim()}
          onClick={() => uploadMutation.mutate()}
        >
          {t('connection.glossary.upload')}
        </LoadingButton>
      </div>
    </div>
  )
}

export default GlossaryPanel
