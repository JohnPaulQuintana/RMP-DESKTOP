import api from '@/services/axios'

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload
} from '../auth.type'


const API_URL = '/auth'

export const register = async (
  payload: RegisterPayload
): Promise<AuthResponse> => {

  const response = await api.post<AuthResponse>(
    `${API_URL}/register`,
    payload
  )

  return response.data
}

export const login = async (
  payload: LoginPayload
): Promise<AuthResponse> => {

  const response = await api.post<AuthResponse>(
    `${API_URL}/login`,
    payload
  )

  return response.data
}

export const firebaseLogin = async (
  idToken: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    `${API_URL}/google`,
    {
      id_token: idToken,
    }
  )

  return response.data
}

// export const currentUser = async (): Promise<AuthResponse> => {

//   const response = await api.get<AuthResponse>(
//     `${API_URL}/me`
//   )

//   return response.data
// }
