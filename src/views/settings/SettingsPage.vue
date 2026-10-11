<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { client, getToken, setToken } from '@/api/client'

const token = ref('')
const saved = ref(false)
const testing = ref(false)
const testResult = ref<{ ok: boolean; text: string } | null>(null)

onMounted(() => {
  token.value = getToken()
  saved.value = Boolean(token.value)
})

function save() {
  setToken(token.value.trim())
  saved.value = Boolean(token.value.trim())
  testResult.value = null
}

function clear() {
  token.value = ''
  save()
}

/** 测试连接：GET /user 返回当前登录身份 */
async function test() {
  testing.value = true
  testResult.value = null
  try {
    const user = await client.get<{ login: string; full_name?: string }>(
      '/user',
    )
    testResult.value = {
      ok: true,
      text: `认证成功：${user.full_name || user.login} (@${user.login})`,
    }
  } catch (err) {
    testResult.value = {
      ok: false,
      text: err instanceof Error ? err.message : '连接失败',
    }
  } finally {
    testing.value = false
  }
}
</script>

<template>
  <div class="settings">
    <header class="settings__head">
      <h1 class="settings__title">设置</h1>
      <p class="settings__desc">
        配置 Gitea API Token，用于跨域 / 非 Cookie
        场景的鉴权（免登录读取你的仓库数据）。
      </p>
    </header>

    <section class="card">
      <h2 class="card__title">API Token</h2>

      <label class="field-label" for="token">访问令牌</label>
      <input
        id="token"
        v-model="token"
        class="field"
        type="password"
        placeholder="粘贴 Gitea 访问令牌（不保存到服务端，仅存本机浏览器）"
        autocomplete="off"
      />

      <div class="card__actions">
        <button type="button" class="btn btn--primary" @click="save">
          {{ saved ? '已保存' : '保存' }}
        </button>
        <button
          v-if="token"
          type="button"
          class="btn btn--ghost"
          @click="clear"
        >
          清除
        </button>
        <button
          type="button"
          class="btn btn--secondary"
          :disabled="!token || testing"
          @click="test"
        >
          {{ testing ? '测试中...' : '测试连接' }}
        </button>
      </div>

      <p
        v-if="testResult"
        class="test-result"
        :class="testResult.ok ? 'test-result--ok' : 'test-result--err'"
      >
        {{ testResult.text }}
      </p>
    </section>

    <section class="card">
      <h2 class="card__title">如何获取 Token</h2>
      <ol class="guide">
        <li>登录 Gitea（本机 demo：<code>http://localhost:3000</code>）</li>
        <li>右上角头像 → <strong>设置</strong> → <strong>应用</strong></li>
        <li>「生成新令牌」，勾选权限并创建</li>
        <li>把令牌粘贴到上方输入框并保存</li>
      </ol>
      <p class="note">
        演示环境 Token：<code>6e7eaed9283413f618066412e65c1aba569b04a4</code>
        （demo 用户）
      </p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.settings {
  max-width: 560px;
  margin: 0 auto;
}

.settings__head {
  margin-bottom: $space-6;
}

.settings__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $color-text;
}

.settings__desc {
  margin-top: $space-2;
  font-size: 14px;
  color: $color-text-muted;
}

.card {
  padding: $space-6;
  margin-bottom: $space-4;
  background: $color-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.card__title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: $space-4;
}

.field-label {
  display: block;
  margin-bottom: $space-2;
  font-size: 13px;
  color: $color-text-muted;
}

.field {
  width: 100%;
  padding: $space-2 $space-3;
  border: none;
  border-radius: $radius-md;
  background: $color-bg;
  color: $color-text;
  font-size: 13px;
  font-family: $font-mono;

  &::placeholder {
    font-family: $font-sans;
    color: $color-text-muted;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px $color-accent-light;
  }
}

.card__actions {
  display: flex;
  gap: $space-2;
  margin-top: $space-4;
}

.btn {
  padding: $space-2 $space-4;
  border: none;
  border-radius: $radius-full;
  font-size: 13px;
  cursor: pointer;

  &--primary {
    background: $color-accent;
    color: #fff;

    &:hover {
      background: $color-accent-hover;
    }
  }

  &--secondary {
    background: $color-surface-2;
    color: $color-text;

    &:hover {
      background: $color-accent-light;
      color: $color-accent;
    }
  }

  &--ghost {
    background: transparent;
    color: $color-text-muted;

    &:hover {
      color: $color-danger;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.test-result {
  margin-top: $space-4;
  padding: $space-2 $space-3;
  border-radius: $radius-md;
  font-size: 13px;

  &--ok {
    background: $color-success-light;
    color: $color-success;
  }

  &--err {
    background: $color-danger-light;
    color: $color-danger;
  }
}

.guide {
  padding-left: $space-6;
  margin: 0;
  font-size: 13.5px;
  color: $color-text;
  line-height: 1.9;

  code {
    padding: 1px 6px;
    border-radius: 6px;
    background: $color-surface-2;
    font-family: $font-mono;
    font-size: 0.9em;
  }
}

.note {
  margin-top: $space-4;
  font-size: 12.5px;
  color: $color-text-muted;

  code {
    padding: 1px 6px;
    border-radius: 6px;
    background: $color-surface-2;
    font-family: $font-mono;
    font-size: 0.9em;
  }
}
</style>
