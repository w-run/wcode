# 设计系统（WDesign 接入）

wcode 的 UI 基于自研设计系统 [w-run/wdesign](https://github.com/w-run/wdesign)（Soft Bento · Red），以 **vendored + pnpm workspace** 方式引入。

## 引入方式

| 项 | 说明 |
|----|------|
| 依赖 | `wdesign` / `wdesign-icons`（`workspace:*`，源码在仓库 `packages/` 下） |
| 样式入口 | `import 'wdesign/styles'`（tokens + base + components + dark） |
| 组件注册 | `app.use(WdUI)`（注册前 30 个）；`WdSegmented`/`WdExplorer` 等需按需 import |
| 图标 | `app.component('WdIcon', WdIcon)`（595 图标，`<WdIcon name="home" />`） |
| 上游同步 | `pnpm wdesign:sync`（sparse clone → `packages/`，记录 `packages/WDESIGN_VERSION`） |

> 上游 commit 记录在 `packages/WDESIGN_VERSION`。同步脚本会剔除 17.7MB 中文 ttf（中文回退系统字体）与 demo 资产，并清洗上游损坏的 U+FFFD 字符（Dart Sass 视为非法字节）。

## 令牌兼容层

`src/assets/styles/_tokens.scss` 保留 wcode 原有变量名，取值改为 wdesign 运行时变量：

```scss
$color-bg:      var(--wd-bg);
$color-surface: var(--wd-card);
$color-accent:  var(--wd-red);
// ...
```

**机制**：Sass 变量是纯文本替换，`background: $color-surface` 编译为 `background: var(--wd-card)`；
`[data-theme="dark"]` 覆盖 `--wd-*` 后，**全站自动切换暗色，无需改动任何组件文件**。

- 几何/字体令牌直接取 wdesign 数值（圆角 12/16/24/32、间距 4pt、字体 Mona Sans + 中文系统回退）。
- `vite.config.ts` 的 `additionalData` 仍注入本文件（**不**注入 wdesign `_tokens.scss`，避免重复输出 `:root`）。
- `_root.scss`（旧 CSS 变量死代码）已删除。

## wdesign 关键令牌

- 主题红 `#D62839`（亮/暗恒定）：`--wd-red` / hover `--wd-red-hover` / 浅底 `--wd-tint-1..4`
- 中性色：`--wd-ink`（正文）/ `--wd-ink-2`（次级）/ `--wd-bg` / `--wd-card` / `--wd-field`
- 深色锚点：`--wd-dark` / `--wd-dark-2` / `--wd-on-dark-*`
- 圆角：`--wd-radius-sm|md|lg|xl|pill`（12/16/24/32/999）

## 规范

见 `doc/design-system.md`（视觉规范）与 `packages/wdesign/README.md`（组件 API）。
