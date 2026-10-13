# ============================================================
# publish.sh — 一键发布所有 @w-run/* 到 w-box 私有静态 npm 源
#  目标：10.0.0.99:/workspace/static/npm/  →  https://box.w-run.net/npm/
#
#  一次发布三个东西：
#    @w-run/wdesign          组件库
#    @w-run/wdesign-icons    图标库（595 SVG + WdIcon）
#    fonts/                  字体（CDN，独立于包）
# ============================================================
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"          # wdesign 目录
STYLE="$(cd "$ROOT/.." && pwd)"          # style 目录（含 wdesign-icons）
OUT="$STYLE/npm-dist"
BOX=root@10.0.0.99
KEY="$HOME/.ssh/ssh_box"
SSH="ssh -o BatchMode=yes -o ConnectTimeout=15 -i $KEY $BOX"
BASE="${NPM_BASE_URL:-https://box.w-run.net/npm}"

echo "▸ 清理并重建产物目录 $OUT"
rm -rf "$OUT" && mkdir -p "$OUT"

# ── 1) 组件包 ──
echo ""
echo "▸ [1/3] 发布 @w-run/wdesign"
( cd "$ROOT" && NPM_BASE_URL="$BASE" node tools/publish-static.mjs "$OUT" )

# ── 2) 图标包 ──
if [ -f "$STYLE/wdesign-icons/package.json" ]; then
  echo ""
  echo "▸ [2/3] 发布 @w-run/wdesign-icons"
  ( cd "$STYLE/wdesign-icons" && NPM_BASE_URL="$BASE" node "$ROOT/tools/publish-static.mjs" "$OUT" )
fi

# ── 3) 字体（CDN）──
echo ""
echo "▸ [3/3] 打包字体"
mkdir -p "$OUT/fonts"
cp -f "$ROOT/fonts/mona-sans-vf.woff2"      "$OUT/fonts/" 2>/dev/null || true
cp -f "$ROOT/fonts/noto-sans-sc-vf.woff2"   "$OUT/fonts/" 2>/dev/null || true
cp -n "$ROOT/fonts/noto-sans-sc-vf.ttf"     "$OUT/fonts/" 2>/dev/null || true
cp -f "$ROOT/fonts/wdesign-fonts.css"       "$OUT/fonts/"

# ── 4) 上传 ──
echo ""
echo "▸ 上传到 w-box …"
$SSH 'mkdir -p /workspace/static/npm'
scp -q -o BatchMode=yes -o ConnectTimeout=15 -i "$KEY" -r "$OUT"/* "$BOX:/workspace/static/npm/"

echo ""
echo "✅ 发布完成 → $BASE"
echo ""
echo "消费端项目根 .npmrc:"
echo "  registry=https://registry.npmmirror.com/"
echo "  @w-run:registry=$BASE/"
echo ""
echo "安装:  npm install @w-run/wdesign        （会自动带上 @w-run/wdesign-icons）"
echo "字体:  <link rel=\"stylesheet\" href=\"$BASE/fonts/wdesign-fonts.css\">"
