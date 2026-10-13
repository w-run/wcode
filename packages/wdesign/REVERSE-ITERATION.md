# WDesign 反向迭代记录

> 从 `w-run/blog`（个人主页，WDesign 的设计原型发源地）回收的能力。
> 原则：**只做向后兼容的新增**，不改动既有 API 与视觉契约（除对���度修复）。

## v1.1 · 2026-10-13

### 1. 弱文本色阶扩展（5 档）

来源：blog 有 6 级文字色阶（#111/#666/#888/#aaa/#ccc/#c7c7c7），WDesign 只有 3 级。

| token | 浅色 | 用途 |
|---|---|---|
| `--wd-ink` | #191B1F | 正文 |
| `--wd-ink-2` | #8A9099 | 说明 |
| `--wd-ink-3` | #B8BEC7 | 占位 |
| **`--wd-ink-4`（新）** | #CDD2D7 | 极弱：时间戳 / 次要标注 |
| **`--wd-ink-5`（新）** | #E3E6EA | 最弱：分割 / 描边 / 禁用 |

### 2. 深色可见性修复（Breaking-ish，属缺陷修正）

深色下 `ink-2`/`ink-3` 对比度不足（占位色在深卡上仅 ~2.5:1，实质不可读）：

| token | 旧值 | 新值 | 深卡（#1C1C1E）对比度 |
|---|---|---|---|
| `--wd-ink-2` | #8888A0 | **#9A9AB2** | 4.3 → **6.3** |
| `--wd-ink-3` | #55556A | **#74748C** | 2.5 → **3.7** |

新增深色 `--wd-ink-4: #58586E` / `--wd-ink-5: #45455A`。

### 3. 主题感知图片（新增）

来源：blog 用 CSS 变量换图 + `brightness()` 滤镜处理深色下的插画/Logo。

```scss
--wd-img-filter:        none;            // 浅色
--wd-img-filter-invert: invert(1) hue-rotate(180deg);
--wd-logo-filter:       none;
--wd-logo-opacity:      1;
// 深色下：img-filter: brightness(.86)，logo-filter: brightness(1.25)，logo-opacity: .8
```

运行时用法：`<img class="wd-theme-aware">`、`<img class="wd-theme-invert">`

### 4. 主题切换过渡时长（新增）

来源：blog 全局 `transition .3s`（WDesign 原本只有分散的 .12/.18/.24s）。

```scss
--wd-dur-theme: .3s;
```
mixin：`@include wd-theme-transition;` · 运行时类：`.wd-theme-transition`

### 5. 排版增强组件（新增）

来源：blog 的 `title-line` mixin 与 `u` 红虚线强调。

| 能力 | mixin | 运行时类 |
|---|---|---|
| 强调下划线（红虚线） | `@include wd-em;` | `.wd-em` |
| 标题装饰线（红胶囊，hover 渐显） | `@include wd-title-line(2em, 5px);` | `.wd-title-line` |

文件：`src/styles/components/typography.scss`（已注册进 `index.scss`）

## v1.2 · 2026-10-13 · 动效曲线族 + 滚动揭示回灌

来源：blog 微动效升级产出

| 新 token | 值 | 用途 |
|---|---|---|
| `$wd-ease-smooth` | cubic-bezier(.4, 0, .2, 1) | 颜色/背景/面板 |
| `$wd-ease-sharp` | cubic-bezier(.6, 0, .8, .2) | 退出/按下 |
| `$wd-ease-spring-soft` | cubic-bezier(.34, 1.3, .64, 1) | UI 微交互（克制弹性，区别于 `wd-ease-spring` 的明显回弹） |
| `$wd-dur-reveal` | `.45s` | 揭示/入场（比 dur-slow 长，给沉降留空间） |

新 mixin `@mixin wd-reveal`（_animations.scss）+ 运行时类 `.wd-reveal`（components/typography.scss，已注册 index.scss）：
- 元素初始隐藏，进入视口加 `.is-revealed` → expo 曲线从下方 12px 浮现
- 支持 `--wd-reveal-delay` 错峰、`prefers-reduced-motion` 降级

