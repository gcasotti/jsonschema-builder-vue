import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";
import BooleanEditor from "../src/components/SchemaEditor/types/BooleanEditor.vue";
import NumberEditor from "../src/components/SchemaEditor/types/NumberEditor.vue";
import StringEditor from "../src/components/SchemaEditor/types/StringEditor.vue";
import { en } from "../src/i18n/locales/en.ts";
import { TranslationKey } from "../src/i18n/translation-context.ts";
import type { JSONSchema } from "../src/types/jsonSchema.ts";

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

describe("StringEditor", () => {
  it("renders string constraint fields", () => {
    const schema: JSONSchema = { type: "string" };
    const wrapper = mountWithTranslation(StringEditor, {
      props: { schema },
    });
    expect(wrapper.text()).toContain(en.stringMinimumLengthLabel);
    expect(wrapper.text()).toContain(en.stringMaximumLengthLabel);
  });

  it("renders pattern field", () => {
    const schema: JSONSchema = { type: "string" };
    const wrapper = mountWithTranslation(StringEditor, {
      props: { schema },
    });
    expect(wrapper.text()).toContain(en.stringPatternLabel);
  });

  it("renders format selector", () => {
    const schema: JSONSchema = { type: "string" };
    const wrapper = mountWithTranslation(StringEditor, {
      props: { schema },
    });
    expect(wrapper.text()).toContain(en.stringFormatLabel);
  });

  it("renders enum section", () => {
    const schema: JSONSchema = { type: "string" };
    const wrapper = mountWithTranslation(StringEditor, {
      props: { schema },
    });
    expect(wrapper.text()).toContain(en.stringAllowedValuesEnumLabel);
  });

  it("displays existing enum values", () => {
    const schema: JSONSchema = {
      type: "string",
      enum: ["red", "blue", "green"],
    };
    const wrapper = mountWithTranslation(StringEditor, {
      props: { schema },
    });
    expect(wrapper.text()).toContain("red");
    expect(wrapper.text()).toContain("blue");
    expect(wrapper.text()).toContain("green");
  });

  it("shows no constraint message in read-only mode with no constraints", () => {
    const schema: JSONSchema = { type: "string" };
    const wrapper = mountWithTranslation(StringEditor, {
      props: { schema, readOnly: true },
    });
    expect(wrapper.text()).toContain(en.stringNoConstraint);
  });

  it("emits change on minLength input", async () => {
    const schema: JSONSchema = { type: "string" };
    const wrapper = mountWithTranslation(StringEditor, {
      props: { schema },
    });
    const inputs = wrapper.findAll("input");
    const minLengthInput = inputs[0];
    await minLengthInput.setValue("3");
    expect(wrapper.emitted("change")).toBeTruthy();
  });
});

describe("NumberEditor", () => {
  it("renders number constraint fields", () => {
    const schema: JSONSchema = { type: "number" };
    const wrapper = mountWithTranslation(NumberEditor, {
      props: { schema },
    });
    expect(wrapper.text()).toContain(en.numberMinimumLabel);
    expect(wrapper.text()).toContain(en.numberMaximumLabel);
  });

  it("renders multipleOf field", () => {
    const schema: JSONSchema = { type: "number" };
    const wrapper = mountWithTranslation(NumberEditor, {
      props: { schema },
    });
    expect(wrapper.text()).toContain(en.numberMultipleOfLabel);
  });

  it("renders enum section", () => {
    const schema: JSONSchema = { type: "number" };
    const wrapper = mountWithTranslation(NumberEditor, {
      props: { schema },
    });
    expect(wrapper.text()).toContain(en.numberAllowedValuesEnumLabel);
  });

  it("displays existing number enum values", () => {
    const schema: JSONSchema = { type: "number", enum: [1, 2, 3] };
    const wrapper = mountWithTranslation(NumberEditor, {
      props: { schema },
    });
    expect(wrapper.text()).toContain("1");
    expect(wrapper.text()).toContain("2");
    expect(wrapper.text()).toContain("3");
  });

  it("shows no constraint in read-only with no constraints", () => {
    const schema: JSONSchema = { type: "number" };
    const wrapper = mountWithTranslation(NumberEditor, {
      props: { schema, readOnly: true },
    });
    expect(wrapper.text()).toContain(en.numberNoConstraint);
  });

  it("renders integer mode with step=1", () => {
    const schema: JSONSchema = { type: "integer" };
    const wrapper = mountWithTranslation(NumberEditor, {
      props: { schema, integer: true },
    });
    const inputs = wrapper.findAll("input[type='number']");
    expect(inputs.length).toBeGreaterThan(0);
    expect(inputs[0].attributes("step")).toBe("1");
  });
});

describe("BooleanEditor", () => {
  it("renders allowed value toggles", () => {
    const schema: JSONSchema = { type: "boolean" };
    const wrapper = mountWithTranslation(BooleanEditor, {
      props: { schema },
    });
    expect(wrapper.text()).toContain(en.booleanAllowedValuesLabel);
    expect(wrapper.text()).toContain(en.booleanAllowTrueLabel);
    expect(wrapper.text()).toContain(en.booleanAllowFalseLabel);
  });

  it("shows no constraint in read-only without enum", () => {
    const schema: JSONSchema = { type: "boolean" };
    const wrapper = mountWithTranslation(BooleanEditor, {
      props: { schema, readOnly: true },
    });
    expect(wrapper.text()).toContain(en.booleanNoConstraint);
  });

  it("shows restricted values when enum is set", () => {
    const schema: JSONSchema = { type: "boolean", enum: [true] };
    const wrapper = mountWithTranslation(BooleanEditor, {
      props: { schema },
    });
    expect(wrapper.text()).toContain(en.booleanAllowTrueLabel);
  });
});
