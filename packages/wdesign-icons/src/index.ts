// =============================================================
//  wdesign-icons — WDesign 图标库
//  595 个 SVG · 256×256 · currentColor · kebab-case
//
//  全量注册：
//    import WdIcons from 'wdesign-icons'
//    app.use(WdIcons)
//
//  按需引入：
//    import { WdIcon } from 'wdesign-icons'
// =============================================================
import type { App, Plugin } from 'vue'
import WdIcon from './WdIcon.vue'

export { WdIcon }

const WdIcons: Plugin = {
  install(app: App) {
    app.component('WdIcon', WdIcon)
  },
}

export default WdIcons
