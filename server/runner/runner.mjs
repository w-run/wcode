#!/usr/bin/env node
/**
 * wcode runner — 本地工作流执行器（对标 GitHub Actions）
 *
 * 用法:
 *   node server/runner/runner.mjs <workflow.yml> [--job <id>]
 *   pnpm runner workflows/ci.yml
 *
 * 支持的 GitHub Actions 配置子集:
 *   name / on / env
 *   jobs.<id>.{ name, needs, runs-on, env, strategy.matrix, steps }
 *   steps[].{ name, run, uses, env, if, working-directory, continue-on-error }
 *
 * 表达式插值: ${{ matrix.X }} / ${{ env.X }} / ${{ github.X }}
 * 条件表达式: always() / success() / failure() / cancelled() / 布尔字面量
 * `uses:` 内置动作（actions/checkout 等）本地不可执行，会标记跳过。
 */
import { readFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { parse } from 'yaml'

const argv = process.argv.slice(2)
const file = argv.find((a) => !a.startsWith('--'))
const jobFlagIdx = argv.indexOf('--job')
const onlyJob = jobFlagIdx >= 0 ? argv[jobFlagIdx + 1] : null

if (!file) {
  console.error(
    '用法: node server/runner/runner.mjs <workflow.yml> [--job <id>]',
  )
  process.exit(2)
}

const wf = parse(readFileSync(file, 'utf8'))
const wfName = wf.name || file
const wfEnv = wf.env || {}

const C = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
}
const color = (c, s) => `${c}${s}${C.reset}`
const log = (msg) => process.stdout.write(`${msg}\n`)

function sh(command, { env, cwd }) {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, env, cwd, stdio: 'inherit' })
    child.on('close', (code) => resolve(code ?? 0))
    child.on('error', () => resolve(1))
  })
}

/** 解析 ${{ a.b.c }} 表达式并用 ctx 求值 */
function interpolate(str, ctx) {
  if (typeof str !== 'string') return str
  return str.replace(/\$\{\{\s*([^}]+?)\s*\}\}/g, (_m, expr) => {
    const path = expr.trim().split('.')
    let val = ctx
    for (const p of path) val = val == null ? undefined : val[p]
    return val === undefined || val === null ? '' : String(val)
  })
}

/** 展开 strategy.matrix 为组合列表（笛卡尔积，忽略 include/exclude） */
function matrixCombos(matrix) {
  if (!matrix) return [{}]
  const keys = Object.keys(matrix).filter(
    (k) => k !== 'include' && k !== 'exclude',
  )
  let combos = [{}]
  for (const k of keys) {
    const vals = Array.isArray(matrix[k]) ? matrix[k] : [matrix[k]]
    const next = []
    for (const c of combos) for (const v of vals) next.push({ ...c, [k]: v })
    combos = next
  }
  return combos.length ? combos : [{}]
}

/** 归一化 needs：支持字符串或数组 */
function depsOf(job) {
  if (!job || !job.needs) return []
  return Array.isArray(job.needs) ? job.needs : [job.needs]
}

/** 按 needs 做拓扑排序 */
function orderJobs(jobs) {
  const visited = new Set()
  const result = []
  const visit = (id, stack) => {
    if (visited.has(id)) return
    if (stack.has(id)) throw new Error(`needs 存在循环依赖: ${id}`)
    stack.add(id)
    for (const dep of depsOf(jobs[id])) {
      if (jobs[dep]) visit(dep, new Set(stack))
    }
    visited.add(id)
    result.push(id)
  }
  for (const id of Object.keys(jobs)) visit(id, new Set())
  return result
}

function evalCondition(cond, ctx) {
  if (cond === undefined || cond === null || cond === '') return true
  const c = String(cond).trim().toLowerCase()
  if (c === 'always()' || c === 'true') return true
  if (c === 'success()') return ctx.success
  if (c === 'failure()') return !ctx.success
  if (c === 'cancelled()' || c === 'false') return false
  return true
}

const results = {}

