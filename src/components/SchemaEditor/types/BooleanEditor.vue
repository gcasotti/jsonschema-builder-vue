<script setup lang="ts">
import { useId } from "vue";
import Label from "../../../components/ui/Label.vue";
import Switch from "../../../components/ui/Switch.vue";
import { useTranslation } from "../../../hooks/use-translation.ts";
import type { ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { withObjectSchema } from "../../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../../types/validation.ts";

const props = withDefaults(
  defineProps<{
    schema: import("../../../types/jsonSchema.ts").JSONSchema;
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
const allowTrueId = useId();
const allowFalseId = useId();

const enumValues = () =>
  withObjectSchema(props.schema, (s) => s.enum as boolean[] | undefined, null);

const hasRestrictions = () => Array.isArray(enumValues());
const allowsTrue = () => !hasRestrictions() || enumValues()?.includes(true) || false;
const allowsFalse = () => !hasRestrictions() || enumValues()?.includes(false) || false;

const handleAllowedChange = (value: boolean, allowed: boolean) => {
  let newEnum: boolean[] | undefined;

  if (allowed) {
    if (!hasRestrictions()) return;
    if (enumValues()?.includes(value)) return;
    newEnum = enumValues() ? [...(enumValues() as boolean[]), value] : [value];
    if (newEnum.includes(true) && newEnum.includes(false)) {
      newEnum = undefined;
    }
  } else {
    if (hasRestrictions() && !enumValues()?.includes(value)) return;
    newEnum = [!value];
  }

  const updatedValidation: ObjectJSONSchema = { type: "boolean" };
  if (newEnum) {
    updatedValidation.enum = newEnum;
  } else {
    emit("change", { type: "boolean" });
    return;
  }
  emit("change", updatedValidation);
};

const hasEnum = () => {
  const ev = enumValues();
  return ev && ev.length > 0;
};
</script>

<template>
  <div class="space-y-4">
    <p v-if="readOnly && !hasEnum()" class="text-sm text-muted-foreground italic">
      {{ t.booleanNoConstraint }}
    </p>
    <div v-if="!readOnly || !allowsTrue() || !allowsFalse()" class="space-y-2 pt-2">
      <template v-if="!readOnly || hasEnum()">
        <Label>{{ t.booleanAllowedValuesLabel }}</Label>
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <Switch :id="allowTrueId" :model-value="allowsTrue()" :disabled="readOnly"
              @update:model-value="(checked: boolean) => handleAllowedChange(true, checked)" />
            <Label :for="allowTrueId" class="cursor-pointer">{{ t.booleanAllowTrueLabel }}</Label>
          </div>
          <div class="flex items-center space-x-2">
            <Switch :id="allowFalseId" :model-value="allowsFalse()" :disabled="readOnly"
              @update:model-value="(checked: boolean) => handleAllowedChange(false, checked)" />
            <Label :for="allowFalseId" class="cursor-pointer">{{ t.booleanAllowFalseLabel }}</Label>
          </div>
        </div>
      </template>
      <p v-if="!allowsTrue() && !allowsFalse()" class="text-xs text-amber-600 mt-2">
        {{ t.booleanNeitherWarning }}
      </p>
    </div>
  </div>
</template>
