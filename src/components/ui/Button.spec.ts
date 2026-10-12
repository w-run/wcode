import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WdUI from 'wdesign'
import Button from './Button.vue'

const global = { plugins: [WdUI] }

describe('Button（wdesign 适配层）', () => {
  it('渲染 wd-btn 胶囊按钮', () => {
    const wrapper = mount(Button, { global, slots: { default: '确定' } })
    expect(wrapper.get('button').classes()).toContain('wd-btn')
    expect(wrapper.text()).toBe('确定')
  })

  it('secondary 映射为 wd 的 tint 变体', () => {
    const wrapper = mount(Button, {
      global,
      props: { variant: 'secondary' },
      slots: { default: '次级' },
    })
    expect(wrapper.get('button').classes()).toContain('wd-btn--tint')
  })

  it('disabled 时按钮禁用', () => {
    const wrapper = mount(Button, {
      global,
      props: { disabled: true },
      slots: { default: '禁用' },
    })
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('loading 时禁用并渲染 spinner', () => {
    const wrapper = mount(Button, {
      global,
      props: { loading: true },
      slots: { default: '保存' },
    })
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.wd-spinner').exists()).toBe(true)
  })

  it('点击触发 click 事件', async () => {
    const wrapper = mount(Button, { global, slots: { default: '点我' } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
