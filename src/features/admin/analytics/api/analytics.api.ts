import api from '@/services/axios'

import type { AnalyticsResponse, EndpointAnalytics, AnalyticsEndpoint } from '../analytic.type'

const API_URL = 'endpoints'

export const getTableEndpoints = async (startDate: string,endDate: string): Promise<AnalyticsResponse<EndpointAnalytics[]>> => {
  const response = await api.get<AnalyticsResponse<EndpointAnalytics[]>>(
    API_URL, {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    }
  )
  return response.data
}


export const getChartEndpoints = async (
  startDate: string,
  endDate: string
): Promise<AnalyticsResponse<AnalyticsEndpoint[]>> => {
  const response = await api.get<
    AnalyticsResponse<AnalyticsEndpoint[]>
  >(`${API_URL}/trends`, {
    params: {
      start_date: startDate,
      end_date: endDate
    }
  })

  return response.data
}
