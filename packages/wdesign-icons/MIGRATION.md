# WDesign Icons — 规范化与迁移记录

> 源：`icons.zip`（原始文件保持不动）。以下变更全部只作用于 `wdesign-icons` 输出。

## 1. 重命名（12 项）

| 原名称 | 新名称 | 理由 |
|---|---|---|
| `icon-grid` | `layout-grid` | 去除冗余 icon- 前缀；与 grid（表格）消除歧义 |
| `icon-grid-alt` | `layout-dashboard` | 去除冗余 icon- 前缀；混合形状 = 仪表盘式布局 |
| `point-circle-1` | `point-circle-2` | 去除游离编号（-1 → -2；内容与 filled/point-circle 重复，建议去重时取舍） |
| `keypad-9` | `keypad-pin` | 数字后缀语义化（3×3 点阵 PIN，与 Material pin 对齐） |
| `idcard` | `id-card` | 连写 → kebab-case（与 id-badge 一致） |
| `shopbag` | `shopping-bag` | 标准命名 |
| `shopcart` | `shopping-cart` | 标准命名 |
| `icecream` | `ice-cream` | 标准命名 |
| `filter-no` | `filter-off` | 与 -off 家族一致（bell-off / wifi-off …） |
| `user-add` | `user-plus` | 与 -plus 家族一致（file-plus / folder-plus …） |
| `heart-add` | `heart-plus` | 与 -plus 家族一致 |
| `proceed` | `fast-forward` | 标准媒体命名，与 rewind / skip-next 成对 |

## 2. 目录

| 原目录 | 新目录 | 理由 |
|---|---|---|
| `outline/` | `outlined/` | 与 `filled/` 语法成对（Material 惯例） |

## 3. 内容规范化

- 画布统一：**256×256**（32 个 257×256 文件修正 viewBox/width）
- 颜色统一：**currentColor**（595 个文件由 fill/stroke="black" 替换，可由 CSS `color` 驱动）
- 清理 Figma 冗余：移除全画布 clipPath（2 个文件：lipstick / shirt）
- 总计 595 个文件（filled 164 + outlined 431）

## 4. 已知重复（内容完全相同，建议后续取舍）

- `filled/point-circle.svg` ｜ `outline/point-circle-1.svg`
- `outline/point-circle-alt.svg` ｜ `outline/point-circle.svg`
