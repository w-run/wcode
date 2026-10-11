# wcode — Gitea 定制前端 · Agent 项目规约

> Update: 2026-10-11
>
> IMPORTANT: 全程思考/回复/文档优先使用简体中文。
>
> 本项目参考 `MeuOS-Kit` 的工程规约体系，但为**前端项目**做了适配（pnpm + Vite + Vue 3 + TypeScript + SCSS）。
> harness 会自动加载本文件；详细参考下放到 `.agents/reference/`，按需读取。

---

## 0. 项目定位

- **项目名称**：wcode
- **定位**：保留 Gitea 后端全部能力，用全新前端替换默认 Web UI；风格为**圆润 · 便当盒卡片 · 色块区分 · 留白**（按钮多用胶囊/大圆角/圆形，避免硬边框，优先色块区分区域）。主题色 `#D62839`。
- **响应式/移动端**：**响应式布局优先**，全站须兼容移动端浏览（断点布局、触摸目标 ≥44px、底部 Tab 导航、安全区适配）。详见 `doc/design-system.md` §5.4。
- **技术栈**：Vue 3 + TypeScript + Vite + SCSS + Pinia + pnpm。
- **后端**：Gitea（≥ 2.x，启用 `[openapi]`），前端同域调用 `/api/v1`，Cookie 会话免 token。
- **部署**：w-box（Rocky Linux），Nginx :80/443 反代（`/` → 前端，`/api/v1` → Gitea :3000）。
- **代码托管**：GitHub（`w-run/wcode`，默认分支 `develop`）；后端 Gitea 为 w-box 自托管。
- **功能规划**：见 `wcode.md`（Roadmap 原始来源，已同步至 `doc/data.json.roadmap`）。

---

## 1. 分支与提交策略

- **分支模型**：`develop` 为主开发分支（日常开发/功能集成，直接提交）；`main` 为稳定分支（稳定发布，仅从 develop 合并，不在 main 直接开发）。
- **新任务必须创建分支**，禁止直接在 `main` 上开发。命名：`feat/<描述>`、`fix/<描述>`、`doc/<描述>`，基于 `develop` 拉分支，完成后合并回 `develop`。
- **worktree 分支**（`worktree-<描述>`）用于长期、跨模块的联动开发（如落地页生成器 + MCP + 镜像同步联动）。生命周期长，阶段性成果合并回 `develop` 后再继续下一阶段；提交时仍需遵守单模块粒度。
- 仅在以下情况可提交到 `main`：稳定发布（从 develop 合并）、一次性修复（typo、构建报错修正）、文档同步、`doc/issues.json` issue 状态更新、纯重构不涉及功能变更。
- **每次提交前必须跑门禁 `pnpm check`**（类型检查 + lint + 单测），确保不引入回归。
- **提交信息格式**：`<模块>: <描述>`，例如 `repo: 仓库卡片网格（语言色点/更新时间/star）`。
- **完成即推送**：每次提交后直接 `git push origin develop`，不积压本地提交。
- **合后清理**：分支合并到 `develop` 后，若无特殊要求，删除本地分支（`git branch -d`），保留远程分支。

---

## 2. 模块划分（组件粒度）

单一前端项目，以**功能模块**作为"组件"粒度。提交前缀、issue 前缀均取自下表：

| 模块 | 前缀 | 范围 | 子项目权威来源 |
|------|------|------|----------------|
| 设计系统 | `design-*` | 颜色令牌 / 间距圆角阴影 / bento 栅格 / 空态加载态错误态 | `doc/design-system.md` |
| API 层 | `api-*` | Gitea OpenAPI v1 客户端封装（baseURL / 拦截器 / 错误统一） | `.agents/reference/api.md` |
| 仪表盘 | `dashboard-*` | 置顶仓库大卡 + star/issue/PR 计数小卡 | `doc/modules/dashboard.md` |
| 仓库 | `repo-*` | 仓库卡片网格 / 详情 / 文件树 / 代码高亮 | `doc/modules/repo.md` |
| 落地页 | `landing-*` | 落地页生成器 + `.page/*.tpl` 自定义模板 | `doc/modules/landing.md` |
| 协作流 | `flow-*` | Issue / PR 卡片化列表与详情 / 全局搜索 | `doc/modules/flow.md` |
| MCP 服务 | `mcp-*` | 自带 MCP 服务进程（SSE/stdio）+ 工具集 + 鉴权 | `doc/modules/mcp.md` |
| 镜像同步 | `mirror-*` | 单向/双向镜像配置与管理 | `doc/modules/mirror.md` |
| 设置 | `settings-*` | 设置页 | `doc/modules/settings.md` |
| 部署 | `deploy-*` | Nginx 反代 / 一键部署脚本 | `doc/deploy.md` |
| CI | `ci-*` | 门禁管道 / 构建缓存 | `.github/workflows/` |

