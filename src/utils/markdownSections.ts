/**
 * 将 Markdown 原文按 `#`/`##` 标题切分为小节（用于卡片/企业模板）。
 */
export interface MarkdownSection {
  title: string
  body: string
}

export function splitMarkdownSections(markdown: string): MarkdownSection[] {
  const sections: MarkdownSection[] = []
  let current: MarkdownSection | null = null
  for (const line of markdown.split('\n')) {
    const m = line.match(/^#{1,3}\s+(.+)$/)
    if (m) {
      current = { title: m[1].trim(), body: '' }
      sections.push(current)
    } else if (current) {
      current.body += `${line}\n`
    }
  }
  return sections.filter((s) => s.body.trim())
}
