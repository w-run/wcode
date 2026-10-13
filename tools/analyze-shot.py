#!/usr/bin/env python3
"""对截图做像素级分析：分块平均色 / 亮度列、行剖面，用来客观"看"视觉。"""
import sys
from PIL import Image

path = sys.argv[1]
im = Image.open(path).convert('RGB')
W, H = im.size
print(f'{path}  {W}x{H}')

# 按垂直方向每 40px 一条，报告该横条的平均色（看整体明暗节奏）
print('\n--- 垂直亮度剖面（每 60px）---')
step = 60
for y in range(0, H, step):
    box = im.crop((0, y, W, min(y + step, H)))
    px = list(box.getdata())
    n = len(px)
    r = sum(p[0] for p in px) / n
    g = sum(p[1] for p in px) / n
    b = sum(p[2] for p in px) / n
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    bar = '#' * int(lum / 4)
    print(f'y={y:5d}  #{int(r):02x}{int(g):02x}{int(b):02x}  L={lum:6.1f}  {bar}')

# 顶部 900px 的横向分块（看左右栏分布 / 留白）
print('\n--- 顶部区域横向分块平均色（每 100px 宽，取 y 0-900）---')
top = im.crop((0, 0, W, min(900, H)))
for x in range(0, W, 100):
    box = top.crop((x, 0, min(x + 100, W), top.size[1]))
    px = list(box.getdata())
    n = len(px)
    r = sum(p[0] for p in px) / n
    g = sum(p[1] for p in px) / n
    b = sum(p[2] for p in px) / n
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    print(f'x={x:5d}  #{int(r):02x}{int(g):02x}{int(b):02x}  L={lum:6.1f}')
