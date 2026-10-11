---
name: 门禁必须含 vite build 才能暴露 SCSS 编译错误
description: type-check 不编译 SCSS，layout 组件的 $transition-fast 未定义/mixin 未注入问题被门禁漏掉，须在 check 中纳入 vite build
type: feedback
---

# 门禁盲区：type-check 不编译 SCSS，build 必须纳入 check

layout-worker 实现了 `$transition-fast` 过渡令牌（_tokens.scss/_root.scss），但该令牌被 AppHeader/AppSidebar/ErrorState 等组件引用时，**组件内的 `@use` 导入路径与 vite 的 `additionalData` 全局注入形成冲突**：先注入 tokens（token 可见），但组件内又 `@use 'tokens' as *` 导致重复/冲突。更深层问题是：

1. `$transition-fast` 在 _tokens.scss 中但未定义 → SCSS 编译失败
2. `@include media-up/media-down` 的 mixin 来自 _mixins.scss，但 vite additionalData 未注入该文件 → 编译失败

**以上两种情况 `pnpm type-check` 全部通过**（vue-tsc 不管 SCSS），`pnpm lint` 也不管。只有 `vite build`（生产构建）才会触发 SCSS 编译器报错。

本次修复方案：
- layout-worker 在 origin/develop 中补了 `$transition-fast`（16820be）
- layout-worker 在 vite.config.ts additionalData 补了 `@use _mixins.scss`（4be3518）
- lead 在 `package.json check` 脚本中加入了 `vite build`（`pnpm check = type-check + lint + test + vite build`）

**Why:** SCSS 编译是构建期行为，TS 类型检查是静态分析，两者完全独立。门禁漏掉 build = 漏掉所有 SCSS/样式编译错误。

**How to apply:**
- `check` 脚本必须包含 `vite build`：`"check": "pnpm type-check && pnpm lint && pnpm test && vite build"`
- 维护一个 smoke 入口或用 `vite build` 强制编译全部组件（layout-worker 验证时用了独立 vite.verify.config.ts）
