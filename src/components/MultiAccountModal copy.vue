<script setup lang="ts">
import { ref, computed } from 'vue'


interface Account {
  userId: string
  ip: string
  date_range: string
  country?: string
  fingerprint2: string | null
  cookie: string
  ip_matches_userIds?: string[]
  fingerprint_matches_userIds?: string[]
  cookie_matches_userIds?: string[]
}

// Props
const props = defineProps<{
  isActive: boolean
  accounts: Account[]
}>()

defineEmits(['close'])

// Live Filter for modal
const searchQuery = ref('')

const filteredAccounts = computed(() => {
  if (!searchQuery.value) return processedAccounts.value

  const query = searchQuery.value.toLowerCase()

  return processedAccounts.value.filter(
    (acc) =>
      acc.user_id.toLowerCase().includes(query) ||
      acc.ip.toLowerCase().includes(query) ||
      acc.fingerprint.toLowerCase().includes(query) ||
      acc.cookie_id.toLowerCase().includes(query)
  )
})
const flaggedUserIds = computed(() => {
  return processedAccounts.value.map(acc => acc.user_id)
})
const matchedUserCount = computed(() => {
  return filteredAccounts.value.reduce((total, acc) => {
    return (
      total +
      acc.fingerprint_matches.length +
      acc.ip_matches.length +
      acc.cookie_matches.length
    )
  }, 0)
})
const processedAccounts = computed(() => {
  return props.accounts.map((acc) => ({
    user_id: acc.userId,
    ip: acc.ip || '-',
    fingerprint: acc.fingerprint2 || '-',
    cookie_id: acc.cookie || '-',
    created_at: acc.date_range,
    ip_matches: acc.ip_matches_userIds || [],
    fingerprint_matches: acc.fingerprint_matches_userIds || [],
    cookie_matches: acc.cookie_matches_userIds || []
  }))
})



</script>

<template>
  <div class="modal" :class="{ 'is-active': isActive }">
    <div class="modal-background" @click="$emit('close')"></div>

    <div class="modal-card audit-modal">
      <header class="modal-card-head audit-header">
        <div class="is-flex-grow-1">
          <h1 class="title is-5 has-text-white mb-2">Multiple Account Flags</h1>
          <p class="subtitle is-7 has-text-grey-light">
            The following users have been flagged for potentially owning multiple accounts.
          </p>
        </div>
      </header>

      <section class="modal-card-body custom-scrollbar">
        <!-- Table container with fixed dimensions -->
        <div class="table-container">
          <table class="table is-fullwidth audit-table sticky-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>IP Address</th>
                <th>Fingerprint</th>
                <th>Cookie ID</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(acc, index) in filteredAccounts" :key="index">
                <!-- Main user row - now sticky -->
                <tr class="main-user-row sticky-row">
                  <td>{{ acc.user_id }}</td>
                  <td>{{ acc.ip }}</td>
                  <td>{{ acc.fingerprint }}</td>
                  <td>{{ acc.cookie_id }}</td>
                  <td>{{ acc.created_at }}</td>
                </tr>

                <!-- Fingerprint matches -->
                <tr v-for="user in acc.fingerprint_matches" :key="'fp-'+user" class="match-group">
                  <td class="match-row">{{ user }}</td>
                  <td>-</td>
                  <td>{{ acc.fingerprint }}</td>
                  <td>-</td>
                  <td>{{ acc.created_at }}</td>
                </tr>

                <!-- IP matches -->
                <tr v-for="user in acc.ip_matches" :key="'ip-'+user" class="match-group">
                  <td class="match-row">{{ user }}</td>
                  <td>{{ acc.ip }}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>{{ acc.created_at }}</td>
                </tr>

                <!-- Cookie matches -->
                <tr v-for="user in acc.cookie_matches" :key="'ck-'+user" class="match-group">
                  <td class="match-row">{{ user }}</td>
                  <td>{{ acc.ip }}</td>
                  <td>{{ acc.fingerprint }}</td>
                  <td>{{ acc.cookie_id }}</td>
                  <td>{{ acc.created_at }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-space-between py-3">
        <p class="has-text-grey is-size-7">
          Showing <strong>{{ matchedUserCount }}</strong> related accounts from
          <strong>{{ flaggedUserIds.join(', ') }}</strong> flagged users
        </p>
        <div class="buttons">
          <button class="button is-small is-dark px-5" @click="$emit('close')">
            Dismiss
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Modal container */
.audit-modal {
  width: 95%;
  max-width: 85%;
  max-height: 85vh;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

/* Header */
.audit-header {
  background: linear-gradient(135deg,#020617,#0f172a);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 1.4rem 1.6rem;
}

/* Body */
.modal-card-body {
  flex: 1;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* Scroll container */
.table-container {
  overflow-y: auto;
  overflow-x: auto;
  height: 100%;
}

/* Table base */
.audit-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  font-size: 0.88rem;
}

/* Header columns */
.audit-table thead th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  z-index: 30;
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
  padding: .75rem .75rem;
}

/* Main flagged account row */
.sticky-row td {
  background: #fef9c3;
  font-weight: 600;
  border-left: 3px solid #f59e0b;
  border-bottom: 1px solid #fde68a;
  padding: .8rem .75rem;
  font-size: .9rem;
}

/* Sub match rows */
.audit-table tbody tr:not(.sticky-row) td {
  padding: .7rem .75rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

/* Match indentation */
.match-row {
  padding-left: 2rem !important;
  font-style: italic;
  color: #475569;
  position: relative;
}

.match-row::before {
  content: "↳";
  position: absolute;
  left: .6rem;
  color: #94a3b8;
  font-style: normal;
}

/* Hover effect */
.audit-table tbody tr:hover td {
  background: #f8fafc;
}

/* Sticky main user rows */
.sticky-row {
  position: sticky;
  top: 38px;
  z-index: 20;
}

/* Footer */
.modal-card-foot {
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: .8rem 1.2rem;
}

/* Buttons */
.button.is-dark {
  background: #0f172a;
  border-radius: 6px;
}

.button.is-dark:hover {
  background: #020617;
}

/* Scrollbar */
.table-container::-webkit-scrollbar {
  width: 8px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
