import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";
import Badge from "../src/components/ui/Badge.vue";
import Button from "../src/components/ui/Button.vue";
import ButtonToggle from "../src/components/ui/ButtonToggle.vue";
import Label from "../src/components/ui/Label.vue";

const globalPlugins = {
  global: {
    plugins: [PrimeVue],
  },
};

describe("Badge", () => {
  it("renders slot content", () => {
    const wrapper = mount(Badge, {
      ...globalPlugins,
      slots: { default: "Test Badge" },
    });
    expect(wrapper.text()).toContain("Test Badge");
  });

  it("renders with destructive variant", () => {
    const wrapper = mount(Badge, {
      ...globalPlugins,
      props: { variant: "destructive" },
      slots: { default: "Error" },
    });
    expect(wrapper.text()).toContain("Error");
  });

  it("renders with secondary variant", () => {
    const wrapper = mount(Badge, {
      ...globalPlugins,
      props: { variant: "secondary" },
      slots: { default: "Info" },
    });
    expect(wrapper.text()).toContain("Info");
  });
});

describe("Button", () => {
  it("renders slot content", () => {
    const wrapper = mount(Button, {
      ...globalPlugins,
      slots: { default: "Click Me" },
    });
    expect(wrapper.text()).toContain("Click Me");
  });

  it("emits click event", async () => {
    const wrapper = mount(Button, {
      ...globalPlugins,
      slots: { default: "Click" },
    });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
    expect(wrapper.emitted("click")?.length).toBe(1);
  });

  it("renders as submit button", () => {
    const wrapper = mount(Button, {
      ...globalPlugins,
      props: { type: "submit" },
      slots: { default: "Submit" },
    });
    expect(wrapper.find("button").attributes("type")).toBe("submit");
  });
});

describe("ButtonToggle", () => {
  it("renders slot content", () => {
    const wrapper = mount(ButtonToggle, {
      slots: { default: "Toggle" },
    });
    expect(wrapper.text()).toContain("Toggle");
  });

  it("emits click on press", async () => {
    const wrapper = mount(ButtonToggle, {
      slots: { default: "Toggle" },
    });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
  });

  it("applies custom class", () => {
    const wrapper = mount(ButtonToggle, {
      props: { class: "bg-red-500" },
      slots: { default: "Toggle" },
    });
    expect(wrapper.find("button").classes()).toContain("bg-red-500");
  });
});

describe("Label", () => {
  it("renders slot content", () => {
    const wrapper = mount(Label, {
      slots: { default: "Field Name" },
    });
    expect(wrapper.text()).toContain("Field Name");
  });

  it("renders with for attribute", () => {
    const wrapper = mount(Label, {
      props: { for: "input-id" },
      slots: { default: "Label" },
    });
    expect(wrapper.find("label").attributes("for")).toBe("input-id");
  });

  it("applies custom class", () => {
    const wrapper = mount(Label, {
      props: { class: "text-destructive" },
      slots: { default: "Error" },
    });
    const classes = wrapper.find("label").classes();
    expect(classes).toContain("text-destructive");
  });
});
