import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/features/auth/auth.type'
import { signOutGoogle } from '@/features/auth/composables/firebaseAuth'


export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)

  const setAuth = (
    userData: User,
    tokenData: string,
    remember: boolean
  ) => {

    token.value = tokenData
    user.value = userData

    // Clear old storage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')

    // Only controls persistence
    if (remember) {
      localStorage.setItem(
        'token',
        tokenData
      )
      localStorage.setItem(
        'user',
        JSON.stringify(userData)
      )
    } else {
      sessionStorage.setItem(
        'token',
        tokenData
      )
      sessionStorage.setItem(
        'user',
        JSON.stringify(userData)
      )
    }
  }

  const loadAuth = () => {
    const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user')

    token.value = savedToken
    user.value =
      savedUser
      ? JSON.parse(savedUser)
      : null
  }

  const logout = async () => {
    token.value = null
    user.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    await signOutGoogle()
  }

  const setUser = (userData: User) => {
    user.value = userData

    const storage =
      localStorage.getItem('user')
        ? localStorage
        : sessionStorage

    storage.setItem(
      'user',
      JSON.stringify(userData)
    )
  }

  return {
    token,
    user,
    setAuth,
    setUser,
    loadAuth,
    logout
  }
})
