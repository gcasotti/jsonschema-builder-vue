<script setup lang="ts">
import { CheckCircle, Loader2, XCircle } from "lucide-vue-next";
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import Button from "../../components/ui/Button.vue";
import Dialog from "../../components/ui/Dialog.vue";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.ts";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import { validateJson, type ValidationResult } from "../../utils/jsonValidator.ts";
import * as monaco from "monaco-editor";

const props = defineProps<{
  schema: JSONSchema;
  visible: boolean;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

const t = useTranslation();
const editorContainer = ref<HTMLDivElement | null>(null);
const editorInstance = ref<monaco.editor.IStandaloneCodeEditor | null>(null);
const validationResult = ref<ValidationResult | null>(null);
const isValidating = ref(false);
const { currentTheme, defineMonacoThemes, defaultEditorOptions } = useMonacoTheme();

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const jsonInput = ref(
  JSON.stringify(
    {
      name: "John Doe",
      email: "john@example.com",
      age: 30,
    },
    null,
    2,
  ),
);

const handleValidation = () => {
  isValidating.value = true;
  validationResult.value = validateJson(jsonInput.value, props.schema);
  isValidating.value = false;
};

const debouncedValidate = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(handleValidation, 500);
};

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
          value: jsonInput.value,
          language: "json",
          theme: currentTheme(),
          ...defaultEditorOptions,
        });

        editorInstance.value.onDidChangeModelContent(() => {
          jsonInput.value = editorInstance.value?.getValue() || "";
          debouncedValidate();
        });

        handleValidation();
      }, 100);
    }
  },
);

onUnmounted(() => {
  editorInstance.value?.dispose();
  if (debounceTimer) clearTimeout(debounceTimer);
});

const errorCount = computed(() => validationResult.value?.errors?.length || 0);
</script>

<template>
  <Dialog
    :visible="props.visible"
    @update:visible="emit('update:visible', $event)"
    class="md:max-w-[700px] max-h-[80vh] w-[95vw] jsonjoy"
  >
    <template #header>
      <div class="mb-2">
        <div class="text-lg font-semibold">{{ t.jsonValidatorTitle }}</div>
        <p class="text-sm text-muted-foreground">{{ t.jsonValidatorDescription }}</p>
      </div>
    </template>

    <div class="space-y-4">
      <div class="border rounded-md h-[300px] overflow-hidden">
        <div ref="editorContainer" class="w-full h-full" />
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <template v-if="isValidating">
            <Loader2 class="animate-spin" :size="16" />
            <span class="text-sm text-muted-foreground">{{ t.jsonValidating }}</span>
          </template>
          <template v-else-if="validationResult?.valid">
            <CheckCircle :size="16" class="text-green-500" />
            <span class="text-sm text-green-600">{{ t.jsonValidatorValid }}</span>
          </template>
          <template v-else-if="validationResult && !validationResult.valid">
            <XCircle :size="16" class="text-red-500" />
            <span class="text-sm text-red-600">
              {{ errorCount }} {{ errorCount === 1 ? t.jsonValidatorError : t.jsonValidatorErrors }}
            </span>
          </template>
        </div>
        <Button size="sm" @click="handleValidation">{{ t.jsonValidatorValidateButton }}</Button>
      </div>

      <div v-if="validationResult?.errors?.length" class="space-y-2 max-h-[200px] overflow-y-auto">
        <div
          v-for="(error, idx) in validationResult.errors"
          :key="idx"
          class="flex items-start gap-2 p-2 rounded-md bg-red-50 text-sm"
        >
          <XCircle :size="14" class="text-red-500 mt-0.5 shrink-0" />
          <div>
            <span class="font-mono text-xs text-muted-foreground">{{ error.path }}</span>
            <span v-if="error.line"> ({{ t.jsonValidatorLine }} {{ error.line }})</span>
            <p class="text-red-600">{{ error.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>
