<script setup lang="ts">
import { useTranslation } from "../../hooks/use-translation.ts";
import type { JSONSchema, ObjectJSONSchema, SchemaType } from "../../types/jsonSchema.ts";
import { withObjectSchema } from "../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";

// ── Synchronous imports — NO defineAsyncComponent / Suspense ──
// Async components + Suspense caused re-resolution loops during type changes.
import StringEditor from "./types/StringEditor.vue";
import NumberEditor from "./types/NumberEditor.vue";
import BooleanEditor from "./types/BooleanEditor.vue";
import ObjectEditor from "./types/ObjectEditor.vue";
import ArrayEditor from "./types/ArrayEditor.vue";

const props = withDefaults(
  defineProps<{
    schema: JSONSchema;
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

const getType = () =>
  withObjectSchema(
    props.schema,
    (s) => (s.type || "object") as SchemaType,
    "string" as SchemaType,
  );
</script>

<template>
  <StringEditor
    v-if="getType() === 'string'"
    :schema="schema"
    :path="path"
    :read-only="readOnly"
    :validation-node="validationNode"
    :depth="depth"
    @change="emit('change', $event)"
  />
  <NumberEditor
    v-else-if="getType() === 'number'"
    :schema="schema"
    :path="path"
    :read-only="readOnly"
    :validation-node="validationNode"
    :depth="depth"
    @change="emit('change', $event)"
  />
  <NumberEditor
    v-else-if="getType() === 'integer'"
    :schema="schema"
    :path="path"
    :read-only="readOnly"
    :validation-node="validationNode"
    :depth="depth"
    :integer="true"
    @change="emit('change', $event)"
  />
  <BooleanEditor
    v-else-if="getType() === 'boolean'"
    :schema="schema"
    :path="path"
    :read-only="readOnly"
    :validation-node="validationNode"
    :depth="depth"
    @change="emit('change', $event)"
  />
  <ObjectEditor
    v-else-if="getType() === 'object'"
    :schema="schema"
    :path="path"
    :read-only="readOnly"
    :validation-node="validationNode"
    :depth="depth"
  />
  <ArrayEditor
    v-else-if="getType() === 'array'"
    :schema="schema"
    :path="path"
    :read-only="readOnly"
    :validation-node="validationNode"
    :depth="depth"
    @change="emit('change', $event)"
  />
</template>
