import {
  Users,
  Coins,
  Wallet,
  AlertTriangle,
} from 'lucide-vue-next'

export const triggerConfig = {
  multiple_account: {
    icon: Users,
    class: 'multiple-account-icon',
    wrapperClass: 'flag-icon-item',
  },

  bonus_abuse: {
    icon: Coins,
    class: 'bonus-abuse-icon',
    wrapperClass: 'flag-icon-item',
  },

  no_deposit: {
    icon: Wallet,
    class: 'no-deposit-icon',
    wrapperClass: 'flag-icon-item',
  },

  arbitrage: {
    icon: AlertTriangle,
    class: 'arbitrage-icon',
    wrapperClass: 'flag-icon-item',
  },
}

export type TriggerConfig = typeof triggerConfig

export function useTriggerConfig() {
  return {
    triggerConfig,
  }
}
