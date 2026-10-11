import { describe, it, expect } from 'vitest'
import { buildTemplateContext, renderTemplate } from './templateEngine'
import type { Repository } from '@/api/types'

const repo = {
  name: 'demo',
  full_name: 'u/demo',
  description: '<b>hi</b>',
  language: 'TypeScript',
  owner: { login: 'u' },
  default_branch: 'main',
  stars_count: 42,
  forks_count: 7,
  topics: ['a', 'b'],
  updated_at: '2026-01-01T00:00:00Z',
} as unknown as Repository

const ctx = buildTemplateContext(repo, '<p>README</p>')

describe('templateEngine', () => {
  it('替换仓库字段', () => {
    expect(renderTemplate('{{ .Repo.Name }}', ctx)).toBe('demo')
    expect(renderTemplate('{{ .Repo.Owner }}', ctx)).toBe('u')
    expect(renderTemplate('{{ .Repo.Stars }}', ctx)).toBe('42')
    expect(renderTemplate('{{ .Repo.DefaultBranch }}', ctx)).toBe('main')
  })

  it('字段值做 HTML 转义（防注入）', () => {
    expect(renderTemplate('{{ .Repo.Description }}', ctx)).toBe(
      '&lt;b&gt;hi&lt;/b&gt;',
    )
  })

  it('README 注入为已渲染 HTML（不转义）', () => {
    expect(renderTemplate('{{ .README }}', ctx)).toBe('<p>README</p>')
  })

  it('条件块按字段有无渲染', () => {
    expect(renderTemplate('{{ if .Repo.Description }}有{{ end }}', ctx)).toBe(
      '有',
    )
    expect(renderTemplate('{{ if .Repo.Missing }}x{{ end }}', ctx)).toBe('')
  })

  it('数组字段 join', () => {
    expect(renderTemplate('{{ .Repo.Topics }}', ctx)).toBe('a, b')
  })

  it('未知字段替换为空串', () => {
    expect(renderTemplate('[{{ .Repo.Nope }}]', ctx)).toBe('[]')
  })
})
