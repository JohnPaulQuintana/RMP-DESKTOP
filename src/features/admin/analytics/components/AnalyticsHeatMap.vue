<script setup lang="ts">
import { ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'

import type { ECharts, EChartsOption } from 'echarts'

interface EChartComponent extends ComponentPublicInstance {
  getEchartsInstance(): ECharts
}

defineProps<{
  option: EChartsOption
  currentPage: number
  totalPages: number
  visiblePages: number[]
}>()

const emit = defineEmits<{
  (e: 'goToPage', page: number): void
}>()

const heatmapChart = ref<EChartComponent | null>(null)

defineExpose({
  getEchartsInstance: () =>
    heatmapChart.value?.getEchartsInstance(),
})
</script>

<template>
  <div class="heatmap-container">
    <div class="dashboard-card heatmap-card mb-4">
      <div class="chart-header-controls pt-3">
        <h3 class="chart-card-title">
          Endpoint Request Heatmap
        </h3>
      </div>

      <div class="heatmap-wrapper">
        <v-chart
          ref="heatmapChart"
          class="heatmap-chart expanded-chart"
          :option="option"
          autoresize
        />
      </div>
    </div>

    <!-- Chart Pagination -->
    <div class="dashboard-card pagination-card">
      <div class="pagination-wrapper">
        <div class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </div>

        <div class="page-numbers">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="emit('goToPage', currentPage - 1)"
          >
            Prev
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            class="page-number"
            :class="{ active: currentPage === page }"
            @click="emit('goToPage', page)"
          >
            {{ page }}
          </button>

          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="emit('goToPage', currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
}

.chart-header-controls {
  padding: 1rem 1.25rem 0;
}

.chart-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #334155;
}

.heatmap-wrapper {
  width: 100%;
  padding: 0.75rem 1rem 1.25rem;
}

.heatmap-chart.expanded-chart {
  height: 58vh;
  min-height: 420px;
  width: 100%;
}

.pagination-card {
  overflow: hidden;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.25rem;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.page-info {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-btn,
.page-number {
  padding: 0.4rem 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled),
.page-number:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.page-number.active {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
  font-weight: 700;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
