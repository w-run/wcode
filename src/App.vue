<script setup lang="ts"></script>

<template>
  <div class="app-shell">
    <router-view />
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  min-height: 100vh;
  background: $color-bg;
}
</style>
