<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFlagFields } from '../composables/useControlPanel'
import { X, ChevronDown, ChevronUp } from 'lucide-vue-next'
import type { CasinoGame, Flag, RiskCondition, RiskFlag } from '../types/controlPanel.type'
import AddFlagCategoryModal from './AddRulesModal .vue'

const isAddCategoryModalOpen = ref(false)
const addCategoryFlag = ref<string | null>(null)
const addCategoryFlags = ref<string[]>([])

const openAddCategoryModal = () => {
  addCategoryFlag.value = activeFlag.value.code ?? null
  addCategoryFlags.value = activeFlag.value.flags ?? []

  isAddCategoryModalOpen.value = true
}

// =====================================================
// MODELS
// =====================================================
const activeFlag = defineModel<Flag>('activeFlag', { required: true })
const casinoGames = defineModel<CasinoGame[]>('casinoGames', { required: true })
const activeCasinoGame = defineModel<CasinoGame | null>('activeCasinoGame', { default: null})
const activeTab = defineModel<string>('activeTab', { required: true })
const showCasinoTab = ref(false)
const selectedGameId = defineModel<number | string | null>('selectedGameId')
const newCodeInput = defineModel<string>('newCodeInput', { required: true })

// =====================================================
// EMITS
// =====================================================
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save-rules'): void
  (e: 'save-casino'): void
  (e: 'toggle-subrule', rule: Flag['rules'][number]): void
  (e: 'toggle-casino-game', game: CasinoGame): void
  (e: 'add-conflict-pair', game: CasinoGame): void
  (e: 'remove-conflict-pair', game: CasinoGame, index: number): void
  (e: 'add-bet-code', game: CasinoGame): void
  (e: 'remove-bet-code', game: CasinoGame, index: number): void
}>()

// =====================================================
// FLAG FIELDS API INTEGRATION
// =====================================================
const selectedFlag = computed<RiskFlag | ''>(() => {
  return (activeFlag.value.flags?.[0] as RiskFlag) || ''
})

const {
  data: flagFieldsResponse,
  isLoading: isLoadingFields,
  isError: isFlagFieldsError
} = useFlagFields(selectedFlag)

const flagFields = computed(() => flagFieldsResponse.value?.fields ?? [])
const conditionTypes = computed(() => flagFieldsResponse.value?.condition_types ?? [])

const getOperatorsForField = (fieldName: string): string[] => {
  return flagFields.value.find(field => field.name === fieldName)?.operators ?? []
}

// Helper to get sample/example data from API for a specific field name
// const getSampleValueForField = (fieldName: string): string | null => {
//   const match = flagFields.value.find(f => f.name === fieldName)
//   if (!match) return null

//   // Tries to grab sample_value, default_value, or first allowed value from API schema
//   const rawSample = (match as any).sample_value ?? (match as any).default_value ?? (match as any).example
//   if (rawSample !== undefined && rawSample !== null && rawSample !== '') {
//     return Array.isArray(rawSample) ? rawSample.join(', ') : String(rawSample)
//   }
//   return null
// }

  const getSampleValueForField = (fieldName: string): string => {
    const field = flagFields.value.find(field => field.name === fieldName)
    return field?.sample_value != null
      ? String(field.sample_value)
      : ''
  }

// =====================================================
// ACCORDION & EDIT STATE FOR RULES
// =====================================================
const expandedRules = ref<Record<string | number, boolean>>({})
const editingRules = ref<Record<string | number, boolean>>({})

const toggleRuleExpansion = (ruleId: string | number) => {
  expandedRules.value[ruleId] = !expandedRules.value[ruleId]
}

const toggleRuleEditing = (ruleId: string | number) => {
  editingRules.value[ruleId] = !editingRules.value[ruleId]
}

// =====================================================
// ADD & DELETE CONDITION HANDLERS
// =====================================================
const addStaticCondition = (rule: Flag['rules'][number]) => {
  if (!rule.conditions) {
    rule.conditions = []
  }

  const newConditionId = Date.now()
  const firstField = flagFields.value[0]

  const newCondition: RiskCondition = {
    id: newConditionId,
    type: conditionTypes.value[0] ?? 'filter',
    field: firstField?.name ?? '',
    operator: firstField?.operators?.[0] ?? '==',
    value: 'true',
    value_field: ''
  } as RiskCondition

  rule.conditions.push(newCondition)
  conditionTypeCache.value[newConditionId] = 'string'
}

const deleteStaticCondition = (rule: Flag['rules'][number], index: number) => {
  if (!rule.conditions || rule.conditions.length <= 1) return
  rule.conditions.splice(index, 1)
}

