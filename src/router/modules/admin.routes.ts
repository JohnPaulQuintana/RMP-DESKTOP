export default [
  {
    path: '/admin/manageUser',
    name: 'admin-manageUser',
    component: () => import('@/features/admin/accounts/AccountsView.vue'),
    meta: { title: 'User Management', requiresAdmin: true }
  },
  {
    path: '/admin/controlPanel',
    name: 'admin-controlPanel',
    component: () => import('@/features/admin/control-panel/ControlPanelView.vue'),
    meta: { title: 'Control Panel', requiresAdmin: true }
  }
]
