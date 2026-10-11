# wcode

> 保留 Gitea 后端全部能力，用全新前端替换默认 Web UI。风格：**圆润 · 胶囊按钮 · 大圆角卡片 · 色块区分 · 留白**。主题色 `#D62839`（深红）。

GitHub：https://github.com/w-run/wcode

## 技术栈

Vue 3 + TypeScript + Vite + SCSS，包管理器 pnpm。

## 快速开始

```sh
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器（默认 :3001）
pnpm check            # 一键门禁：type-check + lint + test
pnpm build            # 生产构建
```

## 架构

```
Nginx :80/443
 ├── /            → 新前端静态站（Vite 构建产物）
 ├── /api/v1      → 反向代理 Gitea :3000（OpenAPI）
 └── /user/login  → Gitea 登录页（复用原生认证）

前端：Vue 3 + TypeScript + Vite + SCSS
认证：同域 Cookie 会话（前端调 /api/v1，免 token 管理）
```

## 文档导航

| 文档 | 内容 |
|------|------|
| [AGENTS.md](AGENTS.md) | **项目规约**（分支/提交/团队协作/任务编排/门禁）— 开发前必读 |
| [wcode.md](wcode.md) | 功能规划原始来源（阶段/风险/验收标准） |
| [doc/data.json](doc/data.json) | 进度权威源（roadmap + todos + components） |
| [doc/issues.json](doc/issues.json) | issue 索引 |
| [doc/design-system.md](doc/design-system.md) | 设计系统（色彩/间距/圆角/Bento 栅格） |
| [.agents/reference/commands.md](.agents/reference/commands.md) | 命令速查 |
| [.agents/reference/status.md](.agents/reference/status.md) | 状态速查 |
| [.agents/knowledge/README.md](.agents/knowledge/README.md) | 经验库索引 |

## 部署

```
Nginx :80
 ├── /            → 前端静态站（dist/，部署到 /var/www/wcode）
 ├── /api/v1      → 反向代理 Gitea :3000（OpenAPI）
 └── /user/login  → Gitea 登录页（同域 Cookie 认证）
```

```sh
./deploy/deploy.sh          # 一键部署（安装→门禁→rsync→nginx reload）
```

配置模板见 `deploy/nginx.conf`（需改 `server_name` 后放入 `/etc/nginx/conf.d/`）。

## 本地 CI Runner

对标 GitHub Actions 的工作流执行器（GH Actions 受 `workflow` scope 限制时的本地替代）：

```sh
pnpm runner workflows/ci.yml            # 执行工作流
pnpm runner workflows/ci.yml --job check  # 只跑某个 job
```

支持 `on / env / jobs / needs / steps / run / uses / if / continue-on-error` 子集。
详见 [doc/modules/runner.md](doc/modules/runner.md)。

## MCP 服务

```sh
GITEA_TOKEN=<token> pnpm mcp   # 启动 stdio MCP 服务（AI 客户端接入）
```

详见 [doc/modules/mcp.md](doc/modules/mcp.md)。

## 开发流程（摘要）

1. 基于 `develop` 拉分支：`feat/<描述>`、`fix/<描述>`、`doc/<描述>`。
2. 任务拆细到单文件/单组件粒度，遵循任务卡片五要素（见 `AGENTS.md` §5）。
3. 提交前跑 `pnpm check` 门禁，提交信息格式 `<模块>: <描述>`。
4. 阶段完成后归档：更新 issue 状态 + 进度，再提交。
5. 完成即推送 `git push origin develop`。

完整规约见 [AGENTS.md](AGENTS.md)。

## 许可

待定。
