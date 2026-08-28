import type { LucideIcon } from 'lucide-vue-next'


// =========================
// Flag Keys
// =========================

export type FlagType =
  | 'multiple_account'
  | 'bonus_abuse'
  | 'no_deposit'
  | 'arbitrage'

// =========================
// Payloads
// =========================
export interface MyTaskPayload {
  user_id: string
  status: 'inprogress' | 'completed' | ''
}
export interface UpdateStatusPayload {
  action_id: number
  status: 'completed' | 'inprogress'
}

// =========================
// Session / Flag Types
// =========================
export interface SessionData {
  reason?: string
  ip_matches?: unknown[]
  fingerprint_matches?: unknown[]
  cookie_matches?: unknown[]
}
export interface FlagSession {
  data?: SessionData
}
export interface FlagInfoItem {
  key: string
  label?: string
  icon?: LucideIcon
}

// =========================
// Task Action
// =========================
export interface MyTaskAction {
  id: number
  case_id: number
  withdrawal_id: string
  user_id: string
  status: string
  flag: FlagType
  created_at: string
  can_complete: boolean
  session?: FlagSession
}

// =========================
// API Response
// =========================
export interface TaskResponse {
  action: MyTaskAction
  session?: FlagSession
}

export interface MyTaskResponse {
  success: boolean
  message?: string
  data: TaskResponse[]
}

// =========================
// Grouped Table Row
// =========================
export interface MyTaskRow {
  withdrawal_id: string
  user_id: string
  status: string
  created_at: string
  actions: MyTaskAction[]
}

// =========================
// Update Response
// =========================
export interface UpdateStatusResponse {
  success: boolean
  message: string
  data?: unknown
}
