<script setup lang="ts">
/**
 * Isolated Monaco Editor wrapper.
 *
 * ─── ANTI-LOOP DESIGN ───
 * This wrapper COMPLETELY isolates Monaco from Vue's reactivity.
 * - Monaco instance is stored in a plain variable (NOT a ref).
 * - `modelValue` prop updates are applied via requestAnimationFrame.
 * - `onDidChangeModelContent` emits are debounced via setTimeout.
 * - A `suppressChangeEvent` flag prevents re-entrant calls.
 *
 * ─── LAZY LOADING ───
 * Monaco is imported dynamically in `onMounted`, so it is never pulled into
 * the bundle at the top level. Consumers who never render this component
 * will never trigger the import.
 *
 * Usage:
 *   <MonacoEditor v-model="jsonText" language="json" />
 */

import type * as MonacoNS from "monaco-editor";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.ts";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    language?: string;
    readOnly?: boolean;
  }>(),
  { modelValue: "", language: "json", readOnly: false },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editorContainer = ref<HTMLDivElement | null>(null);
const {
  currentTheme,
  defineMonacoThemes,
  configureJsonDefaults,
  defaultEditorOptions,
} = useMonacoTheme();

// ── Intentionally NOT reactive ──
// Using plain variables prevents Vue from tracking Monaco internals.
let editorInstance: MonacoNS.editor.IStandaloneCodeEditor | null = null;
let suppressChangeEvent = false;
let pendingRaf: number | null = null;
let pendingEmit: ReturnType<typeof setTimeout> | null = null;
let lastSetValue = "";

onMounted(async () => {
  if (!editorContainer.value) return;

  const monaco = await import("monaco-editor");

  defineMonacoThemes(monaco);
  configureJsonDefaults(monaco);

  lastSetValue = props.modelValue;

  editorInstance = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language,
    theme: currentTheme(),
    readOnly: props.readOnly,
    ...defaultEditorOptions,
  });

  editorInstance.onDidChangeModelContent(() => {
    if (suppressChangeEvent) return;
    const value = editorInstance?.getValue() || "";
    if (value === lastSetValue) return;

    // Debounce emit to prevent rapid-fire updates
    if (pendingEmit) clearTimeout(pendingEmit);
    pendingEmit = setTimeout(() => {
      pendingEmit = null;
      const current = editorInstance?.getValue() || "";
      if (current === lastSetValue) return;
      lastSetValue = current;
      emit("update:modelValue", current);
    }, 150);
  });
});

// Watch prop changes and apply them via rAF — never synchronously
watch(
  () => props.modelValue,
  (newValue) => {
    if (!editorInstance) return;
    if (newValue === lastSetValue) return;
    // Also check current editor content to avoid redundant setValue
    if (newValue === editorInstance.getValue()) {
      lastSetValue = newValue;
      return;
    }
    lastSetValue = newValue;

    if (pendingRaf !== null) cancelAnimationFrame(pendingRaf);
    pendingRaf = requestAnimationFrame(() => {
      pendingRaf = null;
      if (!editorInstance) return;
      suppressChangeEvent = true;
      editorInstance.setValue(newValue);
      suppressChangeEvent = false;
    });
  },
);

onUnmounted(() => {
  if (pendingRaf !== null) cancelAnimationFrame(pendingRaf);
  if (pendingEmit) clearTimeout(pendingEmit);
  editorInstance?.dispose();
  editorInstance = null;
});

/** Expose a layout method for the parent to call when visibility changes */
const layout = () => editorInstance?.layout();
defineExpose({ layout });
</script>

<template>
  <div ref="editorContainer" class="w-full h-full" />
</template>
