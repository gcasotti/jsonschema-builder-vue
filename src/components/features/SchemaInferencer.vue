<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";
import { ref, watch } from "vue";
import Button from "../../components/ui/Button.vue";
import Dialog from "../../components/ui/Dialog.vue";
import MonacoEditor from "../../components/ui/MonacoEditor.vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import { createSchemaFromJson } from "../../lib/schema-inference.ts";

const props = withDefaults(
  defineProps<{
    /** When provided, renders as a dialog. Omit to render inline. */
    visible?: boolean;
  }>(),
  { visible: undefined },
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
  schemaInferred: [schema: JSONSchema];
}>();

const t = useTranslation();
const monacoRef = ref<InstanceType<typeof MonacoEditor> | null>(null);
const isProcessing = ref(false);
const errorMessage = ref("");

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

const editorText = ref(sampleJson);
const isDialog = ref(props.visible !== undefined);

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      setTimeout(() => monacoRef.value?.layout(), 100);
    }
  },
);

const handleInfer = () => {
  const value = editorText.value.trim();
  if (!value) return;

  isProcessing.value = true;
  errorMessage.value = "";

  try {
    const jsonObject = JSON.parse(value);
    const inferredSchema = createSchemaFromJson(jsonObject);
    emit("schemaInferred", inferredSchema);
    if (isDialog.value) emit("update:visible", false);
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : "Invalid JSON";
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <!-- Dialog mode (when :visible is provided) -->
  <Dialog
    v-if="isDialog"
    :visible="props.visible ?? false"
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
        <MonacoEditor ref="monacoRef" v-model="editorText" language="json" />
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

  <!-- Inline mode (when :visible is not provided) -->
  <div v-else class="space-y-4 jsonjoy">
    <div class="border rounded-md h-[300px] overflow-hidden">
      <MonacoEditor ref="monacoRef" v-model="editorText" language="json" />
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <div class="flex justify-end">
      <Button size="sm" @click="handleInfer" :disabled="isProcessing">
        <Loader2 v-if="isProcessing" class="animate-spin mr-2" :size="14" />
        {{ t.schemaInferencerInferButton }}
      </Button>
    </div>
  </div>
</template>
