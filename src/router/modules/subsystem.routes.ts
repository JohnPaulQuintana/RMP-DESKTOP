export default [
  // {
  //   path: '/subsystem/api-monitor',
  //   name: 'api-monitor',
  //   component: () => import('@/features/admin/analytics/views/AnalyticTableView.vue'),
  //   meta: { title: 'Subsystem Overview', requiresAuth: true }
  // },
  {
    path: '/subsystem/api-chart',
    name: 'api-chart',
    component: () => import('@/features/admin/analytics/views/AnalyticChartView.vue'),
    meta: { title: 'API Monitoring Dashboard', requiresAuth: true }
  },
]
