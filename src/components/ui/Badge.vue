<script setup lang="ts">
import Tag from "primevue/tag";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "default" | "secondary" | "destructive" | "outline";
  }>(),
  { variant: "default" },
);

const severity = computed(() => {
  switch (props.variant) {
    case "destructive":
      return "danger";
    case "secondary":
      return "secondary";
    case "outline":
      return "info";
    default:
      return undefined;
  }
});
</script>

<template>
  <Tag :severity="severity" rounded>
    <slot />
  </Tag>
</template>
