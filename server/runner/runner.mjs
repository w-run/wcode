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
 *   jobs.<id>.{ name, needs, runs-on, env, steps }
 *   steps[].{ name, run, uses, env, if, working-directory, continue-on-error }
 *
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

function evalCondition(cond, ctx) {
  if (cond === undefined || cond === null || cond === '') return true
  const c = String(cond).trim().toLowerCase()
  if (c === 'always()' || c === 'true') return true
  if (c === 'success()') return ctx.success
  if (c === 'failure()') return !ctx.success
  if (c === 'cancelled()' || c === 'false') return false
  return true
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

const results = {}

async function runJob(jobId) {
  const job = wf.jobs[jobId]
  const name = job.name || jobId
  const jobEnv = { ...process.env, ...wfEnv, ...(job.env || {}) }
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

  const start = Date.now()
  let success = true

  for (const step of job.steps || []) {
    const title =
      step.name ||
      (step.run
        ? String(step.run).split('\n')[0].slice(0, 60)
        : step.uses || 'step')

    if (!evalCondition(step.if, { success })) {
      log(color(C.gray, `  ⤼ 跳过: ${title}`))
      continue
    }

    const stepEnv = { ...jobEnv, ...(step.env || {}) }
    const cwd = step['working-directory'] || process.cwd()
    log(color(C.gray, `  → ${title}`))

    let code = 0
    if (step.run) {
      code = await sh(String(step.run), { env: stepEnv, cwd })
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

  const ms = Date.now() - start
  results[jobId] = { status: success ? 'success' : 'failure', ms }
  log(
    success
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
