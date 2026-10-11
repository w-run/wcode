import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

describe('Button', () => {
  it('默认渲染 primary/md 胶囊按钮', () => {
    const wrapper = mount(Button, { slots: { default: '确定' } })
    const btn = wrapper.get('button')
    expect(btn.classes()).toContain('btn--primary')
    expect(btn.classes()).toContain('btn--md')
    expect(btn.text()).toBe('确定')
    expect(btn.attributes('type')).toBe('button')
  })

  it('按 variant 切换样式类', () => {
    const wrapper = mount(Button, {
      props: { variant: 'danger' },
      slots: { default: '删除' },
    })
    expect(wrapper.get('button').classes()).toContain('btn--danger')
  })

  it('disabled 时按钮不可点击', () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: '禁用' },
    })
    const btn = wrapper.get('button')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('loading 时禁用并标记 aria-busy', () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: '保存' },
    })
    const btn = wrapper.get('button')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.attributes('aria-busy')).toBe('true')
  })

  it('点击触发原生 click 事件', async () => {
    const wrapper = mount(Button, { slots: { default: '点我' } })
    const btn = wrapper.get('button')
    let clicked = false
    btn.element.addEventListener('click', () => {
      clicked = true
    })
    await btn.trigger('click')
    expect(clicked).toBe(true)
  })
})
