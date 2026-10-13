import { client } from './client'
import type { Organization } from './types'

/**
 * 列出当前用户所属的组织
 * GET /user/orgs
 */
export async function listMyOrgs(): Promise<Organization[]> {
  return client.get<Organization[]>('/user/orgs')
}
