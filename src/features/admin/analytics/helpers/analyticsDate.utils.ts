import type { AnalyticsEndpoint } from '../analytic.type'

export function getDateKey(createdAt: string): string {
  const date = new Date(createdAt)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}


export function formatDateLabel(dateKey: string): string {
  const parts = dateKey.split('-')

  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])

  const date = new Date(
    year,
    month - 1,
    day
  )

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric'
    }
  )
}


export function getUniqueDates(data: AnalyticsEndpoint[]): string[] {
  const dates = new Set<string>()
  data.forEach(endpoint => {
    endpoint.data.forEach(point => {
      if (!point.created_at) {
        return
      }

      dates.add(
        getDateKey(
          point.created_at
        )
      )
    })
  })

  return Array
    .from(dates)
    .sort()
}


export function hasMultipleDates(data: AnalyticsEndpoint[]): boolean {
  return getUniqueDates(data).length > 1
}