> 模块的**结构/路线图权威来源**为该模块自己的 `doc/modules/<name>.md`（仅在模块启动时创建），未创建前以 `wcode.md` 为准。

---

## 3. 状态与三层模型（Roadmap / Todo / Issue）

**核心系统只有三个**：`doc/data.json`（进度/规划/待办）+ `doc/issues.json`（issue 索引 + `doc/issues/<ID>.md`）+ `.agents/knowledge/`（经验库）。

| 层级 | 位置 | 说明 |
|------|------|------|
| **Roadmap（里程碑/阶段）** | `doc/data.json.roadmap` | S0–S6 阶段规划（含 items/done/total），跨模块 |
| **Todo（待办/行动清单）** | `doc/data.json.todos` | agent 的 task list，记录"最近要做什么事"，**顶层、不区分模块**；提及 issue 用 `#模块ID 描述` |
| **Issue（问题/缺陷）** | `doc/issues.json` + `doc/issues/<ID>.md` | **模块强相关**，唯一的模块粒度条目；含现象/根因/修复/状态流转 |

**铁律**：**不区分「xx 模块的 todo」，只有「xx 模块的 issue」。** 组件粒度只存在于 issue；todo 是顶层行动清单。缺陷/bug/回归一律归 issue，不混入 todo。

- issue 编号规范：`<前缀>-<关键词>`（全小写，前缀见 §2），如 `repo-card-grid`、`landing-tpl-sandbox`。
- issue 状态数字：`0=done`、`1=planned`、`2=pending`。
- **读取优先级**：`doc/issues.json`（issue）→ `doc/data.json`（进度）→ `.agents/knowledge/`（经验）→ `.agents/reference/status.md`（速查）。

---

## 4. 多 Agent 协作规约

- **你不是唯一的工作者**：本项目可能处于多个 Agent 并行工作状态。操作共享资源（分支、文件、issues）时需考虑并发冲突。
- **拉分支 + 工作树**：执行任何任务前先创建新分支，再通过 `git worktree add` 在 `.agents/worktrees/` 下创建工作树，所有开发在独立工作树中进行。
- **复杂任务拉团队**：跨模块修改或涉及多文件的任务，使用 `TeamCreate` 创建团队，按职责分派 Worker。禁止单 Agent 单线程处理大型任务。
- **拉取最新状态**：开始任务前运行 `git fetch origin && git log origin/develop..develop` 确认是否有他人已推送的变更。操作 `doc/data.json`、`doc/issues.json` 等共享文件时注意冲突。

### 4.1 团队工具使用规约（强制）

| 工具 | 正确用法 | 禁止 |
|------|----------|------|
| `TeamCreate` | `{ team_name: "wcode-xxxx", description: "..." }` | 不允许以模块名直接作为队名 |
| `Agent`（spawn 队员） | **必须**提供 `name` + `team_name` + `run_in_background`，**不得设置** `subagent_type` | 禁止用 `subagent_type="executor"` 等子代理方式 |
| `Agent` 的 `name` | 必须是角色名如 `design-worker`、`repo-worker` | 禁止用 `general-purpose` 或缺省 |
| `Agent` 的 `model` | 必须显式指定 `model: "lite"` 或 `model: "reasoning"` | 禁止缺省 |
| `SendMessage` | 用 `{ type: "message", recipient: "队员名", content: "..." }` 发消息 | 禁止用广播代替一对一私信 |
| `SendMessage` shutdown | 用 `{ type: "shutdown_request", recipient: "队员名" }` 优雅关停 | 禁止直接中断或忽略队员消息 |
| `TaskCreate`/`TaskUpdate` | 创建任务后通过 `owner` 分派给队员，队员完成后 `TaskUpdate` 标记 `completed` | 禁止自己创建任务自己完成，应直接做 |
| Task 状态流转 | `pending` → 领任务设 `owner` → `in_progress` → `completed` | 禁止跳过 `in_progress` 直接标记完成 |

### 4.2 团队工作流

1. `ToolSearch` + `TeamCreate` → 创建团队
2. `TaskCreate` → 创建任务卡片（含范围/验收/依赖）
3. `Agent` spawn 队员（`name` + `team_name` + `model`）→ 队员自动加入团队
4. `TaskUpdate` 分配 `owner` → 队员领任务
5. 队员通过 `SendMessage` 汇报成果或卡点
6. 队员完成任务后 `TaskUpdate` 标记 `completed`
7. 所有队员完成 → 合并分支 → `SendMessage shutdown_request` 关停队员
8. `TeamDelete` 清扫团队

---

## 5. 任务编排策略

**任务颗粒度**：任务必须拆到足够细，使得低推理度模型也能独立完成。

- 每个任务只做**一件事**：一个页面 / 一个组件 / 一处 API 封装 / 一个函数。
- 单任务上下文 ≤ 200 行，禁止跨多个不相关的文件或模块。
- 反例（禁止）："实现仓库模块"；正例："创建 `src/components/bento/RepoCard.vue`（语言色点 + 更新时间 + star）"。

