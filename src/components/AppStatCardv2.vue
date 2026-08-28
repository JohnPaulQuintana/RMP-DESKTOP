<template>
  <div class="alert-banner">
    <div class="alert-icon-wrapper">
      <component :is="icon" :size="20" stroke-width="2.5" />
    </div>

    <div class="alert-content">
      <h4 class="alert-title">{{ title }}</h4>
      <p class="alert-subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  subtitle: string
  icon: Component
}>()
</script>

<style scoped>
.alert-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 26px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;

  /* ✅ DEEPENED SIDEBAR GRADIENT */
  /* Starts at a Deep Cherry, hits a Slate Navy, then fades into the Dashboard background */
  background: linear-gradient(
    90deg,
    #7a1a2e 0%,    /* Deep Cherry Base */
    #b44057 45%,   /* Slate Navy Mid-point (keeps it dark) */
    #f3f4f6 100%   /* Dashboard Grey Background */
  );

  /* Subtle dark border to define the shape on the light background */
  border: 1px solid rgba(163, 156, 156, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

/* Sidebar Pink Accent Bar (Matches the "Testing" button color) */
.alert-banner::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background-color: #ed3d63; /* The actual Pink from your sidebar */
}

.alert-icon-wrapper {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Soft pink glow for the icon box */
  background-color: rgba(237, 61, 99, 0.15);
  color: #ffffff;
  border: 1px solid rgba(237, 61, 99, 0.2);
}

.alert-content {
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.alert-title {
  font-weight: 700;
  font-size: 1.05rem;
  margin: 0;
  color: #ffffff; /* Brilliant white stands out on the dark background */
  letter-spacing: -0.01em;
}

.alert-subtitle {
  font-size: 0.85rem;
  margin-top: 3px;
  line-height: 1.4;
  /* Muted Slate text for the subtitle */
  color: rgba(255, 255, 255, 0.7);
}
</style>
