# 设计系统规范

> 本文档定义 Bento Git 的设计系统规范。权威来源：本文档 + `src/assets/` 设计令牌文件。

## 1. 色彩体系

### 1.1 主题色板

| Token | 值 | 用途 |
|-------|----|------|
| `--color-bg` | `#FAFAF8` | 页面背景（米白） |
| `--color-surface` | `#FFFFFF` | 卡片/组件背景 |
| `--color-surface-2` | `#F5F5F0` | 次级表面（hover/selected） |
| `--color-text` | `#1A1A1A` | 主文本 |
| `--color-text-muted` | `#6B7280` | 次级文本 |
| `--color-accent` | `#D62839` | 强调色（主题色：深红，用于交互/按钮/链接） |
| `--color-accent-hover` | `#B81F2E` | 强调色 hover |
| `--color-accent-light` | `#FBE8EA` | 强调色浅底（标签/徽章背景） |
| `--color-danger` | `#DC2626` | 危险/错误 |
| `--color-danger-light` | `#FEE2E2` | 危险浅底 |
| `--color-success` | `#16A34A` | 成功 |
| `--color-success-light` | `#DCFCE7` | 成功浅底 |
| `--color-warning` | `#CA8A04` | 警告 |
| `--color-warning-light` | `#FEF9C3` | 警告浅底 |

### 1.2 语义色

| Token | 值 | 用途 |
|-------|----|------|
| `--color-lang-js` | `#F7DF1E` | JavaScript |
| `--color-lang-ts` | `#3178C6` | TypeScript |
| `--color-lang-python` | `#3572A5` | Python |
| `--color-lang-rust` | `#DEA584` | Rust |
| `--color-lang-go` | `#00ADD8` | Go |
| `--color-lang-cpp` | `#F34B7D` | C++ |

## 2. 间距系统

基于 4px 基准网格：

| Token | 值 | 用途 |
|-------|----|------|
| `--space-1` | `4px` | 紧凑间距 |
| `--space-2` | `8px` | 组件内间距 |
| `--space-3` | `12px` | 组件间间距 |
| `--space-4` | `16px` | 标准间距 |
| `--space-6` | `24px` | 区块间距 |
| `--space-8` | `32px` | 大区块间距 |
| `--space-12` | `48px` | 页面区块间距 |
| `--space-16` | `64px` | 页面大区块间距 |

## 3. 圆角系统（圆润风格）

**核心原则：多用胶囊/大圆角/圆形，避免硬边框；用色块和阴影区分区域而非边框线。**

| Token | 值 | 用途 |
|-------|----|------|
| `--radius-full` | `9999px` | **胶囊按钮**（主按钮）、标签、徽章、圆形头像 |
| `--radius-xl` | `24px` | 大卡片、模态框 |
| `--radius-lg` | `16px` | 中等卡片、面板 |
| `--radius-md` | `12px` | 小卡片、输入框、工具栏 |
| `--radius-sm` | `8px` | 小元素（badge/tag） |

## 4. 阴影系统

> 避免硬边框装饰。区域区分优先用**色块**（不同 surface 色），阴影只用于浮层/卡片层次，不用于描边。

