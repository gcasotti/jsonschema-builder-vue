<script setup lang="ts">
import {
  Clipboard, Check, ChevronRight, GitBranch, Menu, Package, User,
} from "lucide-vue-next";
import { ref, computed, watch } from "vue";
import { exampleSchema } from "../utils/schemaExample.ts";
import JsonValidator from "../../src/components/features/JsonValidator.vue";
import SchemaInferencer from "../../src/components/features/SchemaInferencer.vue";
import JsonSchemaEditor from "../../src/components/SchemaEditor/JsonSchemaEditor.vue";
import { en } from "../../src/i18n/locales/en.ts";
import { provideTranslation } from "../../src/i18n/translation-context.ts";
import type { Translation } from "../../src/i18n/translation-keys.ts";
import type { JSONSchema } from "../../src/types/jsonSchema.ts";

// ── Reactive translation ──
const translation = ref<Translation>(en);
provideTranslation(translation);

// ── Shared state ──
const schema = ref<JSONSchema>(exampleSchema);
const inferSchema = ref<JSONSchema>({ type: "object", properties: {} });
const inferDialogOpen = ref(false);
const validatorDialogOpen = ref(false);

// Schema as formatted text for the textbox demo
const schemaText = computed(() => JSON.stringify(schema.value, null, 2));

// ── Sidebar ──
type SidebarItem = { id: string; label: string; group: string };
const items: SidebarItem[] = [
  { id: "editor",            label: "Basic Usage",         group: "JsonSchemaEditor" },
  { id: "visual-only",       label: "Visual Only",         group: "JsonSchemaEditor" },
  { id: "readonly",          label: "Read-Only",           group: "JsonSchemaEditor" },
  { id: "no-fullscreen",     label: "No Fullscreen",       group: "JsonSchemaEditor" },
  { id: "textbox-sync",      label: "Textbox Sync",        group: "JsonSchemaEditor" },
  { id: "infer-popup",       label: "Popup Mode",          group: "SchemaInferencer" },
  { id: "infer-inline",      label: "Inline + Editor",     group: "SchemaInferencer" },
  { id: "infer-util",        label: "Utility Function",    group: "SchemaInferencer" },
  { id: "validator-popup",   label: "Popup Mode",          group: "JsonValidator" },
  { id: "validator-inline",  label: "Inline Mode",        group: "JsonValidator" },
  { id: "validator-util",    label: "Utility Function",    group: "JsonValidator" },
  { id: "i18n",              label: "Language Switching",   group: "Localization" },
];

const groups = computed(() => {
  const m = new Map<string, SidebarItem[]>();
  for (const i of items) {
    if (!m.has(i.group)) m.set(i.group, []);
    m.get(i.group)!.push(i);
  }
  return [...m.entries()];
});

const active = ref("editor");
const mobileNav = ref(false);
const nav = (id: string) => { active.value = id; mobileNav.value = false; };

// ── Copy ──
const copied = ref(false);
const copy = (code: string) => {
  navigator.clipboard.writeText(code);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 1500);
};

