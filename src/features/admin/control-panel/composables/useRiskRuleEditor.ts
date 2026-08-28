// composables/useRiskRuleEditor.ts

import { computed, ref } from 'vue'
import type { Flag, CasinoGame } from '../types/controlPanel.type'

export function useRiskRuleEditor() {
  /*
  |--------------------------------------------------------------------------
  | Drawer State
  |--------------------------------------------------------------------------
  */
  const isDrawerOpen = ref(false)
  const selectedFlag = ref<Flag | null>(null)
  const activeFlag = ref<Flag | null>(null)
  const activeTab = ref<'rules' | 'casino'>('rules')

  const selectedGameId = ref(1)
  const newCodeInput = ref('')

  /*
  |--------------------------------------------------------------------------
  | Computed
  |--------------------------------------------------------------------------
  */

  const casinoGames = computed(() => {
  const games =
    activeFlag.value?.rules.find(
      rule => rule.code === 'CASINO_ARBITRAGE'
    )?.casino_games ?? []

  return [...games].sort((a, b) =>
    a.game_name.localeCompare(b.game_name)
  )
})

  const activeCasinoGame = computed(() => {
    const games = casinoGames.value

    return (
      games.find((game) => game.id === selectedGameId.value) ??
      games[0] ??
      null
    )
  })

  /*
  |--------------------------------------------------------------------------
  | Drawer
  |--------------------------------------------------------------------------
  */

const openDrawer = (flag: Flag) => {

  selectedFlag.value = flag
  activeFlag.value = JSON.parse(JSON.stringify(flag)) as Flag
  activeTab.value = 'rules'

  const games =
  activeFlag.value.rules.find(
    rule => rule.code === 'CASINO_ARBITRAGE'
  )?.casino_games ?? []

  const sortedGames = [...games].sort((a, b) =>
    a.game_name.localeCompare(b.game_name)
  )

selectedGameId.value = sortedGames[0]?.id ?? 1

  isDrawerOpen.value = true
}

  const closeDrawer = () => {
    isDrawerOpen.value = false
    selectedFlag.value = null
    activeFlag.value = null
    selectedGameId.value = 1
    newCodeInput.value = ''
  }

  /*
  |--------------------------------------------------------------------------
  | Flag
  |--------------------------------------------------------------------------
  */

  const toggleFlag = (flag: Flag, enabled: boolean) => {
    flag.enabled = enabled

    flag.rules.forEach((rule) => {
      rule.enabled = enabled
    })

    if (activeFlag.value?.id !== flag.id) return

    activeFlag.value.enabled = enabled

    activeFlag.value.rules.forEach((rule) => {
      rule.enabled = enabled
    })

    casinoGames.value.forEach((game) => {
      game.enabled = enabled
    })
  }

  /*
  |--------------------------------------------------------------------------
  | Rules
  |--------------------------------------------------------------------------
  */

  const toggleRule = (ruleId: number, enabled: boolean) => {
    const rule = activeFlag.value?.rules.find((r) => r.id === ruleId)

    if (!rule) return

    rule.enabled = enabled
  }

  /*
  |--------------------------------------------------------------------------
  | Casino Games
  |--------------------------------------------------------------------------
  */

  const toggleCasinoGame = (game: CasinoGame, enabled: boolean) => {
    game.enabled = enabled
  }

  const addConflictPair = (game: CasinoGame) => {
    game.conflict_rules.push(['', ''])
  }

  const removeConflictPair = (game: CasinoGame, index: number) => {
    game.conflict_rules.splice(index, 1)
  }

  /*
  |--------------------------------------------------------------------------
  | Bet Codes
  |--------------------------------------------------------------------------
  */

  const addBetCode = (game: CasinoGame) => {
    const code = newCodeInput.value.trim()

    if (!code) return

    if (game.codes.includes(code)) return

    game.codes.push(code)

    newCodeInput.value = ''
  }

  const removeBetCode = (game: CasinoGame, index: number) => {
    game.codes.splice(index, 1)
  }

  /*
  |--------------------------------------------------------------------------
  | Exports
  |--------------------------------------------------------------------------
  */

  return {
    // state
    isDrawerOpen,
    selectedFlag,
    activeFlag,
    activeTab,
    selectedGameId,
    newCodeInput,

    // computed
    casinoGames,
    activeCasinoGame,

    // drawer
    openDrawer,
    closeDrawer,

    // mutations
    toggleFlag,
    toggleRule,
    toggleCasinoGame,

    addConflictPair,
    removeConflictPair,

    addBetCode,
    removeBetCode
  }
}
