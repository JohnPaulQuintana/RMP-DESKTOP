export interface EndpointDataPoint {
  time: string
  count: number
  created_at: string
  updated_at: string
}
export interface AnalyticsEndpoint {
  endpoint: string
  data: EndpointDataPoint[]
  endRoute: string
  totalRequests?: number
  avgRequests?: number
}
export interface EndpointAnalytics {
  endpoint: string
  request_type: 'get' | 'post' | 'put' | 'patch' | 'delete'
  total_count: number
  total_response_ms: number
  payload: string[]
  last_called_at: string
}
export interface ApiEndpoint {
  id: number
  method: EndpointAnalytics['request_type']
  endpoint: string
  total_count: number
  total_response_ms: number
  date: string
  payloadKeys: string[]
}
export interface AnalyticsResponse<T> {
  success: boolean
  message: string
  data: T
}
