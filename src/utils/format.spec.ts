import { describe, it, expect } from 'vitest'
import { formatCount } from './format'

describe('formatCount', () => {
  it('小于 1000 原样返回', () => {
    expect(formatCount(0)).toBe('0')
    expect(formatCount(999)).toBe('999')
  })

  it('千级用 k', () => {
    expect(formatCount(1000)).toBe('1.0k')
    expect(formatCount(1200)).toBe('1.2k')
    expect(formatCount(12000)).toBe('12k')
  })

  it('百万级用 m', () => {
    expect(formatCount(1_500_000)).toBe('1.5m')
  })
})
