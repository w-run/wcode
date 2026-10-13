<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'WdProgress' })

const props = withDefaults(
  defineProps<{
    value?: number
    thin?: boolean
    onDark?: boolean
  }>(),
  { value: 0, thin: false, onDark: false },
)

const percent = computed(() => Math.max(0, Math.min(100, props.value)))
const classes = computed(() => [
  'wd-progress',
  props.thin ? 'wd-progress--thin' : '',
  props.onDark ? 'wd-progress--on-dark' : '',
])
</script>

<template>
  <div
    :class="classes"
    role="progressbar"
    :aria-valuenow="percent"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <span class="wd-progress__bar" :style="{ width: percent + '%' }"></span>
  </div>
</template>
