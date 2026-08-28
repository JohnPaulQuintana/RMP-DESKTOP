<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: number
  subtitle: string
  icon: Component
  type: 'info' | 'success' | 'warning' | 'danger'
  loading?: boolean
}>()

const iconClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'has-text-success'
    case 'warning':
      return 'has-text-warning'
    case 'danger':
      return 'has-text-danger'
    default:
      return 'has-text-info'
  }
})

const isDanger = computed(() => props.type === 'danger')
</script>

<template>
  <div class="box risk-card" :class="{ 'border-danger-glow': isDanger }">
    <component :is="icon" class="card-bg-icon" />

    <div class="card-header">
      <h3 class="heading">{{ title }}</h3>
      <div class="icon-badge">
        <component
          :is="icon"
          :size="18"
          :class="iconClass"
        />
      </div>
    </div>

    <div class="card-content">
      <template v-if="loading">
        <div class="value-skeleton"></div>
        <div class="subtitle-skeleton"></div>
      </template>

      <template v-else>
        <p class="title-value">
          {{ value }}
        </p>
        <p class="subtitle-text">
          {{ subtitle }}
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* =========================================
   Modern Dark Card Styling
========================================= */
.risk-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  height: 100%;

  /* Ensures full width stretching within flex layouts */
  width: 100%;
  box-sizing: border-box;

  padding: 1.25rem 1.5rem;

  /* Retained original background */
  background: linear-gradient(145deg, #1f2a3c, #24324a);

  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.risk-card > *:not(.card-bg-icon) {
  position: relative;
  z-index: 1;
}

/* Smooth Hover Effects */
.risk-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.3);
}

/* Danger Glow Enhancement */
.border-danger-glow {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.border-danger-glow:hover {
  border-color: rgba(241, 70, 104, 0.4);
  box-shadow: 0 12px 24px -8px rgba(241, 70, 104, 0.25);
}

/* =========================================
   Decorative Background Icon
========================================= */
.card-bg-icon {
  position: absolute;
  right: -10px;
  bottom: -15px;
  width: 100px;
  height: 100px;
  color: rgba(255, 255, 255, 0.03);
  transform: rotate(-10deg);
  transition: transform 0.5s ease;
  z-index: 0;
}

.risk-card:hover .card-bg-icon {
  transform: rotate(0deg) scale(1.05);
  color: rgba(255, 255, 255, 0.05);
}

/* =========================================
   Header & Badge
========================================= */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.heading {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  margin: 0;
}

.icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(4px);
}

/* =========================================
   Content Typography
========================================= */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  letter-spacing: -0.03em;
  font-feature-settings: "tnum"; /* Better number alignment */
  margin: 0;
}

.subtitle-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  margin: 0;
}

/* =========================================
   Skeleton Loaders (Modern Shimmer)
========================================= */
.value-skeleton,
.subtitle-skeleton {
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: modernShimmer 1.5s ease-in-out infinite;
}

.value-skeleton {
  width: 80px;
  height: 40px;
  margin-bottom: 0.25rem;
  border-radius: 8px;
}

.subtitle-skeleton {
  width: 130px;
  height: 14px;
}

@keyframes modernShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
