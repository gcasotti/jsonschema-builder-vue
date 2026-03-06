<script setup lang="ts">
import { X } from "lucide-vue-next";
import { ref, computed, useId } from "vue";
import InputField from "../../../components/ui/InputField.vue";
import Label from "../../../components/ui/Label.vue";
import Select from "../../../components/ui/Select.vue";
import { useTranslation } from "../../../hooks/use-translation.ts";
import { cn } from "../../../lib/utils.ts";
import type { ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { isBooleanSchema, withObjectSchema } from "../../../types/jsonSchema.ts";
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

const minLength = computed(() => withObjectSchema(props.schema, (s) => s.minLength, undefined));
const maxLength = computed(() => withObjectSchema(props.schema, (s) => s.maxLength, undefined));
const pattern = computed(() => withObjectSchema(props.schema, (s) => s.pattern, undefined));
const format = computed(() => withObjectSchema(props.schema, (s) => s.format, undefined));
const enumValues = computed(() => withObjectSchema(props.schema, (s) => (s.enum as string[]) || [], []));

const handleValidationChange = (property: Property, value: unknown) => {
  const baseSchema = isBooleanSchema(props.schema) ? { type: "string" as const } : JSON.parse(JSON.stringify(props.schema));
  const { type: _, description: __, ...validationProps } = baseSchema;
  const updatedValidation: ObjectJSONSchema = { ...validationProps, type: "string", [property]: value };
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
    const baseSchema = isBooleanSchema(props.schema) ? { type: "string" as const } : JSON.parse(JSON.stringify(props.schema));
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

const minMaxError = computed(() =>
  props.validationNode?.validation.errors?.find((err) => err.path[0] === "length")?.message,
);
const minLengthError = computed(() =>
  props.validationNode?.validation.errors?.find((err) => err.path[0] === "minLength")?.message,
);
const maxLengthError = computed(() =>
  props.validationNode?.validation.errors?.find((err) => err.path[0] === "maxLength")?.message,
);
const patternError = computed(() =>
  props.validationNode?.validation.errors?.find((err) => err.path[0] === "pattern")?.message,
);
const formatError = computed(() =>
  props.validationNode?.validation.errors?.find((err) => err.path[0] === "format")?.message,
);

const minLengthValue = computed(() => minLength.value ?? "");
const maxLengthValue = computed(() => maxLength.value ?? "");
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

const needsDetail = computed(() =>
  !props.readOnly ||
  minLengthValue.value !== "" ||
  maxLengthValue.value !== "" ||
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

      <div v-if="!readOnly || minLengthValue !== ''" class="space-y-2">
        <Label :for="minLengthId" :class="(!!minMaxError || !!minLengthError) && 'text-destructive'">
          {{ t.stringMinimumLengthLabel }}
        </Label>
        <InputField
          :id="minLengthId"
          type="number"
          :min="0"
          :model-value="String(minLengthValue)"
          :disabled="readOnly"
          @update:model-value="(v: string) => handleValidationChange('minLength', v ? Number(v) : undefined)"
          :placeholder="t.stringMinimumLengthPlaceholder"
          :class="cn('h-8', (!!minMaxError || !!minLengthError) && 'border-destructive')"
        />
      </div>

      <div v-if="!readOnly || maxLengthValue !== ''" class="space-y-2">
        <Label :for="maxLengthId" :class="(!!minMaxError || !!maxLengthError) && 'text-destructive'">
          {{ t.stringMaximumLengthLabel }}
        </Label>
        <InputField
          :id="maxLengthId"
          type="number"
          :min="0"
          :disabled="readOnly"
          :model-value="String(maxLengthValue)"
          @update:model-value="(v: string) => handleValidationChange('maxLength', v ? Number(v) : undefined)"
          :placeholder="t.stringMaximumLengthPlaceholder"
          :class="cn('h-8', (!!minMaxError || !!maxLengthError) && 'border-destructive')"
        />
      </div>

      <div v-if="!!minMaxError || !!minLengthError || !!maxLengthError" class="text-xs text-destructive italic md:col-span-2 whitespace-pre-line">
        {{ [minMaxError, minLengthError ?? maxLengthError].filter(Boolean).join("\n") }}
      </div>
    </div>

    <div v-if="!readOnly || patternValue !== ''" class="space-y-2">
      <Label :for="patternId" :class="!!patternError && 'text-destructive'">
        {{ t.stringPatternLabel }}
      </Label>
      <InputField
        :id="patternId"
        type="text"
        :model-value="String(patternValue)"
        @update:model-value="(v: string) => handleValidationChange('pattern', v || undefined)"
        :placeholder="t.stringPatternPlaceholder"
        class="h-8"
      />
    </div>

    <div v-if="!readOnly || formatValue !== 'none'" class="space-y-2">
      <Label :for="formatId" :class="!!formatError && 'text-destructive'">
        {{ t.stringFormatLabel }}
      </Label>
      <Select
        :id="formatId"
        :model-value="formatValue"
        @update:model-value="(v: string) => handleValidationChange('format', v === 'none' ? undefined : v)"
        :options="formatOptions"
        class="h-8"
      />
    </div>

    <div v-if="!readOnly || enumValues.length > 0" class="space-y-2 pt-2 border-t border-border/40">
      <Label>{{ t.stringAllowedValuesEnumLabel }}</Label>

      <div class="flex flex-wrap gap-2 mb-4">
        <template v-if="enumValues.length > 0">
          <div
            v-for="value in enumValues"
            :key="`enum-string-${value}`"
            class="flex items-center bg-muted/40 border rounded-md px-2 py-1 text-xs"
          >
            <span class="mr-1">{{ value }}</span>
            <button
              type="button"
              @click="handleRemoveEnumValue(enumValues.indexOf(value))"
              class="text-muted-foreground hover:text-destructive"
            >
              <X :size="12" />
            </button>
          </div>
        </template>
        <p v-else class="text-xs text-muted-foreground italic">
          {{ t.stringAllowedValuesEnumNone }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <InputField
          type="text"
          v-model="enumValue"
          :placeholder="t.stringAllowedValuesEnumAddPlaceholder"
          class="h-8 text-xs flex-1"
          @keydown="$event.key === 'Enter' && handleAddEnumValue()"
        />
        <button
          type="button"
          @click="handleAddEnumValue()"
          class="px-3 py-1 h-8 rounded-md bg-secondary text-xs font-medium hover:bg-secondary/80"
        >
          {{ t.stringAllowedValuesEnumAddLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
