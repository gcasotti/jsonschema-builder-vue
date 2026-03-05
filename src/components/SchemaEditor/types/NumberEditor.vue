<script setup lang="ts">
import { X } from "lucide-vue-next";
import { ref, computed, useId } from "vue";
import InputField from "../../../components/ui/InputField.vue";
import Label from "../../../components/ui/Label.vue";
import { useTranslation } from "../../../hooks/use-translation.ts";
import { cn } from "../../../lib/utils.ts";
import type { ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { isBooleanSchema, withObjectSchema } from "../../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../../types/validation.ts";

type Property = "minimum" | "maximum" | "exclusiveMinimum" | "exclusiveMaximum" | "multipleOf" | "enum";

const props = withDefaults(
  defineProps<{
    schema: import("../../../types/jsonSchema.ts").JSONSchema;
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

const minimum = computed(() => withObjectSchema(props.schema, (s) => s.minimum, undefined));
const maximum = computed(() => withObjectSchema(props.schema, (s) => s.maximum, undefined));
const exclusiveMinimum = computed(() => withObjectSchema(props.schema, (s) => s.exclusiveMinimum, undefined));
const exclusiveMaximum = computed(() => withObjectSchema(props.schema, (s) => s.exclusiveMaximum, undefined));
const multipleOf = computed(() => withObjectSchema(props.schema, (s) => s.multipleOf, undefined));
const enumValues = computed(() => withObjectSchema(props.schema, (s) => (s.enum as number[]) || [], []));

const handleValidationChange = (property: Property, value: unknown) => {
  const baseProperties: Partial<ObjectJSONSchema> = {
    type: props.integer ? "integer" : "number",
  };

  if (!isBooleanSchema(props.schema)) {
    if (props.schema.minimum !== undefined) baseProperties.minimum = props.schema.minimum;
    if (props.schema.maximum !== undefined) baseProperties.maximum = props.schema.maximum;
    if (props.schema.exclusiveMinimum !== undefined) baseProperties.exclusiveMinimum = props.schema.exclusiveMinimum;
    if (props.schema.exclusiveMaximum !== undefined) baseProperties.exclusiveMaximum = props.schema.exclusiveMaximum;
    if (props.schema.multipleOf !== undefined) baseProperties.multipleOf = props.schema.multipleOf;
    if (props.schema.enum !== undefined) baseProperties.enum = props.schema.enum;
  }

  if (value !== undefined) {
    const updatedProperties: Partial<ObjectJSONSchema> = { ...baseProperties };
    if (property === "minimum") updatedProperties.minimum = value as number;
    else if (property === "maximum") updatedProperties.maximum = value as number;
    else if (property === "exclusiveMinimum") updatedProperties.exclusiveMinimum = value as number;
    else if (property === "exclusiveMaximum") updatedProperties.exclusiveMaximum = value as number;
    else if (property === "multipleOf") updatedProperties.multipleOf = value as number;
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
  handleValidationChange("enum", newEnumValues.length === 0 ? undefined : newEnumValues);
};

const minMaxError = computed(() => props.validationNode?.validation.errors?.find((err) => err.path[0] === "minMax")?.message);
const redundantMinError = computed(() => props.validationNode?.validation.errors?.find((err) => err.path[0] === "redundantMinimum")?.message);
const redundantMaxError = computed(() => props.validationNode?.validation.errors?.find((err) => err.path[0] === "redundantMaximum")?.message);
const enumError = computed(() => props.validationNode?.validation.errors?.find((err) => err.path[0] === "enum")?.message);
const multipleOfError = computed(() => props.validationNode?.validation.errors?.find((err) => err.path[0] === "multipleOf")?.message);

const hasConstraint = computed(() =>
  !!minimum.value || !!maximum.value || !!exclusiveMinimum.value || !!exclusiveMaximum.value || !!multipleOf.value || enumValues.value.length > 0,
);
</script>

<template>
  <div class="space-y-4">
    <p v-if="readOnly && !hasConstraint" class="text-sm text-muted-foreground italic">
      {{ t.numberNoConstraint }}
    </p>

    <div v-if="!readOnly || hasConstraint" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-0 md:col-span-2">
        <div v-if="!!minMaxError" class="text-xs text-destructive italic">{{ minMaxError }}</div>
        <div v-if="!!redundantMinError" class="text-xs text-destructive italic">{{ redundantMinError }}</div>
        <div v-if="!!redundantMaxError" class="text-xs text-destructive italic">{{ redundantMaxError }}</div>
        <div v-if="!!enumError" class="text-xs text-destructive italic">{{ enumError }}</div>
      </div>

      <div v-if="!readOnly || !!minimum" class="space-y-2">
        <Label :for="minimumId" :class="minimum !== undefined && (!!minMaxError || !!redundantMinError) && 'text-destructive'">
          {{ t.numberMinimumLabel }}
        </Label>
        <InputField :id="minimumId" type="number" :model-value="minimum !== undefined ? String(minimum) : ''"
          @update:model-value="(v: string) => handleValidationChange('minimum', v ? Number(v) : undefined)"
          :placeholder="t.numberMinimumPlaceholder"
          :class="cn('h-8', minimum !== undefined && (!!minMaxError || !!redundantMinError) && 'border-destructive')"
          :step="integer ? 1 : 'any'" />
      </div>

      <div v-if="!readOnly || !!maximum" class="space-y-2">
        <Label :for="maximumId" :class="maximum !== undefined && (!!minMaxError || !!redundantMaxError) && 'text-destructive'">
          {{ t.numberMaximumLabel }}
        </Label>
        <InputField :id="maximumId" type="number" :model-value="maximum !== undefined ? String(maximum) : ''"
          @update:model-value="(v: string) => handleValidationChange('maximum', v ? Number(v) : undefined)"
          :placeholder="t.numberMaximumPlaceholder"
          :class="cn('h-8', maximum !== undefined && (!!minMaxError || !!redundantMaxError) && 'border-destructive')"
          :step="integer ? 1 : 'any'" />
      </div>
    </div>

    <div v-if="!readOnly || !!exclusiveMaximum || !!exclusiveMinimum" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-if="!readOnly || !!exclusiveMinimum" class="space-y-2">
        <Label :for="exclusiveMinimumId">{{ t.numberExclusiveMinimumLabel }}</Label>
        <InputField :id="exclusiveMinimumId" type="number" :model-value="exclusiveMinimum !== undefined ? String(exclusiveMinimum) : ''"
          @update:model-value="(v: string) => handleValidationChange('exclusiveMinimum', v ? Number(v) : undefined)"
          :placeholder="t.numberExclusiveMinimumPlaceholder" class="h-8" :step="integer ? 1 : 'any'" />
      </div>
      <div v-if="!readOnly || !!exclusiveMaximum" class="space-y-2">
        <Label :for="exclusiveMaximumId">{{ t.numberExclusiveMaximumLabel }}</Label>
        <InputField :id="exclusiveMaximumId" type="number" :model-value="exclusiveMaximum !== undefined ? String(exclusiveMaximum) : ''"
          @update:model-value="(v: string) => handleValidationChange('exclusiveMaximum', v ? Number(v) : undefined)"
          :placeholder="t.numberExclusiveMaximumPlaceholder" class="h-8" :step="integer ? 1 : 'any'" />
      </div>
    </div>

    <div v-if="!readOnly || !!multipleOf" class="space-y-2">
      <Label :for="multipleOfId" :class="!!multipleOfError && 'text-destructive'">{{ t.numberMultipleOfLabel }}</Label>
      <InputField :id="multipleOfId" type="number" :model-value="multipleOf !== undefined ? String(multipleOf) : ''"
        @update:model-value="(v: string) => handleValidationChange('multipleOf', v ? Number(v) : undefined)"
        :placeholder="t.numberMultipleOfPlaceholder" :class="cn('h-8', !!multipleOfError && 'border-destructive')"
        :min="0" :step="integer ? 1 : 'any'" />
      <div v-if="!!multipleOfError" class="text-xs text-destructive italic whitespace-pre-line">{{ multipleOfError }}</div>
    </div>

    <div v-if="!readOnly || enumValues.length > 0" class="space-y-2 pt-2 border-t border-border/40">
      <Label :class="!!enumError && 'text-destructive'">{{ t.numberAllowedValuesEnumLabel }}</Label>
      <div class="flex flex-wrap gap-2 mb-4">
        <template v-if="enumValues.length > 0">
          <div v-for="(value, index) in enumValues" :key="`enum-number-${value}`" class="flex items-center bg-muted/40 border rounded-md px-2 py-1 text-xs">
            <span class="mr-1">{{ value }}</span>
            <button type="button" @click="handleRemoveEnumValue(index)" class="text-muted-foreground hover:text-destructive">
              <X :size="12" />
            </button>
          </div>
        </template>
        <p v-else class="text-xs text-muted-foreground italic">{{ t.numberAllowedValuesEnumNone }}</p>
      </div>
      <div class="flex items-center gap-2">
        <InputField type="number" v-model="enumValue" :placeholder="t.numberAllowedValuesEnumAddPlaceholder" class="h-8 text-xs flex-1"
          @keydown="$event.key === 'Enter' && handleAddEnumValue()" :step="integer ? 1 : 'any'" />
        <button type="button" @click="handleAddEnumValue()" class="px-3 py-1 h-8 rounded-md bg-secondary text-xs font-medium hover:bg-secondary/80">
          {{ t.numberAllowedValuesEnumAddLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
