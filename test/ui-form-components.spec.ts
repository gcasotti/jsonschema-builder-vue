import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { describe, expect, it } from "vitest";
import InputField from "../src/components/ui/InputField.vue";
import Select from "../src/components/ui/Select.vue";
import Switch from "../src/components/ui/Switch.vue";

const globalPlugins = {
    global: {
        plugins: [PrimeVue],
    },
};

describe("InputField", () => {
    it("renders with placeholder", () => {
        const wrapper = mount(InputField, {
            ...globalPlugins,
            props: { placeholder: "Enter text..." },
        });
        expect(wrapper.find("input").attributes("placeholder")).toBe("Enter text...");
    });

    it("renders with id", () => {
        const wrapper = mount(InputField, {
            ...globalPlugins,
            props: { id: "test-input" },
        });
        expect(wrapper.find("input").attributes("id")).toBe("test-input");
    });

    it("renders as disabled", () => {
        const wrapper = mount(InputField, {
            ...globalPlugins,
            props: { disabled: true },
        });
        expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    });

    it("emits update:modelValue on input", async () => {
        const wrapper = mount(InputField, {
            ...globalPlugins,
            props: { modelValue: "" },
        });
        await wrapper.find("input").setValue("hello");
        expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    });
});

describe("Select", () => {
    const options = [
        { label: "English", value: "en" },
        { label: "German", value: "de" },
        { label: "French", value: "fr" },
    ];

    it("renders the component", () => {
        const wrapper = mount(Select, {
            ...globalPlugins,
            props: { options },
        });
        expect(wrapper.exists()).toBe(true);
    });

    it("renders with placeholder", () => {
        const wrapper = mount(Select, {
            ...globalPlugins,
            props: { options, placeholder: "Choose..." },
        });
        expect(wrapper.exists()).toBe(true);
    });
});

describe("Switch", () => {
    it("renders the component", () => {
        const wrapper = mount(Switch, {
            ...globalPlugins,
            props: { modelValue: false },
        });
        expect(wrapper.exists()).toBe(true);
    });

    it("renders with id", () => {
        const wrapper = mount(Switch, {
            ...globalPlugins,
            props: { id: "my-switch", modelValue: true },
        });
        expect(wrapper.exists()).toBe(true);
    });
});
