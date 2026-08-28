import { createRouter, createWebHistory } from 'vue-router'
import adminRoutes from './modules/admin.routes'
import subsystemRoutes from './modules/subsystem.routes'
import userRoutes from './modules/user.routes'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...adminRoutes,
    ...subsystemRoutes,
    ...userRoutes,
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.token) {
    authStore.loadAuth()
  }

  const token = authStore.token
  const user = authStore.user
  const isLoginPage = to.name === 'Login'

  // ==========================
  // Already authenticated
  // ==========================

  if (isLoginPage && token) {
    if(user?.role === 'admin') {
      return next({
        name: 'admin-manageUser'
      })
    }
    return next({
      name:'dashboard'
    })
  }

  // ==========================
  // Authentication check
  // ==========================
  if(to.meta.requiresAuth && !token) {
    return next({
      name:'Login'
    })
  }

  // ==========================
  // Admin authorization
  // ==========================
  if(to.meta.requiresAdmin) {
    if(user?.role === 'admin') {
      return next()
    }
    return next({
      name:'Login'
    })
  }
  next()
})

export default router
