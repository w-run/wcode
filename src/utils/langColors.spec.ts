import { describe, it, expect } from 'vitest'
import { getLangColor } from './langColors'

describe('getLangColor', () => {
  it('已知语言返回对应色值', () => {
    expect(getLangColor('TypeScript')).toBe('#3178C6')
    expect(getLangColor('js')).toBe('#F7DF1E')
    expect(getLangColor('Python')).toBe('#3572A5')
    expect(getLangColor('Vue')).toBe('#41B883')
  })

  it('大小写不敏感', () => {
    expect(getLangColor('typescript')).toBe(getLangColor('TypeScript'))
  })

  it('未知语言返回 null', () => {
    expect(getLangColor('Brainfuck')).toBeNull()
    expect(getLangColor('')).toBeNull()
    expect(getLangColor(null)).toBeNull()
    expect(getLangColor(undefined)).toBeNull()
  })
})
