# WDesign — Soft Bento · Red

> 代码约定与结构规范见 [CONVENTIONS.md](./CONVENTIONS.md)

SCSS + Vue3 组件库。主题色 `#D62839`；**无边框 · 色块分区 · 全圆角 · 留白极简 · 无毛玻璃**。

## 设计四原则（硬规则）
1. **主题色 #D62839** —— 红只做点缀（界面红色面积 ≤ 10%）
2. **不用硬边框 / 分割线** —— 区域只用色块（底色分层）+ 留白区分
3. **圆润优先** —— 大圆角、胶囊、软几何
4. **留白、极简** —— 少色、少元素、一屏一个焦点

## 区域分层
| 层 | 色值 | 用途 |
|---|---|---|
| L0 页面底 | `#F7F8FA` | 画布 |
| L1 卡片 | `#FFFFFF` + 单层阴影 | 内容容器 |
| L2 浅色块 | `#FBEAEB`（更浅 `#FDF2F3`） | 高亮 / 选中 / 次级按钮 |
| L3 主题红 | `#D62839` | 主按钮 / 关键数据 / 进度 |
| L4 深色锚点 | `#1C1C1C` / `#2F2F2F` | 深色卡 · 两级（锚点 / 浮层） |

深色两级：`#1C1C1C`（锚点）/ `#2F2F2F`（浮层、深色按钮悬停）；浅色与深色主题的**主题色均为 #D62839**（只换底与文字，不换红）。

## 目录结构
```
wdesign/
├── tokens.json              # 设计 token（跨工具交换用）
├── src/
│   ├── index.ts             # 组件导出 + 全量注册插件
│   ├── components/          # 9 个 Vue3 组件（SFC + TS）
│   └── styles/
│       ├── _tokens.scss     # SCSS 变量 + CSS 变量（双轨）
│       ├── _mixins.scss     # 风格化 mixin
│       ├── _base.scss       # 可选的最小重置
│       ├── index.scss       # 样式总入口
│       └── components/      # 组件样式（纯类名，框架无关）
└── demo/                    # 离线演示页（Vue3 运行时已内置）
```

## 快速开始

### 1. 引入样式（必须，一次）
```ts
import 'wdesign/src/styles/index.scss'
```
> 宿主需装 sass：`npm i -D sass`。
> 样式全部是全局类（`wd-*`），纯 HTML 项目同样适用。

### 2. 使用组件
```ts
import { createApp } from 'vue'
import WdUI from 'wdesign/src'
import 'wdesign/src/styles/index.scss'
import App from './App.vue'

createApp(App).use(WdUI).mount('#app')
```
按需引入：`import { WdButton, WdCard, WdTag } from 'wdesign/src'`
（或直接把 `wdesign/` 拷进项目，如 `src/wdesign/`。）

### 3. 模板示例
```vue
<WdCard padding="lg">
  <WdTag dot>运行中</WdTag>
  <div class="wd-card__stat">128</div>
  <WdProgress :value="64" />
  <WdButton variant="primary" style="margin-top: 16px">查看详情</WdButton>
</WdCard>
```

