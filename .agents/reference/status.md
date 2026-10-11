# 状态速查（.agents/reference/status.md）

> ⚠️ 本文件易过时，权威状态以 `doc/data.json`、`doc/issues.json` 与 `doc/modules/<name>.md` 为准。

## 1. Roadmap（阶段规划）

| 阶段 | 内容 | 状态 |
|------|------|------|
| S0 | 环境（部署 Gitea / 建 DNS/Nginx 骨架 / 拉取前端 Git 仓库骨架） | ✅ 3/3 |
| S1 | 设计系统（颜色令牌 / 间距/圆角/阴影规范 / bento 栅格 / 空态/加载态/错误态） | ✅ 5/5 |
| S2 | API 层（OpenAPI v1 客户端封装：baseURL / 拦截器 / 错误统一处理） | ✅ 3/3 |
| S3 | 核心页（仪表盘 + 仓库列表 + 详情 + 代码浏览） | ✅ 3/3 |
| S4 | 代码浏览（文件树 + 语法高亮 Shiki + README 渲染） | ✅ 3/3 |
| S4.5 | 落地页生成器（4 套内置模板 + `.page/*.tpl` 自定义模板） | ✅ 4/4 |
| S5 | 协作流（Issue/PR 列表与详情 / 全局搜索） | ✅ 3/3 |
| S5.5 | MCP 服务（SSE/stdio + 工具集 + 鉴权） | ✅ 4/4 |
| S5.6 | 镜像同步（Pull Mirror / Push Mirror / 双向同步 + 冲突告警） | ✅ 4/4 |
| S6 | 收尾（移动端适配 / 懒加载 / Nginx 反代完整配置 / 一键部署脚本） | ✅ 4/4 |

## 2. 模块进度

| 模块 | 前缀 | 状态 |
|------|------|------|
| 设计系统 | `design-*` | ✅ S1 完成 |
| API 层 | `api-*` | ✅ S2 完成 |
| 仪表盘 | `dashboard-*` | ✅ S3 完成 |
| 仓库 | `repo-*` | ✅ S3/S4 完成 |
| 落地页 | `landing-*` | ✅ S4.5 完成 |
| 协作流 | `flow-*` | ✅ S5 完成 |
| MCP 服务 | `mcp-*` | ✅ S5.5 完成 |
| 镜像同步 | `mirror-*` | ✅ S5.6 完成 |
| 设置 | `settings-*` | ✅ 镜像设置页就绪 |
| 部署 | `deploy-*` | ✅ S6 完成 |

## 3. 已知风险与约束

| 风险 | 应对 |
|------|------|
| API 覆盖面不足 | 记录并降级为引导回原生页 |
| 认证体验轻微割裂 | 同域 Cookie 免 token，后续可加 OAuth2 登录页 |
| Gitea 升级兼容性 | 前端独立版本控制，API 用稳定版本号 |
| 范围膨胀 | 明确 P0–P2，P0 完成后可日常使用 |
| .tpl 模板注入风险 | 模板引擎沙箱化（Go template 子集，禁任意代码执行）；仅信任本仓库作者 |
| MCP 暴露面 | 仅监听 127.0.0.1 + token 校验；对外访问需显式配置 |
| 双向镜像冲突 | 检测分支分叉即暂停并告警，人工介入合并 |

## 4. 文档索引

| 文档 | 内容 |
|------|------|
| `AGENTS.md` | 项目规约（分支/提交/团队/任务编排/门禁） |
| `wcode.md` | 功能规划原始来源 |
| `doc/data.json` | 进度权威源 |
| `doc/issues.json` | issue 索引 |
| `doc/design-system.md` | 设计系统 |
| `.agents/reference/commands.md` | 命令速查 |
| `.agents/knowledge/README.md` | 经验库索引 |
