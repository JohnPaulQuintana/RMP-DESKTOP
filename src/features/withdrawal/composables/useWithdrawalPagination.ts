import { computed, type Ref } from 'vue'
import type { Pagination, FormattedWithdrawalItem } from '../withdrawal.type'


interface WithdrawalPaginationResponse {
  items: FormattedWithdrawalItem[]
  pagination: Pagination
}

export function useWithdrawalPagination(withdrawals: Ref<WithdrawalPaginationResponse | undefined>) {

  const totalPages = computed(() => withdrawals.value?.pagination.total_pages ?? 1)

  const currentPage = computed(() => withdrawals.value?.pagination.page ?? 1)

  const visiblePages = computed(() => {
    const current = currentPage.value
    const total = totalPages.value

    const start = Math.max(1, current - 1)
    const end = Math.min(total, start + 2)

    return Array.from(
      {
        length: end - start + 1,
      },
      (_, index) =>
        start + index
    )
  })

  return {
    totalPages,
    currentPage,
    visiblePages,
  }
}
