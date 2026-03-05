<script setup lang="ts">
import InputText from "primevue/inputtext";

const model = defineModel<string>();

defineProps<{
  id?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  class?: string;
  min?: number;
  step?: number | string;
  required?: boolean;
  autofocus?: boolean;
}>();

const emit = defineEmits<{
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
  focus: [event: FocusEvent];
}>();
</script>

<template>
  <InputText
    v-model="model"
    :id="id"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="$props.class"
    :min="min"
    :step="step"
    :required="required"
    :autofocus="autofocus"
    @blur="emit('blur', $event)"
    @keydown="emit('keydown', $event)"
    @focus="emit('focus', $event)"
    fluid
  />
</template>
