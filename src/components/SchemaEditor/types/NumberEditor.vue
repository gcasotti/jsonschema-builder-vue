<script setup lang="ts">
import Chip from "primevue/chip";
import InputNumber from "primevue/inputnumber";
import { computed, ref, useId } from "vue";
import Button from "../../../components/ui/Button.vue";
import { useTranslation } from "../../../hooks/use-translation.ts";
import type { ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import {
  isBooleanSchema,
  withObjectSchema,
} from "../../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../../types/validation.ts";

type Property =
  | "minimum"
  | "maximum"
  | "exclusiveMinimum"
  | "exclusiveMaximum"
  | "multipleOf"
  | "enum";

const props = withDefaults(
  defineProps<{
    schema: import("../../../types/jsonSchema.ts").JSONSchema;
    path: string[];
    readOnly?: boolean;
    validationNode?: ValidationTreeNode;
    depth?: number;
    integer?: boolean;
  }>(),
  { readOnly: false, depth: 0, integer: false },
);

const emit = defineEmits<{
  change: [schema: ObjectJSONSchema];
}>();

const enumValue = ref("");
const t = useTranslation();

const maximumId = useId();
const minimumId = useId();
const exclusiveMinimumId = useId();
const exclusiveMaximumId = useId();
const multipleOfId = useId();

const minimum = computed(() =>
  withObjectSchema(props.schema, (s) => s.minimum, undefined),
);
const maximum = computed(() =>
  withObjectSchema(props.schema, (s) => s.maximum, undefined),
);
const exclusiveMinimum = computed(() =>
  withObjectSchema(props.schema, (s) => s.exclusiveMinimum, undefined),
);
const exclusiveMaximum = computed(() =>
  withObjectSchema(props.schema, (s) => s.exclusiveMaximum, undefined),
);
const multipleOf = computed(() =>
  withObjectSchema(props.schema, (s) => s.multipleOf, undefined),
);
const enumValues = computed(() =>
  withObjectSchema(props.schema, (s) => (s.enum as number[]) || [], []),
);

const handleValidationChange = (property: Property, value: unknown) => {
  const baseProperties: Partial<ObjectJSONSchema> = {
    type: props.integer ? "integer" : "number",
  };

  if (!isBooleanSchema(props.schema)) {
    if (props.schema.minimum !== undefined)
      baseProperties.minimum = props.schema.minimum;
    if (props.schema.maximum !== undefined)
      baseProperties.maximum = props.schema.maximum;
    if (props.schema.exclusiveMinimum !== undefined)
      baseProperties.exclusiveMinimum = props.schema.exclusiveMinimum;
    if (props.schema.exclusiveMaximum !== undefined)
      baseProperties.exclusiveMaximum = props.schema.exclusiveMaximum;
    if (props.schema.multipleOf !== undefined)
      baseProperties.multipleOf = props.schema.multipleOf;
    if (props.schema.enum !== undefined)
      baseProperties.enum = [...(props.schema.enum as unknown[])];
  }

  if (value !== undefined) {
    const updatedProperties: Partial<ObjectJSONSchema> = { ...baseProperties };
    if (property === "minimum") updatedProperties.minimum = value as number;
    else if (property === "maximum")
      updatedProperties.maximum = value as number;
    else if (property === "exclusiveMinimum")
      updatedProperties.exclusiveMinimum = value as number;
    else if (property === "exclusiveMaximum")
      updatedProperties.exclusiveMaximum = value as number;
    else if (property === "multipleOf")
      updatedProperties.multipleOf = value as number;
    else if (property === "enum") updatedProperties.enum = value as unknown[];
    emit("change", updatedProperties as ObjectJSONSchema);
    return;
  }

  // Remove property
  const result = { ...baseProperties };
  delete (result as Record<string, unknown>)[property];
  emit("change", result as ObjectJSONSchema);
};

const handleAddEnumValue = () => {
  if (!enumValue.value.trim()) return;
  const numValue = Number(enumValue.value);
  if (Number.isNaN(numValue)) return;
  const validValue = props.integer ? Math.floor(numValue) : numValue;
  if (!enumValues.value.includes(validValue)) {
    handleValidationChange("enum", [...enumValues.value, validValue]);
  }
  enumValue.value = "";
};

const handleRemoveEnumValue = (index: number) => {
  const newEnumValues = [...enumValues.value];
  newEnumValues.splice(index, 1);
  handleValidationChange(
    "enum",
    newEnumValues.length === 0 ? undefined : newEnumValues,
  );
};

const minMaxError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "minMax",
    )?.message,
);
const redundantMinError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "redundantMinimum",
    )?.message,
);
const redundantMaxError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "redundantMaximum",
    )?.message,
);
const enumError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "enum",
    )?.message,
);
const multipleOfError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "multipleOf",
    )?.message,
);

const hasConstraint = computed(
  () =>
    !!minimum.value ||
    !!maximum.value ||
    !!exclusiveMinimum.value ||
    !!exclusiveMaximum.value ||
    !!multipleOf.value ||
    enumValues.value.length > 0,
);

const minimumValue = computed(() => minimum.value ?? null);
const maximumValue = computed(() => maximum.value ?? null);
const exclusiveMinimumValue = computed(() => exclusiveMinimum.value ?? null);
const exclusiveMaximumValue = computed(() => exclusiveMaximum.value ?? null);
const multipleOfValue = computed(() => multipleOf.value ?? null);
</script>

