import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/utils/tailwind'

// Minimal, box-free markdown styling re-skinned to viplay tokens.
const MD_COMPONENTS: Components = {
  p: (props) => <p className='my-1.5 leading-relaxed' {...props} />,
  strong: (props) => <strong className='font-semibold text-foreground' {...props} />,
  em: (props) => <em className='italic text-foreground/90' {...props} />,
  ul: (props) => <ul className='my-1.5 ml-5 list-disc space-y-1 marker:text-muted-foreground/70' {...props} />,
  ol: (props) => <ol className='my-1.5 ml-5 list-decimal space-y-1 marker:text-muted-foreground/70' {...props} />,
  li: (props) => <li className='pl-1 leading-relaxed' {...props} />,
  h1: (props) => <p className='my-1.5 font-semibold text-foreground' {...props} />,
  h2: (props) => <p className='my-1.5 font-semibold text-foreground' {...props} />,
  h3: (props) => <p className='my-1.5 font-semibold text-foreground' {...props} />,
  blockquote: ({ children }) => <div className='my-1.5 leading-relaxed'>{children}</div>,
  code: ({ className, children, ...props }) => {
    const isBlock = /language-/.test(className || '')
    return (
      <code
        className={
          isBlock
            ? 'whitespace-pre-wrap break-words font-mono text-[12px] text-foreground/90'
            : 'font-mono text-[12px] text-primary'
        }
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => <>{children}</>,
  hr: () => <span className='my-2 block' />,
  a: (props) => (
    <a className='text-primary underline-offset-2 hover:underline' target='_blank' rel='noopener noreferrer' {...props} />
  ),
  table: (props) => (
    <div className='my-1.5 overflow-x-auto'>
      <table className='min-w-full text-[12px]' {...props} />
    </div>
  ),
  th: (props) => <th className='px-2 py-1 text-left text-[11px] font-medium text-muted-foreground' {...props} />,
  td: (props) => <td className='px-2 py-1 align-top' {...props} />,
}

export interface ProseMarkdownProps {
  text: string
  className?: string
}

const ProseMarkdown = ({ text, className }: ProseMarkdownProps) => (
  <div className={cn('text-[13.5px] text-foreground/90', className)}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
      {text}
    </ReactMarkdown>
  </div>
)

export default ProseMarkdown
