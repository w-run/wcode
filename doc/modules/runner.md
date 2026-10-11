# 本地 Runner（对标 GitHub Actions）

wcode 自带的本地工作流执行器，读取 GitHub Actions 格式的 YAML 工作流并在本机执行，
是 GitHub Actions 的本地替代（本仓库 token 无 `workflow` scope，无法直接启用 GH Actions）。

## 用法

```sh
pnpm runner workflows/ci.yml           # 执行整个工作流
pnpm runner workflows/ci.yml --job check  # 只执行某个 job
```

## 支持的配置子集

```yaml
name: 工作流名称

on:                       # 记录触发条件（本地为手动触发）
  push:
    branches: [develop]

env:                      # 工作流级环境变量
  CI: 'true'

jobs:
  check:
    name: 显示名
    needs: [other]        # job 依赖（拓扑排序，依赖未成功则跳过）
    runs-on: ubuntu-latest
    env:                  # job 级环境变量
      FOO: bar
    steps:
      - name: 步骤名
        run: pnpm check     # shell 命令（失败中断 job）
        working-directory: .
        env: { A: '1' }
        if: success()       # 条件：always()/success()/failure()/cancelled()/布尔
        continue-on-error: true
      - uses: actions/checkout@v4   # 内置动作（本地标记跳过）
```

### matrix 矩阵

```yaml
jobs:
  build:
    strategy:
      matrix:
        node: [18, 20]
        os: [linux, macos]
    steps:
      - run: echo "node=${{ matrix.node }} os=${{ matrix.os }}"
```

每个组合独立执行一遍 job，任一组合失败则 job 判失败（`needs` 依赖该 job 的后续 job 会跳过）。

### 表达式插值

| 表达式 | 取值 |
|--------|------|
| `${{ matrix.X }}` | 当前矩阵组合的字段值 |
| `${{ env.X }}` | 工作流 / job 级环境变量 |
| `${{ github.X }}` | 预留（本地为空） |

插值可用于 `run`、`env`、`name`。

## 条件表达式

| 表达式 | 含义 |
|--------|------|
| `always()` | 总是执行 |
| `success()` | 前序步骤全部成功时执行 |
| `failure()` | 前序步骤有失败时执行 |
| `cancelled()` | 从不执行（本地无取消语义） |
| `true` / `false` | 布尔字面量 |

## 与 GitHub Actions 的差异

- `uses:` 内置动作（`actions/checkout` 等）**不映射执行**，仅标记跳过（本地无云环境）
- `runs-on` 仅作展示，不选择实际运行环境（本地即当前机器）
- `secrets` / `strategy.fail-fast` / `matrix.include|exclude` 暂未支持
- 本地无条件触发，`on` 仅作元信息记录

## matrix 演示

```sh
pnpm runner workflows/matrix-demo.yml   # 4 组合 + needs 依赖 job
```

## 输出

每个 job / step 带颜色前缀日志，末尾输出汇总表与退出码（有失败 job 时退出码为 1，可用于本地 pre-push 钩子）。
