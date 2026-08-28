export const formatFlag = (flag: string): string => {
  if (!flag) return ''

  return flag
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}


export const formatStatus = (status: string): string => {
  if (!status) return ''

  return status
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}


export const formatDate = (date: string) => {
  const d = new Date(date)

  return {
    date: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d),

    time: new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(d)
  }
}
