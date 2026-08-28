import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { myTask } from '../../api/task.api'
import { useAuthStore } from '@/stores/auth'

import type { TaskResponse, MyTaskRow } from '../../task.types'

export function useDashboard() {
  const authStore = useAuthStore()
  const userId = computed(() => authStore.user?.uid ?? '')

  const taskQuery = useQuery<TaskResponse[]>({
    queryKey: computed(() => [
      'dashboard',
      userId.value,
    ]),

    queryFn: async () => {
      const response = await myTask({
        user_id: userId.value,
        status: '',
      })

      return response.data ?? []
    },

    enabled: computed(() => Boolean(userId.value)),

    // Check for newly completed withdrawals every 10 seconds
    refetchInterval: 10000,
  })

  const dashboardRows = computed<MyTaskRow[]>(() => {
    const tasks = taskQuery.data.value ?? []
    const groupedTasks = tasks.reduce(
      ( acc: Record<string, MyTaskRow>,
        row: TaskResponse
      ) => {
        const withdrawalId = row.action.withdrawal_id

        if (!acc[withdrawalId]) {
          acc[withdrawalId] = {
            withdrawal_id: withdrawalId,
            user_id: row.action.user_id,
            status: row.action.status,
            created_at: row.action.created_at,
            actions: [],
          }
        }

        acc[withdrawalId].actions.push({
          ...row.action,
          session: row.session,
        })

        return acc
      },
      {}
    )

    const completedWithdrawals = Object.values(
      groupedTasks
    ).filter(group => {
      if (group.actions.length === 0) {
        return false
      }

      return group.actions.every(
        action => action.status === 'completed'
      )
    })

    const flagOrder: Record<string, number> = {
      multiple_account: 1,
      bonus_abuse: 2,
      no_deposit: 3,
      arbitrage: 4,
    }

    completedWithdrawals.forEach(group => {
      group.actions.sort(
        (a, b) =>
          (flagOrder[a.flag] ?? 999) -
          (flagOrder[b.flag] ?? 999)
      )
    })

    return completedWithdrawals
  })

  const pendingCount = computed(() => {
    const tasks = taskQuery.data.value ?? []

    const pendingWithdrawals = new Set(
      tasks
        .filter(
          row => row.action.status === 'inprogress'
        )
        .map(
          row => row.action.withdrawal_id
        )
    )

    return pendingWithdrawals.size
  })

  const totalCompleted = computed(() => dashboardRows.value.length)

  const loading = computed(() => taskQuery.isFetching.value)

  const error = computed(() => taskQuery.error.value)

  return {
    dashboardRows,
    pendingCount,
    totalCompleted,
    loading,
    error,
  }
}
