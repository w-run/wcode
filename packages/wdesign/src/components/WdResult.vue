<script setup lang="ts">
defineOptions({ name: 'WdResult' })

withDefaults(
  defineProps<{
    status?: 'success' | 'warning' | 'error' | 'info'
    title?: string
    description?: string
  }>(),
  { status: 'info', title: '', description: '' },
)
</script>

<template>
  <div class="wd-result" :class="`wd-result--${status}`">
    <div class="wd-result__icon">
      <slot name="icon">
        <svg v-if="status === 'success'" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"></path></svg>
        <svg v-else-if="status === 'warning'" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5M12 16.5h.01M10.3 4.2 3.6 16.1A2 2 0 0 0 5.3 19h13.4a2 2 0 0 0 1.7-2.9L13.7 4.2a2 2 0 0 0-3.4 0z"></path></svg>
        <svg v-else-if="status === 'error'" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"></path></svg>
        <svg v-else width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 11v6M12 7.5h.01"></path><circle cx="12" cy="12" r="9"></circle></svg>
      </slot>
    </div>
    <div v-if="title" class="wd-result__title">{{ title }}</div>
    <div v-if="description || $slots.default" class="wd-result__desc"><slot>{{ description }}</slot></div>
    <div v-if="$slots.extra" class="wd-result__extra"><slot name="extra" /></div>
  </div>
</template>
