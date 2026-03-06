<script setup lang="ts">
import { ChevronDown, ChevronRight, X } from "lucide-vue-next";
import { computed, ref } from "vue";
import Badge from "../../components/ui/Badge.vue";
import ButtonToggle from "../../components/ui/ButtonToggle.vue";
import InputField from "../../components/ui/InputField.vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import { useSchemaStore } from "../../hooks/useSchemaStore.ts";
import { cn } from "../../lib/utils.ts";
import type {
  JSONSchema,
  ObjectJSONSchema,
  SchemaType,
} from "../../types/jsonSchema.ts";
import {
  getSchemaDescription,
  withObjectSchema,
} from "../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";
import TypeDropdown from "./TypeDropdown.vue";
import TypeEditor from "./TypeEditor.vue";

const props = withDefaults(
  defineProps<{
    path: string[];
    name: string;
    schema: JSONSchema;
    required?: boolean;
    readOnly?: boolean;
    validationNode?: ValidationTreeNode;
    depth?: number;
  }>(),
  { required: false, readOnly: false, depth: 0 },
);

const store = useSchemaStore();
const t = useTranslation();
const expanded = ref(false);
const isEditingName = ref(false);
const isEditingDesc = ref(false);

// Display values — computed directly from props, no side effects.
const displayName = computed(() => props.name);
const displayDesc = computed(() => getSchemaDescription(props.schema));

// Edit-local refs — only populated when user starts editing.
const tempName = ref("");
const tempDesc = ref("");

const type = () =>
  withObjectSchema(
    props.schema,
    (s) => (s.type || "object") as SchemaType,
    "object" as SchemaType,
  );

const startEditingName = () => {
  tempName.value = props.name;
  isEditingName.value = true;
};

const startEditingDesc = () => {
  tempDesc.value = getSchemaDescription(props.schema);
  isEditingDesc.value = true;
};

const handleNameSubmit = () => {
  const trimmedName = tempName.value.trim();
  if (trimmedName && trimmedName !== props.name) {
    store.renameProperty(props.path, props.name, trimmedName);
  } else {
    tempName.value = props.name;
  }
  isEditingName.value = false;
};

const handleDescSubmit = () => {
  const trimmedDesc = tempDesc.value.trim();
  if (trimmedDesc !== getSchemaDescription(props.schema)) {
    // Update the property schema with the new description
    const currentSchema = store.getAtPath([...props.path, props.name]);
    const plain = JSON.parse(
      JSON.stringify(currentSchema ?? { type: "object" }),
    );
    plain.description = trimmedDesc || undefined;
    store.updateProperty(props.path, props.name, plain);
  } else {
    tempDesc.value = getSchemaDescription(props.schema);
  }
  isEditingDesc.value = false;
};

const handleSchemaUpdate = (updatedSchema: ObjectJSONSchema) => {
  // Preserve the description from the current property
  const description = getSchemaDescription(props.schema);
  const plain = JSON.parse(JSON.stringify(updatedSchema));
  plain.description = description || undefined;
  store.updateProperty(props.path, props.name, plain);
};

const handleTypeChange = (newType: SchemaType) => {
  const currentSchema = store.getAtPath([...props.path, props.name]);
  const plain = JSON.parse(JSON.stringify(currentSchema ?? { type: "object" }));
  plain.type = newType;
  store.updateProperty(props.path, props.name, plain);
};

const handleRequiredToggle = () => {
  if (props.readOnly) return;
  store.setPropertyRequired(props.path, props.name, !props.required);
};

const handleDelete = () => {
  store.deleteProperty(props.path, props.name);
};
</script>

