# 私有 npm 源（纯静态 · 已上线）

`@w-run/*` 组件发布在 **w-box 静态站**，零后端进程。

## 线上地址

| 资源 | URL |
|---|---|
| 私有 npm 源 | `https://box.w-run.net/npm/` |
| 组件包元数据 | `https://box.w-run.net/npm/@w-run/wdesign` |
| 图标包元数据 | `https://box.w-run.net/npm/@w-run/wdesign-icons` |
| 字体 CSS | `https://box.w-run.net/npm/fonts/wdesign-fonts.css` |

### 已发布的包

| 包 | 体积 | 说明 |
|---|---|---|
| `@w-run/wdesign` | 47 KB | 组件库（41 个 Vue3 组件 + SCSS） |
| `@w-run/wdesign-icons` | 1.0 MB | 图标库（595 SVG + WdIcon 组件） |
| `fonts/`（CDN） | 7.4 MB | 字体（woff2），不占包体 |

`@w-run/wdesign` 的 `dependencies` 已声明 `@w-run/wdesign-icons`，**安装组件库会自动带上图标包**。

## 消费端用法

```ini
# 项目根 .npmrc
registry=https://registry.npmmirror.com/
@w-run:registry=https://box.w-run.net/npm/
```
```sh
npm install @w-run/wdesign
```

字体（可选，独立于包）：
```html
<link rel="stylesheet" href="https://box.w-run.net/npm/fonts/wdesign-fonts.css">
```

## 服务器布局

```
w-box (10.0.0.99)  /workspace/static/     ← 由 server.js 提供 8020 端口
└── npm/
    ├── @w-run/
    │   ├── wdesign.json                  ← 包元数据（packument）
    │   └── wdesign/-/w-run-wdesign-1.0.0.tgz
    └── fonts/                            ← 字体包（CDN，独立）
        ├── wdesign-fonts.css
        ├── mona-sans-vf.woff2
        └── noto-sans-sc-vf.ttf
```
`box.w-run.net` → w-srv(openresty) → 反代 w-box:8020 (`box-webroot.service`)

## 服务端补丁（重要）

原 `server.js` 对"路径既是目录又有同名 `.json`"的情况会 404（npm 元数据请求正是这种）。
已打补丁 `tools/patch-box-server.py`：目录无 `index.html` 时回退同路径 + `.json`。
备份见 `/workspace/static/server.js.bak*`。

## 发布

```sh
sh tools/publish.sh      # 生成产物 + scp 到 w-box
```

## 字体拆分说明

组件包里**不再包含字体**（原 16.9MB 占包体 95%），改为 CDN 引用：

| | 拆分前 | 拆分后 |
|---|---|---|
| npm 包体 | 11.3 MB | **47 KB** |
| 安装后占用 | 11 MB | 460 KB |

`src/styles/_fonts.scss` 通过 `$wd-font-cdn` 引用线上字体，可覆盖：
```scss
$wd-font-cdn: 'https://your-cdn/fonts';
@import 'wdesign/src/styles/fonts';
```

## 能力边界

| 操作 | 支持 |
|---|---|
| `npm install` / `view` / `pack` | ✅ |
| 多版本并存 | ✅（发布时合并 packument） |
| `npm publish` | ❌ 静态不可写，改用 `tools/publish.sh` |
