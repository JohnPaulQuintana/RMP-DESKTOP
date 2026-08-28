export interface LoginPayload {
  email: string
  password: string
}

export interface User {
  id?: number
  uid: string
  email: string
  role: string
  status?: string
}
export interface AuthResponse {
  success: boolean
  message?: string

  data: {
    user: User
    access_token: string
  }
}

export interface RegisterPayload {
  email: string
  password: string
}

export interface RegisterResponse {
  success: boolean
  message?: string

  data: {
    uid: string
    email: string
    role: string
    status: string
  }
}
