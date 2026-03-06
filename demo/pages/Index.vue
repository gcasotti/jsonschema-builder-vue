<script setup lang="ts">
import {
  Clipboard,
  Check,
  GitBranch,
  Globe,
  Package,
  User,
  ChevronRight,
  Menu,
  X,
} from "lucide-vue-next";
import { ref, computed, watch, nextTick } from "vue";
import { exampleSchema } from "../utils/schemaExample.ts";
import JsonValidator from "../../src/components/features/JsonValidator.vue";
import SchemaInferencer from "../../src/components/features/SchemaInferencer.vue";
import JsonSchemaEditor from "../../src/components/SchemaEditor/JsonSchemaEditor.vue";
import { en } from "../../src/i18n/locales/en.ts";
import { provideTranslation } from "../../src/i18n/translation-context.ts";
import type { Translation } from "../../src/i18n/translation-keys.ts";
import type { JSONSchema } from "../../src/types/jsonSchema.ts";

// ── State ──
const schema = ref<JSONSchema>(exampleSchema);
const inferSchema = ref<JSONSchema>({ type: "object", properties: {} });
const translation = ref<Translation>(en);
provideTranslation(translation.value);

// ── Interactive prop controls ──
const editorReadOnly = ref(false);
const validatorOpen = ref(false);
const inferencerOpen = ref(false);
const i18nLang = ref("en");

const langOptions = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "ru", label: "Русский" },
  { value: "uk", label: "Українська" },
  { value: "es", label: "Español" },
  { value: "zh", label: "中文" },
  { value: "pl", label: "Polski" },
];

const handleLangChange = (val: string) => {
  i18nLang.value = val;
  import(`../../src/i18n/locales/${val}.ts`).then((m) => {
    translation.value = m[val];
  });
};

// ── Sidebar ──
type Section = {
  id: string;
  label: string;
  group?: string;
};

const sections: Section[] = [
  { id: "editor",     label: "JsonSchemaEditor", group: "Components" },
  { id: "readonly",   label: "Read-Only Mode",   group: "Components" },
  { id: "inferencer", label: "SchemaInferencer",  group: "Components" },
  { id: "validator",  label: "JsonValidator",     group: "Components" },
  { id: "i18n",       label: "Localization",      group: "Configuration" },
];

const groups = computed(() => {
  const map = new Map<string, Section[]>();
  for (const s of sections) {
    const g = s.group || "";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(s);
  }
  return [...map.entries()];
});

const activeSection = ref("editor");
const mobileNav = ref(false);

const navigate = (id: string) => {
  activeSection.value = id;
  mobileNav.value = false;
};

// ── Copy ──
const copied = ref(false);
const copyCode = (code: string) => {
  navigator.clipboard.writeText(code);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 1500);
};

// ── Code snippets ──
const snippets: Record<string, string> = {
  editor: `<script setup>
import { ref } from 'vue'
import { JsonSchemaEditor } from 'jsonjoy-builder-vue'

const schema = ref({ type: 'object', properties: {} })
<\/script>

<template>
  <JsonSchemaEditor v-model:schema="schema" />
</template>`,
  readonly: `<JsonSchemaEditor
  :schema="schema"
  :read-only="true"
/>`,
  inferencer: `<script setup>
import { ref } from 'vue'
import { SchemaInferencer } from 'jsonjoy-builder-vue'

const visible = ref(false)
<\/script>

<template>
  <button @click="visible = true">Infer Schema</button>
  <SchemaInferencer
    v-model:visible="visible"
    @schema-inferred="schema = $event"
  />
</template>`,
  validator: `<script setup>
import { ref } from 'vue'
import { JsonValidator } from 'jsonjoy-builder-vue'

const visible = ref(false)
<\/script>

<template>
  <button @click="visible = true">Validate</button>
  <JsonValidator
    v-model:visible="visible"
    :schema="schema"
  />
</template>`,
  i18n: `<script setup>
import { provideTranslation } from 'jsonjoy-builder-vue'
import { de } from 'jsonjoy-builder-vue/i18n/locales/de'

// Call once in your app root or layout
provideTranslation(de)
<\/script>`,
};

// ── Prop tables ──
type Prop = { name: string; type: string; default: string; desc: string };

const editorProps: Prop[] = [
  { name: "schema",    type: "JSONSchema",     default: "{ type: 'object' }", desc: "The JSON Schema object to edit." },
  { name: "readOnly",  type: "boolean",        default: "false",              desc: "When true, the schema cannot be modified." },
  { name: "class",     type: "string",         default: "—",                  desc: "Additional CSS classes for the root element." },
];
const editorEvents = [
  { name: "update:schema", payload: "JSONSchema", desc: "Emitted whenever the schema is modified." },
];

