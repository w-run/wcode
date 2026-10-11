---
name: worktree 内跑 pnpm 命令的 TTY 陷阱
description: worktree 无 node_modules，pnpm 依赖校验触发重建但无 TTY 被拒（ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY）；绕过方式
type: feedback
---

# worktree 内 pnpm 命令会触发依赖校验并因无 TTY 失败

git worktree 只共享 `.git`，**不共享 `node_modules`**。在 worktree 内跑 `pnpm <script>` 时，pnpm 11 的 pre-run 依赖校验发现 `node_modules` 与 lockfile 状态不符，尝试重建，但在非 TTY 环境被拒：

```
ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY
```

`npm_config_verify_deps_before_run=false` 环境变量无效。

**Why:** S3 的 dashboard-worker 在 `.agents/worktrees/dashboard` 内直接跑 `pnpm check` 撞到此错，误以为代码有问题；实际是环境问题。

**How to apply（绕过方式，任选）：**
1. 直接调用二进制：`node_modules/.bin/vue-tsc --noEmit`、`node_modules/.bin/eslint .`、`node_modules/.bin/vitest run`、`node_modules/.bin/vite build`（结果与 pnpm 脚本等价）。
2. 让 worktree 复用主工作树的 `node_modules`：`ln -s ../../node_modules .agents/worktrees/<name>/node_modules`。
3. 在 worktree 内先跑一次 `pnpm install`（需能交互/有 TTY）。

> 注意：worker 报「pnpm check 失败」时，先确认是不是这个 TTY 环境问题，再怀疑代码。