// ── i18n ──
const langs = [
  { value: "en", label: "English" },
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

// ── Utility demo state ──
const utilInput = ref('{\n  "name": "Alice",\n  "age": 25,\n  "active": true\n}');
const utilOutput = ref("");
const runInfer = () => {
  try {
    const obj = JSON.parse(utilInput.value);
    // inline import to show it's a pure function
    import("../../src/lib/schema-inference.ts").then((m) => {
      utilOutput.value = JSON.stringify(m.createSchemaFromJson(obj), null, 2);
    });
  } catch (e) { utilOutput.value = `Error: ${(e as Error).message}`; }
};

const validUtilInput = ref('{ "name": "Bob", "age": "not a number" }');
const validUtilOutput = ref("");
const runValidate = () => {
  try {
    import("../../src/utils/jsonValidator.ts").then((m) => {
      const result = m.validateJson(validUtilInput.value, schema.value);
      validUtilOutput.value = result.valid
        ? "✓ Valid"
        : result.errors!.map(e => `✗ ${e.path}: ${e.message}`).join("\n");
    });
  } catch (e) { validUtilOutput.value = `Error: ${(e as Error).message}`; }
};

// ── Code snippets ──
const code: Record<string, string> = {
  editor: `<script setup>
import { ref } from 'vue'
import { JsonSchemaEditor } from 'jsonjoy-builder-vue'

const schema = ref({ type: 'object', properties: {} })
<\/script>

<template>
  <JsonSchemaEditor v-model:schema="schema" />
</template>`,
  "visual-only": `<!-- Visual editor only — no JSON code panel -->
<JsonSchemaEditor
  v-model:schema="schema"
  :show-json-editor="false"
/>`,
  readonly: `<JsonSchemaEditor :schema="schema" :read-only="true" />`,
  "no-fullscreen": `<JsonSchemaEditor
  v-model:schema="schema"
  :show-fullscreen="false"
/>`,
  "textbox-sync": `<script setup>
import { ref, computed } from 'vue'
import { JsonSchemaEditor } from 'jsonjoy-builder-vue'

const schema = ref({ type: 'object', properties: {} })
const text = computed(() => JSON.stringify(schema.value, null, 2))
<\/script>

<template>
  <JsonSchemaEditor v-model:schema="schema" :show-json-editor="false" />
  <textarea :value="text" readonly rows="10" />
</template>`,
  "infer-popup": `<script setup>
import { ref } from 'vue'
import { SchemaInferencer, JsonSchemaEditor } from 'jsonjoy-builder-vue'

const show = ref(false)
const schema = ref({})
<\/script>

<template>
  <button @click="show = true">Infer from JSON</button>
  <SchemaInferencer
    v-model:visible="show"
    @schema-inferred="schema = $event"
  />
  <JsonSchemaEditor :schema="schema" :read-only="true" />
</template>`,
  "infer-inline": `<!-- Inline mode: omit the :visible prop -->
<SchemaInferencer @schema-inferred="schema = $event" />
<JsonSchemaEditor v-model:schema="schema" />`,
  "infer-util": `// Pure function — no Vue required
import { createSchemaFromJson } from 'jsonjoy-builder-vue'

const json = { name: "Alice", age: 25, active: true }
const schema = createSchemaFromJson(json)
// → { type: "object", properties: { name: { type: "string" }, ... } }`,
  "validator-popup": `<script setup>
import { ref } from 'vue'
import { JsonValidator } from 'jsonjoy-builder-vue'

const show = ref(false)
<\/script>

<template>
  <button @click="show = true">Validate JSON</button>
  <JsonValidator v-model:visible="show" :schema="schema" />
</template>`,
  "validator-inline": `<!-- Inline mode: omit the :visible prop -->
<JsonValidator :schema="schema" />`,
  "validator-util": `// Pure function — no Vue required
import { validateJson } from 'jsonjoy-builder-vue'

const result = validateJson('{ "name": 42 }', schema)
if (!result.valid) {
  console.log(result.errors)
}`,
  i18n: `<script setup>
import { ref } from 'vue'
import { provideTranslation } from 'jsonjoy-builder-vue'
import { en } from 'jsonjoy-builder-vue/i18n/locales/en'
import { de } from 'jsonjoy-builder-vue/i18n/locales/de'

const lang = ref(en)
provideTranslation(lang)

// To switch at runtime:
lang.value = de
<\/script>`,
};

const authorLinks = [
  { href: "https://github.com/gcasotti", text: "@gcasotti", icon: User },
  { href: "https://github.com/gcasotti/jsonjoy-builder-vue", text: "GitHub", icon: GitBranch },
  { href: "https://www.npmjs.com/package/jsonjoy-builder-vue", text: "NPM", icon: Package },
];

// ── Prop tables ──
type P = { name: string; type: string; def: string; desc: string };
type E = { name: string; payload: string; desc: string };

const editorProps: P[] = [
  { name: "schema",         type: "JSONSchema",  def: "{ type: 'object' }", desc: "The schema object to edit." },
  { name: "readOnly",       type: "boolean",     def: "false",              desc: "Disable all editing." },
  { name: "showJsonEditor", type: "boolean",     def: "true",               desc: "Show/hide the Monaco JSON panel." },
  { name: "showFullscreen",type: "boolean",     def: "true",               desc: "Show/hide the fullscreen button." },
];
const editorEvents: E[] = [
  { name: "update:schema", payload: "JSONSchema", desc: "Emitted on every schema change (v-model compatible)." },
];
const inferProps: P[] = [
  { name: "visible", type: "boolean | undefined", def: "undefined", desc: "Dialog visibility. Omit for inline mode." },
];
const inferEvents: E[] = [
  { name: "update:visible",  payload: "boolean",   desc: "Dialog open/close." },
  { name: "schemaInferred",  payload: "JSONSchema", desc: "The inferred schema." },
];
const validatorPropsTable: P[] = [
  { name: "schema",  type: "JSONSchema",           def: "—",         desc: "Schema to validate against." },
  { name: "visible", type: "boolean | undefined",  def: "undefined", desc: "Dialog visibility. Omit for inline mode." },
];
const validatorEventsTable: E[] = [
  { name: "update:visible",  payload: "boolean", desc: "Dialog open/close." },
];
</script>

<template>
  <div class="min-h-screen bg-background jsonjoy flex flex-col">
    <!-- Top bar -->
    <header class="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 shrink-0">
      <div class="px-4 lg:px-6 h-12 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button type="button" class="lg:hidden p-1" @click="mobileNav = !mobileNav"><Menu :size="18" /></button>
          <span class="font-semibold tracking-tight">jsonjoy-builder-vue</span>
          <span class="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">docs</span>
        </div>
        <div class="flex items-center gap-1">
          <a v-for="l in authorLinks" :key="l.href" :href="l.href" target="_blank" rel="nofollow noopener noreferrer"
            class="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-1.5 py-1">
            <component :is="l.icon" :size="13" /><span class="hidden sm:inline">{{ l.text }}</span>
          </a>
        </div>
      </div>
    </header>

    <div class="flex grow min-h-0">
      <!-- Sidebar -->
      <aside :class="[
        'shrink-0 border-r border-border/40 bg-muted/20 overflow-y-auto',
        'fixed inset-y-12 left-0 z-20 w-56 transition-transform lg:relative lg:inset-auto lg:translate-x-0 lg:w-52',
        mobileNav ? 'translate-x-0' : '-translate-x-full'
      ]">
        <nav class="py-4 px-3 space-y-4 text-sm">
          <div v-for="[group, gItems] in groups" :key="group">
            <p class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 px-2">{{ group }}</p>
            <button v-for="item in gItems" :key="item.id" type="button" @click="nav(item.id)"
              :class="['w-full text-left px-2 py-1.5 rounded-md transition-colors flex items-center gap-1.5',
                active === item.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50']">
              <ChevronRight :size="12" v-if="active === item.id" /><span>{{ item.label }}</span>
            </button>
          </div>
        </nav>
      </aside>
      <div v-if="mobileNav" class="fixed inset-0 z-10 bg-black/30 lg:hidden" @click="mobileNav = false" />

      <!-- Content -->
      <div class="grow overflow-y-auto">
        <div class="max-w-5xl mx-auto px-4 lg:px-8 py-6 space-y-6">

          <!-- ═══════════ JsonSchemaEditor: Basic ═══════════ -->
          <template v-if="active === 'editor'">
            <div>
              <h1 class="text-2xl font-bold mb-1">JsonSchemaEditor</h1>
              <p class="text-muted-foreground">Full-featured schema editor combining a visual builder with a live JSON code view. Supports nested objects, arrays, validation constraints, and all JSON Schema types.</p>
            </div>
            <div>
              <h2 class="text-lg font-semibold mb-2">Props</h2>
              <div class="border rounded-md overflow-x-auto text-sm">
                <table class="w-full"><thead class="bg-muted/40"><tr><th class="text-left px-3 py-2 font-medium">Name</th><th class="text-left px-3 py-2 font-medium">Type</th><th class="text-left px-3 py-2 font-medium">Default</th><th class="text-left px-3 py-2 font-medium">Description</th></tr></thead>
                <tbody><tr v-for="p in editorProps" :key="p.name" class="border-t border-border/30"><td class="px-3 py-2 font-mono text-xs text-primary">{{ p.name }}</td><td class="px-3 py-2 font-mono text-xs">{{ p.type }}</td><td class="px-3 py-2 font-mono text-xs text-muted-foreground">{{ p.def }}</td><td class="px-3 py-2">{{ p.desc }}</td></tr></tbody></table>
              </div>
            </div>
            <div>
              <h2 class="text-lg font-semibold mb-2">Events</h2>
              <div class="border rounded-md overflow-x-auto text-sm">
                <table class="w-full"><thead class="bg-muted/40"><tr><th class="text-left px-3 py-2 font-medium">Name</th><th class="text-left px-3 py-2 font-medium">Payload</th><th class="text-left px-3 py-2 font-medium">Description</th></tr></thead>
                <tbody><tr v-for="e in editorEvents" :key="e.name" class="border-t border-border/30"><td class="px-3 py-2 font-mono text-xs text-primary">{{ e.name }}</td><td class="px-3 py-2 font-mono text-xs">{{ e.payload }}</td><td class="px-3 py-2">{{ e.desc }}</td></tr></tbody></table>
              </div>
            </div>
            <div>
              <h2 class="text-lg font-semibold mb-2">Live Demo</h2>
              <div class="border rounded-md overflow-hidden" style="height:520px"><JsonSchemaEditor :schema="schema" @update:schema="schema = $event" class="h-full" /></div>
            </div>
            <div>
              <div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold">Usage</h2>
                <button type="button" @click="copy(code.editor)" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Check v-if="copied" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy</button>
              </div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ code.editor }}</code></pre>
            </div>
          </template>

          <!-- ═══════════ Visual Only ═══════════ -->
          <template v-if="active === 'visual-only'">
            <div>
              <h1 class="text-2xl font-bold mb-1">Visual Only</h1>
              <p class="text-muted-foreground">Hide the JSON code panel completely. Ideal for end-users who only need the visual builder.</p>
            </div>
            <div class="border rounded-md overflow-hidden" style="height:500px"><JsonSchemaEditor :schema="schema" @update:schema="schema = $event" :show-json-editor="false" class="h-full" /></div>
            <div>
              <div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold">Usage</h2>
                <button type="button" @click="copy(code['visual-only'])" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Check v-if="copied" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy</button>
              </div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ code["visual-only"] }}</code></pre>
            </div>
          </template>

          <!-- ═══════════ Read-Only ═══════════ -->
          <template v-if="active === 'readonly'">
            <div>
              <h1 class="text-2xl font-bold mb-1">Read-Only Mode</h1>
              <p class="text-muted-foreground">Display a schema without allowing modifications. All controls, type pickers, and field actions are hidden.</p>
            </div>
            <div class="border rounded-md overflow-hidden" style="height:500px"><JsonSchemaEditor :schema="schema" :read-only="true" class="h-full" /></div>
            <div>
              <div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold">Usage</h2>
                <button type="button" @click="copy(code.readonly)" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Check v-if="copied" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy</button>
              </div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ code.readonly }}</code></pre>
            </div>
          </template>

          <!-- ═══════════ No Fullscreen ═══════════ -->
          <template v-if="active === 'no-fullscreen'">
            <div>
              <h1 class="text-2xl font-bold mb-1">No Fullscreen Toggle</h1>
              <p class="text-muted-foreground">Hide the fullscreen button for embedded contexts where fullscreen doesn't make sense.</p>
            </div>
            <div class="border rounded-md overflow-hidden" style="height:500px"><JsonSchemaEditor :schema="schema" @update:schema="schema = $event" :show-fullscreen="false" class="h-full" /></div>
            <div>
              <div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold">Usage</h2>
                <button type="button" @click="copy(code['no-fullscreen'])" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Check v-if="copied" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy</button>
              </div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ code["no-fullscreen"] }}</code></pre>
            </div>
          </template>

          <!-- ═══════════ Textbox Sync ═══════════ -->
          <template v-if="active === 'textbox-sync'">
            <div>
              <h1 class="text-2xl font-bold mb-1">Textbox Sync</h1>
              <p class="text-muted-foreground">The <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">update:schema</code> event keeps any external view in sync. Here a plain textarea mirrors every schema change.</p>
            </div>
            <div class="grid lg:grid-cols-2 gap-4">
              <div class="border rounded-md overflow-hidden" style="height:480px"><JsonSchemaEditor :schema="schema" @update:schema="schema = $event" :show-json-editor="false" :show-fullscreen="false" class="h-full" /></div>
              <textarea :value="schemaText" readonly class="border rounded-md bg-muted/20 p-3 text-xs font-mono resize-none h-[480px] w-full focus:outline-none" />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold">Usage</h2>
                <button type="button" @click="copy(code['textbox-sync'])" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Check v-if="copied" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy</button>
              </div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ code["textbox-sync"] }}</code></pre>
            </div>
          </template>

          <!-- ═══════════ SchemaInferencer: Popup ═══════════ -->
          <template v-if="active === 'infer-popup'">
            <div>
              <h1 class="text-2xl font-bold mb-1">SchemaInferencer — Popup</h1>
              <p class="text-muted-foreground">Open as a dialog, paste JSON, and get a schema. The inferred schema feeds a separate <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">JsonSchemaEditor</code> — the two components are fully independent.</p>
            </div>
            <div><h2 class="text-lg font-semibold mb-2">Props</h2>
              <div class="border rounded-md overflow-x-auto text-sm"><table class="w-full"><thead class="bg-muted/40"><tr><th class="text-left px-3 py-2 font-medium">Name</th><th class="text-left px-3 py-2 font-medium">Type</th><th class="text-left px-3 py-2 font-medium">Default</th><th class="text-left px-3 py-2 font-medium">Description</th></tr></thead>
              <tbody><tr v-for="p in inferProps" :key="p.name" class="border-t border-border/30"><td class="px-3 py-2 font-mono text-xs text-primary">{{ p.name }}</td><td class="px-3 py-2 font-mono text-xs">{{ p.type }}</td><td class="px-3 py-2 font-mono text-xs text-muted-foreground">{{ p.def }}</td><td class="px-3 py-2">{{ p.desc }}</td></tr></tbody></table></div>
            </div>
            <div><h2 class="text-lg font-semibold mb-2">Events</h2>
              <div class="border rounded-md overflow-x-auto text-sm"><table class="w-full"><thead class="bg-muted/40"><tr><th class="text-left px-3 py-2 font-medium">Name</th><th class="text-left px-3 py-2 font-medium">Payload</th><th class="text-left px-3 py-2 font-medium">Description</th></tr></thead>
              <tbody><tr v-for="e in inferEvents" :key="e.name" class="border-t border-border/30"><td class="px-3 py-2 font-mono text-xs text-primary">{{ e.name }}</td><td class="px-3 py-2 font-mono text-xs">{{ e.payload }}</td><td class="px-3 py-2">{{ e.desc }}</td></tr></tbody></table></div>
            </div>
            <div>
              <h2 class="text-lg font-semibold mb-2">Live Demo</h2>
              <button type="button" @click="inferDialogOpen = true" class="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors mb-3">Open Inferencer</button>
              <div v-if="Object.keys((inferSchema as any).properties || {}).length" class="border rounded-md overflow-hidden" style="height:400px"><JsonSchemaEditor :schema="inferSchema" :read-only="true" class="h-full" /></div>
              <p v-else class="text-sm text-muted-foreground italic">The inferred schema will appear here.</p>
              <SchemaInferencer :visible="inferDialogOpen" @update:visible="inferDialogOpen = $event" @schema-inferred="inferSchema = $event" />
            </div>
            <div><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold">Usage</h2>
              <button type="button" @click="copy(code['infer-popup'])" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Check v-if="copied" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy</button></div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ code["infer-popup"] }}</code></pre>
            </div>
          </template>

          <!-- ═══════════ SchemaInferencer: Inline ═══════════ -->
          <template v-if="active === 'infer-inline'">
            <div>
              <h1 class="text-2xl font-bold mb-1">SchemaInferencer — Inline</h1>
              <p class="text-muted-foreground">Omit the <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">:visible</code> prop to render inline. Here the inferred schema feeds a separate editor below.</p>
            </div>
            <div class="grid lg:grid-cols-2 gap-4">
              <div>
                <h3 class="text-sm font-medium mb-2 text-muted-foreground">1. Paste JSON</h3>
                <SchemaInferencer @schema-inferred="inferSchema = $event" />
              </div>
              <div>
                <h3 class="text-sm font-medium mb-2 text-muted-foreground">2. Resulting schema</h3>
                <div class="border rounded-md overflow-hidden" style="height:368px"><JsonSchemaEditor :schema="inferSchema" @update:schema="inferSchema = $event" :show-json-editor="false" :show-fullscreen="false" class="h-full" /></div>
              </div>
            </div>
            <div><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold">Usage</h2>
              <button type="button" @click="copy(code['infer-inline'])" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Check v-if="copied" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy</button></div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ code["infer-inline"] }}</code></pre>
            </div>
          </template>

          <!-- ═══════════ SchemaInferencer: Utility ═══════════ -->
          <template v-if="active === 'infer-util'">
            <div>
              <h1 class="text-2xl font-bold mb-1">createSchemaFromJson()</h1>
              <p class="text-muted-foreground">A pure function — no Vue required. Pass any JavaScript object and get a JSON Schema back.</p>
            </div>
            <div class="grid lg:grid-cols-2 gap-4">
              <div>
                <h3 class="text-sm font-medium mb-2 text-muted-foreground">Input (JSON)</h3>
                <textarea v-model="utilInput" class="border rounded-md bg-background p-3 text-xs font-mono resize-none h-40 w-full" />
                <button type="button" @click="runInfer" class="mt-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Run</button>
              </div>
              <div>
                <h3 class="text-sm font-medium mb-2 text-muted-foreground">Output (Schema)</h3>
                <pre class="border rounded-md bg-muted/30 p-3 text-xs font-mono h-40 overflow-auto">{{ utilOutput || 'Press Run' }}</pre>
              </div>
            </div>
            <div><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold">Usage</h2>
              <button type="button" @click="copy(code['infer-util'])" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Check v-if="copied" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy</button></div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ code["infer-util"] }}</code></pre>
            </div>
          </template>

          <!-- ═══════════ JsonValidator: Popup ═══════════ -->
          <template v-if="active === 'validator-popup'">
            <div>
              <h1 class="text-2xl font-bold mb-1">JsonValidator — Popup</h1>
              <p class="text-muted-foreground">Open as a dialog, paste a JSON document, and validate it against any schema. Displays inline errors with field paths.</p>
            </div>
            <div><h2 class="text-lg font-semibold mb-2">Props</h2>
              <div class="border rounded-md overflow-x-auto text-sm"><table class="w-full"><thead class="bg-muted/40"><tr><th class="text-left px-3 py-2 font-medium">Name</th><th class="text-left px-3 py-2 font-medium">Type</th><th class="text-left px-3 py-2 font-medium">Default</th><th class="text-left px-3 py-2 font-medium">Description</th></tr></thead>
              <tbody><tr v-for="p in validatorPropsTable" :key="p.name" class="border-t border-border/30"><td class="px-3 py-2 font-mono text-xs text-primary">{{ p.name }}</td><td class="px-3 py-2 font-mono text-xs">{{ p.type }}</td><td class="px-3 py-2 font-mono text-xs text-muted-foreground">{{ p.def }}</td><td class="px-3 py-2">{{ p.desc }}</td></tr></tbody></table></div>
            </div>
            <div><h2 class="text-lg font-semibold mb-2">Events</h2>
              <div class="border rounded-md overflow-x-auto text-sm"><table class="w-full"><thead class="bg-muted/40"><tr><th class="text-left px-3 py-2 font-medium">Name</th><th class="text-left px-3 py-2 font-medium">Payload</th><th class="text-left px-3 py-2 font-medium">Description</th></tr></thead>
              <tbody><tr v-for="e in validatorEventsTable" :key="e.name" class="border-t border-border/30"><td class="px-3 py-2 font-mono text-xs text-primary">{{ e.name }}</td><td class="px-3 py-2 font-mono text-xs">{{ e.payload }}</td><td class="px-3 py-2">{{ e.desc }}</td></tr></tbody></table></div>
            </div>
            <div>
              <h2 class="text-lg font-semibold mb-2">Live Demo</h2>
              <button type="button" @click="validatorDialogOpen = true" class="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Open Validator</button>
              <p class="text-sm text-muted-foreground mt-2">Validates against the schema from the JsonSchemaEditor section.</p>
              <JsonValidator :visible="validatorDialogOpen" @update:visible="validatorDialogOpen = $event" :schema="schema" />
            </div>
            <div><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold">Usage</h2>
              <button type="button" @click="copy(code['validator-popup'])" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Check v-if="copied" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy</button></div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ code["validator-popup"] }}</code></pre>
            </div>
          </template>

          <!-- ═══════════ JsonValidator: Inline ═══════════ -->
          <template v-if="active === 'validator-inline'">
            <div>
              <h1 class="text-2xl font-bold mb-1">JsonValidator — Inline</h1>
              <p class="text-muted-foreground">Omit the <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">:visible</code> prop to render inline. Validates against the schema from the main editor.</p>
            </div>
            <JsonValidator :schema="schema" />
            <div><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold">Usage</h2>
              <button type="button" @click="copy(code['validator-inline'])" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Check v-if="copied" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy</button></div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ code["validator-inline"] }}</code></pre>
            </div>
          </template>

          <!-- ═══════════ JsonValidator: Utility ═══════════ -->
          <template v-if="active === 'validator-util'">
            <div>
              <h1 class="text-2xl font-bold mb-1">validateJson()</h1>
              <p class="text-muted-foreground">A pure function — no Vue required. Validates a JSON string against a schema and returns structured errors.</p>
            </div>
            <div class="grid lg:grid-cols-2 gap-4">
              <div>
                <h3 class="text-sm font-medium mb-2 text-muted-foreground">Input (JSON to validate)</h3>
                <textarea v-model="validUtilInput" class="border rounded-md bg-background p-3 text-xs font-mono resize-none h-40 w-full" />
                <button type="button" @click="runValidate" class="mt-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Validate</button>
              </div>
              <div>
                <h3 class="text-sm font-medium mb-2 text-muted-foreground">Result</h3>
                <pre class="border rounded-md bg-muted/30 p-3 text-xs font-mono h-40 overflow-auto whitespace-pre-wrap">{{ validUtilOutput || 'Press Validate' }}</pre>
              </div>
            </div>
            <div><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold">Usage</h2>
              <button type="button" @click="copy(code['validator-util'])" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Check v-if="copied" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy</button></div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ code["validator-util"] }}</code></pre>
            </div>
          </template>

          <!-- ═══════════ Localization ═══════════ -->
          <template v-if="active === 'i18n'">
            <div>
              <h1 class="text-2xl font-bold mb-1">Localization</h1>
              <p class="text-muted-foreground">
                All components share a reactive translation context via Vue's
                <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">provide</code> /
                <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">inject</code>.
                Provide a <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">Ref&lt;Translation&gt;</code> and change its value to switch languages at runtime — every label updates instantly.
              </p>
            </div>
            <div>
              <h2 class="text-lg font-semibold mb-2">Available Locales</h2>
              <div class="flex flex-wrap gap-2">
                <button v-for="lang in langs" :key="lang.value" type="button" @click="switchLang(lang.value)"
                  :class="['px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                    currentLang === lang.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted/50']">
                  {{ lang.label }}
                </button>
              </div>
            </div>
            <div>
              <h2 class="text-lg font-semibold mb-2">Live Demo</h2>
              <p class="text-sm text-muted-foreground mb-3">Select a locale above and see all labels update instantly.</p>
              <div class="border rounded-md overflow-hidden" style="height:480px"><JsonSchemaEditor :schema="schema" @update:schema="schema = $event" class="h-full" /></div>
            </div>
            <div><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold">Usage</h2>
              <button type="button" @click="copy(code.i18n)" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><Check v-if="copied" :size="12" class="text-green-500" /><Clipboard v-else :size="12" /> Copy</button></div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ code.i18n }}</code></pre>
            </div>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>