// =====================================================
// CONFLICT INPUT STATE
// =====================================================
const activeConflictInput = ref<{ pairIndex: number; side: 0 | 1 } | null>(null)

const showConflictSuggestions = (pairIndex: number, side: 0 | 1) => {
  activeConflictInput.value = { pairIndex, side }
}

const isConflictInputActive = (pairIndex: number, side: 0 | 1) => {
  return (
    activeConflictInput.value?.pairIndex === pairIndex &&
    activeConflictInput.value?.side === side
  )
}

const selectConflictCode = (game: CasinoGame, pairIndex: number, side: 0 | 1, code: string) => {
  const pair = game.conflict_rules[pairIndex]
  if (!pair) return
  pair[side] = code
  activeConflictInput.value = null
}

const getBetCodeSuggestions = (game: CasinoGame, search: string, currentPairIndex: number, side: 0 | 1) => {
  const query = String(search ?? '').trim().toLowerCase()
  const pair = game.conflict_rules[currentPairIndex]
  const currentValue = String(pair?.[side] ?? '').trim().toLowerCase()
  const oppositeValue = String(pair?.[side === 0 ? 1 : 0] ?? '').trim().toLowerCase()

  return game.codes
    .filter(code => {
      const normalizedCode = String(code).trim().toLowerCase()
      if (currentValue && normalizedCode === currentValue) return false
      if (oppositeValue && normalizedCode === oppositeValue) return false
      return !query || normalizedCode.includes(query)
    })
    .slice(0, 10)
}

// =====================================================
// VALUE FIELD EDITING STATE
// =====================================================
const tempConditionValues = ref<Record<number, string>>({})
const activeEditIndex = ref<Record<number, number | null>>({})
const originalEditValues = ref<Record<number, string | null>>({})

const isEditing = (condition: RiskCondition): boolean => {
  return activeEditIndex.value[condition.id] !== undefined && activeEditIndex.value[condition.id] !== null
}

const hasChanges = (condition: RiskCondition): boolean => {
  const currentValue = (tempConditionValues.value[condition.id] || '').trim()

  if (!currentValue) return false

  if (isEditing(condition)) {
    return currentValue !== originalEditValues.value[condition.id]
  }

  return true
}

const selectForEdit = (condition: RiskCondition, index: number, item: string) => {
  const trimmedItem = item.trim()
  tempConditionValues.value[condition.id] = trimmedItem
  activeEditIndex.value[condition.id] = index
  originalEditValues.value[condition.id] = trimmedItem
}

const saveValue = (condition: RiskCondition) => {
  if (!hasChanges(condition)) return

  const safeValue = tempConditionValues.value[condition.id]
  const newValue: string = safeValue ? safeValue.trim() : ''

  const rawField: string = condition.value_field != null ? String(condition.value_field) : ''
  const currentArray: string[] = rawField
    .split(',')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)

  if (isEditing(condition)) {
    const idx = activeEditIndex.value[condition.id]
    if (idx !== undefined && idx !== null) {
      currentArray[idx] = newValue
    }
  } else {
    currentArray.push(newValue)
  }

  condition.value_field = currentArray.join(',')
  resetEditState(condition)
}

const deleteValue = (condition: RiskCondition) => {
  if (!isEditing(condition)) return

  const idx = activeEditIndex.value[condition.id]
  if (idx === undefined || idx === null) return

  const rawField: string = condition.value_field != null ? String(condition.value_field) : ''
  const currentArray: string[] = rawField
    .split(',')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)

  currentArray.splice(idx, 1)

  condition.value_field = currentArray.join(',')
  resetEditState(condition)
}

const resetEditState = (condition: RiskCondition) => {
  tempConditionValues.value[condition.id] = ''
  activeEditIndex.value[condition.id] = null
  originalEditValues.value[condition.id] = null
}

const conditionTypeCache = ref<Record<string | number, string>>({})

// Initialize condition value types and preserve existing field/operator values
watch(
  () => activeFlag.value,
  (flag) => {
    if (!flag || !flag.rules) return

    flag.rules.forEach(rule => {
      rule.conditions?.forEach(condition => {
        if (!conditionTypeCache.value[condition.id]) {
          const val = condition.value_field

          if (val === null || val === 'true' || val === 'false') {
            conditionTypeCache.value[condition.id] = 'boolean'
          } else if (val !== '' && val !== null && !isNaN(Number(val))) {
            conditionTypeCache.value[condition.id] = 'integer'
          } else {
            conditionTypeCache.value[condition.id] = 'string'
          }
        }
      })
    })
  },
  { immediate: true, deep: true }
)

