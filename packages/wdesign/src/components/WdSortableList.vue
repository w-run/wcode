<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'WdSortableList' })

type Item = string | { label: string }

const props = withDefaults(
  defineProps<{
    modelValue?: Item[]
  }>(),
  { modelValue: () => [] },
)

const emit = defineEmits<{
  (e: 'update:modelValue', items: Item[]): void
  (e: 'change', items: Item[]): void
}>()

const dragIndex = ref(-1)
const overIndex = ref(-1)

function labelOf(it: Item) {
  return typeof it === 'string' ? it : it.label
}

function onDragStart(i: number) {
  dragIndex.value = i
}
function onDragOver(i: number) {
  if (dragIndex.value < 0 || i === dragIndex.value) return
  overIndex.value = i
}
function onDrop(i: number) {
  if (dragIndex.value < 0 || i === dragIndex.value || !props.modelValue.length) return
  const arr = [...props.modelValue]
  const [moved] = arr.splice(dragIndex.value, 1)
  arr.splice(i, 0, moved)
  emit('update:modelValue', arr)
  emit('change', arr)
  reset()
}
function reset() {
  dragIndex.value = -1
  overIndex.value = -1
}
</script>

<template>
  <div class="wd-sortable">
    <div
      v-for="(it, i) in modelValue"
      :key="i"
      class="wd-sortable__item"
      :class="{ 'wd-sortable__item--drag': dragIndex === i, 'wd-sortable__item--over': overIndex === i }"
      draggable="true"
      @dragstart="onDragStart(i)"
      @dragover.prevent="onDragOver(i)"
      @drop.prevent="onDrop(i)"
      @dragend="reset"
    >
      <span class="wd-sortable__handle">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"></circle><circle cx="15" cy="6" r="1.6"></circle><circle cx="9" cy="12" r="1.6"></circle><circle cx="15" cy="12" r="1.6"></circle><circle cx="9" cy="18" r="1.6"></circle><circle cx="15" cy="18" r="1.6"></circle></svg>
      </span>
      <span class="wd-sortable__label">{{ labelOf(it) }}</span>
    </div>
  </div>
</template>
