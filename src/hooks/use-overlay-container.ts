import { onScopeDispose, ref } from "vue";

/**
 * Creates and manages a shared overlay container at the <body> level with
 * the `.jscb` class, so PrimeVue overlays (teleported via `appendTo`) live
 * at body-level (no clipping) while inheriting all `.jscb`-scoped styles
 * (fonts, colors, design tokens, etc.).
 *
 * Usage:
 *   const { overlayContainer } = useOverlayContainer();
 *   <PSelect :appendTo="overlayContainer" ... />
 */

let sharedContainer: HTMLElement | null = null;
let sharedStyle: HTMLStyleElement | null = null;
let refCount = 0;

function getOrCreateContainer(): HTMLElement {
  if (!sharedContainer) {
    sharedContainer = document.createElement("div");
    sharedContainer.classList.add("jscb");
    sharedContainer.setAttribute("data-jscb-overlay-container", "");
    document.body.appendChild(sharedContainer);

    // Inject a style so the container itself doesn't interfere
    // with page layout but its children (PrimeVue overlays) are interactive
    sharedStyle = document.createElement("style");
    sharedStyle.textContent = [
      "[data-jscb-overlay-container] {",
      "  position: relative;",
      "  width: 0;",
      "  height: 0;",
      "}",
    ].join("\n");
    document.head.appendChild(sharedStyle);
  }
  refCount++;
  return sharedContainer;
}

function releaseContainer(): void {
  refCount--;
  if (refCount <= 0) {
    sharedContainer?.remove();
    sharedContainer = null;
    sharedStyle?.remove();
    sharedStyle = null;
    refCount = 0;
  }
}

export function useOverlayContainer() {
  const container = ref<HTMLElement>(getOrCreateContainer());

  onScopeDispose(() => {
    releaseContainer();
  });

  return {
    /** Pass this to PrimeVue's `appendTo` prop */
    overlayContainer: container,
  };
}
