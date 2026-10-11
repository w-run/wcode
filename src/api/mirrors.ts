import { client } from './client'

/** 镜像仓库 */
export interface Mirror {
  id: number
  remote_address: string
  remote_name?: string
  /** 同步间隔（如 8h0m0s；空表示不定时） */
  interval?: string
  sync_on_commit?: boolean
  /** 最近一次同步时间（ISO 8601），镜像接口返回 */
  updated_at?: string
}

export type MirrorType = 'pull' | 'push'

export interface CreateMirrorOptions {
  remote_address: string
  /** 远端用户名（可选） */
  remote_username?: string
  /** 访问令牌 / 密码（可选） */
  remote_password?: string
  interval?: string
  sync_on_commit?: boolean
}

/** 列出仓库镜像（type: pull=单向拉取 / push=单向推送） */
export async function listMirrors(
  owner: string,
  repo: string,
  type: MirrorType = 'pull',
): Promise<Mirror[]> {
  return client.get<Mirror[]>(`/repos/${owner}/${repo}/mirrors?type=${type}`)
}

/** 创建镜像 */
export async function createMirror(
  owner: string,
  repo: string,
  type: MirrorType,
  data: CreateMirrorOptions,
): Promise<Mirror> {
  return client.post<Mirror>(
    `/repos/${owner}/${repo}/mirrors?type=${type}`,
    data,
  )
}

/** 触发一次镜像同步 */
export async function syncMirror(owner: string, repo: string): Promise<void> {
  await client.post<unknown>(`/repos/${owner}/${repo}/mirrors-sync`, {})
}

/** 删除镜像 */
export async function deleteMirror(
  owner: string,
  repo: string,
  id: number,
): Promise<void> {
  await client.del<unknown>(`/repos/${owner}/${repo}/mirrors/${id}`)
}
