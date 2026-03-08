import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";
import SchemaTypeSelector from "../src/components/SchemaEditor/SchemaTypeSelector.vue";
import TypeDropdown from "../src/components/SchemaEditor/TypeDropdown.vue";
import { en } from "../src/i18n/locales/en.ts";
import { TranslationKey } from "../src/i18n/translation-context.ts";

function mountWithTranslation(component: any, options: any = {}) {
  return mount(component, {
    ...options,
    global: {
      ...(options.global || {}),
      plugins: [...(options.global?.plugins || []), PrimeVue],
      provide: {
        ...(options.global?.provide || {}),
        [TranslationKey as symbol]: en,
      },
    },
  });
}

describe("SchemaTypeSelector", () => {
  it("renders all 5 type buttons", () => {
    const wrapper = mountWithTranslation(SchemaTypeSelector, {
      props: { modelValue: "string" },
    });
    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBe(5);
  });

  it("contains text, number, boolean, object, array type labels", () => {
    const wrapper = mountWithTranslation(SchemaTypeSelector, {
      props: { modelValue: "string" },
    });
    const text = wrapper.text();
    expect(text).toContain(en.fieldTypeTextLabel);
    expect(text).toContain(en.fieldTypeNumberLabel);
    expect(text).toContain(en.fieldTypeBooleanLabel);
    expect(text).toContain(en.fieldTypeObjectLabel);
    expect(text).toContain(en.fieldTypeArrayLabel);
  });

  it("emits update:modelValue on click", async () => {
    const wrapper = mountWithTranslation(SchemaTypeSelector, {
      props: { modelValue: "string" },
    });
    const buttons = wrapper.findAll("button");
    // Click the "number" button (second one)
    await buttons[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["number"]);
  });

  it("highlights selected type", () => {
    const wrapper = mountWithTranslation(SchemaTypeSelector, {
      props: { modelValue: "boolean" },
    });
    const buttons = wrapper.findAll("button");
    // The boolean button (3rd) should have the active class
    const boolButton = buttons[2];
    expect(boolButton.classes().some((c) => c.includes("border-primary"))).toBe(
      true,
    );
  });
});

describe("TypeDropdown", () => {
  it("renders with current type label", () => {
    const wrapper = mountWithTranslation(TypeDropdown, {
      props: { modelValue: "string" },
    });
    expect(wrapper.text()).toContain(en.schemaTypeString);
  });

  it("renders readOnly as disabled", () => {
    const wrapper = mountWithTranslation(TypeDropdown, {
      props: { modelValue: "object", readOnly: true },
    });
    expect(wrapper.text()).toContain(en.schemaTypeObject);
    // PrimeVue Select renders with aria-disabled or p-disabled class when disabled
    const selectEl = wrapper.find("[data-pc-name='select']");
    expect(selectEl.exists()).toBe(true);
    // Check that the component is disabled via HTML attribute or PrimeVue class
    expect(
      selectEl.attributes("aria-disabled") === "true" ||
      selectEl.classes().some(c => c.includes("disabled"))
    ).toBe(true);
  });

  it("renders with correct type color classes", () => {
    const wrapper = mountWithTranslation(TypeDropdown, {
      props: { modelValue: "string" },
    });
    // Should contain type color class in the label
    expect(wrapper.html()).toContain("text-blue-500");
  });
});
