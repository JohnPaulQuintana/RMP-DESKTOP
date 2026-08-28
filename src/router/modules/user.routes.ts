export default [
  {
    path: '/',
    name: 'Login',
    meta: { title: 'Login' },
    component: () => import('@/features/auth/views/AuthView.vue')
  },

  {
    path: '/dashboard',
    name: 'dashboard',
    meta: { title: 'Dashboard', requiresAuth: true},
    component: () => import('@/features/workspace/dashboard/DashboardView.vue')
  },

  {
    path: '/withdrawal',
    name: 'withdrawal',
    meta: { title: 'Withdrawal', requiresAuth: true},
    component: () => import('@/features/withdrawal/WithdrawalView.vue')
  },
  {
    path: '/myTask',
    name: 'myTask',
    meta: { title: 'My Task', requiresAuth: true },
    component: () => import('@/features/workspace/my-task/MyTaskView.vue')
  },
  // {
  //   path: '/multiAccount',
  //   name: 'multiAccount',
  //   meta: { title: 'Multiple Account', requiresAuth: true },
  //   component: () => import('@/features/risk/flag/multipleAccount/MultipleAccountView.vue')
  // },
  // {
  //   path: '/bonusAbuser',
  //   name: 'bonusAbuser',
  //   meta: { title: 'Bonus Abuser', requiresAuth: true },
  //   component: () => import('@/views/BonusAbuserView.vue')
  // },
  // {
  //   path: '/noDeposit',
  //   name: 'noDeposit',
  //   meta: { title: 'No Deposit', requiresAuth: true },
  //   component: () => import('@/views/NoDepositView.vue')
  // },
  // {
  //   path: '/arbitrageBet',
  //   name: 'arbitrageBet',
  //   meta: { title: 'Arbitrage Bet', requiresAuth: true },
  //   component: () => import('@/views/ArbitrageBetView.vue')
  // },
  {
    path: '/review/:flagType/:withdrawalId',
    name: 'review',
    meta: { title: 'Review', requiresAuth: true },
    component: () => import('@/features/workspace/my-task/components/ReviewView.vue')
  },
]
