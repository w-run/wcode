#!/usr/bin/env bash
# ============================================================
# wcode 一键部署脚本
#
# 用法：./deploy/deploy.sh
# 前置：已安装 node/pnpm；nginx 已配置 /etc/nginx/conf.d/wcode.conf
# ============================================================
set -euo pipefail

APP_DIR="${WCODE_APP_DIR:-/var/www/wcode}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> 进入项目目录 $SCRIPT_DIR"
cd "$SCRIPT_DIR"

echo "==> 安装依赖"
pnpm install --frozen-lockfile

echo "==> 门禁检查（类型 + lint + 测试 + 构建）"
pnpm check

echo "==> 部署到 $APP_DIR"
mkdir -p "$APP_DIR"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete dist/ "$APP_DIR/"
else
  rm -rf "${APP_DIR:?}/"*
  cp -a dist/. "$APP_DIR/"
fi

echo "==> 校验 nginx 配置"
if command -v nginx >/dev/null 2>&1; then
  nginx -t
  echo "==> 重载 nginx"
  nginx -s reload
else
  echo "   （未检测到 nginx，跳过重载）"
fi

echo ""
echo "✅ 部署完成：$APP_DIR"
echo "   访问 http://<你的域名>/"
