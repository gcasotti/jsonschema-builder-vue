/**
 * Built-in PrimeVue theme presets for jsonschema-builder-vue.
 *
 * Each preset is extended with a consistent font-family so that
 * PrimeVue overlay components (teleported to <body>) also use the
 * correct sans-serif font stack instead of the browser serif default.
 */
import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";
import Lara from "@primevue/themes/lara";
import Material from "@primevue/themes/material";
import Nora from "@primevue/themes/nora";

export type PresetName = "aura" | "material" | "nora" | "lara";

const fontFamily =
  '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** PrimeVue Aura – the default look (rounded, blue-tinted) */
export const auraPreset = definePreset(Aura, {
  semantic: { fontFamily },
});

/** PrimeVue Material – Material Design 3 style */
export const materialPreset = definePreset(Material, {
  semantic: { fontFamily },
});

/** PrimeVue Nora – minimal / flat / no-frills */
export const noraPreset = definePreset(Nora, {
  semantic: { fontFamily },
});

/** PrimeVue Lara – classic PrimeVue design */
export const laraPreset = definePreset(Lara, {
  semantic: { fontFamily },
});

/** Map of preset name → preset object for runtime switching */
export const presets: Record<PresetName, typeof Aura> = {
  aura: auraPreset,
  material: materialPreset,
  nora: noraPreset,
  lara: laraPreset,
};
