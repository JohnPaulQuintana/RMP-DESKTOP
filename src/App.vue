<script setup lang="ts">
import { onMounted } from "vue";
import { listenDesktopLogin } from '@/features/auth/composables/useDesktopAuth'
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

onMounted(async () => {
  console.log("App mounted");
  authStore.loadAuth();

  await listenDesktopLogin();
});
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in" appear>
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style scoped>
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
