/** A parsed segment of an assistant text message. */
export type ChatBlock =
  | { kind: 'prose'; text: string }
  | { kind: 'sql'; sql: string }
  | { kind: 'warning'; warning: Record<string, unknown> }

/**
 * Split assistant text into prose paragraphs and fenced ```sql / ```warning
 * blocks. SQL blocks render with a "run" button; warning blocks render/persist
 * as cards. NoCode strips the non-prose blocks entirely.
 */
export const splitTextWithBlocks = (text: string): ChatBlock[] => {
  const re = /```(sql|warning)\s*\n([\s\S]*?)```/gi
  const parts: ChatBlock[] = []
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      const prose = text.slice(last, m.index).trim()
      if (prose) parts.push({ kind: 'prose', text: prose })
    }
    const tag = m[1].toLowerCase()
    const body = m[2].trim()
    if (tag === 'sql') {
      parts.push({ kind: 'sql', sql: body })
    } else {
      try {
        parts.push({ kind: 'warning', warning: JSON.parse(body) as Record<string, unknown> })
      } catch {
        parts.push({ kind: 'prose', text: '```warning\n' + body + '\n```' })
      }
    }
    last = m.index + m[0].length
  }

  const tail = text.slice(last).trim()
  if (tail) parts.push({ kind: 'prose', text: tail })
  return parts
}

/** Remove fenced ```sql / ```warning blocks, leaving only prose (for NoCode). */
export const stripFences = (text: string): string =>
  text.replace(/```(sql|warning)\s*\n[\s\S]*?```/gi, '').trim()
