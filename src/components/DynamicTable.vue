<script setup lang="ts">

import { ref } from 'vue'


/* ========================================
   TYPES
======================================== */

interface TableRow {
  [key: string]: unknown
}

interface TableHeader {
  key: string
  label: string
}

interface ArbitrageBet {
  id: number
  bet_name: string
  bet_amount: number | null
  net_amount: number | null
  winnings: number | null
  multiplier: number | null
}

interface Props {
  headers: TableHeader[]
  rows: TableRow[]
  emptyMessage?: string
  minWidth?: number
}


/* ========================================
   PROPS
======================================== */

const props = withDefaults(
  defineProps<Props>(),
  {
    emptyMessage: 'No transaction records found.',
    minWidth: 850,
  }
)


/* ========================================
   EXPANDED ROW
======================================== */

const expandedRow = ref<number | null>(null)


/* ========================================
   GET CELL VALUE
======================================== */

function getCellValue(
  row: TableRow,
  key: string
): unknown {

  return row[key] ?? '-'
}


/* ========================================
   CHECK MULTI-LINE VALUE
======================================== */

function isMultiline(
  value: unknown
): boolean {

  return (
    typeof value === 'string' &&
    value.includes('\n')
  )
}


/* ========================================
   SPLIT CELL INTO LINES
======================================== */

function getCellLines(
  value: unknown
): string[] {

  if (
    value === null ||
    value === undefined
  ) {
    return ['-']
  }

  return String(value).split('\n')
}


/* ========================================
   GET ARBITRAGE BETS
======================================== */

function getArbitrageBets(
  row: TableRow
): ArbitrageBet[] {

  const bets = row.arbitrage_bets

  if (!Array.isArray(bets)) {
    return []
  }

  return bets as ArbitrageBet[]
}


/* ========================================
   TOGGLE ARBITRAGE BETS
======================================== */

function toggleRow(
  rowIndex: number
) {

  if (
    expandedRow.value === rowIndex
  ) {

    expandedRow.value = null

    return
  }

  expandedRow.value = rowIndex
}


/* ========================================
   FORMAT NUMBER
======================================== */

function formatNumber(
  value: number | null
): string {

  if (
    value === null ||
    value === undefined
  ) {
    return '-'
  }

  return value.toLocaleString(
    'en-US',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )
}

</script>