## 组件一览
| 组件 | 说明 | 主要 Props |
|---|---|---|
| `WdButton` | 按钮 | `variant`: primary / tint / dark / ghost；`size`: lg / md / sm；`iconOnly`、`block`、`disabled` |
| `WdTag` | 标签 | `variant`: tint / gray / dark；`dot` |
| `WdCard` | 卡片 | `variant`: default / tint / dark；`padding`: sm / md / lg；`hoverable` |
| `WdInput` | 输入框 | `v-model`；`shape`: pill / rounded；`placeholder`、`disabled`；#icon / #suffix 插槽 |
| `WdSwitch` | 开关 | `v-model`（boolean）；`disabled` |
| `WdProgress` | 进度条 | `value`(0–100)；`thin`、`onDark` |
| `WdAvatar` | 头像 | `name`；`tone`: 0–3（0=自动配色）；`dark`、`size` |
| `WdAvatarGroup` | 头像堆叠 | `names: string[]`；`max` |
| `WdListItem` | 列表行 | `title`、`meta`、`clickable`；#icon / #extra 插槽 |
| `WdCheckbox` | 复选框 | `v-model`；`label`、`disabled` |
| `WdRadioGroup` | 单选组 | `v-model`；`options`、`disabled` |
| `WdSelect` | 下拉选择 | `v-model`；`options`、`placeholder` |
| `WdTabs` | 胶囊页签 | `v-model`；`tabs`、`block` |
| `WdAlert` | 提示条 | `variant`: info/success/warning/danger；`title`、`description`、`closable` |
| `WdSkeleton` | 骨架屏 | `variant`: text/rect/circle；`width`、`height`、`count` |
| `WdEmpty` | 空状态 | `title`、`description`；#icon / #action 插槽 |
| `WdModal` | 对话框 | `v-model`；`title`、`width`、`closeOnMask`；#footer 插槽 |
| `WdBadge` | 徽标 | `value`、`dot`、`max`、`tone` |
| `WdDatePicker` | 日期选择 | `v-model`（YYYY-MM-DD）；`placeholder` |
| `WdToast` | 轻提示（命令式 · 半透明浮层） | `toast('…')` · `toast.success / warning / danger`；`{ duration }` |
| `WdTooltip` | 气泡提示 | `content`、`placement`: top/bottom |
| `WdDropdown` | 下拉菜单 | `items`；`@select` |
| `WdPagination` | 分页 | `v-model`（页码）；`total`、`pageSize` |
| `WdSlider` | 滑杆 | `v-model`；`min`、`max`、`step`、`showValue` |
| `WdSteps` | 步骤条 | `steps`、`current` |
| `WdSpinner` | 加载圈 | `size`: sm/md/lg |
| `WdTable` | 无边框表格（斑马纹） | `columns`、`rows`、`striped`；`#cell-<key>` 插槽 |
| `WdBreadcrumb` | 面包屑 | `items`、`separator`；`@select` |
| `WdCollapse` | 折叠面板 | `v-model`（展开索引数组）；`items` |
| `WdDrawer` | 侧滑抽屉 | `v-model`；`title`、`side`；#footer 插槽 |
| `WdResult` | 结果页 | `status`: success/warning/error/info；`title`、`description`；#extra 插槽 |
| `WdRate` | 评分 | `v-model`；`count`、`disabled`（再次点击可清空） |
| `WdSegmented` | 分段控制（选中滑块平滑平移） | `v-model`；`options`、`block`、`tone`:light/dark |
| `WdUpload` | 文件上传 | `accept`、`multiple`、`hint`；拖拽 + 进度 |
| `WdNotification` | 通知横幅 | `v-model`；`title`、`description`、`variant` |
| `WdCarousel` | 轮播 | `items`、`height`、`autoplay`；箭头 + 圆点 |
| `WdSortableList` | 拖动排序 | `v-model`；HTML5 拖拽 |
| `WdOtp` | 验证码输入 | `v-model`；`length`；自动前进/回退/粘贴 |
| `WdImagePreview` | 图片预览（灯箱） | `src` / `list`；缩放 / 旋转 / 上一张下一张 |
| `WdFileList` | 文件列表（下拉展开，图标/箭头同列对齐） | `items` 树形；`@select` |
| `WdExplorer` | 模拟资源管理器（详情 / 图标双视图） | `folders`、`view`；路径 + 表格 + 网格 |
| `WdAiMessage` | AI 消息框（思考链与正文分离） | `content` 正文 / `reasoning` 思考（reasoning_content）；`streaming`、`reasoningStreaming`、`thinking`、`actions`；`@action`、`@stream-end`、`@reasoning-end` |

## 主题定制（运行期）
组件样式全部引用 CSS 变量，覆盖即可换肤：
```css
:root {
  --wd-red: #E5484D;      /* 换主题色 */
  --wd-tint-2: #FDECEC;   /* 浅色块 */
  --wd-radius-lg: 20px;   /* 收紧圆角 */
}
```

## 字体（VF 可变字体）
- 拉丁：**Mona Sans**（wght 200–900，单文件）
- 中文：**思源黑体 / Source Han Sans SC**（≈ Noto Sans SC VF，wght 200–900）
- 等宽：**Mona Sans Mono**

字体文件已随包放在 `fonts/`，自托管时引入一次即可：
```scss
@import 'wdesign/src/styles/fonts';
```
（路径与文件名可在 `_fonts.scss` 中调整；未加载字体时自动回落系统字体。）

## 图标库（wdesign-icons）
595 个 SVG（filled 164 / outlined 431），256×256、currentColor、kebab-case；与本包保持同级目录即可引用：
```vue
<WdIcon name="home" />
<WdIcon name="bell" filled :size="28" style="color: var(--wd-red)" />
```
（非构建环境用 `wdesign-icons/icons.data.js`，详见其 README。）

## 深色主题
给根元素加 `data-theme="dark"` 即整套切换（底色/文字翻转，`--wd-mask` 加深，**主题红 #D62839 不变**）：
```html
<html data-theme="dark">
```
深色值：底 `#121214` / 卡 `#1C1C1E` / 控件 `#2A2A2E` / 文字 `#E8E8EC`；400+ 处样式全部走 token，无需单独适配。

## Markdown 样式
`.wd-markdown` 包裹渲染后的 HTML 即可获得完整排版（标题 / 列表 / 引用 / 表格 / 代码 / 任务列表…）：
```html
<article class="wd-markdown"> … </article>
```
- 引用块嵌套为**静态分层**（浅红 → 白卡 → 加深）：修复了 hover 高亮会被子元素触发、连带点亮父级的问题
- 内置 **hljs 深色代码配色**（配套深色代码块），全部走 CSS 变量，支持深浅模式

## 设计规范
- 可视化规范：`../design-system.html`（浏览器打开）
- 文字规范：`../design-style-summary.md`
- Token：`tokens.json` · `src/styles/_tokens.scss`

## 演示
打开 `demo/index.html` 即可（Vue3 运行时已内置于 `demo/vue.global.prod.js`，离线可用；含输入 / 开关交互）。

## 路线图
- [ ] vite lib 构建（发布 npm）
- [ ] 暗色 / 换肤主题包
- [ ] Toast / Dialog / Tabs / Table

## License
MIT
