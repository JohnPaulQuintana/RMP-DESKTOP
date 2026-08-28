import {
  LayoutDashboard,
  Users,
  // Coins,
  // BanknoteArrowDown,
  ListCheckIcon,
  // BarChart2,
  Settings,
  AreaChart,
  // FileSpreadsheet
} from 'lucide-vue-next'


export const sidebarMenu = [
  {
    label: 'Main',
    role: 'risk',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard'
      },
      {
        label: 'My Tasks',
        icon: ListCheckIcon,
        path: '/myTask'
      }
    ]
  },

  {
    label: 'Risk Tools',
    role: 'risk',
    items: [
      {
        label: 'Withdrawal',
        icon: Users,
        path: '/withdrawal'
      },
      // {
      //   label: 'Multiple Account',
      //   icon: Users,
      //   path: '/multiAccount'
      // },
      // {
      //   label: 'Bonus Abuser',
      //   icon: Coins,
      //   path: '/bonusAbuser'
      // },
      // {
      //   label: 'No Deposit',
      //   icon: BanknoteArrowDown,
      //   path: '/noDeposit'
      // },
      // {
      //   label: 'Arbitrage Bet',
      //   icon: BarChart2,
      //   path: '/arbitrageBet'
      // }
    ]
  },

  {
    label: 'Admin Panel',
    role: 'admin',
    items: [
      {
        label: 'Manage Users',
        icon: Users,
        path: '/admin/manageUser'
      },
      {
        label: 'Control Panel',
        icon: Settings,
        path: '/admin/controlPanel'
      },
      // {
      //   label: 'Overview',
      //   icon: FileSpreadsheet,
      //   path: '/subsystem/api-monitor'
      // },
      {
        label: 'Analytics',
        icon: AreaChart,
        path: '/subsystem/api-chart'
      }
    ]
  }
]
