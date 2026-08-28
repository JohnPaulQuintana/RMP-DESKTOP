<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import DynamicTable from '@/components/DynamicTable.vue'
import api from '@/services/axios'

/* ========================================
   PROPS
======================================== */

interface Props {
  case_id: number | null
  flag?: string
  isAdditional?: boolean
}

const props = withDefaults(
  defineProps<Props>(),
  {
    flag: '',
    isAdditional: false,
  }
)

/* ========================================
   API TYPES
======================================== */

interface ArbitrageSessionResponse {
  case_id: number
  session_id: number
  transaction_time: string
  reason: ArbitrageReason[]
  data: ArbitrageVendor[]
}

interface ArbitrageReason {
  rule_code: string
  message: string
  txn_ids: number[]
}

interface ArbitrageVendor {
  id: number
  game_type: number
  game_type_name?: string
  summary_date?: string
  vendor_id: number
  vendor_name: string
  bets: ArbitrageBetGroup[]
}

interface ArbitrageBetGroup {
  id: number
  txn_time: number
  settle_time: number
  txn_status: number
  game_name?: string
  game_name_en?: string
  transactions: TransactionRecord[]
}

/* ========================================
   TYPES
======================================== */

interface TableRow {
  [key: string]: unknown
  arbitrage_bets?: ArbitrageBet[]
  rule_code?: string
  message?: string
}

interface TableHeader {
  key: string
  label: string
}

interface GameInfo {
  user_id: string
  id: number
  transaction_detail_id?: number
  game_transaction_detail_id?: number
  game_code?: string | null
  bet_time?: string | null
  market_name: string | null
  match_type: string | null
  created_at?: string
  platform_tx_id?: string | null
  update_time?: string | null
  game_name: string | null
  selection_name?: string | null
  event_name?: string | null
  updated_at?: string
}

interface ManualCheck {
  need_manual_checked: boolean
  manual_check_reason: string | null
}

interface ArbitrageBet {
  id: number
  bet_name: string
  bet_amount: number | null
  net_amount: number | null
  winnings: number | null
  multiplier: number | null
}

interface TransactionRecord {
  id: number
  txn_id: number
  vendor_name: string
  game_info: GameInfo | null
  arbitrage_detection: unknown
  arbitrage_bets: ArbitrageBet[]
  manual_check: ManualCheck | null
}

interface VendorData {
  name: string
  gameType: string
  transactions: TransactionRecord[]
  headers: TableHeader[]
  rows: TableRow[]
}

interface Transaction {
  id: number
  date: string
  vendors: VendorData[]
}

/* ========================================
   API
======================================== */

const {
  data: arbitrageData,
  isLoading,
  isError,
} = useQuery<{ data: ArbitrageSessionResponse[] }>({
  queryKey: computed(() => [
    'arbitrage',
    props.case_id,
    props.isAdditional,
    props.flag,
  ]),

  queryFn: async () => {

    if (!props.case_id) {
      throw new Error('Case ID is required')
    }

    /* ========================================
       ADDITIONAL ARBITRAGE
    ======================================== */

    if (props.isAdditional) {
      const response = await api.post(
        '/risk/withdrawals/custom/flags',
        {
          cases: [
            {
              case_id: props.case_id,
              identities: props.flag,
            },
          ],
        }
      )

      return response.data
    }

    const response = await api.post(
      '/risk/withdrawals/arbitrage',
      {
        ids: [props.case_id],
      }
    )

    return response.data
  },

  enabled: computed(() =>
    Boolean(props.case_id)
  ),
})

/* ========================================
   SELECTED STATE
======================================== */

const selectedTransaction =
  ref<number | null>(null)

const selectedVendor = ref('')

/* ========================================
   FORMAT DATE
======================================== */

function formatDate(value: string) {

  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  )
}

/* ========================================
   TABLE HEADERS
======================================== */

const tableHeaders: TableHeader[] = [

  {
    key: 'rule_code',
    label: 'RULE CODE',
  },

  {
    key: 'vendor_txn',
    label: 'VENDOR / TXN ID',
  },

  {
    key: 'user_id_id',
    label: 'USER ID / ID',
  },

  {
    key: 'game_code_name',
    label: 'GAME CODE / NAME',
  },

  {
    key: 'bet_time',
    label: 'BET TIME',
  },

  {
    key: 'market_match',
    label: 'MARKET NAME / MATCH TYPE',
  },

  {
    key: 'selection_event',
    label: 'SELECTION / EVENT NAME',
  },

  {
    key: 'message',
    label: 'REASON',
  },

  {
    key: 'manual_check',
    label: 'MANUAL CHECK',
  },

]


