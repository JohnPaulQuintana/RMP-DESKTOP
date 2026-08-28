// =========================
// Risk Rules Types
// =========================

export interface RiskRuleResponse {
  total: number
  rules: RiskRule[]
}


export interface RiskRuleGroup {
  flag: RiskFlag
  rules: RiskRule[]

}


export interface RiskRule {
  id: number
  name: string
  code: string
  flag: string
  flags: string[]
  priority: number
  enabled: boolean
  description: string
  conditions: RiskCondition[]
  casino_games?: CasinoGame[]
}

export interface RiskCondition {
  id: number
  field: string
  operator: string
  value: string
  value_field: string | number | null
  type?: string
}


// =========================
// Enum Types
// =========================

export type RiskFlag =
  | 'multiple_account'
  | 'bonus_abuse'
  | 'no_deposit'
  | 'arbitrage'


export type ConditionOperator =
  | '=='
  | '>'
  | '<'
  | '>='
  | '<='
  | '!='
  | ''


  // =========================
// Editor Types
// =========================

export interface Condition {
  id: number
  field: string
  operator: string
  value: string
  value_field: string | number
}

export interface Rule {
  id: number
  name: string
  code: string
  priority: number
  enabled: boolean
  description: string
  conditions: Condition[]
  casino_games?: CasinoGame[]
}


export interface Flag {
  id: number
  name: string
  code: RiskFlag
  enabled: boolean
  description: string
  casino_games: CasinoGame[]
  rules: RiskRule[]
  flag: string
  flags: string[]
}


export type UpdateRulePayload = RiskRule



export interface CasinoGame {
  id: number
  game_name: string
  enabled: boolean
  coverage: number
  priority: number
  description: string
  codes: string[]
  conflict_rules: string[][]
}

export interface CasinoGameUpdateResponse {
  message: string
  game: CasinoGame
}


// =========================
// Custom Flag Fields Types
// =========================

export interface RiskRuleField {
  name: string
  type: string
  sample_value: string | number
  operators: string[]
}

export interface RiskRuleSampleCondition {
  id: number
  type: string
  field: string
  operator: string
  value: boolean
  value_field: string
}

export interface RiskRuleSampleRule {
  rule_id: number
  rule_code: string
  flag: string
  flags: string[]
  conditions: RiskRuleSampleCondition[]
}

export interface RiskRuleFieldsResponse {
  flag: string
  fields: RiskRuleField[]
  condition_types: string[]
  sample_rules: RiskRuleSampleRule[]
}

export interface RegisterRiskRulePayload {
  name: string
  code: string
  flag: string
  flags: string[]
  conditions: {
    id?: number
    type: string
    field: string
    operator: string
    value: boolean | string | number
    value_field: string | number | boolean
  }[]
}
