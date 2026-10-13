# wdesign-icons

**WDesign 图标库** — Soft Bento · Red 配套。
595 个 SVG 文件（filled 164 / outlined 431），431 个唯一名称；全部 **256×256 · currentColor · kebab-case**。

## 目录
```
wdesign-icons/
├── icons/
│   ├── filled/      # 实心（164）
│   └── outlined/    # 线性（431）
├── icons.json       # 清单（名称 / 风格 / 尺寸）
├── icons.data.js    # 全量内联数据（非构建环境用，window.WD_ICONS）
├── src/
│   ├── WdIcon.vue   # Vue3 组件（Vite 环境自动加载）
│   └── index.ts
└── MIGRATION.md     # 命名规范化记录（旧名 → 新名）
```

## 使用（Vue3 + Vite）
保持与 `wdesign/` 同级目录：
```ts
import { WdIcon } from 'wdesign-icons'
```
```vue
<WdIcon name="home" />
<WdIcon name="bell" filled :size="28" />
<WdIcon name="heart" :size="32" style="color: var(--wd-red)" />
```
图标颜色 = `currentColor`，由 CSS `color` 驱动（红 / 墨色 / 深底白字零成本切换）。

## 使用（非构建环境 / 纯 HTML）
```html
<script src="wdesign-icons/icons.data.js"></script>
<script>
  document.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = window.WD_ICONS['outlined/' + el.dataset.icon] || ''
    el.style.cssText += ';display:inline-flex;width:24px;height:24px'
  })
</script>
```

## 命名规范
- 全小写 kebab-case：`arrow-left-circle`
- 语义后缀：`-off`（禁用）、`-plus / -minus`（增删）、`-alt`（变体）、`-circle / -square`（外框）
- 无冗余前缀（无 `icon-`），无游离编号
- 全部变更记录见 [MIGRATION.md](./MIGRATION.md)

## 规范
- 画布：**256 × 256**（已统一，含 32 个历史 257 宽文件）
- 颜色：**currentColor**（已统一，去除硬编码 black）
- 许可：请按原图标集授权使用
