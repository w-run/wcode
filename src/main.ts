import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import WdUI from 'wdesign'
import { WdIcon } from 'wdesign-icons'
import 'wdesign/styles'
import './assets/styles/main.scss'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(WdUI)
app.component('WdIcon', WdIcon)
app.mount('#app')
