<script setup lang="ts">
  import { ref } from 'vue'
  import { LoaderCircle } from 'lucide-vue-next'
  import AppLayout from '@/components/partials/Layout.vue'
  import StatCard from '@/components/AppStatCard.vue'
  import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
  import { useConfirmDialog } from '@/composables/useConfirmDialog'
  import { useActionConfirm } from '@/composables/useActionConfirm'

  import { useWithdrawal } from './composables/useWithdrawal'
  import { useWithdrawalPagination } from './composables/useWithdrawalPagination'
  import { useTriggerConfig } from './composables/useTriggerConfig'
  import { useClaimAction } from './composables/useWithdrawalClaim'
  import type { ClaimActionPayload } from './withdrawal.type'
  import type { FormattedWithdrawalItem } from './withdrawal.type'

  import { getTriggerConfig, getGroupedTriggers, isAdditionalTrigger } from './utils/trigger.helper'
  import { getStatCardConfig } from './utils/statCard.helper'

  const {
    withdrawals,
    loading,
    stats,
    statsLoading,
    nextPage,
    previousPage,
    goToPage,
  } = useWithdrawal()

  const {
    triggerConfig
  } = useTriggerConfig()

  const {
    totalPages,
    currentPage,
    visiblePages
  } = useWithdrawalPagination(withdrawals)

  const {
    isOpen,
    title,
    message,
    variant,
    loading: confirmLoading,
    confirm,
    accept,
    close,
  } = useConfirmDialog()

  const {
    openActionConfirm,
  } = useActionConfirm({
    confirm,
    close,
  })

  const { claimAsync } = useClaimAction()

  const claimingId = ref<number | null>(null)

  const handleClaim = async (withdrawal: FormattedWithdrawalItem) => {
    const payload: ClaimActionPayload = {
      withdrawalId: withdrawal.id,
      flags: withdrawal.available_tasks,
      user_id: withdrawal.user_id,
    }

    claimingId.value = withdrawal.id

    try {
      await claimAsync(payload)
    } catch (error) {
      console.error(error)
    } finally {
      claimingId.value = null
    }
  }
</script>

<template>
  <AppLayout>
    <div class="container is-fluid px-5 p-4">
      <div class="columns is-variable is-2">
        <div class="column is-12 p-0">
          <div class="stat-cards-wrapper">
            <div
              v-for="(value, flag) in stats?.flags"
              :key="flag"
              class="stat-card-item"
            >
              <StatCard
                :title="getStatCardConfig(flag, triggerConfig).title"
                :value="value"
                :loading="statsLoading"
                :subtitle="`Total ${getStatCardConfig(flag, triggerConfig).title} Flag`"
                :icon="getStatCardConfig(flag, triggerConfig).icon"
                :type="getStatCardConfig(flag, triggerConfig).type"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="columns is-variable is-3 mt-1">
      <!-- User Risk Analysis -->
      <div class="column is-12">
        <div class="box white-card">

          <!-- Table Part -->
          <div class="modern-table-wrapper">
            <div v-if="loading" class="table-loading">
              <div class="loader"></div>
              <p>Loading withdrawals...</p>
            </div>

            <div class="table-container">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>WID</th>
                    <th>UID</th>
                    <th>Brand</th>
                    <th>Currency</th>
                    <th>KYC</th>
                    <th>FLAGS</th>
                    <th>Date Flagged</th>
                    <th class="has-text-right">Action</th>
                  </tr>
                </thead>

                <!-- Table Data -->
                <tbody>
                  <tr v-for="withdrawal in withdrawals?.items" :key="withdrawal.id">
                    <!-- WID -->
                    <td>
                      <span class="type-badge">
                        {{ withdrawal.withdrawal_id }}
                      </span>
                    </td>

                    <!-- UID -->
                    <td class="user-cell">
                      <div class="user-info">
                        <span class="user-id">
                          ID: {{ withdrawal.user_id }}
                        </span>
                        <span class="user-meta">
                          @ {{ withdrawal.user_name }}
                        </span>
                      </div>
                    </td>

                    <td class="user-cell">
                      <span class="user-id">
                        {{ withdrawal.brand }}
                      </span>
                    </td>

                    <td class="user-cell">
                      <span class="user-id">
                        {{ withdrawal.currency_type }}
                      </span>
                    </td>

                    <!-- KYC -->
                    <td>
                      <span
                        class="status-pill"
                        :class="{
                          'verified': withdrawal.account_group === 'Verified',
                          'not-verified': withdrawal.account_group === 'Not Verified'
                        }"
                      >
                        {{ withdrawal.account_group }}
                      </span>
                    </td>

                    <!-- Trigger -->
                    <td>
                      <div class="flag-icons-wrapper">
                        <template v-for="trigger in getGroupedTriggers(withdrawal.trigger, triggerConfig)" :key="trigger">
                          <div
                            v-if="getTriggerConfig(trigger, triggerConfig)"
                            :class="[
                              getTriggerConfig(trigger, triggerConfig)?.wrapperClass,
                              {
                                'flag-icon-additional': isAdditionalTrigger(
                                  trigger,
                                  triggerConfig
                                )
                              }
                            ]"
                            :title="trigger"
                          >
                            <component
                              :is="getTriggerConfig(trigger, triggerConfig)?.icon"
                              class="main-flag-icon"
                              :class="getTriggerConfig(trigger, triggerConfig)?.class"
                              :size="20"
                            />
                          </div>
                        </template>
                      </div>
                    </td>

                    <!-- Date -->
                    <td class="date-cell">
                      <div class="user-info">
                        <span class="user-id">
                          {{ withdrawal.formatted_date }}
                        </span>
                        <span class="user-meta">
                          {{ withdrawal.formatted_time }}
                        </span>
                      </div>
                    </td>

                    <!-- Action -->
                    <td class="has-text-right">
                      <button
                        class="action-btn"
                        :disabled="claimingId === withdrawal.id"
                        @click="
                          openActionConfirm(
                            'claim',
                            String(withdrawal.id),
                            () => handleClaim(withdrawal),
                            `Claim Withdrawal ${withdrawal.withdrawal_id}`,
                            'Are you sure you want to claim this withdrawal?',
                            'warning'
                          )
                        "
                      >
                        <template v-if="claimingId === withdrawal.id">
                          <LoaderCircle class="is-spinning" :size="16" />
                        </template>
                        <template v-else>
                          Claim
                        </template>
                      </button>
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
                  @click="previousPage"
                >
                  Prev
                </button>
                <button
                  v-for="pageNumber in visiblePages"
                  :key="pageNumber"
                  class="page-number"
                  :class="{
                    active: currentPage === pageNumber
                  }"
                  @click="goToPage(pageNumber)"
                >
                  {{ pageNumber }}
                </button>
                <button
                  class="page-btn"
                  :disabled="currentPage === totalPages"
                  @click="nextPage"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  min-height: 810px;
  background: #fff;
  border: 1px solid #f1f1f1;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,.04);
  overflow: hidden;
}