function getTransactionReasons(txnId: number,reasons: ArbitrageReason[]): ArbitrageReason[] {

  if (!Array.isArray(reasons)) {
    return []
  }

  return reasons.filter(
    reason =>
      Array.isArray(reason.txn_ids) &&
      reason.txn_ids.includes(txnId)
  )
}

/* ========================================
   CHECK IF ROW HAS NO REASON

   These rows will be moved to the bottom.
======================================== */

function isEmptyReasonRow(row: TableRow): boolean {
  const ruleCode = String(row.rule_code ?? '').trim()
  const message = String(row.message ?? '').trim()
  return (
    (ruleCode === '' || ruleCode === '-') &&
    (message === '' || message === '-')
  )
}

/* ========================================
   TRANSACTION DATA
======================================== */

const transactionData =
 computed<Transaction[]>(() => {

    const sessions = arbitrageData.value?.data

    if (!Array.isArray(sessions)) {
      return []
    }

    return sessions.map(
      (session: ArbitrageSessionResponse) => {

        const sessionData =
          Array.isArray(session.data)
            ? session.data
            : []

        const sessionReasons =
          Array.isArray(session.reason)
            ? session.reason
            : []

        const vendors: VendorData[] =
          sessionData

            .filter(
              item =>
                item?.vendor_name
            )

            .map(item => {

              const transactions:
                TransactionRecord[] =
                Array.isArray(item.bets)
                  ? item.bets.flatMap(
                      bet =>
                        Array.isArray(
                          bet.transactions
                        )
                          ? bet.transactions
                          : []
                    )
                  : []

              /* ========================================
                 CREATE TABLE ROWS
              ======================================== */

              const rows: TableRow[] =
                transactions.map(
                  transaction => {

                    const gameInfo =
                      transaction.game_info

                    /* ========================================
                       MATCH REASONS BY TXN ID
                    ======================================== */

                    const matchingReasons =
                      getTransactionReasons(
                        transaction.txn_id,
                        sessionReasons
                      )

                    /* ========================================
                       FORMATTED RULE CODE
                    ======================================== */

                    const ruleCode =
                      matchingReasons

                        .map(reason => {

                          if (!reason.rule_code) {
                            return ''
                          }

                          return reason.rule_code
                            .replace(
                              /_/g,
                              ' '
                            )
                            .replace(
                              /ARBITRAGE /i,
                              'ARBITRAGE\n'
                            )
                        })

                        .filter(Boolean)

                        .join('\n')

                    /* ========================================
                       FORMATTED REASON MESSAGE

                       4 Items => 2 / 2
                       5 Items => 3 / 2
                       Others => 1 per line
                    ======================================== */

                    const reasonMessage =
                      matchingReasons

                        .map(reason => {

                          if (!reason.message) {
                            return ''
                          }

                          const items =
                            reason.message
                              .split(',')
                              .map(
                                item =>
                                  item.trim()
                              )
                              .filter(Boolean)

                          const count =
                            items.length

                          /* 4 ITEMS */

                          if (count === 4) {

                            const line1 =
                              items
                                .slice(0, 2)
                                .join(', ')

                            const line2 =
                              items
                                .slice(2, 4)
                                .join(', ')

                            return `${line1},\n${line2}`
                          }

                          /* 5 ITEMS */

                          if (count === 5) {

                            const line1 =
                              items
                                .slice(0, 3)
                                .join(', ')

                            const line2 =
                              items
                                .slice(3, 5)
                                .join(', ')

                            return `${line1},\n${line2}`
                          }

                          /* DEFAULT */

                          return items.join(',\n')
                        })

                        .filter(Boolean)

                        .join('\n')

                    /* ========================================
                       CREATE ROW
                    ======================================== */

                    const row: TableRow = {

                      vendor_txn:
                        `${transaction.vendor_name || item.vendor_name}\n${transaction.txn_id ?? '-'}`,

                      user_id_id:
                        gameInfo
                          ? `${gameInfo.user_id ?? '-'}\n${gameInfo.id ?? '-'}`
                          : '-',

                      game_code_name:
                        gameInfo
                          ? `${gameInfo.game_code ?? '-'}\n${gameInfo.game_name ?? '-'}`
                          : '-',

                      bet_time:
                        gameInfo?.bet_time ?? '-',

                      market_match:
                        gameInfo
                          ? `${gameInfo.market_name ?? '-'}\n${gameInfo.match_type ?? '-'}`
                          : '-',

                      selection_event:
                        gameInfo
                          ? `${gameInfo.selection_name ?? '-'}\n${gameInfo.event_name ?? '-'}`
                          : '-',

                      rule_code:
                        ruleCode || '-',

                      message:
                        reasonMessage || '-',

                      manual_check:
                        transaction
                          .manual_check
                          ?.need_manual_checked === true
                          ? 'Required'
                          : 'Not Required',

                      arbitrage_bets:
                        transaction.arbitrage_bets ?? [],
                    }

                    return row
                  }
                )

              /* ========================================
                 SORT TABLE ROWS

                 ROWS WITH RULE + REASON
                 -> TOP

                 ROWS WITH "-" FOR BOTH
                 -> BOTTOM

                 Stable order is preserved inside
                 each group.
              ======================================== */

              rows.sort(
                (a, b) => {

                  const aEmpty =
                    isEmptyReasonRow(a)

                  const bEmpty =
                    isEmptyReasonRow(b)

                  /* a has reason, b doesn't */

                  if (
                    !aEmpty &&
                    bEmpty
                  ) {
                    return -1
                  }

                  /* a doesn't have reason,
                     b does */

                  if (
                    aEmpty &&
                    !bEmpty
                  ) {
                    return 1
                  }

                  /* Same group:
                     preserve original order */

                  return 0
                }
              )

              /* ========================================
                 RETURN VENDOR DATA
              ======================================== */

              return {

                name:
                  item.vendor_name,

                gameType:
                  item.game_type_name ?? '',

                transactions,

                headers:
                  tableHeaders,

                rows,
              }
            })

        /* ========================================
           RETURN SESSION
        ======================================== */

        return {

          id:
            session.session_id,

          date:
            formatDate(
              session.transaction_time
            ),

          vendors,
        }
      }
    )
  })

