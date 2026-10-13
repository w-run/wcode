import { createApp } from 'vue'
import WDesign from '@w-run/wdesign'
import App from './App.vue'

// 全量引入 WDesign（含全部组件 + 样式）
import '@w-run/wdesign/styles'

createApp(App).use(WDesign).mount('#app')
