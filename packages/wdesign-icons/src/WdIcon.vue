<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

defineOptions({ name: 'WdIcon' })

const props = withDefaults(
  defineProps<{
    /** 图标名（kebab-case），如 home / layout-grid / fast-forward */
    name: string
    /** 风格：outlined（线性，默认）| filled（实心） */
    variant?: 'outlined' | 'filled'
    /** 尺寸（数字 = px） */
    size?: number | string
    /** 简写：填充风格（等价 style="filled"） */
    filled?: boolean
  }>(),
  { variant: 'outlined', size: 24, filled: false },
)

/** Vite 构建期收集全部图标（按需懒加载） */
const loaders: Record<string, () => Promise<string>> = import.meta.glob('../icons/*/*.svg', {
  query: '?raw',
  import: 'default',
})

const svg = ref('')
const resolvedStyle = computed(() => (props.filled ? 'filled' : props.variant))
const sizePx = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))

watchEffect(async () => {
  // 请求的风格不存在时自动回落另一风格（如 filled 未绘制 → 用 outlined）
  const order = resolvedStyle.value === 'filled' ? ['filled', 'outlined'] : ['outlined', 'filled']
  // 优先 Vite glob；非构建环境回退到 window.WD_ICONS（icons.data.js）
  const inline = (globalThis as { WD_ICONS?: Record<string, string> }).WD_ICONS
  for (const st of order) {
    const key = `../icons/${st}/${props.name}.svg`
    if (loaders[key]) {
      svg.value = await loaders[key]()
      return
    }
    if (inline?.[`${st}/${props.name}`]) {
      svg.value = inline[`${st}/${props.name}`]
      return
    }
  }
  svg.value = ''
})
</script>

<template>
  <span class="wd-icon" :style="{ width: sizePx, height: sizePx }" v-html="svg"></span>
</template>

<style>
.wd-icon {
  display: inline-flex;
  flex: none;
  vertical-align: middle;
}
.wd-icon svg {
  width: 100%;
  height: 100%;
  display: block;
  color: inherit;
}
</style>
