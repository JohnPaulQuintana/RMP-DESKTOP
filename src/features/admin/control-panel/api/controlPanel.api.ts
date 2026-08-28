import api from '@/services/axios'
import type { RiskRuleResponse, RiskRule, RiskRuleFieldsResponse, CasinoGame,  CasinoGameUpdateResponse, RegisterRiskRulePayload  } from '../types/controlPanel.type'

const API_URL = 'risk-rules'
const API_URL2 = 'custom/flags'

export const getRiskRules = async (flag: string): Promise<RiskRuleResponse> => {
  const response = await api.get<RiskRuleResponse>(API_URL, {
    params: {
      flag
    }
  })

  return response.data
}

export const updateRules = async (id: number, flag: string, payload: RiskRule): Promise<RiskRule> => {
  const response = await api.put<RiskRule>(`${API_URL}/${id}`, payload,{
    params: {
      flag
    }
  })

  return response.data
}


export const CasinoGamesRule = async (id: number, payload: CasinoGame): Promise<CasinoGameUpdateResponse> => {
  const response = await api.put<CasinoGameUpdateResponse>(
    `${API_URL}/casino-games/${id}`,
    payload
  )

  return response.data
}


export const getFlagField = async (flag: string): Promise<RiskRuleFieldsResponse> => {
  const response = await api.get<RiskRuleFieldsResponse>(`${API_URL2}/${flag}/fields`)

  return response.data
}


export const registerNewFlag = async (payload: RegisterRiskRulePayload) => {
  const response = await api.post(
    `${API_URL}/register`,
    payload
  )

  return response.data
}