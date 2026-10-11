/**
 * 落地页自定义模板引擎（.page/*.tpl）
 *
 * 极简 Go-template 风格子集，**沙箱化**：只做字段替换与条件渲染，
 * 不执行任意代码，杜绝模板注入。
 *
 * 支持的语法：
 * - `{{ .Repo.Name }}` 变量替换（字段白名单，值自动 HTML 转义）
 * - `{{ .README }}`    README 渲染后的 HTML
 * - `{{ if .Repo.Description }}...{{ end }}` 条件块
 *
 * 仓库字段映射：
 *   .Repo.Name / FullName / Description / Language / Owner / DefaultBranch
 *   / Stars / Forks / Topics / UpdatedAt
 */
import type { Repository } from '@/api/types'
import { formatRelativeTime } from './format'

export interface TemplateContext {
  Repo: Record<string, string | number | string[]>
  README: string
}

/** 将仓库对象映射为模板上下文（扁平字段，供 .Repo.X 引用） */
export function buildTemplateContext(
  repo: Repository,
  readmeHtml: string,
): TemplateContext {
  return {
    Repo: {
      Name: repo.name,
      FullName: repo.full_name,
      Description: repo.description ?? '',
      Language: repo.language ?? '',
      Owner: repo.owner.login,
      DefaultBranch: repo.default_branch,
      Stars: String(repo.stars_count),
      Forks: String(repo.forks_count),
      Topics: repo.topics ?? [],
      UpdatedAt: formatRelativeTime(repo.updated_at),
    },
    README: readmeHtml,
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 解析 `.Repo.X` / `README` 字段路径，返回字符串值或 null */
function resolve(path: string, ctx: TemplateContext): string | null {
  if (path === 'README') return ctx.README
  if (path.startsWith('Repo.')) {
    const key = path.slice(5)
    const val = ctx.Repo[key]
    if (val === undefined || val === null) return null
    if (Array.isArray(val)) return val.join(', ')
    return String(val)
  }
  return null
}

/**
 * 渲染 .tpl 模板。
 *
 * - `{{ if PATH }}` / `{{ end }}`：PATH 有值则输出块体
 * - `{{ .PATH }}`：替换为字段值（自动 HTML 转义，README 除外）
 */
export function renderTemplate(tpl: string, ctx: TemplateContext): string {
  let out = tpl

  // 1) 条件块：{{ if .X }}...{{ end }}（不支持嵌套，块内不得再含 {{ end }}）
  out = out.replace(
    /\{\{\s*if\s+([^}]+)\s*\}\}([\s\S]*?)\{\{\s*end\s*\}\}/g,
    (match, cond, body) => {
      const val = resolve(cond.trim().replace(/^\./, ''), ctx)
      return val ? body : ''
    },
  )

  // 2) 变量替换：{{ .X }}
  out = out.replace(/\{\{\s*\.([^}]+?)\s*\}\}/g, (match, path) => {
    const raw = resolve(path.trim(), ctx)
    if (raw === null) return ''
    return path === 'README' ? raw : escapeHtml(raw)
  })

  return out
}
