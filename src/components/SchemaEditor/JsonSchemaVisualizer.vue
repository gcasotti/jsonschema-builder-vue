<script setup lang="ts">
import { Download, FileJson, Loader2 } from "lucide-vue-next";
import { ref } from "vue";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.ts";
import { useTranslation } from "../../hooks/use-translation.ts";
import { cn } from "../../lib/utils.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import * as monaco from "monaco-editor";

const props = defineProps<{
  schema: JSONSchema;
  class?: string;
}>();

const emit = defineEmits<{
  change: [schema: JSONSchema];
}>();

const editorContainer = ref<HTMLDivElement | null>(null);
const editorInstance = ref<monaco.editor.IStandaloneCodeEditor | null>(null);
const {
  currentTheme,
  defineMonacoThemes,
  configureJsonDefaults,
  defaultEditorOptions,
} = useMonacoTheme();

const t = useTranslation();
const isLoading = ref(true);

import { onMounted, onUnmounted, watch } from "vue";

onMounted(() => {
  if (!editorContainer.value) return;

  defineMonacoThemes(monaco);
  configureJsonDefaults(monaco);

  editorInstance.value = monaco.editor.create(editorContainer.value, {
    value: JSON.stringify(props.schema, null, 2),
    language: "json",
    theme: currentTheme(),
    ...defaultEditorOptions,
  });

  isLoading.value = false;

  editorInstance.value.onDidChangeModelContent(() => {
    const value = editorInstance.value?.getValue();
    if (!value) return;
    try {
      const parsedJson = JSON.parse(value);
      emit("change", parsedJson);
    } catch {
      // Monaco will show the error inline
    }
  });
});

watch(
  () => props.schema,
  (newSchema) => {
    if (!editorInstance.value) return;
    const currentValue = editorInstance.value.getValue();
    const newValue = JSON.stringify(newSchema, null, 2);
    if (currentValue !== newValue) {
      editorInstance.value.setValue(newValue);
    }
  },
);

onUnmounted(() => {
  editorInstance.value?.dispose();
});

const handleDownload = () => {
  const content = JSON.stringify(props.schema, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = t.visualizerDownloadFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div :class="cn('relative overflow-hidden h-full flex flex-col', props.class, 'jsonjoy')">
    <div
      class="flex items-center justify-between bg-secondary/80 backdrop-blur-xs px-4 py-2 border-b shrink-0"
    >
      <div class="flex items-center gap-2">
        <FileJson :size="18" />
        <span class="font-medium text-sm">{{ t.visualizerSource }}</span>
      </div>
      <button
        type="button"
        @click="handleDownload"
        class="p-1.5 hover:bg-secondary rounded-md transition-colors"
        :title="t.visualizerDownloadTitle"
      >
        <Download :size="16" />
      </button>
    </div>
    <div class="grow flex min-h-0 relative">
      <div
        v-if="isLoading"
        class="flex items-center justify-center h-full w-full bg-secondary/30 absolute inset-0 z-10"
      >
        <Loader2 class="h-6 w-6 animate-spin" />
      </div>
      <div ref="editorContainer" class="w-full h-full" />
    </div>
  </div>
</template>
