import './assets/main.css'
import 'bulma/css/bulma.css'
import 'vue-toastification/dist/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

import App from './App.vue'
import router from './router'

import { useAuthStore } from '@/stores/auth'

// plugins
import Toast from 'vue-toastification'

// charts
import VueECharts from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart, HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([
  LineChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  CanvasRenderer
])

const app = createApp(App)

// Create Pinia instance
const pinia = createPinia()

app.use(pinia)

// Restore authentication
const authStore =
  useAuthStore(pinia)

authStore.loadAuth()

// Vue Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {

      // refetch when window focuses
      refetchOnWindowFocus: false,
      // cache time
      staleTime: 1000 * 60 * 5,

      // retry failed requests
      retry: 1
    }
  }
})
app.use(VueQueryPlugin, {
  queryClient
})

// Router after auth initialization
app.use(router)

app.use(Toast, {
  position: 'top-center',
  transition: "Vue-Toastification__slideBlurred",
  timeout: 1000,
  hideProgressBar: false,
  closeOnClick: false,
  pauseOnHover: false

})

app.component('v-chart', VueECharts)

app.mount('#app')
