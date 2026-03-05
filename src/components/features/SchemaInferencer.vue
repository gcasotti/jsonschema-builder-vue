<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { ref, watch, onUnmounted } from "vue";
import Button from "../../components/ui/Button.vue";
import Dialog from "../../components/ui/Dialog.vue";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.ts";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import { createSchemaFromJson } from "../../lib/schema-inference.ts";
import * as monaco from "monaco-editor";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  schemaInferred: [schema: JSONSchema];
}>();

const t = useTranslation();
const editorContainer = ref<HTMLDivElement | null>(null);
const editorInstance = ref<monaco.editor.IStandaloneCodeEditor | null>(null);
const isProcessing = ref(false);
const errorMessage = ref("");
const { currentTheme, defineMonacoThemes, defaultEditorOptions } = useMonacoTheme();

const sampleJson = JSON.stringify(
  {
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    active: true,
  },
  null,
  2,
);

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      setTimeout(() => {
        if (!editorContainer.value) return;
        if (editorInstance.value) {
          editorInstance.value.layout();
          return;
        }

        defineMonacoThemes(monaco);
        editorInstance.value = monaco.editor.create(editorContainer.value, {
          value: sampleJson,
          language: "json",
          theme: currentTheme(),
          ...defaultEditorOptions,
        });
      }, 100);
    }
  },
);

onUnmounted(() => {
  editorInstance.value?.dispose();
});

const handleInfer = () => {
  const value = editorInstance.value?.getValue();
  if (!value?.trim()) return;

  isProcessing.value = true;
  errorMessage.value = "";

  try {
    const jsonObject = JSON.parse(value);
    const inferredSchema = createSchemaFromJson(jsonObject);
    emit("schemaInferred", inferredSchema);
    emit("update:visible", false);
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : "Invalid JSON";
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <Dialog
    :visible="props.visible"
    @update:visible="emit('update:visible', $event)"
    class="md:max-w-[700px] max-h-[80vh] w-[95vw] jsonjoy"
  >
    <template #header>
      <div class="mb-2">
        <div class="text-lg font-semibold">{{ t.schemaInferencerTitle }}</div>
        <p class="text-sm text-muted-foreground">{{ t.schemaInferencerDescription }}</p>
      </div>
    </template>

    <div class="space-y-4">
      <div class="border rounded-md h-[300px] overflow-hidden">
        <div ref="editorContainer" class="w-full h-full" />
      </div>

      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

      <div class="flex justify-end gap-2">
        <Button variant="outline" size="sm" @click="emit('update:visible', false)">
          {{ t.fieldAddNewCancel }}
        </Button>
        <Button size="sm" @click="handleInfer" :disabled="isProcessing">
          <Loader2 v-if="isProcessing" class="animate-spin mr-2" :size="14" />
          {{ t.schemaInferencerInferButton }}
        </Button>
      </div>
    </div>
  </Dialog>
</template>
