export interface IPLookupResponse {
  success: boolean
  ip: string
  country: string
  country_code: string
  timezone: {
    id: string
    offset: number
  }
  flag?: {
    emoji?: string
  }
  message?: string
}

export type Status = 'idle' | 'loading' | 'success' | 'error'
