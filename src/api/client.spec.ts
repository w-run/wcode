import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { client } from './client'
import { ApiError } from './errors'

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('api/client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('成功路径：200 返回解析后的 JSON', async () => {
    const payload = { id: 1, name: 'wcode' }
    vi.mocked(fetch).mockResolvedValue(jsonResponse(payload))

    await expect(client.get('/version')).resolves.toEqual(payload)
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/version',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    )
  })

  it('POST 携带 JSON body 与 Content-Type', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true }))

    await client.post('/repos/a/b/issues', { title: 'x' })

    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify({ title: 'x' }))
  })

  it('错误路径：非 2xx 抛出 ApiError（含状态码与 message）', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: 'repository not found' }, { status: 404 }),
    )

    const error = await client.get('/repos/a/b').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(404)
    expect((error as ApiError).message).toBe('repository not found')
  })

  it('错误路径：非 JSON 响应回退到状态文案', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('<html>Internal Server Error</html>', {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }),
    )

    const error = await client.get('/boom').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(500)
  })

  it('JSON 解析失败：200 但非法 JSON 抛 ApiError', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('not-json', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(client.get('/bad')).rejects.toBeInstanceOf(ApiError)
  })

  it('204 No Content：返回 undefined', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))

    await expect(client.del('/repos/a/b')).resolves.toBeUndefined()
  })
})
