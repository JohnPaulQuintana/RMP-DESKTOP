export type UserStatus = 'pending' | 'approved' | 'blocked'

export interface AccountUser {
  uid: string
  email: string
  role: string
  status: 'pending' | 'approved' | 'blocked'
  created_at: string
  updated_at: string
}

export interface UserResponse {
  success: boolean
  message: string
  data: AccountUser[]
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
  data: {
    reset_link: string
  }
}
