import api from '@/services/axios'
import type { ClaimActionPayload, MyTaskPayload, UpdateStatusPayload, TaskResponse } from '../withdrawal.type'

const API_URL = '/users'

export const claimAction = async (payload: ClaimActionPayload): Promise<TaskResponse> => {
  console.log('Payload:', payload)

  const { data } = await api.post<TaskResponse>(
    `${API_URL}/actions`,
    payload,
  )

  return data
}

export const myTask = async (payload: MyTaskPayload): Promise<TaskResponse> => {

  console.log('Payload:', payload)
  const { data } = await api.get<TaskResponse>(
    `${API_URL}/tasks`,
    {
      params: payload,
    },
  )

  return data
}

export const updateStatus = async (payload: UpdateStatusPayload): Promise<TaskResponse> => {
  const { data } = await api.patch<TaskResponse>(
    `${API_URL}/task/status`,
    payload,
  )

  return data
}
