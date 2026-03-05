<script setup lang="ts">
import ToggleSwitch from "primevue/toggleswitch";

const model = defineModel<boolean>();

defineProps<{
  id?: string;
  disabled?: boolean;
}>();
</script>

<template>
  <ToggleSwitch v-model="model" :inputId="id" :disabled="disabled" />
</template>