// Sync operators on user-driven field edits ONLY (leaves existing default condition values intact)
watch(
  () =>
    activeFlag.value.rules?.flatMap(
      rule =>
        rule.conditions?.map(c => ({
          id: c.id,
          field: c.field
        })) ?? []
    ) ?? [],
  (conditions, oldConditions) => {
    conditions.forEach(({ id, field }) => {
      const oldCond = oldConditions?.find(oc => oc.id === id)

      if (oldCond && oldCond.field && oldCond.field !== field) {
        const rule = activeFlag.value.rules.find(
          r => r.conditions?.some(c => c.id === id)
        )

        const condition = rule?.conditions?.find(
          c => c.id === id
        )

        if (!condition) return

        const operators = getOperatorsForField(field)
        const firstOperator = operators[0]

        if (
          firstOperator &&
          !operators.includes(condition.operator)
        ) {
          condition.operator = firstOperator
        }
      }
    })
  },
  { deep: true }
)

watch(() => activeTab.value, (newTab) => {
  if (newTab === 'rules') {
    selectedGameId.value = null
  }
})

const openCasinoGames = () => {
  showCasinoTab.value = true
  activeTab.value = 'casino'

  if (casinoGames.value.length > 0) {
    selectedGameId.value = casinoGames.value[0]?.id ?? null
  }
}

const closeCasinoGames = () => {
  showCasinoTab.value = false
  activeTab.value = 'rules'
}
</script>

