# MCP 服务

wcode 自带 MCP 服务进程，通过 **stdio** 传输暴露给 AI 客户端，零第三方依赖（Node 22 内置 fetch）。

## 启动

```sh
GITEA_URL=http://127.0.0.1:3000 GITEA_TOKEN=<你的token> pnpm mcp
```

## 客户端接入（一行配置）

Claude Desktop / Cursor 等 MCP 客户端：

```json
{
  "mcpServers": {
    "wcode": {
      "command": "node",
      "args": ["/path/to/wcode/server/mcp/index.mjs"],
      "env": {
        "GITEA_URL": "http://127.0.0.1:3000",
        "GITEA_TOKEN": "<token>"
      }
    }
  }
}
```

## 工具集

| 工具 | 说明 |
|------|------|
| `repo_list` | 列出当前用户所有仓库 |
| `repo_search` | 搜索仓库 |
| `issue_list` | 列出仓库 Issue |
| `issue_create` | 创建 Issue |
| `pr_list` | 列出仓库 Pull Request |

## 协议

- stdio 传输，JSON-RPC 2.0 + Content-Length 分帧（MCP 2024-11-05）
- 支持 `initialize` / `tools/list` / `tools/call` / `ping`

## 安全

- 通过 `GITEA_TOKEN` 鉴权，Token 只保存在客户端配置中
- 仅暴露读 + Issue 创建，未提供写代码 / 合并等高风险操作（按需扩展）
