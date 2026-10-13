<script setup lang="ts">
import { computed } from 'vue'
import WdAvatar from './WdAvatar.vue'

defineOptions({ name: 'WdAvatarGroup' })

const props = withDefaults(
  defineProps<{
    names?: string[]
    max?: number
  }>(),
  { names: () => [], max: 3 },
)

const shown = computed(() => props.names.slice(0, props.max))
const rest = computed(() => Math.max(0, props.names.length - props.max))
</script>

<template>
  <span class="wd-avatars">
    <WdAvatar v-for="(name, index) in shown" :key="index" :name="name" />
    <WdAvatar v-if="rest" :name="`+${rest}`" dark />
  </span>
</template>
