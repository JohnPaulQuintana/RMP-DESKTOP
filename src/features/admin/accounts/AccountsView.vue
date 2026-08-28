<script setup lang="ts">
  import { ref } from 'vue'
  import AppLayout from '@/components/partials/Layout.vue'
  import BaseTable from '@/components/base/BaseTable.vue'
  import ResetPasswordModal from './components/ResetPasswordModal.vue'
  import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
  import { useAccounts } from './composables/useAccounts'
  import { useAccountActions } from './composables/useAccountsAction'
  import { useConfirmDialog } from '@/composables/useConfirmDialog'
  import { useActionConfirm } from '@/composables/useActionConfirm'
  import { formatDate } from '@/utils/dateFormat'

  // Fetching state and data
  const {
    loading,
    currentFilter,
    filteredRegistrations,
  } = useAccounts()

  // Account actions logic
  const {
    isProcessing,
    // isResetting,
    approveUser,
    blockUser,
    // resetPassword
  } = useAccountActions()

  // Confirmation dialog setup
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

  // Action confirmation helper
  const { openActionConfirm } = useActionConfirm({
    confirm,
    close
  })

  // Reset password modal state
  const showResetModal = ref(false)
  const resetLink = ref('')
  const resetEmail = ref('')

  // Handle the reset password action
  // const handleResetPassword = async (email:string) => {
  //   const result = await resetPassword(email)

  //   if(result?.success){
  //     resetLink.value = result.data.reset_link
  //     resetEmail.value = email
  //     showResetModal.value = true
  //   }
  // }
</script>

<template>
  <AppLayout>
    <div class="columns is-variable is-3">
      <div class="column is-12">
        <div class="modern-card box">

          <!-- Header Section -->
          <div class="modern-header">
            <div class="header-titles">
              <h2 class="modern-title">User Registration Management</h2>
              <p class="modern-subtitle">Process new sign-ups and configure platform access permissions</p>
            </div>

            <!-- Filter Controls -->
            <div class="segmented-control">
              <label class="segment-item" :class="{ 'is-active': currentFilter === 'pending' }">
                <input type="radio" v-model="currentFilter" value="pending" class="is-hidden" />
                <span>Pending Reviews</span>
              </label>

              <label class="segment-item" :class="{ 'is-active': currentFilter === 'approved' }">
                <input type="radio" v-model="currentFilter" value="approved" class="is-hidden" />
                <span>Approved Users</span>
              </label>

              <label class="segment-item" :class="{ 'is-active': currentFilter === 'blocked' }">
                <input type="radio" v-model="currentFilter" value="blocked" class="is-hidden" />
                <span>Blocked Sign-ups</span>
              </label>
            </div>
          </div>

          <!-- Data Table Wrapper for Responsive Horizontal Scroll -->
          <div class="table-responsive-wrapper">
            <BaseTable :loading="loading" :empty="filteredRegistrations.length === 0" class="modern-table">
              <template #header>
                <tr>
                  <th class="col-uid">UID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Date</th>
                  <th class="has-text-right col-actions">Workflow Options</th>
                </tr>
              </template>

              <!-- Table Rows -->
              <tr v-for="item in filteredRegistrations" :key="item.uid" class="modern-row">
                <td class="user-cell">
                  <span class="user-id-text">{{ item.uid }}</span>
                </td>
                <td class="user-cell">
                  <span class="user-email-text">{{ item.email }}</span>
                </td>
                <td>
                  <span class="modern-badge" :class="`badge-${item.status}`">
                    {{ item.role }}
                  </span>
                </td>
                <td class="user-cell">
                  <span class="user-date-text">{{ formatDate(item.updated_at) }}</span>
                </td>
                <td class="has-text-right col-actions">
                  <div class="action-btn-group">

                    <!-- Pending Actions -->
                    <template v-if="currentFilter === 'pending'">
                      <button class="action-btn is-approve" :disabled="isProcessing(item.uid)" @click="openActionConfirm('approve', item.uid, () => approveUser(item.uid), 'Approve User', 'Are you sure you want to approve this user?', 'success')">
                        {{ isProcessing(item.uid) ? 'Processing...' : 'Approve' }}
                      </button>
                      <button class="action-btn is-block" :disabled="isProcessing(item.uid)" @click="openActionConfirm('block', item.uid, () => blockUser(item.uid), 'Block User', 'Are you sure you want to block this user?', 'danger')">
                        {{ isProcessing(item.uid) ? 'Processing...' : 'Block' }}
                      </button>
                    </template>

                    <!-- Approved Actions -->
                    <template v-if="currentFilter === 'approved'">
                      <!--<button class="action-btn is-reset" :disabled="isResetting(item.email)" @click="openActionConfirm('reset', item.uid, () => handleResetPassword(item.email), 'Reset Password', 'Generate a new password reset link for this user?', 'warning')">
                        {{ isResetting(item.email) ? 'Generating...' : 'Reset Password' }}
                      </button>-->
                      <button class="action-btn is-block" :disabled="isProcessing(item.uid)" @click="openActionConfirm('block', item.uid, () => blockUser(item.uid), 'Block User', 'Are you sure you want to block this user?', 'danger')">
                        {{ isProcessing(item.uid) ? 'Processing...' : 'Block' }}
                      </button>
                    </template>

                    <!-- Blocked Actions -->
                    <template v-if="currentFilter === 'blocked'">
                      <button class="action-btn is-approve" :disabled="isProcessing(item.uid)" @click="openActionConfirm('unblock', item.uid, () => approveUser(item.uid), 'Unblock User', 'Are you sure you want to restore access for this user?', 'success')">
                        {{ isProcessing(item.uid) ? 'Processing...' : 'Unblock' }}
                      </button>
                    </template>

                  </div>
                </td>
              </tr>
              <template #empty>
                <div class="empty-state">No active user registrations match the selected category filter window.</div>
              </template>
            </BaseTable>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ResetPasswordModal :show="showResetModal" :email="resetEmail" :link="resetLink" @close="showResetModal=false" />
    <ConfirmDialog :show="isOpen" :title="title" :message="message" :loading="confirmLoading" :variant="variant" @confirm="accept" @cancel="close" />
  </AppLayout>
