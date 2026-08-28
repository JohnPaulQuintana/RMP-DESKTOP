<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'

const props = defineProps<{
  title: string
  value: string | number // Changed to string|number to handle commas like 3,333
  subtitle: string
  icon: Component
  type: 'info' | 'success' | 'warning' | 'danger'
  growth?: string // Added for the +12% / -2% indicator in your image
}>()

// Map types to the specific vibrant colors from your image
const typeClass = computed(() => `is-${props.type}`)
</script>

<template>
  <div class="stat-card" :class="typeClass">
    <div class="top-accent"></div>

    <div class="card-header">
      <span class="heading-label">{{ title }}</span>
      <div class="icon-badge">
        <component :is="icon" :size="18" />
      </div>
    </div>

    <div class="card-body">
      <h2 class="main-value">{{ value }}</h2>

      <div class="card-footer">
        <p class="subtitle-text">{{ subtitle }}</p>

        <div v-if="growth" class="growth-pill">
          <span class="growth-arrow">{{ growth.startsWith('+') ? '↑' : '↓' }}</span>
          {{ growth }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
  transition: transform 0.2s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
}

/* 1. Top Accent Bar */
.top-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

/* 2. Layout Sections */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.heading-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #718096; /* Slate gray */
}

.icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%; /* Circle look from image */
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-value {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -1px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 8px;
}

.subtitle-text {
  font-size: 0.8rem;
  color: #a0aec0;
  margin: 0;
}

/* 3. Growth Pill */
.growth-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 4. Color Palette Logic (Matching the Image) */

/* DANGER (Red/Pink) */
.is-danger .top-accent { background: #f14668; }
.is-danger .main-value { color: #f14668; }
.is-danger .icon-badge { background: #fff5f7; color: #f14668; }
.is-danger .growth-pill { background: #fff5f7; color: #f14668; }

/* SUCCESS (Green) */
.is-success .top-accent { background: #00b894; }
.is-success .main-value { color: #00b894; }
.is-success .icon-badge { background: #e6fffa; color: #00b894; }
.is-success .growth-pill { background: #e6fffa; color: #00b894; }

/* WARNING (Orange/Yellow) */
.is-warning .top-accent { background: #ff9f43; }
.is-warning .main-value { color: #ff9f43; }
.is-warning .icon-badge { background: #fff9f2; color: #ff9f43; }
.is-warning .growth-pill { background: #fff9f2; color: #ff9f43; }

/* INFO (Purple - matching the 'Monthly' card) */
.is-info .top-accent { background: #a29bfe; }
.is-info .main-value { color: #a29bfe; }
.is-info .icon-badge { background: #f3f0ff; color: #a29bfe; }
.is-info .growth-pill { background: #f3f0ff; color: #a29bfe; }

</style>
