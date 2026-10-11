# 设计系统规范

> 本文档定义 Bento Git 的设计系统规范。权威来源：本文档 + `src/assets/` 设计令牌文件。

## 1. 色彩体系

### 1.1 主题色板

| Token | 值 | 用途 |
|-------|----|------|
| `--color-bg` | `#FAFAF8` | 页面背景（米白） |
| `--color-surface` | `#FFFFFF` | 卡片/组件背景 |
| `--color-surface-2` | `#F5F5F0` | 次级表面（hover/selected） |
| `--color-border` | `#E8E8E3` | 边框 |
| `--color-text` | `#1A1A1A` | 主文本 |
| `--color-text-muted` | `#6B7280` | 次级文本 |
| `--color-accent` | `#3B82F6` | 强调色（蓝，用于交互） |
| `--color-accent-hover` | `#2563EB` | 强调色 hover |
| `--color-danger` | `#EF4444` | 危险/错误 |
| `--color-success` | `#22C55E` | 成功 |
| `--color-warning` | `#F59E0B` | 警告 |

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

## 3. 圆角系统

| Token | 值 | 用途 |
|-------|----|------|
| `--radius-sm` | `4px` | 小元素（badge/tag） |
| `--radius-md` | `8px` | 按钮/输入框 |
| `--radius-lg` | `12px` | 卡片 |
| `--radius-xl` | `16px` | 大卡片/模态框 |

## 4. 阴影系统

| Token | 值 | 用途 |
|-------|----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 轻微阴影 |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | 卡片默认阴影 |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | 浮层/弹窗 |
| `--shadow-bento` | `0 0 0 1px var(--color-border), 0 4px 12px rgba(0,0,0,0.05)` | Bento 卡片 |

## 5. Bento 栅格

### 5.1 布局原则

- **留白**：大区块间至少 32px，留出呼吸空间
- **卡片**：使用 `--shadow-bento`，圆角 `--radius-lg`
- **网格**：响应式，CSS Grid，支持 1-4 列
- **扁平**：避免渐变背景，用纯色 + 阴影区分层次

### 5.2 网格断点

| 断点 | 最小宽度 | 列数 | 卡片最大宽度 |
|------|----------|------|--------------|
| mobile | `< 640px` | 1 | 100% |
| tablet | `640px+` | 2 | 50% |
| desktop | `1024px+` | 3 | 33% |
| wide | `1280px+` | 4 | 25% |

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

- 红色边框/背景提示
- 友好文案 + 重试按钮
- 避免技术术语暴露给用户

## 7. 实现方式

所有令牌以 **SCSS 变量 + CSS 自定义属性**双重定义：

- `src/assets/styles/_tokens.scss` — SCSS 变量（编译期，供样式引用）
- `src/assets/styles/_root.scss` — 将令牌输出为 `:root` 下的 CSS 自定义属性

```scss
// _tokens.scss
$color-bg: #FAFAF8;
$color-accent: #3B82F6;
$space-4: 16px;
$radius-lg: 12px;
$shadow-bento: 0 0 0 1px #E8E8E3, 0 4px 12px rgba(0, 0, 0, 0.05);

// _root.scss
:root {
  --color-bg: #{$color-bg};
  --color-accent: #{$color-accent};
  --space-4: #{$space-4};
  --radius-lg: #{$radius-lg};
  --shadow-bento: #{$shadow-bento};
}
```

组件样式使用 `<style lang="scss" scoped>`，通过 SCSS 变量或 CSS 自定义属性取值，**禁止硬编码颜色/间距**。全局样式统一从 `src/assets/styles/main.scss` 引入。