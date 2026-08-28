import { ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getWithdrawals, getStats } from '../api/withdrawal.api'
import { formatWithdrawalData } from '../utils/withdrawal.helper'
// import type { Stats } from '../withdrawal.type'

const triggerOrder = [
  'multiple_account',
  'bonus_abuse',
  'no_deposit',
  'arbitrage',
] as const

const sortTriggers = (triggers: string[]) => {
  return [...triggers].sort(
    (a, b) =>
      triggerOrder.indexOf(a as typeof triggerOrder[number]) -
      triggerOrder.indexOf(b as typeof triggerOrder[number])
  )
}

export function useWithdrawal() {
  const page = ref(1)
  const pageSize = ref(10)

  // ==========================================
  // WITHDRAWALS
  // ==========================================
  const {
    data: withdrawals,
    isLoading: loading,
    isFetching,
    error,
    refetch: fetchWithdrawals,
  } = useQuery({
    queryKey: [
      'withdrawals',
      page,
      pageSize,
    ],

    queryFn: () =>
      getWithdrawals({
        page: page.value,
        pageSize: pageSize.value,
      }),

    refetchInterval: 5000,

    placeholderData: (previousData) => previousData,

    select: (response) => ({
      items: response.data.items
        .map((item) => {
          const formatted = formatWithdrawalData(item)

          return {
            ...formatted,
            trigger: sortTriggers(formatted.trigger),
          }
        })
        .sort(
          (a, b) =>
            a.sort_date.getTime() -
            b.sort_date.getTime()
        ),

      pagination: response.data.pagination,
    }),
  })

  // ==========================================
  // STATS
  // ==========================================
  const {
    data: stats,
    isLoading: statsLoading,
    isFetching: statsFetching,
    error: statsError,
    refetch: fetchStats,
  } = useQuery({
    queryKey: ['withdrawal-stats'],

    queryFn: getStats,

    refetchInterval: 30000,
  })

  // ==========================================
  // PAGINATION
  // ==========================================
  const nextPage = () => {
    if (
      page.value <
      (withdrawals.value?.pagination.total_pages ?? 0)
    ) {
      page.value++
    }
  }

  const previousPage = () => {
    if (page.value > 1) {
      page.value--
    }
  }

  const goToPage = (newPage: number) => {
    if (
      newPage >= 1 &&
      newPage <=
        (withdrawals.value?.pagination.total_pages ?? 1)
    ) {
      page.value = newPage
    }
  }

  return {
    // Withdrawals
    withdrawals,
    loading,
    isFetching,
    error,
    page,
    pageSize,
    nextPage,
    previousPage,
    goToPage,
    fetchWithdrawals,

    // Stats
    stats,
    statsLoading,
    statsFetching,
    statsError,
    fetchStats,
  }
}

