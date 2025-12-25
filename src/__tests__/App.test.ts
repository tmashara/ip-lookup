import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import IpLookupInput from '../components/IpLookupInput.vue'

// Mock fetch for child components
global.fetch = vi.fn()

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial rendering', () => {
    it('should render the app title', () => {
      const wrapper = mount(App)

      expect(wrapper.find('.modal-title').text()).toBe('IP Lookup')
    })

    it('should render the subtitle', () => {
      const wrapper = mount(App)

      expect(wrapper.find('.subtitle').text()).toBe(
        'Enter one or more IP addresses and get their country',
      )
    })

    it('should render add button with correct text', () => {
      const wrapper = mount(App)

      expect(wrapper.find('.add-button').text()).toContain('Add')
    })

    it('should render exactly one IP lookup row initially', () => {
      const wrapper = mount(App)

      const ipInputs = wrapper.findAllComponents(IpLookupInput)
      expect(ipInputs).toHaveLength(1)
    })
  })

  describe('adding rows', () => {
    it('should add a new row when add button is clicked', async () => {
      const wrapper = mount(App)

      expect(wrapper.findAllComponents(IpLookupInput)).toHaveLength(1)

      await wrapper.find('.add-button').trigger('click')

      expect(wrapper.findAllComponents(IpLookupInput)).toHaveLength(2)
    })

    it('should add multiple rows when clicked multiple times', async () => {
      const wrapper = mount(App)

      await wrapper.find('.add-button').trigger('click')
      await wrapper.find('.add-button').trigger('click')
      await wrapper.find('.add-button').trigger('click')

      expect(wrapper.findAllComponents(IpLookupInput)).toHaveLength(4)
    })

    it('should maintain correct number of rows after adding', async () => {
      const wrapper = mount(App)

      expect(wrapper.findAllComponents(IpLookupInput)).toHaveLength(1)

      await wrapper.find('.add-button').trigger('click')
      expect(wrapper.findAllComponents(IpLookupInput)).toHaveLength(2)

      await wrapper.find('.add-button').trigger('click')
      expect(wrapper.findAllComponents(IpLookupInput)).toHaveLength(3)
    })
  })

  describe('removing rows', () => {
    it('should remove a row when handleRemove is called', async () => {
      const wrapper = mount(App)

      await wrapper.find('.add-button').trigger('click')
      await wrapper.find('.add-button').trigger('click')

      expect(wrapper.findAllComponents(IpLookupInput)).toHaveLength(3)

      // Get the handleRemove prop from the second component (index 1)
      const secondInput = wrapper.findAllComponents(IpLookupInput)[1]
      const handleRemove = secondInput.props('handleRemove') as (index: number) => void
      handleRemove(1)

      await wrapper.vm.$nextTick()

      expect(wrapper.findAllComponents(IpLookupInput)).toHaveLength(2)
    })

    it('should remove the correct row by index', async () => {
      const wrapper = mount(App)

      await wrapper.find('.add-button').trigger('click')
      await wrapper.find('.add-button').trigger('click')

      const ipInputs = wrapper.findAllComponents(IpLookupInput)
      expect(ipInputs).toHaveLength(3)

      // Each component should have different index
      expect(ipInputs[0].props('index')).toBe(0)
      expect(ipInputs[1].props('index')).toBe(1)
      expect(ipInputs[2].props('index')).toBe(2)

      // Remove middle row (index 1)
      const handleRemove = ipInputs[1].props('handleRemove') as (index: number) => void
      handleRemove(1)

      await wrapper.vm.$nextTick()

      const updatedInputs = wrapper.findAllComponents(IpLookupInput)
      expect(updatedInputs).toHaveLength(2)

      // Indices should be updated
      expect(updatedInputs[0].props('index')).toBe(0)
      expect(updatedInputs[1].props('index')).toBe(1)
    })

    it('should allow removing down to one row', async () => {
      const wrapper = mount(App)

      await wrapper.find('.add-button').trigger('click')

      expect(wrapper.findAllComponents(IpLookupInput)).toHaveLength(2)

      const ipInputs = wrapper.findAllComponents(IpLookupInput)
      const handleRemove = ipInputs[1].props('handleRemove') as (index: number) => void
      handleRemove(1)

      await wrapper.vm.$nextTick()

      expect(wrapper.findAllComponents(IpLookupInput)).toHaveLength(1)
    })
  })

  describe('component props', () => {
    it('should pass correct index to each IPLookupInput', async () => {
      const wrapper = mount(App)

      await wrapper.find('.add-button').trigger('click')
      await wrapper.find('.add-button').trigger('click')

      const ipInputs = wrapper.findAllComponents(IpLookupInput)

      expect(ipInputs[0].props('index')).toBe(0)
      expect(ipInputs[1].props('index')).toBe(1)
      expect(ipInputs[2].props('index')).toBe(2)
    })

    it('should pass handleRemove function to each IPLookupInput', () => {
      const wrapper = mount(App)

      const ipInput = wrapper.findComponent(IpLookupInput)

      expect(ipInput.props('handleRemove')).toBeTypeOf('function')
    })
  })
})
