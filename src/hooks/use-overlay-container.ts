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
let refCount = 0;

function getOrCreateContainer(): HTMLElement {
    if (!sharedContainer) {
        sharedContainer = document.createElement("div");
        sharedContainer.classList.add("jscb");
        sharedContainer.setAttribute("data-jscb-overlay-container", "");
        // Ensure the container doesn't interfere with page layout
        sharedContainer.style.position = "absolute";
        sharedContainer.style.top = "0";
        sharedContainer.style.left = "0";
        sharedContainer.style.width = "0";
        sharedContainer.style.height = "0";
        sharedContainer.style.overflow = "visible";
        sharedContainer.style.pointerEvents = "none";
        sharedContainer.style.zIndex = "9999";
        document.body.appendChild(sharedContainer);
    }
    refCount++;
    return sharedContainer;
}

function releaseContainer(): void {
    refCount--;
    if (refCount <= 0 && sharedContainer) {
        sharedContainer.remove();
        sharedContainer = null;
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