/* ========================================
   AUTO SELECT FIRST TRANSACTION
======================================== */

watch(
  transactionData,

  transactions => {

    if (!transactions.length) {

      selectedTransaction.value =
        null

      selectedVendor.value =
        ''

      return
    }

    const transactionExists =
      transactions.some(
        transaction =>
          transaction.id ===
          selectedTransaction.value
      )

    if (!transactionExists) {

      const firstTransaction =
        transactions[0]

      if (firstTransaction) {

        selectTransaction(
          firstTransaction.id
        )
      }
    }
  },

  {
    immediate: true,
  }
)

/* ========================================
   CURRENT TRANSACTION
======================================== */

const currentTransaction =
  computed(() => {

    if (
      selectedTransaction.value ===
      null
    ) {
      return undefined
    }

    return transactionData.value.find(
      transaction =>
        transaction.id ===
        selectedTransaction.value
    )
  })

/* ========================================
   CURRENT VENDORS
======================================== */

const vendors =
  computed<VendorData[]>(() => {

    return (
      currentTransaction.value
        ?.vendors ?? []
    )
  })

/* ========================================
   CURRENT VENDOR
======================================== */

const currentVendor =
  computed<VendorData | undefined>(() => {

    return vendors.value.find(
      vendor =>
        vendor.name ===
        selectedVendor.value
    )
  })

/* ========================================
   CURRENT TABLE HEADERS
======================================== */

const currentHeaders =
  computed<TableHeader[]>(() => {

    return (
      currentVendor.value
        ?.headers ?? []
    )
  })

/* ========================================
   CURRENT TABLE ROWS
======================================== */

const currentRows =
  computed<TableRow[]>(() => {

    return (
      currentVendor.value
        ?.rows ?? []
    )
  })

/* ========================================
   SELECT TRANSACTION
======================================== */

