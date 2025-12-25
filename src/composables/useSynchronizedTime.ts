import { ref, onMounted, onUnmounted, computed, type Ref } from 'vue'
import { formatTime } from '@/utils/formatTime.ts'

// global timer to sync all clocks
let intervalId: number | null = null
let subscriberCount = 0
const time = ref(Date.now())

export function useSynchronizedTime(timezone: Ref<string | undefined>) {
  onMounted(() => {
    subscriberCount++

    if (intervalId !== null) {
      return
    }

    // start global timer only once
    intervalId = setInterval(() => {
      time.value = Date.now()
    }, 1000)
  })

  onUnmounted(() => {
    subscriberCount--

    // clear global timer when no more subscribers
    if (subscriberCount === 0 && intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  })

  const timezoneTime = computed(() => formatTime(time.value, timezone.value))

  return {
    time,
    timezoneTime,
  }
}
