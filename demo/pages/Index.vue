<script setup lang="ts">
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Code2,
  GitBranch,
  Globe,
  Layers,
  Menu,
  Package,
  Sparkles,
  Zap,
} from "lucide-vue-next";
import { computed, nextTick, ref } from "vue";
import JsonValidator from "../../src/components/features/JsonValidator.vue";
import SchemaInferencer from "../../src/components/features/SchemaInferencer.vue";
import JsonSchemaEditor from "../../src/components/SchemaEditor/JsonSchemaEditor.vue";
import { en } from "../../src/i18n/locales/en.ts";
import { provideTranslation } from "../../src/i18n/translation-context.ts";
import type { Translation } from "../../src/i18n/translation-keys.ts";
import type { JSONSchema } from "../../src/types/jsonSchema.ts";
import { exampleSchema } from "../utils/schemaExample.ts";

// ── Reactive translation ──
const translation = ref<Translation>(en);
provideTranslation(translation);

// ── State ──
const schema = ref<JSONSchema>(exampleSchema);
const inferSchema = ref<JSONSchema>({ type: "object", properties: {} });
const inferDialogOpen = ref(false);
const validatorDialogOpen = ref(false);
const schemaText = computed(() => JSON.stringify(schema.value, null, 2));

// ── Sidebar ──
type NavItem = {
  id: string;
  label: string;
  icon?: any;
  children?: { id: string; label: string }[];
};
const nav: NavItem[] = [
  {
    id: "editor",
    label: "JsonSchemaEditor",
    icon: Layers,
    children: [
      { id: "editor-basic", label: "Basic" },
      { id: "editor-visual", label: "Visual Only" },
      { id: "editor-readonly", label: "Read-Only" },
      { id: "editor-nofs", label: "No Fullscreen" },
      { id: "editor-sync", label: "Textbox Sync" },
    ],
  },
  {
    id: "infer",
    label: "SchemaInferencer",
    icon: Sparkles,
    children: [
      { id: "infer-popup", label: "Popup" },
      { id: "infer-inline", label: "Inline" },
      { id: "infer-util", label: "Utility" },
    ],
  },
  {
    id: "validator",
    label: "JsonValidator",
    icon: Zap,
    children: [
      { id: "validator-popup", label: "Popup" },
      { id: "validator-inline", label: "Inline" },
      { id: "validator-util", label: "Utility" },
    ],
  },
  { id: "i18n", label: "Localization", icon: Globe },
];

const active = ref("editor");
const expanded = ref<Record<string, boolean>>({
  editor: true,
  infer: true,
  validator: true,
});
const mobileNav = ref(false);

