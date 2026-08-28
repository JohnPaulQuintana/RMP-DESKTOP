import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { ApiEndpoint } from '../analytic.type'

export function useAnalyticsTableState(apiEndpoints: Ref<ApiEndpoint[]>) {
  const expandedRows = ref<number[]>([])

  const toggleRow = (id: number) => {
    if (expandedRows.value.includes(id)) {
      expandedRows.value =
        expandedRows.value.filter(
          rowId => rowId !== id
        )
    } else {
      expandedRows.value.push(id)
    }
  }

  const latencySort =
    ref<'none' | 'asc' | 'desc'>('none')

  const toggleLatencySort = () => {
    if (latencySort.value === 'none') {
      latencySort.value = 'desc'
    }
    else if (latencySort.value === 'desc') {
      latencySort.value = 'asc'
    }
    else {
      latencySort.value = 'none'
    }
  }

  const displayedEndpoints = computed(() => {

  const data = apiEndpoints.value.filter(
    item =>
      item &&
      item.id &&
      item.endpoint &&
      item.method
  )

  if (latencySort.value === 'asc') {
    data.sort(
      (a, b) =>
        (a.total_response_ms ?? 0) -
        (b.total_response_ms ?? 0)
    )
  }

  if (latencySort.value === 'desc') {
    data.sort(
      (a, b) =>
        (b.total_response_ms ?? 0) -
        (a.total_response_ms ?? 0)
    )
  }

  return data
})

  const currentPage = ref(1)
  const itemsPerPage = 8

  const totalPages = computed(() => {
    return Math.ceil(
      displayedEndpoints.value.length /
      itemsPerPage
    ) || 1
  })

  const paginatedEndpoints = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage

    return displayedEndpoints.value.slice(
      start,
      end
    )
  })

  const visiblePages = computed(() => {
    const maxVisible = 4
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))

    let end = start + maxVisible - 1

    if (end > totalPages.value) {
      end = totalPages.value
      start = Math.max( 1, end - maxVisible + 1 )
    }

    return Array.from(
      {
        length: end - start + 1
      },
      (_, i) =>
        start + i
    )
  })

  const goToPage = (page:number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const getResponseClass = (ms:number) => {
    const minutes = ms / 1000 / 60
    if (minutes < 1) {
      return 'fast'
    }
    if (minutes <= 5) {
      return 'medium'
    }

    return 'slow'
  }

  const resetPage = () => {currentPage.value = 1}

  return {
    // Expansion
    expandedRows,
    toggleRow,

    // Sorting
    latencySort,
    displayedEndpoints,
    toggleLatencySort,

    // Pagination
    currentPage,
    totalPages,
    paginatedEndpoints,
    visiblePages,
    goToPage,
    resetPage,

    // Helpers
    getResponseClass
  }
}
