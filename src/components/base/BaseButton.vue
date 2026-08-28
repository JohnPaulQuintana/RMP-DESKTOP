<script setup lang="ts">
  defineProps<{
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
  }>()
</script>

<template>
  <button
    :type="type || 'button'"
    class="button"
    :class="{
      'is-loading': loading
    }"
    :disabled="disabled || loading"
  >
    <slot />
  </button>
</template>
