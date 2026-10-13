# WDesign 设计令牌规范（统一源）

> **权威源**：`packages/wdesign/src/styles/_tokens.scss`（浅色）+ `_dark.scss`（深色）
> 所有项目（WCode、blog、后续项目）必须从此取值，不得各自维护色板。

## 1. 统一范围

| 项目 | 状态 | 接入方式 |
|---|---|---|
| **WDesign**（设计系统） | ✅ 权威源 | `_tokens.scss` / `_dark.scss` |
| **WCode**（仓库前端） | ✅ 已统一 | 消费 `--wd-*` 运行时变量 |
| **blog**（个人主页） | ✅ 已统一 | `common.scss` 变量取值改为 WDesign 色板；运行时 `--color-*` 与 WDesign 一致 |

## 2. 色彩令牌

### 主题色（三项目一致）
| 令牌 | 值 | 用途 |
|---|---|---|
| `--wd-red` | `#D62839` | 主按钮 / 关键数据 / 强调 |
| `--wd-red-hover` | `#BC2332` | 悬停 |
| `--wd-red-active` | `#A21E2B` | 按下 |
| `--wd-red-soft` | `#E05B68` | 深色底上的红 |

### 文本色阶（5 级 · 本次统一）
| 令牌 | 浅色 | 深色 | 用途 |
|---|---|---|---|
| `--wd-ink` | `#191B1F` | `#E8E8EC` | 正文 |
| `--wd-ink-2` | `#8A9099` | `#9A9AB2` | 说明 |
| `--wd-ink-3` | `#B8BEC7` | `#74748C` | 占位 |
| `--wd-ink-4` | `#CDD2D7` | `#58586E` | 时间戳 / 次要标注 |
| `--wd-ink-5` | `#E3E6EA` | `#45455A` | 分割 / 描边 / 禁用 |

### 背景分层（色块分层 · 无边框）
| 令牌 | 浅色 | 深色 | 层级 |
|---|---|---|---|
| `--wd-bg` | `#F7F8FA` | `#121214` | L0 页面底 |
| `--wd-card` | `#FFFFFF` | `#1C1C1E` | L1 卡片 |
| `--wd-field` | `#E9EDF1` | `#2A2A2E` | L2 控件底 |
| `--wd-dark` | `#1D1F23` | `#F0F0F0` | L3 深色锚点 |

### 语义色
`--wd-success: #2FA57C / #4CC79A`、`--wd-warning: #E8A33D / #F0B459`、`--wd-danger`，另有 `-soft` 浅底变体。

### 红色浅底（分区色块）
`--wd-tint-1..4`：`#FDF2F3 → #F8DDDF → #FBEAEB → #E8C9CD`（深色为暗红调）。

## 3. 几何令牌

| 令牌 | 值 | 说明 |
|---|---|---|
| `--wd-radius-xs/sm/md/lg/xl/pill` | `8 / 12 / 16 / 24 / 32 / 999px` | **卡片默认 lg=24px**；xs 用于小控件内元素（chip / 角标 / 小图标块） |
| `--wd-shadow-sm/pop/lg/knob` | — | 单层浅阴影，无边框语言 |
| `--wd-space-{1,2,3,4,5,6,7,8,10,12,16}` | `4 / 8 / 12 / 16 / 20 / 24 / 28 / 32 / 40 / 48 / 64px` | 4px 网格，间距节奏 |

## 4. 动效令牌

| 令牌 | 值 | 用途 |
|---|---|---|
| `--wd-dur` | `.18s` | 常规交互 |
| `--wd-dur-slow` | `.24s` | 大位移 / 尺寸变化 |
| `--wd-dur-fast` | `.12s` | 微反馈 |
| `--wd-dur-theme` | `.3s` | **主题切换**（源自 blog） |
| `--wd-ease` / `--wd-ease-spring` / `--wd-ease-out` | — | 缓动曲线 |

## 5. 字体令牌

| 令牌 | 值 |
|---|---|
| `--wd-font-family` | `WDesignSans Latin/CJK Symbol/GB2312/BIG5/JIS` → `Mona Sans` → 系统中文字体 |
| `--wd-font-mono` | `Mona Sans Mono` + 系统等宽 |

**WDesignSans（WIP，暂用）**
- 7 个分区 × 4 字重（200/400/700/900）= 28 个 woff2，按 `unicode-range` 分发
- 按 `html[lang]` 自动切换简/繁/日优先顺序
- 文件路径可配置：`$wd-fontsans-path`（WCode `/fonts/wdesignsans`、blog `/static/font/woff2`）
- 声明位置：`packages/wdesign/src/styles/_fonts.scss`（唯一来源）

## 6. 主题机制（统一为双机制兼容）

WDesign 的深色选择器同时支持两种写法，两项目共存：
```css
[data-theme="dark"],   /* WCode */
.dark-theme {          /* blog（历史写法） */ }
```
blog 的 `themes.scss` 也补了 `[data-theme="dark"]` 与 `:root:not(...)` 兼容，双方可互认。

## 7. 使用约定

1. **新代码**：直接用 `var(--wd-*)`，不要新建色板
2. **blog 旧代码**：可继续用 `--color-*`（已映射到 WDesign 值），逐步迁移
3. **改色**：只改 WDesign 一处，全项目生效
4. **边框**：设计语言为"色块分层"，用 `--wd-tint-*` / `--wd-field` 替代 `border`
5. **禁止**：在业务代码里硬编码十六进制颜色

## 8. 附：本次统一的具体改动

- WDesign：新增 `ink-4/ink-5`、`dur-theme`、`img-filter` 族；深色 `ink-2/3` 对比度修复；`_fonts.scss` 接管 WDesignSans；`--wd-font-family` 纳入 WDesignSans
- blog：`common.scss` 色板全部对齐 WDesign 值；`themes.scss` 补双机制兼容；`--logo-color` 对齐
- WCode：新增 `public/fonts/wdesignsans/`（28 文件），字体栈生效
