<script setup lang="ts">
import PButton from "primevue/button";

withDefaults(
  defineProps<{
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    type?: "button" | "submit" | "reset";
  }>(),
  { variant: "default", size: "default", type: "button" },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <PButton
    :type="type"
    :severity="
      variant === 'destructive'
        ? 'danger'
        : variant === 'secondary'
          ? 'secondary'
          : undefined
    "
    :outlined="variant === 'outline'"
    :text="variant === 'ghost' || variant === 'link'"
    :link="variant === 'link'"
    :size="size === 'sm' ? 'small' : size === 'lg' ? 'large' : undefined"
    @click="emit('click', $event)"
  >
    <slot />
  </PButton>
</template>
