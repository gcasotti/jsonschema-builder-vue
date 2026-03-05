<script setup lang="ts">
import {
  CheckCircle,
  CirclePlus,
  Code,
  FileJson,
  GitBranch,
  Package,
  Pencil,
  PencilOff,
  RefreshCw,
  User,
} from "lucide-vue-next";
import { ref } from "vue";
import { exampleSchema } from "../utils/schemaExample.ts";
import JsonValidator from "../../src/components/features/JsonValidator.vue";
import SchemaInferencer from "../../src/components/features/SchemaInferencer.vue";
import JsonSchemaEditor from "../../src/components/SchemaEditor/JsonSchemaEditor.vue";
import Button from "../../src/components/ui/Button.vue";
import Select from "../../src/components/ui/Select.vue";
import { en } from "../../src/i18n/locales/en.ts";
import { provideTranslation } from "../../src/i18n/translation-context.ts";
import type { Translation } from "../../src/i18n/translation-keys.ts";
import type { JSONSchema } from "../../src/types/jsonSchema.ts";

const schema = ref<JSONSchema>(exampleSchema);
const readOnly = ref(false);
const inferDialogOpen = ref(false);
const validateDialogOpen = ref(false);
const language = ref("en");
const translation = ref<Translation>(en);

provideTranslation(translation.value);

const handleReset = () => (schema.value = exampleSchema);
const handleReadOnlyToggle = () => (readOnly.value = !readOnly.value);
const handleClear = () =>
  (schema.value = { type: "object", properties: {}, required: [] });

const languageOptions = [
  { label: "English", value: "en" },
  { label: "German", value: "de" },
  { label: "French", value: "fr" },
  { label: "Russian", value: "ru" },
  { label: "Ukrainian", value: "uk" },
  { label: "Spanish", value: "es" },
  { label: "Chinese", value: "zh" },
  { label: "Polish", value: "pl" },
];

const handleLanguageChange = (value: string) => {
  language.value = value;
  import(`../../src/i18n/locales/${value}.ts`).then((module) => {
    translation.value = module[value];
  });
};

