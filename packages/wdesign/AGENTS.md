# AGENTS.md — 关于 WDesign 的操作指南

本文档面向 WDesign 项目中的 AI 助手代理（Agent）设计，用于指导代理如何安全、高效地协作开发、维护和推广 WDesign 组件库。

所有操作均以终端为基础，使用 shell 命令和 Python 脚本完成；坚持自动化、可重复和一致性，所有手工步骤均需使用提供的脚本或遵循定义的约定。

## 项目结构

```
wdesign/
├── packages/wdesign/               # 组件核心发布包（仅供发布使用）
│   ├── src/                      # 组件库源码
│   │   ├── index.ts              # 组件导出 + 注册插件
│   │   ├── components/           # Vue3 SFC 组件 (16 个)
│   │   └── styles/               # 组件样式
│   │       ├── _tokens.scss      # SCSS 变量 + CSS 变量
│   │       ├── _mixins.scss      # 风格化 mixin
│   │       ├── _base.scss        # 可选最小重置
│   │       └── components/       # 组件样式（纯类名）
│   ├── dist/                      # 发布包（无需手工维护）
│   ├── README.md                 # README 只维护一份（在 repo 根），发布时同步
│   └── package.json
├── demo/                         # 组件实时演示页（离线运行，iOS 下运行）
│   ├── index.html                 # 包含 Vue 运行时的 HTML
│   ├── demo.js                    # Vue 应用，包含所有数据和交互
│   ├── demo-extra.js              # 离线组件初始化与 DOM 事件（勿手工修改）
│   ├── demo.scss                  # 演示页样式，基于组件样式自动生成
│   ├── demo.css?v=XX              # 发布成果，勿手工编辑
│   └── assets/                    # 图片素材等
├── packages/wdesign-icons/        # 595 图标资源
├── tokens.json                   # 设计令牌定义（跨工具交换用）
├── README.md                      # 公开文档，维护于 repo 根
├── CONVENTIONS.md                 # 本地代码约定，持续维护
├── AGENTS.md                     # 本手册，仅供 Agent 参考
└── sync_wdesign.sh               # 一次命令，同步演示页、组件、图标、文档至 repo
```

> 提示：如需快速了解当前工作区状态 → `./run -h`
> 提示：如需预览 WDesign 库最新版本的文档 → `minis://workspace/style/wdesign/demo/index.html`

## 贡献指南

### 1. 添加新组件
组件新增按如下流程进行，可直接复用现有代码模板。

#### 1.1. 创建组件目录与文件
```bash
mkdir -p wdesign/packages/wdesign/src/components
```

在 `packages/wdesign/src/components/` 下创建文件 `components/<Name>.vue` 和 `<Name>.scss`，参考现有组件（如 `WdButton`）的结构。

#### 1.2. 编写组件 SFC 与 SCSS
关键点：
- 所有组件均使用 `<script setup lang="ts">`，遵循严格的 TS 风格。
- **永远不要手工修改** 脚本部分，所有的模板、样式必须由引述引擎产生。
- 组件示例：

```vue
<!-- WdButton.vue -->
<template>
  <button class="wd-button" :class="buttonClasses" :disabled="disabled" @click="onClick">
    <slot v-if="!$slots.default" />
    <template v-else>
      <wd-icon v-if="iconLeft" name="home" /> 
      <span>{{ label }}</span>
      <wd-icon v-if="iconRight" name="search" />
    </template>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { WdIcon } from './WdIcon.vue'

interface Props { ... }
const props = withDefaults(defineProps<Props>(), { ... })
const emit = defineEmits(['click'])
// ... 状态、计算、方法
</script>

<style lang="scss">
.wd-button {
  // 组件样式单源，完全使用 tokens
  display: inline-flex;
  align-items: center;
  gap: var(--wd-space-2);
  // ... 详细样式略
}
</style>
```

#### 1.3. SCSS 原子件
每个组件对应一个 SCSS 原子件（类似 `_button.scss`）。原子件的命名规则如下，且必须位于 `packages/wdesign/src/styles/components/` 中且不得重名。

- 原子件采用以下模式命名：`<lowercase>.(scss|vue)`。对于同名组别（如列表、选项卡）的组件，统一命名为 `<lowercase>.scss`，并使用嵌套组件的 SCSS 组织。
- 每个原子件均须以 `/**` 开头，简要描述其角色与使用方法。

