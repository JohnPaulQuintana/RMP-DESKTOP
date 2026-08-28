import { defineStore } from 'pinia'

const today =
  new Date().toISOString().split('T')[0] ?? ''

interface MonitoringFilterState {
  startDate: string
  endDate: string
  endpoints: string[]
  availableEndpoints: string[]
}

export const useMonitoringFilterStore = defineStore(
  'monitoringFilter',
  {
    state: (): MonitoringFilterState => ({
      startDate: today,
      endDate: today,
      endpoints: [],
      availableEndpoints: []
    }),

    actions: {
      updateFilters(payload: {
        startDate: string
        endDate: string
        endpoints: string[]
      }) {
        this.startDate = payload.startDate
        this.endDate = payload.endDate
        this.endpoints = [...payload.endpoints]
      },

      updateDateRange(
        startDate: string,
        endDate: string
      ) {
        this.startDate = startDate
        this.endDate = endDate
      },

      setEndpoints(endpoints: string[]) {
        this.endpoints = [...endpoints]
      },

      setAvailableEndpoints(
        endpoints: string[]
      ) {
        this.availableEndpoints = [
          ...new Set(endpoints)
        ].sort()
      },

      clearEndpoints() {
        this.endpoints = []
      }
    }
  }
)
