// =============================================================
//  wdesign · Soft Bento · Red
//  入口：导出全部组件 + 全量注册插件
//
//  全量注册：
//    import WdUI from './wdesign/src'
//    app.use(WdUI)
//
//  按需引入：
//    import { WdButton, WdCard } from './wdesign/src'
// =============================================================
import type { App, Plugin } from 'vue'

import WdAvatar from './components/WdAvatar.vue'
import WdAvatarGroup from './components/WdAvatarGroup.vue'
import WdButton from './components/WdButton.vue'
import WdCard from './components/WdCard.vue'
import WdInput from './components/WdInput.vue'
import WdListItem from './components/WdListItem.vue'
import WdProgress from './components/WdProgress.vue'
import WdSwitch from './components/WdSwitch.vue'
import WdTag from './components/WdTag.vue'
import WdAlert from './components/WdAlert.vue'
import WdBadge from './components/WdBadge.vue'
import WdCheckbox from './components/WdCheckbox.vue'
import WdDatePicker from './components/WdDatePicker.vue'
import WdDropdown from './components/WdDropdown.vue'
import WdEmpty from './components/WdEmpty.vue'
import WdModal from './components/WdModal.vue'
import WdPagination from './components/WdPagination.vue'
import WdRadioGroup from './components/WdRadioGroup.vue'
import WdSelect from './components/WdSelect.vue'
import WdSkeleton from './components/WdSkeleton.vue'
import WdSlider from './components/WdSlider.vue'
import WdSpinner from './components/WdSpinner.vue'
import WdSteps from './components/WdSteps.vue'
import WdTabs from './components/WdTabs.vue'
import WdTooltip from './components/WdTooltip.vue'
import WdBreadcrumb from './components/WdBreadcrumb.vue'
import WdCollapse from './components/WdCollapse.vue'
import WdDrawer from './components/WdDrawer.vue'
import WdRate from './components/WdRate.vue'
import WdResult from './components/WdResult.vue'
import WdTable from './components/WdTable.vue'
import WdNotification from './components/WdNotification.vue'
import WdSegmented from './components/WdSegmented.vue'
import WdUpload from './components/WdUpload.vue'
import WdAiMessage from './components/WdAiMessage.vue'
import WdCarousel from './components/WdCarousel.vue'
import WdExplorer from './components/WdExplorer.vue'
import WdFileList from './components/WdFileList.vue'
import WdImagePreview from './components/WdImagePreview.vue'
import WdOtp from './components/WdOtp.vue'
import WdSortableList from './components/WdSortableList.vue'
import WdPostItem from './components/WdPostItem.vue'
import WdTimeline from './components/WdTimeline.vue'
import { toast } from './components/toast'

export {
  WdPostItem,
  WdTimeline,
  WdAvatar,
  WdAvatarGroup,
  WdButton,
  WdCard,
  WdInput,
  WdListItem,
  WdProgress,
  WdSwitch,
  WdTag,
  WdAlert,
  WdBadge,
  WdCheckbox,
  WdDatePicker,
  WdDropdown,
  WdEmpty,
  WdModal,
  WdPagination,
  WdRadioGroup,
  WdSelect,
  WdSkeleton,
  WdSlider,
  WdSpinner,
  WdSteps,
  WdTabs,
  WdTooltip,
  WdBreadcrumb,
  WdCollapse,
  WdDrawer,
  WdRate,
  WdResult,
  WdTable,
  WdNotification,
  WdSegmented,
  WdUpload,
  WdAiMessage,
  WdCarousel,
  WdExplorer,
  WdFileList,
  WdImagePreview,
  WdOtp,
  WdSortableList,
  toast,
}

const components = [
  WdAvatar,
  WdAvatarGroup,
  WdButton,
  WdCard,
  WdInput,
  WdListItem,
  WdProgress,
  WdSwitch,
  WdTag,
  WdAlert,
  WdBadge,
  WdCheckbox,
  WdDatePicker,
  WdDropdown,
  WdEmpty,
  WdModal,
  WdPagination,
  WdRadioGroup,
  WdSelect,
  WdSkeleton,
  WdSlider,
  WdSpinner,
  WdSteps,
  WdTabs,
  WdTooltip,
  WdBreadcrumb,
  WdCollapse,
  WdDrawer,
  WdRate,
  WdResult,
  WdTable,
]

const WdUI: Plugin = {
  install(app: App) {
    for (const component of components) {
      const name = (component as { name?: string }).name
      if (name) app.component(name, component)
    }
  },
}

export default WdUI

// —— 图标库（独立包 @w-run/wdesign-icons）——
export { WdIcon } from '@w-run/wdesign-icons'
