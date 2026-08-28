import api from '@/services/axios';
import type { GetWithdrawalsParams, GetWithdrawalsResponse, Stats } from '../withdrawal.type';

const API_URL = 'risk/withdrawals';

export const getWithdrawals = async ({ page, pageSize }: GetWithdrawalsParams): Promise<GetWithdrawalsResponse> => {
  try {
    const response = await api.get<GetWithdrawalsResponse>(`${API_URL}/all`, {
      params: {
        page,
        page_size: pageSize,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch withdrawals:', error);
    throw error;
  }
};


export const getStats = async (): Promise<Stats> => {
  try {
    const response = await api.get(`${API_URL}/status`)

    return response.data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    throw error
  }
}

