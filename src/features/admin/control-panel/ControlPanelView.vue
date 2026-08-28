<script setup lang="ts">
  import { watch, ref, computed } from 'vue'
  import AppLayout from '@/components/partials/Layout.vue'
  import RiskRuleDrawer from './component/RiskRuleDrawer.vue'

  import { useRiskRules, useUpdateRules, useCasinoGames } from '../control-panel/composables/useControlPanel'
  import { useRiskRuleEditor } from '../control-panel/composables/useRiskRuleEditor'
  import { useControlPanelFlags } from '../control-panel/composables/useControlPanelFlags'

  import type { CasinoGame, Flag  } from '../control-panel/types/controlPanel.type'

  import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
  import { useConfirmDialog } from '@/composables/useConfirmDialog'
  import { useActionConfirm } from '@/composables/useActionConfirm'

  import AddFlagCategoryModal from './component/AddFlagModal.vue'

  const isAddCategoryModalOpen = ref(false)

  /*
  |--------------------------------------------------------------------------
  | API & Composables
  |--------------------------------------------------------------------------
  */
  const { data, isLoading } = useRiskRules()
  const { updateRule } = useUpdateRules()
  const { updateRule: updateCasinoGame } = useCasinoGames()
  const { flags } = useControlPanelFlags(data)

  const {
    isOpen,
    title,
    message,
    variant,
    loading: confirmLoading,
    confirm,
    accept,
    close
  } = useConfirmDialog()

  const { openActionConfirm } = useActionConfirm({ confirm, close })

  const {
    isDrawerOpen,
    selectedFlag,
    activeFlag,
    activeTab,
    selectedGameId,
    newCodeInput,

    casinoGames,
    activeCasinoGame,

    openDrawer,
    closeDrawer,

    toggleCasinoGame,
    addConflictPair,
    removeConflictPair,
    addBetCode,
    removeBetCode
  } = useRiskRuleEditor()

  /*
  |--------------------------------------------------------------------------
  | State Tracking (Discard Warning Logic)
  |--------------------------------------------------------------------------
  */
  const initialStateHash = ref('')

  const captureSnapshot = () => {
    if (!activeFlag.value) return
    initialStateHash.value = JSON.stringify({
      rules: activeFlag.value.rules,
      casinoGames: casinoGames.value
    })
  }

  const hasUnsavedChanges = computed(() => {
    if (!activeFlag.value || !initialStateHash.value) return false

    const currentState = JSON.stringify({
      rules: activeFlag.value.rules,
      casinoGames: casinoGames.value
    })

    return currentState !== initialStateHash.value
  })

  /*
  |--------------------------------------------------------------------------
  | Flag Configuration & Mapper
  |--------------------------------------------------------------------------
  */

  const saveSystemRules = () => {
    if (!activeFlag.value) return

    openActionConfirm(
      'save-risk-rules',
      String(activeFlag.value.id),
      async () => {
        // 1. Update System Rules
        for (const rule of activeFlag.value!.rules) {
          const payload = {
            ...rule,
            flag: activeFlag.value!.code,
            flags: [activeFlag.value!.code],
            enabled: rule.enabled,
            conditions: rule.conditions.map(condition => ({
              id: condition.id,
              type: condition.type,
              field: condition.field,
              operator: condition.operator,
              value: String(condition.value),
              value_field: condition.value_field ?? null,
            })),
          }

        //   console.log(
        //   `[SAVE RISK RULE] Rule ID: ${rule.id}`,
        //   JSON.stringify(payload, null, 2)
        // )

          await updateRule({
            id: rule.id,
            flag: activeFlag.value!.code,
            payload,
          })
        }

        // 2. If CASINO_ARBITRAGE changed, update all casino games
        const casinoArbitrageRule = activeFlag.value!.rules.find(rule => rule.code === 'CASINO_ARBITRAGE')

        if (casinoArbitrageRule && activeFlag.value!.casino_games?.length) {
          for (const game of activeFlag.value!.casino_games) {
            await updateCasinoGame({
              id: game.id,
              payload: { ...game, enabled: casinoArbitrageRule.enabled },
            })
          }
        }
        closeDrawer()
      },
      'Save Risk Rules',
      `Are you sure you want to save the changes for "${activeFlag.value.name}"?\n\nThis will update all configured detection rules and priorities for this flag.`,
      'success'
    )
  }

  const saveCasinoGames = () => {
    if (!casinoGames.value.length) return

    openActionConfirm(
      'save-casino-games',
      String(activeFlag.value?.id ?? ''),
      async () => {
        // 1. SAVE ALL CASINO GAME CONFIGURATION
        for (const game of casinoGames.value) {
          const payload: CasinoGame = {
            ...game,
            enabled: game.enabled,
            coverage: game.coverage,
            priority: game.priority,
            codes: [...game.codes],
            conflict_rules: game.conflict_rules
              .filter((pair): pair is [string, string] => Boolean(pair[0]) && Boolean(pair[1]))
              .map(pair => [pair[0], pair[1]]),
          }

          await updateCasinoGame({
            id: game.id,
            payload,
          })
        }

        const hasEnabledCasinoGame = casinoGames.value.some(game => game.enabled)
        const allCasinoGamesDisabled = casinoGames.value.every(game => !game.enabled)

        if (activeFlag.value) {
          const casinoArbitrageRule = activeFlag.value.rules.find(rule => rule.code === 'CASINO_ARBITRAGE')
          if (casinoArbitrageRule) {
            if (allCasinoGamesDisabled && casinoArbitrageRule.enabled) {
              const payload = {
                ...casinoArbitrageRule,

                flag: activeFlag.value.code,
                flags: [activeFlag.value.code],
                enabled: false,
                conditions: casinoArbitrageRule.conditions.map(condition => ({
                  id: condition.id,
                  type: condition.type,
                  field: condition.field,
                  operator: condition.operator,
                  value: String(condition.value),
                  value_field: condition.value_field ?? null,
                })),
              }
              await updateRule({ id: casinoArbitrageRule.id, flag: activeFlag.value.code, payload })
              casinoArbitrageRule.enabled = false
            }
            else if (hasEnabledCasinoGame && !casinoArbitrageRule.enabled) {
              const payload = {
                ...casinoArbitrageRule,
                flag: activeFlag.value.code,
                flags: [activeFlag.value.code],
                enabled: true,
                conditions: casinoArbitrageRule.conditions.map(condition => ({
                  id: condition.id,
                  type: condition.type,
                  field: condition.field,
                  operator: condition.operator,
                  value: String(condition.value),
                  value_field: condition.value_field ?? null,
                })),
              }
              await updateRule({ id: casinoArbitrageRule.id, flag: activeFlag.value.code, payload })
              casinoArbitrageRule.enabled = true
            }
          }
        }
        closeDrawer()
      },
      'Save Casino Games',
      `Are you sure you want to save all casino game changes for "${activeFlag.value?.name}"?`,
      'success'
    )
  }

  const confirmToggleFlag = (flag: Flag) => {
    const nextState = !flag.enabled
    openActionConfirm(
      nextState ? 'enable-global' : 'disable-global',
      String(flag.id),
      async () => {
        for (const rule of flag.rules) {
          const payload = {
            ...rule,
            flag: flag.code,
            flags: [flag.code],
            enabled: nextState,
            conditions: rule.conditions.map(condition => ({
              id: condition.id,
              type: condition.type,
              field: condition.field,
              operator: condition.operator,
              value: String(condition.value),
              value_field: condition.value_field ?? null,
            })),
          }

          await updateRule({ id: rule.id, flag: flag.code, payload })
        }
        if (flag.casino_games?.length) {
          for (const game of flag.casino_games) {
            await updateCasinoGame({ id: game.id, payload: { ...game, enabled: nextState } })
          }
        }
      },
      `${nextState ? 'Enable' : 'Disable'} ${flag.name}`,
      `Are you sure you want to ${nextState ? 'enable' : 'disable'} ${flag.name}?`,
      nextState ? 'success' : 'warning'
    )
  }

  const confirmToggleSubRule = (rule: Flag['rules'][number]) => {
    const nextState = !rule.enabled
    openActionConfirm(
      nextState ? 'enable-subrule' : 'disable-subrule',
      String(rule.id),
      async () => {
        rule.enabled = nextState
        if (rule.code === 'CASINO_ARBITRAGE') {
          for (const game of activeFlag.value?.casino_games ?? []) {
            game.enabled = nextState
          }
        }
      },
      `${nextState ? 'Enable' : 'Disable'} ${rule.name}`,
      `Are you sure you want to ${nextState ? 'enable' : 'disable'} "${rule.name}"?`,
      nextState ? 'success' : 'warning'
    )
  }

  const confirmToggleCasinoGame = (game: CasinoGame) => {
    const nextState = !game.enabled
    openActionConfirm(
      nextState ? 'enable-game' : 'disable-game',
      String(game.id),
      async () => { toggleCasinoGame(game, nextState) },
      `${nextState ? 'Enable' : 'Disable'} ${game.game_name}`,
      `Are you sure you want to ${nextState ? 'enable' : 'disable'} arbitrage detection for "${game.game_name}"?`,
      nextState ? 'success' : 'warning'
    )
  }

  const confirmRemoveConflictPair = (game: CasinoGame, index: number) => {
    openActionConfirm(
      'remove-conflict-pair',
      String(game.id),
      async () => { removeConflictPair(game, index) },
      'Remove Conflict Pair',
      'Are you sure you want to delete this conflict rule pair?',
      'warning'
    )
  }

  const confirmAddBetCode = (game: CasinoGame) => {
    const trimmed = newCodeInput.value.trim()
    if (!trimmed || game.codes.includes(trimmed)) return

    openActionConfirm(
      'add-bet-code',
      String(game.id),
      async () => { addBetCode(game) },
      'Add Bet Code',
      `Are you sure you want to add the code "${trimmed}" to "${game.game_name}"?`,
      'warning'
    )
  }

  const confirmRemoveBetCode = (game: CasinoGame, index: number) => {
    const codeName = game.codes[index]
    openActionConfirm(
      'remove-bet-code',
      String(game.id),
      async () => { removeBetCode(game, index) },
      'Remove Bet Code',
      `Are you sure you want to remove the code "${codeName}"?`,
      'danger'
    )
  }

  const confirmCloseDrawer = () => {
    if (!hasUnsavedChanges.value) {
      closeDrawer()
      return
    }

    const flagName = activeFlag.value?.name || 'this flag'
    openActionConfirm(
      'discard-changes',
      activeFlag.value?.code || '',
      async () => { closeDrawer() },
      `Discard Changes for ${flagName}?`,
      'Are you sure you want to close the panel? Any unsaved changes you have made will be lost.',
      'warning'
    )
  }

  const confirmOpenDrawer = (flag: Flag) => {
    if (!isDrawerOpen.value) {
      openDrawer(flag)
      setTimeout(captureSnapshot, 100)
      return
    }

    if (activeFlag.value?.id === flag.id) return

    if (!hasUnsavedChanges.value) {
      openDrawer(flag)
      setTimeout(captureSnapshot, 100)
      return
    }

    const currentFlagName = activeFlag.value?.name || 'the current flag'
    openActionConfirm(
      'switch-flag',
      String(flag.id),
      async () => {
        openDrawer(flag)
        setTimeout(captureSnapshot, 100)
      },
      'Switch Flag',
      `Are you sure you want to switch from "${currentFlagName}" to "${flag.name}"?\n\nAny unsaved changes to "${currentFlagName}" will be lost.`,
      'warning'
    )
  }

  watch(flags, (newFlags) => {
    if (!activeFlag.value) return
    const updatedFlag = newFlags.find(flag => flag.id === activeFlag.value?.id)
    if (updatedFlag) activeFlag.value = updatedFlag
  }, { deep: true })

  /*
  |--------------------------------------------------------------------------
  | Add Category Modal State & Handlers
  |--------------------------------------------------------------------------
  */