<template>

  <div class="table-container">

    <!-- ========================================
         EMPTY STATE
    ======================================== -->

    <div
      v-if="!props.rows.length"
      class="table-empty"
    >
      {{ props.emptyMessage }}
    </div>


    <!-- ========================================
         TABLE
    ======================================== -->

    <table
      v-else
      class="dynamic-table"
      :style="{
        minWidth: `${props.minWidth}px`
      }"
    >

      <!-- ======================================
           TABLE HEADER
      ======================================= -->

      <thead>

        <tr>

          <th
            v-for="header in props.headers"
            :key="header.key"
          >
            {{ header.label }}
          </th>

        </tr>

      </thead>


      <!-- ======================================
           TABLE BODY
      ======================================= -->

      <tbody>

        <template
          v-for="(
            row,
            rowIndex
          ) in props.rows"
          :key="rowIndex"
        >

          <!-- ==================================
               MAIN TRANSACTION ROW
          =================================== -->

          <tr
            class="transaction-row"
            :class="{
              'transaction-row-expanded':
                expandedRow === rowIndex
            }"
          >

            <td
              v-for="(
                header,
                columnIndex
              ) in props.headers"
              :key="header.key"
            >

              <div class="cell-wrapper">

                <!-- ==============================
                     MULTI-LINE CELL
                =============================== -->

                <div
                  v-if="
                    isMultiline(
                      getCellValue(
                        row,
                        header.key
                      )
                    )
                  "
                  class="cell-lines"
                >

                  <span
                    v-for="(
                      line,
                      lineIndex
                    ) in getCellLines(
                      getCellValue(
                        row,
                        header.key
                      )
                    )"
                    :key="lineIndex"
                    :class="{
                      'cell-primary':
                        lineIndex === 0,

                      'cell-secondary':
                        lineIndex > 0
                    }"
                  >
                    {{ line }}
                  </span>

                </div>


                <!-- ==============================
                     NORMAL CELL
                =============================== -->

                <span
                  v-else
                  class="cell-normal"
                >
                  {{
                    getCellValue(
                      row,
                      header.key
                    )
                  }}
                </span>


                <!-- ==============================
                     BET TOGGLE

                     Only show this on
                     the first column.
                =============================== -->

                <button
                  v-if="
                    columnIndex === 0 &&
                    getArbitrageBets(row).length
                  "
                  type="button"
                  class="bets-toggle"
                  @click.stop="
                    toggleRow(rowIndex)
                  "
                >

                  <span class="bets-count">
                    {{
                      getArbitrageBets(row).length
                    }}
                    {{
                      getArbitrageBets(row).length === 1
                        ? 'Bet'
                        : 'Bets'
                    }}
                  </span>

                  <span
                    class="bets-arrow"
                    :class="{
                      rotated:
                        expandedRow ===
                        rowIndex
                    }"
                  >
                    ▼
                  </span>

                </button>

              </div>

            </td>

          </tr>


          <!-- ==================================
               EXPANDED ARBITRAGE BETS
          =================================== -->

          <tr
            v-if="
              expandedRow === rowIndex &&
              getArbitrageBets(row).length
            "
            class="bets-expanded-row"
          >

            <td
              :colspan="props.headers.length"
              class="bets-expanded-cell"
            >

              <div class="bets-dropdown">

                <!-- ==================================
                     DROPDOWN HEADER
                =================================== -->

                <div class="bets-dropdown-header">

                  <div class="bets-title">
                    Arbitrage Bets
                  </div>

                  <div class="bets-total">
                    {{
                      getArbitrageBets(row).length
                    }}
                    {{
                      getArbitrageBets(row).length === 1
                        ? 'Bet'
                        : 'Bets'
                    }}
                  </div>

                </div>


                <!-- ==================================
                     BETS TABLE
                =================================== -->

                <div class="bets-table-wrapper">

                  <table class="bets-table">

                    <thead>

                      <tr>

                        <th>
                          Bet Name
                        </th>

                        <th>
                          Bet Amount
                        </th>

                        <th>
                          Net Amount
                        </th>

                        <th>
                          Winnings
                        </th>

                        <th>
                          Multiplier
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      <tr
                        v-for="bet in getArbitrageBets(row)"
                        :key="bet.id"
                      >

                        <td class="bet-name">
                          {{ bet.bet_name }}
                        </td>

                        <td>
                          {{
                            formatNumber(
                              bet.bet_amount
                            )
                          }}
                        </td>

                        <td>
                          {{
                            formatNumber(
                              bet.net_amount
                            )
                          }}
                        </td>

                        <td>
                          {{
                            formatNumber(
                              bet.winnings
                            )
                          }}
                        </td>

                        <td>
                          {{
                            formatNumber(
                              bet.multiplier
                            )
                          }}
                        </td>

                      </tr>

                    </tbody>

                  </table>

                </div>

              </div>

            </td>

          </tr>

        </template>

      </tbody>

    </table>

  </div>

</template>


<style scoped>

/* ========================================
   TABLE CONTAINER
======================================== */

.table-container {
  width: 100%;
  height: 100%;

  flex: 1;
  min-height: 0;

  overflow-x: auto;
  overflow-y: auto;

  background: #ffffff;

  scrollbar-width: thin;

  scrollbar-color:
    #cbd5e1
    #f8fafc;
}

.table-container::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

.table-container::-webkit-scrollbar-track {
  background: #f8fafc;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;

  border-radius: 10px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}


/* ========================================
   MAIN TABLE
======================================== */

.dynamic-table {
  width: 100%;

  border-collapse: collapse;

  font-size: 13px;

  table-layout: auto;
}


/* ========================================
   TABLE HEADER
======================================== */

.dynamic-table thead th {
  position: sticky;

  top: 0;

  z-index: 2;

  background: #f9fafb;

  padding: 13px 14px;

  font-size: 11px;

  font-weight: 600;

  text-transform: uppercase;

  letter-spacing: 0.03em;

  color: #64748b;

  text-align: left;

  white-space: nowrap;

  border-bottom:
    1px solid #e5e7eb;
}


/* ========================================
   MAIN TABLE BODY
======================================== */

.dynamic-table tbody td {
  padding: 11px 14px;

  color: #334155;

  border-bottom:
    1px solid #f1f5f9;

  vertical-align: middle;
}


/* ========================================
   TRANSACTION ROW
======================================== */

.transaction-row {
  transition:
    background 0.2s ease;
}

.transaction-row:hover {
  background: #fff7ed;
}

.transaction-row-expanded {
  background: #fffaf5;
}


/* ========================================
   CELL WRAPPER
======================================== */

.cell-wrapper {
  display: flex;

  flex-direction: column;

  align-items: flex-start;

  gap: 6px;

  min-width: 0;
}


/* ========================================
   NORMAL CELL
======================================== */

.cell-normal {
  white-space: nowrap;
}


/* ========================================
   MULTI-LINE CELL
======================================== */

