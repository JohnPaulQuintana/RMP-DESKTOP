import { computed, type Ref } from 'vue'
import type {
  RiskRuleGroup,
  Flag,
  RiskFlag,
} from '../types/controlPanel.type'

const formatFlagName = (value: string) => {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

export function useControlPanelFlags(
  data: Ref<RiskRuleGroup[] | undefined>
) {
  const flags = computed<Flag[]>(() => {
    const response = data.value ?? []

    return response.map(group => {
      const firstRule = group.rules[0]

      const rules = group.rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        code: rule.code,

        // Single flag value from the rule
        flag: rule.flag,

        // Array of flags from the rule
        flags: rule.flags,

        priority: rule.priority,
        enabled: rule.enabled,
        description: rule.description,

        conditions: rule.conditions.map(condition => ({
          id: condition.id,
          type: condition.type,
          field: condition.field,
          operator: condition.operator,
          value: condition.value,
          value_field: condition.value_field,
        })),

        casino_games: rule.casino_games ?? [],
      }))

      /*
       * flag  = single value
       * flags = array of values
       *
       * Example:
       * flag  -> "multiple_account"
       * flags -> ["multiple_account"]
       */
      const flag = group.flag

      const flagsArray =
        firstRule?.flags?.length
          ? firstRule.flags
          : [group.flag]

      return {
        id: firstRule?.id ?? 0,

        name: formatFlagName(group.flag),

        code: group.flag as RiskFlag,

        // SINGLE FLAG
        flag,

        // GLOBAL STATUS
        enabled: group.rules.some(rule => rule.enabled),

        description: firstRule?.description ?? '',

        casino_games:
          group.rules.find(
            rule => rule.code === 'CASINO_ARBITRAGE'
          )?.casino_games ?? [],

        rules,

        // ARRAY OF FLAGS
        flags: flagsArray,
      }
    })
  })

  return {
    flags,
  }
}
