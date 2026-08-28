<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ShieldAlert,
  ShieldCheck,
} from 'lucide-vue-next'

import AppLayout from '@/components/partials/Layout.vue'
import StatCard from '@/components/AppStatCard.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useActionConfirm } from '@/composables/useActionConfirm'
import { usePagination } from '@/services/usePagination'

import { useMyTask } from './composables/useMyTask'
// import { getFlagInfo, useFlagConfig, getTaskFlagConfig } from './composables/useFlagConfig'
import { useFlagConfig, getTaskFlagConfig } from './composables/useFlagConfig'
import { formatFlag, formatStatus, formatDate } from '../utils/formatters'
import type { MyTaskRow } from '../task.types'

/* -------------------------------------------------------------------------- */
/* State & Composables */
/* -------------------------------------------------------------------------- */

const { dashboardRows, loading, solvingTaskId, pendingFlags, completedFlags, solveTask } = useMyTask()
const { flagConfig } = useFlagConfig()

// Pagination
const { currentPage, totalPages, paginatedData, visiblePages, goToPage } = usePagination({
  items: dashboardRows,
  itemsPerPage: 10
})

// Dynamic Table Height
const tableWrapperStyle = computed(() => ({
  minHeight: paginatedData.value.length < 10 ? '750px' : 'auto'
}))

// Confirm Dialog Setup
const {
  isOpen,
  title,
  message,
  variant,
  loading: confirmLoading,
  confirm,
  accept,
  close
} = useConfirmDialog()

const { openActionConfirm } = useActionConfirm({ confirm, close })

const getGroupedActions = (actions: MyTaskRow['actions']) => {
  const groups: Record<string, MyTaskRow['actions']> = {}

  for (const action of actions) {
    const config = getTaskFlagConfig(action.flag, flagConfig)

    if (!config) {
      continue
    }

    const groupKey = Object.entries(flagConfig).find(([, value]) => value === config.config)?.[0]

    if (!groupKey) {
      continue
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }

    groups[groupKey].push(action)
  }

  return Object.values(groups).flat()
}

/* -------------------------------------------------------------------------- */
/* Row Expansion & Actions */
/* -------------------------------------------------------------------------- */

const expandedRow = ref<number | null>(null)

function toggleRow(index: number) {
  expandedRow.value = expandedRow.value === index ? null : index
}

const openDetails = (row: MyTaskRow, selectedFlag?: string) => {
  sessionStorage.setItem(`review_${row.withdrawal_id}`, JSON.stringify(row))
  const flag = selectedFlag ?? row.actions[0]!.flag

  window.open(
    `/review/${flag}/${row.withdrawal_id}`,
    'reviewWindow',
    'width=1400,height=700'
  )
}
</script>

