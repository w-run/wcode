<script setup lang="ts">
/**
 * 兼容适配层：渲染 wdesign 的 WdInput（胶囊/圆角输入框，可选 icon/suffix 插槽）。
 */
withDefaults(
  defineProps<{
    modelValue?: string
    type?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  { modelValue: '', type: 'text', placeholder: '', disabled: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <WdInput
    :model-value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template v-if="$slots.prefix" #icon>
      <slot name="prefix" />
    </template>
    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>
  </WdInput>
</template>
