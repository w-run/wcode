import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        // 让 SCSS 能找到 node_modules 里的 @w-run/wdesign
        includePaths: ['node_modules'],
      },
    },
  },
  server: { port: 5180, host: true },
})
