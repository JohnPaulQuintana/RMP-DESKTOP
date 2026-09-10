<script setup lang="ts">
import { onMounted } from "vue";
import { RefreshCw, X } from "lucide-vue-next";

import { listenDesktopLogin } from "@/features/auth/composables/useDesktopAuth";
import { useAppUpdater } from "@/features/updater/composables/useAppUpdater";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const {
  updateAvailable,
  updating,
  update,
  checkForUpdates,
  installUpdate,
  dismissUpdate,
} = useAppUpdater();

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

  <!-- Update notification -->
  <Transition name="update">
    <div v-if="updateAvailable" class="update-notification box">
      <div class="is-flex is-align-items-flex-start">
        <!-- Icon -->
        <div class="update-icon mr-3">
          <RefreshCw :size="20" />
        </div>

        <!-- Content -->
        <div class="is-flex-grow-1">
          <h3 class="has-text-weight-semibold mb-1">Update available</h3>

          <p class="is-size-7 has-text-grey">
            A new version of RMP Desktop is available.
          </p>

          <p v-if="update" class="is-size-7 has-text-grey-light mt-1">
            Version {{ update.version }}
          </p>

          <div class="mt-4">
            <button
              type="button"
              class="button is-success is-small"
              :class="{ 'is-loading': updating }"
              :disabled="updating"
              @click="installUpdate"
            >
              {{ updating ? "Updating..." : "Update now" }}
            </button>
          </div>
        </div>

        <!-- Close -->
        <button
          type="button"
          class="delete ml-2"
          :disabled="updating"
          aria-label="Close"
          @click="dismissUpdate"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.update-notification {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  width: 360px;
  margin: 0;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
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
  color: #48c78e;
}

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

.update-enter-active,
.update-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.update-enter-from,
.update-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
