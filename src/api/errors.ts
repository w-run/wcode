/** Gitea API 请求错误：封装 HTTP 状态码、错误信息与请求地址 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly url: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
