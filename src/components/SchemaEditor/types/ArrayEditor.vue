<script setup lang="ts">
import { computed, ref, useId } from "vue";
import InputField from "../../../components/ui/InputField.vue";
import Label from "../../../components/ui/Label.vue";
import Switch from "../../../components/ui/Switch.vue";
import { useTranslation } from "../../../hooks/use-translation.ts";
import { getArrayItemsSchema } from "../../../lib/schemaEditor.ts";
import { cn } from "../../../lib/utils.ts";
import type {
  ObjectJSONSchema,
  SchemaType,
} from "../../../types/jsonSchema.ts";
import {
  isBooleanSchema,
  withObjectSchema,
} from "../../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../../types/validation.ts";
import TypeDropdown from "../TypeDropdown.vue";
import TypeEditor from "../TypeEditor.vue";

const props = withDefaults(
  defineProps<{
    schema: import("../../../types/jsonSchema.ts").JSONSchema;
    path: string[];
    readOnly?: boolean;
    validationNode?: ValidationTreeNode;
    depth?: number;
  }>(),
  { readOnly: false, depth: 0 },
);

const emit = defineEmits<{
  change: [schema: ObjectJSONSchema];
}>();

const t = useTranslation();
const minItems = ref<number | undefined>(
  withObjectSchema(props.schema, (s) => s.minItems, undefined),
);
const maxItems = ref<number | undefined>(
  withObjectSchema(props.schema, (s) => s.maxItems, undefined),
);
const uniqueItems = ref(
  withObjectSchema(props.schema, (s) => s.uniqueItems || false, false),
);

const minItemsId = useId();
const maxItemsId = useId();
const uniqueItemsId = useId();

const itemsSchema = computed(
  () => getArrayItemsSchema(props.schema) || { type: "string" },
);

const itemType = computed(() =>
  withObjectSchema(
    itemsSchema.value,
    (s) => (s.type || "string") as SchemaType,
    "string" as SchemaType,
  ),
);

const buildValidationProps = (
  overrides: {
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
  } = {},
) => {
  const base = isBooleanSchema(props.schema)
    ? {}
    : JSON.parse(JSON.stringify(props.schema));
  const validationProps: ObjectJSONSchema = {
    type: "array",
    ...base,
    minItems: overrides.minItems ?? minItems.value,
    maxItems: overrides.maxItems ?? maxItems.value,
    uniqueItems: (overrides.uniqueItems ?? uniqueItems.value) || undefined,
  };

  if (validationProps.items === undefined && itemsSchema.value) {
    validationProps.items = itemsSchema.value;
  }

  const propsToKeep: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(validationProps)) {
    if (value !== undefined) propsToKeep[key] = value;
  }
  return propsToKeep as ObjectJSONSchema;
};

const handleValidationChange = () => {
  emit("change", buildValidationProps());
};

const handleItemSchemaChange = (updatedItemSchema: ObjectJSONSchema) => {
  const base = isBooleanSchema(props.schema)
    ? {}
    : JSON.parse(JSON.stringify(props.schema));
  emit("change", {
    type: "array",
    ...base,
    items: updatedItemSchema,
  });
};

const handleItemTypeChange = (newType: SchemaType) => {
  const currentItems = itemsSchema.value;
  const plain = isBooleanSchema(currentItems)
    ? {}
    : JSON.parse(JSON.stringify(currentItems));
  handleItemSchemaChange({ ...plain, type: newType });
};

const minMaxError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "minmax",
    )?.message,
);
const minItemsError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "minItems",
    )?.message,
);
const maxItemsError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "maxItems",
    )?.message,
);
</script>

<template>
  <div class="space-y-6">
    <div v-if="!readOnly || !!maxItems || !!minItems" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-if="!readOnly || !!minItems" class="space-y-2">
        <Label :for="minItemsId" :class="(!!minMaxError || !!minItemsError) && 'text-destructive'">
          {{ t.arrayMinimumLabel }}
        </Label>
        <InputField :id="minItemsId" type="number" :min="0"
          :model-value="minItems !== undefined ? String(minItems) : ''"
          @update:model-value="(v: string) => { minItems = v ? Number(v) : undefined; }"
          @blur="handleValidationChange()"
          :placeholder="t.arrayMinimumPlaceholder"
          :class="cn('h-8', !!minMaxError && 'border-destructive')" />
      </div>
      <div v-if="!readOnly || !!maxItems" class="space-y-2">
        <Label :for="maxItemsId" :class="(!!minMaxError || !!maxItemsError) && 'text-destructive'">
          {{ t.arrayMaximumLabel }}
        </Label>
        <InputField :id="maxItemsId" type="number" :min="0"
          :model-value="maxItems !== undefined ? String(maxItems) : ''"
          @update:model-value="(v: string) => { maxItems = v ? Number(v) : undefined; }"
          @blur="handleValidationChange()"
          :placeholder="t.arrayMaximumPlaceholder"
          :class="cn('h-8', !!minMaxError && 'border-destructive')" />
      </div>
      <div v-if="!!minMaxError || !!minItemsError || !!maxItemsError" class="text-xs text-destructive italic md:col-span-2 whitespace-pre-line">
        {{ [minMaxError, minItemsError ?? maxItemsError].filter(Boolean).join("\n") }}
      </div>
    </div>

    <div v-if="!readOnly || !!uniqueItems" class="flex items-center space-x-2">
      <Switch :id="uniqueItemsId" :model-value="uniqueItems"
        @update:model-value="(checked: boolean) => { uniqueItems = checked; emit('change', buildValidationProps({ uniqueItems: checked })); }" />
      <Label :for="uniqueItemsId" class="cursor-pointer">{{ t.arrayForceUniqueItemsLabel }}</Label>
    </div>

    <div :class="cn('space-y-2 pt-4 border-border/40', (!readOnly || !!minItems || !!maxItems || !!uniqueItems) ? 'border-t' : null)">
      <div class="flex items-center justify-between mb-4">
        <Label>{{ t.arrayItemTypeLabel }}</Label>
        <TypeDropdown
          :read-only="readOnly"
          :model-value="itemType"
          @update:model-value="handleItemTypeChange"
        />
      </div>
      <TypeEditor
        :read-only="readOnly"
        :schema="itemsSchema"
        :path="path"
        :validation-node="validationNode"
        :depth="depth + 1"
        @change="handleItemSchemaChange"
      />
    </div>
  </div>
</template>
