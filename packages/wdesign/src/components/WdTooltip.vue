<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'WdTooltip' })

withDefaults(
  defineProps<{
    content?: string
    placement?: 'top' | 'bottom'
  }>(),
  { content: '', placement: 'top' },
)

const open = ref(false)
</script>

<template>
  <span
    class="wd-tooltip"
    :class="[`wd-tooltip--${placement}`, { 'wd-tooltip--open': open }]"
    @mouseenter="open = true"
    @mouseleave="open = false"
    @focusin="open = true"
    @focusout="open = false"
  >
    <slot />
    <span class="wd-tooltip__bubble" role="tooltip">{{ content }}</span>
  </span>
</template>
