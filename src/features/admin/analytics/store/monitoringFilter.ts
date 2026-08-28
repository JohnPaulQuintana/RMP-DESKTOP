import { defineStore } from 'pinia'
import type { AnalyticsTime } from '@/features/admin/analytics/constants/analytics.constant'

const today = new Date().toISOString().split('T')[0]

interface MonitoringFilterState {
  date: string | null
  startTime: AnalyticsTime
  endTime: AnalyticsTime
  endpoints: string[]
  availableEndpoints: string[]
}
export const useMonitoringFilterStore = defineStore('monitoringFilter', {
  state: (): MonitoringFilterState  => ({
    date: today as string | null,
    startTime: '09:00' as AnalyticsTime,
    endTime: '18:00' as AnalyticsTime,
    endpoints: [] as string[],
    availableEndpoints: [] as string[]
  }),

  actions: {
    updateFilters(payload: {
      date: string
      startTime: AnalyticsTime
      endTime: AnalyticsTime
      endpoints: string[]
    }) {
      this.date = payload.date
      this.startTime = payload.startTime
      this.endTime = payload.endTime
      this.endpoints = payload.endpoints
    },

    setAvailableEndpoints(endpoints: string[]) {
      this.availableEndpoints = [...new Set(endpoints)].sort()
    }
  }
})
