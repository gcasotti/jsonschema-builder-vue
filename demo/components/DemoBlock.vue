<script setup lang="ts">
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import { Check, Clipboard, Code2, Eye } from "lucide-vue-next";
import Tab from "primevue/tab";
import TabList from "primevue/tablist";
import TabPanel from "primevue/tabpanel";
import TabPanels from "primevue/tabpanels";
import Tabs from "primevue/tabs";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import "highlight.js/styles/github.min.css";

hljs.registerLanguage("xml", xml);
hljs.registerLanguage("typescript", typescript);

const props = withDefaults(
  defineProps<{
    code: string;
    language?: string;
  }>(),
  { language: "vue" },
);

const copiedId = ref(false);
const resultEl = ref<HTMLElement | null>(null);
const cachedHeight = ref(400);

// Track result panel height with ResizeObserver
let observer: ResizeObserver | null = null;

watch(resultEl, (el, _, onCleanup) => {
  if (el) {
    observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (h > 0) cachedHeight.value = h;
      }
    });
    observer.observe(el);
    // Immediate measure
    if (el.offsetHeight > 0) cachedHeight.value = el.offsetHeight;

    onCleanup(() => {
      observer?.disconnect();
      observer = null;
    });
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

const highlightedCode = computed(() => {
  const lang = props.language === "vue" ? "xml" : props.language;
  try {
    return hljs.highlight(props.code.trim(), { language: lang }).value;
  } catch {
    return props.code.trim();
  }
});

const copyCode = () => {
  navigator.clipboard.writeText(props.code.trim());
  copiedId.value = true;
  setTimeout(() => {
    copiedId.value = false;
  }, 1500);
};
</script>

<template>
  <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-white">
    <Tabs value="result">
      <div class="flex items-center justify-between border-b border-border/30 bg-gray-50/60">
        <TabList
          :pt="{
            root: { style: 'border: none; background: transparent; padding: 0 0.5rem;' },
            tabs: { style: 'background: transparent;' },
          }"
        >
          <Tab
            value="result"
            :pt="{
              root: { style: 'padding: 0.625rem 0.875rem; font-size: 0.8125rem; font-weight: 600;' },
            }"
          >
            <div class="flex items-center gap-1.5">
              <Eye :size="13" />
              Result
            </div>
          </Tab>
          <Tab
            value="code"
            :pt="{
              root: { style: 'padding: 0.625rem 0.875rem; font-size: 0.8125rem; font-weight: 600;' },
            }"
          >
            <div class="flex items-center gap-1.5">
              <Code2 :size="13" />
              Code
            </div>
          </Tab>
        </TabList>

        <button
          type="button"
          @click="copyCode"
          class="mr-3 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
        >
          <Check v-if="copiedId" :size="12" class="text-green-500" />
          <Clipboard v-else :size="12" />
          Copy
        </button>
      </div>

      <TabPanels>
        <TabPanel value="result">
          <div ref="resultEl">
            <slot />
          </div>
        </TabPanel>
        <TabPanel value="code">
          <div
            class="overflow-auto bg-[#f6f8fa]"
            :style="{ height: cachedHeight + 'px' }"
          >
            <pre class="px-5 py-4 text-[13px] leading-relaxed"><code class="hljs" v-html="highlightedCode" /></pre>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