</script>

<template>
  <AppLayout>
    <div class="columns is-variable is-3">
      <div class="column is-12">
        <div class="box white-card">
          <div class="section pt-3 px-3 risk-panel">

            <!-- Top Header -->
            <div class="level mb-5">
              <div class="level-left">
                <div>
                  <h1 class="title is-4 mb-1">Admin Control Panel</h1>
                  <p class="subtitle is-6 text-muted">Manage detection thresholds by flag category</p>
                </div>
              </div>
              <div class="level-right">
                <button
                  class="button is-small add-category-btn"
                  @click="isAddCategoryModalOpen = true"
                >
                  + Add Category
                </button>
              </div>
            </div>

            <!-- Main Content Layout -->
            <div class="content-layout">
              <!-- LEFT TABLE -->
              <div class="table-container-card" :class="{ 'with-details': isDrawerOpen }">
                <div class="table-scroll">
                  <div v-if="isLoading" class="loading-container">
                    <div class="loader"></div>
                    <span>Loading risk rules...</span>
                  </div>

                  <table class="table is-fullwidth is-hoverable is-vcentered modern-table">
                    <thead>
                      <tr>
                        <th>Flag Category</th>
                        <th>System Flag</th>
                        <th>Active Rules</th>
                        <th>Global Status</th>
                        <th class="has-text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="flag in flags"
                        :key="flag.id"
                        :class="{
                          'is-selected-row': selectedFlag?.id === flag.id,
                          'row-disabled': !flag.enabled
                        }"
                      >
                        <td>
                          <div class="flag-title ">{{ flag.name }}</div>
                        </td>

                        <td>
                          <span class="code-badge">{{ flag.code }}</span>
                        </td>

                        <td>
                          <span class="pill-badge pill-info">
                            {{ flag.rules.filter((rule) => rule.enabled).length }} / {{ flag.rules.length }} Active
                          </span>
                        </td>

                        <td>
                          <div class="status-toggle-wrapper">
                            <label class="switch mini-switch" @click.prevent.stop="confirmToggleFlag(flag)">
                              <input type="checkbox" :checked="flag.enabled" readonly />
                              <span class="slider"></span>
                            </label>
                            <span class="status-label-text ml-2" :class="flag.enabled ? 'is-active' : 'is-inactive'">
                              {{ flag.enabled ? 'Enabled' : 'Disabled' }}
                            </span>
                          </div>
                        </td>

                        <td class="has-text-right">
                          <button class="button is-small manage-rules-btn" @click="confirmOpenDrawer(flag)">
                            Manage Rules ({{ flag.rules.length }})
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- RIGHT DETAILS PANEL (Extracted Component) -->
              <RiskRuleDrawer
                v-if="isDrawerOpen && activeFlag"
                v-model:active-flag="activeFlag"
                v-model:casino-games="casinoGames"
                v-model:active-casino-game="activeCasinoGame"
                v-model:active-tab="activeTab"
                v-model:selected-game-id="selectedGameId"
                v-model:new-code-input="newCodeInput"
                @close="confirmCloseDrawer"
                @save-rules="saveSystemRules"
                @save-casino="saveCasinoGames"
                @toggle-subrule="confirmToggleSubRule"
                @toggle-casino-game="confirmToggleCasinoGame"
                @add-conflict-pair="addConflictPair"
                @remove-conflict-pair="confirmRemoveConflictPair"
                @add-bet-code="confirmAddBetCode"
                @remove-bet-code="confirmRemoveBetCode"
              />

            </div>
          </div>
        </div>
      </div>
    </div>

    <AddFlagCategoryModal
      v-model="isAddCategoryModalOpen"
    />

    <ConfirmDialog
      :show="isOpen"
      :title="title"
      :message="message"
      :loading="confirmLoading"
      :variant="variant"
      @confirm="accept"
      @cancel="close"
    />
  </AppLayout>