/* Scrollable Container ensures horizontal scroll triggers correctly */
.table-container {
  flex: 1;
  overflow-x: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
}

.table-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
}

.table-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 70px; /* leave pagination visible */
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
  to { transform: rotate(360deg); }
}

/* Table */
.modern-table {
  width: 100%;
  min-width: max-content; /* Forces table to stretch instead of squishing elements */
  border-collapse: collapse;
}

/* Header */
.modern-table thead th {
  position: sticky;
  top: 0;
  z-index: 5;
  text-align: left;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9aa0a6;
  padding: 1rem 1.25rem;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap; /* Prevents header text from wrapping */
}

/* Body cells */
.modern-table tbody td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
  white-space: nowrap; /* Essential to prevent pills and text from squeezing */
}

/* Row hover */
.modern-table tbody tr:hover {
  background: #f8fafc; /* Changed to a softer hover state */
}

/* Type badge */
.type-badge {
  display: inline-block;
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  white-space: nowrap;
}

/* Value cell */
.value-cell {
  font-family: monospace;
  font-size: 0.85rem;
  color: #111827;
}

/* Status pill - Fixed wrapping issue */
.status-pill {
  display: inline-block;
  background: #facc15;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  white-space: nowrap; /* Guarantees text stays on one line */
  text-align: center;
}

/* KYC Not Verified */
.status-pill.not-verified {
  background: #ffedd5;
  color: #ea580c;
}

/* KYC Verified (added just in case) */
.status-pill.verified {
  background: #d1fae5;
  color: #059669;
}

/* Modern Action Button */
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #22c55e;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #22c55e;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:hover:not(:disabled) {
  background: #16a34a;
  border-color: #16a34a;
  transform: translateY(-1px);
}

.action-btn:active:not(:disabled) {
  transform: translateY(0);
  opacity: 0.85;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Pagination */
.pagination-wrapper {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
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
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  font-weight: 700;
  transform: scale(1.05);
}

/* User cell adjustments */
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
  color: #111827;
  font-size: 0.9rem;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.user-meta {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: 'Inter', ui-monospace, monospace;
  white-space: nowrap;
}

.date-cell {
  font-size: 0.82rem;
  color: #6b7280;
  white-space: nowrap;
  font-weight: 500;
}

/* Flagged Trigger Colors */
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
  transition: all .2s ease;
}

.flag-icon-item:hover {
  transform: translateY(-2px);
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,.08);
}

.main-flag-icon {
  stroke-width: 2.2;
}

.multiple-account-icon { color: #22c55e; }
.bonus-abuse-icon { color: #eab308; }
.no-deposit-icon { color: #f97316; }
.arbitrage-icon { color: #ef4444; }

.flag-icon-additional {
  opacity: 0.6;
  transform: scale(0.9);
  background: #f1f5f9;
}

.flag-icon-additional:hover {
  opacity: 0.85;
  transform: scale(0.95);
}

/* Utility animation */
.is-spinning {
  animation: spin 1s linear infinite;
}

/* Responsive & Full-Width Dynamically-Stretched Stat Cards */
.stat-cards-wrapper {
  display: flex !important;
  flex-wrap: nowrap !important;
  width: 100% !important;
  gap: 1rem;
  overflow-x: auto !important;
  overflow-y: hidden;
  padding: 0.25rem 0.25rem 0.75rem;
  scrollbar-width: thin;
}

.stat-card-item {
  flex: 1 1 0px !important;    /* Dynamically stretches cards to fill 100% width when few exist */
  min-width: 240px !important; /* Minimum width threshold before horizontal scroll kicks in */
  max-width: 100% !important;  /* Allows 1 card to consume the entire row width */
}
</style>
