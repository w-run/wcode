<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'WdTabs' })

type Tab = string | { label: string; value: string | number }

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    tabs?: Tab[]
    block?: boolean
  }>(),
  { modelValue: '', tabs: () => [], block: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string | number): void }>()

const items = computed(() =>
  props.tabs.map((t) => (typeof t === 'string' ? { label: t, value: t } : t)),
)
</script>

<template>
  <div class="wd-tabs" :class="{ 'wd-tabs--block': block }" role="tablist">
    <button
      v-for="t in items"
      :key="t.value"
      type="button"
      role="tab"
      class="wd-tabs__item"
      :class="{ 'wd-tabs__item--active': t.value === modelValue }"
      :aria-selected="t.value === modelValue"
      @click="emit('update:modelValue', t.value)"
    >
      {{ t.label }}
    </button>
  </div>
</template>
