import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useToast } from 'vue-toastification'
import { approveUsers, blockUsers, forgetPassword } from '../api/account.api'
import type { AccountUser } from '../account.type'

export function useAccountActions() {
  const toast = useToast()

  const queryClient = useQueryClient()

  const processingUsers = ref<Set<string>>(new Set())
  const resettingPasswords = ref<Set<string>>(new Set())

  const addProcessing = (uid:string) => {
    processingUsers.value = new Set([
      ...processingUsers.value,
      uid
    ])
  }

  const removeProcessing = (uid:string) => {
    const updated = new Set(processingUsers.value)
    updated.delete(uid)
    processingUsers.value = updated
  }

  const addResetting = (email:string) => {
    resettingPasswords.value = new Set([
      ...resettingPasswords.value,
      email
    ])
  }

  const removeResetting = (email:string) => {
    const updated = new Set(resettingPasswords.value)
    updated.delete(email)
    resettingPasswords.value = updated
  }

  const getUserEmail = (uid:string) => {
    const users =
      queryClient.getQueryData<AccountUser[]>(
        ['accounts']
      )
    return users?.find(
      user => user.uid === uid
    )?.email
  }

  const approveMutation = useMutation({
    mutationFn:(uid:string)=>{
      addProcessing(uid)
      return approveUsers(uid)
    },

    onSuccess:(_,uid)=>{
      queryClient.invalidateQueries({
        queryKey:['accounts']
      })

      toast.success(
        `User ${getUserEmail(uid) ?? 'account'} approved successfully.`
      )
    },

    onError:()=>{
      toast.error(
        'Failed to approve user.'
      )
    },

    onSettled:(_,__,uid)=>{
      removeProcessing(uid)
    }
  })

  const blockMutation = useMutation({
    mutationFn:(uid:string)=>{
      addProcessing(uid)
      return blockUsers(uid)
    },

    onSuccess:(_,uid)=>{
      queryClient.invalidateQueries({
        queryKey:['accounts']
      })

      toast.success(
        `User ${getUserEmail(uid) ?? 'account'} blocked successfully.`
      )
    },

    onError:()=>{
      toast.error(
        'Failed to block user.'
      )
    },

    onSettled:(_,__,uid)=>{
      removeProcessing(uid)
    }
  })

  const resetMutation = useMutation({
    mutationFn:(email:string)=>{
      addResetting(email)
      return forgetPassword(email)
    },

    onSuccess:()=>{
      toast.success(
        'Password reset link generated.'
      )
    },

    onError:()=>{
      toast.error(
        'Failed to generate reset password link.'
      )
    },

    onSettled:(_,__,email)=>{
      removeResetting(email)
    }
  })

  const approveUser = (uid:string) =>
    approveMutation.mutateAsync(uid)

  const blockUser = (uid:string) =>
    blockMutation.mutateAsync(uid)

  const resetPassword = (email:string) =>
    resetMutation.mutateAsync(email)

  const isProcessing = (uid:string) =>
    processingUsers.value.has(uid)

  const isResetting = (email:string) =>
    resettingPasswords.value.has(email)

  return {

    approveUser,
    blockUser,
    resetPassword,

    isProcessing,
    isResetting,

    approvePending:
      approveMutation.isPending,

    blockPending:
      blockMutation.isPending,

    resetPending:
      resetMutation.isPending
  }
}
