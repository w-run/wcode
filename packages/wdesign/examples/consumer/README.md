# WDesign 消费端示例

演示如何从**私有 npm 源**安装并使用 `@w-run/wdesign`。

## 快速开始

```sh
cd examples/consumer
npm install
npm run dev        # → http://localhost:5180
```

## 关键点

### 1. `.npmrc` 路由（必须）

```ini
registry=https://registry.npmmirror.com/
@w-run:registry=https://box.w-run.net/npm/
```

`@w-run:` 前缀让**只有自己的包**走私有源，`vue` 等依赖仍走公共源。
（这也是包名必须带 scope 的原因——私有源没有公共包，不加 scope 会导致 vue 解析失败。）

### 2. 引入方式

```js
import { createApp } from 'vue'
import WDesign from '@w-run/wdesign'       // 默认导出 = 全量注册插件
import '@w-run/wdesign/styles'              // 组件样式
import { toast } from '@w-run/wdesign'      // 具名导出：命令式服务

createApp(App).use(WDesign).mount('#app')
```

也可以按需引入单个组件：

```js
import { WdButton, WdInput } from '@w-run/wdesign'
```

### 3. 字体走 CDN（独立于包）

```html
<link rel="stylesheet" href="https://box.w-run.net/npm/fonts/wdesign-fonts.css">
```

中文思源黑体已转 WOFF2（16.9MB → 7.4MB），现代浏览器优先加载 woff2，自动回退 ttf。

## 可用组件

全量 41 个组件，注册后直接用 `wd-*` 标签，例如：

| 标签 | 组件 |
|---|---|
| `<wd-button>` | 按钮（primary / tint / dark / ghost） |
| `<wd-input>` | 输入框（size: lg/md/sm） |
| `<wd-select>` | 选择器 |
| `<wd-checkbox>` / `<wd-radio-group>` | 勾选 / 单选 |
| `<wd-alert>` / `<wd-tag>` / `<wd-badge>` | 反馈类 |
| `<wd-modal>` / `<wd-drawer>` / `<wd-toast>` | 浮层类 |
| `<wd-table>` / `<wd-pagination>` / `<wd-card>` | 数据类 |
| `<wd-carousel>` / `<wd-sortable-list>` / `<wd-explorer>` | 交互类 |

完整清单见仓库根 `README.md`。
