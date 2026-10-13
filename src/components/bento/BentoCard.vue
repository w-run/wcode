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
  <article class="bento-card" :class="{ 'bento-card--flush': !padding }">
    <header v-if="$slots.header" class="bento-card__header">
      <slot name="header" />
    </header>
    <div class="bento-card__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="bento-card__footer">
      <slot name="footer" />
    </footer>
  </article>
</template>

<style lang="scss" scoped>
.bento-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--wd-card);
  box-shadow: var(--wd-shadow);
  border-radius: var(--wd-radius-lg);

  &__header {
    padding: var(--wd-space-6) var(--wd-space-6) 0;
  }

  &__body {
    flex: 1;
    min-width: 0;
    padding: var(--wd-space-6);
  }

  &__footer {
    padding: 0 var(--wd-space-6) var(--wd-space-6);
  }

  &--flush &__body {
    padding: 0;
  }
}
</style>