</template>

<style scoped>
/* Utility */
.text-muted { color: #64748b !important; }

/* Main Risk Panel Layout */
.risk-panel {
  height: calc(100vh - 150px);
  min-height: 650px;
  display: flex;
  flex-direction: column;
}

.content-layout {
  display: flex;
  gap: 1rem;
  width: 100%;
  flex: 1;
  min-height: 0;
}

/* Table Container */
.table-container-card {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
}

.table-container-card.with-details { flex: 0 0 68%; }

/* Table Styling */
.modern-table { margin-bottom: 0 !important; }

.modern-table thead th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.modern-table tbody tr { transition: background-color 0.15s ease; }
.modern-table tbody tr:hover { background: #f8fafc; }
.modern-table tbody td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
.modern-table tbody tr:last-child td { border-bottom: none; }
.is-selected-row { background: #eff6ff !important; }

/* Disabled Row */
.row-disabled { background: #f8fafc !important; }
.row-disabled td { color: #94a3b8 !important; }
.row-disabled .flag-title { color: #64748b !important; }
.row-disabled .code-badge, .row-disabled .pill-info {
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #e2e8f0;
}
.row-disabled .manage-rules-btn { border-color: #d1d5db; color: #9ca3af; }

/* Flag Title & Badges */
.flag-title { color: #1e293b; font-size: 0.925rem; font-weight: 700; }

.code-badge {
  font-family: monospace;
  background: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.775rem;
  border: 1px solid #e2e8f0;
}

.pill-badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.pill-info { background: #e0f2fe; color: #0369a1; }

/* Toggle Switch */
.status-toggle-wrapper { display: flex; align-items: center; }
.status-label-text { font-size: 0.8rem; font-weight: 600; }
.status-label-text.is-active { color: #0f172a; }
.status-label-text.is-inactive { color: #94a3b8; }

.mini-switch { position: relative; width: 38px; height: 20px; display: inline-block; }
.mini-switch input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute;
  inset: 0;
  background: #cbd5e1;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.slider:before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.mini-switch input:checked + .slider { background: #00d1b2; }
.mini-switch input:checked + .slider:before { transform: translateX(18px); }

/* Buttons */
.manage-rules-btn {
  border-radius: 8px;
  border-color: #3b82f6;
  color: #2563eb;
  background: transparent;
  font-weight: 600;
}
.manage-rules-btn:hover { background: #eff6ff; }

/* Add Category Button */
.add-category-btn {
  background: #00d1b2 !important;
  color: #ffffff !important;
  border: none !important;
  font-weight: 700 !important;
  border-radius: 8px !important;
  padding: 0.4rem 0.85rem !important;
  transition: opacity 0.2s ease;
}

.add-category-btn:hover { opacity: 0.9; }

/* Loading States */
.loading-container {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.85);
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
}

.loader {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #00d1b2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.table-scroll {
  position: relative;
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
}

.table-scroll::-webkit-scrollbar { width: 6px; }
.table-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

/* Modal Styling */
.custom-modal-card { max-width: 400px; border-radius: 12px; overflow: hidden; }
.modal-card-head { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 1rem; }
.modal-card-body { padding: 1.25rem; }
.modal-card-foot { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 0.75rem 1rem; gap: 0.5rem; }
.custom-input { border-radius: 6px !important; border-color: #cbd5e1 !important; box-shadow: none !important; }
.custom-input:focus { border-color: #00d1b2 !important; }

.save-drawer-btn { background: #00d1b2 !important; color: white !important; border-radius: 8px; border: none; font-weight: 700; }

@media screen and (max-width: 1024px) {
  .risk-panel { height: auto; min-height: unset; }
  .content-layout { flex-direction: column; }
  .table-container-card.with-details { flex: 1; }
}
</style>
