/**
 * 将数量格式化为可读字符串（用于 star/fork/issue 计数）。
 * 例：999 -> "999"，1200 -> "1.2k"，1500000 -> "1.5m"
 */
export function formatCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${trim(n / 1000)}k`
  return `${trim(n / 1_000_000)}m`
}

function trim(x: number): string {
  return x >= 10 ? x.toFixed(0) : x.toFixed(1)
}

/**
 * 将 ISO 时间格式化为相对时间（xx 分钟前 / xx 小时前 / xx 天前 …）。
 * 传入空值或非法时间时返回占位符 `—`。
 */
export function formatRelativeTime(iso?: string): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diff)) return '—'
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 个月前`
  return `${Math.floor(months / 12)} 年前`
}
