<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Menu, LogOut } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { signOutGoogle } from '@/features/auth/composables/firebaseAuth' // adjust path if needed
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const route = useRoute()
const router = useRouter()

const pageTitle = computed(() => {
  return route.meta.title || 'Title'
})

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

// Sidebar toggle handler
const onClick = () => {
  emit('toggle-sidebar')
}

// User Dropdown State & Handlers
const showUserDropdown = ref(false)

const toggleUserDropdown = (event: Event) => {
  event.stopPropagation() // Prevent click from bubbling to document
  showUserDropdown.value = !showUserDropdown.value
}

const closeDropdown = () => {
  showUserDropdown.value = false
}

const getAvatarText = (email?: string | null): string => {
  if (!email) return 'U'

  const parts = (email.split('@')[0] || '')
    .split(/[-_.]+/)
    .filter(Boolean)

  if (parts.length > 1) {
    return parts
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
  }

  return parts[0]?.slice(0, 2).toUpperCase() || 'U'
}

const handleLogout = async () => {
    try {
      // Sign out from Firebase / Google
      await signOutGoogle()

      // Clear local application auth state
      authStore.logout()

      // Redirect to login
      await router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)

      // Still clear local auth state even if
      // Firebase logout encounters an error
      authStore.logout()

      await router.push('/')
    }
  }

// Close dropdown when clicking anywhere else on the page
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<template>
  <header class="header px-5 py-4">
    <!-- Left -->
    <div class="left">
      <button class="menu-btn mr-4" @click="onClick">
        <Menu :size="22" />
      </button>
      <h1 class="title has-text-danger is-family-monospace">
        {{ pageTitle }}
      </h1>
    </div>

    <!-- Right (User Display) -->
    <div class="user">
      <!-- Avatar Wrapper -->
      <div class="avatar-wrapper" @click="toggleUserDropdown">
        <div class="avatar">{{ getAvatarText(user?.email) }}</div>
      </div>

      <!-- User Dropdown Menu -->
      <div v-if="showUserDropdown" class="user-dropdown" @click.stop>
        <div class="dropdown-header">
          <span class="dropdown-email">{{ user?.email || 'Guest User' }}</span>
        </div>

        <hr class="dropdown-divider" />

        <button class="dropdown-item logout-btn" @click="handleLogout">
          <LogOut :size="16" class="mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  backdrop-filter: blur(6px);
  background: rgb(255, 255, 255);
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
              0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.menu-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #4a4a4a;
  padding: 4px;
  border-radius: 6px;
  transition: 0.2s;
}

.menu-btn:hover {
  background: #fff5f5;
  color: #f14668;
}

@media (min-width: 1000px) {
  .menu-btn {
    display: none;
  }
}

/* Left section */
.left {
  display: flex;
  align-items: center;
}

/* User section */
.user {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Avatar */
.avatar-wrapper {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff3860, #ff3860);
  color: white;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(255, 56, 96, 0.3);
}

/* Dropdown Menu */
.user-dropdown {
  position: absolute;
  top: 46px;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 220px;
  display: flex;
  flex-direction: column;
  z-index: 100;
  animation: fadeIn 0.15s ease-out;
}

.dropdown-header {
  padding: 12px 16px;
  background: #f9fafb;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.dropdown-email {
  font-size: 0.75rem;
  color: #374151;
  font-weight: 600;
  word-break: break-all;
  display: block;
}

.dropdown-divider {
  margin: 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.85rem;
  color: #4b5563;
  transition: background-color 0.2s, color 0.2s;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

/* Logout Button Special Styling */
.logout-btn {
  color: #ef4444;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  font-weight: 500;
}

.logout-btn:hover {
  background-color: #fef2f2;
  color: #dc2626;
}

/* Optional: small fade-in animation for the dropdown */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