.cell-lines {
  display: flex;

  flex-direction: column;

  gap: 2px;

  line-height: 1.35;
}


/* ========================================
   PRIMARY LINE
======================================== */

.cell-primary {
  font-size: 13px;

  font-weight: 700;

  color: #1f2937;

  white-space: nowrap;
}


/* ========================================
   SECONDARY LINE
======================================== */

.cell-secondary {
  font-size: 11px;

  font-weight: 500;

  color: #64748b;

  white-space: nowrap;
}


/* ========================================
   BET TOGGLE
======================================== */

.bets-toggle {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding: 4px 8px;

  border: 1px solid #e2e8f0;

  border-radius: 6px;

  background: #f8fafc;

  color: #475569;

  font-size: 10px;

  font-weight: 700;

  line-height: 1;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.bets-toggle:hover {
  background: #f1f5f9;

  border-color: #cbd5e1;

  color: #1f2937;
}


/* ========================================
   BET COUNT
======================================== */

.bets-count {
  white-space: nowrap;
}


/* ========================================
   BET ARROW
======================================== */

.bets-arrow {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  font-size: 8px;

  transition:
    transform 0.2s ease;
}

.bets-arrow.rotated {
  transform: rotate(180deg);
}


/* ========================================
   EXPANDED ROW
======================================== */

.bets-expanded-row {
  background: #fafafa;
}


/* ========================================
   EXPANDED CELL
======================================== */

.bets-expanded-cell {
  padding: 0 !important;

  border-bottom:
    1px solid #e5e7eb !important;
}


/* ========================================
   DROPDOWN
======================================== */

.bets-dropdown {
  width: 100%;

  box-sizing: border-box;

  padding: 14px 16px 16px;

  background: #f8fafc;

  border-top:
    1px solid #e5e7eb;
}


/* ========================================
   DROPDOWN HEADER
======================================== */

.bets-dropdown-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 12px;

  margin-bottom: 10px;
}


/* ========================================
   DROPDOWN TITLE
======================================== */

.bets-title {
  font-size: 12px;

  font-weight: 800;

  color: #334155;

  text-transform: uppercase;

  letter-spacing: 0.04em;
}


/* ========================================
   BET TOTAL
======================================== */

.bets-total {
  font-size: 11px;

  font-weight: 600;

  color: #94a3b8;
}


/* ========================================
   BET TABLE WRAPPER
======================================== */

.bets-table-wrapper {
  width: 100%;

  overflow-x: auto;

  border:
    1px solid #e5e7eb;

  border-radius: 8px;

  background: #ffffff;
}


/* ========================================
   BET TABLE
======================================== */

.bets-table {
  width: 100%;

  min-width: 650px;

  border-collapse: collapse;

  font-size: 12px;
}


/* ========================================
   BET TABLE HEADER
======================================== */

.bets-table thead th {
  padding: 10px 12px;

  background: #f8fafc;

  border-bottom:
    1px solid #e5e7eb;

  font-size: 10px;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.03em;

  color: #64748b;

  text-align: left;

  white-space: nowrap;
}


/* ========================================
   BET TABLE BODY
======================================== */

.bets-table tbody td {
  padding: 10px 12px;

  color: #475569;

  border-bottom:
    1px solid #f1f5f9;

  white-space: nowrap;

  vertical-align: middle;
}


/* ========================================
   LAST BET ROW
======================================== */

.bets-table tbody tr:last-child td {
  border-bottom: none;
}


/* ========================================
   BET ROW HOVER
======================================== */

.bets-table tbody tr:hover {
  background: #fafafa;
}


/* ========================================
   BET NAME
======================================== */

.bet-name {
  font-weight: 700;

  color: #1f2937;
}


/* ========================================
   EMPTY STATE
======================================== */

.table-empty {
  width: 100%;

  height: 100%;

  min-height: 180px;

  display: flex;

  align-items: center;

  justify-content: center;

  box-sizing: border-box;

  padding: 30px;

  color: #94a3b8;

  font-size: 13px;
}


/* ========================================
   MOBILE
======================================== */

@media (max-width: 768px) {

  .dynamic-table {
    font-size: 12px;
  }

  .dynamic-table thead th {
    padding: 11px 12px;

    font-size: 10px;
  }

  .dynamic-table tbody td {
    padding: 10px 12px;
  }

  .cell-primary {
    font-size: 12px;
  }

  .cell-secondary {
    font-size: 10px;
  }

  .bets-dropdown {
    padding: 12px;
  }

  .bets-table {
    font-size: 11px;
  }

  .bets-table thead th,
  .bets-table tbody td {
    padding: 9px 10px;
  }

}

</style>
