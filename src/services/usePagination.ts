import { ref, computed, type Ref } from 'vue'

export interface PaginationOptions<T> {
  items: Ref<T[]>
    itemsPerPage?: number
    maxVisiblePages?: number
}

export function usePagination<T>({items, itemsPerPage = 10, maxVisiblePages = 4}: PaginationOptions<T>) {
  const currentPage = ref(1)
  const totalPages = computed(() => Math.ceil(items.value.length / itemsPerPage))
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return items.value.slice(start, end)
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const visiblePages = computed(() => {
    const pages: number[] = []
    const maxVisible = maxVisiblePages

    let start = Math.max(1, currentPage.value - 1)
    const end = Math.min(totalPages.value, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  })

  return {
    currentPage,
    totalPages,

    paginatedData: paginatedItems,

    visiblePages,
    goToPage
  }
}
