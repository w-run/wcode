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
