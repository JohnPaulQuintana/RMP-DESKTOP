<script setup lang="ts">
  import BaseToggle from '@/components/base/BaseToggle.vue'
  import { useRegisterForm } from '../composables/useRegisterForm'
  import BaseButton from '@/components/base/BaseButton.vue'

  const emit = defineEmits<{ login: [] }>()

  const {
    email,
    password,
    confirmPassword,
    showPassword,
    errors,
    isLoading,
    validateField,
    submitRegister
  } = useRegisterForm(emit)

  const goToLogin = () => { emit('login') }
</script>
<template>
  <section class="modern-hero">
    <div class="modern-container">
      <div class="modern-card">
        <!-- Branding Header -->
        <div class="brand-header">
          <h1 class="modern-title">RISK TOOL</h1>
          <p class="modern-subtitle">Setup Account</p>
        </div>

        <!-- Registration Form -->
        <form @submit.prevent="submitRegister" class="modern-form">

          <!-- Email Field -->
          <div class="modern-field">
            <label class="modern-label">Email Address</label>
            <div class="modern-control">
              <input v-model="email" class="modern-input" :class="{ 'is-error': errors.email, 'is-valid': email && !errors.email }" type="email" placeholder="Enter email" @blur="validateField('email')" />
            </div>
            <p v-if="errors.email" class="modern-help is-error">{{ errors.email }}</p>
          </div>

          <!-- Password Field -->
          <div class="modern-field">
            <label class="modern-label">Password</label>
            <div class="modern-control">
              <input v-model="password" class="modern-input" :class="{ 'is-error': errors.password, 'is-valid': password && !errors.password }" :type="showPassword ? 'text' : 'password'" placeholder="Enter password" @blur="validateField('password')" />
            </div>
            <p v-if="errors.password" class="modern-help is-error">{{ errors.password }}</p>
          </div>

          <!-- Confirm Password Field -->
          <div class="modern-field">
            <label class="modern-label">Confirm Password</label>
            <div class="modern-control">
              <input v-model="confirmPassword" class="modern-input" :class="{ 'is-error': errors.confirmPassword, 'is-valid': confirmPassword && !errors.confirmPassword }" :type="showPassword ? 'text' : 'password'" placeholder="Confirm password" @blur="validateField('confirmPassword')" />
            </div>
            <p v-if="errors.confirmPassword" class="modern-help is-error">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Show Password Toggle -->
          <div class="modern-remember">
            <BaseToggle v-model="showPassword" label="Show Password" />
          </div>

          <!-- Submit Button -->
          <BaseButton type="submit" class="modern-btn-submit" :loading="isLoading" :disabled="isLoading">Register</BaseButton>
        </form>

        <!-- Footer Actions -->
        <p class="modern-footer-text">
          Already have an account? <a class="modern-link" @click="goToLogin">Login</a>
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
  background-color: #f8fafc;
  padding: 1.5rem;
}

/* Container Sizing */
.modern-container {
  width: 100%;
  max-width: 440px;
  display: flex;
  justify-content: center;
}

/* Card Styling */
.modern-card {
  background: #ffffff;
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
  padding: 2.5rem 2.5rem;
  transition: all 0.3s ease;
}

/* Typography */
.brand-header {
  text-align: center;
  margin-bottom: 2.25rem;
}

/* Title Font */
.modern-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #e11d48;
  letter-spacing: -0.025em;
  margin: 0 0 0.35rem 0;
}

/* Subtitle Font */
.modern-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

/* Form Elements */
.modern-field {
  margin-bottom: 1.25rem;
}

/* Input Labels */
.modern-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  text-align: left;
}

/* Control Wrapper */
.modern-control {
  position: relative;
  width: 100%;
}

/* Input Fields */
.modern-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #1e293b;
  background-color: #f8fafc;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

/* Placeholder Color */
.modern-input::placeholder {
  color: #94a3b8;
}

/* Focus State */
.modern-input:focus {
  outline: none;
  border-color: #e11d48;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(225, 29, 72, 0.1);
}

/* Error State */
.modern-input.is-error {
  border-color: #f43f5e;
}

/* Valid State */
.modern-input.is-valid {
  border-color: #10b981;
}

/* Validation Messaging */
.modern-help {
  font-size: 0.75rem;
  margin-top: 0.4rem;
  text-align: left;
  font-weight: 500;
}

/* Error Text Color */
.modern-help.is-error {
  color: #f43f5e;
}

/* Toggle Container */
.modern-remember {
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* Submit Button Overrides */
:deep(.modern-btn-submit) {
  width: 100%;
  background-color: #e11d48;
  color: #ffffff;
  border: none;
  padding: 0.875rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(225, 29, 72, 0.2);
  display: flex;
  justify-content: center;
}

/* Submit Button Hover */
:deep(.modern-btn-submit:hover:not(:disabled)) {
  background-color: #be123c;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px -2px rgba(225, 29, 72, 0.3);
}

/* Submit Button Disabled */
:deep(.modern-btn-submit:disabled) {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

/* Footer Text */
.modern-footer-text {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

/* Footer Link */
.modern-link {
  color: #e11d48;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;
  margin-left: 0.25rem;
}

/* Footer Link Hover */
.modern-link:hover {
  color: #be123c;
  text-decoration: underline;
}

/* Mobile Responsiveness Adjustments */
@media screen and (max-width: 480px) {
  .modern-card {
    padding: 2rem 1.5rem;
  }
}
</style>
