<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import api from '@/services/axios'

interface Props {
  case_id: number | null
  flag?: string
  isAdditional?: boolean
}

const props = withDefaults(
  defineProps<Props>(),
  {
    flag: '',
    isAdditional: false,
  }
)

const { data: response, isPending } = useQuery({
  queryKey: computed(() => [
    'multiple-account',
    props.case_id,
    props.flag,
    props.isAdditional,
  ]),

  enabled: computed(() => props.case_id !== null),

  queryFn: async () => {
    if (!props.case_id) {
      throw new Error('Case ID is required')
    }

    if (props.isAdditional) {

      const response = await api.post(
          '/risk/withdrawals/custom/flags',
          {
            cases: [
              {
                case_id: props.case_id,
                identities: props.flag
              }
            ]
          }
        )

        return response.data
    }

    const response = await api.post(
      '/risk/withdrawals/multiple-accounts',
      {
        ids: [props.case_id]
      }
    )

    console.log(
      'MULTIPLE ACCOUNT RESPONSE:',
      response.data
    )

    return response.data
  }
})

const selectedMatchType = ref<'ip' | 'fingerprint' | 'cookie' | null>(null)

const setMatchType = (
  type: 'ip' | 'fingerprint' | 'cookie'
) => {
  selectedMatchType.value = type
}

interface MatchItem {
  id: number | string
  related_user_id: number | string
  account_group?: string
}

const accounts = computed(() => {
  const account = response.value?.data?.[0]
  if (!account) return []

 const sortMatches = (matches: MatchItem[],type: 'ip' | 'fingerprint' | 'cookie'): MatchItem[] => {
  // Initial state: show all match types
  if (selectedMatchType.value === null) {
    return matches
  }

  // Selected type: show only that type
  if (selectedMatchType.value === type) {
    return matches
  }

  return []
}

  return [
    {
      user_id: account.case_id ?? '-',
      account_group: '-',
      ip: account.ip ?? '-',
      fingerprint: account.fingerprint ?? '-',
      cookie_id: account.cookie ?? '-',
      created_at: account.login_date ?? '-',
      ip_total: account.ip_matches?.length ?? 0,
      fingerprint_total: account.fingerprint_matches?.length ?? 0,
      cookie_total:  account.cookie_matches?.length ?? 0,
      ip_matches: sortMatches(
          account.ip_matches ?? [],
          'ip'
        ),

      fingerprint_matches:
        sortMatches(
          account.fingerprint_matches ?? [],
          'fingerprint'
        ),

      cookie_matches:
        sortMatches(
          account.cookie_matches ?? [],
          'cookie'
        )
    }
  ]
})
</script>

<template>
  <div v-if="isPending" class="empty-state">
  Loading account data...
</div>

