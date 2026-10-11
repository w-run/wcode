---
name: 多 worker 必须用独立 worktree，禁止共享工作区并发
description: 团队多 agent 在同一工作区并发操作导致分支指针互相覆盖、提交错位；必须用 git worktree 隔离
type: feedback
---

# 多 worker 并发：必须 worktree 隔离，禁止共享同一工作区

本次 S1 并行开发（ui/api/layout 三 worker）在 **同一 /workspace/wcode 工作区** 并发操作，发生严重分支竞态：

- `git checkout -b feat/ui-components` 被静默劫持（该分支已被其他 worker 占用）
- ui 提交落到 `feat/layout-components`，layout 提交落到 `feat/ui-components`
- api-worker 首次提交意外落错分支，被迫用 worktree 重新 cherry-pick

最终靠 lead 用 cherry-pick 手工整理（fb1c9c0/fac9067 → develop），分支名全部错位，浪费大量协调成本。

**Why:** git 分支指针是仓库级状态，同一工作区多 worker 的 checkout/commit 会互相覆盖。AGENTS.md §4 已规定「git worktree add .agents/worktrees/」但未被执行。

**How to apply:**
1. 派工前 lead 必须先为每个 worker 建独立 worktree（`git worktree add .agents/worktrees/<名> -b <分支>`），告知各自工作目录。
2. 每个 worker 只在**自己的工作目录**内操作 git。
3. 若已发生分支错位：不要猜，用 `git log --graph --all --oneline` 先画图定位提交归属，再 cherry-pick 整理。
4. 文件级 `git add` + 禁止 `git add -A` 仍要遵守（共享 index 夹带风险）。
