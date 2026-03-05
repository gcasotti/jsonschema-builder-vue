<script setup lang="ts">
import { computed } from "vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import { getSchemaProperties } from "../../lib/schemaEditor.ts";
import type {
  JSONSchema as JSONSchemaType,
  NewField,
  ObjectJSONSchema,
  SchemaType,
} from "../../types/jsonSchema.ts";
import { buildValidationTree } from "../../types/validation.ts";
import SchemaPropertyEditor from "./SchemaPropertyEditor.vue";

const props = withDefaults(
  defineProps<{
    schema: JSONSchemaType;
    readOnly?: boolean;
  }>(),
  { readOnly: false },
);

const emit = defineEmits<{
  addField: [newField: NewField];
  editField: [name: string, updatedField: NewField];
  deleteField: [name: string];
}>();

const t = useTranslation();

const properties = computed(() => getSchemaProperties(props.schema));

const getValidSchemaType = (propSchema: JSONSchemaType): SchemaType => {
  if (typeof propSchema === "boolean") return "object";
  const type = propSchema.type;
  if (Array.isArray(type)) return type[0] || "object";
  return type || "object";
};

const handleNameChange = (oldName: string, newName: string) => {
  const property = properties.value.find((prop) => prop.name === oldName);
  if (!property) return;

  emit("editField", oldName, {
    name: newName,
    type: getValidSchemaType(property.schema),
    description:
      typeof property.schema === "boolean" ? "" : property.schema.description || "",
    required: property.required,
    validation:
      typeof property.schema === "boolean" ? { type: "object" } : property.schema,
  });
};

const handleRequiredChange = (name: string, required: boolean) => {
  const property = properties.value.find((prop) => prop.name === name);
  if (!property) return;

  emit("editField", name, {
    name,
    type: getValidSchemaType(property.schema),
    description:
      typeof property.schema === "boolean" ? "" : property.schema.description || "",
    required,
    validation:
      typeof property.schema === "boolean" ? { type: "object" } : property.schema,
  });
};

const handleSchemaChange = (name: string, updatedSchema: ObjectJSONSchema) => {
  const property = properties.value.find((prop) => prop.name === name);
  if (!property) return;

  const type = updatedSchema.type || "object";
  const validType = Array.isArray(type) ? type[0] || "object" : type;

  emit("editField", name, {
    name,
    type: validType,
    description: updatedSchema.description || "",
    required: property.required,
    validation: updatedSchema,
  });
};

const validationTree = computed(() => buildValidationTree(props.schema, t));
</script>

<template>
  <div class="space-y-2 animate-in">
    <SchemaPropertyEditor
      v-for="property in properties"
      :key="property.name"
      :name="property.name"
      :schema="property.schema"
      :required="property.required"
      :validation-node="validationTree.children[property.name] ?? undefined"
      :read-only="readOnly"
      @delete="emit('deleteField', property.name)"
      @name-change="(newName: string) => handleNameChange(property.name, newName)"
      @required-change="(required: boolean) => handleRequiredChange(property.name, required)"
      @schema-change="(schema: ObjectJSONSchema) => handleSchemaChange(property.name, schema)"
    />
  </div>
</template>
