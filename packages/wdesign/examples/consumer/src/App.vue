<script setup>
import { ref } from 'vue'
import { toast } from '@w-run/wdesign'

const name = ref('')
const agree = ref(false)
const plan = ref('专业版')
const loading = ref(false)

function greet() {
  toast.success(`你好，${name.value || '陌生人'}！`)
}

function submit() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    toast.success('提交成功')
  }, 1200)
}
</script>

<template>
  <div class="page">
    <header class="hero">
      <span class="wd-tag wd-tag--tint">@w-run/wdesign</span>
      <h1>消费端示例</h1>
      <p>从私有源 <code>box.w-run.net/npm</code> 安装的组件库，直接可用。</p>
    </header>

    <section class="wd-card">
      <div class="wd-card__title">按钮 · Button</div>
      <div class="row">
        <wd-button variant="primary" @click="greet">主按钮</wd-button>
        <wd-button variant="tint">次级按钮</wd-button>
        <wd-button variant="dark">深色按钮</wd-button>
        <wd-button variant="ghost">幽灵按钮</wd-button>
        <wd-button variant="primary" :disabled="loading" @click="submit">
          {{ loading ? '提交中…' : '提交' }}
        </wd-button>
      </div>
    </section>

    <section class="wd-card">
      <div class="wd-card__title">表单 · Form</div>
      <div class="row" style="flex-direction: column; align-items: stretch; gap: 14px; max-width: 420px;">
        <wd-input v-model="name" placeholder="输入你的名字…" size="lg"></wd-input>
        <wd-checkbox v-model="agree" label="我已阅读并同意条款"></wd-checkbox>
        <wd-select v-model="plan" :options="['基础版', '专业版', '团队版']"></wd-select>
        <wd-progress :value="66"></wd-progress>
      </div>
      <p class="hint">输入：{{ name || '（空）' }} · 同意：{{ agree ? '是' : '否' }} · 套餐：{{ plan }}</p>
    </section>

    <section class="wd-card">
      <div class="wd-card__title">反馈 · Feedback</div>
      <div class="row">
        <wd-tag variant="tint">运行中</wd-tag>
        <wd-tag variant="gray">已完成</wd-tag>
        <wd-tag variant="dark">归档</wd-tag>
        <wd-spinner size="sm"></wd-spinner>
      </div>
      <div class="row" style="margin-top: 18px;">
        <wd-alert variant="success" title="部署成功" description="从私有源安装的组件运行正常。"></wd-alert>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 880px;
  margin: 0 auto;
  padding: 48px 24px 96px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.hero { display: flex; flex-direction: column; gap: 10px; }
.hero h1 { font-size: 38px; font-weight: 900; letter-spacing: -.03em; margin: 0; }
.hero p { color: var(--wd-ink-2); margin: 0; }
.hero code { background: var(--wd-field); padding: 2px 8px; border-radius: 8px; font-size: 13px; }
.row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.hint { font-size: 12.5px; color: var(--wd-ink-3); margin: 14px 0 0; font-family: var(--wd-font-mono); }
</style>
