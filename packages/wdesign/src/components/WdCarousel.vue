<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

defineOptions({ name: 'WdCarousel' })

export interface WdCarouselItem {
  label?: string
  src?: string
  alt?: string
}

const props = withDefaults(
  defineProps<{
    items?: WdCarouselItem[]
    height?: number
    autoplay?: number
    showDots?: boolean
    showArrows?: boolean
  }>(),
  { items: () => [], height: 260, autoplay: 0, showDots: true, showArrows: true },
)

const PALETTE = ['var(--wd-tint-2)', 'var(--wd-success-soft)', 'var(--wd-warning-soft)', 'var(--wd-field)']

const index = ref(0)
const trackStyle = computed(() => ({ transform: `translateX(-${index.value * 100}%)` }))

function go(i: number) {
  const n = props.items.length
  if (!n) return
  index.value = ((i % n) + n) % n
}

let timer: number | null = null
function start() {
  stop()
  if (props.autoplay > 0 && props.items.length > 1) {
    timer = window.setInterval(() => go(index.value + 1), props.autoplay)
  }
}
function stop() {
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
}
onMounted(start)
onBeforeUnmount(stop)
</script>

<template>
  <div
    class="wd-carousel"
    :style="{ height: height + 'px' }"
    @mouseenter="stop"
    @mouseleave="start"
  >
    <div class="wd-carousel__track" :style="trackStyle">
      <div
        v-for="(it, i) in items"
        :key="i"
        class="wd-carousel__slide"
        :style="{ background: PALETTE[i % PALETTE.length] }"
      >
        <slot name="item" :item="it" :index="i">
          <img v-if="it.src" :src="it.src" :alt="it.alt || ''" class="wd-carousel__img" />
          <span v-else class="wd-carousel__label">{{ it.label || `Slide ${i + 1}` }}</span>
        </slot>
      </div>
    </div>

    <button
      v-if="showArrows && items.length > 1"
      type="button"
      class="wd-icon-btn wd-carousel__arrow wd-carousel__arrow--prev"
      aria-label="上一张"
      @click="go(index - 1)"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
    </button>
    <button
      v-if="showArrows && items.length > 1"
      type="button"
      class="wd-icon-btn wd-carousel__arrow wd-carousel__arrow--next"
      aria-label="下一张"
      @click="go(index + 1)"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"></path></svg>
    </button>

    <div v-if="showDots && items.length > 1" class="wd-carousel__dots">
      <button
        v-for="(_, i) in items"
        :key="i"
        type="button"
        class="wd-carousel__dot"
        :class="{ 'wd-carousel__dot--active': i === index }"
        :aria-label="`第 ${i + 1} 张`"
        @click="go(i)"
      ></button>
    </div>
  </div>
</template>
