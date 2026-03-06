<script setup lang="ts">
import { Check, ChevronDown } from "lucide-vue-next";
import { onMounted, onUnmounted, ref } from "vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import { cn, getTypeColor, getTypeLabel } from "../../lib/utils.ts";
import type { SchemaType } from "../../types/jsonSchema.ts";

const props = withDefaults(
  defineProps<{
    modelValue: SchemaType;
    class?: string;
    readOnly?: boolean;
  }>(),
  { readOnly: false },
);

const emit = defineEmits<{
  "update:modelValue": [value: SchemaType];
}>();

const t = useTranslation();
const isOpen = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);

const typeOptions: SchemaType[] = [
  "string",
  "number",
  "boolean",
  "object",
  "array",
  "null",
];

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});

const selectType = (type: SchemaType) => {
  emit("update:modelValue", type);
  isOpen.value = false;
};
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button
      type="button"
      :class="
        cn(
          'text-xs px-3.5 py-1.5 rounded-md font-medium text-center flex items-center justify-between',
          getTypeColor(modelValue),
          'hover:shadow-xs hover:ring-1 hover:ring-ring/30 active:scale-95 transition-all',
          readOnly ? '' : 'w-[92px]',
          props.class,
        )
      "
      @click="!readOnly && (isOpen = !isOpen)"
    >
      <span>{{ getTypeLabel(t, modelValue) }}</span>
      <ChevronDown v-if="!readOnly" :size="14" class="ml-1" />
    </button>

    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 w-[140px] rounded-md border bg-popover shadow-lg animate-in fade-in-50 zoom-in-95"
    >
      <div class="py-1">
        <button
          v-for="type in typeOptions"
          :key="type"
          type="button"
          :class="
            cn(
              'w-full text-left px-3 py-1.5 text-xs flex items-center justify-between',
              'hover:bg-muted/50 transition-colors',
              modelValue === type && 'font-medium',
            )
          "
          @click="selectType(type)"
        >
          <span :class="cn('px-2 py-0.5 rounded', getTypeColor(type))">
            {{ getTypeLabel(t, type) }}
          </span>
          <Check v-if="modelValue === type" :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>
