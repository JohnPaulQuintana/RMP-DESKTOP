<script setup lang="ts">
  import { ref } from 'vue'

  import LoginForm from '@/features/auth/components/LoginFormV1.vue'
  import RegisterForm from '@/features/auth/components/RegistrationForm.vue'

  const mode = ref<'login' | 'register'>('login')
</script>

<template>
  <LoginForm
      v-if="mode === 'login'"
      @register="mode = 'register'"
    />

    <RegisterForm
      v-else
      @login="mode = 'login'"
    />
</template>
