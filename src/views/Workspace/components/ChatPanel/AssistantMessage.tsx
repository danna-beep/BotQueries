import { Sparkles } from 'lucide-react'
import { splitTextWithBlocks } from '@/utils/chatBlocks'
import ProseMarkdown from '@/components/ProseMarkdown'
import type { ChatMessage } from '../../hooks'
import type { WorkspaceResult } from '../../types'
import SqlProposalBlock from './SqlProposalBlock'
import ToolCallBlock from './ToolCallBlock'
import WarningBlock from './WarningBlock'

type AssistantMsg = Extract<ChatMessage, { role: 'assistant' }>

export interface AssistantMessageProps {
  msg: AssistantMsg
  userQuestion?: string
  onRun: (sql: string) => Promise<WorkspaceResult>
  downloadExport: (filename: string) => Promise<void>
}

const AssistantMessage = ({ msg, userQuestion, onRun, downloadExport }: AssistantMessageProps) => (
  <div>
    <div className='mb-1.5 flex items-center gap-2'>
      <span className='inline-flex h-5 w-5 items-center justify-center rounded-md border border-primary/25 bg-primary/10'>
        <Sparkles size={11} className='text-primary' strokeWidth={1.8} />
      </span>
      <span className='text-[11px] font-medium tracking-tight text-primary'>Claude</span>
    </div>
    <div>
      {msg.parts.map((p, i) => {
        if (p.type === 'text') {
          return (
            <div key={i}>
              {splitTextWithBlocks(p.text).map((b, j) => {
                if (b.kind === 'sql') return <SqlProposalBlock key={j} sql={b.sql} onRun={onRun} />
                if (b.kind === 'warning') return <WarningBlock key={j} warning={b.warning} userQuestion={userQuestion} />
                return <ProseMarkdown key={j} text={b.text} />
              })}
            </div>
          )
        }
        return <ToolCallBlock key={i} part={p} downloadExport={downloadExport} />
      })}
      {msg.thinking && (
        <div className='mt-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
          <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-primary' />
          <span className='font-mono'>thinking…</span>
        </div>
      )}
    </div>
  </div>
)

export default AssistantMessage
