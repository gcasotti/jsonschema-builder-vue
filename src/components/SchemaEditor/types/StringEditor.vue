<script setup lang="ts">
import Chip from "primevue/chip";
import InputNumber from "primevue/inputnumber";
import { computed, ref, useId } from "vue";
import Button from "../../../components/ui/Button.vue";
import InputField from "../../../components/ui/InputField.vue";
import Select from "../../../components/ui/Select.vue";
import { useTranslation } from "../../../hooks/use-translation.ts";
import type { ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import {
  isBooleanSchema,
  withObjectSchema,
} from "../../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../../types/validation.ts";

type Property = "enum" | "minLength" | "maxLength" | "pattern" | "format";

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
const enumValue = ref("");
const minLengthId = useId();
const maxLengthId = useId();
const patternId = useId();
const formatId = useId();

const minLength = computed(() =>
  withObjectSchema(props.schema, (s) => s.minLength, undefined),
);
const maxLength = computed(() =>
  withObjectSchema(props.schema, (s) => s.maxLength, undefined),
);
const pattern = computed(() =>
  withObjectSchema(props.schema, (s) => s.pattern, undefined),
);
const format = computed(() =>
  withObjectSchema(props.schema, (s) => s.format, undefined),
);
const enumValues = computed(() =>
  withObjectSchema(props.schema, (s) => (s.enum as string[]) || [], []),
);

const handleValidationChange = (property: Property, value: unknown) => {
  const baseSchema = isBooleanSchema(props.schema)
    ? { type: "string" as const }
    : JSON.parse(JSON.stringify(props.schema));
  const { type: _, description: __, ...validationProps } = baseSchema;
  const updatedValidation: ObjectJSONSchema = {
    ...validationProps,
    type: "string",
    [property]: value,
  };
  emit("change", updatedValidation);
};

const handleAddEnumValue = () => {
  if (!enumValue.value.trim()) return;
  if (!enumValues.value.includes(enumValue.value)) {
    handleValidationChange("enum", [...enumValues.value, enumValue.value]);
  }
  enumValue.value = "";
};

const handleRemoveEnumValue = (index: number) => {
  const newEnumValues = [...enumValues.value];
  newEnumValues.splice(index, 1);
  if (newEnumValues.length === 0) {
    const baseSchema = isBooleanSchema(props.schema)
      ? { type: "string" as const }
      : JSON.parse(JSON.stringify(props.schema));
    if (!isBooleanSchema(baseSchema) && "enum" in baseSchema) {
      const { enum: _, ...rest } = baseSchema;
      emit("change", rest as ObjectJSONSchema);
    } else {
      emit("change", baseSchema as ObjectJSONSchema);
    }
  } else {
    handleValidationChange("enum", newEnumValues);
  }
};

const minMaxError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "length",
    )?.message,
);
const minLengthError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "minLength",
    )?.message,
);
const maxLengthError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "maxLength",
    )?.message,
);
const patternError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "pattern",
    )?.message,
);
const formatError = computed(
  () =>
    props.validationNode?.validation.errors?.find(
      (err) => err.path[0] === "format",
    )?.message,
);

const minLengthValue = computed(() => minLength.value ?? null);
const maxLengthValue = computed(() => maxLength.value ?? null);
const patternValue = computed(() => pattern.value ?? "");
const formatValue = computed(() => format.value || "none");

const formatOptions = computed(() => [
  { label: t.stringFormatNone, value: "none" },
  { label: t.stringFormatDateTime, value: "date-time" },
  { label: t.stringFormatDate, value: "date" },
  { label: t.stringFormatTime, value: "time" },
  { label: t.stringFormatEmail, value: "email" },
  { label: t.stringFormatUri, value: "uri" },
  { label: t.stringFormatUuid, value: "uuid" },
  { label: t.stringFormatHostname, value: "hostname" },
  { label: t.stringFormatIpv4, value: "ipv4" },
  { label: t.stringFormatIpv6, value: "ipv6" },
]);

