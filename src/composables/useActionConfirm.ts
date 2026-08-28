import { ref } from 'vue'

interface Props {  confirm: (options: {
    title: string
    message: string
    variant?: 'danger' | 'warning' | 'success'
    onConfirm: () => Promise<void> | void
  }) => void
  close: () => void
}


export function useActionConfirm({ confirm, close }: Props) {
  const selectedUid = ref('')
  const selectedAction = ref<string | null>(null)

  const openActionConfirm = (
    action: string,
    uid: string,
    callback: () => Promise<unknown> | unknown,
    title: string,
    message: string,
    variant: 'danger' | 'warning' | 'success' = 'danger'
  ) => {

    selectedUid.value = uid
    selectedAction.value = action

    confirm({
      title,
      message,
      variant,

      onConfirm: async () => {
        try {
          await callback()
        } finally {
          selectedUid.value = ''
          selectedAction.value = null
          close()
        }
      }
    })
  }

  return {
    openActionConfirm
  }
}