function selectTransaction(
  transactionId: number
) {

  selectedTransaction.value =
    transactionId

  const transaction =
    transactionData.value.find(
      item =>
        item.id ===
        transactionId
    )

  if (!transaction) {

    selectedVendor.value =
      ''

    return
  }

  selectedVendor.value =
    transaction
      .vendors[0]
      ?.name ?? ''
}

/* ========================================
   SELECT VENDOR
======================================== */

function selectVendor(
  vendorName: string
) {

  selectedVendor.value =
    vendorName
}

</script>

<template>

  <div class="review-wrapper">

    <!-- TRANSACTION HEADER -->

    <div class="header-section">

      <div class="transaction-container">

        <div class="transaction-header">

          <div
            v-for="transaction in transactionData"
            :key="transaction.id"
            class="transaction-item"
            :class="{
              active:
                selectedTransaction ===
                transaction.id,
            }"
            @click="
              selectTransaction(
                transaction.id
              )
            "
          >

            <span class="transaction-label">

              Transaction

              <span class="transaction-number">
                #{{ transaction.id }}
              </span>

            </span>

            <span class="transaction-value">
              {{ transaction.date }}
            </span>

          </div>

        </div>

      </div>

    </div>

    <!-- CONTENT AREA -->

    <div class="content-section">

      <!-- LEFT SIDE - VENDORS -->

      <div class="left-panel">

        <div class="left-panel-header">
          Vendor Name
        </div>

        <div class="vendor-list">

          <div
            v-for="vendor in vendors"
            :key="`${vendor.name}-${vendor.gameType}`"
            class="vendor-item"
            :class="{
              active:
                selectedVendor ===
                vendor.name,
            }"
            @click="
              selectVendor(
                vendor.name
              )
            "
          >

            <div class="vendor-detail">

              <span class="vendor-name">
                {{ vendor.name }}
              </span>

              <span class="vendor-game-type">
                {{ vendor.gameType }}
              </span>

            </div>

          </div>

          <div
            v-if="
              !vendors.length &&
              !isLoading &&
              !isError
            "
            class="vendor-empty"
          >
            No vendors available
          </div>

        </div>

      </div>

      <!-- RIGHT SIDE - TABLE -->

      <div class="right-panel">

        <div class="right-panel-header">
          Transaction Records
        </div>

        <!-- LOADING -->

        <div
          v-if="isLoading"
          class="table-state"
        >
          Loading arbitrage data...
        </div>

        <!-- ERROR -->

        <div
          v-else-if="isError"
          class="table-state error"
        >
          Failed to load arbitrage data.
        </div>

        <!-- TABLE -->

        <DynamicTable
          v-else
          :headers="currentHeaders"
          :rows="currentRows"
          empty-message="No records available for this vendor."
          :min-width="1400"
        />

      </div>

    </div>

  </div>

</template>

<style scoped>

/* ========================================
   MAIN WRAPPER
======================================== */

.review-wrapper {
  width: 100%;
  height: 100%;
  max-height: 100%;
  padding: 14px 20px 24px;
  box-sizing: border-box;

  font-family:
    'Inter',
    system-ui,
    sans-serif;

  color: #1f2937;

  display: flex;
  flex-direction: column;

  overflow: hidden;
}

/* ========================================
   TRANSACTION HEADER
======================================== */

