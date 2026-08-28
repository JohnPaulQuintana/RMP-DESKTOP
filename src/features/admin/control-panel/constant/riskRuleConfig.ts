import type { RiskFlag } from '../types/controlPanel.type'

export const FLAG_CONFIG: Record<RiskFlag, { id: number; name: string }> = {
  multiple_account: { id: 1, name: 'Multiple Account' },
  bonus_abuse: { id: 2, name: 'Bonus Abuse' },
  no_deposit: { id: 3, name: 'No Deposit Risk' },
  arbitrage: { id: 4, name: 'Arbitrage' }
}

