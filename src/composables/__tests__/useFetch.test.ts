import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useFetch, clearCache } from '../useFetch'

describe('useFetch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    global.fetch = vi.fn()
    clearCache()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('basic functionality', () => {
    it('should fetch data successfully', async () => {
      const mockData = { success: true, ip: '8.8.8.8' }
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const { data, status, execute } = useFetch()
      await execute('https://api.example.com/test')

      expect(data.value).toEqual(mockData)
      expect(status.value).toBe('success')
    })

    it('should handle fetch errors', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const { error, status, execute } = useFetch()
      await execute('https://api.example.com/test')

      expect(status.value).toBe('error')
      expect(error.value).toContain('HTTP error')
    })

    it('should handle abort', async () => {
      let abortSignal: AbortSignal | undefined

      ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        (_url: string, options?: { signal?: AbortSignal }) => {
          abortSignal = options?.signal
          return new Promise((resolve, reject) => {
            abortSignal?.addEventListener('abort', () => {
              const error = new Error('Aborted')
              error.name = 'AbortError'
              reject(error)
            })
          })
        },
      )

      const { status, execute, abort } = useFetch()

      const fetchPromise = execute('https://api.example.com/test')
      abort()

      await fetchPromise

      expect(status.value).toBe('idle')
    })
  })

  describe('caching', () => {
    it('should cache successful responses', async () => {
      const mockData = { success: true, ip: '8.8.8.8' }
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })

      const { execute } = useFetch()
      await execute('https://api.example.com/test')
      await execute('https://api.example.com/test')

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should respect cache TTL', async () => {
      const mockData = { success: true, ip: '8.8.8.8' }
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })

      const { execute } = useFetch({ cacheTTL: 1000 })
      await execute('https://api.example.com/test')

      vi.advanceTimersByTime(1001)

      await execute('https://api.example.com/test')

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should not cache when cache option is false', async () => {
      const mockData = { success: true, ip: '8.8.8.8' }
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })

      const { execute } = useFetch({ cache: false })
      await execute('https://api.example.com/test')
      await execute('https://api.example.com/test')

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('LRU cache eviction', () => {
    it('should evict oldest entry when cache size exceeds limit', async () => {
      const mockData = (url: string) => ({ success: true, url })
      ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) => ({
        ok: true,
        json: async () => mockData(url),
      }))

      const { execute } = useFetch({ maxCacheSize: 3 })

      // Fill cache: [1, 2, 3]
      await execute('https://api.example.com/1')
      await execute('https://api.example.com/2')
      await execute('https://api.example.com/3')
      expect(global.fetch).toHaveBeenCalledTimes(3)

      // Add 4, evicts 1: [2, 3, 4]
      await execute('https://api.example.com/4')
      expect(global.fetch).toHaveBeenCalledTimes(4)

      // Access 1 (not in cache, needs fetch), evicts 2: [3, 4, 1]
      await execute('https://api.example.com/1')
      expect(global.fetch).toHaveBeenCalledTimes(5)

      // Access 3 (still in cache, no fetch, moves to end): [4, 1, 3]
      await execute('https://api.example.com/3')
      expect(global.fetch).toHaveBeenCalledTimes(5)

      // Access 4 (still in cache, no fetch, moves to end): [1, 3, 4]
      await execute('https://api.example.com/4')
      expect(global.fetch).toHaveBeenCalledTimes(5)
    })

    it('should update LRU order when accessing cached entries', async () => {
      const mockData = (url: string) => ({ success: true, url })
      ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: string) => ({
        ok: true,
        json: async () => mockData(url),
      }))

      const { execute } = useFetch({ maxCacheSize: 3 })

      await execute('https://api.example.com/1')
      await execute('https://api.example.com/2')
      await execute('https://api.example.com/3')

      await execute('https://api.example.com/1')

      await execute('https://api.example.com/4')

      await execute('https://api.example.com/2')
      expect(global.fetch).toHaveBeenCalledTimes(5)

      await execute('https://api.example.com/1')
      expect(global.fetch).toHaveBeenCalledTimes(5)
    })
  })
})
