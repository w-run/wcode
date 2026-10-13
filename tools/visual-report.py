#!/usr/bin/env python3
"""把截图渲染成粗粒度色块图 + 检测内容区/留白边界，用于客观判断视觉平衡。"""
import sys
from PIL import Image

path = sys.argv[1]
COLS = 44
im = Image.open(path).convert('RGB')
W, H = im.size
scale = H / W
ROWS = max(1, int(COLS * scale / 2))  # 字符高宽比 ~2:1

small = im.resize((COLS, ROWS), Image.BOX)

def hexof(p):
    return f'{p[0]:02x}{p[1]:02x}{p[2]:02x}'

# 背景色取四角
corners = [small.getpixel((0, 0)), small.getpixel((COLS - 1, 0)),
           small.getpixel((0, ROWS - 1)), small.getpixel((COLS - 1, ROWS - 1))]
bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
print(f'{path} {W}x{H}  背景=#{hexof(bg)}')

print('\n=== 色块图（每格 = 一块区域，? 表示与背景差异大）===')
print('    ' + ''.join(str(i % 10) for i in range(COLS)))
for y in range(ROWS):
    line = ''
    for x in range(COLS):
        p = small.getpixel((x, y))
        d = max(abs(p[i] - bg[i]) for i in range(3))
        lum = 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]
        bl = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2]
        if lum < 100:
            line += '#'          # 深色（代码块等）
        elif lum < bl - 60:
            line += '@'          # 明显的暗色块
        elif lum < bl - 12:
            line += '+'          # 轻微色块
        elif d < 6:
            line += '.'          # 背景/留白
        else:
            line += '-'          # 淡色块
    print(f'{y:3d} {line}')

# 逐行找内容边界（相对背景）
print('\n=== 内容行区间 ===')
rowinfo = []
for y in range(ROWS):
    s = 0
    for x in range(COLS):
        p = small.getpixel((x, y))
        if max(abs(p[i] - bg[i]) for i in range(3)) > 10:
            s += 1
    rowinfo.append(s)
inblk = False
for y, s in enumerate(rowinfo):
    if s > 1 and not inblk:
        start = y
        inblk = True
    elif s <= 1 and inblk:
        print(f'  行 {start:3d}-{y:3d}  (高度 {y-start:3d} 格)  峰值填充 {max(rowinfo[start:y])}/{COLS}')
        inblk = False
if inblk:
    print(f'  行 {start:3d}-{ROWS:3d}  (高度 {ROWS-start:3d} 格)')