const needsDetail = computed(
  () =>
    !props.readOnly ||
    minLengthValue.value !== null ||
    maxLengthValue.value !== null ||
    patternValue.value !== "" ||
    formatValue.value !== "none" ||
    enumValues.value.length > 0,
);
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      <p v-if="readOnly && !needsDetail" class="text-sm text-muted-foreground italic">
        {{ t.stringNoConstraint }}
      </p>

      <div v-if="!readOnly || minLengthValue !== null" class="flex flex-col gap-2">
        <label :for="minLengthId" :class="['text-sm font-medium', (!!minMaxError || !!minLengthError) && 'text-red-500']">
          {{ t.stringMinimumLengthLabel }}
        </label>
        <InputNumber
          :inputId="minLengthId"
          :modelValue="minLengthValue"
          @update:modelValue="(v: number | null) => handleValidationChange('minLength', v ?? undefined)"
          :placeholder="t.stringMinimumLengthPlaceholder"
          :min="0"
          :disabled="readOnly"
          :invalid="!!minMaxError || !!minLengthError"
          fluid
          size="small"
          showButtons
        />
      </div>

      <div v-if="!readOnly || maxLengthValue !== null" class="flex flex-col gap-2">
        <label :for="maxLengthId" :class="['text-sm font-medium', (!!minMaxError || !!maxLengthError) && 'text-red-500']">
          {{ t.stringMaximumLengthLabel }}
        </label>
        <InputNumber
          :inputId="maxLengthId"
          :modelValue="maxLengthValue"
          @update:modelValue="(v: number | null) => handleValidationChange('maxLength', v ?? undefined)"
          :placeholder="t.stringMaximumLengthPlaceholder"
          :min="0"
          :disabled="readOnly"
          :invalid="!!minMaxError || !!maxLengthError"
          fluid
          size="small"
          showButtons
        />
      </div>

      <div v-if="!!minMaxError || !!minLengthError || !!maxLengthError" class="text-xs text-red-500 italic md:col-span-2 whitespace-pre-line">
        {{ [minMaxError, minLengthError ?? maxLengthError].filter(Boolean).join("\n") }}
      </div>
    </div>

    <div v-if="!readOnly || patternValue !== ''" class="flex flex-col gap-2">
      <label :for="patternId" :class="['text-sm font-medium', !!patternError && 'text-red-500']">
        {{ t.stringPatternLabel }}
      </label>
      <InputField
        :id="patternId"
        type="text"
        :model-value="String(patternValue)"
        @update:model-value="(v: string) => handleValidationChange('pattern', v || undefined)"
        :placeholder="t.stringPatternPlaceholder"
        size="small"
      />
    </div>

    <div v-if="!readOnly || formatValue !== 'none'" class="flex flex-col gap-2">
      <label :for="formatId" :class="['text-sm font-medium', !!formatError && 'text-red-500']">
        {{ t.stringFormatLabel }}
      </label>
      <Select
        :id="formatId"
        :model-value="formatValue"
        @update:model-value="(v: string) => handleValidationChange('format', v === 'none' ? undefined : v)"
        :options="formatOptions"
      />
    </div>

    <div v-if="!readOnly || enumValues.length > 0" class="space-y-2 pt-2 border-t" style="border-color: var(--p-content-border-color);">
      <label class="text-sm font-medium">{{ t.stringAllowedValuesEnumLabel }}</label>

      <div class="flex flex-wrap gap-2 mb-4">
        <template v-if="enumValues.length > 0">
          <Chip
            v-for="value in enumValues"
            :key="`enum-string-${value}`"
            :label="String(value)"
            removable
            @remove="handleRemoveEnumValue(enumValues.indexOf(value))"
          />
        </template>
        <p v-else class="text-xs italic" style="color: var(--p-text-muted-color);">
          {{ t.stringAllowedValuesEnumNone }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <InputField
          type="text"
          v-model="enumValue"
          :placeholder="t.stringAllowedValuesEnumAddPlaceholder"
          class="flex-1"
          size="small"
          @keydown="$event.key === 'Enter' && handleAddEnumValue()"
        />
        <Button
          type="button"
          @click="handleAddEnumValue()"
          size="small"
          severity="secondary"
        >
          {{ t.stringAllowedValuesEnumAddLabel }}
        </Button>
      </div>
    </div>
  </div>
</template>
