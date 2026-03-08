<script setup lang="ts">
import { Download, FileJson } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import { useSchemaStore } from "../../hooks/useSchemaStore.ts";
import { cn } from "../../lib/utils.ts";
import MonacoEditor from "../ui/MonacoEditor.vue";

const props = defineProps<{
  class?: string;
}>();

const store = useSchemaStore();
const schema = computed(() => store.schema.value);
const t = useTranslation();

// ── One-way text buffer ──
// `editorText` is a local string ref that owns Monaco's content.
// Store-to-editor: computed → rAF inside MonacoEditor (via prop)
// Editor-to-store: debounced emit → this handler
let lastStoreJson = JSON.stringify(schema.value);
const editorText = ref(JSON.stringify(schema.value, null, 2));

// When the store changes (e.g. from visual editor), update the text buffer
watch(schema, (newSchema) => {
  const newJson = JSON.stringify(newSchema);
  if (newJson === lastStoreJson) return; // nothing changed structurally
  lastStoreJson = newJson;
  editorText.value = JSON.stringify(newSchema, null, 2);
});

// When the editor emits a change, parse and push to store
const handleEditorUpdate = (newText: string) => {
  try {
    const parsed = JSON.parse(newText);
    const newJson = JSON.stringify(parsed);
    if (newJson === lastStoreJson) return;
    lastStoreJson = newJson;
    store.replaceSchema(parsed);
  } catch {
    // Invalid JSON — Monaco will show the error inline
  }
};

const handleDownload = () => {
  const content = JSON.stringify(schema.value, null, 2);
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
  <div :class="cn('relative overflow-hidden h-full flex flex-col', props.class, 'jscb')">
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
      <MonacoEditor
        :model-value="editorText"
        @update:model-value="handleEditorUpdate"
        language="json"
      />
    </div>
  </div>
</template>
