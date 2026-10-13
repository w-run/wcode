import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    // wdesign 声明 vue 为 peerDependency，避免重复打包
    dedupe: ['vue'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "wdesign/styles/tokens" as *;\n@use "@/assets/styles/_tokens.scss" as *;\n@use "@/assets/styles/_mixins.scss" as *;`,
      },
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // shiki 语法高亮体积大，拆为独立 chunk，仅在代码查看时懒加载
          if (id.includes('shiki') || id.includes('@shikijs')) return 'shiki'
          return undefined
        },
      },
    },
  },
})
