import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useSynchronizedTime } from '../useSynchronizedTime'

// Helper component to test the composable
const createTestComponent = (timezone: string | undefined = 'UTC') => {
  return {
    setup() {
      const tz = ref(timezone)
      const result = useSynchronizedTime(tz)
      return { ...result, tz }
    },
    template: '<div>{{ timezoneTime }}</div>',
  }
}

describe('useSynchronizedTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('global timer management', () => {
    it('should start global timer on first mount', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')

      const wrapper = mount(createTestComponent())

      expect(setIntervalSpy).toHaveBeenCalledTimes(1)
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)

      wrapper.unmount()
    })

    it('should not start additional timers for multiple components', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')

      const wrapper1 = mount(createTestComponent())
      const wrapper2 = mount(createTestComponent())
      const wrapper3 = mount(createTestComponent())

      expect(setIntervalSpy).toHaveBeenCalledTimes(1)

      wrapper1.unmount()
      wrapper2.unmount()
      wrapper3.unmount()
    })

    it('should clear timer when last component unmounts', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const wrapper1 = mount(createTestComponent())
      const wrapper2 = mount(createTestComponent())

      wrapper1.unmount()
      expect(clearIntervalSpy).not.toHaveBeenCalled()

      wrapper2.unmount()
      expect(clearIntervalSpy).toHaveBeenCalledTimes(1)
    })

    it('should restart timer after all components unmount and new one mounts', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')

      const wrapper1 = mount(createTestComponent())
      expect(setIntervalSpy).toHaveBeenCalledTimes(1)

      wrapper1.unmount()

      const wrapper2 = mount(createTestComponent())
      expect(setIntervalSpy).toHaveBeenCalledTimes(2)

      wrapper2.unmount()
    })
  })

  describe('timezone formatting', () => {
    it('should format time for UTC timezone', async () => {
      const timestamp = new Date('2024-01-15T14:30:45Z').getTime()
      vi.setSystemTime(timestamp)

      const wrapper = mount(createTestComponent('UTC'))
      vi.advanceTimersByTime(1000)
      await nextTick()

      // Time advances by 1 second when interval fires
      expect(wrapper.text()).toBe('14:30:46')

      wrapper.unmount()
    })

    it('should format time for different timezones', async () => {
      const timestamp = new Date('2024-01-15T14:30:45Z').getTime()
      vi.setSystemTime(timestamp)

      const wrapperNY = mount(createTestComponent('America/New_York'))
      const wrapperTokyo = mount(createTestComponent('Asia/Tokyo'))

      vi.advanceTimersByTime(1000)
      await nextTick()

      // Time advances by 1 second when interval fires
      expect(wrapperNY.text()).toBe('09:30:46')
      expect(wrapperTokyo.text()).toBe('23:30:46')

      wrapperNY.unmount()
      wrapperTokyo.unmount()
    })

    it('should handle undefined timezone', async () => {
      const wrapper = mount(createTestComponent(undefined))

      vi.advanceTimersByTime(1000)
      await nextTick()

      // Should return formatted time in local timezone
      expect(wrapper.text()).toMatch(/^\d{2}:\d{2}:\d{2}$/)

      wrapper.unmount()
    })

    it('should return empty string for invalid timezone', async () => {
      const wrapper = mount(createTestComponent('Invalid/Timezone'))

      vi.advanceTimersByTime(1000)
      await nextTick()

      expect(wrapper.text()).toBe('')

      wrapper.unmount()
    })
  })

  describe('shared time state', () => {
    it('should share the same time value across multiple components', async () => {
      const timestamp = new Date('2024-01-15T14:30:45Z').getTime()
      vi.setSystemTime(timestamp)

      const wrapper1 = mount(createTestComponent('UTC'))
      const wrapper2 = mount(createTestComponent('America/New_York'))

      vi.advanceTimersByTime(1000)
      await nextTick()

      // Different formatted times due to different timezones (time advances by 1s)
      expect(wrapper1.text()).toBe('14:30:46')
      expect(wrapper2.text()).toBe('09:30:46')

      // But underlying time ref should be the same
      expect(wrapper1.vm.time).toBe(wrapper2.vm.time)

      wrapper1.unmount()
      wrapper2.unmount()
    })

    it('should update all components when time updates', async () => {
      const timestamp = new Date('2024-01-15T14:30:45Z').getTime()
      vi.setSystemTime(timestamp)

      const wrapper1 = mount(createTestComponent('UTC'))
      const wrapper2 = mount(createTestComponent('UTC'))

      vi.advanceTimersByTime(1000)
      await nextTick()

      // Time advances by 1 second
      expect(wrapper1.text()).toBe('14:30:46')
      expect(wrapper2.text()).toBe('14:30:46')

      vi.advanceTimersByTime(1000)
      await nextTick()

      // Another second passes
      expect(wrapper1.text()).toBe('14:30:47')
      expect(wrapper2.text()).toBe('14:30:47')

      wrapper1.unmount()
      wrapper2.unmount()
    })
  })

  describe('return values', () => {
    it('should return time ref and timezoneTime computed', () => {
      const wrapper = mount(createTestComponent('UTC'))

      expect(wrapper.vm.time).toBeDefined()
      expect(typeof wrapper.vm.time).toBe('number')
      expect(wrapper.vm.timezoneTime).toBeDefined()
      expect(typeof wrapper.vm.timezoneTime).toBe('string')

      wrapper.unmount()
    })
  })
})
