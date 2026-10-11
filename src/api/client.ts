import { ApiError } from './errors'

/** Gitea 同域代理前缀（Vite proxy 转发到 Gitea :3000） */
export const API_BASE_URL = '/api/v1'

/** 可序列化为 query string 的值 */
export type QueryValue = string | number | boolean | null | undefined

/**
 * 将查询参数序列化为 query string，自动跳过 `undefined` / `null`。
 * 返回形如 `?a=1&b=2` 的字符串；无有效参数时返回空串。
 */
export function buildQuery(params?: Record<string, QueryValue>): string {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    search.append(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** 从错误响应体中提取 `message`，失败时回退到状态文案 */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json()
    if (data && typeof data === 'object' && 'message' in data) {
      const { message } = data as { message?: unknown }
      if (typeof message === 'string' && message) return message
    }
  } catch {
    // 响应体不是 JSON，回退到状态文案
  }
  return `请求失败（HTTP ${response.status}）`
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    throw new ApiError(
      response.status,
      await extractErrorMessage(response),
      response.url,
    )
  }

  // 204 No Content 等无响应体的情况
  if (response.status === 204) {
    return undefined as T
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError(response.status, '响应内容不是合法 JSON', response.url)
  }
}

/** fetch 封装：统一 baseURL / Cookie 凭证 / JSON 解析 / 错误处理 */
export const client = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' })
  },
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  },
  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  },
  del<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' })
  },
}
