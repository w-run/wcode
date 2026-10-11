<template>
  <div class="bento-grid">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.bento-grid {
  display: grid;
  gap: $space-4;
  grid-template-columns: 1fr;

  @media (min-width: $bp-tablet) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: $bp-desktop) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: $bp-wide) {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
