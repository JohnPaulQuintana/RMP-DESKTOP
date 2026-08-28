<script setup lang="ts">
  const model = defineModel<boolean>({ default: false })

  defineProps<{
    label?: string
  }>()
</script>


<template>
  <label class="toggle">
    <input
      v-model="model"
      type="checkbox"
    />
    <span class="slider"></span>
    <span class="label-text">
      {{ label }}
    </span>
  </label>

</template>


<style scoped>

  .toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
  }


  .toggle input {
    display: none;
  }


  .slider {

    width: 42px;
    height: 22px;

    background: #d3d3d3;

    border-radius: 20px;

    position: relative;

    transition: .3s;

  }


  .slider::before {

    content: '';

    position: absolute;

    width: 18px;
    height: 18px;

    left: 2px;
    top: 2px;

    background: white;

    border-radius: 50%;

    transition: .3s;

  }


  .toggle input:checked + .slider {

    background: #f14668;

  }


  .toggle input:checked + .slider::before {

    transform: translateX(20px);

  }


  .label-text {

    font-size: .9rem;

  }

</style>
