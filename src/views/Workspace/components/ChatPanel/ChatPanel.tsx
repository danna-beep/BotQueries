import { useEffect, useRef, useState } from 'react'
import { Send, ShieldCheck, Sparkles, SlidersHorizontal, Square, X } from 'lucide-react'
import { useTranslation } from '@/hooks'
import { cn } from '@/utils/tailwind'
import type { IAnthropicAuth } from '@/types'
import type { ChatMessage } from '../../hooks'
import type { WorkspaceResult } from '../../types'
import AssistantMessage from './AssistantMessage'

const EXAMPLES = [
  'Cuántos pagos hizo ADDI ayer',
  'Top 10 borrowers por volumen de pagos este mes',
  '¿Por qué no se conciliaron los últimos 10 pagos de Niko?',
  'Revisa si hay errores de conciliación en Vemo esta semana',
]

export interface ChatPanelProps {
  messages: ChatMessage[]
  streaming: boolean
  error: string | null
  isConnected: boolean
  apiKey: string
  authStatus?: IAnthropicAuth
  onSend: (text: string) => void
  onStop: () => void
  onClearError: () => void
  onConfigureAccess: () => void
  onRun: (sql: string) => Promise<WorkspaceResult>
  downloadExport: (filename: string) => Promise<void>
}

const ChatPanel = ({
  messages,
  streaming,
  error,
  isConnected,
  apiKey,
  authStatus,
  onSend,
  onStop,
  onClearError,
  onConfigureAccess,
  onRun,
  downloadExport,
}: ChatPanelProps) => {
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
    <section className='relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card'>
      <div className='flex items-center gap-2.5 border-b border-border px-4 py-2.5'>
        <Sparkles size={14} className='text-primary' strokeWidth={1.8} />
        <span className='text-[12.5px] font-medium tracking-tight text-foreground'>{t('workspace.chat.title')}</span>
        {streaming && (
          <span className='flex items-center gap-1.5 font-mono text-[11px] text-primary'>
            <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-primary' />
            {t('workspace.chat.thinking')}
          </span>
        )}
        {hasClaudeCode && !apiKey && (
          <span className='ml-auto inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-primary'>
            <ShieldCheck size={10} />
            {t('workspace.chat.claudeSession')}
          </span>
        )}
        <button
          onClick={onConfigureAccess}
          className={cn(
            'inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-wide',
            hasClaudeCode && !apiKey ? '' : 'ml-auto',
            canChat ? 'border-border text-muted-foreground hover:text-foreground' : 'border-warning/40 bg-warning/10 text-warning'
          )}
        >
          <SlidersHorizontal size={10} />
          {t('workspace.chat.configureAccess')}
        </button>
      </div>

      <div ref={scrollRef} className='relative flex-1 space-y-4 overflow-auto px-3 py-4'>
        {messages.length === 0 ? (
          <div className='flex h-full flex-col items-center justify-center px-6 text-center'>
            <p className='text-3xl font-semibold italic leading-tight text-foreground/85'>{t('workspace.chat.emptyTitle')}</p>
            <p className='mt-3 max-w-sm text-[12px] tracking-tight text-muted-foreground'>{t('workspace.chat.emptyHint')}</p>
            <div className='mt-8 grid w-full gap-1.5'>
              <span className='text-left font-mono text-[10px] uppercase tracking-wide text-muted-foreground'>
                {t('workspace.chat.examplesLabel')}
              </span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => submit(ex)}
                  disabled={!isConnected || !canChat}
                  className='group rounded-lg border border-border bg-muted/30 px-3.5 py-2.5 text-left text-[12.5px] text-foreground/80 transition-all hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <span className='mr-2 text-muted-foreground/60 group-hover:text-primary'>→</span>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            if (m.role === 'user') {
              return (
                <div key={i} className='flex justify-end'>
                  <div className='max-w-[85%] rounded-2xl rounded-tr-md border border-primary/20 bg-primary/10 px-3.5 py-2 text-[13.5px] leading-relaxed text-foreground'>
                    {m.text}
                  </div>
                </div>
              )
            }
            // Find the user message that triggered this assistant turn.
            let userQuestion: string | undefined
            for (let k = i - 1; k >= 0; k--) {
              const prev = messages[k]
              if (prev.role === 'user') {
                userQuestion = prev.text
                break
              }
            }
            return (
              <AssistantMessage key={i} msg={m} userQuestion={userQuestion} onRun={onRun} downloadExport={downloadExport} />
            )
          })
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

      <div className='border-t border-border p-2.5'>
        <div className='relative'>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={streaming || !isConnected || !canChat}
            placeholder={
              !isConnected
                ? t('workspace.chat.placeholder.disconnected')
                : !canChat
                  ? t('workspace.chat.placeholder.noKey')
                  : t('workspace.chat.placeholder.ready')
            }
            rows={2}
            className='w-full resize-none rounded-lg border border-border bg-muted px-3 py-2.5 pr-10 text-[13.5px] placeholder:text-muted-foreground/70 focus:border-primary/40'
          />
          {streaming ? (
            <button
              onClick={onStop}
              className='absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/25'
              title={t('workspace.chat.stop')}
            >
              <Square size={12} fill='currentColor' />
            </button>
          ) : (
            <button
              onClick={() => submit()}
              disabled={!input.trim() || !isConnected || !canChat}
              className='absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 disabled:cursor-not-allowed disabled:opacity-40'
              title={t('workspace.chat.send')}
            >
              <Send size={13} />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default ChatPanel
