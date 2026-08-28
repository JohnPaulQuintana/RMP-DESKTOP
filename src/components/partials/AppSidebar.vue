<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ShieldAlert, LogOut } from 'lucide-vue-next'

  import { useAuthStore } from '@/stores/auth'
  import { sidebarMenu } from '@/config/sidebar'
  // import ChartFilter from '@/components/AppChartFilter.vue'
  import ChartFilter from '@/features/admin/analytics/components/AnalyticsFilter.vue'
  import { signOutGoogle } from '@/features/auth/composables/firebaseAuth' // adjust path if needed

  // =====================
  // AUTH
  // =====================

  const authStore = useAuthStore()

  const user = computed(() => authStore.user)

  const router = useRouter() // navigate to another page.
  const route = useRoute()

  // =====================
  // PAGE
  // =====================

  const isChartPage = computed(() =>
    route.path.includes('/subsystem/api-chart')
  )

  // const isOverviewPage = computed(() =>
  //   route.path.includes('/subsystem/api-monitor')
  // )

  // =====================
  // PROPS
  // =====================

  const props = withDefaults(
    defineProps<{
      analyticsViewMode?: 'table' | 'line' | 'heatmap'
    }>(),
    {
      analyticsViewMode: 'table'
    }
  )

  // =====================
  // MENU
  // =====================

  const visibleSections = computed(() =>
    sidebarMenu.filter(section => section.role === user.value?.role)
  )

  // =====================
  // LOGOUT
  // =====================

  const handleLogout = async () => {
    try {
      // Sign out from Firebase / Google
      await signOutGoogle()

      // Clear local application auth state
      authStore.logout()

      // Redirect to login
      await router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)

      // Still clear local auth state even if
      // Firebase logout encounters an error
      authStore.logout()

      await router.push('/')
    }
  }
</script>

<template>
  <aside class="menu p-5 has-background-white sidebar is-flex is-flex-direction-column">

    <!-- HEADER -->
    <div class="is-flex is-align-items-center mb-5">
      <ShieldAlert
        :size="32"
        class="mr-2 has-text-danger"
      />

      <h1 class="title is-4 has-text-danger is-family-monospace">
        Risk
      </h1>
    </div>

    <!-- MENU -->
    <template v-for="(section, index) in visibleSections" :key="section.label">
      <hr v-if="index > 0" class="section-divider"/>
      <ul class="menu-list">
        <li v-for="item in section.items" :key="item.path">
          <RouterLink :to="item.path" active-class="is-active">
            <component :is="item.icon" :size="18" class="mr-3" />
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>
    </template>

    <!-- CHART FILTER -->
    <ChartFilter
      v-if="isChartPage"
      mode="full"
      :view-mode="props.analyticsViewMode"
    />

    <!-- <ChartFilter
      v-if="isOverviewPage"
      mode="date"
    /> -->

    <!-- LOGOUT -->
    <div class="mt-auto">
      <hr class="divider" />
      <ul class="menu-list">
        <li>
          <button class="logout-button has-text-danger has-text-weight-semibold" @click="handleLogout">
            <LogOut :size="18" class="mr-3"/>
            Logout
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
  /* ==========================
    SIDEBAR
  ========================== */
  .sidebar {
    width: 250px;
    height: 100vh;
    position: sticky;
    top: 0;
    overflow-y: auto;
    border-right: 1px solid #e5e7eb;
    background: #fff;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .sidebar::-webkit-scrollbar {
    display: none;
  }

  /* ==========================
    MENU
  ========================== */
  .menu-label {
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8a8a8a;
  }
  .menu-list {
    margin-bottom: 1rem;
  }
  .menu-list li + li {
    margin-top: 4px;
  }
  .menu-list a {
    display: flex;
    align-items: center;
    padding: 0.7rem 0.9rem;
    border-radius: 8px;
    color: #4a4a4a;
    text-decoration: none;
    transition: all 0.2s ease;
  }
  .menu-list a:hover {
    background: #fff5f5 !important;
    color: #f14668 !important;
  }
  .menu-list a.is-active {
    background: #f14668 !important;
    color: #fff !important;
  }
  .menu-list a.is-active svg {
    stroke: white;
  }

  .section-divider {
    margin: .1rem 0;
    border: none;
    border-top: 1px solid #e5e7eb;
  }

  /* ==========================
    LOGOUT
  ========================== */
  .logout-button {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.7rem 0.9rem;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #f14668 !important;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .logout-button:hover {
    background: #f14668;
    color: white !important;
  }

  .logout-button:hover svg {
    stroke: white;
  }

  /* ==========================
    RESPONSIVE
  ========================== */

  @media (max-width: 1024px) {
    .sidebar {
      width: 220px;
    }
  }

  @media (max-width: 768px) {
    .sidebar {
      width: 200px;
    }

    .menu-list a,
    .logout-button {
      padding: 0.6rem 0.75rem;
      font-size: 0.9rem;
    }
  }
</style>
