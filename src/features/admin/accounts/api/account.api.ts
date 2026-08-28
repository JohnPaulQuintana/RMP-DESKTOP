import api from '@/services/axios'
import type { AccountUser, UserResponse, ResetPasswordResponse  } from '../account.type'

const API_URL = 'users'

export const getUsers = async (): Promise<UserResponse> => {
  const response = await api.get<UserResponse>(API_URL)

  return response.data
}

export const approveUsers = async (uid: string | number): Promise<AccountUser> => {
  const response = await api.patch<AccountUser>(`${API_URL}/${uid}/approve`)

  return response.data
}

export const blockUsers = async (uid: string | number): Promise<AccountUser> => {
  const response = await api.patch<AccountUser>(`${API_URL}/${uid}/block`)

  return response.data
}

export const forgetPassword = async (email: string): Promise<ResetPasswordResponse> => {
  const response = await api.post('auth/forgot-password', {email})

  return response.data
}
