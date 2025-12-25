import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import IpLookupInput from '../IpLookupInput.vue'
import { clearCache } from '@/composables/useFetch'

// Mock the API
global.fetch = vi.fn()

describe('IpLookupInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearCache()
  })

  const createWrapper = (props = {}) => {
    return mount(IpLookupInput, {
      props: {
        index: 0,
        handleRemove: vi.fn(),
        ...props,
      },
    })
  }

  describe('rendering', () => {
    it('should render with correct initial state', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('input').exists()).toBe(true)
      expect(wrapper.find('.remove-btn').exists()).toBe(true)
      expect(wrapper.text()).toContain('Blur to lookup')
    })

    it('should display row number (index + 1)', () => {
      const wrapper = createWrapper({ index: 5 })

      expect(wrapper.find('.row-label').text()).toBe('6')
    })

    it('should have correct placeholder', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('input').attributes('placeholder')).toBe(
        'e.g., 8.8.8.8 or 2001:4860:4860::8888',
      )
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes on input', () => {
      const wrapper = createWrapper({ index: 2 })
      const input = wrapper.find('input')

      expect(input.attributes('aria-label')).toBe('IP address input 3')
      expect(input.attributes('aria-invalid')).toBe('false')
    })

    it('should have aria-invalid=true when there is an error', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('invalid')
      await input.trigger('blur')
      await flushPromises()

      expect(input.attributes('aria-invalid')).toBe('true')
      expect(input.attributes('aria-describedby')).toContain('error-')
    })

    it('should have aria-label on remove button', () => {
      const wrapper = createWrapper({ index: 1 })
      const button = wrapper.find('.remove-btn')

      expect(button.attributes('aria-label')).toBe('Remove IP lookup 2')
    })

    it('should have role="alert" on error message', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('invalid')
      await input.trigger('blur')
      await flushPromises()

      const errorDiv = wrapper.find('.error-message')
      expect(errorDiv.attributes('role')).toBe('alert')
      expect(errorDiv.attributes('aria-live')).toBe('assertive')
    })
  })

  describe('IP validation', () => {
    it('should show validation error for invalid IP', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('invalid-ip')
      await input.trigger('blur')
      await flushPromises()

      expect(wrapper.text()).toContain('Invalid IP address')
      expect(wrapper.find('input').classes()).toContain('ip-input--error')
    })

    it('should accept valid IPv4 address', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          ip: '8.8.8.8',
          country: 'United States',
          country_code: 'US',
          timezone: { id: 'America/Los_Angeles', offset: -28800 },
          flag: { emoji: '🇺🇸' },
        }),
      })

      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('8.8.8.8')
      await input.trigger('blur')
      await flushPromises()

      expect(wrapper.text()).toContain('United States')
      expect(wrapper.find('input').classes()).toContain('ip-input--success')
    })

    it('should accept valid IPv6 address', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          ip: '2001:4860:4860::8888',
          country: 'United States',
          country_code: 'US',
          timezone: { id: 'America/Los_Angeles', offset: -28800 },
          flag: { emoji: '🇺🇸' },
        }),
      })

      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('2001:4860:4860::8888')
      await input.trigger('blur')
      await flushPromises()

      expect(wrapper.text()).toContain('United States')
    })

    it('should clear validation error when input is cleared', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('invalid')
      await input.trigger('blur')
      await flushPromises()

      expect(wrapper.text()).toContain('Invalid IP address')

      await input.setValue('')
      await flushPromises()

      expect(wrapper.text()).not.toContain('Invalid IP address')
    })
  })

  describe('lookup behavior', () => {
    it('should not perform lookup on empty input', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('  ')
      await input.trigger('blur')
      await flushPromises()

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should show loading state during lookup', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      )

      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('8.8.8.8')
      await input.trigger('blur')
      await flushPromises()

      expect(wrapper.text()).toContain('Checking...')
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
      expect(wrapper.find('input').classes()).toContain('ip-input--loading')
      expect(wrapper.find('input').attributes('disabled')).toBe('')
    })

    it('should display country and flag on successful lookup', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          ip: '8.8.8.8',
          country: 'United States',
          country_code: 'US',
          timezone: { id: 'America/Los_Angeles', offset: -28800 },
          flag: { emoji: '🇺🇸' },
        }),
      })

      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('8.8.8.8')
      await input.trigger('blur')
      await flushPromises()

      expect(wrapper.text()).toContain('United States')
      expect(wrapper.text()).toContain('🇺🇸')
    })

    it('should handle API errors', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('8.8.8.8')
      await input.trigger('blur')
      await flushPromises()

      // Should show error state
      expect(wrapper.find('input').classes()).toContain('ip-input--error')
    })

    it('should trim whitespace from IP input', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          ip: '8.8.8.8',
          country: 'United States',
          country_code: 'US',
          timezone: { id: 'America/Los_Angeles', offset: -28800 },
        }),
      })

      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('  8.8.8.8  ')
      await input.trigger('blur')
      await flushPromises()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('8.8.8.8'),
        expect.any(Object),
      )
    })
  })

  describe('remove button', () => {
    it('should call handleRemove with correct index when clicked', async () => {
      const handleRemove = vi.fn()
      const wrapper = createWrapper({ index: 3, handleRemove })

      await wrapper.find('.remove-btn').trigger('click')

      expect(handleRemove).toHaveBeenCalledWith(3)
      expect(handleRemove).toHaveBeenCalledTimes(1)
    })

    it('should have type="button" to prevent form submission', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.remove-btn').attributes('type')).toBe('button')
    })
  })

  describe('abort on unmount', () => {
    it('should abort ongoing request when component unmounts', async () => {
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort')

      ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      )

      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('8.8.8.8')
      await input.trigger('blur')
      await flushPromises()

      wrapper.unmount()

      expect(abortSpy).toHaveBeenCalled()

      abortSpy.mockRestore()
    })
  })

  describe('status classes', () => {
    it('should apply loading class when loading', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}),
      )

      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('8.8.8.8')
      await input.trigger('blur')
      await flushPromises()

      expect(input.classes()).toContain('ip-input--loading')
    })

    it('should apply error class on validation error', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('invalid')
      await input.trigger('blur')
      await flushPromises()

      expect(input.classes()).toContain('ip-input--error')
    })

    it('should apply success class on successful lookup', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          ip: '8.8.8.8',
          country: 'United States',
          country_code: 'US',
          timezone: { id: 'UTC', offset: 0 },
        }),
      })

      const wrapper = createWrapper()
      const input = wrapper.find('input')

      await input.setValue('8.8.8.8')
      await input.trigger('blur')
      await flushPromises()

      expect(input.classes()).toContain('ip-input--success')
    })
  })
})
