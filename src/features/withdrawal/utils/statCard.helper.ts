import { CircleHelp } from 'lucide-vue-next'
import type { Component } from 'vue'

type StatCardType = 'success' | 'danger' | 'warning' | 'info'

type StatCardConfig = {
  title: string
  icon: Component
  type: StatCardType
}

const DEFAULT_TRIGGER_MAP: Record<string, string> = {
  multiple_account: 'multiple_account',
  bonus_abuse: 'bonus_abuse',
  no_deposit: 'no_deposit',
  arbitrage: 'arbitrage',
}

const DEFAULT_TYPES: Record<string, StatCardType> = {
  multiple_account: 'success',
  bonus_abuse: 'danger',
  no_deposit: 'success',
  arbitrage: 'warning',
}

export function getStatCardTriggerKey(flag: string): string {
  if (DEFAULT_TRIGGER_MAP[flag]) {
    return DEFAULT_TRIGGER_MAP[flag]
  }

  if (flag.startsWith('multiple_account')) {
    return 'multiple_account'
  }

  if (flag.startsWith('extend_bonus') || flag.startsWith('bonus_abuse')) {
    return 'bonus_abuse'
  }

  if (flag.startsWith('arbitrage') || flag.includes('sport_arbitrage')) {
    return 'arbitrage'
  }

  if (flag.startsWith('no_deposit')) {
    return 'no_deposit'
  }

  return 'multiple_account'
}

export function getStatCardConfig(
  flag: string,
  triggerConfig: Record<string, { icon: Component }>
): StatCardConfig {
  const triggerKey = getStatCardTriggerKey(flag)
  const config = triggerConfig[triggerKey]

  return {
    title: formatFlagTitle(flag),
    icon: config?.icon ?? CircleHelp,
    type: DEFAULT_TYPES[triggerKey] ?? 'success',
  }
}

function formatFlagTitle(flag: string): string {
  return flag
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
