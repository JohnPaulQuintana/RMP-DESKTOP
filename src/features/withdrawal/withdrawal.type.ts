export interface AccountGroup {
  id: number;
  group_id: number;
  name: string;
}

export interface WithdrawalTriggers {
  no_deposit?: boolean;
  bonus_abuse?: boolean;
  arbitrage?: boolean;
  multiple_accounts?: boolean;

  [key: string]: boolean | undefined;
}

export interface WithdrawalItem {
  id: number;
  withdrawal_id: string;
  brand: string;
  user_id: string;
  user_name: string;
  currency_type: string;
  create_time: string;
  created_at: string
  account_groups: AccountGroup[];
  triggers: WithdrawalTriggers;
  available_tasks: string[];
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface GetWithdrawalsResponse {
  success: boolean;
  message: string;
  data: {
    items: WithdrawalItem[];
    pagination: Pagination;
  };
}

export interface GetWithdrawalsParams {
  page: number;
  pageSize: number;
  flag?: string;
}

export interface FormattedWithdrawalItem extends WithdrawalItem {
  account_group: string;
  trigger: string[];
  available_tasks: string[]
  formatted_date: string;
  formatted_time: string;
  sort_date: Date;
}


// Task Claim Button Types
export interface ClaimActionPayload {
  withdrawalId: number
  flags: string[]
  user_id: string // or number if your API returns a number
}

export interface MyTaskPayload {
  user_id: string
  status?: string
}

export interface UpdateStatusPayload {
  task_id: number
  status: string
}

export interface TaskResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}




export interface Stats {
  total_available: number
  flags: {
    bonus_abuse: number
    arbitrage: number
    multiple_account: number
    no_deposit: number
  }
}

