import { describe, it, expect } from 'vitest'
import { splitMarkdownSections } from './markdownSections'

describe('splitMarkdownSections', () => {
  it('按标题切分并保留正文', () => {
    const sections = splitMarkdownSections('# A\nfoo\n## B\nbar\n## C\nbaz')
    expect(sections.map((s) => s.title)).toEqual(['A', 'B', 'C'])
    expect(sections[1].body.trim()).toBe('bar')
    expect(sections[2].body.trim()).toBe('baz')
  })

  it('过滤掉无正文的空小节', () => {
    expect(splitMarkdownSections('## 只有标题无正文').length).toBe(0)
  })

  it('标题前的前言不生成小节', () => {
    const sections = splitMarkdownSections('前言内容\n## A\nbody')
    expect(sections.length).toBe(1)
    expect(sections[0].title).toBe('A')
  })

  it('无标题时返回空数组', () => {
    expect(splitMarkdownSections('纯段落文本\n没有标题')).toEqual([])
  })
})
