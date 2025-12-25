import { describe, it, expect } from 'vitest'
import { formatTime } from '../formatTime'

describe('formatTime', () => {
  const timestamp = new Date('2024-01-15T14:30:45Z').getTime()

  describe('valid timezones', () => {
    it.each([
      ['America/New_York', '09:30:45'],
      ['America/Los_Angeles', '06:30:45'],
      ['Europe/London', '14:30:45'],
      ['Asia/Tokyo', '23:30:45'],
      ['Australia/Sydney', '01:30:45'],
      ['UTC', '14:30:45'],
    ])('should format time correctly for timezone %s', (timezone, expected) => {
      const result = formatTime(timestamp, timezone)
      expect(result).toBe(expected)
    })
  })

  describe('edge cases', () => {
    it('should handle undefined timezone', () => {
      const result = formatTime(timestamp, undefined)
      expect(typeof result).toBe('string')
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    })

    it.each([
      'Invalid/Timezone',
      'Not/A/Real/Zone',
      'BadZone',
      '',
    ])('should return empty string for invalid timezone: %s', (timezone) => {
      const result = formatTime(timestamp, timezone)
      expect(result).toBe('')
    })

    it('should handle different timestamps', () => {
      const midnight = new Date('2024-01-15T00:00:00Z').getTime()
      const noon = new Date('2024-01-15T12:00:00Z').getTime()

      expect(formatTime(midnight, 'UTC')).toBe('00:00:00')
      expect(formatTime(noon, 'UTC')).toBe('12:00:00')
    })

    it('should use 24-hour format', () => {
      const afternoon = new Date('2024-01-15T15:30:00Z').getTime()
      const result = formatTime(afternoon, 'UTC')

      expect(result).toBe('15:30:00')
      expect(result).not.toContain('PM')
      expect(result).not.toContain('AM')
    })
  })
})