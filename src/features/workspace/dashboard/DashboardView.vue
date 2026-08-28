<script setup lang="ts">
import { computed } from 'vue'

import AppLayout from '@/components/partials/Layout.vue'
import StatCard from '@/components/AppStatCard.vue'
import {
  Clock3,
  CircleCheck,
} from 'lucide-vue-next'

import { useDashboard } from './composables/useDashboard'
import { formatFlag, formatStatus } from '../utils/formatters'

import { useFlagConfig } from '../my-task/composables/useFlagConfig'

import { usePagination } from '@/services/usePagination'

const { flagConfig } = useFlagConfig()

const {
  loading,
  dashboardRows,
  pendingCount,
  totalCompleted,
} = useDashboard()

const {
  currentPage,
  totalPages,
  paginatedData,
  visiblePages,
  goToPage,
} = usePagination({
  items: dashboardRows,
  itemsPerPage: 10,
})

const tableStyle = computed(() => ({
  minHeight: paginatedData.value.length < 10 ? '810px' : 'auto',
}))
</script>

<template>
  <AppLayout>
    <div class="container is-fluid px-5 p-5">
      <h1 class="title is-4 has-text-weight-bold mb-3">
        Dashboard Overview
      </h1>

      <div class="columns is-variable is-2">
        <div class="column">
          <StatCard
            title="Pending Withdrawals"
            :value="pendingCount"
            :loading="loading"
            subtitle="Withdrawals requiring action"
            :icon="Clock3"
            type="warning"
          />
        </div>
        <div class="column">
          <StatCard
            title="Fully Resolved Withdrawals"
            :value="totalCompleted"
            :loading="loading"
            subtitle="All flagged actions completed"
            :icon="CircleCheck"
            type="success"
          />
        </div>
      </div>
    </div>

    <div class="columns is-variable is-3 mt-1">
      <div class="column is-12">
        <div class="box white-card">
          <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
            <div>
              <h2 class="title is-6 mb-1">
                Completed Tasks
              </h2>

              <p class="is-size-7 has-text-grey">
                Real-time view of completed tasks
              </p>
            </div>
          </div>

          <div class="modern-table-wrapper mt-4" :style="tableStyle">
            <div v-if="loading" class="table-loading">
              <div class="loader"></div>
            </div>
            <div class="table-container">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Flag</th>
                    <th>ID</th>
                    <!-- <th>Completed At</th> -->
                    <th class="has-text-right">Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="row in paginatedData" :key="row.withdrawal_id">
                    <!-- Flag -->
                    <td>
                      <div class="reason-list">
                        <div v-for="action in row.actions" :key="action.id" class="reason-item is-flex is-align-items-center" >
                          <component
                            :is="flagConfig[action.flag as keyof typeof flagConfig].icon"
                            :class="flagConfig[action.flag as keyof typeof flagConfig].class"
                            :size="16"
                            class="mr-2"
                          />
                          {{ formatFlag(action.flag) }}
                        </div>
                      </div>
                    </td>
                    <!-- Withdrawal ID -->
                    <td>
                      <span class="type-badge">{{ row.withdrawal_id }}</span>
                    </td>

                    <!-- Completed At -->
                    <!-- <td>
                      <div class="date-cell">
                        <div class="date">
                          {{ formatDate(row.created_at).date }}
                        </div>
                        <div class="time">
                          {{ formatDate(row.created_at).time }}
                        </div>
                      </div>
                    </td> -->

                    <!-- Status -->
                    <td class="has-text-right">
                      <span class="status-cell">
                        {{ formatStatus(row.status) }}
                      </span>
                    </td>
                  </tr>

                  <tr v-if="dashboardRows.length === 0">
                    <td colspan="4" class="has-text-centered has-text-grey p-5" >
                      No completed tasks found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="pagination-wrapper">
              <div class="page-info">
                Page {{ currentPage }} of {{ totalPages }}
              </div>

              <div class="page-numbers">
                <button
                  class="page-btn"
                  :disabled="currentPage === 1"
                  @click="goToPage(currentPage - 1)"
                >
                  Prev
                </button>

                <button
                  v-for="pageNumber in visiblePages"
                  :key="pageNumber"
                  class="page-number"
                  :class="{ active: currentPage === pageNumber }"
                  @click="goToPage(pageNumber)"
                >
                  {{ pageNumber }}
                </button>

                <button
                  class="page-btn"
                  :disabled="currentPage === totalPages"
                  @click="goToPage(currentPage + 1)"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Container adjustment for the main content area */
.container {
  padding-top: 0.1rem;
  background-color: #ffffff;
  border-radius: 15px;
}



/* Modern Table Wrapper */
.modern-table-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;

  min-height: 500px; /* or whatever looks good */

  background: #fff;
  border: 1px solid #f1f1f1;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,.04);

  overflow: hidden;
}
.table-container {
  flex: 1;
  overflow-x: auto;
  position: relative;
}

