<script setup lang="ts">
import { computed } from "vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import { useSchemaStore } from "../../hooks/useSchemaStore.ts";
import { getSchemaProperties } from "../../lib/schemaEditor.ts";
import type { ObjectJSONSchema } from "../../types/jsonSchema.ts";
import { buildValidationTree } from "../../types/validation.ts";
import SchemaPropertyEditor from "./SchemaPropertyEditor.vue";

const props = withDefaults(
  defineProps<{
    path: string[];
    readOnly?: boolean;
  }>(),
  { readOnly: false },
);

const store = useSchemaStore();
const t = useTranslation();

const parentSchema = computed(() => {
  if (props.path.length === 0) return store.schema.value;
  return store.getAtPath(props.path) ?? { type: "object", properties: {} };
});

const properties = computed(() => getSchemaProperties(parentSchema.value));

const validationTree = computed(() => buildValidationTree(parentSchema.value, t));
</script>

<template>
  <div class="space-y-2 animate-in">
    <SchemaPropertyEditor
      v-for="property in properties"
      :key="property.name"
      :path="path"
      :name="property.name"
      :schema="property.schema"
      :required="property.required"
      :validation-node="validationTree.children[property.name] ?? undefined"
      :read-only="readOnly"
    />
  </div>
</template>
