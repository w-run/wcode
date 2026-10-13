<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineOptions({ name: 'WdDropdown' })

export interface WdDropdownItem {
  label: string
  value: string | number
  danger?: boolean
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    items?: WdDropdownItem[]
  }>(),
  { items: () => [] },
)

const emit = defineEmits<{ (e: 'select', value: string | number): void }>()

const open = ref(false)
const root = ref<HTMLElement>()

function pick(item: WdDropdownItem) {
  if (item.disabled) return
  emit('select', item.value)
  open.value = false
}

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <span ref="root" class="wd-dropdown">
    <span class="wd-dropdown__trigger" role="button" tabindex="0" :aria-haspopup="true" :aria-expanded="open" @keydown.enter.prevent="open = !open" @keydown.space.prevent="open = !open" @click="open = !open"><slot /></span>
    <Transition name="wd-dropdown-pop">
      <div v-if="open" class="wd-dropdown__menu" role="menu">
        <button
          v-for="it in props.items"
          :key="it.value"
          type="button"
          role="menuitem"
          class="wd-dropdown__item"
          :class="{ 'wd-dropdown__item--danger': it.danger, 'wd-dropdown__item--disabled': it.disabled }"
          @click="pick(it)"
        >
          {{ it.label }}
        </button>
      </div>
    </Transition>
  </span>
</template>