<template>
  <div class="details-panel">
    <!-- HEADER -->
    <div class="details-header">
      <div>
        <span class="code-badge">{{ activeFlag.code }}</span>
        <h3 class="title is-5 mt-2 mb-0">{{ activeFlag.name }}</h3>
      </div>
      <button class="delete" @click="emit('close')"></button>
    </div>

    <!-- TABS -->
    <div v-if="showCasinoTab" class="panel-tabs px-3 pt-2 pb-0">
      <button class="tab-btn" :class="{ active: activeTab === 'rules' }" @click="closeCasinoGames">
        System Rules
      </button>

      <button class="tab-btn tab-btn-with-close" :class="{ active: activeTab === 'casino' }" @click="activeTab = 'casino'">
        <span>Casino Games ({{ casinoGames.length }})</span>

        <span class="tab-close-btn ml-2" @click.stop="closeCasinoGames" title="Close Casino Games">
          <X :size="12" />
        </span>
      </button>
    </div>

    <!-- BODY -->
    <div class="details-body">
      <!-- VIEW 1: SYSTEM RULES -->
      <template v-if="activeTab === 'rules'">
        <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
          <span class="has-text-weight-bold">Sub-Rules & Conditions</span>
          <button
            class="button is-small add-subrules-btn"
            @click="openAddCategoryModal"
          >
            + Add Sub-Rules
          </button>
        </div>

        <div
          v-for="rule in activeFlag.rules"
          :key="rule.id"
          class="box rule-card mb-4"
          :class="{ 'card-inactive': !rule.enabled }"
        >
          <!-- Rule Title & Toggle Switch (Accordion Header) -->
          <div class="is-flex is-justify-content-space-between is-align-items-start mb-2">
            <div class="is-flex-grow-1 is-clickable" @click="toggleRuleExpansion(rule.id)">
              <div class="is-flex is-align-items-center">
                <span class="has-text-weight-semibold d-block mr-2">{{ rule.name }}</span>
                <ChevronDown v-if="!expandedRules[rule.id]" :size="16" class="text-muted" />
                <ChevronUp v-else :size="16" class="text-muted" />
              </div>
              <p v-if="rule.description" class="is-size-7 text-muted mt-1 mb-0">
                {{ rule.description }}
              </p>
            </div>

            <label class="switch mini-switch ml-2" @click.prevent.stop="emit('toggle-subrule', rule)">
              <input type="checkbox" :checked="rule.enabled" readonly />
              <span class="slider"></span>
            </label>
          </div>

          <!-- Accordion Body -->
          <div v-show="expandedRules[rule.id]">
            <div class="conditions-container mt-3 mb-3">
              <div class="conditions-header is-flex is-justify-content-space-between is-align-items-center">
                <span class="conditions-title">Conditions</span>

                <!-- EDIT/DONE TOGGLE BUTTON -->
                <button
                  type="button"
                  class="button is-small edit-condition-toggle-btn"
                  :class="editingRules[rule.id] ? 'is-info' : 'is-light'"
                  @click="toggleRuleEditing(rule.id)"
                >
                  {{ editingRules[rule.id] ? 'Done Editing' : 'Edit Conditions' }}
                </button>
              </div>

              <!-- LOADING & ERROR STATES FOR API FIELDS -->
              <div v-if="isLoadingFields" class="has-text-centered py-4">
                <p class="is-size-7 has-text-grey">Loading condition fields...</p>
              </div>
              <div v-else-if="isFlagFieldsError" class="has-text-centered py-4">
                <p class="is-size-7 has-text-danger">Failed to load condition fields.</p>
              </div>

              <!-- Conditions List -->
              <div v-else-if="rule.conditions && rule.conditions.length">
                <div v-for="(condition, cIdx) in rule.conditions" :key="condition.id" class="condition-item mb-2">
                  <div class="condition-index">{{ cIdx + 1 }}</div>

                  <div class="condition-content">
                    <div class="condition-wrap">
                      <!-- TOP ROW: Type, Field, Operator -->

                      <!-- TYPE -->
                      <div class="wrap-type">
                        <label class="modern-label">Type</label>
                        <div v-if="editingRules[rule.id]" class="select is-fullwidth custom-select">
                          <select v-model="condition.type">
                            <option value="" disabled>Select type...</option>
                            <option v-if="condition.type && !conditionTypes.includes(condition.type)" :value="condition.type">
                              {{ condition.type }}
                            </option>
                            <option v-for="t in conditionTypes" :key="t" :value="t">
                              {{ t }}
                            </option>
                          </select>
                        </div>
                        <input
                          v-else
                          class="input is-small custom-input filled-input"
                          :value="condition.type"
                          placeholder="e.g. filter"
                          disabled
                        />
                      </div>

                      <!-- FIELD -->
                      <div class="wrap-field">
                        <label class="modern-label">Field</label>
                        <div v-if="editingRules[rule.id]" class="select is-fullwidth custom-select">
                          <select v-model="condition.field">
                            <option value="" disabled>Select field...</option>
                            <option v-if="condition.field && !flagFields.some(f => f.name === condition.field)" :value="condition.field">
                              {{ condition.field }}
                            </option>
                            <option v-for="field in flagFields" :key="field.name" :value="field.name">
                              {{ field.name }}
                            </option>
                          </select>
                        </div>
                        <input
                          v-else
                          class="input is-small custom-input filled-input"
                          :value="condition.field"
                          placeholder="e.g. gameTypeName"
                          disabled
                        />
                      </div>

                      <!-- OPERATOR -->
                      <div class="wrap-operator">
                        <label class="modern-label">Operator</label>
                        <div v-if="editingRules[rule.id]" class="select is-fullwidth custom-select">
                          <select v-model="condition.operator" :disabled="!condition.field">
                            <option value="" disabled>Select operator...</option>
                            <option
                              v-if="condition.operator && !getOperatorsForField(condition.field).includes(condition.operator)"
                              :value="condition.operator"
                            >
                              {{ condition.operator }}
                            </option>
                            <option v-for="op in getOperatorsForField(condition.field)" :key="op" :value="op">
                              {{ op }}
                            </option>
                          </select>
                        </div>
                        <input
                          v-else
                          class="input is-small custom-input filled-input"
                          :value="condition.operator"
                          placeholder="e.g. =="
                          disabled
                        />
                      </div>

                      <!-- BOTTOM ROW: Value -->
                      <div class="wrap-value mt-2">
                        <div class="is-flex is-align-items-center mb-1 style-header-gap">
                          <label class="modern-label mb-0">Value</label>
                          <!-- Sample data indicator pulled from API response -->
                          <span
                            v-if="condition.field && getSampleValueForField(condition.field)"
                            class="sample-data-pill"
                          >
                            Sample: {{ getSampleValueForField(condition.field) }}
                          </span>
                        </div>

                        <!-- 1. TRUE / FALSE -->
                        <select
                          v-if="conditionTypeCache[condition.id] === 'boolean'"
                          v-model="condition.value_field"
                          class="modern-select"
                          :disabled="!editingRules[rule.id]"
                        >
                          <option value="true">True</option>
                          <option :value="null">False</option>
                        </select>

                        <!-- 2. INTEGER INPUT -->
                        <div v-else-if="conditionTypeCache[condition.id] === 'integer'">
                          <input
                            type="text"
                            class="input is-small custom-input filled-input"
                            :value="condition.value_field ?? ''"
                            @input="condition.value_field = ($event.target as HTMLInputElement).value.replace(/\D/g, '')"
                            placeholder="Integer"
                            :disabled="!editingRules[rule.id]"
                          />
                        </div>

                        <!-- 3. TEXT / STRING INPUT & TAGS -->
                        <div v-else>
                          <div class="is-flex is-align-items-center" style="width: 100%; gap: 6px;">
                            <!-- Input Field -->
                            <div style="flex-grow: 1; min-width: 0;">
                              <input
                                type="text"
                                class="input is-small custom-input filled-input"
                                v-model="tempConditionValues[condition.id]"
                                @keyup.enter="saveValue(condition)"
                                placeholder="Enter new value..."
                                style="width: 100%;"
                                :disabled="!editingRules[rule.id]"
                              />
                            </div>

                            <!-- Buttons Group -->
                            <div class="is-flex" style="flex-shrink: 0; gap: 4px;">
                              <button
                                type="button"
                                class="button is-small is-success"
                                @click="saveValue(condition)"
                                :disabled="!editingRules[rule.id] || !hasChanges(condition)"
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                class="button is-small is-danger"
                                @click="deleteValue(condition)"
                                :disabled="!editingRules[rule.id] || !isEditing(condition)"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <!-- TAGS UI -->
                          <div
                            class="codes-grid p-2 mt-2"
                            style="background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; min-height: 42px;"
                          >
                            <span
                              v-for="(item, idx) in String(condition.value_field || '').split(',').filter(Boolean)"
                              :key="idx"
                              class="code-pill editable"
                              style="cursor: pointer;"
                              :class="{
                                'is-active-tag': activeEditIndex[condition.id] === idx,
                                'is-disabled-tag': !editingRules[rule.id]
                              }"
                              @click="editingRules[rule.id] && selectForEdit(condition, idx, item)"
                            >
                              {{ item.trim() }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- DELETE CONDITION BUTTON (Visible in Edit Mode) -->
                  <button
                    v-if="editingRules[rule.id]"
                    type="button"
                    class="button is-small is-danger is-light delete-condition-btn ml-1"
                    :disabled="rule.conditions.length <= 1"
                    title="Delete Condition"
                    @click="deleteStaticCondition(rule, cIdx)"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <!-- Add Condition Button -->
              <div class="mt-3">
                <button
                  type="button"
                  class="button is-small add-condition-btn is-fullwidth"
                  @click="addStaticCondition(rule)"
                  :disabled="!editingRules[rule.id]"
                >
                  + Add Condition
                </button>
              </div>
            </div>

            <!-- Casino Games -->
            <div v-if="rule.code === 'CASINO_ARBITRAGE'" class="casino-games-link mt-3">
              <button type="button" class="casino-games-btn" @click="openCasinoGames">
                <div class="casino-games-btn-content">
                  <div class="casino-games-icon">
                    🎰
                  </div>

                  <div>
                    <span class="casino-games-title">
                      Manage Casino Games
                    </span>

                    <span class="casino-games-description">
                      Configure casino games, bet codes, and conflict rules
                    </span>
                  </div>
                </div>
              </button>
            </div>

            <!-- Priority Input Footer -->
            <div class="is-flex is-justify-content-space-between is-align-items-center mt-3 pt-2 b-top">
              <div class="is-flex is-align-items-center">
                <span class="is-size-7 text-muted mr-2 has-text-weight-semibold">Priority</span>
                <input class="input is-small priority-input filled-input" type="number" v-model="rule.priority" />
              </div>
            </div>

          </div>
        </div>
      </template>

      <!-- VIEW 2: MULTIPLE CASINO GAMES -->
      <template v-else-if="activeTab === 'casino' && casinoGames.length">
        <div v-if="activeCasinoGame" class="box casino-card p-3">
          <div class="is-flex is-justify-content-space-between is-align-items-flex-end mb-3 pb-3 b-bottom" style="gap: 1rem;">
            <!-- Left Side: Label & Dropdown -->
            <div class="is-flex-grow-1" style="min-width: 0;">
              <label class="modern-label">Select Casino Game</label>
              <div class="select is-small is-fullwidth custom-select mt-1">
                <select v-model="selectedGameId" class="filled-input">
                  <option v-for="game in casinoGames" :key="game.id" :value="game.id">
                    {{ game.game_name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Right Side: Toggle Switch -->
            <div class="is-flex is-align-items-center mb-1">
              <label class="switch mini-switch" @click.prevent.stop="emit('toggle-casino-game', activeCasinoGame)">
                <input type="checkbox" :checked="activeCasinoGame.enabled" readonly />
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <!-- Text Field Coverage & Priority Row -->
          <div class="columns is-mobile mb-3">
            <div class="column is-6">
              <label class="modern-label">Coverage (%)</label>
              <div class="field has-addons mb-0">
                <p class="control is-expanded mb-0">
                  <input class="input is-small custom-input filled-input" type="number" min="0" max="100" v-model="activeCasinoGame!.coverage" />
                </p>
                <p class="control mb-0">
                  <a class="button is-small is-static">%</a>
                </p>
              </div>
            </div>

            <div class="column is-6">
              <label class="modern-label">Priority</label>
              <input class="input is-small custom-input filled-input" type="number" min="1" v-model="activeCasinoGame!.priority" />
            </div>
          </div>

          <!-- Dynamic Conflict Rules List -->
          <div class="mb-4 conditions-container mt-3">
            <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">
              <span class="conditions-title">Conflict Pairs</span>
              <button class="button is-small add-pair-btn" @click="emit('add-conflict-pair', activeCasinoGame)">
                <span>Add Pair</span>
              </button>
            </div>

            <div class="conflict-list">
              <div v-for="(pair, idx) in activeCasinoGame.conflict_rules" :key="idx" class="conflict-edit-row mb-2">
                <!-- CODE 1 -->
                <div class="conflict-search">
                  <input
                    class="input is-small custom-input conflict-input filled-input"
                    v-model="pair[0]"
                    placeholder="Search bet code..."
                    @focus="showConflictSuggestions(idx, 0)"
                  />
                  <div v-if="pair[0] && isConflictInputActive(idx, 0)" class="conflict-suggestions">
                    <button
                      v-for="code in getBetCodeSuggestions(activeCasinoGame, pair[0], idx, 0)"
                      :key="code"
                      type="button"
                      class="conflict-suggestion"
                      @click="selectConflictCode(activeCasinoGame!, idx, 0, code)"
                    >
                      {{ code }}
                    </button>
                  </div>
                </div>

                <span class="vs-text">VS</span>

                <!-- CODE 2 -->
                <div class="conflict-search">
                  <input
                    class="input is-small custom-input conflict-input filled-input"
                    v-model="pair[1]"
                    placeholder="Search bet code..."
                    @focus="showConflictSuggestions(idx, 1)"
                  />
                  <div v-if="pair[1] && isConflictInputActive(idx, 1)" class="conflict-suggestions">
                    <button
                      v-for="code in getBetCodeSuggestions(activeCasinoGame, pair[1], idx, 1)"
                      :key="code"
                      type="button"
                      class="conflict-suggestion"
                      @click="selectConflictCode(activeCasinoGame!, idx, 1, code)"
                    >
                      {{ code }}
                    </button>
                  </div>
                </div>

                <!-- REMOVE -->
                <button class="button is-small is-danger is-light icon-only-btn" @click="emit('remove-conflict-pair', activeCasinoGame, idx)">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Bet Codes List & Adder -->
          <div>
            <span class="modern-label mb-2">
              Bet Codes ({{ activeCasinoGame.codes.length }})
            </span>

            <div class="field is-flex gap-2 mb-3">
              <div class="control is-expanded">
                <input
                  class="input is-small custom-input code-input-padded filled-input"
                  v-model="newCodeInput"
                  placeholder="Enter bet code..."
                  @keyup.enter="emit('add-bet-code', activeCasinoGame)"
                />
              </div>
              <div class="control">
                <button class="button is-small add-code-btn" @click="emit('add-bet-code', activeCasinoGame)">
                  Add Bet Code
                </button>
              </div>
            </div>

            <div class="codes-grid p-2" style="background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span v-for="(code, cIdx) in activeCasinoGame.codes" :key="code" class="code-pill editable">
                {{ code }}
                <button type="button" class="remove-code-btn" @click="emit('remove-bet-code', activeCasinoGame!, cIdx)">
                  <X :size="14" />
                </button>
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- FOOTER -->
    <div class="details-footer">
      <button v-if="activeTab === 'rules'" class="button save-drawer-btn is-fullwidth" @click="emit('save-rules')">
        Save System Rules
      </button>
      <button v-else-if="activeTab === 'casino'" class="button save-drawer-btn is-fullwidth" @click="emit('save-casino')">
        Save Casino Games
      </button>
    </div>
  </div>

  <AddFlagCategoryModal
    v-model="isAddCategoryModalOpen"
    :flag="addCategoryFlag"
    :flags="addCategoryFlags"
  />
</template>

<style scoped>
.text-muted { color: #64748b !important; }
.priority-input { width: 65px; }
.gap-2 { gap: 0.5rem; }
.b-bottom { border-bottom: 1px solid #f1f5f9; }
.b-top { border-top: 1px solid #f1f5f9; }

.style-header-gap {
  gap: 8px;
}

/* Sample Data Indicator Styling */
.sample-data-pill {
  font-size: 0.625rem;
  color: #0d9488;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
  line-height: 1.3;
}

/* Interactive Utilities */
.is-clickable { cursor: pointer; user-select: none; }
.hover-box { transition: all 0.2s ease; border: 1px solid #e2e8f0; }
.hover-box:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); background: #f8fafc; transform: translateY(-1px); }
.close-detail-btn { border-radius: 6px !important; background-color: #f1f5f9 !important; border: 1px solid #e2e8f0 !important; padding: 0 6px !important; }
.close-detail-btn:hover { background-color: #e2e8f0 !important; }

.code-badge {
  font-family: monospace;
  background: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.775rem;
  border: 1px solid #e2e8f0;
}

.mini-switch { position: relative; width: 38px; height: 20px; display: inline-block; }
.mini-switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; inset: 0; background: #cbd5e1; border-radius: 20px; cursor: pointer; transition: 0.3s; }
.slider:before { content: ''; position: absolute; width: 14px; height: 14px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); }
.mini-switch input:checked + .slider { background: #00d1b2; }
.mini-switch input:checked + .slider:before { transform: translateX(18px); }

.details-panel {
  flex: 0 0 30%;
  height: 100%;
  min-height: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.25s ease;
}

.details-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.panel-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.tab-btn {
  border: none;
  background: transparent;
  padding: 0.5rem 0.75rem;
  font-size: 0.775rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}
.tab-btn.active { color: #00d1b2; border-bottom-color: #00d1b2; }

.details-body { flex: 1; overflow-y: auto; min-height: 0; padding: 1rem; background: #f8fafc; }
.details-footer { flex-shrink: 0; padding: 1rem; background: white; border-top: 1px solid #e2e8f0; box-shadow: 0 -4px 12px rgba(0,0,0,0.03); }

.rule-card, .casino-card { border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); border-radius: 10px; background: white; }
.card-inactive { opacity: 0.6; background: #f8fafc; }

/* Modern Typography */
.modern-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  font-weight: 700;
  display: block;
  margin-bottom: 0.35rem;
}

/* Modern Dropdown Select */
.modern-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;
  height: 2.25em;
  padding: 0.25rem 2rem 0.25rem 0.75rem;
  font-size: 0.875rem;
  color: #363636;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.6rem center;
  background-size: 14px;
}
.modern-select:hover { border-color: #94a3b8; }
.modern-select:focus { outline: none; border-color: #00d1b2; box-shadow: 0 0 0 2px rgba(0, 209, 178, 0.15); }

/* Inputs */
.custom-input, .custom-select select { border-radius: 6px !important; border-color: #cbd5e1 !important; box-shadow: none !important; }
.custom-input:focus, .custom-select select:focus { border-color: #00d1b2 !important; box-shadow: 0 0 0 2px rgba(0, 209, 178, 0.15) !important; }

.filled-input { background-color: #f8fafc !important; transition: background-color 0.2s; }
.filled-input:focus { background-color: #ffffff !important; }
.filled-input:disabled { background-color: #f1f5f9 !important; color: #64748b !important; border-color: #e2e8f0 !important; }

/* CONDITIONS CONTAINER DESIGN */
.conditions-container { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; }
.conditions-header { margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px dashed #cbd5e1; }
.conditions-title { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 800; }

.edit-condition-toggle-btn {
  font-weight: 700 !important;
  border-radius: 6px !important;
  padding: 0.2rem 0.6rem !important;
  font-size: 0.65rem !important;
  height: 22px !important;
  cursor: pointer;
}

.add-condition-btn {
  background-color: #00d1b2 !important;
  color: #ffffff !important;
  border: none !important;
  font-weight: 700 !important;
  border-radius: 6px !important;
  padding: 0.4rem 0.75rem !important;
  font-size: 0.725rem !important;
  height: 28px !important;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.add-condition-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.add-condition-btn:disabled {
  background-color: #cbd5e1 !important;
  color: #94a3b8 !important;
  cursor: not-allowed;
}

.delete-condition-btn {
  border-radius: 6px !important;
  padding: 0 6px !important;
  height: 22px !important;
  font-size: 0.7rem !important;
  align-self: flex-start;
  margin-top: 0.1rem;
}

.condition-item { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.75rem; display: flex; gap: 0.5rem; align-items: flex-start; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02); }
.condition-item:hover { border-color: #cbd5e1; box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06); }
.condition-index { background: #f1f5f9; color: #475569; font-size: 0.65rem; font-weight: 700; min-width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; flex-shrink: 0; margin-top: 0.1rem; }
.condition-content { flex: 1; min-width: 0; }
.condition-wrap { display: flex; flex-wrap: wrap; gap: 0.5rem; width: 100%; }

/* 3-Column Layout for Top Row */
.wrap-type { flex: 1 1 calc(33.333% - 0.5rem); }
.wrap-field { flex: 1 1 calc(33.333% - 0.5rem); }
.wrap-operator { flex: 1 1 calc(33.333% - 0.5rem); }

.wrap-value { flex: 1 1 100%; }
.wrap-type .control, .wrap-field .control, .wrap-operator .control, .wrap-value .control { width: 100%; margin-bottom: 0 !important; }
.wrap-value .modern-select, .wrap-value .custom-input { width: 100%; display: block; }

/* Conflict & Bet Codes */
.conflict-list { display: flex; flex-direction: column; }
.conflict-edit-row { display: flex; align-items: center; gap: 0.35rem; }
.conflict-input { flex: 1; font-family: monospace; font-size: 0.75rem; }
.vs-text { font-size: 0.6rem; font-weight: 800; color: #f14668; }

.codes-grid { display: flex; flex-wrap: wrap; gap: 0.35rem; max-height: 160px; overflow-y: auto; }
.code-pill { font-family: monospace; font-size: 0.7rem; background: #ffffff; color: #334155; border: 1px solid #cbd5e1; padding: 0.15rem 0.45rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 0.3rem; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
.code-pill.is-active-tag { border-color: #00d1b2 !important; background-color: #e6fffa !important; font-weight: 700; }
.code-pill.is-disabled-tag { cursor: not-allowed !important; opacity: 0.6; }
.remove-code-btn { display: inline-flex; align-items: center; justify-content: center; border: none; background: transparent; padding: 0; cursor: pointer; color: inherit; }
.remove-code-btn:hover { opacity: 0.7; color: #ef4444; }

.save-drawer-btn { background: #00d1b2 !important; color: white !important; border-radius: 8px; border: none; font-weight: 700; }
.add-pair-btn { background: #f0fdf4 !important; color: #16a34a !important; border: 1px solid #bbf7d0 !important; font-size: 0.725rem !important; font-weight: 700 !important; border-radius: 6px !important; padding: 2px 8px !important; height: 24px !important; transition: all 0.15s ease; }
.add-pair-btn:hover { background: #dcfce7 !important; border-color: #86efac !important; }
.add-code-btn { background: #00d1b2 !important; color: #ffffff !important; border: none !important; font-size: 0.75rem !important; font-weight: 700 !important; border-top-right-radius: 6px !important; border-bottom-right-radius: 6px !important; }
.icon-only-btn { border-radius: 6px !important; padding: 0 6px !important; height: 26px !important; }

.conflict-search { position: relative; flex: 1; min-width: 0; }
.conflict-search .conflict-input { width: 100%; }
.conflict-suggestions { position: absolute; top: calc(100% + 3px); left: 0; right: 0; z-index: 50; max-height: 180px; overflow-y: auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12); }
.conflict-suggestion { display: block; width: 100%; padding: 7px 10px; border: none; background: transparent; color: #334155; font-family: monospace; font-size: 0.72rem; text-align: left; cursor: pointer; }
.conflict-suggestion:hover { background: #f1f5f9; color: #0f172a; }

.casino-games-link {
  border-top: 1px solid #e2e8f0;
  padding-top: 0.75rem;
}

.casino-games-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.casino-games-btn:hover {
  background: #ffffff;
  border-color: #00d1b2;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.casino-games-btn-content {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.casino-games-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e6fffa;
  border-radius: 7px;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.casino-games-title {
  display: block;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 700;
}

.casino-games-description {
  display: block;
  margin-top: 0.15rem;
  color: #94a3b8;
  font-size: 0.65rem;
}

.close-casino-tab {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.close-casino-tab:hover {
  background: #f1f5f9;
  color: #475569;
}

/* Header Container Alignment */
.is-flex.is-justify-content-space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* Add Sub-Rules Button Styling */
.add-subrules-btn {
  background-color: #f14668 !important;
  color: #ffffff !important;
  border: none !important;
  font-weight: 700 !important;
  border-radius: 6px !important;
  padding: 0.35rem 0.75rem !important;
  font-size: 0.75rem !important;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.add-subrules-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.add-subrules-btn:active {
  transform: translateY(0);
}

@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

.details-body::-webkit-scrollbar, .codes-grid::-webkit-scrollbar, .conflict-suggestions::-webkit-scrollbar { width: 6px; }
.details-body::-webkit-scrollbar-thumb, .codes-grid::-webkit-scrollbar-thumb, .conflict-suggestions::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

@media screen and (max-width: 1024px) {
  .details-panel { height: 600px; min-height: 500px; }
}
</style>
