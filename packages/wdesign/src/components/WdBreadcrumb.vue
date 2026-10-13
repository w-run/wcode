<script setup lang="ts">
defineOptions({ name: 'WdBreadcrumb' })

export interface WdBreadcrumbItem {
  label: string
  value?: string | number
}

const props = withDefaults(
  defineProps<{
    items?: WdBreadcrumbItem[]
    separator?: string
  }>(),
  { items: () => [], separator: '/' },
)

const emit = defineEmits<{ (e: 'select', value: string | number, index: number): void }>()

function pick(item: WdBreadcrumbItem, index: number) {
  if (index === props.items.length - 1) return
  emit('select', item.value ?? index, index)
}
</script>

<template>
  <nav class="wd-breadcrumb" aria-label="面包屑">
    <template v-for="(item, i) in props.items" :key="i">
      <span v-if="i > 0" class="wd-breadcrumb__sep">{{ separator }}</span>
      <button
        type="button"
        class="wd-breadcrumb__item"
        :class="{ 'wd-breadcrumb__item--current': i === props.items.length - 1 }"
        @click="pick(item, i)"
      >
        {{ item.label }}
      </button>
    </template>
  </nav>
</template>