<template>
  <AppLayout>
    <!-- Header Banner -->
    <div class="columns is-variable is-2">
      <div class="column">
        <StatCard
          title="Pending Flags"
          :value="pendingFlags"
          :loading="loading"
          subtitle="Total flags requiring action"
          :icon="ShieldAlert"
          type="warning"
        />
      </div>
      <div class="column">
        <StatCard
          title="Completed Flags"
          :value="completedFlags"
          :loading="loading"
          subtitle="Total flags successfully resolved"
          :icon="ShieldCheck"
          type="success"
        />
      </div>
    </div>

    <!-- Active Tasks Content -->
    <div class="columns is-variable is-3">
      <div class="column is-12">
        <div class="box white-card">
          <!-- Table Header Section -->
          <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
            <div>
              <h2 class="title is-6 mb-1">Active Tasks</h2>
              <p class="is-size-7 has-text-grey">Real-time view of pending tasks</p>
            </div>
          </div>

          <!-- Main Table Container -->
          <div class="modern-table-wrapper mt-4" :style="tableWrapperStyle">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>WID</th>
                  <th>Flags</th>
                  <th>Date Claimed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(row, rowIndex) in paginatedData" :key="row.withdrawal_id">
                  <!-- Main Summary Row -->
                  <tr
                    class="transaction-row"
                    :class="{ 'transaction-row-expanded': expandedRow === rowIndex }"
                    @click="toggleRow(rowIndex)"
                  >
                    <!-- WID -->
                    <td>
                      <span class="type-badge">{{ row.withdrawal_id }}</span>
                    </td>

                    <!-- Flags -->
                    <td>
                      <div class="flag-icons-wrapper">
                        <div
                          v-for="action in getGroupedActions(row.actions)"
                          :key="action.id"
                          class="flag-icon-item"
                          :title="formatFlag(action.flag)"
                        >
                          <component
                            v-if="getTaskFlagConfig(action.flag, flagConfig)"
                            :is="getTaskFlagConfig(action.flag, flagConfig)!.config.icon"
                            class="main-flag-icon"
                            :class="[
                              getTaskFlagConfig(action.flag, flagConfig)!.config.class,
                              {
                                'main-flag-icon-additional':
                                  !getTaskFlagConfig(action.flag, flagConfig)!.isDefault
                              }
                            ]"
                            :size="20"
                          />
                        </div>
                      </div>
                    </td>

                    <!-- Date Claimed -->
                    <td>
                      <div class="date-cell">
                        <span class="date-main">{{ formatDate(row.created_at).date }}</span>
                        <span class="date-time">{{ formatDate(row.created_at).time }}</span>
                      </div>
                    </td>

                    <!-- Status -->
                    <td>
                      <span
                        class="status-indicator"
                        :class="{
                          'status-green': row.actions.every(
                            action => action.status === 'completed'
                          )
                        }"
                      >
                        {{
                          row.actions.some(
                            action => action.status === 'inprogress'
                          )
                            ? 'In Progress'
                            : 'Completed'
                        }}
                      </span>
                    </td>
                  </tr>

                  <!-- Expanded Details Row -->
                  <tr v-if="expandedRow === rowIndex" class="bets-expanded-row">
                    <td colspan="4" class="bets-expanded-cell">
                      <div class="bets-dropdown">
                        <div class="bets-table-wrapper">
                          <table class="bets-table">
                            <thead>
                              <tr>
                                <th>Flag Type</th>
                                <!-- <th>Trigger</th> -->
                                <th>Status</th>
                                <th>Details</th>
                                <th class="has-text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="action in row.actions" :key="action.id">
                                <!-- Flag Type -->
                                <td>
                                  <span class="flag-badge">
                                    {{ formatFlag(action.flag) }}
                                  </span>
                                </td>

                                <!-- Trigger -->
                                <!-- <td>
                                  <div
                                    class="trigger-list"
                                    :class="{ 'trigger-list-vertical': action.flag === 'multiple_account' }"
                                  >
                                    <template
                                      v-for="item in getFlagInfo(action.flag, action.session)"
                                      :key="item.key"
                                    >
                                      <span
                                        v-if="action.flag === 'multiple_account'"
                                        :class="`trigger-reason-${item.key}`"
                                      >
                                        {{ item.label }}
                                      </span>

                                      <template v-else>
                                        <component
                                          v-if="item.icon"
                                          :is="item.icon"
                                          class="trigger-icon"
                                          :class="`${item.key}-icon`"
                                          :size="18"
                                        />

                                        <span
                                          v-else
                                          :class="
                                            ['bonus_abuse', 'no_deposit'].includes(action.flag)
                                              ? 'trigger-reason-orange'
                                              : 'trigger-badge'
                                          "
                                        >
                                          {{ item.label }}
                                        </span>
                                      </template>
                                    </template>
                                  </div>
                                </td> -->

                                <!-- Status -->
                                <td>
                                  <span
                                    class="status-indicator"
                                    :class="{ 'status-green': action.status === 'completed' }"
                                  >
                                    {{ formatStatus(action.status) }}
                                  </span>
                                </td>

                                <!-- View Details -->
                                <td>
                                  <button class="count-btn" @click.stop="openDetails(row, action.flag)">
                                    View
                                  </button>
                                </td>

                                <!-- Solve Action -->
                                <td class="has-text-right">
                                  <button
                                    class="action-btn"
                                    :class="{ 'action-btn-completed': action.status === 'completed' }"
                                    :disabled="solvingTaskId !== null || !action.can_complete"
                                    @click.stop="
                                      openActionConfirm(
                                        'solve',
                                        String(action.id),
                                        () => solveTask(action.id),
                                        'Solve Task',
                                        'Are you sure you want to mark this task as solved?',
                                        'success'
                                      )
                                    "
                                  >
                                    <span v-if="solvingTaskId === action.id" class="button-loader"></span>
                                    <span v-else-if="action.status === 'completed'">Completed</span>
                                    <span v-else>Solve</span>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>

                <!-- Empty State -->
                <tr v-if="paginatedData.length === 0">
                  <td colspan="4" class="has-text-centered has-text-grey p-5">
                    No active tasks found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
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
                v-for="page in visiblePages"
                :key="page"
                class="page-number"
                :class="{ active: currentPage === page }"
                @click="goToPage(page)"
              >
                {{ page }}
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

    <!-- Confirm Modal -->
    <ConfirmDialog
      :show="isOpen"
      :title="title"
      :message="message"
      :loading="confirmLoading"
      :variant="variant"
      @confirm="accept"
      @cancel="close"
    />
  </AppLayout>
</template>

<style scoped>
/* -------------------------------------------------------------------------- */
/* Header Banner */
/* -------------------------------------------------------------------------- */
.stat-header-lg {
  padding: 1.5rem 1.75rem !important;
}

.stat-header-lg :deep(.title) {
  font-size: 1.25rem;
}

.stat-header-lg :deep(.subtitle) {
  font-size: 0.85rem;
}

