import { describe, it, expect } from 'vitest'
import { renderMarkdown, decodeContent } from './markdown'

describe('renderMarkdown', () => {
  it('转义 HTML 特殊字符，防止 XSS', () => {
    const out = renderMarkdown('<script>alert(1)</script>')
    expect(out).not.toContain('<script>')
    expect(out).toContain('&lt;script&gt;')
  })

  it('渲染标题与段落', () => {
    const out = renderMarkdown('# 标题\n\n正文内容')
    expect(out).toContain('<h1>标题</h1>')
    expect(out).toContain('<p>正文内容</p>')
  })

  it('渲染行内代码与代码块', () => {
    const out = renderMarkdown('`pnpm install`\n\n```ts\nconst a = 1\n```')
    expect(out).toContain('<code class="inline-code">pnpm install</code>')
    expect(out).toContain('<pre><code class="language-ts">')
  })

  it('渲染列表与表格', () => {
    const out = renderMarkdown('- 甲\n- 乙\n\n| A | B |\n|---|---|\n| 1 | 2 |')
    expect(out).toContain('<ul>')
    expect(out).toContain('<li>甲</li>')
    expect(out).toContain('<li>乙</li>')
    expect(out).toContain('<table>')
    expect(out).toContain('<th>A</th>')
  })
})

describe('decodeContent', () => {
  it('解码 base64 内容', () => {
    expect(decodeContent(btoa('hello'), 'base64')).toBe('hello')
  })

  it('非 base64 原样返回', () => {
    expect(decodeContent('plain', 'text')).toBe('plain')
  })
})