<template>
  <div
    :class="
      cn(
        'mb-2 rounded-lg border transition-colors duration-200',
        depth > 0 && 'ml-0 sm:ml-4 border-l border-l-border/40',
      )
    "
  >
    <div class="relative json-field-row justify-between group">
      <div class="flex items-center gap-2 grow min-w-0">
        <!-- Expand/collapse button -->
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground transition-colors"
          @click="expanded = !expanded"
          :aria-label="expanded ? t.collapse : t.expand"
        >
          <ChevronDown v-if="expanded" :size="18" />
          <ChevronRight v-else :size="18" />
        </button>

        <!-- Property name -->
        <div class="flex items-center gap-2 grow min-w-0 overflow-visible">
          <div class="flex items-center gap-2 min-w-0 grow overflow-visible">
            <InputField
              v-if="!readOnly && isEditingName"
              v-model="tempName"
              @blur="handleNameSubmit()"
              @keydown="$event.key === 'Enter' && handleNameSubmit()"
              class="h-8 text-sm font-medium min-w-[120px] max-w-full z-10"
              :autofocus="true"
              @focus="($event.target as HTMLInputElement)?.select()"
            />
            <button
              v-else
              type="button"
              @click="startEditingName()"
              @keydown="$event.key === 'Enter' && startEditingName()"
              class="json-field-label font-medium cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-xs hover:ring-1 hover:ring-ring/20 transition-all text-left truncate min-w-[80px] max-w-[50%]"
            >
              {{ displayName }}
            </button>

            <!-- Description -->
            <InputField
              v-if="!readOnly && isEditingDesc"
              v-model="tempDesc"
              @blur="handleDescSubmit()"
              @keydown="$event.key === 'Enter' && handleDescSubmit()"
              :placeholder="t.propertyDescriptionPlaceholder"
              class="h-8 text-xs text-muted-foreground italic flex-1 min-w-[150px] z-10"
              :autofocus="true"
              @focus="($event.target as HTMLInputElement)?.select()"
            />
            <button
              v-else-if="displayDesc"
              type="button"
              @click="startEditingDesc()"
              @keydown="$event.key === 'Enter' && startEditingDesc()"
              class="text-xs text-muted-foreground italic cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-xs hover:ring-1 hover:ring-ring/20 transition-all text-left truncate flex-1 max-w-[40%] mr-2"
            >
              {{ displayDesc }}
            </button>
            <button
              v-else
              type="button"
              @click="startEditingDesc()"
              @keydown="$event.key === 'Enter' && startEditingDesc()"
              class="text-xs text-muted-foreground/50 italic cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-xs hover:ring-1 hover:ring-ring/20 transition-all opacity-0 group-hover:opacity-100 text-left truncate flex-1 max-w-[40%] mr-2"
            >
              {{ t.propertyDescriptionButton }}
            </button>
          </div>

          <!-- Type display -->
          <div class="flex items-center gap-2 justify-end shrink-0">
            <TypeDropdown
              :model-value="type()"
              :read-only="readOnly"
              @update:model-value="handleTypeChange"
            />

            <!-- Required toggle -->
            <ButtonToggle
              @click="handleRequiredToggle"
              :class="required ? 'bg-red-50 text-red-500' : 'bg-secondary text-muted-foreground'"
            >
              {{ required ? t.propertyRequired : t.propertyOptional }}
            </ButtonToggle>
          </div>
        </div>
      </div>

      <!-- Error badge -->
      <Badge
        v-if="validationNode?.cumulativeChildrenErrors > 0"
        class="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums justify-center"
        variant="destructive"
      >
        {{ validationNode.cumulativeChildrenErrors }}
      </Badge>

      <!-- Delete button -->
      <div v-if="!readOnly" class="flex items-center gap-1 text-muted-foreground">
        <button
          type="button"
          @click="handleDelete"
          class="p-1 rounded-md hover:bg-secondary hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
          :aria-label="t.propertyDelete"
        >
          <X :size="16" />
        </button>
      </div>
    </div>

    <!-- Type-specific editor -->
    <div v-if="expanded" class="pt-1 pb-2 px-2 sm:px-3">
      <p v-if="readOnly && displayDesc" class="pb-2">{{ displayDesc }}</p>
      <TypeEditor
        :schema="schema"
        :path="[...path, name]"
        :read-only="readOnly"
        :validation-node="validationNode"
        :depth="depth + 1"
        @change="handleSchemaUpdate"
      />
    </div>
  </div>
</template>