/* -------------------------------------------------------------------------- */
/* Main Table */
/* -------------------------------------------------------------------------- */
.modern-table-wrapper {
  background: #ffffff;
  border-radius: 16px;
  position: relative;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f1f1;
  overflow-x: auto;
  width: 100%;
}

.modern-table {
  width: 100%;
  min-width: 700px;
  border-collapse: collapse;
  font-size: 0.9rem;
}

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

.modern-table tbody td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

.modern-table tbody tr.transaction-row {
  cursor: pointer;
  transition: background 0.15s ease;
}

.modern-table tbody tr.transaction-row:hover {
  background: #f8fafc;
}

/* -------------------------------------------------------------------------- */
/* Badges & Text Styling */
/* -------------------------------------------------------------------------- */
.type-badge {
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

.flag-badge {
  background: #d60d28;
  color: #ffffff;
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

.date-main {
  font-size: 0.8rem;
  font-weight: 600;
  color: #111827;
}

.date-time {
  font-size: 0.72rem;
  color: #9ca3af;
}

/* Status Indicator */
.status-indicator {
  position: relative;
  padding-left: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #2563eb;
}

.status-indicator::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  width: 3px;
  height: 14px;
  background-color: #2563eb;
  border-radius: 2px;
}

.status-indicator.status-green {
  color: #16a34a;
}

.status-indicator.status-green::before {
  background-color: #16a34a;
}

/* -------------------------------------------------------------------------- */
/* Flag Icons & Triggers */
/* -------------------------------------------------------------------------- */
.flag-icons-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flag-icon-item {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.flag-icon-item:hover {
  transform: translateY(-2px);
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.main-flag-icon {
  stroke-width: 2.2;
}

.multiple-account-icon { color: #22c55e; }
.bonus-abuse-icon { color: #eab308; }
.no-deposit-icon { color: #f97316; }
.arbitrage-icon { color: #ef4444; }

.trigger-list {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trigger-reason-orange {
  position: relative;
  padding-left: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #d97706;
}

.trigger-reason-orange::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  width: 3px;
  height: 14px;
  background-color: #f59e0b;
  border-radius: 2px;
}

/* -------------------------------------------------------------------------- */
/* Expanded Nested Table */
/* -------------------------------------------------------------------------- */
.bets-expanded-row {
  background: #fafafa;
}

.bets-expanded-cell {
  padding: 0 !important;
}

.bets-dropdown {
  padding: 14px 16px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.bets-table-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  overflow: auto;
}

.bets-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.bets-table th {
  padding: 10px;
  background: #f8fafc;
  font-size: 10px;
  text-transform: uppercase;
  color: #64748b;
  text-align: left;
}

.bets-table td {
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

/* -------------------------------------------------------------------------- */
/* Action Buttons */
/* -------------------------------------------------------------------------- */
.count-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #eef2ff;
  color: #4b5563;
  border: 1px solid #c7d2fe;
  cursor: pointer;
  transition: all 0.2s ease;
}

.count-btn:hover {
  background: #ffffff;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.action-btn {
  background: #22c55e;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.45rem 0.9rem;
  min-width: 70px;
  border-radius: 8px;
  border: 1px solid #22c55e;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background: #16a34a;
  border-color: #16a34a;
  transform: translateY(-1px);
}

.action-btn:disabled {
  background: transparent;
  color: #cbd5e1;
  border-color: #e2e8f0;
  cursor: not-allowed;
}

.action-btn.action-btn-completed,
.action-btn.action-btn-completed:disabled {
  background: #dcfce7;
  color: #15803d;
  border-color: #bbf7d0;
  cursor: default;
  opacity: 1;
}

.button-loader {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: button-spin 0.7s linear infinite;
}

@keyframes button-spin {
  to { transform: rotate(360deg); }
}

/* -------------------------------------------------------------------------- */
/* Pagination */
/* -------------------------------------------------------------------------- */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.page-btn,
.page-number {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled),
.page-number:hover {
  background: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number.active {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
  font-weight: 700;
}
.trigger-reason-fingerprint {
  position: relative;
  padding-left: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #dc2626;
}

.trigger-reason-fingerprint::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  width: 3px;
  height: 14px;
  background-color: #ef4444;
  border-radius: 2px;
}

.trigger-reason-cookies {
  position: relative;
  padding-left: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #ca8a04;
}

.trigger-reason-cookies::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  width: 3px;
  height: 14px;
  background-color: #eab308;
  border-radius: 2px;
}

.trigger-reason-ip {
  position: relative;
  padding-left: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #16a34a;
}

.trigger-reason-ip::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  width: 3px;
  height: 14px;
  background-color: #22c55e;
  border-radius: 2px;
}
.trigger-list {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trigger-list-vertical {
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.main-flag-icon-additional {
  filter: brightness(0.7);
  opacity: 0.85;
}
</style>
