import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import {
  getChartEndpoints,
  getTableEndpoints
} from '../api/analytics.api'

import type {
  AnalyticsEndpoint,
  ApiEndpoint,
  EndpointAnalytics
} from '../analytic.type'

export function useAnalyticsChart(
  startDate: () => string,
  endDate: () => string
) {
  /* =========================================================
     TABLE QUERY
     ========================================================= */

  const tableQuery = useQuery<ApiEndpoint[]>({
    queryKey: computed(() => [
      'analytics-table',
      startDate(),
      endDate()
    ]),

    queryFn: async (): Promise<ApiEndpoint[]> => {
      const response = await getTableEndpoints(
        startDate(),
        endDate()
      )

      return response.data
        .sort(
          (
            a: EndpointAnalytics,
            b: EndpointAnalytics
          ) =>
            b.total_count - a.total_count
        )
        .map(
          (
            item: EndpointAnalytics,
            index: number
          ): ApiEndpoint => ({
            id: index + 1,
            method: item.request_type,
            endpoint: item.endpoint,
            total_count: item.total_count,
            total_response_ms: item.total_response_ms,
            date: item.last_called_at,
            payloadKeys: item.payload
          })
        )
    },

    enabled: computed(
      () =>
        Boolean(startDate()) &&
        Boolean(endDate())
    ),

    staleTime: 1000 * 60 * 5
  })

  /* =========================================================
     CHART / HEATMAP QUERY
     ========================================================= */

  const chartQuery = useQuery<AnalyticsEndpoint[]>({
    queryKey: computed(() => [
      'analytics-chart',
      startDate(),
      endDate()
    ]),

    queryFn: async () => {
      const response = await getChartEndpoints(
        startDate(),
        endDate()
      )

      return response.data
    },

    select: (data) =>
      data.map((endpoint) => {
        const totalRequests = endpoint.data.reduce(
          (sum, item) => sum + item.count,
          0
        )

        return {
          ...endpoint,

          endRoute: endpoint.endpoint
            .split('/')
            .filter(Boolean)
            .slice(-2)
            .join('/'),

          totalRequests,

          avgRequests: endpoint.data.length
            ? Number(
                (
                  totalRequests /
                  endpoint.data.length
                ).toFixed(2)
              )
            : 0
        }
      }),

    enabled: computed(
      () =>
        Boolean(startDate()) &&
        Boolean(endDate())
    ),

    staleTime: 1000 * 60 * 5
  })

  /* =========================================================
     RETURN
     ========================================================= */

  return {
    /* ---------------------------------------------------------
       TABLE
    --------------------------------------------------------- */

    apiEndpoints: computed(
      () => tableQuery.data.value ?? []
    ),

    tableLoading: tableQuery.isLoading,

    tableError: tableQuery.error,

    refetchTable: tableQuery.refetch,

    /* ---------------------------------------------------------
       CHART / HEATMAP
    --------------------------------------------------------- */

    rawEndpoints: computed(
      () => chartQuery.data.value ?? []
    ),

    chartLoading: chartQuery.isLoading,

    chartError: chartQuery.error,

    refetchChart: chartQuery.refetch,

    /* ---------------------------------------------------------
       COMBINED
    --------------------------------------------------------- */

    loading: computed(
      () =>
        tableQuery.isLoading.value ||
        chartQuery.isLoading.value
    ),

    error: computed(
      () =>
        tableQuery.error.value ??
        chartQuery.error.value
    )
  }
}
