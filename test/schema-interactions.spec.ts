import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import SchemaVisualEditor from "../src/components/SchemaEditor/SchemaVisualEditor.vue";
import {
  createSchemaStore,
  SchemaStoreKey,
} from "../src/hooks/useSchemaStore.ts";
import { en } from "../src/i18n/locales/en.ts";
import { TranslationKey } from "../src/i18n/translation-context.ts";
import type { JSONSchema } from "../src/types/jsonSchema.ts";

const TIMEOUT = 5000;

function mountWithStore(component: any, options: any = {}) {
  const schema = options.storeSchema || { type: "object", properties: {} };
  const store = createSchemaStore(schema);
  const wrapper = mount(component, {
    ...options,
    global: {
      ...(options.global || {}),
      plugins: [...(options.global?.plugins || []), PrimeVue],
      directives: { tooltip: Tooltip },
      provide: {
        ...(options.global?.provide || {}),
        [TranslationKey as symbol]: en,
        [SchemaStoreKey as symbol]: store,
      },
    },
  });
  return { wrapper, store };
}

describe("Schema Interactions", () => {
  it(
    "should allow changing the type of a property without infinite looping",
    { timeout: TIMEOUT },
    async () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          person: {
            type: "object",
            properties: { name: { type: "string" } },
          },
        },
      };
      const { wrapper, store } = mountWithStore(SchemaVisualEditor, {
        storeSchema: schema,
      });

      // Wait for all async sub-components to load
      await new Promise((resolve) => setTimeout(resolve, 500));
      await nextTick();

      // Find the "person" property type dropdown trigger (using basic text match)
      const typeButtons = wrapper
        .findAll("button")
        .filter((b) => b.text().includes("Object"));
      expect(typeButtons.length).toBeGreaterThan(0);

      // Click the TypeDropdown trigger to open the menu
      await typeButtons[0].trigger("click");
      await nextTick();

      // Wait for animation frame or transition (dropdown is animated)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Now find the "Text" option in the dropdown and click it
      const optionButtons = wrapper
        .findAll("button")
        .filter(
          (b) => b.text().includes("Text") || b.text().includes("String"),
        );
      expect(optionButtons.length).toBeGreaterThan(0);

      // The first one is likely the root "Object" option, we want the one inside the menu dropdown for "Text"
      const textOption = optionButtons[0];
      await textOption.trigger("click");

      // Give the store and vue reactivity time to settle
      await new Promise((resolve) => setTimeout(resolve, 100));
      await nextTick();

      // If we reach here, there is no infinite loop!
      expect(store.schema.value?.properties?.person?.type).toBe("string");
    },
  );
});
