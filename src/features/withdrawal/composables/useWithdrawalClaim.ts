import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useToast } from 'vue-toastification'

import { claimAction } from '../api/task.api'
import { useAuthStore } from '@/stores/auth'

import type {
  ClaimActionPayload,
  TaskResponse,
} from '../withdrawal.type'

export function useClaimAction() {
  const toast = useToast()
  const authStore = useAuthStore()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (
      payload: Omit<ClaimActionPayload, 'user_id'>
    ): Promise<TaskResponse> => {
      const currentUser = authStore.user

      if (!currentUser) {
        throw new Error('User session not found')
      }

      return claimAction({
        ...payload,
        user_id: currentUser.uid,
      })
    },

    onSuccess: (response) => {
      toast.success(response.message)

      queryClient.invalidateQueries({
        queryKey: ['withdrawals'],
      })

      queryClient.invalidateQueries({
        queryKey: ['my-task'],
      })
    },

    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  return {
    claim: mutation.mutate,
    claimAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  }
}