.header-section {
  width: 100%;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.transaction-container {
  width: 100%;

  background: #ffffff;

  border: 1px solid #e5e7eb;
  border-radius: 12px;

  box-shadow:
    0 1px 3px
    rgba(0, 0, 0, 0.05);

  overflow-x: auto;
  overflow-y: hidden;

  scrollbar-width: thin;

  scrollbar-color:
    #cbd5e1
    #f8fafc;
}

.transaction-container::-webkit-scrollbar {
  height: 6px;
}

.transaction-container::-webkit-scrollbar-track {
  background: #f8fafc;
}

.transaction-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.transaction-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.transaction-header {
  display: flex;

  width: max-content;
  min-width: 100%;
}

.transaction-item {
  min-width: 180px;

  padding: 14px 20px;

  display: flex;
  flex-direction: column;

  justify-content: center;

  gap: 5px;

  border-right:
    1px solid #e5e7eb;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.transaction-item:last-child {
  border-right: none;
}

.transaction-item:hover {
  background: #f8fafc;
}

.transaction-item.active {
  background: #fff1f3;

  border-bottom:
    3px solid #f14668;
}

.transaction-item.active
.transaction-value {
  color: #f14668;
}

.transaction-label {
  font-size: 11px;

  font-weight: 600;

  text-transform: uppercase;

  letter-spacing: 0.05em;

  color: #64748b;

  white-space: nowrap;
}

.transaction-number {
  margin-left: 4px;

  font-size: 13px;

  font-weight: 800;

  color: #1f2937;
}

.transaction-value {
  font-size: 14px;

  font-weight: 600;

  color: #1f2937;

  white-space: nowrap;
}

/* ========================================
   MAIN CONTENT
======================================== */

.content-section {
  width: 100%;

  display: grid;

  grid-template-columns:
    220px minmax(0, 1fr);

  gap: 16px;

  align-items: stretch;

  flex: 1;

  min-height: 0;
}

/* ========================================
   LEFT PANEL
======================================== */

.left-panel {
  width: 220px;
  min-width: 220px;

  height: 100%;
  min-height: 0;

  background: #ffffff;

  border:
    1px solid #e5e7eb;

  border-radius: 12px;

  overflow: hidden;

  box-shadow:
    0 1px 3px
    rgba(0, 0, 0, 0.05);

  display: flex;
  flex-direction: column;
}

.left-panel-header {
  flex-shrink: 0;

  padding: 14px 16px;

  background: #f9fafb;

  border-bottom:
    1px solid #e5e7eb;

  font-size: 13px;

  font-weight: 700;

  color: #334155;
}

.vendor-list {
  width: 100%;

  flex: 1;

  min-height: 0;

  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-width: thin;

  scrollbar-color:
    #cbd5e1
    #f8fafc;
}

.vendor-list::-webkit-scrollbar {
  width: 7px;
}

.vendor-list::-webkit-scrollbar-track {
  background: #f8fafc;
}

.vendor-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;

  border-radius: 10px;
}

.vendor-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.vendor-item {
  width: 100%;

  min-height: 62px;

  padding: 12px 16px;

  display: flex;

  align-items: center;

  box-sizing: border-box;

  border-bottom:
    1px solid #f1f5f9;

  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.vendor-item:last-child {
  border-bottom: none;
}

.vendor-item:hover {
  background: #f8fafc;
}

.vendor-item.active {
  background: #fff1f3;

  border-left:
    3px solid #f14668;

  padding-left: 13px;
}

.vendor-detail {
  display: flex;

  flex-direction: column;

  gap: 3px;

  line-height: 1.4;
}

.vendor-name {
  font-size: 13px;

  font-weight: 800;

  color: #1f2937;
}

.vendor-game-type {
  font-size: 12px;

  font-weight: 500;

  color: #64748b;
}

.vendor-item.active
.vendor-name {
  color: #f14668;
}

.vendor-empty {
  padding: 20px 16px;

  font-size: 12px;

  color: #94a3b8;

  text-align: center;
}

/* ========================================
   RIGHT PANEL
======================================== */

.right-panel {
  min-width: 0;
  min-height: 0;

  height: 100%;

  background: #ffffff;

  border:
    1px solid #e5e7eb;

  border-radius: 12px;

  overflow: hidden;

  box-shadow:
    0 1px 3px
    rgba(0, 0, 0, 0.05);

  display: flex;

  flex-direction: column;
}

.right-panel-header {
  flex-shrink: 0;

  padding: 14px 16px;

  background: #f9fafb;

  border-bottom:
    1px solid #e5e7eb;

  font-size: 13px;

  font-weight: 700;

  color: #334155;
}

.table-state {
  flex: 1;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 30px;

  font-size: 13px;

  color: #94a3b8;
}

.table-state.error {
  color: #e11d48;
}

/* ========================================
   MOBILE
======================================== */

@media (max-width: 768px) {

  .review-wrapper {
    padding: 10px;
  }

  .content-section {
    grid-template-columns: 1fr;
  }

  .left-panel {
    width: 100%;

    min-width: 0;

    max-height: 200px;
  }

  .transaction-item {
    min-width: 160px;

    padding: 12px 16px;
  }

  .transaction-label {
    font-size: 10px;
  }

  .transaction-number {
    font-size: 12px;
  }

  .transaction-value {
    font-size: 13px;
  }
}

</style>
