<script setup lang="ts">
import type { Component } from 'vue'

type AlertType = 'danger' | 'warning' | 'success' | 'info'

defineProps<{
  title: string
  subtitle: string
  icon: Component
  type?: AlertType
  loading?: boolean
}>()
</script>

<template>
  <div class="box alert-banner" :class="type">
    <div class="alert-icon-wrapper">
      <component
        v-if="!loading"
        :is="icon"
        :size="18"
        stroke-width="2.5"
      />

      <div v-else class="icon-skeleton"></div>
    </div>

    <div class="alert-content">
      <template v-if="loading">
        <div class="title-skeleton"></div>
        <div class="subtitle-skeleton"></div>
      </template>

      <template v-else>
        <h4 class="alert-title">{{ title }}</h4>
        <p class="alert-subtitle">{{ subtitle }}</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.alert-banner {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  transition: all 0.2s ease;
  border: 1px solid rgba(255,255,255,0.06);
}

.alert-banner:hover {
  transform: translateY(-1px);
}

/* Accent bar */
.alert-banner::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 4px;
  border-radius: 999px;
  background: var(--accent);
}

/* Icon */
.alert-icon-wrapper {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--icon-bg);
  color: var(--icon-color);
}

.alert-content {
  flex: 1;
}

/* Text */
.alert-title {
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0;
}

.alert-subtitle {
  font-size: 0.8rem;
  margin-top: 2px;
  line-height: 1.5;
  color: rgba(255,255,255,0.75);
}

/* ---------------- Skeleton ---------------- */

.icon-skeleton,
.title-skeleton,
.subtitle-skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,.08) 25%,
    rgba(255,255,255,.18) 50%,
    rgba(255,255,255,.08) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}

.icon-skeleton {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.title-skeleton {
  width: 180px;
  height: 16px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.subtitle-skeleton {
  width: 280px;
  max-width: 100%;
  height: 12px;
  border-radius: 6px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* ---------------- TYPES ---------------- */

/* Danger / Red */
.alert-banner.danger {
  --accent: #ef4444;
  --icon-bg: rgba(239, 68, 68, 0.18);
  --icon-color: #f87171;

  background: linear-gradient(
    90deg,
    #2b1f23 0%,
    #412a31 50%,
    #5a3842 100%
  );
}

/* Warning / Yellow */
.alert-banner.warning {
  --accent: #f59e0b;
  --icon-bg: rgba(245, 158, 11, 0.18);
  --icon-color: #fbbf24;

  background: linear-gradient(
    90deg,
    #2f2617 0%,
    #453419 50%,
    #5b4720 100%
  );
}

/* Success / Green */
.alert-banner.success {
  --accent: #22c55e;
  --icon-bg: rgba(34, 197, 94, 0.18);
  --icon-color: #4ade80;

  background: linear-gradient(
    90deg,
    #172a20 0%,
    #1f3a2b 50%,
    #2a513a 100%
  );
}

/* Info / Blue */
.alert-banner.info {
  --accent: #3b82f6;
  --icon-bg: rgba(59, 130, 246, 0.18);
  --icon-color: #60a5fa;

  background: linear-gradient(
    90deg,
    #1c2738 0%,
    #26364d 50%,
    #334963 100%
  );
}
</style>
