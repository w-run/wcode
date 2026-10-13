<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

defineOptions({ name: 'WdSelect' })

type Option = string | { label: string; value: string | number }

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    options?: Option[]
    placeholder?: string
    disabled?: boolean
  }>(),
  { modelValue: '', options: () => [], placeholder: '请选择', disabled: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string | number): void }>()

const open = ref(false)
const root = ref<HTMLElement>()

const items = computed(() =>
  props.options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o)),
)
const current = computed(() => items.value.find((o) => o.value === props.modelValue))

function pick(value: string | number) {
  emit('update:modelValue', value)
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
  <div
    ref="root"
    class="wd-select"
    :class="{ 'wd-select--open': open, 'wd-select--disabled': disabled }"
  >
    <button type="button" class="wd-select__trigger" :class="{ 'wd-select__trigger--lg': size === 'lg', 'wd-select__trigger--sm': size === 'sm' }" :disabled="disabled" @click="open = !open">
      <span v-if="current" class="wd-select__value">{{ current.label }}</span>
      <span v-else class="wd-select__placeholder">{{ placeholder }}</span>
      <svg class="wd-chevron" :class="{ 'wd-chevron--open': open }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
    </button>

    <Transition name="wd-select-pop">
      <div v-if="open" class="wd-select__menu" role="listbox">
        <button
          v-for="o in items"
          :key="o.value"
          type="button"
          role="option"
          class="wd-select__option"
          :class="{ 'wd-select__option--active': o.value === modelValue }"
          :aria-selected="o.value === modelValue"
          @click="pick(o.value)"
        >
          <span>{{ o.label }}</span>
          <svg v-if="o.value === modelValue" class="wd-select__option-mark" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"></path></svg>
        </button>
      </div>
    </Transition>
  </div>
</template>
