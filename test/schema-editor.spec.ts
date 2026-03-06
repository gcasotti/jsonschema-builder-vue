import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import { describe, expect, it, vi } from "vitest";
import AddFieldButton from "../src/components/SchemaEditor/AddFieldButton.vue";
import SchemaFieldList from "../src/components/SchemaEditor/SchemaFieldList.vue";
import SchemaVisualEditor from "../src/components/SchemaEditor/SchemaVisualEditor.vue";
import {
  createSchemaStore,
  SchemaStoreKey,
} from "../src/hooks/useSchemaStore.ts";
import { en } from "../src/i18n/locales/en.ts";
import { TranslationKey } from "../src/i18n/translation-context.ts";
import type { JSONSchema, ObjectJSONSchema } from "../src/types/jsonSchema.ts";

const TIMEOUT = 5000;

function mountWithStore(component: any, options: any = {}) {
  const schema = options.storeSchema || { type: "object", properties: {} };
  const store = createSchemaStore(schema);
  return mount(component, {
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
}

describe("SchemaVisualEditor", () => {
  it("renders empty state when no properties", { timeout: TIMEOUT }, () => {
    const wrapper = mountWithStore(SchemaVisualEditor, {
      storeSchema: { type: "object", properties: {} },
    });
    expect(wrapper.text()).toContain(en.visualEditorNoFieldsHint1);
  });

  it("renders AddFieldButton when not read-only", { timeout: TIMEOUT }, () => {
    const wrapper = mountWithStore(SchemaVisualEditor, {
      props: { readOnly: false },
      storeSchema: { type: "object", properties: {} },
    });
    expect(wrapper.text()).toContain(en.fieldAddNewButton);
  });

  it(
    "does not render AddFieldButton when read-only",
    { timeout: TIMEOUT },
    () => {
      const wrapper = mountWithStore(SchemaVisualEditor, {
        props: { readOnly: true },
        storeSchema: { type: "object", properties: {} },
      });
      expect(wrapper.text()).not.toContain(en.fieldAddNewButton);
    },
  );

  it("renders properties when schema has them", { timeout: TIMEOUT }, () => {
    const schema: JSONSchema = {
      type: "object",
      properties: {
        name: { type: "string", description: "User name" },
        age: { type: "number" },
      },
      required: ["name"],
    };
    const wrapper = mountWithStore(SchemaVisualEditor, {
      storeSchema: schema,
    });
    expect(wrapper.text()).toContain("name");
    expect(wrapper.text()).toContain("age");
  });

  it(
    "deletes a field via store when delete button is clicked",
    { timeout: TIMEOUT },
    async () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
      };
      const store = createSchemaStore(schema);
      const wrapper = mount(SchemaVisualEditor, {
        props: { readOnly: false },
        global: {
          plugins: [PrimeVue],
          directives: { tooltip: Tooltip },
          provide: {
            [TranslationKey as symbol]: en,
            [SchemaStoreKey as symbol]: store,
          },
        },
      });
      const deleteButtons = wrapper
        .findAll("button[aria-label]")
        .filter((btn) => btn.attributes("aria-label") === en.propertyDelete);
      expect(deleteButtons.length).toBeGreaterThan(0);
      await deleteButtons[0].trigger("click");
      // Verify the store was updated (one property removed)
      const updatedSchema = store.schema.value as ObjectJSONSchema;
      expect(Object.keys(updatedSchema.properties || {}).length).toBe(1);
    },
  );
});

describe("AddFieldButton", () => {
  it("renders the button", { timeout: TIMEOUT }, () => {
    const wrapper = mountWithStore(AddFieldButton, {
      props: { path: [] },
      storeSchema: { type: "object", properties: {} },
    });
    expect(wrapper.text()).toContain(en.fieldAddNewButton);
  });

  it("opens dialog on click", { timeout: TIMEOUT }, async () => {
    const wrapper = mountWithStore(AddFieldButton, {
      props: { path: [] },
      storeSchema: { type: "object", properties: {} },
      attachTo: document.body,
    });
    await wrapper.find("button").trigger("click");
    expect(document.body.textContent).toContain(en.fieldAddNewLabel);
    wrapper.unmount();
  });
});

describe("SchemaFieldList", () => {
  it("renders properties from schema", { timeout: TIMEOUT }, () => {
    const schema: JSONSchema = {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        active: { type: "boolean" },
      },
      required: ["email"],
    };
    const wrapper = mountWithStore(SchemaFieldList, {
      props: { path: [] },
      storeSchema: schema,
    });
    expect(wrapper.text()).toContain("email");
    expect(wrapper.text()).toContain("active");
  });

  it("shows required status for required fields", { timeout: TIMEOUT }, () => {
    const schema: JSONSchema = {
      type: "object",
      properties: {
        email: { type: "string" },
      },
      required: ["email"],
    };
    const wrapper = mountWithStore(SchemaFieldList, {
      props: { path: [] },
      storeSchema: schema,
    });
    expect(wrapper.text()).toContain(en.propertyRequired);
  });

  it(
    "shows optional status for non-required fields",
    { timeout: TIMEOUT },
    () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          nickname: { type: "string" },
        },
      };
      const wrapper = mountWithStore(SchemaFieldList, {
        props: { path: [] },
        storeSchema: schema,
      });
      expect(wrapper.text()).toContain(en.propertyOptional);
    },
  );

  it("shows type labels for each property", { timeout: TIMEOUT }, () => {
    const schema: JSONSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        count: { type: "number" },
        active: { type: "boolean" },
      },
    };
    const wrapper = mountWithStore(SchemaFieldList, {
      props: { path: [] },
      storeSchema: schema,
    });
    expect(wrapper.text()).toContain(en.schemaTypeString);
    expect(wrapper.text()).toContain(en.schemaTypeNumber);
    expect(wrapper.text()).toContain(en.schemaTypeBoolean);
  });
});
