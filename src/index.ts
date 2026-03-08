// Vue components

export { default as JsonValidator } from "./components/features/JsonValidator.vue";
export { default as SchemaInferencer } from "./components/features/SchemaInferencer.vue";
export { default as JsonSchemaEditor } from "./components/SchemaEditor/JsonSchemaEditor.vue";
export { default as JsonSchemaVisualizer } from "./components/SchemaEditor/JsonSchemaVisualizer.vue";
export { default as SchemaVisualEditor } from "./components/SchemaEditor/SchemaVisualEditor.vue";
export { useMonacoTheme } from "./hooks/use-monaco-theme.ts";
// Themes
export {
  type PresetName,
  auraPreset,
  laraPreset,
  materialPreset,
  noraPreset,
  presets,
  useTheme,
} from "./themes/index.ts";
// i18n
export { en } from "./i18n/locales/en.ts";
// Composables
export {
  provideTranslation,
  TranslationKey,
  useTranslation,
} from "./i18n/translation-context.ts";
export type { Translation } from "./i18n/translation-keys.ts";
// Utilities
export { createSchemaFromJson, inferSchema } from "./lib/schema-inference.ts";
// Types
export type {
  JSONSchema,
  NewField,
  ObjectJSONSchema,
  SchemaType,
} from "./types/jsonSchema.ts";
export { validateJson } from "./utils/jsonValidator.ts";