#### 1.4. 注册与导出
每个组件对应的 Vue 根注册以 `packages/wdesign/src/index.ts` 中进行；无须手工修改此文件，`demo.js` 启动时动态读取 `packages/wdesign/packages/wdesign/src/components/` 下所有 `<Name>.vue` 文件并注册。

**入口文件**：`packages/wdesign/src/index.ts`

```ts
// 以 export * as WDButton from './components/WdButton.vue' 形式导出组件
export * from './components/WdButton.vue'
export * from './components/WdTag.vue'
... 其他

// 构建组件名数组并注册到全局
const componentNames = [
  'WdButton',
  'WdTag',
  'WdCheckbox',
  ...
]

app.component('WdButton', WDButton)
app.component('WdTag', WdTag)
// ... 其他
```

#### 1.5. 更新演示页（demo-extra.js）
`demo-extra.js` 包含演示页所有数据的初始化，如需增加新组件的演示，请找到 `const components = {...}` 块，添加对应入口，并在 `demo-extra.js` 中保持 *单一定义*（不要重复定义同一组件）。组件使用示例：

```js
components.WdCheckbox = {
  modelValue: true,
  label: '同意条款',
  disabled: false,
}
```

> 提示：Demo 页面使用 **离线运行**，无需网络；请勿在 `demo-extra.js` 中手动编辑组件配置；所有离线配置均应通过脚本生成。

#### 1.6. SCSS 编译与 CSS 缓存
- SCSS 文件将通过 shell 脚本 `sassc src/styles/index.scss dist/lib.css` 编译。此命令自动生成的 `dist/lib.css` 文件 *无需手工提交*，在仓库中仅保留 `packages/wdesign/src/styles/index.scss` 源文件。
- **切勿** 直接编辑 `demo.css` — 所有演示页样式均由 `demo.scss` 源文件自动生成。编辑 `demo.scss` 后，需重新运行 `sassc demo.scss demo.css` 以更新编译结果。

#### 1.7. README 组件表
修改 `README.md` 的组件表：找到 `### 组件表` 区域，插入新组件的行，格式如下：

```md
| WdXxx | 组件名 | Xxx 组件（Xxx） |
|-------|---------|--------------------------|
| WdButton | 按钮 | 按钮 | ... |
```

#### 1.8. 构建与发布
执行以下命令，同步所有变化至仓库并创建新的演示版本：

```bash
./sync_wdesign.sh "feat: 新组件 WdXxx"
```

此脚本完成如下操作：
- 复制 `packages/wdesign/src` 至 `packages/wdesign`（发布包根）
- 拷贝 `demo` 文件（含 `demo.css`？使用已缓存的 `demo.css`，不拷贝）
- 推送至远程仓库

> 脚本 `sync_wdesign.sh` 位于 wdesign repo 根，若未找到，则请新建。

#### 1.9. 审计与一致性检查
执行 `./run audit` 命令，验证以下方面：
- 是否存在重复的 SCSS 类名（使用 `wd-class` 命名规则，如 `wd-button` vs `wd-button__elem`）
- 是否存在未作为 CSS 变量发射的 token（如 `$wd-primary` 仅用于 SCSS，而未生成 `--wd-primary`）
- 是否存在未映射的 token 节点（如因拼写错误或缺失映射导致）
- 组件注册是否完整（`/packages/wdesign/src/components/` 中所有组件均已注册）
- 组件 SCSS 原子件是否完备（每个组件需对应一个 `<name>.scss` 文件）
- `demo.css` 是否与 `demo.scss` 同步
- 确保代码风格符合 `CONVENTIONS.md` 的约定。

> 如发现任何问题，请参照 `tools/audit.py` 的检查逻辑进行修复。

### 2. 运行 demo
如果要运行组件库的离线演示，可通过以下两种方法之一：

#### 2.1. 打开 Minis 浏览器访问 URL
```
minis://workspace/style/wdesign/demo/index.html
```

#### 2.2. 本地运行，需安装 `node` 及其 `npm` 工具。
```bash
# 安装依赖
cd wdesign/demo
npm install
npm run dev
```

> 提示：如需新建分支，在本脚本工作前，**必须先切换到新的分支**，以确保所有的变更均归于该分支。

### 3. 开发环境中的缓存管理

#### 3.1. CSS/JS 缓存机制
- SCSS -> CSS：通过文件路径下方的 `?v=` 查询参数实现缓存清除。
- 演示页脚本 (`demo.js` / `demo-extra.js`)：同样使用 `?v=` 参数，同时需要编译 `demo.scss`，例如 `demo.css?v=20261042`，当 `demo.scss` 修改时需要更新。

