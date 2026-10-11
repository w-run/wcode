---
name: pnpm 供应链策略需显式批准构建脚本
description: pnpm 11 环境下 esbuild/@parcel-watcher 构建脚本被 allowBuilds 拦截，导致 vite 无法运行；解决方式是在 pnpm-workspace.yaml 设 allowBuilds
type: feedback
---

# pnpm 11：构建脚本需在 pnpm-workspace.yaml 显式批准

本机 pnpm（11.x）启用了供应链策略，安装时 `esbuild`、`@parcel/watcher` 的构建脚本默认被拦截：

```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: @parcel/watcher@2.6.0, esbuild@0.25.12
```

**Why:** 本机全局 `pnpm config` 设置了 `allowBuilds` 为占位值（`"set this to true or false"`），且 pnpm 11 **不再读取 `package.json` 的 `pnpm` 字段**（`pnpm.onlyBuiltDependencies` 会被 WARN 忽略）。esbuild 的 postinstall 未执行 → 无原生二进制 → vite/vitest 无法启动；且任意 `pnpm <script>` 都会触发依赖校验并因此报 exit 1。

**How to apply:** 新工程一律在仓库根 `pnpm-workspace.yaml` 写入：

```yaml
allowBuilds:
  '@parcel/watcher': true
  esbuild: true
```

然后 `pnpm install` 让构建脚本执行（输出会出现 `esbuild postinstall: Done`）。不要用 `package.json` 的 `pnpm` 字段（已失效）；若报 `allowBuilds` 未生效，检查是否被全局配置覆盖。