.table-loading {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  backdrop-filter: blur(2px);
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #ef4444;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Table */
.modern-table {
  width: 100%;
  min-width: 700px;
  border-collapse: collapse;
  font-size: 0.9rem;
  table-layout: auto;
}

/* Header */
.modern-table thead th {
  text-align: left;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9aa0a6;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

/* Body cells */
.modern-table tbody td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

/* Row hover */
.modern-table tbody tr:hover {
  background: #e1e6eb;
}

/* Alignment utility */


/* Type badge */
.type-badge {
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

/* Count badge */
.count-badge {
  background: #fee2e2;
  color: #dc2626;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

/* Value cell */
.value-cell {
  font-family: monospace;
  font-size: 0.85rem;
  color: #111827;
}

/* Status pill */
.status-pill {
  background: #facc15; /* orange warning */
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
}

/* ✅ Green */
.status-pill.verified {
  background: #facc15;
}

/* ❌ Red */
.status-pill.not-verified {
  background: #ffedd5; /* Light orange background */
  color: #ea580c;      /* Dark orange text */

}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.page-btn {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #111827;
  color: white;
  border-color: #111827;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: 0.2s ease;
}

.page-number:hover {
  background: #f3f4f6;
}
.page-number.active {
  background: #ef4444; /* red to match fingerprint risk */
  color: white;
  border-color: #ef4444;
  font-weight: 700;
  transform: scale(1.05);
}

/* Modern Action Button */
.action-btn {
  background: #3B82F6; ; /*  */
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #3B82F6;;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #0e5fe2;;
  border-color: #3B82F6;;
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(0);
  opacity: 0.85;
}

/* Filter Container */
.filter-container {
  position: relative;
}

/* Icon Button */
.filter-icon-btn {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-icon-btn:hover {
  background: #111827;
  color: #ffffff;
  border-color: #111827;
  transform: translateY(-1px);
}

/* Dropdown Panel */
.filter-dropdown {
  position: absolute;
  right: 0;
  top: 45px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f1f1;
  width: 160px;
  padding: 0.4rem;
  z-index: 100;
  animation: fadeIn 0.15s ease;
}

/* Dropdown Item */
.filter-item {
  padding: 0.6rem 0.8rem;
  font-size: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-item:hover {
  background: #f3f4f6;
}

.filter-item.active {
  background: #111827;
  color: #ffffff;
  font-weight: 600;
}

/* Small fade animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Controls wrapper */
.controls-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Search box */
.search-box {
  position: relative;
}

.search-box input {
  width: 220px;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #111827;
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
}

.search-box input:hover {
  border-color: #111827;
}


/* Type indicators container */
.type-indicators {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Base dot */
.type-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

/* Colors */
.type-dot.fingerprint {
  background: #ef4444; /* red */
}

.type-dot.cookie {
  background: #f59e0b; /* orange */
}

.type-dot.ip {
  background: #22c55e; /* green */
}
.total-btn {
  background: #f3f4f6;
  color: #374151;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.total-btn:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}



.icon {
  opacity: 0.9;
}

/* Colors */
.fingerprint-icon {
  color: #ef4444; /* red */
}

.cookie-icon {
  color: #f59e0b; /* orange */
}

.ip-icon {
  color: #22c55e; /* green */
}

.type-indicators {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-cell {
  padding: 12px 16px;
  vertical-align: middle;
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.user-id {
  font-weight: 600;
  color: #111827; /* Dark Slate */
  font-size: 0.9rem;
  letter-spacing: -0.01em;
}

.user-meta {
  font-size: 0.75rem;
  color: #6b7280; /* Muted Gray */
  font-family: 'Inter', ui-monospace, monospace;
}

.stat-header-lg {
  padding: 1.5rem 1.75rem !important;
}

.stat-header-lg :deep(.title) {
  font-size: 1.25rem;
}

.stat-header-lg :deep(.subtitle) {
  font-size: 0.85rem;
}

.status-cell {
  font-size: 0.82rem;
  font-weight: 500;
  color: #15803d; /* slate */
  white-space: nowrap;
}

.trigger-cell {
  color: #374151;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  font-weight: 600;
  font-size: 0.88rem;

  letter-spacing: -0.01em;
}
.reason-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reason-item {
  position: relative;
  padding-left: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
}

.reason-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2px;
  width: 3px;
  height: 14px;
  background-color: #6b7280; /* 🔴 red line */
  border-radius: 2px;
}

.flag-badge {
  background: #d60d28;
  color: #fdfdfd;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

.type-badge {
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

.date-cell {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.date {
  font-weight: 600;
  color: #111827;
  font-size: 0.88rem;
}

.time {
  font-size: 0.72rem;
  color: #6b7280;
}
</style>
