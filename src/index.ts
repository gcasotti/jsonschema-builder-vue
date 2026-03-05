// Vue components
export { default as JsonSchemaEditor } from "./components/SchemaEditor/JsonSchemaEditor.vue";
export { default as JsonSchemaVisualizer } from "./components/SchemaEditor/JsonSchemaVisualizer.vue";
export { default as SchemaVisualEditor } from "./components/SchemaEditor/SchemaVisualEditor.vue";
export { default as JsonValidator } from "./components/features/JsonValidator.vue";
export { default as SchemaInferencer } from "./components/features/SchemaInferencer.vue";

// Composables
export { useTranslation, provideTranslation, TranslationKey } from "./i18n/translation-context.ts";
export { useMonacoTheme } from "./hooks/use-monaco-theme.ts";

// Types
export type { JSONSchema, ObjectJSONSchema, SchemaType, NewField } from "./types/jsonSchema.ts";
export type { Translation } from "./i18n/translation-keys.ts";

// i18n
export { en } from "./i18n/locales/en.ts";

// Utilities
export { createSchemaFromJson, inferSchema } from "./lib/schema-inference.ts";
export { validateJson } from "./utils/jsonValidator.ts";
