import { computed, type Ref } from 'vue'
import type { EChartsOption } from 'echarts'

import { buildLineChart } from '@/features/admin/analytics/charts/lineChart'
import { buildHeatmap } from '@/features/admin/analytics/charts/heatmapChart'

import type { AnalyticsEndpoint } from '../analytic.type'

type ChartMode = 'all' | 'sync'


export function useAnalyticsChartState(
  rawEndpoints: Ref<AnalyticsEndpoint[]>,
  paginatedData: Ref<AnalyticsEndpoint[]>,
  chartViewMode: Ref<ChartMode>,
  endpoints: Ref<string[]>,
) {

  /* =========================================================
   * DATE HELPERS
   * ========================================================= */

  /**
   * Get date key from created_at.
   *
   * Example:
   *
   * 2026-08-13T11:36:41.017673+08:00
   *
   * becomes:
   *
   * 2026-08-13
   */
  const getDateKey = (
    createdAt: string
  ): string => {

    const date = new Date(createdAt)

    const year = date.getFullYear()

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0')

    const day = String(
      date.getDate()
    ).padStart(2, '0')

    return `${year}-${month}-${day}`
  }


  /**
   * Format date for chart display.
   *
   * Example:
   *
   * 2026-08-13
   *
   * becomes:
   *
   * Aug 13
   */
  const formatDateLabel = (
  dateKey: string
): string => {

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
      day: 'numeric',
    }
  )
}


  /**
   * Determine whether the data contains
   * more than one date.
   */
  const hasMultipleDates = (
    data: AnalyticsEndpoint[]
  ): boolean => {

    const dates = new Set<string>()

    data.forEach(endpoint => {

      endpoint.data.forEach(item => {

        if (!item.created_at) {
          return
        }

        dates.add(
          getDateKey(
            item.created_at
          )
        )

      })

    })

    return dates.size > 1
  }


  /* =========================================================
   * NORMALIZE LINE CHART DATA
   * ========================================================= */

  /**
   * Single date:
   *
   * Keep the original 24-hour data.
   *
   * 11:00 -> 66
   * 17:00 -> 3
   *
   *
   * Multiple dates:
   *
   * Group by endpoint + date.
   *
   * Aug 13 -> 69
   * Aug 14 -> 82
   * Aug 15 -> 45
   *
   * Counts from multiple times on the same date
   * are added together.
   */
  const normalizeChartData = (
    data: AnalyticsEndpoint[]
  ): AnalyticsEndpoint[] => {

    const multipleDates =
      hasMultipleDates(data)


    /*
     * =====================================================
     * SINGLE DATE
     * =====================================================
     *
     * Keep the original API structure.
     */
    if (!multipleDates) {
      return data
    }


    /*
     * =====================================================
     * MULTIPLE DATES
     * =====================================================
     */

    return data.map(endpoint => {

      const grouped = new Map<
        string,
        {
          count: number
          created_at: string
          updated_at: string
        }
      >()


      endpoint.data.forEach(item => {

        if (!item.created_at) {
          return
        }

        const dateKey =
          getDateKey(
            item.created_at
          )


        const existing =
          grouped.get(dateKey)


        /*
         * Existing date
         * ----------------
         * Add the request count.
         */
        if (existing) {

          existing.count += item.count


          /*
           * Keep the latest updated_at.
           */
          if (
            new Date(
              item.updated_at
            ).getTime() >
            new Date(
              existing.updated_at
            ).getTime()
          ) {

            existing.updated_at =
              item.updated_at

          }

          return
        }


        /*
         * First record for this date.
         */
        grouped.set(
          dateKey,
          {
            count: item.count,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }
        )

      })


      /*
       * Convert the grouped data back
       * into EndpointDataPoint[].
       *
       * The chart still reads `time`,
       * but it now contains the date label.
       */
      return {
        ...endpoint,

        data: Array
          .from(grouped.entries())

          .sort(
            ([dateA], [dateB]) =>
              dateA.localeCompare(dateB)
          )

          .map(
            ([dateKey, item]) => ({
              time:
                formatDateLabel(
                  dateKey
                ),

              count:
                item.count,

              created_at:
                item.created_at,

              updated_at:
                item.updated_at,
            })
          ),
      }
    })
  }


  /* =========================================================
   * HEATMAP DATA
   * ========================================================= */

  const filteredHeatmapData = computed(() => {

    return paginatedData.value.filter(
      endpoint =>
        endpoint.endRoute &&
        endpoints.value.includes(
          endpoint.endRoute
        )
    )

  })


  /* =========================================================
   * LINE CHART DATA
   * ========================================================= */

  const activeLineData = computed(() => {

    const source =
      chartViewMode.value === 'all'
        ? rawEndpoints.value
        : paginatedData.value


    const filteredSource =
      chartViewMode.value === 'all'
        ? source
        : source.filter(
            endpoint =>
              endpoint.endRoute &&
              endpoints.value.includes(
                endpoint.endRoute
              )
          )


    /*
     * Automatically determine:
     *
     * Single date
     *      ↓
     * 24-hour chart
     *
     * Multiple dates
     *      ↓
     * Date-range chart
     */
    return normalizeChartData(
      filteredSource
    )
  })


  /* =========================================================
   * CHART OPTIONS
   * ========================================================= */

  const option = computed<EChartsOption>(() => {

    return buildLineChart(
      activeLineData.value
    )
  })


  const heatmapOption = computed<EChartsOption>(() => {

    return buildHeatmap(
      filteredHeatmapData.value
    )
  })


  /* =========================================================
   * TABLE DATA
   * ========================================================= */

  const filteredTableData = computed(() => {

    return paginatedData.value.map(
      endpoint => {

        const filteredPoints =
          endpoint.data


        const totalRequests =
          filteredPoints.reduce(
            (sum, item) =>
              sum + item.count,
            0
          )


        const avgRequests =
          filteredPoints.length
            ? Number(
                (
                  totalRequests /
                  filteredPoints.length
                ).toFixed(2)
              )
            : 0


        return {
          ...endpoint,
          totalRequests,
          avgRequests,
        }

      }
    )
  })


  /* =========================================================
   * RETURN
   * ========================================================= */

  return {
    option,
    heatmapOption,
    filteredHeatmapData,
    filteredTableData,
  }
}
