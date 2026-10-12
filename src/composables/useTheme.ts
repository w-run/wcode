/**
 * 亮/暗主题管理（wdesign 双主题）
 * - 持久化：localStorage['wcode-theme']
 * - 默认：跟随系统 prefers-color-scheme
 * - 实现：切换 <html data-theme="dark">，由 wdesign _dark.scss 覆盖 --wd-* 变量
 */
import { ref, watchEffect } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'wcode-theme'

const saved = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY) as Theme | null
  } catch {
    return null
  }
})()

const systemDark = (() => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
})()

const initial: Theme = saved ?? (systemDark ? 'dark' : 'light')

const theme = ref<Theme>(initial)

function apply(t: Theme) {
  const root = document.documentElement
  if (t === 'dark') root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')
}

apply(theme.value)

watchEffect(() => {
  apply(theme.value)
  try {
    localStorage.setItem(STORAGE_KEY, theme.value)
  } catch {
    // 忽略存储失败
  }
})

export function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

export function useTheme() {
  return { theme, toggleTheme }
}
