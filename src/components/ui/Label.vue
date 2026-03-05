<script setup lang="ts">
defineProps<{
  for?: string;
  class?: string;
}>();
</script>

<template>
  <label
    :for="$props.for"
    :class="[
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      $props.class,
    ]"
  >
    <slot />
  </label>
</template>
