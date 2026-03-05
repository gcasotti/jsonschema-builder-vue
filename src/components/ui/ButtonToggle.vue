<script setup lang="ts">
import { cn } from "../../lib/utils.ts";

defineProps<{
  class?: string;
}>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <button
    type="button"
    :class="
      cn(
        'text-xs px-2 py-1 rounded-md font-medium min-w-[80px] text-center cursor-pointer hover:shadow-xs hover:ring-2 hover:ring-ring/30 active:scale-95 transition-all whitespace-nowrap',
        $props.class,
      )
    "
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>