const toolLinks = [
  {
    title: "Form Generation",
    links: [
      { url: "https://github.com/rjsf-team/react-jsonschema-form", name: "React JSON Schema Form", description: "Build forms from schemas" },
      { url: "https://jsonforms.io/", name: "JSON Forms", description: "Framework-agnostic form generation" },
    ],
  },
  {
    title: "Validation Libraries",
    links: [
      { url: "https://ajv.js.org/", name: "Ajv", description: "The fastest JSON Schema validator" },
      { url: "https://python-jsonschema.readthedocs.io/", name: "jsonschema", description: "Python validation library" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { url: "https://www.openapis.org/", name: "OpenAPI", description: "API docs with JSON Schema" },
      { url: "https://redocly.com/", name: "Redoc", description: "Interactive API documentation" },
    ],
  },
  {
    title: "IDE Support",
    links: [
      { url: "https://code.visualstudio.com/docs/languages/json", name: "VS Code", description: "Built-in schema validation" },
      { url: "https://www.jetbrains.com/help/idea/json.html", name: "JetBrains Idea", description: "Schema-aware completions" },
    ],
  },
  {
    title: "API Integration",
    links: [
      { url: "https://www.postman.com/", name: "Postman", description: "Test APIs with schema validation" },
      { url: "https://swagger.io/", name: "Swagger", description: "Design and document APIs" },
    ],
  },
  {
    title: "Data Processing",
    links: [
      { url: "https://github.com/json-schema-faker/json-schema-faker", name: "json-schema-faker", description: "Generate mock data" },
      { url: "https://quicktype.io/", name: "QuickType", description: "Generate code from schema" },
    ],
  },
];

const authorLinks = [
  { href: "https://github.com/gcasotti", text: "@gcasotti", icon: User },
  { href: "https://github.com/gcasotti/jsonjoy-builder-vue", text: "GitHub", icon: GitBranch, target: "_blank", rel: "nofollow noopener noreferrer" },
  { href: "https://www.npmjs.com/package/jsonjoy-builder-vue", text: "NPM", icon: Package, target: "_blank", rel: "nofollow noopener noreferrer" },
];
</script>

<template>
  <div class="min-h-screen bg-linear-to-b from-background to-background/95 relative overflow-hidden jsonjoy">
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 animate-float" aria-hidden="true" />
    <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50 animate-float" style="animation-delay: 1s" aria-hidden="true" />

    <div class="container mx-auto px-0 sm:px-2 md:px-6 lg:px-8 pt-16 pb-24 relative z-10">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="bg-primary/10 text-primary inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4">
            <FileJson :size="16" class="mr-1.5" />
            Easy Schema Builder
          </div>
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-in">
            Create JSON Schemas <span class="text-primary">Visually</span>
          </h1>
          <p class="text-xl text-muted-foreground max-w-2xl mx-auto animate-in">
            Design your data structure effortlessly without writing a single line of code. Perfect for APIs, forms, and data validation.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap justify-center gap-4 mb-8 animate-in">
          <div class="flex flex-nowrap gap-4">
            <Button variant="outline" @click="handleReset">
              <RefreshCw :size="16" class="mr-2" /> Reset to Example
            </Button>
            <Button variant="outline" @click="handleClear">
              <CirclePlus :size="16" class="mr-2" /> Start from Scratch
            </Button>
            <Button variant="outline" @click="inferDialogOpen = true">
              <Code :size="16" class="mr-2" /> Infer from JSON
            </Button>
            <Button variant="outline" @click="validateDialogOpen = true">
              <CheckCircle :size="16" class="mr-2" /> Validate JSON
            </Button>
            <Button variant="outline" @click="handleReadOnlyToggle">
              <PencilOff v-if="!readOnly" :size="16" class="mr-2" /> {{ !readOnly ? 'Read-Only' : '' }}
              <Pencil v-if="readOnly" :size="16" class="mr-2" /> {{ readOnly ? 'Writable' : '' }}
            </Button>
            <div>
              <Select
                :model-value="language"
                @update:model-value="handleLanguageChange"
                :options="languageOptions"
                placeholder="Language"
                class="h-10 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Schema Editor -->
      <div class="max-w-4xl mx-auto lg:max-w-none">
        <JsonSchemaEditor
          :schema="schema"
          :read-only="readOnly"
          @update:schema="schema = $event"
          class="shadow-lg animate-in border-border/50 backdrop-blur-xs"
        />
      </div>

      <!-- Schema inferencer -->
      <SchemaInferencer
        :visible="inferDialogOpen"
        @update:visible="inferDialogOpen = $event"
        @schema-inferred="schema = $event"
      />

      <!-- JSON validator -->
      <JsonValidator
        :visible="validateDialogOpen"
        @update:visible="validateDialogOpen = $event"
        :schema="schema"
      />

      <!-- Content sections -->
      <div class="max-w-4xl mx-auto">
        <!-- How It Works -->
        <div class="mt-16 grid md:grid-cols-3 gap-6 text-center animate-in">
          <div class="glass-panel p-6">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span class="text-primary font-bold text-xl">1</span>
            </div>
            <h3 class="text-lg font-medium mb-2">Define Schema Structure</h3>
            <p class="text-muted-foreground text-sm">Create a user profile schema with name, email, and age fields.</p>
          </div>
          <div class="glass-panel p-6">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span class="text-primary font-bold text-xl">2</span>
            </div>
            <h3 class="text-lg font-medium mb-2">Create Complex Types</h3>
            <p class="text-muted-foreground text-sm">Build product catalogs with nested objects for variants and arrays for tags.</p>
          </div>
          <div class="glass-panel p-6">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span class="text-primary font-bold text-xl">3</span>
            </div>
            <h3 class="text-lg font-medium mb-2">Use Your Schema</h3>
            <p class="text-muted-foreground text-sm">Export for form validation, API documentation, or backend validation.</p>
          </div>
        </div>

        <!-- Tools Section -->
        <div class="mt-12 animate-in">
          <h2 class="text-2xl font-bold text-center mb-6">Ecosystem & Tools</h2>
          <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div v-for="section in toolLinks" :key="section.title" class="glass-panel p-4">
              <h3 class="text-md font-medium mb-2">{{ section.title }}</h3>
              <ul class="text-sm text-muted-foreground space-y-2">
                <li v-for="link in section.links" :key="link.url" class="flex items-start">
                  <span class="text-primary mr-2">•</span>
                  <span>
                    <strong>
                      <a :href="link.url" target="_blank" rel="nofollow noopener noreferrer">{{ link.name }}</a>
                    </strong>
                    {{ ' - ' }}{{ link.description }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div class="mt-6 text-center">
            <a href="https://json-schema.org/tools" target="_blank" rel="nofollow noopener noreferrer" class="text-sm text-primary hover:underline">
              Explore more JSON Schema tools →
            </a>
          </div>
        </div>

        <!-- Author Footer -->
        <div class="mt-16 py-4 border-t border-border/30 backdrop-blur-xs">
          <div class="flex items-center justify-center gap-2 text-sm">
            <span class="text-muted-foreground">Built by</span>
            <template v-for="(link, index) in authorLinks" :key="link.href">
              <a
                :href="link.href"
                class="font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                :target="link.target"
                :rel="link.rel"
              >
                <component :is="link.icon" :size="14" class="opacity-70" />
                <span>{{ link.text }}</span>
              </a>
              <span v-if="index < authorLinks.length - 1" class="mx-1">•</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
