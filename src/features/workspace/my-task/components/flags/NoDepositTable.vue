<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import api from '@/services/axios'

/* ========================================
   TYPES
======================================== */

interface NoDepositData {
  id?: number
  case_id?: number
  firstDepositTimeStr?: string | null
  lastDepositTimeStr?: string | null
  reason?: string | null
  created_at?: string | null
}

interface NoDepositResponse {
  success: boolean
  message: string
  data: NoDepositData[]
}

interface Props {
  case_id: number | null
  flag?: string
  isAdditional?: boolean
}

/* ========================================
   PROPS
======================================== */

const props = withDefaults(
  defineProps<Props>(),
  {
    flag: '',
    isAdditional: false,
  }
)

/* ========================================
   STATE
======================================== */

const data = ref<NoDepositData[]>([])
const isLoading = ref(false)
const isError = ref(false)

/* ========================================
   API
======================================== */

const fetchNoDeposit = async () => {
  if (props.case_id === null) {
    data.value = []
    return
  }

  /* ========================================
     ADDITIONAL FLAG
  ======================================== */

  if (props.isAdditional) {

    try {
      isLoading.value = true
      isError.value = false

      const response = await api.post<NoDepositResponse>( '/risk/withdrawals/custom/flags', {
          cases: [
            {
              case_id: props.case_id,
              identities: props.flag,
            },
          ],
        }
      )
      data.value = response.data.data ?? []
    } catch (error) {
      console.error('Additional Flag API Error:', error)

      isError.value = true
      data.value = []
    } finally {
      isLoading.value = false
    }

    return
  }

  /* ========================================
     DEFAULT NO DEPOSIT
  ======================================== */

  try {
    isLoading.value = true
    isError.value = false

    const response = await api.post<NoDepositResponse>(
      '/risk/withdrawals/no-deposit',
      {
        ids: [props.case_id],
      }
    )

    data.value = response.data.data ?? []
  } catch (error) {
    console.error('No Deposit API Error:', error)

    isError.value = true
    data.value = []
  } finally {
    isLoading.value = false
  }
}

/* ========================================
   WATCH PROPS
======================================== */

watch(
  [
    () => props.case_id,
    () => props.flag,
    () => props.isAdditional,
  ],
  () => {
    fetchNoDeposit()
  },
  {
    immediate: true,
  }
)

/* ========================================
   FORMAT DATE
======================================== */

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-'

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return dateString
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Manila',
    }
  ).format(date)
}

/* ========================================
   FORMAT TIME
======================================== */

const formatTime = (dateString?: string | null) => {
  if (!dateString) return '-'

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return dateString
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila',
    }
  ).format(date)
}

/* ========================================
   TABLE DATA
======================================== */

const accounts = computed(() => {
  return data.value.map((item) => ({
    id: item.id ?? '-',
    caseId: item.case_id ?? '-',
    firstDepositDate: formatDate(item.firstDepositTimeStr),
    firstDepositTime: formatTime(item.firstDepositTimeStr),
    lastDepositDate: formatDate(item.lastDepositTimeStr),
    lastDepositTime: formatTime(item.lastDepositTimeStr),
    createdDate: formatDate(item.created_at),
    createdTime: formatTime(item.created_at),
    reason: item.reason ?? '-',
  }))
})
</script>

<template>
  <div v-if="data && data.length" class="review-wrapper">
    <div class="table-container">
      <table class="review-table">
        <thead>
          <tr>
            <th>First Deposit</th>
            <th>Last Deposit</th>
            <th>Created At</th>
            <th>Reason</th>
          </tr>
        </thead>

        <tbody>
          <!-- Main row -->
          <tr v-for="(acc, index) in accounts" :key="index" class="match-row">
            <td class="date-cell">
              <div class="user-info">
                <span class="user-id">
                  {{ acc.firstDepositDate }}
                </span>
                <span class="user-meta">
                  {{ acc.firstDepositTime }}
                </span>
              </div>
            </td>

            <td class="date-cell">
              <div class="user-info">
                <span class="user-id">
                  {{ acc.lastDepositDate }}
                </span>
                <span class="user-meta">
                  {{ acc.lastDepositTime }}
                </span>
              </div>
            </td>

            <td class="date-cell">
              <div class="user-info">
                <span class="user-id">
                  {{ acc.createdDate }}
                </span>
                <span class="user-meta">
                  {{ acc.createdTime }}
                </span>
              </div>
            </td>

            <td>{{ acc.reason }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else>
    <p class="no-data">No data available.</p>
  </div>
</template>

<style scoped>
  .review-wrapper {
    padding: 14px 24px 24px;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #1f2937;
  }
  .header-section {
    margin-bottom: 10px;
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

  .legend-label {
    font-size: 1.10rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    margin-right: 4px;
  }

  /* Table Styling */
  .table-container {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow-y: auto;
    height: 500px;
  }

  /* Sticky Header */
  .review-table thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f9fafb;
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
    vertical-align: middle;
  }

  .match-row td {
    border-bottom: 1px solid #f3f4f6;
  }
  .match-row {
    transition: background 0.2s ease;
  }

  .match-row:hover {
    background: #fff7ed;
  }

  .user-cell {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: 1.4;
  }

  .user-id {
    font-size: 0.90rem;
    font-weight: 600;
    color: #111827;
  }

  .user-meta {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .date-cell {
    font-size: 0.82rem;
    color: #6b7280;
    white-space: nowrap;
    font-weight: 500;
  }

  .no-data {
    padding: 24px;
    text-align: center;
    color: #6b7280;
  }
</style>
