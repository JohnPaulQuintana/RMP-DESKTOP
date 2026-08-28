import { computed, ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

import { myTask, updateStatus } from '../../api/task.api'
import { useAuthStore } from '@/stores/auth'

import type {
  TaskResponse,
  MyTaskPayload,
  MyTaskRow,
} from '../../task.types'

export function useMyTask() {
  const authStore = useAuthStore()
  const queryClient = useQueryClient()

  const userId = computed(() => authStore.user?.uid ?? '')

  const solvingTaskId = ref<number | null>(null)

  const taskQuery = useQuery<MyTaskRow[]>({
    queryKey: computed(() => [
      'my-task',
      userId.value,
    ]),

    enabled: computed(() => !!userId.value),

    queryFn: async () => {
      const payload: MyTaskPayload = {
        user_id: userId.value,
        status: '',
      }

      const response = await myTask(payload)

      return processTasks(response.data)
    },

    // Refresh every 10 seconds
    refetchInterval: 10000,
  })


  const processTasks = (tasks: TaskResponse[]): MyTaskRow[] => {
    const groupedTasks = tasks.reduce(
      (
        acc: Record<string, MyTaskRow>,
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

    const grouped = Object.values(groupedTasks)

    const activeWithdrawals = grouped.filter(group => {
      return group.actions.some(
        action => action.status === 'inprogress'
      )
    })

    const flagOrder: Record<string, number> = {
      multiple_account: 1,
      bonus_abuse: 2,
      no_deposit: 3,
      arbitrage: 4,
    }

    activeWithdrawals.forEach(group => {
      group.actions.sort(
        (a, b) =>
          (flagOrder[a.flag] ?? 999) -
          (flagOrder[b.flag] ?? 999)
      )
    })

    return activeWithdrawals
  }

  const solveMutation = useMutation({
    mutationFn: (actionId: number) =>
      updateStatus({
        action_id: actionId,
        status: 'completed',
      }),

    onSuccess: () => {
      // Refresh My Task
      queryClient.invalidateQueries({
        queryKey: ['my-task'],
      })

      // Refresh Dashboard
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      })
    },
  })


  const dashboardRows = computed(
    () => taskQuery.data.value ?? []
  )

  const pendingFlags = computed(() => {
    return dashboardRows.value.reduce(
      (total, withdrawal) => {
        return (
          total +
          withdrawal.actions.filter(
            action => action.status === 'inprogress'
          ).length
        )
      },
      0
    )
  })

  const completedFlags = computed(() => {
    return dashboardRows.value.reduce(
      (total, withdrawal) => {
        return (
          total +
          withdrawal.actions.filter(
            action => action.status === 'completed'
          ).length
        )
      },
      0
    )
  })

  const totalTasks = computed(() => dashboardRows.value.length)

  const loading = computed(() => taskQuery.isPending.value)

  const solveTask = async (actionId: number) => {
    solvingTaskId.value = actionId

    try {
      await solveMutation.mutateAsync(actionId)
    } finally {
      solvingTaskId.value = null
    }
  }

  return {
    dashboardRows,

    // Existing
    totalTasks,
    loading,
    solvingTaskId,
    solveTask,

    // New detailed flag counts
    pendingFlags,
    completedFlags,

    refetch: taskQuery.refetch,
  }
}

