/**
 * Composable for runtime theme switching.
 *
 * Provides reactive state for the active PrimeVue preset and dark-mode,
 * and functions to switch between them at runtime.
 */
import { usePrimeVue } from "primevue/config";
import { ref, watch } from "vue";
import { type PresetName, presets } from "./presets.ts";

const currentPreset = ref<PresetName>("aura");
const darkMode = ref(false);

/**
 * Dark-mode CSS selector used by PrimeVue to scope dark color tokens.
 *
 * PrimeVue applies dark mode CSS at the :root / document.documentElement level,
 * so this selector must match the <html> element. We use a dedicated class
 * (.jscb-dark) to avoid conflicting with other libraries that may use .dark.
 */
const DARK_MODE_SELECTOR = ".jscb-dark";

/**
 * Composable to control the active theme at runtime.
 *
 * Must be called inside a component that is a descendant of `app.use(PrimeVue, …)`.
 */
export function useTheme() {
  const primevue = usePrimeVue();

  /** Switch PrimeVue preset at runtime */
  const switchPreset = (name: PresetName) => {
    currentPreset.value = name;
    const preset = presets[name];
    primevue.config.theme = {
      preset,
      options: {
        ...(primevue.config.theme?.options ?? {}),
        darkModeSelector: DARK_MODE_SELECTOR,
      },
    };
  };

  /** Toggle dark mode */
  const toggleDarkMode = (value?: boolean) => {
    darkMode.value = value ?? !darkMode.value;
    applyDarkMode(darkMode.value);
  };

  /**
   * Apply dark mode:
   * 1. Toggle .jscb-dark on <html> (PrimeVue dark token selector)
   * 2. Toggle .dark on all .jscb containers (for scoped Tailwind utilities)
   * 3. Switch Monaco editor theme (lazy — only loaded if Monaco is available)
   */
  const applyDarkMode = (isDark: boolean) => {
    // PrimeVue dark mode: toggle on <html> so :root matches
    document.documentElement.classList.toggle("jscb-dark", isDark);

    // Also toggle .dark on .jscb containers for any Tailwind dark: utilities
    const els = document.querySelectorAll<HTMLElement>(".jscb");
    for (const el of els) {
      el.classList.toggle("dark", isDark);
    }

    // Also apply to the overlay container
    const overlayContainers = document.querySelectorAll<HTMLElement>(
      "[data-jscb-overlay-container]",
    );
    for (const el of overlayContainers) {
      el.classList.toggle("dark", isDark);
    }

    // Switch Monaco editor theme (dynamic import — no-op if Monaco is not installed)
    import("monaco-editor")
      .then((m) => m.editor.setTheme(isDark ? "vs-dark" : "vs"))
      .catch(() => {
        // Monaco is not available — ignore
      });
  };

  // Sync dark mode on mount
  watch(
    darkMode,
    (isDark) => {
      applyDarkMode(isDark);
    },
    { immediate: true },
  );

  return {
    /** Reactive ref to the active preset name */
    currentPreset,
    /** Reactive ref to dark mode state */
    darkMode,
    /** Switch to a different PrimeVue preset by name */
    switchPreset,
    /** Toggle or set dark mode */
    toggleDarkMode,
    /** Available preset names */
    presetNames: Object.keys(presets) as PresetName[],
  };
}
