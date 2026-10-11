# 命令速查（.agents/reference/commands.md）

> 从 AGENTS.md §6 下放。构建/测试/门禁/部署命令速查。

## 1. 前端工程命令

```sh
# 安装依赖（必须）
pnpm install

# 开发 / 构建
pnpm dev                # 启动 Vite 开发服务器（默认 :3001）
pnpm build              # 生产构建（含类型检查 vite build）
pnpm preview            # 预览构建产物

# 门禁（提交前必须全过）
pnpm type-check         # vue-tsc --noEmit（全量类型检查）
pnpm lint               # eslint . --fix 校验 + prettier --check
pnpm sass               # sass --no-source-map --style=compressed src/assets:dist
pnpm test               # vitest run（单元测试 + 组件测试）
pnpm check              # 一键门禁 = type-check + lint + test + vite build

# 服务与工作流
pnpm mcp                # 启动 stdio MCP 服务（GITEA_TOKEN 鉴权）
pnpm runner workflows/ci.yml   # 本地工作流执行器（对标 GitHub Actions）
pnpm check              # 一键门禁 = type-check + lint + test
```

## 2. Git 工作流

```sh
# 新任务拉分支（基于 develop）
git checkout develop && git pull origin develop
git checkout -b feat/<描述>

# 提交（信息格式 <模块>: <描述>）
git add <具体文件>                # 严禁 git add -A（多 worker 并发夹带风险）
pnpm check                        # 门禁先行
git commit -m "repo: 仓库卡片网格"

# 完成即推送
git push origin develop

# worktree 独立工作树
git worktree add .agents/worktrees/<描述> -b worktree-<描述>
```

## 3. 环境变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `VITE_API_BASE` | API 基础路径（同域代理时留空） | `/api/v1` |
| `GITEA_BASE_URL` | Gitea 服务地址（开发期直连） | `http://localhost:3000` |
| `GITEA_TOKEN` | Gitea API Token（MCP/脚本用） | 空 |
| `MCP_PORT` | MCP 服务监听端口（仅 127.0.0.1） | `8931` |

## 4. Nginx 反代（部署）

```nginx
server {
    listen 80;
    server_name git.example.com;

    # 前端静态站（Vite 构建产物）
    location / { proxy_pass http://127.0.0.1:3001; }

    # Gitea OpenAPI
    location /api/v1 { proxy_pass http://127.0.0.1:3000; }

    # 登录页复用原生认证
    location /user/login { proxy_pass http://127.0.0.1:3000; }
}
```

## 5. 验证 Gitea 后端可用

```sh
curl -s http://<gitea-host>:3000/api/v1/version
# 期望：{"version":"1.x.x"}
```