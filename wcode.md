# Bento Git — Gitea 定制前端项目规划

> 目标：保留 Gitea 后端全部能力，用全新前端替换默认 Web UI，风格为**圆润 · 便当盒卡片 · 色块区分 · 留白**（按钮多用胶囊/大圆角/圆形，避免硬边框，优先色块区分区域）。主题色 `#D62839`。

---

## 🏗️ 架构

```
Nginx :80/443
 ├── /            → 新前端静态站（Vite 构建产物）
 ├── /api/v1      → 反向代理 Gitea :3000（OpenAPI）
 └── /user/login  → Gitea 登录页（复用原生认证）

前端：Vue 3 + TypeScript + Vite + Tailwind CSS 4
认证：同域 Cookie 会话（前端调 /api/v1，免 token 管理）
```

---

## 🔧 环境假设

| 项目 | 值 |
|------|---|
| Gitea 版本 | ≥ 2.x，全新部署 |
| 部署平台 | w-box（Rocky Linux） |
| 代码托管 | GitHub（w-run/bento-git）+ 后端 Gitea w-box 自托管 |
| 功能优先级 | P0 仪表盘+仓库列表+详情+文件浏览 / P0.5 **落地页生成器 + .page 自定义模板** / P1 Issue/PR/搜索 / P1.5 **MCP 服务 + 镜像同步** / P2 设置 |

---

## 📌 实施步骤

### S0 — 环境
- 部署/确认 Gitea；启用 `[openapi]`
- 建 DNS/Nginx 骨架（/ → 前端 :3001，/api/v1 → Gitea :3000）
- 拉取前端 Git 仓库骨架

### S1 — 设计系统
- 颜色令牌（米白底 + 单强调色）
- 间距/圆角/阴影规范
- bento 栅格组件
- 空态/加载态/错误态

### S2 — API 层
- OpenAPI v1 客户端封装（自动补 baseURL、错误统一处理、请求拦截）

### S3 — 核心页
- 仪表盘（大卡：置顶仓库/最近活动；小卡：star/issue/PR 计数）
- 仓库卡片网格（语言色点、更新时间、star）
- 仓库详情（README 大卡 + 侧栏信息卡 + 分支/提交时间线）

### S4 — 代码浏览
- 文件树 + 代码查看（语法高亮 Shiki）
- README 渲染

### S4.5 — 仓库落地页生成器（Landing Page）
- 路由：`/r/:owner/:name?t=模板名`（或仓库详情页内「落地页」标签切换）
- 数据源：README（GFM，多格式）+ 仓库元数据（描述/语言/star/license/topics/作者/默认分支）
- 渲染管线：Markdown → HTML（代码高亮），图片相对路径重写为 Gitea raw URL
- 固定模板 3–4 套：
  - **极简**：大留白、居中标题、描述、正文流
  - **科技**：暗色渐变 + 发光强调色
  - **企业**：顶部品牌条 + README 章节锚点导航 + 统计徽章
  - **卡片**：把 README 小节提取为便当盒卡片网格
- 模板选择：URL 参数 + 前端记忆（localStorage），读取 README front matter 约定可覆盖
- 无 README 的仓库：展示元数据卡片 + 创建 README 引导

### S4.6 — 落地页自定义模板（.page/*.tpl）
- 仓库内约定目录 `.page/`，存放 `*.tpl` 自定义落地页模板
- 双大括号语法 `{{ }}`：注入仓库元数据、README 内容、主题信息
  - 例：`{{ .Repo.Name }}`、`{{ .Repo.Description }}`、`{{ .README }}`
- 模板引擎：Go template 风格子集（变量/循环/条件），**沙箱化**，禁止任意代码执行
- 路由：`/r/:owner/:name/page/<文件>` 渲染对应模板
- 优先级：仓库自带 .tpl > 内置模板 > 无 README 兜底卡片
- 前端模板预览器（编辑时实时预览）

### S5 — 协作流
- Issue/PR 卡片化列表与详情
- 全局搜索

### S5.5 — MCP 服务
- 自带 MCP 服务进程（Go/Node），通过 **SSE** 或 **stdio** 传输暴露给 AI 客户端
- 工具集（按需暴露）：
  - `repo_*`：列表/创建/删除/获取仓库元数据
  - `issue_*`：列表/创建/关闭/评论 Issue
  - `pull_*`：列表/创建/合并 PR
  - `code_search`：全文搜索仓库代码
  - `file_*`：读取/写入仓库文件（需写权限）
- 鉴权：Gitea API Token（用户手动授权，一次性授权页）
- 客户端接入：一行配置（Server-Sent Events URL），兼容 Claude Desktop / Cursor / 其他 MCP 客户端
- 安全：MCP 端口仅监听 `127.0.0.1`，外部不可直连；可选开启 token 验证

### S5.6 — 镜像同步（GitHub / Gitee / 其他 Git）
- 快速配置页：填入源仓库 URL + 凭据（Personal Access Token）→ 一键创建镜像
- 模式：
  - **单向拉取（Pull Mirror）**：定时从远端拉取，Gitea 原生支持
  - **单向推送（Push Mirror）**：定时推送到远端，Gitea 原生支持
  - **双向同步**：Pull + Push 组合，检测冲突时暂停并通知
- 镜像管理卡片：上次同步时间 / 下次同步时间 / 失败重试 / 手动触发按钮
- 远端平台：GitHub（PAT 只需 `repo` scope）、Gitee（access_token）、GitLab（deploy token）、通用 Git（HTTPS 认证）
- 冲突策略：双向镜像检测到分支分叉时，暂停并告警，提供手动合并引导

### S6 — 收尾
- 移动端适配、懒加载
- Nginx 反代完整配置
- 一键部署脚本

---

## ⚠️ 风险

| 风险 | 应对 |
|------|------|
| API 覆盖面不足 | 记录并降级为引导回原生页 |
| 认证体验轻微割裂 | 同域 Cookie 免 token，后续可加 OAuth2 登录页 |
| Gitea 升级兼容性 | 前端独立版本控制，API 用稳定版本号 |
| 范围膨胀 | 明确 P0–P2，P0 完成后可日常使用 |
| .tpl 模板注入风险 | 模板引擎沙箱化（Go template 子集，禁任意代码执行）；仅信任本仓库作者 |
| MCP 暴露面 | 仅监听 127.0.0.1 + token 校验；对外访问需显式配置 |
| 双向镜像冲突 | 检测分支分叉即暂停并告警，人工介入合并 |

---

## ✅ 验收标准

1. 仪表盘、仓库列表、仓库详情、代码浏览可用，无原生 UI 痕迹
2. 落地页：每个仓库自动生成落地页，支持 4 套内置模板 + `.page/*.tpl` 自定义
3. MCP：AI 客户端一行配置即可连接，能完成仓库/Issue/PR 常用操作
4. 镜像同步：可快速配置 GitHub/Gitee/其他源，单向/双向均可用，冲突有告警
5. 明暗模式 + 移动端全站可用：断点布局无破损，触摸目标 ≥44px，底部 Tab 导航，安全区适配
6. 登录一次全站通行（同域 cookie）
7. 单命令部署，Gitea 升级不影响前端
8. 设计语言一致：bento 卡片、留白、圆润风格、胶囊按钮、色块区分
