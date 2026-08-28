import { ref } from 'vue'
import { useAccountActions } from './useAccountsAction'

export function useResetPassword() {
  const {resetPassword} = useAccountActions()

  const showResetModal = ref(false)
  const resetLink = ref('')
  const resetEmail = ref('')

  const handleResetPassword = async (email:string) => {
    const result = await resetPassword(email)
    if(result?.success){
      resetLink.value = result.data.reset_link
      resetEmail.value = email
      showResetModal.value = true
    }
  }

  const copyResetLink = async() => {
    await navigator.clipboard.writeText(
      resetLink.value
    )
  }

  return {
    showResetModal,
    resetLink,
    resetEmail,
    handleResetPassword,
    copyResetLink
  }
}
