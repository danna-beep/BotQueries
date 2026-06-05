import { Search, Sparkles } from 'lucide-react'
import { useTranslation } from '@/hooks'
import type { ChatMessage, ChatPart } from '@/hooks'
import { stripFences } from '@/utils/chatBlocks'
import ProseMarkdown from '@/components/ProseMarkdown'

type AssistantMsg = Extract<ChatMessage, { role: 'assistant' }>
const isText = (p: ChatPart): p is Extract<ChatPart, { type: 'text' }> => p.type === 'text'

const Investigating = ({ count }: { count: number }) => {
  const { t } = useTranslation()
  return (
    <div className='inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-[12px] text-primary'>
      <Search size={11} className='animate-pulse' strokeWidth={2} />
      {count > 1 ? t('nocode.investigatingN', { count }) : t('nocode.investigating')}
    </div>
  )
}

const AssistantBubble = ({ msg }: { msg: AssistantMsg }) => {
  const toolCount = msg.parts.filter((p) => p.type === 'tool_call').length
  const visibleText = msg.parts
    .filter(isText)
    .map((p) => stripFences(p.text))
    .join('\n')
    .trim()
  const stillWorking = msg.thinking || msg.parts.some((p) => p.type === 'tool_call' && p.status !== 'done')

  return (
    <div className='flex justify-start'>
      <div className='max-w-[85%]'>
        <div className='mb-1.5 flex items-center gap-2'>
          <span className='inline-flex h-5 w-5 items-center justify-center rounded-md border border-primary/25 bg-primary/10'>
            <Sparkles size={11} className='text-primary' strokeWidth={1.8} />
          </span>
          <span className='text-[11px] font-medium tracking-tight text-primary'>Claude</span>
        </div>
        {stillWorking && !visibleText && <Investigating count={toolCount} />}
        {visibleText && (
          <div className='rounded-2xl rounded-tl-md border border-border bg-muted/30 px-4 py-3'>
            <ProseMarkdown text={visibleText} className='text-[15px] leading-relaxed' />
          </div>
        )}
        {stillWorking && visibleText && <div className='mt-1.5'><Investigating count={toolCount} /></div>}
      </div>
    </div>
  )
}

export default AssistantBubble
