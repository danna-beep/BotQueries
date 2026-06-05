import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, ShieldCheck, SlidersHorizontal, Square, X } from 'lucide-react'
import { useTranslation } from '@/hooks'
import { cn } from '@/utils/tailwind'
import type { ChatMessage } from '@/hooks'
import type { IAnthropicAuth } from '@/types'
import AssistantBubble from '../AssistantBubble'
import UserBubble from '../UserBubble'

const EXAMPLES = [
  '¿Se conciliaron todos los pagos de ADDI ayer?',
  '¿Cuántos pagos hizo Niko esta semana?',
  '¿Hay algún pago de Vemo sin conciliar este mes?',
  '¿Por qué no se concilió el último pago de Exitus?',
]

export interface NoCodeChatProps {
  messages: ChatMessage[]
  streaming: boolean
  error: string | null
  isConnected: boolean
  apiKey: string
  authStatus?: IAnthropicAuth
  onSend: (text: string) => void
  onStop: () => void
  onClearError: () => void
  onReset: () => void
  onConfigureAccess: () => void
}

const NoCodeChat = ({
  messages,
  streaming,
  error,
  isConnected,
  apiKey,
  authStatus,
  onSend,
  onStop,
  onClearError,
  onReset,
  onConfigureAccess,
}: NoCodeChatProps) => {
  const { t } = useTranslation()
  const hasClaudeCode = !!authStatus?.claude_code_session
  const hasEnvKey = !!authStatus?.env_api_key
  const canChat = !!apiKey || hasClaudeCode || hasEnvKey

  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, streaming])

  const submit = (text?: string) => {
    const value = (text ?? input).trim()
    if (!value || streaming) return
    if (!canChat) {
      onConfigureAccess()
      return
    }
    setInput('')
    onSend(value)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <section className='flex h-full min-h-0 flex-col items-center'>
      <div className='flex w-full max-w-3xl min-h-0 flex-1 flex-col px-4 py-4'>
        <div className='flex items-center gap-2.5 border-b border-border pb-3'>
          <span className='inline-flex h-7 w-7 items-center justify-center rounded-lg border border-primary/25 bg-primary/10'>
            <MessageCircle size={14} className='text-primary' strokeWidth={1.8} />
          </span>
          <div className='flex flex-col'>
            <span className='text-[13.5px] font-medium tracking-tight text-foreground'>{t('nocode.title')}</span>
            <span className='font-mono text-[10.5px] text-muted-foreground'>{t('nocode.subtitle')}</span>
          </div>
          {streaming && (
            <span className='ml-3 flex items-center gap-1.5 font-mono text-[11px] text-primary'>
              <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-primary' />
              {t('nocode.thinking')}
            </span>
          )}
          <div className='ml-auto flex items-center gap-2'>
            {messages.length > 0 && (
              <button
                onClick={onReset}
                className='rounded-md border border-border px-2 py-1 font-mono text-[10.5px] uppercase tracking-wide text-muted-foreground hover:text-foreground'
              >
                {t('nocode.newConversation')}
              </button>
            )}
            {hasClaudeCode && !apiKey && (
              <span className='inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-primary'>
                <ShieldCheck size={10} />
                {t('nocode.claudeSession')}
              </span>
            )}
            <button
              onClick={onConfigureAccess}
              className={cn(
                'inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wide',
                canChat ? 'border-border text-muted-foreground hover:text-foreground' : 'border-warning/40 bg-warning/10 text-warning'
              )}
            >
              <SlidersHorizontal size={10} />
              {t('nocode.configureAccess')}
            </button>
          </div>
        </div>

        <div ref={scrollRef} className='relative min-h-0 flex-1 space-y-4 overflow-auto py-4'>
          {messages.length === 0 ? (
            <div className='flex h-full flex-col items-center justify-center px-4 text-center'>
              <p className='text-3xl font-semibold italic leading-tight text-foreground/85'>{t('nocode.emptyTitle')}</p>
              <p className='mt-3 max-w-md text-[13px] tracking-tight text-muted-foreground'>{t('nocode.emptyHint')}</p>
              <div className='mt-7 grid w-full max-w-xl gap-1.5'>
                <span className='text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground'>
                  {t('nocode.examplesLabel')}
                </span>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => submit(ex)}
                    disabled={!isConnected || !canChat}
                    className='group rounded-lg border border-border bg-muted/30 px-3.5 py-2.5 text-left text-[13px] text-foreground/80 transition-all hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'
                  >
                    <span className='mr-2 text-muted-foreground/60 group-hover:text-primary'>→</span>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (m.role === 'user' ? <UserBubble key={i} text={m.text} /> : <AssistantBubble key={i} msg={m} />))
          )}

          {error && (
            <div className='flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2 font-mono text-xs text-destructive'>
              <X size={12} className='mt-0.5' />
              <span className='flex-1'>{error}</span>
              <button onClick={onClearError} className='text-destructive/70 hover:text-destructive'>
                <X size={11} />
              </button>
            </div>
          )}
        </div>

        <div className='border-t border-border pt-2'>
          <div className='relative'>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={streaming || !isConnected || !canChat}
              placeholder={
                !isConnected
                  ? t('nocode.placeholder.disconnected')
                  : !canChat
                    ? t('nocode.placeholder.noKey')
                    : t('nocode.placeholder.ready')
              }
              rows={2}
              className='w-full resize-none rounded-xl border border-border bg-muted px-3.5 py-3 pr-11 text-[14px] placeholder:text-muted-foreground/70 focus:border-primary/40'
            />
            {streaming ? (
              <button
                onClick={onStop}
                className='absolute bottom-2.5 right-2.5 inline-flex h-8 w-8 items-center justify-center rounded-md border border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/25'
                title={t('nocode.stop')}
              >
                <Square size={13} fill='currentColor' />
              </button>
            ) : (
              <button
                onClick={() => submit()}
                disabled={!input.trim() || !isConnected || !canChat}
                className='absolute bottom-2.5 right-2.5 inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 disabled:cursor-not-allowed disabled:opacity-40'
                title={t('nocode.send')}
              >
                <Send size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default NoCodeChat
