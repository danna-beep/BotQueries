import { LoadingButton, Typography } from '@getvaas/viplay-ui'
import { useTranslation } from '@/hooks'
import { estimateCostUsd, pricingFor, totalTokens } from '@/utils/tokenCost'
import { useConnection } from '../ConnectionProvider/context'

const fmtInt = (n: number) => n.toLocaleString('en-US')
const fmtUsd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 })

/**
 * Cumulative chat token usage and estimated cost. Totals are persisted in the
 * browser, so they survive reloads and dev-server restarts until reset here.
 */
const UsagePanel = () => {
  const { t } = useTranslation()
  const { tokenUsage, resetTokenUsage } = useConnection()

  const cost = estimateCostUsd(tokenUsage)
  const total = totalTokens(tokenUsage)
  const price = pricingFor(tokenUsage.model)

  const rows: Array<{ label: string; value: string }> = [
    { label: t('connection.usage.inputTokens'), value: fmtInt(tokenUsage.inputTokens) },
    { label: t('connection.usage.outputTokens'), value: fmtInt(tokenUsage.outputTokens) },
    { label: t('connection.usage.cacheWriteTokens'), value: fmtInt(tokenUsage.cacheCreationTokens) },
    { label: t('connection.usage.cacheReadTokens'), value: fmtInt(tokenUsage.cacheReadTokens) },
    { label: t('connection.usage.totalTokens'), value: fmtInt(total) },
    { label: t('connection.usage.turns'), value: fmtInt(tokenUsage.turns) },
  ]

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border border-border bg-muted/30 p-4'>
        <Typography variant='p4' className='uppercase tracking-wide text-muted-foreground'>
          {t('connection.usage.estimatedCost')}
        </Typography>
        <div className='mt-1 text-3xl font-semibold tracking-tight text-foreground'>{fmtUsd(cost)}</div>
        <Typography variant='p4' className='mt-1 text-muted-foreground/70'>
          {t('connection.usage.model', { model: tokenUsage.model ?? '—' })}
        </Typography>
      </div>

      <div className='divide-y divide-border rounded-lg border border-border'>
        {rows.map((r) => (
          <div key={r.label} className='flex items-center justify-between px-3 py-2'>
            <Typography variant='p4' className='text-muted-foreground'>
              {r.label}
            </Typography>
            <span className='font-mono text-[13px] text-foreground'>{r.value}</span>
          </div>
        ))}
      </div>

      <Typography variant='p4' className='text-muted-foreground/70'>
        {t('connection.usage.priceNote', {
          input: price.input,
          output: price.output,
        })}
      </Typography>

      <div className='flex justify-end'>
        <LoadingButton type='button' variant='secondary' onClick={resetTokenUsage}>
          {t('connection.usage.reset')}
        </LoadingButton>
      </div>
    </div>
  )
}

export default UsagePanel
