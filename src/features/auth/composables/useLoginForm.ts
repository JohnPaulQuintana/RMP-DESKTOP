import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from '@tanstack/vue-form'

import { loginSchema } from '../utils/validation.schema'
import { useAuth } from './useAuth'

export const useLoginForm = () => {
  const { loginUser } = useAuth()
  const router = useRouter()

  const email = ref('')
  const password = ref('')
  const rememberMe = ref(false)

  const isLoading = ref(false)

  const errors = ref<{
    email?: string
    password?: string
  }>({})

  const form = useForm({
    defaultValues: {},

    onSubmit: async () => {
      errors.value = {}
      isLoading.value = true

      try {
        const validation = loginSchema.safeParse({
          email: email.value,
          password: password.value,
        })

        if (!validation.success) {
          validation.error.issues.forEach((err) => {
            const field = err.path[0] as keyof typeof errors.value
            errors.value[field] = err.message
          })

          return
        }

        const user = await loginUser(
          email.value,
          password.value,
          rememberMe.value
        )

        if (!user) {
          errors.value.email = 'Invalid email or password'
          return
        }

        if (user.role === 'admin') {
          await router.push('/admin/manageUser')
        } else {
          await router.push('/dashboard')
        }

      } finally {
        isLoading.value = false
      }
    },
  })


  const validateField = (field: 'email' | 'password') => {
    const result = loginSchema.safeParse({
      email: email.value,
      password: password.value,
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


  const isValidEmail = () => {
    return (
      email.value.length > 0 &&
      email.value.endsWith('@auroramy.com') &&
      !errors.value.email
    )
  }


  const isValidPassword = () => {
    return (
      password.value.length >= 8 &&
      !errors.value.password
    )
  }


  const submitLogin = async () => {
    await form.handleSubmit()
  }


  return {
    form,
    email,
    password,
    errors,
    rememberMe,
    isLoading,
    validateField,
    isValidEmail,
    isValidPassword,
    submitLogin,
  }
}
