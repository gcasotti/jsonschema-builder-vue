<script setup lang="ts">
import { useTranslation } from "../../hooks/use-translation.ts";
import {
  createFieldSchema,
  renameObjectProperty,
  updateObjectProperty,
  updatePropertyRequired,
} from "../../lib/schemaEditor.ts";
import type { JSONSchema, NewField } from "../../types/jsonSchema.ts";
import { asObjectSchema, isBooleanSchema } from "../../types/jsonSchema.ts";
import AddFieldButton from "./AddFieldButton.vue";
import SchemaFieldList from "./SchemaFieldList.vue";

const props = withDefaults(
  defineProps<{
    schema: JSONSchema;
    readOnly?: boolean;
  }>(),
  { readOnly: false },
);

const emit = defineEmits<{
  change: [schema: JSONSchema];
}>();

const t = useTranslation();

const handleAddField = (newField: NewField) => {
  const fieldSchema = createFieldSchema(newField);
  let newSchema = updateObjectProperty(asObjectSchema(props.schema), newField.name, fieldSchema);
  if (newField.required) {
    newSchema = updatePropertyRequired(newSchema, newField.name, true);
  }
  emit("change", newSchema);
};

const handleEditField = (name: string, updatedField: NewField) => {
  const fieldSchema = createFieldSchema(updatedField);
  let newSchema = asObjectSchema(props.schema);

  if (name !== updatedField.name) {
    newSchema = renameObjectProperty(newSchema, name, updatedField.name);
    newSchema = updateObjectProperty(newSchema, updatedField.name, fieldSchema);
  } else {
    newSchema = updateObjectProperty(newSchema, name, fieldSchema);
  }

  newSchema = updatePropertyRequired(newSchema, updatedField.name, updatedField.required || false);
  emit("change", newSchema);
};

const handleDeleteField = (name: string) => {
  if (isBooleanSchema(props.schema) || !props.schema.properties) return;

  const { [name]: _, ...remainingProps } = props.schema.properties;
  const newSchema = { ...props.schema, properties: remainingProps };

  if (newSchema.required) {
    newSchema.required = newSchema.required.filter((field) => field !== name);
  }

  emit("change", newSchema);
};

const hasFields = () =>
  !isBooleanSchema(props.schema) &&
  props.schema.properties &&
  Object.keys(props.schema.properties).length > 0;
</script>

<template>
  <div class="p-4 h-full flex flex-col overflow-auto jsonjoy">
    <div v-if="!readOnly" class="mb-6 shrink-0">
      <AddFieldButton @add-field="handleAddField" />
    </div>

    <div class="grow overflow-auto">
      <div v-if="!hasFields()" class="text-center py-10 text-muted-foreground">
        <p class="mb-3">{{ t.visualEditorNoFieldsHint1 }}</p>
        <p class="text-sm">{{ t.visualEditorNoFieldsHint2 }}</p>
      </div>
      <SchemaFieldList
        v-else
        :schema="schema"
        :read-only="readOnly"
        @add-field="handleAddField"
        @edit-field="handleEditField"
        @delete-field="handleDeleteField"
      />
    </div>
  </div>
</template>
