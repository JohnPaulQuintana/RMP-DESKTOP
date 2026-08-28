<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import api from '@/services/axios'

interface BonusItem {
  bonus_id: number
  bonus_title: string
  requirement_turnover: number
  bonus: number
  completed_turnover: number
  bonus_category?: string | null
  reason?: string | null
}

interface BonusAbuseResponse {
  data: BonusItem[]
}

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

const { data: response, isPending } = useQuery<BonusAbuseResponse>({
  queryKey: computed(() => [
    'bonus-abuse',
    props.case_id,
    props.flag,
    props.isAdditional,
  ]),

  enabled: computed(() => props.case_id !== null),

  queryFn: async () => {
    if (props.case_id === null) {
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

    const response = await api.post<BonusAbuseResponse>(
      '/risk/withdrawals/bonus-abuse',
      {
        ids: [props.case_id],
      }
    )

    return response.data
  },
})

const accounts = computed<BonusItem[]>(() => {
  const data = response.value?.data

  if (!Array.isArray(data)) {
    return []
  }

  return data.map((bonus) => ({
    bonus_id: bonus.bonus_id,
    bonus_title: bonus.bonus_title,
    requirement_turnover: bonus.requirement_turnover,
    bonus: bonus.bonus,
    completed_turnover: bonus.completed_turnover,
    bonus_category: bonus.bonus_category ?? '-',
    reason: bonus.reason ?? '-',
  }))
})

// Correctly parses reason items without breaking arrays like ['Reload', 'FDB', 'Progressive']
const formatReasons = (reasonStr: string | null | undefined): string[] => {
  if (!reasonStr || reasonStr === '-') return []

  const capitalize = (str: string) => {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // 1. Try JSON parsing first
  try {
    const parsed = JSON.parse(reasonStr)

    // JSON Object
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return Object.entries(parsed).map(([key, val]) => {
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .trim()

        const displayVal = Array.isArray(val) ? `[${val.join(', ')}]` : val
        return `${capitalize(formattedKey)}: ${displayVal}`
      })
    }

    // JSON Array
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => capitalize(String(item).trim()))
        .filter(Boolean)
    }
  } catch (e) {
    console.error('Failed to parse reason:', e)
  }

  // 2. Smart split: Splits by commas ONLY if they are NOT inside square brackets [...]
  const rawList = reasonStr
    .split(/,\s*(?![^[]*\])/)
    .map((item) => item.trim())
    .filter(Boolean)

  return rawList.map((rule) => {
    const trimmed = rule.replace(/^['"]|['"]$/g, '')

    // Format camelCase strings cleanly
    const formatted = trimmed.replace(/([a-z])([A-Z])/g, '$1 $2')

    return capitalize(formatted)
  })
}
</script>

<template>
  <div v-if="isPending" class="no-data">
    Loading bonus abuse data...
  </div>

  <div v-else-if="accounts.length" class="review-wrapper">
    <div class="table-container">
      <table class="review-table">
        <thead>
          <tr>
            <th>Bonus ID</th>
            <th>Bonus Title</th>
            <th>Requirement Turnover</th>
            <th>Bonus</th>
            <th>Completed Turnover</th>
            <th>Reason</th>
            <th>Bonus Category</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(acc, index) in accounts" :key="index" class="match-row">
            <td class="font-mono">{{ acc.bonus_id }}</td>
            <td class="font-medium">{{ acc.bonus_title }}</td>
            <td>{{ acc.requirement_turnover }}</td>
            <td>{{ acc.bonus }}</td>
            <td>{{ acc.completed_turnover }}</td>

            <!-- Reason list with vertical bar and formatted rules -->
            <td class="reason-cell">
              <div v-if="formatReasons(acc.reason).length" class="reason-list">
                <div
                  v-for="(r, rIdx) in formatReasons(acc.reason)"
                  :key="rIdx"
                  class="reason-item"
                >
                  <span class="vertical-bar-red"></span>
                  <span class="reason-text-black">{{ r }}</span>
                </div>
              </div>
              <span v-else class="text-muted">-</span>
            </td>

            <td>{{ acc.bonus_category }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else class="no-data">
    <p class="no-data">No data available.</p>
  </div>
</template>

<style scoped>
  .review-wrapper {
    padding: 14px 24px 24px;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #1f2937;
  }

  /* Table Container & Layout */
  .table-container {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow-y: auto;
    height: 500px;
  }

  .review-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 0.875rem;
  }

  .review-table thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f9fafb;
    padding: 12px 16px;
    font-weight: 600;
    color: #4b5563;
    border-bottom: 1px solid #e5e7eb;
    vertical-align: middle;
  }

  .review-table td {
    padding: 12px 16px;
    vertical-align: middle;
  }

  .match-row {
    transition: background-color 0.2s ease;
  }

  .match-row:hover {
    background-color: #fff7ed;
  }

  .match-row td {
    border-bottom: 1px solid #f3f4f6;
  }

  /* Sidebar List-Style Reason Styling */
  .reason-cell {
    max-width: 450px;
  }

  .reason-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .reason-item {
    display: inline-flex;
    align-items: flex-start;
    gap: 8px;
    padding: 2px 0;
  }

  /* Red Vertical Indicator Bar */
  .vertical-bar-red {
    width: 3.5px;
    height: 15px;
    background-color: #ef4444;
    border-radius: 2px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* Black Reason Text */
  .reason-text-black {
    font-size: 0.8125rem;
    font-weight: 500;
    color: #111827;
    line-height: 1.35;
    word-break: break-word;
  }

  .font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .font-medium {
    font-weight: 500;
  }

  .text-muted {
    color: #9ca3af;
  }

  .no-data {
    padding: 24px;
    text-align: center;
    color: #6b7280;
  }
</style>
