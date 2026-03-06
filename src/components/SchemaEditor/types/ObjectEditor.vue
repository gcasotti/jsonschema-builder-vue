<script setup lang="ts">
import { computed } from "vue";
import { useTranslation } from "../../../hooks/use-translation.ts";
import { useSchemaStore } from "../../../hooks/useSchemaStore.ts";
import { getSchemaProperties } from "../../../lib/schemaEditor.ts";
import type { NewField, ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { isBooleanSchema, isObjectSchema } from "../../../types/jsonSchema.ts";
import ButtonToggle from "../../ui/ButtonToggle.vue";
import AddFieldButton from "../AddFieldButton.vue";
import SchemaPropertyEditor from "../SchemaPropertyEditor.vue";
import type { ValidationTreeNode } from "../../../types/validation.ts";

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

const store = useSchemaStore();
const t = useTranslation();

const properties = computed(() => getSchemaProperties(props.schema));

const isAdditionalPropertiesForbidden = computed(() => {
  if (isBooleanSchema(props.schema)) return false;
  return props.schema.additionalProperties === false;
});

const handleAdditionalPropertiesToggle = () => {
  // Read the current schema at this path from the store and toggle additionalProperties
  const current = store.getAtPath(props.path);
  if (!current || isBooleanSchema(current)) return;

  const plain = JSON.parse(JSON.stringify(current));
  if (plain.additionalProperties !== false) {
    plain.additionalProperties = false;
  } else {
    delete plain.additionalProperties;
  }

  // Update the parent with the modified object schema
  // path = [...parentPath, thisPropertyName], so we update the parent
  if (props.path.length > 0) {
    const parentPath = props.path.slice(0, -1);
    const propertyName = props.path[props.path.length - 1];
    store.updateProperty(parentPath, propertyName, plain);
  } else {
    // Root level — replace the whole schema
    store.replaceSchema(plain);
  }
};
</script>

<template>
  <div class="space-y-4">
    <div v-if="properties.length > 0" class="space-y-2">
      <SchemaPropertyEditor
        v-for="property in properties"
        :key="property.name"
        :read-only="readOnly"
        :path="path"
        :name="property.name"
        :schema="property.schema"
        :required="property.required"
        :validation-node="validationNode?.children[property.name]"
        :depth="depth"
      />
    </div>
    <div v-else class="text-sm text-muted-foreground italic p-2 text-center border rounded-md">
      {{ t.objectPropertiesNone }}
    </div>

    <div v-if="!readOnly" class="mt-4 flex flex-row gap-x-4">
      <AddFieldButton :path="path" variant="secondary" />
      <ButtonToggle
        @click="handleAdditionalPropertiesToggle()"
        :class="
          isAdditionalPropertiesForbidden
            ? 'bg-amber-50 text-amber-600'
            : 'bg-lime-50 text-lime-600'
        "
      >
        {{ isAdditionalPropertiesForbidden ? t.additionalPropertiesForbid : t.additionalPropertiesAllow }}
      </ButtonToggle>
    </div>
  </div>
</template>
