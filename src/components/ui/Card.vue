<script setup lang="ts">
withDefaults(
  defineProps<{
    padding?: boolean
  }>(),
  {
    padding: true,
  },
)
</script>

<template>
  <div class="card" :class="{ 'card--flush': !padding }">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.card {
  background: $color-surface;
  box-shadow: $shadow-md;
  border-radius: $radius-lg;
  padding: $space-6;

  &--flush {
    padding: 0;
  }
}
</style>
