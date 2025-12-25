import { ref } from 'vue'
import type { Status } from '@/types'

interface UseFetchOptions {
  cache?: boolean
  cacheTTL?: number // TTL in milliseconds
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

// simple in-memory cache with TTL support
const cache = new Map<string, CacheEntry<unknown>>()

export function useFetch<T = unknown>(options: UseFetchOptions = {}) {
  // default 5 minutes
  const { cache: useCache = true, cacheTTL = 5 * 60 * 1000 } = options

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