对应 blog 侧：`common.scss` 的 `$ease-*`/`$dur-*` 已全部桥接到这些 **WDesign 变量**（不再复制值）。

## v2 · blog → WDesign 引用打通（2026-10-13）

blog 从「复制色值」改为「真正引用」：

- 构建脚本 `tools/build.mjs` 设 `WCODE_PKG=/var/minis/workspace/wcode/packages`，SCSS 可 `@use 'wdesign/styles/tokens'`
- `common.scss` 只引 token 层（不引全量组件，避免 CSS 体积膨胀），`$color-*` 桥接 `$wd-*`
- 组件按需引入：`@use 'wdesign/styles/components/tag'`
- 已替换：RepoCard topic 标签、About 技能胶囊、文章列表标签 → `.wd-tag--sm .wd-tag--gray`
- 构建器增强：`resolveFile` 支持 SCSS partial（`_b.scss`）与 `.scss` 候选后缀

## v3 · blog 系统性复用 WD 组件 + 组件反哺（2026-10-13）

blog 全面切换到 WDesign 组件（含 Vue 组件直接引用）：

| blog 手写 | 替换为 | 说明 |
|---|---|---|
| PostsView 自写标签滑块（有平移动画 bug） | **`WdSegmented`** | 滑块用 offsetLeft 差值绝对定位，零漂移；bug 根因是自写实现没处理字体加载时序 |
| PostsView 列表项手写 | **`WdPostItem`** | 新组件（无日期字段，符合批量导入需求） |
| About「在做什么」手写列表 | **`WdTimeline`** | 新组件（含 `--line` 竖线变体） |
| ProjectView 加载/错误/空状态 | `wd-spinner` / `wd-empty` / `wd-btn` | 按需引入组件样式 |
| RepoCard 语言点/体积角标 | `wd-dot` / `wd-tag--sm` | 视觉统一 |
| About 联系胶囊 | `wd-btn--tint` | |

**反哺到 WDesign 的新组件**（含 SCSS + Vue 组件 + 注册）：
- `WdPostItem` / `components/_post-item.scss`
- `WdTimeline` / `components/_timeline.scss`
- （`WdFilterBar` 曾创建后被移除——与 `WdSegmented` 功能重复）

**构建链路**：blog 可直接 `import X from 'wdesign/components/X.vue'`（alias 已支持）。体验已验证：segmented 连续切换 6 次零漂移。

**WDesign bug 修复**：尺寸令牌（size/padding/font-size）此前误放在 `_animations.scss`，迁移到 `_tokens.scss`（含 :root 发射）；深色值补充 SCSS 变量（`$wd-bg-dark` 等）供编译期引用，消除消费方硬编码。

## v1.2 · 2026-10-13（晚间）

### 1. `WdSegmented` 溢出模式（新增 API）

来源：blog 标签增多后单行放不下（11 个标签 754px > 350px 容器）。

```vue
<WdSegmented v-model="tag" :options="tags" overflow="auto" :overflow-max="15" />
```

| `overflow` | 行为 |
|---|---|
| `wrap`（默认） | 保持原样（不换行、不滚动） |
| `scroll` | 始终单行横向滚动：隐藏滚动条 + 两端**渐隐提示** + 选中项自动滚入视野 |
| `auto` | **自动分档**：放得下 → 铺开；放不下且 ≤ `overflowMax` → 滚动；更多 → **下拉筛选** |

关键实现点：

- **判据是实测宽度，不是选项个数**。分档先量「内容自然宽度 vs 容器可用宽度」，
  只有确实放不下才考虑降级 —— 宽屏下 20 个标签照样铺开，不会被个数误伤。
- ⚠️ **不能用 `track.clientWidth` 判断**：`.wd-segmented` 是 `inline-flex`，宽度随内容，
  永远「放得下」。故 `auto` 模式下 `.wd-segmented-wrap` 改为 `display:block` 以取得真实可用宽度。
