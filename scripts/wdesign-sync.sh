#!/usr/bin/env bash
set -euo pipefail

# ---------- 同步 w-run/wdesign 的两个包到本仓 packages/ ----------
# 用法: pnpm wdesign:sync
# 说明: 通过 sparse checkout 只拉取所需文件；排除 17MB 的中文 ttf 字体
#       （中文走系统字体回退，仅保留 39KB 的 Mona Sans Latin 可��字体）。

UPSTREAM="${WDESIGN_UPSTREAM:-https://github.com/w-run/wdesign.git}"
BRANCH="${WDESIGN_BRANCH:-main}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="$ROOT/packages"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "=== 同步 wdesign（$UPSTREAM#$BRANCH）到 $TARGET ==="

git clone --depth 1 --filter=blob:none --sparse --branch "$BRANCH" "$UPSTREAM" "$WORK/wdesign" >/dev/null
cd "$WORK/wdesign"
git sparse-checkout set \
  packages/wdesign/src \
  packages/wdesign \
  packages/wdesign-icons/src \
  packages/wdesign-icons >/dev/null

SHA="$(git rev-parse HEAD)"
cd "$ROOT"
mkdir -p "$TARGET"

# 同步包体（cp 保留目录结构；排除大字体与 demo 资产）
rm -rf "$TARGET/wdesign" "$TARGET/wdesign-icons"
cp -a "$WORK/wdesign/packages/wdesign" "$TARGET/"
cp -a "$WORK/wdesign/packages/wdesign-icons" "$TARGET/"
rm -f "$TARGET/wdesign/fonts/noto-sans-sc-vf.ttf"
rm -rf "$TARGET/wdesign/demo"

# 清洗上游文件的损坏字符（U+FFFD → （），Dart Sass 会把 U+FFFD 视为非法字节
find "$TARGET" -type f -name '*.scss' -exec \
  sed -i 's/\xef\xbf\xbd/（/g' {} +

echo "$SHA" > "$TARGET/WDESIGN_VERSION"
echo "✓ 同步完成"
echo "  上游 commit: $SHA"
echo "  包目录: packages/wdesign, packages/wdesign-icons"
du -sh "$TARGET/wdesign" "$TARGET/wdesign-icons" 2>/dev/null || true
echo ""
echo "提示: 审阅 diff 后提交：git add packages/ && git commit -m 'chore: 同步 wdesign 依赖'"
