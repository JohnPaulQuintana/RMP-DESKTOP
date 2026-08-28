import { computed, type Ref } from 'vue'
import axios from 'axios'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/vue-query'

import {
  getRiskRules,
  updateRules,
  CasinoGamesRule,
  getFlagField,
  registerNewFlag,
} from '../api/controlPanel.api'

import type {
  RiskFlag,
  RiskRule,
  RiskRuleGroup,
  UpdateRulePayload,
  CasinoGame,
  RiskRuleFieldsResponse,
  RegisterRiskRulePayload,
} from '../types/controlPanel.type'

import { useToast } from 'vue-toastification'

const RISK_FLAGS: RiskFlag[] = [
  'multiple_account',
  'bonus_abuse',
  'no_deposit',
  'arbitrage',
]

export const useRiskRules = () => {
  const query = useQuery<RiskRuleGroup[]>({
    queryKey: ['risk-rules-all'],

    queryFn: async (): Promise<RiskRuleGroup[]> => {
      // =========================================================
      // 1. Get ALL rules first
      // =========================================================
      const initialResponse = await getRiskRules('')

      // =========================================================
      // 2. Get ALL unique flags from the API
      // =========================================================
      const uniqueFlags = [
        ...new Set(
          (initialResponse.rules ?? [])
            .map(rule => rule.flag)
            .filter(Boolean)
        ),
      ]

      // =========================================================
      // 3. Order flags
      //
      // Built-in flags come first.
      // Custom/new flags come after them.
      //
      // IMPORTANT:
      // We do NOT filter custom flags out.
      // =========================================================
      const orderedFlags = [
        ...RISK_FLAGS.filter(flag =>
          uniqueFlags.includes(flag)
        ),

        ...uniqueFlags.filter(
          flag => !RISK_FLAGS.includes(flag as RiskFlag)
        ),
      ]

      // console.log(
      //   '[Risk Rules] All API Flags:',
      //   uniqueFlags
      // )

      // console.log(
      //   '[Risk Rules] Ordered Flags:',
      //   orderedFlags
      // )

      // =========================================================
      // 4. Fetch rules for EVERY flag
      // =========================================================
      const responses: RiskRuleGroup[] = await Promise.all(
        orderedFlags.map(async flag => {
          const response = await getRiskRules(
            flag as RiskFlag
          )

          return {
            flag: flag as RiskFlag,
            rules: response.rules ?? [],
          }
        })
      )

      // console.log(
      //   '[Risk Rules] Final Groups:',
      //   responses
      // )

      return responses
    },

    staleTime: 1000 * 60 * 5,
  })

  // =========================================================
  // Group rules by flag
  // =========================================================
  const rulesByFlag = computed(() => {
    const data = query.data.value ?? []

    return data.reduce<Record<RiskFlag, RiskRule[]>>(
      (acc, item) => {
        acc[item.flag] = item.rules

        return acc
      },
      {} as Record<RiskFlag, RiskRule[]>
    )
  })

  const getRulesByFlag = (flag: RiskFlag) => {
    return rulesByFlag.value[flag] ?? []
  }

  return {
    // Query state
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    // Helpers
    rulesByFlag,
    getRulesByFlag,
  }
}

// =============================================================
// Update Rules
// =============================================================

export const useUpdateRules = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      id,
      flag,
      payload,
    }: {
      id: number
      flag: string
      payload: UpdateRulePayload
    }) => {
      return updateRules(id, flag, payload)
    },

    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['risk-rules-all'],
      })
    },
  })

  return {
    updateRule: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

// =============================================================
// Casino Games
// =============================================================

export const useCasinoGames = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: CasinoGame
    }) => {
      return CasinoGamesRule(id, payload)
    },

    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['risk-rules-all'],
      })
    },
  })

  return {
    updateRule: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}

// =============================================================
// Flag Fields
// =============================================================

export const useFlagFields = (
  flag: Ref<RiskFlag | ''>
) => {
  const query = useQuery<RiskRuleFieldsResponse>({
    queryKey: computed(() => [
      'risk-flag-fields',
      flag.value,
    ]),

    queryFn: () =>
      getFlagField(flag.value as RiskFlag),

    enabled: computed(() => !!flag.value),

    staleTime: 1000 * 60 * 5,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

// =============================================================
// Add New Flag
// =============================================================

export const usedAddFlag = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  const mutation = useMutation({
    mutationFn: (
      payload: RegisterRiskRulePayload
    ) => {
      return registerNewFlag(payload)
    },

    onSuccess: async () => {
      toast.success(
        'Flag rule created successfully.',
        {
          timeout: 3000,
        }
      )

      await queryClient.refetchQueries({
        queryKey: ['risk-rules-all'],
      })
    },

    onError: (error: unknown) => {
      console.error(
        '[Add Flag] Request failed:',
        error
      )

      if (
        axios.isAxiosError(error) &&
        (error.message === 'Network Error' ||
          !error.response)
      ) {
        toast.error(
          'Rule Name or System Code already exists.',
          {
            timeout: 5000,
          }
        )
      }
    },
  })

  return {
    addFlag: mutation.mutateAsync,
    isAdding: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
