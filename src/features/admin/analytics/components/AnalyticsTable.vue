<script setup lang="ts">
import type { ApiEndpoint } from '../analytic.type'

import { formatResponseTime } from '@/utils/timeFormat'

defineProps<{
  tableLoading: boolean
  paginatedEndpoints: ApiEndpoint[]
  expandedRows: (string | number)[]
  latencySort: string
  startDate: string
  endDate: string
  tableCurrentPage: number
  tableTotalPages: number
  tableVisiblePages: number[]
}>()

const emit = defineEmits<{
  (e: 'toggleRow', id: string | number): void
  (e: 'toggleLatencySort'): void
  (e: 'goToTablePage', page: number): void
}>()

const getResponseClass = (ms: number) => {
  const seconds = ms / 1000
  const minutes = seconds / 60

  if (minutes < 1) return 'fast'
  if (minutes <= 5) return 'medium'

  return 'slow'
}
</script>

<template>
  <div class="dashboard-card table-card full-width-table">
    <div class="table-scroll-wrapper">
      <div v-if="tableLoading" class="table-loading">
        <div class="loader"></div>
      </div>

      <div class="table-content">
        <div class="table-horizontal-scroll">
          <table class="modern-table">
            <thead>
              <tr>
                <th style="width: 50px;">Schema</th>
                <th style="width: 100px;">Method</th>
                <th>Endpoint Route</th>
                <th>Requests</th>
                <th class="latency-header">
                  <div class="latency-sort-trigger" @click="emit('toggleLatencySort')">
                    <span>Response Time</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="latency-filter-icon"
                      :class="{ active: latencySort !== 'none' }"
                    >
                      <path d="m21 16-4 4-4-4"/>
                      <path d="M17 20V4"/>
                      <path d="m3 8 4-4 4 4"/>
                      <path d="M7 4v16"/>
                    </svg>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              <template v-for="item in paginatedEndpoints" :key="item.id">
                <tr
                  class="clickable-row"
                  :class="{ 'row-is-active': expandedRows.includes(item.id) }"
                  @click="emit('toggleRow', item.id)"
                >
                  <td class="has-text-centered vertical-center">
                    <svg
                      class="row-arrow"
                      :class="{ 'rotate-90 text-danger': expandedRows.includes(item.id) }"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </td>

                  <td class="vertical-center">
                    <span class="tag method-tag font-mono" :class="`is-${item.method.toLowerCase()}`">
                      {{ item.method.toUpperCase() }}
                    </span>
                  </td>

                  <td class="vertical-center">
                    <div class="endpoint-container">
                      <div class="endpoint-icon">⚡</div>
                      <div class="endpoint-details">
                        <span
                          class="endpoint-route"
                          :class="{ 'endpoint-route-active': expandedRows.includes(item.id) }"
                        >
                          {{ item.endpoint }}
                        </span>
                        <span class="endpoint-description">Risk Analysis Service</span>
                      </div>
                    </div>
                  </td>

                  <td class="vertical-center">
                    <span class="tag is-success is-light">
                      {{ item.total_count.toLocaleString() }}
                    </span>
                  </td>

                  <td class="vertical-center">
                    <span
                      class="response-time"
                      :class="getResponseClass(item.total_response_ms)"
                    >
                      {{ formatResponseTime(item.total_response_ms) }}
                    </span>
                  </td>
                </tr>

                <!-- Schema Expansion Row -->
                <tr v-if="expandedRows.includes(item.id)" class="dropdown-inspection-row">
                  <td colspan="6" class="p-0 border-none">
                    <div class="payload-wrapper">
                      <div class="schema-header">
                        <div class="schema-title">Data Schema</div>
                        <div class="schema-subtitle">Available Fields · {{ item.payloadKeys.length }}</div>
                      </div>

                      <div class="field-container">
                        <span
                          v-for="key in item.payloadKeys"
                          :key="key"
                          class="field-tag"
                        >
                          {{ key }}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Table Pagination -->
      <div class="pagination-wrapper">
        <div class="page-info">
          Page {{ tableCurrentPage }} of {{ tableTotalPages }}
        </div>

        <div class="page-numbers">
          <button
            class="page-btn"
            :disabled="tableCurrentPage === 1"
            @click="emit('goToTablePage', tableCurrentPage - 1)"
          >
            Prev
          </button>

          <button
            v-for="page in tableVisiblePages"
            :key="page"
            class="page-number"
            :class="{ active: tableCurrentPage === page }"
            @click="emit('goToTablePage', page)"
          >
            {{ page }}
          </button>

          <button
            class="page-btn"
            :disabled="tableCurrentPage === tableTotalPages"
            @click="emit('goToTablePage', tableCurrentPage + 1)"
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

.full-width-table { width: 100%; }

.table-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-scroll-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-loading {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loader {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #ef4444;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.table-content { flex: 1; overflow: auto; min-height: 0; }
.table-horizontal-scroll { width: 100%; overflow-x: auto; }

.modern-table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
}

.modern-table thead th {
  padding: 0.85rem 1rem;
  background: #fafafa;
  border-bottom: 1px solid #eef2f7;
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.modern-table tbody td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f8fafc;
  vertical-align: middle;
  white-space: nowrap;
}

.clickable-row { cursor: pointer; transition: background 0.15s ease; }
.clickable-row:hover { background: #fafafa; }
.clickable-row.row-is-active { background: #fffafb !important; }

.row-arrow { color: #94a3b8; transition: transform 0.2s ease; }
.rotate-90 { transform: rotate(90deg); }
.text-danger { color: #f14668 !important; }

.method-tag {
  width: 60px;
  justify-content: center;
  font-size: 0.65rem !important;
  font-weight: 800;
}

.method-tag.is-post { background: #eef2ff; color: #4f46e5; }
.method-tag.is-get { background: #ecfdf5; color: #059669; }
.method-tag.is-put { background: #fff7ed; color: #ea580c; }
.method-tag.is-delete { background: #fef2f2; color: #dc2626; }

.endpoint-container { display: flex; align-items: center; gap: 10px; }

.endpoint-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(241, 70, 104, 0.12);
  color: #f14668;
  font-size: 12px;
}

.endpoint-route {
  display: block;
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 600;
  color: #0f172a;
}

.endpoint-route-active { color: #f14668; }
.endpoint-description { color: #94a3b8; font-size: 0.68rem; }

.latency-header { white-space: nowrap; }
.latency-sort-trigger { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
.latency-filter-icon { opacity: 0.45; transition: all 0.2s ease; }
.latency-filter-icon.active { opacity: 1; color: #f14668; }

.response-time {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
}

.response-time.fast { background: #ecfdf5; color: #059669; }
.response-time.medium { background: #fffbeb; color: #d97706; }
.response-time.slow { background: #fef2f2; color: #dc2626; }

.payload-wrapper {
  margin-left: 40px;
  padding: 1rem 1.5rem;
  border-left: 3px solid #f14668;
  background: #fafafa;
}

.schema-title { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #475569; }
.schema-subtitle { font-size: 0.75rem; color: #94a3b8; }

.field-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }

.field-tag {
  padding: 6px 12px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 600;
  color: #334155;
}

.pagination-wrapper {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.25rem;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.page-info { font-size: 0.8rem; font-weight: 600; color: #64748b; }
.page-numbers { display: flex; gap: 0.5rem; }

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

.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
