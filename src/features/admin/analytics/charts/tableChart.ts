import type { AnalyticsEndpoint } from '../analytic.type'
import { ANALYTICS_TIME_RANGE, type AnalyticsTime } from '../constants/analytics.constant'

export interface AnalyticsTableRow {
  endpoint: string
  totalRequests: number
  avgRequests: number
}


export function buildTableData(
  data: AnalyticsEndpoint[],
  startTime: AnalyticsTime = '09:00',
  endTime: AnalyticsTime = '18:00',
  selectedEndpoints: string[] = []
): AnalyticsTableRow[] {

  /*
  |----------------------------------------------------------------------
  | FILTER TIME RANGE
  |----------------------------------------------------------------------
  */

  const startIndex = ANALYTICS_TIME_RANGE.indexOf(startTime)
  const endIndex = ANALYTICS_TIME_RANGE.indexOf(endTime)

  const validTimes =
    startIndex !== -1 &&
    endIndex !== -1 &&
    startIndex <= endIndex
      ? ANALYTICS_TIME_RANGE.slice(
          startIndex,
          endIndex + 1
        )
      : ANALYTICS_TIME_RANGE

  /*
  |----------------------------------------------------------------------
  | BUILD TABLE DATA
  |----------------------------------------------------------------------
  */

  return data.filter(
    item => {
      return (
        selectedEndpoints.length === 0 ||
        selectedEndpoints.includes(
          item.endRoute
        )
      )
    }
  )
  .map(
    item => {
      const filteredData = item.data.filter(
        point => validTimes.includes(
          point.time as AnalyticsTime
        )
      )

      const totalRequests = filteredData.reduce((sum, point) => sum + point.count, 0)
      const avgRequests = filteredData.length > 0 ? totalRequests / filteredData.length: 0

      return {
        endpoint: item.endRoute,
        totalRequests,
        avgRequests: Number(avgRequests.toFixed(2))
      }
    }
  )
}
