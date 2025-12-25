import { ref } from 'vue'
import type { Status } from '@/types'

interface UseFetchOptions {
  cache?: boolean
  cacheTTL?: number // TTL in milliseconds
  maxCacheSize?: number // Maximum number of entries in cache
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

// Maximum cache size (default)
const DEFAULT_MAX_CACHE_SIZE = 100

// simple in-memory cache with TTL and LRU eviction support
const cache = new Map<string, CacheEntry<unknown>>()

export function useFetch<T = unknown>(options: UseFetchOptions = {}) {
  // default 5 minutes, max 100 entries
  const {
    cache: useCache = true,
    cacheTTL = 5 * 60 * 1000,
    maxCacheSize = DEFAULT_MAX_CACHE_SIZE,
  } = options

  const data = ref<T | null>(null)
  const error = ref<string | null>(null)
  const status = ref<Status>('idle')

  let abortController: AbortController | null = null

  const isCacheValid = (entry: CacheEntry<T>): boolean => {
    const now = Date.now()
    return now - entry.timestamp < cacheTTL
  }

  const execute = async (url: string) => {
    // check cache first
    if (useCache && cache.has(url)) {
      const cacheEntry = cache.get(url) as CacheEntry<T>

      if (isCacheValid(cacheEntry)) {
        // LRU: Move to end by deleting and re-inserting
        cache.delete(url)
        cache.set(url, cacheEntry)

        data.value = cacheEntry.data
        status.value = 'success'

        return
      } else {
        // remove stale cache entry
        cache.delete(url)
      }
    }

    abortController = new AbortController()
    status.value = 'loading'
    error.value = null

    try {
      const response = await fetch(url, {
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      data.value = result
      status.value = 'success'

      // Store in cache with timestamp
      if (useCache) {
        // LRU eviction: Remove the oldest entry if cache is full
        if (cache.size >= maxCacheSize) {
          const firstKey = cache.keys().next().value
          if (firstKey !== undefined) {
            cache.delete(firstKey)
          }
        }

        cache.set(url, {
          data: result,
          timestamp: Date.now(),
        })
      }
    } catch (err: unknown) {
      // don't set error for aborted requests
      if ((err as Error).name === 'AbortError') {
        status.value = 'idle'

        return
      }

      error.value = err instanceof Error ? err.message : String(err)
      status.value = 'error'
    }
  }

  const abort = () => {
    abortController?.abort()
    abortController = null
    status.value = 'idle'
    error.value = null
  }

  return {
    data,
    error,
    status,
    execute,
    abort,
  }
}

// Export for testing purposes
export function clearCache() {
  cache.clear()
}
