<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { isValidIP } from '@/utils/isValidIP.ts'
import type { IPLookupResponse, Status } from '@/types'
import { useSynchronizedTime } from '@/composables/useSynchronizedTime.ts'
import { useFetch } from '@/composables/useFetch.ts'
import { API_URL } from '@/constants.ts'

interface Props {
  index: number
  handleRemove: (index: number) => void
}

const { handleRemove, index } = defineProps<Props>()

const ip = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const {
  execute,
  status: requestStatus,
  error: requestError,
  abort,
  data,
} = useFetch<IPLookupResponse>()

onUnmounted(() => {
  abort()
})

const validationError = ref<string>('')
const status = computed<Status>(() => (validationError.value ? 'error' : requestStatus.value))
const error = computed<string>(() => validationError.value ?? requestError.value ?? '')

const timezone = computed(() => data.value?.timezone.id)
const flagEmoji = computed(() => data.value?.flag?.emoji)
const country = computed(() => data.value?.country)

const { timezoneTime } = useSynchronizedTime(timezone)

async function performLookup() {
  // to reset state / abort requests
  abort()
  validationError.value = ''

  const normalizedIp = ip.value.trim()

  // do nothing on empty IP
  if (!normalizedIp) {
    return
  }

  if (!isValidIP(normalizedIp)) {
    validationError.value = 'Invalid IP address'
    return
  }

  await execute(`${API_URL}/${normalizedIp}`)
}

function handleBlur() {
  performLookup()
}

function onRemove() {
  handleRemove(index)
}

// clear validation error when input is cleared
watch(ip, (newValue) => {
  if (!newValue.trim()) {
    validationError.value = ''
  }
})

// autofocus input when component mounts
onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <div class="ip-lookup-input">
    <div class="row-label" :aria-label="`Row ${index + 1}`">{{ index + 1 }}</div>
    <input
      ref="inputRef"
      v-model="ip"
      type="text"
      class="ip-input"
      :class="{
        'ip-input--loading': status === 'loading',
        'ip-input--error': status === 'error',
        'ip-input--success': status === 'success',
      }"
      :disabled="status === 'loading'"
      :aria-label="`IP address input ${index + 1}`"
      :aria-describedby="status === 'error' ? `error-${index}` : undefined"
      :aria-invalid="status === 'error'"
      placeholder="e.g., 8.8.8.8 or 2001:4860:4860::8888"
      @blur="handleBlur"
    />

    <div class="content">
      <div v-if="status === 'loading'" class="loading-container" role="status" aria-live="polite">
        <div class="loading-spinner" aria-hidden="true"></div>
        Checking...
      </div>
      <div v-if="status === 'idle'" aria-live="polite">Blur to lookup</div>

      <div
        v-else-if="status === 'success' && country"
        class="result"
        role="status"
        aria-live="polite"
      >
        <span v-if="flagEmoji" class="flag" aria-hidden="true">{{ flagEmoji }}</span>
        {{ country }}
        <span class="time">{{ timezoneTime }}</span>
      </div>

      <div
        v-else-if="status === 'error'"
        :id="`error-${index}`"
        class="error-message"
        role="alert"
        aria-live="assertive"
      >
        {{ error }}
      </div>

      <button
        class="remove-btn"
        @click="onRemove"
        :aria-label="`Remove IP lookup ${index + 1}`"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <line x1="4" y1="4" x2="12" y2="12" />
          <line x1="12" y1="4" x2="4" y2="12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.content {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #666;
}

.ip-lookup-input {
  display: grid;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  grid-template-columns: 0.1fr 1.5fr 1fr;
}

.row-label {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
}

.ip-input {
  flex: 1;
  padding: 10px 14px;
  font-size: 14px;
  border: 2px solid #d0d0d0;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.ip-input:focus {
  border-color: #5eb8f5;
  box-shadow: 0 0 0 3px rgba(94, 184, 245, 0.1);
}

.ip-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.ip-input--loading {
  border-color: #5eb8f5;
}

.ip-input--error {
  border-color: #f44336;
}

.ip-input--success {
  border-color: #4caf50;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #5eb8f5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.result {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-grow: 1;
}

.flag {
  font-size: 24px;
  line-height: 1;
}

.time {
  font-size: 14px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  min-width: 65px;
  margin-left: auto;
}

.error-message {
  font-size: 13px;
  color: #f44336;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: color 0.2s ease;
  margin-left: auto;
}

.remove-btn:hover {
  color: #f44336;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .ip-lookup-input {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
  }

  .row-label {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .ip-input {
    padding: 12px 16px;
    font-size: 16px;
  }

  .remove-btn {
    padding: 8px;
    min-width: 44px;
    min-height: 44px;
  }

  .content {
    grid-column: 1 / -1;
    margin-left: 48px;
    font-size: 14px;
  }

  .error-message {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .ip-lookup-input {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .row-label {
    display: none;
  }

  .content {
    margin-left: 0;
    grid-column: auto;
  }

  .result {
    flex-wrap: wrap;
  }

  .time {
    margin-left: 0;
    min-width: auto;
  }
}
</style>