const inferencerProps: Prop[] = [
  { name: "visible", type: "boolean", default: "false",  desc: "Controls dialog visibility." },
];
const inferencerEvents = [
  { name: "update:visible",  payload: "boolean",    desc: "Emitted when the dialog opens or closes." },
  { name: "schemaInferred",  payload: "JSONSchema",  desc: "Emitted with the inferred schema." },
];

const validatorProps: Prop[] = [
  { name: "schema",  type: "JSONSchema", default: "—",     desc: "The schema to validate against." },
  { name: "visible", type: "boolean",    default: "false",  desc: "Controls dialog visibility." },
];
const validatorEvents = [
  { name: "update:visible", payload: "boolean", desc: "Emitted when the dialog opens or closes." },
];

const authorLinks = [
  { href: "https://github.com/gcasotti", text: "@gcasotti", icon: User },
  { href: "https://github.com/gcasotti/jsonjoy-builder-vue", text: "GitHub", icon: GitBranch },
  { href: "https://www.npmjs.com/package/jsonjoy-builder-vue", text: "NPM", icon: Package },
];
</script>

<template>
  <div class="min-h-screen bg-background jsonjoy flex flex-col">
    <!-- Top bar -->
    <header class="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 shrink-0">
      <div class="px-4 lg:px-6 h-12 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button type="button" class="lg:hidden p-1" @click="mobileNav = !mobileNav">
            <Menu :size="18" />
          </button>
          <span class="font-semibold tracking-tight">jsonjoy-builder-vue</span>
          <span class="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">docs</span>
        </div>
        <div class="flex items-center gap-1">
          <a
            v-for="link in authorLinks" :key="link.href"
            :href="link.href" target="_blank" rel="nofollow noopener noreferrer"
            class="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-1.5 py-1"
          >
            <component :is="link.icon" :size="13" />
            <span class="hidden sm:inline">{{ link.text }}</span>
          </a>
        </div>
      </div>
    </header>

    <div class="flex grow min-h-0">
      <!-- Sidebar -->
      <aside
        :class="[
          'shrink-0 border-r border-border/40 bg-muted/20 overflow-y-auto',
          'fixed inset-y-12 left-0 z-20 w-56 transition-transform lg:relative lg:inset-auto lg:translate-x-0 lg:w-52',
          mobileNav ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <nav class="py-4 px-3 space-y-4 text-sm">
          <div v-for="[group, items] in groups" :key="group">
            <p class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 px-2">{{ group }}</p>
            <button
              v-for="item in items" :key="item.id"
              type="button"
              @click="navigate(item.id)"
              :class="[
                'w-full text-left px-2 py-1.5 rounded-md transition-colors flex items-center gap-1.5',
                activeSection === item.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              ]"
            >
              <ChevronRight :size="12" v-if="activeSection === item.id" />
              <span>{{ item.label }}</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- Mobile overlay -->
      <div
        v-if="mobileNav"
        class="fixed inset-0 z-10 bg-black/30 lg:hidden"
        @click="mobileNav = false"
      />

      <!-- Main content -->
      <div class="grow overflow-y-auto">
        <div class="max-w-5xl mx-auto px-4 lg:px-8 py-6 space-y-6">

          <!-- ═══ JsonSchemaEditor ═══ -->
          <template v-if="activeSection === 'editor'">
            <div>
              <h1 class="text-2xl font-bold mb-1">JsonSchemaEditor</h1>
              <p class="text-muted-foreground">
                A full-featured JSON Schema editor combining a visual drag-and-drop builder with a live JSON code view.
                Supports nested objects, arrays, validation constraints, and all standard JSON Schema types.
              </p>
            </div>

            <!-- Props table -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Props</h2>
              <div class="border rounded-md overflow-hidden text-sm">
                <table class="w-full">
                  <thead class="bg-muted/40"><tr><th class="text-left px-3 py-2 font-medium">Name</th><th class="text-left px-3 py-2 font-medium">Type</th><th class="text-left px-3 py-2 font-medium">Default</th><th class="text-left px-3 py-2 font-medium">Description</th></tr></thead>
                  <tbody>
                    <tr v-for="p in editorProps" :key="p.name" class="border-t border-border/30">
                      <td class="px-3 py-2 font-mono text-xs text-primary">{{ p.name }}</td>
                      <td class="px-3 py-2 font-mono text-xs">{{ p.type }}</td>
                      <td class="px-3 py-2 font-mono text-xs text-muted-foreground">{{ p.default }}</td>
                      <td class="px-3 py-2">{{ p.desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Events table -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Events</h2>
              <div class="border rounded-md overflow-hidden text-sm">
                <table class="w-full">
                  <thead class="bg-muted/40"><tr><th class="text-left px-3 py-2 font-medium">Name</th><th class="text-left px-3 py-2 font-medium">Payload</th><th class="text-left px-3 py-2 font-medium">Description</th></tr></thead>
                  <tbody>
                    <tr v-for="e in editorEvents" :key="e.name" class="border-t border-border/30">
                      <td class="px-3 py-2 font-mono text-xs text-primary">{{ e.name }}</td>
                      <td class="px-3 py-2 font-mono text-xs">{{ e.payload }}</td>
                      <td class="px-3 py-2">{{ e.desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Live demo -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Live Demo</h2>
              <div class="border rounded-md overflow-hidden" style="height: 520px">
                <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" class="h-full" />
              </div>
            </div>

            <!-- Code -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-lg font-semibold">Usage</h2>
                <button type="button" @click="copyCode(snippets.editor)" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Check v-if="copied" :size="12" class="text-green-500" /> <Clipboard v-else :size="12" /> Copy
                </button>
              </div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ snippets.editor }}</code></pre>
            </div>
          </template>

          <!-- ═══ Read-Only Mode ═══ -->
          <template v-if="activeSection === 'readonly'">
            <div>
              <h1 class="text-2xl font-bold mb-1">Read-Only Mode</h1>
              <p class="text-muted-foreground">
                Set <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">read-only</code> to
                <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">true</code>
                to display a schema without allowing any modifications. All controls, type pickers, and field actions are hidden.
              </p>
            </div>

            <!-- Interactive control -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Try it</h2>
              <div class="flex items-center gap-3 mb-3">
                <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input type="checkbox" v-model="editorReadOnly" class="rounded" />
                  <span><code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">:read-only="{{ editorReadOnly }}"</code></span>
                </label>
              </div>
              <div class="border rounded-md overflow-hidden" style="height: 480px">
                <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" :read-only="editorReadOnly" class="h-full" />
              </div>
            </div>

            <!-- Code -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-lg font-semibold">Usage</h2>
                <button type="button" @click="copyCode(snippets.readonly)" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Check v-if="copied" :size="12" class="text-green-500" /> <Clipboard v-else :size="12" /> Copy
                </button>
              </div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ snippets.readonly }}</code></pre>
            </div>
          </template>

          <!-- ═══ SchemaInferencer ═══ -->
          <template v-if="activeSection === 'inferencer'">
            <div>
              <h1 class="text-2xl font-bold mb-1">SchemaInferencer</h1>
              <p class="text-muted-foreground">
                A dialog component that accepts a raw JSON document and automatically generates the corresponding JSON Schema.
                Useful for bootstrapping schemas from existing API responses or sample data.
              </p>
            </div>

            <!-- Props -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Props</h2>
              <div class="border rounded-md overflow-hidden text-sm">
                <table class="w-full">
                  <thead class="bg-muted/40"><tr><th class="text-left px-3 py-2 font-medium">Name</th><th class="text-left px-3 py-2 font-medium">Type</th><th class="text-left px-3 py-2 font-medium">Default</th><th class="text-left px-3 py-2 font-medium">Description</th></tr></thead>
                  <tbody>
                    <tr v-for="p in inferencerProps" :key="p.name" class="border-t border-border/30">
                      <td class="px-3 py-2 font-mono text-xs text-primary">{{ p.name }}</td><td class="px-3 py-2 font-mono text-xs">{{ p.type }}</td><td class="px-3 py-2 font-mono text-xs text-muted-foreground">{{ p.default }}</td><td class="px-3 py-2">{{ p.desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Events -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Events</h2>
              <div class="border rounded-md overflow-hidden text-sm">
                <table class="w-full">
                  <thead class="bg-muted/40"><tr><th class="text-left px-3 py-2 font-medium">Name</th><th class="text-left px-3 py-2 font-medium">Payload</th><th class="text-left px-3 py-2 font-medium">Description</th></tr></thead>
                  <tbody>
                    <tr v-for="e in inferencerEvents" :key="e.name" class="border-t border-border/30">
                      <td class="px-3 py-2 font-mono text-xs text-primary">{{ e.name }}</td><td class="px-3 py-2 font-mono text-xs">{{ e.payload }}</td><td class="px-3 py-2">{{ e.desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Live demo -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Live Demo</h2>
              <div class="space-y-3">
                <button
                  type="button"
                  @click="inferencerOpen = true"
                  class="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Open Inferencer
                </button>
                <div v-if="Object.keys((inferSchema as any).properties || {}).length" class="border rounded-md overflow-hidden" style="height: 400px">
                  <JsonSchemaEditor :schema="inferSchema" @update:schema="inferSchema = $event" class="h-full" />
                </div>
                <p v-else class="text-sm text-muted-foreground italic">Inferred schema will appear here.</p>
              </div>
              <SchemaInferencer :visible="inferencerOpen" @update:visible="inferencerOpen = $event" @schema-inferred="inferSchema = $event" />
            </div>

            <!-- Code -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-lg font-semibold">Usage</h2>
                <button type="button" @click="copyCode(snippets.inferencer)" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Check v-if="copied" :size="12" class="text-green-500" /> <Clipboard v-else :size="12" /> Copy
                </button>
              </div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ snippets.inferencer }}</code></pre>
            </div>
          </template>

          <!-- ═══ JsonValidator ═══ -->
          <template v-if="activeSection === 'validator'">
            <div>
              <h1 class="text-2xl font-bold mb-1">JsonValidator</h1>
              <p class="text-muted-foreground">
                A dialog component that validates a JSON document against a given schema.
                Displays inline errors with line numbers and field paths.
              </p>
            </div>

            <!-- Props -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Props</h2>
              <div class="border rounded-md overflow-hidden text-sm">
                <table class="w-full">
                  <thead class="bg-muted/40"><tr><th class="text-left px-3 py-2 font-medium">Name</th><th class="text-left px-3 py-2 font-medium">Type</th><th class="text-left px-3 py-2 font-medium">Default</th><th class="text-left px-3 py-2 font-medium">Description</th></tr></thead>
                  <tbody>
                    <tr v-for="p in validatorProps" :key="p.name" class="border-t border-border/30">
                      <td class="px-3 py-2 font-mono text-xs text-primary">{{ p.name }}</td><td class="px-3 py-2 font-mono text-xs">{{ p.type }}</td><td class="px-3 py-2 font-mono text-xs text-muted-foreground">{{ p.default }}</td><td class="px-3 py-2">{{ p.desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Events -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Events</h2>
              <div class="border rounded-md overflow-hidden text-sm">
                <table class="w-full">
                  <thead class="bg-muted/40"><tr><th class="text-left px-3 py-2 font-medium">Name</th><th class="text-left px-3 py-2 font-medium">Payload</th><th class="text-left px-3 py-2 font-medium">Description</th></tr></thead>
                  <tbody>
                    <tr v-for="e in validatorEvents" :key="e.name" class="border-t border-border/30">
                      <td class="px-3 py-2 font-mono text-xs text-primary">{{ e.name }}</td><td class="px-3 py-2 font-mono text-xs">{{ e.payload }}</td><td class="px-3 py-2">{{ e.desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Live demo -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Live Demo</h2>
              <button
                type="button"
                @click="validatorOpen = true"
                class="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Open Validator
              </button>
              <p class="text-sm text-muted-foreground mt-2">The validator will use the schema from the <strong>JsonSchemaEditor</strong> section.</p>
              <JsonValidator :visible="validatorOpen" @update:visible="validatorOpen = $event" :schema="schema" />
            </div>

            <!-- Code -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-lg font-semibold">Usage</h2>
                <button type="button" @click="copyCode(snippets.validator)" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Check v-if="copied" :size="12" class="text-green-500" /> <Clipboard v-else :size="12" /> Copy
                </button>
              </div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ snippets.validator }}</code></pre>
            </div>
          </template>

          <!-- ═══ Localization ═══ -->
          <template v-if="activeSection === 'i18n'">
            <div>
              <h1 class="text-2xl font-bold mb-1">Localization</h1>
              <p class="text-muted-foreground">
                All components share a single translation context provided via Vue's
                <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">provide</code> /
                <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">inject</code>.
                Switch languages at runtime by calling
                <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">provideTranslation()</code>
                with a different locale object.
              </p>
            </div>

            <!-- Available locales -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Available Locales</h2>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="lang in langOptions" :key="lang.value"
                  type="button"
                  @click="handleLangChange(lang.value)"
                  :class="[
                    'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                    i18nLang === lang.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted/50'
                  ]"
                >
                  {{ lang.label }}
                </button>
              </div>
            </div>

            <!-- Live demo -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Live Demo</h2>
              <p class="text-sm text-muted-foreground mb-3">
                Select a locale above and see the editor labels update instantly.
              </p>
              <div class="border rounded-md overflow-hidden" style="height: 480px">
                <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" class="h-full" />
              </div>
            </div>

            <!-- Code -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-lg font-semibold">Usage</h2>
                <button type="button" @click="copyCode(snippets.i18n)" class="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Check v-if="copied" :size="12" class="text-green-500" /> <Clipboard v-else :size="12" /> Copy
                </button>
              </div>
              <pre class="border rounded-md bg-muted/30 px-4 py-3 text-[13px] font-mono leading-relaxed overflow-x-auto"><code>{{ snippets.i18n }}</code></pre>
            </div>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>