- 两端渐隐用 **`mask-image` 线性渐变**（不是盖色块），因此不挑背景色，深浅主题通用。
- 下拉面板视觉与 `WdDropdown` 同源（`--wd-card` / `--wd-radius-md` / `--wd-shadow-hover`，无边框）。
- 响应式：`ResizeObserver` 监听容器宽度变化后重新分档。

### 2. `WdPostItem` 底部红线下划

分隔线拆为两条伪元素：`::after` 常态灰线（`--wd-ink-5`）+ `::before` 红线（`scaleX 0→1`，左起绘制）。
hover 时标题同时变红。原来只有 `translateX(4px)` 位移。

### 3. blog 应用侧

- Writing 页：启用 `overflow="auto"`；标题行加「N 篇」计数。
- 文章内页：新增阅读进度条（`scaleX` 驱动，非 width，避免重排）、文末上/下篇卡片
  （`grid 1fr 1fr`；`:only-child` 占满整行以免单链接留在空列）。
- 验证：三档均通过（5 项 flat / 9 项 scroll / 16 项 dropdown），且窄屏→宽屏可自动回落到 flat。

## v1.3 · 2026-10-13（深夜）

### 变量统一：WDesign 为唯一权威（重要架构调整）

三套命名（blog 的 `$color-*`/`$dur-*`/`$ease-*` + `--color-*`、wcode 的 `$color-*` 第二套、
WDesign 的 `$wd-*`）统一为 **WDesign 一套**：

- **`_tokens.scss` 拆分为「变量层 + 发射层」**：
  - `_tokens.scss` → 只含编译期 SCSS 变量，**不发射 CSS**（可被任意 SFC 安全 `@use`，幂等）
  - `_vars.scss`（新）→ 唯一的 `:root { --wd-* }` 发射点，全站只引入一次
  - `index.scss` 改 `@import 'vars'`
  - ⚠️ 此前每个 SFC 注入 tokens → `:root` 块重复发射 **15 次**（占 CSS 35%，约 47KB），
    且后出现的 `:root`（同优先级）**覆盖深色层** → 深色主题失效。拆分后单次发射，
    blog CSS 133KB → **87KB（-33%）**
- **`_dark.scss` 优先级提升 + 自给自足**：
  - 选择器追加 `:root[data-theme="dark"]` / `html.dark-theme` 等（高于 `:root`，不被覆盖）
  - 内部改用命名空间 `@use './tokens' as t;`（避免与宿主 legacy `@import` 全局变量冲突）
- **消费方改造**：
  - blog：删 `$color-*`/`$dur-*`/`$ease-*` 别名层，直接 `$wd-*` / `var(--wd-*)`；
    顺手修掉三个**从未定义的 CSS 变量**（`--color-primary-light` / `--color-border` / `--color-bg-tertiary`）
  - wcode：`$color-*` → `var(--wd-*)` 纯改名（871 处），`$space-*`/`$radius-*` 同值改名；
    私有语言色改 `$lang-*`
- **反哺新增令牌**：`$wd-shadow-accent`（主题红辉光，0 8px 20px rgba(214,40,57,.28)，来自 wcode）

## 待评估（尚未收编）

- **WDesignSans 字体族**：blog 自托管分段字体（Latin/GB2312/BIG5/JIS × 4 字重，22.8MB woff2）。WDesign 目前用 Mona Sans + 思源黑体。若收编需解决体积（分包/子集化）与授权。
- **导航滑动指示条**：blog 的红色小胶囊随导航项滑动（`transition: left .3s`）。WDesign 有 segmented 但无滑条式导航。
- **彩带 confetti 微交互**：blog 点击姓名触发的粒子效果。

## 回归验证

- `wcode` 落地页构建通过（CSS 118.6 → 122.5KB）
- 落地页 `.lp-sec` 已改用新的标题装饰线，作为反向迭代的落地样例
- 后续若发布 npm：`@w-run/wdesign` 需 minor 版本号
