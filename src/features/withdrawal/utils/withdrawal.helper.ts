import type {
  AccountGroup,
  WithdrawalItem,
  FormattedWithdrawalItem,
} from '../withdrawal.type'


export const formatAccountGroup = (accountGroups: AccountGroup[]) => {
  const accountGroup = accountGroups?.map(group => group.name).join(', ')

  return accountGroup?.toLowerCase().includes('kyc complete') ? 'Verified': 'Not Verified'
}


export const formatTriggers = (triggers: Record<string, boolean | undefined>) => {
  if (!triggers) return []

  return Object.entries(triggers)
    .filter(([, value]) => value === true)
    .map(([key]) => key)
}


export const formatDate = (date: string) => {
  if (!date) {
    return {
      date: '',
      time: '',
    }
  }
  const parsedDate = new Date(date)
  return {
    date: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(parsedDate),

    time: new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(parsedDate),
  }
}


export const formatWithdrawalData = (withdrawal: WithdrawalItem): FormattedWithdrawalItem => {
  const formattedDate = formatDate(withdrawal.created_at)

  return {
    ...withdrawal,

    account_group: formatAccountGroup(
      withdrawal.account_groups
    ),
    trigger: formatTriggers(
      withdrawal.triggers
    ),
    formatted_date: formattedDate.date,

    formatted_time: formattedDate.time,
    sort_date: new Date(
      withdrawal.created_at
    ),
  }
}
