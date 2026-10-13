/**
 * 登录态 / 展示态
 * ---------------------------------------------------------------
 * 发布后的切换规则：只看是否登录
 *   · 已登录   → 完整模式（Gitea 交互能力全开）
 *   · 未登录   → 只读展示（对外展览）
 * 开发阶段：debugMode 可强制覆盖，界面��只出现"只读 / 完整"字样，
 *           不出现"作品集模式"这类内部叫法。
 */
import { ref, computed } from 'vue'

const TOKEN_KEY = 'wcode-token'

export const user = ref(null) // 已登录时的 Gitea 用户对象
export const authChecked = ref(false)

/** 开发调试覆盖：null=跟随登录态 · 'exhibit'=强制只读 · 'full'=强制完整 */
export const debugMode = ref(readDebug())

function readDebug() {
  try {
    const v = localStorage.getItem('wcode-debug-mode')
    return v === 'exhibit' || v === 'full' ? v : null
  } catch {
    return null
  }
}

export function setDebugMode(m) {
  debugMode.value = m
  try {
    m ? localStorage.setItem('wcode-debug-mode', m) : localStorage.removeItem('wcode-debug-mode')
  } catch (e) {}
}

/** 调试开关只在开发环境出现（本地地址 / ?debug=1） */
export function debugAvailable() {
  try {
    const h = location.hostname
    return h === '127.0.0.1' || h === 'localhost' || h === '::1' ||
      new URLSearchParams(location.search).has('debug')
  } catch {
    return false
  }
}

export const authed = computed(() => !!user.value)

/** 只读展示态（发布时 = 未登录） */
export const exhibit = computed(() => {
  if (debugMode.value === 'exhibit') return true
  if (debugMode.value === 'full') return false
  return !authed.value
})

export function token() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setToken(t) {
  try {
    t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)
  } catch (e) {}
}

/** 用当前 token / 同域会话校验登录态 */
export async function checkAuth() {
  const headers = { Accept: 'application/json' }
  const t = token()
  if (t) headers.Authorization = `token ${t}`
  try {
    const res = await fetch('/api/v1/user', { headers, credentials: 'same-origin' })
    user.value = res.ok ? await res.json() : null
  } catch (e) {
    user.value = null
  } finally {
    authChecked.value = true
  }
  return user.value
}

/** 开发期快捷登录（用户名密码换 token，仅本地调试用） */
export async function loginWithPassword(name, password) {
  const res = await fetch('/api/v1/user', {
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${btoa(`${name}:${password}`)}`,
    },
  })
  if (!res.ok) throw new Error('登录失败')
  return await res.json()
}

export function logout() {
  setToken('')
  user.value = null
}
