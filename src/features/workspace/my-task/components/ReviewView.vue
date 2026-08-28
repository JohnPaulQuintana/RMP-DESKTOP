<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import MultipleAccountTable from './flags/MultiAccountTable.vue'
import BonusAbuserTable from './flags/BonusAbuserTable.vue'
import NoDepositTable from './flags/NoDepositTable.vue'
import ArbitrageTable from './flags/ArbitrageTable.vue'

const route = useRoute()

interface ReviewAction {
  flag: string
  case_id: number | null
}

interface ReviewTask {
  actions: ReviewAction[]
}

const flagType = computed(() => String(route.params.flagType ?? ''))


const withdrawalId = computed(() => {
  const id = route.params.withdrawalId

  if (!id) return ''

  return Array.isArray(id)
    ? id[0] ?? ''
    : id
})

const case_id = ref<number | null>(null)

const baseFlagType = computed(() => {
  const normalizedFlag = flagType.value.toLowerCase()

  if (normalizedFlag.includes('bonus')) {
    return 'bonus_abuse'
  }

  if (normalizedFlag.includes('multiple_account')) {
    return 'multiple_account'
  }

  if (normalizedFlag.includes('no_deposit')) {
    return 'no_deposit'
  }

  if (normalizedFlag.includes('arbitrage')) {
    return 'arbitrage'
  }

  return normalizedFlag
})

const isAdditionalFlag = computed(() => {
  return flagType.value !== baseFlagType.value
})

onMounted(() => {
  if (!withdrawalId.value) return

  const stored = sessionStorage.getItem(
    `review_${withdrawalId.value}`
  )

  if (!stored) {
    console.warn('No stored review data.')
    return
  }

  const task: ReviewTask = JSON.parse(stored)

  const action = task.actions?.find(
    (item) => item.flag === flagType.value
  )

  if (!action) {
    console.warn('No matching action found.')
    return
  }

  case_id.value = action.case_id ?? null
})

const formattedFlagType = computed(() => {
  const flag = flagType.value

  switch (flag) {
    case 'multiple_account':
      return 'Multiple Account'

    case 'bonus_abuse':
      return 'Bonus Abuse'

    case 'no_deposit':
      return 'No Deposit'

    case 'arbitrage':
      return 'Arbitrage'

    default:
      return flag
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
  }
})
</script>

<template>
  <div class="review-view">

    <div class="header-card">
      <div class="header-inner">

        <div class="header-left">
          <div class="title-row">
            <h2>{{ formattedFlagType }} Details</h2>
          </div>

          <p>
            Review flagged user information
          </p>
        </div>

        <div class="header-right">
          <div class="user-pill">
            <span class="label">
              Case ID
            </span>

            <span class="value">
              👤 {{ withdrawalId }}
            </span>
          </div>
        </div>

      </div>
    </div>

    <div class="body-container">

      <MultipleAccountTable
        v-if="baseFlagType === 'multiple_account'"
        :case_id="case_id"
        :flag="flagType"
        :is-additional="isAdditionalFlag"
      />

      <BonusAbuserTable
        v-if="baseFlagType === 'bonus_abuse'"
        :case_id="case_id"
        :flag="flagType"
        :is-additional="isAdditionalFlag"
      />

      <NoDepositTable
        v-if="baseFlagType === 'no_deposit'"
        :case_id="case_id"
        :flag="flagType"
        :is-additional="isAdditionalFlag"
      />

      <ArbitrageTable
        v-if="baseFlagType === 'arbitrage'"
        :case_id="case_id"
        :flag="flagType"
        :is-additional="isAdditionalFlag"
      />

    </div>

  </div>
</template>

<style scoped>

/* HEADER CONTAINER */
.header-card {
  background: white;
  border-bottom: 1px solid #f1f5f9;
}


/* INNER LAYOUT */
.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
}


/* LEFT */
.header-left {
  display: flex;
  flex-direction: column;
}


/* TITLE ROW */
.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.header-left p {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}


/* STATUS BADGE */
.status-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  color: #ffffff;
}


/* GREEN */
.status-tag.verified {
  background: #22c55e;
}


/* RED */
.status-tag.notVerified {
  background: #ef4444;
}


/* RIGHT */
.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}


/* USER PILL */
.user-pill {
  text-align: right;
}

.user-pill .label {
  display: block;
  font-size: 10px;
  color: #9ca3af;
  letter-spacing: 0.6px;
}

.user-pill .value {
  display: inline-block;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  background: #fff7ed;
  color: #ea580c;
}


/* BODY */

.body-container {
  height: 90vh;
  max-height: 605px;
  min-height: 300px;

  background-color: whitesmoke;

  overflow: hidden;
}


/* TABLE SPACING */

.body-container > * + * {
  margin-top: 16px;
}

</style>
