import { ref } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { registerSchema } from '../utils/validation.schema'
import { useAuth } from './useAuth'

export const useRegisterForm = (emit?: (event: 'login') => void) => {
  const { registerUser } = useAuth()

  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')

  const showPassword = ref(false)

  const isLoading = ref(false)

  const errors = ref<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})


  const form = useForm({
    defaultValues: {},

    onSubmit: async () => {
      errors.value = {}
      isLoading.value = true

      try {
        const validation = registerSchema.safeParse({
          email: email.value,
          password: password.value,
          confirmPassword: confirmPassword.value,
        })

        if (!validation.success) {
          validation.error.issues.forEach((err) => {
            const field =
              err.path[0] as keyof typeof errors.value

            errors.value[field] = err.message
          })

          return
        }

        const response = await registerUser(
          email.value,
          password.value
        )

        if (response) {
          emit?.('login')
        }

      } catch (error) {
        console.error(
          'Register form error:',
          error
        )

      } finally {
        isLoading.value = false
      }
    },
  })


  const validateField = (
    field: 'email' | 'password' | 'confirmPassword'
  ) => {
    const result = registerSchema.safeParse({
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    })

    if (!result.success) {
      const issue = result.error.issues.find(
        (err) => err.path[0] === field
      )

      if (issue) {
        errors.value[field] = issue.message
      } else {
        delete errors.value[field]
      }

    } else {
      delete errors.value[field]
    }
  }


  const submitRegister = async () => {
    await form.handleSubmit()
  }


  return {
    form,
    email,
    password,
    confirmPassword,
    showPassword,
    errors,
    isLoading,
    validateField,
    submitRegister,
  }
}
