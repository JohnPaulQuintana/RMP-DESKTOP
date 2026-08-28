<script setup lang="ts">
  defineProps<{
    loading?: boolean
  }>()
</script>

<template>
  <div class="modern-table-wrapper mt-4">
    <div v-if="loading" class="table-loading">
      <div class="loader"></div>
    </div>
    <table class="modern-table">
      <thead>
        <slot name="header" />
      </thead>
      <tbody>
        <slot />
      </tbody>
    </table>
  </div>
</template>

<style scoped>
  /* ========================================================================== */
  /* Modern Table Wrapper */
  /* ========================================================================== */
  .modern-table-wrapper {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    border: 1px solid #f1f1f1;
    position: relative;
    overflow: hidden;
  }
  /* ========================================================================== */
  /* Loading */
  /* ========================================================================== */

  .table-loading {
    position:absolute;
    inset:0;
    background:rgba(255,255,255,.8);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:10;
    backdrop-filter:blur(2px);
  }
  .loader {
    width:40px;
    height:40px;
    border:4px solid #e5e7eb;
    border-top:4px solid #ef4444;
    border-radius:50%;
    animation:spin .8s linear infinite;
  }

  @keyframes spin {
    to {
      transform:rotate(360deg);
    }

  }


  /* ========================================================================== */
  /* Table */
  /* ========================================================================== */
  .modern-table {
    width:100%;
    border-collapse:collapse;
    font-size:.9rem;
  }

  .modern-table :deep(thead th) {
    text-align:left;
    font-weight:600;
    font-size:.75rem;
    text-transform:uppercase;
    letter-spacing:.05em;
    color:#94a3b8;
    padding:1rem 1.25rem;
    border-bottom:1px solid #edf2f7;
    background:#fafafa;
  }

  .modern-table :deep(tbody td) {
    padding:1.1rem 1.25rem;
    border-bottom:1px solid #f5f5f5;
    vertical-align:middle;
  }

  .modern-table :deep(tbody tr:hover){
    background:#f8fafc;
  }
</style>
