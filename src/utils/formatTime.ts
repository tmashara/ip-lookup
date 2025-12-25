export function formatTime(timestamp: number, timeZone: string | undefined) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour12: false,
      timeStyle: 'medium',
      timeZone,
    }).format(timestamp)
  } catch {
    return ''
  }
}
