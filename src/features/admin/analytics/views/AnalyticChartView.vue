<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import AppLayout from '@/components/partials/Layout.vue'

import AnalyticsTable from '../components/AnalyticsTable.vue'
import AnalyticsLineChart from '../components/AnalyticsLineChart.vue'
import AnalyticsHeatmap from '../components/AnalyticsHeatMap.vue'

import { usePagination } from '@/services/usePagination'
import { useMonitoringFilterStore } from '@/stores/monitoringFilter.ts'

import { useAnalyticsChart } from '../composables/useAnalyticsChart'
import { useAnalyticsChartState } from '../composables/useAnalyticsChartState'

const filterStore = useMonitoringFilterStore()

const { setAvailableEndpoints } = filterStore

const {
  startDate,
  endDate,
  endpoints,
} = storeToRefs(filterStore)

const chartViewMode = ref<'all' | 'sync'>('sync')

const activeViewMode = ref<'table' | 'line' | 'heatmap'>('table')


const {
  rawEndpoints,
  apiEndpoints,
  tableLoading,
} = useAnalyticsChart(
  () => startDate.value,
  () => endDate.value,
)

const {
  currentPage,
  totalPages,
  paginatedData,
  visiblePages,
  goToPage,
} = usePagination({
  items: rawEndpoints,
  itemsPerPage: 10,
  maxVisiblePages: 4,
})


const expandedRows = ref<(string | number)[]>([])
const latencySort = ref<'none' | 'asc' | 'desc'>('none')

const sortedTableEndpoints = computed(() => {
  const data = [...apiEndpoints.value]

  if (latencySort.value === 'asc') {
    return data.sort(
      (a, b) =>
        a.total_response_ms -
        b.total_response_ms,
    )
  }

  if (latencySort.value === 'desc') {
    return data.sort(
      (a, b) =>
        b.total_response_ms -
        a.total_response_ms,
    )
  }

  return data
})

const {
  currentPage: tableCurrentPage,
  totalPages: tableTotalPages,
  paginatedData: paginatedEndpoints,
  visiblePages: tableVisiblePages,
  goToPage: goToTablePage,
} = usePagination({
  items: sortedTableEndpoints,
  itemsPerPage: 10,
  maxVisiblePages: 4,
})

const toggleRow = (id: string | number,) => {
  if (expandedRows.value.includes(id)) {
    expandedRows.value =
      expandedRows.value.filter(
        rowId => rowId !== id,
      )
  } else {
    expandedRows.value = [
      ...expandedRows.value,
      id,
    ]
  }
}

const toggleLatencySort = () => {
  if (latencySort.value === 'none') {
    latencySort.value = 'desc'
    return
  }

  if (latencySort.value === 'desc') {
    latencySort.value = 'asc'
    return
  }
  latencySort.value = 'none'
}

const {
  option,
  heatmapOption,
} = useAnalyticsChartState(
  rawEndpoints,
  paginatedData,
  chartViewMode,
  endpoints,
)

watch(
  paginatedData,
  (data) => {
    const available = data
      .map((item) => item.endRoute)
      .filter(
        (route): route is string =>
          Boolean(route),
      )

    setAvailableEndpoints(available)

    const sameSelection =
      endpoints.value.length ===
        available.length &&
      endpoints.value.every(
        (endpoint, index) =>
          endpoint === available[index],
      )

    if (!sameSelection) {
      endpoints.value = [...available]
    }
  },
  {
    immediate: true,
    deep: true,
  },
)

watch(
  currentPage,
  () => {
    chartViewMode.value = 'sync'
  },
)

watch(
  [startDate, endDate],
  () => {
    expandedRows.value = []
    latencySort.value = 'none'
  },
)
</script>

<template>
  <AppLayout :analytics-view-mode="activeViewMode">
    <div class="column is-12">
      <div class="box white-card">

        <!-- =================================================
             HEADER
             ================================================= -->

        <div class="main-chart-header mb-4">

          <div>
            <h2 class="title is-5 mb-1">
              Analytics Dashboard
            </h2>

            <p class="subtitle is-7 text-muted">
              Monitor request trends and detailed API endpoints
            </p>
          </div>

          <!-- =================================================
               VIEW MODE
               ================================================= -->

          <div class="segmented-control">

            <button
              class="segmented-btn"
              :class="{
                active:
                  activeViewMode === 'table'
              }"
              @click="
                activeViewMode = 'table'
              "
            >
              Table
            </button>

            <button
              class="segmented-btn"
              :class="{
                active:
                  activeViewMode === 'line'
              }"
              @click="
                activeViewMode = 'line'
              "
            >
              Line Chart
            </button>

            <button
              class="segmented-btn"
              :class="{
                active:
                  activeViewMode === 'heatmap'
              }"
              @click="
                activeViewMode = 'heatmap'
              "
            >
              Heatmap
            </button>

          </div>
        </div>

        <!-- =================================================
             MAIN VIEW
             ================================================= -->

        <div class="dashboard-layout">

          <!-- =================================================
               TABLE
               ================================================= -->

          <AnalyticsTable
            v-if="activeViewMode === 'table'"
            :table-loading="tableLoading"
            :paginated-endpoints="paginatedEndpoints"
            :expanded-rows="expandedRows"
            :latency-sort="latencySort"
            :start-date="startDate"
            :end-date="endDate"
            :table-current-page="tableCurrentPage"
            :table-total-pages="tableTotalPages"
            :table-visible-pages="tableVisiblePages"
            @toggle-row="toggleRow"
            @toggle-latency-sort="toggleLatencySort"
            @go-to-table-page="goToTablePage"
          />

          <!-- =================================================
               LINE CHART
               ================================================= -->

          <AnalyticsLineChart
            v-if="activeViewMode === 'line'"
            v-model:chartViewMode="
              chartViewMode
            "
            :option="option"
            :current-page="currentPage"
            :total-pages="totalPages"
            :visible-pages="visiblePages"
            @go-to-page="goToPage"
          />

          <!-- =================================================
               HEATMAP
               ================================================= -->

          <AnalyticsHeatmap
            v-if="activeViewMode === 'heatmap'"
            :option="heatmapOption"
            :current-page="currentPage"
            :total-pages="totalPages"
            :visible-pages="visiblePages"
            @go-to-page="goToPage"
          />

        </div>

      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.text-muted {
  color: #64748b !important;
}

.main-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 1rem;
}

.segmented-control {
  display: flex;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 10px;
  gap: 4px;
}

.segmented-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: #64748b;
  white-space: nowrap;
}

.segmented-btn:hover {
  color: #1e293b;
}

.segmented-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow:
    0 2px 6px
    rgba(15, 23, 42, 0.08);
}

.dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

@media (max-width: 768px) {
  .main-chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
