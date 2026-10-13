<script setup lang="ts">
import { computed, ref, watch } from 'vue'

defineOptions({ name: 'WdImagePreview' })

const props = withDefaults(
  defineProps<{
    src?: string
    list?: string[]
    alt?: string
    index?: number
  }>(),
  { src: '', list: () => [], alt: '', index: 0 },
)

const open = ref(false)
const cur = ref(props.index)
const scale = ref(1)
const rotate = ref(0)

const images = computed(() => (props.list.length ? props.list : props.src ? [props.src] : []))

watch(
  () => props.index,
  (v) => {
    cur.value = v
  },
)

function view(i: number) {
  const n = images.value.length
  if (!n) return
  cur.value = ((i % n) + n) % n
  scale.value = 1
  rotate.value = 0
}
function zoom(d: number) {
  scale.value = Math.min(4, Math.max(0.4, Math.round((scale.value + d) * 100) / 100))
}
function resetView() {
  scale.value = 1
  rotate.value = 0
}
function openPreview() {
  if (!images.value.length) return
  resetView()
  open.value = true
}
</script>

<template>
  <span class="wd-image-preview" @click="openPreview">
    <slot>
      <img v-if="src || list.length" :src="src || images[0]" :alt="alt" class="wd-image-preview__thumb" />
    </slot>
  </span>

  <Teleport to="body">
    <Transition name="wd-preview-fade">
      <div v-if="open" class="wd-preview">
        <div class="wd-preview__mask" @click="open = false"></div>
        <div
          class="wd-preview__stage"
          @wheel.prevent="zoom(($event as WheelEvent).deltaY > 0 ? -0.15 : 0.15)"
        >
          <img
            class="wd-preview__img"
            :src="images[cur]"
            :alt="alt"
            :style="{ transform: `scale(${scale}) rotate(${rotate}deg)` }"
          />
        </div>
        <div v-if="images.length > 1" class="wd-preview__count">{{ cur + 1 }} / {{ images.length }}</div>
        <div class="wd-preview__toolbar">
          <button v-if="images.length > 1" type="button" class="wd-icon-btn wd-icon-btn--ghost wd-preview__btn" aria-label="上一张" @click="view(cur - 1)">‹</button>
          <button type="button" class="wd-icon-btn wd-icon-btn--ghost wd-preview__btn" aria-label="旋转" @click="rotate = (rotate + 90) % 360">↻</button>
          <button type="button" class="wd-icon-btn wd-icon-btn--ghost wd-preview__btn" aria-label="缩小" @click="zoom(-0.25)">−</button>
          <button type="button" class="wd-icon-btn wd-icon-btn--ghost wd-preview__btn" aria-label="放大" @click="zoom(0.25)">＋</button>
          <button type="button" class="wd-icon-btn wd-icon-btn--ghost wd-preview__btn" aria-label="还原" @click="resetView">1:1</button>
          <button v-if="images.length > 1" type="button" class="wd-icon-btn wd-icon-btn--ghost wd-preview__btn" aria-label="下一张" @click="view(cur + 1)">›</button>
          <button type="button" class="wd-icon-btn wd-icon-btn--ghost wd-preview__btn" aria-label="关闭" @click="open = false">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"></path></svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
