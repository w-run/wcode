<script setup lang="ts">
const version = '0.1.0'
</script>

<template>
  <main class="home">
    <h1 class="home__title">wcode</h1>
    <p class="home__desc">
      保留 Gitea 后端全部能力，用全新前端替换默认 Web UI。
    </p>
    <span class="home__badge">v{{ version }}</span>
  </main>
</template>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $space-4;
  padding: $space-8;

  &__title {
    font-size: 3rem;
    font-weight: 700;
    color: $color-text;
  }

  &__desc {
    color: $color-text-muted;
  }

  &__badge {
    padding: $space-1 $space-4;
    border-radius: $radius-full;
    background: $color-accent-light;
    color: $color-accent;
    font-size: 0.875rem;
  }
}
</style>
