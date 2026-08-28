<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

defineOptions({
  name: 'AppLayout'
})

const props = withDefaults(
  defineProps<{
    analyticsViewMode?: 'table' | 'line' | 'heatmap'
  }>(),
  {
    analyticsViewMode: 'table'
  }
)

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="app-layout">

    <aside
      class="sidebar-wrapper"
      :class="{ 'is-open': isSidebarOpen }"
    >
      <AppSidebar
        :analytics-view-mode="props.analyticsViewMode"
      />
    </aside>

    <div
      v-if="isSidebarOpen"
      class="sidebar-overlay"
      @click="toggleSidebar"
    />

    <div class="main-wrapper">

      <AppHeader
        @toggle-sidebar="toggleSidebar"
      />

      <main class="content-wrapper">
        <slot />
      </main>

    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  overflow-x: hidden;
}

.sidebar-wrapper {
  flex-shrink: 0;
  background: white;
  border-right: 1px solid #e5e7eb;
  z-index: 100;
  transition: transform 0.3s ease;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgb(227, 227, 230);
  min-width: 0;
  height: 100vh;
}

.header-bar {
  flex-shrink: 0;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 1000px) {
  .sidebar-wrapper {
    position: fixed;
    height: 100vh;
    transform: translateX(-100%);
  }

  .sidebar-wrapper.is-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 50;
  }
}
</style>
