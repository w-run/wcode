# WDesign 代码约定（Conventions）

统一代码风格与结构，新代码按此执行。

## 样式（SCSS）
- **颜色全部走 token**：组件样式只允许 `var(--wd-*)`。仅两类刻意保留的硬编码：
  1. `#fff` —— 品牌 / 深色表面上的文字与图标（勾、白字、白点）
  2. markdown 的 hljs 语法色板（VS Code Dark 固定配色，已在 `_markdown.scss` 标注）
- **阴影统一用阶梯 token**：`--wd-shadow-sm / default / hover / pop / lg / knob`
- **BEM 命名**：`.wd-block__elem--mod`；原子基础件用 `.wd-dot` `.wd-icon-btn` `.wd-chevron`（+ 修饰符）
- 属性顺序：定位 / 布局 → 盒模型 → 视觉（背景、圆角、阴影）→ 文字 → 动效
- 2 空格缩进；文件以换行结尾；无行尾空格、无 TAB

## Vue 组件（SFC）
- `defineOptions({ name: 'WdXxx' })` 置于脚本开头
- props 用 TS 接口 + `withDefaults`；事件用 `defineEmits` 类型化声明
- 状态顺序：`ref/computed` → 方法；`style` 禁止作为 prop 名（保留给 HTML style 属性）
- 交互型组件显式声明事件并自根元素冒泡（如 WdButton 的 `click`），不依赖 attrs 回退
- 模板类名与 SCSS 一一对应；能用原子件（dot / icon-btn / chevron）就不重复写样式

## 演示镜像（demo/demo-extra.js）
- 与 SFC 行为一一对应；块顺序：props → emits → data → computed → watch → 生命周期 → methods → template
- 新组件追加后用 `window.WD_EXTRA_COMPONENTS.concat([...])` 注册
- **缓存纪律**：改了哪个文件就升哪个文件的 `?v=`，且每次必须用全新值（复用旧值会命中 WebView 缓存）

## token 扩展流程
新颜色 / 阴影 / 圆角一律进 `_tokens.scss`（+ `_dark.scss` 深色覆盖 + `tokens.json` 同步）→ 组件改引用 `var(--wd-*)`。