/** 执行一个 job 的 steps（单个 matrix 组合） */
async function runSteps(job, combo, baseEnv) {
  let success = true
  const makeCtx = () => ({ matrix: combo, env: baseEnv, github: {} })

  for (const step of job.steps || []) {
    const ctx = makeCtx()
    const title =
      step.name != null
        ? interpolate(step.name, ctx)
        : step.run
          ? interpolate(String(step.run), ctx).split('\n')[0].slice(0, 60)
          : step.uses || 'step'

    if (!evalCondition(step.if, { success })) {
      log(color(C.gray, `  ⤼ 跳过: ${title}`))
      continue
    }

    const stepEnv = { ...baseEnv }
    for (const [k, v] of Object.entries(step.env || {})) {
      stepEnv[k] = interpolate(String(v), ctx)
    }
    const cwd = step['working-directory'] || process.cwd()
    log(color(C.gray, `  → ${title}`))

    let code = 0
    if (step.run) {
      code = await sh(interpolate(String(step.run), ctx), { env: stepEnv, cwd })
    } else if (step.uses) {
      log(color(C.gray, `     (uses: ${step.uses} — 内置动作，本地跳过)`))
    }

    if (code !== 0) {
      if (step['continue-on-error']) {
        log(color(C.yellow, '     ⚠ 失败但 continue-on-error'))
      } else {
        log(color(C.red, `     ✖ 失败（exit ${code}）`))
        success = false
        break
      }
    }
  }
  return success
}

async function runJob(jobId) {
  const job = wf.jobs[jobId]
  const name = job.name || jobId
  const jobEnv = { ...process.env, ...wfEnv }
  for (const [k, v] of Object.entries(job.env || {})) {
    jobEnv[k] = interpolate(String(v), { env: wfEnv })
  }
  const depsOk = depsOf(job).every((d) => results[d]?.status === 'success')

  log('')
  log(
    color(C.cyan, `▶ job: ${name}`) +
      (job['runs-on'] ? color(C.gray, `  [${job['runs-on']}]`) : ''),
  )

  if (!depsOk) {
    log(color(C.yellow, '  ⤼ 跳过（依赖未成功）'))
    results[jobId] = { status: 'skipped' }
    return
  }

  const combos = matrixCombos(job.strategy?.matrix)
  const start = Date.now()
  let ok = true

  for (const combo of combos) {
    if (combos.length > 1) {
      const label = Object.entries(combo)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ')
      log(color(C.gray, `  ▸ 组合 [${label}]`))
    }
    const pass = await runSteps(job, combo, jobEnv)
    if (!pass) ok = false
  }

  const ms = Date.now() - start
  results[jobId] = { status: ok ? 'success' : 'failure', ms }
  log(
    ok
      ? color(C.green, `✓ ${name} (${ms}ms)`)
      : color(C.red, `✖ ${name} (${ms}ms)`),
  )
}

async function main() {
  log(color(C.cyan, `wcode runner · ${wfName}`))
  if (wf.on) log(color(C.gray, `on: ${JSON.stringify(wf.on)}`))

  const jobs = wf.jobs || {}
  const order = onlyJob ? [onlyJob] : orderJobs(jobs)

  for (const id of order) {
    if (!jobs[id]) {
      log(color(C.red, `未知 job: ${id}`))
      process.exitCode = 2
      continue
    }
    await runJob(id)
  }

  log('')
  log(color(C.cyan, '汇总:'))
  let failed = 0
  for (const [id, r] of Object.entries(results)) {
    const c =
      r.status === 'success'
        ? C.green
        : r.status === 'failure'
          ? C.red
          : C.yellow
    log(`  ${color(c, r.status.padEnd(8))} ${jobs[id].name || id}`)
    if (r.status === 'failure') failed++
  }
  process.exitCode = failed > 0 ? 1 : 0
  log('')
  log(
    failed > 0
      ? color(C.red, `结果: 失败 ${failed}`)
      : color(C.green, '结果: 全部通过'),
  )
}

main().catch((err) => {
  console.error(color(C.red, `runner 异常: ${err.message}`))
  process.exit(1)
})
