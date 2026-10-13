// =============================================================
//  WDesign — Toast（命令式轻提示）
//
//  import { toast } from 'wdesign'
//  toast('已保存')
//  toast.success('部署成功')
//  toast.warning('存储将满')
//  toast.danger('同步失败')
//  选项：{ type, duration }（默认 2400ms，点击可提前关闭）
// =============================================================
export interface WdToastOptions {
  type?: 'info' | 'success' | 'warning' | 'danger'
  duration?: number
}

let container: HTMLElement | null = null

const MAX_STACK = 4

function ensureContainer(): HTMLElement {
  if (!container || !document.body.contains(container)) {
    container = document.createElement('div')
    container.className = 'wd-toasts'
    document.body.appendChild(container)
  }
  return container
}

function show(message: string, options: WdToastOptions = {}) {
  if (typeof document === 'undefined') return
  const { type = 'info', duration = 2400 } = options
  const wrap = ensureContainer()

  while (wrap.children.length >= MAX_STACK) {
    wrap.removeChild(wrap.firstChild as ChildNode)
  }

  const el = document.createElement('div')
  el.className = `wd-toast wd-toast--${type} wd-toast--enter`

  const dot = document.createElement('span')
  dot.className = 'wd-dot wd-dot--' + type

  const text = document.createElement('span')
  text.textContent = message

  el.appendChild(dot)
  el.appendChild(text)
  wrap.appendChild(el)

  requestAnimationFrame(() => el.classList.remove('wd-toast--enter'))

  let done = false
  const dismiss = () => {
    if (done) return
    done = true
    el.classList.add('wd-toast--leave')
    window.setTimeout(() => el.remove(), 260)
  }
  window.setTimeout(dismiss, duration)
  el.addEventListener('click', dismiss)
}

export const toast = Object.assign(
  (message: string, options?: WdToastOptions) => show(message, options),
  {
    info: (message: string, options?: WdToastOptions) => show(message, { ...options, type: 'info' }),
    success: (message: string, options?: WdToastOptions) => show(message, { ...options, type: 'success' }),
    warning: (message: string, options?: WdToastOptions) => show(message, { ...options, type: 'warning' }),
    danger: (message: string, options?: WdToastOptions) => show(message, { ...options, type: 'danger' }),
  },
)

export default toast
