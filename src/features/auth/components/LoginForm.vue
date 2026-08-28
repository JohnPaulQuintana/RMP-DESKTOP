<script setup lang="ts">
import { ref } from 'vue'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import BaseToggle from '@/components/base/BaseToggle.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useLoginForm } from '../composables/useLoginForm'

const emit = defineEmits<{
  register: []
}>()

const showPassword = ref(false)

const {
  email,
  password,
  errors,
  rememberMe,
  isLoading,
  validateField,
  isValidEmail,
  isValidPassword,
  submitLogin
} = useLoginForm()

const goToRegister = () => emit('register')
</script>
<template>
  <section class="modern-hero">
    <div class="modern-container">
      <div class="modern-card">
        <!-- Branding Header -->
        <div class="brand-header">
          <h1 class="modern-title">RISK TOOL</h1>
          <p class="modern-subtitle">Risk Management Portal</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="submitLogin" class="modern-form">
          <!-- Email Field -->
          <div class="modern-field">
            <label class="modern-label">Email Address</label>
            <div class="modern-control">
              <input v-model="email" class="modern-input" :class="{ 'is-error': errors.email, 'is-valid': isValidEmail() }" type="email" placeholder="Enter email" @input="validateField('email')" @blur="validateField('email')" />
            </div>
            <p v-if="errors.email" class="modern-help is-error">{{ errors.email }}</p>
          </div>

          <!-- Password Field -->
          <div class="modern-field">
            <label class="modern-label">Password</label>
            <div class="modern-control password-wrapper">
              <input v-model="password" class="modern-input has-icon-right" :class="{ 'is-error': errors.password, 'is-valid': isValidPassword() }" :type="showPassword ? 'text' : 'password'" placeholder="Enter password" @input="validateField('password')" @blur="validateField('password')" />
              <span class="password-toggle" @click="showPassword = !showPassword">
                <EyeIcon v-if="!showPassword" :size="18" />
                <EyeOffIcon v-else :size="18" />
              </span>
            </div>
            <p v-if="errors.password" class="modern-help is-error">{{ errors.password }}</p>
          </div>

          <!-- Remember Me Toggle -->
          <div class="modern-remember">
            <BaseToggle v-model="rememberMe" label="Remember me" />
          </div>

          <!-- Submit Button -->
          <BaseButton type="submit" class="modern-btn-submit" :loading="isLoading" :disabled="isLoading">Login</BaseButton>
        </form>

        <!-- Footer Actions -->
        <p class="modern-footer-text">
          Don't have an account? <a class="modern-link" @click="goToRegister">Signup</a>
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

.modern-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #e11d48;
  letter-spacing: -0.025em;
  margin: 0 0 0.35rem 0;
}

.modern-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

/* Form Elements */
.modern-field {
  margin-bottom: 1.25rem;
}

.modern-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  text-align: left;
}

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

.modern-input::placeholder {
  color: #94a3b8;
}

.modern-input:focus {
  outline: none;
  border-color: #e11d48;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(225, 29, 72, 0.1);
}

.modern-input.is-error {
  border-color: #f43f5e;
}

.modern-input.is-valid {
  border-color: #10b981;
}

/* Password Visibility Toggle */
.password-wrapper .modern-input {
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  z-index: 5;
}

.password-toggle:hover {
  color: #e11d48;
}

/* Validation Messaging */
.modern-help {
  font-size: 0.75rem;
  margin-top: 0.4rem;
  text-align: left;
  font-weight: 500;
}

.modern-help.is-error {
  color: #f43f5e;
}

/* Remember Me Container */
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

:deep(.modern-btn-submit:hover:not(:disabled)) {
  background-color: #be123c;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px -2px rgba(225, 29, 72, 0.3);
}

:deep(.modern-btn-submit:disabled) {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

/* Footer Section */
.modern-footer-text {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

.modern-link {
  color: #e11d48;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;
  margin-left: 0.25rem;
}

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