</template>

<style scoped>
/* Card Container */
.modern-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  padding: 1.5rem;
}

/* Header Section */
.modern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Typography */
.modern-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
  margin-bottom: 0.25rem;
}

/* Subtitle Text */
.modern-subtitle {
  font-size: 0.875rem;
  color: #64748b;
}

/* Segmented Control Base */
.segmented-control {
  display: inline-flex;
  background: #f8fafc;
  padding: 0.375rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  gap: 0.25rem;
  flex-wrap: wrap;
}

/* Segment Item Styling */
.segment-item {
  padding: 0.5rem 1.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

/* Active Segment Hover State */
.segment-item:hover:not(.is-active) {
  color: #334155;
  background: #f1f5f9;
}

/* Active Segment Base Styling */
.segment-item.is-active {
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Active Segment Colors */
.segment-item.is-active:has(input[value="pending"]) { color: #d97706; }
.segment-item.is-active:has(input[value="approved"]) { color: #059669; }
.segment-item.is-active:has(input[value="blocked"]) { color: #e11d48; }

/* Responsive Table Wrapper */
.table-responsive-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 8px;
}

/* Table Minimum Width to Force Scroll on Small Screens */
:deep(.modern-table) {
  min-width: 900px;
  width: 100%;
}

/* Table Headers */
:deep(.modern-table th) {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  border-bottom: 2px solid #f1f5f9;
  padding: 1rem 1.25rem;
  white-space: nowrap;
}

/* Table Column Widths */
.col-uid { width: 320px; }
.col-actions { padding-right: 1.25rem !important; min-width: 240px; }

/* Table Row Base */
.modern-row td {
  border-bottom: 1px solid #f8fafc;
  transition: background-color 0.15s ease;
  vertical-align: middle;
  white-space: nowrap;
}

/* Table Row Hover */
.modern-row:hover td {
  background-color: #f8fafc;
}

/* Cell Spacing & Typography */
.user-cell { padding: 1rem 1.25rem; }
.user-id-text { font-family: ui-monospace, monospace; font-size: 0.8125rem; color: #475569; font-weight: 500; }
.user-email-text { font-weight: 600; color: #1e293b; font-size: 0.875rem; }
.user-date-text { font-size: 0.875rem; color: #64748b; }

/* Status Badges */
.modern-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Badge Variants */
.badge-pending { background: #fef3c7; color: #d97706; }
.badge-approved { background: #d1fae5; color: #059669; }
.badge-blocked { background: #ffe4e6; color: #e11d48; }

/* Action Buttons Container */
.action-btn-group {
  display: inline-flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Action Button Base */
.action-btn {
  border: 1px solid transparent;
  background: #f1f5f9;
  color: #475569;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Action Button Disabled State */
.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(100%);
}

/* Approve Action Button Hover */
.action-btn.is-approve:not(:disabled):hover {
  color: #059669;
  background: #ecfdf5;
  border-color: #a7f3d0;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.1);
}

/* Block Action Button Hover */
.action-btn.is-block:not(:disabled):hover {
  color: #dc2626;
  background: #fef2f2;
  border-color: #fecaca;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
}

/* Reset Action Button Hover */
.action-btn.is-reset:not(:disabled):hover {
  color: #2563eb;
  background: #eff6ff;
  border-color: #bfdbfe;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
}

/* Empty State Styling */
.empty-state {
  padding: 3rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
}
</style>
