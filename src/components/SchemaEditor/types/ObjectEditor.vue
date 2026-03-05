<script setup lang="ts">
import { useTranslation } from "../../../hooks/use-translation.ts";
import { getSchemaProperties, removeObjectProperty, updateObjectProperty, updatePropertyRequired } from "../../../lib/schemaEditor.ts";
import type { NewField, ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { asObjectSchema, isBooleanSchema } from "../../../types/jsonSchema.ts";
import ButtonToggle from "../../ui/ButtonToggle.vue";
import AddFieldButton from "../AddFieldButton.vue";
import SchemaPropertyEditor from "../SchemaPropertyEditor.vue";
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

const getProperties = () => getSchemaProperties(props.schema);

const getNormalizedSchema = (): ObjectJSONSchema =>
  isBooleanSchema(props.schema)
    ? { type: "object", properties: {} }
    : { ...props.schema, type: "object", properties: props.schema.properties || {} };

const handleAddProperty = (newField: NewField) => {
  const { type, description, validation, additionalProperties } = newField;
  const fieldSchema = {
    type,
    description: description || undefined,
    ...(validation || {}),
    ...(additionalProperties === false ? { additionalProperties } : {}),
  } as ObjectJSONSchema;

  let newSchema = updateObjectProperty(getNormalizedSchema(), newField.name, fieldSchema);
  if (newField.required) {
    newSchema = updatePropertyRequired(newSchema, newField.name, true);
  }
  emit("change", newSchema);
};

const handleDeleteProperty = (propertyName: string) => {
  emit("change", removeObjectProperty(getNormalizedSchema(), propertyName));
};

const handlePropertyNameChange = (oldName: string, newName: string) => {
  if (oldName === newName) return;
  const property = getProperties().find((p) => p.name === oldName);
  if (!property) return;

  const propertySchemaObj = asObjectSchema(property.schema);
  let newSchema = updateObjectProperty(getNormalizedSchema(), newName, propertySchemaObj);
  if (property.required) {
    newSchema = updatePropertyRequired(newSchema, newName, true);
  }
  newSchema = removeObjectProperty(newSchema, oldName);
  emit("change", newSchema);
};

const handlePropertyRequiredChange = (propertyName: string, required: boolean) => {
  emit("change", updatePropertyRequired(getNormalizedSchema(), propertyName, required));
};

const handlePropertySchemaChange = (propertyName: string, propertySchema: ObjectJSONSchema) => {
  emit("change", updateObjectProperty(getNormalizedSchema(), propertyName, propertySchema));
};

const handleAdditionalPropertiesToggle = () => {
  const normalized = getNormalizedSchema();
  const { additionalProperties, ...restOfSchema } = normalized;
  const updatedSchema = asObjectSchema(restOfSchema);
  if (additionalProperties !== false) {
    updatedSchema.additionalProperties = false;
  }
  emit("change", updatedSchema);
};
</script>

<template>
  <div class="space-y-4">
    <div v-if="getProperties().length > 0" class="space-y-2">
      <SchemaPropertyEditor
        v-for="property in getProperties()"
        :key="property.name"
        :read-only="readOnly"
        :name="property.name"
        :schema="property.schema"
        :required="property.required"
        :validation-node="validationNode?.children[property.name]"
        :depth="depth"
        @delete="handleDeleteProperty(property.name)"
        @name-change="(newName: string) => handlePropertyNameChange(property.name, newName)"
        @required-change="(required: boolean) => handlePropertyRequiredChange(property.name, required)"
        @schema-change="(schema: ObjectJSONSchema) => handlePropertySchemaChange(property.name, schema)"
      />
    </div>
    <div v-else class="text-sm text-muted-foreground italic p-2 text-center border rounded-md">
      {{ t.objectPropertiesNone }}
    </div>

    <div v-if="!readOnly" class="mt-4 flex flex-row gap-x-4">
      <AddFieldButton @add-field="handleAddProperty" variant="secondary" />
      <ButtonToggle
        @click="handleAdditionalPropertiesToggle()"
        :class="
          getNormalizedSchema().additionalProperties === false
            ? 'bg-amber-50 text-amber-600'
            : 'bg-lime-50 text-lime-600'
        "
      >
        {{ getNormalizedSchema().additionalProperties === false ? t.additionalPropertiesForbid : t.additionalPropertiesAllow }}
      </ButtonToggle>
    </div>
  </div>
</template>
