// Styles
import "./index.css";

// Vue components

export { default as JsonValidator } from "./components/features/JsonValidator.vue";
export { default as SchemaInferencer } from "./components/features/SchemaInferencer.vue";
export { default as JsonSchemaEditor } from "./components/SchemaEditor/JsonSchemaEditor.vue";
export { default as JsonSchemaVisualizer } from "./components/SchemaEditor/JsonSchemaVisualizer.vue";
export { default as SchemaVisualEditor } from "./components/SchemaEditor/SchemaVisualEditor.vue";
export { useMonacoTheme } from "./hooks/use-monaco-theme.ts";
// i18n
export { de } from "./i18n/locales/de.ts";
export { en } from "./i18n/locales/en.ts";
export { es } from "./i18n/locales/es.ts";
export { fr } from "./i18n/locales/fr.ts";
export { it } from "./i18n/locales/it.ts";
export { pl } from "./i18n/locales/pl.ts";
export { ru } from "./i18n/locales/ru.ts";
export { uk } from "./i18n/locales/uk.ts";
export { zh } from "./i18n/locales/zh.ts";
// Composables
export {
  provideTranslation,
  TranslationKey,
  useTranslation,
} from "./i18n/translation-context.ts";
export type { Translation } from "./i18n/translation-keys.ts";
// Utilities
export { createSchemaFromJson, inferSchema } from "./lib/schema-inference.ts";
// Themes
export {
  auraPreset,
  laraPreset,
  materialPreset,
  noraPreset,
  type PresetName,
  presets,
  useTheme,
} from "./themes/index.ts";
// Types
export type {
  JSONSchema,
  NewField,
  ObjectJSONSchema,
  SchemaType,
} from "./types/jsonSchema.ts";
export { validateJson } from "./utils/jsonValidator.ts";
