<script setup lang="ts">
defineOptions({ name: 'WdEmpty' })

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  { title: '暂无数据', description: '' },
)
</script>

<template>
  <div class="wd-empty">
    <div class="wd-empty__icon">
      <slot name="icon">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-6l-2 3h-4l-2-3H2"></path>
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
        </svg>
      </slot>
    </div>
    <div v-if="title" class="wd-empty__title">{{ title }}</div>
    <div v-if="description || $slots.description" class="wd-empty__desc">
      <slot name="description">{{ description }}</slot>
    </div>
    <div v-if="$slots.action" class="wd-empty__action"><slot name="action" /></div>
  </div>
</template>
