/**
 * 根据仓库语言返回对应的色值（hex）
 * 匹配规则：大写/大小写不敏感，部分匹配
 */
export function getLangColor(lang?: string | null): string | null {
  if (!lang) return null
  const lower = lang.toLowerCase()
  if (lower.includes('javascript') || lower === 'js') return '#F7DF1E'
  if (lower.includes('typescript') || lower === 'ts') return '#3178C6'
  if (lower.includes('python')) return '#3572A5'
  if (lower.includes('rust')) return '#DEA584'
  if (lower.includes('go')) return '#00ADD8'
  if (lower.includes('c++') || lower.includes('cpp') || lower === 'c')
    return '#F34B7D'
  if (lower.includes('vue')) return '#41B883'
  if (lower.includes('html')) return '#E34C26'
  if (lower.includes('css')) return '#563D7C'
  if (lower.includes('java')) return '#B07219'
  if (lower.includes('ruby')) return '#CC342D'
  if (lower.includes('shell') || lower.includes('bash') || lower.includes('sh'))
    return '#89E051'
  return null
}