<template>
  <div class="space-y-4">
    <p v-if="readOnly && !hasConstraint" class="text-sm italic" style="color: var(--p-text-muted-color);">
      {{ t.numberNoConstraint }}
    </p>

    <div v-if="!readOnly || hasConstraint" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-0 md:col-span-2">
        <div v-if="!!minMaxError" class="text-xs text-red-500 italic">{{ minMaxError }}</div>
        <div v-if="!!redundantMinError" class="text-xs text-red-500 italic">{{ redundantMinError }}</div>
        <div v-if="!!redundantMaxError" class="text-xs text-red-500 italic">{{ redundantMaxError }}</div>
        <div v-if="!!enumError" class="text-xs text-red-500 italic">{{ enumError }}</div>
      </div>

      <div v-if="!readOnly || !!minimum" class="flex flex-col gap-2">
        <label :for="minimumId" :class="['text-sm font-medium', minimum !== undefined && (!!minMaxError || !!redundantMinError) && 'text-red-500']">
          {{ t.numberMinimumLabel }}
        </label>
        <InputNumber
          :inputId="minimumId"
          :modelValue="minimumValue"
          @update:modelValue="(v: number | null) => handleValidationChange('minimum', v ?? undefined)"
          :placeholder="t.numberMinimumPlaceholder"
          :step="integer ? 1 : undefined"
          :invalid="minimum !== undefined && (!!minMaxError || !!redundantMinError)"
          :disabled="readOnly"
          fluid
          size="small"
          showButtons
        />
      </div>

      <div v-if="!readOnly || !!maximum" class="flex flex-col gap-2">
        <label :for="maximumId" :class="['text-sm font-medium', maximum !== undefined && (!!minMaxError || !!redundantMaxError) && 'text-red-500']">
          {{ t.numberMaximumLabel }}
        </label>
        <InputNumber
          :inputId="maximumId"
          :modelValue="maximumValue"
          @update:modelValue="(v: number | null) => handleValidationChange('maximum', v ?? undefined)"
          :placeholder="t.numberMaximumPlaceholder"
          :step="integer ? 1 : undefined"
          :invalid="maximum !== undefined && (!!minMaxError || !!redundantMaxError)"
          :disabled="readOnly"
          fluid
          size="small"
          showButtons
        />
      </div>
    </div>

    <div v-if="!readOnly || !!exclusiveMaximum || !!exclusiveMinimum" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-if="!readOnly || !!exclusiveMinimum" class="flex flex-col gap-2">
        <label :for="exclusiveMinimumId" class="text-sm font-medium">{{ t.numberExclusiveMinimumLabel }}</label>
        <InputNumber
          :inputId="exclusiveMinimumId"
          :modelValue="exclusiveMinimumValue"
          @update:modelValue="(v: number | null) => handleValidationChange('exclusiveMinimum', v ?? undefined)"
          :placeholder="t.numberExclusiveMinimumPlaceholder"
          :step="integer ? 1 : undefined"
          :disabled="readOnly"
          fluid
          size="small"
          showButtons
        />
      </div>
      <div v-if="!readOnly || !!exclusiveMaximum" class="flex flex-col gap-2">
        <label :for="exclusiveMaximumId" class="text-sm font-medium">{{ t.numberExclusiveMaximumLabel }}</label>
        <InputNumber
          :inputId="exclusiveMaximumId"
          :modelValue="exclusiveMaximumValue"
          @update:modelValue="(v: number | null) => handleValidationChange('exclusiveMaximum', v ?? undefined)"
          :placeholder="t.numberExclusiveMaximumPlaceholder"
          :step="integer ? 1 : undefined"
          :disabled="readOnly"
          fluid
          size="small"
          showButtons
        />
      </div>
    </div>

    <div v-if="!readOnly || !!multipleOf" class="flex flex-col gap-2">
      <label :for="multipleOfId" :class="['text-sm font-medium', !!multipleOfError && 'text-red-500']">{{ t.numberMultipleOfLabel }}</label>
      <InputNumber
        :inputId="multipleOfId"
        :modelValue="multipleOfValue"
        @update:modelValue="(v: number | null) => handleValidationChange('multipleOf', v ?? undefined)"
        :placeholder="t.numberMultipleOfPlaceholder"
        :min="0"
        :step="integer ? 1 : undefined"
        :invalid="!!multipleOfError"
        :disabled="readOnly"
        fluid
        size="small"
        showButtons
      />
      <div v-if="!!multipleOfError" class="text-xs text-red-500 italic whitespace-pre-line">{{ multipleOfError }}</div>
    </div>

    <div v-if="!readOnly || enumValues.length > 0" class="space-y-2 pt-2 border-t" style="border-color: var(--p-content-border-color);">
      <label :class="['text-sm font-medium', !!enumError && 'text-red-500']">{{ t.numberAllowedValuesEnumLabel }}</label>
      <div class="flex flex-wrap gap-2 mb-4">
        <template v-if="enumValues.length > 0">
          <Chip
            v-for="(value, index) in enumValues"
            :key="`enum-number-${value}`"
            :label="String(value)"
            removable
            @remove="handleRemoveEnumValue(index)"
          />
        </template>
        <p v-else class="text-xs italic" style="color: var(--p-text-muted-color);">{{ t.numberAllowedValuesEnumNone }}</p>
      </div>
      <div class="flex items-center gap-2">
        <InputNumber
          :modelValue="enumValue ? Number(enumValue) : null"
          @update:modelValue="(v: number | null) => { enumValue = v !== null ? String(v) : ''; }"
          :placeholder="t.numberAllowedValuesEnumAddPlaceholder"
          :step="integer ? 1 : undefined"
          fluid
          size="small"
          showButtons
          @keydown="($event as KeyboardEvent).key === 'Enter' && handleAddEnumValue()"
        />
        <Button type="button" @click="handleAddEnumValue()" size="small" severity="secondary">
          {{ t.numberAllowedValuesEnumAddLabel }}
        </Button>
      </div>
    </div>
  </div>
</template>