**任务卡片五要素**（缺一不可）：

| 要素 | 说明 | 示例 |
|------|------|------|
| 1. 任务 ID | `<模块>-<功能>-<修饰>`，全小写短横线 | `repo-card-grid` |
| 2. 任务范围 | 精确文件路径和修改内容 | 创建 `src/components/bento/RepoCard.vue` |
| 3. 参考来源 | 本仓库已验证实现 → Gitea OpenAPI 文档 → 设计稿 | `doc/design-system.md` + Gitea `/api/v1/repos/search` |
| 4. 验收标准 | 可写成命令断言的检查项 | `pnpm type-check && pnpm test` 通过 + 截图核对 |
| 5. 依赖关系 | 仅依赖已完成的**前置**任务，线性单向无回溯 | 依赖 `design-tokens` 已完成 |

**线性单向任务流**：将任务 DAG 拉平成线性阶段，每阶段内无交叉依赖；阶段内独立任务可并行分派（`Agent run_in_background: true`，并行数 ≤ 4）；**禁止回溯**。

**阶段归档**（提交的前置条件）：
1. 跑门禁 `pnpm check`（必须通过，有回归必须修复后才能提交）。
2. 更新 `doc/issues.json` 对应 issue 状态为 `0`（done），同步 `doc/data.json` 的 roadmap/components 进度。
3. 更新模块文档（`doc/modules/<name>.md`）状态表。
4. Git 提交，信息格式 `<模块>: <阶段描述>`。
5. **禁止未过门禁就提交，禁止未归档就进入下一阶段。**

---

## 6. 构建与门禁命令

```sh
# 安装依赖（必须）
pnpm install

# 开发 / 构建
pnpm dev                # 启动 Vite 开发服务器
pnpm build              # 生产构建（含类型检查）
pnpm preview            # 预览构建产物

# 门禁（提交前必须全过）
pnpm type-check         # vue-tsc --noEmit
pnpm lint               # eslint + prettier 检查
pnpm test               # vitest 单元测试
pnpm check              # 以上三者串联（一键门禁）
```

完整命令、环境变量、Nginx 反代、部署脚本见 `.agents/reference/commands.md`。

---

## 7. 会话恢复流程（新 agent 启动必须按序执行）

0. **团队规约确认** — 读取本文件 §4「团队工具使用规约」，确认 spawn/通信/关停规则。**禁止使用子代理（subagent_type）**。
1. **规划文档读取** — 读 `wcode.md`（功能规划）与 `doc/data.json.roadmap`（当前阶段进度），理解当前阶段目标。
2. **状态加载** — 读 `doc/issues.json`（issue 清单）+ `doc/data.json`（进度）了解项目当前进展；读模块文档 `doc/modules/<name>.md`（如已创建）。
3. **经验库读取** — 读 `.agents/knowledge/README.md` 索引，了解已沉淀的经验（前端踩坑、Gitea API 约束等）。
4. **规约确认** — 重新确认本文件 §1 提交纪律、§5 任务编排、`doc/` 与 `.agents/` 的状态约定。
5. **环境检查** — 确认 `pnpm` 可用、`pnpm install` 完成、Gitea 后端可达（`curl http://<gitea>/api/v1/version`）。

---

## 8. 知识沉淀

- **本地经验库 `.agents/knowledge/`**：进 git 的项目经验。`feedback_*.md`（工作纪律/操作教训）、`project_*.md`（缺陷闭环/技术经验）、`README.md`（索引）。新 agent 启动读索引。
- **详细参考 `.agents/reference/`**：命令速查、状态速查、API 说明等按需读取的文档。
- **会话级记忆**（`~/.codebuddy/projects/*/memory/`）与 `.agents/knowledge/` 分工：前者是会话级自动记忆，后者是项目级持久知识（进 git）。
- 判据：**未来才实现**的功能/设计/规划 → `wcode.md` / `doc/modules/`；**已经实现**的规格和约束 → 代码 + 模块文档。

---

## 9. 参考索引

| 文档 | 内容 |
|------|------|
| `wcode.md` | 功能规划原始来源（架构/环境/阶段/风险/验收） |
| `doc/data.json` | 进度权威源（roadmap + todos + components 进度） |
| `doc/issues.json` | issue 权威源（索引） |
| `doc/issues/<ID>.md` | 单个 issue 的问题+描述+排查记录 |
| `doc/design-system.md` | 设计系统（颜色令牌/间距/圆角/bento 栅格） |
| `doc/modules/<name>.md` | 各模块结构/路线图（模块启动时创建） |
| `.agents/reference/commands.md` | 构建/测试/门禁/部署命令速查 |
| `.agents/reference/status.md` | 全局状态速查（易过时，权威以 data.json/issues.json 为准） |
| `.agents/knowledge/README.md` | 经验库索引（纪律/缺陷闭环） |
