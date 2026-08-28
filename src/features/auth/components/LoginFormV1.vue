<script setup lang="ts">
  import { computed } from 'vue'
  import { useLoginGoogle } from '../composables/useLoginGoogle'

  const props = defineProps<{
    isLoading?: boolean
  }>()

  const {
    isLoading: googleLoading,
    errorMessage,
    handleGoogleLogin,
  } = useLoginGoogle()

  const isLoadingState = computed(() => {
    return Boolean(
      props.isLoading ||
      googleLoading.value
    )
  })
</script>

<template>
  <section class="modern-hero">
    <div class="modern-container">
      <div class="modern-card">
        <!-- Decorative Top Border -->
        <div class="card-accent-line"></div>

        <!-- Brand Logo -->
        <div class="brand-logo-wrapper">
          <div
            class="brand-logo-glow"
            :class="{ 'is-pulsing-fast': isLoadingState }"
          ></div>

          <div class="brand-logo-inner">
            <svg
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="brand-svg"
            >
              <!-- Outer Hexagon -->
              <path
                d="M20 0L37.3205 10V30L20 40L2.67949 30V10L20 0Z"
                fill="url(#paint0_linear)"
                fill-opacity="0.9"
              />

              <!-- Inner Cutout -->
              <path
                d="M20 8L30.3923 14V26L20 32L9.60769 26V14L20 8Z"
                fill="#ffffff"
              />

              <!-- Core Hexagon -->
              <path
                d="M20 13L26.0622 16.5V23.5L20 27L13.9378 23.5V16.5L20 13Z"
                fill="url(#paint1_linear)"
              />

              <defs>
                <linearGradient
                  id="paint0_linear"
                  x1="0"
                  y1="0"
                  x2="40"
                  y2="40"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#f43f5e" />
                  <stop offset="1" stop-color="#e11d48" />
                </linearGradient>

                <linearGradient
                  id="paint1_linear"
                  x1="13.9"
                  y1="13"
                  x2="26.06"
                  y2="27"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#be123c" />
                  <stop offset="1" stop-color="#9f1239" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <!-- Branding Header -->
        <div class="brand-header">
          <h1 class="modern-title">
            Risk Management Portal
          </h1>

          <p class="modern-subtitle">
            Sign in to access your workspace
          </p>
        </div>

        <!-- Authentication -->
        <div class="auth-actions">
          <button
            type="button"
            class="google-auth-btn"
            :class="{ 'is-loading': isLoadingState }"
            :disabled="isLoadingState"
            @click="handleGoogleLogin"
          >
            <!-- Loading State -->
            <template v-if="isLoadingState">
              <div class="btn-spinner"></div>
              <span>Authenticating...</span>
            </template>

            <!-- Default State -->
            <template v-else>
              <svg
                class="google-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />

                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />

                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />

                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>

              <span>Continue with Google</span>
            </template>
          </button>
        </div>

        <!-- Authentication Error -->
        <p
          v-if="errorMessage"
          class="auth-error"
          role="alert"
        >
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Main Layout & Centering */
.modern-hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f7f9;
  padding: 1.5rem;
}

.modern-container {
  width: 100%;
  max-width: 440px;
  display: flex;
  justify-content: center;
}

/* Card Styling */
.modern-card {
  position: relative;
  background: #ffffff;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 4rem 3rem;
  text-align: center;
  overflow: hidden;
}

/* Decorative Top Accent Line */
.card-accent-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #e11d48, #fb7185);
}

/* Eye-Catching Logo Setup */
.brand-logo-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
}

.brand-logo-glow {
  position: absolute;
  width: 50px;
  height: 50px;
  background: #e11d48;
  filter: blur(20px);
  opacity: 0.4;
  border-radius: 50%;
  animation: pulseGlow 3s ease-in-out infinite alternate;
}

.brand-logo-glow.is-pulsing-fast {
  animation: pulseGlowFast 1s ease-in-out infinite alternate;
  background: #f43f5e;
}

.brand-logo-inner {
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.brand-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 6px rgba(225, 29, 72, 0.2));
}

.modern-card:hover .brand-logo-inner {
  transform: scale(1.08);
}

@keyframes pulseGlow {
  0% { transform: scale(0.9); opacity: 0.3; }
  100% { transform: scale(1.2); opacity: 0.5; }
}

@keyframes pulseGlowFast {
  0% { transform: scale(0.9); opacity: 0.4; }
  100% { transform: scale(1.4); opacity: 0.8; }
}

/* Typography */
.brand-header {
  margin-bottom: 2.5rem;
}

.modern-title {
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.01em;
  margin: 0 0 0.6rem 0;
  white-space: nowrap;
}

.modern-subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  margin: 0;
}

/* Auth Actions */
.auth-actions {
  display: flex;
  justify-content: center;
}

/* Full Width Google Button */
.google-auth-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 0.85rem 1.25rem;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.google-auth-btn:hover:not(:disabled) {
  background-color: #f8fafc;
  border-color: #94a3b8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.08);
}

.google-auth-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* Disabled & Loading States */
.google-auth-btn:disabled {
  background-color: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
  cursor: not-allowed;
  box-shadow: none;
}

.google-icon {
  width: 22px;
  height: 22px;
}

/* Spinner Animation */
.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid #e2e8f0;
  border-top-color: #e11d48;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.auth-error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #be123c;
  font-size: 0.875rem;
  font-weight: 600;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile Responsiveness Adjustments */
@media screen and (max-width: 480px) {
  .modern-card {
    padding: 3rem 1.5rem;
  }

  .modern-title {
    font-size: 1.3rem;
  }
}
</style>
