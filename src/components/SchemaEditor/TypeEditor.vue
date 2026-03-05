<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { JSONSchema, ObjectJSONSchema, SchemaType } from "../../types/jsonSchema.ts";
import { withObjectSchema } from "../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";

const StringEditor = defineAsyncComponent(() => import("./types/StringEditor.vue"));
const NumberEditor = defineAsyncComponent(() => import("./types/NumberEditor.vue"));
const BooleanEditor = defineAsyncComponent(() => import("./types/BooleanEditor.vue"));
const ObjectEditor = defineAsyncComponent(() => import("./types/ObjectEditor.vue"));
const ArrayEditor = defineAsyncComponent(() => import("./types/ArrayEditor.vue"));

const props = withDefaults(
  defineProps<{
    schema: JSONSchema;
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

const getType = () =>
  withObjectSchema(
    props.schema,
    (s) => (s.type || "object") as SchemaType,
    "string" as SchemaType,
  );
</script>

<template>
  <Suspense>
    <template #fallback>
      <div>{{ t.schemaEditorLoading }}</div>
    </template>

    <StringEditor
      v-if="getType() === 'string'"
      :schema="schema"
      :read-only="readOnly"
      :validation-node="validationNode"
      :depth="depth"
      @change="emit('change', $event)"
    />
    <NumberEditor
      v-else-if="getType() === 'number'"
      :schema="schema"
      :read-only="readOnly"
      :validation-node="validationNode"
      :depth="depth"
      @change="emit('change', $event)"
    />
    <NumberEditor
      v-else-if="getType() === 'integer'"
      :schema="schema"
      :read-only="readOnly"
      :validation-node="validationNode"
      :depth="depth"
      :integer="true"
      @change="emit('change', $event)"
    />
    <BooleanEditor
      v-else-if="getType() === 'boolean'"
      :schema="schema"
      :read-only="readOnly"
      :validation-node="validationNode"
      :depth="depth"
      @change="emit('change', $event)"
    />
    <ObjectEditor
      v-else-if="getType() === 'object'"
      :schema="schema"
      :read-only="readOnly"
      :validation-node="validationNode"
      :depth="depth"
      @change="emit('change', $event)"
    />
    <ArrayEditor
      v-else-if="getType() === 'array'"
      :schema="schema"
      :read-only="readOnly"
      :validation-node="validationNode"
      :depth="depth"
      @change="emit('change', $event)"
    />
  </Suspense>
</template>