const go = (id: string) => {
  active.value = id;
  mobileNav.value = false;
  nextTick(() => {
    document
      .getElementById(`section-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};
const toggle = (id: string) => {
  expanded.value[id] = !expanded.value[id];
};

// ── Copy ──
const copiedId = ref("");
const copy = (code: string, id: string) => {
  navigator.clipboard.writeText(code);
  copiedId.value = id;
  setTimeout(() => {
    copiedId.value = "";
  }, 1500);
};

// ── i18n ──
const langs = [
  { value: "en", label: "English" },
  { value: "it", label: "Italiano" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "ru", label: "Русский" },
  { value: "uk", label: "Українська" },
  { value: "zh", label: "中文" },
  { value: "pl", label: "Polski" },
];
const currentLang = ref("en");
const switchLang = (val: string) => {
  currentLang.value = val;
  import(`../../src/i18n/locales/${val}.ts`).then((m) => {
    translation.value = m[val];
  });
};

// ── Utility demos ──
const utilInput = ref(
  '{\n  "name": "Alice",\n  "age": 25,\n  "active": true\n}',
);
const utilOutput = ref("");
const runInfer = () => {
  try {
    const obj = JSON.parse(utilInput.value);
    import("../../src/lib/schema-inference.ts").then((m) => {
      utilOutput.value = JSON.stringify(m.createSchemaFromJson(obj), null, 2);
    });
  } catch (e) {
    utilOutput.value = `Error: ${(e as Error).message}`;
  }
};

const validUtilInput = ref('{ "name": "Bob", "age": "not a number" }');
const validUtilOutput = ref("");
const runValidate = () => {
  import("../../src/utils/jsonValidator.ts").then((m) => {
    const result = m.validateJson(validUtilInput.value, schema.value);
    validUtilOutput.value = result.valid
      ? "✓ Valid"
      : result.errors!.map((e) => `✗ ${e.path}: ${e.message}`).join("\n");
  });
};

// ── Props & Events ──
type P = { name: string; type: string; def: string; desc: string };
type E = { name: string; payload: string; desc: string };

const editorProps: P[] = [
  {
    name: "schema",
    type: "JSONSchema",
    def: "{ type: 'object' }",
    desc: "The JSON schema to edit (v-model compatible).",
  },
  {
    name: "readOnly",
    type: "boolean",
    def: "false",
    desc: "Disable all editing controls.",
  },
  {
    name: "showJsonEditor",
    type: "boolean",
    def: "true",
    desc: "Show the Monaco JSON editor panel.",
  },
  {
    name: "showFullscreen",
    type: "boolean",
    def: "true",
    desc: "Show the fullscreen toggle button.",
  },
];
const editorEvents: E[] = [
  {
    name: "update:schema",
    payload: "JSONSchema",
    desc: "Emitted on every schema change.",
  },
];
const inferProps: P[] = [
  {
    name: "visible",
    type: "boolean | undefined",
    def: "undefined",
    desc: "Dialog visibility. Omit for inline mode.",
  },
];
const inferEvents: E[] = [
  { name: "update:visible", payload: "boolean", desc: "Dialog open/close." },
  {
    name: "schemaInferred",
    payload: "JSONSchema",
    desc: "The inferred schema.",
  },
];
const validatorProps: P[] = [
  {
    name: "schema",
    type: "JSONSchema",
    def: "—",
    desc: "Schema to validate against.",
  },
  {
    name: "visible",
    type: "boolean | undefined",
    def: "undefined",
    desc: "Omit for inline mode.",
  },
];
const validatorEvents: E[] = [
  { name: "update:visible", payload: "boolean", desc: "Dialog open/close." },
];

// ── Code snippets ──
const code: Record<string, string> = {
  "editor-basic": `<JsonSchemaEditor v-model:schema="schema" />`,
  "editor-visual": `<JsonSchemaEditor v-model:schema="schema" :show-json-editor="false" />`,
  "editor-readonly": `<JsonSchemaEditor :schema="schema" :read-only="true" />`,
  "editor-nofs": `<JsonSchemaEditor v-model:schema="schema" :show-fullscreen="false" />`,
  "editor-sync": `<JsonSchemaEditor v-model:schema="schema" :show-json-editor="false" />
<textarea :value="JSON.stringify(schema, null, 2)" readonly />`,
  "infer-popup": `<SchemaInferencer
  v-model:visible="show"
  @schema-inferred="schema = $event"
/>`,
  "infer-inline": `<SchemaInferencer @schema-inferred="schema = $event" />
<JsonSchemaEditor v-model:schema="schema" />`,
  "infer-util": `import { createSchemaFromJson } from 'jsonschema-builder-vue'
const schema = createSchemaFromJson({ name: "Alice", age: 25 })`,
  "validator-popup": `<JsonValidator v-model:visible="show" :schema="schema" />`,
  "validator-inline": `<JsonValidator :schema="schema" />`,
  "validator-util": `import { validateJson } from 'jsonschema-builder-vue'
const result = validateJson('{ "name": 42 }', schema)`,
  i18n: `import { ref } from 'vue'
import { provideTranslation } from 'jsonschema-builder-vue'
import { en } from 'jsonschema-builder-vue/i18n/locales/en'
import { de } from 'jsonschema-builder-vue/i18n/locales/de'

const lang = ref(en)
provideTranslation(lang)
lang.value = de  // all labels update instantly`,
};
</script>

<template>
  <div class="min-h-screen bg-[#fafbfd] jsonjoy font-sans">

    <!-- ───────── Hero ───────── -->
    <header class="relative overflow-hidden border-b border-border/30">
      <div class="absolute inset-0 pointer-events-none"
           style="background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,.08), transparent)" />
      <div class="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div class="flex items-center gap-3 mb-4">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Code2 :size="20" class="text-white" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">jsonschema-builder-vue</h1>
            <p class="text-sm text-gray-500 mt-0.5">Interactive JSON Schema editor components for Vue&nbsp;3</p>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <a href="https://github.com/gcasotti/jsonschema-builder-vue" target="_blank" rel="nofollow noopener noreferrer"
             class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm">
            <GitBranch :size="14" /> GitHub
          </a>
          <a href="https://www.npmjs.com/package/jsonschema-builder-vue" target="_blank" rel="nofollow noopener noreferrer"
             class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border bg-white hover:bg-gray-50 transition-colors shadow-sm">
            <Package :size="14" /> npm
          </a>
          <span class="inline-flex items-center px-2.5 py-1 text-xs font-mono rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            npm i jsonschema-builder-vue
          </span>
        </div>
      </div>
    </header>

    <div class="flex max-w-[1400px] mx-auto">

      <!-- ───────── Sidebar ───────── -->
      <button type="button" class="fixed bottom-4 right-4 z-30 lg:hidden p-3 rounded-full bg-gray-900 text-white shadow-xl" @click="mobileNav = !mobileNav">
        <Menu :size="20" />
      </button>
      <div v-if="mobileNav" class="fixed inset-0 z-20 bg-black/30 lg:hidden" @click="mobileNav = false" />

      <aside :class="[
        'shrink-0 bg-white/60 backdrop-blur-md border-r border-border/30 overflow-y-auto',
        'fixed inset-y-0 left-0 z-20 w-60 pt-4 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:w-56',
        mobileNav ? 'translate-x-0' : '-translate-x-full'
      ]">
        <nav class="px-3 pb-6 space-y-1 text-[13px]">
          <div v-for="item in nav" :key="item.id" class="mb-1">
            <!-- Group header -->
            <button type="button" @click="item.children ? (expanded[item.id] = true, go(item.id)) : go(item.id)"
              :class="[
                'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg font-semibold transition-colors',
                active === item.id || active.startsWith(item.id + '-')
                  ? 'text-blue-700 bg-blue-50/80' : 'text-gray-700 hover:bg-gray-100/70'
              ]">
              <component v-if="item.icon" :is="item.icon" :size="15" class="opacity-60" />
              <span class="grow text-left">{{ item.label }}</span>
              <span v-if="item.children" class="p-0.5 rounded hover:bg-gray-200/60" @click.stop="toggle(item.id)">
                <ChevronDown v-if="expanded[item.id]" :size="14" class="opacity-40" />
                <ChevronRight v-else :size="14" class="opacity-40" />
              </span>
            </button>
            <!-- Children -->
            <div v-if="item.children && expanded[item.id]" class="ml-6 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2.5">
              <button v-for="child in item.children" :key="child.id" type="button" @click="go(child.id)"
                :class="[
                  'w-full text-left px-2 py-1.5 rounded-md transition-colors',
                  active === child.id ? 'text-blue-700 bg-blue-50/60 font-medium' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                ]">
                {{ child.label }}
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <!-- ───────── Content ───────── -->
      <main class="grow min-w-0 overflow-y-auto">
        <div class="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-16">

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║     JsonSchemaEditor          ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <section id="section-editor">
            <div class="flex items-center gap-3 mb-2">
              <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Layers :size="16" class="text-white" />
              </div>
              <h2 class="text-xl font-bold text-gray-900">JsonSchemaEditor</h2>
            </div>
            <p class="text-gray-500 mb-6 leading-relaxed">
              Full-featured visual JSON Schema builder with an optional live JSON code view.
              Supports nested objects, arrays, all draft-07 types, and validation constraints.
            </p>

            <!-- API Tables -->
            <div class="grid gap-5 mb-10">
              <div>
                <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Props</h3>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white">
                  <table class="w-full text-sm">
                    <thead><tr class="bg-gray-50/80 text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th class="px-4 py-2.5 font-medium">Name</th><th class="px-4 py-2.5 font-medium">Type</th>
                      <th class="px-4 py-2.5 font-medium">Default</th><th class="px-4 py-2.5 font-medium">Description</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="p in editorProps" :key="p.name" class="border-t border-border/40">
                        <td class="px-4 py-2.5 font-mono text-xs text-blue-600 font-medium">{{ p.name }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-gray-500">{{ p.type }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ p.def }}</td>
                        <td class="px-4 py-2.5 text-gray-600">{{ p.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Events</h3>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white">
                  <table class="w-full text-sm">
                    <thead><tr class="bg-gray-50/80 text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th class="px-4 py-2.5 font-medium">Name</th><th class="px-4 py-2.5 font-medium">Payload</th>
                      <th class="px-4 py-2.5 font-medium">Description</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="e in editorEvents" :key="e.name" class="border-t border-border/40">
                        <td class="px-4 py-2.5 font-mono text-xs text-blue-600 font-medium">{{ e.name }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-gray-500">{{ e.payload }}</td>
                        <td class="px-4 py-2.5 text-gray-600">{{ e.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Use Cases -->
            <!-- Basic -->
            <div id="section-editor-basic" class="mb-10">
              <h3 class="text-base font-semibold text-gray-800 mb-1">Basic Usage</h3>
              <p class="text-sm text-gray-500 mb-3">The default configuration with both visual and JSON editor panels.</p>
              <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white" style="height:520px">
                <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" class="h-full" />
              </div>
              <div class="mt-3 rounded-xl border border-border/40 bg-gray-50/60 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                  <button type="button" @click="copy(code['editor-basic'], 'editor-basic')"
                    class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <Check v-if="copiedId === 'editor-basic'" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy
                  </button>
                </div>
                <pre class="px-4 py-3 text-[13px] font-mono text-gray-700 leading-relaxed overflow-x-auto"><code>{{ code["editor-basic"] }}</code></pre>
              </div>
            </div>

            <!-- Visual Only -->
            <div id="section-editor-visual" class="mb-10">
              <h3 class="text-base font-semibold text-gray-800 mb-1">Visual Only</h3>
              <p class="text-sm text-gray-500 mb-3">Hide the JSON code panel — ideal for end-users who only need the visual builder.</p>
              <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white" style="height:470px">
                <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" :show-json-editor="false" class="h-full" />
              </div>
              <div class="mt-3 rounded-xl border border-border/40 bg-gray-50/60 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                  <button type="button" @click="copy(code['editor-visual'], 'editor-visual')"
                    class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <Check v-if="copiedId === 'editor-visual'" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy
                  </button>
                </div>
                <pre class="px-4 py-3 text-[13px] font-mono text-gray-700 leading-relaxed overflow-x-auto"><code>{{ code["editor-visual"] }}</code></pre>
              </div>
            </div>

            <!-- Read-Only -->
            <div id="section-editor-readonly" class="mb-10">
              <h3 class="text-base font-semibold text-gray-800 mb-1">Read-Only</h3>
              <p class="text-sm text-gray-500 mb-3">Display a schema without allowing modifications.</p>
              <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white" style="height:470px">
                <JsonSchemaEditor :schema="schema" :read-only="true" class="h-full" />
              </div>
              <div class="mt-3 rounded-xl border border-border/40 bg-gray-50/60 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                  <button type="button" @click="copy(code['editor-readonly'], 'editor-readonly')"
                    class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <Check v-if="copiedId === 'editor-readonly'" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy
                  </button>
                </div>
                <pre class="px-4 py-3 text-[13px] font-mono text-gray-700 leading-relaxed overflow-x-auto"><code>{{ code["editor-readonly"] }}</code></pre>
              </div>
            </div>

            <!-- No Fullscreen -->
            <div id="section-editor-nofs" class="mb-10">
              <h3 class="text-base font-semibold text-gray-800 mb-1">No Fullscreen Toggle</h3>
              <p class="text-sm text-gray-500 mb-3">Hide the fullscreen button for embedded layouts.</p>
              <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white" style="height:470px">
                <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" :show-fullscreen="false" class="h-full" />
              </div>
              <div class="mt-3 rounded-xl border border-border/40 bg-gray-50/60 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                  <button type="button" @click="copy(code['editor-nofs'], 'editor-nofs')"
                    class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <Check v-if="copiedId === 'editor-nofs'" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy
                  </button>
                </div>
                <pre class="px-4 py-3 text-[13px] font-mono text-gray-700 leading-relaxed overflow-x-auto"><code>{{ code["editor-nofs"] }}</code></pre>
              </div>
            </div>

            <!-- Textbox Sync -->
            <div id="section-editor-sync" class="mb-10">
              <h3 class="text-base font-semibold text-gray-800 mb-1">Textbox Sync</h3>
              <p class="text-sm text-gray-500 mb-3">A plain textarea mirrors every schema change via the <code class="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">update:schema</code> event.</p>
              <div class="grid lg:grid-cols-2 gap-4">
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white" style="height:450px">
                  <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" :show-json-editor="false" :show-fullscreen="false" class="h-full" />
                </div>
                <textarea :value="schemaText" readonly
                  class="rounded-xl border border-border/60 bg-white p-4 text-xs font-mono text-gray-600 resize-none shadow-xs focus:outline-none h-[450px]" />
              </div>
              <div class="mt-3 rounded-xl border border-border/40 bg-gray-50/60 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                  <button type="button" @click="copy(code['editor-sync'], 'editor-sync')"
                    class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <Check v-if="copiedId === 'editor-sync'" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy
                  </button>
                </div>
                <pre class="px-4 py-3 text-[13px] font-mono text-gray-700 leading-relaxed overflow-x-auto"><code>{{ code["editor-sync"] }}</code></pre>
              </div>
            </div>
          </section>

          <hr class="border-border/30" />

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║     SchemaInferencer          ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <section id="section-infer">
            <div class="flex items-center gap-3 mb-2">
              <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sparkles :size="16" class="text-white" />
              </div>
              <h2 class="text-xl font-bold text-gray-900">SchemaInferencer</h2>
            </div>
            <p class="text-gray-500 mb-6 leading-relaxed">
              Generates a JSON Schema from a sample JSON document. Works as a popup dialog
              or inline, and is fully decoupled from the editor — you choose how to consume the result.
            </p>

            <div class="grid gap-5 mb-10">
              <div>
                <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Props</h3>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white">
                  <table class="w-full text-sm">
                    <thead><tr class="bg-gray-50/80 text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th class="px-4 py-2.5 font-medium">Name</th><th class="px-4 py-2.5 font-medium">Type</th>
                      <th class="px-4 py-2.5 font-medium">Default</th><th class="px-4 py-2.5 font-medium">Description</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="p in inferProps" :key="p.name" class="border-t border-border/40">
                        <td class="px-4 py-2.5 font-mono text-xs text-amber-600 font-medium">{{ p.name }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-gray-500">{{ p.type }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ p.def }}</td>
                        <td class="px-4 py-2.5 text-gray-600">{{ p.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Events</h3>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white">
                  <table class="w-full text-sm">
                    <thead><tr class="bg-gray-50/80 text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th class="px-4 py-2.5 font-medium">Name</th><th class="px-4 py-2.5 font-medium">Payload</th>
                      <th class="px-4 py-2.5 font-medium">Description</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="e in inferEvents" :key="e.name" class="border-t border-border/40">
                        <td class="px-4 py-2.5 font-mono text-xs text-amber-600 font-medium">{{ e.name }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-gray-500">{{ e.payload }}</td>
                        <td class="px-4 py-2.5 text-gray-600">{{ e.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Popup -->
            <div id="section-infer-popup" class="mb-10">
              <h3 class="text-base font-semibold text-gray-800 mb-1">Popup Mode</h3>
              <p class="text-sm text-gray-500 mb-3">Open as a dialog, paste JSON, and get a schema back. The inferred schema feeds a separate read-only editor.</p>
              <button type="button" @click="inferDialogOpen = true"
                class="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:shadow-md hover:shadow-amber-500/20 transition-all mb-3">
                Open Inferencer
              </button>
              <div v-if="Object.keys((inferSchema as any).properties || {}).length"
                class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white" style="height:380px">
                <JsonSchemaEditor :schema="inferSchema" :read-only="true" class="h-full" />
              </div>
              <p v-else class="text-sm text-gray-400 italic">Inferred schema will appear here.</p>
              <SchemaInferencer :visible="inferDialogOpen" @update:visible="inferDialogOpen = $event" @schema-inferred="inferSchema = $event" />
              <div class="mt-3 rounded-xl border border-border/40 bg-gray-50/60 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                  <button type="button" @click="copy(code['infer-popup'], 'infer-popup')"
                    class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <Check v-if="copiedId === 'infer-popup'" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy
                  </button>
                </div>
                <pre class="px-4 py-3 text-[13px] font-mono text-gray-700 leading-relaxed overflow-x-auto"><code>{{ code["infer-popup"] }}</code></pre>
              </div>
            </div>

            <!-- Inline -->
            <div id="section-infer-inline" class="mb-10">
              <h3 class="text-base font-semibold text-gray-800 mb-1">Inline Mode</h3>
              <p class="text-sm text-gray-500 mb-3">Omit <code class="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">:visible</code> to render inline. Here the inferred schema feeds a separate editor below.</p>
              <div class="grid lg:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">1 — Paste JSON</p>
                  <SchemaInferencer @schema-inferred="inferSchema = $event" />
                </div>
                <div>
                  <p class="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">2 — Resulting schema</p>
                  <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white" style="height:368px">
                    <JsonSchemaEditor :schema="inferSchema" @update:schema="inferSchema = $event" :show-json-editor="false" :show-fullscreen="false" class="h-full" />
                  </div>
                </div>
              </div>
              <div class="mt-3 rounded-xl border border-border/40 bg-gray-50/60 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                  <button type="button" @click="copy(code['infer-inline'], 'infer-inline')"
                    class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <Check v-if="copiedId === 'infer-inline'" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy
                  </button>
                </div>
                <pre class="px-4 py-3 text-[13px] font-mono text-gray-700 leading-relaxed overflow-x-auto"><code>{{ code["infer-inline"] }}</code></pre>
              </div>
            </div>

            <!-- Utility -->
            <div id="section-infer-util" class="mb-10">
              <h3 class="text-base font-semibold text-gray-800 mb-1">Utility Function</h3>
              <p class="text-sm text-gray-500 mb-3">A pure function — no Vue required. Pass any JS object, get a JSON Schema back.</p>
              <div class="grid lg:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Input (JSON)</p>
                  <textarea v-model="utilInput" class="rounded-xl border border-border/60 bg-white p-3 text-xs font-mono resize-none w-full h-36 focus:outline-none shadow-xs" />
                  <button type="button" @click="runInfer"
                    class="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:shadow-md transition-all">Run</button>
                </div>
                <div>
                  <p class="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Output (Schema)</p>
                  <pre class="rounded-xl border border-border/60 bg-white p-3 text-xs font-mono h-36 overflow-auto shadow-xs">{{ utilOutput || 'Press Run' }}</pre>
                </div>
              </div>
              <div class="mt-3 rounded-xl border border-border/40 bg-gray-50/60 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                  <button type="button" @click="copy(code['infer-util'], 'infer-util')"
                    class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <Check v-if="copiedId === 'infer-util'" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy
                  </button>
                </div>
                <pre class="px-4 py-3 text-[13px] font-mono text-gray-700 leading-relaxed overflow-x-auto"><code>{{ code["infer-util"] }}</code></pre>
              </div>
            </div>
          </section>

          <hr class="border-border/30" />

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║     JsonValidator             ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <section id="section-validator">
            <div class="flex items-center gap-3 mb-2">
              <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Zap :size="16" class="text-white" />
              </div>
              <h2 class="text-xl font-bold text-gray-900">JsonValidator</h2>
            </div>
            <p class="text-gray-500 mb-6 leading-relaxed">
              Validates a JSON document against any schema with real-time inline error display.
              Also available as a pure utility function for headless use.
            </p>

            <div class="grid gap-5 mb-10">
              <div>
                <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Props</h3>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white">
                  <table class="w-full text-sm">
                    <thead><tr class="bg-gray-50/80 text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th class="px-4 py-2.5 font-medium">Name</th><th class="px-4 py-2.5 font-medium">Type</th>
                      <th class="px-4 py-2.5 font-medium">Default</th><th class="px-4 py-2.5 font-medium">Description</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="p in validatorProps" :key="p.name" class="border-t border-border/40">
                        <td class="px-4 py-2.5 font-mono text-xs text-emerald-600 font-medium">{{ p.name }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-gray-500">{{ p.type }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-gray-400">{{ p.def }}</td>
                        <td class="px-4 py-2.5 text-gray-600">{{ p.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Events</h3>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white">
                  <table class="w-full text-sm">
                    <thead><tr class="bg-gray-50/80 text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th class="px-4 py-2.5 font-medium">Name</th><th class="px-4 py-2.5 font-medium">Payload</th>
                      <th class="px-4 py-2.5 font-medium">Description</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="e in validatorEvents" :key="e.name" class="border-t border-border/40">
                        <td class="px-4 py-2.5 font-mono text-xs text-emerald-600 font-medium">{{ e.name }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-gray-500">{{ e.payload }}</td>
                        <td class="px-4 py-2.5 text-gray-600">{{ e.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Popup -->
            <div id="section-validator-popup" class="mb-10">
              <h3 class="text-base font-semibold text-gray-800 mb-1">Popup Mode</h3>
              <p class="text-sm text-gray-500 mb-3">Open a dialog, paste JSON, and validate against the current schema.</p>
              <button type="button" @click="validatorDialogOpen = true"
                class="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:shadow-md hover:shadow-emerald-500/20 transition-all">
                Open Validator
              </button>
              <p class="text-sm text-gray-400 mt-2">Validates against the schema from the editor above.</p>
              <JsonValidator :visible="validatorDialogOpen" @update:visible="validatorDialogOpen = $event" :schema="schema" />
              <div class="mt-3 rounded-xl border border-border/40 bg-gray-50/60 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                  <button type="button" @click="copy(code['validator-popup'], 'validator-popup')"
                    class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <Check v-if="copiedId === 'validator-popup'" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy
                  </button>
                </div>
                <pre class="px-4 py-3 text-[13px] font-mono text-gray-700 leading-relaxed overflow-x-auto"><code>{{ code["validator-popup"] }}</code></pre>
              </div>
            </div>

            <!-- Inline -->
            <div id="section-validator-inline" class="mb-10">
              <h3 class="text-base font-semibold text-gray-800 mb-1">Inline Mode</h3>
              <p class="text-sm text-gray-500 mb-3">Omit <code class="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">:visible</code> to render inline.</p>
              <JsonValidator :schema="schema" />
              <div class="mt-3 rounded-xl border border-border/40 bg-gray-50/60 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                  <button type="button" @click="copy(code['validator-inline'], 'validator-inline')"
                    class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <Check v-if="copiedId === 'validator-inline'" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy
                  </button>
                </div>
                <pre class="px-4 py-3 text-[13px] font-mono text-gray-700 leading-relaxed overflow-x-auto"><code>{{ code["validator-inline"] }}</code></pre>
              </div>
            </div>

            <!-- Utility -->
            <div id="section-validator-util" class="mb-10">
              <h3 class="text-base font-semibold text-gray-800 mb-1">Utility Function</h3>
              <p class="text-sm text-gray-500 mb-3">Pure function — no Vue required. Returns structured errors with paths and line numbers.</p>
              <div class="grid lg:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Input</p>
                  <textarea v-model="validUtilInput" class="rounded-xl border border-border/60 bg-white p-3 text-xs font-mono resize-none w-full h-36 focus:outline-none shadow-xs" />
                  <button type="button" @click="runValidate"
                    class="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:shadow-md transition-all">Validate</button>
                </div>
                <div>
                  <p class="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Result</p>
                  <pre class="rounded-xl border border-border/60 bg-white p-3 text-xs font-mono h-36 overflow-auto whitespace-pre-wrap shadow-xs">{{ validUtilOutput || 'Press Validate' }}</pre>
                </div>
              </div>
              <div class="mt-3 rounded-xl border border-border/40 bg-gray-50/60 overflow-hidden">
                <div class="flex items-center justify-between px-4 py-2 border-b border-border/30">
                  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                  <button type="button" @click="copy(code['validator-util'], 'validator-util')"
                    class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <Check v-if="copiedId === 'validator-util'" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy
                  </button>
                </div>
                <pre class="px-4 py-3 text-[13px] font-mono text-gray-700 leading-relaxed overflow-x-auto"><code>{{ code["validator-util"] }}</code></pre>
              </div>
            </div>
          </section>

          <hr class="border-border/30" />

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║     Localization              ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <section id="section-i18n">
            <div class="flex items-center gap-3 mb-2">
              <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Globe :size="16" class="text-white" />
              </div>
              <h2 class="text-xl font-bold text-gray-900">Localization</h2>
            </div>
            <p class="text-gray-500 mb-6 leading-relaxed">
              All components share a reactive translation context via Vue's
              <code class="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">provide</code> /
              <code class="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">inject</code>.
              Provide a <code class="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">Ref&lt;Translation&gt;</code> and change its value to switch languages at runtime.
            </p>

            <div class="mb-4">
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Available Locales</p>
              <div class="flex flex-wrap gap-2">
                <button v-for="lang in langs" :key="lang.value" type="button" @click="switchLang(lang.value)"
                  :class="[
                    'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
                    currentLang === lang.value
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20'
                      : 'bg-white border border-border/60 text-gray-600 hover:bg-gray-50 hover:shadow-xs'
                  ]">
                  {{ lang.label }}
                </button>
              </div>
            </div>

            <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white" style="height:480px">
              <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" class="h-full" />
            </div>

            <div class="mt-3 rounded-xl border border-border/40 bg-gray-50/60 overflow-hidden">
              <div class="flex items-center justify-between px-4 py-2 border-b border-border/30">
                <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                <button type="button" @click="copy(code.i18n, 'i18n')"
                  class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                  <Check v-if="copiedId === 'i18n'" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy
                </button>
              </div>
              <pre class="px-4 py-3 text-[13px] font-mono text-gray-700 leading-relaxed overflow-x-auto"><code>{{ code.i18n }}</code></pre>
            </div>
          </section>

          <!-- Footer -->
          <footer class="text-center text-xs text-gray-400 pt-8 pb-12 border-t border-border/20">
            Built with Vue&nbsp;3 · MIT License ·
            <a href="https://github.com/gcasotti/jsonschema-builder-vue" target="_blank" rel="nofollow noopener noreferrer" class="underline hover:text-gray-600">Source on GitHub</a>
          </footer>

        </div>
      </main>
    </div>
  </div>
</template>
