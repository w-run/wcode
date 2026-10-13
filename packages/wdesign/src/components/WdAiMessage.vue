<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

defineOptions({ name: 'WdAiMessage' })

interface Action {
  label: string
  variant?: 'primary' | 'tint' | 'ghost'
}

const props = withDefaults(
  defineProps<{
    /** 正文（content） */
    content?: string
    /** 深度思考内容（reasoning_content），独立于正文展示 */
    reasoning?: string
    self?: boolean
    /** 尚未产出思考内容时显示三点脉动 */
    thinking?: boolean
    /** 正文流式输出 */
    streaming?: boolean
    /** 思考内容流式输出 */
    reasoningStreaming?: boolean
    /** 每字符间隔 ms */
    speed?: number
    actions?: Action[]
    /** 思考面板初始是否展开 */
    defaultReasoningOpen?: boolean
  }>(),
  {
    content: '',
    reasoning: '',
    self: false,
    thinking: false,
    streaming: false,
    reasoningStreaming: false,
    speed: 24,
    actions: () => [],
    defaultReasoningOpen: true,
  },
)

const emit = defineEmits<{
  (e: 'action', label: string): void
  (e: 'stream-end'): void
  (e: 'reasoning-end'): void
}>()

const shown = ref(props.content)
const shownReasoning = ref(props.reasoning)
const reasoningOpen = ref(props.defaultReasoningOpen)

let contentTimer: number | null = null
let reasoningTimer: number | null = null

function stopContent() {
  if (contentTimer) {
    window.clearInterval(contentTimer)
    contentTimer = null
  }
}
function stopReasoning() {
  if (reasoningTimer) {
    window.clearInterval(reasoningTimer)
    reasoningTimer = null
  }
}

function startContent() {
  stopContent()
  shown.value = ''
  let i = 0
  contentTimer = window.setInterval(() => {
    i += 1
    shown.value = props.content.slice(0, i)
    if (i >= props.content.length) {
      stopContent()
      emit('stream-end')
    }
  }, Math.max(8, props.speed))
}

function startReasoning() {
  stopReasoning()
  shownReasoning.value = ''
  let i = 0
  reasoningTimer = window.setInterval(() => {
    i += 1
    shownReasoning.value = props.reasoning.slice(0, i)
    if (i >= props.reasoning.length) {
      stopReasoning()
      emit('reasoning-end')
      // 思考结束自动收起（可点击重新展开）
      if (props.defaultReasoningOpen) reasoningOpen.value = false
    }
  }, Math.max(8, props.speed))
}

watch(
  () => props.streaming,
  (v) => {
    if (v) startContent()
    else {
      stopContent()
      shown.value = props.content
    }
  },
  { immediate: true },
)

watch(
  () => props.reasoningStreaming,
  (v) => {
    if (v) startReasoning()
    else {
      stopReasoning()
      shownReasoning.value = props.reasoning
    }
  },
  { immediate: true },
)

watch(
  () => props.content,
  (v) => {
    if (!props.streaming) shown.value = v
  },
)

watch(
  () => props.reasoning,
  (v) => {
    if (!props.reasoningStreaming) shownReasoning.value = v
  },
)

onBeforeUnmount(() => {
  stopContent()
  stopReasoning()
})
</script>

<template>
  <div class="wd-ai-msg" :class="{ 'wd-ai-msg--self': self }">
    <span class="wd-ai-msg__avatar">{{ self ? '我' : 'AI' }}</span>
    <div class="wd-ai-msg__bubble">
      <!-- 深度思考（reasoning_content）：独立区域，可折叠 -->
      <div v-if="thinking && !shownReasoning" class="wd-ai-msg__thinking">
        <i></i><i></i><i></i>深度思考中…
      </div>
      <div
        v-if="shownReasoning"
        class="wd-ai-msg__reasoning"
        :class="{ 'wd-ai-msg__reasoning--open': reasoningOpen }"
      >
        <button type="button" class="wd-ai-msg__reasoning-head" @click="reasoningOpen = !reasoningOpen">
          <svg class="wd-ai-msg__reasoning-spark" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l1.9 5.2 5.3 1.9-5.3 1.9L12 16.7l-1.9-5.2-5.3-1.9 5.3-1.9z"></path></svg>
          <span class="wd-ai-msg__reasoning-title">深度思考</span>
          <span class="wd-ai-msg__reasoning-state">{{ reasoningStreaming ? '进行中' : '已完成' }}</span>
          <span class="wd-chevron" :class="{ 'wd-chevron--open': reasoningOpen }">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
          </span>
        </button>
        <div class="wd-ai-msg__reasoning-body">
          <div class="wd-ai-msg__reasoning-inner">
            <p class="wd-ai-msg__reasoning-text">{{ shownReasoning }}<span v-if="reasoningStreaming" class="wd-ai-msg__cursor">▍</span></p>
          </div>
        </div>
      </div>

      <!-- 正文（content） -->
      <p v-if="content || shown" class="wd-ai-msg__text">{{ shown }}<span v-if="streaming && shown.length < content.length" class="wd-ai-msg__cursor">▍</span></p>

      <div v-if="actions.length" class="wd-ai-msg__actions">
        <button
          v-for="a in actions"
          :key="a.label"
          type="button"
          class="wd-btn"
          :class="[`wd-btn--${a.variant || 'ghost'}`, 'wd-btn--sm']"
          @click="emit('action', a.label)"
        >
          {{ a.label }}
        </button>
      </div>
    </div>
  </div>
</template>
