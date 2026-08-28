<script setup lang="ts">

  const props = defineProps<{
    show: boolean
    email: string
    link: string
  }>()

  const emit = defineEmits<{ close: []}>()
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        props.link
      )
    } catch(error) {
      console.error(
        'Copy failed:',
        error
      )
    }
  }
</script>

<template>
  <!-- Modal Wrapper -->
  <div class="modal" :class="{ 'is-active': show }">
    <!-- Overlay Background -->
    <div class="modal-background" @click="emit('close')"></div>

    <!-- Modern Modal Card -->
    <div class="modal-card modern-modal">
      <!-- Modal Header -->
      <header class="modal-card-head modern-header">
        <p class="modal-card-title modern-title">Password Reset Link</p>
        <button class="delete is-large" aria-label="close" @click="emit('close')"></button>
      </header>

      <!-- Modal Body -->
      <section class="modal-card-body modern-body">
        <p class="modern-subtitle">
          Copy this link and send it to: <strong>{{ email }}</strong>
        </p>

        <!-- Input and Copy Action Group -->
        <div class="modern-input-group">
          <input class="modern-link-input" type="text" :value="link" readonly @focus="($event.target as HTMLInputElement).select()" />
          <button class="modern-btn btn-copy" @click="copy">Copy Link</button>
        </div>
      </section>

      <!-- Modal Footer -->
      <footer class="modal-card-foot modern-footer">
        <button class="modern-btn btn-close" @click="emit('close')">Close</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Modal Base Overrides */
.modal {
  z-index: 9999;
}

/* Blur and Darken Background */
.modal-background {
  z-index: 9998;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
}

/* Modern Card Container */
.modern-modal {
  width: min(600px, 90vw);
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: none;
  z-index: 9999;
}

/* Clean Header Structure */
.modern-header {
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  padding: 1.5rem;
}

/* Bold Modern Typography */
.modern-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

/* Body Spacing */
.modern-body {
  padding: 1.75rem 1.5rem;
  background: #ffffff;
}

/* Muted Subtitle Text */
.modern-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

/* Emphasized Email Color */
.modern-subtitle strong {
  color: #0f172a;
  font-weight: 600;
}

/* Pill-shaped Input Wrapper */
.modern-input-group {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.375rem;
  gap: 0.5rem;
  transition: border-color 0.2s ease;
}

/* Input Focus State */
.modern-input-group:focus-within {
  border-color: #cbd5e1;
  box-shadow: 0 0 0 2px #f1f5f9;
}

/* Monospace Read-only Input */
.modern-link-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  color: #334155;
  white-space: nowrap;
  overflow-x: auto;
  outline: none;
}

/* Custom Thin Scrollbar */
.modern-link-input::-webkit-scrollbar {
  height: 4px;
}

/* Custom Scrollbar Thumb */
.modern-link-input::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

/* Base Button Styling */
.modern-btn {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

/* Primary Dark Action Button */
.btn-copy {
  background: #0f172a;
  color: #ffffff;
  white-space: nowrap;
}

/* Copy Button Hover */
.btn-copy:hover {
  background: #1e293b;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Soft Gray Footer */
.modern-footer {
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: flex-end;
}

/* Secondary Cancel/Close Button */
.btn-close {
  background: #ffffff;
  border-color: #e2e8f0;
  color: #475569;
}

/* Close Button Hover */
.btn-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}
</style>
