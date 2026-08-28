import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getUsers } from '../api/account.api'
import type { AccountUser, UserStatus } from '../account.type'

export function useAccounts() {
  const currentFilter = ref<UserStatus>('pending')

  const processingUsers = ref(new Set<string>())

  // Fetch users
  const {
    data: users,
    isPending: loading,
    refetch: loadUsers
  } = useQuery({
    queryKey: ['accounts'],

    queryFn: async () => {
      const { data } = await getUsers()

      return data as AccountUser[]
    }
  })

  // Button loading state
  const isProcessing = (uid: string): boolean => {
    return processingUsers.value.has(uid)
  }

  // Filter
  const filteredRegistrations = computed(() => {
    return (
      users.value?.filter(
        user =>
          user.status === currentFilter.value
      ) ?? []
    )
  })

  return {
    users,
    loading,
    currentFilter,
    filteredRegistrations,
    isProcessing,
    loadUsers
  }
}
