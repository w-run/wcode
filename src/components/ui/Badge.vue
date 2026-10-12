<script setup lang="ts">
/**
 * 兼容适配层：渲染 wdesign 语义色标签。
 * wdesign WdTag 仅有 tint/gray/dark，无法表达 success/danger 等状态色，
 * 故保留本地 pill 样式，色块走 wdesign 语义变量。
 */
type Variant = 'default' | 'accent' | 'success' | 'warning' | 'danger'

const props = withDefaults(
  defineProps<{
    variant?: Variant
  }>(),
  { variant: 'default' },
)
</script>

<template>
  <span class="badge" :class="`badge--${props.variant}`">
    <slot />
  </span>
</template>

<style lang="scss" scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--wd-space-1);
  padding: 2px 10px;
  border-radius: var(--wd-radius-pill);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.6;
}

.badge--default {
  background: var(--wd-field);
  color: var(--wd-ink-2);
}
.badge--accent {
  background: var(--wd-tint-2);
  color: var(--wd-red);
}
.badge--success {
  background: var(--wd-success-soft);
  color: var(--wd-success);
}
.badge--warning {
  background: var(--wd-warning-soft);
  color: var(--wd-warning);
}
.badge--danger {
  background: var(--wd-tint-2);
  color: var(--wd-red-hover);
}
</style>
