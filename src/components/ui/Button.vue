<script setup lang="ts">
import { computed } from 'vue'

/**
 * 兼容适配层：对外保留原 Button API，内部渲染 wdesign 的 WdButton。
 * variant: danger 映射为 wd 的 primary（wdesign 主色即红）；secondary → tint。
 */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    block: false,
  },
)

const emit = defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

const wdVariant = computed<'primary' | 'tint' | 'ghost'>(() => {
  if (props.variant === 'secondary') return 'tint'
  if (props.variant === 'ghost') return 'ghost'
  return 'primary'
})
</script>

<template>
  <WdButton
    :variant="wdVariant"
    :size="size"
    :disabled="disabled || loading"
    :block="block"
    @click="emit('click', $event)"
  >
    <WdSpinner v-if="loading" size="sm" class="btn-adapter__spinner" />
    <slot />
  </WdButton>
</template>

<style lang="scss" scoped>
.btn-adapter__spinner {
  margin-right: var(--wd-space-2);
}
</style>
