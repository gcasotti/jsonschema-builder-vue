<script setup lang="ts">
import { Maximize2 } from "lucide-vue-next";
import { ref, watch } from "vue";
import Tabs from "../../components/ui/Tabs.vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import { createSchemaStore, provideSchemaStore } from "../../hooks/useSchemaStore.ts";
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

// ─── Schema Store ───────────────────────────────────────────────────────────
// The store is the single source of truth. It uses shallowRef internally,
// so the schema object is never deep-proxied by Vue.
//
// ANTI-LOOP DESIGN:
// onChange defers the emit to a macrotask (setTimeout). This guarantees that
// Vue's entire reactive flush (watchers + re-renders) completes BEFORE the
// parent component receives the update. This makes it physically impossible
// for a single schema change to circle back through the prop watcher.
let skipNextWatch = false;
let pendingEmit: ReturnType<typeof setTimeout> | null = null;
let lastEmittedJson = JSON.stringify(props.schema);

const store = createSchemaStore(props.schema, (newSchema) => {
  const json = JSON.stringify(newSchema);
  if (json === lastEmittedJson) return; // no-op if structurally identical
  lastEmittedJson = json;

  // Cancel any pending emit — only the latest schema matters
  if (pendingEmit !== null) clearTimeout(pendingEmit);

  // Defer the emit to a macrotask — BREAKS the synchronous reactive cycle
  skipNextWatch = true;
  pendingEmit = setTimeout(() => {
    pendingEmit = null;
    emit("update:schema", newSchema);
    // Reset the skip flag AFTER the next Vue flush processes the prop update
    setTimeout(() => { skipNextWatch = false; }, 0);
  }, 0);
});

// Provide the store so all descendants can inject it.
provideSchemaStore(store);

// Watch the prop for EXTERNAL changes only (e.g., "Reset to Example" button).
// NO { deep: true } — only fires on reference change from parent.
watch(
  () => props.schema,
  (newSchema) => {
    if (skipNextWatch) return;
    // Check structural equality to avoid redundant store updates
    const json = JSON.stringify(newSchema);
    if (json === lastEmittedJson) return;
    lastEmittedJson = json;
    store.replaceSchema(newSchema);
  },
);

// ─── UI state ───────────────────────────────────────────────────────────────
const isFullscreen = ref(false);
const leftPanelWidth = ref(50);
const containerRef = ref<HTMLDivElement | null>(null);
const isDragging = ref(false);
const activeTab = ref("visual");

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
          <SchemaVisualEditor :read-only="readOnly" />
        </TabPanel>

        <TabPanel value="json" :class="cn('focus:outline-hidden w-full', isFullscreen ? 'h-screen' : 'h-[500px]')">
          <JsonSchemaVisualizer />
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
          <SchemaVisualEditor :read-only="readOnly" />
        </div>
        <div
          class="w-1 bg-border hover:bg-primary cursor-col-resize shrink-0"
          @mousedown="handleMouseDown"
        />
        <div class="h-full min-h-0" :style="{ width: `${100 - leftPanelWidth}%` }">
          <JsonSchemaVisualizer />
        </div>
      </div>
    </div>
  </div>
</template>
