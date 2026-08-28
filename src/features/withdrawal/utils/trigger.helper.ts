import type { TriggerConfig } from '../composables/useTriggerConfig'

export const getTriggerKey = (trigger: string, triggerConfig: TriggerConfig): keyof TriggerConfig | null => {
  const normalizedTrigger = trigger.toLowerCase()

  return (
    Object.keys(triggerConfig).find((key) =>
      normalizedTrigger.includes(key.toLowerCase()),
    ) as keyof TriggerConfig | undefined
  ) ?? null
}

export const getTriggerConfig = (trigger: string, triggerConfig: TriggerConfig) => {
  const key = getTriggerKey(trigger, triggerConfig)

  if (!key) {
    return null
  }

  return triggerConfig[key]
}

export const isAdditionalTrigger = (trigger: string, triggerConfig: TriggerConfig): boolean => {
  const key = getTriggerKey(trigger, triggerConfig)

  if (!key) {
    return false
  }

  return trigger.toLowerCase() !== key.toLowerCase()
}

export const getGroupedTriggers = (triggers: string[], triggerConfig: TriggerConfig,): string[] => {
  const grouped: string[] = []

  for (const key of Object.keys(triggerConfig)) {
    const matches = triggers.filter((trigger) => getTriggerKey(trigger, triggerConfig) === key)

    const baseTrigger = matches.find((trigger) => trigger.toLowerCase() === key.toLowerCase(),)

    if (baseTrigger) {
      grouped.push(baseTrigger)
    }

    const additionalTriggers = matches.filter((trigger) => trigger.toLowerCase() !== key.toLowerCase(),)

    grouped.push(...additionalTriggers)
  }

  return grouped
}