<div v-else-if="accounts.length" class="review-wrapper">
    <div class="header-section">
      <div class="match-toolbar">
        <div class="legend">
          <span class="legend-label">Match types:</span>
          <div class="indicator-item">
            <span
              class="badge badge-ip"
              @click="setMatchType('ip')"
            >
              IP Address: {{ accounts[0]?.ip_total }}
            </span>
          </div>

          <div class="indicator-item">
            <span
              class="badge badge-fp"
              @click="setMatchType('fingerprint')"
            >
              Fingerprint: {{ accounts[0]?.fingerprint_total }}
            </span>
          </div>

          <div class="indicator-item">
            <span
              class="badge badge-cookie"
              @click="setMatchType('cookie')"
            >
              Cookie: {{ accounts[0]?.cookie_total }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table class="review-table">
        <thead>
          <tr>
            <th>User</th>
            <th>IP Address</th>
            <th>Fingerprint</th>
            <th>Cookie ID</th>
            <th>Account Group</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="(acc, index) in accounts" :key="index">

            <!-- Main Account -->
            <tr class="main-account-row">
              <td class="id-cell">
                <div class="user-block">
                  <div class="user-top">
                    <span class="main-label">MAIN</span>

                    <span class="user-id">
                      <!-- {{ acc.user_id }} -->
                    </span>
                  </div>
                </div>
              </td>

              <td>{{ acc.ip }}</td>
              <td>{{ acc.fingerprint }}</td>
              <td>{{ acc.cookie_id }}</td>
              <td>{{ acc.account_group }}</td>
            </tr>

            <!-- Fingerprint -->
            <tr
              v-for="item in acc.fingerprint_matches"
              :key="'fp-' + item.id"
              class="match-row fingerprint"
            >
              <td class="nested-cell">
                ↳ {{ item.related_user_id }}
              </td>

              <td>-</td>

              <td class="match-highlight">
                {{ acc.fingerprint }}
              </td>

              <td>-</td>

              <td>
                {{
                  item.account_group
                    ?.toLowerCase()
                    .includes('kyc complete')
                    ? 'Verified'
                    : 'Not Verified'
                }}
              </td>
            </tr>

            <!-- IP -->
            <tr
              v-for="item in acc.ip_matches"
              :key="'ip-' + item.id"
              class="match-row ip"
            >
              <td class="nested-cell">
                ↳ {{ item.related_user_id }}
              </td>

              <td class="match-highlight">
                {{ acc.ip }}
              </td>

              <td>-</td>

              <td>-</td>

              <td>
                {{
                  item.account_group
                    ?.toLowerCase()
                    .includes('kyc complete')
                    ? 'Verified'
                    : 'Not Verified'
                }}
              </td>
            </tr>

            <!-- Cookie -->
            <tr
              v-for="item in acc.cookie_matches"
              :key="'cookie-' + item.id"
              class="match-row cookie"
            >
              <td class="nested-cell">
                ↳ {{ item.related_user_id }}
              </td>

              <td class="match-highlight">
                {{ acc.ip }}
              </td>

              <td class="match-highlight">
                {{ acc.fingerprint }}
              </td>

              <td class="match-highlight">
                {{ acc.cookie_id }}
              </td>

              <td>{{
                  item.account_group
                    ?.toLowerCase()
                    .includes('kyc complete')
                    ? 'Verified'
                    : 'Not Verified'
                }}</td>
            </tr>

          </template>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else class="empty-state">
    <p>No account data available for review.</p>
  </div>
</template>

<style scoped>
  .review-wrapper {
    padding: 14px 24px 24px;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #1f2937;

  }

  /* Header & Toolbar */
  .header-section {
    margin-bottom: 10px;
  }

  .review-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 16px 0;
    color: #111827;
  }

  .user-id-highlight {
    color: #2563eb;
    font-family: monospace;
  }

  .match-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .legend-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    font-weight: 600;
    margin-right: 4px;
  }

  /* Badges */
  .badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid transparent;
    cursor: pointer;
    user-select: none;
  }

  .badge-ip { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
  .badge-fp { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
  .badge-cookie { background: #fffbeb; color: #d97706; border-color: #fef3c7; }

  .stats-badge {
    font-size: 0.875rem;
    padding: 6px 12px;
    background: #f3f4f6;
    border-radius: 20px;
    color: #374151;
  }

  /* Table Styling */
  .table-container {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow-y: auto;

    height: 500px


  }
  /* Sticky Header */
  .review-table thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f9fafb; /* important to cover rows */
  }
  .main-account-row {
    position: sticky;
    top: 45px;
    z-index: 10;
    background-color: #fffbeb;
  }

  .review-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 0.875rem;
  }

  .review-table th {
    background: #f9fafb;
    padding: 12px 16px;
    font-weight: 600;
    color: #4b5563;
    border-bottom: 1px solid #e5e7eb;
  }

  .review-table td {
    padding: 12px 16px;
  }

  /* ========================================
    ROW HOVER
  ======================================== */

  .review-table tbody tr:hover td {
    background: #fff7ed;
  }

  /* Row Variants */
  .main-account-row {
    background-color: #fffbeb; /* Light yellow */
    font-weight: 600;
  }

  .main-label {
    font-size: 10px;
    background: #f59e0b;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    margin-right: 8px;
    vertical-align: middle;
  }

  .match-row td {
    border-bottom: 1px solid #f3f4f6;
  }

  .nested-cell {
    padding-left: 32px !important;
    color: #6b7280;
  }

  .nested-cell span {
    color: #d1d5db;
    margin-right: 4px;
  }

  /* Specific Match Left-Borders */
  .match-row.fingerprint {
    border-left: 4px solid #ef4444;
  }

  .match-row.ip {
    border-left: 4px solid #22c55e;
  }

  .match-row.cookie {
    border-left: 4px solid #f59e0b;
  }

  .match-highlight {
    color: #111827;
    font-family: monospace;
  }

  .id-cell,
  .nested-cell {
    vertical-align: middle;
    min-width: 220px;
  }

  .user-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .user-top {
    display: flex;
    align-items: center;
    gap: 10px;
    line-height: 1;
  }

  .user-id {
    font-weight: 600;
    color: #111827;
    font-size: 14px;
  }

  .username {
    font-size: 12px;
    color: #64748b;
    padding-left: 0;
    line-height: 1;
  }

  /* MAIN badge */
  .main-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    background: #f59e0b;
    color: white;
    padding: 4px 8px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    margin-right: 0;
    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  }
</style>
