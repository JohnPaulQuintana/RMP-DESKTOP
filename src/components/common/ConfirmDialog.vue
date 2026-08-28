<script setup lang="ts">
import { computed } from 'vue'
import {
  AlertTriangle,
  CheckCircle2,
  CircleX
} from 'lucide-vue-next'

import BaseButton from '../base/BaseButton.vue'

interface Props {
  show: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  variant?: 'danger' | 'warning' | 'success'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm Action',
  message: 'Are you sure you want to continue?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loading: false,
  variant: 'danger',
})

const currentIcon = computed(() => {
  switch (props.variant) {
    case 'success':
      return CheckCircle2

    case 'warning':
      return AlertTriangle

    case 'danger':
    default:
      return CircleX
  }
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="confirm-overlay">
      <div class="confirm-backdrop" @click="emit('cancel')" />

      <div class="confirm-card">

        <!-- Icon -->
        <div class="confirm-icon" :class="`is-${variant}`">
          <component
            :is="currentIcon"
            :size="28"
          />
        </div>

        <!-- Content -->
        <div class="confirm-content">
          <h3 class="confirm-title">{{ title }}</h3>
          <p class="confirm-message">{{ message }}</p>
        </div>

        <!-- Actions -->
        <div class="confirm-actions">
          <BaseButton
            class="cancel-btn"
            :disabled="loading"
            @click="emit('cancel')"
          >
            {{ cancelText }}
          </BaseButton>

          <BaseButton
            class="confirm-btn"
            :class="`is-${variant}`"
            :loading="loading"
            :disabled="loading"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .confirm-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .confirm-backdrop {
    position:absolute;
    inset:0;
    background:rgba(15,23,42,.45);
    backdrop-filter:blur(4px);
  }

  .confirm-card {
    position:relative;
    width:420px;
    max-width:90%;
    background:white;
    border-radius:18px;
    padding:28px;
    box-shadow: 0 20px 50px rgba(0,0,0,.15);
    animation:scaleIn .2s ease;
    text-align:center;
  }

  .confirm-icon {
    width:60px;
    height:60px;
    margin:0 auto 18px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
  }

  .confirm-icon.is-danger {
    color:#dc2626;
    background:#fee2e2;
  }

  .confirm-icon.is-warning {
    color:#d97706;
    background:#fef3c7;
  }

  .confirm-icon.is-success {
    color:#059669;
    background:#d1fae5;
  }

  .confirm-title {
    font-size:1.15rem;
    font-weight:700;
    color:#111827;
    margin-bottom:8px;
  }

  .confirm-message {
    font-size:.9rem;
    color:#64748b;
    line-height:1.5;
  }

  .confirm-actions {
    display:flex;
    justify-content:center;
    gap:12px;
    margin-top:25px;
  }

  .cancel-btn {
    background:#f1f5f9;
    color:#475569;
    border:none;
    border-radius:10px;
    padding:10px 20px;
  }

  .confirm-btn {
    border:none;
    border-radius:10px;
    padding:10px 22px;
    color:white;
  }

  .confirm-btn.is-danger {
    background:#ef4444;
  }

  .confirm-btn.is-warning {
    background:#f59e0b;
  }

  .confirm-btn.is-success {
    background:#10b981;
  }

  .confirm-btn:hover {
    filter:brightness(.95);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition:.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity:0;
  }

  @keyframes scaleIn {
    from {
      transform:scale(.9);
      opacity:0;
    }
    to {
      transform:scale(1);
      opacity:1;
    }
  }
</style>
