import api from '@/services/axios'

import type { MyTaskPayload, MyTaskResponse, UpdateStatusPayload, UpdateStatusResponse } from '../task.types'

const API_URL = '/users'

export const myTask = async (payload: MyTaskPayload): Promise<MyTaskResponse> => {
  const response = await api.get<MyTaskResponse>(
    `${API_URL}/tasks`, {params: payload}
  )
  return response.data
}

export const updateStatus = async (payload: UpdateStatusPayload): Promise<UpdateStatusResponse> => {
  const response = await api.patch<UpdateStatusResponse>(
    `${API_URL}/task/status`, payload
  )
  return response.data
}
