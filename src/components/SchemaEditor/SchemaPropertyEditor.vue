<script setup lang="ts">
import { ChevronDown, ChevronRight, X } from "lucide-vue-next";
import { ref, watch } from "vue";
import InputField from "../../components/ui/InputField.vue";
import Badge from "../../components/ui/Badge.vue";
import ButtonToggle from "../../components/ui/ButtonToggle.vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import { cn } from "../../lib/utils.ts";
import type { JSONSchema, ObjectJSONSchema, SchemaType } from "../../types/jsonSchema.ts";
import { asObjectSchema, getSchemaDescription, withObjectSchema } from "../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";
import TypeDropdown from "./TypeDropdown.vue";
import TypeEditor from "./TypeEditor.vue";

const props = withDefaults(
  defineProps<{
    name: string;
    schema: JSONSchema;
    required?: boolean;
    readOnly?: boolean;
    validationNode?: ValidationTreeNode;
    depth?: number;
  }>(),
  { required: false, readOnly: false, depth: 0 },
);

const emit = defineEmits<{
  delete: [];
  nameChange: [newName: string];
  requiredChange: [required: boolean];
  schemaChange: [schema: ObjectJSONSchema];
}>();

const t = useTranslation();
const expanded = ref(false);
const isEditingName = ref(false);
const isEditingDesc = ref(false);
const tempName = ref(props.name);
const tempDesc = ref(getSchemaDescription(props.schema));

const type = () =>
  withObjectSchema(
    props.schema,
    (s) => (s.type || "object") as SchemaType,
    "object" as SchemaType,
  );

watch(
  () => [props.name, props.schema],
  () => {
    tempName.value = props.name;
    tempDesc.value = getSchemaDescription(props.schema);
  },
);

const handleNameSubmit = () => {
  const trimmedName = tempName.value.trim();
  if (trimmedName && trimmedName !== props.name) {
    emit("nameChange", trimmedName);
  } else {
    tempName.value = props.name;
  }
  isEditingName.value = false;
};

const handleDescSubmit = () => {
  const trimmedDesc = tempDesc.value.trim();
  if (trimmedDesc !== getSchemaDescription(props.schema)) {
    emit("schemaChange", {
      ...asObjectSchema(props.schema),
      description: trimmedDesc || undefined,
    });
  } else {
    tempDesc.value = getSchemaDescription(props.schema);
  }
  isEditingDesc.value = false;
};

const handleSchemaUpdate = (updatedSchema: ObjectJSONSchema) => {
  const description = getSchemaDescription(props.schema);
  emit("schemaChange", {
    ...updatedSchema,
    description: description || undefined,
  });
};

const handleTypeChange = (newType: SchemaType) => {
  emit("schemaChange", {
    ...asObjectSchema(props.schema),
    type: newType,
  });
};
</script>

<template>
  <div
    :class="
      cn(
        'mb-2 animate-in rounded-lg border transition-all duration-200',
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
              @click="isEditingName = true"
              @keydown="$event.key === 'Enter' && (isEditingName = true)"
              class="json-field-label font-medium cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-xs hover:ring-1 hover:ring-ring/20 transition-all text-left truncate min-w-[80px] max-w-[50%]"
            >
              {{ name }}
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
              v-else-if="tempDesc"
              type="button"
              @click="isEditingDesc = true"
              @keydown="$event.key === 'Enter' && (isEditingDesc = true)"
              class="text-xs text-muted-foreground italic cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-xs hover:ring-1 hover:ring-ring/20 transition-all text-left truncate flex-1 max-w-[40%] mr-2"
            >
              {{ tempDesc }}
            </button>
            <button
              v-else
              type="button"
              @click="isEditingDesc = true"
              @keydown="$event.key === 'Enter' && (isEditingDesc = true)"
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
              @click="!readOnly && emit('requiredChange', !required)"
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
          @click="emit('delete')"
          class="p-1 rounded-md hover:bg-secondary hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
          :aria-label="t.propertyDelete"
        >
          <X :size="16" />
        </button>
      </div>
    </div>

    <!-- Type-specific editor -->
    <div v-if="expanded" class="pt-1 pb-2 px-2 sm:px-3 animate-in">
      <p v-if="readOnly && tempDesc" class="pb-2">{{ tempDesc }}</p>
      <TypeEditor
        :schema="schema"
        :read-only="readOnly"
        :validation-node="validationNode"
        :depth="depth + 1"
        @change="handleSchemaUpdate"
      />
    </div>
  </div>
</template>
