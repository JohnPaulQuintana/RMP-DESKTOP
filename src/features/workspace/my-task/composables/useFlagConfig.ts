import type { FlagInfoItem, FlagSession } from '../../task.types'
import { Users, Coins, Wallet, AlertTriangle } from 'lucide-vue-next'

export const useFlagConfig = () => {
  const flagConfig = {
    multiple_account: {
      icon: Users,
      class: 'multiple-account-icon'
    },
    bonus_abuse: {
      icon: Coins,
      class: 'bonus-abuse-icon'
    },
    no_deposit: {
      icon: Wallet,
      class: 'no-deposit-icon'
    },
    arbitrage: {
      icon: AlertTriangle,
      class: 'arbitrage-icon'
    }
  }

  return { flagConfig }
}

export const getTaskFlagConfig = (
  flag: string,
  flagConfig: ReturnType<typeof useFlagConfig>['flagConfig']
) => {
  const normalizedFlag = flag.toLowerCase()

  // Exact/default flag
  if (flagConfig[normalizedFlag as keyof typeof flagConfig]) {
    return {
      config: flagConfig[normalizedFlag as keyof typeof flagConfig],
      isDefault: true
    }
  }

  // Additional rules use the default flag configuration
  if (normalizedFlag.includes('bonus')) {
    return {
      config: flagConfig.bonus_abuse,
      isDefault: false
    }
  }

  if (normalizedFlag.includes('multiple_account')) {
    return {
      config: flagConfig.multiple_account,
      isDefault: false
    }
  }

  if (normalizedFlag.includes('no_deposit')) {
    return {
      config: flagConfig.no_deposit,
      isDefault: false
    }
  }

  if (normalizedFlag.includes('arbitrage')) {
    return {
      config: flagConfig.arbitrage,
      isDefault: false
    }
  }

  return undefined
}

export const getFlagInfo = (flag: string, session?: FlagSession): FlagInfoItem[] => {
  const data = session?.data

  if (!data) return []

  const normalizedFlag = flag.toLowerCase()
  if (normalizedFlag.includes('arbitrage')) {
    return [
      {
        key: 'info',
        label: '-'
      }
    ]
  }

  if (normalizedFlag.includes('bonus') || normalizedFlag.includes('no_deposit')) {
    return [
      {
        key: 'reason',
        label: data.reason ?? '-'
      }
    ]
  }

  const result: FlagInfoItem[] = []

  if (data.ip_matches?.length) {
    result.push({
      key: 'ip',
      label: 'IP Address'
    })
  }

  if (data.fingerprint_matches?.length) {
    result.push({
      key: 'fingerprint',
      label: 'Fingerprint'
    })
  }

  if (data.cookie_matches?.length) {
    result.push({
      key: 'cookie',
      label: 'Cookies'
    })
  }

  return result
}
