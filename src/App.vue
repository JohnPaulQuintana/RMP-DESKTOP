```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Bell, RefreshCw, X } from "lucide-vue-next";

import { listenDesktopLogin } from "@/features/auth/composables/useDesktopAuth";
import { useAppUpdater } from "@/features/updater/composables/useAppUpdater";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const {
  updateAvailable,
  updating,
  update,
  updateProgress,
  updateError,
  checkForUpdates,
  installUpdate,
} = useAppUpdater();

// Controls whether the update panel is visible.
const showUpdatePanel = ref(false);

const toggleUpdatePanel = () => {
  showUpdatePanel.value = !showUpdatePanel.value;
};

const closeUpdatePanel = () => {
  showUpdatePanel.value = false;
};

onMounted(async () => {
  authStore.loadAuth();

  await listenDesktopLogin();

  // Check for application updates
  await checkForUpdates();
});
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in" appear>
      <component :is="Component" />
    </Transition>
  </RouterView>

  <!-- ==================================================
       Application Update Notification
       ================================================== -->

  <div class="update-container">
    <!-- Bell Button -->
    <button
      type="button"
      class="update-bell"
      :class="{ 'has-update': updateAvailable }"
      aria-label="Application updates"
      @click="toggleUpdatePanel"
    >
      <Bell :size="21" />

      <!-- Update Badge -->
      <span v-if="updateAvailable" class="update-badge"> 1 </span>
    </button>

    <!-- Update Panel -->
    <Transition name="update-panel">
      <div v-if="showUpdatePanel && updateAvailable" class="update-panel box">
        <!-- Header -->
        <div class="update-header">
          <div class="is-flex is-align-items-center">
            <div class="update-icon mr-3">
              <RefreshCw :size="19" />
            </div>

            <div>
              <h3 class="has-text-weight-semibold mb-0">Update available</h3>

              <p v-if="update" class="is-size-7 has-text-grey mt-1">
                Version {{ update.version }}
              </p>
            </div>
          </div>

          <!-- Close -->
          <button
            type="button"
            class="update-close"
            :disabled="updating"
            aria-label="Close update notification"
            @click="closeUpdatePanel"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- What's New -->
        <div v-if="update?.body" class="update-notes mt-4">
          <p class="is-size-7 has-text-weight-semibold mb-2">What's new</p>

          <p class="is-size-7 has-text-grey">
            {{ update.body }}
          </p>
        </div>

        <!-- Progress -->
        <div v-if="updating && updateProgress !== null" class="mt-4">
          <div class="is-flex is-justify-content-space-between mb-1">
            <span class="is-size-7 has-text-grey"> Downloading update </span>

            <span class="is-size-7 has-text-grey"> {{ updateProgress }}% </span>
          </div>

          <progress
            class="progress is-success is-small"
            :value="updateProgress"
            max="100"
          >
            {{ updateProgress }}%
          </progress>
        </div>

        <!-- Error -->
        <div v-if="updateError" class="update-error mt-3">
          <p class="is-size-7 has-text-danger">
            {{ updateError }}
          </p>
        </div>

        <!-- Update Button -->
        <div class="mt-4">
          <button
            type="button"
            class="button is-success is-fullwidth"
            :class="{ 'is-loading': updating }"
            :disabled="updating"
            @click="installUpdate"
          >
            {{ updating ? "Updating..." : "Update now" }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ==================================================
   Update Notification Container
   ================================================== */

.update-container {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
}

/* ==================================================
   Bell
   ================================================== */

.update-bell {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 42px;
  height: 42px;

  padding: 0;

  border: 1px solid #e5e7eb;
  border-radius: 50%;

  background-color: #ffffff;
  color: #4b5563;

  cursor: pointer;

  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);

  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.update-bell:hover {
  background-color: #f7f9f8;
  color: #16a34a;
  transform: translateY(-1px);
}

/* ==================================================
   Bell Notification Animation
   ================================================== */

.update-bell.has-update {
  color: #16a34a;
  border-color: #bbf7d0;

  animation: bell-pulse 1.8s ease-in-out infinite;
}

@keyframes bell-pulse {
  0%,
  100% {
    box-shadow:
      0 4px 14px rgba(0, 0, 0, 0.08),
      0 0 0 0 rgba(34, 197, 94, 0.25);
  }

  50% {
    box-shadow:
      0 4px 14px rgba(0, 0, 0, 0.08),
      0 0 0 6px rgba(34, 197, 94, 0.08);
  }
}

/* ==================================================
   Notification Badge
   ================================================== */

.update-badge {
  position: absolute;
  top: -3px;
  right: -3px;

  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 17px;
  height: 17px;

  padding: 0 4px;

  border: 2px solid #ffffff;
  border-radius: 999px;

  background-color: #22c55e;
  color: #ffffff;

  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}

/* ==================================================
   Update Panel
   ================================================== */

.update-panel {
  position: absolute;
  top: 52px;
  right: 0;

  width: 380px;

  margin: 0;

  border: 1px solid #e5e7eb;

  background-color: #ffffff;

  box-shadow:
    0 14px 35px rgba(0, 0, 0, 0.12),
    0 4px 10px rgba(0, 0, 0, 0.05);
}

/* ==================================================
   Panel Header
   ================================================== */

.update-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.update-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  flex-shrink: 0;

  border-radius: 8px;

  background-color: #effaf3;
  color: #16a34a;
}

.update-close {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 30px;
  height: 30px;

  padding: 0;

  border: none;
  border-radius: 6px;

  background: transparent;
  color: #9ca3af;

  cursor: pointer;

  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.update-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.update-close:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* ==================================================
   What's New
   ================================================== */

.update-notes {
  padding: 0.85rem;

  border-radius: 7px;

  background-color: #f7f9f8;
}

.update-notes p:last-child {
  margin-bottom: 0;

  white-space: pre-line;
}

/* ==================================================
   Update Error
   ================================================== */

.update-error {
  padding: 0.75rem;

  border: 1px solid #fecaca;
  border-radius: 6px;

  background-color: #fef2f2;
}

/* ==================================================
   Update Panel Animation
   ================================================== */

.update-panel-enter-active,
.update-panel-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.update-panel-enter-from,
.update-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.update-panel-enter-to,
.update-panel-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ==================================================
   Router Transition
   ================================================== */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
```
