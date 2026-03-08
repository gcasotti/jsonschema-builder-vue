// biome-ignore format: template literal code snippets contain HTML that Biome cannot parse
// These are extracted from Index.vue to avoid Biome's Vue SFC parser choking on </script> in template literals

const S = "<" + "script setup lang=\"ts\">";
const ES = "<" + "/script>";

export const codeSnippets: Record<string, string> = {
  "editor-basic": `${S}
import { ref } from "vue"
import { JsonSchemaEditor } from "jsonschema-builder-vue"
import type { JSONSchema } from "jsonschema-builder-vue"

const schema = ref<JSONSchema>({
  type: "object",
  properties: {
    name: { type: "string", description: "Full name" },
    age: { type: "number", description: "Age in years" },
  },
})
${ES}

<template>
  <JsonSchemaEditor v-model:schema="schema" />
</template>`,

  "editor-visual": `${S}
import { ref } from "vue"
import { JsonSchemaEditor } from "jsonschema-builder-vue"
import type { JSONSchema } from "jsonschema-builder-vue"

const schema = ref<JSONSchema>({ type: "object", properties: {} })
${ES}

<template>
  <JsonSchemaEditor v-model:schema="schema" :show-json-editor="false" />
</template>`,

  "editor-readonly": `${S}
import { ref } from "vue"
import { JsonSchemaEditor } from "jsonschema-builder-vue"
import type { JSONSchema } from "jsonschema-builder-vue"

const schema = ref<JSONSchema>({
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    active: { type: "boolean" },
  },
})
${ES}

<template>
  <JsonSchemaEditor :schema="schema" :read-only="true" />
</template>`,

  "editor-nofs": `${S}
import { ref } from "vue"
import { JsonSchemaEditor } from "jsonschema-builder-vue"
import type { JSONSchema } from "jsonschema-builder-vue"

const schema = ref<JSONSchema>({ type: "object", properties: {} })
${ES}

<template>
  <JsonSchemaEditor v-model:schema="schema" :show-fullscreen="false" />
</template>`,

  "editor-sync": `${S}
import { computed, ref } from "vue"
import { JsonSchemaEditor } from "jsonschema-builder-vue"
import type { JSONSchema } from "jsonschema-builder-vue"

const schema = ref<JSONSchema>({ type: "object", properties: {} })
const schemaText = computed(() => JSON.stringify(schema.value, null, 2))
${ES}

<template>
  <div class="grid grid-cols-2 gap-4">
    <JsonSchemaEditor
      v-model:schema="schema"
      :show-json-editor="false"
      :show-fullscreen="false"
    />
    <textarea :value="schemaText" readonly class="font-mono text-xs p-4 border rounded" />
  </div>
</template>`,

  "infer-popup": `${S}
import { ref } from "vue"
import { SchemaInferencer, JsonSchemaEditor } from "jsonschema-builder-vue"
import type { JSONSchema } from "jsonschema-builder-vue"

const schema = ref<JSONSchema>({ type: "object", properties: {} })
const showDialog = ref(false)
${ES}

<template>
  <button @click="showDialog = true">Open Inferencer</button>

  <SchemaInferencer
    v-model:visible="showDialog"
    @schema-inferred="schema = $event"
  />

  <!-- Show the inferred schema -->
  <JsonSchemaEditor :schema="schema" :read-only="true" />
</template>`,

  "infer-inline": `${S}
import { ref } from "vue"
import { SchemaInferencer, JsonSchemaEditor } from "jsonschema-builder-vue"
import type { JSONSchema } from "jsonschema-builder-vue"

const schema = ref<JSONSchema>({ type: "object", properties: {} })
${ES}

<template>
  <div class="grid grid-cols-2 gap-4">
    <!-- Omit :visible to render inline -->
    <SchemaInferencer @schema-inferred="schema = $event" />

    <!-- Resulting schema -->
    <JsonSchemaEditor
      v-model:schema="schema"
      :show-json-editor="false"
      :show-fullscreen="false"
    />
  </div>
</template>`,

  "infer-util": `${S}
import { ref } from "vue"
import { createSchemaFromJson } from "jsonschema-builder-vue"

const input = ref('{ "name": "Alice", "age": 25, "active": true }')
const output = ref("")

function run() {
  const obj = JSON.parse(input.value)
  const schema = createSchemaFromJson(obj)
  output.value = JSON.stringify(schema, null, 2)
}
${ES}

<template>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <textarea v-model="input" class="w-full h-36 font-mono text-xs p-3 border rounded" />
      <button @click="run">Run</button>
    </div>
    <pre class="h-36 overflow-auto font-mono text-xs p-3 border rounded">{{ output || "Press Run" }}</pre>
  </div>
</template>`,

  "validator-popup": `${S}
import { ref } from "vue"
import { JsonValidator } from "jsonschema-builder-vue"
import type { JSONSchema } from "jsonschema-builder-vue"

const schema = ref<JSONSchema>({
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
})

const showDialog = ref(false)
${ES}

<template>
  <button @click="showDialog = true">Open Validator</button>
  <JsonValidator v-model:visible="showDialog" :schema="schema" />
</template>`,

  "validator-inline": `${S}
import { ref } from "vue"
import { JsonValidator } from "jsonschema-builder-vue"
import type { JSONSchema } from "jsonschema-builder-vue"

const schema = ref<JSONSchema>({
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
})
${ES}

<template>
  <!-- Omit :visible to render inline -->
  <JsonValidator :schema="schema" />
</template>`,

  "validator-util": `${S}
import { ref } from "vue"
import { validateJson } from "jsonschema-builder-vue"
import type { JSONSchema } from "jsonschema-builder-vue"

const schema: JSONSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
}

const input = ref('{ "name": "Bob", "age": "not a number" }')
const output = ref("")

function run() {
  const result = validateJson(input.value, schema)
  output.value = result.valid
    ? "✓ Valid"
    : result.errors?.map((e) => \`✗ \${e.path}: \${e.message}\`).join("\\n") ?? ""
}
${ES}

<template>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <textarea v-model="input" class="w-full h-36 font-mono text-xs p-3 border rounded" />
      <button @click="run">Validate</button>
    </div>
    <pre class="h-36 overflow-auto font-mono text-xs p-3 border rounded whitespace-pre-wrap">{{ output || "Press Validate" }}</pre>
  </div>
</template>`,

  i18n: `${S}
import { ref } from "vue"
import { JsonSchemaEditor, provideTranslation } from "jsonschema-builder-vue"
import type { JSONSchema, Translation } from "jsonschema-builder-vue"
import { en } from "jsonschema-builder-vue/i18n/locales/en"

const schema = ref<JSONSchema>({ type: "object", properties: {} })

// Create a reactive translation ref and provide it
const translation = ref<Translation>(en)
provideTranslation(translation)

// Switch language dynamically
async function switchLanguage(lang: string) {
  const module = await import(\`jsonschema-builder-vue/i18n/locales/\${lang}\`)
  translation.value = module[lang]
}
${ES}

<template>
  <div class="flex gap-2 mb-4">
    <button @click="switchLanguage('en')">English</button>
    <button @click="switchLanguage('de')">Deutsch</button>
    <button @click="switchLanguage('fr')">Français</button>
    <button @click="switchLanguage('it')">Italiano</button>
  </div>

  <JsonSchemaEditor v-model:schema="schema" />
</template>`,

  theming: `${S}
import { ref } from "vue"
import { JsonSchemaEditor, useTheme } from "jsonschema-builder-vue"
import type { JSONSchema } from "jsonschema-builder-vue"

const schema = ref<JSONSchema>({ type: "object", properties: {} })

const {
  currentPreset,
  darkMode,
  switchPreset,
  toggleDarkMode,
  presetNames,
} = useTheme()
${ES}

<template>
  <div class="flex gap-2 mb-4">
    <button
      v-for="name in presetNames"
      :key="name"
      @click="switchPreset(name)"
      :class="{ 'font-bold': currentPreset === name }"
    >
      {{ name }}
    </button>
  </div>

  <button @click="toggleDarkMode()">
    {{ darkMode ? '☀️ Light' : '🌙 Dark' }}
  </button>

  <JsonSchemaEditor v-model:schema="schema" />
</template>`,
};
