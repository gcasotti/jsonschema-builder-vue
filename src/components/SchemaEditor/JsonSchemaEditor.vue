<script setup lang="ts">
import { Maximize2 } from "lucide-vue-next";
import { ref } from "vue";
import Tabs from "../../components/ui/Tabs.vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import { cn } from "../../lib/utils.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import JsonSchemaVisualizer from "./JsonSchemaVisualizer.vue";
import SchemaVisualEditor from "./SchemaVisualEditor.vue";
import TabPanel from "primevue/tabpanel";

/** @public */
export interface JsonSchemaEditorProps {
  schema?: JSONSchema;
  readOnly?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<JsonSchemaEditorProps>(), {
  schema: () => ({ type: "object" }),
  readOnly: false,
});

const emit = defineEmits<{
  "update:schema": [schema: JSONSchema];
}>();

const t = useTranslation();
const isFullscreen = ref(false);
const leftPanelWidth = ref(50);
const containerRef = ref<HTMLDivElement | null>(null);
const isDragging = ref(false);
const activeTab = ref("visual");

const handleSchemaChange = (newSchema: JSONSchema) => {
  emit("update:schema", newSchema);
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const fullscreenClass = () => (isFullscreen.value ? "fixed inset-0 z-50 bg-background" : "");

const handleMouseDown = (e: MouseEvent) => {
  e.preventDefault();
  isDragging.value = true;
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !containerRef.value) return;
  const containerRect = containerRef.value.getBoundingClientRect();
  const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
  if (newWidth >= 20 && newWidth <= 80) {
    leftPanelWidth.value = newWidth;
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
};
</script>

<template>
  <div :class="cn('json-editor-container w-full', fullscreenClass(), props.class, 'jsonjoy')">
    <!-- For mobile screens - show as tabs -->
    <div class="block lg:hidden w-full">
      <Tabs
        v-model="activeTab"
        :tabs="[
          { value: 'visual', label: t.schemaEditorEditModeVisual },
          { value: 'json', label: t.schemaEditorEditModeJson },
        ]"
        class="w-full"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b w-full">
          <h3 class="font-medium">{{ t.schemaEditorTitle }}</h3>
          <button
            type="button"
            @click="toggleFullscreen"
            class="p-1.5 rounded-md hover:bg-secondary transition-colors"
            :aria-label="t.schemaEditorToggleFullscreen"
          >
            <Maximize2 :size="16" />
          </button>
        </div>

        <TabPanel value="visual" :class="cn('focus:outline-hidden w-full', isFullscreen ? 'h-screen' : 'h-[500px]')">
          <SchemaVisualEditor :read-only="readOnly" :schema="schema" @change="handleSchemaChange" />
        </TabPanel>

        <TabPanel value="json" :class="cn('focus:outline-hidden w-full', isFullscreen ? 'h-screen' : 'h-[500px]')">
          <JsonSchemaVisualizer :schema="schema" @change="handleSchemaChange" />
        </TabPanel>
      </Tabs>
    </div>

    <!-- For large screens - show side by side -->
    <div
      ref="containerRef"
      :class="cn('hidden lg:flex lg:flex-col w-full', isFullscreen ? 'h-screen' : 'h-[600px]')"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b w-full shrink-0">
        <h3 class="font-medium">{{ t.schemaEditorTitle }}</h3>
        <button
          type="button"
          @click="toggleFullscreen"
          class="p-1.5 rounded-md hover:bg-secondary transition-colors"
          :aria-label="t.schemaEditorToggleFullscreen"
        >
          <Maximize2 :size="16" />
        </button>
      </div>
      <div class="flex flex-row w-full grow min-h-0">
        <div class="h-full min-h-0" :style="{ width: `${leftPanelWidth}%` }">
          <SchemaVisualEditor :read-only="readOnly" :schema="schema" @change="handleSchemaChange" />
        </div>
        <div
          class="w-1 bg-border hover:bg-primary cursor-col-resize shrink-0"
          @mousedown="handleMouseDown"
        />
        <div class="h-full min-h-0" :style="{ width: `${100 - leftPanelWidth}%` }">
          <JsonSchemaVisualizer :schema="schema" @change="handleSchemaChange" />
        </div>
      </div>
    </div>
  </div>
</template>
