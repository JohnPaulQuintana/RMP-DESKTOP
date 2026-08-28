export const formatDate = (date: string | null | undefined): string => {
  if (!date) {
    return '-'
  }

  return new Date(date).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }
  )
}
