# wcode — 项目经验库（knowledge）

> 本目录沉淀自 AI 会话的项目经验，供后续 Agent 会话快速获取，避免重复踩坑。
> 内容随项目 git 版本管理。会话结束后如有新的可复用经验，应沉淀到此处并更新本索引。

## 索引

| 文件 | 分类 | 要点 |
|:-----|:----:|:-----|
| [feedback_pnpm_allow_builds.md](feedback_pnpm_allow_builds.md) | 纪律 | pnpm 11 供应链策略拦截 esbuild/@parcel-watcher 构建脚本；须在 pnpm-workspace.yaml 设 allowBuilds 批准 |
| [feedback_concurrent_branch.md](feedback_concurrent_branch.md) | 纪律 | 多 worker 必须用独立 worktree 隔离；共享工作区并发导致分支指针互相覆盖、提交错位 |
| [feedback_scss_build_gate.md](feedback_scss_build_gate.md) | 纪律 | 门禁须含 vite build；type-check/lint 不编译 SCSS，$transition-fast 缺失与 mixin 未注入被漏检 |

<!-- 新增条目时按下表格式登记：

| 文件 | 分类 | 要点 |
|:-----|:----:|:-----|
| [feedback_xxx.md](feedback_xxx.md) | 纪律 | 一句话要点摘要 |
| [project_xxx.md](project_xxx.md) | 缺陷 | 一句话根因+修复摘要 |
-->

## 命名与分类约定

| 前缀 | 分类 | 内容 |
|------|:----:|------|
| `feedback_*.md` | 纪律 | 工作纪律与操作教训（git 安全、并发、构建、认证、Gitea API 约束） |
| `project_*.md` | 缺陷 | 项目技术经验（缺陷闭环、根因、修复方案、前端踩坑） |

## 文件模板

```markdown
---
name: <简短名称>
description: <一句话描述，用于未来判断相关性>
type: feedback | project
---

# <标题>

<事实/规则>

**Why:** <原因：哪次事故/哪种偏好导致>

**How to apply:** <何时/何处应用>
```

## 使用约定

1. 新 agent 启动读本索引，按需打开对应文件。
2. 会话中产生新的可复用经验（踩坑教训、缺陷根因、修复方案），完成后沉淀为对应文件并更新本索引。
3. 本地 AI 记忆（`~/.codebuddy/projects/*/memory/`）与本目录分工：前者是会话级自动记忆，后者是项目级持久知识（进 git）。
