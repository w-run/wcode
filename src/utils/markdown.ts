/**
 * 轻量 Markdown 渲染（无第三方依赖）。
 *
 * 支持：标题 h1-h6、段落、无序/有序列表、行内代码、代码块、
 * 引用块、表格、粗体、斜体、链接、图片。
 *
 * 安全：先转义 HTML 特殊字符，再套用受控标签，避免 README 中注入脚本。
 */
export function renderMarkdown(source: string): string {
  return (
    source
      // 先转义 HTML 特殊字符，防止 XSS
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // 代码块
      .replace(
        /```(\w*)\n([\s\S]*?)```/g,
        '<pre><code class="language-$1">$2</code></pre>',
      )
      // 行内代码
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // 标题（从 h6 到 h1，避免前缀冲突）
      .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
      .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // 引用块
      .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
      // 表格
      .replace(
        /^\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/gm,
        (_m, header: string, body: string) => {
          const th = header
            .split('|')
            .filter(Boolean)
            .map((h) => `<th>${h.trim()}</th>`)
            .join('')
          const rows = body
            .trim()
            .split('\n')
            .map(
              (row) =>
                '<tr>' +
                row
                  .split('|')
                  .filter(Boolean)
                  .map((td) => `<td>${td.trim()}</td>`)
                  .join('') +
                '</tr>',
            )
            .join('')
          return `<table><thead><tr>${th}</tr></thead><tbody>${rows}</tbody></table>`
        },
      )
      // 列表项
      .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // 粗体 / 斜体
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // 图片
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" loading="lazy" />',
      )
      // 链接
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
      )
      // 按空行切块，区分块级元素与段落
      .split(/\n{2,}/)
      .map((block) => {
        const trimmed = block.trim()
        if (!trimmed) return ''
        if (/^<(h[1-6]|ul|ol|pre|blockquote|table)/.test(trimmed))
          return trimmed
        if (trimmed.startsWith('<li>')) return `<ul>${trimmed}</ul>`
        return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`
      })
      .join('\n')
  )
}

/** 将 Gitea contents 接口返回的（通常 base64）内容解码为文本 */
export function decodeContent(content: string, encoding: string): string {
  if (encoding === 'base64') {
    try {
      return decodeURIComponent(
        Array.prototype.map
          .call(
            atob(content.replace(/\n/g, '')),
            (c: string) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`,
          )
          .join(''),
      )
    } catch {
      return atob(content.replace(/\n/g, ''))
    }
  }
  return content
}