#### 3.2. 其他缓存策略
- **minis 浏览器** 缓存：文件请求头中带有 `Cache-Control: max-age=3600`，在修改后需强行清除浏览器缓存（如前往 `minis://workspace/style/wdesign/demo/index.html?t=${Date.now()}`）。
- 若需清除编译后的 CSS 文件缓存，直接在 URL 中拼接 `?v=${timestamp}`；例如 `demo.css?v=20261042`。

> 提示：不要直接修改 `demo.css`，如需重新编译，仅需修改 `demo.scss` 即可。

### 4. 如何提交变更与版本管理

#### 4.1. 提交规范
- 所有变更均必须经过审计 (`./run audit`) 后方可提交。
- 提交信息需遵循 Conventional Commits 风格（前缀可选用 `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`)；请尽量简洁、易懂，并随文附上相关 issue 编号。
- 提交后自动触发 CI 检查，如有违反约定的情况，CI 将自动停止构建过程，提示开发者需修改以继续提交。

#### 4.2. 分支策略
- 建立新分支进行开发，命名规则参考 `feature/`、`bugfix/`、`docs/` 等。
- 所有开发者须提交 pull request (PR) 至 `main` 分支；PR 将由自动化工具进行审核。
- 开发者需按照审核意见进行修改后，PR 会通过审核并自动合并到 `main` 分支。

### 5. 团队协作与自动化流程

#### 5.1. 自动化流程
通过 `scripts/` 目录下的脚本完成以下自动化工作：
- `scripts/audit.py`：检查代码质量
- `scripts/sync_wdesign.sh`：提交变更到远端
- `scripts/build_demo.sh`：构建演示页（可选）
- `scripts/prettier.sh`：格式化代码（可选）
- `scripts/eslint.sh`：检查代码风格（可选）

#### 5.2. CI/CD
CI 流程通过以下脚本完成：
```bash
# 在 CI 环境中，运行 lint、审计和构建
scripts/lint.sh
scripts/audit.sh
scripts/build.sh
scripts/test.sh
scripts/docs.sh
```

### 6. 常见问题与故障排除

#### 6.1. 组件注册不成功
- 检查 `packages/wdesign/src/components/` 是否存在对应 `.vue` 文件
- 检查 `packages/wdesign/src/index.ts` 是否已包含 `app.component('WdXxx', WdXxx)`
- 检查 `demo-extra.js` 是否已添加对应组件数据

#### 6.2. SCSS 编译失败
- 检查 `src/styles/components/<name>.scss` 是否存在语法错误
- 确保 `src/styles/_tokens.scss` 中定义了所有 SCSS 变量

#### 6.3. 演示页样式不更新
- 删除 `demo.css?v=...` 文件
- 重新运行 `sassc demo.scss demo.css`

#### 6.4. token 缺失或未映射
- 检查 `src/styles/_tokens.scss` 是否已包含 `$wd-xxx` 变量
- 检查 `src/styles/_mixins.scss` 是否已映射该变量
- 运行审计命令查看详细信息

### 7. 维护

#### 7.1. 定期审核
- 每月执行一次 `./run audit`，确保代码质量
- 更新 `README.md` 中的组件表

#### 7.2. 版本管理
- 遵循语义化版本控制（SemVer）
- 更新 `package.json` 的版本号
- 确保 CHANGELOG 或类似文件记录变更

#### 7.3. 文档维护
- 保持 `README.md` 的更新，包括安装指南、快速入门和示例
- 确保 `CONVENTIONS.md` 文件反映最新的代码约定

### 8. 安全与隐私

#### 8.1. 敏感信息保护
- 确保不会提交包含 API 密钥、密码或其他敏感信息的日志文件
- 使用环境变量存储敏感数据

#### 8.2. 代码安全
- 定期检查并修复已知的安全漏洞
- 使用静态代码分析工具检查潜在的安全风险

### 9. 持续集成与持续部署 (CI/CD)

#### 9.1. CI
- 自动运行测试、构建和部署
- 对代码质量进行检查

#### 9.2. CD
- 通过自动化的脚本将构建好的包部署到生产环境
- 确保新的组件或更新能够迅速上线

> 上述内容涵盖了有关 WDesign 的所有开发、维护和协作指南。

祝您工作顺利！