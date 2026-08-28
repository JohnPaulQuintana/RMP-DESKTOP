import { ref } from 'vue'

interface ConfirmOptions {
  title: string
  message: string
  variant?: 'danger' | 'warning' | 'success'
  onConfirm: () => Promise<void> | void
}

export function useConfirmDialog() {
  const isOpen = ref(false)

  const title = ref('')
  const message = ref('')

  const loading = ref(false)

  const variant = ref<'danger' | 'warning' | 'success'>('danger')

  let confirmCallback: (() => Promise<void> | void) | null = null

  const confirm = (options: ConfirmOptions) => {
    title.value = options.title
    message.value = options.message

    variant.value = options.variant ?? 'danger'

    confirmCallback = options.onConfirm

    isOpen.value = true
  }

  const accept = async () => {
    if (!confirmCallback)
      return

    try {
      loading.value = true
      await confirmCallback()
    } finally {
      loading.value = false
      close()
    }
  }

  const close = () => {
    isOpen.value = false
    confirmCallback = null
  }

  return {
    isOpen,
    title,
    message,
    variant,
    loading,
    confirm,
    accept,
    close
  }
}
