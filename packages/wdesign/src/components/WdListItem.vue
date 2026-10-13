<script setup lang="ts">
defineOptions({ name: 'WdListItem' })

withDefaults(
  defineProps<{
    title?: string
    meta?: string
    clickable?: boolean
  }>(),
  { title: '', meta: '', clickable: true },
)

const emit = defineEmits<{ (e: 'click', event: MouseEvent): void }>()
</script>

<template>
  <div
    class="wd-list-item"
    :class="{ 'wd-list-item--clickable': clickable }"
    @click="clickable && emit('click', $event)"
  >
    <span v-if="$slots.icon" class="wd-list-item__icon"><slot name="icon" /></span>
    <span class="wd-list-item__title">{{ title }}</span>
    <span v-if="meta" class="wd-list-item__meta">{{ meta }}</span>
    <slot name="extra" />
  </div>
</template>
