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

function mountWithStore(component: any, storeSchema: JSONSchema) {
  const store = createSchemaStore(storeSchema);
  const wrapper = mount(component, {
    global: {
      plugins: [PrimeVue],
      directives: { tooltip: Tooltip },
      provide: {
        [TranslationKey as symbol]: en,
        [SchemaStoreKey as symbol]: store,
      },
    },
  });
  return { wrapper, store };
}

describe("Anti-Loop Stress Test", () => {
  it(
    "should handle 20 rapid type changes without hanging",
    { timeout: 10000 },
    async () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          field1: { type: "string" },
          field2: { type: "number" },
          field3: {
            type: "object",
            properties: { nested: { type: "string" } },
          },
        },
      };
      const { store } = mountWithStore(SchemaVisualEditor, schema);

      // Rapidly toggle between types 20 times
      const types = [
        "string",
        "number",
        "boolean",
        "object",
        "array",
        "string",
      ] as const;
      for (let i = 0; i < 20; i++) {
        const newType = types[i % types.length];
        store.updateProperty([], "field1", { type: newType });
        await nextTick();
      }

      // If we reach here, no infinite loop occurred
      const result = store.schema.value;
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    },
  );

  it(
    "should handle 10 rapid add+delete operations without hanging",
    { timeout: 10000 },
    async () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {},
      };
      const { store } = mountWithStore(SchemaVisualEditor, schema);

      for (let i = 0; i < 10; i++) {
        store.addProperty([], {
          name: `tmp${i}`,
          type: "string",
          description: "",
          required: false,
        });
        await nextTick();
        store.deleteProperty([], `tmp${i}`);
        await nextTick();
      }

      expect(
        Object.keys((store.schema.value as any).properties || {}),
      ).toHaveLength(0);
    },
  );

  it(
    "should handle nested schema modifications without looping",
    { timeout: 10000 },
    async () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          level1: {
            type: "object",
            properties: {
              level2: {
                type: "object",
                properties: {
                  deep: { type: "string" },
                },
              },
            },
          },
        },
      };
      const { store } = mountWithStore(SchemaVisualEditor, schema);

      // Modify the deep nested field type
      store.updateProperty(["level1", "level2"], "deep", { type: "number" });
      await nextTick();

      // Modify the mid-level type
      store.updateProperty(["level1"], "level2", { type: "string" });
      await nextTick();

      // Modify the top-level type
      store.updateProperty([], "level1", { type: "boolean" });
      await nextTick();

      expect((store.schema.value as any).properties.level1.type).toBe(
        "boolean",
      );
    },
  );
});