| Token | 值 | 用途 |
|-------|----|------|
| `--shadow-sm` | `0 2px 6px rgba(0,0,0,0.04)` | 轻微层次（次级卡片） |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.06)` | 卡片默认阴影 |
| `--shadow-lg` | `0 12px 24px rgba(0,0,0,0.10)` | 浮层/弹窗 |
| `--shadow-accent` | `0 4px 12px rgba(214,40,57,0.20)` | 强调色阴影（主按钮 hover） |

> 注意：不使用 `0 0 0 1px` 描边阴影替代边框。区域边界优先用背景色差（`--color-surface` vs `--color-surface-2`）表达。

## 5. Bento 栅格

### 5.1 布局原则

- **留白**：大区块间至少 32px，留出呼吸空间
- **圆润卡片**：使用 `--shadow-md`，圆角 `--radius-lg` / `--radius-xl`
- **网格**：响应式，CSS Grid，支持 1-4 列
- **区域区分**：用色块（背景色差）区分区域，避免硬边框；卡片之间靠留白和阴影分隔

### 5.2 组件圆润风格约定

| 组件 | 圆角风格 |
|------|----------|
| 主按钮（Primary Button） | `border-radius: var(--radius-full)`（胶囊形） |
| 次按钮 / Icon Button | `border-radius: var(--radius-full)`（圆形或胶囊） |
| 输入框 | `border-radius: var(--radius-md)` |
| 卡片 | `border-radius: var(--radius-lg)` |
| 大面板/模态框 | `border-radius: var(--radius-xl)` |
| 标签/徽章 | `border-radius: var(--radius-full)` |
| Avatar | `border-radius: var(--radius-full)`（圆形） |

### 5.3 网格断点

| 断点 | 最小宽度 | 列数 | 卡片最大宽度 |
|------|----------|------|--------------|
| mobile | `< 640px` | 1 | 100% |
| tablet | `640px+` | 2 | 50% |
| desktop | `1024px+` | 3 | 33% |
| wide | `1280px+` | 4 | 25% |

### 5.4 移动端兼容策略

> 以桌面端为主形态，**兼容**移动端浏览。移动端不追求功能对等，保证核心功能可用、布局不破损即可。

**视口配置（必须）：**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**响应式实现约定：**

| 场景 | 策略 |
|------|------|
| 栅格列数 | CSS Grid `grid-template-columns` 按断点响应式切换（§5.3） |
| 隐藏/显示 | 按断点响应式：mobile 断点隐藏次要信息或收入 Drawer；大屏展示完整信息 |
| 侧边栏 | 移动端收起为 Drawer（从左侧滑入），大屏固定展示 |
| 导航 | 移动端底部 Tab Bar（5 个以内主入口）；大屏顶部横向导航 |
| 图片 | `loading="lazy"` + `srcset` 多档适配，禁止固定 `width`/`height` 撑开布局 |
| 代码高亮 | 横向滚动（`overflow-x: auto`），不换行，保持可读性 |

**移动端交互规范：**

| 规范 | 要求 |
|------|------|
| 触摸目标最小尺寸 | `44px × 44px`（Apple HIG / WCAG 2.5.8），胶囊按钮高度不低于此 |
| 点击热区 | 可点击区域不足时用 `::before`/`::after` 伪元素扩展 |
| 手势支持 | 仓库文件列表/代码浏览支持**双指缩放**（`touch-action: manipulation`） |
| 长按 | 仓库卡片/文件长按弹出上下文菜单（类似 GitHub Mobile） |
| 下拉刷新 | 列表页支持下拉刷新（指针事件 `@starting-style` + pull-to-refresh） |
| 避免 hover 陷阱 | 桌面端 hover 效果在移动端必须可触达（用 `:focus-visible` 替代或补充） |

**移动端性能规范：**

| 规范 | 要求 |
|------|------|
| 首屏渲染 | 关键 CSS 内联（`<style>`），首屏内容 3G 慢网 ≤ 3s |
| 图片 | WebP 优先，备选 JPEG/PNG；大图 `loading="lazy"` |
| 代码高亮 | 首屏代码块不超过 50 行；超长文件懒加载分片渲染 |
| 路由懒加载 | Vue `defineAsyncComponent` / `() => import()` 按路由懒加载 |

## 6. 状态设计

### 6.1 空态

- 图标：线性风格 SVG
- 文案：操作引导为主
- 背景：轻微灰色调

### 6.2 加载态

- 骨架屏（skeleton）优先，避免 spinner
- 骨架色：`--color-surface-2`
- 动画：左侧滑入 shimmer，1.5s 循环

### 6.3 错误态

- 错误提示用**色块**（`--color-danger-light` 浅红底 + `--color-danger` 文字），不用红色硬边框
- 友好文案 + 重试按钮（胶囊形）
- 避免技术术语暴露给用户

### 6.4 移动端状态栏兼容

- 状态栏：深色主题下使用 `viewport-fit=cover` + `env(safe-area-inset-*)` 内边距
- 底部安全区：Tab Bar 预留 `padding-bottom: env(safe-area-inset-bottom)`
- 横竖屏：竖屏适配为主，横屏保留响应式布局不破坏

## 7. 实现方式

所有令牌以 **SCSS 变量 + CSS 自定义属性**双重定义：

- `src/assets/styles/_tokens.scss` — SCSS 变量（编译期，供样式引用）
- `src/assets/styles/_root.scss` — 将令牌输出为 `:root` 下的 CSS 自定义属性

```scss
// _tokens.scss
$color-bg: #FAFAF8;
$color-accent: #D62839;
$space-4: 16px;
$radius-lg: 16px;
$radius-full: 9999px;
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);

// _root.scss
:root {
  --color-bg: #{$color-bg};
  --color-accent: #{$color-accent};
  --space-4: #{$space-4};
  --radius-lg: #{$radius-lg};
  --radius-full: #{$radius-full};
  --shadow-md: #{$shadow-md};
}
```

组件样式使用 `<style lang="scss" scoped>`，通过 SCSS 变量或 CSS 自定义属性取值，**禁止硬编码颜色/间距**。全局样式统一从 `src/assets/styles/main.scss` 引入。